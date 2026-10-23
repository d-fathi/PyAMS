/*
#--------------------------------------------------------------------------------------------------
Name:        opAnalysisDialog.js
Author:      d.fathi
Created:     30/09/2026
Updated:     30/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Dialog for DC Operating Point analysis with circuit validation
             Shows only Process Log containing everything
*/

function fOpAnalysisDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;

    selfDialog.isRunning = false;
    selfDialog.startTime = null;
    selfDialog.elapsedTimer = null;
    selfDialog.progress = 0;
    selfDialog.lastResult = null;

    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    var statusDot, processLog, progressBar, progressText, elapsedTime;
    var startBtn, closeBtn, okBtn;

    this.injectCSS = function() {
        var css = `
#opAnalysisDialog {
    position: fixed;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 760px;
    max-width: 94vw;
    height: 560px;
    max-height: 86vh;
    background: var(--vscode-editorWidget-background, #fff);
    border: 1px solid var(--vscode-editorWidget-border, #ccc);
    border-radius: 8px;
    box-shadow: 0 10px 36px rgba(0,0,0,0.35);
    z-index: 3200;
    display: none;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    font-size: 13px;
    color: var(--vscode-editor-foreground, #333);
    flex-direction: column;
    overflow: hidden;
}
#opAnalysisDialog.visible { display: flex; }

#opAnalysisDialogOverlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 3199;
    display: none;
}
#opAnalysisDialogOverlay.visible { display: block; }

#opAnalysisDialogHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-titleBar-activeBackground, #f5f5f5);
    border-radius: 8px 8px 0 0;
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}

.op-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.op-title {
    font-size: 15px;
    font-weight: 600;
}

.op-status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ccc;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.op-status-dot.running {
    background: #4CAF50;
    box-shadow: 0 0 8px rgba(76,175,80,0.5);
    animation: opPulse 1.5s infinite;
}

.op-status-dot.done { background: #2196F3; }
.op-status-dot.error { background: #f44336; }
.op-status-dot.warning { background: #FF9800; }

@keyframes opPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

#opAnalysisDialogClose {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, #666);
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
}
#opAnalysisDialogClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
}

.op-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.op-section-title {
    padding: 12px 16px 8px 16px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--vscode-descriptionForeground, #666);
    flex-shrink: 0;
}

.op-log-box {
    flex: 1;
    margin: 0 16px 12px 16px;
    padding: 12px;
    border: 1px solid var(--vscode-panel-border, #ddd);
    border-radius: 6px;
    background: var(--vscode-editor-background, #fff);
    font-family: Consolas, 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.55;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
}

.op-progress-section {
    padding: 12px 16px;
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-editorWidget-background, #fff);
    flex-shrink: 0;
}

.op-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.op-progress-label {
    font-size: 12px;
    font-weight: 600;
}

.op-elapsed-time {
    font-size: 12px;
    color: var(--vscode-descriptionForeground, #888);
    font-family: Consolas, monospace;
}

.op-elapsed-time span {
    color: var(--vscode-textLink-foreground, #2196F3);
    font-weight: 600;
}

.op-progress-track {
    width: 100%;
    height: 8px;
    background: var(--vscode-input-background, #e0e0e0);
    border-radius: 4px;
    overflow: hidden;
}

.op-progress-fill {
    height: 100%;
    width: 0%;
    background: var(--vscode-progressBar-background, #2196F3);
    border-radius: 4px;
    transition: width 0.25s ease;
}

.op-progress-fill.complete { background: #4CAF50; }
.op-progress-fill.error { background: #f44336; }

.op-progress-percent {
    text-align: center;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-textLink-foreground, #2196F3);
    font-family: Consolas, monospace;
}

.op-buttons-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--vscode-editorWidget-background, #fff);
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}

.op-btn {
    padding: 8px 18px;
    border: 1px solid var(--vscode-button-secondaryBackground, #ccc);
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: var(--vscode-button-secondaryBackground, #f0f0f0);
    color: var(--vscode-button-secondaryForeground, #333);
    transition: all 0.15s;
    font-family: inherit;
    min-width: 90px;
}

.op-btn:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, #e0e0e0);
}

.op-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.op-btn-primary {
    background: var(--vscode-button-background, #2196F3);
    border-color: var(--vscode-button-border, #1976D2);
    color: var(--vscode-button-foreground, #fff);
}

.op-btn-primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground, #1976D2);
}

.op-log-info { color: var(--vscode-textLink-foreground, #2196F3); }
.op-log-success { color: #4CAF50; }
.op-log-error { color: #f44336; }
.op-log-warn { color: #FF9800; }
.op-log-time { color: var(--vscode-descriptionForeground, #999); font-size: 11px; }
`;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    };

    this.injectHTML = function() {
        var html = `
<div id="opAnalysisDialogOverlay"></div>
<div id="opAnalysisDialog">
    <div id="opAnalysisDialogHeader">
        <div class="op-header-left">
            <div class="op-status-dot" id="opStatusDot"></div>
            <span class="op-title">DC Operating Point Check</span>
        </div>
        <button id="opAnalysisDialogClose" title="Close">×</button>
    </div>

    <div class="op-main">
        <div class="op-section-title">Process Log</div>
        <div id="opProcessLog" class="op-log-box"></div>

        <div class="op-progress-section">
            <div class="op-progress-header">
                <span class="op-progress-label">Progress</span>
                <span class="op-elapsed-time">Elapsed: <span id="opElapsedTime">0:00</span></span>
            </div>
            <div class="op-progress-track">
                <div id="opProgressBar" class="op-progress-fill"></div>
            </div>
            <div id="opProgressText" class="op-progress-percent">0%</div>
        </div>

        <div class="op-buttons-bar">
            <button id="opStartBtn" class="op-btn op-btn-primary">▶ Check Circuit</button>
            <button id="opOkBtn" class="op-btn" disabled>✓ OK</button>
        </div>
    </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', html);
    };

    this.cacheDOM = function() {
        statusDot = document.getElementById('opStatusDot');
        processLog = document.getElementById('opProcessLog');
        progressBar = document.getElementById('opProgressBar');
        progressText = document.getElementById('opProgressText');
        elapsedTime = document.getElementById('opElapsedTime');
        startBtn = document.getElementById('opStartBtn');
        okBtn = document.getElementById('opOkBtn');
        closeBtn = document.getElementById('opAnalysisDialogClose');
    };

    this.show = function() {
        var dialog = document.getElementById('opAnalysisDialog');
        var overlay = document.getElementById('opAnalysisDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
        }
    };

    this.hide = function() {
        var dialog = document.getElementById('opAnalysisDialog');
        var overlay = document.getElementById('opAnalysisDialogOverlay');
        if (dialog) {
            dialog.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.stopElapsedTimer();
        }
    };

    this.setCallbacks = function(onSubmit, onCancel) {
        selfDialog.onSubmit = onSubmit || null;
        selfDialog.onCancel = onCancel || null;
    };

    this.resetDialog = function() {
        selfDialog.isRunning = false;
        selfDialog.progress = 0;
        selfDialog.lastResult = null;

        if (processLog) processLog.innerHTML = '';
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.className = 'op-progress-fill';
        }
        if (progressText) progressText.textContent = '0%';
        if (elapsedTime) elapsedTime.textContent = '0:00';
        if (statusDot) statusDot.className = 'op-status-dot';

        if (startBtn) startBtn.disabled = false;
        if (okBtn) okBtn.disabled = true;

        selfDialog.stopElapsedTimer();
    };

    this.appendLog = function(message, type) {
        type = type || 'info';
        if (!processLog) return;

        var now = new Date();
        var timeStr = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        var span = document.createElement('div');
        span.innerHTML = '<span class="op-log-time">[' + timeStr + ']</span> <span class="op-log-' + type + '">' + escapeHtml(message) + '</span>';
        processLog.appendChild(span);
        processLog.scrollTop = processLog.scrollHeight;
    };

    this.appendSeparator = function(title) {
        if (!processLog) return;
        var div = document.createElement('div');
     //   div.innerHTML = '\n----- ' + escapeHtml(title) + ' -----';
        processLog.appendChild(div);
        processLog.scrollTop = processLog.scrollHeight;
    };

    this.setProgress = function(percent) {
        selfDialog.progress = Math.min(100, Math.max(0, percent));
        if (progressBar) progressBar.style.width = selfDialog.progress + '%';
        if (progressText) progressText.textContent = Math.round(selfDialog.progress) + '%';
        if (selfDialog.progress >= 100 && progressBar) {
            progressBar.classList.add('complete');
        }
    };

    this.setStatus = function(status) {
        if (statusDot) statusDot.className = 'op-status-dot ' + status;
    };

    this.startElapsedTimer = function() {
        selfDialog.startTime = Date.now();
        selfDialog.elapsedTimer = setInterval(function() {
            var elapsed = Math.floor((Date.now() - selfDialog.startTime) / 1000);
            var minutes = Math.floor(elapsed / 60);
            var seconds = elapsed % 60;
            if (elapsedTime) {
                elapsedTime.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            }
        }, 1000);
    };

    this.stopElapsedTimer = function() {
        if (selfDialog.elapsedTimer) {
            clearInterval(selfDialog.elapsedTimer);
            selfDialog.elapsedTimer = null;
        }
    };

    this.initData = function(spiceCode) {
        selfDialog.spiceCode = spiceCode || '';
        selfDialog.resetDialog();
    };

    this.startAnalysis = function() {
        if (!selfDialog.spiceCode || !selfDialog.spiceCode.trim()) {
            selfDialog.appendLog('No SPICE code provided.', 'error');
            return;
        }

        selfDialog.isRunning = true;
        selfDialog.resetDialog();
        selfDialog.setStatus('running');
        selfDialog.setProgress(10);
        selfDialog.startElapsedTimer();

        if (startBtn) startBtn.disabled = true;
        if (okBtn) okBtn.disabled = true;

        selfDialog.appendLog('Starting DC Operating Point analysis...', 'info');

        if (typeof drawing !== 'undefined' && drawing.execOp) {
            drawing.execOp(selfDialog.spiceCode).then(function(result) {
                selfDialog.lastResult = result;
                selfDialog.completeAnalysis(result);
            }).catch(function(err) {
                selfDialog.errorAnalysis(err);
            });
        } else {
            selfDialog.errorAnalysis('drawing.execOp is not available.');
        }
    };

    this.completeAnalysis = function(result) {
        selfDialog.isRunning = false;
        selfDialog.setProgress(100);
        selfDialog.stopElapsedTimer();

        var parsed = result && result.results ? result.results : { results: [], errors: [], warnings: [] };
        var values = parsed.results || [];
        var errors = parsed.errors || [];
        var warnings = parsed.warnings || [];

        selfDialog.appendSeparator('Circuit Status');

        if (errors.length > 0) {
            selfDialog.setStatus('error');
            if (progressBar) progressBar.classList.add('error');
            selfDialog.appendLog('Circuit status: ERROR', 'error');
        } else if (warnings.length > 0) {
            selfDialog.setStatus('warning');
            selfDialog.appendLog('Circuit status: WARNING', 'warn');
        } else {
            selfDialog.setStatus('done');
            selfDialog.appendLog('Circuit status: OK', 'success');
        }

        selfDialog.appendSeparator('Errors');
        if (errors.length > 0) {
            for (var i = 0; i < errors.length; i++) {
                selfDialog.appendLog(errors[i], 'error');
            }
        } else {
            selfDialog.appendLog('No errors found.', 'success');
        }

        selfDialog.appendSeparator('Warnings');
        if (warnings.length > 0) {
            for (var j = 0; j < warnings.length; j++) {
                selfDialog.appendLog(warnings[j], 'warn');
            }
        } else {
            selfDialog.appendLog('No warnings found.', 'success');
        }

        selfDialog.appendSeparator('Operating Point Values');
        if (values.length > 0) {
            for (var k = 0; k < values.length; k++) {
                var name = values[k].name || '';
                var formatted = values[k].formatted !== undefined ? values[k].formatted : String(values[k].value);
                selfDialog.appendLog(name + ' = ' + formatted, 'info');
            }
        } else {
            selfDialog.appendLog('No operating point values found.', 'warn');
        }

        if (result && result.rawOutput) {
            selfDialog.appendSeparator('Raw ngspice Output');
            selfDialog.appendLog(result.rawOutput, 'info');
        }

        if (errors.length > 0) {
            selfDialog.appendLog('Circuit check finished with errors.', 'error');
        } else if (warnings.length > 0) {
            selfDialog.appendLog('Circuit check finished with warnings.', 'warn');
        } else {
            selfDialog.appendLog('Circuit check completed successfully.', 'success');
        }

        if (startBtn) startBtn.disabled = false;
        if (okBtn) okBtn.disabled = false;
    };

    this.errorAnalysis = function(err) {
        selfDialog.isRunning = false;
        selfDialog.setStatus('error');
        selfDialog.stopElapsedTimer();
        if (progressBar) progressBar.classList.add('error');
        selfDialog.appendSeparator('Circuit Status');
        selfDialog.appendLog('Circuit status: FAILED TO ANALYZE', 'error');
        selfDialog.appendSeparator('Error');
        selfDialog.appendLog('Analysis failed: ' + err, 'error');
        if (startBtn) startBtn.disabled = false;
        if (okBtn) okBtn.disabled = true;
    };

    this.submitResult = function() {
        var result = selfDialog.lastResult || { success: false };
        var submitCallback = selfDialog.onSubmit;
        selfDialog.hide();
        if (typeof submitCallback === 'function') submitCallback(result);
        return result;
    };

    this.cancelDialog = function() {
        var cancelCallback = selfDialog.onCancel;
        selfDialog.hide();
        if (typeof cancelCallback === 'function') cancelCallback();
        return null;
    };

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    this.init = function() {
        selfDialog.cacheDOM();

        var dialog = document.getElementById('opAnalysisDialog');
        var header = document.getElementById('opAnalysisDialogHeader');
        var overlay = document.getElementById('opAnalysisDialogOverlay');

        if (startBtn) startBtn.addEventListener('click', function() { selfDialog.startAnalysis(); });
        if (okBtn) okBtn.addEventListener('click', function() { selfDialog.submitResult(); });
        if (closeBtn) closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            selfDialog.cancelDialog();
        });
        if (overlay) overlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn || closeBtn.contains(e.target)) return;
            isDragging = true;
            var rect = dialog.getBoundingClientRect();
            dialogStartX = rect.left;
            dialogStartY = rect.top;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            dialog.style.transform = 'none';
            dialog.style.left = dialogStartX + 'px';
            dialog.style.top = dialogStartY + 'px';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var newX = dialogStartX + (e.clientX - dragStartX);
            var newY = dialogStartY + (e.clientY - dragStartY);
            var viewportWidth = window.innerWidth;
            var viewportHeight = window.innerHeight;

            if (newX < 0) newX = 0;
            if (newX + dialog.offsetWidth > viewportWidth) newX = viewportWidth - dialog.offsetWidth;
            if (newY < 0) newY = 0;
            if (newY + dialog.offsetHeight > viewportHeight) newY = viewportHeight - dialog.offsetHeight;

            dialog.style.left = newX + 'px';
            dialog.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && selfDialog.isVisible) {
                selfDialog.cancelDialog();
            }
        });
    };

    this.injectCSS();
    this.injectHTML();
    this.init();
}

var opAnalysisDialog;