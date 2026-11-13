/*
#------------------------------------------------------------------------------------------------
# Name:        liveBridge.js
# Purpose:     Stage 3c-3 - links the Live panel to the Python session (pyams/liveSession.py):
#                * builds the circuit code and the session settings from the drawing
#                  (widget bindings, scope channels, step, speed)
#                * input widgets   (liveWidgetRT.onInput)  -> {"cmd":"input"} to Python
#                * output widgets  <- "widgets" events      (liveWidgetRT.setValues)
#                * scope channels  <- "scope" events        (liveScope.push)
#              The extension host (pyamsEditor.js) starts the process and relays the JSON lines:
#                webview -> host : liveStart {code, config} | liveSend {cmd} | liveStop
#                host -> webview : liveEvent {event}
#              Public:  liveBridge.available()  -> true when something in the drawing can be simulated
#                       liveBridge.start(opts) / pause() / resume() / reset() / stop() / setRate(r)
#                       liveBridge.isActive() / state()      liveBridge.onState = function (state, info) {}
# Copyright:   (c) PyAMS 2026
# Licence:     free
#-------------------------------------------------------------------------------------------------
*/
var liveBridge = (function () {
    'use strict';
    var api = { onState: null, onLog: null };
    var active = false, state = 'idle', session = 0, inputsSent = false;

    function post(m) { if (typeof vscode !== 'undefined' && vscode && vscode.postMessage) { vscode.postMessage(m); return true; } return false; }
    function setState(s, info) { state = s; if (typeof api.onState === 'function') { try { api.onState(s, info || {}); } catch (e) {} } }
    function log(msg, level) { if (typeof api.onLog === 'function') { try { api.onLog(msg, level || 'info'); } catch (e) {} } }

    // ------------------------------------------------------------------ what is in the drawing
    function pageIsCircuit() { try { return drawing.pageType !== 'sym'; } catch (e) { return false; } }
    function widgetEls() { return Array.prototype.slice.call(document.querySelectorAll('#sym [name="liveWidget"], #sym polygon[wlive]')); }
    function partOf(g) { var p = g.parentNode; return (p && p.getAttribute && p.getAttribute('name') === 'part') ? p : null; }

    // pin name -> net name for a part (from the net list of the circuit)
    function pinNets(list, sref) {
        for (var i = 0; i < list.length; i++) if (list[i].ref === sref) {
            var m = {};
            list[i].pinsName.forEach(function (n, k) { m[n] = list[i].pins[k]; });
            return m;
        }
        return {};
    }

    function scopeChannels() {
        var names = [];
        Array.prototype.slice.call(document.querySelectorAll('#sym [name="liveScope"]')).forEach(function (el) {
            try { liveScope.getConfig(el).channels.forEach(function (c) { if (c.on !== false && c.signal && names.indexOf(c.signal) < 0) names.push(c.signal); }); } catch (e) {}
        });
        return names;
    }

    // the "widgets" part of the session settings + warnings about what could not be bound
    function widgetConfig() {
        var list = [], warns = [], out = {};
        try { list = netList(); } catch (e) {}
        widgetEls().forEach(function (g) {
            var p = partOf(g), ref = liveWidgetRT.refOf(g);
            var b = liveWidget.getBinding(g);
            if (!p) return;                                    // a widget drawn directly in the page has no model
            if (!b) { warns.push(ref + ': not bound (set Binding in the symbol editor)'); return; }
            var input = liveWidget.isInputType(liveWidget.getType(g)), el = p.getAttribute('sref'), w = { dir: input ? 'in' : 'out', element: el };
            if (b.kind === 'param') {
                w.kind = 'param'; w.name = b.name;
            } else if (b.kind === 'signal') {
                if (input) { warns.push(ref + ': an input must be bound to a parameter'); return; }
                w.kind = 'signal'; w.name = b.name; w.scale = b.scale; w.offset = b.offset;
            } else if (b.kind === 'pin') {
                if (input) { warns.push(ref + ': an input must be bound to a parameter'); return; }
                var node = pinNets(list, el)[b.name];
                if (node === undefined) { warns.push(ref + ': pin "' + b.name + '" not found'); return; }
                w.kind = 'node'; w.node = node; w.scale = b.scale; w.offset = b.offset;
            } else return;
            if (input) { var v = liveWidgetRT.valueOf(g); if (isFinite(v)) w.value = v; }
            out[ref] = w;
        });
        return { widgets: out, warnings: warns };
    }

    function available() {
        return pageIsCircuit() && (Object.keys(widgetConfig().widgets).length > 0 || scopeChannels().length > 0);
    }

    // ------------------------------------------------------------------ control
    function start(opts) {
        opts = opts || {};
        if (active) stop();
        var wc = widgetConfig(), ch = scopeChannels();
        wc.warnings.forEach(function (w) { log(w, 'warn'); });
        var code;
        try { code = generateCodePyofCircuit(); } catch (e) { log('Cannot build the circuit code: ' + e.message, 'error'); return false; }
        var config = {
            step: opts.step || '1ms', rate: (opts.rate === undefined ? 1 : opts.rate), report: 0.04,
            outputs: ch, widgets: wc.widgets
        };
        if (opts.stop) config.stop = opts.stop;
        session++; active = true; inputsSent = false;
        try { liveScope.clear(); } catch (e) {}
        liveWidgetRT.demo = false;
        liveWidgetRT.start();
        liveWidgetRT.onInput = function (ref, value) { if (active) post({ type: 'liveSend', cmd: { cmd: 'input', ref: ref, value: value } }); };
        setState('starting');
        if (!post({ type: 'liveStart', code: code, config: config })) { active = false; setState('idle'); return false; }
        return true;
    }
    function cmd(o) { if (active) post({ type: 'liveSend', cmd: o }); }
    function pause() { cmd({ cmd: 'pause' }); liveWidgetRT.pause(); }
    function resume() { cmd({ cmd: 'resume' }); liveWidgetRT.start(); setState('running'); }
    function reset() { cmd({ cmd: 'reset' }); try { liveScope.clear(); } catch (e) {} liveWidgetRT.reset(); }
    function setRate(r) { cmd({ cmd: 'rate', value: r }); }
    function stop() {
        if (!active) return;
        active = false; post({ type: 'liveStop' });
        liveWidgetRT.onInput = null; liveWidgetRT.demo = true; liveWidgetRT.stop();
        setState('idle');
    }
    api.available = available; api.start = start; api.pause = pause; api.resume = resume; api.reset = reset;
    api.setRate = setRate; api.stop = stop;
    api.isActive = function () { return active; };
    api.state = function () { return state; };
    api.widgetConfig = widgetConfig;

    // ------------------------------------------------------------------ events from Python
    function onEvent(ev) {
        if (!active) return;
        switch (ev.event) {
            case 'ready': setState('running', { elements: ev.elements }); break;
            case 'widgets': liveWidgetRT.setValues(ev.values || {}); break;
            case 'scope': {
                var t = ev.t || [], s = ev.series || {};
                for (var i = 0; i < t.length; i++) {
                    var v = {};
                    for (var k in s) if (s[k][i] !== null && s[k][i] !== undefined) v[k] = s[k][i];
                    try { liveScope.push(t[i], v); } catch (e) {}
                }
                break;
            }
            case 'status': setState(ev.state === 'paused' ? 'paused' : 'running', { t: ev.t, speed: ev.speed, late: ev.late }); break;
            case 'log': log(ev.message, ev.level); break;
            case 'error': log(ev.message + (ev.line ? ' (line ' + ev.line + ')' : ''), 'error'); active = false; liveWidgetRT.onInput = null; liveWidgetRT.demo = true; liveWidgetRT.stop(); setState('error', { message: ev.message }); break;
            case 'end': active = false; liveWidgetRT.onInput = null; liveWidgetRT.demo = true; liveWidgetRT.stop(); setState('idle', { t: ev.t }); break;
        }
    }
    window.addEventListener('message', function (e) {
        var m = e.data;
        if (m && m.type === 'liveEvent' && m.event) onEvent(m.event);
    });
    return api;
})();
