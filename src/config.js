
const { app } = require('electron');
const path = require('path');


const exePath = process.execPath;
const basePath = path.dirname(exePath);
const folderPath = __dirname;//app.getAppPath(); //;

module.exports = {
    folderPath
  };

 