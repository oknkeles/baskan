/* BAŞKAN — İÇERİK SÖZLEŞMESİ + doğrulayıcılar.
 * Tüm içerik BG.add(tür, [...]) ile js/data/*.js dosyalarından kaydedilir. Örnekler: js/data/starter.js
 * Doğrulama:  node tools/validate.js            (tüm oyun)
 *             node tools/validate.js js/data/x.js  (yalnız çekirdek + starter + o dosya)
 *
 * ── ORTAK YAPILAR ──────────────────────────────────────────────────────────────
 * ETKİ (effects): düz nesne, anahtar → tam sayı delta.
 *   şehir göstergeleri: ulasim altyapi cevre ekonomi guvenlik sosyal afet        (0..100)
 *   grup desteği:       esnaf genc emekli isci cevreci isinsani | halk (= hepsi)  (0..100)
 *   kaynaklar:          butce (milyon ₺) itibar (0..100) fon gonullu
 *   özel:               mahalle (hedef mahallenin yerel desteği, -30..30)  hasar (hedef mahalle hasarı 0..100)
 *                       rakip (rakibin gücü)  enerji (bu mevsimki mesai)  kriz (afet karnesi)  skor
 *   bayrak/zincir:      flag: 'ad' | ['a','b']   unflag: 'ad'   sonra: { id: 'olay_id', tur: 2 }  (N mevsim sonra o olayı tetikler)
 *   `mahalle`/`hasar` yalnızca öğenin bir mahallesi varsa kullanılabilir (event.district, yer:'mahalle', afet, diyalog).
 *   Büyüklük rehberi: küçük 2–4, orta 5–8, büyük 9–14 (nadir). halk en çok ±5. Kabaca 12 milyon ₺ ≈ 1 puan.
 *
 * KOŞUL (when/kosul): { min:{anahtar:değer}, max:{anahtar:değer}, flag, notFlag, mode:'mayor'|'opposition',
 *                       season:'kis'|[...], project:'id'|[...] (tamamlanmış), notProject:'id'|[...] }
 *   min/max anahtarları: tüm gösterge/grup/kaynak id'leri + anket (oy %), rakip, tur (dönem içi mevsim no),
 *   donem (seçim döngüsü no, 1'den), kalan (seçime kalan mevsim), enerji, hasar (en hasarlı mahalle), kayip (üst üste kayıp)
 *
 * MALİYET (cost): { butce, fon, gonullu, enerji } — pozitif tam sayılar. Ödenemiyorsa seçenek kilitlenir.
 *
 * SEÇENEK (choice) — olay, afet aşaması ve görev seçeneklerinde aynı:
 *   { text, hint?, cost?, when?, whyNot?, effects?, result, outcomes?: [ { p, effects, result }, ... ] }
 *   outcomes varsa: önce effects/result uygulanır, sonra p olasılığıyla (toplam 1) bir sonuç eklenir.
 *   Her seçenek listesinde en az bir seçenek MALİYETSİZ ve KOŞULSUZ olmalı (oyuncu asla kilitlenmesin).
 *
 * Metin yer tutucuları: {sehir} {baskan} {rakip} {mahalle}
 *
 * ── TÜRLER ─────────────────────────────────────────────────────────────────────
 * events    { id, cat (BG.CATS), modes?:['mayor'|'opposition'] (vars. ['mayor']), title, text, speaker?:{name,role,emoji},
 *             district?: mahalleId|'rastgele', weight? (vars. 1; 0 = yalnız `sonra` ile gelir), when?, repeat? (vars. false),
 *             choices: 2–4 seçenek }
 * projects  { id, name, emoji, cat (gösterge id), desc, cost (20..500), turns (1..6), upkeep (0..12), yer:'sehir'|'mahalle',
 *             when?, once? (vars. true; mahalle projesinde mahalle başına bir kez), start?: etki (başlarken),
 *             effects: etki (bitince), doneText }
 * disasters { id, name, emoji, seasons?, chance (0.01..0.2 / mevsim), riskKey (BG.RISKS), prep:[gösterge id] (şiddeti azaltır),
 *             intro:{1,2,3} (şiddete göre metin), impact:{1,2,3} (anlık etki), stages: 2–3 × { title, text, minSev?, choices },
 *             aftermath:{ good, bad }, opp:{ text, choices } (muhalefetteyken tek karar; maliyet enerji/fon/gonullu) }
 * dialogues { id, modes?, kisi:{ name, age, job, emoji, group }, district?, mizac (BG.MIZAC), intro, start (10..60), hedef (55..90),
 *             when?, rounds: 3–4 × { line, options: 3 × { text, tone (BG.TONES), ikna (-20..25), when? (doğruluk koşulu; tutmuyorsa
 *             seçenek BLÖF olur), reply, replyBlof? (blöf yakalanınca) } }, success:{ text, effects }, fail:{ text, effects } }
 * missions  { id, name, emoji, desc, cost:{ enerji (1..3), fon?, gonullu? }, when?, cooldown? (0..6), yer:'sehir'|'mahalle',
 *             kind:'olay'|'diyalog', text + choices (2–3; kind 'olay' için) }
 * rivals    { id, name, title, emoji, slogan, bio, base (40..58), groups:{grupId:-15..15}, govern:{göstergeId:-3..3} (başkan olursa
 *             mevsimlik etki), taunts:[≥3], winQuote, loseQuote }
 * rivalNews { id, rival? (rakip id; yoksa herkes), title, text, effects, when? }  — muhalefetteyken başkanın icraat haberleri
 * promises  { id, text, emoji, boost: etki (söz verince), kosul: koşul (tutulmuş sayılma şartı), sure (4..11 mevsim),
 *             tut: etki, tutText, boz: etki, bozText, when? }
 * headlines { text, when? }          — gazete manşeti
 * tweets    { user:'@...', text, when? }  — halkın sesi
 */
(function (root) {
  'use strict';
  var BG = root.BG, V = BG.schema = {};
  function ids(list) { return list.map(function (x) { return x.id; }); }
  var STAT = ids(BG.STATS), GROUP = ids(BG.GROUPS), RES = ids(BG.RES), DIST = ids(BG.DISTRICTS), SEAS = ids(BG.SEASONS);
  var NUM_KEYS = STAT.concat(GROUP, RES, BG.SPECIAL_KEYS);
  var COND_VALS = STAT.concat(GROUP, RES, ['anket', 'rakip', 'tur', 'donem', 'kalan', 'enerji', 'hasar', 'kayip']);
  var COST_KEYS = ['butce', 'fon', 'gonullu', 'enerji'];
  var LIMIT = { butce: 400, hasar: 60, halk: 8, itibar: 15, fon: 80, gonullu: 20, enerji: 2, rakip: 10, mahalle: 12, kriz: 3, skor: 50 };
  var PLACEHOLDERS = ['sehir', 'baskan', 'rakip', 'mahalle'];

  function isObj(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function isInt(x) { return typeof x === 'number' && x === Math.round(x); }
  function between(x, a, b) { return typeof x === 'number' && x >= a && x <= b; }

  function text(v, p, err, max, optional) {
    if (v == null && optional) return;
    if (typeof v !== 'string' || !v.trim()) return err(p + ': metin gerekli');
    if (max && v.length > max) err(p + ': çok uzun (' + v.length + ' > ' + max + ')');
    (v.match(/\{(\w+)\}/g) || []).forEach(function (m) {
      if (PLACEHOLDERS.indexOf(m.slice(1, -1)) < 0) err(p + ': bilinmeyen yer tutucu ' + m);
    });
  }
  function strList(v) { return typeof v === 'string' ? !!v : Array.isArray(v) && v.length > 0 && v.every(function (s) { return typeof s === 'string' && s; }); }

  function effects(e, p, err, ctx) {
    if (e == null) return;
    if (!isObj(e)) return err(p + ': etkiler nesne olmalı');
    Object.keys(e).forEach(function (k) {
      var v = e[k];
      if (k === 'flag' || k === 'unflag') { if (!strList(v)) err(p + '.' + k + ': metin ya da metin dizisi olmalı'); return; }
      if (k === 'sonra') {
        if (!isObj(v) || typeof v.id !== 'string' || !between(v.tur, 1, 12)) err(p + '.sonra: { id, tur: 1..12 } olmalı');
        else ctx.refs.push({ kind: 'events', id: v.id, at: p + '.sonra' });
        return;
      }
      if (NUM_KEYS.indexOf(k) < 0) return err(p + ': bilinmeyen etki anahtarı "' + k + '"');
      if (!isInt(v)) return err(p + '.' + k + ': tam sayı olmalı');
      var lim = LIMIT[k] || 25;
      if (Math.abs(v) > lim) err(p + '.' + k + ': ' + v + ' sınırı aşıyor (en çok ±' + lim + ')');
      if ((k === 'mahalle' || k === 'hasar') && !ctx.hasDistrict) err(p + '.' + k + ': öğede mahalle tanımlı değil');
    });
  }

  function cond(c, p, err, ctx) {
    if (c == null) return;
    if (!isObj(c)) return err(p + ': koşul nesne olmalı');
    Object.keys(c).forEach(function (k) {
      var v = c[k];
      if (k === 'min' || k === 'max') {
        if (!isObj(v)) return err(p + '.' + k + ': nesne olmalı');
        Object.keys(v).forEach(function (kk) {
          if (COND_VALS.indexOf(kk) < 0) err(p + '.' + k + ': bilinmeyen değer "' + kk + '"');
          else if (typeof v[kk] !== 'number') err(p + '.' + k + '.' + kk + ': sayı olmalı');
        });
      } else if (k === 'flag' || k === 'notFlag') { if (!strList(v)) err(p + '.' + k + ': metin ya da dizi olmalı'); }
      else if (k === 'mode') { if (v !== 'mayor' && v !== 'opposition') err(p + '.mode: mayor|opposition'); }
      else if (k === 'season') { [].concat(v).forEach(function (s) { if (SEAS.indexOf(s) < 0) err(p + '.season: bilinmeyen mevsim "' + s + '"'); }); }
      else if (k === 'project' || k === 'notProject') { [].concat(v).forEach(function (id) { ctx.refs.push({ kind: 'projects', id: id, at: p + '.' + k }); }); }
      else err(p + ': bilinmeyen koşul anahtarı "' + k + '"');
    });
  }

  function cost(c, p, err, allowed) {
    if (c == null) return;
    if (!isObj(c)) return err(p + ': maliyet nesne olmalı');
    Object.keys(c).forEach(function (k) {
      if ((allowed || COST_KEYS).indexOf(k) < 0) err(p + ': burada kullanılamayan maliyet "' + k + '"');
      else if (!isInt(c[k]) || c[k] <= 0) err(p + '.' + k + ': pozitif tam sayı olmalı');
    });
  }

  function choices(list, p, err, ctx, min, max, costKeys) {
    if (!Array.isArray(list) || list.length < min || list.length > max) return err(p + ': ' + min + '–' + max + ' seçenek olmalı');
    var free = false;
    list.forEach(function (ch, i) {
      var q = p + '[' + i + ']';
      if (!isObj(ch)) return err(q + ': nesne olmalı');
      text(ch.text, q + '.text', err, 80);
      text(ch.hint, q + '.hint', err, 90, true);
      cost(ch.cost, q + '.cost', err, costKeys);
      cond(ch.when, q + '.when', err, ctx);
      text(ch.whyNot, q + '.whyNot', err, 60, true);
      effects(ch.effects, q + '.effects', err, ctx);
      text(ch.result, q + '.result', err, 320, !!ch.outcomes);
      if (ch.outcomes != null) {
        if (!Array.isArray(ch.outcomes) || ch.outcomes.length < 2 || ch.outcomes.length > 3) err(q + '.outcomes: 2–3 sonuç olmalı');
        else {
          var sum = 0;
          ch.outcomes.forEach(function (o, j) {
            var r = q + '.outcomes[' + j + ']';
            if (!between(o.p, 0.05, 0.95)) err(r + '.p: 0.05..0.95'); else sum += o.p;
            effects(o.effects, r + '.effects', err, ctx);
            text(o.result, r + '.result', err, 280);
          });
          if (Math.abs(sum - 1) > 0.011) err(q + '.outcomes: olasılıklar toplamı 1 olmalı (' + sum.toFixed(2) + ')');
        }
      }
      if (!ch.cost && !ch.when) free = true;
    });
    if (!free) err(p + ': en az bir seçenek maliyetsiz ve koşulsuz olmalı');
  }

  function modes(m, p, err) {
    if (m == null) return;
    if (!Array.isArray(m) || !m.length || !m.every(function (x) { return x === 'mayor' || x === 'opposition'; })) err(p + '.modes: ["mayor"] / ["opposition"] / ikisi');
  }
  function idOk(v, p, err) { if (typeof v !== 'string' || !/^[a-z0-9_]+$/.test(v)) err(p + ': id küçük_harf_alt_çizgi olmalı'); }
  function emoji(v, p, err) { if (typeof v !== 'string' || !v || v.length > 12) err(p + '.emoji gerekli'); }
  function effMap(m, p, err, allowed, lo, hi) {
    if (m == null) return;
    if (!isObj(m)) return err(p + ': nesne olmalı');
    Object.keys(m).forEach(function (k) {
      if (allowed.indexOf(k) < 0) err(p + ': bilinmeyen anahtar "' + k + '"');
      else if (!isInt(m[k]) || m[k] < lo || m[k] > hi) err(p + '.' + k + ': ' + lo + '..' + hi + ' tam sayı');
    });
  }

  V.kinds = {
    events: function (x, p, err, ctx) {
      idOk(x.id, p + '.id', err);
      if (!BG.CATS[x.cat]) err(p + '.cat: bilinmeyen kategori "' + x.cat + '"');
      modes(x.modes, p, err);
      text(x.title, p + '.title', err, 60); text(x.text, p + '.text', err, 420);
      if (x.speaker != null) { text(x.speaker.name, p + '.speaker.name', err, 40); text(x.speaker.role, p + '.speaker.role', err, 60); emoji(x.speaker.emoji, p + '.speaker', err); }
      if (x.district != null && x.district !== 'rastgele' && DIST.indexOf(x.district) < 0) err(p + '.district: bilinmeyen mahalle');
      if (x.weight != null && !between(x.weight, 0, 5)) err(p + '.weight: 0..5');
      cond(x.when, p + '.when', err, ctx);
      ctx.hasDistrict = x.district != null;
      var opp = x.modes && x.modes.indexOf('mayor') < 0;
      choices(x.choices, p + '.choices', err, ctx, 2, 4, opp ? ['fon', 'gonullu', 'enerji'] : ['butce', 'enerji']);
    },
    projects: function (x, p, err, ctx) {
      idOk(x.id, p + '.id', err);
      text(x.name, p + '.name', err, 40); emoji(x.emoji, p, err); text(x.desc, p + '.desc', err, 140);
      if (STAT.indexOf(x.cat) < 0) err(p + '.cat: gösterge id olmalı');
      if (!isInt(x.cost) || !between(x.cost, 20, 500)) err(p + '.cost: 20..500');
      if (!isInt(x.turns) || !between(x.turns, 1, 6)) err(p + '.turns: 1..6');
      if (!isInt(x.upkeep) || !between(x.upkeep, 0, 12)) err(p + '.upkeep: 0..12');
      if (x.yer !== 'sehir' && x.yer !== 'mahalle') err(p + '.yer: sehir|mahalle');
      cond(x.when, p + '.when', err, ctx);
      ctx.hasDistrict = x.yer === 'mahalle';
      effects(x.start, p + '.start', err, ctx);
      if (!isObj(x.effects) || !Object.keys(x.effects).length) err(p + '.effects gerekli'); else effects(x.effects, p + '.effects', err, ctx);
      text(x.doneText, p + '.doneText', err, 220);
    },
    disasters: function (x, p, err, ctx) {
      idOk(x.id, p + '.id', err); text(x.name, p + '.name', err, 30); emoji(x.emoji, p, err);
      if (x.seasons != null) [].concat(x.seasons).forEach(function (s) { if (SEAS.indexOf(s) < 0) err(p + '.seasons: bilinmeyen mevsim'); });
      if (!between(x.chance, 0.01, 0.2)) err(p + '.chance: 0.01..0.2');
      if (BG.RISKS.indexOf(x.riskKey) < 0) err(p + '.riskKey: ' + BG.RISKS.join('|'));
      if (!Array.isArray(x.prep) || !x.prep.length || !x.prep.every(function (s) { return STAT.indexOf(s) >= 0; })) err(p + '.prep: gösterge id dizisi');
      ctx.hasDistrict = true;
      [1, 2, 3].forEach(function (s) {
        text((x.intro || {})[s], p + '.intro.' + s, err, 320);
        if (!isObj((x.impact || {})[s])) err(p + '.impact.' + s + ' gerekli'); else effects(x.impact[s], p + '.impact.' + s, err, ctx);
      });
      if (!Array.isArray(x.stages) || x.stages.length < 2 || x.stages.length > 3) err(p + '.stages: 2–3 aşama');
      else x.stages.forEach(function (sg, i) {
        var q = p + '.stages[' + i + ']';
        text(sg.title, q + '.title', err, 50); text(sg.text, q + '.text', err, 360);
        if (sg.minSev != null && !between(sg.minSev, 1, 3)) err(q + '.minSev: 1..3');
        choices(sg.choices, q + '.choices', err, ctx, 2, 4, ['butce', 'enerji']);
      });
      text((x.aftermath || {}).good, p + '.aftermath.good', err, 280); text((x.aftermath || {}).bad, p + '.aftermath.bad', err, 280);
      if (!isObj(x.opp)) err(p + '.opp gerekli');
      else { text(x.opp.text, p + '.opp.text', err, 360); choices(x.opp.choices, p + '.opp.choices', err, ctx, 2, 3, ['fon', 'gonullu', 'enerji']); }
    },
    dialogues: function (x, p, err, ctx) {
      idOk(x.id, p + '.id', err); modes(x.modes, p, err);
      var k = x.kisi || {};
      text(k.name, p + '.kisi.name', err, 40); text(k.job, p + '.kisi.job', err, 50); emoji(k.emoji, p + '.kisi', err);
      if (!between(k.age, 16, 99)) err(p + '.kisi.age: 16..99');
      if (GROUP.indexOf(k.group) < 0) err(p + '.kisi.group: grup id olmalı');
      if (x.district != null && DIST.indexOf(x.district) < 0) err(p + '.district: bilinmeyen mahalle');
      var mz = BG.MIZAC[x.mizac];
      if (!mz) err(p + '.mizac: ' + Object.keys(BG.MIZAC).join('|'));
      text(x.intro, p + '.intro', err, 200);
      if (!between(x.start, 10, 60)) err(p + '.start: 10..60');
      if (!between(x.hedef, 55, 90) || x.hedef < x.start + 15) err(p + '.hedef: 55..90 ve start+15 üstü');
      cond(x.when, p + '.when', err, ctx);
      ctx.hasDistrict = true;
      var best = x.start, worst = x.start;
      if (!Array.isArray(x.rounds) || x.rounds.length < 3 || x.rounds.length > 4) err(p + '.rounds: 3–4 tur');
      else x.rounds.forEach(function (r, i) {
        var q = p + '.rounds[' + i + ']', hi = -99, lo = 99;
        text(r.line, q + '.line', err, 260);
        if (!Array.isArray(r.options) || r.options.length !== 3) return err(q + '.options: tam 3 seçenek');
        r.options.forEach(function (o, j) {
          var w = q + '.options[' + j + ']';
          text(o.text, w + '.text', err, 140); text(o.reply, w + '.reply', err, 200);
          if (!BG.TONES[o.tone]) err(w + '.tone: ' + Object.keys(BG.TONES).join('|'));
          if (!isInt(o.ikna) || !between(o.ikna, -20, 25)) err(w + '.ikna: -20..25');
          cond(o.when, w + '.when', err, ctx);
          if (o.when) text(o.replyBlof, w + '.replyBlof', err, 200);
          var eff = (o.ikna || 0) + (mz ? mz.mods[o.tone] || 0 : 0);
          if (!o.when) { hi = Math.max(hi, eff); }   // blöfsüz en iyi yol
          lo = Math.min(lo, eff);
        });
        best += hi > -99 ? hi : 0; worst += lo;
      });
      if (best < x.hedef + 4) err(p + ': blöfsüz en iyi yolla bile hedefe ulaşılamıyor (' + best + ' < ' + (x.hedef + 4) + ')');
      if (worst >= x.hedef) err(p + ': en kötü yolla bile kazanılıyor — gerilim yok');
      ['success', 'fail'].forEach(function (s) {
        if (!isObj(x[s])) return err(p + '.' + s + ' gerekli');
        text(x[s].text, p + '.' + s + '.text', err, 260); effects(x[s].effects, p + '.' + s + '.effects', err, ctx);
      });
    },
    missions: function (x, p, err, ctx) {
      idOk(x.id, p + '.id', err); text(x.name, p + '.name', err, 40); emoji(x.emoji, p, err); text(x.desc, p + '.desc', err, 160);
      cost(x.cost, p + '.cost', err, ['enerji', 'fon', 'gonullu']);
      if (!x.cost || !between(x.cost.enerji, 1, 3)) err(p + '.cost.enerji: 1..3 gerekli');
      cond(x.when, p + '.when', err, ctx);
      if (x.cooldown != null && !between(x.cooldown, 0, 6)) err(p + '.cooldown: 0..6');
      if (x.yer !== 'sehir' && x.yer !== 'mahalle') err(p + '.yer: sehir|mahalle');
      ctx.hasDistrict = x.yer === 'mahalle';
      if (x.kind === 'olay') { text(x.text, p + '.text', err, 420); choices(x.choices, p + '.choices', err, ctx, 2, 3, ['fon', 'gonullu']); }
      else if (x.kind !== 'diyalog') err(p + '.kind: olay|diyalog');
    },
    rivals: function (x, p, err) {
      idOk(x.id, p + '.id', err); text(x.name, p + '.name', err, 40); text(x.title, p + '.title', err, 50); emoji(x.emoji, p, err);
      text(x.slogan, p + '.slogan', err, 80); text(x.bio, p + '.bio', err, 240);
      if (!between(x.base, 40, 58)) err(p + '.base: 40..58');
      effMap(x.groups, p + '.groups', err, GROUP, -15, 15); effMap(x.govern, p + '.govern', err, STAT, -3, 3);
      if (!Array.isArray(x.taunts) || x.taunts.length < 3) err(p + '.taunts: en az 3');
      else x.taunts.forEach(function (t, i) { text(t, p + '.taunts[' + i + ']', err, 160); });
      text(x.winQuote, p + '.winQuote', err, 200); text(x.loseQuote, p + '.loseQuote', err, 200);
    },
    rivalNews: function (x, p, err, ctx) {
      idOk(x.id, p + '.id', err);
      if (x.rival != null) ctx.refs.push({ kind: 'rivals', id: x.rival, at: p + '.rival' });
      text(x.title, p + '.title', err, 70); text(x.text, p + '.text', err, 300);
      ctx.hasDistrict = false;
      if (!isObj(x.effects)) err(p + '.effects gerekli'); else effects(x.effects, p + '.effects', err, ctx);
      cond(x.when, p + '.when', err, ctx);
    },
    promises: function (x, p, err, ctx) {
      idOk(x.id, p + '.id', err); text(x.text, p + '.text', err, 90); emoji(x.emoji, p, err);
      ctx.hasDistrict = false;
      effects(x.boost, p + '.boost', err, ctx);
      if (!isObj(x.kosul) || !Object.keys(x.kosul).length) err(p + '.kosul gerekli'); else cond(x.kosul, p + '.kosul', err, ctx);
      if (!isInt(x.sure) || !between(x.sure, 4, 11)) err(p + '.sure: 4..11');
      effects(x.tut, p + '.tut', err, ctx); text(x.tutText, p + '.tutText', err, 200);
      effects(x.boz, p + '.boz', err, ctx); text(x.bozText, p + '.bozText', err, 200);
      cond(x.when, p + '.when', err, ctx);
    },
    headlines: function (x, p, err, ctx) { text(x.text, p + '.text', err, 110); cond(x.when, p + '.when', err, ctx); },
    tweets: function (x, p, err, ctx) {
      if (typeof x.user !== 'string' || x.user[0] !== '@' || x.user.length > 24) err(p + '.user: "@..." (en çok 24 karakter)');
      text(x.text, p + '.text', err, 160); cond(x.when, p + '.when', err, ctx);
    }
  };

  /** Tüm BG.data'yı doğrular. partial=true ise dosyalar arası başvuru eksikleri uyarı sayılır. */
  V.validateAll = function (partial) {
    var errors = [], warnings = [], counts = {}, refs = [], seen = {};
    Object.keys(BG.data).forEach(function (kind) {
      var fn = V.kinds[kind], list = BG.data[kind];
      if (!fn) { errors.push('Bilinmeyen içerik türü: ' + kind); return; }
      counts[kind] = list.length;
      list.forEach(function (x, i) {
        var p = kind + '[' + i + ']' + (x && x.id ? '(' + x.id + ')' : '');
        if (!isObj(x)) { errors.push(p + ': nesne olmalı'); return; }
        var ctx = { refs: refs, hasDistrict: false };
        try { fn(x, p, function (m) { errors.push(m); }, ctx); } catch (e) { errors.push(p + ': doğrulama çöktü — ' + e.message); }
        if (x.id) { var key = kind + ':' + x.id; if (seen[key]) errors.push(p + ': yinelenen id'); seen[key] = true; }
      });
    });
    refs.forEach(function (r) {
      if (!seen[r.kind + ':' + r.id]) (partial ? warnings : errors).push(r.at + ': bulunamayan ' + r.kind + ' id "' + r.id + '"');
    });
    return { errors: errors, warnings: warnings, counts: counts };
  };
})(typeof window !== 'undefined' ? window : globalThis);
