#-------------------------------------------------------------------------------
# Name:        Convert schema of circuit to netlist
# Created:     05/04/2024
# Update:      11/04/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from cad.dialogLibraryManagement import updateLib
import os




#-------------------------------------------------------------------------------
# def getListSignalsNodeParams: get list of signals from symboles in circuit.
#-------------------------------------------------------------------------------


def modifiedParams(self,code,modelName):
   try:
    temp_script = os.path.join(self.ppDir, "temp_script.py")
    with open(temp_script, "w", encoding="utf-8") as file:
            file.write(code)
    from cad.dialogListParams import listParams
    dialog =listParams(self)
    dialog.w.setWindowTitle("Paramatres of:  "+modelName)
    dialog.w.setWindowIcon(self.setIcon)
    if dialog.w.exec_():
        a=dialog.getModified()
        self.ui.m_webview.page().runJavaScript("setParams('"+a+"');")

   except Exception as e: # work on python 3.x
          str_error='Error: '+ str(e)
          print(str_error)

#-------------------------------------------------------------------------------
# def getListSignalsNodeParams: get list of signals from symboles in circuit.
#-------------------------------------------------------------------------------

def getListSignalsNodeParams(self,code,pos,type_):
    try:
      temp_script = os.path.join(self.ppDir, "temp_script.py")
      with open(temp_script, "w", encoding="utf-8") as file:
            file.write(code)
      from cad.dialogListSignalsParamatersNets import listSignalsParamatersNets
      dialog =listSignalsParamatersNets(self,pos,type_);
      dialog.w.setWindowTitle("Lists of signals paramatres and nodes");
      dialog.w.setWindowIcon(self.setIcon);
      if dialog.w.exec_():
         if type_==-1:
           self.ui.m_webview.page().runJavaScript("setProbeName('"+dialog.name+"','"+dialog.nature+"');")
         else:
           self.ui.m_webview.page().runJavaScript("ioSetPosProbe('"+dialog.name+"','u','"+dialog.nature+"');")

    except Exception as e: # work on python 3.x
          str_error='Error: '+ str(e)
          print(str_error)



#-------------------------------------------------------------------------------
# def analysis:  Analysis
#-------------------------------------------------------------------------------

def analysis(self,code,op=False):
    try:
      temp_script = os.path.join(self.ppDir, "temp_script.py")

      with open(temp_script, "w", encoding="utf-8") as file:
            file.write(code)

      title='Analysis';
      if(op):
       from cad.dialogProcessInterface import processOpAnalysis
       dialog=processOpAnalysis(self,title);
       dialog.start_process();
       dialog.w.exec_()
       return;

      from cad.dialogProcessInterface import processAnalysis
      dialog=processAnalysis(self,title);
      dialog.w.exec_()


    except Exception as e: # work on python 3.x
          str_error='Error: '+ str(e)
          print(str_error)










