#-------------------------------------------------------------------------------
# Name:        synedit
# Author:      d.fathi
# Created:     06/06/2022
# Update:      16/04/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from PyQt5 import QtCore, QtGui
from PyQt5.QtWidgets import QApplication, QDialog, QVBoxLayout,QDialogButtonBox,QMessageBox
from PyQt5.QtWebEngineWidgets import QWebEngineView
import json
import cad.data_rc
import os


#-------------------------------------------------------------------------------
# Python Syntaxe Edit
#-------------------------------------------------------------------------------

class openCode(QDialog):
    def __init__(self,code,file):
        super().__init__()
        self.setWindowTitle(f" Editor dialog  of model: {file}")
        self.setWindowIcon(QtGui.QIcon(":/image/logo.png"))
        self.file=file;
        self.resize(950, 640)
        self.layout = QVBoxLayout(self)
        self.webEngineView = QWebEngineView()
        self.layout.addWidget(self.webEngineView);
        self.webEngineView.page().setUrl(QtCore.QUrl("qrc:/synedit/editor.html"));
        self.webEngineView.loadFinished.connect(lambda: self.openCode(code))



        btns = QDialogButtonBox()
        btns.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.layout.addWidget(btns)

        btns.accepted.connect(self.getTextSave)
        btns.rejected.connect(self.reject)
        btns.button(QDialogButtonBox.Ok).setText("Save file")


    def openCode(self, code):
      safe_code = json.dumps(code)
      self.webEngineView.page().runJavaScript(f"openCode({safe_code});")


    def save(self,text):
        with open(self.file, 'w',encoding='utf-8') as f:
            f.write(text)
        self.reject();

    def getTextSave(self):
       self.webEngineView.page().runJavaScript("saveCode()",self.save)


    def isTextChanged(self,result):
        if result:
            ret = QMessageBox.question(self, 'MessageBox', "Do you want to save your changes? ", QMessageBox.Yes | QMessageBox.No | QMessageBox.Cancel, QMessageBox.Cancel)
            if ret == QMessageBox.Yes:
                self.getTextSave();
            elif ret == QMessageBox.No:
               self.reject();
        else:
            self.reject();


    def closeEvent(self, event):
        self.webEngineView.page().runJavaScript('isTextChanged();',self.isTextChanged);
        event.ignore()







def openmodel(self,modelName,directory):

    def setmodel():
       file=self.path+'/models/'+directory+'/'+modelName+'.py'
       if os.path.exists(file):
          code = open(file, 'r', encoding="utf-8").read()
       else:
          code=''
       window = openCode(code,file)

       if window.exec_():
            pass

    from PyQt5.QtCore import QTimer
    QTimer.singleShot(1, setmodel)



def openmodelBySymEd(self):

    def setmodel():
      file=self.filename
      if file=='NewFile.sym':
         QMessageBox.about(None, 'Model not exist','Save your new symbol');
      else:
        root, ext = os.path.splitext(file)
        file=root+'.py'
        file_exists = os.path.exists(file)
        if(file_exists):
           code = open(file, 'r', encoding="utf-8").read()
        else:
           code=''

      window = openCode(code,file)
      if window.exec_():
        pass

    from PyQt5.QtCore import QTimer
    QTimer.singleShot(1, setmodel)


#--------------------------------------------------------------------------------
# Html Syntaxe Edit
#--------------------------------------------------------------------------------


class openCodeHtml(QDialog):
    def __init__(self,code,win):
        super().__init__()
        self.setWindowTitle(f" Editor dialog  of Html")
        self.setWindowIcon(QtGui.QIcon(":/image/logo.png"))
        self.win=win;
        self.resize(950, 640)
        self.layout = QVBoxLayout(self)
        self.webEngineView = QWebEngineView()
        self.layout.addWidget(self.webEngineView);
        self.webEngineView.page().setUrl(QtCore.QUrl("qrc:/synedit/editor_html.html"));
        self.webEngineView.loadFinished.connect(lambda: self.openCode(code))



        btns = QDialogButtonBox()
        btns.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.layout.addWidget(btns)

        btns.accepted.connect(self.getTextSave)
        btns.rejected.connect(self.reject)
        btns.button(QDialogButtonBox.Ok).setText("Save HTML")


    def openCode(self, code):
      safe_code = json.dumps(code)
      self.webEngineView.page().runJavaScript(f"openCode({safe_code});")


    def save(self,text):
        safe_code = json.dumps(text)
        self.win.ui.m_webview.page().runJavaScript(f"setHtmlCode({safe_code});")
        self.reject();

    def getTextSave(self):
       self.webEngineView.page().runJavaScript("saveCode()",self.save)


    def isTextChanged(self,result):
        if result:
            ret = QMessageBox.question(self, 'MessageBox', "Do you want to save your changes? ", QMessageBox.Yes | QMessageBox.No | QMessageBox.Cancel, QMessageBox.Cancel)
            if ret == QMessageBox.Yes:
                self.getTextSave();
            elif ret == QMessageBox.No:
               self.reject();
        else:
            self.reject();


    def closeEvent(self, event):
        self.webEngineView.page().runJavaScript('isTextChanged();',self.isTextChanged);
        event.ignore()



def openHtml(self,code):

    def setHtml():
       window = openCodeHtml(code,self)
       if window.exec_():
            pass

    from PyQt5.QtCore import QTimer
    QTimer.singleShot(1, setHtml)



if __name__ == "__main__":
    pass

    file="E:/project/PyAMS/symbols/Basic/Resistor.py"
    import sys
    app =  QtWidgets.QApplication(sys.argv)
    window = openCode()


    if window.exec():
        window.getCode();


