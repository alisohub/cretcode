(() => {
  if (window.scanCounterV29) return;
  window.scanCounterV29 = true;
  document.querySelectorAll('[data-reit-counter]').forEach((el) => el.remove());

  const saveKey = 'scanCounterV29State';
  const technoFont = 'Consolas,"Lucida Console","Courier New",monospace';
  const uiFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const dayHours = ['7:30', '8:30', '9:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:00'];
  const nightHours = ['19:30', '20:30', '21:30', '22:30', '23:30', '00:30', '1:30', '2:30', '3:30', '4:30', '5:00'];
  const currentHour = new Date().getHours();
  const night = currentHour >= 17 || currentHour < 5;
  const hours = night ? nightHours : dayHours;
  const shiftName = night ? 'night' : 'day';

  let total = 0, problemTotal = 0, seen = '', start = Date.now(), lastTrigger = '-';
  let targetPerHour = 28, beforeBreak = 0, open = true, grace = 4 * 60 * 1000, selectedBreak = 1;
  let offRemain = 30 * 60 * 1000, lastActivityTime = Date.now(), offLastTick = Date.now();
  let triggerText = 'Wprowadź pojemnik', problemText = 'Zeskanuj - PROBLEM-SOLVE', nlpText = 'Zeskanuj nowy NLP';
  let skipNextPack = false, showRatePercent = false, showLeftInsteadTotal = false, autoStatusColor = false, ignoreNLP = false;
  let manualColor = '#808080', miniOpacity = 100, miniSize = 13, miniPos = 'tl', hourCounts = {}, problemCounts = {}, lastSave = 0;

  function initCounts() { hours.forEach((h) => { if (hourCounts[h] == null) hourCounts[h] = 0; if (problemCounts[h] == null) problemCounts[h] = 0; }); }

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(saveKey) || '{}');
      if (s.shift && s.shift !== shiftName) { initCounts(); return; }
      start = Number(s.start) || Date.now();
      problemTotal = Math.max(0, parseInt(s.problemTotal) || 0);
      beforeBreak = Math.max(0, parseInt(s.beforeBreak) || 0);
      targetPerHour = Math.max(1, parseInt(s.targetPerHour) || 28);
      selectedBreak = s.selectedBreak !== undefined ? parseInt(s.selectedBreak) : 1;
      offRemain = Math.max(0, Number(s.offRemain) || 30 * 60 * 1000);
      showRatePercent = !!s.showRatePercent;
      showLeftInsteadTotal = !!s.showLeftInsteadTotal;
      autoStatusColor = !!s.autoStatusColor;
      ignoreNLP = !!s.ignoreNLP;
      manualColor = s.manualColor || '#808080';
      miniPos = s.miniPos || 'tl';
      miniOpacity = Math.min(100, Math.max(0, s.miniOpacity !== undefined ? parseInt(s.miniOpacity) : 100));
      miniSize = Math.min(45, Math.max(10, parseInt(s.miniSize) || 13));
      hourCounts = {}; problemCounts = {};
      hours.forEach((h) => {
        hourCounts[h] = Math.max(0, parseInt(s.hourCounts && s.hourCounts[h]) || 0);
        problemCounts[h] = Math.max(0, parseInt(s.problemCounts && s.problemCounts[h]) || 0);
      });
      lastTrigger = s.lastTrigger || 'PRZYWRÓCONO';
    } catch (_) { initCounts(); }
  }

  function saveState(force) {
    const now = Date.now();
    if (!force && now - lastSave < 1500) return;
    lastSave = now;
    try { localStorage.setItem(saveKey, JSON.stringify({ shift: shiftName, savedAt: now, start, problemTotal, beforeBreak, targetPerHour, selectedBreak, offRemain, showRatePercent, showLeftInsteadTotal, autoStatusColor, ignoreNLP, manualColor, miniOpacity, miniSize, miniPos, hourCounts, problemCounts, lastTrigger })); } catch (_) {}
  }

  loadState(); initCounts();

  function getBreakTimestamps() {
    if (selectedBreak === 0) return {start: 0, end: 0};
    const times = night ? [{h:23,m:20}, {h:23,m:50}, {h:0,m:20}, {h:0,m:50}] : [{h:11,m:20}, {h:11,m:50}, {h:12,m:20}, {h:12,m:50}];
    const t = times[selectedBreak - 1];
    let d = new Date(); d.setHours(t.h, t.m, 0, 0);
    if (night) {
      let ch = new Date().getHours();
      if (ch >= 17 && t.h < 12) d.setDate(d.getDate() + 1);
      if (ch < 12 && t.h >= 17) d.setDate(d.getDate() - 1);
    }
    let startTs = d.getTime();
    return { start: startTs, end: startTs + 30 * 60000 };
  }

  function isBreakActive() {
    if (selectedBreak === 0) return false;
    let bt = getBreakTimestamps();
    let now = Date.now();
    return now >= bt.start && now < bt.end;
  }

  function getActiveHours() {
    let ms = Date.now() - start;
    if (selectedBreak > 0) {
      let bt = getBreakTimestamps();
      let overlap = 0;
      if (start < bt.end && Date.now() > bt.start) {
        let startOverlap = Math.max(start, bt.start);
        let endOverlap = Math.min(Date.now(), bt.end);
        overlap = Math.max(0, endOverlap - startOverlap);
      }
      ms -= overlap;
    }
    return ms > 0 ? ms / 3600000 : 0;
  }

  const box = document.createElement('div');
  box.setAttribute('data-reit-counter', 'mini');
  box.style = 'position:fixed;background:rgba(255,255,255,0.85);backdrop-filter:blur(10px);color:' + manualColor + ';padding:6px 12px;font-size:' + miniSize + 'px;font-family:' + technoFont + ';z-index:999999;border-radius:12px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 4px 12px rgba(0,0,0,0.05);opacity:' + (miniOpacity / 100) + ';cursor:pointer;user-select:none;font-weight:900;';

  function applyMiniPos() {
    box.style.top = 'auto'; box.style.bottom = 'auto'; box.style.left = 'auto'; box.style.right = 'auto';
    if (miniPos === 'bl') { box.style.bottom = '34px'; box.style.left = '300px'; }
    if (miniPos === 'br') { box.style.bottom = '34px'; box.style.right = '360px'; }
    if (miniPos === 'tl') { box.style.top = '10px'; box.style.left = '300px'; }
    if (miniPos === 'tr') { box.style.top = '10px'; box.style.right = '360px'; }
  }
  applyMiniPos(); document.body.appendChild(box);

  const panel = document.createElement('div');
  panel.setAttribute('data-reit-counter', 'panel');
  panel.style = 'position:fixed;top:65px;bottom:24px;right:20px;background:rgba(250, 251, 252, 0.85);color:#1c1c1e;padding:20px;border-radius:24px;border:1px solid rgba(255,255,255,0.9);z-index:999999;font-family:' + uiFont + ';width:360px;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 20px 40px -10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1);scrollbar-width:none;transform:translateX(0);opacity:1;pointer-events:auto;transition:transform .4s cubic-bezier(0.16, 1, 0.3, 1),opacity .4s ease;';

  panel.innerHTML = `
  <div id="mainView" style="width:100%; box-sizing:border-box;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div id="mainTitle" style="font-size:22px; font-weight:800; letter-spacing:-0.5px; color:#0f172a;">C-RET</div>
      <button id="settingsBtn" title="Ustawienia" style="width:36px; height:36px; border:1px solid rgba(0,0,0,0.05); border-radius:12px; background:#fff; color:#475569; font-size:16px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.02); transition:all 0.2s;">⚙️</button>
    </div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
      <div style="background:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.9); border-radius:16px; padding:12px; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <div style="font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Останній Trigger</div>
        <div id="lt" style="font-size:12px; font-weight:700; color:#334155; word-break:break-all; line-height:1.3; font-family:${technoFont};">-</div>
      </div>
      <div style="background:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.9); border-radius:16px; padding:12px; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <div style="font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Off Task</div>
        <div id="off" style="font-size:20px; font-weight:800; color:#10b981; font-family:${technoFont};">30:00</div>
      </div>
    </div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
      <div style="background:#fef2f2; border:1px solid #fee2e2; border-radius:16px; padding:16px 12px; text-align:center;">
        <div style="font-size:11px; font-weight:700; color:#ef4444; opacity:0.9; margin-bottom:4px; letter-spacing:0.5px; text-transform:uppercase;">Problem</div>
        <div id="pb" style="font-size:28px; font-weight:800; color:#ef4444; font-family:${technoFont};">0</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #dbeafe; border-radius:16px; padding:16px 12px; text-align:center;">
        <div style="font-size:11px; font-weight:700; color:#2563eb; opacity:0.9; margin-bottom:4px; letter-spacing:0.5px; text-transform:uppercase;">Pozostało</div>
        <div id="left" style="font-size:28px; font-weight:800; color:#2563eb; font-family:${technoFont};">0</div>
      </div>
    </div>
    
    <div id="hours" style="width:100%; box-sizing:border-box;"></div>
  </div>

  <div id="settingsView" style="display:none; width:100%; box-sizing:border-box;">
    <div style="display:flex; align-items:center; margin-bottom:20px;">
      <button id="backBtn" title="Powrót" style="width:36px; height:36px; border:1px solid rgba(0,0,0,0.05); border-radius:12px; background:#fff; color:#475569; font-size:18px; cursor:pointer; margin-right:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.02);">‹</button>
      <div style="font-size:1
