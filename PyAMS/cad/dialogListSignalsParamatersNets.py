#-------------------------------------------------------------------------------
# Name:        get list of signals, params and nodes from circuit
# Author:      d.fathi
# Created:     22/02/2023
# Update:      11/04/2025
# Copyright:   (c) pyams 2025
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QTreeWidgetItem,QTreeWidget
from collections import deque
from PyQt5.QtCore import QProcess
import os
import cad.data_rc
import json
from PyQt5.QtCore import Qt
from cad.config import pyProcess

#-------------------------------------------------------------------------------
# class Ui_DialogListSignalsParamaters: intrface of dialog List of Signals
#                                         &Paramaters.
#-------------------------------------------------------------------------------

class Ui_DialogListSignalsParamaters(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(449, 510)
        self.verticalLayout_2 = QtWidgets.QVBoxLayout(Dialog)
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        self.verticalLayout = QtWidgets.QVBoxLayout()
        self.verticalLayout.setObjectName("verticalLayout")
        self.tree = QTreeWidget()
        self.tree.setHeaderLabel("Name")
        self.verticalLayout.addWidget(self.tree)
        self.buttonBox = QtWidgets.QDialogButtonBox(Dialog)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.verticalLayout.addWidget(self.buttonBox)
        self.verticalLayout_2.addLayout(self.verticalLayout)

        self.retranslateUi(Dialog)
        self.buttonBox.accepted.connect(Dialog.accept)
        self.buttonBox.rejected.connect(Dialog.reject)
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(_translate("Dialog", "Dialog"))

def getImage(child):
    if child['nature']=='param':
        return ":image/paramsignals/param.png"
    elif (child['nature']=='potential'):
        if(child['direction']=='out'):
           return ":image/paramsignals/vout.png"
        return ":image/paramsignals/vin.png"
    elif (child['nature']=='flow'):
        if(child['direction']=='out'):
           return ":image/paramsignals/iout.png"
        return ":image/paramsignals/iin.png"
    elif child['nature']=='node':
         return ":image/paramsignals/node.png"


def get_icon_by_nature(style, nature):
    if nature == 'flow':
        return style.standardIcon(QStyle.SP_ArrowForward)
    elif nature == 'potential':
        return style.standardIcon(QStyle.SP_FileDialogContentsView)
    elif nature == 'param':
        return style.standardIcon(QStyle.SP_DriveHDIcon)
    elif nature == 'node':
        return style.standardIcon(QStyle.SP_DirIcon)
    else:
        return style.standardIcon(QStyle.SP_FileIcon)

#-------------------------------------------------------------------------------
# class dialogListSignalsParamaters:  dialog List of Signals
#                                         & Paramaters.
#-------------------------------------------------------------------------------


class listSignalsParamatersNets:
    def __init__(self,main,test,selected_item,type_):
        self.type_=type_
        self.test=test
        self.selected_item=selected_item
        print(self.selected_item)
        self.main=main
        self.w = QtWidgets.QDialog()

        self.path=''
        self.pathLib=''
        self.p = None
        self.start_process()
        self.err=False



    def start_process(self):
            self.p = QProcess()  # Keep a reference to the QProcess (e.g. on self) while it's running.
            self.p.readyReadStandardOutput.connect(self.handle_stdout)
            self.p.readyReadStandardError.connect(self.handle_stderr)
            self.p.stateChanged.connect(self.handle_state)
            self.p.finished.connect(self.process_finished)  # Clean up once complete.
            print(self.test)
            self.p.start(pyProcess(self.main.ppDir), [str(self.test)])



    def handle_stderr(self):
        data = self.p.readAllStandardError()
        stderr = bytes(data).decode("utf8")
        '#-----------stderr-----------#'
        if not(self.err):
           self.text = QtWidgets.QTextEdit()
           self.layout = QtWidgets.QVBoxLayout(self.w)
           self.layout.addWidget(self.text)
        self.text.append(stderr)
        self.err=True


    def handle_stdout(self):
        data = self.p.readAllStandardOutput()
        # تحويل من bytes إلى str
        decoded = str(data, 'utf-8').strip()
        # تحويل JSON إلى كائن Python
        params = json.loads(decoded)
        # طباعة الناتج للتأكيد
        self.data=params

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
         try:
           self.ui = Ui_DialogListSignalsParamaters()
           self.ui.setupUi(self.w)

           if  self.type_==3:
              self.load_tree_param(self.data)
           else:
              self.load_tree(self.data)

           self.select_item(self.selected_item)

           self.pos='None'
           self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);
         except Exception as e: # work on python 3.x
            print('Error: '+ str(e));


    def treeClicked(self, item, column):
        selected = item.data(0, Qt.UserRole)
        print(selected)
        if selected:
            if len(selected['name'].split('.')) > 1:
                print("Name:", selected['name'])
                print("Icon:", selected['icon'])
                print("Nature:", selected['nature'])
                self.name=selected['name']
                self.nature=selected['nature']
                self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(True);
            else:
                self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);
        else:
            self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);

    def load_tree(self, data):
        for item in data:
            parent = QTreeWidgetItem(self.ui.tree)
            parent.setText(0, item['name'])

            for child in item.get('children', []):
                print(child)
                child_item = QTreeWidgetItem(parent)
                child_item.setText(0, child['name'])
                child_item.setData(0, Qt.UserRole, child)
                icon = QtGui.QIcon(getImage(child))
                child_item.setIcon(0, icon)

        self.ui.tree.expandAll()
        self.ui.tree.itemClicked.connect(self.treeClicked)


    def load_tree_param(self, data):
        for item in data:
            parent = QTreeWidgetItem(self.ui.tree)
            parent.setText(0, item['name'])

            for child in item.get('children', []):
              if(child['nature']=='param'):
                print(child)
                child_item = QTreeWidgetItem(parent)
                child_item.setText(0, child['name'])
                child_item.setData(0, Qt.UserRole, child)
                icon = QtGui.QIcon(getImage(child))
                child_item.setIcon(0, icon)

        self.ui.tree.expandAll()
        self.ui.tree.itemClicked.connect(self.treeClicked)

    def select_item(self, item_name):

        def recursive_search(parent):
            for i in range(parent.childCount()):
                child = parent.child(i)
                if child.text(0) == item_name:
                    child.setSelected(True)
                    self.ui.tree.setCurrentItem(child)
                    self.expand_parents(child)
                    return True
                if recursive_search(child):
                    return True
            return False

        recursive_search(self.ui.tree.invisibleRootItem())


    def expand_parents(self, item):
        while item:
            item.setExpanded(True)
            item = item.parent()


    def show(self):
        self.w.show()