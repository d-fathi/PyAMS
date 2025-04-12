#-------------------------------------------------------------------------------
# Name:        runInterface
# Purpose:
# Author:      D.fathi
# Created:     09/10/2022
# Copyright:   (c) D.fathi 2022
# Licence:     <your licence>
#-------------------------------------------------------------------------------


import sys
import time
from PyQt5.QtCore import QThread, pyqtSignal
from PyQt5.QtWidgets import QWidget, QPushButton,QDialog, QProgressBar, QVBoxLayout, QApplication
from PyQt5.QtCore import QProcess

class Thread(QThread):
    _signal = pyqtSignal(int)
    def __init__(self):
        super(Thread, self).__init__()
        self.pos=0

    def __del__(self):
        self.wait()

    def run(self):
        while self.pos<=100:
            time.sleep(0.001)
            self._signal.emit(self.pos)


class runAnalysis:
    def __init__(self,main,test,title,result):
        self.w = QDialog()
        self.w.resize(300,100)
        self.main=main;
        self.w.setWindowTitle(title)
        self.w.setWindowIcon(main.setIcon);
        self.btn = QPushButton('Run')
        self.btn.clicked.connect(self.btnFunc)
        self.pbar = QProgressBar(self.w)
        self.pbar.setValue(0)
        self.vbox = QVBoxLayout()
        self.vbox.addWidget(self.pbar)
        self.vbox.addWidget(self.btn)
        self.w.setLayout(self.vbox)
        print(test)
        self.send=True
        self.p = QProcess()  # Keep a reference to the QProcess (e.g. on self) while it's running.
        self.p.readyReadStandardOutput.connect(self.handle_stdout)
        self.p.start("python3", [test])
    def handle_stdout(self):
        data = self.p.readAllStandardOutput()
        stdout = bytes(data).decode("utf8")
        print(stdout)

    def btnFunc(self):
        self.thread = Thread()
        self.thread._signal.connect(self.signal_accept)
        self.thread.start()
        self.btn.setEnabled(False)

    def signal_accept(self, msg):
        a=self.test.AppPyAMS.runByPyQt()
        print(a)
        self.pbar.setValue(a[0])

        if self.test.AppPyAMS.sium.stop:

            self.pbar.setValue(0)
            self.btn.setEnabled(True)
            self.thread.pos=200
            appPyAMS=self.test.AppPyAMS;

            if self.send:
              self.send=False;
              if self.test.AppPyAMS.usedSweep:
                result=[{'usedaX':str(appPyAMS.usedaX),'sweep':1,'data':appPyAMS.sweepListData,'units':appPyAMS.getUnit(),'sweepList':appPyAMS.getSweepListStr()}]
              else:
                result=[{'usedaX':str(appPyAMS.usedaX),'sweep':0,'data':appPyAMS.data,'units':appPyAMS.getUnit()}]
              self.main.ui.m_webview.page().runJavaScript("setDataPlot("+str(result)+");");
              self.w.close();


    def show(self):
        self.w.show()


