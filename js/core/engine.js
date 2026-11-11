/* BAŞKAN — ÇEKİRDEK MOTOR + MOTOR SÖZLEŞMESİ
 *
 * Mimari: oyun bir SAHNE KUYRUĞUdur. st.cur = şu anki sahne (JSON nesnesi, { t: 'tür', ... }), st.queue = sıradakiler.
 * Her sahne türü için bir işleyici kayıtlıdır:
 *     BG.scenes.tür = { view(st, cur) → View,  act(st, cur, optId, payload) }
 * Arayüz yalnızca şunu yapar:  view = BG.engine.view()  →  çiz  →  tıklamada  view = BG.engine.act(optId, payload)
 * view() null dönerse oyun yok demektir (başlık ekranı gösterilir).
 *
 * KURALLAR (tüm modüller uyar)
 *  1. view() SAFtır: durumu değiştirmez, zar atmaz. Tüm değişiklik ve rastgelelik act() / tur fonksiyonlarındadır.
 *  2. Rastgelelik yalnızca E.rand(st) / E.int / E.pick / E.weighted ile (Math.random YASAK — kayıt ve simülasyon bozulur).
 *  3. st ve sahne nesneleri JSON'a çevrilebilir olmalı (fonksiyon, tanım nesnesi koyma; id ile başvur).
 *  4. Sahnesi biten act(), SON iş olarak tam bir kez E.next(st) çağırır. İstisna: E.endTurn(st) ve E.afterElection(st, won)
 *     kendileri E.next çağırır — onları çağıran act ayrıca E.next ÇAĞIRMAZ.
 *  5. Akış kuran fonksiyonlar (E.beginTurn, BG.election.begin, BG.opposition.enter, E.beginMayorTerm, E.finish) yalnızca
 *     st.queue'ya sahne ekler; E.next çağırmaz.
 *  6. Araya sahne sokup mevcut sahneye (ör. hub) dönmek için E.interrupt(st, sahne|[sahneler]).
 *
 * VIEW (işleyicilerin döndürdüğü; arayüz bilinmeyen türleri genel "kart" olarak çizer)
 *  { type, kicker?, title, text?: string|string[], tone?: 'normal'|'good'|'danger'|'election',
 *    speaker?: { name, role, emoji }, district?: mahalleId,
 *    deltas?: [{ key, label, emoji, delta }],            // sonuç rozetleri
 *    list?: [{ emoji, title, text, deltas? }],           // bilgi satırları
 *    meter?: { label, value, target, max },              // tek gösterge (ör. ikna)
 *    bars?: [{ label, value, max, emoji? }],
 *    options: [Option], groups?: [{ id, title, emoji, options: [Option] }],
 *    data?: türe özel ek veri, flash?: { text, deltas } (yalnız E.act dönüşünde; kısa bildirim) }
 *  Option = { id, label, emoji?, hint?, cost?: string, tag?, fx?: [delta] (ön izleme), risk?: bool,
 *             disabled?, why?, pick?: 'district' (arayüz mahalle seçtirir → act(id, { district })), pickExclude?: [mahalleId] }
 *
 * ÇEKİRDEK SAHNELER: msg, report, event, hub, ending
 *  report.data = { headline, tweets: [{ user, text }], turn, cycleLen }
 *  event.data  = { resolved, chosen, question } (sonuç ekranında)
 *  hub.data    = { ap, apMax, turnsLeft, active: [{ id, name, emoji, left, district }] }
 *  ending.data = { kind, score, rank, wins, losses, termsServed, projects (yalnız oyuncunun bitirdikleri), stats: [{ label, emoji, value }] }
 *
 * MODÜL ARAYÜZLERİ (hepsi isteğe bağlı; yoksa motor o özelliği atlar)
 *  BG.disaster.roll(st) → sahne[]                      her mevsim başı çağrılır (iki modda da); afet varsa sahnelerini döndürür
 *  BG.dialogue.make(st, { mode, district?, knock? }) → sahne|null   birebir görüşme sahnesi üretir
 *  BG.election.hubOptions(st) → grup|null              kampanya döneminde hub'a eklenecek { id:'kampanya', title, emoji, options }
 *  BG.election.hubAct(st, optId, payload)              'kampanya…' ile başlayan seçenekleri işler
 *  BG.election.checkPromises(st) → list satırları      başkanken her mevsim başı; vadesi gelen sözleri sonuçlandırır
 *  BG.election.begin(st)                               seçim sahnelerini kuyruğa ekler; sonuçta E.afterElection(st, won) çağırır
 *  BG.opposition.enter(st, reason)                     reason: 'lost' | 'lostAgain' | 'removed' | 'bankrupt'
 *  BG.opposition.beginTurn(st)                         muhalefet mevsimi (E.beginTurn turn/totalTurns/ap'yi zaten ilerletmiştir)
 *  BG.opposition.onIdle(st)                            kuyruk boşalınca (muhalefet hub'ını ekler)
 *
 * DURUM (st) — özet
 *  { player:{name}, city:{name}, mode:'mayor'|'opposition', term (seçim döngüsü no), turn (döngü içi mevsim, 1..cycleLen),
 *    cycleLen, totalTurns, ap, stats:{}, groups:{}, res:{butce,itibar,fon,gonullu}, districts:{id:{bonus,hasar}},
 *    projects:{active:[{id,district,left}], done:[{id,district,n}]}, flags:{}, seen:{}, scheduled:[{id,at,district}],
 *    promises:[], kampanya (seçim kampanyası oy bonusu), rival:{id,strength}, wins, losses, lossStreak, termsServed, crises (görevden alınma+iflas sayısı),
 *    opp:{} (muhalefet modülü), dis:{} (afet modülü), el:{} (seçim modülü), dlg:{} (diyalog modülü),
 *    log:[{n,text,kind}], history:[{n,anket,mode}], queue, cur, over, score }
 */
(function (root) {
  'use strict';
  var BG = root.BG, C = BG.C, clamp = BG.clamp;
  var E = BG.engine = {}, S = BG.scenes = BG.scenes || {};
  var SAVE_KEY = 'baskan_kayit_v' + BG.VERSION;
  var DEFAULT_RIVAL = { id: 'rakip', name: 'Rakip Aday', title: 'Muhalefet adayı', emoji: '🧑‍💼', slogan: 'Değişim zamanı!', bio: '',
    base: C.RIVAL_BASE, groups: {}, govern: {}, taunts: ['Bu şehir daha iyisini hak ediyor!'], winQuote: 'Şehir kazandı!', loseQuote: 'Yine geleceğim.' };

  /* ───────── Rastgelelik (mulberry32; durum st.rng içinde) ───────── */
  E.rand = function (st) {
    var t = (st.rng = (st.rng + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  E.int = function (st, a, b) { return a + Math.floor(E.rand(st) * (b - a + 1)); };
  E.pick = function (st, arr) { return arr && arr.length ? arr[Math.floor(E.rand(st) * arr.length)] : null; };
  /** Ağırlıklı seçim. wf(x) ağırlık döndürür (vars. x.weight ?? 1). */
  E.weighted = function (st, arr, wf) {
    var tot = 0, i, w = (arr || []).map(function (x) { var v = Math.max(0, wf ? wf(x) : (x.weight == null ? 1 : x.weight)); tot += v; return v; });
    if (tot <= 0) return null;
    var r = E.rand(st) * tot;
    for (i = 0; i < arr.length; i++) { r -= w[i]; if (r < 0) return arr[i]; }
    return arr[arr.length - 1];
  };

  /* ───────── Yardımcılar ───────── */
  E.season = function (st) { return BG.SEASONS[(Math.max(1, st.totalTurns) - 1) % 4]; };
  E.year = function (st) { return 1 + Math.floor((Math.max(1, st.totalTurns) - 1) / 4); };
  E.turnsLeft = function (st) { return st.cycleLen - st.turn; };
  E.district = function (id) { return BG.byId(BG.DISTRICTS, id); };
  E.rivalDef = function (st) { return (st.rival && BG.byId(BG.data.rivals || [], st.rival.id)) || DEFAULT_RIVAL; };
  E.findEvent = function (id) { return BG.byId(BG.data.events || [], id); };
  E.projectDef = function (id) { return BG.byId(BG.data.projects || [], id); };
  E.hasProject = function (st, id, district) {
    return st.projects.done.some(function (p) { return p.id === id && (!district || p.district === district); });
  };
  /** Proje o kapsamda (şehir ya da mahalle) sürüyor mu / (once ise) yapılmış mı? */
  E.projectBusy = function (st, id, district, once) {
    function hit(p) { return p.id === id && (!district || p.district === district); }
    return st.projects.active.some(hit) || (once && st.projects.done.some(hit));
  };
  /* Türkçe ek uyumu: "{mahalle}’de" → "Çarşı’da", "{rakip}’in" → "Cemal Kule’nin". Tanınmayan ek olduğu gibi kalır. */
  var VOWELS = 'aeıioöuü';
  function lower(ch) { return ch.toLocaleLowerCase('tr'); }
  E.suffix = function (name, suf) {
    var i, lv = 'e', last = lower(name.charAt(name.length - 1)), m;
    for (i = name.length - 1; i >= 0; i--) if (VOWELS.indexOf(lower(name.charAt(i))) >= 0) { lv = lower(name.charAt(i)); break; }
    var back = 'aıou'.indexOf(lv) >= 0, round = 'ouöü'.indexOf(lv) >= 0, endsV = VOWELS.indexOf(last) >= 0, hard = 'fstkçşhp'.indexOf(last) >= 0;
    var A = back ? 'a' : 'e', I = back ? (round ? 'u' : 'ı') : (round ? 'ü' : 'i'), D = hard ? 't' : 'd', s = lower(suf);
    if (/^n?[ıiuü]n$/.test(s)) return (endsV ? 'n' : '') + I + 'n';            // -in  (ilgi)
    if (/^y?[ae]$/.test(s)) return (endsV ? 'y' : '') + A;                     // -e   (yönelme)
    if (/^y?[ıiuü]$/.test(s)) return (endsV ? 'y' : '') + I;                   // -i   (belirtme)
    if ((m = /^[dt][ae](n|ki)?$/.exec(s))) return D + A + (m[1] || '');        // -de / -den / -deki
    if (/^y?l[ae]$/.test(s)) return (endsV ? 'y' : '') + 'l' + A;              // -le  (ile)
    if (/^l[ıiuü]$/.test(s)) return 'l' + I;                                   // -li
    return suf;
  };
  /** Metindeki {sehir} {baskan} {rakip} {mahalle} yer tutucularını doldurur; kesme işaretinden sonraki eki ada uydurur. ctx = { district } */
  E.fmt = function (st, text, ctx) {
    if (text == null) return '';
    var d = ctx && ctx.district && E.district(ctx.district);
    return String(text).replace(/\{(\w+)\}(?:([’'])([a-zçğıöşü]+))?/g, function (m, k, apo, suf) {
      var name = k === 'sehir' ? st.city.name : k === 'baskan' ? st.player.name : k === 'rakip' ? E.rivalDef(st).name : k === 'mahalle' ? (d ? d.name : 'şehir') : null;
      if (name == null) return m;
      return suf ? name + apo + E.suffix(name, suf) : name;
    });
  };
  E.log = function (st, text, kind) { st.log.unshift({ n: st.totalTurns, text: text, kind: kind || 'bilgi' }); if (st.log.length > 40) st.log.length = 40; };
  /** Kısa bildirim: bir sonraki E.act dönüşündeki view.flash içinde arayüze gider. */
  E.flash = function (st, text, deltas) { st.flash = { text: text, deltas: deltas || [] }; };

  /* ───────── Koşullar ───────── */
  E.val = function (st, key) {
    if (key in st.stats) return st.stats[key];
    if (key in st.groups) return st.groups[key];
    if (key in st.res) return st.res[key];
    switch (key) {
      case 'anket': return E.poll(st).player;
      case 'rakip': return st.rival ? st.rival.strength : 50;
      case 'tur': return st.turn;
      case 'donem': return st.term;
      case 'kalan': return E.turnsLeft(st);
      case 'enerji': return st.ap;
      case 'kayip': return st.lossStreak;
      case 'hasar': return Math.max.apply(null, BG.DISTRICTS.map(function (d) { return st.districts[d.id].hasar; }));
    }
    return 0;
  };
  E.check = function (st, c) {
    if (!c) return true;
    var k, a, i;
    for (k in (c.min || {})) if (E.val(st, k) < c.min[k]) return false;
    for (k in (c.max || {})) if (E.val(st, k) > c.max[k]) return false;
    if (c.flag) { a = [].concat(c.flag); for (i = 0; i < a.length; i++) if (!st.flags[a[i]]) return false; }
    if (c.notFlag) { a = [].concat(c.notFlag); for (i = 0; i < a.length; i++) if (st.flags[a[i]]) return false; }
    if (c.mode && c.mode !== st.mode) return false;
    if (c.season && [].concat(c.season).indexOf(E.season(st).id) < 0) return false;
    if (c.project) { a = [].concat(c.project); for (i = 0; i < a.length; i++) if (!E.hasProject(st, a[i])) return false; }
    if (c.notProject) { a = [].concat(c.notProject); for (i = 0; i < a.length; i++) if (E.hasProject(st, a[i])) return false; }
    return true;
  };

  /* ───────── Etkiler ───────── */
  function delta(key, d, extra) { var l = BG.label(key); return { key: key, label: l.name + (extra || ''), emoji: l.emoji, delta: d }; }
  /** Etki nesnesinin sayısal kısmını rozet listesine çevirir (saf; ön izleme için). */
  E.preview = function (eff) {
    var out = [], k;
    for (k in (eff || {})) if (typeof eff[k] === 'number' && eff[k] && k !== 'kriz' && k !== 'skor') out.push(delta(k, eff[k]));
    return out;
  };
  /** Etkileri uygular, rozet listesi döndürür. ctx = { district?, kriz? } */
  E.apply = function (st, eff, ctx) {
    var out = [], k, v, ds;
    ctx = ctx || {};
    for (k in (eff || {})) {
      v = eff[k];
      if (k === 'flag') { [].concat(v).forEach(function (f) { st.flags[f] = true; }); continue; }
      if (k === 'unflag') { [].concat(v).forEach(function (f) { delete st.flags[f]; }); continue; }
      if (k === 'sonra') { st.scheduled.push({ id: v.id, at: st.totalTurns + v.tur, district: ctx.district || null }); continue; }
      if (typeof v !== 'number' || !v) continue;
      if (k in st.stats) st.stats[k] = clamp(st.stats[k] + v, 0, 100);
      else if (k in st.groups) st.groups[k] = clamp(st.groups[k] + v, 0, 100);
      else if (k === 'halk') BG.GROUPS.forEach(function (g) { st.groups[g.id] = clamp(st.groups[g.id] + v, 0, 100); });
      else if (k === 'butce') st.res.butce += v;
      else if (k === 'itibar') st.res.itibar = clamp(st.res.itibar + v, 0, 100);
      else if (k === 'fon' || k === 'gonullu') st.res[k] = Math.max(0, st.res[k] + v);
      else if (k === 'enerji') st.ap = Math.max(0, st.ap + v);
      else if (k === 'rakip') { if (st.rival) st.rival.strength = clamp(st.rival.strength + v, 20, 80); }
      else if (k === 'skor') { st.score += v; continue; }
      else if (k === 'kriz') { ctx.kriz = (ctx.kriz || 0) + v; continue; }
      else if (k === 'mahalle' || k === 'hasar') {
        ds = ctx.district && st.districts[ctx.district];
        if (!ds) continue;
        if (k === 'mahalle') ds.bonus = clamp(ds.bonus + v, -30, 30); else ds.hasar = clamp(ds.hasar + v, 0, 100);
        out.push(delta(k, v, ' (' + E.district(ctx.district).name + ')'));
        continue;
      } else continue;
      out.push(delta(k, v));
    }
    return out;
  };
  E.mergeDeltas = function (list) {
    var map = {}, out = [];
    list.forEach(function (d) { var id = d.key + '|' + d.label; if (map[id]) map[id].delta += d.delta; else out.push(map[id] = { key: d.key, label: d.label, emoji: d.emoji, delta: d.delta }); });
    return out.filter(function (d) { return d.delta !== 0; });
  };

  /* ───────── Maliyet ve seçenekler ───────── */
  E.canPay = function (st, cost) {
    for (var k in (cost || {})) {
      if (k === 'butce') { if (st.res.butce - cost[k] < -C.CREDIT) return false; }
      else if (k === 'enerji') { if (st.ap < cost[k]) return false; }
      else if ((st.res[k] || 0) < cost[k]) return false;
    }
    return true;
  };
  E.pay = function (st, cost) {
    var neg = {}, k;
    for (k in (cost || {})) neg[k] = -cost[k];
    return E.apply(st, neg);
  };
  E.costText = function (cost) {
    var parts = [], k;
    for (k in (cost || {})) parts.push(k === 'butce' ? '₺' + cost[k] + 'M' : cost[k] + ' ' + BG.label(k).emoji);
    return parts.join(' · ');
  };
  /** İçerikteki bir seçeneği arayüz Option'ına çevirir (saf). */
  E.choiceOption = function (st, ch, i, ctx) {
    var o = { id: String(i), label: E.fmt(st, ch.text, ctx), hint: ch.hint ? E.fmt(st, ch.hint, ctx) : '', cost: E.costText(ch.cost) };
    if (ch.outcomes) o.risk = true;
    if (!E.check(st, ch.when)) { o.disabled = true; o.why = ch.whyNot || 'Şartlar uygun değil'; }
    else if (!E.canPay(st, ch.cost)) { o.disabled = true; o.why = 'Kaynak yetersiz'; }
    return o;
  };
  /** Seçeneği uygular: maliyet + etkiler (+ rastgele sonuç). → { text, deltas } */
  E.resolveChoice = function (st, ch, ctx) {
    var deltas = E.pay(st, ch.cost).concat(E.apply(st, ch.effects, ctx)), text = [ch.result || ''];
    if (ch.outcomes && ch.outcomes.length) {
      var oc = E.weighted(st, ch.outcomes, function (o) { return o.p; });
      deltas = deltas.concat(E.apply(st, oc.effects, ctx)); text.push(oc.result || '');
    }
    return { text: E.fmt(st, text.filter(Boolean).join(' '), ctx), deltas: E.mergeDeltas(deltas) };
  };

  /* ───────── Anket / oy modeli ───────── */
  /** → { player, rival, other, lead, byDistrict: { id: { player, rival, other } } } (yüzde) */
  E.poll = function (st) {
    var rd = E.rivalDef(st), rs = st.rival ? st.rival.strength : C.RIVAL_BASE, by = {}, tp = 0, tr = 0, pop = 0, opp = st.mode === 'opposition';
    BG.DISTRICTS.forEach(function (d) {
      var ds = st.districts[d.id], p = 0, r = 0, g;
      for (g in d.mix) { p += d.mix[g] * st.groups[g]; r += d.mix[g] * (rs + ((rd.groups || {})[g] || 0)); }
      // Hasar koltuktakinin hanesine yazılır: muhalefetteyken onarılmayan enkaz başkanın (rakibin) oyunu düşürür.
      if (opp) r -= ds.hasar * C.HASAR_VOTE; else p -= ds.hasar * C.HASAR_VOTE;
      p += ds.bonus + (st.res.itibar - 50) * C.ITIBAR_VOTE + (st.kampanya || 0);
      p = Math.max(5, p); r = Math.max(5, r);
      var pl = (100 - C.OTHER_SHARE) * p / (p + r);
      by[d.id] = { player: pl, rival: 100 - C.OTHER_SHARE - pl, other: C.OTHER_SHARE };
      tp += pl * d.pop; tr += by[d.id].rival * d.pop; pop += d.pop;
    });
    return { player: tp / pop, rival: tr / pop, other: C.OTHER_SHARE, lead: (tp - tr) / pop, byDistrict: by };
  };

  /** Arayüz üst bandı için türetilmiş özet (saf). */
  E.summary = function (st) {
    var se = E.season(st), rd = E.rivalDef(st), p = E.poll(st);
    return { season: se, year: E.year(st), turn: st.turn, cycleLen: st.cycleLen, turnsLeft: E.turnsLeft(st), mode: st.mode, term: st.term,
      campaign: E.turnsLeft(st) < C.CAMPAIGN_TURNS, poll: p,
      rival: { id: rd.id, name: rd.name, title: rd.title, emoji: rd.emoji, slogan: rd.slogan, strength: st.rival ? st.rival.strength : 0 } };
  };

  /* ───────── Sahne makinesi ───────── */
  E.interrupt = function (st, scenes) {
    scenes = [].concat(scenes);
    if (st.cur) st.queue.unshift(st.cur);
    for (var i = scenes.length - 1; i >= 0; i--) st.queue.unshift(scenes[i]);
    st.cur = st.queue.shift();
  };
  E.onIdle = function (st) {
    if (st.over) st.queue.push({ t: 'ending', kind: st.over });
    else if (st.mode === 'opposition' && BG.opposition) BG.opposition.onIdle(st);
    else st.queue.push({ t: 'hub' });
  };
  E.next = function (st) {
    if (E.crisis(st)) return;
    var guard = 0;
    st.cur = st.queue.shift() || null;
    while ((!st.cur || !S[st.cur.t]) && guard++ < 50) {
      if (!st.queue.length) E.onIdle(st);
      st.cur = st.queue.shift() || null;
    }
  };
  E.view = function () {
    var st = BG.state;
    if (!st) return null;
    if (!st.cur || !S[st.cur.t]) E.next(st);
    var v = S[st.cur.t].view(st, st.cur) || {};
    v.type = v.type || st.cur.t; v.options = v.options || [];
    return v;
  };
  E.act = function (optId, payload) {
    var st = BG.state;
    if (!st) return null;
    if (!st.cur || !S[st.cur.t]) E.next(st);
    S[st.cur.t].act(st, st.cur, String(optId), payload || {});
    if (!BG.state) return null;
    var fl = st.flash;
    st.flash = null;            // kayda bildirim yazılmasın (yeniden yüklemede eski bildirim dönmesin)
    E.save();
    var v = E.view();
    if (fl) v.flash = fl;
    return v;
  };

  /* ───────── Kayıt ───────── */
  function store() { try { return root.localStorage || null; } catch (e) { return null; } }
  E.save = function () { var s = store(); if (s && BG.state) { try { s.setItem(SAVE_KEY, JSON.stringify(BG.state)); } catch (e) { /* dolu/kapalı */ } } };
  E.hasSave = function () { var s = store(); try { return !!(s && s.getItem(SAVE_KEY)); } catch (e) { return false; } };
  E.load = function () {
    var s = store();
    try { var st = s && JSON.parse(s.getItem(SAVE_KEY)); if (st && st.v === BG.VERSION && st.stats) { BG.state = st; return true; } } catch (e) { /* bozuk kayıt */ }
    return false;
  };
  E.clearSave = function () { var s = store(); try { if (s) s.removeItem(SAVE_KEY); } catch (e) { /* yok say */ } };

  /* ───────── Yeni oyun / dönem ───────── */
  /** rally: son seçimdeki farkın getirdiği ek güç (açık farkla kazanan başkana karşı muhalefet tek adayda birleşir). */
  E.makeRival = function (st, rally) {
    var list = BG.data.rivals || [], prev = st.rival && st.rival.id;
    var pool = list.filter(function (r) { return r.id !== prev; });
    var def = E.pick(st, pool.length ? pool : list) || DEFAULT_RIVAL;
    // Zorluk oyuncunun başarısıyla artar: tamamlanan her başkanlık dönemi rakipleri güçlendirir (kayıplar değil).
    return { id: def.id, strength: clamp((def.base || C.RIVAL_BASE) + (st.termsServed || 0) * C.RIVAL_GROWTH + (rally || 0), 20, 80) };
  };
  /** Yeniden seçilen başkanın son farkına göre yeni rakibin ek gücü (0..RIVAL_RALLY_MAX). */
  E.rivalRally = function (st) {
    var m = st.el && st.el.last && st.el.last.won && typeof st.el.last.margin === 'number' ? st.el.last.margin : 0;
    return Math.round(clamp((m - C.RIVAL_RALLY_FREE) * C.RIVAL_RALLY, 0, C.RIVAL_RALLY_MAX) * 10) / 10;
  };
  E.newGame = function (opts) {
    opts = opts || {};
    var seed = (opts.seed != null ? opts.seed : Math.floor(Math.random() * 4294967296)) >>> 0;   // tek izinli Math.random: tohum
    var st = { v: BG.VERSION, seed: seed, rng: seed, player: { name: opts.playerName || 'Başkan' }, city: { name: opts.cityName || 'Çınarlı' },
      mode: 'mayor', term: 1, turn: 0, cycleLen: C.TURNS_PER_TERM, totalTurns: 0, ap: 0, wins: 1, losses: 0, lossStreak: 0, termsServed: 0, crises: 0,
      stats: {}, groups: {}, res: { butce: C.START_BUDGET, itibar: C.START_ITIBAR, fon: 0, gonullu: 0 }, districts: {},
      projects: { active: [], done: [] }, flags: {}, seen: {}, scheduled: [], promises: [], kampanya: 0, rival: null,
      opp: {}, dis: {}, el: {}, dlg: {}, visits: {}, recent: { h: [], t: [] }, lastCat: null,
      log: [], history: [], queue: [], cur: null, over: null, flash: null, score: 0 };
    BG.STATS.forEach(function (s) { st.stats[s.id] = s.start + E.int(st, -3, 3); });
    BG.GROUPS.forEach(function (g) { st.groups[g.id] = 51 + E.int(st, -3, 3); });
    BG.DISTRICTS.forEach(function (d) { st.districts[d.id] = { bonus: 0, hasar: 0 }; });
    BG.state = st;
    E.beginMayorTerm(st, 'start');
    st.cur = st.queue.shift();
    E.save();
    return st;
  };
  /** how: 'start' | 'reelected' | 'comeback' */
  E.beginMayorTerm = function (st, how) {
    st.mode = 'mayor'; st.cycleLen = C.TURNS_PER_TERM; st.turn = 0; st.kampanya = 0;
    delete st.flags.bagimsiz;   // bağımsız adaylık muhalefete özgü; koltuğa dönünce düşer
    if (how === 'comeback') {
      // Devralınan şehir yeni başkanı hemen batırmasın: kasa en az 80 ve devralınan yapısal açığın (işletme − gelir) 3 mevsimini karşılar.
      var gap = E.upkeep(st) - E.income(st);
      st.res.butce = Math.max(st.res.butce, 80, 80 + 3 * gap); st.res.itibar = Math.max(st.res.itibar, 35); st.scheduled = [];
    }
    var rally = how === 'reelected' ? E.rivalRally(st) : 0;
    st.rival = E.makeRival(st, rally);
    var rd = E.rivalDef(st), txt;
    if (how === 'start') txt = ['Tebrikler Başkan ' + st.player.name + '! ' + st.city.name + ' halkı sana güvendi. Önünde ' + C.TURNS_PER_TERM + ' mevsim var: çukurlar, minibüsçüler, martılar ve elbette afetler seni bekliyor.',
      'Her mevsim gündemdeki sorunlara karar ver, mesainle proje başlat, sahaya in. Dönem sonunda sandık kurulacak; rakibin şimdiden pusuda: ' + rd.emoji + ' ' + rd.name + ' (' + rd.title + ').'];
    else if (how === 'comeback') txt = ['Muhalefet günleri bitti: ' + st.city.name + ' seni yeniden başkan seçti! Devraldığın şehir bıraktığın gibi değil; kasaya ve göstergelere iyi bak.',
      'Yeni rakibin: ' + rd.emoji + ' ' + rd.name + ' — “' + rd.slogan + '”'];
    else txt = [st.city.name + ' “devam” dedi! ' + st.term + '. seçim döngüsüne başkan olarak giriyorsun. Ama beklentiler büyüdü, rakipler güçlendi.',
      (rally >= 2 ? 'Farkın öyle açıktı ki muhalefet dağınıklığı bırakıp tek adayda birleşti. ' : '') + 'Karşındaki yeni isim: ' + rd.emoji + ' ' + rd.name + ' — “' + rd.slogan + '”'];
    st.queue.push({ t: 'msg', tone: 'good', kicker: st.term + '. Dönem', title: how === 'start' ? 'Mazbatanı aldın!' : how === 'comeback' ? 'Koltuğa geri döndün!' : 'Yeniden seçildin!', text: txt, button: 'İşe koyul' });
    E.log(st, how === 'start' ? 'Göreve başladın.' : 'Yeni dönem başladı.', 'donem');
    E.beginTurn(st);
  };
  E.finish = function (st, kind) { st.over = kind; st.queue.push({ t: 'ending', kind: kind }); };

  /** Seçim sonucu sonrası akış. Seçim modülü sonuç ekranından çağırır; E.next'i kendisi çağırır. */
  E.afterElection = function (st, won) {
    var wasMayor = st.mode === 'mayor';
    if (wasMayor) st.termsServed++;
    st.term++; st.turn = 0; st.kampanya = 0;
    if (won) { st.wins++; st.lossStreak = 0; } else { st.losses++; st.lossStreak++; st.promises = []; }
    if (wasMayor && st.termsServed >= C.TERMS_TO_WIN) E.finish(st, won ? 'efsane' : 'onurlu');
    else if (!won && (st.lossStreak >= C.MAX_LOSS_STREAK || !BG.opposition)) E.finish(st, 'veda');
    else if (won) E.beginMayorTerm(st, wasMayor ? 'reelected' : 'comeback');
    else BG.opposition.enter(st, wasMayor ? 'lost' : 'lostAgain');
    E.next(st);
  };

  /** Başkanken itibar sıfırlanır ya da kasa batarsa görev biter → muhalefet. E.next içinden çağrılır. */
  E.crisis = function (st) {
    if (st.over || st.mode !== 'mayor') return false;
    var reason = st.res.itibar <= 0 ? 'removed' : st.res.butce < C.BANKRUPT ? 'bankrupt' : null;
    if (!reason) return false;
    // Henüz gösterilmemiş mevsim raporu krize yol açan satırları taşır (faiz, tutulmayan söz…): kaybolmasın, krizden önce gösterilsin.
    // Rapor gösterilmediyse bu mevsim hiç oynanmadı demektir: muhalefetin ilk mevsimi takvimde onun yerini alır (çift ilerleme yok).
    var unseen = st.queue.filter(function (s) { return s && s.t === 'report'; });
    st.queue = unseen; st.cur = null; st.losses++; st.lossStreak++; st.term++; st.turn = 0; st.kampanya = 0; st.promises = []; st.scheduled = [];
    st.crises = (st.crises || 0) + 1;
    // İkinci görevden alınma / iflas kariyeri bitirir (yoksa kriz → geri dönüş → kriz döngüsü sonsuza dek sürebilir).
    var over = st.lossStreak >= C.MAX_LOSS_STREAK || st.crises >= C.MAX_CRISES || !BG.opposition;
    st.queue.push({ t: 'msg', tone: 'danger', kicker: 'Son dakika', title: reason === 'removed' ? 'Görevden alındın!' : 'Belediye iflas etti!',
      text: [reason === 'removed' ? 'İtibarın dibe vurdu. Meclis güvensizlik oyu verdi, makam aracının anahtarını teslim ettin.'
        : 'Kasa tamtakır, alacaklılar kapıda. Belediyeye kayyum atandı ve koltuğunu kaybettin.',
        over ? (st.crises >= C.MAX_CRISES ? 'Bu ikinci kez oluyor. Parti de seçmen de bir şans daha vermeye niyetli değil.' : 'Bu darbeden sonra yeniden ayağa kalkacak gücün kalmadı.')
          : reason === 'removed' ? 'Ama siyaset bitmez: koltuğu geri almak için sokağa dönme zamanı.' : 'Ama siyaset bitmez: güveni yeniden kazanmak için sokağa dönme zamanı.'] });
    E.log(st, reason === 'removed' ? 'Görevden alındın.' : 'Belediye iflas etti.', 'kriz');
    if (unseen.length) st.totalTurns--;   // muhalefetin E.beginTurn'ü bu mevsimi yeniden sayar
    if (over) E.finish(st, 'veda'); else BG.opposition.enter(st, reason);
    st.cur = st.queue.shift();
    return true;
  };

  /* ───────── Tur döngüsü ───────── */
  E.beginTurn = function (st) {
    st.turn++; st.totalTurns++; st.ap = C.AP_PER_TURN;
    if (st.mode === 'opposition' && BG.opposition) BG.opposition.beginTurn(st); else mayorTurn(st);
  };
  /** Hub'daki "mevsimi bitir". Döngü bittiyse seçimi, değilse yeni mevsimi başlatır. E.next'i kendisi çağırır. */
  E.endTurn = function (st) {
    st.history.push({ n: st.totalTurns, anket: Math.round(E.poll(st).player * 10) / 10, mode: st.mode });
    if (st.history.length > 80) st.history.shift();
    if (st.turn >= st.cycleLen) {
      if (BG.election) BG.election.begin(st);
      else { var p = E.poll(st), won = p.player + E.rand(st) * 4 - 2 > p.rival;
        st.queue.push({ t: 'msg', tone: 'election', kicker: 'Seçim', title: won ? 'Sandıktan sen çıktın!' : 'Sandıktan rakip çıktı', text: 'Oy oranın: %' + p.player.toFixed(1), then: 'election', won: won }); }
    } else E.beginTurn(st);
    E.next(st);
  };
  E.groupTarget = function (st, g) {
    var t = 0, k;
    for (k in g.cares) t += g.cares[k] * st.stats[k];
    return clamp(t + (st.res.itibar - 50) * 0.15, 0, 100);
  };
  /** Mevsimlik yıpranma: göstergeler aşınır, gruplar hak edilen desteğe kayar, mahalle bonusu söner, itibar 50'ye döner. (Başkanlık modu) */
  E.drift = function (st) {
    BG.GROUPS.forEach(function (g) { var c = st.groups[g.id]; st.groups[g.id] = clamp(c + (E.groupTarget(st, g) - c) * C.DRIFT, 0, 100); });
    BG.STATS.forEach(function (s) { if (st.stats[s.id] > C.DECAY_FLOOR) st.stats[s.id] -= C.DECAY; });
    BG.DISTRICTS.forEach(function (d) { var ds = st.districts[d.id]; ds.bonus = Math.round(ds.bonus * C.BONUS_KEEP * 10) / 10; });
    E.itibarDrift(st);
  };
  /** İtibar zamanla 50'ye doğru döner (iki modda da): ne zirve ne dip kalıcıdır. */
  E.itibarDrift = function (st) { st.res.itibar = clamp(Math.round((st.res.itibar + (50 - st.res.itibar) * C.ITIBAR_DRIFT) * 10) / 10, 0, 100); };
  /** Vadesi gelen zincir olayları kuyruktan çıkarıp döndürür: [{ id, district }] */
  E.dueEvents = function (st) {
    var due = [], keep = [];
    st.scheduled.forEach(function (s) { (s.at <= st.totalTurns ? due : keep).push(s); });
    st.scheduled = keep;
    return due.filter(function (s) { return !!E.findEvent(s.id); });
  };
  /** Moda uygun rastgele olay çeker (görülenleri tekrarlamaz). → olay tanımı | null */
  E.drawEvent = function (st, mode) {
    function pool() {
      return (BG.data.events || []).filter(function (ev) {
        if ((ev.modes || ['mayor']).indexOf(mode) < 0 || ev.weight === 0) return false;
        var seen = st.seen[ev.id];
        if (seen != null && (!ev.repeat || st.totalTurns - seen < 6)) return false;
        return E.check(st, ev.when);
      });
    }
    var list = pool();
    if (!list.length) {   // havuz tükendi: eski olayları yeniden aç
      Object.keys(st.seen).forEach(function (id) { if (st.totalTurns - st.seen[id] >= 10) delete st.seen[id]; });
      list = pool();
    }
    var ev = E.weighted(st, list, function (x) { return (x.weight == null ? 1 : x.weight) * (x.cat === st.lastCat ? 0.3 : 1); });
    if (ev) { st.seen[ev.id] = st.totalTurns; st.lastCat = ev.cat; }
    return ev;
  };
  E.eventScene = function (st, ev, district) {
    return { t: 'event', id: ev.id, district: district || (ev.district === 'rastgele' ? E.pick(st, BG.DISTRICTS).id : (ev.district || null)) };
  };
  /** Gazete manşeti + 2 tweet seçer. → { headline, tweets: [{ user, text }] } */
  E.pickNews = function (st) {
    function choose(kind, key, n) {
      var list = BG.data[kind] || [], out = [], rec = st.recent[key], i;
      for (i = 0; i < n; i++) {
        var cand = [];
        list.forEach(function (x, idx) { if (rec.indexOf(idx) < 0 && E.check(st, x.when)) cand.push({ x: x, idx: idx, weight: x.when ? 3 : 1 }); });
        var c = E.weighted(st, cand);
        if (!c) break;
        rec.push(c.idx); if (rec.length > Math.min(14, Math.floor(list.length / 2))) rec.shift();
        out.push(c.x);
      }
      return out;
    }
    var h = choose('headlines', 'h', 1)[0];
    return { headline: h ? E.fmt(st, h.text) : '', tweets: choose('tweets', 't', 2).map(function (t) { return { user: t.user, text: E.fmt(st, t.text) }; }) };
  };

  /** Mevsimlik belediye geliri ve biten projelerin toplam işletme gideri. */
  E.income = function (st) { return Math.round(C.BASE_INCOME + st.stats.ekonomi * C.INCOME_PER_EKONOMI); };
  E.upkeep = function (st) { var u = 0; st.projects.done.forEach(function (p) { var d = E.projectDef(p.id); if (d) u += d.upkeep || 0; }); return Math.round(u * C.UPKEEP_MULT); };
  function mayorTurn(st) {
    var r = st.res, lines = [], still = [];
    var income = E.income(st), upkeep = E.upkeep(st);
    var interest = r.butce < 0 ? Math.ceil(-r.butce * C.DEBT_INTEREST) : 0;
    r.butce += income - upkeep - interest;
    lines.push({ emoji: '💰', title: 'Kasa', text: 'Gelir +' + income + (upkeep ? ' · işletme −' + upkeep : '') + (interest ? ' · faiz −' + interest : '') + ' → kasada ₺' + Math.round(r.butce) + 'M' });
    if (r.butce < 0) { r.itibar = clamp(r.itibar - 1, 0, 100); lines.push({ emoji: '📉', title: 'Borç alarmı', text: 'Kasa ekside: faiz işliyor, itibarın eriyor. ₺' + C.BANKRUPT + 'M altı iflas demek.' }); }
    st.projects.active.forEach(function (p) {
      if (--p.left > 0) { still.push(p); return; }
      var d = E.projectDef(p.id);
      if (!d) return;
      st.projects.done.push({ id: p.id, district: p.district, n: st.totalTurns });
      var dl = E.apply(st, d.effects, { district: p.district });
      lines.push({ emoji: d.emoji, title: d.name + ' tamamlandı', text: E.fmt(st, d.doneText || 'Proje hizmete girdi.', { district: p.district }), deltas: dl });
      E.log(st, d.name + ' tamamlandı.', 'proje'); st.score += 15;
    });
    st.projects.active = still;
    E.drift(st);
    if (BG.election && BG.election.checkPromises) lines = lines.concat(BG.election.checkPromises(st) || []);
    var news = E.pickNews(st);
    st.queue.push({ t: 'report', lines: lines, headline: news.headline, tweets: news.tweets });
    if (BG.disaster) (BG.disaster.roll(st) || []).forEach(function (s) { st.queue.push(s); });
    E.dueEvents(st).forEach(function (s) { st.queue.push(E.eventScene(st, E.findEvent(s.id), s.district)); });
    var n = C.EVENTS_PER_TURN + (st.term >= 2 && E.rand(st) < 0.35 ? 1 : 0);
    while (n-- > 0) { var ev = E.drawEvent(st, 'mayor'); if (ev) st.queue.push(E.eventScene(st, ev)); }
    if (BG.dialogue && st.turn > 1 && E.rand(st) < C.KNOCK_CHANCE) { var dg = BG.dialogue.make(st, { mode: 'mayor', knock: true }); if (dg) st.queue.push(dg); }
    st.queue.push({ t: 'hub' });
  }

  /* ───────── Çekirdek sahneler ───────── */
  S.msg = {
    view: function (st, cur) {
      return { type: 'msg', kicker: cur.kicker, title: cur.title, text: cur.text, tone: cur.tone, speaker: cur.speaker, district: cur.district,
        deltas: cur.deltas, list: cur.list, options: [{ id: 'ok', label: cur.button || 'Devam' }] };
    },
    act: function (st, cur) { if (cur.then === 'election') return E.afterElection(st, !!cur.won); E.next(st); }
  };

  S.report = {
    view: function (st, cur) {
      var se = E.season(st);
      return { type: 'report', kicker: se.emoji + ' ' + se.name + ' · ' + E.year(st) + '. yıl', title: cur.headline || 'Şehirde yeni bir mevsim', list: cur.lines,
        data: { headline: cur.headline, tweets: cur.tweets || [], turn: st.turn, cycleLen: st.cycleLen }, options: [{ id: 'ok', label: 'Gündeme geç' }] };
    },
    act: function (st) { E.next(st); }
  };

  S.event = {
    view: function (st, cur) {
      var ev = E.findEvent(cur.id), ctx = { district: cur.district };
      if (!ev) return { type: 'event', title: 'Gündem boş', text: 'Bugün masana dosya gelmedi.', options: [{ id: 'ok', label: 'Devam' }] };
      var v = { type: 'event', kicker: BG.CATS[ev.cat] || 'Gündem', title: E.fmt(st, ev.title, ctx), speaker: ev.speaker, district: cur.district };
      if (cur.result) {
        v.text = cur.result.text; v.deltas = cur.result.deltas; v.options = [{ id: 'ok', label: 'Devam' }];
        v.data = { resolved: true, chosen: cur.result.chosen, question: E.fmt(st, ev.text, ctx) };
      } else {
        v.text = E.fmt(st, ev.text, ctx);
        v.options = ev.choices.map(function (ch, i) { return E.choiceOption(st, ch, i, ctx); });
        if (v.options.every(function (o) { return o.disabled; })) v.options.push({ id: 'pas', label: 'Karar vermeden geçiştir', hint: 'İtibar −2' });
      }
      return v;
    },
    act: function (st, cur, id) {
      var ev = E.findEvent(cur.id), ctx = { district: cur.district };
      if (cur.result || !ev) return E.next(st);
      if (id === 'pas') {
        if (ev.choices.some(function (ch) { return E.check(st, ch.when) && E.canPay(st, ch.cost); })) return;   // yalnız her seçenek kilitliyse
        cur.result ={ text: 'Konuyu geçiştirdin. Kimse memnun kalmadı.', deltas: E.apply(st, { itibar: -2 }, ctx), chosen: 'Geçiştir' }; return; }
      var ch = ev.choices[+id];
      if (!ch || !E.check(st, ch.when) || !E.canPay(st, ch.cost)) return;
      cur.result = E.resolveChoice(st, ch, ctx); cur.result.chosen = E.fmt(st, ch.text, ctx);
      E.log(st, E.fmt(st, ev.title, ctx) + ' → ' + cur.result.chosen, 'karar');
    }
  };

  var VISIT_LINES = [
    '{mahalle} sokaklarında çay içip dert dinledin. Esnaf “Başkan aramızda” diye fotoğraf çektirdi.',
    '{mahalle} pazarında domatesin fiyatını sordun; cevap uzun sürdü ama samimiydi.',
    '{mahalle} muhtarıyla yürüdün: üç kedi, iki çukur, bir düğün daveti.',
    '{mahalle} kahvehanesinde okey masasına oturdun. Kaybettin ama gönül kazandın.',
    '{mahalle} sakinleriyle kaldırımda ayaküstü halk toplantısı yaptın. Not defterin doldu.'
  ];
  function dominant(d) { var best = null, k; for (k in d.mix) if (!best || d.mix[k] > d.mix[best]) best = k; return best; }

  S.hub = {
    view: function (st) {
      var se = E.season(st), left = E.turnsLeft(st), noAp = st.ap < 1, groups = [], projs = [];
      function lock(o, cost) {
        if (noAp) { o.disabled = true; o.why = 'Bu mevsimlik mesain bitti'; }
        else if (cost && !E.canPay(st, cost)) { o.disabled = true; o.why = 'Bütçe yetersiz'; }
        return o;
      }
      (BG.data.projects || []).forEach(function (d) {
        if (!E.check(st, d.when)) return;
        var once = d.once !== false, ex = [];
        if (d.yer === 'mahalle') {
          BG.DISTRICTS.forEach(function (x) { if (E.projectBusy(st, d.id, x.id, once)) ex.push(x.id); });
          if (ex.length === BG.DISTRICTS.length) return;
        } else if (E.projectBusy(st, d.id, null, once)) return;
        projs.push(lock({ id: 'proje:' + d.id, emoji: d.emoji, label: d.name, hint: d.desc, tag: BG.label(d.cat).name,
          cost: '₺' + d.cost + 'M · ' + d.turns + ' mevsim' + (d.upkeep ? ' · işletme ' + d.upkeep + '/mevsim' : ''),
          fx: E.preview(d.effects), pick: d.yer === 'mahalle' ? 'district' : null, pickExclude: ex, data: { cat: d.cat, cost: d.cost, turns: d.turns } }, { butce: d.cost }));
      });
      projs.sort(function (a, b) { return a.data.cost - b.data.cost; });
      groups.push({ id: 'proje', title: 'Projeler', emoji: '🏗️', options: projs });

      var saha = [lock({ id: 'ziyaret', emoji: '🚶', label: 'Mahalle ziyareti', hint: 'Seçtiğin mahallede yerel destek kazanırsın.', cost: '1 ⚡', pick: 'district' })];
      if (BG.dialogue) saha.push(lock({ id: 'gorusme', emoji: '💬', label: 'Vatandaşla birebir görüş', hint: 'İkna edersen o kesimin desteği artar; batırırsan düşer.', cost: '1 ⚡' }));
      var okDist = BG.DISTRICTS.filter(function (d) { return st.districts[d.id].hasar <= 0; }).map(function (d) { return d.id; });
      if (okDist.length < BG.DISTRICTS.length) saha.push(lock({ id: 'onarim', emoji: '🛠️', label: 'Hasar onarımı', hint: 'Afet hasarını giderir. Hasar puanı başına ₺' + C.REPAIR_COST + 'M.', cost: '1 ⚡ + hasara göre', pick: 'district', pickExclude: okDist }));
      groups.push({ id: 'saha', title: 'Sahaya İn', emoji: '🚶', options: saha });

      var kamp = BG.election && BG.election.hubOptions && BG.election.hubOptions(st);
      if (kamp) groups.push(kamp);

      return { type: 'hub', kicker: se.emoji + ' ' + se.name + ' · ' + E.year(st) + '. yıl', title: 'Makam Odası',
        text: left === 0 ? 'Seçimden önceki son mevsim. Son hamlelerini yap!' : left < C.CAMPAIGN_TURNS ? 'Kampanya dönemi başladı. Seçime ' + left + ' mevsim var.' : 'Mesaini nasıl kullanacaksın? Seçime ' + left + ' mevsim var.',
        groups: groups,
        options: [{ id: 'end', label: left === 0 ? 'Sandığa git 🗳️' : 'Mevsimi bitir ▶', hint: st.ap > 0 ? st.ap + ' mesai puanın duruyor' : '' }],
        data: { ap: st.ap, apMax: C.AP_PER_TURN, turnsLeft: left,
          active: st.projects.active.map(function (p) { var d = E.projectDef(p.id) || {}; return { id: p.id, name: d.name, emoji: d.emoji, left: p.left, district: p.district }; }) } };
    },
    act: function (st, cur, id, payload) {
      if (id === 'end') return E.endTurn(st);
      if (id.indexOf('kampanya') === 0) { if (BG.election && BG.election.hubAct) BG.election.hubAct(st, id, payload); return; }
      if (st.ap < 1) return E.flash(st, 'Bu mevsimlik mesain bitti.');
      var dist = payload.district && st.districts[payload.district] ? payload.district : null, dd = dist && E.district(dist), ctx = { district: dist }, dl;
      if (id.indexOf('proje:') === 0) {
        var d = E.projectDef(id.slice(6));
        if (!d || !E.check(st, d.when) || (d.yer === 'mahalle' && !dist)) return;
        if (E.projectBusy(st, d.id, d.yer === 'mahalle' ? dist : null, d.once !== false)) return E.flash(st, 'Bu proje zaten yapıldı ya da sürüyor.');
        if (!E.canPay(st, { butce: d.cost })) return E.flash(st, 'Bütçe yetersiz.');
        dl = E.pay(st, { butce: d.cost }).concat(E.apply(st, d.start, ctx)); st.ap--;
        st.projects.active.push({ id: d.id, district: d.yer === 'mahalle' ? dist : null, left: d.turns });
        E.log(st, d.name + (dd && d.yer === 'mahalle' ? ' (' + dd.name + ')' : '') + ' başladı.', 'proje');
        E.flash(st, d.emoji + ' ' + d.name + (dd && d.yer === 'mahalle' ? ' (' + dd.name + ')' : '') + ' için temel atıldı — ' + d.turns + ' mevsimde bitecek.', dl);
      } else if (id === 'ziyaret') {
        if (!dist) return;
        var again = st.visits[dist] === st.totalTurns, eff = { mahalle: again ? 1 : 3 };
        if (!again) eff[dominant(dd)] = 1;
        st.visits[dist] = st.totalTurns; st.ap--;
        E.flash(st, E.fmt(st, again ? '{mahalle} sakinleri “Başkan yine mi geldi?” dedi. Yine de sevindiler.' : E.pick(st, VISIT_LINES), ctx), E.apply(st, eff, ctx));
      } else if (id === 'gorusme') {
        var sc = BG.dialogue && BG.dialogue.make(st, { mode: 'mayor' });
        if (!sc) return E.flash(st, 'Randevu defteri boş: bugün görüşecek kimse çıkmadı.');
        st.ap--; E.interrupt(st, sc);
      } else if (id === 'onarim') {
        if (!dist || st.districts[dist].hasar <= 0) return;
        var c = { butce: Math.ceil(st.districts[dist].hasar * C.REPAIR_COST) };
        if (!E.canPay(st, c)) return E.flash(st, dd.name + ' onarımı için ' + E.costText(c) + ' gerekiyor; kasa yetmiyor.');
        dl = E.pay(st, c).concat(E.apply(st, { hasar: -st.districts[dist].hasar, mahalle: 3 }, ctx)); st.ap--;
        E.log(st, dd.name + ' onarıldı.', 'proje');
        E.flash(st, '🛠️ ' + dd.name + ' onarıldı. Enkaz kalktı, sokaklar yeniden açıldı.', dl);
      }
    }
  };

  var ENDINGS = {
    efsane: { title: 'Efsane Başkan', tone: 'good', text: 'Üç dönem boyunca şehri yönettin ve son sandıktan da alnının akıyla çıktın. Adın bir bulvara, heykelin meydana, hikâyen kahvehane sohbetlerine kaldı.' },
    onurlu: { title: 'Onurlu Veda', tone: 'normal', text: 'Üç dönemlik başkanlığın son seçimde noktalandı. Koltuğu devrettin ama şehrin her köşesinde bir imzan kaldı. Emekli başkanlar lokalinde en iyi masa senin.' },
    veda:   { title: 'Siyasete Veda', tone: 'danger', text: 'Üst üste gelen yenilgiler yolun sonunu getirdi. Parti rozetini çekmeceye koydun; artık sabah kahveni kimse bölmeyecek. Belki bir gün anılarını yazarsın.' }
  };
  E.score = function (st) {
    var s = 0;
    BG.STATS.forEach(function (x) { s += st.stats[x.id]; });
    return Math.max(0, Math.round(st.score + (st.wins - 1) * 150 + st.termsServed * 200 + (s / BG.STATS.length) * 3 + st.res.itibar * 2 - st.losses * 40));
  };
  S.ending = {
    view: function (st, cur) {
      var e = ENDINGS[cur.kind] || ENDINGS.veda, sc = E.score(st);
      var rank = sc >= 1200 ? 'Şehrin Efsanesi' : sc >= 900 ? 'Usta Başkan' : sc >= 600 ? 'İcraatçı' : sc >= 350 ? 'Eli Yüzü Düzgün Siyasetçi' : 'Mahalle Muhtarı Adayı';
      return { type: 'ending', kicker: 'Oyun bitti', title: e.title, tone: e.tone, text: [e.text, 'Miras puanın: ' + sc + ' — unvanın: ' + rank],
        data: { kind: cur.kind, score: sc, rank: rank, wins: st.wins, losses: st.losses, termsServed: st.termsServed,
          projects: st.projects.done.filter(function (p) { return !p.by; }).length,   // rakibin açtıkları sayılmaz
          stats: BG.STATS.map(function (x) { return { label: x.name, emoji: x.emoji, value: Math.round(st.stats[x.id]) }; }) },
        options: [{ id: 'new', label: 'Yeni oyun' }] };
    },
    act: function () { E.clearSave(); BG.state = null; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
