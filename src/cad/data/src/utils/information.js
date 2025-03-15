
function getDeg(e) {
    var eng = 180 * e / 3.14;
    if (eng > 360)
        eng = eng - 360;

    if (eng < 0)
        eng = eng + 360;
    return Math.ceil(eng) + '°'
}

function informationByPos(self) {
    if (!(self.select))
        return;
    createInfoPos(self, self.ellps[self.pos].x, self.ellps[self.pos].y, 0, 0);
}

function createInfoPos(self, x, y, w, h) {
  /*  setId = "infoPos";
    var element = document.getElementById(setId);
    var r = 16 / self.zoom;

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        newElement.style.fill = "#0000ff";
        newElement.style.fontSize = 24 / self.zoom;
        newElement.style.fontFamily = "Times New Roman";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
    }

    var element = document.getElementById(setId);

    element.setAttribute("x", x + r + w);
    element.setAttribute("y", y + r + h);

    if ((self.setElement.tagName == 'path') && (self.pos == 4))
        element.textContent = 'start angle=' + getDeg(self.arcPoints.startAngle);
    else if ((self.setElement.tagName == 'path') && (self.pos == 5))
        element.textContent = 'end angle=' + getDeg(self.arcPoints.endAngle);
    else

        element.textContent = 'x=' + (x / self.px) + ' y=' + (y / self.px);
	*/
}

function deleteInfoByPos(self) {

    setId = "infoPos";
    var element = document.getElementById(setId);
    if (element != null)
        element.parentNode.removeChild(element);
}

function deleteInfo(self) {

    setIds = ["infoPath", "infoRect", "infoCenter", "infoText","infoArc"];
    for (var i = 0; i < setIds.length; i++) {
        var element = document.getElementById(setIds[i]);
        if (element != null)
            element.parentNode.removeChild(element);
    }
	clearAllInfSelect();
}

function cratInfoPath(self) {
    setId = "infoPath";
    var element = document.getElementById(setId);

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse');
        newElement.style.stroke = "#0000ff";
        newElement.style.fill = "none";
        newElement.style["stroke-dasharray"] = "5,5";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
        var element = document.getElementById(setId);
    }

    element.setAttribute("cx", self.arcPoints.cx);
    element.setAttribute("cy", self.arcPoints.cy);
    element.setAttribute("rx", self.arcPoints.rx);
    element.setAttribute("ry", self.arcPoints.ry);

}

function cratInfoCenter(self) {
    setId = "infoCenter";
    var element = document.getElementById(setId);

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        newElement.style.stroke = "#0000ff";
        newElement.style.fill = "none";
        newElement.style["stroke-dasharray"] = "5,5";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
        var element = document.getElementById(setId);
    }

    var points = [{
            x: self.ellps[5].x,
            y: self.ellps[5].y
        }, {
            x: self.arcPoints.cx,
            y: self.arcPoints.cy
        }, {
            x: self.ellps[4].x,
            y: self.ellps[4].y
        }
    ];

    element.setAttribute("points", polylineToAttribute(points, 0, 0));

}
function cratInfoArc(self) {
	    setId = "infoArc";
    var element = document.getElementById(setId);

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        newElement.style.stroke = "#0000ff";
        newElement.style.fill = "none";
        newElement.style["stroke-dasharray"] = "5,5";
		newElement.style["vector-effect"]= "non-scaling-stroke";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
        var element = document.getElementById(setId);
    }

	var elem=self.setElement;
	var a=getArcPoints(elem);
	r=Math.sqrt((a.rx*a.rx)+(a.ry*a.ry));
   var points = [
	    {
            x: a.cx+a.rx*Math.cos(a.startAngle+a.endAngle),
            y: a.cy+a.ry*Math.sin(a.startAngle+a.endAngle)
        },{
            x: a.cx,
            y: a.cy
        }, {
            x: a.cx+a.rx*Math.cos(a.startAngle),
            y: a.cy+a.ry*Math.sin(a.startAngle)
        }
    ];

	element.setAttribute("points", polylineToAttribute(points, 0, 0));

}
function cratInfoRect(self) {
    setId = "infoRect";
    var element = document.getElementById(setId);

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        newElement.style.stroke = "#0000ff";
        newElement.style.fill = "none";
        newElement.style["stroke-dasharray"] = "5,5";
		newElement.style["vector-effect"]= "non-scaling-stroke";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
        var element = document.getElementById(setId);
    }
 if (self.setElement.getAttribute("name")=='part')
 {
	 		var elem=self.setElement;
		    var xo = parseInt(elem.getAttribute("xo"));
            var yo = parseInt(elem.getAttribute("yo"));
            var x = parseInt(elem.getAttribute("x"))+xo;
            var y = parseInt(elem.getAttribute("y"))+yo;
            var w = parseInt(elem.getAttribute("width"));
            var h = parseInt(elem.getAttribute("height"));
	   var points = [{
            x: x,
            y: y
        }, {
            x: x+w,
            y: y
        }, {
            x: x+w,
            y: y+h
        }, {
            x: x,
            y: y+h
        }, {
            x: x,
            y: y
        }
    ];

 } else {
    var points = [{
            x: self.ellps[0].x,
            y: self.ellps[0].y
        }, {
            x: self.ellps[2].x,
            y: self.ellps[2].y
        }, {
            x: self.ellps[3].x,
            y: self.ellps[3].y
        }, {
            x: self.ellps[1].x,
            y: self.ellps[1].y
        }, {
            x: self.ellps[0].x,
            y: self.ellps[0].y
        }
    ];
 }

    element.setAttribute("points", polylineToAttribute(points, 0, 0));


}

function creatInfoIOParam(self){
	setId = "infoText";
    var element = document.getElementById(setId);

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        newElement.style.stroke = "#0000ff";
        newElement.style.fill = "none";
        newElement.style["stroke-dasharray"] = "5,5";
		newElement.style["vector-effect"]= "non-scaling-stroke";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
        var element = document.getElementById(setId);
    }

    var xo =parseInt(self.setElement.getAttribute("x0"));
    var yo =parseInt(self.setElement.getAttribute("y0"));
    var x1 =parseInt(self.setElement.getAttribute("x1"));
    var y1 =parseInt(self.setElement.getAttribute("y1"));


	var points = [{
                x: x1,
                y: y1
            }, {
                x: x1,
                y: yo
            }, {
                x: xo,
                y: yo
            }, {
                x: xo,
                y: y1
            }, {
                x: x1,
                y: y1
            }
        ];



    element.setAttribute("points", polylineToAttribute(points, 0, 0));


}

function creatInfoPin(self){
	setId = "infoText";
    var element = document.getElementById(setId);

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        newElement.style.stroke = "#0000ff";
        newElement.style.fill = "none";
        newElement.style["stroke-dasharray"] = "5,5";
		newElement.style["vector-effect"]= "non-scaling-stroke";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
        var element = document.getElementById(setId);
    }
	var h=5;
	var p=getArrayPoints(self.setElement);
	if(p[0].y==p[1].y)
	var points = [{
                x: p[0].x,
                y: p[0].y+h
            }, {
                x: p[1].x,
                y: p[0].y+h
            }, {
                x: p[1].x,
                y: p[0].y-h
            }, {
                x: p[0].x,
                y: p[0].y-h
            }, {
                x: p[0].x,
                y: p[0].y+h
            }
        ];
	else
		var points = [{
                x: p[0].x+h,
                y: p[0].y
            }, {
                x: p[0].x+h,
                y: p[1].y
            }, {
                x: p[0].x-h,
                y: p[1].y
            }, {
                x: p[0].x-h,
                y: p[0].y
            }, {
                x: p[0].x+h,
                y: p[0].y
            }
        ];


    element.setAttribute("points", polylineToAttribute(points, 0, 0));
    createInfoPos(self, p[0].x, p[0].y, h, h);

}

function cratInfoText(self) {
    setId = "infoText";

	var xs=0;
	var ys=0;

    var element = document.getElementById(setId);

    if (element == null) {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        newElement.style.stroke = "#0000ff";
        newElement.style.fill = "none";
        newElement.style["stroke-dasharray"] = "5,5";
		newElement.style["vector-effect"]= "non-scaling-stroke";
        newElement.setAttribute("id", setId);
        self.svgElem.appendChild(newElement);
        var element = document.getElementById(setId);
    }

    var bbox = self.setElement.getBBox();
	if(self.setElement.getAttribute("class")=='var'){
		var parElem=self.setElement.parentElement;
		xs=parseInt(parElem.getAttribute("x"));
		ys=parseInt(parElem.getAttribute("y"));
	}
    var w = bbox.width;
    var h = bbox.height;
    var xr = parseInt(self.setElement.getAttribute("x"))+xs;
    var yr = parseInt(self.setElement.getAttribute("y"))+ys;
    var r = parseInt(self.setElement.getAttribute("r"));


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

    element.setAttribute("points", polylineToAttribute(points, 0, 0));
    createInfoPos(self, xr, yr, w, h);

}

function information(self) {



    switch (self.setElement.getAttribute("name")) {

        case 'text':
		case 'param':
    case '.param':
		case 'label':
		case 'ref':
        cratInfoText(self);
        break;
	case 'pin':

	creatInfoPin(self);

	break;

	case 'ioparam':

	creatInfoIOParam(self);

	break;

    case "ellipse":
	       cratInfoRect(self);
        break;

	case "arc":
        cratInfoRect(self);
		cratInfoArc(self);
        break;


    case "part":
        cratInfoRect(self);
        break;

    case "path":
        cratInfoPath(self);
        cratInfoRect(self);
        cratInfoCenter(self);
        break;

	case "analysis":
		x=self.setElement.firstChild.firstChild;
		x.style.color='red';
		break;

    }



	/*if(self.setElement.tagName=="text")
		document.getElementById("areaGlobal").setAttribute("contenteditable",true);
	else
		document.getElementById("areaGlobal").setAttribute("contenteditable",false);
	*/
}



function clearAllInfSelect(){
	var s = document.getElementsByName('analysis');
	for (var i=0; i<= s.length-1;i++) {
	x=s[i].firstChild.firstChild;
	x.style.color='#000000';
	}

}
