/* Глава 1. Углы с соответственно параллельными или перпендикулярными сторонами */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  var DEG = Math.PI / 180;
  function unit(dx, dy) { var l = Math.hypot(dx, dy) || 1e-9; return [dx / l, dy / l]; }

  /* Рис. 1.1 — стороны углов параллельны: углы равны или составляют в сумме 180° */
  FIGS.r11 = {
    bbox: [-6, 4.6, 6, -4.6],
    state: function () { return { A: [-3.61, -0.29], Ad: [-0.92, 2.94], B: [-0.96, -1.38], C: [-5.2, 1.16], Cd: [-3.2, 1.32], D: [-5.2, -2.4] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('', S.A), Ad = X.P('', S.Ad), B = X.P('', S.B), Cc = X.P('', S.C), Cd = X.P('', S.Cd), Dd = X.P('', S.D);
      function u() { return unit(Ad.X() - A.X(), Ad.Y() - A.Y()); }       /* направление прямых a ∥ b */
      function v() { return unit(Cd.X() - Cc.X(), Cd.Y() - Cc.Y()); }     /* направление прямых c ∥ d */
      function I(P, d, Q, e) { return G.inter([P.X(), P.Y()], d, [Q.X(), Q.Y()], e); }
      var V1 = X.D('', function () { return I(A, u(), Cc, v())[0]; }, function () { return I(A, u(), Cc, v())[1]; });
      var V3 = X.D('', function () { return I(B, u(), Cc, v())[0]; }, function () { return I(B, u(), Cc, v())[1]; });
      var V2 = X.D('', function () { return I(B, u(), Dd, v())[0]; }, function () { return I(B, u(), Dd, v())[1]; });
      function ray(V, d, s) { return X.H(function () { return V.X() + d()[0] * s; }, function () { return V.Y() + d()[1] * s; }); }
      function neg(f) { return function () { var d = f(); return [-d[0], -d[1]]; }; }
      var up = u, un = neg(u), vp = v, vn = neg(v);
      function longLine(P, d, name, tok, w) { return X.seg(ray(P, d, 12), ray(P, neg(d), 12), name, tok, w || 1.6, {}, 3.6); }
      longLine(A, u, 'la', 'a'); longLine(B, u, 'lb', 'b'); longLine(Cc, v, 'lc', 'c'); longLine(Dd, v, 'ld', 'd');
      /* отметки направления: стрелочки «∥» засечками */
      function ang(V, dv, du, rad, prim, tok, sh) {
        var P = ray(V, dv, 1), Q = ray(V, du, 1);
        X.arc(V, P, Q, rad, prim, tok);
        X.lbl(function () { var a = dv(), c = du(), x = a[0] + c[0], y = a[1] + c[1], l = Math.hypot(x, y) || 1; return V.X() + x / l * (rad + 0.55); },
              function () { var a = dv(), c = du(), x = a[0] + c[0], y = a[1] + c[1], l = Math.hypot(x, y) || 1; return V.Y() + y / l * (rad + 0.55); }, sh, prim, tok);
      }
      ang(V1, vp, up, 0.9, 'a1', 'a1', '1');
      ang(V3, vp, up, 0.9, 'a3', 'a3', '3');
      ang(V2, vp, up, 0.9, 'a2', 'a2', '2');
      ang(V2, vn, un, 0.9, 'a4', 'a4', '4');
      ang(V2, vn, up, 1.35, 'a5', 'a5', '5');
      ang(V2, vp, un, 1.35, 'a6', 'a6', '6');
      X.pt(A, 'pA', ''); X.pt(Ad, 'pAd', ''); X.pt(B, 'pB', ''); X.pt(Cc, 'pC', ''); X.pt(Cd, 'pCd', ''); X.pt(Dd, 'pD', '');
      X.alias('1=3', ['a1', 'a3']); X.alias('3=2', ['a3', 'a2']); X.alias('1=2', ['a1', 'a2']); X.alias('4=2', ['a4', 'a2']); X.alias('1=4', ['a1', 'a4']);
      X.alias('1+5', ['a1', 'a5']); X.alias('1+6', ['a1', 'a6']); X.alias('5+2', ['a5', 'a2']); X.alias('6+2', ['a6', 'a2']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.Ad = [Ad.X(), Ad.Y()]; S.B = [B.X(), B.Y()]; S.C = [Cc.X(), Cc.Y()]; S.Cd = [Cd.X(), Cd.Y()]; S.D = [Dd.X(), Dd.Y()];
        function a(V, dv, du) { return G.ang(V, ray(V, dv, 1), ray(V, du, 1)); }
        var g1 = a(V1, vp, up), g3 = a(V3, vp, up), g2 = a(V2, vp, up), g4 = a(V2, vn, un), g5 = a(V2, vn, up), g6 = a(V2, vp, un);
        X.ro([[['∠1', G.deg(g1)], ['∠3', G.deg(g3)], ['∠2', G.deg(g2) + ' ' + (Math.abs(g1 - g3) < 1e-4 && Math.abs(g3 - g2) < 1e-4 ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>')]],
              [['∠4', G.deg(g4)], ['∠1', G.deg(g1) + ' ' + G.ok(g4, g1, 1e-4)]],
              [['∠1 + ∠5', G.deg(g1 + g5)], ['∠1 + ∠6', G.deg(g1 + g6) + ' ' + (Math.abs(g1 + g5 - Math.PI) < 1e-4 && Math.abs(g1 + g6 - Math.PI) < 1e-4 ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>')]]]);
      });
    }
  };

  /* Рис. 1.2 — стороны углов перпендикулярны: ∠1 = ∠4 */
  FIGS.r12 = {
    bbox: [-6.2, 4.6, 6.2, -4.8],
    state: function () { return { V: [-4.6, -1.9], Ph: [-1.8, 3.4], Qh: [1.4, -1.48], Pr: [-3.24, 0.66], T: [4.4, -1.27] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var V = X.P('', S.V), Ph = X.P('', S.Ph), Qh = X.P('', S.Qh);
      function up() { return unit(Ph.X() - V.X(), Ph.Y() - V.Y()); }
      function uq() { return unit(Qh.X() - V.X(), Qh.Y() - V.Y()); }
      var lp = b.create('line', [V, Ph], { visible: false }), lq = b.create('line', [V, Qh], { visible: false });
      var Pr = X.G('', S.Pr, lp), T = X.G('', S.T, lq);
      function pt(P) { return [P.X(), P.Y()]; }
      function dp() { var d = up(); return [-d[1], d[0]]; }               /* r ⟂ p */
      function dq() { var d = uq(); return [-d[1], d[0]]; }               /* s ⟂ q */
      var X7 = X.D('', function () { return G.inter(pt(V), uq(), pt(Pr), dp())[0]; }, function () { return G.inter(pt(V), uq(), pt(Pr), dp())[1]; });
      var Y = X.D('', function () { return G.inter(pt(Pr), dp(), pt(T), dq())[0]; }, function () { return G.inter(pt(Pr), dp(), pt(T), dq())[1]; });
      function R(P, f, s) { return X.H(function () { return P.X() + f()[0] * s; }, function () { return P.Y() + f()[1] * s; }); }
      function Hp(P, Q) { return X.H(function () { return P.X() + (Q.X() - P.X()) * 1; }, function () { return P.Y() + (Q.Y() - P.Y()) * 1; }); }
      X.seg(V, R(V, up, 8), 'p', 'p', 1.8, {}, 4.2);
      X.seg(V, R(V, uq, 12), 'q', 'q', 1.8, {}, 4.2);
      X.seg(R(Pr, dp, 3.4), R(Pr, dp, -9), 'r', 'r', 1.8, {}, 4.2);
      X.seg(R(T, dq, 1.6), Y, 's', 's', 1.5, { dash: 3 }, 4.2);
      X.seg(Y, R(Y, dq, -1.0), 's2', 's', 1.5, { dash: 3 }, 4.2);
      X.right(Pr, V, R(Pr, dp, 1), 0.26, 'rP', 'r');
      X.right(T, X7, Y, 0.26, 'rT', 's');
      function rv(P, d, s) { return function () { return [P.X() + d()[0] * s, P.Y() + d()[1] * s]; }; }
      function pts(f) { return { X: function () { return f()[0]; }, Y: function () { return f()[1]; } }; }
      function dirTo(A1, B1) { return function () { return unit(B1.X() - A1.X(), B1.Y() - A1.Y()); }; }
      function ang(V0, P, Q, rad, prim, tok, sh) {
        X.arc(V0, P, Q, rad, prim, tok);
        X.lbl(function () { var a = unit(P.X() - V0.X(), P.Y() - V0.Y()), c = unit(Q.X() - V0.X(), Q.Y() - V0.Y()), x = a[0] + c[0], y = a[1] + c[1], l = Math.hypot(x, y) || 1; return V0.X() + x / l * (rad + 0.5); },
              function () { var a = unit(P.X() - V0.X(), P.Y() - V0.Y()), c = unit(Q.X() - V0.X(), Q.Y() - V0.Y()), x = a[0] + c[0], y = a[1] + c[1], l = Math.hypot(x, y) || 1; return V0.Y() + y / l * (rad + 0.5); }, sh, prim, tok);
      }
      function far(P, d, s) { return X.H(function () { return P.X() + d()[0] * s; }, function () { return P.Y() + d()[1] * s; }); }
      var back = function (f) { return function () { var d = f(); return [-d[0], -d[1]]; }; };
      var Pp = far(Pr, function () { return up(); }, 0);                    /* точка Pr */
      var toPr = function () { return unit(Pr.X() - V.X(), Pr.Y() - V.Y()); };
      var alongQ = function () { return unit(X7.X() - V.X(), X7.Y() - V.Y()); };
      var q1P = far(V, toPr, 1.0), q1Q = far(V, alongQ, 1.0);
      ang(V, q1P, q1Q, 0.85, 'a1', 'a1', '1');
      var x7a = far(X7, function () { var d = alongQ(); return [-d[0], -d[1]]; }, 1), x7b = far(X7, function () { return unit(Pr.X() - X7.X(), Pr.Y() - X7.Y()); }, 1);
      ang(X7, x7a, x7b, 0.85, 'a7', 'a7', '7');
      var x8a = far(X7, dirTo(X7, T), 1), x8b = far(X7, function () { return unit(Y.X() - X7.X(), Y.Y() - X7.Y()); }, 1);
      ang(X7, x8a, x8b, 0.85, 'a8', 'a8', '8');
      var y4a = far(Y, function () { return unit(T.X() - Y.X(), T.Y() - Y.Y()); }, 1), y4b = far(Y, function () { return unit(X7.X() - Y.X(), X7.Y() - Y.Y()); }, 1);
      ang(Y, y4a, y4b, 0.85, 'a4', 'a4', '4');
      var y2a = far(Y, function () { var d = unit(T.X() - Y.X(), T.Y() - Y.Y()); return [-d[0], -d[1]]; }, 1), y2b = far(Y, function () { var d = unit(X7.X() - Y.X(), X7.Y() - Y.Y()); return [-d[0], -d[1]]; }, 1);
      ang(Y, y2a, y2b, 0.85, 'a2', 'a2', '2');
      ang(Y, y4a, y2b, 1.3, 'a5', 'a5', '5');
      ang(Y, y2a, y4b, 1.3, 'a6', 'a6', '6');
      X.pt(V, 'pV', ''); X.pt(Ph, 'pPh', ''); X.pt(Qh, 'pQh', ''); X.pt(Pr, 'pPr', ''); X.pt(T, 'pT', '');
      X.alias('7=8', ['a7', 'a8']); X.alias('7=90-1', ['a7', 'a1']); X.alias('8=90-4', ['a8', 'a4']); X.alias('1=4', ['a1', 'a4']); X.alias('2=4', ['a2', 'a4']); X.alias('2=1', ['a2', 'a1']);
      X.alias('1+5', ['a1', 'a5']); X.alias('1+6', ['a1', 'a6']); X.alias('5+2', ['a5', 'a2']); X.alias('6+2', ['a6', 'a2']);
      b.on('update', function () {
        S.V = pt(V); S.Ph = pt(Ph); S.Qh = pt(Qh); S.Pr = pt(Pr); S.T = pt(T);
        var g1 = G.ang(V, q1P, q1Q), g7 = G.ang(X7, x7a, x7b), g8 = G.ang(X7, x8a, x8b), g4 = G.ang(Y, y4a, y4b), g2 = G.ang(Y, y2a, y2b), g5 = G.ang(Y, y4a, y2b), g6 = G.ang(Y, y2a, y4b);
        var ok = function (c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }, h = Math.PI / 2, e = 2e-4;
        X.ro([[['∠7', G.deg(g7)], ['90° − ∠1', G.deg(h - g1) + ' ' + ok(Math.abs(g7 - (h - g1)) < e)]],
              [['∠8', G.deg(g8)], ['90° − ∠4', G.deg(h - g4) + ' ' + ok(Math.abs(g8 - (h - g4)) < e)]],
              [['∠1', G.deg(g1)], ['∠4', G.deg(g4) + ' ' + ok(Math.abs(g1 - g4) < e)]],
              [['∠1 + ∠5', G.deg(g1 + g5)], ['∠1 + ∠6', G.deg(g1 + g6) + ' ' + ok(Math.abs(g1 + g5 - Math.PI) < e && Math.abs(g1 + g6 - Math.PI) < e)]]]);
      });
    }
  };
})();
