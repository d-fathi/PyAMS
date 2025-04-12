#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      D.fathi
#
# Created:     12/02/2022
# Copyright:   (c) D.fathi 2022
# Licence:     <your licence>
#-------------------------------------------------------------------------------

def getDir(directory):
    import os
    a=[]
    rootdir = directory
    for file in os.listdir(directory):
       d = os.path.join(rootdir, file)
       if os.path.isdir(d):
          a+=[d]
          s=getDir(d);
          if len(s)!=0:
           a+=s;
    return a;

def addToPath(directory):
    pass




