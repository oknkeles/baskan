/* BAŞKAN — oyun kabuğu ve genel çizicilerin tamamı (BG.ui).
 * Motorla konuşma: view = BG.engine.view() → çiz → tıklamada view = BG.engine.act(id, payload).
 * BG.state yalnızca OKUNUR. Oyun metni asla innerHTML'e girmez (hiperscript ile textContent).
 */
(function (root) {
  'use strict';
  var BG = root.BG;
  var C = BG.C;
  var ui = BG.ui = BG.ui || {};

  var renderers = {};
  var S = {                // arayüz durumu (kayda girmez)
    view: null, sig: null, prev: null, inGame: false, modal: null, pick: null,
    lockUntil: 0, hubTab: null, hubFilter: {}, el: {}, bars: {}, timers: []
  };

  /* ───────── Küçük hiperscript ───────── */
  function append(el, kids) {
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k == null || k === false || k === true) continue;
      if (Array.isArray(k)) append(el, k);
      else if (typeof k === 'object' && k.nodeType) el.appendChild(k);
      else el.appendChild(root.document.createTextNode(String(k)));
    }
  }
  function h(tag, props) {
    var el = root.document.createElement(tag), kids = Array.prototype.slice.call(arguments, 2), k, v;
    if (props != null && (typeof props !== 'object' || props.nodeType || Array.isArray(props))) { kids.unshift(props); props = null; }
    for (k in (props || {})) {
      v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class' || k === 'className') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'dataset') { for (var d in v) if (v[d] != null) el.dataset[d] = v[d]; }
      else if (k === 'style') {
        if (typeof v === 'string') el.style.cssText = v;
        else for (var s in v) { if (s.indexOf('--') === 0) el.style.setProperty(s, v[s]); else el.style[s] = v[s]; }
      } else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
    append(el, kids);
    return el;
  }
  function svg(tag, attrs) {
    var e = root.document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in (attrs || {})) e.setAttribute(k, String(attrs[k]));
    return e;
  }
  function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); return el; }
  function $(id) { return root.document.getElementById(id); }
  function later(fn, ms) { return root.setTimeout(fn, ms); }

  /* ───────── Biçim yardımcıları ───────── */
  function num(n) { var r = Math.round(Math.abs(n) * 10) / 10; return String(r).replace('.', ','); }
  function pct(n) { return (Math.round((+n || 0) * 10) / 10).toFixed(1).replace('.', ',') + '%'; }
  function money(n) { n = Math.round(+n || 0); return '₺' + (n < 0 ? '−' : '') + Math.abs(n) + 'M'; }
  function arr(x) { return x == null ? [] : Array.isArray(x) ? x : [x]; }
  function safeCls(s) { return String(s || 'card').replace(/[^\w-]/g, ''); }
  function stateOk() { return !!(BG.state && BG.state.stats); }

  /* ───────── Rozetler, paragraflar ───────── */
  function chip(d, compact) {
    if (!d) return null;
    var n = Number(d.delta);
    if (!n || isNaN(n)) return null;
    var l = BG.label(d.key || ''), name = d.label || l.name || '', em = d.emoji || l.emoji || '';
    var good = (d.key === 'hasar' || d.key === 'rakip') ? n < 0 : n > 0;
    var txt = (n > 0 ? '+' : '−') + num(n);
    return h('span', { class: 'chip ' + (good ? 'up' : 'down') + (compact ? ' small' : ''), title: name },
      em ? em + ' ' : null, compact ? null : h('span', { text: name }), compact ? null : ' ', h('b', { text: txt }));
  }
  function deltaChips(deltas) {
    var box = h('div', { class: 'chips' });
    arr(deltas).forEach(function (d) { var c = chip(d, false); if (c) box.appendChild(c); });
    return box;
  }
  function fxChips(fx) {
    var box = h('div', { class: 'chips' });
    arr(fx).forEach(function (d) { var c = chip(d, true); if (c) box.appendChild(c); });
    return box.firstChild ? box : null;
  }
  function paragraphs(text) {
    var box = h('div', { class: 'prose' });
    arr(text).forEach(function (t) {
      String(t == null ? '' : t).split(/\n+/).forEach(function (line) { if (line.trim()) box.appendChild(h('p', { text: line })); });
    });
    return box;
  }

  /* ───────── Seçenekler ───────── */
  function runOption(opt) {
    if (!opt || opt.disabled) return;
    if (Date.now() < S.lockUntil) return;          // yeni sahnede yanlışlıkla çift tıklamayı yut
    if (opt.pick === 'district') {
      pickDistrict({ title: opt.label, exclude: opt.pickExclude }, function (id) { act(opt.id, { district: id }); });
    } else act(opt.id);
  }
  function optionEl(opt, num_, single) {
    var side = [];
    if (opt.tag) side.push(h('span', { class: 'chip tag small', text: opt.tag }));
    if (opt.cost) side.push(h('span', { class: 'cost', text: opt.cost }));
    if (opt.risk) side.push(h('span', { class: 'risk', title: 'Sonuç şansa bağlı', text: '🎲 Riskli' }));
    return h('button', {
      type: 'button', class: 'opt' + (single ? ' single' : '') + (opt.risk ? ' risky' : ''), disabled: !!opt.disabled,
      onclick: function () { runOption(opt); }
    },
      num_ ? h('span', { class: 'opt-key', text: num_ }) : null,
      opt.emoji ? h('span', { class: 'opt-emoji', text: opt.emoji }) : null,
      h('span', { class: 'opt-main' },
        h('span', { class: 'opt-label', text: opt.label || '…' }),
        opt.hint ? h('span', { class: 'opt-hint muted', text: opt.hint }) : null,
        opt.disabled && opt.why ? h('span', { class: 'opt-why', text: '⛔ ' + opt.why }) : null,
        fxChips(opt.fx)),
      side.length ? h('span', { class: 'opt-side' }, side) : null);
  }
  /** o = { numbered, big } */
  function optionButtons(options, o) {
    o = o || {};
    var list = arr(options).filter(Boolean), n = 0;
    var wrap = h('div', { class: 'opts' + (o.big ? ' big' : '') });
    var single = list.length === 1 && !list[0].hint && !list[0].cost && !list[0].tag && !(list[0].fx && list[0].fx.length);
    list.forEach(function (opt) { wrap.appendChild(optionEl(opt, o.numbered && !opt.disabled ? ++n : 0, single)); });
    return wrap;
  }

  /* ───────── Mahalle seçici ───────── */
  function districtInfo(id) {
    var ds = stateOk() && BG.state.districts && BG.state.districts[id], parts = [];
    if (!ds) return '';
    parts.push(ds.hasar > 0 ? '🏚️ Hasar ' + Math.round(ds.hasar) : '✔️ Hasarsız');
    parts.push('Destek ' + (ds.bonus > 0 ? '+' : ds.bonus < 0 ? '−' : '') + Math.abs(Math.round(ds.bonus)));
    return parts.join(' · ');
  }
  function mapUpdate() {
    try { if (ui.map && ui.map.update) ui.map.update(BG.state, S.view); } catch (e) { if (root.console) root.console.error(e); }
  }
  function closePick() {
    var p = S.pick;
    if (!p) return;
    if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
    S.pick = null; ui.pendingPick = null;
    mapUpdate();
  }
  function pickDistrict(opts, cb) {
    opts = opts || {};
    closePick();
    var ex = arr(opts.exclude), sheet, grid = h('div', { class: 'pick-grid' });
    BG.DISTRICTS.forEach(function (d) {
      var off = ex.indexOf(d.id) >= 0;
      grid.appendChild(h('button', { type: 'button', class: 'dbtn', disabled: off, onclick: function () { resolve(d.id); } },
        h('span', { class: 'e', text: d.emoji }), h('span', { class: 'n', text: d.name }),
        h('span', { class: 's', text: off ? 'Bu mahalle uygun değil' : districtInfo(d.id) })));
    });
    sheet = h('div', { class: 'pick-sheet', role: 'dialog', 'aria-label': 'Mahalle seç' },
      h('h3', { text: '📍 ' + (opts.title ? opts.title + ': ' : '') + 'Hangi mahalle?' }),
      h('p', { class: 'muted', text: 'Listeden ya da haritadan bir mahalle seç.' }),
      grid,
      h('button', { type: 'button', class: 'btn', onclick: closePick }, 'Vazgeç'));
    var layer = h('div', { class: 'pick-layer' }, sheet);
    S.pick = { el: layer, cb: cb, exclude: ex };
    ui.pendingPick = { exclude: ex };
    root.document.body.appendChild(layer);
    mapUpdate();
    var first = grid.querySelector('button:not(:disabled)');
    if (first && first.focus) first.focus();
    function resolve(id) { ui.resolvePick(id); }
  }
  ui.resolvePick = function (id) {
    var p = S.pick;
    if (!p || p.exclude.indexOf(id) >= 0 || !BG.byId(BG.DISTRICTS, id)) return false;
    var cb = p.cb;
    closePick();
    if (cb) cb(id);
    return true;
  };

  /* ───────── Pencere ───────── */
  function closeModal() {
    var m = S.modal;
    if (!m) return;
    if (m.el.parentNode) m.el.parentNode.removeChild(m.el);
    S.modal = null;
    if (m.prevFocus && m.prevFocus.focus) { try { m.prevFocus.focus(); } catch (e) { /* yok say */ } }
  }
  /** o = { title, body, actions: [{ label, kind, onClick }] } */
  function openModal(o) {
    closeModal();
    var acts = h('div', { class: 'm-actions' });
    (o.actions || [{ label: 'Tamam', kind: 'primary' }]).forEach(function (a) {
      acts.appendChild(h('button', {
        type: 'button', class: 'btn' + (a.kind === 'primary' ? ' btn-primary' : a.kind === 'accent' ? ' btn-accent' : ''),
        onclick: function () { closeModal(); if (a.onClick) a.onClick(); }
      }, a.label));
    });
    var overlay = h('div', { class: 'modal-overlay', onclick: function (e) { if (e.target === overlay) closeModal(); } },
      h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || '' }, h('h2', { text: o.title || '' }), o.body, acts));
    S.modal = { el: overlay, prevFocus: root.document.activeElement };
    root.document.body.appendChild(overlay);
    var b = overlay.querySelector('.m-actions button');
    if (b) b.focus();
  }
  var GUIDE = [
    ['🗓️ Mevsimler ve mesai', 'Oyun mevsim mevsim ilerler; bir başkanlık dönemi 12 mevsimdir. Her mevsim gazete okur, gündemdeki kararı verir, bazen afetle ya da kapını çalan bir vatandaşla uğraşırsın. Sonra Makam Odası\'nda 3 mesai puanını harcarsın: proje başlat, mahalle gez, vatandaşla konuş, hasarı onar. Sonra "Mevsimi bitir".'],
    ['📊 Şehir göstergeleri', 'Ulaşım, altyapı, çevre, ekonomi, güvenlik, sosyal yaşam ve afet hazırlığı zamanla aşınır; ihmal edersen düşer. Her gösterge, önemseyen seçmen grubunun desteğini belirler.'],
    ['🗳️ Gruplar ve mahalleler', 'Altı seçmen grubu vardır ve her mahalle bu grupların farklı bir karışımıdır. Oylar mahallede kazanılır: grup desteği, mahalle bonusu, hasar ve itibarın birlikte sandığı belirler. Anket göstergesinden rakibinin önünde mi geride mi olduğunu izle.'],
    ['🌪️ Afetler ve hazırlık', 'Deprem, sel, yangın, kar, kuraklık ve salgın her an gelebilir. Afet hazırlığın ve ilgili göstergelerin yüksekse zarar azalır. Hasar gören mahalleler oy kaybettirir; onarım için mesai ve bütçe harca.'],
    ['📣 Kampanya ve sözler', 'Dönemin son 3 mevsiminde kampanya seçenekleri açılır. Verdiğin sözler vaktinde tutulursa itibar kazandırır, tutulmazsa çok pahalıya patlar. Bütçen −350M altına inerse ya da itibarın sıfırlanırsa görevden alınırsın.'],
    ['🔥 Kaybedersen', 'Seçimi kaybetmek oyunun sonu değil: Muhalefet moduna geçersin. 8 mevsim boyunca görevler yap, kapı kapı dolaş, miting düzenle, görevdeki başkanın açığını yakala ve koltuğu geri al. Üst üste üç kayıp siyasete veda demektir; üç dönem başkanlık yaparsan final seni bekler.'],
    ['⌨️ Kısayollar', 'Karar ve mesaj ekranlarında 1-9 tuşları sıradaki seçeneği seçer; tek seçenek varsa Enter ya da Boşluk yeter. Esc pencereleri kapatır.']
  ];
  function showGuide() {
    var body = h('div', { class: 'guide' });
    GUIDE.forEach(function (g) { body.appendChild(h('h4', { text: g[0] })); body.appendChild(h('p', { text: g[1] })); });
    openModal({ title: 'Nasıl Oynanır?', body: body, actions: [{ label: 'Anladım', kind: 'primary' }] });
  }
  function showMenu() {
    var list = h('div', { class: 'menu-list' },
      h('button', { type: 'button', class: 'btn', onclick: function () { closeModal(); showGuide(); } }, '❓ Nasıl oynanır?'),
      h('button', { type: 'button', class: 'btn btn-accent', onclick: function () {
        closeModal();
        openModal({
          title: 'Yeni oyun?', body: h('p', { text: 'Başlık ekranına döneceksin. Yeni bir oyun başlatırsan mevcut kaydın üzerine yazılır. Emin misin?' }),
          actions: [{ label: 'Vazgeç' }, { label: 'Başlık ekranına dön', kind: 'accent', onClick: showTitle }]
        });
      } }, '🔄 Yeni oyun'));
    openModal({ title: 'Menü', body: list, actions: [{ label: 'Kapat' }] });
  }

  /* ───────── Bildirim ───────── */
  function toast(text, deltas) {
    var rootEl = S.el.toasts;
    if (!rootEl || (!text && !arr(deltas).length)) return;
    var t = h('div', { class: 'toast', role: 'status' }, h('div', { text: text || '' }), arr(deltas).length ? deltaChips(deltas) : null);
    function bye() {
      t.classList.add('out');
      later(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }
    t.addEventListener('click', bye);
    rootEl.appendChild(t);
    while (rootEl.children.length > 3) rootEl.removeChild(rootEl.firstChild);
    later(bye, 4500 + (arr(deltas).length ? 1500 : 0));
  }

  /* ───────── Çubuk listeleri (kalıcı elemanlar, animasyonlu) ───────── */
  function makeBarList(defs, key) {
    var rows = {}, ul = h('ul', { class: 'bars-list' });
    defs.forEach(function (d) {
      var fill = h('div', { class: 'bar-fill' }), val = h('span', { text: '0' }), dd = h('span', { class: 'stat-d' });
      var li = h('li', { class: 'stat', title: d.name },
        h('span', { class: 'stat-e', text: d.emoji }), h('span', { class: 'stat-n', text: d.name }),
        h('span', { class: 'stat-v' }, dd, val), h('div', { class: 'bar' }, fill));
      rows[d.id] = { li: li, fill: fill, val: val, dd: dd };
      ul.appendChild(li);
    });
    return {
      el: ul,
      update: function (values) {
        var prev = (S.prev && S.prev[key]) || null, now = {};
        defs.forEach(function (d) {
          var v = +(values && values[d.id]) || 0, r = rows[d.id], diff = prev && prev[d.id] != null ? v - prev[d.id] : 0;
          now[d.id] = v;
          r.val.textContent = String(Math.round(v));
          r.fill.style.width = Math.max(0, Math.min(100, v)) + '%';
          r.li.classList.remove('lvl-low', 'lvl-mid', 'lvl-high');
          r.li.classList.add(v < 35 ? 'lvl-low' : v < 60 ? 'lvl-mid' : 'lvl-high');
          if (Math.abs(diff) >= 0.5) {
            r.dd.textContent = (diff > 0 ? '▲' : '▼') + Math.round(Math.abs(diff));
            r.li.classList.remove('flash-up', 'flash-down');
            void r.li.offsetWidth;
            r.li.classList.add(diff > 0 ? 'flash-up' : 'flash-down');
          }
        });
        S.prev = S.prev || {};
        S.prev[key] = now;
      }
    };
  }

  /* ───────── Kabuk (bir kez kurulur) ───────── */
  function buildShell() {
    var app = $('app') || root.document.body;
    clear(app);

    // Başlık ekranı
    var nameIn = h('input', { type: 'text', id: 'in-name', maxlength: 24, autocomplete: 'off', value: 'Başkan' });
    var cityIn = h('input', { type: 'text', id: 'in-city', maxlength: 24, autocomplete: 'off', value: 'Çınarlı' });
    try {
      var sn = root.localStorage && root.localStorage.getItem('baskan_isim'), sc = root.localStorage && root.localStorage.getItem('baskan_sehir');
      if (sn) nameIn.value = sn;
      if (sc) cityIn.value = sc;
    } catch (e) { /* yok say */ }
    var contBtn = h('button', { type: 'button', class: 'btn', onclick: continueGame }, '📂 Devam Et');
    var word = h('h1', { class: 'wordmark', 'aria-label': 'Başkan' });
    'BAŞKAN'.split('').forEach(function (ch, i) { word.appendChild(h('span', { 'aria-hidden': 'true', style: { '--i': i }, text: ch })); });
    var titleEl = h('div', { class: 'title-screen', id: 'title-screen' },
      h('div', { class: 'title-main' },
        h('div', { class: 'title-kicker', text: 'Bir belediye başkanlığı oyunu' }),
        word,
        h('p', { class: 'tagline', text: 'Çukurlar, minibüsçüler, martılar ve bir şehir. Sen yönet, halk oylasın.' }),
        h('div', { class: 'card title-card' },
          h('div', { class: 'title-form' },
            h('label', null, 'Başkanın adı', nameIn),
            h('label', null, 'Şehrin adı', cityIn)),
          h('div', { class: 'title-actions' },
            h('button', { type: 'button', class: 'btn btn-primary', onclick: startGame }, '🗳️ Yeni Oyun'),
            contBtn,
            h('button', { type: 'button', class: 'btn btn-ghost', onclick: showGuide }, '❓ Nasıl Oynanır?'))),
        h('p', { class: 'title-foot', text: 'Tüm şehir, kişi ve olaylar kurgudur. Gerçek hayatla benzerlik tesadüftür; martılar hariç.' })));
    S.el.title = titleEl; S.el.cont = contBtn; S.el.nameIn = nameIn; S.el.cityIn = cityIn;
    // Şehir sahnesi: başlık ekranında arka plan, oyunda üst şerit (aynı eleman taşınır)
    S.el.stage = h('section', { class: 'stage', 'aria-label': 'Şehir manzarası' }, h('div', { class: 'stage-scroll' }, h('div', { id: 'map' })));
    titleEl.appendChild(S.el.stage);

    // Oyun kabuğu
    S.el.top = h('header', { class: 'topbar', id: 'topbar' });
    S.el.stats = h('section', { class: 'panel', id: 'stats-panel' });
    S.el.scene = h('div', { id: 'scene', 'aria-live': 'polite' });
    S.el.poll = h('section', { class: 'panel', id: 'poll-panel' });
    S.el.rival = h('section', { class: 'panel', id: 'rival-panel' });
    S.el.groups = h('section', { class: 'panel', id: 'groups-panel' });
    S.el.projs = h('section', { class: 'panel', id: 'proj-panel' });
    S.el.logList = h('ul', { class: 'log-list' });
    S.el.logSum = h('summary', { text: '📰 Haber Defteri' });
    S.el.log = h('details', { class: 'panel newslog', id: 'log-panel' }, S.el.logSum, S.el.logList);

    S.bars.stats = makeBarList(BG.STATS, 'stats');
    S.bars.groups = makeBarList(BG.GROUPS, 'groups');
    S.el.stats.appendChild(h('h3', { text: 'Şehir Göstergeleri' }));
    S.el.stats.appendChild(S.bars.stats.el);
    S.el.groups.appendChild(h('h3', { text: 'Seçmen Desteği' }));
    S.el.groups.appendChild(S.bars.groups.el);

    S.el.layout = h('div', { class: 'layout' },
      h('aside', { class: 'col-left' }, S.el.stats, S.el.projs),
      h('main', { class: 'col-center' }, S.el.scene),
      h('aside', { class: 'col-right' }, S.el.poll, S.el.groups, S.el.log));
    var gameEl = h('div', { id: 'game', hidden: true }, S.el.top, S.el.layout);
    S.el.game = gameEl; S.el.app = app;

    S.el.toasts = h('div', { class: 'toast-root', 'aria-live': 'polite' });
    app.appendChild(titleEl);
    app.appendChild(gameEl);
    app.appendChild(S.el.toasts);
  }

  /* ───────── Çerçeve (üst bar + yan sütunlar) ───────── */
  function sparkline(hist) {
    var pts = arr(hist).filter(function (x) { return x && typeof x.anket === 'number'; }).slice(-24);
    if (pts.length < 2) return null;
    var W = 120, H = 36, lo = 25, hi = 75, i, v;
    pts.forEach(function (p) { lo = Math.min(lo, p.anket); hi = Math.max(hi, p.anket); });
    function y(a) { return (H - 3 - ((a - lo) / (hi - lo)) * (H - 6)).toFixed(1); }
    var coords = pts.map(function (p, idx) { return (3 + idx * (W - 6) / (pts.length - 1)).toFixed(1) + ',' + y(p.anket); }).join(' ');
    var s = svg('svg', { class: 'spark', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', role: 'img', 'aria-label': 'Anket geçmişi' });
    s.appendChild(svg('line', { x1: 0, x2: W, y1: y(50), y2: y(50), stroke: '#bdb394', 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    s.appendChild(svg('polyline', { points: coords, fill: 'none', stroke: '#0f6b6c', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    return s;
  }
  function renderTop(st, sm) {
    var opp = st.mode === 'opposition', res = st.res || {}, apMax = C.AP_PER_TURN, pips = [], i;
    for (i = 0; i < Math.max(apMax, st.ap || 0); i++) pips.push(h('span', { class: 'pip' + (i < st.ap ? ' on' : '') }));
    var left = sm ? sm.turnsLeft : 0, se = (sm && sm.season) || { emoji: '', name: '' }, dots = [], camp = C.CAMPAIGN_TURNS || 3;
    for (i = 1; i <= (st.cycleLen || 0); i++)
      dots.push(h('i', { class: (i < st.turn ? 'done' : i === st.turn ? 'now' : '') + (i > st.cycleLen - camp ? ' camp' : '') }));
    var old = S.prevRes || {};
    function resEl(key, emoji, label, value, text, title) {
      var diff = old[key] != null ? value - old[key] : 0;
      return h('span', { class: 'res' + (key === 'butce' && value < 0 ? ' neg' : '') + (diff > 0 ? ' bump-up' : diff < 0 ? ' bump-down' : ''), title: title },
        h('span', { class: 'res-e', text: emoji }), h('span', { class: 'res-k', text: label }), h('b', { class: 'res-v', text: text }));
    }
    clear(S.el.top);
    append(S.el.top, [
      h('div', { class: 'tb-brand' }, h('span', { class: 'tb-seal', text: '🏛️' }),
        h('div', { class: 'tb-names' }, h('div', { class: 'tb-city', text: (st.city && st.city.name) || '' }),
          h('div', { class: 'tb-mayor' }, h('span', { class: 'badge' + (opp ? ' opp' : ''), text: opp ? 'Muhalefet' : 'Başkan' }), ' ', (st.player && st.player.name) || ''))),
      h('div', { class: 'tb-clock' },
        h('div', { class: 'tb-season' }, h('span', { class: 'tb-season-e', text: se.emoji }), se.name + ' · ' + (sm ? sm.year : 1) + '. yıl'),
        h('div', { class: 'tb-election' }, h('span', { class: 'turn-dots', role: 'img', 'aria-label': 'Dönem ilerleyişi ' + st.turn + '/' + st.cycleLen }, dots),
          h('span', { class: 'tb-left' + (left < camp ? ' hot' : ''), text: left > 0 ? 'Seçime ' + left + ' mevsim' : 'Seçim mevsimi!' }))),
      h('div', { class: 'tb-res' },
        resEl('butce', '💰', 'Bütçe', Math.round(res.butce || 0), money(res.butce), 'Belediye kasası (milyon ₺)'),
        resEl('itibar', '⭐', 'İtibar', Math.round(res.itibar || 0), String(Math.round(res.itibar || 0)), 'Kişisel güvenilirlik (0-100)'),
        opp ? resEl('fon', '🪙', 'Fon', Math.round(res.fon || 0), String(Math.round(res.fon || 0)), 'Kampanya fonu') : null,
        opp ? resEl('gonullu', '🙋', 'Gönüllü', Math.round(res.gonullu || 0), String(Math.round(res.gonullu || 0)), 'Gönüllüler') : null),
      h('div', { class: 'pips', title: 'Mesai puanı: ' + st.ap + '/' + apMax }, h('span', { class: 'pips-k', text: 'Mesai' }), pips),
      h('button', { type: 'button', class: 'tb-menu', 'aria-label': 'Menü', onclick: showMenu }, '☰')
    ]);
    S.prevRes = { butce: Math.round(res.butce || 0), itibar: Math.round(res.itibar || 0), fon: Math.round(res.fon || 0), gonullu: Math.round(res.gonullu || 0) };
  }
  function renderSide(st, sm) {
    var p = sm && sm.poll, rv = sm && sm.rival, me = p ? p.player : 0, ot = p ? p.other : 0, ri = p ? p.rival : 0, lead = p ? p.lead : 0;
    clear(S.el.poll);
    append(S.el.poll, [
      h('h3', { text: st.mode === 'opposition' ? 'Anket · koltuk rakipte' : 'Anket' }),
      h('div', { class: 'duel' },
        h('div', { class: 'duel-side me' }, h('div', { class: 'duel-face', text: '🙋' }), h('div', { class: 'duel-name', text: (st.player && st.player.name) || 'Sen' }), h('div', { class: 'duel-pct', text: pct(me) })),
        h('div', { class: 'duel-vs', text: 'VS' }),
        h('div', { class: 'duel-side rv' }, h('div', { class: 'duel-face', text: (rv && rv.emoji) || '🧑‍💼' }), h('div', { class: 'duel-name', text: rv ? rv.name : 'Rakip' }), h('div', { class: 'duel-pct', text: pct(ri) }))),
      h('div', { class: 'poll-bar' }, h('span', { class: 'p-me', style: { width: me + '%' } }), h('span', { class: 'p-ot', style: { width: ot + '%' } }), h('span', { class: 'p-rv', style: { width: ri + '%' } })),
      h('div', { class: 'poll-foot' },
        h('span', { class: 'poll-lead ' + (lead >= 0 ? 'ahead' : 'behind'), text: lead >= 0 ? '▲ ' + num(lead) + ' puan öndesin' : '▼ ' + num(lead) + ' puan geridesin' }),
        sparkline(st.history)),
      rv ? h('div', { class: 'rival-note' }, h('span', { class: 'rival-title', text: rv.title || '' }), rv.slogan ? h('span', { class: 'rival-slogan', text: '“' + rv.slogan + '”' }) : null) : null
    ]);
    S.bars.stats.update(st.stats);
    S.bars.groups.update(st.groups);

    clear(S.el.projs);
    var act_ = (st.projects && st.projects.active) || [], done = (st.projects && st.projects.done) || [];
    var pl = h('ul', { class: 'proj-list' });
    act_.forEach(function (p) {
      var d = BG.engine.projectDef && BG.engine.projectDef(p.id) || {}, dist = p.district && BG.byId(BG.DISTRICTS, p.district);
      pl.appendChild(h('li', null, h('span', { text: d.emoji || '🏗️' }), h('span', { text: (d.name || p.id) + (dist ? ' (' + dist.name + ')' : '') }), h('span', { class: 'left', text: p.left + ' mevsim' })));
    });
    append(S.el.projs, [h('h3', { text: 'Şantiyeler' }),
      act_.length ? pl : h('p', { class: 'muted', text: 'Şu an süren proje yok.' }),
      h('p', { class: 'proj-done' }, h('b', { text: String(done.length) }), ' proje tamamlandı')]);

    clear(S.el.logList);
    var log = arr(st.log), icon = { proje: '🏗️', karar: '🗳️', kriz: '🚨', donem: '🏛️' };
    S.el.logSum.textContent = '📰 Haber Defteri (' + log.length + ')';
    log.forEach(function (l) { S.el.logList.appendChild(h('li', null, h('span', { class: 'n', text: icon[l.kind] || '•' }), h('span', { text: l.text }))); });
    if (!log.length) S.el.logList.appendChild(h('li', { class: 'muted', text: 'Henüz haber yok.' }));
  }
  function updateChrome() {
    var st = BG.state;
    if (!stateOk()) return;
    var sm = null;
    try { sm = BG.engine.summary(st); } catch (e) { if (root.console) root.console.error(e); }
    root.document.documentElement.setAttribute('data-mode', st.mode || 'mayor');
    try { renderTop(st, sm); renderSide(st, sm); } catch (e2) { if (root.console) root.console.error(e2); }
  }

  /* ───────── Sahne çizimi ───────── */
  function listRows(list) {
    var ul = h('ul', { class: 'rows' });
    arr(list).forEach(function (r) {
      if (!r) return;
      ul.appendChild(h('li', { class: 'row' },
        h('div', { class: 'row-e', text: r.emoji || '•' }),
        h('div', null, r.title ? h('div', { class: 'row-t', text: r.title }) : null, r.text ? h('div', { class: 'row-x', text: r.text }) : null,
          arr(r.deltas).length ? deltaChips(r.deltas) : null)));
    });
    return ul.firstChild ? ul : null;
  }
  function meterEl(m) {
    var max = +m.max || 100, v = +m.value || 0, t = m.target != null ? +m.target : null;
    var met = t != null && v >= t;
    return h('div', { class: 'meter' + (met ? ' met' : '') },
      h('div', { class: 'meter-h' }, h('span', { text: m.label || '' }), h('span', { text: Math.round(v) + ' / ' + Math.round(max) + (t != null ? ' · hedef ' + Math.round(t) : '') })),
      h('div', { class: 'bar big' }, h('div', { class: 'bar-fill', style: { width: Math.max(0, Math.min(100, v / max * 100)) + '%' } }),
        t != null ? h('div', { class: 'meter-target', style: { left: Math.max(0, Math.min(100, t / max * 100)) + '%' } }) : null));
  }
  function barsEl(bars) {
    var box = h('div', { class: 'bars-block' });
    arr(bars).forEach(function (b) {
      var max = +b.max || 100, v = +b.value || 0;
      box.appendChild(h('div', null,
        h('div', { class: 'b-h' }, h('span', { text: (b.emoji ? b.emoji + ' ' : '') + (b.label || '') }), h('span', { text: Math.round(v) + '/' + Math.round(max) })),
        h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: Math.max(0, Math.min(100, v / max * 100)) + '%' } }))));
    });
    return box;
  }
  function whoChips(view) {
    var kids = [], d = view.district && BG.byId(BG.DISTRICTS, view.district), sp = view.speaker;
    if (sp && !view._avatar) kids.push(h('span', { class: 'chip speaker', text: (sp.emoji || '🗣️') + ' ' + (sp.name || '') + (sp.role ? ' · ' + sp.role : '') }));
    if (d) kids.push(h('span', { class: 'chip place', text: d.emoji + ' ' + d.name }));
    return kids.length ? h('div', { class: 'who' }, kids) : null;
  }
  /** Genel kart. variant: 'event' → avatar + büyük seçenekler, sonuç ekranı; extra: seçeneklerden önce eklenecek düğüm */
  function buildCard(view, api, variant, extra) {
    var ev = variant === 'event', d = view.data || {}, resolved = ev && d.resolved;
    var card = h('article', { class: 'card ' + (ev ? 'event-card' : 'generic-card') + (resolved ? ' resolved' : '') });
    var sp = view.speaker;
    view = Object.create(view); view._avatar = ev && !!sp;
    append(card, [
      view.kicker ? h('div', { class: 'kicker', text: view.kicker }) : null,
      h('h2', { class: 'title', text: view.title || '' }),
      ev && sp ? h('div', { class: 'avatar-row' }, h('div', { class: 'avatar', text: sp.emoji || '🗣️' }),
        h('div', null, h('div', { class: 'nm', text: sp.name || '' }), h('div', { class: 'rl', text: sp.role || '' }))) : null,
      whoChips(view)
    ]);
    if (resolved) {
      if (d.question) card.appendChild(h('details', { class: 'question' }, h('summary', { text: 'Gündem maddesini hatırla' }), h('p', { text: d.question })));
      if (d.chosen) card.appendChild(h('div', { class: 'chosen-box' }, h('div', { class: 'lbl', text: 'Kararın' }), h('div', { text: d.chosen })));
    }
    if (view.text) {
      var pr = paragraphs(view.text);
      if (ev && !resolved) pr.classList.add('event-text');
      card.appendChild(pr);
    }
    append(card, [
      view.meter ? meterEl(view.meter) : null,
      view.bars && view.bars.length ? barsEl(view.bars) : null,
      listRows(view.list),
      arr(view.deltas).length ? deltaChips(view.deltas) : null,
      extra || null
    ]);
    arr(view.groups).forEach(function (g) {
      if (!g || !arr(g.options).length) return;
      card.appendChild(h('h3', { class: 'sub-h', text: (g.emoji ? g.emoji + ' ' : '') + (g.title || '') }));
      card.appendChild(api.optionButtons(g.options));
    });
    card.appendChild(optionButtons(view.options, { numbered: true, big: ev }));
    return card;
  }

  function renderCard(view, el, api) { el.appendChild(buildCard(view, api, 'card')); }
  function renderMsg(view, el, api) { el.appendChild(buildCard(view, api, 'msg')); }
  function renderEvent(view, el, api) { el.appendChild(buildCard(view, api, 'event')); }
  function renderEnding(view, el, api) {
    var d = view.data || {}, tiles = h('div', { class: 'stat-tiles' });
    function tile(v, l) { tiles.appendChild(h('div', { class: 'tile' }, h('b', { text: String(v) }), h('span', { text: l }))); }
    if (d.score != null) tile(d.score, '🏆 Miras puanı');
    if (d.rank) tile(d.rank, '🎖️ Unvan');
    if (d.wins != null) tile(d.wins - 1 < 0 ? 0 : d.wins - 1, '✅ Kazanılan seçim');
    if (d.losses != null) tile(d.losses, '❌ Kaybedilen seçim');
    if (d.projects != null) tile(d.projects, '🏗️ Proje');
    arr(d.stats).forEach(function (s) { tile(s.value, (s.emoji || '') + ' ' + (s.label || '')); });
    el.appendChild(buildCard(view, api, 'card', tiles));
  }

  function renderReport(view, el, api) {
    var d = view.data || {}, st = BG.state, city = (st && st.city && st.city.name) || 'Şehir', tw = h('div', { class: 'tweets' });
    arr(d.tweets).forEach(function (t) {
      if (!t) return;
      tw.appendChild(h('div', { class: 'tweet' }, h('div', { class: 'tw-user', text: '💬 @' + String(t.user || 'vatandas').replace(/^@/, '') }), h('p', { text: t.text || '' })));
    });
    var card = h('article', { class: 'card paper report' });
    append(card, [
      h('div', { class: 'masthead' },
        h('div', { class: 'mast-line' }, h('span', { text: view.kicker || '' }), h('span', { text: d.turn ? 'Dönem ilerleyişi: ' + d.turn + '/' + (d.cycleLen || '?') : '' })),
        h('h2', { class: 'mast-name', text: city + ' Postası' })),
      h('h1', { class: 'headline', text: view.title || '' }),
      view.text ? paragraphs(view.text) : null,
      tw.firstChild ? [h('h3', { class: 'sub-h', text: '🗣️ Halkın Sesi' }), tw] : null,
      view.list && view.list.length ? [h('h3', { class: 'sub-h', text: '🏛️ Belediye Defteri' }), listRows(view.list)] : null,
      arr(view.deltas).length ? deltaChips(view.deltas) : null,
      view.meter ? meterEl(view.meter) : null,
      view.bars && view.bars.length ? barsEl(view.bars) : null,
      optionButtons(view.options, { numbered: true })
    ]);
    el.appendChild(card);
  }

  /* ----- Makam Odası ----- */
  function projCard(opt) {
    var meta = [];
    if (opt.tag) meta.push(h('span', { class: 'chip tag small', text: opt.tag }));
    if (opt.cost) meta.push(h('span', { text: opt.cost }));
    return h('button', { type: 'button', class: 'pcard', disabled: !!opt.disabled, onclick: function () { runOption(opt); } },
      h('div', { class: 'pc-top' }, h('span', { class: 'e', text: opt.emoji || '📌' }), h('span', { text: opt.label || '…' })),
      meta.length ? h('div', { class: 'pc-meta' }, meta) : null,
      opt.hint ? h('div', { class: 'pc-hint', text: opt.hint }) : null,
      fxChips(opt.fx),
      opt.disabled && opt.why ? h('div', { class: 'pc-why', text: '⛔ ' + opt.why }) : null);
  }
  function pipsEl(ap, max) {
    var pips = [], i;
    for (i = 0; i < Math.max(max, ap); i++) pips.push(h('span', { class: 'pip' + (i < ap ? ' on' : '') }));
    return h('span', { class: 'pips', title: 'Mesai puanı' }, '⚡ Mesai ', pips);
  }
  function renderHub(view, el, api) {
    var d = view.data || {}, groups = arr(view.groups).filter(function (g) { return g && arr(g.options).length; });
    var apMax = d.apMax || C.AP_PER_TURN, ap = d.ap != null ? d.ap : (BG.state ? BG.state.ap : 0);
    var card = h('article', { class: 'card hub' });
    append(card, [
      h('div', { class: 'hub-head' }, h('div', null, view.kicker ? h('div', { class: 'kicker', text: view.kicker }) : null, h('h2', { class: 'title', text: view.title || 'Makam Odası' })),
        pipsEl(ap, apMax)),
      view.text ? paragraphs(view.text) : null,
      arr(view.deltas).length ? deltaChips(view.deltas) : null
    ]);
    var act_ = arr(d.active);
    if (act_.length) {
      var strip = h('div', { class: 'active-strip' });
      act_.forEach(function (p) {
        var dist = p.district && BG.byId(BG.DISTRICTS, p.district);
        strip.appendChild(h('span', { class: 'chip', title: 'Süren proje' }, (p.emoji || '🏗️') + ' ' + (p.name || p.id) + (dist ? ' (' + dist.name + ')' : '') + ' · ' + p.left + ' mevsim'));
      });
      card.appendChild(strip);
    }
    if (groups.length) {
      var cur = BG.byId(groups, S.hubTab) || groups[0];
      S.hubTab = cur.id;
      var tabs = h('div', { class: 'tabs', role: 'tablist' });
      groups.forEach(function (g) {
        tabs.appendChild(h('button', { type: 'button', role: 'tab', class: 'tab', 'aria-selected': g.id === cur.id ? 'true' : 'false',
          onclick: function () { S.hubTab = g.id; rerenderScene(); } }, (g.emoji || '') + ' ' + (g.title || g.id), h('span', { class: 'n', text: '(' + g.options.length + ')' })));
      });
      card.appendChild(tabs);
      var opts = cur.options.filter(Boolean), tags = [];
      opts.forEach(function (o) { if (o.tag && tags.indexOf(o.tag) < 0) tags.push(o.tag); });
      if (cur.id === 'proje' || (opts.length > 8 && tags.length > 1)) {
        var sel = S.hubFilter[cur.id] || '', filt = h('div', { class: 'filters', role: 'group', 'aria-label': 'Kategori süzgeci' });
        if (sel && tags.indexOf(sel) < 0) sel = S.hubFilter[cur.id] = '';
        [''].concat(tags).forEach(function (t) {
          filt.appendChild(h('button', { type: 'button', class: 'fchip', 'aria-pressed': sel === t ? 'true' : 'false',
            onclick: function () { S.hubFilter[cur.id] = t; rerenderScene(); } }, t || 'Tümü'));
        });
        card.appendChild(filt);
        if (sel) opts = opts.filter(function (o) { return o.tag === sel; });
      }
      var grid = h('div', { class: 'pgrid', role: 'tabpanel' });
      opts.forEach(function (o) { grid.appendChild(projCard(o)); });
      card.appendChild(opts.length ? grid : h('div', { class: 'empty', text: 'Bu kategoride şu an seçenek yok.' }));
    }
    var end = h('div', { class: 'endbar' }, h('div', null, pipsEl(ap, apMax), ap < 1 ? h('div', { class: 'muted', style: { fontSize: '13px' }, text: 'Mesai bitti; mevsimi kapatabilirsin.' }) : null));
    var btns = h('div', { class: 'btns' });
    arr(view.options).forEach(function (o, i, all) {
      if (!o) return;
      btns.appendChild(h('button', { type: 'button', class: 'btn ' + (i === all.length - 1 ? 'btn-accent' : ''), disabled: !!o.disabled, title: o.hint || o.why || null,
        onclick: function () { runOption(o); } }, o.label || 'Devam'));
    });
    end.appendChild(btns);
    card.appendChild(end);
    el.appendChild(card);
  }

  /* ───────── Çizim akışı ───────── */
  function sigOf(v) {
    var d = v.data || {};
    return [v.type, v.title || '', v.kicker || '', d.resolved ? 'R' : '', d.turn || ''].join('|');
  }
  function renderScene(view, keep) {
    var sig = sigOf(view), isNew = !keep && sig !== S.sig;
    S.sig = sig;
    var tone = ['good', 'danger', 'election'].indexOf(view.tone) >= 0 ? view.tone : 'normal';
    var wrap = h('div', { class: 'scene tone-' + tone + ' type-' + safeCls(view.type) + (isNew ? ' enter' : '') });
    var fn = renderers[view.type] || renderers.card;
    try { fn(view, wrap, api); }
    catch (e) {
      if (root.console) root.console.error('Sahne çizilemedi (' + view.type + ')', e);
      clear(wrap);
      try { renderers.card(view, wrap, api); }
      catch (e2) {
        clear(wrap);
        wrap.appendChild(h('article', { class: 'card' }, h('h2', { class: 'title', text: view.title || 'Bir şeyler ters gitti' }),
          optionButtons(view.options)));
      }
    }
    clear(S.el.scene);
    S.el.scene.appendChild(wrap);
    if (isNew) {
      S.lockUntil = Date.now() + 280;
      try {
        var r = S.el.scene.getBoundingClientRect();
        if (r.top < 0 || r.top > (root.innerHeight || 800) * 0.6) root.window.scrollTo(0, Math.max(0, r.top + (root.pageYOffset || 0) - 64));
      } catch (e3) { /* yok say */ }
    }
  }
  function showGame() {
    if (S.inGame) return;
    S.inGame = true;
    S.el.game.insertBefore(S.el.stage, S.el.layout);
    S.el.title.hidden = true; S.el.game.hidden = false;
    S.el.app.classList.remove('at-title');
    if (ui.map && ui.map.mount && !S.mapMounted) mountMap();
  }
  function showTitle() {
    closePick(); closeModal();
    S.inGame = false; S.view = null; S.sig = null; S.prev = null; S.prevRes = null;
    S.el.title.appendChild(S.el.stage);
    S.el.app.classList.add('at-title');
    S.el.game.hidden = true; S.el.title.hidden = false;
    try { if (ui.map && ui.map.update) ui.map.update(null, null); } catch (e) { /* yok say */ }
    S.el.cont.hidden = !(BG.engine && BG.engine.hasSave && BG.engine.hasSave());
    root.document.documentElement.setAttribute('data-mode', 'mayor');
    clear(S.el.scene);
  }
  function mountMap() {
    try { if (ui.map && ui.map.mount) { ui.map.mount($('map')); S.mapMounted = true; } } catch (e) { if (root.console) root.console.error(e); }
  }
  function render(view) {
    if (!view) return showTitle();
    showGame();
    S.view = view;
    updateChrome();
    renderScene(view, false);
    mapUpdate();
  }
  function rerenderScene() { if (S.view) renderScene(S.view, true); }
  function act(optId, payload) {
    var v;
    try { v = BG.engine.act(optId, payload); }
    catch (e) { if (root.console) root.console.error(e); toast('Bir şeyler ters gitti. Sayfayı yenilersen kayıt kaldığın yerden devam eder.'); return; }
    if (!v) return showTitle();
    render(v);
    if (v.flash) toast(v.flash.text, v.flash.deltas);
  }
  function refresh() {
    var v = null;
    try { v = BG.engine.view(); } catch (e) { if (root.console) root.console.error(e); }
    render(v);
  }

  /* ───────── Başlık ekranı eylemleri ───────── */
  function startGame() {
    var pn = (S.el.nameIn.value || '').trim() || 'Başkan', cn = (S.el.cityIn.value || '').trim() || 'Çınarlı';
    try { root.localStorage.setItem('baskan_isim', pn); root.localStorage.setItem('baskan_sehir', cn); } catch (e) { /* yok say */ }
    S.prev = null; S.hubTab = null; S.hubFilter = {}; S.sig = null;
    try { BG.engine.newGame({ playerName: pn, cityName: cn }); } catch (e2) { if (root.console) root.console.error(e2); toast('Oyun başlatılamadı.'); return; }
    refresh();
  }
  function continueGame() {
    var ok = false;
    try { ok = BG.engine.load(); } catch (e) { ok = false; }
    if (!ok) { toast('Kayıt okunamadı.'); S.el.cont.hidden = true; return; }
    S.prev = null; S.hubTab = null; S.sig = null;
    refresh();
  }

  /* ───────── Klavye ───────── */
  function onKey(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { if (S.pick) closePick(); else if (S.modal) closeModal(); return; }
    if (S.pick || S.modal || !S.inGame || e.repeat) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var v = S.view;
    if (!v || v.type === 'hub' || v.type === 'oppHub') return;   // makam odasında yanlışlıkla mevsim bitmesin
    var opts = arr(v.options).filter(function (o) { return o && !o.disabled; });
    if (/^[1-9]$/.test(e.key)) {
      var o = opts[+e.key - 1];
      if (o) { e.preventDefault(); runOption(o); }
    } else if ((e.key === 'Enter' || e.key === ' ') && opts.length === 1 && tag !== 'BUTTON' && tag !== 'A' && tag !== 'SUMMARY') {
      e.preventDefault(); runOption(opts[0]);
    }
  }

  /* ───────── Dışa açılan API ───────── */
  var api = {
    act: act,
    optionButtons: optionButtons,
    deltaChips: deltaChips,
    paragraphs: paragraphs,
    pickDistrict: pickDistrict
  };
  Object.defineProperty(api, 'state', { get: function () { return BG.state; } });
  Object.defineProperty(api, 'summary', { get: function () { try { return stateOk() ? BG.engine.summary(BG.state) : null; } catch (e) { return null; } } });

  ui.h = h;
  ui.register = function (type, fn) { if (type && typeof fn === 'function') renderers[type] = fn; };
  ui.optionButtons = optionButtons;
  ui.deltaChips = deltaChips;
  ui.paragraphs = paragraphs;
  ui.pickDistrict = pickDistrict;
  ui.toast = toast;
  ui.refresh = refresh;
  ui.act = act;
  ui.api = api;
  ui.modal = openModal;

  ui.register('card', renderCard);
  ui.register('msg', renderMsg);
  ui.register('event', renderEvent);
  ui.register('mission', renderEvent);
  ['vaat', 'tartisma', 'onSecim', 'yuzlesme'].forEach(function (t) { ui.register(t, renderEvent); });
  ui.register('report', renderReport);
  ui.register('oppReport', renderReport);
  ui.register('hub', renderHub);
  ui.register('oppHub', renderHub);
  ui.register('ending', renderEnding);

  function boot() {
    buildShell();
    mountMap();
    root.document.addEventListener('keydown', onKey);
    showTitle();
  }
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
