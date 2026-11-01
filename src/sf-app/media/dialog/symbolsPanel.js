/*
#--------------------------------------------------------------------------------------------------
Name:        symbolsPanel.js
Author:      d.fathi
Created:     25/08/2026
Updated:     28/08/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
//------------------Class for Symbols Panel--------------------------------------------------------//

function fsymbolsPanel(self) {
    var selfPanel = this;
    selfPanel.drawing = self;
    selfPanel.isVisible = false;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var panelStartX = 0, panelStartY = 0;

    // Inject CSS
    this.injectCSS = function() {
        var css = `
/* ===== Symbols Panel ===== */
#symbolsPanel {
    position: absolute;
    top: 50px;
    left: 20px;
    width: 250px;
    background: var(--vscode-editorWidget-background, white);
    border: 1px solid var(--vscode-editorWidget-border, #ccc);
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 2000;
    display: none;
    font-family: var(--vscode-font-family, verdana);
    font-size: var(--vscode-font-size, 12px);
    color: var(--vscode-editor-foreground, #333);
    /* Fixed overall height */
    height: 540px;
    max-height: 80vh;
    /* Use flex column layout */
    display: none;
    flex-direction: column;
}

#symbolsPanel.visible {
    display: flex;
}

/* Header - Draggable (Fixed) */
#symbolsPanelHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, #eee);
    background: var(--vscode-titleBar-activeBackground, #fafafa);
    border-radius: 6px 6px 0 0;
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}

#symbolsPanelHeader:hover {
    background: var(--vscode-list-hoverBackground, #f0f0f0);
}

#symbolsPanelTitle {
    font-size: 14px;
    font-weight: bold;
}

#symbolsPanelClose {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, #666);
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
}

#symbolsPanelClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
    color: var(--vscode-editor-foreground, #333);
}

/* Controls Bar - Fixed (Components + Dropdown) */
#symbolsPanelControls {
    flex-shrink: 0;
    padding: 8px 12px;
    background: var(--vscode-editorWidget-background, #f9f9f9);
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    display: flex;
    align-items: center;
    gap: 8px;
}

#symbolsPanelControls label {
    font-weight: 600;
    white-space: nowrap;
}

#symbolsPanelControls select {
    flex: 1;
    padding: 4px 6px;
    border: 1px solid var(--vscode-panel-border, #ccc);
    border-radius: 3px;
    background: var(--vscode-dropdown-background, white);
    color: var(--vscode-dropdown-foreground, #333);
    font-family: inherit;
    font-size: inherit;
}

/* Scrollable Body - Grid Area Only */
#symbolsPanelBody {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px;
    scrollbar-width: thin;
}


/* Grid layout for symbols */
#symbolsPanelBody ul#buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    list-style: none;
    padding: 8px;
    margin: 0;
}

#symbolsPanelBody ul#buttons li {
    border: 1px solid var(--vscode-panel-border, #ccc);
    background: var(--vscode-editorWidget-background, #f9f9f9);
    border-radius: 4px;
    aspect-ratio: 1/1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 4px;
    transition: background 0.2s, border-color 0.2s;
}


#symbolsPanelBody ul#buttons li:hover {
    background: var(--vscode-list-hoverBackground, #e8e8e8);
    border-color: var(--vscode-focusBorder, #007fd4);
}

#symbolsPanelBody ul#buttons li button {
    width: 100%;
    height: 75%;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
}


#symbolsPanelBody ul#buttons li button:focus-visible {
    outline: 1px solid var(--vscode-focusBorder, #007fd4);
    outline-offset: 2px;
    border-radius: 2px;
}

#symbolsPanelBody ul#buttons li button svg {
    max-width: 100%;
    max-height: 100%;
    color: var(--vscode-editor-foreground, #333); 
}

#symbolsPanelBody ul#buttons li p {
    margin: 4px 0 0 0;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 95%;
    text-align: center;
    line-height: 1.2;
}

#symbolsPanelBody ul#buttons li p a {
    color: var(--vscode-textLink-foreground, #0066cc);
    text-decoration: none;
}

#symbolsPanelBody ul#buttons li p a:hover {
    color: var(--vscode-textLink-activeForeground, #0066cc);
    text-decoration: underline;
}

/* Placeholder style */
/*.symbol-list-placeholder {
    text-align: center;
    color: var(--vscode-descriptionForeground, #888);
    padding: 4px 0;
    font-style: italic;
    border: 1px dashed var(--vscode-panel-border, #ccc);
    border-radius: 4px;
}*/

#selectLibs {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

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
        var panelHTML = `
<div id="symbolsPanel">
    <div id="symbolsPanelHeader">
        <span id="symbolsPanelTitle">Symbols Library</span>
        <button id="symbolsPanelClose" title="Close">×</button>
    </div>
    <div id="symbolsPanelControls">
        <label for="selectLibs">Components</label>
        <select id="selectLibs" class="myInput">
            <option value="symbols">symbols</option>
        </select>
    </div>
    <div id="symbolsPanelBody">
        <div class="symbol-list-placeholder" id="componentsPanel">
            List of symbols will appear here.<br>
            (Coming Soon)
        </div>
    </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', panelHTML);
    };

    // Toggle panel visibility
    this.toggle = function() {
        if (selfPanel.isVisible) {
            selfPanel.hide();
        } else {
            selfPanel.show();
        }
    };

    // Show panel
    this.show = function() {
        var panel = document.getElementById('symbolsPanel');
        if (panel) {
            panel.classList.add('visible');
            selfPanel.isVisible = true;
        }
    };

    // Hide panel
    this.hide = function() {
        var panel = document.getElementById('symbolsPanel');
        if (panel) {
            panel.classList.remove('visible');
            selfPanel.isVisible = false;
        }
    };

    // Initialize events
    this.init = function() {
        var panel = document.getElementById('symbolsPanel');
        var header = document.getElementById('symbolsPanelHeader');
        var closeBtn = document.getElementById('symbolsPanelClose');

        if (!panel || !header) return;

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selfPanel.hide();
            });
        }

        // Drag functionality from header
        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn || closeBtn.contains(e.target)) return;

            isDragging = true;
            var rect = panel.getBoundingClientRect();
            panelStartX = rect.left;
            panelStartY = rect.top;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            panel.style.right = 'auto';
            panel.style.left = panelStartX + 'px';
            panel.style.top = panelStartY + 'px';

            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;

            var deltaX = e.clientX - dragStartX;
            var deltaY = e.clientY - dragStartY;

            var newX = panelStartX + deltaX;
            var newY = panelStartY + deltaY;

            // Keep panel within viewport bounds
            var panelWidth = panel.offsetWidth;
            var panelHeight = panel.offsetHeight;
            var viewportWidth = window.innerWidth;
            var viewportHeight = window.innerHeight;

            if (newX < 0) newX = 0;
            if (newX + panelWidth > viewportWidth) newX = viewportWidth - panelWidth;
            if (newY < 0) newY = 0;
            if (newY + panelHeight > viewportHeight) newY = viewportHeight - panelHeight;

            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
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
var symbolsPanel;