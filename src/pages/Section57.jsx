import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { parseNum } from '../utils/math';

/* ════════════════════════════════════════════
   TAB 1 — 5.7.1  Quadratic Regression
   ════════════════════════════════════════════ */
function Tab1() {
  const [b0, setB0] = useState(-1.50);
  const [b1, setB1] = useState(2.006);
  const [b2, setB2] = useState(-0.0204);
  const [xVal, setXVal] = useState(50);
  const canvasRef = useRef(null);

  const peak = useMemo(() => b2 === 0 ? null : -b1 / (2 * b2), [b1, b2]);
  const yAtX = b0 + b1 * xVal + b2 * xVal * xVal;
  const yAtPeak = peak !== null ? b0 + b1 * peak + b2 * peak * peak : null;
  const partialEffect = b1 + 2 * b2 * xVal;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    ctx.fillStyle = '#1e1b2e'; ctx.fillRect(0, 0, w, h);

    // compute range
    const xMin = 0, xMax = 80;
    const samples = [];
    for (let x = xMin; x <= xMax; x += 0.5) samples.push({ x, y: b0 + b1 * x + b2 * x * x });
    const yVals = samples.map(s => s.y);
    const yMin = Math.min(...yVals) - 5, yMax = Math.max(...yVals) + 5;
    const x2px = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const y2py = y => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
    ctx.fillStyle = '#b8add9'; ctx.font = '11px sans-serif';
    for (let x = 0; x <= 80; x += 20) ctx.fillText(x, x2px(x) - 6, h - pad.b + 15);

    // curve
    ctx.strokeStyle = '#9ece6a'; ctx.lineWidth = 2; ctx.beginPath();
    samples.forEach((s, i) => { const px = x2px(s.x), py = y2py(s.y); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();

    // peak marker
    if (peak !== null && peak >= xMin && peak <= xMax) {
      const px = x2px(peak), py = y2py(yAtPeak);
      ctx.fillStyle = '#f5d547'; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e6e0ff'; ctx.font = '11px sans-serif';
      ctx.fillText(`${b2 < 0 ? 'Max' : 'Min'} at x=${peak.toFixed(1)}`, px + 10, py - 8);
    }

    // current x marker
    const cpx = x2px(xVal), cpy = y2py(yAtX);
    ctx.fillStyle = '#c4b5fd'; ctx.beginPath(); ctx.arc(cpx, cpy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e6e0ff'; ctx.font = '11px sans-serif';
    ctx.fillText(`ŷ=${yAtX.toFixed(1)}`, cpx + 8, cpy + 4);
  }, [b0, b1, b2, xVal, peak, yAtX, yAtPeak]);

  return (
    <>
      <div className="content-section">
        <h2>Quadratic Regression Model</h2>
        <BlockMath math="y = \beta_0 + \beta_1 x + \beta_2 x^2 + \varepsilon" />
        <ul>
          <li>The slope <strong>changes</strong> as x changes — no longer constant</li>
          <li>Partial effect of x on ŷ ≈ <InlineMath math="b_1 + 2b_2 x" /></li>
          <li>ŷ reaches a max/min at <InlineMath math="x = -b_1 / (2b_2)" /></li>
          <li><InlineMath math="\beta_2 > 0" />: U-shaped &nbsp; <InlineMath math="\beta_2 < 0" />: inverted U-shaped</li>
        </ul>
        <p>Use <strong>Adjusted R²</strong> to compare linear vs quadratic models.</p>
      </div>

      <div className="demo-box">
        <h3>Interactive: Quadratic Curve Explorer</h3>
        <p>Pre-loaded with the Wages example (Wage vs Age). Adjust coefficients and see the curve, peak, and partial effect change.</p>
        <div className="input-row">
          <div className="input-group"><label>b₀</label><input type="number" step="0.01" value={b0} onChange={e => setB0(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b₁ (x)</label><input type="number" step="0.001" value={b1} onChange={e => setB1(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b₂ (x²)</label><input type="number" step="0.0001" value={b2} onChange={e => setB2(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>x value</label><input type="number" value={xVal} onChange={e => setXVal(parseNum(e.target.value, 0))} /></div>
        </div>

        <canvas ref={canvasRef} width={550} height={280} style={{ maxWidth: '100%' }} />

        <div className="result">
          <p><InlineMath math={`\\hat{y} = ${b0} + ${b1}(${xVal}) + ${b2}(${xVal}^2) = `} /><strong>{yAtX.toFixed(2)}</strong></p>
          <p>Partial effect at x = {xVal}: <InlineMath math={`${b1} + 2(${b2})(${xVal}) = ${partialEffect.toFixed(4)}`} /></p>
          {peak !== null && <p>{b2 < 0 ? 'Maximum' : 'Minimum'} at <InlineMath math={`x = \\frac{-${b1}}{2(${b2})} = ${peak.toFixed(2)}`} />, ŷ = {yAtPeak.toFixed(2)}</p>}
          <p style={{ color: b2 < 0 ? 'var(--accent-2)' : 'var(--warning)' }}>{b2 < 0 ? 'Inverted U-shape (opens downward)' : b2 > 0 ? 'U-shape (opens upward)' : 'Linear (b₂ = 0)'}</p>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 2 — 5.7.2  Logarithmic Transformations
   ════════════════════════════════════════════ */
function Tab2() {
  const [model, setModel] = useState('loglog');
  const [b0, setB0] = useState(3.38);
  const [b1, setB1] = useState(0.47);
  const [se, setSe] = useState(0.126);
  const [xVal, setXVal] = useState(1600);

  const pred = useMemo(() => {
    const se2 = se * se / 2;
    if (model === 'linear') return b0 + b1 * xVal;
    if (model === 'loglog') return Math.exp(b0 + b1 * Math.log(xVal) + se2);
    if (model === 'logarithmic') return b0 + b1 * Math.log(xVal);
    if (model === 'exponential') return Math.exp(b0 + b1 * xVal + se2);
    return 0;
  }, [model, b0, b1, se, xVal]);

  const interp = useMemo(() => {
    if (model === 'linear') return `b₁ = change in ŷ when x increases by 1 unit`;
    if (model === 'loglog') return `b₁ = approximate % change in ŷ when x increases by 1%`;
    if (model === 'logarithmic') return `b₁ × 0.01 = approximate change in ŷ when x increases by 1%`;
    if (model === 'exponential') return `b₁ × 100 = approximate % change in ŷ when x increases by 1 unit`;
    return '';
  }, [model]);

  const formula = useMemo(() => {
    if (model === 'linear') return `\\hat{y} = b_0 + b_1 x`;
    if (model === 'loglog') return `\\hat{y} = \\exp\\left(b_0 + b_1 \\ln(x) + \\frac{S_e^2}{2}\\right)`;
    if (model === 'logarithmic') return `\\hat{y} = b_0 + b_1 \\ln(x)`;
    if (model === 'exponential') return `\\hat{y} = \\exp\\left(b_0 + b_1 x + \\frac{S_e^2}{2}\\right)`;
    return '';
  }, [model]);

  return (
    <>
      <div className="content-section">
        <h2>Log Transformations</h2>
        <p>Logs capture nonlinearity, stabilize variance, and allow percentage-based interpretation. Common for incomes, prices, firm sizes, and sales.</p>
        <table className="demo-table">
          <thead><tr><th>Model</th><th>Equation</th><th>Prediction</th><th>b₁ Interpretation</th></tr></thead>
          <tbody>
            <tr><td><strong>Linear</strong></td><td><InlineMath math="y = \beta_0 + \beta_1 x" /></td><td><InlineMath math="b_0 + b_1 x" /></td><td>Change in ŷ per unit x</td></tr>
            <tr><td><strong>Log-Log</strong></td><td><InlineMath math="\ln(y) = \beta_0 + \beta_1 \ln(x)" /></td><td><InlineMath math="e^{b_0 + b_1 \ln(x) + S_e^2/2}" /></td><td>% change in ŷ per 1% change in x</td></tr>
            <tr><td><strong>Logarithmic</strong></td><td><InlineMath math="y = \beta_0 + \beta_1 \ln(x)" /></td><td><InlineMath math="b_0 + b_1 \ln(x)" /></td><td>b₁×0.01 = change in ŷ per 1% x</td></tr>
            <tr><td><strong>Exponential</strong></td><td><InlineMath math="\ln(y) = \beta_0 + \beta_1 x" /></td><td><InlineMath math="e^{b_0 + b_1 x + S_e^2/2}" /></td><td>b₁×100 = % change in ŷ per unit x</td></tr>
          </tbody>
        </table>
        <p><strong>Note:</strong> When ln(y) is the response, use the <InlineMath math="S_e^2/2" /> correction to avoid underestimating ŷ. Always use unrounded coefficients.</p>
      </div>

      <div className="demo-box">
        <h3>Interactive: Log Model Comparison</h3>
        <p>Pick a model type, enter coefficients, and compute the predicted value.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Model type</label>
            <select value={model} onChange={e => setModel(e.target.value)} style={{ maxWidth: '180px' }}>
              <option value="linear">Linear (y ~ x)</option>
              <option value="loglog">Log-Log (ln y ~ ln x)</option>
              <option value="logarithmic">Logarithmic (y ~ ln x)</option>
              <option value="exponential">Exponential (ln y ~ x)</option>
            </select>
          </div>
          <div className="input-group"><label>b₀</label><input type="number" step="0.01" value={b0} onChange={e => setB0(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b₁</label><input type="number" step="0.001" value={b1} onChange={e => setB1(parseNum(e.target.value, 0))} /></div>
        </div>
        <div className="input-row">
          {(model === 'loglog' || model === 'exponential') && (
            <div className="input-group"><label>Sₑ</label><input type="number" step="0.001" value={se} onChange={e => setSe(parseNum(e.target.value, 0))} /></div>
          )}
          <div className="input-group"><label>x value</label><input type="number" value={xVal} onChange={e => setXVal(parseNum(e.target.value, 1))} /></div>
        </div>
        <div className="result">
          <p>Formula: <InlineMath math={formula} /></p>
          <p><strong>Predicted ŷ = {pred.toFixed(2)}</strong></p>
          <p style={{ color: 'var(--accent-2)' }}>Slope interpretation: {interp}</p>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════ */
const tabs = [
  { id: '5.7.1', label: '5.7.1 Quadratic', component: Tab1 },
  { id: '5.7.2', label: '5.7.2 Log Transforms', component: Tab2 },
];

export default function Section57() {
  const [active, setActive] = useState('5.7.1');
  const ActiveTab = tabs.find(t => t.id === active)?.component || Tab1;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.7: Nonlinear Relationships</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Model U-shaped and inverted-U relationships with <strong>quadratic regression</strong></li>
          <li>Use <strong>log transformations</strong> (log-log, logarithmic, exponential) for percentage-based interpretation</li>
          <li>Compute predictions from each model type with the correct formula</li>
        </ul>
        <p><strong>Prerequisites:</strong> <Link to="/5.1">5.1</Link> — OLS basics, <Link to="/5.2">5.2</Link> — Adjusted R² for model comparison.</p>
      </div>

      <nav className="tab-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="tab-buttons">
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${active === t.id ? 'active' : ''}`} onClick={() => setActive(t.id)}>{t.label}</button>
          ))}
        </div>
      </nav>

      <ActiveTab />
    </main>
  );
}
