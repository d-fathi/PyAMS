
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
    netLabelUpdate();
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

// thick wires and bigger junction dots for every bus net
function netBusUpdate()
{
	var layer = document.getElementById('nodes');
	var nets = document.querySelectorAll('[name="net"]');
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
	}
	if (!layer) return;
	var dots = layer.querySelectorAll('ellipse[name="cnode"]');
	for (var i = 0; i < dots.length; i++) {
		var net = document.getElementById(dots[i].getAttribute('netid'));
		var isBus = net && net.hasAttribute('bus');
		dots[i].setAttribute('rx', isBus ? 3.5 : 2);
		dots[i].setAttribute('ry', isBus ? 3.5 : 2);
	}
	busCheck();
}

// width of a pin / net name: bus width, or 1 for a normal name
function busWidth(name)
{
	var b = busParse(name);
	return b ? b.width : 1;
}

// width differs from the width of its wire is reported and shown with the
// green square of an unconnected pin. Standard parts (GND, ports, ...) are not checked.
function busCheck()
{
	var layer = document.getElementById('nodes');
	if (layer) {
		var old = layer.querySelectorAll('[name="buserr"]');
		for (var i = 0; i < old.length; i++) old[i].remove();
	}
	var errors = [];
	var parts = document.querySelectorAll('#sym [name="part"]');
	for (var i = 0; i < parts.length; i++) {
		var pins;
		try {
			var sym = JSON.parse(parts[i].firstChild.getAttribute('symbol'));
			if (sym && sym.device && sym.device.type == 'std') continue;
			pins = getListPins(parts[i]);
		} catch (e) { continue; }
		for (var n = 0; n < pins.length; n++) {
			var el = pins[n].elem;
			if (el.childNodes[1].style.display != 'none') continue;   // not connected
			var net = document.getElementById(el.getAttribute('netId'));
			if (!net) continue;
			var pinName = el.childNodes[2].textContent, ref = net.getAttribute('ref');
			var pw = busWidth(pinName), nw = busWidth(ref);
			if (pw == nw) continue;
			errors.push({ part: parts[i].getAttribute('sref'), pin: pinName, net: ref,
			              pinWidth: pw, netWidth: nw, x: pins[n].x, y: pins[n].y });
			if (layer) {
				// the green square of an unconnected pin, drawn over the pin
				var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				c.setAttribute('name', 'buserr');
				c.setAttribute('x', pins[n].x - 3); c.setAttribute('y', pins[n].y - 3);
				c.setAttribute('width', 6); c.setAttribute('height', 6);
				c.style.fill = 'none'; c.style.stroke = 'rgb(0, 255, 0)'; c.style.strokeWidth = '1px';
				var t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
				t.textContent = 'Bus width mismatch: pin ' + parts[i].getAttribute('sref') + '.' + pinName +
				                ' (' + pw + ') on net ' + ref + ' (' + nw + ')';
				c.appendChild(t);
				layer.appendChild(c);
			}
		}
	}
	if (typeof drawing != 'undefined') drawing.busErrors = errors;
	return errors;
}


//--------------------------------------------------------------
//  Net name label : a text linked to a wire that shows its name
//--------------------------------------------------------------
//  The label is an ordinary text (name="text", it has the font properties of
//  a text and can be dragged).  It is linked to ONE net of the wire (attribute
//  nlabel="<id>" on the net, netlabel="<id>" on the text).  The label keeps
//  the offset of its centre from the anchor of the net (the middle of the
//  net along its length): when the wire moves the label moves with it.  The
//  text is always the Reference of the wire, it is parallel to the nearest
//  segment (rotated 270 degrees beside a vertical segment) and takes the
//  colour of the wire unless the colour of the text was changed.

var NETLABEL_SIZE = '9px';

function netLabelNets()
{
	return Array.prototype.slice.call(document.querySelectorAll('#sym [name="net"]'));
}

function netLabelAll()
{
	return Array.prototype.slice.call(document.querySelectorAll('#sym [netlabel]'));
}

// point at half of the length of a net
function netLabelAnchor(net)
{
	var p = getArrayPoints(net), total = 0, k;
	for (k = 0; k + 1 < p.length; k++)
		total += Math.abs(p[k + 1].x - p[k].x) + Math.abs(p[k + 1].y - p[k].y);
	if (!p.length) return { x: 0, y: 0 };
	var half = total / 2, run = 0;
	for (k = 0; k + 1 < p.length; k++) {
		var len = Math.abs(p[k + 1].x - p[k].x) + Math.abs(p[k + 1].y - p[k].y);
		if (len > 0 && run + len >= half) {
			var t = (half - run) / len;
			return { x: p[k].x + (p[k + 1].x - p[k].x) * t, y: p[k].y + (p[k + 1].y - p[k].y) * t };
		}
		run += len;
	}
	return { x: p[0].x, y: p[0].y };
}

// true when the segment of the wire nearest to (x, y) is vertical
function netLabelNearVertical(ref, x, y)
{
	var nets = netLabelNets(), best = 1e12, vertical = false;
	for (var i = 0; i < nets.length; i++) {
		if (nets[i].getAttribute('ref') != ref) continue;
		var p = getArrayPoints(nets[i]);
		for (var k = 0; k + 1 < p.length; k++) {
			var a = p[k], b = p[k + 1];
			var dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
			var t = l2 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2)) : 0;
			var d = Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
			if (d < best) { best = d; vertical = (dx == 0 && dy != 0); }
		}
	}
	return vertical;
}

function netLabelCenter(t)
{
	var b = t.getBBox(), x = parseFloat(t.getAttribute('x')), y = parseFloat(t.getAttribute('y'));
	var r = parseInt(t.getAttribute('r')) || 0;
	if (r == 270) return { x: x - b.height / 4, y: y - b.width / 2 };
	if (r == 90) return { x: x + b.height / 4, y: y + b.width / 2 };
	return { x: x + b.width / 2, y: y - b.height / 4 };
}

// puts the text with its centre at (cx, cy), parallel to the wire
function netLabelPut(t, cx, cy, vertical)
{
	var b = t.getBBox(), r = vertical ? 270 : 0;
	var x = vertical ? cx + b.height / 4 : cx - b.width / 2;
	var y = vertical ? cy + b.width / 2 : cy + b.height / 4;
	x = Math.round(x); y = Math.round(y);
	t.setAttribute('r', r);
	t.setAttribute('x', x);
	t.setAttribute('y', y);
	t.setAttribute('transform', 'rotate(' + r + ' ' + x + ' ' + y + ')');
	['xo', 'yo', 'x1', 'y1', 'w', 'h', 'ro'].forEach(function (a) { t.removeAttribute(a); });
	return { x: x, y: y };
}

// text, colour, position and orientation of every label; removes the labels
// of wires that no longer exist
function netLabelUpdate()
{
	var labels = netLabelAll();
	if (!labels.length && !document.querySelector('#sym [name="net"][nlabel]')) return;
	var nets = netLabelNets(), usedRef = {}, usedId = {};
	for (var i = 0; i < labels.length; i++) {
		var t = labels[i], id = t.getAttribute('netlabel');
		var net = null;
		for (var k = 0; k < nets.length; k++)
			if (nets[k].getAttribute('nlabel') == id) { net = nets[k]; break; }
		if (!net) {                           // the linked net was merged or replaced: another net of the wire
			for (var k = 0; k < nets.length; k++)
				if (nets[k].getAttribute('ref') == t.getAttribute('nref') && !nets[k].hasAttribute('nlabel')) { net = nets[k]; break; }
			if (net) net.setAttribute('nlabel', id);
		}
		if (!net || usedRef[net.getAttribute('ref')]) {   // the wire was deleted / one label per wire
			t.remove();
			continue;
		}
		var ref = net.getAttribute('ref');
		usedRef[ref] = true; usedId[id] = true;
		t.setAttribute('nref', ref);
		t.textContent = ref;
		var color = net.style.stroke;
		if (!t.hasAttribute('lc') || t.style.fill == t.getAttribute('lc')) {   // not recoloured by hand
			t.style.fill = color;
			t.setAttribute('lc', t.style.fill);
		}
		var anchor = netLabelAnchor(net);
		var cdx = parseFloat(t.getAttribute('cdx')), cdy = parseFloat(t.getAttribute('cdy'));
		var px = parseFloat(t.getAttribute('px')), py = parseFloat(t.getAttribute('py'));
		var ax = parseFloat(t.getAttribute('ax')), ay = parseFloat(t.getAttribute('ay'));
		var x = parseFloat(t.getAttribute('x')), y = parseFloat(t.getAttribute('y'));
		if (isNaN(cdx) || isNaN(px)) {                   // no stored placement
			var c = netLabelCenter(t);
			cdx = c.x - anchor.x; cdy = c.y - anchor.y;
		} else if (Math.abs(x - px) > 0.5 || Math.abs(y - py) > 0.5) {
			// the text was moved: new offset = old + its own move - the move of the anchor
			cdx += (x - px) - (anchor.x - ax);
			cdy += (y - py) - (anchor.y - ay);
		}
		var cx = anchor.x + cdx, cy = anchor.y + cdy;
		var pos = netLabelPut(t, cx, cy, netLabelNearVertical(ref, cx, cy));
		t.setAttribute('cdx', cdx); t.setAttribute('cdy', cdy);
		t.setAttribute('px', pos.x); t.setAttribute('py', pos.y);
		t.setAttribute('ax', anchor.x); t.setAttribute('ay', anchor.y);
	}
	// attributes of nets without label, and a second net of the same wire / id
	var seen = {};
	for (var k = 0; k < nets.length; k++) {
		var id = nets[k].getAttribute('nlabel');
		if (id === null) continue;
		if (!usedId[id] || seen[id]) nets[k].removeAttribute('nlabel');
		else seen[id] = true;
	}
}

// does the wire (all nets of this reference) show its name?
function netLabelShown(net)
{
	var ref = net.getAttribute('ref'), nets = netLabelNets();
	for (var i = 0; i < nets.length; i++)
		if (nets[i].getAttribute('ref') == ref && nets[i].hasAttribute('nlabel')) return true;
	return false;
}

// "Show name" of the properties panel
function netLabelSet(net, show)
{
	var ref = net.getAttribute('ref'), nets = netLabelNets(), i;
	if (show == netLabelShown(net)) return;
	if (!show) {
		for (i = 0; i < nets.length; i++)
			if (nets[i].getAttribute('ref') == ref && nets[i].hasAttribute('nlabel')) {
				var id = nets[i].getAttribute('nlabel');
				nets[i].removeAttribute('nlabel');
				netLabelAll().forEach(function (t) { if (t.getAttribute('netlabel') == id) t.remove(); });
			}
		return;
	}
	var n = 1;
	while (document.querySelector('#sym [netlabel="nl' + n + '"], #sym [nlabel="nl' + n + '"]')) n++;
	var id = 'nl' + n;
	net.setAttribute('nlabel', id);
	var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	t.setAttribute('class', 'draggable');
	t.setAttribute('name', 'text');
	t.setAttribute('netlabel', id);
	t.setAttribute('nref', ref);
	t.setAttribute('x', 0); t.setAttribute('y', 0);
	t.setAttribute('r', 0); t.setAttribute('rtemp', 0);
	t.style.fontSize = NETLABEL_SIZE;
	t.style.fontFamily = 'Arial';
	t.style.fontWeight = 'normal';
	t.style.fontStyle = 'normal';
	t.textContent = ref;
	document.getElementById('sym').appendChild(t);
	// first place: beside the anchor (above a horizontal wire, left of a vertical one)
	var anchor = netLabelAnchor(net), b = t.getBBox();
	var p = getArrayPoints(net), vertical = false, best = 1e12;
	for (var k = 0; k + 1 < p.length; k++) {
		var l = Math.abs(p[k + 1].x - p[k].x) + Math.abs(p[k + 1].y - p[k].y);
		var mid = Math.hypot((p[k].x + p[k + 1].x) / 2 - anchor.x, (p[k].y + p[k + 1].y) / 2 - anchor.y);
		if (l > 0 && mid < best) { best = mid; vertical = (p[k].x == p[k + 1].x); }
	}
	var gap = b.height / 2 + 2;
	var cdx = vertical ? -gap : 0, cdy = vertical ? 0 : -gap;
	var pos = netLabelPut(t, anchor.x + cdx, anchor.y + cdy, vertical);
	t.setAttribute('cdx', cdx); t.setAttribute('cdy', cdy);
	t.setAttribute('px', pos.x); t.setAttribute('py', pos.y);
	t.setAttribute('ax', anchor.x); t.setAttribute('ay', anchor.y);
	netLabelUpdate();
}
