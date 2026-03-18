import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';

const workflowSteps = [
  { num: 1, title: 'Define the Question', desc: 'What are you predicting? What candidate predictors do you have?', link: null },
  { num: 2, title: 'Explore the Data', desc: 'Plot y vs each x. Check for skewness (log transform?). Identify categorical → dummy variables.', link: null },
  { num: 3, title: 'Estimate Competing Models', desc: 'Start simple, add predictors. Consider interactions (5.6) and nonlinear terms (5.7).', link: '/5.1' },
  { num: 4, title: 'Evaluate Fit', desc: 'Compare Adjusted R² (higher = better) and Sₑ (lower = better). Run the F-test.', link: '/5.2' },
  { num: 5, title: 'Test Individual Significance', desc: 't-test each predictor. Drop insignificant ones. Check CIs.', link: '/5.3' },
  { num: 6, title: 'Check Assumptions', desc: 'Residual plots for nonlinearity, heteroskedasticity, serial correlation. Consider omitted variables.', link: '/5.4' },
  { num: 7, title: 'Validate with Cross-Validation', desc: 'Holdout or k-fold. Compare RMSE on unseen data. Watch for overfitting.', link: '/5.8' },
  { num: 8, title: 'Communicate Results', desc: 'Report equation, interpret coefficients ("holding constant"), distinguish association from causation, acknowledge limitations.', link: '/5.5' },
];

const checklist = [
  { id: 'eq', text: 'Regression equation with coefficient estimates reported' },
  { id: 'interp', text: 'Each significant coefficient interpreted in plain English with "holding constant"' },
  { id: 'dummy', text: 'Dummy variable coefficients compared to the reference group' },
  { id: 'gof', text: 'Goodness-of-fit reported: R², Adjusted R², Sₑ' },
  { id: 'ftest', text: 'F-test for joint significance reported with p-value' },
  { id: 'ttest', text: 't-tests for individual predictors reported' },
  { id: 'assumptions', text: 'Residual plots checked; assumption violations noted and addressed' },
  { id: 'cv', text: 'Out-of-sample validation (holdout or k-fold RMSE) reported if applicable' },
  { id: 'causal', text: 'Association vs causation clearly distinguished — no causal claims from observational data' },
  { id: 'limits', text: 'Limitations acknowledged: omitted variables, sample constraints, assumption issues' },
];

export default function Section59() {
  const [checks, setChecks] = useState({});
  const toggle = id => setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  const completed = Object.values(checks).filter(Boolean).length;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.9: Writing with Big Data — Full Workflow</h1>

      <div className="concept-block">
        <h2>Putting It All Together</h2>
        <p>This section ties every concept from 5.1–5.8 into a complete regression analysis workflow. Use it as your roadmap when conducting and reporting a regression analysis.</p>
      </div>

      <div className="content-section">
        <h2>The 8-Step Regression Workflow</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {workflowSteps.map(step => (
            <div key={step.num} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ minWidth: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245,213,71,0.15)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem', flexShrink: 0 }}>
                {step.num}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>{step.title}</p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
              {step.link && <Link to={step.link} style={{ alignSelf: 'center', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Go →</Link>}
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>Unit 5 Section Map</h2>
        <table className="demo-table">
          <thead><tr><th>Section</th><th>Topic</th><th>Key Idea</th></tr></thead>
          <tbody>
            <tr><td><Link to="/5.1">5.1</Link></td><td>Linear Regression Model</td><td>OLS minimizes SSE; coefficients are partial effects</td></tr>
            <tr><td><Link to="/5.2">5.2</Link></td><td>Goodness-of-Fit</td><td>Sₑ, R², Adjusted R² measure how well the model explains variation</td></tr>
            <tr><td><Link to="/5.3">5.3</Link></td><td>Tests of Significance</td><td>F-test (joint), t-test (individual), p-values drive decisions</td></tr>
            <tr><td><Link to="/5.4">5.4</Link></td><td>Model Assumptions</td><td>6 assumptions; violations → bias, bad SEs, unreliable tests</td></tr>
            <tr><td><Link to="/5.5">5.5</Link></td><td>Writing with Big Data</td><td>Prediction, interpretation, association ≠ causation</td></tr>
            <tr><td><Link to="/5.6">5.6</Link></td><td>Interaction Variables</td><td>d×d, d×x, x×x — one predictor's effect depends on another</td></tr>
            <tr><td><Link to="/5.7">5.7</Link></td><td>Nonlinear Relationships</td><td>Quadratic models, log transforms for curves & percentages</td></tr>
            <tr><td><Link to="/5.8">5.8</Link></td><td>Cross-Validation</td><td>Holdout & k-fold test out-of-sample predictive power</td></tr>
          </tbody>
        </table>
      </div>

      <div className="demo-box">
        <h3>Interactive: Regression Report Checklist</h3>
        <p>Use this checklist before submitting any regression analysis. Click to check off each item.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {checklist.map(item => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: checks[item.id] ? 'rgba(158,206,106,0.1)' : 'rgba(0,0,0,0.15)', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.15s', border: checks[item.id] ? '1px solid rgba(158,206,106,0.3)' : '1px solid transparent' }}
            >
              <div style={{ width: '22px', height: '22px', borderRadius: '4px', border: checks[item.id] ? '2px solid var(--success)' : '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
                {checks[item.id] ? '✓' : ''}
              </div>
              <span style={{ color: checks[item.id] ? 'var(--text)' : 'var(--text-dim)', textDecoration: checks[item.id] ? 'line-through' : 'none', fontSize: '0.9rem' }}>{item.text}</span>
            </div>
          ))}
        </div>
        <div className="result" style={{ marginTop: '1rem' }}>
          <p><strong>{completed} / {checklist.length}</strong> completed</p>
          {completed === checklist.length && <p style={{ color: 'var(--success)', fontWeight: 600 }}>All items checked — ready to submit!</p>}
        </div>
      </div>
    </main>
  );
}
