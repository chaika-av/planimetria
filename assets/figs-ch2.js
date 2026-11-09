/* Глава 2. Свойства средней линии треугольника и трапеции */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function lineAng(P, Q, R, S) {                                  /* острый угол между прямыми PQ и RS, градусы */
    var a = Math.atan2(Q.Y() - P.Y(), Q.X() - P.X()), b = Math.atan2(S.Y() - R.Y(), S.X() - R.X()), d = Math.abs(a - b) % Math.PI;
    return Math.min(d, Math.PI - d) * 180 / Math.PI;
  }
  function parTxt(P, Q, R, S) { var d = lineAng(P, Q, R, S); return d.toFixed(1) + '° ' + (d < 0.05 ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'); }
  function mid(X, name, P, Q, off) { return X.D(name, function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; }, off); }

  /* Рис. 2.1 — средняя линия треугольника */
  FIGS.t21 = {
    bbox: [-6, 4.6, 6, -3.8],
    state: function () { return { A: [-4, -2.2], B: [0.9, 3.4], C: [4.4, -2.2] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [-4, 10]), C = X.P('C', S.C, [8, -14]);
      var E = mid(X, 'E', A, B, [-22, 4]), F = mid(X, 'F', B, C, [8, 4]), D = mid(X, 'D', A, C, [-4, -22]);
      X.seg(A, B, 'AB', 'AB', 2, {}, 4.5); X.seg(B, C, 'BC', 'BC', 2, {}, 4.5); X.seg(A, C, 'AC', 'AC', 2, {}, 4.5);
      X.seg(E, F, 'EF', 'EF', 2.6, {}, 5); X.seg(F, D, 'FD', 'FD', 1.5, { dash: 2 }, 4);
      X.hidden(A, E, 'AE', 'par'); X.hidden(D, A, 'DA', 'par');
      X.tick(A, E, 1); X.tick(E, B, 1); X.tick(B, F, 2); X.tick(F, C, 2); X.tick(A, D, 3); X.tick(D, C, 3);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(E, 'pE', 'E'); X.pt(F, 'pF', 'F'); X.pt(D, 'pD', 'D');
      X.alias('para', ['AE', 'EF', 'FD', 'DA']); X.alias('AD=DC', ['DA']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.C = [C.X(), C.Y()];
        var ef = G.dist(E, F), ac = G.dist(A, C), ad = G.dist(A, D), dc = G.dist(D, C);
        X.ro([[['EF ∥ AC: угол между прямыми', parTxt(E, F, A, C)]], [['FD ∥ AB: угол между прямыми', parTxt(F, D, A, B)]],
              [['EF', G.f2(ef)], ['AC / 2', G.f2(ac / 2) + ' ' + G.ok(ef, ac / 2)]], [['AD', G.f2(ad)], ['DC', G.f2(dc) + ' ' + G.ok(ad, dc)]]]);
      });
    }
  };

  /* общая основа для трапеций: основания AB (нижнее) и DC (верхнее), C скользит по прямой, параллельной AB */
  function trap(X, S) {
    var b = X.b;
    var A = X.P('A', S.A, [-22, -16]), B = X.P('B', S.B, [8, -16]), D = X.P('D', S.D, [-22, 8]);
    var Dp = X.H(function () { return D.X() + B.X() - A.X(); }, function () { return D.Y() + B.Y() - A.Y(); });
    var lDC = b.create('line', [D, Dp], { visible: false });
    var C = X.G('C', S.C, lDC, [8, 8]);
    var lAB = b.create('line', [A, B], { visible: false });
    X.seg(A, B, 'AB', 'AB', 2, {}, 4.5); X.seg(D, C, 'DC', 'DC', 2, {}, 4.5);
    X.seg(A, D, 'AD', 'legs', 2, {}, 4.5); X.seg(B, C, 'BC', 'legs', 2, {}, 4.5);
    G.guard(b, [A, B, D, C], function () {                        /* выпуклая трапеция: DC сонаправлен с AB, не слишком короткий */
      var ux = B.X() - A.X(), uy = B.Y() - A.Y(), l = Math.hypot(ux, uy), t = ((C.X() - D.X()) * ux + (C.Y() - D.Y()) * uy) / (l || 1e-9);
      var h = Math.abs((D.X() - A.X()) * uy - (D.Y() - A.Y()) * ux) / (l || 1e-9);
      return l > 1.2 && t > 0.5 && h > 0.8;
    });
    return { A: A, B: B, C: C, D: D, lAB: lAB, lDC: lDC };
  }
  function save(S, T) { S.A = [T.A.X(), T.A.Y()]; S.B = [T.B.X(), T.B.Y()]; S.D = [T.D.X(), T.D.Y()]; S.C = [T.C.X(), T.C.Y()]; }
  var TS = function () { return { A: [-4.2, -2.3], B: [4.4, -2.3], D: [-2.4, 2.1], C: [1.3, 2.1] }; };

  /* Рис. 2.2 — средняя линия трапеции */
  FIGS.t22 = {
    bbox: [-9.2, 4.6, 7, -3.8],
    state: function () { var s = TS(); s.D1 = [-1.3, 2.1]; s.A1 = [1.3, -2.3]; s.D2 = [0.3, 2.1]; return s; },
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S), A = T.A, B = T.B, C = T.C, D = T.D;
      var F = mid(X, 'F', A, D, [-22, 4]), E = mid(X, 'E', B, C, [8, 4]);
      var K = X.D('K', function () { return 2 * F.X() - C.X(); }, function () { return 2 * F.Y() - C.Y(); }, [-20, -16]);
      X.seg(F, E, 'EF', 'EF', 2.6, {}, 5);
      X.seg(C, K, 'CK', 'CK', 1.4, { dash: 3 }, 4); X.seg(A, K, 'AK', 'AK', 1.4, { dash: 3 }, 4);
      X.hidden(F, D, 'FD', 'tri1'); X.hidden(D, C, 'DCt', 'tri1'); X.hidden(F, A, 'FA', 'tri2'); X.hidden(A, K, 'AKt', 'tri2');
      X.tick(A, F, 1); X.tick(F, D, 1); X.tick(B, E, 2); X.tick(E, C, 2); X.tick(C, F, 3); X.tick(F, K, 3);
      X.ang(F, A, K, 0.9, '1', 'a1', '1=2'); X.ang(F, D, C, 0.9, '2', 'a2', '1=2');
      X.ang(K, A, F, 1.4, '3', 'a3', '3=4'); X.ang(C, D, F, 1.0, '4', 'a4', '3=4');
      /* произвольный отрезок между основаниями и отрезок, параллельный CB */
      var D1 = X.G('D<sub>1</sub>', S.D1, T.lDC, [-24, 6]), A1 = X.G('A<sub>1</sub>', S.A1, T.lAB, [4, -18]);
      var F1 = X.D('F<sub>1</sub>', function () { return G.inter([D1.X(), D1.Y()], [A1.X() - D1.X(), A1.Y() - D1.Y()], [F.X(), F.Y()], [E.X() - F.X(), E.Y() - F.Y()])[0]; },
        function () { return G.inter([D1.X(), D1.Y()], [A1.X() - D1.X(), A1.Y() - D1.Y()], [F.X(), F.Y()], [E.X() - F.X(), E.Y() - F.Y()])[1]; }, [8, 4]);
      X.seg(D1, A1, 'D1A1', 'D1A1', 1.4, { dash: 2 }, 4);
      var D2 = X.G('D<sub>2</sub>', S.D2, T.lDC, [-24, 6]);
      var A2 = X.D('A<sub>2</sub>', function () { return D2.X() + B.X() - C.X(); }, function () { return D2.Y() + B.Y() - C.Y(); }, [4, -18]);
      var F2 = mid(X, 'F<sub>2</sub>', D2, A2, [8, 4]);
      X.seg(D2, A2, 'D2A2', 'D2A2', 1.4, { dash: 2 }, 4);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(D, 'pD', 'D'); X.pt(E, 'pE', 'E'); X.pt(F, 'pF', 'F'); X.pt(K, 'pK', 'K');
      X.pt(D1, 'pD1', 'D1'); X.pt(A1, 'pA1', 'A1'); X.pt(F1, 'pF1', 'F1'); X.pt(D2, 'pD2', 'D2'); X.pt(A2, 'pA2', 'A2'); X.pt(F2, 'pF2', 'F2');
      X.alias('KF=FC', ['CK']); X.alias('EFpar', ['EF', 'AB', 'DC']);
      b.on('update', function () {
        save(S, T); S.D1 = [D1.X(), D1.Y()]; S.A1 = [A1.X(), A1.Y()]; S.D2 = [D2.X(), D2.Y()];
        var ef = G.dist(E, F), ab = G.dist(A, B), dc = G.dist(D, C), pk = G.foot(K, A, B), dk = Math.hypot(K.X() - pk[0], K.Y() - pk[1]);
        var kf = G.dist(K, F), fc = G.dist(F, C), a1 = G.dist(D1, F1), a2 = G.dist(F1, A1), b1 = G.dist(D2, F2), b2 = G.dist(F2, F.X ? E : E);
        var f2on = Math.hypot(F2.X() - G.foot(F2, F, E)[0], F2.Y() - G.foot(F2, F, E)[1]);
        var e = 2e-4, okc = function (c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; };
        var g1 = G.ang(F, A, K), g2 = G.ang(F, D, C), g3 = G.ang(K, A, F), g4 = G.ang(C, D, F);
        X.ro([[['∠1', G.deg(g1)], ['∠2', G.deg(g2) + ' ' + okc(Math.abs(g1 - g2) < e)]], [['∠3', G.deg(g3)], ['∠4', G.deg(g4) + ' ' + okc(Math.abs(g3 - g4) < e)]],
              [['EF ∥ AB: угол', parTxt(F, E, A, B)], ['EF ∥ DC: угол', parTxt(F, E, D, C)]],
              [['EF', G.f2(ef)], ['(AB + DC) / 2', G.f2((ab + dc) / 2) + ' ' + G.ok(ef, (ab + dc) / 2)]],
              [['KF', G.f2(kf)], ['FC', G.f2(fc) + ' ' + G.ok(kf, fc)]], [['расстояние от K до прямой AB', G.f2(dk) + ' ' + (dk < 0.005 ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>')]],
              [['D<sub>1</sub>F<sub>1</sub>', G.f2(a1)], ['F<sub>1</sub>A<sub>1</sub>', G.f2(a2) + ' ' + G.ok(a1, a2)]],
              [['F<sub>2</sub> лежит на EF: отклонение', G.f2(f2on) + ' ' + (f2on < 0.005 ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>')]]]);
      });
    }
  };

  /* Рис. 2.3 — отрезок средней линии между диагоналями: MN = (a − b)/2 */
  FIGS.t23 = {
    bbox: [-6.6, 4.6, 6.6, -3.8],
    state: function () { return TS(); },
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S), A = T.A, B = T.B, C = T.C, D = T.D;
      G.guard(b, [A, B, D, C], function () { return G.dist(A, B) > G.dist(D, C) + 0.6; });
      var F = mid(X, 'F', A, D, [-22, 4]), E = mid(X, 'E', B, C, [8, 4]);
      function I(P, Q, R, S2) { return G.inter([P.X(), P.Y()], [Q.X() - P.X(), Q.Y() - P.Y()], [R.X(), R.Y()], [S2.X() - R.X(), S2.Y() - R.Y()]); }
      var M = X.D('M', function () { return I(A, C, E, F)[0]; }, function () { return I(A, C, E, F)[1]; }, [-4, 10]);
      var N = X.D('N', function () { return I(B, D, E, F)[0]; }, function () { return I(B, D, E, F)[1]; }, [4, 10]);
      X.seg(E, F, 'EF', 'EF', 1.6, {}, 4);
      X.seg(A, C, 'AC', 'diag', 1.4, { dash: 2 }, 3.5); X.seg(B, D, 'BD', 'diag', 1.4, { dash: 2 }, 3.5);
      X.hidden(F, M, 'EM', 'EM'); X.hidden(N, E, 'NF', 'EM'); X.hidden(M, N, 'MN', 'MN');
      X.tick(A, F, 1); X.tick(F, D, 1);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(D, 'pD', 'D'); X.pt(E, 'pE', 'E'); X.pt(F, 'pF', 'F'); X.pt(M, 'pM', 'M'); X.pt(N, 'pN', 'N');
      X.alias('EM=NF', ['EM', 'NF']);
      b.on('update', function () {
        save(S, T);
        var a = G.dist(A, B), bb = G.dist(D, C), em = G.dist(F, M), nf = G.dist(N, E), mn = G.dist(M, N), ef = G.dist(E, F);
        X.ro([[['EM', G.f2(em)], ['b / 2', G.f2(bb / 2) + ' ' + G.ok(em, bb / 2)]], [['NF', G.f2(nf)], ['b / 2', G.f2(bb / 2) + ' ' + G.ok(nf, bb / 2)]],
              [['MN', G.f2(mn)], ['|a − b| / 2', G.f2(Math.abs(a - bb) / 2) + ' ' + G.ok(mn, Math.abs(a - bb) / 2)]], [['EF', G.f2(ef)], ['EM + MN + NF', G.f2(em + mn + nf) + ' ' + G.ok(ef, em + mn + nf)]]]);
      });
    }
  };
})();
