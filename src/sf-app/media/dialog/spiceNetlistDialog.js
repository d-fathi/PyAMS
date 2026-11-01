/*
#--------------------------------------------------------------------------------------------------
Name:        spiceNetlistDialog.js
Author:      d.fathi
Created:     11/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Dialog for editing SPICE netlist files with syntax highlighting
#---------------------------------------------------------------------------------------------------
Changelog:
    - SPICE netlist syntax highlighting
    - VSCode Dark+ theme alignment
    - Line numbers with active line highlight
    - Fixed text alignment during typing
    - Fixed duplicate text caused by highlight layer
    - Fixed selection and caret alignment
    - Fixed line number vertical alignment
    - Fixed horizontal scrolling alignment
    - Support for SPICE directives, components, and models
#---------------------------------------------------------------------------------------------------
*/

//------------------ Class for SPICE Netlist Editor Dialog --------------------------------//
function fSpiceNetlistDialog(self) {
    var selfDialog = this;

    // ================================================================
    // Basic state
    // ================================================================
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;

    // ================================================================
    // Editor state
    // ================================================================
    selfDialog.netlistContent = '';
    selfDialog.isLoading = false;
    selfDialog.currentLine = 1;

    // ================================================================
    // Drag state
    // ================================================================
    var isDragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var dialogStartX = 0;
    var dialogStartY = 0;

    // ================================================================
    // DOM references
    // ================================================================
    var codeEditor = null;
    var lineNumbers = null;
    var highlightLayer = null;
    var dialogEl = null;

    // ================================================================
    // Inject CSS
    // ================================================================
    this.injectCSS = function() {
        var css = [
            '/* ============================================================',
            '   SPICE Netlist Editor Dialog',
            '   ============================================================ */',
            '#spiceNetlistDialog {',
            '    position: fixed; top: 50px; left: 50%; transform: translateX(-50%);',
            '    width: 750px; max-width: 95vw; height: 550px; max-height: 85vh;',
            '    background: var(--vscode-editorWidget-background, #1e1e1e);',
            '    border: 1px solid var(--vscode-editorWidget-border, #454545);',
            '    border-radius: 6px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);',
            '    z-index: 3000; display: none; flex-direction: column; overflow: hidden;',
            '    font-family: var(--vscode-font-family, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif);',
            '    font-size: 13px; color: var(--vscode-editor-foreground, #d4d4d4);',
            '}',
            '#spiceNetlistDialog.visible { display: flex; }',
            '#spiceNetlistDialogOverlay {',
            '    position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
            '    background: rgba(0, 0, 0, 0.5); z-index: 2999; display: none;',
            '}',
            '#spiceNetlistDialogOverlay.visible { display: block; }',
            '#spiceNetlistDialogHeader {',
            '    display: flex; justify-content: space-between; align-items: center;',
            '    padding: 8px 12px; border-bottom: 1px solid var(--vscode-panel-border, #2b2b2b);',
            '    background: var(--vscode-titleBar-activeBackground, #3c3c3c);',
            '    cursor: move; user-select: none; flex-shrink: 0;',
            '}',
            '#spiceNetlistDialogTitle {',
            '    font-size: 13px; font-weight: 400; color: var(--vscode-titleBar-activeForeground, #cccccc);',
            '    display: flex; align-items: center; gap: 8px;',
            '}',
            '#spiceNetlistIcon { font-size: 14px; color: #569cd6; }',
            '#spiceNetlistDialogClose {',
            '    background: transparent; border: none; font-size: 18px; cursor: pointer;',
            '    color: var(--vscode-titleBar-activeForeground, #cccccc);',
            '    padding: 2px 6px; line-height: 1; border-radius: 3px; transition: background 0.1s;',
            '}',
            '#spiceNetlistDialogClose:hover {',
            '    background: var(--vscode-toolbar-hoverBackground, rgba(255, 255, 255, 0.1)); color: #ffffff;',
            '}',
            '.sned-editor-container {',
            '    flex: 1; display: flex; overflow: hidden; position: relative;',
            '    background: var(--vscode-editor-background, #1e1e1e);',
            '}',
            '.sned-line-numbers {',
            '    width: 50px; min-width: 50px; background: var(--vscode-editor-background, #1e1e1e);',
            '    border-right: 1px solid var(--vscode-editorGroup-border, #444444);',
            '    padding: 10px 0; margin: 0; text-align: right;',
            '    font-family: "Consolas", "Courier New", monospace; font-size: 13px; font-weight: 400;',
            '    line-height: 20px; letter-spacing: 0; color: var(--vscode-editorLineNumber-foreground, #858585);',
            '    overflow: hidden; flex-shrink: 0; user-select: none; box-sizing: border-box;',
            '}',
            '.sned-line-numbers span {',
            '    display: block; height: 20px; padding: 0 12px 0 0; margin: 0;',
            '    font-family: "Consolas", "Courier New", monospace; font-size: 13px; font-weight: 400;',
            '    line-height: 20px; letter-spacing: 0; box-sizing: border-box;',
            '}',
            '.sned-line-numbers span.current {',
            '    color: var(--vscode-editorLineNumber-activeForeground, #c6c6c6); font-weight: 600;',
            '}',
            '.sned-editor-wrapper {',
            '    flex: 1; min-width: 0; position: relative; overflow: hidden;',
            '    background: var(--vscode-editor-background, #1e1e1e);',
            '}',
            // IMPORTANT: textarea and highlight layer MUST have exactly the same text metrics.
            '.sned-editor-textarea, .sned-highlight-layer {',
            '    position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
            '    padding: 10px 12px; margin: 0; border: 0; box-sizing: border-box;',
            '    font-family: "Consolas", "Courier New", monospace; font-size: 13px; font-weight: 400;',
            '    font-style: normal; font-variant: normal; font-stretch: normal; line-height: 20px;',
            '    letter-spacing: 0; word-spacing: 0; text-indent: 0; text-rendering: auto;',
            '    text-align: left; text-transform: none; font-kerning: none;',
            '    font-feature-settings: normal; font-variant-ligatures: none; white-space: pre;',
            '    word-wrap: normal; overflow-wrap: normal; word-break: normal; tab-size: 4; -moz-tab-size: 4;',
            '}',
            '.sned-highlight-layer {',
            '    z-index: 1; pointer-events: none; overflow: hidden;',
            '    color: var(--vscode-editor-foreground, #d4d4d4); background: transparent; white-space: pre;',
            '}',
            '.sned-editor-textarea {',
            '    z-index: 2; resize: none; outline: none; appearance: none; -webkit-appearance: none;',
            '    background: transparent !important; color: transparent !important;',
            '    -webkit-text-fill-color: transparent !important; text-shadow: none !important;',
            '    caret-color: var(--vscode-editorCursor-foreground, #ffffff); overflow: auto;',
            '    scrollbar-width: thin;',
            '    scrollbar-color: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4)) transparent;',
            '}',
            '.sned-editor-textarea::selection {',
            '    background: var(--vscode-editor-selectionBackground, rgba(38, 79, 120, 0.6)) !important;',
            '    color: transparent !important; -webkit-text-fill-color: transparent !important;',
            '}',
            '.sned-editor-textarea::-webkit-scrollbar { width: 10px; height: 10px; }',
            '.sned-editor-textarea::-webkit-scrollbar-track { background: transparent; }',
            '.sned-editor-textarea::-webkit-scrollbar-thumb {',
            '    background: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4)); border-radius: 5px;',
            '}',
            '.sned-editor-textarea::-webkit-scrollbar-thumb:hover {',
            '    background: var(--vscode-scrollbarSlider-hoverBackground, rgba(100, 100, 100, 0.7));',
            '}',
            '.tok-spice-component { color: #569cd6; font-weight: 600; }',
            '.tok-spice-directive { color: #c586c0; font-weight: 600; }',
            '.tok-spice-comment { color: #6a9955; font-style: italic; }',
            '.tok-spice-continuation { color: #808080; }',
            '.sned-buttons-bar {',
            '    display: flex; justify-content: space-between; align-items: center;',
            '    padding: 6px 12px; background: var(--vscode-statusBar-background, #007acc);',
            '    border-top: 1px solid var(--vscode-statusBar-border, #007acc);',
            '    flex-shrink: 0; gap: 12px; min-height: 22px;',
            '}',
            '.sned-status {',
            '    font-size: 12px; color: var(--vscode-statusBar-foreground, #ffffff);',
            '    font-family: var(--vscode-font-family, "Segoe UI", sans-serif);',
            '    font-weight: 400; letter-spacing: 0.3px; white-space: nowrap;',
            '    overflow: hidden; text-overflow: ellipsis;',
            '}',
            '.sned-status.modified { color: var(--vscode-statusBar-foreground, #ffffff); font-style: italic; }',
            '.sned-btn-group { display: flex; gap: 8px; flex-shrink: 0; }',
            '.sned-btn {',
            '    padding: 4px 12px; border: 1px solid var(--vscode-button-border, #3a3a3a); border-radius: 2px;',
            '    font-size: 12px; cursor: pointer; background: var(--vscode-button-background, #3a3a3a);',
            '    color: var(--vscode-button-foreground, #dddddd); font-weight: 400; transition: background 0.15s;',
            '    font-family: var(--vscode-font-family, "Segoe UI", sans-serif);',
            '}',
            '.sned-btn:hover:not(:disabled) { background: var(--vscode-button-hoverBackground, #4a4a4a); }',
            '.sned-btn-primary {',
            '    background: var(--vscode-button-background, #0e639c); border-color: var(--vscode-button-border, #0e639c);',
            '    color: var(--vscode-button-foreground, #ffffff);',
            '}',
            '.sned-btn-primary:hover:not(:disabled) { background: var(--vscode-button-hoverBackground, #1177bb); }',
            '.sned-btn:disabled { opacity: 0.5; cursor: not-allowed; }'
        ].join('\n');

        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    };

    // ================================================================
    // Inject HTML
    // ================================================================
    this.injectHTML = function() {
        var dialogHTML = [
            '<div id="spiceNetlistDialogOverlay"></div>',
            '<div id="spiceNetlistDialog">',
                '<div id="spiceNetlistDialogHeader">',
                    '<span id="spiceNetlistDialogTitle">',
                        '<span id="spiceNetlistIcon"></span> SPICE Netlist Editor',
                    '</span>',
                    '<button id="spiceNetlistDialogClose" title="Close (Esc)">&times;</button>',
                '</div>',
                '<div class="sned-editor-container">',
                    '<div class="sned-line-numbers" id="snedLineNumbers"></div>',
                    '<div class="sned-editor-wrapper">',
                        '<div class="sned-highlight-layer" id="snedHighlight"></div>',
                        '<textarea class="sned-editor-textarea" id="snedCodeEditor" spellcheck="false" wrap="off" autocorrect="off" autocapitalize="off" autocomplete="off" placeholder="* Enter SPICE netlist here..."></textarea>',
                    '</div>',
                '</div>',
                '<div class="sned-buttons-bar">',
                    '<span class="sned-status" id="snedStatus">Ready</span>',
                    '<div class="sned-btn-group">',
                        '<button class="sned-btn" id="snedBtnCancel">Cancel</button>',
                        '<button class="sned-btn sned-btn-primary" id="snedBtnOk">Apply</button>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('\n');

        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    };

    // ================================================================
    // Cache DOM references
    // ================================================================
    this.cacheDOM = function() {
        codeEditor = document.getElementById('snedCodeEditor');
        lineNumbers = document.getElementById('snedLineNumbers');
        highlightLayer = document.getElementById('snedHighlight');
        dialogEl = document.getElementById('spiceNetlistDialog');
    };

    // ================================================================
    // Toggle / Show / Hide
    // ================================================================
    this.toggle = function() {
        selfDialog.isVisible ? selfDialog.hide() : selfDialog.show();
    };

    this.show = function() {
        var dialog = document.getElementById('spiceNetlistDialog');
        var overlay = document.getElementById('spiceNetlistDialogOverlay');
        if (!dialog) return;

        dialog.classList.add('visible');
        if (overlay) overlay.classList.add('visible');

        selfDialog.isVisible = true;
        selfDialog.bindKeyEvents();

        setTimeout(function() {
            if (codeEditor) {
                codeEditor.focus();
                selfDialog.syncScroll();
                selfDialog.updateLineNumbers();
            }
        }, 50);
    };

    this.hide = function() {
        var dialog = document.getElementById('spiceNetlistDialog');
        var overlay = document.getElementById('spiceNetlistDialogOverlay');

        if (dialog) dialog.classList.remove('visible');
        if (overlay) overlay.classList.remove('visible');

        selfDialog.isVisible = false;
        selfDialog.unbindKeyEvents();
    };

    // ================================================================
    // Keyboard events & Callbacks
    // ================================================================
    this.bindKeyEvents = function() {
        document.addEventListener('keydown', selfDialog.keyHandler);
    };

    this.unbindKeyEvents = function() {
        document.removeEventListener('keydown', selfDialog.keyHandler);
    };

    this.keyHandler = function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            selfDialog.cancelDialog();
            return false;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            selfDialog.submitResult();
            return false;
        }
    };

    this.setCallbacks = function(onSubmit, onCancel) {
        selfDialog.onSubmit = onSubmit || null;
        selfDialog.onCancel = onCancel || null;
    };

    // ================================================================
    // Data & HTML Utilities
    // ================================================================
    this.initData = function(netlist) {
        selfDialog.netlistContent = String(netlist || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        if (codeEditor) {
            codeEditor.placeholder = '* Enter SPICE netlist here...\n* Example:\nR1 1 0 1k\nV1 1 0 DC 5';
            codeEditor.value = selfDialog.netlistContent;
            codeEditor.scrollTop = 0;
            codeEditor.scrollLeft = 0;
        }

        selfDialog.updateLineNumbers();
        selfDialog.updateHighlighting();
        selfDialog.syncScroll();
        selfDialog.updateStatus('Ready');
    };

    this.escapeHTML = function(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    // ================================================================
    // SPICE Syntax Highlighting
    // ================================================================
    this.highlightNetlist = function(code) {
        if (!code) return '';

        var escaped = selfDialog.escapeHTML(code);
        var lines = escaped.split('\n');
        var processedLines = [];

        var directives = [
            'MODEL', 'SUBCKT', 'ENDS', 'END', 'PARAM', 'INCLUDE', 'LIB', 'OPTIONS',
            'TEMP', 'TNOM', 'IC', 'NODESET', 'FUNC', 'CONTROL', 'ENDCONTROL', 'PLOT',
            'PRINT', 'PROBE', 'WIDTH', 'MEAS', 'DISTO', 'FOURIER', 'NOISE', 'OP',
            'SENS', 'STEP', 'TF', 'TRAN', 'AC', 'DC', 'PZ', 'ZERO', 'POLE', 'FOUR',
            'SAVE', 'LOAD', 'GLOBAL'
        ];

        var directiveRegex = new RegExp('\\.(' + directives.join('|') + ')(?=\\s|$|\\()', 'gi');
        var componentRegex = /^(\s*)([RCVLIDQMJFGHEKOSTWXBU][a-zA-Z0-9_#]*)/i;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var processed = line;

            // Full-line comment
            if (/^\s*\*/.test(line)) {
                processedLines.push('<span class="tok-spice-comment">' + line + '</span>');
                continue;
            }

            // Find inline comment ($ starts comment when preceded by whitespace)
            var commentIndex = -1;
            var dollarPos = line.indexOf('$');
            while (dollarPos !== -1) {
                if (dollarPos === 0 || /\s/.test(line[dollarPos - 1])) {
                    commentIndex = dollarPos;
                    break;
                }
                dollarPos = line.indexOf('$', dollarPos + 1);
            }

            var codePart = line;
            var commentPart = '';
            if (commentIndex !== -1) {
                codePart = line.substring(0, commentIndex);
                commentPart = line.substring(commentIndex);
            }

            // Continuation line
            if (/^\s*\+/.test(codePart)) {
                codePart = '<span class="tok-spice-continuation">' + codePart + '</span>';
            } 
            // Directive
            else if (/^\s*\./.test(codePart)) {
                codePart = codePart.replace(directiveRegex, '<span class="tok-spice-directive">.$1</span>');
            } 
            // Component
            else {
                var compMatch = codePart.match(componentRegex);
                if (compMatch) {
                    var leadingSpace = compMatch[1];
                    var compName = compMatch[2];
                    var restOfLine = codePart.substring(compMatch[0].length);
                    codePart = leadingSpace + '<span class="tok-spice-component">' + compName + '</span>' + restOfLine;
                }
            }

            // Add inline comment
            processed = commentPart ? codePart + '<span class="tok-spice-comment">' + commentPart + '</span>' : codePart;
            processedLines.push(processed);
        }

        return processedLines.join('\n');
    };

    // ================================================================
    // UI Updates
    // ================================================================
    this.updateHighlighting = function() {
        if (!highlightLayer || !codeEditor) return;
        var highlighted = selfDialog.highlightNetlist(codeEditor.value);
        highlightLayer.innerHTML = highlighted;
        highlightLayer.scrollTop = codeEditor.scrollTop;
        highlightLayer.scrollLeft = codeEditor.scrollLeft;
    };

    this.updateLineNumbers = function() {
        if (!codeEditor || !lineNumbers) return;

        var value = codeEditor.value;
        var lines = value.split('\n');
        var cursorPos = codeEditor.selectionStart;
        var textBefore = value.substring(0, cursorPos);
        var currentLineNum = textBefore.split('\n').length;

        var html = '';
        for (var i = 0; i < lines.length; i++) {
            var cls = (i + 1 === currentLineNum) ? ' class="current"' : '';
            html += '<span' + cls + '>' + (i + 1) + '</span>';
        }

        lineNumbers.innerHTML = html;
        selfDialog.currentLine = currentLineNum;
        lineNumbers.scrollTop = codeEditor.scrollTop;
    };

    this.updateStatus = function(msg, type) {
        var status = document.getElementById('snedStatus');
        if (!status) return;

        status.textContent = msg;
        status.classList.remove('modified');
        if (type === 'modified') status.classList.add('modified');
    };

    // ================================================================
    // Submit / Cancel / Sync
    // ================================================================
    this.submitResult = function() {
        var result = codeEditor ? codeEditor.value : '';
        var submitCallback = selfDialog.onSubmit;
        selfDialog.hide();
        if (typeof submitCallback === 'function') submitCallback(result);
        return result;
    };

    this.cancelDialog = function() {
        var cancelCallback = selfDialog.onCancel;
        selfDialog.hide();
        if (typeof cancelCallback === 'function') cancelCallback();
        return null;
    };

    this.syncScroll = function() {
        if (!codeEditor) return;
        var scrollTop = codeEditor.scrollTop;
        var scrollLeft = codeEditor.scrollLeft;

        if (lineNumbers) lineNumbers.scrollTop = scrollTop;
        if (highlightLayer) {
            highlightLayer.scrollTop = scrollTop;
            highlightLayer.scrollLeft = scrollLeft;
        }
    };

    // ================================================================
    // Initialize Events
    // ================================================================
    this.init = function() {
        selfDialog.cacheDOM();

        var dialog = document.getElementById('spiceNetlistDialog');
        var header = document.getElementById('spiceNetlistDialogHeader');
        var closeBtn = document.getElementById('spiceNetlistDialogClose');
        var overlay = document.getElementById('spiceNetlistDialogOverlay');
        var btnCancel = document.getElementById('snedBtnCancel');
        var btnOk = document.getElementById('snedBtnOk');

        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selfDialog.cancelDialog();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        }

        if (btnCancel) {
            btnCancel.addEventListener('click', function() { selfDialog.cancelDialog(); });
        }

        if (btnOk) {
            btnOk.addEventListener('click', function() { selfDialog.submitResult(); });
        }

        if (codeEditor) {
            codeEditor.addEventListener('input', function() {
                selfDialog.updateLineNumbers();
                selfDialog.updateHighlighting();
                selfDialog.updateStatus('Lines: ' + this.value.split('\n').length, 'modified');
            });

            codeEditor.addEventListener('scroll', function() { selfDialog.syncScroll(); });
            codeEditor.addEventListener('keyup', function() { selfDialog.updateLineNumbers(); });
            codeEditor.addEventListener('click', function() { selfDialog.updateLineNumbers(); });
            codeEditor.addEventListener('select', function() { selfDialog.updateLineNumbers(); });

            codeEditor.addEventListener('keydown', function(e) {
                if (e.key !== 'Tab') return;
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;
                var spaces = '    ';

                this.value = this.value.substring(0, start) + spaces + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + spaces.length;

                selfDialog.updateLineNumbers();
                selfDialog.updateHighlighting();
                selfDialog.syncScroll();
                selfDialog.updateStatus('Lines: ' + this.value.split('\n').length, 'modified');
            });
        }

        // Drag functionality
        if (header) {
            header.addEventListener('mousedown', function(e) {
                if (e.target === closeBtn || (closeBtn && closeBtn.contains(e.target))) return;
                if (!dialog) return;

                isDragging = true;
                var rect = dialog.getBoundingClientRect();
                dialogStartX = rect.left;
                dialogStartY = rect.top;
                dragStartX = e.clientX;
                dragStartY = e.clientY;

                dialog.style.transform = 'none';
                dialog.style.left = dialogStartX + 'px';
                dialog.style.top = dialogStartY + 'px';
                document.body.style.userSelect = 'none';
                e.preventDefault();
            });
        }

        document.addEventListener('mousemove', function(e) {
            if (!isDragging || !dialog) return;

            var newX = dialogStartX + (e.clientX - dragStartX);
            var newY = dialogStartY + (e.clientY - dragStartY);
            var viewportWidth = window.innerWidth;
            var viewportHeight = window.innerHeight;

            if (newX < 0) newX = 0;
            if (newX + dialog.offsetWidth > viewportWidth) newX = viewportWidth - dialog.offsetWidth;
            if (newY < 0) newY = 0;
            if (newY + dialog.offsetHeight > viewportHeight) newY = viewportHeight - dialog.offsetHeight;

            dialog.style.left = newX + 'px';
            dialog.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';
            }
        });
    };

    // Initialize dialog
    selfDialog.injectCSS();
    selfDialog.injectHTML();
    selfDialog.init();
}

// ================================================================
// Global instance
// ================================================================
var spiceNetlistDialog;