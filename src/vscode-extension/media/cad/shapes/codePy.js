
function addCode(elem) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 122);
    newElement.setAttribute("height", 100);
	  newElement.style.height =128+'px';
	  newElement.style.width =222+'px';
    newElement.style.backgroundColor = "rgba(255, 99, 71, 0.2)";
    newElement.style.border = "1px double rgb(255, 99, 71, 0.5)";
    newElement.innerHTML =ico_svg;
	 // newElement.innerHTML ='<textarea name="textareacodepy" style="font-size: 8px; background-color: #444;  color: white;  font-family: monospace;">AppPyAMS.setOut();\nAppPyAMS.analysis(mode="op");</textarea>';
    elem.appendChild(newElement);
    elem.setAttribute("fpython",'None')
    elem.setAttribute("code",'circuit.setOutPuts(" ");\n\circuit.analysis(mode="op");\n\circuit.run();');
}





var UNITS = {
  "T": 1e12, "G": 1e9, "M": 1e6, "Meg": 1e6, "MEG": 1e6, "meg": 1e6,
  "k": 1e3, "K": 1e3,
  "m": 1e-3, "u": 1e-6, "µ": 1e-6, "n": 1e-9, "p": 1e-12, "f": 1e-15
};

// "1k" -> {value:1000, unit:"k"} ، "1M" -> {value:1e6, unit:"M"} ، "1e-6" -> {value:1e-6, unit:""}
function parseValue(v) {
  var r = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([a-zA-Zµ]*)/.exec(v);
  if (!r) return null;
  var num = parseFloat(r[1]);
  var u = r[2];
  if (u === "") return { value: num, unit: "" };

  // الأطول أولًا: Meg / MEG / meg قبل الحرف المفرد
  if (UNITS.hasOwnProperty(u)) return { value: num * UNITS[u], unit: u };
  if (UNITS.hasOwnProperty(u[0])) return { value: num * UNITS[u[0]], unit: u[0] };

  return { value: num, unit: "" }; // وحدة غير معروفة (مثل Ohm أو F)
}

// 1000 + وحدة "k" -> "1k"
function formatValue(value, unit) {
  var factor = unit === "" ? 1 : UNITS[unit];
  var n = parseFloat((value / factor).toPrecision(10)); // إزالة أخطاء الفاصلة العائمة
  return n + unit;
}

var UNITS = {
  "T": 1e12, "G": 1e9, "M": 1e6, "Meg": 1e6, "MEG": 1e6, "meg": 1e6,
  "k": 1e3, "K": 1e3,
  "m": 1e-3, "u": 1e-6, "µ": 1e-6, "n": 1e-9, "p": 1e-12, "f": 1e-15
};

var AUTO_UNITS = [
  ["T", 1e12], ["G", 1e9], ["M", 1e6], ["k", 1e3],
  ["", 1], ["m", 1e-3], ["u", 1e-6], ["n", 1e-9], ["p", 1e-12], ["f", 1e-15]
];


var SUFFIX_RE = /([A-Za-z]\/[A-Za-z]|Seconds|seconds|Second|second|Sec|sec|Ohm|ohm|\u03A9|\u2126|\u00B0|deg|Hz|H|F|A|V|S|W|s)$/;

function parseValue(v) {
  v = String(v).trim();
  var suffix = "";
  var sm = SUFFIX_RE.exec(v);
  if (sm) {
    suffix = sm[1];
    v = v.slice(0, v.length - suffix.length).trim();
    // seconds: "Sec" / "sec" / "seconds" are all written "s" on the schematic
    if (/^sec/i.test(suffix)) suffix = "s";
    // ratio units (V/V, A/A, V/A ...) : the gain is shown as a plain number
    if (suffix.indexOf("/") >= 0) suffix = "";
  }
  var r = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([a-zA-Z\u00B5\u03BC]*)$/.exec(v);
  if (!r) return null;
  var num = parseFloat(r[1]);
  var u = r[2];
  var value = num;
  if (u !== "") {
    if (UNITS.hasOwnProperty(u)) value = num * UNITS[u];
    else return null; 
  }
  return { value: value, suffix: suffix };
}

// 1000 + "Ω" -> "1kΩ"
function formatValue(value, suffix) {
  suffix = suffix || "";
  if (value === 0 || !isFinite(value)) return String(value) + suffix;
  var abs = Math.abs(value);
  for (var i = 0; i < AUTO_UNITS.length; i++) {
    if (abs >= AUTO_UNITS[i][1] * 0.9999999) {
      var n = parseFloat((value / AUTO_UNITS[i][1]).toPrecision(10));
      return n + AUTO_UNITS[i][0] + suffix;
    }
  }
  var last = AUTO_UNITS[AUTO_UNITS.length - 1];
  return parseFloat((value / last[1]).toPrecision(10)) + last[0] + suffix;
}

//**************Import line of a model ****************/
// library model (pyams/models):      from pyams.models import Resistor;
// project model (dir == 'project'):  from MyResistor import MyResistor;   (file = Project/sub/MyResistor.py)
function pyImportLine(model, dir, file) {
  if (dir === 'project' && file) {
    var stem = String(file).split('/').pop().replace(/\.py$/i, '');
    return 'from ' + stem + ' import ' + model + ';';
  }
  return 'from pyams.models import ' + model + ';';
}

//**************Parameter binding (param / init / method) ****************/
// A text element name="param" has an attribute  bind  telling where its value goes in the Python code:
//   param  (default) -> in  El.setParams("name=value ...")
//   init             -> as a keyword argument of the constructor:  Model("a","b", name=value)
//   method           -> as a call  El.name(value)   (Name = method name, Value = the arguments exactly as typed, e.g. setPoints("0 0, 1m 5"))
var pendingParamBind = 'param';   // set by the Init / Method buttons before addShape('param')
var PARAM_BIND_COLORS = { param: '#11a229', init: '#1565c0', method: '#d9730d' };

// Initial state (default) of a new parameter element, one entry per toolbar button.
// Edit the values here: shapes.js reads this table when the element is created.
var PARAM_DEFAULTS = {

  // [P=1] button -> goes into El.setParams("P=1")
  param: {
    name:  'P',            // parameter name of the model: rename it (R, C, Vdc ...)
    value: '1',            // value as text, units allowed (1K, 10u, 5V)
    color: '#11a229'       // green
  },

  // [n=1] button -> constructor argument:  Model("a","b", n=1)
  // Use it for values that must be given when the element is created (they cannot change later)
  init: {
    name:  'n',            // keyword argument name of __init__: rename it (sections ...)
    value: '1',            // python value: 20, 0.5, True, "0", [1, 2] ... (text is quoted automatically)
    color: '#1565c0'       // blue
  },

  // [f()] button -> method call:  El.f()
  method: {
    name:  'f',            // the method name itself: rename it (setPoints ...)
    value: '',             // the arguments exactly as typed, as in Python: "0 0, 1m 5"  (empty = no argument)
    color: '#d9730d'       // orange
  }
};

function paramBind(el) {
  var b = el.getAttribute("bind");
  return (b === "init" || b === "method") ? b : "param";
}

// python literal of a value: numbers, True/False/None, quoted text and [..] (..) {..} stay as they are
function pyLiteral(v) {
  v = String(v === null || v === undefined ? "" : v).trim();
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(v)) return v;
  if (/^(True|False|None)$/.test(v)) return v;
  if (/^(["']).*\1$/s.test(v)) return v;
  if (/^[\[\(\{].*[\]\)\}]$/s.test(v)) return v;
  return '"' + v.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

// the method value is always a string (parsed with units by the library): "0 0, 1m 5"
function pyString(v) {
  v = String(v === null || v === undefined ? "" : v).trim();
  if (/^(["']).*\1$/s.test(v)) return v;
  return '"' + v.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

// for a method parameter the Name is the function name itself (setPoints)
function methodNameOfParam(name) {
  return String(name || "").trim();
}

// text shown on the schematic for a param element:  name=value   |   setPoints("0 0, 1m 5")  (method)   |   value only
function paramDisplayText(el) {
  var name = el.getAttribute("paramname") || "";
  var val = el.getAttribute("paramvalue") || "";
  if (el.getAttribute("show") !== "Name and value") return val;
  if (paramBind(el) === "method") return methodNameOfParam(name) + "(" + val + ")";
  return name + "=" + val;
}

// {init:[ 'sections=20' ], methods:[ 'setPoints("0 0, 1m 5")' ]} of a part (or of the symbol if container=document)
function getBoundParams(container) {
  var res = { init: [], methods: [] };
  var els = (container || document).querySelectorAll('[name="param"]');
  for (var i = 0; i < els.length; i++) {
    var b = paramBind(els[i]);
    var name = els[i].getAttribute("paramname");
    if (b === "param" || !name) continue;
    var val = els[i].getAttribute("paramvalue");
    if (b === "init") res.init.push(name + "=" + pyLiteral(val));
    else res.methods.push(methodNameOfParam(name) + "(" + String(val === null || val === undefined ? "" : val).trim() + ")");
  }
  return res;
}

// full Python text of one element
function pyElementCode(ref, model, pins, setParams, bound) {
  var args = pins.concat(bound.init).join(",");
  var t = ref + " = " + model + "(" + args + ");\n";
  t += ref + '.setParams("' + setParams + '");\n';
  bound.methods.forEach(function (m) { t += ref + "." + m + ";\n"; });
  return t;
}

//**************Update Part parameters ****************/

function getParamPart(strListParams,part) {
  strListParams = strListParams || "";


  var params = part.querySelectorAll('[name="param"]');
  var lparams = [];
  for (var i = 0; i < params.length; i++) {
    if (paramBind(params[i]) !== "param") continue;
    lparams.push({
      name: params[i].getAttribute("paramname"),
      value: params[i].getAttribute("paramvalue")
    });
  }

  var items = [];   
  var index = {}; 
  var re = /([^\s=]+)\s*=\s*([^\s]+)/g;
  var m;
  while ((m = re.exec(strListParams)) !== null) {
    index[m[1]] = items.length;
    items.push({ name: m[1], value: m[2] });
  }

  for (var j = 0; j < lparams.length; j++) {
    var p = lparams[j];
    if (p.name === null || p.name === "") continue;

    if (Object.prototype.hasOwnProperty.call(index, p.name)) {
      items[index[p.name]].value = p.value;
    } else {
      index[p.name] = items.length;
      items.push({ name: p.name, value: p.value });
    }
  }

  return items.map(function (it) {
    return it.name + "=" + it.value;
  }).join("  ");
}


function setParamPart(strListParams,part) {
  var sym=JSON.parse(part.firstChild.getAttribute("symbol"));
  sym.model.setParams = strListParams;
  part.firstChild.setAttribute("symbol", JSON.stringify(sym));
  var newValues = {};
  var re = /([^\s=]+)\s*=\s*([^\s]+)/g, m;
  while ((m = re.exec(strListParams)) !== null) newValues[m[1]] = m[2];

  var params = part.querySelectorAll('[name="param"]');
  var lparams = [];

  for (var i = 0; i < params.length; i++) {
    var el = params[i];
    if (paramBind(el) !== "param") continue;
    var name = el.getAttribute("paramname");
    var old = el.getAttribute("paramvalue");

    if (Object.prototype.hasOwnProperty.call(newValues, name)) {
      var nv = parseValue(newValues[name]);
      if (nv) {
  
        var suffix = nv.suffix;
        if (suffix === "") {
          var ov = parseValue(old);
          if (ov) suffix = ov.suffix;
        }
        old = formatValue(nv.value, suffix);
        el.setAttribute("paramvalue", old);
        if(el.getAttribute("show")== "Name and value")
           el.textContent = name + "=" + old;
        else
           el.textContent = old;
      }
    }
    lparams.push({ name: name, value: old });
  }
  return lparams;
}

function getCodePyOfPart(part) {
  
  var pins  = part.querySelectorAll('[name="pin"]');
  var lpins = [];
  var sym=JSON.parse(part.firstChild.getAttribute("symbol"));
  var name = sym.model.name;
  var ref=  sym.reference;
    

  sym.model.setParams=getParamPart(sym.model.setParams, part);

  for(var i=0; i<pins.length; i++){
    if(pins[i].childNodes[2].textContent!="")
        lpins.push('"0"');
    else
        lpins.push('"'+pins[i].childNodes[2].textContent+'"');
  }

 

  var code="\n"+pyImportLine(name, sym.model.dir, sym.model.file)+"\n"+pyElementCode(ref, name, lpins, sym.model.setParams, getBoundParams(part));

return code;
}

//**************Update symbol parameters  ****************/
function getParamSym(strListParams) {
  strListParams = strListParams || "";


  var params = document.querySelectorAll('[name="param"]');
  var lparams = [];
  for (var i = 0; i < params.length; i++) {
    if (paramBind(params[i]) !== "param") continue;
    lparams.push({
      name: params[i].getAttribute("paramname"),
      value: params[i].getAttribute("paramvalue")
    });
  }

  var items = [];   
  var index = {}; 
  var re = /([^\s=]+)\s*=\s*([^\s]+)/g;
  var m;
  while ((m = re.exec(strListParams)) !== null) {
    index[m[1]] = items.length;
    items.push({ name: m[1], value: m[2] });
  }

  for (var j = 0; j < lparams.length; j++) {
    var p = lparams[j];
    if (p.name === null || p.name === "") continue;

    if (Object.prototype.hasOwnProperty.call(index, p.name)) {
      items[index[p.name]].value = p.value;
    } else {
      index[p.name] = items.length;
      items.push({ name: p.name, value: p.value });
    }
  }

  return items.map(function (it) {
    return it.name + "=" + it.value;
  }).join("  ");
}

function setParamSym(strListParams) {
  drawing.symbol.model.setParams = strListParams;
  var newValues = {};
  var re = /([^\s=]+)\s*=\s*([^\s]+)/g, m;
  while ((m = re.exec(strListParams)) !== null) newValues[m[1]] = m[2];

  var params = document.querySelectorAll('[name="param"]');
  var lparams = [];

  for (var i = 0; i < params.length; i++) {
    var el = params[i];
    if (paramBind(el) !== "param") continue;
    var name = el.getAttribute("paramname");
    var old = el.getAttribute("paramvalue");

    if (Object.prototype.hasOwnProperty.call(newValues, name)) {
      var nv = parseValue(newValues[name]);
      if (nv) {
  
        var suffix = nv.suffix;
        if (suffix === "") {
          var ov = parseValue(old);
          if (ov) suffix = ov.suffix;
        }
        old = formatValue(nv.value, suffix);
        el.setAttribute("paramvalue", old);
        if(el.getAttribute("show")== "Name and value")
           el.textContent = name + "=" + old;
        else
           el.textContent = old;
      }
    }
    lparams.push({ name: name, value: old });
  }
  return lparams;
}



function getCodePyOfSym() {

  var pins  = document.querySelectorAll('[name="pin"]');
  var lpins = [];
  var name = drawing.symbol.model.name;
  var ref=  drawing.symbol.reference;

  drawing.symbol.model.setParams=getParamSym(drawing.symbol.model.setParams);

  for(var i=0; i<pins.length; i++){
    if(pins[i].childNodes[2].textContent!="")
       lpins.push('"0"');
    else
        lpins.push('"'+pins[i].childNodes[2].textContent+'"');
  }

 

  var code="\n"+pyImportLine(name, drawing.symbol.model.dir, drawing.symbol.model.file)+"\n"+pyElementCode(ref, name, lpins, drawing.symbol.model.setParams, getBoundParams(document));

return code;
}


//**************get netlist of circuit ****************/
function netListPins(part) {

    var pins = getListPins(part);
    var listPinsName = [];

    for (var i = 0; i < pins.length; i++)
        if (pins[i].elem.childNodes[1].style.display == "none") {
            var netId = pins[i].elem.getAttribute('netId');
            var elemNet = document.getElementById(netId);
            listPinsName.push(elemNet.getAttribute("ref"));
        } else
            listPinsName.push('0');
    return listPinsName;
}




function getListParams(part) {
   var sym=JSON.parse(part.firstChild.getAttribute("symbol")); 
    return  getParamPart(sym.model.setParams,part) 
}



function netList() {

    var parts = document.getElementsByClassName('part');
    var list = [];
    for (var i = 0; i < parts.length; i++)
         {
            var sym=getPartModel(parts[i]);
            if(sym.device.type!='std')
            list.push({
                part: parts[i],
                model: sym.model.name,
                type: sym.device.name,
                ref: parts[i].getAttribute('sref'),
                directory: sym.model.dir,
                file: sym.model.file,
                pins: netListPins(parts[i]),
                pinsName: getListPins(parts[i]).map(pin => pin.elem.childNodes[2].textContent),
                params: getListParams(parts[i]),
                bound: getBoundParams(parts[i])
            });

        }
    return list;
}


function generateCodePyofCircuit(){

    var elemList=netList();
    //get lib path---------------------------------
    
    let pythonScript ='';
    // one import per model (a model used by several elements is imported once)
    var imports = [];
    elemList.forEach(elem => {
        var line = pyImportLine(elem.model, elem.directory, elem.file);
        if (imports.indexOf(line) < 0) imports.push(line);
    });
    pythonScript += imports.join("\n") + "\n";
    
    //get Elements---------------------------------------------------------------------
    pythonScript += elemList.map(elem => 
        `${elem.ref} = ${elem.model}(${elem.pins.map(pin => `"${pin}"`).concat(elem.bound.init).join(",")});`
    ).join("\n") + "\n"; 

    // get paramtres------------------------------------------------------------------
    pythonScript += elemList.map(elem => `${elem.ref}.setParams(" ${elem.params} ");` ).join("\n") + "\n";

    // get methods (setPoints ...)-------------------------------------------------------
    var calls = [];
    elemList.forEach(elem => elem.bound.methods.forEach(m => calls.push(`${elem.ref}.${m};`)));
    if (calls.length) pythonScript += calls.join("\n") + "\n";

    return  pythonScript;

}




function modifedSizeCodePy(element) {

    var a=100/60;
    if (element.getAttribute("name") == "codePy") {

        var x = parseInt(element.getAttribute("x"));
        var y = parseInt(element.getAttribute("y"));
        var w = parseInt(element.getAttribute("width"));
        var h = parseInt(element.getAttribute("height"));

        element.setAttribute('transform', "translate(" + x + "," + y + ")");
        element.firstChild.setAttribute("width", w);
        element.firstChild.setAttribute("height", h);
		    element.firstChild.style.height=h+'px';
		    element.firstChild.style.width=w+'px';

        var e = element.firstChild.getElementsByClassName('tabcontent');
        for(var i=0;i<e.length;i++){
		    e[i].firstChild.style.width = w-10+'px';
        e[i].firstChild.style.height = h-25+'px';

        e[i].style.width = w+'px';
        e[i].style.height = h-25+'px';

        e[i].firstChild.setAttribute("width", w);
        e[i].firstChild.setAttribute("height", h);
        e[i].firstChild.setAttribute("preserveAspectRatio","none");
      }
      if(e.length==0){
        var e = element.firstChild.firstChild;
      //  console.log(e.value);
		    e.style.width = w-10+'px';
        e.style.height = h-10+'px'
      }

      var e = element.getElementsByClassName('pplotly');
      for(var i=0;i<e.length;i++){
      var update = {
          width:1*(w),
          height:1*(h-25)
      };

      Plotly.relayout(e[i],update);

      }


        //e.setAttribute("width", w);
        //e.setAttribute("height", h);
		//e.setAttribute("viewBox", "0 0 "+w+" "+h);
		//viewBox
		/* */
    }
}




function pyCodeData(list){

  var elem=drawing.resize.setElement;

   if(list.length==1){
     elem.firstChild.innerHTML =ico_svg;
     modifedSizeCodePy(elem);
     return;
   }

    var tab='';
    var but='';

    for(var i=1; i<list.length;i++)
    {
        l=list[i];
        if( l[0]=='plot')
        tab+='<div    class="tabcontent"><div name="plots"  class="pplotly"></div></div>';
        but+='<button class="tablink" onclick="openCity('+(i-1)+', this)">'+l[1]+'</button>'
    }


  /*  for(var i=1; i<list.length;i++)
    {*/
      i=1;




    elem.firstChild.innerHTML=tab+but;
    var e = elem.firstChild.getElementsByClassName('tabcontent');
    for(var i=1; i<list.length;i++)
    {
      l=list[i];
      if( l[0]=='plot')
      Plotly.plot(e[i-1].firstChild,l[2], l[3], plotConfig);
    }
    openCity(0, elem.firstChild.firstChild);
    modifedSizeCodePy(elem);

}

function openCity(index,elmnt) {
  var i, tabcontent, tablinks;
  var parent=elmnt.parentElement;
  tabcontent = parent.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = parent.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  tabcontent[index].style.display = "block";
  tablinks[index].style.backgroundColor = '#888';
}



function addCodeMirror() {
	var codpy = document.getElementsByName('textareacodepy');

    for (var i=0; i<= codpy.length-1;i++)
	{

	}

}


function saveCodePy() {
}

function openCodePy() {
  elem=mtable.select;
  window.foo.getPyCode(elem.getAttribute("fpython"));
}



function toVal(t) {
  
  var val=['0','1','2','3','4','5','6','7','8','9','e','E','-','+','.'];
  var s='';
  var l={'T':1e+15,'G':1e+12,'M':1e+6,'k':1e+3, 'm':1e-3,'u':1e-6,'µ':1e-6,'K':1e+3, 'n':1e-9,'p':1e-12,'f':1e-15};
 
  for (var i=0; i<t.length; i++)
    if(val.includes(t[i]))
       s=s+t[i];
    else if(l[t[i]])
    {
     return s*l[t[i]]
    }
    else
      break;
   return s*1;
 }

 function convertAnalyOPToPython(){
  var elem=drawing.resize.setElement;

  var probes = document.getElementsByName('probe');
  var list = '';
  for (var i = 0; i < probes.length; i++) 
    if(probes[i].getAttribute("pos")!='NoPos'){
      r={name:probes[i].getAttribute("pos"),type:elem.getAttribute("type")};
      var v=r.name.split('.');   
      if(list!='') 
        list+=',';
      if(r.type=='wire')
        list+='"'+v[0]+'"'
      else
        list+=r.name
     }
  var t='';
  t+='AppPyAMS.setOut('+list+');\n';
  t+='AppPyAMS.analysis(mode="op");\n';
  t+='AppPyAMS.run();\n';
  t+='dataOut=AppPyAMS.getOut('+list+');\n';

  t+='import sys;\n';
  t+='sys.stderr.write(str(dataOut));\n';
  return t;

 }
 
 function convertAnalyToPython(analy)
 {
 
   if(analy.type=="DC Sweep")
   {
     var r=analy.yAxe.outputs;
     var s=analy.secondsweep
     var l='[]';
     var n=0;
     if(s.used)
     {
       var valSec=s.list.split(',');
       var n=valSec.length-1;
       for(var j=1; j<=n; j++)
         l=l+',[]'
     }
 
 
 
   var tt='dataOut=['+l+'];\n';
 
   for(var j=0; j<=n; j++) {
     var t='';
     var k='';
     var p='';
 
     var r=analy.yAxe.outputs;
     for(var i=0; i<r.length;i++){
       var  v=r[i].name;
       if(r[i].type=='wire')
         var v='"'+r[i].name.split('.')[0]+'"';
       k+='dataOut['+j+']+=[AppPyAMS.getOut('+v+')];\n';

       if(i==0)
         t+=v;
       else
         t+=','+v;
       }
 
 
     var r=analy.xAxe;
     if(r.used)
     {
       if(r.type=='wire')
       {
         var v=r.name.split('.');
         t+='dataOut['+j+']+=[AppPyAMS.getOut("'+v[0]+'")];\n';
       } else
       t+=','+r.name;
       k+='dataOut['+j+']+=[AppPyAMS.getOut('+r.name+')];\n';
     } else
     {
       t+=','+analy.dcsweep.param;
       k+='dataOut['+j+']+=[AppPyAMS.getOut('+analy.dcsweep.param+')];\n';
     }
 
     if(s.used)
      p=s.param+'+='+toVal(valSec[j])+';\n';
 
     var r=analy.dcsweep;
     t=p+'AppPyAMS.setOut('+t+');\n'
     t+='AppPyAMS.analysis(mode="dc",param='+r.param+',start='+toVal(r.start)+',stop='+toVal(r.stop)+',step='+toVal(r.step)+');\n';
     t+='AppPyAMS.run();\n';
     t+=k;
     tt+=t;
   }
     tt+='import sys;\n';
     tt+='sys.stderr.write(str(dataOut));\n';
     return tt;
   }
 
   if(analy.type=='Time Domain')  {
       var r=analy.yAxe.outputs;
       var s=analy.secondsweep
       var l='[]';
       var n=0;
       if(s.used)
       {
         var valsParSec=s.list.split(',');
         var n=valsParSec.length-1;
         for(var j=1; j<=n; j++)
           l=l+',[]'
       }
 
 
 
     var tt='dataOut=['+l+'];\n';
 
     for(var j=0; j<=n; j++) {
       var t='';
       var k='';
       var p='';
 
       var r=analy.yAxe.outputs;
       for(var i=0; i<r.length;i++){
         var  v=r[i].name;
         if(r[i].type=='wire')
         {
           var v=r[i].name.split('.');
           v='"'+v[0]+'"';
         }
       
           k+='dataOut['+j+']+=[AppPyAMS.getOut('+v+')];\n';
      
         if(i==0)
           t+=v;
         else
           t+=','+v;
         }
 
 
       var r=analy.xAxe;
       if(r.used)
       {
         if(r.type=='wire')
         {
           var v=r.name.split('.');
           k+='dataOut['+j+']+=[AppPyAMS.getOut("'+v[0]+'")];\n';
           v='"'+v[0]+'"';
           t+=','+v;
         }
         else {
         t+=','+r.name;
         k+='dataOut['+j+']+=[AppPyAMS.getOut('+r.name+')];\n';
       }
       } else
       {
         t+=',time';
         k+='dataOut['+j+']+=[AppPyAMS.getOut(time)];\n';
       }
 
       if(s.used)
        p=s.param+'+='+toVal(valsParSec[j])+';\n';
 
       var r=analy.time;
       t=p+'AppPyAMS.setOut('+t+');\n'
       t+='AppPyAMS.analysis(mode="tran",start='+toVal(r.start)+',stop='+toVal(r.stop)+',step='+toVal(r.step)+');\n';
       t+='AppPyAMS.run();\n';
       t+=k;
       tt+=t;
     }
       tt+='import sys;\n';
       tt+='sys.stderr.write(str(dataOut));\n';
       return tt;
     }
   return '';
 }
 
 
 function getCodePyOrAnaly()
 {
 
   if(!drawing.resize.setElement.getAttribute("name")) return [false];
       var elem=drawing.resize.setElement;
 
 
   if(elem.getAttribute("name")=='codePy')
       return [true,1,elem.firstChild.firstChild.value];
   else if(elem.getAttribute("name")=='analysis')
       return [true,2,convertAnalyToPython(JSON.parse(elem.getAttribute("description")))];
   else if(elem.getAttribute("name")=='probe')
       return [true,2,convertAnalyOPToPython()];
   

   return [false]
 
 }


//**************Remove stale parameters ****************/
// "p=100  Va=10V", "p" -> "Va=10V"
function removeParamFromList(strListParams, name) {
  var items = [];
  var re = /([^\s=]+)\s*=\s*([^\s]+)/g, m;
  while ((m = re.exec(strListParams || "")) !== null) {
    if (m[1] !== name) items.push(m[1] + "=" + m[2]);
  }
  return items.join("  ");
}

// Like drawing.getListParameter(getCode()), but when the model reports
// "has no parameter 'x'" (the text 'x' was deleted from the schematic but is still
// remembered in setParams) 'x' is dropped through removeName(x) and the call is repeated.
function getListParameterClean(getCode, removeName) {
  var tries = 0;
  function run() {
    return drawing.getListParameter(getCode()).then(function (data) {
      var m = data && data.error ? /has no parameter '([^']+)'/.exec(String(data.error)) : null;
      if (m && tries++ < 30) {
        removeName(m[1]);
        return run();
      }
      return data;
    });
  }
  return run();
}

function removeParamSym(name) {
  drawing.symbol.model.setParams = removeParamFromList(drawing.symbol.model.setParams, name);
}

function removeParamPart(part, name) {
  var sym = JSON.parse(part.firstChild.getAttribute("symbol"));
  sym.model.setParams = removeParamFromList(sym.model.setParams, name);
  part.firstChild.setAttribute("symbol", JSON.stringify(sym));
}
