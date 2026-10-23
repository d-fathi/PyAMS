/*
#-------------------------------------------------------------------------------
# Name:         modifiedSelect.js
# Author:       d.fathi
# Created:      18/07/2021
# Last update:   17/05/2026
# Copyright:   (c)  PyAMS 2026
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



function pageSelect() {
    mtable.select = drawing.grid;
    defaultData = {
        header: { title: "Page design", subtitle: "Selected" },
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
            { label: "File name", type: "text", value: drawing.symbol.name, readonly: true},
            { label: "Reference", type: "text", value: drawing.symbol.reference },  //
            { label: "Device.type", type: "dropdown", value: drawing.symbol.device.type, options: ['PyAMS'] }
        );

           // defaultData.sections[0].rows.push({ label: "Model.name", type: "text", value: drawing.symbol.model.name, readonly: true });
            defaultData.sections[0].rows.push({ label: 'Model.name', type: "Button", value: drawing.symbol.model.name , setClick:'openEditorListModelsSym' });
            defaultData.sections[0].rows.push({ label: 'Model.Parameters', type: "Button", value: 'Modify Parameters', setClick:'openEditorParamsSym' });
        

    } else {
        defaultData.sections.push(            {
                title: "Circuit Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Netliste", type: "Button", value: 'show' , setClick:'openNetlistEditor' },
                    { label: "OP Check", type: "Button", value: 'show' , setClick:'OPCheck' }
                ]
            })
    }
  
    mtable.type = "page";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
     buildPanel();

}

function pageModified() {
    
    if(mtable.select.width != propertiesData.sections[0].rows[0].value){
        mtable.select.width = propertiesData.sections[0].rows[0].value;
        drawing.grid.pageSize(mtable.select.width,mtable.select.height);
        return;
    }

    if(mtable.select.height != propertiesData.sections[0].rows[1].value){
        mtable.select.height = propertiesData.sections[0].rows[1].value;
        drawing.grid.pageSize(mtable.select.width,mtable.select.height);
        return;
    }

   if(drawing.pageType=="sym"){
    drawing.symbol.name = propertiesData.sections[0].rows[2].value;
    drawing.symbol.device.type = 'PyAMS'; //propertiesData.sections[0].rows[4].value;
    drawing.symbol.reference = propertiesData.sections[0].rows[3].value ? propertiesData.sections[0].rows[3].value : Ref[propertiesData.sections[0].rows[5].value];
    if (controlRefSymbol())
    {
        pageSelect();
        return;
    }
}

 


deleteEllipseMS(mtable.resize);
if (mtable.resize.setElement)
     mtable.resize.creatEllipse();
    //pageSelect();
}


//-------Rectangle description ---------------------------------------------------
function rectSelect() {

        defaultData = {
        header: { title: "Rectangle", subtitle: "Selected" },
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
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS' }
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
    mtable.resize.updateSlect();
}

//-------Ellipse description ---------------------------------------------------

function ellipseSelect() {
        defaultData = {
        header: { title: "Ellipse", subtitle: "Selected" },
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
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS' }
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
    mtable.resize.updateSlect();
}

//--arc description ---------------------------------------------------


function arcSelect() {
        defaultData = {
        header: { title: "Arc", subtitle: "Selected" },
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
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS' }
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
        header: { title: "Polyline", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS' }
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
    mtable.resize.updateSlect();
}

//--Polygon description ---------------------------------------------------


function polygonSelect() {
    defaultData = {
        header: { title: "Polygon", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Fill", type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS' }
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
    mtable.resize.updateSlect();
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
        header: { title: "Net", subtitle: "Selected" },
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
    mtable.resize.updateSlect();
}

//-------Reference description-------------------------------------

function refSelected() {
   
    defaultData = {
        header: { title: "Reference", subtitle: "Selected" },
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

    if(controlRefPart(mtable.select))
        refSelected();

    deleteEllipseMS(mtable.resize);
    mtable.resize.updateSlect();
}



//-------Paramater description-------------------------------------


function paramSelected() {
    mtable.select.p = mtable.select.textContent.split("=");
    defaultData = {
        header: { title: "Parameter", subtitle: "Selected" },
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
                    { label: 'Show', type: "dropdown", value: mtable.select.getAttribute("show"), options: ['Name and value', 'Value only'] }
                ]
            }
        ]
    };
if(mtable.select.getAttribute("show")=='Name and value'){
    defaultData.sections[0].rows.push(
        { label: 'Name', type: "text", value: mtable.select.getAttribute("paramname") },
        { label: 'Value', type: "text", value: mtable.select.getAttribute("paramvalue")}
    );
} else{
    defaultData.sections[0].rows.push(
        { label: 'Value', type: "text", value: mtable.select.getAttribute("paramvalue")}
    );
}
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
    var showValue = propertiesData.sections[0].rows[5].value;

    if(mtable.select.getAttribute("show")!=showValue){
        mtable.select.setAttribute("show", showValue);
        mtable.select.textContent = showValue=='Name and value' ? mtable.select.getAttribute("paramname") + '=' + mtable.select.getAttribute("paramvalue") : mtable.select.getAttribute("paramvalue");
        paramSelected();
        return;
    }

    if(showValue=='Name and value' ){
        mtable.select.setAttribute("paramname", propertiesData.sections[0].rows[6].value);
        mtable.select.setAttribute("paramvalue", propertiesData.sections[0].rows[7].value);
        var text = propertiesData.sections[0].rows[6].value + '=' + propertiesData.sections[0].rows[7].value;
    } else{
        mtable.select.setAttribute("paramvalue", propertiesData.sections[0].rows[6].value);
        var text = propertiesData.sections[0].rows[6].value;
    }

    mtable.select.textContent = text;
    deleteEllipseMS(mtable.resize);
    mtable.resize.updateSlect();
} 

//-------Model description-------------------------------------

function modelSelected() {
   
    defaultData = {
        header: { title: "Model", subtitle: "Selected" },
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
                    { label: 'Model.name', type: "text", value: mtable.select.getAttribute("modelname")},
                    { label: 'Model.other', type: "Button", value: 'Find similar model', setClick:'openEditorListModels' },
                ]
            }
        ]
    };  
 
    mtable.type = "modelSpice";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modelModified() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[3].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[4].color;
    mtable.select.textContent = propertiesData.sections[0].rows[5].value;
    

    if(mtable.select.getAttribute("modelname") !=propertiesData.sections[0].rows[5].value){
        mtable.select.setAttribute("modelname",propertiesData.sections[0].rows[5].value);
        var result={file: mtable.select.getAttribute('modelfile'), model: mtable.select.getAttribute('modelname')};
    }

   // if(controlRefPart(mtable.select))
    //    refSelected();

    deleteEllipseMS(mtable.resize);
    mtable.resize.updateSlect();
}

//-------Pin description ---------------------------------------------------

function pinSelect() {
    var r = getPinDescription(mtable.select)
        if (!mtable.select.childNodes[2].style.fill)
            mtable.select.childNodes[2].style.fill = 'RGB(0,0,0)';
    defaultData = {
        header: { title: "Pin", subtitle: "Selected" },
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
            return 1;
    }
    var size = propertiesData.sections[0].rows[0].value*1;
    console.log('size', size, 'points', points);
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
    mtable.select.childNodes[2].textContent = propertiesData.sections[0].rows[4].value;
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
    mtable.resize.updateSlect();
}

//-------Probe  description----------------------------------------------------------------


function probeSelect() {
    defaultData = {
        header: { title: "Probe", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "Select signal", type: "Button", value: 'Show list', setClick: 'ioPosProbe' },     
                    { label: "OP", type: "Button", value: 'Run ▶', setClick: 'ioProbe' }
                          
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
    mtable.resize.updateSlect();
}


//-------codeHTML description ---------------------------------------------------
function codeHTMLSelect() {


    var f=mtable.select.firstChild.firstChild.style;

    defaultData = {
        header: { title: "Code HTML", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "Width  (px)", type: "number", value: parseInt(mtable.select.getAttribute("width")) },
                    { label: "Height (px)", type: "number", value: parseInt(mtable.select.getAttribute("height")) },
                    { label: "HTML code", type: "Button", value: 'Show', setClick: 'openEditHtml'}         
                ]
            }
        ]
    };

    mtable.type = "codeHTML";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedcodeHTML() {

    mtable.select.setAttribute("x", propertiesData.sections[0].rows[0].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[1].value);
    mtable.select.setAttribute("width", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("height", propertiesData.sections[0].rows[3].value);
    modifedSizeCodeHtml(mtable.select);
    deleteEllipseMS(mtable.resize);
    mtable.resize.updateSlect();
}


//--



//-------Text description ---------------------------------------------------

function setPosText() {
    var x = mtable.select.getAttribute("x");
    var y = mtable.select.getAttribute("y");
    var r = mtable.select.getAttribute("r");
    mtable.select.setAttribute('transform', 'rotate(' + r + ' ' + x + ' ' + y + ')');
}

function textSelect(){
    defaultData = {
        header: { title: "Text", subtitle: "Selected" },
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
    mtable.resize.updateSlect();
}


//-------part description ---------------------------------------------------



function partSelect() {
    var part = mtable.select;
    var sym =JSON.parse(mtable.select.firstChild.getAttribute("symbol"));
    var std=false;

    if(sym.device.type=='std'){
        std=true;
        if(sym.name=="Port"){

        defaultData = {
          header: { title: "Port", subtitle: "Selected" },
          sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Name", type: "text", value: sym.name, readonly: true },
                    { label: "Directory", type: "text", value: part.getAttribute("directory"), readonly: true },
                    { label: "Reference", type: "text", value: part.getAttribute("sref") },
                    { label: "Direction", type: "dropdown", value: part.firstChild.getAttribute("direction") , options: ['Input', 'Output','Bi-Direct'] }
                ]
            }
        ]
    };


    } else  if(sym.name=="VBar"){

        defaultData = {
          header: { title: "VBar", subtitle: "Selected" },
          sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Name", type: "text", value: sym.name, readonly: true },
                    { label: "Directory", type: "text", value: part.getAttribute("directory"), readonly: true },
                    { label: "Reference", type: "text", value: part.getAttribute("sref") }
                ]
            }
        ]
    };


    } else
         defaultData = {
        header: { title: "Gnd", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Name", type: "text", value: sym.name, readonly: true },
                    { label: "Directory", type: "text", value: 'Std', readonly: true }
                ]
            }
        ]
    };
    } else{
    defaultData = {
        header: { title: "Symbol", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "File.name", type: "text", value: sym.name, readonly: true },
                    { label: "File.Directory", type: "text", value: part.getAttribute("directory"), readonly: true },
                    { label: "Reference", type: "text", value: part.getAttribute("sref") },
                    { label: 'Model.name', type: "Button", value: sym.model.name , setClick:'openEditorListModelsPart' },
                    { label: 'Model.Parameters', type: "Button", value: 'Modify Parameters', setClick:'openEditorParamsPart' }
                ]
            }/*,
                        {
                title: "Model Properties",
                collapsed: false,
                showReset: true,
                rows: []
            }*/
        ]
    };
    }

    var sym=getPartModel(part);
    mtable.type = "part";
    mtable.sym=sym;  //data[0]
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedPart() {


    var part = mtable.select;
    var sym =JSON.parse(mtable.select.firstChild.getAttribute("symbol"));

    if(sym.device.type=='std'){
        if(sym.name=="Port"){
                part.setAttribute("sref", propertiesData.sections[0].rows[2].value);
                part.firstChild.setAttribute("direction", propertiesData.sections[0].rows[3].value);
                var pin = part.querySelector('[name="pin"]');
                pin.childNodes[2].textContent= propertiesData.sections[0].rows[2].value;
                portRotate(mtable.select);
                information(drawing.resize);
        }

        if(sym.name=="VBar"){
                part.setAttribute("sref", propertiesData.sections[0].rows[2].value);
                var text = part.querySelector('[name="text"]');
                text.textContent= propertiesData.sections[0].rows[2].value;
        }

        return;
    }
    

    part.setAttribute("sref", propertiesData.sections[0].rows[2].value);

   if(propertiesData.sections[0].rows.length > 6) {
     if(mtable.sym.model.name != propertiesData.sections[0].rows[5].value){
         mtable.sym.model.name = propertiesData.sections[0].rows[5].value;
         setPartModel(mtable.select, mtable.sym);
     }
   }

    if( controlPartRef(part)){
        partSelect();
        return;
    } 


    deleteEllipseMS(mtable.resize);
    mtable.resize.updateSlect();

}

//-------analysis description ---------------------------------------------------

function colorOutput(n,e){
    return;
    console.log(n, e.value);
	var analy=JSON.parse(elem.getAttribute("description"));

    if(analy.type=='DC Sweep'){
      var dc=analy.dcsweep;
      var r=dc.yAxe;
	  var x=dc.xAxe;

    } else if(analy.type=='Time Domain') {
        var tr=analy.time
        var r=tr.yAxe;
        var x=tr.xAxe;

    } else if(analy.type=='AC Analysis') {
        var ac=analy.ac;
        var r=ac.yAxe;
        var x=ac.xAxe;  
    }

	if(n==-1)
	{
		x.color=e.value;
	}
	else {
		r[n].color=e.value;
	}
	elem.setAttribute("description", JSON.stringify(analy));
}

function removeOutput(n){
	var analy=JSON.parse(mtable.select.getAttribute("description"));
    if(analy.type=='DC Sweep'){
      var dc=analy.dcsweep;
      var r=dc.yAxe;
	  var x=dc.xAxe;

    } else if(analy.type=='Time Domain') {
        var tr=analy.time
        var r=tr.yAxe;
        var x=tr.xAxe;

    } else if(analy.type=='AC Analysis') {
        var ac=analy.ac;
        var r=ac.yAxe;
        var x=ac.xAxe;  
    }

	if(n==-1)
	{
		x.used=false;
	}
	else {
		r.splice(n, 1);
	}
	mtable.select.setAttribute("description", JSON.stringify(analy));
	analysisSelect();
}





function analysisSelect() {

        var analy=JSON.parse(mtable.select.getAttribute("description"));


    //Analysis Properties-----------------------------------------------------------------------------------------------------
        defaultData = {
        header: { title: "Analysis Description", subtitle: "Selected" },
        sections: [
            { title: "Analysis Properties",
              collapsed: false,
              showReset: true,
                rows: [ { label: 'Type', type: "dropdown", value: analy.type, options: ['DC Sweep', 'Time Domain','AC Analysis'] },
                        { label: 'Simulation', type: "Button", value: 'Run ▶', setClick: 'runAnalysis' }] 
            }
        ]
    };

    if(analy.type=='DC Sweep'){ 
      var dc=analy.dcsweep;
      defaultData.sections.push({ title: "DC Sweep Properties", collapsed: false, showReset: true, rows: [] });
      defaultData.sections[1].rows.push( { label: 'Paramater', type: "Button", value: dc.param, setClick: 'dcPramAnalysis' });
      defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: dc.start });
      defaultData.sections[1].rows.push( { label: 'Step', type: "text", value: dc.step });
      defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: dc.stop });

      var r=dc.yAxe;
	  var x=dc.xAxe;

    } else if(analy.type=='Time Domain') {
        var tr=analy.time
        if(!tr.uic)
            tr.uic='true';
        defaultData.sections.push({ title: "Time Domain Properties", collapsed: false, showReset: true, rows: [] });
        defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: tr.start });
        defaultData.sections[1].rows.push( { label: 'Step', type: "text", value: tr.step });
        defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: tr.stop });
        defaultData.sections[1].rows.push( { label: 'UIC', type: "dropdown", value: tr.uic, options: ['false', 'true'] });

        var r=tr.yAxe;
        var x=tr.xAxe;

    } else if(analy.type=='AC Analysis') {
        var ac=analy.ac;
        defaultData.sections.push({ title: "AC Analysis Properties", collapsed: false, showReset: true, rows: [] });
        defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: ac.start });
        defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: ac.stop });
        defaultData.sections[1].rows.push( { label: 'Points', type: "text", value: ac.points });
        defaultData.sections[1].rows.push( { label: 'Sweep', type: "dropdown", value: ac.sweep, options: ['linear', 'decade', 'octave'] });

        var r=ac.yAxe;
        var x=ac.xAxe;

    }



   

	
    // Y axe property-----------------------------------------------------------------------------------
    defaultData.sections.push({ title: "Y axe outputs", collapsed: false, showReset: true, rows: [] });
    for(var i=0;i<r.length;i++){
        if(r[i].func)
            var func='  :' +r[i].func;
        else
            var func='';
        defaultData.sections[2].rows.push( { label: r[i].name +  func, type: "axeproperty", value: r[i].color, color: r[i].color, delete: false, setChange: 'colorOutput('+i+',this)', setClick: 'removeOutput('+i+')' });
    }
    defaultData.sections[2].rows.push({ label: 'Add output', type: "Button", value: 'Add', setClick: 'addOutputY' });
    
    // X axe prpperty-----------------------------------------------------------------------------------
    defaultData.sections.push({ title: "X axe output", collapsed: false, showReset: true, rows: [] });
     if(x.func)
            var func='  :' +x.func;
     else
            var func='';
    if(x.used)defaultData.sections[3].rows.push({ label: x.name+ func, type: "axeproperty", value: x.color, color: x.color, setChange: 'colorOutput(-1,this)' , setClick: 'removeOutput(-1)' });
    defaultData.sections[3].rows.push({ label: 'Add X axe', type: "Button", value: x.used?'Modify':'Add', setClick: 'addOutputX' });
/*
    // Layout property-----------------------------------------------------------------------------------
    defaultData.sections.push({ title: "Layout property", collapsed: false, showReset: true, rows: [] });
    defaultData.sections[4].rows.push({ label: 'Layout', type: "Button", value: 'Modify', setClick: 'modifiedLayout()' });
*/

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
        } else if(analy.type=='AC Analysis'){
            analy.ac.start=propertiesData.sections[1].rows[0].value;
            analy.ac.stop=propertiesData.sections[1].rows[1].value;
            analy.ac.points=propertiesData.sections[1].rows[2].value;
            analy.ac.sweep=propertiesData.sections[1].rows[3].value;
            analy.ac.type = {
                linear: 'lin',
                decade: 'dec',
                octave: 'oct'   
            }[propertiesData.sections[1].rows[3].value] || 'lin';
        } else if(analy.type=='Time Domain'){
            analy.time.start=propertiesData.sections[1].rows[0].value;
            analy.time.step=propertiesData.sections[1].rows[1].value;
            analy.time.stop=propertiesData.sections[1].rows[2].value;
            analy.time.uic=propertiesData.sections[1].rows[3].value;
        }


    if(analy.type=='DC Sweep'){
      var dc=analy.dcsweep;
      var r=dc.yAxe;
	  var x=dc.xAxe;

    } else if(analy.type=='Time Domain') {
        var tr=analy.time
        var r=tr.yAxe;
        var x=tr.xAxe;

    } else if(analy.type=='AC Analysis') {
        var ac=analy.ac;
        var r=ac.yAxe;
        var x=ac.xAxe;  
    }


        for(var i=0;i<r.length;i++){
         r[i].color=propertiesData.sections[2].rows[i].color;
    }

 mtable.select.setAttribute("description", JSON.stringify(analy));
            
 
 for(var i=0;i<r.length;i++)
         if(propertiesData.sections[2].rows[i].delete){
            removeOutput(i);
            return;
    }

  for(var i=0;i<propertiesData.sections[3].rows.length;i++)
         if(propertiesData.sections[3].rows[i].delete){
            removeOutput(-1);
    }



    
       
    
}




