function  getPosRef(probe)
{

    var position={used:false};

        if (!probe.nod) {
            var s = document.getElementsByClassName('part');
            for (var j = 0; j < s.length; j++) {
                    if (s[j].getAttribute("sref") == probe.pos) {
                        var parElem = s[j];
                        var pins=getListPins(parElem);
                        pins.forEach(pin => { 
                            if(pin.elem.childNodes[2].textContent==probe.pin){
                                position.used=true;
                                position.x = pin.xo;
                                position.y = pin.yo;
                                position.w = 0;
                                position.h = 0;
                                return position;
                            }
                        });

                        if(position.used) return position;
                        position.x = parseInt(parElem.getAttribute('x'));
                        position.y = parseInt(parElem.getAttribute('y'));
                        position.w = parseInt(parElem.getAttribute('width'));
                        position.h = parseInt(parElem.getAttribute('height'));
                        position.used=true;
                        return position;
                    }
            }
        }
			
		if (probe.nod) {

		var s = document.querySelectorAll('[name="net"]');
		for (var j = 0; j < s.length; j++) {
			elem=s[j];
			ref=elem.getAttribute("ref");
			if(ref== probe.pos)
			{
				var p=getArrayPoints(elem);
				// the signal is shown on the longest segment of the wire (its middle)
				var best=-1, bestLen=-1;
				for(var i=0; i<p.length-1; i++)
				{
					var len=Math.abs(p[i].x-p[i+1].x)+Math.abs(p[i].y-p[i+1].y);
					if(len>bestLen) { bestLen=len; best=i; }
				}
				if(best>=0 && bestLen>0)
				{
					position.x = (p[best].x+p[best+1].x)/2;
					position.y = (p[best].y+p[best+1].y)/2;
					position.w = 0;
					position.h = 0;
					position.used=true;
					return position;
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



// Look of a probe: a dark rounded box with a slate border and a monospace value in green (amber for a
// current); a very thin dashed line joins it to the place of the signal.
var PROBE_LOOK = {
    box: '#0b0f14', border: '#1f2937', voltage: '#22c55e', current: '#f59e0b',
    font: 'Consolas, "Courier New", monospace', padX: 6, padY: 3, borderWidth: 2, dash: '2,2', lineWidth: 0.5
};

function newProbe(elem) {

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
    newElement.style.stroke = PROBE_LOOK.voltage;
    newElement.style.fill = "none";
    newElement.style["stroke-dasharray"] = PROBE_LOOK.dash;
    newElement.style.strokeWidth = PROBE_LOOK.lineWidth + "px";
    newElement.setAttribute("points", "20,10 20,10");
    elem.appendChild(newElement);

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 60);
    newElement.setAttribute("height", 20);
    elem.appendChild(newElement);

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    newElement.textContent = 'None';
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    elem.appendChild(newElement);

    elem.setAttribute("pos",'None');
    elem.setAttribute("unit",'');
    elem.setAttribute("type",'');

}

function structProbe(elem) {
    var L = PROBE_LOOK;
    var line = elem.childNodes[0], box = elem.childNodes[1], text = elem.childNodes[2];
    var color = (elem.getAttribute('type') == 'current') ? L.current : L.voltage;
    // during the live simulation (see liveProbe.js) the box does not shrink while the value changes
    var lv = (typeof liveProbe !== 'undefined' && liveProbe.owns(elem)) ? elem._live : null;

    // the text, measured at the origin
    text.style.fill = color;
    text.style.fontFamily = L.font;
    text.style.fontSize = '8px';
    text.setAttribute("x", 0);
    text.setAttribute("y", 0);
    var bbox = text.getBBox();
    var w = Math.ceil(bbox.width) + 2 * L.padX;
    var h = Math.ceil(bbox.height) + 2 * L.padY;
    if (lv) { w = Math.max(w, lv.minW || 0); lv.minW = w; }      // the box does not shrink while the value changes
    text.setAttribute("x", L.padX);
    text.setAttribute("y", L.padY - bbox.y);          // bbox.y < 0: the ascent above the baseline

    // the box
    box.setAttribute("x", 0);
    box.setAttribute("y", 0);
    box.setAttribute("width", w);
    box.setAttribute("height", h);
    var r = Math.round(h * 0.35);
    box.setAttribute("rx", r);
    box.setAttribute("ry", r);
    box.style.fill = L.box;
    box.style.stroke = L.border;
    box.style.strokeWidth = L.borderWidth + 'px';

    // the dashed line starts at the centre of the box (the box hides its beginning)
    var p = getArrayPoints(line);
    var cx = Math.round(w / 2), cy = Math.round(h / 2);
    var same = (p.length < 2) || (p[1].x == p[0].x && p[1].y == p[0].y);
    p[0].x = cx; p[0].y = cy;
    if (same) { p[1] = { x: cx, y: cy }; }
    line.setAttribute("points", polylineToAttribute(p, 0, 0));
    line.style.stroke = color;
    line.style.strokeWidth = L.lineWidth + 'px';
    line.style["stroke-dasharray"] = L.dash;
    line.style.fill = "none";

    // a wave left by an older version in a saved file is removed
    ['.probeWave', '.probeDot', '.probeZero'].forEach(function (c) {
        var old = elem.querySelector(c);
        if (old) elem.removeChild(old);
    });

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



function stylePosProbe(elem,nature){
    // the colour follows the type of the signal (green: voltage, amber: current)
    if (nature == 'current') elem.setAttribute('type', 'current');
    else if (elem.getAttribute('type') == 'current') elem.setAttribute('type', 'voltage');
    structProbe(elem);
}



function setProbesValues(val) {
    var probes = document.getElementsByName('probe');

    for (var i = 0; i < probes.length; i++) {
        var r = probes[i].childNodes[2].textContent.split("=");
        probes[i].childNodes[2].textContent = r[0] + '=' + val[i];
        structProbe(probes[i]);
    }

}


// Description of the signal measured by a probe, from its name:
//   "Out1"   a node (wire)            -> { nod: true,  pos: 'Out1' }
//   "R1.I"   a signal of an element   -> { nod: false, pos: 'R1', pin: '' }
// type: 'current' (red dashed line) or 'voltage'; the type saved in the probe tells it
function parseSignal(name, nodes, probe) {
    var kind = probe ? probe.getAttribute('type') : '';
    var type = (kind == 'current') ? 'current' : 'voltage';
    if (name.indexOf('.') < 0)
        return { nod: nodes.includes(name), pos: name, pin: '', type: type };
    return { nod: false, pos: name.split('.')[0], pin: '', type: type };
}


function findPosProb() {

    var nodes=getNetRefs();
    var probes = document.getElementsByClassName('probe');
    for (var i = 0; i < probes.length; i++) {
        var name = probes[i].childNodes[2].textContent.split("=")[0];
        if(name=='None')
            continue;
        var tprobe = parseSignal(name, nodes, probes[i]);
        stylePosProbe(probes[i],tprobe.type);
        var elem = probes[i].childNodes[0];
		var pos=getPosRef(tprobe);
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


// "1.5 mA", "12 V": engineering notation of a value
function probeValueText(v, unit) {
    if (v === null || v === undefined || !isFinite(v)) return '?';
    var a = Math.abs(v);
    var p = [[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p']];
    if (a === 0) return '0' + unit;
    for (var i = 0; i < p.length; i++)
        if (a >= p[i][0]) return parseFloat((v / p[i][0]).toPrecision(4)) + p[i][1] + unit;
    return v.toExponential(2) + unit;
}

function modifedProbeDisplay(elem)
{
	 var r= elem.childNodes[2].textContent.split("=");
	 var h=elem.getAttribute("display");
	 if( (h!="OP") && (r.length==2)){
		 elem.childNodes[2].textContent=r[0];
	 }
}
