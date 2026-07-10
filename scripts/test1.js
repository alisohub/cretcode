(() => {
  if (window.autoPrzypiszLpnV1) return;
  window.autoPrzypiszLpnV1 = true;

  let lastClickTime = 0;

  function autoClickLpn() {
    const now = Date.now();
    
    // Якщо з моменту останнього кліку пройшло менше 3 секунд — нічого не робимо
    if (now - lastClickTime < 3000) return; 

    const btn = Array.from(document.querySelectorAll('button, a, div[role="button"]')).find(
      el => el.textContent && el.textContent.toLowerCase().includes('przypisz ponownie lpn')
    );

    if (btn && !btn.disabled && btn.offsetParent !== null) {
        btn.click();
        lastClickTime = Date.now(); // Запам'ятовуємо час кліку
    }
  }

  setInterval(autoClickLpn, 1000);
  
  alert('✅ Skrypt Auto-Przypisz LPN (z blokadą spamu) uruchomiony!');
})();
