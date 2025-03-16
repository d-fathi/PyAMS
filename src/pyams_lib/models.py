

from PyAMS import voltage,current,signal,model,param,circuit,time
from std import ddt

#-------------------------------------------------------------------------------
# models: of analog elements (basic)
#-------------------------------------------------------------------------------

#Resistor Model-----------------------------------------------------------------
class Resistor(model):
    def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
        self.V = signal('in',voltage,p,n)
        self.I = signal('out',current,p,n)

        #Parameters declarations------------------------------------------------
        self.R=param(100,'F','Resistor value')

    def analog(self):
        #Resistor equation-low hom (Ir=Vr/R)------------------------------------
        self.I+=self.V/self.R


#Capacitor model----------------------------------------------------------------
class Capacitor(model):
     def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.V = signal('in',voltage,p,n)
         self.I = signal('out',current,p,n)
        #Parameter declarations-------------------------------------------------
         self.C=param(1.0e-6,'F','Capacitor value')

     def analog(self):
         #Ic=C*dVc/dt-----------------------------------------------------------
         self.I+=self.C*ddt(self.V)


#-------------------------------------------------------------------------------
# models: of analog elements (source)
#-------------------------------------------------------------------------------

#Source for constant voltage
class DCVoltage(model):
     def __init__(self, p, n):
         #Signals declarations--------------------------------------------------
         self.V=signal('out',voltage,p,n)

         #Parameters declarations-----------------------------------------------
         self.Vdc=15

     def analog(self):
         self.V+=self.Vdc


#Sine wave Voltage  source------------------------------------------------------
from math import sin,pi,exp

class SinVoltage(model):
     def __init__(self, p, n):
         #Signal  declaration--------------------------------------------------
         self.V = signal('out',voltage,p,n)

         #Parameters declarations----------------------------------------------
         self.Fr=param(2.0,'Hz','Frequency of sine wave')
         self.Va=param(10.0,'V','Amplitude of sine wave')
         self.Ph=param(0.0,'°','Phase of sine wave')
         self.Voff=param(0.0,'V','Voltage offset')
         self.Fr1=param(2.0,'Hz','Frequency of sine wave')
         self.Va1=param(10.0,'V','Amplitude of sine wave')
         self.Ph1=param(0.0,'°','Phase of sine wave')
         self.Voff1=param(0.0,'V','Voltage offset')

     def analog(self):
          self.V+=self.Va*sin(pi*2.0*self.Fr*time+self.Ph*pi/180.0)+self.Voff


#-------------------------------------------------------------------------------
# models: of analog elements (active)
#-------------------------------------------------------------------------------

#Simple Diode-------------------------------------------------------------------
def  explim(a):
     if a>=200.0:
          return (a-199.0)*exp(200.0)
     return exp(a)

class  Diode(model):
   def __init__(self, a, b):
        #Signals declarations---------------------------------------------------
        self.V = signal('in',voltage,a,b)
        self.I = signal('out',current,a,b)

        self.Iss=param(1.0e-13,'A','Saturation current')
        self.Vt=param(0.025,'V','Thermal voltage')
        self.n=param(1,' ','The ideality factor');


   def analog(self):
        #Mathematical equation between I and V----------------------------------
        self.I+=self.Iss*(explim(self.V/(self.n*self.Vt))-1)


if __name__ == '__main__':
#-------------test of circuit----------------------------------------------------

  # Create a circuit instance
  myCircuit = circuit()
  elem=myCircuit.elem



  # Add elements to the circuit
  myCircuit.addElements({
        'V1': SinVoltage('1', '0'),
        'D1': Diode('1', '2'),
        'R2': Resistor('2', '0'),
    })

  # Set outputs for plotting
  myCircuit.setOutPuts(elem['V1'].V,'2')

  # Modify parameters of an element
  elem['V1'].setParams("Va=10 Ph=0 Voff=0")

  #Perform transient analysis
  myCircuit.analysis(mode='tran',start=0.0,step=0.001,stop=20)
  myCircuit.run()

  #plot the results
  myCircuit.plot()


  print( myCircuit.elem)
  print( 'nodes:'+str(myCircuit.nodes))
  print( myCircuit.getSize())
