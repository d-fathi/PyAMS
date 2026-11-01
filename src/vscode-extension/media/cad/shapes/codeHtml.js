
function addCodeHtml(elem) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 222);
    newElement.setAttribute("height", 200);
	  newElement.innerHTML =`<div  name="htmlCode"  style="zoom:0.2;" 
    code="<div class='ch'><h1>Hellow word</h1>\n <p>Here write the text in HTML</p></div>">

    <!-- Parent container that responds to mouse movement -->
    <div class="chtool"> 
        
        <!-- tool bar-->
        <div class="ch-page-toolbar">
            <button class="ch-toolbar-button" title="Home">
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


// The text is laid out on a large "page" CH_PAGE_WIDTH px wide and then scaled down
// to fit the box drawn on the schematic, so it looks like a small thumbnail next to the plots.
// The Home button shows the same text at full size (see goHome).
var CH_PAGE_WIDTH = 1000;

function modifedSizeCodeHtml(element) {
    if (element.getAttribute("name") != "codeHTML") return;
    var x = parseInt(element.getAttribute("x"));
    var y = parseInt(element.getAttribute("y"));
    var w = Math.max(parseFloat(element.getAttribute("width")) || 0, 20);
    var h = Math.max(parseFloat(element.getAttribute("height")) || 0, 20);
    var z = w / CH_PAGE_WIDTH;                       // scale of the thumbnail

    element.setAttribute('transform', "translate(" + x + "," + y + ")");

    var fo = element.firstChild;                     // <foreignObject>
    fo.setAttribute("width", w);
    fo.setAttribute("height", h);
    fo.style.width = w + 'px';
    fo.style.height = h + 'px';

    var box = fo.firstChild;                         // <div name="htmlCode">
    if (!box || !box.style) return;
    box.style.zoom = z;
    box.style.width = (w / z) + 'px';                // = CH_PAGE_WIDTH
    box.style.height = (h / z) + 'px';

    // keep the toolbar (Home / Edit) at its normal size whatever the thumbnail scale
    var bar = box.querySelector('.ch-page-toolbar');
    if (bar) bar.style.zoom = 1 / z;
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
            <button class="ch-toolbar-button" title="Home">
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
    
    
   modifedSizeCodeHtml(s[i].parentNode.parentNode);
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


// Home button: show the text enlarged, on top of the drawing, so it can be read comfortably.
function closeHtmlViewer() {
  var ov = document.getElementById('chViewerOverlay');
  if (ov) ov.remove();
  document.removeEventListener('keydown', htmlViewerKey, true);
}

function htmlViewerKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeHtmlViewer(); }
}

function goHome(btn) {
  var box = (btn && btn.closest) ? btn.closest('[name="htmlCode"]') : null;
  if (!box && typeof mtable !== 'undefined' && mtable.select) box = mtable.select.firstChild.firstChild;
  if (!box) return;

  closeHtmlViewer();
  var ov = document.createElement('div');
  ov.id = 'chViewerOverlay';
  ov.innerHTML = '<div id="chViewer">' +
                   '<button id="chViewerClose" title="Close (Esc)">&times;</button>' +
                   '<div id="chViewerBody">' + box.getAttribute("code") + '</div>' +
                 '</div>';
  ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeHtmlViewer(); });
  ov.querySelector('#chViewerClose').addEventListener('click', closeHtmlViewer);
  document.addEventListener('keydown', htmlViewerKey, true);
  document.body.appendChild(ov);
}

function modifyAction(){
  getDialog('openEditHtml')
}

// Inline onclick attributes are not run inside the webview, so the Home button is handled here.
// One delegated listener (capture phase) keeps working when the markup is rebuilt.
document.addEventListener('click', function (e) {
  var btn = e.target && e.target.closest ? e.target.closest('.ch-toolbar-button[title="Home"]') : null;
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  goHome(btn);
}, true);
