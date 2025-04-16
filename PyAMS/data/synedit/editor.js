

let initialValue = '';


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

    



function isTextChanged(){
    return  [editor.getValue()!= initialValue,editor.getValue()];
}

function newFile(){
      editor.setValue('');
      initialValue=editor.getValue();
      editor.clearHistory();
}


function openCode(fileContent){
        fileContent = fileContent.replace(/^\uFEFF/, ''); 
        fileContent = fileContent.replace(/^[^\S\r\n]+/, ''); 
        editor.setValue(fileContent);
        initialValue=editor.getValue();
        editor.clearHistory(); 
}

function saveCode(){
    initialValue=editor.getValue();
    return editor.getValue()
}


