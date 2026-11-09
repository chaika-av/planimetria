/* Глава 18. Отношение площадей треугольников при условии равенства одного параметра */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function cross(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function tri(A, B, C) { return Math.abs(cross(A, B, C)) / 2; }
  function fill(X, pts, prim, tok) {   /* закрашиваемый треугольник, виден при подсветке */
    return X.poly(function () { return pts.concat([pts[0]]).map(xy); }, { strokeWidth: 0, fillColor: X.C.acc, fillOpacity: 0, highlight: false, fixed: true }, prim, tok, { fillOpacity: 0 }, { fillOpacity: 0.3 });
  }
  function hline(X, y) {
    var p = X.H(function () { return 0; }, function () { return y; }), q = X.H(function () { return 1; }, function () { return y; });
    return X.b.create('line', [p, q], { visible: false });
  }

  /* Рис. 18.1 — равные основания */
  FIGS.a181 = {
    bbox: [-5.8, 4.4, 5.8, -1.6],
    state: function () { return { A: [-5.0, -0.8], B: [-2.2, -0.8], C: [-3.3, 3.2], C1: [2.4, 1.6] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var bl = hline(X, -0.8);
      var A = X.G('A', S.A, bl, [-22, -14]), B = X.G('B', S.B, bl, [8, -14]), C = X.P('C', S.C, [-4, 10]);
      var A1 = wp(X, 'A<sub>1</sub>', function () { return [A.X() + 5.4, A.Y()]; }, [-24, -14]);
      var B1 = wp(X, 'B<sub>1</sub>', function () { return [B.X() + 5.4, B.Y()]; }, [8, -14]);
      var C1 = X.P('C<sub>1</sub>', [S.C1[0], S.C1[1]], [-4, 10]);
      G.guard(b, [A, B, C, C1], function () { return G.dist(A, B) > 1.2 && G.dist(A, B) < 3.4 && C.Y() - A.Y() > 0.6 && C1.Y() - A.Y() > 0.6 && C.Y() < 4.0 && C1.Y() < 4.0; });
      X.seg(A, B, 'AB', 'c', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri1', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri1', 2, {}, 4.5);
      X.seg(A1, B1, 'A1B1', 'c', 2, {}, 4.5); X.seg(B1, C1, 'B1C1', 'tri2', 2, {}, 4.5); X.seg(C1, A1, 'C1A1', 'tri2', 2, {}, 4.5);
      var F = wp(X, '', function () { return [C.X(), A.Y()]; }), F1 = wp(X, '', function () { return [C1.X(), A.Y()]; });
      F.setAttribute({ visible: false }); F1.setAttribute({ visible: false });
      X.seg(C, F, 'h', 'h', 1.4, { dash: 2 }, 3.5); X.seg(C1, F1, 'h1', 'h1', 1.4, { dash: 2 }, 3.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      X.alias('c', ['AB', 'A1B1']);
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.C = xy(C); S.C1 = xy(C1);
        var c = G.dist(A, B), h = C.Y() - A.Y(), h1 = C1.Y() - A.Y(), s = tri(A, B, C), s1 = tri(A1, B1, C1);
        X.ro([[['AB', G.f2(c)], ['A₁B₁', G.f2(G.dist(A1, B1))]],
              [['h', G.f2(h)], ['h₁', G.f2(h1)]],
              [['S / S₁', G.f2(s / s1)], ['h / h₁', G.f2(h / h1) + ' ' + ok(eq(s / s1, h / h1, 0.01))]]]);
      });
    }
  };

  /* Рис. 18.2 — равные высоты */
  FIGS.a182 = {
    bbox: [-5.8, 4.4, 5.8, -1.6],
    state: function () { return { A: -5.0, B: -1.6, A1: 0.6, B1: 4.6, Cx: -3.0, C1x: 2.4, h: 2.8 }; },
    build: function (X) {
      var b = X.b, S = X.S, base = hline(X, -0.8);
      var A = X.G('A', [S.A, -0.8], base, [-22, -14]), B = X.G('B', [S.B, -0.8], base, [8, -14]);
      var A1 = X.G('A<sub>1</sub>', [S.A1, -0.8], base, [-24, -14]), B1 = X.G('B<sub>1</sub>', [S.B1, -0.8], base, [8, -14]);
      var C = X.P('C', [S.Cx, -0.8 + S.h], [-4, 10]);
      var top = b.create('line', [C, X.H(function () { return C.X() + 1; }, function () { return C.Y(); })], { visible: false });
      var C1 = X.G('C<sub>1</sub>', [S.C1x, -0.8 + S.h], top, [-4, 10]);
      G.guard(b, [A, B, A1, B1, C], function () {
        var h = C.Y() + 0.8; return h > 0.7 && h < 4.0 && B.X() - A.X() > 0.9 && B1.X() - A1.X() > 0.9 && A1.X() - B.X() > 0.5;
      });
      X.seg(A, B, 'AB', 'c', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri1', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri1', 2, {}, 4.5);
      X.seg(A1, B1, 'A1B1', 'c1', 2, {}, 4.5); X.seg(B1, C1, 'B1C1', 'tri2', 2, {}, 4.5); X.seg(C1, A1, 'C1A1', 'tri2', 2, {}, 4.5);
      var F = wp(X, '', function () { return [C.X(), -0.8]; }), F1 = wp(X, '', function () { return [C1.X(), -0.8]; });
      F.setAttribute({ visible: false }); F1.setAttribute({ visible: false });
      X.seg(C, F, 'h', 'h', 1.4, { dash: 2 }, 3.5); X.seg(C1, F1, 'h1', 'h', 1.4, { dash: 2 }, 3.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      b.on('update', function () {
        S.A = A.X(); S.B = B.X(); S.A1 = A1.X(); S.B1 = B1.X(); S.Cx = C.X(); S.C1x = C1.X(); S.h = C.Y() + 0.8;
        var c = G.dist(A, B), c1 = G.dist(A1, B1), s = tri(A, B, C), s1 = tri(A1, B1, C1);
        X.ro([[['h', G.f2(C.Y() + 0.8)], ['h₁', G.f2(C1.Y() + 0.8)]],
              [['AB', G.f2(c)], ['A₁B₁', G.f2(c1)]],
              [['S / S₁', G.f2(s / s1)], ['AB / A₁B₁', G.f2(c / c1) + ' ' + ok(eq(s / s1, c / c1, 0.01))]]]);
      });
    }
  };

  /* Рис. 18.3 — две равные стороны */
  FIGS.a183 = {
    bbox: [-5.8, 4.4, 5.8, -1.6],
    state: function () { return { A: [-5.0, -0.8], B: [-1.6, -0.8], ta: 1.05, tb: 0.6 }; },
    build: function (X) {
      var b = X.b, S = X.S, r0 = 2.6;
      var A = X.P('A', S.A, [-22, -14]);
      var Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
      var B = X.G('B', S.B, b.create('line', [A, Ah], { visible: false }), [8, -14]);
      var A1 = wp(X, 'A<sub>1</sub>', function () { return [A.X() + 5.6, A.Y()]; }, [-24, -14]);
      var B1 = wp(X, 'B<sub>1</sub>', function () { return [B.X() + 5.6, B.Y()]; }, [8, -14]);
      var cA = b.create('circle', [A, r0], { visible: false });
      var C = X.G('C', [A.X() + r0 * Math.cos(S.ta), A.Y() + r0 * Math.sin(S.ta)], cA, [-4, 10]);
      var cA1 = b.create('circle', [A1, r0], { visible: false });
      var C1 = X.G('C<sub>1</sub>', [A.X() + 5.6 + r0 * Math.cos(S.tb), A.Y() + r0 * Math.sin(S.tb)], cA1, [-4, 10]);
      G.guard(b, [A, B, C, C1], function () {
        return B.X() - A.X() > 1.2 && B.X() - A.X() < 3.8 && A.Y() > -1.4 && A.Y() < -0.2 && C.Y() - A.Y() > 0.3 && C1.Y() - A.Y() > 0.3 && A.X() > -5.4 && B.X() < 0.6;
      });
      X.seg(A, B, 'AB', 'c', 2, {}, 4.5); X.seg(A, C, 'AC', 'bb', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri1', 2, {}, 4.5);
      X.seg(A1, B1, 'A1B1', 'c', 2, {}, 4.5); X.seg(A1, C1, 'A1C1', 'bb', 2, {}, 4.5); X.seg(B1, C1, 'B1C1', 'tri2', 2, {}, 4.5);
      X.ang(A, B, C, 0.7, 'A', 'aA', 'angA'); X.ang(A1, B1, C1, 0.7, 'A<sub>1</sub>', 'aA1', 'angA1');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      X.alias('c', ['AB', 'A1B1']); X.alias('bb', ['AC', 'A1C1']);
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.ta = Math.atan2(C.Y() - A.Y(), C.X() - A.X()); S.tb = Math.atan2(C1.Y() - A1.Y(), C1.X() - A1.X());
        var sA = Math.sin(G.ang(A, B, C)), sA1 = Math.sin(G.ang(A1, B1, C1)), s = tri(A, B, C), s1 = tri(A1, B1, C1);
        X.ro([[['AB, A₁B₁', G.f2(G.dist(A, B)) + ', ' + G.f2(G.dist(A1, B1))], ['AC, A₁C₁', G.f2(G.dist(A, C)) + ', ' + G.f2(G.dist(A1, C1))]],
              [['∠A', G.deg(G.ang(A, B, C))], ['∠A₁', G.deg(G.ang(A1, B1, C1))]],
              [['S / S₁', G.f2(s / s1)], ['sin A / sin A₁', G.f2(sA / sA1) + ' ' + ok(eq(s / s1, sA / sA1, 0.01))]]]);
      });
    }
  };

  /* трапеция ABCD: AD = a (нижнее), BC = b (верхнее) */
  function trap(X, S) {
    var b = X.b;
    var A = X.P('A', S.A, [-22, -16]), B = X.P('B', S.B, [-24, 4]);
    var Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
    var Bh = X.H(function () { return B.X() + 1; }, function () { return B.Y(); });
    var D = X.G('D', S.D, b.create('line', [A, Ah], { visible: false }), [8, -16]);
    var C = X.G('C', S.C, b.create('line', [B, Bh], { visible: false }), [8, 6]);
    var T = { A: A, B: B, C: C, D: D };
    T.a = function () { return D.X() - A.X(); }; T.b = function () { return C.X() - B.X(); }; T.h = function () { return B.Y() - A.Y(); };
    G.guard(b, [A, B, D, C], function () { return T.a() >= 2.5 && T.b() >= 0.8 && T.h() >= 1.2 && T.h() <= 4.6 && T.a() - T.b() >= 0.6; });
    X.seg(A, B, 'sAB', 'sides', 2, {}, 4.5); X.seg(B, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
    return T;
  }
  function xyS(S, T) { S.A = xy(T.A); S.B = xy(T.B); S.C = xy(T.C); S.D = xy(T.D); }

  /* Рис. 18.4–18.5 — треугольники в трапеции */
  FIGS.a184 = {
    bbox: [-6.2, 4.8, 6.2, -2.4],
    state: function () { return { A: [-4.6, -1.2], D: [4.6, -1.2], B: [-1.8, 2.8], C: [1.6, 2.8] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S), A = T.A, B = T.B, C = T.C, D = T.D;
      var O = wp(X, 'O', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [-4, 8]);
      X.seg(A, C, 'AC', 'diag', 1.4, {}, 3.5); X.seg(B, D, 'BD', 'diag', 1.4, {}, 3.5);
      fill(X, [A, B, O], 'fAB', 'sABO'); fill(X, [C, D, O], 'fCD', 'sCDO'); fill(X, [A, D, O], 'fAD', 'sADO'); fill(X, [B, C, O], 'fBC', 'sBCO');
      X.alias('sbok', ['fAB', 'fCD']);
      [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        xyS(S, T);
        var a = T.a(), bb = T.b(), s1 = tri(B, C, O), s2 = tri(A, B, O), s3 = tri(A, D, O), s4 = tri(C, D, O), s0 = (a + bb) / 2 * T.h();
        X.ro([[['S<sub>ABO</sub>', G.f2(s2)], ['S<sub>CDO</sub>', G.f2(s4) + ' ' + ok(eq(s2, s4, 0.01))]],
              [['S<sub>ADO</sub> / S<sub>BCO</sub>', G.f2(s3 / s1)], ['a² / b²', G.f2(a * a / (bb * bb)) + ' ' + ok(eq(s3 / s1, a * a / (bb * bb), 0.02))]],
              [['S<sub>BCO</sub>·S<sub>ADO</sub>', G.f2(s1 * s3)], ['S<sub>бок</sub>²', G.f2(s2 * s2) + ' ' + ok(eq(s1 * s3, s2 * s2, 0.02))]],
              [['S₁ : S₂ : S₃', G.f2(s1 / s0) + ' : ' + G.f2(s2 / s0) + ' : ' + G.f2(s3 / s0)], ['b² : ab : a² от (a+b)²', G.f2(bb * bb / ((a + bb) * (a + bb))) + ' : ' + G.f2(a * bb / ((a + bb) * (a + bb))) + ' : ' + G.f2(a * a / ((a + bb) * (a + bb))) + ' ' + ok(eq(s1 / s0, bb * bb / ((a + bb) * (a + bb)), 0.004) && eq(s2 / s0, a * bb / ((a + bb) * (a + bb)), 0.004) && eq(s3 / s0, a * a / ((a + bb) * (a + bb)), 0.004))]]]);
      });
    }
  };

  /* Рис. 18.5а — равнобедренная трапеция */
  FIGS.a185 = {
    bbox: [-6.2, 4.8, 6.2, -2.4],
    state: function () { return { A: [-4.4, -1.2], D: 4.4, Bx: -1.6, By: 2.6 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -16]);
      var Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
      var D = X.G('D', [S.D, S.A[1]], b.create('line', [A, Ah], { visible: false }), [8, -16]);
      var mid = function () { return (A.X() + D.X()) / 2; };
      var B = X.P('B', [S.Bx, S.By], [-24, 4]);
      var C = wp(X, 'C', function () { return [2 * mid() - B.X(), B.Y()]; }, [8, 6]);
      G.guard(b, [A, D, B], function () { var a = D.X() - A.X(), bb = 2 * (mid() - B.X()), h = B.Y() - A.Y(); return a > 3 && bb > 0.8 && a - bb > 0.6 && h > 1.2 && h < 4.6 && Math.abs(A.Y() - D.Y()) < 0.01; });
      X.seg(A, B, 'sAB', 'sides', 2, {}, 4.5); X.seg(B, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
      var O = wp(X, 'O', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [-4, 8]);
      var E = wp(X, '', function () { return [O.X(), A.Y()]; }), F = wp(X, '', function () { return [O.X(), B.Y()]; });
      E.setAttribute({ visible: false }); F.setAttribute({ visible: false });
      X.seg(A, C, 'AC', 'diag', 1.4, {}, 3.5); X.seg(B, D, 'BD', 'diag', 1.4, {}, 3.5);
      X.seg(E, O, 'h1', 'h1', 1.5, { dash: 2 }, 3.5); X.seg(O, F, 'h2', 'h2', 1.5, { dash: 2 }, 3.5);
      fill(X, [B, C, O], 'f1', 'S1'); fill(X, [A, D, O], 'f3', 'S3'); fill(X, [A, B, O], 'f2', 'S2'); fill(X, [C, D, O], 'f4', 'S4');
      [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        S.A = xy(A); S.D = D.X(); S.Bx = B.X(); S.By = B.Y();
        var a = D.X() - A.X(), bb = C.X() - B.X(), h = B.Y() - A.Y(), s1 = tri(B, C, O), s2 = tri(A, B, O), s3 = tri(A, D, O), s4 = tri(C, D, O), s0 = (a + bb) * h / 2;
        var q = [bb * bb * h / (2 * (a + bb)), a * a * h / (2 * (a + bb)), a * bb * h / (2 * (a + bb))];
        X.ro([[['S₁', G.f2(s1)], ['b²h / (2(a+b))', G.f2(q[0]) + ' ' + ok(eq(s1, q[0], 0.01))]],
              [['S₃', G.f2(s3)], ['a²h / (2(a+b))', G.f2(q[1]) + ' ' + ok(eq(s3, q[1], 0.01))]],
              [['S<sub>бок</sub> = √(S₁S₃)', G.f2(Math.sqrt(s1 * s3))], ['abh / (2(a+b))', G.f2(q[2]) + ' ' + ok(eq(Math.sqrt(s1 * s3), q[2], 0.01) && eq(s2, q[2], 0.01) && eq(s4, q[2], 0.01))]],
              [['S₁+S₂+S₃+S₄', G.f2(s1 + s2 + s3 + s4)], ['S трапеции', G.f2(s0) + ' ' + ok(eq(s1 + s2 + s3 + s4, s0, 0.01))]]]);
      });
    }
  };

  /* Рис. 18.6 — прямая B₁C₁ в треугольнике */
  FIGS.a186 = {
    bbox: [-5.6, 4.6, 5.6, -1.8],
    state: function () { return { A: [-4.2, -0.8], B: [4.0, -0.8], C: [0.4, 3.8], p: 0.4, m: 0.62 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [8, -14]), C = X.P('C', S.C, [-4, 10]);
      var AB = b.create('segment', [A, B], { visible: false }), AC = b.create('segment', [A, C], { visible: false });
      var B1 = X.G('B<sub>1</sub>', [A.X() + S.p * (B.X() - A.X()), A.Y() + S.p * (B.Y() - A.Y())], AB, [-4, -18]);
      var C1 = X.G('C<sub>1</sub>', [A.X() + S.m * (C.X() - A.X()), A.Y() + S.m * (C.Y() - A.Y())], AC, [-26, 4]);
      G.guard(b, [A, B, C, B1, C1], function () { var u = G.dist(A, B1) / G.dist(A, B), v = G.dist(A, C1) / G.dist(A, C); return tri(A, B, C) > 4 && G.ang(A, B, C) > 0.35 && G.ang(B, C, A) > 0.35 && G.ang(C, A, B) > 0.35 && u > 0.15 && u < 0.85 && v > 0.15 && v < 0.85; });
      X.seg(A, B, 'AB', 'sides', 2, {}, 4.5); X.seg(B, C, 'BC', 'sides', 2, {}, 4.5); X.seg(C, A, 'CA', 'sides', 2, {}, 4.5);
      X.seg(B1, C1, 'B1C1', 'cut', 2, { dash: 2 }, 4.5);
      fill(X, [A, B1, C1], 'fs', 'small');
      ['A', 'B', 'C'].forEach(function (n, i) { X.pt([A, B, C][i], 'p' + n, n); }); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.C = xy(C);
        var m = G.dist(A, C1), n = G.dist(C1, C), p = G.dist(A, B1), k = G.dist(B1, B), s = tri(A, C1, B1), s0 = tri(A, C, B);
        S.p = p / (p + k); S.m = m / (m + n);
        X.ro([[['AC₁ : C₁C = m : n', G.f2(m) + ' : ' + G.f2(n)], ['AB₁ : B₁B = p : k', G.f2(p) + ' : ' + G.f2(k)]],
              [['S<sub>AC₁B₁</sub> / S<sub>ACB</sub>', G.f2(s / s0)], ['mp / ((m+n)(p+k))', G.f2(m * p / ((m + n) * (p + k))) + ' ' + ok(eq(s / s0, m * p / ((m + n) * (p + k)), 0.004))]]]);
      });
    }
  };

  /* Рис. 18.7 — две прямые, пересекающиеся в точке A */
  FIGS.a187 = {
    bbox: [-5.8, 4.4, 5.8, -4.4],
    state: function () { return { A: [-0.2, 0.4], B: [-3.8, -1.2], B1: 0.8, C1: [1.8, 3.6], c: 0.55 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-4, -18]), B = X.P('B', S.B, [-22, -14]), C1 = X.P('C<sub>1</sub>', S.C1, [8, 6]);
      var lAB = b.create('line', [A, B], { visible: false }), lAC = b.create('line', [A, C1], { visible: false });
      var d = [A.X() - B.X(), A.Y() - B.Y()], L = Math.hypot(d[0], d[1]);
      var B1 = X.G('B<sub>1</sub>', [A.X() + d[0] / L * S.B1 * 2.2, A.Y() + d[1] / L * S.B1 * 2.2], lAB, [8, 6]);
      var C = X.G('C', [A.X() + S.c * (C1.X() - A.X()), A.Y() + S.c * (C1.Y() - A.Y())], b.create('segment', [A, C1], { visible: false }), [-18, 6]);
      G.guard(b, [A, B, C1, B1, C], function () {
        if (G.dist(A, B) < 1.0 || G.dist(A, B1) < 0.8 || G.dist(A, C1) < 1.2 || G.dist(A, C) < 0.5 || G.dist(C, C1) < 0.5) return false;
        var v1 = [B.X() - A.X(), B.Y() - A.Y()], v2 = [B1.X() - A.X(), B1.Y() - A.Y()];
        if (v1[0] * v2[0] + v1[1] * v2[1] >= 0) return false;
        return Math.abs(G.ang(B, A, C1)) > 0.3 && Math.abs(G.ang(B, A, C1)) < 2.84;
      });
      X.seg(B, B1, 'BB1', 'l1', 2, {}, 4.5); X.seg(A, C1, 'AC1', 'l2', 2, {}, 4.5);
      X.seg(B, C, 'BC', 'tri1', 1.6, { dash: 0 }, 4); X.seg(B1, C1, 'B1C1', 'tri2', 1.6, {}, 4);
      fill(X, [A, B, C], 'f1', 'T1'); fill(X, [A, B1, C1], 'f2', 'T2');
      [['A', A], ['B', B], ['C', C]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.C1 = xy(C1); S.B1 = G.dist(A, B1) / 2.2; S.c = G.dist(A, C) / G.dist(A, C1);
        var p = G.dist(B, A), k = G.dist(A, B1), m = G.dist(A, C), n = G.dist(C, C1), s = tri(A, B, C), s1 = tri(A, B1, C1);
        X.ro([[['BA : AB₁ = p : k', G.f2(p) + ' : ' + G.f2(k)], ['AC : CC₁ = m : n', G.f2(m) + ' : ' + G.f2(n)]],
              [['S<sub>ABC</sub> / S<sub>AB₁C₁</sub>', G.f2(s / s1)], ['AB·AC / (AB₁·AC₁)', G.f2(p * m / (k * (m + n))) + ' ' + ok(eq(s / s1, p * m / (k * (m + n)), 0.01))]]]);
      });
    }
  };

  /* Рис. 18.8 — диагонали четырёхугольника */
  FIGS.a188 = {
    bbox: [-5.6, 4.6, 5.6, -2.6],
    state: function () { return { A: [-4.4, -0.4], B: [0.6, -1.6], C: [4.2, 1.0], D: [-1.4, 3.8] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -6]), B = X.P('B', S.B, [-4, -18]), C = X.P('C', S.C, [8, 0]), D = X.P('D', S.D, [-4, 10]);
      G.guard(b, [A, B, C, D], function () {
        var c1 = cross(A, B, C), c2 = cross(B, C, D), c3 = cross(C, D, A), c4 = cross(D, A, B);
        return Math.min(Math.abs(c1), Math.abs(c2), Math.abs(c3), Math.abs(c4)) > 1.0 && c1 * c2 > 0 && c2 * c3 > 0 && c3 * c4 > 0;
      });
      var O = wp(X, 'O', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [6, -16]);
      X.seg(A, B, 'AB', 'sides', 2, {}, 4.5); X.seg(B, C, 'BC', 'sides', 2, {}, 4.5); X.seg(C, D, 'CD', 'sides', 2, {}, 4.5); X.seg(D, A, 'DA', 'sides', 2, {}, 4.5);
      X.seg(A, C, 'AC', 'diag', 1.4, {}, 3.5); X.seg(B, D, 'BD', 'diag', 1.4, {}, 3.5);
      fill(X, [A, B, D], 'fABD', 'sABD'); fill(X, [C, B, D], 'fCBD', 'sCBD');
      [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        ['A', 'B', 'C', 'D'].forEach(function (n, i) { S[n] = xy([A, B, C, D][i]); });
        var sABD = tri(A, B, D), sCBD = tri(C, B, D), sACB = tri(A, C, B), sACD = tri(A, C, D);
        var sBOC = tri(B, O, C), sBOA = tri(B, O, A), sAOB = tri(A, O, B), sAOD = tri(A, O, D);
        var r = G.dist(A, O) / G.dist(C, O), t = G.dist(B, O) / G.dist(D, O);
        X.ro([[['S<sub>ABD</sub> / S<sub>CBD</sub>', G.f2(sABD / sCBD)], ['AO / OC', G.f2(r) + ' ' + ok(eq(sABD / sCBD, r, 0.01))]],
              [['S<sub>ACB</sub> / S<sub>ACD</sub>', G.f2(sACB / sACD)], ['BO / DO', G.f2(t) + ' ' + ok(eq(sACB / sACD, t, 0.01))]],
              [['S<sub>BOC</sub> / S<sub>BOA</sub>', G.f2(sBOC / sBOA)], ['OC / OA', G.f2(1 / r) + ' ' + ok(eq(sBOC / sBOA, 1 / r, 0.01))]],
              [['S<sub>AOB</sub> / S<sub>AOD</sub>', G.f2(sAOB / sAOD)], ['OB / OD', G.f2(t) + ' ' + ok(eq(sAOB / sAOD, t, 0.01))]]]);
      });
    }
  };

  /* Рис. 18.9 — деление отрезка BP прямой KM */
  FIGS.a189 = {
    bbox: [-5.6, 4.8, 5.6, -1.8],
    state: function () { return { A: [-4.4, -0.8], B: [4.2, -0.8], C: [0.2, 4.0], u: 0.4, v: 0.5, w: 0.55 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [8, -14]), C = X.P('C', S.C, [-4, 10]);
      function sg(P, Q) { return b.create('segment', [P, Q], { visible: false }); }
      function on(P, Q, t) { return [P.X() + t * (Q.X() - P.X()), P.Y() + t * (Q.Y() - P.Y())]; }
      var K = X.G('K', on(A, B, S.u), sg(A, B), [-4, -18]), M = X.G('M', on(B, C, S.v), sg(B, C), [8, 4]), P = X.G('P', on(C, A, S.w), sg(C, A), [-22, 6]);
      function fr(U, V, W) { return G.dist(U, W) / G.dist(U, V); }
      G.guard(b, [A, B, C, K, M, P], function () {
        var u = fr(A, B, K), v = fr(B, C, M), w = fr(C, A, P); return tri(A, B, C) > 5 && G.ang(A, B, C) > 0.4 && G.ang(B, C, A) > 0.4 && G.ang(C, A, B) > 0.4 && u > 0.12 && u < 0.88 && v > 0.12 && v < 0.88 && w > 0.12 && w < 0.88;
      });
      var O = wp(X, 'O', function () { return G.inter(xy(B), dir(B, P), xy(K), dir(K, M)); }, [4, 8]);
      X.seg(A, B, 'AB', 'sides', 2, {}, 4.5); X.seg(B, C, 'BC', 'sides', 2, {}, 4.5); X.seg(C, A, 'CA', 'sides', 2, {}, 4.5);
      X.seg(K, M, 'KM', 'km', 1.8, {}, 4.5); X.seg(B, P, 'BP', 'bp', 1.8, { dash: 2 }, 4.5); X.seg(K, P, 'KP', 'km', 1.4, {}, 3.5); X.seg(M, P, 'MP', 'km', 1.4, {}, 3.5);
      fill(X, [B, K, M], 'fBKM', 'sBKM'); fill(X, [K, M, P], 'fKMP', 'sKMP');
      [['A', A], ['B', B], ['C', C], ['K', K], ['M', M], ['P', P], ['O', O]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.C = xy(C); S.u = fr(A, B, K); S.v = fr(B, C, M); S.w = fr(C, A, P);
        var k1 = G.dist(A, K), k2 = G.dist(K, B), m1 = G.dist(B, M), m2 = G.dist(M, C), p1 = G.dist(C, P), p2 = G.dist(P, A), s0 = tri(A, B, C);
        var sKMP = tri(K, M, P), sBKM = tri(B, K, M), q = (k1 * m1 * p1 + k2 * m2 * p2) / ((k1 + k2) * (m1 + m2) * (p1 + p2));
        var f = k2 * m1 * (p1 + p2) / (k1 * m1 * p1 + k2 * m2 * p2), real = G.dist(B, O) / G.dist(O, P);
        X.ro([[['S<sub>KMP</sub> / S<sub>ABC</sub>', G.f2(sKMP / s0)], ['(k₁m₁p₁+k₂m₂p₂)/∏', G.f2(q) + ' ' + ok(eq(sKMP / s0, q, 0.004))]],
              [['BO / OP', G.f2(real)], ['S<sub>BKM</sub> / S<sub>KMP</sub>', G.f2(sBKM / sKMP) + ' ' + ok(eq(real, sBKM / sKMP, 0.01))]],
              [['k₂m₁(p₁+p₂)/(k₁m₁p₁+k₂m₂p₂)', G.f2(f) + ' ' + ok(eq(real, f, 0.01))]]]);
      });
    }
  };
})();
