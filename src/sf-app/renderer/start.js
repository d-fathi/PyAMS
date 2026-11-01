'use strict';

function render(list, items, action, emptyText) {
    list.textContent = '';
    if (!items.length) {
        var li = document.createElement('li');
        li.className = 'empty';
        li.textContent = emptyText;
        list.appendChild(li);
        return;
    }
    items.forEach(function (item) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        var name = document.createElement('span');
        name.className = 'name';
        name.textContent = item.name;
        btn.appendChild(name);
        if (item.dir) {
            var dir = document.createElement('span');
            dir.className = 'dir';
            dir.textContent = item.dir;
            btn.title = item.path;
            btn.appendChild(dir);
        }
        btn.addEventListener('click', function () { window.pyamsStart.action(action, item.path); });
        li.appendChild(btn);
        list.appendChild(li);
    });
}

document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (el) window.pyamsStart.action(el.getAttribute('data-action'));
});

window.pyamsStart.getInfo().then(function (info) {
    document.getElementById('version').textContent = 'Version ' + info.version;
    render(document.getElementById('recent'), info.recent, 'open-recent', 'No recent files');
    render(document.getElementById('examples'), info.examples, 'open-example', 'No examples found');
});
