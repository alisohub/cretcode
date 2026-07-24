(() => {
  if (window.autoPrzypiszLpnV1sanyaloh) return;
  window.autoPrzypiszLpnV1sanyaloh = true;

  let cooldownUntil = 0;
  const TARGET_TEXTS = ['перепризначте lpn', 'przypisz ponownie lpn'];

  function findLpnButton() {
    const buttons = document.querySelectorAll('button, a, div[role="button"]');
    for (const el of buttons) {
      if (el.disabled || el.offsetParent === null || !el.textContent) continue;
      const text = el.textContent.toLowerCase().replace(/\s+/g, ' ');
      if (TARGET_TEXTS.some(target => text.includes(target))) {
        return el;
      }
    }
    return null;
  }

  function checkInputAndTrigger() {
    const now = Date.now();
    if (now < cooldownUntil) return;

    const btn = findLpnButton();
    if (!btn) {
      cooldownUntil = now + 1000;
      return;
    }

    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled])');

    for (const input of inputs) {
      if (input.offsetParent === null) continue;

      // 1. Get raw value, remove non-printable/invisible characters, lowercase, trim
      let cleanValue = input.value
        .replace(/[^\x20-\x7E]/g, '') // Strip hidden/control characters
        .trim()
        .toLowerCase();

      if (cleanValue === "") continue;

      // 2. Check the first character directly
      const firstChar = cleanValue.charAt(0);

      // If first character is 't', '1', or '0', SKIP
      if (firstChar === 't' || firstChar === '1' || firstChar === '0' || firstChar === '2' ) {
        continue;
      }

      // 3. Otherwise, trigger
      cooldownUntil = now + 1000;
      alert(`Triggered by value: "${input.value}" (Cleaned: "${cleanValue}")`);
      btn.click();
      break;
    }
  }

  setInterval(checkInputAndTrigger, 80);
  alert('✅ Skrypt Auto-Przypisz LPN (Sanitized) uruchomiony!');
})();
