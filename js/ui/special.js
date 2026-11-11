/* BAŞKAN — özel sahne çizicileri: dialogue, electionNight, electionIntro, electionResult, disaster, ending */
(function (root) {
  'use strict';
  var BG = root.BG;
  BG.ui = BG.ui || {};
  var doc = root.document;
  if (typeof BG.ui.register !== 'function' || typeof BG.ui.h !== 'function') return;
  var h = function () { return BG.ui.h.apply(null, arguments); };

  function reduced() {
    try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function later(fn, ms) { try { return root.setTimeout(fn, ms || 30); } catch (e) { fn(); } }
  function raf(fn) { if (root.requestAnimationFrame) root.requestAnimationFrame(function () { root.requestAnimationFrame(fn); }); else later(fn, 30); }
  function add(parent, x) {
    if (x == null) return;
    if (Array.isArray(x)) { x.forEach(function (y) { add(parent, y); }); return; }
    parent.appendChild(x);
  }
  function pct(n) { return Math.round((n || 0) * 10) / 10; }
  function textOf(t) { return Array.isArray(t) ? t : (t ? [t] : []); }

  function paragraphs(api, text) {
    if (!text || (Array.isArray(text) && !text.length)) return null;
    if (api && api.paragraphs) return api.paragraphs(text);
    return h('div', { class: 'sp-text' }, textOf(text).map(function (t) { return h('p', { text: t }); }));
  }
  function chips(api, deltas) {
    if (!deltas || !deltas.length || !api || !api.deltaChips) return null;
    return api.deltaChips(deltas);
  }
  function listRows(api, list) {
    if (!list || !list.length) return null;
    return h('ul', { class: 'sp-list' }, list.map(function (it) {
      return h('li', { class: 'sp-list-row' }, [
        h('span', { class: 'sp-list-emoji', text: it.emoji || '•' }),
        h('div', { class: 'sp-list-body' }, [
          h('strong', { text: it.title || '' }),
          it.text ? h('p', { class: 'muted', text: it.text }) : null,
          chips(api, it.deltas)
        ])
      ]);
    }));
  }
  function barsEl(bars) {
    if (!bars || !bars.length) return null;
    var wrap = h('div', { class: 'sp-bars' });
    bars.forEach(function (b) {
      var fill = h('div', { class: 'bar-fill' });
      fill.style.width = '0%';
      var w = Math.max(0, Math.min(100, (b.value || 0) / (b.max || 100) * 100));
      wrap.appendChild(h('div', { class: 'sp-bar-row' }, [
        h('div', { class: 'sp-bar-label', text: (b.emoji ? b.emoji + ' ' : '') + (b.label || '') }),
        h('div', { class: 'bar' }, [fill]),
        h('div', { class: 'sp-bar-val', text: String(Math.round(b.value || 0)) })
      ]));
      raf(function () { fill.style.width = w + '%'; });
    });
    return wrap;
  }
  function speakerEl(sp) {
    if (!sp) return null;
    return h('div', { class: 'sp-speaker' }, [
      h('span', { class: 'sp-avatar', text: sp.emoji || '🙂' }),
      h('div', {}, [h('strong', { text: sp.name || '' }), sp.role ? h('div', { class: 'muted', text: sp.role }) : null])
    ]);
  }
  function finish(el, view, api) {
    var o = null;
    try { o = api.optionButtons(view.options || []); } catch (e) { o = null; }
    if (o) add(el, o);
  }
  function safe(fn) {
    return function (view, el, api) {
      try { fn(view, el, api); } catch (e) {
        try { if (root.console) root.console.error(e); } catch (e2) { /* yok say */ }
        while (el.firstChild) el.removeChild(el.firstChild);
        el.appendChild(h('div', { class: 'card sp-card' }, [h('h2', { text: view.title || '' }), paragraphs(api, view.text)]));
        finish(el, view, api);
      }
    };
  }
  function toneClass(view) { return view.tone ? ' tone-' + view.tone : ''; }

  /* ───────── dialogue ───────── */
  BG.ui.register('dialogue', safe(function (view, el, api) {
    var d = view.data || {}, k = d.kisi || {}, m = view.meter || null;
    var card = h('div', { class: 'card sp-card sp-dialogue' + toneClass(view) });
    var sub = [k.job, k.age ? k.age + ' yaşında' : null, d.districtName || null, k.groupName || null].filter(Boolean).join(' · ');
    var head = h('div', { class: 'dlg-head' }, [
      h('div', { class: 'dlg-avatar', text: k.emoji || (view.speaker && view.speaker.emoji) || '🙂' }),
      h('div', { class: 'dlg-who' }, [
        h('strong', { class: 'dlg-name', text: k.name || (view.speaker && view.speaker.name) || view.title || '' }),
        h('div', { class: 'muted dlg-sub', text: sub }),
        d.mizacName && d.finished ? h('span', { class: 'chip dlg-mizac', text: '🎭 Mizacı: ' + d.mizacName }) : null   // mizaç ancak görüşme bitince açıklanır
      ]),
      d.rounds ? h('div', { class: 'dlg-round', text: 'Tur ' + Math.min(d.round || 1, d.rounds) + '/' + d.rounds }) : null
    ]);
    card.appendChild(head);
    if (m) {
      var max = m.max || 100, fill = h('div', { class: 'bar-fill' }), mk = h('div', { class: 'dlg-target' });
      fill.style.width = '0%';
      mk.style.left = Math.max(0, Math.min(100, (m.target || 0) / max * 100)) + '%';
      mk.setAttribute('title', 'Hedef');
      card.appendChild(h('div', { class: 'dlg-meter' }, [
        h('div', { class: 'dlg-meter-top' }, [h('span', { text: '🤝 ' + (m.label || 'İkna') }), h('span', { class: 'dlg-meter-val', text: Math.round(m.value || 0) + ' / ' + Math.round(m.target || 0) })]),
        h('div', { class: 'bar dlg-bar' }, [fill, mk])
      ]));
      var w = Math.max(0, Math.min(100, (m.value || 0) / max * 100));
      raf(function () { fill.style.width = w + '%'; });
    }
    var chat = h('div', { class: 'dlg-chat', role: 'log' });
    var hist = d.history || [];
    hist.forEach(function (b, i) {
      var you = b.who === 'you';
      var bubble = h('div', { class: 'dlg-row ' + (you ? 'you' : 'them') }, [
        !you ? h('span', { class: 'dlg-mini', text: k.emoji || '🙂' }) : null,
        h('div', { class: 'dlg-bubble', text: b.text || '' })
      ]);
      if (i === hist.length - 1 && !reduced()) bubble.classList.add('dlg-new');
      chat.appendChild(bubble);
    });
    if (!hist.length) chat.appendChild(h('div', { class: 'dlg-empty muted', text: 'Konuşma başlamak üzere…' }));
    card.appendChild(chat);
    later(function () {
      try {
        chat.scrollTop = chat.scrollHeight;
        var last = chat.lastElementChild;
        if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest' });
      } catch (e) { /* yok say */ }
    }, 40);
    if (view.text && !d.finished) card.appendChild(paragraphs(api, view.text));
    if (d.finished) {
      var ok = !!d.success;
      card.appendChild(h('div', { class: 'dlg-banner ' + (ok ? 'ok' : 'fail') }, [
        h('strong', { text: ok ? '✅ İkna oldu!' : '❌ İkna edemedin' }),
        view.text ? paragraphs(api, view.text) : null
      ]));
      add(card, chips(api, view.deltas));
    }
    el.appendChild(card);
    finish(el, view, api);
  }));

  /* ───────── electionNight ───────── */
  var night = { counted: -1, p: 0, r: 0, seen: {} };
  function normTotal(t) {
    t = t || {};
    var p = t.player || 0, r = t.rival || 0, o = t.other || 0, sum = p + r + o;
    if (sum <= 0) return { p: 0, r: 0, o: 0 };
    return { p: p / sum * 100, r: r / sum * 100, o: o / sum * 100 };
  }
  BG.ui.register('electionNight', safe(function (view, el, api) {
    var d = view.data || {}, tot = normTotal(d.total), done = !!d.done;
    if ((d.counted || 0) < night.counted) { night.p = 0; night.r = 0; night.seen = {}; }
    night.counted = d.counted || 0;
    var card = h('div', { class: 'card sp-card sp-night' + (done ? ' is-done' : '') });
    card.appendChild(h('div', { class: 'night-top' }, [
      h('span', { class: 'night-live', text: done ? '⏹ YAYIN SONU' : '● CANLI' }),
      h('span', { class: 'night-title', text: view.title || 'Seçim Gecesi' }),
      h('span', { class: 'night-count', text: 'Sandık ' + (d.counted || 0) + '/' + (d.of || (d.districts || []).length || 0) })
    ]));
    var pf = h('div', { class: 'bar-fill night-fill-p' }), rf = h('div', { class: 'bar-fill night-fill-r' });
    pf.style.width = pct(night.p) + '%'; rf.style.width = pct(night.r) + '%';
    var prevP = night.p, prevR = night.r;
    card.appendChild(h('div', { class: 'night-versus' }, [
      h('div', { class: 'night-side p' }, [
        h('div', { class: 'night-name', text: '🙋 ' + (d.playerName || 'Sen') }),
        h('div', { class: 'night-pct', text: pct(tot.p).toFixed(1) + '%' }),
        h('div', { class: 'bar night-bar' }, [pf])
      ]),
      h('div', { class: 'night-vs', text: 'VS' }),
      h('div', { class: 'night-side r' }, [
        h('div', { class: 'night-name', text: (d.rivalEmoji || '🧑‍💼') + ' ' + (d.rivalName || 'Rakip') }),
        h('div', { class: 'night-pct', text: pct(tot.r).toFixed(1) + '%' }),
        h('div', { class: 'bar night-bar' }, [rf])
      ])
    ]));
    raf(function () { pf.style.width = pct(tot.p) + '%'; rf.style.width = pct(tot.r) + '%'; });
    night.p = tot.p; night.r = tot.r;
    void prevP; void prevR;
    var grid = h('div', { class: 'night-grid' });
    (d.districts || []).forEach(function (x) {
      var counted = !!x.counted, wasSeen = !!night.seen[x.id];
      var win = (x.player || 0) >= (x.rival || 0) ? 'p' : 'r';
      var inner = h('div', { class: 'night-box-in' }, [
        h('div', { class: 'night-face front' }, [
          h('div', { class: 'night-box-name', text: (x.emoji || '') + ' ' + (x.name || '') }),
          h('div', { class: 'night-wait', text: 'sayılıyor…' }),
          h('div', { class: 'night-box-pop muted', text: x.pop != null ? '%' + x.pop + ' nüfus' : '' })
        ]),
        h('div', { class: 'night-face back win-' + win }, [
          h('div', { class: 'night-box-name', text: (x.emoji || '') + ' ' + (x.name || '') }),
          h('div', { class: 'night-res' }, [
            h('span', { class: 'p', text: Math.round(x.player || 0) + '%' }), h('span', { class: 'sep', text: '–' }), h('span', { class: 'r', text: Math.round(x.rival || 0) + '%' })
          ]),
          h('div', { class: 'night-box-win', text: win === 'p' ? 'Sen' : (d.rivalName || 'Rakip') })
        ])
      ]);
      var box = h('div', { class: 'night-box' + (counted && wasSeen ? ' flipped' : '') }, [inner]);
      if (counted && !wasSeen) raf(function () { box.classList.add('flipped'); });
      if (counted) night.seen[x.id] = true;
      grid.appendChild(box);
    });
    card.appendChild(grid);
    if (view.text) card.appendChild(h('div', { class: 'night-comment' }, [h('span', { class: 'night-mic', text: '🎙️' }), paragraphs(api, view.text)]));
    if (done) {
      var won = !!d.won;
      var ban = h('div', { class: 'night-banner ' + (won ? 'won' : 'lost') }, [
        h('strong', { text: won ? '🎉 Seçimi kazandın!' : '😔 Seçimi kaybettin' })
      ]);
      if (won && !reduced()) {
        var cf = h('div', { class: 'confetti', 'aria-hidden': 'true' });
        var cols = ['#e5b23a', '#d9534a', '#2f8f83', '#fffdf6', '#e07a3a'];
        for (var i = 0; i < 28; i++) {
          var c = h('i', {});
          c.style.left = ((i * 37) % 100) + '%';
          c.style.background = cols[i % cols.length];
          c.style.animationDelay = ((i % 7) * 0.12) + 's';
          c.style.animationDuration = (1.8 + (i % 5) * 0.35) + 's';
          c.style.setProperty('--drift', (((i * 53) % 60) - 30) + 'px');
          cf.appendChild(c);
        }
        ban.appendChild(cf);
      }
      card.appendChild(ban);
      add(card, chips(api, view.deltas));
    }
    el.appendChild(card);
    finish(el, view, api);
  }));

  /* ───────── electionIntro / electionResult ───────── */
  function poster(kind) {
    return safe(function (view, el, api) {
      var d = view.data || {};
      var card = h('div', { class: 'card sp-card sp-poster poster-' + kind + toneClass(view) });
      card.appendChild(h('div', { class: 'poster-band' }, [
        h('span', { class: 'kicker', text: view.kicker || (kind === 'intro' ? 'Seçim' : 'Sonuç') }),
        h('span', { class: 'poster-star', text: kind === 'intro' ? '🗳️' : (d.won === true ? '🏆' : d.won === false ? '📉' : '🗳️') })
      ]));
      card.appendChild(h('h2', { class: 'poster-title', text: view.title || '' }));
      var sm = null, stt = null;
      try { sm = api.summary; stt = api.state; } catch (e) { sm = null; }
      var rv = (sm && sm.rival) || {};
      var pn = d.playerName || (stt && stt.player && stt.player.name) || 'Sen';
      var rn = d.rivalName || rv.name || 'Rakip', re = d.rivalEmoji || rv.emoji || '🧑‍💼';
      var s1 = view.speaker && view.speaker.name !== rn ? speakerEl(view.speaker) : null;
      if (s1) card.appendChild(s1);
      card.appendChild(h('div', { class: 'poster-face' }, [
        h('div', { class: 'poster-cand' }, [h('div', { class: 'poster-emoji', text: '🙋' }), h('strong', { text: pn })]),
        h('div', { class: 'night-vs', text: 'VS' }),
        h('div', { class: 'poster-cand' }, [h('div', { class: 'poster-emoji', text: re }), h('strong', { text: rn }), rv.title ? h('div', { class: 'muted', text: rv.title }) : null])
      ]));
      add(card, paragraphs(api, view.text));
      if (view.meter) add(card, barsEl([{ label: view.meter.label, value: view.meter.value, max: view.meter.max }]));
      add(card, barsEl(view.bars));
      add(card, listRows(api, view.list));
      add(card, chips(api, view.deltas));
      el.appendChild(card);
      finish(el, view, api);
    });
  }
  BG.ui.register('electionIntro', poster('intro'));
  BG.ui.register('electionResult', poster('result'));

  /* ───────── disaster ───────── */
  BG.ui.register('disaster', safe(function (view, el, api) {
    var d = view.data || {};
    var step = d.step || 1, steps = d.steps || 1;
    var card = h('div', { class: 'card sp-card sp-disaster' + (step <= 1 && !reduced() ? ' dz-shake' : '') });
    var msg = 'SON DAKİKA  •  ' + (d.name || view.title || 'Acil durum') + '  •  Yetkililer olay yerinde  •  ';
    card.appendChild(h('div', { class: 'dz-ticker', 'aria-label': 'Son dakika' }, [
      h('span', { class: 'dz-live', text: 'SON DAKİKA' }),
      h('div', { class: 'dz-marquee' }, [h('span', { text: msg + msg })])
    ]));
    card.appendChild(h('div', { class: 'dz-head' }, [
      h('div', { class: 'dz-emoji', text: d.emoji || '🚨' }),
      h('div', { class: 'dz-titles' }, [
        view.kicker ? h('span', { class: 'kicker', text: view.kicker }) : null,
        h('h2', { text: view.title || d.name || '' })
      ]),
      d.sevName ? h('span', { class: 'dz-sev sev-' + (d.sev || 1), text: d.sevName }) : null
    ]));
    var dots = h('div', { class: 'dz-steps', 'aria-label': 'Adım ' + step + '/' + steps });
    for (var i = 1; i <= steps; i++) dots.appendChild(h('span', { class: 'dz-dot' + (i < step ? ' done' : i === step ? ' now' : '') }));
    if (steps > 1) card.appendChild(h('div', { class: 'dz-stepwrap' }, [dots, h('span', { class: 'muted', text: 'Adım ' + step + '/' + steps })]));
    add(card, speakerEl(view.speaker));
    add(card, paragraphs(api, view.text));
    if (d.kriz != null) card.appendChild(h('div', { class: 'dz-kriz chip', text: '🚨 Kriz yönetimi: ' + Math.round(d.kriz) }));
    add(card, barsEl(view.bars));
    add(card, listRows(api, view.list));
    add(card, chips(api, view.deltas));
    el.appendChild(card);
    finish(el, view, api);
  }));

  /* ───────── ending ───────── */
  BG.ui.register('ending', safe(function (view, el, api) {
    var d = view.data || {};
    var card = h('div', { class: 'card sp-card sp-ending' + toneClass(view) });
    card.appendChild(h('span', { class: 'kicker', text: view.kicker || 'Oyun bitti' }));
    card.appendChild(h('h2', { class: 'end-title', text: view.title || '' }));
    if (d.rank) card.appendChild(h('div', { class: 'end-rank', text: '🎖️ ' + d.rank }));
    var num = h('span', { class: 'end-num', text: '0' });
    card.appendChild(h('div', { class: 'end-score' }, [num, h('span', { class: 'end-unit', text: 'Miras puanı' })]));
    var target = Math.max(0, Math.round(d.score || 0));
    if (reduced() || !root.requestAnimationFrame) num.textContent = String(target);
    else {
      var t0 = null;
      var tick = function (ts) {
        if (t0 == null) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1400);
        num.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) root.requestAnimationFrame(tick); else num.textContent = String(target);
      };
      root.requestAnimationFrame(tick);
    }
    add(card, paragraphs(api, view.text));
    var facts = h('div', { class: 'end-facts' });
    [['🏆', 'Seçim zaferi', d.wins], ['📉', 'Seçim yenilgisi', d.losses], ['🏛️', 'Dönem', d.termsServed], ['🏗️', 'Proje', d.projects]].forEach(function (f) {
      if (f[2] == null) return;
      facts.appendChild(h('div', { class: 'end-fact' }, [h('span', { class: 'end-fact-emoji', text: f[0] }), h('strong', { text: String(f[2]) }), h('span', { class: 'muted', text: f[1] })]));
    });
    card.appendChild(facts);
    if (d.stats && d.stats.length) {
      card.appendChild(h('div', { class: 'end-stats' }, d.stats.map(function (x) {
        return h('div', { class: 'end-stat' }, [h('span', { text: x.emoji || '' }), h('span', { class: 'muted', text: x.label || '' }), h('strong', { text: String(x.value) })]);
      })));
    }
    add(card, chips(api, view.deltas));
    el.appendChild(card);
    finish(el, view, api);
  }));
})(typeof window !== 'undefined' ? window : globalThis);
