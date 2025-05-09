function getPosRef(ref)
{
	position={used:false};
	var r = ref.split(".");	
        if (r.length > 1) {
            var s = document.getElementsByName('ref');
            for (var j = 0; j < s.length; j++) {
                if (s[j].textContent == r[0]) {
                    var parElem = s[j].parentElement;
                    position.x = parseInt(parElem.getAttribute('x'));
                    position.y = parseInt(parElem.getAttribute('y'));
                    position.w = parseInt(parElem.getAttribute('width'));
                    position.h = parseInt(parElem.getAttribute('height'));
					position.used=true;
					position.name=r;
                    return position;
                }

            var s = document.getElementsByName('part');
            for (var j = 0; j < s.length; j++) {
                    if (s[j].getAttribute("sref") == r[0]) {
                        var parElem = s[j];
                        position.x = parseInt(parElem.getAttribute('x'));
                        position.y = parseInt(parElem.getAttribute('y'));
                        position.w = parseInt(parElem.getAttribute('width'));
                        position.h = parseInt(parElem.getAttribute('height'));
                        position.used=true;
                        position.name=r;
                        return position;
                    }
            }
        }
			
			
		var s = document.getElementsByName('net');
		if(('V'==r[1]) || ('D'==r[1]))
		for (var j = 0; j < s.length; j++) {
			elem=s[j];
			ref=elem.getAttribute("ref");
			if(ref==r[0])
			{
				var p=getArrayPoints(elem);
				for(i=0; i<p.length;i++)
				{
					if((p[i].x==p[i+1].x)&&(p[i].y!=p[i+1].y))
					{
					position.x = p[i].x;
                    position.y = (p[i].y+p[i+1].y)/2;
                    position.w = 0;
                    position.h = 0;
					position.used=true;
					position.name=r;
                    return position;	
					}
					
					if((p[i].x!=p[i+1].x)&&(p[i].y==p[i+1].y))
					{
					position.y = p[i].y;
                    position.x = (p[i].x+p[i+1].x)/2;
                    position.w = 0;
                    position.h = 0;
					position.used=true;
					position.name=r;
                    return position;
						
					}
				}
			}

        }
		
		}
		
		return position;
}

function modifedNetName(list)
{
	r=[]
	for(var i=0; i<list.length; i++)
	{
		var a=list[i].split('.');
        var s = document.getElementsByName('net');
		notUsed=true;
		if('V'==a[1])
		{
		for (var j = 0; j < s.length; j++) {
			elem=s[j];
			ref=elem.getAttribute("ref");
			if(ref==a[0])
			{
			 r.push('"'+a[0]+'"');
			 notUsed=false;
			 break;
			}
		}
		}
		if(notUsed)
		   r.push(list[i]);
			
	}
	
	return r;
}



function newProbe(elem) {

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
    newElement.style.stroke = "#000000";
	newElement.style.fill = "none";
    newElement.style["stroke-dasharray"] = "2,2";
	
    var xo = 20;
    var yo = 10;
    var x = xo;
    var y = yo;
    newElement.setAttribute("points", xo + "," + yo + " " + x + "," + y);
    elem.appendChild(newElement);

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    newElement.style.stroke = "#000000";
    newElement.style.fill = "#000000";
    newElement.style.strokeWidth = "1px";
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 60);
    newElement.setAttribute("height", 20);
    elem.appendChild(newElement);

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    newElement.style.fill = "#ffffff";
    newElement.style.fontSize = "8";
    newElement.style.fontFamily = "Times New Roman";
    newElement.textContent = 'NoPos';
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    
    elem.appendChild(newElement);
    elem.setAttribute("pos",'NoPos');
    elem.setAttribute("unit",'');
    elem.setAttribute("type",'');

}

function structProbe(elem) {
    elem.childNodes[2]
    bbox = elem.childNodes[2].getBBox();
    var w = bbox.width;
    var h = bbox.height;
    elem.childNodes[2].setAttribute("y", h);
    elem.childNodes[1].setAttribute("width", w);
    elem.childNodes[1].setAttribute("height", h + (h / 4));
    elem.setAttribute("width", w);
    elem.setAttribute("height", h);
}

function getProbes(posDisplay) {
    var probes = document.getElementsByName('probe');
    var list = [];
    for (var i = 0; i < probes.length; i++) {
		var pos=probes[i].getAttribute("display");
		if((pos==posDisplay)||(pos=="All")){
        var r = probes[i].childNodes[2].textContent.split("=");
        list.push(r[0]);
		}
    }
    return modifedNetName(list);
}

function stylePosProbe(nature,elem){

    elem.setAttribute("nature",nature);

    switch(nature){
        case 'node':
            elem.childNodes[1].style.stroke = "#0000ff";
        break;

        case 'dnode':
            elem.childNodes[1].style.stroke = "#7dc29a";
        break;

        case 'digital':
            elem.childNodes[1].style.stroke = "#7dc29a";
        break;

        case 'param':
            elem.childNodes[1].style.stroke = "#6eeb34";
        break;

        case 'flow':
            elem.childNodes[1].style.stroke = "#ff0000";
        break;

        default:
            elem.childNodes[1].style.stroke = "#000000";
        break;
    }

    elem.childNodes[0].style.stroke = elem.childNodes[1].style.stroke;
    elem.childNodes[1].style.fill =elem.childNodes[1].style.stroke;
    structProbe(elem);
    findPosProb();
}

function setProbeName(name,nature){
    mtable.select.childNodes[2].textContent=name;
    stylePosProbe(nature,mtable.select);
}

function setProbesValues(val) {
    var probes = document.getElementsByName('probe');

    for (var i = 0; i < probes.length; i++) {
        var r = probes[i].childNodes[2].textContent.split("=");
        probes[i].childNodes[2].textContent = r[0] + '=' + val[i];
        structProbe(probes[i]);
    }

}

function itProbOfNode(name){
    var a=name.split('V(');
    if(a.length==2)
        return a[1].split(')')[0]+'.V'
    return name;
}

function findPosProb() {
    var probes = document.getElementsByName('probe');
    for (var i = 0; i < probes.length; i++) {
        var r = probes[i].childNodes[2].textContent.split("=");
        var elem = probes[i].childNodes[0];
		pos=getPosRef(itProbOfNode((r[0])));
		var points = getArrayPoints(elem);
		points[1].x = points[0].x;
        points[1].y = points[0].y;
		
		if(pos.used){
                    var x = pos.x;
                    var y = pos.y;
                    var w = pos.w;
                    var h = pos.h;
                    
					var orgX=parseInt(probes[i].getAttribute('x'));
					var orgY=parseInt(probes[i].getAttribute('y'));
					
                    points[1].x = x+(w/2)-orgX;
                    points[1].y = y+(h/2)-orgY;
                   }
             elem.setAttribute("points", polylineToAttribute(points, 0, 0)); 				   
            }


}


function modifedProbeDisplay(elem)
{
	 var r= elem.childNodes[2].textContent.split("=");
	 var h=elem.getAttribute("display");
	 if( (h!="OP") && (r.length==2)){
		 elem.childNodes[2].textContent=r[0];
	 }
}
