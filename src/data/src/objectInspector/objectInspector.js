/*
#-------------------------------------------------------------------------------
# Name:        Object inspector.js
# Author:      d.fathi
# Created:     14/07/2021
# Update:      20/08/2024
# Copyright:  (c) PyAMS 2024
# Licence:    free GPLv3
#-------------------------------------------------------------------------------
 */

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

var mtable = {};
mtable.pos = -1;
mtable.newElem = null;
mtable.self = null;
mtable.table = null;

function getDescription(self,elemSelect){
	 mtable.self =null;
	 mtable.table = null;
	 setTimeout(function(){
		 if(self.drawing.objectInspector)
 	        self.drawing.objectInspector.getSelect(elemSelect);
}, 100);

	}


function updateObjectInspector(elemSelect)
{
  drawing.objectInspector.getSelect(elemSelect);
}


function Change(index, self,tab) {
    //	var txt = parseInt(document.getElementById("txt").value)
  //  if (mtable.pos == index)
    //    return;

  //  modified();

    if (mtable.table[index].type == 'select') {
        mtable.self = self;
        mtable.newElem = document.createElement("select");
        array = mtable.table[index].array;
		var setIndex=0;

        for (var i = 0; i < array.length; i++) {
            var option = document.createElement("option");
            option.value = array[i];
            option.text = array[i];
            mtable.newElem.appendChild(option);
			if(option.value==withOutQuotationMarks(self.innerHTML))
				setIndex=i;
        }
//console.log('select  :'+self.innerHTML);
        mtable.newElem.setAttribute("value", self.innerHTML);
        mtable.newElem.setAttribute("onchange", "changeSelect("+(index+tab)+",this)");
        mtable.newElem.setAttribute("class", "myInput");
		mtable.newElem.selectedIndex=setIndex;
        self.innerHTML = '';
        mtable.pos = index;
        self.appendChild(mtable.newElem);
        return;
    }

    mtable.self = self;
    mtable.newElem = document.createElement("input");
    mtable.newElem.setAttribute("type", mtable.table[index].type);
    mtable.newElem.setAttribute("value", self.innerHTML);
	if(mtable.table[index].type=="Button")
	  mtable.newElem.setAttribute("onclick", mtable.table[index].setClick);
	else
	{
      mtable.newElem.setAttribute("onchange", "changeSelect("+(index+tab)+",this)");
			mtable.newElem.setAttribute("onkeyup", "changeSelect("+(index+tab)+",this)");
		}
    mtable.newElem.setAttribute("class", "myInput");
	if (mtable.table[index].condition)
	{
		var c=mtable.table[index].condition;
		for(var i=0; i<c.length;i++)
		{
			var d=c[i];
			mtable.newElem.setAttribute(d[0],d[1]);
		}

	}
    self.innerHTML = '';
    mtable.pos = index;
    self.appendChild(mtable.newElem);

}

//-------Live modified of attribute of element----------------------------------


function changeSelect(pos,e) {

  

 switch (mtable.typeSelect) {
    case 'page':
        pageModified(pos,e);
        break;

    case 'rect':
        modifiedRect(pos,e);
        break;

    case 'ellipse':
        modifiedEllipse(pos,e);
        break;

    case 'arc':
        modifiedArc(pos,e);
        break;

	case 'image':
        modifiedImage(pos,e);
        break;


	case 'ioparam':
	     modifiedioparam();
		break;

    case 'pin':
        modifiedPin(pos,e);
        break;

	case 'analysis':
	   modifiedAnalysis(pos,e);
	   break;

	case 'codePy':
	   modifiedcodePy(pos,e);
	   break;

	case 'codeHTML':
	 	  modifiedcodeHTML(pos,e);
	 	  break;

	case 'codeSpice':
		   modifiedcodeSpice(pos,e);
		   break;

    case 'text':
		case '.param':
        modifiedText(pos,e);
        break;

    case 'label':
        labelModified(pos,e);
        break;

	case 'polyline':
        polylineModified(pos,e);
        break;

	case 'polygon':
        polygonModified(pos,e);
        break;

	case 'part':
	      partModified(pos,e);
	      break;

	case 'net':
        netModified(pos,e);
        break;

    case 'ref':
        refModified(pos,e);
        break;

    case 'param':
        paramModified(pos,e);
        break;

	case 'probe':
	      probeModified(pos,e);
        break;

	case 'oscilloscope':
	      oscilloscopeModified();
        break;
    }
    drawing.saveData('Changed property of ' + mtable.typeSelect);
}

//-------Creat table of description of element--------------------------------------------

function fobjectInspector(id, drawingIntarface) {
    var self = this;
    self.id = id;
    self.drawing = drawingIntarface;
    self.grid = drawingIntarface.grid;
    mtable.grid = self.grid;
    mtable.px = 5;
    mtable.resize = drawingIntarface.resize;
	mtable.pos=-1;


    self.creat = function () {
        var s = '<table  id="customers"><tr><th style="width:55%">Property </th><th style="width:45%">Value</th></tr>';
        for (var i = 0; i < mtable.table.length; i++)
            s = s + '<tr><td>' + mtable.table[i].name + '</td><td id="addelemin'+ i + '">' + mtable.table[i].value + '</td></tr>';
				if(mtable.typeSelect=='analysis'){
				  s=creatAxePropryter(s);
				  s=creatLyoutPropryter(s);
					for (var i = 0; i < mtable.tableLyout.length; i++)
							s = s + '<tr><td>' + mtable.tableLyout[i].name + '</td><td id="addelemin'+ (5+i) + '">' + mtable.tableLyout[i].value + '</td></tr>';
				} else if(mtable.typeSelect=='page'){
					      if (drawing.itProject)
								  s=creatPagePropryter(s);
				}
           s = s + '</table>';
           document.getElementById(self.id).innerHTML = s;
				for (var i = 0; i < mtable.table.length; i++){
				var pos=document.getElementById("addelemin"+i );
				Change(i, pos,0);
			}
			if(mtable.typeSelect=='analysis'){
				mtable.table=mtable.tableLyout;
				for (var i = 0; i < mtable.table.length; i++){
				var pos=document.getElementById("addelemin"+(5+i) );
				Change(i, pos,5);
			}
			}

    }

    mtable.parent=this;
    self.getSelect = function (select) {
        mtable.pos=-1;
		mtable.typeSelect='';
		mtable.newElem=null;

       

        if (select) {
            mtable.select = select;
			
            switch (mtable.select.getAttribute("name")) {
            case "rect":
                rectSelect();
                self.creat();
                break;

            case "ellipse":
                ellipseSelect();
                self.creat();
                break;

            case "arc":
                arcSelect();
                self.creat();
                break;

            case "pin":
                pinSelect();
                self.creat();
                break;

			     case "ioparam":
			          ioparamSelect();
                self.creat();
                break;

			case "image":
				imageSelect();
				self.creat();
				break;

	         case 'analysis':
	            analysisSelect();
	            self.creat();
	            break;

			case 'codePy':
	           codePySelect(self);
			   self.creat();
	        break;

		 case 'codeHTML':
	 	   codeHTMLSelect();
	 	     self.creat();
	 	   break;

			case 'codeSpice':
				codeSpiceSelect();
				  self.creat();
				break;


			case "polyline":
                polylineSelect();
                self.creat();
                break;

			case "polygon":
                polygonSelect();
                self.creat();
                break;

			case "net":
                netSelect();
                self.creat();
                break;

            case "part":
                partSelect(self);
                break;

            case "text":
						case ".param":
                textSelect();
                self.creat();
                break;

            case "label":
                labelSelected();
                self.creat();
                break;

            case "ref":
                refSelected();
                self.creat();
                break;

			 case "param":
                paramSelected();
                self.creat();
             break;

			 case "probe":
                probeSelect();
                self.creat();
             break;

			 case "oscilloscope":
                oscilloscopeSelect();
                self.creat();
             break;


            }
        } else {
            mtable.select = self.grid;
            pageSelect(self);
            self.creat();
        }

    }

	self.getDescriptionPage=function()
	{
		self.drawing.resize.setElement=null;
		self.getSelect();
	}


    self.getSelect();
    self.creat();
    //if (drawingIntarface.resize)
      //  drawingIntarface.resize.svgElem.addEventListener("moused", this.getSelect);

}


//----------------------------------------------------------------------------

function colorOutput(n,e){
	var analy=JSON.parse(mtable.select.getAttribute("description"));
	if(n==-1)
	{
		analy.xAxe.color=e.value;
	}
	else {
		analy.yAxe.outputs[n].color=e.value;
	}
	mtable.select.setAttribute("description", JSON.stringify(analy));
}

function removeOutput(n){
	var analy=JSON.parse(mtable.select.getAttribute("description"));
	if(n==-1)
	{
		analy.xAxe.used=false;
	}
	else {
		analy.yAxe.outputs.splice(n, 1);
	}
	mtable.select.setAttribute("description", JSON.stringify(analy));
	analysisSelect();
	mtable.parent.creat();
}
function axeLogarithmic(n,e){
	var analy=JSON.parse(mtable.select.getAttribute("description"));
	if(n==0) {
	 if(analy.yAxe.logarithmic)
	   analy.yAxe.logarithmic=false;
	 else
  	analy.yAxe.logarithmic=true;
	} else 	{
		 if(analy.xAxe.logarithmic)
		   analy.xAxe.logarithmic=false;
		 else
	  	analy.xAxe.logarithmic=true;
		}
	mtable.select.setAttribute("description", JSON.stringify(analy));
	analysisSelect();
	mtable.parent.creat();
}



function checkboxButton(n,e){
	var analy=JSON.parse(mtable.select.getAttribute("description"));
	if(n==2){
		if(analy.secondsweep.used)
		  analy.secondsweep.used=false;
		else
		  analy.secondsweep.used=true;
			mtable.select.setAttribute("description", JSON.stringify(analy));
			analysisSelect();
			mtable.parent.creat();
	}
}

function setChangeSecondSweep(n,e)
{
	if(n==1)
	{
		var analy=JSON.parse(mtable.select.getAttribute("description"));
		analy.secondsweep.list=e.value;
		mtable.select.setAttribute("description", JSON.stringify(analy));
	}
}

function setXAxeName(e){
	var analy=JSON.parse(mtable.select.getAttribute("description"));
	analy.xAxe.name=e.value;
	analy.xAxe.used=analy.xAxe.name!='None';
	mtable.select.setAttribute("description", JSON.stringify(analy));
}

function creatAxePropryter(s)
{

	  var analy=JSON.parse(mtable.select.getAttribute("description"));
		var r=analy.yAxe.outputs;
		var x=analy.xAxe;
		var v=analy.secondsweep;

	//	s=s+'<tr><td>Second sweep</td><td><input class="myInput" type="button"  onclick="checkboxButton(2,this)" value='+analy.secondsweep.used+'></td></tr>';
		s = s + '<tr><th colspan="2">Y axe property</th></tr>';

		for(var i=0; i<r.length;i++)
		{
			s = s + '<tr><td>'+r[i].name+'</td><td><table><tr><td><input class="myInput" type="color"  onchange="colorOutput('+i+',this)" value='+r[i].color+'></td><td><button class="myInput"  onclick="removeOutput('+i+')">❌</button></td></table></td></tr>';
		}
		var r=analy.yAxe;
		s = s + '<tr><td>Output</td><td><input class="myInput" type="button" value="Add" onclick="getParamAnalysis(0,0)"></td></tr>';
		s = s + '<tr style="height: 25px"><td>Logarithmic</td><td style="height: 25px"><button class="myInput" type="button"   onclick="axeLogarithmic(0,this)">'+r.logarithmic+'</button></td></tr>';
        s = s + '<tr><th colspan="2">X axe property</th></tr>';
		var m='Add';
  
		if(x.used){
			  s = s + '<tr><td>'+x.name+'</td><td><table><tr><td><input class="myInput" type="color"  onchange="colorOutput(-1,this)" value='+x.color+'></td><td><button class="myInput"  onclick="removeOutput(-1)">❌</button></td></table></td></tr>';
		      m='Modified'
		    }
			
		s = s + '<tr><td>Output</td><td><input class="myInput" type="button" value="'+m+'" onclick="getParamAnalysis(1,0)"></td></tr>';
		s = s + '<tr style="height: 25px"><td>Logarithmic</td><td style="height: 25px"><button class="myInput" type="button"  onclick="axeLogarithmic(-1,this)">'+x.logarithmic+'</button></td></tr>';

		if(analy.secondsweep.used){
		  s= s+ '<tr><th colspan="2">Second sweep property</th></tr>';
			s= s+ '<tr><td>Paramater</td><td><input class="myInput" type="button" value="'+analy.secondsweep.param+'" onclick="getParamAnalysis(2,0)"></td></tr>';
			s= s+ '<tr><td>Values</td><td><input class="myInput" type="text" placeholder="1,2,5,10" value="'+analy.secondsweep.list+'" onchange="setChangeSecondSweep(1,this)"></td></tr>';
	  }
		return s;
}

function setLyoutValue(e,pos){
	var elem= mtable.select.lastChild.firstChild;
	var layout = JSON.parse(elem.getAttribute("layout"));
	var data = JSON.parse(elem.getAttribute("data"));

	switch (pos) {
	  	case 0:
		  	var elem= mtable.select.lastChild.firstChild;
		  	var layout = JSON.parse(elem.getAttribute("layout"));
		  	var data = JSON.parse(elem.getAttribute("data"));
			  layout.title.text=e.value;
				Plotly.newPlot(elem, data, layout, plotConfig);
			break;
	}

	layout= JSON.stringify(layout);
	data= JSON.stringify(data);
	elem.setAttribute("layout", layout);
	elem.setAttribute("data", data);
}

function creatLyoutPropryter(s) {
	 s=s+'<tr><th colspan="2">Layout property</th></tr>';
	// s= s+ '<tr><td>Title.text</td><td><input class="myInput" type="text" value="'+layout.title.text+'" onkeyup="setLyoutValue(this,0)"></td></tr>';
	return s;

}

function creatPagePropryter(s){

	if (drawing.filesPy.length >=1){
	s = s + '<tr><th colspan="2">Python files</th></tr>';
	for (var i=0; i<drawing.filesPy.length; i++)
	s=s+'<tr><td>'+drawing.filesPy[i]+'</td><td><button class="myInput"  onclick="window.foo.openFile(`'+drawing.filesPy[i]+'`,1)">Edit</button></td></tr>';
}
  //	s=s+'<tr><td>New file</td><td>Creat</td></tr>';
	if (drawing.filesSy.length >=1){
	s = s + '<tr><th colspan="2">Symbol files</th></tr>';
	for (var i=0; i<drawing.filesSy.length; i++)
	s=s+'<tr><td>'+drawing.filesSy[i]+'</td><td><button class="myInput"  onclick="window.foo.openFile(`'+drawing.filesSy[i]+'`,0)">Edit</button></td></tr>';;
}
	return s;
}
