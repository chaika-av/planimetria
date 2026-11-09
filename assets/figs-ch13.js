/* Глава 13. Измерение углов, связанных с окружностью */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  var TAU = 2 * Math.PI, R0 = 2.4;
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  function eq(a, b, t) { return Math.abs(a - b) <= (t || 0.006); }
  function xy(P) { return [P.X(), P.Y()]; }
  function dir(P, Q) { return [Q.X() - P.X(), Q.Y() - P.Y()]; }
  function wp(X, name, f, off) { return X.D(name, function () { return f()[0]; }, function () { return f()[1]; }, off); }
  function sv(S, o) { Object.keys(o).forEach(function (k) { S[k] = [o[k].X(), o[k].Y()]; }); }
  function cr(a, b, c) { return (b.X() - a.X()) * (c.Y() - a.Y()) - (b.Y() - a.Y()) * (c.X() - a.X()); }
  function th(P) { return Math.atan2(P.Y(), P.X()); }
  function ccw(a, b) { return ((b - a) % TAU + TAU) % TAU; }
  /* мера дуги PQ (центр в начале координат), не содержащей точку Z */
  function arcM(P, Q, Z) { var d = ccw(th(P), th(Q)), z = ccw(th(P), th(Z)); return z > 0 && z < d ? TAU - d : d; }
  function dg(x) { return G.deg(x); }
  function circ(X, O, r, prim, tok, w) {
    var o = X.b.create('circle', [O, r], { fixed: true, strokeColor: X.C.fg, strokeWidth: w || 1.8, highlight: false, fillColor: 'none' });
    X.reg(prim, tok, o, { strokeColor: X.C.fg, strokeWidth: w || 1.8 }, { strokeColor: X.C.acc, strokeWidth: 4 }); return o;
  }
  function pts(X, arr) { arr.forEach(function (p) { X.pt(p[1], 'p' + p[0], p[0]); }); }
  function mkCircle(X) { var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, 4]); return { O: O, tg: X.b.create('circle', [O, R0], { visible: false }) }; }
  function onC(X, c, name, a, off) { return X.G(name, [R0 * Math.cos(a), R0 * Math.sin(a)], c.tg, off); }
  /* вторая точка пересечения луча из M через P с окружностью (ближняя) */
  function near(M, P) { var u = dir(M, P), l = Math.hypot(u[0], u[1]); u = [u[0] / l, u[1] / l]; var bq = M.X() * u[0] + M.Y() * u[1], c = M.X() * M.X() + M.Y() * M.Y() - R0 * R0, s = Math.sqrt(Math.max(0, bq * bq - c)); var t = -bq - s; return [M.X() + t * u[0], M.Y() + t * u[1]]; }
  function sd(P) { return [P.X(), P.Y()]; }

  /* Рис. 13.1 — вписанный угол */
  FIGS.u131 = {
    bbox: [-3.6, 3.7, 3.6, -3.4],
    state: function () { return { A: 2.6, B: 4.1, C: 0.35 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var A = onC(X, c, 'A', S.A, [-18, 6]), Bp = onC(X, c, 'B', S.B, [-20, 6]), C = onC(X, c, 'C', S.C, [8, 6]);
      var D = X.D('D', function () { return -Bp.X(); }, function () { return -Bp.Y(); }, [8, -16]);
      G.guard(b, [A, Bp, C], function () {
        if (G.dist(A, Bp) < 1.0 || G.dist(C, Bp) < 1.0 || G.dist(A, C) < 1.0) return false;
        return Math.abs(G.ang(Bp, A, D) + G.ang(Bp, D, C) - G.ang(Bp, A, C)) < 1e-6 && G.dist(A, D) > 0.4 && G.dist(C, D) > 0.4;
      });
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(Bp, A, 'BA', 'angle', 2, {}, 4.5); X.seg(Bp, C, 'BC', 'angle', 2, {}, 4.5); X.seg(Bp, D, 'BD', 'dia', 1.6, {}, 4.5);
      X.seg(O, A, 'OA', 'cen', 1.3, { dash: 2 }, 3.5); X.seg(O, C, 'OC', 'cen', 1.3, { dash: 2 }, 3.5);
      X.ang(Bp, A, D, 0.7, 'α', 'a1', 'al'); X.ang(Bp, D, C, 0.9, 'β', 'a2', 'be'); X.ang(O, A, D, 0.55, '2α', 'a3', 'al2');
      pts(X, [['O', O], ['A', A], ['B', Bp], ['C', C], ['D', D]]);
      function an(P, V, Q) { var ux = P[0] - V[0], uy = P[1] - V[1], vx = Q[0] - V[0], vy = Q[1] - V[1]; return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))))); }
      function okB(t) {
        var B = [R0 * Math.cos(t), R0 * Math.sin(t)], Dd = [-B[0], -B[1]], a = xy(A), cc = xy(C), d = function (p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); };
        if (d(a, B) < 1.0 || d(cc, B) < 1.0 || d(a, cc) < 1.0 || d(a, Dd) < 0.45 || d(cc, Dd) < 0.45) return false;
        return Math.abs(an(B, a, Dd) * 0 + an(a, B, Dd) + an(Dd, B, cc) - an(a, B, cc)) < 1e-6;
      }
      var run = null;
      function findRun() {
        var N = 720, best = [0, 0], i, cur = null, ok0 = [];
        for (i = 0; i < N; i++) ok0.push(okB(i * TAU / N));
        var s0 = ok0.indexOf(false); if (s0 < 0) return [0, TAU];
        for (i = 1; i <= N; i++) {
          var k = (s0 + i) % N, v = ok0[k];
          if (v && cur === null) cur = i;
          if ((!v || i === N) && cur !== null) { var e = v ? i : i - 1; if (e - cur > best[1] - best[0]) best = [cur, e]; cur = null; }
        }
        return [((s0 + best[0]) % N) * TAU / N + 0.04, ((s0 + best[1]) % N) * TAU / N - 0.04 + (((s0 + best[1]) % N) < ((s0 + best[0]) % N) ? TAU : 0)];
      }
      X.anim({ label: 'Двигать вершину B', dur: 7000, t0: null,
        steps: [[0, 'Вершина B бежит по дуге'], [0.1, '∠ABC не меняется, пока B на той же дуге'], [0.9, 'Опирается на ту же дугу ADC — равен её половине']],
        set: function (t) {
          if (!run || t === 0) run = findRun();
          var ang = run[0] + (run[1] - run[0]) * t;
          Bp.setPosition(JXG.COORDS_BY_USER, [R0 * Math.cos(ang), R0 * Math.sin(ang)]);
        } });
      b.on('update', function () {
        S.A = th(A); S.B = th(Bp); S.C = th(C);
        var abc = G.ang(Bp, A, C), arc = arcM(A, C, Bp), al = G.ang(Bp, A, D), aod = G.ang(O, A, D);
        X.ro([[['∠ABC', dg(abc)], ['½ дуги ADC', dg(arc / 2) + ' ' + ok(eq(abc, arc / 2, 0.004))]],
              [['α', dg(al)], ['∠AOD', dg(aod)], ['2α', dg(2 * al) + ' ' + ok(eq(aod, 2 * al, 0.004))]]]);
      });
    }
  };

  /* Рис. 13.2 — угол между касательной и хордой */
  FIGS.u132 = {
    bbox: [-4.4, 3.7, 4.4, -3.5],
    state: function () { return { C: -1.9, s: 1.9, D: -0.25 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var C = onC(X, c, 'C', S.C, [-18, -18]);
      var Th = X.H(function () { return C.X() - C.Y(); }, function () { return C.Y() + C.X(); });
      var tl = b.create('line', [C, Th], { visible: false });
      var A = X.G('A', [C.X() - C.Y() / R0 * S.s, C.Y() + C.X() / R0 * S.s], tl, [-8, 8]);
      var D = onC(X, c, 'D', S.D, [8, 6]);
      var E = X.D('E', function () { return -C.X(); }, function () { return -C.Y(); }, [8, 6]);
      function side(P) { return cr(C, E, P) > 0 ? 1 : -1; }
      G.guard(b, [C, A, D], function () { return G.dist(A, C) > 0.9 && G.dist(D, C) > 0.8 && G.dist(D, E) > 0.8 && side(A) === side(D) && G.dist(A, C) < 4.6; });
      var T1 = X.H(function () { var u = dir(C, A), l = Math.hypot(u[0], u[1]) || 1; return C.X() - u[0] / l * 2.0; }, function () { var u = dir(C, A), l = Math.hypot(u[0], u[1]) || 1; return C.Y() - u[1] / l * 2.0; });
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(T1, A, 'tan', 'tan', 2, {}, 4.5); X.seg(C, D, 'CD', 'chord', 2, {}, 4.5); X.seg(C, E, 'CE', 'dia', 1.5, {}, 4); X.seg(D, E, 'DE', 'dia', 1.3, { dash: 2 }, 3.5);
      X.ang(C, A, D, 0.7, '', 'a1', 'acd'); X.ang(C, D, E, 0.95, '', 'a2', 'dce');
      X.right(C, A, E, 0.3, 'rC', 'rC');
      pts(X, [['O', O], ['A', A], ['C', C], ['D', D], ['E', E]]);
      b.on('update', function () {
        S.C = th(C); S.s = G.dist(A, C); S.D = th(D);
        var acd = G.ang(C, A, D), cod = G.ang(O, C, D);
        var dce = G.ang(C, D, E), arcDE = G.ang(O, D, E);
        X.ro([[['∠ACD', dg(acd)], ['½ дуги CmD', dg(cod / 2) + ' ' + ok(eq(acd, cod / 2, 0.004))]],
              [['∠ACE', dg(G.ang(C, A, E))], ['∠DCE', dg(dce)], ['½ дуги DnE', dg(arcDE / 2) + ' ' + ok(eq(dce, arcDE / 2, 0.004))]],
              [['90° − ∠DCE', dg(Math.PI / 2 - dce) + ' ' + ok(eq(acd, Math.PI / 2 - dce, 0.004))]]]);
      });
    }
  };

  /* Рис. 13.2а — вписанная окружность треугольника из двух касательных и хорды */
  FIGS.u133 = {
    bbox: [-3.4, 3.7, 8.6, -3.7],
    state: function () { return { A: [5.7, 0.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var A = X.P('A', S.A, [8, 8]);
      G.guard(b, [A], function () { var d = Math.hypot(A.X(), A.Y()); return d > 3.6 && d < 8.4; });
      function tp(sg) { return function () { var d = Math.hypot(A.X(), A.Y()), t = Math.atan2(A.Y(), A.X()), be = Math.acos(R0 / d); return [R0 * Math.cos(t + sg * be), R0 * Math.sin(t + sg * be)]; }; }
      var Bp = wp(X, 'B', tp(1), [-6, 8]), C = wp(X, 'C', tp(-1), [-6, -20]);
      var O1 = wp(X, 'O<sub>1</sub>', function () { var d = Math.hypot(A.X(), A.Y()); return [A.X() * R0 / d, A.Y() * R0 / d]; }, [-26, 4]);
      var M = wp(X, 'M', function () { return G.foot(Bp, O, A); }, [-4, 10]);
      function area() { return Math.abs(cr(A, Bp, C)) / 2; } function pp() { return (G.dist(A, Bp) + G.dist(A, C) + G.dist(Bp, C)) / 2; }
      function r() { return area() / pp(); }
      circ(X, O, R0, 'cir', 'cir', 2); circ(X, O1, r, 'ins', 'ins', 1.6);
      X.seg(A, Bp, 'AB', 'tt', 2, {}, 4.5); X.seg(A, C, 'AC', 'tt', 2, {}, 4.5); X.seg(Bp, C, 'BC', 'ch', 2, {}, 4.5);
      X.seg(O, Bp, 'OB', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O, C, 'OC', 'rad', 1.2, { dash: 2 }, 3.5); X.seg(O, A, 'OA', 'ax', 1.3, { dash: 3 }, 4);
      X.seg(O1, Bp, 'O1B', 'bis', 1.4, {}, 4); X.seg(O1, C, 'O1C', 'bis', 1.4, {}, 4);
      X.ang(Bp, A, O1, 0.5, '3', 'a3', '3'); X.ang(Bp, O1, C, 0.65, '2', 'a2', '2');
      pts(X, [['O', O], ['A', A], ['B', Bp], ['C', C], ['O1', O1], ['M', M]]);
      b.on('update', function () {
        sv(S, { A: A });
        var a = Math.hypot(A.X(), A.Y()), rr = (a - R0) * R0 / a;
        var f1 = G.foot(O1, A, Bp), f2 = G.foot(O1, A, C), f3 = G.foot(O1, Bp, C);
        var h1 = Math.hypot(O1.X() - f1[0], O1.Y() - f1[1]), h2 = Math.hypot(O1.X() - f2[0], O1.Y() - f2[1]), h3 = Math.hypot(O1.X() - f3[0], O1.Y() - f3[1]);
        X.ro([[['∠3 = ∠ABO₁', dg(G.ang(Bp, A, O1))], ['∠2 = ∠O₁BC', dg(G.ang(Bp, O1, C)) + ' ' + ok(eq(G.ang(Bp, A, O1), G.ang(Bp, O1, C), 0.004))]],
              [['до AB', G.f2(h1)], ['до AC', G.f2(h2)], ['до BC', G.f2(h3) + ' ' + ok(eq(h1, h2, 0.01) && eq(h2, h3, 0.01))]],
              [['r = S/p', G.f2(r())], ['(a − R)R / a', G.f2(rr) + ' ' + ok(eq(r(), rr, 0.005))]]]);
      });
    }
  };

  /* Рис. 13.3 — угол между пересекающимися хордами */
  FIGS.u134 = {
    bbox: [-3.6, 3.7, 3.6, -3.5],
    state: function () { return { A: 2.45, B: -0.55, C: 1.2, D: 4.9 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var A = onC(X, c, 'A', S.A, [-22, 6]), Bp = onC(X, c, 'B', S.B, [8, -16]), C = onC(X, c, 'C', S.C, [8, 6]), D = onC(X, c, 'D', S.D, [-22, -14]);
      G.guard(b, [A, Bp, C, D], function () {
        return cr(A, Bp, C) * cr(A, Bp, D) < 0 && cr(C, D, A) * cr(C, D, Bp) < 0 && [[A, C], [A, D], [Bp, C], [Bp, D], [A, Bp], [C, D]].every(function (p) { return G.dist(p[0], p[1]) > 0.7; });
      });
      var M = wp(X, 'M', function () { return G.inter(xy(A), dir(A, Bp), xy(C), dir(C, D)); }, [8, -16]);
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(A, Bp, 'AB', 'ch', 2, {}, 4.5); X.seg(C, D, 'CD', 'ch', 2, {}, 4.5); X.seg(C, A, 'CA', 'aux', 1.3, { dash: 2 }, 3.5);
      X.ang(M, A, D, 0.55, '1', 'a1', '1'); X.ang(C, A, M, 0.7, '2', 'a2', '2'); X.ang(A, C, Bp, 0.7, '3', 'a3', '3');
      pts(X, [['A', A], ['B', Bp], ['C', C], ['D', D], ['M', M]]);
      b.on('update', function () {
        S.A = th(A); S.B = th(Bp); S.C = th(C); S.D = th(D);
        var am = G.ang(M, A, D), ad = arcM(A, D, C), cb = arcM(C, Bp, A);
        X.ro([[['∠AMD', dg(am)]], [['дуга AmD', dg(ad)], ['дуга CnB', dg(cb)]], [['½ (AmD + CnB)', dg((ad + cb) / 2) + ' ' + ok(eq(am, (ad + cb) / 2, 0.004))]]]);
      });
    }
  };

  /* Рис. 13.4 — секущие из внешней точки */
  FIGS.u135 = {
    bbox: [-3.6, 3.7, 8.8, -3.5],
    state: function () { return { M: [6.2, 0.2], A: 2.55, D: 3.85 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var M = X.P('M', S.M, [8, 8]), A = onC(X, c, 'A', S.A, [-14, 8]), D = onC(X, c, 'D', S.D, [-14, -18]);
      var Bp = wp(X, 'B', function () { return near(M, A); }, [-4, 10]), C = wp(X, 'C', function () { return near(M, D); }, [-4, -20]);
      G.guard(b, [M, A, D], function () {
        var d = Math.hypot(M.X(), M.Y()); if (d < 3.6 || d > 8.4) return false;
        return G.dist(M, A) > G.dist(M, Bp) + 0.25 && G.dist(M, D) > G.dist(M, C) + 0.25 && G.dist(A, D) > 0.8 && G.dist(Bp, C) > 0.5 && cr(M, A, D) !== 0;
      });
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(M, A, 'MA', 'sec', 2, {}, 4.5); X.seg(M, D, 'MD', 'sec', 2, {}, 4.5); X.seg(Bp, D, 'BD', 'aux', 1.3, { dash: 2 }, 3.5);
      X.ang(M, A, D, 0.9, '1', 'a1', '1');
      pts(X, [['M', M], ['A', A], ['B', Bp], ['C', C], ['D', D]]);
      b.on('update', function () {
        S.M = xy(M); S.A = th(A); S.D = th(D);
        var am = G.ang(M, A, D), ad = arcM(A, D, Bp), bc = arcM(Bp, C, A);
        X.ro([[['∠AMD', dg(am)]], [['дуга AmD', dg(ad)], ['дуга BnC', dg(bc)]], [['½ (AmD − BnC)', dg((ad - bc) / 2) + ' ' + ok(eq(am, (ad - bc) / 2, 0.004))]]]);
      });
    }
  };

  /* Рис. 13.5 — касательная и секущая */
  FIGS.u136 = {
    bbox: [-3.6, 3.7, 8.8, -3.5],
    state: function () { return { M: [6.0, -0.3], A: 3.3 }; },
    build: function (X) {
      var b = X.b, S = X.S, c = mkCircle(X), O = c.O;
      var M = X.P('M', S.M, [8, -16]), A = onC(X, c, 'A', S.A, [-14, 8]);
      var Bp = wp(X, 'B', function () { return near(M, A); }, [-4, -20]);
      var D = wp(X, 'D', function () { var d = Math.hypot(M.X(), M.Y()), t = Math.atan2(M.Y(), M.X()), be = Math.acos(R0 / d); return [R0 * Math.cos(t + be), R0 * Math.sin(t + be)]; }, [-14, 6]);
      G.guard(b, [M, A], function () { var d = Math.hypot(M.X(), M.Y()); return d > 3.6 && d < 8.4 && G.dist(M, A) > G.dist(M, Bp) + 0.25 && G.dist(A, D) > 0.7 && G.dist(Bp, D) > 0.7; });
      circ(X, O, R0, 'cir', 'cir', 2);
      X.seg(M, A, 'MA', 'sec', 2, {}, 4.5); X.seg(M, D, 'MD', 'tan', 2, {}, 4.5); X.seg(Bp, D, 'BD', 'aux', 1.3, { dash: 2 }, 3.5); X.seg(A, D, 'AD', 'aux', 1.3, { dash: 2 }, 3.5);
      X.ang(M, A, D, 0.9, '1', 'a1', '1');
      pts(X, [['M', M], ['A', A], ['B', Bp], ['D', D]]);
      b.on('update', function () {
        S.M = xy(M); S.A = th(A);
        var am = G.ang(M, A, D), ad = arcM(A, D, Bp), bd = arcM(Bp, D, A);
        X.ro([[['∠AMD', dg(am)]], [['дуга AmD', dg(ad)], ['дуга BnD', dg(bd)]], [['½ (AmD − BnD)', dg((ad - bd) / 2) + ' ' + ok(eq(am, (ad - bd) / 2, 0.004))]]]);
      });
    }
  };
})();
