/*
#-------------------------------------------------------------------------------
# Name:        plots.js
# Purpose:     PyAMS
# Author:      d.fathi
# Created:     06/11/2021
# Copyright:  (c) PyAMS 2021-2026
# Licence:
#-------------------------------------------------------------------------------
 */
/*
Despite the fact that Plotly.js is open source, it is licensed under the MIT license, which means that you can use it for free in your own projects, 
even commercial ones. However, if you want to use Plotly.js in a commercial product, you may need to purchase a commercial license from Plotly.
it used in this project for plotting graphs and visualizing data. It provides a wide range of chart types and customization options, making it a popular
 choice for data visualization in web applications.

*/


function plots() {
    var npoints = 10000;
    var y = [];
    for (var i = 0, l = npoints; i < l; i++) {
        y.push(Math.random())
    };

    var x = [];
    for (var i = 0, l = npoints; i < l; i++) {
        x.push(i);
    };

    var listForPlot = document.getElementsByName('plots');
    for (var i = 0; i < listForPlot.length; i++) {
        Plotly.plot(listForPlot[i], [{
                    type: 'scatter',
                    x: x,
                    y: y
                }
            ], {
            margin: {
                l: 5,
                r: 5,
                b: 5,
                t: 5,
                pad: 4
            },
            paper_bgcolor: '#7f7f7f',
            plot_bgcolor: '#c7c7c7'
        });
        Plotly.redraw(listForPlot[i]);
    }

}
/*

var plotConfig = {
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage', 'pan2d', 'toggleSpikelines', 'select2d', 'lasso2d', 'resetScale2d']
};
*/

// ============================================
// Custom button icon for opening in a new window
// ============================================
var openExternalIcon = {
    width: 1000,
    height: 1000,
    path: 'M786 296v-267q0-15-11-26t-25-10h-214v214h-143v-214h-214q-15 0-25 10t-11 26v267q0 1 0 2t0 2l321 264 321-264q1-1 1-4z m124 39l-34-41q-5-5-12-6h-2q-7 0-12 3l-386 322-386-322q-7-4-13-4-7 2-12 7l-35 41q-4 5-3 13t6 12l401 334q18 15 42 15t43-15l136-114v109q0 8 5 13t13 5h107q8 0 13-5t5-13v-227l122-102q5-5 6-12t-4-13z',
    transform: 'matrix(1 0 0 -1 0 850)'
};

// Camera icon for the "Save plot as PNG" button (Plotly is loaded after this file, so it is defined here)
var cameraIcon = {
    width: 1000,
    height: 1000,
    path: 'm500 450c-83 0-150-67-150-150 0-83 67-150 150-150 83 0 150 67 150 150 0 83-67 150-150 150z m400 150h-120c-16 0-34 13-39 29l-31 93c-6 15-23 28-40 28h-340c-16 0-34-13-39-28l-31-94c-6-15-23-28-40-28h-120c-55 0-100-45-100-100v-450c0-55 45-100 100-100h800c55 0 100 45 100 100v450c0 55-45 100-100 100z m-400-550c-138 0-250 112-250 250 0 138 112 250 250 250 138 0 250-112 250-250 0-138-112-250-250-250z m365 380c-19 0-35-16-35-35 0-19 16-35 35-35 19 0 35 16 35 35 0 19-16 35-35 35z',
    transform: 'matrix(1 0 0 -1 0 850)'
};

// ============================================
// Plotly configuration for the plots
// ============================================
var plotConfig = {
    displaylogo: false,
    modeBarButtonsToAdd: [
        {
            // Replaces Plotly's default "Download plot as png" (downloads are blocked inside VS Code webviews)
            name: 'savePng',
            title: 'Save plot as PNG',
            icon: cameraIcon,
            click: function(gd) {
                Plotly.toImage(gd, { format: 'png', width: gd.offsetWidth || 1000, height: gd.offsetHeight || 600, scale: 2 })
                    .then(function(dataUrl) {
                        var t = (gd.layout && gd.layout.title) ? (gd.layout.title.text || gd.layout.title) : '';
                        vscode.postMessage({ type: 'savePng', dataUrl: dataUrl, name: (typeof t === 'string' && t) ? t : 'plot' });
                    })
                    .catch(function(err) { console.error('Save PNG failed:', err); vscode.postMessage({ type: 'savePngError', error: String(err && err.message || err) }); });
            }
        },
        {
            name: 'openExternal',
            title : 'Open in dialog (edit layout)',
            icon: openExternalIcon,
            click: function(gd) { dsOpenPlotDialog(gd); }
        }
    ],
    modeBarButtonsToRemove: ['sendDataToCloud', 'resetScale2d', 'toImage'] // Remove the default "Send to Cloud" button
};

function addPlot(elem) {
	creatPin(elem);
	creatPin(elem);
	elem.childNodes[1].childNodes[0].style.stroke = "#0000ff";

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
   // newElement.setAttribute("class", "draggable");
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 220);
    newElement.setAttribute("height", 180);
    newElement.innerHTML = "<div name='plots' style='border-style: double;' ></div>";
    elem.appendChild(newElement);
}

function newPlots(element) {
  var layout = {
      margin: {
          l: 35,
          r: 25,
          b: 35,
          t: 35
      },
  xaxis: {
          title:{text:''},
          showgrid:true,
          gridcolor:"#000000",
          autorange: true
      },
  yaxis: {
          gridcolor:"#000000",
          showgrid:true,
          autorange: true
      },
  title:' ',
  font: {
          size: 12,
          family: 'sans-serif',
          color:'#000000'
      },
  legend:{
    font:
    {family: 'sans-serif',
    size: 9,
    color: '#000000'},
    bgcolor: '#E2E2E2',
    bordercolor: '#FFFFFF',
    borderwidth: 1},
    showlegend: true,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    bordercolor: '#000000',

    grid: {
    rows: 1,
    columns: 1,
    pattern: 'independent',
    roworder: 'bottom to top'
  }
  };


    var e = element.lastChild.firstChild;
    Plotly.plot(e, [{
                type: 'scatter',
                x: [],
                y: []
            }
        ], layout, plotConfig);

}





function plotsSaveDataLayoutInDiv() {
    var listForPlot = document.querySelectorAll('[name="plots"]');
    for (var i = 0; i < listForPlot.length; i++) {
        var gd = listForPlot[i];
        layout = JSON.stringify(gd.layout);
        data = JSON.stringify(gd.data);
        //alert(data);
        listForPlot[i].setAttribute("layout", layout);
        listForPlot[i].setAttribute("data", data);
    }
}




function plotsOpenDataLayoutInDiv() {

    var listForPlot = document.querySelectorAll('[name="plots"]');
    for (var i = 0; i < listForPlot.length; i++) {

        layout = JSON.parse(listForPlot[i].getAttribute("layout"));
        data = JSON.parse(listForPlot[i].getAttribute("data"));
        Plotly.plot(listForPlot[i], data, layout, plotConfig);
    }

  var listAnalysis = document.getElementsByClassName("analysis");
    for (var i = 0; i < listAnalysis.length; i++)
         modifedSizeAnalysis(listAnalysis[i]);
}

function showPlotInModel(self) {
    dsOpenPlotDialog(self);
}








// ============================================
// Mouse-position correction for scaled plots (hover, zoom box, pan)
// The plots live inside an SVG <foreignObject> (scaled by the editor zoom) and use CSS "zoom".
// Plotly 1.58 only knows about CSS transforms, so it mis-reads the mouse position in that case.
// We replace its "inverse transform" computation with the real rendered scale of the plot.
// ============================================
function dsFixPlotScale(gd) {
    var fl = gd && gd._fullLayout;
    if (!fl) return;
    fl._calcInverseTransform = function (g) {
        var f = g._fullLayout;
        var svg = g.querySelector('.main-svg');
        if (!f || !svg) return;
        var r = svg.getBoundingClientRect();
        var w = parseFloat(svg.getAttribute('width')) || f.width;
        var h = parseFloat(svg.getAttribute('height')) || f.height;
        var kx = (r.width > 0 && w > 0) ? w / r.width : 1;
        var ky = (r.height > 0 && h > 0) ? h / r.height : 1;
        f._invTransform = [[kx, 0, 0, 0], [0, ky, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
        f._invScaleX = kx;
        f._invScaleY = ky;
        f._lastBBox = r;
    };
}

document.addEventListener('DOMContentLoaded', function () {
    if (typeof Plotly === 'undefined') return;
    ['plot', 'newPlot', 'react'].forEach(function (name) {
        var orig = Plotly[name];
        if (typeof orig !== 'function') return;
        Plotly[name] = function (gd) {
            var el = (typeof gd === 'string') ? document.getElementById(gd) : gd;
            var res = orig.apply(this, arguments);
            var apply = function () {
                if (!el) return;
                dsFixPlotScale(el);
                if (!el._dsScaleHooked && el.on) {
                    el._dsScaleHooked = true;
                    // Plotly resets the function after a re-layout, so re-apply it
                    el.on('plotly_afterplot', function () { dsFixPlotScale(el); });
                    el.on('plotly_relayout', function () { dsFixPlotScale(el); });
                }
            };
            apply();
            if (res && res.then) res.then(function (r) { apply(); return r; });
            return res;
        };
    });
});


// ============================================
// Plot dialog: shows the plot large, with a toolbar to change its layout
// ============================================
var dsPlotDialogCss = [
'#plotViewDialogOverlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:center;justify-content:center;}',
'#plotViewDialog{background:var(--vscode-editor-background,#fff);color:var(--vscode-foreground,#222);width:92vw;height:90vh;display:flex;flex-direction:column;border:1px solid var(--vscode-widget-border,var(--vscode-panel-border,#ccc));border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.45);font-family:var(--vscode-font-family,"Segoe UI",sans-serif);font-size:13px;overflow:hidden;}',
'#plotViewDialog .pv-head{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--vscode-panel-border,#e3e3e3);font-size:15px;background:var(--vscode-editorWidget-background,transparent);}',
'#plotViewDialog .pv-close{cursor:pointer;font-size:20px;line-height:1;border:0;background:none;color:var(--vscode-foreground,#444);}',
'#plotViewDialog .pv-close:hover{color:var(--vscode-errorForeground,#e51400);}',
'#plotViewDialog .pv-tools{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;padding:8px 16px;background:var(--vscode-sideBar-background,var(--vscode-editorWidget-background,#f6f7f8));border-bottom:1px solid var(--vscode-panel-border,#e3e3e3);}',
'#plotViewDialog .pv-tools label{display:flex;align-items:center;gap:5px;white-space:nowrap;}',
'#plotViewDialog input[type=text],#plotViewDialog input[type=number],#plotViewDialog select{padding:3px 6px;color:var(--vscode-input-foreground,#222);background:var(--vscode-input-background,#fff);border:1px solid var(--vscode-input-border,var(--vscode-panel-border,#bbb));border-radius:3px;font-family:inherit;font-size:inherit;}',
'#plotViewDialog select{background:var(--vscode-dropdown-background,var(--vscode-input-background,#fff));color:var(--vscode-dropdown-foreground,var(--vscode-input-foreground,#222));border-color:var(--vscode-dropdown-border,var(--vscode-panel-border,#bbb));}',
'#plotViewDialog input[type=text]{width:130px;}',
'#plotViewDialog input[type=number]{width:60px;}',
'#plotViewDialog input:focus,#plotViewDialog select:focus{outline:1px solid var(--vscode-focusBorder,#0078d4);outline-offset:-1px;}',
'#plotViewDialog .pv-btn{padding:4px 12px;border:0;border-radius:3px;background:var(--vscode-button-background,#0078d4);color:var(--vscode-button-foreground,#fff);cursor:pointer;font-family:inherit;font-size:inherit;}',
'#plotViewDialog .pv-btn:hover{background:var(--vscode-button-hoverBackground,#026ec1);}',
'#plotViewDialog .pv-btn.sec{background:var(--vscode-button-secondaryBackground,#e1e4e8);color:var(--vscode-button-secondaryForeground,#222);}',
'#plotViewDialog .pv-btn.sec:hover{background:var(--vscode-button-secondaryHoverBackground,#d0d4d9);}',
'#plotViewDialog .pv-plot{flex:1;min-height:0;}',
'#plotViewDialog .pv-foot{display:flex;justify-content:flex-end;gap:8px;padding:8px 16px;border-top:1px solid var(--vscode-panel-border,#e3e3e3);}'
].join('\n');

// Colors of the current VS Code theme, for the plot itself
function dsThemeColors() {
    var cs = getComputedStyle(document.documentElement);
    var v = function (name, fb) { var x = cs.getPropertyValue(name).trim(); return x || fb; };
    var bg = v('--vscode-editor-background', '#ffffff');
    var fg = v('--vscode-editor-foreground', '#444444');
    var grid = v('--vscode-editorWidget-border', v('--vscode-panel-border', '#bdbdbd'));
    return { paper: bg, plot: bg, font: fg, grid: grid };
}

function dsOpenPlotDialog(srcGd) {
    if (!srcGd || !srcGd.data) return;
    var old = document.getElementById('plotViewDialogOverlay');
    if (old) old.remove();
    if (!document.getElementById('plotViewDialogStyle')) {
        var st = document.createElement('style');
        st.id = 'plotViewDialogStyle';
        st.textContent = dsPlotDialogCss;
        document.head.appendChild(st);
    }

    var data = JSON.parse(JSON.stringify(srcGd.data));
    var layout = JSON.parse(JSON.stringify(srcGd.layout || {}));
    delete layout.width; delete layout.height;
    layout.autosize = true;
    var origLayout = JSON.parse(JSON.stringify(layout));

    var axisKeys = function (prefix) {
        return Object.keys(layout).filter(function (k) { return k === prefix || new RegExp('^' + prefix + '\\d+$').test(k); });
    };
    var titleText = function (t) { return t ? (typeof t === 'string' ? t : (t.text || '')) : ''; };
    var xs = axisKeys('xaxis'), ys = axisKeys('yaxis');
    var x0 = layout[xs[0]] || {}, y0 = layout[ys[0]] || {};
    var lw0 = (data[0] && data[0].line && data[0].line.width) || 2;

    var overlay = document.createElement('div');
    overlay.id = 'plotViewDialogOverlay';
    overlay.innerHTML =
        '<div id="plotViewDialog">' +
        '<div class="pv-head"><b>Plot</b><button class="pv-close" title="Close">&times;</button></div>' +
        '<div class="pv-tools">' +
        '<label>Title <input type="text" id="pvTitle"></label>' +
        '<label>X label <input type="text" id="pvXTitle"></label>' +
        '<label>Y label <input type="text" id="pvYTitle"></label>' +
        '<label><input type="checkbox" id="pvGrid"> Grid</label>' +
        '<label><input type="checkbox" id="pvLogX"> Log X</label>' +
        '<label><input type="checkbox" id="pvLogY"> Log Y</label>' +
        '<label><input type="checkbox" id="pvLegend"> Legend</label>' +
        '<label>Legend <select id="pvLegendPos"><option value="right">Right</option><option value="bottom">Bottom</option><option value="top">Top</option><option value="inside">Inside</option></select></label>' +
        '<label>Line width <input type="number" id="pvLine" min="0.5" max="10" step="0.5"></label>' +
        '<label>Font size <input type="number" id="pvFont" min="8" max="30" step="1"></label>' +
        '<label>Background <select id="pvBg"><option value="auto">VS Code theme</option><option value="light">Light</option><option value="dark">Dark</option></select></label>' +
        '<label>Hover <select id="pvHover"><option value="x unified">Unified X</option><option value="closest">Closest</option><option value="x">X</option></select></label>' +
        '<button class="pv-btn sec" id="pvReset">Reset</button>' +
        '</div>' +
        '<div class="pv-plot" id="pvPlot"></div>' +
        '<div class="pv-foot">' +
        '<button class="pv-btn sec" id="pvPng">Save PNG</button>' +
        '<button class="pv-btn sec" id="pvCsv" title="Save the plotted curves as a CSV file">Save CSV</button>' +
        '<button class="pv-btn sec" id="pvApply" title="Copy this layout to the plot in the schematic">Apply to schematic</button>' +
        '<button class="pv-btn" id="pvClose">Close</button>' +
        '</div></div>';
    document.body.appendChild(overlay);

    var $ = function (id) { return overlay.querySelector('#' + id); };
    var plotDiv = $('pvPlot');

    function fillControls() {
        $('pvTitle').value = titleText(layout.title);
        $('pvXTitle').value = titleText(x0.title);
        $('pvYTitle').value = titleText(y0.title);
        $('pvGrid').checked = (x0.showgrid !== false);
        $('pvLogX').checked = (x0.type === 'log');
        $('pvLogY').checked = (y0.type === 'log');
        $('pvLegend').checked = (layout.showlegend !== false);
        $('pvLine').value = lw0;
        $('pvFont').value = (layout.font && layout.font.size) || 12;
        $('pvBg').value = 'auto';
        $('pvHover').value = layout.hovermode || 'closest';
    }
    fillControls();

    Plotly.newPlot(plotDiv, data, layout, { displaylogo: false, responsive: true,
        modeBarButtonsToRemove: ['sendDataToCloud', 'toImage'] });

    function themeUpdate(mode) {
        var c = (mode === 'dark') ? { paper: '#1e1e1e', plot: '#2b2b2b', font: '#e6e6e6', grid: '#444444' }
              : (mode === 'light') ? { paper: '#ffffff', plot: '#fafafa', font: '#444444', grid: '#dddddd' }
              : dsThemeColors();
        var u = { paper_bgcolor: c.paper, plot_bgcolor: c.plot, 'font.color': c.font };
        axisKeys('xaxis').concat(axisKeys('yaxis')).forEach(function (k) {
            u[k + '.gridcolor'] = c.grid; u[k + '.zerolinecolor'] = c.grid; u[k + '.linecolor'] = c.grid;
        });
        Plotly.relayout(plotDiv, u);
    }
    themeUpdate('auto');
    // follow VS Code theme changes while the dialog is open
    var themeObserver = new MutationObserver(function () {
        if ($('pvBg') && $('pvBg').value === 'auto') themeUpdate('auto');
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-vscode-theme-id'] });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    function relayoutAll(prefix, keys, prop, value) {
        var u = {};
        keys.forEach(function (k) { u[k + '.' + prop] = value; });
        Plotly.relayout(plotDiv, u);
    }
    function setTitle(id, fn) { $(id).addEventListener('input', function (e) { fn(e.target.value); }); }

    setTitle('pvTitle', function (v) { Plotly.relayout(plotDiv, { 'title.text': v }); });
    setTitle('pvXTitle', function (v) { relayoutAll('xaxis', axisKeys('xaxis'), 'title.text', v); });
    setTitle('pvYTitle', function (v) { relayoutAll('yaxis', axisKeys('yaxis'), 'title.text', v); });
    $('pvGrid').addEventListener('change', function (e) {
        var u = {};
        axisKeys('xaxis').concat(axisKeys('yaxis')).forEach(function (k) { u[k + '.showgrid'] = e.target.checked; });
        Plotly.relayout(plotDiv, u);
    });
    $('pvLogX').addEventListener('change', function (e) {
        relayoutAll('xaxis', axisKeys('xaxis'), 'type', e.target.checked ? 'log' : 'linear');
    });
    $('pvLogY').addEventListener('change', function (e) {
        relayoutAll('yaxis', axisKeys('yaxis'), 'type', e.target.checked ? 'log' : 'linear');
    });
    $('pvLegend').addEventListener('change', function (e) { Plotly.relayout(plotDiv, { showlegend: e.target.checked }); });
    $('pvLegendPos').addEventListener('change', function (e) {
        var p = e.target.value, u;
        if (p === 'bottom') u = { 'legend.orientation': 'h', 'legend.x': 0, 'legend.xanchor': 'left', 'legend.y': -0.2, 'legend.yanchor': 'top' };
        else if (p === 'top') u = { 'legend.orientation': 'h', 'legend.x': 0, 'legend.xanchor': 'left', 'legend.y': 1.1, 'legend.yanchor': 'bottom' };
        else if (p === 'inside') u = { 'legend.orientation': 'v', 'legend.x': 0.98, 'legend.xanchor': 'right', 'legend.y': 0.98, 'legend.yanchor': 'top' };
        else u = { 'legend.orientation': 'v', 'legend.x': 1.02, 'legend.xanchor': 'left', 'legend.y': 1, 'legend.yanchor': 'top' };
        Plotly.relayout(plotDiv, u);
    });
    $('pvLine').addEventListener('input', function (e) {
        var w = parseFloat(e.target.value);
        if (w > 0) Plotly.restyle(plotDiv, { 'line.width': w });
    });
    $('pvFont').addEventListener('input', function (e) {
        var f = parseFloat(e.target.value);
        if (f > 0) Plotly.relayout(plotDiv, { 'font.size': f });
    });
    $('pvBg').addEventListener('change', function (e) { themeUpdate(e.target.value); });
    $('pvHover').addEventListener('change', function (e) { Plotly.relayout(plotDiv, { hovermode: e.target.value }); });

    $('pvReset').addEventListener('click', function () {
        layout = JSON.parse(JSON.stringify(origLayout));
        Plotly.react(plotDiv, JSON.parse(JSON.stringify(srcGd.data)), layout);
        x0 = layout[xs[0]] || {}; y0 = layout[ys[0]] || {};
        fillControls();
        $('pvLegendPos').value = 'right';
        themeUpdate('auto');
    });

    $('pvPng').addEventListener('click', function () {
        Plotly.toImage(plotDiv, { format: 'png', width: plotDiv.offsetWidth, height: plotDiv.offsetHeight, scale: 2 })
            .then(function (url) {
                var t = titleText(plotDiv.layout.title);
                vscode.postMessage({ type: 'savePng', dataUrl: url, name: t || 'plot' });
            })
            .catch(function (err) { vscode.postMessage({ type: 'savePngError', error: String(err && err.message || err) }); });
    });

    $('pvCsv').addEventListener('click', function () {
        var text = dsPlotToCsv(plotDiv);
        if (!text) { vscode.postMessage({ type: 'savePngError', error: 'No data to export' }); return; }
        var t = titleText(plotDiv.layout.title);
        vscode.postMessage({ type: 'saveCsv', text: text, name: t || 'plot' });
    });

    $('pvApply').addEventListener('click', function () {
        var l = JSON.parse(JSON.stringify(plotDiv.layout));
        // keep the schematic plot's own size
        if (srcGd.layout) { l.width = srcGd.layout.width; l.height = srcGd.layout.height; }
        else { delete l.width; delete l.height; }
        l.autosize = false;
        Plotly.react(srcGd, JSON.parse(JSON.stringify(plotDiv.data)), l, plotConfig);
        try { plotsSaveDataLayoutInDiv(); } catch (e) {}
        try { if (typeof drawing !== 'undefined' && drawing.saveData) drawing.saveData('Plot layout'); } catch (e) {}
    });

    function close() {
        try { themeObserver.disconnect(); } catch (e) {}
        try { Plotly.purge(plotDiv); } catch (e) {}
        overlay.remove();
    }
    overlay.querySelector('.pv-close').addEventListener('click', close);
    $('pvClose').addEventListener('click', close);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    // keep editor shortcuts (a, w, t, ...) from firing while typing in the dialog
    overlay.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Escape') close();
    });
}


// Build CSV text from the visible curves of a plot.
// Curves that share the same X values are written as columns of one table (x, y1, y2, ...);
// otherwise each curve gets its own pair of columns (name x, name y).
function dsPlotToCsv(gd) {
    var traces = (gd.data || []).filter(function (t) {
        return t && t.visible !== false && t.visible !== 'legendonly' && t.y && t.y.length;
    });
    if (!traces.length) return '';
    var esc = function (v) {
        if (v === undefined || v === null) return '';
        v = String(v);
        return /[",\n\r;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    var arr = function (a) { return Array.prototype.slice.call(a || []); };
    var lay = gd.layout || {};
    var xt = lay.xaxis && lay.xaxis.title; xt = xt ? (typeof xt === 'string' ? xt : (xt.text || '')) : '';
    var xname = xt || 'x';
    var nameOf = function (t, i) { return t.name || ('trace' + (i + 1)); };

    var x0 = arr(traces[0].x);
    var sameX = x0.length > 0 && traces.every(function (t) {
        var x = arr(t.x);
        if (x.length !== x0.length) return false;
        for (var i = 0; i < x.length; i++) if (x[i] !== x0[i]) return false;
        return true;
    });

    var rows = [];
    if (sameX) {
        rows.push([xname].concat(traces.map(nameOf)).map(esc).join(','));
        for (var i = 0; i < x0.length; i++) {
            var r = [x0[i]];
            traces.forEach(function (t) { r.push(t.y[i]); });
            rows.push(r.map(esc).join(','));
        }
    } else {
        var head = [], cols = [], n = 0;
        traces.forEach(function (t, i) {
            head.push(nameOf(t, i) + ' ' + xname, nameOf(t, i));
            var x = arr(t.x); if (!x.length) x = t.y.map(function (_, k) { return k; });
            cols.push(x, arr(t.y));
            n = Math.max(n, t.y.length);
        });
        rows.push(head.map(esc).join(','));
        for (var j = 0; j < n; j++) rows.push(cols.map(function (c) { return esc(c[j]); }).join(','));
    }
    return rows.join('\r\n');
}
