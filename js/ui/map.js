/* BAŞKAN — yaşayan şehir panoraması (BG.ui.map).
 * Soldan sağa: Bağlar · Yokuşbaşı · Çarşı · Kampüs · Sanayi · Sahil. Çizim satır içi SVG; etiketler, rozetler ve tıklama HTML katmanında.
 * Durumu yansıtır: mevsim (gökyüzü, yaprak, kar), mesai (güneşin konumu), mod, hasar (duman/alev/çatlak), yerel destek, projeler,
 * inşaat (vinç), çevre (ağaç yoğunluğu, sis), ulaşım (otobüs sayısı), sosyal yaşam (bayraklar), vurgulanan mahalle ve mahalle seçimi.
 */
(function (root) {
  'use strict';
  var BG = root.BG;
  BG.ui = BG.ui || {};
  var doc = root.document, NS = 'http://www.w3.org/2000/svg';
  var ORDER = ['baglar', 'yokusbasi', 'carsi', 'kampus', 'sanayi', 'sahil'];
  var W = 1200, H = 300, G = 236, COL = 200;
  var RISK = { deprem: 'Deprem', sel: 'Sel', yangin: 'Yangın', kar: 'Kar fırtınası', kuraklik: 'Kuraklık', salgin: 'Salgın' };
  var INK = '#17313a';
  var P = { cream: '#fdf6e3', sand: '#ecd9b0', ochre: '#e3b25a', terra: '#d9744f', rose: '#e8ab9c', blue: '#8fb3c7', teal: '#3f8f8f',
    deep: '#1f5f66', brick: '#b5523b', slate: '#6f8894', roof: '#c2553f', brown: '#7a4a3a', glass: '#c9e7ee', white: '#ffffff', tomato: '#e2543a', gold: '#e9b23c' };
  var M = { el: null, root: null, cols: {}, art: {}, pop: null, open: null, st: null, strip: null, banner: null, scroller: null };

  function h() { return BG.ui.h.apply(null, arguments); }
  function s(tag, attrs, parent) {
    var e = doc.createElementNS(NS, tag), k;
    for (k in (attrs || {})) e.setAttribute(k, String(attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  }
  function g(parent, cls, tx) { var a = {}; if (cls) a['class'] = cls; if (tx != null) a.transform = 'translate(' + tx + ' 0)'; return s('g', a, parent); }
  function rect(p, x, y, w, hh, fill, ex) { var a = { x: x, y: y, width: w, height: hh, fill: fill }, k; for (k in (ex || {})) a[k] = ex[k]; return s('rect', a, p); }
  function poly(p, pts, fill, ex) { var a = { points: pts, fill: fill }, k; for (k in (ex || {})) a[k] = ex[k]; return s('polygon', a, p); }
  function circ(p, cx, cy, r, fill, ex) { var a = { cx: cx, cy: cy, r: r, fill: fill }, k; for (k in (ex || {})) a[k] = ex[k]; return s('circle', a, p); }
  function path(p, d, fill, ex) { var a = { d: d, fill: fill || 'none' }, k; for (k in (ex || {})) a[k] = ex[k]; return s('path', a, p); }
  var NOLINE = { stroke: 'none' };

  /* ───────── Çizim parçaları ───────── */
  function wins(p, x, y, cols, rows, dx, dy, w, hh) {
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++)
      rect(p, x + c * dx, y + r * dy, w || 5, hh || 6, P.glass, { 'class': 'win' + ((r * 3 + c * 5) % 4 === 0 ? ' lit' : ''), stroke: 'none', rx: 1 });
  }
  function snow(p, x, y, w) { rect(p, x - 1, y - 3, w + 2, 5, '#fff', { 'class': 'snowcap', rx: 2.5, stroke: 'none' }); }
  function tree(p, x, y, r, cls) {
    var t = g(p, 'tree ' + (cls || ''));
    rect(t, x - 1.5, y - r * 0.6, 3, r * 0.9 + 4, P.brown, NOLINE);
    circ(t, x, y - r, r, 'var(--leaf)', { 'class': 'leaf' });
    circ(t, x - r * 0.35, y - r * 1.25, r * 0.28, 'var(--bloom)', { 'class': 'bloom', stroke: 'none' });
    circ(t, x + r * 0.4, y - r * 0.8, r * 0.24, 'var(--bloom)', { 'class': 'bloom', stroke: 'none' });
    return t;
  }
  function pine(p, x, y, hh) {
    var t = g(p, 'tree pine');
    rect(t, x - 1.5, y - 5, 3, 7, P.brown, NOLINE);
    poly(t, (x - hh * 0.36) + ',' + (y - 4) + ' ' + x + ',' + (y - hh) + ' ' + (x + hh * 0.36) + ',' + (y - 4), 'var(--pine)');
    poly(t, (x - hh * 0.2) + ',' + (y - hh * 0.72) + ' ' + x + ',' + (y - hh) + ' ' + (x + hh * 0.2) + ',' + (y - hh * 0.72), '#fff', { 'class': 'snowcap', stroke: 'none' });
    return t;
  }
  function palm(p, x, y, hh) {
    var t = g(p, 'tree palm');
    path(t, 'M' + x + ' ' + y + ' q3 ' + (-hh / 2) + ' 0 ' + (-hh), 'none', { stroke: P.brown, 'stroke-width': 3, 'stroke-linecap': 'round' });
    [-34, -14, 10, 32].forEach(function (a) {
      path(t, 'M' + x + ' ' + (y - hh) + ' q' + (a * 0.5) + ' -10 ' + a + ' 2', 'none', { stroke: 'var(--pine)', 'stroke-width': 3.2, 'stroke-linecap': 'round' });
    });
    return t;
  }
  /** Apartman: taban y'den yukarı. o = { roof: 'flat'|'gable', dish, balc } */
  function block(p, x, w, top, base, color, o) {
    o = o || {};
    rect(p, x, top, w, base - top, color);
    if (o.roof === 'gable') poly(p, (x - 2) + ',' + top + ' ' + (x + w / 2) + ',' + (top - 10) + ' ' + (x + w + 2) + ',' + top, P.roof);
    else rect(p, x - 1.5, top - 3, w + 3, 4, P.brown, { rx: 1 });
    var cols = Math.max(2, Math.floor((w - 6) / 9)), rows = Math.max(2, Math.floor((base - top - 12) / 13));
    wins(p, x + (w - (cols - 1) * 9 - 5) / 2, top + 7, cols, rows, 9, 13);
    if (o.balc) for (var r = 0; r < rows; r += 2) rect(p, x + 2, top + 14 + r * 13, w - 4, 1.6, INK, { stroke: 'none', opacity: 0.55 });
    if (o.dish) { circ(p, x + w - 6, top - 6, 3.2, '#e9eef0'); }
    snow(p, x, o.roof === 'gable' ? top - 6 : top - 3, w);
  }

  function drawBaglar(a) {
    path(a, 'M-30 ' + G + ' C0 150 70 118 118 150 S186 196 232 ' + G + ' Z', 'var(--hill)', { 'class': 'hillfill' });
    path(a, 'M40 ' + G + ' C70 190 120 176 160 196 S200 222 214 ' + G + ' Z', 'var(--hill2)', { 'class': 'hillfill', stroke: 'none' });
    pine(a, 16, 204, 34); pine(a, 32, 196, 40); pine(a, 50, 190, 30); pine(a, 70, 168, 26).setAttribute('class', 'tree pine eco1'); pine(a, 150, 170, 28).setAttribute('class', 'tree pine eco2');
    for (var r = 0; r < 3; r++) for (var c = 0; c < 9; c++)
      circ(a, 64 + c * 12 + r * 5, 208 + r * 10 - c * 0.6, 3.3, 'var(--vine)', { 'class': 'vine', stroke: 'none' });
    rect(a, 106, 166, 26, 17, P.cream); poly(a, '103,166 119,154 135,166', P.roof); rect(a, 116, 173, 6, 10, P.brown, NOLINE); rect(a, 126, 156, 4, 7, P.brick); snow(a, 104, 160, 30);
    rect(a, 168, 204, 20, 13, P.sand); poly(a, '166,204 178,195 190,204', P.roof); snow(a, 167, 199, 22);
    path(a, 'M6 ' + (G - 1) + ' h188', 'none', { stroke: P.brown, 'stroke-width': 1.4, 'stroke-dasharray': '2 7' });
  }
  function drawYokus(a) {
    poly(a, '0,' + G + ' 0,196 56,170 132,180 200,206 200,' + G, 'var(--ground2)', { 'class': 'slope' });
    block(a, 8, 30, 116, 194, P.rose, { balc: true });
    block(a, 42, 34, 88, 176, P.ochre, { balc: true, dish: true });
    block(a, 80, 30, 104, 176, P.blue, { roof: 'gable' });
    block(a, 114, 36, 120, 184, P.sand, { balc: true, dish: true });
    block(a, 154, 32, 140, 200, P.terra, { roof: 'gable' });
    path(a, 'M76 96 Q78 104 80 100', 'none', { stroke: INK, 'stroke-width': 0.8 });
    [[77.2, 99, P.tomato], [78.6, 101, P.gold]].forEach(function (l) { rect(a, l[0], l[1], 1.6, 3.4, l[2], NOLINE); });
    path(a, 'M90 ' + G + ' l9 -7 l-7 -7 l9 -7 l-7 -7 l9 -7 l-6 -6', 'none', { stroke: INK, 'stroke-width': 1.6, 'stroke-linejoin': 'round', opacity: 0.6 });
    tree(a, 190, 212, 9, 'eco1'); tree(a, 6, 200, 8, 'eco2');
  }
  function drawCarsi(a) {
    // Belediye binası
    rect(a, 12, G - 40, 70, 40, P.cream);
    poly(a, '8,' + (G - 40) + ' 47,' + (G - 58) + ' 86,' + (G - 40), P.sand);
    [18, 31, 44, 57, 70].forEach(function (x) { rect(a, x, G - 36, 5, 32, '#fff', { 'stroke-width': 1 }); });
    rect(a, 8, G - 5, 78, 5, P.sand);
    rect(a, 42, G - 22, 10, 18, P.brown, NOLINE);
    path(a, 'M47 ' + (G - 58) + ' v-24', 'none', { stroke: INK, 'stroke-width': 1.6 });
    path(a, 'M47 ' + (G - 82) + ' q8 -3 16 0 v10 q-8 -3 -16 0 Z', 'var(--flag)', { 'class': 'flag' });
    snow(a, 12, G - 43, 70);
    // Saat kulesi
    rect(a, 98, G - 106, 20, 106, P.sand);
    poly(a, '95,' + (G - 106) + ' 108,' + (G - 130) + ' 121,' + (G - 106), P.roof);
    circ(a, 108, G - 132, 2.4, P.gold);
    circ(a, 108, G - 86, 7.5, '#fff');
    path(a, 'M108 ' + (G - 86) + ' v-5', 'none', { stroke: INK, 'stroke-width': 1.4, 'stroke-linecap': 'round' });
    path(a, 'M108 ' + (G - 86) + ' v-6.5', 'none', { stroke: P.tomato, 'stroke-width': 1.1, 'stroke-linecap': 'round', 'class': 'clockhand' });
    wins(a, 105.5, G - 68, 1, 3, 0, 16, 5, 8);
    // Kapalı çarşı
    rect(a, 124, G - 30, 72, 30, P.terra);
    for (var i = 0; i < 6; i++) path(a, 'M' + (124 + i * 12) + ' ' + (G - 30) + ' h12 v5 q-6 6 -12 0 Z', i % 2 ? P.cream : P.tomato);
    [130, 152, 174].forEach(function (x) { path(a, 'M' + x + ' ' + G + ' v-13 q7 -8 14 0 v13 Z', INK, { opacity: 0.75, stroke: 'none' }); });
    [[146, P.gold], [149.5, P.tomato], [168, '#6fae5c'], [171.5, P.gold]].forEach(function (c) { circ(a, c[0], G - 2.6, 2.2, c[1], NOLINE); });
    snow(a, 124, G - 33, 72);
    // Bayraklar (sosyal yaşam yüksekken)
    var b = g(a, 'bunting');
    path(b, 'M118 ' + (G - 76) + ' Q150 ' + (G - 40) + ' 194 ' + (G - 36), 'none', { stroke: INK, 'stroke-width': 0.9 });
    [[128, 65, P.tomato], [140, 56, P.gold], [152, 49, P.teal], [164, 44, P.tomato], [176, 40, P.gold], [187, 37, P.teal]].forEach(function (f) {
      poly(b, (f[0] - 3) + ',' + (G - f[1]) + ' ' + (f[0] + 3) + ',' + (G - f[1] + 1) + ' ' + f[0] + ',' + (G - f[1] + 8), f[2], { 'stroke-width': 0.7 });
    });
  }
  function drawKampus(a) {
    tree(a, 14, G - 2, 11); tree(a, 186, G - 2, 10, 'eco1'); tree(a, 136, G - 2, 8, 'eco2');
    rect(a, 28, G - 38, 104, 38, P.cream);
    wins(a, 34, G - 31, 3, 2, 9, 13); wins(a, 104, G - 31, 3, 2, 9, 13);
    path(a, 'M64 ' + (G - 54) + ' a16 16 0 0 1 32 0 Z', P.teal);
    path(a, 'M80 ' + (G - 70) + ' v-12', 'none', { stroke: INK, 'stroke-width': 1.4 });
    poly(a, '80,' + (G - 82) + ' 90,' + (G - 78) + ' 80,' + (G - 74), P.gold, { 'stroke-width': 0.8 });
    rect(a, 60, G - 44, 40, 44, '#fff');
    poly(a, '56,' + (G - 44) + ' 80,' + (G - 58) + ' 104,' + (G - 44), P.sand);
    [64, 73.5, 83, 92.5].forEach(function (x) { rect(a, x, G - 40, 4, 36, P.cream, { 'stroke-width': 1 }); });
    rect(a, 56, G - 4, 48, 4, P.sand);
    snow(a, 28, G - 41, 30); snow(a, 102, G - 41, 30);
    block(a, 146, 34, G - 84, G, P.blue, { dish: false });
  }
  function drawSanayi(a) {
    [[22, 86], [42, 72]].forEach(function (c, i) {
      rect(a, c[0], G - c[1], 10, c[1] - 30, P.brick);
      rect(a, c[0] - 1.5, G - c[1], 13, 5, INK, { stroke: 'none', opacity: 0.8 });
      for (var k = 0; k < 3; k++) circ(a, c[0] + 5, G - c[1] - 6, 6, '#f4f1ea', { 'class': 'puff puff' + ((i * 3 + k) % 6), stroke: 'none' });
    });
    rect(a, 8, G - 34, 104, 34, P.slate);
    for (var t = 0; t < 4; t++) poly(a, (8 + t * 26) + ',' + (G - 34) + ' ' + (8 + t * 26) + ',' + (G - 50) + ' ' + (34 + t * 26) + ',' + (G - 34), P.blue);
    rect(a, 16, G - 26, 62, 7, P.glass, { 'class': 'win lit', 'stroke-width': 1 });
    rect(a, 86, G - 22, 18, 22, P.deep);
    path(a, 'M118 ' + G + ' v-18 q26 -16 52 0 v18 Z', P.ochre);
    rect(a, 136, G - 16, 16, 16, P.brown, NOLINE);
    rect(a, 176, G - 44, 18, 44, '#c9d2d6'); path(a, 'M176 ' + (G - 44) + ' q9 -9 18 0 Z', '#aeb9be');
    path(a, 'M176 ' + (G - 30) + ' h18 M176 ' + (G - 15) + ' h18', 'none', { stroke: INK, 'stroke-width': 0.8, opacity: 0.5 });
    snow(a, 118, G - 27, 52); snow(a, 176, G - 50, 18);
  }
  function drawSahil(a) {
    palm(a, 14, G, 34); palm(a, 70, G, 28);
    rect(a, 24, G - 22, 32, 22, P.cream);
    for (var i = 0; i < 4; i++) path(a, 'M' + (22 + i * 9) + ' ' + (G - 22) + ' h9 v4 q-4.5 5 -9 0 Z', i % 2 ? P.cream : P.teal);
    rect(a, 36, G - 13, 8, 13, P.brown, NOLINE);
    [[60, P.tomato], [80, P.gold]].forEach(function (u) {
      path(a, 'M' + u[0] + ' ' + G + ' v-13', 'none', { stroke: INK, 'stroke-width': 1.2 });
      path(a, 'M' + (u[0] - 9) + ' ' + (G - 12) + ' q9 -11 18 0 Z', u[1]);
    });
    rect(a, 88, G - 3, 68, 5, P.brown); [96, 116, 136, 152].forEach(function (x) { rect(a, x, G + 2, 3, 12, P.brown, NOLINE); });
    poly(a, '146,' + (G - 3) + ' 149,' + (G - 52) + ' 159,' + (G - 52) + ' 162,' + (G - 3), '#fff');
    poly(a, '147.2,' + (G - 22) + ' 148,' + (G - 36) + ' 160,' + (G - 36) + ' 160.8,' + (G - 22), P.tomato, NOLINE);
    rect(a, 148, G - 61, 12, 9, P.glass); poly(a, '146,' + (G - 61) + ' 154,' + (G - 70) + ' 162,' + (G - 61), P.tomato);
    circ(a, 154, G - 56.5, 9, P.gold, { 'class': 'beacon', stroke: 'none' });
  }

  /* ───────── Kurulum ───────── */
  function build() {
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'city-svg', 'aria-hidden': 'true', focusable: 'false' });
    var sky = g(svg, 'sky');
    var sun = g(sky, 'sun'); circ(sun, 0, 0, 40, P.gold, { opacity: 0.22 }); circ(sun, 0, 0, 24, '#ffd76a');
    [[60, 52, 1], [420, 34, 0.8], [760, 62, 1.15], [1010, 30, 0.7]].forEach(function (c, i) {
      var cl = g(sky, 'cloud cloud' + i); var k = c[2];
      [[0, 0, 16], [18, -7, 20], [40, -1, 15], [20, 6, 18]].forEach(function (b) { circ(cl, c[0] + b[0] * k, c[1] + b[1] * k, b[2] * k, '#fff'); });
    });
    for (var b = 0; b < 3; b++) path(sky, 'M0 0 q5 -6 10 0 q5 -6 10 0', 'none', { 'class': 'gull gull' + b, stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
    path(svg, 'M-900 ' + G + ' V182 C-700 150 -520 196 -360 170 S-80 128 80 158 S330 196 470 170 S720 138 880 166 S1090 196 1240 172 S1700 150 2100 190 V' + G + ' Z', 'var(--hill-far)', { 'class': 'farhills' });
    rect(svg, -900, G - 1, 1992, H - G + 40, 'var(--ground)', { 'class': 'groundfill' });
    rect(svg, 1092, G + 2, 1100, H - G + 40, 'var(--sea)', { 'class': 'seafill' });
    var waves = g(svg, 'waves');
    [0, 1, 2].forEach(function (i) {
      path(waves, 'M1080 ' + (G + 14 + i * 14) + ' q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0',
        'none', { 'class': 'wave wave' + i, stroke: '#fff', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.55 });
    });
    rect(svg, 1088, G - 4, 6, H - G + 40, P.sand, { stroke: INK, 'stroke-width': 1.2 });
    var boat = g(svg, 'boat'); path(boat, 'M1150 ' + (G + 20) + ' h36 l-6 9 h-24 Z', P.tomato, { stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round' });
    path(boat, 'M1168 ' + (G + 20) + ' v-30 l16 26 Z', '#fff', { stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round' });

    // Mahalle çizimleri
    var draw = { baglar: drawBaglar, yokusbasi: drawYokus, carsi: drawCarsi, kampus: drawKampus, sanayi: drawSanayi, sahil: drawSahil };
    ORDER.forEach(function (id, i) {
      var dg = g(svg, 'dist dist-' + id, i * COL);
      s('ellipse', { cx: 100, cy: G + 6, rx: 98, ry: 13, 'class': 'd-glow' }, dg);
      var art = g(dg, 'd-art'); art.setAttribute('stroke', INK); art.setAttribute('stroke-width', '1.4'); art.setAttribute('stroke-linejoin', 'round');
      draw[id](art);
      var cr = g(dg, 'd-crane');
      path(cr, 'M150 ' + G + ' v-92 M132 ' + (G - 84) + ' h62 M150 ' + (G - 92) + ' l-18 8 M150 ' + (G - 92) + ' l44 8', 'none', { stroke: P.gold, 'stroke-width': 3, 'stroke-linecap': 'round' });
      var hook = g(cr, 'hook'); path(hook, 'M184 ' + (G - 84) + ' v26', 'none', { stroke: INK, 'stroke-width': 1.2 }); rect(hook, 179, G - 58, 10, 8, P.tomato, { stroke: INK, 'stroke-width': 1 });
      var fx = g(dg, 'd-fx');
      [[52, 66], [104, 92], [150, 58]].forEach(function (p, k) { circ(fx, p[0], G - p[1], 9, '#4b4f55', { 'class': 'd-smoke d-smoke' + k }); });
      [[64, 10], [128, 12]].forEach(function (p, k) { path(fx, 'M' + p[0] + ' ' + (G - 2) + ' q-9 -12 0 -24 q3 8 7 6 q7 9 -1 18 Z', '#ff8a2a', { 'class': 'd-fire d-fire' + k, stroke: '#ffd76a', 'stroke-width': 1.6 }); });
      path(fx, 'M40 ' + (G - 60) + ' l6 12 l-7 9 l8 13 M150 ' + (G - 50) + ' l-6 11 l7 8 l-5 12', 'none', { 'class': 'd-crack', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      M.art[id] = dg;
    });

    // Kaldırım, yol, araçlar
    rect(svg, -900, G - 1, 1990, 8, 'var(--pave)', { stroke: INK, 'stroke-width': 1.2 });
    rect(svg, -900, G + 7, 1990, 22, '#566570', { 'class': 'road' });
    path(svg, 'M-900 ' + (G + 18) + ' H1088', 'none', { stroke: '#fdf6e3', 'stroke-width': 1.6, 'stroke-dasharray': '14 12', opacity: 0.8 });
    function bus(cls, y, color) {
      var bg = g(svg, 'bus ' + cls), o = { stroke: INK, 'stroke-width': 1.3 };
      rect(bg, 0, y - 15, 38, 15, color, { rx: 4, stroke: INK, 'stroke-width': 1.3 });
      rect(bg, 4, y - 12, 24, 6, P.glass, { rx: 1.5, stroke: 'none' }); rect(bg, 31, y - 12, 4, 6, P.glass, { rx: 1, stroke: 'none' });
      circ(bg, 9, y, 3.6, INK, o); circ(bg, 29, y, 3.6, INK, o);
    }
    bus('bus1', G + 17, P.teal); bus('bus2', G + 27, P.gold); bus('bus3', G + 17, P.tomato);
    var car = g(svg, 'bus car'); rect(car, 0, G + 20, 20, 7, P.tomato, { rx: 3, stroke: INK, 'stroke-width': 1.2 }); rect(car, 5, G + 15, 10, 6, P.glass, { rx: 2, stroke: INK, 'stroke-width': 1.2 });
    circ(car, 5, G + 27.5, 2.6, INK); circ(car, 15, G + 27.5, 2.6, INK);
    rect(svg, -900, G + 29, 1990, H - G, 'var(--ground)', { 'class': 'groundfill', stroke: 'none' });
    rect(svg, -900, G + 29, 1990, 2, INK, { opacity: 0.25, stroke: 'none' });
    rect(svg, -900, 0, 3000, H + 40, '#7d8468', { 'class': 'smog', stroke: 'none' });
    return svg;
  }

  function mount(el) {
    if (!el || !BG.ui.h) return;
    if (M.el === el && el.firstChild) return;
    while (el.firstChild) el.removeChild(el.firstChild);
    M.el = el; M.cols = {}; M.art = {}; M.open = null;
    el.classList.add('city');
    el.appendChild(build());
    M.host = (el.closest && el.closest('.stage')) || el;   // mevsim/mod/mesai nitelikleri sahnenin tamamına uygulanır
    var fx = h('div', { class: 'city-fx', 'aria-hidden': 'true' });
    for (var i = 0; i < 22; i++) fx.appendChild(h('i', { style: { left: ((i * 37 + 11) % 100) + '%', animationDuration: (6.5 + (i % 5) * 1.4) + 's', animationDelay: (-i * 0.83) + 's' } }));
    el.appendChild(fx);
    var uiL = h('div', { class: 'city-ui' });
    ORDER.forEach(function (id, idx) {
      var d = BG.byId(BG.DISTRICTS, id);
      if (!d) return;
      var badges = h('span', { class: 'city-badges' });
      var btn = h('button', { type: 'button', class: 'city-col', dataset: { id: id }, 'aria-label': d.name + ' mahallesi', style: { '--i': idx },
        onclick: function () { clickDistrict(id); } }, badges, h('span', { class: 'city-label' }, h('span', { class: 'e', text: d.emoji }), h('span', { text: d.name })));
      M.cols[id] = { btn: btn, badges: badges, idx: idx };
      uiL.appendChild(btn);
    });
    M.pop = h('div', { class: 'city-pop', hidden: true, role: 'dialog' });
    M.strip = h('div', { class: 'city-strip', hidden: true });
    M.banner = h('div', { class: 'city-banner', hidden: true });
    uiL.appendChild(M.pop);
    el.appendChild(uiL);
    // Şerit ve pankart kaymayan sahneye bağlanır (dar ekranda harita yatay kayar)
    Array.prototype.slice.call(M.host.querySelectorAll('.city-strip, .city-banner')).forEach(function (n) { n.parentNode.removeChild(n); });
    M.host.appendChild(M.strip); M.host.appendChild(M.banner);
    doc.addEventListener('click', function (e) { if (M.open && M.el && !M.el.contains(e.target)) closePop(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && M.open) closePop(); });
    update(BG.state || null, null);
  }

  /* ───────── Bilgi balonu ───────── */
  function closePop() { M.open = null; if (M.pop) M.pop.hidden = true; Object.keys(M.cols).forEach(function (k) { M.cols[k].btn.classList.remove('open'); }); }
  function row(label, value) { return h('div', { class: 'cp-row' }, h('span', { class: 'cp-k', text: label }), h('span', { class: 'cp-v' }, value)); }
  function fillPop(id) {
    var d = BG.byId(BG.DISTRICTS, id), st = M.st, col = M.cols[id];
    if (!d || !col) return closePop();
    while (M.pop.firstChild) M.pop.removeChild(M.pop.firstChild);
    var mix = Object.keys(d.mix).sort(function (a, b) { return d.mix[b] - d.mix[a]; }).slice(0, 3).map(function (k) {
      var gr = BG.byId(BG.GROUPS, k) || { emoji: '', name: k };
      return gr.emoji + ' ' + gr.name + ' %' + Math.round(d.mix[k] * 100);
    }).join(' · ');
    var risks = Object.keys(d.risk || {}).filter(function (k) { return d.risk[k] >= 3; }).map(function (k) { return RISK[k] || k; });
    var kids = [
      h('div', { class: 'cp-head' }, h('span', { class: 'cp-e', text: d.emoji }), h('strong', { text: d.name }), h('button', { type: 'button', class: 'cp-x', 'aria-label': 'Kapat', onclick: function (e) { e.stopPropagation(); closePop(); } }, '×')),
      h('p', { class: 'cp-desc', text: d.desc }),
      row('Nüfus payı', '%' + d.pop), row('Seçmen', mix),
      risks.length ? row('Yüksek risk', risks.join(', ')) : null
    ];
    if (st && st.districts && st.districts[id]) {
      var ds = st.districts[id], pl = null, names = [];
      try { pl = BG.engine.poll(st).byDistrict[id]; } catch (e) { pl = null; }
      (st.projects.done || []).forEach(function (p) { if (p.district === id) { var pd = BG.engine.projectDef(p.id); if (pd) names.push(pd.emoji + ' ' + pd.name); } });
      kids.push(row('Hasar', ds.hasar > 0 ? '🏚️ ' + Math.round(ds.hasar) : 'Yok'));
      kids.push(row('Yerel destek', (ds.bonus > 0 ? '+' : ds.bonus < 0 ? '−' : '') + Math.abs(Math.round(ds.bonus))));
      kids.push(row('Projeler', names.length ? names.join(', ') : 'Henüz yok'));
      if (pl) kids.push(h('div', { class: 'cp-poll' },
        h('div', { class: 'cp-pollbar' }, h('span', { class: 'me', style: { width: pl.player + '%' } }), h('span', { class: 'ot', style: { width: pl.other + '%' } }), h('span', { class: 'rv', style: { width: pl.rival + '%' } })),
        h('div', { class: 'cp-polltxt' }, h('span', { text: 'Sen %' + Math.round(pl.player) }), h('span', { text: 'Rakip %' + Math.round(pl.rival) }))));
    }
    kids.forEach(function (k) { if (k) M.pop.appendChild(k); });
    M.pop.dataset.side = col.idx >= 4 ? 'right' : col.idx >= 2 ? 'mid' : 'left';
    M.pop.style.setProperty('--i', col.idx);
    M.pop.hidden = false;
  }
  function clickDistrict(id) {
    var pick = BG.ui.pendingPick;
    if (pick) {
      if ((pick.exclude || []).indexOf(id) >= 0) { var b = M.cols[id].btn; b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }
      if (BG.ui.resolvePick) BG.ui.resolvePick(id);
      return;
    }
    if (M.open === id) return closePop();
    closePop(); M.open = id; M.cols[id].btn.classList.add('open'); fillPop(id);
  }

  /* ───────── Durumu yansıt ───────── */
  function badge(cls, text, title) { return h('span', { class: 'cb ' + cls, title: title || null, text: text }); }
  function update(st, view) {
    var el = M.el;
    if (!el) return;
    M.st = st && st.stats ? st : null;
    st = M.st;
    var pick = BG.ui.pendingPick || null, ex = (pick && pick.exclude) || [], hl = view && view.district, ds = (M.host || el).dataset;
    var season = 'ilkbahar';
    try { if (st) season = BG.engine.season(st).id; } catch (e) { /* varsayılan */ }
    ds.season = season;
    ds.mode = st ? st.mode : 'mayor';
    ds.ap = st ? String(Math.max(0, Math.min(3, st.ap))) : '2';
    ds.pick = pick ? '1' : '';
    ds.eco = st ? (st.stats.cevre >= 65 ? '2' : st.stats.cevre >= 45 ? '1' : '0') : '1';
    ds.smog = st && st.stats.cevre < 35 ? '1' : '';
    ds.bus = st ? (st.stats.ulasim >= 65 ? '3' : st.stats.ulasim >= 45 ? '2' : '1') : '2';
    ds.fest = st && st.stats.sosyal >= 60 ? '1' : (st ? '' : '1');
    ds.idle = st ? '' : '1';
    var cityWide = [];
    if (st) (st.projects.done || []).forEach(function (p) { if (!p.district) { var pd = BG.engine.projectDef(p.id); if (pd) cityWide.push(pd); } });
    ORDER.forEach(function (id) {
      var col = M.cols[id], art = M.art[id];
      if (!col || !art) return;
      var d = st && st.districts[id], hasar = d ? d.hasar : 0, bonus = d ? Math.round(d.bonus) : 0, off = pick && ex.indexOf(id) >= 0;
      var active = st ? st.projects.active.filter(function (p) { return p.district === id; }) : [];
      var done = st ? st.projects.done.filter(function (p) { return p.district === id; }) : [];
      art.setAttribute('class', 'dist dist-' + id + (hasar > 0 ? ' hurt' : '') + (hasar >= 30 ? ' ruin' : '') + (active.length ? ' building' : '') + (hl === id ? ' hl' : '') + (off ? ' off' : ''));
      col.btn.className = 'city-col' + (hl === id ? ' hl' : '') + (pick ? (off ? ' off' : ' pickable') : '') + (M.open === id ? ' open' : '');
      col.btn.setAttribute('aria-disabled', off ? 'true' : 'false');
      while (col.badges.firstChild) col.badges.removeChild(col.badges.firstChild);
      if (hasar > 0) col.badges.appendChild(badge('cb-dmg' + (hasar >= 30 ? ' heavy' : ''), '🏚️ ' + Math.round(hasar), 'Afet hasarı'));
      if (active.length) col.badges.appendChild(badge('cb-build', '🏗️ ' + Math.min.apply(null, active.map(function (p) { return p.left; })), 'İnşaat: kalan mevsim'));
      if (bonus >= 1) col.badges.appendChild(badge('cb-love', '❤️ +' + bonus, 'Yerel destek'));
      else if (bonus <= -1) col.badges.appendChild(badge('cb-mad', '😠 −' + Math.abs(bonus), 'Yerel hoşnutsuzluk'));
      if (done.length) {
        var em = done.slice(-4).map(function (p) { var pd = BG.engine.projectDef(p.id); return pd ? pd.emoji : '✅'; }).join('');
        col.badges.appendChild(badge('cb-proj', em + (done.length > 4 ? ' +' + (done.length - 4) : ''), done.length + ' proje tamamlandı'));
      }
    });
    if (M.strip) {
      M.strip.hidden = !cityWide.length;
      M.strip.textContent = cityWide.length ? 'Şehir geneli: ' + cityWide.slice(-9).map(function (p) { return p.emoji; }).join(' ') + (cityWide.length > 9 ? ' +' + (cityWide.length - 9) : '') : '';
      M.strip.title = cityWide.map(function (p) { return p.name; }).join(', ');
    }
    if (M.banner) {
      var opp = st && st.mode === 'opposition', rn = '';
      try { if (opp) rn = BG.engine.rivalDef(st).name; } catch (e2) { rn = ''; }
      M.banner.hidden = !opp;
      M.banner.textContent = opp ? 'Muhalefettesin · Koltukta ' + rn + ' var' : '';
    }
    if (M.open) { if (pick) closePop(); else fillPop(M.open); }
    // Dar ekranda vurgulanan mahalleyi görünür kıl
    var sc = el.parentNode, scrolls = false;
    try { scrolls = !!sc && root.getComputedStyle(sc).overflowX === 'auto' && el.offsetWidth > sc.clientWidth + 4; } catch (e4) { scrolls = false; }
    if (!scrolls) { if (sc && sc.scrollLeft) sc.scrollLeft = 0; }
    else if (hl && M.cols[hl]) {
      var b = M.cols[hl].btn;
      try { sc.scrollTo({ left: Math.max(0, b.offsetLeft - (sc.clientWidth - b.offsetWidth) / 2), behavior: 'smooth' }); } catch (e3) { sc.scrollLeft = b.offsetLeft; }
    }
  }

  BG.ui.map = { mount: mount, update: function (st, view) { try { update(st, view); } catch (e) { if (root.console) root.console.error(e); } } };
})(typeof window !== 'undefined' ? window : globalThis);
