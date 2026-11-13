/*
Name:        plotlyScaleFix.js
Description: The plots live inside the schematic, whose SVG is enlarged by the page zoom (viewBox scaling).
             Plotly measures the mouse in screen pixels but draws in layout pixels, and it only corrects
             this for CSS transforms. In a zoomed SVG the hover labels and the zoom box / wheel zoom were
             therefore far from the pointer.
             This file tells every plot its real scale (rendered size / layout size), so the pointer is
             converted correctly at any page zoom. Load it right after plotly.js.
*/
(function () {
    if (typeof Plotly === 'undefined') return;

    function element(gd) {
        return (typeof gd === 'string') ? document.getElementById(gd) : gd;
    }

    // Plotly asks the plot for the matrix that converts a screen offset into layout pixels
    function installScale(gd) {
        var full = gd && gd._fullLayout;
        if (!full) return;
        full._calcInverseTransform = function (g) {
            var el = g || gd;
            var r = el.getBoundingClientRect();
            var kx = (r.width > 0 && el.offsetWidth > 0) ? el.offsetWidth / r.width : 1;
            var ky = (r.height > 0 && el.offsetHeight > 0) ? el.offsetHeight / r.height : 1;
            full._invTransform = [[kx, 0, 0, 0], [0, ky, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            full._invScaleX = kx;
            full._invScaleY = ky;
        };
        full._calcInverseTransform(gd);
    }

    function watch(gd) {
        if (!gd) return;
        installScale(gd);
        if (!gd.__pyamsScaleFix && typeof gd.on === 'function') {
            gd.__pyamsScaleFix = true;
            gd.on('plotly_afterplot', function () { installScale(gd); });   // _fullLayout is rebuilt on every redraw
        }
    }

    ['plot', 'newPlot', 'react'].forEach(function (name) {
        var original = Plotly[name];
        if (typeof original !== 'function') return;
        Plotly[name] = function (gd) {
            var result = original.apply(this, arguments);
            var el = element(gd);
            if (result && typeof result.then === 'function') {
                return result.then(function (v) { watch(el); return v; });
            }
            watch(el);
            return result;
        };
    });
})();
