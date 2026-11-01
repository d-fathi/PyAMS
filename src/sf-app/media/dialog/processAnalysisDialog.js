/*
#--------------------------------------------------------------------------------------------------
Name:        processAnalysisDialog.js
Author:      d.fathi
Created:     16/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Dialog for ngspice simulation process with progress tracking
*/

//------------------Class for Process Analysis Dialog--------------------------------//
function fProcessAnalysisDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.onSubmit = null;
    selfDialog.onCancel = null;

    // State
    selfDialog.isRunning = false;
    selfDialog.startTime = null;
    selfDialog.elapsedTimer = null;
    selfDialog.progress = 0;

    // 'spice' (ngspice, default) or 'pyams' (Python process, see initPyAMS)
    selfDialog.mode = 'spice';
    selfDialog.pyamsCode = '';
    selfDialog.pyamsAnalysis = null;
    selfDialog.pyamsResults = null;
    selfDialog.autoStart = false;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // DOM refs
    var statusDot, processLog, progressBar, progressText, elapsedTime;
    var startBtn, stopBtn, okBtn;

    // Inject CSS
    this.injectCSS = function() {
        var css = `
/* ===== Process Analysis Dialog ===== */
#processAnalysisDialog {
    position: fixed;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 650px;
    max-width: 92vw;
    height: 520px;
    max-height: 85vh;
    background: var(--vscode-editorWidget-background, #fff);
    border: 1px solid var(--vscode-editorWidget-border, #ccc);
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 3000;
    display: none;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    font-size: 13px;
    color: var(--vscode-editor-foreground, #333);
    flex-direction: column;
    overflow: hidden;
}
#processAnalysisDialog.visible { display: flex; }
#processAnalysisDialogOverlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.45);
    z-index: 2999;
    display: none;
}
#processAnalysisDialogOverlay.visible { display: block; }

/* Header */
#processAnalysisDialogHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-titleBar-activeBackground, #f5f5f5);
    border-radius: 6px 6px 0 0;
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}
.pd-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}
.pd-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
}
.pd-status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ccc;
    transition: all 0.3s ease;
    flex-shrink: 0;
}
.pd-status-dot.running { 
    background: #4CAF50; 
    box-shadow: 0 0 8px rgba(76,175,80,0.5);
    animation: pulse 1.5s infinite;
}
.pd-status-dot.stopped { background: #f44336; }
.pd-status-dot.done { background: #2196F3; }
.pd-status-dot.error { background: #FF9800; }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

#processAnalysisDialogClose {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, #666);
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
}
#processAnalysisDialogClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
    color: var(--vscode-editor-foreground, #333);
}

/* Log Container */
.pd-log-container {
    flex: 1;
    padding: 14px 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--vscode-editor-background, #fafafa);
}
.pd-log-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--vscode-descriptionForeground, #666);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}
.pd-log-box {
    flex: 1;
    background: var(--vscode-editor-background, #fff);
    border-radius: 4px;
    padding: 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    color: var(--vscode-editor-foreground, #444);
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid var(--vscode-panel-border, #e0e0e0);
}
.pd-log-box::-webkit-scrollbar { width: 8px; }
.pd-log-box::-webkit-scrollbar-track { background: transparent; }
.pd-log-box::-webkit-scrollbar-thumb { 
    background: var(--vscode-scrollbarSlider-background, #c1c1c1); 
    border-radius: 4px; 
}
.pd-log-box::-webkit-scrollbar-thumb:hover { 
    background: var(--vscode-scrollbarSlider-hoverBackground, #a1a1a1); 
}
.pd-log-time {
    color: var(--vscode-descriptionForeground, #999);
    font-size: 11px;
}
.pd-log-info { color: var(--vscode-textLink-foreground, #2196F3); }
.pd-log-success { color: #4CAF50; }
.pd-log-error { color: #f44336; }
.pd-log-warn { color: #FF9800; }

/* Progress Section */
.pd-progress-section {
    background: var(--vscode-editorWidget-background, #fff);
    border-top: 1px solid var(--vscode-panel-border, #e0e0e0);
    padding: 14px 16px;
    flex-shrink: 0;
}
.pd-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.pd-progress-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #555);
}
.pd-elapsed-time {
    font-size: 12px;
    color: var(--vscode-descriptionForeground, #888);
    font-family: 'Consolas', monospace;
}
.pd-elapsed-time span {
    color: var(--vscode-textLink-foreground, #2196F3);
    font-weight: 600;
}
.pd-progress-track {
    width: 100%;
    height: 8px;
    background: var(--vscode-input-background, #e0e0e0);
    border-radius: 4px;
    overflow: hidden;
}
.pd-progress-fill {
    height: 100%;
    width: 0%;
    background: var(--vscode-progressBar-background, #2196F3);
    border-radius: 4px;
    transition: width 0.3s ease;
}
.pd-progress-fill.complete { background: #4CAF50; }
.pd-progress-fill.error { background: #f44336; }
.pd-progress-percent {
    text-align: center;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-textLink-foreground, #2196F3);
    font-family: 'Consolas', monospace;
}

/* Buttons Bar */
.pd-buttons-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--vscode-editorWidget-background, #fff);
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}
.pd-btn {
    padding: 8px 20px;
    border: 1px solid var(--vscode-button-secondaryBackground, #ccc);
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: var(--vscode-button-secondaryBackground, #f0f0f0);
    color: var(--vscode-button-secondaryForeground, #333);
    transition: all 0.15s;
    font-family: inherit;
    min-width: 80px;
}
.pd-btn:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, #e0e0e0);
}
.pd-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.pd-btn-primary {
    background: var(--vscode-button-background, #2196F3);
    border-color: var(--vscode-button-border, #1976D2);
    color: var(--vscode-button-foreground, #fff);
}
.pd-btn-primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground, #1976D2);
}
.pd-btn-danger {
    background: #f44336;
    border-color: #d32f2f;
    color: #fff;
}
.pd-btn-danger:hover:not(:disabled) {
    background: #d32f2f;
}
.pd-btn-success {
    background: #4CAF50;
    border-color: #388e3c;
    color: #fff;
}
.pd-btn-success:hover:not(:disabled) {
    background: #388e3c;
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
        <div id="processAnalysisDialogOverlay"></div>
        <div id="processAnalysisDialog">
            <div id="processAnalysisDialogHeader">
                <div class="pd-header-left">
                    <div class="pd-status-dot" id="pdStatusDot"></div>
                    <span class="pd-title">Start Analysis</span>
                </div>
                <button id="processAnalysisDialogClose" title="Close">×</button>
            </div>
            
            <div class="pd-log-container">
                <div class="pd-log-label">Process Log</div>
                <div class="pd-log-box" id="pdProcessLog"></div>
            </div>
            
            <div class="pd-progress-section">
                <div class="pd-progress-header">
                    <span class="pd-progress-label">Progress</span>
                    <span class="pd-elapsed-time">Elapsed: <span id="pdElapsedTime">0:00</span></span>
                </div>
                <div class="pd-progress-track">
                    <div class="pd-progress-fill" id="pdProgressBar"></div>
                </div>
                <div class="pd-progress-percent" id="pdProgressText">0%</div>
            </div>
            
            <div class="pd-buttons-bar">
                <button class="pd-btn pd-btn-success" id="pdStartBtn">▶ Start</button>
                <button class="pd-btn pd-btn-danger" id="pdStopBtn" disabled>⏹ Stop</button>
                <button class="pd-btn pd-btn-primary" id="pdOkBtn" disabled>✓ OK</button>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    };

    // Cache DOM refs
    this.cacheDOM = function() {
        statusDot = document.getElementById('pdStatusDot');
        processLog = document.getElementById('pdProcessLog');
        progressBar = document.getElementById('pdProgressBar');
        progressText = document.getElementById('pdProgressText');
        elapsedTime = document.getElementById('pdElapsedTime');
        startBtn = document.getElementById('pdStartBtn');
        stopBtn = document.getElementById('pdStopBtn');
        okBtn = document.getElementById('pdOkBtn');
    };

    this.toggle = function() { selfDialog.isVisible ? selfDialog.hide() : selfDialog.show(); };
    
    this.show = function() {
        var dialog = document.getElementById('processAnalysisDialog');
        var overlay = document.getElementById('processAnalysisDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
            if (selfDialog.autoStart && !selfDialog.isRunning) {
                selfDialog.autoStart = false;
                selfDialog.startSimulation();
            }
        }
    };
    
    this.hide = function() {
        var dialog = document.getElementById('processAnalysisDialog');
        var overlay = document.getElementById('processAnalysisDialogOverlay');
        if (dialog) {
            dialog.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.unbindKeyEvents();
            selfDialog.stopElapsedTimer();
        }
    };
    
    this.bindKeyEvents = function() { document.addEventListener('keydown', selfDialog.keyHandler); };
    this.unbindKeyEvents = function() { document.removeEventListener('keydown', selfDialog.keyHandler); };
    
    this.keyHandler = function(e) { 
        if (e.key === 'Escape') { 
            e.preventDefault(); 
            selfDialog.cancelDialog();
            return false; 
        } 
    };
    
    this.setCallbacks = function(onSubmit, onCancel) { 
        selfDialog.onSubmit = onSubmit || null; 
        selfDialog.onCancel = onCancel || null; 
    };


    this.resetDialog = function() {
        selfDialog.isRunning = false;
        selfDialog.progress = 0;
        
        if (processLog) processLog.innerHTML = '';
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.className = 'pd-progress-fill';
        }
        if (progressText) progressText.textContent = '0%';
        if (elapsedTime) elapsedTime.textContent = '0:00';
        if (statusDot) statusDot.className = 'pd-status-dot';
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        if (okBtn) okBtn.disabled = true;
        
        selfDialog.stopElapsedTimer();
    };

    // Log functions
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
        
        var span = document.createElement('span');
        span.className = 'pd-log-' + type;
        span.innerHTML = '<span class="pd-log-time">[' + timeStr + ']</span> ' + message + '\n';
        processLog.appendChild(span);
        processLog.scrollTop = processLog.scrollHeight;
    };

    // Progress functions
    this.setProgress = function(percent) {
        selfDialog.progress = Math.min(100, Math.max(0, percent));
        
        if (progressBar) progressBar.style.width = selfDialog.progress + '%';
        if (progressText) progressText.textContent = Math.round(selfDialog.progress) + '%';
        
        if (selfDialog.progress >= 100 && progressBar) {
            progressBar.classList.add('complete');
        }
    };

    this.setStatus = function(status) {
        if (statusDot) statusDot.className = 'pd-status-dot ' + status;
    };

    // Elapsed time timer
    this.startElapsedTimer = function() {
        selfDialog.startTime = Date.now();
        selfDialog.elapsedTimer = setInterval(function() {
            var elapsed = Math.floor((Date.now() - selfDialog.startTime) / 1000);
            var minutes = Math.floor(elapsed / 60);
            var seconds = elapsed % 60;
            var timeStr = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            if (elapsedTime) elapsedTime.textContent = timeStr;
        }, 1000);
    };

    this.stopElapsedTimer = function() {
        if (selfDialog.elapsedTimer) {
            clearInterval(selfDialog.elapsedTimer);
            selfDialog.elapsedTimer = null;
        }
    };

    // Simulation control
   // Initialize with SPICE code
   this.initData = function(spiceCode) {
       selfDialog.mode = 'spice';
       selfDialog.spiceCode = spiceCode || '';
       selfDialog.pyamsResults = null;
       selfDialog.autoStart = false;
       selfDialog.resetDialog();
    };

   // Initialize with PyAMS code + analysis description, e.g.
   //   analysis = { type:'Time Domain', start:'0s', step:'0.1us', stop:'5ms',
   //                outputs:{ names:['Out1','C1.I'], color:['#00ff00','#ff0000'] } }
   // options.autoStart: start the analysis as soon as the dialog opens.
   this.initPyAMS = function(code, analysis, options) {
       selfDialog.mode = 'pyams';
       selfDialog.pyamsCode = code || '';
       selfDialog.pyamsAnalysis = analysis || {};
       selfDialog.pyamsResults = null;
       selfDialog.autoStart = !!(options && options.autoStart);
       selfDialog.resetDialog();
    };

   // Start simulation with code
   this.startSimulation = function() {
       selfDialog.resetDialog();          // (resets isRunning, so set it afterwards)
       selfDialog.isRunning = true;
       selfDialog.setStatus('running');
       selfDialog.appendLog(selfDialog.mode === 'pyams'
           ? 'Starting PyAMS analysis process...'
           : 'Starting ngspice simulation process...', 'info');
       selfDialog.startElapsedTimer();
    
       if (startBtn) startBtn.disabled = true;
       if (stopBtn) stopBtn.disabled = false;
       if (okBtn) okBtn.disabled = true;
    
       // Send message to extension to start simulation with code
       if (typeof vscode !== 'undefined') {
           if (selfDialog.mode === 'pyams') {
               vscode.postMessage({
                 type: 'startPyAMSAnalysis',
                 code: selfDialog.pyamsCode,
                 analysis: selfDialog.pyamsAnalysis
              });
           } else {
               vscode.postMessage({
                 type: 'startSimulation',
                 code: selfDialog.spiceCode
              });
           }
       }
    };

    this.stopSimulation = function() {
        selfDialog.isRunning = false;
        selfDialog.setStatus('stopped');
        selfDialog.appendLog('Simulation process stopped by user.', 'warn');
        selfDialog.stopElapsedTimer();
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        
        // Send message to extension to stop simulation
        if (typeof vscode !== 'undefined') {
            vscode.postMessage({ type: selfDialog.mode === 'pyams' ? 'stopPyAMSAnalysis' : 'stopSimulation' });
        }
    };

    this.completeSimulation = function(data) {
        selfDialog.isRunning = false;
        selfDialog.setStatus('done');
        selfDialog.setProgress(100);
        selfDialog.stopElapsedTimer();
        
        selfDialog.appendLog('Simulation completed successfully.', 'success');
        
        if (data) {
            if (data.stdout) selfDialog.appendLog(data.stdout, 'info');
            if (data.stderr) selfDialog.appendLog(data.stderr, 'error');
        }
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        if (okBtn) okBtn.disabled = false;
    };

    this.errorSimulation = function(error) {
        selfDialog.isRunning = false;
        selfDialog.setStatus('error');
        if (progressBar) progressBar.classList.add('error');
        selfDialog.stopElapsedTimer();
        
        selfDialog.appendLog('Simulation failed: ' + error, 'error');
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
    };

    // Submit result
    this.submitResult = function() {
        var result = {
            success: true,
            progress: selfDialog.progress,
            data: selfDialog.mode === 'pyams' ? selfDialog.pyamsResults : undefined
        };
        var submitCallback = selfDialog.onSubmit;
        selfDialog.hide();
        if (typeof submitCallback === 'function') submitCallback(result);
        return result;
    };

    this.cancelDialog = function() {
        if (selfDialog.isRunning) {
            selfDialog.stopSimulation();
        }
        var cancelCallback = selfDialog.onCancel;
        selfDialog.hide();
        if (typeof cancelCallback === 'function') cancelCallback();
        return null;
    };

    // VS Code message handler
    this.messageHandler = function(event) {
        var msg = event.data;
        if (!msg || !msg.type) return;
        
        switch (msg.type) {
            case 'simulationProgress':
                selfDialog.setProgress(msg.progress);
                break;

            case 'simulationLog':
                selfDialog.appendLog(msg.message, msg.logType || 'info');
                break;

            case 'simulationComplete':
                selfDialog.completeSimulation(msg.data);
                break;

            case 'simulationError':
                selfDialog.errorSimulation(msg.error);
                break;

            case 'pyamsAnalysisComplete':
                if (selfDialog.mode !== 'pyams' || !selfDialog.isRunning) break;
                selfDialog.pyamsResults = msg.data;
                selfDialog.completeSimulation(null);
                break;

            case 'pyamsAnalysisError':
                if (selfDialog.mode !== 'pyams' || !selfDialog.isRunning) break;
                selfDialog.errorSimulation(msg.error + (msg.line ? '  (line ' + msg.line + ')' : ''));
                break;

            case 'simulationComplete':
               selfDialog.completeSimulation(msg.data);
               selfDialog.simulationResults = msg.data;
                break;
        }
    };

    // Initialize events
    this.init = function() {

        selfDialog.cacheDOM();
        var dialog = document.getElementById('processAnalysisDialog');
        var header = document.getElementById('processAnalysisDialogHeader');
        var closeBtn = document.getElementById('processAnalysisDialogClose');
        var overlay = document.getElementById('processAnalysisDialogOverlay');

        // Button events
        if (startBtn) startBtn.addEventListener('click', function() { selfDialog.startSimulation(); });
        if (stopBtn) stopBtn.addEventListener('click', function() { selfDialog.stopSimulation(); });
        if (okBtn) okBtn.addEventListener('click', function() { selfDialog.submitResult(); });
        if (closeBtn) closeBtn.addEventListener('click', function(e) { e.stopPropagation(); selfDialog.cancelDialog(); });
        if (overlay) overlay.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); });

        // Drag functionality
        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn || closeBtn.contains(e.target)) return;
            isDragging = true;
            var rect = dialog.getBoundingClientRect();
            dialogStartX = rect.left; dialogStartY = rect.top;
            dragStartX = e.clientX; dragStartY = e.clientY;
            dialog.style.transform = 'none';
            dialog.style.left = dialogStartX + 'px'; 
            dialog.style.top = dialogStartY + 'px';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var newX = dialogStartX + (e.clientX - dragStartX);
            var newY = dialogStartY + (e.clientY - dragStartY);
            var viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
            if (newX < 0) newX = 0;
            if (newX + dialog.offsetWidth > viewportWidth) newX = viewportWidth - dialog.offsetWidth;
            if (newY < 0) newY = 0;
            if (newY + dialog.offsetHeight > viewportHeight) newY = viewportHeight - dialog.offsetHeight;
            dialog.style.left = newX + 'px'; 
            dialog.style.top = newY + 'px';
        });
        
        document.addEventListener('mouseup', function() {isDragging = false;});

        // Listen for messages from VS Code
        window.addEventListener('message', selfDialog.messageHandler);
    };

    this.injectCSS();
    this.injectHTML();
    this.init();
}
var processAnalysisDialog;