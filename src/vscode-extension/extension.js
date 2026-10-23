const vscode = require('vscode');
const PyAMSEditorProvider = require('./pyamsEditor');

function activate(context) {
    console.log('PyAMS Editor is now active!');
    
    // تسجيل Custom Editor لملفات .sym
    context.subscriptions.push(
        PyAMSEditorProvider.register(context, 'pyamsEditor.symEditor', 'sym')
    );
    
    // تسجيل Custom Editor لملفات .dcs
    context.subscriptions.push(
        PyAMSEditorProvider.register(context, 'pyamsEditor.dcsEditor', 'dcs')
    );

    
    context.subscriptions.push(
        vscode.commands.registerCommand('editor.action.clipboardCopyAction', async () => {
            if (PyAMSEditorProvider.activeWebview) {
                PyAMSEditorProvider.activeWebview.postMessage({ type: 'execCopy' });
            } else {
                // إذا لم يكن Custom Editor نشطاً، نفذ الأمر الافتراضي
                await vscode.commands.executeCommand('default:editor.action.clipboardCopyAction');
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('editor.action.clipboardCutAction', async () => {
            if (PyAMSEditorProvider.activeWebview) {
                PyAMSEditorProvider.activeWebview.postMessage({ type: 'execCut' });
            } else {
                await vscode.commands.executeCommand('default:editor.action.clipboardCutAction');
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('editor.action.clipboardPasteAction', async () => {
            if (PyAMSEditorProvider.activeWebview) {
                const text = await vscode.env.clipboard.readText();
                PyAMSEditorProvider.activeWebview.postMessage({ type: 'execPaste', data: text });
            } else {
                await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction');
            }
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};