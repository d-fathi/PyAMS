/*
#-------------------------------------------------------------------------------
# Name:        svg
# Author:      d.fathi
# Created:     29/09/2021
# Copyright:   (c) PyAMS 2021
# Licence:
#-------------------------------------------------------------------------------
 */
function getMinMaxSize(min_, max_, x, y) {
    if (x < min_.x)
        min_.x = x;
    if (x > max_.x)
        max_.x = x;
    if (y < min_.y)
        min_.y = y;
    if (y > max_.y)
        max_.y = y;

}
function savePageToSVG(size) {
    var list = [];

    var collection = document.getElementById("sym").children;
    var temp = document.getElementById("sym").innerHTML;
    var min_ = {
        x: 2000,
        y: 2000
    };
    var max_ = {
        x: -2000,
        y: -2000
    };

    //----------------------get Size------------------//
    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];

        switch (elem.getAttribute("name")) {
        case "pin":
        case "polyline":
		case "polygon":
        case "net":
            var p = getArrayPoints(elem);
            for (var j = 0; j < p.length; j++)
                getMinMaxSize(min_, max_, p[j].x, p[j].y);
            break;

        case "ellipse":
		case "arc":
            var x = parseInt(elem.getAttribute("cx")) - parseInt(elem.getAttribute("rx"));
            var y = parseInt(elem.getAttribute("cy")) - parseInt(elem.getAttribute("ry"));
            getMinMaxSize(min_, max_, x, y);
            var x = parseInt(elem.getAttribute("cx")) + parseInt(elem.getAttribute("rx"));
            var y = parseInt(elem.getAttribute("cy")) + parseInt(elem.getAttribute("ry"));
            getMinMaxSize(min_, max_, x, y);
            break;

        case "part":
        case "rect":
        case "image":
        case "probe":
		case "oscilloscope":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            getMinMaxSize(min_, max_, x, y)
            var x = parseInt(elem.getAttribute("x")) + parseInt(elem.getAttribute("width"));
            var y = parseInt(elem.getAttribute("y")) + parseInt(elem.getAttribute("height"));
            getMinMaxSize(min_, max_, x, y);
            break;

        case 'text':
        case 'param':
        case '.param':
        case 'label':
        case 'ref':

            var p = getRectOfText(elem);
            for (var j = 0; j < p.length; j++)
                getMinMaxSize(min_, max_, p[j].x, p[j].y);
            break;
        }

    }

    //*************************modified size******************************//
    min_.x=min_.x-4;
	min_.y=min_.y-4;


    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        dx = -min_.x;
        dy = -min_.y;

        switch (elem.getAttribute("name")) {
        case "net":
        case "polyline":
		case "polygon":
		    var points = getArrayPoints(elem);
            elem.setAttribute("points", polylineToAttribute(points, dx, dy));
            break;

        case "pin":
		    var points = getArrayPoints(elem);
            elem.setAttribute("points", polylineToAttribute(points, dx, dy));
            drawingPin(elem);
            break;

        case "probe":
        case "part":
		case "oscilloscope":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));

            elem.setAttribute("x", x + dx);
            elem.setAttribute("y", y + dy);
            elem.setAttribute('transform', "translate(" + (x + dx) + "," + (y + dy) + ")");
			modifedSizeDivByoscilloscope(elem);
            break;

        case "rect":
        case "image":
            
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            elem.setAttribute("x", x + dx);
            elem.setAttribute("y", y + dy);
            break;

        case "ellipse":
            var x = parseInt(elem.getAttribute("cx"));
            var y = parseInt(elem.getAttribute("cy"));
            elem.setAttribute("cx", x + dx);
            elem.setAttribute("cy", y + dy);
            break;

        case "arc":
            var x = parseInt(elem.getAttribute("cx"));
            var y = parseInt(elem.getAttribute("cy"));
            elem.setAttribute("cx", x + dx);
            elem.setAttribute("cy", y + dy);
			arcPoints=getArcPoints(elem);
			elem.setAttribute("d", arcToAttribute(arcPoints, 0, 0));
            break;

        case 'text':
        case 'param':
        case '.param':
        case 'label':
        case 'ref':
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            elem.setAttribute("x", x + dx);
            elem.setAttribute("y", y + dy);
            var r = elem.getAttribute("r");
            elem.setAttribute('transform', 'rotate(' + r + ' ' + (x + dx) + '  ' + (y + dy) + ')');
            break;

        }
    }

refNetWithPart();
var result=document.getElementById("sym").innerHTML;
result=result+document.getElementById("nodes").innerHTML;
document.getElementById("sym").innerHTML=temp;
refNetWithPart();
var w=max_.x-min_.x+5;
var h=max_.y-min_.y+5;

var svg_='';
svg_='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"   ';
svg_=svg_+' viewBox="0 0  '+ w + ' ' + h + ' "';
svg_=svg_+' width="'+size*w+'"';
svg_=svg_+' height="'+size*h+'"';
svg_=svg_+'>';

result=svg_+result+'</svg>';

return result;
}



//***************Image element********************************** */


function setImageElem(data){
    mtable.select.setAttribute("href", data);
}
