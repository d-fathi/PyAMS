/*
#--------------------------------------------------------------------------------------------------
# Name:        grid.js
# Author:      d.fathi
# Created:     28/05/2021
# Update:      05/08/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free
#---------------------------------------------------------------------------------------------------
 */


//------------------Class for creat and modified : grid , ruler and zoom-----------------------------------//
function fgrid(svg, width, height) {
    this.zoom = 2;
    this.posZoom = 0;
    this.width = width;
    this.height = height;
    this.svg = svg;
	this.px=10;
	this.showGrid=true;
    this.area = {
        areaA: document.getElementById('areaA'),
        areaB: document.getElementById('areaB'),
        areaC: document.getElementById('areaC'),
        areaGlobal: document.getElementById('areaGlobal')
    };
    var self = this;

    this.getGrid = function () {
        function gridStep(step) {
            var g = '';
            for (var i = 0; i <= self.height; i = i + step)
                g = g + "M 0 " + i + "  H " + self.width + " ";
            for (var i = 0; i <= self.width; i = i + step)
                g = g + "M " + i + " 0 V " + self.height + " ";
            return g;
        }
        var step = 20;

        if (self.posZoom <= 1)
            step = 20;
        else if (self.posZoom <= 2.5)
            step = 10;
        else
            step = 5;
      if(self.showGrid){
        document.getElementById('smallGrid').setAttribute("d", gridStep(step));
        document.getElementById('grid').setAttribute("d", gridStep(100));
      }
	  else
		  {
        document.getElementById('smallGrid').setAttribute("d","M 0 0 V 0");
        document.getElementById('grid').setAttribute("d","M 0 0 V 0");
      }

	}

    this.setZoom = function () {
        document.getElementById(self.svg).setAttribute("height", self.zoom * self.height);
        document.getElementById(self.svg).setAttribute("width", self.zoom * self.width);
		self.getRuler();
    }

	this.getRuler=function()
	{
		setRuler(self);
	}

    this.includeGridChange = function () {

        //document.getElementById('zoom').innerHTML = 'zoom=' + self.zoom;
        if ((self.posZoom != 3) && (self.zoom >= 3)) {
            self.posZoom = 3;
            self.getGrid();
        } else if ((self.posZoom != 2) && (self.zoom >= 2) && (self.zoom < 3)) {
            self.posZoom = 2;
            self.getGrid();
        } else if ((self.posZoom != 1) && (self.zoom >= 1) && (self.zoom < 2)) {
            self.posZoom = 1;
            self.getGrid();
        } else if ((self.posZoom > 1) && (self.zoom < 1)) {
            self.posZoom = 0;
            self.getGrid();
        }

    }

    this.zoomIn = function () {
        self.zoom = self.zoom + 0.2;
        self.setZoom();
        self.includeGridChange();
        self.resize.zoom = self.zoom;
        self.resize.updateSizeByZoom();
    }
    this.zoomOut = function () {
        self.zoom = self.zoom - 0.2;
        self.setZoom();
        self.includeGridChange();
        self.resize.zoom = self.zoom;
        self.resize.updateSizeByZoom();
    }

    self.setZoom();

    this.pageSize = function (w, h) {
        document.getElementById(self.svg).setAttribute("viewBox", "0 0 " + w + " " + h + " ");
        self.width = w;
        self.height = h;
        self.setZoom();
        self.getGrid();
    }

    self.pageSize(width, height);

}
