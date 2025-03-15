



async function openFile(){
  const result = await window.electron.openFileDialog();
  if (result) {
    if(result.fileExtension=='sym')
      newSymbol();
    else 
      {
        drawing.newPage('dcs');
        const data = await window.electron.readLibraryFile();
        const libraryName=data['libs'][0];
        const files=data[libraryName];
        const files_ = await window.electron.getLibraryFiles(libraryName,files);
        addItemsToPageLibs(data['libs']);
        addListSymbToPageLibs(files_.fileContents);
      }
    

    drawing.setSymbol(result.fileContent);
    user={fileName:result.filePath,fileExtension:result.fileExtension,baseName:result.fileName};
    enable();
    updateListElements();
    displayByPageType();
  }    
  
}

async function updateLibrary() {
   const data = await window.electron.readLibraryFile();
   drawing.dirLibrary=[];
   data['libs'].forEach(item => drawing.dirLibrary.push(item));
   const libraryName=data['libs'][0];
   const files=data[libraryName];
   const files_ = await window.electron.getLibraryFiles(libraryName,files);
   addItemsToPageLibs(data['libs']);
   addListSymbToPageLibs(files_.fileContents);
   return true;
}


async function loadLibrary() {
const data = await window.electron.readLibraryFile();
drawing.newPage('dcs');
drawing.dirLibrary=[];
data['libs'].forEach(item => drawing.dirLibrary.push(item));
user={fileName:'New file',fileExtension:'dcs',baseName:'New file'};
const libraryName=data['libs'][0];
const files=data[libraryName];
const files_ = await window.electron.getLibraryFiles(libraryName,files);
addItemsToPageLibs(data['libs']);
addListSymbToPageLibs(files_.fileContents);
displayByPageType();
}

async function posPathProjectExe(){
  drawing.path=await window.electron.getExePath();
}


window.onload = function () {
loadLibrary();
dataToInterface();
posPathProjectExe();

};




async function importSymbols(pos){
const data = await window.electron.readLibraryFile();
var libraryName=data['libs'][pos];
var files=data[libraryName];
const files_ = await window.electron.getLibraryFiles(libraryName,files);
addListSymbToPageLibs(files_.fileContents);
}


function newCircuit(){
   loadLibrary();
   
}

function newSymbol(){
   drawing.newPage('sym');
   updateListElements();
   user={fileName:'New file', fileExtension:'sym', baseName:'New file'};
   displayByPageType();
}


async function saveAsFile() {
  const filename = user.fileName;
  const content = drawing.getSymbol();

  const result = await window.electron.saveAsFile(filename, content,user.fileExtension);
  
  if (result.success) {
    user.fileName=result.path;
    user.baseName=result.fileName;
    drawing.modified=false;
    return true;
  }

  return false;
}


async function saveFile() {
  const filename = user.fileName;
  const content = drawing.getSymbol();

  const result = await window.electron.saveFile(filename, content);
  
  if (result.success) {
    drawing.modified=false;
    return true;
  } else {
      return false;
  }
}




  
