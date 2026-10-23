/*
#-------------------------------------------------------------------------------
# Name:        part.js
# Author:      d.fathi
# Created:     08/08/2021
# Update:      11/09/2026
# Copyright:   (c) PyAMS 2026
# Licence:     free 
#-------------------------------------------------------------------------------
*/

function newPart(self, part) {

    self.innerHTML = part;
    var collection = self.children;
    var xmin = 2000;
    var ymin = 2000;
    var xmax = -2000;
    var ymax = -2000;

    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        switch (elem.getAttribute("name")) {
        case "rect":
        case "image":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            var w = parseInt(elem.getAttribute("width"));
            var h = parseInt(elem.getAttribute("height"));
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            xmax = Math.max(x + w, xmax);
            ymax = Math.max(y + h, ymax);
            break
        case "ellipse":
        case "arc":
            var x = parseInt(elem.getAttribute("cx")) - parseInt(elem.getAttribute("rx"));
            var y = parseInt(elem.getAttribute("cy")) - parseInt(elem.getAttribute("ry"));
            var w = 2 * parseInt(elem.getAttribute("rx"));
            var h = 2 * parseInt(elem.getAttribute("ry"));
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            xmax = Math.max(x + w, xmax);
            ymax = Math.max(y + h, ymax);
            break
        case "pin":
            var p = getArrayPoints(elem);
            xmin = Math.min(p[0].x, p[1].x, xmin);
            ymin = Math.min(p[0].y, p[1].y, ymin);
            xmax = Math.max(p[0].x, p[1].x, xmax);
            ymax = Math.max(p[0].y, p[1].y, ymax);
            break;

        case "ioparam":
            var p = getRectPointsIOparam(elem);
            xmin = Math.min(p[0].x, p[1].x, xmin);
            ymin = Math.min(p[0].y, p[1].y, ymin);
            xmax = Math.max(p[0].x, p[1].x, xmax);
            ymax = Math.max(p[0].y, p[1].y, ymax);
            break;

        case "polyline":
        case "polygon":
            var p = getArrayPoints(elem);
            for (var j = 0; j < p.length; j++) {
                v = p[j];
                xmin = Math.min(v.x, xmin);
                ymin = Math.min(v.y, ymin);
                xmax = Math.max(v.x, xmax);
                ymax = Math.max(v.y, ymax);
            }
            break;
        case "text":
            var p = getRectOfText(elem);
            for (var j = 0; j < p.length; j++) {
                v = p[j];
                xmin = Math.min(v.x, xmin);
                ymin = Math.min(v.y, ymin);
                xmax = Math.max(v.x, xmax);
                ymax = Math.max(v.y, ymax);
            }
            break;
        }
    }
    var xorg = xmin;
    var yorg = ymin;
    xmin = 5 * Math.round((xmin - 5) / 5);
    ymin = 5 * Math.round((ymin - 5) / 5);
    var xorg = 0; //xorg-xmin;
    var yorg = 0; //yorg-ymin;

    xmax = 5 * Math.ceil(xmax / 5);
    ymax = 5 * Math.ceil(ymax / 5);
    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        switch (elem.getAttribute("name")) {
        case "rect":
        case "image":
            var x = parseFloat(elem.getAttribute("x"));
            var y = parseFloat(elem.getAttribute("y"));
            elem.setAttribute("x", x - xmin);
            elem.setAttribute("y", y - ymin);
            break;

        case "ellipse":
            var x = parseFloat(elem.getAttribute("cx"));
            var y = parseFloat(elem.getAttribute("cy"));
            elem.setAttribute("cx", x - xmin);
            elem.setAttribute("cy", y - ymin);
            break;

        case "arc":
            var x = parseFloat(elem.getAttribute("cx"));
            var y = parseFloat(elem.getAttribute("cy"));
            elem.setAttribute("cx", x - xmin);
            elem.setAttribute("cy", y - ymin);
            a = getArcPoints(elem);
            elem.setAttribute("d", arcToAttribute(a, 0, 0));
            elem.setAttribute("r", 1);
            elem.setAttribute("h", 1);
            elem.setAttribute("v", 1);
            break;


        case "pin":
            var p = getArrayPoints(elem);
            var xo = p[0].x - xmin;
            var yo = p[0].y - ymin;
            var x = p[1].x - xmin;
            var y = p[1].y - ymin;


            elem.setAttribute("points", xo + "," + yo + " " + x + "," + y);
            drawingPin(elem);
            break;

        case "ioparam":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            setparamPos(x - xmin, y - ymin, elem);
            break;
        case "polyline":
        case "polygon":
            var p = getArrayPointsFloat(elem);
            for (var j = 0; j < p.length; j++) {
                p[j].x = p[j].x - xmin;
                p[j].y = p[j].y - ymin;
            }
            elem.setAttribute("points", polylineToAttribute(p, 0, 0));
            break;

        case 'text':
        case 'param':
        case 'modelSpice':
        case 'ref':
            var x = parseFloat(elem.getAttribute("x")) - xmin;
            var y = parseFloat(elem.getAttribute("y")) - ymin;
            elem.setAttribute("x", x);
            elem.setAttribute("y", y);
            if(elem.getAttribute("name")!='text')
               elem.setAttribute("class", "var");
            var r = elem.getAttribute("r");
            elem.setAttribute("transform", 'rotate(' + r + ' ' + x + ' ' + y + ')');
            break;



        }
    }

    self.setAttribute("width", xmax - xmin);
    self.setAttribute("height", ymax - ymin);
    self.setAttribute("xo", xorg);
    self.setAttribute("yo", yorg);

    console.log('w=' + self.getAttribute("width"));
    console.log('h=' + self.getAttribute("height"));
}

//--------------------------------------------------------------------------------------------//

function updateVarPin(self) {

    var collection = self.children;
    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        switch (elem.getAttribute("name")) {
            case "ioparam":
               var x = parseInt(elem.getAttribute("x"));
               var y = parseInt(elem.getAttribute("y"));
               setparamPos(x, y, elem);
            break;
        }
    }
}

function itPartSelect() {
    if (drawing.resize.setElement)
        if (drawing.resize.setElement.getAttribute("name") == 'part')
            return true;
    return false;
}
//-----------------------------------------Add Ref or label to Part-------------------------------//
function addRefToPart(){
    if(!itPartSelect()) 
          return;
   
    var elem = drawing.resize.setElement;
    var els = elem.children;
    for(var i=0; i<els.length; i++)
       if(els[i].getAttribute("name")=='ref') 
          return;

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    newElement.style.fill = "#11a229";
    newElement.style.fontSize = "10";
    newElement.style.fontFamily = "Times New Roman";
    
    newElement.setAttribute("class", "draggable");
    newElement.setAttribute("name",'ref');
    newElement.setAttribute("x", 20);
    newElement.setAttribute("y", 10);
    newElement.setAttribute("r", 0);
    newElement.setAttribute("rtemp", 0);
    newElement.setAttribute("class", "var");
    newElement.setAttribute('transform', 'rotate(0 100 100)');
    newElement.textContent ='label';

    elem.appendChild(newElement);
    updateRefParts();
}


function addParamToPart(){
    if(!itPartSelect()) 
          return;
   
    var elem = drawing.resize.setElement;
    var els = elem.children;

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    newElement.style.fill = "#11a229";
    newElement.style.fontSize = "10";
    newElement.style.fontFamily = "Times New Roman";
    newElement.setAttribute("class", "draggable");
    newElement.setAttribute("name",'label');
    newElement.setAttribute("x", 20);
    newElement.setAttribute("y", 10);
    newElement.setAttribute("r", 0);
    newElement.setAttribute("rtemp", 0);
    newElement.setAttribute("class", "var");
    newElement.setAttribute('transform', 'rotate(0 100 100)');
    newElement.textContent = getTextContentByType('param');
    elem.appendChild(newElement);
}

//------------------------------------------------Rotation (RVH)------------------------------//




function rotatePart() {
   
    if (drawing.resize.setElement) {
        elem = drawing.resize.setElement;
        var name = elem.getAttribute("name");
        if (name == 'part') {
            w = parseInt(elem.getAttribute("width"));
            h = parseInt(elem.getAttribute("height"));

            elem.setAttribute("width", h);
            elem.setAttribute("height", w);

            information(drawing.resize);

            var collection = elem.children;
            for (var i = 0; i < collection.length; i++) {
                var e = collection[i];

                switch (e.getAttribute("name")) {
                case "pin":
                    var p = getArrayPoints(e);
                    var xo = p[0].y;
                    var yo = p[0].x;
                    var x = p[1].y;
                    var y = p[1].x;
                    e.setAttribute("points", xo + "," + yo + " " + x + "," + y);
                    drawingPin(e);
                    break;

                case "ioparam":
                    var x = e.getAttribute("x");
                    var y = e.getAttribute("y");

                    var r = e.getAttribute('rotate');
                    if (r == '0°')
                        e.setAttribute('rotate', '90°');
                    else if (r == '90°')
                        e.setAttribute('rotate', '0°');
                    else if (r == '180°')
                        e.setAttribute('rotate', '270°');
                    else
                        e.setAttribute('rotate', '180°');
                    setparamPos(y, x, e);
                    break;

                case "polyline":
                case "polygon":
                    var p = getArrayPoints(e);
                    for (var j = 0; j < p.length; j++) {
                        var temp = p[j].x;
                        p[j].x = p[j].y;
                        p[j].y = temp;
                    }
                    e.setAttribute("points", polylineToAttribute(p, 0, 0));
                    break;

                case "ellipse":
                    var cx = e.getAttribute("cx");
                    var cy = e.getAttribute("cy");
                    e.setAttribute("cx", cy);
                    e.setAttribute("cy", cx);
                    var rx = e.getAttribute("rx");
                    var ry = e.getAttribute("ry");
                    e.setAttribute("rx", ry);
                    e.setAttribute("ry", rx);
                    break;

                case "rect":
                case "image":
                    var x = e.getAttribute("x");
                    var y = e.getAttribute("y");
                    var w = e.getAttribute("width");
                    var h = e.getAttribute("height");

                    e.setAttribute("x", y);
                    e.setAttribute("y", x);
                    e.setAttribute("width", h);
                    e.setAttribute("height", w);

                    break;

                case "text":
                    rotateText(e);
                    break;

                case "arc":

                    var a = getArcPoints(e);
                    var xe = a.cx + a.rx * Math.cos(a.startAngle + a.endAngle);
                    var ye = a.cy + a.ry * Math.sin(a.startAngle + a.endAngle);
                    var xs = a.cx + a.rx * Math.cos(a.startAngle);
                    var ys = a.cy + a.ry * Math.sin(a.startAngle);

                    var cx = e.getAttribute("cx");
                    var cy = e.getAttribute("cy");
                    e.setAttribute("cx", cy);
                    e.setAttribute("cy", cx);
                    var rx = e.getAttribute("rx");
                    var ry = e.getAttribute("ry");
                    e.setAttribute("rx", ry);
                    e.setAttribute("ry", rx);
                    a = getArcPoints(e);
                    var t = xs;
                    xs = ys;
                    ys = t;
                    var t = xe;
                    xe = ye;
                    ye = t;

                    var deltaX = (xs - a.cx) / a.rx;
                    var deltaY = (ys - a.cy) / a.ry;
                    var rad = Math.atan2(deltaY, deltaX);
                    if (rad < 0)
                        rad = rad + 2 * pi;
                    a.endAngle = rad;

                    var deltaX = (xe - a.cx) / a.rx;
                    var deltaY = (ye - a.cy) / a.ry;
                    var rad = Math.atan2(deltaY, deltaX);
                    var t = rad;
                    if (t < 0)
                        t = t + 2 * pi;
                    a.startAngle = t;
                    t = a.endAngle - a.startAngle;
                    if (t < 0)
                        t = t + 2 * pi;
                    a.endAngle = t;

                    setArcPoints(e, a);
                    e.setAttribute("d", arcToAttribute(a, 0, 0));

                    /* 
                    e.setAttribute("cx",cy);
                    e.setAttribute("cy",cx);
                    var rx = e.getAttribute("rx");
                    var ry = e.getAttribute("ry");
                    e.setAttribute("rx",ry);
                    e.setAttribute("ry",rx);
                    var r=parseInt(e.getAttribute("r"));
                    a=getArcPoints(e);
                    a.startAngle=Math.abs(a.startAngle+r*(3.14/2));
                    r=-1*r;
                    setArcPoints(e,a);
                    e.setAttribute("r",r);
                    e.setAttribute("d", arcToAttribute(a, 0, 0));
                     */
                    break;

                }

            }
        }
    }

    portRotate(drawing.resize.setElement);

}

function flipHorizontalPart() {
    if (drawing.resize.setElement) {
        elem = drawing.resize.setElement;
        var name = elem.getAttribute("name");
        if (name == 'part') {
            w = parseInt(elem.getAttribute("width"));
            h = parseInt(elem.getAttribute("height"));

            information(drawing.resize);

            var collection = elem.children;
            for (var i = 0; i < collection.length; i++) {
                var e = collection[i];

                switch (e.getAttribute("name")) {
                case "pin":
                    var p = getArrayPoints(e);
                    var xo = Math.abs(p[0].x - w);
                    var yo = p[0].y;

                    var x = Math.abs(p[1].x - w);
                    var y = p[1].y;

                    e.setAttribute("points", xo + "," + yo + " " + x + "," + y);
                    drawingPin(e);
                    break;
                case "ioparam":
                    var x = Math.abs(parseInt(e.getAttribute("x")) - w);
                    var y = e.getAttribute("y");

                    var r = e.getAttribute('rotate');
                    if (r == '0°')
                        e.setAttribute('rotate', '180°');
                    else if (r == '180°')
                        e.setAttribute('rotate', '0°');
                    setparamPos(x, y, e);

                    break;
                case "polyline":
                case "polygon":
                    var p = getArrayPoints(e);
                    for (var j = 0; j < p.length; j++)
                        p[j].x = Math.abs(p[j].x - w);

                    e.setAttribute("points", polylineToAttribute(p, 0, 0));
                    break;

                case "ellipse":
                    var cx = parseInt(e.getAttribute("cx"));
                    e.setAttribute("cx", Math.abs(cx - w));
                    break;

                case "rect":
                case "image":
                    var x = parseInt(e.getAttribute("x"));
                    var width = parseInt(e.getAttribute("width"));

                    e.setAttribute("x", Math.abs(x - w + width));

                    break;

                case "text":
                    rotateHText(e,w);
                    break;

                case "arc":
                    var a = getArcPoints(e);

                    var xe = a.cx + a.rx * Math.cos(a.startAngle + a.endAngle);
                    var ye = a.cy + a.ry * Math.sin(a.startAngle + a.endAngle);
                    var xs = a.cx + a.rx * Math.cos(a.startAngle);
                    var ys = a.cy + a.ry * Math.sin(a.startAngle);

                    a.cx = Math.abs(a.cx - w);

                    e.setAttribute("cx", a.cx);
                    xe = Math.abs(xe - w);
                    xs = Math.abs(xs - w);

                    var deltaX = (xs - a.cx) / a.rx;
                    var deltaY = (ys - a.cy) / a.ry;
                    var rad = Math.atan2(deltaY, deltaX);
                    if (rad < 0)
                        rad = rad + 2 * pi;
                    a.endAngle = rad;

                    var deltaX = (xe - a.cx) / a.rx;
                    var deltaY = (ye - a.cy) / a.ry;
                    var rad = Math.atan2(deltaY, deltaX);
                    var t = rad;
                    if (t < 0)
                        t = t + 2 * pi;
                    a.startAngle = t;
                    t = a.endAngle - a.startAngle;
                    if (t < 0)
                        t = t + 2 * pi;
                    a.endAngle = t;

                    setArcPoints(e, a);
                    e.setAttribute("d", arcToAttribute(a, 0, 0));

                    break;

                }

            }
        }
    }


    portRotate(drawing.resize.setElement);

}

function flipVerticallyPart() {
    if (drawing.resize.setElement) {
        var elem = drawing.resize.setElement;
        var name = elem.getAttribute("name");
        if (name == 'part') {
            w = parseInt(elem.getAttribute("width"));
            h = parseInt(elem.getAttribute("height"));

            information(drawing.resize);

            var collection = elem.children;
            for (var i = 0; i < collection.length; i++) {
                var e = collection[i];

                switch (e.getAttribute("name")) {
                case "pin":
                    var p = getArrayPoints(e);
                    var xo = p[0].x;
                    var yo = Math.abs(p[0].y - h);

                    var x = p[1].x;
                    var y = Math.abs(p[1].y - h);

                    e.setAttribute("points", xo + "," + yo + " " + x + "," + y);
                    drawingPin(e);
                    break;
                case "ioparam":
                    var x = e.getAttribute("x");
                    var y = Math.abs(parseInt(e.getAttribute("y")) - h);

                    var r = e.getAttribute('rotate');
                    if (r == '90°')
                        e.setAttribute('rotate', '270°');
                    else if (r == '270°')
                        e.setAttribute('rotate', '90°');
                    setparamPos(x, y, e);
                    break;
                case "polyline":
                case "polygon":
                    var p = getArrayPoints(e);
                    for (var j = 0; j < p.length; j++)
                        p[j].y = Math.abs(p[j].y - h);

                    e.setAttribute("points", polylineToAttribute(p, 0, 0));
                    break;

                case "ellipse":
                    var cy = parseInt(e.getAttribute("cy"));
                    e.setAttribute("cy", Math.abs(cy - h));
                    break;

                case "rect":
                case "image":
                    var y = parseInt(e.getAttribute("y"));
                    var height = parseInt(e.getAttribute("height"));

                    e.setAttribute("y", Math.abs(y - h + height));

                    break;

                case "text":

                    rotateVText(e,h);

                    break;

                case "arc":
                    var a = getArcPoints(e);

                    var xe = a.cx + a.rx * Math.cos(a.startAngle + a.endAngle);
                    var ye = a.cy + a.ry * Math.sin(a.startAngle + a.endAngle);
                    var xs = a.cx + a.rx * Math.cos(a.startAngle);
                    var ys = a.cy + a.ry * Math.sin(a.startAngle);

                    a.cy = Math.abs(a.cy - h);

                    e.setAttribute("cy", a.cy);
                    ye = Math.abs(ye - h);
                    ys = Math.abs(ys - h);

                    var deltaX = (xs - a.cx) / a.rx;
                    var deltaY = (ys - a.cy) / a.ry;
                    var rad = Math.atan2(deltaY, deltaX);
                    if (rad < 0)
                        rad = rad + 2 * pi;
                    a.endAngle = rad;

                    var deltaX = (xe - a.cx) / a.rx;
                    var deltaY = (ye - a.cy) / a.ry;
                    var rad = Math.atan2(deltaY, deltaX);
                    var t = rad;
                    if (t < 0)
                        t = t + 2 * pi;
                    a.startAngle = t;
                    t = a.endAngle - a.startAngle;
                    if (t < 0)
                        t = t + 2 * pi;
                    a.endAngle = t;

                    setArcPoints(e, a);
                    e.setAttribute("d", arcToAttribute(a, 0, 0));

                    break;

                }

            }
        }
    }

    portRotate(drawing.resize.setElement);

}

//------------------------------------------------End Rotation (RVH)------------------------------//

function pointInRect(self, offset) {
    var xo = parseInt(self.getAttribute("x"));
    var yo = parseInt(self.getAttribute("y"));
    var x =  parseInt(self.getAttribute("width"))+xo;
    var y =  parseInt(self.getAttribute("height"))+yo;
    return (xo < offset.x) && (yo < offset.y) && (x > offset.x) && (y > offset.y);
}

function getListPins(part) {
    var pins = [];
    var x = parseInt(part.getAttribute("x"));
    var y = parseInt(part.getAttribute("y"));

    var collection = part.children;
    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        switch (elem.getAttribute("name")) {
        case "pin":
            var p = getArrayPoints(elem);
            pins.push({
                x: p[0].x + x,
                y: p[0].y + y,
                xo:((p[0].x+p[1].x)/2)+x,
                yo:((p[0].y+p[1].y)/2)+y,
                typeXDir: p[0].x == p[1].x,
                elem: elem
            });
            break;
        }
    }

   if ((part.getAttribute("model") == 'MOSFET(N)' || part.getAttribute("model") == 'MOSFET(P)') && (pins.length == 3)) {
      pins.push(pins[2]);
    }

    return pins;
}

function updateRefParts() {
    var s = document.querySelectorAll('[name="ref"]');
    for (var i = 0; i < s.length; i++) {
        //if(s[i].getAttribute("class")=='var'){
        var parElem = s[i].parentElement;
        if (parElem.getAttribute('sref')) {
            var ref = parElem.getAttribute('sref');
            s[i].textContent = ref;
        }
    }
}



function addName(part) {
    var s = document.getElementsByClassName('part');
    var sym=JSON.parse(part.firstChild.getAttribute("symbol"));
    var x = sym.reference;
    
    var n = 1;
    var i = 0;
    var newName = x+n;
    
    while (i < s.length - 1) {
        var p = s[i].getAttribute('sref');
        if (p == newName) {
            n++;
            newName = x+n;
            i = -1;
        }
        i++;
    }

 //   if((sym.device.type=='std') && sym.name=='GND')
  //      newName='0';
    
    part.setAttribute("sref", newName);
    part.setAttribute("directory", drawing.dir);
    updateRefParts();
}


function controlRefSymbol() {
    var result=false;
    if(drawing.pageType=='sym'){
    var s = document.querySelector('[name="ref"]');
   
    if(drawing.symbol.reference.length>0)
    {
       if(drawing.symbol.reference[0] != Ref[drawing.symbol.device.name]) 
       {
        drawing.symbol.reference = Ref[drawing.symbol.device.name] + drawing.symbol.reference.substring(1);
        result=true;
       }
    } else {
            drawing.symbol.reference = Ref[drawing.symbol.device.name];
            result=true;
    }

    if(s)      
        s.textContent = drawing.symbol.reference+ '?';
  }
  return result;
}

function controlPartRef(part) {

   var sym=JSON.parse(part.firstChild.getAttribute("symbol"));
    var modelname=sym.device.name;
    var partRef = part.getAttribute('sref');
  

        if( partRef.length>1)
        {
            if(partRef[0] != Ref[modelname]) 
              {
               partRef = Ref[modelname] + partRef.substring(1); 
               var collection = part.children;
               for (var i = 0; i < collection.length; i++)
               {
                   console.log(collection[i].getAttribute("name"));
                   if (collection[i].getAttribute("name") == "ref") {
                       collection[i].textContent = partRef;
                   }
                }
                part.setAttribute('sref', partRef);
               return true;
              }
        } else {
          
            var parts = document.getElementsByClassName('part');
            var x = sym.reference;
            var n = 1;
            var i = 0;
            partRef = x + n;
            while (i < parts.length - 1) {
                var p = parts[i].getAttribute('sref');
                if ((p == partRef)) {
                    n++;
                    partRef= x + n;
                    i = -1;
                }
                i++;
            }
            part.setAttribute('sref', partRef);
            var collection = part.children;
            for (var i = 0; i < collection.length; i++)
                if (collection[i].getAttribute("name") == "ref") {
                    collection[i].textContent = partRef;
                }
            return true;
    }
    
    var collection = part.children;
               for (var i = 0; i < collection.length; i++)
               {
                   console.log(collection[i].getAttribute("name"));
                   if (collection[i].getAttribute("name") == "ref") {
                       collection[i].textContent = partRef;
                   }
                }

    return false;
}

function controlRefPart(refElem) {
     
   
     if(drawing.pageType=='sym') {
   

         if(refElem.textContent[0] != Ref[drawing.symbol.device.name]) 
           refElem.textContent = Ref[drawing.symbol.device.name] + refElem.textContent.substring(1);
           refElem.textContent = refElem.textContent.replace('?', '');
           drawing.symbol.reference = refElem.textContent;
           refElem.textContent = drawing.symbol.reference + '?';
    
    } else if((drawing.pageType!='sym')) {
      
        var parElem = refElem.parentElement;
        var ref = refElem.textContent;
        var sym=JSON.parse(parElem.firstChild.getAttribute("symbol"));
        var modelname=sym.device.name;

        if( ref.length>1)
        {
            if(ref[0] != Ref[modelname]) 
              {
               ref = Ref[modelname] + ref.substring(1); 
               refElem.textContent = ref;
              }
        } else {
            ref = Ref[modelname];
            var parts = document.getElementsByClassName('part');
            var x = sym.reference;
            var n = 1;
            var i = 0;
            ref = x + n;
            while (i < parts.length - 1) {
                var p = parts[i].getAttribute('sref');
                if ((p == ref) && (parts[i]!= parElem)) {
                    n++;
                    ref= x + n;
                    i = -1;
                }
                i++;
            }
        }

        parElem.setAttribute('sref', ref);
        refElem.textContent = ref;
    }
}

function getPartModel(part) {

    var symbol=JSON.parse(part.firstChild.getAttribute("symbol"));

    if((symbol==null) || (symbol.device==null)) {
        symbol={name:"New Symbol",reference:"X",device:{type:"SPICE",name:"None"},model:{name:"None",file:"None",dir:"None",local:false},description:{webPage:'',info:''}};
        symbol.device={type:"SPICE",name:part.getAttribute("model")}
        symbol.name=part.getAttribute("model");
        var collection = part.children;
        for (var i = 0; i < collection.length; i++){
                   if (collection[i].getAttribute("name") == "modelSpice") {
                       var c = collection[i];
                       symbol.model={name:c.getAttribute('modelname'),file:c.getAttribute('modelfile'),dir:"library",local:true};
                       break;
                   }
         }
        part.firstChild.setAttribute("symbol", JSON.stringify(symbol));  
        }
               
    return symbol;
              
}

function  setPartModel(part, sym) {
    part.firstChild.setAttribute("symbol", JSON.stringify(sym)); 
    var collection = part.children;
    for (var i = 0; i < collection.length; i++)
               {
                   if (collection[i].getAttribute("name") == "modelSpice") {
                       var c = collection[i];
                       c.setAttribute('modelname', sym.model.name);
                       c.setAttribute('modelfile', sym.model.file);
                       c.textContent = sym.model.name;
                       break;
                   }
                }
}




