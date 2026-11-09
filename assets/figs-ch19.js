/* Глава 19. Формулы площади треугольника; медианы */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function cross(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function area(P, Q, R) { return Math.abs(cross(P, Q, R)) / 2; }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  function circ(X, O, r, prim, tok, w) {
    var o = X.b.create('circle', [O, r], { fixed: true, strokeColor: X.C.fg, strokeWidth: w || 1.6, highlight: false, fillColor: 'none' });
    X.reg(prim, tok, o, { strokeColor: X.C.fg, strokeWidth: w || 1.6 }, { strokeColor: X.C.acc, strokeWidth: 4 }); return o;
  }
  function fill(X, pts, prim, tok) {
    return X.poly(function () { return pts.concat([pts[0]]).map(xy); }, { strokeWidth: 0, fillColor: X.C.acc, fillOpacity: 0, highlight: false, fixed: true }, prim, tok, { fillOpacity: 0 }, { fillOpacity: 0.3 });
  }
  /* треугольник ABC; a = BC, b = CA, c = AB */
  function triangle(X, S, lim) {
    var A = X.P('A', S.A, [-6, 10]), B = X.P('B', S.B, [-22, -14]), C = X.P('C', S.C, [8, -14]);
    var T = { A: A, B: B, C: C };
    T.a = function () { return G.dist(B, C); }; T.b = function () { return G.dist(A, C); }; T.c = function () { return G.dist(A, B); };
    T.p = function () { return (T.a() + T.b() + T.c()) / 2; };
    T.S = function () { return area(A, B, C); };
    T.ang = function () { return [G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)]; };
    var l = lim || {};
    G.guard(X.b, [A, B, C], function () {
      var m = T.ang(); if (!m.every(function (x) { return isFinite(x) && x > (l.min || 0.3) && x < (l.max || 2.8); })) return false;
      if (T.S() < (l.smin || 2.5)) return false;
      return l.pred ? l.pred(T) : true;
    });
    X.seg(A, B, 'c', 'c', 2, {}, 4.5); X.seg(B, C, 'a', 'a', 2, {}, 4.5); X.seg(C, A, 'b', 'b', 2, {}, 4.5);
    return T;
  }
  function tstate() { return { A: [0.6, 3.6], B: [-3.6, -1.0], C: [3.8, -1.0] }; }
  function tsv(S, T) { S.A = xy(T.A); S.B = xy(T.B); S.C = xy(T.C); }
  function incenter(T) { var s = 2 * T.p(); return [(T.a() * T.A.X() + T.b() * T.B.X() + T.c() * T.C.X()) / s, (T.a() * T.A.Y() + T.b() * T.B.Y() + T.c() * T.C.Y()) / s]; }
  function excenter(T, k) {                         /* k = 0,1,2 — вневписанная окружность напротив A, B, C */
    var w = [T.a(), T.b(), T.c()], P = [T.A, T.B, T.C]; w[k] = -w[k]; var s = w[0] + w[1] + w[2];
    return [(w[0] * P[0].X() + w[1] * P[1].X() + w[2] * P[2].X()) / s, (w[0] * P[0].Y() + w[1] * P[1].Y() + w[2] * P[2].Y()) / s];
  }

  /* Рис. 19.2 — параллелограмм и треугольник */
  FIGS.b190 = {
    bbox: [-5.6, 4.2, 5.6, -1.6],
    state: function () { return { M: [-4.2, -0.8], P: 1.4, N: [-2.6, 2.8] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var M = X.P('M', S.M, [-22, -14]), Mh = X.H(function () { return M.X() + 1; }, function () { return M.Y(); });
      var P = X.G('P', [S.P + 0, S.M[1]], b.create('line', [M, Mh], { visible: false }), [8, -14]);
      var N = X.P('N', S.N, [-22, 6]);
      var K = wp(X, 'K', function () { return [N.X() + P.X() - M.X(), N.Y() + P.Y() - M.Y()]; }, [8, 6]);
      var E = wp(X, 'E', function () { return [N.X(), M.Y()]; }, [-6, -18]), F = wp(X, 'F', function () { return [K.X(), M.Y()]; }, [-6, -18]);
      G.guard(b, [M, P, N], function () { return P.X() - M.X() > 1.5 && P.X() - M.X() < 5.5 && N.Y() - M.Y() > 0.8 && N.Y() - M.Y() < 4.0 && Math.abs(N.X() - M.X()) < 3.5 && K.X() < 5.2 && K.X() > -5.2; });
      X.seg(M, N, 'MN', 'side', 2, {}, 4.5); X.seg(N, K, 'NK', 'side', 2, {}, 4.5); X.seg(K, P, 'KP', 'side', 2, {}, 4.5); X.seg(P, M, 'PM', 'base', 2, {}, 4.5);
      X.seg(N, P, 'NP', 'diag', 1.5, { dash: 2 }, 3.5); X.seg(N, E, 'NE', 'h', 1.4, { dash: 2 }, 3.5); X.seg(K, F, 'KF', 'h', 1.4, { dash: 2 }, 3.5);
      fill(X, [M, N, P], 'fMNP', 'tri');
      pts(X, [['M', M], ['N', N], ['K', K], ['P', P], ['E', E], ['F', F]]);
      var th = 0;
      X.poly(function () {
        var qx = (N.X() + P.X()) / 2, qy = (N.Y() + P.Y()) / 2;
        var q = [M, N, P].map(function (V) { var dx = V.X() - qx, dy = V.Y() - qy, c = Math.cos(th), s = Math.sin(th); return [qx + dx * c - dy * s, qy + dx * s + dy * c]; });
        return q.concat([q[0]]);
      }, { strokeWidth: 2.4, strokeColor: X.C.acc, fillColor: X.C.acc, fillOpacity: 0.45, highlight: false, fixed: true });
      X.anim({ label: 'Повернуть треугольник', dur: 5000,
        steps: [[0, 'Диагональ NP делит параллелограмм на два треугольника'], [0.05, 'Поворачиваем △MNP вокруг середины NP'], [0.97, 'Он совпал с △KPN: треугольники равны, S△ = ½·S']],
        set: function (t) { th = t * Math.PI; } });
      b.on('update', function () {
        S.M = xy(M); S.P = P.X(); S.N = xy(N);
        var a = G.dist(M, P), h = N.Y() - M.Y();
        var sp = Math.abs((M.X() * N.Y() - N.X() * M.Y()) + (N.X() * K.Y() - K.X() * N.Y()) + (K.X() * P.Y() - P.X() * K.Y()) + (P.X() * M.Y() - M.X() * P.Y())) / 2;
        X.ro([[['S<sub>MNKP</sub>', G.f2(sp)], ['MP·h', G.f2(a * h) + ' ' + ok(eq(sp, a * h, 0.01))]],
              [['S<sub>MNP</sub>', G.f2(area(M, N, P))], ['S<sub>KNP</sub>', G.f2(area(K, N, P))], ['½ah', G.f2(a * h / 2) + ' ' + ok(eq(area(M, N, P), a * h / 2, 0.01) && eq(area(K, N, P), a * h / 2, 0.01))]]]);
      });
    }
  };

  /* Рис. 19.3–19.4 — формулы ⟨1⟩–⟨6⟩ */
  FIGS.b191 = {
    bbox: [-6.0, 5.0, 6.0, -3.6],
    state: tstate,
    build: function (X) {
      var b = X.b, S = X.S, T = triangle(X, S), A = T.A, B = T.B, C = T.C;
      var O = wp(X, 'O', function () { return G.circum(A, B, C); }, [6, 6]);
      var I = wp(X, 'I', function () { return incenter(T); }, [6, 4]);
      var H = wp(X, 'H', function () { return G.foot(A, B, C); }, [4, -16]);
      var Rf = function () { return G.dist(O, A); }, rf = function () { return T.S() / T.p(); };
      circ(X, O, Rf, 'cR', 'R', 1.5); circ(X, I, rf, 'cr', 'r', 1.5);
      X.seg(A, H, 'ha', 'ha', 1.5, { dash: 2 }, 3.5);
      var Fa = wp(X, '', function () { return G.foot(I, B, C); }), Fb = wp(X, '', function () { return G.foot(I, C, A); }), Fc = wp(X, '', function () { return G.foot(I, A, B); });
      [Fa, Fb, Fc].forEach(function (q) { q.setAttribute({ visible: false }); });
      X.seg(I, Fa, 'ra', 'r', 1.2, { dash: 3 }, 3.5); X.seg(I, Fb, 'rb', 'r', 1.2, { dash: 3 }, 3.5); X.seg(I, Fc, 'rc', 'r', 1.2, { dash: 3 }, 3.5);
      X.seg(O, A, 'OA', 'R', 1.2, { dash: 3 }, 3.5);
      pts(X, [['A', A], ['B', B], ['C', C], ['O', O], ['I', I], ['H', H]]);
      b.on('update', function () {
        tsv(S, T);
        var a = T.a(), bb = T.b(), c = T.c(), p = T.p(), m = T.ang(), R = Rf(), r = rf(), ha = G.dist(A, H), s = T.S();
        var v = [a * ha / 2, a * bb * Math.sin(m[2]) / 2, 2 * R * R * Math.sin(m[0]) * Math.sin(m[1]) * Math.sin(m[2]), a * bb * c / (4 * R), p * r, Math.sqrt(p * (p - a) * (p - bb) * (p - c))];
        var all = v.every(function (x) { return eq(x, s, 0.01); });
        X.ro([[['a·h<sub>a</sub>/2', G.f2(v[0])], ['ab·sin C/2', G.f2(v[1])], ['2R²·sinA·sinB·sinC', G.f2(v[2])]],
              [['abc/(4R)', G.f2(v[3])], ['p·r', G.f2(v[4])], ['√(p(p−a)(p−b)(p−c))', G.f2(v[5]) + ' ' + ok(all)]]]);
      });
    }
  };

  /* Рис. 19.4а — формулы ⟨7⟩, ⟨8⟩ */
  FIGS.b192 = {
    bbox: [-6.0, 5.2, 6.0, -2.4],
    state: tstate,
    build: function (X) {
      var b = X.b, S = X.S, T = triangle(X, S), A = T.A, B = T.B, C = T.C;
      var Hb = wp(X, 'H<sub>b</sub>', function () { return G.foot(B, C, A); }, [8, 4]), Hc = wp(X, 'H<sub>c</sub>', function () { return G.foot(C, A, B); }, [-26, 4]);
      X.seg(B, Hb, 'hb', 'hb', 1.6, { dash: 2 }, 4); X.seg(C, Hc, 'hc', 'hc', 1.6, { dash: 2 }, 4);
      X.ang(A, B, C, 0.7, 'A', 'aA', 'angA'); X.ang(B, C, A, 0.6, 'B', 'aB', 'angB'); X.ang(C, A, B, 0.6, 'C', 'aC', 'angC');
      pts(X, [['A', A], ['B', B], ['C', C], ['Hb', Hb], ['Hc', Hc]]);
      b.on('update', function () {
        tsv(S, T);
        var m = T.ang(), a = T.a(), s = T.S(), hb = G.dist(B, Hb), hc = G.dist(C, Hc);
        var v7 = a * a * Math.sin(m[1]) * Math.sin(m[2]) / (2 * Math.sin(m[1] + m[2])), v8 = hb * hc / (2 * Math.sin(m[0]));
        X.ro([[['S', G.f2(s)], ['a² sinB sinC / (2 sin(B+C))', G.f2(v7) + ' ' + ok(eq(v7, s, 0.01))]],
              [['h<sub>b</sub>, h<sub>c</sub>', G.f2(hb) + ', ' + G.f2(hc)], ['h<sub>b</sub>h<sub>c</sub> / (2 sin A)', G.f2(v8) + ' ' + ok(eq(v8, s, 0.01))]]]);
      });
    }
  };

  /* Рис. 19.4б — котангенсы и вневписанные окружности, формулы ⟨9⟩, ⟨10⟩ */
  FIGS.b193 = {
    bbox: [-9.0, 7.0, 9.0, -7.0],
    state: function () { return { A: [0.4, 2.4], B: [-2.4, -1.0], C: [2.6, -1.0] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var T = triangle(X, S, { min: 0.55, max: 2.4, smin: 2.0, pred: function (T) { return Math.max(rr(T, 0), rr(T, 1), rr(T, 2)) < 6; } }), A = T.A, B = T.B, C = T.C;
      function rr(T, k) { return T.S() / (T.p() - [T.a(), T.b(), T.c()][k]); }
      var I = wp(X, 'I', function () { return incenter(T); }, [6, 4]);
      var Ia = wp(X, 'I<sub>a</sub>', function () { return excenter(T, 0); }, [6, 6]), Ib = wp(X, 'I<sub>b</sub>', function () { return excenter(T, 1); }, [6, 6]), Ic = wp(X, 'I<sub>c</sub>', function () { return excenter(T, 2); }, [6, 6]);
      circ(X, I, function () { return T.S() / T.p(); }, 'ci', 'r', 1.8);
      circ(X, Ia, function () { return rr(T, 0); }, 'ca', 'ra', 1.3); circ(X, Ib, function () { return rr(T, 1); }, 'cb', 'rb', 1.3); circ(X, Ic, function () { return rr(T, 2); }, 'cc', 'rc', 1.3);
      pts(X, [['A', A], ['B', B], ['C', C], ['I', I], ['Ia', Ia], ['Ib', Ib], ['Ic', Ic]]);
      X.alias('rex', ['ca', 'cb', 'cc']);
      b.on('update', function () {
        tsv(S, T);
        var m = T.ang(), a = T.a(), bb = T.b(), c = T.c(), p = T.p(), s = T.S(), r = s / p, ra = rr(T, 0), rb = rr(T, 1), rc = rr(T, 2);
        var ct = function (x) { return 1 / Math.tan(x / 2); };
        var c1 = (p - a) * (p - bb) * ct(m[2]), c2 = (p - a) * (p - c) * ct(m[1]), c3 = (p - bb) * (p - c) * ct(m[0]);
        var sq = r * ra * rb * rc, sm = ra * rb + ra * rc + rb * rc;
        X.ro([[['S', G.f2(s)], ['(p−a)(p−b)ctg(C/2)', G.f2(c1)], ['(p−a)(p−c)ctg(B/2)', G.f2(c2)], ['(p−b)(p−c)ctg(A/2)', G.f2(c3) + ' ' + ok(eq(c1, s, 0.02) && eq(c2, s, 0.02) && eq(c3, s, 0.02))]],
              [['√(r·rₐ·r<sub>b</sub>·r<sub>c</sub>)', G.f2(Math.sqrt(sq)) + ' ' + ok(eq(Math.sqrt(sq), s, 0.02))], ['r', G.f2(r)], ['1/r', G.f2(1 / r)], ['1/rₐ+1/r<sub>b</sub>+1/r<sub>c</sub>', G.f2(1 / ra + 1 / rb + 1 / rc) + ' ' + ok(eq(1 / r, 1 / ra + 1 / rb + 1 / rc, 0.003))]],
              [['p', G.f2(p)], ['√(rₐr<sub>b</sub>+rₐr<sub>c</sub>+r<sub>b</sub>r<sub>c</sub>)', G.f2(Math.sqrt(sm)) + ' ' + ok(eq(p, Math.sqrt(sm), 0.01))], ['S = rₐr<sub>b</sub>r<sub>c</sub>/√(…)', G.f2(ra * rb * rc / Math.sqrt(sm)) + ' ' + ok(eq(s, ra * rb * rc / Math.sqrt(sm), 0.02))]]]);
      });
    }
  };

  /* Рис. 19.5 — медианы делят треугольник на 6 равновеликих */
  function medians(X, S) {
    var T = triangle(X, S, { smin: 3 }), A = T.A, B = T.B, C = T.C;
    var mid = function (P, Q) { return function () { return [(P.X() + Q.X()) / 2, (P.Y() + Q.Y()) / 2]; }; };
    T.A1 = wp(X, 'A<sub>1</sub>', mid(B, C), [8, -16]); T.B1 = wp(X, 'B<sub>1</sub>', mid(C, A), [8, 6]); T.C1 = wp(X, 'C<sub>1</sub>', mid(A, B), [-26, 6]);
    T.O = wp(X, 'O', function () { return [(A.X() + B.X() + C.X()) / 3, (A.Y() + B.Y() + C.Y()) / 3]; }, [6, -16]);
    X.seg(A, T.A1, 'AA1', 'med', 1.5, {}, 3.5); X.seg(B, T.B1, 'BB1', 'med', 1.5, {}, 3.5); X.seg(C, T.C1, 'CC1', 'med', 1.5, {}, 3.5);
    return T;
  }
  FIGS.b195 = {
    bbox: [-5.6, 5.0, 5.6, -2.6],
    state: function () { return { A: [-0.4, 3.9], B: [-4.0, -1.0], C: [4.0, -1.0] }; },
    build: function (X) {
      var S = X.S, T = medians(X, S), A = T.A, B = T.B, C = T.C, O = T.O;
      fill(X, [A, T.C1, O], 'f1', 's1'); fill(X, [T.C1, B, O], 'f2', 's2'); fill(X, [B, T.A1, O], 'f3', 's3'); fill(X, [T.A1, C, O], 'f4', 's4'); fill(X, [C, T.B1, O], 'f5', 's5'); fill(X, [T.B1, A, O], 'f6', 's6');
      X.alias('six', ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']);
      pts(X, [['A', A], ['B', B], ['C', C], ['A1', T.A1], ['B1', T.B1], ['C1', T.C1], ['O', O]]);
      X.b.on('update', function () {
        tsv(S, T);
        var s = T.S(), t = [area(A, T.C1, O), area(T.C1, B, O), area(B, T.A1, O), area(T.A1, C, O), area(C, T.B1, O), area(T.B1, A, O)];
        var all = t.every(function (x) { return eq(x, s / 6, 0.01); });
        X.ro([[['S<sub>ABC</sub>', G.f2(s)], ['S / 6', G.f2(s / 6)]],
              [['шесть площадей', t.map(G.f2).join(' · ') + ' ' + ok(all)]],
              [['S<sub>ABO</sub>, S<sub>BCO</sub>, S<sub>CAO</sub>', [area(A, B, O), area(B, C, O), area(C, A, O)].map(G.f2).join(' · ')], ['S / 3', G.f2(s / 3) + ' ' + ok(eq(area(A, B, O), s / 3, 0.01) && eq(area(B, C, O), s / 3, 0.01))]]]);
      });
    }
  };

  /* Рис. 19.6 — треугольник из медиан */
  FIGS.b196 = {
    bbox: [-6.6, 5.0, 6.6, -3.0],
    state: function () { return { A: [-2.6, 3.9], B: [-5.2, -1.0], C: [0.8, -1.0] }; },
    build: function (X) {
      var S = X.S, T = medians(X, S, { smin: 3 }), A = T.A, B = T.B, C = T.C, O = T.O;
      /* треугольник, стороны которого равны медианам: векторы AA₁, BB₁, CC₁ в сумме дают нуль */
      var u = function (P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; };
      var X0 = X.H(function () { return 2.4; }, function () { return -1.2; });
      var X1 = wp(X, 'X', function () { return [X0.X(), X0.Y()]; }, [-14, -14]);
      var Y1 = wp(X, 'Y', function () { var v = u(A, T.A1); return [X0.X() + v[0], X0.Y() + v[1]]; }, [8, -14]);
      var Z1 = wp(X, 'Z', function () { var v = u(A, T.A1), w = u(B, T.B1); return [X0.X() + v[0] + w[0], X0.Y() + v[1] + w[1]]; }, [6, 8]);
      X.seg(X1, Y1, 'XY', 'ma', 2, {}, 4.5); X.seg(Y1, Z1, 'YZ', 'mb', 2, {}, 4.5); X.seg(Z1, X1, 'ZX', 'mc', 2, {}, 4.5); X.alias('tri', ['XY', 'YZ', 'ZX']);
      fill(X, [X1, Y1, Z1], 'fm', 'med');
      pts(X, [['A', A], ['B', B], ['C', C], ['A1', T.A1], ['B1', T.B1], ['C1', T.C1], ['O', O]]);
      X.b.on('update', function () {
        tsv(S, T);
        var s = T.S(), sm = area(X1, Y1, Z1), ma = G.dist(A, T.A1), mb = G.dist(B, T.B1), mc = G.dist(C, T.C1);
        X.ro([[['стороны XYZ', G.f2(G.dist(X1, Y1)) + ', ' + G.f2(G.dist(Y1, Z1)) + ', ' + G.f2(G.dist(Z1, X1))], ['медианы', G.f2(ma) + ', ' + G.f2(mb) + ', ' + G.f2(mc)]],
              [['S<sub>XYZ</sub>', G.f2(sm)], ['¾·S<sub>ABC</sub>', G.f2(0.75 * s) + ' ' + ok(eq(sm, 0.75 * s, 0.01))]]]);
      });
    }
  };

  /* Рис. 19.1 — площадь прямоугольника */
  FIGS.b197 = {
    bbox: [-5.4, 4.4, 5.4, -2.4],
    state: function () { return { A: [-3.0, -1.0], C: [2.6, 2.4] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), C = X.P('C', S.C, [8, 6]);
      var B = wp(X, 'B', function () { return [C.X(), A.Y()]; }, [8, -14]), D = wp(X, 'D', function () { return [A.X(), C.Y()]; }, [-22, 6]);
      G.guard(b, [A, C], function () { return C.X() - A.X() > 1 && C.Y() - A.Y() > 1 && C.X() - A.X() < 9 && C.Y() - A.Y() < 5.2; });
      X.seg(A, B, 'AB', 'ab', 2, {}, 4.5); X.seg(B, C, 'BC', 'ad', 2, {}, 4.5); X.seg(C, D, 'CD', 'ab', 2, {}, 4.5); X.seg(D, A, 'DA', 'ad', 2, {}, 4.5);
      fill(X, [A, B, C, D], 'fr', 'rect');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D]]);
      b.on('update', function () {
        S.A = xy(A); S.C = xy(C);
        var w = B.X() - A.X(), h = D.Y() - A.Y(), cnt = Math.floor(w) * Math.floor(h);
        X.ro([[['AB', G.f2(w)], ['AD', G.f2(h)], ['S = AB·AD', G.f2(w * h)]],
              [['целых единичных квадратов внутри', String(cnt) + (cnt <= w * h && w * h < (Math.floor(w) + 1) * (Math.floor(h) + 1) ? ' ' + ok(true) : ' ' + ok(false))]]]);
      });
    }
  };

  /* к §19.2 ⟨1⟩ — равенство площадей COA₁ и COB₁ */
  FIGS.b198 = {
    bbox: [-5.6, 5.0, 5.6, -2.6],
    state: function () { return { A: [-0.4, 3.9], B: [-4.0, -1.0], C: [4.0, -1.0] }; },
    build: function (X) {
      var S = X.S, T = medians(X, S), A = T.A, B = T.B, C = T.C, O = T.O, A1 = T.A1, B1 = T.B1, C1 = T.C1;
      var Q = wp(X, 'Q', function () { return [(A1.X() + B1.X()) / 2, (A1.Y() + B1.Y()) / 2]; }, [6, 6]);
      var M = wp(X, 'M', function () { return G.foot(A1, C, C1); }, [-22, 4]), N = wp(X, 'N', function () { return G.foot(B1, C, C1); }, [8, -14]);
      X.seg(A1, B1, 'A1B1', 'mid', 1.8, {}, 4); X.seg(A1, M, 'A1M', 'h1', 1.8, { dash: 2 }, 4.5); X.seg(B1, N, 'B1N', 'h2', 1.8, { dash: 2 }, 4.5);
      X.seg(C, C1, 'CC1x', 'cc', 2.2, {}, 4.5);
      fill(X, [C, A1, O], 'fa', 'sA'); fill(X, [C, B1, O], 'fb', 'sB');
      pts(X, [['A', A], ['B', B], ['C', C], ['A1', A1], ['B1', B1], ['C1', C1], ['O', O], ['Q', Q], ['M', M], ['N', N]]);
      X.b.on('update', function () {
        tsv(S, T);
        var q1 = G.dist(Q, A1), q2 = G.dist(Q, B1), h1 = G.dist(A1, M), h2 = G.dist(B1, N), s1 = area(C, A1, O), s2 = area(C, B1, O);
        X.ro([[['QA₁', G.f2(q1)], ['QB₁', G.f2(q2) + ' ' + ok(eq(q1, q2, 0.005))], ['Q ∈ CC₁', ok(Math.abs(cross(C, C1, Q)) < 1e-6)]],
              [['MA₁', G.f2(h1)], ['NB₁', G.f2(h2) + ' ' + ok(eq(h1, h2, 0.005))]],
              [['S<sub>COA₁</sub>', G.f2(s1)], ['S<sub>COB₁</sub>', G.f2(s2) + ' ' + ok(eq(s1, s2, 0.005))]]]);
      });
    }
  };
})();
