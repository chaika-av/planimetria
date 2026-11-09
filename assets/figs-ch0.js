/* Глава 0. Чертежи строятся по формулам (середина, биссектриса, центр окружности — вычисляются), а не рисуются «на глаз» */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  var DEG = Math.PI / 180;

  /* Рис. 0.1 — серединный перпендикуляр: AM1 = BM1 */
  FIGS.f01 = {
    bbox: [-5.6, 5.4, 5.6, -2.8],
    state: function () { return { A: [-3, 0], B: [3, 0], M1: [0, 3.2] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -8]), B = X.P('B', S.B, [8, -22]);
      var mx = function () { return (A.X() + B.X()) / 2; }, my = function () { return (A.Y() + B.Y()) / 2; };
      function nv() { var dx = B.X() - A.X(), dy = B.Y() - A.Y(), l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }
      var M0 = X.D('M<sub>0</sub>', mx, my, [6, -24]);
      var N = X.H(function () { return mx() + nv()[0]; }, function () { return my() + nv()[1]; });
      var line = b.create('line', [M0, N], { visible: false });
      var M1 = X.G('M<sub>1</sub>', S.M1, line, [12, 6]);
      var E1 = X.H(function () { return mx() + nv()[0] * 9; }, function () { return my() + nv()[1] * 9; });
      var E2 = X.H(function () { return mx() - nv()[0] * 9; }, function () { return my() - nv()[1] * 9; });
      X.seg(E2, E1, 'bis', 'bis', 1.3, { dash: 3 }, 3.5);
      X.seg(A, B, 'AB', 'AB', 2, {}, 4.5);
      X.seg(A, M1, 'AM1', 'AM1', 1.5, { dash: 2 }); X.seg(B, M1, 'BM1', 'BM1', 1.5, { dash: 2 });
      X.hidden(A, M0, 'AM0', 'AM0'); X.hidden(M0, B, 'M0B', 'M0B'); X.hidden(M0, M1, 'M0M1', 'M0M1');
      X.tick(A, M0, 2); X.tick(M0, B, 2);
      X.right(M0, B, M1, 0.3, 'rM0', 'rM0');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(M0, 'pM0', 'M0'); X.pt(M1, 'pM1', 'M1');
      X.alias('tri1', ['AM0', 'M0M1', 'AM1']); X.alias('tri2', ['M0B', 'M0M1', 'BM1']);
      X.anim({ label: 'Пустить точку M₁', dur: 8000, t0: null,
        steps: [[0, 'M₁ ползёт вниз по серединному перпендикуляру'], [0.1, 'AM₁ и BM₁ всё время равны'], [0.5, 'M₁ на отрезке AB: это его середина M₀'], [0.6, 'Вверх: равенство сохраняется']],
        set: function (t) { var s = -2.2 + 7.4 * (1 - t); M1.setPosition(JXG.COORDS_BY_USER, [mx() + nv()[0] * s, my() + nv()[1] * s]); } });
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.M1 = [M1.X(), M1.Y()];
        var p = G.dist(A, M1), q = G.dist(B, M1), h1 = G.dist(A, M0), h2 = G.dist(M0, B);
        X.ro([[['AM<sub>1</sub>', G.f2(p)], ['BM<sub>1</sub>', G.f2(q) + ' ' + G.ok(p, q)]], [['AM<sub>0</sub>', G.f2(h1)], ['M<sub>0</sub>B', G.f2(h2) + ' ' + G.ok(h1, h2)]]]);
      });
    }
  };

  /* Рис. 0.2 — три серединных перпендикуляра пересекаются в центре описанной окружности */
  FIGS.f02 = {
    bbox: [-6.8, 6.4, 6.8, -6.4],
    state: function () { return { A: [-3.4, -1.8], B: [3.6, -1.2], C: [0.6, 3.5] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('', S.A), B = X.P('', S.B), C = X.P('', S.C);
      var oc = function () { return G.circum(A, B, C); };
      var O = X.D('O', function () { return oc()[0]; }, function () { return oc()[1]; }, [8, -18]);
      var R = function () { return G.dist(O, A); };
      var circ = b.create('circle', [O, R], { strokeColor: C0.fg, strokeWidth: 2, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      X.reg('circ', 'circ', circ, { strokeColor: C0.fg, strokeWidth: 2 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      X.seg(A, B, 'sAB', 'tri', 2); X.seg(B, C, 'sBC', 'tri', 2); X.seg(C, A, 'sCA', 'tri', 2);
      function radial(P, html, prim, tok) {                              /* подпись снаружи окружности */
        var f = function () { var o = oc(), dx = P.X() - o[0], dy = P.Y() - o[1], l = Math.hypot(dx, dy) || 1; return [P.X() + dx / l * 0.55, P.Y() + dy / l * 0.55]; };
        return X.lbl(function () { return f()[0]; }, function () { return f()[1]; }, html, prim, tok);
      }
      radial(A, '<i>A</i>', 'lA', 'A'); radial(B, '<i>B</i>', 'lB', 'B'); radial(C, '<i>C</i>', 'lC', 'C');
      /* серединный перпендикуляр стороны PQ: диаметр через середину; X0 — конец за стороной, X1 — на стороне вершины V */
      function bis(P, Q, V, n0, n1, prim, ticks) {
        var mid = X.D('', function () { return (P.X() + Q.X()) / 2; }, function () { return (P.Y() + Q.Y()) / 2; }, [0, 0], { size: 2 });
        function nrm() { var dx = Q.X() - P.X(), dy = Q.Y() - P.Y(), l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }
        function ends() {
          var m = [mid.X(), mid.Y()], n = nrm(), o = oc(), r = R();
          var s = -Math.sign((V.X() - m[0]) * n[0] + (V.Y() - m[1]) * n[1]) || 1;
          return [[o[0] + s * r * n[0], o[1] + s * r * n[1]], [o[0] - s * r * n[0], o[1] - s * r * n[1]]];
        }
        var E0 = X.D('', function () { return ends()[0][0]; }, function () { return ends()[0][1]; }, [0, 0], { size: 3 });
        var E1 = X.D('', function () { return ends()[1][0]; }, function () { return ends()[1][1]; }, [0, 0], { size: 3 });
        X.seg(E0, E1, prim, prim, 1.3, { dash: 2 }, 3.5);
        radial(E0, '<i>' + n0 + '</i>', 'l' + n0, n0); radial(E1, '<i>' + n1 + '</i>', 'l' + n1, n1);
        X.pt(E0, 'p' + n0, n0); X.pt(E1, 'p' + n1, n1);
        X.right(mid, Q, E0, 0.28, 'rm' + prim, prim); X.tick(P, mid, ticks); X.tick(mid, Q, ticks);
      }
      bis(A, B, C, 'C<sub>0</sub>', 'C<sub>1</sub>', 'C0C1', 1);
      bis(C, A, B, 'B<sub>0</sub>', 'B<sub>1</sub>', 'B0B1', 2);
      bis(B, C, A, 'A<sub>0</sub>', 'A<sub>1</sub>', 'A0A1', 3);
      X.hidden(O, A, 'OA', 'OA'); X.hidden(O, B, 'OB', 'OB'); X.hidden(O, C, 'OC', 'OC');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O');
      X.alias('OA=OB', ['OA', 'OB']); X.alias('OA=OC', ['OA', 'OC']); X.alias('OB=OC', ['OB', 'OC']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.C = [C.X(), C.Y()];
        var a = G.dist(O, A), c = G.dist(O, B), d = G.dist(O, C);
        X.ro([[['OA', G.f2(a)], ['OB', G.f2(c)], ['OC', G.f2(d) + ' ' + (Math.abs(a - c) < 0.006 && Math.abs(a - d) < 0.006 ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>')]]]);
      });
    }
  };

  /* Рис. 0.3 — биссектриса: точка равноудалена от сторон угла */
  FIGS.f03 = {
    bbox: [-1.8, 4.9, 8.6, -4.9],
    state: function () {
      var a = 36 * DEG, c = -26 * DEG, m = 5 * DEG;
      return { Pa: [6.4 * Math.cos(a), 6.4 * Math.sin(a)], Pc: [6.4 * Math.cos(c), 6.4 * Math.sin(c)], M: [4.4 * Math.cos(m), 4.4 * Math.sin(m)] };
    },
    build: function (X) {
      var b = X.b, S = X.S;
      var B = X.P('B', [0, 0], [-22, -8], { fixed: true });
      var Pa = X.P('', S.Pa), Pc = X.P('', S.Pc);
      function unit(P) { var dx = P.X() - B.X(), dy = P.Y() - B.Y(), l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }
      function ub() { var a = unit(Pa), c = unit(Pc), x = a[0] + c[0], y = a[1] + c[1], l = Math.hypot(x, y); return l < 1e-6 ? [-a[1], a[0]] : [x / l, y / l]; }
      var Db = X.H(function () { return ub()[0]; }, function () { return ub()[1]; });
      var Eb = X.H(function () { return ub()[0] * 6.6; }, function () { return ub()[1] * 6.6; });
      var line = b.create('line', [B, Db], { visible: false });
      var M = X.G('M', S.M, line, [8, 10]);
      var M1 = X.D('M<sub>1</sub>', function () { return G.foot(M, B, Pa)[0]; }, function () { return G.foot(M, B, Pa)[1]; }, [4, 10]);
      var M2 = X.D('M<sub>2</sub>', function () { return G.foot(M, B, Pc)[0]; }, function () { return G.foot(M, B, Pc)[1]; }, [4, -22]);
      X.seg(B, Pa, 'ra', 'sides', 2, {}, 4.5); X.seg(B, Pc, 'rc', 'sides', 2, {}, 4.5); X.seg(B, Eb, 'rb', 'bis', 1.6, {}, 4);
      X.seg(M, M1, 'MM1', 'MM1', 1.5, { dash: 2 }); X.seg(M, M2, 'MM2', 'MM2', 1.5, { dash: 2 });
      X.hidden(B, M, 'BM', 'BM'); X.hidden(B, M1, 'BM1', 'BM1'); X.hidden(B, M2, 'BM2', 'BM2');
      X.right(M1, M, B, 0.28, 'q1', 'MM1'); X.right(M2, M, B, 0.28, 'q2', 'MM2');
      X.arc(B, Pa, Db, 1.1, 'al1', 'alpha'); X.arc(B, Db, Pc, 1.1, 'al2', 'alpha');
      function half(P, Q) { return function () { var u = unit(P), v = unit(Q), x = u[0] + v[0], y = u[1] + v[1], l = Math.hypot(x, y) || 1; return [x / l * 1.6, y / l * 1.6]; }; }
      var h1 = half(Pa, Db), h2 = half(Db, Pc);
      X.lbl(function () { return h1()[0]; }, function () { return h1()[1]; }, '<i>α</i>', 'al1', 'alpha');
      X.lbl(function () { return h2()[0]; }, function () { return h2()[1]; }, '<i>α</i>', 'al2', 'alpha');
      X.lbl(function () { return Pa.X() + unit(Pa)[0] * 0.5; }, function () { return Pa.Y() + unit(Pa)[1] * 0.5; }, '<i>a</i>');
      X.lbl(function () { return Pc.X() + unit(Pc)[0] * 0.5; }, function () { return Pc.Y() + unit(Pc)[1] * 0.5; }, '<i>c</i>');
      X.lbl(function () { return Eb.X() + ub()[0] * 0.5; }, function () { return Eb.Y() + ub()[1] * 0.5; }, '<i>b</i>');
      X.pt(B, 'pB', 'B'); X.pt(M, 'pM', 'M'); X.pt(M1, 'pM1', 'M1'); X.pt(M2, 'pM2', 'M2');
      X.alias('tri1', ['BM', 'MM1', 'BM1']); X.alias('tri2', ['BM', 'MM2', 'BM2']);
      b.on('update', function () {
        S.Pa = [Pa.X(), Pa.Y()]; S.Pc = [Pc.X(), Pc.Y()]; S.M = [M.X(), M.Y()];
        var d1 = G.dist(M, M1), d2 = G.dist(M, M2), g1 = G.ang(B, Pa, Eb), g2 = G.ang(B, Eb, Pc);
        X.ro([[['MM<sub>1</sub>', G.f2(d1)], ['MM<sub>2</sub>', G.f2(d2) + ' ' + G.ok(d1, d2)]], [['∠aBb', G.deg(g1)], ['∠bBc', G.deg(g2) + ' ' + G.ok(g1, g2, 0.0002)]]]);
      });
    }
  };

  /* Рис. 0.4 — три биссектрисы пересекаются в центре вписанной окружности */
  FIGS.f04 = {
    bbox: [-6, 5.8, 6, -4.4],
    state: function () { return { A: [-3.7, -1.7], B: [3.9, -2.1], C: [0.9, 3.9] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('A', S.A, [-22, -10]), B = X.P('B', S.B, [8, -14]), C = X.P('C', S.C, [-4, 10]);
      function sd() { return { a: G.dist(B, C), b: G.dist(C, A), c: G.dist(A, B) }; }
      var inc = function () { var s = sd(), t = (s.a + s.b + s.c) || 1e-9; return [(s.a * A.X() + s.b * B.X() + s.c * C.X()) / t, (s.a * A.Y() + s.b * B.Y() + s.c * C.Y()) / t]; };
      var O = X.D('O', function () { return inc()[0]; }, function () { return inc()[1]; }, [8, -18]);
      function onSide(P, Q, wP, wQ, name, off) {                          /* точка на стороне PQ, делящая её как wP : wQ */
        return X.D(name, function () { var s = sd(), u = s[wP], v = s[wQ], t = (u + v) || 1e-9; return (u * P.X() + v * Q.X()) / t; },
          function () { var s = sd(), u = s[wP], v = s[wQ], t = (u + v) || 1e-9; return (u * P.Y() + v * Q.Y()) / t; }, off);
      }
      var A1 = onSide(B, C, 'b', 'c', 'A<sub>1</sub>', [8, 4]);          /* BA1 : A1C = AB : AC = c : b */
      var B1 = onSide(A, C, 'a', 'c', 'B<sub>1</sub>', [-26, 4]);
      var C1 = onSide(A, B, 'a', 'b', 'C<sub>1</sub>', [12, -26]);
      /* при wP = b, wQ = c точка A1 = (b·B + c·C)/(b + c): ближе к вершине с меньшей прилежащей стороной — это и есть свойство биссектрисы */
      function ft(name, P, Q, off) { return X.D(name, function () { return G.foot(O, P, Q)[0]; }, function () { return G.foot(O, P, Q)[1]; }, off); }
      var A0 = ft('A<sub>0</sub>', B, C, [8, -20]), B0 = ft('B<sub>0</sub>', C, A, [-28, -2]), C0f = ft('C<sub>0</sub>', A, B, [-34, 4]);
      var r = function () { return G.dist(O, A0); };
      var inc2 = b.create('circle', [O, r], { strokeColor: C0.fg, strokeWidth: 1.8, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      X.reg('incirc', 'incirc', inc2, { strokeColor: C0.fg, strokeWidth: 1.8 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      X.seg(A, B, 'sAB', 'tri', 2); X.seg(B, C, 'sBC', 'tri', 2); X.seg(C, A, 'sCA', 'tri', 2);
      X.seg(A, A1, 'AA1', 'AA1', 1.4, { dash: 2 }, 4); X.seg(B, B1, 'BB1', 'BB1', 1.4, { dash: 2 }, 4); X.seg(C, C1, 'CC1', 'CC1', 1.4, { dash: 2 }, 4);
      X.seg(O, A0, 'OA0', 'OA0', 1.5, {}, 4); X.seg(O, B0, 'OB0', 'OB0', 1.5, {}, 4); X.seg(O, C0f, 'OC0', 'OC0', 1.5, {}, 4);
      X.right(A0, O, C, 0.26, 'rA0', 'OA0'); X.right(B0, O, A, 0.26, 'rB0', 'OB0'); X.right(C0f, O, B, 0.26, 'rC0', 'OC0');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(O, 'pO', 'O');
      X.alias('OC0=OA0', ['OC0', 'OA0']); X.alias('OC0=OB0', ['OC0', 'OB0']); X.alias('OA0=OB0', ['OA0', 'OB0']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.C = [C.X(), C.Y()];
        var p = G.dist(O, A0), q = G.dist(O, B0), t = G.dist(O, C0f);
        X.ro([[['OA<sub>0</sub>', G.f2(p)], ['OB<sub>0</sub>', G.f2(q)], ['OC<sub>0</sub>', G.f2(t) + ' ' + (Math.abs(p - q) < 0.006 && Math.abs(p - t) < 0.006 ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>')]]]);
      });
    }
  };

  /* Рис. 0.5 — ГМТ, из которых отрезок AB виден под углом α: две дуги окружностей радиуса R = AB / (2 sin α) */
  FIGS.f05 = {
    bbox: [-6.4, 6.2, 6.4, -6.2],
    state: function () { return { A: [-3, 0], B: [3, 0], t: 1.25 }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, AL = 60 * DEG;
      var A = X.P('A', S.A, [-24, 6]), B = X.P('B', S.B, [8, 6]);
      function d() { var dx = B.X() - A.X(), dy = B.Y() - A.Y(), l = Math.hypot(dx, dy) || 1e-9; return { x: dx / l, y: dy / l, l: l }; }
      function R() { return d().l / (2 * Math.sin(AL)); }
      function h() { return R() * Math.cos(AL); }                                   /* O2E = R cos α */
      var E = X.D('E', function () { return (A.X() + B.X()) / 2; }, function () { return (A.Y() + B.Y()) / 2; }, [10, -18]);
      var O2 = X.D('O<sub>2</sub>', function () { return E.X() - d().y * h(); }, function () { return E.Y() + d().x * h(); }, [8, 6]);
      var O1 = X.D('O<sub>1</sub>', function () { return E.X() + d().y * h(); }, function () { return E.Y() - d().x * h(); }, [8, -16]);
      var k2 = b.create('circle', [O2, R], { strokeColor: C0.mu, strokeWidth: 1, dash: 2, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
      function majorArc(O, P0, sgn) {                                              /* дуга в 360° − 2α, начиная от точки P0 против часовой стрелки */
        return b.create('curve', [function (t) { return O.X() + R() * Math.cos(t); }, function (t) { return O.Y() + R() * Math.sin(t); },
          function () { return Math.atan2(P0.Y() - O.Y(), P0.X() - O.X()); },
          function () { return Math.atan2(P0.Y() - O.Y(), P0.X() - O.X()) + 2 * Math.PI - 2 * AL; }], { strokeColor: C0.fg, strokeWidth: 2.2, fixed: true, highlightStrokeColor: C0.fg });
      }
      var a2 = majorArc(O2, B), a1 = majorArc(O1, A);
      X.reg('arc2', 'arcs', a2, { strokeColor: C0.fg, strokeWidth: 2.2 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      X.reg('arc1', 'arcs', a1, { strokeColor: C0.fg, strokeWidth: 2.2 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      var M2 = X.G('M<sub>2</sub>', [S.A[0] + 5.2, 4.4], k2, [8, 8]);
      var Mx = X.D('M<sub>1</sub>', function () { var f = G.foot(M2, A, B); return 2 * f[0] - M2.X(); }, function () { var f = G.foot(M2, A, B); return 2 * f[1] - M2.Y(); }, [8, -16]);
      var Dp = X.D('D', function () { return O2.X() - d().y * R(); }, function () { return O2.Y() + d().x * R(); }, [8, 6]);
      var Cp = X.D('C', function () { return O2.X() + d().y * R(); }, function () { return O2.Y() - d().x * R(); }, [8, -16]);
      var M3 = X.D('M<sub>3</sub>', function () { return 2 * O2.X() - B.X(); }, function () { return 2 * O2.Y() - B.Y(); }, [-26, 6]);
      X.seg(A, B, 'AB', 'AB', 2, {}, 4.5);
      X.seg(A, M2, 'AM2', 'ang', 1.4, {}, 3.5); X.seg(B, M2, 'BM2', 'ang', 1.4, {}, 3.5);
      X.seg(A, Mx, 'AM1', 'ang1', 1.2, { dash: 2 }, 3); X.seg(B, Mx, 'BM1', 'ang1', 1.2, { dash: 2 }, 3);
      X.seg(Dp, Cp, 'CD', 'CD', 1.3, { dash: 3 }, 3.5);
      X.seg(B, M3, 'BM3', 'BM3', 1.2, { dash: 2 }, 3.5); X.seg(A, M3, 'AM3', 'AM3', 1.2, { dash: 2 }, 3.5);
      X.seg(O2, A, 'O2A', 'R', 1.4, {}, 4); X.seg(O2, B, 'O2B', 'R', 1.4, {}, 4);
      X.hidden(O2, E, 'O2E', 'O2E'); X.seg(A, Dp, 'AD', 'AD', 1.2, { dash: 2 }, 3.5); X.seg(B, Dp, 'BD', 'AD', 1.2, { dash: 2 }, 3.5); 
      X.ang(O2, A, Cp, 0.8, '<i>α</i>', 'aO', 'ext');
      X.ang(Dp, A, O2, 0.9, '1', 'a1', 'a12'); X.ang(A, Dp, O2, 0.9, '2', 'a2', 'a12');
      X.ang(Dp, A, B, 1.5, '', 'aD', 'ADB'); X.ang(M2, A, B, 1.0, '<i>α</i>', 'aM2', 'alpha'); X.ang(Mx, A, B, 1.0, '', 'aM1', 'alpha'); X.ang(M3, A, B, 1.0, '', 'aM3', 'alpha');
      X.right(A, B, M3, 0.3, 'rA', 'AM3');
      X.right(E, O2, B, 0.3, 'rE', 'CD');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(M2, 'pM2', 'M2'); X.pt(O2, 'pO2', 'O2'); X.pt(E, 'pE', 'E');
      X.alias('alpha', ['AM2', 'BM2', 'aM2', 'aM1', 'aM3', 'aD']); X.alias('R', ['O2A', 'O2B']); X.alias('ext', ['aO', 'a1', 'a2']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()];
        var same = ((B.X() - A.X()) * (M2.Y() - A.Y()) - (B.Y() - A.Y()) * (M2.X() - A.X())) * 1 > 0;      /* M2 по ту же сторону, что и центр O2 */
        var g = G.ang(M2, A, B), want = same ? AL : Math.PI - AL;
        var r1 = G.dist(O2, A), r2 = d().l / (2 * Math.sin(g));
        var gA = G.ang(Dp, A, O2), gB = G.ang(A, Dp, O2), gO = G.ang(O2, A, Cp), gD = G.ang(Dp, A, B);
        var oe = G.dist(O2, E), oe2 = 0.5 * d().l / Math.tan(AL);
        X.ro([[['∠AM<sub>2</sub>B', G.deg(g)], [same ? 'α' : '180° − α', G.deg(want) + ' ' + G.ok(g, want, 0.0002)]],
              [['∠1 (при D)', G.deg(gA)], ['∠2 (при A)', G.deg(gB) + ' ' + G.ok(gA, gB, 0.0002)]],
              [['α (центральный)', G.deg(gO)], ['∠1 + ∠2', G.deg(gA + gB) + ' ' + G.ok(gO, gA + gB, 0.0002)]],
              [['∠ADB', G.deg(gD)], ['α', G.deg(AL) + ' ' + G.ok(gD, AL, 0.0002)]],
              [['R', G.f2(r1)], ['AB / (2 sin ∠AM<sub>2</sub>B)', G.f2(r2) + ' ' + G.ok(r1, r2)]],
              [['O<sub>2</sub>E', G.f2(oe)], ['½·AB·ctg α', G.f2(oe2) + ' ' + G.ok(oe, oe2)]]]);
      });
    }
  };

  /* Рис. 0.6 — вершины треугольников ABM, равновеликих ABC: пара прямых, параллельных AB на расстоянии h */
  FIGS.f06 = {
    bbox: [-6.4, 5.6, 6.4, -5.6],
    state: function () { return { A: [-3.2, -0.4], B: [2.6, -0.9], C: [-0.6, 2.7], t: 4.2, s: 1 }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [8, -14]), C = X.P('C', S.C, [-4, 10]);
      function u() { var dx = B.X() - A.X(), dy = B.Y() - A.Y(), l = Math.hypot(dx, dy) || 1e-9; return [dx / l, dy / l]; }
      function sh() { var n = u(); return (C.X() - A.X()) * -n[1] + (C.Y() - A.Y()) * n[0]; }                 /* знаковая высота */
      function ln(sg, k) { return X.H(function () { var n = u(); return A.X() - n[1] * sh() * sg + n[0] * k; }, function () { var n = u(); return A.Y() + n[0] * sh() * sg + n[1] * k; }); }
      var a1 = ln(1, -9), a2 = ln(1, 9), b1 = ln(-1, -9), b2 = ln(-1, 9);
      var aa = b.create('line', [a1, a2], { visible: false }), la = X.seg(a1, a2, 'aa', 'aa', 1.4, { dash: 3 }, 3.6), lb = X.seg(b1, b2, 'bb', 'bb', 1.4, { dash: 3 }, 3.6);
      var M = X.P('M', [S.A[0] + S.t, S.A[1] + Math.abs(sh())], [8, 8]), lastM = null;
      if (S.s === undefined) S.s = 1;
      function placeM() {                                                      /* M всегда на одной из двух прямых: aa или bb */
        var n = u(), hM = (M.X() - A.X()) * -n[1] + (M.Y() - A.Y()) * n[0];
        if (lastM && (Math.abs(M.X() - lastM[0]) > 1e-9 || Math.abs(M.Y() - lastM[1]) > 1e-9)) {
          S.t = (M.X() - A.X()) * n[0] + (M.Y() - A.Y()) * n[1]; if (Math.abs(hM) > 0.05) S.s = hM > 0 ? 1 : -1;
        }
        var hh = S.s * Math.abs(sh()), x = A.X() + n[0] * S.t - n[1] * hh, y = A.Y() + n[1] * S.t + n[0] * hh;
        lastM = [x, y];
        if (Math.abs(M.X() - x) > 1e-9 || Math.abs(M.Y() - y) > 1e-9) M.moveTo([x, y]);
      }
      var Fa = X.D('', function () { return G.foot(C, A, B)[0]; }, function () { return G.foot(C, A, B)[1]; });
      X.seg(A, B, 'AB', 'AB', 2.2, {}, 4.5);
      X.seg(A, C, 'AC', 'tri', 1.5, {}); X.seg(B, C, 'BC', 'tri', 1.5, {});
      X.seg(A, M, 'AM', 'tri2', 1.4, { dash: 2 }, 3.5); X.seg(B, M, 'BM', 'tri2', 1.4, { dash: 2 }, 3.5);
      X.seg(C, Fa, 'h', 'h', 1.4, { dash: 1 }, 4);
      X.right(Fa, C, B, 0.28, 'rh', 'h');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C'); X.pt(M, 'pM', 'M');
      X.alias('ABC', ['AC', 'BC', 'AB']); X.alias('ABM', ['AM', 'BM', 'AB']);
      placeM();
      b.on('update', function () {
        placeM();
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.C = [C.X(), C.Y()];
        var ab = G.dist(A, B), hh = Math.abs(sh()), hm = Math.abs((M.X() - A.X()) * -u()[1] + (M.Y() - A.Y()) * u()[0]);
        var s1 = 0.5 * ab * hh, s2 = 0.5 * Math.abs((B.X() - A.X()) * (M.Y() - A.Y()) - (B.Y() - A.Y()) * (M.X() - A.X()));
        X.ro([[['h', G.f2(hh)], ['расстояние от M до AB', G.f2(hm) + ' ' + G.ok(hh, hm)]], [['S<sub>ABC</sub> = ½·AB·h', G.f2(s1)], ['S<sub>ABM</sub>', G.f2(s2) + ' ' + G.ok(s1, s2)]]]);
      });
    }
  };

  /* Рис. 0.7 — середины хорд фиксированной длины a: окружность радиуса r = √(4R² − a²) / 2 */
  FIGS.f07 = {
    bbox: [-6.2, 5.6, 6.2, -5.6],
    state: function () { return { A: [-3.2, 2.4], B: [3.3, 2.0] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, R0 = 4.2;
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, -18]);
      var circ = b.create('circle', [O, R0], { strokeColor: C0.fg, strokeWidth: 1.8, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      var A = X.G('A', S.A, circ, [-20, 6]), B = X.G('B', S.B, circ, [8, 6]);
      var M = X.D('M', function () { return (A.X() + B.X()) / 2; }, function () { return (A.Y() + B.Y()) / 2; }, [8, -18]);
      var rr = function () { var a = G.dist(A, B); return Math.sqrt(Math.max(0, 4 * R0 * R0 - a * a)) / 2; };
      var loc = b.create('circle', [O, rr], { strokeColor: C0.mu, strokeWidth: 1.4, dash: 3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
      X.reg('loc', 'loc', loc, { strokeColor: C0.mu, strokeWidth: 1.4 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      X.seg(A, B, 'AB', 'AB', 2, {}, 4.5);
      X.seg(O, A, 'OA', 'OA', 1.3, { dash: 2 }, 3.5);
      X.hidden(O, M, 'OM', 'OM'); X.hidden(A, M, 'AM', 'AM'); X.hidden(M, B, 'MB', 'AM');
      X.right(M, O, B, 0.3, 'rM', 'OM');
      X.tick(A, M, 1); X.tick(M, B, 1);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(M, 'pM', 'M'); X.pt(O, 'pO', 'O');
      X.alias('AM=MB', ['AM', 'MB']);
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()];
        var a = G.dist(A, B), om = G.dist(O, M), f = Math.sqrt(Math.max(0, 4 * R0 * R0 - a * a)) / 2;
        var am = G.dist(A, M), mb = G.dist(M, B);
        X.ro([[['AM', G.f2(am)], ['MB', G.f2(mb) + ' ' + G.ok(am, mb)]], [['OM', G.f2(om)], ['√(4R² − a²) / 2', G.f2(f) + ' ' + G.ok(om, f)]]]);
      });
    }
  };

  /* Рис. 0.8 и 0.9 — степень точки: AM · MB = k; M внутри и вне окружности */
  function power(inside) {
    return {
      bbox: inside ? [-6.2, 5.4, 6.2, -5.4] : [-6.8, 5.4, 6.8, -5.4],
      state: function () { return inside ? { M: [1.3, 0.8], A: [-2.2, 3.6], A1: [-3.6, -1.8] } : { M: [6.2, 0.2], A: [-2.0, 3.46], A1: [-3.2, -2.4] }; },
      build: function (X) {
        var b = X.b, S = X.S, C0 = X.C, R0 = 4;
        var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, -18]);
        var circ = b.create('circle', [O, R0], { strokeColor: C0.fg, strokeWidth: 1.8, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
        var M = X.P('M', S.M, [8, -16]);
        var A = X.G('A', S.A, circ, [-20, 6]), A1 = X.G('A<sub>1</sub>', S.A1, circ, [-24, -4]);
        function second(P) { var dx = M.X() - P.X(), dy = M.Y() - P.Y(), l2 = dx * dx + dy * dy || 1e-9, s = -2 * ((P.X()) * dx + (P.Y()) * dy) / l2; return [P.X() + s * dx, P.Y() + s * dy]; }
        var B = X.D('B', function () { return second(A)[0]; }, function () { return second(A)[1]; }, [8, 6]);
        var B1 = X.D('B<sub>1</sub>', function () { return second(A1)[0]; }, function () { return second(A1)[1]; }, [8, -16]);
        var rr = function () { return Math.hypot(M.X(), M.Y()); };
        var loc = b.create('circle', [O, rr], { strokeColor: C0.mu, strokeWidth: 1.4, dash: 3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
        X.reg('loc', 'loc', loc, { strokeColor: C0.mu, strokeWidth: 1.4 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
        function uv() { var d = rr() || 1e-9; return [M.X() / d, M.Y() / d]; }
        var A2 = X.D('A<sub>2</sub>', function () { return R0 * uv()[0]; }, function () { return R0 * uv()[1]; }, [8, 6]);
        var B2 = X.D('B<sub>2</sub>', function () { return -R0 * uv()[0]; }, function () { return -R0 * uv()[1]; }, [-26, -16]);
        X.hidden(B2, A2, 'diam', 'diam');
        X.seg(B, A1, 'BA1', 'sim', 1.1, { dash: 2 }, 3.5); X.seg(B1, A, 'B1A', 'sim', 1.1, { dash: 2 }, 3.5);
        X.seg(A, A1, 'AA1c', 'ang12', 1.1, { dash: 2 }, 3.5); X.seg(B, B1, 'BB1c', 'ang34', 1.1, { dash: 2 }, 3.5);
        X.seg(A, B, 'AB', 'AB', 1.8, {}, 4); X.seg(A1, B1, 'A1B1', 'A1B1', 1.8, {}, 4);
        X.seg(O, M, 'OM', 'OM', 1.3, { dash: 2 }, 3.5);
        X.hidden(A, M, 'AM', 'AM'); X.hidden(M, B, 'MB', 'MB'); X.hidden(A1, M, 'A1M', 'A1M'); X.hidden(M, B1, 'MB1', 'MB1');
        var T = null;
        if (!inside) {
          T = X.D('C', function () { var d = rr() || 1e-9, ux = M.X() / d, uy = M.Y() / d, c = R0 / d, s = Math.sqrt(Math.max(0, 1 - c * c)); return R0 * (ux * c - uy * s); },
            function () { var d = rr() || 1e-9, ux = M.X() / d, uy = M.Y() / d, c = R0 / d, s = Math.sqrt(Math.max(0, 1 - c * c)); return R0 * (uy * c + ux * s); }, [8, 6]);
          X.seg(M, T, 'MC', 'MC', 1.5, {}, 4); X.seg(O, T, 'OC', 'OC', 1.1, { dash: 2 }); X.right(T, M, O, 0.28, 'rC', 'MC'); X.pt(T, 'pC', 'C');
        }
        G.guard(b, [M, A, A1], function () {
          var P = [A, B, A1, B1].concat(T ? [T] : []);
          for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) if (G.dist(P[i], P[j]) < 1.6) return false;
          return G.dist(M, A) > 1.4 && G.dist(M, A1) > 1.4 && G.dist(M, B) > 1.4 && G.dist(M, B1) > 1.4 && (!T || G.dist(M, T) > 1.4);
        });
        X.ang(B, A, A1, 0.7, '1', 'a1', '12'); X.ang(B1, A, A1, 0.7, '2', 'a2', '12');
        X.ang(A, B, B1, 0.7, '3', 'a3', '34'); X.ang(A1, B, B1, 0.7, '4', 'a4', '34');
        if (!inside) {
          X.ang(A, M, B1, 0.9, '5', 'a5', '56'); X.ang(A1, M, B, 0.9, '6', 'a6', '56');
          X.seg(T, A, 'CA', 'tang', 1.1, { dash: 2 }, 3.5); X.seg(T, B, 'CB', 'tang', 1.1, { dash: 2 }, 3.5);
          X.ang(B, A, T, 0.7, '7', 'a7', '78'); X.ang(T, M, A, 0.9, '8', 'a8', '78'); X.ang(M, T, A, 1.1, '9', 'a9', '9');
        }
        X.pt(A, 'pA', 'A'); X.pt(A1, 'pA1', 'A1'); X.pt(M, 'pM', 'M'); X.pt(O, 'pO', 'O'); X.pt(A2, 'pA2', 'A2'); X.pt(B2, 'pB2', 'B2');
        X.alias('AM.MB', ['AM', 'MB']); X.alias('A1M.MB1', ['A1M', 'MB1']); X.alias('sim', ['AM', 'MB1', 'B1A', 'A1M', 'MB', 'BA1']);
        b.on('update', function () {
          var r0 = rr(), lo = inside ? 0 : R0 * 1.12, hi = inside ? R0 * 0.9 : 99, r1 = Math.min(hi, Math.max(lo, r0));
          if (Math.abs(r1 - r0) > 1e-9) { var ux = r0 > 1e-6 ? M.X() / r0 : 1, uy = r0 > 1e-6 ? M.Y() / r0 : 0; M.moveTo([ux * r1, uy * r1]); return; }
          S.M = [M.X(), M.Y()]; S.A = [A.X(), A.Y()]; S.A1 = [A1.X(), A1.Y()];
          var k1 = G.dist(A, M) * G.dist(M, B), k2 = G.dist(A1, M) * G.dist(M, B1), om = rr(), p = R0 * R0 - om * om, ins = om < R0;
          var rows = [[['AM · MB', G.f2(k1)], ['A<sub>1</sub>M · MB<sub>1</sub>', G.f2(k2) + ' ' + G.ok(k1, k2, 0.01)]]];
          var eq = function (x, y, a, c) { return Math.abs(x - y) < 3e-4 ? '<em class="ok">✓</em>' : (Math.abs(x + y - Math.PI) < 3e-4 ? '<em>(∠' + a + ' + ∠' + c + ' = 180°)</em>' : '<em class="bad">≠</em>'); };
          var g1 = G.ang(B, A, A1), g2 = G.ang(B1, A, A1), g3 = G.ang(A, B, B1), g4 = G.ang(A1, B, B1);
          rows.push([['∠1', G.deg(g1)], ['∠2', G.deg(g2) + ' ' + eq(g1, g2, 1, 2)]], [['∠3', G.deg(g3)], ['∠4', G.deg(g4) + ' ' + eq(g3, g4, 3, 4)]]);
          if (!inside) {
            var g5 = G.ang(A, M, B1), g6 = G.ang(A1, M, B), g7 = G.ang(B, A, T), g8 = G.ang(T, M, A), g9 = G.ang(M, T, A);
            rows.push([['∠5', G.deg(g5)], ['∠6', G.deg(g6) + ' ' + eq(g5, g6, 5, 6)]], [['∠7', G.deg(g7)], ['∠8', G.deg(g8) + ' ' + eq(g7, g8, 7, 8)]]);
          }
          rows.push([[ins ? 'R² − OM²' : 'OM² − R²', G.f2(Math.abs(p))], ['k', G.f2(k1) + ' ' + G.ok(Math.abs(p), k1, 0.01)]]);
          if (!inside) { var mc = Math.sqrt(Math.max(0, -p)); rows.push([['MC²', G.f2(mc * mc)], ['k', G.f2(k1) + ' ' + G.ok(mc * mc, k1, 0.01)]]); }
          X.ro(rows);
        });
      }
    };
  }
  FIGS.f08 = power(true); FIGS.f09 = power(false);

  /* общие вспомогательные построения для чертежей 0.10–0.16 */
  function axisLine(X, y0) { return X.H(function () { return -12; }, function () { return y0 || 0; }); }

  /* Рис. 0.10 — середины хорд, проходящих через точку A внутри окружности: окружность на OA как на диаметре */
  FIGS.f10 = {
    bbox: [-6, 5.6, 6, -5.6],
    state: function () { return { A: [1.7, 0.9], C: [-2.6, 3.0] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, R0 = 4;
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, -18]);
      var circ = b.create('circle', [O, R0], { strokeColor: C0.fg, strokeWidth: 1.8, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      var A = X.P('A', S.A, [8, -16]), Cg = X.G('C', S.C, circ, [-20, 6]);
      function oa() { return Math.hypot(A.X(), A.Y()) || 1e-9; }
      function sec(P) { var dx = A.X() - P.X(), dy = A.Y() - P.Y(), l2 = dx * dx + dy * dy || 1e-9, s = -2 * (P.X() * dx + P.Y() * dy) / l2; return [P.X() + s * dx, P.Y() + s * dy]; }
      var B = X.D('B', function () { return sec(Cg)[0]; }, function () { return sec(Cg)[1]; }, [8, 6]);
      var Mm = X.D('M', function () { return (Cg.X() + B.X()) / 2; }, function () { return (Cg.Y() + B.Y()) / 2; }, [8, 8]);
      var t = function () { return Math.sqrt(Math.max(0, R0 * R0 - oa() * oa())); };
      var C1 = X.D('C<sub>1</sub>', function () { return A.X() - A.Y() / oa() * t(); }, function () { return A.Y() + A.X() / oa() * t(); }, [-28, 6]);
      var B1 = X.D('B<sub>1</sub>', function () { return A.X() + A.Y() / oa() * t(); }, function () { return A.Y() - A.X() / oa() * t(); }, [8, -16]);
      var C2 = X.D('C<sub>2</sub>', function () { return -R0 * A.X() / oa(); }, function () { return -R0 * A.Y() / oa(); }, [-28, -16]);
      var B2 = X.D('B<sub>2</sub>', function () { return R0 * A.X() / oa(); }, function () { return R0 * A.Y() / oa(); }, [8, 6]);
      var O1 = X.H(function () { return A.X() / 2; }, function () { return A.Y() / 2; });
      var loc = b.create('circle', [O1, function () { return oa() / 2; }], { strokeColor: C0.mu, strokeWidth: 1.4, dash: 3, fillColor: 'none', fixed: true, highlightStrokeColor: C0.mu, highlightFillColor: 'none' });
      X.reg('loc', 'loc', loc, { strokeColor: C0.mu, strokeWidth: 1.4 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      X.seg(C1, B1, 'C1B1', 'C1B1', 1.5, {}, 4); X.seg(C2, B2, 'C2B2', 'C2B2', 1.5, {}, 4); X.seg(Cg, B, 'CB', 'CB', 1.8, {}, 4.5);
      X.seg(O, Mm, 'OM', 'OM', 1.3, { dash: 2 }, 3.5);
      X.right(Mm, A, O, 0.3, 'rM', 'OM');
      X.pt(A, 'pA', 'A'); X.pt(Mm, 'pM', 'M'); X.pt(O, 'pO', 'O'); X.pt(Cg, 'pC', 'C');
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.C = [Cg.X(), Cg.Y()];
        var g = G.ang(Mm, A, O), d1 = G.dist(O1, Mm), d2 = oa() / 2;
        X.ro([[['∠AMO', G.deg(g)], ['90°', '— ' + G.ok(g, Math.PI / 2, 0.0002)]], [['O<sub>1</sub>M', G.f2(d1)], ['OA / 2', G.f2(d2) + ' ' + G.ok(d1, d2)]]]);
      });
    }
  };

  /* Рис. 0.11 — AM² − BM² = k: прямая, перпендикулярная AB, в точке x = k / (2a) */
  FIGS.f11 = {
    bbox: [-6.2, 5.6, 6.2, -5.6],
    state: function () { return { x0: 1.1, M: [1.1, 2.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, a = 4.4;
      var A = X.D('A', function () { return -a / 2; }, function () { return 0; }, [-22, -16]), B = X.D('B', function () { return a / 2; }, function () { return 0; }, [8, -16]);
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, -18]);
      var xa = b.create('line', [X.H(function () { return -9; }, function () { return 0; }), X.H(function () { return 9; }, function () { return 0; })], { visible: false });
      var M0 = X.G('M<sub>0</sub>', [S.x0, 0], xa, [6, -20]);
      var vt = X.H(function () { return M0.X(); }, function () { return 3; }), vb = X.H(function () { return M0.X(); }, function () { return -3; });
      var vl = b.create('line', [vb, vt], { visible: false });
      var M = X.G('M', S.M, vl, [8, 8]);
      X.seg(X.H(function () { return -6; }, function () { return 0; }), X.H(function () { return 6; }, function () { return 0; }), 'ax', null, 1, { strokeColor: C0.mu });
      X.seg(X.H(function () { return M0.X(); }, function () { return -5; }), X.H(function () { return M0.X(); }, function () { return 5; }), 'locus', 'locus', 2, {}, 4.5);
      X.seg(A, M, 'AM', 'sq', 1.5, { dash: 2 }, 3.5); X.seg(B, M, 'BM', 'sq', 1.5, { dash: 2 }, 3.5);
      X.seg(A, B, 'AB', 'AB', 2.2, {}, 4.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(M, 'pM', 'M'); X.pt(M0, 'pM0', 'M0'); X.pt(O, 'pO', 'O');
      b.on('update', function () {
        S.x0 = M0.X(); S.M = [M.X(), M.Y()];
        var k = 2 * a * M0.X(), d = Math.pow(G.dist(A, M), 2) - Math.pow(G.dist(B, M), 2);
        X.ro([[['k = 2a·x(M<sub>0</sub>)', G.f2(k)], ['AM² − BM²', G.f2(d) + ' ' + G.ok(k, d, 0.01)]], [['x(M<sub>0</sub>)', G.f2(M0.X())], ['k / (2a)', G.f2(d / (2 * a)) + ' ' + G.ok(M0.X(), d / (2 * a), 0.003)]]]);
      });
    }
  };

  /* Рис. 0.12 — AM² + BM² = k²: окружность с центром в середине AB, r = √(2k² − a²) / 2 */
  FIGS.f12 = {
    bbox: [-5.6, 4.6, 5.6, -4.6],
    state: function () { return { A: [-2.4, 0], M: [0.3, 1.5] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, K = 4;
      var xa = b.create('line', [X.H(function () { return -9; }, function () { return 0; }), X.H(function () { return 9; }, function () { return 0; })], { visible: false });
      var seg = b.create('segment', [X.H(function () { return -2.8; }, function () { return 0; }), X.H(function () { return -0.4; }, function () { return 0; })], { visible: false });
      var A = X.G('A', S.A, seg, [-22, -16]);
      var B = X.D('B', function () { return -A.X(); }, function () { return 0; }, [8, -16]);
      var O = X.D('O', function () { return 0; }, function () { return 0; }, [-16, -18]);
      var rr = function () { var a = 2 * Math.abs(A.X()); return Math.sqrt(Math.max(1e-6, 2 * K * K - a * a)) / 2; };
      var circ = b.create('circle', [O, rr], { strokeColor: C0.fg, strokeWidth: 1.8, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      X.reg('loc', 'loc', circ, { strokeColor: C0.fg, strokeWidth: 1.8 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      var M = X.G('M', S.M, circ, [8, 8]);
      X.seg(A, B, 'AB', 'AB', 2.2, {}, 4.5);
      X.seg(A, M, 'AM', 'sq', 1.5, { dash: 2 }, 3.5); X.seg(B, M, 'BM', 'sq', 1.5, { dash: 2 }, 3.5);
      X.hidden(O, M, 'OM', 'r');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(M, 'pM', 'M'); X.pt(O, 'pO', 'O');
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.M = [M.X(), M.Y()];
        var a = 2 * Math.abs(A.X()), s = Math.pow(G.dist(A, M), 2) + Math.pow(G.dist(B, M), 2), om = G.dist(O, M), f = Math.sqrt(Math.max(0, 2 * K * K - a * a)) / 2;
        X.ro([[['AM² + BM²', G.f2(s)], ['k²', G.f2(K * K) + ' ' + G.ok(s, K * K, 0.01)]], [['OM', G.f2(om)], ['√(2k² − a²) / 2', G.f2(f) + ' ' + G.ok(om, f)]]]);
      });
    }
  };

  /* Рис. 0.13 — окружность Аполлония: AM / BM = k (точка M двигается, окружность строится по текущему k) */
  FIGS.f13 = {
    bbox: [-5.5, 5.8, 9.5, -5.8],
    state: function () { return { M: [4.8, 1.6] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, a = 3;
      var A = X.D('A', function () { return 0; }, function () { return 0; }, [-22, -18]), B = X.D('B', function () { return a; }, function () { return 0; }, [-20, -22]);
      var M = X.P('M', S.M, [8, 8]);
      function kk() { var d = G.dist(B, M); return d < 1e-9 ? 1e3 : G.dist(A, M) / d; }
      function cx() { var k2 = kk() * kk(); return Math.abs(k2 - 1) < 0.01 ? 1e3 : a * k2 / (k2 - 1); }
      function rad() { var k2 = kk() * kk(); return Math.min(1e3, a * kk() / Math.max(0.01, Math.abs(k2 - 1))); }
      var Oc = X.D('O', cx, function () { return 0; }, [10, -22]);
      var circ = b.create('circle', [Oc, rad], { strokeColor: C0.fg, strokeWidth: 1.8, fillColor: 'none', fixed: true, highlightStrokeColor: C0.fg, highlightFillColor: 'none' });
      X.reg('loc', 'loc', circ, { strokeColor: C0.fg, strokeWidth: 1.8 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      X.seg(X.H(function () { return -5; }, function () { return 0; }), X.H(function () { return 9; }, function () { return 0; }), 'ax', null, 1, { strokeColor: C0.mu });
      X.seg(A, M, 'AM', 'AM', 1.6, {}, 4); X.seg(B, M, 'BM', 'BM', 1.6, {}, 4);
      X.seg(A, B, 'AB', 'AB', 2.2, {}, 4.5);
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(M, 'pM', 'M'); X.pt(Oc, 'pO', 'O');
      b.on('update', function () {
        S.M = [M.X(), M.Y()];
        var k = kk(), r = rad(), om = G.dist(Oc, M), x = Oc.X(), prod = Math.abs(x) * Math.abs(x - a), r2 = r * r;
        X.ro([[['k = AM / BM', G.f2(k)], ['r = a·k / |k² − 1|', G.f2(r)]], [['OM', G.f2(om)], ['r', G.f2(r) + ' ' + G.ok(om, r, 0.01)]], [['OA · OB', G.f2(prod)], ['r²', G.f2(r2) + ' ' + G.ok(prod, r2, 0.02)]]]);
      });
    }
  };

  /* Рис. 0.14 — эллипс: F₁M + F₂M = 2a, x²/a² + y²/b² = 1 */
  FIGS.f14 = {
    bbox: [-6.4, 5, 6.4, -5],
    state: function () { return { F: [2.4, 0], M: [2, 2.77] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, a = 4;
      var seg = b.create('segment', [X.H(function () { return 0.4; }, function () { return 0; }), X.H(function () { return 3.6; }, function () { return 0; })], { visible: false });
      var F2 = X.G('F<sub>2</sub>', S.F, seg, [6, -20]);
      var F1 = X.D('F<sub>1</sub>', function () { return -F2.X(); }, function () { return 0; }, [-26, -20]);
      var bb = function () { var c = F2.X(); return Math.sqrt(Math.max(0.01, a * a - c * c)); };
      var el = b.create('curve', [function (t) { return a * Math.cos(t); }, function (t) { return bb() * Math.sin(t); }, 0, 2 * Math.PI], { strokeColor: C0.fg, strokeWidth: 2, fixed: true, highlightStrokeColor: C0.fg });
      X.reg('ell', 'ell', el, { strokeColor: C0.fg, strokeWidth: 2 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      var M = X.G('M', S.M, el, [8, 8]);
      X.seg(X.H(function () { return -6; }, function () { return 0; }), X.H(function () { return 6; }, function () { return 0; }), 'ax1', null, 1, { strokeColor: C0.mu });
      X.seg(X.H(function () { return 0; }, function () { return -4.4; }), X.H(function () { return 0; }, function () { return 4.4; }), 'ax2', null, 1, { strokeColor: C0.mu });
      X.seg(F1, M, 'F1M', 'F1M', 1.6, {}, 4); X.seg(F2, M, 'F2M', 'F2M', 1.6, {}, 4);
      X.pt(F1, 'pF1', 'F1'); X.pt(F2, 'pF2', 'F2'); X.pt(M, 'pM', 'M');
      X.alias('sum', ['F1M', 'F2M']);
      X.anim({ label: 'Обойти эллипс', dur: 9000, t0: null,
        steps: [[0, 'M идёт по эллипсу'], [0.1, 'Сумма расстояний до фокусов не меняется'], [0.6, 'F₁M + F₂M = 2a в каждой точке']],
        set: function (t) { var th_ = 0.5 + t * 2 * Math.PI; M.setPosition(JXG.COORDS_BY_USER, [a * Math.cos(th_), bb() * Math.sin(th_)]); } });
      b.on('update', function () {
        S.F = [F2.X(), 0]; S.M = [M.X(), M.Y()];
        var s = G.dist(F1, M) + G.dist(F2, M), e = M.X() * M.X() / (a * a) + M.Y() * M.Y() / (bb() * bb());
        X.ro([[['F<sub>1</sub>M + F<sub>2</sub>M', G.f2(s)], ['2a', G.f2(2 * a) + ' ' + G.ok(s, 2 * a, 0.02)]], [['x²/a² + y²/b²', e.toFixed(3)], ['1', '— ' + G.ok(e, 1, 0.005)]], [['b = √(a² − c²)', G.f2(bb())], ['c', G.f2(F2.X())]]]);
      });
    }
  };

  /* Рис. 0.15 — гипербола: |F₁M − F₂M| = 2a, x²/a² − y²/b² = 1 */
  FIGS.f15 = {
    bbox: [-8, 6.6, 8, -6.6],
    state: function () { return { F: [3.4, 0], M: [3.4, 2.62] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, a = 2;
      var seg = b.create('segment', [X.H(function () { return 2.4; }, function () { return 0; }), X.H(function () { return 6.6; }, function () { return 0; })], { visible: false });
      var F2 = X.G('F<sub>2</sub>', S.F, seg, [6, -20]);
      var F1 = X.D('F<sub>1</sub>', function () { return -F2.X(); }, function () { return 0; }, [-26, -20]);
      var bb = function () { var c = F2.X(); return Math.sqrt(Math.max(0.01, c * c - a * a)); };
      var right = b.create('curve', [function (t) { return a * Math.cosh(t); }, function (t) { return bb() * Math.sinh(t); }, -1.7, 1.7], { strokeColor: C0.fg, strokeWidth: 2, fixed: true, highlightStrokeColor: C0.fg });
      var left = b.create('curve', [function (t) { return -a * Math.cosh(t); }, function (t) { return bb() * Math.sinh(t); }, -1.7, 1.7], { strokeColor: C0.fg, strokeWidth: 2, fixed: true, highlightStrokeColor: C0.fg });
      X.reg('hy1', 'hyp', right, { strokeColor: C0.fg, strokeWidth: 2 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      X.reg('hy2', 'hyp', left, { strokeColor: C0.fg, strokeWidth: 2 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      var M = X.G('M', S.M, right, [8, 8]);
      var as1 = X.seg(X.H(function () { return -7; }, function () { return -7 * bb() / a; }), X.H(function () { return 7; }, function () { return 7 * bb() / a; }), 'as1', 'asym', 1.2, { dash: 3 }, 3.5);
      var as2 = X.seg(X.H(function () { return -7; }, function () { return 7 * bb() / a; }), X.H(function () { return 7; }, function () { return -7 * bb() / a; }), 'as2', 'asym', 1.2, { dash: 3 }, 3.5);
      X.seg(X.H(function () { return -8; }, function () { return 0; }), X.H(function () { return 8; }, function () { return 0; }), 'ax1', null, 1, { strokeColor: C0.mu });
      X.seg(F1, M, 'F1M', 'F1M', 1.6, {}, 4); X.seg(F2, M, 'F2M', 'F2M', 1.6, {}, 4);
      X.pt(F1, 'pF1', 'F1'); X.pt(F2, 'pF2', 'F2'); X.pt(M, 'pM', 'M');
      X.alias('diff', ['F1M', 'F2M']);
      b.on('update', function () {
        S.F = [F2.X(), 0]; S.M = [M.X(), M.Y()];
        var d = Math.abs(G.dist(F1, M) - G.dist(F2, M)), e = M.X() * M.X() / (a * a) - M.Y() * M.Y() / (bb() * bb());
        X.ro([[['|F<sub>1</sub>M − F<sub>2</sub>M|', G.f2(d)], ['2a', G.f2(2 * a) + ' ' + G.ok(d, 2 * a, 0.02)]], [['x²/a² − y²/b²', e.toFixed(3)], ['1', '— ' + G.ok(e, 1, 0.005)]], [['b = √(c² − a²)', G.f2(bb())], ['асимптоты y = ± (b/a)·x', '']]]);
      });
    }
  };

  /* Рис. 0.16 — парабола: FM = HM, y² = 2px */
  FIGS.f16 = {
    bbox: [-4.4, 7, 8.8, -7],
    state: function () { return { F: [1.5, 0], M: [1.7, 3.2] }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      var seg = b.create('segment', [X.H(function () { return 0.6; }, function () { return 0; }), X.H(function () { return 3.2; }, function () { return 0; })], { visible: false });
      var F = X.G('F', S.F, seg, [8, -16]);
      var p = function () { return 2 * F.X(); };
      var par = b.create('curve', [function (t) { return t * t / (2 * p()); }, function (t) { return t; }, -6.6, 6.6], { strokeColor: C0.fg, strokeWidth: 2, fixed: true, highlightStrokeColor: C0.fg });
      X.reg('par', 'par', par, { strokeColor: C0.fg, strokeWidth: 2 }, { strokeColor: C0.acc, strokeWidth: 4.5 });
      var M = X.G('M', S.M, par, [8, 8]);
      var Hh = X.D('H', function () { return -F.X(); }, function () { return M.Y(); }, [-20, 6]);
      X.seg(X.H(function () { return -F.X(); }, function () { return -6.8; }), X.H(function () { return -F.X(); }, function () { return 6.8; }), 'dir', 'dir', 1.4, { dash: 3 }, 4);
      X.seg(X.H(function () { return -4; }, function () { return 0; }), X.H(function () { return 8; }, function () { return 0; }), 'ax1', null, 1, { strokeColor: C0.mu });
      X.seg(F, M, 'FM', 'FM', 1.6, {}, 4); X.seg(Hh, M, 'HM', 'HM', 1.6, {}, 4);
      X.right(Hh, M, X.H(function () { return -F.X(); }, function () { return M.Y() + 1; }), 0.28, 'rH', 'HM');
      X.pt(F, 'pF', 'F'); X.pt(M, 'pM', 'M'); X.pt(Hh, 'pH', 'H');
      X.alias('FM=HM', ['FM', 'HM']);
      b.on('update', function () {
        S.F = [F.X(), 0]; S.M = [M.X(), M.Y()];
        var f = G.dist(F, M), h = G.dist(Hh, M), y2 = M.Y() * M.Y(), e = 2 * p() * M.X();
        X.ro([[['FM', G.f2(f)], ['HM', G.f2(h) + ' ' + G.ok(f, h, 0.01)]], [['y²', G.f2(y2)], ['2px', G.f2(e) + ' ' + G.ok(y2, e, 0.03)]], [['p = 2·x(F)', G.f2(p())]]]);
      });
    }
  };
})();
