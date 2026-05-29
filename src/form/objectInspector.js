
//-----------------------------object inspector----------------------------------------//


var mtable = {};
function fobjectInspector(drawingIntarface) {
    var self = this;
    self.drawing = drawingIntarface;
    self.grid = drawingIntarface.grid;
    mtable.grid = self.grid;
    mtable.px = 5;
    mtable.resize = drawingIntarface.resize;
	mtable.pos=-1;


    self.creat = function () {}

    mtable.parent=this;
    self.getSelect = function (select) {
        mtable.pos=-1;
		mtable.type='';
		mtable.newElem=null;

        if(!select){
            mtable.select = self.grid;
            pageSelect(self);
            self.creat();
        }

       

        if (select) {
            mtable.select = select;
			
            switch (mtable.select.getAttribute("name")) {
            case "rect":
                rectSelect();
                self.creat();
                break;

            case "ellipse":
                ellipseSelect();
                self.creat();
                break;

            case "arc":
                arcSelect();
                self.creat();
                break;

            case "pin":
                pinSelect();
                self.creat();
                break;

			     case "ioparam":
			          ioparamSelect();
                self.creat();
                break;

			case "image":
				imageSelect();
				self.creat();
				break;

	         case 'analysis':
	            analysisSelect();
	            self.creat();
	            break;

			case 'codePy':
	           codePySelect(self);
			   self.creat();
	        break;

		 case 'codeHTML':
	 	   codeHTMLSelect();
	 	     self.creat();
	 	   break;

			case 'codeSpice':
				codeSpiceSelect();
				  self.creat();
				break;


			case "polyline":
                polylineSelect();
                self.creat();
                break;

			case "polygon":
                polygonSelect();
                self.creat();
                break;

			case "net":
                netSelect();
                self.creat();
                break;

            case "part":
                partSelect();
                break;

            case "text":
						case ".param":
                textSelect();
                self.creat();
                break;

            case "label":
                labelSelected();
                self.creat();
                break;

            case "ref":
                refSelected();
                self.creat();
                break;

			 case "param":
                paramSelected();
                self.creat();
             break;

			 case "probe":
                probeSelect();
                self.creat();
             break;

			 case "oscilloscope":
                oscilloscopeSelect();
                self.creat();
             break;


            }
        } 
    }

	self.getDescriptionPage=function()
	{
		self.drawing.resize.setElement=null;
		self.getSelect();
	}



    if (drawingIntarface.resize)
        drawingIntarface.resize.svgElem.addEventListener("moused", this.getSelect);

}



function changeSelect() {



 switch (mtable.type) {
    case 'page':
        pageModified();
        break;

    case 'rect':
        modifiedRect();
        break;

    case 'ellipse':
        modifiedEllipse();
        break;

    case 'arc':
        modifiedArc();
        break;

	case 'image':
        modifiedImage(pos,e);
        break;


	case 'ioparam':
	     modifiedioparam();
		break;

    case 'pin':
        modifiedPin();
        break;

	case 'analysis':
	   modifiedAnalysis();
	   break;

	case 'codePy':
	   modifiedcodePy();
	   break;

	case 'codeHTML':
	 	  modifiedcodeHTML(pos,e);
	 	  break;

	case 'codeSpice':
		   modifiedcodeSpice(pos,e);
		   break;

    case 'text':
	case '.param':
        modifiedText();
        break;

    case 'label':
        labelModified(pos,e);
        break;

	case 'polyline':
        polylineModified();
        break;

	case 'polygon':
        polygonModified();
        break;

	case 'part':
	      modifiedPart();
	      break;

	case 'net':
        netModified();
        break;

    case 'ref':
        refModified();
        break;

    case 'param':
        paramModified();
        break;

	case 'probe':
	      probeModified();
        break;

	case 'oscilloscope':
	      oscilloscopeModified();
        break;
    }
  // drawing.saveData('Changed property of ' + mtable.typeSelect);
}


