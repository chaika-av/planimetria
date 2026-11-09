/* Глава 9. Определение вида треугольника по его сторонам */
(function () {
  var G = window.GEO; window.FIGS = window.FIGS || {};
  function ok(c) { return c ? '<em class="ok">✓</em>' : '<em class="bad">≠</em>'; }
  var PI = Math.PI;

  /* Рис. 9.1 — вид треугольника по наибольшей стороне */
  FIGS.g91 = {
    bbox: [-5.6, 4.4, 5.6, -2.6],
    state: function () { return { A: [-3.6, -1.0], B: [3.8, -1.0], C: [0.6, 3.0] }; },
    build: function (X) {
      var b = X.b, S = X.S;
      var A = X.P('A', S.A, [-22, -14]), B = X.P('B', S.B, [8, -14]), C = X.P('C', S.C, [-4, 10]);
      G.guard(b, [A, B, C], function () { var m = [G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)]; return m.every(function (x) { return isFinite(x) && x > 0.15 && x < 3.0; }); });
      X.seg(A, B, 'AB', 'c', 2, {}, 4.5); X.seg(B, C, 'BC', 'a', 2, {}, 4.5); X.seg(C, A, 'CA', 'b', 2, {}, 4.5);
      X.ang(C, A, B, 0.7, '<i>α</i>', 'aC', 'alpha');
      X.pt(A, 'pA', 'A'); X.pt(B, 'pB', 'B'); X.pt(C, 'pC', 'C');
      var cx = null;
      X.anim({ label: 'Опустить вершину C', dur: 9000, t0: null,
        steps: [[0, 'Острые углы: квадрат большей стороны меньше суммы квадратов двух других'], [0.55, 'Около прямого угла: a² = b² + c² (теорема Пифагора)'], [0.65, 'Тупой угол: квадрат большей стороны больше суммы']],
        set: function (t) { if (cx === null || t === 0) cx = (A.X() + B.X()) / 2; C.setPosition(JXG.COORDS_BY_USER, [cx, A.Y() + 4.8 - 4.2 * t - 0.3 * 0]); } });
      b.on('update', function () {
        S.A = [A.X(), A.Y()]; S.B = [B.X(), B.Y()]; S.C = [C.X(), C.Y()];
        var s = [['a = BC', G.dist(B, C), G.ang(A, B, C)], ['b = CA', G.dist(C, A), G.ang(B, C, A)], ['c = AB', G.dist(A, B), G.ang(C, A, B)]];
        s.sort(function (u, v) { return v[1] - u[1]; });
        var L = s[0], p = s[1], q = s[2], lhs = L[1] * L[1], rhs = p[1] * p[1] + q[1] * q[1], d = lhs - rhs;
        var verdict = Math.abs(d) < 0.04 * lhs ? 'прямоугольный' : (d < 0 ? 'остроугольный' : 'тупоугольный');
        var mx = Math.max(G.ang(A, B, C), G.ang(B, C, A), G.ang(C, A, B)), real = Math.abs(mx - PI / 2) < 0.04 ? 'прямоугольный' : (mx < PI / 2 ? 'остроугольный' : 'тупоугольный');
        X.ro([[['наибольшая сторона', L[0]], ['её квадрат', G.f2(lhs)]],
              [['сумма квадратов двух других', G.f2(rhs)], ['сравнение', d < 0 ? '<' : '>']],
              [['вывод по сторонам', verdict], ['наибольший угол', G.deg(mx) + ' ' + ok(verdict === real)]]]);
      });
    }
  };

  /* общие оси для графиков: x = α·6/π, 0…π */
  function axes(X, ytop, ybot) {
    var b = X.b, C0 = X.C, o = { strokeColor: C0.mu, strokeWidth: 1.2, fixed: true, highlight: false };
    b.create('segment', [[-0.3, 0], [6.6, 0]], o); b.create('segment', [[0, ybot], [0, ytop]], o);
    [[3, '90°'], [6, '180°']].forEach(function (t) { b.create('segment', [[t[0], -0.08], [t[0], 0.08]], o); X.lbl(t[0], ybot < -1 ? -0.45 : -0.45, t[1]); });
    X.lbl(0, 0, '', null);
  }

  /* Рис. 9.2 — график y = cos α */
  FIGS.g92 = {
    bbox: [-1.4, 3.2, 7.6, -3.2],
    state: function () { return { t: 4.2 }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C;
      axes(X, 2.6, -2.6);
      b.create('curve', [function (t) { return t * 6 / PI; }, function (t) { return 2 * Math.cos(t); }, 0, PI], { strokeColor: C0.fg, strokeWidth: 2, fixed: true, highlight: false });
      X.lbl(6.9, 0.35, '<i>α</i>'); X.lbl(0.7, 2.6, 'y = cos <i>α</i>');
      var seg = b.create('segment', [[0, 0], [6, 0]], { visible: false });
      var T = X.G('', [S.t, 0], seg, [0, 0]);
      var P = X.D('', function () { return T.X(); }, function () { return 2 * Math.cos(T.X() * PI / 6); }, [8, 8]);
      b.create('segment', [T, P], { strokeColor: C0.acc, strokeWidth: 1.6, dash: 2, fixed: true, highlight: false });
      X.pt(P, 'pP', ''); X.pt(T, 'pT', '');
      b.on('update', function () {
        S.t = T.X(); var al = T.X() * PI / 6, c = Math.cos(al);
        X.ro([[['α', G.deg(al)], ['cos α', G.f2(c) + ' ' + (al < PI / 2 - 1e-6 ? '> 0 (острый угол)' : (al > PI / 2 + 1e-6 ? '< 0 (тупой угол)' : '= 0'))]]]);
      });
    }
  };

  /* Рис. 9.3 — c² = a² + b² − 2ab·cos α при a = 3, b = 4 */
  FIGS.g93 = {
    bbox: [-1.4, 7.6, 7.8, -1.6],
    state: function () { return { t: 4.2 }; },
    build: function (X) {
      var b = X.b, S = X.S, C0 = X.C, a = 3, bb = 4, k = 8;
      axes(X, 7.0, -0.6);
      b.create('curve', [function (t) { return t * 6 / PI; }, function (t) { return (a * a + bb * bb - 2 * a * bb * Math.cos(t)) / k; }, 0, PI], { strokeColor: C0.fg, strokeWidth: 2, fixed: true, highlight: false });
      var dl = { strokeColor: C0.mu, strokeWidth: 1.2, dash: 3, fixed: true, highlight: false };
      b.create('segment', [[0, (a * a + bb * bb) / k], [6.4, (a * a + bb * bb) / k]], dl); X.lbl(7.2, (a * a + bb * bb) / k, 'a² + b²');
      b.create('segment', [[0, bb * bb / k], [6.4, bb * bb / k]], dl); X.lbl(7.2, bb * bb / k, 'b²');
      b.create('segment', [[3, 0], [3, 7.0]], dl);
      X.lbl(0.9, 7.0, 'c² = a² + b² − 2ab·cos <i>α</i>');
      var seg = b.create('segment', [[0, 0], [6, 0]], { visible: false });
      var T = X.G('', [S.t, 0], seg, [0, 0]);
      var P = X.D('', function () { return T.X(); }, function () { var al = T.X() * PI / 6; return (a * a + bb * bb - 2 * a * bb * Math.cos(al)) / k; }, [8, 8]);
      b.create('segment', [T, P], { strokeColor: C0.acc, strokeWidth: 1.6, dash: 2, fixed: true, highlight: false });
      X.pt(P, 'pP', ''); X.pt(T, 'pT', '');
      b.on('update', function () {
        S.t = T.X(); var al = T.X() * PI / 6, c2 = a * a + bb * bb - 2 * a * bb * Math.cos(al), mx = Math.max(c2, bb * bb, a * a);
        var side = c2 >= bb * bb ? 'c' : 'b';
        X.ro([[['α', G.deg(al)], ['c²', G.f2(c2)], ['a² + b²', G.f2(a * a + bb * bb)]],
              [['наибольшая сторона', side], ['c² ' + (c2 < a * a + bb * bb - 1e-6 ? '<' : (c2 > a * a + bb * bb + 1e-6 ? '>' : '=')) + ' a² + b²', al < PI / 2 - 1e-6 ? 'угол C острый' : (al > PI / 2 + 1e-6 ? 'угол C тупой' : 'угол C прямой')]],
              [['c = b при', G.deg(Math.acos(a / (2 * bb))) + ' = arccos(a / 2b)']]]);
      });
    }
  };
})();
