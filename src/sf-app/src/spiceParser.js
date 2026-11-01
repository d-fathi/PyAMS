/* SPICE (ngspice) output parsing helpers, taken unchanged from the VS Code extension. */
function parseSpiceResults_(stdout, stderr) {
    const results = {
        results: [],
        errors: [],
        warnings: []
    };

    const combinedOutput = stdout + '\n' + stderr;
    const lines = combinedOutput.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('fatal')) {
            results.errors.push(trimmed);
        }
        if (trimmed.toLowerCase().includes('warning')) {
            results.warnings.push(trimmed);
        }
    }

    const allText = combinedOutput;

    // v(node) = value  أو  i(component) = value
    const viPattern = /([vi])\(([a-z0-9_]+)\)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/gi;
    let match;
    while ((match = viPattern.exec(allText)) !== null) {
        const type = match[1].toLowerCase();
        const name = match[2].trim();
        const value = parseFloat(match[3]);
        results.results.push({
            name: `${type}(${name})`,
            value: value,
            formatted: formatValue(value)
        });
    }

    // جدول: node_name   value
    const tablePattern = /^\s*([a-z][a-z0-9_]*)\s+([+-]?\d+\.\d+[eE][+-]?\d+)\s*$/gim;
    while ((match = tablePattern.exec(allText)) !== null) {
        const name = match[1].trim();
        const value = parseFloat(match[2]);
        if (!results.results.find(r => r.name === name)) {
            results.results.push({ name, value, formatted: formatValue(value) });
        }
    }

    // print output
    const printPattern = /^\s*([a-z][a-z0-9_]*)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)\s*$/gim;
    while ((match = printPattern.exec(allText)) !== null) {
        const name = match[1].trim();
        const value = parseFloat(match[2]);
        if (!results.results.find(r => r.name === name)) {
            results.results.push({ name, value, formatted: formatValue(value) });
        }
    }

    return results;
}

function formatValue(value) {
    const absVal = Math.abs(value);
    if (absVal === 0) return '0';
    if (absVal >= 1e9) return (value / 1e9).toFixed(3) + ' G';
    if (absVal >= 1e6) return (value / 1e6).toFixed(3) + ' M';
    if (absVal >= 1e3) return (value / 1e3).toFixed(3) + ' k';
    if (absVal >= 1) return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    if (absVal >= 1e-3) return (value * 1e3).toFixed(3) + ' m';
    if (absVal >= 1e-6) return (value * 1e6).toFixed(3) + ' µ';
    if (absVal >= 1e-9) return (value * 1e9).toFixed(3) + ' n';
    if (absVal >= 1e-12) return (value * 1e12).toFixed(3) + ' p';
    return value.toExponential(3);
}


// Helper: Detect analysis type
function detectAnalysisType(code) {
    if (/\.tran\s+/i.test(code)) return 'tran';
    if (/\.op\s*$/im.test(code)) return 'op';
    if (/\.dc\s+/i.test(code)) return 'dc';
    if (/\.ac\s+/i.test(code)) return 'ac';
    return 'op';
}

// Enhanced parseSpiceResults with analysis type
function parseSpiceResults(stdout, stderr, resultsContent, analysisType) {
    const results = {
        results: [],
        errors: [],
        warnings: [],
        type: analysisType || 'op'
    };

    const combinedOutput = stdout + '\n' + stderr;
    const lines = combinedOutput.split('\n');

    // Extract errors and warnings
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('fatal')) {
            results.errors.push(trimmed);
        }
        if (trimmed.toLowerCase().includes('warning')) {
            results.warnings.push(trimmed);
        }
    }

    // Parse results.txt if exists
    if (resultsContent && resultsContent.trim()) {
        const cleanContent = resultsContent.replace(/\f/g, '\n');
        const contentLines = cleanContent.split('\n');

        const hasTableHeader = contentLines.some(l => 
            l.includes('Index') && (
                l.includes('time') || 
                l.includes('v-sweep') || 
                l.includes('frequency') ||
                l.includes('freq')
            )
        );

        if (hasTableHeader) {
            parseTableData(contentLines, results);
        } else {
            parseOpData(contentLines, results);
        }
        return results;
    }

    // Fallback: parse stdout
    parseStdoutData(combinedOutput, results);
    return results;
}

function parseTableData(contentLines, results) {
    let varNames = [];
    let xAxisName = 'x';
    let dataRows = [];
    let inDataSection = false;

    for (let i = 0; i < contentLines.length; i++) {
        const line = contentLines[i].trim();
        if (!line) continue;

        if (line.includes('---') || line.includes('Analysis') || line.includes('Index')) {
            if (line.includes('Index')) {
                const parts = line.split(/\s+/).filter(p => p && p !== 'Index');
                if (parts.length > 0) {
                    xAxisName = parts[0];
                    varNames = parts.slice(1);
                }
            }
            inDataSection = true;
            continue;
        }

        if (inDataSection) {
            const parts = line.split(/\s+/).filter(p => p);
            if (parts.length >= 3 && !isNaN(parseFloat(parts[0]))) {
                dataRows.push(parts);
            }
        }
    }

    for (let colIdx = 0; colIdx < varNames.length; colIdx++) {
        const list = [];
        for (const row of dataRows) {
            const x = parseFloat(row[1]);
            const value = parseFloat(row[colIdx + 2]);
            if (!isNaN(x) && !isNaN(value)) {
                list.push([x, value]);
            }
        }
        if (list.length > 0) {
            results.results.push({
                name: varNames[colIdx],
                data: list
            });
        }
    }
}

function parseOpData(contentLines, results) {
    for (const line of contentLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^([a-z]\([a-z0-9_]+\))\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/i);
        if (match) {
            const name = match[1];
            const value = parseFloat(match[2]);
            results.results.push({
                name: name,
                value: value,
                formatted: formatValue(value)
            });
        }
    }
}

function parseStdoutData(allText, results) {
    // v(node) = value
    const vPattern = /v\(([a-z0-9_]+)\)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/gi;
    let match;
    while ((match = vPattern.exec(allText)) !== null) {
        const name = match[1].trim();
        const value = parseFloat(match[2]);
        const exists = results.results.find(r => r.name === `v(${name})`);
        if (!exists) {
            results.results.push({ name: `v(${name})`, value: value, formatted: formatValue(value) });
        }
    }

    // Node Voltage table
    const nodeTablePattern = /Node\s+Voltage[\s\S]*?----\s*\n\s*----\s*-------\n([\s\S]*?)(?=\n\s*Source|$)/i;
    const nodeTableMatch = allText.match(nodeTablePattern);
    if (nodeTableMatch) {
        const tableLines = nodeTableMatch[1].split('\n');
        for (const line of tableLines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.includes('----')) continue;
            const nodeMatch = trimmed.match(/^([a-z][a-z0-9_]*)\s+([+-]?\d+\.\d+[eE][+-]?\d+)/i);
            if (nodeMatch) {
                const name = nodeMatch[1].trim();
                const value = parseFloat(nodeMatch[2]);
                const exists = results.results.find(r => r.name === `v(${name})`);
                if (!exists) {
                    results.results.push({ name: `v(${name})`, value: value, formatted: formatValue(value) });
                }
            }
        }
    }

    // Add GND
    const hasVoltages = results.results.some(r => r.name.startsWith('v('));
    if (hasVoltages && !results.results.find(r => r.name === 'v(0)')) {
        results.results.unshift({ name: 'v(0)', value: 0, formatted: '0' });
    }
}

module.exports = { parseSpiceResults, parseSpiceResults_, detectAnalysisType, formatValue };
