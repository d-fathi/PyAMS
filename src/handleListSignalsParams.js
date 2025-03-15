const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const config = require('./config');

function handlersListSignalsParams(mainWindow) {


    ipcMain.handle('get-list-signals-params', async (event, data) => {
        return new Promise((resolve, reject) => {

            const scriptPath = path.join(config.folderPath, 'temp_script.py');
            const pypyPath = path.join(config.folderPath, 'pypy', 'pypy.exe');
         
            fs.writeFileSync(scriptPath, data, 'utf8');

            exec(`"${pypyPath}" "${scriptPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error during execution: ${error.message}`);
                    reject(error.message);
                    return;
                }
                if (stderr) {
                    console.error(`⚠️ Warning: ${stderr}`);
                }
                console.log(`✅ Result: \n${stdout}`);

                try {
                    let parsedData = JSON.parse(stdout.trim());
                    mainWindow.webContents.send("params-data", parsedData);
                    resolve(parsedData);
                } catch (e) {
                    console.error("❌ JSON parsing error:", e.message);
                    reject("Error of JSON");
                }
            });
            // delete_file
           // fs.unlinkSync(scriptPath);
        });
    });

    ipcMain.handle('list-signals-params', async (event, data,select) => {
        return await createListWindow(data,select);
    });
}


let listWindow;

async function createListWindow(data,select) {
    return new Promise((resolve) => {
        listWindow = new BrowserWindow({
            width: 320,
            height: 410,
            parent: BrowserWindow.getFocusedWindow(),
            modal: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            autoHideMenuBar: true,
            icon: path.join(__dirname, 'build', 'logo_win.ico'), 
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });
        var pathpage=path.join(__dirname,'dialogs','list.html')
        listWindow.loadFile(pathpage);
        listWindow.webContents.once('did-finish-load', () => {
            listWindow.webContents.send('set-list', data, select);
        });

        ipcMain.once('save-list-value', (event, newSelect) => {
            resolve(newSelect);
            if (listWindow) {
                listWindow.close();
                listWindow = null;
            }
        });
    });
}

module.exports = {handlersListSignalsParams};
