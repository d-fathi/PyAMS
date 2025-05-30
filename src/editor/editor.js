
var setFile='New file';
let initialValue = '';
var menuitems={};

var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "python",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
});

editor.setSize("100%", "100%");

document.addEventListener("DOMContentLoaded", () => {
    const menuBar = document.querySelector(".menu-bar");
    const toolbar = document.querySelector(".toolbar");
    const descriptionBar = document.getElementById("description-bar");

    const data = {
        "menus": [
            {
                "title": "File",
                "items": [
                    { "label": "New", "icon": "", "shortcut": "Ctrl+N", "action": "newFile", "description": "Create a new file" },
                    { "label": "Open", "icon": "", "shortcut": "Ctrl+O", "action": "openFile", "description": "Open an existing file" },
                    { "label": "Save", "icon": "", "shortcut": "Ctrl+S", "action": "saveFile", "description": "Save the current file" },
                    { "label": "Save As", "icon": "", "shortcut": " ", "action": "saveAsFile", "description": "Save as the current file" },
                    { "label": "Exit", "icon": "", "shortcut": "Alt+F4", "action": "exitApp", "description": "Exit the application" }
                ]
            },
            {
                "title": "Edit",
                "items": [
                    { "label": "Undo", "icon": "", "shortcut": "Ctrl+Z", "action": "undo", "description": "Create a new file" },
                    { "label": "Redo", "icon": "", "shortcut": "Ctrl+Y", "action": "redo", "description": "Open an existing file" },
                    { "label": "Cut", "icon": "", "shortcut": "Ctrl+X", "action": "cut", "description": "Save the current file" },
                    { "label": "Copy", "icon": "", "shortcut": "Ctrl+C", "action": "copy", "description": "Exit the application" },
                    { "label": "Past", "icon": "", "shortcut": "Ctrl+P", "action": "past", "description": "Exit the application" }
                ]
            }
        ],
        "toolbar": [
            { "label": "New", "icon": "", "action": "newFile", "description": "Create a new file" },
            { "label": "Open", "icon": "", "action": "openFile", "description": "Open an existing file" },
            { "label": "Save", "icon": "", "action": "saveFile", "description": "Save the current file" }
        ]
    };


   

    // Create Menus
    data.menus.forEach(menu => {
        const menuItem = document.createElement("div");
        menuItem.className = "menu-item";
        menuItem.textContent = menu.title;

        const dropdown = document.createElement("div");
        dropdown.className = "dropdown";

        menu.items.forEach(item => {
            const dropdownItem = document.createElement("div");
            dropdownItem.className = "dropdown-item";
            dropdownItem.innerHTML = `${item.label} <span class="shortcut">${item.shortcut}</span>`;
            dropdownItem.addEventListener("mouseover", () => {
                descriptionBar.textContent = item.description;
            });
            dropdownItem.addEventListener("mouseout", () => {
                descriptionBar.textContent = "Hover over an item for details.";
            });

            dropdownItem.addEventListener("click", (event) => {setAction(item.action)
                event.stopPropagation();
                dropdown.style.display = "none";
            });
            dropdown.appendChild(dropdownItem);
            menuitems[item.action]=dropdownItem;

        });

        menuItem.appendChild(dropdown);
        menuItem.addEventListener("mouseover", () => {
            dropdown.style.display = "block";
        });
        menuItem.addEventListener("mouseleave", () => {
            dropdown.style.display = "none";
        });
        menuBar.appendChild(menuItem);
    });

    // Create Toolbar Buttons
   /* data.toolbar.forEach(tool => {
        const button = document.createElement("button");
        button.innerHTML = `<img src="${tool.icon}" alt="${tool.label}">`;
        button.addEventListener("mouseover", () => {
            descriptionBar.textContent = tool.description;
        });
        button.addEventListener("mouseout", () => {
            descriptionBar.textContent = "Hover over an item for details.";
        });
        toolbar.appendChild(button);
    });*/
});





function addToBarDsecription(line,col, change){

    document.getElementById("description-bar").innerHTML=`
      <div style="width: 70px; float: left; border:#eeeeee solid 0.5px;">Ln: ${line}</div>
      <div style="width: 70px; float: left; border:#eeeeee solid 0.5px;">Col: ${col}</div>
      <div style="width: 100px; float: left; border:#eeeeee solid 0.5px;"></div>
      `;
    }
        // Listen for cursor movement
    editor.on("cursorActivity", function(cm) {
     let cursor = cm.getCursor(); // Get cursor position
     var line = cursor.line + 1;  // Line number (1-based index)
     var col = cursor.ch + 1;     // Column number (1-based index)
     addToBarDsecription(line,col, '');
    });

    
    function removeClass(a){
        for(var i=0; i<a.length;i++)
         a[i].classList.remove('disabled');
      }
   
    function addClass(a){
       for(var i=0; i<a.length;i++)
        a[i].classList.add('disabled');
     }

    function updateButtons() {
        let cm = editor;
        let hasSelection = cm.somethingSelected();


        if(!hasSelection)  { addClass([menuitems.copy, menuitems.cut])}
        else{ removeClass([menuitems.copy, menuitems.cut])}
        
        // التحقق من إمكانية التراجع والإعادة
        if(!cm.historySize().undo)  { addClass([menuitems.undo]); }
        else{ removeClass([menuitems.undo]); }

        if(!cm.historySize().redo)  { addClass([menuitems.redo]); }
        else{ removeClass([menuitems.redo]); }

        navigator.clipboard.readText().then(text => {
           if(text.trim() === "")
                addClass([menuitems.paste]);
           else
               removeClass([menuitems.paste]);
        }).catch(() => {
               removeClass([menuitems.paste]);
        });
    }

    editor.on("cursorActivity", updateButtons);
    editor.on("changes", updateButtons);
    
    // تحديث أولي عند تحميل الصفحة
    updateButtons();


function start(){
  
    document.title ='Python Editor '+'  ['+setFile+']';
    
    editor.on("change", function(cm) {
        let cursor = cm.getCursor(); // Get cursor position
        var line = cursor.line+1;   //  Line number (1-based index)
        var col = cursor.ch+1;      //  Column number (1-based index)
        addToBarDsecription(line,col, '');//change.origin);

        var modified=cm.getValue()!= initialValue;

        if(modified)
            document.title='Python Editor '+'  ['+setFile+' *]';
        else 
            document.title ='Python Editor '+'  ['+setFile+']';

        updateButtons(cm);
    });
}

function isTextChanged(){

    return  editor.getValue()!= initialValue;
}

function newFile(){
      setFile='New file';
      editor.setValue('');
      initialValue=editor.getValue();
      editor.clearHistory();
      start();
}

async function openFile(){
    const result = await window.electron.openFileDialogEditor();
    if(result){
        setFile=result.filePath;
        editor.setValue(result.fileContent);
        initialValue=editor.getValue();
        editor.clearHistory();
        start();
    }
}

async function saveFile(){
    const result= await window.electron.saveCloseWindowEditor(editor.getValue(),setFile,2);
    if(result.saved){
          setFile=result.path;
          initialValue=editor.getValue();
          editor.clearHistory();
          start();
       }
}

async function saveAsFile(){
    const result= await window.electron.saveAsWindowEditor(editor.getValue(),setFile);
    if(result.saved){
          setFile=result.path;
          initialValue=editor.getValue();
          editor.clearHistory();
          start();
       }
}


// Action Handlers
function setAction(action){

    switch(action){
        case "newFile":
            if(isTextChanged())
                confirmAction(2);
            else
                newFile();
        break;

        case "openFile":
            if(isTextChanged())
                confirmAction(3);
            else
                openFile();
        break;

        case "saveFile":
            saveFile();
        break;

        case "saveAsFile":
            saveAsFile();
        break;
    

        case "copy":
            if (editor.somethingSelected()) {
                navigator.clipboard.writeText(editor.getSelection());
            }
        break;

        case "cut":
            if (editor.somethingSelected()) {
                navigator.clipboard.writeText(editor.getSelection()).then(() => {
                    editor.replaceSelection("");
                });
            }
        break;

        case "past":
            navigator.clipboard.readText().then(text => {
                editor.replaceSelection(text);
            });
        break;

        case "undo":
            editor.undo();
        break;

        case "redo":
            editor.redo();
        break;



        
    }

    

}