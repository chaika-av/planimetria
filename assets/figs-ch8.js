/* Глава 8. Теорема синусов и некоторые тригонометрические соотношения */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function tri(X, S, o) { return { A: X.P('A', S.A, o && o[0] || [-4, 10]), B: X.P('B', S.B, o && o[1] || [-22, -14]), C: X.P('C', S.C, o && o[2] || [8, -14]) }; }
  function sv(S, T) { S.A = [T.A.X(), T.A.Y()]; S.B = [T.B.X(), T.B.Y()]; S.C = [T.C.X(), T.C.Y()]; }
  function sides(X, T, w) { X.seg(T.A, T.B, 'sAB', 'tri', w || 2, {}, 4.5); X.seg(T.B, T.C, 'sBC', 'tri', w || 2, {}, 4.5); X.seg(T.C, T.A, 'sCA', 'tri', w || 2, {}, 4.5); }
  function angs(T) { return [G.ang(T.A, T.B, T.C), G.ang(T.B, T.C, T.A), G.ang(T.C, T.A, T.B)]; }
  function good(T, lo, hi) { var m = angs(T); return m.every(function (x) { return isFinite(x) && x > (lo || 0.25) && x < (hi || 2.8); }); }
  var TS = function () { return { A: [-1.3, 3.0], B: [-3.8, -1.8], C: [3.9, -1.5] }; };

  /* Рис. 8.1 — теорема синусов */
  FIGS.s81 = {
    bbox: [-6, 5.4, 6, -5.4],
    state: function () { return { A: [-1.6, 3.2], B: [-3.6, -1.5], C: [3.4, -1.9] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      G.guard(b, [A, B, C], function () { return good(T, 0.3, 2.7); });
      var O = X.D('O', function () { return G.circum(A, B, C)[0]; }, function () { return G.circum(A, B, C)[1]; }, [8, 8]);
      var circ = b.create('circle', [O, function () { return G.dist(O, A); }], { strokeColor: C0.mu, strokeWidth: 1.3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
      X.reg('circ', 'circ', circ, { strokeColor: C0.mu, strokeWidth: 1.3 }, { strokeColor: C0.acc, strokeWidth: 4 });
      var B1 = X.D('B<sub>1</sub>', function () { return 2 * O.X() - A.X(); }, function () { return 2 * O.Y() - A.Y(); }, [8, -16]);
      sides(X, T);
      X.seg(A, B1, 'AB1', 'diam', 1.6, { dash: 3 }, 4.2); X.seg(B1, C, 'B1C', 'rt1', 1.5, {}, 4.2); X.seg(B1, B, 'B1B', 'rt2', 1.5, {}, 4.2);
      X.right(C, A, B1, 0.28, 'rC', 'rt1'); X.right(B, A, B1, 0.28, 'rB', 'rt2');
      X.ang(B, A, C, 0.7, '', 'aB', 'angB'); X.ang(B1, A, C, 0.7, '', 'aB1', 'angB'); X.ang(C, A, B, 0.7, '', 'aC', 'angC'); X.ang(B1, A, B, 1.0, '', 'aB1b', 'angC');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O'); X.pt(B1, 'pB1', 'B1');
      X.alias('2R', ['AB1']);
      var o8 = null;
      function an8(p, v, q) { var ux = p[0] - v[0], uy = p[1] - v[1], vx = q[0] - v[0], vy = q[1] - v[1]; return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))))); }
      function ok8(ph) {
        var a_ = [o8.c[0] + o8.r * Math.cos(ph), o8.c[1] + o8.r * Math.sin(ph)], b_ = [B.X(), B.Y()], c_ = [C.X(), C.Y()], m = [an8(b_, a_, c_), an8(c_, b_, a_), an8(a_, c_, b_)];
        return m.every(function (x) { return isFinite(x) && x > 0.3 && x < 2.7; }) && Math.abs(a_[0]) < 5.3 && Math.abs(a_[1]) < 4.9;
      }
      function run8() {
        var N = 360, ok0 = [], i, best = null, cur = null;
        for (i = 0; i < N; i++) ok0.push(ok8(i * 2 * Math.PI / N));
        for (i = 0; i < N; i++) { if (ok0[i] && cur === null) cur = i; if ((!ok0[i] || i === N - 1) && cur !== null) { var e = ok0[i] ? i : i - 1; if (!best || e - cur > best[1] - best[0]) best = [cur, e]; cur = null; } }
        return best ? [best[0] * 2 * Math.PI / N + 0.03, best[1] * 2 * Math.PI / N - 0.03] : null;
      }
      X.anim({ label: 'Двигать вершину A по дуге', dur: 9000, t0: null,
        steps: [[0, 'A бежит по дуге, B и C на месте'], [0.1, 'Угол A и радиус R не меняются, значит a / sin A = 2R'], [0.6, 'Стороны b и c меняются, но b / sin B и c / sin C всё равно равны 2R']],
        set: function (t) {
          if (!o8 || t === 0) { var cc = G.circum(A, B, C); o8 = { c: cc, r: Math.hypot(A.X() - cc[0], A.Y() - cc[1]), run: null }; o8.run = run8(); }
          if (!o8.run) return;
          var ph = o8.run[0] + (o8.run[1] - o8.run[0]) * t;
          A.setPosition(JXG.COORDS_BY_USER, [o8.c[0] + o8.r * Math.cos(ph), o8.c[1] + o8.r * Math.sin(ph)]);
        } });
      b.on('update', function () {
        sv(S, T);
        var a = G.dist(B, C), bb = G.dist(C, A), c = G.dist(A, B), m = angs(T), R = G.dist(O, A);
        X.ro([[['a / sin A', G.f2(a / Math.sin(m[0]))], ['b / sin B', G.f2(bb / Math.sin(m[1])) + ' ' + ok(eq(a / Math.sin(m[0]), bb / Math.sin(m[1]), 0.01))]],
              [['c / sin C', G.f2(c / Math.sin(m[2]))], ['2R', G.f2(2 * R) + ' ' + ok(eq(c / Math.sin(m[2]), 2 * R, 0.01) && eq(a / Math.sin(m[0]), 2 * R, 0.01))]],
              [['∠ACB<sub>1</sub>', G.deg(G.ang(C, A, B1))], ['∠ABB<sub>1</sub>', G.deg(G.ang(B, A, B1)) + ' ' + ok(eq(G.ang(C, A, B1), Math.PI / 2, 0.001) && eq(G.ang(B, A, B1), Math.PI / 2, 0.001))]],
              [['sin B', G.f2(Math.sin(m[1]))], ['sin B<sub>1</sub> = AC / 2R', G.f2(bb / (2 * R)) + ' ' + ok(eq(Math.sin(m[1]), bb / (2 * R), 0.002))]]]);
      });
    }
  };

  /* Рис. 8.2 — формулы Региомонтана и Мольвейде */
  FIGS.s82 = {
    bbox: [-5.4, 4.6, 6.6, -1.8],
    state: function () { return { A: [0.5, 3.0], B: [5.4, 0], C: [0, 0] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S, [[-4, 10], [8, -14], [4, -20]]), A = T.A, B = T.B, C = T.C;
      function aa() { return G.dist(B, C); } function bb() { return G.dist(C, A); }
      G.guard(b, [A, B, C], function () { var m = angs(T); return isFinite(m[2]) && m[2] > 0.45 && m[2] < 2.6 && aa() > 1.2 * bb() && bb() > 0.8; });
      var D = wp(X, 'D', function () { var k = bb() / aa(); return [C.X() + (C.X() - B.X()) * k, C.Y() + (C.Y() - B.Y()) * k]; }, [-22, -16]);
      var K = wp(X, 'K', function () { var k = bb() / aa(); return [C.X() + (B.X() - C.X()) * k, C.Y() + (B.Y() - C.Y()) * k]; }, [-4, -20]);
      var L = wp(X, 'L', function () { var s = (aa() - bb()) / (aa() + bb()); return [B.X() + (A.X() - B.X()) * s, B.Y() + (A.Y() - B.Y()) * s]; }, [8, 6]);
      X.seg(D, B, 'DB', 'base', 2, {}, 4.5); X.seg(A, B, 'AB', 'c', 2, {}, 4.5); X.seg(C, A, 'CA', 'b', 2, {}, 4.5);
      X.seg(D, A, 'DA', 'DA', 1.6, {}, 4.2); X.seg(A, K, 'AK', 'AK', 1.6, { dash: 2 }, 4.2); X.seg(K, L, 'KL', 'KL', 1.6, { dash: 2 }, 4.2);
      X.hidden(K, B, 'KB', 'KB'); X.hidden(D, B, 'DBh', 'DBh');
      X.ang(D, A, C, 0.7, '1', 'a1', '12'); X.ang(A, D, C, 0.7, '2', 'a2', '12'); X.ang(A, C, K, 0.55, '3', 'a3', '34'); X.ang(K, C, A, 0.7, '4', 'a4', '34');
      X.ang(A, K, B, 0.8, '6', 'a6', '6'); X.ang(K, L, B, 0.7, '7', 'a7', '7');
      X.right(A, D, K, 0.25, 'rA', 'DA'); X.right(K, A, L, 0.25, 'rK', 'KL');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(D, 'pD', 'D'); X.pt(K, 'pK', 'K'); X.pt(L, 'pL', 'L');
      X.alias('tg', ['KB', 'DBh']); X.alias('sines', ['DA', 'AK', 'AB']);
      b.on('update', function () {
        sv(S, T);
        var a = aa(), bv = bb(), c = G.dist(A, B), m = angs(T), Aa = m[0], Bb = m[1], Cc = m[2];
        var half = (Aa - Bb) / 2, t1 = Math.tan(half) / Math.tan((Aa + Bb) / 2);
        X.ro([[['(a − b) / (a + b)', G.f2((a - bv) / (a + bv))], ['tg((A − B)/2) / tg((A + B)/2)', G.f2(t1) + ' ' + ok(eq((a - bv) / (a + bv), t1, 0.003))]],
              [['∠DAK', G.deg(G.ang(A, D, K))], ['∠6', G.deg(G.ang(A, K, B)) + ' ' + ok(eq(G.ang(A, D, K), Math.PI / 2, 0.001))], ['(A − B)/2', G.deg(half) + ' ' + ok(eq(G.ang(A, K, B), half, 0.002))]],
              [['(a + b) / c', G.f2((a + bv) / c)], ['cos((A − B)/2) / sin(C/2)', G.f2(Math.cos(half) / Math.sin(Cc / 2)) + ' ' + ok(eq((a + bv) / c, Math.cos(half) / Math.sin(Cc / 2), 0.005))]],
              [['(a − b) / c', G.f2((a - bv) / c)], ['sin((A − B)/2) / cos(C/2)', G.f2(Math.sin(half) / Math.cos(Cc / 2)) + ' ' + ok(eq((a - bv) / c, Math.sin(half) / Math.cos(Cc / 2), 0.005))]]]);
      });
    }
  };

  /* Рис. 8.3 — sin 2A + sin 2B + sin 2C = 4 sin A sin B sin C */
  FIGS.s83 = {
    bbox: [-6, 5.4, 6, -5.4],
    state: function () { return { A: [-0.8, 3.4], B: [-3.6, -1.8], C: [3.7, -1.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      G.guard(b, [A, B, C], function () { return good(T, 0.35, 1.45); });
      var O = X.D('O', function () { return G.circum(A, B, C)[0]; }, function () { return G.circum(A, B, C)[1]; }, [8, 8]);
      var circ = b.create('circle', [O, function () { return G.dist(O, A); }], { strokeColor: C0.mu, strokeWidth: 1.2, dash: 3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
      sides(X, T);
      X.seg(O, A, 'OA', 'R', 1.4, {}, 4); X.seg(O, B, 'OB', 'R', 1.4, {}, 4); X.seg(O, C, 'OC', 'R', 1.4, {}, 4);
      X.ang(O, B, C, 0.8, '2A', 'o2A', 'ang2'); X.ang(O, C, A, 0.8, '2B', 'o2B', 'ang2'); X.ang(O, A, B, 0.8, '2C', 'o2C', 'ang2');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O');
      b.on('update', function () {
        sv(S, T);
        var a = G.dist(B, C), bb = G.dist(C, A), c = G.dist(A, B), m = angs(T), Aa = m[0], Bb = m[1], Cc = m[2], R = G.dist(O, A);
        var Sg = 0.5 * Math.abs((B.X() - A.X()) * (C.Y() - A.Y()) - (C.X() - A.X()) * (B.Y() - A.Y()));
        var s2 = Math.sin(2 * Aa) + Math.sin(2 * Bb) + Math.sin(2 * Cc), p4 = 4 * Math.sin(Aa) * Math.sin(Bb) * Math.sin(Cc);
        X.ro([[['S', G.f2(Sg)], ['(R²/2)(sin 2A + sin 2B + sin 2C)', G.f2(R * R / 2 * s2) + ' ' + ok(eq(Sg, R * R / 2 * s2, 0.01))]],
              [['S', G.f2(Sg)], ['abc / 4R', G.f2(a * bb * c / (4 * R)) + ' ' + ok(eq(Sg, a * bb * c / (4 * R), 0.01))], ['2R²·sinA·sinB·sinC', G.f2(2 * R * R * p4 / 4) + ' ' + ok(eq(Sg, 2 * R * R * p4 / 4, 0.01))]],
              [['2S / R²', G.f2(2 * Sg / (R * R))], ['sin 2A + sin 2B + sin 2C', G.f2(s2) + ' ' + ok(eq(2 * Sg / (R * R), s2, 0.005))], ['4 sinA sinB sinC', G.f2(p4) + ' ' + ok(eq(s2, p4, 0.005))]]]);
      });
    }
  };

  /* Рис. 8.4 — проверка тригонометрических соотношений между углами треугольника */
  FIGS.s84 = {
    bbox: [-5.4, 4.6, 5.4, -3.6],
    state: TS,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      G.guard(b, [A, B, C], function () { return good(T, 0.3, 1.45); });
      sides(X, T);
      X.ang(A, B, C, 0.8, '<i>A</i>', 'aA', 'A'); X.ang(B, C, A, 0.8, '<i>B</i>', 'aB', 'B'); X.ang(C, A, B, 0.8, '<i>C</i>', 'aC', 'C');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C');
      b.on('update', function () {
        sv(S, T);
        var a = G.dist(B, C), bb = G.dist(C, A), m = angs(T), Aa = m[0], Bb = m[1], Cc = m[2], s = Math.sin, c = Math.cos, t = Math.tan;
        var r = function (x) { return G.f2(x); };
        var l1 = s(Aa) + s(Bb) + s(Cc), r1 = 4 * c(Aa / 2) * c(Bb / 2) * c(Cc / 2);
        var l2 = c(Aa) + c(Bb) + c(Cc), r2 = 1 + 4 * s(Aa / 2) * s(Bb / 2) * s(Cc / 2);
        var l3 = c(Aa) * c(Aa) + c(Bb) * c(Bb) + c(Cc) * c(Cc), r3 = 1 - 2 * c(Aa) * c(Bb) * c(Cc);
        var l4 = t(Aa) + t(Bb) + t(Cc), r4 = t(Aa) * t(Bb) * t(Cc);
        var l5 = t(Aa / 2) * t(Bb / 2) + t(Bb / 2) * t(Cc / 2) + t(Cc / 2) * t(Aa / 2);
        var l6 = (bb / a - c(Cc)) / s(Cc), l7 = (a / bb - c(Cc)) / s(Cc);
        X.ro([[['sin A + sin B + sin C', r(l1)], ['4cos(A/2)cos(B/2)cos(C/2)', r(r1) + ' ' + ok(eq(l1, r1, 0.003))]],
              [['cos A + cos B + cos C', r(l2)], ['1 + 4sin(A/2)sin(B/2)sin(C/2)', r(r2) + ' ' + ok(eq(l2, r2, 0.003))]],
              [['cos²A + cos²B + cos²C', r(l3)], ['1 − 2cosA·cosB·cosC', r(r3) + ' ' + ok(eq(l3, r3, 0.003))]],
              [['tg A + tg B + tg C', r(l4)], ['tg A · tg B · tg C', r(r4) + ' ' + ok(eq(l4, r4, 0.01))]],
              [['tg(A/2)tg(B/2) + tg(B/2)tg(C/2) + tg(C/2)tg(A/2)', r(l5) + ' ' + ok(eq(l5, 1, 0.003))]],
              [['ctg A', r(1 / t(Aa))], ['(b/a − cos C) / sin C', r(l6) + ' ' + ok(eq(1 / t(Aa), l6, 0.005))]],
              [['ctg B', r(1 / t(Bb))], ['(a/b − cos C) / sin C', r(l7) + ' ' + ok(eq(1 / t(Bb), l7, 0.005))]]]);
      });
    }
  };
})();
