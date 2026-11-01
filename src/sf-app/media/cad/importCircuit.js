
function getCircuit() {

    var svg = document.getElementById("sym");
    var copySvg = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    copySvg.innerHTML=svg.innerHTML+document.getElementById('nodes').innerHTML;
 
    
    var collection = copySvg.children;

    for (var i = collection.length - 1; i >= 0; i--) {
      var elem = collection[i];
      switch (elem.getAttribute("name")) {
         case "codeHTML":
         case "analysis":
            elem.remove(); 
            break;
          }
       }
    
   var collection = copySvg.children;
    var xmin = 2000;
    var ymin = 2000;
    var xmax = -2000;
    var ymax = -2000;

    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        switch (elem.getAttribute("name")) {
        case "rect":
        case "image":
        case "part":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            var w = parseInt(elem.getAttribute("width"));
            var h = parseInt(elem.getAttribute("height"));
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            xmax = Math.max(x + w, xmax+10);
            ymax = Math.max(y + h, ymax);
           console.log( elem.getAttribute("name"));
            break
        case "ellipse":
        case "arc":
        case "cnode":
            var x = parseInt(elem.getAttribute("cx")) - parseInt(elem.getAttribute("rx"));
            var y = parseInt(elem.getAttribute("cy")) - parseInt(elem.getAttribute("ry"));
            var w = 2 * parseInt(elem.getAttribute("rx"));
            var h = 2 * parseInt(elem.getAttribute("ry"));
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            xmax = Math.max(x + w, xmax);
            ymax = Math.max(y + h, ymax);
            break
        case "pin":
            var p = getArrayPoints(elem);
            xmin = Math.min(p[0].x, p[1].x, xmin);
            ymin = Math.min(p[0].y, p[1].y, ymin);
            xmax = Math.max(p[0].x, p[1].x, xmax);
            ymax = Math.max(p[0].y, p[1].y, ymax);
            break;

        case "ioparam":
            var p = getRectPointsIOparam(elem);
            xmin = Math.min(p[0].x, p[1].x, xmin);
            ymin = Math.min(p[0].y, p[1].y, ymin);
            xmax = Math.max(p[0].x, p[1].x, xmax);
            ymax = Math.max(p[0].y, p[1].y, ymax);
            break;

        case "polyline":
        case "polygon":
        case "net":
            var p = getArrayPoints(elem);
            for (var j = 0; j < p.length; j++) {
                v = p[j];
                xmin = Math.min(v.x, xmin);
                ymin = Math.min(v.y, ymin);
                xmax = Math.max(v.x, xmax);
                ymax = Math.max(v.y, ymax);
            }
            break;
        case "text":
            var p = getRectOfText(elem);
            for (var j = 0; j < p.length; j++) {
                v = p[j];
                xmin = Math.min(v.x, xmin);
                ymin = Math.min(v.y, ymin);
                xmax = Math.max(v.x, xmax);
                ymax = Math.max(v.y, ymax);
            }
            break;
        }
    }
    var xorg = xmin;
    var yorg = ymin;
    xmin = 5 * Math.round((xmin - 5) / 5);
    ymin = 5 * Math.round((ymin - 5) / 5);
    var xorg = 0; //xorg-xmin;
    var yorg = 0; //yorg-ymin;

    xmax = 5 * Math.ceil(xmax / 5);
    ymax = 5 * Math.ceil(ymax / 5);
    for (var i = 0; i <= collection.length - 1; i++) {
        var elem = collection[i];
        switch (elem.getAttribute("name")) {
        case "rect":
        case "image":
            var x = parseFloat(elem.getAttribute("x"));
            var y = parseFloat(elem.getAttribute("y"));
            elem.setAttribute("x", x - xmin);
            elem.setAttribute("y", y - ymin);
   
            break;
        case "part":
            var x = parseFloat(elem.getAttribute("x"));
            var y = parseFloat(elem.getAttribute("y"));
            elem.setAttribute("x", x - xmin);
            elem.setAttribute("y", y - ymin);
            elem.setAttribute('transform',"translate(" + (x-xmin) + "," + (y-ymin) + ")");
            break;

        case "ellipse":
        case "cnode":
            var x = parseFloat(elem.getAttribute("cx"));
            var y = parseFloat(elem.getAttribute("cy"));
            elem.setAttribute("cx", x - xmin);
            elem.setAttribute("cy", y - ymin);
            break;

        case "arc":
            var x = parseFloat(elem.getAttribute("cx"));
            var y = parseFloat(elem.getAttribute("cy"));
            elem.setAttribute("cx", x - xmin);
            elem.setAttribute("cy", y - ymin);
            a = getArcPoints(elem);
            elem.setAttribute("d", arcToAttribute(a, 0, 0));
            elem.setAttribute("r", 1);
            elem.setAttribute("h", 1);
            elem.setAttribute("v", 1);
            break;


        case "pin":
            var p = getArrayPoints(elem);
            var xo = p[0].x - xmin;
            var yo = p[0].y - ymin;
            var x = p[1].x - xmin;
            var y = p[1].y - ymin;


            elem.setAttribute("points", xo + "," + yo + " " + x + "," + y);
            drawingPin(elem);
            break;

        case "ioparam":
            var x = parseInt(elem.getAttribute("x"));
            var y = parseInt(elem.getAttribute("y"));
            setparamPos(x - xmin, y - ymin, elem);
            break;
        case "polyline":
        case "polygon":
        case "net":
            var p = getArrayPointsFloat(elem);
            for (var j = 0; j < p.length; j++) {
                p[j].x = p[j].x - xmin;
                p[j].y = p[j].y - ymin;
            }
            elem.setAttribute("points", polylineToAttribute(p, 0, 0));
            break;

        case 'text':
        case 'param':
        case 'modelSpice':
        case 'ref':
            var x = parseFloat(elem.getAttribute("x")) - xmin;
            var y = parseFloat(elem.getAttribute("y")) - ymin;
            elem.setAttribute("x", x);
            elem.setAttribute("y", y);
            if(elem.getAttribute("name")!='text')
               elem.setAttribute("class", "var");
            var r = elem.getAttribute("r");
            elem.setAttribute("transform", 'rotate(' + r + ' ' + x + ' ' + y + ')');
            break;



        }
    }

    copySvg.setAttribute("width", xmax - xmin);
    copySvg.setAttribute("height", ymax - ymin);

    var plots=[];

var t=document.getElementById("sym").children;
   for(var i=0; i<t.length; i++){
    if(t[i].getAttribute("name")=='analysis') {
       var elem=t[i].lastChild.firstChild;
       var layout=JSON.parse(elem.getAttribute("layout"));
       var data=JSON.parse(elem.getAttribute("data"));
       plots.push({layout:layout,data:data});
   }
  }
   

    var setdL=`<div class"conteneur-parent">
                          <svg width="100%" height="auto" viewBox="0 0 ${xmax - xmin}   ${ymax - ymin}">
                                                     ${copySvg.innerHTML}                                         
                          </svg>
                </div>`;

    console.log(setdL);
    return {svg:{data:copySvg.innerHTML, width: xmax - xmin, heigth:ymax-ymin,},plots:plots}

}