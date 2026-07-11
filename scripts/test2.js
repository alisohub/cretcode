(() => {
  if (window.multiClickerKeyV1) return;
  window.multiClickerKeyV1 = true;

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.code === 'KeyX') {
      const targets = ['Brak plomby', 'Nieprzezroczyste pudełko', 'Brak', 'Nie'];
      const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span, label, input[type="radio"]'));
      
      targets.forEach(target => {
        const btn = elements.find(el => {
          if (!el.textContent || el.offsetParent === null) return false;
          const text = el.textContent.trim().toLowerCase();
          const search = target.toLowerCase();
          return (search === 'nie' || search === 'brak') ? text === search : text.includes(search);
        });
        if (btn) btn.click();
      });
    }
  });

  alert('✅ Skrypt aktywny: naciśnij Alt + X');
})();

