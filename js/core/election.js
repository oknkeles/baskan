/* BAŞKAN — SEÇİM MODÜLÜ (BG.election)
 *  hubOptions / hubAct : kampanya dönemi (son C.CAMPAIGN_TURNS mevsim) eylemleri — iki modda da çalışır
 *                        (başkanken bütçe, muhalefetteyken fon/gönüllü harcanır)
 *  checkPromises       : vadesi gelen seçim vaatlerini sonuçlandırır
 *  begin               : electionIntro → electionNight → electionResult sahnelerini kuyruğa ekler
 * Sahneler: electionIntro, electionNight, electionResult, vaat, tartisma, kampanyaAnket
 * Modül durumu st.el içinde (yalnız JSON): { c: { term, rally:{}, promised, debate, afis, anket, offer?:{ n, ids } }, last: { won, player, rival, other, margin, mode } }
 */
(function (root) {
  'use strict';
  var BG = root.BG, C = BG.C, clamp = BG.clamp, E = BG.engine, S = BG.scenes = BG.scenes || {};
  var EL = BG.election = {};
  var K_MIN = -6, MAX_PROMISES = 2;   // kampanya rüzgârının üst sınırı: C.CAMPAIGN_MAX

  /* ───────── Yardımcılar ───────── */
  function r1(x) { return Math.round(x * 10) / 10; }
  function pct(x) { return '%' + r1(x).toFixed(1); }
  function signed(x) { x = r1(x); return (x > 0 ? '+' : '') + x.toFixed(1); }
  function isMayor(st) { return st.mode !== 'opposition'; }
  function inCampaign(st) { return E.turnsLeft(st) < C.CAMPAIGN_TURNS; }
  /** Başkanlığın son seçimi mi? (Sonrasında oyun biter; vaatlerin hesabı hiç sorulamaz.) */
  function lastTerm(st) { return isMayor(st) && st.termsServed + 1 >= C.TERMS_TO_WIN; }
  /** Bu kampanyanın kayıtları. write=false iken durumu değiştirmez (view için). */
  function camp(st, write) {
    var e = st.el || {}, c = e.c && e.c.term === st.term ? e.c : null;
    if (!c) c = { term: st.term, rally: {}, promised: 0, debate: false, afis: 0, anket: -1 };
    if (c.rally == null) c.rally = {};
    if (write) { st.el = e; e.c = c; }
    return c;
  }
  /** Para maliyeti: başkanken bütçe, muhalefetteyken fon. */
  function money(st, mayorCost, oppCost) { var o = {}; if (isMayor(st)) o.butce = mayorCost; else o.fon = oppCost; return o; }
  /** st.kampanya'ya ekler; toplamı K_MIN..C.CAMPAIGN_MAX içinde tutar (dışarıdan aşılmışsa daha da uzaklaştırmaz). → rozet listesi */
  function addK(st, d) {
    var before = st.kampanya || 0, after = before + d;
    if (d > 0) after = Math.min(after, Math.max(before, C.CAMPAIGN_MAX));
    else after = Math.max(after, Math.min(before, K_MIN));
    st.kampanya = r1(after);
    var real = r1(st.kampanya - before);
    return real ? [{ key: 'kampanya', label: 'Kampanya rüzgârı', emoji: '📣', delta: real }] : [];
  }
  function promiseDef(id) { return BG.byId(BG.data.promises || [], id); }
  function availablePromises(st) {
    var have = {};
    (st.promises || []).forEach(function (p) { have[p.id] = true; });
    return (BG.data.promises || []).filter(function (p) { return !have[p.id] && E.check(st, p.when); });
  }
  function rivalSpeaker(st) {
    var rd = E.rivalDef(st);
    return { name: rd.name, role: isMayor(st) ? rd.title : 'Belediye Başkanı', emoji: rd.emoji };
  }
  function previewText(eff) {
    return E.preview(eff).map(function (d) { return d.emoji + (d.delta > 0 ? '+' : '') + d.delta; }).join(' ');
  }

  /* ───────── Hub seçenekleri ───────── */
  EL.hubOptions = function (st) {
    if (!inCampaign(st)) return null;
    var c = camp(st, false), mayor = isMayor(st), noAp = st.ap < 1, opts = [];
    function lock(o, cost, needAp) {
      if (needAp !== false && noAp) { o.disabled = true; o.why = 'Bu mevsimlik mesain bitti'; }
      else if (cost && !E.canPay(st, cost)) { o.disabled = true; o.why = mayor ? 'Bütçe yetersiz' : 'Kampanya fonu yetersiz'; }
      return o;
    }
    var rallied = Object.keys(c.rally).length;
    opts.push(lock({ id: 'kampanya_miting', emoji: '📣', label: 'Miting düzenle', tag: 'Kampanya',
      hint: 'Seçtiğin mahallede meydan senin. Aynı mahallede tekrarlanan miting giderek daha az etkiler.' + (rallied ? ' (' + rallied + ' mahallede miting yapıldı)' : ''),
      cost: '1 ⚡ · ' + E.costText(money(st, 10, 8)), pick: 'district' }, money(st, 10, 8)));

    var avail = availablePromises(st), vaat = { id: 'kampanya_vaat', emoji: '🤝', label: 'Seçim vaadi ver', tag: 'Kampanya',
      hint: 'Bugün oy getirir; tutamazsan sonra faturası ağır olur. (' + c.promised + '/' + MAX_PROMISES + ' söz verildi)', cost: '1 ⚡' };
    if (lastTerm(st)) { vaat.disabled = true; vaat.why = 'Son dönemindesin: hesabını veremeyeceğin söz verilmez'; }
    else if (c.promised >= MAX_PROMISES) { vaat.disabled = true; vaat.why = 'Bu kampanyada yeterince söz verdin'; }
    else if (!avail.length) { vaat.disabled = true; vaat.why = 'Verilecek yeni söz kalmadı'; }
    else lock(vaat);
    opts.push(vaat);

    var tv = { id: 'kampanya_tartisma', emoji: '📺', label: 'Canlı yayında TV tartışması', tag: 'Kampanya', risk: true,
      hint: 'Rakibinle stüdyoda karşı karşıya. Tek şans: parlarsan rüzgâr senden yana eser.', cost: '1 ⚡' };
    if (c.debate) { tv.disabled = true; tv.why = 'Bu kampanyada tartışmaya zaten çıktın'; } else lock(tv);
    opts.push(tv);

    opts.push(lock({ id: 'kampanya_afis', emoji: '🪧', label: mayor ? 'Afiş ve sosyal medya kampanyası' : 'Gönüllülerle afiş ve sosyal medya',
      tag: 'Kampanya', hint: 'Şehri yüzünle donat, videoların telefon telefon dolaşsın.' + (!mayor ? ' Gönüllün çoksa etkisi artar.' : ''),
      cost: '1 ⚡ · ' + E.costText(money(st, 25, 15)) }, money(st, 25, 15)));

    var an = { id: 'kampanya_anket', emoji: '📊', label: 'Anket yaptır', tag: 'Kampanya', hint: 'Mahalle mahalle son durumu gör. Mesai harcamaz.',
      cost: E.costText(money(st, 5, 4)) };
    if (c.anket === st.totalTurns) { an.disabled = true; an.why = 'Bu mevsimin anketi masanda'; } else lock(an, money(st, 5, 4), false);
    opts.push(an);

    return { id: 'kampanya', title: 'Seçim Kampanyası', emoji: '📣', options: opts };
  };

  /* ───────── Hub eylemleri ───────── */
  var RALLY_LINES = [
    '{mahalle} meydanında kürsüye çıktın. Ses sistemi iki kez cızırdadı ama kalabalık sloganı ezberledi.',
    '{mahalle} mitinginde pilav dağıtıldı; kuyruğu görenler mitingi pilav günü sandı. Yine de alkış alkıştır.',
    'Kürsüye çıktığın an martılar da alkışa katıldı. {mahalle} bu mitingi uzun süre konuşacak.',
    'Halay çekildi, seçim şarkısı çalındı, teyzeler balkondan bayrak salladı. {mahalle} coştu.',
    '{mahalle}’de bir minibüsün tavanından konuştun. Şoför kornayla eşlik etti, kalabalık güldü.',
    '{mahalle} çay ocağının önünde kurulan kürsüde konuştun. Çaycı o gün rekor kırdı.'
  ];
  var AFIS_MAYOR = [
    'Şehir afişlerle donandı: gülümseyen yüzün duraklarda, minibüs camlarında, hatta bir halı saha kalesinin arkasında.',
    'Kampanya videon “Başkan çay ocağında” bir günde yarım milyon izlendi. Yorumların yarısı çay bardağını soruyor.',
    'Belediye icraatlarını anlatan reklam filmi yayında. Martılı sahil sahnesi herkesin dilinde.'
  ];
  var AFIS_OPP = [
    'Gönüllülerin gece boyunca afiş astı; sabah {sehir} senin yüzünle uyandı. Birkaç afişin üstüne kedi yatmış, o kadar.',
    'Telefonla çekilmiş samimi kampanya videon beklenmedik şekilde patladı. “Bütçesiz ama içten” yorumları yağıyor.',
    'Bisikletli gönüllüler el ilanlarını pazar yerinde dağıttı. Domatesçi bile bir tane alıp tezgâhına astı.'
  ];

  EL.hubAct = function (st, optId, payload) {
    payload = payload || {};
    if (!inCampaign(st)) return E.flash(st, 'Kampanya dönemi henüz başlamadı.');
    var c = camp(st, true), mayor = isMayor(st), cost, dl, txt, ctx;

    if (optId === 'kampanya_anket') {
      cost = money(st, 5, 4);
      if (c.anket === st.totalTurns) return E.flash(st, 'Bu mevsimin anketi zaten masanda.');
      if (!E.canPay(st, cost)) return E.flash(st, 'Anket şirketi ' + E.costText(cost) + ' istiyor; kasa yetmiyor.');
      E.pay(st, cost); c.anket = st.totalTurns;
      var p = E.poll(st), rows = BG.DISTRICTS.map(function (d) {
        var b = p.byDistrict[d.id], n = (E.rand(st) * 2 - 1) * 1.5;
        return { id: d.id, player: r1(b.player + n), rival: r1(b.rival - n) };
      });
      return E.interrupt(st, { t: 'kampanyaAnket', rows: rows, player: r1(p.player), rival: r1(p.rival), other: r1(p.other) });
    }

    if (st.ap < 1) return E.flash(st, 'Bu mevsimlik mesain bitti.');

    if (optId === 'kampanya_miting') {
      var dist = payload.district && st.districts[payload.district] ? payload.district : null;
      if (!dist) return E.flash(st, 'Miting için bir mahalle seç.');
      cost = money(st, 10, 8);
      if (!E.canPay(st, cost)) return E.flash(st, 'Miting için ' + E.costText(cost) + ' gerekiyor; kasa yetmiyor.');
      var n = c.rally[dist] || 0, gain = n === 0 ? 4 : n === 1 ? 2 : 1, k = n === 0 ? 0.5 : 0, roll = E.rand(st), extra = '';
      ctx = { district: dist };
      if (n === 0) txt = E.pick(st, RALLY_LINES);
      else if (n === 1) txt = '{mahalle} seni ikinci kez dinledi; ön sıradakiler konuşmanı kelimesi kelimesine tekrarlıyor.';
      else txt = '{mahalle}’de aynı konuşmayı bir kez daha yaptın. Kalabalık seyreldi, simitçi bile tezgâhını topladı.';
      if (roll < 0.12) { gain = Math.max(1, Math.floor(gain / 2)); extra = ' Ama sağanak bastırdı; şemsiyeler açıldı, kalabalık yarıya indi.'; }
      else if (roll > 0.9) { gain += 1; extra = ' Üstelik mahallenin halı saha takımı formalarıyla geldi; kalabalık beklenenden kalabalık!'; }
      dl = E.pay(st, cost).concat(E.apply(st, { mahalle: gain }, ctx), addK(st, k));
      c.rally[dist] = n + 1; st.ap--;
      E.log(st, E.district(dist).name + ' mitingi yapıldı.', 'kampanya');
      return E.flash(st, '📣 ' + E.fmt(st, txt, ctx) + extra, E.mergeDeltas(dl));
    }

    if (optId === 'kampanya_afis') {
      cost = money(st, 25, 15);
      if (!E.canPay(st, cost)) return E.flash(st, 'Afiş ve reklam için ' + E.costText(cost) + ' gerekiyor; kasa yetmiyor.');
      var kg = c.afis === 0 ? 1 : 0.5;
      if (!mayor && (st.res.gonullu || 0) >= 4) kg += 0.5;
      dl = E.pay(st, cost).concat(addK(st, kg));
      c.afis++; st.ap--;
      txt = E.fmt(st, E.pick(st, mayor ? AFIS_MAYOR : AFIS_OPP));
      if (c.afis > 2) txt += ' Ama şehir artık afişe doymuş; etkisi eskisi kadar değil.';
      return E.flash(st, '🪧 ' + txt, E.mergeDeltas(dl));
    }

    if (optId === 'kampanya_vaat') {
      if (lastTerm(st)) return E.flash(st, 'Son dönemindesin: hesabını veremeyeceğin söz verilmez.');
      if (c.promised >= MAX_PROMISES) return E.flash(st, 'Bu kampanyada yeterince söz verdin; fazlası inandırıcı olmaz.');
      var avail = availablePromises(st), offer = [];
      // Teklif mevsim başına bir kez çekilir; kürsüden inip yeniden çıkmak listeyi yenilemez.
      if (c.offer && c.offer.n === st.totalTurns) offer = c.offer.ids.filter(function (id) { return avail.some(function (p) { return p.id === id; }); });
      else {
        while (avail.length && offer.length < 3) { var pk = E.pick(st, avail); offer.push(pk.id); avail.splice(avail.indexOf(pk), 1); }
        c.offer = { n: st.totalTurns, ids: offer.slice() };
      }
      if (!offer.length) return E.flash(st, 'Verilecek yeni söz kalmadı.');
      return E.interrupt(st, { t: 'vaat', offer: offer });
    }

    if (optId === 'kampanya_tartisma') {
      if (c.debate) return E.flash(st, 'Bu kampanyada tartışmaya zaten çıktın.');
      var rd = E.rivalDef(st);
      c.debate = true; st.ap--;
      return E.interrupt(st, { t: 'tartisma', taunt: E.pick(st, rd.taunts || []) || 'Bu şehir daha iyisini hak ediyor!', res: null });
    }
    E.flash(st, 'Bu kampanya hamlesini tanımıyorum.');
  };

  /* ───────── Vaatlerin hesabı ───────── */
  EL.checkPromises = function (st) {
    var lines = [], keep = [];
    (st.promises || []).forEach(function (pr) {
      if (!pr || pr.due > st.totalTurns) { if (pr) keep.push(pr); return; }
      var def = promiseDef(pr.id);
      if (!def) return;
      var ok = E.check(st, def.kosul), dl = E.apply(st, ok ? def.tut : def.boz);
      lines.push({ emoji: ok ? '🤝' : '💔', title: ok ? 'Söz tutuldu' : 'Söz tutulmadı',
        text: E.fmt(st, def.text) + ' — ' + E.fmt(st, ok ? def.tutText : def.bozText), deltas: dl });
      E.log(st, ok ? 'Seçim vaadi tutuldu.' : 'Seçim vaadi tutulmadı.', 'vaat');
      if (ok) st.score += 10;
    });
    st.promises = keep;
    return lines;
  };

  /* ───────── Seçim akışı ───────── */
  EL.begin = function (st) {
    var rd = E.rivalDef(st), e = st.el = st.el || {};
    e.last = null;
    st.queue.push({ t: 'electionIntro', taunt: E.pick(st, rd.taunts || []) || rd.slogan || '' });
    st.queue.push({ t: 'electionNight', res: null, counted: 0 });
    st.queue.push({ t: 'electionResult' });
  };

  /* ───────── Sahne: kampanya anketi ───────── */
  S.kampanyaAnket = {
    view: function (st, cur) {
      var rd = E.rivalDef(st), lead = cur.player - cur.rival, rows = cur.rows || [];
      var best = null, worst = null;
      rows.forEach(function (r) { if (!best || r.player - r.rival > best.player - best.rival) best = r; if (!worst || r.player - r.rival < worst.player - worst.rival) worst = r; });
      var text = ['Anket şirketi bin kişiyle görüştü (hata payı ±2; sandık günü kararsızlar birkaç puanı oynatabilir). Şehir genelinde sen ' + pct(cur.player) + ', ' + rd.name + ' ' + pct(cur.rival) + '.',
        lead > 5 ? 'Rahat görünüyorsun ama anket sandık değil; rehavete kapılma.' : lead > 0 ? 'Öndesin ama fark ince. Her mahalle önemli.' : lead > -5 ? 'Başa baş bir yarış: birkaç mahalle sonucu belirleyecek.' : 'Geridesin. Sokağa çıkma, söz verme, ikna etme zamanı.'];
      if (best && worst && best !== worst) text.push('En güçlü olduğun yer ' + E.district(best.id).name + ', en zorlandığın yer ' + E.district(worst.id).name + '.');
      return { type: 'msg', kicker: 'Kamuoyu araştırması', title: 'Mahalle Mahalle Anket', tone: 'election', text: text,
        bars: rows.map(function (r) { var d = E.district(r.id); return { label: d.name + ' (rakip ' + pct(r.rival) + ')', value: r.player, max: 100, emoji: d.emoji }; }),
        list: rows.map(function (r) { var d = E.district(r.id); return { emoji: d.emoji, title: d.name, text: 'Sen ' + pct(r.player) + ' · ' + rd.name + ' ' + pct(r.rival) + ' · fark ' + signed(r.player - r.rival) }; }),
        data: { rows: rows, player: cur.player, rival: cur.rival, other: cur.other },
        options: [{ id: 'ok', label: 'Makama dön' }] };
    },
    act: function (st) { E.next(st); }
  };

  /* ───────── Sahne: seçim vaadi ───────── */
  S.vaat = {
    view: function (st, cur) {
      var c = camp(st, false), opts = [];
      (cur.offer || []).forEach(function (id) {
        var d = promiseDef(id);
        if (!d) return;
        var o = { id: 'p:' + id, emoji: d.emoji, label: E.fmt(st, d.text), fx: E.preview(d.boost), cost: '1 ⚡',
          hint: '⏳ Seçimden ' + d.sure + ' mevsim sonra hesabı sorulur. Tutmazsan: ' + (previewText(d.boz) || 'itibarın sarsılır') };
        if (st.ap < 1) { o.disabled = true; o.why = 'Bu mevsimlik mesain bitti'; }
        else if (c.promised >= MAX_PROMISES) { o.disabled = true; o.why = 'Bu kampanyada yeterince söz verdin'; }
        opts.push(o);
      });
      opts.push({ id: 'vazgec', label: 'Vazgeç, söz vermeden in', hint: 'Mesai harcanmaz' });
      return { type: 'vaat', kicker: 'Seçim kampanyası', title: 'Kürsüde Söz Vakti', tone: 'election',
        text: ['Mikrofon elinde, kalabalık bir söz bekliyor. Pankartlar havada, çay ocağından bile ses kesildi.',
          'Unutma: verilen söz bugün oy getirir, tutulmayan söz yarın sandıkta değil kahvehanede konuşulur. (' + c.promised + '/' + MAX_PROMISES + ' söz)'],
        options: opts };
    },
    act: function (st, cur, id) {
      if (id.indexOf('p:') !== 0) return E.next(st);
      var pid = id.slice(2), d = promiseDef(pid), c = camp(st, true);
      if (!d || (cur.offer || []).indexOf(pid) < 0) return;
      if (st.ap < 1 || c.promised >= MAX_PROMISES) return;
      if ((st.promises || []).some(function (p) { return p.id === pid; })) return E.next(st);
      st.ap--; c.promised++;
      st.promises = st.promises || [];
      st.promises.push({ id: pid, due: st.totalTurns + E.turnsLeft(st) + d.sure });
      var dl = E.apply(st, d.boost);
      E.log(st, 'Söz verdin: ' + E.fmt(st, d.text), 'vaat');
      E.flash(st, d.emoji + ' Sözün manşetlerde: ' + E.fmt(st, d.text) + ' Seçimden ' + d.sure + ' mevsim sonra hesabı sorulacak.', dl);
      E.next(st);
    }
  };

  /* ───────── Sahne: TV tartışması ───────── */
  var STYLES = {
    veri: { label: 'Rakamlarla cevap ver', emoji: '📊', hint: 'İtibarın yüksekse rakamlarına inanırlar', base: 0.48, it: 0.012,
      win: { k: 1.5, eff: { itibar: 3, rakip: -2 } }, draw: { k: 0.5, eff: { itibar: 1 } }, lose: { k: -0.5, eff: { itibar: -2, rakip: 1 } },
      text: { win: 'Cebinden çıkardığın grafikle {rakip} donakaldı. Moderatör “Bu rakamlar doğru mu?” diye sordu; doğruydu. Kesit gece boyunca paylaşıldı.',
        draw: 'Rakamlar doğruydu ama biraz fazlaydı. İzleyicilerin yarısı ikna oldu, diğer yarısı yemek kanalına geçti.',
        lose: 'Bir yüzdeyi yanlış okudun; {rakip} anında yakaladı. “Hesap makinesi bozuk” etiketi sabaha kadar gündemde kaldı.' } },
    espri: { label: 'Espriyle tiye al', emoji: '😄', hint: 'Tutarsa gençler bayılır, tutmazsa stüdyoda sessizlik', base: 0.5, it: 0.006,
      win: { k: 2, eff: { genc: 3, rakip: -2 } }, draw: { k: 0.5, eff: {} }, lose: { k: -1, eff: { itibar: -2, rakip: 1 } },
      text: { win: 'Tek cümlelik esprin stüdyoyu kahkahaya boğdu; {rakip} bile gülmemek için dudağını ısırdı. Gençler kesiti “efsane” diye paylaşıyor.',
        draw: 'Espri yarım güldürdü. Moderatör konuyu değiştirdi; kimse kazanmadı, kimse kaybetmedi.',
        lose: 'Espri yere düştü, stüdyoda cırcır böceği sesi duyuldu. {rakip} “Şehir şaka değil” diyerek puanı topladı.' } },
    sert: { label: 'Sert karşılık ver', emoji: '🔥', hint: 'Yüksek risk, yüksek ödül', base: 0.38, it: 0.008,
      win: { k: 2.5, eff: { itibar: 1, rakip: -3 } }, draw: { k: 0, eff: { itibar: -1 } }, lose: { k: -1.5, eff: { itibar: -3, rakip: 2 } },
      text: { win: 'Masaya vurdun, dosyaları tek tek saydın. {rakip} terledi, kravatını gevşetti. Kahvehanelerde “Bu sefer köşeye sıkıştırdı” deniyor.',
        draw: 'Ortam gerildi, iki taraf da birbirinin sözünü kesti. Moderatör reklama girmek zorunda kaldı; seyirci kararsız.',
        lose: 'Sesini fazla yükselttin; moderatör iki kez uyardı. Ertesi günün manşeti: “Canlı yayında sinirler koptu.”' } }
  };
  var STYLE_IDS = ['veri', 'espri', 'sert'];
  var OUT_TITLE = { win: 'Tartışmanın galibi sensin!', draw: 'Berabere bitti', lose: 'Stüdyodan yara alarak çıktın' };

  S.tartisma = {
    view: function (st, cur) {
      var rd = E.rivalDef(st), mayor = isMayor(st);
      if (cur.res) {
        return { type: 'tartisma', kicker: '📺 Canlı yayın · Şehrin Nabzı', title: OUT_TITLE[cur.res.out] || 'Yayın bitti',
          tone: cur.res.out === 'win' ? 'good' : cur.res.out === 'lose' ? 'danger' : 'normal',
          text: cur.res.text, deltas: cur.res.deltas, data: { style: cur.res.style, out: cur.res.out },
          options: [{ id: 'ok', label: 'Stüdyodan çık' }] };
      }
      return { type: 'tartisma', kicker: '📺 Canlı yayın · Şehrin Nabzı', title: 'Büyük Tartışma', tone: 'election', speaker: rivalSpeaker(st),
        text: [mayor ? 'Stüdyo ışıkları yandı. Moderatör kartlarını düzeltti: “Sayın Başkan, rakibiniz sözü ilk o almak istedi.”'
            : 'Stüdyo ışıkları yandı. Karşında koltuğu bırakmaya hiç niyeti olmayan Başkan ' + rd.name + ' oturuyor. İlk sözü o aldı.',
          '“' + E.fmt(st, cur.taunt) + '”', 'Bütün şehir ekran başında. Nasıl karşılık vereceksin?'],
        options: STYLE_IDS.map(function (id) { var s = STYLES[id]; return { id: id, emoji: s.emoji, label: s.label, hint: s.hint, risk: true }; }),
        data: { taunt: cur.taunt } };
    },
    act: function (st, cur, id) {
      if (cur.res) return E.next(st);
      var s = STYLES[id];
      if (!s) return;
      var p = clamp(s.base + (st.res.itibar - 50) * s.it, 0.15, 0.85), r = E.rand(st);
      var out = r < p ? 'win' : r < p + 0.2 ? 'draw' : 'lose', o = s[out];
      var dl = E.apply(st, o.eff).concat(addK(st, o.k));
      cur.res = { style: id, out: out, text: E.fmt(st, s.text[out]), deltas: E.mergeDeltas(dl) };
      E.log(st, 'TV tartışması: ' + (out === 'win' ? 'kazandın' : out === 'draw' ? 'berabere' : 'kaybettin') + '.', 'kampanya');
    }
  };

  /* ───────── Sahne: seçim sabahı ───────── */
  S.electionIntro = {
    view: function (st, cur) {
      var rd = E.rivalDef(st), p = E.poll(st), mayor = isMayor(st), lead = p.player - p.rival, k = st.kampanya || 0, text = [];
      text.push('Sandık günü! ' + st.city.name + ' sokaklarında seçim otobüsleri son turunu atıyor; okulların önünde sabahın köründe kuyruk var, simitçiler bugün çifte mesaide.');
      if (mayor) text.push('Koltuğunu savunuyorsun. Karşında ' + rd.emoji + ' ' + rd.name + ' (' + rd.title + '): “' + rd.slogan + '”');
      else text.push('Başkan ' + rd.emoji + ' ' + rd.name + ' koltuğu bırakmaya niyetli değil. Sen ise sokaklardan topladığın sesi sandığa taşımaya geldin.');
      text.push('Son anket: sen ' + pct(p.player) + ' — ' + rd.name + ' ' + pct(p.rival) + ' (fark ' + signed(lead) + ' puan).' + (k ? ' Kampanya rüzgârı: ' + signed(k) + '.' : ''));
      text.push(lead > 6 ? 'Rüzgâr arkanda; ama sandık sürprizlerini herkes bilir.' : lead > 0 ? 'Öndesin ama fark hata payı sınırında. Gece uzun olabilir.'
        : lead > -6 ? 'Geride görünüyorsun ama fark kapanabilir. Sandık her şeyi söyler.' : 'Anketler acımasız. Mucize için bütün sandıkların açılmasını bekleyeceksin.');
      if (cur.taunt) text.push(rd.name + ' oy kullanırken kameralara döndü: “' + E.fmt(st, cur.taunt) + '”');
      var list = (st.promises || []).map(function (pr) {
        var d = promiseDef(pr.id);
        return d ? { emoji: d.emoji, title: 'Verilen söz', text: E.fmt(st, d.text) + ' — hesabı ' + Math.max(0, pr.due - st.totalTurns) + ' mevsim sonra' } : null;
      }).filter(Boolean);
      return { type: 'electionIntro', kicker: '🗳️ Seçim günü · ' + st.term + '. döngü', tone: 'election',
        title: mayor ? 'Koltuğunu Savun' : 'Koltuğu Geri Al', text: text, speaker: rivalSpeaker(st), list: list,
        bars: [{ label: st.player.name, value: r1(p.player), max: 100, emoji: '🙋' }, { label: rd.name, value: r1(p.rival), max: 100, emoji: rd.emoji },
          { label: 'Diğer adaylar', value: r1(p.other), max: 100, emoji: '🗳️' }],
        data: { mode: st.mode, playerName: st.player.name, rival: { id: rd.id, name: rd.name, title: rd.title, emoji: rd.emoji, slogan: rd.slogan, strength: st.rival ? st.rival.strength : 0 },
          poll: { player: r1(p.player), rival: r1(p.rival), other: r1(p.other), lead: r1(lead) }, kampanya: k, taunt: cur.taunt },
        options: [{ id: 'go', label: 'Sandıklar açılsın 🗳️' }] };
    },
    act: function (st) { E.next(st); }
  };

  /* ───────── Sahne: seçim gecesi ───────── */
  function revealOrder() {
    return BG.DISTRICTS.map(function (d, i) { return { id: d.id, pop: d.pop, i: i }; })
      .sort(function (a, b) { return a.pop - b.pop || a.i - b.i; }).map(function (x) { return x.id; });
  }
  function nightOrder(cur) { return cur.order && cur.order.length ? cur.order : revealOrder(); }
  function running(cur, upto) {
    var order = nightOrder(cur), t = { player: 0, rival: 0, other: 0 }, pop = 0, i;
    for (i = 0; i < Math.min(upto, order.length); i++) {
      var d = E.district(order[i]), v = cur.res && cur.res[order[i]];
      if (!d || !v) continue;
      t.player += v.player * d.pop; t.rival += v.rival * d.pop; t.other += v.other * d.pop; pop += d.pop;
    }
    if (pop) { t.player /= pop; t.rival /= pop; t.other /= pop; }
    return t;
  }
  function decide(st, t) { return t.player > t.rival ? true : t.player < t.rival ? false : isMayor(st); }

  S.electionNight = {
    view: function (st, cur) {
      var rd = E.rivalDef(st), order = nightOrder(cur), of = order.length, counted = Math.min(cur.counted || 0, of);
      var done = !!cur.res && counted >= of, tot = running(cur, counted), prev = running(cur, counted - 1);
      var won = done ? decide(st, tot) : null, text = [], lead = tot.player - tot.rival, prevLead = prev.player - prev.rival;
      var districts = order.map(function (id, i) {
        var d = E.district(id), v = cur.res && i < counted ? cur.res[id] : null;
        return { id: id, name: d.name, emoji: d.emoji, pop: d.pop, player: v ? v.player : 0, rival: v ? v.rival : 0, other: v ? v.other : 0, counted: !!v };
      });
      if (!counted) {
        text.push('Sandıklar kapandı. ' + st.city.name + ' nefesini tuttu; televizyonlarda haritalar, çay ocaklarında tahminler.');
        text.push('İlk sonuçlar en küçük mahalleden gelecek, en kalabalık mahalle en sona kaldı.');
      } else {
        var last = districts[counted - 1], lw = last.player >= last.rival;
        text.push(last.emoji + ' ' + last.name + ' sayıldı: sen ' + pct(last.player) + ' — ' + rd.name + ' ' + pct(last.rival) + (lw ? '. Bu mahalle senin!' : '. Bu mahalle rakibe gitti.'));
        if (done) text.push(won ? 'Son sandık da açıldı ve tablo netleşti: sandıktan sen çıktın! Telefonun susmuyor.'
          : 'Son sandık da açıldı. Tablo net: bu gece ' + rd.name + ' kazandı.');
        else if (counted === 1) text.push('İlk sonuçlar geldi. Henüz çok erken; spikerler “temkinli olalım” diyor.');
        else if ((lead > 0) !== (prevLead > 0) && Math.abs(lead) > 0.05) text.push(lead > 0 ? 'Liderlik el değiştirdi! Artık öndesin; seçim merkezinde alkış koptu.' : 'Liderlik el değiştirdi! ' + rd.name + ' öne geçti; seçim merkezinde sessizlik.');
        else if (counted === of - 1) text.push('Geriye tek mahalle kaldı: ' + districts[of - 1].emoji + ' ' + districts[of - 1].name + '. Kimse bardağını bırakamıyor.');
        else if (Math.abs(lead) < 2) text.push('Başa baş! Fark birkaç bin oy. Çay ocağında kimse bardağını bırakamıyor.');
        else if (lead >= 8) text.push('Fark açılıyor; parti binasının önünde davul zurna hazırlanıyor.');
        else if (lead <= -8) text.push('Rakip kampında kornalar çalmaya başladı. Hâlâ sayılacak sandık var ama iş zor.');
        else if (lead > 0) text.push('Öndesin ama fark kapanabilir. Sayım sürüyor.');
        else text.push(rd.name + ' önde ama fark kapanabilir. Sayım sürüyor.');
      }
      var label = !counted ? 'Sayımı başlat' : done ? 'Sonucu gör' : counted === of - 1 ? 'Son sandık: ' + districts[of - 1].name : 'Sıradaki mahalle ▶';
      return { type: 'electionNight', kicker: '🗳️ Seçim gecesi · ' + counted + '/' + of + ' mahalle sayıldı', tone: 'election',
        title: done ? (won ? 'Kazandın!' : 'Kaybettin') : 'Sandıklar Açılıyor', text: text,
        bars: [{ label: st.player.name, value: r1(tot.player), max: 100, emoji: '🙋' }, { label: rd.name, value: r1(tot.rival), max: 100, emoji: rd.emoji },
          { label: 'Diğer adaylar', value: r1(tot.other), max: 100, emoji: '🗳️' }],
        data: { playerName: st.player.name, rivalName: rd.name, rivalEmoji: rd.emoji, districts: districts,
          total: { player: r1(tot.player), rival: r1(tot.rival), other: r1(tot.other) }, counted: counted, of: of, done: done, won: won },
        options: [{ id: 'next', label: label }] };
    },
    act: function (st, cur) {
      if (cur.res && !(cur.order && cur.order.length)) cur.order = revealOrder();   // eski kayıt: sıra eksik
      if (!cur.res) {
        var p = E.poll(st), res = {};
        // Sandık sürprizi: kararsızların son anda yönelimi bütün şehirde aynı yöne eser (çan biçimli, ortalama 0).
        var sw = (E.rand(st) + E.rand(st) + E.rand(st) + E.rand(st) - 2) * C.ELECTION_SWING;
        cur.order = revealOrder();
        cur.order.forEach(function (id) {
          var b = p.byDistrict[id], oth = clamp(b.other + (E.rand(st) * 2 - 1), 3, 20), n = (E.rand(st) * 2 - 1) * 3 + sw;
          var pl = clamp(b.player + n, 3, 97 - oth);
          res[id] = { player: r1(pl), rival: r1(100 - oth - pl), other: r1(oth) };
        });
        cur.res = res; cur.counted = 0;
      }
      if (cur.counted < cur.order.length) {
        cur.counted++;
        if (cur.counted >= cur.order.length) {
          var t = running(cur, cur.order.length), won = decide(st, t);
          st.el = st.el || {};
          st.el.last = { won: won, player: r1(t.player), rival: r1(t.rival), other: r1(t.other), margin: r1(t.player - t.rival), mode: st.mode };
          E.log(st, (won ? 'Seçimi kazandın' : 'Seçimi kaybettin') + ' (' + pct(t.player) + ' – ' + pct(t.rival) + ').', 'secim');
        }
        return;
      }
      E.next(st);
    }
  };

  /* ───────── Sahne: sonuç ───────── */
  var FLAVOR = {
    mayor: {
      win: ['Kıl payı! Son sandık açılana kadar kimse çayını içemedi. Kazandın ama mesaj net: şehir seni izliyor, kredin sınırsız değil.',
        'Rahat ama gösterişsiz bir zafer. Seçmen icraatını gördü, eksiklerini de not etti. Kutlama pastası kesildi; bir dilimi muhtarlara ayrıldı.',
        'Sandıklar açılır açılmaz belli oldu: {sehir} sana “devam” dedi, hem de gür bir sesle. Belediye önündeki halay sabaha kadar sürdü; martılar bile ritme girdi.'],
      lose: ['Bir avuç oy! Kimi itiraz dilekçesi yazmanı istedi, kimi “bir dahakine” dedi. Tebrik telefonunu açtın; sesin titremedi, elin biraz titredi.',
        'Seçmen bu kez rakibi tercih etti. Makam aracının anahtarını teslim ettin; ama sokaklar seni hâlâ tanıyor ve muhalefet sırası şimdi sende.',
        'Sandıktan ağır bir fatura çıktı; {sehir} değişim istedi, hem de yüksek sesle. Makam odasındaki saksıyı paketlerken pencereden kornaları duydun.']
    },
    opposition: {
      win: ['Son sandıkla gelen zafer! Gönüllülerin birbirine sarıldı, çay ocağında bardaklar havaya kalktı. Koltuk yeniden senin, kıl payı da olsa.',
        'Muhalefet günlerinin teri boşa gitmedi. {sehir} sana ikinci bir şans verdi; bu kez hata payın daha az.',
        'Geri dönüş destanı! Kapı kapı dolaştığın sokaklar sandıkta sana döndü. Belediye binasının önünde “Hoş geldin Başkan” pankartları açıldı.'],
      lose: ['Bir kez daha kıl payı kaçtı. Bazı sandıklar yeniden sayıldı ama sonuç değişmedi. Bu acı tatlıya dönecek mi, zaman gösterecek.',
        'Mevcut başkan koltuğunu korudu. Seçim gecesi parti binasında sessizlik vardı; sabah ise ilk toplantı çoktan planlanmıştı.',
        'Sandık bu kez de sana gülmedi; fark açık. Gönüllülerin yorgun ama dağılmış değil. Yeni bir yol, yeni bir strateji lazım.']
    }
  };
  function lastResult(st) {
    var l = st.el && st.el.last;
    if (l && typeof l.won === 'boolean') return l;
    var p = E.poll(st), t = { player: p.player, rival: p.rival };   // eski kayıt / eksik veri: anketten türet
    return { won: decide(st, t), player: r1(p.player), rival: r1(p.rival), other: r1(p.other), margin: r1(p.player - p.rival), mode: st.mode };
  }

  S.electionResult = {
    view: function (st) {
      var l = lastResult(st), rd = E.rivalDef(st), mayor = isMayor(st), m = Math.abs(l.margin), b = m < 3 ? 0 : m < 8 ? 1 : 2;
      var title = l.won ? (mayor ? 'Yeniden Seçildin!' : 'Koltuk Yeniden Senin!') : (mayor ? 'Koltuğu Kaybettin' : 'Bu Sefer de Olmadı');
      var text = ['Sonuç: sen ' + pct(l.player) + ' — ' + rd.name + ' ' + pct(l.rival) + ' (fark ' + m.toFixed(1) + ' puan).',
        E.fmt(st, FLAVOR[mayor ? 'mayor' : 'opposition'][l.won ? 'win' : 'lose'][b]),
        rd.emoji + ' ' + rd.name + ': “' + E.fmt(st, l.won ? rd.loseQuote : rd.winQuote) + '”'];
      if (mayor && st.termsServed + 1 >= C.TERMS_TO_WIN) text.push('Bu, başkan olarak son seçim döngündü. Şimdi geriye bıraktığın mirasa bakma zamanı.');
      else if (!l.won && st.lossStreak + 1 >= C.MAX_LOSS_STREAK) text.push('Üst üste gelen yenilgiler omuzlarına ağır bastı…');
      return { type: 'electionResult', kicker: '🗳️ Seçim sonucu', title: title, tone: l.won ? 'good' : 'danger', text: text,
        speaker: { name: rd.name, role: mayor ? rd.title : 'Belediye Başkanı', emoji: rd.emoji },
        bars: [{ label: st.player.name, value: l.player, max: 100, emoji: '🙋' }, { label: rd.name, value: l.rival, max: 100, emoji: rd.emoji },
          { label: 'Diğer adaylar', value: l.other, max: 100, emoji: '🗳️' }],
        data: { won: l.won, margin: l.margin, player: l.player, rival: l.rival, other: l.other, mode: st.mode },
        options: [{ id: 'ok', label: l.won ? 'Göreve hazırım' : 'Devam' }] };
    },
    act: function (st) { E.afterElection(st, lastResult(st).won); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
