
/*
#-------------------------------------------------------------------------------
# Name:        pin.js
# Author:      d.fathi
# Created:     23/07/2021
# Copyright:   (c) PyAMS 2021
# Licence:
#-------------------------------------------------------------------------------
 */

function drawingPin(pinElement) {

    points = [];
    var p = pinElement.getAttribute("points").split(' ');
    for (var j = 0; j < p.length; j++) {
        var n = p[j].split(',');
        if (n.length == 2)
            points.push({
                x: parseInt(n[0]),
                y: parseInt(n[1])
            });
    }

    pinElement.childNodes[0].setAttribute("points", polylineToAttribute(points, 0, 0));
    pinElement.childNodes[1].setAttribute("x", points[0].x - 3);
    pinElement.childNodes[1].setAttribute("y", points[0].y - 3);

    if ((points[0].y == points[1].y) && (points[0].x <= points[1].x)) {
        var xt = points[1].x + 2;
        var yt = points[1].y + 2;
        pinElement.childNodes[2].setAttribute('x', xt);
        pinElement.childNodes[2].setAttribute('y', yt);
        pinElement.childNodes[2].setAttribute('transform', 'rotate(0 ' + xt + ' ' + yt + ')');
    } else if ((points[0].y == points[1].y) && (points[0].x > points[1].x)) {

        var bbox = pinElement.childNodes[2].getBBox();
        var w = bbox.width;
        var h = bbox.height;
        var xt = points[1].x - w;
        var yt = points[1].y + 2;
        pinElement.childNodes[2].setAttribute('x', xt);
        pinElement.childNodes[2].setAttribute('y', yt);
        pinElement.childNodes[2].setAttribute('transform', 'rotate(0 ' + xt + ' ' + yt + ')');
    } else if ((points[0].y <= points[1].y) && (points[0].x == points[1].x)) {
        var bbox = pinElement.childNodes[2].getBBox();
        var w = bbox.width;
        var h = bbox.height;
        var xt = points[1].x - 2;
        var yt = points[1].y + 2
            pinElement.childNodes[2].setAttribute('x', xt);
        pinElement.childNodes[2].setAttribute('y', yt);
        pinElement.childNodes[2].setAttribute('transform', 'rotate(90 ' + xt + ' ' + yt + ')');
    } else if ((points[0].y > points[1].y) && (points[0].x == points[1].x)) {

        var bbox = pinElement.childNodes[2].getBBox();
        var w = bbox.width;
        var h = bbox.height;
        var xt = points[1].x - 2;
        var yt = points[1].y - 2 - w;
        pinElement.childNodes[2].setAttribute('x', xt);
        pinElement.childNodes[2].setAttribute('y', yt);
        pinElement.childNodes[2].setAttribute('transform', 'rotate(90 ' + xt + ' ' + yt + ')');
    }

    controlModifiedPin(pinElement);
    var xt = points[0].x;
    var yt = points[0].y;
    pinElement.childNodes[3].setAttribute('x', xt);
    pinElement.childNodes[3].setAttribute('y', yt);
    pinElement.childNodes[3].setAttribute('transform', 'rotate(0 ' + xt + ' ' + yt + ')');

    drawingPinByType(pinElement, points)

}


function getPinDescription(elem) {
    var points = getArrayPoints(elem);
    t = {};

    if ((points[0].y == points[1].y) && (points[0].x <= points[1].x))
        t = {
            size: points[1].x - points[0].x,
            rotation: '0°',
            text: elem.childNodes[2].textContent,
            x: points[0].x,
            y: points[0].y
        };
    else if ((points[0].y == points[1].y) && (points[0].x > points[1].x))
        t = {
            size: -points[1].x + points[0].x,
            rotation: '180°',
            text: elem.childNodes[2].textContent,
            x: points[0].x,
            y: points[0].y
        };
    else if ((points[0].y <= points[1].y) && (points[0].x == points[1].x))
        t = {
            size: points[1].y - points[0].y,
            rotation: '90°',
            text: elem.childNodes[2].textContent,
            x: points[0].x,
            y: points[0].y
        };
    else if ((points[0].y > points[1].y) && (points[0].x == points[1].x))
        t = {
            size: points[0].y - points[1].y,
            rotation: '270°',
            text: elem.childNodes[2].textContent,
            x: points[0].x,
            y: points[0].y
        };

    if (elem.childNodes[3].textContent == '+')
        poly = "positive";
    else if (elem.childNodes[3].textContent == '-')
        poly = "negative";
    else
        poly = "mixed";

    t['polarity'] = poly;

    return t;

}

function getPolyText(poly) {
    if (poly == "positive")
        return '+';
    else if (poly == "negative")
        return '-';
    else
        return ' ';
}

function showPolarity(val) {

    var collection = document.getElementsByName("pin");

    for (var i = 0; i < collection.length; i++)
        {
            if (val)
                collection[i].childNodes[3].style.display = "block";
            else
                collection[i].childNodes[3].style.display = "none";
        }

    drawing.showPolarity = val;
}

function ItShowPolarity() {
    var collection = document.getElementsByName("pin");

    for (var i = 0; i < collection.length; i++) {
        drawing.showPolarity = collection[i].childNodes[3].style.display == "block";
        break;
    }

    return drawing.showPolarity;
}

function drawingPinByType(pinElement, points) {

    var x = points[1].x;
    var y = points[1].y;
    var n = 1.5;
    if (!pinElement.getAttribute("type")) {
        var newElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse');
        newElement5.style.strokeWidth = "1px";
        newElement5.setAttribute("cx", x);
        newElement5.setAttribute("cy", y);
        newElement5.setAttribute("rx", n);
        newElement5.setAttribute("ry", n);
        pinElement.appendChild(newElement5);

        var newElement6 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        newElement6.style.strokeWidth = "1px";
        pinElement.appendChild(newElement6);
        pinElement.setAttribute("type", "simple");
    }

    t = {
        cx: x,
        cy: y + n,
        pg: {
            x0: x - n,
            y0: y,
            x1: x + n,
            y1: y,
            x3: x,
            y3: y - n
        }
    };

    if ((points[0].y == points[1].y) && (points[0].x <= points[1].x))
        t = {
            cx: x - n,
            cy: y,
            pg: {
                x0: x,
                y0: y - n,
                x1: x,
                y1: y + n,
                x3: x + n,
                y3: y
            }
        };
    else if ((points[0].y == points[1].y) && (points[0].x > points[1].x))
        t = {
            cx: x + n,
            cy: y,
            pg: {
                x0: x,
                y0: y - n,
                x1: x,
                y1: y + n,
                x3: x - n,
                y3: y
            }
        };
    else if ((points[0].y <= points[1].y) && (points[0].x == points[1].x))
        t = {
            cx: x,
            cy: y - n,
            pg: {
                x0: x - n,
                y0: y,
                x1: x + n,
                y1: y,
                x3: x,
                y3: y + n
            }
        };
    else if ((points[0].y > points[1].y) && (points[0].x == points[1].x))
        t = {
            cx: x,
            cy: y + n,
            pg: {
                x0: x - n,
                y0: y,
                x1: x + n,
                y1: y,
                x3: x,
                y3: y - n
            }
        };

    pinElement.childNodes[4].setAttribute('cx', t.cx);
    pinElement.childNodes[4].setAttribute('cy', t.cy);
    pinElement.childNodes[4].setAttribute("rx", n);
    pinElement.childNodes[4].setAttribute("ry", n);
    pinElement.childNodes[4].style.stroke = pinElement.childNodes[0].style.stroke;
    pinElement.childNodes[4].style.fill = pinElement.childNodes[0].style.stroke;

    r = t.pg.x0 + ',' + t.pg.y0 + ' ' + t.pg.x1 + ',' + t.pg.y1 + ' ' + t.pg.x3 + ',' + t.pg.y3 + ' ';
    pinElement.childNodes[5].setAttribute("points", r);
    pinElement.childNodes[5].style.stroke = pinElement.childNodes[0].style.stroke;
    pinElement.childNodes[5].style.fill = pinElement.childNodes[0].style.stroke;

    type = pinElement.getAttribute("type");
    console.log(type);
    if (type == "simple") {
        pinElement.childNodes[4].style.display = "none";
        pinElement.childNodes[5].style.display = "none";
    } else if (type == "dot") {
        pinElement.childNodes[4].style.display = "block";
        pinElement.childNodes[5].style.display = "none";
    } else if (type == "clk") {
        pinElement.childNodes[4].style.display = "none";
        pinElement.childNodes[5].style.display = "block";
    } else if (type == "dotclk") {
        pinElement.childNodes[4].style.display = "block";
        pinElement.childNodes[5].style.display = "block";
    } else if (type == "input") {
        var x0 = points[0].x;
        var x1 = points[1].x;
        var y0 = points[0].y;
        var y1 = points[1].y;

        pinElement.childNodes[4].style.display = "none";
        pinElement.childNodes[5].style.display = "block";
        var p = [];

        if ((y0 == y1) && (x0 <= x1))
            p = [{
                    x: x0,
                    y: y0 - n
                }, {
                    x: x1 - n,
                    y: y0 - n
                }, {
                    x: x1,
                    y: y1
                }, {
                    x: x1 - n,
                    y: y0 + n
                }, {
                    x: x0,
                    y: y0 + n
                }
            ];
        else if ((y0 == y1) && (x0 > x1))
            p = [{
                    x: x0,
                    y: y0 - n
                }, {
                    x: x1 + n,
                    y: y0 - n
                }, {
                    x: x1,
                    y: y1
                }, {
                    x: x1 + n,
                    y: y0 + n
                }, {
                    x: x0,
                    y: y0 + n
                }
            ];
        else if ((y0 < y1) && (x0 == x1))
            p = [{
                    x: x0 - n,
                    y: y0
                }, {
                    x: x0 - n,
                    y: y1 - n
                }, {
                    x: x1,
                    y: y1
                }, {
                    x: x0 + n,
                    y: y1 - n
                }, {
                    x: x0 + n,
                    y: y0
                }
            ];
        else if ((y0 > y1) && (x0 == x1))
            p = [{
                    x: x0 - n,
                    y: y0
                }, {
                    x: x0 - n,
                    y: y1 + n
                }, {
                    x: x1,
                    y: y1
                }, {
                    x: x0 + n,
                    y: y1 + n
                }, {
                    x: x0 + n,
                    y: y0
                }
            ];
        pinElement.childNodes[5].setAttribute("points", polylineToAttribute(p, 0, 0));

    } else if (type == "output") {
        var x0 = points[0].x;
        var x1 = points[1].x;
        var y0 = points[0].y;
        var y1 = points[1].y;

        pinElement.childNodes[4].style.display = "none";
        pinElement.childNodes[5].style.display = "block";
        var p = [];

        if ((y0 == y1) && (x0 <= x1))
            p = [{
                    x: x0,
                    y: y0
                }, {
                    x: x0 + n,
                    y: y0 - n
                }, {
                    x: x1,
                    y: y0 - n
                }, {
                    x: x1,
                    y: y0 + n
                }, {
                    x: x0 + n,
                    y: y0 + n
                }
            ];
        else if ((y0 == y1) && (x0 > x1))
            p = [{
                    x: x0,
                    y: y0
                }, {
                    x: x0 - n,
                    y: y0 - n
                }, {
                    x: x1,
                    y: y0 - n
                }, {
                    x: x1,
                    y: y0 + n
                }, {
                    x: x0 - n,
                    y: y0 + n
                }
            ];
        else if ((y0 < y1) && (x0 == x1))
            p = [{
                    x: x0,
                    y: y0
                }, {
                    x: x0 - n,
                    y: y0 + n
                }, {
                    x: x0 - n,
                    y: y1
                }, {
                    x: x0 + n,
                    y: y1
                }, {
                    x: x0 + n,
                    y: y0 + n
                }
            ];
        else if ((y0 > y1) && (x0 == x1))
            p = [{
                    x: x0,
                    y: y0
                }, {
                    x: x0 - n,
                    y: y0 - n
                }, {
                    x: x0 - n,
                    y: y1
                }, {
                    x: x0 + n,
                    y: y1
                }, {
                    x: x0 + n,
                    y: y0 - n
                }
            ];
        pinElement.childNodes[5].setAttribute("points", polylineToAttribute(p, 0, 0));

    }

}

function creatPin(elem) {

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');

    newElement.setAttribute("points", "0,0 0,0");
    newElement.setAttribute("class", "polyline");
    newElement.setAttribute("name", "pin");
    newElement.setAttribute("type", "input");

    var newElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
    newElement1.style.stroke = "#ff0000";
    newElement1.style.strokeWidth = "1px";
    newElement.appendChild(newElement1);

    var newElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    newElement2.style.stroke = "#00ff00";
    newElement2.style.fill = "none";
    newElement2.style.strokeWidth = "1px";
    newElement2.setAttribute("width", 6);
    newElement2.setAttribute("height", 6);
    newElement2.setAttribute("class", "pin");
    newElement.appendChild(newElement2);

    var newElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    newElement3.style.fontSize = "7px";
    newElement3.style.fontFamily = "Arial";
    newElement3.style.display = "block";
    newElement3.style.fill = "#000000";
    newElement3.setAttribute("r", 0);
    newElement3.textContent = '_';
    newElement.appendChild(newElement3);

    var newElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    newElement4.style.fontSize = "7px";
    newElement4.style.fontFamily = "Arial";
    newElement4.style.display = "block";
    newElement4.style.fill = "#000000";
    newElement4.setAttribute("r", 0);
    newElement4.textContent = ' ';
    newElement.appendChild(newElement4);

    var newElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse');
    newElement5.style.stroke = "#ff0000";
    newElement5.style.fill = "#ff0000";
    newElement5.style.strokeWidth = "1px";
    newElement5.setAttribute("cx", 0);
    newElement5.setAttribute("cy", 0);
    newElement5.setAttribute("rx", 3.5);
    newElement5.setAttribute("ry", 3.5);
    newElement.appendChild(newElement5);

    var newElement6 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
    newElement6.style.stroke = "#ff0000";
    newElement6.style.fill = "#ff0000";
    newElement6.style.strokeWidth = "1px";
    newElement.appendChild(newElement6);
    elem.appendChild(newElement);
}

function posPin(elem, w, h, width, height, rot) {
    if (rot==1) {
        var x = w;
        var y = height + 5;
        var x0 = w;
        var y0 = height;
    } else if (rot==3) {
        var x = w;
        var y = -5;
        var x0 = w;
        var y0 = 0;
    } else if (rot==2) {
        var x = width + 5;
        var y = h;
        var x0 = width;
        var y0 = h;
    } else {
        var x = -5;
        var y = h;
        var x0 = 0;
        var y0 = h;
    }
    elem.setAttribute("points", x + "," + y + " " + x0 + "," + y0);
    drawingPin(elem);
}
