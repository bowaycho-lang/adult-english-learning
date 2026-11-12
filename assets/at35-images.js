(() => {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  window.learningImage = function(word, description = '觀察圖片') {
    const data = window.AT35_DATA.words[word];
    const box = document.createElement('div'); box.className = 'learning-picture';
    if (!word) { box.textContent = '練習完成'; box.classList.add('complete-picture'); return box; }
    const img = document.createElement('img');
    img.src = './assets/at35/' + (data?.asset || word.toLowerCase().replaceAll(' ', '-')) + '.webp';
    img.alt = description; img.width = 960; img.height = 640; img.decoding = 'async';
    box.append(img);
    if (days.includes(word) || months.includes(word)) {
      const label = document.createElement('span'); label.className = 'calendar-label';
      label.textContent = data.calendar; box.append(label);
    }
    img.addEventListener('error', () => {box.classList.add('image-error');box.setAttribute('data-image-error','true');});
    return box;
  };
})();
