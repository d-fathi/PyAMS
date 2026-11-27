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
            shapes.coord = { x: lastMouse.x, y: lastMouse.y };          // the group follows the pointer
            moveElemGroup(shapes);
            placing = { nodes: nodes, ref: ref };
        } else {
            var step = offsetBase + 10 * (count - 1), px = shapes.pr || shapes.px || 1;
            shapes.coord = {                                              // offset, reference on the grid
                x: px * Math.round((ref.x + step) / px),
                y: px * Math.round((ref.y + step) / px)
            };
            moveElemGroup(shapes);
            shapes.lsg.move = false;
            creatLimiteOfSelect(shapes);
            self.saveData('Paste ');
        }
    };

    function finish() {
        var shapes = drawing.shapes;
        placing = null;
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
        shapes.coord = p;
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
