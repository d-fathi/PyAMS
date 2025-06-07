


document.addEventListener("DOMContentLoaded", () => {
    const menuBar = document.querySelector(".menu-bar");
    const toolbar = document.querySelector(".toolbar");
    const descriptionBar = document.getElementById("description-bar");
    const editor = document.getElementById("text-editor");
    const data = {
        "menus": [
            {
                "title": "File",
                "items": [
                    { "label": "New", "icon": images.new, "shortcut": "Ctrl+N", "action": "newFile", "description": "Create a new file" },
                    { "label": "Open", "icon": images.open, "shortcut": "Ctrl+O", "action": "openFile", "description": "Open an existing file" },
                    { "label": "Save", "icon": images.save, "shortcut": "Ctrl+S", "action": "saveFile", "description": "Save the current file" },
                    { "label": "Save As..", "icon": "", "hidden":true,"shortcut": " ", "action": "saveAsFile", "description": "Save as the current file" },
                    { "label": "separator" },
                    { "label": "New symbol File", "icon": images.symbol, "shortcut": "Ctrl+N+S", "action": "newSymbol", "description": "Create a new symbol" },
                  /*  { "label": "separator" },
                    { 
                        "label": "Reopen", "icon": images.white, "shortcut": " ", 
                        "submenu": [
                            { "label": "File1.txt", "action": "reopenFile1" },
                            { "label": "File2.txt", "action": "reopenFile2" }
                        ]
                    }*/
                ]
            },
            {
                "title": "Edit",
                "items": [
                    { "label": "Undo", "icon": images.undo, "shortcut": "Ctrl+Z", "action": "undo", "description": "Undo" },
                    { "label": "Redo", "icon": images.redo, "shortcut": "Ctrl+Y", "action": "redo", "description": "Redo" },
                    { "label": "separator" },
                    { "label": "Cut", "icon": images.cut, "shortcut": "Ctrl+X",   "action": "cut", "description": "Cut" },
                    { "label": "Copy", "icon": images.copy, "shortcut": "Ctrl+C", "action": "copy", "description": "Copy" },
                    { "label": "Past", "icon": images.past, "shortcut": "Ctrl+V", "action": "past", "description": "Past" },
                    { "label": "separator" },
                    { "label": "After", "icon": images.after, "shortcut": " ", "action": "after", "description": "After " },
                    { "label": "Before", "icon": images.before, "shortcut": " ",  "action": "befor", "description": "Before" },
                    { "label": "Append", "icon": images.append, "shortcut": " ", "action": "append", "description": "Append" },
                    { "label": "First", "icon": images.first,  "shortcut": " ", "action": "first", "description": "First" }
                ]
            },
            {
                "title": "View",
                "items": [
                    { "label": "Zoom In", "icon": images.zoomIn, "shortcut": "Ctrl++", "action": "zoomIn", "description": "Zoom In" },
                    { "label": "Zoom Out", "icon": images.zoomOut, "shortcut": "Ctrl+-", "action": "zoomOut", "description": "Zoom Out" },
                    { "label": "separator" },
                    { "label": "Flip Horizontal", "icon": images.flipHorizontal, "shortcut": "Shift+H", "action": "horizontal", "description": "Flip Horizontal" },
                    { "label": "Flip Vertically", "icon": images.flipVertically, "shortcut": "Shift+V", "action": "vertically", "description": "Flip Vertically" },
                    { "label": "Rotate", "icon": images.Rotate, "shortcut": "Shift+R", "action": "rotate", "description": "Rotate" },
                    { "label": "separator" },
                    { "label": "Show grid", "icon": "", "hidden":true, "shortcut": " ", "action": "showGrid", "description": "Show or hide grid", "id": "showGrid" }
                    //{ "label": "Show ruler", "icon": "", "hidden":true, "shortcut": " ", "action": "showRuler", "description": "Show or hide ruler", "id": "showRuler" },
                ]
            },
            {
                "title": "Add",
                "items": [
                    { "label": "Text", "icon": images.text, "shortcut": " ", "action": "text", "description": "Add text" },
                    { "label": "Image", "icon": images.image, "shortcut": " ", "action": "image", "description": "Add image" },
                    { "label": "Gnd", "icon": images.gnd, "shortcut": " ", "action": "gnd", "description": "Add gnd" },
                    { "label": "Wire", "icon": images.net, "shortcut": " ", "action": "net", "description": "Add wire" },
                    { "label": "Rect", "icon": images.rect, "shortcut": " ", "action": "rect", "description": "Add rect" },
                    { "label": "Ellipse", "icon": images.ellipse, "shortcut": " ", "action": "ellipse", "description": "Add ellipse" },
                    { "label": "Polygon", "icon": images.polygon, "shortcut": " ", "action": "polygon", "description": "Add polygon" },
                    { "label": "Polyline", "icon": images.polyline, "shortcut": " ", "action": "polyline", "description": "Add polyline" },
                    { "label": "Pin", "icon": images.pin, "shortcut": " ", "action": "pin", "description": "Add pin" },
                    { "label": "Param", "icon": images.param, "shortcut": " ", "action": "param", "description": "Add paramater" },
                    { "label": "Referance", "icon": images.ref, "shortcut": " ", "action": "ref", "description": "Add referance" },
                    { "label": "Html", "icon": images.html, "shortcut": " ", "action": "codeHTML", "description": "Add Html" },
                    { "label": "Python code", "icon": images.python, "shortcut": " ", "action": "codePy", "description": "Add python code" },
                    { "label": "Analysis", "icon": images.analysis, "shortcut": " ", "action": "analysis", "description": "Add Analysis" },
                    { "label": "Probe", "icon": images.av, "shortcut": " ", "action": "probe", "description": "Add probe" },
                    { "label": "Oscilloscope", "icon": images.oscilloscope, "shortcut": " ", "action": "oscilloscope", "description": "Add scilloscope" },
                    { "label": "End", "icon": images.end, "shortcut": " ", "action": "polyline", "description": "End drawing" },
                ]
            }, {
                "title": "Tools",
                "items": [
                    { "label": "Library management", "icon": images.dataSymbol, "shortcut": " ", "action": "libraryManagement", "description": "Library management" },
                    { "label": "Python editor", "icon": images.python, "shortcut": " ", "action": "pythonEditor", "description": "Python editor" }
                ]
            }, {
                "title": "Simulation",
                "items": [
                    { "label": "Run Analysis", "icon": images.runAnalysis, "shortcut": " ", "action": "runAnalysis", "description": "Run Analysis" }
                ]
            },
            {
                "title": "Help",
                "items": [
                    { "label": "Help", "icon": "", "hidden":true, "shortcut": "F1", "action": "help", "description": "Help" },
                    { "label": "Web Page", "icon": "", "hidden":true, "shortcut": " ", "action": "webPage", "description": "Web Page" },
                    { "label": "Elements (Library)", "icon": "", "hidden":true, "shortcut": " ", "action": "elements", "description": "Elements (Library)" },
                    { "label": "separator" },
                    { "label": "About", "icon": "", "hidden":true, "shortcut": " ", "action": "about", "description": "About software" }
                ]
            }
        ],
        
        "toolbar": [
            { "label": "New", "icon": images.new, "action": "newFile", "description": "Create a new file" },
            { "label": "Open", "icon": images.open, "action": "openFile", "description": "Open an existing file" },
            { "label": "Save", "icon": images.save, "action": "saveFile", "description": "Save the current file" },
            { "label": "separatorbar" },
            { "label": "New symbol File", "icon": images.symbol,  "action": "newSymbol", "description": "Create a new symbol" },
            { "label": "separatorbar" },
            { "label": "Undo", "icon": images.undo,  "action": "undo", "description": "Undo" },
            { "label": "Redo", "icon": images.redo,  "action": "redo", "description": "Redo" },
            { "label": "separatorbutton" },
            { "label": "Cut", "icon": images.cut,  "action": "cut", "description": "Cut"},
            { "label": "Copy", "icon": images.copy,  "action": "copy", "description": "Copy"},
            { "label": "past", "icon": images.past,  "action": "past", "description": "Past"},
            { "label": "separatorbutton" },
            { "label": "After", "icon": images.after, "action": "after", "description": "After" },
            { "label": "Before", "icon": images.before,  "action": "befor", "description": "Before" },
            { "label": "Append", "icon": images.append,  "action": "append", "description": "Append" },
            { "label": "First", "icon": images.first,  "action": "first", "description": "First" },
            { "label": "separatorbar" },
            { "label": "ZoomIn", "icon": images.zoomIn,  "action": "zoomIn", "description": "Zoom in"},
            { "label": "ZoomOut", "icon": images.zoomOut,  "action": "zoomOut", "description": "Zomm out"},
            { "label": "Flip Horizontal", "icon": images.flipHorizontal,  "action": "horizontal", "description": "Flip Horizontal" },
            { "label": "Flip Vertically", "icon": images.flipVertically,  "action": "vertically", "description": "Flip Vertically" },
            { "label": "Rotate", "icon": images.Rotate,"action": "rotate", "description": "Rotate" },
            { "label": "separatorbar" },
            { "label": "End", "icon": images.end,  "action": "end", "description": "End designe"},
            { "label": "Text", "icon": images.text,  "action": "text", "description": "Add text" },
            { "label": "Image", "icon": images.image,  "action": "image", "description": "Add image" },
            { "label": "Gnd", "icon": images.gnd,  "action": "gnd", "description": "Add gnd" },
            { "label": "Wire", "icon": images.net, "action": "net", "description": "Add wire" },
            { "label": "Rect", "icon": images.rect,  "action": "rect", "description": "Add rect" },
            { "label": "Ellipse", "icon": images.ellipse,  "action": "ellipse", "description": "Add ellipse" },
            { "label": "Polygon", "icon": images.polygon,  "action": "polygon", "description": "Add polygon" },
            { "label": "Polyline", "icon": images.polyline,  "action": "polyline", "description": "Add polyline" },
            { "label": "Pin", "icon": images.pin,  "action": "pin", "description": "Add pin" },
            { "label": "Param", "icon": images.param,  "action": "param", "description": "Add paramater" },
            { "label": "Referance", "icon": images.ref, "action": "ref", "description": "Add referance" },
            { "label": "Html", "icon": images.html,  "action": "codeHTML", "description": "Add Html" },
            { "label": "Python code", "icon": images.python,  "action": "codePy", "description": "Add python code" },
            { "label": "Analysis", "icon": images.analysis,  "action": "analysis", "description": "Add Analysis" },
            { "label": "Probe", "icon": images.av,  "action": "probe", "description": "Add probe" },
            { "label": "Oscilloscope", "icon": images.oscilloscope,  "action": "oscilloscope", "description": "Add scilloscope" },
            { "label": "separatorbar" },
            { "label": "Run Analysis", "icon": images.runAnalysis, "shortcut": " ", "action": "runAnalysis", "description": "Run Analysis" }
        ]
    };

  menuitems={};
  toolbarButtons={};

    //Create Menus
    data.menus.forEach(menu => {
        const menuItem = document.createElement("div");
        menuItem.className = "menu-item";
        menuItem.textContent = menu.title;
        
        const dropdown = document.createElement("div");
        dropdown.className = "dropdown";

        menu.items.forEach(item => {
            const dropdownItem = document.createElement("div");
            
            if(item.label=="separator")
                dropdownItem.className ="separator";
            else{
                dropdownItem.className = "dropdown-item";
                dropdownItem.innerHTML = `<img src="${item.icon}" alt="${item.label}" class="icon">${item.label} <span class="shortcut">${item.shortcut}</span>`;
                if(item.hidden) {
                    dropdownItem.firstChild.style.visibility = "hidden"; // Hide the item if hidden is true 
                }

                if(item.id) {
                    dropdownItem.id = item.id; // Set the id if provided
                    dropdownItem.innerHTML = `<input type="checkbox" checked  readonly>${item.label} <span class="shortcut">${item.shortcut}</span>`;
                }
                

                if (item.submenu) {
                    dropdownItem.classList.add("has-submenu");

                    const submenu = document.createElement("div");
                    submenu.className = "submenu";

                    item.submenu.forEach(subItem => {
                        const subItemElement = document.createElement("div");
                        subItemElement.className = "dropdown-item";
                        subItemElement.textContent = subItem.label;
                        submenu.appendChild(subItemElement);
                    });

                    dropdownItem.appendChild(submenu);
                }
               
               
                dropdownItem.addEventListener("mouseover", () => {
                 descriptionBar.textContent = item.description;
               });
               dropdownItem.addEventListener("mouseout", () => {
                 descriptionBar.textContent = "Hover over an item for details.";
               });
               dropdownItem.addEventListener("click", (event) => {setAction(item.action);                        
                event.stopPropagation();
                dropdown.style.display = "none"; });
               menuitems[item.action]=dropdownItem;
            }
               dropdown.appendChild(dropdownItem);
        });
     


        menuItem.appendChild(dropdown);
        menuItem.addEventListener("mouseover", () => {
            dropdown.style.display = "block";
        });
        menuItem.addEventListener("mouseleave", () => {
            dropdown.style.display = "none";
        });
        menuBar.appendChild(menuItem);
    });
    

    // Create Toolbar Buttons
    data.toolbar.forEach(tool => {
        if(tool.label=="separatorbar"){
            const separator = document.createElement("div");
            separator.className ="separatorbar";
            toolbar.appendChild(separator);

        } else if(tool.label=="separatorbutton"){
            const separator = document.createElement("div");
            separator.className ="separatorbutton";
            toolbar.appendChild(separator);
        } else{
          const button = document.createElement("button");
          button.innerHTML = `<img src="${tool.icon}" alt="${tool.label}" class="icon">`;
          button.addEventListener("mouseover", () => {
              descriptionBar.textContent = tool.description;
          });
          button.addEventListener("mouseout", () => {
              descriptionBar.textContent = "Hover over an item for details.";
          });
          button.addEventListener("click", () => {setAction(tool.action)});
          toolbar.appendChild(button);
          toolbarButtons[tool.action]=button;
      }
    });



    var drawing=creatPage("two");
    drawing.getObjectInspector("one2");
    drawing.newPage("sym");

    displayByPageType();

});


const menuEditor = [
    { text: "End", icon : images.end,  action: "end"},
    { divider: true },
    { text: "Cut", icon: images.cut,  action: "cut", shortcut: "Ctrl+X"  },
    { text: "Copy", icon: images.copy,  action: "copy",shortcut: "Ctrl+C" },
    { text: "Past", icon: images.past,  action: "past",shortcut: "Ctrl+V" },
    { divider: true },
    { text: "Flip Horizontal", icon: images.flipHorizontal,  action: "horizontal", shortcut: "Ctrl+H" },
    { text: "Flip Vertically", icon: images.flipVertically,  action: "vertically", shortcut: "Ctrl+V" },
    { text: "Rotate", icon: images.Rotate, action: "rotate", shortcut: "Ctrl+R" }
];


popMenu={};

// Function to create a menu
function createMenu(menuData, menuId) {
    const menu = document.createElement('div');
    menu.id = menuId;
    menu.className = 'pop-menu';
    

    menuData.forEach(item => {
        if (item.divider) {
            const divider = document.createElement('div');
            divider.className = 'pop-menu-divider';
            menu.appendChild(divider);
        } else {
            const menuItem = document.createElement('div');
            menuItem.className = 'pop-menu-item';

            if (item.icon) {
                const icon = document.createElement('img');
                icon.src = item.icon;
                icon.alt = 'icon';
                icon.className = 'icon';
                menuItem.appendChild(icon);
            }

            const text = document.createTextNode(item.text);
            menuItem.appendChild(text);

            if (item.shortcut) {
                const shortcut = document.createElement('span');
                shortcut.className = 'pop-menu-shortcut';
                shortcut.textContent = item.shortcut;
                menuItem.appendChild(shortcut);
            }

            
            menuItem.addEventListener("click", () => {setAction(item.action)});
            menu.appendChild(menuItem);
            popMenu[item.action]=menuItem;
        }
    });

    document.body.appendChild(menu);
    return menu;
}

// Create menus for each div
const menu1 = createMenu(menuEditor,'menu1');
//const menu2 = createMenu(menuData2, 'menu2');

// Function to show a specific menu
function showMenu(menu, event) {
    menu.style.display = 'block';
    menu.style.top = `${event.pageY}px`;
    menu.style.left = `${event.pageX}px`;
}


// Add event listeners for right-clicks
document.getElementById('two').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu1.style.display = 'none'; // Hide other menu
    //menu2.style.display = 'none';
    showMenu(menu1, e);
});
/*
document.getElementById('div2').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu1.style.display = 'none'; // Hide other menu
    menu2.style.display = 'none';
    showMenu(menu2, e);
});

*/
// Add contextmenu listener for clicks outside div1 and div2
 document.addEventListener('contextmenu', (e) => {
 const target = e.target;

// Check if the target is not in div1 or div2
 if (!document.getElementById('two').contains(target)/* && 
   !document.getElementById('div2').contains(target)*/) {
   menu1.style.display = 'none'; // Hide menu1
   //menu2.style.display = 'none'; // Hide menu2
}
});

// Hide menus when clicking elsewhere
document.addEventListener('click', () => {
    menu1.style.display = 'none';
   // menu2.style.display = 'none';
});

//***************************************************************************** */








