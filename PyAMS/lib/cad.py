

def getAllSignalsParams(circuit)->dict:
    """
    Extracts all signal and parameter names from elements within a given circuit.
    This function iterates over all elements in the circuit, retrieves their signals and parameters,
    and structures the information into a dictionary format.
    """
    result = {}
    for name, element in circuit.elem.items():
        result[name] = {
            'signals': [{'name': signal.name} for signal in getattr(element, 'getSignals', lambda: [])()],
            'params': [{'name': param.name} for param in getattr(element, 'getParams', lambda: [])()]
        }
    return result


def listSignalsParams(circuit)->list:
    """
    Extracts all signal and parameter names from elements within a given circuit.
    This function iterates over all elements in the circuit, retrieves their signals and parameters,
    and structures the information into a dictionary format.
    """
    result=[{}]
    t=result[0]
    t['name']='Wire'
    t['icon']='nodes'
    t['children']=[]

    circuit.dcircuit.classifyInOutSignals()

    for i in range(len(circuit.nodes)):
       t['children']+=[{'name': circuit.nodes[i]+'.V' , "icon": "node", "nature":'node'}]

    for i in range(len(circuit.dcircuit.nodes)):
       t['children']+=[{'name': circuit.dcircuit.nodes[i]+'.D' , "icon": "dnode", "nature":'dnode'}]

    for name, element in circuit.elem.items():
        result+=[{}]
        t=result[len(result)-1]
        t['name']=name
        t['icon']='elem'
        t['children']=[]
        t['children']=[{'name': name+'.'+signal.name , "icon": "signal", "nature":signal.nature, "direction":signal.direction} for signal in getattr(element, 'getSignals', lambda: [])()]
        t['children']+=[{'name': name+'.'+signal.name , "icon": "signal", "nature":'digital', "direction":signal.direction} for signal in getattr(element, 'getDSignals', lambda: [])()]
        t['children']+=[{'name': name+'.'+param.name, "icon": "param",  "nature": "param"} for param in getattr(element, 'getParams', lambda: [])()]



    return result



from pyams.lib.cpyams import floatToStr

def getParams(elem)->list:
    """
    Extracts all  parameters names, values, units and description from element.
    """
    return [{'name': param.name, 'description': param.description, 'unit': param.unit, 'value': floatToStr(param.value)} for param in getattr(elem, 'getParams', lambda: [])()]


from pyams.lib.cpyams import circuit,signal,param,time, dsignal
from pyams.lib.progressbar import displayBarPage
import json;

class cirCAD(circuit):
      def displayBarProgress(self,current, total, start_time):
          self.elapsed_time=displayBarPage(current, total, start_time)

      def result(self):

            # Assume the first output is the x-axis
       result=[]
       for i in range(len(self.outputs)):
          data = self.outputs[i]['data']

          if self.outputs[i]['type'] == 'node':
             label = f"Node {self.nodes[self.outputs[i]['pos']]} [V]"
             type_='analog'
          elif self.outputs[i]['type'] == 'dnode':
             label = f"Node {self.dcircuit.nodes[self.outputs[i]['pos']]} [D]"
             type_='digital'
          elif isinstance(self.outputs[i]['pos'], signal):
             label = f"Signal {self.outputs[i]['pos'].name_} [{self.outputs[i]['pos'].unit}]"
             type_='analog'
          elif isinstance(self.outputs[i]['pos'], dsignal):
             label = f"Signal {self.outputs[i]['pos'].name_} [D]"
             type_='digital'
          elif isinstance(self.outputs[i]['pos'], param):
             label = f"Parameter {self.outputs[i]['pos'].name_} [{self.outputs[i]['pos'].unit}]"
             type_='analog'
          result+=[{'data':data,'label': label, 'type':type_}]
       output = { "progress": 100, "data": result, "elapsed_time":self.elapsed_time}
       print(json.dumps(output));


      def getVal(self):
       result=[]

       for i in range(len(self.outputs)):
          data = self.outputs[i]['data']
          if self.outputs[i]['type'] == 'node':
            result+=[{'name':self.nodes[self.outputs[i]['pos']],'value':floatToStr(data[0])+'V'}]
          elif self.outputs[i]['type'] == 'dnode':
            result+=[{'name':self.dcircuit.nodes[self.outputs[i]['pos']],'value':data[0]}]
          elif self.outputs[i]['type'] == 'dsignal':
            result+=[{'name':self.outputs[i]['pos'].name_,'value':data[0]}]
          else:
            result+=[{'name':self.outputs[i]['pos'].name_,'value':floatToStr(data[0])+self.outputs[i]['pos'].unit}]
          print(json.dumps(result));

