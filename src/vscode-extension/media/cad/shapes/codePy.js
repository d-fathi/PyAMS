
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


var SUFFIX_RE = /(Ohm|ohm|\u03A9|\u2126|Hz|H|F|A|V|S|W)$/;

function parseValue(v) {
  v = String(v).trim();
  var suffix = "";
  var sm = SUFFIX_RE.exec(v);
  if (sm) {
    suffix = sm[1];
    v = v.slice(0, v.length - suffix.length).trim();
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

//**************Update Part parameters ****************/

function getParamPart(strListParams,part) {
  strListParams = strListParams || "";


  var params = part.querySelectorAll('[name="param"]');
  var lparams = [];
  for (var i = 0; i < params.length; i++) {
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

 

  var code=`

from pyams.models import ${name};
${ref} = ${name}(${lpins.join(",")});
${ref}.setParams("${sym.model.setParams}");
`;

return code;
}

//**************Update symbol parameters  ****************/
function getParamSym(strListParams) {
  strListParams = strListParams || "";


  var params = document.querySelectorAll('[name="param"]');
  var lparams = [];
  for (var i = 0; i < params.length; i++) {
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

 

  var code=`

from pyams.models import ${name};
${ref} = ${name}(${lpins.join(",")});
${ref}.setParams("${drawing.symbol.model.setParams}");
`;

return code;
}




function generateCodePyofCircuit(){


    var elemList=netList();
    //get lib path---------------------------------
    
    let pythonScript = getModelsPath();
    pythonScript += elemList.map(elem =>`from ${elem.posModel} import ${elem.model};`).join("\n") + "\n";
    pythonScript += `from pyams.lib import circuit;\n`; 

    //get Elements---------------------------------------------------------------------

    pythonScript += elemList.map(elem => 
        `${elem.ref} = ${elem.model}(${elem.pins.map(pin => `"${pin}"`).join(",")});`
    ).join("\n") + "\n"; 


    // get paramtres------------------------------------------------------------------
    pythonScript += elemList.map(elem => `${elem.ref}.setParams(" ${elem.params} ");` ).join("\n") + "\n";

    //get circuit---------------------------------------------------------------------
    pythonScript += 'circuit = circuit();\n';
    pythonScript += 'circuit.addElements({'+elemList.map(elem => `'${elem.ref}':${elem.ref}` ).join(",") + '})\n';


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
      update = {
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
