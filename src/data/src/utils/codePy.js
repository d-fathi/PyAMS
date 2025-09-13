
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


async function openEditCodePy() {

  const originalText = mtable.select.getAttribute("code");
  const circuitText=generateCodePyofCircuit();
  const editedText = await window.electron.editCodePy(circuitText,originalText,'Python Code Editor');
  mtable.select.setAttribute("code",editedText.text);

  if( editedText.data=='') {
    mtable.select.firstChild.innerHTML =ico_svg;
    modifedSizeCodePy(mtable.select);
    return;
  }
  
  const svgMatch = editedText.data.match(/<svg[^>]*>[\s\S]*<\/svg>/i);
  let svgOnly = svgMatch ? svgMatch[0] : '';
  mtable.select.firstChild.innerHTML=svgOnly;
  modifedSizeCodePy(mtable.select);
  
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
