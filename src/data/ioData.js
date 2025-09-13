/*
#-------------------------------------------------------------------------------
# Name:        ioData.js
# Description: In and Out data
# Author:      d.fathi
# Created:     29/08/2021
# Update:      24/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free 
#-------------------------------------------------------------------------------
*/

const { use } = require("react");

function generatePythonScriptForParams(){
    // get pins-----------------------------------
    const pins = [...mtable.select.children]
        .filter(child => child.getAttribute("name") === "pin")
        .map(() => '"0"')
        .join(',');


    // get paramtres-------------------------------
    var params=getParams();

    // get model name------------------------------
    var modelName= mtable.select.getAttribute("model");
    var folder= mtable.select.getAttribute("directory");

    if(folder!='Project[Models]')
      var setModel=`from pyams.models import ${modelName} `;
    else
      var setModel=`import sys\nsys.path.append(r'${drawing.modelsPath}')\nfrom ${modelName} import ${modelName} `; 
    

    //get lib path---------------------------------
 



let pythonScript = `
import json;
${setModel};
from pyams.lib import getParams
X = ${modelName}(${pins});
X.setParams('${params}');
params = getParams(X)
print(json.dumps(params))  #
                `;
    return pythonScript;

}

function generatePythonScriptForFindModel(modelName,folder){

  if(folder=='Project[Models]'){
    var func=`find_class_definition('${modelName}', os.path.join(r'${drawing.modelsPath}')) `;
  }
  else
    var func=`find_class_definition('${modelName}', os.path.join(r'${drawing.path}', 'pyams','models'))`;

let pythonScript = `
import os
import json;

def find_class_definition(class_name, root_dir='.'):
    matches = []
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.py'):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        for lineno, line in enumerate(file, start=1):
                            if line.strip().startswith(f'class {class_name}'):
                                matches.append({'filepath':filepath, 'line':lineno, 'file':filename})
                except (UnicodeDecodeError, FileNotFoundError):
                    continue
    return matches


results =${func};
print(json.dumps(results))
                `;
    return pythonScript;
}


function generatePythonScriptForNewModel(modelName){

  let date_str = new Date().toLocaleDateString();
  let time_str = new Date().toLocaleTimeString();

  let pythonScript = `
#-------------------------------------------------------------------------------
# Name:        ${modelName}
# Author:
# Created:     ${date_str} at ${time_str}
# Modified:    ${date_str}
# Copyright:   (c)
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current

# {modelName} model----------------------------------------------------------------
class ${modelName} (model):
       pass
`;
    return pythonScript;
}


async function findModel(modelName,folder){

  var pythonScript=generatePythonScriptForFindModel(modelName,folder);

  try {
      const result = await window.electron.findModel(pythonScript);
      if(result.length==0)
      {
                var message='The model '+modelName+' does not exist. Do you want to create it?'
                
                const result = await window.electron.showConfirmationDialog( message);
                if (result==0) {
                    window.electron.newFilePy(generatePythonScriptForNewModel(modelName));
                }
      }
      else
        window.electron.editText(result[0].filepath, result[0].line);
    } catch (error) {
      window.electron.showAlert('Error',error.message);
  }
   window.electron.creatPythonModels(); // Ensure __init__.py is created with imports
} 

/*async function getModelNamesForParts(){
  var listp = document.getElementsByName('part');
    for(var i=1;i<listp.length;i++)
      if(listp[i]. getAttribute("directory")!='standard'){
        var pythonScript=generatePythonScriptForFindModel(listp[i].getAttribute("model"),listp[i].getAttribute("directory"));
        try {
            const result = await window.electron.findModel(pythonScript);
            if(result.length!=0){
              listp[i].setAttribute("modelFile",result[0].file);
            }
    }
 
}*/


async function findModelFromSymbolEditor(){ 
  findModel(drawing.symbol.model);
}


async function showParams(){

var pythonScript=generatePythonScriptForParams();
var modelName= mtable.select.getAttribute("model");


if(!drawing.electronjs){
  window.foo.getParams(pythonScript, modelName);
  return;
}

   try {     
          //get params from python script
          const result = await window.electron.getParams(pythonScript);

          //edit params by dialog
          const editedParams = await window.electron.editParams(result,modelName);
          setParams(editedParams);
        } catch (error) {
        
          window.electron.showAlert('Error', error.message);
      }
}



function generatePythonScriptofCircuit(){


    var elemList=netList();
    //get lib path---------------------------------
    
    let pythonScript = `import json;\n`;

    pythonScript += elemList.map(elem =>`from pyams.models import ${elem.model};`).join("\n") + "\n";
    pythonScript += `from pyams.lib import cirCAD;\n`; 

    //get Elements---------------------------------------------------------------------

    pythonScript += elemList.map(elem => 
        `${elem.ref} = ${elem.model}(${elem.pins.map(pin => `"${pin}"`).join(",")});`
    ).join("\n") + "\n"; 


    // get paramtres------------------------------------------------------------------
    pythonScript += elemList.map(elem => `${elem.ref}.setParams(" ${elem.params} ");` ).join("\n") + "\n";

    //get circuit---------------------------------------------------------------------
    pythonScript += 'circuit = cirCAD();\n';
    pythonScript += 'circuit.addElements({'+elemList.map(elem => `'${elem.ref}':${elem.ref}` ).join(",") + '})\n';


    return  pythonScript;

}






async function ioPosProbe() {
    //get probe name
    var str = mtable.select.childNodes[2].textContent.split('=');
    //python script
    var pythonScript= generatePythonScriptofCircuit();
    
    pythonScript += `from pyams.lib import listSignalsParams;\n`; 
    pythonScript += 'data=listSignalsParams(circuit);\n';
    pythonScript += 'print(json.dumps(data))';


    if(!drawing.electronjs){
      window.foo.listSignalsParams(pythonScript, str[0],-1);
      return;
    }
    
    //get new pos of probe
    try {
        const result = await window.electron.getListSignalsParams(pythonScript);
        const result_ = await window.electron.listSignalsParams(result,str[0]);
        
        mtable.select.childNodes[2].textContent=result_;
        
        for (var i=0; i<result.length; i++) 
            for (var j=0; j<result[i].children.length;j++)
             {
            if(result[i].children[j].name==result_){
                stylePosProbe(result[i].children[j].nature
                  ,mtable.select);
                break;
            }
        }
      } catch (error) {
        window.electron.showAlert('Error',error.message);
    }
}


async function ioProbe(){
    //get probe name
    var str = mtable.select.childNodes[2].textContent.split('=')[0];
    var nature= mtable.select.getAttribute("nature");
    //python script
    var pythonScript= generatePythonScriptofCircuit();
    if((nature=='node')||(nature=='dnode'))
      pythonScript += `circuit.setOutPuts("${str.split('.')[0]}")\n`;
    else
      pythonScript += `circuit.setOutPuts(${str})\n`;

    pythonScript += `circuit.analysis(mode='op')\n`; 
    pythonScript += `circuit.run();\ncircuit.getVal()\n`;


    if(!drawing.electronjs){
      window.foo.opAnalysis(pythonScript);
      return;
    }

    
    try {
        
      const result = await window.electron.executOP(pythonScript);
      var str = mtable.select.childNodes[2].textContent.split('=')[0];
      mtable.select.childNodes[2].textContent=str+'='+result[0].value;
      structProbe(mtable.select);
    } catch (error) {
      window.electron.showAlert('Error',error.message);
    }
}

function setPropValue(val){
  var str = mtable.select.childNodes[2].textContent.split('=')[0];
  mtable.select.childNodes[2].textContent=str+'='+val;
  structProbe(mtable.select);
}




//--------------------------------actions of Analysis--------------------//

async function ioPosParamAnalysis(type) {
    //get pos param
    var str =''
    //python script
    var pythonScript= generatePythonScriptofCircuit();
    
    pythonScript += `from pyams.lib import listSignalsParams;\n`; 
    pythonScript += 'data=listSignalsParams(circuit);\n';
    pythonScript += 'print(json.dumps(data))';

    if(!drawing.electronjs){
      window.foo.listSignalsParams(pythonScript, str,type);
      return;
    }

    
    //get new pos of param
    try {
        const result = await window.electron.getListSignalsParams(pythonScript);
        const result_ = await window.electron.listSignalsParams(result,str[0]);

        for (var i=0; i<result.length; i++) 
            for (var j=0; j<result[i].children.length;j++)
             {
            if(result[i].children[j].name==result_){
                ioSetPosProbe(result_,'U',result[i].children[j].nature);
                break;
            }
        }
      } catch (error) {
        
    }
}

function getParamAnalysis(type,name)
{

  mtable.typeUsedDC=false;
  mtable.typeUsedOutput=false;
  mtable.typeUsedSOutput=false;
  mtable.typeUsedXOutput=false;
  mtable.typeUsedYOutput=false;
  mtable.typeUsedSOutput=false;

  if(type=="dc")
  {
    mtable.typeUsedDC=true;
    ioPosParamAnalysis(3);
  } else if(type==0){
    mtable.typeUsedYOutput=true; 
    ioPosParamAnalysis(type);
  } else if(type==1){
    mtable.typeUsedXOutput=true;
    ioPosParamAnalysis(type);
  } else if(type==2){
    mtable.typeUsedSOutput=true;
    ioPosParamAnalysis(type);
  }
}



function ioSetPosProbe(pos,unit_,type_) {

    if(mtable.typeUsedYOutput)
    {
      var analy=JSON.parse(mtable.select.getAttribute("description"));
      analy.yAxe.outputs.push({name:pos,unit:unit_,type:type_,color:'#000000'})
      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedYOutput=null;
      analysisSelect();
      mtable.parent.creat();
      return;
    }
  
    if(mtable.typeUsedXOutput)
    {
      var analy=JSON.parse(mtable.select.getAttribute("description"));
      analy.xAxe.name=pos;
      analy.xAxe.unit=unit_;
      analy.xAxe.type=type_;
      analy.xAxe.used=true;
      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedXOutput=null;
      analysisSelect();
      mtable.parent.creat();
      return;
    }
  
    if(mtable.typeUsedSOutput)
    {
      var analy=JSON.parse(mtable.select.getAttribute("description"));
      analy.secondsweep.param=pos;
      analy.secondsweep.unit=unit_;
      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedSOutput=null;
      analysisSelect();
      mtable.parent.creat();
      return;
    }
  
     if(mtable.typeUsedDC)
     {
       var analy=JSON.parse(mtable.select.getAttribute("description"));
       analy.dcsweep.param=pos;
       analy.dcsweep.unit=unit_;
       mtable.select.setAttribute("description", JSON.stringify(analy));
       mtable.typeUsedDC=null;
       analysisSelect();
       mtable.parent.creat();
       return;
     }
  
      mtable.newElem.setAttribute("value", pos);
      if (mtable.typeSelect == 'probe') {
          mtable.select.childNodes[2].textContent = pos;
          mtable.select.setAttribute("pos",pos);
          mtable.select.setAttribute("unit",unit_);
          mtable.select.setAttribute("type",type_);
          var c=colorByUnit(unit_);
          mtable.select.childNodes[0].style.stroke =c;
          mtable.select.childNodes[1].style.stroke =c;
          mtable.select.childNodes[1].style.fill   =c;
          structProbe(mtable.select);
          return;
      }
  
  }


  function getSource(){
    var pythonScript= generatePythonScriptofCircuit();

    


    var elem=drawing.resize.setElement;
    var analy=JSON.parse(elem.getAttribute("description"));

    var r=analy.yAxe.outputs;
    var outputs = r.map(output => (output.type === 'node' ||output.type === 'dnode' ) ? `"${output.name.split('.')[0]}"` : output.name);
    var r=analy.xAxe;
   
    if (r.used) {
      const outputName = (r.type === 'node' ||r.type === 'dnode' ) ? `"${r.name.split('.')[0]}"` : r.name;
      outputs.push(outputName);
     };/* else {
      outputs.push(analy.type === "DC Sweep" ? analy.dcsweep.param : 'time');
    }*/
   if(analy.type === "DC Sweep"){
    var r=analy.dcsweep;
    var cmd=`mode="dc",param=${r.param},start=${toVal(r.start)},stop=${toVal(r.stop)},step=${toVal(r.step)}`;
   }
   else {
    var r=analy.time;
    var cmd=`mode="tran",start=${toVal(r.start)},stop=${toVal(r.stop)},step=${toVal(r.step)}`;
   }

   pythonScript+=`\n\n# Set outputs for plotting;\ncircuit.setOutPuts(${outputs.join(',')});\n`;
   pythonScript+=`\n\n# Set outputs for plotting;\ncircuit.analysis(${cmd});\ncircuit.run();\ncircuit.result();`;


   return pythonScript;
  }

  async function runAnalysis(){
   
   var pythonScript=getSource();
   v=await window.electron.analysisDialog(pythonScript);
   dataPlot(v)
  }


  function dataPlot(list)
{
  
	var elem=drawing.resize.setElement;
  var analy=JSON.parse(elem.getAttribute("description"));
	var title=analy.title;
  var outputs=analy.yAxe.outputs
  var secondsweep=analy.secondsweep;
  var elem0= drawing.resize.setElement.lastChild.firstChild;
  var layout = JSON.parse(elem0.getAttribute("layout"));
  var nList=list.length-1;

// X Axe descriptio---------------------------------------------------------------------------------
  if(analy.type=='Time Domain')
    var xNameAnalysis='Time[sec]'
  else
	  var xNameAnalysis=list[0].label; //analy.dcsweep.param+'['+analy.dcsweep.unit+']';

	if(analy.xAxe.used){
		xNameAnalysis=list[nList].label;//analy.xAxe.name+'['+analy.xAxe.unit+']';
    var l=list[nList].data;
    var usexXAxe=1;
  } else{
  var l=list[0].data;
  var usexXAxe=0;
  }

layout.xaxis.title.text=xNameAnalysis;


//Plot data------------------------------------------------------------------------------------------
  
  var data=[];
  var ndigit=0;


  for (var i = 1; i < list.length - usexXAxe; i++) {
    if (list[i].type !== 'digital') {
      ndigit = 1;
    }
  }
  
  for (var i = 1; i < list.length-usexXAxe; i++) {
    if(list[i].type === 'digital') {
      ndigit++;

      var x_ = 'x' + ndigit;
      var y_ = 'y' + ndigit;
      if(ndigit==1) 
        var yaxis='yaxis';
      else
        var yaxis='yaxis'+ndigit;

      layout[yaxis] = {
          ticktext: ['0', '1'],
          tickvals: [0, 1],
          title: {
          text: 'Digital' 
          }
      };
    } else {
      layout['yaxis'] = {};
      var x_ = 'x1';
      var y_ = 'y1';
    }

    data.push({
                  type: 'scatter',
                  name: list[i].label,
                  line: {
                      color: outputs[i-1].color
                  },
                  y: list[i].data,
                  x: l,
                  xaxis: x_,
                  yaxis: y_
              });
      }


  
  layout.grid = {
    rows: ndigit,
    columns: 1,
    pattern: 'independent',
    roworder: 'bottom to top'
  };



  
var elem=drawing.resize.setElement.lastChild.firstChild;
//elem.innerHTML = "<div name='plots' style='border-style: double;zoom:60%'  ondblclick='showPlotInModel(this)'></div>";
Plotly.newPlot(elem, data, layout, plotConfig);
Plotly.update(elem);
}

//---------------------------------get python version-------------------------//
async function getPythonVersion(){

  try {
      
    const result = await window.electron.getPythonVersion();
    pythonVersion=result;
    ioDic.pythonVersion=pythonVersion; 
  } catch (error) {
    window.electron.showAlert('Error',error.message);
  }
}

