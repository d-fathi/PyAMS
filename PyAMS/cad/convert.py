

#-------------------------------------------------------------------------------
# def floatToStr: convert float to string
#-------------------------------------------------------------------------------
def floatToStr(value):
    units={'f':1e-15,'p':1e-12,'n':1e-9,'µ':1e-6,'m':1e-3,' ':1.0,'k':1e+3,'M':1e+6,'T':1e+9}
    v=list(units.values())
    k=list(units.keys())
    sign=math.copysign(1, value)
    value=abs(value)
    for i in range(len(v)-1, 0, -1):
       if(value>=(v[i])):
        f=format(sign*value/v[i],'.2f')
        lf=len(f)
        if(f[lf-1]=='0'):
          f=f[:lf-1]
        lf=len(f)
        if(f[lf-1]=='0'):
          f=f[:lf-1]
          f=f[:lf-2]
        return f+k[i]
    return str(sign*value);


#-------------------------------------------------------------------------------
# def strToFloat: convert string to  float
#-------------------------------------------------------------------------------

def strToFloat(value):
    num=''
    uni=''
    units={'f':1e-15,'p':1e-12,'n':1e-9,'µ':1e-6,'u':1e-6,'m':1e-3,' ':1.0,'k':1e+3,'K':1e+3,'M':1e+6,'T':1e+9}
    m=1.0;
    value=value+' ';

    for i in range(len(value)):
        if value[i] in ['0','1','2','3','4','5','6','7','8','9','+','-','e','.']:
           num=num+value[i];
        else:
           uni=value[i];
           m=float(num);
           if uni in units:
             m=m*units[uni];
           break;
    return m;



