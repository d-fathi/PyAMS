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

		if(!self.setElement.getAttribute("diagonal"))
			 self.setElement.setAttribute("diagonal",'false');

		var diagonal=self.setElement.getAttribute("diagonal")=='true';

	var i=self.pos;
    var p=self.points;
	var l=self.points.length-1;

	for(var j=0; j<=l; j++)
	{
	  self.points[j].x= 5*Math.round(self.points[j].x/5);
	  self.points[j].y= 5*Math.round(self.points[j].y/5);
	}

    self.ellps[i].x=self.points[i].x;
    self.ellps[i].y=self.points[i].y;

	function moveEllpsToNewPos(n){
	       self.ellps[n].x=self.points[n].x;
           self.ellps[n].y=self.points[n].y;
		   self.moveElement(self.ellps[n]);
	}


  if(diagonal) return;

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
	if(elem.getAttribute("name")!='net')
		return;
	var p=getArrayPoints(elem);
	var n=pointInPolylineGetPos(p, self.offset);
	if(n==-1)
		return;
	if(p[n].x==p[n+1].x)
		self.typedX=true;
	else
		self.typedX=false;
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


function netSamePositionPoint()
{
	var collection = document.getElementById("sym").children;
	for (var i=0; i<collection.length; i++)
		if(collection[i].getAttribute("name")=='net')
	    {
		   var elem=collection[i];
		   var p=getArrayPoints(elem);
		   var k=p.length-1;
		   var changed=false;

		   // duplicate point inside the wire (zero-length segment)
		   for(var j=k-1; j>=1; j--)
			   if((p[j].x==p[j-1].x)&&(p[j].y==p[j-1].y))
			   {
				p.splice(j,1);
				changed=true;
			   }

		   k=p.length-1;
		   if(k>2)
			   if((p[k].x==p[k-1].x)&&(p[k].y==p[k-1].y))
			   {
				p.pop();
				changed=true;
			   }

		   if(changed)
			   elem.setAttribute("points",polylineToAttribute(p, 0, 0));
	    }
}

// Two wires that meet end to end (and nothing else is connected at that point:
// no pin, no third wire, no T-junction) are one wire: join them into a single
// polyline.  Returns true when something was merged.
function netMergeEndToEnd()
{
	if(drawing.shapes && drawing.shapes.design && drawing.shapes.design.start) return false;
	var sym=document.getElementById("sym");
	var parts=[], nets=[];
	for(var i=0; i<sym.children.length; i++)
	{
		var nm=sym.children[i].getAttribute("name");
		if(nm=='net') nets.push(sym.children[i]);
		else if(nm=='part') parts.push(sym.children[i]);
	}
	if(nets.length<2) return false;

	var pinAt={};
	for(var i=0; i<parts.length; i++)
	{
		var pl=getListPins(parts[i]);
		for(var j=0; j<pl.length; j++) pinAt[pl[j].x+','+pl[j].y]=true;
	}

	var pts=nets.map(function(e){return getArrayPoints(e);});
	function onSeg(p,q,x,y){
		if(p.x==q.x && p.x==x && y>=Math.min(p.y,q.y) && y<=Math.max(p.y,q.y)) return true;
		if(p.y==q.y && p.y==y && x>=Math.min(p.x,q.x) && x<=Math.max(p.x,q.x)) return true;
		return false;
	}

	for(var a=0; a<nets.length; a++)
	{
		var pa=pts[a];
		for(var ea=0; ea<2; ea++)
		{
			var qa=ea==0?pa[0]:pa[pa.length-1];
			if(pinAt[qa.x+','+qa.y]) continue;
			// everything that touches this point
			var touch=[];
			for(var b=0; b<nets.length; b++)
			{
				if(b==a) continue;
				var pb=pts[b], hit=false, endB=-1;
				for(var k=0; k<pb.length-1 && !hit; k++)
					if(onSeg(pb[k],pb[k+1],qa.x,qa.y)) hit=true;
				if(hit)
				{
					if(pb[0].x==qa.x && pb[0].y==qa.y) endB=0;
					else if(pb[pb.length-1].x==qa.x && pb[pb.length-1].y==qa.y) endB=1;
					touch.push({b:b,endB:endB});
				}
			}
			// the other end of the same wire must not be on this point either
			if(touch.length!=1 || touch[0].endB==-1) continue;
			var b=touch[0].b, pb=pts[b];
			if(pb.length<2) continue;

			var A=pa.map(function(q){return {x:q.x,y:q.y};});
			var B=pb.map(function(q){return {x:q.x,y:q.y};});
			if(ea==0) A.reverse();                 // A ends at the joint
			if(touch[0].endB==1) B.reverse();      // B starts at the joint
			var m=netSimplifyPoints(A.concat(B.slice(1)));
			if(m[0].x==m[m.length-1].x && m[0].y==m[m.length-1].y) continue;   // closed loop

			// keep the wire that carries a net name (parent), otherwise the first one
			var keep=nets[a], drop=nets[b];
			if(strToBool(nets[b].getAttribute("parent")) && !strToBool(nets[a].getAttribute("parent")))
			{ keep=nets[b]; drop=nets[a]; }
			keep.setAttribute("points",polylineToAttribute(m, 0, 0));
			keep.setAttribute("xdir",(m[0].x==m[1].x)?'true':'false');
			if(drawing.resize && (drawing.resize.setElement==drop || drawing.resize.setElement==keep))
				try{ drawing.resize.deletEllipse(); }catch(e){}
			drop.parentNode.removeChild(drop);
			return true;
		}
	}
	return false;
}


// A wire that starts (or ends) on the side of another wire and first runs along
// it (the two wires overlap) shows its junction dot at the end of the wire, far
// from the place where the branch really leaves the other wire.  The branch is
// shortened so that it begins where the overlap ends:
//   - when the branch leaves the host wire by turning, at that turn;
//   - when it runs past the end of the host segment, at that end.
// Pins and third wires at the old end, or wires ending on the removed part,
// are never touched.  Returns true when something was changed.
function netTrimOverlap()
{
	if(drawing.shapes && drawing.shapes.design && drawing.shapes.design.start) return false;
	var sym=document.getElementById("sym");
	var parts=[], nets=[];
	for(var i=0; i<sym.children.length; i++)
	{
		var nm=sym.children[i].getAttribute("name");
		if(nm=='net') nets.push(sym.children[i]);
		else if(nm=='part') parts.push(sym.children[i]);
	}
	if(nets.length<2) return false;

	var pinAt={};
	for(var i=0; i<parts.length; i++)
	{
		var pl=getListPins(parts[i]);
		for(var j=0; j<pl.length; j++) pinAt[pl[j].x+','+pl[j].y]=true;
	}
	var pts=nets.map(function(e){return getArrayPoints(e);});

	function onSeg(p,q,x,y){
		if(p.x==q.x && p.x==x && y>=Math.min(p.y,q.y) && y<=Math.max(p.y,q.y)) return true;
		if(p.y==q.y && p.y==y && x>=Math.min(p.x,q.x) && x<=Math.max(p.x,q.x)) return true;
		return false;
	}

	for(var a=0; a<nets.length; a++)
	{
		if(nets[a].getAttribute("diagonal")=='true') continue;
		var pa=pts[a];
		if(pa.length<3) continue;                     // keep at least two points
		for(var ea=0; ea<2; ea++)
		{
			var n=pa.length;
			var E=ea==0?pa[0]:pa[n-1];
			var F=ea==0?pa[1]:pa[n-2];
			if(pinAt[E.x+','+E.y]) continue;

			var vert=(E.x==F.x);
			if(!vert && E.y!=F.y) continue;

			// the nets that touch the end E
			var touch=[];
			for(var b=0; b<nets.length; b++)
			{
				if(b==a) continue;
				var pb=pts[b];
				for(var k=0; k<pb.length-1; k++)
					if(onSeg(pb[k],pb[k+1],E.x,E.y)) { touch.push(b); break; }
			}
			if(touch.length!=1) continue;
			var b=touch[0], pb=pts[b];

			// a segment of the host that contains E and lies on the same line as E-F
			var newE=null;
			for(var k=0; k<pb.length-1 && !newE; k++)
			{
				var S0=pb[k], S1=pb[k+1];
				if(!onSeg(S0,S1,E.x,E.y)) continue;
				if(vert && !(S0.x==S1.x && S0.x==E.x)) continue;
				if(!vert && !(S0.y==S1.y && S0.y==E.y)) continue;
				var lo=vert?Math.min(S0.y,S1.y):Math.min(S0.x,S1.x);
				var hi=vert?Math.max(S0.y,S1.y):Math.max(S0.x,S1.x);
				var e=vert?E.y:E.x, f=vert?F.y:F.x, dir=f>e?1:-1;
				// the host must extend from E in the direction of F
				if(dir>0 && !(hi>e)) continue;
				if(dir<0 && !(lo<e)) continue;
				var lim=dir>0?hi:lo;                  // far end of the host segment
				var t=dir>0?Math.min(f,lim):Math.max(f,lim);
				newE=vert?{x:E.x,y:t}:{x:t,y:E.y};
			}
			if(!newE) continue;

			// nothing else may end on the part that is removed (E .. newE)
			var blocked=false;
			for(var z=0; z<nets.length && !blocked; z++)
			{
				if(z==a || z==b) continue;
				var pz=pts[z];
				var ends=[pz[0],pz[pz.length-1]];
				for(var q=0; q<2; q++)
					if(onSeg(E,newE,ends[q].x,ends[q].y)) blocked=true;
			}
			if(blocked) continue;
			if(pinAt[newE.x+','+newE.y] && (newE.x!=F.x || newE.y!=F.y)) { /* a pin on the host: fine */ }

			var np=pa.map(function(q){return {x:q.x,y:q.y};});
			if(ea==0) np[0]=newE; else np[n-1]=newE;
			np=netSimplifyPoints(np);
			if(np.length<2) continue;
			if(np.length==2 && np[0].x==np[1].x && np[0].y==np[1].y) continue;
			nets[a].setAttribute("points",polylineToAttribute(np, 0, 0));
			nets[a].setAttribute("xdir",(np[0].x==np[1].x)?'true':'false');
			if(drawing.resize && drawing.resize.setElement==nets[a])
				try{ drawing.resize.deletEllipse(); }catch(e){}
			return true;
		}
	}
	return false;
}


function refNetWithPart()
{
	var netId=0;
	var partsDesc=[];

	var guard=0;
	while((netTrimOverlap() || netMergeEndToEnd()) && guard++<200) {}
	netSamePositionPoint();

	var collection = document.getElementById("sym").children;
	for (var i=0; i<collection.length; i++)
	{
		if(collection[i].getAttribute("name")=='net')
		{
		 collection[i].setAttribute("id",netId);
		 netId++;
		} else if((collection[i].getAttribute("name")=='part'))
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



//********************************************************************************//

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


// Remove duplicate points and points lying on a straight line between their
// neighbours (the first and the last point are never removed).
function netSimplifyPoints(p)
{
	var r=[p[0]];
	for(var i=1; i<p.length; i++)
		if(p[i].x!=r[r.length-1].x || p[i].y!=r[r.length-1].y)
			r.push(p[i]);
	if(r.length==1) r.push({x:p[p.length-1].x,y:p[p.length-1].y});

	var out=[r[0]];
	for(var i=1; i<r.length-1; i++)
	{
		var a=out[out.length-1], c=r[i+1];
		if((a.x==r[i].x && r[i].x==c.x) || (a.y==r[i].y && r[i].y==c.y))
			continue;
		out.push(r[i]);
	}
	out.push(r[r.length-1]);
	return out;
}


// Move one end of a net (wire) to a new position q while the other end stays
// where it is (it is connected to a pin or to another net).  When the wire is
// no longer straight, a bend is added so that every segment stays horizontal
// or vertical:  a straight wire becomes a Z (4 points, the middle segment
// is placed halfway), a wire that already has bends only moves its
// neighbouring point.
//   points : points of the net, atStart : the moved end is points[0]
//   q      : new position of the moved end, pinVert : the pin leaves vertically
function netRouteMovedEnd(points,atStart,q,pinVert)
{
	var r=[];
	for(var i=0; i<points.length; i++)
		r.push({x:points[i].x,y:points[i].y});
	r=netSimplifyPoints(r);                     // no duplicate or collinear points
	if(!atStart) r.reverse();                   // the moved end is r[0]

	var n=r.length;
	var vertical=(r[0].x==r[1].x);              // orientation of the first segment
	if(r[0].x==r[1].x && r[0].y==r[1].y) vertical=pinVert;
	var f=r[n-1];

	if(n==2)
	{
		if(q.x==f.x || q.y==f.y)
			r=[{x:q.x,y:q.y},{x:f.x,y:f.y}];
		else if(vertical)
		{
			var my=5*Math.round((q.y+f.y)/10);
			r=[{x:q.x,y:q.y},{x:q.x,y:my},{x:f.x,y:my},{x:f.x,y:f.y}];
		}
		else
		{
			var mx=5*Math.round((q.x+f.x)/10);
			r=[{x:q.x,y:q.y},{x:mx,y:q.y},{x:mx,y:f.y},{x:f.x,y:f.y}];
		}
	}
	else
	{
		// a Z (both end segments go the same way) or a U (they go back the way
		// they came): only a Z is centred again, a U keeps its middle segment
		var isZ=false;
		if(n==4)
		{
			var d1=vertical?(r[1].y-r[0].y):(r[1].x-r[0].x);
			var d3=vertical?(r[3].y-r[2].y):(r[3].x-r[2].x);
			isZ=(d1!=0 && d3!=0 && (d1>0)==(d3>0));
		}

		r[0].x=q.x; r[0].y=q.y;
		if(vertical) r[1].x=q.x; else r[1].y=q.y;

		// Z with the middle segment outside the two ends: centre it again
		if(isZ)
		{
			var zv=(r[0].x==r[1].x);
			if(zv && r[1].y==r[2].y)
			{
				var lo=Math.min(q.y,f.y), hi=Math.max(q.y,f.y);
				if(r[1].y<lo || r[1].y>hi) r[1].y=r[2].y=5*Math.round((q.y+f.y)/10);
			}
			else if(!zv && r[1].x==r[2].x)
			{
				var lo=Math.min(q.x,f.x), hi=Math.max(q.x,f.x);
				if(r[1].x<lo || r[1].x>hi) r[1].x=r[2].x=5*Math.round((q.x+f.x)/10);
			}
		}
	}

	r=netSimplifyPoints(r);
	if(!atStart) r.reverse();
	return r;
}


// Before a wire is edited (its points are dragged): remove duplicate and
// collinear points, so that the segments strictly alternate horizontal /
// vertical and moving a point can never leave a diagonal segment.
function netSimplifyForEdit(self)
{
	var el=self.setElement;
	if(el.getAttribute("name")!='net' || el.getAttribute("diagonal")=='true') return;
	var s=netSimplifyPoints(self.points);
	if(s.length!=self.points.length)
	{
		self.points=s;
		el.setAttribute("points",polylineToAttribute(s, 0, 0));
		el.setAttribute("xdir",(s[0].x==s[1].x)?'true':'false');
	}
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
			var atStart=(netIdPos==0);
			var q={x:parseInt(pins[i].x),y:parseInt(pins[i].y)};

			if(elemNet.getAttribute("diagonal")=='true')
			{
				// a wire drawn with diagonal segments: only its end follows the pin
				var e=atStart?0:points.length-1;
				points[e].x=q.x; points[e].y=q.y;
			}
			else
			{
				points=netRouteMovedEnd(points,atStart,q,pins[i].typeXDir);

				// keep the type of the first segment (used when the wire is edited)
				elemNet.setAttribute("xdir",(points[0].x==points[1].x)?'true':'false');
			}
			elemNet.setAttribute("points", polylineToAttribute(points, 0, 0));
			if(!atStart)
				pins[i].elem.setAttribute('netIdPos',points.length-1);
		}
}


function getNetRefs()
{
	var n=[];
		var s = document.querySelectorAll('[name="net"]');
		for (var j = 0; j < s.length; j++) {
			a=s[j].getAttribute("ref");
			if((a!='0') && (!n.includes(a))){
			n.push(a);

			}
		}
		return n
}
