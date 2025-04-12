
function getListElementsAddToPageDescription()
{



if(drawing.pageType!="sym") return;

var svg = document.getElementById("sym");
var selecElem=drawing.resize.setElement;
s='<div class="vertical-menu">';

	var collection = svg.children;
	for(var i=1; i< collection.length;i++)
	{
	   var elem = collection[i];

	   if(elem.getAttribute("name")=='pin')
		  var name='pin ['+elem.childNodes[2].textContent+']';
	   else 
	      var name=elem.getAttribute("name");

	   if(elem==selecElem)
		     s=s+'<a  class="active">'+name+'</a>';
	   else
             s=s+'<a  onclick="selectElemByIndex('+i+')">'+name+'</a>';
	}
s=s+'</div>';
document.getElementById("elemlibPage").innerHTML=s;
}

function selectElemByIndex(i){
	var svg = document.getElementById("sym");
	var collection = svg.children;
	var elem = collection[i];
	drawing.resize.deletEllipse();
	drawing.resize.setElement=elem;
	drawing.resize.creatEllipse();
	drawing.objectInspector.getSelect(elem);
	getListElementsAddToPageDescription();


}


function updateListElements()
{
	getListElementsAddToPageDescription();
}
