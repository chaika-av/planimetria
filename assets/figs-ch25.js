/* Глава 25. Параметры многоугольников */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class=\'ok\'>✓</em>' : '<em class=\'bad\'>≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function cross(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  function fill(X, P, prim, tok) {
    return X.poly(function () { return P.concat([P[0]]).map(xy); }, { strokeWidth: 0, fillColor: X.C.acc, fillOpacity: 0, highlight: false, fixed: true }, prim, tok, { fillOpacity: 0 }, { fillOpacity: 0.3 });
  }
  function slider(X, y, x0, x1, t0, name) {
    var b = X.b, H1 = X.H(function () { return x0; }, function () { return y; }), H2 = X.H(function () { return x1; }, function () { return y; });
    var K = X.G(name || '', [x0 + (x1 - x0) * t0, y], b.create('segment', [H1, H2], { visible: false }), [-4, 12]);
    X.seg(H1, H2, 'sl' + (name || ''), 'sl' + (name || ''), 3, { strokeOpacity: 0.35 }, 5);
    return { K: K, t: function () { return (K.X() - x0) / (x1 - x0); } };
  }
  function reg(X, S, withDouble) {
    var b = X.b, R = 2.4, O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, -16]);
    var sl = slider(X, -3.2, -2.5, 2.5, S.t, 'n');
    function nn() { return Math.max(3, Math.min(12, Math.round(3 + 9 * sl.t()))); }
    var V = [];
    for (var i = 0; i < 12; i++) (function (i) {
      V.push(X.D(i < 3 ? 'A<sub>' + (i + 1) + '</sub>' : '', function () { return R * Math.cos(Math.PI / 2 + 2 * Math.PI * (i < nn() ? i : 0) / nn()); }, function () { return R * Math.sin(Math.PI / 2 + 2 * Math.PI * (i < nn() ? i : 0) / nn()); }, [-4, 10]));
    })(i);
    b.create('circle', [O, R], { fixed: true, strokeColor: X.C.fg, strokeWidth: 1.2, strokeOpacity: 0.5, highlight: false, fillColor: 'none' });
    var poly = function () { var n = nn(), r = []; for (var i = 0; i <= 12; i++) r.push(xy(V[Math.min(i, n) % n])); return r; };
    X.poly(poly, { strokeWidth: 2, strokeColor: X.C.fg, fillColor: X.C.acc, fillOpacity: 0.08, highlight: false, fixed: true }, 'pg', 'poly', { strokeWidth: 2 }, { strokeWidth: 3.5 });
    X.poly(function () { var n = nn(); return [xy(O), xy(V[0]), xy(V[1]), xy(O)]; }, { strokeWidth: 1.6, strokeColor: X.C.fg, fillColor: X.C.acc, fillOpacity: 0.0, highlight: false, fixed: true, dash: 2 }, 'tri', 'tri', { strokeWidth: 1.6 }, { strokeWidth: 3.5 });
    var M = X.D('B', function () { return (V[0].X() + V[1].X()) / 2; }, function () { return (V[0].Y() + V[1].Y()) / 2; }, [8, 6]);
    X.seg(O, M, 'OB', 'r', 1.6, { dash: 3 }, 4);
    pts(X, [['O', O], ['A1', V[0]], ['A2', V[1]], ['A3', V[2]], ['B', M]]);
    var D;
    if (withDouble) {
      D = X.D('D', function () { var a = Math.PI / 2 + Math.PI / nn(); return R * Math.cos(a); }, function () { var a = Math.PI / 2 + Math.PI / nn(); return R * Math.sin(a); }, [-22, 4]);
      X.seg(V[0], D, 'A1D', 'a2n', 2.2, {}, 4.5); X.seg(D, V[1], 'DA2', 'a2n', 2.2, {}, 4.5); X.seg(O, D, 'OD', 'R', 1.4, { dash: 3 }, 3.5);
      X.pt(D, 'pD', 'D');
    }
    return { R: R, nn: nn, V: V, O: O, M: M, D: D, sl: sl };
  }
  FIGS.p251 = {
    bbox: [-3.6, 3.4, 3.6, -3.8],
    state: function () { return { t: 0.55 }; },
    build: function (X) {
      var S = X.S, g = reg(X, S, false), R = g.R;
      X.b.on('update', function () {
        S.t = g.sl.t(); var n = g.nn(), P = [];
        for (var i = 0; i < n; i++) P.push(xy(g.V[i]));
        var s = 0; for (var j = 0; j < n; j++) { var k = (j + 1) % n; s += P[j][0] * P[k][1] - P[k][0] * P[j][1]; } s = Math.abs(s) / 2;
        var an = G.dist(g.V[0], g.V[1]), rn = G.dist(g.O, g.M), beta = G.ang(g.V[1], g.V[0], g.V[2]);
        X.ro([[['n', String(n)], ['β<sub>n</sub> (изм.)', G.deg(beta)], ['π(n−2)/n', G.deg(Math.PI * (n - 2) / n) + ' ' + ok(eq(beta, Math.PI * (n - 2) / n, 0.003))]],
              [['a<sub>n</sub>', G.f2(an)], ['2R sin(π/n)', G.f2(2 * R * Math.sin(Math.PI / n)) + ' ' + ok(eq(an, 2 * R * Math.sin(Math.PI / n), 0.005))]],
              [['r<sub>n</sub>', G.f2(rn)], ['R cos(π/n)', G.f2(R * Math.cos(Math.PI / n))], ['a<sub>n</sub>/(2 tg(π/n))', G.f2(an / (2 * Math.tan(Math.PI / n))) + ' ' + ok(eq(rn, R * Math.cos(Math.PI / n), 0.005) && eq(rn, an / (2 * Math.tan(Math.PI / n)), 0.005))]],
              [['S<sub>n</sub> (разбиением)', G.f2(s)], ['nR²/2·sin(2π/n)', G.f2(n * R * R / 2 * Math.sin(2 * Math.PI / n))], ['p·r<sub>n</sub>', G.f2(n * an / 2 * rn) + ' ' + ok(eq(s, n * R * R / 2 * Math.sin(2 * Math.PI / n), 0.01) && eq(s, n * an / 2 * rn, 0.01))]]]);
      });
    }
  };
  FIGS.p252 = {
    bbox: [-3.6, 3.4, 3.6, -3.8],
    state: function () { return { t: 0.35 }; },
    build: function (X) {
      var S = X.S, g = reg(X, S, true), R = g.R;
      X.b.on('update', function () {
        S.t = g.sl.t(); var n = g.nn(), an = G.dist(g.V[0], g.V[1]), a2 = G.dist(g.V[0], g.D);
        var f = R * (2 * R - Math.sqrt(4 * R * R - an * an));
        X.ro([[['n', String(n)], ['a<sub>n</sub>', G.f2(an)], ['a<sub>2n</sub> (изм.)', G.f2(a2)]],
              [['a<sub>2n</sub>²', G.f2(a2 * a2)], ['R(2R − √(4R² − a<sub>n</sub>²))', G.f2(f) + ' ' + ok(eq(a2 * a2, f, 0.01))]],
              [['a<sub>2n</sub> = 2R sin(π/2n)', G.f2(2 * R * Math.sin(Math.PI / (2 * n))) + ' ' + ok(eq(a2, 2 * R * Math.sin(Math.PI / (2 * n)), 0.005))]]]);
      });
    }
  };
  FIGS.p250 = {
    bbox: [-5.0, 4.4, 5.0, -2.8],
    state: function () { return { P: [[-3.6, -1.0], [0.2, -2.0], [3.8, -0.6], [3.2, 2.6], [-0.6, 3.6], [-3.4, 2.0]] }; },
    build: function (X) {
      var b = X.b, S = X.S, nm = ['A<sub>1</sub>', 'A<sub>2</sub>', 'A<sub>3</sub>', 'A<sub>4</sub>', 'A<sub>5</sub>', 'A<sub>6</sub>'];
      var offs = [[-26, -14], [-6, -18], [8, -14], [8, 4], [-4, 10], [-26, 6]];
      var V = S.P.map(function (p, i) { return X.P(nm[i], p, offs[i]); });
      for (var i = 0; i < 6; i++) X.seg(V[i], V[(i + 1) % 6], 's' + i, 'sides', 2, {}, 4.5);
      var O = X.P('O', [0.0, 0.6], [6, 6]);
      G.guard(b, V.concat([O]), function () { var sg = 0; for (var i = 0; i < 6; i++) { var c = cross(V[i], V[(i + 1) % 6], V[(i + 2) % 6]); if (Math.abs(c) < 0.6) return false; var s = c > 0 ? 1 : -1; if (!sg) sg = s; if (s !== sg) return false; if (cross(V[i], V[(i + 1) % 6], O) * sg < 0.3) return false; } return true; });
      for (var j = 0; j < 6; j++) X.seg(O, V[j], 'r' + j, 'tri', 1.1, { dash: 3 }, 3);
      V.forEach(function (P, i) { X.pt(P, 'p' + (i + 1), 'A' + (i + 1)); }); X.pt(O, 'pO', 'O');
      b.on('update', function () {
        S.P = V.map(xy);
        var sum = 0; for (var i = 0; i < 6; i++) sum += G.ang(V[i], V[(i + 5) % 6], V[(i + 1) % 6]);
        X.ro([[['Σ внутренних углов', G.deg(sum)], ['(n−2)·180°', '720.0°' + ' ' + ok(eq(sum, 4 * Math.PI, 0.003))]],
              [['6 · 180° − 360°', G.deg(6 * Math.PI - 2 * Math.PI) + ' ' + ok(eq(sum, 6 * Math.PI - 2 * Math.PI, 0.003))]]]);
      });
    }
  };
})();
