#-------------------------------------------------------------------------------
# Name:        module1
# Author:      D.fathi
# Created:     06/06/2022
# Copyright:   (c) D.fathi 2022
#-------------------------------------------------------------------------------

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QPushButton,QLineEdit,QDialogButtonBox,QLabel
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtCore import QTimer
import data_rc

class openCode:
    def __init__(self,file):
        self.file=file
        self.w = QtWidgets.QDialog()
        self.w.resize(750, 640)
        self.layout = QtWidgets.QVBoxLayout(self.w)
        self.webEngineView = QWebEngineView()
        self.layout.addWidget(self.webEngineView);
        self.webEngineView.page().setUrl(QtCore.QUrl("qrc:/synedit/synedit.html"));



        btns = QDialogButtonBox()
        btns.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.layout.addWidget(btns)
        self.timer=QTimer()
        self.timer.timeout.connect(self.setCode)
        self.timer.start(2000)

        btns.accepted.connect(self.getCode)
        btns.rejected.connect(self.w.reject)


    def setCode(self):
        self.timer.stop()
        file = open(self.file,'r')
        lines = list(file)
        print(str(lines))
        self.webEngineView.page().runJavaScript("addText("+str(lines)+");")

    def saveCode(self,result):
        print(result)
        self.w.close();

    def getCode(self):
        self.webEngineView.page().runJavaScript("getText();",self.saveCode)






def showCode(self,modelName,directory):
    file=self.setWin.path+'/'+directory+'/'+modelName+'.py'
    print(file)
    window = openCode(file)
    if window.w.exec_():
        pass





if __name__ == "__main__":
    pass

    file="E:/project/PyAMS/symbols/Basic/Resistor.py"
    import sys
    app =  QtWidgets.QApplication(sys.argv)
    window = openCode(file)


    if window.w.exec():
        window.getCode();


