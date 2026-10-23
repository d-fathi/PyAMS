

function addIOParam(x,y,text_,type)
{
            var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            var xo = x-2;
            var yo = y-2;
			var x1=x-2;
			var y1=y+2;
			var x2=x+2;
			var y2=y+3;

			//type='in';

      newElement.setAttribute('name','ioparam');
			newElement.setAttribute('class','ioparam');
			newElement.setAttribute('param',text_);
			newElement.setAttribute('type',type);
			newElement.setAttribute('rotate','0°');


			newElement.setAttribute('x',x);
			newElement.setAttribute('y',y);




            var newElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            newElement1.style.fontSize = "11px";
            newElement1.style.fontFamily = "Times New Roman";
            newElement1.style.display = "block";
			newElement1.setAttribute('x', x2);
            newElement1.setAttribute('y', y2);
			newElement1.textContent = text_;
            newElement1.setAttribute('transform', 'rotate(0 ' + x2 + ' ' + y2 + ')');
            newElement.appendChild(newElement1);



			var newElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
			newElement2.setAttribute("points", xo + "," + yo + " " + x + "," + y+ " " + x1 + "," + y1);
            newElement2.style.stroke = "#000000";
			newElement2.style.fill = "#000000";
            newElement2.style.strokeWidth = "1px";
            newElement.appendChild(newElement2);


			return newElement;
}

function getLimitPosTextIOParm(elem)
{

description={x1:0,y1:0,x0:0,y0:0, point:"0,0", r:0, xt:0, yt:0};

	var type=elem.getAttribute('type');
	var x=parseInt(elem.getAttribute('x'));
	var y=parseInt(elem.getAttribute('y'));
	var r=elem.getAttribute('rotate');

	var e=elem.childNodes[0];
    var bbox = e.getBBox();
    var w = bbox.width;
    var h = bbox.height;

if(r=='0°')
{
 	description['x1']=x-6;
	description['y1']=y+5;
	description['x0']=x+w+8;
	description['y0']=y-5;

	if(type=='out')
	description['point']= x + "," + (y-3) + " " + (x-6) + "," + (y-3)+ " " + (x-6) + "," + (y+3)+ " " + (x) + "," + (y+3);
    else
	description['point']=(x-6) + "," + (y-3)+ " " + x + "," +y+ " " + (x-6) + "," + (y+3);


	description['r']=0;
	description['xt']=x+2;
	description['yt']=y+3;


} else if(r=='180°')
{
 	description['x1']=x+6;
	description['y1']=y+5;
	description['x0']=x-w-8;
	description['y0']=y-5;

	if(type=='out')
	description['point']= x + "," + (y-3) + " " + (x+6) + "," + (y-3)+ " " + (x+6) + "," + (y+3)+ " " + (x) + "," + (y+3);
    else
	description['point']=(x+6) + "," + (y-3)+ " " + x + "," +y+ " " + (x+6) + "," + (y+3);


	description['r']=0;
	description['xt']=x-w-2;
	description['yt']=y+3;
} else if(r=='270°')
{
 	description['x1']=x+5;
	description['y1']=y+6;
	description['x0']=x-5;
	description['y0']=y-w-8;

	if(type=='out')
	description['point']= (x-3) + "," + y + " " + (x-3) + "," + (y+6)+ " " + (x+3) + "," + (y+6)+ " " + (x+3) + "," + y;
    else
	description['point']=(x-3) + "," + (y+6)+ " " + x + "," +y+ " " + (x+3) + "," + (y+6);


	description['r']=90;
	description['xt']=x-3;
	description['yt']=y-w-2;

}

else if(r=='90°')
{
 	description['x1']=x+5;
	description['y1']=y-6;
	description['x0']=x-5;
	description['y0']=y+w+8;

	if(type=='out')
	description['point']= (x-3) + "," + y + " " + (x+3) + "," + y+ " " + (x+3) + "," + (y-6)+ " " + (x-3) + "," + (y-6);
    else
	description['point']=(x-3) + "," + (y-6)+ " " + x + "," +y+ " " + (x+3) + "," + (y-6);


	description['r']=90;
	description['xt']=x-3;
	description['yt']=y+2;


}
console.log(description);
return description;


}

function setparamPos(x,y,elem)
{


			var x=5* Math.round(x/5);
			var y=5* Math.round(y/5);

			type=elem.getAttribute('type');
			elem.setAttribute('x',x);
			elem.setAttribute('y',y);


			var l=getLimitPosTextIOParm(elem);
			elem.setAttribute('x1',l.x1);
			elem.setAttribute('y1',l.y1);
			elem.setAttribute('x0',l.x0);
			elem.setAttribute('y0',l.y0);



            var e=elem.childNodes[0];
			e.setAttribute('x', l.xt);
            e.setAttribute('y', l.yt);
            e.setAttribute('transform', 'rotate('+l.r+'  '+ l.xt + '  ' + l.yt + ')');

			var e=elem.childNodes[1];
			e.setAttribute("points",l.point);

			e.style.fill = "none";
}


function pointInIOParam(self, offset) {
    var xo = Math.min( parseInt(self.getAttribute("x1")),parseInt(self.getAttribute("x0")));
    var yo = Math.min( parseInt(self.getAttribute("y1")),parseInt(self.getAttribute("y0")));
    var x  = Math.max( parseInt(self.getAttribute("x1")),parseInt(self.getAttribute("x0")));
    var y  = Math.max( parseInt(self.getAttribute("y1")),parseInt(self.getAttribute("y0")));
    return (xo < offset.x) && (yo < offset.y) && (x > offset.x) && (y > offset.y);
}


function getRectPointsIOparam(self)
{
    var xo = Math.min( parseInt(self.getAttribute("x1")),parseInt(self.getAttribute("x0")));
    var yo = Math.min( parseInt(self.getAttribute("y1")),parseInt(self.getAttribute("y0")));
    var x  = Math.max( parseInt(self.getAttribute("x1")),parseInt(self.getAttribute("x0")));
    var y  = Math.max( parseInt(self.getAttribute("y1")),parseInt(self.getAttribute("y0")));

	return [{'x':xo,'y':yo},{'x':x,'y':y}]
}
