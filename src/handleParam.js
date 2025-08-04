const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const config = require('./config');
const handleExecPyAMS = require('./handleExecPyAMS');



function setupHandlersParam(mainWindow) {


    ipcMain.handle('get-params', async (event, pythonScript) => {
        return new Promise((resolve, reject) => {
 
            const scriptPath = path.join(config.folderPath, 'temp_script.py');
            const pypyPath = handleExecPyAMS.getPythonFolder();
            
            fs.writeFileSync(scriptPath, pythonScript, 'utf8');
            exec(`"${pypyPath}" "${scriptPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error of exec: ${error.message}`);
                    console.error("🔍 Full error object:", error);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(`⚠️ Werning: ${stderr}`);
                }
                console.log(`✅ Result:\n${stdout}`);

                try {
                    let parsedData = JSON.parse(stdout.trim());
                    mainWindow.webContents.send("params-data", parsedData);
                    resolve(parsedData);
                } catch (e) {
                    console.error("Error read JSON:", e.message);
                    reject("Error read JSON");
                }
            });
            // delete_file
           // fs.unlinkSync(scriptPath);
        });
    });
    
    ipcMain.handle('edit-params', async (event, params, modelName) => {
        return await createEditParamsDialog(params, modelName);
    });
}

// Create an edit params dialog
let editParamsDialog;

async function createEditParamsDialog(params, modelName) {
    return new Promise((resolve) => {
        editParamsDialog = new BrowserWindow({
            width: 500,
            height: 310,
            parent: BrowserWindow.getFocusedWindow(),
            icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
            modal: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });

        
        editParamsDialog.loadFile(path.join(__dirname, 'dialogs',"params.html"));

        editParamsDialog.webContents.once('did-finish-load', () => {
            editParamsDialog.webContents.send('set-params', params, modelName);
        });

        ipcMain.once('save-edited-params', (event, newParams) => {
            resolve(newParams);
            if (editParamsDialog) {
                editParamsDialog.close();
                editParamsDialog = null;
            }
        });
    });
}

module.exports = { setupHandlersParam };
