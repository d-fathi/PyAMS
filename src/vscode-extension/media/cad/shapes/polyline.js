/*
#-------------------------------------------------------------------------------
# Name:        polyline.js
# Author:      d.fathi
# Created:     13/06/2021
# Update:      30/07/2026
# Copyright:   (c) PyAMS 2026
# Licence:     free
#-------------------------------------------------------------------------------
 */





/**
 * Find the closest point on a polyline to a given point
 * Returns: { distance: number, point: {x,y}, segmentIndex: number }
 */
function getClosestPointOnPolyline(points, p) {
    var minDist = Infinity;
    var closestPt = null;
    var segIdx = -1;

    for (var i = 0; i < points.length - 1; i++) {
        var proj = getProjectionOnSegment(p, points[i], points[i + 1]);
        var dx = p.x - proj.x;
        var dy = p.y - proj.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDist) {
            minDist = dist;
            closestPt = proj;
            segIdx = i;
        }
    }

    return {
        distance: minDist,
        point: closestPt,
        segmentIndex: segIdx
    };
}

/**
 * Find the closest point on a line segment from a given point
 * including the perpendicular projection or the nearest endpoint
 */
function getProjectionOnSegment(p, a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    
    // If the segment is a point, return that point
    if (dx === 0 && dy === 0) {
        return { x: a.x, y: a.y };
    }
    
    // Calculate the projection factor t of point p onto the line defined by a and b
    var t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
    
    // Restrict t to the interval [0, 1] to stay within the line segment
    t = Math.max(0, Math.min(1, t));
    
    return {
        x: a.x + t * dx,
        y: a.y + t * dy
    };
}
 

function polylineToAttribute(points, dx, dy) {
    var s = '';
    for (var i = 0; i < points.length; i++) {
        var nx = points[i].x + dx;
        var ny = points[i].y + dy;
        s = s + nx + ',' + ny + ' ';
    }
	
    return s;
}




function pointInPolylineGetPos(points, p) {
    for (var i = 0; i < points.length - 1; i++) {
        if (Math.abs(points[i].x-points[i + 1].x)>15) {
            var a = (points[i].y - points[i + 1].y) / (points[i].x - points[i + 1].x);
            var b = points[i].y - a * points[i].x;
            if ((p.x >= Math.min(points[i].x, points[i + 1].x)-2) && (p.x <= Math.max(points[i].x, points[i + 1].x)+2)) {
                if ((p.y >= Math.min(points[i].y, points[i + 1].y)-2) && (p.y <= Math.max(points[i].y, points[i + 1].y)+2))
                    if (Math.abs((a * p.x + b) - p.y) <= 2)
                        return i;

            }
        }
		else {
            if ((p.x >= points[i].x-2) && (p.x <= points[i].x+2)) {
                if ((p.y >= Math.min(points[i].y, points[i + 1].y)-2) && (p.y <= Math.max(points[i].y, points[i + 1].y)+2))
                        return i;
            }
        }

    }
    return -1;
}


function pointInPolylineDelet(p1,p2, p) {
        if (Math.abs(p1.x-p2.x)>0) {
            var a = (p1.y - p2.y) / (p1.x - p2.x);
            var b = p1.y - a * p1.x;
            if ((p.x >= Math.min(p1.x, p2.x)) && (p.x <= Math.max(p1.x, p2.x))) {
                if ((p.y >= Math.min(p1.y, p2.y)) && (p.y <= Math.max(p1.y, p2.y)))
                    if (Math.abs((a * p.x + b) - p.y) == 0)
                        return true;

            }
        }
		else {
            if (p.x == p1.x) {
                if ((p.y >= Math.min(p1.y, p2.y)) && (p.y <= Math.max(p1.y, p2.y)))
                        return true;
            }
        }

    
    return false;
}

//******************************************Add or  rmove line from polyline************************************************
function colorSelect(self)
{
	   
	for(var i=0; i<self.length-1;i++)
	{
		var id=self.ellps[i].id ;
		document.getElementById(id).style.stroke = "#1100ff";
		document.getElementById(id).style.fill = "#1100ff";
	}
	
		var id=self.ellps[self.length-1].id ;
		document.getElementById(id).style.stroke = "#ff00ff";
		document.getElementById(id).style.fill = "#ff00ff";
		
		 
}
function getPosToAddlineInPolyline(self)
{
	if(self.setElement.getAttribute("name") == 'net') return;
	
	if(self.pos > 0) 
	{
		var x=Math.abs(self.points[self.pos].x+self.points[self.pos-1].x)/2;
		var y=Math.abs(self.points[self.pos].y+self.points[self.pos-1].y)/2;
		self.ellps[self.length-1].x=x;
		self.ellps[self.length-1].y=y;
		self.ellps[self.length-1].setPos=self.pos;
		self.moveElement(self.ellps[self.length-1]);
	} else
	{
		var x=Math.abs(self.points[self.pos].x+self.points[self.pos+1].x)/2;
		var y=Math.abs(self.points[self.pos].y+self.points[self.pos+1].y)/2;
		self.ellps[self.length-1].x=x;
		self.ellps[self.length-1].y=y;
		self.ellps[self.length-1].setPos=self.pos+1;
		self.moveElement(self.ellps[self.length-1]);
	}
	 colorSelect(self);
}


function addLineInPolyline(self)
{
	self.points=[];
       for (var i=0; i<self.length-1; i++)
		   self.points.push({
                    x: self.ellps[i].x,
                    y: self.ellps[i].y
                });
				
	self.points.splice(self.ellps[self.pos].setPos, 0, {x:self.ellps[self.pos].x,y:self.ellps[self.pos].y});
	pathInsertVertex(self.setElement, self.ellps[self.pos].setPos-1);

	
}


function  updatePolyline(self)
{
	
	for (var i = 0; i < self.ellps.length; i++) {
            var element = document.getElementById(self.ellps[i].id);
            element.parentNode.removeChild(element);
        }
	self.ellps = [];
	self.creatEllipse();
	//self.pos=0;
	getPosToAddlineInPolyline(self);
}


function deletePointInSameDirection(self)
{
 if(self.setElement.getAttribute("name") == 'net') return;
 var j=0;
 while(j <= self.points.length-3)
 {
	 var p1=self.points[j];
	 var p2=self.points[j+2];
	 var p=self.points[j+1];
	 
	 
	 if( pointInPolylineDelet(p1,p2, p) && !pathCurvedAt(self.setElement,j))
	 {
		  self.points.splice(j+1, 1);
		  pathRemoveVertex(self.setElement, j);
		  self.setElement.setAttribute("points", polylineToAttribute(self.points,0,0));
		  break;
	 }
	 j=j+1;
 }
}

function getArrayPoints(elem)
{
	       points = [];
           var p = elem.getAttribute("points").split(' ');
            for (var j = 0; j < p.length; j++) {
                var n = p[j].split(',');
                if (n.length == 2)
                    points.push({
                        x: parseInt(n[0]),
                        y: parseInt(n[1])
                    });
            }
			
			return points;
}


function getArrayPointsFloat(elem)
{
	       points = [];
           var p = elem.getAttribute("points").split(' ');
            for (var j = 0; j < p.length; j++) {
                var n = p[j].split(',');
                if (n.length == 2)
                    points.push({
                        x: parseFloat(n[0]),
                        y: parseFloat(n[1])
                    });
            }
			
			return points;
}

//--Closed path (a polygon whose segments can be curved) ----------------------------------------
// A closed path is a <path name="polygon"> that keeps the polygon data in `points` (so selecting,
// moving, editing the vertices, rotating and flipping work as for a polygon) and a list of
// `bulges`, one per segment (the segment from point i to point i+1, the last one closes the shape):
//   0 = straight line; b = sagitta / half chord (1 = half circle); b > 0 bulges to the right of the
//   travel direction (outwards for a clockwise outline on the screen), b < 0 to the left.
// Its `d` is rebuilt from `points` and `bulges` whenever one of them changes.
function pathIsClosed(el) {
    return !!el && el.tagName === 'path' && el.hasAttribute('bulges');
}

function pathGetBulges(el, n) {
    var b = (el.getAttribute('bulges') || '').split(/[ ,]+/).filter(function (s) { return s !== ''; }).map(parseFloat);
    for (var i = 0; i < b.length; i++) if (isNaN(b[i])) b[i] = 0;
    while (b.length < n) b.push(0);
    return b.slice(0, n);
}

function pathSetBulges(el, b) {
    el.setAttribute('bulges', b.map(function (v) { return String(Math.round(v * 10000) / 10000); }).join(','));
}

function pathNum(v) { return String(Math.round(v * 1000) / 1000); }

function pathBuildD(el) {
    var p = getArrayPointsFloat(el), n = p.length;
    if (n < 2) return '';
    var b = pathGetBulges(el, n);
    var d = 'M ' + pathNum(p[0].x) + ' ' + pathNum(p[0].y);
    for (var i = 0; i < n; i++) {
        var q = p[(i + 1) % n], a = p[i];
        var c = Math.hypot(q.x - a.x, q.y - a.y);
        if (b[i] === 0 || c === 0) { d += ' L ' + pathNum(q.x) + ' ' + pathNum(q.y); continue; }
        var r = (c / 2) * (1 + b[i] * b[i]) / (2 * Math.abs(b[i]));
        d += ' A ' + pathNum(r) + ' ' + pathNum(r) + ' 0 ' + (Math.abs(b[i]) > 1 ? 1 : 0) + ' ' + (b[i] > 0 ? 1 : 0) + ' ' + pathNum(q.x) + ' ' + pathNum(q.y);
    }
    return d + ' Z';
}

var pathRefreshing = false;
function pathRefresh(el) {
    if (pathRefreshing || !pathIsClosed(el) || !el.hasAttribute('points')) return;
    pathRefreshing = true;
    try { el.setAttribute('d', pathBuildD(el)); } finally { pathRefreshing = false; }
}

// the points of the curved segments (used with the vertices to get the size of the shape)
function pathExtraPoints(el) {
    var out = [];
    if (!pathIsClosed(el)) return out;
    var p = getArrayPointsFloat(el), n = p.length, b = pathGetBulges(el, n);
    for (var i = 0; i < n; i++) {
        if (b[i] === 0) continue;
        var a = p[i], q = p[(i + 1) % n], c = Math.hypot(q.x - a.x, q.y - a.y);
        if (c === 0) continue;
        var r = (c / 2) * (1 + b[i] * b[i]) / (2 * Math.abs(b[i])), sg = b[i] > 0 ? 1 : -1;
        var ux = (q.y - a.y) / c, uy = -(q.x - a.x) / c;                       // bulge side for b > 0
        var apx = (a.x + q.x) / 2 + ux * b[i] * c / 2, apy = (a.y + q.y) / 2 + uy * b[i] * c / 2;
        var cx = apx - sg * ux * r, cy = apy - sg * uy * r;                    // centre of the circle
        var a0 = Math.atan2(a.y - cy, a.x - cx), da = 4 * Math.atan(b[i]);
        for (var k = 1; k < 16; k++) out.push({ x: cx + r * Math.cos(a0 + da * k / 16), y: cy + r * Math.sin(a0 + da * k / 16) });
    }
    return out;
}

// flipping or turning the shape over reverses the side of every curve
function pathMirror(el) {
    if (!pathIsClosed(el)) return;
    pathSetBulges(el, pathGetBulges(el, getArrayPointsFloat(el).length).map(function (v) { return -v; }));
}

// a vertex was added on the segment `seg` (between the points seg and seg+1): the curve is shared by the two new segments
function pathInsertVertex(el, seg) {
    if (!pathIsClosed(el)) return;
    var n = getArrayPointsFloat(el).length;                                    // before the insertion
    var b = pathGetBulges(el, n), h = Math.tan(Math.atan(b[seg]) / 2);
    b.splice(seg, 1, h, h);
    pathSetBulges(el, b);
}

// a vertex was removed: segments `seg` and `seg+1` become one (only straight ones are merged)
function pathRemoveVertex(el, seg) {
    if (!pathIsClosed(el)) return;
    var b = pathGetBulges(el, getArrayPointsFloat(el).length);
    b.splice(seg + 1, 1);
    pathSetBulges(el, b);
}

(function () {
    var original = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
        original.call(this, name, value);
        if ((name === 'points' || name === 'bulges') && this.tagName === 'path') pathRefresh(this);
    };
})();

// true when the segment `seg` or the next one is curved
function pathCurvedAt(el, seg) {
    if (!pathIsClosed(el)) return false;
    var b = pathGetBulges(el, getArrayPointsFloat(el).length);
    return b[seg] !== 0 || b[seg + 1] !== 0;
}
