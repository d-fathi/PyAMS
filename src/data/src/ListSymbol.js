
function getPartForList(self, part) {

    self.innerHTML = part;

    var collection = self.children;
    var xmin = 2000;
    var ymin = 2000;
    var xmax = -2000;
    var ymax = -2000;

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
			      elem.style.strokeWidth = "0.8px";
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
			      elem.style.strokeWidth = "0.8px";
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
		    elem.style.strokeWidth = "0.8px";
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
			      elem.childNodes[0].style.strokeWidth = "0.8px";
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

			break;



        }



    }

 var i=0;
	while(i< collection.length)
	{
		var elem = collection[i];
        if ((elem.getAttribute("name")=='ref')||(elem.getAttribute("name")=='param'))
		{
			elem.remove();
			collection = self.children;
			i=0;
		}
		else i=i+1;
	}

    self.setAttribute("width", xmax - xmin);
    self.setAttribute("height", ymax - ymin);
    self.setAttribute("xo", 0);
    self.setAttribute("yo", 0);

     //console.log('w=' + self.getAttribute("width"));
     //console.log('h=' + self.getAttribute("height"));
}



function getPageLibDesc(pageType){

	if(pageType!="dcs")
       document.getElementById("one1").innerHTML='<table id="customers"><tr><th>List of Element</th></tr></table><div id="elemlibPage"></div>';
    else
       document.getElementById("one1").innerHTML='<table id="customers"><tr><th style="width:20%">Components</th><th><select  id="selectLibs"  onchange="changeListSym()" class="myInput"></select></th></tr></table><div id="symlibPage"></div>';
}

var listSymbols=[];

function addListSymbToPageLibs(list){
  function setSizeStr(V)
  {
  	if(V.length>14)
  		return V.substring(0, 12)+'..';
  	return V
  }
var n=90;
listSymbols=list;
var rrr='<ul id="buttons">';
for(var i=0;i<list.length;i++){
  var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
  getPartForList(newElement,list[i].sym);
  w=parseInt(newElement.getAttribute("width"));
  h=parseInt(newElement.getAttribute("height"));
  title=setSizeStr(newElement.firstChild.getAttribute("symbolname"));

  a=1;
  w=w+5;
  h=h+5;
  if(w>h)
    a=w/n;
  else
    a=h/n;
  a=a+0.4;
  rrr=rrr+"<li  id='lii'><div class='divSymText'><button class='button_lib' onclick=addSymToPage("+i+") ><svg  width="+(w/a)+"  height="+(h/a)+"  viewBox='0 0 " + w + " " + h + " "+"'>"+newElement.innerHTML+"</svg></button> <p><a href='#' onclick=addSymToPage("+i+")>"+title+"</a></p></div></li>";
 }
 rrr=rrr+'</ul>';
 document.getElementById("symlibPage").innerHTML=rrr;

 var collection = document.getElementsByName("ppin");

    for (var i = 0; i < collection.length; i++)
        {
            drawingPin(collection[i]);
        }

}

function addItemsToPageLibs(listItems) {
 var x=document.getElementById("selectLibs");
 x.innerHTML='';
 var oledg='';

 for (var i=0; i<listItems.length; i++){
   const [group, subgroup] = listItems[i].split(/[/\\]+/);
   if (group !== oledg) {
     var optgroup = document.createElement("optgroup");
     optgroup.label = group;
     optgroup.style="font-size: 12px; font-weight: bold; color:rgb(247, 244, 244); background-color:rgb(100, 100, 100);";
     x.appendChild(optgroup);
     oledg=group;
   }
   var option=document.createElement("option");
   option.text=subgroup;
   option.value= i;
   option.setAttribute('dir',listItems[i]);
   x.add(option);
 }
 if(drawing.itProject){
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
{   var sel=document.getElementById("selectLibs");
	  var dir=sel.options[sel.selectedIndex].getAttribute('dir');

	if(listSymbols.length>index)
	  addPart(listSymbols[index].sym,dir,true,listSymbols[index].name);

    var collection = document.getElementsByName("pin");

    for (var i = 0; i < collection.length; i++)
            drawingPin(collection[i]);
        
}

function changeListSym(){
  if(drawing.electronjs)
    importSymbols(parseInt(document.getElementById('selectLibs').value));
  else
	window.foo.importSymbols(parseInt(document.getElementById('selectLibs').value),function (val) {
			addListSymbToPageLibs(val);
			});
}


function updateLibrary() {

    window.foo.importLibs(function (val0) {
        addItemsToPageLibs(val0);
        window.foo.importSymbols(0, function (val1) {
            addListSymbToPageLibs(val1);
        });
    });
}


function openFilePy(){
    
}
