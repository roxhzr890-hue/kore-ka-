// ============================================================
// KORE'DEN KAÇIŞ — Oyun Dosyası
// BÖLÜM A: Sistemler (kaydet, başarım, yetenek, envanter, menü)
// ============================================================

// ---------- KAYDET / YÜKLE ----------
const SAVE_KEY = 'koreSave_v2';
const PROFILE_KEY = 'koreProfile_v2';

function saveGame() {
  try {
    const data = {
      chapter: game.chapter,
      difficulty: game.difficulty,
      money: game.money,
      energy: game.energy,
      caughtCount: game.caughtCount,
      timeOfDay: game.timeOfDay,
      inventory: game.inventory,
      relations: game.relations,
      skills: game.skills,
      examScore: game.examScore,
      examTotal: game.examTotal,
      friendSaved: game.friendSaved,
      familySecretFound: game.familySecretFound,
      routesTried: game.routesTried,
      unlockedAchievements: game.unlockedAchievements,
      playerName: game.playerName,
      playerCharName: game.playerCharName,
      playerX: players[0]?.x || 300,
      playerY: players[0]?.y || 300,
      charData: { ...charData },
      gameFlags: game.gameFlags,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    game.chapter = d.chapter || 0;
    game.difficulty = d.difficulty || 'easy';
    game.money = d.money || 0;
    game.energy = d.energy || 100;
    game.caughtCount = d.caughtCount || 0;
    game.timeOfDay = d.timeOfDay || 22;
    game.inventory = d.inventory || [];
    game.relations = d.relations || { mother: 50, father: 50, friend: 0 };
    game.skills = d.skills || { speed: 0, stealth: 0, stamina: 0, health: 0, charisma: 0 };
    game.examScore = d.examScore || 0;
    game.examTotal = d.examTotal || 0;
    game.friendSaved = d.friendSaved || false;
    game.familySecretFound = d.familySecretFound || false;
    game.routesTried = d.routesTried || [];
    game.unlockedAchievements = d.unlockedAchievements || [];
    game.playerName = d.playerName || 'Oyuncu';
    game.playerCharName = d.playerCharName || 'Oyuncu';
    game.gameFlags = d.gameFlags || {};
    if (d.charData) Object.assign(charData, d.charData);
    return d;
  } catch (e) { return false; }
}

function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
  hideElement('btn-continue');
}

// ---------- PROFİL ----------
function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { name: 'Oyuncu', escapes: 0, bestMoney: 0 };
    return JSON.parse(raw);
  } catch (e) { return { name: 'Oyuncu', escapes: 0, bestMoney: 0 }; }
}

function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
}

function updateProfileCard() {
  const p = loadProfile();
  const nameEl = document.getElementById('profile-name');
  const statsEl = document.getElementById('profile-stats');
  if (nameEl) nameEl.textContent = p.name;
  if (statsEl) statsEl.textContent = `🏆 ${p.escapes} kaçış | 💰 ${p.bestMoney} ₩ rekor`;
}

function recordProfile(escape, money) {
  const p = loadProfile();
  if (escape) p.escapes++;
  if (money > p.bestMoney) p.bestMoney = money;
  p.name = game.playerName;
  saveProfile(p);
  updateProfileCard();
}

// ---------- BAŞARIM SİSTEMİ ----------
function unlockAchievement(id) {
  if (game.unlockedAchievements.includes(id)) return;
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;
  game.unlockedAchievements.push(id);
  showAchievementToast(ach);
  sfx.achievement();
}

function showAchievementToast(ach) {
  const toast = document.getElementById('achievement-toast');
  document.getElementById('ach-icon').textContent = ach.icon;
  document.getElementById('ach-title').textContent = LANG[game.lang].achievement;
  document.getElementById('ach-desc').textContent = ach.title + ' — ' + ach.desc;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ---------- YETENEK AĞACI UI ----------
function showSkillTree() {
  showElement('skills-screen');
  renderSkillTree();
}

function renderSkillTree() {
  const t = LANG[game.lang];
  document.getElementById('skills-money').textContent = `💰 ${t.money}: ${Math.floor(game.money)} ₩`;
  const list = document.getElementById('skills-list');
  list.innerHTML = '';
  for (const sk of SKILLS) {
    const level = game.skills[sk.id] || 0;
    const cost = sk.baseCost + level * sk.baseCost;
    const maxed = level >= sk.maxLevel;
    const canAfford = game.money >= cost && !maxed;

    const div = document.createElement('div');
    div.className = 'skill-entry';
    div.innerHTML = `
      <div class="skill-info">
        <div class="skill-name">${sk.icon} ${sk.name}</div>
        <div class="skill-desc">${sk.desc}</div>
      </div>
      <div class="skill-level">${level}/${sk.maxLevel}</div>
      <button ${canAfford ? '' : 'disabled'} data-skill="${sk.id}" data-cost="${cost}">
        ${maxed ? 'MAX' : `${cost} ₩`}
      </button>
    `;
    list.appendChild(div);
  }
  list.querySelectorAll('button[data-skill]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.skill;
      const cost = parseInt(btn.dataset.cost);
      const sk = SKILLS.find(s => s.id === id);
      if (game.money >= cost && (game.skills[id] || 0) < sk.maxLevel) {
        game.money -= cost;
        game.skills[id] = (game.skills[id] || 0) + 1;
        sfx.coin();
        renderSkillTree();
        updateHUD();
        const allMax = SKILLS.every(s => (game.skills[s.id] || 0) >= s.maxLevel);
        if (allMax) unlockAchievement('all_skills');
      }
    };
  });
}

document.getElementById('skills-close').onclick = () => hideElement('skills-screen');

// ---------- ENVANTER UI ----------
const ITEM_INFO = {
  'Sahte Kimlik': { desc: 'Asker kontrolünden geçmeni sağlar.', use: () => { game.gameFlags.fakeID = true; } },
  'Sınır Haritası': { desc: 'Kaçış rotasında yol gösterir.', use: () => { game.gameFlags.borderMap = true; } },
  'Para': { desc: 'Rüşvet için kullanılır.', use: () => {} },
  'Arkadaş': { desc: 'Yanında bir dost.', use: () => { game.friendSaved = true; } },
  'Telefon': { desc: 'Aileni arayabilirsin.', use: () => { changeRelation('mother', 10); } },
  'Bilet': { desc: 'Tren rotasında işe yarar.', use: () => { game.gameFlags.ticket = true; } },
};

function showInventory() {
  showElement('inventory-modal');
  renderInventory();
}

function renderInventory() {
  const t = LANG[game.lang];
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';
  if (game.inventory.length === 0) {
    list.innerHTML = `<p style="color:#666">${t.noItems}</p>`;
    return;
  }
  for (const item of game.inventory) {
    const info = ITEM_INFO[item] || { desc: 'Bilinmeyen eşya.', use: () => {} };
    const div = document.createElement('div');
    div.className = 'inventory-entry';
    div.innerHTML = `
      <div>
        <div style="color:#4affb0;font-weight:bold">${item}</div>
        <div style="font-size:11px;color:#888">${info.desc}</div>
      </div>
      <button data-item="${item}">${t.use}</button>
    `;
    list.appendChild(div);
  }
  list.querySelectorAll('button[data-item]').forEach(btn => {
    btn.onclick = () => {
      const item = btn.dataset.item;
      const info = ITEM_INFO[item];
      if (info && info.use) {
        info.use();
        sfx.coin();
        btn.textContent = '✓';
        btn.disabled = true;
      }
    };
  });
}

document.getElementById('inventory-close').onclick = () => hideElement('inventory-modal');

// ---------- DİYALOG SİSTEMİ ----------
function startDialogue(lines, callback) {
  game.dialogueQueue = lines;
  game.dialogueIndex = 0;
  game.dialogueCallback = callback;
  game.state = 'dialogue';
  showDialogueLine();
}

function showDialogueLine() {
  if (game.dialogueIndex >= game.dialogueQueue.length) {
    hideElement('dialogue-box');
    game.state = 'playing';
    if (game.dialogueCallback) { const cb = game.dialogueCallback; game.dialogueCallback = null; cb(); }
    return;
  }
  const line = game.dialogueQueue[game.dialogueIndex];
  document.getElementById('dialogue-speaker').textContent = line.speaker;
  document.getElementById('dialogue-text').textContent = line.text;
  document.getElementById('dialogue-hint').textContent = LANG[game.lang].continueBtn;
  drawPortrait(line.portrait || 'narrator');
  showElement('dialogue-box');
}

function advanceDialogue() {
  game.dialogueIndex++;
  showDialogueLine();
}

// ---------- SEÇİM SİSTEMİ ----------
function showChoice(question, options, callback) {
  game.state = 'choice';
  document.getElementById('choice-question').textContent = question;
  const container = document.getElementById('choice-options');
  container.innerHTML = '';
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = opt.text;
    btn.onclick = () => {
      hideElement('choice-box');
      game.state = 'playing';
      if (callback) callback(opt.value);
    };
    container.appendChild(btn);
  });
  showElement('choice-box');
}

// ---------- TELEFON ----------
function showPhoneCall(caller, message, onAnswer, onIgnore) {
  game.phoneActive = true;
  game.state = 'phone';
  document.getElementById('phone-caller').textContent = `📞 ${caller}`;
  document.getElementById('phone-message').textContent = message;
  showElement('phone-overlay');
  sfx.alert();
  game.lastPhoneTime = Date.now();

  document.getElementById('phone-answer').onclick = () => {
    hideElement('phone-overlay');
    game.phoneActive = false;
    game.state = 'playing';
    if (onAnswer) onAnswer();
  };
  document.getElementById('phone-ignore').onclick = () => {
    hideElement('phone-overlay');
    game.phoneActive = false;
    game.state = 'playing';
    if (onIgnore) onIgnore();
  };
}

// ---------- DİL / AYARLAR ----------
function applyLanguage() {
  const t = LANG[game.lang];
  document.getElementById('btn-start').textContent = t.newGame;
  document.getElementById('btn-continue').textContent = t.continue;
  document.getElementById('btn-multi').textContent = t.multi;
  document.getElementById('btn-scores').textContent = t.scores;
  document.getElementById('btn-settings').textContent = t.settings;
  document.getElementById('btn-confirm-char').textContent = t.startGame;
  document.getElementById('restart-btn').textContent = t.mainMenu;
  document.getElementById('settings-back').textContent = t.back;
  document.getElementById('scores-back').textContent = t.back;
  document.getElementById('share-btn').textContent = t.shareResult;
  document.querySelector('.player-name-row label').textContent = t.playerName;
  document.getElementById('p2-name-row').querySelector('label').textContent = t.player2Name;

  const st = LANG[game.lang];
  document.querySelector('#settings-screen h2').textContent = '⚙️ ' + st.settings;
  document.querySelectorAll('.setting-row')[0].querySelector('span').textContent = st.sound;
  document.querySelectorAll('.setting-row')[1].querySelector('span').textContent = st.volume;
  document.querySelectorAll('.setting-row')[2].querySelector('span').textContent = st.colorblind;
  document.querySelectorAll('.setting-row')[3].querySelector('span').textContent = st.language;
  document.querySelectorAll('.setting-row')[4].querySelector('span').textContent = st.touchControls;
  document.querySelectorAll('.setting-row')[5].querySelector('span').textContent = st.screenShake;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('koreSettings_v2');
    if (!raw) return;
    const s = JSON.parse(raw);
    game.soundOn = s.soundOn !== false;
    game.volume = s.volume ?? 0.5;
    game.colorblind = !!s.colorblind;
    game.lang = s.lang || 'tr';
    game.touchEnabled = !!s.touch;
    game.shakeEnabled = s.shake !== false;
    document.getElementById('set-sound').checked = game.soundOn;
    document.getElementById('set-volume').value = Math.round(game.volume * 100);
    document.getElementById('set-colorblind').checked = game.colorblind;
    document.getElementById('set-lang').value = game.lang;
    document.getElementById('set-touch').checked = game.touchEnabled;
    document.getElementById('set-shake').checked = game.shakeEnabled;
    document.body.classList.toggle('colorblind', game.colorblind);
    document.getElementById('touch-controls').classList.toggle('hidden', !game.touchEnabled);
    applyLanguage();
  } catch (e) {}
}

function saveSettings() {
  try {
    localStorage.setItem('koreSettings_v2', JSON.stringify({
      soundOn: game.soundOn, volume: game.volume, colorblind: game.colorblind,
      lang: game.lang, touch: game.touchEnabled, shake: game.shakeEnabled,
    }));
  } catch (e) {}
}

// ---------- SKOR TABLOSU ----------
function saveScore(ending, money, time) {
  try {
    const scores = JSON.parse(localStorage.getItem('koreScores_v2') || '[]');
    scores.push({
      name: game.playerName,
      charName: game.playerCharName,
      ending, money, time,
      date: new Date().toLocaleDateString('tr'),
      difficulty: game.difficulty,
    });
    scores.sort((a, b) => b.money - a.money);
    localStorage.setItem('koreScores_v2', JSON.stringify(scores.slice(0, 15)));
  } catch (e) {}
}

function showScores() {
  hideElement('main-menu');
  showElement('scores-screen');
  const list = document.getElementById('scores-list');
  try {
    const scores = JSON.parse(localStorage.getItem('koreScores_v2') || '[]');
    if (scores.length === 0) {
      list.innerHTML = '<p style="color:#666;text-align:center">Henüz skor yok. İlk sen oyna!</p>';
    } else {
      list.innerHTML = scores.map((s, i) =>
        `<div class="score-row">
          <span><span class="score-rank">#${i + 1}</span><span class="score-name">${s.name}</span> — ${s.ending}</span>
          <span>💰 ${s.money} ₩ | ⏱ ${s.time}s | ${s.difficulty}</span>
        </div>`
      ).join('');
    }
  } catch (e) { list.innerHTML = '<p style="color:#666">Skor yüklenemedi.</p>'; }
}

// ---------- MENÜ BAĞLANTILARI ----------
function initMenu() {
  initAudio();
  loadSettings();
  updateProfileCard();

  const playerNameInput = document.getElementById('inp-player-name');
  const player2NameInput = document.getElementById('inp-player2-name');
  const prof = loadProfile();
  if (playerNameInput) {
    playerNameInput.value = prof.name !== 'Oyuncu' ? prof.name : '';
    playerNameInput.oninput = (e) => {
      game.playerName = e.target.value || 'Oyuncu';
      const p = loadProfile();
      p.name = game.playerName;
      saveProfile(p);
      updateProfileCard();
    };
  }

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      game.difficulty = btn.dataset.diff;
    };
  });

  document.getElementById('btn-start').onclick = () => {
    game.twoPlayer = false;
    if (playerNameInput) game.playerName = playerNameInput.value || 'Oyuncu';
    document.getElementById('p2-name-row').classList.add('hidden');
    showCharCreate();
  };

  document.getElementById('btn-continue').onclick = () => {
    const d = loadGame();
    if (d) {
      resumeGame(d);
    }
  };

  document.getElementById('btn-multi').onclick = () => {
    game.twoPlayer = true;
    if (playerNameInput) game.playerName = playerNameInput.value || 'Oyuncu';
    const p2row = document.getElementById('p2-name-row');
    p2row.classList.remove('hidden');
    if (player2NameInput) game.player2Name = player2NameInput.value || 'Oyuncu 2';
    player2NameInput.oninput = (e) => { game.player2Name = e.target.value || 'Oyuncu 2'; };
    showCharCreate();
  };

  document.getElementById('btn-scores').onclick = showScores;
  document.getElementById('scores-back').onclick = () => {
    hideElement('scores-screen'); showElement('main-menu');
  };

  document.getElementById('btn-settings').onclick = () => {
    hideElement('main-menu'); showElement('settings-screen');
  };
  document.getElementById('settings-back').onclick = () => {
    hideElement('settings-screen'); showElement('main-menu');
  };

  document.getElementById('set-sound').onchange = (e) => { game.soundOn = e.target.checked; saveSettings(); };
  document.getElementById('set-volume').oninput = (e) => { game.volume = e.target.value / 100; saveSettings(); };
  document.getElementById('set-colorblind').onchange = (e) => {
    game.colorblind = e.target.checked;
    document.body.classList.toggle('colorblind', game.colorblind);
    saveSettings();
  };
  document.getElementById('set-lang').onchange = (e) => {
    game.lang = e.target.value;
    applyLanguage();
    saveSettings();
  };
  document.getElementById('set-touch').onchange = (e) => {
    game.touchEnabled = e.target.checked;
    document.getElementById('touch-controls').classList.toggle('hidden', !game.touchEnabled);
    saveSettings();
  };
  document.getElementById('set-shake').onchange = (e) => {
    game.shakeEnabled = e.target.checked;
    saveSettings();
  };

  document.getElementById('restart-btn').onclick = () => {
    hideElement('ending-screen');
    showElement('main-menu');
    game.state = 'menu';
    players = []; soldiers = []; markers = [];
    updateProfileCard();
    if (hasSave()) showElement('btn-continue');
  };

  if (hasSave()) {
    document.getElementById('btn-continue').classList.remove('hidden');
  }
}

// ---------- MOBİL KONTROLLER ----------
let joystick = { active: false, dx: 0, dy: 0, touchId: null };

function initTouchControls() {
  const base = document.getElementById('joystick-base');
  const knob = document.getElementById('joystick-knob');
  if (!base) return;

  const handleTouch = (e) => {
    e.preventDefault();
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const t = e.touches[0];
    if (!t) return;
    let dx = t.clientX - cx;
    let dy = t.clientY - cy;
    const maxDist = rect.width / 2;
    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) { dx = dx / dist * maxDist; dy = dy / dist * maxDist; }
    joystick.dx = dx / maxDist;
    joystick.dy = dy / maxDist;
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  };

  base.addEventListener('touchstart', (e) => { joystick.active = true; handleTouch(e); }, { passive: false });
  base.addEventListener('touchmove', handleTouch, { passive: false });
  base.addEventListener('touchend', (e) => {
    e.preventDefault();
    joystick.active = false; joystick.dx = 0; joystick.dy = 0;
    knob.style.transform = 'translate(-50%, -50%)';
  }, { passive: false });

  document.getElementById('btn-run').addEventListener('touchstart', (e) => { e.preventDefault(); game.keys['shift'] = true; }, { passive: false });
  document.getElementById('btn-run').addEventListener('touchend', (e) => { e.preventDefault(); game.keys['shift'] = false; }, { passive: false });
  document.getElementById('btn-crouch').addEventListener('touchstart', (e) => { e.preventDefault(); game.keys['c'] = true; }, { passive: false });
  document.getElementById('btn-crouch').addEventListener('touchend', (e) => { e.preventDefault(); game.keys['c'] = false; }, { passive: false });
  document.getElementById('btn-interact').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (game.state === 'dialogue') advanceDialogue();
    else if (game.state === 'playing') showInventory();
  }, { passive: false });
}

// ---------- BAŞLATMA (bu kısım game.js Bölüm B'de devam ediyor) ----------
// ============================================================
// BÖLÜM B: Karakter oluşturma, oyun başlatma, hikaye, mini oyunlar
// ============================================================

// ---------- KARAKTER OLUŞTURMA ÖNİZLEME ----------
const previewCanvas = document.getElementById('previewCanvas');
const pctx = previewCanvas ? previewCanvas.getContext('2d') : null;

function drawPreview() {
  if (!pctx) return;
  pctx.clearRect(0, 0, 160, 220);
  pctx.fillStyle = '#12122a';
  pctx.fillRect(0, 0, 160, 220);
  const cx = 80, cy = 180;
  pctx.fillStyle = charData.cloth;
  pctx.fillRect(cx - 12, cy - 30, 8, 30);
  pctx.fillRect(cx + 4, cy - 30, 8, 30);
  pctx.fillRect(cx - 16, cy - 80, 32, 52);
  pctx.fillStyle = charData.skin;
  pctx.fillRect(cx - 24, cy - 74, 8, 26);
  pctx.fillRect(cx + 16, cy - 74, 8, 26);
  pctx.beginPath(); pctx.arc(cx, cy - 96, 18, 0, Math.PI * 2); pctx.fill();
  pctx.fillStyle = charData.hair;
  if (charData.gender === 'female') {
    pctx.beginPath(); pctx.arc(cx, cy - 100, 19, Math.PI, 0); pctx.fill();
    pctx.fillRect(cx - 20, cy - 100, 6, 28);
    pctx.fillRect(cx + 14, cy - 100, 6, 28);
  } else if (charData.gender === 'neutral') {
    pctx.beginPath(); pctx.arc(cx, cy - 101, 18, Math.PI, 0); pctx.fill();
  } else {
    pctx.beginPath(); pctx.arc(cx, cy - 102, 17, Math.PI, 0); pctx.fill();
    pctx.fillRect(cx - 17, cy - 102, 34, 6);
  }
  pctx.fillStyle = '#111';
  pctx.beginPath(); pctx.arc(cx - 6, cy - 96, 3, 0, Math.PI * 2); pctx.fill();
  pctx.beginPath(); pctx.arc(cx + 6, cy - 96, 3, 0, Math.PI * 2); pctx.fill();
}

function showCharCreate() {
  hideElement('main-menu');
  showElement('char-create');
  game.state = 'create';
  drawPreview();
}

function initCharCreate() {
  const nameInput = document.getElementById('inp-name');
  if (nameInput) {
    nameInput.oninput = (e) => { game.playerCharName = e.target.value || 'Oyuncu'; };
  }

  document.querySelectorAll('#opt-gender .opt-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#opt-gender .opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      charData.gender = btn.dataset.val;
      drawPreview();
    };
  });

  document.querySelectorAll('#opt-atmo .opt-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#opt-atmo .opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      charData.atmo = btn.dataset.val;
    };
  });

  [['opt-hair', 'hair'], ['opt-skin', 'skin'], ['opt-cloth', 'cloth']].forEach(([id, key]) => {
    document.querySelectorAll(`#${id} .color-btn`).forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(`#${id} .color-btn`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        charData[key] = btn.dataset.val;
        drawPreview();
      };
    });
  });

  document.getElementById('btn-confirm-char').onclick = () => {
    charData.name = game.playerCharName;
    startGame();
  };
}

// ---------- OYUN BAŞLATMA ----------
function startGame() {
  clearSave();
  game.state = 'playing';
  game.chapter = 1;
  game.frame = 0;
  game.money = 0;
  game.energy = 100;
  game.caughtCount = 0;
  game.timeOfDay = 22;
  game.inventory = [];
  game.escaped = false;
  game.friendSaved = false;
  game.familySecretFound = false;
  game.relations = { mother: 50, father: 50, friend: 0 };
  game.skills = { speed: 0, stealth: 0, stamina: 0, health: 0, charisma: 0 };
  game.examScore = 0;
  game.examTotal = 0;
  game.routesTried = [];
  game.chapterTriggered = {};
  game.gameFlags = {};
  game.flashbackTriggered = [];
  game.startTime = Date.now();
  game.escapeRoute = null;
  game.escapeTimeLimit = 0;
  game.escapeTimeLeft = 0;

  buildMap();
  players = []; soldiers = []; particles = [];

  const p1 = new Player(300, 300, {
    up: 'w', down: 's', left: 'a', right: 'd',
    run: 'shift', crouch: 'c'
  }, 1);
  players.push(p1);

  if (game.twoPlayer) {
    const p2 = new Player(340, 300, {
      up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright',
      run: 'shiftright', crouch: 'controlright'
    }, 2);
    players.push(p2);
  }

  hideElement('main-menu');
  hideElement('char-create');
  hideElement('ending-screen');
  showElement('hud');
  updateHUD();
  saveGame();

  showChapterCard('Bölüm 1: Çocukluk', 'Bir hayat başlıyor...', () => {
    setChapter('Bölüm 1: Çocukluk');
    setObjective('Evinden çık, okula git');
    const t = LANG[game.lang];
    const intro = DIALOGUE_INTRO[game.lang] || DIALOGUE_INTRO.tr;
    startDialogue(intro.map(l => ({ ...l, speaker: l.speaker === 'Sen' || l.speaker === 'You' ? game.playerCharName : l.speaker })), () => {
      markers.push({ x: 1200, y: 500, type: 'school', label: 'Okul', active: true, radius: 50 });
      game.chapterTriggered.intro = true;
    });
  });
}

// ---------- DEVAM ET ----------
function resumeGame(data) {
  game.state = 'playing';
  game.twoPlayer = false;
  buildMap();
  players = []; soldiers = [];

  const px = data.playerX || 300;
  const py = data.playerY || 300;
  const p1 = new Player(px, py, {
    up: 'w', down: 's', left: 'a', right: 'd',
    run: 'shift', crouch: 'c'
  }, 1);
  players.push(p1);

  hideElement('main-menu');
  hideElement('char-create');
  hideElement('ending-screen');
  showElement('hud');
  updateHUD();
  setChapter(`Bölüm ${game.chapter}`);
  setObjective('Görevine devam et');

  // Bölüme göre marker'ları geri kur
  if (game.chapter <= 1) {
    markers.push({ x: 1200, y: 500, type: 'school', label: 'Okul', active: true, radius: 50 });
  } else if (game.chapter === 2) {
    markers.push({ x: 1800, y: 900, type: 'hagwon', label: 'Dershane', active: true, radius: 50 });
  } else if (game.chapter === 3) {
    markers.push({ x: 600, y: 1100, type: 'work', label: 'İş', active: true, radius: 50 });
  } else if (game.chapter === 4) {
    markers.push({ x: 1500, y: 300, type: 'friend', label: 'Arkadaş', active: true, radius: 50 });
  } else if (game.chapter === 5) {
    markers.push({ x: MAP_W - 200, y: MAP_H - 200, type: 'escape', label: 'Sınır', active: true, radius: 70 });
  }
}

// ---------- MARKER TETİKLEYİCİLERİ ----------
function checkMarkers() {
  const p = players[0];
  if (!p || p.hp <= 0) return;
  for (const m of markers) {
    if (!m.active) continue;
    if (Math.hypot(p.x - m.x, p.y - m.y) < m.radius) {
      m.active = false;
      triggerMarker(m);
      break;
    }
  }
}

function triggerMarker(m) {
  if (m.type === 'school') {
    triggerSchoolBaskin();
  } else if (m.type === 'hagwon') {
    triggerHagwon();
  } else if (m.type === 'work') {
    triggerWork();
  } else if (m.type === 'friend') {
    triggerFriend();
  } else if (m.type === 'escape') {
    triggerEscapeEnd();
  }
}

// ---------- BÖLÜM 2: OKUL BASKINI ----------
function triggerSchoolBaskin() {
  game.chapter = 2;
  saveGame();
  setChapter('Bölüm 2: Okul');
  setObjective('Askerler okulu bastı! Kaç!');
  if (game.shakeEnabled) game.shake = 15;
  sfx.alarm();

  const n = game.difficulty === 'easy' ? 3 : game.difficulty === 'normal' ? 5 : 7;
  for (let i = 0; i < n; i++) {
    soldiers.push(new Soldier(1200 + (Math.random() - 0.5) * 300, 500 + (Math.random() - 0.5) * 300));
  }

  const dlg = (DIALOGUE_SCHOOL[game.lang] || DIALOGUE_SCHOOL.tr).map(l => ({
    ...l,
    speaker: l.speaker === 'Sen' || l.speaker === 'You' ? game.playerCharName : l.speaker
  }));

  startDialogue(dlg, () => {
    setTimeout(() => {
      showChoice(
        'Baban seni kolundan tutup "Sakın bir şey söyleme!" diyor. Ne yapacaksın?',
        [
          { text: 'Sus ve babana uy.', value: 'obey' },
          { text: 'Askerlere hesap sor.', value: 'resist' },
          { text: 'Bir yolunu bulup kaçmayı planla.', value: 'plan' },
        ],
        (val) => {
          if (val === 'obey') {
            changeRelation('father', 5);
            startDialogue([
              { speaker: game.playerCharName, portrait: 'player', text: '...Peki baba.' },
              { speaker: 'Anlatıcı', portrait: 'narrator', text: 'İçindeki öfke büyüyor. Ama şimdilik susuyorsun.' },
            ], () => afterSchoolBaskin());
          } else if (val === 'resist') {
            changeRelation('father', -10);
            changeRelation('mother', -5);
            unlockAchievement('rebel');
            startDialogue([
              { speaker: game.playerCharName, portrait: 'player', text: 'Neden hep susuyoruz? Bu ülkede yaşamak zorunda mıyız?' },
              { speaker: 'Baban', portrait: 'father', text: 'Sus! Delirdin mi?!' },
              { speaker: 'Anlatıcı', portrait: 'narrator', text: 'Askerler sana dönüyor. Kaçmalısın.' },
            ], () => {
              game.caughtCount++;
              updateHUD();
              afterSchoolBaskin();
            });
          } else {
            changeRelation('father', -5);
            startDialogue([
              { speaker: game.playerCharName, portrait: 'player', text: 'Bir planım var. Kimseye söylemeyeceğim.' },
              { speaker: 'Anlatıcı', portrait: 'narrator', text: 'Bu ülkeden kaçmak... Belki de tek çıkış yolu bu.' },
            ], () => afterSchoolBaskin());
          }
          // Aile sırrı tetikle
          setTimeout(() => {
            if (!game.familySecretFound) {
              game.familySecretFound = true;
              unlockAchievement('family_secret');
              startDialogue(FAMILY_SECRET.lines.map(l => ({
                ...l,
                speaker: l.speaker === 'Sen' ? game.playerCharName : l.speaker
              })), () => {});
            }
          }, 1000);
        }
      );
    }, 800);
  });
}

function afterSchoolBaskin() {
  game.chapter = 3;
  saveGame();
  markers.push({ x: 1800, y: 900, type: 'hagwon', label: 'Dershane', active: true, radius: 50 });
  setObjective('Dershaneye git (hagwon)');
  // Günlük
  if (DIARY_ENTRIES[2]) {
    setTimeout(() => {
      startDialogue([{ speaker: 'Günlük', portrait: 'narrator', text: DIARY_ENTRIES[2] }], () => {});
    }, 1500);
  }
}

// ---------- BÖLÜM 3: DERSHANE / SINAV ----------
function triggerHagwon() {
  setChapter('Bölüm 3: Dershane');
  setObjective('Suneung sınavına hazırlan');
  const dlg = (DIALOGUE_HAGWON[game.lang] || DIALOGUE_HAGWON.tr).map(l => ({
    ...l,
    speaker: l.speaker === 'Sen' || l.speaker === 'You' ? game.playerCharName : l.speaker
  }));
  startDialogue(dlg, () => {
    startExamMinigame((score, total) => {
      game.examScore = score;
      game.examTotal = total;
      if (score === total) unlockAchievement('exam_master');

      if (score >= total - 1) {
        changeRelation('mother', 10);
        changeRelation('father', 10);
        startDialogue([
          { speaker: 'Anne', portrait: 'mother', text: 'Aferin! Böyle devam edersen Seul National\'a gidersin!' },
          { speaker: 'Baban', portrait: 'father', text: 'Gurur duydum. Ama daha çok çalışmalısın.' },
        ], () => afterHagwon());
      } else if (score >= total / 2) {
        startDialogue([
          { speaker: 'Anne', portrait: 'mother', text: 'Bu mu? Bu kadar mı? Herkes senden daha iyi!' },
          { speaker: 'Baban', portrait: 'father', text: 'Hayal kırıklığı. Daha çok çalışacaksın.' },
        ], () => afterHagwon());
      } else {
        changeRelation('father', -10);
        startDialogue([
          { speaker: 'Baban', portrait: 'father', text: 'Bu ne?! Bu ülkede işe yaramazsın! Utanç veriyorsun!' },
          { speaker: 'Anne', portrait: 'mother', text: 'Ağlama. Ağlamak zayıflıktır. Çalış.' },
        ], () => {
          game.caughtCount++;
          updateHUD();
          afterHagwon();
        });
      }
    });
  });
}

function afterHagwon() {
  game.chapter = 4;
  saveGame();
  markers.push({ x: 600, y: 1100, type: 'work', label: 'İş', active: true, radius: 50 });
  setObjective('İşe git, para kazan');
  if (DIARY_ENTRIES[3]) {
    setTimeout(() => {
      startDialogue([{ speaker: 'Günlük', portrait: 'narrator', text: DIARY_ENTRIES[3] }], () => {});
    }, 1500);
  }
}

// ---------- BÖLÜM 4: İŞ ----------
function triggerWork() {
  setChapter('Bölüm 4: İş Hayatı');
  setObjective('Para kazan (kaçış için biriktir)');
  const dlg = (DIALOGUE_WORK[game.lang] || DIALOGUE_WORK.tr).map(l => ({
    ...l,
    speaker: l.speaker === 'Sen' || l.speaker === 'You' ? game.playerCharName : l.speaker
  }));
  startDialogue(dlg, () => {
    startWorkMinigame((earned) => {
      game.money += earned;
      updateHUD();
      if (game.money >= 1000) unlockAchievement('rich');
      startDialogue([
        { speaker: 'Anlatıcı', portrait: 'narrator', text: `Kazandın: ${earned} ₩. Kaçış için birikim yapıyorsun.` },
      ], () => afterWork());
    });
  });
}

function afterWork() {
  game.chapter = 5;
  saveGame();
  markers.push({ x: 1500, y: 300, type: 'friend', label: 'Arkadaş', active: true, radius: 50 });
  setObjective('Arkadaşınla buluş');
  if (DIARY_ENTRIES[4]) {
    setTimeout(() => {
      startDialogue([{ speaker: 'Günlük', portrait: 'narrator', text: DIARY_ENTRIES[4] }], () => {});
    }, 1500);
  }
}

// ---------- BÖLÜM 5: ARKADAŞ ----------
function triggerFriend() {
  setChapter('Bölüm 5: Arkadaş');
  const dlg = (DIALOGUE_FRIEND[game.lang] || DIALOGUE_FRIEND.tr).map(l => ({
    ...l,
    speaker: l.speaker === 'Sen' || l.speaker === 'You' ? game.playerCharName : l.speaker
  }));
  startDialogue(dlg, () => {
    showChoice(
      'Arkadaşın seninle gelmek istiyor. Ne diyeceksin?',
      [
        { text: 'Gel, birlikte kaçarız.', value: 'together' },
        { text: 'Üzgünüm, tek başıma gitmeliyim.', value: 'alone' },
      ],
      (val) => {
        if (val === 'together') {
          game.friendSaved = true;
          changeRelation('friend', 40);
          addInventory('Arkadaş');
          unlockAchievement('friend_saved');
          startDialogue([{ speaker: 'Arkadaş', portrait: 'friend', text: 'Sana güveniyorum. Planı yap.' }], () => showRouteSelection());
        } else {
          changeRelation('friend', -20);
          startDialogue([{ speaker: 'Arkadaş', portrait: 'friend', text: 'Anlıyorum... Başarılar.' }], () => showRouteSelection());
        }
      }
    );
  });
}

// ---------- KAÇIŞ ROTASI SEÇİMİ ----------
function showRouteSelection() {
  game.state = 'route';
  showElement('route-screen');
  const list = document.getElementById('route-list');
  list.innerHTML = '';
  for (const r of ESCAPE_ROUTES) {
    const div = document.createElement('div');
    div.className = 'route-card';
    div.innerHTML = `
      <div class="route-icon">${r.icon}</div>
      <div class="route-name">${r.name}</div>
      <div class="route-desc">${r.desc}</div>
      <div class="route-diff">Zorluk: ${r.diff}</div>
    `;
    div.onclick = () => {
      game.escapeRoute = r;
      game.escapeTimeLimit = r.timeLimit;
      game.escapeTimeLeft = r.timeLimit;
      if (!game.routesTried.includes(r.id)) game.routesTried.push(r.id);
      if (game.routesTried.length >= 3) unlockAchievement('all_routes');
      hideElement('route-screen');
      startEscape();
    };
    list.appendChild(div);
  }
}

// ---------- BÖLÜM 6: KAÇIŞ ----------
function startEscape() {
  game.chapter = 6;
  saveGame();
  setChapter('Bölüm 6: Kaçış');
  setObjective('Sınıra ulaş! Askerlerden kaç!');
  hideSpots = [];
  markers = [];
  buildMap();
  markers.push({ x: MAP_W - 200, y: MAP_H - 200, type: 'escape', label: 'Sınır', active: true, radius: 70 });
  players.forEach(p => { p.x = 300; p.y = MAP_H - 300; p.hp = p.maxHp; });
  soldiers = [];
  particles = [];

  const routeSoldiers = game.escapeRoute ? game.escapeRoute.soldierCount : 8;
  const n = Math.max(3, routeSoldiers + (game.difficulty === 'easy' ? -2 : game.difficulty === 'hard' ? 3 : 0));
  for (let i = 0; i < n; i++) {
    soldiers.push(new Soldier(600 + Math.random() * (MAP_W - 800), 200 + Math.random() * (MAP_H - 400)));
  }

  const dlg = (DIALOGUE_ESCAPE[game.lang] || DIALOGUE_ESCAPE.tr).map(l => ({
    ...l,
    speaker: l.speaker === 'Sen' || l.speaker === 'You' ? game.playerCharName : l.speaker
  }));
  startDialogue(dlg, () => {
    game.escapeTimeLeft = game.escapeTimeLimit;
  });
}

// ---------- KAÇIŞ SONU ----------
function triggerEscapeEnd() {
  const t = LANG[game.lang];
  const caughtOk = game.caughtCount === 0;
  const enoughMoney = game.money >= 500;

  if (game.friendSaved) {
    endGame('friend', ENDINGS.friend.title, ENDINGS.friend.text, ENDINGS.friend.color);
    return;
  }
  if (enoughMoney) {
    showChoice(
      'Sınırdasın. Asker seni gördü. Ne yapacaksın?',
      [
        { text: 'Rüşvet ver (500 ₩).', value: 'bribe' },
        { text: 'Koş!', value: 'run' },
        { text: 'Teslim ol.', value: 'surrender' },
      ],
      (val) => {
        if (val === 'bribe') {
          game.money -= 500;
          unlockAchievement('briber');
          endGame('bribe', ENDINGS.bribe.title, ENDINGS.bribe.text, ENDINGS.bribe.color);
        } else if (val === 'run') {
          if (players[0].hp > 30) endGame('run', ENDINGS.run.title, ENDINGS.run.text, ENDINGS.run.color);
          else endGame('caught', ENDINGS.caught.title, ENDINGS.caught.text, ENDINGS.caught.color);
        } else {
          endGame('surrender', ENDINGS.surrender.title, ENDINGS.surrender.text, ENDINGS.surrender.color);
        }
      }
    );
  } else {
    showChoice(
      `Sınırdasın ama yeterli paran yok (${Math.floor(game.money)}/500 ₩). Ne yapacaksın?`,
      [
        { text: 'Koş!', value: 'run' },
        { text: 'Teslim ol.', value: 'surrender' },
      ],
      (val) => {
        if (val === 'run') {
          if (players[0].hp > 30) endGame('run', ENDINGS.run.title, ENDINGS.run.text, ENDINGS.run.color);
          else endGame('caught', ENDINGS.caught.title, ENDINGS.caught.text, ENDINGS.caught.color);
        } else {
          endGame('surrender', ENDINGS.surrender.title, ENDINGS.surrender.text, ENDINGS.surrender.color);
        }
      }
    );
  }
}

// ---------- MİNİ OYUN: SINAV ----------
let examTimerInterval = null;

function startExamMinigame(callback) {
  game.state = 'exam';
  const questions = EXAM_QUESTIONS.slice(0, 7);
  let idx = 0;
  let score = 0;
  let timeLeft = 10;
  const total = questions.length;

  showElement('minigame-exam');

  const renderQ = () => {
    if (idx >= total) {
      clearInterval(examTimerInterval);
      hideElement('minigame-exam');
      game.state = 'playing';
      callback(score, total);
      return;
    }
    document.getElementById('exam-question').textContent = questions[idx].q;
    const opts = document.getElementById('exam-options');
    opts.innerHTML = '';
    questions[idx].a.forEach((a, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = a;
      btn.onclick = () => {
        if (i === questions[idx].correct) { score++; sfx.coin(); }
        else { sfx.hit(); }
        idx++;
        timeLeft = 10;
        renderQ();
      };
      opts.appendChild(btn);
    });
  };

  clearInterval(examTimerInterval);
  examTimerInterval = setInterval(() => {
    timeLeft--;
    const el = document.getElementById('exam-timer');
    if (el) el.textContent = `⏱ ${timeLeft}`;
    if (timeLeft <= 0) {
      idx++;
      timeLeft = 10;
      renderQ();
    }
  }, 1000);

  renderQ();
}

// ---------- MİNİ OYUN: İŞ ----------
let workInterval = null;

function startWorkMinigame(callback) {
  game.state = 'work';
  showElement('minigame-work');
  const wc = document.getElementById('workCanvas');
  if (!wc) return;
  const wctx = wc.getContext('2d');
  let score = 0;
  let timeLeft = 15;
  let boxes = [];

  const spawnBox = () => {
    boxes.push({
      x: 30 + Math.random() * 440,
      y: -30,
      w: 40, h: 40,
      speed: 1.5 + Math.random() * 1.5,
      color: ['#4a8aff', '#4affb0', '#ffd166', '#ff4a8a'][Math.floor(Math.random() * 4)],
    });
  };

  const workLoop = () => {
    if (game.state !== 'work') return;
    wctx.fillStyle = '#12122a';
    wctx.fillRect(0, 0, 500, 300);
    boxes.forEach(b => {
      b.y += b.speed;
      wctx.fillStyle = b.color;
      wctx.fillRect(b.x, b.y, b.w, b.h);
      wctx.strokeStyle = '#fff';
      wctx.lineWidth = 1;
      wctx.strokeRect(b.x, b.y, b.w, b.h);
    });
    boxes = boxes.filter(b => b.y < 320);
    document.getElementById('work-score').textContent = `${LANG[game.lang].earnings}: ${score} ₩`;
    requestAnimationFrame(workLoop);
  };

  wc.onclick = (e) => {
    const rect = wc.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (500 / rect.width);
    const my = (e.clientY - rect.top) * (300 / rect.height);
    for (let i = boxes.length - 1; i >= 0; i--) {
      const b = boxes[i];
      if (mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h) {
        boxes.splice(i, 1);
        score += 10;
        sfx.coin();
        break;
      }
    }
  };

  clearInterval(workInterval);
  workInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(workInterval);
      clearInterval(spawnInt);
      hideElement('minigame-work');
      game.state = 'playing';
      callback(score);
    }
  }, 1000);

  const spawnInt = setInterval(() => {
    if (game.state !== 'work') { clearInterval(spawnInt); return; }
    spawnBox();
  }, 400);

  workLoop();
}

document.getElementById('work-close').onclick = () => {
  clearInterval(workInterval);
  hideElement('minigame-work');
  game.state = 'playing';
};

// ---------- NPC ETKİLEŞİMİ ----------
function checkNPCInteraction() {
  if (game.npcCooldown > 0) { game.npcCooldown--; return; }
  const p = players[0];
  if (!p) return;
  for (const npc of npcs) {
    if (Math.hypot(p.x - npc.x, p.y - npc.y) < 40) {
      if (game.keys[' '] || game.keys['enter']) {
        game.npcCooldown = 300;
        const dlg = NPC_DIALOGUES[game.lang] || NPC_DIALOGUES.tr;
        const randomDlg = dlg[Math.floor(Math.random() * dlg.length)];
        startDialogue([randomDlg], () => {});
        return;
      }
    }
  }
}

// ---------- FLASHBACK TETİKLEYİCİ ----------
function checkFlashbacks() {
  if (game.chapter !== 6 || !players[0]) return;
  const p = players[0];
  const progress = 1 - (Math.hypot(p.x - (MAP_W - 200), p.y - (MAP_H - 200)) / Math.hypot(MAP_W, MAP_H));
  for (const fb of FLASHBACKS) {
    if (progress >= fb.trigger && !game.flashbackTriggered.includes(fb.trigger)) {
      game.flashbackTriggered.push(fb.trigger);
      startDialogue(fb.lines, () => {});
      break;
    }
  }
}

// === BÖLÜM B SONU — DEVAM: BÖLÜM C ===
// ============================================================
// BÖLÜM C: Döngü, çizim, input, sonlar, başlatma
// ============================================================

// ---------- SON EKRANI ----------
function endGame(endingKey, title, text, color) {
  game.state = 'ending';
  const elapsed = Math.floor((Date.now() - game.startTime) / 1000);

  document.getElementById('ending-title').textContent = title;
  document.getElementById('ending-title').style.color = color;
  document.getElementById('ending-text').textContent = text;

  const statDiv = document.getElementById('ending-stats');
  statDiv.innerHTML = `
    💰 Para: ${Math.floor(game.money)} ₩<br>
    🚨 Yakalanma: ${game.caughtCount}/${game.maxCaught}<br>
    📝 Sınav: ${game.examScore}/${game.examTotal || 7}<br>
    ⏱ Süre: ${elapsed} sn<br>
    ${game.friendSaved ? '👥 Arkadaşın yanında<br>' : ''}
    ${game.unlockedAchievements.length} başarım kazanıldı
  `;

  showElement('ending-screen');
  hideElement('hud');

  // Başarımlar
  if (endingKey === 'bribe' || endingKey === 'run' || endingKey === 'friend' || endingKey === 'family') {
    if (!game.unlockedAchievements.includes('first_escape')) {
      unlockAchievement('first_escape');
    }
    if (game.caughtCount === 0) unlockAchievement('no_caught');
    if (elapsed < 120) unlockAchievement('speedrun');
    if (game.caughtCount > 0) unlockAchievement('survivor');
    if (game.difficulty === 'hard') unlockAchievement('hard_escape');
    sfx.win();
  } else {
    sfx.lose();
  }
  if (game.timeOfDay >= 3 && game.timeOfDay < 6) unlockAchievement('night_owl');

  saveScore(title, game.money, elapsed);
  recordProfile(endingKey === 'run' || endingKey === 'bribe' || endingKey === 'friend', game.money);
  clearSave();
}

// ---------- PAYLAŞIM ----------
document.getElementById('share-btn').onclick = () => {
  const text = `Kore'den Kaçış — ${game.playerName}\n💰 ${Math.floor(game.money)} ₩ | 🚨 ${game.caughtCount} yakalanma | 🏆 ${game.unlockedAchievements.length} başarım`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('share-btn');
      const old = btn.textContent;
      btn.textContent = '✅ Kopyalandı!';
      setTimeout(() => btn.textContent = old, 2000);
    });
  } else {
    prompt('Sonucu kopyala:', text);
  }
};

// ---------- GÜNCELLEME ----------
function update() {
  // Zaman ilerle
  if (game.state === 'playing') {
    game.timeOfDay += 0.002;
    if (game.timeOfDay >= 24) game.timeOfDay -= 24;
  }

  if (game.state === 'playing') {
    // Oyuncuları güncelle
    for (const p of players) p.update(game.keys);

    // Askerleri güncelle
    for (const s of soldiers) s.update(game.keys);

    // Marker kontrolü
    checkMarkers();

    // NPC etkileşimi
    checkNPCInteraction();

    // Flashback kontrolü
    checkFlashbacks();

    // Görünürlük hesabı
    let minDist = Infinity;
    for (const s of soldiers) {
      const d = Math.hypot(players[0].x - s.x, players[0].y - s.y);
      if (d < minDist) minDist = d;
    }
    if (minDist < 200) {
      game.visibility = Math.max(0, 1 - minDist / 200);
    } else {
      game.visibility = 0;
    }
    if (players[0].crouching) game.visibility *= 0.5;
    if (players[0].hidden) game.visibility *= 0.1;

    // Telefon aramaları (rastgele)
    if (!game.phoneActive && game.chapter >= 2 && game.chapter <= 5) {
      if (Math.random() < 0.0004 && Date.now() - game.lastPhoneTime > 30000) {
        const callers = ['Anne', 'Baban', 'Arkadaş'];
        const caller = callers[Math.floor(Math.random() * callers.length)];
        showPhoneCall(caller, 'Neredesin? Saat kaç oldu!',
          () => { changeRelation('mother', 5); game.energy = Math.min(100, game.energy + 10); },
          () => { changeRelation('mother', -10); }
        );
      }
    }

    // Asker doğurma (kaçış hariç, rastgele)
    if (game.chapter < 6 && Math.random() < DIFF[game.difficulty].spawnRate) {
      if (soldiers.length < 5) {
        soldiers.push(new Soldier(players[0].x + (Math.random() - 0.5) * 600, players[0].y + (Math.random() - 0.5) * 600));
      }
    }

    // Kaçış bölümü geri sayım
    if (game.chapter === 6 && game.escapeTimeLeft > 0 && game.state === 'playing') {
      game.escapeTimeLeft -= 1 / 60;
      if (game.escapeTimeLeft <= 0) {
        endGame('caught', 'Zaman Doldu', 'Süre doldu. Askerler seni yakaladı. Kaçış başarısız...', '#c94a4a');
      }
    }

    // Oyuncu ölümü
    for (const p of players) {
      if (p.hp <= 0) {
        game.caughtCount++;
        updateHUD();
        if (game.caughtCount >= game.maxCaught) {
          endGame('exhausted', ENDINGS.exhausted.title, ENDINGS.exhausted.text, ENDINGS.exhausted.color);
        } else {
          p.hp = p.maxHp;
          p.x = 300; p.y = 300;
          p.invuln = 120;
          startDialogue([{ speaker: 'Anlatıcı', portrait: 'narrator', text: `Yakalandın! (${game.caughtCount}/${game.maxCaught})` }], () => {});
        }
      }
    }

    updateHUD();
  }

  // Parçacıkları güncelle
  updateParticles();

  // Hava durumu
  updateWeather();

  // Ekran sarsıntısı
  if (game.shake > 0) game.shake *= 0.9;

  // Auto-save (her 30 saniyede bir)
  if (game.state === 'playing' && game.frame % 1800 === 0 && game.frame > 0) {
    saveGame();
  }

  game.frame++;
}

// ---------- ÇİZİM ----------
function draw() {
  ctx.save();

  if (game.shake > 0.5 && game.shakeEnabled) {
    ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  }

  const { camX, camY } = getCamera();

  // Arka plan
  drawBackground(ctx, camX, camY);

  // Yollar
  for (const r of roads) {
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(r.x - camX, r.y - camY, r.w, r.h);
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 2;
    if (r.w > r.h) {
      for (let x = r.x; x < r.x + r.w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x - camX, r.y + r.h / 2 - camY);
        ctx.lineTo(x + 20 - camX, r.y + r.h / 2 - camY);
        ctx.stroke();
      }
    } else {
      for (let y = r.y; y < r.y + r.h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(r.x + r.w / 2 - camX, y - camY);
        ctx.lineTo(r.x + r.w / 2 - camX, y + 20 - camY);
        ctx.stroke();
      }
    }
  }

  // Binalar
  for (const b of buildings) {
    const bx = b.x - camX, by = b.y - camY;
    ctx.fillStyle = b.color;
    ctx.fillRect(bx, by, b.w, b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(bx, by, b.w, 6);
    if (b.windows) {
      ctx.fillStyle = 'rgba(255,220,100,0.15)';
      for (let wy = by + 20; wy < by + b.h - 15; wy += 25) {
        for (let wx = bx + 12; wx < bx + b.w - 12; wx += 22) {
          if ((wx + wy) % 3 !== 0) ctx.fillRect(wx, wy, 8, 10);
        }
      }
    }
  }

  // Işık kaynakları
  drawLighting(ctx, camX, camY);

  // Neon tabelalar
  for (const n of neonSigns) {
    const nx = n.x - camX, ny = n.y - camY;
    const glow = 0.5 + Math.sin(game.frame * 0.05 + n.phase) * 0.3;
    ctx.globalAlpha = glow;
    ctx.fillStyle = n.color;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(n.text, nx, ny);
    ctx.globalAlpha = 1;
  }

  // Saklanma noktaları
  for (const s of hideSpots) {
    ctx.fillStyle = s.type === 'trash' ? '#3a3a2a' : '#1a1a2a';
    ctx.fillRect(s.x - camX, s.y - camY, s.w, s.h);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x - camX, s.y - camY, s.w, s.h);
  }

  // NPC'ler
  for (const npc of npcs) {
    const nx = npc.x - camX, ny = npc.y - camY;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(nx, ny + 3, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(nx - 8, ny - 30, 16, 30);
    ctx.fillStyle = '#e8b88a';
    ctx.beginPath(); ctx.arc(nx, ny - 38, 9, 0, Math.PI * 2); ctx.fill();
  }

  // Markerlar
  for (const m of markers) {
    if (!m.active) continue;
    const mx = m.x - camX, my = m.y - camY;
    const pulse = Math.sin(game.frame * 0.08) * 5;
    ctx.fillStyle = 'rgba(255,209,102,0.25)';
    ctx.beginPath(); ctx.arc(mx, my, m.radius + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, mx, my - 50);
  }

  // Askerler
  for (const s of soldiers) s.draw(ctx, camX, camY);

  // Oyuncular
  for (const p of players) p.draw(ctx, camX, camY);

  // Parçacıklar
  drawParticles(ctx, camX, camY);

  ctx.restore();

  // Hava (ekran üstü)
  drawWeather(ctx);

  // Vinyet (hasar / düşük enerji)
  if (players[0]) {
    const hpRatio = players[0].hp / players[0].maxHp;
    if (hpRatio < 0.5) {
      const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, `rgba(200,30,30,${(1 - hpRatio) * 0.5})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Kaçış geri sayım
  if (game.chapter === 6 && game.state === 'playing' && game.escapeTimeLeft > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - 80, 16, 160, 40);
    ctx.fillStyle = game.escapeTimeLeft < 30 ? '#ff3333' : '#ffd166';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    const m = Math.floor(game.escapeTimeLeft / 60);
    const s = Math.floor(game.escapeTimeLeft % 60);
    ctx.fillText(`⏱ ${m}:${s.toString().padStart(2, '0')}`, W / 2, 44);
  }

  // Mini harita
  drawMinimap(camX, camY);
}

// ---------- MİNİ HARİTA ----------
function drawMinimap(camX, camY) {
  const mw = 160, mh = 100;
  const mx = W - mw - 16, my = 16;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#4a4aff';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, mw, mh);

  const scaleX = mw / MAP_W, scaleY = mh / MAP_H;

  ctx.fillStyle = 'rgba(100,100,200,0.4)';
  for (const b of buildings) ctx.fillRect(mx + b.x * scaleX, my + b.y * scaleY, b.w * scaleX, b.h * scaleY);

  for (const m of markers) {
    if (!m.active) continue;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(mx + m.x * scaleX, my + m.y * scaleY, 3, 0, Math.PI * 2); ctx.fill();
  }
  for (const p of players) {
    ctx.fillStyle = p.id === 1 ? '#4aff4a' : '#4a4aff';
    ctx.beginPath(); ctx.arc(mx + p.x * scaleX, my + p.y * scaleY, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = game.colorblind ? '#ff9900' : '#ff4a4a';
  for (const s of soldiers) {
    ctx.beginPath(); ctx.arc(mx + s.x * scaleX, my + s.y * scaleY, 2, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- INPUT ----------
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  game.keys[key] = true;

  if (game.state === 'dialogue' && (key === ' ' || key === 'enter')) {
    e.preventDefault();
    advanceDialogue();
  }
  if (game.state === 'playing' && key === 'i') {
    showInventory();
  }
  if (game.state === 'playing' && key === 'k') {
    showSkillTree();
  }
});

window.addEventListener('keyup', (e) => {
  game.keys[e.key.toLowerCase()] = false;
});

// ---------- DÖNGÜ ----------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ---------- BAŞLATMA ----------
initMenu();
initCharCreate();
initTouchControls();
buildMap();

// Dil uygula (ilk yükleme)
if (LANG[game.lang]) applyLanguage();

// Oyun döngüsünü başlat
loop();
