'use strict';
/* Tiny JSON settings store kept in the user-data folder of the application. */

const fs = require('fs');
const path = require('path');

class Settings {
    constructor(dir) {
        this.file = path.join(dir, 'settings.json');
        this.data = { pythonPath: '', recent: [], lastDir: '' };
        this.load();
    }

    load() {
        try {
            const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
            if (parsed && typeof parsed === 'object') this.data = Object.assign(this.data, parsed);
        } catch (e) { /* first run or unreadable file: keep defaults */ }
        if (!Array.isArray(this.data.recent)) this.data.recent = [];
    }

    save() {
        try {
            fs.mkdirSync(path.dirname(this.file), { recursive: true });
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (e) {
            console.warn('Could not save settings:', e.message);
        }
    }

    get(key) { return this.data[key]; }

    set(key, value) { this.data[key] = value; this.save(); }

    addRecent(filePath) {
        const list = this.data.recent.filter(p => p !== filePath);
        list.unshift(filePath);
        this.data.recent = list.slice(0, 12);
        this.save();
    }

    removeRecent(filePath) {
        this.data.recent = this.data.recent.filter(p => p !== filePath);
        this.save();
    }

    clearRecent() {
        this.data.recent = [];
        this.save();
    }
}

module.exports = Settings;
