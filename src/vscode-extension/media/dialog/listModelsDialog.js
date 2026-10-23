/*
#--------------------------------------------------------------------------------------------------
Name:        listModelsDialog.js
Author:      d.fathi
Created:     05/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
//------------------Class for List Models Dialog (Single Selection)--------------------------------//
// Lists the PyAMS model files (pyams/models/*.py). A Python process searches them for
// `class Name(model)`; the Raw page shows the source code of the selected model.
function fListModelsDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;

    // State
    selfDialog.currentTab = 'raw';
    selfDialog.selectedModel = '';
    selfDialog.rawContent = '';
    selfDialog.selectedFileName = '';
    selfDialog.selectedFilePath = '';
    selfDialog.libFiles = [];
    selfDialog.isLoading = false;
    selfDialog.previousFileIndex = -1;
    selfDialog.previousResult = null;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // DOM refs
    var modelsSelect, editor, lineNumbers, libSelect;  // modelsSelect = class chooser (only shown when a file has several model classes)

    // Inject CSS
    this.injectCSS = function() {
        var css = `
/* ===== List Models Dialog ===== */
#listModelsDialog {
    position: fixed;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    max-width: 92vw;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border, #ccc));
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.28);
    z-index: 3000;
    display: none;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-editor-foreground, #333);
    flex-direction: column;
    overflow: hidden;
    max-height: 88vh;
}
#listModelsDialog.visible {
    display: flex;
}
#listModelsDialogOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.45);
    z-index: 2999;
    display: none;
}
#listModelsDialogOverlay.visible {
    display: block;
}
#listModelsDialogHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-titleBar-activeBackground, var(--vscode-editor-inactiveSelectionBackground, #fafafa));
    border-radius: 6px 6px 0 0;
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}
#listModelsDialogHeader:hover {
    background: var(--vscode-list-hoverBackground, #f0f0f0);
}
#listModelsDialogTitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
}
#listModelsDialogClose {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, #666);
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
    font-family: inherit;
}
#listModelsDialogClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
    color: var(--vscode-editor-foreground, #333);
}
.lmd-lib-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--vscode-sideBar-background, #fafafa);
    border-bottom: 1px solid var(--vscode-panel-border, #e0e0e0);
    flex-shrink: 0;
}
.lmd-lib-bar label {
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #555);
    white-space: nowrap;
}
#listModelsLibSelect {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--vscode-panel-border, #ccc);
    border-radius: 4px;
    font-size: 12px;
    font-family: 'Consolas', monospace;
    background: var(--vscode-dropdown-background, #fff);
    color: var(--vscode-dropdown-foreground, #333);
    outline: none;
    cursor: pointer;
}
#listModelsLibSelect:focus {
    border-color: var(--vscode-focusBorder, #2196F3);
    box-shadow: 0 0 0 2px rgba(33,150,243,0.15);
}
.lmd-tabs {
    display: flex;
    background: var(--vscode-tab-inactiveBackground, #f5f5f5);
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}
.lmd-tab {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--vscode-tab-inactiveForeground, #888);
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
}
.lmd-tab.active {
    color: var(--vscode-tab-activeForeground, #2196F3);
    background: var(--vscode-tab-activeBackground, #fff);
    border-bottom-color: var(--vscode-tab-activeBorder, #2196F3);
}
.lmd-tab:hover:not(.active) {
    color: var(--vscode-tab-inactiveForeground, #555);
    background: var(--vscode-tab-inactiveBackground, #eee);
}
.lmd-editor-container {
    flex: 1;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* Class chooser (visible only when a file defines several model classes) */
#listModelsSelect {
    display: none;
    min-width: 120px;
    padding: 6px 10px;
    border: 1px solid var(--vscode-panel-border, #ccc);
    border-radius: 4px;
    font-size: 12px;
    font-family: 'Consolas', monospace;
    background: var(--vscode-dropdown-background, #fff);
    color: var(--vscode-dropdown-foreground, #333);
    outline: none;
    cursor: pointer;
}
#listModelsSelect.visible { display: block; }
#listModelsSelect:focus {
    border-color: var(--vscode-focusBorder, #2196F3);
}

/* Raw View (Textarea) */
#lmd-raw-view {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
    height: 300px;
}
.lmd-line-numbers {
    width: 50px;
    background: var(--vscode-editorLineNumber-background, #f0f0f0);
    border-right: 1px solid var(--vscode-panel-border, #ddd);
    padding: 10px 0;
    text-align: right;
    font-size: 13px;
    line-height: 22px;
    color: var(--vscode-editorLineNumber-foreground, #999);
    overflow: hidden;
    flex-shrink: 0;
    user-select: none;
    font-family: 'Consolas', monospace;
}
.lmd-line-numbers span {
    display: block;
    padding-right: 10px;
    height: 22px;
}
.lmd-line-numbers span.current {
    color: var(--vscode-editorLineNumber-activeForeground, #2196F3);
    font-weight: bold;
    background: var(--vscode-editor-lineHighlightBackground, #e3f2fd);
}
#listModelsEditor {
    flex: 1;
    border: none;
    outline: none;
    padding: 10px 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 22px;
    resize: none;
    background: var(--vscode-editor-background, #fff);
    color: var(--vscode-editor-foreground, #333);
    white-space: pre;
    overflow: auto;
    tab-size: 4;
}
.lmd-buttons-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: var(--vscode-editorWidget-background, #fff);
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}
.lmd-btn {
    padding: 8px 24px;
    border: 1px solid var(--vscode-button-secondaryBackground, #ccc);
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    background: var(--vscode-button-secondaryBackground, #f0f0f0);
    color: var(--vscode-button-secondaryForeground, #333);
    transition: all 0.15s;
    font-weight: 600;
}
.lmd-btn:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, #e0e0e0);
}
.lmd-btn-primary {
    background: var(--vscode-button-background, #2196F3);
    border-color: var(--vscode-button-border, #1976D2);
    color: var(--vscode-button-foreground, #fff);
}
.lmd-btn-primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground, #1976D2);
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
        <div id="listModelsDialogOverlay"></div>
        <div id="listModelsDialog">
            <div id="listModelsDialogHeader">
                <span id="listModelsDialogTitle">Select Model</span>
                <button id="listModelsDialogClose" title="Close">×</button>
            </div>
            <div class="lmd-lib-bar">
                <label>Library File:</label>
                <select id="listModelsLibSelect">
                    <option value="">-- Select a library file --</option>
                </select>
                <select id="listModelsSelect" title="Model class"></select>
            </div>
            <div class="lmd-tabs">
                <button class="lmd-tab active" id="lmd-tab-raw">Raw</button>
            </div>
            <div class="lmd-editor-container">
                <!-- Raw View (Textarea) -->
                <div id="lmd-raw-view">
                    <div class="lmd-line-numbers" id="listModelsLineNumbers"></div>
                    <textarea class="editor-textarea" id="listModelsEditor" spellcheck="false" readonly></textarea>
                </div>
            </div>
            <div class="lmd-buttons-bar">
                <button class="lmd-btn" id="listModelsBtnCancel">Cancel</button>
                <button class="lmd-btn lmd-btn-primary" id="listModelsBtnOk">OK</button>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    };

    // Cache DOM refs
    this.cacheDOM = function() {
        modelsSelect = document.getElementById('listModelsSelect');
        editor = document.getElementById('listModelsEditor');
        lineNumbers = document.getElementById('listModelsLineNumbers');
        libSelect = document.getElementById('listModelsLibSelect');
    };

    this.toggle = function() { selfDialog.isVisible ? selfDialog.hide() : selfDialog.show(); };
    this.show = function() {
        var dialog = document.getElementById('listModelsDialog');
        var overlay = document.getElementById('listModelsDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
        }
    };
    this.hide = function() {
        var dialog = document.getElementById('listModelsDialog');
        var overlay = document.getElementById('listModelsDialogOverlay');
        if (dialog) {
            dialog.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.unbindKeyEvents();
        }
    };
    this.bindKeyEvents = function() { document.addEventListener('keydown', selfDialog.keyHandler); };
    this.unbindKeyEvents = function() { document.removeEventListener('keydown', selfDialog.keyHandler); };
    this.keyHandler = function(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return false; } };
    this.setCallbacks = function(onSubmit, onCancel) { selfDialog.onSubmit = onSubmit || null; selfDialog.onCancel = onCancel || null; };

    // Initialize with previous result
    this.initData = function(previousResult) {
        selfDialog.previousResult = previousResult || { file: '', model: '' };
        selfDialog.currentTab = 'raw';
        selfDialog.selectedModel = '';
        selfDialog.rawContent = '';
        selfDialog.selectedFileName = '';
        selfDialog.selectedFilePath = '';
        selfDialog.libFiles = [];
        selfDialog.isLoading = true;
        selfDialog.previousFileIndex = -1;

        if (libSelect) libSelect.innerHTML = '<option value="">-- Loading models... --</option>';
        selfDialog.fillClassSelect([]);
        selfDialog.showRaw('// Searching PyAMS models...');
        selfDialog.updateTabUI();
        selfDialog.requestLibraryFiles();
    };

    // Ask the extension (Python process) for the model files and their `class X(model)`
    this.requestLibraryFiles = function() {
        if (typeof vscode !== 'undefined') vscode.postMessage({ type: 'getLibraryFiles' });
    };

    // VS Code message handler
    this.messageHandler = function(event) {
        var msg = event.data;
        if (!msg || msg.type !== 'libraryFilesResult') return;
        selfDialog.isLoading = false;
        selfDialog.libFiles = msg.libFiles || [];
        selfDialog.populateLibSelect();

        if (msg.error) {
            selfDialog.showRaw('# Error: ' + msg.error);
            return;
        }
        if (selfDialog.libFiles.length === 0) {
            selfDialog.showRaw('# No PyAMS model (class Name(model)) found');
            return;
        }

        // Restore the previous selection
        var prev = selfDialog.previousResult;
        if (prev && prev.file) {
            var fileIndex = selfDialog.libFiles.findIndex(function(f) {
                return f.name === prev.file || f.relativePath === prev.file;
            });
            if (fileIndex >= 0) {
                if (libSelect) libSelect.value = fileIndex;
                selfDialog.selectFile(fileIndex, prev.model);
                return;
            }
        }
        selfDialog.showRaw('# Select a library file to view the model');
    };

    this.populateLibSelect = function() {
        if (!libSelect) return;
        libSelect.innerHTML = '<option value="">-- Select a library file --</option>';
        selfDialog.libFiles.forEach(function(file, index) {
            var opt = document.createElement('option');
            opt.value = index;
            opt.textContent = file.relativePath || file.name;
            libSelect.appendChild(opt);
        });
    };

    // Fill the class chooser; it is visible only when the file has more than one model class
    this.fillClassSelect = function(classes) {
        if (!modelsSelect) return;
        modelsSelect.innerHTML = '';
        classes.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            modelsSelect.appendChild(opt);
        });
        modelsSelect.classList.toggle('visible', classes.length > 1);
    };

    // A library file was chosen: list its model classes and show the selected one
    this.selectFile = function(index, preferredModel) {
        var file = selfDialog.libFiles[index];
        if (!file) return;
        selfDialog.previousFileIndex = index;
        selfDialog.selectedFileName = file.name;
        selfDialog.selectedFilePath = file.fullPath;

        if (file.error) {
            selfDialog.fillClassSelect([]);
            selfDialog.selectedModel = '';
            selfDialog.showRaw('# Error: ' + file.error);
            return;
        }
        var classes = file.classes || [];
        selfDialog.fillClassSelect(classes);
        var chosen = classes.find(function(c) { return c.name === preferredModel; }) || classes[0];
        if (chosen) {
            modelsSelect.value = chosen.name;
            selfDialog.selectedModel = chosen.name;
            selfDialog.showRaw(chosen.source);
        }
    };

    this.onLibFileChange = function() {
        var index = parseInt(libSelect.value);
        if (isNaN(index) || index < 0) {
            selfDialog.selectedFileName = '';
            selfDialog.selectedFilePath = '';
            selfDialog.selectedModel = '';
            selfDialog.fillClassSelect([]);
            selfDialog.showRaw('# Select a library file to view the model');
            return;
        }
        selfDialog.selectFile(index);
    };

    this.onClassChange = function() {
        var file = selfDialog.libFiles[selfDialog.previousFileIndex];
        if (!file) return;
        var cls = (file.classes || []).find(function(c) { return c.name === modelsSelect.value; });
        if (cls) {
            selfDialog.selectedModel = cls.name;
            selfDialog.showRaw(cls.source);
        }
    };

    // Raw page: show the Python source of the selected PyAMS model
    this.showRaw = function(text) {
        selfDialog.rawContent = text || '';
        if (editor) editor.value = selfDialog.rawContent;
        selfDialog.updateLineNumbers();
    };

    this.updateTabUI = function() {
        var tabRaw = document.getElementById('lmd-tab-raw');
        if (tabRaw) tabRaw.classList.add('active');
    };

    this.updateLineNumbers = function() {
        if (!editor || !lineNumbers) return;
        var lines = editor.value.split('\n');
        lineNumbers.innerHTML = '';
        lines.forEach(function(_, i) {
            var span = document.createElement('span');
            span.textContent = i + 1;
            lineNumbers.appendChild(span);
        });
    };

    // Submit single model
    this.submitResult = function() {
        var chosenModel = selfDialog.selectedModel;
        if (!chosenModel || !selfDialog.selectedFileName) {
            alert('Please select a library file.');
            return null;
        }
        var result = {
            file: selfDialog.selectedFileName,
            model: chosenModel
        };
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

    // Initialize events
    this.init = function() {
        selfDialog.cacheDOM();
        var dialog = document.getElementById('listModelsDialog');
        var header = document.getElementById('listModelsDialogHeader');
        var closeBtn = document.getElementById('listModelsDialogClose');
        var overlay = document.getElementById('listModelsDialogOverlay');
        var btnCancel = document.getElementById('listModelsBtnCancel');
        var btnOk = document.getElementById('listModelsBtnOk');

        if (closeBtn) closeBtn.addEventListener('click', function(e) { e.stopPropagation(); selfDialog.cancelDialog(); });
        if (overlay) overlay.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); });
        if (btnCancel) btnCancel.addEventListener('click', function() { selfDialog.cancelDialog(); });
        if (btnOk) btnOk.addEventListener('click', function() { selfDialog.submitResult(); });
        if (libSelect) libSelect.addEventListener('change', function() { selfDialog.onLibFileChange(); });
        if (modelsSelect) modelsSelect.addEventListener('change', function() { selfDialog.onClassChange(); });
        if (editor) editor.addEventListener('scroll', function() { lineNumbers.scrollTop = editor.scrollTop; });

        // Drag functionality
        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn || closeBtn.contains(e.target)) return;
            isDragging = true;
            var rect = dialog.getBoundingClientRect();
            dialogStartX = rect.left; dialogStartY = rect.top;
            dragStartX = e.clientX; dragStartY = e.clientY;
            dialog.style.transform = 'none'; dialog.style.right = 'auto';
            dialog.style.left = dialogStartX + 'px'; dialog.style.top = dialogStartY + 'px';
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var newX = dialogStartX + (e.clientX - dragStartX);
            var newY = dialogStartY + (e.clientY - dragStartY);
            var viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
            if (newX < 0) newX = 0;
            if (newX + dialog.offsetWidth > viewportWidth) newX = viewportWidth - dialog.offsetWidth;
            if (newY < 0) newY = 0;
            if (newY + dialog.offsetHeight > viewportHeight) newY = viewportHeight - dialog.offsetHeight;
            dialog.style.left = newX + 'px'; dialog.style.top = newY + 'px';
        });
        document.addEventListener('mouseup', function() { isDragging = false; });

        window.addEventListener('message', selfDialog.messageHandler);
    };

    this.injectCSS();
    this.injectHTML();
    this.init();
}
var listModelsDialog;