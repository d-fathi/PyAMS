
function getCursorByResize(resize)
{
	switch (resize.setElement.getAttribute("name")) {
     case "rect":
	 case "image":
	 case "ellipse":
	  if ((resize.posCursor ==3)||(resize.posCursor ==0))
		 resize.svgElem.style.cursor = 'nw-resize';
	  else
		 resize.svgElem.style.cursor = 'ne-resize';
	 break;
	 
	case "net":
	case "polyline":
	case "polygon":
       resize.svgElem.style.cursor = 'move';
	 break;
	}
}

function getCursor(self,selectdElem)
{    if(selectdElem)
	  var elem=self.selectedElement;
	 else
	  var elem=self.setCritElem;
	if(elem.getAttribute("name")!='net') return 'move';
	var p=getArrayPoints(elem);
	var n=pointInPolylineGetPos(p, self.offset);
	if(n==-1) return 'move';
	if(p[n].x==p[n+1].x) return 'e-resize'; else return'n-resize';	
}


