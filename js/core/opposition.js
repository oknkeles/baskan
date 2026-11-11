/* BAŞKAN — MUHALEFET MODU (BG.opposition)
 * Seçimi kaybeden ya da görevden düşen oyuncu C.OPP_TURNS mevsim boyunca muhalefettedir:
 *   görevler (BG.data.missions), saha/teşkilat işleri, kapı kapı birebir görüşmeler, başkanın dosyasını kabartıp ifşa etmek
 *   ve kampanya (BG.election) ile koltuğu geri almaya çalışır.
 * Çeşitlilik: lossStreak 1 → klasik dönüş; lossStreak 2 → parti içi isyan + ön seçim (kaybedilirse bağımsız aday);
 *   'removed'/'bankrupt' → halkla yüzleşme kararıyla açılan arınma hikâyesi.
 * Tüm modül durumu st.opp içinde (yalnız JSON).
 * Sahneler: oppHub, oppReport, mission, onSecim, yuzlesme.
 */
(function (root) {
  'use strict';
  var BG = root.BG, C = BG.C, clamp = BG.clamp, E = BG.engine, S = BG.scenes;
  var O = BG.opposition = {};

  /* ───────── Sabitler ve metin havuzları ───────── */
  var PRIMARY_TURN = 4;                 // ön seçimin yapılacağı muhalefet mevsimi
  var IFSA_MIN = 40;                    // dosya bu doluluğa gelince ifşa edilebilir
  var IFSA_MAX_PER_CYCLE = 2;
  var RIBBON_CHANCE = 0.5;               // başkanın bir mevsimde proje açma olasılığı
  var HONEYMOON = 4;                    // yeni başkanın balayı: destek hedefinden düşülür, mevsim başına 0.5 erir
  var BASE_CENTER = 46;                 // muhalefetteki destek tabanı: (BASE_CENTER + kaybettiğin andaki destek) / 2
  var TREASURY = { betoncu: 40, populist: -40, teknokrat: 320, eski_baskan: 150 };   // başkanın kasayı sürüklediği seviye
  var CHALLENGERS = [
    { name: 'Oktay Cilalı', role: 'Parti il başkan yardımcısı', emoji: '🕴️', bio: 'Kravatı hep ütülü, sözü hep yuvarlak.' },
    { name: 'Füsun Parlak', role: 'Gençlik kollarının eski başkanı', emoji: '💁‍♀️', bio: 'Sosyal medyada üç yüz bin takipçi, sahada üç yüz adım.' },
    { name: 'Hikmet Fiyakalı', role: 'Partinin “her şeyi bilen” danışmanı', emoji: '🧐', bio: 'Her seçimden sonra “ben demiştim” diyen adam.' }
  ];
  var CLUES = [
    'Belediye çay ocağı için altın kaplama semaver ihalesi bulundu. Tanesi bir minibüs fiyatına.',
    'Hiç açılmamış bir parkın açılışı için üç kez kurdele parası ödenmiş.',
    'Zabıta araçlarının yakıt fişleri, aracın gidemeyeceği kadar uzak bir sahil kasabasından.',
    'Başkanın yeğeni hem martı danışmanı hem de kedi koordinatörü olarak maaş alıyor.',
    'Kaldırım taşları her bahar sökülüp aynı yere yeniden döşenmiş. Faturalar dört kat.',
    'Kent konseyi toplantılarının “ikram” kaleminde yüz kilo baklava görünüyor; konsey hiç toplanmamış.',
    'Asfalt ihalesini kazanan şirketin adresi bir kokoreççi dükkânı çıktı.',
    'Sokak köpekleri için alınan mamaların faturası var, mamalar yok.'
  ];
  var BAGIS = [
    'Mahalle düğün salonunda tombala gecesi düzenledin. Mantı satıldı, çinkolar çekildi, kumbara doldu.',
    'Esnaf ziyaretinde kepenk kepenk dolaştın; kimi zarf verdi, kimi çay ısmarladı.',
    'Kermes açtın: Fatma Teyze’nin kurabiyeleri, gençlerin kahvesi ve çok fazla sarma.',
    'Halı saha turnuvası düzenledin; kazananlar kupa, sen kampanya fonu kazandın.'
  ];
  var VISIT = [
    '{mahalle} kahvehanesinde okey masasına oturdun. “Siz başkanken daha iyiydi” diyen de oldu, “iyi ki gittin” diyen de.',
    '{mahalle} pazarında tezgâh tezgâh dolaştın; domatesçi seni gördü, fiyatı düşürdü.',
    '{mahalle} muhtarıyla sokak sokak yürüdün. Not defterine yirmi yeni çukur yazdın.',
    '{mahalle} parkında emeklilerle sohbet ettin; sokak kedileri de toplantıya katıldı.',
    '{mahalle} çay ocağında dertleri dinledin. Çay bedava, dert bol.'
  ];
  var GENERIC_NEWS = [
    { title: 'Kurdele Mevsimi', text: 'Başkan {rakip} bu mevsim üç açılış yaptı; ikisi geçen dönemden kalma projelerdi.' },
    { title: 'Belediyede Toplantı Üstüne Toplantı', text: 'Başkan {rakip} “ortak akıl” toplantıları düzenledi. Ortak akıl henüz sonuç vermedi.' },
    { title: 'Yeni Logo, Eski Dertler', text: '{sehir} Belediyesi logosunu yeniledi. Çukurlar logonun farkına varmadı.' },
    { title: 'Başkan Sahada (Kameralarla)', text: 'Başkan {rakip} çöp kamyonuna binip fotoğraf çektirdi. Kamyon iki sokak sonra arızalandı.' }
  ];

  function rd(st) { return E.rivalDef(st); }
  function list(kind) { return BG.data[kind] || []; }
  function mission(id) { return BG.byId(list('missions'), id); }
  function avgStat(st) { var s = 0; BG.STATS.forEach(function (x) { s += st.stats[x.id]; }); return s / BG.STATS.length; }
  function dominant(d) { var best = null, k; for (k in d.mix) if (!best || d.mix[k] > d.mix[best]) best = k; return best; }
  function hubName(st) { return st.opp.independent ? 'Bağımsız Seçim Bürosu' : 'Muhalefet Karargâhı'; }
  function seasonKicker(st) { var se = E.season(st); return se.emoji + ' ' + se.name + ' · ' + E.year(st) + '. yıl'; }
  function fmt(st, t, ctx) { return E.fmt(st, t, ctx); }

  /* ───────── Muhalefete giriş ───────── */
  O.enter = function (st, reason) {
    var r = rd(st), streak = st.lossStreak || 1, old = st.opp || {}, shelved = [], shelvedIds = [];
    st.mode = 'opposition'; st.turn = 0; st.cycleLen = C.OPP_TURNS; st.scheduled = []; st.kampanya = 0;
    st.projects.active.forEach(function (p) { var d = E.projectDef(p.id); if (d) { shelved.push(d.emoji + ' ' + d.name); shelvedIds.push(p.id); } });
    st.projects.active = [];
    if (!st.rival) st.rival = E.makeRival(st);
    st.rival.strength = clamp(st.rival.strength, 46, 56);
    delete st.flags.bagimsiz;

    var fon = C.OPP_FON, gon = C.OPP_GONULLU, res = st.res;
    if (reason === 'removed') { fon = Math.round(C.OPP_FON * 0.5); gon = C.OPP_GONULLU - 2; res.itibar = Math.max(res.itibar, 22); }
    else if (reason === 'bankrupt') { fon = Math.round(C.OPP_FON * 0.4); gon = C.OPP_GONULLU - 1; res.itibar = clamp(Math.max(res.itibar - 6, 20), 0, 100); }
    else if (streak >= 2) { fon = Math.round(C.OPP_FON * 0.55) + Math.round((old.fon0 != null ? res.fon : 0) * 0.25); gon = C.OPP_GONULLU - 2; }
    else { fon = C.OPP_FON + clamp(Math.round((res.itibar - 50) / 2), -10, 15); gon = C.OPP_GONULLU + (res.itibar >= 60 ? 2 : 0); }
    res.fon = Math.max(0, fon); res.gonullu = Math.max(0, gon);

    var primary = reason === 'lostAgain' || (streak >= 2 && reason !== 'removed' && reason !== 'bankrupt');
    var ch = primary ? E.int(st, 0, CHALLENGERS.length - 1) : null;
    st.opp = { reason: reason, streak: streak, independent: false, offer: [], done: {}, cool: old.cool || {}, news: old.news || [],
      dosya: 0, ifsa: 0, arc: null, fon0: res.fon, challenger: ch, primaryAt: primary ? PRIMARY_TURN : null, primaryDone: false,
      primaryWon: null, visits: {}, lastIncome: 0, ref: {}, base: {}, shelved: shelvedIds };
    // Seçmen yeni başkanı devraldığı şehre göre yargılar: referans = girişteki "hak edilen" destek seviyesi.
    // Taban: seçmen seni neden gönderdiğini hemen unutmaz; destek 50 ile kaybettiğin andaki desteğin ortasına çekilir.
    BG.GROUPS.forEach(function (gr) {
      st.opp.ref[gr.id] = Math.round(E.groupTarget(st, gr) * 10) / 10;
      st.opp.base[gr.id] = Math.round((BASE_CENTER + st.groups[gr.id]) / 2 * 10) / 10;
    });

    var shelfText = shelved.length ? 'Yeni yönetimin ilk işi, yarım kalan projelerini rafa kaldırmak oldu: ' + shelved.join(', ') + '. Temeller şimdilik kedilere kaldı.' : '';
    var title, kicker = 'Muhalefet', text, tone = 'danger', msgs = [];
    if (reason === 'lost') {
      title = 'Koltuk el değiştirdi';
      text = ['Sandıktan ' + r.emoji + ' ' + r.name + ' çıktı. Makam odasındaki saksı çiçeğini koltuğunun altına alıp belediyeden çıktın.',
        r.name + ' kürsüde: “' + fmt(st, r.winQuote) + '”',
        shelfText || 'Yeni başkan kapıda: ' + r.title + ' kimliğiyle şehri kendi bildiğince yönetecek.',
        'Ama parti hâlâ arkanda ve teşkilat senin sözünden çıkmıyor. ' + C.OPP_TURNS + ' mevsim sonra sandık yeniden kurulacak. Rövanş zamanı!'];
    } else if (reason === 'lostAgain') {
      title = 'Bir kez daha olmadı';
      text = ['Sandık yine ' + r.emoji + ' ' + r.name + ' dedi. Seçim gecesi parti binasının ışıkları erkenden söndü.',
        'Ertesi sabah koridorlarda fısıltılar başladı: “Bu işi artık başkası yapsın.” Parti kasası da yarı yarıya boşaldı.',
        'Önümüzde ' + C.OPP_TURNS + ' mevsim var ve bu kez rakip sadece belediyede değil, kendi partinde de.'];
    } else if (reason === 'removed') {
      title = 'Sıfırdan başlamak';
      text = ['Meclisin güvensizlik oyu bir hafta manşetlerden inmedi. Ara seçimde koltuğa ' + r.emoji + ' ' + r.name + ' oturdu.',
        shelfText || 'Makam aracının yerine artık belediye otobüsü var. Kart bakiyen 4,5 lira.',
        'Bağışçılar telefonlarını açmıyor, gönüllülerin yarısı “biraz ara verelim” dedi. Ama yolun sonu değil: önce halkın karşısına çıkman gerek.'];
    } else {
      title = 'Kayyum günleri bitti, hesap günleri başladı';
      text = ['Kasa iflas edince belediyeye önce kayyum, ardından ara seçimle ' + r.emoji + ' ' + r.name + ' geldi. İlk açıklaması: “Borç dağını devraldık!”',
        shelfText || 'Belediyenin duvarında hâlâ senin fotoğrafın var; yanına “borç saati” asmışlar.',
        'Şehir senden bir açıklama bekliyor. Ne söyleyeceğin, önümüzdeki ' + C.OPP_TURNS + ' mevsimi belirleyecek.'];
    }
    msgs.push({ t: 'msg', tone: tone, kicker: kicker, title: title, text: text, button: 'Devam' });

    if (primary) {
      var c = CHALLENGERS[ch];
      msgs.push({ t: 'msg', tone: 'normal', kicker: 'Parti içi isyan', title: c.name + ' sahneye çıktı',
        speaker: { name: c.name, role: c.role, emoji: c.emoji },
        text: [c.bio + ' Partinin yönetim kurulunda masaya yumruğunu vurdu: “İki kere kaybeden üçüncüde de kaybeder!”',
          PRIMARY_TURN + '. mevsimde ön seçim yapılacak. Kazanırsan partinin adayı sensin; kaybedersen yola bağımsız aday olarak devam etmek zorunda kalırsın.',
          'Delegeler itibarına ve sahadaki gönüllü ordusuna bakacak. Şimdiden hazırlan.'], button: 'Kolları sıva' });
    } else if (reason === 'removed' || reason === 'bankrupt') {
      msgs.push({ t: 'yuzlesme' });
    } else {
      msgs.push({ t: 'msg', tone: 'normal', kicker: 'Yeni dönem', title: hubName(st) + ' kuruldu',
        text: ['Eski seçim bürosunun anahtarını aldın: bir masa, üç sandalye, bitmeyen çay. Kampanya fonunda ' + res.fon + ' 🪙, ekipte ' + res.gonullu + ' 🙋 gönüllü var.',
          'Her mevsim görevlerden birini seç, mahalle mahalle dolaş, kapı çal, başkanın dosyasını kabart. Şehir kötü yönetildikçe halk sana döner — ama sen sahada olmazsan kimse hatırlamaz.'],
        button: 'Sahaya!' });
    }
    msgs.forEach(function (m) { st.queue.push(m); });
    // Görevden alınma/iflasta motor zaten 'kriz' kaydı düştü; onu ezmemek için burada yalnız seçim kaybını kaydet.
    if (reason === 'lost' || reason === 'lostAgain') E.log(st, 'Seçimi kaybettin; muhalefete geçtin.', 'donem');
    E.beginTurn(st);
  };

  /* ───────── Muhalefet mevsimi ───────── */
  O.beginTurn = function (st) {
    var o = st.opp || (st.opp = { offer: [], done: {}, cool: {}, news: [], dosya: 0, ifsa: 0, visits: {} });
    var r = rd(st), lines = [], before = {}, k;
    BG.STATS.forEach(function (s) { before[s.id] = st.stats[s.id]; });

    // a) başkan yönetir + yıpranma
    for (k in (r.govern || {})) if (k in st.stats) st.stats[k] = clamp(st.stats[k] + r.govern[k], 0, 100);
    BG.STATS.forEach(function (s) { if (st.stats[s.id] > C.DECAY_FLOOR) st.stats[s.id] = clamp(st.stats[s.id] - C.DECAY, 0, 100); });
    var tgt = TREASURY[r.id] != null ? TREASURY[r.id] : 150, b0 = st.res.butce;
    st.res.butce = clamp(Math.round(st.res.butce + (tgt - st.res.butce) * 0.2), -100, 400);
    var cityDeltas = [];
    BG.STATS.forEach(function (s) { var d = Math.round(st.stats[s.id] - before[s.id]); if (d) cityDeltas.push({ key: s.id, label: s.name, emoji: s.emoji, delta: d }); });
    var ribbon = rivalBuild(st);
    var db = Math.round(st.res.butce - b0);
    if (db) cityDeltas.push({ key: 'butce', label: 'Belediye kasası', emoji: '💰', delta: db });

    // b) başkanın icraat haberi
    var pool = list('rivalNews').filter(function (n) { return (!n.rival || n.rival === r.id) && E.check(st, n.when); });
    var keep = Math.min(4, Math.max(0, pool.length - 1));
    var fresh = pool.filter(function (n) { return o.news.indexOf(n.id) < 0; });
    var news = E.pick(st, fresh.length ? fresh : pool), newsDeltas = [];
    if (news) {
      o.news.push(news.id); while (o.news.length > keep) o.news.shift();
      newsDeltas = E.apply(st, news.effects);
    }
    var g = news ? { title: news.title, text: news.text } : E.pick(st, GENERIC_NEWS);

    // c) destek kayması: şehir kötüleştikçe halk sana döner
    var bias = (o.independent ? 2 : 0) + (o.arc === 'ozur' ? 1 : 0) - Math.max(0, HONEYMOON + (o.streak >= 2 ? 3 : 0) - 0.5 * (st.turn - 1));
    BG.GROUPS.forEach(function (gr) {
      var ref = o.ref && o.ref[gr.id] != null ? o.ref[gr.id] : 50;
      var base = o.base && o.base[gr.id] != null ? o.base[gr.id] : 50;
      var t = clamp(base + (ref - E.groupTarget(st, gr)) * 0.6 + (st.res.itibar - 50) * 0.2 + bias, 0, 100), c = st.groups[gr.id];
      st.groups[gr.id] = clamp(c + (t - c) * C.DRIFT, 0, 100);
    });
    // Mahalle bonusu söner; koltuktaki başkan afet hasarını yavaş yavaş onarır.
    BG.DISTRICTS.forEach(function (d) { var ds = st.districts[d.id]; ds.bonus = Math.round(ds.bonus * C.BONUS_KEEP * 10) / 10; if (ds.hasar > 0) ds.hasar = Math.max(0, Math.round(ds.hasar * 0.8) - 2); });

    E.itibarDrift(st);

    // d) başkanın gücü şehrin hâline göre kayar
    if (st.rival) {
      var rt = clamp(38 + 0.28 * avgStat(st) + C.OPP_INCUMBENCY, 35, 62);
      st.rival.strength = clamp(st.rival.strength + (rt - st.rival.strength) * 0.15, 20, 80);
    }

    // e) pasif gelir
    var inc = 6 + Math.round(st.res.gonullu / 3) + (o.arc === 'sessiz' ? 5 : 0) - (o.independent ? 2 : 0);
    inc = Math.max(3, inc);
    st.res.fon += inc; o.lastIncome = inc;

    // görev teklifleri ve tur sıfırlama
    o.done = {}; o.visits = {};
    o.offer = makeOffer(st);

    // f) kuyruk
    lines.push({ emoji: r.emoji, title: fmt(st, g.title), text: fmt(st, g.text), deltas: E.mergeDeltas(newsDeltas) });
    if (ribbon) lines.push(ribbon);
    if (cityDeltas.length) lines.push({ emoji: '🏙️', title: 'Şehrin gidişatı', text: cityLine(st, cityDeltas), deltas: cityDeltas });
    lines.push({ emoji: '🪙', title: o.independent ? 'Bağış kumbarası' : 'Teşkilat kasası',
      text: (o.independent ? 'Parti desteği yok ama mahalleli kumbarayı boş bırakmadı: ' : 'Aidatlar ve küçük bağışlar geldi: ') + '+' + inc + ' fon. Kasada ' + st.res.fon + ' 🪙, ekipte ' + st.res.gonullu + ' 🙋.',
      deltas: [{ key: 'fon', label: 'Kampanya Fonu', emoji: '🪙', delta: inc }] });
    if (o.primaryAt && !o.primaryDone && o.primaryAt > st.turn) lines.push({ emoji: '🗳️', title: 'Ön seçim yaklaşıyor', text: 'Parti içi ön seçime ' + (o.primaryAt - st.turn) + ' mevsim var. Delegeler itibarını ve gönüllülerini tartıyor.' });
    var nw = E.pickNews(st);   // manşet ve tweetler yalnız data.headline / data.tweets ile gider (çekirdek 'report' gibi)
    st.queue.push({ t: 'oppReport', headline: nw.headline, tweets: nw.tweets, lines: lines, news: g.title });

    if (BG.disaster && BG.disaster.roll) (BG.disaster.roll(st) || []).forEach(function (s) { if (s) st.queue.push(s); });
    E.dueEvents(st).forEach(function (s) { st.queue.push(E.eventScene(st, E.findEvent(s.id), s.district)); });
    var ev = E.drawEvent(st, 'opposition');
    if (ev) st.queue.push(E.eventScene(st, ev));
    if (o.primaryAt === st.turn && !o.primaryDone) st.queue.push({ t: 'onSecim' });
  };

  /** Oturan başkan da boş durmaz: arada bir proje açar (yalnız şehir göstergelerine etki eder; şehrin kalıcı malı olur).
   *  Rafa kaldırılan projeleri önceliklidir — kurdeleyi o keser. → rapor satırı | null */
  function rivalBuild(st) {
    var o = st.opp, r = rd(st), gov = r.govern || {};
    if (E.rand(st) >= RIBBON_CHANCE) return null;
    var cands = [];
    (BG.data.projects || []).forEach(function (d) {
      if (!d || !d.id || !E.check(st, d.when)) return;
      var dist = null;
      if (d.yer === 'mahalle') {
        var free = BG.DISTRICTS.filter(function (x) { return !E.projectBusy(st, d.id, x.id, d.once !== false); });
        if (!free.length) return;
        dist = E.pick(st, free).id;
      } else if (E.projectBusy(st, d.id, null, d.once !== false)) return;
      var w = (gov[d.cat] || 0) > 0 ? 3 : (gov[d.cat] || 0) < 0 ? 0.3 : 1;
      if ((o.shelved || []).indexOf(d.id) >= 0) w *= 4;
      cands.push({ d: d, district: dist, weight: w });
    });
    var c = E.weighted(st, cands);
    if (!c) return null;
    var eff = {}, k, ctx = { district: c.district };
    for (k in (c.d.effects || {})) if (k in st.stats) eff[k] = c.d.effects[k];
    st.projects.done.push({ id: c.d.id, district: c.district, n: st.totalTurns, by: r.id });
    var dl = E.apply(st, eff, ctx), mine = (o.shelved || []).indexOf(c.d.id) >= 0;
    if (mine) o.shelved.splice(o.shelved.indexOf(c.d.id), 1);
    return { emoji: '🎀', title: 'Kurdele: ' + c.d.emoji + ' ' + c.d.name + (c.district ? ' (' + E.district(c.district).name + ')' : ''),
      text: mine ? 'Senin başlatıp yarım bıraktığın projeyi ' + r.name + ' tamamladı. Kurdeleyi o kesti, alkışı o topladı; sen haberi telefondan izledin.'
        : 'Başkan ' + r.name + ' yeni projesini davul zurnayla açtı. İşe yarıyor, söylemesi acı ama işe yarıyor.', deltas: dl };
  }

  function cityLine(st, deltas) {
    var down = deltas.filter(function (d) { return d.key !== 'butce' && d.delta < 0; }).length, up = deltas.filter(function (d) { return d.key !== 'butce' && d.delta > 0; }).length;
    if (up > down) return 'Başkan ' + rd(st).name + ' bazı işleri yoluna koydu. Halk bunu görüyor; sen de görmezden gelme.';
    if (down > up + 2) return 'Şehir yorgun: çukurlar büyüyor, otobüsler gecikiyor. Hoşnutsuzluk sana çalışıyor.';
    return 'Şehir yerinde sayıyor. Ne büyük icraat var ne büyük kriz; seçmen kararsız.';
  }

  /** Bu mevsimin görev tekliflerini seçer: bir diyalog görevi (varsa) + ağırlıklı rastgele olay görevleri. */
  function makeOffer(st) {
    var o = st.opp, out = [], all = list('missions').filter(function (m) {
      return m && m.id && E.check(st, m.when) && (o.cool[m.id] == null || o.cool[m.id] <= st.totalTurns);
    });
    var dlg = BG.dialogue ? all.filter(function (m) { return m.kind === 'diyalog'; }) : [];
    if (BG.dialogue && !dlg.length) dlg = list('missions').filter(function (m) { return m.kind === 'diyalog'; });
    var d = E.pick(st, dlg);
    if (d) out.push(d.id);
    var rest = all.filter(function (m) { return m.kind === 'olay'; });
    while (out.length < 4 && rest.length) {
      var m = E.weighted(st, rest, function (x) { return x.weight == null ? 1 : x.weight; });
      if (!m) break;
      out.push(m.id); rest.splice(rest.indexOf(m), 1);
    }
    return out;
  }

  O.onIdle = function (st) { st.queue.push({ t: 'oppHub' }); };

  /* ───────── Sahne: muhalefet raporu ───────── */
  S.oppReport = {
    view: function (st, cur) {
      return { type: 'oppReport', kicker: seasonKicker(st) + ' · Muhalefet', title: cur.headline || ('Belediyeden: ' + (cur.news || 'yeni mevsim')),
        text: 'Seçime ' + E.turnsLeft(st) + ' mevsim var. Başkan ' + rd(st).emoji + ' ' + rd(st).name + ' bu mevsim şunları yaptı:',
        list: cur.lines || [], data: { headline: cur.headline, tweets: cur.tweets || [], turn: st.turn, cycleLen: st.cycleLen, mode: 'opposition' },
        options: [{ id: 'ok', label: 'Karargâha geç' }] };
    },
    act: function (st) { E.next(st); }
  };

  /* ───────── Sahne: muhalefet hub'ı ───────── */
  function lockAp(st, o, cost) {
    if (st.ap < 1) { o.disabled = true; o.why = 'Bu mevsimlik mesain bitti'; }
    else if (cost && !E.canPay(st, cost)) { o.disabled = true; o.why = 'Kaynak yetersiz'; }
    return o;
  }
  function sahaCosts(st) {
    return { ziyaret: { enerji: 1 }, bagis: { enerji: 1 }, gonullu: { enerji: 1, fon: 10 }, dosya: { enerji: 1, fon: 6 }, ifsa: { enerji: 1 } };
  }

  S.oppHub = {
    view: function (st) {
      var o = st.opp || {}, left = E.turnsLeft(st), groups = [], gorev = [], saha = [], info = [], cs = sahaCosts(st);
      (o.offer || []).forEach(function (id) {
        var m = mission(id);
        if (!m) return;
        if (m.kind !== 'diyalog' && o.done && o.done[id]) return;
        var opt = { id: 'gorev:' + id, emoji: m.emoji, label: m.name, hint: fmt(st, m.desc), cost: E.costText(m.cost),
          tag: m.kind === 'diyalog' ? 'Birebir' : 'Görev', pick: m.yer === 'mahalle' ? 'district' : null };
        if (m.kind === 'diyalog' && !BG.dialogue) { opt.disabled = true; opt.why = 'Görüşecek kimse yok'; }
        else if (!E.check(st, m.when)) { opt.disabled = true; opt.why = 'Şartlar uygun değil'; }
        else lockAp(st, opt, m.cost);
        gorev.push(opt);
      });
      if (!gorev.length) gorev.push({ id: 'gorev:yok', emoji: '📭', label: 'Bu mevsim yeni görev yok', disabled: true, why: 'Gelecek mevsim yeni görevler gelecek' });
      groups.push({ id: 'gorev', title: 'Görevler', emoji: '🎯', options: gorev });

      saha.push(lockAp(st, { id: 'saha:ziyaret', emoji: '🚶', label: 'Mahalle turu', hint: 'Seçtiğin mahallede yüz yüze destek topla: ilk turda mahalle desteği ve oradaki baskın kesim artar; aynı mevsim aynı mahalleye dönersen etkisi azalır.',
        cost: E.costText(cs.ziyaret), pick: 'district' }, cs.ziyaret));
      saha.push(lockAp(st, { id: 'saha:bagis', emoji: '🫖', label: 'Kumbara turu', hint: 'Kermes, tombala, esnaf kumbarası: kampanya fonu topla.', cost: E.costText(cs.bagis),
        fx: [{ key: 'fon', label: 'Kampanya Fonu', emoji: '🪙', delta: 12 + Math.round(st.res.gonullu / 2) }] }, cs.bagis));
      saha.push(lockAp(st, { id: 'saha:gonullu', emoji: '🙋', label: 'Gönüllü çağrısı', hint: 'Gençleri, emeklileri, ev hanımlarını ekibe kat. Gönüllüler fon da getirir.', cost: E.costText(cs.gonullu) }, cs.gonullu));
      var dosyaOpt = { id: 'saha:dosya', emoji: '🗂️', label: 'Belediyenin dosyasını kabart', hint: 'Faturaları, ihaleleri, yakıt fişlerini didik didik et. Dosya: %' + (o.dosya || 0), cost: E.costText(cs.dosya) };
      if ((o.ifsa || 0) >= IFSA_MAX_PER_CYCLE) { dosyaOpt.disabled = true; dosyaOpt.why = 'Basın bu dönem yeterince skandal gördü'; }
      else if ((o.dosya || 0) >= 100) { dosyaOpt.disabled = true; dosyaOpt.why = 'Dosya dolu, ifşa zamanı'; }
      else lockAp(st, dosyaOpt, cs.dosya);
      saha.push(dosyaOpt);
      if ((o.dosya || 0) >= IFSA_MIN && (o.ifsa || 0) < IFSA_MAX_PER_CYCLE) {
        saha.push(lockAp(st, { id: 'saha:ifsa', emoji: '📰', label: 'Basın toplantısı: dosyayı patlat', risk: true,
          hint: 'Dosya ne kadar kalınsa o kadar sağlam. Zayıf dosya geri teper. (Başarı şansı ~%' + Math.round(ifsaChance(st) * 100) + ')', cost: E.costText(cs.ifsa) }, cs.ifsa));
      }
      groups.push({ id: 'saha', title: o.independent ? 'Bağımsız Saha Çalışması' : 'Saha ve Teşkilat', emoji: '🚩', options: saha });

      var kamp = BG.election && BG.election.hubOptions && BG.election.hubOptions(st);
      if (kamp) groups.push(kamp);

      if (o.dosya) info.push({ emoji: '🗂️', title: 'Başkanın dosyası', text: '%' + o.dosya + ' dolu' + (o.dosya >= IFSA_MIN ? ' — basına sunulabilir.' : ' — biraz daha belge lazım.') });
      if (o.primaryAt && !o.primaryDone) info.push({ emoji: '🗳️', title: 'Ön seçim', text: (o.primaryAt - st.turn > 0 ? (o.primaryAt - st.turn) + ' mevsim sonra' : 'bu mevsim') + ' · rakibin ' + CHALLENGERS[o.challenger || 0].name });
      if (o.independent) info.push({ emoji: '🦅', title: 'Bağımsız aday', text: 'Parti arkanda değil; ama mağdur rüzgârı senden yana esiyor.' });

      var text = left === 0 ? 'Sandıktan önceki son mevsim. Son kozlarını oyna!' : left < C.CAMPAIGN_TURNS ? 'Kampanya dönemi! Seçime ' + left + ' mevsim var.' : 'Mesaini nasıl kullanacaksın? Seçime ' + left + ' mevsim var.';
      return { type: 'oppHub', kicker: seasonKicker(st), title: hubName(st), text: text, list: info.length ? info : undefined, groups: groups,
        options: [{ id: 'end', label: left === 0 ? 'Sandığa git 🗳️' : 'Mevsimi bitir ▶', hint: st.ap > 0 ? st.ap + ' mesai puanın duruyor' : '' }],
        data: { ap: st.ap, apMax: C.AP_PER_TURN, turnsLeft: left, fon: st.res.fon, gonullu: st.res.gonullu, independent: !!o.independent, dosya: o.dosya || 0 } };
    },
    act: function (st, cur, id, payload) {
      var o = st.opp;
      if (id === 'end') return E.endTurn(st);
      if (id.indexOf('kampanya') === 0) { if (BG.election && BG.election.hubAct) BG.election.hubAct(st, id, payload); return; }
      if (st.ap < 1) return E.flash(st, 'Bu mevsimlik mesain bitti.');
      var dist = payload && payload.district && st.districts[payload.district] ? payload.district : null;
      if (id.indexOf('gorev:') === 0) return doMission(st, id.slice(6), dist);
      if (id.indexOf('saha:') === 0) return doSaha(st, id.slice(5), dist);
    }
  };

  function doMission(st, mid, dist) {
    var o = st.opp, m = mission(mid);
    if (!m || (o.offer || []).indexOf(mid) < 0) return;
    if (m.kind !== 'diyalog' && o.done[mid]) return E.flash(st, 'Bu görevi bu mevsim zaten yaptın.');
    if (!E.check(st, m.when)) return E.flash(st, 'Bu görevin şartları şu an uygun değil.');
    if (m.yer === 'mahalle' && !dist) return;
    if (!E.canPay(st, m.cost)) return E.flash(st, 'Kaynak yetersiz: ' + E.costText(m.cost));
    if (m.kind === 'diyalog') {
      if (!BG.dialogue) return E.flash(st, 'Bugün kapılar kapalı: görüşecek kimse çıkmadı.');
      var paid = E.pay(st, m.cost);
      var sc = BG.dialogue.make(st, { mode: 'opposition', district: dist || undefined });
      if (!sc) { E.apply(st, m.cost); return E.flash(st, 'Zilleri çaldın ama kimse açmadı. Mesain sana kaldı.'); }
      o.done[mid] = true;
      if (m.cooldown) o.cool[mid] = st.totalTurns + 1 + m.cooldown;
      E.log(st, m.name + (dist ? ' (' + E.district(dist).name + ')' : ''), 'gorev');
      return E.interrupt(st, sc);
    }
    var pd = E.pay(st, m.cost);
    o.done[mid] = true;
    o.cool[mid] = st.totalTurns + 1 + (m.cooldown || 0);
    E.interrupt(st, { t: 'mission', id: mid, district: m.yer === 'mahalle' ? dist : null, paid: pd });
  }

  function ifsaChance(st) { var o = st.opp || {}; return clamp((o.dosya || 0) / 100 + (o.arc === 'meydan' ? 0.1 : 0) + (st.res.itibar - 50) / 250, 0.3, 0.92); }

  function doSaha(st, what, dist) {
    var o = st.opp, cs = sahaCosts(st)[what], dl, txt, ctx = { district: dist };
    if (!cs) return;
    if (!E.canPay(st, cs)) return E.flash(st, 'Kaynak yetersiz: ' + E.costText(cs));
    if (what === 'ziyaret') {
      if (!dist) return;
      var dd = E.district(dist), again = o.visits[dist], eff = { mahalle: again ? 1 : 3 };
      if (!again) { eff[dominant(dd)] = 1; if (o.arc === 'ozur') eff.mahalle += 1; }
      o.visits[dist] = true;
      dl = E.pay(st, cs).concat(E.apply(st, eff, ctx));
      txt = again ? '{mahalle} sakinleri “Yine mi geldin? Gel bari çay koyalım” dedi.' : E.pick(st, VISIT);
      return E.flash(st, fmt(st, txt, ctx), E.mergeDeltas(dl));
    }
    if (what === 'bagis') {
      dl = E.pay(st, cs).concat(E.apply(st, { fon: 12 + Math.round(st.res.gonullu / 2) }));
      return E.flash(st, E.pick(st, BAGIS), E.mergeDeltas(dl));
    }
    if (what === 'gonullu') {
      var n = E.int(st, 2, 4) + (o.independent ? 1 : 0);
      dl = E.pay(st, cs).concat(E.apply(st, { gonullu: n }));
      return E.flash(st, E.pick(st, ['Kampüste stant açtın; ' + n + ' yeni gönüllü “ben de varım” dedi.',
        'Emekliler lokalinde bir konuşma yaptın; ' + n + ' kişi yeleği hemen giydi.',
        'Halı saha maçından sonra ' + n + ' kişi soyunma odasında ekibe katıldı.']), E.mergeDeltas(dl));
    }
    if (what === 'dosya') {
      if ((o.ifsa || 0) >= IFSA_MAX_PER_CYCLE || o.dosya >= 100) return;
      var gain = E.int(st, 12, 24) + Math.min(8, Math.floor(st.res.gonullu / 3)) + (o.arc === 'meydan' ? 6 : 0);
      dl = E.pay(st, cs);
      o.dosya = Math.min(100, (o.dosya || 0) + gain);
      return E.flash(st, '🗂️ ' + E.pick(st, CLUES) + ' Dosya %' + o.dosya + ' doldu.', E.mergeDeltas(dl));
    }
    if (what === 'ifsa') {
      if ((o.dosya || 0) < IFSA_MIN || (o.ifsa || 0) >= IFSA_MAX_PER_CYCLE) return;
      var p = ifsaChance(st), ok = E.rand(st) < p, r = rd(st), eff2;
      dl = E.pay(st, cs);
      if (ok) {
        eff2 = { rakip: -Math.min(9, 3 + Math.round(o.dosya / 16)), itibar: 3, halk: o.dosya >= 80 ? 2 : 1, skor: 10 };
        txt = ['Belgeleri tek tek masaya dizdin. Gazeteciler fotoğraf çekmekten yoruldu.',
          'Akşam haberlerinde ' + r.name + ' “iftira” dedi ama sesi titriyordu. Kahvehanelerde başka konu konuşulmuyor.'];
      } else {
        eff2 = { itibar: -5, rakip: 2 };
        txt = ['Belgeleri sundun ama bir gazeteci sordu: “Bu fatura geçen döneme ait değil mi?” Salonda derin bir sessizlik.',
          r.name + ' ertesi gün karşı basın toplantısı yaptı: “Muhalefet kendi dosyasını unutmuş!”'];
      }
      dl = dl.concat(E.apply(st, eff2));
      o.dosya = 0; o.ifsa = (o.ifsa || 0) + 1;
      E.log(st, ok ? 'Başkanın dosyasını ifşa ettin.' : 'İfşa geri tepti.', 'siyaset');
      return E.interrupt(st, { t: 'msg', kicker: 'Basın toplantısı', title: ok ? 'Dosya patladı!' : 'İfşa geri tepti', tone: ok ? 'good' : 'danger', text: txt, deltas: E.mergeDeltas(dl) });
    }
  }

  /* ───────── Sahne: görev ───────── */
  S.mission = {
    view: function (st, cur) {
      var m = mission(cur.id), ctx = { district: cur.district };
      if (!m || m.kind !== 'olay' || !m.choices) return { type: 'mission', title: 'Görev iptal', text: 'Bu görev artık geçerli değil.', options: [{ id: 'ok', label: 'Devam' }] };
      var v = { type: 'mission', kicker: '🎯 Görev' + (cur.district ? ' · ' + E.district(cur.district).name : ''), title: m.emoji + ' ' + m.name, district: cur.district };
      if (cur.result) {
        v.text = cur.result.text; v.deltas = cur.result.deltas; v.options = [{ id: 'ok', label: 'Devam' }];
        v.data = { resolved: true, chosen: cur.result.chosen, question: fmt(st, m.text, ctx) };
      } else {
        v.text = fmt(st, m.text, ctx);
        v.options = m.choices.map(function (ch, i) { return E.choiceOption(st, ch, i, ctx); });
        if (v.options.every(function (x) { return x.disabled; })) v.options.push({ id: 'pas', label: 'Toparlan ve geri çekil', hint: 'İtibar −1' });
      }
      return v;
    },
    act: function (st, cur, id) {
      var m = mission(cur.id), ctx = { district: cur.district };
      if (cur.result || !m || !m.choices) return E.next(st);
      if (id === 'pas') {
        if (m.choices.some(function (ch) { return E.check(st, ch.when) && E.canPay(st, ch.cost); })) return;   // yalnız her seçenek kilitliyse
        cur.result = { text: 'Kalabalık dağıldı, sen de sessizce çekildin.', deltas: E.mergeDeltas((cur.paid || []).concat(E.apply(st, { itibar: -1 }))), chosen: 'Geri çekil' }; return; }
      var ch = m.choices[+id];
      if (!ch || !E.check(st, ch.when) || !E.canPay(st, ch.cost)) return;
      var res = E.resolveChoice(st, ch, ctx);
      cur.result = { text: res.text, deltas: E.mergeDeltas((cur.paid || []).concat(res.deltas)), chosen: fmt(st, ch.text, ctx) };
      st.score += 3;
      E.log(st, m.name + ' → ' + cur.result.chosen, 'gorev');
    }
  };

  /* ───────── Sahne: ön seçim ───────── */
  var PRIMARY_CHOICES = [
    { text: 'Delegeleri tek tek ara, çay ocağında ikna et', hint: 'Mesai ister, samimiyet kazandırır', cost: { enerji: 1 } },
    { text: 'Gönüllü ordunu kongre salonuna taşı', hint: 'Ne kadar kalabalık, o kadar etkili', cost: { gonullu: 3 } },
    { text: 'Kürsüde rakibine meydan oku', hint: 'Ya salonu coşturursun ya da soğutursun' },
    { text: 'Uzlaşma teklif et: ona meclis listesinde ilk sıra', hint: 'Pahalı ama en az riskli pazarlık (itibar −2)', cost: { fon: 15 } }
  ];
  function primaryBonus(st, i) {
    if (i === 0) return 8;
    if (i === 1) return 3 + Math.min(12, Math.round(st.res.gonullu * 0.7));
    if (i === 2) return E.int(st, -6, 16);
    return 12;
  }
  /** Delege oylamasındaki şans payı: uzlaşma pazarlığı (3) en az belirsiz olanıdır. */
  function primaryNoise(st, i) { return i === 3 ? E.int(st, -4, 4) : E.int(st, -12, 12); }
  S.onSecim = {
    view: function (st, cur) {
      var c = CHALLENGERS[(st.opp && st.opp.challenger) || 0], sp = { name: c.name, role: c.role, emoji: c.emoji };
      if (cur.result) {
        return { type: 'onSecim', kicker: 'Parti içi ön seçim', title: cur.result.won ? 'Adaylık senin!' : 'Delegeler ' + c.name + ' dedi', speaker: sp,
          tone: cur.result.won ? 'good' : 'danger', text: cur.result.text, deltas: cur.result.deltas,
          meter: { label: 'Delege desteği', value: cur.result.score, target: cur.result.target, max: 100 },
          data: { resolved: true, won: cur.result.won }, options: [{ id: 'ok', label: cur.result.won ? 'Kampanyaya dön' : 'Bağımsız yola çık' }] };
      }
      return { type: 'onSecim', kicker: 'Parti içi ön seçim', title: 'Kongre salonu dolu', speaker: sp,
        text: ['Salonda bayraklar, kurabiyeler ve gergin delegeler. ' + c.name + ' önden konuşup alkışı topladı: “Artık yeni bir yüz lazım!”',
          'Delegeler senin itibarına ve sahadaki gönüllü ordusuna bakacak. Son hamleni seç.'],
        bars: [{ label: 'İtibar', value: Math.round(st.res.itibar), max: 100, emoji: '⭐' }, { label: 'Gönüllüler', value: st.res.gonullu, max: 30, emoji: '🙋' }],
        options: PRIMARY_CHOICES.map(function (ch, i) { return E.choiceOption(st, ch, i, {}); }) };
    },
    act: function (st, cur, id) {
      var o = st.opp, c = CHALLENGERS[o.challenger || 0];
      if (cur.result) { o.primaryDone = true; return E.next(st); }
      var i = +id, ch = PRIMARY_CHOICES[i];
      if (!ch || !E.canPay(st, ch.cost)) return;
      var bonus = primaryBonus(st, i), dl = E.pay(st, ch.cost);
      var score = Math.round(clamp(st.res.itibar * 0.45 + st.res.gonullu * 1.1 + bonus + primaryNoise(st, i), 0, 100)), target = 40, won = score >= target, text;
      if (i === 3) dl = dl.concat(E.apply(st, { itibar: -2 }));
      o.primaryWon = won; o.primaryDone = true;
      if (won) {
        dl = dl.concat(E.apply(st, { itibar: 4, gonullu: 3, halk: 1, fon: 10, skor: 10 }));
        text = [i === 2 ? 'Kürsüde döktürdün; salon ayağa kalktı.' : i === 3 ? 'Pazarlık tuttu: ' + c.name + ' listenin başına geçti, sen adaylığa.' : 'Delegeler tek tek sana döndü.',
          'Sonuç açıklandı: aday sensin! ' + c.name + ' elini sıktı, dişlerinin arasından “tebrikler” dedi. Parti kasası yeniden açıldı, gönüllüler moral buldu.'];
        E.log(st, 'Ön seçimi kazandın.', 'siyaset');
      } else {
        o.independent = true; st.flags.bagimsiz = true;
        var lost = Math.ceil(st.res.gonullu * 0.35);
        dl = dl.concat(E.apply(st, { fon: -Math.round(st.res.fon * 0.5), gonullu: -lost }), E.apply(st, { itibar: 5, halk: 2 }));
        text = ['Sayım uzun sürdü ve ' + c.name + ' birkaç oyla öne geçti. Parti rozetini masaya bıraktın.',
          'Ertesi sabah büronun tabelası değişti: “Bağımsız Aday”. Kasanın yarısı partide kaldı, ' + lost + ' gönüllü yollarını ayırdı.',
          'Ama sokaktaki hava farklı: “Partisi bile sırtını döndü, garibim” diyenler çoğaldı. Mağdur rüzgârı arkanda.'];
        E.log(st, 'Ön seçimi kaybettin; bağımsız aday oldun.', 'siyaset');
      }
      cur.result = { won: won, score: score, target: target, text: text, deltas: E.mergeDeltas(dl) };
    }
  };

  /* ───────── Sahne: halkla yüzleşme (görevden alınma / iflas sonrası) ───────── */
  var FACE_CHOICES = [
    { text: 'Özür turuna çık: mahalle mahalle, kapı kapı', hint: 'İtibarı onarır; sert çekirdek küsebilir',
      effects: { itibar: 10, halk: 1, gonullu: -2 }, arc: 'ozur',
      result: 'Çarşı’dan Bağlar’a kadar yürüdün, her kapıda “hata yaptım” dedin. Kimi yüzüne kapadı, kimi çay koydu. Ekipten birkaç kişi “boyun eğdi” diye küstü ama halk seni yeniden dinlemeye başladı.' },
    { text: '“Bu bir komplo!” deyip meydan oku', hint: 'Taban coşar, orta yol kaçar',
      arc: 'meydan', outcomes: [
        { p: 0.5, effects: { gonullu: 6, genc: 3, isci: 3, itibar: -3 }, result: 'Meydanda kalabalık “Yalnız değilsin!” diye bağırdı. Gençler ve emekçiler saflarını sıklaştırdı; ama ılımlı seçmen kaşlarını çattı.' },
        { p: 0.5, effects: { gonullu: 3, itibar: -7, halk: -2 }, result: 'Mikrofon cızırdadı, slogan tutmadı. Akşam haberleri “Hesap vermek yerine suçlu arıyor” diye girdi.' }
      ] },
    { text: 'Sessizce toparlan: önce kadro, sonra söz', hint: 'Kasa ve ekip güçlenir; halk seni bir süre unutur',
      effects: { fon: 20, gonullu: 3, itibar: 2, halk: -1 }, arc: 'sessiz',
      result: 'Kameralardan uzak durdun. Eski dostları tek tek aradın, küçük bir ofis tuttun, bağışçılarla sessizce barıştın. Şehir senden söz etmiyor — şimdilik.' }
  ];
  S.yuzlesme = {
    view: function (st, cur) {
      var why = st.opp && st.opp.reason === 'bankrupt' ? 'Belediye kasası senin döneminde dibe vurdu.' : 'Meclis seni güvensizlik oyuyla görevden aldı.';
      if (cur.result) return { type: 'yuzlesme', kicker: 'Halkla yüzleşme', title: cur.result.title, text: cur.result.text, deltas: cur.result.deltas,
        data: { resolved: true, arc: st.opp && st.opp.arc }, options: [{ id: 'ok', label: 'Yola koyul' }] };
      return { type: 'yuzlesme', kicker: 'Halkla yüzleşme', title: 'Kameralar seni bekliyor',
        text: [why + ' Kapının önünde muhabirler, telefonunda yüzlerce mesaj, kahvehanelerde tek konu: “Şimdi ne yapacak?”',
          'Bu cevap, muhalefetteki bütün yolculuğunun tonunu belirleyecek.'],
        options: FACE_CHOICES.map(function (ch, i) { return E.choiceOption(st, ch, i, {}); }) };
    },
    act: function (st, cur, id) {
      if (cur.result) return E.next(st);
      var ch = FACE_CHOICES[+id];
      if (!ch) return;
      var res = E.resolveChoice(st, ch, {});
      st.opp.arc = ch.arc;
      cur.result = { title: ch.arc === 'ozur' ? 'Özür turu' : ch.arc === 'meydan' ? 'Meydan okuma' : 'Sessiz yeniden yapılanma', text: res.text, deltas: res.deltas };
      E.log(st, 'Yüzleşme: ' + cur.result.title, 'siyaset');
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
