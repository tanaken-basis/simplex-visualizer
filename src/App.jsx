import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Scatter,
  Legend,
  Label,
} from "recharts";
import { MathJax, MathJaxContext } from "better-react-mathjax";

/**
 * Single-file demo app (App.jsx) for visualizing the 2-variable Simplex method.
 * - React + Vite
 * - Recharts for plotting
 * - MathJax for formulas
 * - Step-by-step Simplex with Bland's rule from initial BFS (0,0)
 * - Parameters controlled by sliders; changing parameters resets the algorithm
 * - Shows current simplex tableau
 * - i18n-ready via t(key) and translations dict (ja/en)
**/

// ---------- theme ----------
const theme = {
  // surfaces
  bg: '#f8fafc',
  // text colors
  title: '#111827',      // page title
  text: '#0f172a',       // default text
  muted: '#64748b',      // small notes
  cardTitle: '#111827',  // card section headings
  objText: '#0f766e',    // objective value text
  status: {              // status label colors
    optimal: '#16a34a',
    continue: '#92400e',
    unbounded: '#dc2626',
  },
  // chart primitives
  grid: '#e5e7eb',
  ref: '#6b7280',
  feasible: '#10b981',
  constraint1: '#ef4444',
  objective: '#0ea5e9',
  path: '#8b5cf6',
  current: '#f59e0b',
  // simplex table theme
  table: {
    headerBg: '#f1f5f9',
    headerText: '#0f172a',
    rowBg: '#ffffff',
    rowAltBg: '#f8fafc',
    border: '#e5e7eb',
    text: '#0f172a',
    pivotBg: '#fde68a',
    pivotText: '#78350f',
    pivotBorder: '#f59e0b',
    pivotRowBg: '#fff7ed',
    pivotColBg: '#fffbeb',
  },
};

// ---------- i18n ----------
const translations = {
  ja: {
    title: "2変数シンプレックス法 可視化",
    language: "Language",
    ja: "日本語",
    en: "English",
    headerDesc: "2変数の線形計画問題を例に、シンプレックス法の動きを、グラフとシンプレックス表を通じて可視化・理解するためのWebアプリです。",
    objective: "目的関数",
    constraints: "制約条件",
    graph: "グラフ",
    howToUse: "使い方",
    Step1: "スライダーで係数や制約条件を調整する。",
    Step2: "グラフに実行可能領域や制約・目的関数の直線が描画される。",
    Step3: "「次へ」ボタンで (0,0) からシンプレックス法の基底解を1ステップずつ進める。「戻る」ボタンで戻れる。",
    Step4: "最適解に到達すると「最適」と表示され、目的関数値が確認できる。",
    useConstraint2: "第2制約を有効にする",
    parameters: "パラメーター",
    c1: "c₁",
    c2: "c₂",
    a11: "a₁₁",
    a12: "a₁₂",
    b1: "b₁",
    a21: "a₂₁",
    a22: "a₂₂",
    b2: "b₂",
    u1: "U₁",
    u2: "U₂",
    next: "次へ",
    back: "戻る",
    reset: "リセット",
    simplexTableau: "シンプレックス表",
    currentPoint: "現在の点",
    visitedPath: "訪問経路",
    constraint1: "a₁₁x₁ + a₁₂x₂ = b₁",
    constraint2: "a₂₁x₁ + a₂₂x₂ = b₂",
    constraintX1: "x₁ = U₁",
    constraintX2: "x₂ = U₂",
    objectiveLine: "目的関数等高線",
    statusOptimal: "最適",
    statusUnbounded: "非有界",
    statusContinue: "進行中",
    note: "パラメータ変更で初期化（点は(0,0)に戻ります）",
    x1: "x₁",
    x2: "x₂",
    rhs: "右辺",
    basic: "基底",
    rowZ: "z",
    objValue: "現在の目的関数値",
    lockScale: "描画範囲を固定",
    feasible: "実現可能領域",
    phase1: "実行可能性",
    phase1Feasible: "実行可能",
    phase1Infeasible: "実行不可能",
    aboutTheApp: "Recharts でグラフを描画し、MathJax で数式を描画しています。",
  },
  en: {
    title: "2-Variable Simplex Visualizer",
    language: "Language",
    ja: "日本語",
    en: "English",
    headerDesc: "This web application visualizes and explains the Simplex method using graphs and Simplex tables, using a two-variable linear programming problem as an example.",
    objective: "Objective",
    constraints: "Constraints",
    graph: "Graph",
    howToUse: "How to use",
    Step1: "Adjust the coefficients and constraints using the sliders.",
    Step2: "The feasible region, constraint lines, and objective function line will be drawn on the graph.",
    Step3: 'Click the “Next” button to proceed one step at a time from (0,0) using the simplex method. Click “Back” to return.',
    Step4: 'When the optimal solution is reached, “Optimal” will be displayed and the objective function value can be confirmed.',
    parameters: "Parameters",
    useConstraint2: "Enable 2nd constraint",
    c1: "c₁",
    c2: "c₂",
    a11: "a₁₁",
    a12: "a₁₂",
    b1: "b₁",
    a21: "a₂₁",
    a22: "a₂₂",
    b2: "b₂",
    u1: "U₁",
    u2: "U₂",
    next: "Next",
    back: "Back",
    reset: "Reset",
    simplexTableau: "Simplex Tableau",
    currentPoint: "Current Point",
    visitedPath: "Visited Path",
    constraint1: "a₁₁x₁ + a₁₂x₂ = b₁",
    constraint2: "a₂₁x₁ + a₂₂x₂ = b₂",
    constraintX1: "x₁ = U₁",
    constraintX2: "x₂ = U₂",
    objectiveLine: "Objective Iso-line",
    statusOptimal: "Optimal",
    statusUnbounded: "Unbounded",
    statusContinue: "In progress",
    note: "Changing parameters resets the algorithm (point returns to (0,0)).",
    x1: "x₁",
    x2: "x₂",
    rhs: "RHS",
    basic: "Basic",
    rowZ: "z",
    objValue: "Current objective value",
    lockScale: "Lock axes range",
    feasible: "Feasible region",
    phase1: "Feasibility",
    phase1Feasible: "Feasible",
    phase1Infeasible: "Infeasible",
    aboutTheApp: "Recharts is used to draw graphs, and MathJax is used to draw mathematical formulas.",
  },
};

function App() {
  const [lang, setLang] = useState("ja");
  const t = (k) => (translations[lang] && translations[lang][k]) || k;

  // ---------- Parameters ----------
  const [params, setParams] = useState({
    c1: 2,
    c2: 4,
    a11: 1,
    a12: 2.5,
    a21: 1,
    a22: 1,
    b1: 6,
    b2: 4.5,
    u1: 4,
    u2: 2,
    useC2: false,
  });

  // History of tableaux (for Back) and current index
  const [history, setHistory] = useState([makeInitialTableau({ ...params })]);
  const [stepIndex, setStepIndex] = useState(0);
  const current = history[stepIndex];

  // Phase I feasibility (for this constraint family)
  const phase1 = useMemo(() => computePhaseOne(params), [params]);

  // Scale locking (min/max both)
  const [lockScale, setLockScale] = useState(false);
  const [lockedDomain, setLockedDomain] = useState({ xMin: -1, xMax: 20, yMin: -1, yMax: 20 });

  // Reset when params change
  const onParamChange = (patch) => {
    const next = { ...params, ...patch };
    setParams(next);
    const init = makeInitialTableau(next);
    setHistory([init]);
    setStepIndex(0);
  };

  // ---------- Auto domain suggestion ----------
  const autoDomain = useMemo(() => {
    const { a11, a12, a21, a22, b1, b2, u1, u2, useC2 } = params;
    const safeDiv = (num, den) => (den > 0 ? num / den : 0);
    const estX = Math.max(u1, safeDiv(b1, a11 || 0), useC2 ? safeDiv(b2, a21 || 0) : 0, 1);
    const estY = Math.max(u2, safeDiv(b1, a12 || 0), useC2 ? safeDiv(b2, a22 || 0) : 0, 1);
    return { xMin: -1, xMax: Math.max(1, estX) * 1.5, yMin: -1, yMax: Math.max(1, estY) * 1.5 };
  }, [params]);

  // Apply domain (locked or auto)
  const xMin = lockScale ? lockedDomain.xMin : autoDomain.xMin;
  const xMax = lockScale ? lockedDomain.xMax : autoDomain.xMax;
  const yMin = lockScale ? lockedDomain.yMin : autoDomain.yMin;
  const yMax = lockScale ? lockedDomain.yMax : autoDomain.yMax;

  // Update lock to current auto range when turning on
  const toggleLock = (checked) => {
    if (checked) setLockedDomain({ ...autoDomain });
    setLockScale(checked);
  };

  // ---------- Lines & areas for plotting ----------
  const constraint1Line = useMemo(
    () => makeConstraintLine(params.a11, params.a12, params.b1, -1, 20),
    [params]
  );
  const constraint2Line = useMemo(
    () => params.useC2 ? makeConstraintLine(params.a21, params.a22, params.b2, -1, 20) : [],
    [params]
  );
  const objectiveLine = useMemo(() => makeObjectiveLine(params, current.point, 20, 20), [params, current.point, xMax, yMax]); // makeObjectiveLine(params, current.point, xMax, yMax), [params, current.point, xMax, yMax]);
  const feasibleArea = useMemo(() => makeFeasibleAreaData(params, -1, 20, -1, 20), [params, xMin, xMax, yMin, yMax]); // makeFeasibleAreaData(params, xMin, xMax, yMin, yMax), [params, xMin, xMax, yMin, yMax]);

  // Path of visited BFS points up to current step
  const pathData = useMemo(() => history.slice(0, stepIndex + 1).map(h => ({ x: h.point.x, y: h.point.y })), [history, stepIndex]);

  // ---------- Controls for stepping ----------
  const canStep = current.status === "continue";

  const handleNext = () => {
    if (stepIndex < history.length - 1) { setStepIndex(stepIndex + 1); return; }
    if (!canStep) return;
    const next = stepSimplex(history[history.length - 1]);
    setHistory([...history, next]);
    setStepIndex(stepIndex + 1);
  };

  const handleBack = () => { if (stepIndex > 0) setStepIndex(stepIndex - 1); };
  const handleReset = () => { const init = makeInitialTableau(params); setHistory([init]); setStepIndex(0); };

  // Objective value at current point
  const objVal = useMemo(() => params.c1 * current.point.x + params.c2 * current.point.y, [params, current.point]);

// ---------- LaTeX strings ----------
  const latexObjectiveWithParameterSymbols = String.raw`\(\max\quad z = c_1 x_1 + c_2 x_2 \)`;
  const latexObjectiveWithValuesSubstituted = useMemo(() => {
    const { c1, c2 } = params;
    return String.raw`\(\max\quad z = ${fmtCoeff(c1)} x_1 ${fmtSignCoeff(c2)} x_2 \)`;
  }, [params]);

  const line1 = `s.t.\\quad a_{11} x_1 + a_{12} x_2 \\leq b_1`;
  const line2 = params.useC2 ? `a_{21} x_1 + a_{22} x_2 \\leq b_2` : null;
  const line3 = `x_1 \\leq U_1`;
  const line4 = `x_2 \\leq U_2`;
  const line5 = `x_1, x_2 \\geq 0`;
  const latexConstraintsWithParameterSymbols = String.raw`\(\begin{aligned} ${line1} \\ ${line2 ? line2 + ' \\\\ ' : ''}${line3} \\ ${line4} \\ ${line5} \end{aligned}\)`;
  const latexConstraintsWithValuesSubstituted = useMemo(() => {
    const { a11, a12, b1, a21, a22, b2, u1, u2, useC2 } = params;
    const L1 = `s.t.\\quad ${fmtCoeff(a11)} x_1 ${fmtSignCoeff(a12)} x_2 \\leq ${fmtNumber(b1)}`;
    const L2 = useC2 ? `${fmtCoeff(a21)} x_1 ${fmtSignCoeff(a22)} x_2 \\leq ${fmtNumber(b2)}` : null;
    const L3 = `x_1 \\leq ${fmtNumber(u1)}`;
    const L4 = `x_2 \\leq ${fmtNumber(u2)}`;
    const L5 = `x_1, x_2 \\geq 0`;
    return String.raw`\(\begin{aligned} ${L1} \\ ${L2 ? L2 + ' \\\\ ' : ''}${L3} \\ ${L4} \\ ${L5} \end{aligned}\)`;
  }, [params]);

  // ---------- Render ----------
  return (
    <MathJaxContext version={3} config={{ options: { enableMenu: false } }}>
    <div style={{ minHeight: "100vh", background: "linear-gradient(#f2f2f2dd, #a7a7a7bb)", color: "#0f172a" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" }}>
        <header style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <h1 style={{ fontSize: 24, margin: 0, color: theme.title }}>{t("title")}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label>{t("language")}:</label>
              <select value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{ margin: "40px 2px 40px 2px", borderRadius: 4, border: "1px solid #87888cd7", background: "#fff", color: "#475569" }}>
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>
            {t('headerDesc')}
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(520px, 1fr) 440px", gap: 16, alignItems: "start" }}>
          {/* Graph */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: theme.bg }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <strong style={{ color: theme.cardTitle }}>{t("graph")}</strong>
              <span style={{ color: theme.muted, fontSize: 12 }}>{t("note")}</span>
            </div>
            <div style={{ width: "100%", height: 520, minWidth: 600 }}>
              <ResponsiveContainer>
                <ComposedChart margin={{ top: 16, right: 24, bottom: 22, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                  <XAxis type="number" dataKey="x"
                    domain={lockScale ? [-1, 20] : [xMin, xMax]}
                    allowDataOverflow={true}
                    tickFormatter={(v) => v.toFixed(3)}  // 小数3桁で表示
                    >
                    <Label value="x₁" position="insideBottomRight" offset={-6} />
                  </XAxis>
                  <YAxis type="number" dataKey="y"
                    domain={lockScale ? [-1, 20] : [yMin, yMax]}
                    allowDataOverflow={true}
                    tickFormatter={(v) => v.toFixed(3)}  // 小数3桁で表示
                    >
                    <Label value="x₂" position="insideTopLeft" offset={10} />
                  </YAxis>

                  {/* Axes bounds */}
                  <ReferenceLine x={0} stroke={theme.ref} />
                  <ReferenceLine y={0} stroke={theme.ref} />

                  {/* Box constraints */}
                  <ReferenceLine x={params.u1} stroke="#94a3b8" label={{ value: t("constraintX1"), position: "top" }} />
                  <ReferenceLine y={params.u2} stroke="#94a3b8" label={{ value: t("constraintX2"), position: "left" }} />

                  {/* Feasible region fill */}
                  {feasibleArea.length > 1 && (
                    <Area
                      data={feasibleArea}
                      dataKey="y"
                      name={t("feasible")}
                      dot={false}
                      type="linear"
                      fill={theme.feasible}
                      stroke={theme.feasible}
                      fillOpacity={0.2}
                      isAnimationActive={false}
                    />
                  )}

                  {/* a11 x1 + a12 x2 = b1 */}
                  {constraint1Line.length === 2 && (
                    <Line data={constraint1Line} dataKey="y" name={t("constraint1")} dot={false} type="linear" stroke={theme.constraint1} />
                  )}
                  {/* a21 x1 + a22 x2 = b2 */}
                  {params.useC2 && constraint2Line.length === 2 && (
                    <Line data={constraint2Line} dataKey="y" name={t("constraint2")} dot={false} type="linear" stroke={theme.constraint2} />
                  )}

                  {/* objective iso-line through current point */}
                  {objectiveLine && objectiveLine.length === 2 && (
                    <Line data={objectiveLine} dataKey="y" name={t("objectiveLine")} dot={false} strokeDasharray="5 5" type="linear" stroke={theme.objective} />
                  )}

                  {/* visited path */}
                  {pathData.length > 1 && (
                    <Line data={pathData.map((p) => ({ x: p.x, y: p.y }))} dataKey="y" name={t("visitedPath")} dot={{ r: 3, fill: theme.path }} type="linear" stroke={theme.path} />
                  )}

                  {/* current point */}
                  <Scatter data={[{ x: current.point.x, y: current.point.y }]} name={t("currentPoint")} fill={theme.current} />

                  <Tooltip formatter={(value, name) => [round4(value), name]} labelFormatter={() => ""} />
                  <Legend iconSize={26} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Simplex tableau + info */}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: "8px 0", color: theme.cardTitle }}>
                {t("simplexTableau")} (
                <span style={{ color: theme.status[current.status] || theme.cardTitle }}>
                  {statusLabel(t, current.status)}
                </span>)
              </h3>
              {/* Phase I feasibility badge */}
              {/* <div style={{ fontSize: 14, color: theme.objText }}>
                <strong>Feasibility:</strong> {checkFeasible(params) ? "Feasible" : "Infeasible"}
              </div> */}
              <div style={{
                margin: 3,
                padding: 5,
                borderRadius: 8,
                border: `1px solid ${phase1.feasible ? '#22c55e55' : '#ef444455'}`,
                background: phase1.feasible ? '#dcfce7' : '#fee2e2',
                color: phase1.feasible ? '#166534' : '#991b1b',
                }}>
                <strong>{t('phase1')}:</strong> {phase1.feasible ? t('phase1Feasible') : t('phase1Infeasible')}
              </div>
              <div style={{ fontSize: 16, color: theme.objText }}>
                <strong>{t("objValue")}:</strong> z = {fmtNumber(objVal)}
              </div>
            </div>
            <TableauView tableau={current} t={t} />
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>

            <div style={{ border: "1px solid #c9c9c9ff", background: theme.bg, borderRadius: 12, padding: 12 }}>
              <strong>{t("parameters")}</strong>

              <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", flexWrap: "wrap", gap: 16, marginTop: 8, marginBottom: 16 }}>
                <MathJax dynamic>
                  <div style={{ fontSize: 14, border: "1px solid #999999ff", background: "#ffffff00", borderRadius: 8, padding: 8}}>
                    <div>{latexObjectiveWithParameterSymbols}</div>
                    <div style={{ marginTop: 8 }}>{latexConstraintsWithParameterSymbols}</div>
                  </div>
                </MathJax>
                <MathJax dynamic>
                  <div style={{ fontSize: 14, border: "1px solid #979797ff", background: "#e9e9e9ff", borderRadius: 8, padding: 8}}>
                    <div>{latexObjectiveWithValuesSubstituted}</div>
                    <div style={{ marginTop: 8 }}>{latexConstraintsWithValuesSubstituted}</div>
                  </div>
                </MathJax>
              </div>

              {/* Toggle Constraint2 */}
              {/* <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={params.useC2}
                  onChange={(e) => onParamChange({ useC2: e.target.checked })}
                />
                <span>{t("useConstraint2")}</span>
              </label> */}
              {/* Toggle Constraint2 */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 16 }}>
                <div style={{ position: "relative", width: 40, height: 20 }}>
                  <input
                    type="checkbox"
                    checked={params.useC2}
                    onChange={(e) => onParamChange({ useC2: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: params.useC2 ? "#4ade8086" : "#ccc",
                    borderRadius: 20,
                    transition: ".3s",
                  }}>
                    <span style={{
                      position: "absolute",
                      height: 16,
                      width: 16,
                      left: params.useC2 ? 20 : 2,
                      bottom: 2,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      transition: ".3s",
                    }}></span>
                  </span>
                </div>
                <span>{t("useConstraint2")}</span>
              </label>

              {/* Sliders grid widened to avoid overflow */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <Slider label={t("c1")} value={params.c1} min={0} max={10} step={0.5} onChange={(v) => onParamChange({ c1: v })} />
                <Slider label={t("c2")} value={params.c2} min={0} max={10} step={0.5} onChange={(v) => onParamChange({ c2: v })} />

                <Slider label={t("a11")} value={params.a11} min={0} max={10} step={0.5} onChange={(v) => onParamChange({ a11: v })} />
                <Slider label={t("a12")} value={params.a12} min={0} max={10} step={0.5} onChange={(v) => onParamChange({ a12: v })} />
                <Slider label={t("b1")} value={params.b1} min={-1} max={10} step={0.5} onChange={(v) => onParamChange({ b1: v })} />
                
                {params.useC2 && (
                  <React.Fragment>
                    <Slider label={t("a21")} value={params.a21} min={0} max={10} step={0.5} onChange={(v) => onParamChange({ a21: v })} disabled={!params.useC2} />
                    <Slider label={t("a22")} value={params.a22} min={0} max={10} step={0.5} onChange={(v) => onParamChange({ a22: v })} disabled={!params.useC2} />
                    <Slider label={t("b2")} value={params.b2} min={-1} max={10} step={0.5} onChange={(v) => onParamChange({ b2: v })} disabled={!params.useC2} />
                  </React.Fragment>
                )}
                
                <Slider label={t("u1")} value={params.u1} min={-1} max={10} step={0.5} onChange={(v) => onParamChange({ u1: v })} />
                <Slider label={t("u2")} value={params.u2} min={-1} max={10} step={0.5} onChange={(v) => onParamChange({ u2: v })} />
              </div>

              {/* Lock scale checkbox */}
              {/* <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={lockScale}
                  onChange={(e) => toggleLock(e.target.checked)} />
                <span>{t("lockScale")} (x∈[-1, 20], y∈[-1, 20])</span>
              </label> */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 16 }}>
                <div style={{ position: "relative", width: 40, height: 20 }}>
                  <input
                    type="checkbox"
                    checked={lockScale}
                    onChange={(e) => toggleLock(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: lockScale ? "#4ade8086" : "#ccc",
                    borderRadius: 20,
                    transition: ".3s",
                  }}>
                    <span style={{
                      position: "absolute",
                      height: 16,
                      width: 16,
                      left: lockScale ? 20 : 2,
                      bottom: 2,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      transition: ".3s",
                    }}></span>
                  </span>
                </div>
                <span>{t("lockScale")}</span>
              </label>

              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <button onClick={handleBack} disabled={stepIndex === 0}>
                  ⬅ {t("back")}
                </button>
                <button onClick={handleNext} disabled={!canStep} style={{ marginRight: 24 }}>
                  {t("next")} ➡
                </button>
                <strong style={{ color: theme.status[current.status] || theme.cardTitle, marginRight: 24 }}>
                  {statusLabel(t, current.status)}
                </strong>
                <button onClick={handleReset} style={{ marginright: 12 }}>{t("reset")}</button>
              </div>
            </div>

            <div style={{ border: "1px solid #c9c9c9ff", background: theme.bg, borderRadius: 12, padding: 12}}>
              <strong>{t("howToUse")}</strong>
              <ul style={{ fontSize: 12, marginTop: 4 }}>
                <li>{t("Step1")}</li>
                <li>{t("Step2")}</li>
                <li>{t("Step3")}</li>
                <li>{t("Step4")}</li>
              </ul>
            </div>

          </div>
        </section>
      </div>
      <footer style={{ marginLeft: 16, padding: 4, fontSize: 12, color: "#333333ff" }}>
          <p>{t('aboutTheApp')}</p>
      </footer>
    </div>
    </MathJaxContext>
  );
}

// ---------- UI helpers ----------
function Slider({ label, value, min, max, step = 1, onChange, disabled = false }) {
  return (
    <label style={{
      display: "grid",
      gridTemplateColumns: "60px 1fr 90px",
      alignItems: "center",
      gap: 8,
      width: "100%",
      opacity: disabled ? 0.6 : 1,
    }}>
      <span style={{ textAlign: "right" }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{ width: "100%" }}
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{ width: 90 }}
      />
    </label>
  );
}

function statusLabel(t, status) {
  if (status === "optimal") return t("statusOptimal");
  if (status === "unbounded") return t("statusUnbounded");
  return t("statusContinue");
}

function TableauView({ tableau, t }) {
  const nVars = tableau.A[0].length - 1; // exclude RHS
  const headers = [t("basic"), t("x1"), t("x2"), ...Array.from({ length: nVars - 2 }, (_, k) => `s${k + 1}`), t("rhs")];
  const tableStyle = { borderCollapse: "collapse", width: "100%", color: theme.table.text };
  const thStyle = {
    borderBottom: `1px solid ${theme.table.border}`,
    padding: "4px 6px",
    textAlign: "center",
    whiteSpace: "nowrap",
    background: theme.table.headerBg,
    color: theme.table.headerText,
  };
  const tdRightBase = { textAlign: "right", padding: "4px 6px", borderBottom: `1px solid ${theme.table.border}`, color: theme.table.text };
  const tdCenter = { textAlign: "center", padding: "4px 6px", borderBottom: `1px solid ${theme.table.border}`, color: theme.table.text };

  const next = tableau.status === 'continue' ? tableau.nextPivot : null;

  const styleForCell = (i, j, base) => {
    if (!next) return base;
    const isRow = next.row != null && i === next.row;
    const isCol = next.col != null && j === next.col;
    if (isRow && isCol) {
      return { ...base, fontWeight: 700, background: theme.table.pivotBg, color: theme.table.pivotText, outline: `2px solid ${theme.table.pivotBorder}`, outlineOffset: -2 };
    }
    if (isRow) return { ...base, background: theme.table.pivotRowBg };
    if (isCol) return { ...base, background: theme.table.pivotColBg };
    return base;
  };

  const cell = (v, style) => <td style={style}>{fmtNumber(v)}</td>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* rows then z-row */}
          {/* rows */}
          {tableau.A.map((row, i) => (
            <tr key={i} style={{ background: theme.table.rowBg }}>
              <td style={tdCenter}>{tableau.basic[i]}</td>
              {row.slice(0, nVars).map((v, j) => (
                <td key={j} style={styleForCell(i, j, tdRightBase)}>{fmtNumber(v)}</td>
              ))}
              {cell(row[nVars], tdRightBase)}
            </tr>
          ))}
          {/* z-row */}
          <tr style={{ background: theme.table.rowBg }}>
            <td style={tdCenter}>{t("rowZ")}</td>
            {tableau.z.slice(0, nVars).map((v, j) => (
              <td key={j} style={styleForCell(-1, j, tdRightBase)}>{fmtNumber(v)}</td>
            ))}
            {cell(tableau.z[nVars], tdRightBase)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------- Math/LP helpers ----------
function makeInitialTableau(p) {
  const { c1, c2, a11, a12, a21, a22, b1, b2, u1, u2, useC2 } = p;
  // Tableau columns: [x1, x2, s1, s2, s3, (s4), RHS]
  const rows = [
    [a11, a12, b1],              // Constraint1
    ...(useC2 ? [[a21,a22,b2]]:[]), // Constraint2(optional）
    [1, 0, u1],                  // x1 ≤ U1
    [0, 1, u2],                  // x2 ≤ U2
  ];
  // Add one slack to each row (unit matrix)
  const m = rows.length;
  const A = rows.map((r,i)=>{
    const [x1,x2,rhs] = r;
    const row = [x1,x2];
    for (let s=0; s<m; s++) row.push(s===i?1:0);
    row.push(rhs);
    return row;
  });
  const nVars = A[0].length - 1;
  const z = Array(nVars + 1).fill(0); z[0] = -c1; z[1] = -c2; // z - c^T x = 0
  const basic = Array(m).fill(0).map((_,i)=>`s${i+1}`.replace('s1','s₁').replace('s2','s₂').replace('s3','s₃').replace('s4','s₄').replace('s5','s₅')); // initial basis

  const point = currentPoint({ A, z, basic });
  return { A, z, basic, status: "continue", point, pivot: null, nextPivot: computeNextPivot({ A, z }) };
}

function stepSimplex(state) {
  const { A, z, basic } = cloneState(state);
  const nVars = A[0].length - 1; // exclude RHS
  
  // Bland's rule: choose entering variable with smallest index having z_j < 0
  let enterCol = -1;
  for (let j = 0; j < nVars; j++) {
    if (z[j] < -1e-12) { enterCol = j; break; }
  }
  if (enterCol === -1) {
    return { A, z, basic, status: "optimal", point: currentPoint({ A, z, basic }), pivot: null, nextPivot: null };
  }

  // Ratio test with Bland's tie-break on leaving
  let minRatio = Infinity;
  let leaveRow = -1;
  for (let i = 0; i < A.length; i++) {
    const a = A[i][enterCol];
    if (a > 1e-12) {
      const ratio = A[i][nVars] / a; // RHS / pivot col
      if (ratio < minRatio - 1e-12 || (Math.abs(ratio - minRatio) <= 1e-12 && (leaveRow === -1 || i < leaveRow))) {
        minRatio = ratio; leaveRow = i;
      }
    }
  }

  if (leaveRow === -1) {
    return { A, z, basic, status: "unbounded", point: currentPoint({ A, z, basic }), pivot: null, nextPivot: null };
  }

  // Pivot
  const nCols = nVars + 1;
  const pivotVal = A[leaveRow][enterCol];
  for (let j = 0; j < nCols; j++) A[leaveRow][j] = A[leaveRow][j] / pivotVal;
  for (let i = 0; i < A.length; i++) {
    if (i === leaveRow) continue;
    const factor = A[i][enterCol];
    for (let j = 0; j < nCols; j++) A[i][j] = A[i][j] - factor * A[leaveRow][j];
  }
  {
    const factor = z[enterCol];
    for (let j = 0; j < nCols; j++) z[j] = z[j] - factor * A[leaveRow][j];
  }

  const slackCount = nVars - 2; // exclude RHS, x1 and x2
  const varNames = ["x₁","x₂", ...Array.from({length:slackCount},(_,i)=>`s${i+1}`.replace('s1','s₁').replace('s2','s₂').replace('s3','s₃').replace('s4','s₄').replace('s5','s₅'))];
  basic[leaveRow] = varNames[enterCol] ?? `v${enterCol+1}`;
  // Determine if optimal after this pivot (no negative reduced costs)
  let newStatus = "continue"; // "optimal";
  for (let j = 0; j < nVars; j++) {
    if (z[j] < -1e-12) { newStatus = "continue"; break; }
    if (j === nVars - 1) newStatus = "optimal";
  }
  return { A, z, basic, status: newStatus,
    point: currentPoint({ A, z, basic }),
    pivot: { row: leaveRow, col: enterCol },
    nextPivot: newStatus === "continue" ? computeNextPivot({ A, z }) : null };
}

function cloneState(state) {
  return { A: state.A.map((r) => r.slice()), z: state.z.slice(), basic: state.basic.slice() };
}

function currentPoint({ A, basic }) {
  const nCols = A[0].length;
  const nVars = nCols - 1; // exclude RHS
  let x = 0, y = 0;
  for (let i = 0; i < basic.length; i++) {
    if (basic[i] === "x₁") x = A[i][nVars];
    if (basic[i] === "x₂") y = A[i][nVars];
  }
  return { x: clampSmall(x), y: clampSmall(y) };
}

function clampSmall(v) { return Math.abs(v) < 1e-10 ? 0 : v; }

function makeConstraintLine(a1, a2, b, xMin, xMax) {
  if (a1 === 0 && a2 === 0) return [];
  if (Math.abs(a2) < 1e-12) {
    const x = a1 > 0 ? b / (a1 || 1) : 0;
    return [{ x, y: -1 }, { x, y: 20 }];
  }
  const f = (x) => (b - a1 * x) / (a2 || 1);
  return [{ x: xMin, y: f(xMin) }, { x: xMax, y: f(xMax) }];
}

function makeObjectiveLine(p, point, xMax, yMax) {
  const { c1, c2 } = p;
  const zVal = c1 * point.x + c2 * point.y;
  if (Math.abs(c1) < 1e-12 && Math.abs(c2) < 1e-12) return null;
  if (Math.abs(c2) < 1e-12) {
    const x = zVal / (c1 || 1);
    return [ {  x, y: -1 }, { x, y: yMax } ];
  }
  const f = (x) => (zVal - c1 * x) / (c2 || 1);
  return [{ x: -1, y: f(-1) }, { x: xMax, y: f(xMax) }];
}

// ---------- Next-pivot preview (Bland) ----------
function chooseEnteringColumn(z) {
  const nCols = z.length;
  const nVars = nCols - 1; // exclude RHS
  // z has length nCols with z[nVars] = RHS. Scan decision/slack columns only (0..nVars)
  for (let j = 0; j < nVars; j++) {
    if (z[j] < -1e-12) return j; // Bland: first negative reduced cost
  }
  return -1;
}
function chooseLeavingRow(A, enterCol) {
  const nCols = A[0].length;
  const nVars = nCols - 1; // exclude RHS
  let minRatio = Infinity;
  let leaveRow = -1;
  for (let i = 0; i < A.length; i++) {
    const a = A[i][enterCol];
    if (a > 1e-12) {
      const ratio = A[i][nVars] / a;
      if (ratio < minRatio - 1e-12 || (Math.abs(ratio - minRatio) <= 1e-12 && (leaveRow === -1 || i < leaveRow))) {
        minRatio = ratio; leaveRow = i;
      }
    }
  }
  return leaveRow;
}
function computeNextPivot({ A, z }) {
  const col = chooseEnteringColumn(z);
  if (col === -1) return null; // optimal
  const row = chooseLeavingRow(A, col);
  if (row === -1) return { row: null, col, unbounded: true };
  return { row, col, unbounded: false };
}

// ---------- Feasible region helper ----------
function computePhaseOne(p) {
  // For this LP family: a11,a12,a21,a22 >= 0 and constraints are <= with x>=0.
  // Phase I is feasible iff all RHS are >= 0 (slack basis is feasible).
  const { b1, b2, u1, u2, useC2 } = p;
  const feasible = (b1 >= 0) && (!useC2 || b2 >= 0) && u1 >= 0 && u2 >= 0;
  return { feasible };
}

// ---------- Feasible region helper ----------
function makeFeasibleAreaData(p, xMin, xMax, yMin, yMax) {
  const { a11, a12, b1, a21, a22, b2, u1, u2, useC2 } = p;
  const N = 120;
  const ep = 1e-12;

  // Effective bounds within axes window
  let left = Math.max(0, xMin);
  let right = Math.min(u1, xMax);

  // a12=0 => x1 <= b1/a11 acts as vertical bound
  if (Math.abs(a12) < ep && a11 > ep) right = Math.min(right, b1 / a11);
  // a22=0 => x1 <= b2/a21 acts as vertical bound
  if (useC2 && Math.abs(a22) < ep && a21 > ep) right = Math.min(right, b2 / a21);

  const data = [];
  if (!(right > left + 1e-9)) return data;

  for (let i = 0; i <= N; i++) {
    const x = left + (right - left) * (i / N);
    let yTop = u2; // x2 <= u2
    if (a12 > ep) yTop = Math.min(yTop, (b1 - a11 * x) / a12);
    if (useC2 && a22 > ep) yTop = Math.min(yTop, (b2 - a21 * x) / a22);
    // clip to window & nonnegativity
    const y = Math.max(0, Math.min(yTop, yMax));
    data.push({ x, y: Math.max(y, yMin) });
  }
  return data;
}

// ---------- format helpers ----------
function round4(v) { return Math.round(v * 1e4) / 1e4; }
function fmtNumber(v) { return Number.isFinite(v) ? String(round4(v)) : "–"; }
function fmtCoeff(c) {
  if (Math.abs(c) < 1e-12){
    return "0";
  }
  if (c == 1){
    return "";
  }
  if (c == -1){
    return "-";
  }
  return String(round4(c));
}
function fmtSignCoeff(c) {
  if (Math.abs(c) < 1e-12){
    return " + 0";
  }
  if (c == 1){
    return " + ";
  }
  if (c == -1){
    return " - ";
  }
  return c >= 0 ? ` + ${round4(c)}` : ` - ${round4(Math.abs(c))}`;
}

function checkFeasible(p) {
  const { a11, a12, b1, a21, a22, b2, u1, u2, useC2 } = p;
  // quick feasibility test: check if origin is feasible and if intersection points give feasible solution
  // 2-phase would solve LP with artificial vars, but here approximate check: b's nonnegative and some region >0
  if (b1 < 0 || (useC2 && b2 < 0) || u1 < 0 || u2 < 0) return false;
  // test corners (0,0), (u1,0), (0,u1), (u1,u2)
  const pts = [
    {x:0,y:0},{x:u1,y:0},{x:0,y:u2},{x:u1,y:u2}
  ];
  for (const pt of pts) {
    if (a11*pt.x + a12*pt.y <= b1 + 1e-9 &&
        (!useC2 || (a21*pt.x + a22*pt.y <= b2 + 1e-9)) &&
        pt.x <= u1 + 1e-9 && pt.y <= u2 + 1e-9 &&
        pt.x >= -1e-9 && pt.y >= -1e-9) return true;
  }
  return false;
}

export default App;
