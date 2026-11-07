'use strict';

var shell = window.pyamsShell;
var tabsEl = document.getElementById('tabs');
var dragId = null;
var currentTabs = [];

function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
}

function renderTabs(tabs) {
    currentTabs = tabs;
    tabsEl.textContent = '';
    tabs.forEach(function (t, index) {
        var tab = el('div', 'tab' + (t.active ? ' active' : '') + (t.dirty ? ' has-dirty' : ''));
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', t.active ? 'true' : 'false');
        tab.tabIndex = 0;
        tab.draggable = true;
        tab.title = t.path || t.title;
        tab.appendChild(el('span', 'title', t.title));
        if (t.dirty) tab.appendChild(el('span', 'dirty'));
        var close = el('button', 'close', '×');
        close.type = 'button';
        close.title = 'Close';
        close.setAttribute('aria-label', 'Close ' + t.title);
        close.addEventListener('click', function (e) { e.stopPropagation(); shell.close(t.id); });
        tab.appendChild(close);

        tab.addEventListener('click', function () { shell.activate(t.id); });
        tab.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shell.activate(t.id); }
        });
        // middle click closes the tab
        tab.addEventListener('auxclick', function (e) { if (e.button === 1) { e.preventDefault(); shell.close(t.id); } });

        // drag to reorder
        tab.addEventListener('dragstart', function (e) {
            dragId = t.id;
            tab.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(t.id));
        });
        tab.addEventListener('dragend', function () {
            dragId = null;
            Array.prototype.forEach.call(tabsEl.children, function (c) { c.classList.remove('dragging', 'drop-before', 'drop-after'); });
        });
        tab.addEventListener('dragover', function (e) {
            if (dragId === null || dragId === t.id) return;
            e.preventDefault();
            var r = tab.getBoundingClientRect();
            var after = e.clientX > r.left + r.width / 2;
            tab.classList.toggle('drop-after', after);
            tab.classList.toggle('drop-before', !after);
        });
        tab.addEventListener('dragleave', function () { tab.classList.remove('drop-before', 'drop-after'); });
        tab.addEventListener('drop', function (e) {
            if (dragId === null || dragId === t.id) return;
            e.preventDefault();
            var r = tab.getBoundingClientRect();
            var after = e.clientX > r.left + r.width / 2;
            var from = currentTabs.findIndex(function (x) { return x.id === dragId; });
            var to = index + (after ? 1 : 0);
            if (from < to) to--;          // the dragged tab leaves its old place first
            if (from >= 0 && to !== from) shell.move(dragId, to);
            dragId = null;
        });

        tabsEl.appendChild(tab);
    });
}

var toastTimer = null;
function setText(id, text) { var e = document.getElementById(id); if (e) e.textContent = text || ''; }

function applyStatus(s) {
    if (!s) return;
    if ('file' in s) {
        var f = document.getElementById('sbFile');
        f.textContent = s.file ? '‎' + s.file : '';
        f.title = s.file || '';
    }
    if ('pos' in s) setText('sbPos', s.pos ? 'X: ' + s.pos.x + '  Y: ' + s.pos.y : '');
    if ('zoom' in s) setText('sbZoom', typeof s.zoom === 'number' ? Math.round(s.zoom * 100) + '%' : '');
    if ('python' in s) {
        var py = document.getElementById('sbPython');
        py.textContent = s.python;
        py.classList.toggle('warn', /not found/i.test(s.python));
    }
    if ('toast' in s) {
        var t = document.getElementById('sbToast');
        t.textContent = s.toast || '';
        t.className = 'sb-toast ' + (s.toastKind || '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.textContent = ''; t.className = 'sb-toast'; }, 6000);
    }
}

document.getElementById('newTab').addEventListener('click', function () { shell.newMenu(); });
document.getElementById('sbPython').addEventListener('click', function () { shell.pythonMenu(); });
// middle-click on the empty part of the bar: nothing; double-click: new circuit menu
document.getElementById('tabbar').addEventListener('dblclick', function (e) {
    if (e.target.id === 'tabbar') shell.newMenu();
});

shell.onTabs(renderTabs);
shell.onStatus(applyStatus);
shell.ready();
