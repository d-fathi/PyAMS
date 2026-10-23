
function addCodeHtml(elem) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 222);
    newElement.setAttribute("height", 200);
	  newElement.innerHTML =`<div  name="htmlCode"  style="zoom:60%;" 
    code="<div class='ch'><h1>Hellow word</h1>\n <p>Here write the text in HTML</p></div>">

    <!-- Parent container that responds to mouse movement -->
    <div class="chtool"> 
        
        <!-- tool bar-->
        <div class="ch-page-toolbar">
            <button class="ch-toolbar-button" title="Home" onclick="goHome()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3 L3 10 V21 H9 V15 H15 V21 H21 V10 Z"/>
                </svg>
            </button>
           <button class="ch-toolbar-button" title="Modified" >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </button>
        </div>

       <div class="ch">
         <h1>Hellow word</h1> 
         <p> Here write the text in HTML</p> 
       </div>
    </div>
    `;
    newElement.firstChild.style.height =200+'px';
    newElement.firstChild.style.width =222+'px';
    elem.appendChild(newElement);



}


function modifedSizeCodeHtml(element) {
  var a=100/60;
    if (element.getAttribute("name") == "codeHTML") {
        var x = parseInt(element.getAttribute("x"));
        var y = parseInt(element.getAttribute("y"));
        var w = parseInt(element.getAttribute("width"))*a;
        var h = parseInt(element.getAttribute("height"));

        element.setAttribute('transform', "translate(" + x + "," + y + ")");
        
        element.firstChild.style.height=h+'px';
        element.firstChild.style.width=w+'px';
        element.firstChild.firstChild.style.height=h+'px';
		    element.firstChild.firstChild.style.width=w+'px';
    }
}



function updateHtmlCode(){
  var s=document.getElementsByName('htmlCode');
  var i=0;
  while (i <= s.length-1) {
    s[i].innerHTML= ` 
    <!-- Parent container that responds to mouse movement -->
    <div class="chtool"> 
        
        <!-- tool bar-->
        <div class="ch-page-toolbar">
            <button class="ch-toolbar-button" title="Home" onclick="goHome()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3 L3 10 V21 H9 V15 H15 V21 H21 V10 Z"/>
                </svg>
            </button>
            <button class="ch-toolbar-button" title="Modified" onclick="modifyAction()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </button>
        </div>

       ${s[i].getAttribute("code")}
    </div>
    `;
    
    
   i++;
 }

     document.querySelectorAll(".ch-toolbar-button[title='Modified']")
    .forEach(button => {
        button.addEventListener("click", modifyAction);
    });

}

function setHtmlCode(text){
  mtable.select.firstChild.firstChild.innerHTML=text;
  mtable.select.firstChild.firstChild.setAttribute("code",text);
  updateHtmlCode();
}


async function openEditHtml() {
  const originalText = mtable.select.firstChild.firstChild.getAttribute("code");
  const editedText = await window.electron.editTextHtml(originalText,'HTML Code Editor');
  if( editedText)
  setHtmlCode(editedText);
}


async function openEditCSS() {
  const originalText = mtable.select.getAttribute("style");
  const editedText = await window.electron.editTextHtml(originalText,'Style Editor');
    if( editedText)
  mtable.select.setAttribute("style",editedText);
}


function goHome(){
  window.electron.openHtmlWindow({htmlcode:mtable.select.firstChild.firstChild.getAttribute("code"),circuit:getCircuit()});
}

function modifyAction(){
  getDialog('openEditHtml')
}