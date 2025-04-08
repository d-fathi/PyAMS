// main.js (Electron Main Process)
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

const handleDialogs = require('./handleDialogs');
const { startEditor } = require('./handleEditor');
const { setupHandlersParam } = require('./handleParam');
const { handlersListSignalsParams } = require('./handleListSignalsParams');
const handleExecPyAMS = require('./handleExecPyAMS');
const handleGestionLibrary = require('./handleGestionLibrary');

const path = require('path');
const fs = require('fs');
const creatApp=false;

const config = require('./config');


//Creat PyAMS Interface--------------------------------------------------------------------
let mainWindow;


app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    maximized: true,
    icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
    autoHideMenuBar: true,
    webPreferences: {
      preload:path.join(__dirname,'preload.js'), 
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  mainWindow.maximize();
  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'r') {
        event.preventDefault();
    }
});



  mainWindow.on('close', (event) => {
    event.preventDefault(); 
    mainWindow.webContents.send('request-close-IDE'); 
  });



  //handleDialogs.startDialogs(mainWindow);
  startEditor(mainWindow);
  setupHandlersParam(mainWindow);
  handlersListSignalsParams(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.on('close-window-IDE', () => {
  mainWindow.destroy();
 mainWindow = null;
});



// IPC listener for file dialog---------------------------------------------------------------------------------------------
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select a File',
      modal: true,
      buttonLabel: 'Open',
      properties: ['openFile'],
      filters: [{ name: 'Designing Circuits and Simulation (*.dcs)', extensions: [ 'dcs'] },
                { name: 'symbol file (*.sym)', extensions: [ 'sym'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const fileExtension = path.extname(filePath).slice(1); 
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileName= path.basename(filePath);
      return { filePath, fileContent, fileExtension, fileName};
  }
  return null;
});



// library (data.json) open and read---------------------------------------------------------------------

//Find all subfolders that contain files `.sym`
function findValidFolders(basePath) {
  let validFolders = [];

  function search(directory) {
      const items = fs.readdirSync(directory, { withFileTypes: true });
      let hasSymFile = false;

      for (let item of items) {
          const fullPath = path.join(directory, item.name);
          if (item.isDirectory()) {
              search(fullPath);
          } else if (item.isFile() && item.name.endsWith('.sym')) {
              hasSymFile = true;
          }
      }

      if (hasSymFile) {
          validFolders.push(path.relative(basePath, directory)); // save dierc
      }
  }

  search(basePath);
  return validFolders;
}

ipcMain.handle('read-library-file', async () => {

  const libraryPath = path.join(config.folderPath, 'models');
  const dataFilePath = path.join(config.folderPath,'models','data.json');

  let data =JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  let newData = { libs: [] };
   
  console.log(libraryPath);
  const validFolders = findValidFolders(libraryPath);

  newData.libs = [...new Set([...data.libs, ...validFolders])].filter(folder => validFolders.includes(folder)); // Keep order and delete empty ones

  // تحديث محتويات كل مجلد مع الاحتفاظ بترتيب الملفات
  validFolders.forEach(folder => {
      const folderPath = path.join(libraryPath, folder);
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.sym'));

      if (!data[folder]) {
          newData[folder] = files; // مجلد جديد، أضفه كما هو
      } else {
          let oldFiles = data[folder] || [];
          let updatedFiles = [...new Set([...oldFiles, ...files])]; // الحفاظ على ترتيب القديم وإضافة الجديد
          newData[folder] = updatedFiles.filter(file => files.includes(file)); // حذف الملفات غير الموجودة
      }
  });

  
  // حفظ البيانات في JSON
  fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 4), 'utf-8');

  return newData;

/*  const filePath = path.join(config.folderPath,'library', 'library.txt'); //path of file
  try {
      const data = fs.readFileSync(filePath, 'utf8'); // read file
      const jsonData = JSON.parse(data.replace(/'/g, '"')); // convert to json
      return jsonData;
  } catch (error) {
      console.error("error for read", error);
      return { error: "cont read file" };
  }*/
});


// Read files based on library name---------------------------------------------------------------
ipcMain.handle('get-library-files', async (event, libraryName, files) => {

  try {

        let fileContents = []; // Store file contents here
        


        for (const file of files) {
            const fullPath = path.join(config.folderPath,'models',libraryName, file);
            
            try {
                
                fileContents.push({'sym':fs.readFileSync(fullPath, 'utf8'),'name':file.split('.')[0]}); // Read the file content
            } catch (error) {
                
            }
          }
     return {fileContents}

  } catch (error) {
      console.error("File read error:", error);
      return { error: "Unable to read file" };
  }
});


// Display a confirmation message and return the result to `index.html`
ipcMain.handle('show-confirmation-dialog', async (event, message) => {
  const result = await dialog.showMessageBox(mainWindow,{
      type: 'question',
      modal: true,
      buttons: ["Save","Don't save","Cancel"], // The first button is the default.
      defaultId: 2, // Makes "OK" the default
      title: 'Message Box',
      noLink: true,
      message: message
  });

  return result.response; // Return `true` if the user presses OK, otherwise `false`
});

//Get exePath -----------------------------------------------------------------------
ipcMain.handle('get-exe-path', async (event) => {
     return config.folderPath;
});


// show alaert message----------------------------------------------------------------
ipcMain.on('show-alert', (event, title, message) => {
  dialog.showMessageBox(mainWindow, {
      type: 'info',
      modal: true,
      title: title,
      message: message,
      buttons: ['Ok']
  });
});



//Save as file---------------------------------------------------------------------------------
ipcMain.handle('save-as-file', async (event, filename, content, extension) => {
  
 if(extension=='sym')
  var description='Symbol file (*.sym)';
else
  var description='Designing Circuits and Simulation (*.dcs)';

  const { filePath } = await dialog.showSaveDialog(mainWindow,{
      title: 'Save as file',
      modal: true,
      defaultPath: filename,
      filters: [{ name: description , extensions: [extension] }]
  });

  if (filePath) {
      try {
          fs.writeFileSync(filePath, content, 'utf-8');
          return { success: true, path: filePath, fileName: path.basename(filePath)};
      } catch (error) {
          return { success: false, error: error.message };
      }
  }
  return { success: false, error: 'No file selected' };
});


//Save file--------------------------------------------------------------------------------------
ipcMain.handle('save-file', async (event, filename, content) => {

      try {
          fs.writeFileSync(filename, content, 'utf-8');
          return { success: true, path: filename };
      } catch (error) {
          return { success: false, error: error.message };
      }
  
});




