/* Глава 10. Теоремы Чевы и Менелая */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function area(P, Q, R) { return 0.5 * Math.abs((Q.X() - P.X()) * (R.Y() - P.Y()) - (R.X() - P.X()) * (Q.Y() - P.Y())); }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function sv(S, o) { Object.keys(o).forEach(function (k) { S[k] = [o[k].X(), o[k].Y()]; }); }

  /* Рис. 10.1 — теорема Чевы */
  FIGS.v101 = {
    bbox: [-5.6, 5.2, 5.6, -2.8],
    state: function () { return { A: [-0.6, 4.1], B: [-4.4, -1.8], C: [4.5, -1.6], O: [0.2, 0.9] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-4, 10]), B = X.P('B', S.B, [-22, -14]), C = X.P('C', S.C, [8, -14]), O = X.P('O', S.O, [8, 8]);
      G.guard(b, [A, B, C, O], function () {
        var s = area(A, B, C); if (s < 3) return false;
        return area(O, B, C) / s > 0.1 && area(O, C, A) / s > 0.1 && area(O, A, B) / s > 0.1;
      });
      function foot(P, Q, R) { return function () { return G.inter(xy(P), dir(P, O), xy(Q), dir(Q, R)); }; }
      var fA = foot(A, B, C), fB = foot(B, C, A), fC = foot(C, A, B);
      var A1 = wp(X, 'A<sub>1</sub>', fA, [8, -16]), B1 = wp(X, 'B<sub>1</sub>', fB, [8, 4]), C1 = wp(X, 'C<sub>1</sub>', fC, [-26, 4]);
      X.seg(A, B, 'AB', 'tri', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
      X.seg(A, A1, 'AA1', 'cev', 1.5, { dash: 2 }, 4); X.seg(B, B1, 'BB1', 'cev', 1.5, { dash: 2 }, 4); X.seg(C, C1, 'CC1', 'cev', 1.5, { dash: 2 }, 4);
      X.hidden(B, A1, 'BA1', 'r1'); X.hidden(A1, C, 'A1C', 'r1'); X.hidden(C, B1, 'CB1', 'r2'); X.hidden(B1, A, 'B1A', 'r2'); X.hidden(A, C1, 'AC1', 'r3'); X.hidden(C1, B, 'C1B', 'r3');
      X.hidden(O, A, 'OA', 'ar'); X.hidden(O, B, 'OB', 'ar'); X.hidden(O, C, 'OC', 'ar');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1');
      X.anim({ label: 'Обвести точку O вокруг', dur: 10000, t0: null,
        steps: [[0, 'Точка O ходит по кругу внутри треугольника'], [0.1, 'Отношения на сторонах меняются, а произведение всегда 1'], [0.6, 'Три чевианы всегда пересекаются в O']],
        set: function (t) { var gx = (A.X() + B.X() + C.X()) / 3, gy = (A.Y() + B.Y() + C.Y()) / 3, ph = t * 2 * Math.PI; O.setPosition(JXG.COORDS_BY_USER, [gx + 1.0 * Math.cos(ph), gy + 0.75 * Math.sin(ph)]); } });
      X.alias('prod', ['BA1', 'A1C', 'CB1', 'B1A', 'AC1', 'C1B']); X.alias('cevs', ['AA1', 'BB1', 'CC1']);
      b.on('update', function () {
        sv(S, { A: A, B: B, C: C, O: O });
        var r1 = G.dist(B, A1) / G.dist(A1, C), r2 = G.dist(C, B1) / G.dist(B1, A), r3 = G.dist(A, C1) / G.dist(C1, B);
        var sBOA = area(B, O, A), sCOA = area(C, O, A), sCOB = area(C, O, B), sAOB = area(A, O, B), sAOC = area(A, O, C), sBOC = area(B, O, C);
        X.ro([[['BA₁/A₁C', G.f2(r1)], ['CB₁/B₁A', G.f2(r2)], ['AC₁/C₁B', G.f2(r3)]],
              [['произведение', G.f2(r1 * r2 * r3) + ' ' + ok(eq(r1 * r2 * r3, 1, 0.002))]],
              [['BA₁/A₁C', G.f2(r1)], ['S<sub>BOA</sub> / S<sub>COA</sub>', G.f2(sBOA / sCOA) + ' ' + ok(eq(r1, sBOA / sCOA, 0.003))]],
              [['CB₁/B₁A', G.f2(r2)], ['S<sub>COB</sub> / S<sub>AOB</sub>', G.f2(sCOB / sAOB) + ' ' + ok(eq(r2, sCOB / sAOB, 0.003))]],
              [['AC₁/C₁B', G.f2(r3)], ['S<sub>AOC</sub> / S<sub>BOC</sub>', G.f2(sAOC / sBOC) + ' ' + ok(eq(r3, sAOC / sBOC, 0.003))]]]);
      });
    }
  };

  /* Рис. 10.2 — теорема Менелая */
  FIGS.v102 = {
    bbox: [-6.4, 5.0, 6.4, -4.4],
    state: function () { return { A: [-1.8, 3.6], B: [-4.2, -1.2], C: [3.6, -1.6], P: [-5.6, -3.0], Q: [5.8, 2.4] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('A', S.A, [-4, 10]), B = X.P('B', S.B, [-22, -14]), C = X.P('C', S.C, [-4, 10]), P = X.P('', S.P, [0, 0], { size: 3 }), Q = X.P('', S.Q, [0, 0], { size: 3 });
      function hit(U, V) { return function () { return G.inter(xy(P), dir(P, Q), xy(U), dir(U, V)); }; }
      var hA = hit(B, C), hB = hit(C, A), hC = hit(A, B);
      var A1 = wp(X, 'A<sub>1</sub>', hA, [8, 8]), B1 = wp(X, 'B<sub>1</sub>', hB, [8, 8]), C1 = wp(X, 'C<sub>1</sub>', hC, [-26, 8]);
      G.guard(b, [A, B, C, P, Q], function () {
        if (area(A, B, C) < 3 || G.dist(P, Q) < 2) return false;
        var pts = [A1, B1, C1], vs = [[B, C, A1], [C, A, B1], [A, B, C1]];
        return vs.every(function (v) { var p = [v[2].X(), v[2].Y()]; return Math.hypot(p[0], p[1]) < 8 && G.dist(v[2], v[0]) > 0.35 && G.dist(v[2], v[1]) > 0.35; });
      });
      var E1 = X.H(function () { var d = dir(P, Q), l = Math.hypot(d[0], d[1]) || 1; return P.X() - d[0] / l * 0.5; }, function () { var d = dir(P, Q), l = Math.hypot(d[0], d[1]) || 1; return P.Y() - d[1] / l * 0.5; });
      var E2 = X.H(function () { var d = dir(P, Q), l = Math.hypot(d[0], d[1]) || 1; return Q.X() + d[0] / l * 0.5; }, function () { var d = dir(P, Q), l = Math.hypot(d[0], d[1]) || 1; return Q.Y() + d[1] / l * 0.5; });
      var A2 = X.D('A<sub>2</sub>', function () { return G.foot(A, P, Q)[0]; }, function () { return G.foot(A, P, Q)[1]; }, [8, 8]);
      var B2 = X.D('B<sub>2</sub>', function () { return G.foot(B, P, Q)[0]; }, function () { return G.foot(B, P, Q)[1]; }, [8, 8]);
      var C2 = X.D('C<sub>2</sub>', function () { return G.foot(C, P, Q)[0]; }, function () { return G.foot(C, P, Q)[1]; }, [8, 8]);
      function ext(U, V) { return X.H(function () { return V.X() + (V.X() - U.X()) * 0.0; }, function () { return V.Y(); }); }
      X.seg(A, B, 'AB', 'tri', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
      X.seg(E1, E2, 'L', 'L', 2, { dash: 0 }, 4.5);
      X.seg(A, A2, 'AA2', 'perp', 1.2, { dash: 2 }, 3.5); X.seg(B, B2, 'BB2', 'perp', 1.2, { dash: 2 }, 3.5); X.seg(C, C2, 'CC2', 'perp', 1.2, { dash: 2 }, 3.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(A1, 'pA1', 'A1'); X.pt(B1, 'pB1', 'B1'); X.pt(C1, 'pC1', 'C1'); X.pt(A2, 'pA2', 'A2'); X.pt(B2, 'pB2', 'B2'); X.pt(C2, 'pC2', 'C2');
      X.pt(P, 'pP', ''); X.pt(Q, 'pQ', '');
      var p0 = null, q0 = null;
      X.anim({ label: 'Покачать секущую', dur: 9000, t0: null,
        steps: [[0, 'Прямая сдвигается параллельно себе'], [0.1, 'Отношения отрезков меняются, а произведение остаётся 1'], [0.6, 'Теорема Менелая верна для любого положения прямой']],
        set: function (t) {
          if (!p0 || t === 0) { p0 = xy(P); q0 = xy(Q); }
          var d = dir(P, Q), l = Math.hypot(d[0], d[1]) || 1, nx = -d[1] / l, ny = d[0] / l, s = 0.7 * Math.sin(t * 2 * Math.PI);
          P.setPosition(JXG.COORDS_BY_USER, [p0[0] + nx * s, p0[1] + ny * s]); Q.setPosition(JXG.COORDS_BY_USER, [q0[0] + nx * s, q0[1] + ny * s]);
        } });
      X.alias('prod', ['AB', 'BC', 'CA']);
      b.on('update', function () {
        sv(S, { A: A, B: B, C: C, P: P, Q: Q });
        var r1 = G.dist(B, A1) / G.dist(A1, C), r2 = G.dist(C, B1) / G.dist(B1, A), r3 = G.dist(A, C1) / G.dist(C1, B);
        var a2 = G.dist(A, A2), b2 = G.dist(B, B2), c2 = G.dist(C, C2);
        X.ro([[['AC₁/C₁B', G.f2(r3)], ['AA₂/BB₂', G.f2(a2 / b2) + ' ' + ok(eq(r3, a2 / b2, 0.003))]],
              [['BA₁/A₁C', G.f2(r1)], ['BB₂/CC₂', G.f2(b2 / c2) + ' ' + ok(eq(r1, b2 / c2, 0.003))]],
              [['CB₁/B₁A', G.f2(r2)], ['CC₂/AA₂', G.f2(c2 / a2) + ' ' + ok(eq(r2, c2 / a2, 0.003))]],
              [['произведение', G.f2(r1 * r2 * r3) + ' ' + ok(eq(r1 * r2 * r3, 1, 0.002))]]]);
      });
    }
  };
})();
