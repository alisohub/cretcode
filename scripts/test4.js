(() => {
  if (window.autoPrzypiszLpnV1sanyaloh) return;
  window.autoPrzypiszLpnV1sanyaloh = true;

  let cooldownUntil = 0;
  
  const TARGET_TEXTS = ['перепризначте lpn', 'przypisz ponownie lpn'];
  const IGNORED_PREFIXES = new Set(['t', '1', '0', '2']);

  // Locate visible, enabled target button
  function findLpnButton() {
    const selector = 'button, a, div[role="button"]';
    return Array.from(document.querySelectorAll(selector)).find(el => {
      if (el.disabled || el.offsetParent === null || !el.textContent) return false;
      const text = el.textContent.toLowerCase().replace(/\s+/g, ' ');
      return TARGET_TEXTS.some(target => text.includes(target));
    });
  }

  function checkInputAndTrigger() {
    const now = Date.now();
    if (now < cooldownUntil) return;

    const btn = findLpnButton();
    if (!btn) {
      cooldownUntil = now + 1500; // Pause briefly if button is missing
      return;
    }

    const inputSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled])';
    const inputs = document.querySelectorAll(inputSelector);

    for (const input of inputs) {
      if (input.offsetParent === null) continue;

      // Clean invisible scanner control chars and whitespace
      const cleanValue = input.value.replace(/[^\x20-\x7E]/g, '').trim().toLowerCase();
      if (!cleanValue) continue;

      // Trigger 15s cooldown on any non-empty input
      cooldownUntil = now + 15000;

      // Click only if first character is not in the ignored list
      if (!IGNORED_PREFIXES.has(cleanValue.charAt(0))) {
        btn.click();
      }

      break;
    }
  }

  setInterval(checkInputAndTrigger, 80);
  alert('✅ Skrypt Auto-Przypisz LPN uruchomiony!');
})();
