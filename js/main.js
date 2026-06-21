// Зберігаємо код Tampermonkey глобально для кнопки копіювання
let tampermonkeyRawCode = "";

document.addEventListener("DOMContentLoaded", async () => {
  
  // Функція для створення букмарклету
  function makeBookmarklet(rawCode) {
    let cleanCode = rawCode.replace(/\s+/g, ' ').trim();
    cleanCode = cleanCode.replace(/%/g, '%25').replace(/#/g, '%23').replace(/&/g, '%26').replace(/\+/g, '%2B');
    return "javascript:" + cleanCode;
  }

  try {
    // Асинхронно завантажуємо всі скрипти з папки scripts/
    const [cretRes, cdPlRes, cdUaRes, tmRes] = await Promise.all([
      fetch('scripts/cret.js'),
      fetch('scripts/clean-decant-pl.js'),
      fetch('scripts/clean-decant-ua.js'),
      fetch('scripts/tampermonkey.js')
    ]);

    // Отримуємо текст
    const cretRaw = await cretRes.text();
    const cdPlRaw = await cdPlRes.text();
    const cdUaRaw = await cdUaRes.text();
    tampermonkeyRawCode = await tmRes.text(); // Зберігаємо для копіювання

    // Призначаємо букмарклети кнопкам
    const btnCret = document.getElementById('cret-bookmark-btn');
    if(btnCret) { 
      btnCret.href = makeBookmarklet(cretRaw); 
      btnCret.textContent = "🔖 Przeciągnij do paska zakładek"; 
    }

    const btnCdPl = document.getElementById('cd-pl-bookmark-btn');
    if(btnCdPl) { 
      btnCdPl.href = makeBookmarklet(cdPlRaw); 
      btnCdPl.textContent = "🔖 Przeciągnij do paska (\ud83c\uddf5\ud83c\uddf1)"; 
    }

    const btnCdUa = document.getElementById('cd-ua-bookmark-btn');
    if(btnCdUa) { 
      btnCdUa.href = makeBookmarklet(cdUaRaw); 
      btnCdUa.textContent = "🔖 Перетягніть на панель (UA)"; 
    }

  } catch (error) {
    console.error("Помилка завантаження скриптів:", error);
    alert("Не вдалося завантажити скрипти. Переконайтеся, що ви використовуєте локальний сервер.");
  }
});

// Функція копіювання коду Tampermonkey
window.copyTampermonkeyCode = function() {
  const status = document.getElementById('status');
  
  if (!tampermonkeyRawCode) {
    status.textContent = '❌ Код ще не завантажено.';
    return;
  }
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(tampermonkeyRawCode).then(() => {
      status.textContent = '✅ Skopiowano! Wklej w Tampermonkey (Ctrl+S).';
      setTimeout(() => { status.textContent = ''; }, 5000);
    }).catch(e => {
      fallbackCopyTextToClipboard(tampermonkeyRawCode, status);
    });
  } else {
    fallbackCopyTextToClipboard(tampermonkeyRawCode, status);
  }
};

function fallbackCopyTextToClipboard(text, status) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    status.textContent = '✅ Skopiowano! Wklej w Tampermonkey (Ctrl+S).';
    setTimeout(() => { status.textContent = ''; }, 5000);
  } catch (err) {
    status.textContent = '❌ Błąd kopiowania. Zaznacz kod ręcznie.';
    setTimeout(() => { status.textContent = ''; }, 3000);
  }
  document.body.removeChild(textArea);
}
