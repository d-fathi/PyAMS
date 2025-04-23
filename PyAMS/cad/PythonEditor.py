#-------------------------------------------------------------------------------
# Name:        Editor of Python and Html
# Author:      D.fathi
# Created:     08/06/2022
# Update:      15/04/2025
# Copyright:   (c) PyAMS
# Licence:     GPLv3 (GNU)
#-------------------------------------------------------------------------------

import sys


from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *
from cad.dialogs import *
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QPushButton,QLineEdit,QDialogButtonBox,QLabel
from PyQt5.QtCore import QTimer
import cad.data_rc
import os


class openCode:
    ARROW_MARKER_NUM = 8
    def __init__(self,file):
        self.file=file
        self.w = QtWidgets.QDialog()
        self.editor=QtWidgets.QPlainTextEdit()
        self.editor.setStyleSheet("""QPlainTextEdit{
                                 font-family:'Consolas';
	                             color: #000000;
                                 font-size: 16px;
	                             background-color: #ffffff;}""")

        self.highlight = syntax_pars.PythonHighlighter(self.editor.document())
        self.w.resize(1150, 840)
        self.layout = QtWidgets.QVBoxLayout(self.w)
        self.layout.addWidget(self.editor);
        self.editor.toPlainText().encode("utf-8")
        self.w.closeEvent=self.closeEvent
        self.modified=False



        file_exists = os.path.exists(file)
        if(file_exists):
           infile = open(file, 'r', encoding="utf-8")
           self.editor.setPlainText(infile.read())


        btns = QDialogButtonBox()
        btns.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.layout.addWidget(btns)

        btns.accepted.connect(self.w.accept)
        btns.rejected.connect(self.w.reject)
        btns.button(QDialogButtonBox.Ok).setText("Save file")
        self.editor.modificationChanged.connect(self.isModified)

    def isModified(self, have_change):
        self.modified=have_change



    def save(self):
        #file = open(self.file,'w',encoding='utf-8')
        text = self.editor.toPlainText()
        with open(self.file, 'w',encoding='utf-8') as f:
            f.write(text)

    def closeEvent(self, event):
        if self.modified:
            ret = QMessageBox.question(None, 'MessageBox', "Do you want to save your changes? ", QMessageBox.Yes | QMessageBox.No | QMessageBox.Cancel, QMessageBox.Cancel)
            if ret == QMessageBox.Yes:
                self.save();
                event.accept();
            elif ret == QMessageBox.No:
               event.accept();
            else:
               event.ignore()

        else:
            event.accept();

class openCodePyCode:
    def __init__(self,file):
        self.file=file
        self.w = QtWidgets.QDialog()
        self.w.resize(750, 640)
        self.layout = QtWidgets.QVBoxLayout(self.w)
        self.webEngineView = QWebEngineView()
        self.layout.addWidget(self.webEngineView);
        self.webEngineView.page().setUrl(QtCore.QUrl("qrc:/editor.html"));



        btns = QDialogButtonBox()
        btns.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.layout.addWidget(btns)

        #btns.accepted.connect(self.getCode)
        #btns.rejected.connect(self.w.reject)



        file_exists = os.path.exists(file)
        if(file_exists):
           infile = open(file, 'r', encoding="utf-8")
           print(infile)




       # btns.button(QDialogButtonBox.Ok).setText("Save file")
        #self.editor.modificationChanged.connect(self.isModified)

    def isModified(self, have_change):
        self.modified=have_change



    def save(self):
        #file = open(self.file,'w',encoding='utf-8')
        text = self.editor.toPlainText()
        with open(self.file, 'w',encoding='utf-8') as f:
            f.write(text)

    def closeEvent(self, event):
        if self.modified:
            ret = QMessageBox.question(None, 'MessageBox', "Do you want to save your changes? ", QMessageBox.Yes | QMessageBox.No | QMessageBox.Cancel, QMessageBox.Cancel)
            if ret == QMessageBox.Yes:
                self.save();
                event.accept();
            elif ret == QMessageBox.No:
               event.accept();
            else:
               event.ignore()

        else:
            event.accept();


class openCodeHtml:
    ARROW_MARKER_NUM = 8
    def __init__(self,text):
        self.w = QtWidgets.QDialog()
        self.editor=QtWidgets.QPlainTextEdit()
        self.editor.setStyleSheet("""QPlainTextEdit{
                                 font-family:'Consolas';
                                 color: #ccc;
                                 background-color: #2b2b2b;}""")

        self.highlight = syntax_pars.PythonHighlighterHTML(self.editor.document())
        self.w.resize(1150, 840)
        self.layout = QtWidgets.QVBoxLayout(self.w)
        self.layout.addWidget(self.editor);
        self.editor.toPlainText().encode("utf-8")
        self.w.closeEvent=self.closeEvent
        self.modified=False

        self.editor.setPlainText(text)


        btns = QDialogButtonBox()
        btns.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.layout.addWidget(btns)

        btns.accepted.connect(self.w.accept)
        btns.rejected.connect(self.w.reject)
        btns.button(QDialogButtonBox.Ok).setText("Save file")
        self.editor.modificationChanged.connect(self.isModified)

    def isModified(self, have_change):
        self.modified=have_change



    def save(self):
        #file = open(self.file,'w',encoding='utf-8')
        text = self.editor.toPlainText()


    def closeEvent(self, event):
        if self.modified:
            ret = QMessageBox.question(None, 'MessageBox', "Do you want to save your changes? ", QMessageBox.Yes | QMessageBox.No | QMessageBox.Cancel, QMessageBox.Cancel)
            if ret == QMessageBox.Yes:
                self.setWin.ui.m_webview.page().runJavaScript("setHtmlCode(`"+self.editor.toPlainText()+"`);");
                event.accept();
            elif ret == QMessageBox.No:
               event.accept();
            else:
               event.ignore()

        else:
            event.accept();






def showCode(self,modelName,directory):
    if(self.setWin.typePyAMS):
         file=self.setWin.path+'/models/'+directory+'/'+modelName+'.py'
         if(self.setWin.itProject and directory=='Project'):
            path=os.path.dirname(self.setWin.filename)
            file=path+'/lib/'+modelName+'.py'
         dialog =openCodePyCode(file);
         dialog.w.setWindowTitle("Model:  "+file);
         dialog.w.setWindowIcon(self.setWin.setIcon);
         if dialog.w.exec():
           dialog.save()
    else:
         file=self.setWin.path+'/'+directory+'/'+modelName+'.model'
         if(self.setWin.itProject and directory=='Project'):
            path=os.path.dirname(self.setWin.filename)
            file=path+'/lib/'+modelName+'.model'
         dialog =openCode(file);
         dialog.w.setWindowTitle("Model:  "+file);
         dialog.w.setWindowIcon(self.setWin.setIcon);
         if dialog.w.exec():
           dialog.save()



def showCodeBySymEd(self):
    file=self.setWin.filename
    if file=='NewFile.sym':
         QMessageBox.about(None, 'Model not exist','Save your new symbol');
    else:
        root, ext = os.path.splitext(file)
        file=root+'.py'
        dialog =openCodePyCode(file);
        dialog.w.setWindowTitle("File:  "+file);
        dialog.w.setWindowIcon(self.setWin.setIcon);
        if dialog.w.exec():
              dialog.save()



def showCodeHtml(self,codeHtml):
    dialog =openCodeHtml(codeHtml);
    dialog.w.setWindowTitle("Code HTML");
    dialog.w.setWindowIcon(self.setWin.setIcon);
    dialog.setWin=self.setWin;
    if dialog.w.exec():
        self.setWin.ui.m_webview.page().runJavaScript("setHtmlCode("+str([dialog.editor.toPlainText()])+");");



def showPyCode(self,filename):

    if(self.setWin.itProject and (filename=='None')):
         QMessageBox.about(None, 'Message','Select the Python file')

    if(self.setWin.itProject and (filename!='None')):
        path=os.path.dirname(self.setWin.filename)
        file=path+'/lib/'+filename
        dialog =openCodePyCode(file);
        dialog.w.setWindowTitle("File:  "+file);
        dialog.w.setWindowIcon(self.setWin.setIcon);
        if dialog.w.exec():
           dialog.save()



if __name__ == "__main__":
    file="E:/project/PyAMS/models/Basic/Resistor.py"
    import sys
    app =  QtWidgets.QApplication(sys.argv)
    window = openCode(file)


    if window.w.exec():
        window.save()
