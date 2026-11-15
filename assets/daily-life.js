'use strict';
(()=>{
const rows=[
['食','eat out','外出用餐','Let’s eat out tonight.','我們今晚出去吃飯吧。'],
['衣','try on','試穿','Can I try this on?','我可以試穿這件嗎？'],
['住','clean up','收拾乾淨','Let’s clean up the room.','我們把房間整理乾淨吧。'],
['行','get on','上車','Let’s get on the bus.','我們上公車吧。'],
['育','look up','查詢','Look up this word.','查一下這個單字。'],
['樂','hang out','一起消磨時間','Let’s hang out this weekend.','我們這個週末一起出去玩吧。'],
['食','take away','外帶','Can I take this away?','我可以把這個外帶嗎？'],
['衣','put on','穿上','Put on your jacket.','穿上你的外套。'],
['住','take out','拿出去','Please take out the trash.','請把垃圾拿出去。'],
['行','get off','下車','We get off here.','我們在這裡下車。'],
['育','write down','寫下來','Write down your name.','寫下你的名字。'],
['樂','take a walk','散步','Let’s take a walk.','我們去散步吧。'],
['食','fill up','裝滿','Please fill up my glass.','請把我的杯子裝滿。'],
['衣','take off','脫下','Take off your shoes.','脫下你的鞋子。'],
['住','turn off','關掉','Please turn off the light.','請把燈關掉。'],
['行','pick up','接人','Can you pick me up?','你可以來接我嗎？'],
['育','go over','複習','Let’s go over the lesson.','我們來複習這一課吧。'],
['樂','have fun','玩得開心','Have fun at the party!','祝你在派對玩得開心！'],
['食','help yourself','請自取','Help yourself to some fruit.','請自行取用水果。'],
['衣','dress up','盛裝打扮','Let’s dress up tonight.','我們今晚打扮漂亮一點吧。'],
['住','turn on','打開','Please turn on the fan.','請打開電風扇。'],
['行','slow down','慢下來','Please slow down.','請慢一點。'],
['育','keep trying','繼續嘗試','Keep trying. You can do it.','繼續試，你做得到。'],
['樂','join in','加入活動','Can I join in?','我可以一起參加嗎？'],
['食','cut up','切成小塊','Please cut up the apple.','請把蘋果切成小塊。'],
['衣','zip up','拉上拉鍊','Zip up your jacket.','把外套的拉鍊拉上。'],
['住','put away','收好','Put away your books.','把你的書收好。'],
['行','look out','小心','Look out for cars.','小心來車。'],
['育','read aloud','大聲朗讀','Please read aloud.','請大聲朗讀。'],
['樂','take a break','休息一下','Let’s take a break.','我們休息一下吧。']];
const box=document.createElement('section');box.className='card';box.style.marginBottom='20px';box.innerHTML='<h2>每日生活一句</h2><p id="dailyDate" class="notice"></p><h3 id="dailyPhrase"></h3><p id="dailySentence"></p><p id="dailyChinese"></p><div class="toolbar"><button id="dailyPhrasePlay">▶ 聽片語</button><button id="dailySentencePlay">▶ 聽短句</button><button id="dailySlow">慢速短句</button></div><label>跟讀內容 <select id="dailyTarget"><option value="0">片語</option><option value="1">短句</option></select></label><div class="toolbar"><button id="dailyStart">開始語音辨識</button><button id="dailyStop" disabled>停止辨識</button></div><p id="dailyStatus" role="status"></p><p id="dailyResult" aria-live="polite"></p><p class="notice">每日依裝置日期更新，30 天輪替複習。辨識文字相符程度不等於發音評分；語音可能由瀏覽器服務處理，需要網路及麥克風權限。</p>';
const anchor=document.querySelector('.font-settings');anchor?anchor.after(box):document.querySelector('main').prepend(box);
const $=id=>box.querySelector('#'+id),SR=window.SpeechRecognition||window.webkitSpeechRecognition;let row,day='',active=null,epoch=0,timer;
function cancel(){epoch++;clearTimeout(timer);if(active)try{active.abort()}catch{}active=null;$('dailyStart').disabled=!SR;$('dailyStop').disabled=true}
function update(){const d=new Date(),key=d.toLocaleDateString();if(key===day)return;cancel();day=key;const n=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);row=rows[((n-20772)%rows.length+rows.length)%rows.length];$('dailyDate').textContent=key+' · '+row[0];$('dailyPhrase').textContent=row[1]+' — '+row[2];$('dailySentence').textContent=row[3];$('dailyChinese').textContent=row[4];$('dailyResult').textContent='';$('dailyStatus').textContent=SR?'先聽示範，再開始跟讀。':'此瀏覽器不支援語音辨識，請改用支援的 Safari 或 Chrome。'}
function play(text,rate){cancel();window.dispatchEvent(new CustomEvent('reading-play',{detail:{text,rate}}));$('dailyStatus').textContent='播放狀態請見頁面語音提示。'}
$('dailyPhrasePlay').onclick=()=>play(row[1],.85);$('dailySentencePlay').onclick=()=>play(row[3],.85);$('dailySlow').onclick=()=>play(row[3],.65);
$('dailyStart').onclick=()=>{update();if(!SR)return;if(!document.getElementById('stopRecord').disabled){$('dailyStatus').textContent='請先停止課程錄音。';return}cancel();window.speechCompare?.cancel(false);window.dispatchEvent(new Event('reading-stop'));const target=row[$('dailyTarget').value==='0'?1:3],token=++epoch;let transcript='';try{const r=new SR();active=r;r.lang='en-US';r.interimResults=true;r.continuous=false;$('dailyStart').disabled=true;$('dailyStop').disabled=false;$('dailyResult').textContent='';$('dailyStatus').textContent='請允許麥克風權限…';r.onstart=()=>{if(token===epoch)$('dailyStatus').textContent='正在聆聽：'+target};r.onresult=e=>{if(token!==epoch)return;transcript=Array.from(e.results).map(x=>x[0].transcript).join(' ');$('dailyResult').textContent='辨識文字：'+transcript};r.onerror=e=>{if(token!==epoch)return;cancel();$('dailyStatus').textContent=e.error==='not-allowed'?'未取得麥克風權限，請允許後重試。':e.error==='no-speech'?'沒有聽到聲音，請再試一次。':'辨識未完成，請檢查網路與麥克風後重試。'};r.onend=()=>{if(token!==epoch)return;cancel();if(transcript){const result=window.speechCompare.compare(target,transcript);$('dailyResult').textContent='目標：'+target+'\n辨識文字：'+transcript+'\n文字相符程度：'+result.score+'%';$('dailyResult').style.whiteSpace='pre-line';$('dailyStatus').textContent=result.score===100?'文字相符！可以再練一次短句。':'請聽示範，再試一次。'}else $('dailyStatus').textContent='未取得辨識文字，請再試一次。'};r.start();timer=setTimeout(()=>{cancel();$('dailyStatus').textContent='辨識逾時，請重新開始。'},30000)}catch{cancel();$('dailyStatus').textContent='無法啟動辨識，請確認瀏覽器支援與權限。'}};
$('dailyStop').onclick=()=>{if(active)try{active.stop();$('dailyStop').disabled=true}catch{cancel()}};$('dailyTarget').onchange=()=>{cancel();$('dailyResult').textContent='';$('dailyStatus').textContent='已切換跟讀內容。'};
for(const event of ['reading-play','speech-compare-start','course-unit-change','pagehide'])window.addEventListener(event,cancel);document.getElementById('record').addEventListener('click',cancel);document.addEventListener('visibilitychange',()=>{cancel();if(!document.hidden)update()});setInterval(update,60000);update();
})();
