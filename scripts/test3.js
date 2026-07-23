(() => {
  if (window.autoPrzypiszLpnV1) return;
  window.autoPrzypiszLpnV1 = true;

  let lastClickTime = 0;

  function autoClickLpn() {
    const now = Date.now();
    
    if (now - lastClickTime < 8000) return; 

    const btn = Array.from(document.querySelectorAll('button, a, div[role="button"]')).find(
      el => el.textContent && el.textContent.toLowerCase().includes('перепризначте lpn')
    );

    if (btn && !btn.disabled && btn.offsetParent !== null) {
        btn.click();
        lastClickTime = Date.now();
    }
  }

  setInterval(autoClickLpn, 15000);
  
  alert('✅ Skrypt Auto-Przypisz LPN (15s pauzy) uruchomiony!');
})();
