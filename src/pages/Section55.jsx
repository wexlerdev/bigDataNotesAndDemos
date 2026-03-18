import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { parseNum } from '../utils/math';

/* ════════════════════════════════════════════
   TAB 1 — 5.5.1  Making Predictions
   ════════════════════════════════════════════ */
function Tab1() {
  const [coeffs, setCoeffs] = useState([
    { name: 'Intercept', b: 9582, val: null },
    { name: 'Beds', b: 31243, val: 3 },
    { name: 'Baths', b: 30971, val: 2 },
    { name: 'SqFt', b: 76.98, val: 2000 },
    { name: 'LSize', b: 0.43, val: 10000 },
    { name: 'New', b: 63248, val: 1 },
  ]);

  const updateCoeff = (i, field, v) => setCoeffs(prev => prev.map((c, j) => j === i ? { ...c, [field]: parseNum(v, c[field]) } : c));
  const addPredictor = () => setCoeffs(prev => [...prev, { name: 'x' + prev.length, b: 0, val: 0 }]);
  const removePredictor = i => { if (i > 0) setCoeffs(prev => prev.filter((_, j) => j !== i)); };

  const prediction = useMemo(() => {
    return coeffs.reduce((sum, c, i) => sum + c.b * (i === 0 ? 1 : (c.val ?? 0)), 0);
  }, [coeffs]);

  const breakdown = coeffs.map((c, i) => ({
    name: c.name,
    contribution: c.b * (i === 0 ? 1 : (c.val ?? 0)),
  }));

  return (
    <>
      <div className="content-section">
        <h2>How to Make Predictions</h2>
        <p>Plug specific values into the regression equation: <InlineMath math="\hat{y} = b_0 + b_1 x_1 + b_2 x_2 + \cdots + b_k x_k" /></p>
        <p>Each predictor's contribution = coefficient × value. Sum them all for the prediction.</p>
      </div>

      <div className="demo-box">
        <h3>Interactive: Prediction Calculator</h3>
        <p>Enter coefficients and predictor values. Pre-loaded with the House_Price example.</p>
        <table className="demo-table" style={{ marginBottom: '1rem' }}>
          <thead><tr><th>Variable</th><th>Coefficient (b)</th><th>Value (x)</th><th>Contribution</th><th></th></tr></thead>
          <tbody>
            {coeffs.map((c, i) => (
              <tr key={i}>
                <td><input type="text" value={c.name} onChange={e => updateCoeff(i, 'name', e.target.value)} style={{ maxWidth: '100px', border: 'none', background: 'transparent', color: 'var(--text)', fontFamily: 'var(--font)' }} /></td>
                <td><input type="number" value={c.b} step="0.01" style={{ width: '100px' }} onChange={e => updateCoeff(i, 'b', e.target.value)} /></td>
                <td>{i === 0 ? <span style={{ color: 'var(--text-dim)' }}>—</span> : <input type="number" value={c.val} step="1" style={{ width: '90px' }} onChange={e => updateCoeff(i, 'val', e.target.value)} />}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{breakdown[i].contribution.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td>{i > 0 && <button onClick={() => removePredictor(i)} style={{ padding: '0.2rem 0.5rem', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addPredictor} style={{ padding: '0.3rem 0.8rem', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>+ Add Predictor</button>
        <div className="result" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          <strong>Predicted ŷ = {prediction.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 2 — 5.5.2  Interpreting & Communicating
   ════════════════════════════════════════════ */
function Tab2() {
  const [coeff, setCoeff] = useState(31243);
  const [varName, setVarName] = useState('Bedrooms');
  const [respName, setRespName] = useState('Price');
  const [isDummy, setIsDummy] = useState(false);
  const [refGroup, setRefGroup] = useState('not-new');

  return (
    <>
      <div className="content-section">
        <h2>Communicating Results Correctly</h2>
        <ul>
          <li>Always include <strong>"holding all other factors constant"</strong> for multiple regression</li>
          <li>Use <strong>"is associated with"</strong> or <strong>"is predicted to"</strong> — never "causes"</li>
          <li>Dummy coefficients = average difference relative to the reference group</li>
          <li>Acknowledge limitations: omitted variables, observational data</li>
        </ul>
      </div>

      <div className="demo-box">
        <h3>Interactive: Interpretation Generator</h3>
        <div className="input-row">
          <div className="input-group"><label>Predictor</label><input type="text" value={varName} onChange={e => setVarName(e.target.value)} /></div>
          <div className="input-group"><label>Response</label><input type="text" value={respName} onChange={e => setRespName(e.target.value)} /></div>
          <div className="input-group"><label>Coefficient</label><input type="number" value={coeff} onChange={e => setCoeff(parseNum(e.target.value, 0))} /></div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label><input type="checkbox" checked={isDummy} onChange={e => setIsDummy(e.target.checked)} style={{ marginRight: '0.5rem' }} />Dummy variable?</label>
          </div>
          {isDummy && <div className="input-group"><label>Reference group</label><input type="text" value={refGroup} onChange={e => setRefGroup(e.target.value)} /></div>}
        </div>
        <div className="result">
          {isDummy ? (
            <p>Holding all other variables constant, the predicted {respName} is <strong>{Math.abs(coeff).toLocaleString()} {coeff >= 0 ? 'higher' : 'lower'}</strong> for {varName} compared to {refGroup} (reference group).</p>
          ) : (
            <p>Holding all other variables constant, for each one-unit increase in {varName}, the predicted {respName} {coeff >= 0 ? 'increases' : 'decreases'} by <strong>{Math.abs(coeff).toLocaleString()}</strong>.</p>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 3 — 5.5.3  Association vs Causation
   ════════════════════════════════════════════ */
function Tab3() {
  const [answers, setAnswers] = useState({});
  const scenarios = [
    { id: 'a', text: 'A regression finds that each additional bedroom is associated with $31,243 higher sale price. A homeowner claims adding a bedroom will increase their home value by exactly that amount.', causal: false, why: 'Observational data — omitted variables (neighborhood, layout changes) may confound. The coefficient is an average association, not a guaranteed individual effect.' },
    { id: 'b', text: 'A randomized experiment assigns students to tutoring vs no tutoring. A regression finds tutoring raises test scores by 12 points.', causal: true, why: 'Random assignment ensures no systematic confounders — the coefficient can be interpreted causally.' },
    { id: 'c', text: 'A regression shows that ice cream sales are positively correlated with drowning incidents.', causal: false, why: 'Classic confounding — temperature drives both. No causal link between ice cream and drowning.' },
    { id: 'd', text: 'After controlling for experience, firm size, and degree, female managers earn $1,498 less per year of experience than male managers.', causal: false, why: 'Observational data with possible omitted variables (negotiation, role differences). Shows a disparity but does not prove gender causes the gap.' },
  ];

  return (
    <>
      <div className="content-section">
        <h2>Association ≠ Causation</h2>
        <p>Regression coefficients from observational data show <strong>conditional associations</strong>, not causal effects. Causation requires:</p>
        <ul>
          <li>No omitted variable bias (all confounders controlled)</li>
          <li>Ideally, randomized experimental design</li>
          <li>No reverse causality</li>
        </ul>
      </div>

      <div className="demo-box">
        <h3>Interactive: Causal or Not?</h3>
        <p>For each scenario, decide: can we claim a causal relationship?</p>
        {scenarios.map(s => (
          <div key={s.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius)' }}>
            <p style={{ margin: '0 0 0.75rem', color: 'var(--text)' }}>{s.text}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setAnswers(a => ({ ...a, [s.id]: true }))}
                style={{ padding: '0.3rem 1rem', cursor: 'pointer', background: answers[s.id] === true ? 'var(--success)' : 'var(--surface)', color: answers[s.id] === true ? '#000' : 'var(--text)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', fontWeight: 600 }}
              >Causal</button>
              <button
                onClick={() => setAnswers(a => ({ ...a, [s.id]: false }))}
                style={{ padding: '0.3rem 1rem', cursor: 'pointer', background: answers[s.id] === false ? 'var(--error)' : 'var(--surface)', color: answers[s.id] === false ? '#fff' : 'var(--text)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', fontWeight: 600 }}
              >Not Causal</button>
            </div>
            {answers[s.id] !== undefined && (
              <div style={{ padding: '0.5rem', borderRadius: '4px', background: answers[s.id] === s.causal ? 'rgba(158,206,106,0.15)' : 'rgba(247,118,142,0.15)' }}>
                <p style={{ margin: 0, fontWeight: 600, color: answers[s.id] === s.causal ? 'var(--success)' : 'var(--error)' }}>
                  {answers[s.id] === s.causal ? 'Correct!' : 'Not quite.'} {s.causal ? 'This IS causal.' : 'This is NOT causal.'}
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{s.why}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════ */
const tabs = [
  { id: '5.5.1', label: '5.5.1 Predictions', component: Tab1 },
  { id: '5.5.2', label: '5.5.2 Interpretation', component: Tab2 },
  { id: '5.5.3', label: '5.5.3 Assoc. vs Causation', component: Tab3 },
];

export default function Section55() {
  const [active, setActive] = useState('5.5.1');
  const ActiveTab = tabs.find(t => t.id === active)?.component || Tab1;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.5: Writing with Big Data</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Make predictions by plugging values into a regression equation</li>
          <li>Write correct plain-English interpretations of coefficients</li>
          <li>Distinguish association from causation in observational data</li>
        </ul>
        <p><strong>Prerequisites:</strong> <Link to="/5.1">5.1</Link> — coefficient interpretation, <Link to="/5.4">5.4</Link> — endogeneity/omitted variable bias.</p>
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
