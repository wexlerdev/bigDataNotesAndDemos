import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { linReg, parseNum } from '../utils/math';

/* ───── shared seed RNG ───── */
function seedRng(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}
function generateData(noise, seed) {
  const rng = seedRng(seed);
  const trueB0 = 2, trueB1 = 1.5, xs = [], ys = [];
  for (let i = 0; i < 40; i++) {
    const x = 1 + rng() * 8;
    ys.push(trueB0 + trueB1 * x + (rng() - 0.5) * 2 * noise);
    xs.push(x);
  }
  return { xs, ys };
}

/* ════════════════════════════════════════════
   TAB 1 — 5.1.1  Introduction to Regression
   ════════════════════════════════════════════ */
function Tab1() {
  const [noise, setNoise] = useState(2);
  const [seed, setSeed] = useState(42);
  const canvasRef = useRef(null);
  const btnRef = useRef(null);
  const data = generateData(noise, seed);
  const reg = linReg(data.xs, data.ys);
  const regenerate = useCallback(() => {
    setSeed(s => s + 7);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    ctx.fillStyle = '#1e1b2e'; ctx.fillRect(0, 0, w, h);
    const xMin = 0, xMax = 10, yMin = -2, yMax = 20;
    const x2px = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const y2py = y => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
    ctx.fillStyle = '#b8add9'; ctx.font = '11px sans-serif';
    for (let x = 0; x <= 10; x += 2) ctx.fillText(x, x2px(x) - 4, h - pad.b + 15);
    for (let y = 0; y <= 18; y += 4) ctx.fillText(y, pad.l - 25, y2py(y) + 4);
    ctx.fillStyle = 'rgba(196,181,253,0.7)';
    data.xs.forEach((x, i) => { ctx.beginPath(); ctx.arc(x2px(x), y2py(data.ys[i]), 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = '#f5d547'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x2px(xMin), y2py(reg.b0 + reg.b1 * xMin));
    ctx.lineTo(x2px(xMax), y2py(reg.b0 + reg.b1 * xMax)); ctx.stroke();
    ctx.fillStyle = '#e6e0ff'; ctx.font = '12px sans-serif';
    ctx.fillText(`ŷ = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`, pad.l + 10, pad.t + 15);
  }, [data, reg]);

  return (
    <>
      <div className="content-section">
        <h2>What Regression Does</h2>
        <p>Regression analysis estimates a <strong>mathematical equation</strong> that describes the relationship between variables. Two main goals:</p>
        <ul>
          <li><strong>Explanation:</strong> understand which factors influence the outcome and how</li>
          <li><strong>Prediction:</strong> forecast the outcome for new observations</li>
        </ul>
        <p>The general form: <InlineMath math="y = f(x_1, x_2, \ldots) + \varepsilon" /> — the response depends on predictors plus random error.</p>
      </div>

      <div className="content-section">
        <h2>Simple vs Multiple Regression</h2>
        <p><strong>Simple regression:</strong> one predictor variable</p>
        <BlockMath math="y = \beta_0 + \beta_1 x + \varepsilon" />
        <p><strong>Multiple regression:</strong> two or more predictor variables</p>
        <BlockMath math="y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \cdots + \beta_k x_k + \varepsilon" />
      </div>

      <div className="content-section">
        <h2>Deterministic vs Stochastic</h2>
        <p>A <strong>deterministic</strong> model has no error term — given <InlineMath math="x" />, <InlineMath math="y" /> is exactly determined. A <strong>stochastic</strong> model includes random error <InlineMath math="\varepsilon" /> — real-world data is stochastic.</p>
      </div>

      <div className="content-section">
        <h2>Variable Types</h2>
        <table className="demo-table">
          <thead><tr><th>Term</th><th>Also Called</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td><strong>Response</strong></td><td>dependent, <InlineMath math="y" /></td><td>The outcome we want to explain/predict</td></tr>
            <tr><td><strong>Predictor</strong></td><td>independent, <InlineMath math="x" /></td><td>Variable(s) used to explain the response</td></tr>
            <tr><td><strong>Numerical</strong></td><td>quantitative</td><td>Numeric values (age, income)</td></tr>
            <tr><td><strong>Categorical</strong></td><td>qualitative</td><td>Category labels (city/suburb, yes/no)</td></tr>
          </tbody>
        </table>
      </div>

      <div className="demo-box">
        <h3>Interactive: Deterministic vs Stochastic Scatter</h3>
        <p>Slide noise to zero for a perfect line. Increase it to see stochastic scatter.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Noise (<InlineMath math="\varepsilon" />): {noise.toFixed(1)}</label>
            <input type="range" min="0" max="6" step="0.2" value={noise} onChange={e => setNoise(parseFloat(e.target.value))} />
          </div>
          <div className="input-group">
            <button ref={btnRef} onClick={regenerate} style={{ padding: '0.4rem 1rem', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>Regenerate</button>
          </div>
        </div>
        <div className="result">
          Fitted: <InlineMath math={`\\hat{y} = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`} /> &nbsp;|&nbsp;
          <InlineMath math={`R^2 = ${reg.r2.toFixed(3)}`} />
          {noise === 0 && <> — <strong style={{ color: 'var(--success)' }}>Perfect deterministic fit!</strong></>}
        </div>
        <canvas ref={canvasRef} width={550} height={300} style={{ maxWidth: '100%' }} />
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 2 — 5.1.2  OLS & The Regression Equation
   ════════════════════════════════════════════ */
const defaultOLSData = [
  { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 4 },
  { x: 4, y: 7 }, { x: 5, y: 8 }, { x: 6, y: 9 },
];

function Tab2() {
  const [rows, setRows] = useState(defaultOLSData);
  const [view, setView] = useState('ols');
  const canvasRef = useRef(null);

  const updateRow = (i, field, val) => setRows(prev => prev.map((r, j) => j === i ? { ...r, [field]: parseNum(val, r[field]) } : r));
  const addRow = () => setRows(prev => [...prev, { x: prev.length + 1, y: 0 }]);
  const removeRow = i => { if (rows.length > 2) setRows(prev => prev.filter((_, j) => j !== i)); };

  const xs = rows.map(r => r.x), ys = rows.map(r => r.y);
  const reg = useMemo(() => linReg(xs, ys), [JSON.stringify(rows)]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    ctx.fillStyle = '#1e1b2e'; ctx.fillRect(0, 0, w, h);
    const xMin = Math.min(...xs) - 1, xMax = Math.max(...xs) + 1;
    const yMin = Math.min(...ys, ...reg.yhat) - 1, yMax = Math.max(...ys, ...reg.yhat) + 1;
    const x2px = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const y2py = y => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
    ctx.strokeStyle = '#f5d547'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x2px(xMin), y2py(reg.b0 + reg.b1 * xMin));
    ctx.lineTo(x2px(xMax), y2py(reg.b0 + reg.b1 * xMax)); ctx.stroke();
    if (view === 'residuals') {
      ctx.strokeStyle = 'rgba(247, 118, 142, 0.7)'; ctx.lineWidth = 1.5;
      xs.forEach((x, i) => { ctx.beginPath(); ctx.moveTo(x2px(x), y2py(ys[i])); ctx.lineTo(x2px(x), y2py(reg.yhat[i])); ctx.stroke(); });
    }
    ctx.fillStyle = 'rgba(196,181,253,0.8)';
    xs.forEach((x, i) => { ctx.beginPath(); ctx.arc(x2px(x), y2py(ys[i]), 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#e6e0ff'; ctx.font = '12px sans-serif';
    ctx.fillText(`ŷ = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`, pad.l + 10, pad.t + 15);
  }, [rows, view, reg]);

  return (
    <>
      <div className="content-section">
        <h2>Population vs Sample</h2>
        <p>Population: <InlineMath math="E(y) = \beta_0 + \beta_1 x" /> (unknown). Sample estimate: <InlineMath math="\hat{y} = b_0 + b_1 x" /></p>
      </div>
      <div className="content-section">
        <h2>How OLS Works</h2>
        <p>OLS minimizes the <strong>sum of squared errors</strong>:</p>
        <BlockMath math="SSE = \sum(y_i - \hat{y}_i)^2" />
        <BlockMath math="b_1 = \frac{s_{xy}}{s_x^2} = \frac{\sum(x_i - \bar{x})(y_i - \bar{y})}{\sum(x_i - \bar{x})^2} \qquad b_0 = \bar{y} - b_1 \bar{x}" />
      </div>
      <div className="content-section">
        <h2>Equation Components</h2>
        <table className="demo-table">
          <thead><tr><th>Symbol</th><th>Name</th><th>Definition</th></tr></thead>
          <tbody>
            <tr><td><InlineMath math="\beta_0, \beta_1" /></td><td>Population parameters</td><td>True (unknown) intercept & slope</td></tr>
            <tr><td><InlineMath math="b_0, b_1" /></td><td>Sample estimates</td><td>Computed from data via OLS</td></tr>
            <tr><td><InlineMath math="\varepsilon" /></td><td>Population error</td><td>True random disturbance</td></tr>
            <tr><td><InlineMath math="e = y - \hat{y}" /></td><td>Residual</td><td>Observed minus predicted (sample error)</td></tr>
            <tr><td><InlineMath math="\hat{y}" /></td><td>Predicted value</td><td><InlineMath math="b_0 + b_1 x" /></td></tr>
          </tbody>
        </table>
      </div>

      <div className="demo-box">
        <h3>Interactive: OLS Calculator</h3>
        <p>Edit data points below — equation and plot update live.</p>
        <table className="demo-table" style={{ marginBottom: '1rem' }}>
          <thead><tr><th>#</th><th>x</th><th>y</th><th></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><input type="number" value={r.x} step="0.1" style={{ width: '70px' }} onChange={e => updateRow(i, 'x', e.target.value)} /></td>
                <td><input type="number" value={r.y} step="0.1" style={{ width: '70px' }} onChange={e => updateRow(i, 'y', e.target.value)} /></td>
                <td>{rows.length > 2 && <button onClick={() => removeRow(i)} style={{ cursor: 'pointer', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem' }}>×</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} style={{ cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius)', padding: '0.3rem 0.8rem', fontWeight: 600, marginBottom: '1rem' }}>+ Add Row</button>
        <div className="result">
          <InlineMath math={`\\bar{x} = ${reg.xbar.toFixed(2)}`} />, <InlineMath math={`\\bar{y} = ${reg.ybar.toFixed(2)}`} /><br />
          <InlineMath math={`s_{xy} = ${reg.sxy.toFixed(2)}`} />, <InlineMath math={`s_x^2 = ${reg.sx2.toFixed(2)}`} /><br />
          <InlineMath math={`b_1 = ${reg.b1.toFixed(4)}`} />, <InlineMath math={`b_0 = ${reg.b0.toFixed(4)}`} /><br />
          <strong>Equation: <InlineMath math={`\\hat{y} = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`} /></strong>
        </div>
      </div>

      <div className="demo-box">
        <h3>Interactive: Residual Viewer</h3>
        <div className="input-row">
          <div className="input-group">
            <label>View mode</label>
            <select value={view} onChange={e => setView(e.target.value)}>
              <option value="ols">Scatter + Line</option>
              <option value="residuals">Show Residuals</option>
            </select>
          </div>
        </div>
        <canvas ref={canvasRef} width={550} height={300} style={{ maxWidth: '100%' }} />
        {view === 'residuals' && (
          <div className="result">
            <table className="demo-table">
              <thead><tr><th>i</th><th><InlineMath math="x_i" /></th><th><InlineMath math="y_i" /></th><th><InlineMath math="\hat{y}_i" /></th><th><InlineMath math="e_i" /></th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td><td>{r.x.toFixed(1)}</td><td>{r.y.toFixed(1)}</td>
                    <td>{reg.yhat[i].toFixed(2)}</td>
                    <td style={{ color: reg.residuals[i] >= 0 ? 'var(--success)' : 'var(--error)' }}>{reg.residuals[i].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p><strong>SSE = <InlineMath math={`\\sum e_i^2 = ${reg.sse.toFixed(2)}`} /></strong></p>
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 3 — 5.1.3  Interpreting Coefficients
   ════════════════════════════════════════════ */
function Tab3() {
  const [mode, setMode] = useState('simple');
  const [yName, setYName] = useState('salary');
  const [x1Name, setX1Name] = useState('experience');
  const [x2Name, setX2Name] = useState('education');
  const [b0, setB0] = useState(30000);
  const [b1, setB1] = useState(2500);
  const [b2, setB2] = useState(5000);

  const interpretation = useMemo(() => {
    const lines = [];
    lines.push(`Intercept (b₀ = ${b0}): When ${mode === 'simple' ? x1Name : 'all predictors'} equal 0, the predicted ${yName} is ${b0}.`);
    if (mode === 'simple') {
      lines.push(`Slope (b₁ = ${b1}): For each one-unit increase in ${x1Name}, ${yName} is predicted to ${b1 >= 0 ? 'increase' : 'decrease'} by ${Math.abs(b1)}.`);
    } else {
      lines.push(`Slope (b₁ = ${b1}): Holding ${x2Name} constant, for each one-unit increase in ${x1Name}, ${yName} is predicted to ${b1 >= 0 ? 'increase' : 'decrease'} by ${Math.abs(b1)}.`);
      lines.push(`Slope (b₂ = ${b2}): Holding ${x1Name} constant, for each one-unit increase in ${x2Name}, ${yName} is predicted to ${b2 >= 0 ? 'increase' : 'decrease'} by ${Math.abs(b2)}.`);
    }
    return lines;
  }, [mode, yName, x1Name, x2Name, b0, b1, b2]);

  const [cat1, setCat1] = useState('City');
  const [cat2, setCat2] = useState('Non-city');
  const [refGroup, setRefGroup] = useState('cat2');
  const [dummyCoeff, setDummyCoeff] = useState(12000);

  const dummy = useMemo(() => {
    const ref = refGroup === 'cat1' ? cat1 : cat2;
    const other = refGroup === 'cat1' ? cat2 : cat1;
    return {
      ref, other,
      table: [{ category: ref, value: 0, label: 'Reference group' }, { category: other, value: 1, label: 'Encoded as 1' }],
      sentence: `The coefficient ${dummyCoeff} means that, on average, ${other} observations have a predicted response that is ${dummyCoeff >= 0 ? 'higher' : 'lower'} by ${Math.abs(dummyCoeff)} compared to ${ref} (the reference group), holding other variables constant.`,
    };
  }, [cat1, cat2, refGroup, dummyCoeff]);

  return (
    <>
      <div className="content-section">
        <h2>Simple vs Multiple Interpretation</h2>
        <p><strong>Simple:</strong> <InlineMath math="b_1" /> is the change in <InlineMath math="\hat{y}" /> for a one-unit increase in <InlineMath math="x" />.</p>
        <p><strong>Multiple:</strong> <InlineMath math="b_j" /> is the change in <InlineMath math="\hat{y}" /> for a one-unit increase in <InlineMath math="x_j" />, <em>holding all other predictors constant</em> (partial influence).</p>
      </div>
      <div className="content-section">
        <h2>Handling Categorical Variables</h2>
        <p>Encoded as <strong>dummy variables</strong> (0 or 1). For <InlineMath math="c" /> categories, use <InlineMath math="c - 1" /> dummies. The omitted category is the <strong>reference group</strong>.</p>
      </div>
      <div className="content-section">
        <h2>What Residuals Tell You</h2>
        <ul>
          <li><strong>Random scatter</strong> around zero → model is adequate</li>
          <li><strong>Pattern (curve, fan)</strong> → missing term or assumption violation</li>
          <li><strong>Outliers</strong> → investigate unusually large residuals</li>
        </ul>
      </div>

      <div className="demo-box">
        <h3>Interactive: Coefficient Interpreter</h3>
        <p>Enter variable names and coefficients to generate plain-English interpretation.</p>
        <div className="input-row">
          <div className="input-group"><label>Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="simple">Simple regression</option>
              <option value="multiple">Multiple regression</option>
            </select>
          </div>
          <div className="input-group"><label>Response (y)</label><input type="text" value={yName} onChange={e => setYName(e.target.value)} /></div>
        </div>
        <div className="input-row">
          <div className="input-group"><label>Predictor 1</label><input type="text" value={x1Name} onChange={e => setX1Name(e.target.value)} /></div>
          {mode === 'multiple' && <div className="input-group"><label>Predictor 2</label><input type="text" value={x2Name} onChange={e => setX2Name(e.target.value)} /></div>}
        </div>
        <div className="input-row">
          <div className="input-group"><label><InlineMath math="b_0" /></label><input type="number" value={b0} onChange={e => setB0(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label><InlineMath math="b_1" /></label><input type="number" value={b1} onChange={e => setB1(parseNum(e.target.value, 0))} /></div>
          {mode === 'multiple' && <div className="input-group"><label><InlineMath math="b_2" /></label><input type="number" value={b2} onChange={e => setB2(parseNum(e.target.value, 0))} /></div>}
        </div>
        <div className="result">{interpretation.map((line, i) => <p key={i}>{line}</p>)}</div>
      </div>

      <div className="demo-box">
        <h3>Interactive: Dummy Variable Encoder</h3>
        <div className="input-row">
          <div className="input-group"><label>Category 1</label><input type="text" value={cat1} onChange={e => setCat1(e.target.value)} /></div>
          <div className="input-group"><label>Category 2</label><input type="text" value={cat2} onChange={e => setCat2(e.target.value)} /></div>
          <div className="input-group"><label>Reference</label>
            <select value={refGroup} onChange={e => setRefGroup(e.target.value)}>
              <option value="cat2">{cat2}</option>
              <option value="cat1">{cat1}</option>
            </select>
          </div>
          <div className="input-group"><label>Coefficient</label><input type="number" value={dummyCoeff} onChange={e => setDummyCoeff(parseNum(e.target.value, 0))} /></div>
        </div>
        <table className="demo-table" style={{ marginBottom: '1rem' }}>
          <thead><tr><th>Category</th><th><InlineMath math={`D_{\\text{${dummy.other}}}`} /></th><th>Role</th></tr></thead>
          <tbody>{dummy.table.map((row, i) => <tr key={i}><td>{row.category}</td><td>{row.value}</td><td>{row.label}</td></tr>)}</tbody>
        </table>
        <div className="result"><p><strong>Interpretation:</strong> {dummy.sentence}</p></div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT — Tabbed container
   ════════════════════════════════════════════ */
const tabs = [
  { id: '5.1.1', label: '5.1.1 Introduction', component: Tab1 },
  { id: '5.1.2', label: '5.1.2 OLS', component: Tab2 },
  { id: '5.1.3', label: '5.1.3 Interpretation', component: Tab3 },
];

export default function Section51() {
  const [active, setActive] = useState('5.1.1');
  const ActiveTab = tabs.find(t => t.id === active)?.component || Tab1;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.1: The Linear Regression Model</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>What regression analysis does and when to use it</li>
          <li>How OLS estimates the best-fit line by minimizing squared errors</li>
          <li>How to interpret coefficients, dummy variables, and residuals</li>
        </ul>
      </div>

      <nav className="tab-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="tab-buttons">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${active === t.id ? 'active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <ActiveTab />
    </main>
  );
}
