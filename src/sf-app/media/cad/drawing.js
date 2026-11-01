/*
#--------------------------------------------------------------------------------------------
# Name:        drawing.js
# Author:      d.fathi
# Created:     05/06/2021
# Update:      09/09/2026
# Copyright:   (c) PyAMS 2026
# Licence:     free
#--------------------------------------------------------------------------------------------
*/


//--------------------------------Class  of drawing-------------------------------------------//
function fdrawing(div) {
var self = this;
 self.div = div;
 self.pageType='sym';
 self.pins=[];
 self.vars=[];
 self.showPolarity=false;
 self.pendingSave = false;
 self.selectPart= false;
 self.selectAnalysis= false;
 self.dataSyms = {}; 
 window.console.log('fdrawing initialized with div:', div);
 self.symbol = {
        name: "New Symbol",
        reference: "X",
        device: { type: "PyAMS", name: "None"}, 
        model:{name:"None",file:"None",dir:"None",local:false,setParams:""},
        description: {webPage:'',info:''}
    };

// Display the extension and workspace paths in the console for debugging
 self.extensionPath = window.extensionPath || '';
 self.libraryPath = window.libraryPath || '';
 self.workspacePath = window.workspacePath || ''; 

 //*************Creat body of drawing************************************************************//
 createBody(self);
 this.grid = new fgrid("svg", 1800, 1800);
 this.changPositionRuler = function () {
     self.grid.getRuler();
 };
 //**************Creat for adding shapes and resizing ******************//
this.shapes = new fshapes("svg", self, 1800, 1800);
this.resize = new fresize("svg", self, 1800, 1800);
this.grid.resize = self.resize;
this.shapes.resize = self.resize;
this.resize.grid=this.grid;

 //***********Grid with  tools*******************//
 this.showGrid=function(show){
 	self.grid.showGrid=show;
 	self.grid.getGrid();
 }
 this.zoomIn = function () {
     self.grid.zoomIn();
 }
 this.zoomOut = function () {
     self.grid.zoomOut();
 }

 document.getElementById("areaGlobal").addEventListener("scroll", self.changPositionRuler);

 self.setSize = function (w, h) {
     var r = (h) + 'px'
     document.getElementById("areaGlobal").style.height = r;
 }

//*******file action**************************//
 self.setFileType = function (type) {
     self.pageType = type;
     console.log('File type set to:', type);
     if (self.updateToolbar) self.updateToolbar();
 }
 
self.active=function()
	{
		clearSelectElms(self.shapes);
        self.resize.deletEllipse();
		refNetWithPart();
	}

self.setSymbolDescription = function () {
        var sym = document.getElementById("sym").firstChild;
        var width = sym.getAttribute("width");
        var height = sym.getAttribute("height");
        var zoom = parseFloat(sym.getAttribute("zoom"));
        var scrollLeft = parseInt(sym.getAttribute("left"));
        var scrollTop = parseInt(sym.getAttribute("top"));
        self.grid.zoom = zoom;
        self.grid.pageSize(width, height);
        self.grid.area.areaGlobal.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
        });
        try
          {self.symbol=JSON.parse(sym.getAttribute("symbol"));}
        catch(e)
          {self.symbol={name:"New Symbol",reference:"X",device:{type:"PyAMS",name:"None"},model:{name:"None",file:"None",dir:"None",local:false,setParams:""},description:{webPage:'',info:''}};}
		
        if (!self.symbol || !self.symbol.device) 
          {self.symbol={name:"New Symbol",reference:"X",device:{type:"PyAMS",name:"None"},model:{name:"None",file:"None",dir:"None",local:false,setParams:""},description:{webPage:'',info:''}};}
        self.active();
    }

self.getSymbolDescription = function () {
        var sym = document.getElementById("sym").firstChild;
        [...sym.attributes].forEach(attr => {sym.removeAttribute(attr.name);});
        sym.setAttribute("width", self.grid.width);
        sym.setAttribute("height", self.grid.height);
        sym.setAttribute("zoom", self.grid.zoom);
        sym.setAttribute("left", self.grid.area.areaGlobal.scrollLeft);
        sym.setAttribute("top", self.grid.area.areaGlobal.scrollTop);
        sym.setAttribute("symbol", JSON.stringify(self.symbol));  
    }

 self.getSymbol = function () {
     self.getSymbolDescription();
     return document.getElementById("sym").innerHTML;
 }
 self.setSymbol = function (data) {

     document.getElementById("sym").innerHTML = data;
     const sym = document.getElementById("sym");

     if (sym && !sym.querySelector(":scope > g")) {
        sym.innerHTML =
        '<g width="1550"  height="1550" top="0" left="0"   zoom="3" reference="X" description=" "></g>' +sym.innerHTML;

        

        if (self.pageType == 'sym') {
            self.grid.zoom = 6;
            self.grid.pageSize(350, 350);
        } else {
            self.grid.zoom = 3;
            self.grid.pageSize(1500, 1500);
        }
         
    }  else { 
        self.setSymbolDescription();
	    plotsOpenDataLayoutInDiv();
        modifiedClassText();
        updateHtmlCode();
    }
        
}

self.saveData=function(data){

             var content = self.getSymbol();
             // send the content to the extension for saving
             self.pendingSave =true;
             if (typeof vscode !== 'undefined') {
                 vscode.postMessage({
                     type: 'contentChanged',
                     content: content
                 });
            }
}


//*************Creat copy and paste function******************//
self.copy = function () {
    var copyList = [];

        if (self.shapes.lsg.elms.length > 0) {
            copyList = [];
            for (var i = 0; i < self.shapes.lsg.elms.length; i++) {
                copyList.push({
                    node: self.shapes.lsg.elms[i].outerHTML
                });
            }
        } else if (self.resize.setElement) {
            copyList = [];
            copyList.push({
                node: self.resize.setElement.outerHTML
            });
        }
    
    var data_ = { pageType: self.pageType, copyList: copyList };
    var clipboardData = JSON.stringify(data_);

    if (typeof vscode !== 'undefined') {
        vscode.postMessage({ type: 'copyData', data: clipboardData });
    }


    
};


self.paste = function (clipboardText) {
    try {
        
        let data = JSON.parse(clipboardText);

        if (!data.copyList?.length) {
            // No items to paste, exit the function;
            return;
        }

        if (data.pageType !== self.pageType) {
           // the data is from a different page type, ignore the paste operation;
            return;
        }

        const svgContainer = document.getElementById("sym");
        self.copyList = [];
        self.copyLength = data.copyList.length;

        for (const item of data.copyList) {
            if (!item.node) continue;

            // create  temp SVG
            const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            tempSvg.innerHTML = item.node;
            
            // transfer all child nodes from tempSvg to the main svgContainer
            while (tempSvg.firstChild) {
                const node = tempSvg.firstChild;
                svgContainer.appendChild(node);
                self.copyData=true;
            }
        }

        deletMultiRef();
        selectPast(self);
        self.saveData('Paste ');
        
    } catch (err) {
        console.error(err);
       
    }
};

self.cut = function () {
        self.copy();
        if (self.shapes.lsg.elms.length > 0) {
            for (var i = 0; i < self.shapes.lsg.elms.length; i++)
                self.shapes.lsg.elms[i].remove();
            clearSelectElms(self.shapes);
            self.saveData('Cut ');
        } else if (self.resize.setElement) {
            self.resize.setElement.remove();
            self.resize.deletEllipse();
            self.saveData('Cut ');
        }



    };


//*****update data symbols from extension.js to drawing.js*********//

self.updateDataSymbols = function () {
    console.log(' Requesting symbols data update...');
    if (typeof vscode !== 'undefined') {
        vscode.postMessage({ type: 'updateDataSymbols' });
    } else {
        console.warn('vscode API not available');
    }
};

self.getDataSym = function(data) {
    if (data && typeof data === 'object' && data.dirs) {
        self.dataSyms = data;
        console.log('dataSyms updated:', self.dataSyms);
        
        // refresh the symbols panel if it's already open 
        if (typeof symbolsPanel !== 'undefined') {
            updateSymbolsPanel();
        }
        return self.dataSyms;
    }
    
    console.warn('Invalid or missing data in getDataSym');
    return null;
};



self.redSymFiles = function(index) {
    return new Promise((resolve, reject) => {
        if (!self.dataSyms || !self.dataSyms.dirs || index < 0 || index >= self.dataSyms.dirs.length) {
            reject('Invalid index or dataSyms not loaded');
            return;
        }
        
        var dir = self.dataSyms.dirs[index];
        var files = self.dataSyms[dir];
        
        if (!files || !Array.isArray(files) || files.length === 0) {
            resolve([]);
            return;
        }
        
        // use the resolve function to return the files to the caller
        self._symFilesResolve = resolve;
        self._symFilesDir = dir;
        
        vscode.postMessage({
            type: 'readSymFiles',
            dir: dir,
            files: files
        });
    });
};

self.redSymFilesFromWorkSpace = function() {
    return new Promise((resolve, reject) => {
        self._workspaceSymResolve = resolve;
        
        if (typeof vscode !== 'undefined') {
            vscode.postMessage({
                type: 'readSymFilesFromWorkSpace'
            });
        } else {
            reject('vscode API not available');
        }
    });
};
        
//************execute SPICE code and return the result to the caller*************

self.execOp = function(spiceCode) {
    return new Promise((resolve, reject) => {
        self._execOpResolve = resolve;
        self._execOpReject = reject;
        
        if (typeof vscode !== 'undefined') {
            vscode.postMessage({
                type: 'execOp',
                code: spiceCode
            });
        } else {
            reject('vscode API not available');
        }
    });
};


// *************Get List Models Dialog*******************************//
 self.getListModel = function(previousResult, onSubmit, onCancel) {
             if (typeof listModelsDialog === 'undefined' || !listModelsDialog) {
                 listModelsDialog = new fListModelsDialog(self);
             }
             listModelsDialog.setCallbacks(onSubmit, onCancel);
             listModelsDialog.initData(previousResult);
             listModelsDialog.show();
         };

// *************Get Code Editor Dialog*******************************//
self.getCodeEditor = function(code, language, onSubmit, onCancel) {
    if (typeof codeEditorDialog === 'undefined' || !codeEditorDialog) {
        codeEditorDialog = new fCodeEditorDialog(self);
    }
    codeEditorDialog.setCallbacks(onSubmit, onCancel);
    codeEditorDialog.initData(code, language); // language: 'html' or 'css'
    codeEditorDialog.show();
};

// ************* Get SPICE Netlist Editor Dialog (self=this) *******************************//
self.getSpiceNetlistEditor = function(netlist, onSubmit, onCancel) {
    if (typeof spiceNetlistDialog === 'undefined' || !spiceNetlistDialog) {
        spiceNetlistDialog = new fSpiceNetlistDialog(self);
    }
    spiceNetlistDialog.setCallbacks(onSubmit, onCancel);
    spiceNetlistDialog.initData(netlist);
    spiceNetlistDialog.show();
};

//****************check circuit **********************************************************//
self.runOpCheck = function(spiceCode) {
    return new Promise((resolve, reject) => {
        if (typeof opAnalysisDialog === 'undefined' || !opAnalysisDialog) {
            opAnalysisDialog = new fOpAnalysisDialog(self);
        }

        opAnalysisDialog.setCallbacks(
            function(result) {
                resolve(result);
            },
            function() {
                reject('OP analysis cancelled');
            }
        );

        opAnalysisDialog.initData(spiceCode);
        opAnalysisDialog.show();
    });
};

// *************Run Analysis with Dialog*******************************//
self.runAnalysis = function(spiceCode) {
    return new Promise((resolve, reject) => {
        // Store resolvers for later
        self._simulationResolve = resolve;
        self._simulationReject = reject;
        self._simulationSpiceCode = spiceCode;
        
        if (typeof processAnalysisDialog === 'undefined' || !processAnalysisDialog) {
            processAnalysisDialog = new fProcessAnalysisDialog(self);
        }
        
        processAnalysisDialog.setCallbacks(
            function(result) {  // onSubmit (OK clicked)
                // Request results from extension
                if (typeof vscode !== 'undefined') {
                    vscode.postMessage({ type: 'getSimulationResults' });
                } else {
                    // Fallback if no vscode
                    resolve(result);
                }
            },
            function() {  // onCancel
                self._simulationResolve = null;
                self._simulationReject = null;
                reject('Analysis cancelled');
            }
        );
        
        processAnalysisDialog.initData(spiceCode);
        processAnalysisDialog.show();
    });
};

// Handle simulation results from extension
self.handleSimulationResults = function(data) {
    if (self._simulationResolve) {
        self._simulationResolve(data);
        self._simulationResolve = null;
        self._simulationReject = null;
    }
};

//*************Run a PyAMS analysis (Python process) with the process dialog*******************************//
// code:     PyAMS code creating the elements (every model instance is an element of the circuit)
// analysis: { type:'Time Domain', start:'0.0s', step:'0.1us', stop:'5ms',
//             outputs:{ names:['Out1','Out2','C1.I'], color:['#00ff00','#ff0000','#0000ff'] } }
//           (type: 'Time Domain' | 'AC' | 'DC'; "oupouts" is accepted as a spelling of "outputs")
// options:  { autoStart:true } starts the analysis without pressing the Start button
// Returns a Promise resolved, after the user presses OK, with
//   { mode, xKey, xLabel, xUnit, x:[...], series:[{name, unit, y:[...]}], colors:[...] }
// and rejected if the dialog is cancelled.
self.runPyAMSAnalysis = function(code, analysis, options) {
    return new Promise((resolve, reject) => {
        if (typeof processAnalysisDialog === 'undefined' || !processAnalysisDialog) {
            processAnalysisDialog = new fProcessAnalysisDialog(self);
        }
        processAnalysisDialog.setCallbacks(
            function(result) {                       // OK
                resolve(result.data);
            },
            function() {                             // Cancel / close
                reject('Analysis cancelled');
            }
        );
        processAnalysisDialog.initPyAMS(code, analysis, options);
        processAnalysisDialog.show();
    });
};

// Build the Plotly traces / layout of a runPyAMSAnalysis() result.
// Outputs with the same unit share one plot (volts together, amperes together ...), plots are
// stacked and share the x axis. A parametric sweep draws one curve per value (different dashes).
// AC results: options.func (default results.func or 'db & phase') = 'db' | 'mag' | 'phase' | 'db & phase' | 'mag & phase'.
self.makePyAMSPlot = function(results, options) {
    options = options || {};
    var series = (results && results.series) || [];
    var isAC = results && results.mode === 'ac';
    var func = String(options.func || results.func || 'db & phase');
    var parts = func.split('&').map(function(t) { return t.trim(); }).filter(function(t) { return t; });
    if (parts.length === 0) parts = ['db', 'phase'];
    var base = (typeof setLayout_ === 'function') ? setLayout_() : {
        font: { color: '#333333', size: 11, family: 'Arial' },
        paper_bgcolor: '#ffffff', plot_bgcolor: '#f8f8f8', showlegend: true
    };
    var palette = ['#1f77b4', '#d62728', '#2ca02c', '#ff7f0e', '#9467bd', '#8c564b', '#e377c2', '#17becf'];
    var dashes = ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot'];

    // the curves to draw: one per (series, view); a view is the signal itself, or dB / magnitude / phase (AC)
    var views = [];
    series.forEach(function(sr, i) {
        var list = isAC ? parts : ['y'];
        list.forEach(function(v, k) {
            var y, unit;
            if (!isAC) { y = sr.y; unit = sr.unit || ''; }
            else if (v === 'phase') { y = sr.phase; unit = '°'; }
            else if (v === 'mag') { y = sr.mag; unit = sr.unit || ''; }
            else { y = sr.db; unit = 'dB'; }
            views.push({ sr: sr, i: i, y: y, unit: unit, first: k === 0 });
        });
    });

    // one row per unit
    var units = [];
    views.forEach(function(v) {
        var k = units.indexOf(v.unit);
        if (k < 0) { units.push(v.unit); k = units.length - 1; }
        v.row = k + 1;
    });
    if (units.length === 0) units.push('');

    var data = views.map(function(v) {
        var sr = v.sr;
        var idx = (sr.index !== undefined) ? sr.index : v.i;
        var color = (results.colors && results.colors[idx]) || palette[idx % palette.length];
        var run = sr.run || 0;
        return {
            type: 'scatter',
            mode: 'lines',
            name: sr.name + (sr.label ? '  ' + sr.label : '') + (v.unit ? ' [' + v.unit + ']' : ''),
            legendgroup: sr.name + '|' + (sr.label || ''),
            showlegend: !isAC || v.first,
            x: sr.x || results.x,
            y: v.y,
            line: { color: color, width: 1.5, dash: dashes[run % dashes.length] },
            xaxis: 'x' + (v.row > 1 ? v.row : ''),
            yaxis: 'y' + (v.row > 1 ? v.row : '')
        };
    });

    var layout = Object.assign({}, base);
    delete layout.grid;                       // the rows are placed with explicit axis domains below
    layout.margin = { l: 70, r: 25, t: 35, b: 70 };
    layout.showlegend = true;
    var n = units.length;
    var gap = n > 1 ? 0.06 : 0;
    var h = (1 - gap * (n - 1)) / n;
    var xTitle = (results.xLabel || '') + (results.xUnit ? ' [' + results.xUnit + ']' : '');
    for (var r = 1; r <= n; r++) {
        var suffix = r > 1 ? r : '';
        var top = 1 - (r - 1) * (h + gap);
        var domain = [Math.max(0, top - h), top];
        layout['xaxis' + suffix] = {
            type: isAC ? 'log' : 'linear',
            domain: [0, 1], anchor: 'y' + suffix,
            gridcolor: '#e0e0e0', showgrid: true,
            exponentformat: 'SI',
            ticksuffix: results.xUnit && !isAC ? results.xUnit : '',
            matches: r > 1 ? 'x' : undefined,
            showticklabels: r === n,
            title: r === n ? { text: xTitle } : undefined
        };
        layout['yaxis' + suffix] = {
            type: 'linear', domain: domain, anchor: 'x' + suffix,
            gridcolor: '#e0e0e0', showgrid: true,
            exponentformat: 'SI',
            title: { text: units[r - 1] }
        };
    }
    return { data: data, layout: layout, config: { responsive: true, displaylogo: false } };
};

// Draw the result of runPyAMSAnalysis() in an element with Plotly.
self.plotPyAMSResults = function(elem, results, options) {
    var p = self.makePyAMSPlot(results, options);
    return Plotly.newPlot(elem, p.data, p.layout, p.config);
};

//*************Get List Parameter Dialog*******************************//
// code: PyAMS python code, e.g.
//   from pyams.models import Resistor
//   Rc1 = Resistor("Vcc", "Out1")
//   Rc1.setParams("R=1KΩ")
// Returns a Promise resolved with a JSON object describing every model created by the code:
//   { models: [ { name:"Rc1", class:"Resistor", init:[{name:"p",value:"Vcc"},...],
//                 setParams:["R=1KΩ"], signals:[...],
//                 params:[{name:"R", value:1000, default:1000, unit:"Ω", description:"Resistance", changed:false}] } ],
//     error: null }
// (JSON.stringify(result, null, 2) gives the text of the .json file)
self.getListParameter = function(code) {
    return new Promise((resolve, reject) => {
        if (typeof vscode === 'undefined') {
            reject('vscode API not available');
            return;
        }
        self._listParameterResolve = resolve;
        self._listParameterReject = reject;
        vscode.postMessage({
            type: 'getListParameter',
            code: code
        });
    });
}
//*************Signal dialog for PyAMS code*******************//
// data: result of getListParameter(code); preSelected: e.g. "R1.I" or a node name ("Vcc").
// onSubmit receives { selectedSignal, selectedFunction, selectedKind }.
self.getSignalDialog = function(data, preSelected, acUsed, onSubmit, onCancel) {
    if (typeof signalDialog === 'undefined' || !signalDialog) {
        signalDialog = new fSignalDialog(self);
    }
    signalDialog.onSubmit = onSubmit || null;
    signalDialog.onCancel = onCancel || null;
    signalDialog.initData(data, preSelected, acUsed);
    signalDialog.show();
};

//*************Parameter selection dialog for PyAMS code*******************//
// data: result of getListParameter(code); preSelected: e.g. "R1.R".
// onSubmit(selected, info): selected = "R1.R", info = {element, class, param, value, default, unit, description}.
self.getElementDialog = function(data, preSelected, onSubmit, onCancel) {
    if (typeof elementDialog === 'undefined' || !elementDialog) {
        elementDialog = new fElementDialog(self);
    }
    elementDialog.onSubmit = onSubmit || null;
    elementDialog.onCancel = onCancel || null;
    elementDialog.initData(data, preSelected);
    elementDialog.show();
};

//*************Parameters dialog (edit the values returned by getListParameter)*******************//
// data: result of getListParameter(code). onSubmit receives only the values that differ from their default.
self.getParametersDialog = function(data, onSubmit, onCancel) {
    if (typeof listParametersDialog === 'undefined' || !listParametersDialog) {
        listParametersDialog = new fListParametersDialog(self);
    }
    listParametersDialog.setCallbacks(onSubmit, onCancel);
    listParametersDialog.initData(data);
    listParametersDialog.show();
};

//*************Options dialog (simulation options: reltol, vntol, ... order)*******************//
// current: options already set, e.g. { uic: true }.
// Resolves with { options: [ { name, type, default, value, description } ] } for getOptionsDialog.
self.getOptions = function(current) {
    current = current || {};
    return Promise.resolve({
        options: PYAMS_OPTIONS.map(function(d) {
            var o = {};
            for (var k in d) o[k] = d[k];
            o.value = Object.prototype.hasOwnProperty.call(current, d.name) ? current[d.name] : d['default'];
            return o;
        })
    });
};
// onSubmit receives { options: {only the values that differ from their default}, python: "uic=True, lte=0.001" }.
self.getOptionsDialog = function(data, onSubmit, onCancel) {
    if (typeof optionsDialog === 'undefined' || !optionsDialog) {
        optionsDialog = new fOptionsDialog(self);
    }
    optionsDialog.setCallbacks(onSubmit, onCancel);
    optionsDialog.initData(data);
    optionsDialog.show();
};

//*************Create properties and symbols panel*******************//
propertiesPanel = new fpropertiesPanel(self);
symbolsPanel = new fsymbolsPanel(self);

         
         
//self.grid.zoom = 3;
//self.grid.pageSize(1500, 1500);
//self.grid.includeGridChange();

         
}
//-------------------------------------------------creat page of drawing circuit or symbol-----------------------------------//
let drawing;
function creatPage(div) {
var d;
function resizeCanvas() {
var w = document.getElementById(div).offsetWidth - 20;
var h = document.getElementById(div).offsetHeight - 20;
d.setSize(w,h);
}
d = new fdrawing(div);
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();
return d;
}




window.addEventListener('DOMContentLoaded', () => {
    drawing = creatPage("content");
});



