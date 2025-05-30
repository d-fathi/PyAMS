

function getTextContentByType(type) {
    switch (type) {
    case 'text':
        return 'Text styling';
        break;
    case 'label':
        if(typePyAMS)
          return 'label';
        return '<name>';
        break;
    case 'param':
        return 'p=100';
        break;
   case '.param':
        return '.param p=100';
        break;
    case 'ref':
        return drawing.symbol.reference + '?';
        break;
    }
}



function controlPinSize(size){
	if(size<=3)
		return 3;
	else if(size>=25)
		return 25;
	else
		return size;
}

function controlText(Text){
	return Text.split('`').join('');
}

function stepPx(ele)
{
  if(ele)
	switch(ele.getAttribute("name")){
	case "pin":
	case "part":
	case "net":
    case "oscilloscope":
         return 5;
      break;
	}

 return 1;
}


function controlModifiedPin(elem)
{
  	if(elem.childNodes.length==3)
	{
	 var newElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'text');
     newElement4.style.fontSize = "12px";
     newElement4.style.fontFamily = "Times New Roman";
     newElement4.style.display = "block";
     newElement4.setAttribute("r", 0);
     newElement4.textContent = ' ';
     elem.appendChild(newElement4);
	}
}


//**************************************************
//                Font   Available
//**************************************************

const fontAvailable = [];

function getFontAvailable(){
(async() => {
  await document.fonts.ready;


  const fontCheck = new Set([
  //Windows 10
   'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
  //macOS
  'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
  ].sort());



  for (const font of fontCheck.values()) {
    if (document.fonts.check(`12px "${font}"`)) {
      fontAvailable.push(font);
    }
  }

  console.log('Available Fonts:', fontAvailable);
})();
}

getFontAvailable();


function withOutQuotationMarks(s)
{
	var a=s.split('"');
	if (a.length ==3)
		return a[1];
	return s;
}
