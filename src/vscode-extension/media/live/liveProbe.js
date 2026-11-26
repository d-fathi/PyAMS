/*
 * liveProbe - the probes of the schematic during the live simulation.
 *
 * Every probe that has a signal shows, while the live simulation runs, the changing value of its signal
 * ("R1.I=2.1mA"; a digital signal shows 0 or 1). The box keeps the widest size reached so that it does not
 * shrink and grow with the value. The settings are not changed and nothing is saved: when the simulation
 * stops the probe returns to its text before the run.
 *
 * Data: the same "scope" events as liveScope:  liveProbe.push(t, { "out": 1.2, "R1.I": 0.003 })
 * Public API: signals, begin, end, clear, push, owns
 */
var liveProbe = (function () {
    'use strict';
    var MAX = 2000;                       // samples kept for each signal
    var api = {};
    var store = {};                       // signal -> [values]
    var running = false, dirty = false, raf = 0;
    var live = [];                        // probes in the live simulation

    function probes() { return [].slice.call(document.querySelectorAll('#sym [name="probe"]')); }
    function sigOf(p) { return (p.childNodes[2].textContent || '').split('=')[0]; }

    // signals of the probes (they are added to the outputs of the live session)
    api.signals = function () {
        var out = [];
        probes().forEach(function (p) { var s = sigOf(p); if (s && s !== 'None' && out.indexOf(s) < 0) out.push(s); });
        return out;
    };

    api.owns = function (el) { return running && !!el._live; };

    api.begin = function () {
        api.end();
        store = {};
        probes().forEach(function (p) {
            var s = sigOf(p);
            if (!s || s === 'None') return;
            p._live = { pre: p.childNodes[2].textContent, signal: s, minW: 0 };
            live.push(p);
        });
        running = true;
        live.forEach(function (p) { structProbe(p); });
    };

    api.end = function () {
        running = false;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        live.forEach(function (p) {
            if (!p._live) return;
            p.childNodes[2].textContent = p._live.pre;
            delete p._live;
            structProbe(p);
        });
        live = [];
    };

    api.clear = function () {
        store = {};
        dirty = true; schedule();
    };

    api.push = function (t, values) {
        if (!running) return;
        for (var k in values) {
            var a = store[k] || (store[k] = []);
            a.push(values[k]);
            if (a.length > MAX) a.splice(0, a.length - MAX + 200);
        }
        dirty = true; schedule();
    };

    function schedule() {
        if (raf || !dirty) return;
        var f = function () { raf = 0; if (dirty) { dirty = false; draw(); } };
        raf = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame(f) : setTimeout(f, 40);
    }

    function unit(p) {
        var t = p.getAttribute('type');
        return t === 'current' ? 'A' : (t === 'digital' || p.getAttribute('sigkind') === 'digital') ? '' : 'V';
    }
    function isDigital(p, a) {
        if (p.getAttribute('type') === 'digital' || p.getAttribute('sigkind') === 'digital') return true;
        var one = false, zero = false;
        for (var i = 0; i < a.length; i++) { if (a[i] === 1) one = true; else if (a[i] === 0) zero = true; else return false; }
        return one && zero;
    }

    function draw() {
        live.forEach(function (p) {
            var L = p._live, a = store[L.signal];
            if (!L || !a || !a.length) return;
            var v = a[a.length - 1];
            p.childNodes[2].textContent = L.signal + '=' + (isDigital(p, a.slice(-20)) ? (v >= 0.5 ? '1' : '0') : probeValueText(v, unit(p)));
            structProbe(p);
        });
    }

    return api;
})();
