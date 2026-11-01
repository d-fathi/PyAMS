/*
#-------------------------------------------------------------------------------
# Name:        Analysis.js
# Description: Analysis circuit
# Author:      d.fathi
# Created:     29/04/2021
# Update:      21/07/2026
# Copyright:   (c) PyAMS 2026
# Licence:     free 
#-------------------------------------------------------------------------------
*/


//--------------------------------------------Creat Analysis----------------------------------------------------//

function addPlotAnalysis(elem) {

var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
   // newElement.setAttribute("class", "draggable");
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 440);
    newElement.setAttribute("height", 360);
    newElement.innerHTML = "<div name='plots' style='border-style:double; zoom:60%;'  ondblclick='showPlotInModel(this)'></div>";
    elem.appendChild(newElement);
}


function modifedSizeAnalysis(element) {


    var a=100/60;
    if (element.getAttribute("name") == "analysis") {
        var x = parseInt(element.getAttribute("x"));
        var y = parseInt(element.getAttribute("y"));
        var w = parseInt(element.getAttribute("width"));
        var h = parseInt(element.getAttribute("height"));

        element.setAttribute('transform', "translate("+x+","+y+")");
        element.lastChild.setAttribute("width", w);
        element.lastChild.setAttribute("height", h);

        var e = element.lastChild.firstChild;
        var gd = e;

        Plotly.redraw(e);
        e.style.width = a*(w-6);
        e.style.height =a*(h-6);

        update = {
            width:a*(w-8),
            height:a*(h-8)
        };

        Plotly.relayout(e,update);
    }
}

function setLayout_() {
  return   {
   /* title: {text:''},*/
    margin: {
          l: 35,
          r: 25,
          b: 80,
          t: 35
      },
    font: { color: '#333333', size: 11, family: 'Arial' },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#f8f8f8',
    bordercolor: '#cccccc',
    yaxis: { 
      type: 'linear', 
      gridcolor: '#e0e0e0', 
      showgrid: true 
    },
    xaxis: { 
      type: 'linear', 
      gridcolor: '#e0e0e0', 
      showgrid: true 
    },
    showlegend: true, 
    grid: { rows: 1, columns: 1,    pattern: 'independent',  roworder: 'bottom to top'}
  }
}


function addAnalysis(elem){
  var analy={type:'DC Sweep',title:'',dcsweep:{param:'Non',unit:'',start:'0',stop:'0',step:'0'},
  time:{start:'0s',stop:'0s',step:'0s'},
  ac:{start: '1', stop: '1000', step: '100', scale: 'dec' , type: 'de'}}


  analy.yAxe=[];
  analy.xAxe={name:'None',unit:'',type:'',color:"#000000", used:false};
  analy.layout=setLayout_();
  analy.options={};
  analy.sweep={ param:'', values:'[]'};


  analy.dcsweep.modified=false;
  analy.time.modified=false;
  analy.ac.modified=false;

	elem.setAttribute("description", JSON.stringify(analy));
}


//---------------------------------update all plots--------------------------------------------------------------//


function getAnalysis() {
  	var elem=drawing.resize.setElement;
    var analy=JSON.parse(elem.getAttribute("description"));
    

      if(analy.type=='DC Sweep'){
         var dc=analy.dcsweep;
         var analysis={type:"dc",param:dc.param,start:dc.start,stop:dc.stop,step:dc.step,oupouts:{names:[],color:[]},options: analy.options};
       } else if(analy.type=='Time Domain') {
         var tr=analy.time;
         var analysis={type:analy.type,start:tr.start,step:tr.step,stop:tr.stop,oupouts:{names:[],color:[]},options:  analy.options};
      } else if(analy.type=='AC Analysis') {
        var ac=analy.ac;
        var analysis={type:"ac",start:ac.start,stop:ac.stop,step:ac.step,scale:ac.scale,oupouts:{names:[],color:[]},options:  analy.options};
      }

      var r=analy.yAxe;
      for(var i=0;i<r.length;i++){
          analysis.oupouts.names.push(r[i].name);
          analysis.oupouts.color.push(r[i].color);
       }

      if(analy.xAxe.used && ((analy.type=='DC Sweep')||(analy.type=='Time Domain')))
          analysis.xAxe=analy.xAxe.name;
      if(analy.options.second_sweep && analy.options.second_sweep==true){
          analysis.sweep={param:analy.sweep.param, values:analy.sweep.values};
        }

      return analysis;
}





