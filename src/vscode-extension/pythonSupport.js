/*
Name:        pythonSupport.js
Description: Lets VS Code (Pylance) resolve `from pyams.lib import model, signal, param` in the Python
             files of the opened project, so the PyAMS library is recognised: no yellow underline,
             completion, hover help and error checking for the project's own models.

             How: the extension folder (it holds the `pyams` package) is added to the workspace setting
             python.analysis.extraPaths (and python.autoComplete.extraPaths for older language servers).
             The extension folder changes with every version, so the stored entry is replaced on activation.
*/
const vscode = require('vscode');

const STATE_CHOICE = 'pyams.pythonSupport';      // 'yes' | 'no'
const STATE_PATH = 'pyams.pythonSupportPath';    // the entry added last time

const SETTINGS = [
    { section: 'python.analysis', key: 'extraPaths' },
    { section: 'python.autoComplete', key: 'extraPaths' }
];

// workspace value of a list setting (only the workspace level, never user settings)
function workspaceList(section, key) {
    const info = vscode.workspace.getConfiguration(section).inspect(key);
    return (info && Array.isArray(info.workspaceValue)) ? info.workspaceValue.slice() : [];
}

/** Put the extension folder in the Python search paths of the workspace. */
async function enable(context) {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) return false;
    const extPath = context.extensionPath;
    const old = context.workspaceState.get(STATE_PATH);
    for (const s of SETTINGS) {
        let list = workspaceList(s.section, s.key);
        const before = JSON.stringify(list);
        if (old && old !== extPath) list = list.filter(p => p !== old);   // path of a previous version
        if (!list.includes(extPath)) list.push(extPath);
        if (JSON.stringify(list) !== before) {
            await vscode.workspace.getConfiguration(s.section).update(s.key, list, vscode.ConfigurationTarget.Workspace);
        }
    }
    await context.workspaceState.update(STATE_PATH, extPath);
    await context.workspaceState.update(STATE_CHOICE, 'yes');
    return true;
}

/** Take the extension folder out again. */
async function disable(context) {
    const extPath = context.extensionPath;
    const old = context.workspaceState.get(STATE_PATH);
    for (const s of SETTINGS) {
        const list = workspaceList(s.section, s.key);
        const kept = list.filter(p => p !== extPath && p !== old);
        if (kept.length !== list.length) {
            await vscode.workspace.getConfiguration(s.section).update(s.key, kept.length ? kept : undefined, vscode.ConfigurationTarget.Workspace);
        }
    }
    await context.workspaceState.update(STATE_PATH, undefined);
    await context.workspaceState.update(STATE_CHOICE, 'no');
}

// does the opened project use PyAMS (circuits, symbols)?
async function projectUsesPyams() {
    const found = await vscode.workspace.findFiles('**/*.{dcs,sym}', '**/node_modules/**', 1);
    return found.length > 0;
}

/** Called when the extension starts and when the workspace folders change. */
async function setup(context) {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) return;
    const choice = context.workspaceState.get(STATE_CHOICE);
    if (choice === 'yes') { await enable(context); return; }       // keeps the path of the current version
    if (choice === 'no' || !(await projectUsesPyams())) return;

    const enableText = 'Enable', laterText = 'Not now', neverText = "Don't ask again";
    const answer = await vscode.window.showInformationMessage(
        'PyAMS: let VS Code recognise "from pyams.lib import ..." in the Python files of this project ' +
        '(completion and error checking)? This adds the PyAMS library folder to python.analysis.extraPaths in the workspace settings.',
        enableText, laterText, neverText);
    if (answer === enableText) await enable(context);
    else if (answer === neverText) await context.workspaceState.update(STATE_CHOICE, 'no');
}

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('pyams.enablePythonSupport', async () => {
            const ok = await enable(context);
            vscode.window.showInformationMessage(ok
                ? 'PyAMS: the Python files of this project now recognise pyams.lib.'
                : 'PyAMS: open a folder first.');
        }),
        vscode.commands.registerCommand('pyams.disablePythonSupport', () => disable(context)),
        vscode.workspace.onDidChangeWorkspaceFolders(() => setup(context))
    );
    setup(context);
}

module.exports = { register, enable, disable, setup };
