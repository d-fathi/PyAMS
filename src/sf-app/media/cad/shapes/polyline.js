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
	 
	 
	 if( pointInPolylineDelet(p1,p2, p))
	 {
		  self.points.splice(j+1, 1);
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