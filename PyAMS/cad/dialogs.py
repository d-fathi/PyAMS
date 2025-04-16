#-------------------------------------------------------------------------------
# Name:        dialogs
# Author:      d.fathi
# Created:     20/03/2015
# Update:      02/10/2021
# Copyright:   (c) dspice 2024
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyQt5 import QtCore, QtGui, QtWidgets
from collections import deque
import os
import cad.data_rc




#-------------------------------------------------------------------------------
# class Ui_DialogImportPart: intrface of dialog for import symbols.
#-------------------------------------------------------------------------------

class Ui_DialogImportPart(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(396, 389)
        self.gridLayout = QtWidgets.QGridLayout(Dialog)
        self.gridLayout.setObjectName("gridLayout")
        self.horizontalLayout = QtWidgets.QHBoxLayout()
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.verticalLayout = QtWidgets.QVBoxLayout()
        self.verticalLayout.setObjectName("verticalLayout")
        self.label = QtWidgets.QLabel(Dialog)
        self.label.setObjectName("label")
        self.verticalLayout.addWidget(self.label)
        self.treeView = QtWidgets.QTreeView(Dialog)
        self.treeView.setObjectName("treeView")
        self.verticalLayout.addWidget(self.treeView)
        self.horizontalLayout.addLayout(self.verticalLayout)
        self.verticalLayout_2 = QtWidgets.QVBoxLayout()
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        self.label_2 = QtWidgets.QLabel(Dialog)
        self.label_2.setObjectName("label_2")
        self.verticalLayout_2.addWidget(self.label_2)
        self.listView = QtWidgets.QListView(Dialog)
        self.listView.setObjectName("listView")
        self.verticalLayout_2.addWidget(self.listView)
        self.horizontalLayout.addLayout(self.verticalLayout_2)
        self.gridLayout.addLayout(self.horizontalLayout, 0, 0, 1, 1)
        self.buttonBox = QtWidgets.QDialogButtonBox(Dialog)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.gridLayout.addWidget(self.buttonBox, 1, 0, 1, 1)

        self.retranslateUi(Dialog)
        self.buttonBox.accepted.connect(Dialog.accept)
        self.buttonBox.rejected.connect(Dialog.reject)
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(_translate("Dialog", "Dialog"))
        self.label.setText(_translate("Dialog", "Directory"))
        self.label_2.setText(_translate("Dialog", "Symbols"))


#-------------------------------------------------------------------------------
# class dialogImportPart:  dialog for import symbols.
#-------------------------------------------------------------------------------

class dialogImportPart:
    def __init__(self):
        self.w = QtWidgets.QDialog()

        self.pathLib='';

        self.ui = Ui_DialogImportPart()
        self.ui.setupUi(self.w)
        self.dirModel = QtWidgets.QFileSystemModel()
        self.dirModel.setRootPath(QtCore.QDir.rootPath())
        self.dirModel.setFilter(QtCore.QDir.NoDotAndDotDot | QtCore.QDir.AllDirs)

        self.fileModel = QtWidgets.QFileSystemModel()
        self.fileModel.setNameFilters(["*.sym"])
        self.fileModel.setNameFilterDisables(False)

        self.ui.treeView.setModel(self.dirModel)
        self.ui.listView.setModel(self.fileModel)

        self.ui.treeView.clicked.connect(self.treeClicked)
        self.ui.listView.clicked.connect(self.listClicked)

        self.ui.treeView.hideColumn(1)
        self.ui.treeView.hideColumn(2)
        self.ui.treeView.hideColumn(3)
        self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);



    def setPath(self,path):
        self.ui.treeView.setRootIndex(self.dirModel.index(path))
        self.ui.listView.setRootIndex(self.fileModel.index(path))

    def treeClicked(self, index):
        path = self.dirModel.fileInfo(index).absoluteFilePath()
        self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);
        self.ui.listView.setRootIndex(self.fileModel.setRootPath(path))

    def listClicked(self, index):
        path = self.fileModel.fileInfo(index).absoluteFilePath()
        self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);
        if path!='':
            root, ext = os.path.splitext(path)
            if(ext=='.sym'):
                self.file=path;
                self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(True);

    def show(self):
        self.w.show()

#-------------------------------------------------------------------------------
# class ui_optionSimulation:  interface of dialog option simulation.
#-------------------------------------------------------------------------------


class ui_optionSimulation(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(528, 503)
        icon = QtGui.QIcon()
        icon.addPixmap(QtGui.QPixmap(":/image/logo.png"), QtGui.QIcon.Normal, QtGui.QIcon.Off)
        Dialog.setWindowIcon(icon)
        Dialog.setSizeGripEnabled(False)
        self.gridLayout_2 = QtWidgets.QGridLayout(Dialog)
        self.gridLayout_2.setSizeConstraint(QtWidgets.QLayout.SetFixedSize)
        self.gridLayout_2.setObjectName("gridLayout_2")
        self.horizontalLayout_6 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_6.setObjectName("horizontalLayout_6")
        self.pushButtonReset = QtWidgets.QPushButton(Dialog)
        self.pushButtonReset.setObjectName("pushButtonReset")
        self.horizontalLayout_6.addWidget(self.pushButtonReset)
        spacerItem = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout_6.addItem(spacerItem)
        self.buttonBox = QtWidgets.QDialogButtonBox(Dialog)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.horizontalLayout_6.addWidget(self.buttonBox)
        self.gridLayout_2.addLayout(self.horizontalLayout_6, 6, 0, 1, 1)
        self.groupBox_2 = QtWidgets.QGroupBox(Dialog)
        self.groupBox_2.setObjectName("groupBox_2")
        self.verticalLayout = QtWidgets.QVBoxLayout(self.groupBox_2)
        self.verticalLayout.setObjectName("verticalLayout")
        self.horizontalLayout_5 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_5.setObjectName("horizontalLayout_5")
        self.label_5 = QtWidgets.QLabel(self.groupBox_2)
        self.label_5.setObjectName("label_5")
        self.horizontalLayout_5.addWidget(self.label_5)
        self.spinBoxInterval = QtWidgets.QSpinBox(self.groupBox_2)
        self.spinBoxInterval.setMinimum(100)
        self.spinBoxInterval.setMaximum(1100)
        self.spinBoxInterval.setProperty("value", 100)
        self.spinBoxInterval.setObjectName("spinBoxInterval")
        self.horizontalLayout_5.addWidget(self.spinBoxInterval)
        self.verticalLayout.addLayout(self.horizontalLayout_5)
        self.gridLayout_2.addWidget(self.groupBox_2, 2, 0, 1, 1)
        self.groupBox_3 = QtWidgets.QGroupBox(Dialog)
        self.groupBox_3.setObjectName("groupBox_3")
        self.gridLayout_3 = QtWidgets.QGridLayout(self.groupBox_3)
        self.gridLayout_3.setObjectName("gridLayout_3")
        self.horizontalLayout_7 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_7.setObjectName("horizontalLayout_7")
        self.label_6 = QtWidgets.QLabel(self.groupBox_3)
        self.label_6.setObjectName("label_6")
        self.horizontalLayout_7.addWidget(self.label_6)
        self.comboBox = QtWidgets.QComboBox(self.groupBox_3)
        self.comboBox.setCurrentText("")
        self.comboBox.setObjectName("comboBox")
        self.horizontalLayout_7.addWidget(self.comboBox)
        self.gridLayout_3.addLayout(self.horizontalLayout_7, 0, 0, 1, 1)
        self.gridLayout_2.addWidget(self.groupBox_3, 1, 0, 1, 1)
        self.groupBox = QtWidgets.QGroupBox(Dialog)
        self.groupBox.setObjectName("groupBox")
        self.gridLayout = QtWidgets.QGridLayout(self.groupBox)
        self.gridLayout.setObjectName("gridLayout")
        self.horizontalLayout = QtWidgets.QHBoxLayout()
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.label = QtWidgets.QLabel(self.groupBox)
        self.label.setObjectName("label")
        self.horizontalLayout.addWidget(self.label)
        self.lineEditAFtol = QtWidgets.QLineEdit(self.groupBox)
        self.lineEditAFtol.setObjectName("lineEditAFtol")
        self.horizontalLayout.addWidget(self.lineEditAFtol)
        self.gridLayout.addLayout(self.horizontalLayout, 0, 0, 1, 1)
        self.horizontalLayout_4 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_4.setObjectName("horizontalLayout_4")
        self.label_4 = QtWidgets.QLabel(self.groupBox)
        self.label_4.setObjectName("label_4")
        self.horizontalLayout_4.addWidget(self.label_4)
        self.spinBoxITL = QtWidgets.QSpinBox(self.groupBox)
        self.spinBoxITL.setMinimum(50)
        self.spinBoxITL.setMaximum(1000)
        self.spinBoxITL.setProperty("value", 100)
        self.spinBoxITL.setObjectName("spinBoxITL")
        self.horizontalLayout_4.addWidget(self.spinBoxITL)
        self.gridLayout.addLayout(self.horizontalLayout_4, 4, 0, 1, 1)
        self.horizontalLayout_2 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_2.setObjectName("horizontalLayout_2")
        self.label_2 = QtWidgets.QLabel(self.groupBox)
        self.label_2.setObjectName("label_2")
        self.horizontalLayout_2.addWidget(self.label_2)
        self.lineEditAPtol = QtWidgets.QLineEdit(self.groupBox)
        self.lineEditAPtol.setObjectName("lineEditAPtol")
        self.horizontalLayout_2.addWidget(self.lineEditAPtol)
        self.gridLayout.addLayout(self.horizontalLayout_2, 1, 0, 1, 1)
        self.horizontalLayout_3 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_3.setObjectName("horizontalLayout_3")
        self.label_3 = QtWidgets.QLabel(self.groupBox)
        self.label_3.setObjectName("label_3")
        self.horizontalLayout_3.addWidget(self.label_3)
        self.lineEditReltol = QtWidgets.QLineEdit(self.groupBox)
        self.lineEditReltol.setObjectName("lineEditReltol")
        self.horizontalLayout_3.addWidget(self.lineEditReltol)
        self.gridLayout.addLayout(self.horizontalLayout_3, 2, 0, 1, 1)
        self.horizontalLayout_8 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_8.setObjectName("horizontalLayout_8")
        self.label_7 = QtWidgets.QLabel(self.groupBox)
        self.label_7.setObjectName("label_7")
        self.horizontalLayout_8.addWidget(self.label_7)
        self.lineEditError = QtWidgets.QLineEdit(self.groupBox)
        self.lineEditError.setObjectName("lineEditError")
        self.horizontalLayout_8.addWidget(self.lineEditError)
        self.gridLayout.addLayout(self.horizontalLayout_8, 3, 0, 1, 1)
        self.gridLayout_2.addWidget(self.groupBox, 0, 0, 1, 1)

        self.retranslateUi(Dialog)
        self.comboBox.setCurrentIndex(-1)
        self.buttonBox.accepted.connect(Dialog.accept) # type: ignore
        self.buttonBox.rejected.connect(Dialog.reject) # type: ignore
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(_translate("Dialog", "Simulator Options"))
        self.pushButtonReset.setText(_translate("Dialog", "Reset to Default"))
        self.groupBox_2.setTitle(_translate("Dialog", "Interactive simulation"))
        self.label_5.setText(_translate("Dialog", "Interval of simulation in  milliseconds         "))
        self.groupBox_3.setTitle(_translate("Dialog", "Integration"))
        self.label_6.setText(_translate("Dialog", "Method"))
        self.groupBox.setTitle(_translate("Dialog", "Converge"))
        self.label.setText(_translate("Dialog", "Absolute flow tolerance   (aftol)                        "))
        self.lineEditAFtol.setText(_translate("Dialog", "1e-8"))
        self.label_4.setText(_translate("Dialog", "Maximum number of iterations (ITL)                  "))
        self.label_2.setText(_translate("Dialog", "Absolute potential tolerance (aptol)                   "))
        self.lineEditAPtol.setText(_translate("Dialog", "1e-6"))
        self.label_3.setText(_translate("Dialog", "Relative flow and potential tolerances (realtol)   "))
        self.lineEditReltol.setText(_translate("Dialog", "1e-3"))
        self.label_7.setText(_translate("Dialog", "Eror of convergance   (error)                            "))
        self.lineEditError.setText(_translate("Dialog", "1e-8"))


#-------------------------------------------------------------------------------
# class option:  option simulation.
#-------------------------------------------------------------------------------

class optionSimulation:
    def __init__(self,result):
        self.w = QtWidgets.QDialog()

        self.r=result[0]
        self.reset=False;
        self.path='';
        self.pathLib='';

        self.ui = ui_optionSimulation()
        self.ui.setupUi(self.w)


        if 'itProject' in self.r:
            del self.r['itProject'];
        if 'itl' in self.r:
            self.ui.spinBoxITL.setValue(self.r['itl']);
        if 'interval' in self.r:
            self.ui.spinBoxInterval.setValue(self.r['interval']);
        if 'aftol' in self.r:
           self.ui.lineEditAFtol.setText(str(self.r['aftol']));
        if 'aptol' in self.r:
           self.ui.lineEditAPtol.setText(str(self.r['aptol']));
        if 'reltol' in self.r:
           self.ui.lineEditReltol.setText(str(self.r['reltol']));
        if 'error' in self.r:
           self.ui.lineEditError.setText(str(self.r['error']));

        self.ui.comboBox.addItems(["trapezoidal", "gear"]);
        if 'integration' in self.r:
           self.ui.comboBox.setCurrentText(self.r['integration']);

        self.ui.spinBoxITL.textChanged.connect(self.itl)
        self.ui.spinBoxInterval.textChanged.connect(self.interval)
        self.ui.lineEditAFtol.textChanged.connect(self.aftol)
        self.ui.lineEditAPtol.textChanged.connect(self.aptol)
        self.ui.lineEditError.textChanged.connect(self.error)
        self.ui.lineEditReltol.textChanged.connect(self.reltol)
        self.ui.comboBox.currentTextChanged.connect(self.integration)


       # self.ui.buttonBox.accepted.connect(self.accept);
        self.ui.pushButtonReset.clicked.connect(self.updateOption);

    def itl(self):
        self.r['itl']=self.ui.spinBoxITL.value();

    def interval(self):
        self.r['interval']=self.ui.spinBoxInterval.value();

    def aptol(self):
        self.r['aptol']=self.ui.lineEditAPtol.text();

    def aftol(self):
        self.r['aftol']=self.ui.lineEditAFtol.text();

    def reltol(self):
        self.r['reltol']=self.ui.lineEditReltol.text();

    def integration(self,value):
        self.r['integration']=self.ui.comboBox.currentText();

    def error(self):
        self.r['error']=self.ui.lineEditError.text();



    def updateOption(self):
        self.r={};
        self.reset=True;
        self.w.close();



    def show(self):
        self.w.show()


#-------------------------------------------------------------------------------
# class ui_optionAnalysis:  interface of dialog option analysis.
#-------------------------------------------------------------------------------


class ui_optionsAnalysis(object):
    def setupUi(self, DialogOptionsAnalysis):
        DialogOptionsAnalysis.setObjectName("DialogOptionsAnalysis")
        DialogOptionsAnalysis.resize(328, 157)
        icon = QtGui.QIcon()
        icon.addPixmap(QtGui.QPixmap(":/image/logo.png"), QtGui.QIcon.Normal, QtGui.QIcon.Off)
        DialogOptionsAnalysis.setWindowIcon(icon)
        self.verticalLayout = QtWidgets.QVBoxLayout(DialogOptionsAnalysis)
        self.verticalLayout.setObjectName("verticalLayout")
        self.groupBox = QtWidgets.QGroupBox(DialogOptionsAnalysis)
        self.groupBox.setTitle("")
        self.groupBox.setObjectName("groupBox")
        self.gridLayout_3 = QtWidgets.QGridLayout(self.groupBox)
        self.gridLayout_3.setObjectName("gridLayout_3")
        self.horizontalLayout_7 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_7.setObjectName("horizontalLayout_7")
        self.label_6 = QtWidgets.QLabel(self.groupBox)
        self.label_6.setObjectName("label_6")
        self.horizontalLayout_7.addWidget(self.label_6)
        self.comboBoxSecondSweep = QtWidgets.QComboBox(self.groupBox)
        self.comboBoxSecondSweep.setObjectName("comboBoxSecondSweep")
        self.comboBoxSecondSweep.addItem("")
        self.comboBoxSecondSweep.addItem("")
        self.horizontalLayout_7.addWidget(self.comboBoxSecondSweep)
        self.gridLayout_3.addLayout(self.horizontalLayout_7, 0, 0, 1, 1)
        self.verticalLayout.addWidget(self.groupBox)
        self.buttonBox = QtWidgets.QDialogButtonBox(DialogOptionsAnalysis)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.verticalLayout.addWidget(self.buttonBox)

        self.retranslateUi(DialogOptionsAnalysis)
        self.comboBoxSecondSweep.setCurrentIndex(0)
        self.buttonBox.accepted.connect(DialogOptionsAnalysis.accept) # type: ignore
        self.buttonBox.rejected.connect(DialogOptionsAnalysis.reject) # type: ignore
        QtCore.QMetaObject.connectSlotsByName(DialogOptionsAnalysis)

    def retranslateUi(self, DialogOptionsAnalysis):
        _translate = QtCore.QCoreApplication.translate
        DialogOptionsAnalysis.setWindowTitle(_translate("DialogOptionsAnalysis", "Options Analysis"))
        self.label_6.setText(_translate("DialogOptionsAnalysis", "Using Second Sweep"))
        self.comboBoxSecondSweep.setCurrentText(_translate("DialogOptionsAnalysis", "False"))
        self.comboBoxSecondSweep.setItemText(0, _translate("DialogOptionsAnalysis", "False"))
        self.comboBoxSecondSweep.setItemText(1, _translate("DialogOptionsAnalysis", "True"))



#-------------------------------------------------------------------------------
# class option:  option simulation.
#-------------------------------------------------------------------------------

class optionAnalysis:
    def __init__(self,result):
        self.w = QtWidgets.QDialog()

        self.r=result
        self.reset=False;
        self.path='';
        self.pathLib='';

        self.ui = ui_optionsAnalysis()
        self.ui.setupUi(self.w)

        self.ui.comboBoxSecondSweep.setCurrentText(self.r[0]);
        self.ui.comboBoxSecondSweep.currentTextChanged.connect(self.secondSweep)



    def secondSweep(self,value):
        self.r[0]=self.ui.comboBoxSecondSweep.currentText();


    def show(self):
        self.w.show()



#-------------------------------------------------------------------------------
# class Ui_DialogListSignalsParamaters: intrface of dialog List of Signals
#                                         & Paramaters.
#-------------------------------------------------------------------------------

class Ui_DialogListSignalsParamaters(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(449, 510)
        self.verticalLayout_2 = QtWidgets.QVBoxLayout(Dialog)
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        self.verticalLayout = QtWidgets.QVBoxLayout()
        self.verticalLayout.setObjectName("verticalLayout")
        self.treeView = QtWidgets.QTreeView(Dialog)
        self.treeView.setObjectName("treeView")
        self.verticalLayout.addWidget(self.treeView)
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

def getImage(value):
    if value['type']=='paramater':
        return ":image/paramsignals/param.png"
    elif (value['type']=='signal')and (value['description']=='voltage')and (value['dir']=='out'):
         return ":image/paramsignals/vout.png"
    elif (value['type']=='signal')and (value['description']=='voltage')and (value['dir']=='in'):
         return ":image/paramsignals/vin.png"
    elif (value['type']=='signal')and (value['dir']=='out'):
         return ":image/paramsignals/iout.png"
    elif (value['type']=='signal')and (value['dir']=='in'):
         return ":image/paramsignals/iin.png"
    elif (value['type']=='wire'):
         return ":image/paramsignals/node.png"

#-------------------------------------------------------------------------------
# class dialogListSignalsParamaters:  dialog List of Signals
#                                         & Paramaters.
#-------------------------------------------------------------------------------
class dialogListSignalsParamaters:
    def __init__(self,data):
        self.w = QtWidgets.QDialog()

        self.path='';
        self.pathLib='';

        self.ui = Ui_DialogListSignalsParamaters()
        self.ui.setupUi(self.w)
        self.model = QtGui.QStandardItemModel()
        self.model.setHorizontalHeaderLabels(['Name'])#, 'Type', 'Description'
      #  self.model.resizeSection(0, 42);
        self.ui.treeView.setModel(self.model)
        self.ui.treeView.header().resizeSection(0, 150);#setStyleSheet("QTreeView::item { width: 100px }")
        self.ui.treeView.setEditTriggers(QtWidgets.QAbstractItemView.NoEditTriggers)
        self.ui.treeView.clicked.connect(self.treeClicked)
        self.importData(data)
        self.ui.treeView.expandAll()
        self.pos='None'
        self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);

    def treeClicked(self, index):
        row=index.row()
        column=index.column()
        data=index.data()
        if len(data.split('.'))>1:
           self.pos=data
           self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(True);
        else:
           self.ui.buttonBox.button(QtWidgets.QDialogButtonBox.Ok).setEnabled(False);

    def importData(self, data, root=None):
        self.model.setRowCount(0)
        if root is None:
            root = self.model.invisibleRootItem()
        seen = {}   # List of  QStandardItem
        values = deque(data)
        while values:
            value = values.popleft()
            if value['unique_id'] == 1:
                parent = root
            else:
                pid = value['parent_id']
                if pid not in seen:
                    values.append(value)
                    continue
                parent = seen[pid]
            unique_id = value['unique_id']
            parent.appendRow([
                QtGui.QStandardItem(QtGui.QIcon(getImage(value)),value['short_name'])
               # QStandardItem(value['type']),
               # QStandardItem(value['description'])
            ])
            seen[unique_id] = parent.child(parent.rowCount() - 1)
            #seen[unique_id].QStandardItem(QIcon("4.bmp"))

    def show(self):
        self.w.show()


from PyQt5.QtCore import QUrl
from PyQt5.QtWidgets import QMainWindow, QApplication
from PyQt5.QtWebEngineWidgets import QWebEngineView


#-------------------------------------------------------------------------------
# Open Page web
#-------------------------------------------------------------------------------

from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView

class openWebPage(QMainWindow):
    def __init__(self, *args, **kwargs):
        super(openWebPage, self).__init__(*args, **kwargs)
        self.browser = QWebEngineView()
    def exec(self,var):
        self.browser.setUrl(QUrl(var))
        self.setCentralWidget(self.browser)
        self.show()


class openWebPageDialog:
    def __init__(self,url,title):
        self.w = QtWidgets.QDialog()
        self.w.resize(950, 847)
        icon = QtGui.QIcon()
        icon.addPixmap(QtGui.QPixmap(":/image/logo.png"), QtGui.QIcon.Normal, QtGui.QIcon.Off)
        self.w.setWindowIcon(icon)
        self.w.setWindowTitle(title)
        self.browser = QWebEngineView(self.w)
        self.browser.setUrl(QUrl(url))
        self.layout = QtWidgets.QVBoxLayout()
        self.layout.addWidget(self.browser)
        #self.layout.addWidget(self.buttonBox)
        self.w.setLayout(self.layout)




#-------------------------------------------------------------------------------
# __main__: test Dialog
#-------------------------------------------------------------------------------
if __name__ == "__main__":
     import sys
     app = QApplication(sys.argv)
     window = openWebPage()
     var="https://dspice.sf.net";
     window.exec(var)

     app.exec_()
