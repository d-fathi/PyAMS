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

    var api = {
        postMessage: function (msg) {
            if (!msg || typeof msg !== 'object') return;
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
