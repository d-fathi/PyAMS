/*
#-------------------------------------------------------------------------------
# Name:        Analysis.js
# Description: Analysis circuit
# Author:      d.fathi
# Created:     29/04/2021
# Update:      17/08/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free 
#-------------------------------------------------------------------------------
*/
//https://www.multisim.com/help/simulation/grapher/dc-sweep/
//https://knowledge.ni.com/KnowledgeArticleDetails?id=kA03q000000YH7vCAG&l=en-US

xNameAnalysis='';


//--------------------------------------------Creat Analysis----------------------------------------------------//

function addPlotAnalysis(elem) {

var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
   // newElement.setAttribute("class", "draggable");
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 440);
    newElement.setAttribute("height", 360);
    newElement.innerHTML = "<div name='plots' style='border-style:double;zoom:60%'  ondblclick='showPlotInModel(this)'></div>";
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



function addAnalysis(elem,type){
  var analy={type:'DC Sweep',title:'',dcsweep:{param:'Non',unit:'',start:'0',stop:'0',step:'0'},time:{start:'0sec',stop:'0sec',step:'0sec'},yAxe:{outputs:[],logarithmic:false},xAxe:{name:'None',unit:'',type:'',color:"#000000",logarithmic:false, used:false},secondsweep:{used:false,type:'List',param:'Non',unit:'',list:'',start:'0',stop:'0',step:'0'}};
	elem.setAttribute("description", JSON.stringify(analy));
}


//---------------------------------To display the analysis result in the interface ------------------------------------------------------//
function itSelectShowAnalysis()
{
	if (drawing.resize.setElement) {
    if(drawing.resize.setElement.getAttribute("name")== 'codePy')
       {
         var tabcontent = drawing.resize.setElement.getElementsByClassName("tabcontent");
         for (i = 0; i < tabcontent.length; i++) {
           if(tabcontent[i].style.display == "block")
             {
               if(tabcontent[i].firstChild.getAttribute("name")== 'plots')
                 return true;
               else
                 break;
             }
         }
      }

    if(drawing.resize.setElement.getAttribute("name")== 'analysis')
        return true;
    }

	return false;
}

function showAnalysis(){
  if(mtable.select.getAttribute("name")== 'codePy')
  {
    var tabcontent = mtable.select.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++)
      if(tabcontent[i].style.display == "block")
        {
          var elem= tabcontent[i].firstChild;
          var layout =elem.getAttribute("layout");
          var data = elem.getAttribute("data");
          return [layout,data];
        }
  } else {
  var elem= mtable.select.lastChild.firstChild;
  var layout =elem.getAttribute("layout");
  var data = elem.getAttribute("data");
  return [layout,data];
}
}

function setLayout(layout){
  if(mtable.select.getAttribute("name")== 'codePy')
  {
    var tabcontent = mtable.select.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++)
      if(tabcontent[i].style.display == "block")
        {
          var elem= tabcontent[i].firstChild;
          var data = JSON.parse(elem.getAttribute("data"));
          Plotly.newPlot(elem, data, layout, plotConfig);
          elem.setAttribute("layout", JSON.stringify(layout));
          modifedSizeCodePy(mtable.select);
          return;
        }
  } else {
    var elem= mtable.select.lastChild.firstChild;
    var data = JSON.parse(elem.getAttribute("data"));
    Plotly.newPlot(elem, data, layout, plotConfig);
    elem.setAttribute("layout", JSON.stringify(layout));
    modifedSizeAnalysis(mtable.select);
  }
}



function itSelectAnalysis()
{
	if (drawing.resize.setElement) {
    if(drawing.resize.setElement.getAttribute("name")== 'codePy')
       if(drawing.resize.setElement.getAttribute("fpython")!='None')
        return true;
      if(drawing.resize.setElement.getAttribute("name")== 'analysis')
        return true;
    }

	return false;
}


//----------------- Draw simulation result------------------------------------------------------------------//
function setDataPlot(list)
{
  
  if(list[0]=='pyCode'){
     pyCodeData(list);
     return;
   }
	var elem=drawing.resize.setElement;
  var analy=JSON.parse(elem.getAttribute("description"));
	var title=analy.title;
  var outputs=analy.yAxe.outputs
  var secondsweep=analy.secondsweep;
  var elem0= drawing.resize.setElement.lastChild.firstChild;
  var layout = JSON.parse(elem0.getAttribute("layout"));

  if(analy.type=='Time Domain')
    var xNameAnalysis='Time[sec]'
  else
	  var xNameAnalysis=analy.dcsweep.param+'['+analy.dcsweep.unit+']';   //getUnit(analy.dcsweep.param)

	if(analy.xAxe.used)
		xNameAnalysis=analy.xAxe.name+'['+analy.xAxe.unit+']';

  layout.xaxis.title.text=xNameAnalysis;
  if(secondsweep.used) {
  var t=secondsweep.list.split(',');
	var data=[];

for(var j=0; j<list.length; j++){
  var l=list[j];
  var n=l.length-1;
  t[j]='('+secondsweep.param+'='+t[j]+')';
  for (var i = 0; i < outputs.length; i++) {
	    	data.push({
                type: 'scatter',
                name: outputs[i].name+'['+outputs[i].unit+']  '+t[j],
               /* line: {
                    color: outputs[i].color
                },*/
                y: l[i],
                x: l[n]
            });
		}
  }

  } else {
    var data=[];
    var l=list[0];
    var n=l.length-1;
  
    for (var i = 0; i < outputs.length; i++) {
          data.push({
                  type: 'scatter',
                  name: outputs[i].name+'['+outputs[i].unit+']',
                  line: {
                      color: outputs[i].color
                  },
                  y: l[i],
                  x: l[n]
              });
      }
  }


var elem=drawing.resize.setElement.lastChild.firstChild;
//elem.innerHTML = "<div name='plots' style='border-style: double;zoom:60%'  ondblclick='showPlotInModel(this)'></div>";
Plotly.newPlot(elem, data, layout, plotConfig);
Plotly.update(elem);
}
//---------------------------------update all plots--------------------------------------------------------------//
function updateAnalysis() {
   var t=document.getElementById("sym").children;
   for(var i=0; i<t.length; i++){
    if(t[i].getAttribute("name")=='analysis') {
       var elem=t[i].lastChild.firstChild;
       var layout=JSON.parse(elem.getAttribute("layout"));
       var data=JSON.parse(elem.getAttribute("data"));
       Plotly.newPlot(elem, data, layout, plotConfig);
   }
  }
}





function getParamsToAnalysis() {
    var parts = document.getElementsByName('part');
    var list = [];
    for (var i = 0; i < parts.length; i++)
        if (!strToBool(parts[i].firstChild.getAttribute('std'))) {
          if(modelParam.includes(parts[i].firstChild.getAttribute('type')))
            list.push(parts[i].getAttribute('sref'));
        }
    list.push('Temp');
    return list;
}







//---------------------------------get the analysis description-----------------------------------------------//
function getAnaly()
{

	if(!drawing.resize.setElement.getAttribute("name")) return [false];
	    elem=drawing.resize.setElement;
  if(elem.getAttribute("name")=='analysis')
      return [true,JSON.parse(elem.getAttribute("description"))];
  else if(elem.getAttribute("name")== 'codePy')
      return [true,elem.getAttribute("fpython")];
	return [false]

}
