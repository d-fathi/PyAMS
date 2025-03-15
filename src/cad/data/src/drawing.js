/*
#--------------------------------------------------------------------------------------------------
# Name:        drawing.js
# Author:      d.fathi
# Created:     05/07/2021
# Update:      05/08/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free
#---------------------------------------------------------------------------------------------------
*/

//--------------------------------Class  of drawing-------------------------------------------//

function fdrawing(div) {

    var self = this;
    self.div = div;
    self.electronjs=true;
    self.objectInspector = null;
    self.itSymbol = true;
    self.usedByInterface = false;
    self.modified = false;
    self.posUndo = 0;
    self.copyList = [];
    self.pins = [];
	self.vars=[];
    self.maxIdNet= -1;
    self.pageType='sym';
	self.objectInspector=null;
	self.showPolarity=false;
    self.filesPy=[]
    self.filesSy=[]
    self.itProject=false;
    self.path='';
    
    //*************Creat body of drawing************************************************************//
    
    createBody(self);
    this.grid = new fgrid("svg", 1800, 1800);
    this.shapes = new fshapes("svg", self, 1800, 1800);
    this.resize = new fresize("svg", self, 1800, 1800);
    this.symbol = {
        name: "New Symbol",
        reference: "X",
        description: {webPage:'',info:''}
    };
    this.elemg = '<g width="1550" top="0" left="0" height="1550"  version="0.0.7" zoom="3" reference="X" description=" "></g>';
    this.grid.resize = self.resize;
    this.shapes.resize = self.resize;
	  this.resize.grid=this.grid;
    this.data = [{
            setDescription: 'New',
            symbol: self.elemg
        }];



    this.changPositionRuler = function () {
        self.grid.getRuler();
    };

	this.showGrid=function(show){
		self.grid.showGrid=show;
		self.grid.getGrid();
	}

    this.add = function (type) {
        self.shapes.addElement(type);
    }

    this.zoomIn = function () {
        self.grid.zoomIn();
    }

    this.zoomOut = function () {
        self.grid.zoomOut();
    }

    document.getElementById("areaGlobal").addEventListener("scroll", self.changPositionRuler);

    self.setSize = function (w, h) {
        var r = (h) + 'px'
        document.getElementById("areaGlobal").style.height = r;
    }

    //*************Option of simulation************************************************************//
    self.getOptionSimulation=function()
      {
	     return {};//itl:200, aftol:1e-8, aptol:1e-6, reltol:1e-3, error:1e-8, integration:'trapezoidal', interval:300
      }

    this.optionsimulation=self.getOptionSimulation();

    //************Actions of edit and show*****************************************************//

    self.saveData = function (description) {
		plotsSaveDataLayoutInDiv();

        self.data.push({
            setDescription: description,
            symbol: document.getElementById("sym").innerHTML
        });
        self.posUndo = self.data.length - 1;
        self.modified = true;
    }

    self.undo = function () {

        if (self.posUndo <= 0)
            return;
        self.posUndo = self.posUndo-1;
        self.resize.deletEllipse();
        document.getElementById("sym").innerHTML = self.data[self.posUndo].symbol;
        self.modified = true;
		plotsOpenDataLayoutInDiv();

    }

    self.redo = function () {

        if (self.posUndo >= self.data.length - 1)
            return;
        self.posUndo = self.posUndo+1;
        self.resize.deletEllipse();
        document.getElementById("sym").innerHTML = self.data[self.posUndo].symbol;
        self.modified = true;
		plotsOpenDataLayoutInDiv();


    }

	self.getDescUndo=function(){
		return self.data[self.posUndo].setDescription;
	}

    self.copy = function () {
        if (self.shapes.lsg.elms.length > 0) {
            self.copyList = [];
            for (var i = 0; i < self.shapes.lsg.elms.length; i++) {
                self.copyList.push({
                    node: self.shapes.lsg.elms[i].cloneNode(true)
                });
            }
        } else if (self.resize.setElement) {
            self.copyList = [];
            self.copyList.push({
                node: self.resize.setElement.cloneNode(true)
            });
        }
    };

	self.active=function()
	{
		clearSelectElms(self.shapes);
    self.resize.deletEllipse();
		refNetWithPart();
	}
    self.past = function () {
        if (self.copyList.length == 0)
            return;
        for (var i = 0; i < self.copyList.length; i++) {
            var copy = self.copyList[i].node.cloneNode(true);
            document.getElementById("sym").appendChild(copy);
            updateAnalysis();
            window.onload;
        }
        deletMultiRef();
        selectPast(self);
        self.saveData('Past ');


    };
    self.cut = function () {
        self.copy();
        if (self.shapes.lsg.elms.length > 0) {
            for (var i = 0; i < self.shapes.lsg.elms.length; i++)
                self.shapes.lsg.elms[i].remove();
            clearSelectElms(self.shapes);
            self.saveData('Cut ');
        } else if (self.resize.setElement) {
            self.resize.setElement.remove();
            self.resize.deletEllipse();
            self.saveData('Cut ');
        }



    };

    //******************Actions of file************************************************************//

    self.newPage = function (type) {
        clearSelectElms(self.shapes);
        self.resize.deletEllipse();
		self.showPolarity=false;
		self.optionsimulation=self.getOptionSimulation();
        self.itProject=false;

		svg=document.getElementById('nodes');
	    svg.innerHTML='';

        if (type == 'sym') {
            self.grid.zoom = 6;
            self.grid.pageSize(350, 350);
        } else {
            self.grid.zoom = 3;
            self.grid.pageSize(1500, 1500);
        }

        document.getElementById("sym").innerHTML = self.elemg;
        self.grid.area.areaGlobal.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        self.modified = false;
        self.posUndo = 0;
        self.data = [{
                setDescription: 'New',
                symbol: self.elemg
            }
        ];
        self.pageType = type;
        self.symbol = {
        fname:"NewFile.sym",
        name: "New",
        model:"standard",
        reference: "X",
        description: " ",
        type:"None"
    };
    
     if(self.objectInspector)
		 self.objectInspector.getDescriptionPage();
	 getPageLibDesc(self.pageType);
    }

    self.setSymbolDescription = function () {
        sym = document.getElementById("sym").firstChild;
        var width = sym.getAttribute("width");
        var height = sym.getAttribute("height");
        var zoom = parseFloat(sym.getAttribute("zoom"));
        var scrollLeft = parseInt(sym.getAttribute("left"));
        var scrollTop = parseInt(sym.getAttribute("top"));

        self.grid.zoom = zoom;
        self.grid.pageSize(width, height);
        self.grid.area.areaGlobal.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
        });
        self.symbol.name = sym.getAttribute("symbolname");
        self.symbol.reference = sym.getAttribute("reference");
        self.symbol.description = sym.getAttribute("description");
        self.symbol.type = sym.getAttribute("type");
        self.symbol.model = sym.getAttribute("model");
        if(self.symbol.model==null)
        {
          self.symbol.model="standard";
        }
		self.active();
		if((self.pageType!='sym')&&sym.getAttribute("optionsimulation"))
		  self.optionsimulation=self.optionsimulation=JSON.parse(sym.getAttribute("optionsimulation"));
        
        if(self.pageType!='sym')
          self.itProject=sym.getAttribute("itproject")=='true';
       

    try {  self.symbol.description  = JSON.parse(self.symbol.description);}
    catch(err) { self.symbol.description={webPage:'',info:''}; }

    }

    self.getSymbolDescription = function () {

        sym = document.getElementById("sym").firstChild;
        sym.setAttribute("width", self.grid.width);
        sym.setAttribute("height", self.grid.height);
        sym.setAttribute("zoom", self.grid.zoom);
        sym.setAttribute("left", self.grid.area.areaGlobal.scrollLeft);
        sym.setAttribute("top", self.grid.area.areaGlobal.scrollTop);
        sym.setAttribute("symbolname", self.symbol.name);
        sym.setAttribute("reference", self.symbol.reference);
        sym.setAttribute("description",JSON.stringify(self.symbol.description));
        sym.setAttribute("type", self.symbol.type);
        sym.setAttribute("model", self.symbol.model);

		if(self.pageType!='sym'){
		sym.setAttribute("optionsimulation",JSON.stringify(self.optionsimulation));
        sym.setAttribute("itproject", self.itProject);
        }
    }

    self.getSymbol = function () {
        self.getSymbolDescription();
		plotsSaveDataLayoutInDiv();
        return document.getElementById("sym").innerHTML;
    }

    self.setSymbol = function (sym) {
        document.getElementById("sym").innerHTML = sym;
        self.modified = false;
        self.posUndo = 0;
        self.data = [{
                setDescription: 'New',
                symbol: sym
            }];
        self.setSymbolDescription();
		self.showPolarity=false;
		ItShowPolarity();
		if(self.objectInspector)
		 self.objectInspector.getDescriptionPage();
	    plotsOpenDataLayoutInDiv();
        modifiedClassText();
        updateHtmlCode();
    }
//******************* "interface of description" or "Objec tInspector" *****************************/
self.getObjectInspector =function(div){
self.objectInspector=new fobjectInspector(div, self);

};

    self.newPage('sym');


}



//-------------------------------------------------creat page of drawing circuit or symbol-----------------------------------//
var drawing;
var typePyAMS=true;



function creatPage(div) {

    function resizeCanvas() {
    var w = document.getElementById(div).offsetWidth - 2;
    var h = document.getElementById(div).offsetHeight - 1;
	  var wf=document.getElementById('flex').offsetWidth - 2;
    drawing.setSize(w,h-10);
	if(wf >400){
	   var pixels = 94*3;
     var screenWidth = (wf);//window.screen.width;
     var percentage = pixels*100/screenWidth;
	 instance.setSizes([percentage, 100-percentage]);}
	 //document.getElementById("one").style.width = pixels+"px";
	 //document.getElementById("two").style.width = "calc(100%-"+pixels+"px)";
	
	}
    drawing = new fdrawing(div);
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    
	return drawing;
}
