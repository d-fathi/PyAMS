
function cratInfoText(elem) {


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
