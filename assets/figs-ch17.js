/* Глава 17. Отношение площадей подобных фигур равно квадрату коэффициента подобия */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function cross(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function area(P) { var s = 0; for (var i = 0; i < P.length; i++) { var j = (i + 1) % P.length; s += P[i].X() * P[j].Y() - P[j].X() * P[i].Y(); } return Math.abs(s) / 2; }
  function tri(A, B, C) { return Math.abs(cross(A, B, C)) / 2; }

  /* ползунок коэффициента подобия k ∈ [0.25, 0.9] */
  function slider(X, S, y) {
    var b = X.b;
    var H1 = X.H(function () { return -3; }, function () { return y; }), H2 = X.H(function () { return 3; }, function () { return y; });
    var tg = b.create('segment', [H1, H2], { visible: false });
    var K = X.G('k', [-3 + 6 * (S.k - 0.25) / 0.65, y], tg, [-4, 12]);
    X.seg(H1, H2, 'ksl', 'ksl', 3, { strokeOpacity: 0.35 }, 5);
    return { K: K, k: function () { return 0.25 + 0.65 * (K.X() + 3) / 6; } };
  }

  /* Рис. 17.0 — подобные треугольники */
  FIGS.z170 = {
    bbox: [-5.6, 4.6, 5.6, -3.0],
    state: function () { return { A: [-4.2, -1.0], B: [3.6, -1.0], C: [-0.6, 3.6], k: 0.55 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [8, -14]), C = X.P('C', S.C, [-4, 10]);
      var sl = slider(X, S, -2.4);
      G.guard(b, [A, B, C], function () { return tri(A, B, C) > 2.5 && G.ang(A, B, C) > 0.25 && G.ang(B, C, A) > 0.25 && G.ang(C, A, B) > 0.25; });
      function hom(P) { return function () { var k = sl.k(); return [A.X() + k * (P.X() - A.X()), A.Y() + k * (P.Y() - A.Y())]; }; }
      var B1 = wp(X, 'B<sub>1</sub>', hom(B), [8, -14]), C1 = wp(X, 'C<sub>1</sub>', hom(C), [-24, 6]);
      X.seg(A, B, 'AB', 'big', 2, {}, 4.5); X.seg(B, C, 'BC', 'big', 2, {}, 4.5); X.seg(C, A, 'CA', 'big', 2, {}, 4.5);
      X.seg(B1, C1, 'B1C1', 'small', 2, { dash: 2 }, 4.5); X.seg(A, B1, 'AB1', 'small', 2, {}, 4.5); X.seg(A, C1, 'AC1', 'small', 2, {}, 4.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      X.alias('big', ['AB', 'BC', 'CA']); X.alias('small', ['AB1', 'AC1', 'B1C1']);
      X.anim({ label: 'Менять коэффициент k', dur: 7000, t0: (S.k - 0.25) / 0.65,
        steps: [[0, 'k мал: фигура мала, площадь ещё меньше'], [0.4, 'Сторона растёт в k раз, площадь в k² раз'], [0.9, 'k → 0,9: фигуры почти совпадают']],
        set: function (t) { sl.K.setPosition(JXG.COORDS_BY_USER, [-3 + 6 * t, -2.4]); } });
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.C = xy(C); S.k = sl.k();
        var s = tri(A, B, C), s1 = tri(A, B1, C1), kk = 1 / sl.k();
        var a = G.dist(A, B), bb = G.dist(A, C), a1 = G.dist(A, B1), b1 = G.dist(A, C1);
        X.ro([[['k = AB/AB₁', G.f2(a / a1)], ['k = AC/AC₁', G.f2(bb / b1)]],
              [['S / S₁', G.f2(s / s1)], ['k²', G.f2(kk * kk) + ' ' + ok(eq(s / s1, kk * kk, 0.01))]],
              [['ab sin C / (a₁b₁ sin C₁)', G.f2((a * bb * Math.sin(G.ang(A, B, C))) / (a1 * b1 * Math.sin(G.ang(A, B1, C1))))], ['(a/a₁)(b/b₁)', G.f2((a / a1) * (bb / b1)) + ' ' + ok(eq(s / s1, (a / a1) * (bb / b1), 0.01))]]]);
      });
    }
  };

  /* Рис. 17.1 — подобные многоугольники, разбиение на треугольники из точки O */
  FIGS.z171 = {
    bbox: [-5.8, 4.8, 5.8, -3.0],
    state: function () { return { P: [[-3.4, -0.6], [-1.8, -1.6], [2.0, -1.0], [3.4, 1.4], [-0.4, 3.6]], O: [0.0, 0.6], k: 0.5 }; },
    build: function (X) {
      var b = X.b, S = X.S, nm = ['A', 'B', 'C', 'D', 'E'];
      var offs = [[-22, -6], [-10, -18], [8, -14], [8, 6], [-4, 10]];
      var V = S.P.map(function (p, i) { return X.P(nm[i], p, offs[i]); });
      var O = X.P('O', S.O, [6, -16]);
      var sl = slider(X, S, -2.4);
      G.guard(b, V.concat([O]), function () {
        var n = V.length, sg = 0;
        for (var i = 0; i < n; i++) {
          var c = cross(V[i], V[(i + 1) % n], V[(i + 2) % n]); if (Math.abs(c) < 0.5) return false;
          var s = c > 0 ? 1 : -1; if (!sg) sg = s; if (s !== sg) return false;
          var d = cross(V[i], V[(i + 1) % n], O) * sg; if (d < 0.5) return false;
        }
        return area(V) > 6;
      });
      var W = V.map(function (P, i) { return wp(X, nm[i] + '<sub>1</sub>', function () { var k = sl.k(); return [O.X() + k * (P.X() - O.X()), O.Y() + k * (P.Y() - O.Y())]; }, [-4, 8]); });
      var outl = function (Q, prim, tok, w, ex) { for (var i = 0; i < Q.length; i++) X.seg(Q[i], Q[(i + 1) % Q.length], prim + i, tok, w, ex, w + 2.5); };
      outl(V, 'big', 'big', 2, {}); outl(W, 'sm', 'small', 2, { dash: 2 });
      for (var i = 0; i < 5; i++) X.seg(O, V[i], 'ray' + i, 'tri', 1.1, { dash: 3 }, 3);
      V.forEach(function (P, i) { X.pt(P, 'p' + nm[i], nm[i]); }); X.pt(O, 'pO', 'O');
      X.alias('big', [0, 1, 2, 3, 4].map(function (i) { return 'big' + i; })); X.alias('small', [0, 1, 2, 3, 4].map(function (i) { return 'sm' + i; }));
      X.alias('tri', [0, 1, 2, 3, 4].map(function (i) { return 'ray' + i; }));
      X.anim({ label: 'Менять коэффициент k', dur: 7000, t0: (S.k - 0.25) / 0.65,
        steps: [[0, 'k мал: фигура мала, площадь ещё меньше'], [0.4, 'Сторона растёт в k раз, площадь в k² раз'], [0.9, 'k → 0,9: фигуры почти совпадают']],
        set: function (t) { sl.K.setPosition(JXG.COORDS_BY_USER, [-3 + 6 * t, -2.4]); } });
      b.on('update', function () {
        S.P = V.map(xy); S.O = xy(O); S.k = sl.k();
        var kk = 1 / sl.k(), s = area(V), s1 = area(W);
        var t0 = tri(O, V[0], V[1]), t01 = tri(O, W[0], W[1]);
        X.ro([[['k = AO/A₁O', G.f2(kk)], ['k²', G.f2(kk * kk)]],
              [['S<sub>ABCDE</sub> / S<sub>A₁…E₁</sub>', G.f2(s / s1)], ['k²', G.f2(kk * kk) + ' ' + ok(eq(s / s1, kk * kk, 0.01))]],
              [['S<sub>ABO</sub> / S<sub>A₁B₁O</sub>', G.f2(t0 / t01)], ['k²', G.f2(kk * kk) + ' ' + ok(eq(t0 / t01, kk * kk, 0.01))]]]);
      });
    }
  };

  /* Рис. 17.2 — деление трапеции на две равновеликие и на две подобные */
  function trap(X, S) {
    var b = X.b;
    var A = X.P('A', S.A, [-22, -16]), B = X.P('B', S.B, [-24, 4]);
    var Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
    var Bh = X.H(function () { return B.X() + 1; }, function () { return B.Y(); });
    var D = X.G('D', S.D, b.create('line', [A, Ah], { visible: false }), [8, -16]);
    var C = X.G('C', S.C, b.create('line', [B, Bh], { visible: false }), [8, 6]);
    var T = { A: A, B: B, C: C, D: D };
    T.a = function () { return D.X() - A.X(); }; T.b = function () { return C.X() - B.X(); }; T.h = function () { return B.Y() - A.Y(); };
    G.guard(b, [A, B, D, C], function () { return T.a() >= 2.5 && T.b() >= 0.8 && T.h() >= 0.9 && T.h() <= 4.6 && T.a() - T.b() >= 1.2; });
    X.seg(A, B, 'sAB', 'sides', 2, {}, 4.5); X.seg(B, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
    return T;
  }
  FIGS.z172 = {
    bbox: [-6.2, 4.8, 6.2, -2.6],
    state: function () { return { A: [-4.6, -1.4], D: [4.6, -1.4], B: [-1.6, 2.6], C: [1.5, 2.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S), A = T.A, B = T.B, C = T.C, D = T.D;
      function at(t, side) { return function () { return side === 'L' ? [A.X() + (B.X() - A.X()) * t(), A.Y() + (B.Y() - A.Y()) * t()] : [D.X() + (C.X() - D.X()) * t(), D.Y() + (C.Y() - D.Y()) * t()]; }; }
      function t1() { var a = T.a(), bb = T.b(); return Math.sqrt(a) / (Math.sqrt(a) + Math.sqrt(bb)); }
      function t2() { var a = T.a(), bb = T.b(), x = Math.sqrt((a * a + bb * bb) / 2); return 1 - (x - bb) / (a - bb); }
      var E1 = wp(X, 'E', at(t1, 'L'), [-22, 2]), F1 = wp(X, 'F', at(t1, 'R'), [8, 2]);
      var E2 = wp(X, 'E′', at(t2, 'L'), [-26, -14]), F2 = wp(X, 'F′', at(t2, 'R'), [8, -16]);
      X.seg(E1, F1, 'EF', 'sim', 2, { dash: 2 }, 4.5); X.seg(E2, F2, 'E2F2', 'eqa', 2, { dash: 3 }, 4.5);
      [['A', A], ['B', B], ['C', C], ['D', D], ['E', E1], ['F', F1], ['E2', E2], ['F2', F2]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.C = xy(C); S.D = xy(D);
        var a = T.a(), bb = T.b();
        var ef = G.dist(E1, F1), ef2 = G.dist(E2, F2);
        var s1 = (bb + ef2) / 2 * (B.Y() - E2.Y()), s2 = (a + ef2) / 2 * (E2.Y() - A.Y());
        var u1 = (bb + ef) / 2 * (B.Y() - E1.Y()), u2 = (a + ef) / 2 * (E1.Y() - A.Y());
        X.ro([[['S верхней', G.f2(s1)], ['S нижней', G.f2(s2) + ' ' + ok(eq(s1, s2, 0.02))]],
              [['E′F′', G.f2(ef2)], ['√((a²+b²)/2)', G.f2(Math.sqrt((a * a + bb * bb) / 2)) + ' ' + ok(eq(ef2, Math.sqrt((a * a + bb * bb) / 2), 0.01))]],
              [['EF', G.f2(ef)], ['√(ab)', G.f2(Math.sqrt(a * bb)) + ' ' + ok(eq(ef, Math.sqrt(a * bb), 0.01))]],
              [['S<sub>EDCF</sub> / S<sub>AEFB</sub>', G.f2(u1 / u2)], ['(EF/AB)²', G.f2(Math.pow(ef / a, 2)) + ' ' + ok(eq(u1 / u2, Math.pow(ef / a, 2), 0.02))]]]);
      });
    }
  };
})();
