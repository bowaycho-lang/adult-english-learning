const {test}=require('node:test'),a=require('node:assert/strict'),{compare,tokens}=require('../assets/speech-compare.js');
test('punctuation and case',()=>a.equal(compare('Hello, Kenny!','hello kenny').score,100));
test('contractions',()=>a.equal(compare("I'm here. I can't swim.",'I am here I cannot swim').score,100));
test('missing word',()=>a.equal(compare('my name is Kenny','my is Kenny').parts.filter(p=>p.type==='missing')[0].expected,'name'));
test('substitution',()=>a.equal(compare('I am Anna','I am Emma').parts.at(-1).type,'different'));
test('extra word',()=>a.equal(compare('hello Kenny','hello dear Kenny').parts.filter(p=>p.type==='extra')[0].heard,'dear'));
test('empty has no match',()=>a.equal(compare('hello','').score,0));
test('repeated words align',()=>a.equal(compare('I am who I am','I am I am').parts.filter(p=>p.type==='missing')[0].expected,'who'));
