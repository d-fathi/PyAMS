/*
#-------------------------------------------------------------------------------
# Name:        listSymbol.js
# Author:      d.fathi
# Created:     28-04-2021
# Update:      28-08-2026
# Copyright:  (c) PyAMS-Editor 2026
# Licence:    free (MIT)
#-------------------------------------------------------------------------------
*/

function getPartForList(self, part) {

    self.innerHTML = part;

    var collection = self.children;
    var xmin = 2000;
    var ymin = 2000;
    var xmax = -2000;
    var ymax = -2000;
    var strokeWidth = "1px";

	var r=[]

    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
		if (!elem.getAttribute("name"))
		  elem.remove;
		else
        switch (elem.getAttribute("name")) {
        case "rect":
        case "image":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            var w = parseInt(elem.getAttribute("width"));
            var h = parseInt(elem.getAttribute("height"));
			      elem.style.strokeWidth = strokeWidth 
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            xmax = Math.max(x + w, xmax);
            ymax = Math.max(y + h, ymax);
            break;
            
        case "ellipse":
		case "arc":

            var x = parseInt(elem.getAttribute("cx")) - parseInt(elem.getAttribute("rx"));
            var y = parseInt(elem.getAttribute("cy")) - parseInt(elem.getAttribute("ry"));
            var w = 2 * parseInt(elem.getAttribute("rx"));
            var h = 2 * parseInt(elem.getAttribute("ry"));
			      elem.style.strokeWidth = strokeWidth 
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            xmax = Math.max(x + w, xmax);
            ymax = Math.max(y + h, ymax);
            break

        case "pin":
            var p = getArrayPoints(elem);
            xmin = Math.min(p[0].x, p[1].x, xmin);
            ymin = Math.min(p[0].y, p[1].y, ymin);
            xmax = Math.max(p[0].x, p[1].x, xmax);
            ymax = Math.max(p[0].y, p[1].y, ymax);
            break;

        case "ioparam":
            var p = getRectPointsIOparam(elem);
            xmin = Math.min(p[0].x, p[1].x, xmin);
            ymin = Math.min(p[0].y, p[1].y, ymin);
            xmax = Math.max(p[0].x, p[1].x, xmax);
            ymax = Math.max(p[0].y, p[1].y, ymax);
            break;

        case "polyline":
		case "polygon":
		    elem.style.strokeWidth = strokeWidth;
            var p = getArrayPoints(elem);
            for (var j = 0; j < p.length; j++) {
                v = p[j];
                xmin = Math.min(v.x, xmin);
                ymin = Math.min(v.y, ymin);
                xmax = Math.max(v.x, xmax);
                ymax = Math.max(v.y, ymax);
            }
            break;
		case "text":
            var p = getRectOfText(elem);
            for (var j = 0; j < p.length; j++) {
                v = p[j];
                xmin = Math.min(v.x, xmin);
                ymin = Math.min(v.y, ymin);
                xmax = Math.max(v.x, xmax);
                ymax = Math.max(v.y, ymax);
            }
            break;
        }
    }

	xmin=xmin-3;
	ymin=ymin-3;

    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        switch (elem.getAttribute("name")) {
        case "rect":
        case "image":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            elem.setAttribute("x", x - xmin);
            elem.setAttribute("y", y - ymin);
			      elem.setAttribute("class",' ');
            break;
        case "ellipse":
            var x = parseInt(elem.getAttribute("cx"));
            var y = parseInt(elem.getAttribute("cy"));
            elem.setAttribute("cx", x - xmin);
            elem.setAttribute("cy", y - ymin);
			      elem.setAttribute("class",' ');
            break;

		case "arc":
            var x = parseInt(elem.getAttribute("cx"));
            var y = parseInt(elem.getAttribute("cy"));
            elem.setAttribute("cx", x - xmin);
            elem.setAttribute("cy", y - ymin);
			      a=getArcPoints(elem);
	          elem.setAttribute("d", arcToAttribute(a, 0, 0));
		       	elem.setAttribute("r",1);
		      	elem.setAttribute("h",1);
		      	elem.setAttribute("v",1);
			      elem.setAttribute("class",' ');
            break;

        case "pin":
            var p = getArrayPoints(elem);
            var xo = p[0].x - xmin;
            var yo = p[0].y - ymin;
            var x = p[1].x - xmin;
            var y = p[1].y - ymin;
            elem.setAttribute("points", xo + "," + yo + " " + x + "," + y);
            drawingPin(elem);
			      elem.setAttribute("class",' ');
                  elem.setAttribute("name",'ppin');
			      elem.childNodes[0].style.strokeWidth = strokeWidth;
			      elem.childNodes[1].style.display="none";
            break;

		case "ioparam":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
			      setparamPos(x-xmin,y-ymin,elem);
		        break;
        case "polyline":
		case "polygon":
            var p = getArrayPoints(elem);

            for (var j = 0; j < p.length; j++) {
                p[j].x = p[j].x - xmin;
                p[j].y = p[j].y - ymin;
            }

            elem.setAttribute("points", polylineToAttribute(p, 0, 0));
			      elem.setAttribute("class",' ');
            break;

        case 'text':
        
            var x = parseInt(elem.getAttribute("x")) - xmin;
            var y = parseInt(elem.getAttribute("y")) - ymin;
            elem.setAttribute("x", x);
            elem.setAttribute("y", y);
            elem.setAttribute("class", "var");
            var r = elem.getAttribute("r");
            elem.setAttribute("transform", 'rotate(' + r + ' ' + x + ' ' + y + ')');
			elem.setAttribute("class",' ');
            break;

        case 'label':
		case 'ref':
		case 'param':
        case 'modelSpice':

			break;



        }



    }

 var i=0;
	while(i< collection.length)
	{
		var elem = collection[i];
        if ((elem.getAttribute("name")=='ref')||(elem.getAttribute("name")=='param')||(elem.getAttribute("name")=='modelSpice'))
		{
			elem.remove();
			collection = self.children;
			i=0;
		}
		else i=i+1;
	}

    self.setAttribute("width", xmax - xmin+8);
    self.setAttribute("height", ymax - ymin+8);
    self.setAttribute("xo", 5);
    self.setAttribute("yo", 5);

     //console.log('w=' + self.getAttribute("width"));
     //console.log('h=' + self.getAttribute("height"));
}


var listSymbols=[];


function getPageLibDesc(){
  document.getElementById("componentsPanel").innerHTML = 
    '<div style="display:flex; flex-direction:column; height:100%;">' +
    '  <div style="flex-shrink:0; background:#f0f0f0; border-bottom:1px solid #ccc;">' +
    '    <table id="customers" style="width:100%; margin:0;"><tr>' +
    '      <td style="width:20%; padding:4px; font-weight: 600">Components</td>' +
    '      <td style="padding:4px;"><select id="selectLibs"  class="myInput" style="width:100%;"></select></td>' +
    '    </tr></table>' +
    '  </div>' +
    '  <div id="symlibPage" style="flex:1; overflow-y:auto; overflow-x:hidden; padding:5px; scrollbar-width: thin;"></div>' +
    '</div>';
}


  




function addListSymbToPageLibs(list){
  function setSizeStr(V){
  	if(V.length>14)
  		return V.substring(0, 12)+'..';
  	return V;
  }
  
  listSymbols=list;
  

var rrr='<ul id="buttons">';
for(var i=0; i < list.length; i++){
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    getPartForList(newElement, list[i]);
    var symbol=JSON.parse(newElement.firstChild.getAttribute("symbol"));
    var w = parseInt(newElement.getAttribute("width"));
    var h = parseInt(newElement.getAttribute("height"));
    var title = setSizeStr(symbol.name);
    
    rrr += "<li>"
         + "<button class='button_lib' data-index='" + i + "'>"
         + "<svg width='70%' height='70%' viewBox='0 0 " + w + " " + h + "' preserveAspectRatio='xMidYMid meet'>" + newElement.innerHTML + "</svg>"
         + "</button>"
         + "<p><a href='#' data-index='" + i + "'>" + title + "</a></p>"
         + "</li>";
}
  
  rrr += '</ul>';
  document.getElementById("componentsPanel").innerHTML = rrr;
  const listContainer = document.getElementById("componentsPanel"); 
  
  listContainer.addEventListener('click', function(e) {
   if(drawing.partUp) return;
    const btn = e.target.closest('.button_lib');
    const link = e.target.closest('a');
    if (btn) {
        const index = parseInt(btn.getAttribute('data-index'));
        addSymToPage(index);
        drawing.partUp = true;
    } else if (link) {
        e.preventDefault();
        const index = parseInt(link.getAttribute('data-index'));
        addSymToPage(index);
        drawing.partUp = true;
    }
 });

  var collection = document.getElementsByName("ppin");
  for (var i = 0; i < collection.length; i++){
    drawingPin(collection[i]);
  }
}

function addItemsToPageLibs(listItems) {
 var x=document.getElementById("selectLibs");
 x.innerHTML='';
 var oledg='';

 for (var i=0; i<listItems.length; i++){
    /*var s=listItems[i]+' ';
   const [group, subgroup] = s;
   if (group !== oledg) {
     var optgroup = document.createElement("optgroup");
     optgroup.label = group;
     optgroup.style="font-size: 12px; font-weight: bold; color:rgb(247, 244, 244); background-color:rgb(100, 100, 100);";
     x.appendChild(optgroup);
     oledg=group;
   }*/
   var option=document.createElement("option");
   option.text=listItems[i];
   option.value= i;
   option.setAttribute('dir',listItems[i]);
   x.add(option);
 }
 if(false){
     var optgroup = document.createElement("optgroup");
     optgroup.label ='Project';
     optgroup.style="font-size: 12px; font-weight: bold; color:rgb(247, 244, 244); background-color:rgb(100, 100, 100);";
     x.appendChild(optgroup);
    var option=document.createElement("option");
     option.text='Models';
     option.value= 9999;
     option.setAttribute('dir','Project[Models]');
    x.add(option);
 }
//addListSymbToPageLibs(listSymb);
}

function addSymToPage(index)
{   
    if(drawing.pageType=='sym')
        return;
       
    var sel=document.getElementById("selectLibs");
	var dir=sel.options[sel.selectedIndex].getAttribute('dir');

	if(listSymbols.length>index)
	  addPart(listSymbols[index],dir);

    var collection = document.getElementsByName("pin");

    for (var i = 0; i < collection.length; i++)
            drawingPin(collection[i]);
        
}



async function changeListSym(){
    var index=parseInt(document.getElementById('selectLibs').value);
    selctedSymbolIndex = index; // update the global variable to reflect the selected index
    const files_ = await drawing.redSymFiles(index);
    addListSymbToPageLibs(files_);
}

async function updateSymbolsPanel() {
 //  getPageLibDesc();
   if(selctedSymbolIndex === -1 || selctedSymbolIndex >= drawing.dataSyms['dirs'].length) {
     selctedSymbolIndex = 0; // start with the first library if none is selected
   }
   const data = drawing.dataSyms;
   const libraryName=data['dirs'][selctedSymbolIndex ];
 //  const files=data[libraryName];
   const files_ = await drawing.redSymFiles(selctedSymbolIndex);
   addItemsToPageLibs(data['dirs']);
   addListSymbToPageLibs(files_);

   
    const select = document.getElementById('selectLibs');
    select.selectedIndex = selctedSymbolIndex; // set the selected index of the dropdown
    
    select.addEventListener('change', function() {
         changeListSym();
    });

   return true;
}

var selctedSymbolIndex = -1;
