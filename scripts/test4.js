(() => {
  if (window.autoPrzypiszLpnV1sanyaloh) return;
  window.autoPrzypiszLpnV1sanyaloh = true;

  let cooldownUntil = 0;

  // Phrases to match against button text
  const TARGET_TEXTS = ['перепризначте lpn', 'przypisz ponownie lpn'];

  // Helper to find visible, enabled target button
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

    // 1. Check if we are currently in cooldown
    if (now < cooldownUntil) return;

    // 2. Ensure button is present on screen
    const btn = findLpnButton();
    if (!btn) {
      cooldownUntil = now + 1500; // Pause for 1.5s if button is missing
      return;
    }

    // 3. Find visible, active text inputs
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled])');

    for (const input of inputs) {
      if (input.offsetParent === null) continue; // Skip hidden inputs

      const value = input.value.trim();

      // Skip empty input fields
      if (value === "") continue;

      cooldownUntil = now + 15000;
      // 4. Trigger only if value does NOT start with 't' or 'T'
      if (!value.toLowerCase().startsWith('t')) {
        alert(value);
        btn.click();
        break;
      }
    }
  }

  // Poll every 80ms for fast reaction time without CPU strain
  setInterval(checkInputAndTrigger, 80);

  alert('✅ Skrypt Auto-Przypisz LPN uruchomiony!');
})();
