/* геометрические функции для чертежей (общие для всех глав) */
(function () {
  window.GEO = {
    dist: function (P, Q) { return Math.hypot(P.X() - Q.X(), P.Y() - Q.Y()); },
    ang: function (V, P, Q) {
      var ux = P.X() - V.X(), uy = P.Y() - V.Y(), vx = Q.X() - V.X(), vy = Q.Y() - V.Y(), lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
      if (lu < 1e-6 || lv < 1e-6) return NaN;
      return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (lu * lv))));
    },
    f2: function (x) { return isFinite(x) ? x.toFixed(2) : '—'; },
    deg: function (x) { return isFinite(x) ? (x * 180 / Math.PI).toFixed(1) + '°' : '—'; },
    ok: function (a, b, tol) { if (!isFinite(a) || !isFinite(b)) return ''; return Math.abs(a - b) <= (tol || 0.006) ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; },
    foot: function (P, A, B) {                                   /* основание перпендикуляра из P на прямую AB */
      var dx = B.X() - A.X(), dy = B.Y() - A.Y(), l2 = dx * dx + dy * dy || 1e-12, t = ((P.X() - A.X()) * dx + (P.Y() - A.Y()) * dy) / l2;
      return [A.X() + t * dx, A.Y() + t * dy];
    },
    circum: function (A, B, C) {                                 /* центр описанной окружности */
      var ax = A.X(), ay = A.Y(), bx = B.X(), by = B.Y(), cx = C.X(), cy = C.Y();
      var d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)); if (Math.abs(d) < 1e-9) d = 1e-9;
      var a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
      return [(a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d, (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d];
    },
    inter: function (P, d, Q, e) {                               /* пересечение прямых P + t·d и Q + s·e */
      var den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-9) den = 1e-9;
      var t = ((Q[0] - P[0]) * e[1] - (Q[1] - P[1]) * e[0]) / den; return [P[0] + t * d[0], P[1] + t * d[1]];
    },
    /* страж допустимой конфигурации: если после перетаскивания pred() ложно — вернуть точки в последнее допустимое положение */
    guard: function (b, pts, pred) {
      var good = pts.map(function (p) { return [p.X(), p.Y()]; }), busy = false;
      b.on('update', function () {
        if (busy) return;
        var ok = true; try { ok = pred(); } catch (e) {}
        if (ok) { good = pts.map(function (p) { return [p.X(), p.Y()]; }); return; }
        busy = true; pts.forEach(function (p, i) { p.moveTo(good[i]); }); busy = false; b.update(); setTimeout(function () { b.update(); }, 0);
      });
    },
    acute: function (A, B, C, lo, hi) {                          /* треугольник остроугольный и не вырожденный */
      var G = window.GEO, a = [G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)], mn = (lo || 14) * Math.PI / 180, mx = (hi || 84) * Math.PI / 180;
      return a.every(function (x) { return isFinite(x) && x > mn && x < mx; });
    },
    sweep: function (V, P, Q) {
      var a1 = Math.atan2(P.Y() - V.Y(), P.X() - V.X()), a2 = Math.atan2(Q.Y() - V.Y(), Q.X() - V.X());
      var d = ((a2 - a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      return d > Math.PI ? [a2, 2 * Math.PI - d] : [a1, d];
    }
  };
})();
