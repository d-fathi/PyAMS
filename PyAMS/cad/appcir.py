#-------------------------------------------------------------------------------
# Name:        Convert schema of circuit to netlist
# Created:     05/04/2024
# Update:      11/04/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from cad import updateLib
import os



#-------------------------------------------------------------------------------
# convert schema of circuit  to netlist
#-------------------------------------------------------------------------------



def setDataAnalysis(l,win):
    test.AppPyAMS.update();
    win.lbl3.setText(test.AppPyAMS.getDescBar());
    a=test.AppPyAMS.getDataPlot()
    a+=[0]
    return a;

def setCommand(s):
    s='test.'+s
    eval(s)

#-------------------------------------------------------------------------------
# def getListSignalsNodeParams: get list of signals from symboles in circuit.
#-------------------------------------------------------------------------------


def modifiedParams(self,code,modelName):
   try:
    temp_script = os.path.join(self.ppDir, "temp_script.py")

    with open(temp_script, "w", encoding="utf-8") as file:
            file.write(code)


    from dialogListParams import listParams
    dialog =listParams(self,temp_script)
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
      from dialogListSignalsParamatersNets import listSignalsParamatersNets
      dialog =listSignalsParamatersNets(self,temp_script,pos,type_);
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
       from dialogProcessInterface import processOpAnalysis
       dialog=processOpAnalysis(self,temp_script,title);
       dialog.start_process();
       dialog.w.exec_()
       return;

      from dialogProcessInterface import processAnalysis
      dialog=processAnalysis(self,temp_script,title);
      dialog.w.exec_()


    except Exception as e: # work on python 3.x
          str_error='Error: '+ str(e)
          print(str_error)





#-------------------------------------------------------------------------------
# def pyamscircuit: convert schema of circuit to PyAMS netlist
#-------------------------------------------------------------------------------
def pyamscircuit(result,getdata,self):
    print(result)
    netList=result[3]
    option=str(result[4]);
    data=[]
    libs=['from sys import path;'];
    libs+=['path+=["'+self.ppDir+'/pyams.src/"]'];
    libs+=['path+=["'+self.path+'"];'];
    if(self.itProject):
        libs+=['path+=["'+self.pathLib+'/lib/"]'];
    dirs=openLib(self.path)['libs'];
    for i in range(len(dirs)):
        pos=self.path+'/'+dirs[i];
        libs+=['path+=["'+pos+'"];'];

    libs+=["import PyAMS"];
    libs+=['from PyAMS import time;']
    libs+=['from simu import AppPyAMS;']

    cir=[];
    parms=[];
    elems=[];

    for i in range(len(netList)):
        pins='","'.join(netList[i]['pins']);
        pins='("'+pins+'");';

        elems+=[netList[i]['ref']+'='+netList[i]['symbolname']+pins]
        cir+=['"'+netList[i]['ref']+'":'+netList[i]['ref']]

        s='from '+netList[i]['symbolname']+' import '+netList[i]['symbolname'];
        if not(s in libs):
            libs+=[s]

        p=netList[i]['params'];
        parms+=[netList[i]['ref']+'.setParam("'+p+'");'];
        #for k in range(len(p)):
         #   x = p[k].split('=');
          #  parms+=[netList[i]['ref']+'.'+x[0]+'+='+'strToFloat("'+x[1]+'");'];


    if(getdata):
       temp=result[0];
       probe=','.join(temp);
    else:
       temp=result[1];
       probe=','.join(temp);




    data+=[];
    data+=[];
    data+=["#------------------------------------------------------------------"];
    for i in range(len(libs)):
        data+=[libs[i]]

    data+=[];
    data+=[];
    data+=["#------------------------------------------------------------------"];
    for i in range(len(elems)):
        data+=[elems[i]]

    data+=["#------------------------------------------------------------------"];
    for i in range(len(parms)):
        data+=[parms[i]]

    data+=[];
    data+=[];
    data+=["#------------------------------------------------------------------"];

    data+=['AppPyAMS.cad=True'];
    if(option!='{}'):
       data+=['AppPyAMS.setOption('+option+');']
    data+=['AppPyAMS.circuit({'+','.join(cir)+'});'];
    return data


def getNameFileResult():
    from datetime import datetime
    # datetime object containing current date and time
    now = datetime.now()
    return  now.strftime("Result_%d_%m_%Y %H_%M_%S.txt")






