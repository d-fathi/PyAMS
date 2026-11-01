/*
#-------------------------------------------------------------------------------
# Name:        tool Button
# Author:      d.fathi
# Created:     25/07/2021
# Copyright:   (c) PyAMS 2021
# Licence:
#-------------------------------------------------------------------------------
 */



function creatToolButton(id)
{
	
var S=`
<a class="myButton"  onclick="appClick('zoomIn')">zoom In</a>';
<a class="myButton"  onclick="appClick('zoomOut')">zoom Out</a>

<a class="myButton"  onclick="appClick('analysis')">Analysis</a>
<a class="myButton"  onclick="appClick('text')">text</a>
<a class="myButton"  onclick="appClick('label')">label</a>
<a class="myButton"  onclick="appClick('param')">param</a>
<a class="myButton"  onclick="appClick('ref')">ref</a>
<a class="myButton"  onclick="appClick('pin')">pin</a>
<a class="myButton"  onclick="appClick('ioparam')">ioparam</a>
<a class="myButton"  onclick="appClick('probe')">probe</a>
<a class="myButton"  onclick="appClick('undo')">Undo</a>
<a class="myButton"  onclick="appClick('redo')">Redo</a>
<a class="myButton"  onclick="appClick('part1')">GND</a>
<a class="myButton"  onclick="appClick('part2')">part2</a>
<a class="myButton"  onclick="appClick('part3')">part3</a>
<a class="myButton"  onclick="excute()">excute</a>
<a class="myButton"  onclick="after_()">after</a>
<a class="myButton"  onclick="before_()()">before</a>
<a class="myButton"  onclick="first_()">first</a>
<a class="myButton"  onclick="appEnd_()">appEnd</a>
<a class="myButton"  onclick="drawing.resize.rot()">rot</a>
<a class="myButton"  onclick="drawing.shapes.addElement('oscilloscope')">oscilloscope</a>
<a class="myButton"  onclick="plots()">plot</a>
<a class="myButton"  onclick="appClick('net')">net</a>
<a class="myButton"  onclick="openpage()">circuit</a>
<a class="myButton"  onclick="addParmInOut()">addParmInOut</a>
<a class="myButton"  onclick="endDrawing()">End drawing</a>
<a class="myButton"  onclick="rotatePart()">rotate Part</a>
<a class="myButton"  onclick="rotatePart()">rotate Part</a>
<a class="myButton"  onclick="flipVerticallyPart()">flip Vertically Part</a>
<a class="myButton"  onclick="flipHorizontalPart()">flip Horizontal Part</a>
<a class="myButton"  onclick="addID()">Add ID</a>
<a class="myButton"  onclick="removeID()">Remove ID</a>
<a class="myButton"  onclick="addClick()">Add Click</a>
<a class="myButton"  onclick="removeClick()">Remove Click</a>
`;

//const body = document.getElementById(id);

function addmenuItem(name,m)
{
	s='<div class="dropdown"><button class="dropbtn">'+name+'<i class="fa fa-caret-down"></i></button><div class="dropdown-content">';
	for(var i=0; i<m.length;i++)
     s=s+"<a onclick='"+m[i].onclick+"'>"+m[i].name+"</a>";
    s=s+'</div></div>'; 
	return s;
}

if(drawing.usedByInterface)
{
	
	
Edit=[{'name':'Copy','onclick':'appClick("copy")'},{'name':'Past','onclick':'appClick("past")'},{'name':'Cut','onclick':'appClick("cut")'}];
Add=[];
Add.push({'name':'Rect','onclick':'appClick("rect")'});
Add.push({'name':'Ellipse','onclick':'appClick("ellipse")'});
Add.push({'name':'Arc','onclick':'appClick("arc")'});
Add.push({'name':'Polyline','onclick':'appClick("polyline")'});
Add.push({'name':'Polygon','onclick':'appClick("polygon")'});

m=addmenuItem('Edit',Edit);
m=m+addmenuItem('Add',Add)

s='<div class="navbar">'+m+'</div>';

  //document.getElementById("flex").style.height="calc(100% - 60px)";
 // document.getElementById("toolbutton").innerHTML=s;
  
}
else {
 document.getElementById("flex").style.height="calc(100% - 10px)";
}
	

}



function appClick(argument) {

    switch (argument) {
    case 'zoomIn':
        drawing.zoomIn();
        break;
    case 'zoomOut':
        drawing.zoomOut();
        break;
    case 'undo':
        drawing.undo();
        break;
    case 'redo':
        drawing.redo();
        break;
	case 'copy':
        drawing.copy();
        break;
    case 'cut':
        drawing.cut();
        break;
    case 'past':
        drawing.past();
        break;
		
	case 'part1':
	   addGnd();
        break;
		
	case 'part2':
	    part='<g width="180" top="180" left="619" height="100" version="0.0.1" zoom="12" reference="I" description=" " modelname="DC Voltage" symbolname="DC Current"></g><ellipse class="draggable" name="ellipse" cx="105" cy="55" rx="15" ry="15" style="stroke: rgb(0, 0, 255); fill: rgb(255, 255, 127); stroke-width: 1px;"></ellipse><rect class="draggable" x="93" y="50" name="rect" width="24" height="10" style="stroke: rgb(0, 0, 255); fill: rgb(0, 0, 0); stroke-width: 1px;"></rect><text class="draggable" name="text" x="95" y="56" r="0" rtemp="0" transform="rotate(0 95 56)" style="fill: rgb(255, 0, 0); font-weight: normal; font-style: normal; font-size: 4px; font-family: &quot;Times New Roman&quot;;">Text styling</text><g points="105,30 105,40 " class="polyline" name="pin" type="simple"><polyline points="105,30 105,40 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="102" y="27" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="103" y="42" transform="rotate(90 103 42)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin1</text><text r="0" x="105" y="30" transform="rotate(0 105 30)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;"> </text><ellipse cx="105" cy="36.5" rx="3.5" ry="3.5" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></ellipse><polygon points="101.5,40 108.5,40 105,43.5 " style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></polygon></g><g points="105,80 105,70 " class="polyline" name="pin" type="simple"><polyline points="105,80 105,70 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="102" y="77" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="103" y="68" transform="rotate(90 103 68)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin2</text><text r="0" x="105" y="80" transform="rotate(0 105 80)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;"> </text><ellipse cx="105" cy="73.5" rx="3.5" ry="3.5" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></ellipse><polygon points="101.5,70 108.5,70 105,66.5 " style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></polygon></g>';
		addPart(part,'****',true)
        break;
	
	case 'part3':
	    part='<g points="30,60 40,60 " std="false" class="polyline" name="pin" width="150" height="150" zoom="9.999999999999996" left="0" top="251" modelname="Resistor" reference="R" description=" Resistor"><polyline points="30,60 40,60 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="27" y="57" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="42" y="62" transform="rotate(0 42 62)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin1</text></g><g points="80,60 70,60 " class="polyline" name="pin"><polyline points="80,60 70,60 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="77" y="57" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="70" y="62" transform="rotate(0 70 62)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin2</text></g><polyline points="39,60 45,60 48,50 52,70 57,50 61,70 67,50 69,60 73,60 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><text class="draggable" name="param" x="46" y="98" r="0" transform="rotate(0 46 98)" style="fill: rgb(17, 162, 41); font-size: 12px; font-family: &quot;Times New Roman&quot;;">R=100Ω </text><text class="draggable" name="ref" x="46" y="86" r="0" transform="rotate(0 46 86)" style="fill: rgb(17, 162, 41); font-size: 12px; font-family: &quot;Times New Roman&quot;;">R?</text>';
        addPart(part,'****',true);
        break;


		
	case 'getPart':
        drawing.add('getPart');
        break;

    default:
	   addShape(argument);

    }
}


function openpage()
{
	var cir='<g width="1500" top="0" left="0" height="1500" version="0.0.1" zoom="1.6" reference="X" description=" " modelname="NewModel"></g><g x="285" y="345" transform="translate(285,345)" width="25" height="15" class="part" name="part" xo="0" yo="0" sref="01" directory="standard" liblocale="true"><g width="150" top="572" left="0" height="150" zoom="20" reference="0" std="true" description=" " setref="GND" modelname="GND"></g><g points="15,5 15,10" class="polyline" name="pin" netid="2" netidpos="4" netId="2" netIdPos="4"><polyline points="15,5 15,10 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="12" y="2" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px; display: none;"></rect><text r="0" x="13" y="12" transform="rotate(90 13 12)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin2</text></g><polyline points="7,10 23,10 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><polyline points="9,12 21,12 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><polyline points="13,14 17,14 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline></g><g x="690" y="320" transform="translate(690,320)" width="25" height="15" class="part" name="part" xo="0" yo="0" sref="02" directory="standard" liblocale="true"><g width="150" top="572" left="0" height="150" zoom="20" reference="0" std="true" description=" " setref="GND" modelname="GND"></g><g points="15,5 15,10" class="polyline" name="pin" netid="0" netidpos="0" netId="0" netIdPos="0"><polyline points="15,5 15,10 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="12" y="2" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px; display: none;"></rect><text r="0" x="13" y="12" transform="rotate(90 13 12)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin2</text></g><polyline points="7,10 23,10 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><polyline points="9,12 21,12 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><polyline points="13,14 17,14 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline></g><polyline points="705,325 705,200 590,200 " class="polyline" name="net" xdir="true" ref="0" parent="false" parentcolor="false" used="true" id="0" node0="-1" node1="-1" style="stroke: rgb(0, 0, 0); fill: none; stroke-width: 1px;"></polyline><polyline points="545,200 540,200 400,200 " class="polyline" name="net" xdir="true" ref="N02" parent="false" parentcolor="false" used="true" id="1" node0="-1" node1="-1" style="stroke: rgb(0, 0, 0); fill: none; stroke-width: 1px;"></polyline><polyline points="355,200 355,200 300,200 300,350 300,350 " class="polyline" name="net" xdir="true" ref="0" parent="false" parentcolor="false" used="true" id="2" node0="-1" node1="-1" style="stroke: rgb(0, 0, 0); fill: none; stroke-width: 1px;"></polyline><g x="350" y="185" transform="translate(350,185)" width="50" height="25" class="part" name="part" xo="0" yo="0" sref="R1" directory="basic" liblocale="true" modelname="Resistor"><g width="150" height="150" std="false" zoom="12.599999999999987" left="0" top="392" modelname="Resistor" reference="R" description=" Resistor"></g><g points="5,15 15,15" class="polyline" name="pin" width="150" height="150" zoom="9" left="0" top="418" modelname="Resistor" reference="R" description=" Resistor" netId="2" netIdPos="0"><polyline points="5,15 15,15 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="2" y="12" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px; display: none;"></rect><text r="0" x="17" y="17" transform="rotate(0 17 17)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin1</text></g><g points="50,15 40,15" class="polyline" name="pin" netId="1" netIdPos="2"><polyline points="50,15 40,15 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="47" y="12" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px; display: none;"></rect><text r="0" x="40" y="17" transform="rotate(0 40 17)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin2</text></g><polyline points="10,15 15,15 18,7 22,21 28,7 32,21 38,7 40,15 46,15 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><text class="var" name="param" x="21" y="46" r="0" transform="rotate(0 21 46)" style="fill: rgb(17, 162, 41); font-size: 12px; font-family: &quot;Times New Roman&quot;;">R=100Ω </text><text class="var" name="ref" x="21" y="36" r="0" transform="rotate(0 21 36)" style="fill: rgb(17, 162, 41); font-size: 12px; font-family: &quot;Times New Roman&quot;;">R1</text></g><g x="540" y="185" transform="translate(540,185)" width="50" height="25" class="part" name="part" xo="0" yo="0" sref="R2" directory="basic" liblocale="true" modelname="Resistor"><g width="150" height="150" std="false" zoom="12.599999999999987" left="0" top="392" modelname="Resistor" reference="R" description=" Resistor"></g><g points="5,15 15,15" class="polyline" name="pin" width="150" height="150" zoom="9" left="0" top="418" modelname="Resistor" reference="R" description=" Resistor" netId="1" netIdPos="0"><polyline points="5,15 15,15 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="2" y="12" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px; display: none;"></rect><text r="0" x="17" y="17" transform="rotate(0 17 17)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin1</text></g><g points="50,15 40,15" class="polyline" name="pin" netId="0" netIdPos="2"><polyline points="50,15 40,15 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="47" y="12" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px; display: none;"></rect><text r="0" x="40" y="17" transform="rotate(0 40 17)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">pin2</text></g><polyline points="10,15 15,15 18,7 22,21 28,7 32,21 38,7 40,15 46,15 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><text class="var" name="param" x="21" y="46" r="0" transform="rotate(0 21 46)" style="fill: rgb(17, 162, 41); font-size: 12px; font-family: &quot;Times New Roman&quot;;">R=100Ω </text><text class="var" name="ref" x="21" y="36" r="0" transform="rotate(0 21 36)" style="fill: rgb(17, 162, 41); font-size: 12px; font-family: &quot;Times New Roman&quot;;">R2</text></g>';
	drawing.setSymbol(cir);
   updatResult();
}




function addID()
{
 drawing.resize.setElement.setAttribute('rid','#');
 getDescription(drawing.resize,drawing.resize.setElement);
}


function removeID()
{
 drawing.resize.setElement.removeAttribute('rid');
 getDescription(drawing.resize,drawing.resize.setElement);
}


function addClick()
{
 drawing.resize.setElement.setAttribute('click','defName(args)');
 getDescription(drawing.resize,drawing.resize.setElement);
}


function removeClick()
{
 drawing.resize.setElement.removeAttribute('click');
 getDescription(drawing.resize,drawing.resize.setElement);
}



