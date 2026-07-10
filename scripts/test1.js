(() => {
  if (window.autoPrzypiszLpnV1) return;
  window.autoPrzypiszLpnV1 = true;

  function autoClickLpn() {
    const btn = Array.from(document.querySelectorAll('button, a, div[role="button"]')).find(
      el => el.textContent && el.textContent.toLowerCase().includes('przypisz ponownie lpn')
    );

    if (btn && !btn.disabled && btn.offsetParent !== null) {
        btn.click();
    }
  }

  setInterval(autoClickLpn, 1000);
  
  alert('✅ Skrypt Auto-Przypisz LPN uruchomiony!');
})();

