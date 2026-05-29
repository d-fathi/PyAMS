  
  
/*
#-------------------------------------------------------------------------------
# Name:        tabs-container.js
# Author:      d.fathi
# Created:     2026-04-29
# Copyright:  (c) PyAMS 2026
# Licence:
#-------------------------------------------------------------------------------
*/

  
  const fileTypes = {
            dcs: { icon: '<img src="images/file.svg" width="20" height="20" />', label: 'Designing Circuits and Simulation File', ext: '.dcs', lang: 'Designing' },
            sym: { icon: '<img src="images/file.svg" width="20" height="20"  />', label: 'Symbol File', ext: '.sym', lang: 'Symbol' }

        };

        const defaultContents = {
            dcs: `<span class="cm">// JavaScript file</span>\n<span class="kw">const</span> greeting <span class="op">=</span> <span class="str">"Hello World"</span>;\n\n<span class="fn">console</span>.<span class="fn">log</span>(greeting);`,
            sym: `<span class="op">&lt;!</span><span class="tag">DOCTYPE</span> <span class="attr">html</span><span class="op">&gt;</span>\n<span class="op">&lt;</span><span class="tag">html</span> <span class="attr">lang</span>=<span class="str">"ar"</span><span class="op">&gt;</span>\n<span class="op">&lt;</span><span class="tag">head</span><span class="op">&gt;</span>\n  <span class="op">&lt;</span><span class="tag">meta</span> <span class="attr">charset</span>=<span class="str">"UTF-8"</span><span class="op">&gt;</span>\n  <span class="op">&lt;</span><span class="tag">title</span><span class="op">&gt;</span>New Page<span class="op">&lt;/</span><span class="tag">title</span><span class="op">&gt;</span>\n<span class="op">&lt;/</span><span class="tag">head</span><span class="op">&gt;</span>\n<span class="op">&lt;</span><span class="tag">body</span><span class="op">&gt;</span>\n  <span class="op">&lt;</span><span class="tag">h1</span><span class="op">&gt;</span>Hello!<span class="op">&lt;/</span><span class="tag">h1</span><span class="op">&gt;</span>\n<span class="op">&lt;/</span><span class="tag">body</span><span class="op">&gt;</span>\n<span class="op">&lt;/</span><span class="tag">html</span><span class="op">&gt;</span>`,
       };

        let files = []

        const tabsContainer = document.getElementById('tabsContainer');
        const contentArea = document.getElementById('contentArea');
        
        const statusFile = document.getElementById('statusFile');
        const statusLang = document.getElementById('statusLang');
        const dropdownMenu = document.getElementById('dropdownMenu');
      

        let newFileCounter = 1;
        let addBtnEl = null;

// ═══════════════════════════════════════
// Function to save the content of the current tab
// ═══════════════════════════════════════
function saveCurrentTab() {
    const activeFile = files.find(f => f.active);
    if (!activeFile) return;

    if (drawing) {
        // Save the current content (including HTML for syntax highlighting)
        activeFile.content = exportAllDrawingData(drawing);
        // Or if you want plain text only, use: activeFile.rawContent = codeDiv.innerText;
    }
}

// ═══════════════════════════════════════
// Function to switch to a tab, save the previous one,
// and create the tab if it doesn't exist
// ═══════════════════════════════════════
function switchTab(id) {
    // 1. First, save the currently active tab
    saveCurrentTab();

    // 2. Search for the target tab
    let targetFile = files.find(f => f.id === id);

    // 3. If not found → create it automatically
    if (!targetFile) {
        const ext = id.includes('.') ? id.split('.').pop() : 'dcs';
        const typeKey = Object.keys(fileTypes).find(k => fileTypes[k].ext === '.' + ext) || 'dcs';
        const ft = fileTypes[typeKey];

        // Deactivate all tabs
        files.forEach(f => f.active = false);

        // Create the new tab
        targetFile = {
            id: id,
            name: id,
            type: typeKey,
            active: true,
            content: null
        };
        files.push(targetFile);
    } else {
        // Deactivate all and activate only the target tab
        files.forEach(f => f.active = (f.id === id));
    }

    hideDropdown();
    renderTabs();
    renderContent();
}

        function getIcon(type) {
            return fileTypes[type]?.icon || '📄';
        }

        function getLang(type) {
            return fileTypes[type]?.lang || 'Plain Text';
        }

        function initDropdown() {
            dropdownMenu.innerHTML = '';
            Object.keys(fileTypes).forEach(key => {
                const ft = fileTypes[key];
                const item = document.createElement('div');
                item.className = 'dropdown-item-tab';
                item.innerHTML = `
                    <span class="dropdown-item-tab-icon">${ft.icon}</span>
                    <span class="dropdown-item-tab-label">${ft.label}</span>
                    <span class="dropdown-item-tab-ext">${ft.ext}</span>
                `;
                item.addEventListener('click', function() {
                    addNewTab(key);
                    hideDropdown();
                });
                dropdownMenu.appendChild(item);
            });
        }

        function showDropdown() {
            if (!addBtnEl) return;
            const rect = addBtnEl.getBoundingClientRect();
            dropdownMenu.style.left = rect.left + 'px';
            dropdownMenu.style.top = (rect.bottom + 2) + 'px';
            dropdownMenu.classList.add('show');
        }

        function hideDropdown() {
            dropdownMenu.classList.remove('show');
        }

        function toggleDropdown() {
            if (dropdownMenu.classList.contains('show')) {
                hideDropdown();
            } else {
                showDropdown();
            }
        }

        function renderTabs() {
            tabsContainer.innerHTML = '';
            
            files.forEach((file, index) => {
                const tab = document.createElement('div');
                tab.className = 'tab' + (file.active ? ' active' : '');
                tab.dataset.id = file.id;

                const iconSpan = document.createElement('span');
                iconSpan.className = 'tab-icon';
                iconSpan.innerHTML = getIcon(file.type);

                const labelSpan = document.createElement('span');
                labelSpan.className = 'tab-label';
                labelSpan.textContent = file.name;

                const closeBtn = document.createElement('span');
                closeBtn.className = 'tab-close';
                closeBtn.innerHTML = '&times;';
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeTab(index);
                });

                tab.appendChild(iconSpan);
                tab.appendChild(labelSpan);
                tab.appendChild(closeBtn);

                tab.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('tab-close')) {
                        activateTab(file.id);
                    }
                });

                tabsContainer.appendChild(tab);
            });

            const btn = document.createElement('div');
            btn.className = 'add-tab-btn';
            btn.textContent = '+';
            btn.title = 'New File';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                addBtnEl = btn;
                toggleDropdown();
            });
            tabsContainer.appendChild(btn);
            addBtnEl = btn;
        }

        function renderContent() {
            contentArea.innerHTML = '';

            const activeFile = files.find(f => f.active);

            if (!activeFile) {
                const empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.innerHTML = welcomPage();
                contentArea.appendChild(empty);
                statusFile.textContent = '';
                statusLang.textContent = '';
                return;
            }

        
            statusFile.textContent = activeFile.name;
           statusLang.textContent = getLang(activeFile.type);

           drawing=creatPage("contentArea");
           window_load();
           document.querySelectorAll('.space-work').forEach(el => {
            if(el.style.display !== 'flex')
            el.style.display = 'flex';
          });
           
           if(activeFile.content){
            importAllDrawingData(activeFile.content, drawing);
           } else{
            drawing.newPage(activeFile.type);
           }



          drawing.fileName= activeFile.name;
          caption();
          displayByPageType();
          
          
        }

        function activateTab(id) {
          switchTab(id);
        }

      
      async function closeApp() {
         saveCurrentTab();
        for(let index=0; index< files.length; index++){
              const result = await confirmActionOnCloseTab(files[index]);
              if (result != 1) {
                return false; // Cancel closing the app
              }
            }
       window.electron.closeWindowIDE();

    }

       async function closeTab(index) {
            saveCurrentTab();
            const wasActive = files[index].active;
            const result = await confirmActionOnCloseTab(files[index]);

            if (result === 1) {
                files.splice(index, 1);
                if (wasActive && files.length > 0) {
                files[Math.min(index, files.length - 1)].active = true;
            }
            }



            hideDropdown();
            renderTabs();
            renderContent();
        }

        function addNewTab(type) {
            saveCurrentTab();
            const ft = fileTypes[type];
            const newId = 'new-' + newFileCounter++ + ft.ext;
            files.forEach(f => f.active = false);
            files.push({
                id: newId,
                name: newId,
                type: type,
                filePath: null,
                active: true,
                content: null
            });
            renderTabs();
            renderContent();
        }


        function addNewTabOpenFile(type,filePath,fileContent,fileName) {
     
            saveCurrentTab();
            files.forEach(f => f.active = false);
            const pathFile = files.find(f => f.filePath === filePath);
            if(pathFile){
                pathFile.active = true;
                renderTabs();
                renderContent();
                return;
            }
            const ft = fileTypes[type];
            files.push({
                id: fileName,
                name: fileName,
                type: type,
                filePath: filePath,
                active: true,
                content: null
            });
            renderTabs();
            renderContent();
            drawing.setSymbol(fileContent);
        //    files[files.length-1].content=exportAllDrawingData(drawing);
        }

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.add-tab-btn') && !e.target.closest('.dropdown-menu')) {
                hideDropdown();
            }
        });

        initDropdown();
        renderTabs();
        renderContent();

       // ========== SPLITTER LOGIC ==========
const splitter = document.getElementById('splitter');
const sidebar = document.getElementById('sidebar');
let isResizing = false;
let startX, startWidth;

splitter.addEventListener('mousedown', (e) => {
  isResizing = true;
  startX = e.clientX;
  startWidth = parseInt(getComputedStyle(sidebar).width, 10);
  splitter.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;

  const dx = e.clientX - startX;
  let newWidth = startWidth + dx;

  const minWidth = 170;
  const maxWidth = 500;
  newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

  sidebar.style.width = newWidth + 'px';
});

document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    splitter.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

splitter.addEventListener('touchstart', (e) => {
  isResizing = true;
  startX = e.touches[0].clientX;
  startWidth = parseInt(getComputedStyle(sidebar).width, 10);
  splitter.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('touchmove', (e) => {
  if (!isResizing) return;
  const dx = e.touches[0].clientX - startX;
  let newWidth = startWidth + dx;
  newWidth = Math.max(170, Math.min(500, newWidth));
  sidebar.style.width = newWidth + 'px';
});

document.addEventListener('touchend', () => {
  isResizing = false;
  splitter.classList.remove('dragging');
});

//=====Welom Page===========================//

        function welcomPage(){
          document.title='Python for analog and mixed-signal  [Welcome]';
          document.querySelectorAll('.space-work').forEach(el => {
            el.style.display = 'none';
          });
            return `         
        <div class="welcome-page" id="welcomePage">
           <div class="welcome-content">
             <h1 class="welcome-title"><span class="icon"><img src="form/logo.png" class="welcome-icon" width="100" height="100" ></span>PyAMS 0.2.0</h1>
             <p class="welcome-subtitle">Python for analog and mixed-signal design</p>

            <div class="welcome-columns">
              <div class="welcome-column">
                <h3>Start</h3>
                <ul class="start-list">
                  <li><a href="#" onclick="addNewTab('dcs')"><span class="icon"><img src="images/file.svg" width="20" height="20" /></span> New Page...</a></li>
                  <li><a href="#" onclick="addNewTab('sym')"><span class="icon">📄</span> New Symbol...</a></li>
                  <!-- <li><a href="#"><span class="icon">⚡</span> Generate New Workspace...</a></li> -->
                  <li><a href="#"  onclick="openFile()"><span class="icon">📂</span> Open ....</a></li>
                </ul>

                <h3 class="recent-title">Recent</h3>
                <ul class="recent-list">
                  <!--li><a href="#">my-jupyter-app <span class="path">D:\project\platform</span></a></li>
                  <li><a href="#">pyams_lib <span class="path">D:\project</span></a></li>
                  <li><a href="#">platform <span class="path">D:\project</span></a></li>
                  <li><a href="#">PyAMS <span class="path">D:\project</span></a></li>
                  <li><a href="#">pyams_lib <span class="path">D:\</span></a></li>
                  <li><a href="#" class="more">More...</a></li-->
                </ul>
              </div>

              <div class="welcome-column">
                <h3>Walkthroughs</h3>
                <div class="walkthrough-list">
                  <div class="walkthrough-item">
                    <div class="walkthrough-icon">⭐</div>
                    <div class="walkthrough-info">
                      <div class="walkthrough-title">What is PyAMS?</div>
                      <div class="walkthrough-desc">
                      PyAMS <b>(Python for Analog and Mixed Signals)</b> is an open-source software tool designed to simplify the simulation of electronic circuits and 
                      the modeling of analog elements using the <b>pyams_lib</b> library. It is developed with Python 3+, and currently supports Windows, 
                      with plans for Linux and macOS in the future. the interface created using ElectronJS and NodeJs.
                      </div>
                    </div>
                  </div>
                  <div class="walkthrough-item">
                    <div class="walkthrough-icon">♿</div>
                    <div class="walkthrough-info">
                      <div class="walkthrough-title">Get Started with Accessibility Features</div>
                      <div class="walkthrough-desc">
                          <p>PyAMS offers comprehensive circuit design and simulation capabilities, featuring an intuitive schematic editor for drawing circuits with ease.
                           The software supports simulating circuits in various modes of operation, allowing engineers to test their designs under different conditions.
                           Simulation results can be visualized through a dedicated waveform editor or by using probes, providing clear and detailed insights into 
                           circuit behavior..</p>
                          <p>The platform excels in modeling and customization, empowering users to create custom symbols for electronic models tailored to their specific needs. 
                          Additionally, developers can build new PyAMS models for 
                          electrical components using the pyams_lib library, offering extensive flexibility in designing and adapting complex systems according to project requirements.
                          </p>
                      </div>
                      </div>
                     </div>
       

                  <div class="walkthrough-item">
                    <div class="walkthrough-icon">🐍</div>
                    <div class="walkthrough-info">
                    <div class="walkthrough-title">Using PyPy for accelerate simulation processe</div>
                    <div class="walkthrough-desc">

                          <p>In terms of performance and licensing, PyAMS leverages PyPy to accelerate simulation processes significantly, ensuring efficient and fast results. 
                          The software is licensed under GPLv3, guaranteeing that it remains 
                          free and open-source, which promotes transparency, community collaboration, and continuous improvement through shared development efforts.
                          </p>
                          <p>Overall, PyAMS stands as a powerful and practical tool for engineers and researchers working with analog and mixed-signal systems, 
                          combining scientific accuracy with technical flexibility in a comprehensive and user-friendly environment.
                          </p>

                      </div>
                    </div>
                  </div>
                  <!--div class="walkthrough-item">
                    <div class="walkthrough-icon">💡</div>
                    <div class="walkthrough-info">
                      <div class="walkthrough-title">Learn the Fundamentals</div>
                    </div>
                  </div>
                  <div class="walkthrough-item">
                    <div class="walkthrough-icon">🤖</div>
                    <div class="walkthrough-info">
                      <div class="walkthrough-title">GitHub Copilot <span class="badge">Updated</span></div>
                    </div>
                  </div>
                  <div class="walkthrough-item">
                    <div class="walkthrough-icon">🐍</div>
                    <div class="walkthrough-info">
                      <div class="walkthrough-title">Get Started with Python Development <span class="badge">Updated</span></div>
                    </div>
                  </div>
                  <div class="walkthrough-item">
                    <div class="walkthrough-icon">📓</div>
                    <div class="walkthrough-info">
                      <div class="walkthrough-title">Get Started with Jupyter Notebooks <span class="badge">Updated</span></div>
                    </div>
                  </div>
                  <a href="#" class="more-link">More...</a-->
                </div>
              </div>
            </div>
          </div>
       </div>`;
        }