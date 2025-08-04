
function addCodeHtml(elem) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 222);
    newElement.setAttribute("height", 200);
	  newElement.innerHTML ='<div  name="htmlCode" style="font-size: 8px; background-color: #444;    margin-top:-10px; color: #ffffff;  font-family: Arial;" code="<h1>Hellow word</h1>\n <p>Here write the text in HTML</p>"> <h1>Hellow word</h1>\n <p> Here write the text in HTML</p> </div>';
    newElement.firstChild.style.height =200+'px';
    newElement.firstChild.style.width =222+'px';
    elem.appendChild(newElement);
}

function modifedSizeCodeHtml(element) {
    if (element.getAttribute("name") == "codeHTML") {
        var x = parseInt(element.getAttribute("x"));
        var y = parseInt(element.getAttribute("y"));
        var w = parseInt(element.getAttribute("width"));
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
    s[i].innerHTML= s[i].getAttribute("code");
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,s[i]]);
   i++;
 }
}

function setHtmlCode(text){
  mtable.select.firstChild.firstChild.innerHTML=text;
  mtable.select.firstChild.firstChild.setAttribute("code",text);
  updateHtmlCode();
}


async function openEditHtml() {
  const originalText = mtable.select.firstChild.firstChild.getAttribute("code");
  if(!drawing.electronjs){
    window.foo.getHtmlCode(originalText);
    return;
  }
  const editedText = await window.electron.editTextHtml(originalText,'HTML Code Editor');
  setHtmlCode(editedText);
}


async function openEditCSS() {
  const originalText = mtable.select.getAttribute("style");
  const editedText = await window.electron.editTextHtml(originalText,'Style Editor');
  mtable.select.setAttribute("style",editedText);
}
