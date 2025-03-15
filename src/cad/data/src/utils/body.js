/*
#----------------------------------------------------------------------------------------------------
# Name:        body.js
# Author:      d.fathi
# Created:     05/07/2021
# Update:      05/08/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free
#---------------------------------------------------------------------------------------------------
 */

//----------------------Class for creat body by div and css-----------------------------------------//
function createBody(self) {
    var css = ` #setgrid {
  display: grid;
  width: 100%;
  grid-template-columns: 20px  1fr;
  grid-template-rows: 20px 1fr;
  }

#areaA {
  background-color: Silver;
}

#areaB {
  background-color: Silver;
}


#areaC {
  background-color: Silver;
}

#areaGlobal {
  align: center;
  outline: none;
  position: relative;
  width: 100%;
  height: 800px;
  overflow-y: scroll;
  user-select: none;
}


.setFont {
     font-family: verdana;
     font-size: 12px;
}


`;
    var head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

    head.appendChild(style);

    style.type = 'text/css';
    if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    const body = document.getElementById(self.div);

    body.innerHTML = `
<div id="setgrid">
  <div id="areaA"></div>
  <div id="areaB">
       <svg  style="width:100%;height:100%;">
          <text x="200" y="12">100</text>
		      <text x="400" y="12">200</text>
       </svg>
  </div>
  <div id="areaC">
        <svg style="width:100%;height:100%;">
          <text x="12" y="200">100</text>
		      <text x="12" y="400">200</text>
       </svg>
  </div>
  <div  id="areaGlobal"  contenteditable="false" >
        <svg id="svg" width="800" height="800"  viewBox="0 0 800 800"   >
        <path id="smallGrid" d="M 10 0 H 800" fill="none" stroke="gray" stroke-width="0.1"  vector-effect= "non-scaling-stroke"/>
        <path id="grid" d="M 100 0 V 200" fill="none" stroke="gray" stroke-width="0.2" vector-effect= "non-scaling-stroke"/>
		    <path id="select" d="" fill="none" stroke="blue" stroke-width="1" vector-effect= "non-scaling-stroke"/>
		    <g id="sym" name="sym"></g>
		    <g id="selElms"  fill="none" stroke="red" ></g>
		    <g id="nodes"></g>
		</svg>
  </div>
</div>
`;
}
