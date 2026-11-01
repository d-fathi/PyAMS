/*
 * Page logic of the PyAMS editor window.
 * Same behaviour as the inline script of the VS Code webview (pyamsEditor.js), plus the few
 * commands that VS Code used to provide itself (undo/redo, zoom, status messages).
 */
const vscode = acquireVsCodeApi();

function isTextFieldFocused() {
    var ae = document.activeElement;
    return !!ae && (ae.tagName === 'TEXTAREA' ||
        (ae.tagName === 'INPUT' && !/^(button|checkbox|radio|submit|reset|file|range|color|image)$/i.test(ae.type)) ||
        ae.isContentEditable);
}

// Used by the main process when saving: the current content of the drawing.
window.__pyamsGetContent = function () {
    if (typeof drawing !== 'undefined' && drawing.getSymbol) return drawing.getSymbol();
    return null;
};

var toastTimer = null;
function showToast(text, kind) {
    var el = document.getElementById('sbToast');
    if (!el) return;
    el.textContent = text || '';
    el.className = kind || '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.textContent = ''; el.className = ''; }, 6000);
}

function handleClipboardCommand(msg) {
    // If a text field (input/textarea/contenteditable) has focus, act on its text, not on the circuit
    if (isTextFieldFocused()) {
        var ae = document.activeElement;
        var isFormEl = (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT');
        var selText = isFormEl
            ? ae.value.substring(ae.selectionStart, ae.selectionEnd)
            : String(window.getSelection());
        if (msg.type === 'execCopy') {
            if (selText) vscode.postMessage({ type: 'copyData', data: selText });
        } else if (msg.type === 'execCut') {
            if (selText) {
                vscode.postMessage({ type: 'copyData', data: selText });
                if (!document.execCommand('delete') && isFormEl) {
                    ae.setRangeText('', ae.selectionStart, ae.selectionEnd, 'end');
                    ae.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        } else if (msg.data) {
            if (!document.execCommand('insertText', false, msg.data) && isFormEl) {
                ae.setRangeText(msg.data, ae.selectionStart, ae.selectionEnd, 'end');
                ae.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    } else if (typeof drawing !== 'undefined') {
        if (msg.type === 'execCopy') drawing.copy();
        else if (msg.type === 'execCut') drawing.cut();
        else drawing.paste(msg.data);
    }
}

// Receive updates from the host (including Undo/Redo)
window.addEventListener('message', function (event) {
    var msg = event.data;
    if (!msg || typeof msg.type !== 'string') return;

    switch (msg.type) {
        case 'load':
        case 'update':
            window.fileContent = msg.content;
            window.fileType = msg.fileType;

            if (typeof drawing !== 'undefined' && drawing.pendingSave) {
                // echo of a change made in this page
                drawing.pendingSave = false;
                return;
            }
            if (typeof drawing !== 'undefined') {
                drawing.setFileType(window.fileType);
                drawing.setSymbol(window.fileContent);
            }
            break;

        case 'symbolsDataUpdated':
            if (typeof drawing !== 'undefined' && drawing.getDataSym) drawing.getDataSym(msg.data);
            break;

        case 'symFilesContent':
            if (typeof drawing !== 'undefined' && drawing._symFilesResolve) {
                drawing._symFilesResolve(msg.contents);
                drawing._symFilesResolve = null;
            }
            break;

        case 'symFilesFromWorkSpaceContent':
            if (typeof drawing !== 'undefined' && drawing._workspaceSymResolve) {
                drawing._workspaceSymResolve(msg.contents);
                drawing._workspaceSymResolve = null;
            }
            break;

        case 'execOpResult':
            if (typeof drawing !== 'undefined' && drawing._execOpResolve) {
                if (msg.success) drawing._execOpResolve(msg.data);
                else drawing._execOpReject(msg.error);
                drawing._execOpResolve = null;
                drawing._execOpReject = null;
            }
            break;

        case 'listParameterResult':
            if (typeof drawing !== 'undefined' && drawing._listParameterResolve) {
                drawing._listParameterResolve(msg.data);
                drawing._listParameterResolve = null;
                drawing._listParameterReject = null;
            }
            break;

        case 'simulationResults':
            if (typeof drawing !== 'undefined' && drawing.handleSimulationResults) {
                drawing.handleSimulationResults(msg.data);
            }
            break;

        case 'execCopy':
        case 'execCut':
        case 'execPaste':
            handleClipboardCommand(msg);
            break;

        case 'execUndo':
            if (isTextFieldFocused()) document.execCommand('undo');
            else vscode.postMessage({ type: '__undo' });
            break;

        case 'execRedo':
            if (isTextFieldFocused()) document.execCommand('redo');
            else vscode.postMessage({ type: '__redo' });
            break;

        case 'execZoomIn':
            if (typeof drawing !== 'undefined') drawing.zoomIn();
            break;

        case 'execZoomOut':
            if (typeof drawing !== 'undefined') drawing.zoomOut();
            break;

        case 'setFileName':
            if (typeof drawing !== 'undefined') {
                drawing.fileName = msg.fileName;
                drawing.symbol.name = msg.fileName;   // keep the symbol name in sync with the file
            }
            var sbFile = document.getElementById('sbFile');
            if (sbFile) sbFile.textContent = msg.fileName + (window.fileType ? '.' + window.fileType : '');
            break;

        case '__toast':
            showToast(msg.text, msg.kind);
            break;
    }
});

// Notify the host that the page is ready
vscode.postMessage({ type: 'ready' });
