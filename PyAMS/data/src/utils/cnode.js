
/*
#-------------------------------------------------------------------------------
# Name:        cnode.js
# Author:      d.fathi
# Created:     27/08/2021
# Copyright:  (c) PyAMS 2021
# Licence:
#-------------------------------------------------------------------------------
*/


function itConnectNetByNode(x,y,id)
{
	for(var i=0; i<drawing.maxIdNet; i++)
	 if(id!=i)
	   {
		  var elemNet=document.getElementById(i);
		  var points=getArrayPoints(elemNet);
		  for (var j=0; j<points.length-1; j++) {
            if ((points[j].x==points[j+1].x) && (points[j].x==x) && (y<=Math.max(points[j].y,points[j+1].y))&& (y>=Math.min(points[j].y,points[j+1].y)))
				return i;
			else if ((points[j].y==points[j+1].y) && (points[j].y==y) && (x<=Math.max(points[j].x,points[j+1].x))&& (x>=Math.min(points[j].x,points[j+1].x)))
				return i;
		  }
              				
	   }
	   
	   return -1;
}


function nodes()
{
	svg=document.getElementById('nodes');
	svg.innerHTML='';
	rect=[];
	
	for(var i=0; i<drawing.maxIdNet; i++)
	{
		 var netElem=document.getElementById(i);	
		 var p=getArrayPoints(netElem);
		 var l=p.length-1;
		 
		 var r=itConnectNetByNode(p[0].x,p[0].y,i);
         if(r!=-1)
		 {
			rect.push({x:p[0].x,y:p[0].y});
		 }
		
		
		 netElem.setAttribute('node0',r);
		 
		 var r=itConnectNetByNode(p[l].x,p[l].y,i);
         if(r!=-1)
		 {
			rect.push({x:p[l].x,y:p[l].y});
		 }

		 netElem.setAttribute('node1',r);
		 v=netElem.getAttribute('node1');
        			
	}
	
	
	var r = 2; // / self.zoom;
    for (var i = 0; i < rect.length; i++) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse');
        newElement.style.stroke = "#000000";
        newElement.style.fill = "#000000";
        newElement.style.strokeWidth = "1px";
        newElement.setAttribute("cx", rect[i].x);
        newElement.setAttribute("cy", rect[i].y);
        newElement.setAttribute("rx", r);
        newElement.setAttribute("ry", r);
		newElement.setAttribute("id", 'node'+i);
        svg.appendChild(newElement);
    }
	
}


function findNetAttchment(elem)
{
	var ref=elem.getAttribute('ref'); 
	var r=elem.getAttribute('node0');
	var a=strToBool(elem.getAttribute("used"));
	if(a) return;
	elem.setAttribute("used",true);
		 if(r!=-1)
		 {   
	         var n=parseInt(r);
			 var netElem=document.getElementById(n);
				 netElem.setAttribute('ref',ref);
				 findNetAttchment(netElem);
			  
		 }
		 
	var r=elem.getAttribute('node1');
		 if(r!=-1)
		 {   
	         var n=parseInt(r);
			 var netElem=document.getElementById(n);
				 netElem.setAttribute('ref',ref);
				 findNetAttchment(netElem);
		 }
		 
	var id=parseInt(elem.id);
	
	for(var i=0; i<drawing.maxIdNet; i++)
		if(id!=i)
	    {
		 var netElem=document.getElementById(i);
		 var r=netElem.getAttribute('node0');
		 if(r!=-1)
		 {
			 var n=parseInt(r);
			 if(n==id)
			  {
				netElem.setAttribute('ref',ref);
				findNetAttchment(netElem);
			  }
		 }
		 
		 var r=netElem.getAttribute('node1');
		 if(r!=-1)
		 { 
			 var n=parseInt(r);
			 if(n==id)
			  {
				netElem.setAttribute('ref',ref);
				findNetAttchment(netElem);
			  }
		 }
	    }		 
}

function getNetRef()
{
	   nets=document.getElementsByName('net');
	   var j=0;
	  
		for(var i=0; i<nets.length; i++)
			nets[i].setAttribute("used",false);
		
		for(var i=0; i<nets.length; i++)
		{
			var a=strToBool(nets[i].getAttribute("used"));
			if(!a)
			{
			 j=j+1; 
			 var node='N0'+j;
			 nets[i].setAttribute("ref",node);
			 findNetAttchment(nets[i]);
			 nets[i].style.stroke = "#000000";
			}
		}	
			
}

function modifiedNetRefColor()
{
    modifiedRefNetParent();
    modifiedColorNetParent(); 
    modifiedRefNetWithStdPart();
}

function  modifiedRefNetParent()
{
 nets=document.getElementsByName('net');
 for(var i=0; i<nets.length; i++)
    {
		var a=strToBool(nets[i].getAttribute("parent"));
        if(a){
			var r=nets[i].getAttribute("setref");
			var o=nets[i].getAttribute("ref"); 
			 for(var j=0; j<nets.length; j++)
			   if(r==nets[j].getAttribute("ref"))
			    {
				 nets[i].getAttribute("parent",false);
				 a=false;
				 break;
			    }
			 if(a)	  
			  for(var j=0; j<nets.length; j++)
			  if(o==nets[j].getAttribute("ref"))
			  {
				if(j!=i)
				nets[j].setAttribute("parent",false);
                nets[j].setAttribute("ref",r);				
			  }
		}
	}			
}


function  modifiedColorNetParent()
{
 nets=document.getElementsByName('net');
 for(var i=0; i<nets.length; i++)
    {
		var a=strToBool(nets[i].getAttribute("parentcolor"));
        if(a){
			var r=nets[i].getAttribute("setcolor");
			var o=nets[i].getAttribute("ref");   
			for(var j=0; j<nets.length; j++)
			  if(o==nets[j].getAttribute("ref"))
			  {
				if(j!=i)
				nets[j].setAttribute("parentcolor",false);
                nets[j].style.stroke =r;					
			  }
			  nets[i].style.stroke =r;
		}
	}			
}

function refSelectedColorNet(elem){
	var r=elem.getAttribute("setcolor");
	var o=elem.getAttribute("ref"); 
	
	nets=document.getElementsByName('net');
 for(var i=0; i<nets.length; i++)
    {
		if(o==nets[i].getAttribute("ref"))
			  {
				if(nets[i]!=elem)
				nets[i].setAttribute("parentcolor",false);
                nets[i].style.stroke =r;					
			  }
			 
	}
				
	
}


function modifiedRefNetWithStdPart()
{
 var parts=document.getElementsByName('part');
 var netIds=[];
 for(var i=0; i<parts.length;i++)
	 if(strToBool(parts[i].getAttribute('liblocale'))&& (parts[i].getAttribute('model')=='GND')){
        pins=getListPins(parts[i]);
		   for(var n=0; n<pins.length; n++){
			   if(pins[n].elem.childNodes[1].style.display=="none") 
                  netIds.push(pins[n].elem.getAttribute('netId'));  				   
			    } 
}
var nets=document.getElementsByName('net');

for(var i=0; i<netIds.length;i++){
	var net=document.getElementById(netIds[i])
	ref=net.getAttribute('ref');
	for(var j=0; j<nets.length;j++)
		if(nets[j].getAttribute('ref')==ref)
			nets[j].setAttribute('ref','0');
			
}
	
 
}

