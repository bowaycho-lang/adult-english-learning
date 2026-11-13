"""Compile original authored practice banks; no generated repetitions within a round."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def lines(name):
    return (ROOT/'content'/name).read_text().strip().splitlines()
def question(row, sep=';'):
    q,answer,wrong,why=row.split('|')
    choices=[answer,*wrong.split(sep)]
    assert len(set(choices))==len(choices), row
    return dict(q=q,answer=answer,choices=choices,why=why)
grammar={}; group=None
for row in lines('workplace-grammar.txt'):
    if row.startswith('# '):
        group=row[2:];grammar[group]=[]
    else:grammar[group].append(question(row,','))
assert len(grammar)==31
assert all(len(v)==(80 if k=='advanced' else 10) for k,v in grammar.items())
cases=[];case=None
for row in lines('workplace-cases.txt'):
    if row.startswith('# '):
        cid,title,unit=row[2:].split('|');case=dict(id=cid,title=title,unit=unit,questions=[]);cases.append(case)
    elif 'text' not in case:case['text']=row
    else:case['questions'].append(question(row))
assert len(cases)==30 and all(len(c['questions'])==4 for c in cases)
responses=[question(row) for row in lines('workplace-responses.txt')]
vocab=[dict(zip(['en','zh','sentence'],row.split('|'))) for row in lines('workplace-vocabulary.txt')]
assert len(responses)==60 and len(vocab)==60
obj=dict(grammar=grammar,cases=cases,responses=responses,vocab=vocab)
(ROOT/'assets'/'workplace-content.js').write_text('window.WORKPLACE_CONTENT='+json.dumps(obj,ensure_ascii=False,separators=(',',':'))+';\n')
print('Compiled: 380 grammar items, 30 workplace texts / 120 comprehension items, 60 responses, 60 contextual spellings.')
