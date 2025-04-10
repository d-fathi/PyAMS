

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    readLibraryFile: () => ipcRenderer.invoke('read-library-file'),
    getLibraryFiles: (libraryName,files) => ipcRenderer.invoke('get-library-files', libraryName,files),
    getExePath: () => ipcRenderer.invoke('get-exe-path'),
    showConfirmationDialog: (message) => ipcRenderer.invoke('show-confirmation-dialog', message),
    showAlert: (title, message) => ipcRenderer.send('show-alert', title, message),
    saveFile: (filename, content) => ipcRenderer.invoke('save-file', filename, content),
    saveAsFile: (filename, content, fileExtension) => ipcRenderer.invoke('save-as-file', filename, content, fileExtension),
    requestCloseIDE: (callback) => ipcRenderer.on('request-close-IDE', (event) => callback()),
    closeWindowIDE: () => ipcRenderer.send('close-window-IDE'),
    //ُEditor of python------------------------------------------------------------------------
    editText: (modelname,directory) => ipcRenderer.invoke('edit-text', modelname, directory),
    onSetDataLibrary: (callback) => ipcRenderer.on('set-data-library', (event,data) => callback(data)),
    libraryManagement:() => ipcRenderer.invoke('library-management'),
    sendLibrary: (newData) => ipcRenderer.send('save-library-json', newData),
    editFilePy: (filePython) => ipcRenderer.invoke('edit-file-py', filePython),
    onSetText: (callback) => ipcRenderer.on('set-text', (event, filePath,data) => callback(filePath,data)),
    closeEditor: (callback) => ipcRenderer.on('close-editor', (event) => callback()),
    closeWindowEditor: () => ipcRenderer.send('close-window-editor'),
    saveCloseWindowEditor: (data,filepath,type_) => ipcRenderer.invoke('save-close-window-editor',data,filepath,type_),
    openFileDialogEditor: () => ipcRenderer.invoke('open-file-dialog-editor'),
    saveAsWindowEditor: (data,filepath) => ipcRenderer.invoke('save-as-window-editor',data,filepath),
    openDialogAbout: () => ipcRenderer.send('open-dialog-about'),
    showConfirmationEditDialog: (message) => ipcRenderer.invoke('show-confirmation-edit-dialog', message),
    //Edit html------------------------------------------------------------------------------
    editTextHtml: (text,caption) => ipcRenderer.invoke('edit-text-html', text,caption),
    onSetTextHtml: (callback) => ipcRenderer.on('set-text-html', (event, text) => callback(text)),
    sendEditedTextHtml: (text) => ipcRenderer.send('save-edited-text-html', text),
    //Params----------------------------------------------------------------------------------
    getParams: (pythonScript) => ipcRenderer.invoke('get-params', pythonScript),
    editParams: (params, modelName) => ipcRenderer.invoke('edit-params', params, modelName),
    onSetParams: (callback) => ipcRenderer.on('set-params', (event, params, modelName) => callback(params, modelName)),
    sendEditedParams: (newParams) => ipcRenderer.send('save-edited-params', newParams),
    //In out signals/params-------------------------------------------------------------------
    getListSignalsParams: (data) => ipcRenderer.invoke('get-list-signals-params', data),
    listSignalsParams: (data,select) => ipcRenderer.invoke('list-signals-params', data,select),
    onSetList: (callback) => ipcRenderer.on('set-list', (event, data,select) => callback(data,select)),
    sendEditedList: (newSelect) => ipcRenderer.send('save-list-value', newSelect),
    //Execut Script python-------------------------------------------------------------------
    executOP: (data) => ipcRenderer.invoke('show-exec-op', data),
    //Analysis-------------------------------------------------------------------------------
    analysisDialog: (source) => ipcRenderer.invoke('analysis-dialog',source),
    startProgress: () => ipcRenderer.send("start-progress"),
    stopProgress: () => ipcRenderer.send("stop-progress"),
    onProgressUpdate: (callback) => ipcRenderer.on("progress-update", (event, data) => callback(data)),
    onRandomData: (callback) => ipcRenderer.on("random-data", (event, data) => callback(data)),
    sendPyData: (data) => ipcRenderer.send('send-python-data', data),
    //Help------------------------------------------------------------------------------------
    openBrowserWindow:(event, data)=> ipcRenderer.send('open-browser-window',event,  data),
});




