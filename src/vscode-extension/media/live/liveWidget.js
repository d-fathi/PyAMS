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
        slider:  { title: 'Slider',      prefix: 'sl',  w: 120, h: 30 },
        spst:    { title: 'SPST switch', prefix: 'spst', w: 70, h: 30 },
        spdt:    { title: 'SPDT switch', prefix: 'spdt', w: 70, h: 46 },
        pushsw:  { title: 'Push switch', prefix: 'psw', w: 60,  h: 30 },
        polyseg: { title: 'Polygon segment', prefix: 'pseg', w: 40, h: 12 },    // becomes an editable polygon
        gauge:   { title: 'Gauge',       prefix: 'gau', w: 80,  h: 56 },
        bar:     { title: 'Bar',         prefix: 'bar', w: 26,  h: 70 },
        value:   { title: 'Value display', prefix: 'val', w: 80, h: 28 },
        knob:    { title: 'Rotary knob', prefix: 'knob', w: 50, h: 50 }
    };
    var ORDER = ['led', 'segment', 'switch', 'button', 'slider', 'spst', 'spdt', 'pushsw', 'polyseg', 'gauge', 'bar', 'value', 'knob'];
    var TOGGLE = { 'switch': 1, spst: 1, spdt: 1 };     // keep their position (state `on`)
    var MOMENTARY = { button: 1, pushsw: 1 };           // active only while pressed
    var LABEL_H = 12;

    function defaultCfg(type) {
        switch (type) {
            case 'led':     return { label: '', scale: 1, offset: 0, activeLow: false, shape: 'circle', onColor: '#22c55e', offColor: '#3b4350', threshold: 0.5, value: 1 };
            case 'segment': return { label: '', scale: 1, offset: 0, format: 'dec', digits: 1, dp: false, color: '#ef4444', offColor: '#3a1c1c', value: 8 };
            case 'switch':  return { label: '', onValue: 1, offValue: 0, on: false, color: '#22c55e' };
            case 'button':  return { label: '', pressValue: 1, releaseValue: 0, color: '#3b82f6' };
            case 'spst':    return { label: '', onValue: 1, offValue: 0, on: false, color: '#8b95a5', accent: '#22c55e' };
            case 'spdt':    return { label: '', onValue: 1, offValue: 0, on: true,  color: '#8b95a5', accent: '#22c55e' };   // on = upper position
            case 'polyseg': return { onColor: '#ef4444', offColor: '#3a1c1c', threshold: 0.5, activeLow: false, value: 1, scale: 1, offset: 0 };
            case 'pushsw':  return { label: '', pressValue: 1, releaseValue: 0, color: '#8b95a5', accent: '#22c55e' };
            case 'gauge':   return { label: '', min: 0, max: 5, value: 2.5, color: '#22c55e', needleColor: '#1f2937', decimals: 1, unit: 'V', showValue: true, scale: 1, offset: 0 };
            case 'bar':     return { label: '', min: 0, max: 5, value: 2.5, color: '#3b82f6', vertical: true, showValue: false, decimals: 1, unit: '', scale: 1, offset: 0 };
            case 'value':   return { label: '', value: 1.234, decimals: 3, unit: 'V', color: '#22c55e', bg: '#0b0f14', scale: 1, offset: 0 };
            case 'knob':    return { label: '', min: 0, max: 10, step: 0.1, value: 5, color: '#3b82f6' };
            case 'slider':  return { label: '', min: 0, max: 1, step: 0.01, value: 0.5, vertical: false, color: '#3b82f6' };
        }
        return { label: '' };
    }

    function isPoly(g) { return !!(g && g.tagName && g.tagName.toLowerCase() === 'polygon'); }
    function getType(g) {
        if (isPoly(g)) return 'polyseg';                  // a polygon marked as a live segment
        var t = g.getAttribute('wtype'); return TYPES[t] ? t : 'led';
    }
    var SEL = '[name="liveWidget"], polygon[wlive]';
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
        var out = [], els = document.querySelectorAll(SEL);
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
    // is a LED / polygon segment lit?  High: value >= threshold;  Low: value < threshold (0 = on, 1 = off)
    function isLit(c, v) { var t = num(c.threshold, 0.5); return c.activeLow ? num(v, 0) < t : num(v, 0) >= t; }
    var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', A: 'abcefg', B: 'cdefg', C: 'adef', D: 'bcdeg', E: 'adefg', F: 'aefg' };

    function drawLed(p, w, h, c) {
        var on = isLit(c, c.value);
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
        var str;
        if (c.format === 'hex') {                              // 0..15 -> 0-9 A-F ; out of range -> blank
            var iv = Math.round(num(c.value, 0));
            str = (iv < 0 || iv >= Math.pow(16, n)) ? null : iv.toString(16).toUpperCase();
        } else {
            var v = Math.max(0, Math.round(Math.abs(num(c.value, 0))));
            str = String(v);
        }
        if (str !== null) { while (str.length < n) str = '0' + str; str = str.slice(-n); }
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
            var lit = (str === null) ? '' : (SEG[str.charAt(i)] || '');
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
        mk('circle', { cx: cx, cy: cy + (c.pressed ? 1 : 0), r: Math.max(3, s / 2 - (c.pressed ? 8 : 6)), fill: c.color, stroke: '#111827', 'stroke-width': 1.2 }, p);
        if (c.pressed) mk('circle', { cx: cx, cy: cy + 1, r: Math.max(3, s / 2 - 8), fill: '#000000', opacity: 0.25 }, p);
        else mk('ellipse', { cx: cx - s * 0.08, cy: cy - s * 0.1, rx: s * 0.1, ry: s * 0.06, fill: '#ffffff', opacity: 0.35 }, p);
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

    var VALUE_TYPES = { led: 1, segment: 1, slider: 1, polyseg: 1, gauge: 1, bar: 1, value: 1, knob: 1 };

    // ---- gauge, bar, value display, rotary knob -------------------------------------------------
    function frac(c, v) {
        var mn = num(c.min, 0), mx = num(c.max, 1); if (mx === mn) mx = mn + 1;
        return Math.max(0, Math.min(1, (num(v, mn) - mn) / (mx - mn)));
    }
    function fmtVal(c, v) {
        var d = Math.max(0, Math.min(6, parseInt(c.decimals) || 0)), u = String(c.unit || '');
        return num(v, 0).toFixed(d) + (u ? ' ' + u : '');
    }
    function pol(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    function arc(p, cx, cy, r, a0, a1, col, sw) {              // clockwise arc from angle a0 to a1 (degrees, screen)
        if (a1 - a0 < 0.01) return;
        var P0 = pol(cx, cy, r, a0), P1 = pol(cx, cy, r, a1);
        mk('path', { d: 'M' + P0[0] + ' ' + P0[1] + ' A' + r + ' ' + r + ' 0 ' + ((a1 - a0) > 180 ? 1 : 0) + ' 1 ' + P1[0] + ' ' + P1[1],
                     fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-linecap': 'round' }, p);
    }

    function drawGauge(p, w, h, c) {
        var f = frac(c, c.value), txt = c.showValue !== false, th = txt ? Math.max(9, Math.min(14, h * 0.24)) : 0;
        var r = Math.max(8, Math.min(w / 2 - 6, h - th - 10)), cx = w / 2, cy = h - th - 5, sw = Math.max(4, r * 0.18);
        arc(p, cx, cy, r, 180, 360, '#374151', sw);
        arc(p, cx, cy, r, 180, 180 + f * 180, c.color, sw);
        for (var i = 0; i <= 4; i++) {                          // ticks
            var A = pol(cx, cy, r + sw / 2 + 1, 180 + i * 45), B = pol(cx, cy, r + sw / 2 + 3.5, 180 + i * 45);
            mk('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: '#6b7280', 'stroke-width': 1 }, p);
        }
        var N = pol(cx, cy, r - sw / 2 - 2, 180 + f * 180);
        mk('line', { x1: cx, y1: cy, x2: N[0], y2: N[1], stroke: c.needleColor, 'stroke-width': Math.max(1.6, r * 0.07), 'stroke-linecap': 'round' }, p);
        mk('circle', { cx: cx, cy: cy, r: Math.max(2.5, r * 0.1), fill: c.needleColor, stroke: '#111827' }, p);
        if (txt) {
            var t = mk('text', { x: cx, y: h - 2, 'text-anchor': 'middle', 'font-size': th, 'font-family': 'Consolas, monospace', fill: '#4b5563' }, p);
            t.textContent = fmtVal(c, c.value);
        }
    }

    function drawBar(p, w, h, c) {
        var f = frac(c, c.value), pad = 2;
        mk('rect', { x: pad, y: pad, width: w - 2 * pad, height: h - 2 * pad, rx: 3, fill: '#1f2937', stroke: '#111827', 'stroke-width': 1.2 }, p);
        var iw = w - 2 * pad - 3, ih = h - 2 * pad - 3;
        if (c.vertical !== false) { if (f > 0) mk('rect', { x: pad + 1.5, y: pad + 1.5 + ih * (1 - f), width: iw, height: ih * f, rx: 2, fill: c.color }, p); }
        else if (f > 0) mk('rect', { x: pad + 1.5, y: pad + 1.5, width: iw * f, height: ih, rx: 2, fill: c.color }, p);
        if (c.showValue) {
            var vs = fmtVal(c, c.value), fs = Math.max(6, Math.min(12, (w - 6) / Math.max(2, vs.length) / 0.6, h * 0.45));
            var t = mk('text', { x: w / 2, y: h / 2 + fs * 0.35, 'text-anchor': 'middle', 'font-size': fs, 'font-family': 'Consolas, monospace', fill: '#f3f4f6', stroke: '#111827', 'stroke-width': 0.4 }, p);
            t.textContent = vs;
        }
    }

    function drawValue(p, w, h, c) {
        mk('rect', { x: 0.5, y: 0.5, width: w - 1, height: h - 1, rx: 3, fill: c.bg, stroke: '#1f2937' }, p);
        var s = fmtVal(c, c.value), fs = Math.max(8, Math.min(h * 0.62, (w - 8) / Math.max(3, s.length) / 0.6));
        var t = mk('text', { x: w - 5, y: h / 2 + fs * 0.35, 'text-anchor': 'end', 'font-size': fs, 'font-family': 'Consolas, monospace', fill: c.color }, p);
        t.textContent = s;
    }

    function drawKnob(p, w, h, c) {
        var f = frac(c, c.value), s = Math.min(w, h), cx = w / 2, cy = h / 2, r = Math.max(8, s / 2 - 2), sw = Math.max(2.5, r * 0.14);
        arc(p, cx, cy, r - sw / 2, 135, 405, '#374151', sw);
        arc(p, cx, cy, r - sw / 2, 135, 135 + f * 270, c.color, sw);
        var rb = r - sw - 2;
        mk('circle', { cx: cx, cy: cy, r: rb, fill: '#4b5563', stroke: '#111827', 'stroke-width': 1.2 }, p);
        mk('ellipse', { cx: cx - rb * 0.25, cy: cy - rb * 0.3, rx: rb * 0.35, ry: rb * 0.18, fill: '#ffffff', opacity: 0.12 }, p);
        var A = pol(cx, cy, rb * 0.25, 135 + f * 270), B = pol(cx, cy, rb * 0.9, 135 + f * 270);
        mk('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: '#f3f4f6', 'stroke-width': Math.max(2, rb * 0.16), 'stroke-linecap': 'round' }, p);
    }

    // values of the live simulation (runtime only, never saved): {v, on, pressed}
    function applyRT(type, c, rt) {
        var o = Object.assign({}, c);
        if (VALUE_TYPES[type]) o.value = rt.v;
        else if (TOGGLE[type]) o.on = !!rt.on;
        else if (MOMENTARY[type]) o.pressed = !!rt.pressed;
        return o;
    }

    // ---- schematic switches: terminals, blade, contacts ------------------------------------------
    function terminal(p, x, y, r, col) {                  // a filled terminal with a light ring
        mk('circle', { cx: x, cy: y, r: r + 1.2, fill: '#ffffff', opacity: 0.35 }, p);
        mk('circle', { cx: x, cy: y, r: r, fill: col }, p);
    }
    function lead(p, x1, y1, x2, y2, col, sw) {
        return mk('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': sw, 'stroke-linecap': 'round' }, p);
    }
    function blade(p, x1, y1, x2, y2, col, sw, shadow) {
        if (shadow) lead(p, x1 + 0.8, y1 + 1.4, x2 + 0.8, y2 + 1.4, '#000000', sw + 0.6).setAttribute('opacity', 0.25);
        lead(p, x1, y1, x2, y2, col, sw);
    }

    // single pole, single throw (knife switch)
    function drawSpst(p, w, h, c) {
        var pad = 5, y = h * 0.64, xp = pad + (w - 2 * pad) * 0.3, xc = w - pad - (w - 2 * pad) * 0.3, r = Math.max(2.6, Math.min(w, h) * 0.1);
        var sw = Math.max(1.6, Math.min(w, h) * 0.07), on = !!c.on, act = on ? c.accent : c.color;
        lead(p, pad, y, xp, y, on ? c.accent : c.color, sw);
        lead(p, xc, y, w - pad, y, on ? c.accent : c.color, sw);
        if (on) blade(p, xp, y, xc, y, c.accent, sw + 1, true);
        else {
            var L = (xc - xp) * 1.12, a = 28 * Math.PI / 180;
            blade(p, xp, y, xp + L * Math.cos(a), y - L * Math.sin(a), c.color, sw + 1, true);
        }
        terminal(p, xp, y, r, act); terminal(p, xc, y, r, act);
    }

    // single pole, double throw (changeover): on = upper position
    function drawSpdt(p, w, h, c) {
        var pad = 5, xp = pad + (w - 2 * pad) * 0.28, xc = w - pad - (w - 2 * pad) * 0.3;
        var ym = h / 2, yu = h * 0.2, yl = h * 0.8, r = Math.max(2.6, Math.min(w, h) * 0.085);
        var sw = Math.max(1.6, Math.min(w, h) * 0.06), up = !!c.on;
        lead(p, pad, ym, xp, ym, c.accent, sw);
        lead(p, xc, yu, w - pad, yu, up ? c.accent : c.color, sw);
        lead(p, xc, yl, w - pad, yl, up ? c.color : c.accent, sw);
        blade(p, xp, ym, xc, up ? yu : yl, c.accent, sw + 1, true);
        terminal(p, xp, ym, r, c.accent);
        terminal(p, xc, yu, r, up ? c.accent : c.color);
        terminal(p, xc, yl, r, up ? c.color : c.accent);
    }

    // momentary push switch (normally open): the plunger closes the two contacts while pressed
    function drawPushSw(p, w, h, c) {
        var pad = 5, y = h * 0.68, xa = w * 0.34, xb = w * 0.66, r = Math.max(2.2, Math.min(w, h) * 0.075);
        var sw = Math.max(1.5, Math.min(w, h) * 0.06), pr = !!c.pressed, col = pr ? c.accent : c.color;
        lead(p, pad, y, xa - r, y, col, sw);
        lead(p, xb + r, y, w - pad, y, col, sw);
        mk('circle', { cx: xa, cy: y, r: r, fill: pr ? c.accent : 'none', stroke: col, 'stroke-width': sw }, p);
        mk('circle', { cx: xb, cy: y, r: r, fill: pr ? c.accent : 'none', stroke: col, 'stroke-width': sw }, p);
        var yb = pr ? y - r - 1 : h * 0.34;                  // the bar goes down while pressed
        var ys = pr ? h * 0.2 : h * 0.1;
        lead(p, w / 2, ys, w / 2, yb, c.color, sw);          // plunger stem
        lead(p, xa, yb, xb, yb, pr ? c.accent : c.color, sw + 0.8);
    }

    // a polygon used as a live segment: only its colour changes (on / off)
    function paintPoly(g) {
        var c = getCfg(g), v = g.__rt ? g.__rt.v : c.value;
        g.style.fill = isLit(c, v) ? c.onColor : c.offColor;
    }
    // turn a normal polygon into a live segment (and back)
    function makeLive(g) {
        var cfg = defaultCfg('polyseg'), cur = g.style.fill;
        if (cur && cur !== 'none') cfg.onColor = hexOf(cur) || cfg.onColor;
        g.setAttribute('wlive', '1');
        g.setAttribute('wref', newRef('polyseg', g));
        setCfg(g, cfg); paintPoly(g);
    }
    function makeNormal(g) {
        ['wlive', 'wref', 'wcfg', 'wbind'].forEach(function (a) { g.removeAttribute(a); });
        delete g.__rt;
    }
    function hexOf(col) {
        var m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(String(col).trim());
        if (m) return '#' + [m[1], m[2], m[3]].map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('');
        return /^#[0-9a-f]{6}$/i.test(col) ? col : '';
    }

    // (re)build the content of the element
    function redraw(g) {
        if (!g) return;
        if (isPoly(g)) { paintPoly(g); return; }
        var x = num(g.getAttribute('x'), 0), y = num(g.getAttribute('y'), 0);
        var w = Math.max(10, num(g.getAttribute('width'), 30)), h = Math.max(10, num(g.getAttribute('height'), 30));
        g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        while (g.firstChild) g.removeChild(g.firstChild);
        var type = getType(g), c = getCfg(g);
        if (g.__rt) c = applyRT(type, c, g.__rt);
        // transparent hit area / thin frame (helps to see the extent while editing)
        mk('rect', { x: 0, y: 0, width: w, height: h, fill: 'transparent', stroke: 'none' }, g);
        var lab = String(c.label || ''), ah = lab ? Math.max(10, h - LABEL_H) : h;
        var body = mk('g', { 'pointer-events': 'none' }, g);
        var fn = { led: drawLed, segment: drawSegment, switch: drawSwitch, button: drawButton, slider: drawSlider,
                   spst: drawSpst, spdt: drawSpdt, pushsw: drawPushSw, gauge: drawGauge, bar: drawBar, value: drawValue, knob: drawKnob }[type];
        // the content is drawn in its own (logical) box, then turned / mirrored by the orientation matrix
        var M = getM(g), sw = isSwapped(M), la = sw ? ah : w, lb = sw ? w : ah;
        var cg = mk('g', { transform: 'translate(' + (w / 2) + ',' + (ah / 2) + ') matrix(' + M[0] + ',' + M[2] + ',' + M[1] + ',' + M[3] + ',0,0) translate(' + (-la / 2) + ',' + (-lb / 2) + ')' }, body);
        fn(cg, la, lb, c);
        if (lab) {
            var t = mk('text', { x: w / 2, y: h - 2, 'text-anchor': 'middle', 'font-size': 10, 'font-family': 'Arial, sans-serif', fill: '#9ca3af' }, body);
            t.textContent = lab;
        }
    }

    // orientation matrix [m11,m12,m21,m22] of the content (identity = as drawn); it follows the
    // rotate / flip commands of the symbol editor
    function getM(g) {
        var a = String(g.getAttribute('wm') || '1,0,0,1').split(',').map(Number);
        return (a.length === 4 && a.every(isFinite)) ? a : [1, 0, 0, 1];
    }
    function isSwapped(M) { return M[0] === 0 && M[3] === 0; }
    function mul(A, B) { return [A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]]; }
    // op: 'T' transpose (the editor's Rotate), 'H' horizontal flip, 'V' vertical flip
    function applyOp(g, op) {
        var O = { T: [0, 1, 1, 0], H: [-1, 0, 0, 1], V: [1, 0, 0, -1] }[op];
        if (!O) return;
        g.setAttribute('wm', mul(O, getM(g)).join(','));
        redraw(g);
    }
    // pointer position (client coordinates) -> coordinates in the widget's own (unturned) box
    function toLogical(g, clientX, clientY) {
        var svg = g.ownerSVGElement, m = g.getScreenCTM();
        if (!svg || !m) return null;
        var pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
        var p = pt.matrixTransform(m.inverse());
        var w = num(g.getAttribute('width'), 30), h = num(g.getAttribute('height'), 30);
        var c = getCfg(g), ah = String(c.label || '') ? Math.max(10, h - LABEL_H) : h;
        var M = getM(g), sw = isSwapped(M), la = sw ? ah : w, lb = sw ? w : ah;
        var d0 = p.x - w / 2, d1 = p.y - ah / 2;
        return { x: M[0] * d0 + M[2] * d1 + la / 2, y: M[1] * d0 + M[3] * d1 + lb / 2, la: la, lb: lb };
    }
    // fraction 0..1 of a slider for a pointer position
    function sliderFraction(g, clientX, clientY) {
        var L = toLogical(g, clientX, clientY); if (!L) return null;
        var kr = Math.max(4, Math.min(L.la, L.lb) * 0.28), pad = kr + 1;
        var f = getCfg(g).vertical ? 1 - (L.y - pad) / Math.max(1, L.lb - 2 * pad) : (L.x - pad) / Math.max(1, L.la - 2 * pad);
        return Math.max(0, Math.min(1, f));
    }
    // fraction 0..1 of a rotary knob for a pointer position (dial from 135 to 405 degrees, clockwise)
    function knobFraction(g, clientX, clientY) {
        var L = toLogical(g, clientX, clientY); if (!L) return null;
        var a = Math.atan2(L.y - L.lb / 2, L.x - L.la / 2) * 180 / Math.PI;
        var rel = ((a - 135) % 360 + 360) % 360;
        if (rel > 270) rel = rel > 315 ? 0 : 270;              // the gap at the bottom: stay at the nearest end
        return rel / 270;
    }
    // redraw every widget found in `root` from its saved settings (after opening / pasting)
    function initAll(root) {
        var list = (root && root.querySelectorAll) ? Array.prototype.slice.call(root.querySelectorAll(SEL)) : [];
        if (root && root.matches && root.matches(SEL)) list.push(root);
        list.forEach(function (g) { delete g.__rt; redraw(g); });
    }

    // set the size of the widget in its own (unturned) direction
    function setLogicalSize(g, lw, lh) {
        var sw = isSwapped(getM(g));
        g.setAttribute('width', sw ? lh : lw);
        g.setAttribute('height', sw ? lw : lh);
    }

    function create(g, type) {
        type = TYPES[type] ? type : 'led';
        g.setAttribute('wtype', type);
        g.setAttribute('wm', '1,0,0,1');
        g.setAttribute('width', TYPES[type].w);
        g.setAttribute('height', TYPES[type].h);
        g.setAttribute('wref', newRef(type, g));
        setCfg(g, defaultCfg(type));
        redraw(g);
    }

    // ---- binding to the model of the symbol ---------------------------------------------------------
    //   wbind = "param:R"    input widget -> parameter R of the model        (set between two steps)
    //   wbind = "signal:I"   output widget <- signal I of the model          (read after every step)
    //   wbind = "pin:out"    output widget <- voltage of the pin "out"
    function isInputType(t) { return !!(TOGGLE[t] || MOMENTARY[t] || t === 'slider' || t === 'knob'); }
    function getBinding(g) {
        var b = String(g.getAttribute('wbind') || ''), i = b.indexOf(':');
        if (i < 1) return null;
        var c = getCfg(g);
        return { kind: b.slice(0, i), name: b.slice(i + 1), scale: num(c.scale, 1), offset: num(c.offset, 0) };
    }
    function bindingFits(type, bind) {                  // does the kind of binding suit the direction?
        if (!bind) return true;
        var k = String(bind).split(':')[0];
        return isInputType(type) ? k === 'param' : (k === 'signal' || k === 'pin' || k === 'param');
    }

    return { isInputType: isInputType, getBinding: getBinding, bindingFits: bindingFits, TYPES: TYPES, ORDER: ORDER, defaultCfg: defaultCfg, getType: getType, getCfg: getCfg, setCfg: setCfg,
             redraw: redraw, initAll: initAll, makeLive: makeLive, makeNormal: makeNormal, isPoly: isPoly, toLogical: toLogical, sliderFraction: sliderFraction, knobFraction: knobFraction, applyOp: applyOp, setLogicalSize: setLogicalSize, create: create, cleanRef: cleanRef, uniqueRef: uniqueRef, newRef: newRef, isAutoRef: isAutoRef };
})();

// ---------------------------------------------------------------------------------------------
// information about the model of the symbol, for the Binding section
//   params : the parameters of the symbol (elements "param" that go to setParams) + those of the model
//   signals: the signals of the model (needs Python: the model is instantiated once to read them)
//   pins   : the names of the pins
// ---------------------------------------------------------------------------------------------
var liveWidgetModelCache = {};

function liveWidgetPins() {
    var out = [], pins = document.querySelectorAll('#sym [name="pin"]');
    for (var i = 0; i < pins.length; i++) {
        var t = pins[i].querySelector('text'), n = t ? String(t.textContent || '').trim() : '';
        if (n && out.indexOf(n) < 0) out.push(n);
    }
    return out;
}
function liveWidgetSymbolParams() {
    var out = [], els = document.querySelectorAll('#sym [name="param"]');
    for (var i = 0; i < els.length; i++) {
        var b = els[i].getAttribute('bind'), n = els[i].getAttribute('paramname');
        if (n && b !== 'init' && b !== 'method' && out.indexOf(n) < 0) out.push(n);
    }
    return out;
}
// Python text that creates one instance of the model of the symbol (null when there is no model)
function liveWidgetModelCode() {
    try {
        var m = drawing.symbol && drawing.symbol.model;
        if (!m || !m.name || m.name === 'None') return null;
        var n = document.querySelectorAll('#sym [name="pin"]').length, pins = [];
        for (var i = 0; i < n; i++) pins.push('"n' + i + '"');
        var bound = getBoundParams(document.getElementById('sym'));
        return pyImportLine(m.name, m.dir, m.file) + "\n" + pyElementCode('X1', m.name, pins, '', bound);
    } catch (e) { return null; }
}
// returns the cached info ({signals:[], params:[]}) or null; asks Python once when it is not known yet
function liveWidgetModelInfo(onReady) {
    var code = liveWidgetModelCode();
    if (!code) return { signals: [], params: [] };
    var c = liveWidgetModelCache[code];
    if (c) return c.info || null;
    liveWidgetModelCache[code] = { info: null };
    try {
        drawing.getListParameter(code).then(function (data) {
            var info = { signals: [], params: [] };
            var m = data && data.models && data.models[0];
            if (m) {
                (m.signals || []).forEach(function (x) { info.signals.push(x.name); });
                (m.params || []).forEach(function (x) { info.params.push(x.name); });
            }
            liveWidgetModelCache[code].info = info;
            if (onReady) onReady();
        }).catch(function () { liveWidgetModelCache[code].info = { signals: [], params: [] }; if (onReady) onReady(); });
    } catch (e) { liveWidgetModelCache[code].info = { signals: [], params: [] }; }
    return null;
}

// functions used by the rest of the editor (same names as the other elements)
function addLiveWidget(elem) { liveWidget.create(elem, 'led'); }
function liveWidgetOp(elem, op) { if (elem && elem.getAttribute && elem.getAttribute('name') === 'liveWidget') liveWidget.applyOp(elem, op); }
function modifedSizeLiveWidget(elem) { if (elem && elem.getAttribute && elem.getAttribute('name') === 'liveWidget') liveWidget.redraw(elem); }

// ---------------------------------------------------------------------------------------------
// properties panel
//   section 0  Basic Properties : Pos.x, Pos.y, Width, Height
//   section 1  Widget           : Type, Ref, Label
//   section 2  type settings    : depends on the type (see below)
// ---------------------------------------------------------------------------------------------
// read the Binding section back into the element; true when the panel has to be rebuilt
// (the kind of binding changed: Scale / Offset are shown for signals and pins only)
function liveWidgetApplyBinding(el, bind, c, input) {
    var f = function (v, d) { v = parseFloat(v); return isFinite(v) ? v : d; };
    var sel = String(bind.rows[0].value || 'None');
    var nb = (sel === 'None') ? '' : sel.replace(/^\u26A0\s*/, '').replace(': ', ':');
    var prev = String(el.getAttribute('wbind') || '').split(':')[0], now = nb.split(':')[0];
    if (nb) el.setAttribute('wbind', nb); else el.removeAttribute('wbind');
    bind.rows.forEach(function (r) {
        if (r.label === 'Scale') c.scale = f(r.value, 1);
        if (r.label === 'Offset') c.offset = f(r.value, 0);
    });
    if (now === 'param') { c.scale = 1; c.offset = 0; }
    return !input && ((prev === 'param') !== (now === 'param'));
}

// the Binding section of the properties panel (shared by the widgets and the live polygon)
function liveWidgetBindingSection(el, type, c, reselect) {
    var W = liveWidget, input = W.isInputType(type), saved = String(el.getAttribute('wbind') || '');
    var info = liveWidgetModelInfo(reselect);
    var opts = ['None'], seen = {};
    var add = function (kind, name) { var k = kind + ': ' + name; if (!seen[k]) { seen[k] = 1; opts.push(k); } };
    if (input) {
        liveWidgetSymbolParams().forEach(function (n) { add('param', n); });
        if (info) info.params.forEach(function (n) { add('param', n); });
    } else {
        // an output reads a parameter that the model writes (best), or a signal, or a pin voltage
        liveWidgetSymbolParams().forEach(function (n) { add('param', n); });
        if (info) info.params.forEach(function (n) { add('param', n); });
        if (info) info.signals.forEach(function (n) { add('signal', n); });
        liveWidgetPins().forEach(function (n) { add('pin', n); });
    }
    var cur = 'None';
    if (saved && W.bindingFits(type, saved)) {
        var k = saved.replace(':', ': ');
        if (!seen[k]) opts.push('\u26A0 ' + k);                 // saved, but not found in the model (any more)
        cur = seen[k] ? k : '\u26A0 ' + k;
    }
    var brows = [{ label: input ? 'Model parameter' : 'Model value', type: 'dropdown', options: opts, value: cur }];
    if (!input && !/^param/.test(cur.replace(/^\u26A0\s*/, ''))) {          // scale / offset only for signals and pins
        brows.push({ label: 'Scale', type: 'number', value: c.scale === undefined ? 1 : c.scale });
        brows.push({ label: 'Offset', type: 'number', value: c.offset === undefined ? 0 : c.offset });
    }
    if (!info) brows.push({ label: 'Model signals', type: 'text', value: 'reading the model...' });
    return { title: 'Binding', collapsed: false, showReset: true, collapseKey: 'lw.Binding', rows: brows };

}

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
                { label: 'Active when', type: 'dropdown', options: ['High (value >= threshold)', 'Low (value < threshold)'], value: c.activeLow ? 'Low (value < threshold)' : 'High (value >= threshold)' },
                { label: 'Preview value', type: 'number', value: c.value }
            ]; break;
        case 'segment':
            rows = [
                { label: 'Digits', type: 'number', value: c.digits },
                { label: 'Decimal point', type: 'dropdown', options: ['No', 'Yes'], value: yn(c.dp) },
                { label: 'Format', type: 'dropdown', options: ['Decimal', 'Hex (0-15 = 0-F)'], value: c.format === 'hex' ? 'Hex (0-15 = 0-F)' : 'Decimal' },
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
        case 'spst':
            rows = [
                { label: 'Closed value', type: 'number', value: c.onValue },
                { label: 'Open value', type: 'number', value: c.offValue },
                { label: 'Initial state', type: 'dropdown', options: ['Open', 'Closed'], value: c.on ? 'Closed' : 'Open' },
                { label: 'Line color', type: 'color', value: c.color, color: c.color },
                { label: 'Active color', type: 'color', value: c.accent, color: c.accent }
            ]; break;
        case 'spdt':
            rows = [
                { label: 'Upper value', type: 'number', value: c.onValue },
                { label: 'Lower value', type: 'number', value: c.offValue },
                { label: 'Initial position', type: 'dropdown', options: ['Upper', 'Lower'], value: c.on ? 'Upper' : 'Lower' },
                { label: 'Line color', type: 'color', value: c.color, color: c.color },
                { label: 'Active color', type: 'color', value: c.accent, color: c.accent }
            ]; break;
        case 'pushsw':
            rows = [
                { label: 'Pressed value', type: 'number', value: c.pressValue },
                { label: 'Released value', type: 'number', value: c.releaseValue },
                { label: 'Line color', type: 'color', value: c.color, color: c.color },
                { label: 'Active color', type: 'color', value: c.accent, color: c.accent }
            ]; break;
        case 'button':
            rows = [
                { label: 'Pressed value', type: 'number', value: c.pressValue },
                { label: 'Released value', type: 'number', value: c.releaseValue },
                { label: 'Color', type: 'color', value: c.color, color: c.color }
            ]; break;
        case 'gauge':
            rows = [
                { label: 'Min', type: 'number', value: c.min },
                { label: 'Max', type: 'number', value: c.max },
                { label: 'Preview value', type: 'number', value: c.value },
                { label: 'Decimals', type: 'number', value: c.decimals },
                { label: 'Unit', type: 'text', value: c.unit || '' },
                { label: 'Show value', type: 'dropdown', options: ['Yes', 'No'], value: yn(c.showValue !== false) },
                { label: 'Color', type: 'color', value: c.color, color: c.color },
                { label: 'Needle color', type: 'color', value: c.needleColor, color: c.needleColor }
            ]; break;
        case 'bar':
            rows = [
                { label: 'Min', type: 'number', value: c.min },
                { label: 'Max', type: 'number', value: c.max },
                { label: 'Preview value', type: 'number', value: c.value },
                { label: 'Orientation', type: 'dropdown', options: ['Vertical', 'Horizontal'], value: c.vertical !== false ? 'Vertical' : 'Horizontal' },
                { label: 'Show value', type: 'dropdown', options: ['No', 'Yes'], value: yn(c.showValue) },
                { label: 'Decimals', type: 'number', value: c.decimals },
                { label: 'Unit', type: 'text', value: c.unit || '' },
                { label: 'Color', type: 'color', value: c.color, color: c.color }
            ]; break;
        case 'value':
            rows = [
                { label: 'Preview value', type: 'number', value: c.value },
                { label: 'Decimals', type: 'number', value: c.decimals },
                { label: 'Unit', type: 'text', value: c.unit || '' },
                { label: 'Color', type: 'color', value: c.color, color: c.color },
                { label: 'Background', type: 'color', value: c.bg, color: c.bg }
            ]; break;
        case 'knob':
            rows = [
                { label: 'Min', type: 'number', value: c.min },
                { label: 'Max', type: 'number', value: c.max },
                { label: 'Step', type: 'number', value: c.step },
                { label: 'Initial value', type: 'number', value: c.value },
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

    sections.push(liveWidgetBindingSection(el, type, c, function () { if (mtable.select === el && mtable.type === 'liveWidget') liveWidgetSelect(); }));

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
    if (newType === 'polyseg' && oldType !== 'polyseg') { liveWidgetToPolygon(el); return; }

    if (newType !== oldType) {
        // new kind of widget: its own defaults, default size, and a new automatic ref
        var keepLabel = c.label;
        el.setAttribute('wtype', newType);
        el.setAttribute('wm', '1,0,0,1');
        if (!W.bindingFits(newType, el.getAttribute('wbind')) || W.isInputType(newType) !== W.isInputType(oldType)) el.removeAttribute('wbind');
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
                c.threshold = f(R[3].value, 0.5); c.activeLow = /^Low/.test(R[4].value); c.value = f(R[5].value, 0);
                break;
            case 'segment': {
                var n = Math.max(1, Math.min(8, Math.round(f(R[0].value, 1))));
                if (n !== c.digits) { W.setLogicalSize(el, W.TYPES.segment.w * n, W.TYPES.segment.h); rebuild = true; }
                c.digits = n; c.dp = R[1].value === 'Yes';
                c.format = /^Hex/.test(R[2].value) ? 'hex' : 'dec';
                c.color = R[3].value; c.offColor = R[4].value; c.value = f(R[5].value, 0);
                break; }
            case 'switch':
                c.onValue = f(R[0].value, 1); c.offValue = f(R[1].value, 0);
                c.on = R[2].value === 'On'; c.color = R[3].value;
                break;
            case 'button':
                c.pressValue = f(R[0].value, 1); c.releaseValue = f(R[1].value, 0); c.color = R[2].value;
                break;
            case 'spst':
                c.onValue = f(R[0].value, 1); c.offValue = f(R[1].value, 0);
                c.on = R[2].value === 'Closed'; c.color = R[3].value; c.accent = R[4].value;
                break;
            case 'spdt':
                c.onValue = f(R[0].value, 1); c.offValue = f(R[1].value, 0);
                c.on = R[2].value === 'Upper'; c.color = R[3].value; c.accent = R[4].value;
                break;
            case 'pushsw':
                c.pressValue = f(R[0].value, 1); c.releaseValue = f(R[1].value, 0);
                c.color = R[2].value; c.accent = R[3].value;
                break;
            case 'gauge':
                c.min = f(R[0].value, 0); c.max = f(R[1].value, 1); if (c.max <= c.min) c.max = c.min + 1;
                c.value = f(R[2].value, c.min); c.decimals = Math.max(0, Math.min(6, Math.round(f(R[3].value, 1))));
                c.unit = String(R[4].value || ''); c.showValue = R[5].value !== 'No';
                c.color = R[6].value; c.needleColor = R[7].value;
                break;
            case 'bar': {
                c.min = f(R[0].value, 0); c.max = f(R[1].value, 1); if (c.max <= c.min) c.max = c.min + 1;
                c.value = f(R[2].value, c.min);
                var bv = R[3].value !== 'Horizontal';
                if (bv !== (c.vertical !== false)) {
                    var bw = el.getAttribute('width'), bh = el.getAttribute('height');
                    el.setAttribute('width', bh); el.setAttribute('height', bw); rebuild = true;
                }
                c.vertical = bv; c.showValue = R[4].value === 'Yes'; c.decimals = Math.max(0, Math.min(6, Math.round(f(R[5].value, 1))));
                c.unit = String(R[6].value || ''); c.color = R[7].value;
                break; }
            case 'value':
                c.value = f(R[0].value, 0); c.decimals = Math.max(0, Math.min(6, Math.round(f(R[1].value, 3))));
                c.unit = String(R[2].value || ''); c.color = R[3].value; c.bg = R[4].value;
                break;
            case 'knob':
                c.min = f(R[0].value, 0); c.max = f(R[1].value, 1); if (c.max <= c.min) c.max = c.min + 1;
                c.step = Math.max(1e-9, f(R[2].value, 0.1));
                c.value = Math.min(c.max, Math.max(c.min, f(R[3].value, c.min)));
                c.color = R[4].value;
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
        // binding to the model of the symbol
        if (liveWidgetApplyBinding(el, P[3], c, W.isInputType(oldType))) rebuild = true;
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

// ---------------------------------------------------------------------------------------------
// Polygon segment: a normal polygon (points can be added / moved with the polygon tools) that is
// a live output: its fill is the "on" or the "off" colour according to the bound signal.
// ---------------------------------------------------------------------------------------------
function liveWidgetToPolygon(el) {
    var x = parseFloat(el.getAttribute('x')) || 0, y = parseFloat(el.getAttribute('y')) || 0;
    var pts = [[5, 0], [31, 0], [36, 5], [31, 10], [5, 10], [0, 5]].map(function (p) { return (x + p[0]) + ',' + (y + p[1]); }).join(' ');
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts);
    poly.style.stroke = '#1f2937'; poly.style.strokeWidth = '1px'; poly.style.fill = '#ef4444';
    poly.setAttribute('class', 'draggable');
    poly.setAttribute('name', 'polygon');
    liveWidget.makeLive(poly);
    el.parentNode.insertBefore(poly, el);
    try { deleteEllipseMS(mtable.resize); } catch (e) {}
    el.remove();
    mtable.resize.setElement = poly;
    mtable.resize.creatEllipse();
}

// sections added to the panel of a polygon that is a live segment
function liveSegmentSections(el) {
    var W = liveWidget, c = W.getCfg(el);
    var live = { title: 'Live segment', collapsed: false, showReset: true, collapseKey: 'lw.Segment', rows: [
        { label: 'Ref', type: 'text', value: el.getAttribute('wref') || '' },
        { label: 'On color', type: 'color', value: c.onColor, color: c.onColor },
        { label: 'Off color', type: 'color', value: c.offColor, color: c.offColor },
        { label: 'Threshold', type: 'number', value: c.threshold },
        { label: 'Active when', type: 'dropdown', options: ['High (value >= threshold)', 'Low (value < threshold)'], value: c.activeLow ? 'Low (value < threshold)' : 'High (value >= threshold)' },
        { label: 'Preview value', type: 'number', value: c.value }
    ] };
    var bind = liveWidgetBindingSection(el, 'polyseg', c, function () { if (mtable.select === el && mtable.type === 'polygon') polygonSelect(); });
    [live, bind].forEach(function (sec) {
        if (typeof propSectionState !== 'undefined' && typeof propSectionState[sec.collapseKey] === 'boolean') sec.collapsed = propSectionState[sec.collapseKey];
    });
    return [live, bind];
}

// read the two sections back (live = Live segment, bind = Binding); returns true when the panel must be rebuilt
function liveSegmentModified(el, live, bind) {
    var W = liveWidget, c = W.getCfg(el), rebuild = false;
    var f = function (v, d) { v = parseFloat(v); return isFinite(v) ? v : d; };
    var ref = W.cleanRef(live.rows[0].value) || el.getAttribute('wref') || W.newRef('polyseg', el);
    var u = W.uniqueRef(ref, el); if (u !== live.rows[0].value) rebuild = true;
    el.setAttribute('wref', u);
    c.onColor = live.rows[1].color || live.rows[1].value; c.offColor = live.rows[2].color || live.rows[2].value;
    c.threshold = f(live.rows[3].value, 0.5); c.activeLow = /^Low/.test(live.rows[4].value); c.value = f(live.rows[5].value, 0);
    if (liveWidgetApplyBinding(el, bind, c, false)) rebuild = true;
    W.setCfg(el, c);
    W.redraw(el);
    return rebuild;
}
