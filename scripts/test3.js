(() => {
    if (window.autoContinueLoaded) return;
    window.autoContinueLoaded = true;

    const KEY = "autoContinueSettings";

    let settings = JSON.parse(localStorage.getItem(KEY) || "{}");

    settings.delay = settings.delay || 1;
    settings.enabled = settings.enabled ?? true;

    let panel = document.createElement("div");
    panel.style.cssText = `
        position:fixed;
        top:20px;
        right:20px;
        width:220px;
        background:#111;
        color:#fff;
        padding:10px;
        border-radius:8px;
        font:13px Arial;
        z-index:999999999;
        box-shadow:0 0 10px #000;
    `;

    panel.innerHTML = `
        <b>Auto Continue</b><br><br>

        Затримка (хв):
        <input id="acDelay" type="number" min="0" value="${settings.delay}" style="width:60px"><br><br>

        <label>
            <input id="acEnabled" type="checkbox" ${settings.enabled ? "checked" : ""}>
            Увімкнено
        </label>

        <hr>

        <div id="acStatus">Очікування...</div>

        <small>Ctrl + Shift + H — сховати</small>
    `;

    document.body.appendChild(panel);

    const status = panel.querySelector("#acStatus");

    function save() {
        settings.delay = Number(panel.querySelector("#acDelay").value);
        settings.enabled = panel.querySelector("#acEnabled").checked;
        localStorage.setItem(KEY, JSON.stringify(settings));
    }

    panel.querySelector("#acDelay").oninput = save;
    panel.querySelector("#acEnabled").onchange = save;

    let running = false;

    function findTextNode(text) {
        return [...document.querySelectorAll("*")]
            .find(el => el.innerText && el.innerText.includes(text));
    }

    setInterval(() => {

        if (!settings.enabled) return;
        if (running) return;

        const textElement = findTextNode("Kontynuuj [Enter]");

        if (!textElement) {
            status.innerHTML = "Очікування тексту...";
            return;
        }

        running = true;

        let seconds = settings.delay * 60;

        let timer = setInterval(() => {

            status.innerHTML = `Натискання через ${seconds} с`;

            if (seconds <= 0) {

                clearInterval(timer);

                let button =
                    textElement.closest("div")?.querySelector("button,input[type=button],input[type=submit]") ||
                    document.querySelector("button,input[type=button],input[type=submit]");

                if (button) {
                    button.click();
                    status.innerHTML = "✅ Натиснуто";
                } else {
                    status.innerHTML = "❌ Кнопку не знайдено";
                }

                running = false;

            }

            seconds--;

        },1000);

    },1000);

    document.addEventListener("keydown",e=>{

        if(e.ctrlKey && e.shiftKey && e.code==="KeyH"){
            panel.style.display =
                panel.style.display==="none" ? "block" : "none";
        }

    });

})();