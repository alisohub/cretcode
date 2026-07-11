(() => {
  if (window.autoMultiClickerV1) return;
  window.autoMultiClickerV1 = true;

  function clickTargets() {
    const targets = ['Brak plomby', 'Nieprzezroczyste pudełko', 'Brak', 'Nie'];
    const elements = Array.from(document.querySelectorAll('button:not([data-ac]), a:not([data-ac]), div[role="button"]:not([data-ac]), span:not([data-ac]), label:not([data-ac]), input[type="radio"]:not([data-ac])'));
    
    targets.forEach(target => {
      const btn = elements.find(el => {
        if (!el.textContent || el.offsetParent === null) return false;
        const text = el.textContent.trim().toLowerCase();
        const search = target.toLowerCase();
        return (search === 'nie' || search === 'brak') ? text === search : text.includes(search);
      });
      
      if (btn) {
        btn.click();
        btn.setAttribute('data-ac', 'true');
      }
    });
  }

  setInterval(clickTargets, 1000);
  alert('✅ Skrypt Auto-Clicker uruchomiony!');
})();

