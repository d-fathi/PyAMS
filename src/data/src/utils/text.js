

function getRectOfText(elem)
{
	var points=[];
	var bbox = elem.getBBox();
    var w = bbox.width;
    var h = bbox.height;
    var xr = parseInt(elem.getAttribute("x"));
    var yr = parseInt(elem.getAttribute("y"));
    var r = parseInt(elem.getAttribute("r"));


    if (r == 0)
        var points = [{
                x: xr,
                y: yr+(h/2)
            }, {
                x: xr + w,
                y: yr+(h/2)
            }, {
                x: xr + w,
                y: yr - h
            }, {
                x: xr,
                y: yr - h
            }, {
                x: xr,
                y: yr+(h/2)
            }
        ];
    if (r == 180)
        var points = [{
                x: xr,
                y: yr-(h/2)
            }, {
                x: xr - w,
                y: yr-(h/2)
            }, {
                x: xr - w,
                y: yr + h
            }, {
                x: xr,
                y: yr + h
            }, {
                x: xr,
                y: yr-(h/2)
            }
        ];
    else if (r == 90)
        var points = [{
                x: xr-(h/2),
                y: yr
            }, {
                x: xr-(h/2),
                y: yr + w
            }, {
                x: xr + h,
                y: yr + w
            }, {
                x: xr + h,
                y: yr
            }, {
                x: xr-(h/2),
                y: yr
            }
        ];
    else if (r == 270)
        var points = [{
                x: xr+(h/2),
                y: yr
            }, {
                x: xr+(h/2),
                y: yr - w
            }, {
                x: xr - h,
                y: yr - w
            }, {
                x: xr - h,
                y: yr
            }, {
                x: xr+(h/2),
                y: yr
            }
        ];

		return points;
}

function orginePosText(e){

    if(!e.getAttribute("xo"))
        {
            var x = parseInt(e.getAttribute("x"));
            var y = parseInt(e.getAttribute("y"));
            var r = parseInt(e.getAttribute("r"));

            var bbox = e.getBBox();
            var w = bbox.width;
            var h = bbox.height;

          

            e.setAttribute("xo",x);
            e.setAttribute("yo",y-(h/4));
            e.setAttribute("x1",x+w);
            e.setAttribute("y1",y-(h/4));
            e.setAttribute("w",w);
            e.setAttribute("h",h);
            e.setAttribute("ro",r); 

            if(r==90){
                e.setAttribute("xo",x+(h/4));
                e.setAttribute("yo",y);
                e.setAttribute("x1",x+(h/4));
                e.setAttribute("y1",y+w);
            }
     /*   var v=e.parentElement;
          var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
          newElement.style.stroke = "#ff0000";
          newElement.style.point = "none";
          newElement.style.strokeWidth = "1px";
          newElement.setAttribute("points", x+","+(y-(h/4))+ " "+(x+w)+","+(y-(h/4))); 
   
          v.appendChild(newElement);*/
        }

}

function plotText(e){
    var xo = parseInt(e.getAttribute("xo"));
    var yo = parseInt(e.getAttribute("yo"));
    var x1 = parseInt(e.getAttribute("x1"));
    var y1 = parseInt(e.getAttribute("y1"));
    var w = parseInt(e.getAttribute("w"));
    var h = parseInt(e.getAttribute("h"));
    var r = parseInt(e.getAttribute("r"));

    var x=0;
    var y=0;

    if(r==0){

        if(xo>=x1)
          x=x1;
        else
          x=xo;

        y=y1+(h/4);

    } 
    
    else {
        if(yo>=y1)
            y=y1;
          else
            y=yo;
  
          x=x1-(h/4);
    }

    e.setAttribute("x",x);
    e.setAttribute("y",y);
  
    e.setAttribute('transform', 'rotate('+r+' '+x+' '+y+')');

   /* var v=e.parentElement.lastChild;

    v.setAttribute("points", xo+","+yo+ " "+x1+","+y1);*/



}


function rotateText(e) {

    orginePosText(e);
    var xo = parseInt(e.getAttribute("xo"));
    var yo = parseInt(e.getAttribute("yo"));
    var x1 = parseInt(e.getAttribute("x1"));
    var y1 = parseInt(e.getAttribute("y1"));
    var r = parseInt(e.getAttribute("r"));

    if(r==90) r=0; else r=90;

    e.setAttribute("xo",yo);
    e.setAttribute("yo",xo);
    e.setAttribute("x1",y1);
    e.setAttribute("y1",x1);
    e.setAttribute("r",r); 



    plotText(e)




   
//e.setAttribute('transform', 'rotate('+r+' '+xt+' '+yt+')');

}



function rotateHText(e,wr) {


    orginePosText(e);
    var xo = parseInt(e.getAttribute("xo"));
    var x1 = parseInt(e.getAttribute("x1"));

    e.setAttribute("xo", Math.abs(xo-wr));
    e.setAttribute("x1", Math.abs(x1-wr));

    plotText(e);
}


function rotateVText(e,hr) {

    orginePosText(e);
    var yo = parseInt(e.getAttribute("yo"));
    var y1 = parseInt(e.getAttribute("y1"));

    e.setAttribute("yo", Math.abs(yo-hr));
    e.setAttribute("y1", Math.abs(y1-hr));

    plotText(e);

}

function modifiedClassText()
{
	var els = document.getElementById("sym").children;

	for (var i = 0; i <= els.length - 1; i++) {
        var elem =els[i];
         switch (elem.getAttribute("name")) {

		   case 'ref':
                elem.textContent= drawing.symbol.reference + '?';
	       case 'text':
           case 'param':
		   case '.param':
           case 'label':
           case 'ref':
             elem.setAttribute("class", "draggable");
           break;
		}
	}

}
