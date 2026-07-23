(() => {
  if (window.autoPrzypiszLpnV1) return;
  window.autoPrzypiszLpnV1 = true;

  let cooldownUntil = 0;
  let hadInputLastCheck = false;

  // Phrases to look for in the button text
  const TARGET_TEXTS = ['перепризначте lpn', 'przypisz ponownie lpn'];

  function findLpnButton() {
    return Array.from(document.querySelectorAll('button, a, div[role="button"]')).find(el => {
      if (!el.textContent) return false;
      const text = el.textContent.toLowerCase();
      return TARGET_TEXTS.some(target => text.includes(target));
    });
  }

  function checkInputAndTrigger() {
    const now = Date.now();

    // 1. Check if we are currently in the 15-second sleep period
    if (now < cooldownUntil) return;

    // 2. Button check: Only proceed if a matching button is visible and enabled
    const btn = findLpnButton();
    const isBtnVisible = btn && !btn.disabled && btn.offsetParent !== null;

        // Optional modification: Sleep 10s if button is missing
    if (!isBtnVisible) {
      cooldownUntil = Date.now() + 10000;
      return;
    }


    // 3. Find visible input fields on the page
    const inputs = Array.from(
      document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')
    ).filter(input => input.offsetParent !== null && !input.disabled);

    // 4. Inspect input values
    for (const input of inputs) {
      const value = input.value.trim();

      // Skip empty fields
      if (value === "") continue;

      // If text DOES NOT start with 't' or 'T', trigger click and enter 10s cooldown
      if (!value.toLowerCase().startsWith('t')) {
        btn.click();
        cooldownUntil = Date.now() + 10000; // Sleep for 15 seconds
        break;
      }
    }
  }

  // Poll every 50ms
  setInterval(checkInputAndTrigger, 100);

  alert('✅ Skrypt Auto-Przypisz LPN (Multilingual + 10s Cooldown) uruchomiony!');
})();
