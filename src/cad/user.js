



async function confirmActionOnCloseTab(file_) {

    var dataDrawing=JSON.parse(file_.content);
    if(!dataDrawing.modified) 
        return 1;
    message='Want to save changes to '+file_.name+' ?';
    const result = await window.electron.showConfirmationDialog(message);
        switch(result){
            case 0:

                if(!file_.filePath)
                    var saved=await window.electron.saveAsFile(file_.name, dataDrawing.svgContent, file_.type);
                else
                    var saved=await  window.electron.saveFile(file_.filePath, dataDrawing.svgContent);

                if(saved.success) return 1;
                else return 0;
            case 1:
                return 1;
            case 2:
                return 0;
        }
    return 0;

}





