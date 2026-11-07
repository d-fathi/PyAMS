'use strict';
/*
 * "Workspace" of the desktop application.
 * In VS Code the workspace folders are the opened project. Here the project is the folder of the
 * document being edited (set by main.js through setProvider), so project symbols (*.sym) and
 * project Python models (*.py) are found exactly like in the extension.
 */
let provider = () => [];

function setProvider(fn) { provider = typeof fn === 'function' ? fn : () => []; }

/** Same shape as vscode.workspace.workspaceFolders: [{ name, uri: { fsPath } }] */
function folders() {
    let list = [];
    try { list = provider() || []; } catch (e) { list = []; }
    return list.map((p) => ({ name: require('path').basename(p) || p, uri: { fsPath: p } }));
}

module.exports = { setProvider, folders };
