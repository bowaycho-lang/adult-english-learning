'use strict';
(()=>{
const KEY='adultEnglishVoiceV1',synth=window.speechSynthesis;let selected='';try{selected=localStorage.getItem(KEY)||''}catch{}
const box=document.createElement('section');box.className='card';box.style.marginBottom='20px';
box.innerHTML='<h2>英文發音選擇</h2><label>聲音 <select id="englishVoice" style="max-width:100%;width:100%"></select></label><div class="toolbar"><button id="voicePreview">▶ 試聽發音</button><button id="voiceRefresh">重新讀取聲音</button></div><p id="voiceNotice" class="notice" role="status"></p>';
document.querySelector('main').prepend(box);
const select=document.getElementById('englishVoice'),notice=document.getElementById('voiceNotice');
const key=v=>JSON.stringify([v.voiceURI,v.lang,v.name]);
const voices=()=>synth?.getVoices().filter(v=>/^en(?:[-_]|$)/i.test(v.lang))||[];
const accents={'en-us':'美式','en-gb':'英式','en-au':'澳洲','en-ca':'加拿大','en-in':'印度','en-ie':'愛爾蘭','en-nz':'紐西蘭'};
function refresh(){const list=voices();select.replaceChildren(new Option('自動選擇英文聲音',''));for(const v of list){const tag=v.lang.replace('_','-').toLowerCase();select.add(new Option(`${accents[tag]||v.lang} · ${v.name}${v.localService?'（裝置聲音）':''}`,key(v)))}
select.value=list.some(v=>key(v)===selected)?selected:'';
notice.textContent=!synth?'此瀏覽器不支援語音播放。':selected&&select.value!==selected?'原選聲音目前不可用，暫用自動英文聲音。':list.length?'選擇套用到示範、單字、聽力及跟讀播放。可用口音依裝置提供；不改變語音辨識設定。':'尚未讀取到英文聲音，請稍後重新讀取，或在裝置語音設定下載英文聲音。';
document.getElementById('voicePreview').disabled=!synth;}
window.englishVoiceSettings={apply(u){const list=voices();const v=list.find(v=>key(v)===selected)||list.find(v=>v.localService&&/^en[-_]US$/i.test(v.lang))||list.find(v=>v.localService)||list[0];if(v){u.voice=v;u.lang=v.lang}else{u.voice=null;u.lang='en-US'}return u}};
select.onchange=()=>{selected=select.value;try{localStorage.setItem(KEY,selected);notice.textContent='已保存；下次播放會使用所選聲音。'}catch{notice.textContent='本次選擇已套用，但瀏覽器無法保存設定。'}};
document.getElementById('voicePreview').onclick=()=>window.dispatchEvent(new Event('english-voice-preview'));
document.getElementById('voiceRefresh').onclick=refresh;synth?.addEventListener?.('voiceschanged',refresh);window.addEventListener('pageshow',refresh);refresh();
})();
