



function itMouved(self){
return(Math.abs(self.coord.x-self.offset.x)>=5)||(Math.abs(self.coord.y-self.offset.y)>=5);
}


function print(st){
	console.log(st);
}


function strToBool(v)
{
	return v=='true';
}


function boolToStr(v){
	if(v)
	    return 'True';
	return 'False';
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function getUnit(v){
	var d=v.split('.');
	var k=v[0].toUpperCase();
	if(d.length>1)
	{
		if(d[1]=='V')
		 return 'V';
		if(d[1]=='I')
 		 return 'A';
		if(d[1]=='P')
			return 'W';
	} else {
		if(k=='R')
		   return 'Ω';
		else if(k=='V')
			 return 'V';
		else if(k=='I')
	 		 return 'A';
	}

	return ' ';
}


function isValidVarName( name ) {
    try {
        // Update, previoulsy it was
        // eval('(function() { var ' + name + '; })()');
        Function('var ' + name);
    } catch( e ) {
        return false;
    }
    return true;
}


function multiRef()
{
	var listRef = document.getElementsByName('ref');
	return listRef.length>=1;
}

function multiLabel()
{
	var listLabel = document.getElementsByName('label');
	return listLabel.length>=1;
}


modelType=['None','Subckt','Resistor','Capacitor','Inductor',
           'Voltage [DC]','Voltage [Pulse]','Voltage [Sin]','Voltage [Exp]',
           'Current [DC]','Current [Pulse]','Current [Sin]','Current [Exp]',
           'Diode','BJT','MOSFET','Switch [SW]','Switch [CSW]'];
modelRef=['X','X','R','C','L',
          'V','V','V','V',
          'I','I','I','I',
          'D','Q','M','S','W'];
modelParam=['Resistor','Voltage [DC]','Voltage [Pulse]','Voltage [Sin]','Voltage [Exp]',
            'Current [DC]','Current [Pulse]','Current [Sin]','Current [Exp]'];
models=[];

function modifiedRefName(value){
	if(typePyAMS) 
		return;
	var listRef = document.getElementsByName('ref');

  var pos=modelType.indexOf(value);
 	 if(pos!=-1)
		 value=modelRef[pos];
	 else
	   value='X';

		 if(listRef.length>0){
		 var t=listRef[0].textContent;
		 if(t[0]!=value){
	      	listRef[0].textContent=value+'?';
					drawing.symbol.reference=value;
				}
			}
			else
			drawing.symbol.reference=value;
}


function deletMultiRef(){
	if (drawing.pageType == 'sym') {
		var listRef = document.getElementsByName('ref');
		for(var i=1;i<listRef.length;i++)
		{
		//	listRef[1].remove();
		//	var listRef = document.getElementsByName('ref');
		    listRef[i].textContent='label';
		    listRef[i].setAttribute('name','label');

		}
     if(listRef.length>=1)
	   	  modifiedRefName(drawing.symbol.type);
	}
}




function valToStr(v) {
	var unit=['T','G','M','K','m','u','n','p','f'];
	var uVal=[1e+15,1e+12,1e+6,1e+3,1e-3,1e-6,1e-9,1e-12,1e-15]
	var t=Math.abs(v);
	function fixed(a){
		a=a*1;
		a=a.toFixed(2)
		var n=a.length-1;
		if(a[n]==0)
		 {
		  if(a[n-1]==0)
			a=a.split('.')[0];
		  else
			a=a.split('.')[0]+'.'+a[n-1];
		 }
		 return a;
	 }
	
	for(var i=0; i<=3; i++) 
	 if(t>uVal[i])
	  {
		var a=t/uVal[i]
		a=fixed(a);
		return a+unit[i]
	  }
	
	for(var i=8; i>=4; i--) 
	 if(t<uVal[i]*100)
	  {
		var a=t/uVal[i]
		 a=fixed(a);
		return a+unit[i]
	  }
	  t=fixed(t);
	  
	  if(v<0)
		t='-'+t;
	  return t+' '
	
	}

function toType(r){
	var a=r.split('.');
	if(a.length==2)
	{
		if(a[1]=='V') return 'V';
		else if(a[1]=='I') return 'A';
		else if(a[1]=='P') return 'W';
	}
    return 'V';
}

function colorByType(r){
	var a=r.split('.');
	if(a.length==2)
	{
		if(a[1]=='V') return '#000000';
		else if(a[1]=='I') return '#ff0000';
		else if(a[1]=='P') return '#00ff00';
	}
    return '#000000';
}


function colorByUnit(u){
		if(u=='V') return '#000000';
		else if(u=='A') return '#ff0000';
		else  return '#00ff00';
}
