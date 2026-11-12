'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='adultEnglishReadingV1';
let questions=[],unitId,mode='reading',pos=0,score=0,locked=false,finished=false,token=0,heard=new Set(),records={},results=[];
try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))records=v}catch{}
const card=document.createElement('section');card.className='card';card.style.marginTop='24px';
card.innerHTML='<h2>單元短文與聽力測驗 · 20 題</h2><p class="notice">每回合 5 篇職場短文、每篇 4 題：本課主題＋跨單元延伸複習。閱讀及聽力共用職場素材，成績分開記錄。含細節、同義改寫、原因及跨訊息推論。</p><label>練習方式 <select id="readingMode"><option value="reading">職場短文閱讀</option><option value="listening">職場短篇聽力</option></select></label><h3 id="passageTitle"></h3><p id="passageText" style="line-height:1.9;font-size:19px;white-space:pre-line"></p><p id="passageHint" class="notice" role="status"></p><div class="toolbar"><button id="passagePlay">▶ 一般速度</button><button id="passageSlow">慢速播放</button><button id="passageStop">停止播放</button></div><p id="readingBest" class="notice"></p><p id="readingCounter"></p><h3 id="readingQuestion"></h3><div id="readingChoices" class="answers"></div><p id="readingFeedback" aria-live="polite"></p><div class="toolbar"><button id="readingNext" disabled>下一題</button><button id="readingRestart">重新練習</button></div><div id="readingReview" hidden></div>';
$('learn').append(card);
const bestKey=()=>`${unitId}:${mode}:toeic2`;
const best=()=>Number.isFinite(records[bestKey()])?records[bestKey()]:'—';
function enable(){for(const b of $('readingChoices').children)b.disabled=finished||locked||(mode==='listening'&&!heard.has(questions[pos]?.group))}
function stop(){window.dispatchEvent(new Event('reading-stop'));token++}
function render(){
 stop();const q=questions[pos];locked=false;
 $('readingNext').disabled=true;$('readingNext').textContent=pos===19?'完成並查看解析':'下一題';
 $('readingCounter').textContent=`第 ${pos+1} / 20 題 · 答對 ${score} 題`;
 $('passageTitle').textContent=`短文 ${Math.floor(pos/4)+1} / 5 · ${q.passageTitle}`;
 $('passageText').textContent=q.passage;$('passageText').hidden=mode==='listening';
 $('passageHint').textContent=mode==='reading'?'閱讀短文後，選擇最合適的答案。':heard.has(q.group)?'本篇已播放完成，可以繼續作答或重聽。':'原文暫時隱藏；請完整聽完本篇，再回答這一組四題。';
 $('readingQuestion').textContent=q.q;$('readingFeedback').textContent='';$('readingChoices').replaceChildren();
 const choices=[...q.choices];for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]]}
 for(const answer of choices){const b=document.createElement('button');b.textContent=answer;b.onclick=()=>{
 if(locked||finished||(mode==='listening'&&!heard.has(q.group)))return;locked=true;
 const ok=answer===q.answer;if(ok)score++;results.push({q,answer,ok});
 $('readingFeedback').textContent=(ok?'答對了！':'正確答案：'+q.answer+'。')+' '+q.why;
 for(const option of $('readingChoices').children){if(option.textContent===q.answer)option.classList.add('correct');else if(option===b)option.classList.add('wrong')}
 enable();$('readingNext').disabled=false;
 };$('readingChoices').append(b)}enable();
}
function reset(){
 stop();unitId=window.FULL_COURSE.find(u=>u.title===$('title').textContent)?.id;if(!unitId)return;
 questions=window.COURSE_EXAMS[unitId][mode==='reading'?'reading':'listening'];
 pos=0;score=0;finished=false;heard=new Set();results=[];
 $('readingReview').hidden=true;$('readingReview').replaceChildren();
 for(const id of ['passagePlay','passageSlow','passageStop'])$(id).disabled=false;
 $('readingBest').textContent='新版此模式最佳：'+best()+' 分';render();
}
function play(rate){
 if(finished)return;const t=++token,q=questions[pos];$('passageHint').textContent='準備播放中，請聽完整篇；若未出聲，請查看頁面下方語音狀態。';
 window.dispatchEvent(new CustomEvent('reading-play',{detail:{text:q.passage,rate,done:()=>{if(t!==token||finished)return;heard.add(q.group);enable();$('passageHint').textContent='播放完成，可以作答或再次聆聽。'}}}));
}
function finish(){
 stop();finished=true;const n=score*5,key=bestKey();records[key]=Math.max(Number(records[key])||0,n);
 let saved=true;try{localStorage.setItem(KEY,JSON.stringify(records))}catch{saved=false}
 $('readingNext').disabled=true;$('readingChoices').replaceChildren();$('readingQuestion').textContent=`完成！${n} 分`;
 $('readingCounter').textContent=`答對 ${score} / 20 題`;$('readingFeedback').textContent=saved?'新版成績已保存；可展開下方短文核對答案。':'本次成績無法保存，請確認瀏覽器儲存權限。';
 $('readingBest').textContent='新版此模式最佳：'+best()+' 分';$('passageText').hidden=true;$('passageTitle').textContent='五篇短文與逐題解析';$('passageHint').textContent='本次為練習百分制，不能換算成正式多益分數。';
 for(const id of ['passagePlay','passageSlow','passageStop'])$(id).disabled=true;
 const review=$('readingReview');review.hidden=false;
 for(let i=0;i<results.length;i+=4){const d=document.createElement('details'),h=document.createElement('summary'),p=document.createElement('p');h.textContent=`短文 ${i/4+1} · ${results[i].q.passageTitle}`;p.textContent=results[i].q.passage;p.style.lineHeight='1.8';d.append(h,p);
 for(const r of results.slice(i,i+4)){const item=document.createElement('p');item.textContent=`${r.ok?'✓':'✗'} ${r.q.q}\n你的答案：${r.answer}\n正確答案：${r.q.answer}\n${r.q.why}`;item.style.whiteSpace='pre-line';d.append(item)}review.append(d)}
}
$('passagePlay').onclick=()=>play(1);$('passageSlow').onclick=()=>play(.75);
$('passageStop').onclick=()=>{stop();$('passageHint').textContent='已停止播放；未完整聽過的短文仍需播放完畢才能作答。'};
$('readingMode').onchange=()=>{mode=$('readingMode').value;reset()};$('readingRestart').onclick=reset;
$('readingNext').onclick=()=>{if(!locked||finished)return;if(++pos<20)render();else finish()};
window.addEventListener('course-unit-change',reset);reset();
})();
