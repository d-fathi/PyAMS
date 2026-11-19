
/*
#-------------------------------------------------------------------------------
# Name:        cnode.js  node connection and reference for net(wire)
# Author:      d.fathi
# Created:     27/08/2021
# Updated:     05/08/2026
# Copyright:  (c) PyAMS 2026
# Licence:    free
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


// ---- junction dots follow the z-order of the drawing ------------------------------------------
// The dots live in their own layer above #sym. A dot must be hidden when a filled shape that is
// drawn above its wire (later in #sym) covers it, like the wire itself is covered.

function nodeFilledAt(el, x, y) {
	// true when (x,y) (drawing coordinates) is strictly inside the filled area of the geometry element `el`
	if (typeof el.isPointInFill !== 'function') return false;
	var cs = window.getComputedStyle(el);
	var fill = cs.fill;
	if (!fill || fill === 'none' || fill === 'transparent' || /^rgba\(.*,\s*0\)$/.test(fill)) return false;
	if (parseFloat(cs.fillOpacity) === 0 || parseFloat(cs.opacity) === 0 || cs.display === 'none' || cs.visibility === 'hidden') return false;
	var root = document.getElementById('svg');
	var a = root && root.getScreenCTM(), b = el.getScreenCTM();
	if (!a || !b) return false;
	var inv = b.inverse().multiply(a);               // drawing space -> local space of the element
	var d = 1.5;                                     // strictly inside: a dot on the border of a shape stays visible
	var pts = [[x, y], [x + d, y], [x - d, y], [x, y + d], [x, y - d]];
	for (var i = 0; i < pts.length; i++) {
		var q = new DOMPoint(pts[i][0], pts[i][1]).matrixTransform(inv);
		if (!el.isPointInFill(q)) return false;
	}
	return true;
}

function nodeCoveredBy(el, x, y) {
	if (el.nodeType !== 1) return false;
	var name = el.getAttribute('name');
	if (name === 'net' || name === 'cnode') return false;
	var tag = el.tagName.toLowerCase();
	if (tag === 'g') {
		var kids = el.children;
		for (var i = 0; i < kids.length; i++) if (nodeCoveredBy(kids[i], x, y)) return true;
		return false;
	}
	if (tag === 'text' || tag === 'image' || tag === 'foreignobject' || tag === 'polyline' || tag === 'line') return false;
	return nodeFilledAt(el, x, y);
}

function updateNodesVisibility() {
	var layer = document.getElementById('nodes');
	if (!layer) return;
	var dots = layer.children;
	for (var i = 0; i < dots.length; i++) {
		var dot = dots[i];
		var net = document.getElementById(dot.getAttribute('netid'));
		var hidden = false;
		if (net) {
			var x = parseFloat(dot.getAttribute('cx')), y = parseFloat(dot.getAttribute('cy'));
			for (var s = net.nextElementSibling; s && !hidden; s = s.nextElementSibling) {
				try { hidden = nodeCoveredBy(s, x, y); } catch (e) { hidden = false; }
			}
		}
		dot.style.display = hidden ? 'none' : '';
	}
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
			rect.push({x:p[0].x,y:p[0].y,id:i});
		 }
		
		
		 netElem.setAttribute('node0',r);
		 
		 var r=itConnectNetByNode(p[l].x,p[l].y,i);
         if(r!=-1)
		 {
			rect.push({x:p[l].x,y:p[l].y,id:i});
		 }

		 netElem.setAttribute('node1',r);
		 v=netElem.getAttribute('node1');
        			
	}
	
	
	var r = 2; // / self.zoom;
    for (var i = 0; i < rect.length; i++) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse');
        newElement.style.stroke = "#630811";
        newElement.style.fill = "#630811";
        newElement.style.strokeWidth = "1px";
        newElement.setAttribute("cx", rect[i].x);
        newElement.setAttribute("cy", rect[i].y);
        newElement.setAttribute("rx", r);
        newElement.setAttribute("ry", r);
		newElement.setAttribute("id", 'node'+i);
		newElement.setAttribute("name",'cnode');
		newElement.setAttribute("netid",rect[i].id);
        svg.appendChild(newElement);
    }
	nodesUpdateColor();
	updateNodesVisibility();   // hide the dots covered by a shape that is above their wire
}


// The junction dots take the colour of the wire they belong to.
function nodesUpdateColor()
{
	var dots=document.querySelectorAll('#nodes ellipse');
	for(var i=0; i<dots.length; i++)
	{
		var net=document.getElementById(dots[i].getAttribute('netid'));
		if(!net || net.getAttribute("name")!='net') continue;
		var c=net.style.stroke;
		if(c)
		{
			dots[i].style.stroke=c;
			dots[i].style.fill=c;
		}
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
	   nets=document.querySelectorAll('[name="net"]');
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
			}
		}	
			
}

function modifiedNetRefColor()
{
    modifiedRefNetParent();
    modifiedColorNetParent(); 
    modifiedRefNetWithStdPart();
    nodesUpdateColor();
    netBusUpdate();
}

function  modifiedRefNetParent()
{
 nets=document.querySelectorAll('[name="net"]');
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
 nets=document.querySelectorAll('[name="net"]');
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
	
	nets=document.querySelectorAll('[name="net"]');
 for(var i=0; i<nets.length; i++)
    {
		if(o==nets[i].getAttribute("ref"))
			  {
				if(nets[i]!=elem)
				nets[i].setAttribute("parentcolor",false);
                nets[i].style.stroke =r;					
			  }
			 
	}
	nodesUpdateColor();
}


function modifiedRefNetWithStdPart()
{

// Update Nets with GND references
 var parts=document.getElementsByClassName('part');
 var netIds=[];
 for(var i=0; i<parts.length;i++){
     var sym =JSON.parse(parts[i].firstChild.getAttribute("symbol"));
	 if((sym.device.type=='std') && sym.name=='GND'){
		
        pins=getListPins(parts[i]);
		   for(var n=0; n<pins.length; n++){
			   if(pins[n].elem.childNodes[1].style.display=="none") 
                  netIds.push(pins[n].elem.getAttribute('netId'));  				   
			    } 
			}
}
var nets=document.querySelectorAll('[name="net"]');

for(var i=0; i<netIds.length;i++){
	var net=document.getElementById(netIds[i])
	ref=net.getAttribute('ref');
	for(var j=0; j<nets.length;j++)
		if(nets[j].getAttribute('ref')==ref)
			nets[j].setAttribute('ref','0');
			
}

// Update Nets with Port references
 /*var ports=[];
for(var i=0; i<parts.length;i++)
	 if((parts[i].getAttribute('directory')=='standard') && parts[i].getAttribute('model')=='Port'){
        pins=getListPins(parts[i]);
		   for(var n=0; n<pins.length; n++){
			   if(pins[n].elem.childNodes[1].style.display=="none") 
                  ports.push({id:pins[n].elem.getAttribute('netId'),name:parts[i].getAttribute("sref")});  				   
			    } 
 }

 
 for(var i=0; i<ports.length;i++){
	var net=document.getElementById(ports[i].id);
	ref=net.getAttribute('ref');
	for(var j=0; j<nets.length;j++)
		if(nets[j].getAttribute('ref')==ref)
			nets[j].setAttribute('ref',ports[i].name);
			
}*/

// Update Nets with VBar references
 var vbars=[];
 for(var i=0; i<parts.length;i++){
     var sym =JSON.parse(parts[i].firstChild.getAttribute("symbol"));
	 	if((sym.device.type=='std') &&  ((sym.name=='VBar')||(sym.name=='Port'))){
           pins=getListPins(parts[i]);
		   for(var n=0; n<pins.length; n++){
			   if(pins[n].elem.childNodes[1].style.display=="none") 
                  vbars.push({id:pins[n].elem.getAttribute('netId'),name:parts[i].getAttribute("sref")});  				   
			    } 
			}
 }

 
 for(var i=0; i<vbars.length;i++){
	var net=document.getElementById(vbars[i].id);
	ref=net.getAttribute('ref');
	for(var j=0; j<nets.length;j++)
		if(nets[j].getAttribute('ref')==ref)
			nets[j].setAttribute('ref',vbars[i].name);
			
 }


}



//--------------------------------------------------------------
//  Bus (data) : a reference such as D[0:7] means 8 lines D0..D7
//--------------------------------------------------------------
var BUS_STROKE = 3;   // stroke width (px) of a bus wire / bus pin

// returns {base, from, to, width} for "D[0:7]", otherwise null (normal net)
function busParse(name)
{
	if (name === null || name === undefined) return null;
	var m = /^\s*([A-Za-z_]\w*)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]\s*$/.exec(String(name));
	if (!m) return null;
	var a = parseInt(m[2], 10), b = parseInt(m[3], 10);
	var w = Math.abs(a - b) + 1;
	if (w < 2) return null;
	return { base: m[1], from: a, to: b, width: w };
}

// thick wires, bigger junction dots and a width label for every bus net
function netBusUpdate()
{
	var layer = document.getElementById('nodes');
	var nets = document.querySelectorAll('[name="net"]');
	var best = {};   // ref -> longest segment {len, x, y}
	for (var i = 0; i < nets.length; i++) {
		var n = nets[i];
		var bus = busParse(n.getAttribute('ref'));
		if (!bus) {
			if (n.hasAttribute('bus')) {
				n.removeAttribute('bus');
				n.style.strokeWidth = '1px';
			}
			continue;
		}
		n.setAttribute('bus', bus.width);
		n.style.strokeWidth = BUS_STROKE + 'px';
		var p = getArrayPoints(n), ref = n.getAttribute('ref');
		for (var k = 0; k + 1 < p.length; k++) {
			var len = Math.abs(p[k].x - p[k + 1].x) + Math.abs(p[k].y - p[k + 1].y);
			if (!best[ref] || len > best[ref].len)
				best[ref] = { len: len, w: bus.width, x: (p[k].x + p[k + 1].x) / 2, y: (p[k].y + p[k + 1].y) / 2,
				              horiz: p[k].y == p[k + 1].y, color: n.style.stroke };
		}
	}
	if (!layer) return;
	var dots = layer.querySelectorAll('ellipse');
	for (var i = 0; i < dots.length; i++) {
		var net = document.getElementById(dots[i].getAttribute('netid'));
		var isBus = net && net.hasAttribute('bus');
		dots[i].setAttribute('rx', isBus ? 3.5 : 2);
		dots[i].setAttribute('ry', isBus ? 3.5 : 2);
	}
	var old = layer.querySelectorAll('[name="buslabel"]');
	for (var i = 0; i < old.length; i++) old[i].remove();
	for (var ref in best) {
		var b = best[ref];
		var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		t.setAttribute('name', 'buslabel');
		t.setAttribute('x', b.x + (b.horiz ? -3 : 4));
		t.setAttribute('y', b.y + (b.horiz ? -4 : 3));
		t.style.fontSize = '7px';
		t.style.fontFamily = 'Arial';
		t.style.fill = b.color || '#000';
		t.style.pointerEvents = 'none';
		t.textContent = b.w;
		layer.appendChild(t);
	}
}
