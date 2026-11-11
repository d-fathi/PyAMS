/*
 * liveScope - an oscilloscope placed in the schematic, drawn with a <canvas>, for the live simulation.
 *
 * Element (saved in the .dcs file):
 *    <g name="liveScope" class="liveScope" x y width height transform scope='{...json settings...}'>
 *        <foreignObject><canvas></canvas></foreignObject>
 *    </g>
 * Only the settings are saved (attribute "scope"); the curves are live data and are never saved.
 *
 * Data: samples of every signal are kept in ONE shared store (ring buffers), so several scopes can
 * show the same signal. A source (the demo generator now, the Python session later) calls
 *        liveScope.push(t, { "out": 1.2, "R1.I": 0.003, ... })
 *
 * Public API (everything else is private): create, attach, initAll, resize, redraw, push, clear,
 * getConfig, setConfig, openSetup, demo, fmt, parse.
 */
var liveScope = (function () {
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var DIV_X = 10, DIV_Y = 8;                        // divisions of the screen
    var COLORS = ['#ffd400', '#00e5ff', '#ff4d4d', '#7CFC00', '#ff9cf3', '#ffa500'];

    var api = {};
    var states = new WeakMap();                       // element -> { canvas, ctx, dirty, hold, frozen }
    var scopes = [];                                  // elements that are drawn
    var rafId = 0;

    //------------------------------------------------------------------------------------------
    // default settings
    //------------------------------------------------------------------------------------------
    function defaultConfig() {
        return {
            mode: 'YT',                                // 'YT' or 'XY'
            timeDiv: 0.001,                            // s / division
            trigger: { mode: 'auto', source: 0, level: 0, edge: 'rise' },   // auto | normal | single | off
            grid: true,
            labels: true,
            dark: true,
            lineWidth: 1.5,
            channels: [
                { on: true, signal: 'demo.sine', kind: 'demo', color: COLORS[0], vdiv: 1, offset: 0, invert: false }
            ]
        };
    }

    function getConfig(elem) {
        var def = defaultConfig(), c = null;
        try { c = JSON.parse(elem.getAttribute('scope')); } catch (e) { c = null; }
        if (!c || typeof c !== 'object') return def;
        var cfg = Object.assign(def, c);
        cfg.trigger = Object.assign(defaultConfig().trigger, c.trigger || {});
        if (!Array.isArray(cfg.channels)) cfg.channels = def.channels;
        return cfg;
    }

    function setConfig(elem, cfg) {
        elem.setAttribute('scope', JSON.stringify(cfg));
        var st = states.get(elem);
        if (st) { st.frozen = false; st.hold = null; }
        api.redraw(elem);
    }

    //------------------------------------------------------------------------------------------
    // number <-> engineering text (1m, 10u, 2.5k ...)
    //------------------------------------------------------------------------------------------
    var SI = { f: 1e-15, p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9, T: 1e12 };

    api.parse = function (text) {
        var t = String(text == null ? '' : text).trim();
        var m = /^([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([fpnuµmkKMGT]?)/.exec(t);
        if (!m) return NaN;
        var v = parseFloat(m[1]);
        if (m[2]) v *= SI[m[2]];
        return v;
    };

    api.fmt = function (v, unit) {
        unit = unit || '';
        if (!isFinite(v)) return '-';
        if (v === 0) return '0' + unit;
        var a = Math.abs(v);
        var tbl = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'u'], [1e-9, 'n'], [1e-12, 'p']];
        for (var i = 0; i < tbl.length; i++) {
            if (a >= tbl[i][0] * 0.9999) {
                var x = v / tbl[i][0];
                return (Math.round(x * 1000) / 1000) + tbl[i][1] + unit;
            }
        }
        return v.toExponential(2) + unit;
    };

    //------------------------------------------------------------------------------------------
    // shared data store: ring buffers per signal
    //------------------------------------------------------------------------------------------
    var CAPACITY = 60000;                              // samples kept per signal
    var store = {};                                    // name -> Ring
    var lastT = 0;                                     // time of the newest sample

    function Ring(cap) {
        this.cap = cap; this.t = new Float64Array(cap); this.y = new Float64Array(cap);
        this.len = 0; this.start = 0;
    }
    Ring.prototype.push = function (t, y) {
        if (this.len < this.cap) { var i = (this.start + this.len) % this.cap; this.t[i] = t; this.y[i] = y; this.len++; }
        else { this.t[this.start] = t; this.y[this.start] = y; this.start = (this.start + 1) % this.cap; }
    };
    Ring.prototype.T = function (i) { return this.t[(this.start + i) % this.cap]; };
    Ring.prototype.Y = function (i) { return this.y[(this.start + i) % this.cap]; };
    // first index whose time >= t (binary search)
    Ring.prototype.lower = function (t) {
        var lo = 0, hi = this.len;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (this.T(mid) < t) lo = mid + 1; else hi = mid; }
        return lo;
    };

    api.push = function (t, values) {
        for (var k in values) {
            if (!Object.prototype.hasOwnProperty.call(values, k)) continue;
            var v = values[k];
            if (typeof v !== 'number' || !isFinite(v)) continue;
            (store[k] || (store[k] = new Ring(CAPACITY))).push(t, v);
        }
        if (t > lastT) lastT = t;
        markAll();
    };

    api.clear = function () {
        store = {}; lastT = 0;
        scopes.forEach(function (e) { var st = states.get(e); if (st) { st.frozen = false; st.hold = null; } });
        markAll();
    };

    api.signals = function () { return Object.keys(store); };

    //------------------------------------------------------------------------------------------
    // element: create / attach / resize
    //------------------------------------------------------------------------------------------
    function findFO(elem) {
        for (var i = 0; i < elem.childNodes.length; i++)
            if (elem.childNodes[i].nodeName === 'foreignObject') return elem.childNodes[i];
        return null;
    }

    api.create = function (elem) {
        if (!elem.getAttribute('scope')) elem.setAttribute('scope', JSON.stringify(defaultConfig()));
        var fo = document.createElementNS(SVG_NS, 'foreignObject');
        fo.setAttribute('x', 0); fo.setAttribute('y', 0);
        fo.setAttribute('width', elem.getAttribute('width')); fo.setAttribute('height', elem.getAttribute('height'));
        var canvas = document.createElement('canvas');
        canvas.setAttribute('class', 'liveScopeCanvas');
        fo.appendChild(canvas);
        elem.appendChild(fo);
        api.attach(elem);
    };

    // element loaded from a file, pasted or restored by undo: (re)connect it with its canvas
    api.attach = function (elem) {
        if (!elem || !elem.getAttribute || elem.getAttribute('name') !== 'liveScope') return;
        var fo = findFO(elem);
        if (!fo) { api.create(elem); return; }
        var canvas = fo.firstChild;
        if (!canvas || canvas.nodeName.toLowerCase() !== 'canvas') {
            fo.innerHTML = '';
            canvas = document.createElement('canvas');
            canvas.setAttribute('class', 'liveScopeCanvas');
            fo.appendChild(canvas);
        }
        var st = states.get(elem);
        if (!st || st.canvas !== canvas) {
            st = { canvas: canvas, ctx: canvas.getContext('2d'), dirty: true, hold: null, frozen: false, k: 0 };
            states.set(elem, st);
        }
        if (scopes.indexOf(elem) < 0) scopes.push(elem);
        api.resize(elem);
    };

    api.initAll = function (root) {
        // forget elements that are not in the document any more
        scopes = scopes.filter(function (e) { return document.contains(e); });
        var list = (root || document).querySelectorAll ? (root || document).querySelectorAll('[name="liveScope"]') : [];
        for (var i = 0; i < list.length; i++) api.attach(list[i]);
        if (root && root.getAttribute && root.getAttribute('name') === 'liveScope') api.attach(root);
    };

    // size / position of the element (called when it is moved, resized or its properties change)
    api.resize = function (elem) {
        if (!elem || elem.getAttribute('name') !== 'liveScope') return;
        var x = parseInt(elem.getAttribute('x')) || 0, y = parseInt(elem.getAttribute('y')) || 0;
        var w = Math.max(parseFloat(elem.getAttribute('width')) || 0, 60);
        var h = Math.max(parseFloat(elem.getAttribute('height')) || 0, 40);
        elem.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        var fo = findFO(elem);
        if (!fo) return;
        fo.setAttribute('width', w); fo.setAttribute('height', h);
        var st = states.get(elem);
        if (!st) return;
        st.canvas.style.width = w + 'px';
        st.canvas.style.height = h + 'px';
        st.canvas.style.display = 'block';
        st.w = w; st.h = h;
        st.k = 0;                                      // force the bitmap size to be recomputed
        api.redraw(elem);
    };

    // bitmap size of the canvas: one pixel of the bitmap per physical pixel on the screen
    function fitBitmap(st) {
        var r = st.canvas.getBoundingClientRect();
        var k = (r.width > 0 && st.w > 0) ? r.width / st.w : 1;     // screen pixels per user unit (zoom of the page)
        var dpr = window.devicePixelRatio || 1;
        var scale = Math.max(1, Math.min(4, Math.ceil(k * dpr * 10) / 10));
        if (Math.abs(scale - st.k) < 0.01) return;
        st.k = scale;
        st.canvas.width = Math.round(st.w * scale);
        st.canvas.height = Math.round(st.h * scale);
    }

    //------------------------------------------------------------------------------------------
    // drawing loop (only while something changed)
    //------------------------------------------------------------------------------------------
    function markAll() {
        for (var i = 0; i < scopes.length; i++) { var st = states.get(scopes[i]); if (st) st.dirty = true; }
        schedule();
    }

    api.redraw = function (elem) {
        var st = states.get(elem);
        if (st) { st.dirty = true; schedule(); }
    };

    function schedule() {
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function tick() {
        rafId = 0;
        scopes = scopes.filter(function (e) { return document.contains(e); });
        for (var i = 0; i < scopes.length; i++) {
            var st = states.get(scopes[i]);
            if (!st || !st.dirty) continue;
            st.dirty = false;
            try { draw(scopes[i], st); } catch (e) { console.error('liveScope draw', e); }
        }
    }

    //------------------------------------------------------------------------------------------
    // drawing of one scope
    //------------------------------------------------------------------------------------------
    function draw(elem, st) {
        if (!st.w) return;
        fitBitmap(st);
        var cfg = getConfig(elem);
        var ctx = st.ctx, W = st.w, H = st.h;
        ctx.setTransform(st.k, 0, 0, st.k, 0, 0);

        var th = cfg.dark
            ? { bg: '#0d1117', grid: '#233323', axis: '#3d5a3d', text: '#c9d1d9', frame: '#555' }
            : { bg: '#fbfbfb', grid: '#d5dbd5', axis: '#a9b5a9', text: '#333333', frame: '#888' };
        ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);

        // plot rectangle (room for the labels at the bottom)
        var labelH = cfg.labels ? 16 : 0;
        var L = 2, T = 2, PW = W - 4, PH = Math.max(10, H - 4 - labelH);

        // grid
        if (cfg.grid) {
            ctx.lineWidth = 1; ctx.strokeStyle = th.grid; ctx.beginPath();
            for (var i = 0; i <= DIV_X; i++) { var gx = Math.round(L + PW * i / DIV_X) + 0.5; ctx.moveTo(gx, T); ctx.lineTo(gx, T + PH); }
            for (var j = 0; j <= DIV_Y; j++) { var gy = Math.round(T + PH * j / DIV_Y) + 0.5; ctx.moveTo(L, gy); ctx.lineTo(L + PW, gy); }
            ctx.stroke();
            ctx.strokeStyle = th.axis; ctx.beginPath();           // center lines with small ticks
            var cx = Math.round(L + PW / 2) + 0.5, cy = Math.round(T + PH / 2) + 0.5;
            ctx.moveTo(cx, T); ctx.lineTo(cx, T + PH); ctx.moveTo(L, cy); ctx.lineTo(L + PW, cy);
            for (var a = 0; a <= DIV_X * 5; a++) { var tx = L + PW * a / (DIV_X * 5); ctx.moveTo(tx, cy - 2); ctx.lineTo(tx, cy + 2); }
            for (var b = 0; b <= DIV_Y * 5; b++) { var ty = T + PH * b / (DIV_Y * 5); ctx.moveTo(cx - 2, ty); ctx.lineTo(cx + 2, ty); }
            ctx.stroke();
        }
        ctx.strokeStyle = th.frame; ctx.lineWidth = 1; ctx.strokeRect(L + 0.5, T + 0.5, PW - 1, PH - 1);

        // curves
        ctx.save();
        ctx.beginPath(); ctx.rect(L, T, PW, PH); ctx.clip();
        ctx.lineWidth = cfg.lineWidth; ctx.lineJoin = 'round';
        var info = (cfg.mode === 'XY') ? drawXY(ctx, cfg, L, T, PW, PH) : drawYT(ctx, cfg, st, L, T, PW, PH);
        ctx.restore();

        // labels
        if (cfg.labels) {
            ctx.font = '10px Arial'; ctx.textBaseline = 'middle';
            var ly = H - labelH / 2 - 1, lx = 4;
            ctx.fillStyle = th.text;
            var head = (cfg.mode === 'XY') ? 'XY' : api.fmt(cfg.timeDiv, 's') + '/div';
            if (cfg.mode !== 'XY') {
                var trig = cfg.trigger.mode === 'off' ? 'free' : cfg.trigger.mode + (info && info.frozen ? ' (done)' : (info && info.hold ? ' (wait)' : ''));
                head += '  ' + trig;
            }
            ctx.fillText(head, lx, ly); lx += ctx.measureText(head).width + 12;
            cfg.channels.forEach(function (ch, n) {
                if (!ch.on) return;
                var txt = (ch.signal || '?') + ' ' + api.fmt(ch.vdiv, ch.kind === 'current' ? 'A' : 'V') + '/div';
                ctx.fillStyle = ch.color; ctx.fillRect(lx, ly - 4, 8, 8); lx += 11;
                ctx.fillStyle = th.text; ctx.fillText(txt, lx, ly);
                lx += ctx.measureText(txt).width + 10;
            });
        }
        // "no signal" hint
        if (!info || !info.any) {
            ctx.fillStyle = th.text; ctx.globalAlpha = 0.5; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('No signal', L + PW / 2, T + PH / 2);
            ctx.globalAlpha = 1; ctx.textAlign = 'left';
        }
    }

    // y (volts) -> pixel
    function yPix(ch, v, T, PH) {
        var vv = (ch.invert ? -v : v) + (Number(ch.offset) || 0);
        var vdiv = Number(ch.vdiv) || 1;
        return T + PH / 2 - vv / vdiv * (PH / DIV_Y);
    }

    // find the start time of the window that is shown
    function windowStart(cfg, st, W) {
        var tr = cfg.trigger;
        var free = lastT - W;
        if (tr.mode === 'off') return free;
        if (st.frozen && st.hold !== null) return st.hold;

        var src = cfg.channels[Math.min(tr.source, cfg.channels.length - 1)];
        var ring = src && store[src.signal];
        if (ring && ring.len > 1) {
            var level = Number(tr.level) || 0, rise = (tr.edge !== 'fall');
            var tMin = lastT - 4 * W;
            for (var i = ring.len - 1; i > 0; i--) {
                var t1 = ring.T(i);
                if (t1 < tMin) break;
                var y0 = ring.Y(i - 1), y1 = ring.Y(i);
                var hit = rise ? (y0 < level && y1 >= level) : (y0 > level && y1 <= level);
                if (hit && t1 + W <= lastT) {
                    // linear interpolation of the crossing time
                    var t0 = ring.T(i - 1), tc = (y1 === y0) ? t1 : t0 + (level - y0) / (y1 - y0) * (t1 - t0);
                    st.hold = tc;
                    if (tr.mode === 'single') st.frozen = true;
                    return tc;
                }
            }
        }
        // no trigger found
        if (tr.mode === 'auto' || st.hold === null) return (tr.mode === 'auto') ? free : (st.hold === null ? free : st.hold);
        return st.hold;                                    // normal: keep the last triggered picture
    }

    function drawYT(ctx, cfg, st, L, T, PW, PH) {
        var W = cfg.timeDiv * DIV_X;
        var t0 = windowStart(cfg, st, W), t1 = t0 + W;
        var any = false;
        cfg.channels.forEach(function (ch) {
            if (!ch.on) return;
            var ring = store[ch.signal];
            if (!ring || ring.len < 1) return;
            any = true;
            var i0 = Math.max(0, ring.lower(t0) - 1), i1 = Math.min(ring.len - 1, ring.lower(t1));
            var n = i1 - i0 + 1;
            if (n < 1) return;
            ctx.strokeStyle = ch.color; ctx.beginPath();
            var px = function (t) { return L + (t - t0) / W * PW; };
            if (n <= PW * 2) {                              // few points: a simple polyline
                for (var i = i0; i <= i1; i++) {
                    var x = px(ring.T(i)), y = yPix(ch, ring.Y(i), T, PH);
                    if (i === i0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
            } else {                                        // many points: min / max of every pixel column
                var cols = Math.max(1, Math.floor(PW)), mn = new Float64Array(cols).fill(Infinity), mx = new Float64Array(cols).fill(-Infinity);
                for (var k = i0; k <= i1; k++) {
                    var c = Math.floor((ring.T(k) - t0) / W * cols);
                    if (c < 0 || c >= cols) continue;
                    var v = ring.Y(k);
                    if (v < mn[c]) mn[c] = v;
                    if (v > mx[c]) mx[c] = v;
                }
                var first = true;
                for (var c2 = 0; c2 < cols; c2++) {
                    if (mn[c2] === Infinity) continue;
                    var xx = L + (c2 + 0.5) * PW / cols, ya = yPix(ch, mn[c2], T, PH), yb = yPix(ch, mx[c2], T, PH);
                    if (first) { ctx.moveTo(xx, ya); first = false; } else ctx.lineTo(xx, ya);
                    ctx.lineTo(xx, yb);
                }
            }
            ctx.stroke();
        });
        return { any: any, frozen: st.frozen, hold: cfg.trigger.mode === 'normal' && st.hold === null };
    }

    function drawXY(ctx, cfg, L, T, PW, PH) {
        var cx = cfg.channels[0], cy = cfg.channels[1];
        var rx = cx && store[cx.signal], ry = cy && store[cy.signal];
        if (!cx || !cy || !rx || !ry || rx.len < 1 || ry.len < 1) return { any: false };
        var W = cfg.timeDiv * DIV_X;
        var n = Math.min(rx.len, ry.len);
        ctx.strokeStyle = cy.color; ctx.beginPath();
        var first = true;
        for (var i = Math.max(0, rx.lower(lastT - W)); i < n; i++) {
            var vx = (cx.invert ? -rx.Y(i) : rx.Y(i)) + (Number(cx.offset) || 0);
            var x = L + PW / 2 + vx / (Number(cx.vdiv) || 1) * (PW / DIV_X);
            var y = yPix(cy, ry.Y(i), T, PH);
            if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        return { any: true };
    }

    //------------------------------------------------------------------------------------------
    // demo signal source (until the Python session of the live simulation exists)
    //------------------------------------------------------------------------------------------
    var demo = (function () {
        var timer = 0, simT = 0, lastReal = 0, RATE = 0.01, DT = 10e-6;   // circuit seconds per real second (1 ms per 100 ms)
        var rnd = 1;
        function noise() { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647 - 0.5; }
        function step() {
            var now = performance.now(), dt = Math.min(0.25, (now - lastReal) / 1000); lastReal = now;
            var end = simT + dt * RATE;                       // circuit time to produce now
            while (simT < end) {
                simT += DT;
                var s = Math.sin(2 * Math.PI * 1000 * simT);
                var ph = (simT * 1000) % 1;
                api.push(simT, {
                    'demo.sine': 2 * s,
                    'demo.square': ph < 0.5 ? 1 : -1,
                    'demo.triangle': 2 * (ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph),
                    'demo.noisy': 2 * s + 0.4 * noise()
                });
            }
        }
        return {
            signals: ['demo.sine', 'demo.square', 'demo.triangle', 'demo.noisy'],
            isRunning: function () { return !!timer; },
            start: function () { if (timer) return; lastReal = performance.now(); timer = setInterval(step, 30); },
            pause: function () { clearInterval(timer); timer = 0; },
            stop: function () { clearInterval(timer); timer = 0; simT = 0; api.clear(); },
            reset: function () { simT = 0; api.clear(); }
        };
    })();
    api.demo = demo;

    api.openSetup = function (elem) {
        if (typeof scopeDialog === 'undefined') return;
        scopeDialog.open(elem, getConfig(elem), demo.signals, function (cfg) {
            setConfig(elem, cfg);
            try { drawing.saveData('Scope setup'); } catch (e) {}
        });
    };
    api.getConfig = getConfig;
    api.defaultChannelColor = function (n) { return COLORS[n % COLORS.length]; };

    // redraw when the window / zoom changes (the bitmap follows the physical size)
    window.addEventListener('resize', markAll);

    return api;
})();

//------------------------------------------------------------------------------------------
// functions used by the rest of the editor (same names as the other elements)
//------------------------------------------------------------------------------------------
function addLiveScope(elem) { liveScope.create(elem); }
function modifedSizeLiveScope(elem) { if (elem && elem.getAttribute && elem.getAttribute('name') === 'liveScope') liveScope.resize(elem); }

// properties panel of the element
function liveScopeSelect() {
    defaultData = {
        header: { title: "Live scope", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "Width  (px)", type: "number", value: parseInt(mtable.select.getAttribute("width")) },
                    { label: "Height (px)", type: "number", value: parseInt(mtable.select.getAttribute("height")) },
                    { label: "Scope setup", type: "Button", value: 'Setup', setClick: 'openScopeSetup' }
                ]
            }
        ]
    };
    mtable.type = "liveScope";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedLiveScope() {
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[0].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[1].value);
    mtable.select.setAttribute("width", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("height", propertiesData.sections[0].rows[3].value);
    modifedSizeLiveScope(mtable.select);
    deleteEllipseMS(mtable.resize);
    mtable.resize.updateSlect();
}
