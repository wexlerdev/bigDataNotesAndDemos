import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';

/* ───── seed RNG ───── */
function seedRng(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/* ════════════════════════════════════════════
   TAB 1 — 5.4.1  Linearity & Multicollinearity
   ════════════════════════════════════════════ */
function Tab1() {
  const [pattern, setPattern] = useState('good');
  const [seed, setSeed] = useState(42);
  const canvasRef = useRef(null);

  const regen = useCallback(() => setSeed(s => s + 7), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    ctx.fillStyle = '#1e1b2e'; ctx.fillRect(0, 0, w, h);

    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
    ctx.fillStyle = '#b8add9'; ctx.font = '11px sans-serif';
    ctx.fillText('x or ŷ', w - pad.r - 25, h - pad.b + 15);
    ctx.fillText('e', pad.l - 10, pad.t + 12);

    const rng = seedRng(seed);
    const pts = [];
    for (let i = 0; i < 60; i++) {
      const x = rng();
      let e;
      if (pattern === 'good') e = (rng() - 0.5) * 0.6;
      else if (pattern === 'nonlinear') e = (x - 0.5) * (x - 0.5) * 3 - 0.2 + (rng() - 0.5) * 0.2;
      else if (pattern === 'fan') e = (rng() - 0.5) * x * 1.8;
      else if (pattern === 'serial') { const t = i / 60; e = Math.sin(t * Math.PI * 3) * 0.5 + (rng() - 0.5) * 0.15; }
      else e = (rng() - 0.5) * 0.6;
      pts.push({ x, e });
    }

    const x2px = v => pad.l + v * plotW;
    const e2py = v => pad.t + plotH / 2 - v * (plotH / 2);

    // zero line
    ctx.strokeStyle = 'rgba(245,213,71,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, e2py(0)); ctx.lineTo(w - pad.r, e2py(0)); ctx.stroke();
    ctx.setLineDash([]);

    // points
    ctx.fillStyle = 'rgba(196,181,253,0.7)';
    pts.forEach(p => { ctx.beginPath(); ctx.arc(x2px(p.x), e2py(p.e), 4, 0, Math.PI * 2); ctx.fill(); });

    // label
    ctx.fillStyle = '#e6e0ff'; ctx.font = '12px sans-serif';
    const labels = { good: 'No violation — random scatter', nonlinear: 'Nonlinear pattern (Assumption 1)', fan: 'Heteroskedasticity — fan shape (Assumption 3)', serial: 'Serial correlation — waves (Assumption 4)' };
    ctx.fillText(labels[pattern] || '', pad.l + 10, pad.t + 15);
  }, [pattern, seed]);

  return (
    <>
      <div className="content-section">
        <h2>Assumption 1: Linearity & Correct Specification</h2>
        <p>The model <InlineMath math="y = \beta_0 + \beta_1 x_1 + \cdots + \beta_k x_k + \varepsilon" /> must be linear in the <strong>parameters</strong> (not necessarily the variables) and correctly specified.</p>
        <ul>
          <li><strong>Detection:</strong> Residual plots — a curve or trend indicates a nonlinear pattern</li>
          <li><strong>Remedy:</strong> Add polynomial terms (x²), use log transforms, or include omitted variables</li>
        </ul>
      </div>
      <div className="content-section">
        <h2>Assumption 2: No Perfect Multicollinearity</h2>
        <p>No exact linear relationship among the predictor variables.</p>
        <ul>
          <li><strong>Symptoms:</strong> High R² + significant F-test, but individually insignificant predictors; wrong coefficient signs; high correlations between predictors</li>
          <li><strong>Remedy:</strong> Drop one of the correlated variables, obtain more data, or express variables differently</li>
        </ul>
      </div>

      <div className="demo-box">
        <h3>Interactive: Residual Pattern Viewer</h3>
        <p>Select a pattern to see what residual plots look like under different assumption violations.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Pattern</label>
            <select value={pattern} onChange={e => setPattern(e.target.value)} style={{ maxWidth: '220px' }}>
              <option value="good">No violation (random scatter)</option>
              <option value="nonlinear">Nonlinear (Assumption 1)</option>
              <option value="fan">Heteroskedasticity (Assumption 3)</option>
              <option value="serial">Serial correlation (Assumption 4)</option>
            </select>
          </div>
          <div className="input-group">
            <button onClick={regen} style={{ padding: '0.4rem 1rem', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>Regenerate</button>
          </div>
        </div>
        <canvas ref={canvasRef} width={550} height={280} style={{ maxWidth: '100%' }} />
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 2 — 5.4.2  Heteroskedasticity & Serial Correlation
   ════════════════════════════════════════════ */
function Tab2() {
  return (
    <>
      <div className="content-section">
        <h2>Assumption 3: No Heteroskedasticity (Constant Variance)</h2>
        <p>The variance of <InlineMath math="\varepsilon" /> must be the same for all observations, conditional on the predictors.</p>
        <table className="demo-table">
          <thead><tr><th>Aspect</th><th>Detail</th></tr></thead>
          <tbody>
            <tr><td><strong>What breaks</strong></td><td>Variability in residuals changes with predictor level (fan/funnel shape)</td></tr>
            <tr><td><strong>Common context</strong></td><td>Cross-sectional data (comparing firms, individuals, cities)</td></tr>
            <tr><td><strong>Consequence</strong></td><td>OLS still unbiased, but standard errors are wrong → t and F tests unreliable</td></tr>
            <tr><td><strong>Detection</strong></td><td>Plot residuals vs ŷ or vs each predictor — look for fanning</td></tr>
            <tr><td><strong>Remedy</strong></td><td>White's robust standard errors (R: <code>vcovHC</code>, Python: <code>HC1</code>)</td></tr>
          </tbody>
        </table>
      </div>
      <div className="content-section">
        <h2>Assumption 4: No Serial Correlation (Uncorrelated Errors)</h2>
        <p>Error terms must be uncorrelated across observations.</p>
        <table className="demo-table">
          <thead><tr><th>Aspect</th><th>Detail</th></tr></thead>
          <tbody>
            <tr><td><strong>What breaks</strong></td><td>Residuals cluster in runs — positive follows positive, negative follows negative</td></tr>
            <tr><td><strong>Common context</strong></td><td>Time series data (monthly sales, quarterly GDP)</td></tr>
            <tr><td><strong>Consequence</strong></td><td>OLS still unbiased, but SEs distorted <em>downward</em> → false significance</td></tr>
            <tr><td><strong>Detection</strong></td><td>Plot residuals in time order — look for waves or clustering</td></tr>
            <tr><td><strong>Remedy</strong></td><td>Newey-West HAC standard errors</td></tr>
          </tbody>
        </table>
        <table className="demo-table" style={{ maxWidth: '500px' }}>
          <thead><tr><th>Language</th><th>Implementation</th></tr></thead>
          <tbody>
            <tr><td>R</td><td><code>NeweyWest(model, lag=L)</code> from <code>sandwich</code></td></tr>
            <tr><td>Python</td><td><code>.fit(cov_type='HAC', cov_kwds={'{'}'maxlags': L{'}'})</code></td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 3 — 5.4.3  Endogeneity & Normality
   ════════════════════════════════════════════ */
function Tab3() {
  const [included, setIncluded] = useState('education');
  const [omitted, setOmitted] = useState('ability');
  const [response, setResponse] = useState('salary');

  return (
    <>
      <div className="content-section">
        <h2>Assumption 5: No Endogeneity</h2>
        <p>The error term <InlineMath math="\varepsilon" /> must not be correlated with any predictor. This breaks when <strong>important variables are omitted</strong>.</p>
        <ul>
          <li>Excluded variable becomes part of ε</li>
          <li>If correlated with an included predictor → <strong>omitted variable bias</strong></li>
          <li>Coefficients are biased and cannot be interpreted causally</li>
        </ul>
        <p><strong>Remedy:</strong> Include all relevant predictor variables in the model.</p>
      </div>

      <div className="demo-box">
        <h3>Interactive: Omitted Variable Bias Scenario</h3>
        <p>Fill in your scenario to see how omitted variable bias works.</p>
        <div className="input-row">
          <div className="input-group"><label>Response (y)</label><input type="text" value={response} onChange={e => setResponse(e.target.value)} /></div>
          <div className="input-group"><label>Included predictor</label><input type="text" value={included} onChange={e => setIncluded(e.target.value)} /></div>
          <div className="input-group"><label>Omitted variable</label><input type="text" value={omitted} onChange={e => setOmitted(e.target.value)} /></div>
        </div>
        <div className="result">
          <p>Model: <InlineMath math={`\\text{${response}} = \\beta_0 + \\beta_1 \\cdot \\text{${included}} + \\varepsilon`} /></p>
          <p style={{ color: 'var(--warning)' }}><strong>{omitted}</strong> is omitted and likely correlated with <strong>{included}</strong>.</p>
          <p>Because <strong>{omitted}</strong> is excluded, it becomes part of ε. If individuals with high {omitted} also have more {included}, the model attributes the {omitted} effect to {included} — <strong>overestimating</strong> {included}'s true influence on {response}.</p>
          <p style={{ color: 'var(--error)' }}>This is omitted variable bias. The coefficient on {included} cannot be interpreted as a causal effect.</p>
        </div>
      </div>

      <div className="content-section">
        <h2>Assumption 6: Normality of Errors</h2>
        <p>The error term <InlineMath math="\varepsilon" /> is normally distributed, conditional on the predictors.</p>
        <ul>
          <li>Assumptions 1–5 guarantee OLS is unbiased with minimum variance (Gauss-Markov)</li>
          <li>Assumption 6 additionally allows valid <strong>confidence intervals and hypothesis tests</strong></li>
          <li>If violated, tests are still approximately valid for <strong>large samples</strong> (CLT)</li>
        </ul>
      </div>

      <div className="content-section">
        <h2>All 6 Assumptions at a Glance</h2>
        <table className="demo-table">
          <thead><tr><th>#</th><th>Assumption</th><th>Violation</th><th>Consequence</th><th>Remedy</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>Linear, correct spec</td><td>Misspecification</td><td>Biased, poor fit</td><td>Nonlinear terms, transforms</td></tr>
            <tr><td>2</td><td>No multicollinearity</td><td>Multicollinearity</td><td>Inaccurate coefficients</td><td>Drop variable, more data</td></tr>
            <tr><td>3</td><td>Constant variance</td><td>Heteroskedasticity</td><td>Bad standard errors</td><td>White's robust SEs</td></tr>
            <tr><td>4</td><td>Uncorrelated errors</td><td>Serial correlation</td><td>Understated SEs</td><td>Newey-West HAC SEs</td></tr>
            <tr><td>5</td><td>ε ⊥ predictors</td><td>Endogeneity</td><td>Biased coefficients</td><td>Include omitted variables</td></tr>
            <tr><td>6</td><td>Normal errors</td><td>Non-normality</td><td>Invalid small-sample tests</td><td>Large samples (CLT)</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════ */
const tabs = [
  { id: '5.4.1', label: '5.4.1 Linearity & Multicollinearity', component: Tab1 },
  { id: '5.4.2', label: '5.4.2 Heterosk. & Serial Corr.', component: Tab2 },
  { id: '5.4.3', label: '5.4.3 Endogeneity & Normality', component: Tab3 },
];

export default function Section54() {
  const [active, setActive] = useState('5.4.1');
  const ActiveTab = tabs.find(t => t.id === active)?.component || Tab1;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.4: Model Assumptions &amp; Common Violations</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>The 6 OLS assumptions and why they matter</li>
          <li>How to detect violations using residual plots</li>
          <li>Remedies: robust standard errors, variable transforms, including omitted variables</li>
        </ul>
        <p><strong>Prerequisites:</strong> <Link to="/5.3">5.3</Link> — Tests of Significance (t and F tests depend on these assumptions).</p>
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
