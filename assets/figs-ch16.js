/* Глава 16. Метрические соотношения в окружности */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  var TAU = 2 * Math.PI, R0 = 2.4;
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function th(P) { return Math.atan2(P.Y(), P.X()); }
  function cr(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function circ(X, O, r, prim, tok, w) {
    var o = X.b.create('circle', [O, r], { fixed: true, strokeColor: X.C.fg, strokeWidth: w || 1.8, highlight: false, fillColor: 'none' });
    X.reg(prim, tok, o, { strokeColor: X.C.fg, strokeWidth: w || 1.8 }, { strokeColor: X.C.acc, strokeWidth: 4 }); return o;
  }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  function mkCircle(X) { var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, 4]); return { O: O, tg: X.b.create('circle', [O, R0], { visible: false }) }; }
  function onC(X, c, name, a, off) { return X.G(name, [R0 * Math.cos(a), R0 * Math.sin(a)], c.tg, off); }
  /* вторая точка пересечения прямой P–M с окружностью (P на окружности), возвращает [x,y] */
  function other(M, P) { var u = dir(P, M), l = Math.hypot(u[0], u[1]) || 1; u = [u[0] / l, u[1] / l]; var t = -2 * (P.X() * u[0] + P.Y() * u[1]); return [P.X() + t * u[0], P.Y() + t * u[1]]; }

  /* Рис. 16.1 — пересекающиеся хорды */
  FIGS.y161 = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: function () { return { M: [0.7, 0.35], A: 2.5, B: 4.2 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var M = X.P('M', S.M, [8, -16]), A = onC(X, c, 'A', S.A, [-20, 6]), Bp = onC(X, c, 'B', S.B, [-20, -16]);
      G.guard(b, [M, A, Bp], function () {
        var m = Math.hypot(M.X(), M.Y()); if (m < 0.15 || m > 1.9) return false;
        return G.dist(A, M) > 0.5 && G.dist(Bp, M) > 0.5 && Math.abs(cr(A, M, Bp)) > 0.5;
      });
      var A1 = wp(X, 'A<sub>1</sub>', function () { return other(M, A); }, [8, 6]), B1 = wp(X, 'B<sub>1</sub>', function () { return other(M, Bp); }, [8, 6]);
      var d = function () { var m = Math.hypot(M.X(), M.Y()) || 1; return [M.X() / m, M.Y() / m]; };
      var C = wp(X, 'C', function () { return [-R0 * d()[0], -R0 * d()[1]]; }, [-14, -18]), C1 = wp(X, 'C<sub>1</sub>', function () { return [R0 * d()[0], R0 * d()[1]]; }, [8, 8]);
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(A, A1, 'AA1', 'ch1', 2, {}, 4.5); X.seg(Bp, B1, 'BB1', 'ch2', 2, {}, 4.5); X.seg(C, C1, 'CC1', 'dia', 2, { dash: 2 }, 4.5);
      X.seg(A, Bp, 'AB', 'aux', 1.2, { dash: 3 }, 3.5); X.seg(A1, B1, 'A1B1', 'aux', 1.2, { dash: 3 }, 3.5);
      pts(X, [['O', O], ['M', M], ['A', A], ['B', Bp], ['A1', A1], ['B1', B1], ['C', C], ['C1', C1]]);
      b.on('update', function () {
        S.M = xy(M); S.A = th(A); S.B = th(Bp);
        var p1 = G.dist(A, M) * G.dist(M, A1), p2 = G.dist(Bp, M) * G.dist(M, B1), p3 = G.dist(C, M) * G.dist(M, C1), a = Math.hypot(M.X(), M.Y()), r2 = R0 * R0 - a * a;
        X.ro([[['AM·MA₁', G.f2(p1)], ['BM·MB₁', G.f2(p2)], ['CM·MC₁', G.f2(p3)]], [['R² − a²', G.f2(r2) + ' ' + ok(eq(p1, r2, 0.01) && eq(p2, r2, 0.01) && eq(p3, r2, 0.01))]]]);
      });
    }
  };

  /* Рис. 16.1а — теорема о бабочке */
  FIGS.y161a = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: function () { return { Q: [0.6, -0.25], A: 1.0, C: 2.2 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var Q = X.P('Q', S.Q, [-18, -18]), A = onC(X, c, 'A', S.A, [8, 6]), C = onC(X, c, 'C', S.C, [-20, 6]);
      function nrm() { var m = Math.hypot(Q.X(), Q.Y()) || 1; return [-Q.Y() / m, Q.X() / m]; }   /* направление MN */
      var Mq = wp(X, 'M', function () { var n = nrm(), q = Math.hypot(Q.X(), Q.Y()), h = Math.sqrt(Math.max(0, R0 * R0 - q * q)); return [Q.X() - n[0] * h, Q.Y() - n[1] * h]; }, [-20, 6]);
      var N = wp(X, 'N', function () { var n = nrm(), q = Math.hypot(Q.X(), Q.Y()), h = Math.sqrt(Math.max(0, R0 * R0 - q * q)); return [Q.X() + n[0] * h, Q.Y() + n[1] * h]; }, [8, -16]);
      G.guard(b, [Q, A, C], function () {
        var m = Math.hypot(Q.X(), Q.Y()); if (m < 0.35 || m > 1.8) return false;
        if (cr(Mq, N, A) * cr(Mq, N, C) <= 0) return false;
        return G.dist(A, Q) > 0.6 && G.dist(C, Q) > 0.6 && Math.abs(cr(A, Q, C)) > 0.5;
      });
      var Bp = wp(X, 'B', function () { return other(Q, A); }, [8, -16]), D = wp(X, 'D', function () { return other(Q, C); }, [8, -16]);
      var K = wp(X, 'K', function () { return G.inter(xy(A), dir(A, D), xy(Mq), dir(Mq, N)); }, [-10, -20]);
      var P = wp(X, 'P', function () { return G.inter(xy(Bp), dir(Bp, C), xy(Mq), dir(Mq, N)); }, [4, -20]);
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(Mq, N, 'MN', 'mn', 2, {}, 4.5); X.seg(A, Bp, 'AB', 'ch', 1.6, {}, 4); X.seg(C, D, 'CD', 'ch', 1.6, {}, 4);
      X.seg(A, D, 'AD', 'ad', 1.3, { dash: 2 }, 4); X.seg(C, Bp, 'CB', 'ad', 1.3, { dash: 2 }, 4); X.seg(K, Q, 'KQ', 'kq', 3.2, {}, 5); X.seg(Q, P, 'QP', 'kq', 3.2, {}, 5);
      pts(X, [['M', Mq], ['N', N], ['A', A], ['B', Bp], ['C', C], ['D', D], ['Q', Q], ['K', K], ['P', P]]);
      b.on('update', function () {
        S.Q = xy(Q); S.A = th(A); S.C = th(C);
        var kq = G.dist(K, Q), pq = G.dist(P, Q);
        X.ro([[['MQ', G.f2(G.dist(Mq, Q))], ['QN', G.f2(G.dist(Q, N)) + ' ' + ok(eq(G.dist(Mq, Q), G.dist(Q, N), 0.01))]],
              [['KQ', G.f2(kq)], ['PQ', G.f2(pq) + ' ' + ok(eq(kq, pq, 0.01))]]]);
      });
    }
  };

  /* Рис. 16.2 — секущие и касательная */
  FIGS.y162 = {
    bbox: [-3.6, 3.7, 9.2, -3.7],
    state: function () { return { M: [6.0, 0.2], A: 2.55, B: 3.95 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var M = X.P('M', S.M, [8, 8]), A1 = onC(X, c, 'A<sub>1</sub>', S.A, [-24, 8]), B1 = onC(X, c, 'B<sub>1</sub>', S.B, [-24, -16]);
      var A = wp(X, 'A', function () { return other(M, A1); }, [-4, 10]), Bp = wp(X, 'B', function () { return other(M, B1); }, [-4, -20]);
      var K = wp(X, 'K', function () { var d = Math.hypot(M.X(), M.Y()), t = Math.atan2(M.Y(), M.X()), be = Math.acos(R0 / d); return [R0 * Math.cos(t + be), R0 * Math.sin(t + be)]; }, [-12, 8]);
      G.guard(b, [M, A1, B1], function () {
        var d = Math.hypot(M.X(), M.Y()); if (d < 3.4 || d > 8.6) return false;
        return G.dist(M, A1) > G.dist(M, A) + 0.25 && G.dist(M, B1) > G.dist(M, Bp) + 0.25 && G.dist(A1, B1) > 0.7 && G.dist(A, Bp) > 0.4 && G.dist(A1, K) > 0.5;
      });
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(M, A1, 'MA1', 's1', 2, {}, 4.5); X.seg(M, B1, 'MB1', 's2', 2, {}, 4.5); X.seg(M, K, 'MK', 'tan', 2, {}, 4.5);
      X.seg(A, K, 'AK', 'aux', 1.2, { dash: 3 }, 3.5); X.seg(A1, K, 'A1K', 'aux', 1.2, { dash: 3 }, 3.5); X.seg(O, M, 'OM', 'om', 1.2, { dash: 2 }, 3.5);
      pts(X, [['O', O], ['M', M], ['A', A], ['B', Bp], ['A1', A1], ['B1', B1], ['K', K]]);
      b.on('update', function () {
        S.M = xy(M); S.A = th(A1); S.B = th(B1);
        var p1 = G.dist(M, A1) * G.dist(M, A), p2 = G.dist(M, B1) * G.dist(M, Bp), t2 = Math.pow(G.dist(M, K), 2), a = Math.hypot(M.X(), M.Y()), r2 = a * a - R0 * R0;
        X.ro([[['MA₁·MA', G.f2(p1)], ['MB₁·MB', G.f2(p2)], ['MK²', G.f2(t2)]], [['a² − R²', G.f2(r2) + ' ' + ok(eq(p1, r2, 0.02) && eq(p2, r2, 0.02) && eq(t2, r2, 0.02))]]]);
      });
    }
  };
})();
