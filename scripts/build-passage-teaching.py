import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]; rows={}
for l in (root/'content/passage-teaching.txt').read_text().splitlines():
 f=l.split('|');assert len(f)==12
 rows[f[0]]={'phrases':[{'phrase':f[1],'meaning':f[2],'example':f[3]},{'phrase':f[4],'meaning':f[5],'example':f[6]}],'grammar':{'title':f[7],'quote':f[8],'rule':f[9],'example':f[10],'tip':f[11]}}
assert len(rows)==30
(root/'assets/passage-teaching.js').write_text('window.PASSAGE_TEACHING='+json.dumps(rows,ensure_ascii=False)+';\n')
