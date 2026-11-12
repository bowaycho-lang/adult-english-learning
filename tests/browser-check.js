(async()=>{
const checks=[],errors=[],$=id=>document.getElementById(id),assert=(x,msg)=>{if(!x)throw new Error(msg)},wait=ms=>new Promise(r=>setTimeout(r,ms));
const ready=async fn=>{for(let i=0;i<100;i++){if(fn())return;await wait(20)}throw Error('Timeout waiting for UI')};
const click=id=>$(id).click();
try{
 await ready(()=>$('lessonMenu').children.length===7);checks.push('7 themes rendered');
 for(let i=0;i<AT35_DATA.lessons.length;i++){
 $('lessonMenu').children[i].click();const l=AT35_DATA.lessons[i];await ready(()=>[...document.querySelectorAll('#scene img')].every(x=>x.complete&&x.naturalWidth));
 // Verify each source asset actually decodes in a browser.
 for(const img of document.querySelectorAll('#vocabulary img')){img.loading='eager';await ready(()=>img.complete&&img.naturalWidth>0)}
 assert(document.documentElement.scrollWidth<=innerWidth+1,'overflow '+l.id);
 click('playDialogue');await wait(30);assert(window.__spoken.at(-1).includes(l.dialog[0][0]),'dialogue speech');
 click('tab-practice');
 for(let j=0;j<l.words.length;j++){
 await ready(()=>[...$('quizAnswers').children].some(x=>!x.disabled));
 const img=$('quizArt').querySelector('img');const word=img.dataset.word;
 const answer=j===0?[...$('quizAnswers').children].find(x=>x.textContent!==word):[...$('quizAnswers').children].find(x=>x.textContent===word);
 assert(answer,'matching option '+word);answer.click();const feedback=$('quizFeedback').textContent;answer.click();assert($('quizFeedback').textContent===feedback,'double score');assert([...$('quizAnswers').children].every(b=>b.disabled),'answer locking');click('quizNext');
 }
 assert(!$('quizResults').hidden,'results');assert($('quizResults').textContent.includes(`${l.words.length-1} / ${l.words.length}`),'score '+l.id);click('retryMistakes');assert($('quizCounter').textContent.includes('/ 1 題'),'mistake retry');click('tab-learn');
 checks.push(l.id+': all images, quiz answers, scoring, retry, layout');
 }
 $('lessonMenu').children[0].click();click('tab-practice');$('quizMode').value='listening';$('quizMode').dispatchEvent(new Event('change'));
 assert([...$('quizAnswers').children].every(b=>b.disabled),'listening before playback');window.__audioFail=true;click('quizHear');await wait(30);assert([...$('quizAnswers').children].every(b=>b.disabled),'failed speech must not unlock');window.__audioFail=false;click('quizHear');await wait(30);assert([...$('quizAnswers').children].every(b=>!b.disabled),'successful speech unlock');checks.push('listening success/failure gating (speech mocked)');
 $('quizMode').value='dialogue';$('quizMode').dispatchEvent(new Event('change'));for(let i=0;i<4;i++){const en=$('quizArt').querySelector('strong').textContent,zh=AT35_DATA.lessons[0].dialog.find(x=>x[0]===en)[1];[...$('quizAnswers').children].find(x=>x.textContent===zh).click();click('quizNext')}
 assert($('quizResults').querySelector('strong').textContent==='100 分','dialogue score');checks.push('dialogue comprehension 100%');
 assert(localStorage.getItem('adultEnglishL1')==='4','old score');assert(localStorage.getItem('adultEnglishSbsAlignedV1')==='{"1-1":80}','old aligned progress');assert(localStorage.getItem('unrelated')==='keep','unrelated');assert(JSON.parse(localStorage.getItem('adultEnglishAT35V2')).best['meet:dialogue']===100,'new progress');checks.push('new progress writes and old records unchanged (storage shim for inline browser test)');
 click('tab-speaking');$('speakingLine').value='2';$('speakingLine').dispatchEvent(new Event('change'));click('speakingSlow');await wait(30);assert(__spoken.at(-1)===AT35_DATA.lessons[0].dialog[2][0],'speaking selected');click('record');await wait(30);assert($('recordStatus').textContent.includes('無法使用')||$('recordStatus').textContent.includes('不支援'),'mic fallback');checks.push('speaking selection and unavailable microphone');
 // Simulate a failed image request after a fresh quiz starts.
 click('tab-practice');$('quizMode').value='picture';$('quizMode').dispatchEvent(new Event('change'));await ready(()=>[...$('quizAnswers').children].some(b=>!b.disabled));$('quizArt').querySelector('img').dispatchEvent(new Event('error'));assert([...$('quizAnswers').children].every(b=>b.disabled),'broken image gates answers');assert(!$('retryImage').hidden,'image retry');checks.push('image-error prevents scoring');
 click('tab-learn');
}catch(e){errors.push(String(e.stack||e))}
const result={checks,errors,viewport:{width:innerWidth,height:innerHeight},userAgent:navigator.userAgent};document.querySelectorAll('script').forEach(x=>x.remove());const pre=document.createElement('pre');pre.id='qa-done';pre.textContent=JSON.stringify(result);document.body.append(pre);
})();
