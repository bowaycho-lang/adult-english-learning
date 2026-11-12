(async()=>{
const $=id=>document.getElementById(id),errors=[],assert=(v,m)=>{if(!v)throw Error(m)},sleep=ms=>new Promise(r=>setTimeout(r,ms));let rounds=0,answers=0;
const wait=async f=>{for(let n=0;n<200;n++){if(f())return;await sleep(15)}throw Error('UI timeout')};
let spoken,fail=false,pending=false;
window.SpeechSynthesisUtterance=function(text){this.text=text};
Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},getVoices:()=>[],speak:u=>{spoken=u;if(!pending){if(fail)u.onerror?.();else u.onend?.()}}}});
const change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new Event('change'))};
const allFor=u=>Object.values(COURSE_EXAMS[u.id]).flat().filter(q=>q.type!=='reading');
const findQ=qs=>qs.find(q=>q.type==='picture'?$('questionImage').getAttribute('src')===`assets/at35/${q.asset}.webp`:q.q===$('question').textContent);
async function answerMain(q,wrong=false){
 if(q.type==='listening'&&[...$('choices').children].every(b=>b.disabled))$('hear').click();
 if(q.type==='picture')await wait(()=>[...$('choices').children].some(b=>!b.disabled));
 if(q.type==='spelling'){$('spellInput').value=wrong?'wrong answer':q.answer;$('spellForm').dispatchEvent(new Event('submit',{cancelable:true}))}
 else{const b=[...$('choices').children].find(b=>wrong?b.textContent!==q.answer:b.textContent===q.answer);assert(b&&!b.disabled,'answer enabled '+q.id);b.click();b.click()}
 assert(!$('next').disabled,'next enabled');answers++;$('next').click();
}
try{
const range=window.__unitRange||[0,30];
for(const u of FULL_COURSE.slice(...range)){
 $('book'+u.book).click();[...$('unitMenu').children].find(b=>b.textContent.startsWith(String(u.unit).padStart(2,'0'))).click();$('tab-practice').click();
 for(const mode of ['grammar','listening','dialogue','spelling','picture','mixed']){
 change('mode',mode);assert($('counter').textContent.includes('/ 20'),'twenty '+u.id+mode);const seen=new Set(),qs=allFor(u);let first;
 for(let i=0;i<20;i++){const q=findQ(qs);assert(q,'known question '+u.id+mode);assert(!seen.has(q.id),'no repeat');seen.add(q.id);if(i===0)first=q;await answerMain(q,i===0)}
 assert($('result').textContent.includes('95 分'),'score95 '+u.id+mode);assert($('result').textContent.includes('19 / 20'),'denominator');assert(!$('retry').hidden,'retry shown');$('retry').click();assert($('counter').textContent.includes('/ 1'),'retry only incorrect');await answerMain(first);assert($('result').textContent.includes('100 分'),'retry score');rounds++;
 }
 $('tab-learn').click();
 for(const mode of ['reading','listening']){
 change('readingMode',mode);const qs=COURSE_EXAMS[u.id][mode==='reading'?'reading':'listening'];
 for(let i=0;i<20;i++){
 assert($('readingCounter').textContent.includes(`/ 20`),'reading count');assert($('readingQuestion').textContent===qs[i].q,'reading prompt');
 if(mode==='listening'){
 assert($('passageText').hidden,'hidden transcript');
 if(i%4===0){assert([...$('readingChoices').children].every(b=>b.disabled),'new passage locked');fail=true;$('passagePlay').click();assert([...$('readingChoices').children].every(b=>b.disabled),'failed speech locked');fail=false;$('passagePlay').click()}
 }
 const b=[...$('readingChoices').children].find(b=>i===0?b.textContent!==qs[i].answer:b.textContent===qs[i].answer);assert(b&&!b.disabled,'reading answer');b.click();b.click();answers++;$('readingNext').click();
 }
 assert($('readingQuestion').textContent.includes('95'),'reading score');assert($('readingReview').children.length===5,'five reviewed passages');assert($('readingNext').disabled,'finished locked');rounds++;
 }
 assert(document.documentElement.scrollWidth<=innerWidth+1,'no horizontal overflow '+u.id);
}
// A callback from a stopped or superseded recording must not unlock a new round.
change('readingMode','listening');pending=true;$('passagePlay').click();const stale=spoken;$('readingRestart').click();stale.onend?.();assert([...$('readingChoices').children].every(b=>b.disabled),'stale reading callback');pending=false;
$('tab-practice').click();change('mode','listening');pending=true;$('hear').click();const old=spoken;$('restart').click();old.onend?.();assert([...$('choices').children].every(b=>b.disabled),'stale main callback');pending=false;
const saved=JSON.parse(localStorage.getItem('adultEnglishFullCourseV1'));assert(saved.units[FULL_COURSE[range[0]].id].best['toeic2:grammar']===95,'stored new score');
if(window.__seeded){assert(saved.units.b1u1.best.grammar===80,'old score preserved');assert(saved.units.b1u1.notes==='keep my notes','notes preserved');assert(JSON.parse(localStorage.getItem('adultEnglishReadingV1'))['b1u1:reading']===100,'old reading score preserved')}
}catch(e){errors.push(e.stack||String(e))}
const p=document.createElement('pre');p.id='qa';p.textContent=JSON.stringify({rounds,answers,errors});document.body.append(p);
})();
