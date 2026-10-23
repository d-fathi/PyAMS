
/*
#-------------------------------------------------------------------------------
# Name:        port.js  add port symbol
# Author:      d.fathi
# Created:     04/08/2026
# Updated:     26/09/2026
# Copyright:   (c) PyAMS 2026
# Licence:    free
#-------------------------------------------------------------------------------
 */

function addPort(){
    var port_description='<g width="0" top="0" left="0" height="0" zoom="8" symbol="{&quot;name&quot;:&quot;Port&quot;,&quot;reference&quot;:&quot;Port&quot;,&quot;device&quot;:{&quot;type&quot;:&quot;std&quot;,&quot;name&quot;:&quot;Port&quot;}}" maxsize="30" direction="Bi-Direct"  setref="Port"></g>';
    var port_pin='<g points="0,5 8,5 " class="polyline" name="pin" type="simple"><polyline points="40,50 40,50 " style="stroke: rgb(255, 255, 127); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="37" y="47" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="42" y="52" transform="rotate(0 42 52)" style="font-size: 7px; font-family: Arial; fill: rgb(187, 33, 166);">port</text><text r="0" x="40" y="50" transform="rotate(0 40 50)" style="font-size: 7px; font-family: Arial; display: none; fill: rgb(0, 0, 0);"> </text><ellipse cx="38.5" cy="50" rx="1.5" ry="1.5" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></ellipse><polygon points="40,48.5 40,51.5 41.5,50 " style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></polygon></g>';
    var port_polygon='<polygon points="30,0 34,5 30,10 6,10 1,5 6,0" class="draggable" name="polygon" style="stroke: #2196f3; fill: rgb(255, 255, 127); stroke-width: 1px;filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));"></polygon>';
    var port_polyline='<polyline points="0,5 1,5 " class="polyline" name="polyline" style="stroke: #2196f3; fill: none; stroke-width: 1px;"></polyline>';  
    drawing.dir='std';
    drawing.libLocale=true;
    drawing.symbolfile='PORT';
    drawing.shapes.part=port_description+port_polygon+port_pin+port_polyline;
    drawing.shapes.addElement('part');
    addShape('part');
}


function portRotate(element) {

       if(element.getAttribute("directory")!='std')
            return;

       var sym=JSON.parse(element.firstChild.getAttribute("symbol"));

        if(sym.name!="Port")
            return;

        var pin = element.querySelector('[name="pin"]');
        var bbox = pin.childNodes[2].getBBox();
        var polygon = element.querySelector('[name="polygon"]');
        var polyline = element.querySelector('[name="polyline"]');

        var dir=element.firstChild.getAttribute("direction");

        var pi = getArrayPoints(pin);
        var pl = getArrayPoints(polygon);
        var pline = getArrayPoints(polyline);

        drawingPin(pin);

        bbox.width=bbox.width+10;

        if(pi[0].x > pi[1].x) {
         
            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x-5;
            pl[2].x = pi[0].x-5-bbox.width;
            pl[3].x = pi[0].x-10-bbox.width;
            pl[4].x = pi[0].x-5-bbox.width;
            pl[5].x = pi[0].x-5;

            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y-5;
            pl[2].y = pi[0].y-5;
            pl[3].y = pi[0].y;
            pl[4].y = pi[0].y+5;
            pl[5].y = pi[0].y+5;



           if(dir=='Input'){
            pl[3].x =pl[2].x ;
           } else if(dir=='Output'){
            pl[1].x =pl[0].x ;
            pl[5].x =pl[0].x ;
           }



        } else if(pi[0].x < pi[1].x) {          
            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x+5;
            pl[2].x = pi[0].x+5+bbox.width;
            pl[3].x = pi[0].x+10+bbox.width;
            pl[4].x = pi[0].x+5+bbox.width;
            pl[5].x = pi[0].x+5;

            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y-5;
            pl[2].y = pi[0].y-5;
            pl[3].y = pi[0].y;
            pl[4].y = pi[0].y+5;
            pl[5].y = pi[0].y+5;


            if(dir=='Input'){
            pl[3].x =pl[2].x ;
           } else if(dir=='Output'){
            pl[1].x =pl[0].x ;
            pl[5].x =pl[0].x ;
           }

        } else if(pi[0].y > pi[1].y) {
         
            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y-5;
            pl[2].y = pi[0].y-5-bbox.width;
            pl[3].y = pi[0].y-10-bbox.width;
            pl[4].y = pi[0].y-5-bbox.width;
            pl[5].y = pi[0].y-5;

            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x-5;
            pl[2].x = pi[0].x-5;
            pl[3].x = pi[0].x;
            pl[4].x = pi[0].x+5;
            pl[5].x = pi[0].x+5;


            if(dir=='Input'){
            pl[3].y =pl[2].y ;
           } else if(dir=='Output'){
            pl[1].y =pl[0].y ;
            pl[5].y =pl[0].y ;
           }


        } else if(pi[0].y < pi[1].y) {          
            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y+5;
            pl[2].y = pi[0].y+5+bbox.width;
            pl[3].y = pi[0].y+10+bbox.width;
            pl[4].y = pi[0].y+5+bbox.width;
            pl[5].y = pi[0].y+5;

            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x-5;
            pl[2].x = pi[0].x-5;
            pl[3].x = pi[0].x;
            pl[4].x = pi[0].x+5;
            pl[5].x = pi[0].x+5;


            if(dir=='Input'){
            pl[3].y =pl[2].y ;
           } else if(dir=='Output'){
            pl[1].y =pl[0].y ;
            pl[5].y =pl[0].y ;
           }
        }


        var xmin=pl[0].x;
        var ymin=pl[0].y;

        var xmax=pl[0].x;
        var ymax=pl[0].y;

        for(var i=0; i<pl.length; i++){
          if(pl[i].x <xmin) xmin=pl[i].x;
          if(pl[i].y <ymin) ymin=pl[i].y;

          if(pl[i].x >xmax) xmax=pl[i].x;
          if(pl[i].y >ymax) ymax=pl[i].y;
        }

        xmin=parseInt(xmin/5)*5;
        ymin=parseInt(ymin/5)*5;
        xmax=parseInt(xmax/5)*5;
        ymax=parseInt(ymax/5)*5;

        for(var i=0; i<pl.length; i++){
          pl[i].x -= xmin;
          pl[i].y -= ymin;
        }

        for(var i=0; i<pi.length; i++){
          pi[i].x -= xmin;
          pi[i].y -= ymin;
        }

        for(var i=0; i<pline.length; i++){
          pline[i].x -= xmin;
          pline[i].y -= ymin;
        }

        pin.setAttribute("points", polylineToAttribute(pi, 0, 0));
        drawingPin(pin);

        polyline.setAttribute("points", polylineToAttribute(pline, 0, 0));
        polygon.setAttribute("points", polylineToAttribute(pl, 0, 0));

        width=xmax-xmin;
        height=ymax-ymin;
        element.setAttribute("width", parseInt(width/5)*5);
        element.setAttribute("height", parseInt(height/5)*5);
    
}