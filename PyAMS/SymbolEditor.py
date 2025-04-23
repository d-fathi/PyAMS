
#------------------------------------------------------------------------------------------
# Name:        Symbol Editor
# Author:      d.fathi
# Created:     19/08/2021
# Update:      12/04/2025
# Copyright:   (c) PyAMS 2025
# Web:         https://pyams.sf.net/
# Version:     0.1.3 (beta)
# Licence:     free  "GPLv3"
# info:        Symbol Editor: Create and edit custom analog symbols used in circuit design
#-----------------------------------------------------------------------------------------



import cad.appcir

from PyQt5.QtWidgets import QApplication,QMainWindow
from cad.mainwindow import Ui_MainWindow
from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from PyQt5.QtWebChannel import QWebChannel
from cad.dialogs import *
from cad.dialogLibraryManagement  import updateLib,getSymbolsFromLib,getSymbolsFromProject,libraryManagement
from cad.appcir import modifiedParams,getListSignalsNodeParams,analysis
from cad.description import modifyingDescription
from cad.PythonEditor import showCode,showPyCode,showCodeBySymEd,showCodeHtml
from cad.graphDescription import showGraph
from cad.synedit import openmodel,openmodelBySymEd,openHtml
import json



#-------------------------------------------------------------------------------
# class Document: Used to connect to a index.html document
#-------------------------------------------------------------------------------
class Document(QObject):

    def __init__(self,setWin):
        super(Document, self).__init__()
        self.setWin=setWin;
        self.typeSym=True
        self.library=[]

    @pyqtSlot(list)
    def getRef(self, o):
        d=o[0]
        self.setWin.updatWin(d);

    @pyqtSlot(result=bool)
    def newPage(self):
        return self.typeSym

    @pyqtSlot(list,result=list)
    def return_list(self,l):
        return appcir.interAnalysis(l,self.setWin);

    @pyqtSlot(list)
    def description(self,val):
        self.setWin.description(val);


    @pyqtSlot(bool)
    def itRun(self,bool_arg):
        self.setWin.ui.actionRun.setEnabled(not(bool_arg));
        self.setWin.ui.actionPause.setEnabled(bool_arg);

    @pyqtSlot(str)
    def newStyle(self,str_arg):
        self.setWin.style(str_arg);


    @pyqtSlot(str)
    def jsexec(self, excute):
        print('*****')
        print(excute);


    @pyqtSlot(str,str)
    def getParams(self,code,modelName):
        modifiedParams(self.setWin,code,modelName)

    @pyqtSlot(str, str,int)
    def listSignalsParams(self,code,modelName,type_):
        getListSignalsNodeParams(self.setWin,code,modelName,type_)

    @pyqtSlot(str,str)
    def getCode(self,modelName,directory):
        openmodel(self.setWin,modelName,directory)

    @pyqtSlot()
    def getCodeBySymEd(self):
        openmodelBySymEd(self.setWin)

    @pyqtSlot(str)
    def getHtmlCode(self,data):
        openHtml(self.setWin,data)


    @pyqtSlot(str)
    def getPyCode(self,file):
        showPyCode(self,file);

    @pyqtSlot(str,int)
    def openFile(self,file,type_):
        if(type_==1):
          showPyCode(self,file);
          return;
        file=os.path.dirname(self.setWin.filename)+'/lib/'+file;
        self.setWin.openSymbol(file);


    @pyqtSlot(str,bool, result=str)
    def jscallme(self, str_args,typePyAMS):
        print('call received')
        print('resolving......init home..')
        self.setWin.typePyAMS=typePyAMS;
        print(str_args);
        print("type PyAMS="+str(typePyAMS))
        if self.setWin.usedSymbolFormIDEPyAMS:
             self.setWin.openSymbolFromSchema();
        return "ok"



    @pyqtSlot(str, str, result=str)
    def getProbeValue(self, str_args,listType):
        self.setWin.updatePosProbe(listType);

    @pyqtSlot()
    def getImage(self):
        self.setWin.getImage();

    @pyqtSlot(result=list)
    def importLibs(self):
        self.setWin.libs=updateLib(self.setWin.path);
        self.setWin.importFilesProject();
        return  self.setWin.libs['libs'];

    @pyqtSlot(bool)
    def itProject(self,typeProject):
        self.setWin.ui.actionItProject.setChecked(typeProject);
        self.setWin.showItProject();

    @pyqtSlot(result=bool)
    def importFileProject(self):
        self.setWin.importFilesProject();
        return  True;


    @pyqtSlot(int,result=list)
    def importSymbols(self,pos):
        self.library=self.setWin.libs['libs']
        a=self.library;
        if((pos==len(a)) and (self.setWin.itProject)):
            r=self.setWin.filename
            self.path=os.path.dirname(r)+'/lib/';
            return getSymbolsFromProject(self.path);

        if(pos>=len(a)):
            return[]

        symDir=a[pos];
        items=self.setWin.libs[symDir]
        print(pos)
        print(items)
        d=getSymbolsFromLib(self.setWin.path,symDir,items)
        return  d

    @pyqtSlot(str,str,result=list)
    def importModels(self,modelName,directory):
        return  listOfModels(self,modelName,directory)

    @pyqtSlot(str)
    def opAnalysis(self,code):
        analysis(self.setWin,code,True)


    @pyqtSlot(result=list)
    def importPythonFiles(self):
        import os;
        r=self.setWin.filename
        self.path=os.path.dirname(r)+'/lib/';
        import glob
        files=[os.path.basename(x) for x in glob.glob(self.path+'*.py')]
        return ['None']+files

    @pyqtSlot(list)
    def partInfo(self,info):
        self.setWin.partInfo=info



#-------------------------------------------------------------------------------
# class Frame: create a frame in the status bar
#-------------------------------------------------------------------------------
class VLine(QFrame):
    def __init__(self):
        super(VLine, self).__init__()
        self.setFrameShape(self.VLine|self.Sunken)

#-------------------------------------------------------------------------------
# class Mainwindow: intrface of symbol editor
#-------------------------------------------------------------------------------
class Mainwindow:
    def __init__(self):
        self.w = QMainWindow()
        self.setIcon=QIcon(":/image/logo.png");
        self.pagetype='sym';
        self.path='';
        self.pathLib='';
        self.partInfo=['','']

        self.ui = Ui_MainWindow()
        self.ui.setupUi(self.w)
        self.filetype="symbol file (*.sym)";
        self.filenew='NewFile.sym';
        self.filename='NewFile.sym';
        self.title='Symbol Editor';
        self.modified=False;
        self.typeAction='none';
        self.itProject=False;
        self.svgDir='';

        self.usedSymbolFormIDEPyAMS=False;
        self.symbolFormIDEPyAMS='';

        self.ui.m_webview.page().setUrl(QUrl("qrc:/index.html"));
        self.ui.statusbar.showMessage('Message in statusbar.');
        self.updateStatubar();
        self.my_document= Document(self);
        self.channel = QWebChannel();
        self.channel.registerObject('document', self.my_document)
        self.ui.m_webview.page().setWebChannel(self.channel);

        self.ui.actionOpen.triggered.connect(self.open);
        self.ui.actionSave.triggered.connect(self.save);
        self.ui.actionSave_as.triggered.connect(self.saveAs);
        self.ui.actionNew.triggered.connect(self.new);
        self.ui.actionPolarityz.triggered.connect(self.showPolarity);
        self.ui.actionItProject.triggered.connect(self.showItProject);
        self.ui.actionShow_grid.triggered.connect(self.showGrid);
        self.ui.actionDescription.triggered.connect(self.description);
        self.ui.actionText.setVisible(True);

        #actionHelp
        self.ui.actionWeb_page.triggered.connect(self.webPage);
        self.ui.actionHelp.triggered.connect(self.help);
        self.ui.actionElementsLibrary.triggered.connect(self.ElementsLibrary);
        self.ui.menuTools.menuAction().setVisible(True);
        self.ui.ToolsToolBar.setVisible(False);
        self.ui.menuRun.menuAction().setVisible(False);
        self.ui.RunToolBar.setVisible(False);
        self.ui.actionFlipHorizontal.setVisible(False);
        self.ui.actionFlipVertically.setVisible(False);
        self.ui.actionRotate.setVisible(False);
        self.ui.actionItProject.setVisible(False);
        self.ui.actionPolarityz.setVisible(False);



        self.ui.actionZoom_In.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioZoomIn();"));
        self.ui.actionZoom_Out.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioZoomOut();"));
        self.ui.actionUndo.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioUndo();"));
        self.ui.actionRedo.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioRedo();"));
        self.ui.actionCopy.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioCopy();"));
        self.ui.actionCut.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioCut();"));
        self.ui.actionPaste.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioPast();"));
        self.ui.actionPin.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('pin');"));
        self.ui.actionParam.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('codeSpice');"));
        self.ui.actionRect.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('rect');"));
        self.ui.actionEllipse.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('ellipse');"));
        self.ui.actionPolyline.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('polyline');"));
        self.ui.actionWire.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('net');"));
        self.ui.actionText.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('text');"));
        self.ui.actionImage.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('image');"));
        self.ui.actionOscilloscope.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('oscilloscope');"));
        self.ui.actionPolygon.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('polygon');"));
        self.ui.actionArc.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('arc');"));
        self.ui.actionIOParm.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('ioparam');"));

        self.ui.actionLabel.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('label');"));
        self.ui.actionParamater.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('param');"));
        self.ui.actionReference_2.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('ref');"));

        self.ui.actionLabel2.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addLabToPart();"));
        self.ui.actionParamater2.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addParamToPart();"));
        self.ui.actionReference2.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addRefToPart();"));

        self.ui.actionGnd.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addGnd();"));
        self.ui.actionProbe.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('probe');"));
        self.ui.actionEnd.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioEndDrawing();"));
        self.ui.actionSVGExport.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("savePageToSVG(1.5)",self.exportSVG));
        self.ui.actionFlipHorizontal.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioTypeRotation('flipHorizontal');"));
        self.ui.actionFlipVertically.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioTypeRotation('flipVertical');"));
        self.ui.actionRotate.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("ioTypeRotation('rotate');"));
        self.ui.actionBefore.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("before_();"));
        self.ui.actionAfter.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("after_();"));
        self.ui.actionAppend.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("appEnd_();"));
        self.ui.actionFirst.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("first_();"));
        self.ui.actionPythonCode.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('codePy');"));
        self.ui.actionHtml.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('codeHTML');"));
        self.ui.actionAnalysis.triggered.connect(lambda: self.ui.m_webview.page().runJavaScript("addShape('analysis');"));
        self.ui.actionShowGraph.triggered.connect(lambda: self.showGraph());
        self.ui.m_webview.setContextMenuPolicy(Qt.CustomContextMenu);
        self.ui.m_webview.customContextMenuRequested.connect(self.openMenu);
        self.ui.actionLibraryManagement.triggered.connect(self.getlibraryManagement);
        self.ui.actionAbout.triggered.connect(self.about);
        self.w.closeEvent=self.closeEvent;
        self.ui.actionAboutQt.triggered.connect(QApplication.instance().aboutQt);
        self.ui.menuPart.menuAction().setVisible(False);

        # File history
        if(self.pagetype=='sym'):
          dire =os.path.dirname(__file__)
          self.history_file =dire+"\\cad\\file_history_sym.json"
          self.file_history = self.load_file_history()
          self.update_reopen_menu();

    def openMenu(self,position):
        contextMenu = QMenu();
        contextMenu.addAction(self.ui.actionEnd);
        contextMenu.addSeparator();
        contextMenu.addAction(self.ui.actionCopy);
        contextMenu.addAction(self.ui.actionCut);
        contextMenu.addAction(self.ui.actionPaste);
        action = contextMenu.exec_(self.ui.m_webview.mapToGlobal(position))




    def caption(self):
        self.ui.actionSave.setEnabled(self.modified);
        if self.modified :
            f=self.filename+'*';
        else:
            f=self.filename;
        self.w.setWindowTitle(self.title+"["+f+"]");


    def dialogeListSignalsNodeParamsFromCircuit(self,result):
        appcir.getListSignalsNodeParams(self,result,self.listType);



    def about(self):
        from cad.about import about
        dialog =about();
        dialog.w.exec_();

    def webPage(self):
        dialog=openWebPageDialog("https://pyams.sf.net", 'Web Page');
        dialog.w.exec_()

    def help(self):
        var="https://pyams.sf.net/doc";
        if self.partInfo[0] != '':
             var=self.partInfo[0]

        dialog=openWebPageDialog(var,'Help');
        dialog.w.exec_()

    def ElementsLibrary(self):
        var="https://pyams.sf.net/doc/Elements.html";
        dialog=openWebPageDialog(var,'Elements (Library)');
        dialog.w.exec_()


    def updatePosProbe(self,listType):
        self.listType=listType
        self.ui.m_webview.page().runJavaScript("ioGetProbesWithNetList();", self.dialogeListSignalsNodeParamsFromCircuit);

    def getImage(self):
        # Open the file dialog when the window is initialized
        options = QFileDialog.Options()
        options |= QFileDialog.ReadOnly  # Optional: Make dialog read-only
        file_filter = "Image Files (*.png *.jpg *.jpeg *.bmp *.gif *.svg)"  # Supported image formats
        file_path, _ = QFileDialog.getOpenFileName(
            None,
            "Open Image File",
            "",
            file_filter,
            options=options
        )

        if file_path:
            import base64
            with open(file_path, "rb") as image_file:
                base64_string = base64.b64encode(image_file.read()).decode('utf-8')
                d=file_path.split('.')
                file_extension =d[len(d)-1]
                if(file_extension=='svg'):
                    result='data:image/svg+xml;base64,'+base64_string
                else:
                    result='data:image/'+file_extension+';base64,'+base64_string
                self.ui.m_webview.page().runJavaScript("setImageElem('"+result+"');");


        else:
            print("No file selected")


    def updatWin(self,dic):
        self.lbl1.setText('(X,Y)='+str(dic['x'])+','+str(dic['y']));
        self.lbl2.setText('Zoom='+dic['zoom']);
        self.ui.actionCut.setEnabled(dic['select']);
        self.ui.actionCopy.setEnabled(dic['select']);
        self.ui.actionPaste.setEnabled(dic['past']);
        self.ui.actionUndo.setEnabled(dic['undo']);
        self.ui.actionRedo.setEnabled(dic['redo']);
        self.ui.actionEnd.setChecked(dic['endDrawing']);
        self.ui.actionFlipHorizontal.setEnabled(dic['selectPart']);
        self.ui.actionFlipVertically.setEnabled(dic['selectPart']);
        self.ui.actionRunAnalysis.setEnabled(dic['selectAnalysis']);
        self.ui.actionShowGraph.setEnabled(dic['selectShowAnalysis']);
        self.ui.actionOptionAnalysis.setEnabled(dic['selectShowAnalysis']);
        self.ui.actionRotate.setEnabled(dic['selectPart']);
        self.ui.menuPart.menuAction().setEnabled(dic['selectPart']);
        self.ui.actionPolarityz.setChecked(dic['showPolarity']);
        self.ui.actionItProject.setChecked(dic['itProject']);
        self.modified=dic['modified'];
        self.itProject=dic['itProject'];

        self.ui.statusbar.showMessage(dic['undoPos']);
        self.caption();


    def __save(self, response):
        file = open(self.filename,'w', encoding="utf-8")
        file.write(response)
        file.close();
        self.getTypeAction();

    def getTypeAction(self):
        if self.typeAction=='open':
           self.open();
        elif self.typeAction=='new':
           self.new();
        elif self.typeAction=='ropen':
          self.ropen(self.tempFile);
        self.typeAction='none';


    def shakeSave(self):
        if self.modified:
            ret = QMessageBox.question(None, 'MessageBox', "Save changes ", QMessageBox.Yes | QMessageBox.No | QMessageBox.Cancel, QMessageBox.Cancel)
            if ret == QMessageBox.Yes:
                self.save();
                return False;
            elif ret == QMessageBox.No:
                return True;
            else:
                self.typeAction='none';
                return False;
        return True;

    def show(self):
        self.w.show()


    def showGraph(self):
        showGraph(self)


    def new(self):
        self.typeAction='new';
        if self.shakeSave():
            self.typeAction='none';
            self.filename=self.filenew;
            self.ui.m_webview.page().runJavaScript("ioNewPage('"+self.pagetype+"');");
            self.usedSymbolFormIDEPyAMS=False;
            self.setSymbolFname();

    def setSymbolFname(self):
         if self.pagetype=='sym':
            self.ui.m_webview.page().runJavaScript("ioSymbolFileName('"+os.path.basename(self.filename)+"');");




    def open(self):
        self.typeAction='open';
        if self.shakeSave():
            fname = QFileDialog.getOpenFileName(None, 'Open file',self.pathLib,self.filetype)
            if(fname[0]!=''):
                self.typeAction='none';
                self.filename=fname[0];
                import os;
                self.pathLib=os.path.dirname(self.filename)
                f = open(fname[0], 'r', encoding="utf-8")
                s=f.read()
                t=str([s]);
                self.ui.m_webview.page().runJavaScript("ioSetSymbol("+t+");");
                self.usedSymbolFormIDEPyAMS=False;
                self.setSymbolFname();
                self.add_to_history(self.filename);


    def openFromShow(self,fname):
            if((fname!='') and  os.path.exists(fname)):
                self.typeAction='none';
                self.filename=fname;
                f = open(fname, 'r', encoding="utf-8")
                s=f.read()
                t=str([s]);
                self.ui.m_webview.page().runJavaScript("ioSetSymbol("+t+");");
                self.usedSymbolFormIDEPyAMS=False;
                self.setSymbolFname();

    def saveInShematic(self,result):
        self.IDEPyAMS.ui.m_webview.page().runJavaScript("setSymbolModifed(`"+result+"`);");

    def save(self):
        if self.usedSymbolFormIDEPyAMS:
            self.ui.m_webview.page().runJavaScript("ioGetSymbol();", self.saveInShematic);
        elif  self.filename==self.filenew:
            self.saveAs();
        else:
            self.ui.m_webview.page().runJavaScript("ioGetSymbol();", self.__save);


    def saveAs(self):
        fname = QFileDialog.getSaveFileName(None, 'Save File',self.pathLib,self.filetype)
        if(fname[0]!=''):
            self.filename=fname[0];
            self.ui.m_webview.page().runJavaScript("ioGetSymbol();", self.__save);
        else:
            self.typeAction='none';
        self.setSymbolFname();

    def exportSVG(self, response):
        fname = QFileDialog.getSaveFileName(None, 'Save file to svg form',self.svgDir,"svg file (*.svg)")
        if(fname[0]!=''):
            import os;
            self.svgDir=os.path.dirname(fname[0])
            response=response;
            file=open(fname[0],'w', encoding="utf-8")
            file.write(response)
            file.close()

    def updateStatubar(self):
        self.lbl1 = QLabel("Pos: ")
        self.lbl1.setStyleSheet('border: 0; color:  blue;')
        self.lbl2 = QLabel("zoom: ")
        self.lbl2.setStyleSheet('border: 0; color:  red;')
        self.lbl3 = QLabel("___")
        self.lbl3.setStyleSheet('border: 0; color:  red;')

        self.ui.statusbar.reformat()
        self.ui.statusbar.setStyleSheet('border: 0; background-color: #FFF8DC;')
        self.ui.statusbar.setStyleSheet("QStatusBar::item {border: none;}")
        self.ui.statusbar.addPermanentWidget(VLine())
        self.ui.statusbar.addPermanentWidget(self.lbl3)
        self.ui.statusbar.addPermanentWidget(VLine())
        self.ui.statusbar.addPermanentWidget(self.lbl1)
        self.ui.statusbar.addPermanentWidget(VLine())
        self.ui.statusbar.addPermanentWidget(self.lbl2)



    def copy(self):
        self.r=Mainwindow();
        self.r.show();

    def showPolarity(self):
        if self.ui.actionPolarityz.isChecked():
            self.ui.m_webview.page().runJavaScript("showPolarity(true);");
        else:
            self.ui.m_webview.page().runJavaScript("showPolarity(false);");

    def importFilesProject(self):
        if self.ui.actionItProject.isChecked():
          import os, glob;
          r=self.filename
          path=os.path.dirname(r)+'/python/';
          filesPy=[os.path.basename(x) for x in glob.glob(path+'*.py')]
          path=os.path.dirname(r)+'/lib/';
          filesSy=[os.path.basename(x) for x in glob.glob(path+'*.sym')]
          self.ui.m_webview.page().runJavaScript("drawing.filesPy="+str(filesPy));
          self.ui.m_webview.page().runJavaScript("drawing.filesSy="+str(filesSy));
        else:
          self.ui.m_webview.page().runJavaScript("drawing.filesPy=[]");
          self.ui.m_webview.page().runJavaScript("drawing.filesSy=[]");


    def showItProject(self):

        if(self.filename=='NewFile.dsc'):
            self.ui.m_webview.page().runJavaScript("drawing.optionsimulation.itProject=false; ioUpdatLibs();");
            self.ui.actionItProject.setChecked(False);
            msg = QMessageBox(self.w)
            msg.setIcon(QMessageBox.Warning)
            msg.setText("To create a project you must save the file in a folder")
            msg.setWindowTitle("MessageBox")
            msg.setStandardButtons(QMessageBox.Ok);
            msg.exec_()
            return;

        self.importFilesProject();

        if self.ui.actionItProject.isChecked():
            self.ui.m_webview.page().runJavaScript("drawing.optionsimulation.itProject=true; ioUpdatLibs();");

        else:
            self.ui.m_webview.page().runJavaScript("drawing.optionsimulation.itProject=false; ioUpdatLibs();");



    def showGrid(self):
        if self.ui.actionShow_grid.isChecked():
            self.ui.m_webview.page().runJavaScript("drawing.showGrid(true);");
        else:
            self.ui.m_webview.page().runJavaScript("drawing.showGrid(false);");

    def closeEvent(self, event):
        if self.shakeSave():
            event.accept()
        else:
            event.ignore()


    def openSymbolFromSchema(self):
        self.ui.m_webview.page().runJavaScript("ioSetSymbol(`"+self.symbolFromSchema+"`);");




    def modifiedSymboleFromSchema(self,result,Name):
        self.usedSymbolFormIDEPyAMS=True;
        self.filename='Modifying the imported symbol :  '+Name+'  '
        self.symbolFromSchema=result;


    def description(self,val=[]):
        dialog=modifyingDescription();
        dialog.w.setWindowIcon(QIcon(":/image/logo.png"));

        if self.pagetype!='sym':
            dialog.w.setWindowTitle("Circuit Description");

        if not(val):
            self.ui.m_webview.page().runJavaScript("iogetDescription()",dialog.getDescription);
        else:
            dialog.getDescription(val)

        if dialog.w.exec_():
            self.ui.m_webview.page().runJavaScript("iosetDescription("+str(dialog.setDescription())+");")

    def add_to_history(self, file_path):
        if file_path in self.file_history:
            self.file_history.remove(file_path)
        self.file_history=[file_path]+self.file_history;
        if len(self.file_history)>=9:
            self.file_history.pop()
        self.save_file_history()
        self.update_reopen_menu()


    def getlibraryManagement(self):
        dialog=libraryManagement()
        dialog.w.setWindowTitle("Library Management");
        dialog.w.setWindowIcon(self.setIcon);
        dialog.getDirctory(self.path)
        if dialog.w.exec_():
            dialog.saveLib();
            self.ui.m_webview.page().runJavaScript("updateLibrary()");

    def update_reopen_menu(self):
        self.ui.menuReopen.clear()
        for file_path in self.file_history:
            action = QAction(file_path, self.w)
            action.triggered.connect(lambda checked, path=file_path: self.ropen(path))
            self.ui.menuReopen.addAction(action)

    def load_file_history(self):
        filePos=self.history_file;
        if os.path.exists(filePos):
            try:
                with open(filePos, "r") as file:
                    return json.load(file)
            except Exception:
                return []
        return []

    def save_file_history(self):
        filePos=self.history_file;
        try:
            with open(filePos, "w") as file:
                json.dump(self.file_history, file, indent=4)
        except Exception as e:
           print("cdfdsfdsf")
           # QMessageBox.critical(self, "Error", f"Failed to save file history: {e}")

    def dele_from_history(self,file):
        self.file_history.remove(file);
        self.save_file_history();
        self.update_reopen_menu();


    def ropen(self,rfile):
        self.typeAction='ropen';
        self.tempFile=rfile;
        import os
        if self.shakeSave():
            if os.path.exists(rfile):
                self.typeAction='none';
                self.filename=rfile;
                self.pathLib=os.path.dirname(self.filename)
                f = open(rfile, 'r', encoding="utf-8")
                s=f.read()
                t=str([s]);
                self.ui.m_webview.page().runJavaScript("ioSetSymbol("+t+");");
                self.usedSymbolFormIDEPyAMS=False;
                self.setSymbolFname();
                self.add_to_history(self.filename);
            else:
                self.dele_from_history(rfile);
                QMessageBox.critical(self.w, "Error", f"Failed to open file from history: {rfile}")








#-------------------------------------------------------------------------------
# __main__: start Symbol Editor software
#-------------------------------------------------------------------------------

if __name__ == "__main__":
        import sys
        app=QApplication(sys.argv);

        w=Mainwindow();
        w.show();
        w.path=os.path.dirname(sys.argv[0])+'/library';
        w.pathLib=w.path+'\library'

        sys.exit(app.exec_());
