#-------------------------------------------------------------------------------
# Name:        JFET output characteristics (Id versus Vds for several Vgs)
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
# Inner loop : DC sweep of Vd (Vds) from 0 to 10 V       -> analysis(param=...)
# Outer loop : one curve for every Vgs in the list       -> sweep(param, list)
# Both are done by a single run().

from pyams.lib import circuit
from pyams.models import DCVoltage, JFET

Vg = DCVoltage("G", "0")
Vd = DCVoltage("D", "0")
J1 = JFET("D", "G", "0")
J1.setParams("Beta=0.5m Vto=-2V Lambda=0.01")

cir = circuit()
cir.addElements({"Vg": Vg, "Vd": Vd, "J1": J1})
cir.setOutPuts("J1.Id")
cir.analysis(mode="dc", param="Vd.Vdc", start=0.0, stop=10.0, step=0.1)
cir.sweep(param="Vg.Vdc", list=[0.0, -0.5, -1.0, -1.5])
results = cir.run()                      # a list: one result dict per Vgs

for r in results:
    print("Vgs = %5.2f V : Id(Vds=10 V) = %.3f mA" % (r["param"], r["J1.Id"][-1] * 1e3))
cir.plot("jfet_curves.png", show=False)
