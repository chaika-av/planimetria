/* Глава 20. Площадь выпуклого четырёхугольника */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function cross(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function area(P, Q, R) { return Math.abs(cross(P, Q, R)) / 2; }
  function quadS(A, B, C, D) { return area(A, B, C) + area(A, C, D); }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  function fill(X, pts, prim, tok) {
    return X.poly(function () { return pts.concat([pts[0]]).map(xy); }, { strokeWidth: 0, fillColor: X.C.acc, fillOpacity: 0, highlight: false, fixed: true }, prim, tok, { fillOpacity: 0 }, { fillOpacity: 0.3 });
  }
  function convex(A, B, C, D, m) {
    var c = [cross(A, B, C), cross(B, C, D), cross(C, D, A), cross(D, A, B)], t = m || 0.9;
    return c.every(function (x) { return Math.abs(x) > t; }) && c[0] * c[1] > 0 && c[1] * c[2] > 0 && c[2] * c[3] > 0;
  }
  function sides(X, A, B, C, D) { X.seg(A, B, 'sAB', 'a', 2, {}, 4.5); X.seg(B, C, 'sBC', 'b', 2, {}, 4.5); X.seg(C, D, 'sCD', 'c', 2, {}, 4.5); X.seg(D, A, 'sDA', 'd', 2, {}, 4.5); }
  function quad(X, S) {
    var b = X.b;
    var A = X.P('A', S.A, [-22, -10]), B = X.P('B', S.B, [-4, -18]), C = X.P('C', S.C, [8, 0]), D = X.P('D', S.D, [-4, 10]);
    G.guard(b, [A, B, C, D], function () { return convex(A, B, C, D, 1.2) && quadS(A, B, C, D) > 6; });
    return { A: A, B: B, C: C, D: D };
  }
  function qstate() { return { A: [-4.2, -0.6], B: [0.8, -1.8], C: [4.4, 1.0], D: [-1.2, 3.8] }; }
  function qsv(S, Q) { S.A = xy(Q.A); S.B = xy(Q.B); S.C = xy(Q.C); S.D = xy(Q.D); }

  /* Рис. 20.1 — S = ½ d₁d₂ sin φ и S₁S₃ = S₂S₄ */
  FIGS.m201 = {
    bbox: [-5.8, 5.0, 5.8, -2.8],
    state: qstate,
    build: function (X) {
      var S = X.S, Q = quad(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      var O = wp(X, 'O', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [8, -16]);
      sides(X, A, B, C, D); X.seg(A, C, 'AC', 'diag', 1.5, {}, 3.5); X.seg(B, D, 'BD', 'diag', 1.5, {}, 3.5);
      fill(X, [B, C, O], 'f1', 's1'); fill(X, [A, B, O], 'f2', 's2'); fill(X, [A, D, O], 'f3', 's3'); fill(X, [C, D, O], 'f4', 's4');
      X.ang(O, A, B, 0.5, 'φ', 'aphi', 'phi');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['O', O]]);
      X.b.on('update', function () {
        qsv(S, Q);
        var s = quadS(A, B, C, D), d1 = G.dist(A, C), d2 = G.dist(B, D), ph = G.ang(O, A, B);
        var s1 = area(B, C, O), s2 = area(A, B, O), s3 = area(A, D, O), s4 = area(C, D, O);
        X.ro([[['S', G.f2(s)], ['½d₁d₂ sin φ', G.f2(d1 * d2 * Math.sin(ph) / 2) + ' ' + ok(eq(s, d1 * d2 * Math.sin(ph) / 2, 0.01))], ['φ', G.deg(ph)]],
              [['S₁+S₂+S₃+S₄', G.f2(s1 + s2 + s3 + s4) + ' ' + ok(eq(s, s1 + s2 + s3 + s4, 0.01))]],
              [['S₁·S₃', G.f2(s1 * s3)], ['S₂·S₄', G.f2(s2 * s4) + ' ' + ok(eq(s1 * s3, s2 * s4, 0.03))]]]);
      });
    }
  };

  /* Рис. 20.1а — аналог формулы Герона для четырёхугольника */
  FIGS.m202 = {
    bbox: [-5.8, 5.0, 5.8, -2.8],
    state: qstate,
    build: function (X) {
      var S = X.S, Q = quad(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      sides(X, A, B, C, D); X.seg(B, D, 'BD', 'diag', 1.5, { dash: 2 }, 3.5);
      X.ang(A, D, B, 0.6, 'A', 'aA', 'angA'); X.ang(C, B, D, 0.6, 'C', 'aC', 'angC');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D]]);
      X.b.on('update', function () {
        qsv(S, Q);
        var a = G.dist(A, B), b = G.dist(B, C), c = G.dist(C, D), d = G.dist(D, A), p = (a + b + c + d) / 2;
        var An = G.ang(A, D, B), Cn = G.ang(C, B, D), s = quadS(A, B, C, D);
        var v = Math.sqrt(Math.max(0, (p - a) * (p - b) * (p - c) * (p - d) - a * b * c * d * Math.pow(Math.cos((An + Cn) / 2), 2)));
        X.ro([[['S', G.f2(s)], ['2S', G.f2(2 * s)], ['ad·sinA + bc·sinC', G.f2(a * d * Math.sin(An) + b * c * Math.sin(Cn)) + ' ' + ok(eq(2 * s, a * d * Math.sin(An) + b * c * Math.sin(Cn), 0.02))]],
              [['√((p−a)(p−b)(p−c)(p−d) − abcd·cos²((A+C)/2))', G.f2(v) + ' ' + ok(eq(v, s, 0.02))]]]);
      });
    }
  };

  /* вписанный четырёхугольник */
  function onCircle(X, R) {
    var b = X.b, O = X.H(function () { return 0; }, function () { return 0; });
    return { O: O, c: b.create('circle', [O, R], { visible: false }) };
  }
  FIGS.m203 = {
    bbox: [-3.5, 3.5, 3.5, -3.5],
    state: function () { return { t: [3.5, 5.2, 0.5, 2.1] }; },
    build: function (X) {
      var b = X.b, S = X.S, R = 2.4, k = onCircle(X, R);
      var nm = ['A', 'B', 'C', 'D'], off = [[-22, -12], [-6, -18], [8, 2], [-6, 10]];
      var V = S.t.map(function (t, i) { return X.G(nm[i], [R * Math.cos(t), R * Math.sin(t)], k.c, off[i]); });
      var A = V[0], B = V[1], C = V[2], D = V[3];
      G.guard(b, V, function () { return convex(A, B, C, D, 0.8); });
      var ring = b.create('circle', [k.O, R], { fixed: true, strokeColor: X.C.fg, strokeWidth: 1.4, highlight: false, fillColor: 'none' });
      X.reg('cir', 'cir', ring, { strokeColor: X.C.fg, strokeWidth: 1.4 }, { strokeColor: X.C.acc, strokeWidth: 4 });
      sides(X, A, B, C, D); X.seg(A, C, 'AC', 'diag', 1.5, { dash: 2 }, 3.5); X.seg(B, D, 'BD', 'diag', 1.5, { dash: 2 }, 3.5);
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D]]);
      b.on('update', function () {
        S.t = V.map(function (P) { return Math.atan2(P.Y(), P.X()); });
        var a = G.dist(A, B), bb = G.dist(B, C), c = G.dist(C, D), d = G.dist(D, A), p = (a + bb + c + d) / 2, s = quadS(A, B, C, D);
        var br = Math.sqrt((p - a) * (p - bb) * (p - c) * (p - d));
        var ac = G.dist(A, C), RR = ac * (a * bb + c * d) / (4 * s);
        X.ro([[['S', G.f2(s)], ['√((p−a)(p−b)(p−c)(p−d))', G.f2(br) + ' ' + ok(eq(br, s, 0.02))]],
              [['AC·(ab+cd)/(4R)', G.f2(ac * (a * bb + c * d) / (4 * R)) + ' ' + ok(eq(ac * (a * bb + c * d) / (4 * R), s, 0.02))], ['∠A + ∠C', G.deg(G.ang(A, D, B) + G.ang(C, B, D))]]]);
      });
    }
  };

  /* Рис. 20.2а — вписанный четырёхугольник с перпендикулярными диагоналями */
  FIGS.m204 = {
    bbox: [-3.5, 3.5, 3.5, -3.5],
    state: function () { return { P: [0.5, 0.3], t: 0.7 }; },
    build: function (X) {
      var b = X.b, S = X.S, R = 2.4, k = onCircle(X, R);
      var P = X.P('P', S.P, [8, -16]);
      var T = X.G('A', [R * Math.cos(S.t), R * Math.sin(S.t)], k.c, [8, 6]);
      G.guard(b, [P, T], function () {
        var m = Math.hypot(P.X(), P.Y()); if (m > 1.5) return false;
        var d = G.dist(P, T); return d > 1.2;
      });
      function hit(u, sgn) {      /* пересечение луча из P в направлении ±u с окружностью */
        var pu = P.X() * u[0] + P.Y() * u[1], disc = pu * pu - (P.X() * P.X() + P.Y() * P.Y()) + R * R, s = -pu + sgn * Math.sqrt(Math.max(0, disc));
        return [P.X() + s * u[0], P.Y() + s * u[1]];
      }
      function ud() { var d = G.dist(P, T) || 1; return [(T.X() - P.X()) / d, (T.Y() - P.Y()) / d]; }
      var C = wp(X, 'C', function () { var u = ud(); return hit(u, -1); }, [-18, -16]);
      var Bp = wp(X, 'B', function () { var u = ud(); return hit([-u[1], u[0]], 1); }, [-22, 6]);
      var D = wp(X, 'D', function () { var u = ud(); return hit([-u[1], u[0]], -1); }, [6, -16]);
      var A = T;
      /* порядок обхода: A, B, C, D */
      var ring = b.create('circle', [k.O, R], { fixed: true, strokeColor: X.C.fg, strokeWidth: 1.4, highlight: false, fillColor: 'none' });
      X.reg('cir', 'cir', ring, { strokeColor: X.C.fg, strokeWidth: 1.4 }, { strokeColor: X.C.acc, strokeWidth: 4 });
      X.seg(A, Bp, 'sAB', 'a', 2, {}, 4.5); X.seg(Bp, C, 'sBC', 'b', 2, {}, 4.5); X.seg(C, D, 'sCD', 'c', 2, {}, 4.5); X.seg(D, A, 'sDA', 'd', 2, {}, 4.5);
      X.seg(A, C, 'AC', 'diag', 1.5, { dash: 2 }, 3.5); X.seg(Bp, D, 'BD', 'diag', 1.5, { dash: 2 }, 3.5);
      X.right(P, A, Bp, 0.28, 'rP', 'rP');
      pts(X, [['A', A], ['B', Bp], ['C', C], ['D', D], ['P', P]]);
      b.on('update', function () {
        S.P = xy(P); S.t = Math.atan2(T.Y(), T.X());
        var a = G.dist(A, Bp), bb = G.dist(Bp, C), c = G.dist(C, D), d = G.dist(D, A), s = quadS(A, Bp, C, D);
        var p = (a + bb + c + d) / 2, br = Math.sqrt((p - a) * (p - bb) * (p - c) * (p - d));
        X.ro([[['S', G.f2(s)], ['½(AB·CD + BC·AD)', G.f2((a * c + bb * d) / 2) + ' ' + ok(eq(s, (a * c + bb * d) / 2, 0.02))]],
              [['½·AC·BD', G.f2(G.dist(A, C) * G.dist(Bp, D) / 2) + ' ' + ok(eq(s, G.dist(A, C) * G.dist(Bp, D) / 2, 0.02))], ['Брахмагупта', G.f2(br) + ' ' + ok(eq(s, br, 0.02))]]]);
      });
    }
  };

  /* Рис. 20.3–20.4 — описанный четырёхугольник */
  FIGS.m205 = {
    bbox: [-3.4, 3.4, 3.4, -3.4],
    state: function () { return { t: [1.4, 3.0, 4.4, 5.9] }; },
    build: function (X) {
      var b = X.b, S = X.S, r = 1.3, k = onCircle(X, r), O = k.O;
      var nm = ['K', 'F', 'E', 'M'], off = [[8, 6], [-22, 6], [-22, -16], [8, -16]];
      var T = S.t.map(function (t, i) { return X.G(nm[i], [r * Math.cos(t), r * Math.sin(t)], k.c, off[i]); });
      var ang = function (P) { return Math.atan2(P.Y(), P.X()); };
      function gap(i) { var d = ang(T[(i + 1) % 4]) - ang(T[i]); while (d < 0) d += 2 * Math.PI; while (d >= 2 * Math.PI) d -= 2 * Math.PI; return d; }
      G.guard(b, T, function () { var g = [gap(0), gap(1), gap(2), gap(3)]; return g.every(function (x) { return x > 0.7 && x < 2.3; }); });
      function vert(i) { return function () { var a1 = ang(T[i]), g = gap(i), m = a1 + g / 2, d = r / Math.cos(g / 2); return [d * Math.cos(m), d * Math.sin(m)]; }; }
      /* вершина между K и F — B, между F и E — C, между E и M — D, между M и K — A */
      var Bv = wp(X, 'B', vert(0), [-22, 6]), Cv = wp(X, 'C', vert(1), [-24, -14]), Dv = wp(X, 'D', vert(2), [8, -14]), Av = wp(X, 'A', vert(3), [8, 6]);
      var ring = b.create('circle', [O, r], { fixed: true, strokeColor: X.C.fg, strokeWidth: 1.6, highlight: false, fillColor: 'none' });
      X.reg('cir', 'cir', ring, { strokeColor: X.C.fg, strokeWidth: 1.6 }, { strokeColor: X.C.acc, strokeWidth: 4 });
      sides(X, Av, Bv, Cv, Dv);
      T.forEach(function (P, i) { X.seg(O, P, 'rad' + i, 'r', 1.2, { dash: 3 }, 3.5); });
      pts(X, [['A', Av], ['B', Bv], ['C', Cv], ['D', Dv], ['K', T[0]], ['F', T[1]], ['E', T[2]], ['M', T[3]]]);
      b.on('update', function () {
        S.t = T.map(ang);
        var a = G.dist(Av, Bv), bb = G.dist(Bv, Cv), c = G.dist(Cv, Dv), d = G.dist(Dv, Av), p = (a + bb + c + d) / 2, s = quadS(Av, Bv, Cv, Dv);
        var A1 = G.ang(Av, Dv, Bv), C1 = G.ang(Cv, Bv, Dv), v6 = Math.sqrt(a * bb * c * d) * Math.sin((A1 + C1) / 2);
        X.ro([[['a + c', G.f2(a + c)], ['b + d', G.f2(bb + d) + ' ' + ok(eq(a + c, bb + d, 0.01))]],
              [['S', G.f2(s)], ['p·r', G.f2(p * r) + ' ' + ok(eq(s, p * r, 0.02))]],
              [['√(abcd)·sin((A+C)/2)', G.f2(v6) + ' ' + ok(eq(s, v6, 0.02))]]]);
      });
    }
  };

  /* Рис. 20.4а — теорема Вариньона */
  FIGS.m206 = {
    bbox: [-5.8, 5.0, 5.8, -2.8],
    state: qstate,
    build: function (X) {
      var S = X.S, Q = quad(X, S), A = Q.A, B = Q.B, C = Q.C, D = Q.D;
      var mid = function (P, R) { return function () { return [(P.X() + R.X()) / 2, (P.Y() + R.Y()) / 2]; }; };
      var L = wp(X, 'L', mid(A, B), [-22, -16]), Nn = wp(X, 'N', mid(B, C), [8, -8]), Kk = wp(X, 'K', mid(C, D), [8, 4]), Mm = wp(X, 'M', mid(D, A), [-22, 6]);
      sides(X, A, B, C, D); X.seg(A, C, 'AC', 'diag', 1.3, { dash: 2 }, 3.5); X.seg(B, D, 'BD', 'diag', 1.3, { dash: 2 }, 3.5);
      X.seg(L, Nn, 'LN', 'par', 2, {}, 4.5); X.seg(Nn, Kk, 'NK', 'par', 2, {}, 4.5); X.seg(Kk, Mm, 'KM', 'par', 2, {}, 4.5); X.seg(Mm, L, 'ML', 'par', 2, {}, 4.5);
      fill(X, [L, Nn, Kk, Mm], 'fpar', 'parS');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['L', L], ['N', Nn], ['K', Kk], ['M', Mm]]);
      X.b.on('update', function () {
        qsv(S, Q);
        var s = quadS(A, B, C, D), sp = quadS(L, Nn, Kk, Mm), per = G.dist(L, Nn) + G.dist(Nn, Kk) + G.dist(Kk, Mm) + G.dist(Mm, L), d = G.dist(A, C) + G.dist(B, D);
        var par = eq(L.X() + Kk.X(), Nn.X() + Mm.X(), 1e-6) && eq(L.Y() + Kk.Y(), Nn.Y() + Mm.Y(), 1e-6);
        X.ro([[['S<sub>MNKL</sub>', G.f2(sp)], ['½·S<sub>ABCD</sub>', G.f2(s / 2) + ' ' + ok(eq(sp, s / 2, 0.01))]],
              [['P<sub>MNKL</sub>', G.f2(per)], ['AC + BD', G.f2(d) + ' ' + ok(eq(per, d, 0.01))]],
              [['середины сторон — параллелограмм', par ? 'да ' + ok(true) : 'нет ' + ok(false)]]]);
      });
    }
  };
  FIGS.m207 = FIGS.m201;
})();
