/* Глава 14. Теоремы об окружностях и треугольниках */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function sv(S, o) { Object.keys(o).forEach(function (k) { S[k] = [o[k].X(), o[k].Y()]; }); }
  function area(P, Q, R) { return 0.5 * Math.abs((Q.X() - P.X()) * (R.Y() - P.Y()) - (R.X() - P.X()) * (Q.Y() - P.Y())); }
  function dg(x) { return G.deg(x); }
  function circ(X, O, r, prim, tok, w) {
    var o = X.b.create('circle', [O, r], { fixed: true, strokeColor: X.C.fg, strokeWidth: w || 1.8, highlight: false, fillColor: 'none' });
    X.reg(prim, tok, o, { strokeColor: X.C.fg, strokeWidth: w || 1.8 }, { strokeColor: X.C.acc, strokeWidth: 4 }); return o;
  }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  /* треугольник и его величины */
  function tri(X, S, lim) {
    var A = X.P('A', S.A, [-6, 10]), B = X.P('B', S.B, [-22, -14]), C = X.P('C', S.C, [8, -14]);
    var T = { A: A, B: B, C: C };
    T.a = function () { return G.dist(B, C); }; T.b = function () { return G.dist(A, C); }; T.c = function () { return G.dist(A, B); };
    T.p = function () { return (T.a() + T.b() + T.c()) / 2; }; T.S = function () { return area(A, B, C); };
    T.r = function () { return T.S() / T.p(); }; T.R = function () { return T.a() * T.b() * T.c() / (4 * T.S()); };
    T.ang = function () { return [G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)]; };
    T.I = function () { var s = 2 * T.p(); return [(T.a() * A.X() + T.b() * B.X() + T.c() * C.X()) / s, (T.a() * A.Y() + T.b() * B.Y() + T.c() * C.Y()) / s]; };
    T.Ex = function (k) {   /* центр вневписанной, k = 0,1,2 для A,B,C */
      var w = [T.a(), T.b(), T.c()]; w[k] = -w[k]; var s = w[0] + w[1] + w[2];
      return [(w[0] * A.X() + w[1] * B.X() + w[2] * C.X()) / s, (w[0] * A.Y() + w[1] * B.Y() + w[2] * C.Y()) / s];
    };
    G.guard(X.b, [A, B, C], function () { return T.S() > 3 && T.a() < (lim || 8.5) && T.b() < (lim || 8.5) && T.c() < (lim || 8.5); });
    X.seg(A, B, 'AB', 'tri', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
    return T;
  }
  /* анимация: вершина C описывает эллипс вокруг своего начального положения, треугольник «дышит» */
  function sway(X, T, steps) {
    var c0 = null;
    X.anim({ label: 'Деформировать треугольник', dur: 10000, t0: null,
      steps: steps || [[0, 'Вершина C плавно обходит исходное положение'], [0.1, 'Треугольник меняется, а формулы выполняются в каждый момент']],
      set: function (t) {
        if (!c0 || t === 0) c0 = [T.C.X(), T.C.Y()];
        var ph = t * 2 * Math.PI;
        T.C.setPosition(JXG.COORDS_BY_USER, [c0[0] + 0.9 * (Math.cos(ph) - 1) * 0.5 + 0.45 * 0, c0[1] + 0.6 * Math.sin(ph)]);
      } });
  }
  function tstate() { return { A: [-1.4, 3.1], B: [-3.6, -1.2], C: [3.2, -1.0] }; }
  function sstate(S, T) { sv(S, { A: T.A, B: T.B, C: T.C }); }

  /* Рис. 14.0 — радиус описанной окружности */
  FIGS.w140 = {
    bbox: [-6.2, 6.0, 6.2, -5.4],
    state: tstate,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S, 8), A = T.A, B = T.B, C = T.C;
      var O = wp(X, 'O', function () { return G.circum(A, B, C); }, [6, 6]);
      var H = wp(X, 'H', function () { return G.foot(A, B, C); }, [-6, -18]);
      circ(X, O, function () { return T.R(); }, 'cir', 'cir', 1.8);
      X.seg(A, H, 'AH', 'h', 1.5, { dash: 2 }, 4);
      pts(X, [['A', A], ['B', B], ['C', C], ['O', O], ['H', H]]);
      sway(X, T);
      b.on('update', function () {
        sstate(S, T);
        var a = T.a(), bb = T.b(), c = T.c(), s = T.S(), an = T.ang(), R = T.R();
        var f1 = a / (2 * Math.sin(an[0])), f2 = a * bb * c / (4 * Math.sqrt(T.p() * (T.p() - a) * (T.p() - bb) * (T.p() - c)));
        var f3 = Math.sqrt(s / (2 * Math.sin(an[0]) * Math.sin(an[1]) * Math.sin(an[2]))), f4 = bb * c / (2 * G.dist(A, H));
        X.ro([[['R (по построению)', G.f2(G.dist(O, A))]],
              [['a / 2sin A', G.f2(f1) + ' ' + ok(eq(f1, G.dist(O, A), 0.01))], ['abc / 4S', G.f2(f2) + ' ' + ok(eq(f2, G.dist(O, A), 0.01))]],
              [['√(S / 2sinA sinB sinC)', G.f2(f3) + ' ' + ok(eq(f3, G.dist(O, A), 0.01))], ['bc / 2hₐ', G.f2(f4) + ' ' + ok(eq(f4, G.dist(O, A), 0.01))]]]);
      });
    }
  };

  /* Рис. 14.1, 14.1а — вписанная окружность */
  FIGS.w141 = {
    bbox: [-5.4, 5.2, 5.4, -3.2],
    state: tstate,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S, 8), A = T.A, B = T.B, C = T.C;
      var O = wp(X, 'O', T.I, [8, 6]);
      var A1 = wp(X, 'A<sub>1</sub>', function () { return G.foot(O, B, C); }, [-4, -20]);
      var B1 = wp(X, 'B<sub>1</sub>', function () { return G.foot(O, C, A); }, [8, 6]);
      var C1 = wp(X, 'C<sub>1</sub>', function () { return G.foot(O, A, B); }, [-24, 4]);
      circ(X, O, function () { return T.r(); }, 'cir', 'cir', 1.8);
      X.seg(O, A, 'OA', 'bis', 1.3, { dash: 3 }, 4); X.seg(O, B, 'OB', 'bis', 1.3, { dash: 3 }, 4); X.seg(O, C, 'OC', 'bis', 1.3, { dash: 3 }, 4);
      X.seg(O, A1, 'OA1', 'rad', 1.3, { dash: 2 }, 4); X.seg(O, B1, 'OB1', 'rad', 1.3, { dash: 2 }, 4); X.seg(O, C1, 'OC1', 'rad', 1.3, { dash: 2 }, 4);
      X.seg(A1, B1, 'A1B1', 'int', 1.6, {}, 4.5); X.seg(B1, C1, 'B1C1', 'int', 1.6, {}, 4.5); X.seg(C1, A1, 'C1A1', 'int', 1.6, {}, 4.5);
      pts(X, [['A', A], ['B', B], ['C', C], ['O', O], ['A1', A1], ['B1', B1], ['C1', C1]]);
      sway(X, T);
      b.on('update', function () {
        sstate(S, T);
        var p = T.p(), a = T.a(), bb = T.b(), c = T.c(), an = T.ang(), r = T.r(), rr = G.dist(O, A1);
        var cot = function (x) { return 1 / Math.tan(x / 2); };
        X.ro([[['r = S/p', G.f2(r) + ' ' + ok(eq(r, rr, 0.01))]],
              [['(p − a)tg(A/2)', G.f2((p - a) * Math.tan(an[0] / 2)) + ' ' + ok(eq((p - a) * Math.tan(an[0] / 2), r, 0.01))], ['(p − b)tg(B/2)', G.f2((p - bb) * Math.tan(an[1] / 2)) + ' ' + ok(eq((p - bb) * Math.tan(an[1] / 2), r, 0.01))]],
              [['c / (ctg A/2 + ctg B/2)', G.f2(c / (cot(an[0]) + cot(an[1]))) + ' ' + ok(eq(c / (cot(an[0]) + cot(an[1])), r, 0.01))]],
              [['∠AOB', dg(G.ang(O, A, B))], ['90° + C/2', dg(Math.PI / 2 + an[2] / 2) + ' ' + ok(eq(G.ang(O, A, B), Math.PI / 2 + an[2] / 2, 0.004))]],
              [['B₁C₁', G.f2(G.dist(B1, C1))], ['2r·cos(A/2)', G.f2(2 * r * Math.cos(an[0] / 2)) + ' ' + ok(eq(G.dist(B1, C1), 2 * r * Math.cos(an[0] / 2), 0.01))], ['2(p−a)sin(A/2)', G.f2(2 * (p - a) * Math.sin(an[0] / 2)) + ' ' + ok(eq(G.dist(B1, C1), 2 * (p - a) * Math.sin(an[0] / 2), 0.01))]]]);
      });
    }
  };

  /* Рис. 14.2 — вписанная и вневписанная (к стороне c) окружности */
  FIGS.w142 = {
    bbox: [-6.5, 6.5, 8.5, -6.0],
    state: function () { return { A: [-0.6, 3.0], B: [-1.4, -0.2], C: [2.4, -0.4] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S, 8.5), A = T.A, B = T.B, C = T.C;
      var O1 = wp(X, 'O<sub>1</sub>', T.I, [6, 6]), O2 = wp(X, 'O<sub>c</sub>', function () { return T.Ex(2); }, [8, -16]);
      var K1 = wp(X, 'K<sub>1</sub>', function () { return G.foot(O1, B, C); }, [-4, -18]), K2 = wp(X, 'K<sub>2</sub>', function () { return G.foot(O2, B, C); }, [6, 6]);
      circ(X, O1, function () { return T.r(); }, 'ci', 'ci', 1.6); circ(X, O2, function () { return T.S() / (T.p() - T.c()); }, 'ce', 'ce', 1.6);
      var Cx = X.H(function () { return C.X() + (C.X() - K1.X()) * 0 ; }, function () { return C.Y(); });
      var Bl = X.H(function () { return B.X() - (K2.X() - B.X()) * 0.0 - (C.X() - B.X()) * 1.2; }, function () { return B.Y() - (C.Y() - B.Y()) * 1.2; });
      X.seg(Bl, K2, 'ext', 'ext', 1.4, {}, 4); X.seg(O1, K1, 'O1K1', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O2, K2, 'O2K2', 'rad', 1.2, { dash: 2 }, 3.5);
      X.seg(C, O1, 'CO1', 'bis', 1.3, { dash: 3 }, 3.5); X.seg(C, O2, 'CO2', 'bis', 1.3, { dash: 3 }, 3.5);
      pts(X, [['A', A], ['B', B], ['C', C], ['O1', O1], ['O2', O2], ['K1', K1], ['K2', K2]]);
      sway(X, T);
      b.on('update', function () {
        sstate(S, T);
        var p = T.p(), a = T.a(), bb = T.b(), c = T.c(), r = T.r(), rc = G.dist(O2, K2), s = T.S();
        X.ro([[['CK₁', G.f2(G.dist(C, K1))], ['p − c', G.f2(p - c) + ' ' + ok(eq(G.dist(C, K1), p - c, 0.01))]],
              [['CK₂', G.f2(G.dist(C, K2))], ['p', G.f2(p) + ' ' + ok(eq(G.dist(C, K2), p, 0.01))]],
              [['r / r_c', G.f2(r / rc)], ['(p − c) / p', G.f2((p - c) / p) + ' ' + ok(eq(r / rc, (p - c) / p, 0.005))]],
              [['r·p', G.f2(r * p)], ['r_c(p − c)', G.f2(rc * (p - c))], ['S', G.f2(s) + ' ' + ok(eq(r * p, s, 0.01) && eq(rc * (p - c), s, 0.01))]],
              [['r·r_c', G.f2(r * rc)], ['(p − a)(p − b)', G.f2((p - a) * (p - bb)) + ' ' + ok(eq(r * rc, (p - a) * (p - bb), 0.01))]]]);
      });
    }
  };

  /* Рис. 14.3, 14.4 — формулы Эйлера */
  FIGS.w143 = {
    bbox: [-9, 9.5, 9, -10.5],
    state: function () { return { A: [-1.2, 3.4], B: [-3.4, -0.6], C: [2.6, -0.9] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S, 7.2), A = T.A, B = T.B, C = T.C;
      var OR = wp(X, 'O<sub>R</sub>', function () { return G.circum(A, B, C); }, [6, 6]), Ir = wp(X, 'O<sub>r</sub>', T.I, [6, -18]);
      var Ja = wp(X, 'O<sub>a</sub>', function () { return T.Ex(0); }, [8, -16]);
      var M = wp(X, 'M', function () { var O = G.circum(A, B, C), u = [Ir.X() - B.X(), Ir.Y() - B.Y()], l = Math.hypot(u[0], u[1]) || 1; u = [u[0] / l, u[1] / l]; var t = -2 * ((B.X() - O[0]) * u[0] + (B.Y() - O[1]) * u[1]); return [B.X() + t * u[0], B.Y() + t * u[1]]; }, [8, -16]);
      circ(X, OR, function () { return T.R(); }, 'cR', 'cR', 1.8); circ(X, Ir, function () { return T.r(); }, 'cr', 'cr', 1.6); circ(X, Ja, function () { return T.S() / (T.p() - T.a()); }, 'ca', 'ca', 1.4);
      X.seg(B, M, 'BM', 'bis', 1.4, { dash: 3 }, 4); X.seg(M, A, 'MA', 'ma', 1.4, {}, 4); X.seg(OR, Ir, 'OO', 'eul', 2, {}, 4.5); X.seg(OR, Ja, 'OOa', 'eula', 1.6, { dash: 2 }, 4);
      pts(X, [['A', A], ['B', B], ['C', C], ['OR', OR], ['Ir', Ir], ['Ja', Ja], ['M', M]]);
      sway(X, T);
      b.on('update', function () {
        sstate(S, T);
        var R = T.R(), r = T.r(), ra = T.S() / (T.p() - T.a()), d = G.dist(OR, Ir), da = G.dist(OR, Ja);
        X.ro([[['O_rO_R', G.f2(d)], ['√(R² − 2Rr)', G.f2(Math.sqrt(Math.max(0, R * R - 2 * R * r))) + ' ' + ok(eq(d, Math.sqrt(Math.max(0, R * R - 2 * R * r)), 0.01))]],
              [['O_aO_R', G.f2(da)], ['√(R² + 2R·rₐ)', G.f2(Math.sqrt(R * R + 2 * R * ra)) + ' ' + ok(eq(da, Math.sqrt(R * R + 2 * R * ra), 0.01))]],
              [['MA', G.f2(G.dist(M, A))], ['MO_r', G.f2(G.dist(M, Ir)) + ' ' + ok(eq(G.dist(M, A), G.dist(M, Ir), 0.01))]]]);
      });
    }
  };

  /* Рис. 14.5 — тригонометрические соотношения */
  FIGS.w144 = {
    bbox: [-5.4, 5.2, 5.4, -3.2],
    state: tstate,
    build: function (X) {
      var b = X.b, S = X.S, T = tri(X, S, 8), A = T.A, B = T.B, C = T.C;
      var O = wp(X, 'O', T.I, [6, 6]);
      var Ka = wp(X, 'K<sub>a</sub>', function () { return G.foot(O, B, C); }, [-4, -20]), Kb = wp(X, 'K<sub>b</sub>', function () { return G.foot(O, C, A); }, [8, 6]), Kc = wp(X, 'K<sub>c</sub>', function () { return G.foot(O, A, B); }, [-24, 4]);
      circ(X, O, function () { return T.r(); }, 'cir', 'cir', 1.6);
      X.seg(O, Ka, 'OKa', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O, Kb, 'OKb', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O, Kc, 'OKc', 'rad', 1.2, { dash: 2 }, 3.5);
      pts(X, [['A', A], ['B', B], ['C', C], ['O', O], ['Ka', Ka], ['Kb', Kb], ['Kc', Kc]]);
      sway(X, T);
      b.on('update', function () {
        sstate(S, T);
        var p = T.p(), a = T.a(), bb = T.b(), c = T.c(), an = T.ang(), R = T.R(), r = T.r();
        var cs = Math.cos(an[0] / 2) * Math.cos(an[1] / 2) * Math.cos(an[2] / 2), sn = Math.sin(an[0] / 2) * Math.sin(an[1] / 2) * Math.sin(an[2] / 2);
        var lhs3 = a * Math.cos(an[0]) + bb * Math.cos(an[1]) + c * Math.cos(an[2]), rhs3 = 4 * R * Math.sin(an[0]) * Math.sin(an[1]) * Math.sin(an[2]);
        var k = (p - a) * (p - c) / Math.tan(an[1] / 2) / p;
        X.ro([[['cos(A/2)cos(B/2)cos(C/2)', G.f2(cs)], ['p / 4R', G.f2(p / (4 * R)) + ' ' + ok(eq(cs, p / (4 * R), 0.003))]],
              [['sin(A/2)sin(B/2)sin(C/2)', G.f2(sn)], ['r / 4R', G.f2(r / (4 * R)) + ' ' + ok(eq(sn, r / (4 * R), 0.003))]],
              [['a cos A + b cos B + c cos C', G.f2(lhs3)], ['4R sinA sinB sinC', G.f2(rhs3) + ' ' + ok(eq(lhs3, rhs3, 0.01))]],
              [['AK_b·K_bC·ctg(B/2)/p', G.f2(G.dist(A, Kb) * G.dist(Kb, C) / Math.tan(an[1] / 2) / p)], ['r', G.f2(r) + ' ' + ok(eq(G.dist(A, Kb) * G.dist(Kb, C) / Math.tan(an[1] / 2) / p, r, 0.01))]],
              [['tg(A/2)tg(B/2)tg(C/2)', G.f2(Math.tan(an[0] / 2) * Math.tan(an[1] / 2) * Math.tan(an[2] / 2))], ['r / p', G.f2(r / p) + ' ' + ok(eq(Math.tan(an[0] / 2) * Math.tan(an[1] / 2) * Math.tan(an[2] / 2), r / p, 0.003))]]]);
      });
    }
  };
})();
