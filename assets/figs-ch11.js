/* Глава 11. Метрические соотношения в параллелограмме, трапеции и произвольном четырёхугольнике */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function sv(S, o) { Object.keys(o).forEach(function (k) { S[k] = [o[k].X(), o[k].Y()]; }); }
  function cross(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function f1(x) { return isFinite(x) ? x.toFixed(1) : '—'; }

  /* трапеция ABCD: AD = a (нижнее, большее), BC = b (верхнее); D и C скользят по горизонталям */
  function trap(X, S, minDiff, extraPred) {
    var b = X.b;
    var A = X.P('A', S.A, [-22, -16]), B = X.P('B', S.B, [-24, 4]);
    var Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
    var Bh = X.H(function () { return B.X() + 1; }, function () { return B.Y(); });
    var D = X.G('D', S.D, b.create('line', [A, Ah], { visible: false }), [8, -16]);
    var C = X.G('C', S.C, b.create('line', [B, Bh], { visible: false }), [8, 6]);
    var T = { A: A, B: B, C: C, D: D };
    T.a = function () { return D.X() - A.X(); }; T.b = function () { return C.X() - B.X(); };
    T.h = function () { return B.Y() - A.Y(); };
    G.guard(b, [A, B, D, C], function () {
      if (T.a() < 2.5 || T.b() < 0.8 || T.h() < 0.9 || T.h() > 4.6 || T.a() - T.b() < (minDiff || 0.4)) return false;
      return extraPred ? extraPred(T) : true;
    });
    X.seg(A, B, 'sAB', 'sides', 2, {}, 4.5); X.seg(B, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
    return T;
  }
  function tstate() { return { A: [-4.2, -1.2], D: [4.2, -1.2], B: [-1.9, 1.4], C: [1.7, 1.4] }; }
  function tsv(S, T) { sv(S, { A: T.A, B: T.B, C: T.C, D: T.D }); }

  /* Рис. 11.1 — прямая через точку пересечения диагоналей и боковых сторон */
  FIGS.t111 = {
    bbox: [-6.2, 7.6, 6.2, -2.4],
    state: tstate,
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S, 0.9, function (T) { var s = T.h() * T.a() / (T.a() - T.b()); return s < 8; });
      var A = T.A, B = T.B, C = T.C, D = T.D;
      var Sx = wp(X, 'S', function () { return G.inter(xy(A), dir(A, B), xy(D), dir(D, C)); }, [8, 8]);
      var O = wp(X, 'O', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [8, -16]);
      var K = wp(X, 'K', function () { return G.inter(xy(Sx), dir(Sx, O), xy(B), dir(B, C)); }, [8, -16]);
      var L = wp(X, 'L', function () { return G.inter(xy(Sx), dir(Sx, O), xy(A), dir(A, D)); }, [-6, -20]);
      var E = wp(X, 'E', function () { return G.inter(xy(O), [1, 0], xy(A), dir(A, B)); }, [-22, 4]);
      var M = wp(X, 'M', function () { return G.inter(xy(O), [1, 0], xy(D), dir(D, C)); }, [8, 4]);
      X.seg(A, C, 'AC', 'diag', 1.3, { dash: 0 }, 3.5); X.seg(B, D, 'BD', 'diag', 1.3, {}, 3.5);
      X.seg(B, Sx, 'BS', 'ext', 1.4, { dash: 2 }, 3.5); X.seg(C, Sx, 'CS', 'ext', 1.4, { dash: 2 }, 3.5);
      X.seg(Sx, L, 'SL', 'axis', 1.6, { dash: 2 }, 4.5); X.seg(E, M, 'EM', 'par', 1.6, { dash: 3 }, 4.5);
      X.tick(B, K, 1); X.tick(K, C, 1); X.tick(A, L, 2); X.tick(L, D, 2); X.tick(E, O, 3); X.tick(O, M, 3);
      [['A', A], ['B', B], ['C', C], ['D', D], ['S', Sx], ['O', O], ['K', K], ['L', L], ['E', E], ['M', M]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      X.alias('halves', ['SL']);
      b.on('update', function () {
        tsv(S, T);
        var eo = G.dist(E, O), om = G.dist(O, M), bk = G.dist(B, K), kc = G.dist(K, C), al = G.dist(A, L), ld = G.dist(L, D);
        X.ro([[['EO', G.f2(eo)], ['OM', G.f2(om) + ' ' + ok(eq(eo, om, 0.004))]],
              [['BK', G.f2(bk)], ['KC', G.f2(kc) + ' ' + ok(eq(bk, kc, 0.004))]],
              [['AL', G.f2(al)], ['LD', G.f2(ld) + ' ' + ok(eq(al, ld, 0.004))]]]);
      });
    }
  };

  /* Рис. 11.2 — сумма квадратов диагоналей трапеции */
  FIGS.t112 = {
    bbox: [-6.2, 3.8, 6.2, -2.6],
    state: tstate,
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S, 0.4), A = T.A, B = T.B, C = T.C, D = T.D;
      X.seg(B, D, 'BD', 'd1', 1.8, { dash: 0 }, 4.5); X.seg(A, C, 'AC', 'd2', 1.8, { dash: 0 }, 4.5);
      [['A', A], ['B', B], ['C', C], ['D', D]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      X.alias('legs', ['sAB', 'sCD']);
      b.on('update', function () {
        tsv(S, T);
        var a = T.a(), bb = T.b(), m = G.dist(A, B), n = G.dist(C, D), d1 = G.dist(B, D), d2 = G.dist(A, C);
        var l = d1 * d1 + d2 * d2, r = m * m + n * n + 2 * a * bb;
        X.ro([[['a', G.f2(a)], ['b', G.f2(bb)], ['m', G.f2(m)], ['n', G.f2(n)]],
              [['d₁² + d₂²', G.f2(l)], ['m² + n² + 2ab', G.f2(r) + ' ' + ok(eq(l, r, 0.02))]]]);
      });
    }
  };

  /* Рис. 11.2а — отрезок EF через точку пересечения диагоналей; свойство коэффициентов подобия */
  FIGS.t113 = {
    bbox: [-6.2, 3.8, 6.2, -2.6],
    state: function () { var s = tstate(); s.R = 0.45; return s; },
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S, 0.5), A = T.A, B = T.B, C = T.C, D = T.D;
      var Q = wp(X, 'Q', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [-4, 8]);
      var E = wp(X, 'E', function () { return G.inter(xy(Q), [1, 0], xy(A), dir(A, B)); }, [-22, 2]);
      var F = wp(X, 'F', function () { return G.inter(xy(Q), [1, 0], xy(D), dir(D, C)); }, [8, 2]);
      var Ac = b.create('segment', [A, C], { visible: false });
      var R = X.G('R', [A.X() + (C.X() - A.X()) * S.R, A.Y() + (C.Y() - A.Y()) * S.R], Ac, [-4, -18]);
      G.guard(b, [R], function () { var t = (R.X() - A.X()) / (C.X() - A.X()); return t > 0.12 && t < 0.88; });
      var E2 = wp(X, 'E′', function () { return G.inter(xy(R), [1, 0], xy(A), dir(A, B)); }, [-24, 2]);
      var F2 = wp(X, 'F′', function () { return G.inter(xy(R), [1, 0], xy(D), dir(D, C)); }, [8, 2]);
      X.seg(A, C, 'AC', 'diag', 1.5, {}, 4); X.seg(B, D, 'BD', 'diag', 1.5, {}, 4);
      X.seg(E, F, 'EF', 'ef', 1.8, { dash: 2 }, 4.5); X.seg(E2, F2, 'E2F2', 'ef2', 1.8, { dash: 3 }, 4.5);
      X.tick(E, Q, 1); X.tick(Q, F, 1);
      [['A', A], ['B', B], ['C', C], ['D', D], ['Q', Q], ['E', E], ['F', F], ['R', R], ['E2', E2], ['F2', F2]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0] === 'E2' ? 'E2' : p[0] === 'F2' ? 'F2' : p[0]); });
      b.on('update', function () {
        tsv(S, T); S.R = (R.X() - A.X()) / (C.X() - A.X());
        var a = T.a(), bb = T.b(), eq1 = G.dist(E, Q), qf = G.dist(Q, F), hm = a * bb / (a + bb);
        var k1 = G.dist(A, R) / G.dist(A, C), k2 = G.dist(C, R) / G.dist(A, C);
        var eq2 = G.dist(E2, R), rf = G.dist(R, F2);
        X.ro([[['EQ', G.f2(eq1)], ['QF', G.f2(qf)], ['ab/(a+b)', G.f2(hm) + ' ' + ok(eq(eq1, hm, 0.01) && eq(qf, hm, 0.01))]],
              [['EF', G.f2(eq1 + qf)], ['2ab/(a+b)', G.f2(2 * hm) + ' ' + ok(eq(eq1 + qf, 2 * hm, 0.02))]],
              [['k₁ = AR/AC', G.f2(k1)], ['k₂ = CR/AC', G.f2(k2)], ['k₁ + k₂', G.f2(k1 + k2) + ' ' + ok(eq(k1 + k2, 1, 0.002))]],
              [['E′R / b', G.f2(eq2 / bb)], ['RF′ / a', G.f2(rf / a)], ['сумма', G.f2(eq2 / bb + rf / a) + ' ' + ok(eq(eq2 / bb + rf / a, 1, 0.003))]]]);
      });
    }
  };

  /* Рис. 11.2б,в — деление трапеции на две подобные и на две равновеликие */
  FIGS.t114 = {
    bbox: [-6.2, 4.8, 6.2, -2.6],
    state: function () { return { A: [-4.6, -1.4], D: [4.6, -1.4], B: [-1.6, 2.6], C: [1.5, 2.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, T = trap(X, S, 1.2), A = T.A, B = T.B, C = T.C, D = T.D;
      function at(t, side) { return function () { return side === 'L' ? [A.X() + (B.X() - A.X()) * t(), A.Y() + (B.Y() - A.Y()) * t()] : [D.X() + (C.X() - D.X()) * t(), D.Y() + (C.Y() - D.Y()) * t()]; }; }
      function t1() { var a = T.a(), bb = T.b(); return Math.sqrt(a) / (Math.sqrt(a) + Math.sqrt(bb)); }                        /* доля h снизу: h2/h */
      function t2() { var a = T.a(), bb = T.b(), x = Math.sqrt((a * a + bb * bb) / 2); return 1 - (x - bb) / (a - bb); }          /* h2/h */
      var E1 = wp(X, 'E', at(t1, 'L'), [-22, 2]), F1 = wp(X, 'F', at(t1, 'R'), [8, 2]);
      var E2 = wp(X, 'E′', at(t2, 'L'), [-26, -14]), F2 = wp(X, 'F′', at(t2, 'R'), [8, -16]);
      X.seg(E1, F1, 'EF', 'sim', 2, { dash: 2 }, 4.5); X.seg(E2, F2, 'E2F2', 'eqa', 2, { dash: 3 }, 4.5);
      [['A', A], ['B', B], ['C', C], ['D', D], ['E', E1], ['F', F1], ['E2', E2], ['F2', F2]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        tsv(S, T);
        var a = T.a(), bb = T.b(), h = T.h();
        var ef = G.dist(E1, F1), h1 = B.Y() - E1.Y(), h2 = E1.Y() - A.Y();
        var ef2 = G.dist(E2, F2), g1 = B.Y() - E2.Y(), g2 = E2.Y() - A.Y();
        var s1 = (bb + ef2) / 2 * g1, s2 = (a + ef2) / 2 * g2;
        X.ro([[['EF', G.f2(ef)], ['√(ab)', G.f2(Math.sqrt(a * bb)) + ' ' + ok(eq(ef, Math.sqrt(a * bb), 0.01))]],
              [['b / EF', G.f2(bb / ef)], ['EF / a', G.f2(ef / a)], ['h₁ / h₂', G.f2(h1 / h2) + ' ' + ok(eq(bb / ef, ef / a, 0.01) && eq(bb / ef, h1 / h2, 0.02))]],
              [['E′F′', G.f2(ef2)], ['√((a²+b²)/2)', G.f2(Math.sqrt((a * a + bb * bb) / 2)) + ' ' + ok(eq(ef2, Math.sqrt((a * a + bb * bb) / 2), 0.01))]],
              [['S верхней', G.f2(s1)], ['S нижней', G.f2(s2) + ' ' + ok(eq(s1, s2, 0.02))]]]);
      });
    }
  };

  /* Рис. 11.2д — трапеция с α + β = 90° */
  FIGS.t115 = {
    bbox: [-6.2, 5.0, 6.2, -1.8],
    state: function () { return { A: [-4.6, -0.8], D: [4.6, -0.8], S: [-0.6, 3.5], T: 0.42 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -16]), Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
      var Dd = X.G('D', S.D, b.create('line', [A, Ah], { visible: false }), [8, -16]), D = Dd;
      var Mid = X.H(function () { return (A.X() + Dd.X()) / 2; }, function () { return A.Y(); });
      var Dh = X.H(function () { return Dd.X(); }, function () { return A.Y(); });
      var circ = b.create('circle', [Mid, Dh], { visible: false });
      var Sx = X.G('S', S.S, circ, [-4, 8]);
      var AS = b.create('segment', [A, Sx], { visible: false });
      var Bp = X.G('B', [A.X() + (Sx.X() - A.X()) * S.T, A.Y() + (Sx.Y() - A.Y()) * S.T], AS, [-24, 4]);
      function tt() { return G.dist(A, Bp) / G.dist(A, Sx); }
      var C = wp(X, 'C', function () { var t = tt(); return [Dh.X() + (Sx.X() - Dh.X()) * t, Dh.Y() + (Sx.Y() - Dh.Y()) * t]; }, [8, 4]);
      G.guard(b, [A, Dd, Sx, Bp], function () {
        var a = Dd.X() - A.X(); if (a < 4 || Math.abs(Dd.Y() - A.Y()) > 1e-6 && false) return false;
        var al = G.ang(A, Dd, Sx), be = G.ang(Dd, A, Sx), t = tt();
        return Sx.Y() > A.Y() + 0.8 && al > 0.35 && be > 0.35 && t > 0.2 && t < 0.85;
      });
      var K = X.D('K', function () { return (Bp.X() + C.X()) / 2; }, function () { return (Bp.Y() + C.Y()) / 2; }, [6, -16]);
      var L = X.D('L', function () { return (A.X() + D.X()) / 2; }, function () { return A.Y(); }, [-4, -20]);
      X.seg(A, Bp, 'sAB', 'sides', 2, {}, 4.5); X.seg(Bp, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
      X.seg(Bp, Sx, 'BS', 'ext', 1.4, { dash: 2 }, 3.5); X.seg(C, Sx, 'CS', 'ext', 1.4, { dash: 2 }, 3.5);
      X.seg(Sx, K, 'SK', 'sk', 1.8, { dash: 3 }, 4.5); X.seg(K, L, 'KL', 'kl', 1.8, { dash: 3 }, 4.5);
      X.right(Sx, A, D, 0.35, 'rS', 'rS');
      X.ang(A, D, Sx, 0.75, 'α', 'aA', 'al'); X.ang(D, Sx, A, 0.75, 'β', 'aD', 'be');
      [['A', A], ['B', Bp], ['C', C], ['D', D], ['S', Sx], ['K', K], ['L', L]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      X.alias('half', ['SK', 'KL']);
      b.on('update', function () {
        S.A = xy(A); S.D = xy(Dd); S.S = xy(Sx); S.T = tt();
        var a = G.dist(A, D), bb = G.dist(Bp, C), sk = G.dist(Sx, K), sl = G.dist(Sx, L), lk = G.dist(L, K);
        X.ro([[['α + β', G.deg(G.ang(A, D, Sx) + G.ang(D, A, Sx))], ['∠ASD', G.deg(G.ang(Sx, A, D)) + ' ' + ok(eq(G.ang(Sx, A, D), Math.PI / 2, 0.004))]],
              [['SK', G.f2(sk)], ['b / 2', G.f2(bb / 2) + ' ' + ok(eq(sk, bb / 2, 0.01))]],
              [['SL', G.f2(sl)], ['a / 2', G.f2(a / 2) + ' ' + ok(eq(sl, a / 2, 0.01))]],
              [['LK', G.f2(lk)], ['(a − b) / 2', G.f2((a - bb) / 2) + ' ' + ok(eq(lk, (a - bb) / 2, 0.01))]]]);
      });
    }
  };

  /* Рис. 11.2е — числовая задача: AD = 49, BC = 21, AB = 20 */
  FIGS.t116 = {
    bbox: [-16, 36, 66, -54],
    state: function () { return {}; },
    build: function (X) {
      var b = X.b, SS = 35, AD = 49, sx = SS * SS / AD, sy = SS * Math.sqrt(AD * AD - SS * SS) / AD;
      var A = X.D('A', function () { return 0; }, function () { return 0; }, [-20, -16]);
      var D = X.D('D', function () { return AD; }, function () { return 0; }, [6, -16]);
      var Sx = X.D('Q', function () { return sx; }, function () { return sy; }, [-4, 8]);
      var B = X.D('B', function () { return sx * 20 / 35; }, function () { return sy * 20 / 35; }, [-24, 2]);
      var C = X.D('C', function () { return AD + (sx - AD) * 4 / 7; }, function () { return sy * 4 / 7; }, [8, 4]);
      var E = X.D('E', function () { return B.X() / 2; }, function () { return B.Y() / 2; }, [-22, 2]);
      var ux = sx / 35, uy = sy / 35, nx = uy, ny = -ux, eo = Math.sqrt(625 - 100);
      var O = X.D('O', function () { return E.X() + nx * eo; }, function () { return E.Y() + ny * eo; }, [-22, 8]);
      /* точка касания K: основание перпендикуляра из O на CD */
      var K = X.D('K', function () { return G.foot(O, C, D)[0]; }, function () { return G.foot(O, C, D)[1]; }, [8, -4]);
      var circ = b.create('circle', [O, 25], { fixed: true, strokeColor: X.C.fg, strokeWidth: 1.8, highlight: false });
      X.reg('circ', 'circ', circ, { strokeColor: X.C.fg, strokeWidth: 1.8 }, { strokeColor: X.C.acc, strokeWidth: 4 });
      X.seg(A, B, 'sAB', 'sides', 2, {}, 4.5); X.seg(B, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
      X.seg(B, Sx, 'BQ', 'ext', 1.2, { dash: 2 }, 3.5); X.seg(C, Sx, 'CQ', 'ext', 1.2, { dash: 2 }, 3.5);
      X.seg(O, E, 'OE', 'rad', 1.4, { dash: 2 }, 4); X.seg(O, K, 'OK', 'rad', 1.6, { dash: 0 }, 4); X.seg(Sx, E, 'QE', 'qe', 1.4, { dash: 3 }, 4);
      [['A', A], ['B', B], ['C', C], ['D', D], ['Q', Sx], ['E', E], ['O', O], ['K', K]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        var r1 = G.dist(O, A), r2 = G.dist(O, B), r3 = G.dist(O, K), qe = G.dist(Sx, E);
        X.ro([[['AB', G.f2(G.dist(A, B))], ['BC', G.f2(G.dist(B, C))], ['AD', G.f2(G.dist(A, D))]],
              [['∠A + ∠D', G.deg(G.ang(A, D, B) + G.ang(D, A, C))]],
              [['OA', G.f2(r1)], ['OB', G.f2(r2)], ['OK', G.f2(r3)], ['R', '25 ' + ok(eq(r1, 25, 0.02) && eq(r2, 25, 0.02) && eq(r3, 25, 0.02))]],
              [['QE', G.f2(qe)], ['OK ⟂ CD', G.deg(G.ang(K, O, C)) + ' / ' + G.deg(G.ang(K, O, D))]]]);
      });
    }
  };

  /* Рис. 11.2ж — перпендикулярные диагонали трапеции */
  FIGS.t117 = {
    bbox: [-6.2, 5.6, 6.2, -1.8],
    state: function () { return { A: [-4.6, -0.8], D: [4.6, -0.8], Q: [1.0, 2.1], s: 0.45 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -16]), Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
      var Dd = X.G('D', S.D, b.create('line', [A, Ah], { visible: false }), [8, -16]), D = Dd;
      var Mid = X.H(function () { return (A.X() + Dd.X()) / 2; }, function () { return A.Y(); });
      var Dh = X.H(function () { return Dd.X(); }, function () { return A.Y(); });
      var Q = X.G('Q', S.Q, b.create('circle', [Mid, Dh], { visible: false }), [6, 6]);
      var DQ = b.create('line', [D, Q], { visible: false });
      var Bp = X.G('B', [Q.X() + (Q.X() - D.X()) * S.s, Q.Y() + (Q.Y() - D.Y()) * S.s], DQ, [-24, 4]);
      function sr() { return G.dist(Q, Bp) / G.dist(Q, D); }
      var C = wp(X, 'C', function () { var s = sr(); return [Q.X() + (Q.X() - A.X()) * s, Q.Y() + (Q.Y() - A.Y()) * s]; }, [8, 4]);
      G.guard(b, [A, Dd, Q, Bp], function () {
        var a = Dd.X() - A.X(), s = sr();
        var beyond = (Bp.X() - Q.X()) * (Q.X() - D.X()) + (Bp.Y() - Q.Y()) * (Q.Y() - D.Y()) > 0;
        return a > 4 && Q.Y() > A.Y() + 0.8 && G.ang(A, Dd, Q) > 0.4 && G.ang(Dd, A, Q) > 0.4 && beyond && s > 0.25 && s < 0.88;
      });
      var K = X.D('K', function () { return (Bp.X() + C.X()) / 2; }, function () { return (Bp.Y() + C.Y()) / 2; }, [6, 6]);
      var L = X.D('L', function () { return (A.X() + D.X()) / 2; }, function () { return A.Y(); }, [-4, -20]);
      X.seg(A, Bp, 'sAB', 'sides', 2, {}, 4.5); X.seg(Bp, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
      X.seg(A, C, 'AC', 'diag', 1.5, {}, 4); X.seg(Bp, D, 'BD', 'diag', 1.5, {}, 4);
      X.seg(K, L, 'KL', 'kl', 1.8, { dash: 3 }, 4.5);
      X.right(Q, A, D, 0.35, 'rQ', 'rQ');
      [['A', A], ['B', Bp], ['C', C], ['D', D], ['Q', Q], ['K', K], ['L', L]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        S.A = xy(A); S.D = xy(Dd); S.Q = xy(Q); S.s = sr();
        var a = G.dist(A, D), bb = G.dist(Bp, C), lk = G.dist(L, K), qk = G.dist(Q, K), ql = G.dist(Q, L);
        X.ro([[['∠(AC, BD)', G.deg(G.ang(Q, A, Bp))], ['QK', G.f2(qk)], ['b / 2', G.f2(bb / 2) + ' ' + ok(eq(qk, bb / 2, 0.01))]],
              [['QL', G.f2(ql)], ['a / 2', G.f2(a / 2) + ' ' + ok(eq(ql, a / 2, 0.01))]],
              [['LK', G.f2(lk)], ['(a + b) / 2', G.f2((a + bb) / 2) + ' ' + ok(eq(lk, (a + bb) / 2, 0.01))]]]);
      });
    }
  };

  /* Рис. 11.3 — равнобокая трапеция */
  FIGS.t118 = {
    bbox: [-6.2, 4.0, 6.2, -1.8],
    state: function () { return { D: [4.4, 0], C: [1.7, 2.3] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var D = X.G('D', S.D, b.create('line', [[0, 0], [1, 0]], { visible: false }), [8, -16]);
      var C = X.P('C', S.C, [8, 6]);
      var A = X.D('A', function () { return -D.X(); }, function () { return 0; }, [-22, -16]);
      var B = X.D('B', function () { return -C.X(); }, function () { return C.Y(); }, [-24, 6]);
      var C1 = X.D('C<sub>1</sub>', function () { return C.X(); }, function () { return 0; }, [-6, -18]);
      var B1 = X.D('B<sub>1</sub>', function () { return -C.X(); }, function () { return 0; }, [-6, -18]);
      G.guard(b, [D, C], function () { return D.X() > 2 && C.X() > 0.4 && D.X() - C.X() > 0.5 && C.Y() > 0.9 && C.Y() < 3.8; });
      X.seg(A, B, 'sAB', 'sides', 2, {}, 4.5); X.seg(B, C, 'sBC', 'tb', 2, {}, 4.5); X.seg(C, D, 'sCD', 'sides', 2, {}, 4.5); X.seg(D, A, 'sDA', 'ta', 2, {}, 4.5);
      X.seg(B, B1, 'BB1', 'hh', 1.4, { dash: 2 }, 3.5); X.seg(C, C1, 'CC1', 'hh', 1.4, { dash: 2 }, 3.5);
      X.seg(A, C, 'AC', 'diag', 1.5, {}, 4); X.seg(B, D, 'BD', 'diag', 1.5, {}, 4);
      X.right(B1, A, B, 0.3, 'rB', 'rB'); X.right(C1, C, D, 0.3, 'rC', 'rC');
      [['A', A], ['B', B], ['C', C], ['D', D], ['B1', B1], ['C1', C1]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      X.alias('half', ['AB1', 'C1D', 'AC1']);
      b.on('update', function () {
        S.D = xy(D); S.C = xy(C);
        var a = G.dist(A, D), bb = G.dist(B, C), n = G.dist(C, D), d = G.dist(A, C);
        var ac1 = G.dist(A, C1), cd = G.ang(D, C, A);
        X.ro([[['AC₁', G.f2(ac1)], ['(a + b) / 2', G.f2((a + bb) / 2) + ' ' + ok(eq(ac1, (a + bb) / 2, 0.01))]],
              [['d²', G.f2(d * d)], ['n² + ab', G.f2(n * n + a * bb) + ' ' + ok(eq(d * d, n * n + a * bb, 0.03))]],
              [['cos D', G.f2(Math.cos(cd))], ['(a − b) / 2n', G.f2((a - bb) / (2 * n)) + ' ' + ok(eq(Math.cos(cd), (a - bb) / (2 * n), 0.004))]]]);
      });
    }
  };

  /* общий четырёхугольник ABCD (выпуклый) */
  function quad(X, S, pred) {
    var b = X.b;
    var A = X.P('A', S.A, [-22, -16]), B = X.P('B', S.B, [-24, 4]), C = X.P('C', S.C, [8, 4]), D = X.P('D', S.D, [8, -16]);
    G.guard(b, [A, B, C, D], function () {
      var c1 = cross(A, B, C), c2 = cross(B, C, D), c3 = cross(C, D, A), c4 = cross(D, A, B);
      var cv = (c1 > 0.5 && c2 > 0.5 && c3 > 0.5 && c4 > 0.5) || (c1 < -0.5 && c2 < -0.5 && c3 < -0.5 && c4 < -0.5);
      return cv && (pred ? pred(A, B, C, D) : true);
    });
    X.seg(A, B, 'AB', 'sAB', 2, {}, 4.5); X.seg(B, C, 'BC', 'sBC', 2, {}, 4.5); X.seg(C, D, 'CD', 'sCD', 2, {}, 4.5); X.seg(D, A, 'DA', 'sDA', 2, {}, 4.5);
    return { A: A, B: B, C: C, D: D };
  }
  function qstate() { return { A: [-4.0, -1.6], B: [-2.6, 3.2], C: [2.8, 2.5], D: [4.4, -1.4] }; }
  function qsv(S, Q) { sv(S, Q); }

  /* Рис. 11.4 — теорема Эйлера */
  FIGS.q114 = {
    bbox: [-6.2, 4.8, 6.2, -3.0],
    state: qstate,
    build: function (X) {
      var b = X.b, S = X.S, Q = quad(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      var E = X.D('E', function () { return (A.X() + C.X()) / 2; }, function () { return (A.Y() + C.Y()) / 2; }, [-22, 6]);
      var F = X.D('F', function () { return (B.X() + D.X()) / 2; }, function () { return (B.Y() + D.Y()) / 2; }, [6, -16]);
      X.seg(A, C, 'AC', 'd1', 1.5, { dash: 0 }, 4); X.seg(B, D, 'BD', 'd2', 1.5, { dash: 0 }, 4); X.seg(E, F, 'EF', 't', 2.2, {}, 5);
      [['A', A], ['B', B], ['C', C], ['D', D], ['E', E], ['F', F]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      X.alias('sides', ['AB', 'BC', 'CD', 'DA']);
      b.on('update', function () {
        qsv(S, Q);
        var s = Math.pow(G.dist(A, B), 2) + Math.pow(G.dist(B, C), 2) + Math.pow(G.dist(C, D), 2) + Math.pow(G.dist(D, A), 2);
        var d1 = G.dist(A, C), d2 = G.dist(B, D), t = G.dist(E, F), r = d1 * d1 + d2 * d2 + 4 * t * t;
        X.ro([[['a² + b² + c² + g²', G.f2(s)]], [['d₁² + d₂² + 4t²', G.f2(r) + ' ' + ok(eq(s, r, 0.03))]], [['t = EF', G.f2(t)]]]);
      });
    }
  };

  /* Рис. 11.5 — первая теорема косинусов для четырёхугольника */
  FIGS.q115 = {
    bbox: [-6.4, 7.2, 6.4, -2.4],
    state: function () { return { A: [-4.0, -1.4], B: [-2.2, 2.6], C: [1.3, 3.0], D: [4.2, -1.4] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var Q = quad(X, S, function (A, B, C, D) {
        var m = G.inter(xy(A), dir(A, B), xy(D), dir(D, C));
        var t1 = ((m[0] - B.X()) * (B.X() - A.X()) + (m[1] - B.Y()) * (B.Y() - A.Y())) > 0, t2 = ((m[0] - C.X()) * (C.X() - D.X()) + (m[1] - C.Y()) * (C.Y() - D.Y())) > 0;
        return t1 && t2 && Math.hypot(m[0], m[1]) < 8.5 && G.ang(A, B, D) > 0.25 && G.ang(D, A, C) > 0.25;
      });
      var A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      var M = wp(X, 'M', function () { return G.inter(xy(A), dir(A, B), xy(D), dir(D, C)); }, [-6, 8]);
      X.seg(B, M, 'BM', 'ext', 1.4, { dash: 2 }, 3.5); X.seg(C, M, 'CM', 'ext', 1.4, { dash: 2 }, 3.5);
      X.ang(B, A, C, 0.55, 'B', 'aB', 'B'); X.ang(C, B, D, 0.55, 'C', 'aC', 'C'); X.ang(M, A, D, 0.9, 'M', 'aM', 'M');
      [['A', A], ['B', B], ['C', C], ['D', D], ['M', M]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      b.on('update', function () {
        qsv(S, Q);
        var ab = G.dist(A, B), bc = G.dist(B, C), cd = G.dist(C, D), ad = G.dist(A, D);
        var aB = G.ang(B, A, C), aC = G.ang(C, B, D), aM = G.ang(M, A, D);
        var l = ad * ad, r = ab * ab + bc * bc + cd * cd - 2 * ab * bc * Math.cos(aB) - 2 * bc * cd * Math.cos(aC) - 2 * ab * cd * Math.cos(aM);
        X.ro([[['∠B', G.deg(aB)], ['∠C', G.deg(aC)], ['∠M', G.deg(aM)]],
              [['AD²', G.f2(l)], ['AB² + BC² + CD² − 2AB·BC·cos B − 2BC·CD·cos C − 2AB·CD·cos M', G.f2(r) + ' ' + ok(eq(l, r, 0.03))]]]);
      });
    }
  };

  /* Рис. 11.6 — теорема Бретшнейдера */
  FIGS.q116 = {
    bbox: [-6.2, 4.8, 6.2, -3.0],
    state: qstate,
    build: function (X) {
      var b = X.b, S = X.S, Q = quad(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      X.seg(A, C, 'AC', 'diag', 1.6, { dash: 2 }, 4.5); X.seg(B, D, 'BD', 'diag', 1.6, { dash: 2 }, 4.5);
      X.ang(A, B, D, 0.5, 'A', 'aA', 'A'); X.ang(B, C, A, 0.5, 'B', 'aB', 'B'); X.ang(C, D, B, 0.5, 'C', 'aC', 'C'); X.ang(D, A, C, 0.5, 'D', 'aD', 'D');
      [['A', A], ['B', B], ['C', C], ['D', D]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      X.alias('sides', ['AB', 'BC', 'CD', 'DA']);
      b.on('update', function () {
        qsv(S, Q);
        var a = G.dist(A, B), bb = G.dist(B, C), c = G.dist(C, D), g = G.dist(D, A), d1 = G.dist(A, C), d2 = G.dist(B, D);
        var aA = G.ang(A, B, D), aB = G.ang(B, C, A), aC = G.ang(C, D, B), aD = G.ang(D, A, C);
        /* углы четырёхугольника: A = ∠DAB, B = ∠ABC, C = ∠BCD, D = ∠CDA */
        var A4 = G.ang(A, B, D), B4 = G.ang(B, A, C), C4 = G.ang(C, B, D), D4 = G.ang(D, C, A);
        var l = Math.pow(d1 * d2, 2), r1 = a * a * c * c + bb * bb * g * g - 2 * a * bb * c * g * Math.cos(B4 + D4), r2 = a * a * c * c + bb * bb * g * g - 2 * a * bb * c * g * Math.cos(A4 + C4);
        X.ro([[['∠B + ∠D', G.deg(B4 + D4)], ['∠A + ∠C', G.deg(A4 + C4)]],
              [['d₁²d₂²', G.f2(l)]],
              [['a²c² + b²g² − 2abcg·cos(B + D)', G.f2(r1) + ' ' + ok(eq(l, r1, 0.05))]],
              [['a²c² + b²g² − 2abcg·cos(A + C)', G.f2(r2) + ' ' + ok(eq(l, r2, 0.05))]]]);
      });
    }
  };

  /* Рис. 11.7 — перпендикулярные диагонали */
  FIGS.q117 = {
    bbox: [-6.2, 4.6, 6.2, -4.6],
    state: function () { return { R: 0.35, A: -3.8, C: 3.4, B: 2.6, D: -2.3 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var M0 = X.H(function () { return 0; }, function () { return 0; });
      var Rg = X.G('', [Math.cos(S.R) * 1.3, Math.sin(S.R) * 1.3], b.create('circle', [M0, 1.3], { visible: false }), [0, 0]);
      var U = X.H(function () { var l = Math.hypot(Rg.X(), Rg.Y()) || 1; return Rg.X() / l; }, function () { var l = Math.hypot(Rg.X(), Rg.Y()) || 1; return Rg.Y() / l; });
      var N = X.H(function () { return -U.Y(); }, function () { return U.X(); });
      var la = b.create('line', [M0, U], { visible: false }), lb = b.create('line', [M0, N], { visible: false });
      var A = X.G('A', [S.A * Math.cos(S.R), S.A * Math.sin(S.R)], la, [-22, -16]);
      var C = X.G('C', [S.C * Math.cos(S.R), S.C * Math.sin(S.R)], la, [8, 6]);
      var B = X.G('B', [-S.B * Math.sin(S.R), S.B * Math.cos(S.R)], lb, [-6, 8]);
      var D = X.G('D', [-S.D * Math.sin(S.R), S.D * Math.cos(S.R)], lb, [8, -16]);
      function pr(P) { return P.X() * U.X() + P.Y() * U.Y(); } function pn(P) { return P.X() * N.X() + P.Y() * N.Y(); }
      G.guard(b, [Rg, A, C, B, D], function () { return pr(A) < -0.9 && pr(C) > 0.9 && pn(B) > 0.9 && pn(D) < -0.9 && pr(A) > -5.2 && pr(C) < 5.2 && pn(B) < 3.9 && pn(D) > -3.9; });
      var M = X.D('M', function () { return 0; }, function () { return 0; }, [8, 8]);
      X.seg(A, B, 'AB', 'sAB', 2, {}, 4.5); X.seg(B, C, 'BC', 'sBC', 2, {}, 4.5); X.seg(C, D, 'CD', 'sCD', 2, {}, 4.5); X.seg(D, A, 'DA', 'sDA', 2, {}, 4.5);
      X.seg(A, C, 'AC', 'diag', 1.5, { dash: 2 }, 4); X.seg(B, D, 'BD', 'diag', 1.5, { dash: 2 }, 4);
      X.right(M, C, B, 0.3, 'rM', 'rM');
      X.pt(Rg, 'pR', ''); Rg.setAttribute({ size: 3, fillColor: X.C.mu, strokeColor: X.C.mu });
      [['A', A], ['B', B], ['C', C], ['D', D], ['M', M]].forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); });
      X.alias('opp1', ['AB', 'CD']); X.alias('opp2', ['BC', 'DA']);
      b.on('update', function () {
        S.R = Math.atan2(Rg.Y(), Rg.X()); S.A = pr(A); S.C = pr(C); S.B = pn(B); S.D = pn(D);
        var a2 = Math.pow(G.dist(A, B), 2), c2 = Math.pow(G.dist(C, D), 2), b2 = Math.pow(G.dist(B, C), 2), g2 = Math.pow(G.dist(D, A), 2);
        X.ro([[['AB² + CD²', G.f2(a2 + c2)], ['BC² + DA²', G.f2(b2 + g2) + ' ' + ok(eq(a2 + c2, b2 + g2, 0.03))]],
              [['∠(AC, BD)', G.deg(G.ang(M, A, B))]]]);
      });
    }
  };
})();
