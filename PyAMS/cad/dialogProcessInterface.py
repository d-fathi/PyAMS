#-------------------------------------------------------------------------------
# Name:        Interface of excute
# Author:      D.fathi
# Created:     09/10/2022
# Update:      20/04/2025
# Copyright:   (c) D.fathi 2025
# Licence:     free
#-------------------------------------------------------------------------------


import sys
import time
from PyQt5.QtCore import QThread, pyqtSignal
from PyQt5.QtWidgets import QWidget, QPushButton,QDialog, QProgressBar, QVBoxLayout, QApplication, QPlainTextEdit
from PyQt5.QtCore import QProcess
from cad.config import pyProcess
import os
import json


class processAnalysis:
    def __init__(self,main,title):

        self.w = QDialog()
        self.w.resize(600,400)
        self.main=main;
        self.path=os.path.dirname(os.path.normpath(self.main.ppDir))
        self.w.setWindowTitle(title)
        self.w.setWindowIcon(main.setIcon);
        self.p = None

        self.btn = QPushButton("Execute")
        self.btn.pressed.connect(self.start_process)
        self.text = QPlainTextEdit()
        self.text.setReadOnly(True)
        self.progress = QProgressBar(self.w)
        self.progress.setValue(0)

        l = QVBoxLayout()
        l.addWidget(self.btn)
        l.addWidget(self.text)
        l.addWidget(self.progress)
        self.w.setLayout(l)

       # self.w.setCentralWidget(w)

    def message(self, s):
        self.text.appendPlainText(s)

    def start_process(self):
        if self.p is None:  # No process running.
            self.message("Executing process")
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
        self.message(stderr)



    def handle_stdout(self):
       try:
        data = self.p.readAllStandardOutput()
        # Convert bytes to str
        decoded = str(data, 'utf-8').strip()
        # Convert JSON to Python Object
        data = json.loads(decoded)
        self.progress.setValue(data['progress'])
        self.result=data
        self.err=False
       except Exception as e: # work on python 3.x
          str_error='Error: '+ str(e)


    def handle_state(self, state):
        states = {
            QProcess.NotRunning: 'Not running',
            QProcess.Starting: 'Starting',
            QProcess.Running: 'Running',
        }
        state_name = states[state]
        self.message(f"State changed: {state_name}")

    def process_finished(self):
        self.message("Process finished.")
        self.p = None
        self.progress.setValue(100)
        try:
            self.main.ui.m_webview.page().runJavaScript("dataPlot("+str(self.result["data"])+");")
        except:
           pass


    def close(self):
        self.w.close();

    def show(self):
        self.w.show()



class processOpAnalysis:

    def __init__(self,main,title):
        self.w = QDialog()
        self.w.resize(600,400)
        self.main=main;
        self.path=os.path.dirname(os.path.normpath(self.main.ppDir))
        self.w.setWindowTitle(title)
        self.w.setWindowIcon(main.setIcon);
        self.p = None
        self.text = QPlainTextEdit()
        self.text.setReadOnly(True)

        l = QVBoxLayout()
        l.addWidget(self.text)
        self.w.setLayout(l)


    def message(self, s):
        self.text.appendPlainText(s)

    def start_process(self):
        if self.p is None:  # No process running.
            self.message("Executing process")
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
        self.message(stderr)



    def handle_stdout(self):
        data = self.p.readAllStandardOutput()
        # Convert bytes to str
        decoded = str(data, 'utf-8').strip()
        # Convert JSON to Python Object
        self.data = json.loads(decoded)


    def handle_state(self, state):
        states = {
            QProcess.NotRunning: 'Not running',
            QProcess.Starting: 'Starting',
            QProcess.Running: 'Running',
        }
        state_name = states[state]
        self.message(f"State changed: {state_name}")

    def process_finished(self):
        self.message("Process finished.")
        self.p = None
        try:
           self.main.ui.m_webview.page().runJavaScript("setPropValue('"+self.data[0]["value"]+"')");
        except:
           pass

    def close(self):
        self.w.close();

    def show(self):
        self.w.show()




