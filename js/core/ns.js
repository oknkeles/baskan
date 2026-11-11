/* BAŞKAN — ad alanı, sabitler ve kimlik listeleri.
 * Derleme yok: düz <script>. Tarayıcıda (window.BG) ve Node'da (globalThis.BG) çalışır.
 * Her dosya şu kalıbı kullanır:
 *   (function (root) { 'use strict'; var BG = root.BG; ... })(typeof window !== 'undefined' ? window : globalThis);
 */
(function (root) {
  'use strict';
  var BG = root.BG = root.BG || {};
  BG.VERSION = 1;
  BG.data = BG.data || {};

  /** İçerik kaydı. Örn: BG.add('events', [ {...}, {...} ]) — birden çok dosya aynı türe ekleyebilir. */
  BG.add = function (kind, items) {
    var a = BG.data[kind] = BG.data[kind] || [];
    for (var i = 0; i < items.length; i++) a.push(items[i]);
  };
  BG.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  BG.byId = function (list, id) {
    for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  /* ---- Denge sabitleri ---- */
  BG.C = {
    TURNS_PER_TERM: 12,     // bir başkanlık dönemi = 12 mevsim (3 yıl)
    OPP_TURNS: 8,           // muhalefette bir sonraki seçime kadar mevsim sayısı
    CAMPAIGN_TURNS: 3,      // dönemin son 3 mevsimi kampanya dönemi (E.turnsLeft(st) < CAMPAIGN_TURNS)
    CAMPAIGN_MAX: 6,        // kampanya rüzgârının (st.kampanya, her mahallede oya eklenir) üst sınırı
    AP_PER_TURN: 3,         // mevsim başına mesai/enerji puanı
    TERMS_TO_WIN: 3,        // 3 dönem başkanlık → final
    MAX_LOSS_STREAK: 3,     // üst üste 3 seçim kaybı → siyasete veda
    MAX_CRISES: 2,          // ikinci görevden alınma / iflas → siyasete veda
    START_BUDGET: 320,      // milyon ₺
    START_ITIBAR: 60,
    BASE_INCOME: 30,        // mevsimlik gelir = BASE_INCOME + ekonomi * INCOME_PER_EKONOMI
    INCOME_PER_EKONOMI: 0.9,
    UPKEEP_MULT: 1,         // biten projelerin işletme giderinin çarpanı (proje tanımındaki upkeep × bu)
    DEBT_INTEREST: 0.06,    // eksi bütçeye mevsimlik faiz
    CREDIT: 150,            // seçimlerle bütçe en fazla -CREDIT'e inebilir
    BANKRUPT: -350,         // bütçe bunun altına düşerse iflas → görevden alınma
    DECAY: 0.55,            // her mevsim her şehir göstergesi bu kadar yıpranır (DECAY_FLOOR üstündeyse)
    DECAY_FLOOR: 40,
    DRIFT: 0.35,             // grup desteğinin "hak edilen" seviyeye mevsimlik yaklaşma oranı (olay etkileri birkaç mevsimde söner)
    BONUS_KEEP: 0.7,        // mahalle bonusunun mevsimden mevsime kalan oranı (ziyaret/miting etkisi söner)
    ITIBAR_DRIFT: 0.12,     // itibarın mevsimlik 50'ye dönme oranı
    HASAR_VOTE: 0.15,       // mahalle hasarının oy cezası çarpanı
    ITIBAR_VOTE: 0.12,      // (itibar-50) * bu = her mahallede oy etkisi
    OTHER_SHARE: 9,         // küçük adayların oy yüzdesi
    RIVAL_BASE: 49,         // rakip gücü (rakip tanımında base yoksa)
    RIVAL_GROWTH: 2,        // tamamlanan her başkanlık döneminde rakipler bu kadar güçlenir
    RIVAL_RALLY: 1.1,       // yeniden seçilince: (fark − RIVAL_RALLY_FREE) × bu kadar ek rakip gücü (muhalefet birleşir)
    RIVAL_RALLY_FREE: 6,
    RIVAL_RALLY_MAX: 10,
    ELECTION_SWING: 6,      // sandık sürprizi: şehir geneli son an kayması ölçeği (çan biçimli, ±2×bu, σ ≈ 0.58×bu oy puanı)
    EVENTS_PER_TURN: 1,
    KNOCK_CHANCE: 0.3,      // başkanken kapıya vatandaş gelme olasılığı
    REPAIR_COST: 1.5,       // hasar puanı başına onarım maliyeti (milyon ₺)
    OPP_FON: 60,            // muhalefete düşünce başlangıç kampanya fonu
    OPP_GONULLU: 8,
    OPP_INCUMBENCY: 12      // muhalefetteyken koltuktaki başkanın gücüne eklenen makam avantajı
  };

  /* ---- Şehir göstergeleri (0..100) ---- */
  BG.STATS = [
    { id: 'ulasim',   name: 'Ulaşım',         emoji: '🚌', start: 48 },
    { id: 'altyapi',  name: 'Altyapı',        emoji: '🚰', start: 50 },
    { id: 'cevre',    name: 'Çevre',          emoji: '🌳', start: 52 },
    { id: 'ekonomi',  name: 'Ekonomi',        emoji: '💼', start: 50 },
    { id: 'guvenlik', name: 'Güvenlik',       emoji: '🚓', start: 54 },
    { id: 'sosyal',   name: 'Sosyal Yaşam',   emoji: '🎭', start: 48 },
    { id: 'afet',     name: 'Afet Hazırlığı', emoji: '🧯', start: 34 }
  ];

  /* ---- Seçmen grupları: oyuncuya destek 0..100. cares = hangi göstergeyi ne kadar önemser (toplam 1) ---- */
  BG.GROUPS = [
    { id: 'esnaf',    name: 'Esnaf',      emoji: '🛒', cares: { ekonomi: 0.40, ulasim: 0.20, guvenlik: 0.25, altyapi: 0.15 } },
    { id: 'genc',     name: 'Gençler',    emoji: '🎧', cares: { sosyal: 0.35, ulasim: 0.25, ekonomi: 0.25, cevre: 0.15 } },
    { id: 'emekli',   name: 'Emekliler',  emoji: '👵', cares: { sosyal: 0.25, guvenlik: 0.25, altyapi: 0.25, ulasim: 0.15, afet: 0.10 } },
    { id: 'isci',     name: 'Emekçiler',  emoji: '👷', cares: { ekonomi: 0.35, ulasim: 0.25, altyapi: 0.20, sosyal: 0.10, afet: 0.10 } },
    { id: 'cevreci',  name: 'Çevreciler', emoji: '🌿', cares: { cevre: 0.55, afet: 0.15, ulasim: 0.15, sosyal: 0.15 } },
    { id: 'isinsani', name: 'İş Dünyası', emoji: '💰', cares: { ekonomi: 0.50, altyapi: 0.20, guvenlik: 0.20, ulasim: 0.10 } }
  ];

  /* ---- Kaynaklar (st.res) ---- */
  BG.RES = [
    { id: 'butce',   name: 'Bütçe',          emoji: '💰' },  // milyon ₺ (belediye kasası; eksiye düşebilir)
    { id: 'itibar',  name: 'İtibar',         emoji: '⭐' },  // 0..100 kişisel güvenilirlik
    { id: 'fon',     name: 'Kampanya Fonu',  emoji: '🪙' },  // muhalefet modunda harcanır (>=0)
    { id: 'gonullu', name: 'Gönüllüler',     emoji: '🙋' }   // muhalefet modunda (>=0)
  ];

  /* ---- Afet risk anahtarları (mahalle.risk içinde 0..3) ---- */
  BG.RISKS = ['deprem', 'sel', 'yangin', 'kar', 'kuraklik', 'salgin'];

  /* ---- Mahalleler: pop toplamı 100, mix toplamı 1 ---- */
  BG.DISTRICTS = [
    { id: 'carsi',     name: 'Çarşı',     emoji: '🏬', pop: 20, desc: 'Tarihi çarşı, dar sokaklar, bitmeyen otopark kavgası.',
      mix: { esnaf: 0.40, emekli: 0.20, isci: 0.15, genc: 0.10, isinsani: 0.10, cevreci: 0.05 },
      risk: { deprem: 2, sel: 1, yangin: 2, kar: 1, kuraklik: 1, salgin: 2 } },
    { id: 'sahil',     name: 'Sahil',     emoji: '🏖️', pop: 14, desc: 'Kordon, balıkçılar, pahalı kafeler ve arsız martılar.',
      mix: { isinsani: 0.25, cevreci: 0.25, genc: 0.20, esnaf: 0.15, emekli: 0.15 },
      risk: { deprem: 1, sel: 3, yangin: 0, kar: 0, kuraklik: 1, salgin: 1 } },
    { id: 'yokusbasi', name: 'Yokuşbaşı', emoji: '🏘️', pop: 18, desc: 'Eski apartmanlar, dik yokuşlar, her şeyi bilen teyzeler.',
      mix: { emekli: 0.40, isci: 0.25, esnaf: 0.15, genc: 0.10, cevreci: 0.10 },
      risk: { deprem: 3, sel: 1, yangin: 1, kar: 2, kuraklik: 1, salgin: 2 } },
    { id: 'sanayi',    name: 'Sanayi',    emoji: '🏭', pop: 20, desc: 'Atölyeler, fabrikalar, vardiya servisleri ve çay ocakları.',
      mix: { isci: 0.50, esnaf: 0.15, isinsani: 0.15, genc: 0.10, emekli: 0.10 },
      risk: { deprem: 2, sel: 2, yangin: 3, kar: 1, kuraklik: 1, salgin: 2 } },
    { id: 'kampus',    name: 'Kampüs',    emoji: '🎓', pop: 15, desc: 'Üniversite, öğrenci evleri, sabaha kadar açık tostçular.',
      mix: { genc: 0.55, cevreci: 0.15, esnaf: 0.10, isci: 0.10, isinsani: 0.10 },
      risk: { deprem: 1, sel: 1, yangin: 1, kar: 1, kuraklik: 1, salgin: 3 } },
    { id: 'baglar',    name: 'Bağlar',    emoji: '🍇', pop: 13, desc: 'Bağ evleri, orman kenarı, pazarcılar ve keçiler.',
      mix: { cevreci: 0.30, emekli: 0.30, isci: 0.20, esnaf: 0.10, genc: 0.10 },
      risk: { deprem: 1, sel: 2, yangin: 3, kar: 3, kuraklik: 3, salgin: 0 } }
  ];

  /* ---- Mevsimler: oyun ilkbaharda başlar; mevsim = (toplamTur-1) % 4 ---- */
  BG.SEASONS = [
    { id: 'ilkbahar', name: 'İlkbahar', emoji: '🌸' },
    { id: 'yaz',      name: 'Yaz',      emoji: '☀️' },
    { id: 'sonbahar', name: 'Sonbahar', emoji: '🍂' },
    { id: 'kis',      name: 'Kış',      emoji: '❄️' }
  ];

  /* ---- Olay kategorileri ---- */
  BG.CATS = {
    ulasim: 'Ulaşım', altyapi: 'Altyapı', cevre: 'Çevre', ekonomi: 'Ekonomi', guvenlik: 'Güvenlik',
    sosyal: 'Sosyal Yaşam', afet: 'Afet Hazırlığı', siyaset: 'Siyaset', absurt: 'Şehir Halleri'
  };

  /* ---- Birebir görüşme: üsluplar ve mizaçlar (mizaç × üslup = ikna düzeltmesi) ---- */
  BG.TONES = { samimi: 'Samimi', veri: 'Somut veri', vaat: 'Vaat', espri: 'Espri', sert: 'Sert çıkış' };
  BG.MIZAC = {
    supheci:   { name: 'Şüpheci',   mods: { samimi: 2,  veri: 6,  vaat: -8, espri: -2, sert: -4 } },
    duygusal:  { name: 'Duygusal',  mods: { samimi: 8,  veri: -4, vaat: 2,  espri: 2,  sert: -8 } },
    pragmatik: { name: 'Pragmatik', mods: { samimi: -2, veri: 4,  vaat: 5,  espri: -3, sert: 0 } },
    ofkeli:    { name: 'Öfkeli',    mods: { samimi: 6,  veri: 0,  vaat: -6, espri: -8, sert: 3 } },
    neseli:    { name: 'Neşeli',    mods: { samimi: 3,  veri: -4, vaat: 0,  espri: 8,  sert: -6 } }
  };

  /* ---- Etki anahtarı → görünen ad/emoji ---- */
  var SPECIAL = {
    halk:    { name: 'Halk desteği',    emoji: '👥' },
    enerji:  { name: 'Mesai',           emoji: '⚡' },
    rakip:   { name: 'Rakibin gücü',    emoji: '🥊' },
    mahalle: { name: 'Mahalle desteği', emoji: '📍' },
    hasar:   { name: 'Hasar',           emoji: '🏚️' },
    kriz:    { name: 'Kriz yönetimi',   emoji: '🚨' },
    skor:    { name: 'Miras puanı',     emoji: '🏆' }
  };
  BG.label = function (key) {
    return BG.byId(BG.STATS, key) || BG.byId(BG.GROUPS, key) || BG.byId(BG.RES, key) || SPECIAL[key] || { name: key, emoji: '' };
  };
  BG.SPECIAL_KEYS = Object.keys(SPECIAL);
})(typeof window !== 'undefined' ? window : globalThis);
