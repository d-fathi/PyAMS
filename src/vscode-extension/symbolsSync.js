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

class SymbolsSync {
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
            return result;
        } catch (e) {
            console.error('Error writing data.json:', e);
            return null;
        }
    }
}

module.exports = SymbolsSync;