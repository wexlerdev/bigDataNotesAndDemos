import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { parseNum } from '../utils/math';

/* ════════════════════════════════════════════
   TAB 1 — 5.8.1  Holdout Method
   ════════════════════════════════════════════ */
function Tab1() {
  const [rows, setRows] = useState([
    { y: 117, yhat1: 113.29, yhat2: 105.81 },
    { y: 125, yhat1: 121.33, yhat2: 126.12 },
    { y: 98,  yhat1: 102.50, yhat2: 100.30 },
    { y: 130, yhat1: 128.10, yhat2: 131.50 },
    { y: 117, yhat1: 110.67, yhat2: 110.40 },
  ]);

  const updateRow = (i, field, val) => setRows(prev => prev.map((r, j) => j === i ? { ...r, [field]: parseNum(val, r[field]) } : r));
  const addRow = () => setRows(prev => [...prev, { y: 100, yhat1: 100, yhat2: 100 }]);
  const removeRow = i => { if (rows.length > 2) setRows(prev => prev.filter((_, j) => j !== i)); };

  const rmse = useMemo(() => {
    const n = rows.length;
    const calc = key => Math.sqrt(rows.reduce((s, r) => s + (r.y - r[key]) ** 2, 0) / n);
    return { m1: calc('yhat1'), m2: calc('yhat2') };
  }, [rows]);

  return (
    <>
      <div className="content-section">
        <h2>The Holdout Method</h2>
        <p>Split data into two parts: <strong>training set</strong> (build the model) and <strong>validation set</strong> (test it).</p>
        <ol>
          <li>Partition the sample (e.g., 75/25 split)</li>
          <li>Estimate competing models on the training set only</li>
          <li>Predict responses in the validation set using training-set coefficients</li>
          <li>Compute <strong>RMSE</strong> on the validation set — lowest wins</li>
        </ol>
        <BlockMath math="RMSE = \sqrt{\frac{\sum(y_i - \hat{y}_i)^2}{n^*}}" />
        <p>where <InlineMath math="n^*" /> = number of validation observations.</p>
        <p style={{ color: 'var(--warning)' }}><strong>Limitation:</strong> Only one partition — results can be sensitive to the particular split.</p>
      </div>

      <div className="demo-box">
        <h3>Interactive: RMSE Comparison</h3>
        <p>Enter actual values and predictions from two competing models on the validation set.</p>
        <table className="demo-table" style={{ marginBottom: '1rem' }}>
          <thead><tr><th>#</th><th>Actual (y)</th><th>ŷ Model 1</th><th>ŷ Model 2</th><th></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><input type="number" step="0.1" value={r.y} style={{ width: '80px' }} onChange={e => updateRow(i, 'y', e.target.value)} /></td>
                <td><input type="number" step="0.1" value={r.yhat1} style={{ width: '80px' }} onChange={e => updateRow(i, 'yhat1', e.target.value)} /></td>
                <td><input type="number" step="0.1" value={r.yhat2} style={{ width: '80px' }} onChange={e => updateRow(i, 'yhat2', e.target.value)} /></td>
                <td>{rows.length > 2 && <button onClick={() => removeRow(i)} style={{ padding: '0.2rem 0.5rem', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>×</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} style={{ padding: '0.3rem 0.8rem', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>+ Add Row</button>

        <div className="result" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '4px', background: rmse.m1 <= rmse.m2 ? 'rgba(158,206,106,0.15)' : 'rgba(0,0,0,0.2)' }}>
              <p><strong>Model 1</strong></p>
              <p>RMSE = <strong>{rmse.m1.toFixed(4)}</strong></p>
              {rmse.m1 <= rmse.m2 && <p style={{ color: 'var(--success)', margin: 0 }}>Winner</p>}
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '4px', background: rmse.m2 < rmse.m1 ? 'rgba(158,206,106,0.15)' : 'rgba(0,0,0,0.2)' }}>
              <p><strong>Model 2</strong></p>
              <p>RMSE = <strong>{rmse.m2.toFixed(4)}</strong></p>
              {rmse.m2 < rmse.m1 && <p style={{ color: 'var(--success)', margin: 0 }}>Winner</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   TAB 2 — 5.8.2  k-Fold Cross-Validation
   ════════════════════════════════════════════ */
function Tab2() {
  const [k, setK] = useState(4);
  const [folds1, setFolds1] = useState([11.31, 12.26, 13.30, 13.76]);
  const [folds2, setFolds2] = useState([12.54, 11.88, 12.09, 13.46]);

  const updateFold = (which, i, val) => {
    const setter = which === 1 ? setFolds1 : setFolds2;
    setter(prev => prev.map((v, j) => j === i ? parseNum(val, v) : v));
  };

  const handleK = newK => {
    const nk = Math.max(2, Math.min(10, newK));
    setK(nk);
    const pad = (arr, len) => {
      const r = [...arr];
      while (r.length < len) r.push(0);
      return r.slice(0, len);
    };
    setFolds1(prev => pad(prev, nk));
    setFolds2(prev => pad(prev, nk));
  };

  const avg1 = folds1.reduce((a, b) => a + b, 0) / k;
  const avg2 = folds2.reduce((a, b) => a + b, 0) / k;

  return (
    <>
      <div className="content-section">
        <h2>k-Fold Cross-Validation</h2>
        <p>More robust than holdout — repeats the experiment <strong>k times</strong>.</p>
        <ol>
          <li>Split data into <strong>k equal folds</strong></li>
          <li>For each fold: use it as validation, train on the other k−1 folds</li>
          <li>Compute RMSE for each fold</li>
          <li><strong>Average</strong> the k RMSE values — lowest average wins</li>
        </ol>
        <p>Every observation is used for validation exactly once.</p>
        <table className="demo-table" style={{ maxWidth: '500px' }}>
          <thead><tr><th>Property</th><th>Holdout</th><th>k-Fold</th></tr></thead>
          <tbody>
            <tr><td>Experiments</td><td>1</td><td>k</td></tr>
            <tr><td>Partition sensitivity</td><td>High</td><td>Low</td></tr>
            <tr><td>Computational cost</td><td>Low</td><td>Higher</td></tr>
            <tr><td>Reliability</td><td>Lower</td><td>Higher</td></tr>
            <tr><td>Every obs tested?</td><td>No</td><td>Yes</td></tr>
          </tbody>
        </table>
        <p><strong>Leave-one-out (LOOCV):</strong> k = n — each observation is its own fold. Most expensive but uses maximum training data.</p>
      </div>

      <div className="demo-box">
        <h3>Interactive: k-Fold RMSE Averager</h3>
        <p>Enter RMSE from each fold for two competing models. Pre-loaded with the Gender_Gap example.</p>
        <div className="input-row">
          <div className="input-group">
            <label>k (folds)</label>
            <input type="number" min="2" max="10" value={k} style={{ width: '60px' }} onChange={e => handleK(parseInt(e.target.value) || 2)} />
          </div>
        </div>

        <table className="demo-table" style={{ marginBottom: '1rem' }}>
          <thead><tr><th>Fold</th><th>RMSE Model 1</th><th>RMSE Model 2</th></tr></thead>
          <tbody>
            {Array.from({ length: k }, (_, i) => (
              <tr key={i}>
                <td>Fold {i + 1}</td>
                <td><input type="number" step="0.01" value={folds1[i] ?? 0} style={{ width: '90px' }} onChange={e => updateFold(1, i, e.target.value)} /></td>
                <td><input type="number" step="0.01" value={folds2[i] ?? 0} style={{ width: '90px' }} onChange={e => updateFold(2, i, e.target.value)} /></td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700, background: 'rgba(0,0,0,0.2)' }}>
              <td>Average</td>
              <td style={{ color: avg1 <= avg2 ? 'var(--success)' : 'var(--text)' }}>{avg1.toFixed(2)}</td>
              <td style={{ color: avg2 < avg1 ? 'var(--success)' : 'var(--text)' }}>{avg2.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="result">
          {avg1 <= avg2 ? (
            <p style={{ color: 'var(--success)' }}><strong>Model 1</strong> has the lower average RMSE ({avg1.toFixed(2)} vs {avg2.toFixed(2)}) — preferred by k-fold CV.</p>
          ) : (
            <p style={{ color: 'var(--success)' }}><strong>Model 2</strong> has the lower average RMSE ({avg2.toFixed(2)} vs {avg1.toFixed(2)}) — preferred by k-fold CV.</p>
          )}
        </div>
      </div>

      <div className="demo-box">
        <h3>k-Fold Visualization</h3>
        <p>Each row is one experiment. The shaded block is the validation fold.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {Array.from({ length: k }, (_, exp) => (
            <div key={exp} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '80px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Exp {exp + 1}</span>
              <div style={{ display: 'flex', flex: 1, height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                {Array.from({ length: k }, (_, fold) => (
                  <div
                    key={fold}
                    style={{
                      flex: 1,
                      background: fold === exp ? 'rgba(196,181,253,0.5)' : 'rgba(255,255,255,0.06)',
                      borderRight: fold < k - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', color: fold === exp ? '#fff' : 'var(--text-dim)',
                    }}
                  >
                    {fold === exp ? 'Val' : 'Train'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════ */
const tabs = [
  { id: '5.8.1', label: '5.8.1 Holdout', component: Tab1 },
  { id: '5.8.2', label: '5.8.2 k-Fold CV', component: Tab2 },
];

export default function Section58() {
  const [active, setActive] = useState('5.8.1');
  const ActiveTab = tabs.find(t => t.id === active)?.component || Tab1;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.8: Cross-Validation Methods</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Why in-sample measures (R², Sₑ) are insufficient — <strong>overfitting</strong></li>
          <li>The <strong>holdout method</strong>: train/validation split + RMSE</li>
          <li>The <strong>k-fold</strong> method: more robust, every observation tested</li>
        </ul>
        <p><strong>Prerequisites:</strong> <Link to="/5.2">5.2</Link> — Goodness-of-Fit, <Link to="/5.3">5.3</Link> — significance testing.</p>
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
