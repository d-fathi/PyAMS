/*
#--------------------------------------------------------------------------------------------
# Name:        codeSpice.js
# Author:      d.fathi
# Created:     27/08/2024
# Update:      29/08/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free
#--------------------------------------------------------------------------------------------
*/

//-------------------------Class and function for resize shapes------------------------//
function addCodeSpice(elem) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 222);
    newElement.setAttribute("height", 200);
	  newElement.innerHTML ='<div  name="spiceCode" style="font-size: 8px; background-color: #ffffff;    margin-top:-10px; color: #000000;  font-family: Consolas;" code=";Spice code"> <h1>;Spice code</p> </div>';
    newElement.firstChild.style.height =200+'px';
    newElement.firstChild.style.width =222+'px';
    elem.appendChild(newElement);
}

function modifedSizeCodeSpice(element) {
    if (element.getAttribute("name") == "codeSpice") {
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



function updateCodeSpice(){
  var s=document.getElementsByName('spiceCode');
  var i=0;
  while (i <= s.length-1) {
    s[i].innerHTML= s[i].getAttribute("code");
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,s[i]]);
   i++;
 }
}

function colorToSpiceText(text){
  var temp=text.split('\n');
  for(var i=0; i<temp.length; i++)
    {
      
     var a=temp[i]+'  ';
      if(a[0]==';')
        temp[i]="<i style='color:RGB(198, 100,0)'>"+temp[i]+"</i>";
      else if(a[0]=='*')
        temp[i]="<i style='color:RGB(198, 100,0)'>"+temp[i]+"</i>";
      else if (a[0]=='.')
      {
        var a=a.split(' ');
        if(a[0]=='.model' && a.length>=2)
          a[1]="<b style='color:RGB(0, 255,0)'>"+a[1]+"</b>";
          a[0]="<b style='color:RGB(0, 0,255)'>"+a[0]+"</b>";
        temp[i]=a.join(' ');
      }
     
    }

  return '<h1></h1><p>'+temp.join('<br>')+'</p>';
}

function setCodeSpice(text){
  
  mtable.select.firstChild.firstChild.setAttribute("code",text[0]);
  mtable.select.firstChild.firstChild.innerHTML=colorToSpiceText(text[0]);
 // updateCodeSpice();
}

function getSpicefromAttr() { 
  window.foo.getCodeSpice(mtable.select.firstChild.firstChild.getAttribute("code"));
}



function codeSpiceList() {
   var list = [];
   var s=document.getElementsByName('spiceCode');
   for(var i=0; i<s.length; i++)
       list.push(s[i].getAttribute("code"));
   return list;
}
