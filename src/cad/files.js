

async function openFile(){
  const result = await window.electron.openFileDialog('dcs');
  if (result) {
    addNewTabOpenFile(result.fileExtension,result.filePath,result.fileContent,result.fileName);
    drawing.path=result.folderPath;
    enable();
    updateListElements();
    displayByPageType();
  }    
  
}



async function loadLibrary() {
const data = await window.electron.readLibraryFile();
drawing.newPage('dcs');
drawing.dirLibrary=[];
data['libs'].forEach(item => drawing.dirLibrary.push(item));
user={fileName:'New file',fileExtension:'dcs',baseName:'New file'};
document.getElementById("ItProject").firstChild.checked =false;
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







async function importSymbols(pos){

if(pos!=9999){
  const data = await window.electron.readLibraryFile();
  var libraryName=data['libs'][pos];
  var files=data[libraryName];
  const files_ = await window.electron.getLibraryFiles(libraryName,files);
  addListSymbToPageLibs(files_.fileContents);
}
 else{
  const files_project = await window.electron.getLibraryFilesFromProject(user.fileName);
 addListSymbToPageLibs(files_project.fileContents);
 }

}


function newCircuit(){
   loadLibrary();
   
}

function newSymbol(){
   drawing.newPage('sym');
   updateListElements();
   user={fileName:'New file', fileExtension:'sym', baseName:'New file', folderPath:''};
   displayByPageType();
}



async function saveAsFile() {

  const activeFile = files.find(f => f.active);
  const content = drawing.getSymbol();

  const result = await window.electron.saveAsFile(activeFile.name, content, activeFile.type);

  if (result.success) {
    activeFile.filePath = result.path;
    activeFile.name = result.fileName;
    drawing.fileName=result.fileName;
    drawing.path=result.folderPath;
    drawing.modified=false;
    saveCurrentTab();
    renderTabs();
    caption();
    return true;
  }

  return false;
}


async function saveFile() {

  const activeFile = files.find(f => f.active);
  const content = drawing.getSymbol();

  if(!activeFile.filePath)
    return await saveAsFile();

  const result = await window.electron.saveFile(activeFile.filePath, content);
  if (result.success) {
    drawing.modified=false;
    saveCurrentTab();
    caption();
    return true;
  } else {
      return false;
  }
}


function window_load() {
//loadLibrary();
dataToInterface();
//posPathProjectExe();

};

function caption(){
            if (drawing.pageType=='sym') var title='Symbol Editor'; 
           else var title='Python for Analog and Mixed Signals';

           if(drawing.modified)
               document.title=title+'  ['+drawing.fileName+'* ]';
           else 
               document.title =title+'  ['+drawing.fileName+']';
      }




  
