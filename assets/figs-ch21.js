/* Глава 21. Площадь параллелограмма */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function cross(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  function fill(X, pts, prim, tok) {
    return X.poly(function () { return pts.concat([pts[0]]).map(xy); }, { strokeWidth: 0, fillColor: X.C.acc, fillOpacity: 0, highlight: false, fixed: true }, prim, tok, { fillOpacity: 0 }, { fillOpacity: 0.3 });
  }
  function f1(x) { return isFinite(x) && Math.abs(x) < 1e4 ? G.f2(x) : '—'; }

  /* Рис. 21.2 — площадь через диагонали и угол */
  FIGS.n211 = {
    bbox: [-6.0, 4.4, 6.0, -3.0],
    state: function () { return { A: [-3.6, -1.4], D: [2.6, -1.4], B: [-1.4, 2.4] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), D = X.P('D', S.D, [8, -14]), B = X.P('B', S.B, [-22, 4]);
      var C = wp(X, 'C', function () { return [B.X() + D.X() - A.X(), B.Y() + D.Y() - A.Y()]; }, [8, 6]);
      var O = wp(X, 'O', function () { return [(A.X() + C.X()) / 2, (A.Y() + C.Y()) / 2]; }, [4, -16]);
      G.guard(b, [A, D, B], function () {
        var a = G.dist(A, D), bb = G.dist(A, B), An = G.ang(A, D, B);
        return a > 2 && bb > 1.4 && Math.abs(Math.cos(An)) > 0.16 && Math.abs(a * a - bb * bb) > 1.0 && C.X() < 5.4 && C.X() > -5.4 && C.Y() < 4.0 && C.Y() > -2.6 && Math.abs(cross(A, D, B)) > 2;
      });
      X.seg(A, B, 'AB', 'b', 2, {}, 4.5); X.seg(B, C, 'BC', 'a', 2, {}, 4.5); X.seg(C, D, 'CD', 'b', 2, {}, 4.5); X.seg(D, A, 'DA', 'a', 2, {}, 4.5);
      X.seg(A, C, 'AC', 'd1', 1.5, { dash: 2 }, 3.5); X.seg(B, D, 'BD', 'd2', 1.5, { dash: 2 }, 3.5);
      X.ang(A, D, B, 0.6, 'A', 'aA', 'angA'); X.ang(O, A, B, 0.45, 'φ', 'aphi', 'phi');
      var sh = 0;
      X.poly(function () {
        var k = sh, B2 = [B.X() + (A.X() - B.X()) * k, B.Y()], C2 = [C.X() + (A.X() - B.X()) * k, C.Y()];
        return [xy(A), xy(D), C2, B2, xy(A)];
      }, { strokeWidth: 2.4, strokeColor: X.C.acc, fillColor: X.C.acc, fillOpacity: 0.22, highlight: false, fixed: true });
      X.anim({ label: 'Сдвиг в прямоугольник', dur: 5000,
        steps: [[0, 'Параллелограмм ABCD'], [0.05, 'Сдвигаем верхнюю сторону: основание и высота те же'], [0.97, 'Прямоугольник: S = a·h, площадь не изменилась']],
        set: function (t) { sh = t; } });
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]]);
      b.on('update', function () {
        S.A = xy(A); S.D = xy(D); S.B = xy(B);
        var a = G.dist(A, D), bb = G.dist(A, B), d1 = G.dist(A, C), d2 = G.dist(B, D), An = G.ang(A, D, B), ph = G.ang(O, A, B), s = Math.abs(cross(A, D, B));
        var h = s / a, v3 = (d1 * d1 - d2 * d2) / 4 * Math.tan(An), v4 = (a * a - bb * bb) / 2 * Math.tan(ph);
        X.ro([[['S', G.f2(s)], ['a·h', G.f2(a * h)], ['ab·sin A', G.f2(a * bb * Math.sin(An)) + ' ' + ok(eq(s, a * bb * Math.sin(An), 0.01))]],
              [['d₁² − d₂²', G.f2(d1 * d1 - d2 * d2)], ['4ab·cos A', G.f2(4 * a * bb * Math.cos(An)) + ' ' + ok(eq(d1 * d1 - d2 * d2, 4 * a * bb * Math.cos(An), 0.02))]],
              [['(d₁²−d₂²)/4 · tg A', f1(v3) + ' ' + ok(eq(v3, s, 0.02))], ['(a²−b²)/2 · tg φ', f1(v4) + ' ' + ok(eq(v4, s, 0.02))]]]);
      });
    }
  };

  /* Рис. 21.1 — площадь через координаты (векторное произведение) */
  FIGS.n212 = {
    bbox: [-5.0, 4.6, 5.8, -3.6],
    state: function () { return { A: [-1.2, -0.8], B: [-0.2, 2.6], D: [3.2, 0.6] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var Oo = X.H(function () { return 0; }, function () { return 0; });
      var ax1 = X.H(function () { return -4.6; }, function () { return 0; }), ax2 = X.H(function () { return 5.4; }, function () { return 0; });
      var ay1 = X.H(function () { return 0; }, function () { return -3.2; }), ay2 = X.H(function () { return 0; }, function () { return 4.2; });
      X.seg(ax1, ax2, 'ox', 'axes', 1, { strokeOpacity: 0.45 }, 2); X.seg(ay1, ay2, 'oy', 'axes', 1, { strokeOpacity: 0.45 }, 2);
      X.lbl(5.3, -0.35, 'x'); X.lbl(0.3, 4.0, 'y');
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [-22, 4]), D = X.P('D', S.D, [8, -14]);
      var C = wp(X, 'C', function () { return [B.X() + D.X() - A.X(), B.Y() + D.Y() - A.Y()]; }, [8, 6]);
      G.guard(b, [A, B, D], function () { return Math.abs(cross(A, D, B)) > 2 && C.X() < 5.4 && C.X() > -4.6 && C.Y() < 4.2 && C.Y() > -3.2 && A.X() > -4.6 && A.Y() > -3.2 && B.Y() < 4.2 && D.X() < 5.4; });
      X.seg(A, B, 'AB', 'vb', 2, {}, 4.5); X.seg(B, C, 'BC', 'sides', 2, {}, 4.5); X.seg(C, D, 'CD', 'sides', 2, {}, 4.5); X.seg(D, A, 'DA', 'va', 2, {}, 4.5);
      fill(X, [A, B, C, D], 'fp', 'par');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D]]);
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.D = xy(D);
        var ax = D.X() - A.X(), ay = D.Y() - A.Y(), bx = B.X() - A.X(), by = B.Y() - A.Y();
        var det = ax * by - ay * bx, s = Math.abs(cross(A, D, B)), gen = (D.X() - A.X()) * (B.Y() - A.Y()) - (B.X() - A.X()) * (D.Y() - A.Y());
        X.ro([[['вектор a = AD', '(' + G.f2(ax) + '; ' + G.f2(ay) + ')'], ['вектор b = AB', '(' + G.f2(bx) + '; ' + G.f2(by) + ')']],
              [['aₓ·b<sub>y</sub> − a<sub>y</sub>·bₓ', G.f2(det)], ['|a × b|', G.f2(Math.abs(det)) + ' ' + ok(eq(Math.abs(det), s, 0.01))]],
              [['S (по определению)', G.f2(G.dist(A, D) * G.dist(A, B) * Math.sin(G.ang(A, D, B)))], ['|a|·|b|·sin α', G.f2(s) + ' ' + ok(eq(G.dist(A, D) * G.dist(A, B) * Math.sin(G.ang(A, D, B)), s, 0.01))]]]);
      });
    }
  };

  /* к выводу a² − b² = d₁d₂ cos φ */
  FIGS.n213 = {
    bbox: [-6.0, 4.4, 6.0, -3.0],
    state: function () { return { A: [-3.6, -1.4], D: [2.6, -1.4], B: [-1.4, 2.4] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), D = X.P('D', S.D, [8, -14]), B = X.P('B', S.B, [-22, 4]);
      var C = wp(X, 'C', function () { return [B.X() + D.X() - A.X(), B.Y() + D.Y() - A.Y()]; }, [8, 6]);
      var O = wp(X, 'O', function () { return [(A.X() + C.X()) / 2, (A.Y() + C.Y()) / 2]; }, [4, -16]);
      G.guard(b, [A, D, B], function () {
        var a = G.dist(A, D), bb = G.dist(A, B);
        return a > 2 && bb > 1.4 && Math.abs(a * a - bb * bb) > 1.0 && C.X() < 5.4 && C.X() > -5.4 && C.Y() < 4.0 && C.Y() > -2.6 && Math.abs(cross(A, D, B)) > 2;
      });
      X.seg(A, B, 'AB', 'b', 2, {}, 4.5); X.seg(B, C, 'BC', 'a', 2, {}, 4.5); X.seg(C, D, 'CD', 'b', 2, {}, 4.5); X.seg(D, A, 'DA', 'a', 2, {}, 4.5);
      X.seg(A, O, 'dA', 'dA', 2.4, {}, 5); X.seg(O, C, 'dC', 'dC', 2.4, {}, 5); X.seg(B, O, 'dB', 'dB', 2.4, {}, 5); X.seg(O, D, 'dD', 'dD', 2.4, {}, 5);
      X.ang(O, A, B, 0.45, 'φ', 'aphi', 'phi'); X.ang(O, D, A, 0.65, 'ψ', 'apsi', 'psi');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]]);
      b.on('update', function () {
        S.A = xy(A); S.D = xy(D); S.B = xy(B);
        var a = G.dist(A, D), bb = G.dist(A, B), d1 = G.dist(A, C), d2 = G.dist(B, D), ph = G.ang(O, A, B), ps = G.ang(O, D, A);
        var a2 = d1 * d1 / 4 + d2 * d2 / 4 - d1 * d2 / 2 * Math.cos(ps), b2 = d1 * d1 / 4 + d2 * d2 / 4 - d1 * d2 / 2 * Math.cos(ph);
        X.ro([[['φ + ψ', G.deg(ph + ps) + ' ' + ok(eq(ph + ps, Math.PI, 0.003))]],
              [['a² (по ψ)', G.f2(a2) + ' ' + ok(eq(a2, a * a, 0.02))], ['a² (с + cos φ)', G.f2(d1 * d1 / 4 + d2 * d2 / 4 + d1 * d2 / 2 * Math.cos(ph)) + ' ' + ok(eq(a * a, d1 * d1 / 4 + d2 * d2 / 4 + d1 * d2 / 2 * Math.cos(ph), 0.02))], ['b²', G.f2(b2) + ' ' + ok(eq(b2, bb * bb, 0.02))]],
              [['a² − b²', G.f2(a * a - bb * bb)], ['d₁d₂ cos φ', G.f2(d1 * d2 * Math.cos(ph)) + ' ' + ok(eq(a * a - bb * bb, d1 * d2 * Math.cos(ph), 0.03))]]]);
      });
    }
  };
})();
