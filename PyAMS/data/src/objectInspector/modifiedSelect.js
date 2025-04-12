
/*
#-------------------------------------------------------------------------------
# Name:         modifiedSelect.js
# Author:       d.fathi
# Created:      18/07/2021
# Copyright:   (c) PyAMS 2024
# Licence:     free
#-------------------------------------------------------------------------------
*/


function deleteEllipseMS(self) {
    for (var i = 0; i < self.ellps.length; i++) {
        var element = document.getElementById(self.ellps[i].id);
        element.parentNode.removeChild(element);
    }
    self.ellps = [];
}

function addEventToTable() {
    if (mtable.select.getAttribute("rid")) {
        mtable.table.push({
            name: 'id',
            value: mtable.select.getAttribute("rid"),
            type: "text"
        });

    }

    if (mtable.select.getAttribute("click")) {
        mtable.table.push({
            name: 'onclick',
            value: mtable.select.getAttribute("click"),
            type: "text"
        });
    }
}

function modifiedEvent() {
    if (mtable.pos < mtable.table.length) {
        switch (mtable.table[mtable.pos].name) {
        case 'id':
            mtable.select.setAttribute("rid", mtable.newElem.value);
            break;
        case 'onclick':
            mtable.select.setAttribute("click", mtable.newElem.value);
            break;
        }
    }
}

//-------Page and symbol description   -----------------------------


function pageSelect(self) {
//  alert(drawing.symbol.name);
    mtable.typeSelect = 'page';
   // alert(drawing.pageType);
    if (drawing.pageType == 'sym'){
    mtable.table = [{
            name: 'Page.width',
            value: mtable.select.width,
            type: "number"
        }, {
            name: 'Page.height',
            value: mtable.select.height,
            type: "number"
        }, {
            name: 'Symbol.file',
            value: drawing.symbol.fname,
            type: "text",
            condition: [['readonly', 'true']]
        }, {
            name: 'Symbol.name',
            value: drawing.symbol.name,
            type: "text"
        }, {
            name: 'Symbol.description',
            value: 'show',
            type: "Button",
            setClick: 'window.foo.description(["' + drawing.symbol.description.webPage + '","' + drawing.symbol.description.info + '"])'
        }, {
            name: 'Model.type',
            value: drawing.symbol.type,
            type: "select",
            array: modelType
        },{
            name: 'Model.file',
            value: 'show',
            type: "Button",
            setClick: 'window.foo.getCodeBySymEd()'
        }
    ];
    if(typePyAMS){
       // mtable.table.splice(5, 1);
       mtable.table[5]= {
        name: 'Model.name',
        value: drawing.symbol.fname.split('.')[0],
        type: "text",
        condition: [['readonly', 'true']],

    }
    }
    self.creat();
  }
else

{
  mtable.table = [{
          name: 'Page.width',
          value: mtable.select.width,
          type: "number"
      }, {
          name: 'Page.height',
          value: mtable.select.height,
          type: "number"
      }, {
          name: 'Page.library',
          value: 'Update',
          type: "Button",
          setClick: 'updateLibrary()'
      }, {
          name: 'Project',
          value: boolToStr(drawing.itProject),
          array: ['False', 'True'],
          type: "select"
        }]

  /*window.foo.importFileProject(function (val){
          self.creat();
        });*/
}

}

function pageModified(pos,e) {
    var grid = mtable.select;
    if (drawing.pageType == 'sym'){
    switch (pos) {
    case 0:
        grid.pageSize(e.value, grid.height);
        break;

    case 1:
        grid.pageSize(grid.width, e.value);
        break;

    case 3:
        drawing.symbol.name= e.value;
        break;

    case 5:
        drawing.symbol.type = e.value;
        if (drawing.pageType == 'sym')
             modifiedRefName(e.value);
        break;
    }
  } else {
    switch (pos) {
    case 0:
        grid.pageSize(e.value, grid.height);
        break;

    case 1:
        grid.pageSize(grid.width, e.value);
        break;

    case 3:
        drawing.itProject=e.value=='True';
        window.foo.itProject(drawing.itProject);
        break;
      }
    }

}

//-------Rectangle description ---------------------------------------------------
function rectSelect() {
    mtable.typeSelect = 'rect';
    mtable.table = [{
            name: 'Width',
            value: parseInt(mtable.select.getAttribute("width")),
            type: "number"
        }, {
            name: 'Height',
            value: parseInt(mtable.select.getAttribute("height")),
            type: "number"
        }, {
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
        },{
            name: 'Stroke',
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        },{
            name: 'Fill',
            value: rgb2hex(mtable.select.style.fill),
            type: "color"
        },{
            name: 'Style',
            value: 'CSS Code',
            type: "Button",
            setClick: 'openEditCSS()'
        }];


    addEventToTable();
}

function modifiedRect(pos,e) {
    var rect = mtable.select;

    switch (pos) {
    case 0:
        rect.setAttribute("width", e.value);
        break;
    case 1:
        rect.setAttribute("height", e.value);
        break;
    case 2:
        rect.setAttribute("x", e.value);
        break;
    case 3:
        rect.setAttribute("y", e.value);
        break;
    case 4:
        mtable.select.style.stroke = e.value;
        break;
    case 5:
        mtable.select.style.fill =e.value;
        break;
    }

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Ellipse description ---------------------------------------------------
function ellipseSelect() {
    mtable.typeSelect = 'ellipse';
    mtable.table = [{
            name: 'Radius x axis',
            value: parseInt(mtable.select.getAttribute("rx")),
            type: "number"
        }, {
            name: 'Radius y axis',
            value: parseInt(mtable.select.getAttribute("rx")),
            type: "number"
        }, {
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("cx")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("cy")),
            type: "number"
        },{
            name: 'Stroke',
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        },{
            name: 'Fill',
            value: rgb2hex(mtable.select.style.fill),
            type: "color"
        },{
            name: 'Style',
            value: 'CSS Code',
            type: "Button",
            setClick: 'openEditCSS()'
        }];
        
    addEventToTable();
}

function modifiedEllipse(pos,e) {
    var ellipse = mtable.select;

    switch (pos) {
    case 0:
        ellipse.setAttribute("rx", e.value);
        break;
    case 1:
        ellipse.setAttribute("ry", e.value);
        break;
    case 2:
        ellipse.setAttribute("cx", e.value);
        break;
    case 3:
        ellipse.setAttribute("cy", e.value);
        break;
    case 4:
        mtable.select.style.stroke = e.value;
        break;
    case 5:
        mtable.select.style.fill = e.value;
        break;
    }

    modifiedEvent();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Arc description ---------------------------------------------------
function arcSelect() {
    mtable.typeSelect = 'arc';

    mtable.table = [{
            name: 'Radius x axis',
            value: parseInt(mtable.select.getAttribute("rx")),
            type: "number"
        }, {
            name: 'Radius y axis',
            value: parseInt(mtable.select.getAttribute("ry")),
            type: "number"
        }, {
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("cx")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("cy")),
            type: "number"
        }, {
            name: 'Start angle(°)',
            value: getDeg(mtable.select.getAttribute("startangle")),
            type: "number"
        }, {
            name: 'End angle(°)',
            value: getDeg(mtable.select.getAttribute("endangle")),
            type: "number"
        }, {
            name: 'Stroke',
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        }, {
            name: 'Style',
            value: 'CSS Code',
            type: "Button",
            setClick: 'openEditCSS()'
        }]

    addEventToTable();
}

function modifiedArc(pos,e) {
    var arc = mtable.select;

    switch (pos) {
    case 0:
        arc.setAttribute("rx", e.value);
        break;
    case 1:
        arc.setAttribute("ry", e.value);
        break;
    case 2:
        arc.setAttribute("cx", e.value);
        break;
    case 3:
        arc.setAttribute("cy", e.value);
        break;

    case 4:
        arc.setAttribute("startangle", e.value * 3.14 / 180);
        break;
    case 5:
        arc.setAttribute("endangle", e.value * 3.14 / 180);
        break;
    case 6:
        arc.style.stroke = e.value;
        break;
    }

    modifiedEvent();
    a = getArcPoints(mtable.select);
    mtable.select.setAttribute("d", arcToAttribute(a, 0, 0));
    if (mtable.resize.setElement) {
        setInitPos(mtable.resize);
        mtable.resize.limitsUpdate();
    }

}
//-------Image description ---------------------------------------------------
function imageSelect() {
    mtable.typeSelect = 'rect';
    mtable.table = [{
            name: 'Width',
            value: parseInt(mtable.select.getAttribute("width")),
            type: "number"
        }, {
            name: 'Height',
            value: parseInt(mtable.select.getAttribute("height")),
            type: "number"
        }, {
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
        }, {
            name: 'Image',
            value: 'Load',
            type: "Button",
            setClick: 'window.foo.getImage()'
        }
    ];
}

function modifiedImage(pos,e) {
    

    switch (pos) {
    case 0:
        rect.setAttribute("width", e.value);
        break;
    case 1:
        rect.setAttribute("height", e.value);
        break;
    case 2:
        rect.setAttribute("x", e.value);
        break;
    case 3:
        rect.setAttribute("y", e.value);
        break;

    }

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------codePy description ---------------------------------------------------
function codePySelect(self) {
  window.foo.importPythonFiles(function (val) {
	var codePy_ = mtable.select;
  //alert(val);
	mtable.typeSelect = 'codePy';
        mtable.table = [{
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
            }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
            }, {
            name: 'Width',
            value: parseInt(mtable.select.getAttribute("width")),
            type: "number"
            }, {
            name: 'Height',
            value: parseInt(mtable.select.getAttribute("height")),
            type: "number"
          },{
            name: 'Python file',
            value: mtable.select.getAttribute("fpython"),
            type: "select",
            array: val
          },{
              name: 'Python code',
              value: 'show',
              type: "Button",
              setClick: 'openCodePy()'
          }
        ];
        self.creat();
        });


}

function modifiedcodePy(pos,e) {

  var codePy_ = mtable.select;

        switch (pos) {

        case 0:
             codePy_.setAttribute("x", e.value);
            break;
        case 1:
             codePy_.setAttribute("y", e.value);
            break;
        case 2:
             codePy_.setAttribute("width", e.value);
            break;
        case 3:
             codePy_.setAttribute("height", e.value);
            break;
        case 4:
             codePy_.setAttribute("fpython", e.value);
            break;
		}


    modifedSizeCodePy(mtable.select);

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------codeHTML description ---------------------------------------------------
function codeHTMLSelect() {

	var codePy_ = mtable.select;
	mtable.typeSelect = 'codeHTML';
        mtable.table = [{
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
            }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
            }, {
            name: 'Width',
            value: parseInt(mtable.select.getAttribute("width")),
            type: "number"
            }, {
            name: 'Height',
            value: parseInt(mtable.select.getAttribute("height")),
            type: "number"
          }, {
               name: 'Model code',
               value: 'show',
               type: "Button",
              setClick: 'openEditHtml()'
            }, {
                name: 'Font.size',
                value: parseInt(mtable.select.firstChild.firstChild.style.fontSize),
                type: "number"
            }, {
                name: 'Font.family',
                value: mtable.select.firstChild.firstChild.style.fontFamily,
                type: "select",
                array: fontAvailable

            }, {
                name: 'Font.color',
                value: rgb2hex(mtable.select.firstChild.firstChild.style.color),
                type: "color"
            }
            , {
                name: 'Background',
                value: rgb2hex(mtable.select.firstChild.firstChild.style.backgroundColor),
                type: "color"
            }
        ];


}

function modifiedcodeHTML(pos,e) {

  var codeHTML_ = mtable.select;

        switch (pos) {

        case 0:
             codeHTML_.setAttribute("x", e.value);
            break;
        case 1:
             codeHTML_.setAttribute("y", e.value);
            break;
        case 2:
             codeHTML_.setAttribute("width", e.value);
            break;
        case 3:
             codeHTML_.setAttribute("height", e.value);
            break;
        case 5:
             mtable.select.firstChild.firstChild.style.fontSize =e.value+"px";
             break;
        case 6:
             mtable.select.firstChild.firstChild.style.fontFamily =e.value;
            break;
        case 7:
             mtable.select.firstChild.firstChild.style.color =e.value;
             break;
        case 8:
              mtable.select.firstChild.firstChild.style.backgroundColor =e.value;
              break;
		}


    modifedSizeCodeHtml(mtable.select);

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------codeSpice description ---------------------------------------------------
function codeSpiceSelect() {

	var codePy_ = mtable.select;
	mtable.typeSelect = 'codeSpice';
        mtable.table = [{
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
            }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
            }, {
            name: 'Width',
            value: parseInt(mtable.select.getAttribute("width")),
            type: "number"
            }, {
            name: 'Height',
            value: parseInt(mtable.select.getAttribute("height")),
            type: "number"
          }, {
               name: 'Model code',
               value: 'show',
               type: "Button",
              setClick: 'getSpicefromAttr()'
            }, {
                name: 'Font.size',
                value: parseInt(mtable.select.firstChild.firstChild.style.fontSize),
                type: "number"
            }, {
                name: 'Font.family',
                value: mtable.select.firstChild.firstChild.style.fontFamily,
                type: "select",
                array: fontAvailable

            }, {
                name: 'Font.color',
                value: rgb2hex(mtable.select.firstChild.firstChild.style.color),
                type: "color"
            }
            , {
                name: 'Background',
                value: rgb2hex(mtable.select.firstChild.firstChild.style.backgroundColor),
                type: "color"
            }
        ];


}

function modifiedcodeSpice(pos,e) {

  var codeHTML_ = mtable.select;

        switch (pos) {

        case 0:
             codeHTML_.setAttribute("x", e.value);
            break;
        case 1:
             codeHTML_.setAttribute("y", e.value);
            break;
        case 2:
             codeHTML_.setAttribute("width", e.value);
            break;
        case 3:
             codeHTML_.setAttribute("height", e.value);
            break;
        case 5:
             mtable.select.firstChild.firstChild.style.fontSize =e.value+"px";
             break;
        case 6:
             mtable.select.firstChild.firstChild.style.fontFamily =e.value;
            break;
        case 7:
             mtable.select.firstChild.firstChild.style.color =e.value;
             break;
        case 8:
              mtable.select.firstChild.firstChild.style.backgroundColor =e.value;
              break;
		}


    modifedSizeCodeSpice(mtable.select);

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}


//-------analysis description ---------------------------------------------------
function analysisSelect() {

    mtable.typeSelect='analysis';


    var analy=JSON.parse(mtable.select.getAttribute("description"));
    mtable.table = [{
            name: 'Simulation',
            value: analy.type,
            array: ['DC Sweep', 'Time Domain'],
            type: "select"
        }]

  if(analy.type=='DC Sweep'){
   var dc=analy.dcsweep;

   if(typePyAMS)
     mtable.table.push( {
        name: 'Paramater',
        value: dc.param,
        type: "Button",
        setClick: 'getParamAnalysis("dc","'+dc.param+'")' });
    else
      mtable.table.push({
            name: 'Paramater',
            value: dc.param,
            type: "select",
            array:getParamsToAnalysis()
            //setClick: 'getParamAnalysis("dc","'+dc.param+'")'
        });
        
    mtable.table.push({
                name: 'Start',
                value: dc.start,
                type: "text"
            });
    mtable.table.push({
                        name: 'Step',
                        value: dc.step,
                        type: "text"
                    });
    mtable.table.push({
                        name: 'Step',
                        value: dc.stop,
                        type: "text"
                        });
    
            }

    if(analy.type=='Time Domain'){
             var t=analy.time
              mtable.table.push({
                          name: 'Start',
                          value: t.start,
                          type: "text"
                      });
              mtable.table.push({
                                  name: 'Step',
                                  value: t.step,
                                  type: "text"
                              });
              mtable.table.push({
                                  name: 'Stop',
                                  value: t.stop,
                                  type: "text"
                                  });
                      }



        var elem= mtable.select.lastChild.firstChild;
        var layout =elem.getAttribute("layout");
        var data = elem.getAttribute("data");
        var layout = JSON.parse(elem.getAttribute("layout"));
        var data = JSON.parse(elem.getAttribute("data"));
      // if(!layout.font.color) layout.title.font.color='#000000';

        mtable.tableLyout=[];
        mtable.tableLyout = [
                     {
                          name: 'Title',
                          value: layout.title.text,
                          type: "text"
                        },
                        {
                           name: 'Font.color',
                           value: "#000000",
                           type: "color"
                        },
                        {
                           name: 'Font.size',
                           value: layout.font.size,
                           type: "number"
                        },
                        {
                        name: 'Font.family',
                        value: layout.font.family,
                        type: "select",
                        array: fontAvailable
                      },
                        {
                           name: 'Background (Tab)',
                           value: layout.paper_bgcolor,
                           type: "color"
                        },
                        {
                           name: 'Background (Plot)',
                           value: layout.plot_bgcolor,
                           type: "color"
                        },
                        {
                           name: 'Bordercolor',
                           value: layout.bordercolor,
                           type: "color"
                        }/*,
                        {
                           name: 'Axis.font.size',
                           value: layout.yaxis.font.size,
                           type: "number"
                        },
                        {
                           name: 'Axis.font.color',
                           value: layout.yaxis.font.color,
                           type: "color"
                        },
                        {
                        name: 'Axis.font.family',
                        value: layout.yaxis.font.fontFamily,
                        type: "select",
                        array: fontAvailable //bordercolor
                      }*/,
                        {
                           name: 'Axis.grid.color',
                           value: layout.yaxis.gridcolor,
                           type: "color"
                        },
                        {
                        name: 'Axis.grid.show',
                        value: layout.yaxis.showgrid,
                        type: "select",
                        array: [true,false]
                        },
                        {
                        name: 'Legend.show',
                        value: layout.showlegend,
                        type: "select",
                        array: [true,false]
                        }]

}

function modifiedAnalysis(pos,e) {

      var analy=JSON.parse(mtable.select.getAttribute("description"));

      if(pos>=5){
        var elem= mtable.select.lastChild.firstChild;
        var layout = JSON.parse(elem.getAttribute("layout"));
        var data = JSON.parse(elem.getAttribute("data"));
      }

        switch (pos) {
        case 0:
            analy.type=e.value;
            mtable.select.setAttribute("description", JSON.stringify(analy));
            analysisSelect();
            mtable.parent.creat();
            return;
            break;
        case 1:
             if(analy.type=='Time Domain')
               analy.time.start=e.value;
             else
               analy.dcsweep.param=e.value;
             mtable.select.setAttribute("description", JSON.stringify(analy));
            break;
        case 2:
           if(analy.type=='Time Domain')
              analy.time.step=e.value;
          else
              analy.dcsweep.start=e.value;
           mtable.select.setAttribute("description", JSON.stringify(analy));
            break;
        case 3:
           if(analy.type=='Time Domain')
              analy.time.stop=e.value;
          else
              analy.dcsweep.step=e.value;
           mtable.select.setAttribute("description", JSON.stringify(analy));
            break;
        case 4:
        if(analy.type=='DC Sweep')
           analy.dcsweep.stop=e.value;
           mtable.select.setAttribute("description", JSON.stringify(analy));
            break;

        case 5:
            layout.title.text=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 6:
            layout.font.color=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 7:
            layout.font.size=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 8:
            layout.font.family=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 9:
            layout.paper_bgcolor=e.value;
            elem.style.background=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 10:
            layout.plot_bgcolor=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 11:
            layout.bordercolor=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 12:
        //alert(12);
            layout.yaxis.gridcolor=e.value;
            layout.xaxis.gridcolor=e.value;
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 13:
            layout.yaxis.showgrid=e.value=='true';
            layout.xaxis.showgrid=e.value=='true';
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;

        case 14:
            layout.showlegend=e.value=='true';
            Plotly.newPlot(elem, data, layout, plotConfig);
        break;
        }


 if(pos>=5){
   layout= JSON.stringify(layout);
   data= JSON.stringify(data);
   elem.setAttribute("layout", layout);
   elem.setAttribute("data", data);
 }



    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------ioparam description ---------------------------------------------------
function ioparamSelect() {

    mtable.typeSelect = 'ioparam';
    mtable.table = [{
            name: 'Type',
            value: mtable.select.getAttribute("type"),
            array: ['in', 'out'],
            type: "select"
        }, {
            name: 'Rotate',
            value: mtable.select.getAttribute("rotate"),
            array: ['0°', '90°', '180°', '270°'],
            type: "select"
        }, {
            name: 'Name',
            value: mtable.select.getAttribute("param"),
            type: "text"
        }
    ]
}
function modifiedioparam(pos,e) {

    var x = parseInt(mtable.select.getAttribute("x"));
    var y = parseInt(mtable.select.getAttribute("y"));

    switch (pos) {
    case 0:
        mtable.select.setAttribute("type", e.value);
        setparamPos(x, y, mtable.select);
        break;
    case 1:
        mtable.select.setAttribute("rotate", e.value);
        setparamPos(x, y, mtable.select);
        break;
    case 2:
        mtable.select.setAttribute("param", e.value);
        mtable.select.childNodes[0].textContent = e.value;
        setparamPos(x, y, mtable.select);
        break;
    }

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Pin description ---------------------------------------------------
function pinSelect() {

    var r = getPinDescription(mtable.select)
        if (!mtable.select.childNodes[2].style.fill)
            mtable.select.childNodes[2].style.fill = 'RGB(0,0,0)';

        mtable.typeSelect = 'pin';
    mtable.table = [{
            name: 'Size',
            value: parseInt(r.size),
            type: "number",
            condition: [['min', '3'], ['max', '25']]
        }, {
            name: 'Rotation',
            value: r.rotation,
            array: ['0°', '90°', '180°', '270°'],
            type: "select"
        }, {
            name: 'Pos.x',
            value: parseInt(r.x),
            type: "number"
        }, {
            name: 'Pos.y',

            value: parseInt(r.y),
            type: "number"
        }, {
            name: 'Name',
            value: r.text,
            type: "text"
        }, {
            name: 'Name.display',
            array: ["none", "block"],
            value: mtable.select.childNodes[2].style.display,
            type: "select"

        }, {
            name: 'Font.size',
            value: parseInt(mtable.select.childNodes[2].style.fontSize),
            type: "number"
        }, {
            name: 'Font.family',
            value: mtable.select.childNodes[2].style.fontFamily,
            type: "select",
            array: fontAvailable

        }, {
            name: 'Font.color',
            value: rgb2hex(mtable.select.childNodes[2].style.fill),
            type: "color"
        }, {
            name: 'Type',
            array: ["simple", "dot", "clk", "dotclk", "input", "output"],
            value: mtable.select.getAttribute("type"),
            type: "select"

        }, {
            name: 'Polarity',
            array: ["positive", "negative", "mixed"],
            value: r.polarity,
            type: "select"

        }, {
            name: 'Stroke',
            value: rgb2hex(mtable.select.childNodes[0].style.stroke),
            type: "color"
        }
    ]
}

function modifiedPin(pos,e) {
    var pin = mtable.select;
    var px = mtable.px;
    var points = getArrayPoints(mtable.select);
    function sign(a, b) {
        if (a > b)
            return 1;
        else
            return -1;
    }

    switch (pos) {
    case 0:
        var size = e.value;
           size = controlPinSize(size);
        if (points[0].y == points[1].y)
            points[1].x = points[0].x + sign(points[1].x, points[0].x) * size;
        else if (points[0].x == points[1].x)
            points[1].y = points[0].y + sign(points[1].y, points[0].y) * size;
        mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
        drawingPin(mtable.select);
        mtable.table[0].value = size;
        break;

    case 1:
        size = parseInt(mtable.table[0].value);
        switch (e.value) {
        case '0°':
            points[1].y = points[0].y;
            points[1].x = points[0].x + size;
            mtable.table[1].value = '0°';
            break;
        case '90°':
            points[1].x = points[0].x;
            points[1].y = points[0].y + size;
            mtable.table[1].value = '90°';
            break;
        case '180°':
            points[1].y = points[0].y;
            points[1].x = points[0].x - size;
            mtable.table[1].value = '180°';
            break;
        case '270°':
            points[1].x = points[0].x;
            points[1].y = points[0].y - size;
            mtable.table[1].value = '270°';
            break;
        }

        mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
        drawingPin(mtable.select);
        break;

    case 2:
        var dx = points[1].x - points[0].x;
        var dy = points[1].y - points[0].y;
        points[0].x = parseInt(e.value);
        points[1].x = points[0].x + dx;
        points[1].y = points[0].y + dy;
        mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
        drawingPin(mtable.select);
        break;

    case 3:
        var dx = points[1].x - points[0].x;
        var dy = points[1].y - points[0].y;
        points[0].y = parseInt(e.value);
        points[1].x = points[0].x + dx;
        points[1].y = points[0].y + dy;
        mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
        drawingPin(mtable.select);
        break;

    case 4:
        mtable.select.childNodes[2].textContent = controlText(e.value);
        break;

    case 5:
        mtable.select.childNodes[2].style.display = e.value;
        break;

    case 6:
        mtable.select.childNodes[2].style.fontSize =e.value;
        mtable.select.childNodes[3].style.fontSize =e.value;
        break;

    case 7:
        mtable.select.childNodes[2].style.fontFamily =e.value;
        mtable.select.childNodes[3].style.fontFamily =e.value;
        break;

    case 8:
        mtable.select.childNodes[2].style.fill =e.value;
        mtable.select.childNodes[3].style.fill =e.value;
        break;

    case 9:
        mtable.select.setAttribute("type", e.value);
        drawingPin(mtable.select);
        break;

    case 10:
        mtable.select.childNodes[3].textContent = getPolyText(e.value);
        break;
    case 11:
        mtable.select.childNodes[0].style.stroke = e.value;
        drawingPin(mtable.select);
        break;

    }

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Text description ---------------------------------------------------
//https://htmldog.com/references/css/properties/font-weight/
function textSelect() {
 
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

function setPosText() {
    var x = mtable.select.getAttribute("x");
    var y = mtable.select.getAttribute("y");
    var r = mtable.select.getAttribute("r");
    mtable.select.setAttribute('transform', 'rotate(' + r + ' ' + x + ' ' + y + ')');
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
}
//-------Polyline description-------------------------------------
function polylineSelect() {
    mtable.typeSelect = 'polyline';
    mtable.table = [{
            name: 'Stroke',
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        },
        {
            name: 'Style',
            value: 'CSS Code',
            type: "Button",
            setClick:'openEditCSS()'
            }];
       


    addEventToTable();
}

function polylineModified(pos,e) {

    var px = mtable.px;

    switch (pos) {
    case 0:
        mtable.select.style.stroke = e.value;
        break;
    }
    modifiedEvent();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Polygon description-------------------------------------
function polygonSelect() {
    mtable.typeSelect = 'polygon';
    mtable.table = [{
            name: 'Stroke',
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        },{
            name: 'Fill',
            value: rgb2hex(mtable.select.style.fill),
            type: "color"
        },{
            name: 'Style',
            value: 'CSS Code',
            type: "Button",
           setClick:'openEditCSS()'
        }];

    addEventToTable();
}

function polygonModified(pos,e) {

    var px = mtable.px;

    switch (pos) {
    case 0:
        mtable.select.style.stroke = e.value;
        break;
    case 1:
        mtable.select.style.fill = e.value;
        break;
    }
    modifiedEvent();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Part description-------------------------------------
function partSelect(self) {
 
    mtable.typeSelect = 'part';
    getPartPyAMSDescription(self);

}

function partModified(pos,e) {

       setPartPyAMSDescription(pos,e);
}

//-------Net selected-----------------------------------------
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

//-------Label description-------------------------------------

function labelSelected() {
    mtable.typeSelect = 'label';
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
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
        }, {
            name: 'Fill',
            value: rgb2hex(mtable.select.style.fill),
            type: "color"
        }, {
            name: 'Label',
            value: mtable.select.textContent,
            type: "text"
        }
    ]
}

function labelModified(pos,e) {

    var px = mtable.px;

    switch (mtable.pos) {
    case 0:
        mtable.select.style.fontSize = e.value;
        break;
    case 1:
        mtable.select.style.fontFamily = e.value;
        break;
    case 2:
        mtable.select.setAttribute("x", e.value * px);
        setPosText();
        break;
    case 3:
        mtable.select.setAttribute("y", e.value * px);
        setPosText();
        break;
    case 4:
        mtable.select.style.fill = e.value;
        break;
    case 5:
        mtable.select.textContent = e.value;
        break;
    }
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatmodifiedEllipse();
}

//-------Reference description-------------------------------------

function refSelected() {
    mtable.typeSelect = 'ref';
  //  alert(drawing.pageType);
    if (drawing.pageType == 'sym') {
        deletMultiRef();
        var ref = mtable.select.textContent;
        ref=ref.slice(0, -1);
    } else
        var ref = mtable.select.textContent;
        mtable.ref=ref;
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
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
        }, {
            name: 'Fill',
            value: rgb2hex(mtable.select.style.fill),
            type: "color"
        }, {
            name: 'Reference',
            value: ref,
            type: "text"
        }
    ]
}

function refModified(pos,e) {

    switch (pos) {
    case 0:
        mtable.select.style.fontSize= e.value;
        break;
    case 1:
        mtable.select.style.fontFamily= e.value;
        break;
    case 2:
        mtable.select.setAttribute("x", e.value);
        setPosText();
        break;
    case 3:
        mtable.select.setAttribute("y", e.value);
        setPosText();
        break;
    case 4:
        mtable.select.style.fill = e.value;
        break;
    case 5:
        if (drawing.pageType == 'sym') {
            drawing.symbol.reference=e.value;
            mtable.select.textContent= e.value + '?';

        } else {
            if(e.value.length>0){
              var l = e.value;
              if(l[0].toUpperCase()!=mtable.ref[0])
                   l=setCharAt(l,0,mtable.ref[0]);
               mtable.select.textContent = l;
               parElem = mtable.select.parentElement;
               parElem.setAttribute('sref', l);
              }
        }
    }
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Paramater description-------------------------------------

function paramSelected() {
    mtable.typeSelect = 'param';
    mtable.select.p = mtable.select.textContent.split("=");
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
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
        }, {
            name: 'Fill',
            value: rgb2hex(mtable.select.style.fill),
            type: "color"
        }, {
            name: 'Paramater',
            value: mtable.select.p[0],
            type: "text"
        }, {
            name: 'Value',
            value: mtable.select.p[1],
            type: "text"
        }
    ]
}

function paramModified(pos,e) {

    switch (pos) {
    case 0:
        mtable.select.style.fontSize = e.value;
        break;
    case 1:
        mtable.select.style.fontFamily = e.value;
        break;
    case 2:
        mtable.select.setAttribute("x", e.value);
        setPosText();
        break;
    case 3:
        mtable.select.setAttribute("y", e.value);
        setPosText();
        break;
    case 4:
        mtable.select.style.fill = e.value;
        break;
    case 5:
        mtable.select.p[0]=e.value;
        mtable.select.textContent = e.value + '=' + mtable.select.p[1];
        break;
    case 6:
        mtable.select.p[1]=e.value;
        mtable.select.textContent = mtable.select.p[0] + '=' + e.value;
        break;

    }
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}
//-------oscilloscope description-------------------------------
function oscilloscopeSelect() {
    mtable.typeSelect = 'oscilloscope';
    mtable.table = [];
    //var str0 = mtable.select.getAttribute('cha').split('=');
    //var str1 = mtable.select.getAttribute('chb').split('=');
    mtable.table = [{
            name: 'Title',
            value: mtable.select.getAttribute("title"),
            type: "text"
        }, {
            name: 'Ch A.Color',
            value: rgb2hex(mtable.select.childNodes[0].childNodes[0].style.stroke),
            type: "color"
        }, {
            name: 'Ch B.Color',
            value: rgb2hex(mtable.select.childNodes[1].childNodes[0].style.stroke),
            type: "color"
        }, {
            name: 'F(x)',
            value: mtable.select.getAttribute("fx"),
            array: ['A|B', 'A(B)', 'B(A)'],
            type: "select"
        }, {
            name: 'Width',
            value: parseInt(mtable.select.getAttribute("width")),
            type: "number"
        }, {
            name: 'Height',
            value: parseInt(mtable.select.getAttribute("height")),
            type: "number"
        }, {
            name: 'Pos.x',
            value: parseInt(mtable.select.getAttribute("x")),
            type: "number"
        }, {
            name: 'Pos.y',
            value: parseInt(mtable.select.getAttribute("y")),
            type: "number"
        }
    ]

}

function oscilloscopeModified() {

    switch (mtable.pos) {
    case 0:
        mtable.select.setAttribute("title", mtable.newElem.value);
        break;
    case 1:
        mtable.select.childNodes[0].childNodes[0].style.stroke = mtable.newElem.value;
        drawingPin(mtable.select.childNodes[0]);
        break;
    case 2:
        mtable.select.childNodes[1].childNodes[0].style.stroke = mtable.newElem.value;
        drawingPin(mtable.select.childNodes[1]);
        break;
    case 3:
        mtable.select.setAttribute("fx", mtable.newElem.value);
        break;
    case 4:
        mtable.select.setAttribute("width", mtable.newElem.value);
        modifedSizeDivByoscilloscope(mtable.select);
        break;
    case 5:
        mtable.select.setAttribute("height", mtable.newElem.value);
        modifedSizeDivByoscilloscope(mtable.select);
        break;
    case 6:
        mtable.select.setAttribute("x", mtable.newElem.value);
        modifedSizeDivByoscilloscope(mtable.select);
        break;
    case 7:
        mtable.select.setAttribute("y", mtable.newElem.value);
        modifedSizeDivByoscilloscope(mtable.select);
        break;

    }

}

//-------Probe  description----------------------------------------------------------------

function probeSelect() {

    mtable.typeSelect='probe';
    var str = mtable.select.childNodes[2].textContent.split('=');
    
    mtable.table = [{
            name: 'OP',
            value: 'Run ▶',
            type: "Button",
            setClick: 'ioProbe()'
        },/* {
            name: 'Color',
            value: rgb2hex(mtable.select.childNodes[1].style.stroke),
            type: "color"
        },*/  {
			name: 'Pos',
            value: str[0],
            type: "Button",
            setClick: 'ioPosProbe()'
			}
    ];
    
}

function probeModified(pos,e) {

    switch (pos) {
    case 0:
        mtable.select.childNodes[2].textContent = e.value;
        break;
    case 1:
        mtable.select.childNodes[2].textContent = e.value;
        var c=colorByType(e.value);
        mtable.select.childNodes[0].style.stroke =c;
        mtable.select.childNodes[1].style.stroke =c;
        mtable.select.childNodes[1].style.fill   =c;
        findPosProb();
        probeSelect();
        mtable.parent.creat();
	//	modifedProbeDisplay(mtable.select)
        break;

    }

    structProbe(mtable.select);
}
