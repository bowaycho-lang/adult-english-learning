const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup({pending=false,noMime=false}={}){
 const elements=new Map(),listeners={},tracks=[],recorders=[],timers=new Map();let resolvePermission,tid=0;
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',disabled:false,hidden:true,pause(){this.paused=true},removeAttribute(k){delete this[k]}});return elements.get(id)};
 class Recorder {
  static isTypeSupported(t){return t==='audio/mp4'}
  constructor(s,options){this.state='inactive';this.options=options;recorders.push(this)}
  start(){this.state='recording'}
  stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['audio'],{type:'audio/mp4'})});this.onstop?.()})}
 }
 if(noMime)Recorder.isTypeSupported=undefined;
 const media={getUserMedia:()=>{const t={stopped:false,stop(){this.stopped=true}};tracks.push(t);const s={getTracks:()=>[t]};return pending?new Promise(r=>resolvePermission=()=>r(s)):Promise.resolve(s)}};
 const context={console,Blob,URL,queueMicrotask,MediaRecorder:Recorder,navigator:{mediaDevices:media},localStorage:{getItem:()=>null},document:{hidden:false,getElementById:element,addEventListener:(n,f)=>listeners[n]=f},setTimeout:f=>{timers.set(++tid,f);return tid},clearTimeout:n=>timers.delete(n),SpeechSynthesisUtterance:function(t){this.text=t}};
 context.window=context;context.AT35_DATA={words:{},lessons:[]};context.speechSynthesis={cancel(){},getVoices:()=>[],speak(){context.spoke=true}};
 const source=fs.readFileSync('assets/at35-app.js','utf8');
 const visibility=source.match(/document.addEventListener\('visibilitychange'.*?\);window.addEventListener/)[0].replace(/window.addEventListener$/,'');
 vm.runInNewContext(source.split("$('playDialogue').onclick=")[0]+visibility+'window.api={startRecording,clearRecording,speak};})();',context);
 return {context,element,tracks,recorders,timers,resolve:()=>resolvePermission(),background(){context.document.hidden=true;listeners.visibilitychange()},flush:()=>new Promise(queueMicrotask)};
}
test('MP4 recording stops, releases microphone, exposes replay, then clears old replay',async()=>{
 const h=setup();await h.context.api.startRecording();assert.equal(h.recorders[0].options.mimeType,'audio/mp4');assert.equal(h.element('record').disabled,true);
 h.recorders[0].stop();await h.flush();assert(h.tracks[0].stopped);assert.match(h.element('recording').src,/^blob:/);assert.equal(h.element('recording').hidden,false);assert.equal(h.timers.size,0);
 await h.context.api.startRecording();assert.equal(h.element('recording').src,undefined);h.context.api.clearRecording();await h.flush();assert(h.tracks.every(t=>t.stopped));assert.equal(h.element('recording').hidden,true);
});
test('permission resolved after background does not start microphone recording',async()=>{
 const h=setup({pending:true});const p=h.context.api.startRecording();h.background();h.resolve();await p;assert.equal(h.recorders.length,0);assert(h.tracks[0].stopped);assert.equal(h.element('record').disabled,false);
});
test('late recorder events cannot erase error or re-enable stale playback',async()=>{
 const h=setup();await h.context.api.startRecording();h.recorders[0].onerror();await h.flush();assert.match(h.element('recordStatus').textContent,/錄音失敗/);assert.equal(h.element('recording').hidden,true);assert.equal(h.timers.size,0);
});
test('speech cannot contaminate active recording; background stops recording',async()=>{
 const h=setup();await h.context.api.startRecording();h.context.api.speak('hello');assert(!h.context.spoke);assert.match(h.element('speechStatus').textContent,/先停止錄音/);h.background();await h.flush();assert(h.tracks[0].stopped);assert.equal(h.element('recording').hidden,false);
});
test('30 second timeout stops recording and missing MIME probe uses browser default',async()=>{
 const h=setup({noMime:true});await h.context.api.startRecording();assert.equal(h.recorders[0].options,undefined);[...h.timers.values()][0]();await h.flush();assert(h.tracks[0].stopped);assert.equal(h.element('record').disabled,false);
});
