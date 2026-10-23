/*
#--------------------------------------------------------------------------------------------------
Name:        listParametersDialog.js
Author:      d.fathi
Created:     21/10/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Shows every parameter returned by drawing.getListParameter(code) and lets the user
             change the values. On OK only the values that differ from their default are returned.

Usage:
    drawing.getListParameter(code).then(function (data) {
        drawing.getParametersDialog(data, function (result) {
            console.log(JSON.stringify(result, null, 2));
        }, function () { console.log('Cancelled'); });
    });

Result given to onSubmit:
    {
      models: [ { name: 'Rc1', class: 'Resistor', setParams: 'R=2200Ω',
                  changed: [ { name: 'R', value: 2200, default: 1000, unit: 'Ω', description: 'Resistance' } ] } ],
      values: { Rc1: { R: 2200 } }
    }
Models without any changed value are not listed.
*/
function fListParametersDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;
    selfDialog.data = null;
    selfDialog.rows = [];          // { model, param, input, unit, resetBtn, tr }

    var isDragging = false;
    var dragStartX = 0, dragStartY = 0, dialogStartX = 0, dialogStartY = 0;
    var bodyEl;

    // ---- value parsing (same rules as pyams.lib._parse_value) -------------------------------
    var PREFIXES = { '': 1, 'T': 1e12, 'G': 1e9, 'M': 1e6, 'Meg': 1e6, 'MEG': 1e6, 'meg': 1e6,
                     'k': 1e3, 'K': 1e3, 'm': 1e-3, 'u': 1e-6, 'µ': 1e-6, 'μ': 1e-6,
                     'n': 1e-9, 'p': 1e-12, 'f': 1e-15 };
    function canonUnit(t) {
        return String(t).normalize('NFKC').trim()
            .replace(/ohms?$/i, 'Ω').replace(/deg$/i, '°').replace(/sec(onds?)?$/i, 's');
    }
    // '1KΩ' -> 1000 ; returns NaN when the text cannot be read
    function parseValue(text, unit) {
        var m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*(.*)$/.exec(String(text).normalize('NFKC').trim());
        if (!m) return NaN;
        var number = parseFloat(m[1]);
        var suffix = canonUnit(m[2]);
        var unitC = canonUnit(unit || '');
        if (suffix === '') return number;
        if (unitC && suffix === unitC) return number;
        if (unitC && suffix.length > unitC.length && suffix.slice(-unitC.length) === unitC) {
            var prefix = suffix.slice(0, suffix.length - unitC.length);
            if (Object.prototype.hasOwnProperty.call(PREFIXES, prefix)) return number * PREFIXES[prefix];
            return NaN;
        }
        if (Object.prototype.hasOwnProperty.call(PREFIXES, suffix)) return number * PREFIXES[suffix];
        return NaN;
    }
    function sameValue(a, b) {
        if (a === b) return true;
        return Math.abs(a - b) <= 1e-12 * Math.max(Math.abs(a), Math.abs(b));
    }
    function fmt(v) {
        return (typeof v === 'number') ? String(v) : String(v);
    }
    function esc(t) {
        return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ---- CSS --------------------------------------------------------------------------------
    this.injectCSS = function() {
        var css = `
#listParamsDialog {
    position: fixed; top: 50px; left: 50%; transform: translateX(-50%);
    width: 720px; max-width: 94vw; max-height: 88vh;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #fff));
    border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border, #ccc));
    border-radius: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.28); z-index: 3000;
    display: none; flex-direction: column; overflow: hidden;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-editor-foreground, #333);
}
#listParamsDialog.visible { display: flex; }
#listParamsOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 2999; display: none; }
#listParamsOverlay.visible { display: block; }
#listParamsHeader {
    display: flex; justify-content: space-between; align-items: center; padding: 10px 14px;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-titleBar-activeBackground, var(--vscode-editor-inactiveSelectionBackground, #fafafa));
    cursor: move; user-select: none; flex-shrink: 0;
}
#listParamsTitle { font-size: 14px; font-weight: 600; }
#listParamsClose {
    background: transparent; border: none; font-size: 20px; cursor: pointer; padding: 0 4px;
    color: var(--vscode-icon-foreground, #666); line-height: 1; border-radius: 3px;
}
#listParamsClose:hover { background: var(--vscode-list-hoverBackground, #e0e0e0); }
#listParamsBody { flex: 1; overflow: auto; padding: 10px 14px; min-height: 120px; }
.lpd-model { margin-bottom: 14px; }
.lpd-model-title { font-weight: 600; margin-bottom: 2px; }
.lpd-model-title .lpd-class { color: var(--vscode-textLink-foreground, #2196F3); margin-left: 6px; font-weight: 400; }
.lpd-model-sub { font-size: 11px; opacity: 0.7; margin-bottom: 6px; font-family: 'Consolas', monospace; }
.lpd-table { width: 100%; border-collapse: collapse; color: inherit; font-size: inherit; }
.lpd-table th {
    text-align: left; font-size: 11px; font-weight: 600; padding: 4px 6px; opacity: 0.75;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
}
.lpd-table td { padding: 3px 6px; border-bottom: 1px solid var(--vscode-panel-border, #eee); vertical-align: middle; }
.lpd-table tr.changed td { background: var(--vscode-editor-lineHighlightBackground, rgba(33,150,243,0.10)); }
.lpd-name { font-family: 'Consolas', monospace; font-weight: 600; white-space: nowrap; }
.lpd-default, .lpd-unit { font-family: 'Consolas', monospace; white-space: nowrap; opacity: 0.8; }
.lpd-desc { opacity: 0.8; }
.lpd-input {
    width: 130px; padding: 4px 6px; font-family: 'Consolas', monospace; font-size: 12px;
    background: var(--vscode-input-background, #fff); color: var(--vscode-input-foreground, #333);
    border: 1px solid var(--vscode-input-border, #ccc); border-radius: 3px; outline: none;
}
.lpd-input:focus { border-color: var(--vscode-focusBorder, #2196F3); }
.lpd-input.invalid { border-color: #e53935; background: rgba(229,57,53,0.12); }
.lpd-reset {
    background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 0 4px;
    color: var(--vscode-icon-foreground, #666); visibility: hidden;
}
tr.changed .lpd-reset { visibility: visible; }
.lpd-message { padding: 12px 0; }
.lpd-message.error { color: #e53935; white-space: pre-wrap; font-family: 'Consolas', monospace; font-size: 12px; }
.lpd-buttons {
    display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding: 12px 14px;
    border-top: 1px solid var(--vscode-panel-border, #ddd); flex-shrink: 0;
}
#listParamsInfo { margin-right: auto; font-size: 12px; opacity: 0.75; }
.lpd-btn {
    padding: 8px 24px; border: 1px solid var(--vscode-button-secondaryBackground, #ccc); border-radius: 4px;
    font-size: 13px; cursor: pointer; font-weight: 600;
    background: var(--vscode-button-secondaryBackground, #f0f0f0); color: var(--vscode-button-secondaryForeground, #333);
}
.lpd-btn:hover:not(:disabled) { background: var(--vscode-button-secondaryHoverBackground, #e0e0e0); }
.lpd-btn-primary { background: var(--vscode-button-background, #2196F3); border-color: var(--vscode-button-border, #1976D2); color: var(--vscode-button-foreground, #fff); }
.lpd-btn-primary:hover:not(:disabled) { background: var(--vscode-button-hoverBackground, #1976D2); }
.lpd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
    };

    this.injectHTML = function() {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="listParamsOverlay"></div>
        <div id="listParamsDialog">
            <div id="listParamsHeader">
                <span id="listParamsTitle">Parameters</span>
                <button id="listParamsClose" title="Close">×</button>
            </div>
            <div id="listParamsBody"></div>
            <div class="lpd-buttons">
                <span id="listParamsInfo"></span>
                <button class="lpd-btn" id="listParamsBtnCancel">Cancel</button>
                <button class="lpd-btn lpd-btn-primary" id="listParamsBtnOk">OK</button>
            </div>
        </div>`);
    };

    // ---- show / hide ------------------------------------------------------------------------
    this.show = function() {
        document.getElementById('listParamsDialog').classList.add('visible');
        document.getElementById('listParamsOverlay').classList.add('visible');
        selfDialog.isVisible = true;
        document.addEventListener('keydown', selfDialog.keyHandler);
    };
    this.hide = function() {
        document.getElementById('listParamsDialog').classList.remove('visible');
        document.getElementById('listParamsOverlay').classList.remove('visible');
        selfDialog.isVisible = false;
        document.removeEventListener('keydown', selfDialog.keyHandler);
    };
    this.keyHandler = function(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); selfDialog.cancelDialog(); }
        else if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('lpd-input')) {
            e.preventDefault(); selfDialog.submitResult();
        }
    };
    this.setCallbacks = function(onSubmit, onCancel) {
        selfDialog.onSubmit = onSubmit || null;
        selfDialog.onCancel = onCancel || null;
    };

    // ---- content ----------------------------------------------------------------------------
    // data: the object returned by drawing.getListParameter(code)
    this.initData = function(data) {
        selfDialog.data = data || { models: [] };
        selfDialog.rows = [];
        bodyEl.innerHTML = '';
        var okBtn = document.getElementById('listParamsBtnOk');

        if (selfDialog.data.error) {
            var line = selfDialog.data.line ? '  (line ' + selfDialog.data.line + ')' : '';
            bodyEl.innerHTML = '<div class="lpd-message error">' + esc(selfDialog.data.error + line) + '</div>';
        }
        var models = selfDialog.data.models || [];
        if (!selfDialog.data.error && models.length === 0) {
            bodyEl.innerHTML = '<div class="lpd-message">No model found in the code.</div>';
        }
        models.forEach(function(model) { selfDialog.buildModel(model); });
        if (okBtn) okBtn.disabled = false;
        selfDialog.refreshState();
    };

    this.buildModel = function(model) {
        var wrap = document.createElement('div');
        wrap.className = 'lpd-model';
        var args = (model.init || []).map(function(a) { return a.name + '=' + a.value; }).join(', ');
        wrap.innerHTML = '<div class="lpd-model-title">' + esc(model.name) +
            '<span class="lpd-class">' + esc(model['class']) + '</span></div>' +
            (args ? '<div class="lpd-model-sub">(' + esc(args) + ')</div>' : '');

        var params = model.params || [];
        if (params.length === 0) {
            wrap.insertAdjacentHTML('beforeend', '<div class="lpd-message">No parameters.</div>');
            bodyEl.appendChild(wrap);
            return;
        }
        var table = document.createElement('table');
        table.className = 'lpd-table';
        table.innerHTML = '<thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Default</th><th>Description</th><th></th></tr></thead>';
        var tbody = document.createElement('tbody');
        params.forEach(function(p) {
            var unit = String(p.unit || '').trim();
            var tr = document.createElement('tr');
            tr.innerHTML = '<td class="lpd-name">' + esc(p.name) + '</td>' +
                '<td><input class="lpd-input" spellcheck="false" value="' + esc(fmt(p.value)) + '"></td>' +
                '<td class="lpd-unit">' + esc(unit) + '</td>' +
                '<td class="lpd-default">' + esc(p['default'] == null ? '' : fmt(p['default'])) + '</td>' +
                '<td class="lpd-desc">' + esc(p.description) + '</td>' +
                '<td><button class="lpd-reset" title="Reset to default">↺</button></td>';
            var row = { model: model, param: p, unit: unit, tr: tr,
                        input: tr.querySelector('input'), resetBtn: tr.querySelector('button') };
            row.input.addEventListener('input', selfDialog.refreshState);
            row.resetBtn.addEventListener('click', function() {
                row.input.value = fmt(p['default']);
                selfDialog.refreshState();
            });
            selfDialog.rows.push(row);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        bodyEl.appendChild(wrap);
    };

    // Number typed in a row, or NaN if it cannot be read
    function rowValue(row) { return parseValue(row.input.value, row.unit); }
    function isChanged(row, v) {
        var d = row.param['default'];
        if (typeof d !== 'number') return false;           // no default known -> nothing to compare
        return !sameValue(v, d);
    }

    // Update highlight, invalid marks and the OK button
    this.refreshState = function() {
        var invalid = 0, changed = 0;
        selfDialog.rows.forEach(function(row) {
            var v = rowValue(row);
            var bad = isNaN(v);
            row.input.classList.toggle('invalid', bad);
            if (bad) invalid++;
            var ch = !bad && isChanged(row, v);
            row.tr.classList.toggle('changed', ch);
            if (ch) changed++;
        });
        var okBtn = document.getElementById('listParamsBtnOk');
        if (okBtn) okBtn.disabled = invalid > 0;
        var info = document.getElementById('listParamsInfo');
        if (info) info.textContent = invalid > 0 ? (invalid + ' invalid value(s)')
            : (changed + ' changed value(s)');
    };

    // Collect the values that differ from their default
    this.collectResult = function() {
        var byModel = {};
        var order = [];
        selfDialog.rows.forEach(function(row) {
            var v = rowValue(row);
            if (isNaN(v) || !isChanged(row, v)) return;
            var name = row.model.name;
            if (!byModel[name]) {
                byModel[name] = { name: name, 'class': row.model['class'], setParams: '', changed: [] };
                order.push(name);
            }
            byModel[name].changed.push({
                name: row.param.name,
                value: v,
                'default': row.param['default'],
                unit: row.unit,
                description: row.param.description || ''
            });
        });
        var result = { models: [], values: {} };
        order.forEach(function(name) {
            var m = byModel[name];
            m.setParams = m.changed.map(function(c) { return c.name + '=' + c.value + c.unit; }).join(' ');
            result.models.push(m);
            result.values[name] = {};
            m.changed.forEach(function(c) { result.values[name][c.name] = c.value; });
        });
        return result;
    };

    this.submitResult = function() {
        var okBtn = document.getElementById('listParamsBtnOk');
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
        bodyEl = document.getElementById('listParamsBody');
        var dialog = document.getElementById('listParamsDialog');
        var header = document.getElementById('listParamsHeader');
        var closeBtn = document.getElementById('listParamsClose');
        closeBtn.addEventListener('click', function(e) { e.stopPropagation(); selfDialog.cancelDialog(); });
        document.getElementById('listParamsOverlay').addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); });
        document.getElementById('listParamsBtnCancel').addEventListener('click', function() { selfDialog.cancelDialog(); });
        document.getElementById('listParamsBtnOk').addEventListener('click', function() { selfDialog.submitResult(); });

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
var listParametersDialog;
