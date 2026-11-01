/*
 * Bridge between the PyAMS editor page (written for a VS Code webview) and the Electron host.
 *
 *   acquireVsCodeApi().postMessage(msg)  ->  main process (ipc "host:post")
 *   main process (ipc "host:message")    ->  window "message" event with {data: msg}
 *
 * so every file in media/ keeps working unchanged.
 */
(function () {
    'use strict';

    var host = window.pyamsHost;
    var info = (host && host.info) || {};

    // Globals that the VS Code extension injected into the page
    window.extensionPath = info.extensionPath || '';
    window.libraryPath = info.libraryPath || '';
    window.workspacePath = info.workspacePath || '';

    function $(id) { return document.getElementById(id); }

    // Cursor position / zoom were shown in the VS Code status bar: show them in the page status bar.
    function handleLocal(msg) {
        if (msg.type === 'zoomChanged') {
            var z = $('sbZoom');
            if (z) z.textContent = Math.round(msg.zoom * 100) + '%';
            return true;
        }
        if (msg.type === 'cursorPos') {
            var p = $('sbPos');
            if (p) p.textContent = msg.pos ? 'X: ' + msg.pos.x + '  Y: ' + msg.pos.y : '';
            return true;
        }
        return false;
    }

    var api = {
        postMessage: function (msg) {
            if (!msg || typeof msg !== 'object') return;
            if (handleLocal(msg)) return;
            if (host) host.post(msg);
        },
        getState: function () { return undefined; },
        setState: function () { }
    };

    window.acquireVsCodeApi = function () { return api; };

    if (host) {
        host.onMessage(function (msg) {
            window.dispatchEvent(new MessageEvent('message', { data: msg }));
        });
    }
})();
