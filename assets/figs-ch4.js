/* Глава 4. Свойство медианы в прямоугольном треугольнике */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function mid(X, name, P, Q, off) { return X.D(name, function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; }, off); }

  /* Рис. 4.1 — медиана к гипотенузе равна половине гипотенузы (радиусу описанной окружности) */
  FIGS.c41 = {
    bbox: [-4.6, 4.2, 4.6, -2.6],
    state: function () { return { A: [-3.2, -1.2], B: [3.2, -1.2], C: [-1.1, 2.9] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [6, -14]);
      var O = mid(X, 'O', A, B, [-4, -22]);
      var circ = b.create('circle', [O, function () { return G.dist(O, A); }], { strokeColor: C0.mu, strokeWidth: 1.4, dash: 3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
      X.reg('circ', 'circ', circ, { strokeColor: C0.mu, strokeWidth: 1.4 }, { strokeColor: C0.acc, strokeWidth: 4 });
      var C = X.G('C', S.C, circ, [-4, 10]);
      X.seg(A, B, 'AB', 'AB', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
      X.seg(C, O, 'mc', 'mc', 1.8, { dash: 2 }, 4.5);
      X.hidden(O, A, 'OA', 'R'); X.hidden(O, B, 'OB', 'R');
      X.tick(A, O, 1); X.tick(O, B, 1); X.tick(O, C, 1);
      X.right(C, A, B, 0.3, 'rC', 'rC');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O');
      X.alias('R', ['circ', 'OA', 'OB', 'mc']); X.alias('c', ['AB']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.C = [C.X(), C.Y()];
        var c = G.dist(A, B), mc = G.dist(C, O), R = G.dist(O, A);
        X.ro([[['m_c = CO', G.f2(mc)], ['c / 2', G.f2(c / 2) + ' ' + ok(eq(mc, c / 2))]],
              [['R', G.f2(R)], ['m_c = R', ok(eq(mc, R))]],
              [['∠C', G.deg(G.ang(C, A, B))]]]);
      });
    }
  };

  /* Рис. 4.2 — медианы AA₁ и BB₁ перпендикулярны: a² + b² = 5c² */
  FIGS.c42 = {
    bbox: [-6.4, 5.0, 6.4, -8.0],
    state: function () { return { A: [-2.2, -1.5], B: [2.2, -1.5], Q: [1.1, 0.4] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('A', S.A, [-22, -4]), B = X.P('B', S.B, [8, -4]);
      var O = mid(X, 'C<sub>1</sub>', A, B, [-4, 8]);
      var circ = b.create('circle', [O, function () { return G.dist(O, A); }], { strokeColor: C0.mu, strokeWidth: 1.2, dash: 3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
      X.reg('circ', 'circ', circ, { strokeColor: C0.mu, strokeWidth: 1.2 }, { strokeColor: C0.acc, strokeWidth: 4 });
      var Q = X.G('Q', S.Q, circ, [8, 8]);
      var C = X.D('C', function () { return 3 * Q.X() - A.X() - B.X(); }, function () { return 3 * Q.Y() - A.Y() - B.Y(); }, [8, 8]);
      var A1 = mid(X, 'A<sub>1</sub>', B, C, [8, 4]), B1 = mid(X, 'B<sub>1</sub>', A, C, [-26, 4]);
      var C2 = X.D('C<sub>2</sub>', function () { return 2 * O.X() - C.X(); }, function () { return 2 * O.Y() - C.Y(); }, [8, -16]);
      X.seg(A, B, 'AB', 'AB', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
      X.seg(A, A1, 'mA', 'meds', 1.5, { dash: 2 }, 4); X.seg(B, B1, 'mB', 'meds', 1.5, { dash: 2 }, 4);
      X.seg(C, C2, 'CC2', 'CC2', 1.8, {}, 4.5);
      X.seg(A, C2, 'AC2', 'par', 1.2, { dash: 3 }, 3); X.seg(B, C2, 'BC2', 'par', 1.2, { dash: 3 }, 3);
      X.hidden(Q, O, 'QC1', 'QC1');
      X.right(Q, A, B, 0.28, 'rQ', 'rQ');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(Q, 'pQ', 'Q'); X.pt(O, 'pC1', 'C1'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C2, 'pC2', 'C2');
      X.alias('QC1', ['QC1', 'circ']); X.alias('mc', ['CC2']); X.alias('par', ['AC2', 'BC2', 'BC', 'CA']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.Q = [Q.X(), Q.Y()];
        var a = G.dist(B, C), bb = G.dist(A, C), c = G.dist(A, B), mc = G.dist(C, O);
        var angr = G.ang(Q, A, B), ang = angr * 180 / Math.PI;
        X.ro([[['∠AQB', G.deg(angr) + ' ' + ok(eq(ang, 90, 0.2))]],
              [['QC₁ = AB / 2', G.f2(G.dist(Q, O)) + ' = ' + G.f2(c / 2) + ' ' + ok(eq(G.dist(Q, O), c / 2))]],
              [['m_c', G.f2(mc)], ['3c / 2', G.f2(1.5 * c) + ' ' + ok(eq(mc, 1.5 * c))]],
              [['a² + b²', G.f2(a * a + bb * bb)], ['5c²', G.f2(5 * c * c) + ' ' + ok(eq(a * a + bb * bb, 5 * c * c, 0.03))]]]);
      });
    }
  };
})();
