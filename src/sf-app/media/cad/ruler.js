
/*
#--------------------------------------------------------------------------------------------------
# Name:        ruler.js
# Author:      d.fathi
# Created:     17/06/2021
# Update:      05/08/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free
#--------------------------------------------------------------------------------------------------
*/
 
//------------------function for creat  ruler V/H---------------------------------------------------//
 function rulerV(areaGlobal,areaB,zoom,px,width) {
	var svg=areaB.firstElementChild;
	//console.log(svg.textContent);
	svg.innerHTML = "";
	var w =parseInt(svg.clientWidth);
	var i=0;
	var n=1;
	var s='';
	var r= parseInt(areaGlobal.scrollLeft);
	if(zoom <0.8) n=2;
	s=s+'<rect x="0"  y="0" width='+zoom*(width+4)+' height='+24+' fill="LightGray" stroke="Black" stroke-width="0.2" />';
	
	var g='<path fill="none" stroke="gray" d="';
	for (var i = 0; i <=width; i = i +px)
                g = g + "M " + (i*zoom-r) + " 15 V 20 ";
     g=g+'"  />';
	 
	width=width-px*10*n;
	i=0;
	while (i<width)
	{
		i=i+px*10*n;
		s=s+'<text class="setFont" x="'+(i*zoom-r)+'" y="12">'+i+'</text>';
		
	}
	
	s=s+g;
	svg.innerHTML =s;	
}


 function rulerH(areaGlobal,areaC,zoom,px,height)
{
	var svg=areaC.firstElementChild;
	//console.log(svg.textContent);
	svg.innerHTML = "";
	var w =parseInt(svg.clientWidth);
	var i=0;
	var n=1;
	var s='';
	var r= parseInt(areaGlobal.scrollTop);
	if(zoom <0.8) n=2;
	s=s+'<rect x="0"  y="0" height='+zoom*(height+4)+' width='+24+' fill="LightGray" stroke="Black" stroke-width="0.2" />';
	
	var g='<path fill="none" stroke="gray" d="';
	for (var i = 0; i <=height; i = i +px)
                g = g + "M 15 " + (i*zoom-r) + "  H 20 ";
     g=g+'"  />';
	 
	height=height-px*10*n;
	i=0;
	while (i<height)
	{
		i=i+px*10*n;
		s=s+'<text class="setFont"   transform="translate(12,'+(i*zoom-r)+') rotate(-90)">'+i+'</text>';
		
	}
	
	s=s+g;
	svg.innerHTML =s;	
}


function setRuler(grid)
{
 var area=grid.area;
 rulerV(area.areaGlobal,area.areaB,grid.zoom,grid.px,grid.width);
 rulerH(area.areaGlobal,area.areaC,grid.zoom,grid.px,grid.height); 
}
