/* Глава 22. Площадь трапеции */
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
  FIGS.p221 = {
    bbox: [-7.4, 4.8, 7.4, -2.4],
    state: function () { return { A: [-4.4, -1.2], D: [3.2, -1.2], B: [-2.6, 2.6], C: [0.6, 2.6] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -16]), B = X.P('B', S.B, [-24, 4]);
      var Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); }), Bh = X.H(function () { return B.X() + 1; }, function () { return B.Y(); });
      var D = X.G('D', S.D, b.create('line', [A, Ah], { visible: false }), [8, -16]), C = X.G('C', S.C, b.create('line', [B, Bh], { visible: false }), [8, 6]);
      G.guard(b, [A, B, D, C], function () { var a = D.X() - A.X(), bb = C.X() - B.X(), h = B.Y() - A.Y(); return a > 2.5 && bb > 0.8 && h > 1.2 && h < 4.4 && a + bb < 9.4 && Math.abs(a - bb) > 0.5; });
      var F = wp(X, 'F', function () { return [(C.X() + D.X()) / 2, (C.Y() + D.Y()) / 2]; }, [8, 4]);
      var E = wp(X, 'E', function () { return [(A.X() + B.X()) / 2, (A.Y() + B.Y()) / 2]; }, [-22, 2]);
      var K = wp(X, 'K', function () { return [2 * F.X() - B.X(), 2 * F.Y() - B.Y()]; }, [8, -16]);
      X.seg(A, B, 'AB', 'sides', 2, {}, 4.5); X.seg(B, C, 'BC', 'tb', 2, {}, 4.5); X.seg(C, D, 'CD', 'sides', 2, {}, 4.5); X.seg(D, A, 'DA', 'ta', 2, {}, 4.5);
      X.seg(D, K, 'DK', 'tb', 2, { dash: 2 }, 4.5); X.seg(B, K, 'BK', 'bk', 1.6, { dash: 2 }, 4);
      X.seg(E, F, 'EF', 'mid', 2, { dash: 3 }, 4.5);
      fill(X, [B, C, F], 'fBCF', 'tBCF'); fill(X, [D, K, F], 'fDKF', 'tBCF');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['E', E], ['F', F], ['K', K]]);
      var th = 0;
      X.poly(function () {
        var q = [B, C, F].map(function (P) { var dx = P.X() - F.X(), dy = P.Y() - F.Y(), c = Math.cos(th), s = Math.sin(th); return [F.X() + dx * c - dy * s, F.Y() + dx * s + dy * c]; });
        return q.concat([q[0]]);
      }, { strokeWidth: 2.4, strokeColor: X.C.acc, fillColor: X.C.acc, fillOpacity: 0.5, highlight: false, fixed: true });
      X.anim({ label: 'Переложить треугольник', dur: 5000,
        steps: [[0, '△BCF — отрезаем'], [0.05, 'Поворачиваем вокруг F на 180°'], [0.97, '△BCF лёг на место △DKF: получился △ABK той же площади']],
        set: function (t) { th = t * Math.PI; } });
      b.on('update', function () {
        S.A = xy(A); S.B = xy(B); S.D = xy(D); S.C = xy(C);
        var a = D.X() - A.X(), bb = C.X() - B.X(), h = B.Y() - A.Y();
        var st = Math.abs(cross(A, B, C)) / 2 + Math.abs(cross(A, C, D)) / 2, sk = Math.abs(cross(A, B, K)) / 2;
        var ef = G.dist(E, F);
        X.ro([[['DK', G.f2(G.dist(D, K))], ['BC = b', G.f2(bb) + ' ' + ok(eq(G.dist(D, K), bb, 0.01))]],
              [['S<sub>ABCD</sub>', G.f2(st)], ['S<sub>ABK</sub>', G.f2(sk) + ' ' + ok(eq(st, sk, 0.01))]],
              [['EF', G.f2(ef)], ['(a+b)/2', G.f2((a + bb) / 2)], ['EF·h', G.f2(ef * h) + ' ' + ok(eq(st, ef * h, 0.02) && eq(ef, (a + bb) / 2, 0.01))]]]);
      });
    }
  };

  FIGS.p222 = {
    bbox: [-6.4, 6.6, 6.4, -2.4],
    state: function () { return { A: [-4.6, -1.2], D: 3.8, t: 0.45 }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -16]), Ah = X.H(function () { return A.X() + 1; }, function () { return A.Y(); });
      var D = X.G('D', [S.D, S.A[1]], b.create('line', [A, Ah], { visible: false }), [8, -16]);
      var sl = slider(X, -2.1, -2.5, 2.5, S.t, 'b');
      var tt = function () { return 0.25 + 0.5 * sl.t(); };
      var mx = function () { return (A.X() + D.X()) / 2; }, aa = function () { return D.X() - A.X(); }, bb = function () { return tt() * aa(); }, hh = function () { return (aa() + bb()) / 2; };
      var B = wp(X, 'B', function () { return [mx() - bb() / 2, A.Y() + hh()]; }, [-24, 4]), C = wp(X, 'C', function () { return [mx() + bb() / 2, A.Y() + hh()]; }, [8, 6]);
      G.guard(b, [A, D], function () { return aa() > 3 && aa() < 8 && A.X() > -5.6 && D.X() < 5.6 && Math.abs(A.Y() - D.Y()) < 0.001 && A.Y() > -1.8 && A.Y() < -0.4; });
      var Q = wp(X, 'Q', function () { return G.inter(xy(A), dir(A, C), xy(B), dir(B, D)); }, [8, -4]);
      var L = wp(X, 'L', function () { return [mx(), A.Y()]; }, [-4, -18]), K = wp(X, 'K', function () { return [mx(), B.Y()]; }, [-4, 8]);
      X.seg(A, B, 'AB', 'sides', 2, {}, 4.5); X.seg(B, C, 'BC', 'tb', 2, {}, 4.5); X.seg(C, D, 'CD', 'sides', 2, {}, 4.5); X.seg(D, A, 'DA', 'ta', 2, {}, 4.5);
      X.seg(A, C, 'AC', 'diag', 1.5, {}, 3.5); X.seg(B, D, 'BD', 'diag', 1.5, {}, 3.5); X.seg(K, L, 'KL', 'kl', 2, { dash: 2 }, 4.5);
      X.right(Q, A, B, 0.3, 'rQ', 'rQ');
      pts(X, [['A', A], ['B', B], ['C', C], ['D', D], ['Q', Q], ['K', K], ['L', L]]);
      b.on('update', function () {
        S.A = xy(A); S.D = D.X(); S.t = sl.t();
        var a = aa(), b2 = bb(), kl = G.dist(K, L), st = (a + b2) / 2 * hh();
        var ph = G.ang(Q, A, B);
        X.ro([[['∠AQB', G.deg(ph)], ['KL', G.f2(kl)], ['(a+b)/2', G.f2((a + b2) / 2) + ' ' + ok(eq(kl, (a + b2) / 2, 0.01) && eq(ph, Math.PI / 2, 0.01))]],
              [['S', G.f2(st)], ['KL²', G.f2(kl * kl) + ' ' + ok(eq(st, kl * kl, 0.02))]]]);
      });
    }
  };
})();
