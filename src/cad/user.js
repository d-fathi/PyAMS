

async function confirmAction(type_) {
    if(type_<=4) 
        message='Want to save changes to '+user.baseName+' ?';

    const result = await window.electron.showConfirmationDialog( message);

    if (result==0) {

        if(user.fileName=='New file')
           var saved=await saveAsFile();
          else
           var saved=await saveFile();
    

        if(saved){
            if(type_==1) openFile();
            if(type_==2) newCircuit();
            if(type_==3) newSymbol();
            if(type_==4) window.electron.closeWindowIDE();
        }
     
    } else if(result==1) {
        if(type_==1) openFile();
        if(type_==2) newCircuit();
        if(type_==3) newSymbol();
        if(type_==4) window.electron.closeWindowIDE();
    }
}




