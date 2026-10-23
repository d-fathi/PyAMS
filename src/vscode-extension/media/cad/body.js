/*
#----------------------------------------------------------------------------------------------------
Name:        body.js
Author:      d.fathi
Created:     05/07/2021
Update:      23/09/2026
Copyright:   (c) PyAMS 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
function createBody(self) {
var css = `
#toolbar {
position: absolute;
top: 0;
left: 50%;
transform: translateX(-50%);
background: linear-gradient(to bottom, #f8f8f8, #e0e0e0);
border: 1px solid #999;
border-top: none;
border-radius: 0 0 6px 6px;
padding: 0;
display: flex;
gap: 0;
align-items: center;
justify-content: center;
z-index: 1000;
box-shadow: 0 2px 8px rgba(0,0,0,0.25);
font-family: verdana;
opacity: 0;
pointer-events: none;
transition: opacity 0.3s ease;
height: 32px;
width: fit-content;
}
#toolbar.visible { opacity: 1; pointer-events: all; }
.toolbar-group { display: flex; gap: 2px; padding: 0 4px; border-right: 1px solid #bbb; height: 100%; align-items: center; }
.toolbar-group:last-child { border-right: none; }
.toolbar-group.hidden-group { display: none; }
.toolbar-btn { width: 28px; height: 28px; border: 1px solid #aaa; background: white; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #333; transition: all 0.15s; padding: 0; margin: 2px 0; }
.toolbar-btn:hover { background: #e8e8ff; border-color: #6666cc; }
.toolbar-btn.active { background: #c0c0ff; border-color: #4444aa; }
.toolbar-btn.hidden-btn { display: none; }

.toolbar-btn.disabled-btn { 
    opacity: 0.35; 
    cursor: not-allowed; 
    pointer-events: none;
    filter: grayscale(100%);
}
.toolbar-btn.disabled-btn:hover { 
    background: white; 
    border-color: #aaa; 
}
.toolbar-btn svg { width: 16px; height: 16px; pointer-events: none; }
#setgrid { display: grid; width: 100%; height: 100%; grid-template-columns: 20px 1fr; grid-template-rows: 20px 1fr; }
#areaA { background-color: Silver; }
#areaB { background-color: Silver; }
#areaC { background-color: Silver; }
#areaGlobal { align: center; outline: none; position: relative; width: 100%; height: 100%; overflow-y: scroll; user-select: none; scrollbar-width: thin; }
.setFont { font-family: verdana; font-size: 12px; }
.toolbar-btn {
  --icon-color: #e2e8f0;
  --icon-bg: transparent;
  position: relative;
}

#btnShowPanel{ --icon-color: #b31e6b; }
#btnSelect { --icon-color: #1979e6; }
#btnWire { --icon-color: #25c761; }
#btnBus { --icon-color: #6ee7b7; }
#btnPlaceComponent { --icon-color: #ec5656; }
#btnText { --icon-color: #e65ea9; }
#btnRectangle { --icon-color: #6642f5; }
#btnEllipse { --icon-color: #6642f5; }
#btnArc { --icon-color: #6642f5; }
#btnPolyline { --icon-color: #6642f5; }
#btnPolygon { --icon-color:  #6642f5; }
#btnVCC { --icon-color: #aa5c09; }
#btnGND { --icon-color: #aa5c09; }
#btnPort { --icon-color: #aa5c09; }
#btnRotate { --icon-color: #697cdb; }
#btnFlipVertical { --icon-color: #697cdb; }
#btnFlipHorizontal { --icon-color: #697cdb; }
#btnZoomIn { --icon-color: #35f37b; }
#btnZoomOut { --icon-color: #25e79a; }
#btnGrid { --icon-color: #cbd5e1; }
#btnSnap { --icon-color: #94a3b8; }
#btnRunAnalysis { --icon-color: #4ade80; }
#btnHTML { --icon-color: #fb923c; }
#btnAnalysis { --icon-color: #f472b6; }
#btnRunAV { --icon-color: #f472b6; }
#btnAV { --icon-color: #f472b6; }
#btnReference { --icon-color: #06836ae0 } 
#btnParameter  { --icon-color: #06836ae0 } 
#btnModel  { --icon-color: #06836ae0 } 
#btnCommand  { --icon-color: #06836ae0 } 
#btnPin  { --icon-color: #06836ae0 } 
#btnSubBlock  { --icon-color: #06836ae0 } 


.toolbar-btn svg {
  color: var(--icon-color);
  transition: all 0.3s ease;
}


`;
var head = document.head || document.getElementsByTagName('head')[0],
style = document.createElement('style');
head.appendChild(style);
style.type = 'text/css';
if (style.styleSheet) {
style.styleSheet.cssText = css;
} else {
style.appendChild(document.createTextNode(css));
}
const body = document.getElementById(self.div);
body.innerHTML = `
<div id="toolbar">

<div class="toolbar-group" id="grpPanel">
    <button class="toolbar-btn" id="btnShowPanel" title="Show Panel Description">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Outer panel border with white fill -->
            <rect x="2" y="3" width="20" height="18" rx="2" 
                  stroke="currentColor" stroke-width="1.5" fill="white"/>
            <!-- Header bar (filled with current color) -->
            <path d="M2 5 C2 4, 3 3, 4 3 L20 3 C21 3, 22 4, 22 5 L22 8 L2 8 Z" 
                  fill="currentColor"/>
            <!-- Two white circles on the right side of header -->
            <circle cx="17" cy="5.5" r="1" fill="white"/>
            <circle cx="20" cy="5.5" r="1" fill="white"/>
        </svg>
    </button>
</div>

 <div class="toolbar-group">
   <button class="toolbar-btn active" id="btnSelect" title="Select (V)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
   </button>
 </div>
 <div class="toolbar-group" id="grpWire">
   <button class="toolbar-btn" id="btnWire" title="Wire (W)">
     <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
       <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="2.5"/>
       <line x1="3" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="2.5"/>
       <line x1="3" y1="17" x2="12" y2="17" stroke="currentColor" stroke-width="2.5"/>
       <line x1="12" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2.5"/>
       <circle cx="12" cy="7" r="2.5" fill="currentColor" stroke="none"/>
       <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
       <circle cx="12" cy="17" r="2.5" fill="currentColor" stroke="none"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnBus" title="Bus (B)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 8h20M2 16h20"/></svg>
   </button>
 </div>
 <div class="toolbar-group" id="grpComponent">
   <button class="toolbar-btn" id="btnPlaceComponent" title="Place Component (P)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
       <text x="17" y="7" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor" stroke="none">+</text>
       <line x1="1" y1="15" x2="4" y2="15"/>
       <polyline points="4,15 6,9 9,21 12,9 15,21 18,9 20,15"/>
       <line x1="20" y1="15" x2="23" y2="15"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnText" title="Text (T)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
   </button>
 </div>
 <div class="toolbar-group">
   <button class="toolbar-btn" id="btnRectangle" title="Rectangle (R)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
   </button>
   <button class="toolbar-btn" id="btnEllipse"  title="Ellipse (E)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="9" ry="6"/></svg>
   </button>
   <button class="toolbar-btn" id="btnArc" title="Arc (A)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16 A 8 8 0 0 1 20 16"/></svg>
   </button>
   <button class="toolbar-btn" id="btnPolyline" title="Polyline (L)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 18 8 8 14 14 20 6"/></svg>
   </button>
   <button class="toolbar-btn" id="btnPolygon" title="Polygon (Y)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 20 8 17 18 7 18 4 8"/></svg>
   </button>
 </div>
 <div class="toolbar-group" id="grpPower">
   <button class="toolbar-btn" id="btnVCC" title="VCC Power (U)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <text x="12" y="7" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor" stroke="none">VCC</text>
       <line x1="4" y1="11" x2="20" y2="11" stroke-width="2.5"/>
       <line x1="12" y1="11" x2="12" y2="20" stroke-width="2"/>
     </svg>
   </button>
<button class="toolbar-btn" id="btnPort" title="Port (O)">
    <svg viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg">
        <!-- Main tag shape: rectangle with arrow end -->
        <path d="M2 4 L18 4 L23 10 L18 16 L2 16 Z" 
              fill="none" stroke="currentColor" stroke-width="2" 
              stroke-linejoin="round" stroke-linecap="round"/>
        <!-- Text "P" inside the tag -->
        <text x="10" y="13" text-anchor="middle" font-size="9" 
              font-weight="bold" font-family="Arial, sans-serif" 
              fill="currentColor" stroke="none">P</text>
        <!-- Connection dot at the tip -->
        <circle cx="24.5" cy="10" r="1.5" fill="currentColor"/>
    </svg>
</button>
   <button class="toolbar-btn" id="btnGND" title="Ground (N)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <line x1="12" y1="2" x2="12" y2="10" stroke-width="2"/>
       <line x1="4" y1="10" x2="20" y2="10" stroke-width="2.5"/>
       <line x1="7" y1="14" x2="17" y2="14" stroke-width="2"/>
       <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
     </svg>
   </button>   
 </div>
 <div class="toolbar-group" id="grpSymProps">
   <button class="toolbar-btn" id="btnPin" title="Add Pin (I)">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <rect x="14" y="4" width="9" height="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
       <rect x="2" y="6" width="4" height="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
       <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.5"/>
       <rect x="2" y="14" width="4" height="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
       <line x1="6" y1="16" x2="14" y2="16" stroke="currentColor" stroke-width="1.5"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnReference" title="Add Reference (K)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <text x="12" y="17" text-anchor="middle" font-size="14" font-weight="bold" font-family="Arial, sans-serif" fill="currentColor" stroke="none">X?</text>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnParameter" title="Add Parameter (J)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <text x="12" y="17" text-anchor="middle" font-size="11" font-weight="bold" font-family="Arial, sans-serif" fill="currentColor" stroke="none">P=1</text>
     </svg>
   </button>
 </div>
  <div class="toolbar-group" id="grpModel">
   <button class="toolbar-btn" id="btnModel" title="Add Model (D)">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="1.5"/>
       <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="1.5"/>
       <text x="12" y="17" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial, sans-serif" fill="currentColor" stroke="none">M</text>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnCommand" title="Command Line (Q)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <polyline points="4 17 10 11 4 5"/>
       <line x1="12" y1="19" x2="20" y2="19"/>
     </svg>
   </button>
 </div>
 
<div class="toolbar-group" id="grpTransform">
  <button class="toolbar-btn" id="btnRotate" title="Rotate 90° (Shift+R)">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://w3.org">
      <path d="M 37 11 L 37 89 A 5 5 0 0 1 31 94 L 8 94 A 5 5 0 0 1 3 89 L 31 16 A 5 5 0 0 1 37 11 Z" 
            stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 50 67 L 92 94 A 5 5 0 0 1 89 99 L 50 99 A 5 5 0 0 1 45 94 L 45 72 A 5 5 0 0 1 50 67 Z" 
            stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 45 72 L 45 58 M 45 72 L 59 72" 
            stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 87 63 A 36 36 0 0 0 62 17" 
            stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 72 27 L 55 13 L 73 2" 
            stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  </button>


  <button class="toolbar-btn" id="btnFlipVertical" title="Flip Vertical (Shift+V)">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://w3.org">
      <path d="M 94 41 L 6 41 A 5 5 0 0 1 2 35 L 89 5 A 5 5 0 0 1 97 9 L 97 35 A 5 5 0 0 1 94 41 Z" 
            stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <path d="M 94 59 L 6 59 A 5 5 0 0 0 2 65 L 89 95 A 5 5 0 0 0 97 91 L 97 65 A 5 5 0 0 0 94 59 Z" 
            stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <button class="toolbar-btn" id="btnFlipHorizontal" title="Flip Horizontal (Shift+H)">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://w3.org">
      <path d="M 41 6 L 41 94 A 5 5 0 0 1 35 98 L 5 11 A 5 5 0 0 1 9 3 L 35 3 A 5 5 0 0 1 41 6 Z" 
            stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <path d="M 59 6 L 59 94 A 5 5 0 0 0 65 98 L 95 11 A 5 5 0 0 0 91 3 L 65 3 A 5 5 0 0 0 59 6 Z" 
            stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>




 <div class="toolbar-group">
   <button class="toolbar-btn" id="btnBringToFront" title="Bring to Front (Ctrl+Shift+])">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <rect x="10" y="10" width="10" height="10" fill="#808080" stroke="#333" stroke-width="1"/>
       <rect x="4" y="4" width="10" height="10" fill="#fde047" stroke="#333" stroke-width="1"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnSendToBack" title="Send to Back (Ctrl+Shift+[)">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <rect x="4" y="4" width="10" height="10" fill="#fde047" stroke="#333" stroke-width="1"/>
       <rect x="10" y="10" width="10" height="10" fill="#808080" stroke="#333" stroke-width="1"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnBringForward" title="Bring Forward (Ctrl+])">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <rect x="6" y="6" width="10" height="10" fill="#808080" stroke="#333" stroke-width="1"/>
       <rect x="10" y="10" width="10" height="10" fill="#fde047" stroke="#333" stroke-width="1"/>
       <path d="M8 4 L8 2 M8 2 L6 4 M8 2 L10 4" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnSendBackward" title="Send Backward (Ctrl+[)">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <rect x="4" y="4" width="10" height="10" fill="#fde047" stroke="#333" stroke-width="1"/>
       <rect x="8" y="8" width="10" height="10" fill="#808080" stroke="#333" stroke-width="1"/>
       <path d="M16 20 L16 22 M16 22 L14 20 M16 22 L18 20" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
     </svg>
   </button>
 </div>
 <div class="toolbar-group" id="grpAnalysis">
   <button class="toolbar-btn" id="btnHTML" title="HTML Mode (M)">
     <svg viewBox="0 0 24 24" fill="currentColor">
       <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.127l-.326 3.382-2.911.817-2.978-.824-.19-2.11H6.317l.36 4.741L12 19.876l5.351-1.444.744-8.682H8.531z"/>
     </svg>
   </button>
  
   <button class="toolbar-btn" id="btnAnalysis" title="Analysis (X)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <rect x="3" y="3" width="18" height="18" rx="2"/>
       <path d="M3 12 C 6 4, 9 4, 12 12 C 15 20, 18 20, 21 12"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnAV" title="Measure Voltage/Current (Z)">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <rect x="1" y="4" width="11" height="16" fill="currentColor" stroke="currentColor" stroke-width="1"/>
       <rect x="12" y="4" width="11" height="16" fill="#ffffff" stroke="currentColor" stroke-width="1"/>
       <text x="6.5" y="17" text-anchor="middle" font-size="12" font-weight="bold" font-family="Arial, sans-serif" fill="#ffffff" stroke="none">A</text>
       <text x="17.5" y="17" text-anchor="middle" font-size="12" font-weight="bold" font-family="Arial, sans-serif" fill="currentColor" stroke="none">V</text>
     </svg>
   </button>  
 </div>
 <div class="toolbar-group" id="grpRun">
   <button class="toolbar-btn" id="btnRunAnalysis" title="Run Analysis (F9)">
     <svg viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="2">
       <rect x="3" y="2" width="18" height="16" rx="2"/>
       <path d="M3 10 C 6 4, 9 4, 12 10 C 15 16, 18 16, 21 10"/>
       <polygon points="9,20 15,23 9,26" fill="currentColor" stroke="currentColor" stroke-width="1" opacity="0.7"/>
     </svg>
   </button>
   <button class="toolbar-btn" id="btnRunAV" title="Run AV Measurement (F10)">
     <svg viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
       <rect x="1" y="2" width="11" height="16" fill="currentColor" stroke="currentColor" stroke-width="1"/>
       <rect x="12" y="2" width="11" height="16" fill="#ffffff" stroke="currentColor" stroke-width="1"/>
       <text x="6.5" y="15" text-anchor="middle" font-size="11" font-weight="bold" font-family="Arial, sans-serif" fill="#ffffff" stroke="none">A</text>
       <text x="17.5" y="15" text-anchor="middle" font-size="11" font-weight="bold" font-family="Arial, sans-serif" fill="currentColor" stroke="none">V</text>
       <polygon points="9,20 15,23 9,26" fill="currentColor" stroke="currentColor" stroke-width="1" opacity="0.7"/>
     </svg>
   </button>
 </div>
 <div class="toolbar-group" id="grpSubBlock">
   <button class="toolbar-btn" id="btnSubBlock" title="Sub Block (C)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" xmlns="http://www.w3.org/2000/svg">
       <rect x="7" y="2" width="10" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
       <rect x="2" y="5" width="3" height="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
       <polygon points="5,5 8,6.5 5,8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
       <rect x="2" y="10.5" width="3" height="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
       <polygon points="5,10.5 8,12 5,13.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
       <rect x="2" y="16" width="3" height="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
       <polygon points="5,16 8,17.5 5,19" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
       <polygon points="19,5 16,6.5 19,8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
       <rect x="19" y="5" width="3" height="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
       <polygon points="19,10.5 16,12 19,13.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
       <rect x="19" y="10.5" width="3" height="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
       <polygon points="19,16 16,17.5 19,19" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
       <rect x="19" y="16" width="3" height="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
     </svg>
   </button>   
 </div>
 <div class="toolbar-group">
   <button class="toolbar-btn" id="btnZoomIn" title="Zoom In (+)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>
   </button>
   <button class="toolbar-btn" id="btnZoomOut" title="Zoom Out (-)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>
   </button>
 </div>
 <div class="toolbar-group">
   <button class="toolbar-btn active" id="btnGrid" title="Toggle Grid (G)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
   </button>
   <button class="toolbar-btn" id="btnSnap" title="Snap to Grid (S)">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
   </button>
 </div>
</div>
<div id="setgrid">
 <div id="areaA"></div>
 <div id="areaB">
   <svg style="width:100%;height:100%;">
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
 <div id="areaGlobal" contenteditable="false">
   <svg id="svg" width="800" height="800" viewBox="0 0 800 800">
     <path id="smallGrid" d="M 10 0 H 800" fill="none" stroke="gray" stroke-width="0.1" vector-effect="non-scaling-stroke"/>
     <path id="grid" d="M 100 0 V 200" fill="none" stroke="gray" stroke-width="0.3" vector-effect="non-scaling-stroke"/>
     <path id="select" d="" fill="none" stroke="blue" stroke-width="1" vector-effect="non-scaling-stroke"/>
     <g id="sym" name="sym"></g>
     <g id="selElms" fill="none" stroke="red"></g>
     <g id="nodes"></g>
   </svg>
 </div>
</div>
`;
initToolbar(self);
}


function updateToolbarVisibility(self) {
    const pageType = (self.pageType || 'sym').toLowerCase();
    
    const symOnlyButtons = [
        'btnWire', 'btnBus', 'btnPlaceComponent',
        'btnVCC', 'btnGND', 'btnPort',
        'btnRotate', 'btnFlipVertical', 'btnFlipHorizontal',
        'btnCommand', 'btnHTML', 'btnAnalysis', 'btnAV',    
        'btnRunAnalysis', 'btnRunAV', 'btnSubBlock'
    ];
    
    const dcsOnlyButtons = [
        'btnReference', 'btnParameter', 'btnPin', 'btnModel'
    ];
    
    symOnlyButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (pageType === 'sym') {
                btn.classList.add('hidden-btn');
            } else {
                btn.classList.remove('hidden-btn');
            }
        }
    });
    
    dcsOnlyButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (pageType === 'dcs') {
                btn.classList.add('hidden-btn');
            } else {
                btn.classList.remove('hidden-btn');
            }
        }
    });
    
    const groups = [
        { id: 'grpWire', buttons: ['btnWire', 'btnBus'] },
        { id: 'grpPower', buttons: ['btnVCC', 'btnGND', 'btnPort'] },
        { id: 'grpSymProps', buttons: ['btnPin', 'btnReference', 'btnParameter'] },
        { id: 'grpTransform', buttons: ['btnRotate', 'btnFlipVertical', 'btnFlipHorizontal'] },
        { id: 'grpModel', buttons: ['btnModel', 'btnCommand'] },
        { id: 'grpAnalysis', buttons: ['btnHTML', 'btnAnalysis', 'btnAV'] },
        { id: 'grpRun', buttons: ['btnRunAnalysis', 'btnRunAV'] },
        { id: 'grpSubBlock', buttons: ['btnSubBlock'] }
    ];
    
    groups.forEach(group => {
        const grp = document.getElementById(group.id);
        if (grp) {
            const allHidden = group.buttons.every(id => {
                const btn = document.getElementById(id);
                return btn && btn.classList.contains('hidden-btn');
            });
            if (allHidden) {
                grp.classList.add('hidden-group');
            } else {
                grp.classList.remove('hidden-group');
            }
        }
    });
    
    const activeBtn = document.querySelector('.toolbar-btn.active');
    if (activeBtn && activeBtn.classList.contains('hidden-btn')) {
        activeBtn.classList.remove('active');
        const selectBtn = document.getElementById('btnSelect');
        if (selectBtn) selectBtn.classList.add('active');
    }
}


function updateButtonsState(self) {
   
    const transformButtons = ['btnRotate', 'btnFlipVertical', 'btnFlipHorizontal'];
    const isSelectPart = !!self.selectPart;
    
    transformButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (isSelectPart) {
                btn.classList.remove('disabled-btn');
                btn.disabled = false;
            } else {
                btn.classList.add('disabled-btn');
                btn.disabled = true;
        
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    const selectBtn = document.getElementById('btnSelect');
                    if (selectBtn) selectBtn.classList.add('active');
                }
            }
        }
    });
    
  
    const btnRunAnalysis = document.getElementById('btnRunAnalysis');
    const isSelectAnalysis = !!self.selectAnalysis;
    
    if (btnRunAnalysis) {
        if (isSelectAnalysis) {
            btnRunAnalysis.classList.remove('disabled-btn');
            btnRunAnalysis.disabled = false;
        } else {
            btnRunAnalysis.classList.add('disabled-btn');
            btnRunAnalysis.disabled = true;
            if (btnRunAnalysis.classList.contains('active')) {
                btnRunAnalysis.classList.remove('active');
                const selectBtn = document.getElementById('btnSelect');
                if (selectBtn) selectBtn.classList.add('active');
            }
        }
    }
}

function initToolbar(self) {
const toolbar = document.getElementById('toolbar');
const areaGlobal = document.getElementById('areaGlobal');
if (!toolbar || !areaGlobal) return;

let hideTimeout;
areaGlobal.addEventListener('mouseenter', () => { clearTimeout(hideTimeout); toolbar.classList.add('visible'); });
areaGlobal.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => toolbar.classList.remove('visible'), 300); });
toolbar.addEventListener('mouseenter', () => { clearTimeout(hideTimeout); toolbar.classList.add('visible'); });
toolbar.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => toolbar.classList.remove('visible'), 300); });

document.getElementById('btnSelect').addEventListener('click',  () =>{self.activeBtnById('btnSelect');  self.shapes.design.mouse = false;  self.shapes.design.start = false; });
document.getElementById('btnZoomIn').addEventListener('click', () => {colorThemes(); self.zoomIn(); });
document.getElementById('btnZoomOut').addEventListener('click', () => { self.zoomOut(); });
document.getElementById('btnGrid').addEventListener('click', (e) => {  self.showGrid(!self.grid.showGrid); e.currentTarget.classList.toggle('active'); });
document.getElementById('btnSnap').addEventListener('click', (e) => { e.currentTarget.classList.toggle('active'); });

document.getElementById('btnEllipse').addEventListener('click',  () =>{self.activeBtnById('btnEllipse'); addShape('ellipse'); });
document.getElementById('btnRectangle').addEventListener('click',  () =>{self.activeBtnById('btnRectangle'); addShape('rect'); });
document.getElementById('btnPolyline').addEventListener('click',  () =>{self.activeBtnById('btnPolyline'); addShape('polyline'); });
document.getElementById('btnPolygon').addEventListener('click',  () =>{self.activeBtnById('btnPolygon'); addShape('polygon'); });
document.getElementById('btnArc').addEventListener('click',  () =>{self.activeBtnById('btnArc'); addShape('arc'); });
document.getElementById('btnAV').addEventListener('click',  () =>{self.activeBtnById('btnAV'); addShape('probe'); });
document.getElementById('btnText').addEventListener('click',  () =>{self.activeBtnById('btnText'); addShape('text');});
document.getElementById('btnPin').addEventListener('click',  () =>{self.activeBtnById('btnPin'); addShape('pin'); });
document.getElementById('btnReference').addEventListener('click',  () =>{self.activeBtnById('btnReference'); addShape('ref'); });
document.getElementById('btnParameter').addEventListener('click',  () =>{self.activeBtnById('btnParameter'); addShape('param'); });
document.getElementById('btnModel').addEventListener('click',  () =>{self.activeBtnById('btnModel'); addShape('modelSpice'); });
document.getElementById('btnAnalysis').addEventListener('click',  () =>{self.activeBtnById('btnAnalysis'); addShape("analysis"); });
document.getElementById('btnRunAV').addEventListener('click',  () =>{ opAnalysis(); });

document.getElementById('btnWire').addEventListener('click',  () =>{self.activeBtnById('btnWire'); addShape('net'); });
document.getElementById('btnPlaceComponent').addEventListener('click',  () =>{ showSymbolPanel() });
document.getElementById('btnGND').addEventListener('click',  () =>{self.activeBtnById('btnGND');  addGnd();});
document.getElementById('btnVCC').addEventListener('click',  () =>{self.activeBtnById('btnVCC');  addVBar(); });
document.getElementById('btnPort').addEventListener('click',  () =>{self.activeBtnById('btnPort');  addPort(); });

document.getElementById('btnRotate').addEventListener('click',  () =>{  rotatePart(); });
document.getElementById('btnFlipVertical').addEventListener('click',  () =>{ flipVerticallyPart(); });
document.getElementById('btnFlipHorizontal').addEventListener('click',  () =>{  flipHorizontalPart(); });

document.getElementById('btnBringToFront').addEventListener('click', () => {  
    start_listElements();
});
document.getElementById('btnSendToBack').addEventListener('click', () => {
    if (self.drawing && self.drawing.sendToBack) self.drawing.sendToBack();
});
document.getElementById('btnBringForward').addEventListener('click', () => {
    
});
document.getElementById('btnSendBackward').addEventListener('click', () => {
    if (self.drawing && self.drawing.sendBackward) self.drawing.sendBackward();
});
document.getElementById('btnShowPanel').addEventListener('click', (e) => {  const isActive=e.currentTarget.classList.toggle('active'); if(!propertiesData)  pageSelect();  
          if (isActive) {
                propertiesPanel.show(propertiesData);
            } else {
                    propertiesPanel.hide();
            }
});
const toolButtons = [
  'btnSelect', 'btnWire', 'btnBus', 'btnText',
  'btnRectangle', 'btnEllipse', 'btnArc', 'btnPolyline', 'btnPolygon',
  'btnVCC', 'btnPort', 'btnGND',
  'btnPin', 'btnReference', 'btnParameter',
  'btnRotate', 'btnFlipVertical', 'btnFlipHorizontal',
  'btnModel', 'btnCommand',
  'btnHTML', 'btnAnalysis', 'btnAV',
  'btnSubBlock'
];   

const toolNames = [
  'select', 'wire', 'bus', 'component', 'text',
  'rectangle', 'ellipse', 'arc', 'polyline', 'polygon',
  'vcc', 'port', 'gnd',
  'pin', 'reference', 'parameter',
  'rotate', 'flipVertical', 'flipHorizontal',
  'model', 'command',
  'html', 'analysis', 'av',
  'runAnalysis', 'runAV',
  'subblock'
];


function isButtonEnabled(id) {
    const btn = document.getElementById(id);
    return btn && !btn.classList.contains('hidden-btn') && !btn.classList.contains('disabled-btn');
}





document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    console.log(`Key pressed: ${key}, Ctrl: ${e.ctrlKey}, Shift: ${e.shiftKey}`);
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const keyMap = { 
       'a': 'btnArc', 
       'w': 'btnWire', 
       't': 'btnText',
       'e': 'btnEllipse', 
       'r': 'btnRectangle', 
       'l': 'btnPolyline', 
       'y': 'btnPolygon', 
       'u': 'btnVCC', 
       'n': 'btnGND', 
       'o': 'btnPort', 
       'i': 'btnPin', 
       'k': 'btnReference',
      'j': 'btnParameter' 
    };
    
    if (isCtrl && isShift && key === ']') {
        if (self.drawing && self.drawing.bringToFront) self.drawing.bringToFront();
        e.preventDefault();
        return;
    }
    if (isCtrl && isShift && key === '[') {
        if (self.drawing && self.drawing.sendToBack) self.drawing.sendToBack();
        e.preventDefault();
        return;
    }
    if (isCtrl && key === ']') {
        if (self.drawing && self.drawing.bringForward) self.drawing.bringForward();
        e.preventDefault();
        return;
    }
    if (isCtrl && key === '[') {
        if (self.drawing && self.drawing.sendBackward) self.drawing.sendBackward();
        e.preventDefault();
        return;
    }
    

    
    if (keyMap[key] !== undefined && !isShift) {
        const targetId = keyMap[key];
        if (isButtonEnabled(targetId)) {
            toolButtons.forEach(b => document.getElementById(b).classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            if (self.drawing && self.drawing.setTool) self.drawing.setTool(toolNames[keyMap[key]]);
        }
    }
    if (e.key === 'F9') {
        if (isButtonEnabled('btnRunAnalysis')) {
            toolButtons.forEach(b => document.getElementById(b).classList.remove('active'));
            document.getElementById('btnRunAnalysis').classList.add('active');
            if (self.drawing && self.drawing.setTool) self.drawing.setTool('runAnalysis');
        }
        e.preventDefault();
    }
    if (e.key === 'F10') { opAnalysis(); }
    if(!isCtrl && !isShift){
    if (key === '+') { self.zoomIn(); pageSelect()}
    if (key === '-') {  self.zoomOut(); }
    if (key === 'g') {  self.showGrid(!self.grid.showGrid);             
                        const gridBtn = document.getElementById('btnGrid');
                        if (gridBtn) gridBtn.classList.toggle('active');
                      }
    if (key === 'e') { addShape('ellipse');}
    if (key === 'a') { addShape('arc');}
    if (key === 'l') { addShape('polyline');}
    if (key === 'y') { addShape('polygon');}
    if (key === 'r') { addShape('rect');}
    if (key === 't') { addShape('text'); self.activeBtnSelect();}
    if (key === 'i') { if(drawing.pageType == 'dcs') return; addShape('pin'); self.activeBtnSelect();}
    if (key === 'k') { if(drawing.pageType == 'dcs') return; addShape('ref'); self.activeBtnSelect();}
    if (key === 'j') { if(drawing.pageType == 'dcs') return; addShape('param'); self.activeBtnSelect();}
    if (key === 'd') { if(drawing.pageType == 'dcs') return; addShape('modelSpice');  self.activeBtnSelect();}
    if (key === 'z') { if(drawing.pageType == 'sym') return;  addShape('probe');}
    if (key === 'w') { if(drawing.pageType == 'sym') return;  addShape('net');} 
    if ((key === 'escape') || (key === 'end') || (key === 'v')) { 
      self.activeBtnSelect();       
      self.shapes.design.mouse = false;
      self.shapes.design.start = false;
    }
    if (key === 'p') { if(drawing.pageType == 'sym') return; showSymbolPanel();}
    if (key === 'n') { if(drawing.pageType == 'sym') return;  addGnd(); self.activeBtnSelect();}
    if (key === 'u') { if(drawing.pageType == 'sym') return;  addVBar(); self.activeBtnSelect();}
    if (key === 'o') { if(drawing.pageType == 'sym') return;  addPort(); self.activeBtnSelect();}
   // if (key === 'x') { if(drawing.pageType == 'sym') return;  addShape('analysis');} 
    }
    if (isShift && key === 'r') {  rotatePart(); };
    if (isShift && key === 'v'){ flipVerticallyPart(); };
    if (isShift && key === 'h'){  flipHorizontalPart(); };

});


updateToolbarVisibility(self);
updateButtonsState(self);

self.updateToolbar = function() {
    updateToolbarVisibility(self);
    updateButtonsState(self);
};

self.updateButtonsState = function() {
    updateButtonsState(self);
};

self.activeBtnSelect = function(){
    toolButtons.forEach(b => {
        document.getElementById(b).classList.remove('active');
    });
    const selectBtn = document.getElementById('btnSelect');
    if (selectBtn) selectBtn.classList.add('active');
}

self.activeBtnById = function(id){
    toolButtons.forEach(b => {
        document.getElementById(b).classList.remove('active');
    });
    const selectBtn = document.getElementById(id);
    if (selectBtn) selectBtn.classList.add('active');
}


document.getElementById("btnBus").style.display = "none";

    // --- Future Application Buttons Logic ---'btnAnalysis',
    const futureButtons = [
          'btnRunAnalysis','btnCommand', 'btnHTML','btnSubBlock',
          'btnSendToBack','btnBringForward','btnSendBackward'
    ];
    
    futureButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.title = "Future Application (Coming Soon)";
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showFutureToast(newBtn);
            });
        }
    });

  
    function showFutureToast(btn) {
      
        let oldToast = document.getElementById('future-toast');
        if (oldToast) oldToast.remove();
        let toast = document.createElement('div');
        toast.id = 'future-toast';
        toast.innerText = 'Future Application (Coming Soon)';
        toast.style.cssText = `
            position: fixed; 
            background: #333; 
            color: #fff; 
            padding: 8px 16px; 
            border-radius: 6px; 
            font-size: 13px; 
            z-index: 10000; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
            transition: opacity 0.3s ease; 
            opacity: 0;
            font-family: verdana;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
        let rect = btn.getBoundingClientRect();
        toast.style.left = (rect.left + rect.width / 2 - toast.offsetWidth / 2) + 'px';
        toast.style.top = (rect.bottom + 10) + 'px';
        setTimeout(() => { toast.style.opacity = '1'; }, 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

}



async function avav(){
    
    var svgs = await drawing.redSymFilesFromWorkSpace();
// النتيجة: ["<svg>...</svg>", "<svg>...</svg>", ...]

console.log('Total .sym files loaded:', svgs.length);
console.log(svgs[1]); // محتوى أول ملف
}

async function showSymbolPanel() {
         drawing.updateDataSymbols();

      if (typeof symbolsPanel !== 'undefined') {
            symbolsPanel.show(); // if symbolsPanel is already defined, toggle its visibility
        }
      
}


function colorThemes()
{

  /*
var code = `
from pyams.models import BJT, Resistor

Qc1 = BJT("Vcc", "Out1", "Out2")
R1 = Resistor("Vcc", "Out1")
`;

drawing.getListParameter(code)
    .then(function (data) {
        drawing.getElementDialog(data, "R1.R",
            function (selected, info) {
                console.log(selected);   // "R1.R"
                console.log(info);       // {element, class, param, value, default, unit, description}
            },
            function () { console.log('Cancelled'); }
        );
    })
    .catch(function (err) { console.error('getListParameter failed:', err); });

 */
var code=`


from pyams.models import BJT

Rc1 = BJT("Vcc", "Out1", "Out2")
Rc1.setParams("n=3.7KΩ")
`;

drawing.getListParameter(code)
    .then(function (data) {
        drawing.getParametersDialog(data,
            function (result) {                 // عند OK
                console.log(JSON.stringify(result, null, 2));
            },
            function () { console.log('Cancelled'); }
        );
    })
    .catch(function (err) {
        console.error('getListParameter failed:', err);
    });
/*
drawing.getListParameter(code)
    .then(function (result) {
        console.log(JSON.stringify(result, null, 2));   // نص JSON
        console.log(result.models[0].params);           // أو الوصول للقيم مباشرة
    })
    .catch(function (err) {
        console.error('getListParameter failed:', err);
    });
*/
  	/*    var s = document.querySelectorAll('[name="net"]');
        for (var i = 0; i < s.length; i++) 
        {
            s[i].style.stroke = "#630811";
            s[i].style.strokeWidth ="1.3px";
        }

        var s = document.querySelectorAll('[name="polyline"]');
        for (var i = 0; i < s.length; i++) 
            s[i].style.stroke = "#2196f3";

        var s = document.querySelectorAll('[name="polygon"]');
        for (var i = 0; i < s.length; i++) 
            s[i].style.stroke = "#2196f3";

        var s = document.querySelectorAll('[name="ellipse"]');
        for (var i = 0; i < s.length; i++) 
            s[i].style.stroke = "#2196f3";

        var s = document.querySelectorAll('[name="arc"]');
        for (var i = 0; i < s.length; i++) 
            s[i].style.stroke = "#2196f3";



        var s = document.querySelectorAll('[name="rect"]');
        for (var i = 0; i < s.length; i++) 
            s[i].style.stroke = "#2196f3";*/
}