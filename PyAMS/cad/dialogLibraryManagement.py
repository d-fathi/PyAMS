#-------------------------------------------------------------------------------
# Name:        Library management (to organize symbols)
# Author:      d.fathi
# Created:     20/06/2021
# Update:      25/05/2024
# Copyright:   (c) dspice 2024
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from PyQt5 import QtCore, QtGui, QtWidgets
from collections import deque
import os


#-------------------------------------------------------------------------------
# class Ui_DialogOrganLibrary: interface of management type ui
#-------------------------------------------------------------------------------
class Ui_DialogOrganLibrary(object):
    def setupUi(self, DialogOrganLibrary):
        DialogOrganLibrary.setObjectName("DialogOrganLibrary")
        DialogOrganLibrary.resize(662, 375)
        self.gridLayout = QtWidgets.QGridLayout(DialogOrganLibrary)
        self.gridLayout.setObjectName("gridLayout")
        self.horizontalLayout = QtWidgets.QHBoxLayout()
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.verticalLayout_4 = QtWidgets.QVBoxLayout()
        self.verticalLayout_4.setObjectName("verticalLayout_4")
        self.label_2 = QtWidgets.QLabel(DialogOrganLibrary)
        self.label_2.setObjectName("label_2")
        self.verticalLayout_4.addWidget(self.label_2)
        self.listWidgetLibrary = QtWidgets.QListWidget(DialogOrganLibrary)
        self.listWidgetLibrary.setObjectName("listWidgetLibrary")
        self.verticalLayout_4.addWidget(self.listWidgetLibrary)
        self.horizontalLayout.addLayout(self.verticalLayout_4)
        self.verticalLayout_2 = QtWidgets.QVBoxLayout()
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        spacerItem = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.verticalLayout_2.addItem(spacerItem)
        self.pButtonUpDir = QtWidgets.QPushButton(DialogOrganLibrary)
        self.pButtonUpDir.setObjectName("pButtonUpDir")
        self.verticalLayout_2.addWidget(self.pButtonUpDir)
        self.pButtonDownDir = QtWidgets.QPushButton(DialogOrganLibrary)
        self.pButtonDownDir.setObjectName("pButtonDownDir")
        self.verticalLayout_2.addWidget(self.pButtonDownDir)
        spacerItem1 = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.verticalLayout_2.addItem(spacerItem1)
        self.horizontalLayout.addLayout(self.verticalLayout_2)
        spacerItem2 = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout.addItem(spacerItem2)
        self.verticalLayout_5 = QtWidgets.QVBoxLayout()
        self.verticalLayout_5.setObjectName("verticalLayout_5")
        self.label_3 = QtWidgets.QLabel(DialogOrganLibrary)
        self.label_3.setObjectName("label_3")
        self.verticalLayout_5.addWidget(self.label_3)
        self.listWidgetSym = QtWidgets.QListWidget(DialogOrganLibrary)
        self.listWidgetSym.setObjectName("listWidgetSym")
        self.verticalLayout_5.addWidget(self.listWidgetSym)
        self.horizontalLayout.addLayout(self.verticalLayout_5)
        self.verticalLayout_6 = QtWidgets.QVBoxLayout()
        self.verticalLayout_6.setObjectName("verticalLayout_6")
        spacerItem3 = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.verticalLayout_6.addItem(spacerItem3)
        self.pButtonUpSym = QtWidgets.QPushButton(DialogOrganLibrary)
        self.pButtonUpSym.setObjectName("pButtonUpSym")
        self.verticalLayout_6.addWidget(self.pButtonUpSym)
        self.pButtonDownSym = QtWidgets.QPushButton(DialogOrganLibrary)
        self.pButtonDownSym.setObjectName("pButtonDownSym")
        self.verticalLayout_6.addWidget(self.pButtonDownSym)
        spacerItem4 = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.verticalLayout_6.addItem(spacerItem4)
        self.horizontalLayout.addLayout(self.verticalLayout_6)
        self.gridLayout.addLayout(self.horizontalLayout, 0, 0, 1, 1)
        self.buttonBox = QtWidgets.QDialogButtonBox(DialogOrganLibrary)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.gridLayout.addWidget(self.buttonBox, 1, 0, 1, 1)

        self.retranslateUi(DialogOrganLibrary)
        self.buttonBox.accepted.connect(DialogOrganLibrary.accept) # type: ignore
        self.buttonBox.rejected.connect(DialogOrganLibrary.reject) # type: ignore
        QtCore.QMetaObject.connectSlotsByName(DialogOrganLibrary)

    def retranslateUi(self, DialogOrganLibrary):
        _translate = QtCore.QCoreApplication.translate
        DialogOrganLibrary.setWindowTitle(_translate("DialogOrganLibrary", "Organizing and modifying the library"))
        self.label_2.setText(_translate("DialogOrganLibrary", "Library"))
        self.pButtonUpDir.setText(_translate("DialogOrganLibrary", "Up"))
        self.pButtonDownDir.setText(_translate("DialogOrganLibrary", "Down"))
        self.label_3.setText(_translate("DialogOrganLibrary", "Symbols"))
        self.pButtonUpSym.setText(_translate("DialogOrganLibrary", "Up"))
        self.pButtonDownSym.setText(_translate("DialogOrganLibrary", "Down"))



#-------------------------------------------------------------------------------
# Get symbols from a library directory
#-------------------------------------------------------------------------------
def getSymbolsFromLib(path, symDir, items):
    """
    Reads .sym files from a given library folder and returns their content.

    Parameters:
    -----------
    path : str
        The base path where library folders are located.
    symDir : str
        The name of the library subdirectory.
    items : list of str
        List of .sym filenames to read from the directory.

    Returns:
    --------
    list of dict
        A list of dictionaries, each with:
        - 'sym': content of the .sym file (as string)
        - 'name': the file name without extension
        If the directory doesn't exist, returns an empty list.
    """

    full_path = os.path.join(path,'models', symDir)
    if os.path.exists(full_path):
        symbols = []
        for item in items:
            file_path = os.path.join(full_path, item)
            if os.path.isfile(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    name = os.path.splitext(item)[0]
                    symbols.append({'sym': f.read(), 'name': name})
        return symbols
    else:
        return []

def getSymbolsFromProject(symDir):
    import glob
    os.chdir(symDir)
    items=[]
    for file in glob.glob("*.sym"):
        items.append(file)
    exists = os.path.exists(symDir)
    if(exists):
      s=[]
      for i in range(len(items)):
         f = open(symDir+'/'+items[i], "r", encoding="utf-8")
         d=items[i].split('.')
         s+=[{'sym':f.read(),'name':d[0]}]
         f.close()
      return s;
    else:
        return []



#-------------------------------------------------------------------------------
# get list of files
#-------------------------------------------------------------------------------
def getFiles(symDir):
    s=[]
    try:
        import glob
        os.chdir(symDir)
        items=[]
        for file in glob.glob("*.sym"):
            items.append(file)
        for i in range(len(items)):
          f = open(symDir+'/'+items[i], "r")
          s+=[f.read()]
          f.close()
        return s;
    except:
        return s;

#-------------------------------------------------------------------------------
# get names of files type '.sym'
#-------------------------------------------------------------------------------

def getNameFilesSym(symDir):
    items=[]
    try:
        import glob
        os.chdir(symDir)
        items=[]
        for file in glob.glob("*.sym"):
            items.append(file)
        return  items;
    except:
        return  items;


#-------------------------------------------------------------------------------
# save and open librarary file
#-------------------------------------------------------------------------------

import os
import json


def updateLib(setDir):
    """
    Updates the data.json file inside the 'models' directory by:
    - Preserving original folder and file order.
    - Removing folders/files that no longer exist.
    - Adding new folders and new .sym files found in the file system.

    Parameters:
    -----------
    setDir : str
        Base directory path containing the 'models' folder.

    Returns:
    --------
    dict
        Updated content of data.json with synchronized .sym files and folders.
    """

    base_path = "models"
    data_json_path = os.path.join(setDir, base_path, "data.json")
    full_base_path = os.path.join(setDir, base_path)

    # Load original data.json
    with open(data_json_path, 'r') as f:
        original_data = json.load(f)

    original_libs = original_data.get("libs", [])
    updated_data = {}
    updated_libs = []

    # Step 1: Process existing libs and files
    for lib in original_libs:
        lib_path = os.path.join(full_base_path, lib)
        if os.path.isdir(lib_path):
            files_on_disk = set(
                f for f in os.listdir(lib_path) if f.endswith('.sym') and os.path.isfile(os.path.join(lib_path, f))
            )
            original_files = original_data.get(lib, [])
            cleaned_files = [f for f in original_files if f in files_on_disk]

            # Add new files in alphabetical order (not already in original)
            new_files = sorted(files_on_disk - set(original_files))
            final_files = cleaned_files + new_files

            if final_files:
                updated_data[lib] = final_files
                updated_libs.append(lib)

    # Step 2: Discover new folders and files
    for root, dirs, files in os.walk(full_base_path):
        if root == full_base_path:
            continue  # Skip root itself

        relative_path = os.path.relpath(root, full_base_path)
        if relative_path not in updated_data:
            sym_files = sorted(f for f in files if f.endswith('.sym'))
            if sym_files:
                updated_data[relative_path] = sym_files
                updated_libs.append(relative_path)

    # Step 3: Update the 'libs' key
    updated_data["libs"] = updated_libs

    # Save updated data to file
    with open(data_json_path, 'w') as f:
        json.dump(updated_data, f, indent=4)

    return updated_data



def saveLib(setDir,data):
    base_path = "models"
    data_json_path = os.path.join(setDir, base_path, "data.json")
    # Write back updated data
    with open(data_json_path, 'w') as f:
        json.dump(data, f, indent=4)





#-------------------------------------------------------------------------------
#  interface of management type dialog
#-------------------------------------------------------------------------------

class libraryManagement:
    def __init__(self):
        self.w = QtWidgets.QDialog()
        self.ui = Ui_DialogOrganLibrary()
        self.ui.setupUi(self.w)
        self.setButtonConnections()
        self.updateButtonStatus()
        self.libs=[]

    def getDirctory(self,pos):
        self.posDir=pos;
        self.libs=updateLib(pos)
        print(self.libs)
        self.listDirSym=self.libs['libs']

        for i in range(len(self.listDirSym)):
           self.ui.listWidgetLibrary.addItem(self.listDirSym[i])

    def setButtonConnections(self):
        self.ui.listWidgetLibrary.itemSelectionChanged.connect(self.updateButtonStatus)
        self.ui.listWidgetSym.itemSelectionChanged.connect(self.updateButtonSymStatus)
        self.ui.pButtonUpDir.clicked.connect(self.buttonUpClicked)
        self.ui.pButtonDownDir.clicked.connect(self.buttonDownClicked)
        self.ui.pButtonUpSym.clicked.connect(self.buttonUpSymClicked)
        self.ui.pButtonDownSym.clicked.connect(self.buttonDownSymClicked)


    def buttonAddClicked(self):
        folderpath = str(QtWidgets.QFileDialog.getExistingDirectory(None, 'Select Folder'))
        if folderpath:
            r=folderpath.replace(self.posDir,"");
            std=len(r)!=len(folderpath)
            used=True;
            a=os.path.split(folderpath);
            for i in range(len(self.libs)):
                if (a[1]==self.libs[i]['name']) and (r==self.libs[i]['destination']) :
                    used=False;

            if(a[1]==''):
                used=False;

            if used:
               self.libs+=[{'name':a[1], 'std':std, 'destination':r}]
               self.ui.listWidgetLibrary.addItem(a[1])


    def buttonRemoveClicked(self):
        row = self.ui.listWidgetLibrary.currentRow()
        rowItem = self.ui.listWidgetLibrary.takeItem(row)
        del self.libs[row]

    def buttonUpClicked(self):
        rowIndex = self.ui.listWidgetLibrary.currentRow()
        currentItem = self.ui.listWidgetLibrary.takeItem(rowIndex)
        a=self.listDirSym[rowIndex]
        self.listDirSym[rowIndex]=self.listDirSym[rowIndex-1]
        self.listDirSym[rowIndex-1]=a
        self.ui.listWidgetLibrary.insertItem(rowIndex - 1, currentItem)
        self.ui.listWidgetLibrary.setCurrentRow(rowIndex - 1)




    def buttonDownClicked(self):
        rowIndex = self.ui.listWidgetLibrary.currentRow()
        currentItem = self.ui.listWidgetLibrary.takeItem(rowIndex)
        a=self.listDirSym[rowIndex]
        self.listDirSym[rowIndex]=self.listDirSym[rowIndex+1]
        self.listDirSym[rowIndex+1]=a

        self.ui.listWidgetLibrary.insertItem(rowIndex + 1, currentItem)
        self.ui.listWidgetLibrary.setCurrentRow(rowIndex + 1)







    def buttonUpSymClicked(self):
        rowIndex = self.ui.listWidgetSym.currentRow()
        currentItem = self.ui.listWidgetSym.takeItem(rowIndex)
        self.ui.listWidgetSym.insertItem(rowIndex - 1, currentItem)
        self.ui.listWidgetSym.setCurrentRow(rowIndex - 1)
        self.libs[self.nameDirSym]=[str(self.ui.listWidgetSym.item(i).text()) for i in range(self.ui.listWidgetSym.count())]




    def buttonDownSymClicked(self):
        rowIndex = self.ui.listWidgetSym.currentRow()
        currentItem = self.ui.listWidgetSym.takeItem(rowIndex)
        self.ui.listWidgetSym.insertItem(rowIndex + 1, currentItem)
        self.ui.listWidgetSym.setCurrentRow(rowIndex + 1)
        self.libs[self.nameDirSym]=[str(self.ui.listWidgetSym.item(i).text()) for i in range(self.ui.listWidgetSym.count())]


    def saveLib(self):
      saveLib(self.posDir,self.libs);

    def updateButtonStatus(self):
        if bool(self.ui.listWidgetLibrary.selectedItems()):
           index=self.ui.listWidgetLibrary.currentRow()
           self.getFiles(index)
        self.ui.pButtonUpDir.setDisabled(not bool(self.ui.listWidgetLibrary.selectedItems()) or self.ui.listWidgetLibrary.currentRow() == 0)
        self.ui.pButtonDownDir.setDisabled(not bool(self.ui.listWidgetLibrary.selectedItems()) or self.ui.listWidgetLibrary.currentRow() == self.ui.listWidgetLibrary.count() - 1)


    def updateButtonSymStatus(self):
        self.ui.pButtonUpSym.setDisabled(not bool(self.ui.listWidgetSym.selectedItems()) or self.ui.listWidgetSym.currentRow() == 0)
        self.ui.pButtonDownSym.setDisabled(not bool(self.ui.listWidgetSym.selectedItems()) or self.ui.listWidgetSym.currentRow() == self.ui.listWidgetSym.count() - 1)


    def getFiles(self,index):
        import glob, os
        self.nameDirSym=self.listDirSym[index]
        d=self.libs[self.nameDirSym];
        self.ui.listWidgetSym.clear();
        for i in range(len(d)):
            self.ui.listWidgetSym.addItem(d[i])


    def show(self):
        self.w.show()




#-------------------------------------------------------------------------------
# __main__: test Dialog
#-------------------------------------------------------------------------------
if __name__ == "__main__":
     import sys
     app = QtWidgets.QApplication(sys.argv)
     window = libraryManagement()
     window.getDirctory('..\\')
     window.show()
     app.exec_()
