/*
Name:        optionsDialog.js
Purpose:     Dialog that edits the simulation options (reltol, vntol, ... order).
             Only the options whose value differs from the default are returned.

Usage:
    var options = { uic: true };               // options already set
    drawing.getOptions(options).then(function (data) {
        drawing.getOptionsDialog(data,
            function (result) {
                options = result.options;      // e.g. { uic: true, lte: 0.001 }  (differences only)
                // result.python -> "uic=True, lte=0.001"
            },
            function () { console.log('Cancelled'); });
    });
*/

// Description of every option: name, default value, type and meaning.
var PYAMS_OPTIONS = [
    { name: 'reltol',   type: 'number', 'default': 1e-6,  description: 'Relative Newton convergence tolerance' },
    { name: 'vntol',    type: 'number', 'default': 1e-9,  description: 'Absolute tolerance of node voltages (V)' },
    { name: 'abstol',   type: 'number', 'default': 1e-12, description: 'Absolute tolerance of currents (A)' },
    { name: 'gmin',     type: 'number', 'default': 1e-12, description: 'Small conductance from every node to ground (prevents floating nodes)' },
    { name: 'maxiter',  type: 'int',    'default': 50,    description: 'Maximum Newton iterations per point' },
    { name: 'vlimit',   type: 'number', 'default': 1.0,   description: 'Maximum change of a node voltage per step in damped mode' },
    { name: 'progress', type: 'bool',   'default': false, description: 'True prints a progress bar (or a function fn(fraction, t))' },
    { name: 'uic',      type: 'bool',   'default': false, description: 'True starts the transient from a zero state without a DC operating point (capacitors empty, inductors without current)' },
    { name: 'adaptive', type: 'bool',   'default': false, description: 'Automatic variable time step; step then only sets the spacing of the output points' },
    { name: 'lte',      type: 'number', 'default': 1e-4,  description: 'Relative local-error tolerance (with adaptive)' },
    { name: 'lte_abs',  type: 'number', 'default': 1e-6,  description: 'Absolute local-error tolerance in volts (with adaptive)' },
    { name: 'max_step', type: 'optional', 'default': null, defaultText: 'None (20×step)', description: 'Largest internal step (with adaptive); lower it if a pulse is shorter than the step' },
    { name: 'order',    type: 'order',  'default': 1,     description: '1 = backward Euler (robust), 2 = BDF2 (more accurate, less stable)' },
    { name: 'func',     type: 'choice', 'default': 'db & phase',  choices: ['db & phase', 'mag & phase', 'db', 'mag', 'phase'], description: 'AC results are drawn in dB & phase by default' },
    { name: 'second_sweep', type: 'bool', 'default': false, description: 'Use a second sweep for analysis' }
];

function fOptionsDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;
    selfDialog.rows = [];          // { def, input, tr, resetBtn }

    var isDragging = false;
    var dragStartX = 0, dragStartY = 0, dialogStartX = 0, dialogStartY = 0;
    var bodyEl;

    // ---- helpers ----------------------------------------------------------------------------
    function esc(t) {
        return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function same(a, b) {
        if (a === b) return true;
        if (typeof a === 'number' && typeof b === 'number')
            return Math.abs(a - b) <= 1e-12 * Math.max(Math.abs(a), Math.abs(b));
        return false;
    }
    function defaultText(d) {
        if (d.defaultText) return d.defaultText;
        if (d.type === 'bool') return d['default'] ? 'True' : 'False';
        return String(d['default']);
    }
    // number typed by the user ("1e-6", "1u", "2m" ...) -> number, NaN when unreadable
    var PREFIX = { T: 1e12, G: 1e9, M: 1e6, Meg: 1e6, MEG: 1e6, meg: 1e6, k: 1e3, K: 1e3,
                   m: 1e-3, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 };
    function parseNumber(text) {
        var m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([a-zA-Zµμ]*)$/.exec(String(text).trim());
        if (!m) return NaN;
        var n = parseFloat(m[1]);
        if (m[2] === '') return n;
        return Object.prototype.hasOwnProperty.call(PREFIX, m[2]) ? n * PREFIX[m[2]] : NaN;
    }
    // value of a row: number / boolean / null (None), or undefined when invalid
    function rowValue(row) {
        var d = row.def, v = row.input.value;
        switch (d.type) {
            case 'bool':  return v === 'True';
            case 'order': return parseInt(v, 10);
            case 'choice': return String(v);
            case 'int': {
                var n = parseNumber(v);
                return (isNaN(n) || n < 1 || Math.floor(n) !== n) ? undefined : n;
            }
            case 'optional': {
                if (String(v).trim() === '' || /^none$/i.test(String(v).trim())) return null;
                var o = parseNumber(v);
                return (isNaN(o) || o <= 0) ? undefined : o;
            }
            default: {
                var x = parseNumber(v);
                return isNaN(x) ? undefined : x;
            }
        }
    }
    function pyLiteral(v) {
        if (v === true) return 'True';
        if (v === false) return 'False';
        if (v === null) return 'None';
        if (typeof v === 'string') return "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
        return String(v);
    }

    // ---- CSS / HTML -------------------------------------------------------------------------
    this.injectCSS = function() {
        var css = `
#optDialog {
    position: fixed; top: 50px; left: 50%; transform: translateX(-50%);
    width: 780px; max-width: 95vw; max-height: 90vh;
    background: var(--vscode-editor-background, #fff); border: 1px solid var(--vscode-panel-border, #ccc);
    border-radius: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.28); z-index: 3000;
    display: none; flex-direction: column; overflow: hidden;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, sans-serif);
    font-size: var(--vscode-font-size, 13px); color: var(--vscode-editor-foreground, #333);
}
#optDialog.visible { display: flex; }
#optOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 2999; display: none; }
#optOverlay.visible { display: block; }
#optHeader {
    display: flex; justify-content: space-between; align-items: center; padding: 10px 14px;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-titleBar-activeBackground, var(--vscode-editor-inactiveSelectionBackground, #fafafa));
    cursor: move; user-select: none; flex-shrink: 0;
}
#optTitle { font-size: 14px; font-weight: 600; }
#optClose {
    background: transparent; border: none; font-size: 20px; cursor: pointer; padding: 0 4px;
    color: var(--vscode-icon-foreground, #666); line-height: 1; border-radius: 3px;
}
#optClose:hover { background: var(--vscode-list-hoverBackground, #e0e0e0); }
#optBody { flex: 1; overflow: auto; padding: 10px 14px; }
.opt-table { width: 100%; border-collapse: collapse; color: inherit; font-size: inherit; }
.opt-table th {
    text-align: left; font-size: 11px; font-weight: 600; padding: 4px 6px; opacity: 0.75;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
}
.opt-table td { padding: 3px 6px; border-bottom: 1px solid var(--vscode-panel-border, #eee); vertical-align: middle; }
.opt-table tr.changed td { background: var(--vscode-editor-lineHighlightBackground, rgba(33,150,243,0.10)); }
.opt-name { font-family: 'Consolas', monospace; font-weight: 600; white-space: nowrap; }
.opt-default { font-family: 'Consolas', monospace; white-space: nowrap; opacity: 0.8; }
.opt-desc { opacity: 0.8; }
.opt-input {
    width: 110px; padding: 4px 6px; font-family: 'Consolas', monospace; font-size: 12px; box-sizing: border-box;
    background: var(--vscode-input-background, #fff); color: var(--vscode-input-foreground, #333);
    border: 1px solid var(--vscode-input-border, #ccc); border-radius: 3px; outline: none;
}
.opt-input:focus { border-color: var(--vscode-focusBorder, #2196F3); }
.opt-input.invalid { border-color: #e53935; background: rgba(229,57,53,0.12); }
.opt-reset {
    background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 0 4px;
    color: var(--vscode-icon-foreground, #666); visibility: hidden;
}
tr.changed .opt-reset { visibility: visible; }
.opt-buttons {
    display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding: 12px 14px;
    border-top: 1px solid var(--vscode-panel-border, #ddd); flex-shrink: 0;
}
#optInfo { margin-right: auto; font-size: 12px; opacity: 0.75; }
.opt-btn {
    padding: 8px 24px; border: 1px solid var(--vscode-button-secondaryBackground, #ccc); border-radius: 4px;
    font-size: 13px; cursor: pointer; font-weight: 600;
    background: var(--vscode-button-secondaryBackground, #f0f0f0); color: var(--vscode-button-secondaryForeground, #333);
}
.opt-btn:hover:not(:disabled) { background: var(--vscode-button-secondaryHoverBackground, #e0e0e0); }
.opt-btn-primary { background: var(--vscode-button-background, #2196F3); border-color: var(--vscode-button-border, #1976D2); color: var(--vscode-button-foreground, #fff); }
.opt-btn-primary:hover:not(:disabled) { background: var(--vscode-button-hoverBackground, #1976D2); }
.opt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
    };

    this.injectHTML = function() {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="optOverlay"></div>
        <div id="optDialog">
            <div id="optHeader">
                <span id="optTitle">Options</span>
                <button id="optClose" title="Close">×</button>
            </div>
            <div id="optBody"></div>
            <div class="opt-buttons">
                <span id="optInfo"></span>
                <button class="opt-btn" id="optBtnReset">Reset all</button>
                <button class="opt-btn" id="optBtnCancel">Cancel</button>
                <button class="opt-btn opt-btn-primary" id="optBtnOk">OK</button>
            </div>
        </div>`);
    };

    // ---- show / hide ------------------------------------------------------------------------
    this.show = function() {
        document.getElementById('optDialog').classList.add('visible');
        document.getElementById('optOverlay').classList.add('visible');
        selfDialog.isVisible = true;
        document.addEventListener('keydown', selfDialog.keyHandler);
    };
    this.hide = function() {
        document.getElementById('optDialog').classList.remove('visible');
        document.getElementById('optOverlay').classList.remove('visible');
        selfDialog.isVisible = false;
        document.removeEventListener('keydown', selfDialog.keyHandler);
    };
    this.keyHandler = function(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); selfDialog.cancelDialog(); }
        else if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('opt-input')) {
            e.preventDefault(); selfDialog.submitResult();
        }
    };
    this.setCallbacks = function(onSubmit, onCancel) {
        selfDialog.onSubmit = onSubmit || null;
        selfDialog.onCancel = onCancel || null;
    };

    // ---- content ----------------------------------------------------------------------------
    // data: { options: [ { name, type, default, value, description } ] }  (see drawing.getOptions)
    this.initData = function(data) {
        var list = (data && data.options) || [];
        selfDialog.rows = [];
        bodyEl.innerHTML = '';
        var table = document.createElement('table');
        table.className = 'opt-table';
        table.innerHTML = '<thead><tr><th>Option</th><th>Value</th><th>Default</th><th>Description</th><th></th></tr></thead>';
        var tbody = document.createElement('tbody');
        list.forEach(function(d) {
            var tr = document.createElement('tr');
            var control;
            if (d.type === 'bool') {
                control = '<select class="opt-input"><option>False</option><option>True</option></select>';
            } else if (d.type === 'order') {
                control = '<select class="opt-input"><option>1</option><option>2</option></select>';
            } else if (d.type === 'choice') {
                var choices = d.choices;
                if (!choices) {
                    PYAMS_OPTIONS.forEach(function(o) { if (o.name === d.name) choices = o.choices; });
                }
                control = '<select class="opt-input">' + (choices || []).map(function(c) {
                    return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
                }).join('') + '</select>';
            } else {
                control = '<input class="opt-input" spellcheck="false">';
            }
            tr.innerHTML = '<td class="opt-name">' + esc(d.name) + '</td>' +
                '<td>' + control + '</td>' +
                '<td class="opt-default">' + esc(defaultText(d)) + '</td>' +
                '<td class="opt-desc">' + esc(d.description) + '</td>' +
                '<td><button class="opt-reset" title="Reset to default">↺</button></td>';
            var row = { def: d, tr: tr, input: tr.querySelector('.opt-input'), resetBtn: tr.querySelector('button') };
            selfDialog.setRowValue(row, d.value === undefined ? d['default'] : d.value);
            row.input.addEventListener('input', selfDialog.refreshState);
            row.input.addEventListener('change', selfDialog.refreshState);
            row.resetBtn.addEventListener('click', function() {
                selfDialog.setRowValue(row, d['default']);
                selfDialog.refreshState();
            });
            selfDialog.rows.push(row);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        bodyEl.appendChild(table);
        document.getElementById('optBtnOk').disabled = false;
        selfDialog.refreshState();
    };

    this.setRowValue = function(row, v) {
        var d = row.def;
        if (d.type === 'bool')          row.input.value = v ? 'True' : 'False';
        else if (d.type === 'order')    row.input.value = String(v === 2 ? 2 : 1);
        else if (d.type === 'choice')   row.input.value = String(v);
        else if (d.type === 'optional') row.input.value = (v === null || v === undefined) ? '' : String(v);
        else                            row.input.value = String(v);
        if (d.type === 'optional') row.input.placeholder = 'None';
    };

    function isChanged(row, v) { return !same(v, row.def['default']); }

    this.refreshState = function() {
        var invalid = 0, changed = 0;
        selfDialog.rows.forEach(function(row) {
            var v = rowValue(row);
            var bad = (v === undefined);
            row.input.classList.toggle('invalid', bad);
            if (bad) invalid++;
            var ch = !bad && isChanged(row, v);
            row.tr.classList.toggle('changed', ch);
            if (ch) changed++;
        });
        document.getElementById('optBtnOk').disabled = invalid > 0;
        document.getElementById('optInfo').textContent = invalid > 0 ? (invalid + ' invalid value(s)')
            : (changed + ' changed value(s)');
    };

    // Only the options that differ from their default
    this.collectResult = function() {
        var options = {}, parts = [];
        selfDialog.rows.forEach(function(row) {
            var v = rowValue(row);
            if (v === undefined || !isChanged(row, v)) return;
            options[row.def.name] = v;
            parts.push(row.def.name + '=' + pyLiteral(v));
        });
        return { options: options, python: parts.join(', ') };
    };

    this.submitResult = function() {
        var okBtn = document.getElementById('optBtnOk');
        if (okBtn && okBtn.disabled) return null;
        var result = selfDialog.collectResult();
        var cb = selfDialog.onSubmit;
        selfDialog.hide();
        if (typeof cb === 'function') cb(result);
        return result;
    };

    this.cancelDialog = function() {
        var cb = selfDialog.onCancel;
        selfDialog.hide();
        if (typeof cb === 'function') cb();
        return null;
    };

    this.init = function() {
        bodyEl = document.getElementById('optBody');
        var dialog = document.getElementById('optDialog');
        var header = document.getElementById('optHeader');
        var closeBtn = document.getElementById('optClose');
        closeBtn.addEventListener('click', function(e) { e.stopPropagation(); selfDialog.cancelDialog(); });
        document.getElementById('optOverlay').addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); });
        document.getElementById('optBtnCancel').addEventListener('click', function() { selfDialog.cancelDialog(); });
        document.getElementById('optBtnOk').addEventListener('click', function() { selfDialog.submitResult(); });
        document.getElementById('optBtnReset').addEventListener('click', function() {
            selfDialog.rows.forEach(function(row) { selfDialog.setRowValue(row, row.def['default']); });
            selfDialog.refreshState();
        });

        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn) return;
            isDragging = true;
            var rect = dialog.getBoundingClientRect();
            dialogStartX = rect.left; dialogStartY = rect.top;
            dragStartX = e.clientX; dragStartY = e.clientY;
            dialog.style.transform = 'none';
            dialog.style.left = dialogStartX + 'px'; dialog.style.top = dialogStartY + 'px';
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var x = dialogStartX + (e.clientX - dragStartX);
            var y = dialogStartY + (e.clientY - dragStartY);
            x = Math.max(0, Math.min(x, window.innerWidth - dialog.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - dialog.offsetHeight));
            dialog.style.left = x + 'px'; dialog.style.top = y + 'px';
        });
        document.addEventListener('mouseup', function() { isDragging = false; });
    };

    this.injectCSS();
    this.injectHTML();
    this.init();
}

var optionsDialog;
