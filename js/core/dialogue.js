/* BAŞKAN — BİREBİR GÖRÜŞME MODÜLÜ (BG.dialogue + 'dialogue' sahnesi)
 *
 * BG.dialogue.make(st, { mode, district?, knock? }) → sahne | null
 *   Uygun görüşmeyi seçer (mod, koşul, yakın zamanda görülmemiş; havuz tükenince en eski görülen). Yalnız st.dlg'ye dokunur.
 * Sahne nesnesi (JSON): { t:'dialogue', id, district, mode, knock, phase:'door'|'talk'|'end', round, meter, history, last, success, deltas }
 * View.data = { kisi:{ name, age, job, emoji, groupName }, mizac, mizacName, districtName, round, rounds, history, finished, success }
 * View.meter = { label:'İkna', value, target, max:100 }
 */
(function (root) {
  'use strict';
  var BG = root.BG, E = BG.engine, S = BG.scenes = BG.scenes || {};
  var DL = BG.dialogue = {};
  var BLOF_PENALTY = 12;

  var MOOD = {
    supheci:   'Kollarını kavuşturmuş, her cümleni teraziye koyuyor. Süslü sözden çok, elle tutulur bir şey bekliyor gibi.',
    duygusal:  'Gözleri dolu dolu; derdini anlatırken sesi titriyor. Rakamdan çok, gerçekten dinlendiğini hissetmek istiyor.',
    pragmatik: 'Saatine bakıp duruyor. Lafı uzatmadan “bana ne faydası var” sorusunun cevabını arıyor.',
    ofkeli:    'Kaşları çatık, sesi yüksek. Şaka kaldıracak hâli yok; samimiyet belki buzları eritir.',
    neseli:    'Gülümseyerek karşılıyor, ortama ısınmış. İyi bir espriyi kaçırmayacak biri gibi duruyor.'
  };

  function defs() { return BG.data.dialogues || []; }
  function def(id) { return BG.byId(defs(), id); }
  function book(st) { var d = st.dlg = st.dlg || {}; if (!d.seen) d.seen = {}; if (d.count == null) d.count = 0; return d; }

  DL.make = function (st, opts) {
    opts = opts || {};
    var mode = opts.mode || st.mode || 'mayor', bk = book(st);
    var pool = defs().filter(function (x) {
      return x && x.id && x.kisi && Array.isArray(x.rounds) && x.rounds.length &&
        (x.modes || ['mayor']).indexOf(mode) >= 0 && E.check(st, x.when);
    });
    if (!pool.length) return null;
    function match(x) { return !opts.district || !x.district || x.district === opts.district; }
    var fresh = pool.filter(function (x) { return bk.seen[x.id] == null; });
    // Sıra: taze + mahalleye uyan → eski + mahalleye uyan (en eski görülen) → (mahalle istenmediyse) taze → eski.
    // Mahalle istenip ona uyan hiç görüşme yoksa null: çağıran (ör. doMission) bedeli iade eder; oyuncu başka mahalleye kaydırılmaz.
    function oldestOf(list) {
      var oldest = Math.min.apply(null, list.map(function (x) { return bk.seen[x.id]; }));
      return list.filter(function (x) { return bk.seen[x.id] === oldest; });
    }
    var pickFrom = fresh.filter(match), stale = pool.filter(function (x) { return bk.seen[x.id] != null; });
    if (!pickFrom.length && stale.filter(match).length) pickFrom = oldestOf(stale.filter(match));
    if (!pickFrom.length && opts.district) return null;
    if (!pickFrom.length) pickFrom = fresh.length ? fresh : oldestOf(stale);
    var x = E.pick(st, pickFrom);
    if (!x) return null;
    var district = x.district || (opts.district && st.districts[opts.district] ? opts.district : null) || (E.pick(st, BG.DISTRICTS) || {}).id || null;
    bk.seen[x.id] = st.totalTurns; bk.count++;
    var start = typeof x.start === 'number' ? x.start : 30;
    return { t: 'dialogue', id: x.id, district: district, mode: mode, knock: !!opts.knock, phase: opts.knock ? 'door' : 'talk',
      round: 0, meter: start, history: [], last: null, success: null, deltas: [] };
  };

  /* ───────── Yardımcılar ───────── */
  function ctxOf(cur) { return { district: cur.district }; }
  function isBluff(st, o) { return !!o.when && !E.check(st, o.when); }
  function mod(x, tone) { var m = BG.MIZAC[x.mizac]; return (m && m.mods && m.mods[tone]) || 0; }
  function kicker(cur) { return cur.knock ? 'Kapında bir vatandaş' : cur.mode === 'opposition' ? 'Kapı kapı' : 'Birebir görüşme'; }
  function target(x) { return typeof x.hedef === 'number' ? x.hedef : 65; }
  function moodLine(x, cur) {
    var t = target(x), m = cur.meter, base = MOOD[x.mizac] || 'Seni dikkatle dinliyor.';
    if (cur.round === 0) return base;
    if (m >= t) return 'Yüzü yumuşadı; artık başını sallayarak dinliyor.';
    if (m >= t - 15) return 'Biraz ısındı ama henüz ikna olmuş değil. ' + base;
    if (m < 25) return 'Gittikçe soğuyor; kapı her an kapanabilir. ' + base;
    return base;
  }

  S.dialogue = {
    view: function (st, cur) {
      var x = def(cur.id), ctx = ctxOf(cur), dn = E.district(cur.district);
      if (!x) return { type: 'dialogue', kicker: kicker(cur), title: 'Görüşme iptal', text: 'Randevu son anda iptal oldu.', options: [{ id: 'ok', label: 'Devam' }] };
      var k = x.kisi, rounds = x.rounds.length, finished = cur.phase === 'end';
      var hist = cur.history.slice(), rd = x.rounds[Math.min(cur.round, rounds - 1)];
      if (cur.phase === 'talk' && rd) hist.push({ who: 'them', text: E.fmt(st, rd.line, ctx) });
      var v = { type: 'dialogue', kicker: kicker(cur), title: k.name, district: cur.district,
        speaker: { name: k.name, role: k.job + ', ' + k.age, emoji: k.emoji },
        meter: { label: 'İkna', value: Math.round(cur.meter), target: target(x), max: 100 },
        data: { kisi: { name: k.name, age: k.age, job: k.job, emoji: k.emoji, groupName: BG.label(k.group).name },
          mizac: x.mizac, mizacName: (BG.MIZAC[x.mizac] || {}).name || '', districtName: dn ? dn.name : '',
          round: Math.min(cur.round + 1, rounds), rounds: rounds, history: hist, finished: finished, success: finished ? !!cur.success : null },
        options: [] };
      if (cur.phase === 'door') {
        v.text = [k.emoji + ' ' + k.name + ' (' + k.job + ') makam odasının kapısında bekliyor. Sekreter “Randevusu yok ama çok ısrar etti” diyor.', E.fmt(st, x.intro, ctx)];
        v.options = [{ id: 'kabul', label: 'Buyursun, içeri alın', emoji: '🤝', hint: 'Birebir görüşme başlar' },
          { id: 'ret', label: 'Bugün vaktim yok', emoji: '🚪', hint: 'İtibar −1', fx: E.preview({ itibar: -1 }) }];
        return v;
      }
      if (finished) {
        v.text = [cur.last && cur.last.note, E.fmt(st, ((cur.success ? x.success : x.fail) || {}).text, ctx)].filter(Boolean);
        v.tone = cur.success ? 'good' : 'danger';
        v.deltas = cur.deltas;
        v.options = [{ id: 'ok', label: 'Devam' }];
        return v;
      }
      var txt = [];
      if (cur.round === 0) txt.push(E.fmt(st, x.intro, ctx));
      if (cur.last && cur.last.note) txt.push(cur.last.note);
      txt.push(moodLine(x, cur));
      v.text = txt;
      if (cur.last && cur.last.deltas && cur.last.deltas.length) v.deltas = cur.last.deltas;
      v.options = (rd.options || []).map(function (o, i) {
        var bl = isBluff(st, o);
        return { id: String(i), label: E.fmt(st, o.text, ctx), tag: BG.TONES[o.tone] || '', risk: bl,
          hint: bl ? 'Blöf: bu iddia şu an doğru değil — yakalanırsan ikna ve itibar kaybedersin' : '' };
      });
      return v;
    },
    act: function (st, cur, id) {
      var x = def(cur.id), ctx = ctxOf(cur);
      if (!x || cur.phase === 'end') return E.next(st);
      if (cur.phase === 'door') {
        if (id === 'ret') {
          var dl = E.apply(st, { itibar: -1 }, ctx);
          E.flash(st, x.kisi.name + ' kırgın bir şekilde ayrıldı. “Başkan bizi dinlemiyor” lafı mahallede dolaşmaya başladı bile.', dl);
          E.log(st, x.kisi.name + ' kapıdan geri çevrildi.', 'gorusme');
          return E.next(st);
        }
        if (id === 'kabul') cur.phase = 'talk';
        return;
      }
      var rd = x.rounds[cur.round], o = rd && rd.options && rd.options[+id];
      if (!o) return;
      var bl = isBluff(st, o), caught = bl && E.rand(st) < 0.5, gain, deltas = [], reply;
      cur.history.push({ who: 'them', text: E.fmt(st, rd.line, ctx) });
      cur.history.push({ who: 'you', text: E.fmt(st, o.text, ctx) });
      if (caught) {
        gain = -BLOF_PENALTY;
        deltas = E.apply(st, { itibar: -2 }, ctx);
        reply = o.replyBlof || o.reply;
      } else {
        gain = (o.ikna || 0) + mod(x, o.tone);
        reply = o.reply;
      }
      var before = cur.meter;
      cur.meter = BG.clamp(cur.meter + gain, 0, 100);
      var diff = Math.round(cur.meter - before);
      if (reply) cur.history.push({ who: 'them', text: E.fmt(st, reply, ctx) });
      cur.last = { note: caught ? 'Blöfün yakalandı! İkna ' + diff + '.' : (bl ? 'Blöfün tuttu, kimse fark etmedi. ' : '') + 'İkna ' + (diff >= 0 ? '+' : '') + diff + '.', deltas: deltas };
      cur.round++;
      if (cur.round < x.rounds.length) return;
      cur.success = cur.meter >= target(x);
      var res = cur.success ? x.success : x.fail;
      cur.deltas = E.mergeDeltas(deltas.concat(E.apply(st, (res || {}).effects, ctx)));
      cur.phase = 'end';
      E.log(st, x.kisi.name + ' ile görüşme: ' + (cur.success ? 'ikna oldu.' : 'ikna olmadı.'), 'gorusme');
      if (cur.success) st.score += 5;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
