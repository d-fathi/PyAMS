(function () {
    'use strict';
    function show(name) {
        document.querySelectorAll('.tab-content').forEach(function (t) { t.classList.toggle('active', t.id === name); });
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); });
    }
    document.querySelectorAll('.tab-btn').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.tab); }); });
    document.addEventListener('click', function (e) {
        var a = e.target.closest('[data-url]');
        if (a) { e.preventDefault(); window.pyamsAbout.openUrl(a.dataset.url); }
    });
    document.getElementById('okBtn').addEventListener('click', function () { window.pyamsAbout.close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter') window.pyamsAbout.close(); });

    function row(cls, letter, name, version, license, ok) {
        var li = document.createElement('li');
        var icon = document.createElement('div'); icon.className = 'lib-icon ' + cls; icon.textContent = letter;
        var info = document.createElement('div'); info.className = 'lib-info';
        var n = document.createElement('div'); n.className = 'lib-name'; n.textContent = name;
        var v = document.createElement('div'); v.className = 'lib-version'; v.textContent = version;
        if (ok === false) v.classList.add('miss');
        info.appendChild(n); info.appendChild(v);
        var l = document.createElement('span'); l.className = 'lib-license'; l.textContent = license;
        li.appendChild(icon); li.appendChild(info); li.appendChild(l);
        return li;
    }

    window.pyamsAbout.getInfo().then(function (i) {
        document.getElementById('version').textContent = 'PyAMS v' + i.version;
        var ul = document.getElementById('software-list');
        function py(v) { return v ? v : 'not found'; }
        ul.appendChild(row('lib-electron', 'E', 'Electron', i.electron, 'MIT'));
        ul.appendChild(row('lib-chromium', 'C', 'Chromium', i.chrome, 'BSD'));
        ul.appendChild(row('lib-node', 'N', 'Node.js', i.node, 'MIT'));
        ul.appendChild(row('lib-plotly', 'P', 'Plotly.js', i.plotly, 'MIT'));
        ul.appendChild(row('lib-py', 'Py', 'Python', py(i.python), 'PSF', !!i.python));
        ul.appendChild(row('lib-numpy', 'Np', 'NumPy', py(i.numpy), 'BSD', !!i.numpy));
        ul.appendChild(row('lib-mpl', 'Mp', 'Matplotlib', py(i.matplotlib), 'PSF', !!i.matplotlib));
    });
})();
