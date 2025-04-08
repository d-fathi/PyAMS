const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config');

let libraryManagementWindow;

async function createLibraryManagementWindow(data) {
    return new Promise((resolve) => {
        libraryManagementWindow = new BrowserWindow({
            width: 480,
            height: 410,
            parent: BrowserWindow.getFocusedWindow(), // ⬅️ Make it a sub-window
            icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
            modal: true,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });
       
        var pathIntarface=path.join(__dirname,"dialogs","library.html")
        libraryManagementWindow.loadFile(pathIntarface);
        libraryManagementWindow.webContents.once('did-finish-load', () => {
           libraryManagementWindow.webContents.send('set-data-library',data);
        });
       
       

        libraryManagementWindow.on("close", (event) => {
      
        event.preventDefault();
        libraryManagementWindow.destroy();
        libraryManagementWindow= null;
       });


     ipcMain.once('save-library-json', (event, newData) => {
        resolve(true);
        const dataFilePath = path.join(config.folderPath,'models','data.json');
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 4), 'utf-8');
        if (libraryManagementWindow) {
        libraryManagementWindow.close();
        libraryManagementWindow= null;
        }
        
               
            });
        
 
      
    });
}


ipcMain.handle('library-management', async (event) => {
      const dataFilePath = path.join(config.folderPath,'models','data.json');
      let data =JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    return await createLibraryManagementWindow(data);
});