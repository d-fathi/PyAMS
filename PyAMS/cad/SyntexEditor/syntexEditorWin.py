#-------------------------------------------------------------------------------
# Name:        Syntex Editor
# Author:      d.fathi
# Created:     23/07/2024
# Update:      30/07/2024
# Copyright:   (c) DSpice 2024
# Web:         https://dspice.sf.net/
# Version:     1.0.0
# Licence:     free  "GPLv3"
# info:        Syntex Editor
#-------------------------------------------------------------------------------

from PyQt5.QtWidgets import QApplication,QMainWindow
from syntexEditor import Ui_MainWindow
from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
import syntax_pars


#-------------------------------------------------------------------------------
# class Mainwindow: intrface of syntex editor
#-------------------------------------------------------------------------------
class editor:
    def __init__(self):
        self.w = QMainWindow()
        self.path='';
        self.typeAction='Non';
        self.ui = Ui_MainWindow();
        self.ui.setupUi(self.w);
        self.filetype="Python file (*.py)";
        self.fileName='NewFile';
        self.itModified=False;
        self.title='Editor'

        self.ui.actionNew.triggered.connect(self.fileNew);
        self.ui.actionOpen.triggered.connect(self.fileOpen);
        self.ui.actionSave.triggered.connect(self.fileSave);
        self.ui.actionSaveAs.triggered.connect(self.fileSaveAs);

        self.editor=self.ui.plainTextEdit;

        self.editor.setStyleSheet("""QPlainTextEdit{
                                 font-family:'Consolas';
                                 color: #ccc;
                                 font-size: 15px;
                                 background-color: #2b2b2b;}""")

        self.highlight = syntax_pars.PythonHighlighter(self.editor.document())

        self.editor.mouseReleaseEvent=self.mousePressEvent;
        self.w.closeEvent=self.closeEvent;

        self.editor.document().modificationChanged.connect(self.itChanged)
        self.ui.actionUndo.triggered.connect(self.editor.undo);
        self.ui.actionRedo.triggered.connect(self.editor.redo);
        self.editor.textChanged.connect(self.textChanged)
        self.ui.actionSave.setEnabled(self.editor.document().isModified())
        self.editor.document().undoAvailable.connect(self.ui.actionUndo.setEnabled)
        self.editor.document().redoAvailable.connect(self.ui.actionRedo.setEnabled)
        self.editor.document().modificationChanged.connect(self.ui.actionSave.setEnabled)
        self.ui.actionUndo.setEnabled(self.editor.document().isUndoAvailable())
        self.ui.actionRedo.setEnabled(self.editor.document().isRedoAvailable())
        self.ui.actionCut.setEnabled(False)
        self.ui.actionCopy.setEnabled(False)
        self.ui.actionCut.triggered.connect(self.editor.cut)
        self.ui.actionCopy.triggered.connect(self.editor.copy)
        self.ui.actionPast.triggered.connect(self.editor.paste)
        self.editor.copyAvailable.connect(self.ui.actionCut.setEnabled)
        self.editor.copyAvailable.connect(self.ui.actionCopy.setEnabled)
        QApplication.clipboard().dataChanged.connect(self.clipboardDataChanged)
        self.caption();
        self.characterPos = QLabel("Ln: 0   Col: 0")
        self.ui.statusbar.addPermanentWidget(self.characterPos)

    def closeEvent(self, e):
        if self.maybeSave():
            e.accept()
        else:
            e.ignore()

    def mousePressEvent(self,event):
        self.textChanged()

    def textChanged(self):
        cursor = self.editor.textCursor();
        y = cursor.blockNumber() + 1;
        x = cursor.columnNumber() + 1;
        self.characterPos.setText(f'Ln: {y}   Col: {x}  Length: {len(self.editor.toPlainText())}')
        self.caption();

    def caption(self):

        if self.editor.document().isModified() :
            f=self.fileName+'*';
        else:
            f=self.fileName;
        self.w.setWindowTitle(self.title+"  ["+f+"]");


    def itChanged(self,s):
        self.itModified=s;
        self.caption()

    def clipboardDataChanged(self):
        self.ui.actionPast.setEnabled(len(QApplication.clipboard().text()) != 0)

    def setCurrentFileName(self, fileName='NewFile'):
        self.fileName = fileName
        self.editor.document().setModified(False)
        self.caption()


    def load(self, file):
        if not QFile.exists(file):
            return False

        infile = open(file, 'r', encoding="utf-8")
        self.editor.setPlainText(infile.read())

        self.setCurrentFileName(file)
        return True


    def maybeSave(self):
        if not self.editor.document().isModified():
            return True

        ret = QMessageBox.warning(self.w, "Application",
                "The document has been modified.\n"
                "Do you want to save your changes?",
                QMessageBox.Save | QMessageBox.Discard | QMessageBox.Cancel)

        if ret == QMessageBox.Save:
            return self.fileSave()

        if ret == QMessageBox.Cancel:
            return False

        return True

    def fileNew(self):
        if self.maybeSave():
            self.editor.clear()
            self.setCurrentFileName()

    def fileOpen(self):
        if self.maybeSave():
           fn, _ = QFileDialog.getOpenFileName(None, "Open File...", None, self.filetype)
           if fn:
              self.load(fn)

    def fileSave(self):
        if self.fileName=='NewFile':
             return self.fileSaveAs()

        writer= QTextDocumentWriter(self.fileName)
        try:
          text = self.editor.toPlainText()
          with open(self.fileName, 'w',encoding='utf-8') as f:
            f.write(text)
          self.editor.document().setModified(False)
          success=True;
        except:
          success=False;

        self.caption()
        return success

    def fileSaveAs(self):
        fn, _ = QFileDialog.getSaveFileName(None, "Save as...", None,self.filetype)

        if not fn:
            return False

        self.setCurrentFileName(fn)
        return self.fileSave()



    def show(self):
        self.w.show()



 #-------------------------------------------------------------------------------
# __main__: start Syntex Editor software
#-------------------------------------------------------------------------------

if __name__ == "__main__":
        import sys
        app=QApplication(sys.argv);
        w=editor();
        w.show();
        w.path=sys.path[0]
        sys.exit(app.exec_());
