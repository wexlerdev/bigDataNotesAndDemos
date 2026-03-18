import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { parseNum } from '../utils/math';

/* ════════════════════════════════════════════
   TAB 1 — 5.6.1  Dummy × Dummy
   ════════════════════════════════════════════ */
function Tab1() {
  const [b0, setB0] = useState(44.10);
  const [bGPA, setBGPA] = useState(6.71);
  const [bMIS, setBMIS] = useState(5.33);
  const [bStats, setBStats] = useState(5.54);
  const [bInt, setBInt] = useState(3.49);
  const [gpa, setGpa] = useState(3.5);

  const scenarios = useMemo(() => {
    const base = b0 + bGPA * gpa;
    return [
      { mis: 0, stats: 0, label: 'Neither', salary: base },
      { mis: 1, stats: 0, label: 'MIS only', salary: base + bMIS },
      { mis: 0, stats: 1, label: 'Stats only', salary: base + bStats },
      { mis: 1, stats: 1, label: 'Both', salary: base + bMIS + bStats + bInt },
    ];
  }, [b0, bGPA, bMIS, bStats, bInt, gpa]);

  return (
    <>
      <div className="content-section">
        <h2>Dummy × Dummy Interaction</h2>
        <BlockMath math="y = \beta_0 + \beta_1 x + \beta_2 d_1 + \beta_3 d_2 + \beta_4 (d_1 \times d_2) + \varepsilon" />
        <ul>
          <li>Partial effect of d₁ on ŷ = <InlineMath math="b_2 + b_4 \cdot d_2" /> — depends on d₂</li>
          <li>The interaction coefficient captures the <strong>extra</strong> (or reduced) effect of having both attributes simultaneously</li>
        </ul>
      </div>

      <div className="demo-box">
        <h3>Interactive: MIS × Statistics Salary (File MIS_Stats)</h3>
        <p>See how the interaction term affects predictions across all 4 group combinations.</p>
        <div className="input-row">
          <div className="input-group"><label>b₀ (intercept)</label><input type="number" step="0.01" value={b0} onChange={e => setB0(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(GPA)</label><input type="number" step="0.01" value={bGPA} onChange={e => setBGPA(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(MIS)</label><input type="number" step="0.01" value={bMIS} onChange={e => setBMIS(parseNum(e.target.value, 0))} /></div>
        </div>
        <div className="input-row">
          <div className="input-group"><label>b(Stats)</label><input type="number" step="0.01" value={bStats} onChange={e => setBStats(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(MIS×Stats)</label><input type="number" step="0.01" value={bInt} onChange={e => setBInt(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>GPA</label><input type="number" step="0.1" value={gpa} onChange={e => setGpa(parseNum(e.target.value, 0))} /></div>
        </div>
        <table className="demo-table">
          <thead><tr><th>Group</th><th>MIS</th><th>Stats</th><th>MIS×Stats</th><th>Predicted Salary ($1,000s)</th></tr></thead>
          <tbody>
            {scenarios.map((s, i) => (
              <tr key={i} style={s.label === 'Both' ? { background: 'rgba(158,206,106,0.1)' } : {}}>
                <td><strong>{s.label}</strong></td><td>{s.mis}</td><td>{s.stats}</td><td>{s.mis * s.stats}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>${s.salary.toFixed(2)}k</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="result">
          <p>Interaction bonus for having <em>both</em>: <strong>${bInt.toFixed(2)}k</strong> beyond the individual effects</p>
          <p>Difference (Both − Neither): <strong>${(scenarios[3].salary - scenarios[0].salary).toFixed(2)}k</strong></p>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 2 — 5.6.2  Dummy × Numerical
   ════════════════════════════════════════════ */
function Tab2() {
  const [b0, setB0] = useState(6.46);
  const [bExp, setBExp] = useState(0.517);
  const [bTrain, setBTrain] = useState(6.16);
  const [bInt, setBInt] = useState(-0.394);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    ctx.fillStyle = '#1e1b2e'; ctx.fillRect(0, 0, w, h);

    const xMin = 0, xMax = 25;
    const yPred = (exp, d) => b0 + bExp * exp + bTrain * d + bInt * exp * d;
    const yMin = Math.min(yPred(0, 0), yPred(0, 1), yPred(25, 0), yPred(25, 1)) - 2;
    const yMax = Math.max(yPred(0, 0), yPred(0, 1), yPred(25, 0), yPred(25, 1)) + 2;
    const x2px = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const y2py = y => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
    ctx.fillStyle = '#b8add9'; ctx.font = '11px sans-serif';
    ctx.fillText('Experience', w / 2 - 25, h - 5);
    ctx.fillText('Rate', 5, pad.t + plotH / 2);

    // No training line
    ctx.strokeStyle = '#f7768e'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x2px(0), y2py(yPred(0, 0))); ctx.lineTo(x2px(25), y2py(yPred(25, 0))); ctx.stroke();
    // Training line
    ctx.strokeStyle = '#9ece6a'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x2px(0), y2py(yPred(0, 1))); ctx.lineTo(x2px(25), y2py(yPred(25, 1))); ctx.stroke();

    // Legend
    ctx.fillStyle = '#f7768e'; ctx.fillRect(pad.l + 10, pad.t + 8, 20, 3);
    ctx.fillStyle = '#e6e0ff'; ctx.font = '11px sans-serif'; ctx.fillText('No Training', pad.l + 35, pad.t + 13);
    ctx.fillStyle = '#9ece6a'; ctx.fillRect(pad.l + 10, pad.t + 22, 20, 3);
    ctx.fillStyle = '#e6e0ff'; ctx.fillText('Training', pad.l + 35, pad.t + 27);
  }, [b0, bExp, bTrain, bInt]);

  const slopeNoTrain = bExp;
  const slopeTrain = bExp + bInt;

  return (
    <>
      <div className="content-section">
        <h2>Dummy × Numerical Interaction</h2>
        <BlockMath math="y = \beta_0 + \beta_1 x + \beta_2 d + \beta_3 (x \times d) + \varepsilon" />
        <ul>
          <li>Partial effect of x on ŷ = <InlineMath math="b_1 + b_3 \cdot d" /> — <strong>different slopes</strong> for each group</li>
          <li>When d = 0: slope = b₁. When d = 1: slope = b₁ + b₃</li>
        </ul>
      </div>

      <div className="demo-box">
        <h3>Interactive: Training × Experience (File Conversion)</h3>
        <p>See how the interaction creates different slopes for trained vs untrained employees.</p>
        <div className="input-row">
          <div className="input-group"><label>b₀</label><input type="number" step="0.01" value={b0} onChange={e => setB0(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(Experience)</label><input type="number" step="0.001" value={bExp} onChange={e => setBExp(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(Training)</label><input type="number" step="0.01" value={bTrain} onChange={e => setBTrain(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(Exp×Train)</label><input type="number" step="0.001" value={bInt} onChange={e => setBInt(parseNum(e.target.value, 0))} /></div>
        </div>

        <canvas ref={canvasRef} width={550} height={280} style={{ maxWidth: '100%' }} />

        <div className="result">
          <p>Slope for <strong>untrained</strong> (d=0): <InlineMath math={`${slopeNoTrain.toFixed(4)}`} /> per year</p>
          <p>Slope for <strong>trained</strong> (d=1): <InlineMath math={`${slopeNoTrain.toFixed(4)} + (${bInt.toFixed(4)}) = ${slopeTrain.toFixed(4)}`} /> per year</p>
          {bInt < 0 ? (
            <p style={{ color: 'var(--warning)' }}>Negative interaction: training effect <strong>diminishes</strong> for more experienced employees.</p>
          ) : bInt > 0 ? (
            <p style={{ color: 'var(--success)' }}>Positive interaction: training effect <strong>amplifies</strong> for more experienced employees.</p>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 3 — 5.6.3  Numerical × Numerical
   ════════════════════════════════════════════ */
function Tab3() {
  const [b0, setB0] = useState(-16.64);
  const [b1, setB1] = useState(0.087);
  const [b2, setB2] = useState(0.541);
  const [bInt, setBInt] = useState(0.0039);
  const [x1, setX1] = useState(80);
  const [x2, setX2] = useState(50);

  const pred = b0 + b1 * x1 + b2 * x2 + bInt * x1 * x2;
  const partialX1 = b1 + bInt * x2;
  const partialX2 = b2 + bInt * x1;

  return (
    <>
      <div className="content-section">
        <h2>Numerical × Numerical Interaction</h2>
        <BlockMath math="y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \beta_3 (x_1 \times x_2) + \varepsilon" />
        <ul>
          <li>Partial effect of x₁ = <InlineMath math="b_1 + b_3 \cdot x_2" /> — depends on x₂</li>
          <li>Partial effect of x₂ = <InlineMath math="b_2 + b_3 \cdot x_1" /> — depends on x₁</li>
          <li>Both partial effects change continuously — <strong>harder to interpret</strong></li>
        </ul>
      </div>

      <div className="demo-box">
        <h3>Interactive: Marketing × Employment (File MSA)</h3>
        <p>See how the partial effects change depending on the other variable's value.</p>
        <div className="input-row">
          <div className="input-group"><label>b₀</label><input type="number" step="0.01" value={b0} onChange={e => setB0(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(Marketing)</label><input type="number" step="0.001" value={b1} onChange={e => setB1(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(Employed)</label><input type="number" step="0.001" value={b2} onChange={e => setB2(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>b(Mkt×Emp)</label><input type="number" step="0.0001" value={bInt} onChange={e => setBInt(parseNum(e.target.value, 0))} /></div>
        </div>
        <div className="input-row">
          <div className="input-group"><label>Marketing ($1,000s)</label><input type="number" value={x1} onChange={e => setX1(parseNum(e.target.value, 0))} /></div>
          <div className="input-group"><label>Employed (%)</label><input type="number" value={x2} onChange={e => setX2(parseNum(e.target.value, 0))} /></div>
        </div>
        <div className="result">
          <p><strong>Predicted Applicants = {pred.toFixed(1)}</strong></p>
          <p>Partial effect of Marketing (at Employed = {x2}%): <InlineMath math={`${b1} + ${bInt} \\times ${x2} = ${partialX1.toFixed(4)}`} /> applicants per $1,000</p>
          <p>Partial effect of Employed (at Marketing = ${x1}k): <InlineMath math={`${b2} + ${bInt} \\times ${x1} = ${partialX2.toFixed(4)}`} /> applicants per 1%</p>
          {bInt > 0 ? (
            <p style={{ color: 'var(--success)' }}>Positive interaction: Marketing and Employment are <strong>synergistic</strong> — each amplifies the other's effect.</p>
          ) : bInt < 0 ? (
            <p style={{ color: 'var(--warning)' }}>Negative interaction: the two predictors <strong>substitute</strong> for each other.</p>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════ */
const tabs = [
  { id: '5.6.1', label: '5.6.1 Dummy × Dummy', component: Tab1 },
  { id: '5.6.2', label: '5.6.2 Dummy × Numerical', component: Tab2 },
  { id: '5.6.3', label: '5.6.3 Numerical × Numerical', component: Tab3 },
];

export default function Section56() {
  const [active, setActive] = useState('5.6.1');
  const ActiveTab = tabs.find(t => t.id === active)?.component || Tab1;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.6: Interaction Variables</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Why interactions matter — the effect of one predictor can depend on another</li>
          <li>Three types: Dummy×Dummy, Dummy×Numerical, Numerical×Numerical</li>
          <li>How to compute and interpret partial effects with interaction terms</li>
        </ul>
        <p><strong>Prerequisites:</strong> <Link to="/5.1">5.1</Link> — coefficient interpretation and dummy variables.</p>
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
