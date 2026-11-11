/*
#------------------------------------------------------------------------------------------------
# Name:        liveWidgetRuntime.js
# Purpose:     Stage 3b - the widgets (LED, 7-segment, switch, button, slider) come alive while the
#              live panel is running:
#                * input widgets react to the mouse (switch toggles, button is held, slider is dragged)
#                * output widgets are driven by a demo generator (no Python yet)
#              Every widget is identified by its full ref:  <part ref>.<widget ref>   (e.g. X1.sw1)
#              or just <widget ref> for a widget drawn directly in the page.
#
#              Interface for the Python link (stage 3c):
#                liveWidgetRT.list()                      -> [{ref, type, dir:'in'|'out', value}]
#                liveWidgetRT.setValue(ref, value)         // output (or remote change of an input)
#                liveWidgetRT.setValues({ref: value, ...})
#                liveWidgetRT.onInput = function (ref, value, type) {...}   // user changed an input
#                liveWidgetRT.demo = false                // switch the demo generator off
# Nothing here is saved in the file: the drawing is restored from the saved settings on stop.
# Copyright:   (c) PyAMS 2026
# Licence:     free
#-------------------------------------------------------------------------------------------------
*/
var liveWidgetRT = (function () {
    'use strict';
    var api = { onInput: null, onChange: null, demo: true };
    var active = false, running = false, timer = null, t0 = 0, tPause = 0;
    var INPUTS = { 'switch': 1, button: 1, slider: 1 };

    function root() { return document.getElementById('sym') || document; }
    function widgets() { return Array.prototype.slice.call(root().querySelectorAll('[name="liveWidget"]')); }
    function refOf(g) {
        var p = g.parentNode, w = g.getAttribute('wref') || '';
        if (p && p.getAttribute && p.getAttribute('name') === 'part' && p.getAttribute('sref')) return p.getAttribute('sref') + '.' + w;
        return w;
    }
    function find(ref) { var l = widgets(); for (var i = 0; i < l.length; i++) if (refOf(l[i]) === ref) return l[i]; return null; }
    function isInput(g) { return !!INPUTS[liveWidget.getType(g)]; }

    // starting value of a widget, from its saved settings
    function initial(g) {
        var t = liveWidget.getType(g), c = liveWidget.getCfg(g);
        if (t === 'switch') return { v: c.on ? c.onValue : c.offValue, on: !!c.on };
        if (t === 'button') return { v: c.releaseValue, pressed: false };
        return { v: c.value };
    }
    function valueOf(g) { return g.__rt ? g.__rt.v : initial(g).v; }

    function changed() { if (typeof api.onChange === 'function') { try { api.onChange(); } catch (e) {} } }
    function show(g) { liveWidget.redraw(g); }

    // programmatic value (output, or remote change of an input)
    function setValue(ref, value) {
        var g = (typeof ref === 'string') ? find(ref) : ref; if (!g) return false;
        value = Number(value); if (!isFinite(value)) return false;
        var t = liveWidget.getType(g), c = liveWidget.getCfg(g), rt = g.__rt || (g.__rt = initial(g));
        rt.v = value;
        if (t === 'switch') rt.on = Math.abs(value - c.onValue) <= Math.abs(value - c.offValue);
        if (t === 'button') rt.pressed = (value === c.pressValue);
        show(g); changed();
        return true;
    }
    api.setValue = setValue;
    api.setValues = function (o) { for (var k in o) setValue(k, o[k]); };
    api.list = function () {
        return widgets().map(function (g) {
            return { ref: refOf(g), type: liveWidget.getType(g), dir: isInput(g) ? 'in' : 'out', value: valueOf(g) };
        });
    };
    api.isActive = function () { return active; };
    api.isRunning = function () { return running; };

    function emit(g, v) {
        if (typeof api.onInput === 'function') { try { api.onInput(refOf(g), v, liveWidget.getType(g)); } catch (e) { console.error(e); } }
    }

    // ------------------------------------------------------------------ demo generator
    function tick() {
        if (!running || !api.demo) return;
        var t = (performance.now() - t0) / 1000, i = 0;
        widgets().forEach(function (g) {
            if (isInput(g)) return;
            var type = liveWidget.getType(g), c = liveWidget.getCfg(g), v;
            i++;
            if (type === 'led') v = (Math.floor(t * 1.5 + i * 0.5) % 2) ? 1 : 0;
            else if (type === 'segment') v = Math.floor(t * 2) % Math.pow(10, Math.max(1, c.digits || 1));
            else return;
            if (!g.__rt || g.__rt.v !== v) {
                var rt = g.__rt || (g.__rt = initial(g)); rt.v = v; show(g);
            }
        });
    }

    // ------------------------------------------------------------------ control
    function start() {
        if (!active) {
            active = true;
            widgets().forEach(function (g) { g.__rt = initial(g); show(g); });
            t0 = performance.now();
        } else if (!running && tPause) {
            t0 += performance.now() - tPause;          // continue the demo where it stopped
        }
        tPause = 0; running = true;
        if (!timer) timer = setInterval(tick, 100);
        changed();
    }
    function pause() { if (!active || !running) return; running = false; tPause = performance.now(); changed(); }
    function stop() {
        running = false; active = false; tPause = 0;
        if (timer) { clearInterval(timer); timer = null; }
        widgets().forEach(function (g) { delete g.__rt; show(g); });
        changed();
    }
    function reset() {
        if (!active) return;
        widgets().forEach(function (g) { g.__rt = initial(g); show(g); });
        t0 = performance.now(); if (!running) tPause = t0;
        changed();
    }
    api.start = start; api.pause = pause; api.stop = stop; api.reset = reset;

    // the saved file must never contain the runtime look: put the design look back while saving
    api.beforeSave = function () {
        if (!active) return;
        widgets().forEach(function (g) { if (g.__rt) { g.__saved = g.__rt; delete g.__rt; show(g); } });
    };
    api.afterSave = function () {
        if (!active) return;
        widgets().forEach(function (g) { if (g.__saved) { g.__rt = g.__saved; delete g.__saved; show(g); } });
    };

    // ------------------------------------------------------------------ mouse (only while active)
    var drag = null;
    function target(e) {
        var t = e.target;
        return (t && t.closest) ? t.closest('[name="liveWidget"]') : null;
    }
    function slideTo(g, e) {
        var f = liveWidget.sliderFraction(g, e.clientX, e.clientY); if (f === null) return;
        var c = liveWidget.getCfg(g), v = c.min + f * (c.max - c.min);
        v = Math.round((v - c.min) / c.step) * c.step + c.min;
        v = parseFloat(Math.max(c.min, Math.min(c.max, v)).toFixed(9));
        var rt = g.__rt || (g.__rt = initial(g));
        if (rt.v !== v) { rt.v = v; show(g); changed(); emit(g, v); }
    }
    function onDown(e) {
        if (!active || e.button !== 0) return;
        var g = target(e); if (!g) return;
        var t = liveWidget.getType(g); if (!INPUTS[t]) return;       // outputs behave like normal drawing
        e.stopPropagation(); e.preventDefault();
        var c = liveWidget.getCfg(g), rt = g.__rt || (g.__rt = initial(g));
        if (t === 'switch') {
            rt.on = !rt.on; rt.v = rt.on ? c.onValue : c.offValue; show(g); changed(); emit(g, rt.v);
        } else if (t === 'button') {
            rt.pressed = true; rt.v = c.pressValue; show(g); changed(); emit(g, rt.v);
            drag = { g: g, kind: 'button' };
        } else if (t === 'slider') {
            drag = { g: g, kind: 'slider' }; slideTo(g, e);
        }
    }
    function onMove(e) {
        if (drag && drag.kind === 'slider') { e.stopPropagation(); e.preventDefault(); slideTo(drag.g, e); }
    }
    function onUp(e) {
        if (!drag) return;
        var g = drag.g, k = drag.kind; drag = null;
        if (k === 'button' && g.__rt) {
            var c = liveWidget.getCfg(g);
            g.__rt.pressed = false; g.__rt.v = c.releaseValue; show(g); changed(); emit(g, g.__rt.v);
        }
    }
    document.addEventListener('mousedown', onDown, true);
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);

    return api;
})();
