/*
#-------------------------------------------------------------------------------
# Name:        net.js
# Author:      d.fathi
# Created:     24/08/2021
# Copyright:  (c) PyAMS 2021
# Licence:
#-------------------------------------------------------------------------------
*/


function setDirectionNetByType(p,typeXDir)
{
	
		p[0].typedX=typeXDir;
		
		
		for(var i=1; i<p.length;i++)
			p[i].typedX=!p[i-1].typedX;
			
		for(var i=p.length-2; i>=0; i--)
			{
			
				if(p[i].typedX)
					p[i].x=p[i+1].x;
				else
					p[i].y=p[i+1].y;
								
			}
		
}


function setDirectionNetByTypePos0(p,typeXDir)
{
	
		p[0].typedX=typeXDir;
		
		
		for(var i=1; i<p.length;i++)
			p[i].typedX=!p[i-1].typedX;
			
		for(var i=0; i<p.length-1; i++)
			{
				if(p[i].typedX)
					p[i+1].x=p[i].x;
				else
					p[i+1].y=p[i].y;				
			}
		
}

function getTypeDirOfNet(self)
{
	if(self.setElement.getAttribute("name") != 'net') return;
	 self.points[0].typedX=(self.setElement.getAttribute("xdir")=='true');
     for(var i=1; i<self.points.length; i++)
     self.points[i].typedX=!self.points[i-1].typedX;
}



function ShangeNetDierction(self)
{

    if(self.setElement.getAttribute("name")!='net') return;
	
	var i=self.pos;
    var p=self.points;
	var l=self.points.length-1;
	
	for(var j=0; j<=l; j++)
	{
	  self.points[j].x= 5*parseInt(self.points[j].x/5);
	  self.points[j].y= 5*parseInt(self.points[j].y/5);
	}
	
    self.ellps[i].x=self.points[i].x;
    self.ellps[i].y=self.points[i].y;
	
	function moveEllpsToNewPos(n){
	       self.ellps[n].x=self.points[n].x;
           self.ellps[n].y=self.points[n].y;
		   self.moveElement(self.ellps[n]);
	}
	


			if(p[i].typedX)
			{   
				if(i!=l) p[i+1].x=p[i].x;
				if(i!=0) p[i-1].y=p[i].y;
			}
			else
			{
				if(i!=l) p[i+1].y=p[i].y;
				if(i!=0) p[i-1].x=p[i].x;
			}
			
			if(i!=l) moveEllpsToNewPos(i+1);
			if(i!=0) moveEllpsToNewPos(i-1);
}



function getPolyPointsOfNet(self) {

	var elem=self.selectedElement;
	if(elem.getAttribute("name")!='net') return;
	var p=getArrayPoints(elem);
	var n=pointInPolylineGetPos(p, self.offset);
	if(n==-1) return;
	if(p[n].x==p[n+1].x) self.typedX=true; else self.typedX=false;	
	self.posPoint=n;
}


function setPolyPointsNetDierction(self) {
	var n=self.posPoint;
	if(self.typedX)
	{
		 self.points[n].x=self.coord.x;
		 self.points[n+1].x=self.coord.x;
	}
	else
	{
		 self.points[n].y=self.coord.y;
		 self.points[n+1].y=self.coord.y;
	}
}


	

function refNetWithPart()
{
	var netId=0;
	var partsDesc=[];
	
	var collection = document.getElementById("sym").children;
	for (var i=0; i<collection.length; i++)
	{
		if(collection[i].getAttribute("name")=='net')
		{
		 collection[i].setAttribute("id",netId);
		 netId++;
		} else if(collection[i].getAttribute("name")=='part')
		{
		  partsDesc.push({part:collection[i],pins:getListPins(collection[i])});	
		}
	}
	
	

   for(var i=0; i<partsDesc.length; i++)
	  for(var j=0; j<partsDesc[i].pins.length; j++)
		 partsDesc[i].pins[j].elem.childNodes[1].style.display="block";

	for(var i=0; i<partsDesc.length; i++)
	{
		var pins=partsDesc[i].pins;
		for(var j=0; j<netId; j++)
		{
		   var netElem=document.getElementById(j);	
		   var p=getArrayPoints(netElem);
		   var l=p.length-1;
		   for(var n=0; n<pins.length; n++){
			   if((pins[n].x==p[0].x)&&(pins[n].y==p[0].y))
			    {
				   pins[n].elem.childNodes[1].style.display="none"; 
                   pins[n].elem.setAttribute('netId',j);
				   pins[n].elem.setAttribute('netIdPos',0);
                   				   
			    } else if((pins[n].x==p[l].x)&&(pins[n].y==p[l].y))
			    {
				   pins[n].elem.childNodes[1].style.display="none"; 
                   pins[n].elem.setAttribute('netId',j);
				   pins[n].elem.setAttribute('netIdPos',l);
                   				   
			    }			   
		   } 
		}
	}
	
drawing.maxIdNet=netId;
	
drawing.pins=[];

for(var i=0; i<partsDesc.length; i++)
	for(var j=0; j<partsDesc[i].pins.length; j++)
		if(partsDesc[i].pins[j].elem.childNodes[1].style.display=="block")
		  drawing.pins.push(partsDesc[i].pins[j]);	

nodes();
getNetRef();
modifiedNetRefColor();			
}


function itConnect(elem,p)
{
  var pins=drawing.pins;
  var l=p.length-1;
  
  if((p[0].x==p[l].x)&&(p[0].y==p[l].y)) 
	  return false;
  
  for(var n=0; n<pins.length; n++)
	if((pins[n].x==p[l].x)&&(pins[n].y==p[l].y))
	   {
		 p.pop();
		 p.pop();
		 elem.setAttribute("points",polylineToAttribute(p, 0, 0));
		 return true;			
	   }
	   
  var v=itConnectNetByNode(p[l].x,p[l].y,parseInt(elem.id));   
  if(v!=-1) 
	  return true;
  
  return false;

}


function netAddInThisPos(pos)
{
	            pos.x=5 * Math.round(pos.x/5);
                pos.y=5 * Math.round(pos.y/5);
	var pins=drawing.pins;
	for(var n=0; n<pins.length; n++)
	  if((pins[n].x==pos.x)&&(pins[n].y==pos.y))
	   {
		 drawing.shapes.setNetXDir=pins[n].typeXDir;
		 addShape('net');
		 return true;			
	   }
	 return false;
}


function netItIsPosOfPin(pos)
{
	pos.x=5 * Math.round(pos.x/5);
    pos.y=5 * Math.round(pos.y/5);
	
	var pins=drawing.pins;
	for(var n=0; n<pins.length; n++)
	  if((pins[n].x==pos.x)&&(pins[n].y==pos.y))
	    {
		 pins[n].elem.childNodes[1].style.fill = "#ff0000";          
		 return true;			
	    }
	   else 
		 pins[n].elem.childNodes[1].style.fill = "none"; 
	 return false;
}


function movePartWithConnectNets(self)
{
	var part=self.selectedElement;
	var pins=getListPins(part);
	
	for(var i=0; i<pins.length; i++)
		if(pins[i].elem.childNodes[1].style.display=="none")
		{
			var netId=pins[i].elem.getAttribute('netId');
			var netIdPos=parseInt(pins[i].elem.getAttribute('netIdPos'));
			var elemNet=document.getElementById(netId);
			var points=getArrayPoints(elemNet);
			var typeXDir=(elemNet.getAttribute("xdir")=='true');
			points[netIdPos].x=parseInt(pins[i].x);
			points[netIdPos].y=parseInt(pins[i].y);
			if(netIdPos==0)
				setDirectionNetByTypePos0(points,typeXDir);
			else
			    setDirectionNetByType(points,typeXDir);
			elemNet.setAttribute("points", polylineToAttribute(points, 0, 0));
			
		

		}
}




