
const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');


function startDialogs(mainWindow) {
    
}


// editor of html
let editWindowHtml;

async function createEditWindowHtml(text,caption) {
    return new Promise((resolve) => {
      editWindowHtml = new BrowserWindow({
            width: 800,
            height: 395,
            parent: BrowserWindow.getFocusedWindow(), 
            modal: true,
            icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            title: caption,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });
        var pathpage=path.join(__dirname,'dialogs','editHtml.html')
        
        editWindowHtml.loadFile(pathpage);

        editWindowHtml.webContents.once('did-finish-load', () => {
            editWindowHtml.webContents.send('set-text-html', text);
        });

        ipcMain.once('save-edited-text-html', (event, newText) => {
            resolve(newText); // ⬅️ return to `index.html`
            if (editWindowHtml) {
                editWindowHtml.close();
                editWindowHtml = null;
            }
        });
    });
}


ipcMain.handle('edit-text-html', async (event, text,caption) => {
    return await createEditWindowHtml(text,caption);
});



//About dialog--------------------------------------------------------------------------

let dialogWindow = null;

ipcMain.on('open-dialog-about', () => {
  if (!dialogWindow) {
      dialogWindow = new BrowserWindow({
          width: 500,
          height: 395,
          parent: BrowserWindow.getFocusedWindow(),
          icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
          modal: true,
          resizable: false,
          minimizable: false,
          maximizable: false,
          title: "About",
          autoHideMenuBar: true,
          webPreferences: {
              preload: path.join(__dirname, 'preload.js'),
              contextIsolation: true
          }
      });

      dialogWindow.loadFile(path.join(__dirname, 'dialogs','about.html'));

      dialogWindow.on('closed', () => {
          dialogWindow = null;
      });
  }
});


ipcMain.on('open-browser-window', (event, data) => {
    if (!dialogWindow) {
        dialogWindow = new BrowserWindow({
            width: 800,
            height: 695,
            parent: BrowserWindow.getFocusedWindow(),
            icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
            modal: true,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true
            }
        });
        console.log(data);
      if(data=="help")
        dialogWindow.loadURL('http://pyams.sf.net/doc');
      if(data=="webPage")
        dialogWindow.loadURL('http://pyams.sf.net/');
      if(data=="elements")
        dialogWindow.loadURL('https://pyams.sourceforge.io/doc/Elements.html');
  
        dialogWindow.on('closed', () => {
            dialogWindow = null;
        });
    }
  });
  
