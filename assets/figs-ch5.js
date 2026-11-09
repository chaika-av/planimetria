/* Глава 5. Свойство биссектрисы внутреннего и внешнего углов треугольника */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function wp(X, name, P, Q, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function tri(X, S) { return { A: X.P('A', S.A, [-22, -14]), B: X.P('B', S.B, [-24, 6]), C: X.P('C', S.C, [8, -14]) }; }
  function sv(S, T) { S.A = [T.A.X(), T.A.Y()]; S.B = [T.B.X(), T.B.Y()]; S.C = [T.C.X(), T.C.Y()]; }
  function sides(X, T) { X.seg(T.A, T.B, 'sAB', 'tri', 2, {}, 4.5); X.seg(T.B, T.C, 'sBC', 'tri', 2, {}, 4.5); X.seg(T.C, T.A, 'sCA', 'tri', 2, {}, 4.5); }

  /* Рис. 5.1 — биссектриса внутреннего угла: c/b = a_c/a_b */
  FIGS.c51 = {
    bbox: [-5.6, 5.8, 7.2, -2.6],
    state: function () { return { A: [-3.4, -1.6], B: [-1.2, 3.4], C: [3.2, -1.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      function cc() { return G.dist(A, B); } function bb() { return G.dist(A, C); }
      var A1 = wp(X, 'A<sub>1</sub>', A, A, function () { var s = bb() + cc(); return [(bb() * B.X() + cc() * C.X()) / s, (bb() * B.Y() + cc() * C.Y()) / s]; }, [6, 6]);
      var D = wp(X, 'D', A, A, function () { var k = bb() / cc(); return [A1.X() + (A1.X() - A.X()) * k, A1.Y() + (A1.Y() - A.Y()) * k]; }, [8, -14]);
      var E1 = X.H(function () { var dx = A1.X() - A.X(), dy = A1.Y() - A.Y(), l = Math.hypot(dx, dy) || 1; return A.X() - dy / l * 2.2; }, function () { var dx = A1.X() - A.X(), dy = A1.Y() - A.Y(), l = Math.hypot(dx, dy) || 1; return A.Y() + dx / l * 2.2; });
      var E2 = X.H(function () { var dx = A1.X() - A.X(), dy = A1.Y() - A.Y(), l = Math.hypot(dx, dy) || 1; return A.X() + dy / l * 2.2; }, function () { var dx = A1.X() - A.X(), dy = A1.Y() - A.Y(), l = Math.hypot(dx, dy) || 1; return A.Y() - dx / l * 2.2; });
      sides(X, T);
      X.seg(A, D, 'La', 'La', 1.8, { dash: 2 }, 4.5); X.seg(C, D, 'CD', 'CD', 1.6, {}, 4.5); X.seg(E1, E2, 'ext', 'ext', 1.1, { dash: 3 }, 3.5);
      X.ang(A, B, A1, 0.8, '1', 'a1', '1'); X.ang(A, A1, C, 0.8, '2', 'a2', '2'); X.ang(D, A, C, 0.7, '3', 'a3', '3');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1'); X.pt(D, 'pD', 'D');
      X.alias('iso', ['sCA', 'CD']); X.alias('sim', ['sAB', 'CD', 'La']);
      b.on('update', function () {
        sv(S, T);
        var c = cc(), bv = bb(), ac = G.dist(B, A1), ab = G.dist(A1, C), g = G.dist(C, D);
        var a1 = G.ang(A, B, A1), a2 = G.ang(A, A1, C), a3 = G.ang(D, A, C), perp = G.ang(A, A1, E1);
        X.ro([[['c / b', G.f2(c / bv)], ['a<sub>c</sub> / a<sub>b</sub>', G.f2(ac / ab) + ' ' + ok(eq(c / bv, ac / ab))]],
              [['AC', G.f2(bv)], ['CD', G.f2(g) + ' ' + ok(eq(bv, g))]],
              [['∠1', G.deg(a1)], ['∠2', G.deg(a2) + ' ' + ok(eq(a1, a2, 0.002))], ['∠3', G.deg(a3) + ' ' + ok(eq(a1, a3, 0.002))]],
              [['биссектрисы внутр. и внешн. углов', G.deg(perp) + ' ' + ok(eq(perp, Math.PI / 2, 0.002))]]]);
      });
    }
  };

  /* Рис. 5.2 — биссектриса внешнего угла: b/c = A₁C/A₁B */
  FIGS.c52 = {
    bbox: [-11, 6, 7, -4],
    state: function () { return { A: [-1, -2], B: [-1.8, 1.1], C: [5.2, -2] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      function cc() { return G.dist(A, B); } function bb() { return G.dist(A, C); }
      function dd() { var d = bb() - cc(); return Math.abs(d) < 0.05 ? 0.05 : d; }
      var A1 = wp(X, 'A<sub>1</sub>', A, A, function () { return [(bb() * B.X() - cc() * C.X()) / dd(), (bb() * B.Y() - cc() * C.Y()) / dd()]; }, [8, 8]);
      var D = wp(X, 'D', A, A, function () { var k = cc() / bb(); return [A.X() + (C.X() - A.X()) * k, A.Y() + (C.Y() - A.Y()) * k]; }, [4, -18]);
      var E = X.H(function () { return A.X() - (C.X() - A.X()) * 0.5; }, function () { return A.Y() - (C.Y() - A.Y()) * 0.5; });
      G.guard(b, [A, B, C], function () { return G.dist(A, C) > 1.3 * G.dist(A, B) && G.dist(A, B) > 0.8 && G.ang(A, B, C) > 0.2 && G.ang(B, A, C) < 2.9; });
      sides(X, T);
      X.seg(A, A1, 'La', 'La', 1.8, { dash: 2 }, 4.5); X.seg(B, A1, 'ext', 'ext', 1.2, { dash: 3 }, 3.5);
      X.seg(E, A, 'ext0', 'ext', 1.1, { dash: 3 }, 3.5); X.seg(B, D, 'BD', 'BD', 1.6, {}, 4.5);
      X.hidden(C, A1, 'A1C', 'ratio'); X.hidden(B, A1, 'A1B', 'ratio');
      X.ang(A, B, A1, 0.8, '1', 'a1', '1'); X.ang(A, A1, E, 0.8, '2', 'a2', '2'); X.ang(B, A, D, 0.7, '3', 'a3', '3'); X.ang(D, A, B, 0.7, '4', 'a4', '4');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1'); X.pt(D, 'pD', 'D');
      X.alias('par', ['La', 'BD']); X.alias('iso', ['sAB', 'BD']);
      b.on('update', function () {
        sv(S, T);
        var c = cc(), bv = bb(), p = G.dist(C, A1), q = G.dist(B, A1);
        var a1 = G.ang(A, B, A1), a2 = G.ang(A, A1, E), a3 = G.ang(B, A, D), a4 = G.ang(D, A, B);
        X.ro([[['b / c', G.f2(bv / c)], ['A<sub>1</sub>C / A<sub>1</sub>B', G.f2(p / q) + ' ' + ok(eq(bv / c, p / q, 0.01))]],
              [['AD', G.f2(G.dist(A, D))], ['AB', G.f2(c) + ' ' + ok(eq(G.dist(A, D), c))]],
              [['∠1', G.deg(a1)], ['∠2', G.deg(a2) + ' ' + ok(eq(a1, a2, 0.002))], ['∠3', G.deg(a3) + ' ' + ok(eq(a1, a3, 0.002))], ['∠4', G.deg(a4) + ' ' + ok(eq(a3, a4, 0.002))]]]);
      });
    }
  };

  /* Рис. 5.3 — обобщённая теорема Фалеса */
  FIGS.c53 = {
    bbox: [-5.6, 5.2, 7.4, -2.6],
    state: function () { return { A: [-4.4, -1.8], K1: [6.4, -0.6], K2: [3.6, 4.4], B: [-0.8, -1.4], C: [1.8, -1.1], D: [5.0, -0.7], B1: [-2.7, 0.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('A', S.A, [-22, -14]), K1 = X.P('', S.K1, [0, 0], { size: 3, color: C0.mu }), K2 = X.P('', S.K2, [0, 0], { size: 3 });
      var l1 = b.create('line', [A, K1], { visible: false }), l2 = b.create('line', [A, K2], { visible: false });
      var B = X.G('B', S.B, l1, [4, -18]), Cc = X.G('C', S.C, l1, [4, -18]), D = X.G('D', S.D, l1, [4, -18]), B1 = X.G('B<sub>1</sub>', S.B1, l2, [-26, 6]);
      var u = function () { return [B1.X() - B.X(), B1.Y() - B.Y()]; };
      function onl2(P, name, off) { return X.D(name, function () { var t = G.inter([P.X(), P.Y()], u(), [A.X(), A.Y()], [K2.X() - A.X(), K2.Y() - A.Y()]); return t[0]; }, function () { return G.inter([P.X(), P.Y()], u(), [A.X(), A.Y()], [K2.X() - A.X(), K2.Y() - A.Y()])[1]; }, off); }
      var C1 = onl2(Cc, 'C<sub>1</sub>', [-26, 6]), D1 = onl2(D, 'D<sub>1</sub>', [-26, 6]);
      function ext(P) { return X.H(function () { return A.X() + (P.X() - A.X()) * 1.0; }, function () { return A.Y() + (P.Y() - A.Y()) * 1.0; }); }
      var far1 = X.H(function () { var d = Math.max(G.dist(A, D), G.dist(A, Cc), G.dist(A, B)) * 1.15 + 0.6, l = G.dist(A, K1) || 1; return A.X() + (K1.X() - A.X()) / l * d; }, function () { var d = Math.max(G.dist(A, D), G.dist(A, Cc), G.dist(A, B)) * 1.15 + 0.6, l = G.dist(A, K1) || 1; return A.Y() + (K1.Y() - A.Y()) / l * d; });
      var far2 = X.H(function () { var d = Math.max(G.dist(A, D1), G.dist(A, C1), G.dist(A, B1)) * 1.15 + 0.6, l = G.dist(A, K2) || 1; return A.X() + (K2.X() - A.X()) / l * d; }, function () { var d = Math.max(G.dist(A, D1), G.dist(A, C1), G.dist(A, B1)) * 1.15 + 0.6, l = G.dist(A, K2) || 1; return A.Y() + (K2.Y() - A.Y()) / l * d; });
      X.seg(A, far1, 'r1', 'rays', 1.8, {}, 4); X.seg(A, far2, 'r2', 'rays', 1.8, {}, 4);
      X.seg(B, B1, 'p1', 'par', 1.5, {}, 4); X.seg(Cc, C1, 'p2', 'par', 1.5, {}, 4); X.seg(D, D1, 'p3', 'par', 1.5, {}, 4);
      X.hidden(A, B, 'AB', 'AB'); X.hidden(B, Cc, 'BC', 'BC'); X.hidden(Cc, D, 'CD', 'CD');
      X.hidden(A, B1, 'AB1', 'AB1'); X.hidden(B1, C1, 'B1C1', 'BC'); X.hidden(C1, D1, 'C1D1', 'CD');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(Cc, 'pC', 'C'); X.pt(D, 'pD', 'D'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1'); X.pt(D1, 'pD1', 'D1');
      X.alias('AB:BC:CD', ['AB', 'BC', 'CD']); X.alias('AB1:B1C1:C1D1', ['AB1', 'B1C1', 'C1D1']);
      b.on('update', function () {
        [['A', A], ['K1', K1], ['K2', K2], ['B', B], ['C', Cc], ['D', D], ['B1', B1]].forEach(function (a) { S[a[0]] = [a[1].X(), a[1].Y()]; });
        var r1 = G.dist(A, B) / G.dist(A, B1), r2 = G.dist(B, Cc) / G.dist(B1, C1), r3 = G.dist(Cc, D) / G.dist(C1, D1);
        X.ro([[['AB / AB<sub>1</sub>', G.f2(r1)], ['BC / B<sub>1</sub>C<sub>1</sub>', G.f2(r2) + ' ' + ok(eq(r1, r2, 0.01))], ['CD / C<sub>1</sub>D<sub>1</sub>', G.f2(r3) + ' ' + ok(eq(r1, r3, 0.01))]]]);
      });
    }
  };
})();
