/*
#--------------------------------------------------------------------------------------------------
Name:        symbolsSync.js
Author:      d.fathi
Created:     28/08/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
Description: Module to scan symbols folder and sync data.json with robust regex
*/

const fs = require('fs');
const path = require('path');

// folders that never hold project symbols
const IGNORED_DIRS = new Set(['node_modules', '.git', '.vscode', '.venv', 'venv', '__pycache__']);

class SymbolsSync {
    // list name -> absolute folder, for the symbols found in the workspace (updated by each sync)
    static workspaceDirs = new Map();

    // .sym files of the workspace folders (and their sub folders), added at the end of the list:
    //   { dirs:[ 'Project', 'Project/analog' ], 'Project':[ 'A.sym' ], 'Project/analog':[ 'B.sym' ] }
    // symbolsDir (the extension's own library) is skipped, it is already in the list.
    static scanWorkspace(symbolsDir) {
        const found = { dirs: [] };
        SymbolsSync.workspaceDirs = new Map();
        let folders = [];
        try { folders = require('vscode').workspace.workspaceFolders || []; } catch (e) { return found; }

        const inside = (child, parent) => {
            const r = path.relative(parent, child);
            return r === '' || (!r.startsWith('..') && !path.isAbsolute(r));
        };

        for (const folder of folders) {
            const root = folder.uri.fsPath;
            const label = folders.length > 1 ? 'Project[' + folder.name + ']' : 'Project';

            const scan = (dirPath, rel) => {
                if (inside(dirPath, symbolsDir)) return;
                let entries;
                try { entries = fs.readdirSync(dirPath, { withFileTypes: true }); } catch (e) { return; }
                const files = entries
                    .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.sym'))
                    .map(e => e.name)
                    .sort((a, b) => a.localeCompare(b));
                if (files.length > 0) {
                    const key = rel ? label + '/' + rel : label;
                    found.dirs.push(key);
                    found[key] = files;
                    SymbolsSync.workspaceDirs.set(key, dirPath);
                }
                entries
                    .filter(e => e.isDirectory() && !IGNORED_DIRS.has(e.name) && !e.name.startsWith('.'))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .forEach(e => scan(path.join(dirPath, e.name), rel ? rel + '/' + e.name : e.name));
            };
            scan(root, '');
        }
        return found;
    }

    static async sync(document, context) {
        const extPath = context.extensionPath;
        const symbolsDir = path.join(extPath, 'symbols');
        const dataJsonPath = path.join(extPath, 'data.json');

        // Read the current data.json
        let currentData = { dirs: [], Amplifier: [], Basic: [], Digital: [], Semiconductor: [], Source: [] };
        if (fs.existsSync(dataJsonPath)) {
            try {
                currentData = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
            } catch (e) {
                console.error('Error reading data.json:', e);
            }
        }

        // Preserve the old order
        const oldDirsOrder = currentData.dirs || [];
        const oldFilesOrder = {};
        for (const key of Object.keys(currentData)) {
            if (key !== 'dirs' && Array.isArray(currentData[key])) {
                oldFilesOrder[key] = currentData[key];
            }
        }

        // Read the actual directories and files
        const newDirs = [];
        const newFilesMap = {};

        function scanDir(dirPath, relativePath) {
            if (!fs.existsSync(dirPath)) return;
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            const subDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
            const symFiles = entries
                .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.sym'))
                .map(e => e.name);

            if (relativePath !== '' && (subDirs.length > 0 || symFiles.length > 0)) {
                newDirs.push(relativePath);
            }
            if (symFiles.length > 0) {
                newFilesMap[relativePath] = symFiles;
            }

            for (const sub of subDirs) {
                const subPath = path.join(dirPath, sub);
                const subRelative = relativePath ? `${relativePath}/${sub}` : sub;
                scanDir(subPath, subRelative);
            }
        }

        scanDir(symbolsDir, '');

        // Preserve the old order and remove missing items
        const syncedDirs = oldDirsOrder.filter(d => newDirs.includes(d));
        const syncedFiles = {};
        for (const key of Object.keys(oldFilesOrder)) {
            if (newDirs.includes(key) || newFilesMap[key]) {
                syncedFiles[key] = oldFilesOrder[key].filter(f =>
                    newFilesMap[key] && newFilesMap[key].includes(f)
                );
            }
        }

        // Add new items
        for (const d of newDirs) {
            if (!syncedDirs.includes(d)) {
                syncedDirs.push(d);
            }
            if (newFilesMap[d]) {
                if (!syncedFiles[d]) syncedFiles[d] = [];
                for (const f of newFilesMap[d]) {
                    if (!syncedFiles[d].includes(f)) {
                        syncedFiles[d].push(f);
                    }
                }
            }
        }

        // Build the final object
        const result = { dirs: syncedDirs };
        for (const key of Object.keys(syncedFiles)) {
            result[key] = syncedFiles[key];
        }

        // Write data.json
        try {
            fs.writeFileSync(dataJsonPath, JSON.stringify(result, null, 4), 'utf8');
        } catch (e) {
            console.error('Error writing data.json:', e);
        }

        // symbols of the opened project: appended at the end of the list, not saved in data.json
        const ws = SymbolsSync.scanWorkspace(symbolsDir);
        const view = { dirs: result.dirs.slice() };
        for (const key of Object.keys(result)) if (key !== 'dirs') view[key] = result[key];
        for (const d of ws.dirs) {
            if (view.dirs.includes(d)) continue;
            view.dirs.push(d);
            view[d] = ws[d];
        }
        return view;
    }
}

module.exports = SymbolsSync;