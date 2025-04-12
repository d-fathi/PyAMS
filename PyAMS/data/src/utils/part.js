/*
#-------------------------------------------------------------------------------
# Name:        part.js
# Author:      d.fathi
# Created:     08/08/2021
# Update:      27/08/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free
#-------------------------------------------------------------------------------------------------
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
            print(xo);
            print(yo);

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
        case 'label':
        case 'ref':
            var x = parseFloat(elem.getAttribute("x")) - xmin;
            var y = parseFloat(elem.getAttribute("y")) - ymin;
            elem.setAttribute("x", x);
            elem.setAttribute("y", y);
            elem.setAttribute("class", "var");
            var r = elem.getAttribute("r");
            elem.setAttribute("transform", 'rotate(' + r + ' ' + x + ' ' + y + ')');
           if(elem.getAttribute("name")=='label')
                elem.textContent =' ';
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
    updateRefParts()
}

function addLabToPart(){
    if(!itPartSelect()) 
          return;
   
    var elem = drawing.resize.setElement;
    var els = elem.children;
    for(var i=0; i<els.length; i++)
       if(els[i].getAttribute("name")=='label') 
          return;

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
    elem.appendChild(newElement);
    updateLableOfParts();
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

                    /* e.setAttribute("cx",cy);
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

}

//------------------------------------------------End Rotation (RVH)------------------------------//

function pointInRect(self, offset) {
    var xo = parseInt(self.getAttribute("x"));
    var yo = parseInt(self.getAttribute("y"));
    var x = parseInt(self.getAttribute("width")) + xo;
    var y = parseInt(self.getAttribute("height")) + yo;
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
                typeXDir: p[0].x == p[1].x,
                elem: elem
            });
            break;
        }
    }
    return pins;
}

function updateRefParts() {
    var s = document.getElementsByName('ref');
    for (var i = 0; i < s.length; i++) {
        //if(s[i].getAttribute("class")=='var'){
        var parElem = s[i].parentElement;
        if (parElem.getAttribute('sref')) {
            var ref = parElem.getAttribute('sref');
            s[i].textContent = ref;
        }
    }
}

function updateLableOfParts(){
   if((drawing.pageType=='sym') || typePyAMS) return;

   var s = document.getElementsByName('label');

   for (var i = 0; i < s.length; i++) {
         var parElem = s[i].parentElement;
         var model=parElem.getAttribute("model");
         var type_=parElem.firstChild.getAttribute("type");
         if(model=="standard")
            s[i].textContent =type_;
         else 
            s[i].textContent =model;
    }
}

function addName(part) {
    var s = document.getElementsByName('part');
    var x = part.firstChild.getAttribute("reference");
    var model=part.firstChild.getAttribute("model");
    var n = 1;
    var i = 0;
    var newName = x + n;

    while (i < s.length - 1) {
        var p = s[i].getAttribute('sref');
        if (p == newName) {
            n++;
            newName = x + n;
            i = -1;
        }
        i++;
    }

    part.setAttribute("sref", newName);
    part.setAttribute("directory", drawing.dir);
    part.setAttribute("liblocale", drawing.libLocale);
    part.setAttribute("modelname", drawing.modelname);
    part.setAttribute("model", model);
    updateRefParts();

 
}

//***********************************get & set modified params of part***************************************************
function findParamGetValue(params, nameVal, val) {
    var t = params.split(' ');
    for (var i = 0; i < t.length; i++) {
        var k = t[i].split('=')
            if (k.length == 2) {
                if (k[0] == nameVal)
                    val = k[1]
            }
    }
    return val;
}
function setParams(p) {
    if (mtable.select.getAttribute("name") == 'part') {
        mtable.select.setAttribute("lparam", p);
        var elem = mtable.select;
        var collection = mtable.select.children;
        for (var i = 0; i < collection.length; i++)
            if (collection[i].getAttribute("name") == "param") {

                var arr = collection[i].textContent.split("=");
                arr[1] = findParamGetValue(p, arr[0], arr[1]);
                collection[i].textContent = arr[0] + '=' + arr[1];
            }
    }
}

function getParams() {
    var lparam = ' ';
    if (mtable.select.getAttribute("name") == 'part') {

        if (mtable.select.getAttribute("lparam"))
            lparam = mtable.select.getAttribute("lparam");

        var collection = mtable.select.children;
        for (var i = 0; i < collection.length; i++)
            if (collection[i].getAttribute("name") == "param")
                lparam = lparam + '  ' + collection[i].textContent;
    }

    return lparam;
}


//************************************* part info *********************************************************
function partInfo(){

   /*var result=['',''];
   if (drawing.resize.setElement) {
        var elem = drawing.resize.setElement;
        if (elem.getAttribute("name") == 'part') {
          var description = elem.firstChild.getAttribute("description");
          try {  
            description  = JSON.parse(description);
            result= [description.webPage,description.info]
        }
          catch(err) { description={webPage:'',info:''}; }
          result= [description.webPage,description.info]
        }
    }
    window.foo.partInfo(result); 
    */
}




//*****************************************Part description *****************************/
function openEditor(modelname,directory){
    window.foo.getCode(modelname,directory)
}

function getPartPyAMSDescription(self) {


    
    mtable.table = [{
            name: 'Symbol.name',
            value: mtable.select.firstChild.getAttribute("symbolname"),
            type: "text",
            condition: [['readonly', 'true']]
        },{
            name: 'Symbol.file',
            value: mtable.select.getAttribute("modelname")+'.sym',
            type: "text",
            condition: [['readonly', 'true']]
        }, {
            name: 'Symbol.directory',
            value: mtable.select.getAttribute("directory"),
            type: "text",
            condition: [['readonly', 'true']]
        }, {
            name: 'Symbol.reference',
            value: mtable.select.getAttribute("sref"),
            type: "text"
        }, {
            name: 'Model.name',
            value: mtable.select.getAttribute("modelname"),
            type: "text",
            condition: [['readonly', 'true']],
   
        }, {
            name: 'Model.parameters',
            value: 'show',
            type: "Button",
            setClick: 'showParams()'
        }
		, {
            name: 'Model.file',
            value: 'show',
            type: "Button",
            setClick: 'openEditor("' + mtable.select.getAttribute("modelname") + '","' +mtable.select.getAttribute("directory")+ '")'
        }
    ];
   

    self.creat();

}

function setPartPyAMSDescription(pos,e) {
    var collection = mtable.select.children;
    switch (pos) {
    case 3:
        mtable.select.setAttribute("sref", e.value);
        break;
    }

    for (var i = 0; i < collection.length; i++)
        if (collection[i].getAttribute("name") == "ref") {
            collection[i].textContent = mtable.select.getAttribute("sref");
        }

    if (pos >= 3) {
        var desc = mtable.table[pos]
            collection[desc.pos].textContent = desc.param + '=' + e.value;
    }

}

//**************************************

function netListPins(part) {

    var pins = getListPins(part);
    var listPinsName = [];

    for (var i = 0; i < pins.length; i++)
        if (pins[i].elem.childNodes[1].style.display == "none") {
            var netId = pins[i].elem.getAttribute('netId');
            var elemNet = document.getElementById(netId);
            listPinsName.push(elemNet.getAttribute("ref"));
        } else
            listPinsName.push('0');
    return listPinsName;
}

function getListParams(part) {
    

        function inParam_(s, v) {
            var d = s.split(' ');
            var k = v.split('=');
            var used = false;
            for (var i = 0; i < d.length; i++) {
                var r = d[i].split('=');
                if (r.length == 2)
                    if (r[0] == k[0]) {
                        d[i] = v;
                        used = true;
                    }
    
            }
            if (!used)
                d.push(v);
    
            return d.join(' ');
        }
    
        var lparam = ' ';
        var collection = part.children;
        if (part.getAttribute("lparam"))
            lparam = part.getAttribute("lparam");
    
    
        for (var i = 0; i < collection.length; i++)
            if (collection[i].getAttribute("name") == "param")
                lparam = inParam_(lparam,collection[i].textContent);
    
        return lparam;

}

function netList() {

    var parts = document.getElementsByName('part');
    var list = [];
    for (var i = 0; i < parts.length; i++)
        if (!strToBool(parts[i].firstChild.getAttribute('std'))) {
            list.push({
                symbolname: parts[i].getAttribute('modelname'),
                model: parts[i].getAttribute('model'),
                type: parts[i].firstChild.getAttribute('type'),
                ref: parts[i].getAttribute('sref'),
                directory: parts[i].getAttribute('directory'),
                pins: netListPins(parts[i]),
                params: getListParams(parts[i])
            });
        }
    return list;
}


///******************************

function addVarToPart(x, y, text_, par) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    var xo = x - 2;
    var yo = y - 2;
    var x1 = x - 2;
    var y1 = y + 2;
    var x2 = x + 2;
    var y2 = y + 3;

    newElement.setAttribute('name', par);
    newElement.setAttribute('x', x);
    newElement.setAttribute('y', y);
    var newElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
    newElement1.setAttribute("points", xo + "," + yo + " " + x + "," + y + " " + x1 + "," + y1);
    newElement1.style.stroke = "#ff0000";
    newElement1.style.fill = "none";
    newElement1.style.strokeWidth = "1px";
    newElement.appendChild(newElement1);

    var newElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    newElement3.style.fontSize = "8px";
    newElement3.style.fontFamily = "Times New Roman";
    newElement3.style.display = "block";
    newElement3.setAttribute('x', x2);
    newElement3.setAttribute('y', y2);
    newElement3.textContent = text_;
    newElement3.setAttribute('transform', 'rotate(0 ' + x2 + ' ' + y2 + ')');
    newElement.appendChild(newElement3);

    if (par == 'outvar') {
        e = newElement.childNodes[1];
        var bbox = e.getBBox();
        var w = bbox.width;
        var h = bbox.height;
        x2 = x2 - w;
        e.setAttribute('transform', 'rotate(0 ' + x2 + ' ' + y2 + ')');
    }

    if (par == 'outvar') {

        var newElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        newElement2.style.stroke = "#000000";
        newElement2.style.fill = "#000000";
        newElement2.style.strokeWidth = "1px";
        newElement2.setAttribute("width", 4);
        newElement2.setAttribute("height", 4);
        newElement2.setAttribute("x", 0);
        newElement2.setAttribute("y", 0);

        newElement.appendChild(newElement2);

    } else {

        var newElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        newElement1.setAttribute("points", xo + "," + yo + " " + x + "," + y + " " + x1 + "," + y1);
        newElement1.style.stroke = "#000000";
        newElement1.style.fill = "#000000";
        newElement1.style.strokeWidth = "1px";
        newElement.appendChild(newElement1);
    }

    return newElement;
}

function addParmInOut() {
    if (drawing.resize.setElement) {
        elem = drawing.resize.setElement;
        var name = elem.getAttribute("name");
        if (name == 'part') {
            w = parseInt(elem.getAttribute("width"));
            h = parseInt(elem.getAttribute("height"));

            var collection = elem.children;

            var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            newElement.setAttribute("name", "addparam");
            newElement.setAttribute("type", "simple");
            newElement.setAttribute("width", w);
            newElement.setAttribute("height", h);

            var newElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            newElement2.style.stroke = "#bbbbbb";
            newElement2.style.fill = "#bbbbbb";
            newElement2.style.strokeWidth = "1px";
            newElement2.setAttribute("width", w - 3);
            newElement2.setAttribute("height", h - 3);
            newElement2.setAttribute("x", -3);
            newElement2.setAttribute("y", -3);

            newElement.appendChild(newElement2);

            var newElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            newElement2.style.stroke = "#000000";
            newElement2.style.fill = "#ffffff";
            newElement2.style.strokeWidth = "1px";
            newElement2.setAttribute("width", w);
            newElement2.setAttribute("height", h);
            newElement2.setAttribute("x", 0);
            newElement2.setAttribute("y", 0);

            newElement.appendChild(newElement2);

            for (var i = 0; i <= 10; i++)
                newElement.appendChild(addVarToPart(0, 5 + 10 * i, 'In' + i, 'invar'));

            for (var i = 0; i <= 10; i++)
                newElement.appendChild(addVarToPart(w, 5 + 10 * i, 'Out' + i, 'outvar'));
            elem.insertBefore(newElement, elem.firstChild);

            updateInOutVar(elem.firstChild);

        }
    }
}

function setVarPos(x, y, par, elem) {

    var xo = x - 5;
    var yo = y - 5;
    var x1 = x - 5;
    var y1 = y + 5;
    var x2 = x + 2;
    var y2 = y + 3;

    elem.setAttribute('name', par);
    elem.setAttribute('x', x);
    elem.setAttribute('y', y);

    var e = elem.childNodes[0];
    e.setAttribute("points", xo + "," + yo + " " + x + "," + y + " " + x1 + "," + y1);
    e.style.stroke = "#ff0000";
    e.style.fill = "none";
    e.style.strokeWidth = "1px";

    var e = elem.childNodes[1];
    e.setAttribute('x', x2);
    e.setAttribute('y', y2);
    e.setAttribute('transform', 'rotate(0 ' + x2 + ' ' + y2 + ')');

    if (par == 'outvar') {
        var bbox = e.getBBox();
        var w = bbox.width;
        var h = bbox.height;
        var x3 = x2 - w - 8;
        e.setAttribute('x', x3);
        e.setAttribute('transform', 'rotate(0 ' + x3 + ' ' + y2 + ')');
    }

    var xo = x - 5;
    var yo = y - 5;
    var x1 = x - 5;
    var y1 = y + 5;

    var e = elem.childNodes[2];

    if (par == 'outvar') {
        e.setAttribute("x", x);
        e.setAttribute("y", y - 2);
    }

    e.setAttribute("points", xo + "," + yo + " " + x + "," + y + " " + x1 + "," + y1);

}

function updateInOutVar(elem) {
    var collection = elem.children;
    w = parseInt(elem.children[1].getAttribute("width"));
    h = parseInt(elem.children[1].getAttribute("height"));

    x = parseInt(elem.children[1].getAttribute("x"));
    y = parseInt(elem.children[1].getAttribute("y"));
    var in_ = 0;
    var out_ = 0;
    for (var i = 0; i < collection.length; i++) {
        if (collection[i].getAttribute('name') == 'invar') {
            setVarPos(x, y + 5 + 15 * in_, 'invar', collection[i]);
            in_++;
        }

        if (collection[i].getAttribute('name') == 'outvar') {
            setVarPos(x + w, y + 5 + 15 * out_, 'outvar', collection[i]);
            out_++;
        }

    }
    mh = Math.max(5 + 15 * in_, 5 + 15 * out_);
    if (h <= mh) {
        elem.children[0].setAttribute("height", mh - 3);
        elem.children[1].setAttribute("height", mh);
    }

}

function getListVars(part) {
    var vars = [];
    var x = parseInt(part.getAttribute("x"));
    var y = parseInt(part.getAttribute("y"));

    var e = part.firstChild;
    if (e.getAttribute("name") != "addparam")
        return vars;
    updateInOutVar(e);

    var collection = part.firstChild.children;
    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        name_ = elem.getAttribute("name");
        switch (name_) {
        case "invar":
        case "outvar":

            var x0 = parseInt(elem.getAttribute("x"));
            var y0 = parseInt(elem.getAttribute("y"));
            vars.push({
                x: x0 + x,
                y: y0 + y,
                typeXDir: false,
                typeIn: name_ == "invar",
                elem: elem
            });
            break;
        }
    }
    return vars;
}

function getTypeElemPart(self) {
    var e = self.setElement.firstChild;
    if (e.getAttribute("name") == "addparam") {
        self.type = 1;
        self.length = 4;
    } else {
        self.type = 0;
        self.length = 0;
    }
}

function initPosInPart(self) {
    var e = self.setElement.firstChild;
    if (e.getAttribute("name") != "addparam")
        return;
    var x = parseInt(self.setElement.getAttribute("x"));
    var y = parseInt(self.setElement.getAttribute("y"));
    var r = e.children[1];
    self.type = 1;

    self.width = parseInt(r.getAttribute("width"));
    self.height = parseInt(r.getAttribute("height"));
    self.ellps[0].x = x + parseInt(r.getAttribute("x"));
    self.ellps[0].y = y + parseInt(r.getAttribute("y"));

}

function updatePosInPart(self) {
    var e = self.setElement.firstChild;
    if (e.getAttribute("name") != "addparam")
        return;
    var x =  - parseInt(self.setElement.getAttribute("x")) + self.ellps[0].x;
    var y = -parseInt(self.setElement.getAttribute("y")) + self.ellps[0].y;
    var r = e.children[1];
    r.setAttribute("width", Math.abs(self.ellps[0].x - self.ellps[2].x));
    r.setAttribute("height", Math.abs(self.ellps[0].y - self.ellps[3].y));
    r.setAttribute("x", x);
    r.setAttribute("y", y);
    var r = e.children[0];
    r.setAttribute("width", Math.abs(self.ellps[0].x - self.ellps[2].x) - 3);
    r.setAttribute("height", Math.abs(self.ellps[0].y - self.ellps[3].y) - 3);
    r.setAttribute("x", x - 3);
    r.setAttribute("y", y - 3);
    updateInOutVar(e);

}
