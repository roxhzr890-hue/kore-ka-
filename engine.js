// ============================================================
// KORE'DEN KAÇIŞ — Motor Dosyası
// Oyun durumu, sınıflar, harita, çizim, ses, portre
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 960, H = 540;
const MAP_W = 2400, MAP_H = 1400;

// ---------- OYUN DURUMU ----------
const game = {
  state: 'menu',
  difficulty: 'easy',
  twoPlayer: false,
  chapter: 0,
  objective: '',
  dialogueQueue: [],
  dialogueIndex: 0,
  dialogueCallback: null,
  keys: {},
  frame: 0,
  shake: 0,
  money: 0,
  energy: 100,
  maxEnergy: 100,
  caughtCount: 0,
  maxCaught: 3,
  timeOfDay: 22,
  inventory: [],
  colorblind: false,
  soundOn: true,
  volume: 0.5,
  examScore: 0,
  examTotal: 0,
  startTime: 0,
  escaped: false,
  friendSaved: false,
  familySecretFound: false,
  phoneActive: false,
  playerName: 'Oyuncu',
  player2Name: 'Oyuncu 2',
  playerCharName: 'Oyuncu',
  lang: 'tr',
  shakeEnabled: true,
  touchEnabled: false,
  visibility: 0,
  relations: { mother: 50, father: 50, friend: 0 },
  skills: { speed: 0, stealth: 0, stamina: 0, health: 0, charisma: 0 },
  unlockedAchievements: [],
  routesTried: [],
  skillPoints: 0,
  escapeRoute: null,
  escapeTimeLimit: 0,
  escapeTimeLeft: 0,
  flashbackTriggered: [],
  lastPhoneTime: 0,
  npcCooldown: 0,
  chapterTriggered: {},
  gameFlags: {},
};

// ---------- KARAKTER VERİSİ ----------
const charData = {
  name: 'Oyuncu',
  gender: 'male',
  hair: '#1a1a1a',
  skin: '#f5d0b0',
  cloth: '#3a5a8c',
  atmo: 'night',
};

// ---------- DÜNYA NESNELERİ ----------
let players = [];
let soldiers = [];
let buildings = [];
let roads = [];
let markers = [];
let hideSpots = [];
let particles = [];
let rainDrops = [];
let snowFlakes = [];
let neonSigns = [];
let npcs = [];
let lightSources = [];

const DIFF = {
  easy:   { soldierSpeed: 1.2, soldierDamage: 8,  chaseRange: 160, spawnRate: 0.008, crouchStealth: 0.3 },
  normal: { soldierSpeed: 1.8, soldierDamage: 14, chaseRange: 230, spawnRate: 0.015, crouchStealth: 0.5 },
  hard:   { soldierSpeed: 2.6, soldierDamage: 22, chaseRange: 320, spawnRate: 0.028, crouchStealth: 0.75 },
};

// ---------- SES MOTORU ----------
let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { audioCtx = null; }
}

function playTone(freq, duration, type = 'sine', vol = 0.1) {
  if (!game.soundOn || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol * game.volume;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

const sfx = {
  step: () => playTone(120 + Math.random() * 40, 0.05, 'square', 0.03),
  alert: () => playTone(880, 0.15, 'sawtooth', 0.08),
  coin: () => { playTone(1200, 0.1, 'sine', 0.1); setTimeout(() => playTone(1600, 0.1, 'sine', 0.1), 80); },
  hit: () => playTone(80, 0.2, 'square', 0.15),
  win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.1), i * 120)),
  lose: () => [400, 300, 200].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 'sawtooth', 0.1), i * 150)),
  achievement: () => [660, 880, 1320].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.1), i * 80)),
  alarm: () => { playTone(600, 0.2, 'square', 0.1); setTimeout(() => playTone(800, 0.2, 'square', 0.1), 200); },
  paper: () => playTone(2000, 0.05, 'sine', 0.05),
};

// ---------- HARİTA OLUŞTURMA ----------
function buildMap() {
  buildings = []; roads = []; markers = []; hideSpots = []; neonSigns = []; npcs = []; lightSources = [];

  for (let y = 100; y < MAP_H; y += 280) roads.push({ x: 0, y, w: MAP_W, h: 120 });
  for (let x = 100; x < MAP_W; x += 320) roads.push({ x, y: 0, w: 100, h: MAP_H });

  const bldColors = ['#2a2a4a', '#3a3a5a', '#252540', '#303055', '#1e1e38'];
  const neonTexts = ['치킨', '노래방', 'PC방', '카페', '편의점', 'PC', '커피', '식당'];
  const neonColors = ['#ff4a8a', '#4affb0', '#ffd166', '#4a8aff', '#b04aff'];

  for (let i = 0; i < 30; i++) {
    const bx = 200 + Math.random() * (MAP_W - 400);
    const by = 150 + Math.random() * (MAP_H - 300);
    let overlap = false;
    for (const r of roads) {
      if (bx > r.x - 80 && bx < r.x + r.w + 80 && by > r.y - 80 && by < r.y + r.h + 80) { overlap = true; break; }
    }
    if (overlap) continue;
    const b = {
      x: bx, y: by, w: 80 + Math.random() * 120, h: 70 + Math.random() * 100,
      color: bldColors[Math.floor(Math.random() * bldColors.length)],
      windows: Math.random() > 0.3,
    };
    buildings.push(b);
    if (Math.random() > 0.6) {
      neonSigns.push({
        x: bx + b.w / 2, y: by - 10,
        text: neonTexts[Math.floor(Math.random() * neonTexts.length)],
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        phase: Math.random() * Math.PI * 2,
      });
      lightSources.push({ x: bx + b.w / 2, y: by, radius: 90, color: neonColors[Math.floor(Math.random() * neonColors.length)], phase: Math.random() * Math.PI * 2 });
    }
  }

  for (let i = 0; i < 15; i++) {
    hideSpots.push({
      x: 250 + Math.random() * (MAP_W - 500),
      y: 200 + Math.random() * (MAP_H - 400),
      w: 40, h: 40,
      type: Math.random() > 0.5 ? 'trash' : 'alley',
    });
  }

  for (let i = 0; i < 8; i++) {
    npcs.push({
      x: 300 + Math.random() * (MAP_W - 600),
      y: 300 + Math.random() * (MAP_H - 600),
      type: 'citizen', idle: Math.random() * 100,
    });
  }

  // Hava efektleri
  rainDrops = [];
  for (let i = 0; i < 100; i++) {
    rainDrops.push({ x: Math.random() * W, y: Math.random() * H, speed: 8 + Math.random() * 6 });
  }
  snowFlakes = [];
  for (let i = 0; i < 60; i++) {
    snowFlakes.push({ x: Math.random() * W, y: Math.random() * H, speed: 0.5 + Math.random() * 1.5, drift: Math.random() * Math.PI * 2 });
  }
}

// ---------- OYUNCU SINIFI ----------
class Player {
  constructor(x, y, controls, id) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.baseSpeed = 2.2;
    this.baseRunSpeed = 4.4;
    this.crouchSpeed = 1.0;
    this.w = 28; this.h = 52;
    this.controls = controls;
    this.id = id;
    this.facing = 1;
    this.walking = false; this.running = false; this.crouching = false;
    this.maxHp = 100 + (game.skills.health * 15);
    this.hp = this.maxHp;
    this.invuln = 0;
    this.hidden = false;
    this.stepTimer = 0;
    this.animFrame = 0;
  }

  update(keys) {
    if (this.hp <= 0) return;
    this.walking = false; this.running = false; this.crouching = false; this.hidden = false;

    let dx = 0, dy = 0;
    const c = this.controls;
    if (keys[c.left])  { dx -= 1; this.facing = -1; }
    if (keys[c.right]) { dx += 1; this.facing = 1; }
    if (keys[c.up])    dy -= 1;
    if (keys[c.down])  dy += 1;

    const isRunning = keys[c.run];
    const isCrouch = keys[c.crouch];
    const speedBonus = game.skills.speed * 0.3;
    const maxEnergy = 100 + game.skills.stamina * 20;

    let spd = this.baseSpeed + speedBonus;
    if (isCrouch) { spd = this.crouchSpeed; this.crouching = true; }
    else if (isRunning && game.energy > 0) {
      spd = this.baseRunSpeed + speedBonus; this.running = true;
      game.energy = Math.max(0, game.energy - 0.15);
    } else if (!isCrouch) {
      game.energy = Math.min(maxEnergy, game.energy + 0.08);
    }

    if (dx !== 0 || dy !== 0) {
      this.walking = true;
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len; dy /= len;
      this.vx = dx * spd; this.vy = dy * spd;
      this.stepTimer--;
      if (this.stepTimer <= 0) { sfx.step(); this.stepTimer = this.running ? 10 : 22; }
      this.animFrame += this.running ? 0.3 : 0.15;
    } else { this.vx = 0; this.vy = 0; }

    this.x = Math.max(10, Math.min(MAP_W - 10, this.x + this.vx));
    this.y = Math.max(10, Math.min(MAP_H - 10, this.y + this.vy));

    for (const b of buildings) {
      if (this.x + this.w/2 > b.x && this.x - this.w/2 < b.x + b.w &&
          this.y + this.h > b.y && this.y < b.y + b.h) {
        if (this.vx > 0) this.x = b.x - this.w/2;
        else if (this.vx < 0) this.x = b.x + b.w + this.w/2;
        if (this.vy > 0) this.y = b.y - this.h;
        else if (this.vy < 0) this.y = b.y + b.h;
      }
    }

    for (const spot of hideSpots) {
      if (Math.hypot(this.x - (spot.x + spot.w/2), this.y - (spot.y + spot.h/2)) < 50 && this.crouching) {
        this.hidden = true;
      }
    }

    if (this.invuln > 0) this.invuln--;
  }

  draw(c, camX, camY) {
    const sx = this.x - camX, sy = this.y - camY;
    const alpha = this.hidden ? 0.35 : 1;
    c.globalAlpha = alpha;

    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath(); c.ellipse(sx, sy + 4, 16, 6, 0, 0, Math.PI * 2); c.fill();

    let bodyH = this.crouching ? 32 : 44;
    let headY = sy - bodyH - 4;
    const legSwing = Math.sin(this.animFrame * 2) * (this.running ? 8 : 4);

    c.fillStyle = charData.cloth;
    if (this.walking) {
      c.fillRect(sx - 8, sy - 14, 6, 14 + legSwing);
      c.fillRect(sx + 2, sy - 14, 6, 14 - legSwing);
    } else {
      c.fillRect(sx - 8, sy - 14, 6, 14);
      c.fillRect(sx + 2, sy - 14, 6, 14);
    }

    c.fillStyle = charData.cloth;
    c.fillRect(sx - 12, sy - bodyH, 24, bodyH - 12);

    const armSwing = Math.sin(this.animFrame * 2.3) * (this.running ? 12 : 6);
    c.fillStyle = charData.skin;
    if (this.walking) {
      c.fillRect(sx - 18, sy - bodyH + 6 + armSwing * 0.5, 6, 18);
      c.fillRect(sx + 12, sy - bodyH + 6 - armSwing * 0.5, 6, 18);
    } else {
      c.fillRect(sx - 18, sy - bodyH + 6, 6, 18);
      c.fillRect(sx + 12, sy - bodyH + 6, 6, 18);
    }

    c.fillStyle = charData.skin;
    c.beginPath(); c.arc(sx, headY, 13, 0, Math.PI * 2); c.fill();

    c.fillStyle = charData.hair;
    if (charData.gender === 'female') {
      c.beginPath(); c.arc(sx, headY - 4, 14, Math.PI, 0); c.fill();
      c.fillRect(sx - 15, headY - 4, 5, 20);
      c.fillRect(sx + 10, headY - 4, 5, 20);
    } else if (charData.gender === 'neutral') {
      c.beginPath(); c.arc(sx, headY - 5, 13, Math.PI, 0); c.fill();
    } else {
      c.beginPath(); c.arc(sx, headY - 6, 12, Math.PI, 0); c.fill();
      c.fillRect(sx - 12, headY - 8, 24, 5);
    }

    c.fillStyle = '#111';
    const eyeOff = this.facing * 3;
    c.beginPath(); c.arc(sx - 4 + eyeOff, headY - 1, 2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(sx + 4 + eyeOff, headY - 1, 2, 0, Math.PI * 2); c.fill();

    if (this.hp < this.maxHp) {
      c.fillStyle = '#333';
      c.fillRect(sx - 16, sy - bodyH - 22, 32, 4);
      c.fillStyle = this.hp > this.maxHp * 0.5 ? '#3a8c5a' : '#c94a4a';
      c.fillRect(sx - 16, sy - bodyH - 22, 32 * (this.hp / this.maxHp), 4);
    }

    if (this.id === 2) {
      c.fillStyle = '#4a4aff';
      c.font = 'bold 10px sans-serif';
      c.fillText('P2', sx - 8, sy - bodyH - 28);
    }
    c.globalAlpha = 1;
  }
}

// ---------- ASKER SINIFI ----------
class Soldier {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.speed = DIFF[game.difficulty].soldierSpeed;
    this.damage = DIFF[game.difficulty].soldierDamage;
    this.chaseRange = DIFF[game.difficulty].chaseRange;
    this.w = 30; this.h = 54;
    this.state = 'patrol';
    this.patrolDir = Math.random() * Math.PI * 2;
    this.patrolTimer = 0;
    this.attackCooldown = 0;
    this.animFrame = 0;
  }

  update(keys) {
    let target = null, minDist = Infinity;
    for (const p of players) {
      if (p.hp <= 0) continue;
      let d = Math.hypot(p.x - this.x, p.y - this.y);
      if (p.crouching) d *= DIFF[game.difficulty].crouchStealth + 0.3;
      if (p.hidden) d *= 3;
      d *= (1 + game.skills.stealth * 0.1);
      if (d < minDist) { minDist = d; target = p; }
    }

    if (target && minDist < this.chaseRange) {
      if (this.state !== 'chase') sfx.alert();
      this.state = 'chase';
      const dx = target.x - this.x, dy = target.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      this.x += (dx / len) * this.speed;
      this.y += (dy / len) * this.speed;
      this.animFrame += 0.2;

      if (Math.hypot(target.x - this.x, target.y - this.y) < 30 && this.attackCooldown <= 0) {
        if (target.invuln <= 0) {
          target.hp -= this.damage;
          target.invuln = 30;
          if (game.shakeEnabled) game.shake = 8;
          sfx.hit();
          spawnParticles(target.x, target.y, '#c94a4a', 8);
          if (target.hp <= 0) target.hp = 0;
        }
        this.attackCooldown = 40;
      }
    } else {
      this.state = 'patrol';
      this.patrolTimer--;
      if (this.patrolTimer <= 0) { this.patrolDir = Math.random() * Math.PI * 2; this.patrolTimer = 60 + Math.random() * 120; }
      this.x += Math.cos(this.patrolDir) * this.speed * 0.4;
      this.y += Math.sin(this.patrolDir) * this.speed * 0.4;
    }

    this.x = Math.max(10, Math.min(MAP_W - 10, this.x));
    this.y = Math.max(10, Math.min(MAP_H - 10, this.y));
    if (this.attackCooldown > 0) this.attackCooldown--;
  }

  draw(c, camX, camY) {
    const sx = this.x - camX, sy = this.y - camY;
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath(); c.ellipse(sx, sy + 4, 16, 6, 0, 0, Math.PI * 2); c.fill();

    const bodyColor = game.colorblind ? '#0066ff' : '#2a3a2a';
    c.fillStyle = bodyColor;
    c.fillRect(sx - 14, sy - 48, 28, 40);
    c.fillStyle = '#d4b896';
    c.beginPath(); c.arc(sx, sy - 56, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1a2a1a';
    c.beginPath(); c.arc(sx, sy - 58, 13, Math.PI, 0); c.fill();
    c.fillStyle = '#1a1a1a';
    c.fillRect(sx + 8, sy - 40, 22, 5);

    if (this.state === 'chase') {
      c.fillStyle = game.colorblind ? '#ff9900' : '#ff3333';
      c.font = 'bold 16px sans-serif';
      c.fillText('!', sx - 4, sy - 75);
      // Görüş konisi
      c.fillStyle = 'rgba(255,50,50,0.08)';
      c.beginPath();
      c.moveTo(sx, sy - 56);
      c.arc(sx, sy - 56, this.chaseRange * 0.6, 0, Math.PI * 2);
      c.fill();
    }
  }
}

// ---------- PARÇACIK SİSTEMİ ----------
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 1,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.1;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles(c, camX, camY) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    c.globalAlpha = alpha;
    c.fillStyle = p.color;
    c.fillRect(p.x - camX - p.size / 2, p.y - camY - p.size / 2, p.size, p.size);
  }
  c.globalAlpha = 1;
}

// ---------- PORTRE ÇİZİMİ ----------
function drawPortrait(portraitName) {
  const pc = document.getElementById('portraitCanvas');
  if (!pc) return;
  const pctx = pc.getContext('2d');
  pctx.clearRect(0, 0, 120, 120);

  const data = PORTRAIT_COLORS[portraitName] || PORTRAIT_COLORS.narrator;
  if (data.style === 'narrator') {
    pctx.fillStyle = '#0a0a1a';
    pctx.fillRect(0, 0, 120, 120);
    pctx.fillStyle = '#4a4aff';
    pctx.font = 'bold 48px sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText('?', 60, 78);
    return;
  }

  // Arka plan
  pctx.fillStyle = '#0a0a1a';
  pctx.fillRect(0, 0, 120, 120);

  const cx = 60, cy = 100;

  // Gövde
  pctx.fillStyle = data.cloth;
  pctx.fillRect(cx - 30, cy - 20, 60, 40);

  // Kafa
  pctx.fillStyle = data.skin;
  pctx.beginPath();
  pctx.arc(cx, cy - 45, 28, 0, Math.PI * 2);
  pctx.fill();

  // Saç
  pctx.fillStyle = data.hair;
  if (data.style === 'female') {
    pctx.beginPath();
    pctx.arc(cx, cy - 50, 30, Math.PI, 0);
    pctx.fill();
    pctx.fillRect(cx - 32, cy - 50, 8, 40);
    pctx.fillRect(cx + 24, cy - 50, 8, 40);
  } else if (data.style === 'soldier') {
    pctx.beginPath();
    pctx.arc(cx, cy - 52, 31, Math.PI, 0);
    pctx.fill();
    pctx.fillStyle = '#1a2a1a';
    pctx.fillRect(cx - 32, cy - 58, 64, 8);
  } else if (data.style === 'neutral') {
    pctx.beginPath();
    pctx.arc(cx, cy - 48, 29, Math.PI, 0);
    pctx.fill();
  } else {
    pctx.beginPath();
    pctx.arc(cx, cy - 52, 28, Math.PI, 0);
    pctx.fill();
    pctx.fillRect(cx - 28, cy - 54, 56, 6);
  }

  // Gözler
  pctx.fillStyle = '#111';
  pctx.beginPath(); pctx.arc(cx - 10, cy - 45, 3, 0, Math.PI * 2); pctx.fill();
  pctx.beginPath(); pctx.arc(cx + 10, cy - 45, 3, 0, Math.PI * 2); pctx.fill();

  // Ağız
  pctx.strokeStyle = '#111';
  pctx.lineWidth = 1.5;
  pctx.beginPath();
  pctx.arc(cx, cy - 35, 6, 0.2, Math.PI - 0.2);
  pctx.stroke();
}

// ---------- ÇİZİM YARDIMCILARI ----------
function drawBackground(c, camX, camY) {
  const grad = c.createLinearGradient(0, 0, 0, H);
  const tod = game.timeOfDay;
  const isNight = charData.atmo === 'night' || (tod >= 20 || tod < 6);
  const isSunset = charData.atmo === 'sunset' || (tod >= 17 && tod < 20);
  const isWinter = charData.atmo === 'winter';

  if (isWinter) {
    grad.addColorStop(0, '#1a1a3a');
    grad.addColorStop(1, '#2a2a4a');
  } else if (isNight) {
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a1a2e');
  } else if (isSunset) {
    grad.addColorStop(0, '#1a0a2e');
    grad.addColorStop(0.5, '#8c3a4a');
    grad.addColorStop(1, '#ff6b4a');
  } else {
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#b0d4e8');
  }
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);

  if (isWinter) c.fillStyle = '#2a2a4a';
  else if (isNight) c.fillStyle = '#151525';
  else if (isSunset) c.fillStyle = '#2a1a2a';
  else c.fillStyle = '#2a4a2a';
  c.fillRect(0, 0, W, H);

  if (isNight || isWinter) {
    c.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137 + game.frame * 0.02) % W;
      const sy = (i * 89) % H;
      c.fillRect(sx, sy, 1, 1);
    }
  }
}

function drawWeather(c) {
  const isNight = charData.atmo === 'night';
  const isWinter = charData.atmo === 'winter';

  if (isNight) {
    c.strokeStyle = 'rgba(150,180,255,0.3)';
    c.lineWidth = 1;
    for (const r of rainDrops) {
      c.beginPath();
      c.moveTo(r.x, r.y);
      c.lineTo(r.x - 2, r.y + 12);
      c.stroke();
    }
  }
  if (isWinter) {
    c.fillStyle = 'rgba(255,255,255,0.8)';
    for (const s of snowFlakes) {
      s.drift += 0.02;
      c.beginPath();
      c.arc(s.x + Math.sin(s.drift) * 15, s.y, 2, 0, Math.PI * 2);
      c.fill();
    }
  }
}

function updateWeather() {
  const isNight = charData.atmo === 'night';
  const isWinter = charData.atmo === 'winter';

  if (isNight) {
    for (const r of rainDrops) {
      r.y += r.speed;
      if (r.y > H) { r.y = -10; r.x = Math.random() * W; }
    }
  }
  if (isWinter) {
    for (const s of snowFlakes) {
      s.y += s.speed;
      if (s.y > H) { s.y = -5; s.x = Math.random() * W; }
    }
  }
}

function drawLighting(c, camX, camY) {
  if (charData.atmo !== 'night' && game.timeOfDay < 20 && game.timeOfDay > 6) return;
  for (const l of lightSources) {
    const lx = l.x - camX, ly = l.y - camY;
    const glow = 0.3 + Math.sin(game.frame * 0.03 + l.phase) * 0.15;
    const grad = c.createRadialGradient(lx, ly, 0, lx, ly, l.radius);
    grad.addColorStop(0, l.color + '44');
    grad.addColorStop(1, 'transparent');
    c.globalAlpha = glow;
    c.fillStyle = grad;
    c.fillRect(lx - l.radius, ly - l.radius, l.radius * 2, l.radius * 2);
  }
  c.globalAlpha = 1;
}

// ---------- YARDIMCILAR ----------
function showElement(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hideElement(id) { document.getElementById(id)?.classList.add('hidden'); }

function setObjective(t) {
  game.objective = t;
  const el = document.getElementById('objective');
  if (el) el.textContent = t;
}

function setChapter(t) {
  const el = document.getElementById('chapter-label');
  if (el) el.textContent = t;
}

function showChapterCard(title, sub, callback) {
  const card = document.getElementById('chapter-card');
  document.getElementById('card-title').textContent = title;
  document.getElementById('card-sub').textContent = sub || '';
  card.classList.remove('hidden');
  setTimeout(() => {
    card.classList.add('hidden');
    if (callback) callback();
  }, 2000);
}

// ---------- HUD GÜNCELLEME ----------
function updateHUD() {
  const t = LANG[game.lang];
  const sm = document.getElementById('stat-money');
  const se = document.getElementById('stat-energy');
  const sc = document.getElementById('stat-caught');
  const st = document.getElementById('stat-time');
  const sv = document.getElementById('stat-visibility');

  if (sm) sm.textContent = `💰 ${Math.floor(game.money)}`;
  if (se) se.textContent = `⚡ ${Math.floor(game.energy)}`;
  if (sc) sc.textContent = `🚨 ${game.caughtCount}/${game.maxCaught}`;
  if (st) {
    const hh = Math.floor(game.timeOfDay).toString().padStart(2, '0');
    const mm = Math.floor((game.timeOfDay % 1) * 60).toString().padStart(2, '0');
    st.textContent = `🕐 ${hh}:${mm}`;
  }
  if (sv) sv.textContent = `👁 ${Math.floor(game.visibility * 100)}%`;

  const rm = document.getElementById('rel-mother');
  const rf = document.getElementById('rel-father');
  const rfr = document.getElementById('rel-friend');
  if (rm) rm.textContent = `👩 ${t.mother}: ${game.relations.mother}`;
  if (rf) rf.textContent = `👨 ${t.father}: ${game.relations.father}`;
  if (rfr) rfr.textContent = `🧑 ${t.friend}: ${game.relations.friend}`;

  const inv = document.getElementById('inventory-bar');
  if (inv) {
    inv.innerHTML = '';
    for (const item of game.inventory) {
      const d = document.createElement('div');
      d.className = 'inv-item';
      d.textContent = item;
      inv.appendChild(d);
    }
  }
}

function addInventory(item) {
  if (!game.inventory.includes(item)) game.inventory.push(item);
  updateHUD();
}

function changeRelation(who, amount) {
  if (game.relations[who] !== undefined) {
    game.relations[who] = Math.max(0, Math.min(100, game.relations[who] + amount));
    updateHUD();
  }
}

// ---------- KAMERA ----------
function getCamera() {
  let camX = 0, camY = 0;
  if (players[0]) {
    camX = Math.max(0, Math.min(MAP_W - W, players[0].x - W / 2));
    camY = Math.max(0, Math.min(MAP_H - H, players[0].y - H / 2));
  }
  return { camX, camY };
}
