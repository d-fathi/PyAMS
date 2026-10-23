/*
#-------------------------------------------------------------------------------
# Name:        vbar.js voltage bar symbol
# Author:      d.fathi
# Created:     05/08/2026
# Updated:     05/08/2026
# Copyright:   (c) PyAMS 2026
# Licence:    free
#-------------------------------------------------------------------------------
 */

function addVBar(){
    var vbar_description='<g width="350" top="0" left="0" height="350"  zoom="7.000000000000001" symbol="{&quot;name&quot;:&quot;VBar&quot;,&quot;reference&quot;:&quot;Vcc&quot;,&quot;device&quot;:{&quot;type&quot;:&quot;std&quot;,&quot;name&quot;:&quot;VBar&quot;}}"></g>';
    var vbar_pin='<g points="100,40 100,30 " class="polyline" name="pin" type="simple"><polyline points="100,40 100,30 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="97" y="37" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="98" y="28" transform="rotate(90 98 28)" style="font-size: 7px; font-family: Arial; display: none; fill: rgb(0, 0, 0);">vcc</text><text r="0" x="100" y="40" transform="rotate(0 100 40)" style="font-size: 7px; font-family: Arial; display: none; fill: rgb(0, 0, 0);"> </text><ellipse cx="100" cy="31.5" rx="1.5" ry="1.5" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></ellipse><polygon points="98.5,30 101.5,30 100,28.5 " style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></polygon></g>';
    var vbar_polyline='<polyline points="109,25 100,25 100,35 100,25 92,25 " class="polyline" name="polyline" style="stroke: #2196f3; fill: none; stroke-width: 1px;"></polyline>';
    var vbar_text='<text class="draggable" name="text" x="94" y="22" r="0" rtemp="0" transform="rotate(0 94 22)" style="fill: rgb(251, 0, 255); font-weight: normal; font-style: normal; font-size: 9px; font-family: normal;">Vcc</text>';
    drawing.dir='std';
    drawing.shapes.part=vbar_description+vbar_pin+vbar_polyline+vbar_text;
    drawing.shapes.addElement('part');
    addShape('part');
}