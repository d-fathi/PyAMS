/*
#--------------------------------------------------------------------------------------------------
Name:        messageDialog.js
Author:      d.fathi
Created:     29/09/2026
Updated:     29/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
//------------------Class for Message/Error Dialog-------------------------------------------------//

function fMessageDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.messageType = 'error';  // error, warning, info, success
    selfDialog.title = 'Message';
    selfDialog.details = null;
    selfDialog.onClose = null;
    selfDialog.onOk = null;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // Icon SVGs
    var icons = {
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };

    // Inject CSS
    this.injectCSS = function() {
        var css = `
/* ===== Message Dialog ===== */
#messageDialog {
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 480px;
    max-width: 90vw;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border, #ccc));
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    z-index: 4000;
    display: none;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-editor-foreground, #333);
    flex-direction: column;
    overflow: hidden;
}

#messageDialog.visible {
    display: flex;
}

/* Overlay backdrop - NO click to close */
#messageDialogOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.45);
    z-index: 3999;
    display: none;
}

#messageDialogOverlay.visible {
    display: block;
}

/* Header - Draggable */
#messageDialogHeader {
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

#messageDialogHeader:hover {
    background: var(--vscode-list-hoverBackground, #f0f0f0);
}

#messageDialogTitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
    display: flex;
    align-items: center;
    gap: 8px;
}

#messageDialogTitle .msg-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

#messageDialogTitle .msg-icon svg {
    width: 100%;
    height: 100%;
}

/* Type-specific title colors */
#messageDialog.type-error #messageDialogTitle { color: var(--vscode-errorForeground, #f44336); }
#messageDialog.type-warning #messageDialogTitle { color: var(--vscode-editorWarning-foreground, #ff9800); }
#messageDialog.type-info #messageDialogTitle { color: var(--vscode-textLink-foreground, #2196F3); }
#messageDialog.type-success #messageDialogTitle { color: #4CAF50; }

#messageDialogClose {
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

#messageDialogClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
    color: var(--vscode-editor-foreground, #333);
}

/* Content area - Details only, no icon */
#messageDialogContent {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--vscode-editor-background, #fafafa);
}

/* Details text */
#messageDialogDetails {
    flex: 1;
    padding: 14px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    color: var(--vscode-editor-foreground, #444);
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 350px;
}

/* Scrollbar for details */
#messageDialogDetails::-webkit-scrollbar { width: 8px; }
#messageDialogDetails::-webkit-scrollbar-track { background: var(--vscode-scrollbarSlider-background, #f1f1f1); }
#messageDialogDetails::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-hoverBackground, #c1c1c1); border-radius: 4px; }
#messageDialogDetails::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-activeBackground, #a1a1a1); }

/* Buttons bar */
#messageDialogButtonsBar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}

.message-btn {
    padding: 6px 20px;
    border: 1px solid var(--vscode-button-secondaryBackground, #ccc);
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    background: var(--vscode-button-secondaryBackground, #f0f0f0);
    color: var(--vscode-button-secondaryForeground, #333);
    transition: all 0.15s;
    font-family: inherit;
    min-width: 80px;
}

.message-btn:hover {
    background: var(--vscode-button-secondaryHoverBackground, #e0e0e0);
}

.message-btn-primary {
    background: var(--vscode-button-background, #2196F3);
    border-color: var(--vscode-button-border, #1976D2);
    color: var(--vscode-button-foreground, #fff);
}

.message-btn-primary:hover {
    background: var(--vscode-button-hoverBackground, #1976D2);
}

/* Type-specific primary button */
#messageDialog.type-error .message-btn-primary {
    background: var(--vscode-errorForeground, #f44336);
    border-color: #d32f2f;
}

#messageDialog.type-error .message-btn-primary:hover {
    background: #d32f2f;
}

#messageDialog.type-warning .message-btn-primary {
    background: var(--vscode-editorWarning-foreground, #ff9800);
    border-color: #f57c00;
}

#messageDialog.type-warning .message-btn-primary:hover {
    background: #f57c00;
}

#messageDialog.type-success .message-btn-primary {
    background: #4CAF50;
    border-color: #388E3C;
}

#messageDialog.type-success .message-btn-primary:hover {
    background: #388E3C;
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
        var dialogHTML = `
<div id="messageDialogOverlay"></div>
<div id="messageDialog" class="type-error">
    <div id="messageDialogHeader">
        <span id="messageDialogTitle">
            <span class="msg-icon" id="messageDialogTitleIcon"></span>
            <span id="messageDialogTitleText">Message</span>
        </span>
        <button id="messageDialogClose" title="Close">×</button>
    </div>
    <div id="messageDialogContent">
        <div id="messageDialogDetails"></div>
    </div>
    <div id="messageDialogButtonsBar">
        <button class="message-btn message-btn-primary" id="messageDialogBtnOk">OK</button>
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
        var dialog = document.getElementById('messageDialog');
        var overlay = document.getElementById('messageDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
        }
    };

    // Hide dialog
    this.hide = function() {
        var dialog = document.getElementById('messageDialog');
        var overlay = document.getElementById('messageDialogOverlay');
        if (dialog) {
            dialog.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.unbindKeyEvents();
        }
    };

    // Bind key events
    this.bindKeyEvents = function() {
        document.addEventListener('keydown', selfDialog.keyHandler);
    };

    // Unbind key events
    this.unbindKeyEvents = function() {
        document.removeEventListener('keydown', selfDialog.keyHandler);
    };

    // Key handler - Enter/Escape to close
    this.keyHandler = function(e) {
        if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            selfDialog.closeDialog();
            return false;
        }
    };

    // Initialize with options
    this.initData = function(options) {
        options = options || {};
        
        selfDialog.messageType = options.type || 'error';
        selfDialog.title = options.title || 'Message';
        selfDialog.details = options.details || options.message || '';
        selfDialog.onClose = options.onClose || null;
        selfDialog.onOk = options.onOk || null;

        selfDialog.updateContent();
    };

    // Update dialog content
    this.updateContent = function() {
        var dialog = document.getElementById('messageDialog');
        var titleIcon = document.getElementById('messageDialogTitleIcon');
        var titleText = document.getElementById('messageDialogTitleText');
        var details = document.getElementById('messageDialogDetails');

        if (!dialog) return;

        // Set type class
        dialog.className = 'type-' + selfDialog.messageType;

        // Set icon in title only
        var iconSvg = icons[selfDialog.messageType] || icons.info;
        if (titleIcon) titleIcon.innerHTML = iconSvg;

        // Set title
        if (titleText) titleText.textContent = selfDialog.title;

        // Set details (no icon in content area)
        if (details) details.textContent = selfDialog.details;
    };

    // Close dialog
    this.closeDialog = function() {
        selfDialog.hide();
        if (typeof selfDialog.onClose === 'function') {
            selfDialog.onClose();
        }
    };

    // OK button handler
    this.okDialog = function() {
        selfDialog.hide();
        if (typeof selfDialog.onOk === 'function') {
            selfDialog.onOk();
        }
        if (typeof selfDialog.onClose === 'function') {
            selfDialog.onClose();
        }
    };

    // Initialize events
    this.init = function() {
        var dialog = document.getElementById('messageDialog');
        var header = document.getElementById('messageDialogHeader');
        var closeBtn = document.getElementById('messageDialogClose');
        var overlay = document.getElementById('messageDialogOverlay');
        var btnOk = document.getElementById('messageDialogBtnOk');

        if (!dialog || !header) return;

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selfDialog.closeDialog();
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

        // OK button
        if (btnOk) {
            btnOk.addEventListener('click', function() {
                selfDialog.okDialog();
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
var messageDialog;

// Convenience functions for quick usage
function showError(title, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'error',
        title: title || 'Error',
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}

function showWarning(title, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'warning',
        title: title || 'Warning',
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}

function showInfo(title, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'info',
        title: title || 'Information',
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}

function showSuccess(title, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'success',
        title: title || 'Success',
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}