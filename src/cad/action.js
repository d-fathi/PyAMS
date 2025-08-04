
user={baseName:'New file',fileType:'', fileName:'New file'}

function setAction(value){
   
  switch(value) {
    case "openFile":
         if(drawing.modified)
           confirmAction(1);
         else 
           openFile();
      break;

    case "newFile":
        if(drawing.modified)
          confirmAction(2);
        else 
          newCircuit();
      break;

    case "newSymbol":
      if(drawing.modified)
        confirmAction(3);
      else 
        newSymbol();
     break;

    case "saveFile":

      if(user.fileName=='New file')
        saveAsFile();
      else
        saveFile();
    break;

    case  "saveAsFile":
      saveAsFile();
    break;

    case "cut":
        drawing.cut();
      break;

    case "copy":
        drawing.copy();
      break;

    case "past":
        drawing.past();
      break;

    case "zoomIn":
        drawing.zoomIn();
    break;

    case "zoomOut":
        drawing.zoomOut();
    break;

    case 'rotate':
        rotatePart();
    break;

    case 'horizontal':
      flipHorizontalPart();
    break;

    case 'vertically':
      flipVerticallyPart();
    break;
       
    case "undo":
        drawing.undo();
    break;

    case "redo":
        drawing.redo();
    break;

    case "redo":
        drawing.redo();
    break;

    case "showGrid":
        drawing.grid.showGrid = !drawing.grid.showGrid;  
        drawing.showGrid(drawing.grid.showGrid);
        document.getElementById("showGrid").firstChild.checked = drawing.grid.showGrid; 
    break;

    case "gnd":
      addGnd();
    break;

    case "end":
      drawing.shapes.design.mouse = false;
      drawing.shapes.design.start = false;
    break;

    case "rect":
    case "image":
    case "ellipse":
    case "net":
    case "polyline":
    case "polygon":
    case "pin":
    case "arc":
    case "probe":
    case "analysis":
    case "codePy":
    case "param":
    case "ref":
    case "text":
    case "codeHTML":
      addShape(value);
    break;

    case "runAnalysis":
       runAnalysis();
    break;

    case "about":
       window.electron.openDialogAbout();
    break;

    case "pythonPath":
       window.electron.openDialogPythonPath();
    break;

    case "after":
      after_();
    break;

    case "befor":
      before_();
    break;

    case "append":
      appEnd_();
    break;

    case "first":
      first_();
    break;

    case "pythonEditor":
      window.electron.editFilePy('New file');
    break;

    case "libraryManagement":
       openLibraryManagement();
    break;

    case "help":
    case "webPage":
    case  "elements":
      window.electron.openBrowserWindow(value);
    default:
      // code block
  }

  enable();
  updateListElements();
}


var ioDic = {
  x: 0,
  y: 0,
  zoom: 0,
  select: false,
  undo: false,
  redo: false,
  past: false,
  endDrawing: true,
  modified: false,
  selectPart: false,
  showPolarity: false,
  selectAnalysis: false,
  selectShowAnalysis: false,
  itProject:false,
  undoPos: '  '
};



function enable(){

   function removeClass(a){
     for(var i=0; i<a.length;i++)
      a[i].classList.remove('disabled');
   }

   function addClass(a){
    for(var i=0; i<a.length;i++)
     a[i].classList.add('disabled');
  }

  if((drawing.shapes.lsg.elms.length > 0) || (drawing.resize.setElement != null))
      removeClass([toolbarButtons.cut,menuitems.cut,toolbarButtons.copy,menuitems.copy,popMenu.cut,popMenu.copy]);
  else
      addClass([toolbarButtons.cut,menuitems.cut,toolbarButtons.copy,menuitems.copy,popMenu.cut,popMenu.copy]);

  if(!(drawing.copyList.length == 0))
      removeClass([toolbarButtons.past,menuitems.past,popMenu.past]);
  else
      addClass([toolbarButtons.past,menuitems.past,popMenu.past]);
   
  if(!(drawing.posUndo <= 0))
      removeClass([toolbarButtons.undo,menuitems.undo]);
  else
      addClass([toolbarButtons.undo,menuitems.undo]);

  if(!(drawing.posUndo >= drawing.data.length-1))
      removeClass([toolbarButtons.redo,menuitems.redo]);
  else
      addClass([toolbarButtons.redo,menuitems.redo]);
  //

  if(itPartSelect())
    removeClass([toolbarButtons.horizontal,menuitems.horizontal,popMenu.horizontal,
                 toolbarButtons.vertically,menuitems.vertically,popMenu.vertically,
                 toolbarButtons.rotate,menuitems.rotate,popMenu.rotate]);
  else
    addClass([toolbarButtons.horizontal,menuitems.horizontal,popMenu.horizontal,
      toolbarButtons.vertically,menuitems.vertically,popMenu.vertically,
      toolbarButtons.rotate,menuitems.rotate,popMenu.rotate]);

if (user.fileType=='sym') var title='Symbol Editor'; 
else var title='Python for Analog and Mixed Signals';

if(drawing.modified)
  document.title=title+'  ['+user.baseName+'* ]';
else 
  document.title =title+'  ['+user.baseName+']';
  //menuitems.New.innerHTML='';

if(ioDic.selectAnalysis){
  removeClass([toolbarButtons.runAnalysis,menuitems.runAnalysis]);
} else 
   addClass([toolbarButtons.runAnalysis,menuitems.runAnalysis]);
}


//----------------Get information of page--------------------------------//

function dataToInterface() {
  

  function getMousePosition(evt) {
      var CTM = svg.getScreenCTM();
      return {
          x: Math.round((evt.clientX - CTM.e) / CTM.a),
          y: Math.round((evt.clientY - CTM.f) / CTM.d)
      };

  }

  function ioupdateData(e) {
      ioDic.x = getMousePosition(e).x;
      ioDic.y = getMousePosition(e).y;
      ioDic.zoom = Math.ceil(drawing.grid.zoom * 100) + '%';
      ioDic.select = (drawing.shapes.lsg.elms.length > 0) || (drawing.resize.setElement != null);
      ioDic.undo = !(drawing.posUndo <= 0);
      ioDic.redo = !(drawing.posUndo >= drawing.data.length - 1);
      ioDic.past = !(drawing.copyList.length == 0);
      ioDic.endDrawing = !drawing.shapes.design.mouse;
      ioDic.modified = drawing.modified;
      ioDic.undoPos = drawing.getDescUndo();
      ioDic.selectPart = itPartSelect();
      ioDic.selectAnalysis = itSelectAnalysis();
      ioDic.selectShowAnalysis = itSelectShowAnalysis();
      ioDic.showPolarity =drawing.showPolarity;
      ioDic.itProject=drawing.itProject;
      enable();
      document.getElementById("description-bar").innerHTML=`
      <div style="width: 70px; float: left; border:#eeeeee solid 0.5px;">x:${ioDic.x }</div>
      <div style="width: 70px; float: left; border:#eeeeee solid 0.5px;">y:${ioDic.y }</div>
      <div style="width: 150px; float: left; border:#eeeeee solid 0.5px;">${ioDic.undoPos }</div>
      <div style="width: 150px; float: left; border:#eeeeee solid 0.5px;">Zoom: ${ioDic.zoom }</div>
      `;
  }

  document.getElementById("svg").addEventListener('mousemove', e => {
      ioupdateData(e);
  });
  document.getElementById("svg").addEventListener('mouseup', e => {
      ioupdateData(e);
  });
  document.getElementById("svg").addEventListener('click', e => {
      ioupdateData(e);
  });

 
}


//----------------Update information of page--------------------------------//
function updatResult() {
  ioDic.zoom = Math.ceil(drawing.grid.zoom * 100) + '%';
  ioDic.select = (drawing.shapes.lsg.elms.length > 0) || (drawing.resize.setElement != null);
  ioDic.undo = !(drawing.posUndo <= 0);
  ioDic.redo = !(drawing.posUndo >= drawing.data.length - 1);
  ioDic.past = !(drawing.copyList.length == 0);
  ioDic.endDrawing = !drawing.shapes.design.mouse;
  ioDic.modified = drawing.modified;
  ioDic.undoPos = drawing.getDescUndo();
  ioDic.selectPart = itPartSelect();
}


function excute()
{
 var svg = document.getElementById("sym"); 
 console.log(svg.innerHTML);
 var collection = svg.children;
 console.log('length :'+collection.length);


            for (var i = 1; i < collection.length; i++) {
				console.log(i+ '  :'+collection[i].getAttribute('name'));
			}
}

function after_()
{
 var svg = document.getElementById("sym"); 
 var collection = svg.children;
 
 if(drawing.resize.setElement)
   for (var i = 2; i < collection.length; i++) {
				if(collection[i]==drawing.resize.setElement){
					drawing.resize.setElement.after(collection[i-1]);
					console.log(' select :'+drawing.resize.setElement.getAttribute('name'));
					console.log('************************');

					drawing.modified = true;
					updatResult();
					break;
				}
			}
			
			excute();
			updateListElements();
}


function before_()
{
 var svg = document.getElementById("sym"); 
 var collection = svg.children;
 if(drawing.resize.setElement)
  for (var i = 1; i < collection.length-1; i++) {
				if(collection[i]==drawing.resize.setElement){
					drawing.resize.setElement.before(collection[i+1]);
					console.log(' select :'+drawing.resize.setElement.getAttribute('name'));
					console.log('************************');

					drawing.modified = true;
					updatResult();
					break;
				}
			}	
			excute();
			updateListElements();

}

function first_()
{
 var svg = document.getElementById("sym"); 
 var collection = svg.children;
 
 if(drawing.resize.setElement)
   for (var i =collection.length-1 ; i>=2 ; i--) {
				if(collection[i]==drawing.resize.setElement){
					drawing.resize.setElement.after(collection[i-1]);
					console.log(' select :'+drawing.resize.setElement.getAttribute('name'));
					console.log('************************');

					drawing.modified = true;
					updatResult();
				}
			}
			
			excute();
			updateListElements();
}

function appEnd_()
{
 var svg = document.getElementById("sym"); 
 var collection = svg.children;
 if(drawing.resize.setElement)
  for (var i = 1; i < collection.length-1; i++) {
				if(collection[i]==drawing.resize.setElement){
					drawing.resize.setElement.before(collection[i+1]);
					console.log(' select :'+drawing.resize.setElement.getAttribute('name'));
					console.log('************************');

					drawing.modified = true;
					updatResult();
				}
			}	
			excute();
			updateListElements();
}


function displayByPageType(){

  toolbarButtons.oscilloscope.style.display ="none";
  menuitems.oscilloscope.style.display ="none";
 // toolbarButtons.codePy.style.display ="none";
 // menuitems.codePy.style.display ="none";
  toolbarButtons.image.style.display ="none";
  menuitems.image.style.display ="none";
  
  if(drawing.pageType=="sym"){
    var displayPage="none";
    var displaySym="block";
  } else {
    var displayPage="block";
    var displaySym="none";
  }

  toolbarButtons.analysis.style.display =displayPage;
  menuitems.analysis.style.display =displayPage;
  toolbarButtons.runAnalysis.style.display =displayPage;
  menuitems.runAnalysis.style.display =displayPage;
  toolbarButtons.codeHTML.style.display =displayPage;
  menuitems.codeHTML.style.display =displayPage;
  toolbarButtons.gnd.style.display =displayPage;
  menuitems.gnd.style.display =displayPage;
  toolbarButtons.net.style.display =displayPage;
  menuitems.net.style.display =displayPage;
  toolbarButtons.probe.style.display =displayPage;
  menuitems.probe.style.display =displayPage;
 // toolbarButtons.codePy.style.display =displayPage;
 // menuitems.codePy.style.display =displayPage;

  toolbarButtons.pin.style.display =displaySym;
  menuitems.pin.style.display =displaySym;
  toolbarButtons.ref.style.display =displaySym;
  menuitems.ref.style.display =displaySym;
  toolbarButtons.param.style.display =displaySym;
  menuitems.param.style.display =displaySym;

}



let pressedKeys = new Set();

document.addEventListener("keydown", function(event) {
    
    let shortcut='';

    if(event.ctrlKey)
      shortcut='Control';
    else if(event.altKey)
      shortcut='Alt';
    else if(event.shiftKey)
      shortcut='Shift';
    shortcut=shortcut+'+'+event.key; 
    
   

    switch(shortcut) {
        case 'Control+o':
          setAction("openFile");
          break;

        case 'Control+n':
          setAction("newFile")
          break;

        case 'Control+n+s':
          setAction("newSymbol")
          break;

        case 'Control+s':
          setAction("saveFile")
          pressedKeys.clear();
          break;
    
        case 'Control+x':
            setAction("cut")
          break;
    
        case "Control+c":
          setAction("copy")
          break;
    
        case "Control+v":
          setAction("past")
          break;
    
        case "Control++":
          setAction("zoomIn")
        break;
    
        case "Control+-":
          setAction("zoomOut")
        break;
    
        case 'Shift+R':
          setAction("rotate")
          
        break;
    
        case 'Shift+H':
          setAction("horizontal")
        break;
    
        case 'Shift+V':
          setAction("vertically")
        break;
           
        case "Control+z":
          setAction("undo")
        break;
    
        case "Control+y":
          setAction("redo")
        break;

        case "F1":
          setAction("help")
        break;
    }
     
});

document.addEventListener("keyup", function(event) {
    pressedKeys.clear();
   

});





