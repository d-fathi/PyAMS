/*
#-------------------------------------------------------------------------------
# Name:        selectElements.js
# Author:      d.fathi
# Created:     05/08/2021
# Copyright:  (c) PyAMS 2024
# Licence:     free
#-------------------------------------------------------------------------------
 */

/*
var collection = document.getElementById("sym").children;
console.log(collection.length);
for (var i=0; i<=collection.length-1; i++){
//document.getElementById("selElms").appendChild(collection[i]);//.parentElement;
p = collection[i];
p_prime = p.cloneNode(true);

}
document.getElementById("sym").appendChild(p_prime);
 */

function creatLimiteOfSelect(self) {
    var svg = document.getElementById("selElms");
    var rect = [];
    svg.innerHTML = '';

    for (var i = 0; i <= self.lsg.oldPos.length - 1; i++) {
        var elem = self.lsg.elms[i];
        switch (elem.getAttribute("name")) {
        case "pin":
        case "polyline":
		case "polygon":
		case "net":
            var p = getArrayPoints(elem);
            for (var j = 0; j < p.length; j++)
                rect.push({
                    x: p[j].x,
                    y: p[j].y
                });

            break;
        case "part":
        case "rect":
        case "image":
		case "probe":
		case "oscilloscope":
		case "analysis":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            var w = parseInt(elem.getAttribute("width"));
            var h = parseInt(elem.getAttribute("height"));
            rect.push({
                x: x,
                y: y
            });
            rect.push({
                x: x + w,
                y: y
            });
            rect.push({
                x: x,
                y: y + h
            });
            rect.push({
                x: x + w,
                y: y + h
            });
            break;

        case "ellipse":
            var x = parseInt(elem.getAttribute("cx")) - parseInt(elem.getAttribute("rx"));
            var y = parseInt(elem.getAttribute("cy")) - parseInt(elem.getAttribute("ry"));
            var w = 2 * parseInt(elem.getAttribute("rx"));
            var h = 2 * parseInt(elem.getAttribute("ry"));
            rect.push({
                x: x,
                y: y
            });
            rect.push({
                x: x + w,
                y: y
            });
            rect.push({
                x: x,
                y: y + h
            });
            rect.push({
                x: x + w,
                y: y + h
            });
            break;

        case "arc":
		    arcPoints=getArcPoints(elem);
			var x = -arcPoints.rx+arcPoints.cx;
            var y = -arcPoints.ry+arcPoints.cy;
			var w = 2*arcPoints.rx;
			var h = 2*arcPoints.ry;

            rect.push({
                x: x,
                y: y
            });
            rect.push({
                x: x + w,
                y: y
            });
            rect.push({
                x: x,
                y: y + h
            });
            rect.push({
                x: x + w,
                y: y + h
            });
            break;

        case 'text':
        case 'param':
        case '.param':
        case 'label':
        case 'ref':

            var p = getRectOfText(elem);
            for (var j = 0; j < p.length; j++)
                rect.push({
                    x: p[j].x,
                    y: p[j].y
                });

            break;
        }

    }

    var r = 6; // / self.zoom;
    for (var i = 0; i < rect.length; i++) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        newElement.style.stroke = "#1100ff";
        newElement.style.fill = "#1100ff";
        newElement.style.strokeWidth = "1px";
        newElement.setAttribute("x", rect[i].x - (r / 2));
        newElement.setAttribute("y", rect[i].y - (r / 2));
        newElement.setAttribute("width", r);
        newElement.setAttribute("height", r);
        svg.appendChild(newElement);
    }

}
function itElemSelectByRect(x, y, xo, yo, elem) {

    var rect = []
    switch (elem.getAttribute("name")) {
    case "pin":
    case "polyline":
	case "polygon":
	case "net":
        var p = getArrayPoints(elem);
        for (var j = 0; j < p.length; j++)
            rect.push({
                x: p[j].x,
                y: p[j].y
            });

        break;
   case "arc":
		    arcPoints=getArcPoints(elem);
			var xt = -arcPoints.rx+arcPoints.cx;
            var yt = -arcPoints.ry+arcPoints.cy;
			var w = 2*arcPoints.rx;
			var h = 2*arcPoints.ry;


            rect.push({
                x: xt,
                y: yt
            });
            rect.push({
                x: xt + w,
                y: yt
            });
            rect.push({
                x: xt,
                y: yt + h
            });
            rect.push({
                x: xt + w,
                y: yt + h
            });
            break;


    case "ellipse":
        rect.push({
            x: parseInt(elem.getAttribute("cx")) - parseInt(elem.getAttribute("rx")),
            y: parseInt(elem.getAttribute("cy")) - parseInt(elem.getAttribute("ry"))
        });
        rect.push({
            x: parseInt(elem.getAttribute("cx")) + parseInt(elem.getAttribute("rx")),
            y: parseInt(elem.getAttribute("cy")) + parseInt(elem.getAttribute("ry"))
        });
        break;
    case "part":
    case "rect":
    case "image":
	case "probe":
	case "oscilloscope":
	case "analysis":
        rect.push({
            x: parseInt(elem.getAttribute("x")),
            y: parseInt(elem.getAttribute("y"))
        });
        rect.push({
            x: parseInt(elem.getAttribute("x")) + parseInt(elem.getAttribute("width")),
            y: parseInt(elem.getAttribute("y")) + parseInt(elem.getAttribute("height"))
        });
        break;

    case 'text':
    case 'param':
    case '.param':
    case 'label':
    case 'ref':

        var p = getRectOfText(elem);
        for (var j = 0; j < p.length; j++)
            rect.push({
                x: p[j].x,
                y: p[j].y
            });

        break;
    }

    var itInRect = rect.length > 0;
    for (var i = 0; i < rect.length; i++)
        itInRect = itInRect && (rect[i].x > xo) && (rect[i].x < x) && (rect[i].y > yo) && (rect[i].y < y);

    return itInRect;
}

function saveInArrayElemSelectByRect(self, elem) {
    self.lsg.elms.push(elem);
    switch (elem.getAttribute("name")) {
    case "pin":
    case "polyline":
	case "polygon":
	case "net":
        self.lsg.oldPos.push({
            points: getArrayPoints(elem)
        });
        break;

    case 'part':
    case 'rect':
    case 'image':
	case 'oscilloscope':
	case 'analysis':
    case 'text':
    case 'param':
    case '.param':
	case 'probe':
    case 'label':
    case 'ref':
        self.lsg.oldPos.push({
            x: parseInt(elem.getAttribute("x")),
            y: parseInt(elem.getAttribute("y"))
        });
        break;
    case 'ellipse':
        self.lsg.oldPos.push({
            x: parseInt(elem.getAttribute("cx")),
            y: parseInt(elem.getAttribute("cy"))
        });
        break;

    case 'arc':
        self.lsg.oldPos.push({
             arcPoints:getArcPoints(elem)
        });
        break;
    }

}

function thisSelectElemItInGroup(self, elem) {
    self.lsg.move = false;
    for (var i = 0; i <= self.lsg.oldPos.length - 1; i++)
        if (self.lsg.elms[i] == elem) {
            self.lsg.move = true;
            self.lsg.xo = self.offset.x;
            self.lsg.yo = self.offset.y;
            return true;
        }

    return false;
}

function moveElemGroup(self) {
    document.getElementById("selElms").innerHTML = '';
    if (self.lsg.move) {
        var dx = self.coord.x - self.lsg.xo;
        var dy = self.coord.y - self.lsg.yo;
        for (var i = 0; i <= self.lsg.oldPos.length - 1; i++) {
            var elem = self.lsg.elms[i];
            var pos = self.lsg.oldPos[i];
            switch (elem.getAttribute("name")) {
			case "net":
            case "polyline":
			case "polygon":
                elem.setAttribute("points", polylineToAttribute(pos.points, dx, dy));
                break;

            case "pin":
                elem.setAttribute("points", polylineToAttribute(pos.points, dx, dy));
                drawingPin(elem);
                break;

            case "probe":
            case "part":
			case "oscilloscope":
			case "analysis":
                elem.setAttribute("x", pos.x + dx);
                elem.setAttribute("y", pos.y + dy);
                elem.setAttribute('transform', "translate(" + (pos.x + dx) + "," + (pos.y + dy) + ")");
                break;

            case "rect":
            case "image":
                elem.setAttribute("x", pos.x + dx);
                elem.setAttribute("y", pos.y + dy);
                break;

            case "ellipse":
                elem.setAttribute("cx", pos.x + dx);
                elem.setAttribute("cy", pos.y + dy);
                break;

			case "arc":
			elem.setAttribute("d", arcToAttribute(pos.arcPoints, dx, dy));
		    elem.setAttribute("cx", pos.arcPoints.cx + dx);
            elem.setAttribute("cy", pos.arcPoints.cy + dy);
            break;



            case 'text':
            case 'param':
            case '.param':
            case 'label':
            case 'ref':
                elem.setAttribute("x", pos.x + dx);
                elem.setAttribute("y", pos.y + dy);
                var r = elem.getAttribute("r");
                elem.setAttribute('transform', 'rotate(' + r + ' ' + (pos.x + dx) + '  ' + (pos.y + dy) + ')');
                break;

            }
        }

    }

    return self.lsg.move;

}

function upElemGroup(self) {
    if (self.lsg.move) {
        for (var i = 0; i <= self.lsg.oldPos.length - 1; i++) {
            var elem = self.lsg.elms[i];
            switch (elem.getAttribute("name")) {
			case "net":
            case "pin":
            case "polyline":
			case "polygon":
                self.lsg.oldPos[i].points = getArrayPoints(elem);
                break;
            case "part":
			case 'probe':
            case 'rect':
            case 'image':
			case 'oscilloscope':
			case 'analysis':
            case 'text':
            case 'param':
            case '.param':
            case 'label':
            case 'ref':
                self.lsg.oldPos[i].x = parseInt(elem.getAttribute("x"));
                self.lsg.oldPos[i].y = parseInt(elem.getAttribute("y"));
                break;
            case "ellipse":
                self.lsg.oldPos[i].x = parseInt(elem.getAttribute("cx"));
                self.lsg.oldPos[i].y = parseInt(elem.getAttribute("cy"));
                break;
			case "arc":
				self.lsg.oldPos[i].arcPoints.cx= parseInt(elem.getAttribute("cx"));
				self.lsg.oldPos[i].arcPoints.cy= parseInt(elem.getAttribute("cy"));
				break;

            }
        }

    }

    self.lsg.move = false;
    creatLimiteOfSelect(self);

}

function selectElementsInRect(self, p) {
    self.lsg.elms = [];
    self.lsg.oldPos = [];
    var xo = Math.min(p.x, p.xo);
    var yo = Math.min(p.y, p.yo);
    var x = Math.max(p.x, p.xo);
    var y = Math.max(p.y, p.yo);

    var collection = document.getElementById("sym").children;

    for (var i = 0; i <= collection.length - 1; i++)
        if (itElemSelectByRect(x, y, xo, yo, collection[i]))
            saveInArrayElemSelectByRect(self, collection[i]);
    creatLimiteOfSelect(self);

}

function clearSelectElms(self) {
    self.lsg.elms = [];
    self.lsg.oldPos = [];
    document.getElementById("selElms").innerHTML = '';
}

function selectPast(self) {
    self.shapes.lsg.elms = [];
    self.shapes.lsg.oldPos = [];
    var collection = document.getElementById("sym").children;
    var l = collection.length - 1;
    for (var i = self.copyList.length - 1; i >= 0; i--)
        saveInArrayElemSelectByRect(self.shapes, collection[l - i]);
    self.shapes.lsg.move = true;
    self.shapes.coord = {
        x: 10,
        y: 10
    };
    self.shapes.lsg.xo = 0;
    self.shapes.lsg.yo = 0;
    moveElemGroup(self.shapes);
    self.shapes.lsg.move = false;
    creatLimiteOfSelect(self.shapes);
}
