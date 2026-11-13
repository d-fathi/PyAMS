"""End-to-end test of liveSession.py with demo/live/LiveDemo (python pyams/liveSessionTest.py)."""
import subprocess,json,sys,time,threading
import os,tempfile
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG=os.path.join(tempfile.gettempdir(),'liveSessionTest.json'); CODE=os.path.join(tempfile.gettempdir(),'liveSessionTest_code.py')
# the circuit code of demo/live/Live Demo.dcs
open(CODE,'w',encoding='utf-8').write('''import sys; sys.path.insert(0, %r)
from LiveDemo import LiveDemo
from pyams.models import Resistor, Capacitor
S1 = LiveDemo("in","0")
R1 = Resistor("in","out"); R1.setParams("R=1KΩ")
C1 = Capacitor("out","0"); C1.setParams("C=100µF")
''' % os.path.join(R,'demo','live'))
cfg={"step":"100us","rate":1.0,"report":0.05,"outputs":["in","out"],"widgets":{
 "S1.sw1":{"dir":"in","kind":"param","element":"S1","name":"on","value":0},
 "S1.vs":{"dir":"in","kind":"param","element":"S1","name":"Vs","value":3},
 "S1.boost":{"dir":"in","kind":"param","element":"S1","name":"boost","value":0},
 "S1.led1":{"dir":"out","kind":"param","element":"S1","name":"led"},
 "S1.seg1":{"dir":"out","kind":"param","element":"S1","name":"seg"},
 "S1.ovl":{"dir":"out","kind":"param","element":"S1","name":"ovl"},
 "S1.vin":{"dir":"out","kind":"node","node":"out","scale":2,"offset":1}}}
json.dump(cfg,open(CFG,'w'))
p=subprocess.Popen(['python3','-I',R+'/pyams/liveSession.py',R,CODE,CFG],stdin=subprocess.PIPE,stdout=subprocess.PIPE,text=True,bufsize=1)
ev=[]
def rd():
    for l in p.stdout: ev.append((time.time(),json.loads(l)))
threading.Thread(target=rd,daemon=True).start()
def send(o): p.stdin.write(json.dumps(o)+'\n'); p.stdin.flush()
def last(ref):
    for t,e in reversed(ev):
        if e['event']=='widgets' and ref in e['values']: return e['values'][ref]
time.sleep(1.0); print('initial',last('S1.led1'),last('S1.seg1'),last('S1.vin'))
send({'cmd':'input','ref':'S1.sw1','value':1}); time.sleep(0.6)
print('on: led',last('S1.led1'),'seg',last('S1.seg1'),'vin',last('S1.vin'),'ovl events',[e['values']['S1.ovl'] for t,e in ev if e['event']=='widgets' and 'S1.ovl' in e['values']])
send({'cmd':'input','ref':'S1.vs','value':5}); time.sleep(0.8); print('Vs=5: seg',last('S1.seg1'))
send({'cmd':'input','ref':'S1.boost','value':1}); time.sleep(0.8); print('boost: seg',last('S1.seg1'))
send({'cmd':'pause'}); time.sleep(0.3); n=len(ev); time.sleep(0.5); print('paused, new events',len(ev)-n)
send({'cmd':'resume'}); send({'cmd':'rate','value':None}); time.sleep(0.8)
st=[e for t,e in ev if e['event']=='status'][-1]; print('fast status',st)
send({'cmd':'reset'}); time.sleep(0.6); print('reset: led',last('S1.led1'),'seg',last('S1.seg1'))
send({'cmd':'stop'}); p.wait(timeout=5); time.sleep(0.2)
print('kinds',sorted({e['event'] for t,e in ev}),'last',ev[-1][1]); print([e for t,e in ev if e['event'] in('error','log')][:5])
