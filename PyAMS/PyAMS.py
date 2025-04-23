#-------------------------------------------------------------------------------
# Name:        PyAMS
# Author:      d.fathi
# Created:     21/08/2021
# Update:      12/04/2025
# Copyright:   (c) PyAMS 2025
# Web:         https://pyams.sf.net/
# Version:     0.1.3 (beta)
# Licence:     free  "GPLv3"
# info:        The interface of design and simulation circuit (CAD)
#-------------------------------------------------------------------------------

import sys,os
from PyQt5.QtWidgets import QApplication,QMainWindow
from SymbolEditor import *
from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from cad.appcir import analysis
from cad.dialogs import *
from cad.dialogLibraryManagement import libraryManagement
from PyQt5 import QtWebEngineWidgets

#-------------------------------------------------------------------------------
# Class PyAMS: Interface for circuit design and simulation (CAD) using PyAMS
#-------------------------------------------------------------------------------
class PyAMS(Mainwindow):
    '''
     PyAMS (Python for Analog and Mixed Signals) is used to simplify modeling analog elements
     (using pyams_lib) and simulate electronic circuit.
    '''
    def __init__(self):
        super(PyAMS, self).__init__()
        self.typePyAMS=True;
        self.setIcon=QIcon(":/image/logo.png");
        self.title='PyAMS';
        self.w.setWindowTitle(self.title)
        self.w.setWindowIcon(self.setIcon);
        self.w.showMaximized();
        self.filetype="Designing Circuits and Simulation (*.dcs)";
        self.filenew='NewFile.dsc';
        self.filename='NewFile.dsc';

        self.pagetype='dsc';
        self.path='';
        self.caption();

        self.ui.actionWire.setVisible(True);
        self.ui.actionProbe.setVisible(True);
        self.ui.actionGnd.setVisible(True);
        self.ui.actionText.setVisible(True);
        self.ui.actionPythonCode.setVisible(True);
        self.ui.actionPythonCode.setEnabled(True);
        self.ui.actionAnalysis.setVisible(True);
        self.ui.actionAnalysis.setEnabled(True);
        self.ui.actionHtml.setEnabled(True);
        self.ui.actionHtml.setVisible(True);
        self.ui.actionOptionSimulation.setVisible(True);
        self.ui.actionOptionAnalysis.setVisible(True);

        self.ui.actionPause.setVisible(False);
        self.ui.actionSymbolEditor.setVisible(True);
        self.ui.actionOscilloscope.setVisible(True);
        self.ui.actionFlipHorizontal.setVisible(True);
        self.ui.actionFlipVertically.setVisible(True);
        self.ui.actionRotate.setVisible(True);
        self.ui.actionPin.setVisible(False);
        self.ui.actionEllipse.setVisible(False);
        self.ui.actionArc.setVisible(False);
        self.ui.actionRect.setVisible(False);
        self.ui.actionPolygon.setVisible(False);
        self.ui.actionReference_2.setVisible(False);
        self.ui.actionPolyline.setVisible(False);
        self.ui.actionParamater.setVisible(False);
        self.ui.actionLabel.setVisible(False);
        self.ui.actionParam.setVisible(False);
        self.ui.actionItProject.setVisible(True);
        self.ui.menuTools.menuAction().setVisible(True);
        self.ui.ToolsToolBar.setVisible(True);
        self.ui.menuRun.menuAction().setVisible(True);
        self.ui.RunToolBar.setVisible(True);
        #self.ui.actionLibraryManagement.triggered.connect(self.getlibraryManagement);
        self.ui.actionRun.triggered.connect(self.run);
        self.ui.actionRunAnalysis.triggered.connect(self.runAnalysis);
        self.ui.actionPause.triggered.connect(self.pause);
        self.ui.actionOptionSimulation.triggered.connect(self.optionSimulation);
        self.ui.actionOptionAnalysis.triggered.connect(self.optionAnalysis);
        self.ui.actionSymbolEditor.triggered.connect(self.showSymbolEditor);
        self.my_document.typeSym=False;
        self.ui.actionRun.setVisible(False);
        self.ui.actionOscilloscope.setVisible(False);
        self.ui.menuPart.menuAction().setVisible(True);


        dire =os.path.dirname(__file__)
        self.history_file =dire+"\\cad\\file_history.json"
        self.file_history = self.load_file_history()
        self.update_reopen_menu();

    def getNetListRun(self,result):
        opAnalysis(self,result);
        tranAnalysis(self,result);

    def run(self):
        self.ui.m_webview.page().runJavaScript("ioGetProbesWithNetList('interactive');", self.getNetListRun);

    def getRunAnalysis(self,result):
        try:
          analysis(self,result);
        except Exception as e: #Work on python 3.x
          str_error='Error: '+ str(e);
          self.message('Error',str_error);


    def runAnalysis(self):
      try:
        r=self.filename;
        self.pathProject=os.path.dirname(r);
        self.ui.m_webview.page().runJavaScript("getSource()", self.getRunAnalysis);
      except Exception as e:
        str_error='Error: '+ str(e);
        self.message('Error',str_error);

    def pause(self):
        self.ui.m_webview.page().runJavaScript("plotStopFunction();");


    def message(self,title_,message_):
        QMessageBox.about(None, title_,message_)

    def setOptionSimulation(self,result):
        try:
          dialog =optionSimulation(result);
          if dialog.w.exec_() or  dialog.reset:
            s=str([dialog.r]);
            self.ui.m_webview.page().runJavaScript("ioSetOptionSimulation("+s+");");
        except Exception as e: # work on python 3.x
          str_error='Error: '+ str(e);
          self.message('Error',str_error);

    def setOptionAnalysis(self,result):
        try:
          dialog =optionAnalysis(result);
          if dialog.w.exec_() :
            s=str(dialog.r);
            self.ui.m_webview.page().runJavaScript("ioSetOptionAnalysis("+s+");");
        except Exception as e: # work on python 3.x
          str_error='Error: '+ str(e);
          self.message('Error',str_error);

    def optionSimulation(self):
        self.ui.m_webview.page().runJavaScript("ioOptionSimulation();", self.setOptionSimulation);


    def optionAnalysis(self):
        self.ui.m_webview.page().runJavaScript("ioOptionAnalysis();", self.setOptionAnalysis);

    def openSymbol(self,file):
        self.symbEditor=Mainwindow();
        self.symbEditor.ui.m_webview.loadFinished.connect(lambda: self.symbEditor.openFromShow(file));
        self.symbEditor.w.show();
        self.symbEditor.IDEPyAMS=self;
        #if(result[0]):
        #  self.symbEditor.modifiedSymboleFromSchema(result[1],result[2]);

    def showSymbolEditor(self):
        self.symbEditor=Mainwindow();
        self.symbEditor.pathLib=self.path
        self.symbEditor.path=self.path
        #self.ui.m_webview.page().runJavaScript("ioGetSelectSymbol();", self.openSymbol);
        self.symbEditor.w.show();
        self.symbEditor.IDEPyAMS=self;


#-------------------------------------------------------------------------------
# __main__: start PyAMS software
#-------------------------------------------------------------------------------
def  main():
        app=QApplication(sys.argv);
        w=PyAMS();
        r=sys.argv[0].replace('\\','/');
        w.ppDir=os.path.dirname(r);
        w.path=os.path.dirname(r);
        w.pathLib=os.path.dirname(r)+'/demo';
        if(len(sys.argv)>1):
            w.ui.m_webview.loadFinished.connect(lambda: w.openFromShow(sys.argv[1]))
        #w.message('exe',t);
        w.show();
        sys.exit(app.exec_());

if __name__ == '__main__':
    main()
