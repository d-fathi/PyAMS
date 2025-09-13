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

//Get Python version-----------------------------------------------------------------------
ipcMain.handle('get-python-version', async (event) => {
    return new Promise((resolve, reject) => {
        const pyPath = getPythonFolder(); 
        if (!pyPath) {
            reject("Python path not set");
            return;
        }
        exec(`"${pyPath}" --version`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ خطأ أثناء الحصول على النسخة: ${error.message}`);
                reject(error.message);
                return;
            }
            if (stderr) {

                console.error(`⚠️ تحذير: ${stderr}`);
            }
            console.log(`✅ نسخة Python: ${stdout.trim()}`);
            resolve(stdout.trim());
        });
    });
});



// Executing Python script and returning results-----------------------------------------------------------------------
// editor of codePy
let editWindowCodePy;


async function createEditWindowCodePy(codeCircuit,codeAnalysis,caption) {
    return new Promise((resolve) => {
      editWindowCodePy = new BrowserWindow({
            width: 800,
            height: 850,
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
            editWindowCodePy.webContents.send('set-codePy', codeCircuit,codeAnalysis);
        });

        ipcMain.once('save-edited-codePy', (event, newText) => {
            resolve(newText); // ⬅️ return to `index.html`
            if (editWindowCodePy) {
                editWindowCodePy.close();
                editWindowCodePy = null;
            }
        });


                


        ipcMain.on("run-python-code", (event, code) => {
            if (pypyProcess) {
                console.log("PyPy process is already running.");
                return;
            }

            // Write the code to a temporary file
            const scriptPath = path.join(config.folderPath, 'temp_script.py');
            fs.writeFileSync(scriptPath,code , 'utf8');
            const pypyPath = getPythonFolder();
            console.log("Starting Python process...");
            pypyProcess = spawn(pypyPath, [scriptPath]);
    
                let buffer = "";

                pypyProcess.stdout.on("data", (data) => {
                    buffer += data.toString();

                    // تقسيم الإخراج إلى أسطر
                    let lines = buffer.split("\n");

                    // نحتفظ بآخر جزء لأنه قد يكون غير مكتمل
                    buffer = lines.pop();

                    for (let line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;

                        try {
                            const progressData = JSON.parse(trimmed);
                            editWindowCodePy.webContents.send("pyCode-progress", progressData);
                        } catch (error) {
                            // إذا لم يكن JSON نرسله كنص عادي
                            editWindowCodePy.webContents.send("pyCode-container", trimmed);
                        }
                    }
                });
    
                pypyProcess.stderr.on("data", (data) => {
                    console.error(`⚠️ stderr: ${data}`);
                    editWindowCodePy.webContents.send("pyCode-container", `⚠️ error: \n${data.toString()}`);
                });

                pypyProcess.on("close", (code) => {
                    console.log(`✅ انتهى PyPy برمز الخروج ${code}`);
                    // لو بقيت بيانات غير معالجة في buffer
                    if (buffer.trim()) {
                        try {
                            const lastData = JSON.parse(buffer.trim());
                            editWindowCodePy.webContents.send("pyCode-progress", lastData);
                        } catch {
                            editWindowCodePy.webContents.send("pyCode-container", buffer.trim());
                        }
                    }
                    buffer = "";
                    pypyProcess = null;
                    editWindowCodePy.webContents.send("pyCode-close");
                });
    });

        ipcMain.on("stop-python-execution", () => {
            if (pypyProcess) {
                console.log("🛑 Stope PyPy process...");
                pypyProcess.kill(); // stop process
                pypyProcess = null;
                editWindowCodePy.webContents.send("pyCode-close");
            } else {
                console.log("❌ PyPy process running.");
            }
        });


    });
    
}


ipcMain.handle('edit-codePy', async (event, codeCircuit,codeAnalysis,caption) => {
    return await createEditWindowCodePy(codeCircuit,codeAnalysis,caption);
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










