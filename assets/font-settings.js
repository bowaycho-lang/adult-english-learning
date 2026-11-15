'use strict';
(()=>{
 const KEY='adultEnglishFontScaleV1',sizes=[.9,1,1.15,1.3,1.5];let scale=1;
 try{const v=Number(localStorage.getItem(KEY));if(sizes.includes(v))scale=v}catch{}
 const box=document.createElement('section');box.className='card font-settings';box.style.marginBottom='20px';
 box.innerHTML='<label for="courseFontSize">字體大小</label> <select id="courseFontSize"><option value="0.9">較小</option><option value="1">標準</option><option value="1.15">較大</option><option value="1.3">大</option><option value="1.5">特大</option></select> <button type="button" id="fontReset">恢復標準</button><p id="fontStatus" class="notice" role="status"></p>';
 document.querySelector('main').prepend(box);
 const select=box.querySelector('select'),status=box.querySelector('#fontStatus');
 function apply(save){document.documentElement.style.setProperty('--font-scale',String(scale));select.value=String(scale);status.textContent='字體大小：'+Math.round(scale*100)+'%';if(save)try{localStorage.setItem(KEY,String(scale))}catch{status.textContent+='（此瀏覽器無法保存設定）'}}
 select.onchange=()=>{scale=Number(select.value);apply(true)};box.querySelector('button').onclick=()=>{scale=1;apply(true)};apply(false);
})();
