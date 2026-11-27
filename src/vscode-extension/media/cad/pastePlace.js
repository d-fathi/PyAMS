/*
#--------------------------------------------------------------------------------------------------
Name:        pastePlace.js
Description: Placement of the pasted elements.
             * The pasted group is attached to the mouse pointer (snapped to the grid, like the other
               elements) until a click puts it down; Esc, Delete or the right button cancel the paste.
             * Without a known pointer position (the mouse never moved over the schematic) the group
               is pasted with an offset of 10 for the first paste, 20 for the second... and its
               reference point is moved on the grid, so a copy of off-grid elements is not off-grid
               by the same amount.
             * A pasted symbol whose reference (R1, C2...) already exists gets a new one (R3, C4...).
#---------------------------------------------------------------------------------------------------
*/
var pastePlace = (function () {
    'use strict';
    var api = {};
    var lastMouse = null;                 // last position of the pointer on the schematic (grid)
    var placing = null;                   // { nodes, ref } while the group follows the pointer
    var swallowUp = false;

    // ------------------------------------------------------------------ geometry
    function svgRoot() {
        var s = drawing.shapes && drawing.shapes.svgElem;
        if (s && s.getScreenCTM) return s;
        var sym = document.getElementById('sym');
        return sym ? sym.ownerSVGElement : null;
    }
    function gridPos(evt) {
        var svg = svgRoot();
        if (!svg) return null;
        var CTM = svg.getScreenCTM();
        var px = drawing.shapes.pr || drawing.shapes.px || 1;
        return {
            x: px * Math.round((evt.clientX - CTM.e) / (px * CTM.a)),
            y: px * Math.round((evt.clientY - CTM.f) / (px * CTM.d))
        };
    }
    function onSvg(t) { var svg = svgRoot(); return !!(svg && t && svg.contains && svg.contains(t)); }

    // top-left corner of the group (the smallest coordinates of its elements)
    function groupRef(shapes) {
        var xs = [], ys = [];
        shapes.lsg.oldPos.forEach(function (pos) {
            if (pos.points) pos.points.forEach(function (p) { xs.push(p.x); ys.push(p.y); });
            else if (pos.arcPoints) { xs.push(pos.arcPoints.cx); ys.push(pos.arcPoints.cy); }
            else { xs.push(pos.x); ys.push(pos.y); }
        });
        xs = xs.filter(isFinite); ys = ys.filter(isFinite);
        if (!xs.length) return null;
        return { x: Math.min.apply(null, xs), y: Math.min.apply(null, ys) };
    }


    // ------------------------------------------------------------------ grid
    function step() { return (drawing.shapes && (drawing.shapes.pr || drawing.shapes.px)) || 5; }
    function snap(v) { var g = step(); return g * Math.round(v / g); }
    // the pointer position moved by a whole number of grid steps from the group reference:
    // the group keeps the alignment it had (and normalize() puts it on the grid)
    function align(p, ref) {
        var g = step();
        return { x: ref.x + g * Math.round((p.x - ref.x) / g), y: ref.y + g * Math.round((p.y - ref.y) / g) };
    }
    // every point / position of the pasted elements becomes a multiple of the grid step
    function normalize(nodes) {
        nodes.forEach(function (n) {
            if (!n.getAttribute) return;
            var name = n.getAttribute('name');
            switch (name) {
            case 'net': case 'polyline': case 'polygon':
                var pts = getArrayPoints(n);
                pts.forEach(function (p) { p.x = snap(p.x); p.y = snap(p.y); });
                n.setAttribute('points', polylineToAttribute(pts, 0, 0));
                break;
            case 'part': case 'probe': case 'liveScope': case 'liveWidget': case 'analysis':
                var x = snap(parseFloat(n.getAttribute('x'))), y = snap(parseFloat(n.getAttribute('y')));
                n.setAttribute('x', x); n.setAttribute('y', y);
                n.setAttribute('transform', 'translate(' + x + ',' + y + ')');
                break;
            case 'rect': case 'image':
                n.setAttribute('x', snap(parseFloat(n.getAttribute('x'))));
                n.setAttribute('y', snap(parseFloat(n.getAttribute('y'))));
                break;
            case 'text': case 'param': case '.param': case 'label': case 'modelSpice':
                var tx = snap(parseFloat(n.getAttribute('x'))), ty = snap(parseFloat(n.getAttribute('y')));
                n.setAttribute('x', tx); n.setAttribute('y', ty);
                n.setAttribute('transform', 'rotate(' + (n.getAttribute('r') || 0) + ' ' + tx + '  ' + ty + ')');
                break;
            }
        });
    }

    // ------------------------------------------------------------------ references
    function partsOf(nodes) {
        var out = [];
        nodes.forEach(function (n) {
            if (n.getAttribute && n.getAttribute('name') === 'part') out.push(n);
        });
        return out;
    }
    function prefixOf(part) {
        var p = '';
        try { p = JSON.parse(part.firstChild.getAttribute('symbol')).reference || ''; } catch (e) {}
        if (!p) p = (part.getAttribute('sref') || '').replace(/\d+$/, '');
        return p;
    }
    // A pasted symbol with the reference of another symbol takes the next free one of its kind.
    api.renameRefs = function (nodes) {
        if (drawing.pageType === 'sym') return;
        var pasted = partsOf(nodes), used = {};
        [].forEach.call(document.getElementsByClassName('part'), function (p) {
            if (pasted.indexOf(p) < 0) used[p.getAttribute('sref')] = true;
        });
        pasted.forEach(function (part) {
            var ref = part.getAttribute('sref');
            if (ref && used[ref]) {
                var x = prefixOf(part);
                if (x) {
                    var n = 1;
                    while (used[x + n]) n++;
                    ref = x + n;
                    part.setAttribute('sref', ref);
                    [].forEach.call(part.children, function (c) {
                        if (c.getAttribute && c.getAttribute('name') === 'ref') c.textContent = ref;
                    });
                }
            }
            used[ref] = true;
        });
    };

    // ------------------------------------------------------------------ paste
    // nodes: the elements just added to the schematic by drawing.paste
    api.begin = function (self, nodes, offsetBase, count) {
        var shapes = self.shapes;
        shapes.lsg.elms = [];
        shapes.lsg.oldPos = [];
        nodes.forEach(function (n) { saveInArrayElemSelectByRect(shapes, n); });
        var ref = groupRef(shapes);
        if (!ref) { clearSelectElms(shapes); return; }
        shapes.lsg.xo = ref.x;
        shapes.lsg.yo = ref.y;
        shapes.lsg.move = true;

        if (lastMouse) {
            shapes.coord = align(lastMouse, ref);                          // the group follows the pointer
            moveElemGroup(shapes);
            placing = { nodes: nodes, ref: ref };
        } else {
            var step = offsetBase + 10 * (count - 1), px = shapes.pr || shapes.px || 1;
            shapes.coord = {                                              // offset, reference on the grid
                x: px * Math.round((ref.x + step) / px),
                y: px * Math.round((ref.y + step) / px)
            };
            moveElemGroup(shapes);
            normalize(nodes);
            shapes.lsg.move = false;
            clearSelectElms(shapes);
            shapes.lsg.elms = []; shapes.lsg.oldPos = [];
            nodes.forEach(function (n) { saveInArrayElemSelectByRect(shapes, n); });
            creatLimiteOfSelect(shapes);
            try { refNetWithPart(); } catch (e) {}
            self.saveData('Paste ');
        }
    };

    function finish() {
        var shapes = drawing.shapes;
        var nodes = placing ? placing.nodes : [];
        placing = null;
        normalize(nodes);
        shapes.lsg.elms = []; shapes.lsg.oldPos = [];
        nodes.forEach(function (n) { saveInArrayElemSelectByRect(shapes, n); });
        shapes.lsg.move = true;
        upElemGroup(shapes);                // the new positions become the reference of the group
        shapes.lsg.move = false;
        creatLimiteOfSelect(shapes);
        try { refNetWithPart(); } catch (e) {}
        drawing.saveData('Paste ');
    }

    function cancel() {
        var shapes = drawing.shapes;
        if (!placing) return;
        placing.nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
        placing = null;
        shapes.lsg.move = false;
        clearSelectElms(shapes);
    }

    api.active = function () { return !!placing; };
    api.cancel = cancel;

    // ------------------------------------------------------------------ events
    document.addEventListener('mousemove', function (e) {
        if (!onSvg(e.target)) return;
        var p = gridPos(e);
        if (!p) return;
        lastMouse = p;
        if (!placing) return;
        e.stopImmediatePropagation();
        var shapes = drawing.shapes;
        shapes.coord = align(p, placing.ref);
        shapes.lsg.move = true;
        moveElemGroup(shapes);
    }, true);

    document.addEventListener('mousedown', function (e) {
        if (!placing) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.button === 0) { finish(); swallowUp = true; }
        else cancel();
    }, true);

    document.addEventListener('mouseup', function (e) {
        if (swallowUp) { swallowUp = false; e.stopImmediatePropagation(); }
    }, true);

    document.addEventListener('contextmenu', function (e) {
        if (!placing) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        cancel();
    }, true);

    document.addEventListener('keydown', function (e) {
        if (!placing) return;
        if (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            e.stopImmediatePropagation();
            cancel();
        }
    }, true);

    return api;
})();
