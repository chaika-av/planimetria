/* Глава 24. Площадь кругового сегмента */
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
  function arcPts(O, R, a0, al, n) { var r = []; for (var i = 0; i <= n; i++) { var t = a0 + al * i / n; r.push([O.X() + R * Math.cos(t), O.Y() + R * Math.sin(t)]); } return r; }
  function shoelace(P) { var s = 0; for (var i = 0; i < P.length; i++) { var j = (i + 1) % P.length; s += P[i][0] * P[j][1] - P[j][0] * P[i][1]; } return Math.abs(s) / 2; }
  function build(X, isSeg) {
    var b = X.b, S = X.S, O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, -16]);
    var A = X.P('A', S.A, [8, -16]);
    var cir = b.create('circle', [O, A], { visible: false });
    var Bp = X.G('B', [Math.hypot(S.A[0], S.A[1]) * Math.cos(S.al + Math.atan2(S.A[1], S.A[0])), Math.hypot(S.A[0], S.A[1]) * Math.sin(S.al + Math.atan2(S.A[1], S.A[0]))], cir, [-22, 6]);
    function R() { return G.dist(O, A); }
    function a0() { return Math.atan2(A.Y(), A.X()); }
    function al() { var d = Math.atan2(Bp.Y(), Bp.X()) - a0(); while (d < 0) d += 2 * Math.PI; while (d >= 2 * Math.PI) d -= 2 * Math.PI; return d; }
    G.guard(b, [A, Bp], function () { var r = R(), a = al(); return r > 1.2 && r < 3.0 && a > 0.25 && a < 2 * Math.PI - 0.25; });
    var ring = b.create('circle', [O, A], { fixed: true, strokeColor: X.C.fg, strokeWidth: 1.2, strokeOpacity: 0.5, highlight: false, fillColor: 'none' });
    var shape = function () { var p = arcPts(O, R(), a0(), al(), 48); return isSeg ? p.concat([p[0]]) : [[0, 0]].concat(p, [[0, 0]]); };
    X.poly(shape, { strokeWidth: 2, strokeColor: X.C.fg, fillColor: X.C.acc, fillOpacity: 0.12, highlight: false, fixed: true }, 'shape', isSeg ? 'seg' : 'sec', { fillOpacity: 0.12, strokeWidth: 2 }, { fillOpacity: 0.4, strokeWidth: 3.5 });
    X.seg(O, A, 'OA', 'R', 1.8, isSeg ? { dash: 3 } : {}, 4.5); X.seg(O, Bp, 'OB', 'R', 1.8, isSeg ? { dash: 3 } : {}, 4.5);
    if (isSeg) X.seg(A, Bp, 'AB', 'chord', 1.8, {}, 4.5);
    pts(X, [['O', O], ['A', A], ['B', Bp]]);
    b.on('update', function () {
      S.A = xy(A); var a = al(), r = R(); S.al = a;
      var P = arcPts(O, r, a0(), a, 600), num = isSeg ? shoelace(P) : shoelace([[0, 0]].concat(P));
      var sector = r * r * a / 2, tri = r * r * Math.sin(a) / 2, seg = r * r / 2 * (a - Math.sin(a));
      if (!isSeg) X.ro([[['R', G.f2(r)], ['α (рад)', G.f2(a)], ['α (°)', G.deg(a)]],
        [['S сектора (разбиением)', G.f2(num)], ['R²·α/2', G.f2(sector) + ' ' + ok(eq(num, sector, 0.01))]],
        [['S / πR²', G.f2(num / (Math.PI * r * r))], ['α / 2π', G.f2(a / (2 * Math.PI)) + ' ' + ok(eq(num / (Math.PI * r * r), a / (2 * Math.PI), 0.002))]]]);
      else X.ro([[['R', G.f2(r)], ['α (рад)', G.f2(a)], ['sin α', G.f2(Math.sin(a))]],
        [['S сегмента (разбиением)', G.f2(num)], ['R²/2·(α − sin α)', G.f2(seg) + ' ' + ok(eq(num, seg, 0.01))]],
        [['S сектора − S<sub>AOB</sub>', G.f2(sector) + ' − ' + G.f2(tri) + ' = ' + G.f2(sector - tri) + ' ' + ok(eq(sector - tri, num, 0.01))]]]);
    });
    X.anim({ label: 'Развернуть угол', dur: 8000, t0: (S.al - 0.3) / (2 * Math.PI - 0.6),
      steps: [[0, 'α мал — S мала'], [0.3, 'α растёт — S растёт пропорционально'], [0.48, 'α > 180° — больше половины круга'], [0.8, 'α → 360° — почти весь круг']],
      set: function (t) { var a = 0.3 + t * (2 * Math.PI - 0.6), r = R(), a1 = a0() + a; Bp.setPosition(JXG.COORDS_BY_USER, [r * Math.cos(a1), r * Math.sin(a1)]); } });
  }
  FIGS.s241 = { bbox: [-3.6, 3.6, 3.6, -3.6], state: function () { return { A: [2.2, 0.3], al: 1.9 }; }, build: function (X) { build(X, true); } };
})();
