/*
#--------------------------------------------------------------------------------------------------
Name:        elementDialog.js
Author:      d.fathi
Created:     19/09/2026
Updated:     19/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
//------------------Class for List Element Selection Dialog----------------------------------------//

function fElementDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.treeData = [];
    selfDialog.selectedSignal = null;
    selfDialog.preSelectedValue = null;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // Inject CSS
    this.injectCSS = function() {
        var css = `
/* ===== List Element Dialog ===== */
#listElemDialog {
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 420px;
    max-width: 90vw;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border, #ccc));
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    z-index: 3000;
    display: none;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-editor-foreground, #333);
    flex-direction: column;
    overflow: hidden;
    max-height: 85vh;
}

#listElemDialog.visible {
    display: flex;
}

/* Overlay backdrop - blocks all outside interaction */
#listElemDialogOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.45);
    z-index: 2999;
    display: none;
}

#listElemDialogOverlay.visible {
    display: block;
}

/* Header - Draggable */
#listElemDialogHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-titleBar-activeBackground, var(--vscode-editor-inactiveSelectionBackground, #fafafa));
    border-radius: 6px 6px 0 0;
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}

#listElemDialogHeader:hover {
    background: var(--vscode-list-hoverBackground, #f0f0f0);
}

#listElemDialogTitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
}

#listElemDialogClose {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, #666);
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
    font-family: inherit;
}

#listElemDialogClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
    color: var(--vscode-editor-foreground, #333);
}

/* Selected display bar */
#listElemDialogSelectedBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-bottom: 1px solid var(--vscode-panel-border, #eee);
    flex-shrink: 0;
}

#listElemDialogSelectedBar h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
    margin: 0;
}

#listElemDialogSelectedDisplay {
    font-size: 12px;
    color: var(--vscode-textLink-foreground, #2196F3);
    font-weight: 600;
    font-family: 'Consolas', monospace;
}

/* Tree container */
#listElemDialogTreeContainer {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px 0;
    scrollbar-width: thin;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
}

/* Section header (component name) */
.listelem-section-header {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid var(--vscode-panel-border, #e0e0e0);
    background: var(--vscode-sideBar-background, #fafafa);
}
.listelem-section-header:hover { 
    background: var(--vscode-list-hoverBackground, #f0f0f0); 
}
.listelem-section-header .arrow {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    font-size: 10px;
    color: var(--vscode-descriptionForeground, #666);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
}
.listelem-section-header .arrow.collapsed { transform: rotate(-90deg); }
.listelem-section-header .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #555);
}

/* Component node */
.listelem-component-node {
    border-bottom: 1px solid var(--vscode-panel-border, #e8e8e8);
}

/* Children container */
.listelem-children {
    overflow: hidden;
    transition: all 0.25s ease;
}
.listelem-children.collapsed {
    max-height: 0;
    opacity: 0;
}

/* Sub-group */
.listelem-sub-group {
    margin-left: 14px;
    border-left: 2px solid var(--vscode-panel-border, #e0e0e0);
}
.listelem-sub-group-header {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-descriptionForeground, #666);
    background: var(--vscode-sideBar-background, #f9f9f9);
    border-bottom: 1px solid var(--vscode-panel-border, #eee);
}
.listelem-sub-group-header:hover { 
    background: var(--vscode-list-hoverBackground, #f0f0f0); 
}
.listelem-sub-group-header .arrow {
    width: 14px;
    margin-right: 4px;
    font-size: 9px;
    color: var(--vscode-descriptionForeground, #888);
    transition: transform 0.2s;
}
.listelem-sub-group-header .arrow.collapsed { transform: rotate(-90deg); }

/* Signal row */
.listelem-row {
    display: flex;
    align-items: center;
    padding: 7px 12px 7px 32px;
    border-bottom: 1px solid var(--vscode-panel-border, #f0f0f0);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
}
.listelem-row:hover {
    background: var(--vscode-list-hoverBackground, #e3f2fd);
}
.listelem-row.selected {
    background: var(--vscode-textLink-foreground, #2196F3) !important;
    color: #fff !important;
}
.listelem-row.selected .listelem-label {
    color: #fff;
}
.listelem-row.selected .type-indicator {
    border-color: #fff;
}

/* Type indicator */
.type-indicator {
    width: 12px;
    height: 12px;
    border: 1px solid var(--vscode-panel-border, #bbb);
    border-radius: 2px;
    margin-right: 10px;
    flex-shrink: 0;
}
.type-voltage { background: #4CAF50; }
.type-current { background: #FF9800; }
.listelem-hint {
    font-size: 11px;
    margin-left: 8px;
    opacity: 0.65;
    font-family: 'Consolas', 'Courier New', monospace;
    white-space: nowrap;
}
.listelem-row.selected .listelem-hint { color: #fff; opacity: 0.85; }
.listelem-message {
    padding: 12px 14px;
    font-size: 12px;
    white-space: pre-wrap;
    font-family: 'Consolas', monospace;
}
.listelem-message.error { color: #e53935; }
.type-item { background: #2196F3; }

/* Signal label */
.listelem-label {
    font-size: 12px;
    color: var(--vscode-editor-foreground, #444);
    font-family: 'Consolas', 'Courier New', monospace;
    flex: 1;
}

/* Buttons bar */
#listElemDialogButtonsBar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}

.listelem-btn {
    padding: 6px 20px;
    border: 1px solid var(--vscode-button-secondaryBackground, #ccc);
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    background: var(--vscode-button-secondaryBackground, #f0f0f0);
    color: var(--vscode-button-secondaryForeground, #333);
    transition: all 0.15s;
    font-family: inherit;
}
.listelem-btn:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, #e0e0e0);
    border-color: var(--vscode-panel-border, #bbb);
}
.listelem-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.listelem-btn-primary {
    background: var(--vscode-button-background, #2196F3);
    border-color: var(--vscode-button-border, #1976D2);
    color: var(--vscode-button-foreground, #fff);
}
.listelem-btn-primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground, #1976D2);
    border-color: var(--vscode-button-border, #1565C0);
}
.listelem-btn-primary:disabled {
    background: #90caf9;
    border-color: #90caf9;
}

/* Scrollbar */
#listElemDialogTreeContainer::-webkit-scrollbar { width: 8px; }
#listElemDialogTreeContainer::-webkit-scrollbar-track { background: var(--vscode-scrollbarSlider-background, #f1f1f1); }
#listElemDialogTreeContainer::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-hoverBackground, #c1c1c1); border-radius: 4px; }
#listElemDialogTreeContainer::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-activeBackground, #a1a1a1); }
`;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    };

    // Inject HTML
    this.injectHTML = function() {
        var dialogHTML = `
<div id="listElemDialogOverlay"></div>
<div id="listElemDialog">
    <div id="listElemDialogHeader">
        <span id="listElemDialogTitle">Signal selection</span>
        <button id="listElemDialogClose" title="Close">×</button>
    </div>
    <div id="listElemDialogSelectedBar">
        <h2 id="listElemDialogSubtitle">Signal selection</h2>
        <span id="listElemDialogSelectedDisplay">No selection</span>
    </div>
    <div id="listElemDialogTreeContainer"></div>
    <div id="listElemDialogButtonsBar">
        <button class="listelem-btn" id="listElemDialogBtnClear">Clear</button>
        <button class="listelem-btn" id="listElemDialogBtnCancel">Cancel</button>
        <button class="listelem-btn listelem-btn-primary" id="listElemDialogBtnOk" disabled>OK</button>
    </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    };

    // Toggle dialog visibility
    this.toggle = function() {
        if (selfDialog.isVisible) {
            selfDialog.hide();
        } else {
            selfDialog.show();
        }
    };

    // Show dialog
    this.show = function() {
        var dialog = document.getElementById('listElemDialog');
        var overlay = document.getElementById('listElemDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
        }
    };

    // Hide dialog
    this.hide = function() {
        var dialog = document.getElementById('listElemDialog');
        var overlay = document.getElementById('listElemDialogOverlay');
        if (dialog) {
            dialog.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.unbindKeyEvents();
        }
    };

    // Bind key events (Escape prevention)
    this.bindKeyEvents = function() {
        document.addEventListener('keydown', selfDialog.keyHandler);
    };

    // Unbind key events
    this.unbindKeyEvents = function() {
        document.removeEventListener('keydown', selfDialog.keyHandler);
    };

    // Key handler - prevent Escape from closing
    this.keyHandler = function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    // Initialize with data
    // data: the legacy tree [{name, items:[...]}] or the object returned by
    //       drawing.getListParameter(code) ({models:[...]}): the dialog then lists the
    //       parameters of every element, e.g. "R1.R", "D1.Iss".
    this.initData = function(data, preSelected) {
        var pyams = !!(data && !Array.isArray(data) && (data.models || data.error));
        if (pyams) data = selfDialog.convertPyamsData(data);
        var t1 = document.getElementById('listElemDialogTitle');
        var t2 = document.getElementById('listElemDialogSubtitle');
        var title = pyams ? 'Parameter selection' : 'Signal selection';
        if (t1) t1.textContent = title;
        if (t2) t2.textContent = title;
        selfDialog.treeData = data || [];
        selfDialog.preSelectedValue = preSelected || null;
        selfDialog.selectedSignal = selfDialog.preSelectedValue;

        selfDialog.renderTree();
        selfDialog.updateOkButton();

        var display = document.getElementById('listElemDialogSelectedDisplay');
        if (display) display.textContent = selfDialog.selectedSignal || 'No selection';

        // bring the pre-selected parameter into view
        var sel = document.querySelector('#listElemDialog .listelem-row.selected');
        if (sel && sel.scrollIntoView) setTimeout(function() { sel.scrollIntoView({ block: 'nearest' }); }, 0);
    };

    // Convert the getListParameter() result into the tree shown by the dialog:
    //   <name> (<class>)  ->  one row per parameter: "<name>.<param>"
    this.convertPyamsData = function(data) {
        var tree = [];
        if (data.error) {
            var line = data.line ? '  (line ' + data.line + ')' : '';
            tree.push({ name: 'Error', message: data.error + line, isError: true });
        }
        (data.models || []).forEach(function(m) {
            var items = (m.params || []).map(function(p) {
                var unit = String(p.unit || '').trim();
                var hint = p.value + (unit ? ' ' + unit : '') + (p.description ? '  ' + p.description : '');
                return {
                    value: m.name + '.' + p.name,
                    hint: hint,
                    info: {
                        element: m.name, 'class': m['class'], param: p.name,
                        value: p.value, 'default': p['default'], unit: unit,
                        description: p.description || ''
                    }
                };
            });
            if (items.length) tree.push({ name: m.name + ' (' + m['class'] + ')', items: items });
        });
        if (tree.length === 0) tree.push({ name: 'No parameters', message: 'No element with parameters found in the code.' });
        return tree;
    };

    // Render tree
    this.renderTree = function() {
        var container = document.getElementById('listElemDialogTreeContainer');
        if (!container) return;
        container.innerHTML = '';

        selfDialog.treeData.forEach(function(item, index) {
            var node = selfDialog.createComponentNode(item, index);
            container.appendChild(node);
        });
    };

    // Create component node
    this.createComponentNode = function(item, index) {
        var div = document.createElement('div');
        div.className = 'listelem-component-node';

        var header = document.createElement('div');
        header.className = 'listelem-section-header';
        header.onclick = function() {
            selfDialog.toggleSection(header, childrenDiv);
        };

        var arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.innerHTML = '▼';

        var title = document.createElement('span');
        title.className = 'section-title';
        title.textContent = item.name || ('Component ' + index);

        header.appendChild(arrow);
        header.appendChild(title);
        div.appendChild(header);

        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'listelem-children';

        if (item.message) {
            var msg = document.createElement('div');
            msg.className = 'listelem-message' + (item.isError ? ' error' : '');
            msg.textContent = item.message;
            childrenDiv.appendChild(msg);
        }
        // Case 1: groups (e.g., source -> voltage, current)
        if (item.groups && item.groups.length > 0) {
            item.groups.forEach(function(group) {
                childrenDiv.appendChild(selfDialog.createSubGroup(item.name, group.type, group.items, group.label));
            });
        }
        // Case 2: direct items (e.g., Resistor, param)
        else if (item.items && item.items.length > 0) {
            item.items.forEach(function(value) {
                childrenDiv.appendChild(selfDialog.createSignalRow(value, 'item'));
            });
        }
        // Case 3: legacy voltages/currents
        else {
            if (item.voltages && item.voltages.length > 0) {
                childrenDiv.appendChild(selfDialog.createSubGroup(item.name, 'voltages', item.voltages, 'Voltages'));
            }
            if (item.currents && item.currents.length > 0) {
                childrenDiv.appendChild(selfDialog.createSubGroup(item.name, 'currents', item.currents, 'Currents'));
            }
        }

        div.appendChild(childrenDiv);
        return div;
    };

    // Create sub-group
    this.createSubGroup = function(componentName, groupType, items, labelPrefix) {
        var subDiv = document.createElement('div');
        subDiv.className = 'listelem-sub-group';

        var subHeader = document.createElement('div');
        subHeader.className = 'listelem-sub-group-header';
        subHeader.onclick = function(e) {
            e.stopPropagation();
            selfDialog.toggleSection(subHeader, subChildren);
        };

        var arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.innerHTML = '▼';

        var subTitle = document.createElement('span');
        subTitle.textContent = labelPrefix;

        subHeader.appendChild(arrow);
        subHeader.appendChild(subTitle);
        subDiv.appendChild(subHeader);

        var subChildren = document.createElement('div');
        subChildren.className = 'listelem-children';

        items.forEach(function(value) {
            subChildren.appendChild(selfDialog.createSignalRow(value, groupType));
        });

        subDiv.appendChild(subChildren);
        return subDiv;
    };

    // Create signal row
    this.createSignalRow = function(entry, groupType) {
        var isObj = entry !== null && typeof entry === 'object';
        var value = isObj ? entry.value : entry;
        var row = document.createElement('div');
        row.className = 'listelem-row';
        row.dataset.value = value;
        row._info = isObj ? (entry.info || null) : null;
        row.onclick = function(e) {
            e.stopPropagation();
            selfDialog.selectRow(row, value);
        };

        // Pre-select if matches
        if (selfDialog.preSelectedValue && value === selfDialog.preSelectedValue) {
            row.classList.add('selected');
            selfDialog.selectedSignal = value;
            var display = document.getElementById('listElemDialogSelectedDisplay');
            if (display) display.textContent = value;
        }

        var indicator = document.createElement('div');
        var typeClass = 'type-item';
        if (groupType === 'voltage' || groupType === 'voltages') typeClass = 'type-voltage';
        else if (groupType === 'current' || groupType === 'currents') typeClass = 'type-current';
        
        indicator.className = 'type-indicator ' + typeClass;

        var label = document.createElement('span');
        label.className = 'listelem-label';
        label.textContent = value;

        row.appendChild(indicator);
        row.appendChild(label);
        if (isObj && entry.hint) {
            var hint = document.createElement('span');
            hint.className = 'listelem-hint';
            hint.textContent = entry.hint;
            row.appendChild(hint);
        }
        return row;
    };

    // Toggle section
    this.toggleSection = function(header, content) {
        var arrow = header.querySelector('.arrow');
        content.classList.toggle('collapsed');
        arrow.classList.toggle('collapsed');
        arrow.innerHTML = content.classList.contains('collapsed') ? '▶' : '▼';
    };

    // Select row
    this.selectRow = function(rowElement, value) {
        var allSelected = document.querySelectorAll('#listElemDialog .listelem-row.selected');
        allSelected.forEach(function(r) {
            r.classList.remove('selected');
        });

        rowElement.classList.add('selected');
        selfDialog.selectedSignal = value;

        var display = document.getElementById('listElemDialogSelectedDisplay');
        if (display) display.textContent = value;

        selfDialog.updateOkButton();
    };

    // Clear selection
    this.clearSelection = function() {
        var allSelected = document.querySelectorAll('#listElemDialog .listelem-row.selected');
        allSelected.forEach(function(r) {
            r.classList.remove('selected');
        });
        selfDialog.selectedSignal = null;
        var display = document.getElementById('listElemDialogSelectedDisplay');
        if (display) display.textContent = 'No selection';
        selfDialog.updateOkButton();
    };

    // Update OK button
    this.updateOkButton = function() {
        var btnOk = document.getElementById('listElemDialogBtnOk');
        if (btnOk) {
            btnOk.disabled = !selfDialog.selectedSignal;
        }
    };

    // Submit selection
    this.submitSelection = function() {
        var result = selfDialog.selectedSignal;
        // PyAMS mode: details of the chosen parameter {element, class, param, value, default, unit, description}
        var selRow = document.querySelector('#listElemDialog .listelem-row.selected');
        var info = selRow && selRow._info ? selRow._info : null;
        selfDialog.hide();
        if (typeof selfDialog.onSubmit === 'function') {
            selfDialog.onSubmit(result, info);
        }
        return result;
    };

    // Cancel dialog
    this.cancelDialog = function() {
        selfDialog.hide();
        if (typeof selfDialog.onCancel === 'function') {
            selfDialog.onCancel();
        }
        return null;
    };

    // Initialize events
    this.init = function() {
        var dialog = document.getElementById('listElemDialog');
        var header = document.getElementById('listElemDialogHeader');
        var closeBtn = document.getElementById('listElemDialogClose');
        var overlay = document.getElementById('listElemDialogOverlay');
        var btnClear = document.getElementById('listElemDialogBtnClear');
        var btnCancel = document.getElementById('listElemDialogBtnCancel');
        var btnOk = document.getElementById('listElemDialogBtnOk');

        if (!dialog || !header) return;

        // Close button (internal only)
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selfDialog.cancelDialog();
            });
        }

        // Overlay click does NOTHING - prevents closing from outside
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Intentionally empty - dialog stays open
            });
        }

        // Clear button
        if (btnClear) {
            btnClear.addEventListener('click', function() {
                selfDialog.clearSelection();
            });
        }

        // Cancel button
        if (btnCancel) {
            btnCancel.addEventListener('click', function() {
                selfDialog.cancelDialog();
            });
        }

        // OK button
        if (btnOk) {
            btnOk.addEventListener('click', function() {
                selfDialog.submitSelection();
            });
        }

        // Drag functionality from header
        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn || closeBtn.contains(e.target)) return;

            isDragging = true;
            var rect = dialog.getBoundingClientRect();
            dialogStartX = rect.left;
            dialogStartY = rect.top;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            dialog.style.transform = 'none';
            dialog.style.right = 'auto';
            dialog.style.left = dialogStartX + 'px';
            dialog.style.top = dialogStartY + 'px';

            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;

            var deltaX = e.clientX - dragStartX;
            var deltaY = e.clientY - dragStartY;

            var newX = dialogStartX + deltaX;
            var newY = dialogStartY + deltaY;

            var dialogWidth = dialog.offsetWidth;
            var dialogHeight = dialog.offsetHeight;
            var viewportWidth = window.innerWidth;
            var viewportHeight = window.innerHeight;

            if (newX < 0) newX = 0;
            if (newX + dialogWidth > viewportWidth) newX = viewportWidth - dialogWidth;
            if (newY < 0) newY = 0;
            if (newY + dialogHeight > viewportHeight) newY = viewportHeight - dialogHeight;

            dialog.style.left = newX + 'px';
            dialog.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    };

    // Constructor
    this.injectCSS();
    this.injectHTML();
    this.init();
}

// Global instance
var elementDialog;