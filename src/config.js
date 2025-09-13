
const { app } = require('electron');
const path = require('path');


const exePath = process.execPath;
const basePath = path.dirname(exePath);
const folderPath = app.getAppPath(); 

module.exports = {
    folderPath
};
