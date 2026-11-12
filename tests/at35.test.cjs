const {chromium,webkit,devices}=require('playwright');
const fs=require('fs'),assert=require('node:assert/strict');
const base=process.env.TEST_URL||'http://127.0.0.1:8765';
const out=process.env.QA_DIR||'/workspace/scratch/5bed3c6539af/qa';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const engine=process.env.ENGINE||'chromium';let server;if(!process.env.TEST_URL){const http=require('http'),path=require('path');server=http.createServer((req,res)=>{const f=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);res.end();return}res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'text/html');res.end(b)})});await new Promise(r=>server.listen(8765,'127.0.0.1',r));}const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{args:['--no-sandbox']});
 const report={base,engine,checks:[],errors:[]};
 const check=(name)=>{report.checks.push(name);console.log('PASS',name)};
 for(const [name,device] of [['iphone',devices['iPhone 13 Pro']],['android',devices['Pixel 7']],['desktop',{viewport:{width:1440,height:1000}}]]){
 const context=await browser.newContext({...device});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Seed old records before running the new app. Speech mock tests control flow, not voice quality.
 await page.addInitScript(()=>{localStorage.setItem('adultEnglishL1','4');localStorage.setItem('adultEnglishSbsAlignedV1','{"1-1":80}');localStorage.setItem('adultEnglishPictureQuizBest','90');localStorage.setItem('unrelated','keep');window.__spoken=[];window.__audioFail=false;window.__speechToken=0;const synth={getVoices:()=>[],cancel:()=>{window.__speechToken++},speak:u=>{const t=window.__speechToken;window.__spoken.push(u.text);setTimeout(()=>{if(t!==window.__speechToken)return;if(window.__audioFail)u.onerror?.({error:'voice-unavailable'});else {u.onstart?.();u.onend?.()}},10)}};Object.defineProperty(window,'speechSynthesis',{value:synth});window.SpeechSynthesisUtterance=function(t){this.text=t};});
 await page.goto(base+'/at35-picture-quiz.html');await page.waitForSelector('#vocabulary .vocab-card');
 assert.equal(await page.locator('#lessonMenu button').count(),7);check(name+' seven themes render');
 const all=await page.evaluate(()=>({lessons:AT35_DATA.lessons,words:AT35_DATA.words}));
 for(let i=0;i<all.lessons.length;i++){
 await page.locator('#lessonMenu button').nth(i).click();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,'layout overflow '+name+' '+i);
 // Validate all referenced photos without relying on lazy viewport loading.
 const loaded=await page.evaluate(async()=>{const paths=[...document.querySelectorAll('img')].map(i=>i.src);return await Promise.all(paths.map(src=>new Promise(res=>{const i=new Image();i.onload=()=>res({src,ok:true});i.onerror=()=>res({src,ok:false});i.src=src}))) });assert(loaded.every(x=>x.ok),JSON.stringify(loaded.filter(x=>!x.ok)));
 await page.locator('#playDialogue').click();await page.waitForTimeout(20);assert((await page.evaluate(()=>__spoken.at(-1))).includes(all.lessons[i].dialog[0][0]));
 await page.locator('#tab-practice').click();await page.waitForFunction(()=>{const i=document.querySelector('#quizArt img');return i&&i.complete&&i.naturalWidth>0});
 // Cover every vocabulary image, one deliberately incorrect answer then correct answers.
 const n=all.lessons[i].words.length;
 for(let j=0;j<n;j++){
 await page.waitForFunction(()=>[...document.querySelectorAll('#quizAnswers button')].some(b=>!b.disabled));
 let target=await page.locator('#quizArt img').getAttribute('src');let ans;
 if(target.endsWith('/calendar.webp')){const zh=await page.locator('#quizArt .calendar-label').textContent();ans=Object.values(all.words).find(w=>w.calendar===zh).en;}
 else{const asset=target.split('/').pop().replace('.webp','');ans=all.lessons[i].words.find(en=>all.words[en].asset===asset)}
 const buttons=page.locator('#quizAnswers button');let selected=j===0?(await buttons.allTextContents()).find(x=>x!==ans):ans;
 await buttons.filter({hasText:new RegExp('^'+selected.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).click();
 assert.equal(await page.locator('#quizAnswers button:not(:disabled)').count(),0);
 await page.locator('#quizNext').click();
 }
 assert(await page.locator('#quizResults').isVisible());assert((await page.locator('#quizResults p').textContent()).includes(`${n-1} / ${n}`));
 await page.locator('#retryMistakes').click();assert((await page.locator('#quizCounter').textContent()).includes('/ 1 題'));
 await page.locator('#tab-learn').click();
 }
 check(name+' every vocabulary item loads, 7 quiz rounds score correctly, wrong-answer retry, no overflow');
 await page.locator('#lessonMenu button').nth(0).click();await page.locator('#tab-practice').click();await page.selectOption('#quizMode','listening');assert.equal(await page.locator('#quizAnswers button:not(:disabled)').count(),0);
 await page.evaluate(()=>__audioFail=true);await page.locator('#quizHear').click();await page.waitForTimeout(30);assert.equal(await page.locator('#quizAnswers button:not(:disabled)').count(),0);assert((await page.locator('#speechStatus').textContent()).includes('未能播放'));
 await page.evaluate(()=>__audioFail=false);await page.locator('#quizHear').click();await page.waitForFunction(()=>[...document.querySelectorAll('#quizAnswers button')].some(b=>!b.disabled));check(name+' listening unlocks only after successful audio completion');
 await page.selectOption('#quizMode','dialogue');for(let j=0;j<4;j++){const text=await page.locator('#quizArt strong').textContent();const zh=all.lessons[0].dialog.find(x=>x[0]===text)[1];await page.getByRole('button',{name:zh,exact:true}).click();await page.locator('#quizNext').click()}assert.equal(await page.locator('#quizResults strong').textContent(),'100 分');check(name+' dialogue comprehension complete');
 await page.reload();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('adultEnglishAT35V2')).best['meet:dialogue']),100);
 const old=await page.evaluate(()=>['adultEnglishL1','adultEnglishSbsAlignedV1','adultEnglishPictureQuizBest','unrelated'].map(k=>localStorage.getItem(k)));assert.deepEqual(old,['4','{"1-1":80}','90','keep']);check(name+' progress persists and old keys stay intact');
 await page.locator('#tab-speaking').click();await page.selectOption('#speakingLine','2');assert.equal(await page.locator('#speakingText').textContent(),all.lessons[0].dialog[2][0]);await page.locator('#speakingSlow').click();await page.waitForTimeout(20);assert.equal(await page.evaluate(()=>__spoken.at(-1)),all.lessons[0].dialog[2][0]);
 // Deterministic microphone failure; real microphone/voice remain device checks.
 await page.evaluate(()=>{Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>Promise.reject(new Error('denied'))},configurable:true});window.MediaRecorder=class {};});await page.locator('#record').click();await page.waitForTimeout(20);assert((await page.locator('#recordStatus').textContent()).includes('無法使用'));check(name+' speaking sentence selection and microphone-denial fallback');
 await page.locator('#tab-learn').click();await page.screenshot({path:out+'/'+engine+'-'+name+'.png',fullPage:true});
 // External images are not used, even when remote origins are blocked.
 await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());await page.reload();await page.waitForFunction(()=>document.querySelector('#scene img')?.naturalWidth>0);check(name+' same-origin images survive external-origin blocking');
 assert.deepEqual(errors,[]);await context.close();
 }
 const ctx=await browser.newContext({...devices['iPhone 13 Pro']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 for(const f of ['index.html','dashboard.html','sbs-illustrated-at33.html','sbs-textbook-at31.html','picture-word-quiz-at30.html']){await p.goto(base+'/'+f);await p.waitForTimeout(200);assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'legacy overflow '+f);if(f.startsWith('sbs')||f.startsWith('picture'))assert(await p.locator('img[src*="assets/at35/"]').count()>0);}
 assert.deepEqual(errs,[]);check('legacy pages retain working scripts and local images');
 await p.route('**/assets/at35/*.webp',r=>r.abort());await p.goto(base+'/at35-picture-quiz.html');await p.locator('#tab-practice').click();await p.waitForSelector('#retryImage:not([hidden])');assert.equal(await p.locator('#quizAnswers button:not(:disabled)').count(),0);check('broken images disable scoring and expose retry');
 await ctx.close();await browser.close();if(server)server.close();fs.writeFileSync(out+'/'+engine+'-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.checks.length,engine}));
})().catch(e=>{console.error(e);process.exit(1)});
