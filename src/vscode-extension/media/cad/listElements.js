
treeData = [
       {
         name: 'All elements',
         collapsed: true, 
         nodes: [],
		 elem: []
       }
    ];

// Name shown for a part: the model name (falls back to the symbol / device name)
function listPartModelName(part) {
	var n = '';
	try {
		var sym = JSON.parse(part.firstChild.getAttribute("symbol"));
		var bad = function (v) { return !v || v === 'None' || v === 'null'; };
		if (sym.model && !bad(sym.model.name)) n = sym.model.name;
		else if (sym.device && !bad(sym.device.name)) n = sym.device.name;
		else if (!bad(sym.name)) n = sym.name;
	} catch (e) {}
	if (!n) n = part.firstChild.getAttribute("symbolname") || part.firstChild.getAttribute("modelname") || 'part';
	return n;
}

// Text shown for a text element: the whole text when shorter than 5 characters,
// otherwise its first 3 characters followed by ".."
function listTextLabel(elem) {
	var t = (elem.textContent || '').replace(/\s+/g, ' ').trim();
	if (t.length < 5) return t;
	return t.substring(0, 3) + '..';
}

// Rebuild treeData from the drawing (children of #sym, the first one is the page description).
// Returns the label of the element that is currently selected in the drawing ('' if none).
function buildListElements() {
	var svg = document.getElementById("sym");
	var collection = svg.children;
	treeData[0].nodes = [];
	treeData[0].elem = [];
	treeData[0].collapsed = false;
	var select = '';

	for (var i = 1; i < collection.length; i++) {
		var elem = collection[i];
		var name = 'Pos ' + i + ': ';
		var t = elem.getAttribute("name");
		if (t == 'pin') {
			name += 'pin [' + elem.childNodes[2].textContent + ']';
		} else if (t == 'part') {
			name += listPartModelName(elem);
			name += ' [' + elem.getAttribute("sref") + ']';
		} else if (t == 'ref') {
			name += 'ref [' + elem.textContent + ']';
		} else if (t == 'param') {
			name += 'param [' + elem.textContent + ']';
		} else if (t == 'net') {
			name += 'wire [' + elem.getAttribute("ref") + ']';
		} else if (t == 'text') {
			name += 'text [' + listTextLabel(elem) + ']';
		} else {
			name += t;
		}
		treeData[0].nodes.push(name);
		treeData[0].elem.push(elem);
		if (elem == drawing.resize.setElement)
			select = name;
	}
	return select;
}

// The selection of the drawing changed (click in the schematic, new element, delete...):
// show it in the open element list. Called by showDescriptionElemSelectInPanel.
function syncListElementsSelection(elem) {
	if (typeof nodeSelectorDialog === 'undefined' || !nodeSelectorDialog || !nodeSelectorDialog.isVisible) return;
	if (!nodeSelectorDialog.onReorder) return;      // the dialog is used for something else
	var svg = document.getElementById("sym");
	var list = treeData[0].elem;
	var idx = list.indexOf(elem);
	// the drawing has changed since the list was built (element added or deleted): rebuild it
	if (svg.children.length - 1 !== list.length || (elem && idx < 0 && elem.parentNode === svg)) {
		var sel = buildListElements();
		nodeSelectorDialog.initData(treeData, sel);
		idx = treeData[0].elem.indexOf(elem);
	}
	nodeSelectorDialog.selectByIndex(0, elem ? idx : null);
}

// Select an element of the list in the drawing
function selectListElement(elem) {
	if (!elem || !elem.parentNode) return;
	drawing.resize.deletEllipse();
	drawing.resize.setElement = elem;
	drawing.resize.creatEllipse();
}

// Change the z-order of an element: 'front' | 'back' | 'forward' | 'backward'
function reorderListElement(action, elem) {
	var svg = document.getElementById("sym");
	if (!elem || elem.parentNode !== svg) return false;
	var first = svg.children[0];
	var changed = false;

	drawing.resize.deletEllipse();           // selection handles live in the drawing: remove them while moving

	switch (action) {
	case 'front':
		if (svg.lastElementChild !== elem) { svg.appendChild(elem); changed = true; }
		break;
	case 'back':
		if (svg.children[1] !== elem) { svg.insertBefore(elem, svg.children[1]); changed = true; }
		break;
	case 'forward':
		var next = elem.nextElementSibling;
		if (next) { svg.insertBefore(next, elem); changed = true; }
		break;
	case 'backward':
		var prev = elem.previousElementSibling;
		if (prev && prev !== first) { svg.insertBefore(elem, prev); changed = true; }
		break;
	}

	selectListElement(elem);
	if (changed) drawing.saveData('Changed order of elements');
	return changed;
}

// keyboard shortcuts: change the order of the selected element
function orderSelectedElement(action) {
	var elem = drawing.resize.setElement;
	if (elem) reorderListElement(action, elem);
}

// Show the elements of the drawing in the node selector dialog; the dialog also changes their order
async function start_listElements() {
	var select = buildListElements();

	function refresh(elem) {
		var sel = buildListElements();
		nodeSelectorDialog.initData(treeData, sel);
	}

	await openNodeSelector(
		treeData,
		select,
		// called on each click on an element of the list (the dialog stays open)
		function (info) {
			selectListElement(treeData[0].elem[info.nodeIndex]);
			refresh();
		},
		// called by the order buttons of the dialog
		function (action, info) {
			var elem = info ? treeData[0].elem[info.nodeIndex] : drawing.resize.setElement;
			if (!elem) return;
			reorderListElement(action, elem);
			refresh();
		},
		{ title: 'Drawing elements', selectedLabel: 'Selected element' }
	);
}

/*
#-------------------------------------------------------------------------------
# Name:        listElements.js
# Author:      d.fathi
# Created:     28-04-2021
# Update:      02-08-2026
# Copyright:  (c) PyAMS 2026
# Licence:    free (MIT)
#-------------------------------------------------------------------------------
*/

function getListElementsAddToPageDescription()
{
	var svg = document.getElementById("sym");
	var selecElem=drawing.resize.setElement;
	
	var collection = svg.children;
	treeData[0].nodes=[];
	treeData[0].elem=[];
	var select='';
	var analyze=0;

	for(var i=1; i< collection.length;i++)
	{
	   var elem = collection[i];
	   var name='Pos '+i+': ';
	   if(elem.getAttribute("name")=='pin'){
		   name+='pin ['+elem.childNodes[2].textContent+']';
	   } else if(elem.getAttribute("name")=='part'){
		   name+=listPartModelName(elem)
		   name+=' ['+elem.getAttribute("sref")+']';
	   } else if(elem.getAttribute("name")=='ref'){
		   name+='ref ['+elem.textContent+']';
	   } else if(elem.getAttribute("name")=='param'){
		   name+='param ['+elem.textContent+']';
	   } else if(elem.getAttribute("name")=='net'){
		   name+='wire ['+elem.getAttribute("ref")+']';
	   } else /*if(elem.getAttribute("name")=='analysis'){
		   analyze++;
		   name+='analysis ['+analyze+']';
	   }*/ {
		   name+=elem.getAttribute("name");
	   }

	    treeData[0].nodes.push(name);
		treeData[0].elem.push(elem);
		if(elem==drawing.resize.setElement)
			select=name;

	}
	
	init(treeData,select);
}
/*
function selectElemByIndex(select){
	var list=treeData[0].nodes;
	for(var i=0; i< list.length; i++){
		if(list[i]==select){
			drawing.resize.deletEllipse();
			drawing.resize.setElement=treeData[0].elem[i];
			drawing.resize.creatEllipse();
			drawing.objectInspector.getSelect(treeData[0].elem[i]);
			break;
		}
	}

}
*/