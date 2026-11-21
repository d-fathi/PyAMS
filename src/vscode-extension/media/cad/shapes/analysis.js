/*
#-------------------------------------------------------------------------------
# Name:        Analysis.js
# Description: Analysis circuit
# Author:      d.fathi
# Created:     29/04/2021
# Update:      21/07/2026
# Copyright:   (c) PyAMS 2026
# Licence:     free 
#-------------------------------------------------------------------------------
*/


//--------------------------------------------Creat Analysis----------------------------------------------------//

function addPlotAnalysis(elem) {

var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
   // newElement.setAttribute("class", "draggable");
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 440);
    newElement.setAttribute("height", 360);
    newElement.innerHTML = "<div name='plots' style='border-style:double; transform-origin:0 0; transform:scale(0.6);'  ondblclick='showPlotInModel(this)'></div>";
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

        // The plot is drawn at 100/60 of its size and shown at 60 %. This is done with a transform and
        // not with the CSS "zoom" property: browsers disagree on the mouse coordinates inside "zoom",
        // so hover labels and the zoom box of the plot were far from the pointer.
        // (files saved by older versions still carry zoom:60%: it is converted here)
        e.style.zoom = '';
        e.style.transformOrigin = '0 0';
        e.style.transform = 'scale(' + (1 / a) + ')';

        // the frame (3px double border) is inside the box, so that once scaled the box is exactly w x h
        e.style.boxSizing = 'border-box';
        e.style.borderWidth = '3px';
        e.style.margin = '0';
        e.style.padding = '0';
        e.style.width = a*w + 'px';
        e.style.height = a*h + 'px';

        // one relayout draws the plot again at its new size (a redraw before it was a second, useless rendering);
        // a plot that was not drawn yet (no data) only gets its size
        var update = {
            width: a*w - 6,
            height: a*h - 6
        };
        if (e.data) { Plotly.relayout(e, update); if (typeof waveWatch == "function" && e.data.some(function (t) { return t.meta && t.meta.wave == "text"; })) { waveWatch(e); waveFitText(e); } }
    }
}

function setLayout_() {
  return   {
   /* title: {text:''},*/
    margin: {
          l: 35,
          r: 25,
          b: 80,
          t: 35
      },
    font: { color: '#333333', size: 11, family: 'Arial' },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#f8f8f8',
    bordercolor: '#cccccc',
    yaxis: { 
      type: 'linear', 
      gridcolor: '#e0e0e0', 
      showgrid: true 
    },
    xaxis: { 
      type: 'linear', 
      gridcolor: '#e0e0e0', 
      showgrid: true 
    },
    showlegend: true, 
    grid: { rows: 1, columns: 1,    pattern: 'independent',  roworder: 'bottom to top'}
  }
}


function addAnalysis(elem){
  var analy={type:'DC Sweep',title:'',dcsweep:{param:'Non',unit:'',start:'0',stop:'0',step:'0'},
  time:{start:'0s',stop:'0s',step:'0s'},
  ac:{start: '1', stop: '1000', step: '100', scale: 'dec' , type: 'de'}}


  analy.yAxe=[];
  analy.xAxe={name:'None',unit:'',type:'',color:"#000000", used:false};
  analy.layout=setLayout_();
  analy.options={};
  analy.sweep={ param:'', values:'[]'};


  analy.dcsweep.modified=false;
  analy.time.modified=false;
  analy.ac.modified=false;

	elem.setAttribute("description", JSON.stringify(analy));
}


//---------------------------------update all plots--------------------------------------------------------------//


function getAnalysis() {
  	var elem=drawing.resize.setElement;
    var analy=JSON.parse(elem.getAttribute("description"));
    

      if(analy.type=='DC Sweep'){
         var dc=analy.dcsweep;
         var analysis={type:"dc",param:dc.param,start:dc.start,stop:dc.stop,step:dc.step,oupouts:{names:[],color:[]},options: analy.options};
       } else if(analy.type=='Time Domain') {
         var tr=analy.time;
         var analysis={type:analy.type,start:tr.start,step:tr.step,stop:tr.stop,oupouts:{names:[],color:[]},options:  analy.options};
      } else if(analy.type=='AC Analysis') {
        var ac=analy.ac;
        var analysis={type:"ac",start:ac.start,stop:ac.stop,step:ac.step,scale:ac.scale,oupouts:{names:[],color:[]},options:  analy.options};
      }

      var r=analy.yAxe;
      for(var i=0;i<r.length;i++){
          if(r[i].digital) continue;       // a digital output: its nodes are added below
          analysis.oupouts.names.push(r[i].name);
          analysis.oupouts.color.push(r[i].color);
       }

      // the nodes of the digital (wave) rows are outputs too (Time Domain only)
      if(analy.type=='Time Domain'){
          var wv=waveExpand(analy);
          for(var i=0;i<wv.length;i++)
              for(var k=0;k<wv[i].nodes.length;k++)
                  if(analysis.oupouts.names.indexOf(wv[i].nodes[k])<0){
                      analysis.oupouts.names.push(wv[i].nodes[k]);
                      analysis.oupouts.color.push(wv[i].color);
                  }
      }

      if(analy.xAxe.used && ((analy.type=='DC Sweep')||(analy.type=='Time Domain')))
          analysis.xAxe=analy.xAxe.name;
      if(analy.options.second_sweep && analy.options.second_sweep==true){
          analysis.sweep={param:analy.sweep.param, values:analy.sweep.values};
        }

      return analysis;
}







//--------------------------------------------------------------
//  Digital rows : digital signals (bit / bus) like the wave window of a VHDL simulator
//--------------------------------------------------------------
//  A digital output is an entry of analy.yAxe added from the signal dialog (a dsignal of a model):
//     {name: 'U1.D', color, digital: {nodes: ['D0', ..., 'D7'] (LSB first), fmt: 'bit' | 'hex' | 'bin' | 'dec'}}
//  analy.wavevth : logic threshold in volts "2.5" or an undefined band "0.8,2.0" (empty = half of the
//                  largest voltage of the row)
//  (files of the first version kept the rows in analy.waves = [{label, nodes, fmt, color}]: converted here)

// the nodes written as a bus name "D[0:7]", a list "s0, s1" or one node
function waveNodeList(text)
{
	text = String(text || '').trim();
	if (!text) return [];
	if (typeof busParse == 'function' && busParse(text) && typeof busNodeNames == 'function')
		return busNodeNames(text) || [];
	return text.split(/[\s,;]+/).filter(function (n) { return n.length > 0; });
}

// moves the rows of analy.waves into analy.yAxe; returns true when something changed
function waveMigrate(analy)
{
	if (!analy.waves || !analy.waves.length) { delete analy.waves; return false; }
	analy.waves.forEach(function (w) {
		var nodes = waveNodeList(w.nodes);
		if (!nodes.length) return;
		analy.yAxe.push({ name: w.label || String(w.nodes), color: w.color || '#8a63d2',
			digital: { nodes: nodes, fmt: w.fmt || (nodes.length == 1 ? 'bit' : 'hex') } });
	});
	delete analy.waves;
	return true;
}

// the digital rows, with the node names
function waveExpand(analy)
{
	var out = [], r = (analy.yAxe || []).slice();
	if (analy.waves && analy.waves.length) {                    // old file: not converted yet
		var c = JSON.parse(JSON.stringify(analy));
		waveMigrate(c);
		r = c.yAxe;
	}
	for (var i = 0; i < r.length; i++) {
		if (!r[i].digital) continue;
		var nodes = r[i].digital.nodes || [];
		if (!nodes.length) continue;
		var fmt = r[i].digital.fmt || (nodes.length == 1 ? 'bit' : 'hex');
		if (nodes.length > 1 && fmt == 'bit') fmt = 'hex';
		out.push({ label: r[i].name, nodes: nodes, fmt: fmt, color: r[i].color || '#8a63d2' });
	}
	return out;
}

// options of the plot: the wave rows and the logic threshold
function waveOptions(analy)
{
	if (analy.type != 'Time Domain') return {};
	var waves = waveExpand(analy);
	if (!waves.length) return {};
	var onlyWave = {}, i, k;
	for (i = 0; i < waves.length; i++)
		for (k = 0; k < waves[i].nodes.length; k++) onlyWave[waves[i].nodes[k]] = true;
	for (i = 0; i < analy.yAxe.length; i++) if (!analy.yAxe[i].digital) delete onlyWave[analy.yAxe[i].name];   // also drawn as analog
	var vth = String(analy.wavevth || '').split(/[\s,;]+/).filter(function (t) { return t.length; }).map(Number).filter(function (v) { return !isNaN(v); });
	return { waves: waves, waveOnly: onlyWave, vth: vth.length ? vth : null };
}

// bit values of one signal: 1, 0 or -1 (between vl and vh: undefined)
function waveBits(y, vl, vh)
{
	var b = new Int8Array(y.length);
	for (var k = 0; k < y.length; k++) {
		var v = y[k];
		b[k] = v > vh ? 1 : ((vl != vh && v >= vl) ? -1 : 0);
	}
	return b;
}

// constant segments of a bus [{a, z, v}] (v = null: undefined), bit 0 = LSB
function waveSegments(t, bits)
{
	var n = t.length, seg = [], s = 0, key = new Array(n), i, k;
	for (k = 0; k < n; k++) {
		var val = 0, und = false;
		for (i = 0; i < bits.length; i++) {
			if (bits[i][k] < 0) und = true;
			else if (bits[i][k] > 0) val += Math.pow(2, i);
		}
		key[k] = und ? -1 : val;
	}
	for (k = 1; k < n; k++)
		if (key[k] != key[s]) { seg.push({ a: t[s], z: t[k], v: key[s] < 0 ? null : key[s] }); s = k; }
	seg.push({ a: t[s], z: t[n - 1], v: key[s] < 0 ? null : key[s] });
	return seg;
}

function waveFormat(v, fmt, width)
{
	if (v === null) return 'X';
	if (fmt == 'bin') { var b = v.toString(2); while (b.length < width) b = '0' + b; return b; }
	if (fmt == 'dec') return String(v);
	return v.toString(16).toUpperCase();
}

// the Plotly traces of one wave row, drawn on the axes xaxis/yaxis number `row`
function waveTraces(results, w, vthOpt, row)
{
	var ser = results.series || [], arr = [], t = null, i;
	for (i = 0; i < w.nodes.length; i++) {
		var sr = null;
		for (var k = 0; k < ser.length; k++)
			if (ser[k].name == w.nodes[i] && !ser[k].run) { sr = ser[k]; break; }
		if (!sr) return [];
		arr.push(sr.y);
		if (!t) t = sr.x || results.x;
	}
	if (!t || !t.length) return [];
	var vl, vh;
	if (vthOpt && vthOpt.length) { vl = vthOpt[0]; vh = vthOpt.length > 1 ? vthOpt[1] : vthOpt[0]; if (vl > vh) { var tmp = vl; vl = vh; vh = tmp; } }
	else {
		var mx = -1e300;
		arr.forEach(function (y) { for (var k = 0; k < y.length; k++) if (y[k] > mx) mx = y[k]; });
		vl = vh = 0.5 * mx;
	}
	var bits = arr.map(function (y) { return waveBits(y, vl, vh); });
	var ax = { xaxis: 'x' + (row > 1 ? row : ''), yaxis: 'y' + (row > 1 ? row : '') };
	var out = [];
	if (w.nodes.length == 1) {                                  // one bit: step trace
		var b = bits[0], y = new Array(t.length), bad = new Array(t.length), anyBad = false;
		for (i = 0; i < t.length; i++) { y[i] = b[i] > 0 ? 1 : 0; bad[i] = b[i] < 0 ? 1 : 0; if (b[i] < 0) anyBad = true; }
		out.push(Object.assign({ type: 'scatter', mode: 'lines', x: t, y: y, name: w.label, showlegend: false,
			line: { color: w.color, width: 1.5, shape: 'hv' }, hovertemplate: w.label + ' = %{y}<extra></extra>',
			meta: { wave: 'bit' } }, ax));
		if (anyBad)
			out.push(Object.assign({ type: 'scatter', mode: 'lines', x: t, y: bad, fill: 'tozeroy', fillcolor: 'rgba(208,59,59,0.4)',
				line: { width: 0, shape: 'hv' }, showlegend: false, hoverinfo: 'skip', meta: { wave: 'x' } }, ax));
		return out;
	}
	var seg = waveSegments(t, bits), span = t[t.length - 1] - t[0];
	var px = [], py = [], bx = [], by = [], tx = [], ty = [], tt = [], hv = [], wd = [];
	seg.forEach(function (s) {
		var d = Math.min((s.z - s.a) * 0.15, span * 0.004);
		var poly = [[s.a, .5], [s.a + d, .9], [s.z - d, .9], [s.z, .5], [s.z - d, .1], [s.a + d, .1], [s.a, .5]];
		poly.forEach(function (q) { px.push(q[0]); py.push(q[1]); });
		px.push(null); py.push(null);
		if (s.v === null) { poly.forEach(function (q) { bx.push(q[0]); by.push(q[1]); }); bx.push(null); by.push(null); }
		tx.push((s.a + s.z) / 2); ty.push(.5);
		var txt = waveFormat(s.v, w.fmt, w.nodes.length);
		tt.push(txt); wd.push(s.z - s.a);
		hv.push(w.label + ' = ' + txt + (w.fmt != 'dec' && s.v !== null ? '  (' + s.v + ')' : ''));
	});
	out.push(Object.assign({ type: 'scatter', mode: 'lines', x: px, y: py, name: w.label, showlegend: false, hoverinfo: 'skip',
		connectgaps: false, line: { color: w.color, width: 1.2 }, meta: { wave: 'bus' } }, ax));
	if (bx.length)
		out.push(Object.assign({ type: 'scatter', mode: 'lines', x: bx, y: by, fill: 'toself', fillcolor: 'rgba(208,59,59,0.4)',
			line: { width: 0 }, showlegend: false, hoverinfo: 'skip', meta: { wave: 'x' } }, ax));
	out.push(Object.assign({ type: 'scatter', mode: 'text', x: tx, y: ty, text: tt.slice(), hovertext: hv, hoverinfo: 'text',
		textfont: { size: 10, color: '#0b0b0b' }, showlegend: false, customdata: wd,
		meta: { wave: 'text', full: tt.slice(), fmtw: w.nodes.length } }, ax));
	return out;
}

// hides the value of a segment that is too narrow to hold it (after a zoom the values appear)
function waveFitText(gd)
{
	try {
		if (!gd || !gd.data || !gd._fullLayout) return;
		if (gd.__waveBusy) return;
		var upd = [], idx = [];
		gd.data.forEach(function (tr, i) {
			if (!tr.meta || tr.meta.wave != 'text') return;
			// the axis of the trace (x, x2 ...); if it has no usable range, the first axis that has one
			var xa = gd._fullLayout[tr.xaxis ? tr.xaxis.replace('x', 'xaxis') : 'xaxis'];
			if (!xa || !xa.range || !(xa._length > 0)) xa = gd._fullLayout.xaxis;
			if (!xa || !xa.range) return;
			var span = Math.abs(xa.range[1] - xa.range[0]);
			if (!(span > 0)) return;
			var pxPerUnit = xa._length / span;
			var full = tr.meta.full, show = new Array(full.length), changed = false;
			for (var k = 0; k < full.length; k++) {
				show[k] = (tr.customdata[k] * pxPerUnit >= full[k].length * 7 + 6) ? full[k] : '';
				if (show[k] !== (tr.text ? tr.text[k] : '')) changed = true;
			}
			if (changed) { upd.push(show); idx.push(i); }
		});
		if (idx.length) {
			gd.__waveBusy = true;                      // the redraws below must not call this function again
			idx.forEach(function (i, n) { gd.data[i].text = upd[n]; });
			// Plotly drops a redraw asked while it is still drawing (a zoom in progress): the redraw is repeated
			// until the text drawn in the plot is the text asked for (at most 6 times)
			var want = 0;
			upd.forEach(function (u) { u.forEach(function (t) { if (t) want++; }); });
			var tries = 0;
			var redraw = function () {
				var drawn = gd.querySelectorAll('.textpoint text').length;
				if (drawn == want || tries++ >= 6) { gd.__waveBusy = false; return; }
				var again = function () { setTimeout(redraw, 60); };
				try { Promise.resolve(Plotly.redraw(gd)).then(again, again); } catch (e) { gd.__waveBusy = false; console.error(e); }
			};
			setTimeout(redraw, 20);
		}
	} catch (e) { gd.__waveBusy = false; console.error(e); }
}

// connects the values of the digital rows to every redraw of the plot (zoom, pan, resize, autoscale...)
function waveWatch(gd)
{
	if (!gd || gd.__waveWatch || typeof gd.on != 'function') return;
	gd.__waveWatch = true;
	['plotly_relayout', 'plotly_relayouting', 'plotly_afterplot', 'plotly_autosize', 'plotly_doubleclick'].forEach(function (ev) {
		gd.on(ev, function () { waveFitText(gd); });
	});
}
