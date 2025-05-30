
#-------------------------------------------------------------------------------
# Name:        cpyams (circuit of pyams)
# Author:      d.fathi
# Created:     20/03/2015
# Update:      24/04/2025
# Copyright:   (c) pyams 2024
# Web:         https://pyams.sf.net/
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
# utiles: used for convert value
#-------------------------------------------------------------------------------

def floatToStr(value: float) -> str:
    """
    Converts a floating-point number to a human-readable string with appropriate units.
    Args:
        value (float): The numeric value to convert.
    Returns:
        str: A formatted string representation with units.
    """

    units = {
        'f': 1e-15, 'p': 1e-12, 'n': 1e-9, 'µ': 1e-6, 'm': 1e-3,
        ' ': 1.0, 'k': 1e3, 'K':1e3, 'M': 1e6, 'T': 1e9
    }

    abs_value = abs(value)
    sign = '-' if value < 0 else ''

    # Iterate over units in descending order of scale
    for unit, scale in reversed(units.items()):
        if abs_value >= scale:
            scaled_value = abs_value / scale
            # Format the value to two decimal places, stripping trailing zeros
            formatted_value = f"{scaled_value:.2f}".rstrip('0').rstrip('.')
            return f"{sign}{formatted_value}{unit}"

    # Fallback for very small values (less than the smallest unit)
    return f"{value:.2e}"



def strToFloat(value: str) -> float:
    """
    Convert a string with unit suffix to a float.
    Args:
        value (str): The input string to convert, e.g., "1.2k", "3.5M", "100u".
    Returns:
        float: The corresponding numeric value.
    Raises:
        ValueError: If the input string cannot be parsed.
    """
    units = {
        'f': 1e-15, 'p': 1e-12, 'n': 1e-9, 'µ': 1e-6, 'u': 1e-6, 'm': 1e-3,
        ' ': 1.0, 'k': 1e3, 'K': 1e3, 'M': 1e6, 'T': 1e9
    }
    value = value.strip()  # Remove any surrounding whitespace
    num_part = ''
    unit_part = ''

    # Split the numeric and unit parts
    for char in value:
        if char.isdigit() or char in ['.', '-', '+', 'e', 'E']:
            num_part += char
        else:
            unit_part += char
            break

    # Default unit to an empty space (interpreted as 1.0 multiplier)
    unit_part = unit_part.strip() or ' '

    try:
        number = float(num_part)  # Convert the numeric part to a float
        multiplier = units.get(unit_part, None)  # Look up the multiplier
        if multiplier is None:
            return number
        return number * multiplier
    except ValueError as e:
        raise ValueError(f"Invalid input '{value}': {e}") from e

def value(v):
    return strToFloat(v)
#-------------------------------------------------------------------------------
# class param: class of represents a parameter
#-------------------------------------------------------------------------------
class param:
    """
    Represents a parameter with a value, unit, and optional description.
    Supports arithmetic operations and comparisons.
    """
    def __init__(self, value: float = 0.0, unit: str = '', description: str = ''):
        if not isinstance(value, (int, float)):
            raise TypeError("Value must be a numeric type")
        self._value = float(value)
        self.unit = unit
        self.description = description
        self.integr=1

    def __name__(self):
         return 'param'

    @property
    def value(self) -> float:
        return self._value

    @value.setter
    def value(self, new_value: float):
        if not isinstance(new_value, (int, float)):
            raise TypeError("Value must be a numeric type")
        self._value = float(new_value)

    def __str__(self) -> str:
        return f"{self.value:.2f} {self.unit}".strip()

    def __float__(self) -> float:
        return self.value

    # Arithmetic and comparison operations
    def _extract_value(self, other):
        """Extract numeric value from Signal, Param, or raw numbers."""
        if isinstance(other, signal) or isinstance(other, param):
            return other.value
        elif isinstance(other, (int, float)):
            return float(other)
        else:
            raise TypeError("Unsupported type for arithmetic operations")

    def __add__(self, other): return self.value + self._extract_value(other)
    def __radd__(self, other): return self.__add__(other)
    def __sub__(self, other): return self.value - self._extract_value(other)
    def __rsub__(self, other): return self._extract_value(other) - self.value
    def __mul__(self, other): return self.value * self._extract_value(other)
    def __rmul__(self, other): return self.__mul__(other)
    def __truediv__(self, other): return self.value / self._extract_value(other)
    def __rtruediv__(self, other): return self._extract_value(other) / self.value
    def __pow__(self, other): return self.value ** self._extract_value(other)
    def __mod__(self, other): return self.value % self._extract_value(other)
    def __rmod__(self, other): return self._extract_value(other) % self.value
    def __neg__(self): return -self.value
    def __pos__(self): return +self.value
    def __iadd__(self, other):
        self.value = self._extract_value(other)
        return self

    def __lt__(self, other): return self.value < self._extract_value(other)
    def __gt__(self, other): return self.value > self._extract_value(other)
    def __le__(self, other): return self.value <= self._extract_value(other)
    def __ge__(self, other): return self.value >= self._extract_value(other)
    def __eq__(self, other): return self.value == self._extract_value(other)
    def __ne__(self, other): return self.value != self._extract_value(other)



#-------------------------------------------------------------------------------
# class signal: class of signal
#-------------------------------------------------------------------------------

class signal:
    def __init__(self, direction: str, description: dict, porta: str = '0', portb: str = '0', name: str = ''):
        # Validate direction
        if direction not in {'in', 'out'}:
            raise ValueError("Direction must be 'in' or 'out'")
        self.direction = direction

        # Validate and assign description fields
        required_keys = {'abstol', 'chgtol', 'discipline', 'type', 'nature', 'unit'}
        if not required_keys.issubset(description):
            raise ValueError(f"Missing keys in description: {required_keys - description.keys()}")

        self.abstol = description.get('abstol', 0.0)
        self.chgtol = description.get('chgtol', 0.0)
        self.discipline = description.get('discipline', 'unknown')
        self.type = description.get('type', 'unknown')
        self.nature = description.get('nature', 'unknown')
        self.unit = description.get('unit', '')
        self.integr=1
        self.posflow=0;
        self.value0=0.0;

        # Assign additional attributes
        self.porta = porta
        self.portb = portb
        self._value = 0.0
        self._name = name or f"{self.type}_{direction}"

    @property
    def value(self) -> float:
        return self._value

    @value.setter
    def value(self, new_value: float):
        if not isinstance(new_value, (int, float)):
            raise TypeError("Value must be a number")
        self._value = float(new_value)

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, new_name: str):
        if not isinstance(new_name, str):
            raise TypeError("Name must be a string")
        self._name = new_name

    def __str__(self) -> str:
        return f"{self.name}: {self.value}{self.unit} ({self.type}, {self.direction})"

    def __float__(self) -> float:
        return self.value

    # Arithmetic and comparison operations
    def _extract_value(self, other):
        """Extract numeric value from Signal, Param, or raw numbers."""
        if isinstance(other, signal) or isinstance(other, param):
            return other.value
        elif isinstance(other, (int, float)):
            return float(other)
        else:
            raise TypeError("Unsupported type for arithmetic operations")

    def __add__(self, other): return self.value + self._extract_value(other)
    def __radd__(self, other): return self.__add__(other)
    def __sub__(self, other): return self.value - self._extract_value(other)
    def __rsub__(self, other): return self._extract_value(other) - self.value
    def __mul__(self, other): return self.value * self._extract_value(other)
    def __rmul__(self, other): return self.__mul__(other)
    def __truediv__(self, other): return self.value / self._extract_value(other)
    def __rtruediv__(self, other): return self._extract_value(other) / self.value
    def __mod__(self, other): return self.value % self._extract_value(other)
    def __rmod__(self, other): return self._extract_value(other) % self.value
    def __pow__(self, other): return self.value ** self._extract_value(other)
    def __neg__(self): return -self.value
    def __pos__(self): return +self.value
    def __iadd__(self, other):
        self.value = self._extract_value(other)
        return self

    def __lt__(self, other): return self.value < self._extract_value(other)
    def __gt__(self, other): return self.value > self._extract_value(other)
    def __le__(self, other): return self.value <= self._extract_value(other)
    def __ge__(self, other): return self.value >= self._extract_value(other)
    def __eq__(self, other): return self.value == self._extract_value(other)
    def __ne__(self, other): return self.value != self._extract_value(other)


# Usage example
voltage = {
    'discipline': 'electrical',
    'nature': 'potential',
    'abstol': 1e-8,
    'chgtol': 1e-14,
    'type': 'voltage',
    'unit': 'V'
}

current = {
    'discipline': 'electrical',
    'nature': 'flow',
    'abstol': 1e-8,
    'chgtol': 1e-14,
    'type': 'current',
    'unit': 'A'
}




#-------------------------------------------------------------------------------
# class model: object of model
#-------------------------------------------------------------------------------


class model:
    """
    Base class for representing circuit models.
    Provides methods to manage signals, parameters, and node indexing.
    """

    def __init__(self):
        self.Values = ''

    def getSignals(self) -> list:
        """
        Retrieve all Signal attributes of the model.
        Returns:
            list: A list of Signal objects defined in the model.
        """
        signals = []
        attributes = dir(self)
        for attr in attributes:
            obj = eval(f'self.{attr}')
            if isinstance(obj, signal):
                obj.name=attr
                signals.append(obj)
        return signals


    def getDSignals(self) -> list:
        """
        Retrieve all digital Signal attributes of the model.
        Returns:
            list: A list of Signal objects defined in the model.
        """
        dsignals = []
        attributes = dir(self)
        for attr in attributes:
            obj = eval(f'self.{attr}')
            if isinstance(obj, dsignal):
                obj.name=attr
                dsignals.append(obj)
        return dsignals

    def getParams(self) -> list:
        """
        Retrieve all Param attributes of the model.
        Returns:
            list: A list of Param objects defined in the model.
        """
        params = []
        attributes = dir(self)
        for attr in attributes:
            obj = eval(f'self.{attr}')
            if isinstance(obj, param):
                obj.name = attr  # Assign the attribute name to the Param's name property
                params.append(obj)
        return params

    def setParams(self, params: str = ''):
        """
        Update parameter values using a formatted input string.
        Args:
            param (str): String containing parameter-value pairs, e.g., "R=1000 Va=10".
        """
        params_to_set = []
        param_pairs = params.split(' ')
        for pair in param_pairs:
            key_value = pair.split('=')
            if len(key_value) == 2:
                params_to_set.append({'name': key_value[0], 'val': key_value[1]})

        attributes = dir(self)
        for attr in attributes:
            obj = eval(f'self.{attr}')
            if isinstance(obj, param):
                for param_info in params_to_set:
                    if attr == param_info['name']:
                        obj.value = value(param_info['val'])

    def ref(self,name: str):
        """
        Add referances to model name, signal name and param name
        """
        self.name=name;
        s=self.getSignals();
        for i in range(len(s)):
            s[i].name_=name+'.'+s[i].name;

        s=self.getDSignals();
        for i in range(len(s)):
            s[i].name_=name+'.'+s[i].name;

        s=self.getParams();
        for i in range(len(s)):
            s[i].name_=name+'.'+s[i].name;


    def nodeIndex(self, nodes: list):
       """
       Set indices for the model's signals based on the node list.
       If a signal's port is not found in the node list, it is added to the list.

       Args:
          nodes (list): List of node identifiers.
       """
       signals = self.getSignals()
       for signal in signals:
         # Handle porta
         if signal.porta in nodes:
            signal.indxa = nodes.index(signal.porta)
         else:
            nodes.append(signal.porta)
            signal.indxa = nodes.index(signal.porta)

         # Handle portb
         if signal.portb in nodes:
            signal.indxb = nodes.index(signal.portb)
         else:
            nodes.append(signal.portb)
            signal.indxb = nodes.index(signal.portb)



    def __repr__(self):
        """
        String representation of the model showing signals and parameters.
        Returns:
            str: Summary of the model's signals and parameters.
        """
        signals = self.getSignals()
        dsignals = self.getDSignals()
        params = self.getParams()
        signals_str = "\n".join([str(signal) for signal in signals])
        dsignals_str = "\n".join([str(dsignal) for dsignal in dsignals])
        params_str = "\n".join([f"{param.name}: {param.value} {param.unit} ({param.description})" for param in params])
        line='-----------------------------------------------------------------'
        return f"{line}\nModel:{self.name}\n{line}\nSignals:\n{signals_str}\n{dsignals_str}\nParameters:\n{params_str}"

#-------------------------------------------------------------------------------
# time..temp: List of paramatres
#-------------------------------------------------------------------------------

time=param(0.0,'Sec','Time')
freq=param(0.0,'Hz','Freq')
tnom=param(300.0,'K','Nominal temperature')
temp=param(27.0,'°C','Temperature')

time.name_='time';
temp.name_='temperature'
freq.name_='freq'




#-------------------------------------------------------------------------------
# Class circuit: used to convert the netlist or structur of circuit into
#                an array
#-------------------------------------------------------------------------------

from pyams.lib.unewton import solven
from pyams.lib.options import option
from pyams.lib.dynamic import control
from pyams.lib.progressbar import starTime, displayBar
from pyams.lib.digital import dsignal,dcircuit



class circuit:
    """
    Represents an electronic circuit with elements and nodes.
    """
    def __init__(self):
        """
        Initialize an empty circuit with a ground node ('0').
        """
        self.elem = {}  # Dictionary to store elements by name
        self.nodes = ['0']  # List of nodes, starting with ground
        self.option=option(self)   # Option of circuit simulation
        self.control=control(self) # Control of circuit simulation
        self.outputs=[]
        self.tempOutputs=[]
        self.dcircuit=dcircuit() # creat digitial circuit for add digital elements

    def addName(self, name: str, element: model):
        """
        Add a name to element and signals and paramatres.
        Args:
            name (str): The name of the element (e.g., 'R1', 'V1').
            element (model): The model object representing the element.
        """
        self.elem[name] = element
        element.ref(name)  # Set references in the model
        element.nodeIndex(self.nodes)  # Update node indices

    def addElements(self, elements: dict):
        """
        Add multiple elements to the circuit.
        Args:
            elements (dict): A dictionary of elements, e.g., {'R1': Resistor(...), 'V1': VoltageSource(...)}.
        """
        # save elements to used scend sweep
        self.saveElemnts=elements
        # cir it element in dict
        self.cir=[]
        for name, element in elements.items():
            self.addName(name, element)
            self.cir+=[element]

        lenElements=len(self.cir)

        i=0;

        while (i<lenElements):
         attributes = dir(self.cir[i])
         # if element type digital add to digital circuit
         self.dcircuit.addDigitalElement(self.cir[i])
         if 'sub' in attributes:
            newElms=self.cir[i].sub();
            name=self.cir[i].name;
            for j in range(len(newElms)):
                self.addName(name+str(j+1), newElms[j])
                self.cir+=[newElms[j]]
            lenElements=len(self.cir)
         i=i+1

        self.cir = [elem for elem in self.cir if hasattr(elem, 'analog') and callable(getattr(elem, 'analog'))]




    def classifyInOutSignals(self):
        """
        classify input and output signals from the circuit.
            - inSignals: List of input signals with details. (it potential, pos node a, pos node b, signal)
            - outSignals: List of output signals with details. (it potential, pos node a, pos node b, signal)
            - signals:  Collect all signals from circuit elements.
        """

        self.inSignals=[]
        self.inSignalsFlow=[]
        self.inSignalsPotential=[]
        self.outSignals=[]
        self.signals=[]

        for name, element in self.elem.items():
            self.signals+=element.getSignals()

        for i in range(len(self.signals)):
            signal_=self.signals[i]
            signalInfo=[signal_.nature=='potential',self.nodes.index(signal_.porta),self.nodes.index(signal_.portb),signal_]
            if signal_.direction=='in':
               self.inSignals+=[signalInfo]
            else:
               self.outSignals+=[signalInfo]



        #find in flow in the same position of out potential signal
        for index, (itPotential, node1, node2, signalIn) in enumerate(self.inSignals):
            setSignal=None
            if not(itPotential):
                for itPotentialOut, nodeOut1, nodeOut2, signalOut in self.outSignals:
                    if(itPotentialOut):
                      if(node1==nodeOut1) and (node2==nodeOut2):
                          dierction=1;
                          setSignal=signalOut;
                          break;
                      elif(node1==nodeOut2) and (node2==nodeOut1):
                          dierction=-1;
                          setSignal=signalOut;
                          break;

                if setSignal is None:
                    newSignalOut=signal('out',voltage,node1, node2)
                    signalInfo=[True,node1, node2,newSignalOut]
                    self.outSignals+=[signalInfo]
                    dierction=1;
                    setSignal=newSignalOut;
                    setSignal.value=0.0


                self.inSignalsFlow+=[[signalIn,setSignal,dierction]]
            else:
                self.inSignalsPotential+=[[signalIn,node1, node2]]

        self.dcircuit.classifyInOutSignals()
        self.dcircuit.findMixedSignals(parent=self)







    def  getSize(self):
      """
      Calculate and return key size attributes of the circuit.
      Attributes:
        - numNodes (int): Number of nodes excluding the ground node.
        - numSources (int): Number of output signals with potential nature.
        - vectorSize (int): Combined size of nodes and potential sources.
        - x (list): A zero-initialized vector of size `vectorSize`.
      Returns:
        dict: A dictionary containing the calculated attributes.
      """

      # Calculate the numbers of nodes excluding the ground and potential signals in outSignals
      self.numNodes = len(self.nodes) - 1
      self.numSources = sum(1 for signal in self.outSignals if signal[0])  # signal[0] indicates potential nature

      # Total size of the vector
      self.vectorSize = self.numNodes+self.numSources

      # Initialize vector x with zeros
      self.x = [0] * self.vectorSize

      return {
        "numNodes": self.numNodes,
        "numSources": self.numSources,
        "vectorSize": self.vectorSize
     }

    def set(self, x):
      """
      Update the circuit's input signals and propagate changes to elements.
      Args:
        x (list): A vector containing node potentials or other values.
      """
      x[0] = 0  # Ground node potential is always zero.

      for  signal,node1, node2 in self.inSignalsPotential:
            signal.value = x[node1] - x[node2]

      for  signal,signalPotential, dierction in self.inSignalsFlow:
            signal.value = dierction*x[signalPotential.posflow];

      for element in self.cir:
          element.analog()


    def feval(self,x):
      """
      Evaluate the circuit and compute the vector `y` based on node potentials.
      Args: x (list): A vector containing node potentials or other values.
      Returns: list: A vector `y` representing the evaluation results.
      """
      x.insert(0, 0)  # Ensure ground node potential is included at index 0.
      self.set(x)  # Update signals with the current vector `x`.
      numNodes = self.numNodes
      y = [0] * (self.vectorSize+1)  # Initialize the output vector `y`.

      # Process output signals
      for itPotential, node1, node2, signal in self.outSignals:
         value=signal.value
         if itPotential:
            # Handle potential signals
            numNodes += 1
            y[numNodes] = x[node1] - x[node2] - value
            y[node1] += x[numNodes]
            y[node2] -= x[numNodes]
            signal.posflow=numNodes
         else:
            # Handle flow signals
            y[node1] += value
            y[node2] -= value
      # Remove the inserted ground node potential
      y.pop(0)
      x.pop(0)
      # Update the circuit's current state
      self.x = x
      return y

    def run(self):
        '''
         using for start excute circuit.
        '''
        #self.addElements(self.elem)
        self.classifyInOutSignals()
        self.getSize()
        self.start()


    def getOpertingPoint(self):
        self.x,s=solven(self.x,self.feval,self.option)
        self.dcircuit.feval();
        return self.x

    def setOutPuts(self,*outputs):
        '''
         using for plot result "outputs" one finish simulation.
        '''
        self.tempOutputs=list(outputs)

        self.outputs=[]
        for i in range(len(outputs)):
            if(type(outputs[i])==str):
                if outputs[i] in self.nodes:
                  self.outputs+=[{'type':'node','pos':self.nodes.index(outputs[i]),'data':[]}]
                elif outputs[i] in self.dcircuit.nodes:
                  self.outputs+=[{'type':'dnode','pos':self.dcircuit.nodes.index(outputs[i]),'data':[]}]
            elif(type(outputs[i])==signal):
                self.outputs+=[{'type':'signal','pos':outputs[i],'data':[]}]
            elif(type(outputs[i])==dsignal):
                self.outputs+=[{'type':'dsignal','pos':outputs[i],'data':[]}]
            elif(type(outputs[i])==param):
                self.outputs+=[{'type':'param','pos':outputs[i],'data':[]}]

    def getOutPuts(self):
        '''
         using for get result "outputs" one finish simulation.
        '''
        data=[]

        for i in range(1,len(self.outputs)):
            data+=[self.outputs[i]['data']]
        return data

    def clearDataOutPuts(self):
        '''
         using for clear result or data "outputs".
        '''
        self.setOutPuts(*self.tempOutputs)



    def saveOutputs(self):

        for i in range(len(self.outputs)):
            out=self.outputs[i]
            pos=out['pos']
            data=out['data']
            if(out['type']=='node'):
                data+=[self.x[pos-1]]
            elif(out['type']=='dnode'):
                data+=[self.dcircuit.x[pos]]
            else:
                data+=[pos.value]


    def plot(self):
      """
      Plot the output signals or node voltages over time or parameter variations.
      Each output is plotted against the first output (assumed as the x-axis).
      """
      import matplotlib.pyplot as plt

      if not self.outputs:
        print("No outputs to plot. Use `setOutPuts` to define outputs.")
        return

      # Assume the first output is the x-axis
      x_data = self.outputs[0]['data']

      ndigitalPlot=0
      nanalogPlot=0


      for i in range(1,len(self.outputs)):

        if(self.outputs[i]['type']=='dnode'):
            ndigitalPlot+=1
        else:
            nanalogPlot=1




      fig, axs = plt.subplots(ndigitalPlot+nanalogPlot)
      if ndigitalPlot + nanalogPlot == 1:
           axs = [axs]

      #plt.figure(figsize=(10, 6))
      j=-1;
      for i in range(1, len(self.outputs)):
         digital=False
         y_data = self.outputs[i]['data']
         if(self.outputs[i]['type']=='dnode'):
            j+=1
            digital=True
         label = f"Output {i}: {self.outputs[i]['type']}"
         if self.outputs[i]['type'] == 'dnode':
             label = f"Node {self.dcircuit.nodes[self.outputs[i]['pos']]}"
         elif self.outputs[i]['type'] == 'node':
             label = f"Node {self.nodes[self.outputs[i]['pos']]}"
         elif isinstance(self.outputs[i]['pos'], signal):
             label = f"Signal {self.outputs[i]['pos'].name_}"
         elif isinstance(self.outputs[i]['pos'], param):
             label = f"Parameter {self.outputs[i]['pos'].name_}"

         if(digital):
           pos=j+nanalogPlot
           axs[pos].plot(x_data, y_data, label=label)
           axs[pos].set(ylabel=label)
           axs[pos].grid(True)
         else:
           pos=0
           axs[pos].plot(x_data, y_data, label=label)
           axs[pos].set(ylabel='Outputs')
           axs[pos].legend()
           axs[pos].grid(True)



      xlabel = "Time (s)" if self.analysis_['mode'] == 'tran' else "Parameter Variation"
      fig.supxlabel(xlabel)
      fig.suptitle("Circuit Outputs")
      plt.show()


    def print(self,*outputs):
        '''
         using for print result "outputs" one finish simulation.
        '''
        for i in range(len(outputs)):
           if(type(outputs[i])==str):  #output it's node
               if outputs[i] in self.nodes:
                 output_voltage = self.x[self.nodes.index(outputs[i]) - 1]  # Get voltage at node outputs[i]
                 print(f"Output Voltage at node {outputs[i]}: {output_voltage:.2f} V")
               if outputs[i] in self.dcircuit.nodes:
                 output_digital = self.dcircuit.x[self.dcircuit.nodes.index(outputs[i]) ]  # Get digial at node outputs[i]
                 print(f"Output Digital at node {outputs[i]}: {output_digital}")
           else:  #it's signal or param or model(element)
             print(outputs[i])

    def displayBarProgress(self,current, total, start_time):
        displayBar(current, total, start_time)


    def start(self):
      """
      Begin the simulation process based on the selected analysis mode.
      Handles transient ('tran') analysis with progress tracking.
      """

      # Initialize progress tracking
      start_time = starTime()
      global time

      self.clearDataOutPuts();

      if self.analysis_['mode'] == 'tran':
        # Add the time variable to outputs for plotting
        self.outputs.insert(0, {'type': signal, 'pos': time, 'data': []})
        # Extract simulation parameters
        start = self.analysis_['start']
        stop = self.analysis_['stop']
        step = self.analysis_['step']
        # integration methode
        self.control.setIntegration(0,step,False)
        # Initialize the simulation time
        time.value = 0.0
        # Compute operating point by time step
        # with save outputs
        while time.value <= stop:
            self.getOpertingPoint()
           # s=self.inSignalsFlow[0][0]
           # s.value0=s.value
            if time.value >= start:
                self.saveOutputs()
            time.value += step
            self.control.update();

            # Update progress bar
            self.displayBarProgress(time.value, stop, start_time)

      elif self.analysis_['mode'] == 'dc':
        # Add the param variable to outputs for plotting
        dcParam=self.analysis_['param']
        self.outputs.insert(0, {'type': param, 'pos': dcParam, 'data': []})
        # Extract simulation parameters
        start = self.analysis_['start']
        stop = self.analysis_['stop']
        step = self.analysis_['step']
        # Do not use dynamic calculation
        self.control.opAnalysis()
        # Initialize the simulation time
        dcParam.value = start
        # Compute operating point by time step
        # with save outputs
        while dcParam.value <= stop:
            self.getOpertingPoint()
            self.saveOutputs()
            dcParam.value += step
            # Update progress bar
            self.displayBarProgress(dcParam.value, stop, start_time)

      elif self.analysis_['mode'] == 'op':
           # Do not use dynamic calculation
            self.control.opAnalysis()
            # OP work
            self.getOpertingPoint()
            self.saveOutputs()





    def analysis(self,**kwargs):
        '''
         -Direct current analysis (dc) mode: it analysis circuit by variation one parameter start to stop by step
           kwargs={'mode':dc,'param':name,'start':start,'stop':stop,'step':step}
         -Transient analysis (tran) mode: it analysis of the circuits during the time it changes
           kwargs={'mode':tran,'start':start,'stop':stop,'step':step}
         -Operating-points analysis (op) mode:  is find operating points in the circuit for time=0.
           kwargs={'mode':op}
        '''
        self.analysis_=kwargs





