/*
#-------------------------------------------------------------------------------
# Name:        arc.js
# Author:      d.fathi
# Created:     15/06/2021
# Copyright:   (c)PyAMS 2021
# Licence:
# Ref:  SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
#-------------------------------------------------------------------------------
 */
const cos_ = Math.cos;
const sin_ = Math.sin;
const pi = Math.PI;

const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
const f_rotate_matrix = (x => [[cos_(x),-sin_(x)], [sin_(x), cos_(x)]]);
const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

f_svg_ellipse_arc = function([cx,cy],[rx,ry], [t1, Δ], φ )  {

Δ = Δ % (2*pi);
const rotMatrix = f_rotate_matrix (φ);
const [sX, sY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos_(t1), ry * sin_(t1)] ), [cx,cy] ) );
const [eX, eY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos_(t1+Δ), ry * sin_(t1+Δ)] ), [cx,cy] ) );
const fA = ( (Δ > pi) ? 1 : 0 );
const fS = ( (Δ > 0) ? 1 : 0 );

return  "M " + sX + " " + sY + " A " + [ rx , ry , φ / (2*pi) *360, fA, fS, eX, eY ].join(" ");

};


function pointInArc(r, offset) {

   d = Math.pow((offset.x - r.cx) / r.rx, 2) + Math.pow((offset.y - r.cy) / r.ry, 2);
    min = 0.8;
    max = 1.2;
	
    
	var e=Math.atan2((offset.y - r.cy),(offset.x - r.cx)) ;

	if(e>2*pi)
		e=e-2*pi
	if(e<0)
		e=e+2*pi
    
	if(r.startAngle>2*pi)
		r.startAngle=r.startAngle-2*pi
	if(r.endAngle>2*pi)
		r.endAngle=r.endAngle-2*pi
	if(r.startAngle<0)
		r.startAngle=r.startAngle+2*pi
	if(r.endAngle<0)
		r.endAngle=r.endAngle+2*pi

	var ev=e+2*pi;
   // document.getElementById("show").innerHTML="e="+((e*180/3.14)+360)+"e="+(e*180/3.14)+'<br>start='+(r.startAngle*180/3.14)+'<br>end='+((r.startAngle+r.endAngle)*180/3.14); //&& (e>=r.startAngle)&& (e<=(r.startAngle+r.endAngle)



 
	return (d >= min) && (d <= max)  && (((e>=r.startAngle) && (e<=(r.startAngle+r.endAngle)))||((ev>=r.startAngle) && (ev<=(r.startAngle+r.endAngle)))) ;

}

function arcToAttribute(arcPoints, x, y) {
    return f_svg_ellipse_arc([arcPoints.cx + x, arcPoints.cy + y], [arcPoints.rx, arcPoints.ry], [arcPoints.startAngle, arcPoints.endAngle],0);
}

function setArcPoints(elem,arcPoints)
{
	elem.setAttribute("cx",arcPoints.cx);
	elem.setAttribute("cy",arcPoints.cy);
	elem.setAttribute("rx",arcPoints.rx);
	elem.setAttribute("ry",arcPoints.ry);
	elem.setAttribute("startangle",arcPoints.startAngle);
	elem.setAttribute("deltaangle",arcPoints.deltaAngle);
	elem.setAttribute("endangle",arcPoints.endAngle);
}

function getArcPoints(elem)
{
	var arcPoints={};
	arcPoints.cx=parseFloat(elem.getAttribute("cx"));
	arcPoints.cy=parseFloat(elem.getAttribute("cy"));
	arcPoints.rx=parseFloat(elem.getAttribute("rx"));
	arcPoints.ry=parseFloat(elem.getAttribute("ry"));
	arcPoints.startAngle=parseFloat(elem.getAttribute("startangle"));
	arcPoints.deltaAngle=parseFloat(elem.getAttribute("deltaangle"));
	arcPoints.endAngle=parseFloat(elem.getAttribute("endangle"));
	return arcPoints;
}

function getDeg(val)
{
	var deg=parseInt(parseFloat(val*180/3.14));
	if(deg>360)
		deg=parseInt(deg/360);
	return deg;
}

//*************************************

function getNewPosByAngle(self) {

  
    arcPointsf = getArcPoints(self.setElement);

    if ((self.pos != 5) && (self.select)) {

        self.ellps[5].x = self.arcPoints.cx + self.arcPoints.rx * Math.cos(arcPointsf.startAngle+arcPointsf.endAngle);
        self.ellps[5].y = self.arcPoints.cy + self.arcPoints.ry * Math.sin(arcPointsf.startAngle+arcPointsf.endAngle);
        self.moveElement(self.ellps[5]);
    }
    if ((self.pos != 4) && (self.select)) {
        self.ellps[4].x = self.arcPoints.cx + self.arcPoints.rx * Math.cos(arcPointsf.startAngle);
        self.ellps[4].y = self.arcPoints.cy + self.arcPoints.ry * Math.sin(arcPointsf.startAngle);
        self.moveElement(self.ellps[4]);
    }
}


// real extent of the drawn part of an arc (not the whole ellipse): {xmin, ymin, xmax, ymax}
function arcBounds(elem) {
    var a = getArcPoints(elem), b = { xmin: Infinity, ymin: Infinity, xmax: -Infinity, ymax: -Infinity };
    var sweep = isNaN(a.endAngle) ? a.deltaAngle : a.endAngle;
    if (isNaN(a.startAngle) || isNaN(sweep)) {
        return { xmin: a.cx - a.rx, ymin: a.cy - a.ry, xmax: a.cx + a.rx, ymax: a.cy + a.ry };
    }
    var n = 48;
    for (var k = 0; k <= n; k++) {
        var t = a.startAngle + sweep * k / n;
        var x = a.cx + a.rx * Math.cos(t), y = a.cy + a.ry * Math.sin(t);
        b.xmin = Math.min(b.xmin, x); b.xmax = Math.max(b.xmax, x);
        b.ymin = Math.min(b.ymin, y); b.ymax = Math.max(b.ymax, y);
    }
    return b;
}
