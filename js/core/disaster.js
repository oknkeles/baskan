/* BAŞKAN — AFET MODÜLÜ (BG.disaster + 'disaster' sahnesi)
 *
 * BG.disaster.roll(st) → sahne[]   Her mevsim başı (iki modda da) çağrılır. Yalnızca karar verir ve sahneyi döndürür;
 *                                   etkiyi UYGULAMAZ (önce mevsim raporu görünür). Defter: st.dis = { last, count, hist }.
 * Sahne nesnesi (JSON): { t:'disaster', id, district, sev, opp, phase, plan:[aşama indeksleri], si, kriz, impact, rival, res, karne }
 *   Başkanlık: intro → (aşama → sonuç) × n → karne → E.next
 *   Muhalefet: intro → karar → sonuç → E.next
 * View: type 'disaster', tone 'danger', district, data = { id, name, emoji, sev, sevName, step, steps, kriz }
 */
(function (root) {
  'use strict';
  var BG = root.BG, E = BG.engine, S = BG.scenes = BG.scenes || {};
  var D = BG.disaster = {};
  var SEV_NAME = { 1: 'Hafif', 2: 'Orta', 3: 'Ağır' };
  var MIN_START = 2, COOLDOWN = 3, PITY_AFTER = 9, PITY_MULT = 3;
  // Şiddet puanı = zar(0..100) + mahalle riski × risk − hazırlık × prep + base; >62 ağır, >30 orta.
  // Hazırlık = (Afet Hazırlığı + afetin kendi hazırlık göstergelerinin ortalaması) / 2: Afet Hazırlığı her afette sayılır.
  // Ayar (diğer göstergeler ~50): Afet Hazırlığı ~35 → hafif/orta/ağır ≈ %40/%33/%27; ~72 → ağır ≈ %3; 70+ ve diğerleri 40 → ağır ≈ %6.
  D.SEV = { risk: 7, prep: 1.0, base: 15 };
  var GOOD = { itibar: 4, halk: 1, skor: 10 }, BAD = { itibar: -4, halk: -2 };

  function defs() { return BG.data.disasters || []; }
  function def(id) { return BG.byId(defs(), id); }
  function book(st) {
    var d = st.dis = st.dis || {};
    if (d.count == null) d.count = 0;
    if (d.last == null) d.last = 0;
    if (!d.hist) d.hist = [];
    return d;
  }
  function riskOf(dist, key) { return (dist.risk && dist.risk[key]) || 0; }
  function avgPrep(st, x) {
    var p = x.prep || [], s = 0, n = 0;
    p.forEach(function (k) { if (k in st.stats) { s += st.stats[k]; n++; } });
    return n ? s / n : 50;
  }

  /** Bu mevsim afet var mı? En fazla bir tane. → [sahne] | [] */
  D.roll = function (st) {
    var bk = book(st), now = st.totalTurns, since = now - bk.last;
    if (now <= MIN_START || (bk.count > 0 && since <= COOLDOWN)) return [];
    var se = E.season(st).id, mult = since >= PITY_AFTER ? PITY_MULT : 1;
    var cand = defs().filter(function (x) {
      if (!x || !x.id || !x.intro || !x.impact) return false;
      if (x.seasons != null && [].concat(x.seasons).indexOf(se) < 0) return false;
      return BG.DISTRICTS.some(function (d) { return riskOf(d, x.riskKey) > 0; });
    });
    if (!cand.length) return [];
    var total = 0;
    cand.forEach(function (x) { total += (x.chance || 0) * mult; });
    if (E.rand(st) >= Math.min(0.9, total)) return [];
    var x = E.weighted(st, cand, function (c) { return c.chance || 0; });
    if (!x) return [];
    var dist = E.weighted(st, BG.DISTRICTS, function (d) { return riskOf(d, x.riskKey); });
    if (!dist) return [];
    var r = riskOf(dist, x.riskKey);
    var prep = ('afet' in st.stats ? (st.stats.afet + avgPrep(st, x)) / 2 : avgPrep(st, x));
    var score = E.rand(st) * 100 + r * D.SEV.risk - prep * D.SEV.prep + D.SEV.base;
    var sev = score > 62 ? 3 : score > 30 ? 2 : 1;
    bk.last = now; bk.count++;
    bk.hist.push({ id: x.id, n: now, sev: sev, district: dist.id }); if (bk.hist.length > 20) bk.hist.shift();
    var opp = st.mode === 'opposition';
    var plan = [];
    (x.stages || []).forEach(function (sg, i) { if ((sg.minSev || 1) <= sev) plan.push(i); });
    return [{ t: 'disaster', id: x.id, district: dist.id, sev: sev, opp: opp, phase: 'intro', plan: opp ? [] : plan, si: 0, kriz: 0,
      impact: null, rival: null, res: null, karne: null }];
  };

  /* ───────── Sahne ───────── */
  function ctxOf(cur) { return { district: cur.district, kriz: cur.kriz || 0 }; }
  function stepInfo(cur) {
    if (cur.opp) return { step: cur.phase === 'intro' ? 1 : 2, steps: 2 };
    var n = cur.plan.length, steps = n + 2, step;
    if (cur.phase === 'intro') step = 1;
    else if (cur.phase === 'karne') step = steps;
    else step = 2 + cur.si;
    return { step: step, steps: steps };
  }
  function baseView(st, cur, x) {
    var si = stepInfo(cur), dn = E.district(cur.district);
    return { type: 'disaster', tone: 'danger', district: cur.district,
      kicker: '🚨 ' + x.emoji + ' ' + x.name + ' · ' + SEV_NAME[cur.sev] + (dn ? ' · ' + dn.name : ''),
      data: { id: x.id, name: x.name, emoji: x.emoji, sev: cur.sev, sevName: SEV_NAME[cur.sev], step: si.step, steps: si.steps, kriz: cur.kriz || 0 },
      options: [] };
  }
  function impactLine(cur) {
    var out = [];
    if (cur.impact && cur.impact.length) out.push({ emoji: '🏚️', title: 'İlk hasar raporu', text: 'Afetin şehre ilk faturası.', deltas: cur.impact });
    if (cur.rival) out.push({ emoji: cur.rival.good ? '🥊' : '📉', title: 'Belediyenin karnesi', text: cur.rival.text, deltas: cur.rival.deltas });
    return out;
  }
  function choicesFor(cur, x) { return cur.opp ? ((x.opp || {}).choices || []) : (((x.stages || [])[cur.plan[cur.si]] || {}).choices || []); }
  function optionsFor(st, cur, x) {
    var ctx = ctxOf(cur), opts = choicesFor(cur, x).map(function (ch, i) { return E.choiceOption(st, ch, i, ctx); });
    if (!opts.length || opts.every(function (o) { return o.disabled; })) opts.push({ id: 'pas', label: 'Elindekiyle idare et', hint: 'İtibar −2' });
    return opts;
  }
  function grade(cur) {
    var n = Math.max(1, cur.plan.length), avg = (cur.kriz || 0) / n;
    return avg >= 1.4 ? 'good' : avg < 0.5 ? 'bad' : 'mid';
  }

  S.disaster = {
    view: function (st, cur) {
      var x = def(cur.id);
      if (!x) return { type: 'disaster', tone: 'danger', title: 'Alarm geçti', text: 'Kriz masası toplandı ama haber asılsız çıktı. Herkes derin bir nefes aldı.',
        district: cur.district, data: { id: cur.id, name: 'Afet', emoji: '🚨', sev: cur.sev || 1, sevName: SEV_NAME[cur.sev || 1], step: 1, steps: 1, kriz: 0 },
        options: [{ id: 'ok', label: 'Devam' }] };
      var v = baseView(st, cur, x), ctx = ctxOf(cur), sg;
      if (cur.phase === 'intro') {
        v.title = 'Son dakika: ' + x.name + '!';
        v.text = cur.opp ? [E.fmt(st, (x.intro || {})[cur.sev], ctx), E.fmt(st, (x.opp || {}).text, ctx)].filter(Boolean) : E.fmt(st, (x.intro || {})[cur.sev], ctx);
        v.options = [{ id: 'ok', label: cur.opp ? 'Durumu değerlendir' : 'Kriz masasını topla', emoji: '🚨' }];
      } else if (cur.phase === 'stage') {
        if (cur.opp) { v.title = 'Muhalefetten ne yapacaksın?'; v.text = 'Kriz masasında sana sandalye yok. Ama sahada, ekranda ya da perde arkasında bir rolün olabilir; hamleni seç.'; }
        else {
          sg = x.stages[cur.plan[cur.si]] || {};
          v.title = E.fmt(st, sg.title, ctx) || 'Kriz masası';
          v.text = E.fmt(st, sg.text, ctx);
        }
        if (cur.si === 0) v.list = impactLine(cur);
        v.options = optionsFor(st, cur, x);
      } else if (cur.phase === 'result') {
        v.title = cur.res.title || 'Sonuç';
        v.text = cur.res.text;
        v.deltas = cur.res.deltas;
        var last = cur.opp || cur.si + 1 >= cur.plan.length;
        v.options = [{ id: 'ok', label: last ? (cur.opp ? 'Devam' : 'Kriz karnesini gör') : 'Sonraki aşama' }];
      } else {
        v.title = 'Kriz Karnesi';
        v.tone = cur.karne && cur.karne.g === 'good' ? 'good' : 'danger';
        v.text = cur.karne ? cur.karne.text : '';
        v.deltas = cur.karne ? cur.karne.deltas : [];
        if (!cur.plan.length) v.list = impactLine(cur);
        v.options = [{ id: 'ok', label: 'Devam' }];
      }
      return v;
    },
    act: function (st, cur, id) {
      var x = def(cur.id), ctx, dl, ch, r;
      if (!x) return E.next(st);
      if (cur.phase === 'intro') {
        ctx = ctxOf(cur);
        var imp = (x.impact || {})[cur.sev] || {}, k, eff = {};
        // Muhalefetteyken afet koltuktakinin sorunudur: oyuncunun itibarı ve seçmen desteği doğrudan kesilmez
        // (halkın tepkisi aşağıdaki "belediyenin karnesi" ile rakibe yansır; hasar oy modelinde rakibin hanesine yazılır).
        for (k in imp) if (!(cur.opp && (k === 'halk' || k === 'itibar' || k in st.groups))) eff[k] = imp[k];
        cur.impact = E.mergeDeltas(E.apply(st, eff, ctx));
        var dn = E.district(cur.district);
        E.log(st, x.emoji + ' ' + x.name + ' (' + SEV_NAME[cur.sev] + ') ' + (dn ? dn.name : 'şehir') + ' bölgesini vurdu.', 'afet');
        if (cur.opp) {
          var bad = E.rand(st) < 0.5, rn = E.rivalDef(st).name;
          dl = E.apply(st, bad ? { rakip: -3, halk: 1 } : { rakip: 2 });
          cur.rival = { good: !bad, deltas: dl,
            text: bad ? 'Başkan ' + rn + ' krizi yönetemedi: ekipler geç kaldı, açıklamalar çelişti. Halk muhalefete kulak veriyor.'
                      : 'Başkan ' + rn + ' bu kez hızlı davrandı; ekipler sahada, kameralar da peşinde.' };
          cur.phase = 'stage';
        } else if (cur.plan.length) cur.phase = 'stage';
        else finish(st, cur, x);
        return;
      }
      if (cur.phase === 'stage') {
        ctx = ctxOf(cur);
        if (id === 'pas') {
          var list = choicesFor(cur, x);
          if (list.length && !list.every(function (c) { return !E.check(st, c.when) || !E.canPay(st, c.cost); })) return;
          ctx.kriz -= cur.opp ? 0 : 1;
          r = { text: 'Elindeki imkânlarla idare etmeye çalıştın; yetmedi.', deltas: E.apply(st, { itibar: -2 }, ctx), title: 'Eldeki imkânlar' };
        } else {
          var stageDef = cur.opp ? null : x.stages[cur.plan[cur.si]];
          ch = choicesFor(cur, x)[+id];
          if (!ch || !E.check(st, ch.when) || !E.canPay(st, ch.cost)) return;
          r = E.resolveChoice(st, ch, ctx);
          r.title = E.fmt(st, ch.text, ctx);
          if (stageDef) E.log(st, x.name + ' · ' + E.fmt(st, stageDef.title, ctx) + ' → ' + r.title, 'afet');
        }
        cur.kriz = ctx.kriz || 0;
        cur.res = r; cur.phase = 'result';
        return;
      }
      if (cur.phase === 'result') {
        if (cur.opp) return E.next(st);
        cur.si++; cur.res = null;
        if (cur.si < cur.plan.length) { cur.phase = 'stage'; return; }
        return finish(st, cur, x);
      }
      E.next(st);
    }
  };

  function finish(st, cur, x) {
    var g = cur.plan.length ? grade(cur) : 'mid', am = x.aftermath || {}, ctx = { district: cur.district }, text, dl = [];
    if (g === 'good') { text = E.fmt(st, am.good, ctx) || 'Kriz karnen pekiyi.'; dl = E.apply(st, GOOD, ctx); }
    else if (g === 'bad') { text = E.fmt(st, am.bad, ctx) || 'Kriz karnen zayıf.'; dl = E.apply(st, BAD, ctx); }
    else text = cur.plan.length ? 'Kriz karnen orta: ne destan yazıldı ne skandal çıktı. Şehir yaralarını sarmaya devam ediyor; hasarı onarmayı unutma.'
      : 'Sarsıntı hafif atlatıldı. Ekipler hasarı kayda geçti; onarım listesine bir satır daha eklendi.';
    var lines = [text];
    if (cur.plan.length) lines.push('Kriz yönetimi puanın: ' + (cur.kriz > 0 ? '+' : '') + cur.kriz + ' (' + cur.plan.length + ' aşama).');
    cur.karne = { g: g, text: lines, deltas: dl };
    cur.phase = 'karne';
    E.log(st, x.name + ' kriz karnesi: ' + (g === 'good' ? 'pekiyi' : g === 'bad' ? 'zayıf' : 'orta') + '.', 'afet');
  }
})(typeof window !== 'undefined' ? window : globalThis);
