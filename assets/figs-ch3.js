/* Глава 3. Четыре замечательные точки треугольника */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  var P3 = Math.PI;
  function mid(X, name, P, Q, off) { return X.D(name, function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; }, off); }
  function wt(X, name, P, Q, R, wp, wq, wr, off) {                          /* точка (wp·P + wq·Q + wr·R) / (wp + wq + wr), веса — функции */
    function w() { var a = wp(), b = wq(), c = wr(), t = (a + b + c) || 1e-9; return [(a * P.X() + b * Q.X() + c * R.X()) / t, (a * P.Y() + b * Q.Y() + c * R.Y()) / t]; }
    return X.D(name, function () { return w()[0]; }, function () { return w()[1]; }, off);
  }
  function one() { return 1; }
  function foot(X, name, P, A, B, off) { return X.D(name, function () { return G.foot(P, A, B)[0]; }, function () { return G.foot(P, A, B)[1]; }, off); }
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function side(P, Q) { return G.dist(P, Q); }
  function tri(X, S, o) {
    var A = X.P('A', S.A, o && o[0] || [-22, -14]), B = X.P('B', S.B, o && o[1] || [-4, 10]), C = X.P('C', S.C, o && o[2] || [8, -14]);
    return { A: A, B: B, C: C };
  }
  function sv(S, T) { S.A = [T.A.X(), T.A.Y()]; S.B = [T.B.X(), T.B.Y()]; S.C = [T.C.X(), T.C.Y()]; }
  var TS = function () { return { A: [-4.2, -2.3], B: [0.9, 3.5], C: [4.3, -2.2] }; };
  function sides(X, T, tok) { X.seg(T.A, T.B, 'sAB', tok || 'tri', 2, {}, 4.5); X.seg(T.B, T.C, 'sBC', tok || 'tri', 2, {}, 4.5); X.seg(T.C, T.A, 'sCA', tok || 'tri', 2, {}, 4.5); }

  /* Рис. 3.1 — медианы пересекаются в одной точке и делятся в отношении 2:1 */
  FIGS.c31 = {
    bbox: [-6.2, 5, 6.2, -3.9], state: TS,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      var A1 = mid(X, 'A<sub>1</sub>', B, C, [8, 4]), B1 = mid(X, 'B<sub>1</sub>', C, A, [-26, 4]), C1 = mid(X, 'C<sub>1</sub>', A, B, [-4, -22]);
      var O = wt(X, 'O', A, B, C, one, one, one, [8, -18]);
      sides(X, T);
      X.seg(A, A1, 'mA', 'mA', 1.5, { dash: 2 }, 4); X.seg(B, B1, 'mB', 'mB', 1.5, { dash: 2 }, 4); X.seg(C, C1, 'mC', 'mC', 1.5, { dash: 2 }, 4);
      X.seg(B1, A1, 'B1A1', 'mid', 2.4, {}, 5);
      X.tick(B, A1, 1); X.tick(A1, C, 1); X.tick(C, B1, 2); X.tick(B1, A, 2); X.tick(A, C1, 3); X.tick(C1, B, 3);
      X.ang(A, B, A1, 0.9, '1', 'a1', '12'); X.ang(A1, B1, A, 0.9, '2', 'a2', '12');
      X.ang(B, A, B1, 0.9, '3', 'a3', '34'); X.ang(B1, A1, B, 0.9, '4', 'a4', '34');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      X.alias('meds', ['mA', 'mB', 'mC']); X.alias('sim', ['sAB', 'B1A1', 'mA', 'mB']);
      b.on('update', function () {
        sv(S, T);
        var r1 = G.dist(A, O) / G.dist(O, A1), r2 = G.dist(B, O) / G.dist(O, B1), r3 = G.dist(C, O) / G.dist(O, C1);
        var g1 = G.ang(A, B, A1), g2 = G.ang(A1, B1, A), g3 = G.ang(B, A, B1), g4 = G.ang(B1, A1, B);
        X.ro([[['AO : OA<sub>1</sub>', G.f2(r1)], ['BO : OB<sub>1</sub>', G.f2(r2)], ['CO : OC<sub>1</sub>', G.f2(r3) + ' ' + ok(eq(r1, 2) && eq(r2, 2) && eq(r3, 2))]],
              [['B<sub>1</sub>A<sub>1</sub>', G.f2(G.dist(B1, A1))], ['AB / 2', G.f2(G.dist(A, B) / 2) + ' ' + ok(eq(G.dist(B1, A1), G.dist(A, B) / 2))]],
              [['∠1', G.deg(g1)], ['∠2', G.deg(g2) + ' ' + ok(eq(g1, g2, 2e-4))], ['∠3', G.deg(g3)], ['∠4', G.deg(g4) + ' ' + ok(eq(g3, g4, 2e-4))]]]);
      });
    }
  };

  /* Рис. 3.2 — длина медианы: сумма квадратов диагоналей параллелограмма */
  FIGS.c32 = {
    bbox: [-6.6, 5, 6.6, -4], state: function () { return { A: [-4.6, -2.2], B: [-0.4, 3.0], C: [3.4, -2.3] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      var A1 = mid(X, 'A<sub>1</sub>', B, C, [8, 4]);
      var D = X.D('D', function () { return 2 * A1.X() - A.X(); }, function () { return 2 * A1.Y() - A.Y(); }, [8, 4]);
      X.seg(A, B, 'AB', 'sides', 2, {}, 4.5); X.seg(A, C, 'AC', 'sides', 2, {}, 4.5); X.seg(B, D, 'BD', 'sides', 2, {}, 4.5); X.seg(C, D, 'CD', 'sides', 2, {}, 4.5);
      X.seg(A, D, 'd1', 'd1', 1.6, { dash: 3 }, 4); X.seg(B, C, 'd2', 'd2', 1.6, { dash: 3 }, 4);
      X.hidden(A, A1, 'ma', 'ma');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(D, 'pD', 'D'); X.pt(A1, 'pA1', 'A1');
      X.alias('diag', ['d1', 'd2']);
      b.on('update', function () {
        sv(S, T);
        var a = side(B, C), bb = side(C, A), c = side(A, B), d1 = side(A, D), d2 = a, ma = side(A, A1);
        X.ro([[['d₁² + d₂²', G.f2(d1 * d1 + d2 * d2)], ['2b² + 2c²', G.f2(2 * bb * bb + 2 * c * c) + ' ' + ok(eq(d1 * d1 + d2 * d2, 2 * bb * bb + 2 * c * c, 0.01))]],
              [['m<sub>a</sub>', G.f2(ma)], ['√(2(b² + c²) − a²) / 2', G.f2(Math.sqrt(2 * (bb * bb + c * c) - a * a) / 2) + ' ' + ok(eq(ma, Math.sqrt(2 * (bb * bb + c * c) - a * a) / 2))]],
              [['d₁', G.f2(d1)], ['2m<sub>a</sub>', G.f2(2 * ma) + ' ' + ok(eq(d1, 2 * ma))]]]);
      });
    }
  };

  /* Рис. 3.2а — сторона через три медианы */
  FIGS.c32a = {
    bbox: [-6.6, 5, 6.6, -4], state: function () { return { A: [-4.6, -2.2], B: [-0.4, 3.0], C: [3.4, -2.3] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      var A1 = mid(X, 'A<sub>1</sub>', B, C, [8, 4]), B1 = mid(X, 'B<sub>1</sub>', C, A, [-26, 4]), C1 = mid(X, 'C<sub>1</sub>', A, B, [-4, -22]);
      var O = wt(X, 'O', A, B, C, one, one, one, [-16, 8]);
      var D = X.D('D', function () { return 2 * A1.X() - O.X(); }, function () { return 2 * A1.Y() - O.Y(); }, [8, 4]);
      sides(X, T);
      X.seg(A, D, 'mA', 'mA', 1.4, { dash: 2 }, 4); X.seg(B, B1, 'mB', 'mB', 1.4, { dash: 2 }, 4); X.seg(C, C1, 'mC', 'mC', 1.4, { dash: 2 }, 4);
      X.seg(O, B, 'OB', 'par', 1.8, {}, 4.5); X.seg(O, C, 'OC', 'par', 1.8, {}, 4.5); X.seg(B, D, 'BD', 'par', 1.8, { dash: 3 }, 4.5); X.seg(C, D, 'CD', 'par', 1.8, { dash: 3 }, 4.5);
      X.hidden(O, D, 'OD', 'OD');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O'); X.pt(D, 'pD', 'D'); X.pt(A1, 'pA1', 'A1');
      b.on('update', function () {
        sv(S, T);
        var a = side(B, C), ma = side(A, A1), mb = side(B, B1), mc = side(C, C1), f = 2 / 3 * Math.sqrt(2 * (mb * mb + mc * mc) - ma * ma);
        X.ro([[['a', G.f2(a)], ['⅔·√(2(m<sub>b</sub>² + m<sub>c</sub>²) − m<sub>a</sub>²)', G.f2(f) + ' ' + ok(eq(a, f))]],
              [['OD', G.f2(side(O, D))], ['⅔·m<sub>a</sub>', G.f2(2 / 3 * ma) + ' ' + ok(eq(side(O, D), 2 / 3 * ma))]],
              [['OB', G.f2(side(O, B))], ['CD', G.f2(side(C, D)) + ' ' + ok(eq(side(O, B), side(C, D)))], ['⅔·m<sub>b</sub>', G.f2(2 / 3 * mb) + ' ' + ok(eq(side(O, B), 2 / 3 * mb))]]]);
      });
    }
  };

  /* Рис. 3.3 — биссектриса внутреннего угла */
  FIGS.c33 = {
    bbox: [-6.2, 5, 6.2, -3.9], state: TS,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      function cc() { return side(A, B); } function bb() { return side(A, C); }
      var A1 = wt(X, 'A<sub>1</sub>', B, C, C, bb, cc, function () { return 0; }, [8, -20]);   /* BA1 : A1C = c : b */
      sides(X, T);
      X.seg(A, A1, 'La', 'La', 2, { dash: 2 }, 4.5);
      X.hidden(B, A1, 'ac', 'ac'); X.hidden(A1, C, 'ab', 'ab');
      X.ang(A, B, A1, 1.0, '', 'h1', 'half'); X.ang(A, A1, C, 1.3, '', 'h2', 'half');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1');
      X.alias('prod', ['ac', 'ab']);
      b.on('update', function () {
        sv(S, T);
        var a = side(B, C), bb2 = bb(), c = cc(), p = (a + bb2 + c) / 2, L = side(A, A1), ac = side(B, A1), ab = side(A1, C), ha = Math.acos(Math.max(-1, Math.min(1, (bb2 * bb2 + c * c - a * a) / (2 * bb2 * c)))) / 2;
        var f1 = 2 * bb2 * c * Math.cos(ha) / (bb2 + c), f2 = Math.sqrt(Math.max(0, c * bb2 - ac * ab)), f3 = 2 / (bb2 + c) * Math.sqrt(Math.max(0, bb2 * c * p * (p - a)));
        X.ro([[['L<sub>a</sub>', G.f2(L)], ['2bc·cos(A/2) / (b + c)', G.f2(f1) + ' ' + ok(eq(L, f1))]], [['√(cb − a<sub>c</sub>a<sub>b</sub>)', G.f2(f2) + ' ' + ok(eq(L, f2))], ['2/(b + c)·√(bcp(p − a))', G.f2(f3) + ' ' + ok(eq(L, f3))]],
              [['a<sub>c</sub> : a<sub>b</sub>', G.f2(ac / ab)], ['c : b', G.f2(c / bb2) + ' ' + ok(eq(ac / ab, c / bb2))]]]);
      });
    }
  };

  /* Рис. 3.3а — биссектриса внешнего угла */
  FIGS.c33a = {
    bbox: [-11, 6, 7, -4], state: function () { return { A: [-1, -2], B: [-1.8, 1.1], C: [5.2, -2] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      function cc() { return side(A, B); } function bb() { return side(A, C); }
      var A1 = X.D('A′<sub>1</sub>', function () { var d = bb() - cc(); d = Math.abs(d) < 0.05 ? 0.05 : d; return (bb() * B.X() - cc() * C.X()) / d; },
        function () { var d = bb() - cc(); d = Math.abs(d) < 0.05 ? 0.05 : d; return (bb() * B.Y() - cc() * C.Y()) / d; }, [8, 8]);
      sides(X, T);
      X.seg(A, A1, 'La', 'La', 2, { dash: 2 }, 4.5); X.seg(B, A1, 'ext', 'ext', 1.2, { dash: 3 }, 3.5);
      X.hidden(B, A1, 'acp', 'acp'); X.hidden(C, A1, 'abp', 'abp');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1');
      X.alias('prod', ['acp', 'abp']);
      b.on('update', function () {
        sv(S, T);
        var a = side(B, C), bb2 = bb(), c = cc(), p = (a + bb2 + c) / 2, L = side(A, A1), acp = side(B, A1), abp = side(C, A1), Aa = Math.acos(Math.max(-1, Math.min(1, (bb2 * bb2 + c * c - a * a) / (2 * bb2 * c))));
        var f1 = 2 * bb2 * c * Math.sin(Aa / 2) / Math.abs(bb2 - c), f2 = Math.sqrt(Math.max(0, acp * abp - c * bb2)), f3 = 2 * Math.sqrt(Math.max(0, bb2 * c * (p - c) * (p - bb2))) / Math.abs(c - bb2);
        X.ro([[['L′<sub>a</sub>', G.f2(L)], ['2bc·sin(A/2) / |b − c|', G.f2(f1) + ' ' + ok(eq(L, f1, 0.02))]], [['√(a′<sub>c</sub>a′<sub>b</sub> − cb)', G.f2(f2) + ' ' + ok(eq(L, f2, 0.02))],
              ['2√(bc(p − c)(p − b)) / |c − b|', G.f2(f3) + ' ' + ok(eq(L, f3, 0.02))]]]);
      });
    }
  };

  /* Рис. 3.4 — угол между высотой и биссектрисой */
  FIGS.c34 = {
    bbox: [-6.2, 5, 6.2, -3.9], state: function () { return { A: [-2.6, 3.4], B: [-4.4, -2.3], C: [4.3, -2.3] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      function cc() { return side(A, B); } function bb() { return side(A, C); }
      var L = wt(X, 'L<sub>a</sub>', B, C, C, bb, cc, function () { return 0; }, [8, -20]);
      var Hh = foot(X, 'H', A, B, C, [-24, -16]);
      sides(X, T);
      X.seg(A, L, 'La', 'La', 2, { dash: 2 }, 4.5); X.seg(A, Hh, 'ha', 'ha', 1.8, {}, 4.5);
      X.right(Hh, A, C, 0.28, 'rh', 'ha');
      X.ang(A, Hh, L, 1.3, '<i>γ</i>', 'g', 'g');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(L, 'pL', 'L'); X.pt(Hh, 'pH', 'H');
      b.on('update', function () {
        sv(S, T);
        var h = G.dist(A, Hh), La = G.dist(A, L), g = G.ang(A, Hh, L), Bb = G.ang(B, A, C), Cc = G.ang(C, A, B);
        X.ro([[['cos γ', Math.cos(g).toFixed(4)], ['h<sub>a</sub> / L<sub>a</sub>', (h / La).toFixed(4) + ' ' + ok(eq(Math.cos(g), h / La, 2e-4))]],
              [['γ', G.deg(g)], ['|B − C| / 2', G.deg(Math.abs(Bb - Cc) / 2) + ' ' + ok(eq(g, Math.abs(Bb - Cc) / 2, 2e-4))]],
              [['L<sub>a</sub>', G.f2(La)], ['h<sub>a</sub> / cos((B − C)/2)', G.f2(h / Math.cos((Bb - Cc) / 2)) + ' ' + ok(eq(La, h / Math.cos((Bb - Cc) / 2)))]]]);
      });
    }
  };

  /* общая основа с высотами: H — ортоцентр, A1, B1, C1 — основания высот */
  function altitudes(X, T) {
    var A = T.A, B = T.B, C = T.C;
    var A1 = foot(X, 'A<sub>1</sub>', A, B, C, [8, -20]), B1 = foot(X, 'B<sub>1</sub>', B, C, A, [-26, 4]), C1 = foot(X, 'C<sub>1</sub>', C, A, B, [-6, -22]);
    function hh() { return G.inter([A.X(), A.Y()], [A1.X() - A.X(), A1.Y() - A.Y()], [B.X(), B.Y()], [B1.X() - B.X(), B1.Y() - B.Y()]); }
    var H = X.D('H', function () { return hh()[0]; }, function () { return hh()[1]; }, [8, 6]);
    return { A1: A1, B1: B1, C1: C1, H: H };
  }

  /* Рис. 3.5 — ортоцентр: центр описанной окружности треугольника A₀B₀C₀ */
  FIGS.c35 = {
    bbox: [-9.6, 8, 9.6, -7.2], state: TS,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C, Q = altitudes(X, T), H = Q.H;
      function rf(P, Q1, R, name, off) { return X.D(name, function () { return Q1.X() + R.X() - P.X(); }, function () { return Q1.Y() + R.Y() - P.Y(); }, off); }
      var A0 = rf(A, B, C, 'A<sub>0</sub>', [8, -18]), B0 = rf(B, A, C, 'B<sub>0</sub>', [-26, 6]), C0 = rf(C, A, B, 'C<sub>0</sub>', [8, 10]);
      sides(X, T);
      X.seg(A0, B0, 'ab0', 'big', 1.4, { dash: 3 }, 4); X.seg(B0, C0, 'bc0', 'big', 1.4, { dash: 3 }, 4); X.seg(C0, A0, 'ca0', 'big', 1.4, { dash: 3 }, 4);
      X.seg(A, Q.A1, 'hA', 'hA', 1.6, {}, 4); X.seg(B, Q.B1, 'hB', 'hB', 1.6, {}, 4); X.seg(C, Q.C1, 'hC', 'hC', 1.6, {}, 4);
      X.hidden(H, A0, 'HA0', 'R'); X.hidden(H, B0, 'HB0', 'R'); X.hidden(H, C0, 'HC0', 'R');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(H, 'pH', 'H');
      X.alias('alts', ['hA', 'hB', 'hC']); X.alias('R', ['HA0', 'HB0', 'HC0']);
      b.on('update', function () {
        sv(S, T);
        var r1 = G.dist(H, A0), r2 = G.dist(H, B0), r3 = G.dist(H, C0);
        var d = Math.abs((C0.X() - B0.X()) * (A.Y() - B0.Y()) - (C0.Y() - B0.Y()) * (A.X() - B0.X())) / (G.dist(B0, C0) || 1);
        X.ro([[['HA<sub>0</sub>', G.f2(r1)], ['HB<sub>0</sub>', G.f2(r2)], ['HC<sub>0</sub>', G.f2(r3) + ' ' + ok(eq(r1, r2) && eq(r2, r3))]],
              [['B<sub>0</sub>A', G.f2(G.dist(B0, A))], ['AC<sub>0</sub>', G.f2(G.dist(A, C0)) + ' ' + ok(eq(G.dist(B0, A), G.dist(A, C0)))], ['½·B<sub>0</sub>C<sub>0</sub>', G.f2(G.dist(B0, C0) / 2)]],
              [['угол между AA<sub>1</sub> и B<sub>0</sub>C<sub>0</sub>', (Math.abs(((Math.atan2(Q.A1.Y() - A.Y(), Q.A1.X() - A.X()) - Math.atan2(C0.Y() - B0.Y(), C0.X() - B0.X())) * 180 / P3) % 180) ).toFixed(1) + '°']]]);
      });
    }
  };

  /* Рис. 3.6 — ортоцентр как центр вписанной окружности ортотреугольника; коэффициенты подобия; tg */
  FIGS.c36 = {
    bbox: [-6.2, 5, 6.2, -3.9], state: TS,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C, Q = altitudes(X, T), H = Q.H, A1 = Q.A1, B1 = Q.B1, C1 = Q.C1;
      G.guard(b, [A, B, C], function () { return G.acute(A, B, C); });
      sides(X, T);
      X.seg(A, A1, 'hA', 'alts', 1.4, { dash: 2 }, 4); X.seg(B, B1, 'hB', 'alts', 1.4, { dash: 2 }, 4); X.seg(C, C1, 'hC', 'alts', 1.4, { dash: 2 }, 4);
      X.seg(A1, B1, 'o1', 'orth', 2.2, {}, 4.8); X.seg(B1, C1, 'o2', 'orth', 2.2, {}, 4.8); X.seg(C1, A1, 'o3', 'orth', 2.2, {}, 4.8);
      X.ang(A1, H, B1, 0.8, '1', 'a1', '12'); X.ang(A1, H, C1, 1.1, '2', 'a2', '12'); X.ang(C, B1, C1, 1.0, '3', 'a3', '34'); X.ang(B, C1, B1, 1.0, '4', 'a4', '34');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(H, 'pH', 'H'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      X.hidden(H, B1, 'HB1', 'chords'); X.hidden(H, C1, 'HC1', 'chords'); X.hidden(H, A1, 'HA1', 'chords');
      b.on('update', function () {
        sv(S, T);
        function dl(P, Q1, R) { return Math.abs((Q1.X() - P.X()) * (R.Y() - P.Y()) - (Q1.Y() - P.Y()) * (R.X() - P.X())) / (G.dist(P, Q1) || 1); }
        var d1 = dl(A1, B1, H), d2 = dl(B1, C1, H), d3 = dl(C1, A1, H);
        var Aa = G.ang(A, B, C), Bb = G.ang(B, C, A), Cc = G.ang(C, A, B), a = side(B, C), bb = side(C, A), c = side(A, B);
        var g1 = G.ang(A1, H, B1), g2 = G.ang(A1, H, C1), g3 = G.ang(C, B1, C1), g4 = G.ang(B, C1, B1);
        X.ro([[['расстояния от H до сторон A<sub>1</sub>B<sub>1</sub>, B<sub>1</sub>C<sub>1</sub>, C<sub>1</sub>A<sub>1</sub>', G.f2(d1) + ' · ' + G.f2(d2) + ' · ' + G.f2(d3) + ' ' + ok(eq(d1, d2) && eq(d2, d3))]],
              [['∠3', G.deg(g3)], ['∠4', G.deg(g4) + ' ' + ok(eq(g3, g4, 2e-4))]],
              [['B<sub>1</sub>C<sub>1</sub> / BC', G.f2(G.dist(B1, C1) / a)], ['cos A', G.f2(Math.cos(Aa)) + ' ' + ok(eq(G.dist(B1, C1) / a, Math.cos(Aa)))]],
              [['A<sub>1</sub>C<sub>1</sub> / AC', G.f2(G.dist(A1, C1) / bb)], ['cos B', G.f2(Math.cos(Bb)) + ' ' + ok(eq(G.dist(A1, C1) / bb, Math.cos(Bb)))]],
              [['A<sub>1</sub>B<sub>1</sub> / AB', G.f2(G.dist(A1, B1) / c)], ['cos C', G.f2(Math.cos(Cc)) + ' ' + ok(eq(G.dist(A1, B1) / c, Math.cos(Cc)))]],
              [['AC<sub>1</sub> / HC<sub>1</sub>', G.f2(G.dist(A, C1) / G.dist(H, C1))], ['tg B', G.f2(Math.tan(Bb)) + ' ' + ok(eq(G.dist(A, C1) / G.dist(H, C1), Math.tan(Bb), 0.01))]],
              [['BC<sub>1</sub> / HC<sub>1</sub>', G.f2(G.dist(B, C1) / G.dist(H, C1))], ['tg A', G.f2(Math.tan(Aa)) + ' ' + ok(eq(G.dist(B, C1) / G.dist(H, C1), Math.tan(Aa), 0.01))]],
              [['AH · HA<sub>1</sub>', G.f2(G.dist(A, H) * G.dist(H, A1))], ['BH · HB<sub>1</sub>', G.f2(G.dist(B, H) * G.dist(H, B1))], ['CH · HC<sub>1</sub>', G.f2(G.dist(C, H) * G.dist(H, C1)) + ' ' + ok(eq(G.dist(A, H) * G.dist(H, A1), G.dist(B, H) * G.dist(H, B1), 0.01) && eq(G.dist(B, H) * G.dist(H, B1), G.dist(C, H) * G.dist(H, C1), 0.01))]]]);
      });
    }
  };

  /* Рис. 3.6а — точки пересечения продолжений высот с описанной окружностью симметричны H */
  FIGS.c36a = {
    bbox: [-6.6, 6.2, 6.6, -6.2], state: TS,
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, T = tri(X, S), A = T.A, B = T.B, C = T.C, Q = altitudes(X, T), H = Q.H, A1 = Q.A1, B1 = Q.B1, C1 = Q.C1;
      var O = X.D('O', function () { return G.circum(A, B, C)[0]; }, function () { return G.circum(A, B, C)[1]; }, [-18, 6]);
      var circ = b.create('circle', [O, function () { return G.dist(O, A); }], { strokeColor: C0.fg, strokeWidth: 1.6, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      X.reg('circ', 'circ', circ, { strokeColor: C0.fg, strokeWidth: 1.6 }, { strokeColor: C0.acc, strokeWidth: 4 });
      function refl(P, V1, V2, n) { return X.D(n, function () { var f = G.foot(P, V1, V2); return 2 * f[0] - P.X(); }, function () { var f = G.foot(P, V1, V2); return 2 * f[1] - P.Y(); }, [8, 8]); }
      var AH_ = refl(H, B, C, 'A<sub>H</sub>'), BH_ = refl(H, C, A, 'B<sub>H</sub>'), CH_ = refl(H, A, B, 'C<sub>H</sub>');
      var D = X.D('D', function () { return 2 * O.X() - C.X(); }, function () { return 2 * O.Y() - C.Y(); }, [8, -18]);
      sides(X, T);
      X.seg(C, CH_, 'CCH', 'ext', 1.4, { dash: 2 }, 4); X.seg(A, AH_, 'AAH', 'ext', 1.4, { dash: 2 }, 4); X.seg(B, BH_, 'BBH', 'ext', 1.4, { dash: 2 }, 4);
      X.seg(C, D, 'CD', 'CD', 1.4, {}, 4); X.seg(CH_, D, 'CHD', 'par', 1.2, { dash: 3 }, 3.5); X.seg(A1, B1, 'A1B1', 'perp', 1.4, {}, 4);
      X.right(C1, C, B, 0.24, 'rc', 'ext');
      X.ang(C, A, C1, 1.2, '', 'x1', 'eqang'); X.ang(C, B, O, 1.6, '', 'x2', 'eqang');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(H, 'pH', 'H'); X.pt(O, 'pO', 'O'); X.pt(AH_, 'pAH', 'AH'); X.pt(BH_, 'pBH', 'BH'); X.pt(CH_, 'pCH', 'CH'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      b.on('update', function () {
        sv(S, T);
        var R = G.dist(O, A), x1 = G.ang(C, A, C1), x2 = G.ang(C, B, O), perp = G.ang(C, O, A1) , ang90 = (function () { var u = [O.X() - C.X(), O.Y() - C.Y()], v = [B1.X() - A1.X(), B1.Y() - A1.Y()]; return Math.acos(Math.abs(u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * 180 / P3; })();
        X.ro([[['OA<sub>H</sub>', G.f2(G.dist(O, AH_))], ['OB<sub>H</sub>', G.f2(G.dist(O, BH_))], ['OC<sub>H</sub>', G.f2(G.dist(O, CH_))], ['R', G.f2(R) + ' ' + ok(eq(G.dist(O, AH_), R) && eq(G.dist(O, BH_), R) && eq(G.dist(O, CH_), R))]],
              [['A<sub>1</sub>H', G.f2(G.dist(A1, H))], ['A<sub>1</sub>A<sub>H</sub>', G.f2(G.dist(A1, AH_)) + ' ' + ok(eq(G.dist(A1, H), G.dist(A1, AH_)))], ['C<sub>1</sub>H', G.f2(G.dist(C1, H))], ['C<sub>1</sub>C<sub>H</sub>', G.f2(G.dist(C1, CH_)) + ' ' + ok(eq(G.dist(C1, H), G.dist(C1, CH_)))]],
              [['∠ACC<sub>1</sub>', G.deg(x1)], ['∠BCO', G.deg(x2) + ' ' + ok(eq(x1, x2, 2e-4))]], [['угол между CO и B<sub>1</sub>A<sub>1</sub>', ang90.toFixed(1) + '° ' + ok(Math.abs(ang90 - 90) < 0.05)]]]);
      });
    }
  };

  /* Рис. 3.7 — высота через стороны */
  FIGS.c37 = {
    bbox: [-6.2, 5, 6.2, -3.9], state: function () { return { A: [-2.2, 3.4], B: [-4.4, -2.3], C: [4.3, -2.3] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      var Hh = foot(X, 'H', A, B, C, [-6, -22]);
      var O = X.D('O', function () { return G.circum(A, B, C)[0]; }, function () { return G.circum(A, B, C)[1]; }, [8, 8]);
      G.guard(b, [A, B, C], function () { return G.acute(A, B, C); });
      sides(X, T);
      X.seg(A, Hh, 'ha', 'ha', 2, {}, 4.5); X.hidden(B, Hh, 'ac', 'ac'); X.right(Hh, A, C, 0.28, 'rh', 'ha');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(Hh, 'pH', 'H');
      b.on('update', function () {
        sv(S, T);
        var a = side(B, C), bb = side(C, A), c = side(A, B), p = (a + bb + c) / 2, h = G.dist(A, Hh), R = G.dist(O, A);
        var Bb = G.ang(B, C, A), Cc = G.ang(C, A, B), ac = G.dist(B, Hh) * (Hh.X() >= Math.min(B.X(), C.X()) ? 1 : -1);
        var fa = (c * c + a * a - bb * bb) / (2 * a), fh = 2 * Math.sqrt(Math.max(0, p * (p - a) * (p - bb) * (p - c))) / a;
        X.ro([[['a<sub>c</sub> = BH', G.f2(ac)], ['(c² + a² − b²) / (2a)', G.f2(fa) + ' ' + ok(eq(ac, fa))]],
              [['h<sub>a</sub>', G.f2(h)], ['2√(p(p−a)(p−b)(p−c)) / a', G.f2(fh) + ' ' + ok(eq(h, fh))]], [['2R·sin B·sin C', G.f2(2 * R * Math.sin(Bb) * Math.sin(Cc))], ['bc / 2R', G.f2(bb * c / (2 * R)) + ' ' + ok(eq(h, 2 * R * Math.sin(Bb) * Math.sin(Cc)) && eq(h, bb * c / (2 * R)))]]]);
      });
    }
  };

  /* Рис. 3.8 — прямая Эйлера */
  FIGS.c38 = {
    bbox: [-6.2, 5, 6.2, -3.9], state: TS,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C, Q = altitudes(X, T), H = Q.H;
      var O = X.D('O', function () { return G.circum(A, B, C)[0]; }, function () { return G.circum(A, B, C)[1]; }, [8, 8]);
      var D = mid(X, 'D', B, C, [8, -16]);
      var M = wt(X, 'M', A, B, C, one, one, one, [8, 8]);
      sides(X, T);
      X.seg(A, D, 'AD', 'AD', 1.4, { dash: 2 }, 4); X.seg(A, H, 'AH', 'AH', 1.8, {}, 4.5); X.seg(D, O, 'DO', 'DO', 1.8, {}, 4.5);
      var E1 = X.H(function () { return H.X() + (H.X() - O.X()) * 0.5; }, function () { return H.Y() + (H.Y() - O.Y()) * 0.5; }), E2 = X.H(function () { return O.X() - (H.X() - O.X()) * 0.5; }, function () { return O.Y() - (H.Y() - O.Y()) * 0.5; });
      X.seg(E2, E1, 'euler', 'euler', 1.8, {}, 4.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(H, 'pH', 'H'); X.pt(O, 'pO', 'O'); X.pt(M, 'pM', 'M'); X.pt(D, 'pD', 'D');
      b.on('update', function () {
        sv(S, T);
        var dev = Math.abs((H.X() - O.X()) * (M.Y() - O.Y()) - (H.Y() - O.Y()) * (M.X() - O.X())) / (G.dist(O, H) || 1);
        X.ro([[['AH', G.f2(G.dist(A, H))], ['2·OD', G.f2(2 * G.dist(O, D)) + ' ' + ok(eq(G.dist(A, H), 2 * G.dist(O, D)))]],
              [['OM : MH', G.f2(G.dist(O, M) / (G.dist(M, H) || 1))], ['1 : 2', '= ' + G.f2(0.5) + ' ' + ok(eq(G.dist(O, M) / (G.dist(M, H) || 1), 0.5, 0.01))]],
              [['расстояние от M до прямой OH', G.f2(dev) + ' ' + ok(dev < 0.005)]]]);
      });
    }
  };

  /* Рис. 3.9 — все четыре замечательные точки и прямая Эйлера */
  FIGS.c39 = {
    bbox: [-7.2, 6.2, 7.2, -4.6],
    state: function () { return { A: [-3.2, -2.0], B: [3.2, -2.0], C: [0.8, 4.0] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S), A = T.A, B = T.B, C = T.C;
      G.guard(b, [A, B, C], function () { var m = [G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)]; return m.every(function (x) { return isFinite(x) && x > 0.12 && x < 3.0; }) && G.dist(A, B) > 2 && Math.abs(C.X()) < 6.4 && C.Y() < 5.6 && C.Y() > -3.8; });
      function cc() { return G.circum(A, B, C); }
      var O = X.D('O', function () { return cc()[0]; }, function () { return cc()[1]; }, [-18, 8]);
      var Gm = X.D('G', function () { return (A.X() + B.X() + C.X()) / 3; }, function () { return (A.Y() + B.Y() + C.Y()) / 3; }, [6, -16]);
      var H = X.D('H', function () { return A.X() + B.X() + C.X() - 2 * O.X(); }, function () { return A.Y() + B.Y() + C.Y() - 2 * O.Y(); }, [8, 8]);
      function ic() { var a = G.dist(B, C), bb = G.dist(C, A), c = G.dist(A, B), t = a + bb + c; return [(a * A.X() + bb * B.X() + c * C.X()) / t, (a * A.Y() + bb * B.Y() + c * C.Y()) / t]; }
      var I = X.D('I', function () { return ic()[0]; }, function () { return ic()[1]; }, [-18, -14]);
      b.create('circle', [O, A], { fixed: true, strokeColor: X.C.fg, strokeWidth: 1, strokeOpacity: 0.35, highlight: false, fillColor: 'none' });
      sides(X, T);
      X.seg(O, H, 'euler', 'euler', 1.6, { dash: 3 }, 4);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O'); X.pt(Gm, 'pG', 'G'); X.pt(H, 'pH', 'H'); X.pt(I, 'pI', 'I');
      function where(P) {
        var d1 = (B.X() - A.X()) * (P.Y() - A.Y()) - (B.Y() - A.Y()) * (P.X() - A.X()), d2 = (C.X() - B.X()) * (P.Y() - B.Y()) - (C.Y() - B.Y()) * (P.X() - B.X()), d3 = (A.X() - C.X()) * (P.Y() - C.Y()) - (A.Y() - C.Y()) * (P.X() - C.X());
        var e = 0.02 * (G.dist(A, B) + G.dist(B, C) + G.dist(C, A)), m = Math.min(d1, d2, d3), M = Math.max(d1, d2, d3);
        if (m > e * 0.2 && M > 0 || (m > 0 && M > 0 && m > e * 0.2)) return 'внутри';
        if (M < -e * 0.2 || (m < -e * 0.2 && M < e * 0.2)) return m < -e * 0.2 && M > e * 0.2 ? 'вне' : 'внутри';
        return Math.abs(m) <= e * 0.2 || Math.abs(M) <= e * 0.2 ? 'на стороне' : 'вне';
      }
      b.on('update', function () {
        sv(S, T);
        var m = Math.max(G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)), kind = Math.abs(m - P3 / 2) < 0.012 ? 'прямоугольный' : (m > P3 / 2 ? 'тупоугольный' : 'остроугольный');
        var hg = G.dist(H, Gm), go = G.dist(Gm, O), col = Math.abs((H.X() - O.X()) * (Gm.Y() - O.Y()) - (H.Y() - O.Y()) * (Gm.X() - O.X())) < 0.02;
        X.ro([[['треугольник', kind]],
              [['O (центр описанной)', where(O)], ['H (ортоцентр)', where(H)]],
              [['G (медианы)', where(Gm)], ['I (биссектрисы)', where(I)]],
              [['HG', G.f2(hg)], ['2·GO', G.f2(2 * go) + ' ' + ok(eq(hg, 2 * go, 0.02) && col)]]]);
      });
      var cx = null;
      X.anim({ label: 'Сделать угол C тупым', dur: 9000, t0: null,
        steps: [[0, 'Остроугольный: O, H, G, I внутри треугольника'], [0.55, 'Прямой угол C: O на середине AB, H в вершине C'], [0.63, 'Тупой угол C: O и H вышли наружу, G и I остались внутри'], [0.9, 'O, G, H всё время на одной прямой (Эйлера), HG = 2·GO']],
        set: function (t) {
          if (cx === null || t === 0) cx = C.X();
          var y0 = 4.0, y1 = -1.5;
          C.setPosition(JXG.COORDS_BY_USER, [cx, y0 + (y1 - y0) * t]);
        } });
    }
  };
})();
