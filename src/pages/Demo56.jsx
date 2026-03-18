import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { parseNum } from '../utils/math';

export default function Demo56() {
  // Demo 1: F-test (joint significance)
  const [fSSR, setFSSR] = useState(292171);
  const [fSSE, setFSSE] = useState(96012);
  const [fK, setFK] = useState(2);
  const [fN, setFN] = useState(26);

  const fTest = useMemo(() => {
    const dfReg = fK;
    const dfRes = fN - fK - 1;
    if (dfReg <= 0 || dfRes <= 0) return null;
    const msr = fSSR / dfReg;
    const mse = fSSE / dfRes;
    const fStat = mse === 0 ? Infinity : msr / mse;
    return { dfReg, dfRes, msr, mse, fStat, sst: fSSR + fSSE };
  }, [fSSR, fSSE, fK, fN]);

  // Demo 2: t-test (individual significance)
  const [tCoeff, setTCoeff] = useState(10.512);
  const [tSE, setTSE] = useState(1.477);
  const [tAlpha, setTAlpha] = useState(0.05);
  const [tN, setTN] = useState(26);
  const [tK, setTK] = useState(2);
  const [tVarName, setTVarName] = useState('Income');

  const tTest = useMemo(() => {
    if (tSE === 0) return null;
    const df = tN - tK - 1;
    if (df <= 0) return null;
    const tStat = tCoeff / tSE;
    const absTStat = Math.abs(tStat);
    // rough two-tailed p-value approximation using normal for large df
    const z = absTStat;
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1.0 / (1.0 + p * z);
    const erfVal = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    const cdf = 0.5 * (1 + erfVal / Math.sqrt(1)); // simplified
    const pValue = 2 * (1 - 0.5 * (1 + erfVal));
    return { tStat, df, pValue: Math.max(0, Math.min(1, pValue)), absTStat };
  }, [tCoeff, tSE, tN, tK]);

  // Demo 3: CI significance checker
  const [ciLower, setCiLower] = useState(7.46);
  const [ciUpper, setCiUpper] = useState(13.57);

  const ciContainsZero = ciLower <= 0 && ciUpper >= 0;

  // Demo 4: ANOVA table builder
  const [aSSR, setASSR] = useState(292171);
  const [aSSE, setASSE] = useState(96012);
  const [aK, setAK] = useState(2);
  const [aN, setAN] = useState(26);

  const anova = useMemo(() => {
    const dfReg = aK;
    const dfRes = aN - aK - 1;
    const dfTot = aN - 1;
    if (dfReg <= 0 || dfRes <= 0) return null;
    const sst = aSSR + aSSE;
    const msr = aSSR / dfReg;
    const mse = aSSE / dfRes;
    const fStat = mse === 0 ? Infinity : msr / mse;
    const r2 = sst === 0 ? 0 : aSSR / sst;
    const adjR2 = 1 - ((1 - r2) * (aN - 1)) / (aN - aK - 1);
    const se = Math.sqrt(mse);
    return { dfReg, dfRes, dfTot, sst, msr, mse, fStat, r2, adjR2, se };
  }, [aSSR, aSSE, aK, aN]);

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.3: Tests of Significance</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Use the <strong>F-test</strong> to check if the model is <em>jointly</em> significant</li>
          <li>Use the <strong>t-test</strong> to check if an <em>individual</em> predictor is significant</li>
          <li>Read p-values and confidence intervals to make decisions</li>
          <li>Interpret an ANOVA table from regression output</li>
        </ul>
        <p><strong>When to use:</strong> You have a fitted model and need to determine which predictors actually matter.</p>
        <p><strong>Prerequisites:</strong> <Link to="/5.2">5.2</Link> — Goodness-of-Fit (SST, SSR, SSE, R²). Helpful: <Link to="/4.8">4.8</Link> Hypothesis Testing.</p>
      </div>

      <div className="content-section">
        <h2>Joint Significance (F-Test)</h2>
        <p>Tests whether the predictors <strong>collectively</strong> influence the response:</p>
        <BlockMath math="H_0: \beta_1 = \beta_2 = \cdots = \beta_k = 0 \qquad H_A: \text{at least one } \beta_j \neq 0" />
        <p>The F-statistic compares explained variance (MSR) to unexplained variance (MSE):</p>
        <BlockMath math="F = \frac{MSR}{MSE} = \frac{SSR/k}{SSE/(n-k-1)}" />
        <p>A small p-value (Significance F) → reject H₀ → the model is useful overall.</p>
      </div>

      <div className="content-section">
        <h2>Individual Significance (t-Test)</h2>
        <p>Tests whether a <strong>single predictor</strong> influences the response:</p>
        <BlockMath math="H_0: \beta_j = 0 \qquad H_A: \beta_j \neq 0" />
        <BlockMath math="t = \frac{b_j}{SE(b_j)} \qquad df = n - k - 1" />
        <p>Small p-value → reject H₀ → that predictor is statistically significant.</p>
      </div>

      <div className="content-section">
        <h2>Confidence Intervals as an Alternative</h2>
        <p>If the 95% confidence interval for <InlineMath math="\beta_j" /> <strong>does not contain 0</strong>, the predictor is significant at the 5% level. Results always agree with the p-value approach.</p>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Interactive Demos</h2>

      <div className="demo-box">
        <h3>Demo 1: F-Test Calculator</h3>
        <p>Enter SSR, SSE, number of predictors (k), and sample size (n) to compute the F-statistic.</p>
        <div className="input-row">
          <div className="input-group">
            <label>SSR (explained)</label>
            <input type="number" min="0" value={fSSR} onChange={e => setFSSR(parseNum(e.target.value, 0))} />
          </div>
          <div className="input-group">
            <label>SSE (unexplained)</label>
            <input type="number" min="0" value={fSSE} onChange={e => setFSSE(parseNum(e.target.value, 0))} />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="k" /> (predictors)</label>
            <input type="number" min="1" value={fK} onChange={e => setFK(parseNum(e.target.value, 1))} />
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /> (observations)</label>
            <input type="number" min="4" value={fN} onChange={e => setFN(parseNum(e.target.value, 4))} />
          </div>
        </div>
        {fTest && (
          <div className="result">
            <table className="demo-table">
              <thead>
                <tr><th></th><th>df</th><th>SS</th><th>MS</th><th>F</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Regression</strong></td><td>{fTest.dfReg}</td><td>{fSSR.toFixed(1)}</td><td>{fTest.msr.toFixed(2)}</td><td><strong>{fTest.fStat.toFixed(4)}</strong></td></tr>
                <tr><td><strong>Residual</strong></td><td>{fTest.dfRes}</td><td>{fSSE.toFixed(1)}</td><td>{fTest.mse.toFixed(2)}</td><td></td></tr>
                <tr><td><strong>Total</strong></td><td>{fTest.dfReg + fTest.dfRes}</td><td>{fTest.sst.toFixed(1)}</td><td></td><td></td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: '0.5rem' }}>
              <InlineMath math={`F = \\frac{${fTest.msr.toFixed(1)}}{${fTest.mse.toFixed(1)}} = ${fTest.fStat.toFixed(4)}`} />
            </p>
            <p>{fTest.fStat > 4 ? <span style={{ color: 'var(--success)' }}>Large F → likely reject H₀ → model is jointly significant</span> : <span style={{ color: 'var(--warning)' }}>Small F → may not reject H₀</span>}</p>
          </div>
        )}
      </div>

      <div className="demo-box">
        <h3>Demo 2: t-Test for Individual Significance</h3>
        <p>Enter a coefficient and its standard error to test individual significance.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Variable name</label>
            <input type="text" value={tVarName} onChange={e => setTVarName(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Coefficient (<InlineMath math="b_j" />)</label>
            <input type="number" step="0.001" value={tCoeff} onChange={e => setTCoeff(parseNum(e.target.value, 0))} />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>Standard Error (<InlineMath math="SE(b_j)" />)</label>
            <input type="number" step="0.001" min="0.001" value={tSE} onChange={e => setTSE(parseNum(e.target.value, 0.001))} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\alpha" /> (significance level)</label>
            <select value={tAlpha} onChange={e => setTAlpha(parseFloat(e.target.value))}>
              <option value={0.10}>0.10</option>
              <option value={0.05}>0.05</option>
              <option value={0.01}>0.01</option>
            </select>
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" min="4" value={tN} onChange={e => setTN(parseNum(e.target.value, 4))} />
          </div>
          <div className="input-group">
            <label><InlineMath math="k" /> (predictors)</label>
            <input type="number" min="1" value={tK} onChange={e => setTK(parseNum(e.target.value, 1))} />
          </div>
        </div>
        {tTest && (
          <div className="result">
            <p><InlineMath math={`t = \\frac{${tCoeff}}{${tSE}} = ${tTest.tStat.toFixed(4)}`} /> &nbsp;|&nbsp; df = {tTest.df}</p>
            <p>p-value ≈ {tTest.pValue < 0.0001 ? '< 0.0001' : tTest.pValue.toFixed(4)}</p>
            {tTest.pValue < tAlpha ? (
              <p style={{ color: 'var(--success)' }}>
                <strong>Reject H₀</strong> — {tVarName} is statistically significant at α = {tAlpha}. It has a meaningful influence on the response.
              </p>
            ) : (
              <p style={{ color: 'var(--warning)' }}>
                <strong>Do not reject H₀</strong> — {tVarName} is not statistically significant at α = {tAlpha}. No evidence it influences the response (after controlling for other predictors).
              </p>
            )}
          </div>
        )}
      </div>

      <div className="demo-box">
        <h3>Demo 3: Confidence Interval Significance Check</h3>
        <p>Enter the 95% CI bounds for a coefficient. If the interval contains 0, the predictor is not significant at 5%.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Lower 95%</label>
            <input type="number" step="0.01" value={ciLower} onChange={e => setCiLower(parseNum(e.target.value, 0))} />
          </div>
          <div className="input-group">
            <label>Upper 95%</label>
            <input type="number" step="0.01" value={ciUpper} onChange={e => setCiUpper(parseNum(e.target.value, 0))} />
          </div>
        </div>
        <div className="result">
          <div style={{ position: 'relative', height: '60px', margin: '1rem 0' }}>
            <div style={{ position: 'absolute', top: '28px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.2)' }} />
            {(() => {
              const range = Math.max(Math.abs(ciLower), Math.abs(ciUpper), 1) * 1.5;
              const pct = v => `${10 + ((v + range) / (2 * range)) * 80}%`;
              const zeroPct = pct(0);
              const lPct = pct(ciLower);
              const uPct = pct(ciUpper);
              return (
                <>
                  <div style={{ position: 'absolute', top: '20px', left: zeroPct, width: '2px', height: '20px', background: '#f7768e' }} />
                  <div style={{ position: 'absolute', top: '12px', left: zeroPct, transform: 'translateX(-50%)', color: '#f7768e', fontSize: '11px', fontWeight: 600 }}>0</div>
                  <div style={{ position: 'absolute', top: '24px', left: lPct, right: `calc(100% - ${uPct})`, height: '10px', background: ciContainsZero ? 'rgba(247,118,142,0.4)' : 'rgba(158,206,106,0.4)', borderRadius: '4px' }} />
                  <div style={{ position: 'absolute', top: '44px', left: lPct, transform: 'translateX(-50%)', color: '#b8add9', fontSize: '11px' }}>{ciLower}</div>
                  <div style={{ position: 'absolute', top: '44px', left: uPct, transform: 'translateX(-50%)', color: '#b8add9', fontSize: '11px' }}>{ciUpper}</div>
                </>
              );
            })()}
          </div>
          {ciContainsZero ? (
            <p style={{ color: 'var(--warning)' }}>
              <strong>Contains 0</strong> → Do not reject H₀ → predictor is <strong>not significant</strong> at 5%.
            </p>
          ) : (
            <p style={{ color: 'var(--success)' }}>
              <strong>Does not contain 0</strong> → Reject H₀ → predictor is <strong>significant</strong> at 5%.
            </p>
          )}
        </div>
      </div>

      <div className="demo-box">
        <h3>Demo 4: Full ANOVA Table Builder</h3>
        <p>Enter values to build a complete ANOVA table with all regression statistics.</p>
        <div className="input-row">
          <div className="input-group">
            <label>SSR</label>
            <input type="number" min="0" value={aSSR} onChange={e => setASSR(parseNum(e.target.value, 0))} />
          </div>
          <div className="input-group">
            <label>SSE</label>
            <input type="number" min="0" value={aSSE} onChange={e => setASSE(parseNum(e.target.value, 0))} />
          </div>
          <div className="input-group">
            <label><InlineMath math="k" /></label>
            <input type="number" min="1" value={aK} onChange={e => setAK(parseNum(e.target.value, 1))} />
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" min="4" value={aN} onChange={e => setAN(parseNum(e.target.value, 4))} />
          </div>
        </div>
        {anova && (
          <div className="result">
            <table className="demo-table">
              <thead>
                <tr><th></th><th>df</th><th>SS</th><th>MS</th><th>F</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Regression</strong></td><td>{anova.dfReg}</td><td>{aSSR.toFixed(1)}</td><td>{anova.msr.toFixed(2)}</td><td>{anova.fStat.toFixed(4)}</td></tr>
                <tr><td><strong>Residual</strong></td><td>{anova.dfRes}</td><td>{aSSE.toFixed(1)}</td><td>{anova.mse.toFixed(2)}</td><td></td></tr>
                <tr><td><strong>Total</strong></td><td>{anova.dfTot}</td><td>{anova.sst.toFixed(1)}</td><td></td><td></td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <p><InlineMath math={`R^2 = ${anova.r2.toFixed(4)}`} /></p>
              <p><InlineMath math={`\\bar{R}^2 = ${anova.adjR2.toFixed(4)}`} /></p>
              <p><InlineMath math={`S_e = ${anova.se.toFixed(4)}`} /></p>
              <p>Observations: {aN}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
