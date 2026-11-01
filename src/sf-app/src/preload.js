'use strict';
/*
 * Preload script of the editor window.
 * Replaces the VS Code webview bridge: the editor page (media/*) talks to the
 * main process through window.pyamsHost, and renderer/host-shim.js maps that to
 * the acquireVsCodeApi() / window "message" protocol the original code expects.
 */
const { contextBridge, ipcRenderer, webUtils } = require('electron');

const info = ipcRenderer.sendSync('host:info');

contextBridge.exposeInMainWorld('pyamsHost', {
    info,
    post: (message) => ipcRenderer.send('host:post', message),
    onMessage: (callback) => {
        ipcRenderer.on('host:message', (_event, message) => callback(message));
    }
});

// Dropping .dcs / .sym files on the window opens them (instead of navigating to the file).
window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('dragover', (e) => {
        if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
        }
    });
    document.addEventListener('drop', (e) => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;
        e.preventDefault();
        const paths = [];
        for (const f of files) {
            try { paths.push(webUtils.getPathForFile(f)); } catch (err) { /* ignore */ }
        }
        if (paths.length) ipcRenderer.send('host:openPaths', paths);
    });
});
