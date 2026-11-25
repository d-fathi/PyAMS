'use strict';
/* Preload script of the About window. */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pyamsAbout', {
    getInfo: () => ipcRenderer.invoke('about:getInfo'),
    openUrl: (url) => ipcRenderer.send('about:openUrl', url),
    close: () => ipcRenderer.send('about:close')
});
