/*
#--------------------------------------------------------------------------------------------------
Name:        nodeSelectorDialog.js
Author:      d.fathi
Created:     20/10/2026
Updated:     21/10/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
//------------------Class for Node Selector Dialog-------------------------------------------------//
function fNodeSelectorDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.treeData = [];
    selfDialog.selectedNode = null;
    selfDialog.preSelectedValue = null;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;
    selfDialog.onSelect = null; // دالة العودة عند التحديد

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // Inject CSS (بدون Overlay)
    this.injectCSS = function() {
        var css = `
/* ===== Node Selector Dialog ===== */
#nodeSelectorDialog {
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
#nodeSelectorDialog.visible { display: flex; }

/* Header - Draggable */
#nodeSelectorDialogHeader {
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
#nodeSelectorDialogHeader:hover { background: var(--vscode-list-hoverBackground, #f0f0f0); }
#nodeSelectorDialogTitle { font-size: 14px; font-weight: 600; color: var(--vscode-editor-foreground, #333); }
#nodeSelectorDialogClose {
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
#nodeSelectorDialogClose:hover { background: var(--vscode-list-hoverBackground, #e0e0e0); color: var(--vscode-editor-foreground, #333); }

/* Selected display bar */
#nodeSelectorDialogSelectedBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-bottom: 1px solid var(--vscode-panel-border, #eee);
    flex-shrink: 0;
}
#nodeSelectorDialogSelectedBar h2 { font-size: 13px; font-weight: 600; color: var(--vscode-editor-foreground, #333); margin: 0; }
#nodeSelectorDialogSelectedDisplay {
    font-size: 12px;
    color: var(--vscode-textLink-foreground, #2196F3);
    font-weight: 600;
    font-family: 'Consolas', monospace;
}

/* Tree container */
#nodeSelectorDialogTreeContainer {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px 0;
    scrollbar-width: thin;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    min-height: 200px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}

/* Section header (group name) */
.nodeselect-section-header {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid var(--vscode-panel-border, #e0e0e0);
    background: var(--vscode-sideBar-background, #fafafa);
}
.nodeselect-section-header:hover { background: var(--vscode-list-hoverBackground, #f0f0f0); }
.nodeselect-section-header .arrow {
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
.nodeselect-section-header .arrow.collapsed { transform: rotate(-90deg); }
.nodeselect-section-header .section-title { font-size: 13px; font-weight: 600; color: var(--vscode-editor-foreground, #555); }

/* Group node */
.nodeselect-group-node { border-bottom: 1px solid var(--vscode-panel-border, #e8e8e8); }

/* Children container */
.nodeselect-children { overflow: hidden; transition: all 0.25s ease; }
.nodeselect-children.collapsed { max-height: 0; opacity: 0; }

/* Node row */
.nodeselect-row {
    display: flex;
    align-items: center;
    padding: 7px 12px 7px 32px;
    border-bottom: 1px solid var(--vscode-panel-border, #f0f0f0);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
    position: relative;
    z-index: 1;
}
.nodeselect-row:hover { background: var(--vscode-list-hoverBackground, #e3f2fd); }
.nodeselect-row.selected {
    background: var(--vscode-textLink-foreground, #2196F3) !important;
    color: #fff !important;
}
.nodeselect-row.selected .nodeselect-label { color: #fff; }
.nodeselect-row.selected .type-indicator { border-color: #fff; }

/* Type indicator */
.type-indicator {
    width: 12px;
    height: 12px;
    border: 1px solid var(--vscode-panel-border, #bbb);
    border-radius: 2px;
    margin-right: 10px;
    flex-shrink: 0;
    background: #4CAF50;
}

/* Node label */
.nodeselect-label {
    font-size: 12px;
    color: var(--vscode-editor-foreground, #444);
    font-family: 'Consolas', 'Courier New', monospace;
    flex: 1;
}

/* Scrollbar */
#nodeSelectorDialogTreeContainer::-webkit-scrollbar { width: 8px; }
#nodeSelectorDialogTreeContainer::-webkit-scrollbar-track { background: var(--vscode-scrollbarSlider-background, #f1f1f1); }
#nodeSelectorDialogTreeContainer::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-hoverBackground, #c1c1c1); border-radius: 4px; }
#nodeSelectorDialogTreeContainer::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-activeBackground, #a1a1a1); }
`;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet) { style.styleSheet.cssText = css; }
        else { style.appendChild(document.createTextNode(css)); }
    };

    // Inject HTML (بدون Overlay وبدون أزرار)
    this.injectHTML = function() {
        var dialogHTML = `
<div id="nodeSelectorDialog">
    <div id="nodeSelectorDialogHeader">
        <span id="nodeSelectorDialogTitle">Node selection</span>
        <button id="nodeSelectorDialogClose" title="Close">×</button>
    </div>
    <div id="nodeSelectorDialogSelectedBar">
        <h2>Selected node</h2>
        <span id="nodeSelectorDialogSelectedDisplay">No selection</span>
    </div>
    <div id="nodeSelectorDialogTreeContainer"></div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    };

    // Toggle dialog visibility
    this.toggle = function() {
        if (selfDialog.isVisible) { selfDialog.hide(); }
        else { selfDialog.show(); }
    };

    // Show dialog (بدون overlay)
    this.show = function() {
        var dialog = document.getElementById('nodeSelectorDialog');
        if (dialog) {
            dialog.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
        }
    };

    // Hide dialog
    this.hide = function() {
        var dialog = document.getElementById('nodeSelectorDialog');
        if (dialog) {
            dialog.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.unbindKeyEvents();
        }
    };

    // Bind key events
    this.bindKeyEvents = function() { document.addEventListener('keydown', selfDialog.keyHandler); };
    this.unbindKeyEvents = function() { document.removeEventListener('keydown', selfDialog.keyHandler); };

    // Key handler
    this.keyHandler = function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    // Initialize with data
    this.initData = function(data, preSelected) {
        selfDialog.treeData = data || [];
        selfDialog.preSelectedValue = preSelected || null;
        selfDialog.selectedNode = selfDialog.preSelectedValue;
        selfDialog.renderTree();
        if (selfDialog.selectedNode) {
            var display = document.getElementById('nodeSelectorDialogSelectedDisplay');
            if (display) display.textContent = selfDialog.selectedNode;
        }
    };

    // Render tree
    this.renderTree = function() {
        var container = document.getElementById('nodeSelectorDialogTreeContainer');
        if (!container) return;
        container.innerHTML = '';
        selfDialog.treeData.forEach(function(group, index) {
            var node = selfDialog.createGroupNode(group, index);
            container.appendChild(node);
        });
    };

    // Create group node
    this.createGroupNode = function(group, groupIndex) {
        var div = document.createElement('div');
        div.className = 'nodeselect-group-node';
        var header = document.createElement('div');
        header.className = 'nodeselect-section-header';
        header.onclick = function() {
            selfDialog.toggleSection(header, childrenDiv, groupIndex);
        };

        var arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.innerHTML = '▼';

        var title = document.createElement('span');
        title.className = 'section-title';
        title.textContent = group.name + ' (' + (group.nodes ? group.nodes.length : 0) + ')';

        header.appendChild(arrow);
        header.appendChild(title);
        div.appendChild(header);

        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'nodeselect-children';
        if (group.nodes && group.nodes.length > 0) {
            group.nodes.forEach(function(nodeValue, nodeIndex) {
                var row = selfDialog.createNodeRow(nodeValue, groupIndex, nodeIndex);
                childrenDiv.appendChild(row);
            });
        }
        div.appendChild(childrenDiv);

        var isCollapsed = group.collapsed !== false;
        if (isCollapsed) {
            childrenDiv.classList.add('collapsed');
            arrow.classList.add('collapsed');
            arrow.innerHTML = '▶';
        } else {
            arrow.innerHTML = '▼';
        }
        return div;
    };

    // Create node row (مع تمرير الفهارس)
    this.createNodeRow = function(value, groupIndex, nodeIndex) {
        var row = document.createElement('div');
        row.className = 'nodeselect-row';
        row.dataset.value = value;
        row.dataset.groupIndex = groupIndex;
        row.dataset.nodeIndex = nodeIndex;
        row.onclick = function(e) {
            e.stopPropagation();
            selfDialog.selectNode(row, value, groupIndex, nodeIndex);
        };

        if (selfDialog.preSelectedValue && value === selfDialog.preSelectedValue) {
            row.classList.add('selected');
            selfDialog.selectedNode = value;
        }

        var indicator = document.createElement('div');
        indicator.className = 'type-indicator';
        var label = document.createElement('span');
        label.className = 'nodeselect-label';
        label.textContent = value;

        row.appendChild(indicator);
        row.appendChild(label);
        return row;
    };

    // Toggle section
    this.toggleSection = function(header, content, groupIndex) {
        var arrow = header.querySelector('.arrow');
        content.classList.toggle('collapsed');
        arrow.classList.toggle('collapsed');
        arrow.innerHTML = content.classList.contains('collapsed') ? '▶' : '▼';
        if (selfDialog.treeData[groupIndex]) {
            selfDialog.treeData[groupIndex].collapsed = content.classList.contains('collapsed');
        }
    };

    // Select node (بدون إغلاق النافذة، يستدعي onSelect مع الاسم والموقع)
    this.selectNode = function(rowElement, value, groupIndex, nodeIndex) {
        var allSelected = document.querySelectorAll('#nodeSelectorDialog .nodeselect-row.selected');
        allSelected.forEach(function(r) { r.classList.remove('selected'); });

        rowElement.classList.add('selected');
        selfDialog.selectedNode = value;

        var display = document.getElementById('nodeSelectorDialogSelectedDisplay');
        if (display) display.textContent = value;

        // استدعاء دالة العودة مع الاسم والموقع في القائمة
        if (typeof selfDialog.onSelect === 'function') {
            selfDialog.onSelect({
                value: value,
                groupIndex: groupIndex,
                nodeIndex: nodeIndex
            });
        }
    };

    // Cancel dialog (عند الضغط على زر X)
    this.cancelDialog = function() {
        selfDialog.hide();
        if (typeof selfDialog.onCancel === 'function') {
            selfDialog.onCancel();
        }
        return null;
    };

    // Promise-based open (يدعم onSelect callback)
    this.open = function(data, preSelected, onSelectCallback) {
        selfDialog.onSelect = typeof onSelectCallback === 'function' ? onSelectCallback : null;

        return new Promise(function(resolve) {
            selfDialog.onSubmit = function(result) {
                selfDialog.onSubmit = null;
                selfDialog.onCancel = null;
                resolve(result);
            };
            selfDialog.onCancel = function() {
                selfDialog.onSelect = null;
                selfDialog.onSubmit = null;
                selfDialog.onCancel = null;
                resolve(null);
            };
            selfDialog.initData(data, preSelected);
            selfDialog.show();
        });
    };

    // Get current treeData
    this.getTreeData = function() {
        return JSON.parse(JSON.stringify(selfDialog.treeData));
    };

    // Set treeData from outside
    this.setTreeData = function(data) {
        selfDialog.treeData = JSON.parse(JSON.stringify(data));
        selfDialog.renderTree();
    };

    // Initialize events
    this.init = function() {
        var dialog = document.getElementById('nodeSelectorDialog');
        var header = document.getElementById('nodeSelectorDialogHeader');
        var closeBtn = document.getElementById('nodeSelectorDialogClose');

        if (!dialog || !header) return;

        // Close button (X)
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selfDialog.cancelDialog();
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

        document.addEventListener('mouseup', function() { isDragging = false; });
    };

    // Constructor
    this.injectCSS();
    this.injectHTML();
    this.init();
}

// Global instance
var nodeSelectorDialog;

// Convenience function (يدعم onSelect callback)
function openNodeSelector(data, preSelected, onSelectCallback) {
    if (!nodeSelectorDialog) nodeSelectorDialog = new fNodeSelectorDialog(null);
    return nodeSelectorDialog.open(data, preSelected, onSelectCallback);
}