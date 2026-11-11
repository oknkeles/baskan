'use strict';
/* Başsız oyun simülasyonu: bot oyunu baştan sona oynar; çökme, kilitlenme, bozuk durum ve denge istatistiklerini raporlar.
 *   node tools/sim.js [--games=200] [--policy=akilli|rastgele|pasif|usta] [--seed=1] [--max=4000] [--v] [--set=SABIT:değer,...] [--rb=N]
 * Politikalar: akilli   = hub'da parası yettikçe proje başlatır, mesaisini harcar; olaylarda rastgele seçer (yarı rastgele)
 *              rastgele = her yerde rastgele
 *              pasif    = hub'da hiçbir şey yapmadan mevsimi bitirir (cezalandırılmalı)
 *              usta     = makul bir insan: mesainin hepsini harcar, en zayıf göstergeyi yükselten ve parası yeten projeyi seçer,
 *                         yedek bütçe tutar, hasarı onarır, kampanya döneminde kampanya yapar; muhalefette gücü yeten görevleri seçer;
 *                         kararlarda seçenek tanımlarını (BG.data) okuyup beklenen ağırlıklı etkisi en yüksek olanı seçer;
 *                         görüşmelerde blöf yapmaz, (ikna + mizaç düzeltmesi) en yüksek cevabı verir.
 * Her adımda durum JSON'a çevrilip geri yüklenir (kayıt uyumluluğu) ve değişmezler denetlenir.
 * Ayrıca oyuncuya gösterilen her rozet (deltas / fx / flash) denetlenir: sayı tam ya da tek ondalık, etiket Türkçe ad (ham anahtar değil).
 */
const { load } = require('./load');
const BG = load();
const E = BG.engine, C = BG.C;
const args = Object.fromEntries(process.argv.slice(2).map(a => { const p = a.replace(/^--/, '').split('='); return [p[0], p[1] === undefined ? '1' : p[1]]; }));
const GAMES = +args.games || 200, POLICY = args.policy || 'akilli', MAX = +args.max || 4000, SEED = +args.seed || 1;

// --set=AD:değer,AD:değer → denge denemesi için BG.C sabitlerini geçici olarak değiştirir (dosyaya yazmaz)
if (args.set) args.set.split(',').forEach(kv => { const [k, v] = kv.split(':'); if (k in C) C[k] = +v; else console.error('Bilinmeyen sabit: ' + k); });

// --rb=N → denge denemesi: tüm rakiplerin base değerine N ekler (dosyaya yazmaz)
if (args.rb) (BG.data.rivals || []).forEach(r => { r.base = (r.base || C.RIVAL_BASE) + +args.rb; });

let botState = 1;
function rnd() { botState = (Math.imul(botState, 1664525) + 1013904223) | 0; return (botState >>> 0) / 4294967296; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }
function allOptions(v) { let o = (v.options || []).slice(); (v.groups || []).forEach(g => { o = o.concat(g.options || []); }); return o; }
const byId = (list, id) => BG.byId(list || [], id);

/* ───────── usta: değerlendirme ───────── */
const STAT_IDS = BG.STATS.map(s => s.id), GROUP_IDS = BG.GROUPS.map(g => g.id);
const W = { halk: 6, itibar: 1.5, butce: 1 / 12, kriz: 2, mahalle: 0.5, rakip: -1, fon: 1 / 8, gonullu: 0.5, enerji: 1, hasar: -0.15 };
function weightOf(k) { if (STAT_IDS.includes(k) || GROUP_IDS.includes(k)) return 1; return W[k] || 0; }
function effVal(eff) { let s = 0; for (const k in (eff || {})) if (typeof eff[k] === 'number') s += eff[k] * weightOf(k); return s; }
/** Bir seçeneğin beklenen değeri: etkiler + Σ p·sonuç − maliyet. */
function choiceVal(ch) {
  let v = effVal(ch.effects) - effVal(ch.cost);
  (ch.outcomes || []).forEach(o => { v += (o.p || 0) * effVal(o.effects); });
  return v;
}
function bestChoice(v, choices) {
  let best = null, bv = -Infinity;
  (v.options || []).forEach(o => {
    if (o.disabled) return;
    const ch = choices && choices[+o.id];
    if (!ch) return;
    const val = choiceVal(ch);
    if (val > bv) { bv = val; best = o; }
  });
  return best || (v.options || []).find(o => !o.disabled) || null;
}
function dominantGroup(d) { let b = null; for (const k in d.mix) if (!b || d.mix[k] > d.mix[b]) b = k; return b; }
/** Projenin değeri: düşük göstergeye giden puan daha değerli. */
function projectVal(st, d) {
  let v = 0;
  const all = Object.assign({}, d.effects);
  for (const k in (d.start || {})) all[k] = (all[k] || 0) + d.start[k];
  for (const k in all) {
    const x = all[k];
    if (typeof x !== 'number') continue;
    if (STAT_IDS.includes(k)) v += x * Math.max(0.4, Math.min(3, 1 + (55 - st.stats[k]) / 15));
    else v += x * weightOf(k);
  }
  return v;
}

function ustaHub(v, st, mem) {
  const opts = allOptions(v).filter(o => !o.disabled);
  const has = id => opts.find(o => o.id === id);
  const end = has('end');
  if (st.ap < 1) return { o: end };
  const left = E.turnsLeft(st), camp = left < C.CAMPAIGN_TURNS;
  let upkeep = 0;
  st.projects.done.forEach(p => { const d = E.projectDef(p.id); if (d) upkeep += d.upkeep || 0; });
  const reserve = 50 + upkeep * 2;
  const poll = E.poll(st);
  const weakDistricts = BG.DISTRICTS.slice().sort((a, b) => (poll.byDistrict[a.id].player - poll.byDistrict[b.id].player) || b.pop - a.pop);

  // 1) hasar onarımı (yedek bütçeyi koruyarak)
  const rep = has('onarim');
  if (rep) {
    const dmg = BG.DISTRICTS.filter(d => st.districts[d.id].hasar > 0 && st.res.butce - Math.ceil(st.districts[d.id].hasar * C.REPAIR_COST) >= reserve * 0.6)
      .sort((a, b) => st.districts[b.id].hasar * b.pop - st.districts[a.id].hasar * a.pop);
    if (dmg.length) return { o: rep, payload: { district: dmg[0].id } };
  }
  // 2) kampanya
  if (camp) {
    if (has('kampanya_anket') && mem.anket !== st.totalTurns && st.res.butce > reserve) { mem.anket = st.totalTurns; return { o: has('kampanya_anket') }; }
    const vaat = has('kampanya_vaat');
    if (vaat && mem.vaat !== st.totalTurns) { mem.vaat = st.totalTurns; return { o: vaat }; }
    const tv = has('kampanya_tartisma');
    if (tv && st.res.itibar >= 50) return { o: tv };
    const af = has('kampanya_afis');
    const c = (st.el && st.el.c && st.el.c.term === st.term) ? st.el.c : { rally: {}, afis: 0 };
    if (af && (c.afis || 0) < 1 && st.res.butce - 25 >= reserve * 0.5) return { o: af };
    const mt = has('kampanya_miting');
    if (mt && st.res.butce - 10 >= reserve * 0.5) {
      const fresh = weakDistricts.filter(d => !(c.rally || {})[d.id]);
      if (fresh.length) return { o: mt, payload: { district: fresh[0].id } };
    }
  }
  // 3) proje: parası yeten (yedek kalarak), seçimden önce biten, en değerli olan
  const projs = opts.filter(o => o.id.indexOf('proje:') === 0).map(o => ({ o, d: E.projectDef(o.id.slice(6)) }))
    .filter(x => x.d && st.res.butce - x.d.cost >= reserve && x.d.turns <= left + 1)
    .map(x => ({ o: x.o, d: x.d, val: projectVal(st, x.d) / (x.d.cost + (x.d.upkeep || 0) * 8) }))
    .filter(x => x.val > 0)
    .sort((a, b) => b.val - a.val);
  if (projs.length) {
    const p = projs[0];
    let payload = {};
    if (p.o.pick === 'district') {
      const ok = weakDistricts.filter(d => (p.o.pickExclude || []).indexOf(d.id) < 0);
      payload = { district: (ok[0] || weakDistricts[0]).id };
    }
    return { o: p.o, payload };
  }
  // 4) vatandaşla görüşme (mevsimde bir), sonra mahalle ziyareti
  if (has('gorusme') && mem.gorusme !== st.totalTurns) { mem.gorusme = st.totalTurns; return { o: has('gorusme') }; }
  const zi = has('ziyaret');
  if (zi) {
    const fresh = weakDistricts.filter(d => st.visits[d.id] !== st.totalTurns);
    return { o: zi, payload: { district: (fresh[0] || weakDistricts[0]).id } };
  }
  return { o: end };
}

function ustaOppHub(v, st, mem) {
  const opts = allOptions(v).filter(o => !o.disabled);
  const has = id => opts.find(o => o.id === id);
  const end = has('end');
  if (st.ap < 1) return { o: end };
  const o = st.opp || {}, left = E.turnsLeft(st), camp = left < C.CAMPAIGN_TURNS, fon = st.res.fon;
  const poll = E.poll(st);
  const weak = BG.DISTRICTS.slice().sort((a, b) => (poll.byDistrict[a.id].player - poll.byDistrict[b.id].player) || b.pop - a.pop);
  const c = (st.el && st.el.c && st.el.c.term === st.term) ? st.el.c : { rally: {}, afis: 0 };
  if (camp) {
    if (has('kampanya_anket') && mem.anket !== st.totalTurns && fon > 20) { mem.anket = st.totalTurns; return { o: has('kampanya_anket') }; }
    const vaat = has('kampanya_vaat');
    if (vaat && mem.vaat !== st.totalTurns) { mem.vaat = st.totalTurns; return { o: vaat }; }
    if (has('kampanya_tartisma') && st.res.itibar >= 50) return { o: has('kampanya_tartisma') };
    if (has('kampanya_afis') && (c.afis || 0) < 2) return { o: has('kampanya_afis') };
    const mt = has('kampanya_miting');
    if (mt) { const fresh = weak.filter(d => !(c.rally || {})[d.id]); if (fresh.length) return { o: mt, payload: { district: fresh[0].id } }; }
  }
  if (has('saha:ifsa') && (o.dosya || 0) >= 64) return { o: has('saha:ifsa') };
  // görevler: olay görevleri önce (parası yetenler zaten açık), sonra birebir
  const gorev = opts.filter(x => x.id.indexOf('gorev:') === 0 && x.id !== 'gorev:yok');
  const olay = gorev.filter(x => x.tag !== 'Birebir');
  const pickG = olay[0] || (mem.dlg !== st.totalTurns ? gorev[0] : null);
  if (pickG) {
    if (pickG.tag === 'Birebir') mem.dlg = st.totalTurns;
    return { o: pickG, payload: pickG.pick === 'district' ? { district: weak[0].id } : {} };
  }
  if (has('saha:dosya') && (o.dosya || 0) < 64 && (o.ifsa || 0) < 2 && fon >= 20) return { o: has('saha:dosya') };
  if (has('saha:gonullu') && fon >= 30 && st.res.gonullu < 16) return { o: has('saha:gonullu') };
  if (has('saha:bagis') && fon < 40) return { o: has('saha:bagis') };
  const zi = has('saha:ziyaret');
  if (zi) { const fresh = weak.filter(d => !(o.visits || {})[d.id]); return { o: zi, payload: { district: (fresh[0] || weak[0]).id } }; }
  return { o: end || opts[0] };
}

function ustaScene(v, st) {
  const cur = st.cur || {}, opts = (v.options || []).filter(o => !o.disabled);
  if (!opts.length) return null;
  const first = opts[0];
  switch (cur.t) {
    case 'event': {
      if (cur.result) return first;
      const ev = E.findEvent(cur.id);
      return bestChoice(v, ev && ev.choices) || first;
    }
    case 'mission': {
      if (cur.result) return first;
      const m = byId(BG.data.missions, cur.id);
      return bestChoice(v, m && m.choices) || first;
    }
    case 'disaster': {
      if (cur.phase !== 'stage') return first;
      const x = byId(BG.data.disasters, cur.id);
      const list = cur.opp ? ((x && x.opp) || {}).choices : (((x && x.stages) || [])[cur.plan[cur.si]] || {}).choices;
      return bestChoice(v, list) || first;
    }
    case 'dialogue': {
      if (cur.phase === 'door') return opts.find(o => o.id === 'kabul') || first;
      if (cur.phase !== 'talk') return first;
      const x = byId(BG.data.dialogues, cur.id), rd = x && x.rounds[cur.round];
      const mods = (BG.MIZAC[x && x.mizac] || {}).mods || {};
      let best = null, bv = -Infinity;
      opts.forEach(o => {
        if (o.risk) return;
        const d = rd && rd.options[+o.id];
        const val = d ? (d.ikna || 0) + (mods[d.tone] || 0) : -99;
        if (val > bv) { bv = val; best = o; }
      });
      return best || first;
    }
    case 'vaat': {
      // yalnız şu an tutulmuş sayılacak sözü ver; yoksa vazgeç
      const ok = opts.filter(o => o.id.indexOf('p:') === 0).find(o => { const d = byId(BG.data.promises, o.id.slice(2)); return d && E.check(st, d.kosul); });
      return ok || opts.find(o => o.id === 'vazgec') || first;
    }
    case 'tartisma': {
      if (cur.res) return first;
      return opts.find(o => o.id === (st.res.itibar >= 52 ? 'veri' : 'espri')) || first;
    }
    case 'onSecim': {
      if (cur.result) return first;
      const est = { 0: 8, 1: 3 + Math.min(12, Math.round(st.res.gonullu * 0.7)), 2: 5, 3: 12 };
      return opts.slice().sort((a, b) => (est[b.id] || 0) - (est[a.id] || 0))[0];
    }
    case 'yuzlesme': return opts.find(o => o.id === '0') || first;
  }
  return first;
}

function choose(v, st, mem) {
  const opts = allOptions(v).filter(o => !o.disabled);
  if (!opts.length) return null;
  const isHub = (v.groups || []).length > 0;
  if (POLICY === 'usta') {
    if (isHub) return v.type === 'oppHub' ? ustaOppHub(v, st, mem) : ustaHub(v, st, mem);
    const o = ustaScene(v, st);
    return o ? { o } : null;
  }
  if (isHub) {
    const end = opts.find(o => o.id === 'end');
    const acts = opts.filter(o => o.id !== 'end');
    if (POLICY === 'pasif' && end) return { o: end };
    if (POLICY === 'akilli') {
      const projs = acts.filter(o => o.id.indexOf('proje:') === 0 && o.data && st.res.butce - o.data.cost >= 30);
      if (projs.length) return { o: pick(projs) };
      const rest = acts.filter(o => o.id.indexOf('proje:') !== 0);
      if (rest.length && rnd() < 0.85) return { o: pick(rest) };
      return { o: end || pick(opts) };
    }
  }
  return { o: pick(opts) };
}
function payloadFor(o) {
  if (o.pick !== 'district') return {};
  const ok = BG.DISTRICTS.map(d => d.id).filter(id => (o.pickExclude || []).indexOf(id) < 0);
  return { district: pick(ok.length ? ok : BG.DISTRICTS.map(d => d.id)) };
}
function invariants(st) {
  const bad = [];
  Object.keys(st.stats).forEach(k => { const v = st.stats[k]; if (!(v >= 0 && v <= 100)) bad.push('stats.' + k + '=' + v); });
  Object.keys(st.groups).forEach(k => { const v = st.groups[k]; if (!(v >= 0 && v <= 100)) bad.push('groups.' + k + '=' + v); });
  Object.keys(st.res).forEach(k => { if (!Number.isFinite(st.res[k])) bad.push('res.' + k + '=' + st.res[k]); });
  Object.keys(st.districts).forEach(k => { const d = st.districts[k]; if (!Number.isFinite(d.bonus) || !(d.hasar >= 0 && d.hasar <= 100)) bad.push('districts.' + k + '=' + JSON.stringify(d)); });
  if (!(st.ap >= 0)) bad.push('ap=' + st.ap);
  if (!st.rival || !Number.isFinite(st.rival.strength)) bad.push('rival=' + JSON.stringify(st.rival));
  if (st.res.itibar < 0 || st.res.itibar > 100 || st.res.fon < 0 || st.res.gonullu < 0) bad.push('res aralık dışı: ' + JSON.stringify(st.res));
  return bad;
}
/** Oyuncuya gösterilen rozetler: sayı tam ya da tek ondalık, etiket ham anahtar değil. */
function badDeltas(v) {
  const out = [];
  function chk(list, where) {
    (list || []).forEach(d => {
      if (!d || typeof d.delta !== 'number' || !Number.isFinite(d.delta) || Math.abs(d.delta * 10 - Math.round(d.delta * 10)) > 1e-6) out.push(where + ' sayı: ' + JSON.stringify(d));
      else if (!d.label || typeof d.label !== 'string' || d.label === d.key) out.push(where + ' etiket: ' + JSON.stringify(d));
    });
  }
  if (!v) return out;
  chk(v.deltas, v.type + '.deltas');
  (v.list || []).forEach(r => chk(r && r.deltas, v.type + '.list'));
  allOptions(v).forEach(o => chk(o.fx, v.type + '.fx'));
  if (v.flash) chk(v.flash.deltas, v.type + '.flash');
  return out;
}

const R = { games: 0, crashes: [], stuck: [], loops: [], broken: [], deltaIssues: {}, endings: {}, turns: 0, scenes: {},
  won: { mayor: 0, opposition: 0 }, lost: { mayor: 0, opposition: 0 }, firstPoll: [], firstStats: {}, firstBudget: [], firstProjects: [], firstMisc: [], pre: {}, score: 0, projects: 0,
  byTerm: {}, byStreak: {}, removed: 0, bankrupt: 0, crisisGames: 0, comebackCrash: 0, comebacks: 0,
  dis: { n: 0, sev: { 1: 0, 2: 0, 3: 0 }, prep: { low: { 1: 0, 2: 0, 3: 0 }, mid: { 1: 0, 2: 0, 3: 0 }, high: { 1: 0, 2: 0, 3: 0 } } }, oppTurns: 0, mayorTurns: 0 };
function tally(map, key, won) { const t = map[key] = map[key] || { w: 0, l: 0 }; if (won) t.w++; else t.l++; }

for (let g = 0; g < GAMES; g++) {
  const seed = SEED + g;
  botState = seed * 7919 + 13;
  let st = E.newGame({ seed, playerName: 'Bot', cityName: 'Simköy' });
  let steps = 0, ended = false, firstDone = false, hadCrisis = false, comebackAt = null;
  const mem = {}, seenDis = {};
  try {
    while (steps++ < MAX) {
      BG.state = st = JSON.parse(JSON.stringify(BG.state));       // kayıt uyumluluğu
      const v = E.view();
      if (!v) { ended = true; break; }
      R.scenes[v.type] = (R.scenes[v.type] || 0) + 1;
      badDeltas(v).forEach(s => { R.deltaIssues[s] = (R.deltaIssues[s] || 0) + 1; });
      if (v.type === 'ending') {
        R.endings[v.data.kind] = (R.endings[v.data.kind] || 0) + 1; R.score += v.data.score; R.turns += st.totalTurns; R.projects += v.data.projects;
        ended = true; break;
      }
      if (st.cur && st.cur.t === 'disaster' && st.cur.phase === 'intro') {
        const key = st.totalTurns + ':' + st.cur.id;
        if (!seenDis[key]) {
          seenDis[key] = 1; R.dis.n++; R.dis.sev[st.cur.sev]++;
          const af = st.stats.afet;   // Afet Hazırlığı göstergesine göre kova
          R.dis.prep[af < 45 ? 'low' : af > 70 ? 'high' : 'mid'][st.cur.sev]++;
        }
      }
      const ch = choose(v, st, mem);
      if (!ch || !ch.o) { R.stuck.push({ seed, steps, type: v.type, title: v.title }); break; }
      const o = ch.o;
      const before = { wins: st.wins, losses: st.losses, mode: st.mode, term: st.term, termsServed: st.termsServed, lossStreak: st.lossStreak, totalTurns: st.totalTurns };
      if (!firstDone && st.term === 1 && st.turn === st.cycleLen && o.id === 'end') {
        firstDone = true; R.firstPoll.push(E.poll(st).player - E.poll(st).rival); R.firstBudget.push(st.res.butce);
        R.firstProjects.push(st.projects.done.filter(p => !p.by).length);
        R.firstMisc.push({ grp: BG.GROUPS.reduce((a, x) => a + st.groups[x.id], 0) / BG.GROUPS.length, itibar: st.res.itibar, k: st.kampanya || 0,
          bonus: BG.DISTRICTS.reduce((a, d) => a + st.districts[d.id].bonus * d.pop, 0) / 100, rival: st.rival.strength });
        BG.STATS.forEach(s => { R.firstStats[s.id] = (R.firstStats[s.id] || 0) + st.stats[s.id]; });
      }
      if (st.turn === st.cycleLen && o.id === 'end' && args.v) {   // --v: her seçim öncesi durum
        const key = st.mode === 'mayor' ? 'B' + (st.termsServed + 1) : 'M' + st.lossStreak, p = E.poll(st);
        const s = R.pre[key] = R.pre[key] || { n: 0, lead: 0, grp: 0, itibar: 0, k: 0, bonus: 0, rival: 0, butce: 0, stat: 0, hasar: 0 };
        s.n++; s.lead += p.player - p.rival; s.lead2 = (s.lead2 || 0) + (p.player - p.rival) ** 2; s.grp += BG.GROUPS.reduce((a, x) => a + st.groups[x.id], 0) / BG.GROUPS.length; s.itibar += st.res.itibar; s.k += st.kampanya || 0;
        s.bonus += BG.DISTRICTS.reduce((a, d) => a + st.districts[d.id].bonus * d.pop, 0) / 100; s.rival += st.rival.strength; s.butce += st.res.butce;
        s.stat += BG.STATS.reduce((a, x) => a + st.stats[x.id], 0) / BG.STATS.length; s.hasar += BG.DISTRICTS.reduce((a, d) => a + st.districts[d.id].hasar * d.pop, 0) / 100;
      }
      E.act(o.id, ch.payload || payloadFor(o));
      st = BG.state;
      if (!st) { ended = true; break; }
      if (st.totalTurns > before.totalTurns) { if (before.mode === 'opposition') R.oppTurns += st.totalTurns - before.totalTurns; else R.mayorTurns += st.totalTurns - before.totalTurns; }
      if (st.wins > before.wins) {
        R.won[before.mode]++;
        if (before.mode === 'mayor') tally(R.byTerm, before.termsServed + 1, true);
        else { tally(R.byStreak, before.lossStreak, true); R.comebacks++; comebackAt = st.totalTurns; }
      }
      if (st.losses > before.losses) {
        const k = st.log.slice(0, 4).find(l => l.kind === 'kriz' && (l.text === 'Görevden alındın.' || l.text === 'Belediye iflas etti.'));
        if (v.type !== 'electionResult' && before.mode === 'mayor' && k) {   // seçim dışı kayıp = görevden alınma / iflas
          if (k.text === 'Görevden alındın.') R.removed++; else R.bankrupt++;
          hadCrisis = true;
          if (comebackAt != null && st.totalTurns - comebackAt <= 2) R.comebackCrash++;
        } else {
          R.lost[before.mode]++;
          if (before.mode === 'mayor') tally(R.byTerm, before.termsServed + 1, false); else tally(R.byStreak, before.lossStreak, false);
        }
      }
      const bad = invariants(st);
      if (bad.length) { R.broken.push({ seed, steps, bad: bad.slice(0, 4), after: v.type + ':' + o.id }); break; }
    }
    if (!ended && steps >= MAX) R.loops.push({ seed, type: BG.state && BG.state.cur && BG.state.cur.t, totalTurns: BG.state && BG.state.totalTurns });
  } catch (e) {
    R.crashes.push({ seed, steps, scene: BG.state && BG.state.cur && JSON.stringify(BG.state.cur).slice(0, 160), error: (e.stack || String(e)).split('\n').slice(0, 4).join(' | ') });
  }
  if (hadCrisis) R.crisisGames++;
  R.games++;
}

const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length) : 0;
const pct = (a, b) => a + b ? Math.round(100 * a / (a + b)) + '%' : '—';
const rate = t => t ? pct(t.w, t.l) + ' (' + t.w + '/' + (t.w + t.l) + ')' : '—';
const done = Object.values(R.endings).reduce((x, y) => x + y, 0) || 1;
const deltaKeys = Object.keys(R.deltaIssues);
console.log('=== Simülasyon: ' + R.games + ' oyun, politika=' + POLICY + ' ===');
console.log('Çökme: ' + R.crashes.length + ' · Kilitlenme: ' + R.stuck.length + ' · Sonsuz döngü: ' + R.loops.length + ' · Bozuk durum: ' + R.broken.length + ' · Bozuk rozet: ' + deltaKeys.length);
console.log('Sonlar: ' + JSON.stringify(R.endings) + ' · ort. mevsim: ' + (R.turns / done).toFixed(1) + ' · ort. puan: ' + Math.round(R.score / done) + ' · ort. proje (oyuncunun): ' + (R.projects / done).toFixed(1));
console.log('Başkanken seçim kazanma: ' + pct(R.won.mayor, R.lost.mayor) + ' (' + R.won.mayor + '/' + (R.won.mayor + R.lost.mayor) + ')' +
  ' — 1. dönem ' + rate(R.byTerm[1]) + ' · 2. dönem ' + rate(R.byTerm[2]) + ' · 3. dönem ' + rate(R.byTerm[3]));
console.log('Muhalefetten kazanma: ' + pct(R.won.opposition, R.lost.opposition) + ' (' + R.won.opposition + '/' + (R.won.opposition + R.lost.opposition) + ')' +
  ' — kayıp serisi 1: ' + rate(R.byStreak[1]) + ' · 2: ' + rate(R.byStreak[2]));
console.log('Görevden alınma: ' + R.removed + ' · iflas: ' + R.bankrupt + ' · krizli oyun: ' + R.crisisGames + '/' + R.games + ' (' + Math.round(100 * R.crisisGames / (R.games || 1)) + '%)' +
  ' · geri dönüşten sonra 2 mevsimde kriz: ' + R.comebackCrash + '/' + R.comebacks);
const totT = R.mayorTurns + R.oppTurns || 1, dn = R.dis.n || 1;
const split = s => [1, 2, 3].map(i => SEV(i) + Math.round(100 * s[i] / ((s[1] + s[2] + s[3]) || 1)) + '%').join(' ') + ' (n=' + (s[1] + s[2] + s[3]) + ')';
function SEV(i) { return ['', 'hafif ', 'orta ', 'ağır '][i]; }
console.log('Afet: 12 mevsimde ort. ' + (R.dis.n / totT * 12).toFixed(2) + ' · şiddet ' + split(R.dis.sev) +
  ' · Afet Hazırlığı <45: ' + split(R.dis.prep.low) + ' · 45-70: ' + split(R.dis.prep.mid) + ' · >70: ' + split(R.dis.prep.high));
console.log('İlk seçim öncesi: ort. fark ' + avg(R.firstPoll).toFixed(1) + ' puan · ort. bütçe ' + Math.round(avg(R.firstBudget)) + ' · biten proje ' + avg(R.firstProjects).toFixed(1) +
  ' · göstergeler ' + BG.STATS.map(s => s.id + '=' + Math.round((R.firstStats[s.id] || 0) / (R.firstPoll.length || 1))).join(' '));
console.log('  (ilk seçim öncesi ortalamalar) grup desteği ' + avg(R.firstMisc.map(x => x.grp)).toFixed(1) + ' · itibar ' + avg(R.firstMisc.map(x => x.itibar)).toFixed(1) +
  ' · kampanya ' + avg(R.firstMisc.map(x => x.k)).toFixed(1) + ' · mahalle bonusu ' + avg(R.firstMisc.map(x => x.bonus)).toFixed(1) + ' · rakip gücü ' + avg(R.firstMisc.map(x => x.rival)).toFixed(1));
Object.keys(R.pre).sort().forEach(k => { const s = R.pre[k], f = x => (x / s.n).toFixed(1);
  console.log('  seçim öncesi ' + (k[0] === 'B' ? k.slice(1) + '. başkanlık' : 'muhalefet (seri ' + k.slice(1) + ')') + ' n=' + s.n + ': fark ' + f(s.lead) + ' (σ ' + Math.sqrt(Math.max(0, s.lead2 / s.n - (s.lead / s.n) ** 2)).toFixed(1) + ') · grup ' + f(s.grp) + ' · itibar ' + f(s.itibar) +
    ' · kampanya ' + f(s.k) + ' · bonus ' + f(s.bonus) + ' · rakip ' + f(s.rival) + ' · bütçe ' + f(s.butce) + ' · gösterge ort. ' + f(s.stat) + ' · hasar ' + f(s.hasar)); });
if (args.v) console.log('Sahne sayıları: ' + Object.keys(R.scenes).sort().map(k => k + '=' + R.scenes[k]).join(' '));
[['ÇÖKME', R.crashes], ['KİLİT', R.stuck], ['DÖNGÜ', R.loops], ['BOZUK', R.broken]].forEach(([n, list]) => list.slice(0, 6).forEach(x => console.log(n + ' ' + JSON.stringify(x))));
deltaKeys.slice(0, 8).forEach(k => console.log('ROZET ' + R.deltaIssues[k] + '× ' + k));
process.exit(R.crashes.length + R.stuck.length + R.loops.length + R.broken.length + deltaKeys.length ? 1 : 0);
