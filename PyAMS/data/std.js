/*
#-------------------------------------------------------------------------------
# Name:        std.js
# Author:      d.fathi
# Created:     05/07/2021
# Copyright:   (c) PyAMS 2021
# Licence:
#-------------------------------------------------------------------------------
 */

function addGnd()
{
 drawing.dir='standard';
 drawing.libLocale=true;
 drawing.symbolfile='GND';
 drawing.shapes.part='<g width="150" top="572" left="0" height="150" zoom="20" reference="0" std="true" description=" " model="GND" setref="GND" symbolname="GND"></g><polyline points="24,57 36,57 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><polyline points="28,59 32,59 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><g points="30,50 30,55 " class="polyline" name="pin" type="simple"><polyline points="30,50 30,55 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="27" y="47" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="28" y="57" transform="rotate(90 28 57)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">p</text><text r="0" x="30" y="50" transform="rotate(0 30 50)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;"> </text><ellipse cx="30" cy="51.5" rx="3.5" ry="3.5" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></ellipse><polygon points="26.5,55 33.5,55 30,58.5 " style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></polygon></g><polyline points="22,55 38,55 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline>';
 drawing.add('part');
 addShape('part');
}

function addPart(part,dir,libLocale,symbolfile)
{
 drawing.shapes.part=part;
 drawing.dir=dir;
 drawing.libLocale=libLocale;
 drawing.symbolfile=symbolfile;
 drawing.add('part');
 addShape('part');
}

function endDrawing()
{
	if(drawing.shapes.design.start)
	 drawing.saveData('Add :'+drawing.shapes.design.name);
	 drawing.shapes.design = {
        mouse: false,
        start: false,
        name: '',
        end: false
    }
}
