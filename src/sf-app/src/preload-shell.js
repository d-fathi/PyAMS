'use strict';
/* Preload script of the main window shell (tab bar + status bar). */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pyamsShell', {
    onTabs: (cb) => ipcRenderer.on('shell:tabs', (_e, tabs) => cb(tabs)),
    onStatus: (cb) => ipcRenderer.on('shell:status', (_e, status) => cb(status)),
    activate: (id) => ipcRenderer.send('shell:activate', id),
    close: (id) => ipcRenderer.send('shell:close', id),
    move: (id, to) => ipcRenderer.send('shell:move', { id, to }),
    newMenu: () => ipcRenderer.send('shell:newMenu'),
    pythonMenu: () => ipcRenderer.send('shell:pythonMenu'),
    ready: () => ipcRenderer.send('shell:ready')
});
