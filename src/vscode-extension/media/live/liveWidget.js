/*
#------------------------------------------------------------------------------------------------
# Name:        liveWidget.js
# Purpose:     Live widgets drawn in the symbol editor (.sym): LED, 7-segment, Switch,
#              Push button and Slider.  One element ("liveWidget"), one toolbar button; the
#              kind of widget and all its settings are chosen in the properties panel.
#              Every widget has a unique `ref` (the key used later to bind it to the Python
#              model during the live simulation).
# Stage 3a:    drawing, properties, ref, saving.  No interaction and no Python link yet.
# Copyright:   (c) PyAMS 2026
# Licence:     free
#-------------------------------------------------------------------------------------------------
*/

var liveWidget = (function () {
    var NS = 'http://www.w3.org/2000/svg';

    var TYPES = {
        led:     { title: 'LED',         prefix: 'led', w: 30,  h: 30 },
        segment: { title: '7-Segment',   prefix: 'seg', w: 30,  h: 50 },
        switch:  { title: 'Switch',      prefix: 'sw',  w: 50,  h: 30 },
        button:  { title: 'Push button', prefix: 'btn', w: 40,  h: 40 },
        slider:  { title: 'Slider',      prefix: 'sl',  w: 120, h: 30 }
    };
    var ORDER = ['led', 'segment', 'switch', 'button', 'slider'];
    var LABEL_H = 12;

    function defaultCfg(type) {
        switch (type) {
            case 'led':     return { label: '', shape: 'circle', onColor: '#22c55e', offColor: '#3b4350', threshold: 0.5, value: 1 };
            case 'segment': return { label: '', digits: 1, dp: false, color: '#ef4444', offColor: '#3a1c1c', value: 8 };
            case 'switch':  return { label: '', onValue: 1, offValue: 0, on: false, color: '#22c55e' };
            case 'button':  return { label: '', pressValue: 1, releaseValue: 0, color: '#3b82f6' };
            case 'slider':  return { label: '', min: 0, max: 1, step: 0.01, value: 0.5, vertical: false, color: '#3b82f6' };
        }
        return { label: '' };
    }

    function getType(g) { var t = g.getAttribute('wtype'); return TYPES[t] ? t : 'led'; }
    function getCfg(g) {
        var t = getType(g), c = null;
        try { c = JSON.parse(g.getAttribute('wcfg')); } catch (e) {}
        return Object.assign(defaultCfg(t), c || {});
    }
    function setCfg(g, cfg) { g.setAttribute('wcfg', JSON.stringify(cfg)); }

    function mk(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }

    // ---------------------------------------------------------------- refs
    function cleanRef(s) {
        s = String(s || '').trim().replace(/[^A-Za-z0-9_]/g, '_');
        if (!s) return '';
        if (/^[0-9]/.test(s)) s = '_' + s;
        return s;
    }
    function allRefs(except) {
        var out = [], els = document.querySelectorAll('[name="liveWidget"]');
        for (var i = 0; i < els.length; i++) if (els[i] !== except) out.push(els[i].getAttribute('wref'));
        return out;
    }
    function uniqueRef(base, except) {
        var used = allRefs(except), r = base, n = 1;
        if (used.indexOf(r) < 0) return r;
        var m = /^(.*?)(\d+)$/.exec(base), stem = m ? m[1] : base;
        n = m ? parseInt(m[2]) + 1 : 1;
        while (used.indexOf(stem + n) >= 0) n++;
        return stem + n;
    }
    function newRef(type, except) { return uniqueRef(TYPES[type].prefix + '1', except); }
    function isAutoRef(ref) {
        return ORDER.some(function (t) { return new RegExp('^' + TYPES[t].prefix + '\\d+$').test(ref); });
    }

    // ---------------------------------------------------------------- drawing
    var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };

    function drawLed(p, w, h, c) {
        var on = num(c.value, 0) >= num(c.threshold, 0.5);
        var col = on ? c.onColor : c.offColor;
        var s = Math.max(4, Math.min(w, h)), cx = w / 2, cy = h / 2;
        if (c.shape === 'square') {
            if (on) mk('rect', { x: cx - s / 2 - 2, y: cy - s / 2 - 2, width: s + 4, height: s + 4, rx: 4, fill: col, opacity: 0.25 }, p);
            mk('rect', { x: cx - s / 2 + 2, y: cy - s / 2 + 2, width: s - 4, height: s - 4, rx: 3, fill: col, stroke: '#111827', 'stroke-width': 1.5 }, p);
        } else {
            if (on) mk('circle', { cx: cx, cy: cy, r: s / 2, fill: col, opacity: 0.25 }, p);
            mk('circle', { cx: cx, cy: cy, r: Math.max(2, s / 2 - 3), fill: col, stroke: '#111827', 'stroke-width': 1.5 }, p);
        }
        mk('ellipse', { cx: cx - s * 0.12, cy: cy - s * 0.14, rx: s * 0.12, ry: s * 0.08, fill: '#ffffff', opacity: on ? 0.55 : 0.2 }, p);
    }

    function drawSegment(p, w, h, c) {
        var n = Math.max(1, Math.min(8, parseInt(c.digits) || 1));
        mk('rect', { x: 0, y: 0, width: w, height: h, rx: 3, fill: '#0b0f14', stroke: '#1f2937' }, p);
        var v = Math.max(0, Math.round(Math.abs(num(c.value, 0))));
        var str = String(v); while (str.length < n) str = '0' + str; str = str.slice(-n);
        var dw = w / n;
        for (var i = 0; i < n; i++) {
            var x0 = i * dw, t = Math.max(1.5, Math.min(dw, h) * 0.13), pad = t * 0.9 + 1, gap = t * 0.7;
            var dpW = c.dp ? t * 1.6 : 0;
            var xl = x0 + pad + t / 2, xr = x0 + dw - pad - t / 2 - dpW, yt = pad + t / 2, yb = h - pad - t / 2, ym = h / 2;
            var segs = {
                a: [xl + gap, yt, xr - gap, yt], b: [xr, yt + gap, xr, ym - gap / 2], c: [xr, ym + gap / 2, xr, yb - gap],
                d: [xl + gap, yb, xr - gap, yb], e: [xl, ym + gap / 2, xl, yb - gap], f: [xl, yt + gap, xl, ym - gap / 2],
                g: [xl + gap, ym, xr - gap, ym]
            };
            var lit = SEG[str.charAt(i)] || '';
            for (var k in segs) {
                var s = segs[k];
                mk('line', { x1: s[0], y1: s[1], x2: s[2], y2: s[3], stroke: lit.indexOf(k) >= 0 ? c.color : c.offColor,
                             'stroke-width': t, 'stroke-linecap': 'round' }, p);
            }
            if (c.dp) mk('circle', { cx: x0 + dw - pad - t / 2, cy: yb, r: t * 0.6, fill: c.offColor }, p);
        }
    }

    function drawSwitch(p, w, h, c) {
        var tw = Math.max(10, Math.min(w - 2, (h - 2) * 1.8)), th = Math.max(6, Math.min(h - 2, tw / 1.8));
        var x = (w - tw) / 2, y = (h - th) / 2, on = !!c.on;
        mk('rect', { x: x, y: y, width: tw, height: th, rx: th / 2, fill: on ? c.color : '#4b5563', stroke: '#111827', 'stroke-width': 1.2 }, p);
        mk('circle', { cx: on ? x + tw - th / 2 : x + th / 2, cy: y + th / 2, r: th / 2 - 2.5, fill: '#f3f4f6', stroke: '#374151', 'stroke-width': 1 }, p);
    }

    function drawButton(p, w, h, c) {
        var s = Math.max(8, Math.min(w, h)), cx = w / 2, cy = h / 2;
        mk('rect', { x: cx - s / 2 + 1, y: cy - s / 2 + 1, width: s - 2, height: s - 2, rx: 6, fill: '#374151', stroke: '#111827', 'stroke-width': 1.2 }, p);
        mk('circle', { cx: cx, cy: cy, r: Math.max(3, s / 2 - 6), fill: c.color, stroke: '#111827', 'stroke-width': 1.2 }, p);
        mk('ellipse', { cx: cx - s * 0.08, cy: cy - s * 0.1, rx: s * 0.1, ry: s * 0.06, fill: '#ffffff', opacity: 0.35 }, p);
    }

    function drawSlider(p, w, h, c) {
        var mn = num(c.min, 0), mx = num(c.max, 1); if (mx === mn) mx = mn + 1;
        var f = Math.max(0, Math.min(1, (num(c.value, mn) - mn) / (mx - mn)));
        var kr = Math.max(4, Math.min(w, h) * 0.28), pad = kr + 1;
        if (c.vertical) {
            var x = w / 2, y1 = pad, y2 = h - pad, yk = y2 - f * (y2 - y1);
            mk('line', { x1: x, y1: y1, x2: x, y2: y2, stroke: '#4b5563', 'stroke-width': 4, 'stroke-linecap': 'round' }, p);
            mk('line', { x1: x, y1: y2, x2: x, y2: yk, stroke: c.color, 'stroke-width': 4, 'stroke-linecap': 'round' }, p);
            mk('circle', { cx: x, cy: yk, r: kr, fill: '#f3f4f6', stroke: '#374151', 'stroke-width': 1.2 }, p);
        } else {
            var y = h / 2, x1 = pad, x2 = w - pad, xk = x1 + f * (x2 - x1);
            mk('line', { x1: x1, y1: y, x2: x2, y2: y, stroke: '#4b5563', 'stroke-width': 4, 'stroke-linecap': 'round' }, p);
            mk('line', { x1: x1, y1: y, x2: xk, y2: y, stroke: c.color, 'stroke-width': 4, 'stroke-linecap': 'round' }, p);
            mk('circle', { cx: xk, cy: y, r: kr, fill: '#f3f4f6', stroke: '#374151', 'stroke-width': 1.2 }, p);
        }
    }

    // (re)build the content of the element
    function redraw(g) {
        if (!g) return;
        var x = num(g.getAttribute('x'), 0), y = num(g.getAttribute('y'), 0);
        var w = Math.max(10, num(g.getAttribute('width'), 30)), h = Math.max(10, num(g.getAttribute('height'), 30));
        g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        while (g.firstChild) g.removeChild(g.firstChild);
        var type = getType(g), c = getCfg(g);
        // transparent hit area / thin frame (helps to see the extent while editing)
        mk('rect', { x: 0, y: 0, width: w, height: h, fill: 'transparent', stroke: 'none' }, g);
        var lab = String(c.label || ''), ah = lab ? Math.max(10, h - LABEL_H) : h;
        var body = mk('g', { 'pointer-events': 'none' }, g);
        var fn = { led: drawLed, segment: drawSegment, switch: drawSwitch, button: drawButton, slider: drawSlider }[type];
        fn(body, w, ah, c);
        if (lab) {
            var t = mk('text', { x: w / 2, y: h - 2, 'text-anchor': 'middle', 'font-size': 10, 'font-family': 'Arial, sans-serif', fill: '#9ca3af' }, body);
            t.textContent = lab;
        }
    }

    function create(g, type) {
        type = TYPES[type] ? type : 'led';
        g.setAttribute('wtype', type);
        g.setAttribute('width', TYPES[type].w);
        g.setAttribute('height', TYPES[type].h);
        g.setAttribute('wref', newRef(type, g));
        setCfg(g, defaultCfg(type));
        redraw(g);
    }

    return { TYPES: TYPES, ORDER: ORDER, defaultCfg: defaultCfg, getType: getType, getCfg: getCfg, setCfg: setCfg,
             redraw: redraw, create: create, cleanRef: cleanRef, uniqueRef: uniqueRef, newRef: newRef, isAutoRef: isAutoRef };
})();

// functions used by the rest of the editor (same names as the other elements)
function addLiveWidget(elem) { liveWidget.create(elem, 'led'); }
function modifedSizeLiveWidget(elem) { if (elem && elem.getAttribute && elem.getAttribute('name') === 'liveWidget') liveWidget.redraw(elem); }

// ---------------------------------------------------------------------------------------------
// properties panel
//   section 0  Basic Properties : Pos.x, Pos.y, Width, Height
//   section 1  Widget           : Type, Ref, Label
//   section 2  type settings    : depends on the type (see below)
// ---------------------------------------------------------------------------------------------
function liveWidgetSelect() {
    var el = mtable.select, W = liveWidget;
    var type = W.getType(el), c = W.getCfg(el);
    var yn = function (b) { return b ? 'Yes' : 'No'; };

    var rows = [];
    switch (type) {
        case 'led':
            rows = [
                { label: 'Shape', type: 'dropdown', options: ['Circle', 'Square'], value: c.shape === 'square' ? 'Square' : 'Circle' },
                { label: 'On color', type: 'color', value: c.onColor, color: c.onColor },
                { label: 'Off color', type: 'color', value: c.offColor, color: c.offColor },
                { label: 'Threshold', type: 'number', value: c.threshold },
                { label: 'Preview value', type: 'number', value: c.value }
            ]; break;
        case 'segment':
            rows = [
                { label: 'Digits', type: 'number', value: c.digits },
                { label: 'Decimal point', type: 'dropdown', options: ['No', 'Yes'], value: yn(c.dp) },
                { label: 'On color', type: 'color', value: c.color, color: c.color },
                { label: 'Off color', type: 'color', value: c.offColor, color: c.offColor },
                { label: 'Preview value', type: 'number', value: c.value }
            ]; break;
        case 'switch':
            rows = [
                { label: 'On value', type: 'number', value: c.onValue },
                { label: 'Off value', type: 'number', value: c.offValue },
                { label: 'Initial state', type: 'dropdown', options: ['Off', 'On'], value: c.on ? 'On' : 'Off' },
                { label: 'On color', type: 'color', value: c.color, color: c.color }
            ]; break;
        case 'button':
            rows = [
                { label: 'Pressed value', type: 'number', value: c.pressValue },
                { label: 'Released value', type: 'number', value: c.releaseValue },
                { label: 'Color', type: 'color', value: c.color, color: c.color }
            ]; break;
        case 'slider':
            rows = [
                { label: 'Min', type: 'number', value: c.min },
                { label: 'Max', type: 'number', value: c.max },
                { label: 'Step', type: 'number', value: c.step },
                { label: 'Initial value', type: 'number', value: c.value },
                { label: 'Orientation', type: 'dropdown', options: ['Horizontal', 'Vertical'], value: c.vertical ? 'Vertical' : 'Horizontal' },
                { label: 'Color', type: 'color', value: c.color, color: c.color }
            ]; break;
    }

    var sections = [
        { title: 'Basic Properties', collapsed: false, showReset: true, rows: [
            { label: 'Pos.x', type: 'number', value: parseInt(el.getAttribute('x')) },
            { label: 'Pos.y', type: 'number', value: parseInt(el.getAttribute('y')) },
            { label: 'Width  (px)', type: 'number', value: parseInt(el.getAttribute('width')) },
            { label: 'Height (px)', type: 'number', value: parseInt(el.getAttribute('height')) }
        ] },
        { title: 'Widget', collapsed: false, showReset: true, rows: [
            { label: 'Type', type: 'dropdown', options: W.ORDER.map(function (t) { return W.TYPES[t].title; }), value: W.TYPES[type].title },
            { label: 'Ref', type: 'text', value: el.getAttribute('wref') || '' },
            { label: 'Label', type: 'text', value: c.label || '' }
        ] },
        { title: W.TYPES[type].title + ' settings', collapsed: false, showReset: true, rows: rows }
    ];

    sections.forEach(function (sec) {
        sec.collapseKey = 'lw.' + sec.title.split(' ')[0];
        if (typeof propSectionState !== 'undefined' && typeof propSectionState[sec.collapseKey] === 'boolean')
            sec.collapsed = propSectionState[sec.collapseKey];
    });

    defaultData = { header: { title: 'Live widget', subtitle: W.TYPES[type].title + '  ·  ' + (el.getAttribute('wref') || '') }, sections: sections };
    mtable.type = 'liveWidget';
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedLiveWidget() {
    var el = mtable.select, W = liveWidget, P = propertiesData.sections;
    var oldType = W.getType(el), c = W.getCfg(el);
    var f = function (v, d) { v = parseFloat(v); return isFinite(v) ? v : d; };

    // basic
    el.setAttribute('x', P[0].rows[0].value);
    el.setAttribute('y', P[0].rows[1].value);
    var w = f(P[0].rows[2].value, 30), h = f(P[0].rows[3].value, 30);
    el.setAttribute('width', Math.max(10, w));
    el.setAttribute('height', Math.max(10, h));

    // widget: type / ref / label
    var newType = oldType;
    W.ORDER.forEach(function (t) { if (W.TYPES[t].title === P[1].rows[0].value) newType = t; });
    var ref = W.cleanRef(P[1].rows[1].value);
    var rebuild = false;

    if (newType !== oldType) {
        // new kind of widget: its own defaults, default size, and a new automatic ref
        var keepLabel = c.label;
        el.setAttribute('wtype', newType);
        c = W.defaultCfg(newType); c.label = keepLabel;
        el.setAttribute('width', W.TYPES[newType].w);
        el.setAttribute('height', W.TYPES[newType].h);
        var cur = el.getAttribute('wref') || '';
        if (!cur || W.isAutoRef(cur)) ref = W.newRef(newType, el); else ref = W.uniqueRef(cur, el);
        rebuild = true;
    } else {
        c.label = P[1].rows[2].value;
        var R = P[2].rows;
        switch (oldType) {
            case 'led':
                c.shape = R[0].value === 'Square' ? 'square' : 'circle';
                c.onColor = R[1].value; c.offColor = R[2].value;
                c.threshold = f(R[3].value, 0.5); c.value = f(R[4].value, 0);
                break;
            case 'segment': {
                var n = Math.max(1, Math.min(8, Math.round(f(R[0].value, 1))));
                if (n !== c.digits) { el.setAttribute('width', W.TYPES.segment.w * n); rebuild = true; }
                c.digits = n; c.dp = R[1].value === 'Yes';
                c.color = R[2].value; c.offColor = R[3].value; c.value = f(R[4].value, 0);
                break; }
            case 'switch':
                c.onValue = f(R[0].value, 1); c.offValue = f(R[1].value, 0);
                c.on = R[2].value === 'On'; c.color = R[3].value;
                break;
            case 'button':
                c.pressValue = f(R[0].value, 1); c.releaseValue = f(R[1].value, 0); c.color = R[2].value;
                break;
            case 'slider': {
                c.min = f(R[0].value, 0); c.max = f(R[1].value, 1);
                if (c.max <= c.min) c.max = c.min + 1;
                c.step = Math.max(1e-9, f(R[2].value, 0.01));
                c.value = Math.min(c.max, Math.max(c.min, f(R[3].value, c.min)));
                var vert = R[4].value === 'Vertical';
                if (vert !== !!c.vertical) {            // orientation changed: swap the box
                    var ow = el.getAttribute('width'), oh = el.getAttribute('height');
                    el.setAttribute('width', oh); el.setAttribute('height', ow); rebuild = true;
                }
                c.vertical = vert; c.color = R[5].value;
                break; }
        }
        // ref must be a valid, unique name
        if (!ref) ref = el.getAttribute('wref') || W.newRef(newType, el);
        var u = W.uniqueRef(ref, el);
        if (u !== ref) { ref = u; rebuild = true; }
        if (ref !== P[1].rows[1].value) rebuild = true;
    }

    el.setAttribute('wref', ref);
    W.setCfg(el, c);
    W.redraw(el);
    deleteEllipseMS(mtable.resize);
    mtable.resize.updateSlect();

    if (rebuild) liveWidgetSelect();
}
