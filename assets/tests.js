/* Онлайн-тесты: данные в tests-data.js, прогресс в localStorage (bk-tests) */
(function () {
  var root = document.getElementById('tests'); if (!root || !window.TESTS) return;
  var HASHDONE = 0, KEY = 'bk-tests', CH = window.TESTS, ST = load(), RUN = null, CUR = null, VIEW = 'home', PUSHED = 0, SUPPRESS = 0;
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(s) { return String(s).split(/\$([^$]+)\$/).map(function (p, i) { return i % 2 ? '<span class="kx" data-tex="' + esc(p).replace(/"/g, '&quot;') + '"></span>' : esc(p); }).join(''); }
  function math(el) { if (typeof katex === 'undefined') return; [].forEach.call(el.querySelectorAll('.kx'), function (k) { if (k.dataset.r) return; k.dataset.r = 1; try { katex.render(k.dataset.tex, k, { throwOnError: false, trust: true, strict: false }); } catch (e) { k.textContent = k.dataset.tex; } }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstChild; }
  function chOf(n) { return CH.filter(function (c) { return c.n === n; })[0]; }
  function stOf(n) { return ST['c' + n] || (ST['c' + n] = { ok: {} }); }
  function pick(q) {
    if (window.__novar || !q.v || !q.v.length) return q;
    var i = Math.floor(Math.random() * (q.v.length + 1)); if (i === q.v.length) return q;
    var v = q.v[i], c = Object.assign({}, q, v); if (v.nd) c.d = null; delete c.v; return c;
  }
  function secT(q) { var t = q.rt || 'Открыть в книге'; return t.length > 72 ? t.slice(0, 70).replace(/\s+\S*$/, '') + '…' : t; }
  function secL(q) { return '<a href="' + q.r + '">' + esc(secT(q)) + ' →</a>'; }
  function top() { root.scrollIntoView({ block: 'start' }); window.scrollBy(0, -10); }
  function ans(q) { return q.t === 'single' ? q.o[q.a] : q.t === 'tf' ? (q.a ? 'Верно' : 'Неверно') : q.t === 'num' ? String(q.a).replace('.', ',') + (q.u ? ' ' + q.u : '') : ''; }

  /* ---------- статические иллюстрации к вопросам ---------- */
  var SS = { '': 'stroke:var(--color-text);stroke-width:1.7', a: 'stroke:var(--acc);stroke-width:2.3', d: 'stroke:var(--color-muted);stroke-width:1.3;stroke-dasharray:4 3', da: 'stroke:var(--acc);stroke-width:1.5;stroke-dasharray:4 3', m: 'stroke:var(--color-muted);stroke-width:1.2', b: 'stroke:var(--color-text);stroke-width:2.8', g: 'stroke:#3d9a5f;stroke-width:2.1' };
  var DIR = { ne: [7, -6, 'start'], nw: [-7, -6, 'end'], se: [7, 14, 'start'], sw: [-7, 14, 'end'], n: [0, -9, 'middle'], s: [0, 17, 'middle'], e: [9, 5, 'start'], w: [-9, 5, 'end'], c: [0, 5, 'middle'] };
  function svgFig(sp) {
    var bb = sp.bb, W = 360, k = (W - 20) / (bb[2] - bb[0]), H = Math.round((bb[1] - bb[3]) * k + 20), o = [];
    function X(x) { return +(10 + (x - bb[0]) * k).toFixed(1); } function Y(y) { return +(10 + (bb[1] - y) * k).toFixed(1); }
    function col(st) { return /a/.test(st) ? 'var(--acc)' : /g/.test(st) ? '#3d9a5f' : /m|d/.test(st) ? 'var(--color-muted)' : 'var(--color-text)'; }
    function tx(x, y, t, st, d) { var D = DIR[d || 'c'] || DIR.c, it = /^[A-Za-z][A-Za-z0-9₀-₉′'_]{0,3}$/.test(t) && !/n/.test(st), c = col(st); return '<text x="' + (x + D[0]) + '" y="' + (y + D[1]) + '" text-anchor="' + D[2] + '" style="fill:' + c + ';font-size:15px;font-family:Georgia,\'Times New Roman\',serif;font-style:' + (it ? 'italic' : 'normal') + '">' + esc(t).replace(/([A-Za-z])_([A-Za-z0-9]+)/g,'$1<tspan dy="4" style="font-size:11px">$2</tspan><tspan dy="-4"></tspan>') + '</text>'; }
    sp.it.forEach(function (e) {
      var t = e[0];
      if (t === 'p') { var st = e[5] || ''; o.push('<circle cx="' + X(e[1]) + '" cy="' + Y(e[2]) + '" r="3.2" style="fill:' + col(st) + '"/>'); if (e[3]) o.push(tx(X(e[1]), Y(e[2]), e[3], '', e[4])); }
      else if (t === 's') o.push('<line x1="' + X(e[1]) + '" y1="' + Y(e[2]) + '" x2="' + X(e[3]) + '" y2="' + Y(e[4]) + '" style="' + (SS[e[5]] || SS['']) + ';stroke-linecap:round"/>');
      else if (t === 'c') o.push('<circle cx="' + X(e[1]) + '" cy="' + Y(e[2]) + '" r="' + (e[3] * k).toFixed(1) + '" style="fill:none;' + (SS[e[4]] || SS['']) + '"/>');
      else if (t === 'e') o.push('<ellipse cx="' + X(e[1]) + '" cy="' + Y(e[2]) + '" rx="' + (e[3] * k).toFixed(1) + '" ry="' + (e[4] * k).toFixed(1) + '" style="fill:none;' + (SS[e[5]] || SS['']) + '"/>');
      else if (t === 'a') { var r = e[3] * k, a1 = e[4] * Math.PI / 180, a2 = e[5] * Math.PI / 180, dd = ((e[5] - e[4] + 540) % 360) - 180; o.push('<path d="M' + (X(e[1]) + r * Math.cos(a1)).toFixed(1) + ' ' + (Y(e[2]) - r * Math.sin(a1)).toFixed(1) + ' A' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + (Math.abs(e[5] - e[4]) > 180 ? 1 : 0) + ' ' + (e[5] > e[4] ? 0 : 1) + ' ' + (X(e[1]) + r * Math.cos(a2)).toFixed(1) + ' ' + (Y(e[2]) - r * Math.sin(a2)).toFixed(1) + '" style="fill:none;' + (SS[e[6]] || SS['']) + '"/>'); }
      else if (t === 'g') { var r2 = e[5] * k, A1 = e[3], d2 = ((e[4] - e[3] + 540) % 360) - 180, A2 = A1 + d2, p1 = A1 * Math.PI / 180, p2 = A2 * Math.PI / 180, cx = X(e[1]), cy = Y(e[2]);
        o.push('<path d="M' + (cx + r2 * Math.cos(p1)).toFixed(1) + ' ' + (cy - r2 * Math.sin(p1)).toFixed(1) + ' A' + r2.toFixed(1) + ' ' + r2.toFixed(1) + ' 0 0 ' + (d2 > 0 ? 0 : 1) + ' ' + (cx + r2 * Math.cos(p2)).toFixed(1) + ' ' + (cy - r2 * Math.sin(p2)).toFixed(1) + '" style="fill:none;' + (/a/.test(e[7]) ? SS.a : SS.m) + ';stroke-width:1.6"/>');
        if (e[6]) { var pm = (A1 + d2 / 2) * Math.PI / 180, rr = r2 + 13; o.push(tx(cx + rr * Math.cos(pm), cy - rr * Math.sin(pm) - 5, e[6], (/a/.test(e[7]) ? 'a' : '') + 'n', 'c')); } }
      else if (t === 'r') { var s2 = e[5] * k, u1 = e[3] * Math.PI / 180, u2 = e[4] * Math.PI / 180, vx = X(e[1]), vy = Y(e[2]), c1 = [Math.cos(u1) * s2, -Math.sin(u1) * s2], c2 = [Math.cos(u2) * s2, -Math.sin(u2) * s2];
        o.push('<polyline points="' + (vx + c1[0]).toFixed(1) + ',' + (vy + c1[1]).toFixed(1) + ' ' + (vx + c1[0] + c2[0]).toFixed(1) + ',' + (vy + c1[1] + c2[1]).toFixed(1) + ' ' + (vx + c2[0]).toFixed(1) + ',' + (vy + c2[1]).toFixed(1) + '" style="fill:none;stroke:var(--color-muted);stroke-width:1.4"/>'); }
      else if (t === 't') o.push(tx(X(e[1]), Y(e[2]) - 5, e[3], e[4] || '', e[5]));
      else if (t === 'k' || t === 'v') { var x1 = X(e[1]), y1 = Y(e[2]), x2 = X(e[3]), y2 = Y(e[4]), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, n = e[5];
        for (var i = 0; i < n; i++) { var off = (i - (n - 1) / 2) * 5; if (t === 'k') o.push('<line x1="' + (mx + ux * off - nx * 5).toFixed(1) + '" y1="' + (my + uy * off - ny * 5).toFixed(1) + '" x2="' + (mx + ux * off + nx * 5).toFixed(1) + '" y2="' + (my + uy * off + ny * 5).toFixed(1) + '" style="stroke:var(--color-text);stroke-width:1.5"/>'); else { var bx = mx + ux * off * 1.6, by = my + uy * off * 1.6; o.push('<polyline points="' + (bx - ux * 4 + nx * 4).toFixed(1) + ',' + (by - uy * 4 + ny * 4).toFixed(1) + ' ' + (bx + ux * 2).toFixed(1) + ',' + (by + uy * 2).toFixed(1) + ' ' + (bx - ux * 4 - nx * 4).toFixed(1) + ',' + (by - uy * 4 - ny * 4).toFixed(1) + '" style="fill:none;stroke:var(--color-text);stroke-width:1.4"/>'); } } }
      else if (t === 'f') o.unshift('<polygon points="' + e[1].map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '" style="fill:' + (/m/.test(e[2]) ? 'var(--color-muted)' : /g/.test(e[2]) ? '#3d9a5f' : 'var(--acc)') + ';fill-opacity:.15;stroke:none"/>');
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Чертёж к заданию">' + o.join('') + '</svg>';
  }
  /* ---------- главная ---------- */
  function home() {
    RUN = null; stopFig(); VIEW = 'home';
    var tot = 0, good = 0, h = '<p class="t-lead">Проверьте себя по главам. Баллы и ошибки сохраняются в этом браузере — регистрация не нужна.</p>' + examCard() + '<div class="t-list">';
    CH.forEach(function (c) {
      var s = stOf(c.n), n = c.qs.length, ok = 0, ans_ = 0, bad = [];
      c.qs.forEach(function (q) { if (q.id in s.ok) { ans_++; if (s.ok[q.id]) ok++; else bad.push(q.id); } });
      tot += n; good += ok;
      var st = ans_ === 0 ? 'Не пройден' : 'Верно ' + ok + ' из ' + n + (ans_ < n ? ' · отвечено ' + ans_ : '');
      h += '<div class="t-row" id="r' + c.n + '"><div class="t-num">' + c.n + '</div><div class="t-main"><div class="t-name">' + esc(c.title) + '</div><div class="t-stat">' + n + ' заданий · ' + st + '</div><div class="t-bar"><i style="width:' + Math.round(ok / n * 100) + '%"></i></div></div><div class="t-acts"><button class="mini on" data-go="' + c.n + '">' + (ans_ ? 'Заново' : 'Начать') + '</button>' + (bad.length ? '<button class="mini" data-retry="' + c.n + '">Ошибки (' + bad.length + ')</button>' : '') + '</div></div>';
    });
    h += '</div><p class="t-total">Всего верно: <b>' + good + '</b> из ' + tot + '. '+(CH[CH.length-1].n<25?'Тесты для остальных глав добавляются постепенно.':'')+'</p>' + (good || Object.keys(ST).length ? '<p><button class="mini" id="tReset">Сбросить прогресс</button></p>' : '');
    root.innerHTML = h;
    if (!HASHDONE) {
      HASHDONE = 1; var hm = /^#c(\d+)$/.exec(location.hash || '');
      if (hm && chOf(+hm[1])) { var hc = chOf(+hm[1]), hs = stOf(hc.n), any = hc.qs.some(function (q) { return q.id in hs.ok; }); if (!any) { start(hc.n, false); return; } var hr = document.getElementById('r' + hc.n); if (hr) { hr.classList.add('t-hl'); setTimeout(function () { hr.scrollIntoView({ block: 'center' }); }, 120); } }
    }
    root.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.go) start(+b.dataset.go, false); else if (b.dataset.retry) start(+b.dataset.retry, true);
      else if (b.id === 'tExam') startExam(+document.getElementById('xN').value, +document.getElementById('xA').value, +document.getElementById('xB').value);
      else if (b.id === 'tReset' && confirm('Удалить результаты всех тестов?')) { ST = {}; save(); home(); }
    };
  }

  /* ---------- прохождение ---------- */
  function start(n, retry) {
    var c = chOf(n), s = stOf(n), list = c.qs;
    if (retry) list = c.qs.filter(function (q) { return s.ok[q.id] === false; });
    else { s.ok = {}; save(); }
    if (!list.length) return home();
    list = list.map(pick);
    RUN = { n: n, list: list, i: 0, score: 0, retry: retry, wrong: [], hist: {}, sk: {}, hu: {}, hc: 0 };
    if (!PUSHED) { try { history.pushState({ t: 1 }, ''); PUSHED = 1; } catch (e) {} }
    question(); top();
  }
  function question() {
    stopFig(); VIEW = 'q';
    var c = RUN.exam ? null : chOf(RUN.n), q = RUN.list[RUN.i]; CUR = { q: q, sel: null, done: false };
    var label = q.t === 'single' ? 'Выберите один ответ' : q.t === 'tf' ? 'Верно или неверно?' : q.t === 'num' ? 'Введите число' : 'Задание на чертеже';
    var h = '<div class="t-top"><button class="mini" id="tBack">← К списку</button><span>' + (RUN.exam ? 'Контрольная' : 'Глава ' + c.n + (RUN.retry ? ' · повтор ошибок' : '')) + ' · ' + (RUN.i + 1) + ' из ' + RUN.list.length + '</span></div><div class="t-bar"><i style="width:' + Math.round(RUN.i / RUN.list.length * 100) + '%"></i></div>';
    h += '<div class="t-kind">' + label + '</div><p class="t-q">' + fmt(q.q) + '</p>' + (q.d && q.d.it ? '<div class="t-draw">' + svgFig(q.d) + '</div>' : q.d ? '<div class="t-dg"><div id="tDiag" class="jxgbox t-board t-d"></div></div>' : '') + '<div id="tCtl">';
    if (q.t === 'single') h += '<div class="t-opts">' + q.o.map(function (o, i) { return '<button class="t-opt" data-i="' + i + '">' + fmt(o) + '</button>'; }).join('') + '</div>';
    else if (q.t === 'tf') h += '<div class="t-opts tf"><button class="t-opt" data-i="1">Верно</button><button class="t-opt" data-i="0">Неверно</button></div>';
    else if (q.t === 'num') h += '<div class="t-num-in"><input id="tIn" type="text" inputmode="decimal" autocomplete="off" placeholder="Ответ"' + '>' + (q.u ? '<span>' + esc(q.u) + '</span>' : '') + '</div>';
    else h += '<div class="t-fig"><div id="tBoard" class="jxgbox t-board"></div><button class="mini" id="tRst">Вернуть точку</button></div>';
    h += '</div><div id="tHintBox"></div><div class="t-fb" id="tFb"></div><div class="t-acts2">' + (RUN.i > 0 && !RUN.exam ? '<button class="mini" id="tPrev">← Назад</button>' : '') + '<button class="mini on" id="tCheck"' + (q.t === 'fig' ? '' : ' disabled') + '>Проверить</button><button class="mini" id="tSkip">Пропустить</button>' + (RUN.exam ? '' : '<button class="mini" id="tHint">Подсказка</button>') + '</div>';
    root.innerHTML = h; math(root);
    if (RUN.hu[q.id]) showHint(true);
    if (q.t === 'fig') CUR.fig = FIGS[q.f](document.getElementById('tBoard'));
    else if (q.d && !q.d.it) { try { drawSpec(document.getElementById('tDiag'), q.d); } catch (e) { var dd = document.getElementById('tDiag'); if (dd) dd.style.display = 'none'; } }
    root.onclick = clk; var inp = document.getElementById('tIn');
    if (inp) { inp.oninput = function () { document.getElementById('tCheck').disabled = !inp.value.trim(); }; inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); check(); } }; if (matchMedia('(hover:hover)').matches) inp.focus(); }
    var H = RUN.hist[q.id];
    if (H) {
      CUR.sel = H.sel;
      if (H.sel != null) [].forEach.call(root.querySelectorAll('.t-opt'), function (x) { x.classList.toggle('sel', +x.dataset.i === H.sel); });
      if (inp) inp.value = H.val || '';
      finish(H.ok, H.skip, true);
    }
  }
  function clk(e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'tBack') { if (!CUR.done && !confirm(RUN.exam ? 'Выйти из контрольной? Результат не сохранится.' : 'Выйти из теста? Отвеченные вопросы сохранятся.')) return; toHome(); }
    else if (b.id === 'tPrev') prev();
    else if (b.id === 'tSkip') skip();
    else if (b.id === 'tHint') showHint();
    else if (b.id === 'tCheck') check();
    else if (b.id === 'tNext') { if (CUR.t0 && Date.now() - CUR.t0 < 400) return; next(); }
    else if (b.id === 'tRst') CUR.fig && CUR.fig.reset();
    else if (b.classList.contains('t-opt') && !CUR.done) { CUR.sel = +b.dataset.i; [].forEach.call(root.querySelectorAll('.t-opt'), function (x) { x.classList.toggle('sel', x === b); }); document.getElementById('tCheck').disabled = false; }
  }
  function showHint(restore) {
    var q = CUR.q, box = document.getElementById('tHintBox'); if (!box) return;
    if (!restore) RUN.hu[q.id] = 1;
    box.innerHTML = '<div class="t-hint"><span>Подсказка</span>' + (q.h ? fmt(q.h) : 'Эта задача на тему: <a href="' + q.r + '" target="_blank" rel="noopener">' + esc(secT(q)) + ' →</a>') + '</div>';
    math(box); var hb = document.getElementById('tHint'); if (hb) hb.disabled = true;
  }
  function parseNum(s) { s = s.replace(/\s/g, '').replace(',', '.'); var m = s.match(/^(-?[\d.]+)\/([\d.]+)$/); return m ? parseFloat(m[1]) / parseFloat(m[2]) : (/^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN); }
  function check() {
    if (CUR.done) return; var q = CUR.q, ok = false, given = '';
    if (q.t === 'single') { if (CUR.sel == null) return; ok = CUR.sel === q.a; }
    else if (q.t === 'tf') { if (CUR.sel == null) return; ok = (CUR.sel === 1) === q.a; }
    else if (q.t === 'num') { var v = parseNum(document.getElementById('tIn').value); if (isNaN(v)) { fb('Введите число, например 7 или 7,5.', 'warn'); return; } ok = Math.abs(v - q.a) <= (q.tol || 0.01); }
    else ok = CUR.fig.check();
    var inp0 = document.getElementById('tIn'); RUN.hist[q.id] = { ok: ok, sel: CUR.sel, val: inp0 ? inp0.value : '' };
    if (!RUN.exam) { var s = stOf(RUN.n); s.ok[q.id] = ok; save(); }
    if (ok) { RUN.score++; if (RUN.hu[q.id]) RUN.hc++; } else RUN.wrong.push(q);
    if (RUN.exam) { next(); return; }
    finish(ok);
  }
  function skip() {
    if (CUR.done) return; var q = CUR.q;
    if (RUN.i < RUN.list.length - 1 && !RUN.sk[q.id]) { RUN.sk[q.id] = 1; RUN.list.push(RUN.list.splice(RUN.i, 1)[0]); question(); top(); return; }
    RUN.hist[q.id] = { ok: false, skip: 1 }; if (!RUN.exam) { var s = stOf(RUN.n); s.ok[q.id] = false; save(); } RUN.wrong.push(q);
    if (RUN.exam) { next(); return; }
    finish(false, true);
  }
  function finish(ok, skipped, restored) {
    var q = CUR.q; CUR.done = true;
    [].forEach.call(root.querySelectorAll('.t-opt'), function (x) {
      x.disabled = true; var i = +x.dataset.i, right = q.t === 'tf' ? (i === 1) === q.a : i === q.a;
      if (right) x.classList.add('ok'); else if (x.classList.contains('sel')) x.classList.add('bad');
    });
    var inp = document.getElementById('tIn'); if (inp) inp.disabled = true;
    if (q.t === 'fig') { CUR.fig.reveal(); document.getElementById('tRst').disabled = true; }
    var h = '<b class="' + (ok ? 'okc' : 'badc') + '">' + (ok ? (RUN.hu[q.id] ? '✓ Верно (с подсказкой).' : '✓ Верно.') : skipped ? '✗ Пропущено.' : '✗ Неверно.') + '</b> ';
    if (!ok && (q.t === 'num' || skipped && q.t !== 'fig')) h += 'Правильный ответ: <b>' + esc(ans(q)) + '</b>. ';
    h += fmt(q.e) + (ok ? ' <a href="' + q.r + '">Где это в книге →</a>' : '<div class="t-rev"><span>Повторите в книге</span>' + secL(q) + '</div>');
    fb(h, ok ? 'yes' : 'no', true);
    var last = RUN.i === RUN.list.length - 1;
    document.querySelector('.t-acts2').innerHTML = (RUN.i > 0 ? '<button class="mini" id="tPrev">← Назад</button>' : '') + '<button class="mini on" id="tNext">' + (last ? 'Результат' : 'Дальше') + '</button>';
    if (!restored) CUR.t0 = Date.now();
  }
  function fb(h, k, quiet) { var f = document.getElementById('tFb'); f.className = 't-fb t-' + k; f.innerHTML = h; math(f); if (k !== 'warn' && !quiet) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && CUR && CUR.done && RUN && document.getElementById('tNext') && !(CUR.t0 && Date.now() - CUR.t0 < 400)) { e.preventDefault(); next(); } });
  function prev() { if (RUN && RUN.i > 0) { RUN.i--; question(); top(); } }
  function toHome() { if (PUSHED) { PUSHED = 0; SUPPRESS = 1; try { history.back(); } catch (e) { SUPPRESS = 0; } } home(); top(); }
  window.addEventListener('popstate', function () {
    if (SUPPRESS) { SUPPRESS = 0; return; }
    if (VIEW === 'q' && RUN && RUN.exam) { try { history.pushState({ t: 1 }, ''); } catch (e) {} }
    else if (VIEW === 'q' && RUN && RUN.i > 0) { try { history.pushState({ t: 1 }, ''); } catch (e) {} prev(); }
    else if (VIEW !== 'home') { PUSHED = 0; home(); top(); }
    else PUSHED = 0;
  });
  function next() { if (RUN.i < RUN.list.length - 1) { RUN.i++; question(); top(); } else (RUN.exam ? examResult() : result()); }


  /* ---------- контрольная ---------- */
  function examCard() {
    var ex = ST.exam, opt = function (v, sel) { return '<option value="' + v + '"' + (v === sel ? ' selected' : '') + '>' + v + '</option>'; };
    var nums = CH.map(function (c) { return c.n; }), a = ex && ex.a != null ? ex.a : nums[0], b = ex && ex.b != null ? ex.b : nums[nums.length - 1], n = ex && ex.n ? ex.n : 10;
    return '<div class="t-exam"><div class="t-name">Контрольная работа</div><p class="t-stat">Случайные вопросы из выбранных глав. Правильные ответы и оценка — только в конце.' + (ex && ex.g ? ' Последняя оценка: <b>' + ex.g + '</b> (' + ex.sc + ' из ' + ex.cnt + ').' : '') + '</p>' +
      '<div class="t-xc"><label>Вопросов <select id="xN">' + [10, 15, 20].map(function (v) { return opt(v, n); }).join('') + '</select></label><label>Главы с <select id="xA">' + nums.map(function (v) { return opt(v, a); }).join('') + '</select></label><label>по <select id="xB">' + nums.map(function (v) { return opt(v, b); }).join('') + '</select></label></div>' +
      '<button class="mini on" id="tExam">Начать контрольную</button></div>';
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function startExam(n, a, b) {
    if (a > b) { var t = a; a = b; b = t; }
    var pool = []; CH.forEach(function (c) { if (c.n >= a && c.n <= b) c.qs.forEach(function (q) { pool.push(q); }); });
    var list = shuffle(pool).slice(0, n).map(pick); if (!list.length) return;
    ST.exam = Object.assign(ST.exam || {}, { a: a, b: b, n: n }); save();
    RUN = { exam: 1, n: 'exam', a: a, b: b, cnt: n, list: list, i: 0, score: 0, retry: false, wrong: [], hist: {}, sk: {}, hu: {}, hc: 0, t0: Date.now() };
    if (!PUSHED) { try { history.pushState({ t: 1 }, ''); PUSHED = 1; } catch (e) {} }
    question(); top();
  }
  function examResult() {
    stopFig(); VIEW = 'r'; var n = RUN.list.length, p = RUN.score / n, g = p >= .9 ? 5 : p >= .75 ? 4 : p >= .5 ? 3 : 2, min = Math.max(1, Math.round((Date.now() - RUN.t0) / 60000));
    var msg = g === 5 ? 'Отлично!' : g === 4 ? 'Хорошо, но есть что подтянуть.' : g === 3 ? 'Удовлетворительно — разберите ошибки.' : 'Нужно перечитать разделы ниже и попробовать ещё раз.';
    ST.exam = Object.assign(ST.exam || {}, { g: g, sc: RUN.score, cnt: n }); save();
    var h = '<div class="t-top"><span>Контрольная · главы ' + RUN.a + '–' + RUN.b + '</span></div><div class="t-score">' + g + ' <small>оценка · ' + RUN.score + ' из ' + n + ' · ' + min + ' мин</small></div><p class="t-msg">' + msg + '</p>';
    if (RUN.wrong.length) {
      h += revBlock(RUN.wrong) + '<div class="t-kind">Ошибки</div>';
      RUN.wrong.forEach(function (q) { h += '<div class="t-wr"><p class="t-q">' + fmt(q.q) + '</p>' + (q.t !== 'fig' ? '<p>Правильно: <b>' + fmt(ans(q)) + '</b></p>' : '') + '<p class="t-ex">' + fmt(q.e) + '</p><div class="t-rev"><span>В книге</span>' + secL(q) + '</div></div>'; });
    }
    h += '<div class="t-acts2"><button class="mini on" id="tAgain">Новая контрольная</button><button class="mini" id="tHome">К списку</button></div>';
    root.innerHTML = h; math(root);
    root.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; if (b.id === 'tAgain') startExam(RUN.cnt, RUN.a, RUN.b); else if (b.id === 'tHome') toHome(); };
    top();
  }
  /* ---------- результат ---------- */
  function revBlock(list) {
    var seen = {}, h = '';
    list.forEach(function (q) { if (!seen[q.r]) { seen[q.r] = 1; h += '<li>' + secL(q) + '</li>'; } });
    return '<div class="t-kind">Что повторить</div><ul class="t-revl">' + h + '</ul>';
  }
  function result() {
    stopFig(); VIEW = 'r'; var c = chOf(RUN.n), n = RUN.list.length, p = RUN.score / n;
    var msg = p === 1 ? 'Безупречно!' : p >= .8 ? 'Отличный результат.' : p >= .5 ? 'Неплохо — разберите ошибки.' : 'Стоит перечитать главу и повторить.';
    var h = '<div class="t-top"><span>Глава ' + c.n + ' · ' + esc(c.title) + '</span></div><div class="t-score">' + RUN.score + ' <small>из ' + n + (RUN.hc ? ' · с подсказкой ' + RUN.hc : '') + '</small></div><p class="t-msg">' + msg + '</p>';
    if (RUN.wrong.length) {
      h += revBlock(RUN.wrong) + '<div class="t-kind">Ошибки</div>';
      RUN.wrong.forEach(function (q) { h += '<div class="t-wr"><p class="t-q">' + fmt(q.q) + '</p>' + (q.t !== 'fig' ? '<p>Правильно: <b>' + fmt(ans(q)) + '</b></p>' : '') + '<p class="t-ex">' + fmt(q.e) + '</p><div class="t-rev"><span>В книге</span>' + secL(q) + '</div></div>'; });
    }
    h += '<div class="t-acts2">' + (RUN.wrong.length ? '<button class="mini on" data-retry="' + c.n + '">Повторить ошибки</button>' : '') + '<button class="mini" data-go="' + c.n + '">Пройти заново</button><button class="mini" id="tHome">К списку</button></div>';
    root.innerHTML = h; math(root);
    root.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.go) start(+b.dataset.go, false); else if (b.dataset.retry) start(+b.dataset.retry, true); else if (b.id === 'tHome') toHome(); };
    top();
  }


  /* ---------- статические чертежи к вопросам (описание q.d) ---------- */
  function subn(t) { var m = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄' }; return String(t).replace(/([A-Za-z])([0-4])(?![0-9.])/g, function (_, a, d) { return a + m[d]; }); }
  function drawSpec(box, D) {
    if (typeof JXG === 'undefined') { box.innerHTML = '<div class="nojxg">Не удалось загрузить JSXGraph.</div>'; return; }
    var C = cols(), P = D.p || {}, xs = [], ys = [];
    function pt(n) { return typeof n === 'string' ? P[n] : n; }
    function add(x, y) { xs.push(x); ys.push(y); }
    Object.keys(P).forEach(function (k) { add(P[k][0], P[k][1]); });
    (D.c || []).forEach(function (c) { var o = pt(c[0]); add(o[0] - c[1], o[1] - c[1]); add(o[0] + c[1], o[1] + c[1]); });
    (D.cv || []).forEach(function (cv) { cv.pts.forEach(function (q) { add(q[0], q[1]); }); });
    (D.t || []).forEach(function (t) { add(t[0], t[1]); });
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
    var w = Math.max(x1 - x0, 1e-3), h = Math.max(y1 - y0, 1e-3), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, span = Math.max(w, h);
    var W = Math.max(w * 1.3, h * 1.3 * 1.45, 1), H = Math.max(h * 1.3, W / 1.45); W = H * 1.45 > W ? H * 1.45 : W;
    var b = mk(box, [cx - W / 2, cy + H / 2, cx + W / 2, cy - H / 2]); if (!b) return;
    var u = span * 0.06, cen = [cx, cy];
    function col(f) { return f === 'h' ? C.acc : f === 'g' ? C.mu : C.fg; }
    function st(f, o) { return Object.assign({ strokeColor: col(f), strokeWidth: f === 'h' ? 2.4 : 1.6, dash: f === 'd' ? 2 : 0, highlight: false, fixed: true, withLabel: false }, o || {}); }
    var inv = function (n) { return b.create('point', pt(n), { visible: false, fixed: true, withLabel: false }); };
    function lbl(p, q, txt, f) {
      var A = pt(p), B = pt(q), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      if ((mx - cen[0]) * nx + (my - cen[1]) * ny < 0) { nx = -nx; ny = -ny; }
      b.create('text', [mx + nx * u * 1.3, my + ny * u * 1.3, subn(txt)], { anchorX: 'middle', anchorY: 'middle', fontSize: 15, color: f === 'h' ? C.acc : C.fg, fixed: true, highlight: false });
    }
    (D.fl || []).forEach(function (f) { b.create('polygon', f[0].map(pt), { fillColor: col(f[1]), fillOpacity: .14, borders: { visible: false }, vertices: { visible: false }, highlight: false, fixed: true, withLabel: false }); });
    (D.sec || []).forEach(function (s) { b.create('sector', [inv(s[0]), inv(s[1]), inv(s[2])], { fillColor: col(s[3] || 'h'), fillOpacity: .16, strokeColor: col(s[3]), strokeWidth: 1.6, highlight: false, fixed: true, withLabel: false }); });
    (D.c || []).forEach(function (c) { b.create('circle', [pt(c[0]), c[1]], Object.assign(st(c[2]), { fillColor: 'none' })); if (c[3]) { var o = pt(c[0]); b.create('text', [o[0], o[1] + c[1] + u * 1.4, subn(c[3])], { anchorX: 'middle', fontSize: 15, color: col(c[2]), fixed: true }); } });
    (D.cv || []).forEach(function (cv) { var X = cv.pts.map(function (q) { return q[0]; }), Y = cv.pts.map(function (q) { return q[1]; }); b.create('curve', [X, Y], st(cv.f)); });
    (D.ln || []).forEach(function (l) { b.create('line', [pt(l[0]), pt(l[1])], st(l[2], { straightFirst: true, straightLast: true })); if (l[3]) lbl(l[0], l[1], l[3], l[2]); });
    (D.s || []).forEach(function (s) { b.create('segment', [pt(s[0]), pt(s[1])], st(s[3])); if (s[2]) lbl(s[0], s[1], s[2], s[3]); });
    (D.a || []).forEach(function (a) {
      var V = pt(a[0]), p1 = pt(a[1]), p2 = pt(a[2]), cr = (p1[0] - V[0]) * (p2[1] - V[1]) - (p1[1] - V[1]) * (p2[0] - V[0]); if (cr < 0) { var t = p1; p1 = p2; p2 = t; }
      var an = b.create('angle', [p1, V, p2], { radius: u * (a[4] || 1.9), name: subn(a[3] || ''), fillColor: a[5] === 'h' ? C.acc : C.fg, fillOpacity: .14, strokeColor: a[5] === 'h' ? C.acc : C.fg, strokeWidth: 1.2, highlight: false, fixed: true, label: { color: a[5] === 'h' ? C.acc : C.fg, fontSize: 14, offset: [0, 0] }, withLabel: !!a[3] });
    });
    (D.ra || []).forEach(function (r) {
      var V = pt(r[0]), p1 = pt(r[1]), p2 = pt(r[2]), l1 = Math.hypot(p1[0] - V[0], p1[1] - V[1]) || 1, l2 = Math.hypot(p2[0] - V[0], p2[1] - V[1]) || 1, sz = u * .9, a1 = [(p1[0] - V[0]) / l1 * sz, (p1[1] - V[1]) / l1 * sz], a2 = [(p2[0] - V[0]) / l2 * sz, (p2[1] - V[1]) / l2 * sz];
      b.create('curve', [[V[0] + a1[0], V[0] + a1[0] + a2[0], V[0] + a2[0]], [V[1] + a1[1], V[1] + a1[1] + a2[1], V[1] + a2[1]]], st(r[3] === 'h' ? 'h' : ''));
    });
    (D.t || []).forEach(function (t) { b.create('text', [t[0], t[1], subn(t[2])], { anchorX: 'middle', anchorY: 'middle', fontSize: 15, color: t[3] === 'h' ? C.acc : C.fg, fixed: true, highlight: false }); });
    var hp = D.hp || [], lo = D.lo || {};
    Object.keys(P).forEach(function (k) {
      if (k[0] === '_') return; var q = P[k], dx = q[0] - cen[0], dy = q[1] - cen[1], l = Math.hypot(dx, dy) || 1, off = lo[k] || [dx / l * 15, dy / l * 15];
      var isH = hp.indexOf(k) >= 0, nm = D.nl && D.nl[k] ? D.nl[k] : k;
      b.create('point', q, { name: subn(nm), fixed: true, highlight: false, size: 3, fillColor: isH ? C.acc : C.fg, strokeColor: isH ? C.acc : C.fg, showInfobox: false, label: { offset: off, color: isH ? C.acc : C.fg, fontSize: 15, highlight: false } });
    });
    b.update();
  }

  /* ---------- чертежи-задания ---------- */
  var BRD = null;
  function stopFig() { if (BRD && window.JXG) { try { JXG.JSXGraph.freeBoard(BRD); } catch (e) {} } BRD = null; }
  function cols() { var cs = getComputedStyle(document.documentElement); return { fg: (cs.getPropertyValue('--color-text') || '#111').trim(), mu: (cs.getPropertyValue('--color-muted') || '#777').trim(), acc: '#d9534f' }; }
  function mk(box, bb) {
    if (typeof JXG === 'undefined') { box.innerHTML = '<div class="nojxg">Не удалось загрузить JSXGraph. Обновите страницу.</div>'; return null; }
    BRD = JXG.JSXGraph.initBoard(box.id, { boundingbox: bb, axis: false, showCopyright: false, showNavigation: false, showInfobox: false, keepaspectratio: true, pan: { enabled: false }, zoom: { enabled: false, wheel: false, pinch: false }, browserPan: true });
    return BRD;
  }
  function fixed(b, x, y, name, C, off) { return b.create('point', [x, y], { name: name, fixed: true, size: 3, fillColor: C.fg, strokeColor: C.fg, label: { offset: off || [8, 8], color: C.fg, fontSize: 16 }, showInfobox: false }); }
  function free(b, x, y, name, C, off) { return b.create('point', [x, y], { name: name, size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: off || [8, 8], color: C.acc, fontSize: 16 }, showInfobox: false }); }
  function seg(b, p, q, C, o) { return b.create('segment', [p, q], Object.assign({ strokeColor: C.fg, strokeWidth: 1.6, highlight: false }, o || {})); }
  function dist(p, q) { return Math.hypot(p.X() - q.X(), p.Y() - q.Y()); }
  function ang(v, p, q) { var ux = p.X() - v.X(), uy = p.Y() - v.Y(), wx = q.X() - v.X(), wy = q.Y() - v.Y(); return Math.acos(Math.max(-1, Math.min(1, (ux * wx + uy * wy) / (Math.hypot(ux, uy) * Math.hypot(wx, wy) || 1)))) * 180 / Math.PI; }
  function dashed(o) { return Object.assign({ strokeColor: o.col, strokeWidth: 1.4, dash: 2, highlight: false, fixed: true }, o.extra || {}); }
  /* трапеция AD=a (снизу), BC=b (сверху), высота h; E скользит по AB, F — на CD той же высоты */
  function trap(box, a, bb, h, target, bbox, showQ) {
    var C = cols(), b = mk(box, bbox), dx = (a - bb) / 2, A = fixed(b, 0, 0, 'A', C, [-14, -18]), D = fixed(b, a, 0, 'D', C, [6, -18]), B = fixed(b, dx, h, 'B', C, [-14, 4]), Cc = fixed(b, dx + bb, h, 'C', C, [6, 4]);
    var s = seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, D, C); seg(b, A, D, C, { strokeWidth: 2.2 });
    var E = b.create('glider', [dx * 1.2 / h, 1.2, s], { name: 'E', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [-18, 2], color: C.acc, fontSize: 16 }, showInfobox: false });
    var F = b.create('point', [function () { return a - dx * E.Y() / h; }, function () { return E.Y(); }], { name: 'F', size: 3, fixed: true, fillColor: C.acc, strokeColor: C.acc, label: { offset: [6, 2], color: C.acc, fontSize: 16 }, showInfobox: false });
    seg(b, E, F, C, { strokeColor: C.acc, strokeWidth: 1.8 });
    if (showQ) { b.create('segment', [A, Cc], dashed({ col: C.mu })); b.create('segment', [B, D], dashed({ col: C.mu })); var q = (a * h) / (a + bb); fixed(b, a * bb / (a + bb) * 0 + 6, 4, 'Q', C, [6, -16]); }
    return { reset: function () { E.moveTo([dx * 1.2 / h, 1.2]); }, check: function () { return Math.abs(E.Y() - target) <= .25; },
      reveal: function () { b.create('segment', [[dx * target / h, target], [a - dx * target / h, target]], { strokeColor: C.acc, strokeWidth: 2.4, highlight: false, fixed: true }); } };
  }
  /* окружность радиуса 3 с центром O; A — на оси, P скользит; ok(угол AOP в градусах); marks — углы для подсказки */
  function circ(box, start, ok, marks) {
    var C = cols(), b = mk(box, [-4.5, 4.5, 4.5, -4.5]), O = fixed(b, 0, 0, 'O', C, [-16, -18]), A = fixed(b, 3, 0, 'A', C, [8, -4]);
    var ci = b.create('circle', [O, 3], { strokeColor: C.fg, strokeWidth: 1.5, fillColor: 'none', highlight: false, fixed: true }), r = start * Math.PI / 180;
    var P = b.create('glider', [3 * Math.cos(r), 3 * Math.sin(r), ci], { name: 'P', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [8, 8], color: C.acc, fontSize: 16 }, showInfobox: false });
    seg(b, O, A, C); seg(b, O, P, C, { strokeColor: C.acc, strokeWidth: 1.8 });
    return { reset: function () { P.moveTo([3 * Math.cos(r), 3 * Math.sin(r)]); }, check: function () { return ok(ang(O, A, P)); },
      reveal: function () { marks.forEach(function (m) { var q = m * Math.PI / 180; b.create('segment', [O, [3 * Math.cos(q), 3 * Math.sin(q)]], dashed({ col: C.acc })); }); if (marks.length > 2) for (var i = 0; i < 6; i++) b.create('segment', [[3 * Math.cos(i * Math.PI / 3), 3 * Math.sin(i * Math.PI / 3)], [3 * Math.cos((i + 1) * Math.PI / 3), 3 * Math.sin((i + 1) * Math.PI / 3)]], dashed({ col: C.acc })); } };
  }
  var FIGS = {
    perp90: function (box) {
      var C = cols(), b = mk(box, [-1, 7, 11, -4.5]), A = fixed(b, 1, 0, 'A', C, [-14, -18]), B = fixed(b, 9, 0, 'B', C, [6, -18]), M = free(b, 3.2, 4.2, 'M', C);
      seg(b, M, A, C); seg(b, M, B, C); seg(b, A, B, C, { strokeWidth: 2.2 });
      return { reset: function () { M.moveTo([3.2, 4.2]); }, check: function () { var a = ang(M, A, B); return Math.abs(a - 90) <= 3 && Math.abs(M.Y()) > .4; },
        reveal: function () { var o = b.create('point', [5, 0], { visible: false }); b.create('circle', [o, 4], { strokeColor: C.acc, strokeWidth: 1.6, dash: 2, fillColor: 'none', highlight: false, fixed: true }); } };
    },
    eqdist: function (box) {
      var C = cols(), b = mk(box, [-1, 7, 11, -4.5]), A = fixed(b, 2, 0, 'A', C, [-14, -18]), B = fixed(b, 8, 0, 'B', C, [6, -18]), M = free(b, 2.6, 4.2, 'M', C);
      seg(b, M, A, C); seg(b, M, B, C); seg(b, A, B, C, { strokeWidth: 2.2 });
      return { reset: function () { M.moveTo([2.6, 4.2]); }, check: function () { return Math.abs(dist(M, A) - dist(M, B)) <= .2 && Math.abs(M.Y()) > 1; },
        reveal: function () { b.create('line', [[5, -4], [5, 7]], { strokeColor: C.acc, strokeWidth: 1.6, dash: 2, straightFirst: false, straightLast: false, highlight: false, fixed: true }); } };
    },
    paral: function (box) {
      var C = cols(), b = mk(box, [-1, 7, 17, -3]), Bp = fixed(b, 1, 2, 'B', C, [-14, -16]), A = fixed(b, 4, 4, 'A', C), Cc = fixed(b, 5, 1, 'C', C, [6, -16]),
        D = fixed(b, 10, 2, 'D', C, [-14, -16]), E = fixed(b, 13, 4, 'E', C), Q = free(b, 11, 5.4, 'Q', C);
      seg(b, Bp, A, C); seg(b, Bp, Cc, C); seg(b, D, E, C); seg(b, D, Q, C);
      return { reset: function () { Q.moveTo([11, 5.4]); }, check: function () { var vx = Q.X() - D.X(), vy = Q.Y() - D.Y(), l = Math.hypot(vx, vy); if (l < 1.5) return false; return (vx * 4 + vy * -1) / (l * Math.hypot(4, 1)) >= Math.cos(4 * Math.PI / 180); },
        reveal: function () { b.create('segment', [[10, 2], [14, 1]], { strokeColor: C.acc, strokeWidth: 1.6, dash: 2, highlight: false, fixed: true }); } };
    },
    midl: function (box) {
      var C = cols(), b = mk(box, [-1.5, 7, 12, -2]), A = fixed(b, 0, 0, 'A', C, [-16, -16]), B = fixed(b, 10, 0, 'B', C, [6, -16]), Cc = fixed(b, 7, 5, 'C', C), D = fixed(b, 3, 5, 'D', C, [-16, 6]),
        sd = seg(b, A, D, C), F = fixed(b, 8.5, 2.5, 'F', C, [8, -4]); seg(b, A, B, C); seg(b, B, Cc, C); seg(b, D, Cc, C);
      var E = b.create('glider', [.8, 1.33, sd], { name: 'E', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [-16, 4], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, E, F, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { E.moveTo([.8, 1.33]); }, check: function () { return dist(E, { X: function () { return 1.5; }, Y: function () { return 2.5; } }) <= .35; },
        reveal: function () { b.create('point', [1.5, 2.5], { name: '', size: 3, fillColor: C.fg, strokeColor: C.fg, fixed: true, label: { visible: false } }); } };
    },
    cent: function (box) {
      var C = cols(), b = mk(box, [-1, 8.5, 12, -1.5]), A = fixed(b, 1, 0, 'A', C, [-14, -16]), B = fixed(b, 10, 1, 'B', C, [6, -16]), Cc = fixed(b, 4, 7, 'C', C), P = free(b, 3, 4.6, 'P', C);
      seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, A, C);
      return { reset: function () { P.moveTo([3, 4.6]); }, check: function () { return Math.hypot(P.X() - 5, P.Y() - 8 / 3) <= .35; },
        reveal: function () { [[A, [7, 4]], [B, [2.5, 3.5]], [Cc, [5.5, .5]]].forEach(function (m) { b.create('segment', [m[0], m[1]], dashed({ col: C.acc })); }); b.create('point', [5, 8 / 3], { name: 'M', size: 3, fillColor: C.acc, strokeColor: C.acc, fixed: true, label: { offset: [8, -14], color: C.acc, fontSize: 15 } }); } };
    },
    bis: function (box) {
      var C = cols(), b = mk(box, [-1, 7, 11, -2]), B = fixed(b, 0, 0, 'B', C, [-14, -18]), Cc = fixed(b, 10, 0, 'C', C, [6, -18]), A = fixed(b, 3, 5, 'A', C), s = seg(b, B, Cc, C, { strokeWidth: 2.2 });
      seg(b, A, B, C); seg(b, A, Cc, C);
      var D = b.create('glider', [2, 0, s], { name: 'D', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [-4, -20], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, A, D, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { D.moveTo([2, 0]); }, check: function () { return Math.abs(D.X() - 4.04) <= .25; },
        reveal: function () { b.create('point', [4.04, 0], { name: '', size: 3, fillColor: C.fg, strokeColor: C.fg, fixed: true, label: { visible: false } }); } };
    },
    foot: function (box) {
      var C = cols(), b = mk(box, [-1, 6.5, 11, -2]), A = fixed(b, 0, 0, 'A', C, [-14, -18]), B = fixed(b, 10, 0, 'B', C, [6, -18]), Cc = fixed(b, 3.6, 4.8, 'C', C), s = seg(b, A, B, C, { strokeWidth: 2.2 });
      seg(b, A, Cc, C); seg(b, B, Cc, C);
      var H = b.create('glider', [7, 0, s], { name: 'H', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [-4, -20], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, Cc, H, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { H.moveTo([7, 0]); }, check: function () { return Math.abs(H.X() - 3.6) <= .25; },
        reveal: function () { b.create('point', [3.6, 0], { name: '', size: 3, fillColor: C.fg, strokeColor: C.fg, fixed: true, label: { visible: false } }); } };
    },
    arc30: function (box) {
      var C = cols(), b = mk(box, [-2, 7, 12, -7]), B = fixed(b, 3.5, 0, 'B', C, [-16, -18]), Cc = fixed(b, 6.5, 0, 'C', C, [6, -18]), A = free(b, 1.5, 1.2, 'A', C);
      seg(b, B, Cc, C, { strokeWidth: 2.2 }); seg(b, A, B, C); seg(b, A, Cc, C);
      return { reset: function () { A.moveTo([1.5, 1.2]); }, check: function () { return Math.abs(ang(A, B, Cc) - 30) <= 2 && Math.abs(A.Y()) > .3; },
        reveal: function () { [2.598, -2.598].forEach(function (y) { b.create('circle', [[5, y], 3], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, fillColor: 'none', highlight: false, fixed: true }); }); } };
    },
    rgtC: function (box) {
      var C = cols(), b = mk(box, [-4.5, 5, 7, -4.5]), Cc = fixed(b, 0, 0, 'C', C, [-16, -18]), A = fixed(b, 5, 0, 'A', C, [6, -18]);
      var ci = b.create('circle', [Cc, 3], { strokeColor: C.mu, strokeWidth: 1, dash: 2, fillColor: 'none', highlight: false, fixed: true });
      var B = b.create('glider', [2.298, 1.928, ci], { name: 'B', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [8, 8], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, Cc, A, C); seg(b, Cc, B, C); seg(b, A, B, C);
      return { reset: function () { B.moveTo([2.298, 1.928]); }, check: function () { return Math.abs(ang(Cc, A, B) - 90) <= 3; }, reveal: function () {} };
    },
    ceva: function (box) {
      var C = cols(), b = mk(box, [-1, 8.5, 11, -1.5]), A = fixed(b, 0, 0, 'A', C, [-14, -18]), B = fixed(b, 10, 0, 'B', C, [6, -18]), Cc = fixed(b, 4, 7, 'C', C), s = seg(b, A, B, C, { strokeWidth: 2.2 });
      seg(b, B, Cc, C); seg(b, Cc, A, C);
      var A1 = fixed(b, 7, 3.5, 'A₁', C, [8, 4]), B1 = fixed(b, 4 / 3, 7 / 3, 'B₁', C, [-26, 4]);
      seg(b, A, A1, C, { strokeColor: C.mu, strokeWidth: 1.3 }); seg(b, B, B1, C, { strokeColor: C.mu, strokeWidth: 1.3 });
      var C1 = b.create('glider', [7, 0, s], { name: 'C₁', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [-4, -22], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, Cc, C1, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { C1.moveTo([7, 0]); }, check: function () { return Math.abs(C1.X() - 10 / 3) <= .3; },
        reveal: function () { b.create('point', [10 / 3, 0], { name: '', size: 3, fillColor: C.fg, strokeColor: C.fg, fixed: true, label: { visible: false } }); } };
    },
    trapq: function (box) { return trap(box, 12, 6, 6, 4, [-1, 7.5, 13, -1.5], true); },
    simil: function (box) { return trap(box, 10, 4, 6, 10 - Math.sqrt(40), [-1, 7.5, 11, -1.5], false); },
    tang: function (box) {
      var C = cols(), b = mk(box, [-1, 5.5, 11, -5.5]), O = fixed(b, 3, 0, 'O', C, [-16, -18]), A = fixed(b, 9, 0, 'A', C, [6, -18]);
      var ci = b.create('circle', [O, 3], { strokeColor: C.fg, strokeWidth: 1.6, fillColor: 'none', highlight: false, fixed: true });
      var B = b.create('glider', [6, 0, ci], { name: 'B', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [8, 8], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, O, B, C); seg(b, A, B, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { B.moveTo([6, 0]); }, check: function () { return Math.abs(ang(B, O, A) - 90) <= 3; },
        reveal: function () { [1, -1].forEach(function (k) { b.create('segment', [A, [4.5, k * 2.598]], dashed({ col: C.acc })); }); } };
    },
    insc: function (box) {
      var C = cols(), b = mk(box, [-4.5, 4.5, 4.5, -4.5]), O = fixed(b, 0, 0, 'O', C, [-16, -18]);
      var ci = b.create('circle', [O, 3], { strokeColor: C.fg, strokeWidth: 1.4, fillColor: 'none', highlight: false, fixed: true });
      var Bp = fixed(b, 2.121, -2.121, 'B', C, [8, -18]), Cc = fixed(b, 2.121, 2.121, 'C', C, [8, 6]);
      var A = b.create('glider', [3, 0, ci], { name: 'A', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [8, 8], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, A, Bp, C); seg(b, A, Cc, C);
      return { reset: function () { A.moveTo([3, 0]); }, check: function () { return Math.abs(ang(A, Bp, Cc) - 45) <= 2; }, reveal: function () { seg(b, O, Bp, C, { strokeColor: C.acc, dash: 2 }); seg(b, O, Cc, C, { strokeColor: C.acc, dash: 2 }); } };
    },
    incen: function (box) {
      var C = cols(), b = mk(box, [-1, 8, 11, -1.5]), A = fixed(b, 0, 0, 'A', C, [-14, -18]), B = fixed(b, 10, 0, 'B', C, [6, -18]), Cc = fixed(b, 3, 6, 'C', C), P = free(b, 6, 2, 'I', C);
      seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, A, C);
      return { reset: function () { P.moveTo([6, 2]); }, check: function () { return Math.hypot(P.X() - 3.7444, P.Y() - 2.3141) <= .3; },
        reveal: function () { b.create('circle', [[3.7444, 2.3141], 2.3141], { strokeColor: C.acc, strokeWidth: 1.5, dash: 2, fillColor: 'none', highlight: false, fixed: true }); } };
    },
    cyc: function (box) {
      var C = cols(), b = mk(box, [-4.5, 4.5, 4.5, -4.5]), A = fixed(b, -2.819, -1.026, 'A', C, [-16, -18]), B = fixed(b, 2.298, -1.928, 'B', C, [6, -18]), Cc = fixed(b, 1.5, 2.598, 'C', C, [8, 6]), D = free(b, -1, 1, 'D', C);
      seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, D, C); seg(b, D, A, C);
      return { reset: function () { D.moveTo([-1, 1]); }, check: function () { var an = Math.atan2(D.Y(), D.X()) * 180 / Math.PI; if (an < 0) an += 360; return Math.abs(Math.hypot(D.X(), D.Y()) - 3) <= .15 && an >= 70 && an <= 190; },
        reveal: function () { b.create('circle', [[0, 0], 3], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, fillColor: 'none', highlight: false, fixed: true }); } };
    },
    pw: function (box) {
      var C = cols(), b = mk(box, [-6.5, 6.5, 6.5, -6.5]), O = fixed(b, 0, 0, 'O', C, [-14, -18]);
      b.create('circle', [O, 5], { strokeColor: C.fg, strokeWidth: 1.6, fillColor: 'none', highlight: false, fixed: true });
      var M = free(b, 0.5, 0.5, 'M', C);
      return { reset: function () { M.moveTo([.5, .5]); }, check: function () { return Math.abs(Math.hypot(M.X(), M.Y()) - 3) <= .15; },
        reveal: function () { b.create('circle', [O, 3], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, fillColor: 'none', highlight: false, fixed: true }); } };
    },
    split: function (box) {
      var C = cols(), b = mk(box, [-1, 7, 13, -2]), B = fixed(b, 0, 0, 'B', C, [-14, -18]), Cc = fixed(b, 12, 0, 'C', C, [6, -18]), A = fixed(b, 5, 5, 'A', C), s = seg(b, B, Cc, C, { strokeWidth: 2.2 });
      seg(b, A, B, C); seg(b, A, Cc, C);
      var P = b.create('glider', [9, 0, s], { name: 'P', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [-4, -22], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, A, P, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { P.moveTo([9, 0]); }, check: function () { return Math.abs(P.X() - 4) <= .3; },
        reveal: function () { b.create('point', [4, 0], { name: '', size: 3, fillColor: C.fg, strokeColor: C.fg, fixed: true, label: { visible: false } }); } };
    },
    area12: function (box) {
      var C = cols(), b = mk(box, [-2, 6.5, 9, -6.5]), A = fixed(b, 0, 0, 'A', C, [-16, -18]), B = fixed(b, 6, 0, 'B', C, [6, -18]), Cc = free(b, 2, 2, 'C', C);
      seg(b, A, B, C, { strokeWidth: 2.2 }); seg(b, A, Cc, C); seg(b, B, Cc, C);
      return { reset: function () { Cc.moveTo([2, 2]); }, check: function () { return Math.abs(Math.abs(Cc.Y()) - 4) <= .2; },
        reveal: function () { [4, -4].forEach(function (y) { b.create('line', [[0, y], [1, y]], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, highlight: false, fixed: true }); }); } };
    },
    orth: function (box) {
      var C = cols(), b = mk(box, [-2, 6, 10, -5]), A = fixed(b, 0, 0, 'A', C, [-16, 4]), Cc = fixed(b, 8, 0, 'C', C, [6, 4]), B = fixed(b, 3, -3, 'B', C, [-4, -20]), D = free(b, 6, 4, 'D', C);
      seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, D, C); seg(b, D, A, C);
      b.create('segment', [A, Cc], dashed({ col: C.mu })); seg(b, B, D, C, { strokeColor: C.mu, dash: 2 });
      return { reset: function () { D.moveTo([6, 4]); }, check: function () { return Math.abs(D.X() - 3) <= .2 && D.Y() > .5; },
        reveal: function () { b.create('line', [[3, 0], [3, 1]], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, highlight: false, fixed: true }); } };
    },
    parA: function (box) {
      var C = cols(), b = mk(box, [-2, 6, 10, -1.5]), A = fixed(b, 0, 0, 'A', C, [-16, -18]), B = fixed(b, 4, 0, 'B', C, [6, -18]), D = free(b, 1, 1.5, 'D', C);
      var Cc = b.create('point', [function () { return 4 + D.X(); }, function () { return D.Y(); }], { name: 'C', size: 3, fixed: true, fillColor: C.fg, strokeColor: C.fg, label: { offset: [6, 6], color: C.fg, fontSize: 16 }, showInfobox: false });
      seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, D, C); seg(b, D, A, C);
      return { reset: function () { D.moveTo([1, 1.5]); }, check: function () { return Math.abs(Math.abs(D.Y()) - 3) <= .15; },
        reveal: function () { b.create('line', [[0, 3], [1, 3]], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, highlight: false, fixed: true }); } };
    },
    trH: function (box) {
      var C = cols(), b = mk(box, [-1, 8.5, 13, -1.5]), A = fixed(b, 0, 0, 'A', C, [-14, -18]), D = fixed(b, 10, 0, 'D', C, [6, -18]), B = free(b, 2, 3, 'B', C, [-16, 4]);
      var Cc = b.create('point', [function () { return B.X() + 4; }, function () { return B.Y(); }], { name: 'C', size: 3, fixed: true, fillColor: C.fg, strokeColor: C.fg, label: { offset: [6, 6], color: C.fg, fontSize: 16 }, showInfobox: false });
      seg(b, A, D, C, { strokeWidth: 2.2 }); seg(b, B, Cc, C); seg(b, A, B, C); seg(b, D, Cc, C);
      return { reset: function () { B.moveTo([2, 3]); }, check: function () { return Math.abs(B.Y() - 6) <= .2; },
        reveal: function () { b.create('line', [[0, 6], [1, 6]], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, highlight: false, fixed: true }); } };
    },
    sector: function (box) { return circ(box, 30, function (a) { return Math.abs(a - 90) <= 3; }, [90, 270]); },
    half: function (box) { return circ(box, 60, function (a) { return Math.abs(a - 180) <= 3; }, [180]); },
    hex: function (box) { return circ(box, 20, function (a) { return Math.abs(a - 60) <= 3; }, [60, 120, 180, 240, 300]); },
    midT: function (box) {
      var C = cols(), b = mk(box, [-1, 6.5, 11, -1.5]), A = fixed(b, 0, 0, 'A', C, [-14, -18]), D = fixed(b, 10, 0, 'D', C, [6, -18]), B = fixed(b, 2, 4, 'B', C, [-14, 4]), Cc = fixed(b, 6, 4, 'C', C, [6, 4]);
      seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, D, C); seg(b, D, A, C);
      var E = b.create('glider', [.5, 1, b.create('line', [A, B], { visible: false })], { name: 'E', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [-16, 4], color: C.acc, fontSize: 16 }, showInfobox: false });
      var Fp = b.create('point', [function () { var t = E.Y() / 4; return 10 + t * (6 - 10); }, function () { return E.Y(); }], { name: 'F', size: 3, fixed: true, fillColor: C.fg, strokeColor: C.fg, label: { offset: [6, 4], color: C.fg, fontSize: 16 }, showInfobox: false });
      seg(b, E, Fp, C, { strokeColor: C.acc, strokeWidth: 2 });
      return { reset: function () { E.moveTo([.5, 1]); }, check: function () { return Math.abs(dist(E, Fp) - 7) <= .2; },
        reveal: function () { b.create('line', [[0, 2], [1, 2]], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, highlight: false, fixed: true }); } };
    },
    circC: function (box) {
      var C = cols(), b = mk(box, [-1.5, 7, 10, -2.5]), A = fixed(b, 0, 0, 'A', C, [-14, -18]), B = fixed(b, 8, 0, 'B', C, [6, -18]), Cc = fixed(b, 2, 5, 'C', C, [-4, 8]), O = free(b, 6, 4.5, 'O', C);
      seg(b, A, B, C); seg(b, B, Cc, C); seg(b, Cc, A, C);
      return { reset: function () { O.moveTo([6, 4.5]); }, check: function () { var d = [dist(O, A), dist(O, B), dist(O, Cc)]; return Math.max.apply(0, d) - Math.min.apply(0, d) <= .3; },
        reveal: function () { b.create('circle', [[4, 1.1], Math.hypot(4, 1.1)], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, fillColor: 'none', highlight: false, fixed: true }); } };
    },
    medR: function (box) {
      var C = cols(), b = mk(box, [-1, 7, 13, -2.5]), A = fixed(b, 0, 0, 'A', C, [-14, -18]), B = fixed(b, 12, 0, 'B', C, [6, -18]), Cc = fixed(b, 3.6, 4.8 * 1, 'C', C, [-4, 8]);
      var ab = b.create('line', [A, B], { visible: false });
      var M = b.create('glider', [2.5, 0, ab], { name: 'M', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [6, -18], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, A, B, C, { strokeWidth: 2.2 }); seg(b, Cc, A, C); seg(b, Cc, B, C); seg(b, Cc, M, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { M.moveTo([2.5, 0]); }, check: function () { return Math.abs(M.X() - 6) <= .25 && Math.abs(M.Y()) < .2; },
        reveal: function () { b.create('circle', [[6, 0], 6], { strokeColor: C.acc, strokeWidth: 1.4, dash: 2, fillColor: 'none', highlight: false, fixed: true }); } };
    },
    cath: function (box) {
      var C = cols(), b = mk(box, [-2, 7, 12, -7]), A = fixed(b, 0, 0, 'A', C, [-16, -18]), B = fixed(b, 10, 0, 'B', C, [6, -18]);
      var ci = b.create('circle', [[5, 0], 5], { strokeColor: C.mu, strokeWidth: 1, dash: 2, fillColor: 'none', highlight: false, fixed: true });
      var Cc = b.create('glider', [8.5, 3.571, ci], { name: 'C', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [8, 8], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, A, B, C, { strokeWidth: 2.2 }); seg(b, A, Cc, C, { strokeColor: C.acc, strokeWidth: 1.8 }); seg(b, Cc, B, C);
      return { reset: function () { Cc.moveTo([8.5, 3.571]); }, check: function () { return Math.abs(dist(A, Cc) - 6) <= .15; }, reveal: function () {} };
    },
    cosT: function (box) {
      var C = cols(), b = mk(box, [-4.5, 5, 7.5, -4.5]), A = fixed(b, 0, 0, 'A', C, [-16, -18]), B = fixed(b, 4, 0, 'B', C, [6, -18]);
      var ci = b.create('circle', [A, 3], { strokeColor: C.mu, strokeWidth: 1, dash: 2, fillColor: 'none', highlight: false, fixed: true });
      var Cc = b.create('glider', [2.1, 2.142, ci], { name: 'C', size: 5, fillColor: C.acc, strokeColor: C.acc, label: { offset: [8, 8], color: C.acc, fontSize: 16 }, showInfobox: false });
      seg(b, A, B, C); seg(b, A, Cc, C); seg(b, Cc, B, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { Cc.moveTo([2.1, 2.142]); }, check: function () { return Math.abs(dist(B, Cc) - 5) <= .1; }, reveal: function () {} };
    },
    medh: function (box) {
      var C = cols(), b = mk(box, [-1, 7, 13, -4]), A = fixed(b, 1, 0, 'A', C, [-14, -18]), B = fixed(b, 11, 0, 'B', C, [6, -18]), O = fixed(b, 6, 0, 'O', C, [-4, -20]), Cc = free(b, 3, 5, 'C', C);
      seg(b, A, B, C, { strokeWidth: 2.2 }); seg(b, Cc, A, C); seg(b, Cc, B, C); seg(b, Cc, O, C, { strokeColor: C.acc, strokeWidth: 1.8 });
      return { reset: function () { Cc.moveTo([3, 5]); }, check: function () { return Math.abs(dist(Cc, O) - 5) <= .18 && Math.abs(Cc.Y()) > 1; },
        reveal: function () { b.create('circle', [O, 5], { strokeColor: C.acc, strokeWidth: 1.6, dash: 2, fillColor: 'none', highlight: false, fixed: true }); } };
    }
  };
  home();
})();
