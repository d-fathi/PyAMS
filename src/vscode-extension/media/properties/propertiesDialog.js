/*
#--------------------------------------------------------------------------------------------------
Name:        propertiesDialog.js
Author:      d.fathi
Created:     30/08/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/

//------------------Class for Properties Dialog-----------------------------------------------------//

function fpropertiesPanel(self) {
    var selfPanel = this;
    selfPanel.drawing = self;
    selfPanel.currentData = null;

    // Drag state
    var isDragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var panelStartX = 0;
    var panelStartY = 0;
    var isPositionSet = false;

    // Inject CSS
    this.injectCSS = function() {
        var css = `
        #propertiesPanel {
            position: absolute;
            top: 50px;
            right: 20px;
            width: 320px;
            background: var(--vscode-editorWidget-background, white);
            border: 1px solid var(--vscode-editorWidget-border, #ccc);
            border-radius: 6px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 2000;
            display: none;
            font-family: var(--vscode-font-family, verdana);
            font-size: var(--vscode-font-size, 12px);
            color: var(--vscode-editor-foreground, #333);
            max-height: 90vh;
            overflow-y: auto;
        }
        #propertiesPanel.visible { display: block; }
        #propertiesPanelHeader {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            border-bottom: 1px solid var(--vscode-panel-border, #eee);
            background: var(--vscode-titleBar-activeBackground, #fafafa);
            border-radius: 6px 6px 0 0;
            cursor: move;
            user-select: none;
        }
        #propertiesPanelHeader:hover { background: var(--vscode-list-hoverBackground, #f0f0f0); }
        #propertiesPanelTitle { font-size: 14px; font-weight: bold; color: var(--vscode-editor-foreground, #333); }
        #propertiesPanelSubtitle { font-size: 11px; color: var(--vscode-descriptionForeground, #666); margin-left: 8px; }
        #propertiesPanelClose {
            background: transparent; border: none; font-size: 18px; cursor: pointer;
            color: var(--vscode-icon-foreground, #666); padding: 0 4px; line-height: 1; border-radius: 3px;
        }
        #propertiesPanelClose:hover { background: var(--vscode-list-hoverBackground, #e0e0e0); color: var(--vscode-editor-foreground, #333); }
        
        .prop-section { border-bottom: 1px solid var(--vscode-panel-border, #eee); }
        .prop-section-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 12px; background: var(--vscode-sideBarSectionHeader-background, #f5f5f5);
            cursor: pointer; user-select: none; font-weight: bold; font-size: 12px;
            color: var(--vscode-editor-foreground, #333);
        }
        .prop-section-header:hover { background: var(--vscode-list-hoverBackground, #ebebeb); }
        .prop-section-content { padding: 8px 12px; }
        .prop-section-content.hidden { display: none; }
        
        .prop-row { display: flex; align-items: center; margin-bottom: 6px; min-height: 28px; }
        .prop-row-label { flex: 1; color: var(--vscode-foreground, #555); font-size: 11px; padding-right: 8px; }
        .prop-row-control { flex: 1.5; display: flex; align-items: center; gap: 4px; }
        
        .prop-input, .prop-select, .prop-button, .prop-color-text {
            width: 100%; padding: 4px 6px; border: 1px solid var(--vscode-input-border, #ccc);
            border-radius: 3px; font-size: 11px; font-family: var(--vscode-font-family, verdana);
            box-sizing: border-box; background: var(--vscode-input-background, white);
            color: var(--vscode-input-foreground, #333);
        }
        .prop-input:focus, .prop-select:focus { outline: none; border-color: var(--vscode-focusBorder, #4a90e2); }
        .prop-input[type="number"] { text-align: right; }
        .prop-button { cursor: pointer; text-align: center; }
        .prop-button:hover { background: var(--vscode-list-hoverBackground, #f0f0f0); }
        
        .prop-color-picker {
            width: 24px; height: 24px; border: 1px solid var(--vscode-input-border, #ccc);
            border-radius: 3px; cursor: pointer; padding: 0;
        }
        .prop-color-reset, .prop-axis-delete {
            background: transparent; border: none; cursor: pointer;
            font-size: 14px; color: var(--vscode-icon-foreground, #666); padding: 2px 4px;
        }
        .prop-color-reset:hover { color: var(--vscode-editor-foreground, #333); }
        .prop-axis-delete:hover { color: #e74c3c; }
        
        .prop-reset-btn {
            width: 100%; padding: 6px; background: var(--vscode-button-secondaryBackground, white);
            border: 1px solid var(--vscode-button-border, #4a90e2); border-radius: 3px;
            color: var(--vscode-button-foreground, #4a90e2); cursor: pointer; font-size: 11px;
            font-family: var(--vscode-font-family, verdana); margin-top: 8px;
        }
        .prop-reset-btn:hover { background: var(--vscode-button-secondaryHoverBackground, #f0f7ff); }

        /* Editable Dropdown Styles */
        .pedit-wrap { position: relative; width: 100%; }
        .pedit-input-wrap { display: flex; border: 1px solid var(--vscode-input-border, #ccc); border-radius: 3px; background: var(--vscode-input-background, white); }
        .pedit-input { flex: 1; border: none; padding: 4px 6px; font-size: 11px; background: transparent; color: var(--vscode-input-foreground, #333); outline: none; }
        .pedit-btn { background: transparent; border: none; border-left: 1px solid var(--vscode-input-border, #ccc); cursor: pointer; padding: 0 6px; color: var(--vscode-icon-foreground, #666); }
        .pedit-btn:hover { background: var(--vscode-list-hoverBackground, #f0f0f0); }
        .pedit-list {
            position: absolute; top: 100%; left: 0; right: 0; background: var(--vscode-input-background, white);
            border: 1px solid var(--vscode-input-border, #ccc); border-radius: 3px; max-height: 150px;
            overflow-y: auto; z-index: 10; display: none; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .pedit-list.show { display: block; }
        .pedit-item { padding: 4px 6px; cursor: pointer; font-size: 11px; color: var(--vscode-input-foreground, #333); }
        .pedit-item:hover, .pedit-item.active { background: var(--vscode-list-hoverBackground, #f0f0f0); }
        .pedit-item.matched { font-weight: bold; }

        /* Axis Property Styles */
        .prop-axis-wrapper { display: flex; align-items: center; gap: 4px; width: 100%; }
        `;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet) style.styleSheet.cssText = css;
        else style.appendChild(document.createTextNode(css));
    };

    // Inject HTML
    this.injectHTML = function() {
        var panelHTML = `
        <div id="propertiesPanel">
            <div id="propertiesPanelHeader">
                <div>
                    <span id="propertiesPanelTitle">Properties</span>
                    <span id="propertiesPanelSubtitle"></span>
                </div>
                <button id="propertiesPanelClose" title="Close">×</button>
            </div>
            <div id="propertiesPanelBody"></div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', panelHTML);
    };

    // Create Dropdown Edit (from properties_panel.js)
    this.createDropdownEdit = function(options, value, onChange) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pedit-wrap';
        const inputWrap = document.createElement('div');
        inputWrap.className = 'pedit-input-wrap';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'pedit-input';
        input.value = value;
        input.autocomplete = 'off';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pedit-btn';
        btn.innerHTML = '▼';
        inputWrap.appendChild(input);
        inputWrap.appendChild(btn);
        wrapper.appendChild(inputWrap);
        
        const list = document.createElement('div');
        list.className = 'pedit-list';
        (options || []).forEach(opt => {
            const item = document.createElement('div');
            item.className = 'pedit-item';
            item.dataset.value = opt;
            item.textContent = opt;
            list.appendChild(item);
        });
        wrapper.appendChild(list);
        
        let isOpen = false;
        let activeIndex = -1;
        const items = Array.from(list.querySelectorAll('.pedit-item'));

        function show() { isOpen = true; list.classList.add('show'); btn.innerHTML = '▲'; jumpToMatch(); }
        function hide() { isOpen = false; list.classList.remove('show'); btn.innerHTML = '▼'; activeIndex = -1; items.forEach(i => i.classList.remove('active', 'matched')); }
        function toggle() { isOpen ? hide() : show(); }
        function jumpToMatch() {
            const val = input.value.trim();
            items.forEach(i => i.classList.remove('active', 'matched'));
            if (!val) { activeIndex = -1; return; }
            const idx = items.findIndex(item => item.textContent.toLowerCase().startsWith(val.toLowerCase()));
            if (idx !== -1) {
                activeIndex = idx;
                items[idx].classList.add('active', 'matched');
                items[idx].scrollIntoView({ block: 'nearest' });
            } else activeIndex = -1;
        }
        function select(item) { input.value = item.dataset.value; hide(); onChange(item.dataset.value); }
        
        input.addEventListener('input', () => { if (!isOpen) show(); else jumpToMatch(); onChange(input.value); });
        input.addEventListener('focus', () => { if (!isOpen) show(); });
        btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); if (isOpen) input.focus(); });
        items.forEach(item => item.addEventListener('click', () => select(item)));
        
        input.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (!isOpen) show();
                    items.forEach(i => i.classList.remove('active'));
                    if (activeIndex < items.length - 1) activeIndex++;
                    items[activeIndex].classList.add('active');
                    items[activeIndex].scrollIntoView({ block: 'nearest' });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (activeIndex > 0) {
                        items.forEach(i => i.classList.remove('active'));
                        activeIndex--;
                        items[activeIndex].classList.add('active');
                        items[activeIndex].scrollIntoView({ block: 'nearest' });
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (isOpen && activeIndex >= 0 && items[activeIndex]) select(items[activeIndex]);
                    else { hide(); onChange(input.value); }
                    break;
                case 'Escape': hide(); break;
            }
        });
        
        document.addEventListener('click', (e) => { if (!wrapper.contains(e.target)) hide(); });
        input.addEventListener('blur', () => {
            setTimeout(() => { if (!list.matches(':hover') && !btn.matches(':hover')) hide(); }, 150);
        });
        return wrapper;
    };

    // Build panel content from data
    this.buildContent = function(data) {
        var body = document.getElementById('propertiesPanelBody');
        var title = document.getElementById('propertiesPanelTitle');
        var subtitle = document.getElementById('propertiesPanelSubtitle');
        if (!body) return;

        title.textContent = data.header.title;
        subtitle.textContent = data.header.subtitle;
        body.innerHTML = '';

        data.sections.forEach(function(section, sectionIndex) {
            var sectionDiv = document.createElement('div');
            sectionDiv.className = 'prop-section';

            var header = document.createElement('div');
            header.className = 'prop-section-header' + (section.collapsed ? ' collapsed' : '');
            header.innerHTML = '<span>' + section.title + '</span><span class="toggle-icon">▼</span>';
            header.addEventListener('click', function() {
                header.classList.toggle('collapsed');
                content.classList.toggle('hidden');
            });
            sectionDiv.appendChild(header);

            var content = document.createElement('div');
            content.className = 'prop-section-content' + (section.collapsed ? ' hidden' : '');

            section.rows.forEach(function(row, rowIndex) {
                var rowDiv = document.createElement('div');
                rowDiv.className = 'prop-row';
                var label = document.createElement('div');
                label.className = 'prop-row-label';
                label.textContent = row.label;
                rowDiv.appendChild(label);

                var control = document.createElement('div');
                control.className = 'prop-row-control';

                switch(row.type) {
                    case 'number':
                    case 'text':
                        var input = document.createElement('input');
                        input.type = row.type;
                        input.className = 'prop-input';
                        input.value = row.value;
                        if (row.readonly) input.setAttribute('readonly', true);
                        if (row.type === 'number' && row.condition) {
                            row.condition.forEach(function(cond) {
                                if (cond[0] === 'min') input.min = cond[1];
                                if (cond[0] === 'max') input.max = cond[1];
                            });
                        }
                        input.addEventListener('input', function(e) {
                            data.sections[sectionIndex].rows[rowIndex].value = e.target.value;
                            updatePreview();
                        });
                        control.appendChild(input);
                        break;

                    case 'button':
                        var btn = document.createElement('button');
                        btn.className = 'prop-button prop-input';
                        btn.textContent = row.value;
                        control.appendChild(btn);
                        break;

                    
                    case 'Button':
                        var btn = document.createElement('input');
                        btn.type = 'button';
                        btn.className = 'prop-button prop-input';
                        btn.value = row.value;
                        btn.addEventListener('click', () => { getDialog(row.setClick)});
                        control.appendChild(btn);

                        break;

                    case 'dropdown':
                        var select = document.createElement('select');
                        select.className = 'prop-select';
                        (row.options || []).forEach(function(opt) {
                            var option = document.createElement('option');
                            option.value = opt;
                            option.textContent = opt;
                            if (opt === row.value) option.selected = true;
                            select.appendChild(option);
                        });
                        select.addEventListener('change', function(e) {
                            data.sections[sectionIndex].rows[rowIndex].value = e.target.value;
                            updatePreview();
                        });
                        control.appendChild(select);
                        break;

                    case 'dropdownedit':
                        var combo = selfPanel.createDropdownEdit(row.options, row.value, function(newValue) {
                            data.sections[sectionIndex].rows[rowIndex].value = newValue;
                            updatePreview();
                        });
                        control.appendChild(combo);
                        break;

                    case 'color':
                        var wrapper = document.createElement('div');
                        wrapper.style.display = 'flex';
                        wrapper.style.alignItems = 'center';
                        wrapper.style.gap = '4px';
                        wrapper.style.width = '100%';

                        var colorPicker = document.createElement('input');
                        colorPicker.type = 'color';
                        colorPicker.className = 'prop-color-picker';
                        colorPicker.value = row.color || '#000000';

                        var colorText = document.createElement('input');
                        colorText.type = 'text';
                        colorText.className = 'prop-color-text';
                        colorText.value = row.value;
                        colorText.style.flex = '1';

                        var resetBtn = document.createElement('button');
                        resetBtn.className = 'prop-color-reset';
                        resetBtn.innerHTML = '↺';
                        resetBtn.title = 'Reset to default';
                        resetBtn.addEventListener('click', function() {
                            colorPicker.value = row.color || '#000000';
                            colorText.value = row.value;
                            data.sections[sectionIndex].rows[rowIndex].color = row.color;
                            data.sections[sectionIndex].rows[rowIndex].value = row.value;
                            updatePreview();
                        });

                        colorPicker.addEventListener('input', function() {
                            colorText.value = colorPicker.value;
                            data.sections[sectionIndex].rows[rowIndex].color = colorPicker.value;
                            data.sections[sectionIndex].rows[rowIndex].value = colorPicker.value;
                            updatePreview();
                        });

                        colorText.addEventListener('change', function() {
                            if (/^#[0-9A-F]{6}$/i.test(colorText.value)) {
                                colorPicker.value = colorText.value;
                                data.sections[sectionIndex].rows[rowIndex].color = colorText.value;
                                data.sections[sectionIndex].rows[rowIndex].value = colorText.value;
                                updatePreview();
                            }
                        });

                        wrapper.appendChild(colorPicker);
                        wrapper.appendChild(colorText);
                        wrapper.appendChild(resetBtn);
                        control.appendChild(wrapper);
                        break;

                    case 'axeproperty':
                        var axisWrapper = document.createElement('div');
                        axisWrapper.className = 'prop-axis-wrapper';

                        var axisColorPicker = document.createElement('input');
                        axisColorPicker.type = 'color';
                        axisColorPicker.className = 'prop-color-picker';
                        axisColorPicker.value = row.color || '#000000';
                        if (row.setChange) axisColorPicker.setAttribute('onchange', row.setChange);
                        axisColorPicker.addEventListener('input', function(e) {
                            var hex = e.target.value;
                            data.sections[sectionIndex].rows[rowIndex].color = hex;
                            data.sections[sectionIndex].rows[rowIndex].value = hex;
                            axisColorText.textContent = hex;
                            updatePreview();
                        });

                        var axisColorText = document.createElement('span');
                        axisColorText.className = 'prop-color-text';
                        axisColorText.textContent = row.value;
                        axisColorText.style.flex = '1';
                        axisColorText.style.fontSize = '11px';

                        var deleteBtn = document.createElement('button');
                        deleteBtn.className = 'prop-axis-delete';
                        deleteBtn.innerHTML = '🗑';
                        deleteBtn.title = 'Delete';
                       // if (row.setClick) deleteBtn.setAttribute('onclick', row.setClick);

                        deleteBtn.addEventListener('click', function(e) {
                            data.sections[sectionIndex].rows[rowIndex].delete=true;
                             updatePreview();
                        });

                        axisWrapper.appendChild(axisColorPicker);
                        axisWrapper.appendChild(axisColorText);
                        axisWrapper.appendChild(deleteBtn);
                        control.appendChild(axisWrapper);
                        break;
                }

                rowDiv.appendChild(control);
                content.appendChild(rowDiv);
            });

          /*  if (section.showReset) {
                var resetBtn = document.createElement('button');
                resetBtn.className = 'prop-reset-btn';
                resetBtn.textContent = 'Reset Default Style';
                resetBtn.addEventListener('click', function() {
                    if (typeof defaultData !== 'undefined' && defaultData && defaultData.sections[sectionIndex]) {
                        data.sections[sectionIndex].rows = JSON.parse(JSON.stringify(defaultData.sections[sectionIndex].rows));
                        selfPanel.buildContent(data);
                        updatePreview();
                    }
                });
                content.appendChild(resetBtn);
            }*/

            sectionDiv.appendChild(content);
            body.appendChild(sectionDiv);
        });
    };

    // Show panel with data
    this.show = function(data) {
        selfPanel.currentData = data;
        selfPanel.buildContent(data);
        var panel = document.getElementById('propertiesPanel');
        if (panel) {
            panel.classList.add('visible');
            if (!isPositionSet) {
                panel.style.left = '';
                panel.style.top = '50px';
                panel.style.right = '20px';
                isPositionSet = true;
            }
        }
    };


    this.setData = function(data) {
        selfPanel.currentData = data;
        selfPanel.buildContent(data);
    }

    // Hide panel
    this.hide = function() {
        var panel = document.getElementById('propertiesPanel');
        if (panel) panel.classList.remove('visible');
    };

    // Reset position to default
    this.resetPosition = function() {
        var panel = document.getElementById('propertiesPanel');
        if (panel) {
            panel.style.left = '';
            panel.style.top = '50px';
            panel.style.right = '20px';
            isPositionSet = true;
        }
    };

    // Initialize events
    this.init = function() {
        var panel = document.getElementById('propertiesPanel');
        var header = document.getElementById('propertiesPanelHeader');
        var closeBtn = document.getElementById('propertiesPanelClose');
        var areaGlobal = document.getElementById('areaGlobal');

        if (!panel || !header) return;

        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selfPanel.hide();
                document.getElementById('btnShowPanel').classList.remove('active');
            });
        }

        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn || closeBtn.contains(e.target)) return;
            isDragging = true;
            var rect = panel.getBoundingClientRect();
            panelStartX = rect.left;
            panelStartY = rect.top;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            panel.style.right = 'auto';
            panel.style.left = panelStartX + 'px';
            panel.style.top = panelStartY + 'px';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var deltaX = e.clientX - dragStartX;
            var deltaY = e.clientY - dragStartY;
            var newX = panelStartX + deltaX;
            var newY = panelStartY + deltaY;
            var panelWidth = panel.offsetWidth;
            var panelHeight = panel.offsetHeight;
            var viewportWidth = window.innerWidth;
            var viewportHeight = window.innerHeight;

            if (newX < 0) newX = 0;
            if (newX + panelWidth > viewportWidth) newX = viewportWidth - panelWidth;
            if (newY < 0) newY = 0;
            if (newY + panelHeight > viewportHeight) newY = viewportHeight - panelHeight;

            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) isDragging = false;
        });

        // Double-click on drawing area to show properties
        if (areaGlobal) {
          /*  areaGlobal.addEventListener('dblclick', function(e) {
                if(!propertiesData) 
                    pageSelect();
                selfPanel.show(propertiesData);
            });*/
        }


    };

    // Constructor
    this.injectCSS();
    this.injectHTML();
    this.init();
}

// Global instance
var propertiesPanel;
var propertiesData;



// Global function to build panel (compatibility with modifiedElemSelect.js)
function buildPanel() {
    if (typeof propertiesData === 'undefined' || !propertiesData) return;
    if (!propertiesPanel) {
        propertiesPanel = new fpropertiesPanel(drawing);
    }
    propertiesPanel.setData(propertiesData);
}

// Update preview function (calls changeSelect from descriptionElemSelect.js)
function updatePreview() {
    if (typeof changeSelect === 'function') {
        changeSelect();
    }
}

// clik button in properties to open dialog (for example for signal selection or model selection)
function getDialog(setClick) {
    switch (setClick) {
    case 'openEditCSS': {
        const originalText = mtable.select.getAttribute('style');

        drawing.getCodeEditor(
            originalText,
            'css',
            function (result) {
                mtable.select.setAttribute('style', result);
            },
            function () {
                console.log('Cancelled');
            }
        );

        break;
    }

    case 'openEditHtml': {
        const originalText = mtable.select.firstChild.firstChild.getAttribute('code');

        drawing.getCodeEditor(
            originalText,
            'html',
            function (result) {
                setHtmlCode(result);
            },
            function () {
                console.log('Cancelled');
            }
        );

        break;
    }
        case 'ioPosProbe': {
            var str = mtable.select.childNodes[2].textContent.split('=');

            var code = `
from pyams.models import BJT, Resistor

Qc1 = BJT("Vcc", "Out1", "Out2")
R1 = Resistor("Vcc", "Out1")
`;

drawing.getListParameter(code)
    .then(function (data) {
        drawing.getSignalDialog(data, "R1.I", false,
            function (result) {
                console.log(result.selectedSignal,   // "R1.I" أو اسم عقدة مثل "Vcc"
                            result.selectedKind);    // "voltage" أو "current"
            },
            function () { console.log('Cancelled'); }
        );
    })
    .catch(function (err) {
        console.error('getListParameter failed:', err);
    });
           /* try {
                if (!signalDialog) signalDialog = new fSignalDialog();
                const result = getElementListSpice();
                signalDialog.initData(result, str[0], false);
                signalDialog.onSubmit = function (result) {
                    mtable.select.childNodes[2].textContent = result.selectedSignal;
                    findPosProb();
                    probeSelect();
                };
                signalDialog.show();
            } catch (error) {
                console.log('Error', error.message);
            }*/
            break;
        }

        case 'ioProbe': {
            var str = mtable.select.childNodes[2].textContent.split('=');
            try {
                opAnalysis();
            } catch (error) {
                console.log('Error', error.message);
            }
            break;
        }

        case 'openEditorListModels': {
            drawing.getListModel(
                {
                    file: mtable.select.getAttribute('modelfile'),
                    model: mtable.select.getAttribute('modelname')
                },
                function (result) {
                    mtable.select.setAttribute('modelfile', result.file);
                    mtable.select.setAttribute('modelname', result.model);
                    mtable.select.setAttribute('dir', 'library');
                    mtable.select.setAttribute('local', 'true');
                    mtable.select.textContent = result.model;
                    setModelSpice(result, 'model');
                    modelSelected();
                },
                function () {
                    console.log('Cancelled');
                }
            );
            break;
        }

        case 'openEditorListModelsSym': {
            drawing.getListModel(
                {
                    file: drawing.symbol.model.file,
                    model: drawing.symbol.model.name
                },
                function (result) {
                    drawing.symbol.model.file = result.file;
                    drawing.symbol.model.name = result.model;
                    drawing.symbol.model.dir = 'library';
                    drawing.symbol.model.local = true;
                    setModelSpice(result, 'symbol');
                    pageSelect();
                },
                function () {
                    console.log('Cancelled');
                }
            );
            break;
        }

        case 'openEditorParamsSym': {
            var code=getCodePyOfSym();
            drawing.getListParameter(code).then(function (data) {
                drawing.getParametersDialog(data,
                    function (result) {                 
                        console.log(JSON.stringify(result, null, 2));
                                                    if(result.models.length>0){
                                console.log('Models:', result.models[0].setParams);
                                setParamSym(result.models[0].setParams);
                            }
                            
                           
                       
                        
                    },
                    function () { console.log('Cancelled'); }
                );
            })
            .catch(function (err) {
                console.error('getListParameter failed:', err);
            });

            break;
        }


        case 'openEditorListModelsPart': {
            drawing.getListModel(
                {
                    file: mtable.sym.model.file,
                    model: mtable.sym.model.name
                },
                function (result) {
                    mtable.sym.model.file = result.file;
                    mtable.sym.model.name = result.model;
                    mtable.sym.model.dir = 'library';
                    mtable.sym.model.local = true;
                    setPartModel(mtable.select, mtable.sym);
                    partSelect();
                },
                function () {
                    console.log('Cancelled');
                }
            );
            break;
        }

        case 'openEditorParamsPart': {
            var code=getCodePyOfPart(mtable.select);
            drawing.getListParameter(code).then(function (data) {
                drawing.getParametersDialog(data,
                    function (result) {                 
                        console.log(JSON.stringify(result, null, 2));
                                                    if(result.models.length>0){
                                console.log('Models:', result.models[0].setParams);
                                setParamPart(result.models[0].setParams,mtable.select);
                            }
                            
                           
                       
                        
                    },
                    function () { console.log('Cancelled'); }
                );
            })
            .catch(function (err) {
                console.error('getListParameter failed:', err);
            });

            break;
        }

        case 'openNetlistEditor':
            {
                var data=getNetlistSpice();
                getCircuit();
                console.log(data);
                drawing.getSpiceNetlistEditor(
                    data,
                    function (result) {
                        console.log(result);
                    },
                    function () {
                        console.log('Canceled');
                    }
                );
            }
            break;



        case 'OPCheck':
            {
                var spiceCode=getNetlistSpice();
                spiceCode+='\n\n* Analysis\n\n.op\n\n* Control\n\n.control\nrun\n\nprint all\n\n\n.endc\n\n.end';
                    drawing.runOpCheck(spiceCode).then(result => {
                        console.log('OP check result:', result);
                    }).catch(err => {
                        console.error('OP check failed:', err);
                    })
            }


        case 'dcPramAnalysis': {

           /* try {
                if (!elementDialog) elementDialog = new fElementDialog();
                const result = getEleForDCAnalys();
                var analy=JSON.parse(mtable.select.getAttribute("description"));
                elementDialog.initData(result,analy.dcsweep.param, false);
                elementDialog.onSubmit = function (result) {
                    analy.dcsweep.param=result;
                    analy.dcsweep.unit='V';
                    mtable.select.setAttribute("description", JSON.stringify(analy));
                    mtable.typeUsedDC=null;
                    analysisSelect();
                };
                elementDialog.show();
            } catch (error) {
                console.log('Error', error.message);
            }*/
            break;
        }

        case 'addOutputY': {
   
            try {
                if (!signalDialog) signalDialog = new fSignalDialog();
                var analy=JSON.parse(mtable.select.getAttribute("description"));
                const result = getElementListSpice();
                signalDialog.initData(result, 'Non', analy.type=='AC Analysis');
                signalDialog.onSubmit = function (result) {
                    ioSetPosProbe('Y',result.selectedSignal,result.selectedFunction)
                };
                signalDialog.show();
            } catch (error) {
                console.log('Error', error.message);
            }
            break;
        }

        case 'addOutputX': {
   
            try {
                if (!signalDialog) signalDialog = new fSignalDialog();
                var analy=JSON.parse(mtable.select.getAttribute("description"));
                const result = getElementListSpice();
                signalDialog.initData(result, 'Non', analy.type=='AC Analysis');
                signalDialog.onSubmit = function (result) {
                    ioSetPosProbe('X',result.selectedSignal,result.selectedFunction)
                };
                signalDialog.show();
            } catch (error) {
                console.log('Error', error.message);
            }
            break;
        }

        case 'runAnalysis':
            runSimulation();
            break;  
    }
}


function ioSetPosProbe(pos,name,func) {

    var nodes=getNetRefs();
    var probe=parseSignal(name, nodes);

    if(mtable.type=='analysis'){
      var analy=JSON.parse(mtable.select.getAttribute("description"));
      if(analy.type=='DC Sweep'){
         var dc=analy.dcsweep;
         var r=dc.yAxe;
	       var x=dc.xAxe;
       } else if(analy.type=='Time Domain') {
         var tr=analy.time
         var r=tr.yAxe;
         var x=tr.xAxe;
      } else if(analy.type=='AC Analysis') {
         var ac=analy.ac;
         var r=ac.yAxe;
         var x=ac.xAxe;  
       }

    }


    if(pos=='Y')
    {
      var output={name:name,unit:probe.unit,type:probe.type,color:'#000000',pos:1};
      if(func &&  (analy.type=='AC Analysis')) output.func=func;
      r.push(output);
      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedYOutput=null;
      analysisSelect();
      return;
    }
  
    if(pos=='X')
    {
       x.name=name;
       x.unit=probe.unit;
       x.type=probe.type;
       x.used=true;

      if(func &&  (analy.type=='AC Analysis')) x.func=func;

      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedXOutput=null;
      analysisSelect();
      return;
    }
  
}
