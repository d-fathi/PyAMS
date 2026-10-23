/*
#--------------------------------------------------------------------------------------------------
Name:        librarySync.js
Author:      d.fathi
Created:     05/09/2026
Updated:     21/10/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Module to scan library files and parse SPICE models/subcircuits with robust regex
*/

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

class LibrarySync {

/**
 * Run `python <args>` trying the usual interpreter names in turn
 * (PYAMS_PYTHON, then python / py -3 / python3 on Windows, python3 / python elsewhere).
 * @param {string[]} args - Arguments after the interpreter (script path, ...)
 * @param {{cwd?: string, env?: object, timeout?: number, onSpawn?: function, onStdout?: function}} [options]
 *        onSpawn(child) is called when the process starts (to be able to kill it),
 *        onStdout(text) receives the output while the process is running.
 * @returns {Promise<{stdout: string, stderr: string, code: number|null, error?: string}>}
 */
static runPython(args, options = {}) {
    const candidates = [];
    if (process.env.PYAMS_PYTHON) candidates.push([process.env.PYAMS_PYTHON]);
    if (process.platform === 'win32') {
        candidates.push(['python'], ['py', '-3'], ['python3']);
    } else {
        candidates.push(['python3'], ['python']);
    }
    const timeout = options.timeout || 30000;

    const tryRun = (index, lastError) => new Promise((resolve) => {
        if (index >= candidates.length) {
            resolve({ stdout: '', stderr: '', code: null,
                error: 'Python not found. ' + (lastError || '') +
                    ' Install Python or set the PYAMS_PYTHON environment variable.' });
            return;
        }
        const cmd = candidates[index];
        const child = spawn(cmd[0], cmd.slice(1).concat(args), {
            cwd: options.cwd,
            env: options.env || process.env,
            windowsHide: true
        });
        if (typeof options.onSpawn === 'function') options.onSpawn(child);
        let stdout = '';
        let stderr = '';
        let settled = false;
        const finish = (value) => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } };
        const timer = setTimeout(() => {
            child.kill();
            finish({ stdout, stderr, code: null, error: 'Python process timed out' });
        }, timeout);

        child.stdout.on('data', (d) => {
            const text = d.toString('utf8');
            stdout += text;
            if (typeof options.onStdout === 'function') options.onStdout(text);
        });
        child.stderr.on('data', (d) => { stderr += d.toString('utf8'); });
        child.on('error', (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            // this interpreter name is not available: try the next one
            tryRun(index + 1, err.message).then(resolve);
        });
        child.on('close', (code) => finish({ stdout, stderr, code }));
    });

    return tryRun(0, '');
}

/**
 * Run a Python process (pyams/scanModels.py) that searches the PyAMS models
 * folder for every `class Name(model)` and returns the files, classes and
 * class source code.
 * @param {string} extensionPath - The extension root path
 * @returns {Promise<{files: Array, error?: string}>}
 */
static async scanPyamsModels(extensionPath) {
    const modelsDir = path.join(extensionPath, 'pyams', 'models');
    const script = path.join(extensionPath, 'pyams', 'scanModels.py');

    if (!fs.existsSync(modelsDir)) {
        return { files: [], error: 'Models folder not found: ' + modelsDir };
    }
    if (!fs.existsSync(script)) {
        return { files: [], error: 'Script not found: ' + script };
    }

    // -I: isolated mode, the script only parses files and never imports them
    const run = await LibrarySync.runPython(['-I', script, modelsDir]);
    if (run.error && !run.stdout) return { files: [], error: run.error };
    try {
        const data = JSON.parse(run.stdout);
        if (run.code !== 0 && !data.error) data.error = run.stderr.trim() || ('Python exited with code ' + run.code);
        return data;
    } catch (e) {
        return { files: [], error: run.stderr.trim() || ('Invalid output from Python (exit code ' + run.code + ')') };
    }
}

/**
 * Execute PyAMS code in a Python process (pyams/listParameters.py) and return,
 * as a JSON object, every model instance the code creates (e.g.
 * `Rc1 = Resistor("Vcc","Out1"); Rc1.setParams("R=1KΩ")`): constructor
 * arguments, setParams() calls, signals and parameters
 * (value, default, unit, description).
 * @param {string} extensionPath - The extension root path
 * @param {string} code - Python code using pyams.models
 * @returns {Promise<{models: Array, error: string|null, stdout?: string}>}
 */
static async listParameters(extensionPath, code) {
    const script = path.join(extensionPath, 'pyams', 'listParameters.py');
    if (!fs.existsSync(script)) {
        return { models: [], error: 'Script not found: ' + script };
    }
    const tmpFile = path.join(os.tmpdir(), 'pyams_params_' + Date.now() + '_' +
        Math.random().toString(36).slice(2) + '.py');
    try {
        fs.writeFileSync(tmpFile, String(code || ''), 'utf8');
        const run = await LibrarySync.runPython([script, extensionPath, tmpFile], {
            cwd: os.tmpdir(),
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
            timeout: 60000
        });
        if (run.error && !run.stdout) return { models: [], error: run.error };
        try {
            return JSON.parse(run.stdout);
        } catch (e) {
            return { models: [], error: run.stderr.trim() || ('Invalid output from Python (exit code ' + run.code + ')') };
        }
    } finally {
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
    }
}

/**
 * Run a PyAMS circuit analysis (pyams/runAnalysis.py) and report its progress.
 * @param {string} extensionPath - The extension root path
 * @param {string} code - PyAMS code creating the elements
 * @param {object} analysis - {type, start, step, stop, outputs:{names, color}, ...}
 * @param {function} onEvent - called with {event:'log'|'progress'|'result'|'error', ...}
 * @returns {{kill: function, done: Promise}} kill() stops the analysis (no event is sent afterwards)
 */
static startPyAMSAnalysis(extensionPath, code, analysis, onEvent) {
    const script = path.join(extensionPath, 'pyams', 'runAnalysis.py');
    const base = path.join(os.tmpdir(), 'pyams_run_' + Date.now() + '_' + Math.random().toString(36).slice(2));
    const codeFile = base + '.py';
    const analysisFile = base + '.json';
    let child = null;
    let killed = false;
    let finished = false;      // a 'result' or 'error' event was delivered

    const send = (ev) => {
        if (killed) return;
        if (ev.event === 'result' || ev.event === 'error') finished = true;
        try { onEvent(ev); } catch (e) { /* ignore */ }
    };

    let buffer = '';
    const onStdout = (text) => {
        buffer += text;
        let nl;
        while ((nl = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            try { send(JSON.parse(line)); }
            catch (e) { send({ event: 'log', message: line, level: 'info' }); }
        }
    };

    const done = (async () => {
        try {
            if (!fs.existsSync(script)) {
                send({ event: 'error', message: 'Script not found: ' + script });
                return;
            }
            fs.writeFileSync(codeFile, String(code || ''), 'utf8');
            fs.writeFileSync(analysisFile, JSON.stringify(analysis || {}), 'utf8');
            const run = await LibrarySync.runPython([script, extensionPath, codeFile, analysisFile], {
                cwd: os.tmpdir(),
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
                timeout: 30 * 60 * 1000,
                onSpawn: (c) => { child = c; },
                onStdout
            });
            if (buffer.trim()) onStdout('\n');
            if (!finished) {
                send({ event: 'error', message: run.error || run.stderr.trim() ||
                    ('Python exited with code ' + run.code) });
            }
        } finally {
            try { fs.unlinkSync(codeFile); } catch (e) { /* ignore */ }
            try { fs.unlinkSync(analysisFile); } catch (e) { /* ignore */ }
        }
    })();

    return {
        kill: () => { killed = true; if (child) child.kill(); },
        done
    };
}

}

module.exports = LibrarySync;