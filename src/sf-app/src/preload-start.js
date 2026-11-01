'use strict';
/* Preload script of the Start (welcome) window. */
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('pyamsStart', {
    getInfo: () => ipcRenderer.invoke('start:getInfo'),
    action: (action, arg) => ipcRenderer.send('start:action', { action, arg })
});

window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;
        const paths = [];
        for (const f of files) {
            try { paths.push(webUtils.getPathForFile(f)); } catch (err) { /* ignore */ }
        }
        if (paths.length) ipcRenderer.send('host:openPaths', paths);
    });
});
