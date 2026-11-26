/*
#--------------------------------------------------------------------------------------------------
Name:        contextMenu.js
Description: Popup menu of the schematic (right mouse button): Cut / Copy / Paste (enabled or disabled
             according to the selection and the clipboard) and Rotate, Flip Vertical and Flip Horizontal (only when a
             single symbol is selected). The menu is shown on the schematic only; dialogs and panels keep no menu.
#---------------------------------------------------------------------------------------------------
*/
(function () {
    var menu = null;
    var clipText = '';

    function injectCss() {
        if (document.getElementById('pyamsCtxCss')) return;
        var st = document.createElement('style');
        st.id = 'pyamsCtxCss';
        st.textContent =
            '#pyamsCtx{position:fixed;z-index:100000;min-width:190px;padding:4px 0;border-radius:6px;' +
            'background:var(--vscode-menu-background,var(--vscode-editorWidget-background,#252526));' +
            'color:var(--vscode-menu-foreground,var(--vscode-foreground,#ccc));' +
            'border:1px solid var(--vscode-menu-border,var(--vscode-widget-border,#454545));' +
            'box-shadow:0 2px 8px var(--vscode-widget-shadow,rgba(0,0,0,.36));' +
            'font:13px var(--vscode-font-family,sans-serif);user-select:none;-webkit-user-select:none}' +
            '#pyamsCtx .ci{display:flex;justify-content:space-between;gap:24px;padding:4px 18px;cursor:default}' +
            '#pyamsCtx .ci:not(.off):hover{background:var(--vscode-menu-selectionBackground,#04395e);' +
            'color:var(--vscode-menu-selectionForeground,#fff)}' +
            '#pyamsCtx .ci.off{opacity:.45}' +
            '#pyamsCtx .ci .k{opacity:.7}' +
            '#pyamsCtx .sep{height:1px;margin:4px 0;background:var(--vscode-menu-separatorBackground,#454545)}';
        document.head.appendChild(st);
    }

    function hasSelection() {
        try {
            return drawing.shapes.lsg.elms.length > 0 || !!drawing.resize.setElement;
        } catch (e) { return false; }
    }
    function singlePart() {
        try {
            return !!drawing.selectPart && drawing.shapes.lsg.elms.length <= 1 && !!drawing.resize.setElement;
        } catch (e) { return false; }
    }
    function canPaste() {
        try {
            var d = JSON.parse(clipText);
            return !!(d && d.copyList && d.copyList.length && d.pageType === drawing.pageType);
        } catch (e) { return false; }
    }

    function close() {
        if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
        menu = null;
    }

    function refreshPaste() {
        if (!menu) return;
        var p = menu.querySelector('[data-cmd="paste"]');
        if (p) p.classList.toggle('off', !canPaste());
    }

    function item(cmd, text, key, enabled) {
        return '<div class="ci' + (enabled ? '' : ' off') + '" data-cmd="' + cmd + '"><span>' + text +
               '</span><span class="k">' + key + '</span></div>';
    }

    function run(cmd) {
        close();
        try {
            if (cmd === 'cut') drawing.cut();
            else if (cmd === 'copy') drawing.copy();
            else if (cmd === 'paste') drawing.paste(clipText);
            else if (cmd === 'rotate') rotatePart();
            else if (cmd === 'flipv') flipVerticallyPart();
            else if (cmd === 'fliph') flipHorizontalPart();
        } catch (err) { console.log('context menu: ' + err.message); }
    }

    function open(x, y) {
        close();
        injectCss();
        var sel = hasSelection();
        var html = item('cut', 'Cut', 'Ctrl+X', sel) + item('copy', 'Copy', 'Ctrl+C', sel) +
                   item('paste', 'Paste', 'Ctrl+V', canPaste());
        if (singlePart()) html += '<div class="sep"></div>' + item('rotate', 'Rotate', 'Shift+R', true) +
                item('flipv', 'Flip Vertical', 'Shift+V', true) + item('fliph', 'Flip Horizontal', 'Shift+H', true);
        menu = document.createElement('div');
        menu.id = 'pyamsCtx';
        menu.innerHTML = html;
        document.body.appendChild(menu);
        var w = menu.offsetWidth, h = menu.offsetHeight;
        menu.style.left = Math.max(0, Math.min(x, window.innerWidth - w - 4)) + 'px';
        menu.style.top = Math.max(0, Math.min(y, window.innerHeight - h - 4)) + 'px';
        menu.addEventListener('click', function (e) {
            var it = e.target.closest ? e.target.closest('.ci') : null;
            if (!it || it.classList.contains('off')) return;
            run(it.getAttribute('data-cmd'));
        });
        menu.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        // the clipboard is read by the extension: Paste is enabled when it holds a copied circuit
        if (typeof vscode !== 'undefined') vscode.postMessage({ type: 'queryClipboard' });
    }

    function inSchematic(t) {
        var sym = document.getElementById('sym');
        var svg = sym && sym.ownerSVGElement;
        return !!(svg && t && svg.contains(t));
    }

    document.addEventListener('contextmenu', function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('#pyamsCtx')) { e.preventDefault(); return; }
        if (t.closest('input, textarea, select, [contenteditable="true"]')) return;   // text box: native menu
        e.preventDefault();                                   // no VS Code menu on dialogs, panels, schematic
        if (t.closest('[id$="Dialog"], [id$="DialogOverlay"]')) { close(); return; }
        if (!inSchematic(t)) { close(); return; }
        try { if (drawing.shapes.design.mouse) { close(); return; } } catch (err) {}   // a drawing tool is active
        open(e.clientX, e.clientY);
    }, true);

    // close: click elsewhere, key, wheel, focus lost, resize
    document.addEventListener('mousedown', function (e) {
        if (menu && !(e.target.closest && e.target.closest('#pyamsCtx'))) close();
    }, true);
    document.addEventListener('keydown', function () { close(); }, true);
    document.addEventListener('wheel', function () { close(); }, { capture: true, passive: true });
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);

    window.addEventListener('message', function (event) {
        var m = event.data;
        if (m && m.type === 'clipboardText') { clipText = m.data || ''; refreshPaste(); }
    });
})();
