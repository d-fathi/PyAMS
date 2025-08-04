const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { spawn } = require("child_process");
const fs = require('fs');
const config = require('./config');

function getPythonFolder(){    
    
    const configPath = path.join(config.folderPath,'python', 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            const _json = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            return path.join(config.folderPath, 'python', _json.pythonPath, "python.exe") 
        } catch (e) {
            return null;
        }
    }
    return null;
}


ipcMain.handle('show-exec-op', async (event, data) => {
        return new Promise((resolve, reject) => {
           
            const scriptPath = path.join(config.folderPath, 'temp_script.py');
            const pypyPath =  getPythonFolder();
         
            fs.writeFileSync(scriptPath, data, 'utf8');

            exec(`"${pypyPath}" "${scriptPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ خطأ أثناء التنفيذ: ${error.message}`);
                    reject(error.message);
                    return;
                }
                if (stderr) {
                    console.error(`⚠️ تحذير: ${stderr}`);
                }
                console.log(`✅ النتيجة:\n${stdout}`);

                try {
                    let parsedData = JSON.parse(stdout.trim());
                    resolve(parsedData);
                } catch (e) {
                    console.error("❌ خطأ في تحليل JSON:", e.message);
                    reject("خطأ في JSON");
                }
            });
            // delete_file
           // fs.unlinkSync(scriptPath);
        });
    });







//Analysis dialog--------------------------------------------------------------------------


let analysisWindow;
let pypyProcess = null;

async function createAnalysisWindow(sourceCode) {
    return new Promise((resolve) => {
        analysisWindow = new BrowserWindow({
            width: 400,
            height: 495,
            parent: BrowserWindow.getFocusedWindow(), 
            modal: true,
            icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
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

      
       
        
        analysisWindow.loadFile(path.join(__dirname, 'dialogs','processAnalysis.html'));


        const scriptPath = path.join(config.folderPath, 'temp_script.py');
        fs.writeFileSync(scriptPath, sourceCode, 'utf8');


        ipcMain.on("start-progress", (event) => {
            if (pypyProcess) {
                console.log("PyPy process is already running.");
                return;
            }

            const scriptPath = path.join(config.folderPath, 'temp_script.py');
            const pypyPath = getPythonFolder();

            console.log("PyPy Path:", pypyPath);
            console.log("scriptPath:", scriptPath);
    
            console.log("Starting Python process...");
            pypyProcess = spawn(pypyPath, [scriptPath]);
    
            pypyProcess.stdout.on("data", (data) => {
                try {
                    
                   const progressData = JSON.parse(data.toString().trim());
                   analysisWindow.webContents.send("progress-update", progressData);
                   
    
                    if (progressData.progress === 100 && progressData.data) {
                        analysisWindow.webContents.send("random-data", progressData.data);
                    }
                } catch (error) {
                 //   console.log(error);
                    
                }
            });
    
            pypyProcess.stderr.on("data", (data) => {
                console.error(`Error: ${data}`);
            });
    
            pypyProcess.on("close", (code) => {
                console.log(`PyPy process exited with code ${code}`);
                pypyProcess = null;
            });
        });
    
    
    //stop-progress
    ipcMain.on("stop-progress", () => {
              if (pypyProcess) {
                  console.log("Stopping PyPy process...");
                  pypyProcess.kill(); // stop process
                  pypyProcess = null;
                  mainWindow.webContents.send("progress-update", { progress: 0, elapsed_time: "Stopped" });
              } else {
                  console.log("No PyPy process is running.");
              }
          });
    

       /* editWindowHtml.webContents.once('did-finish-load', () => {
            editWindowHtml.webContents.send('set-text-html', text);
        });*/

        ipcMain.once('send-python-data', (event, data) => {
            resolve(data); // ⬅️ return to `index.html`
            if (analysisWindow) {
                analysisWindow.close();
                analysisWindow = null;
                pypyProcess = null;
            }
        });
    });
}


ipcMain.handle('analysis-dialog', async (event, sourceCode) => {
    return await createAnalysisWindow(sourceCode);
});



module.exports = {
    getPythonFolder
  };










