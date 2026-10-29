
/*
#--------------------------------------------------------------------------------------------------
Name:        simulation.js
Author:      d.fathi
Created:     05/09/2026
Updated:     25/10/2026
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
    var elemAnalysis = drawing.resize.setElement;          // the selected analysis block
    var analy = JSON.parse(elemAnalysis.getAttribute("description"));

    try {
        // 1. circuit code (elements + parameters) and the analysis settings
        //    (type, start/step/stop, outputs, options, second sweep "0.1m,5m,20m", x axis)
        var code = generateCodePyofCircuit();
        var analysis = getAnalysis();

        // 2. run the circuit in the Python process (progress dialog)
        const results = await drawing.runPyAMSAnalysis(code, analysis);

        // 3. show the results with Plotly
        var elem = elemAnalysis.lastChild.firstChild;
        drawing.plotPyAMSResults(elem, results, { func: analysis.options && analysis.options.func });
        modifedSizeAnalysis(elemAnalysis);
        plotsSaveDataLayoutInDiv();
        drawing.saveData(analy.type + ' analysis');
    } catch (err) {
        if (err === 'Analysis cancelled') return;          // the user closed the dialog
        console.error('Simulation failed:', err);
        showError('Simulation failed', String(err && err.message ? err.message : err));
    }
}
