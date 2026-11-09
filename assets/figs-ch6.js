/* Глава 6. Метрические соотношения в прямоугольном треугольнике */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function foot(X, name, P, A, B, off) { return X.D(name, function () { return G.foot(P, A, B)[0]; }, function () { return G.foot(P, A, B)[1]; }, off); }
  function mid(X, name, P, Q, off) { return X.D(name, function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; }, off); }
  /* прямоугольный треугольник: гипотенуза AB, вершина C скользит по окружности на диаметре AB */
  function rt(X, S, thales) {
    var b = X.b, C0 = X.C;
    var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [8, -14]);
    var O = mid(X, 'O', A, B, [-4, -22]);
    var circ = b.create('circle', [O, function () { return G.dist(O, A); }], { strokeColor: C0.mu, strokeWidth: 1.2, dash: 3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none', visible: thales !== false });
    var C = X.G('C', S.C, circ, [-4, 10]);
    G.guard(b, [A, B, C], function () { var ang = G.ang(A, B, C); return G.dist(A, B) > 1.2 && ang > 0.3 && ang < 1.27; });
    X.seg(A, B, 'AB', 'AB', 2, {}, 4.5); X.seg(B, C, 'BC', 'tri', 2, {}, 4.5); X.seg(C, A, 'CA', 'tri', 2, {}, 4.5);
    return { A: A, B: B, C: C, O: O, circ: circ, a: function () { return G.dist(B, C); }, b: function () { return G.dist(C, A); }, c: function () { return G.dist(A, B); } };
  }
  function sv(S, T) { S.A = [T.A.X(), T.A.Y()]; S.B = [T.B.X(), T.B.Y()]; S.C = [T.C.X(), T.C.Y()]; }
  var ST = function () { return { A: [-3.6, -1.2], B: [3.6, -1.2], C: [-1.7, 1.96] }; };

  /* Рис. 6.1 — высота из прямого угла */
  FIGS.c61 = {
    bbox: [-5.2, 3.4, 5.2, -2.4], state: ST,
    build: function (X) {
      var b = X.b, S = X.S, T = rt(X, S), A = T.A, B = T.B, C = T.C;
      var H = foot(X, 'H', C, A, B, [4, -20]);
      X.seg(C, H, 'h', 'h', 1.8, { dash: 2 }, 4.5); X.hidden(H, B, 'ca', 'ca'); X.hidden(A, H, 'cb', 'cb');
      X.right(C, A, B, 0.3, 'rC', 'rC'); X.right(H, C, B, 0.28, 'rH', 'h');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(H, 'pH', 'H');
      X.alias('tri1', ['CA', 'h', 'cb']); X.alias('tri2', ['h', 'BC', 'ca']); X.alias('tri3', ['AB', 'BC', 'CA']);
      b.on('update', function () {
        sv(S, T);
        var a = T.a(), bb = T.b(), c = T.c(), h = G.dist(C, H), ca = G.dist(H, B), cb = G.dist(A, H);
        X.ro([[['h²', G.f2(h * h)], ['c<sub>a</sub>c<sub>b</sub>', G.f2(ca * cb) + ' ' + ok(eq(h * h, ca * cb))]],
              [['a²', G.f2(a * a)], ['c·c<sub>a</sub>', G.f2(c * ca) + ' ' + ok(eq(a * a, c * ca))]],
              [['b²', G.f2(bb * bb)], ['c·c<sub>b</sub>', G.f2(c * cb) + ' ' + ok(eq(bb * bb, c * cb))]],
              [['a² + b²', G.f2(a * a + bb * bb)], ['c²', G.f2(c * c) + ' ' + ok(eq(a * a + bb * bb, c * c, 0.01))]],
              [['h<sub>c</sub>', G.f2(h)], ['ab / c', G.f2(a * bb / c) + ' ' + ok(eq(h, a * bb / c))]]]);
      });
    }
  };

  /* Рис. 6.2 — вписанная и описанная окружности */
  FIGS.c62 = {
    bbox: [-5.2, 3.4, 5.2, -2.4], state: ST,
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, T = rt(X, S), A = T.A, B = T.B, C = T.C;
      var I = wp(X, 'I', function () { var a = T.a(), bb = T.b(), c = T.c(), s = a + bb + c; return [(a * A.X() + bb * B.X() + c * C.X()) / s, (a * A.Y() + bb * B.Y() + c * C.Y()) / s]; }, [8, 8]);
      var r = function () { return (T.a() + T.b() - T.c()) / 2; };
      var inc = b.create('circle', [I, r], { strokeColor: C0.fg, strokeWidth: 1.6, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      X.reg('inc', 'inc', inc, { strokeColor: C0.fg, strokeWidth: 1.6 }, { strokeColor: C0.acc, strokeWidth: 4 });
      var K = foot(X, 'K', I, A, B, [4, -20]), N = foot(X, 'N', I, B, C, [8, 4]), M = foot(X, 'M', I, C, A, [-22, 4]);
      X.seg(I, K, 'IK', 'r', 1.3, { dash: 2 }, 3.5); X.seg(I, N, 'IN', 'r', 1.3, { dash: 2 }, 3.5); X.seg(I, M, 'IM', 'r', 1.3, { dash: 2 }, 3.5);
      X.seg(T.O, C, 'OC', 'R', 1.2, { dash: 2 }, 3.5); X.hidden(T.O, A, 'OA', 'R'); X.hidden(T.O, B, 'OB', 'R');
      X.hidden(A, K, 'AK', 'mn'); X.hidden(K, B, 'KB', 'mn'); X.hidden(C, N, 'CN', 'rr'); X.hidden(C, M, 'CM', 'rr');
      X.right(C, A, B, 0.3, 'rC', 'rC');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(I, 'pI', 'I'); X.pt(K, 'pK', 'K'); X.pt(N, 'pN', 'N'); X.pt(M, 'pM', 'M'); X.pt(T.O, 'pO', 'O');
      X.alias('R', ['OC', 'OA', 'OB']); X.alias('r', ['IK', 'IN', 'IM', 'inc', 'CN', 'CM']); X.alias('sum', ['BC', 'CA']); X.alias('mn', ['AK', 'KB']);
      b.on('update', function () {
        sv(S, T);
        var a = T.a(), bb = T.b(), c = T.c(), R = c / 2, rv = G.dist(I, K), m = G.dist(A, K), n = G.dist(K, B), Aa = G.ang(A, B, C);
        var q = Math.sqrt(2) * Math.sin(Aa + Math.PI / 4) - 1;
        X.ro([[['a + b', G.f2(a + bb)], ['2R + 2r', G.f2(2 * R + 2 * rv) + ' ' + ok(eq(a + bb, 2 * R + 2 * rv, 0.01))]],
              [['r', G.f2(rv)], ['(a + b − c) / 2', G.f2((a + bb - c) / 2) + ' ' + ok(eq(rv, (a + bb - c) / 2))]],
              [['S', G.f2(a * bb / 2)], ['m·n', G.f2(m * n) + ' ' + ok(eq(a * bb / 2, m * n, 0.01))]],
              [['r² + r(m + n)', G.f2(rv * rv + rv * (m + n))], ['mn', G.f2(m * n) + ' ' + ok(eq(rv * rv + rv * (m + n), m * n, 0.01))]],
              [['r / R', G.f2(rv / R)], ['√2·sin(A + π/4) − 1', G.f2(q) + ' ' + ok(eq(rv / R, q, 0.005))], ['≤ √2 − 1', G.f2(Math.SQRT2 - 1) + ' ' + ok(rv / R <= Math.SQRT2 - 1 + 1e-6)]]]);
      });
    }
  };

  /* Рис. 6.3 — биссектриса прямого угла делит пополам угол между высотой и медианой */
  FIGS.c63 = {
    bbox: [-5.2, 3.4, 5.2, -2.4], state: ST,
    build: function (X) {
      var b = X.b, S = X.S, T = rt(X, S), A = T.A, B = T.B, C = T.C, O = T.O;
      var H = foot(X, 'H', C, A, B, [4, -20]);
      var L = wp(X, 'L', function () { var a = T.a(), bb = T.b(); return [(a * A.X() + bb * B.X()) / (a + bb), (a * A.Y() + bb * B.Y()) / (a + bb)]; }, [4, -20]);
      X.seg(C, H, 'CH', 'h', 1.5, { dash: 2 }, 4); X.seg(C, O, 'CO', 'm', 1.5, { dash: 2 }, 4); X.seg(C, L, 'CL', 'L', 2, {}, 4.5);
      X.right(C, A, B, 0.3, 'rC', 'rC');
      X.ang(C, H, L, 0.8, '', 'aHL', 'eq'); X.ang(C, L, O, 1.0, '', 'aLO', 'eq');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(H, 'pH', 'H'); X.pt(O, 'pO', 'O'); X.pt(L, 'pL', 'L');
      X.alias('hm', ['CH', 'CO']);
      b.on('update', function () {
        sv(S, T);
        var g1 = G.ang(C, H, L), g2 = G.ang(C, L, O), ga = G.ang(C, A, L), gb = G.ang(C, L, B), al = G.ang(A, B, C), be = G.ang(B, A, C);
        X.ro([[['∠HCL', G.deg(g1)], ['∠OCL', G.deg(g2) + ' ' + ok(eq(g1, g2, 0.0005))]],
              [['∠ACL', G.deg(ga)], ['∠BCL', G.deg(gb) + ' ' + ok(eq(ga, gb, 0.0005))]],
              [['∠OCB', G.deg(G.ang(C, O, B))], ['∠B', G.deg(be) + ' ' + ok(eq(G.ang(C, O, B), be, 0.0005))]]]);
      });
    }
  };

  /* точка пересечения (вневписанный центр) напротив вершины: веса (−x, y, z) */
  function excenter(P, Q, R, x, y, z) { var s = -x + y + z; return [(-x * P.X() + y * Q.X() + z * R.X()) / s, (-x * P.Y() + y * Q.Y() + z * R.Y()) / s]; }

  /* Рис. 6.4 — вневписанная окружность, касающаяся гипотенузы: r_c = p */
  FIGS.c64 = {
    bbox: [-6.8, 3.4, 6.8, -9.0], state: function () { return { A: [-1.6, 0], B: [1.6, 0], C: [-0.55, 1.5] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, T = rt(X, S), A = T.A, B = T.B, C = T.C;
      var Oc = wp(X, 'O<sub>c</sub>', function () { return excenter(C, A, B, T.c(), T.a(), T.b()); }, [8, 6]);
      var rc = function () { return (T.a() + T.b() + T.c()) / 2; };
      var circ = b.create('circle', [Oc, rc], { strokeColor: C0.fg, strokeWidth: 1.6, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      X.reg('exc', 'exc', circ, { strokeColor: C0.fg, strokeWidth: 1.6 }, { strokeColor: C0.acc, strokeWidth: 4 });
      var D = wp(X, 'D', function () { var k = rc() / T.b(); return [C.X() + (A.X() - C.X()) * k, C.Y() + (A.Y() - C.Y()) * k]; }, [-22, -6]);
      var E = wp(X, 'E', function () { var k = rc() / T.a(); return [C.X() + (B.X() - C.X()) * k, C.Y() + (B.Y() - C.Y()) * k]; }, [8, -6]);
      var K = foot(X, 'K', Oc, A, B, [8, 8]);
      X.seg(C, D, 'CD', 'CD', 1.4, { dash: 3 }, 4); X.seg(C, E, 'CE', 'CD', 1.4, { dash: 3 }, 4);
      X.seg(Oc, D, 'OD', 'rc', 1.3, { dash: 2 }, 3.5); X.seg(Oc, E, 'OE', 'rc', 1.3, { dash: 2 }, 3.5); X.seg(Oc, K, 'OK', 'rc', 1.3, { dash: 2 }, 3.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(Oc, 'pOc', 'Oc'); X.pt(D, 'pD', 'D'); X.pt(E, 'pE', 'E'); X.pt(K, 'pK', 'K');
      X.alias('rc', ['OD', 'OE', 'OK', 'exc']); X.alias('p', ['CD', 'CE']);
      b.on('update', function () {
        sv(S, T);
        var a = T.a(), bb = T.b(), c = T.c(), p = (a + bb + c) / 2, r = G.dist(Oc, K);
        X.ro([[['r<sub>c</sub>', G.f2(r)], ['p = (a + b + c) / 2', G.f2(p) + ' ' + ok(eq(r, p))]],
              [['CD', G.f2(G.dist(C, D))], ['CE', G.f2(G.dist(C, E)) + ' ' + ok(eq(G.dist(C, D), G.dist(C, E)))], ['r<sub>c</sub>', ok(eq(G.dist(C, D), r))]]]);
      });
    }
  };

  /* Рис. 6.5 — треугольник из центров вневписанных окружностей */
  FIGS.c65 = {
    bbox: [-6.2, 3.8, 6.2, -9.2], state: function () { return { A: [-1.6, 0], B: [1.6, 0], C: [-0.55, 1.5] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, T = rt(X, S, false), A = T.A, B = T.B, C = T.C;
      var Oa = wp(X, 'O<sub>a</sub>', function () { return excenter(A, B, C, T.a(), T.b(), T.c()); }, [-26, 6]);
      var Ob = wp(X, 'O<sub>b</sub>', function () { return excenter(B, C, A, T.b(), T.c(), T.a()); }, [8, 6]);
      var Oc = wp(X, 'O<sub>c</sub>', function () { return excenter(C, A, B, T.c(), T.a(), T.b()); }, [8, -16]);
      function rad(name, tok, O, P, Q, off) {
        var c = b.create('circle', [O, function () { var f = G.foot(O, P, Q); return Math.hypot(O.X() - f[0], O.Y() - f[1]); }], { strokeColor: C0.mu, strokeWidth: 1.3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
        X.reg(name, tok, c, { strokeColor: C0.mu, strokeWidth: 1.3 }, { strokeColor: C0.acc, strokeWidth: 4 });
        var F = X.H(function () { return G.foot(O, P, Q)[0]; }, function () { return G.foot(O, P, Q)[1]; });
        X.seg(O, F, 'rad' + name, tok, 1.1, { dash: 2 }, 3.5); return F;
      }
      rad('ca', 'ra', Oa, B, C); rad('cb', 'rb', Ob, C, A); rad('cc', 'rc', Oc, A, B);
      X.seg(Oa, Oc, 'OaOc', 'oc', 1.8, {}, 4.5); X.seg(Ob, Oc, 'ObOc', 'oc', 1.8, {}, 4.5); X.seg(Oa, Ob, 'OaOb', 'oab', 1.8, {}, 4.5);
      X.seg(C, Oa, 'COa', 'oab', 1.1, { dash: 3 }, 3.5); X.seg(C, Ob, 'COb', 'oab', 1.1, { dash: 3 }, 3.5);
      X.seg(A, Ob, 'AOb', 'ext', 1, { dash: 3 }, 3); X.seg(B, Oa, 'BOa', 'ext', 1, { dash: 3 }, 3);
      X.ang(Ob, Oc, Oa, 1.0, '', 'gb', 'angs'); X.ang(Oa, Oc, Ob, 1.0, '', 'ga', 'angs'); X.ang(Oc, Oa, Ob, 1.0, '', 'gc', 'angs');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(Oa, 'pOa', 'Oa'); X.pt(Ob, 'pOb', 'Ob'); X.pt(Oc, 'pOc', 'Oc');
      X.alias('ra', ['radca', 'ca']); X.alias('rb', ['radcb', 'cb']); X.alias('rc', ['radcc', 'cc']);
      b.on('update', function () {
        sv(S, T);
        var a = T.a(), bb = T.b(), c = T.c(), p = (a + bb + c) / 2, Sg = a * bb / 2, ra = Sg / (p - a), rb = Sg / (p - bb), rc = p;
        var Aa = G.ang(A, B, C), Bb = G.ang(B, A, C);
        var d1 = G.dist(Oa, Oc), d2 = G.dist(Ob, Oc), d3 = G.dist(Oa, Ob);
        X.ro([[['a', G.f2(a)], ['2r<sub>a</sub>r<sub>c</sub> / (r<sub>a</sub> + r<sub>c</sub>)', G.f2(2 * ra * rc / (ra + rc)) + ' ' + ok(eq(a, 2 * ra * rc / (ra + rc), 0.01))]],
              [['b', G.f2(bb)], ['2r<sub>b</sub>r<sub>c</sub> / (r<sub>b</sub> + r<sub>c</sub>)', G.f2(2 * rb * rc / (rb + rc)) + ' ' + ok(eq(bb, 2 * rb * rc / (rb + rc), 0.01))]],
              [['O<sub>a</sub>O<sub>c</sub>', G.f2(d1)], ['√(2(r<sub>c</sub>² + r<sub>a</sub>²))', G.f2(Math.sqrt(2 * (rc * rc + ra * ra))) + ' ' + ok(eq(d1, Math.sqrt(2 * (rc * rc + ra * ra)), 0.01))]],
              [['O<sub>b</sub>O<sub>c</sub>', G.f2(d2)], ['√(2(r<sub>c</sub>² + r<sub>b</sub>²))', G.f2(Math.sqrt(2 * (rc * rc + rb * rb))) + ' ' + ok(eq(d2, Math.sqrt(2 * (rc * rc + rb * rb)), 0.01))]],
              [['O<sub>a</sub>O<sub>b</sub>', G.f2(d3)], ['(r<sub>a</sub> + r<sub>b</sub>)√2', G.f2((ra + rb) * Math.SQRT2) + ' ' + ok(eq(d3, (ra + rb) * Math.SQRT2, 0.01))]],
              [['∠O<sub>c</sub>O<sub>b</sub>O<sub>a</sub>', G.deg(G.ang(Ob, Oc, Oa))], ['∠A/2 + 45°', G.deg(Aa / 2 + Math.PI / 4) + ' ' + ok(eq(G.ang(Ob, Oc, Oa), Aa / 2 + Math.PI / 4, 0.001))]],
              [['∠O<sub>c</sub>O<sub>a</sub>O<sub>b</sub>', G.deg(G.ang(Oa, Oc, Ob))], ['∠B/2 + 45°', G.deg(Bb / 2 + Math.PI / 4) + ' ' + ok(eq(G.ang(Oa, Oc, Ob), Bb / 2 + Math.PI / 4, 0.001))]]]);
      });
    }
  };
})();
