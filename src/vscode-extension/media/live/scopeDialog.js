/*
 * scopeDialog - setup dialog of a liveScope element (own scope, own CSS in liveScope.css).
 *
 *   scopeDialog.open(elem, config, demoSignals, onApply)
 *
 * Tabs:  Channels  (signal, color, V/div, offset, invert)
 *        Time & Trigger (time/div, trigger mode, source, edge, level)
 *        Display (mode YT / XY, grid, labels, background, line width)
 * A signal is a demo signal or a circuit signal (node voltage / element current) chosen with the
 * signal dialog of the analysis (drawing.getListParameter + drawing.getSignalDialog).
 */
var scopeDialog = (function () {
    'use strict';

    var api = {};
    var overlay = null, cfg = null, onApplyCb = null, demoSignals = [], circuitSignals = [];
    var MAX_CH = 4;

    function esc(t) {
        return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function $(sel) { return overlay.querySelector(sel); }

    // ---- build ---------------------------------------------------------------------------------
    function build() {
        if (overlay) overlay.remove();
        overlay = document.createElement('div');
        overlay.id = 'scopeDialogOverlay';
        overlay.innerHTML =
            '<div class="sd-box" role="dialog" aria-label="Scope setup">' +
              '<div class="sd-head"><span>Scope setup</span><button class="sd-x" title="Close">&times;</button></div>' +
              '<div class="sd-tabs">' +
                '<button class="sd-tab active" data-tab="ch">Channels</button>' +
                '<button class="sd-tab" data-tab="tm">Time &amp; Trigger</button>' +
                '<button class="sd-tab" data-tab="ds">Display</button>' +
              '</div>' +
              '<div class="sd-body">' +
                '<div class="sd-pane" data-pane="ch"></div>' +
                '<div class="sd-pane" data-pane="tm" style="display:none"></div>' +
                '<div class="sd-pane" data-pane="ds" style="display:none"></div>' +
              '</div>' +
              '<div class="sd-foot"><button class="sd-btn sec" id="sdCancel">Cancel</button><button class="sd-btn" id="sdApply">Apply</button></div>' +
            '</div>';
        document.body.appendChild(overlay);

        overlay.querySelector('.sd-x').addEventListener('click', close);
        $('#sdCancel').addEventListener('click', close);
        $('#sdApply').addEventListener('click', apply);
        overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
        overlay.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') close(); });
        overlay.querySelectorAll('.sd-tab').forEach(function (b) {
            b.addEventListener('click', function () {
                overlay.querySelectorAll('.sd-tab').forEach(function (x) { x.classList.toggle('active', x === b); });
                overlay.querySelectorAll('.sd-pane').forEach(function (p) { p.style.display = (p.dataset.pane === b.dataset.tab) ? '' : 'none'; });
            });
        });
        fillChannels(); fillTime(); fillDisplay();
    }

    function close() { if (overlay) { overlay.remove(); overlay = null; } }

    // ---- Channels ------------------------------------------------------------------------------
    function signalOptions(selected) {
        var list = [];
        demoSignals.forEach(function (s) { list.push({ name: s, kind: 'demo', group: 'Demo signals' }); });
        circuitSignals.forEach(function (s) { list.push({ name: s.name, kind: s.kind, group: 'Circuit signals' }); });
        // a signal that is already used but not in the lists (e.g. file opened without the circuit scan)
        cfg.channels.forEach(function (c) {
            if (c.signal && !list.some(function (x) { return x.name === c.signal; }))
                list.push({ name: c.signal, kind: c.kind, group: 'Circuit signals' });
        });
        var html = '', groups = ['Demo signals', 'Circuit signals'];
        groups.forEach(function (g) {
            var items = list.filter(function (x) { return x.group === g; });
            if (!items.length) return;
            html += '<optgroup label="' + g + '">' + items.map(function (x) {
                return '<option value="' + esc(x.name) + '" data-kind="' + esc(x.kind) + '"' + (x.name === selected ? ' selected' : '') + '>' + esc(x.name) + '</option>';
            }).join('') + '</optgroup>';
        });
        html += '<option value="__pick__">Pick a circuit signal…</option>';
        return html;
    }

    function fillChannels() {
        var pane = $('[data-pane="ch"]');
        var rows = cfg.channels.map(function (c, i) {
            return '<tr data-i="' + i + '">' +
              '<td><input type="checkbox" class="c-on"' + (c.on ? ' checked' : '') + ' title="Show"></td>' +
              '<td class="c-n" style="color:' + esc(c.color) + '">CH' + (i + 1) + '</td>' +
              '<td><select class="c-sig">' + signalOptions(c.signal) + '</select></td>' +
              '<td><input type="color" class="c-col" value="' + esc(c.color) + '"></td>' +
              '<td><input type="text" class="c-vdiv" value="' + esc(liveScope.fmt(c.vdiv)) + '" title="Units per division (e.g. 500m, 2)"></td>' +
              '<td><input type="text" class="c-off" value="' + esc(liveScope.fmt(c.offset || 0)) + '" title="Offset added to the signal"></td>' +
              '<td><input type="checkbox" class="c-inv"' + (c.invert ? ' checked' : '') + ' title="Invert"></td>' +
              '<td><button class="sd-del" title="Remove">&#128465;</button></td></tr>';
        }).join('');
        pane.innerHTML =
            '<table class="sd-table"><thead><tr><th></th><th></th><th>Signal</th><th>Color</th><th>Units/div</th><th>Offset</th><th>Inv</th><th></th></tr></thead><tbody>' +
            rows + '</tbody></table>' +
            '<div class="sd-row"><button class="sd-btn sec" id="sdAdd"' + (cfg.channels.length >= MAX_CH ? ' disabled' : '') + '>+ Add channel</button>' +
            '<span class="sd-hint">In XY mode CH1 is X and CH2 is Y.</span></div>';

        pane.querySelectorAll('tbody tr').forEach(function (tr) {
            var i = +tr.dataset.i, c = cfg.channels[i];
            tr.querySelector('.c-on').addEventListener('change', function (e) { c.on = e.target.checked; });
            tr.querySelector('.c-col').addEventListener('input', function (e) { c.color = e.target.value; tr.querySelector('.c-n').style.color = c.color; });
            tr.querySelector('.c-inv').addEventListener('change', function (e) { c.invert = e.target.checked; });
            tr.querySelector('.c-vdiv').addEventListener('change', function (e) {
                var v = liveScope.parse(e.target.value);
                if (isFinite(v) && v > 0) c.vdiv = v; e.target.value = liveScope.fmt(c.vdiv);
            });
            tr.querySelector('.c-off').addEventListener('change', function (e) {
                var v = liveScope.parse(e.target.value);
                if (isFinite(v)) c.offset = v; e.target.value = liveScope.fmt(c.offset || 0);
            });
            tr.querySelector('.sd-del').addEventListener('click', function () { cfg.channels.splice(i, 1); fillChannels(); fillTime(); });
            var sel = tr.querySelector('.c-sig');
            sel.addEventListener('change', function () {
                if (sel.value === '__pick__') { pickCircuitSignal(i, sel); return; }
                var opt = sel.options[sel.selectedIndex];
                c.signal = sel.value; c.kind = opt.dataset.kind || 'voltage';
            });
        });
        $('#sdAdd').addEventListener('click', function () {
            var used = cfg.channels.map(function (c) { return c.signal; });
            var free = demoSignals.filter(function (s) { return used.indexOf(s) < 0; })[0] || demoSignals[0] || '';
            cfg.channels.push({ on: true, signal: free, kind: 'demo', color: liveScope.defaultChannelColor(cfg.channels.length), vdiv: 1, offset: 0, invert: false });
            fillChannels(); fillTime();
        });
    }

    // choose a node voltage / element current of the circuit (needs the Python scan of the circuit)
    function pickCircuitSignal(i, sel) {
        var back = function () { fillChannels(); };
        try {
            var code = generateCodePyofCircuit();
            drawing.getListParameter(code).then(function (data) {
                drawing.getSignalDialog(data, cfg.channels[i].signal, false, function (result) {
                    var name = result.selectedSignal, kind = result.selectedKind || 'voltage';
                    if (!circuitSignals.some(function (s) { return s.name === name; })) circuitSignals.push({ name: name, kind: kind });
                    cfg.channels[i].signal = name; cfg.channels[i].kind = kind;
                    if (kind === 'current') cfg.channels[i].vdiv = Math.min(cfg.channels[i].vdiv, 0.001);
                    back();
                }, back);
            }).catch(function (err) { console.error('getListParameter failed:', err); back(); });
        } catch (e) { console.error(e); back(); }
    }

    // ---- Time & Trigger ------------------------------------------------------------------------
    function fillTime() {
        var t = cfg.trigger, pane = $('[data-pane="tm"]');
        var srcOpts = cfg.channels.map(function (c, i) {
            return '<option value="' + i + '"' + (i === t.source ? ' selected' : '') + '>CH' + (i + 1) + ' (' + esc(c.signal) + ')</option>';
        }).join('');
        pane.innerHTML =
          '<div class="sd-grid">' +
            '<label>Time / div</label><input type="text" id="sdTime" value="' + esc(liveScope.fmt(cfg.timeDiv, 's')) + '">' +
            '<label>Trigger mode</label><select id="sdTrMode">' +
               ['auto|Auto', 'normal|Normal', 'single|Single', 'off|Free run (no trigger)'].map(function (o) {
                   var p = o.split('|'); return '<option value="' + p[0] + '"' + (t.mode === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') +
            '</select>' +
            '<label>Source</label><select id="sdTrSrc">' + srcOpts + '</select>' +
            '<label>Edge</label><select id="sdTrEdge"><option value="rise"' + (t.edge === 'rise' ? ' selected' : '') + '>Rising</option><option value="fall"' + (t.edge === 'fall' ? ' selected' : '') + '>Falling</option></select>' +
            '<label>Level</label><input type="text" id="sdTrLevel" value="' + esc(liveScope.fmt(t.level || 0)) + '">' +
          '</div>' +
          '<div class="sd-hint">The screen has 10 horizontal divisions: the window shown is 10 × Time/div.</div>';
        $('#sdTime').addEventListener('change', function (e) {
            var v = liveScope.parse(e.target.value);
            if (isFinite(v) && v > 0) cfg.timeDiv = v; e.target.value = liveScope.fmt(cfg.timeDiv, 's');
        });
        $('#sdTrMode').addEventListener('change', function (e) { t.mode = e.target.value; });
        $('#sdTrSrc').addEventListener('change', function (e) { t.source = +e.target.value; });
        $('#sdTrEdge').addEventListener('change', function (e) { t.edge = e.target.value; });
        $('#sdTrLevel').addEventListener('change', function (e) {
            var v = liveScope.parse(e.target.value);
            if (isFinite(v)) t.level = v; e.target.value = liveScope.fmt(t.level || 0);
        });
    }

    // ---- Display -------------------------------------------------------------------------------
    function fillDisplay() {
        var pane = $('[data-pane="ds"]');
        pane.innerHTML =
          '<div class="sd-grid">' +
            '<label>Mode</label><select id="sdMode"><option value="YT"' + (cfg.mode === 'YT' ? ' selected' : '') + '>YT (signal vs time)</option><option value="XY"' + (cfg.mode === 'XY' ? ' selected' : '') + '>XY (CH2 vs CH1)</option></select>' +
            '<label>Background</label><select id="sdBg"><option value="dark"' + (cfg.dark ? ' selected' : '') + '>Dark</option><option value="light"' + (!cfg.dark ? ' selected' : '') + '>Light</option></select>' +
            '<label>Line width</label><input type="text" id="sdLw" value="' + esc(cfg.lineWidth) + '">' +
            '<label>Grid</label><input type="checkbox" id="sdGrid"' + (cfg.grid ? ' checked' : '') + '>' +
            '<label>Labels</label><input type="checkbox" id="sdLabels"' + (cfg.labels ? ' checked' : '') + '>' +
          '</div>';
        $('#sdMode').addEventListener('change', function (e) { cfg.mode = e.target.value; });
        $('#sdBg').addEventListener('change', function (e) { cfg.dark = (e.target.value === 'dark'); });
        $('#sdLw').addEventListener('change', function (e) {
            var v = parseFloat(e.target.value);
            if (v > 0 && v <= 8) cfg.lineWidth = v; e.target.value = cfg.lineWidth;
        });
        $('#sdGrid').addEventListener('change', function (e) { cfg.grid = e.target.checked; });
        $('#sdLabels').addEventListener('change', function (e) { cfg.labels = e.target.checked; });
    }

    // ---- apply ---------------------------------------------------------------------------------
    function apply() {
        var result = JSON.parse(JSON.stringify(cfg));
        close();
        if (typeof onApplyCb === 'function') onApplyCb(result);
    }

    api.open = function (elem, config, demos, onApply) {
        cfg = JSON.parse(JSON.stringify(config));
        onApplyCb = onApply;
        demoSignals = demos || [];
        // circuit signals already used by the channels are offered again
        circuitSignals = cfg.channels.filter(function (c) { return c.kind !== 'demo' && c.signal; })
            .map(function (c) { return { name: c.signal, kind: c.kind }; });
        build();
    };
    api.close = close;
    return api;
})();
