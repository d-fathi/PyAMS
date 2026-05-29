/*
#-------------------------------------------------------------------------------
# Name:         modifiedSelect.js
# Author:       d.fathi
# Created:      18/07/2021
# Last update:   17/05/2026
# Copyright:   (c) PyAMS 2026
# Licence:     free
#-------------------------------------------------------------------------------
*/

/*const { read } = require("original-fs");*/

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

function deleteEllipseMS(self) {
    for (var i = 0; i < self.ellps.length; i++) {
        var element = document.getElementById(self.ellps[i].id);
        element.parentNode.removeChild(element);
    }
    self.ellps = [];
}

//-------Page and symbol description   -----------------------------


function getDescription(self,elemSelect){
    self.drawing.objectInspector.getSelect(elemSelect);
}



function pageSelect(self) {

    defaultData = {
        header: { title: "Page design", subtitle: "Selected Objects  1" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Page.width  (px)", type: "number", value: mtable.select.width },
                    { label: "Page.height (px)", type: "number", value: mtable.select.height }
                ]
            }
        ]
    };


    if(drawing.pageType=="sym"){
        defaultData.header.title = "Symbol design";
        defaultData.sections[0].title = "Symbol Properties";
        defaultData.sections[0].rows.push(
            { label: "Model.name", type: "text", value: drawing.symbol.model },
            { label: "Model.reference", type: "text", value: drawing.symbol.reference },
            { label: "Model.destination", type: "dropdown", value: drawing.symbol.destination, options: ["local", "project"] },
            { label: "Model.file", type: "Button", value: 'Show Model', setClick:'findModelFromSymbolEditor()'},
        );
    }
  
    mtable.type = "page";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function pageModified() {
mtable.select.width = propertiesData.sections[0].rows[0].value;
mtable.select.height = propertiesData.sections[0].rows[1].value;
 if(drawing.pageType=="sym"){
    drawing.symbol.model = propertiesData.sections[0].rows[2].value;
    drawing.symbol.reference = propertiesData.sections[0].rows[3].value;
    drawing.symbol.destination= propertiesData.sections[0].rows[4].value;
 }
mtable.select.pageSize(mtable.select.width, mtable.select.height);
}


//-------Rectangle description ---------------------------------------------------
function rectSelect() {

        defaultData = {
        header: { title: "Rectangle", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Width  (px)", type: "number", value: parseInt(mtable.select.getAttribute("width")) },
                    { label: "Height (px)", type: "number", value: parseInt(mtable.select.getAttribute("height")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Fill", type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "rect";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedRect() {
    var rect = mtable.select;

    rect.setAttribute("width", propertiesData.sections[0].rows[0].value);
    rect.setAttribute("height", propertiesData.sections[0].rows[1].value);
    rect.setAttribute("x", propertiesData.sections[0].rows[2].value);
    rect.setAttribute("y", propertiesData.sections[0].rows[3].value);
    rect.style.stroke = propertiesData.sections[0].rows[4].color;
    rect.style.fill = propertiesData.sections[0].rows[5].color;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Ellipse description ---------------------------------------------------

function ellipseSelect() {
        defaultData = {
        header: { title: "Ellipse", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Radius x axis", type: "number", value: parseInt(mtable.select.getAttribute("rx")) },
                    { label: "Radius y axis", type: "number", value: parseInt(mtable.select.getAttribute("ry")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("cx")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("cy")) },
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Fill", type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "ellipse";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedEllipse() {
    var ellipse = mtable.select;
    ellipse.setAttribute("rx", propertiesData.sections[0].rows[0].value);
    ellipse.setAttribute("ry", propertiesData.sections[0].rows[1].value);
    ellipse.setAttribute("cx", propertiesData.sections[0].rows[2].value);
    ellipse.setAttribute("cy", propertiesData.sections[0].rows[3].value);
    ellipse.style.stroke = propertiesData.sections[0].rows[4].color;
    ellipse.style.fill = propertiesData.sections[0].rows[5].color;
   // ellipse.style.fillOpacity = propertiesData.sections[0].rows[5].opacity;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
       mtable.resize.creatEllipse();
}

//--arc description ---------------------------------------------------


function arcSelect() {
        defaultData = {
        header: { title: "Arc", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Radius x axis", type: "number", value: parseInt(mtable.select.getAttribute("rx")) },
                    { label: "Radius y axis", type: "number", value: parseInt(mtable.select.getAttribute("ry")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("cx")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("cy")) },
                    { label: "Start angle(°)", type: "number", value: getDeg(mtable.select.getAttribute("startangle")) },
                    { label: "End angle(°)", type: "number", value: getDeg(mtable.select.getAttribute("endangle")) },
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "arc";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedArc() {
    var arc = mtable.select;
    arc.setAttribute("rx", propertiesData.sections[0].rows[0].value);
    arc.setAttribute("ry", propertiesData.sections[0].rows[1].value);
    arc.setAttribute("cx", propertiesData.sections[0].rows[2].value);
    arc.setAttribute("cy", propertiesData.sections[0].rows[3].value);
    arc.setAttribute("startangle", propertiesData.sections[0].rows[4].value * 3.14 / 180);
    arc.setAttribute("endangle", propertiesData.sections[0].rows[5].value * 3.14 / 180);
    arc.style.stroke = propertiesData.sections[0].rows[6].color;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}

//---Polyline description ---------------------------------------------------

function polylineSelect() {
    defaultData = {
        header: { title: "Polyline", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "polyline";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function polylineModified() {
    mtable.select.style.stroke = propertiesData.sections[0].rows[0].color;
    modifiedEvent();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
         mtable.resize.creatEllipse();
}

//--Polygon description ---------------------------------------------------


function polygonSelect() {
    defaultData = {
        header: { title: "Polygon", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Fill", type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "polygon";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function polygonModified() {
    mtable.select.style.stroke = propertiesData.sections[0].rows[0].color;
    mtable.select.style.fill = propertiesData.sections[0].rows[1].color;
    modifiedEvent();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
         mtable.resize.creatEllipse();
}
//--Net description ---------------------------------------------------

/*
function netSelect() {
    mtable.typeSelect = 'net';
    if(!mtable.select.getAttribute("diagonal"))
       mtable.select.setAttribute("diagonal",'false');
    mtable.table = [{
            name: "Stroke",
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        }, {
            name: 'Reference',
            value: mtable.select.getAttribute("ref"),
            type: "text"
        }, {
           name: 'Diagonal',
           value: mtable.select.getAttribute("diagonal"),
           type: "select",
           array: ['true','false']

       }
    ]
}  //Diagonal

function netModified(pos,e) {

    var px = mtable.px;
    switch (pos) {
    case 0:
        mtable.select.setAttribute("setcolor", e.value);
        mtable.select.setAttribute("parentcolor", true);
        getNetRef();
        refSelectedColorNet(mtable.select);
        refNetWithPart();
        break;
    case 1:
        mtable.select.setAttribute("setref", e.value);
        mtable.select.setAttribute("parent", true);
        refNetWithPart();
        break;
    case 2:
          mtable.select.setAttribute("diagonal", e.value);
        break;
    }

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}
*/

function netSelect() {
    defaultData = {
        header: { title: "Net", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: 'Reference', type: "text", value: mtable.select.getAttribute("ref") },
                    { label: 'Diagonal',  type: "dropdown", value: mtable.select.getAttribute("diagonal"), options: ['false', 'true'] }
                ]
            }
        ]
    };

    mtable.type = "net";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}   

function netModified() {
    
    
    mtable.select.setAttribute("diagonal", propertiesData.sections[0].rows[2].value);
    getNetRef();
    if(rgb2hex(mtable.select.style.stroke) != propertiesData.sections[0].rows[0].color) {
         mtable.select.setAttribute("setcolor", propertiesData.sections[0].rows[0].color);
        mtable.select.setAttribute("parentcolor", true);
        refSelectedColorNet(mtable.select);
    }

    if(mtable.select.getAttribute("ref")!=propertiesData.sections[0].rows[1].value){
        mtable.select.setAttribute("parent", true);
        mtable.select.setAttribute("setref", propertiesData.sections[0].rows[1].value);
        refNetWithPart();
    }
    
    deleteEllipseMS(mtable.resize);
        if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}

//-------Reference description-------------------------------------

function refSelected() {
   
    defaultData = {
        header: { title: "Reference", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.style.fontSize) },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.style.fontFamily, options: fontAvailable },
                    { label: 'Pos.x', type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: 'Pos.y', type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: 'Fill', type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: 'Reference', type: "text", value: mtable.select.textContent }
                ]
            }
        ]
    };  

    mtable.type = "ref";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function refModified() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[3].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[4].color;
    mtable.select.textContent = propertiesData.sections[0].rows[5].value;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}



//-------Paramater description-------------------------------------


function paramSelected() {
    mtable.select.p = mtable.select.textContent.split("=");
    defaultData = {
        header: { title: "Parameter", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.style.fontSize) },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.style.fontFamily, options: fontAvailable },
                    { label: 'Pos.x', type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: 'Pos.y', type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: 'Fill', type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: 'Parameter', type: "text", value: mtable.select.p[0] },
                    { label: 'Value', type: "text", value: mtable.select.p[1] }
                ]
            }
        ]
    };

    mtable.type = "param";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function paramModified() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[3].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[4].color;
    mtable.select.p[0] = propertiesData.sections[0].rows[5].value;
    mtable.select.p[1] = propertiesData.sections[0].rows[6].value;
    mtable.select.textContent = mtable.select.p[0] + '=' + mtable.select.p[1];
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}  

//-------Pin description ---------------------------------------------------

function pinSelect() {
    var r = getPinDescription(mtable.select)
        if (!mtable.select.childNodes[2].style.fill)
            mtable.select.childNodes[2].style.fill = 'RGB(0,0,0)';
    defaultData = {
        header: { title: "Pin", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Size', type: "number", value: parseInt(getPinDescription(mtable.select).size), condition: [['min', '3'], ['max', '25']] },
                    { label: 'Rotation', type: "dropdown", value: r.rotation, options: ['0°', '90°', '180°', '270°'] },
                    { label: 'Pos.x', type: "number", value: parseInt(r.x) },
                    { label: 'Pos.y', type: "number", value: parseInt(r.y) },
                    { label: 'Name', type: "text", value: r.text },
                    { label: 'Name.display', type: "dropdown", value: mtable.select.childNodes[2].style.display, options: ["none", "block"] },
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.childNodes[2].style.fontSize) },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.childNodes[2].style.fontFamily, options: fontAvailable },
                    { label: 'Font.color', type: "color", value: rgb2hex(mtable.select.childNodes[2].style.fill), color: rgb2hex(mtable.select.childNodes[2].style.fill) },
                    { label: 'Type', type: "dropdown", value: mtable.select.getAttribute("type"), options: ["simple", "dot", "clk", "dotclk", "input", "output"] },
                    { label: 'Polarity', type: "dropdown", value: r.polarity, options: ["positive", "negative", "mixed"] },
                    { label: 'Stroke', type: "color", value: rgb2hex(mtable.select.childNodes[0].style.stroke), color: rgb2hex(mtable.select.childNodes[0].style.stroke) }
                ]
            }
        ]
    };

    mtable.type = "pin";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedPin() {
    var pin = mtable.select;
    var points = getArrayPoints(mtable.select);
    function sign(a, b) {
        if (a > b)
            return 1;
        else if (a < b)
            return -1;
        else
            return 0;
    }
    var size = propertiesData.sections[0].rows[0].value;
    if (points[0].y == points[1].y)
        points[1].x = points[0].x + sign(points[1].x, points[0].x) * size;
    else if (points[0].x == points[1].x)
        points[1].y = points[0].y + sign(points[1].y, points[0].y) * size;
    mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
    switch (propertiesData.sections[0].rows[1].value) {
    case '0°':
        points[1].y = points[0].y;
        points[1].x = points[0].x + size;
        propertiesData.sections[0].rows[1].value = '0°';
        break;
    case '90°':
        points[1].x = points[0].x;
        points[1].y = points[0].y + size;
        propertiesData.sections[0].rows[1].value = '90°';
        break;
    case '180°':
        points[1].y = points[0].y;
        points[1].x = points[0].x - size;
        propertiesData.sections[0].rows[1].value = '180°';
        break;
    case '270°':
        points[1].x = points[0].x;
        points[1].y = points[0].y - size;
        propertiesData.sections[0].rows[1].value = '270°';
        break;
    }           
    mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
    mtable.select.childNodes[2].textContent = controlText(propertiesData.sections[0].rows[4].value);
    mtable.select.childNodes[2].style.display = propertiesData.sections[0].rows[5].value;
    mtable.select.childNodes[2].style.fontSize = propertiesData.sections[0].rows[6].value;
    mtable.select.childNodes[2].style.fontFamily = propertiesData.sections[0].rows[7].value;
    mtable.select.childNodes[2].style.fill = propertiesData.sections[0].rows[8].color;
    mtable.select.setAttribute("type", propertiesData.sections[0].rows[9].value);
    mtable.select.childNodes[3].textContent = getPolyText(propertiesData.sections[0].rows[9].value);
    mtable.select.childNodes[0].style.stroke = propertiesData.sections[0].rows[11].color;

    var points = getArrayPoints(mtable.select);
    var dx = points[1].x - points[0].x;
    var dy = points[1].y - points[0].y;
    points[0].x = parseInt(propertiesData.sections[0].rows[2].value);
    points[0].y = parseInt(propertiesData.sections[0].rows[3].value);
    points[1].x = points[0].x + dx;
    points[1].y = points[0].y + dy;
    mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));

    drawingPin(mtable.select);
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}

//-------Probe  description----------------------------------------------------------------


function probeSelect() {
    defaultData = {
        header: { title: "Probe", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "OP", type: "Button", value: 'Run ▶', setClick: 'ioProbe()' },
                    { label: "Pos", type: "Button", value: 'Show', setClick: 'ioPosProbe()' }           
                ]
            }
        ]
    };

    mtable.type = "probe";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function probeModified() {

    mtable.select.setAttribute("x", propertiesData.sections[0].rows[0].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[1].value);
    structProbe(mtable.select);
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}

//--


//-------Text description ---------------------------------------------------
//https://htmldog.com/references/css/properties/font-weight/
/*function textSelect() {
 
    mtable.typeSelect = 'text';
    mtable.table = [{
            name: 'Font.size',
            value: parseInt(mtable.select.style.fontSize),
            type: "number"
        }, {
            name: 'Font.family',
            value: mtable.select.style.fontFamily,
            type: "select",
            array: fontAvailable

        }, {
            name: 'Font.weight',
            value: mtable.select.style.fontWeight,
            type: "select",
            array: ['normal', 'bold', 'bolder', 'lighter']

        }, {
            name: 'Font.style',
            value: mtable.select.style.fontStyle,
            type: "select",
            array: ['normal', 'italic', 'oblique']

        }, {
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
        }, {
            name: 'Rotation',
            value: mtable.select.getAttribute("r") + "°",
            array: ['0°', '90°'], //, '180°', '270°'
            type: "select"
        }, {
            name: 'Fill',
            value: rgb2hex(mtable.select.style.fill),
            type: "color"
        }, {
            name: 'Text',
            value: mtable.select.textContent,
            type: "text"
        }
    ]
  

    if(!mtable.select.style.stroke){
        mtable.table.push({
            name: 'Stroke.used',
            value: 'false',
            array: ['false', 'true'], 
            type: "select"
        });
    } else
    {
        mtable.table.push({
            name: 'Stroke.used',
            value: 'true',
            array: ['false', 'true'], 
            type: "select"
        });

        mtable.table.push({
            name: 'Stroke',
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        });

        if(!mtable.select.style.strokeWidth)
            mtable.select.style.strokeWidth=0;

        mtable.table.push({
            name: 'Stroke.width',
            value: parseInt(mtable.select.style.strokeWidth),
            type: "number"
        });
    }


    addEventToTable();
}


function modifiedText(pos,e) {

    var px = mtable.px;

    switch (pos) {
    case 0:
        mtable.select.style.fontSize = e.value;
        break;
    case 1:
        mtable.select.style.fontFamily = e.value;
        break;
    case 2:
        mtable.select.style.fontWeight = e.value;
        break;
    case 3:
        mtable.select.style.fontStyle = e.value;
        break;
    case 4:
        mtable.select.setAttribute("x", e.value);
        setPosText();
        break;
    case 5:
        mtable.select.setAttribute("y", e.value);
        setPosText();
        break;
    case 6:
        mtable.select.setAttribute("r", e.value.replace('°', ''));
        setPosText();
        break;
    case 7:
        mtable.select.style.fill = e.value;
        break;
    case 8:
        mtable.select.textContent = e.value;
        break;
    case 9:
        if(e.value=='true')
            mtable.select.style.stroke='#000000';
        else
           mtable.select.style.stroke=null;
           textSelect();
           mtable.parent.creat();
           return;
        break;
    case 10:
        mtable.select.style.stroke = e.value;
        break
    case 11:
        mtable.select.style.strokeWidth=e.value;
        break;
    }
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}*/

function setPosText() {
    var x = mtable.select.getAttribute("x");
    var y = mtable.select.getAttribute("y");
    var r = mtable.select.getAttribute("r");
    mtable.select.setAttribute('transform', 'rotate(' + r + ' ' + x + ' ' + y + ')');
}

function textSelect(){
    defaultData = {
        header: { title: "Text", subtitle: "Selected Objects" },
        sections: [ {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.style.fontSize) },
                    { label: 'Font.weight', type: "dropdown", value: mtable.select.style.fontWeight, options: ['normal', 'bold', 'lighter', 'bolder'] },
                    { label: 'Font.style', type: "dropdown", value: mtable.select.style.fontStyle, options: ['normal', 'italic', 'oblique'] },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.style.fontFamily, options: fontAvailable },
                    { label: 'Pos.x', type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: 'Pos.y', type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: 'Rotation', type: "dropdown", value: mtable.select.getAttribute("r") + "°", options: ['0°', '90°'] },
                    { label: 'Fill', type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: 'Text', type: "text", value: mtable.select.textContent },
                    { label: 'Stroke.used', type: "dropdown", value: mtable.select.style.stroke ? 'true' : 'false', options: ['false', 'true'] },
                    { label: 'Stroke.width', type: "number", value: mtable.select.style.strokeWidth}
                ]
             }
        ]
     };

    mtable.type = "text";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedText() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.style.fontStyle = propertiesData.sections[0].rows[2].value;
    mtable.select.style.fontWeight = propertiesData.sections[0].rows[3].value;
    mtable.select.setAttribute("r", propertiesData.sections[0].rows[6].value.replace('°', ''));
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[4].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[5].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[7].color;
    mtable.select.textContent = propertiesData.sections[0].rows[8].value;
    if(propertiesData.sections[0].rows[9].value=='true' && !mtable.select.style.stroke)
        mtable.select.style.stroke='#000000';
    else if(propertiesData.sections[0].rows[9].value=='false' && mtable.select.style.stroke)
        mtable.select.style.stroke=null;
    mtable.select.style.strokeWidth = propertiesData.sections[0].rows[10].value;
    setPosText();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}


//-------codePy description ---------------------------------------------------
function codePySelect() {

        defaultData = {
        header: { title: "CodePy", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Width  (px)", type: "number", value: parseInt(mtable.select.getAttribute("width")) },
                    { label: "Height (px)", type: "number", value: parseInt(mtable.select.getAttribute("height")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "CodePy", type: "Button", value: 'Show Model', setClick:'openEditCodePy()' }
                ]
            }
        ]
    };

    mtable.type = "codePy";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();


}

function modifiedcodePy() {

  var codePy_= mtable.select;

    codePy_.setAttribute("width", propertiesData.sections[0].rows[0].value);
    codePy_.setAttribute("height", propertiesData.sections[0].rows[1].value);
    codePy_.setAttribute("x", propertiesData.sections[0].rows[2].value);
    codePy_.setAttribute("y", propertiesData.sections[0].rows[3].value);


    modifedSizeCodePy(mtable.select);
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
     mtable.resize.creatEllipse();
}


function partSelect() {
    var part = mtable.select;

    if(mtable.select.getAttribute("directory")=='standard'){
         defaultData = {
        header: { title: "Part", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Symbol.name", type: "text", value: part.firstChild.getAttribute("symbolname"), readonly: true },
                    { label: "Symbol.file", type: "text", value: part.getAttribute("directory"), readonly: true }
                ]
            }
        ]
    };
    }else{
    defaultData = {
        header: { title: "Part", subtitle: "Selected Objects" },
        sections: [
            {
                title: "Symbol Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Name", type: "text", value: part.firstChild.getAttribute("symbolname"), readonly: true },
                    { label: "File", type: "text", value: part.getAttribute("symbolfile"), readonly: true },
                    { label: "Directory", type: "text", value: part.getAttribute("directory") },
                    { label: "Local library", type: "text", value: part.getAttribute("liblocale"), readonly: true },
                    { label: "Reference", type: "text", value: part.getAttribute("sref") }
                ]
            },
                        {
                title: "Model Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Name", type: "text", value: part.getAttribute("model"), readonly: true },
                    { label: "Parameters", type: "Button", value: 'show', setClick: 'showParams()' },
                    { label: "File", type: "Button", value: 'show', setClick: 'openEditor("' + part.getAttribute("model") + '","' + part.getAttribute("directory") + '")' }
                ]
            }
        ]
    };
    }

    mtable.type = "part";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedPart() {
    console.log("modified part");
    var part = mtable.select;
    part.setAttribute("directory", propertiesData.sections[0].rows[2].value);
    part.setAttribute("sref", propertiesData.sections[0].rows[4].value);

    var collection = mtable.select.children;
    for (var i = 0; i < collection.length; i++)
        if (collection[i].getAttribute("name") == "ref") {
            collection[i].textContent = mtable.select.getAttribute("sref");
        }

}

//-------analysis description ---------------------------------------------------

function colorOutput(n,e){
    console.log(n, e.value);
	var analy=JSON.parse(mtable.select.getAttribute("description"));
	if(n==-1)
	{
		analy.xAxe.color=e.value;
	}
	else {
		analy.yAxe.outputs[n].color=e.value;
	}
	mtable.select.setAttribute("description", JSON.stringify(analy));
}

function removeOutput(n){
	var analy=JSON.parse(mtable.select.getAttribute("description"));
	if(n==-1)
	{
		analy.xAxe.used=false;
	}
	else {
		analy.yAxe.outputs.splice(n, 1);
	}
	mtable.select.setAttribute("description", JSON.stringify(analy));
	analysisSelect();
}


function analysisSelect() {

        var analy=JSON.parse(mtable.select.getAttribute("description"));
        
        defaultData = {
        header: { title: "Analysis Description", subtitle: "Selected Objects" },
        sections: [
            { title: "Analysis Properties",
              collapsed: false,
              showReset: true,
                rows: [ { label: 'Simulation', type: "dropdown", value: analy.type, options: ['DC Sweep', 'Time Domain'] }]
            }
        ]
    };

    if(analy.type=='DC Sweep'){
      var dc=analy.dcsweep;
      defaultData.sections.push({ title: "DC Sweep Properties", collapsed: false, showReset: true, rows: [] });
      defaultData.sections[1].rows.push( { label: 'Paramater', type: "Button", value: dc.param, setClick: 'getParamAnalysis("dc","'+dc.param+'")' });
      defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: dc.start });
      defaultData.sections[1].rows.push( { label: 'Step', type: "text", value: dc.step });
      defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: dc.stop });
    } else 
    {
        var tr=analy.time
        defaultData.sections.push({ title: "Time Domain Properties", collapsed: false, showReset: true, rows: [] });
        defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: tr.start });
        defaultData.sections[1].rows.push( { label: 'Step', type: "text", value: tr.step });
        defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: tr.stop });
    }


    var analy=JSON.parse(mtable.select.getAttribute("description"));
	var r=analy.yAxe.outputs;
	var x=analy.xAxe;
	var v=analy.secondsweep;


    defaultData.sections.push({ title: "Y axe property", collapsed: false, showReset: true, rows: [] });
    for(var i=0;i<r.length;i++){
        defaultData.sections[2].rows.push( { label: r[i].name , type: "axeproperty", value: r[i].color, color: r[i].color, setChange: 'colorOutput('+i+',this)', setClick: 'removeOutput('+i+')' });
    }
    defaultData.sections[2].rows.push({ label: 'Add output', type: "Button", value: 'Add', setClick: 'getParamAnalysis(0,0)' });

    defaultData.sections.push({ title: "X axe property", collapsed: false, showReset: true, rows: [] });
    if(x.used)defaultData.sections[3].rows.push({ label: x.name, type: "axeproperty", value: x.color, color: x.color, setChange: 'colorOutput(-1,this)' , setClick: 'removeOutput(-1)' });
    defaultData.sections[3].rows.push({ label: 'Add X axe', type: "Button", value: 'Add', setClick: 'getParamAnalysis(1,0)' });

    var elem= mtable.select.lastChild.firstChild;
    var layout = JSON.parse(elem.getAttribute("layout"));
    //alert(layout.yaxis.showgrid);
/*
    defaultData.sections.push({ title: "Layout", collapsed: false, showReset: true, rows: [] });
    defaultData.sections[4].rows.push( { label: 'Title', type: "text", value: layout.title.text });
    defaultData.sections[4].rows.push( { label: 'Font.color', type: "color", value: layout.font.color, color: layout.font.color });
   defaultData.sections[4].rows.push( { label: 'Font.size', type: "number", value: layout.font.size });
    defaultData.sections[4].rows.push( { label: 'Font.family', type: "dropdown", value: layout.font.family, options: fontAvailable });
    defaultData.sections[4].rows.push( { label: 'Background (Tab)', type: "color", value: layout.paper_bgcolor, color: layout.paper_bgcolor });
    defaultData.sections[4].rows.push( { label: 'Background (Plot)', type: "color", value: layout.plot_bgcolor, color: layout.plot_bgcolor });
    defaultData.sections[4].rows.push( { label: 'Bordercolor', type: "color", value: layout.bordercolor, color: layout.bordercolor });
    defaultData.sections[4].rows.push( { label: 'Axis.grid.color', type: "color", value: layout.yaxis.gridcolor, color: layout.yaxis.gridcolor });
   defaultData.sections[4].rows.push( { label: 'Axis.grid.show', type: "dropdown", value: layout.yaxis.showgrid, options: ["true","false"] });
    defaultData.sections[4].rows.push( { label: 'Legend.show', type: "dropdown", value: layout.showlegend, options: ["true","false"] });*/


    mtable.type = "analysis";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedAnalysis() {
        var analy=JSON.parse(mtable.select.getAttribute("description"));
        if(analy.type!=propertiesData.sections[0].rows[0].value){
            analy.type=propertiesData.sections[0].rows[0].value;
            mtable.select.setAttribute("description", JSON.stringify(analy));
            analysisSelect();
            return;
        }

        if(analy.type=='DC Sweep'){
            analy.dcsweep.param=propertiesData.sections[1].rows[0].value;
            analy.dcsweep.start=propertiesData.sections[1].rows[1].value;
            analy.dcsweep.step=propertiesData.sections[1].rows[2].value;
            analy.dcsweep.stop=propertiesData.sections[1].rows[3].value;
        } else {
            analy.time.start=propertiesData.sections[1].rows[0].value;
            analy.time.step=propertiesData.sections[1].rows[1].value;
            analy.time.stop=propertiesData.sections[1].rows[2].value;
        }

        var elem= mtable.select.lastChild.firstChild;
      /*  var data = JSON.parse(elem.getAttribute("data"));
        var layout = JSON.parse(elem.getAttribute("layout"));
        layout.title.text=propertiesData.sections[4].rows[0].value;
        layout.font.color=propertiesData.sections[4].rows[1].value;
      layout.font.size=propertiesData.sections[4].rows[2].value;
        layout.font.family=propertiesData.sections[4].rows[3].value;
        layout.paper_bgcolor=propertiesData.sections[4].rows[4].value;
        layout.plot_bgcolor=propertiesData.sections[4].rows[5].value;
        layout.bordercolor=propertiesData.sections[4].rows[6].value;
        layout.yaxis.gridcolor=propertiesData.sections[4].rows[7].value;
        layout.xaxis.gridcolor=propertiesData.sections[4].rows[7].value;
        layout.yaxis.showgrid=propertiesData.sections[4].rows[8].value=='true';
        layout.xaxis.showgrid=propertiesData.sections[4].rows[8].value=='true';
        layout.showlegend=propertiesData.sections[4].rows[9].value=='true';
        elem.setAttribute("layout", JSON.stringify(layout));
        elem.setAttribute("data", JSON.stringify(data));
        Plotly.newPlot(elem, data, layout, plotConfig);*/
   


        mtable.select.setAttribute("description", JSON.stringify(analy));
    
}




