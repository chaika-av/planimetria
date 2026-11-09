/* Глава 12. Свойства касательных к окружности */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function sv(S, o) { Object.keys(o).forEach(function (k) { S[k] = [o[k].X(), o[k].Y()]; }); }
  function area(P, Q, R) { return 0.5 * Math.abs((Q.X() - P.X()) * (R.Y() - P.Y()) - (R.X() - P.X()) * (Q.Y() - P.Y())); }
  function circ(X, O, r, prim, tok, w) {
    var o = X.b.create('circle', [O, r], { fixed: true, strokeColor: X.C.fg, strokeWidth: w || 1.8, highlight: false, fillColor: 'none' });
    X.reg(prim, tok, o, { strokeColor: X.C.fg, strokeWidth: w || 1.8 }, { strokeColor: X.C.acc, strokeWidth: 4 }); return o;
  }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  /* общая касательная к двум окружностям: n·(O2−O1) = s1·r1 + s2·r2 ; возвращает [n, ...] */
  function tangN(O1, r1, O2, r2, sg, k) {   /* k: 'ext' или 'int' ; sg = ±1 */
    var dx = O2.X() - O1.X(), dy = O2.Y() - O1.Y(), d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
    var c = k === 'ext' ? (r1 - r2) / d : (r1 + r2) / d, s = Math.sqrt(Math.max(0, 1 - c * c));
    return [ux * c - sg * uy * s, uy * c + sg * ux * s];
  }

  /* Рис. 12.1 */
  FIGS.k121 = {
    bbox: [-4.6, 3.6, 4.6, -3.4],
    state: function () { return { A: [-0.9, -2.2], B: [1.9, -2.5], C: [-2.9, -1.7] }; },
    build: function (X) {
      var b = X.b, S = X.S, R = 2.3;
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, 6]);
      var A = X.G('A', S.A, b.create('circle', [O, R], { visible: false }), [6, -18]);
      var Ah = X.H(function () { return A.X() - A.Y() / R * 2; }, function () { return A.Y() + A.X() / R * 2; });
      var line = b.create('line', [A, Ah], { visible: false });
      var Bp = X.G('B', S.B, line, [6, -16]), Cp = X.G('C', S.C, line, [-4, -18]);
      circ(X, O, R, 'cir', 'cir', 2);
      var E1 = X.H(function () { return A.X() + (A.Y() / R) * 4.2; }, function () { return A.Y() - (A.X() / R) * 4.2; });
      var E2 = X.H(function () { return A.X() - (A.Y() / R) * 4.2; }, function () { return A.Y() + (A.X() / R) * 4.2; });
      X.seg(E1, E2, 'MN', 'tan', 2, {}, 4.5);
      X.seg(O, A, 'OA', 'rad', 1.8, {}, 4.5); X.seg(O, Bp, 'OB', 'oth', 1.2, { dash: 2 }, 3.5); X.seg(O, Cp, 'OC', 'oth', 1.2, { dash: 2 }, 3.5);
      X.right(A, O, Bp, 0.3, 'rA', 'rA');
      X.anim({ label: 'Провести касание по кругу', dur: 9000, t0: null,
        steps: [[0, 'Точка касания A бежит по окружности'], [0.1, 'Радиус OA всегда перпендикулярен касательной'], [0.6, 'Остальные точки касательной дальше от центра, чем A']],
        set: function (t) { var a = Math.atan2(S.A[1], S.A[0]); if (t === 0 || !this.a0) this.a0 = a; var an = this.a0 + t * 2 * Math.PI; A.setPosition(JXG.COORDS_BY_USER, [R * Math.cos(an), R * Math.sin(an)]); } });
      pts(X, [['O', O], ['A', A], ['B', Bp], ['C', Cp]]);
      b.on('update', function () {
        sv(S, { A: A, B: Bp, C: Cp });
        var oa = G.dist(O, A), ob = G.dist(O, Bp), oc = G.dist(O, Cp);
        X.ro([[['OA', G.f2(oa)], ['OB', G.f2(ob) + ' ' + ok(ob >= oa - 1e-9)], ['OC', G.f2(oc) + ' ' + ok(oc >= oa - 1e-9)]],
              [['∠OAB', G.deg(G.ang(A, O, Bp))], ['∠OAC', G.deg(G.ang(A, O, Cp))]]]);
      });
    }
  };

  /* Рис. 12.2 */
  FIGS.k122 = {
    bbox: [-3.0, 3.6, 7.4, -3.6],
    state: function () { return { A: [5.0, 0.8] }; },
    build: function (X) {
      var b = X.b, S = X.S, R = 1.7;
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, 6]);
      var A = X.P('A', S.A, [8, 8]);
      G.guard(b, [A], function () { var d = Math.hypot(A.X(), A.Y()); return d > 2.6 && d < 6.6; });
      function tp(sg) { return function () { var d = Math.hypot(A.X(), A.Y()), th = Math.atan2(A.Y(), A.X()), be = Math.acos(R / d); return [R * Math.cos(th + sg * be), R * Math.sin(th + sg * be)]; }; }
      var B = wp(X, 'B', tp(1), [-6, 10]), C = wp(X, 'C', tp(-1), [-6, -20]);
      circ(X, O, R, 'cir', 'cir', 2);
      X.seg(A, B, 'AB', 't1', 2, {}, 4.5); X.seg(A, C, 'AC', 't2', 2, {}, 4.5);
      X.seg(O, B, 'OB', 'rad', 1.4, { dash: 2 }, 4); X.seg(O, C, 'OC', 'rad', 1.4, { dash: 2 }, 4); X.seg(O, A, 'OA', 'bis', 1.6, { dash: 3 }, 4.5);
      X.right(B, O, A, 0.28, 'rB', 'rB'); X.right(C, O, A, 0.28, 'rC', 'rC');
      X.ang(A, B, O, 0.9, '', 'a1', 'ang'); X.ang(A, O, C, 0.9, '', 'a2', 'ang');
      var th0 = null;
      X.anim({ label: 'Отодвигать точку A', dur: 8000, t0: null,
        steps: [[0, 'Точка A близко к окружности'], [0.1, 'Касательные AB и AC всегда равны'], [0.6, 'OA остаётся биссектрисой угла BAC']],
        set: function (t) { if (th0 === null || t === 0) th0 = Math.atan2(A.Y(), A.X()); var d = 2.8 + 3.6 * t; A.setPosition(JXG.COORDS_BY_USER, [d * Math.cos(th0), d * Math.sin(th0)]); } });
      pts(X, [['O', O], ['A', A], ['B', B], ['C', C]]); X.alias('tt', ['t1', 't2']);
      b.on('update', function () {
        sv(S, { A: A });
        var ab = G.dist(A, B), ac = G.dist(A, C);
        X.ro([[['AB', G.f2(ab)], ['AC', G.f2(ac) + ' ' + ok(eq(ab, ac, 0.004))]],
              [['∠OAB', G.deg(G.ang(A, B, O))], ['∠OAC', G.deg(G.ang(A, O, C)) + ' ' + ok(eq(G.ang(A, B, O), G.ang(A, O, C), 0.004))]],
              [['∠OBA', G.deg(G.ang(B, O, A))], ['∠OCA', G.deg(G.ang(C, O, A))]]]);
      });
    }
  };

  /* Рис. 12.3–12.4 — две касающиеся окружности и общие касательные */
  FIGS.k123 = {
    bbox: [-6.4, 4.6, 6.4, -3.6],
    state: function () { return { P: [-2.9, -0.2], Q: [3.6, 0.3], T: 0.36 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var O1 = X.P('O<sub>1</sub>', S.P, [-20, -18]), O2 = X.P('O<sub>2</sub>', S.Q, [8, -18]);
      var seg = b.create('segment', [O1, O2], { visible: false });
      var T = X.G('C', [O1.X() + (O2.X() - O1.X()) * S.T, O1.Y() + (O2.Y() - O1.Y()) * S.T], seg, [-4, -18]);
      function tt() { return G.dist(O1, T) / G.dist(O1, O2); }
      G.guard(b, [O1, O2, T], function () { var t = tt(); return G.dist(O1, O2) > 3 && G.dist(O1, O2) < 9.5 && t > 0.2 && t < 0.8 && Math.abs(t - 0.5) > 0.07; });
      function r1() { return G.dist(O1, T); } function r2() { return G.dist(O2, T); }
      var A = wp(X, 'A', function () { var n = tangN(O1, r1(), O2, r2(), 1, 'ext'); return [O1.X() + r1() * n[0], O1.Y() + r1() * n[1]]; }, [-14, 8]);
      var B = wp(X, 'B', function () { var n = tangN(O1, r1(), O2, r2(), 1, 'ext'); return [O2.X() + r2() * n[0], O2.Y() + r2() * n[1]]; }, [8, 8]);
      var M = wp(X, 'M', function () { var u = dir(O1, O2), l = Math.hypot(u[0], u[1]); return G.inter(xy(T), [-u[1], u[0]], xy(A), dir(A, B)); }, [8, 8]);
      var N = X.H(function () { var u = dir(O1, O2); return T.X() - u[1] * 0.25 - 0; }, function () { var u = dir(O1, O2); return T.Y() + u[0] * 0.25; });
      circ(X, O1, r1, 'c1', 'c1', 2); circ(X, O2, r2, 'c2', 'c2', 2);
      X.seg(A, B, 'AB', 'AB', 2, {}, 4.5); X.seg(M, T, 'MC', 'MC', 1.6, { dash: 0 }, 4.5);
      X.seg(O1, O2, 'OO', 'oo', 1.4, { dash: 2 }, 4); X.seg(O1, M, 'O1M', 'bis', 1.2, { dash: 3 }, 3.5); X.seg(O2, M, 'O2M', 'bis', 1.2, { dash: 3 }, 3.5);
      X.seg(A, T, 'AC', 'tri', 1.4, {}, 4); X.seg(T, B, 'CB', 'tri', 1.4, {}, 4);
      X.right(M, O1, O2, 0.3, 'rM', 'rM'); X.right(T, A, B, 0.3, 'rC', 'rC');
      pts(X, [['O1', O1], ['O2', O2], ['C', T], ['A', A], ['B', B], ['M', M]]);
      X.alias('mid', ['AB', 'MC']);
      b.on('update', function () {
        S.P = xy(O1); S.Q = xy(O2); S.T = tt();
        var ma = G.dist(M, A), mc = G.dist(M, T), mb = G.dist(M, B), ab = G.dist(A, B), r = r1(), R = r2(), g = 2 * Math.sqrt(2 * r * 2 * R);
        X.ro([[['MA', G.f2(ma)], ['MC', G.f2(mc)], ['MB', G.f2(mb) + ' ' + ok(eq(ma, mc, 0.01) && eq(mc, mb, 0.01))]],
              [['∠ACB', G.deg(G.ang(T, A, B)) + ' ' + ok(eq(G.ang(T, A, B), Math.PI / 2, 0.004))], ['∠O₁MO₂', G.deg(G.ang(M, O1, O2)) + ' ' + ok(eq(G.ang(M, O1, O2), Math.PI / 2, 0.004))]],
              [['AB', G.f2(ab)], ['√(2r·2R)', G.f2(Math.sqrt(2 * r * 2 * R)) + ' ' + ok(eq(ab, Math.sqrt(4 * r * R), 0.01))]]]);
      });
    }
  };

  /* Рис. 12.4а — внутреннее касание, DE — биссектриса угла ADB */
  FIGS.k124 = {
    bbox: [-4.2, 4.0, 4.2, -4.0],
    state: function () { return { D: 2.5, t: 0.5, E: 0.15 }; },
    build: function (X) {
      var b = X.b, S = X.S, R = 3.0;
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, 4]);
      var Dp = X.G('D', [R * Math.cos(S.D), R * Math.sin(S.D)], b.create('circle', [O, R], { visible: false }), [-20, 8]);
      var OD = b.create('segment', [O, Dp], { visible: false });
      var O1 = X.G('O<sub>1</sub>', [Dp.X() * (1 - S.t), Dp.Y() * (1 - S.t)], OD, [-24, -16]);
      function r1() { return G.dist(O1, Dp); }
      var E = X.G('E', [O1.X() + r1() * Math.cos(S.E), O1.Y() + r1() * Math.sin(S.E)], b.create('circle', [O1, r1], { visible: false }), [8, 4]);
      G.guard(b, [Dp, O1, E], function () { var t = r1() / R; return t > 0.2 && t < 0.72 && G.dist(E, Dp) > 0.8; });
      function hits() {
        var ux = E.X() - O1.X(), uy = E.Y() - O1.Y(), dx = -uy, dy = ux, l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        var px = E.X(), py = E.Y(), bq = px * dx + py * dy, cq = px * px + py * py - R * R, s = Math.sqrt(Math.max(0, bq * bq - cq));
        return [[px + (-bq + s) * dx, py + (-bq + s) * dy], [px + (-bq - s) * dx, py + (-bq - s) * dy]];
      }
      var A = wp(X, 'A', function () { return hits()[0]; }, [8, 8]), B = wp(X, 'B', function () { return hits()[1]; }, [-20, -16]);
      circ(X, O, R, 'c1', 'c1', 2); circ(X, O1, r1, 'c2', 'c2', 2);
      X.seg(A, B, 'AB', 'chord', 2, {}, 4.5); X.seg(Dp, A, 'DA', 'ang', 1.4, {}, 4); X.seg(Dp, B, 'DB', 'ang', 1.4, {}, 4); X.seg(Dp, E, 'DE', 'bis', 2, { dash: 2 }, 4.5);
      X.seg(O, Dp, 'OD', 'oo', 1.2, { dash: 3 }, 3.5);
      X.ang(Dp, A, E, 0.55, '', 'a1', 'half'); X.ang(Dp, E, B, 0.7, '', 'a2', 'half');
      pts(X, [['O', O], ['D', Dp], ['O1', O1], ['E', E], ['A', A], ['B', B]]);
      b.on('update', function () {
        S.D = Math.atan2(Dp.Y(), Dp.X()); S.t = G.dist(Dp, O1) / G.dist(Dp, O) || 0.45; S.E = Math.atan2(E.Y() - O1.Y(), E.X() - O1.X());
        var a1 = G.ang(Dp, A, E), a2 = G.ang(Dp, E, B);
        X.ro([[['∠ADE', G.deg(a1)], ['∠BDE', G.deg(a2) + ' ' + ok(eq(a1, a2, 0.004))]], [['∠ADB', G.deg(G.ang(Dp, A, B))]]]);
      });
    }
  };

  /* Рис. 12.4б — окружности пересекаются под прямым углом */
  FIGS.k125 = {
    bbox: [-5.4, 5.0, 5.4, -3.2],
    state: function () { return { P: [-2.4, 1.2], Q: 1.6 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var Cc = X.D('C', function () { return 0; }, function () { return 0; }, [-6, -20]);
      var O1 = X.P('O<sub>1</sub>', S.P, [-24, 4]);
      var Nh = X.H(function () { return -O1.Y(); }, function () { return O1.X(); });
      var O2 = X.G('O<sub>2</sub>', [-S.P[1] / Math.hypot(S.P[0], S.P[1]) * S.Q, S.P[0] / Math.hypot(S.P[0], S.P[1]) * S.Q], b.create('line', [Cc, Nh], { visible: false }), [8, 4]);
      function R1() { return G.dist(O1, Cc); } function R2() { return G.dist(O2, Cc); }
      G.guard(b, [O1, O2], function () { return R1() > 1.0 && R1() < 3.3 && R2() > 1.0 && R2() < 3.3 && Math.abs(O2.X() * O1.X() + O2.Y() * O1.Y()) < 1e-6 + 1e-3 * R1() * R2(); });
      var A = X.D('A', function () { return 2 * O1.X(); }, function () { return 2 * O1.Y(); }, [-24, 6]);
      var Bp = X.D('B', function () { return 2 * O2.X(); }, function () { return 2 * O2.Y(); }, [8, 6]);
      var D = wp(X, 'D', function () { var f = G.foot(Cc, O1, O2); return [2 * f[0], 2 * f[1]]; }, [8, -18]);
      circ(X, O1, R1, 'c1', 'c1', 2); circ(X, O2, R2, 'c2', 'c2', 2);
      X.seg(A, Bp, 'AB', 'AB', 2, {}, 4.5); X.seg(Cc, A, 'CA', 'tri', 1.6, {}, 4); X.seg(Cc, Bp, 'CB', 'tri', 1.6, {}, 4); X.seg(Cc, D, 'CD', 'CD', 1.8, { dash: 2 }, 4.5);
      X.seg(O1, O2, 'OO', 'oo', 1.6, { dash: 3 }, 4); X.seg(D, A, 'DA', 'AD', 1.8, { dash: 0 }, 4.5); X.seg(D, Bp, 'DB', 'BD', 1.8, { dash: 0 }, 4.5);
      X.right(Cc, A, Bp, 0.3, 'rC', 'rC');
      pts(X, [['C', Cc], ['A', A], ['B', Bp], ['D', D], ['O1', O1], ['O2', O2]]);
      b.on('update', function () {
        S.P = xy(O1); S.Q = R2();
        var r1 = R1(), r2 = R2(), q = Math.sqrt(r1 * r1 + r2 * r2);
        X.ro([[['∠ACB', G.deg(G.ang(Cc, A, Bp))], ['AB', G.f2(G.dist(A, Bp))], ['2√(R₁²+R₂²)', G.f2(2 * q) + ' ' + ok(eq(G.dist(A, Bp), 2 * q, 0.01))]],
              [['CD', G.f2(G.dist(Cc, D))], ['2R₁R₂/√(R₁²+R₂²)', G.f2(2 * r1 * r2 / q) + ' ' + ok(eq(G.dist(Cc, D), 2 * r1 * r2 / q, 0.01))]],
              [['AD', G.f2(G.dist(A, D))], ['2R₁²/√(…)', G.f2(2 * r1 * r1 / q) + ' ' + ok(eq(G.dist(A, D), 2 * r1 * r1 / q, 0.01))]],
              [['BD', G.f2(G.dist(Bp, D))], ['2R₂²/√(…)', G.f2(2 * r2 * r2 / q) + ' ' + ok(eq(G.dist(Bp, D), 2 * r2 * r2 / q, 0.01))]]]);
      });
    }
  };

  /* Рис. 12.5–12.6 — вписанная и вневписанная окружности */
  FIGS.k126 = {
    bbox: [-8.5, 8.0, 10.5, -10.0],
    state: function () { return { A: [-1.6, 2.8], B: [-3.2, -0.4], C: [1.6, -0.6] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-6, 10]), B = X.P('B', S.B, [-22, -14]), C = X.P('C', S.C, [8, -14]);
      G.guard(b, [A, B, C], function () { return area(A, B, C) > 3.2 && G.dist(A, B) < 8.5 && G.dist(A, C) < 8.5 && G.dist(B, C) < 8.5; });
      function a() { return G.dist(B, C); } function bb() { return G.dist(A, C); } function c() { return G.dist(A, B); }
      function p() { return (a() + bb() + c()) / 2; }
      function I() { var s = a() + bb() + c(); return [(a() * A.X() + bb() * B.X() + c() * C.X()) / s, (a() * A.Y() + bb() * B.Y() + c() * C.Y()) / s]; }
      function J() { var s = -a() + bb() + c(); return [(-a() * A.X() + bb() * B.X() + c() * C.X()) / s, (-a() * A.Y() + bb() * B.Y() + c() * C.Y()) / s]; }
      function r() { return area(A, B, C) / p(); } function ra() { return area(A, B, C) / (p() - a()); }
      var Ic = wp(X, 'I', I, [6, 6]), Jc = wp(X, 'I<sub>a</sub>', J, [8, -16]);
      function ft(P, U, V) { return function () { return G.foot(P, U, V); }; }
      var A1 = wp(X, 'A<sub>1</sub>', ft(Ic, B, C), [-10, 8]), B1 = wp(X, 'B<sub>1</sub>', ft(Ic, C, A), [8, 8]), C1 = wp(X, 'C<sub>1</sub>', ft(Ic, A, B), [-24, 6]);
      var A2 = wp(X, 'A<sub>2</sub>', ft(Jc, B, C), [4, -18]), B2 = wp(X, 'B<sub>2</sub>', ft(Jc, C, A), [8, 8]), C2 = wp(X, 'C<sub>2</sub>', ft(Jc, A, B), [-24, -12]);
      circ(X, Ic, r, 'ci', 'ci', 1.8); circ(X, Jc, ra, 'ce', 'ce', 1.8);
      var Ae = X.H(function () { return A.X() + (C2.X() - A.X()) * 1.0; }, function () { return A.Y() + (C2.Y() - A.Y()) * 1.0; });
      X.seg(A, B, 'AB', 'tri', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
      X.seg(B, C2, 'BC2', 'ext', 1.6, {}, 4); X.seg(C, B2, 'CB2', 'ext', 1.6, {}, 4);
      X.seg(Jc, A2, 'JA2', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(Jc, B2, 'JB2', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(Jc, C2, 'JC2', 'rad', 1.2, { dash: 2 }, 3.5);
      X.seg(Ic, A1, 'IA1', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(Ic, B1, 'IB1', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(Ic, C1, 'IC1', 'rad', 1.2, { dash: 2 }, 3.5);
      X.seg(A, Jc, 'AJ', 'bis', 1.4, { dash: 3 }, 4);
      pts(X, [['A', A], ['B', B], ['C', C], ['A1', A1], ['B1', B1], ['C1', C1], ['A2', A2], ['B2', B2], ['C2', C2], ['I', Ic], ['Ia', Jc]]);
      b.on('update', function () {
        sv(S, { A: A, B: B, C: C });
        var pp = p(), aa = a(), b2 = bb(), cc = c();
        var ac1 = G.dist(A, C1), ab2 = G.dist(A, B2), ca1 = G.dist(C, A1), ca2 = G.dist(C, A2), ba2 = G.dist(B, A2), a1a2 = G.dist(A1, A2), bb2 = G.dist(B1, B2), cc2 = G.dist(C1, C2);
        var half = G.ang(A, B, C) / 2;
        X.ro([[['AC₁ = AB₁', G.f2(ac1)], ['p − a', G.f2(pp - aa) + ' ' + ok(eq(ac1, pp - aa, 0.01))]],
              [['CA₁', G.f2(ca1)], ['p − c', G.f2(pp - cc) + ' ' + ok(eq(ca1, pp - cc, 0.01))]],
              [['AB₂ = AC₂', G.f2(ab2)], ['p', G.f2(pp) + ' ' + ok(eq(ab2, pp, 0.01))]],
              [['CA₂', G.f2(ca2)], ['p − b', G.f2(pp - b2) + ' ' + ok(eq(ca2, pp - b2, 0.01))]],
              [['A₁A₂', G.f2(a1a2)], ['|c − b|', G.f2(Math.abs(cc - b2)) + ' ' + ok(eq(a1a2, Math.abs(cc - b2), 0.01))]],
              [['B₁B₂', G.f2(bb2)], ['C₁C₂', G.f2(cc2)], ['a', G.f2(aa) + ' ' + ok(eq(bb2, aa, 0.01) && eq(cc2, aa, 0.01))]],
              [['rₐ', G.f2(ra())], ['p·tg(A/2)', G.f2(pp * Math.tan(half)) + ' ' + ok(eq(ra(), pp * Math.tan(half), 0.01))]]]);
      });
    }
  };

  /* Рис. 12.7 — общие касательные непересекающихся окружностей */
  FIGS.k127 = {
    bbox: [-6.8, 4.2, 6.8, -4.2],
    state: function () { return { P: [-3.6, 0.2], Q: [3.5, -0.3], r: 0.9, R: 1.6 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var O1 = X.P('O<sub>1</sub>', S.P, [-22, -18]), O2 = X.P('O<sub>2</sub>', S.Q, [8, -18]);
      var H1 = X.G('', [O1.X() + S.r, O1.Y()], b.create('circle', [O1, S.r], { visible: false }), [0, 0]);
      var H2 = X.G('', [O2.X() + S.R, O2.Y()], b.create('circle', [O2, S.R], { visible: false }), [0, 0]);
      function r() { return G.dist(O1, H1); } function R() { return G.dist(O2, H2); }
      G.guard(b, [O1, O2, H1, H2], function () { return r() > 0.45 && r() < 2.0 && R() > 0.45 && R() < 2.0 && G.dist(O1, O2) > r() + R() + 0.6 && G.dist(O1, O2) < 11.5; });
      function pt(O, rr, k, sg, side) { return function () { var n = tangN(O1, r(), O2, R(), sg, k); var q = side === 1 ? [O1.X() + r() * n[0], O1.Y() + r() * n[1]] : (k === 'ext' ? [O2.X() + R() * n[0], O2.Y() + R() * n[1]] : [O2.X() - R() * n[0], O2.Y() - R() * n[1]]); return q; }; }
      var A1 = wp(X, 'A<sub>1</sub>', pt(O1, r, 'ext', 1, 1), [-6, 8]), A2 = wp(X, 'A<sub>2</sub>', pt(O2, R, 'ext', 1, 2), [8, 8]);
      var B1 = wp(X, 'B<sub>1</sub>', pt(O1, r, 'int', 1, 1), [-6, 8]), B2 = wp(X, 'B<sub>2</sub>', pt(O2, R, 'int', 1, 2), [8, -16]);
      circ(X, O1, r, 'c1', 'c1', 2); circ(X, O2, R, 'c2', 'c2', 2);
      X.seg(A1, A2, 'A1A2', 'ex', 2, {}, 4.5); X.seg(B1, B2, 'B1B2', 'in', 2, {}, 4.5);
      X.seg(O1, A1, 'O1A1', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O2, A2, 'O2A2', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O1, B1, 'O1B1', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O2, B2, 'O2B2', 'rad', 1.2, { dash: 2 }, 3.5);
      X.seg(O1, O2, 'OO', 'oo', 1.4, { dash: 3 }, 4);
      pts(X, [['O1', O1], ['O2', O2], ['A1', A1], ['A2', A2], ['B1', B1], ['B2', B2]]);
      b.on('update', function () {
        S.P = xy(O1); S.Q = xy(O2); S.r = r(); S.R = R();
        var a = G.dist(O1, O2), ex = G.dist(A1, A2), inn = G.dist(B1, B2), ex0 = Math.sqrt(a * a - Math.pow(R() - r(), 2)), in0 = Math.sqrt(a * a - Math.pow(R() + r(), 2));
        X.ro([[['a', G.f2(a)], ['r', G.f2(r())], ['R', G.f2(R())]],
              [['A₁A₂', G.f2(ex)], ['√(a² − (R − r)²)', G.f2(ex0) + ' ' + ok(eq(ex, ex0, 0.01))]],
              [['B₁B₂', G.f2(inn)], ['√(a² − (R + r)²)', G.f2(in0) + ' ' + ok(eq(inn, in0, 0.01))]]]);
      });
    }
  };
})();
