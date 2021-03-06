#-------------------------------------------------------------------------------
# Name:        IDEPyAMS
# Author:      d.fathi
# Created:     21/08/2021
# Update:      01/10/2021
# Copyright:   (c) pyams 2021
# Web:         www.PyAMS.org
# Version:     0.0.1
# Licence:     unlicense
# info:        the interface (IDE) of PyAMS
#-------------------------------------------------------------------------------


import sys,os
from PyQt5.QtWidgets import QApplication,QMainWindow
from SymbolEditor import *
from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from dialogs import *
from appcir import opAnalysis


#-------------------------------------------------------------------------------
# class IDEPyAMS: intrface of PyAMS
#-------------------------------------------------------------------------------

class IDEPyAMS(Mainwindow):
    def __init__(self):
        super(IDEPyAMS, self).__init__()
        self.w.setWindowTitle("IDEPyAMS")
        self.w.setWindowIcon(QIcon(":/image/logo.png"));
        self.filetype="pyams circuit (*.pac)";
        self.filenew='NewFile.pac';
        self.filename='NewFile.pac';
        self.title='IDE PyAMS';
        self.pagetype='pac';
        self.path='';
        self.caption();
        self.ui.actionWire.setVisible(True);
        self.ui.actionProbe.setVisible(True);
        self.ui.actionParts.setVisible(True);
        self.ui.actionGnd.setVisible(True);
        self.ui.actionFlipHorizontal.setVisible(True);
        self.ui.actionFlipVertically.setVisible(True);
        self.ui.actionRotate.setVisible(True);
        self.ui.actionPin.setVisible(False);
        self.ui.actionReference_2.setVisible(False);
        self.ui.actionPolyline.setVisible(False);
        self.ui.actionParamater.setVisible(False);
        self.ui.menuTools.menuAction().setVisible(True);
        self.ui.ToolsToolBar.setVisible(True);
        self.ui.menuRun.menuAction().setVisible(True);
        self.ui.RunToolBar.setVisible(True);
        self.ui.actionParts.triggered.connect(self.importPart);
        self.ui.actionRun.triggered.connect(self.run);
        self.my_document.typeSym=False;

    def getNetListRun(self,result):
        opAnalysis(self,result);


    def run(self):
        self.ui.m_webview.page().runJavaScript("ioGetProbesWithNetList();", self.getNetListRun);

    def importPart(self):
        dialog = dialogImportPart()
        dialog.setPath(self.path);
        dialog.w.setWindowTitle("Select Component Symbol");
        dialog.w.setWindowIcon(QIcon(":/image/logo.png"));
        if dialog.w.exec_():
            print(dialog.file)
            path=os.path.dirname(dialog.file);
            getpath=path.replace(self.path,'');
            f = open(dialog.file, 'r', encoding="utf-8")
            s=f.read()
            filename=os.path.splitext(os.path.basename(dialog.file))[0]
            self.ui.m_webview.page().runJavaScript("addPart(`"+s+"`,'"+getpath+"',true,'"+filename+"');");

    def message(self,title_,message_):
        QMessageBox.about(None, title_,message_)


#-------------------------------------------------------------------------------
# __main__: start IDE PyAMS software
#-------------------------------------------------------------------------------
if __name__ == '__main__':
        app=QApplication(sys.argv);
        w=IDEPyAMS();
        r=sys.argv[0].replace('\\','/');
        w.path=os.path.dirname(r)+'/symbols/';
        w.pathLib=os.path.dirname(r)+'/demo'
        w.show();
        sys.exit(app.exec_());
