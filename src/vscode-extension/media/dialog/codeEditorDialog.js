/*
#--------------------------------------------------------------------------------------------------
Name:        codeEditorDialog.js
Author:      d.fathi
Created:     09/09/2026
Modified:    10/09/2026 - VSCode theme alignment + text alignment fix
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Dialog for editing single code file (HTML/CSS) with syntax highlighting
#---------------------------------------------------------------------------------------------------
Changelog:
  v2.0 - 10/09/2026
    - Fixed text misalignment during typing (textarea vs highlight layer)
    - Aligned theme with VSCode Dark+ using CSS variables
    - Improved syntax highlighting regex (proper order, no overlap)
    - Better scrollbar handling
    - Enhanced line numbers (active line highlight)
#---------------------------------------------------------------------------------------------------
*/

//------------------Class for Code Editor Dialog (Single File)--------------------------------//
function fCodeEditorDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;

    // State
    selfDialog.codeContent = '';
    selfDialog.language = 'html';
    selfDialog.isLoading = false;
    selfDialog.currentLine = 1;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // DOM refs
    var codeEditor, lineNumbers, highlightLayer, dialogEl;

    // Inject CSS - Aligned with VSCode Dark+ theme
    this.injectCSS = function() {
        var css = `
/* ===== Code Editor Dialog (VSCode Aligned) ===== */
#codeEditorDialog {
    position: fixed;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    max-width: 95vw;
    height: 500px;
    max-height: 85vh;
    background: var(--vscode-editorWidget-background, #1e1e1e);
    border: 1px solid var(--vscode-editorWidget-border, #454545);
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 3000;
    display: none;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    font-size: 13px;
    color: var(--vscode-editor-foreground, #d4d4d4);
    flex-direction: column;
    overflow: hidden;
}
#codeEditorDialog.visible { display: flex; }

#codeEditorDialogOverlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2999;
    display: none;
}
#codeEditorDialogOverlay.visible { display: block; }

/* Header - VSCode style */
#codeEditorDialogHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, #2b2b2b);
    background: var(--vscode-titleBar-activeBackground, #3c3c3c);
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}
#codeEditorDialogTitle {
    font-size: 13px;
    font-weight: 400;
    color: var(--vscode-titleBar-activeForeground, #cccccc);
    display: flex;
    align-items: center;
    gap: 8px;
}
#codeEditorLangBadge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #007acc;
    color: #ffffff;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
}
#codeEditorDialogClose {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--vscode-titleBar-activeForeground, #cccccc);
    padding: 2px 6px;
    line-height: 1;
    border-radius: 3px;
    transition: background 0.1s;
}
#codeEditorDialogClose:hover {
    background: var(--vscode-toolbar-hoverBackground, rgba(255, 255, 255, 0.1));
    color: #ffffff;
}

/* Editor Container */
.ced-editor-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    background: var(--vscode-editor-background, #1e1e1e);
}

/* Line Numbers - VSCode style */
.ced-line-numbers {
    width: 50px;
    background: var(--vscode-editor-background, #1e1e1e);
    border-right: 1px solid var(--vscode-editorGroup-border, #444444);
    padding: 10px 0;
    text-align: right;
    font-size: 13px;
    line-height: 20px;
    color: var(--vscode-editorLineNumber-foreground, #858585);
    overflow: hidden;
    flex-shrink: 0;
    user-select: none;
    font-family: 'Consolas', 'Courier New', monospace;
    box-sizing: border-box;
}
.ced-line-numbers span {
    display: block;
    padding-right: 12px;
    height: 20px;
    font-size: 13px;
    line-height: 20px;
}
.ced-line-numbers span.current {
    color: var(--vscode-editorLineNumber-activeForeground, #c6c6c6);
    font-weight: 600;
}

/* Editor Wrapper - Critical for alignment */
.ced-editor-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: var(--vscode-editor-background, #1e1e1e);
}

/* SHARED STYLES - Must be IDENTICAL for textarea and pre */
.ced-editor-textarea,
.ced-highlight-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px 12px;
    margin: 0;
    border: 0;
    box-sizing: border-box;
    
    /* Identical font properties - CRITICAL */
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    font-weight: 400;
    font-style: normal;
    font-variant: normal;
    font-stretch: normal;
    line-height: 20px;
    letter-spacing: normal;
    word-spacing: normal;
    text-indent: 0;
    text-rendering: auto;
    text-align: start;
    text-transform: none;
    
    /* Identical whitespace handling */
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    tab-size: 4;
    -moz-tab-size: 4;
    
    overflow: auto;
}

/* Highlight Layer - UNDER the textarea */
.ced-highlight-layer {
    pointer-events: none;
    z-index: 1;
    color: var(--vscode-editor-foreground, #d4d4d4);
    background: transparent;
    /* Hide scrollbar on pre - only textarea has one */
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow: auto;
}
.ced-highlight-layer::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
}
.ced-highlight-layer * {
    background: transparent !important;
}

/* Textarea - ON TOP of pre, transparent text (caret visible) */
.ced-editor-textarea {
    background: transparent;
    color: transparent;
    caret-color: var(--vscode-editorCursor-foreground, #ffffff);
    z-index: 2;
    resize: none;
    outline: none;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
    /* Match highlight layer scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4)) transparent;
}
.ced-editor-textarea::selection {
    background: var(--vscode-editor-selectionBackground, rgba(38, 79, 120, 0.6));
}
.ced-editor-textarea::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
.ced-editor-textarea::-webkit-scrollbar-track {
    background: transparent;
}
.ced-editor-textarea::-webkit-scrollbar-thumb {
    background: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4));
    border-radius: 5px;
}
.ced-editor-textarea::-webkit-scrollbar-thumb:hover {
    background: var(--vscode-scrollbarSlider-hoverBackground, rgba(100, 100, 100, 0.7));
}

/* Active line highlight */
.ced-active-line {
    background: var(--vscode-editor-lineHighlightBackground, rgba(255, 255, 255, 0.04));
    display: block;
}

/* Syntax Highlighting Colors - VSCode Dark+ */
.tok-tag { color: #569cd6; }
.tok-attr { color: #9cdcfe; }
.tok-string { color: #ce9178; }
.tok-comment { color: #6a9955; font-style: italic; }
.tok-keyword { color: #c586c0; }
.tok-property { color: #9cdcfe; }
.tok-value { color: #ce9178; }
.tok-selector { color: #d7ba7d; }
.tok-punctuation { color: #808080; }
.tok-important { color: #569cd6; font-weight: bold; }
.tok-number { color: #b5cea8; }

/* ===== Status Bar (VSCode Aligned) ===== */
.ced-buttons-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: var(--vscode-statusBar-background, #007acc);
    border-top: 1px solid var(--vscode-statusBar-border, #007acc);
    flex-shrink: 0;
    gap: 12px;
    min-height: 22px;
}

/* Status text on the left */
.ced-status {
    font-size: 12px;
    color: var(--vscode-statusBar-foreground, #ffffff);
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
    font-weight: 400;
    letter-spacing: 0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ced-status.modified {
    color: var(--vscode-statusBar-foreground, #ffffff);
    font-style: italic;
}

/* Keep buttons as requested */
.ced-btn-group { 
    display: flex; 
    gap: 8px;
    flex-shrink: 0;
}

.ced-btn {
    padding: 4px 12px;
    border: 1px solid var(--vscode-button-border, #3a3a3a);
    border-radius: 2px;
    font-size: 12px;
    cursor: pointer;
    background: var(--vscode-button-background, #3a3a3a);
    color: var(--vscode-button-foreground, #dddddd);
    font-weight: 400;
    transition: background 0.15s;
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
}

.ced-btn:hover:not(:disabled) { 
    background: var(--vscode-button-hoverBackground, #4a4a4a); 
}

.ced-btn-primary {
    background: var(--vscode-button-background, #0e639c);
    border-color: var(--vscode-button-border, #0e639c);
    color: var(--vscode-button-foreground, #ffffff);
}

.ced-btn-primary:hover:not(:disabled) { 
    background: var(--vscode-button-hoverBackground, #1177bb); 
}

.ced-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
`;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    };

    // Inject HTML
    this.injectHTML = function() {
        var dialogHTML = `
        <div id="codeEditorDialogOverlay"></div>
        <div id="codeEditorDialog">
            <div id="codeEditorDialogHeader">
                <span id="codeEditorDialogTitle">
                    Code Editor
                    <span id="codeEditorLangBadge">HTML</span>
                </span>
                <button id="codeEditorDialogClose" title="Close (Esc)">×</button>
            </div>
            <div class="ced-editor-container">
                <div class="ced-line-numbers" id="cedLineNumbers"></div>
                <div class="ced-editor-wrapper">
                    <pre class="ced-highlight-layer" id="cedHighlight"></pre>
                    <textarea class="ced-editor-textarea" id="cedCodeEditor" spellcheck="false" 
                        autocorrect="off" autocapitalize="off" 
                        placeholder="<!-- Enter code here -->"></textarea>
                </div>
            </div>
            <div class="ced-buttons-bar">
                <span class="ced-status" id="cedStatus">Ready</span>
                <div class="ced-btn-group">
                    <button class="ced-btn" id="cedBtnCancel">Cancel</button>
                    <button class="ced-btn ced-btn-primary" id="cedBtnOk">Apply</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    };

    // Cache DOM refs
    this.cacheDOM = function() {
        codeEditor = document.getElementById('cedCodeEditor');
        lineNumbers = document.getElementById('cedLineNumbers');
        highlightLayer = document.getElementById('cedHighlight');
        dialogEl = document.getElementById('codeEditorDialog');
    };

    this.toggle = function() { selfDialog.isVisible ? selfDialog.hide() : selfDialog.show(); };
    
    this.show = function() {
        var dialog = document.getElementById('codeEditorDialog');
        var overlay = document.getElementById('codeEditorDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
            setTimeout(function() {
                if (codeEditor) codeEditor.focus();
            }, 50);
        }
    };
    
    this.hide = function() {
        var dialog = document.getElementById('codeEditorDialog');
        var overlay = document.getElementById('codeEditorDialogOverlay');
        if (dialog) {
            dialog.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.unbindKeyEvents();
        }
    };
    
    this.bindKeyEvents = function() { document.addEventListener('keydown', selfDialog.keyHandler); };
    this.unbindKeyEvents = function() { document.removeEventListener('keydown', selfDialog.keyHandler); };
    
    this.keyHandler = function(e) { 
        if (e.key === 'Escape') { 
            e.preventDefault(); 
            selfDialog.cancelDialog();
            return false; 
        } 
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            selfDialog.submitResult();
        }
    };
    
    this.setCallbacks = function(onSubmit, onCancel) { 
        selfDialog.onSubmit = onSubmit || null; 
        selfDialog.onCancel = onCancel || null; 
    };

    // Initialize with content
    this.initData = function(code, language) {
        selfDialog.codeContent = code || '';
        selfDialog.language = (language || 'html').toLowerCase();
        
        // Update badge
        var badge = document.getElementById('codeEditorLangBadge');
        if (badge) {
            badge.textContent = selfDialog.language.toUpperCase();
            badge.style.background = selfDialog.language === 'css' ? '#264de4' : '#e34c26';
        }
        
        // Update placeholder
        if (codeEditor) {
            codeEditor.placeholder = selfDialog.language === 'css' 
                ? '/* Enter CSS code here */' 
                : '<!-- Enter HTML code here -->';
            codeEditor.value = selfDialog.codeContent;
        }
        
        selfDialog.updateLineNumbers();
        selfDialog.updateHighlighting();
        selfDialog.updateStatus('Ready');
    };

    // Improved syntax highlighting with proper regex order
    this.highlightCode = function(code, lang) {
        if (!code) return '';
        
        // Escape HTML
        var escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        if (lang === 'css') {
            // Process CSS - order matters!
            var result = escaped;
            
            // 1. Comments first
            result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-comment">$1</span>');
            
            // 2. Strings
            result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="tok-string">$1</span>');
            
            // 3. !important
            result = result.replace(/(!important)/gi, '<span class="tok-important">$1</span>');
            
            // 4. Numbers with units
            result = result.replace(/\b(\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|s|ms|deg|rad|turn)?)\b/gi, '<span class="tok-number">$1</span>');
            
            // 5. Selectors (class, id)
            result = result.replace(/(#[a-z0-9_-]+|\.[a-z0-9_-]+)/gi, '<span class="tok-selector">$1</span>');
            
            // 6. Properties
            result = result.replace(/([a-z-]+)(\s*:)/gi, function(match, prop, colon) {
                return '<span class="tok-property">' + prop + '</span>' + colon;
            });
            
            return result;
            
        } else { // html
            var result = escaped;
            
            // 1. Comments first
            result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-comment">$1</span>');
            
            // 2. DOCTYPE
            result = result.replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi, '<span class="tok-comment">$1</span>');
            
            // 3. Strings in attributes (must come before attr names)
            result = result.replace(/([a-z-]+)(=)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/gi, function(match, attr, eq, str) {
                return '<span class="tok-attr">' + attr + '</span>' + eq + '<span class="tok-string">' + str + '</span>';
            });
            
            // 4. Tag names
            result = result.replace(/(&lt;\/?)([a-z][a-z0-9]*)/gi, function(match, bracket, tag) {
                return bracket + '<span class="tok-tag">' + tag + '</span>';
            });
            
            // 5. Punctuation
            result = result.replace(/(&lt;\/?|&gt;|\/&gt;)/g, '<span class="tok-punctuation">$1</span>');
            
            return result;
        }
    };

    this.updateHighlighting = function() {
        if (!highlightLayer || !codeEditor) return;
        var code = codeEditor.value;
        // Add trailing newline to match textarea behavior
        var highlighted = selfDialog.highlightCode(code, selfDialog.language);
        highlightLayer.innerHTML = highlighted + '\n';
    };

    this.updateLineNumbers = function() {
        if (!codeEditor || !lineNumbers) return;
        var lines = codeEditor.value.split('\n');
        var cursorPos = codeEditor.selectionStart;
        var textBefore = codeEditor.value.substring(0, cursorPos);
        var currentLineNum = textBefore.split('\n').length;
        
        lineNumbers.innerHTML = '';
        lines.forEach(function(_, i) {
            var span = document.createElement('span');
            span.textContent = i + 1;
            if (i + 1 === currentLineNum) {
                span.classList.add('current');
            }
            lineNumbers.appendChild(span);
        });
        
        selfDialog.currentLine = currentLineNum;
    };

    this.updateStatus = function(msg, type) {
        var status = document.getElementById('cedStatus');
        if (status) {
            status.textContent = msg;
            status.classList.remove('modified');
            if (type === 'modified') status.classList.add('modified');
        }
    };

    // Submit result
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

    // Synchronize scroll between textarea, highlight layer, and line numbers
    this.syncScroll = function() {
        if (codeEditor && lineNumbers) {
            lineNumbers.scrollTop = codeEditor.scrollTop;
        }
        if (codeEditor && highlightLayer) {
            highlightLayer.scrollTop = codeEditor.scrollTop;
            highlightLayer.scrollLeft = codeEditor.scrollLeft;
        }
    };

    // Initialize events
    this.init = function() {
        selfDialog.cacheDOM();
        var dialog = document.getElementById('codeEditorDialog');
        var header = document.getElementById('codeEditorDialogHeader');
        var closeBtn = document.getElementById('codeEditorDialogClose');
        var overlay = document.getElementById('codeEditorDialogOverlay');
        var btnCancel = document.getElementById('cedBtnCancel');
        var btnOk = document.getElementById('cedBtnOk');

        if (closeBtn) closeBtn.addEventListener('click', function(e) { 
            e.stopPropagation(); 
            selfDialog.cancelDialog(); 
        });
        if (overlay) overlay.addEventListener('click', function(e) { 
            e.preventDefault(); 
            e.stopPropagation(); 
        });
        if (btnCancel) btnCancel.addEventListener('click', function() { 
            selfDialog.cancelDialog(); 
        });
        if (btnOk) btnOk.addEventListener('click', function() { 
            selfDialog.submitResult(); 
        });

        // Editor events
        if (codeEditor) {
            codeEditor.addEventListener('input', function() { 
                selfDialog.updateLineNumbers();
                selfDialog.updateHighlighting();
                selfDialog.updateStatus('Modified - Lines: ' + this.value.split('\n').length, 'modified');
            });
            
            codeEditor.addEventListener('scroll', selfDialog.syncScroll);
            
            // Update line numbers on cursor move
            codeEditor.addEventListener('keyup', selfDialog.updateLineNumbers);
            codeEditor.addEventListener('click', selfDialog.updateLineNumbers);
            
            // Tab key support (4 spaces)
            codeEditor.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    var start = this.selectionStart;
                    var end = this.selectionEnd;
                    var spaces = '    '; // 4 spaces
                    this.value = this.value.substring(0, start) + spaces + this.value.substring(end);
                    this.selectionStart = this.selectionEnd = start + spaces.length;
                    selfDialog.updateLineNumbers();
                    selfDialog.updateHighlighting();
                }
            });
        }

        // Drag functionality
        if (header) {
            header.addEventListener('mousedown', function(e) {
                if (e.target === closeBtn || closeBtn.contains(e.target)) return;
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
            
            // Keep dialog within viewport
            if (newX < 0) newX = 0;
            if (newX + dialog.offsetWidth > viewportWidth) {
                newX = viewportWidth - dialog.offsetWidth;
            }
            if (newY < 0) newY = 0;
            if (newY + dialog.offsetHeight > viewportHeight) {
                newY = viewportHeight - dialog.offsetHeight;
            }
            
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

    this.injectCSS();
    this.injectHTML();
    this.init();
}
var codeEditorDialog;