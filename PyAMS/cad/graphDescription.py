
#-------------------------------------------------------------------------------
# Name:        Show Graph
# Author:      d.fathi
# Created:     20/02/2024
# Update:      20/02/2024
# Copyright:   (c) DSpice 2024
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from sys import path
from cad.showGraph import Ui_Dialog
from PyQt5.QtWebChannel import QWebChannel
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import *
import os
from PyQt5.QtWidgets import QMainWindow, QApplication
from PyQt5.QtWebEngineWidgets import QWebEngineView
import cad.data_rc


class graphDescription:
    def __init__(self,parent):
        self.w = QtWidgets.QDialog()

        self.path='';
        self.pathLib='';
        self.parent=parent;
        self.ui = Ui_Dialog()
        self.ui.setupUi(self.w)

        self.ui.m_webview.page().setUrl(QUrl("qrc:/showGraph.html"));
        self.ui.m_webview.loadFinished.connect(self.onLoadFinished);

    def showGraph(self,result):
        layout=result[0]
        data=result[1]
        self.ui.m_webview.page().runJavaScript("plot("+data+","+layout+");");


    def onLoadFinished(self):
         self.parent.ui.m_webview.page().runJavaScript("showAnalysis();",self.showGraph);

    def result(self,layout):
        self.parent.ui.m_webview.page().runJavaScript("setLayout("+layout+");");


    def save(self):
        self.ui.m_webview.page().runJavaScript("getLayout();",self.result);

    def show(self):
        self.w.show()

def showGraph(self):
    dialog =graphDescription(self);
    dialog.w.setWindowTitle("Show graph of analysis");
    dialog.w.setWindowIcon(self.setIcon);
    if dialog.w.exec():
          dialog.save();

if __name__ == '__main__':
     import sys
     app = QApplication(sys.argv)
     window = graphDescription('null')
     window.show()
     app.exec_()
