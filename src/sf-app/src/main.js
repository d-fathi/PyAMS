'use strict';
/*
 * PyAMS software - Electron main process.
 *
 * This replaces extension.js / pyamsEditor.js of the VS Code extension. The editor
 * page (media/*) is unchanged: it still posts messages ("contentChanged", "execOp",
 * "startPyAMSAnalysis", ...) and the handlers below answer them exactly like the
 * custom editor provider did, but with Electron windows, native dialogs and a
 * simple per-document undo/redo history instead of the VS Code text document.
 */

const { app, BrowserWindow, WebContentsView, Menu, dialog, ipcMain, shell, clipboard, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const SymbolsSync = require('./symbolsSync');
const LibrarySync = require('./librarySync');
const Workspace = require('./workspace');
const Settings = require('./settings');

// ---------------------------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------------------------
const APP_ROOT = path.join(__dirname, '..');
// Folder holding the files that must be real files on disk (python scripts, symbols, demos).
const DATA_ROOT = app.isPackaged ? process.resourcesPath : path.join(APP_ROOT, 'resources');
const RENDERER = path.join(APP_ROOT, 'renderer');
const ICON_FILE = process.platform === 'win32'
    ? path.join(APP_ROOT, 'build', 'icon.ico')
    : path.join(APP_ROOT, 'build', 'icon.png');
const ICON_PNG = path.join(APP_ROOT, 'build', 'icon.png');

const FILE_TYPES = {
    dcs: { name: 'DCS Circuit', ext: 'dcs', untitled: 'New Circuit' },
    sym: { name: 'Symbol File', ext: 'sym', untitled: 'New Symbol' }
};
const MAX_HISTORY = 200;

let settings = null;
const docs = new Map();          // webContents.id -> Doc
let isQuitting = false;
const pendingOpen = [];          // files requested before the app was ready

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------
function typeOfFile(filePath) {
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    return FILE_TYPES[ext] ? ext : null;
}

function applyPythonSetting() {
    const p = settings.get('pythonPath');
    if (p) process.env.PYAMS_PYTHON = p; else delete process.env.PYAMS_PYTHON;
}

function safeFileBase(name, fallback) {
    return String(name || fallback).replace(/[\\/:*?"<>|]+/g, '_').trim() || fallback;
}

function isInside(parent, child) {
    const rel = path.relative(parent, child);
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function defaultDir() {
    const last = settings.get('lastDir');
    if (last && fs.existsSync(last)) return last;
    return app.getPath('documents');
}

// ---------------------------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------------------------
class Doc {
    constructor(fileType, filePath, content, displayName) {
        this.fileType = fileType;
        this.filePath = filePath || null;
        this.displayName = displayName || (filePath ? path.basename(filePath, path.extname(filePath)) : FILE_TYPES[fileType].untitled);
        this.history = [content || ''];
        this.index = 0;
        this.savedIndex = filePath ? 0 : -1;   // an untitled document is never "clean" until saved
        this.view = null;
        this.tab = null;
        this.pos = null;
        this.zoom = null;
        this.pyamsOpRun = null;
        this.pyamsRun = null;
    }

    get content() { return this.history[this.index]; }
    get dirty() { return this.index !== this.savedIndex; }
    get name() { return this.filePath ? path.basename(this.filePath, path.extname(this.filePath)) : this.displayName; }

    push(content) {
        if (content === this.content) return;
        if (this.savedIndex > this.index) this.savedIndex = -1;   // the saved state is in the discarded redo branch
        this.history.length = this.index + 1;
        this.history.push(content);
        this.index++;
        if (this.history.length > MAX_HISTORY) {
            this.history.shift();
            this.index--;
            this.savedIndex = this.savedIndex > 0 ? this.savedIndex - 1 : -1;
        }
    }
}

const TAB_H = 42;
const STATUS_H = 28;
let mainWin = null;
let shellReady = false;
let mainForceClose = false;
let pythonStatus = 'Python: checking...';
const tabs = [];                  // { id, kind: 'doc' | 'start', doc, view }
let activeTab = null;
let nextTabId = 1;

function shellSend(channel, payload) {
    if (mainWin && !mainWin.isDestroyed() && !mainWin.webContents.isDestroyed()) {
        mainWin.webContents.send(channel, payload);
    }
}

function send(doc, message) {
    if (doc.view && !doc.view.webContents.isDestroyed()) {
        doc.view.webContents.send('host:message', message);
    }
}

function toast(doc, text, kind) {
    shellSend('shell:status', { toast: text, toastKind: kind || 'info' });
}

function tabTitle(tab) {
    return tab.kind === 'start' ? 'Start' : tab.doc.name + '.' + tab.doc.fileType;
}

function sendTabs() {
    shellSend('shell:tabs', tabs.map((t) => ({
        id: t.id,
        kind: t.kind,
        title: tabTitle(t),
        path: t.doc && t.doc.filePath ? t.doc.filePath : '',
        dirty: !!(t.doc && t.doc.dirty),
        active: t === activeTab
    })));
}

function sendStatus() {
    const doc = activeTab && activeTab.doc;
    shellSend('shell:status', {
        file: doc ? (doc.filePath || '(unsaved) ' + doc.name + '.' + doc.fileType) : '',
        pos: doc ? doc.pos : null,
        zoom: doc ? doc.zoom : null,
        python: pythonStatus
    });
}

function updateTitle(doc) {
    sendTabs();
    if (!mainWin || mainWin.isDestroyed()) return;
    if (activeTab && activeTab.doc === doc) {
        mainWin.setTitle((doc.dirty ? '● ' : '') + doc.name + '.' + doc.fileType + ' — PyAMS');
        if (process.platform === 'darwin') {
            mainWin.setDocumentEdited(doc.dirty);
            if (doc.filePath) mainWin.setRepresentedFilename(doc.filePath);
        }
    }
}

function focusedDoc() {
    return activeTab && activeTab.doc ? activeTab.doc : null;
}

function lockWebContents(wc) {
    wc.on('will-navigate', (e) => e.preventDefault());
    wc.setWindowOpenHandler(({ url }) => {
        if (/^https?:\/\//i.test(url)) shell.openExternal(url);
        return { action: 'deny' };
    });
}

function layout() {
    if (!mainWin || mainWin.isDestroyed()) return;
    const b = mainWin.getContentBounds();
    const rect = { x: 0, y: TAB_H, width: b.width, height: Math.max(0, b.height - TAB_H - STATUS_H) };
    for (const t of tabs) {
        t.view.setBounds(rect);
        t.view.setVisible(t === activeTab);
    }
}

async function detectPython() {
    const run = await LibrarySync.runPython(['-c', 'import sys;print(sys.version.split()[0])'], { timeout: 15000 });
    const v = (run.stdout || '').trim();
    pythonStatus = !run.error && /^\d+\.\d+/.test(v) ? 'Python ' + v : 'Python: not found';
    sendStatus();
}

function ensureMainWindow() {
    if (mainWin && !mainWin.isDestroyed()) return mainWin;
    shellReady = false;
    mainForceClose = false;
    mainWin = new BrowserWindow({
        width: 1360,
        height: 880,
        minWidth: 800,
        minHeight: 560,
        show: false,
        backgroundColor: '#eee0bd',
        icon: ICON_FILE,
        title: 'PyAMS',
        webPreferences: {
            preload: path.join(__dirname, 'preload-shell.js'),
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false
        }
    });
    lockWebContents(mainWin.webContents);
    mainWin.on('page-title-updated', (e) => e.preventDefault());
    mainWin.once('ready-to-show', () => mainWin.show());
    mainWin.on('resize', layout);
    mainWin.on('maximize', layout);
    mainWin.on('unmaximize', layout);
    mainWin.on('enter-full-screen', layout);
    mainWin.on('leave-full-screen', layout);
    mainWin.webContents.on('did-finish-load', () => { shellReady = true; sendTabs(); sendStatus(); layout(); });
    mainWin.loadFile(path.join(RENDERER, 'shell.html'));

    mainWin.on('close', (e) => {
        if (mainForceClose) return;
        const dirtyDocs = tabs.filter((t) => t.doc && t.doc.dirty);
        if (dirtyDocs.length === 0) return;
        e.preventDefault();
        (async () => {
            for (const t of dirtyDocs) {
                activateTab(t);
                if (!(await confirmClose(t.doc))) { isQuitting = false; return; }
            }
            mainForceClose = true;
            mainWin.close();
        })();
    });

    mainWin.on('closed', () => {
        for (const t of tabs) disposeTab(t);
        tabs.length = 0;
        activeTab = null;
        mainWin = null;
    });
    return mainWin;
}

function disposeTab(t) {
    if (t.doc) {
        if (t.doc.pyamsOpRun) { try { t.doc.pyamsOpRun.kill(); } catch (e) { /* ignore */ } }
        if (t.doc.pyamsRun) { try { t.doc.pyamsRun.kill(); } catch (e) { /* ignore */ } }
    }
    const wcId = t.view.webContents.id;
    docs.delete(wcId);
    try {
        if (mainWin && !mainWin.isDestroyed()) mainWin.contentView.removeChildView(t.view);
        if (!t.view.webContents.isDestroyed()) t.view.webContents.close();
    } catch (e) { /* ignore */ }
}

function addTab(kind, doc) {
    const win = ensureMainWindow();
    const view = new WebContentsView({
        webPreferences: {
            preload: path.join(__dirname, kind === 'start' ? 'preload-start.js' : 'preload.js'),
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false,
            spellcheck: false
        }
    });
    view.setBackgroundColor(kind === 'start' ? '#f6efe0' : '#e6d6ab');
    const tab = { id: nextTabId++, kind, doc: doc || null, view };
    tabs.push(tab);
    if (doc) { doc.view = view; doc.tab = tab; docs.set(view.webContents.id, doc); }
    win.contentView.addChildView(view);

    const wc = view.webContents;
    lockWebContents(wc);
    wc.setVisualZoomLevelLimits(1, 1).catch(() => {});
    if (kind === 'doc') {
        // Native edit menu for text fields (dialogs); the schematic keeps its own right-click behaviour.
        wc.on('context-menu', (_e, params) => {
            if (!params.isEditable && !params.selectionText) return;
            Menu.buildFromTemplate([
                { role: 'cut', enabled: params.editFlags.canCut },
                { role: 'copy', enabled: params.editFlags.canCopy },
                { role: 'paste', enabled: params.editFlags.canPaste },
                { type: 'separator' },
                { role: 'selectAll' }
            ]).popup({ window: win });
        });
    }
    wc.loadFile(path.join(RENDERER, kind === 'start' ? 'start.html' : 'editor.html'));
    activateTab(tab);
    return tab;
}

function activateTab(tab) {
    if (!tab || !tabs.includes(tab)) return;
    activeTab = tab;
    layout();
    if (mainWin && !mainWin.isDestroyed()) {
        if (!mainWin.isVisible() && !mainWin.isMinimized()) mainWin.show();
        mainWin.setTitle(tab.doc ? (tab.doc.dirty ? '● ' : '') + tab.doc.name + '.' + tab.doc.fileType + ' — PyAMS' : 'PyAMS');
    }
    tab.view.webContents.focus();
    sendTabs();
    sendStatus();
}

/** Close a tab (asks to save unsaved changes). */
async function closeTab(tab) {
    if (!tab || !tabs.includes(tab)) return;
    if (tab.doc && tab.doc.dirty) {
        activateTab(tab);
        if (!(await confirmClose(tab.doc))) return;
    }
    const idx = tabs.indexOf(tab);
    tabs.splice(idx, 1);
    disposeTab(tab);
    if (tabs.length === 0) {
        activeTab = null;
        if (tab.kind === 'start' || isQuitting) {
            mainForceClose = true;
            if (mainWin && !mainWin.isDestroyed()) mainWin.close();
        } else {
            showStartTab();
        }
        return;
    }
    if (activeTab === tab) activateTab(tabs[Math.min(idx, tabs.length - 1)]);
    else { layout(); sendTabs(); }
}

function showStartTab() {
    const existing = tabs.find((t) => t.kind === 'start');
    if (existing) { activateTab(existing); return; }
    addTab('start', null);
}

/** Ask what to do with unsaved changes. Resolves true when the tab may close. */
async function confirmClose(doc) {
    const { response } = await dialog.showMessageBox(mainWin, {
        type: 'warning',
        buttons: ['Save', "Don't Save", 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        noLink: true,
        title: 'PyAMS',
        message: 'Do you want to save the changes you made to "' + doc.name + '.' + doc.fileType + '"?',
        detail: "Your changes will be lost if you don't save them.",
        icon: nativeImage.createFromPath(ICON_PNG).resize({ width: 64, height: 64 })
    });
    if (response === 2) return false;
    if (response === 0) return await saveDoc(doc, false);
    return true;
}

function openDocument(fileType, filePath, content, displayName) {
    const doc = new Doc(fileType, filePath, content, displayName);
    const start = tabs.find((t) => t.kind === 'start');
    addTab('doc', doc);
    if (start) closeTab(start);
    return doc;
}

function newDocument(fileType) {
    return openDocument(fileType, null, '', null);
}

function openFilePath(filePath) {
    try {
        filePath = path.resolve(filePath);
        const type = typeOfFile(filePath);
        if (!type) {
            dialog.showErrorBox('PyAMS', 'Unsupported file type: ' + path.basename(filePath) + '\nPyAMS opens .dcs (circuit) and .sym (symbol) files.');
            return null;
        }
        for (const d of docs.values()) {
            if (d.filePath && path.resolve(d.filePath) === filePath) {
                if (mainWin && mainWin.isMinimized()) mainWin.restore();
                activateTab(d.tab);
                return d;
            }
        }
        const content = fs.readFileSync(filePath, 'utf8');
        settings.addRecent(filePath);
        settings.set('lastDir', path.dirname(filePath));
        buildMenu();
        return openDocument(type, filePath, content, null);
    } catch (err) {
        dialog.showErrorBox('PyAMS', 'Could not open the file:\n' + filePath + '\n\n' + err.message);
        settings.removeRecent(filePath);
        buildMenu();
        return null;
    }
}

/** Open one of the bundled examples as an untitled copy (the install folder may be read-only). */
function openExample(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const type = typeOfFile(filePath) || 'dcs';
        return openDocument(type, null, content, path.basename(filePath, path.extname(filePath)));
    } catch (err) {
        dialog.showErrorBox('PyAMS', 'Could not open the example:\n' + err.message);
        return null;
    }
}

function showNewMenu() {
    Menu.buildFromTemplate([
        { label: 'New Circuit', accelerator: 'CmdOrCtrl+N', click: () => newDocument('dcs') },
        { label: 'New Symbol', accelerator: 'CmdOrCtrl+Shift+N', click: () => newDocument('sym') },
        { type: 'separator' },
        { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => openFileDialog(mainWin) },
        { label: 'Start Page', click: () => showStartTab() }
    ]).popup({ window: mainWin });
}

function showPythonMenu() {
    Menu.buildFromTemplate([
        { label: 'Check Python Environment', click: () => checkPython() },
        { label: 'Set Python Path...', click: () => setPythonPath() },
        { label: 'Use Automatic Python Detection', click: () => resetPythonPath() }
    ]).popup({ window: mainWin });
}

ipcMain.on('shell:activate', (_e, id) => activateTab(tabs.find((t) => t.id === id)));
ipcMain.on('shell:close', (_e, id) => { closeTab(tabs.find((t) => t.id === id)); });
ipcMain.on('shell:newMenu', () => showNewMenu());
ipcMain.on('shell:pythonMenu', () => showPythonMenu());
ipcMain.on('shell:ready', () => { sendTabs(); sendStatus(); });
ipcMain.on('shell:move', (_e, { id, to }) => {
    const from = tabs.findIndex((t) => t.id === id);
    if (from < 0 || to < 0 || to >= tabs.length) return;
    const [t] = tabs.splice(from, 1);
    tabs.splice(to, 0, t);
    sendTabs();
});

async function openFileDialog(parent) {
    const res = await dialog.showOpenDialog(parent || undefined, {
        title: 'Open',
        defaultPath: defaultDir(),
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'PyAMS files (*.dcs, *.sym)', extensions: ['dcs', 'sym'] },
            { name: 'DCS Circuit', extensions: ['dcs'] },
            { name: 'Symbol File', extensions: ['sym'] },
            { name: 'All files', extensions: ['*'] }
        ]
    });
    if (!res.canceled) res.filePaths.forEach(openFilePath);
}

async function getLiveContent(doc) {
    try {
        const c = await doc.view.webContents.executeJavaScript(
            'window.__pyamsGetContent ? window.__pyamsGetContent() : null');
        return typeof c === 'string' ? c : null;
    } catch (e) {
        return null;
    }
}

/** Save the document. Resolves true when the file was written. */
async function saveDoc(doc, saveAs) {
    let target = doc.filePath;
    if (!target || saveAs) {
        const t = FILE_TYPES[doc.fileType];
        const res = await dialog.showSaveDialog(mainWin, {
            title: saveAs ? 'Save As' : 'Save',
            defaultPath: doc.filePath || path.join(defaultDir(), doc.name + '.' + t.ext),
            filters: [{ name: t.name, extensions: [t.ext] }, { name: 'All files', extensions: ['*'] }]
        });
        if (res.canceled || !res.filePath) return false;
        target = res.filePath;
        if (!path.extname(target)) target += '.' + t.ext;
    }

    // Serialize what is on screen right now (also covers a document that was never edited).
    let content = await getLiveContent(doc);
    if (content === null) content = doc.content;
    else doc.history[doc.index] = content;

    try {
        fs.writeFileSync(target, content, 'utf8');
    } catch (err) {
        dialog.showErrorBox('PyAMS', 'Could not save the file:\n' + target + '\n\n' + err.message);
        return false;
    }
    doc.filePath = target;
    doc.savedIndex = doc.index;
    settings.addRecent(target);
    settings.set('lastDir', path.dirname(target));
    buildMenu();
    updateTitle(doc);
    send(doc, { type: 'setFileName', fileName: doc.name });
    toast(doc, 'Saved: ' + target, 'success');
    return true;
}

function applyHistory(doc, delta) {
    const next = doc.index + delta;
    if (next < 0 || next >= doc.history.length) return;
    doc.index = next;
    updateTitle(doc);
    send(doc, { type: 'update', content: doc.content, fileType: doc.fileType });
}

// ---------------------------------------------------------------------------------------------
// Messages coming from the editor page (the former webview protocol)
// ---------------------------------------------------------------------------------------------
function findSymFiles(root, depth, out) {
    if (out.length >= 500 || depth < 0) return;
    let entries;
    try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch (e) { return; }
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        const full = path.join(root, entry.name);
        if (entry.isDirectory()) findSymFiles(full, depth - 1, out);
        else if (entry.isFile() && entry.name.toLowerCase().endsWith('.sym')) out.push(full);
    }
}

async function handleMessage(doc, message) {
    if (!message || typeof message.type !== 'string') return;
    const post = (m) => send(doc, m);
    // the "workspace" (project symbols and python models) is the folder of this document
    Workspace.setProvider(() => (doc.filePath ? [path.dirname(doc.filePath)] : []));

    switch (message.type) {
        case 'ready':
            post({ type: 'update', content: doc.content, fileType: doc.fileType });
            post({ type: 'setFileName', fileName: doc.name });
            break;

        case 'contentChanged':
        case 'save':
            doc.push(String(message.content));
            updateTitle(doc);
            // The editor expects the echo (it ignores it once, because it caused the change).
            post({ type: 'update', content: doc.content, fileType: doc.fileType });
            break;

        case '__undo': applyHistory(doc, -1); break;
        case '__redo': applyHistory(doc, +1); break;

        case 'copyData':
            clipboard.writeText(String(message.data == null ? '' : message.data));
            break;

        case 'saveCsv': {
            try {
                const base = safeFileBase(message.name, 'plot');
                const res = await dialog.showSaveDialog(mainWin, {
                    defaultPath: path.join(doc.filePath ? path.dirname(doc.filePath) : defaultDir(), base + '.csv'),
                    filters: [{ name: 'CSV file', extensions: ['csv'] }],
                    buttonLabel: 'Save CSV'
                });
                if (!res.canceled && res.filePath) {
                    // UTF-8 with BOM so Excel reads the file correctly
                    fs.writeFileSync(res.filePath, Buffer.from('﻿' + String(message.text), 'utf-8'));
                    toast(doc, 'CSV saved: ' + res.filePath, 'success');
                }
            } catch (err) {
                toast(doc, 'Could not save CSV: ' + err.message, 'error');
            }
            break;
        }

        case 'savePngError':
            toast(doc, 'Could not create plot image: ' + message.error, 'error');
            break;

        case 'savePng': {
            try {
                const base = safeFileBase(message.name, 'plot');
                const res = await dialog.showSaveDialog(mainWin, {
                    defaultPath: path.join(doc.filePath ? path.dirname(doc.filePath) : defaultDir(), base + '.png'),
                    filters: [{ name: 'PNG image', extensions: ['png'] }],
                    buttonLabel: 'Save plot'
                });
                if (!res.canceled && res.filePath) {
                    const b64 = String(message.dataUrl).replace(/^data:image\/png;base64,/, '');
                    fs.writeFileSync(res.filePath, Buffer.from(b64, 'base64'));
                    toast(doc, 'Plot saved: ' + res.filePath, 'success');
                }
            } catch (err) {
                toast(doc, 'Could not save plot: ' + err.message, 'error');
            }
            break;
        }

        case 'getLibraryFiles': {
            const scan = await LibrarySync.scanPyamsModels(DATA_ROOT);
            post({ type: 'libraryFilesResult', libFiles: scan.files || [], error: scan.error || null });
            break;
        }

        case 'getListParameter': {
            const data = await LibrarySync.listParameters(DATA_ROOT, message.code);
            post({ type: 'listParameterResult', data });
            break;
        }

        case 'updateDataSymbols': {
            const result = await SymbolsSync.sync(null, { extensionPath: DATA_ROOT });
            if (result) post({ type: 'symbolsDataUpdated', data: result });
            break;
        }

        case 'readSymFiles': {
            // a list entry of the opened project ("Project", "Project/sub") points to its own folder,
            // the others to the bundled symbols library
            const base = path.join(DATA_ROOT, 'symbols');
            const projectDir = SymbolsSync.workspaceDirs.get(String(message.dir || ''));
            const targetDir = projectDir || path.resolve(base, String(message.dir || ''));
            const contents = [];
            if ((projectDir || isInside(base, targetDir)) && Array.isArray(message.files)) {
                for (const file of message.files) {
                    const filePath = path.resolve(targetDir, String(file));
                    try {
                        if (!isInside(targetDir, filePath)) throw new Error('path outside the symbols folder');
                        contents.push(fs.readFileSync(filePath, 'utf8'));
                    } catch (e) {
                        console.error('Error reading', filePath, e.message);
                        contents.push(null);
                    }
                }
            }
            post({ type: 'symFilesContent', contents });
            break;
        }

        case 'readSymFilesFromWorkSpace': {
            // The "workspace" of the desktop app is the folder of the open document.
            const files = [];
            if (doc.filePath) findSymFiles(path.dirname(doc.filePath), 3, files);
            const contents = files.map((f) => {
                try { return fs.readFileSync(f, 'utf8'); } catch (e) { return null; }
            });
            post({ type: 'symFilesFromWorkSpaceContent', contents });
            break;
        }

        // ---------------------------------- PyAMS analysis (Python) -------------------------------
        case 'startPyAMSAnalysis': {
            if (doc.pyamsRun) { doc.pyamsRun.kill(); doc.pyamsRun = null; }
            doc.pyamsRun = LibrarySync.startPyAMSAnalysis(DATA_ROOT, message.code, message.analysis, (ev) => {
                if (ev.event === 'progress') {
                    post({ type: 'simulationProgress', progress: Math.round(ev.fraction * 100) });
                } else if (ev.event === 'log') {
                    post({ type: 'simulationLog', message: ev.message, logType: ev.level || 'info' });
                } else if (ev.event === 'result') {
                    post({ type: 'pyamsAnalysisComplete', data: ev.data });
                } else if (ev.event === 'error') {
                    post({ type: 'pyamsAnalysisError', error: ev.message, line: ev.line || null });
                }
            });
            break;
        }

        case 'stopPyAMSAnalysis':
            if (doc.pyamsRun) { doc.pyamsRun.kill(); doc.pyamsRun = null; }
            break;

        // ---------------------------------- PyAMS DC operating point ------------------------------
        case 'startPyAMSOp':
            if (doc.pyamsOpRun) { doc.pyamsOpRun.kill(); doc.pyamsOpRun = null; }
            doc.pyamsOpRun = LibrarySync.startPyAMSAnalysis(DATA_ROOT, message.code, { type: 'op' },
                (ev) => post({ type: 'pyamsOpEvent', event: ev }));
            break;

        case 'stopPyAMSOp':
            if (doc.pyamsOpRun) { doc.pyamsOpRun.kill(); doc.pyamsOpRun = null; }
            break;

        case 'cursorPos':
            doc.pos = message.pos || null;
            if (activeTab && activeTab.doc === doc) sendStatus();
            break;

        case 'zoomChanged':
            doc.zoom = message.zoom;
            if (activeTab && activeTab.doc === doc) sendStatus();
            break;

        default:
            break;
    }
}

ipcMain.on('host:post', (event, message) => {
    const doc = docs.get(event.sender.id);
    if (!doc) return;
    handleMessage(doc, message).catch((err) => {
        console.error('Error while handling "' + (message && message.type) + '":', err);
        toast(doc, 'Internal error: ' + err.message, 'error');
    });
});

ipcMain.on('host:info', (event) => {
    const doc = docs.get(event.sender.id);
    event.returnValue = {
        extensionPath: DATA_ROOT,
        libraryPath: path.join(DATA_ROOT, 'library'),
        workspacePath: doc && doc.filePath ? path.dirname(doc.filePath) : '',
        platform: process.platform,
        version: app.getVersion()
    };
});

ipcMain.on('host:openPaths', (_event, paths) => {
    (Array.isArray(paths) ? paths : []).forEach((p) => {
        if (typeof p === 'string' && typeOfFile(p)) openFilePath(p);
    });
});

// ---------------------------------------------------------------------------------------------
// Start (welcome) window
// ---------------------------------------------------------------------------------------------
function listExamples() {
    const dir = path.join(DATA_ROOT, 'demo');
    try {
        return fs.readdirSync(dir)
            .filter((f) => typeOfFile(f))
            .sort((a, b) => a.localeCompare(b))
            .map((f) => ({ name: path.basename(f, path.extname(f)), path: path.join(dir, f) }));
    } catch (e) {
        return [];
    }
}

ipcMain.handle('start:getInfo', () => ({
    version: app.getVersion(),
    recent: settings.get('recent').map((p) => ({ name: path.basename(p), dir: path.dirname(p), path: p })),
    examples: listExamples()
}));

ipcMain.on('start:action', (_event, { action, arg }) => {
    switch (action) {
        case 'new-circuit': newDocument('dcs'); break;
        case 'new-symbol': newDocument('sym'); break;
        case 'open': openFileDialog(mainWin); break;
        case 'open-recent': if (typeof arg === 'string') openFilePath(arg); break;
        case 'open-example': if (typeof arg === 'string' && isInside(path.join(DATA_ROOT, 'demo'), path.resolve(arg))) openExample(arg); break;
        case 'docs': shell.openExternal('https://pyams-lib.readthedocs.io'); break;
        case 'website': shell.openExternal('https://pyams.sf.net/'); break;
        default: break;
    }
});

// ---------------------------------------------------------------------------------------------
// Tools: Python
// ---------------------------------------------------------------------------------------------
async function setPythonPath() {
    const res = await dialog.showOpenDialog({
        title: 'Select the Python interpreter (python / python3)',
        properties: ['openFile'],
        filters: process.platform === 'win32'
            ? [{ name: 'Python executable', extensions: ['exe'] }, { name: 'All files', extensions: ['*'] }]
            : undefined
    });
    if (res.canceled || !res.filePaths[0]) return;
    settings.set('pythonPath', res.filePaths[0]);
    applyPythonSetting();
    detectPython();
    await checkPython();
}

async function resetPythonPath() {
    settings.set('pythonPath', '');
    applyPythonSetting();
    detectPython();
    await checkPython();
}

async function checkPython() {
    const script = [
        'import sys',
        'print("Python " + sys.version.split()[0] + "  (" + sys.executable + ")")',
        'for m in ("numpy", "matplotlib"):',
        '    try:',
        '        mod = __import__(m)',
        '        print(m + " " + mod.__version__ + "  OK")',
        '    except Exception:',
        '        print(m + "  MISSING  ->  pip install " + m)'
    ].join('\n');
    const run = await LibrarySync.runPython(['-c', script], { timeout: 20000 });
    const ok = !run.error && /numpy .*OK/.test(run.stdout) && /matplotlib .*OK/.test(run.stdout);
    await dialog.showMessageBox(mainWin || undefined, {
        type: ok ? 'info' : 'warning',
        title: 'Python environment',
        message: ok ? 'Python environment is ready' : 'Python environment needs attention',
        detail: (run.error ? run.error + '\n\n' : '') + (run.stdout || '') + (run.stderr ? '\n' + run.stderr : '') +
            '\n\nConfigured interpreter: ' + (settings.get('pythonPath') || '(automatic)') +
            '\nPyAMS simulations need Python 3 with numpy and matplotlib.',
        buttons: ['OK']
    });
}

// ---------------------------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------------------------
function sendToFocused(message) {
    const doc = focusedDoc();
    if (doc) send(doc, message);
}

function buildMenu() {
    const isMac = process.platform === 'darwin';
    const recent = settings ? settings.get('recent') : [];

    const recentItems = recent.length
        ? recent.map((p) => ({ label: p, click: () => openFilePath(p) }))
            .concat([{ type: 'separator' }, { label: 'Clear Recent', click: () => { settings.clearRecent(); buildMenu(); } }])
        : [{ label: 'No recent files', enabled: false }];

    const exampleItems = listExamples().map((ex) => ({ label: ex.name, click: () => openExample(ex.path) }));

    const template = [
        ...(isMac ? [{ role: 'appMenu' }] : []),
        {
            label: '&File',
            submenu: [
                { label: 'New &Circuit', accelerator: 'CmdOrCtrl+N', click: () => newDocument('dcs') },
                { label: 'New &Symbol', accelerator: 'CmdOrCtrl+Shift+N', click: () => newDocument('sym') },
                { type: 'separator' },
                { label: '&Open...', accelerator: 'CmdOrCtrl+O', click: () => openFileDialog(mainWin) },
                { label: 'Open &Recent', submenu: recentItems },
                { label: 'Open E&xample', submenu: exampleItems.length ? exampleItems : [{ label: 'No examples found', enabled: false }] },
                { type: 'separator' },
                { label: '&Save', accelerator: 'CmdOrCtrl+S', click: () => { const d = focusedDoc(); if (d) saveDoc(d, false); } },
                { label: 'Save &As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => { const d = focusedDoc(); if (d) saveDoc(d, true); } },
                { type: 'separator' },
                { label: 'Show in Folder', click: () => { const d = focusedDoc(); if (d && d.filePath) shell.showItemInFolder(d.filePath); } },
                { type: 'separator' },
                { label: '&Close Tab', accelerator: 'CmdOrCtrl+W', click: () => closeTab(activeTab) },
                ...(isMac ? [] : [{ label: 'E&xit', accelerator: 'Alt+F4', click: () => app.quit() }])
            ]
        },
        {
            label: '&Edit',
            submenu: [
                { label: '&Undo', accelerator: 'CmdOrCtrl+Z', click: () => sendToFocused({ type: 'execUndo' }) },
                { label: '&Redo', accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y', click: () => sendToFocused({ type: 'execRedo' }) },
                { type: 'separator' },
                { label: 'Cu&t', accelerator: 'CmdOrCtrl+X', click: () => sendToFocused({ type: 'execCut' }) },
                { label: '&Copy', accelerator: 'CmdOrCtrl+C', click: () => sendToFocused({ type: 'execCopy' }) },
                { label: '&Paste', accelerator: 'CmdOrCtrl+V', click: () => sendToFocused({ type: 'execPaste', data: clipboard.readText() }) }
            ]
        },
        {
            label: '&View',
            submenu: [
                { label: 'Zoom &In', accelerator: 'CmdOrCtrl+=', click: () => sendToFocused({ type: 'execZoomIn' }) },
                { label: 'Zoom &Out', accelerator: 'CmdOrCtrl+-', click: () => sendToFocused({ type: 'execZoomOut' }) },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                { type: 'separator' },
                { label: 'Next Tab', accelerator: 'Ctrl+Tab', click: () => { if (tabs.length > 1) activateTab(tabs[(tabs.indexOf(activeTab) + 1) % tabs.length]); } },
                { label: 'Previous Tab', accelerator: 'Ctrl+Shift+Tab', click: () => { if (tabs.length > 1) activateTab(tabs[(tabs.indexOf(activeTab) + tabs.length - 1) % tabs.length]); } },
                { type: 'separator' },
                { label: 'Reload Editor', accelerator: 'CmdOrCtrl+R', click: () => { if (activeTab) activeTab.view.webContents.reload(); } },
                { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', click: () => { if (activeTab) activeTab.view.webContents.toggleDevTools(); } }
            ]
        },
        {
            label: '&Tools',
            submenu: [
                { label: 'Check Python &Environment', click: () => checkPython() },
                { label: 'Set Python &Path...', click: () => setPythonPath() },
                { label: 'Use Automatic Python Detection', click: () => resetPythonPath() },
                { type: 'separator' },
                { label: 'Open Examples Folder', click: () => shell.openPath(path.join(DATA_ROOT, 'demo')) }
            ]
        },
        {
            role: 'help',
            label: '&Help',
            submenu: [
                { label: 'PyAMS &Documentation', click: () => shell.openExternal('https://pyams-lib.readthedocs.io') },
                { label: 'PyAMS &Website', click: () => shell.openExternal('https://pyams.sf.net/') },
                { label: 'Report an &Issue', click: () => shell.openExternal('https://github.com/d-fathi/PyAMS/issues') },
                { label: 'Start Page', click: () => showStartTab() },
                { type: 'separator' },
                { label: '&About PyAMS', click: () => showAbout() }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showAbout() {
    dialog.showMessageBox(mainWin || undefined, {
        type: 'info',
        title: 'About PyAMS',
        message: 'PyAMS ' + app.getVersion(),
        detail: 'Python for Analog and Mixed Signals\n' +
            'Schematic capture, symbol design and circuit simulation.\n\n' +
            'https://pyams.sf.net/\nLicense: MIT\n\n' +
            'Electron ' + process.versions.electron + '  •  Chromium ' + process.versions.chrome + '  •  Node ' + process.versions.node,
        icon: nativeImage.createFromPath(ICON_PNG).resize({ width: 96, height: 96 }),
        buttons: ['OK']
    });
}

// ---------------------------------------------------------------------------------------------
// Application life cycle
// ---------------------------------------------------------------------------------------------
function filesFromArgv(argv) {
    const args = app.isPackaged ? argv.slice(1) : argv.slice(2);
    return args.filter((a) => !a.startsWith('-') && typeOfFile(a) && fs.existsSync(a));
}

if (process.platform === 'win32') app.setAppUserModelId('net.sf.pyams.software');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
} else {
    app.on('second-instance', (_event, argv) => {
        const files = filesFromArgv(argv);
        if (mainWin && mainWin.isMinimized()) mainWin.restore();
        if (files.length) files.forEach(openFilePath);
        else if (mainWin) mainWin.focus();
        else showStartTab();
    });

    app.on('open-file', (event, filePath) => {   // macOS
        event.preventDefault();
        if (app.isReady()) openFilePath(filePath); else pendingOpen.push(filePath);
    });

    app.on('before-quit', () => { isQuitting = true; });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', () => {   // macOS dock click
        if (!mainWin) showStartTab();
    });

    app.whenReady().then(() => {
        settings = new Settings(app.getPath('userData'));
        applyPythonSetting();
        buildMenu();

        const files = filesFromArgv(process.argv).concat(pendingOpen);
        if (files.length) files.forEach(openFilePath);
        else showStartTab();
        detectPython();
    });
}
