
/*
#--------------------------------------------------------------------------------------------------
Name:        simulation.js
Author:      d.fathi
Created:     05/09/2026
Updated:     17/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/



var libarayPath='';
 // op Simulation
 function opAnalysis(){



 }



 // analysis simulation

async function runSimulation() {
/*

code=`
from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, BJT, TrapezoidVoltage

# Define elements
V1 = TrapezoidVoltage("Vcc", "0")      # 5 V supply, switched on at t = 0
Rc1 = Resistor("Vcc", "Out1")
Rc2 = Resistor("Vcc", "Out2")
Rb1 = Resistor("Vcc", "B1")
Rb2 = Resistor("Vcc", "B2")
C1 = Capacitor("Out1", "B2")
C2 = Capacitor("Out2", "B1")
Q1 = BJT("Out1", "B1", "0")            # (collector, base, emitter)
Q2 = BJT("Out2", "B2", "0")

# Set element parameters
V1.setParams("V0=0V V1=5V Td=0 Tr=20us Tw=10 Tf=1us T=20")
Rc1.setParams("R=1KΩ")
Rc2.setParams("R=1.1KΩ")
Rb1.setParams("R=47KΩ")
Rb2.setParams("R=47KΩ")
C1.setParams("C=10nF")
C2.setParams("C=10nF")

`


analysis={
type:"Time Domain",
start:"0.0s",
step:"3us",
stop:"5ms",
oupouts:{
    names:["Out1", "Out2", "C1.I", "C2.I"],
	color:["#00ff00","#ff0000","#0000ff","#ff00ff"],
	}
}
*/
var code=generateCodePyofCircuit();
var analysis= getAnalysis();
const results = await drawing.runPyAMSAnalysis(code, analysis);
var elem=drawing.resize.setElement.lastChild.firstChild;
drawing.plotPyAMSResults(elem, results); 
 modifedSizeAnalysis(drawing.resize.setElement);
 plotsSaveDataLayoutInDiv();
 drawing.saveData(analy.type+' analysis');
}



  
 


  function dataPlot(list,spice)
{
  
	var elem=drawing.resize.setElement;
    var analy=JSON.parse(elem.getAttribute("description"));

      if(analy.type=='DC Sweep'){
         var dc=analy.dcsweep;
         var r=dc.yAxe;
	       var xa=dc.xAxe;
         var layout=dc.layout;
         var xNameAnalysis=analy.dcsweep.param
       } else if(analy.type=='Time Domain') {
         var tr=analy.time
         var r=tr.yAxe;
         var xa=tr.xAxe;
         var layout=tr.layout;
         var xNameAnalysis='Time[sec]'
      } else if(analy.type=='AC Analysis') {
         var ac=analy.ac;
         var r=ac.yAxe;
         var xa=ac.xAxe;  
         var layout=ac.layout;
         var xNameAnalysis='Frequency[Hz]'

       }

// X Axe descriptio---------------------------------------------------------------------------------
 




layout.xaxis.title=xNameAnalysis;

 
var xAxe=xa;
var setX=[];

if(xAxe.used){
  var xpos=list.length-1;
  layout.xaxis.title=spice.outputs[xpos].name +' ['+spice.outputs[xpos].unit+']';
     for(var j=0; j< list[xpos].data.length; j++){
     setX.push(list[xpos].data[j][1]);
    }
} else {
  var xpos=list.length;
}


//Plot data------------------------------------------------------------------------------------------
  
  var data=[];
  for (var i = 0; i < xpos; i++) {

    var x=[];
    var y=[];

   if(xAxe.used)
    x=setX;

   for(var j=0; j< list[i].data.length; j++){
    if(!xAxe.used)
     x.push(list[i].data[j][0]);
     y.push(list[i].data[j][1]);
    }
   
    if(spice.outputs[i].func)
      var func=spice.outputs[i].func;
    else
      var func='';

    if(spice.outputs[i].pos==1)
      var pos='';
    else
      var pos=spice.outputs[i].pos;
    
    data.push({
                  type: 'scatter',
                  name: spice.outputs[i].name +' '+func+'['+spice.outputs[i].unit+']',
                  line: {
                      color: spice.outputs[i].color
                  },
                  y: y,
                  x: x,
                  xaxis: 'x'+pos,
                  yaxis: 'y'+pos
              });
  }

  var n= layout.grid.rows*layout.grid.columns;
  for(var i=2; i<=n; i++)
    layout['xaxis'+i].title=layout.xaxis.title;
    


  
var elem=drawing.resize.setElement.lastChild.firstChild;
//elem.innerHTML = "<div name='plots' style='border-style: double;zoom:60%'  ondblclick='showPlotInModel(this)'></div>";
Plotly.newPlot(elem, data, layout, plotConfig);
Plotly.update(elem);
 modifedSizeAnalysis(drawing.resize.setElement);
 plotsSaveDataLayoutInDiv();
 drawing.saveData(analy.type+' analysis');
}
