/*
 * Live (interactive) simulation - own scope.
 *
 * Stage 2: the panel drives the DEMO source of the liveScope elements (Run / Pause / Stop / Reset).
 * The simulation of the circuit itself and the Live switch are not implemented yet: they show
 * the "Future Application (Coming Soon)" message.
 *
 * The rest of the editor only uses:
 *    liveSimulation.toggle() / show() / hide() / isOpen()
 *    liveSimulation.onChange = function (isOpen) {...}      // called when the panel is opened / closed
 * Everything else (state, controls, DOM) is private to this module, so it cannot clash with the many
 * global names of the editor.
 */
var liveSimulation = (function () {
    'use strict';

    var panel = null;
    var api = { onChange: null };

    function icon(d) { return '<svg viewBox="0 0 24 24" fill="currentColor">' + d + '</svg>'; }

    // "Coming Soon" message under an element
    function comingSoon(el) {
        var old = document.getElementById('live-toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.id = 'live-toast';
        t.innerText = 'Future Application (Coming Soon)';
        t.style.cssText = 'position:fixed;background:#333;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;' +
            'z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:opacity .3s ease;opacity:0;font-family:verdana;pointer-events:none;';
        document.body.appendChild(t);
        var r = el.getBoundingClientRect();
        t.style.left = Math.max(4, r.left + r.width / 2 - t.offsetWidth / 2) + 'px';
        t.style.top = (r.bottom + 10) + 'px';
        setTimeout(function () { t.style.opacity = '1'; }, 10);
        setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, 2000);
    }

    function create() {
        if (panel) return panel;
        panel = document.createElement('div');
        panel.id = 'livePanel';
        panel.innerHTML =
            '<div class="lp-head"><span class="lp-title">Live Simulation</span><span class="lp-badge" id="lpBadge">Demo</span>' +
            '<button class="lp-close" title="Close">&times;</button></div>' +
            '<div class="lp-body">' +
              '<div class="lp-row">' +
                '<button class="lp-btn" data-act="run" title="Run">' + icon('<polygon points="6,4 20,12 6,20"/>') + '</button>' +
                '<button class="lp-btn" data-act="pause" title="Pause">' + icon('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>') + '</button>' +
                '<button class="lp-btn" data-act="stop" title="Stop">' + icon('<rect x="5" y="5" width="14" height="14"/>') + '</button>' +
                '<button class="lp-btn" data-act="reset" title="Reset">' + icon('<path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/>') + '</button>' +
              '</div>' +
              '<div class="lp-switch" data-act="live" title="Re-run automatically when a control changes"><i></i><span>Live</span></div>' +
              '<div class="lp-opts" id="lpOpts">' +
                '<label>Step <input id="lpStep" type="text" value="1ms" size="6" title="Fixed circuit time step"></label>' +
                '<label>Speed <select id="lpRate" title="Circuit seconds per real second">' +
                  '<option value="1" selected>Real time</option><option value="0.1">x 0.1</option><option value="0.01">x 0.01</option>' +
                  '<option value="0.001">x 0.001</option><option value="max">Max</option></select></label>' +
              '</div>' +
              '<div class="lp-status" id="lpStatus"></div>' +
              '<div class="lp-sec">Widgets</div>' +
              '<div class="lp-list" id="lpControls"></div>' +
              '<div class="lp-note" id="lpNote"></div>' +
            '</div>';
        document.body.appendChild(panel);

        // With something to simulate (bound widgets / scope channels in a circuit page) the buttons drive the
        // Python session (liveBridge); otherwise they drive the demo generators
        function rateValue() {
            var v = panel.querySelector('#lpRate').value;
            return v === 'max' ? null : parseFloat(v);
        }
        function real() { return liveBridge.isActive() || liveBridge.available(); }
        var actions = {
            run: function () {
                if (liveBridge.isActive()) { if (liveBridge.state() === 'paused') liveBridge.resume(); return; }
                if (liveBridge.available()) { setStatus('Starting...'); liveBridge.start({ step: panel.querySelector('#lpStep').value.trim() || '1ms', rate: rateValue() }); }
                else { liveScope.demo.start(); liveWidgetRT.start(); }
            },
            pause: function () { if (liveBridge.isActive()) liveBridge.pause(); else { liveScope.demo.pause(); liveWidgetRT.pause(); } },
            stop:  function () { if (liveBridge.isActive()) liveBridge.stop(); else { liveScope.demo.stop(); liveWidgetRT.stop(); } setStatus(''); },
            reset: function () { if (liveBridge.isActive()) liveBridge.reset(); else { liveScope.demo.reset(); liveWidgetRT.reset(); } }
        };
        function setStatus(t, err) {
            var el = panel.querySelector('#lpStatus'); if (!el) return;
            el.textContent = t || ''; el.classList.toggle('err', !!err);
        }
        function showNote() {
            var n = panel.querySelector('#lpNote'), r = liveBridge.available();
            panel.querySelector('#lpBadge').textContent = r ? 'Python' : 'Demo';
            panel.querySelector('#lpOpts').style.display = r ? '' : 'none';
            if (n) n.innerHTML = r ? 'Run simulates the circuit with Python (PyAMS), step by step in real time.' :
                'Nothing is bound to the model: Run feeds the widgets and scopes with demo signals.<br>Bind widgets in the symbol editor (Binding) or add scope channels.';
        }
        function showState() {
            var run = panel.querySelector('[data-act="run"]');
            if (run) run.classList.toggle('on', liveBridge.isActive() ? liveBridge.state() === 'running' : liveScope.demo.isRunning());
            showNote();
        }
        api.showState = showState;
        liveBridge.onState = function (st, info) {
            if (st === 'running') setStatus('t = ' + (info.t !== undefined ? fmtT(info.t) : '0') + (info.speed ? '   ' + (+info.speed).toPrecision(2) + 'x' : '') + (info.late ? '   (too slow)' : ''));
            else if (st === 'paused') setStatus('Paused  t = ' + fmtT(info.t || 0));
            else if (st === 'error') setStatus(info.message || 'Error', true);
            else if (st === 'idle') setStatus('');
            showState();
        };
        liveBridge.onLog = function (m, level) { if (level === 'error') setStatus(m, true); try { console.log('[live ' + level + '] ' + m); } catch (e) {} };
        function fmtT(t) { return t >= 1 ? t.toFixed(2) + ' s' : t >= 1e-3 ? (t * 1e3).toFixed(1) + ' ms' : (t * 1e6).toFixed(0) + ' us'; }
        panel.querySelector('#lpRate').addEventListener('change', function () { if (liveBridge.isActive()) liveBridge.setRate(rateValue()); });
        showNote();
        panel.querySelectorAll('[data-act]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation();
                var a = actions[el.getAttribute('data-act')];
                if (a) { a(); showState(); } else comingSoon(el);
            });
        });
        panel.querySelector('.lp-close').addEventListener('click', function () { api.hide(); });

        // list of the live widgets of the circuit (input widgets first) with their current value
        function renderControls() {
            var box = panel.querySelector('#lpControls'); if (!box) return;
            var l = [];
            try { l = liveWidgetRT.list(); } catch (e) {}
            l.sort(function (a, b) { return (a.dir === b.dir) ? 0 : (a.dir === 'in' ? -1 : 1); });
            if (!l.length) { box.innerHTML = '<div class="lp-empty">No widgets in the circuit</div>'; return; }
            box.innerHTML = l.map(function (w) {
                return '<div class="lp-item"><span class="lp-dir">' + (w.dir === 'in' ? '\u25B6' : '\u25C0') + '</span>' +
                       '<span class="lp-ref">' + w.ref.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>' +
                       '<span class="lp-val">' + (isFinite(w.value) ? +(+w.value).toFixed(3) : '') + '</span></div>';
            }).join('');
        }
        liveWidgetRT.onChange = renderControls;
        api.refresh = renderControls;
        renderControls();

        // drag by the header
        panel.querySelector('.lp-head').addEventListener('mousedown', function (e) {
            if (e.target.closest('.lp-close')) return;
            var r = panel.getBoundingClientRect();
            var dx = e.clientX - r.left, dy = e.clientY - r.top;
            function move(m) {
                panel.style.left = Math.max(0, Math.min(window.innerWidth - 60, m.clientX - dx)) + 'px';
                panel.style.top = Math.max(0, Math.min(window.innerHeight - 40, m.clientY - dy)) + 'px';
                panel.style.right = 'auto';
            }
            function up() { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            e.preventDefault();
        });
        return panel;
    }

    function set(on) {
        create().classList.toggle('show', on);
        if (on && api.refresh) api.refresh();
        if (on && api.showState) api.showState();
        if (typeof api.onChange === 'function') api.onChange(on);
        return on;
    }

    api.isOpen = function () { return !!panel && panel.classList.contains('show'); };
    api.show = function () { return set(true); };
    api.hide = function () { return set(false); };
    api.toggle = function () { return set(!api.isOpen()); };
    return api;
})();
