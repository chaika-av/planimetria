/* Глава 15. Теоремы об окружностях и четырёхугольниках */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  var TAU = 2 * Math.PI, R0 = 2.4;
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function th(P) { return Math.atan2(P.Y(), P.X()); }
  function ccw(a, b) { return ((b - a) % TAU + TAU) % TAU; }
  function dg(x) { return G.deg(x); }
  function area(P, Q, R) { return 0.5 * Math.abs((Q.X() - P.X()) * (R.Y() - P.Y()) - (R.X() - P.X()) * (Q.Y() - P.Y())); }
  function circ(X, O, r, prim, tok, w) {
    var o = X.b.create('circle', [O, r], { fixed: true, strokeColor: X.C.fg, strokeWidth: w || 1.8, highlight: false, fillColor: 'none' });
    X.reg(prim, tok, o, { strokeColor: X.C.fg, strokeWidth: w || 1.8 }, { strokeColor: X.C.acc, strokeWidth: 4 }); return o;
  }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  function mkCircle(X) { var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, 4]); return { O: O, tg: X.b.create('circle', [O, R0], { visible: false }) }; }
  function onC(X, c, name, a, off) { return X.G(name, [R0 * Math.cos(a), R0 * Math.sin(a)], c.tg, off); }
  function sd(S, o) { Object.keys(o).forEach(function (k) { S[k] = th(o[k]); }); }
  /* вписанный выпуклый четырёхугольник ABCD (порядок против часовой стрелки) */
  function cyc(X, S, extra) {
    var c = mkCircle(X), A = onC(X, c, 'A', S.A, [-22, -14]), B = onC(X, c, 'B', S.B, [-22, 6]), C = onC(X, c, 'C', S.C, [8, 6]), D = onC(X, c, 'D', S.D, [8, -16]);
    function ordered() {
      var g1 = ccw(th(A), th(B)), g2 = ccw(th(B), th(C)), g3 = ccw(th(C), th(D)), g4 = TAU - g1 - g2 - g3;
      return g1 > 0.5 && g2 > 0.5 && g3 > 0.5 && g4 > 0.5 && g1 + g2 + g3 < TAU;
    }
    G.guard(X.b, [A, B, C, D], function () { return ordered() && (extra ? extra(A, B, C, D) : true); });
    circ(X, c.O, R0, 'cir', 'cir', 2);
    X.seg(A, B, 'AB', 'sAB', 2, {}, 4.5); X.seg(B, C, 'BC', 'sBC', 2, {}, 4.5); X.seg(C, D, 'CD', 'sCD', 2, {}, 4.5); X.seg(D, A, 'DA', 'sDA', 2, {}, 4.5);
    return { O: c.O, A: A, B: B, C: C, D: D };
  }
  function cstate() { return { A: 3.45, B: 4.75, C: 0.35, D: 1.75 }; }
  function cs(S, Q) { sd(S, { A: Q.A, B: Q.B, C: Q.C, D: Q.D }); }
  function sides(Q) { return [G.dist(Q.A, Q.B), G.dist(Q.B, Q.C), G.dist(Q.C, Q.D), G.dist(Q.D, Q.A)]; }
  function ang4(Q) { return [G.ang(Q.A, Q.D, Q.B), G.ang(Q.B, Q.A, Q.C), G.ang(Q.C, Q.B, Q.D), G.ang(Q.D, Q.C, Q.A)]; }

  /* Рис. 15.1 — свойства вписанного четырёхугольника */
  FIGS.x151 = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: cstate,
    build: function (X) {
      var b = X.b, S = X.S, Q = cyc(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      var O = wp(X, 'O', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [8, -16]);
      X.seg(A, C, 'AC', 'diag', 1.5, {}, 4); X.seg(B, D, 'BD', 'diag', 1.5, {}, 4);
      X.ang(A, B, D, 0.45, '', 'a1', 'a1'); X.ang(C, B, D, 0.45, '', 'a2', 'a1');
      X.anim({ label: 'Двигать вершину D', dur: 7000, t0: null,
        steps: [[0, 'D бежит по окружности'], [0.1, '∠A + ∠C = 180° и ∠B + ∠D = 180° всё время'], [0.9, 'Равные вписанные углы опираются на одну дугу']],
        set: function (t) { var c0 = th(C) + 0.55, len = ccw(th(C), th(A)) - 1.1; if (len < 0.2) return; var ang = c0 + len * t; D.setPosition(JXG.COORDS_BY_USER, [R0 * Math.cos(ang), R0 * Math.sin(ang)]); } });
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]]);
      b.on('update', function () {
        cs(S, Q);
        var an = ang4(Q), a1 = G.ang(B, A, D), a2 = G.ang(C, A, D), a3 = G.ang(A, B, C), a4 = G.ang(D, B, C);
        var q = [G.dist(D, O) * G.dist(O, B), G.dist(A, O) * G.dist(O, C)];
        X.ro([[['∠A + ∠C', dg(an[0] + an[2]) + ' ' + ok(eq(an[0] + an[2], Math.PI, 0.004))], ['∠B + ∠D', dg(an[1] + an[3]) + ' ' + ok(eq(an[1] + an[3], Math.PI, 0.004))]],
              [['∠ABD', dg(G.ang(B, A, D))], ['∠ACD', dg(G.ang(C, A, D)) + ' ' + ok(eq(G.ang(B, A, D), G.ang(C, A, D), 0.004))]],
              [['∠BAC', dg(G.ang(A, B, C))], ['∠BDC', dg(G.ang(D, B, C)) + ' ' + ok(eq(G.ang(A, B, C), G.ang(D, B, C), 0.004))]],
              [['DO·OB', G.f2(q[0])], ['AO·OC', G.f2(q[1]) + ' ' + ok(eq(q[0], q[1], 0.01))]]]);
      });
    }
  };

  /* Рис. 15.4–15.5 — Птолемей, диагонали и радиус */
  FIGS.x152 = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: cstate,
    build: function (X) {
      var b = X.b, S = X.S, Q = cyc(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      X.seg(A, C, 'AC', 'xx', 1.7, {}, 4.5); X.seg(B, D, 'BD', 'yy', 1.7, {}, 4.5);
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D]]);
      b.on('update', function () {
        cs(S, Q);
        var s = sides(Q), a = s[0], bb = s[1], c = s[2], d = s[3], x = G.dist(A, C), y = G.dist(B, D), p = (a + bb + c + d) / 2;
        var x2 = (a * c + bb * d) * (a * d + bb * c) / (a * bb + c * d), y2 = (a * c + bb * d) * (a * bb + c * d) / (a * d + bb * c);
        var Rf = 0.25 * Math.sqrt((a * c + bb * d) * (a * bb + c * d) * (a * d + bb * c) / ((p - a) * (p - bb) * (p - c) * (p - d)));
        X.ro([[['AC·BD', G.f2(x * y)], ['AB·CD + BC·DA', G.f2(a * c + bb * d) + ' ' + ok(eq(x * y, a * c + bb * d, 0.01))]],
              [['AC / BD', G.f2(x / y)], ['(AB·AD + BC·CD)/(AB·BC + AD·CD)', G.f2((a * d + bb * c) / (a * bb + c * d)) + ' ' + ok(eq(x / y, (a * d + bb * c) / (a * bb + c * d), 0.004))]],
              [['AC²', G.f2(x * x)], ['(ac+bd)(ad+bc)/(ab+cd)', G.f2(x2) + ' ' + ok(eq(x * x, x2, 0.02))]],
              [['BD²', G.f2(y * y)], ['(ac+bd)(ab+cd)/(ad+bc)', G.f2(y2) + ' ' + ok(eq(y * y, y2, 0.02))]],
              [['R', G.f2(R0)], ['¼√(…)', G.f2(Rf) + ' ' + ok(eq(R0, Rf, 0.01))]]]);
      });
    }
  };

  /* Рис. 15.6 — теоремы косинусов и синусов, площадь */
  FIGS.x153 = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: cstate,
    build: function (X) {
      var b = X.b, S = X.S, Q = cyc(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      X.seg(A, C, 'AC', 'd1', 1.5, { dash: 2 }, 4); X.seg(B, D, 'BD', 'd2', 1.5, { dash: 2 }, 4);
      X.ang(A, B, D, 0.5, 'A', 'aA', 'A'); X.ang(B, C, A, 0.5, 'B', 'aB', 'B'); X.ang(C, D, B, 0.5, 'C', 'aC', 'C'); X.ang(D, A, C, 0.5, 'D', 'aD', 'D');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D]]);
      b.on('update', function () {
        cs(S, Q);
        var s = sides(Q), a = s[0], bb = s[1], c = s[2], d = s[3], p = (a + bb + c + d) / 2, an = ang4(Q);
        var Sq = area(A, B, C) + area(A, C, D), Sb = Math.sqrt((p - a) * (p - bb) * (p - c) * (p - d));
        X.ro([[['cos A', G.f2(Math.cos(an[0]))], ['(a²+d²−b²−c²) / 2(ad+bc)', G.f2((a * a + d * d - bb * bb - c * c) / (2 * (a * d + bb * c))) + ' ' + ok(eq(Math.cos(an[0]), (a * a + d * d - bb * bb - c * c) / (2 * (a * d + bb * c)), 0.004))]],
              [['cos B', G.f2(Math.cos(an[1]))], ['(a²+b²−c²−d²) / 2(ab+cd)', G.f2((a * a + bb * bb - c * c - d * d) / (2 * (a * bb + c * d))) + ' ' + ok(eq(Math.cos(an[1]), (a * a + bb * bb - c * c - d * d) / (2 * (a * bb + c * d)), 0.004))]],
              [['BD / sin A', G.f2(G.dist(B, D) / Math.sin(an[0]))], ['AC / sin B', G.f2(G.dist(A, C) / Math.sin(an[1]))], ['2R', G.f2(2 * R0) + ' ' + ok(eq(G.dist(B, D) / Math.sin(an[0]), 2 * R0, 0.01) && eq(G.dist(A, C) / Math.sin(an[1]), 2 * R0, 0.01))]],
              [['S', G.f2(Sq)], ['(ab+cd)·sin B / 2', G.f2((a * bb + c * d) * Math.sin(an[1]) / 2) + ' ' + ok(eq(Sq, (a * bb + c * d) * Math.sin(an[1]) / 2, 0.01))], ['(ad+bc)·sin A / 2', G.f2((a * d + bb * c) * Math.sin(an[0]) / 2) + ' ' + ok(eq(Sq, (a * d + bb * c) * Math.sin(an[0]) / 2, 0.01))]],
              [['(ab+cd)·AC / 4R', G.f2((a * bb + c * d) * G.dist(A, C) / (4 * R0)) + ' ' + ok(eq(Sq, (a * bb + c * d) * G.dist(A, C) / (4 * R0), 0.01))], ['√((p−a)(p−b)(p−c)(p−d))', G.f2(Sb) + ' ' + ok(eq(Sq, Sb, 0.01))]]]);
      });
    }
  };

  /* Рис. 15.6а — вписанный четырёхугольник с перпендикулярными диагоналями */
  FIGS.x154 = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: function () { return { A: 3.7, B: 4.9, C: 0.55 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var A = onC(X, c, 'A', S.A, [-22, -14]), Bp = onC(X, c, 'B', S.B, [-22, 6]), C = onC(X, c, 'C', S.C, [8, 6]);
      var D = wp(X, 'D', function () {
        var u = dir(A, C), l = Math.hypot(u[0], u[1]) || 1, n = [-u[1] / l, u[0] / l];
        var bq = Bp.X() * n[0] + Bp.Y() * n[1]; var t = -2 * bq; return [Bp.X() + t * n[0], Bp.Y() + t * n[1]];
      }, [8, -16]);
      G.guard(b, [A, Bp, C], function () {
        var g1 = ccw(th(A), th(Bp)), g2 = ccw(th(Bp), th(C)), g3 = ccw(th(C), th(D)), g4 = TAU - g1 - g2 - g3;
        return g1 > 0.45 && g2 > 0.45 && g3 > 0.45 && g4 > 0.45 && g1 + g2 + g3 < TAU;
      });
      var Qp = wp(X, 'Q', function () { return G.inter(xy(A), dir(A, C), xy(Bp), dir(Bp, D)); }, [6, -16]);
      var H1 = wp(X, 'H<sub>1</sub>', function () { return [(A.X() + Bp.X()) / 2, (A.Y() + Bp.Y()) / 2]; }, [-24, 8]);
      var H2 = wp(X, 'H<sub>2</sub>', function () { return [(C.X() + D.X()) / 2, (C.Y() + D.Y()) / 2]; }, [8, -18]);
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(A, Bp, 'AB', 'sAB', 2, {}, 4.5); X.seg(Bp, C, 'BC', 'sBC', 2, {}, 4.5); X.seg(C, D, 'CD', 'sCD', 2, {}, 4.5); X.seg(D, A, 'DA', 'sDA', 2, {}, 4.5);
      X.seg(A, C, 'AC', 'diag', 1.4, {}, 4); X.seg(Bp, D, 'BD', 'diag', 1.4, {}, 4);
      X.seg(O, H1, 'OH1', 'oh', 1.4, { dash: 2 }, 4); X.seg(O, H2, 'OH2', 'oh', 1.4, { dash: 2 }, 4);
      X.right(Qp, A, Bp, 0.25, 'rQ', 'rQ');
      pts(X, [['A', A], ['B', Bp], ['C', C], ['D', D], ['Q', Qp], ['O', O], ['H1', H1], ['H2', H2]]);
      b.on('update', function () {
        S.A = th(A); S.B = th(Bp); S.C = th(C);
        var ab = G.dist(A, Bp), bc = G.dist(Bp, C), cd = G.dist(C, D), da = G.dist(D, A), q = [G.dist(Qp, A), G.dist(Qp, Bp), G.dist(Qp, C), G.dist(Qp, D)];
        var s4 = 4 * R0 * R0;
        X.ro([[['AB² + DC²', G.f2(ab * ab + cd * cd) + ' ' + ok(eq(ab * ab + cd * cd, s4, 0.02))], ['BC² + AD²', G.f2(bc * bc + da * da) + ' ' + ok(eq(bc * bc + da * da, s4, 0.02))], ['4R²', G.f2(s4)]],
              [['AQ²+BQ²+CQ²+DQ²', G.f2(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) + ' ' + ok(eq(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3], s4, 0.03))]],
              [['OH₁', G.f2(G.dist(O, H1))], ['DC / 2', G.f2(cd / 2) + ' ' + ok(eq(G.dist(O, H1), cd / 2, 0.01))]],
              [['OH₂', G.f2(G.dist(O, H2))], ['AB / 2', G.f2(ab / 2) + ' ' + ok(eq(G.dist(O, H2), ab / 2, 0.01))]]]);
      });
    }
  };

  /* Рис. 15.6б — окружность на диаметре Q₁Q₂ */
  FIGS.x155 = {
    bbox: [-6.4, 6.4, 6.4, -6.4],
    state: function () { return { A: [-0.6, 3.1], B: [-2.8, -0.4], C: [2.4, -0.7] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-6, 10]), B = X.P('B', S.B, [-22, -6]), C = X.P('C', S.C, [8, -14]);
      G.guard(b, [A, B, C], function () { var a = G.dist(B, C), bb = G.dist(A, C), c = G.dist(A, B); return area(A, B, C) > 2.6 && a < 7 && bb < 7 && c < 7 && Math.abs(bb - c) > 0.35; });
      function sides() { return [G.dist(B, C), G.dist(A, C), G.dist(A, B)]; }
      var Q1 = wp(X, 'Q<sub>1</sub>', function () { var s = sides(), t = s[0] + s[1] + s[2]; return [(s[0] * A.X() + s[1] * B.X() + s[2] * C.X()) / t, (s[0] * A.Y() + s[1] * B.Y() + s[2] * C.Y()) / t]; }, [8, 6]);
      var Q2 = wp(X, 'Q<sub>2</sub>', function () { var s = sides(), t = -s[0] + s[1] + s[2]; return [(-s[0] * A.X() + s[1] * B.X() + s[2] * C.X()) / t, (-s[0] * A.Y() + s[1] * B.Y() + s[2] * C.Y()) / t]; }, [8, 6]);
      var M = X.D('', function () { return (Q1.X() + Q2.X()) / 2; }, function () { return (Q1.Y() + Q2.Y()) / 2; }, [0, 0]); M.setAttribute({ visible: false });
      circ(X, M, function () { return G.dist(Q1, Q2) / 2; }, 'cc', 'cc', 1.6);
      var Ep = X.H(function () { return B.X() + (B.X() - Q1.X()) * 0.8; }, function () { return B.Y() + (B.Y() - Q1.Y()) * 0.8; });
      X.seg(A, B, 'AB', 'tri', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
      X.seg(B, Q1, 'BQ1', 'bis', 1.4, {}, 4); X.seg(C, Q1, 'CQ1', 'bis', 1.4, {}, 4); X.seg(B, Q2, 'BQ2', 'ext', 1.4, {}, 4); X.seg(C, Q2, 'CQ2', 'ext', 1.4, {}, 4);
      X.seg(Q1, Q2, 'Q1Q2', 'dia', 1.8, { dash: 2 }, 4.5);
      X.right(B, Q1, Q2, 0.28, 'rB', 'rB'); X.right(C, Q1, Q2, 0.28, 'rC', 'rC');
      pts(X, [['A', A], ['B', B], ['C', C], ['Q1', Q1], ['Q2', Q2]]);
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.C = xy(C);
        var aA = G.ang(A, B, C), r = G.dist(Q1, Q2) / 2;
        X.ro([[['∠Q₁BQ₂', dg(G.ang(B, Q1, Q2)) + ' ' + ok(eq(G.ang(B, Q1, Q2), Math.PI / 2, 0.004))], ['∠Q₁CQ₂', dg(G.ang(C, Q1, Q2)) + ' ' + ok(eq(G.ang(C, Q1, Q2), Math.PI / 2, 0.004))]],
              [['∠BQ₁C', dg(G.ang(Q1, B, C))], ['90° + A/2', dg(Math.PI / 2 + aA / 2) + ' ' + ok(eq(G.ang(Q1, B, C), Math.PI / 2 + aA / 2, 0.004))]],
              [['∠BQ₂C', dg(G.ang(Q2, B, C))], ['90° − A/2', dg(Math.PI / 2 - aA / 2) + ' ' + ok(eq(G.ang(Q2, B, C), Math.PI / 2 - aA / 2, 0.004))]],
              [['MB', G.f2(G.dist(M, B))], ['MC', G.f2(G.dist(M, C))], ['Q₁Q₂ / 2', G.f2(r) + ' ' + ok(eq(G.dist(M, B), r, 0.01) && eq(G.dist(M, C), r, 0.01))]]]);
      });
    }
  };

  /* Рис. 15.7–15.8 — описанный четырёхугольник и теорема Ньютона */
  FIGS.x156 = {
    bbox: [-4.4, 4.2, 4.4, -4.2],
    state: function () { return { N: 4.0, K: 5.3, P: 0.55, M: 2.1 }; },
    build: function (X) {
      var b = X.b, S = X.S, r = 1.7;
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, 4]);
      var cc = b.create('circle', [O, r], { visible: false });
      function tg(name, a, off) { return X.G(name, [r * Math.cos(a), r * Math.sin(a)], cc, off); }
      var N = tg('N', S.N, [-18, -12]), K = tg('K', S.K, [8, -16]), P = tg('P', S.P, [8, 6]), Mm = tg('M', S.M, [-18, 6]);
      function gaps() { var g1 = ccw(th(N), th(K)), g2 = ccw(th(K), th(P)), g3 = ccw(th(P), th(Mm)), g4 = TAU - g1 - g2 - g3; return [g1, g2, g3, g4]; }
      G.guard(b, [N, K, P, Mm], function () { var g = gaps(); return g[0] + g[1] + g[2] < TAU && g.every(function (x) { return x > 0.7 && x < 2.7; }); });
      function vtx(U, V) { return function () { var a = th(U), c = th(V), d = ccw(a, c), m = a + d / 2, k = r / Math.cos(d / 2); return [k * Math.cos(m), k * Math.sin(m)]; }; }
      var Bq = wp(X, 'B', vtx(N, K), [-8, -20]), Cq = wp(X, 'C', vtx(K, P), [8, -4]), Dq = wp(X, 'D', vtx(P, Mm), [8, 6]), Aq = wp(X, 'A', vtx(Mm, N), [-22, 0]);
      var M1 = wp(X, 'M<sub>1</sub>', function () { return [(Aq.X() + Cq.X()) / 2, (Aq.Y() + Cq.Y()) / 2]; }, [8, 6]);
      var M2 = wp(X, 'M<sub>2</sub>', function () { return [(Bq.X() + Dq.X()) / 2, (Bq.Y() + Dq.Y()) / 2]; }, [8, -16]);
      circ(X, O, r, 'cir', 'cir', 1.8);
      X.seg(Aq, Bq, 'AB', 'sAB', 2, {}, 4.5); X.seg(Bq, Cq, 'BC', 'sBC', 2, {}, 4.5); X.seg(Cq, Dq, 'CD', 'sCD', 2, {}, 4.5); X.seg(Dq, Aq, 'DA', 'sDA', 2, {}, 4.5);
      X.seg(Aq, Cq, 'AC', 'diag', 1.2, { dash: 2 }, 3.5); X.seg(Bq, Dq, 'BD', 'diag', 1.2, { dash: 2 }, 3.5);
      var L1 = X.H(function () { var u = dir(M1, M2), l = Math.hypot(u[0], u[1]) || 1; return M1.X() - u[0] / l * 2.2; }, function () { var u = dir(M1, M2), l = Math.hypot(u[0], u[1]) || 1; return M1.Y() - u[1] / l * 2.2; });
      var L2 = X.H(function () { var u = dir(M1, M2), l = Math.hypot(u[0], u[1]) || 1; return M2.X() + u[0] / l * 2.2; }, function () { var u = dir(M1, M2), l = Math.hypot(u[0], u[1]) || 1; return M2.Y() + u[1] / l * 2.2; });
      X.seg(L1, L2, 'M1M2', 'newton', 1.8, { dash: 3 }, 4.5);
      X.seg(O, N, 'ON', 'rad', 1.1, { dash: 2 }, 3); X.seg(O, K, 'OK', 'rad', 1.1, { dash: 2 }, 3); X.seg(O, P, 'OP', 'rad', 1.1, { dash: 2 }, 3); X.seg(O, Mm, 'OM', 'rad', 1.1, { dash: 2 }, 3);
      pts(X, [['O', O], ['A', Aq], ['B', Bq], ['C', Cq], ['D', Dq], ['N', N], ['K', K], ['P', P], ['M', Mm], ['M1', M1], ['M2', M2]]);
      b.on('update', function () {
        S.N = th(N); S.K = th(K); S.P = th(P); S.M = th(Mm);
        var ab = G.dist(Aq, Bq), cd = G.dist(Cq, Dq), bc = G.dist(Bq, Cq), da = G.dist(Dq, Aq);
        var s = area(Aq, Bq, Cq) + area(Aq, Cq, Dq), cr = (M2.X() - M1.X()) * (O.Y() - M1.Y()) - (M2.Y() - M1.Y()) * (O.X() - M1.X());
        var l = Math.hypot(M2.X() - M1.X(), M2.Y() - M1.Y()) || 1;
        X.ro([[['AB + CD', G.f2(ab + cd)], ['BC + AD', G.f2(bc + da) + ' ' + ok(eq(ab + cd, bc + da, 0.01))]],
              [['расстояние от O до M₁M₂', G.f2(Math.abs(cr) / l) + ' ' + ok(Math.abs(cr) / l < 0.01)]],
              [['S(ABO) + S(CDO)', G.f2(area(Aq, Bq, O) + area(Cq, Dq, O))], ['S/2', G.f2(s / 2) + ' ' + ok(eq(area(Aq, Bq, O) + area(Cq, Dq, O), s / 2, 0.02))]]]);
      });
    }
  };

  /* Рис. 15.8а, 15.9, 15.10 — описанная равнобокая трапеция */
  FIGS.x157 = {
    bbox: [-5.4, 4.8, 5.4, -2.6],
    state: function () { return { xa: 3.4, xb: 1.0 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var Pa = X.G('B', [S.xa, 0], b.create('line', [[0, 0], [1, 0]], { visible: false }), [8, -16]);
      var Pq = X.G('b/2', [S.xb, -1.2], b.create('line', [[0, -1.2], [1, -1.2]], { visible: false }), [8, 8]);
      G.guard(b, [Pa, Pq], function () { return Pa.X() > 1.2 && Pa.X() < 4.8 && Pq.X() > 0.35 && Pa.X() - Pq.X() > 0.8; });
      function h() { return 2 * Math.sqrt(Pa.X() * Pq.X()); }
      var A = X.D('A', function () { return -Pa.X(); }, function () { return 0; }, [-22, -16]);
      var C = X.D('C', function () { return Pq.X(); }, function () { return h(); }, [8, 6]), D = X.D('D', function () { return -Pq.X(); }, function () { return h(); }, [-24, 6]);
      var O = X.D('O', function () { return 0; }, function () { return h() / 2; }, [6, -16]);
      var Kk = wp(X, 'K', function () { return G.foot(O, Pa, C); }, [8, 2]);
      var Nn = wp(X, 'N', function () { return G.foot(O, A, D); }, [-22, 2]);
      var Hh = X.D('', function () { return Kk.X(); }, function () { return Kk.Y(); }, [0, 0]); Hh.setAttribute({ visible: false });
      var E = wp(X, 'E', function () { return [(Pa.X() + Pq.X()) / 2, h() / 2]; }, [8, 4]), F = wp(X, 'F', function () { return [-(Pa.X() + Pq.X()) / 2, h() / 2]; }, [-24, 4]);
      circ(X, O, function () { return h() / 2; }, 'cir', 'cir', 1.8);
      X.seg(A, Pa, 'AB', 'ta', 2, {}, 4.5); X.seg(Pa, C, 'BC', 'legs', 2, {}, 4.5); X.seg(C, D, 'CD', 'tb', 2, {}, 4.5); X.seg(D, A, 'DA', 'legs', 2, {}, 4.5);
      X.seg(O, Pa, 'OB', 'ob', 1.3, { dash: 3 }, 4); X.seg(O, C, 'OC', 'ob', 1.3, { dash: 3 }, 4); X.seg(O, A, 'OA', 'ob', 1.3, { dash: 3 }, 4); X.seg(O, D, 'OD', 'ob', 1.3, { dash: 3 }, 4);
      X.seg(O, Kk, 'OK', 'rad', 1.3, { dash: 2 }, 4); X.seg(F, E, 'EF', 'mid', 1.4, { dash: 2 }, 4);
      X.right(O, Pa, C, 0.25, 'rO', 'rO');
      pts(X, [['A', A], ['B', Pa], ['C', C], ['D', D], ['O', O], ['K', Kk], ['N', Nn], ['E', E], ['F', F]]);
      var lb = X.lbl(-5.0, -1.2, 'b / 2 →', null, null);
      b.on('update', function () {
        S.xa = Pa.X(); S.xb = Pq.X();
        var a = 2 * Pa.X(), bb = 2 * Pq.X(), n = G.dist(Pa, C), r = h() / 2, hh = h();
        var Nk = G.foot(O, A, D), Kf = G.foot(O, Pa, C), m = Math.hypot(Nk[0] - Kf[0], Nk[1] - Kf[1]);
        var S1 = (a + bb) / 2 * hh;
        X.ro([[['a', G.f2(a)], ['b', G.f2(bb)]],
              [['боковая сторона', G.f2(n)], ['(a + b)/2', G.f2((a + bb) / 2) + ' ' + ok(eq(n, (a + bb) / 2, 0.01))]],
              [['∠BOC', dg(G.ang(O, Pa, C)) + ' ' + ok(eq(G.ang(O, Pa, C), Math.PI / 2, 0.004))], ['2r', G.f2(hh)], ['√(ab)', G.f2(Math.sqrt(a * bb)) + ' ' + ok(eq(hh, Math.sqrt(a * bb), 0.01))]],
              [['OK', G.f2(G.dist(O, Kf.length ? { X: function () { return Kf[0]; }, Y: function () { return Kf[1]; } } : O))], ['√(BK·KC)', G.f2(Math.sqrt(G.dist(Pa, { X: function () { return Kf[0]; }, Y: function () { return Kf[1]; } }) * G.dist(C, { X: function () { return Kf[0]; }, Y: function () { return Kf[1]; } }))) + ' ' + ok(eq(r, Math.sqrt(G.dist(Pa, { X: function () { return Kf[0]; }, Y: function () { return Kf[1]; } }) * G.dist(C, { X: function () { return Kf[0]; }, Y: function () { return Kf[1]; } })), 0.01))]],
              [['m = NK', G.f2(m)], ['S = 8r³/m', G.f2(8 * r * r * r / m) + ' ' + ok(eq(S1, 8 * r * r * r / m, 0.03))], ['EF = 4r²/m', G.f2(4 * r * r / m) + ' ' + ok(eq((a + bb) / 2, 4 * r * r / m, 0.02))]]]);
      });
    }
  };

  /* Рис. 15.2 и 15.3 — достаточные условия вписанности: точка D внутри, на и вне окружности ABC */
  function suff(X, S, mode) {
    var b = X.b;
    var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [8, -14]), C = X.P('C', S.C, [8, 6]);
    var D = X.P('D', S.D, [-4, 10]);
    var O = wp(X, 'O', function () { return G.circum(A, B, C); }, [-16, 4]);
    function cr(P, Q, R) { return (Q.X() - P.X()) * (R.Y() - P.Y()) - (Q.Y() - P.Y()) * (R.X() - P.X()); }
    G.guard(b, [A, B, C, D], function () {
      var m = [G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)];
      if (!m.every(function (x) { return isFinite(x) && x > 0.5 && x < 2.4; })) return false;
      if (G.dist(O, A) > 3.6) return false;
      if (mode === 'sum') return cr(A, C, B) * cr(A, C, D) < 0 && Math.abs(cr(A, C, D)) > 0.5 && G.dist(D, O) < 4.2 && G.dist(D, A) > 0.5 && G.dist(D, C) > 0.5;
      return cr(B, C, A) * cr(B, C, D) > 0 && Math.abs(cr(B, C, D)) > 0.5 && G.dist(D, O) < 4.2 && G.dist(D, B) > 0.5 && G.dist(D, C) > 0.5;
    });
    circ(X, O, function () { return G.dist(O, A); }, 'cir', 'cir', 1.6);
    X.seg(A, B, 'AB', 'q', 2, {}, 4.5); X.seg(B, C, 'BC', 'q', 2, {}, 4.5);
    if (mode === 'sum') { X.seg(C, D, 'CD', 'q', 2, {}, 4.5); X.seg(D, A, 'DA', 'q', 2, {}, 4.5); X.seg(A, C, 'AC', 'diag', 1.2, { dash: 3 }, 3.5); }
    else { X.seg(B, D, 'BD', 'q', 2, {}, 4.5); X.seg(D, C, 'DC', 'q', 2, {}, 4.5); X.seg(C, A, 'CA', 'q', 2, {}, 4.5); X.seg(B, A, 'BA', 'q', 1.2, {}, 3.5); }
    var base = null;
    X.anim({ label: 'Провести D сквозь окружность', dur: 8000, t0: null,
      steps: [[0, 'D внутри круга: сумма углов больше (угол BDC больше)'], [0.4, 'D подходит к окружности'], [0.5, 'D на окружности: ровно 180° (углы равны)'], [0.6, 'D вне круга: сумма меньше (угол BDC меньше)']],
      set: function (t) {
        if (!base || t === 0) { var R0_ = G.dist(O, A), vx = D.X() - O.X(), vy = D.Y() - O.Y(), l = Math.hypot(vx, vy) || 1; base = { o: xy(O), u: [vx / l, vy / l], R: R0_ }; }
        var s = base.R * (0.62 + 0.76 * t);
        D.setPosition(JXG.COORDS_BY_USER, [base.o[0] + base.u[0] * s, base.o[1] + base.u[1] * s]);
      } });
    pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]]);
    b.on('update', function () {
      S.A = xy(A); S.B = xy(B); S.C = xy(C); S.D = xy(D);
      var d = G.dist(O, D), R = G.dist(O, A), pos = Math.abs(d - R) < 0.03 ? 'на окружности' : (d < R ? 'внутри' : 'вне');
      if (mode === 'sum') {
        var sum = G.ang(B, A, C) + G.ang(D, C, A), inside = d < R;
        X.ro([[['∠B + ∠D', G.deg(sum)], ['точка D', pos]],
              [['∠D > 180° − ∠B ⇔ D внутри круга', ((sum > Math.PI + 0.002 && d < R - 0.03) || (sum < Math.PI - 0.002 && d > R + 0.03) || Math.abs(d - R) <= 0.03 ? 'да' : 'нет') + ' ' + ok((sum > Math.PI + 0.002 && d < R - 0.03) || (sum < Math.PI - 0.002 && d > R + 0.03) || Math.abs(d - R) <= 0.03)]]]);
      } else {
        var u = G.ang(D, B, C), v = G.ang(A, B, C);
        X.ro([[['∠BDC', G.deg(u)], ['∠BAC', G.deg(v)], ['точка D', pos]],
              [['∠BDC > ∠BAC ⇔ D внутри круга', ((u > v + 0.002 && d < R - 0.03) || (u < v - 0.002 && d > R + 0.03) || Math.abs(d - R) <= 0.03 ? 'да' : 'нет') + ' ' + ok((u > v + 0.002 && d < R - 0.03) || (u < v - 0.002 && d > R + 0.03) || Math.abs(d - R) <= 0.03)]]]);
      }
    });
  }
  FIGS.x158 = { bbox: [-5.4, 4.6, 5.4, -4.6], state: function () { return { A: [-2.0, -1.9], B: [2.3, -1.6], C: [1.3, 2.2], D: [-2.6, 1.3] }; }, build: function (X) { suff(X, X.S, 'sum'); } };
  FIGS.x159 = { bbox: [-5.4, 4.6, 5.4, -4.6], state: function () { return { A: [0.4, 2.5], B: [-2.2, -1.6], C: [2.4, -1.4], D: [0.6, 1.0] }; }, build: function (X) { suff(X, X.S, 'ang'); } };

  /* к п. ⟨5⟩ §15.1 — четыре равных отношения OA/(AD·AB) = … */
  FIGS.x15a = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: cstate,
    build: function (X) {
      var b = X.b, S = X.S, Q = cyc(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      var O = wp(X, 'O', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [8, -16]);
      X.seg(A, C, 'AC', 'diag', 1.2, { dash: 3 }, 3.5);
      X.seg(B, D, 'BD', 'diag', 1.2, { dash: 3 }, 3.5);
      X.seg(O, A, 'OA', 'oa', 2.4, {}, 5); X.seg(O, B, 'OB', 'ob', 2.4, {}, 5); X.seg(O, C, 'OC', 'oc', 2.4, {}, 5); X.seg(O, D, 'OD', 'od', 2.4, {}, 5);
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]]);
      b.on('update', function () {
        cs(S, Q);
        var s = sides(Q), a = s[0], bb = s[1], c = s[2], d = s[3];
        var r1 = G.dist(O, A) / (d * a), r2 = G.dist(O, C) / (bb * c), r3 = G.dist(O, B) / (a * bb), r4 = G.dist(O, D) / (d * c);
        var f = function (x) { return (x * 1000).toFixed(2); };
        X.ro([[['OA/(AD·AB)', f(r1)], ['OC/(BC·CD)', f(r2)], ['OB/(AB·BC)', f(r3)], ['OD/(AD·CD)', f(r4) + ' ' + ok(eq(r1, r2, 0.0004) && eq(r1, r3, 0.0004) && eq(r1, r4, 0.0004))]],
              [['(AO+OC)/(AD·AB+BC·CD)', f(G.dist(A, C) / (d * a + bb * c))], ['(BO+OD)/(AB·BC+AD·CD)', f(G.dist(B, D) / (a * bb + d * c)) + ' ' + ok(eq(G.dist(A, C) / (d * a + bb * c), r1, 0.0004) && eq(G.dist(B, D) / (a * bb + d * c), r1, 0.0004))]]]);
      });
    }
  };
})();
