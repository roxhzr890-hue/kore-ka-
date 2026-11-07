// ============================================================
// KORE'DEN KAÇIŞ — Veri Dosyası
// Diyaloglar, başarımlar, yetenekler, rotalar, çeviriler
// ============================================================

// ---------- ÇEVİRİLER (TR / EN) ----------
const LANG = {
  tr: {
    newGame: 'Yeni Oyun', continue: 'Devam Et', multi: '2 Kişilik Yerel',
    scores: 'Skor Tablosu', settings: 'Ayarlar', back: 'Geri',
    playerName: 'Oyuncu Adın:', player2Name: '2. Oyuncu Adı:',
    difficulty: 'Zorluk:', easy: 'Kolay', normal: 'Normal', hard: 'Zor',
    charName: 'Karakter Adı', appearance: 'Görünüm', male: 'Erkek',
    female: 'Kız', neutral: 'Nötr', hairColor: 'Saç Rengi',
    skinColor: 'Ten Rengi', clothColor: 'Kıyafet', atmosphere: 'Atmosfer',
    night: 'Gece Neon', day: 'Gündüz', sunset: 'Gün Batımı', winter: 'Kış (Kar)',
    startGame: 'Oyuna Başla', createChar: 'Karakterini Yarat',
    sound: 'Ses', volume: 'Ses Seviyesi', colorblind: 'Renk Körü Modu',
    language: 'Dil / Language', touchControls: 'Mobil Kontroller',
    screenShake: 'Ekran Sarsıntısı', answer: 'Cevapla', ignore: 'Yoksay',
    close: 'Kapat', finish: 'Bitir', continueBtn: '[Boşluk] Devam',
    money: 'Para', energy: 'Enerji', caught: 'Yakalanma', time: 'Saat',
    visibility: 'Görünürlük', mother: 'Anne', father: 'Baba', friend: 'Arkadaş',
    skills: 'Yetenek Ağacı', routes: 'Kaçış Rotası Seç',
    shareResult: '📋 Sonucu Kopyala', mainMenu: 'Ana Menü',
    inventory: 'Envanter', use: 'Kullan', noItems: 'Envanter boş.',
    examTitle: '📝 Suneung Sınavı', workTitle: '💼 İş Molası',
    workDesc: 'Doğru kutulara tıkla, para kazan!',
    earnings: 'Kazanç', remaining: 'kaldı',
    achievement: 'Başarım Kazanıldı!',
    reload: 'Tekrar Oyna', gameOver: 'Oyun Bitti',
  },
  en: {
    newGame: 'New Game', continue: 'Continue', multi: '2 Player Local',
    scores: 'Leaderboard', settings: 'Settings', back: 'Back',
    playerName: 'Player Name:', player2Name: 'Player 2 Name:',
    difficulty: 'Difficulty:', easy: 'Easy', normal: 'Normal', hard: 'Hard',
    charName: 'Character Name', appearance: 'Appearance', male: 'Male',
    female: 'Female', neutral: 'Neutral', hairColor: 'Hair Color',
    skinColor: 'Skin Color', clothColor: 'Clothing', atmosphere: 'Atmosphere',
    night: 'Night Neon', day: 'Day', sunset: 'Sunset', winter: 'Winter (Snow)',
    startGame: 'Start Game', createChar: 'Create Your Character',
    sound: 'Sound', volume: 'Volume', colorblind: 'Colorblind Mode',
    language: 'Language / Dil', touchControls: 'Touch Controls',
    screenShake: 'Screen Shake', answer: 'Answer', ignore: 'Ignore',
    close: 'Close', finish: 'Finish', continueBtn: '[Space] Continue',
    money: 'Money', energy: 'Energy', caught: 'Caught', time: 'Time',
    visibility: 'Visibility', mother: 'Mother', father: 'Father', friend: 'Friend',
    skills: 'Skill Tree', routes: 'Choose Escape Route',
    shareResult: '📋 Copy Result', mainMenu: 'Main Menu',
    inventory: 'Inventory', use: 'Use', noItems: 'Inventory is empty.',
    examTitle: '📝 Suneung Exam', workTitle: '💼 Work Break',
    workDesc: 'Click the right boxes, earn money!',
    earnings: 'Earnings', remaining: 'left',
    achievement: 'Achievement Unlocked!',
    reload: 'Play Again', gameOver: 'Game Over',
  }
};

// ---------- SINAV SORULARI ----------
const EXAM_QUESTIONS = [
  { q: 'Suneung sınavında kaç soru vardır? (yaklaşık)', a: ['50', '100', '200'], correct: 0 },
  { q: "Kore'de en yüksek puanlı üniversite?", a: ['Seul National', 'Koryo', 'KAIST'], correct: 0 },
  { q: 'Hagwon ne demektir?', a: ['Okul', 'Özel dershane', 'Üniversite'], correct: 1 },
  { q: "Kore'de lise son sınıf öğrencileri günde kaç saat uyur? (ortalama)", a: ['8', '6', '4'], correct: 2 },
  { q: 'Suneung hangi ayda yapılır?', a: ['Kasım', 'Mart', 'Haziran'], correct: 0 },
  { q: "Kore'de zorunlu askerlik kaç ay?", a: ['12', '18', '24'], correct: 1 },
  { q: 'Kore kültüründe "hyung" ne demektir?', a: ['Abi', 'Öğretmen', 'Patron'], correct: 0 },
];

// ---------- YETENEK AĞACI ----------
const SKILLS = [
  { id: 'speed', name: 'Hız', desc: 'Hareket hızı +0.3 / seviye', maxLevel: 5, baseCost: 100, icon: '🏃' },
  { id: 'stealth', name: 'Gizlilik', desc: 'Görünürlük -10% / seviye', maxLevel: 5, baseCost: 120, icon: '🌫️' },
  { id: 'stamina', name: 'Dayanıklılık', desc: 'Maks enerji +20 / seviye', maxLevel: 5, baseCost: 80, icon: '⚡' },
  { id: 'health', name: 'Sağlık', desc: 'Maks HP +15 / seviye', maxLevel: 5, baseCost: 150, icon: '❤️' },
  { id: 'charisma', name: 'Karizma', desc: 'Diyalog seçeneklerinde +', maxLevel: 3, baseCost: 200, icon: '✨' },
];

// ---------- KAÇIŞ ROTALARI ----------
const ESCAPE_ROUTES = [
  {
    id: 'mountain', name: 'Dağ Rotası', icon: '🏔️',
    desc: 'Uzun ama asker az. Soğuk ve yorgunluk seni zorlar.',
    diff: 'Kolay-Orta', soldierCount: 4, timeLimit: 180, extraEnergyDrain: true,
  },
  {
    id: 'harbor', name: 'Liman Rotası', icon: '🚢',
    desc: 'Kısa ama asker çok. Hızlı olmalısın.',
    diff: 'Orta', soldierCount: 8, timeLimit: 120, extraEnergyDrain: false,
  },
  {
    id: 'train', name: 'Tren Rotası', icon: '🚂',
    desc: 'En kısa ama en riskli. Yakalanma ihtimali yüksek.',
    diff: 'Zor', soldierCount: 12, timeLimit: 90, extraEnergyDrain: false,
  },
];

// ---------- BAŞARIMLAR (15) ----------
const ACHIEVEMENTS = [
  { id: 'first_escape', title: 'İlk Kaçış', desc: 'İlk kez sınırdan geç.', icon: '🏃' },
  { id: 'rich', title: 'Zengin', desc: '1000 ₩ biriktir.', icon: '💰' },
  { id: 'exam_master', title: 'Sınav Ustası', desc: 'Suneung sınavında 7/7 yap.', icon: '📝' },
  { id: 'no_caught', title: 'Görünmez', desc: 'Hiç yakalanmadan kaç.', icon: '👻' },
  { id: 'friend_saved', title: 'Sadık Dost', desc: 'Arkadaşını kurtar.', icon: '🤝' },
  { id: 'all_routes', title: 'Gezgin', desc: '3 rotayı da dene.', icon: '🗺️' },
  { id: 'night_owl', title: 'Gece Kuşu', desc: 'Gece saat 03:00\'e kadar oyna.', icon: '🦉' },
  { id: 'speedrun', title: 'Hız Şeytanı', desc: '2 dakikadan kısa sürede kaç.', icon: '⚡' },
  { id: 'survivor', title: 'Hayatta Kalan', desc: '3 kez yakalan ama yine de kaç.', icon: '🛡️' },
  { id: 'briber', title: 'Rüşvetçi', desc: 'Sınırda rüşvet ver.', icon: '💵' },
  { id: 'rebel', title: 'Asi', desc: 'Askerlere karşı çık.', icon: '✊' },
  { id: 'family_secret', title: 'Aile Sırrı', desc: 'Babanın geçmişini keşfet.', icon: '🔍' },
  { id: 'all_skills', title: 'Usta', desc: 'Tüm yetenekleri maks yap.', icon: '🌟' },
  { id: 'hard_escape', title: 'Zorlu Zafer', desc: 'Zor modda kaç.', icon: '🔥' },
  { id: 'completionist', title: 'Tamamlayıcı', desc: 'Tüm sonları gör.', icon: '🏆' },
];

// ---------- GÜNLÜK METİNLERİ (bölüm sonu) ----------
const DIARY_ENTRIES = {
  1: 'Bugün yine aynı. Annem sabah kahvaltı hazırladı, babam sınavlardan bahsetti. Ama içimde bir şey var... Bu hayat bana ait değilmiş gibi.',
  2: 'Askerler okulu bastı. Babam yine boyun eğdi. Ben susamadım. İlk kez, susamadım.',
  3: 'Dershanede saatler geçti. Suneung... Her şeyin anahtarı mı, yoksa kilit mi? Bilmiyorum.',
  4: 'İş yerinde patron bağırdı. "Bu ülkede çalışmak nefes almamaktır" dedi. Para biriktiriyorum. Kaçmak için.',
  5: 'Arkadaşım da gelmek istiyor. Ona güvenebilir miyim? Kendime güvenebilir miyim?',
  6: 'Bu gece. Ya kaçarım ya da bu ülkede kaybolurum. Arkama bakmayacağım.',
};

// ---------- GAZETE BAŞLIKLARI (ara sahne) ----------
const NEWSPAPERS = [
  { headline: 'Suneung Sonuçları Açıklandı: 500.000 Öğrenci Beklemede', sub: 'Aileler hagwon ücretlerine milyonlar harcıyor.' },
  { headline: 'Zorunlu Askerlik Süresi Tartışılıyor', sub: 'Kara kuvvetleri 18 ay, hava kuvvetleri 21 ay.' },
  { headline: 'Genç İntihar Oranları Rekor Seviyede', sub: 'Uzmanlar: "Eğitim baskısı çocukları kırıyor."' },
  { headline: 'Hagwon Sektörü 20 Trilyon Won', sub: 'Özel dershane sayısı okul sayısını geçti.' },
];

// ---------- AİLE SIRRI ----------
const FAMILY_SECRET = {
  trigger: 'school_baskin',
  lines: [
    { speaker: 'Anlatıcı', text: 'Babanın çekmecesinde eski bir gazete kupürü buldun. 1997... Askeri darbe.' },
    { speaker: 'Sen', text: '(İçinden) Babam o zamanlar gençmiş. Bir şey yapmış. Bir şey... söylemiş.' },
    { speaker: 'Baban', text: 'Onu buldun demek. Evet. Ben de bir zamanlar senin gibiydim. Ama sustum. Sen susma.' },
  ],
  achievement: 'family_secret',
};

// ---------- FLASHBACK (kaçış sırasında) ----------
const FLASHBACKS = [
  { trigger: 0.25, lines: [
    { speaker: 'Anlatıcı', text: 'Bir an... Çocukluk. Babanla balık tutuyordun. Güneş batıyordu. Mutluydun.' },
  ]},
  { trigger: 0.5, lines: [
    { speaker: 'Anlatıcı', text: 'Annem mutfakta. Kimchi kokusu. "Yemeğini ye, güçlü ol" derdi.' },
  ]},
  { trigger: 0.75, lines: [
    { speaker: 'Anlatıcı', text: 'Arkadaşınla okul bahçesinde. "Bir gün buradan gideceğiz" demiştin. Sözünü tut.' },
  ]},
];

// ---------- DİYALOG: AÇILIŞ (çocukluk) ----------
const DIALOGUE_INTRO = {
  tr: [
    { speaker: 'Anne', portrait: 'mother', text: 'Uyandın mı? Kahvaltı hazır. Bugün okula geç kalma, baban kızar.' },
    { speaker: 'Baba', portrait: 'father', text: 'Bu ülkede başarılı olmak için çok çalışmalısın. Sınavlar her şeydir, unutma.' },
    { speaker: 'Sen', portrait: 'player', text: '(İçinden) Her sabah aynı şey... Ama bugün bir şeyler farklı hissettiriyor.' },
  ],
  en: [
    { speaker: 'Mother', portrait: 'mother', text: "Are you awake? Breakfast is ready. Don't be late for school, your father will be angry." },
    { speaker: 'Father', portrait: 'father', text: 'You must study hard to succeed in this country. Exams are everything, remember.' },
    { speaker: 'You', portrait: 'player', text: '(Inner voice) Same thing every morning... But today feels different.' },
  ]
};

// ---------- DİYALOG: OKUL BASKINI ----------
const DIALOGUE_SCHOOL = {
  tr: [
    { speaker: 'Öğretmen', portrait: 'teacher', text: 'Herkes sıralara! Çabuk! Askerler geliyor!' },
    { speaker: 'Asker', portrait: 'soldier', text: 'Bu bina kapatıldı! Herkes kimlik kontrolüne!' },
    { speaker: 'Baban', portrait: 'father', text: 'Sakın karşı koyma. Bu ülkede askerle konuşulmaz. Başımızı öne eğeceğiz.' },
    { speaker: 'Sen', portrait: 'player', text: '(İçinden) Babam yine boyun eğiyor. Ama ben... dayanamıyorum.' },
  ],
  en: [
    { speaker: 'Teacher', portrait: 'teacher', text: 'Everyone to your seats! Quick! Soldiers are coming!' },
    { speaker: 'Soldier', portrait: 'soldier', text: 'This building is closed! Everyone to ID check!' },
    { speaker: 'Father', portrait: 'father', text: "Don't resist. You don't talk to soldiers in this country. We bow our heads." },
    { speaker: 'You', portrait: 'player', text: "(Inner voice) Father bows again. But I... I can't take it anymore." },
  ]
};

// ---------- DİYALOG: DERSHANE ----------
const DIALOGUE_HAGWON = {
  tr: [
    { speaker: 'Anne', portrait: 'mother', text: 'Dershaneye geç kalıyorsun! Baban bu ay 1 milyon won ödedi, haberin var mı?' },
    { speaker: 'Sen', portrait: 'player', text: '(İçinden) Sadece biraz nefes almak istiyorum...' },
  ],
  en: [
    { speaker: 'Mother', portrait: 'mother', text: "You're late for hagwon! Your father paid 1 million won this month, do you know that?" },
    { speaker: 'You', portrait: 'player', text: '(Inner voice) I just want to breathe a little...' },
  ]
};

// ---------- DİYALOG: İŞ ----------
const DIALOGUE_WORK = {
  tr: [
    { speaker: 'Patron', portrait: 'boss', text: 'Mesai bitmedi! Bu ülkede çalışmak demek, nefes almamak demektir.' },
    { speaker: 'Sen', portrait: 'player', text: '(İçinden) Kaçmak için para lazım. Biraz daha dayan.' },
  ],
  en: [
    { speaker: 'Boss', portrait: 'boss', text: "Shift isn't over! Working in this country means not breathing." },
    { speaker: 'You', portrait: 'player', text: '(Inner voice) I need money to escape. Hold on a little longer.' },
  ]
};

// ---------- DİYALOG: ARKADAŞ ----------
const DIALOGUE_FRIEND = {
  tr: [
    { speaker: 'Arkadaş', portrait: 'friend', text: 'Ben de kaçmak istiyorum. Birlikte gidelim mi?' },
    { speaker: 'Sen', portrait: 'player', text: '(İçinden) Yanımda biri olursa daha güvenli... ama risk de artar.' },
  ],
  en: [
    { speaker: 'Friend', portrait: 'friend', text: 'I want to escape too. Shall we go together?' },
    { speaker: 'You', portrait: 'player', text: '(Inner voice) Safer with someone... but the risk increases too.' },
  ]
};

// ---------- DİYALOG: KAÇIŞ ----------
const DIALOGUE_ESCAPE = {
  tr: [
    { speaker: 'Anlatıcı', portrait: 'narrator', text: 'Gece yarısı. Sınır yakın. Ama askerler her yerde.' },
    { speaker: 'Sen', portrait: 'player', text: 'Buraya kadar. Ya kaçarım ya da bu ülkede kaybolurum.' },
  ],
  en: [
    { speaker: 'Narrator', portrait: 'narrator', text: 'Midnight. Border is close. But soldiers are everywhere.' },
    { speaker: 'You', portrait: 'player', text: 'This is it. Either I escape or I disappear in this country.' },
  ]
};

// ---------- NPC DİYALOGLARI (sokakta) ----------
const NPC_DIALOGUES = {
  tr: [
    { speaker: 'Yaşlı Amca', portrait: 'oldman', text: 'Gençken ben de kaçmayı düşünürdüm. Ama sonra... alıştım. Sen alışma.' },
    { speaker: 'Öğrenci', portrait: 'student', text: 'Suneung\'a 3 ay kaldı. Uyumaya vaktim yok. Sen de mi?' },
    { speaker: 'Satıcı', portrait: 'vendor', text: 'Tteokbokki? Sıcak, taze. Kaçacaksan karnını doyur önce.' },
    { speaker: 'Asker', portrait: 'soldier', text: 'Kimlik. Göster. ...Peki, geç.' },
    { speaker: 'Anne', portrait: 'mother', text: 'Nerede kaldın? Yemek soğudu. Hep böyle yapıyorsun.' },
  ],
  en: [
    { speaker: 'Old Man', portrait: 'oldman', text: 'I thought about escaping when I was young too. But then... I got used to it. Don\'t get used to it.' },
    { speaker: 'Student', portrait: 'student', text: '3 months to Suneung. No time to sleep. You too?' },
    { speaker: 'Vendor', portrait: 'vendor', text: 'Tteokbokki? Hot, fresh. Eat before you escape.' },
    { speaker: 'Soldier', portrait: 'soldier', text: 'ID. Show it. ...Fine, go.' },
    { speaker: 'Mother', portrait: 'mother', text: 'Where were you? Food is cold. You always do this.' },
  ]
};

// ---------- SONLAR ----------
const ENDINGS = {
  bribe: {
    title: 'Rüşvetle Özgürlük',
    text: 'Asker parayı aldı, gözünü çevirdi. Sınırdan geçtin. Ama bu ülke sana hep bir borçlu kalacak...',
    color: '#ffd166',
  },
  run: {
    title: 'Koşarak Özgürlük',
    text: 'Son gücünle koştun. Kurşunlar havada uçuştu ama sen sınıra ulaştın. Özgürsün!',
    color: '#4affb0',
  },
  caught: {
    title: 'Yakalandın',
    text: 'Askerler seni yakaladı. Bu ülkede bir hayat daha sona erdi. Ama belki bir gün...',
    color: '#c94a4a',
  },
  surrender: {
    title: 'Teslim Oldun',
    text: 'Geri döndün. Ama içindeki kaçış isteği hiç sönmeyecek...',
    color: '#ff9a4a',
  },
  friend: {
    title: 'Birlikte Özgürlük',
    text: 'Arkadaşınla birlikte sınırı geçtiniz. Yeni bir hayat, yeni bir başlangıç. Yanınızda bir dost var.',
    color: '#4affb0',
  },
  family: {
    title: 'Aile İknası',
    text: 'Babanı ikna ettin. Birlikte kaçtınız. Aile, bazen en büyük destektir.',
    color: '#ff9ac9',
  },
  exhausted: {
    title: 'Tükendin',
    text: 'Bedenen ve ruhen tükendin. Bu ülke seni kırdı. Ama belki bir başka hayatta...',
    color: '#c94a4a',
  },
};

// ---------- PORTRE RENKLERİ ----------
const PORTRAIT_COLORS = {
  mother: { hair: '#4a2c17', skin: '#f5d0b0', cloth: '#b33a8b', style: 'female' },
  father: { hair: '#1a1a1a', skin: '#e8b88a', cloth: '#3a5a8c', style: 'male' },
  friend: { hair: '#c9a227', skin: '#f5d0b0', cloth: '#3a8c5a', style: 'neutral' },
  teacher: { hair: '#6a6a6a', skin: '#e8b88a', cloth: '#6a3a8c', style: 'male' },
  soldier: { hair: '#1a2a1a', skin: '#d4b896', cloth: '#2a3a2a', style: 'soldier' },
  boss: { hair: '#2a2a2a', skin: '#c98e5a', cloth: '#2a2a2a', style: 'male' },
  oldman: { hair: '#aaaaaa', skin: '#c98e5a', cloth: '#5a5a5a', style: 'male' },
  student: { hair: '#1a1a1a', skin: '#f5d0b0', cloth: '#3a5a8c', style: 'neutral' },
  vendor: { hair: '#4a2c17', skin: '#e8b88a', cloth: '#8c3a3a', style: 'female' },
  player: { hair: '#1a1a1a', skin: '#f5d0b0', cloth: '#3a5a8c', style: 'male' },
  narrator: { hair: '#1a1a1a', skin: '#1a1a1a', cloth: '#1a1a1a', style: 'narrator' },
};
