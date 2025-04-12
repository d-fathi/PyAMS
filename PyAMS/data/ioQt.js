

//----------------Start with a new page--------------------------------//
new QWebChannel(qt.webChannelTransport,
    function (channel) {
    var document = channel.objects.document;
    window.foo = document;
    typePyAMS=true;
    document.jscallme('Hello',typePyAMS);
    setTimeout(function () {
        document.jscallme('import symbol',typePyAMS);
    }, 100);
  
    document.newPage(function (val) {

        if (val)
            drawing.newPage('sym');
        else {
            drawing.newPage('dcs');
            if(drawing.itProject)
             val.push('Project');
            document.importLibs(function (val) {
                addItemsToPageLibs(val);
            });

            document.importSymbols(0, function (val) {
                addListSymbToPageLibs(val);
            });
        }
        drawing.objectInspector.getSelect();
    });

});


//----------------Get information of page--------------------------------//
var ioDic = {
    x: 0,
    y: 0,
    zoom: 0,
    select: false,
    undo: false,
    redo: false,
    past: false,
    endDrawing: true,
    modified: false,
    selectPart: false,
    showPolarity: false,
    selectAnalysis: false,
    selectShowAnalysis: false,
    itProject:false,
    undoPos: '  '
};

function dataToInterfacePython() {

    function getMousePosition(evt) {
        var CTM = svg.getScreenCTM();
        return {
            x: Math.round((evt.clientX - CTM.e) / CTM.a),
            y: Math.round((evt.clientY - CTM.f) / CTM.d)
        };

    }

    function ioupdateData(e) {
        ioDic.x = getMousePosition(e).x;
        ioDic.y = getMousePosition(e).y;
        ioDic.zoom = Math.ceil(drawing.grid.zoom * 100) + '%';
        ioDic.select = (drawing.shapes.lsg.elms.length > 0) || (drawing.resize.setElement != null);
        ioDic.undo = !(drawing.posUndo <= 0);
        ioDic.redo = !(drawing.posUndo >= drawing.data.length - 1);
        ioDic.past = !(drawing.copyList.length == 0);
        ioDic.endDrawing = !drawing.shapes.design.mouse;
        ioDic.modified = drawing.modified;
        ioDic.undoPos = drawing.getDescUndo();
        ioDic.selectPart = itPartSelect();
        ioDic.selectAnalysis = itSelectAnalysis();
        ioDic.selectShowAnalysis = itSelectShowAnalysis();
        ioDic.showPolarity = drawing.showPolarity;
        ioDic.itProject=drawing.itProject;
        window.foo.getRef([ioDic]);
    }

    document.getElementById("svg").addEventListener('mousemove', e => {
        ioupdateData(e);
    });
    document.getElementById("svg").addEventListener('mouseup', e => {
        ioupdateData(e);
    });
    document.getElementById("svg").addEventListener('click', e => {
        ioupdateData(e);
    });
}

dataToInterfacePython();

//----------------Update library---------------------------------------------//
function ioUpdatLibs(){
  getPageLibDesc('dcs');

  window.foo.importLibs(function (val) {
     if(drawing.itProject)
        val.push('Project');
        addItemsToPageLibs(val);
  });

  window.foo.importSymbols(0, function (val) {
      addListSymbToPageLibs(val);
  });

  drawing.objectInspector.getSelect();
}

//----------------Update information of page--------------------------------//
function updatResult() {
    ioDic.zoom = Math.ceil(drawing.grid.zoom * 100) + '%';
    ioDic.select = (drawing.shapes.lsg.elms.length > 0) || (drawing.resize.setElement != null);
    ioDic.undo = !(drawing.posUndo <= 0);
    ioDic.redo = !(drawing.posUndo >= drawing.data.length - 1);
    ioDic.past = !(drawing.copyList.length == 0);
    ioDic.endDrawing = !drawing.shapes.design.mouse;
    ioDic.modified = drawing.modified;
    ioDic.undoPos = drawing.getDescUndo();
    ioDic.selectPart = itPartSelect();
    window.foo.getRef([ioDic]);
}

//-----------------Actions of edit and show------------------------------//
function ioZoomIn() {
    drawing.zoomIn();
    updatResult();
}


function ioZoomOut() {
    drawing.zoomOut();
    updatResult();
}

function ioRedo() {
    drawing.redo();
    updatResult();
}

function ioUndo() {
    drawing.undo();
    updatResult();
}

function ioCut() {
    drawing.cut();
    updatResult();
    updateListElements();
}

function ioCopy() {
    drawing.copy();
    updatResult();
}

function ioPast() {
    drawing.past();
    updatResult();
    updateListElements();
}

function ioEndDrawing() {
    drawing.shapes.design.mouse = false;
    drawing.shapes.design.start = false;
    updatResult();
}


//--------------------------------actions of File (New OPen Save)--------------------//
function ioNewPage(type) {

	    if (type=='sym')
            drawing.newPage('sym');
        else {
            drawing.newPage('dcs');
            window.foo.importLibs(function (type) {
                addItemsToPageLibs(type);
            });

            window.foo.importSymbols(0, function (type) {
                addListSymbToPageLibs(type);
            });
        }

    updatResult();
    updateListElements();

}

function ioSetSymbol(sym) {
    drawing.setSymbol(sym[0]);
    if(!drawing.itProject)
     drawing.itProject=false;
    if(drawing.pageType!='sym')
      ioUpdatLibs();

    updatResult();
    updateListElements();
    drawing.objectInspector.getDescriptionPage();
}

function ioGetSymbol(sym) {
    drawing.modified = false;
    updatResult();
    return drawing.getSymbol();
}

//--------------------------------actions of Analysis--------------------//
function ioGetProbes() {
    return getProbes();
}

function ioGetNetList() {
    return netList();
}


function ioGetProbesWithNetList(typeanalysis) {
    xNameAnalysis = 'Time';
    return [getProbes(), getPlots(typeanalysis), getNetRefs(), netList(), drawing.optionsimulation];
}

function ioStartInter(units) {
    plotStartInter(units);
}


function ioSetValProbe(vals){

    var name = mtable.select.getAttribute('pos');

    if(typePyAMS){
       // val=valToStr(val)+mtable.select.getAttribute('unit');  
    var probes = document.getElementsByName('probe');
    for (var i = 0; i < probes.length; i++) 
      if(probes[i].getAttribute("pos")!='NoPos'){
        var name=probes[i].getAttribute("pos");
        var unit=probes[i].getAttribute("unit");
        probes[i].childNodes[2].textContent = name +'='+ valToStr(vals[i])+unit;
        structProbe(probes[i])
       }
    }
    
    else{
        val=valToStr(val)+toType(name);
        mtable.select.childNodes[2].textContent = name +'='+ val;
        structProbe(mtable.select);
    }
}
//getProbes()

function ioAnalysis() {
    if(typePyAMS){
        var analysis_ = getCodePyOrAnaly();
        if (analysis_[0])
            return [true, getProbes(analysis_[1]), getNetRefs(), netList(), drawing.optionsimulation, analysis_];
        return [false]
    }
    var analysis_ = getAnaly();
    if (analysis_[0])
        return [true, getNetRefs(), netList(), codeSpiceList(), analysis_[1]];
    return [false]
}



function ioSetProbeValue(val) {
    setProbesValues(val);
    mtable.select.childNodes[2].textContent =val;
}


function ioPosProbetemp() {
    if (mtable.typeSelect == 'probe')
        var str = mtable.select.childNodes[2].textContent.split('=');
    else {
        if (mtable.pos == 0)
            var str = mtable.select.getAttribute('cha').split('=');
        else
            var str = mtable.select.getAttribute('chb').split('=');
    }

    window.foo.getProbeValue(str[0],'all');
}



function ioOptionSimulation() {
    return [drawing.optionsimulation];
}

function ioSetOptionSimulation(option) {
    drawing.optionsimulation= option[0];
}


function ioOptionAnalysis() {
    var elem=drawing.resize.setElement;
    var analy=JSON.parse(elem.getAttribute("description"));

    return [boolToStr(analy.secondsweep.used)];
}

function ioSetOptionAnalysis(option) {
   
    var elem=drawing.resize.setElement;
    var analy=JSON.parse(elem.getAttribute("description"));
    analy.secondsweep.used=option[0]=='True';
    elem.setAttribute("description", JSON.stringify(analy));
    analysisSelect();
    mtable.parent.creat();
}

//-------------------------------Symbol or part operations----------------------------------------//

function iogetDescription() {
    return [drawing.symbol.description.webPage, drawing.symbol.description.info];
}

function iosetDescription(vals) {
    drawing.symbol.description.webPage= vals[0]
    drawing.symbol.description.info= vals[1];
    drawing.modified = true;
    drawing.objectInspector.getSelect();
}

function ioTypeRotation(type) {
    if(drawing.resize.setElement.getAttribute("name")=="oscilloscope"){
		oscillRotation(type);
		return;
		}
    switch (type) {
    case 'rotate':
        rotatePart();
        break;
    case 'flipHorizontal':
        flipHorizontalPart();
        break;
    case 'flipVertical':
        flipVerticallyPart();
        break;
    }
  drawing.modified = true;
}

function ioGetSelectSymbol() {
    if (drawing.resize.setElement)
        if (drawing.resize.setElement.getAttribute('name') == 'part') {
            modifiedPartBySymbolEditor = drawing.resize.setElement;
            return [true, drawing.resize.setElement.innerHTML, modifiedPartBySymbolEditor.getAttribute('sref')];
        }
    return [false, null];
}

function ioSymbolFileName(fname){
  drawing.symbol.fname=fname;
  drawing.objectInspector.getSelect();
}



function setSymbolModifed(sym) {
    if (modifiedPartBySymbolEditor) {
        newPart(modifiedPartBySymbolEditor, sym);
        updateRefParts();
    }
}




