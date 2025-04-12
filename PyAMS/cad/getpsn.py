
id=1;
data=[{'unique_id': 1, 'parent_id': 0, 'short_name': '', 'type': ' ', 'description': ' '}];
v=list(AppPyAMS.elements.values())
k=list(AppPyAMS.elements.keys())


id=id+1;
r=id;




if not(param):
  data += [{'unique_id': id, 'parent_id': 1, 'short_name': 'Wire', 'type': ' ', 'description': ' '}]
  for j in range(len(net)):
    id=id+1;
    data+= [{'unique_id': id, 'parent_id': r, 'short_name':net[j]+'.V',  'unit':"V", 'type': 'wire', 'description': ''}]


for i in range(len(v)):
    signals=v[i].getSignals();
    params=v[i].getParamaters();
    id=id+1;
    r=id
    data += [{'unique_id': id, 'parent_id': 1, 'short_name': k[i], 'type': ' ', 'description': ' '}]
    if not(param):
     for j in range(len(signals)):
          id=id+1;
          data += [{'unique_id': id, 'parent_id': r, 'short_name': signals[j].name, 'type': 'signal', 'unit':signals[j].unit, 'description': signals[j].type, 'dir': signals[j].dir}]
    for j in range(len(params)):
          id=id+1;
          data += [{'unique_id': id, 'parent_id': r, 'short_name': params[j].name, 'type': 'paramater', 'unit':params[j].unit, 'description': ''}]
id=id+1;
data += [{'unique_id': id, 'parent_id': 1, 'short_name': 'PyAMS', 'type': ' ', 'description': ' '}]
data += [{'unique_id': id+1, 'parent_id': id, 'short_name': 'PyAMS.temp', 'type': 'paramater', 'unit':'°C', 'description': 'Temperature'}]

file = open(result, "w", encoding="utf-8")
file.write(str(data))
file.close();