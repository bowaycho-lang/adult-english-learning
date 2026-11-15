import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]; rows={}
for l in (root/'content/passage-teaching.txt').read_text().splitlines():
 f=l.split('|');assert len(f)==12
 rows[f[0]]={'phrases':[{'phrase':f[1],'meaning':f[2],'example':f[3]},{'phrase':f[4],'meaning':f[5],'example':f[6]}],'grammar':{'title':f[7],'quote':f[8],'rule':f[9],'example':f[10],'tip':f[11]}}
for line in (root/'content/passage-prepositions.txt').read_text().splitlines():
 key,quote,title,rule,example=line.split('|')
 rows[key]['prepositions']=[{'quote':quote,'title':title,'rule':rule,'example':example}]
assert len(rows)==30
assert all(r.get('prepositions') for r in rows.values())
(root/'assets/passage-teaching.js').write_text('window.PASSAGE_TEACHING='+json.dumps(rows,ensure_ascii=False)+';\n')
