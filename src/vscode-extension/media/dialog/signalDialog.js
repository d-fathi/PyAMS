/*
#--------------------------------------------------------------------------------------------------
Name:        signalDialog.js
Author:      d.fathi
Created:     31/08/2026
Updated:     31/08/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
//------------------Class for Signal Selection Dialog----------------------------------------------//

function fSignalDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.treeData = [];
    selfDialog.selectedSignal = null;
    selfDialog.preSelectedValue = null;
    selfDialog.acUsed = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // Inject CSS
    this.injectCSS = function() {
        var css = `
/* ===== Signal Dialog ===== */
#signalDialog {
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

#signalDialog.visible {
    display: flex;
}

/* Overlay backdrop - blocks all outside interaction */
#signalDialogOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.45);
    z-index: 2999;
    display: none;
}

#signalDialogOverlay.visible {
    display: block;
}

/* Header - Draggable */
#signalDialogHeader {
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

#signalDialogHeader:hover {
    background: var(--vscode-list-hoverBackground, #f0f0f0);
}

#signalDialogTitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
}

#signalDialogClose {
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

#signalDialogClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
    color: var(--vscode-editor-foreground, #333);
}

/* Selected display bar */
#signalDialogSelectedBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-bottom: 1px solid var(--vscode-panel-border, #eee);
    flex-shrink: 0;
}

#signalDialogSelectedBar h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
    margin: 0;
}

#signalDialogSelectedDisplay {
    font-size: 12px;
    color: var(--vscode-textLink-foreground, #2196F3);
    font-weight: 600;
    font-family: 'Consolas', monospace;
}

/* Tree container */
#signalDialogTreeContainer {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px 0;
    scrollbar-width: thin;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
}

/* Section header (component name) */
.signal-section-header {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid var(--vscode-panel-border, #e0e0e0);
    background: var(--vscode-sideBar-background, #fafafa);
}
.signal-section-header:hover { 
    background: var(--vscode-list-hoverBackground, #f0f0f0); 
}
.signal-section-header .arrow {
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
.signal-section-header .arrow.collapsed { transform: rotate(-90deg); }
.signal-section-header .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #555);
}

/* Component node */
.signal-component-node {
    border-bottom: 1px solid var(--vscode-panel-border, #e8e8e8);
}

/* Children container */
.signal-children {
    overflow: hidden;
    transition: all 0.25s ease;
}
.signal-children.collapsed {
    max-height: 0;
    opacity: 0;
}

/* Sub-group (Voltages, Currents) */
.signal-sub-group {
    margin-left: 14px;
    border-left: 2px solid var(--vscode-panel-border, #e0e0e0);
}
.signal-sub-group-header {
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
.signal-sub-group-header:hover { 
    background: var(--vscode-list-hoverBackground, #f0f0f0); 
}
.signal-sub-group-header .arrow {
    width: 14px;
    margin-right: 4px;
    font-size: 9px;
    color: var(--vscode-descriptionForeground, #888);
    transition: transform 0.2s;
}
.signal-sub-group-header .arrow.collapsed { transform: rotate(-90deg); }

/* Signal row */
.signal-row {
    display: flex;
    align-items: center;
    padding: 7px 12px 7px 32px;
    border-bottom: 1px solid var(--vscode-panel-border, #f0f0f0);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
}
.signal-row:hover {
    background: var(--vscode-list-hoverBackground, #e3f2fd);
}
.signal-row.selected {
    background: var(--vscode-textLink-foreground, #2196F3) !important;
    color: #fff !important;
}
.signal-row.selected .signal-label {
    color: #fff;
}
.signal-row.selected .type-indicator {
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

/* Signal label */
.signal-label {
    font-size: 12px;
    color: var(--vscode-editor-foreground, #444);
    font-family: 'Consolas', 'Courier New', monospace;
    flex: 1;
}

/* Function selection bar */
#signalDialogFunctionBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-top: 1px solid var(--vscode-panel-border, #eee);
    border-bottom: 1px solid var(--vscode-panel-border, #eee);
    flex-shrink: 0;
}

#signalDialogFunctionBar h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
    margin: 0;
}

#signalDialogFunctionSelect {
    width: 55%;
    padding: 5px 8px;
    font-size: 12px;
    border-radius: 3px;
    border: 1px solid var(--vscode-panel-border, #ccc);
    background: var(--vscode-dropdown-background, #fff);
    color: var(--vscode-dropdown-foreground, #333);
    font-family: inherit;
}

/* Buttons bar */
#signalDialogButtonsBar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}

.signal-btn {
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
.signal-btn:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, #e0e0e0);
    border-color: var(--vscode-panel-border, #bbb);
}
.signal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.signal-btn-primary {
    background: var(--vscode-button-background, #2196F3);
    border-color: var(--vscode-button-border, #1976D2);
    color: var(--vscode-button-foreground, #fff);
}
.signal-btn-primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground, #1976D2);
    border-color: var(--vscode-button-border, #1565C0);
}
.signal-btn-primary:disabled {
    background: #90caf9;
    border-color: #90caf9;
}

/* PyAMS signal list: hint text and messages */
.signal-hint {
    font-size: 11px;
    margin-left: 8px;
    opacity: 0.65;
    font-family: 'Consolas', 'Courier New', monospace;
    white-space: nowrap;
}
.signal-row.selected .signal-hint { color: #fff; opacity: 0.85; }
.signal-message {
    padding: 12px 14px;
    font-size: 12px;
    white-space: pre-wrap;
    font-family: 'Consolas', monospace;
}
.signal-message.error { color: #e53935; }

/* Scrollbar */
#signalDialogTreeContainer::-webkit-scrollbar { width: 8px; }
#signalDialogTreeContainer::-webkit-scrollbar-track { background: var(--vscode-scrollbarSlider-background, #f1f1f1); }
#signalDialogTreeContainer::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-hoverBackground, #c1c1c1); border-radius: 4px; }
#signalDialogTreeContainer::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-activeBackground, #a1a1a1); }
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
<div id="signalDialogOverlay"></div>
<div id="signalDialog">
    <div id="signalDialogHeader">
        <span id="signalDialogTitle">Signal selection</span>
        <button id="signalDialogClose" title="Close">×</button>
    </div>
    <div id="signalDialogSelectedBar">
        <h2>Signal selection</h2>
        <span id="signalDialogSelectedDisplay">No selection</span>
    </div>
    <div id="signalDialogTreeContainer"></div>
    <div id="signalDialogFunctionBar">
        <h2>Function selection</h2>
        <select id="signalDialogFunctionSelect">
            <option value="mag" selected>Linear magnitude</option>
            <option value="db">Decibels</option>
            <option value="ph">Phase</option>
            <option value="re">Real</option>
            <option value="im">Imaginary</option>
        </select>
    </div>
    <div id="signalDialogButtonsBar">
        <button class="signal-btn" id="signalDialogBtnClear">Clear</button>
        <button class="signal-btn" id="signalDialogBtnCancel">Cancel</button>
        <button class="signal-btn signal-btn-primary" id="signalDialogBtnOk" disabled>OK</button>
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
        var dialog = document.getElementById('signalDialog');
        var overlay = document.getElementById('signalDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
        }
    };

    // Hide dialog
    this.hide = function() {
        var dialog = document.getElementById('signalDialog');
        var overlay = document.getElementById('signalDialogOverlay');
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
    // data: either the legacy tree [{name, voltages:[], currents:[]}] or the object returned by
    //       drawing.getListParameter(code) ({models:[...]}): the dialog then lists the circuit
    //       nodes and the inputs / outputs (signals) of every element, e.g. "Vcc", "R1.V", "R1.I".
    this.initData = function(data, preSelected, acUsed) {
        if (data && !Array.isArray(data) && (data.models || data.error)) {
            data = selfDialog.convertPyamsData(data);
        }
        selfDialog.treeData = data || [];
        selfDialog.preSelectedValue = preSelected || null;
        selfDialog.acUsed = acUsed || false;
        selfDialog.selectedSignal = selfDialog.preSelectedValue;

        var funcBar = document.getElementById('signalDialogFunctionBar');
        if (funcBar) {
            funcBar.style.display = selfDialog.acUsed ? 'flex' : 'none';
        }

        selfDialog.renderTree();
        selfDialog.updateOkButton();

        var display = document.getElementById('signalDialogSelectedDisplay');
        if (display) display.textContent = selfDialog.selectedSignal || 'No selection';

        // bring the pre-selected signal into view
        var sel = document.querySelector('#signalDialog .signal-row.selected');
        if (sel && sel.scrollIntoView) setTimeout(function() { sel.scrollIntoView({ block: 'nearest' }); }, 0);
    };

    var GROUND_NODES = ['0', 'gnd', 'ground'];

    // Convert the getListParameter() result into the tree shown by the dialog:
    //   Nodes                       -> every node name used by the elements (ground excluded)
    //   <name> (<class>) / Inputs   -> signals with direction 'in'  : "<name>.<signal>"
    //                    / Outputs  -> signals with direction 'out' : "<name>.<signal>"
    this.convertPyamsData = function(data) {
        var tree = [];
        if (data.error) {
            var line = data.line ? '  (line ' + data.line + ')' : '';
            tree.push({ name: 'Error', message: data.error + line, isError: true });
        }
        var models = data.models || [];
        var nodes = [];
        var nodeUse = {};
        models.forEach(function(m) {
            (m.signals || []).forEach(function(sg) {
                [sg.p, sg.n].forEach(function(n) {
                    if (n === null || n === undefined) return;
                    n = String(n);
                    if (GROUND_NODES.indexOf(n.toLowerCase()) >= 0) return;
                    if (nodes.indexOf(n) < 0) { nodes.push(n); nodeUse[n] = []; }
                    if (nodeUse[n].indexOf(m.name) < 0) nodeUse[n].push(m.name);
                });
            });
        });
        if (nodes.length > 0) {
            tree.push({ name: 'Nodes', groups: [{
                label: 'Nodes',
                items: nodes.map(function(n) {
                    return { value: n, kind: 'voltage', hint: nodeUse[n].join(', ') };
                })
            }] });
        }
        models.forEach(function(m) {
            var inputs = [], outputs = [];
            (m.signals || []).forEach(function(sg) {
                var item = {
                    value: m.name + '.' + sg.name,
                    kind: sg.kind === 'current' ? 'current' : 'voltage',
                    hint: sg.kind + (sg.unit ? ' (' + sg.unit + ')' : '') + '  ' + sg.p + ' → ' + sg.n
                };
                (sg.direction === 'in' ? inputs : outputs).push(item);
            });
            var groups = [];
            if (inputs.length) groups.push({ label: 'Inputs', items: inputs });
            if (outputs.length) groups.push({ label: 'Outputs', items: outputs });
            if (groups.length) tree.push({ name: m.name + ' (' + m['class'] + ')', groups: groups });
        });
        if (tree.length === 0) tree.push({ name: 'No signals', message: 'No element found in the code.' });
        return tree;
    };

    // Render tree
    this.renderTree = function() {
        var container = document.getElementById('signalDialogTreeContainer');
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
        div.className = 'signal-component-node';

        var header = document.createElement('div');
        header.className = 'signal-section-header';
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
        childrenDiv.className = 'signal-children';

        if (item.message) {
            var msg = document.createElement('div');
            msg.className = 'signal-message' + (item.isError ? ' error' : '');
            msg.textContent = item.message;
            childrenDiv.appendChild(msg);
        }
        if (item.groups && item.groups.length > 0) {
            item.groups.forEach(function(g) {
                childrenDiv.appendChild(selfDialog.createSubGroup(item.name, g.kind || 'voltages', g.items, g.label));
            });
        }
        if (item.voltages && item.voltages.length > 0) {
            childrenDiv.appendChild(selfDialog.createSubGroup(item.name, 'voltages', item.voltages, 'Voltages'));
        }
        if (item.currents && item.currents.length > 0) {
            childrenDiv.appendChild(selfDialog.createSubGroup(item.name, 'currents', item.currents, 'Currents'));
        }

        div.appendChild(childrenDiv);
        return div;
    };

    // Create sub-group
    this.createSubGroup = function(componentName, groupType, items, labelPrefix) {
        var subDiv = document.createElement('div');
        subDiv.className = 'signal-sub-group';

        var subHeader = document.createElement('div');
        subHeader.className = 'signal-sub-group-header';
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
        subChildren.className = 'signal-children';

        items.forEach(function(entry) {
            var isObj = entry !== null && typeof entry === 'object';
            var value = isObj ? entry.value : entry;
            var kind = isObj && entry.kind ? entry.kind : (groupType === 'voltages' ? 'voltage' : 'current');
            var row = document.createElement('div');
            row.className = 'signal-row';
            row.dataset.value = value;
            row.dataset.kind = kind;
            row.onclick = function(e) {
                e.stopPropagation();
                selfDialog.selectRow(row, value);
            };

            if (selfDialog.preSelectedValue && value === selfDialog.preSelectedValue) {
                row.classList.add('selected');
                selfDialog.selectedSignal = value;
            }

            var indicator = document.createElement('div');
            indicator.className = 'type-indicator type-' + kind;

            var label = document.createElement('span');
            label.className = 'signal-label';
            label.textContent = value;

            row.appendChild(indicator);
            row.appendChild(label);
            if (isObj && entry.hint) {
                var hint = document.createElement('span');
                hint.className = 'signal-hint';
                hint.textContent = entry.hint;
                row.appendChild(hint);
            }
            subChildren.appendChild(row);
        });

        subDiv.appendChild(subChildren);
        return subDiv;
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
        var allSelected = document.querySelectorAll('#signalDialog .signal-row.selected');
        allSelected.forEach(function(r) {
            r.classList.remove('selected');
        });

        rowElement.classList.add('selected');
        selfDialog.selectedSignal = value;

        var display = document.getElementById('signalDialogSelectedDisplay');
        if (display) display.textContent = value;

        selfDialog.updateOkButton();
    };

    // Clear selection
    this.clearSelection = function() {
        var allSelected = document.querySelectorAll('#signalDialog .signal-row.selected');
        allSelected.forEach(function(r) {
            r.classList.remove('selected');
        });
        selfDialog.selectedSignal = null;
        var display = document.getElementById('signalDialogSelectedDisplay');
        if (display) display.textContent = 'No selection';
        selfDialog.updateOkButton();
    };

    // Update OK button
    this.updateOkButton = function() {
        var btnOk = document.getElementById('signalDialogBtnOk');
        if (btnOk) {
            btnOk.disabled = !selfDialog.selectedSignal;
        }
    };

    // Submit selection
    this.submitSelection = function() {
        var selectedFunction = document.getElementById('signalDialogFunctionSelect').value;
        var selRow = document.querySelector('#signalDialog .signal-row.selected');
        var result = {
            selectedSignal: selfDialog.selectedSignal,
            selectedFunction: selectedFunction,
            selectedKind: selRow ? selRow.dataset.kind : null    // 'voltage' | 'current'
        };
        selfDialog.hide();
        if (typeof selfDialog.onSubmit === 'function') {
            selfDialog.onSubmit(result);
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
        var dialog = document.getElementById('signalDialog');
        var header = document.getElementById('signalDialogHeader');
        var closeBtn = document.getElementById('signalDialogClose');
        var overlay = document.getElementById('signalDialogOverlay');
        var btnClear = document.getElementById('signalDialogBtnClear');
        var btnCancel = document.getElementById('signalDialogBtnCancel');
        var btnOk = document.getElementById('signalDialogBtnOk');

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
var signalDialog;