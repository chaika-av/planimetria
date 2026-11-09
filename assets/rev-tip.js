/* Версия для вычитки: подсказка «Было: …» у жёлтых правок (наведение на ПК, касание на телефоне) */
(function () {
  'use strict';
  var css = '#revTip{position:absolute;z-index:99999;box-sizing:border-box;max-width:min(440px,calc(100vw - 16px));min-width:140px;padding:9px 12px 10px;border-radius:10px;background:var(--color-bg,#fff);color:var(--color-text,#111);border:1px solid var(--color-border,#ddd);box-shadow:0 6px 24px rgba(0,0,0,.22);font:400 .92rem/1.5 var(--font-main,system-ui,sans-serif);display:none;overflow-wrap:break-word}' +
    '#revTip .rt-h{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--color-muted,#777);margin:0 0 3px;font-weight:600}' +
    '#revTip .rt-b hr{border:0;border-top:1px solid var(--color-border,#ddd);margin:7px 0}' +
    '#revTip .rt-e{color:var(--color-muted,#777);font-style:italic}' +
    '#revTip i.d{font-style:normal;background:rgba(217,83,79,.20);border-radius:3px;padding:0 .1em;text-decoration:line-through;text-decoration-color:rgba(217,83,79,.9)}' +
    'mark.rev[data-old],.rev-d[data-old]{cursor:pointer}' +
    '#revTip i.at{display:inline-block;width:2px;height:1.05em;background:rgba(217,83,79,.9);vertical-align:text-bottom;margin:0 1px}' +
    '#revTip sub,#revTip sup{font-size:.75em}' +
    /* участки, выделенные жёлтым в исходном Word/PDF — спокойный голубой */
    '.sh{background:rgba(120,170,225,.30);border-radius:3px;box-decoration-break:clone;-webkit-box-decoration-break:clone}' +
    '.kd.sh-d{background:rgba(120,170,225,.22);border-radius:6px}' +
    '.shl{background:rgba(120,170,225,.38);border-radius:2px}' +
    ':root[data-theme="dark"] .sh{background:rgba(110,160,225,.32)}:root[data-theme="dark"] .kd.sh-d{background:rgba(110,160,225,.22)}:root[data-theme="dark"] .shl{background:rgba(110,160,225,.40)}' +
    ':root[data-theme="sepia"] .sh{background:rgba(110,150,200,.30)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var tip = document.createElement('div'); tip.id = 'revTip'; tip.setAttribute('role', 'tooltip');
  tip.innerHTML = '<div class="rt-h">В оригинале</div><div class="rt-b"></div>';
  document.body.appendChild(tip);
  var body = tip.querySelector('.rt-b'), cur = null, pinned = false, hideT = 0;
  function render() {
    if (typeof katex === 'undefined') { setTimeout(render, 150); return; }
    var o = { throwOnError: false, trust: true, strict: false };
    [].forEach.call(body.querySelectorAll('.kx'), function (el) {
      if (el.dataset.r) return; el.dataset.r = 1; var tx = el.dataset.tex;
      if (/\\d?frac|\\binom/.test(tx) && !/^\\displaystyle/.test(tx)) tx = '\\displaystyle ' + tx;
      try { katex.render(tx, el, o); } catch (e) { el.textContent = el.dataset.tex; }
    });
  }
  function pickRect(el, x, y) {
    var rs = el.getClientRects(), best = null, bd = 1e9;
    for (var i = 0; i < rs.length; i++) {
      var r = rs[i], d = (y != null && y >= r.top && y <= r.bottom) ? 0 : Math.min(Math.abs((y == null ? r.top : y) - r.top), Math.abs((y == null ? r.top : y) - r.bottom));
      if (d < bd) { bd = d; best = r; }
    }
    return best || el.getBoundingClientRect();
  }
  function show(el, x, y) {
    clearTimeout(hideT); cur = el;
    var old = el.getAttribute('data-old');
    body.innerHTML = old ? old : '<span class="rt-e">этого фрагмента раньше не было — добавлено</span>';
    tip.style.display = 'block'; tip.style.left = '0px'; tip.style.top = '0px'; render();
    var r = pickRect(el, x, y), sx = window.pageXOffset, sy = window.pageYOffset, vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.max(8, Math.min(r.left, vw - w - 8)) + sx;
    var below = r.bottom + 6, top;
    if (below + h > vh - 8 && r.top - h - 6 > 8) top = r.top - h - 6; else top = below;
    tip.style.left = left + 'px'; tip.style.top = (top + sy) + 'px';
  }
  function hide() { tip.style.display = 'none'; cur = null; pinned = false; }
  function tgt(e) { return e.target && e.target.closest ? e.target.closest('mark.rev[data-old],.rev-d[data-old]') : null; }
  var hov = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  document.addEventListener('click', function (e) {
    var m = tgt(e);
    if (m) { if (cur === m && pinned) hide(); else { show(m, e.clientX, e.clientY); pinned = true; } return; }
    if (tip.contains(e.target)) return;
    hide();
  });
  if (hov) {
    document.addEventListener('mouseover', function (e) { var m = tgt(e); if (m && !pinned) show(m, e.clientX, e.clientY); });
    document.addEventListener('mouseout', function (e) { var m = tgt(e); if (m && !pinned) hideT = setTimeout(function () { if (!pinned) hide(); }, 120); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  window.addEventListener('resize', hide);
})();
