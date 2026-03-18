import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { parseNum } from '../utils/math';

/* ════════════════════════════════════════════
   TAB 1 — 5.2.1  Variance Decomposition
   ════════════════════════════════════════════ */
function Tab1() {
  const [ssr, setSsr] = useState(120);
  const [sse, setSse] = useState(30);
  const canvasRef = useRef(null);

  const decomp = useMemo(() => {
    const sst = ssr + sse;
    const r2 = sst === 0 ? 0 : ssr / sst;
    return { sst, r2 };
  }, [ssr, sse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#1e1b2e'; ctx.fillRect(0, 0, w, h);
    const barW = w - 80, barH = 40, barX = 40, barY = 20;
    const sst = ssr + sse;
    if (sst === 0) return;
    const ssrW = (ssr / sst) * barW;
    ctx.fillStyle = 'rgba(158, 206, 106, 0.7)'; ctx.fillRect(barX, barY, ssrW, barH);
    ctx.fillStyle = 'rgba(247, 118, 142, 0.5)'; ctx.fillRect(barX + ssrW, barY, barW - ssrW, barH);
    ctx.fillStyle = '#e6e0ff'; ctx.font = '13px sans-serif';
    if (ssrW > 50) ctx.fillText(`SSR (${(ssr / sst * 100).toFixed(0)}%)`, barX + 8, barY + 27);
    if (barW - ssrW > 50) ctx.fillText(`SSE (${(sse / sst * 100).toFixed(0)}%)`, barX + ssrW + 8, barY + 27);
    ctx.fillStyle = '#b8add9'; ctx.font = '11px sans-serif';
    ctx.fillText(`SST = ${sst.toFixed(1)}`, barX, barY + barH + 20);
  }, [ssr, sse]);

  return (
    <>
      <div className="content-section">
        <h2>The Framework</h2>
        <BlockMath math="SST = SSR + SSE" />
        <ul>
          <li><strong>SST</strong> — Total Sum of Squares: <InlineMath math="\sum(y_i - \bar{y})^2" /> — total variation in y</li>
          <li><strong>SSR</strong> — Regression Sum of Squares: <InlineMath math="\sum(\hat{y}_i - \bar{y})^2" /> — variation explained by the model</li>
          <li><strong>SSE</strong> — Error Sum of Squares: <InlineMath math="\sum(y_i - \hat{y}_i)^2" /> — variation unexplained (residuals)</li>
        </ul>
        <p>Every goodness-of-fit measure is a different lens on this decomposition.</p>
      </div>

      <div className="demo-box">
        <h3>Interactive: Variance Decomposition Bar</h3>
        <p>Enter SSR (signal) and SSE (noise). See the proportion and <InlineMath math="R^2" />.</p>
        <div className="input-row">
          <div className="input-group"><label>SSR (explained)</label><input type="number" min="0" value={ssr} onChange={e => setSsr(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>SSE (unexplained)</label><input type="number" min="0" value={sse} onChange={e => setSse(parseNum(e.target.value, 0))} /></div>
        </div>
        <canvas ref={canvasRef} width={450} height={80} style={{ maxWidth: '100%' }} />
        <div className="result">
          SST = {decomp.sst.toFixed(1)} &nbsp;|&nbsp;
          <InlineMath math={`R^2 = ${decomp.r2.toFixed(4)}`} /> &nbsp;|&nbsp;
          {(decomp.r2 * 100).toFixed(1)}% of variation explained
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 2 — 5.2.2  R² and Adjusted R²
   ════════════════════════════════════════════ */
function Tab2() {
  const [rN, setRN] = useState(30);
  const [rK, setRK] = useState(1);
  const [rR2, setRR2] = useState(0.75);

  const adjR2 = useMemo(() => {
    const n = Math.max(rK + 2, rN);
    return 1 - ((1 - rR2) * (n - 1)) / (n - rK - 1);
  }, [rN, rK, rR2]);

  return (
    <>
      <div className="content-section">
        <h2>Coefficient of Determination</h2>
        <BlockMath math="R^2 = \frac{SSR}{SST} = 1 - \frac{SSE}{SST}" />
        <p><InlineMath math="R^2" /> is the proportion of variation explained. But it <strong>never decreases</strong> when you add a predictor — even a useless one.</p>
      </div>

      <div className="content-section">
        <h2>Adjusted R²</h2>
        <BlockMath math="\bar{R}^2 = 1 - \frac{(1 - R^2)(n-1)}{n - k - 1}" />
        <p>Penalizes for number of predictors <InlineMath math="k" />. It <strong>can decrease</strong> when a useless predictor is added. Use it to compare models with different numbers of predictors.</p>
        <table className="demo-table">
          <thead><tr><th>Scenario</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>Both R² and Adj R² increase</td><td style={{ color: 'var(--success)' }}>Variable is contributing — keep it</td></tr>
            <tr><td>R² increases but Adj R² decreases</td><td style={{ color: 'var(--error)' }}>Variable not pulling its weight — drop it</td></tr>
          </tbody>
        </table>
      </div>

      <div className="demo-box">
        <h3>Interactive: R² vs Adjusted R²</h3>
        <p>Increase <InlineMath math="k" /> with <InlineMath math="R^2" /> held constant to watch Adjusted <InlineMath math="R^2" /> drop.</p>
        <div className="input-row">
          <div className="input-group"><label><InlineMath math="n" /> (sample size)</label><input type="number" min="5" value={rN} onChange={e => setRN(parseNum(e.target.value, 5))} /></div>
          <div className="input-group"><label><InlineMath math="R^2" /></label><input type="number" min="0" max="1" step="0.01" value={rR2} onChange={e => setRR2(parseNum(e.target.value, 0))} /></div>
        </div>
        <div className="input-row">
          <div className="input-group" style={{ flex: 1 }}>
            <label><InlineMath math="k" /> (predictors): {rK}</label>
            <input type="range" min="1" max={Math.max(1, rN - 2)} value={rK} onChange={e => setRK(parseInt(e.target.value))} />
          </div>
        </div>
        <div className="result">
          <InlineMath math={`R^2 = ${rR2.toFixed(4)}`} /><br />
          <InlineMath math={`\\bar{R}^2 = ${adjR2.toFixed(4)}`} />
          {adjR2 < rR2 && <span style={{ color: 'var(--warning)', marginLeft: '0.5rem' }}>(penalized by {(rR2 - adjR2).toFixed(4)})</span>}
          {adjR2 < 0 && <span style={{ color: 'var(--error)', marginLeft: '0.5rem' }}> — negative! Too many predictors.</span>}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 3 — 5.2.3  Standard Error of the Estimate
   ════════════════════════════════════════════ */
function Tab3() {
  const [seSSE, setSeSSE] = useState(48);
  const [seN, setSeN] = useState(20);
  const [seK, setSeK] = useState(2);

  const seCalc = useMemo(() => {
    const denom = seN - seK - 1;
    if (denom <= 0) return { se: null, denom };
    return { se: Math.sqrt(seSSE / denom), denom };
  }, [seSSE, seN, seK]);

  return (
    <>
      <div className="content-section">
        <h2>Standard Error of the Estimate</h2>
        <BlockMath math="S_e = \sqrt{\frac{SSE}{n - k - 1}}" />
        <p><InlineMath math="S_e" /> measures how far predictions are from actual values, on average, in the <strong>same units as y</strong>. Lower is better.</p>
        <table className="demo-table">
          <thead><tr><th>Property</th><th>Detail</th></tr></thead>
          <tbody>
            <tr><td>Range</td><td>0 to ∞</td></tr>
            <tr><td>Units</td><td>Same as response variable y</td></tr>
            <tr><td>Better fit</td><td>Lower Sₑ</td></tr>
          </tbody>
        </table>
      </div>

      <div className="demo-box">
        <h3>Interactive: Sₑ Calculator</h3>
        <p>Enter SSE, n, and k to compute the standard error of the estimate.</p>
        <div className="input-row">
          <div className="input-group"><label>SSE</label><input type="number" min="0" value={seSSE} onChange={e => setSeSSE(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label><InlineMath math="n" /></label><input type="number" min="3" value={seN} onChange={e => setSeN(parseNum(e.target.value, 3))} /></div>
          <div className="input-group"><label><InlineMath math="k" /> (predictors)</label><input type="number" min="1" value={seK} onChange={e => setSeK(parseNum(e.target.value, 1))} /></div>
        </div>
        <div className="result">
          {seCalc.se !== null ? (
            <>
              <InlineMath math={`S_e = \\sqrt{\\frac{${seSSE}}{${seCalc.denom}}} = ${seCalc.se.toFixed(4)}`} />
              <p>Predictions are typically off by <strong>±{seCalc.se.toFixed(2)}</strong> (in the same units as y).</p>
            </>
          ) : (
            <p style={{ color: 'var(--error)' }}>Need n &gt; k + 1. Currently n − k − 1 = {seCalc.denom} ≤ 0.</p>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT — Tabbed container
   ════════════════════════════════════════════ */
const tabs = [
  { id: '5.2.1', label: '5.2.1 Variance Decomposition', component: Tab1 },
  { id: '5.2.2', label: '5.2.2 R² & Adj R²', component: Tab2 },
  { id: '5.2.3', label: '5.2.3 Std Error', component: Tab3 },
];

export default function Section52() {
  const [active, setActive] = useState('5.2.1');
  const ActiveTab = tabs.find(t => t.id === active)?.component || Tab1;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.2: Goodness-of-Fit Measures</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Decompose total variance: SST = SSR + SSE</li>
          <li>Why R² can mislead and when Adjusted R² is the right tool</li>
          <li>Interpret the standard error of the estimate Sₑ</li>
        </ul>
        <p><strong>Prerequisites:</strong> <Link to="/5.1">5.1</Link> — OLS and residuals.</p>
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
