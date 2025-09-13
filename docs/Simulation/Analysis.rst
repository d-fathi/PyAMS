The mode of analysis
=====================

The simulation of analog circuits by means of PyAMS
can be performed in three different domains: 

* Quiescent domain, i.e. direct current analysis (dc) mode; 
* Time-domain, i.e. transient analysis (tran) mode; 
* Operating-points, i.e. operating-points analysis (op) mode; 

Direct Current analysis
***********************
The dc analysis is  gets the operation of the circuit by variation one parameter in turns 
(e.g., the resistor value, current value, voltage value, temperature value, etc.). 
In this analysis, the nonlinear dynamic signals are replaced by sources with a zero value. 

Transient analysis
******************
the tran analysis by PyAMS is analysis  of the circuits during the time it changes
from one steady state condition to another steady state condition.

Operating-Points analysis
*************************
the op analysis by PyAMS is find operating points in the circuit for time=0.