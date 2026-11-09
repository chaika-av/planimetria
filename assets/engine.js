(function () {
  'use strict';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>', ICON_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5.5" width="4" height="13" rx="1"/><rect x="13.5" y="5.5" width="4" height="13" rx="1"/></svg>';
  var REDUCED = false; try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var st = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var root = document.documentElement, body = document.body;

  /* ---------- формулы ---------- */
  /* знак отношения в начале следующей строки повторяется и в конце предыдущей (=, ⇔, ⇒ …) */
  var RELH = /^(?:(?:\\Leftrightarrow|\\Rightarrow|\\approx|\\neq?|\\leq?|\\geq?|\\sim|\\equiv)(?![A-Za-z])|=|<|>)/;
  function relHead(t) { var m = RELH.exec(String(t).replace(/^(?:\s|&|\\ |\;|\\,|\\quad|\\qquad)+/, '')); return m ? m[0] : null; }
  function endsRel(t, rel) { t = String(t).replace(/\s+$/, ''); return t.slice(-rel.length) === rel && (rel.charAt(0) !== '\\' || !/[A-Za-z]$/.test(t.slice(0, -rel.length))) ; }
  function needEol(prev, rel) { return rel && !endsRel(prev, rel) && !/[,.;:]\s*$/.test(String(prev).replace(/\\(?:ldots|dots)\s*$/, '')); }
  function eolAligned(tex) {
    var m = /^\s*\\begin\{aligned\}([\s\S]*)\\end\{aligned\}(\s*(?:\\qquad\s*)?\(\d+\)\s*[.,]?)?\s*$/.exec(tex); if (!m) return tex;
    var body = m[1], rows = [], seps = [], cur = '', depth = 0, k = 0, mm;
    while (k < body.length) {
      var rest = body.slice(k);
      if ((mm = /^\\begin\{/.exec(rest))) { depth++; cur += mm[0]; k += mm[0].length; }
      else if ((mm = /^\\end\{/.exec(rest))) { depth--; cur += mm[0]; k += mm[0].length; }
      else if (depth === 0 && (mm = /^\\\\(\[[^\]]*\])?/.exec(rest))) { rows.push(cur); seps.push(mm[0]); cur = ''; k += mm[0].length; }
      else { cur += body[k]; k++; }
    }
    rows.push(cur); if (rows.length < 2) return tex;
    var ch = false;
    for (var i = 1; i < rows.length; i++) { var rel = relHead(rows[i]); if (needEol(rows[i - 1], rel)) { rows[i - 1] = rows[i - 1].replace(/\s+$/, '') + ' ' + rel; ch = true; } }
    if (!ch) return tex;
    var out = rows[0]; for (var j = 1; j < rows.length; j++) out += seps[j - 1] + rows[j];
    return '\\begin{aligned}' + out + '\\end{aligned}' + (m[2] || '');
  }
  function renderMath(scope) {
    if (typeof katex === 'undefined') return;
    var o = { throwOnError: false, trust: true, strict: false };
    /* номера формул (1), (2)… скрыты */
    $$('.kd,.kx', scope).forEach(function (el) { var t = el.dataset.tex; if (t && !el.dataset.r) el.dataset.tex = t.replace(/(?:\\qquad|\\quad)\s*\(\d+\)/g, '').replace(/&&\s*\(\d+\)/g, ''); });
    $$('.kx', scope).forEach(function (el) { if (el.dataset.r) return; el.dataset.r = 1; try { var tx = el.dataset.tex; if (/\\d?frac|\\binom/.test(tx) && !/^\\displaystyle/.test(tx)) tx = '\\displaystyle ' + tx; katex.render(tx, el, o); } catch (e) { el.textContent = el.dataset.tex; } });
    $$('.kd', scope).forEach(function (el) { if (el.dataset.r) return; el.dataset.r = 1; try { katex.render(eolAligned(el.dataset.tex), el, Object.assign({ displayMode: true }, o)); } catch (e) { el.textContent = el.dataset.tex; } });
    fitFormulas(scope);
  }
  /* формулы без прокрутки: перенос по знакам (CSS) + уменьшение шрифта + разбиение выравниваний на строки */
  var KO = { throwOnError: false, trust: true, strict: false };
  function plainBr(t) { return t.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']'); }
  /* формулы без выравнивания: разбиение по знакам = и ⇒ ⇔ верхнего уровня */
  function splitTopRel(tex) {
    var out = [], cur = '', depth = 0, k = 0, mm;
    while (k < tex.length) {
      var rest = tex.slice(k);
      if ((mm = /^\\(left|begin)\b/.exec(rest))) { depth++; cur += mm[0]; k += mm[0].length; }
      else if ((mm = /^\\(right|end)\b/.exec(rest))) { depth--; cur += mm[0]; k += mm[0].length; }
      else if (tex[k] === '{') { depth++; cur += '{'; k++; }
      else if (tex[k] === '}') { depth--; cur += '}'; k++; }
      else if (depth === 0 && (mm = /^(?:(?:\\Rightarrow|\\Leftrightarrow|\\Longrightarrow|\\Longleftrightarrow|\\approx|\\neq|\\ne|\\leq|\\geq|\\le|\\ge)(?![A-Za-z])|=)/.exec(rest)) && cur.trim()) { out.push(cur); cur = mm[0]; k += mm[0].length; }
      else if ((mm = /^\\[A-Za-z]+/.exec(rest))) { cur += mm[0]; k += mm[0].length; }
      else if (tex[k] === '\\') { cur += tex.substr(k, 2); k += 2; }
      else { cur += tex[k]; k++; }
    }
    out.push(cur); return out;
  }
  function isWrapped(el) {
    var h = el.querySelector('.katex-html'); if (!h) return false;
    var bs = [].filter.call(h.children, function (c) { return c.classList.contains('base'); });
    for (var i = 0; i < bs.length - 1; i++) { var a = bs[i].getBoundingClientRect(), b = bs[i + 1].getBoundingClientRect(); if (a.width > 0 && b.left < a.right - 1) return true; }
    return false;
  }
  function tr(p) { p = p.trim(); return /(^|[^\\])\\$/.test(p) ? p + ' {}' : p; }
  function splitRows(tex) {
    var m = /^\\begin\{aligned\}([\s\S]*)\\end\{aligned\}\s*((?:\\qquad\s*)?\(\d+\))?$/.exec(tex.trim());
    var body = m ? m[1] : tex, tag = m && m[2] ? m[2] : '', rows = [], cur = '', depth = 0, k = 0;
    if (!m) { var tg = /\\qquad\s*(\\left\\langle[\s\S]*|\(\d+\)\s*)$/.exec(tex); if (tg && /^\\qquad/.test(tg[0])) { tag = tg[0]; body = tex.slice(0, tex.length - tg[0].length); } rows = splitTopRel(body); cur = null; }
    if (cur === null) return rows.map(function (r, i, a) { r = tr(r); var t = r; if (i === a.length - 1 && tag) t += tag; return { t: plainBr(t), ind: i > 0, g: 0 }; }).filter(function (r) { return r.t; });
    while (k < body.length) {
      var rest = body.slice(k), mm;
      if ((mm = /^\\begin\{/.exec(rest))) { depth++; cur += mm[0]; k += mm[0].length; }
      else if ((mm = /^\\end\{/.exec(rest))) { depth--; cur += mm[0]; k += mm[0].length; }
      else if (depth === 0 && (mm = /^\\\\(\[[^\]]*\])?/.exec(rest))) { rows.push(cur); cur = ''; k += mm[0].length; }
      else if (depth === 0 && body[k] === '&') { k++; }
      else { cur += body[k]; k++; }
    }
    rows.push(cur);
    return rows.map(function (r, gi) {
      r = tr(r); var ind = false, q = /^(\\qquad\s*|\\quad\s*)+/.exec(r); if (q) r = r.slice(q[0].length);
      if (/^(=|\\Leftrightarrow|\\Rightarrow|\\approx|<|>|\\le|\\ge)/.test(r)) ind = true;
      return { t: r, ind: ind, g: gi };
    }).filter(function (r) { return r.t; }).reduce(function (acc, r) {
      splitTopRel(r.t).forEach(function (p, i) { acc.push({ t: plainBr(tr(p)), ind: i > 0 || r.ind, g: r.g }); }); return acc;
    }, []).map(function (r, i, a) { if (i === a.length - 1 && tag) r.t += '\\qquad' + tag.replace(/^\\qquad\s*/, ''); return r; });
  }
  var REL = /(?:\\Rightarrow|\\Leftrightarrow|\\Longrightarrow|\\Longleftrightarrow|\\approx|\\neq|\\ne|\\leq|\\geq|\\le|\\ge)(?![A-Za-z])|=/;
  /* независимые утверждения внутри строки (\qquad, \quad) — отдельные неделимые части */
  function splitStmts(rows) {
    var out = [];
    rows.forEach(function (r) {
      var t = r.t, depth = 0, k = 0, cut = [], mm;
      while (k < t.length) {
        var rest = t.slice(k);
        if ((mm = /^\\(left|begin)\b/.exec(rest))) { depth++; k += mm[0].length; }
        else if ((mm = /^\\(right|end)\b/.exec(rest))) { depth--; k += mm[0].length; }
        else if (tex_ob(t[k])) { depth++; k++; } else if (t[k] === '}') { depth--; k++; }
        else if (depth === 0 && (mm = /^(\\qquad|\\quad)\s*/.exec(rest))) { var after = rest.slice(mm[0].length); if (k > 0 && after && !/^(\(\d+\)|\\left\\langle)/.test(after)) cut.push([k, k + mm[0].length]); k += mm[0].length; }
        else if ((mm = /^\\[A-Za-z]+/.exec(rest))) k += mm[0].length;
        else if (t[k] === '\\') k += 2; else k++;
      }
      if (!cut.length) { out.push(r); return; }
      var pos = 0;
      cut.forEach(function (c, i) { out.push({ t: t.slice(pos, c[0]), ind: i ? false : r.ind, g: r.g, st: i > 0 }); pos = c[1]; });
      out.push({ t: t.slice(pos), ind: false, g: r.g, st: true });
    });
    /* начало утверждения без знака отношения не отрываем от продолжения */
    for (var i = 0; i < out.length - 1; i++) if (out[i].st && !REL.test(out[i].t) && out[i].g === out[i + 1].g) { out[i + 1] = { t: out[i].t + '\\ ' + out[i + 1].t, ind: out[i + 1].ind, g: out[i].g, st: out[i].st }; out.splice(i, 1); i--; }
    return out;
  }
  function tex_ob(c) { return c === '{'; }
  /* ширины частей → жадная упаковка в строки: переносим только перед знаком отношения, строку заполняем до конца */
  function packRows(el, rows, W) {
    var probe = document.createElement('div'); probe.className = 'kdr probe'; el.appendChild(probe);
    rows.forEach(function (r) { var sp = document.createElement('span'); sp.style.display = 'inline-block'; try { katex.render('\\displaystyle ' + r.t, sp, KO); } catch (e) { sp.textContent = r.t; } probe.appendChild(sp); r.w = sp.getBoundingClientRect().width; });
    var em = parseFloat(getComputedStyle(probe).fontSize) || 19, gap = 0.35 * em, ind = 1.45 * em; el.removeChild(probe);
    var lines = [];
    rows.forEach(function (r) {
      var L = lines[lines.length - 1];
      if (L && L.g === r.g) { var lim = W - (L.n > 0 || L.ind ? ind : 0); var sep = r.st ? '\\qquad ' : '', sw = r.st ? 2 * em : 0; if (L.w + r.w + gap + sw <= lim) { L.t += sep + r.t; L.w += r.w + gap + sw; L.n++; return; } }
      var first = !L || L.g !== r.g; lines.push({ t: r.t, w: r.w, g: r.g, n: 0, ind: first ? r.ind : true });
    });
    for (var li = 1; li < lines.length; li++) { var rl = relHead(lines[li].t); if (needEol(lines[li - 1].t, rl)) lines[li - 1].t = lines[li - 1].t.replace(/\s+$/, '') + ' ' + rl; }
    return lines.map(function (l) { return { t: l.t, ind: l.ind }; });
  }
  function reflow(el, W) {
    var rows = packRows(el, splitStmts(splitRows(el.dataset.tex)), W || el.clientWidth); el.dataset.rows = 1; el.innerHTML = '';
    rows.forEach(function (r) { var d = document.createElement('div'); d.className = 'kdr' + (r.ind ? ' ind' : ''); try { katex.render('\\displaystyle ' + r.t, d, KO); } catch (e) { d.textContent = r.t; } el.appendChild(d); });
  }
  function fitFormulas(scope) {
    $$('.kd, .kx', scope || document).forEach(function (el) {
      if (!el.dataset.r) return;
      var disp = el.classList.contains('kd'), box = disp ? el.parentNode : el, sc = disp ? box.parentNode : null, min = 1, tol = disp ? 1 : 4;
      if (el.dataset.rows) { delete el.dataset.rows; el.innerHTML = ''; try { katex.render(eolAligned(el.dataset.tex), el, Object.assign({ displayMode: true }, KO)); } catch (e) {} }
      el.style.fontSize = ''; el.classList.remove('wide'); if (sc) sc.classList.remove('ov');
      function shrink() {
        el.style.fontSize = ''; var cw = box.clientWidth, sw = box.scrollWidth;
        if (cw > 0 && sw > cw + tol) { el.style.fontSize = Math.max(min, Math.floor(cw / sw * 96) / 100) + 'em'; }
        return box.scrollWidth > box.clientWidth + tol;
      }
      if (disp && box.clientWidth > 0 && isWrapped(el) && splitRows(el.dataset.tex).length > 1) { reflow(el, box.clientWidth - 4); shrink(); }
      else if (box.clientWidth > 0 && shrink() && disp) { reflow(el, box.clientWidth - 4); shrink(); }
      if (box.clientWidth > 0 && box.scrollWidth > box.clientWidth + tol) { min = disp ? 0.66 : 0.8; shrink(); }   /* запасной вариант: единый размер не помещается, чуть уменьшаем только эту формулу */
      if (box.clientWidth > 0 && box.scrollWidth > box.clientWidth + tol) { if (sc) sc.classList.add('ov'); else el.classList.add('wide'); }
    });
    $$('.kd', scope || document).forEach(function (el) { var sc = el.parentNode && el.parentNode.parentNode; if (!sc || !sc.classList || !sc.classList.contains('formula-scroll')) return; sc.classList.toggle('zoomable', !sc.closest('#fz') && !!(el.style.fontSize || sc.classList.contains('ov'))); });
    dupSigns(scope);
  }
  /* при переносе формулы знак действия (+, −, =, ·, ≤ …) повторяется в начале новой строки */
  function dupSigns(scope) {
    $$('.dupsign', scope || document).forEach(function (n) { n.remove(); });
    $$('.formula-block .katex-html, .kdr .katex-html, .kx .katex-html', scope || document).forEach(function (h) {
      var bases = [].filter.call(h.children, function (c) { return c.classList.contains('base'); }); if (bases.length < 2) return;
      var add = [];
      for (var i = 0; i < bases.length - 1; i++) {
        var kids = bases[i].children, k = kids.length - 1, tail = [];
        while (k >= 0 && kids[k].classList.contains('mspace')) { tail.unshift(kids[k]); k--; }
        var last = k >= 0 ? kids[k] : null; if (!last || !(last.classList.contains('mbin') || last.classList.contains('mrel'))) continue;
        var a = bases[i].getBoundingClientRect(), b = bases[i + 1].getBoundingClientRect();
        if (a.width > 0 && b.left < a.right - 1) add.push([bases[i + 1], [last].concat(tail)]);
      }
      add.forEach(function (p) {
        var w = document.createElement('span'); w.className = 'dupsign'; w.setAttribute('aria-hidden', 'true');
        p[1].forEach(function (n) { var c = n.cloneNode(true); $$('[data-h]', c).forEach(function (e) { e.removeAttribute('data-h'); }); c.removeAttribute('data-h'); w.appendChild(c); });
        p[0].insertBefore(w, p[0].firstChild);
      });
      /* проверка после вставки: знак остаётся только там, где строка действительно начинается с него */
      add.forEach(function (p) {
        var w = p[0].firstChild, prev = p[0].previousElementSibling; if (!w || !prev || w.className !== 'dupsign') return;
        var a = prev.getBoundingClientRect(), d = w.getBoundingClientRect();
        if (!(d.left < a.right - 1 && d.top > a.top + 2)) w.remove();
      });
      /* следующая строка начинается со знака «=» (⇔ …): тот же знак ставится и в конце предыдущей строки */
      var add2 = [];
      for (var j = 0; j < bases.length - 1; j++) {
        var kk = bases[j + 1].children, q = 0; while (q < kk.length && (kk[q].classList.contains('mspace') || kk[q].classList.contains('dupsign'))) q++;
        var fs0 = kk[q]; if (!fs0 || !fs0.classList.contains('mrel')) continue;
        var pa = bases[j].getBoundingClientRect(), pb = bases[j + 1].getBoundingClientRect();
        if (pa.width > 0 && pb.left < pa.right - 1 && pb.top > pa.top + 2) add2.push([bases[j], fs0]);
      }
      add2.forEach(function (p) {
        var top0 = p[0].getBoundingClientRect().top, w = document.createElement('span'); w.className = 'dupsign'; w.setAttribute('aria-hidden', 'true');
        var c = p[1].cloneNode(true); $$('[data-h]', c).forEach(function (e) { e.removeAttribute('data-h'); }); c.removeAttribute('data-h'); w.appendChild(c); p[0].appendChild(w);
        if (p[0].getBoundingClientRect().top > top0 + 2) w.remove();
      });
    });
  }
  var fitT; function fitSoon() { clearTimeout(fitT); fitT = setTimeout(function () { fitFormulas(document); }, 120); }

  /* ---------- геометрия ---------- */
  var GEO = window.GEO;

  /* ---------- связка «текст/формула <-> чертёж» ---------- */
  var REG = {}, PRIMARY = {}, ALIAS = {}, ACTIVE = { hover: null, pin: null, step: null };
  function refresh() {
    var on = {};
    [ACTIVE.hover, ACTIVE.pin].concat(ACTIVE.step || []).forEach(function (t) { if (t) (ALIAS[t] || [t]).forEach(function (k) { on[k] = 1; }); });
    Object.keys(REG).forEach(function (k) {
      REG[k].forEach(function (r) { var w = !!on[k]; if (r.on !== w) { r.on = w; try { r.o.setAttribute(w ? r.hi : r.base); } catch (e) {} } });
    });
    $$('[data-h]').forEach(function (el) {
      var k = el.getAttribute('data-h'), al = ALIAS[k] || [k];
      el.classList.toggle('hl', al.length > 0 && al.every(function (x) { return on[x]; }));
    });
  }
  function bind(o, tok, setOnly) {
    if (!tok) return;
    try {
      o.on('over', function () { ACTIVE.hover = tok; refresh(); });
      o.on('out', function () { if (ACTIVE.hover === tok) { ACTIVE.hover = null; refresh(); } });
      o.on('down', function () { ACTIVE.pin = (setOnly || ACTIVE.pin !== tok) ? tok : null; refresh(); });
    } catch (e) {}
  }
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var t = e.target.closest && e.target.closest('[data-h]'); if (t) { ACTIVE.hover = t.getAttribute('data-h'); showFor(ACTIVE.hover); refresh(); }
  });
  document.addEventListener('pointerout', function (e) {
    if (e.pointerType !== 'mouse') return;
    var t = e.target.closest && e.target.closest('[data-h]'); if (t && ACTIVE.hover === t.getAttribute('data-h')) { ACTIVE.hover = null; refresh(); }
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-h]');
    if (t) { var k = t.getAttribute('data-h'); showFor(k); ACTIVE.pin = ACTIVE.pin === k ? null : k; refresh(); }
    else if (ACTIVE.pin && !e.target.closest('.jxgbox, #panel, #fab, .mini, #rail')) { ACTIVE.pin = null; refresh(); }
  });

  /* ---------- чертежи ---------- */
  function subs(t) { return String(t).replace(/([A-Za-zА-Яа-я])_([A-Za-z0-9])/g, '$1<sub>$2</sub>'); }
  var BOARDS = {}, FS = {}; window.BK = { boards: BOARDS, alias: ALIAS };
  function colors() {
    var cs = getComputedStyle(root);
    return { fg: (cs.getPropertyValue('--color-text') || '#111').trim() || '#111', mu: (cs.getPropertyValue('--color-muted') || '#666').trim() || '#666', acc: '#d9534f' };
  }
  function makeCtx(id, b, S, card) {
    var ns = id + '.', C = colors(), X = { b: b, C: C, S: S, id: id };
    function regKey(prim, tok, o, base, hi, setOnly) {
      var key = ns + prim; (REG[key] = REG[key] || []).push({ o: o, base: base, hi: hi, on: false });
      if (tok) {
        var tk = ns + tok; if (!(key in PRIMARY)) PRIMARY[key] = tk;
        ALIAS[tk] = ALIAS[tk] || []; if (ALIAS[tk].indexOf(key) < 0) ALIAS[tk].push(key);
        bind(o, tk, setOnly);
      }
    }
    X.reg = regKey;
    X.alias = function (tok, prims) { ALIAS[ns + tok] = prims.map(function (p) { return ns + p; }); };
    X.P = function (name, xy, off, extra) {
      return b.create('point', xy, Object.assign({ name: name, size: 3, strokeWidth: 1, strokeColor: C.fg, fillColor: C.fg, withLabel: !!name, label: { offset: off || [8, 8], fontSize: 18, color: C.fg } }, extra || {}));
    };
    X.D = function (name, fx, fy, off, extra) {
      return b.create('point', [fx, fy], Object.assign({ name: name, fixed: true, size: 2.4, strokeWidth: 1, strokeColor: C.fg, fillColor: C.fg, withLabel: !!name, label: { offset: off || [8, 8], fontSize: 17, color: C.fg } }, extra || {}));
    };
    X.H = function (fx, fy) { return b.create('point', [fx, fy], { visible: false, fixed: true, name: '', withLabel: false }); };
    X.G = function (name, xy, target, off) {
      return b.create('glider', [xy[0], xy[1], target], { name: name, size: 3, strokeWidth: 1, strokeColor: C.fg, fillColor: C.fg, withLabel: !!name, label: { offset: off || [8, 8], fontSize: 18, color: C.fg } });
    };
    X.pt = function (P, prim, tok) { regKey(prim, tok, P, { size: P.visProp && P.visProp.size ? P.visProp.size : 3, fillColor: C.fg, strokeColor: C.fg }, { size: 5.5, fillColor: C.acc, strokeColor: C.acc }, true); return P; };
    X.seg = function (P, Q, prim, tok, w, extra, hiW) {
      var o = b.create('segment', [P, Q], Object.assign({ fixed: true, strokeColor: C.fg, strokeWidth: w, highlightStrokeColor: C.fg, highlightStrokeWidth: w }, extra || {}));
      regKey(prim, tok, o, { strokeColor: C.fg, strokeWidth: w }, { strokeColor: C.acc, strokeWidth: hiW || w + 2.5 }); return o;
    };
    X.hidden = function (P, Q, prim, tok) {                     /* виден только в подсветке */
      var o = b.create('segment', [P, Q], { fixed: true, strokeColor: C.acc, strokeWidth: 4, strokeOpacity: 0, highlight: false });
      regKey(prim, tok, o, { strokeOpacity: 0 }, { strokeOpacity: 1 }); return o;
    };
    X.lbl = function (x, y, html, prim, tok) {
      var o = b.create('text', [x, y, html], { fixed: true, strokeColor: C.fg, fontSize: 17, highlight: false, anchorX: 'middle', anchorY: 'middle' });
      if (prim) regKey(prim, tok, o, { strokeColor: C.fg }, { strokeColor: C.acc }); return o;
    };
    X.poly = function (f, attrs, prim, tok, base, hi) {
      var n = f().length - 1;
      var pt = function (t) { var p = f(), i = Math.min(Math.floor(t), n - 1), s = t - i; return [p[i][0] + (p[i + 1][0] - p[i][0]) * s, p[i][1] + (p[i + 1][1] - p[i][1]) * s]; };
      var o = b.create('curve', [function (t) { return pt(t)[0]; }, function (t) { return pt(t)[1]; }, 0, n], attrs);
      if (prim) regKey(prim, tok, o, base, hi); return o;
    };
    function arcR(V, P, Q, rad) { var m = Math.min(GEO.dist(V, P), GEO.dist(V, Q)); return Math.max(0.05, Math.min(rad, 0.34 * m)); }
    function crowd(V, P, Q) { return Math.min(GEO.dist(V, P), GEO.dist(V, Q)) < 0.8 || GEO.sweep(V, P, Q)[1] < 0.09; }
    X.arc = function (V, P, Q, rad, prim, tok) {
      var o = b.create('curve', [
        function (t) { return V.X() + arcR(V, P, Q, rad) * Math.cos(t); }, function (t) { return V.Y() + arcR(V, P, Q, rad) * Math.sin(t); },
        function () { return GEO.sweep(V, P, Q)[0]; }, function () { var s = GEO.sweep(V, P, Q); return s[0] + s[1]; }
      ], { strokeColor: C.fg, strokeWidth: 1.6, fixed: true, highlightStrokeColor: C.fg });
      if (prim) regKey(prim, tok, o, { strokeColor: C.fg, strokeWidth: 1.6 }, { strokeColor: C.acc, strokeWidth: 4 });
      o.__crowd = function () { return crowd(V, P, Q); };
      b.on('update', function () { var v = !o.__crowd(); if (o.visProp.visible !== v) o.setAttribute({ visible: v }); });
      return o;
    };
    X.ang = function (V, P, Q, rad, sh, prim, tok) {            /* дуга угла PVQ с подписью sh (можно без подписи) */
      var arcO = X.arc(V, P, Q, rad, prim, tok);
      if (!sh) return;
      var lb = X.lbl(function () { var a = GEO.dist(V, P) || 1, c = GEO.dist(V, Q) || 1, x = (P.X() - V.X()) / a + (Q.X() - V.X()) / c, l = Math.hypot(x, (P.Y() - V.Y()) / a + (Q.Y() - V.Y()) / c) || 1; return V.X() + x / l * (arcR(V, P, Q, rad) + 0.4 * Math.min(1, arcR(V, P, Q, rad) / rad + 0.3)); },
            function () { var a = GEO.dist(V, P) || 1, c = GEO.dist(V, Q) || 1, y = (P.Y() - V.Y()) / a + (Q.Y() - V.Y()) / c, l = Math.hypot((P.X() - V.X()) / a + (Q.X() - V.X()) / c, y) || 1; return V.Y() + y / l * (arcR(V, P, Q, rad) + 0.4 * Math.min(1, arcR(V, P, Q, rad) / rad + 0.3)); }, sh, prim, tok);
      b.on('update', function () { var v = !arcO.__crowd(); if (lb.visProp.visible !== v) lb.setAttribute({ visible: v }); });
    };
    X.right = function (V, P, Q, s, prim, tok) {
      return X.poly(function () {
        var ux = P.X() - V.X(), uy = P.Y() - V.Y(), vx = Q.X() - V.X(), vy = Q.Y() - V.Y(), lu = Math.hypot(ux, uy) || 1, lv = Math.hypot(vx, vy) || 1;
        ux = ux / lu * s; uy = uy / lu * s; vx = vx / lv * s; vy = vy / lv * s;
        return [[V.X() + ux, V.Y() + uy], [V.X() + ux + vx, V.Y() + uy + vy], [V.X() + vx, V.Y() + vy]];
      }, { strokeColor: C.fg, strokeWidth: 1.6, fixed: true, highlightStrokeColor: C.fg }, prim, tok, { strokeColor: C.fg, strokeWidth: 1.6 }, { strokeColor: C.acc, strokeWidth: 4 });
    };
    X.tick = function (P, Q, k) {                               /* засечки равных отрезков */
      for (var i = 0; i < k; i++) (function (i) {
        X.poly(function () {
          var mx = (P.X() + Q.X()) / 2, my = (P.Y() + Q.Y()) / 2, dx = Q.X() - P.X(), dy = Q.Y() - P.Y(), l = Math.hypot(dx, dy) || 1,
              ux = dx / l, uy = dy / l, o = (i - (k - 1) / 2) * 0.17, s = 0.15;
          return [[mx + ux * o - uy * s, my + uy * o + ux * s], [mx + ux * o + uy * s, my + uy * o - ux * s]];
        }, { strokeColor: C.fg, strokeWidth: 1.6, fixed: true, highlight: false });
      })(i);
    };
    X.ro = function (rows) {
      var el = $('.readout', card); if (!el) return;
      el.innerHTML = rows.map(function (r) { return '<div class="ro-row">' + r.map(function (c) { return '<div class="ro-c"><span>' + subs(c[0]) + '</span><b>' + c[1] + '</b></div>'; }).join('') + '</div>'; }).join('');
    };
    X.upd = function (fn) { b.on('update', fn); };
    /* анимация: X.anim({ dur:мс, label:'…', set:function(t){…}, steps:[[t,'подпись'],…] }) — кнопка ▶ + ползунок времени */
    X.anim = function (o) {
      var old = $('.animbar', card); if (old) old.remove();
      var bar = document.createElement('div'); bar.className = 'animbar';
      bar.innerHTML = '<button type="button" class="mini ico play" aria-label="Запустить анимацию">' + ICON_PLAY + '</button><span class="alab">' + (o.label || 'Анимация') + '</span>' +
        '<input type="range" min="0" max="1000" value="0" aria-label="Ход анимации" hidden><span class="astep"></span>';
      var anchor = $('.readout', card) || $('.jxgbox', card); anchor.parentNode.insertBefore(bar, anchor);
      var btn = $('.play', bar), rg = $('input', bar), st = $('.astep', bar), t = 0, raf = 0, last = 0, dur = o.dur || 6000;
      function show(v) {
        t = Math.max(0, Math.min(1, v)); rg.value = Math.round(t * 1000);
        try { o.set(t); b.update(); } catch (e) {}
        var txt = ''; (o.steps || []).forEach(function (s) { if (t >= s[0]) txt = s[1]; }); st.textContent = txt;
      }
      function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; btn.innerHTML = ICON_PLAY; btn.classList.remove('playing'); btn.setAttribute('aria-label', 'Запустить анимацию'); }
      function tick(ts) {
        if (!last) last = ts; var dt = ts - last; last = ts;
        if (REDUCED) { show(1); stop(); return; }
        show(t + dt / dur);
        if (t >= 1) { stop(); return; }
        raf = requestAnimationFrame(tick);
      }
      btn.addEventListener('click', function () {
        if (raf) { stop(); return; }
        if (t >= 1) show(0);
        btn.innerHTML = ICON_PAUSE; btn.classList.add('playing'); btn.setAttribute('aria-label', 'Пауза'); last = 0; raf = requestAnimationFrame(tick);
      });
      rg.addEventListener('input', function () { stop(); show(rg.value / 1000); });
      card._animStop = stop;
      if (o.t0 !== null) show(o.t0 || 0);
    };
    return X;
  }
  function freeFig(id) {
    var cc = document.querySelector('.figcard[data-fig="' + id + '"]'); if (cc && cc._animStop) { cc._animStop(); cc._animStop = null; }
    if (BOARDS[id]) { try { JXG.JSXGraph.freeBoard(BOARDS[id]); } catch (e) {} delete BOARDS[id]; }
    [REG, PRIMARY, ALIAS].forEach(function (m) { Object.keys(m).forEach(function (k) { if (k.indexOf(id + '.') === 0) delete m[k]; }); });
  }
  /* подгонка вида по содержимому: чертёж целиком помещается в рамку (в пикселях), при перетаскивании рамка растёт */
  var PADPX = 30;
  function extentsOf(b) {
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    function add(x, y) { if (isFinite(x) && isFinite(y) && Math.abs(x) < 1e4 && Math.abs(y) < 1e4) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
    b.objectsList.forEach(function (el) {
      try {
        if (el.visProp && (el.visProp.visible === false || el.visProp.visible === 'false')) return;
        if (el.elType === 'point' || el.elType === 'glider') add(el.X(), el.Y());
        else if (el.elType === 'segment') { add(el.point1.X(), el.point1.Y()); add(el.point2.X(), el.point2.Y()); }
        else if (el.elType === 'curve' && el.points) { for (var i = 0; i < el.points.length; i += 3) add(el.points[i].usrCoords[1], el.points[i].usrCoords[2]); }
        else if (el.elType === 'circle') { var c = el.center, r = el.Radius(); add(c.X() - r, c.Y() - r); add(c.X() + r, c.Y() + r); }
      } catch (e) {}
    });
    return [x0, y0, x1, y1];
  }
  function fitView(b, base, card, box) {
    var W = box.clientWidth, H = box.clientHeight, e = extentsOf(b);
    if (!W || !H || e[0] > e[2]) { return; }
    var ew = Math.max(e[2] - e[0], 0.5), eh = Math.max(e[3] - e[1], 0.5), cx = (e[0] + e[2]) / 2, cy = (e[1] + e[3]) / 2;
    var free = !railEl && !card.classList.contains('pinned');
    if (free) {                                    /* на телефоне высота рамки — по форме чертежа */
      var s0 = (W - 2 * PADPX) / ew, hn = Math.round(eh * s0 + 2 * PADPX);
      H = Math.max(230, Math.min(Math.round(W * 1.2), hn)); box.style.setProperty('--fh', H + 'px'); try { b.resizeContainer(W, H, true); } catch (er) {}
    } else box.style.removeProperty('--fh');
    var s = Math.min((W - 2 * PADPX) / ew, (H - 2 * PADPX) / eh), hw = W / 2 / s, hh = H / 2 / s;
    var fit = [cx - hw, cy + hh, cx + hw, cy - hh];
    try { b.setBoundingBox(fit, true); } catch (er) { return; }
    autoFit(b, fit, PADPX / s);
  }
  function refitBox(b, box) {
    var W = box.clientWidth, H = box.clientHeight, e = extentsOf(b); if (!W || !H || e[0] > e[2]) return;
    var ew = Math.max(e[2] - e[0], 0.5), eh = Math.max(e[3] - e[1], 0.5), s = Math.min((W - 2 * PADPX) / ew, (H - 2 * PADPX) / eh);
    try { b.setBoundingBox([(e[0] + e[2]) / 2 - W / 2 / s, (e[1] + e[3]) / 2 + H / 2 / s, (e[0] + e[2]) / 2 + W / 2 / s, (e[1] + e[3]) / 2 - H / 2 / s], true); } catch (er) {}
  }
  function autoFit(b, base, m) {
    var bw = base[2] - base[0], bh = base[1] - base[3], cx0 = (base[0] + base[2]) / 2, cy0 = (base[1] + base[3]) / 2, cur = 1, busy = false;
    function run() {
      if (busy) return; busy = true;
      try {
        var e = extentsOf(b); if (e[0] > e[2]) return;
        var need = Math.max(1, (e[2] - e[0] + 2 * m) / bw, (e[3] - e[1] + 2 * m) / bh);
        if (need > cur * 1.0001 || (cur > 1 && need < cur * 0.8)) {
          cur = need; var cx = cx0, cy = cy0;
          if (need > 1) { cx = (e[0] + e[2]) / 2; cy = (e[1] + e[3]) / 2; }
          b.setBoundingBox([cx - cur * bw / 2, cy + cur * bh / 2, cx + cur * bw / 2, cy - cur * bh / 2], true);
        }
      } catch (er) {} busy = false;
    }
    b.on('update', run);
  }
  /* подписи точек: выбираем положение, где буква не лежит на точках, отрезках и других подписях */
  function placeLabels(b) {
    try {
      var box = b.containerObj, pts = [], segs = [];
      b.objectsList.forEach(function (el) {
        if (el.visProp && (el.visProp.visible === false || el.visProp.visible === 'false')) return;
        if ((el.elType === 'point' || el.elType === 'glider') && isFinite(el.X())) pts.push(el);
        else if (el.elType === 'segment' || el.elType === 'line') { try { segs.push(el); } catch (e) {} }
      });
      function sc(p) { return [p.coords.scrCoords[1], p.coords.scrCoords[2]]; }
      var segPx = segs.map(function (g) { try { var a = sc(g.point1), c = sc(g.point2); return [a[0], a[1], c[0], c[1], g.elType === 'line']; } catch (e) { return null; } }).filter(Boolean);
      var W = box.clientWidth, H = box.clientHeight, placed = [];
      b.objectsList.forEach(function (el) { if (el.elType === 'text' && el.rendNode && el.visProp.visible !== false) { try { var q = el.rendNode.getBoundingClientRect(), bq = box.getBoundingClientRect(); if (q.width) placed.push([q.left - bq.left, q.top - bq.top, q.right - bq.left, q.bottom - bq.top]); } catch (e) {} } });
      function rectHit(r, ax, ay, bx, by, inf) {
        var n = inf ? 40 : 14, dx = bx - ax, dy = by - ay, i, t, x, y, hits = 0;
        for (i = 0; i <= n; i++) { t = inf ? (i - n / 2) * 12 / Math.max(1, Math.hypot(dx, dy)) : i / n; x = ax + dx * t; y = ay + dy * t; if (x >= r[0] - 1 && x <= r[2] + 1 && y >= r[1] - 1 && y <= r[3] + 1) hits++; }
        return hits;
      }
      var CAND = [[8, 8], [8, -16], [-22, 8], [-22, -16], [-7, 14], [-7, -24], [14, -4], [-26, -4], [12, 20], [-28, 18], [12, -28], [-30, -26]];
      pts.forEach(function (P) {
        var L = P.label; if (!L || !L.rendNode || !P.visProp.withlabel && P.visProp.withlabel !== undefined) return;
        var off = (L.visProp && L.visProp.offset) || [8, 8], cur = [off[0], off[1]];
        var p = sc(P), best = null, bestC = 1e9, w, h;
        var tx = L.rendNode.getBoundingClientRect(), bx = box.getBoundingClientRect(); w = tx.width || 14; h = tx.height || 18;
        if (!tx.width) return;
        /* прямоугольник подписи при текущем смещении (8, 8) в координатах рамки */
        var r0 = [tx.left - bx.left, tx.top - bx.top];
        [cur].concat(CAND).forEach(function (o, k) {
          var r = [r0[0] + (o[0] - cur[0]), r0[1] - (o[1] - cur[1]), 0, 0]; r[2] = r[0] + w; r[3] = r[1] + h;
          var c = k ? k * 0.6 + 6 : 0;
          if (r[0] < 2 || r[1] < 2 || r[2] > W - 2 || r[3] > H - 2) c += 60;
          pts.forEach(function (Q) { var q = sc(Q), qx = Math.max(r[0], Math.min(q[0], r[2])), qy = Math.max(r[1], Math.min(q[1], r[3])); if (Math.hypot(qx - q[0], qy - q[1]) < 6) c += (Q === P ? 70 : 50); });
          segPx.forEach(function (g) { c += 3 * rectHit(r, g[0], g[1], g[2], g[3], g[4]); });
          placed.forEach(function (q) { if (q && !(r[2] < q[0] || r[0] > q[2] || r[3] < q[1] || r[1] > q[3])) c += 40; });
          if (c < bestC) { bestC = c; best = { o: o, r: r }; }
        });
        if (best) { placed.push(best.r); if (best.o[0] !== cur[0] || best.o[1] !== cur[1]) { try { L.visProp.offset = [best.o[0], best.o[1]]; L.setAttribute({ offset: [best.o[0], best.o[1]] }); } catch (e) {} } }
      });
      b.update();
    } catch (e) {}
  }
  /* ---------- цветные соответствия: одинаковые/связанные элементы одним цветом в тексте и на чертеже ---------- */
  var PAL = ['#2f7de1', '#e07b1f', '#2a9d6f', '#8e5bd1', '#d6336c', '#0f9fb0'];
  function COLG() { try { return localStorage.getItem('bk-cg') !== '0'; } catch (e) { return true; } }
  function tokHash(t) { var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  var CMAP = {};
  function tintAll() { var ks = Object.keys(CMAP); if (!ks.length) return; $$('[data-h]').forEach(function (el) { var c = CMAP[el.getAttribute('data-h')]; if (c !== undefined && el.getAttribute('data-c') !== String(c)) el.setAttribute('data-c', c); }); }
  var tq = 0; try { new MutationObserver(function (ms) { if (tq) return; tq = requestAnimationFrame(function () { tq = 0; tintAll(); }); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  var NOCOL = { s84: 1, w144: 1 };                                                 /* рисунки, где ссылки в тексте работают при наведении, но без цветной заливки */
  function colorGroups(id) {
    var on = COLG(), usedC = {}, taken = {}, MAXC = 4;
    function paintable(mem) { return mem.some(function (k) { return (REG[k] || []).some(function (r) { return r.base && !(r.o.elType && r.o.elType === 'point'); }); }); }
    var toks = Object.keys(ALIAS).filter(function (tk) { return tk.indexOf(id + '.') === 0 && ALIAS[tk] && ALIAS[tk].length >= 1; });
    var info = {};
    toks.forEach(function (tk) { var mem = ALIAS[tk], els = $$('[data-h="' + tk.replace(/"/g, '\\"') + '"]'); var nsrc = els.length + $$('[data-tex*="h=' + tk.replace(/"/g, '') + '}"]').filter(function (e) { return !e.dataset.r || !e.querySelector('[data-h]'); }).length; info[tk] = { mem: mem, els: els, n: nsrc, sc: nsrc + mem.length * 0.5 + (/=/.test(tk) ? 0.25 : 0) }; els.forEach(function (el) { el.removeAttribute('data-c'); }); delete CMAP[tk]; });
    if (!on || NOCOL[id]) return;
    toks = toks.filter(function (tk) { return info[tk].n && paintable(info[tk].mem); });
    toks.sort(function (x, y) { return info[y].sc - info[x].sc || x.localeCompare(y); });
    var used = 0;
    toks.forEach(function (tk) {
      if (used >= MAXC) return;
      var mem = info[tk].mem, els = info[tk].els;
      if (mem.some(function (k) { return taken[k]; })) return;            /* элемент уже входит в другую цветную группу — не красим, чтобы цвета текста и чертежа не расходились */
      var i = tokHash(tk) % PAL.length, n = 0; while (usedC[i] && n++ < PAL.length) i = (i + 1) % PAL.length; usedC[i] = 1; used++;
      mem.forEach(function (k) { taken[k] = 1; (REG[k] || []).forEach(function (r) {
        if (!r.base || (r.o.elType && r.o.elType === 'point')) return;
        r.base = Object.assign({}, r.base, { strokeColor: PAL[i] }); try { if (!r.on) r.o.setAttribute({ strokeColor: PAL[i] }); } catch (e) {}
      }); });
      els.forEach(function (el) { el.setAttribute('data-c', i); }); CMAP[tk] = i;
    });
    tintAll();
  }
  function buildFig(card) {
    var id = card.dataset.fig, spec = window.FIGS && window.FIGS[id], box = $('.jxgbox', card);
    if (!spec) return;
    freeFig(id); box.id = 'jxg-' + id; box.innerHTML = '';
    if (typeof JXG === 'undefined') { box.innerHTML = '<div class="nojxg">Не удалось загрузить JSXGraph (нужен интернет). Обновите страницу.</div>'; return; }
    var S = FS[id] || (FS[id] = spec.state());
    try {
      var b = JXG.JSXGraph.initBoard(box.id, { boundingbox: spec.bbox, axis: false, showCopyright: false, showNavigation: false, showInfobox: false, keepaspectratio: true,
        pan: { enabled: false }, zoom: { enabled: false, wheel: false, pinch: false }, browserPan: true });
      BOARDS[id] = b; spec.build(makeCtx(id, b, S, card)); colorGroups(id); fitView(b, spec.bbox, card, box); placeLabels(b); b.update(); try { hintFor(card); } catch (e) {}
    } catch (e) { box.innerHTML = '<div class="nojxg">Ошибка чертежа ' + id + ': ' + e.message + '</div>'; }
    ACTIVE.hover = null; refresh();
  }
  /* ---------- ПК: чертежи плавают справа ---------- */
  var cards = $$('.figcard[data-fig]'), railEl = null, curFig = null, dmq = window.matchMedia('(min-width:1200px)');
  cards.forEach(function (c) {
    var ph = document.createElement('div'); ph.className = 'figph'; ph.dataset.for = c.dataset.fig;
    var hb = $('.fig-head b', c), cp = $('.fig-head .cap', c);
    ph.innerHTML = '<b>' + (hb ? hb.textContent : '') + '</b> ' + (cp ? cp.textContent : '') + ' <span>→ справа</span>';
    ph.tabIndex = 0; ph.setAttribute('role', 'button');
    ph.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(c.dataset.fig); } });
    var jb = $('.jxgbox', c); if (jb) { jb.setAttribute('role', 'img'); jb.setAttribute('aria-label', (hb ? hb.textContent : '') + ' ' + (cp ? cp.textContent : '')); }
    c.parentNode.insertBefore(ph, c); c._ph = ph;
    ph.addEventListener('click', function () { setActive(c.dataset.fig); });
  });
  function cardOf(id) { for (var i = 0; i < cards.length; i++) if (cards[i].dataset.fig === id) return cards[i]; return null; }
  function sizeBoard(c) { var b = BOARDS[c.dataset.fig], bx = $('.jxgbox', c); if (b && bx.clientWidth) { try { b.resizeContainer(bx.clientWidth, bx.clientHeight); b.update(); } catch (e) {} } }
  function setActive(id) {
    if (!railEl || !id || id === curFig) return; var c = cardOf(id); if (!c) return; curFig = id;
    cards.forEach(function (x) { x.classList.toggle('act', x === c); x._ph.classList.toggle('act', x === c); });
    if (!BOARDS[id]) buildFig(c); else sizeBoard(c);
  }
  function showFor(tok) { if (!railEl || !tok) return; for (var i = 0; i < cards.length; i++) if (tok.indexOf(cards[i].dataset.fig + '.') === 0) { setActive(cards[i].dataset.fig); return; } }
  function byScroll() {
    if (!railEl) return; var pick = cards[0], lim = window.innerHeight * 0.55;
    cards.forEach(function (c) { if (c._ph.getBoundingClientRect().top < lim) pick = c; });
    if (pick) setActive(pick.dataset.fig);
  }
  var rq; window.addEventListener('scroll', function () { if (rq) return; rq = requestAnimationFrame(function () { rq = 0; byScroll(); }); }, { passive: true });
  var io = null;
  function lazyBuild() {
    if (!('IntersectionObserver' in window)) { buildFigs(document); cards.forEach(sizeBoard); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { var c = en.target; io.unobserve(c); if (!BOARDS[c.dataset.fig]) buildFig(c); } }); }, { rootMargin: '700px 0px' });
    cards.forEach(function (c) { if (BOARDS[c.dataset.fig]) sizeBoard(c); else io.observe(c); });
  }
  function layout() {
    if (!cards.length) return;
    if (dmq.matches) {
      if (!railEl) { railEl = document.createElement('aside'); railEl.id = 'rail'; railEl.setAttribute('aria-label', 'Чертёж'); body.appendChild(railEl); }
      if (io) { io.disconnect(); io = null; }
      body.classList.add('railon'); curFig = null;
      cards.forEach(function (c) { c.classList.remove('pinned'); railEl.appendChild(c); });
      byScroll();
    } else {
      body.classList.remove('railon'); curFig = null;
      cards.forEach(function (c) { c.classList.remove('act'); c._ph.classList.remove('act'); c._ph.after(c); });
      railEl = null; var r = $('#rail'); if (r) r.remove();
      lazyBuild();
    }
    fitSoon();
  }
  if (dmq.addEventListener) dmq.addEventListener('change', layout); else dmq.addListener(layout);
  function buildFigs(scope) { $$('.figcard[data-fig]', scope).forEach(function (c) { if (!BOARDS[c.dataset.fig]) buildFig(c); }); }
  function rebuildAll() { $$('.figcard[data-fig]').forEach(function (c) { if (BOARDS[c.dataset.fig]) buildFig(c); }); }
  $$('.figcard').forEach(function (card) {
    var pin = $('.pinbtn', card), rst = $('.rstbtn', card);
    if (pin) pin.addEventListener('click', function () {
      var on = card.classList.toggle('pinned'); pin.classList.toggle('on', on); pin.setAttribute('aria-pressed', on ? 'true' : 'false');
      setTimeout(function () { var b = BOARDS[card.dataset.fig], bx = $('.jxgbox', card); try { b.resizeContainer(bx.clientWidth, bx.clientHeight, true); refitBox(b, bx); b.update(); } catch (e) {} }, 60);
    });
    if (rst) rst.addEventListener('click', function () { delete FS[card.dataset.fig]; buildFig(card); });
  });
  window.addEventListener('resize', fitSoon);
  window.addEventListener('resize', function () {
    Object.keys(BOARDS).forEach(function (id) { var bx = document.getElementById('jxg-' + id); if (bx && bx.clientWidth) { try { BOARDS[id].resizeContainer(bx.clientWidth, bx.clientHeight); BOARDS[id].update(); } catch (e) {} } });
  });

  /* ---------- панель ---------- */
  function openPanel(v) { body.classList.toggle('open', v); var f = $('#fab'); if (f) f.setAttribute('aria-expanded', v ? 'true' : 'false'); }
  $('#fab').addEventListener('click', function () { openPanel(!body.classList.contains('open')); });
  $('#pClose').addEventListener('click', function () { openPanel(false); });
  $('#scrim').addEventListener('click', function () { openPanel(false); });

  /* ---------- оформление ---------- */
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var THEME_BG = { light: '#ffffff', sepia: '#f4ecd8', dark: '#262624' };
  function theme(m, rebuild) {
    var t = m === 'dark' || m === 'sepia' ? m : 'light'; m = t;
    root.setAttribute('data-theme', t);
    $$('#themeSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === m); });
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute('content', THEME_BG[t]);
    st.set('bk-theme2', m); if (rebuild) rebuildAll();
  }
  (function () {
    var seg = $('#themeSeg'); if (!seg || $('button[data-t="sepia"]', seg)) return;
    var sb = document.createElement('button'); sb.dataset.t = 'sepia'; var dk = $('button[data-t="dark"]', seg); seg.insertBefore(sb, dk);
    var A = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var IC = {
      light: A + '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></svg>',
      sepia: A + '<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13"/></svg>',
      dark: A + '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
      auto: A + '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>'
    }, LB = { light: 'Светлая тема', sepia: 'Сепия', dark: 'Тёмная тема', auto: 'Как в системе' };
    $$('button[data-t="auto"]', seg).forEach(function (b) { b.remove(); });
    $$('button', seg).forEach(function (b) { var k = b.dataset.t; if (IC[k]) { b.innerHTML = IC[k]; b.setAttribute('aria-label', LB[k]); b.title = LB[k]; b.classList.add('ti'); } });
  })();
  function fs(v) { v = Math.min(1.5, Math.max(0.8, Math.round(v * 100) / 100)); root.style.setProperty('--fs', v); $('#fsVal').textContent = Math.round(v * 100) + '%'; st.set('bk-fs', v); }
  $$('#themeSeg button').forEach(function (b) { b.addEventListener('click', function () { theme(b.dataset.t, true); }); });
  $('#fsMinus').addEventListener('click', function () { fs(st.get('bk-fs', 1) - 0.05); fitSoon(); });
  $('#fsPlus').addEventListener('click', function () { fs(st.get('bk-fs', 1) + 0.05); fitSoon(); });
  theme(st.get('bk-theme2', 'light'), false); fs(st.get('bk-fs', 1));

  /* настройки наверху панели (над поиском): тема, размер шрифта, печатная версия, «экран не гаснет» */
  (function () {
    var seg = $('#themeSeg'), fsr = $('.fs'), q = $('#q'); if (!seg || !fsr || !q || $('#pSet')) return;
    var lab = seg.previousElementSibling; if (lab && lab.classList.contains('lab')) lab.style.display = 'none';
    var box = document.createElement('div'); box.id = 'pSet'; q.parentNode.insertBefore(box, q); box.appendChild(seg); box.appendChild(fsr);
    var A = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    function icoBtn(id, svg, label, tag, host) { var el = document.createElement(tag || 'button'); if (!tag) el.type = 'button'; el.id = id; el.className = 'ib'; el.innerHTML = svg; el.setAttribute('aria-label', label); el.title = label; if (host) host.appendChild(el); return el; }
    /* печатный вариант: сюда позже встанет настоящая ссылка (атрибут data-href) */
    var lc = $('main.chapter'), isLit = /(^|\/)lit\.html$/.test(location.pathname);
    if (isLit && lc) {
      var pr = icoBtn('pdfBtn', A + '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/></svg>' + '<span>Печатный вариант (PDF)</span>', 'Печатный вариант (PDF)', 'a', null);
      pr.className = 'pdflink'; pr.setAttribute('role', 'button'); pr.setAttribute('href', '#');
      pr.addEventListener('click', function (e) { var h = pr.getAttribute('data-href'); if (!h) { e.preventDefault(); return; } pr.setAttribute('href', h); });
      var nv = $('.chnav', lc); if (nv) lc.insertBefore(pr, nv); else lc.appendChild(pr);
    }
    /* настройки чтения: интервал строк, ширина колонки, размер формул */
    (function () {
      var LH = { a: [.92, 'Плотно'], b: [1, 'Обычно'], c: [1.14, 'Свободно'] }, MW = { a: [34, 'Уже'], b: [40, 'Обычно'], c: [48, 'Шире'] };
      var rs = document.createElement('div'); rs.id = 'rSet';
      rs.innerHTML = '<div class="rs-row"><span class="rs-l">Строки</span><div class="rs-seg" data-k="lh"></div></div><div class="rs-row rs-mw"><span class="rs-l">Ширина текста</span><div class="rs-seg" data-k="mw"></div></div><div class="rs-row"><span class="rs-l">Цвета соответствий (текст и чертёж)</span><div class="rs-seg" data-k="cg"></div></div><div class="rs-row"><span class="rs-l">Формулы</span><div class="rs-fm"><button type="button" id="mfMinus" aria-label="Формулы меньше">−</button><span id="mfVal">100%</span><button type="button" id="mfPlus" aria-label="Формулы больше">+</button></div></div>';
      box.appendChild(rs);
      function fill(k, M) { var h = ''; for (var i in M) h += '<button type="button" data-v="' + i + '">' + M[i][1] + '</button>'; $('.rs-seg[data-k="' + k + '"]', rs).innerHTML = h; }
      fill('lh', LH); fill('mw', MW); $('.rs-seg[data-k="cg"]', rs).innerHTML = '<button type="button" data-v="1">Вкл</button><button type="button" data-v="0">Выкл</button>';
      function applyCG(v, rb) { try { localStorage.setItem('bk-cg', v); } catch (e) {} $$('.rs-seg[data-k="cg"] button', rs).forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); }); if (rb) { $$('[data-c]').forEach(function (el) { el.removeAttribute('data-c'); }); rebuildAll(); } }
      function applyLH(v) { if (!LH[v]) v = 'b'; root.style.setProperty('--lhk', LH[v][0]); $$('.rs-seg[data-k="lh"] button', rs).forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); }); st.set('bk-lh', v); }
      function applyMW(v) { if (!MW[v]) v = 'b'; root.style.setProperty('--measure', MW[v][0] + 'rem'); $$('.rs-seg[data-k="mw"] button', rs).forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); }); st.set('bk-mw', v); }
      function applyMF(v) { v = Math.min(1.4, Math.max(0.85, Math.round(v * 100) / 100)); root.style.setProperty('--mf', v); $('#mfVal', rs).textContent = Math.round(v * 100) + '%'; st.set('bk-mf', v); }
      rs.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var sg = b.closest('.rs-seg');
        if (sg) { if (sg.dataset.k === 'lh') applyLH(b.dataset.v); else if (sg.dataset.k === 'cg') applyCG(b.dataset.v, true); else applyMW(b.dataset.v); fitSoon(); return; }
        if (b.id === 'mfMinus') applyMF(st.get('bk-mf', 1) - 0.05); else if (b.id === 'mfPlus') applyMF(st.get('bk-mf', 1) + 0.05); else return; fitSoon();
      });
      applyLH(st.get('bk-lh', 'b')); applyMW(st.get('bk-mw', 'b')); applyMF(st.get('bk-mf', 1)); applyCG(COLG() ? '1' : '0', false);
    })();
    /* экран не гаснет */
    if ('wakeLock' in navigator) {
      var WK = 'bk-wake', lock = null, want = st.get(WK, 0) === 1;
      var btn = icoBtn('wakeBtn', A + '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><circle cx="12" cy="10" r="2" fill="currentColor"/></svg>', 'Экран не гаснет', null, seg);
      function on() { if (!want || lock || document.visibilityState !== 'visible') return; navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }).catch(function () {}); }
      function off() { if (lock) { try { lock.release(); } catch (e) {} lock = null; } }
      function paint() { btn.setAttribute('aria-pressed', want ? 'true' : 'false'); btn.classList.toggle('on', want); btn.title = want ? 'Экран не гаснет: включено' : 'Экран не гаснет: выключено'; }
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') on(); });
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, on, { passive: true, once: true }); });
      btn.addEventListener('click', function () { want = !want; st.set(WK, want ? 1 : 0); paint(); if (want) on(); else off(); });
      paint(); on();
    }
  })();
  /* ---------- поиск по всей книге (индекс подключён скриптом search-index.js) ---------- */
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  var here = (location.pathname.split('/').pop() || 'index.html');
  var idxQ = null;
  function withToc(cb) {
    if (window.BOOK_TOC) return cb(); var sc = document.createElement('script'); sc.src = 'assets/toc.js'; sc.onload = cb; document.head.appendChild(sc);
  }
  function withIndex(cb) {
    if (window.BOOK_INDEX) return cb();
    if (idxQ) { idxQ.push(cb); return; }
    idxQ = [cb]; var sc = document.createElement('script'); sc.src = 'assets/search-index.js';
    sc.onload = function () { var q = idxQ; idxQ = null; q.forEach(function (f) { f(); }); }; document.head.appendChild(sc);
  }
  $('#q').addEventListener('input', function (e) { var inp = e; withIndex(function () { doSearch(inp); }); });
  function doSearch(e) {
    var q = e.target.value.trim().toLowerCase(), box = $('#hits'); box.innerHTML = ''; body.classList.toggle('searching', q.length >= 2);
    if (q.length < 2) return;
    var n = 0; (window.BOOK_INDEX || []).forEach(function (it) {
      var p = it.t.toLowerCase().indexOf(q); if (p < 0 || n >= 40) return; n++;
      var s = Math.max(0, p - 40), a = document.createElement('a'); a.className = 'hit';
      a.href = (it.f === here ? '' : it.f) + '#' + it.id;
      a.innerHTML = '<small>' + esc(it.h) + '</small>' + (s ? '…' : '') + esc(it.t.slice(s, p)) + '<mark>' + esc(it.t.slice(p, p + q.length)) + '</mark>' + esc(it.t.slice(p + q.length, p + q.length + 80));
      a.addEventListener('click', function () { openPanel(false); });
      box.appendChild(a);
    });
    if (!n) box.innerHTML = '<div class="hit">Ничего не найдено</div>';
  }
  var tm; window.addEventListener('scroll', function () { body.classList.add('scrolling'); clearTimeout(tm); tm = setTimeout(function () { body.classList.remove('scrolling'); }, 700); }, { passive: true });


  /* ---------- удобства: оглавление главы, ссылки, место чтения, клавиши, печать ---------- */
  var main = $('main.chapter');
  function plainText(el) { var c = el.cloneNode(true); $$('.katex-mathml,.anc,.dupsign,.stepbtn', c).forEach(function (x) { x.remove(); }); return c.textContent.replace(/\s+/g, ' ').trim(); }
  function toast(msg) {
    var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }
  function buildToc() {
    var cur = $('#chList a.cur'); if (!main || !cur) return; var hs = $$('h2[id]', main); if (hs.length < 2) return;
    var box = document.createElement('div'); box.className = 'toc'; box.id = 'toc';
    hs.forEach(function (h) {
      var a = document.createElement('a'); a.href = '#' + h.id; a.textContent = plainText(h); a.dataset.for = h.id;
      a.addEventListener('click', function (e) { e.preventDefault(); h.scrollIntoView({ block: 'start' }); try { history.replaceState(null, '', '#' + h.id); } catch (er) {} if (window.innerWidth < 900) openPanel(false); });
      box.appendChild(a);
    });
    cur.parentNode.insertBefore(box, cur.nextSibling);
  }
  function tocByScroll() {
    var box = $('#toc'); if (!box) return; var hs = $$('h2[id]', main), pick = null, lim = window.innerHeight * 0.3;
    hs.forEach(function (h) { if (h.getBoundingClientRect().top < lim) pick = h; });
    $$('a', box).forEach(function (a) { a.classList.toggle('on', !!pick && a.dataset.for === pick.id); });
  }
  function addAnchors() {
    $$('h2[id]', main).forEach(function (h) {
      var b = document.createElement('button'); b.className = 'anc'; b.type = 'button'; b.textContent = '#'; b.setAttribute('aria-label', 'Скопировать ссылку на параграф');
      b.addEventListener('click', function () {
        var u = location.origin + location.pathname + '#' + h.id; try { history.replaceState(null, '', '#' + h.id); } catch (er) {}
        if (navigator.clipboard && navigator.clipboard.writeText && /^https?:$/.test(location.protocol)) navigator.clipboard.writeText(u).then(function () { toast('Ссылка скопирована'); }, function () { toast('Ссылка в адресной строке'); });
        else toast('Ссылка в адресной строке');
      });
      h.appendChild(b);
    });
  }
  function normRef(s) { return s.toLowerCase().replace(/рис\./g, '').replace(/\s+/g, '').replace(/(\d+\.\d+)\.([а-яa-z])/, '$1$2'); }
  function linkRefs() {
    if (!cards.length || !main) return; var map = {};
    cards.forEach(function (c) { var b = $('.fig-head b', c); if (!b) return; var lab = normRef(b.textContent); lab.split(/[–—-]/).forEach(function (x) { if (x) map[x] = c; }); map[lab] = c; });
    var re = /Рис\.\s*(\d+\.\d+(?:\.?[а-яa-z])?)/g, nodes = [];
    var w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentNode; if (!/Рис\./.test(n.nodeValue) || (p.closest && p.closest('.kx,.kd,.fig-head,.figph,.figcard,.katex,script,button,a'))) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) {
      var t = n.nodeValue, m, last = 0, frag = document.createDocumentFragment(), hit = false; re.lastIndex = 0;
      while ((m = re.exec(t))) {
        var c = map[normRef(m[1])]; if (!c) continue; hit = true;
        frag.appendChild(document.createTextNode(t.slice(last, m.index)));
        var a = document.createElement('a'); a.className = 'figref'; a.href = '#' + c.id; a.dataset.fig = c.dataset.fig; a.textContent = m[0]; frag.appendChild(a); last = m.index + m[0].length;
      }
      if (hit) { frag.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.figref'); if (!a) return; e.preventDefault();
    var c = cardOf(a.dataset.fig); if (!c) return;
    if (railEl) { setActive(a.dataset.fig); } else { if (!BOARDS[a.dataset.fig]) buildFig(c); c.scrollIntoView({ block: 'center' }); }
    c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
  });
  /* место чтения: запоминаем страницу и точное положение, при новом открытии возвращаем туда же */
  var PK = 'bk-pos', posT, userMoved = false;
  function savePos() {
    if (!main) return; var lab = $('.chapter-num', main);
    if (window.scrollY < 200) { st.set(PK, { f: here, id: '', off: 0, c: lab ? lab.textContent : '', t: '' }); return; }
    var els = $$('[id]', main), pick = null, h2 = null;
    for (var i = 0; i < els.length; i++) { var r = els[i].getBoundingClientRect(); if (els[i].tagName === 'H2' && r.top < 80) h2 = els[i]; if (!pick && r.bottom > 60 && /^p\d+$/.test(els[i].id)) pick = els[i]; if (r.top > 400) break; }
    if (!pick) return;
    st.set(PK, { f: here, id: pick.id, off: Math.round(-pick.getBoundingClientRect().top), c: lab ? lab.textContent : '', t: h2 ? plainText(h2).slice(0, 80) : '' });
  }
  window.addEventListener('scroll', function () { clearTimeout(posT); posT = setTimeout(savePos, 400); }, { passive: true });
  window.addEventListener('pagehide', function () { clearTimeout(posT); savePos(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { clearTimeout(posT); savePos(); } });
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { userMoved = true; }, { passive: true, once: true }); });
  function freshOpen() {
    var nav = null; try { nav = performance.getEntriesByType('navigation')[0]; } catch (e) {}
    if (nav && nav.type && nav.type !== 'navigate') return false;                       /* обновление / «назад» — браузер вернёт сам */
    var ref = document.referrer || ''; try { if (ref && new URL(ref).origin === location.origin) return false; } catch (e) {}
    return true;                                                                         /* ярлык, закладка, новая вкладка */
  }
  function restorePos() {
    var p = st.get(PK, null), go = null; try { go = sessionStorage.getItem('bk-go'); sessionStorage.removeItem('bk-go'); } catch (e) {}
    if (location.hash || !p || !p.f) return;
    if (!main) {                                                                         /* титульная: открыть последнюю страницу */
      if (here === 'index.html' && p.f !== 'index.html' && freshOpen()) { try { sessionStorage.setItem('bk-go', '1'); } catch (e) {} location.replace(p.f); }
      return;
    }
    if (p.f !== here || !p.id || !(go || freshOpen())) return;
    function apply() {
      if (userMoved) return; var el = document.getElementById(p.id); if (!el) return;
      var y = el.getBoundingClientRect().top + window.scrollY + (p.off || 0); if (Math.abs(window.scrollY - y) > 3) window.scrollTo(0, y);
    }
    apply(); setTimeout(apply, 350); setTimeout(apply, 1100); setTimeout(apply, 2200); window.addEventListener('load', apply);
    try { var ro = new ResizeObserver(function () { apply(); }); ro.observe(main); setTimeout(function () { ro.disconnect(); }, 6000); } catch (e) {}
    try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply); } catch (e) {}
    var tt = document.createElement('div'); tt.className = 'resumetoast';
    tt.innerHTML = '<span>Вернул вас на место, где вы остановились</span><a href="index.html#top">С начала</a>';
    document.body.appendChild(tt); setTimeout(function () { tt.remove(); }, 5000);
  }
  function showResume() {
    var p = st.get(PK, null); if (!p || !p.f || (p.f === here && main)) return;
    var mk = function () { var a = document.createElement('a'); a.className = 'resume'; a.href = p.f + (p.id ? '#' + p.id : ''); a.innerHTML = '<b>Продолжить чтение</b><small>' + esc(p.c + (p.t ? ' · ' + p.t : '')) + '</small>'; return a; };
    var pm = $('#pMain'); if (pm) pm.insertBefore(mk(), pm.firstChild);
    var go = $('.tp-go'); if (go) { var a = mk(); a.style.marginTop = '14px'; go.parentNode.insertBefore(a, go.nextSibling); }
  }
  /* клавиши */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if (e.key === 'Escape') { if (body.classList.contains('open')) openPanel(false); else if (ACTIVE.pin) { ACTIVE.pin = null; refresh(); } return; }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); if (window.innerWidth < 900) openPanel(true); setTimeout(function () { $('#q').focus(); }, 0); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      var as = $$('.chnav a'), a = as.filter(function (x) { return e.key === 'ArrowLeft' ? /^←/.test(x.textContent) : /→$/.test(x.textContent); })[0];
      if (a) location.href = a.getAttribute('href');
    }
  });
  var fabEl = $('#fab'); if (fabEl) { fabEl.setAttribute('aria-label', 'Меню: главы, поиск, оформление'); fabEl.setAttribute('aria-expanded', 'false'); }
  /* печать: светлая тема, чертежи в тексте */
  var pr = null;
  window.addEventListener('beforeprint', function () {
    if (pr) return;
    pr = { rail: !!railEl, theme: root.getAttribute('data-theme') }; pr.dark = pr.theme !== 'light';
    if (pr.dark) root.setAttribute('data-theme', 'light');
    if (railEl) { body.classList.remove('railon'); cards.forEach(function (c) { c.classList.remove('act'); c._ph.after(c); }); }
    body.classList.add('printing'); cards.forEach(function (c) { buildFig(c); });
  });
  window.addEventListener('afterprint', function () {
    if (!pr) return; body.classList.remove('printing'); if (pr.theme && pr.theme !== 'light') root.setAttribute('data-theme', pr.theme);
    if (pr.rail) layout(); else if (pr.dark) rebuildAll(); else cards.forEach(sizeBoard);
    if (pr.rail && pr.dark) rebuildAll(); pr = null;
  });

  /* ---------- подсказка первого запуска, ссылки на рисунок, навигация между главами ---------- */
  var HK = 'bk-hint', hintShown = false;
  function hintFor(c) {
    return;
    if (hintShown || st.get(HK, 0) || $('.hint', c)) return;
    var anim = $('.animbar', c), h = document.createElement('div'); h.className = 'hint'; h.setAttribute('role', 'note');
    h.innerHTML = '<span>' + (anim ? 'Тяните точки пальцем или мышью. Нажмите <b>▶</b>, чтобы запустить анимацию.' : 'Тяните точки пальцем или мышью: чертёж и числа меняются.') + '</span><button type="button" aria-label="Скрыть подсказку">Понятно</button>';
    var box = $('.jxgbox', c); box.parentNode.insertBefore(h, box); hintShown = true;
    function done() { if (h.parentNode) h.remove(); st.set(HK, 1); }
    $('button', h).addEventListener('click', done);
    box.addEventListener('pointerdown', done, { once: true }); if (anim) $('.play', anim).addEventListener('click', done, { once: true });
  }
  function openHash() {
    var m = /^#fig-(\w+)(~play)?$/.exec(location.hash); if (!m) return; var c = cardOf(m[1]); if (!c) return;
    if (railEl) setActive(m[1]); else { if (!BOARDS[m[1]]) buildFig(c); c.scrollIntoView({ block: 'center' }); }
    c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
    if (m[2]) setTimeout(function () { var p = $('.animbar .play', c); if (p && !p.classList.contains('playing')) p.click(); }, 700);
  }
  window.addEventListener('hashchange', openHash);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.playref'); if (!a) return; e.preventDefault();
    var h = a.getAttribute('href'); if (location.hash === h) openHash(); else location.hash = h;
  });
  /* значки вместо подписей на кнопках рисунка */
  var ICON_PIN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 3 3v1.5H7V12l3-3z"/><line x1="12" y1="13.5" x2="12" y2="21"/></svg>';
  var ICON_RST = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><polyline points="20 4 20 9 15 9"/></svg>';
  $$('.figcard').forEach(function (card) {
    var nt = $('.fig-note', card); if (nt && /_/.test(nt.textContent)) nt.innerHTML = subs(nt.innerHTML);
    var pin = $('.pinbtn', card), rst = $('.rstbtn', card);
    if (pin) { pin.innerHTML = ICON_PIN; pin.classList.add('ico'); pin.setAttribute('aria-label', 'Закрепить рисунок'); pin.title = 'Закрепить рисунок'; }
    if (rst) { rst.innerHTML = ICON_RST; rst.classList.add('ico'); rst.setAttribute('aria-label', 'Сбросить рисунок'); rst.title = 'Сбросить рисунок'; }
  });
  /* переход к предыдущей и следующей главам: карточки с названиями */
  function buildChNav() {
    var nav = $('.chnav'); if (!nav) return; var titles = {};
    $$('#chList a').forEach(function (a) { var t = $('.t', a), n = $('.n', a); titles[a.getAttribute('href')] = { t: t ? t.textContent : a.textContent, n: n ? n.textContent : '' }; });
    var as = $$('a', nav); nav.innerHTML = '';
    as.forEach(function (a) {
      var href = a.getAttribute('href'), prev = /^←/.test(a.textContent), info = titles[href] || { t: a.textContent.replace(/[←→]/g, '').trim(), n: '' };
      var c = document.createElement('a'); c.href = href; c.className = 'cn ' + (prev ? 'prev' : 'next');
      var num = /^\d+$/.test(info.n) ? 'Глава ' + info.n : (info.t === 'Предисловие' ? 'Предисловие' : info.t === 'Титул' ? 'Титул' : '');
      c.innerHTML = '<span class="cn-dir">' + (prev ? '←&nbsp;Назад' : 'Дальше&nbsp;→') + '</span><span class="cn-num">' + esc(num) + '</span><span class="cn-t">' + esc(/^\d+$/.test(info.n) ? info.t : '') + '</span>';
      nav.appendChild(c);
    });
  }
  /* оглавление: подразделы всех глав в общем списке */
  function buildTree() {
    var list = $('#chList'); if (!list || !window.BOOK_TOC) return;
    $$('#chList a').forEach(function (a) {
      var f = a.getAttribute('href'), subs = window.BOOK_TOC[f]; if (!subs || !subs.length) return;
      var wrap = document.createElement('div'); wrap.className = 'ch-item'; a.parentNode.insertBefore(wrap, a); wrap.appendChild(a);
      var ul = document.createElement('div'); ul.className = 'ch-sub';
      subs.forEach(function (x) {
        var s = document.createElement('a'); s.href = f + '#' + x[0]; s.textContent = x[1]; s.dataset.for = x[0]; s.dataset.f = f;
        s.addEventListener('click', function (e) {
          if (f !== here) return; e.preventDefault(); var h = document.getElementById(x[0]); if (h) h.scrollIntoView({ block: 'start' });
          try { history.replaceState(null, '', '#' + x[0]); } catch (er) {} if (window.innerWidth < 900) openPanel(false);
        });
        ul.appendChild(s);
      });
      wrap.appendChild(ul);
    });
  }
  function treeByScroll() {
    if (!main) return; var hs = $$('h2[id]', main), pick = null, lim = window.innerHeight * 0.3;
    hs.forEach(function (h) { if (h.getBoundingClientRect().top < lim) pick = h; });
    $$('#chList .ch-sub a').forEach(function (a) { a.classList.toggle('on', !!pick && a.dataset.f === here && a.dataset.for === pick.id); });
  }
  /* «п. ⟨N⟩ §X.Y» — ссылка на пункт N параграфа X.Y (в этой или другой главе); «п. ⟨N⟩ этого параграфа» — в текущем */
  function linkSecRefs() {
    var R = window.BOOK_REFS; if (!R || !main) return;
    var curSec = null, order = [];
    $$('h2[id], .kx[data-tex]', main).forEach(function (el) {
      if (el.tagName === 'H2') { var m = /^\s*§\s*(\d+\.\d+)/.exec(el.textContent); curSec = m ? m[1] : null; return; }
      var n = /^\\left\\langle \\mathbf\{(\d+)\} \\right\\rangle$/.exec(el.dataset.tex); if (!n || el.closest('a,h2,.fig-head')) return;
      var pv = el.previousSibling, nx = el.nextSibling;
      if (!pv || pv.nodeType !== 3 || !/п\.\s*$/.test(pv.nodeValue)) return;
      var sec = curSec, tail = null, mm = nx && nx.nodeType === 3 ? /^\s*§\s*(\d+\.\d+)/.exec(nx.nodeValue) : null;
      if (mm) { sec = mm[1]; tail = mm[0]; }
      var ref = sec && R[sec]; if (!ref) return; var id = ref[2][n[1]] || ref[1]; if (!id) return;
      var a = document.createElement('a'); a.className = 'secref'; a.href = (ref[0] === here ? '' : ref[0]) + '#' + id; a.dataset.to = id; a.dataset.f = ref[0]; a.dataset.lab = 'п. ' + n[1] + (tail ? ' §' + sec : '');
      el.parentNode.insertBefore(a, el); a.appendChild(el);
      if (tail) { a.appendChild(document.createTextNode(tail)); nx.nodeValue = nx.nodeValue.slice(tail.length); }
    });
  }
  /* просто «§X.Y» в тексте — тоже ссылка на параграф */
  function linkParas() {
    var R = window.BOOK_REFS; if (!R || !main) return;
    var w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      if (n.nodeValue.indexOf('§') < 0) return NodeFilter.FILTER_REJECT; var p = n.parentNode;
      return p.closest && p.closest('h1,h2,a,.kx,.kd,.katex,.fig-head,.figcard,script,button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    var re = /§\s*(\d+\.\d+)/g;
    nodes.forEach(function (n) {
      var t = n.nodeValue, m, last = 0, frag = document.createDocumentFragment(), hit = false; re.lastIndex = 0;
      while ((m = re.exec(t))) {
        var ref = R[m[1]]; if (!ref) continue; hit = true;
        frag.appendChild(document.createTextNode(t.slice(last, m.index)));
        var a = document.createElement('a'); a.className = 'secref'; a.href = (ref[0] === here ? '' : ref[0]) + '#' + ref[1]; a.dataset.to = ref[1]; a.dataset.f = ref[0]; a.dataset.sec = m[1]; a.textContent = m[0]; frag.appendChild(a); last = m.index + m[0].length;
      }
      if (hit) { frag.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
  }
  /* окно с превью: смотрим теорему из другого места, не теряя ход чтения */
  var XM = null, DOCS = {}, xLast = null;
  function xmEnsure() {
    if (XM) return XM; XM = document.createElement('div'); XM.id = 'xm'; XM.setAttribute('role', 'dialog'); XM.setAttribute('aria-modal', 'true');
    XM.innerHTML = '<div class="xs"></div><div class="xd"><div class="xh"><b></b><button type="button" class="xc" aria-label="Закрыть">×</button></div><div class="xb"></div><div class="xf"><button type="button" class="xback">Вернуться к чтению</button><a class="xgo" href="#">Перейти к месту</a></div></div>';
    document.body.appendChild(XM);
    function close() { XM.classList.remove('on'); document.documentElement.style.overflow = ''; if (xLast && xLast.focus) try { xLast.focus({ preventScroll: true }); } catch (e) {} }
    XM.close = close; $('.xs', XM).addEventListener('click', close); $('.xc', XM).addEventListener('click', close); $('.xback', XM).addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && XM.classList.contains('on')) { e.stopPropagation(); close(); } }, true);
    $('.xgo', XM).addEventListener('click', function (e) {
      var h = this.getAttribute('href'), f = this.dataset.f, id = this.dataset.to; e.preventDefault(); close();
      if (f === here) { var t = document.getElementById(id); if (t) { t.scrollIntoView({ block: 'start' }); try { history.replaceState(null, '', '#' + id); } catch (er) {} t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); } }
      else location.href = h;
    });
    return XM;
  }
  function xmDoc(f) {
    if (f === here) return Promise.resolve(document);
    if (DOCS[f]) return Promise.resolve(DOCS[f]);
    return fetch(f).then(function (r) { if (!r.ok) throw new Error('http'); return r.text(); }).then(function (t) { return (DOCS[f] = new DOMParser().parseFromString(t, 'text/html')); });
  }
  function xmCollect(doc, id) {
    var start = doc.getElementById(id); if (!start) return null; var out = [], el = start, isItem = start.tagName !== 'H2', n = 0;
    function isHead(x) { return x.tagName === 'H2'; }
    function isItemStart(x) { var k = x.querySelector && x.querySelector('.kx[data-tex]'); return !!k && /^\\left\\langle \\mathbf\{\d+\} \\right\\rangle$/.test(k.dataset.tex) && (x.firstElementChild === k || (x.firstElementChild && x.firstElementChild.classList.contains('lbl') && x.firstElementChild.nextElementSibling === k)); }
    while (el && n < (isItem ? 16 : 8)) {
      if (el !== start && (isHead(el) || (isItem && isItemStart(el)))) break;
      out.push(el); el = el.nextElementSibling; n++;
    }
    var h = doc.createElement('div');
    out.forEach(function (x) {
      var c = x.cloneNode(true);
      if (c.classList && c.classList.contains('figcard')) { var cb = c.querySelector('.fig-head b'), cc = c.querySelector('.fig-head .cap'); var d = doc.createElement('p'); d.className = 'xfig'; d.textContent = (cb ? cb.textContent : 'Рисунок') + (cc ? ' ' + cc.textContent : '') + ' — смотрите в главе'; h.appendChild(d); return; }
      c.querySelectorAll('.figcard,.figph,.anc,.dupsign,.hint,.stepbtn').forEach(function (z) { z.remove(); });
      c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(function (z) { z.removeAttribute('id'); }); c.querySelectorAll('[data-h]').forEach(function (z) { z.removeAttribute('data-h'); });
      h.appendChild(c);
    });
    return h;
  }
  function openXm(a) {
    var f = a.dataset.f, id = a.dataset.to; if (!f || !id) return false; var m = xmEnsure(); xLast = a;
    var label = a.dataset.sec ? '§' + a.dataset.sec : (a.dataset.lab || 'Ссылка');
    $('.xh b', m).innerHTML = '<small>Ссылка из текста</small>' + esc(label);
    var go = $('.xgo', m); go.setAttribute('href', f + '#' + id); go.dataset.f = f; go.dataset.to = id;
    var body = $('.xb', m); body.innerHTML = '<p class="xfig">Загрузка…</p>';
    m.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    xmDoc(f).then(function (doc) {
      var h = xmCollect(doc, id); if (!h) throw new Error('none');
      var hd = doc.getElementById(id), t = (hd && hd.tagName === 'H2' ? hd : null);
      if (!t) { var all = [].slice.call(doc.querySelectorAll('h2[id]')), idx = -1; all.forEach(function (x) { if (hd && (x.compareDocumentPosition(hd) & 4)) idx = all.indexOf(x); }); if (idx >= 0) t = all[idx]; }
      if (t) { var tc = t.cloneNode(true); $$('.anc', tc).forEach(function (z) { z.remove(); }); tc.removeAttribute('id'); $$('[id]', tc).forEach(function (z) { z.removeAttribute('id'); }); $('.xh b', m).innerHTML = '<small>' + esc(label) + '</small>' + tc.innerHTML; try { renderMath($('.xh b', m)); } catch (er) {} }
      body.innerHTML = ''; body.appendChild(document.importNode(h, true));
      try { renderMath(body); fitFormulas(body); } catch (e) {}
      body.scrollTop = 0;
    }).catch(function () { m.classList.remove('on'); document.documentElement.style.overflow = ''; location.href = f + '#' + id; });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.secref'); if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return; e.preventDefault(); openXm(a);
  });
  /* ---------- пошаговый разбор доказательства ---------- */
  var STEP = null;
  function isItemStart(x) { var k = x.tagName === 'P' && x.firstElementChild; if (k && k.classList.contains('lbl')) k = k.nextElementSibling; return !!k && k.classList.contains('kx') && /^\\left\\langle \\mathbf\{\d+\} \\right\\rangle$/.test(k.dataset.tex || ''); }
  function stepGroups(start) {
    var out = [start], el = start.nextElementSibling;
    while (el && el.tagName !== 'H2' && !isItemStart(el)) { if (!el.classList.contains('figcard') && !el.classList.contains('figph') && !el.classList.contains('stepbar')) out.push(el); el = el.nextElementSibling; }
    var steps = [];
    for (var i = 0; i < out.length; i++) {
      var g = [out[i]], tx = out[i].tagName === 'P' ? out[i].textContent.replace(/\s+/g, ' ').trim() : '';
      if (out[i].tagName === 'P' && i > 0 && tx.length < 14 && steps.length) { steps[steps.length - 1].push(out[i]); continue; }   /* «(Рис.4.2)» — к предыдущему шагу */
      if (out[i].tagName === 'P' && /[:：]$/.test(tx)) { while (out[i + 1] && out[i + 1].classList.contains('formula-scroll')) { g.push(out[++i]); } }
      steps.push(g);
    }
    return steps;
  }
  function stepTokens(g) { var t = [], seen = {}; g.forEach(function (el) { $$('[data-h]', el).forEach(function (n) { var k = n.getAttribute('data-h'); if (k && !seen[k]) { seen[k] = 1; t.push(k); } }); }); return t; }
  function stepFigure(tokens) { for (var i = 0; i < tokens.length; i++) { var id = tokens[i].split('.')[0], c = cardOf(id); if (c) return c; } return null; }
  function stepGo(n) {
    if (!STEP) return; n = Math.max(0, Math.min(STEP.steps.length - 1, n)); STEP.i = n;
    STEP.steps.forEach(function (g, j) { g.forEach(function (el) { el.classList.toggle('st-cur', j === n); el.classList.toggle('st-done', j < n); el.classList.toggle('st-fut', j > n); }); });
    var tok = stepTokens(STEP.steps[n]); ACTIVE.step = tok; refresh();
    var c = stepFigure(tok);
    if (c) {
      if (railEl) { setActive(c.dataset.fig); }
      else if (STEP.fig !== c) {
        if (STEP.fig && STEP.fig._pinByStep) { var pb0 = $('.pinbtn', STEP.fig); if (pb0 && STEP.fig.classList.contains('pinned')) pb0.click(); STEP.fig._pinByStep = false; }
        STEP.fig = c; if (!BOARDS[c.dataset.fig]) buildFig(c);
        if (!c.classList.contains('pinned')) { var pb = $('.pinbtn', c); if (pb) { pb.click(); c._pinByStep = true; } }
      }
    }
    var bar = STEP.bar; $('.sb-n', bar).textContent = 'Шаг ' + (n + 1) + ' из ' + STEP.steps.length;
    $('.sb-prev', bar).disabled = n === 0; $('.sb-next', bar).disabled = n === STEP.steps.length - 1;
    $('.sb-dots', bar).innerHTML = STEP.steps.map(function (_, j) { return '<i class="' + (j < n ? 'd' : j === n ? 'c' : '') + '"></i>'; }).join('');
    if (window.innerWidth >= 900) {
      /* на компьютере панель шагов стоит сразу под текущим блоком текста/формулы */
      var g = STEP.steps[n], last = g[g.length - 1];
      if (last.parentNode) last.parentNode.insertBefore(bar, last.nextSibling);
      bar.classList.add('inl');
      var top = g[0].getBoundingClientRect().top, bot = bar.getBoundingClientRect().bottom, vh = window.innerHeight, want;
      want = (bot - top > vh - 120) ? top - 70 : ((top + bot) / 2 - vh / 2);
      window.scrollBy({ top: want, behavior: REDUCED ? 'auto' : 'smooth' });
    } else {
      if (bar.parentNode !== document.body) document.body.appendChild(bar); bar.classList.remove('inl');
      STEP.steps[n][0].scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
    }
  }
  function stepStop() {
    if (!STEP) return; STEP.steps.forEach(function (g) { g.forEach(function (el) { el.classList.remove('st-cur', 'st-done', 'st-fut'); }); });
    if (STEP.fig && STEP.fig._pinByStep) { var pb = $('.pinbtn', STEP.fig); if (pb && STEP.fig.classList.contains('pinned')) pb.click(); STEP.fig._pinByStep = false; }
    STEP.bar.remove(); body.classList.remove('stepping'); ACTIVE.step = null; refresh(); STEP = null;
  }
  function stepStart(start) {
    if (STEP) stepStop(); var steps = stepGroups(start); if (steps.length < 2) return;
    var bar = document.createElement('div'); bar.className = 'stepbar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Пошаговый разбор');
    bar.innerHTML = '<button type="button" class="sb-prev" aria-label="Назад">‹</button><div class="sb-mid"><span class="sb-n"></span><span class="sb-dots"></span></div><button type="button" class="sb-next" aria-label="Дальше">›</button><button type="button" class="sb-x" aria-label="Закрыть разбор">×</button>';
    document.body.appendChild(bar); body.classList.add('stepping'); STEP = { steps: steps, i: 0, bar: bar, fig: null };
    $('.sb-prev', bar).addEventListener('click', function () { stepGo(STEP.i - 1); }); $('.sb-next', bar).addEventListener('click', function () { stepGo(STEP.i + 1); }); $('.sb-x', bar).addEventListener('click', stepStop);
    stepGo(0);
  }
  function addStepButtons() {
    if (!main) return;
    $$('p', main).forEach(function (p) {
      if (!isItemStart(p) || $('.stepbtn', p)) return; if (stepGroups(p).length < 4) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'stepbtn'; b.textContent = 'По шагам'; b.title = 'Разобрать доказательство по шагам';
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); stepStart(p); }); p.appendChild(b);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!STEP || e.ctrlKey || e.metaKey || e.altKey) return; var tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea') return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown') { e.preventDefault(); e.stopPropagation(); stepGo(STEP.i + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); e.stopPropagation(); stepGo(STEP.i - 1); }
    else if (k === 'Escape') { e.stopPropagation(); stepStop(); }
  }, true);

  /* ---------- удобочитаемость текста ---------- */
  function readability() {
    if (!main) return;
    var CONN = /^(Следовательно|Тогда|Так как|Значит|Поэтому|Таким образом|Отсюда|Из подобия|Пусть|Рассмотрим|Докажем|Заметим|Обратим внимание|Кроме того|Далее|Теперь|Итак|Аналогично|Получим|Проведём|Опустим|Применим|Обозначим)(?=[\s,])/;
    var KW = /^(\s*)(Теорема|Обратная теорема|Следствие|Утверждение|Лемма|Определение|Задача|Пример|Доказательство|Дано|Доказать|Замечание)(?=[\s.:,—-])/;
    function endsSent(n) {
      if (!n) return false;
      if (n.nodeType === 3) return /[.;:!?]\s*$/.test(n.nodeValue);
      if (n.nodeType === 1 && n.classList.contains('kx')) return /[.;]\s*$/.test(n.dataset.tex || '');
      return false;
    }
    function wlen(n) { return n.nodeType === 3 ? n.nodeValue.length : (n.classList && n.classList.contains('kx') ? 6 : (n.textContent || '').length); }
    $$('p', main).forEach(function (p) {
      if (p.classList.contains('fig-note') || p.dataset.rd) return; p.dataset.rd = '1';
      if (isItemStart(p)) p.classList.add('item');
      var first = p.classList.contains('item') ? p.firstElementChild.nextSibling : p.firstChild;
      if (first && first.nodeType === 3) {
        var km = KW.exec(first.nodeValue);
        if (km) { var rest = first.splitText(km[0].length), b = document.createElement('b'); b.className = 'kw'; b.textContent = km[2]; first.nodeValue = km[1]; p.insertBefore(b, rest); }
      }
      /* метки: Дано / Доказать / Вывод и опорные блоки */
      if (!p.querySelector('.lbl')) {
        var ft = first && first.nodeType === 3 ? first.nodeValue : (first && first.classList && first.classList.contains('kw') ? first.textContent : '');
        var kwEl = p.querySelector(':scope > b.kw');
        if (!kwEl) {
          var fb = null; for (var ci = 0; ci < p.childNodes.length; ci++) { var cn = p.childNodes[ci]; if (cn.nodeType === 3 && !cn.nodeValue.trim()) continue; if (cn.nodeType === 1 && cn.classList.contains('kx') && /^\\left\\langle/.test(cn.dataset.tex || '')) continue; fb = cn; break; }
          if (fb && fb.nodeType === 1 && fb.tagName === 'B') { var bt = fb.textContent.trim(); if (/^(Обратная теорема|Теорема|Следствие|Утверждение|Лемма|Признак|Свойство)(?![А-Яа-я])/.test(bt)) p.classList.add('blk', 'b-th'); else if (/^Определение(?![А-Яа-я])/.test(bt)) p.classList.add('blk', 'b-df'); }
        }
        if (kwEl) { var kt = kwEl.textContent; if (/^(Теорема|Обратная теорема|Следствие|Утверждение|Лемма)$/.test(kt)) p.classList.add('blk', 'b-th'); else if (kt === 'Определение') p.classList.add('blk', 'b-df'); else if (kt === 'Замечание') p.classList.add('blk', 'b-nt'); else if (kt === 'Дано') p.classList.add('blk', 'b-gv'); else if (kt === 'Доказать') p.classList.add('blk', 'b-pr'); }
        else if (ft) {
          var t0 = ft.replace(/^\s+/, ''), lab = null, cls = '';
          if (/^(Докажем|Доказать|Для доказательства|Чтобы доказать|Нужно доказать)/.test(t0)) { lab = 'Доказать'; cls = 'l-do'; }
          else if (/^(Следовательно|Значит|Таким образом|Итак|Отсюда|Поэтому)(?=[\s,])/.test(t0)) { lab = 'Вывод'; cls = 'l-so'; }
          else if (/^(Дано|Дан[аоы]?|Пусть)(?=[\s,])/.test(t0)) { lab = 'Дано'; cls = 'l-gv'; }
          else if (/^(Заметим|Обратим внимание|Отметим|Полезно (заметить|обратить|отметить)|Напомним)/.test(t0)) { lab = 'Замечание'; cls = 'l-nt'; }
          if (lab) { var tl = 0; [].forEach.call(p.childNodes, function (n) { if (n.nodeType === 3) tl += n.nodeValue.trim().length; else if (!(n.classList && n.classList.contains('kx'))) tl += (n.textContent || '').trim().length; }); if (tl >= 40) p.classList.add('blk', cls); }
        }
        if (/что и требовалось доказать/i.test(p.textContent) && !p.querySelector('.qed')) { var q = document.createElement('span'); q.className = 'qed'; q.textContent = '∎'; q.setAttribute('aria-hidden', 'true'); p.appendChild(q); p.classList.add('blk', 'b-qed'); }
      }
      var len = 0; [].forEach.call(p.childNodes, function (n) { len += wlen(n); });
      if (len < 220) return;
      var since = 0, n = p.firstChild, nx;
      while (n) {
        nx = n.nextSibling;
        if (n.nodeType === 3) {
          var cur = n, skipLead = false, guard = 0;
          while (cur && guard++ < 30) {
            var v = cur.nodeValue, hit = -1, lead = v.length - v.replace(/^\s+/, '').length, m, re = /[.;!?:]\s+(?=[А-ЯЁ])/g;
            if (!skipLead && since >= 60 && endsSent(cur.previousSibling) && CONN.test(v.slice(lead))) hit = lead;
            if (hit < 0) { while ((m = re.exec(v))) { var idx = m.index + m[0].length; if (since + idx >= 60 && CONN.test(v.slice(idx))) { hit = idx; break; } } }
            if (hit < 0) { since += v.length; break; }
            var tail = hit > 0 ? cur.splitText(hit) : cur, sp = document.createElement('span'); sp.className = 'sb'; sp.setAttribute('aria-hidden', 'true');
            p.insertBefore(sp, tail); since = 0; cur = tail; skipLead = true;
          }
        } else since += wlen(n);
        n = nx;
      }
    });
  }
  /* ---------- главные формулы глав: «запомнить» (лёгкая золотистая заливка) ---------- */
  var KEYF = {"0":["\\sin\\alpha=\\frac{AB}{M_3B}=\\frac{AB}"],"5":["\\fraccb=\\frac{a_c}{a_b}","L_a=\\sqrt{bc-a_ba_c}=\\frac{2bc\\cos\\f"],"6":["h^2=c_ac_b;\\qquada^2=c\\cdotc_a;\\qqua","r_c=p,\\qquadr_a=\\frac{S}{p-a}=\\frac{"],"7":["a^2=b^2+c^2-2bc\\cdot\\cosA\\qquad(\\tex"],"8":["\\fraca{\\sinA}=\\fracb{\\sinB}=\\fracc{\\","\\frac{2S}{R^2}=\\sin2A+\\sin2B+\\sin2C="],"10":["\\frac{BA_1{A_1C}}\\cdot\\frac{CB_1{B_1","\\frac{BA_1{A_1C}\\cdot\\frac{CB_1}{B_1"],"11":["d_1^2+d_2^2=2a^2+2b^2.","a^2+b^2+c^2+g^2=d_1^2+d_2^2+4t^2."],"14":["S=\\frac{abc}{4R}\\\\Rightarrow\\R=\\frac","S_{\\triangleABC}=S_{AOB}+S_{BOC}+S_{","2R\\sin\\fracB2\\cdot\\fracr{\\sin\\fracB2","\\cos\\fracA2\\cos\\fracB2\\cos\\fracC2=\\f","\\sin\\fracA2\\sin\\fracB2\\sin\\fracC2=\\f","a\\cosA+b\\cosB+c\\cosC=4R\\sinA\\sinB\\si"],"15":["AB\\cdotCD+BC\\cdotAD=AC\\cdotBD","AQ^2+BQ^2+CQ^2+DQ^2=AB^2+DC^2=BC^2+A","AB+DC=BC+AD."],"16":["AM\\cdotMA_1=BM\\cdotMB_1=CM\\cdotMC_1=","MA_1\\cdotMA=MB_1\\cdotMB=MK^2=a^2-R^2"],"17":["\\frac{S_{\\triangleABC}}{S_{\\triangle"],"19":["S=\\frac{ah_a}{2}=\\frac{ab\\sinC}{2}=2","S^2=p(p-c)\\,r\\,r_c=p(p-c)(p-a)(p-b)\\"],"20":["S=\\sqrt{(p-a)(p-b)(p-c)(p-d)-abcd\\co","S=\\sqrt{(p-a)(p-b)(p-c)(p-d)}\\qquad("],"22":["S=\\frac{a+b}{2}\\cdoth=EF\\cdoth."],"23":["S=\\frac{R^2\\cdot\\alpha}{2}."],"24":["S=\\frac{R^2}{2}(\\alpha-\\sin\\alpha)."],"25":["\\beta_n=\\frac{\\pi(n-2)}{n},\\qquada_n"]};
  function keyFormulas() {
    var m = /ch(\d+)\.html/.exec(location.pathname); if (!m) return; var L = KEYF[m[1]]; if (!L) return;
    $$('.kd[data-tex]').forEach(function (d) {
      var t = d.dataset.tex.replace(/\\htmlData\{[^}]*\}\{([^}]*)\}/g, '$1').replace(/\s+/g, '');
      for (var i = 0; i < L.length; i++) if (t.indexOf(L[i]) === 0) { var w = d.closest('.formula-scroll') || d.closest('.formula-block'); if (w) w.classList.add('keyf'); L.splice(i, 1); break; }
    });
  }

  /* ---------- крупный просмотр длинной формулы по нажатию ---------- */
  var FZ = null;
  function openFz(kd) {
    if (!FZ) {
      FZ = document.createElement('div'); FZ.id = 'fz'; FZ.setAttribute('role', 'dialog'); FZ.setAttribute('aria-modal', 'true');
      FZ.innerHTML = '<div class="fs-bg"></div><div class="fs-d"><button type="button" class="fs-c" aria-label="Закрыть">×</button><div class="fs-b"></div></div>';
      body.appendChild(FZ);
      var cl = function () { FZ.classList.remove('on'); document.documentElement.style.overflow = ''; };
      FZ.close = cl; $('.fs-bg', FZ).addEventListener('click', cl); $('.fs-c', FZ).addEventListener('click', cl);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && FZ.classList.contains('on')) { e.stopPropagation(); cl(); } }, true);
    }
    var bx = $('.fs-b', FZ); bx.innerHTML = ''; var h = document.createElement('div'); h.className = 'fs-f'; bx.appendChild(h);
    try { katex.render(eolAligned(kd.dataset.tex), h, { displayMode: true, throwOnError: false, trust: true, strict: false }); } catch (e) { h.textContent = kd.dataset.tex; }
    FZ.classList.add('on'); document.documentElement.style.overflow = 'hidden'; bx.scrollLeft = 0;
  }
  /* ---------- пояснения обозначений: нажатие на букву в формуле ---------- */
  var TRI = [3, 5, 6, 7, 8, 9, 10, 12, 14, 15, 19];
  var SYM = {
    'R': ['радиус описанной окружности', [3, 6, 8, 14, 15, 19, 20]],
    'r': ['радиус вписанной окружности', [3, 6, 8, 12, 14, 15, 19, 20]],
    'p': ['полупериметр: p = (a + b + c) / 2', [3, 5, 6, 8, 12, 14, 19, 20]],
    'S': ['площадь', [3, 6, 8, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25]],
    'r_a': ['радиус вневписанной окружности, касающейся стороны a', [6, 12, 14, 19]],
    'r_b': ['радиус вневписанной окружности, касающейся стороны b', [6, 12, 14, 19]],
    'r_c': ['радиус вневписанной окружности, касающейся стороны c', [6, 12, 14, 19]],
    'h_a': ['высота, проведённая к стороне a', TRI], 'h_b': ['высота, проведённая к стороне b', TRI], 'h_c': ['высота, проведённая к стороне c', TRI],
    'm_a': ['медиана, проведённая к стороне a', [3, 4, 6, 7]], 'm_b': ['медиана, проведённая к стороне b', [3, 4, 6, 7]], 'm_c': ['медиана, проведённая к стороне c', [3, 4, 6, 7]],
    'L_a': ['биссектриса угла A', [3, 5]], 'l_a': ['биссектриса угла A', [3, 5]],
    'd_1': ['диагональ четырёхугольника', [11, 15, 20, 21]], 'd_2': ['диагональ четырёхугольника', [11, 15, 20, 21]],
    'R_n': ['радиус описанной окружности правильного n-угольника', [25]], 'r_n': ['радиус вписанной окружности правильного n-угольника', [25]],
    'a_n': ['сторона правильного n-угольника', [25]], 'S_n': ['площадь правильного n-угольника', [25]],
    'a': ['сторона треугольника (напротив вершины A)', [3, 5, 6, 7, 8, 9, 14, 19]], 'b': ['сторона треугольника (напротив вершины B)', [3, 5, 6, 7, 8, 9, 14, 19]], 'c': ['сторона треугольника (напротив вершины C)', [3, 5, 6, 7, 8, 9, 14, 19]]
  };
  function symKey(t) {
    var m = t.closest && t.closest('.mord'); if (!m || !t.closest('.katex-html')) return null;
    var sub = t.closest('.msupsub'), wrap = null;
    if (sub) wrap = sub.parentElement;
    else if (m.nextElementSibling && m.nextElementSibling.classList.contains('msupsub')) wrap = m.parentElement;
    if (wrap) {
      var base = wrap.firstElementChild, ss = wrap.querySelector('.msupsub'); if (!base || !ss) return null;
      var bt = base.textContent.replace(/[​\s]/g, ''), st = ss.textContent.replace(/[​\s]/g, '');
      if (bt === 'S' && !SYM['S_' + st]) return { k: 'S', sub: st };
      return { k: bt + '_' + st };
    }
    var tx = m.textContent.replace(/[​\s]/g, ''); return tx.length === 1 ? { k: tx } : null;
  }
  function symPop() {
    var pop = $('#symPop'); if (!pop) { pop = document.createElement('div'); pop.id = 'symPop'; pop.setAttribute('role', 'status'); body.appendChild(pop); } return pop;
  }
  function symHide() { var p = $('#symPop'); if (p) p.classList.remove('on'); }
  function symInit() {
    var cm = /ch(\d+)\.html/.exec(location.pathname), ch = cm ? +cm[1] : -1; if (ch < 0) return;
    document.addEventListener('click', function (e) {
      var t = e.target; if (!t || !t.closest) return;
      if (t.closest('#symPop')) return;
      var zf = t.closest('.formula-scroll.zoomable .kd');
      function none() { symHide(); if (zf && !t.closest('[data-h]') && !(window.getSelection && String(window.getSelection()).length > 0)) openFz(zf); }
      if (!t.closest('main.chapter') || t.closest('.figcard, .t-card, .stepbtn, a, button')) { symHide(); return; }
      var ks = symKey(t); if (!ks) { none(); return; }
      var d = SYM[ks.k]; if (!d || d[1].indexOf(ch) < 0) { none(); return; }
      if (window.getSelection && String(window.getSelection()).length > 0) return;
      var rect = (t.closest('.mord') || t).getBoundingClientRect();
      var txt = ks.sub ? 'площадь фигуры, указанной в индексе' : d[0];
      var pop = symPop(); pop.textContent = '';
      var lab = document.createElement('span'); lab.className = 'sp-k'; var kx = document.createElement('span'); lab.appendChild(kx); pop.appendChild(lab);
      try { katex.render(ks.sub ? 'S_{\\ldots}' : ks.k.replace(/^([A-Za-z])_(.+)$/, '$1_{$2}'), kx, { throwOnError: false }); } catch (er) { kx.textContent = ks.k; }
      pop.appendChild(document.createTextNode(' — ' + txt));
      pop.classList.add('on'); pop.style.visibility = 'hidden'; pop.style.left = '0px'; pop.style.top = '0px';
      var w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
      var x = Math.min(Math.max(8, rect.left + rect.width / 2 - w / 2), vw - w - 8), y = rect.top - h - 8; if (y < 8) y = rect.bottom + 8;
      pop.style.left = (x + window.scrollX) + 'px'; pop.style.top = (y + window.scrollY) + 'px'; pop.style.visibility = '';
      clearTimeout(pop._t); pop._t = setTimeout(symHide, 6000);
    });
    window.addEventListener('scroll', symHide, { passive: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') symHide(); });
    try { if (!localStorage.getItem('bk-symhint') && $('main.chapter .kx')) { localStorage.setItem('bk-symhint', '1'); setTimeout(function () { toast('Нажмите на обозначение (R, r, p, S…) — появится пояснение'); }, 2500); } } catch (er) {}
  }

  /* в обычном тексте знак отношения (=, ⇔, ⇒ …) не должен начинать строку: он остаётся в конце предыдущей */
  function glueRel() {
    if (!main) return;
    var SG = '=|⇔|⇒|⟹|⟺|≈|≠|≤|≥|<|>', re = new RegExp('^(\\s*)(?=(?:' + SG + ')(?:\\s|$|\\u00a0))'), w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) { if (re.test(n.nodeValue) && n.previousSibling && !(n.parentElement && n.parentElement.closest('.katex, .kd, .katex-mathml'))) list.push(n); }
    list.forEach(function (t) {
      var prev = t.previousSibling, sp0 = (/^\s*/.exec(t.nodeValue) || [''])[0], rest = t.nodeValue.replace(/^\s+/, ''), mm = new RegExp('^(?:' + SG + ')').exec(rest);
      if (prev.nodeType === 1 && mm && (prev.textContent || '').length < 60 && !(prev.classList && prev.classList.contains('nb'))) {
        t.nodeValue = rest.slice(mm[0].length);
        var wr = document.createElement('span'); wr.className = 'nb'; prev.parentNode.insertBefore(wr, prev); wr.appendChild(prev); wr.appendChild(document.createTextNode((/^\s/.test(sp0) ? '\u00a0' : '') + mm[0]));
      } else t.nodeValue = t.nodeValue.replace(re, ' ');
    });
  }
  function enhance() {
    glueRel(); readability(); keyFormulas(); symInit();
    addAnchors(); linkRefs(); showResume(); restorePos(); buildChNav(); withToc(function () { buildTree(); linkSecRefs(); linkParas(); }); treeByScroll(); openHash();
    window.addEventListener('scroll', function () { if (!enhance.r) enhance.r = requestAnimationFrame(function () { enhance.r = 0; treeByScroll(); }); }, { passive: true });
  }

  /* ---------- старт страницы ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
  (function () { var cur = $('#chList a.cur'), pn = $('#panel'); if (cur && pn && window.innerWidth >= 900) pn.scrollTop = Math.max(0, cur.offsetTop - 140); })();
  renderMath(document); layout(); enhance(); if (!railEl) lazyBuild();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSoon); window.addEventListener('load', fitSoon);
  function toHash() {
    var id = (location.hash || '').slice(1), el = id && document.getElementById(id); if (!el) return;
    el.scrollIntoView({ block: 'center' }); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
  window.addEventListener('hashchange', toHash); setTimeout(toHash, 200);
})();

/* прогресс тестов: плашка в конце главы, бейджи в оглавлении, полоса на титуле */
(function () {
  var ST = {}; try { ST = JSON.parse(localStorage.getItem('bk-tests')) || {}; } catch (e) {}
  function okOf(n) { var s = ST['c' + n], a = 0, g = 0; if (s && s.ok) for (var k in s.ok) { a++; if (s.ok[k]) g++; } return [g, a]; }
  [].forEach.call(document.querySelectorAll('.t-go'), function (el) {
    var n = +el.dataset.ch, tot = +el.dataset.n, r = okOf(n), s = el.querySelector('.t-go-s'), a = el.querySelector('a');
    if (r[1]) { s.textContent = 'Верно ' + r[0] + ' из ' + tot + (r[1] < tot ? ' · отвечено ' + r[1] : ''); a.textContent = r[1] >= tot ? 'Открыть тест' : 'Продолжить'; }
  });
  [].forEach.call(document.querySelectorAll('#chList a[data-t]'), function (a) {
    var r = okOf(+a.dataset.t); if (!r[1]) return;
    var b = document.createElement('span'); b.className = 'tb'; b.textContent = '✓ ' + r[0] + '/' + a.dataset.q; a.appendChild(b);
  });
  var p = document.getElementById('tProg');
  if (p) {
    var m = {}; try { m = JSON.parse(p.dataset.m); } catch (e) {}
    var tot = 0, good = 0, ans = 0; for (var k in m) { tot += m[k]; var r = okOf(+k); good += r[0]; ans += r[1]; }
    p.innerHTML = '<a href="tests.html">' + (ans ? 'Тесты: верно ' + good + ' из ' + tot + '<div class="bar"><i style="width:' + Math.round(good / tot * 100) + '%"></i></div>Продолжить тесты →' : 'Проверьте себя: ' + tot + ' заданий по всем главам →') + '</a>';
  }
})();
