#-------------------------------------------------------------------------------
# Name:        modified paramtres of elementes
# Author:      d.fathi
# Created:     19/10/2021
# Update:      10/04/2025
# Copyright:   (c) pyams 2025
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QVBoxLayout,QPushButton,QLineEdit,QDialogButtonBox,QLabel,QTextEdit
from PyQt5.QtCore import QProcess
from cad.config import pyProcess
import os
import json



class listParams:
    def __init__(self,main):
        self.main=main
        self.path=os.path.dirname(os.path.normpath(self.main.ppDir))
        self.w = QtWidgets.QDialog()
        self.w.resize(450, 240)
        self.p = None
        self.start_process()
        self.err=False
        self.layout = QtWidgets.QVBoxLayout(self.w)




    def start_process(self):
            self.p = QProcess()  # Keep a reference to the QProcess (e.g. on self) while it's running.
            self.p.readyReadStandardOutput.connect(self.handle_stdout)
            self.p.readyReadStandardError.connect(self.handle_stderr)
            self.p.stateChanged.connect(self.handle_state)
            self.p.finished.connect(self.process_finished)  # Clean up once complete.
            self.p.setWorkingDirectory(self.path)
            self.p.start(pyProcess(self.main.ppDir), ["-m","pyams.temp_script"])



    def handle_stderr(self):
        data = self.p.readAllStandardError()
        stderr = bytes(data).decode("utf8")
        '#-----------stderr-----------#'
        if not(self.err):
           self.text = QTextEdit()
           self.layout.addWidget(self.text)
        self.text.append(stderr)
        self.err=True


    def handle_stdout(self):
        data = self.p.readAllStandardOutput()
        # Convert bytes to str
        decoded = str(data, 'utf-8').strip()
        # Convert JSON to Python Object
        params = json.loads(decoded)
        self.lisval=params
        '#-----------stdout-----------#'
        self.err=False


    def handle_state(self, state):
        states = {
            QProcess.NotRunning: 'Not running',
            QProcess.Starting: 'Starting',
            QProcess.Running: 'Running',
        }
        state_name = states[state]
        print(f"State changed: {state_name}")

    def process_finished(self):

       '#-----------Process finished-----------#'
       if not(self.err):
        self.scrollArea = QtWidgets.QScrollArea(self.w)
        self.scrollArea.setWidgetResizable(True)
        self.scrollAreaWidgetContents = QtWidgets.QWidget()
        self.gridLayout = QtWidgets.QGridLayout(self.scrollAreaWidgetContents)
        self.scrollArea.setWidget(self.scrollAreaWidgetContents)
        self.layout.addWidget(self.scrollArea)
        try:
           self.le=[]
           self.l=len(self.lisval)
           for i in range(self.l):
            a=self.lisval[i]
            self.le+=[QLineEdit(str(a['value']))]
            description=QLabel();
            description.setTextFormat(QtCore.Qt.RichText)
            description.setText(a['description']+'['+a['unit']+']')
            self.gridLayout.addWidget(QLabel(a['name']), i, 0)
            self.gridLayout.addWidget(self.le[i], i, 1)
            self.gridLayout.addWidget(description, i, 2)
        except Exception as e: # work on python 3.x
            print('Error: '+ str(e));

        btns = QDialogButtonBox()
        btns.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.layout.addWidget(btns)
        btns.accepted.connect(self.w.accept)
        btns.rejected.connect(self.w.reject)

    def getModified(self):
        p='';
        for i in range(self.l):
            a=self.lisval[i]
            p=p+' '+a['name']+'='+self.le[i].text()
        return p

    def show(self):
        self.w.show()



