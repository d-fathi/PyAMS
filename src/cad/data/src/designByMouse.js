/*
#-------------------------------------------------------------------------------
# Name:        designByMouse.js
# Author:      d.fathi
# Created:     28/07/2021
# Copyright:  (c) PyAMS 2021
# Licence:
#-------------------------------------------------------------------------------
*/

function addShape(nameShape) {
    drawing.shapes.design = {
        mouse: true,
        start: false,
        name: nameShape,
        end: false
    }
    elemNotByDown();
}
function elemNotByDown() {
    switch (drawing.shapes.design.name) {
    case 'probe':
	      drawing.shapes.addElement(drawing.shapes.design.name);
		    drawing.resize.setElement = drawing.shapes.svgSym.lastChild;
		    drawing.shapes.design.start = true;
		    break;
	case 'analysis':
	case 'oscilloscope':
    case 'codeHTML':
    case 'codeSpice':
	case 'codePy':
	      drawing.shapes.addElement(drawing.shapes.design.name);
	      drawing.shapes.design.start = true;
          drawing.resize.setElement = drawing.shapes.svgSym.lastChild;
	      break;
	case 'part':
	      drawing.shapes.design.start = true;
          drawing.resize.setElement = drawing.shapes.svgSym.lastChild;
	      break;

    case 'ioparam':
	      drawing.shapes.design.start = true;
        drawing.shapes.addElement(drawing.shapes.design.name);
		break;

    case 'pin':
        drawing.shapes.addElement(drawing.shapes.design.name);
        drawing.shapes.svgSym.lastChild;
        var xo =10;
        var yo =10;
        var x = xo+10;
        var y = yo;
        drawing.shapes.svgSym.lastChild.setAttribute("points", xo + "," + yo + " " + x + "," + y);
        drawing.shapes.resize.deletEllipse();
        drawingPin(drawing.shapes.svgSym.lastChild);
        drawing.shapes.design.start = true;
        drawing.resize.setElement = drawing.shapes.svgSym.lastChild;
        break;

    case 'image':
    case 'text':
    case 'param':
    case '.param':
    case 'label':
    case 'ref':

        if(multiRef() && drawing.shapes.design.name=='ref') return;
        if(multiLabel() && drawing.shapes.design.name=='label') return;
        drawing.shapes.addElement(drawing.shapes.design.name);
        l=drawing.shapes.svgSym.lastChild;
        l.setAttribute("x", 10);
        l.setAttribute("y", 10);
        l.setAttribute("r", 0);
        l.setAttribute('transform', 'rotate(0 10 10)');
        drawing.shapes.design.start = true;
        drawing.resize.setElement = drawing.shapes.svgSym.lastChild;
        //deletMultiRef();
        break;
    }
}
function designMouseDown(self, pos) {

   if((self.design.name=='net') && (self.design.start))
	{
   		self.points.push({x:pos.x,y:pos.y});
		  self.points.push({x:pos.x,y:pos.y});
      self.svgSym.lastChild.setAttribute("points",polylineToAttribute(self.points, 0, 0));
		  if (itConnect(self.svgSym.lastChild,self.points))
		  {
		   	self.design.start=false;
		  	self.design.mouse=false;
			  drawing.saveData('Add :'+drawing.shapes.design.name);
      }

	return;
	}

    switch (self.design.name) {
    case 'ellipse':
        self.addElement(drawing.shapes.design.name);
        self.svgSym.lastChild;
        self.svgSym.lastChild.setAttribute("cx", pos.x);
        self.svgSym.lastChild.setAttribute("cy", pos.y);
        self.svgSym.lastChild.setAttribute("rx", 10);
        self.svgSym.lastChild.setAttribute("ry", 10);
        self.resize.deletEllipse();
        self.resize.setElement = drawing.shapes.svgSym.lastChild;
        self.resize.creatEllipse();
        self.design.start = true;
        break;

    case 'arc':
        self.addElement(drawing.shapes.design.name);
        self.resize.deletEllipse();
        self.resize.setElement = drawing.shapes.svgSym.lastChild;
        self.resize.creatEllipse();
        self.resize.ellps[0].x = pos.x;
        self.resize.ellps[0].y = pos.y;
        self.resize.ellps[3].x = pos.x + 30;
        self.resize.ellps[3].y = pos.y + 30;
        self.resize.pos = 3;
        self.resize.moveElementByPos();
        self.design.start = true;
        break;

    case 'rect':
        self.addElement(drawing.shapes.design.name);
        self.svgSym.lastChild;
        self.svgSym.lastChild.setAttribute("x", pos.x);
        self.svgSym.lastChild.setAttribute("y", pos.y);
        self.svgSym.lastChild.setAttribute("width", 10);
        self.svgSym.lastChild.setAttribute("height", 10);
        self.resize.deletEllipse();
        self.resize.setElement = drawing.shapes.svgSym.lastChild;
        self.resize.creatEllipse();
        self.design.start = true;
        break;

    case 'polyline':
  	case 'polygon':
        self.addElement(drawing.shapes.design.name);
        self.svgSym.lastChild;

        self.svgSym.lastChild.setAttribute("points", pos.x + "," + pos.y + " " + pos.x + "," + pos.y);
        self.resize.deletEllipse();

        self.resize.setElement = drawing.shapes.svgSym.lastChild;
        self.resize.creatEllipse();
        self.design.start = true;
        break;

    case 'net':
        self.addElement(drawing.shapes.design.name);
        self.svgSym.lastChild;
        self.points=[];
		    self.points.push({x:pos.x,y:pos.y});
		    self.points.push({x:pos.x,y:pos.y});
	    	self.points.push({x:pos.x,y:pos.y});
        self.svgSym.lastChild.setAttribute("points", pos.x + "," + pos.y + " " + pos.x + "," + pos.y);
	    	self.svgSym.lastChild.setAttribute("xdir",self.setNetXDir);
		    self.svgSym.lastChild.setAttribute("ref","n01");
		    self.svgSym.lastChild.setAttribute("parent",false);
	    	self.svgSym.lastChild.setAttribute("parentcolor",false);
		    self.svgSym.lastChild.setAttribute("used",false);
        self.resize.deletEllipse();
        self.design.start = true;
        break;
    }

}

function designMouseMouve(self, pos) {
    if (!drawing.shapes.design.start)
        return;

    switch (drawing.shapes.design.name) {
     case 'rect':
     case 'ellipse':
     case 'arc':
        self.resize.ellps[3].x = pos.x;
        self.resize.ellps[3].y = pos.y;
        self.resize.pos = 3;
        self.resize.moveElementByPos();
        break;

     case 'polyline':
	   case 'polygon':
        self.resize.ellps[1].x = pos.x;
        self.resize.ellps[1].y = pos.y;
        self.resize.pos = 1;
        self.resize.moveElementByPos();
        break;


	    case 'ioparam':
	        setparamPos(pos.x,pos.y,drawing.shapes.svgSym.lastChild);
	        break;

      case 'pin':
          var xo = pos.x;
          var yo = pos.y;
          var x = xo + 10;
          var y = yo;
          drawing.shapes.svgSym.lastChild.setAttribute("points", xo + "," + yo + " " + x + "," + y);
          drawingPin(drawing.shapes.svgSym.lastChild);
        break;

      case 'probe':
	  case 'part':
      case 'oscilloscope':
      case 'codeHTML':
      case 'codeSpice':
	  case 'codePy':
	       var x=pos.x;
		   var y=pos.y;
	       drawing.shapes.svgSym.lastChild.setAttribute("x", x);
           drawing.shapes.svgSym.lastChild.setAttribute("y", y);
		   drawing.shapes.svgSym.lastChild.setAttribute('transform',"translate("+x+","+y+")");
		  break;
    case 'image':
    case 'text':
    case 'param':
    case '.param':
	case 'label':
  	case 'ref':
        l=drawing.shapes.svgSym.lastChild;
        l.setAttribute("x", pos.x);
        l.setAttribute("y", pos.y);
        l.setAttribute('transform', 'rotate(0 '+pos.x+' '+pos.y+')');
        drawing.shapes.design.start = true;
        drawing.resize.setElement = drawing.shapes.svgSym.lastChild;
        break;

  	case 'net':
	     var n=self.points.length-1
	     self.points[n]={x:pos.x,y:pos.y};
	     setDirectionNetByType(self.points,self.setNetXDir);
	     self.svgSym.lastChild.setAttribute("points", polylineToAttribute(self.points, 0, 0));
	     break;
    }
}

function designMouseUp(self, pos) {
	if((drawing.shapes.design.name=='net') && (drawing.shapes.design.start))
	return;

	if(drawing.shapes.design.mouse) {
 	  drawing.saveData('Add :'+drawing.shapes.design.name);
      updateLableOfParts();
    }
    
    
    drawing.shapes.design.mouse = false;
    drawing.shapes.design.start = false;
}
