/* Глава 7. Теорема косинусов */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  FIGS.k71 = {
    bbox: [-5.4, 4.4, 5.4, -2.8],
    state: function () { return { A: [-1.2, 3.0], B: [-4.2, -1.6], C: [4.2, -1.6] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-4, 10]), B = X.P('B', S.B, [-22, -14]), C = X.P('C', S.C, [8, -14]);
      G.guard(b, [A, B, C], function () { var m = [G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)]; return m.every(function (x) { return isFinite(x) && x > 0.2 && x < 2.9; }) && G.dist(B, C) > 1.5; });
      X.seg(B, C, 'a', 'a', 2.2, {}, 5); X.seg(A, B, 'c', 'c', 2, {}, 4.5); X.seg(C, A, 'b', 'b', 2, {}, 4.5);
      X.ang(A, B, C, 0.9, '<i>A</i>', 'aA', 'A');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C');
      function okC(ph) {
        var Cx = A.X() + Math.hypot(C.X() - A.X(), C.Y() - A.Y()) * Math.cos(ph), Cy = A.Y() + Math.hypot(C.X() - A.X(), C.Y() - A.Y()) * Math.sin(ph);
        var len = function (p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }, a_ = [A.X(), A.Y()], b_ = [B.X(), B.Y()], c_ = [Cx, Cy];
        var an = function (v, p, q) { var ux = p[0] - v[0], uy = p[1] - v[1], vx = q[0] - v[0], vy = q[1] - v[1]; return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))))); };
        var m = [an(a_, b_, c_), an(b_, c_, a_), an(c_, a_, b_)];
        return m.every(function (x) { return isFinite(x) && x > 0.2 && x < 2.9; }) && len(b_, c_) > 1.5 && Math.abs(Cx) < 5.2 && Cy < 4.2 && Cy > -2.6;
      }
      var run7 = null;
      function find7() {
        var N = 360, ok0 = [], i, best = null, cur = null;
        for (i = 0; i < N; i++) ok0.push(okC(i * 2 * Math.PI / N));
        for (i = 0; i < N; i++) { if (ok0[i] && cur === null) cur = i; if ((!ok0[i] || i === N - 1) && cur !== null) { var e = ok0[i] ? i : i - 1; if (!best || e - cur > best[1] - best[0]) best = [cur, e]; cur = null; } }
        return best ? [best[0] * 2 * Math.PI / N + 0.03, best[1] * 2 * Math.PI / N - 0.03] : null;
      }
      var r0 = null;
      X.anim({ label: 'Менять угол A', dur: 9000, t0: null,
        steps: [[0, 'Угол A меняется, стороны b и c не меняются'], [0.1, 'a² = b² + c² − 2bc·cos A при любом угле'], [0.5, 'При A = 90° косинус равен нулю: теорема Пифагора']],
        set: function (t) {
          if (!run7 || t === 0) { r0 = Math.hypot(C.X() - A.X(), C.Y() - A.Y()); run7 = find7(); }
          if (!run7) return;
          var ph = run7[0] + (run7[1] - run7[0]) * t;
          C.setPosition(JXG.COORDS_BY_USER, [A.X() + r0 * Math.cos(ph), A.Y() + r0 * Math.sin(ph)]);
        } });
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.C = [C.X(), C.Y()];
        var a = G.dist(B, C), bb = G.dist(C, A), c = G.dist(A, B), Aa = G.ang(A, B, C), rhs = bb * bb + c * c - 2 * bb * c * Math.cos(Aa);
        X.ro([[['a²', G.f2(a * a)], ['b² + c² − 2bc·cos A', G.f2(rhs) + ' ' + ok(eq(a * a, rhs, 0.01))]],
              [['∠A', G.deg(Aa)], ['cos A', G.f2(Math.cos(Aa))]]]);
      });
    }
  };
})();
