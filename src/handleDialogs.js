
const { ipcMain, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const config = require('./config');



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


// editor of codePy
let editWindowCodePy;

async function createEditWindowCodePy(text,caption) {
    return new Promise((resolve) => {
      editWindowCodePy = new BrowserWindow({
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
        var pathpage=path.join(__dirname,'dialogs','editCodePy.html')
        
        editWindowCodePy.loadFile(pathpage);

        editWindowCodePy.webContents.once('did-finish-load', () => {
            editWindowCodePy.webContents.send('set-codePy', text);
        });

        ipcMain.once('save-edited-codePy', (event, newText) => {
            resolve(newText); // ⬅️ return to `index.html`
            if (editWindowCodePy) {
                editWindowCodePy.close();
                editWindowCodePy = null;
            }
        });
    });
}


ipcMain.handle('edit-codePy', async (event, text,caption) => {
    return await createEditWindowCodePy(text,caption);
});

//Python path dialog--------------------------------------------------------------------------

let pythonPathWindow = null;

ipcMain.on('dialog-python-path', () => {
  if (!pythonPathWindow) {
      pythonPathWindow = new BrowserWindow({
          width: 500,
          height: 300,
          parent: BrowserWindow.getFocusedWindow(),
          icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
          modal: true,
          resizable: false,
          minimizable: false,
          maximizable: false,
          title: "python Path",
          autoHideMenuBar: true,
          webPreferences: {
              preload: path.join(__dirname, 'preload.js'),
              contextIsolation: true
          }
      });

      pythonPathWindow.loadFile(path.join(__dirname, 'dialogs','pythonPath.html'));

        pythonPathWindow.webContents.once('did-finish-load', () => {
                const folderPath = path.join(config.folderPath, 'python');
                const dirs = fs.readdirSync(folderPath).filter(f => {
                    return fs.statSync(path.join(folderPath, f)).isDirectory();
    });
            const dirsWithPath = dirs.map(f => path.join(folderPath, f));
            pythonPathWindow.webContents.send('python-folders',dirs, dirsWithPath  );
        });

      pythonPathWindow.on('closed', () => {
          pythonPathWindow = null;
      });
  }
});


ipcMain.handle('save-python-folder', async (event, folder) => {
const folderPath = folder//path.join(__dirname, 'python', folder);
const configPath = path.join(config.folderPath,'python', 'config.json');
let _json = {};
if (fs.existsSync(configPath)) {
    try {
        _json = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
        _json = {};
    }
}
_json.pythonPath = folderPath;
fs.writeFileSync(configPath, JSON.stringify(_json, null, 2), 'utf-8');
return true;    
});

ipcMain.handle('get-python-folder', async () => {
    const configPath = path.join(config.folderPath,'python', 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            const _json = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            console.log("Python Path:", _json.pythonPath);
            return _json.pythonPath || null;
        } catch (e) {
            return null;
        }
    }
    return null;
});

 


//About dialog--------------------------------------------------------------------------

let dialogWindow = null;

ipcMain.on('open-dialog-about', () => {
  if (!dialogWindow) {
      dialogWindow = new BrowserWindow({
          width: 600,
          height: 420,
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
        dialogWindow.loadURL('https://pyams.sourceforge.io/doc/Models.html');
  
        dialogWindow.on('closed', () => {
            dialogWindow = null;
        });
    }
  });
  
