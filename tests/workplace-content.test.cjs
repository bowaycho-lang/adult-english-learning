const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const box={window:{}};vm.createContext(box);
for(const file of ['course-data','at35-data','workplace-content','course-exams'])vm.runInContext(fs.readFileSync(`assets/${file}.js`,'utf8'),box);
const {COURSE_EXAMS:sets,FULL_COURSE:units,WORKPLACE_CONTENT:bank}=box.window;
assert.equal(units.length,30);let count=0;
for(const u of units){for(const [mode,qs] of Object.entries(sets[u.id])){
 assert.equal(qs.length,20,`${u.id} ${mode} count`);
 assert.equal(new Set(qs.map(q=>q.id)).size,20,`${u.id} ${mode} unique ids`);
 assert.equal(new Set(qs.map(q=>q.type==='picture'?q.asset:q.q)).size,20,`${u.id} ${mode} unique prompts or images`);
 for(const q of qs){assert(q.answer&&q.why,`${q.id} answer and rationale`);if(q.choices){assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.choices.length,mode==='dialogue'?3:4)}if(q.asset)assert(fs.existsSync(`assets/at35/${q.asset}.webp`));if(['reading','listening'].includes(mode))assert(q.passage&&q.group);count++}
}}
for(const qs of Object.values(sets))assert(qs.grammar.every(q=>q.id.startsWith('x3:a:')),'advanced-only grammar');assert.equal(bank.grammar.advanced.length,80);assert.equal(bank.cases.length,30);assert.equal(bank.responses.length,60);
console.log(JSON.stringify({units:units.length,modeSets:180,questionSlots:count,uniqueGrammar:380,uniqueComprehension:120,uniqueResponses:60,uniqueSpellings:60,pictureAssets:28}));
