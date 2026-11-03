/*
#--------------------------------------------------------------------------------------------------
Name:        pyamsCircuitDialog.js
Author:      d.fathi
Created:     11/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Read-only view of the circuit as the Python code read by the pyams library
             (models, elements, parameters). It is NOT a SPICE netlist.
             The code is shown with Python syntax highlighting and line numbers.
#---------------------------------------------------------------------------------------------------
Usage:
    var code = generateCodePyofCircuit();
    drawing.getPyAMSCircuitEditor(code, function (text) {...}, function () {...});

    code     the text produced by generateCodePyofCircuit() (a string)
    onSubmit called with the displayed code when the user presses "Copy"
    onCancel called when the dialog is closed
#---------------------------------------------------------------------------------------------------
*/

//------------------ Class for the PyAMS circuit (Python) dialog ------------------------------//
function fpyamsCircuitDialog(self) {
    var selfDialog = this;

    // ---- state -----------------------------------------------------------------------------
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;
    selfDialog.code = '';            // text shown in the dialog

    var isDragging = false;
    var dragStartX = 0, dragStartY = 0, dialogStartX = 0, dialogStartY = 0;
    var dialogEl = null, gutterEl = null, codeEl = null, statusEl = null;

    // ---- helpers ----------------------------------------------------------------------------
    function esc(t) {
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ============================================================================================
    //  Format the text produced by generateCodePyofCircuit() so it reads like normal Python.
    //  Only the layout changes, the circuit stays the same:
    //    - one "from pyams.models import A, B" line instead of one import per element
    //    - no ';' at the end of the lines
    //    - parameter strings without the extra spaces, empty setParams() lines are left out
    //    - comments that name each section
    // ============================================================================================
    this.formatCode = function (raw) {
        var lines = String(raw == null ? '' : raw).split(/\r?\n/);
        var models = [], elements = [], params = [], other = [];

        lines.forEach(function (line) {
            var s = line.trim().replace(/;+\s*$/, '');
            if (s === '') return;

            var m = /^from\s+pyams\.models\s+import\s+(.+)$/.exec(s);
            if (m) {
                m[1].split(',').forEach(function (name) {
                    name = name.trim();
                    if (name && models.indexOf(name) < 0) models.push(name);
                });
                return;
            }

            m = /^([A-Za-z_]\w*)\.setParams\(\s*(["'])([\s\S]*)\2\s*\)$/.exec(s);
            if (m) {
                var text = m[3].replace(/\s+/g, ' ').trim();
                if (text !== '') params.push(m[1] + '.setParams(' + m[2] + text + m[2] + ')');
                return;
            }

            if (/^[A-Za-z_]\w*\s*=\s*[A-Za-z_]\w*\(.*\)$/.test(s)) { elements.push(s); return; }
            other.push(s);                       // anything else is kept as it is
        });

        var out = [];
        if (models.length) {
            out.push('# Models used by the circuit');
            out.push('from pyams.models import ' + models.join(', '));
            out.push('');
        }
        if (elements.length) {
            out.push('# Elements: Model(node, node, ...)');
            out = out.concat(elements);
            out.push('');
        }
        if (params.length) {
            out.push('# Parameters of the elements');
            out = out.concat(params);
            out.push('');
        }
        if (other.length) out = out.concat(other, ['']);

        while (out.length && out[out.length - 1] === '') out.pop();
        return out.join('\n');
    };

    // ============================================================================================
    //  Python syntax highlighting (one pass, so the colours can never overlap)
    // ============================================================================================
    var KEYWORDS = ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
        'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
        'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
    var CONSTANTS = ['True', 'False', 'None'];
    var BUILTINS = ['print', 'len', 'range', 'int', 'float', 'str', 'list', 'dict', 'set', 'tuple', 'bool',
        'abs', 'min', 'max', 'sum', 'zip', 'enumerate', 'open', 'type', 'isinstance', 'sorted', 'round'];

    var TOKEN_RE = new RegExp([
        '(#[^\\n]*)',                                                                  // 1 comment
        '((?:[rRbBfFuU]{1,2})?(?:"""[\\s\\S]*?(?:"""|$)|\'\'\'[\\s\\S]*?(?:\'\'\'|$)|' +
            '"(?:[^"\\\\\\n]|\\\\.)*"?|\'(?:[^\'\\\\\\n]|\\\\.)*\'?))',                  // 2 string
        '(@[A-Za-z_][\\w.]*)',                                                         // 3 decorator
        '(\\b(?:0[xX][0-9a-fA-F_]+|\\d[\\d_]*\\.?\\d*(?:[eE][+-]?\\d+)?j?)\\b|' +
            '\\.\\d+(?:[eE][+-]?\\d+)?)',                                              // 4 number
        '([A-Za-z_]\\w*)'                                                              // 5 name
    ].join('|'), 'g');

    this.highlightCode = function (code) {
        var html = '', last = 0, prevWord = '', inImport = false, m;
        TOKEN_RE.lastIndex = 0;

        function span(cls, text) { return '<span class="pcd-' + cls + '">' + esc(text) + '</span>'; }

        while ((m = TOKEN_RE.exec(code)) !== null) {
            if (m[0] === '') { TOKEN_RE.lastIndex++; continue; }
            var gap = code.substring(last, m.index);
            if (gap.indexOf('\n') >= 0) { inImport = false; prevWord = ''; }     // a new line starts
            html += esc(gap);
            last = m.index + m[0].length;

            if (m[1] !== undefined) { html += span('comment', m[0]); prevWord = ''; }
            else if (m[2] !== undefined) { html += span('string', m[0]); prevWord = ''; }
            else if (m[3] !== undefined) { html += span('decorator', m[0]); prevWord = ''; }
            else if (m[4] !== undefined) { html += span('number', m[0]); prevWord = ''; }
            else {
                var w = m[0];
                var after = code.substring(last).match(/^[ \t]*(.)?/)[1];
                var before = m.index > 0 ? code.charAt(m.index - 1) : '';
                if (KEYWORDS.indexOf(w) >= 0) {
                    html += span('keyword', w);
                    if (w === 'import') inImport = true;
                }
                else if (CONSTANTS.indexOf(w) >= 0) html += span('constant', w);
                else if (w === 'self' || w === 'cls') html += span('self', w);
                else if (prevWord === 'def') html += span('function', w);
                else if (prevWord === 'class') html += span('class', w);
                else if (after === '(' && before === '.') html += span('function', w);      // object.method(
                else if (after === '(' && /^[A-Z]/.test(w)) html += span('class', w);       // Resistor(
                else if (after === '(' && BUILTINS.indexOf(w) >= 0) html += span('builtin', w);
                else if (after === '(') html += span('function', w);
                else if (inImport && /^[A-Z]/.test(w)) html += span('class', w);            // from pyams.models import Resistor
                else html += esc(w);
                prevWord = w;
            }
        }
        html += esc(code.substring(last));
        return html;
    };

    // ---- CSS / HTML -------------------------------------------------------------------------
    this.injectCSS = function () {
        var css = `
#pyamsCircuitDialog {
    position: fixed; top: 50px; left: 50%; transform: translateX(-50%);
    width: 760px; height: 540px; min-width: 380px; min-height: 220px; max-width: 96vw; max-height: 90vh;
    resize: both;
    background: var(--vscode-editor-background, #1e1e1e);
    border: 1px solid var(--vscode-editorWidget-border, #454545);
    border-radius: 6px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 3000; display: none; flex-direction: column; overflow: hidden;
    font-family: var(--vscode-font-family, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif);
    font-size: 13px; color: var(--vscode-editor-foreground, #d4d4d4);
}
#pyamsCircuitDialog.visible { display: flex; }
#pyamsCircuitDialogOverlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 2999; display: none; }
#pyamsCircuitDialogOverlay.visible { display: block; }

#pcdHeader {
    display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; flex-shrink: 0;
    border-bottom: 1px solid var(--vscode-panel-border, #2b2b2b);
    background: var(--vscode-titleBar-activeBackground, #3c3c3c);
    cursor: move; user-select: none;
}
#pcdTitle { display: flex; align-items: center; gap: 8px; color: var(--vscode-titleBar-activeForeground, #cccccc); }
.pcd-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; color: #fff; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; }
.pcd-badge.py { background: #3572a5; }
.pcd-badge.ro { background: #6b6b6b; }
#pcdClose {
    background: transparent; border: none; font-size: 18px; cursor: pointer; padding: 2px 6px; line-height: 1;
    color: var(--vscode-titleBar-activeForeground, #cccccc); border-radius: 3px;
}
#pcdClose:hover { background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,.1)); color: #fff; }

#pcdScroll {
    flex: 1; min-height: 0; overflow: auto; display: flex; align-items: flex-start;
    background: var(--vscode-editor-background, #1e1e1e);
}
#pcdGutter {
    position: sticky; left: 0; z-index: 1; flex-shrink: 0; min-width: 48px; box-sizing: border-box;
    padding: 10px 0; text-align: right; user-select: none;
    background: var(--vscode-editor-background, #1e1e1e);
    border-right: 1px solid var(--vscode-editorGroup-border, #444);
    color: var(--vscode-editorLineNumber-foreground, #858585);
    font-family: Consolas, "Courier New", monospace; font-size: 13px; line-height: 20px;
}
#pcdGutter span { display: block; height: 20px; padding: 0 10px 0 12px; }
#pcdCode {
    margin: 0; padding: 10px 16px; flex: 1; box-sizing: border-box; min-width: max-content;
    font-family: Consolas, "Courier New", monospace; font-size: 13px; line-height: 20px;
    white-space: pre; tab-size: 4; cursor: text; user-select: text; outline: none;
    color: var(--vscode-editor-foreground, #d4d4d4);
}
#pcdCode.pcd-empty { color: var(--vscode-descriptionForeground, #858585); font-style: italic; }

/* Dark+ colours */
.pcd-keyword   { color: #c586c0; }
.pcd-constant  { color: #569cd6; }
.pcd-self      { color: #9cdcfe; font-style: italic; }
.pcd-string    { color: #ce9178; }
.pcd-number    { color: #b5cea8; }
.pcd-comment   { color: #6a9955; font-style: italic; }
.pcd-function  { color: #dcdcaa; }
.pcd-builtin   { color: #dcdcaa; }
.pcd-class     { color: #4ec9b0; }
.pcd-decorator { color: #dcdcaa; }
/* light themes */
body.vscode-light .pcd-keyword   { color: #af00db; }
body.vscode-light .pcd-constant  { color: #0000ff; }
body.vscode-light .pcd-self      { color: #001080; }
body.vscode-light .pcd-string    { color: #a31515; }
body.vscode-light .pcd-number    { color: #098658; }
body.vscode-light .pcd-comment   { color: #008000; }
body.vscode-light .pcd-function, body.vscode-light .pcd-builtin, body.vscode-light .pcd-decorator { color: #795e26; }
body.vscode-light .pcd-class     { color: #267f99; }

#pcdBar {
    display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-shrink: 0;
    padding: 6px 12px; min-height: 22px;
    background: var(--vscode-statusBar-background, #007acc); color: var(--vscode-statusBar-foreground, #fff);
}
#pcdStatus { font-size: 12px; }
.pcd-btns { display: flex; gap: 8px; }
.pcd-btn {
    padding: 3px 14px; font-size: 12px; cursor: pointer; border-radius: 3px;
    border: 1px solid var(--vscode-button-border, transparent);
    background: var(--vscode-button-secondaryBackground, #3a3d41); color: var(--vscode-button-secondaryForeground, #fff);
}
.pcd-btn:hover { background: var(--vscode-button-secondaryHoverBackground, #45494e); }
.pcd-btn.primary { background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); }
.pcd-btn.primary:hover { background: var(--vscode-button-hoverBackground, #1177bb); }
.pcd-btn:disabled { opacity: .45; cursor: default; }
`;
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
    };

    this.injectHTML = function () {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="pyamsCircuitDialogOverlay"></div>
        <div id="pyamsCircuitDialog">
            <div id="pcdHeader">
                <span id="pcdTitle">PyAMS Circuit
                    <span class="pcd-badge py">Python</span>
                    <span class="pcd-badge ro">Read only</span>
                </span>
                <button id="pcdClose" title="Close (Esc)">×</button>
            </div>
            <div id="pcdScroll">
                <div id="pcdGutter"></div>
                <pre id="pcdCode" tabindex="0"></pre>
            </div>
            <div id="pcdBar">
                <span id="pcdStatus">Ready</span>
                <div class="pcd-btns">
                    <button class="pcd-btn primary" id="pcdBtnCopy" title="Copy the code">Copy</button>
                    <button class="pcd-btn" id="pcdBtnClose">Close</button>
                </div>
            </div>
        </div>`);
    };

    // ---- show / hide ------------------------------------------------------------------------
    this.show = function () {
        dialogEl.classList.add('visible');
        document.getElementById('pyamsCircuitDialogOverlay').classList.add('visible');
        selfDialog.isVisible = true;
        document.addEventListener('keydown', selfDialog.keyHandler, true);
        setTimeout(function () { if (codeEl) codeEl.focus(); }, 50);
    };
    this.hide = function () {
        dialogEl.classList.remove('visible');
        document.getElementById('pyamsCircuitDialogOverlay').classList.remove('visible');
        selfDialog.isVisible = false;
        document.removeEventListener('keydown', selfDialog.keyHandler, true);
    };
    this.keyHandler = function (e) {
        if (e.key === 'Escape') {
            e.preventDefault(); e.stopPropagation(); selfDialog.cancelDialog();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault();                            // select only the code, not the whole page
            var r = document.createRange(); r.selectNodeContents(codeEl);
            var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        }
    };
    this.setCallbacks = function (onSubmit, onCancel) {
        selfDialog.onSubmit = onSubmit || null;
        selfDialog.onCancel = onCancel || null;
    };

    // ---- content ----------------------------------------------------------------------------
    // data: the text of generateCodePyofCircuit()  (an object { code: '...' } is accepted too)
    this.initData = function (data) {
        var raw = (data && typeof data === 'object') ? (data.code || data.python || '') : data;
        selfDialog.code = selfDialog.formatCode(raw);

        var text = selfDialog.code;
        var n = text === '' ? 0 : text.split('\n').length;

        codeEl.classList.toggle('pcd-empty', text === '');
        document.getElementById('pcdBtnCopy').disabled = (text === '');
        if (text === '') {
            codeEl.textContent = '# The circuit has no elements yet';
            gutterEl.innerHTML = '<span>1</span>';
        } else {
            codeEl.innerHTML = selfDialog.highlightCode(text);
            var nums = '';
            for (var i = 1; i <= n; i++) nums += '<span>' + i + '</span>';
            gutterEl.innerHTML = nums;
        }

        var elements = text === '' ? 0 : (text.match(/^[A-Za-z_]\w*\s*=\s*[A-Za-z_]\w*\(/gm) || []).length;
        selfDialog.setStatus(elements + ' element' + (elements === 1 ? '' : 's') + '  ·  ' + n + ' line' + (n === 1 ? '' : 's'));
        document.getElementById('pcdScroll').scrollTop = 0;
        document.getElementById('pcdScroll').scrollLeft = 0;
    };

    this.setStatus = function (msg) { statusEl.textContent = msg; };

    // ---- copy -------------------------------------------------------------------------------
    this.copyCode = function () {
        var text = selfDialog.code;
        var done = function (ok) {
            var base = statusEl.getAttribute('data-base') || statusEl.textContent;
            statusEl.setAttribute('data-base', base);
            selfDialog.setStatus(ok ? 'Copied to the clipboard' : 'Copy failed: select the text and use Ctrl+C');
            setTimeout(function () { selfDialog.setStatus(base); statusEl.removeAttribute('data-base'); }, 1800);
            if (ok && typeof selfDialog.onSubmit === 'function') selfDialog.onSubmit(text);
        };
        var fallback = function () {
            var ta = document.createElement('textarea');
            ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
            document.body.appendChild(ta); ta.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            document.body.removeChild(ta);
            done(ok);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
        } else { fallback(); }
    };

    this.cancelDialog = function () {
        var cb = selfDialog.onCancel;
        selfDialog.hide();
        if (typeof cb === 'function') cb();
        return null;
    };

    // ---- init -------------------------------------------------------------------------------
    this.init = function () {
        dialogEl = document.getElementById('pyamsCircuitDialog');
        gutterEl = document.getElementById('pcdGutter');
        codeEl = document.getElementById('pcdCode');
        statusEl = document.getElementById('pcdStatus');
        var header = document.getElementById('pcdHeader');
        var closeBtn = document.getElementById('pcdClose');

        closeBtn.addEventListener('click', function (e) { e.stopPropagation(); selfDialog.cancelDialog(); });
        document.getElementById('pcdBtnClose').addEventListener('click', function () { selfDialog.cancelDialog(); });
        document.getElementById('pcdBtnCopy').addEventListener('click', selfDialog.copyCode);
        document.getElementById('pyamsCircuitDialogOverlay').addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });

        header.addEventListener('mousedown', function (e) {
            if (e.target === closeBtn) return;
            isDragging = true;
            var rect = dialogEl.getBoundingClientRect();
            dialogStartX = rect.left; dialogStartY = rect.top;
            dragStartX = e.clientX; dragStartY = e.clientY;
            dialogEl.style.transform = 'none';
            dialogEl.style.left = dialogStartX + 'px'; dialogEl.style.top = dialogStartY + 'px';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            var x = dialogStartX + (e.clientX - dragStartX);
            var y = dialogStartY + (e.clientY - dragStartY);
            x = Math.max(0, Math.min(x, window.innerWidth - dialogEl.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - dialogEl.offsetHeight));
            dialogEl.style.left = x + 'px'; dialogEl.style.top = y + 'px';
        });
        document.addEventListener('mouseup', function () {
            if (isDragging) { isDragging = false; document.body.style.userSelect = ''; }
        });
    };

    this.injectCSS();
    this.injectHTML();
    this.init();
}

var pyamsCircuitDialog;
