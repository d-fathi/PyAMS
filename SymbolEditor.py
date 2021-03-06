
#-------------------------------------------------------------------------------
# Name:        SymbolEditor
# Author:      d.fathi
# Created:     19/08/2021
# Update:      01/10/2021
# Copyright:   (c) pyams 2021
# Web:         www.PyAMS.org
# Version:     0.0.1
# Licence:     unlicense
# info:        Symbol Editor
#-------------------------------------------------------------------------------

import sys
sys.path+=["lib"]
sys.path+=["lib\\ui"]

from PyQt5.QtWidgets import QApplication,QMainWindow
from mainwindow import Ui_MainWindow
from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from PyQt5.QtWebChannel import QWebChannel
from appcir import getListSignalsNodeParams
from dialogs import *


#-------------------------------------------------------------------------------
# class Document: Used to connect to a web document (index.html)
#-------------------------------------------------------------------------------
class Document(QObject):

    def __init__(self,setWin):
        super(Document, self).__init__()
        self.setWin=setWin;
        self.typeSym=True

    @pyqtSlot(list)
    def getRef(self, o):
        d=o[0]
        self.setWin.updatWin(d);

    @pyqtSlot(result=bool)
    def newPage(self):
        return self.typeSym

    @pyqtSlot(result=list)
    def return_list(self):
        return [0.0, 1.5, 1.4]

    @pyqtSlot(int)
    def setInt(self, i):
        print(i+1)

    @pyqtSlot(list)
    def setList(self, i):
        print(sum(i))

    @pyqtSlot(str, result=str)
    def jscallme(self, str_args):
        print('call received')
        print('resolving......init home..')
        print(str_args)

    @pyqtSlot(str, result=str)
    def getProbeValue(self, str_args):
        print(str_args);
        self.setWin.updatePosProbe();


#-------------------------------------------------------------------------------
# class Frame: create a frame in the status bar
#-------------------------------------------------------------------------------
class VLine(QFrame):
    def __init__(self):
        super(VLine, self).__init__()
        self.setFrameShape(self.VLine|self.Sunken)

#-------------------------------------------------------------------------------
# class Mainwindow: intrface of symbol editor
#-------------------------------------------------------------------------------
class Mainwindow:
    def __init__(self):
        self.w = QMainWindow()

        self.path='';
        self.pathLib='';

        self.ui = Ui_MainWindow()
        self.ui.setupUi(self.w)
        self.filetype="symbol file (*.sym)";
        self.filenew='NewFile.sym';
        self.filename='NewFile.sym';
        self.title='Symbol Editor';
        self.pagetype='sym';
        self.modified=False;

        self.ui.m_webview.page().setUrl(QUrl("qrc:/index.html"));
        self.ui.statusbar.showMessage('Message in statusbar.');
        self.updateStatubar();
        self.my_document= Document(self);
        self.channel = QWebChannel();
        self.channel.registerObject('document', self.my_document)
        self.ui.m_webview.page().setWebChannel(self.channel);

        self.ui.actionOpen.triggered.connect(self.open);
        self.ui.actionSave.triggered.connect(self.save);
        self.ui.actionSave_as.triggered.connect(self.saveAs);
        self.ui.actionNew.triggered.connect(self.new);

        self.ui.menuTools.menuAction().setVisible(True);
        self.ui.ToolsToolBar.setVisible(False);
        self.ui.menuRun.menuAction().setVisible(False);
        self.ui.RunToolBar.setVisible(False);
        self.ui.actionFlipHorizontal.setVisible(False);
        self.ui.actionFlipVertically.setVisible(False);
        self.ui.actionRotate.setVisible(False);

        self.ui.actionZoom_In.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioZoomIn();"));
        self.ui.actionZoom_Out.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioZoomOut();"));
        self.ui.actionUndo.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioUndo();"));
        self.ui.actionRedo.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioRedo();"));
        self.ui.actionCopy.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioCopy();"));
        self.ui.actionCut.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioCut();"));
        self.ui.actionPaste.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioPast();"));

        self.ui.actionPin.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('pin');"));
        self.ui.actionReference_2.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('ref');"));
        self.ui.actionParamater.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('param');"));
        self.ui.actionPolyline.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('polyline');"));
        self.ui.actionWire.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('net');"));
        self.ui.actionGnd.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addGnd();"));
        self.ui.actionProbe.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('probe');"));
        self.ui.actionEnd.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioEndDrawing();"));
        self.ui.actionSVGExport.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("savePageToSVG(1.5)",self.exportSVG));
        self.ui.actionFlipHorizontal.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioTypeRotation('flipHorizontal');"));
        self.ui.actionFlipVertically.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioTypeRotation('flipVertical');"));
        self.ui.actionRotate.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioTypeRotation('rotate');"));
        self.ui.m_webview.setContextMenuPolicy(Qt.CustomContextMenu)
        self.ui.m_webview.customContextMenuRequested.connect(self.openMenu)


    def openMenu(self,position):
        contextMenu = QMenu();
        contextMenu.addAction(self.ui.actionEnd);
        contextMenu.addSeparator();
        contextMenu.addAction(self.ui.actionCopy);
        contextMenu.addAction(self.ui.actionCut);
        contextMenu.addAction(self.ui.actionPaste);
        action = contextMenu.exec_(self.ui.m_webview.mapToGlobal(position))


    def caption(self):
        self.ui.actionSave.setEnabled(self.modified);
        if self.modified :
            f=self.filename+'*';
        else:
            f=self.filename;
        self.w.setWindowTitle(self.title+"["+f+"]");


    def dialogeListSignalsNodeParamsFromCircuit(self,result):
        data=getListSignalsNodeParams(self,result);
        dialog =dialogListSignalsParamaters(data);
        dialog.w.setWindowTitle("Lists of signals paramatres and nodes");
        dialog.w.setWindowIcon(QIcon(":/image/logo.png"));
        if dialog.w.exec_():
            self.ui.m_webview.page().runJavaScript("ioSetPosProbe('"+dialog.pos+"');");


    def updatePosProbe(self):
        self.ui.m_webview.page().runJavaScript("ioGetProbesWithNetList();", self.dialogeListSignalsNodeParamsFromCircuit);


    def updatWin(self,dic):
        self.lbl1.setText('(X,Y)='+str(dic['x'])+','+str(dic['y']));
        self.lbl2.setText('Zoom='+dic['zoom']);
        self.ui.actionCut.setEnabled(dic['select']);
        self.ui.actionCopy.setEnabled(dic['select']);
        self.ui.actionPaste.setEnabled(dic['past']);
        self.ui.actionUndo.setEnabled(dic['undo']);
        self.ui.actionRedo.setEnabled(dic['redo']);
        self.ui.actionEnd.setChecked(dic['endDrawing']);
        self.ui.actionFlipHorizontal.setEnabled(dic['selectPart']);
        self.ui.actionFlipVertically.setEnabled(dic['selectPart']);
        self.ui.actionRotate.setEnabled(dic['selectPart']);
        self.modified=dic['modified'];
        self.ui.statusbar.showMessage(dic['undoPos']);
        self.caption();


    def __save(self, response):
        file = open(self.filename,'w', encoding="utf-8")
        file.write(response)
        file.close()


    def shakeSave(self):
        if self.modified:
            ret = QMessageBox.question(None, 'MessageBox', "Save changes in symbole", QMessageBox.Yes | QMessageBox.No | QMessageBox.Cancel, QMessageBox.Cancel)
            if ret == QMessageBox.Yes:
                self.save();
                return not(self.modified);
            elif ret == QMessageBox.No:
                return True;
            else:
                return False;
        return True;

    def show(self):
        self.w.show()


    def new(self):
        if self.shakeSave():
            self.filename=self.filenew;
            self.ui.m_webview.page().runJavaScript("ioNewPage('"+self.pagetype+"');");


    def open(self):
        if self.shakeSave():
            fname = QFileDialog.getOpenFileName(None, 'Open file',self.pathLib,self.filetype)
            if(fname[0]!=''):
                self.filename=fname[0];
                f = open(fname[0], 'r', encoding="utf-8")
                s=f.read()
                self.ui.m_webview.page().runJavaScript("ioSetSymbol(`"+s+"`);");


    def save(self):
        if  self.filename==self.filenew:
            self.saveAs();
        else:
            self.ui.m_webview.page().runJavaScript("ioGetSymbol();", self.__save);


    def saveAs(self):
        fname = QFileDialog.getSaveFileName(None, 'Save File',self.pathLib,self.filetype)
        if(fname[0]!=''):
            self.filename=fname[0];
            self.ui.m_webview.page().runJavaScript("ioGetSymbol();", self.__save);

    def exportSVG(self, response):
        fname = QFileDialog.getSaveFileName(None, 'Save File to SVG form',' ',"svg file (*.svg)")
        if(fname[0]!=''):
            response=response;
            file = open(fname[0],'w', encoding="utf-8")
            file.write(response)
            file.close()

    def updateStatubar(self):
        self.lbl1 = QLabel("Pos: ")
        self.lbl1.setStyleSheet('border: 0; color:  blue;')
        self.lbl2 = QLabel("zoom: ")
        self.lbl2.setStyleSheet('border: 0; color:  red;')

        self.ui.statusbar.reformat()
        self.ui.statusbar.setStyleSheet('border: 0; background-color: #FFF8DC;')
        self.ui.statusbar.setStyleSheet("QStatusBar::item {border: none;}")

        self.ui.statusbar.addPermanentWidget(VLine())
        self.ui.statusbar.addPermanentWidget(self.lbl1)
        self.ui.statusbar.addPermanentWidget(VLine())
        self.ui.statusbar.addPermanentWidget(self.lbl2)


    def copy(self):
        self.r=Mainwindow();
        self.r.show();


#-------------------------------------------------------------------------------
# __main__: start Symbol Editor software
#-------------------------------------------------------------------------------

if __name__ == "__main__":
        app=QApplication(sys.argv);

        w=Mainwindow();
        w.show();
        w.path=sys.path[0]
        w.pathLib=w.path+'\symbols'

        sys.exit(app.exec_());
