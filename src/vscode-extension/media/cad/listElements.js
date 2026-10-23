
treeData = [
       {
         name: 'All Object',
         collapsed: true, 
         nodes: [],
		 elem: []
       }
    ];

async function start_listElements() {

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
		   name+=elem.firstChild.getAttribute("symbolname")
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
    const selectedNode = await openNodeSelector(
        treeData,
        select,  // pre-selected
        // دالة العودة تُستدعى عند كل نقرة على عنصر (بدون إغلاق النافذة)
        function(selectionInfo) {
            console.log('=== تم تحديد عنصر ===');
            console.log('الاسم:', selectionInfo.value);
            console.log('فهرس المجموعة:', selectionInfo.groupIndex);
            console.log('فهرس العنصر داخل المجموعة:', selectionInfo.nodeIndex);
            
            // مثال: يمكنك تنفيذ أي إجراء هنا مباشرة
            // updateComponent(selectionInfo.value);
        }
    );
    
    // تُرجع null فقط عند إغلاق النافذة بزر X
    if (selectedNode === null) {
        console.log('تم إغلاق مربع الحوار');
    }
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
		   name+=elem.firstChild.getAttribute("symbolname")
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