import sys, time, math
import os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, DCVoltage, Comparator
from pyams.live import LiveRunner

def build(v=0.0, comp=False):
    V1 = DCVoltage('in', '0'); V1.setParams('Vdc=%g' % v)
    R1 = Resistor('in', 'out'); R1.setParams('R=1k')
    C1 = Capacitor('out', '0'); C1.setParams('C=1u')
    el = {'V1': V1, 'R1': R1, 'C1': C1}
    if comp:
        K1 = Comparator('out', 'ref', 'q'); K1.setParams('Voh=5 Vol=0')
        Vr = DCVoltage('ref', '0'); Vr.setParams('Vdc=2.5')
        Rq = Resistor('q', '0'); Rq.setParams('R=10k')
        el.update({'K1': K1, 'Vr': Vr, 'Rq': Rq})
    c = circuit(); c.addElements(el); return c

h = 10e-6
# 1) no input change: live == normal transient with the same fixed step
c = build(5.0, comp=True); c.setOutPuts('out', 'q'); c.analysis(mode='tran', start=0, stop=5e-3, step=h, uic=True); r = c.run()
c2 = build(5.0, comp=True); L = LiveRunner(c2, h, ['out', 'q'], uic=True); L.begin()
ts, outs, qs = [0.0], [0.0], [L.value('q')]
for t, v in L.advance(5e-3): ts.append(t); outs.append(v['out']); qs.append(v['q'])
L.end()
n = min(len(r['out']), len(outs))
print('1) same as run(): max|diff| out = %.3e  q = %.3e  (points %d/%d)' % (
    np.max(np.abs(np.array(outs[:n]) - r['out'][:n])), np.max(np.abs(np.array(qs[:n]) - r['q'][:n])), len(outs), len(r['out'])))
print('   comparator went high at t = %.3f ms (expected ~ %.3f ms)' % (
    1e3 * next(t for t, q in zip(ts, qs) if q > 2.5), 1e3 * 1e-3 * math.log(2)))

# 2) input changes while running: Vdc 0 -> 5 at 1 ms, back to 0 at 4 ms
c = build(0.0); L = LiveRunner(c, h, ['out']); L.begin()
rec = []
for t, v in L.advance(1e-3): rec.append((t, v['out']))
L.set_param('V1', 'Vdc', 5.0)
for t, v in L.advance(3e-3): rec.append((t, v['out']))
L.set_param('V1', 'Vdc', 0.0)
for t, v in L.advance(3e-3): rec.append((t, v['out']))
L.end()
tau = 1e-3
def exact(t):
    if t <= 1e-3: return 0.0
    if t <= 4e-3: return 5 * (1 - math.exp(-(t - 1e-3) / tau))
    return 5 * (1 - math.exp(-3)) * math.exp(-(t - 4e-3) / tau)
err = max(abs(v - exact(t)) for t, v in rec)
print('2) input change: v(out) at 4 ms = %.4f (exact %.4f), max error vs analytic = %.4f V (backward Euler, h=10us)' % (
    dict(rec)[min(dict(rec), key=lambda t: abs(t - 4e-3))], exact(4e-3), err))

# 3) real time: rate 0.02 (1 ms circuit = 50 ms real), 5 ms circuit -> ~0.25 s
c = build(5.0); L = LiveRunner(c, h, ['out'], uic=True); L.begin()
calls = []
w0 = time.perf_counter()
L.run_realtime(rate=0.02, max_circuit_time=5e-3, slice_real=0.03, on_slice=lambda t, s, i: calls.append((t, len(s), i['speed'], i['late'])))
w = time.perf_counter() - w0
L.end()
print('3) real time: %.3f s wall for 5 ms circuit at rate 0.02 (expected 0.25 s), %d slices, speed ~ %.4f, late=%s' % (
    w, len(calls), calls[-2][2] if len(calls) > 1 else calls[-1][2], any(c[3] for c in calls)))
# changing rate / as fast as possible
c = build(5.0); L = LiveRunner(c, h, ['out'], uic=True); L.begin()
w0 = time.perf_counter(); L.run_realtime(rate=None, max_circuit_time=20e-3); w = time.perf_counter() - w0; L.end()
print('   as fast as possible: 20 ms circuit in %.3f s -> %.3f circuit-s per real-s (%d steps)' % (w, 20e-3 / w, 2000))
