import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { linReg, parseNum } from '../utils/math';


const defaultData = [
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 4 },
  { x: 4, y: 7 },
  { x: 5, y: 8 },
  { x: 6, y: 9 },
];

export default function Demo52() {
  const [rows, setRows] = useState(defaultData);
  const [view, setView] = useState('ols'); // 'ols' | 'residuals'
  const canvasRef = useRef(null);
  const resultRef = useRef(null);

  const updateRow = (i, field, val) => {
    setRows(prev => prev.map((r, j) => j === i ? { ...r, [field]: parseNum(val, r[field]) } : r));
  };
  const addRow = () => setRows(prev => [...prev, { x: prev.length + 1, y: 0 }]);
  const removeRow = i => { if (rows.length > 2) setRows(prev => prev.filter((_, j) => j !== i)); };

  const xs = rows.map(r => r.x);
  const ys = rows.map(r => r.y);
  const reg = useMemo(() => linReg(xs, ys), [JSON.stringify(rows)]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;

    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, w, h);

    const xMin = Math.min(...xs) - 1, xMax = Math.max(...xs) + 1;
    const yMin = Math.min(...ys, ...reg.yhat) - 1, yMax = Math.max(...ys, ...reg.yhat) + 1;
    const x2px = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const y2py = y => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();

    // Fitted line
    ctx.strokeStyle = '#f5d547';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x2px(xMin), y2py(reg.b0 + reg.b1 * xMin));
    ctx.lineTo(x2px(xMax), y2py(reg.b0 + reg.b1 * xMax));
    ctx.stroke();

    // Residual lines (if residual view)
    if (view === 'residuals') {
      ctx.strokeStyle = 'rgba(247, 118, 142, 0.7)';
      ctx.lineWidth = 1.5;
      xs.forEach((x, i) => {
        ctx.beginPath();
        ctx.moveTo(x2px(x), y2py(ys[i]));
        ctx.lineTo(x2px(x), y2py(reg.yhat[i]));
        ctx.stroke();
      });
    }

    // Points
    ctx.fillStyle = 'rgba(196,181,253,0.8)';
    xs.forEach((x, i) => {
      ctx.beginPath();
      ctx.arc(x2px(x), y2py(ys[i]), 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#e6e0ff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`ŷ = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`, pad.l + 10, pad.t + 15);
  }, [rows, view, reg]);

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.1.2: The Regression Equation &amp; OLS</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Distinguish population parameters (<InlineMath math="\beta_0, \beta_1" />) from sample estimates (<InlineMath math="b_0, b_1" />)</li>
          <li>How Ordinary Least Squares (OLS) minimizes the sum of squared errors</li>
          <li>The formulas for slope and intercept</li>
        </ul>
        <p><strong>When to use:</strong> You have sample data and want to estimate the best-fitting line.</p>
        <p><strong>Prerequisites:</strong> <Link to="/5.1.1">5.1.1</Link> — regression basics.</p>
      </div>

      <div className="content-section">
        <h2>Population Parameters vs Sample Estimates</h2>
        <p>The <strong>population regression equation</strong> uses Greek letters:</p>
        <BlockMath math="E(y) = \beta_0 + \beta_1 x" />
        <p>We never know <InlineMath math="\beta_0" /> and <InlineMath math="\beta_1" /> exactly. From a sample, we compute estimates <InlineMath math="b_0" /> and <InlineMath math="b_1" />:</p>
        <BlockMath math="\hat{y} = b_0 + b_1 x" />
      </div>

      <div className="content-section">
        <h2>How OLS Works</h2>
        <p>OLS finds <InlineMath math="b_0" /> and <InlineMath math="b_1" /> that <strong>minimize the sum of squared errors</strong>:</p>
        <BlockMath math="SSE = \sum_{i=1}^{n}(y_i - \hat{y}_i)^2" />
        <p>The formulas:</p>
        <BlockMath math="b_1 = \frac{s_{xy}}{s_x^2} = \frac{\sum(x_i - \bar{x})(y_i - \bar{y})}{\sum(x_i - \bar{x})^2}" />
        <BlockMath math="b_0 = \bar{y} - b_1 \bar{x}" />
      </div>

      <div className="content-section">
        <h2>Equation Components</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Symbol</th><th>Name</th><th>Definition</th></tr>
          </thead>
          <tbody>
            <tr><td><InlineMath math="\beta_0, \beta_1" /></td><td>Population parameters</td><td>True (unknown) intercept &amp; slope</td></tr>
            <tr><td><InlineMath math="b_0, b_1" /></td><td>Sample estimates</td><td>Computed from data via OLS</td></tr>
            <tr><td><InlineMath math="\varepsilon" /></td><td>Population error</td><td>True random disturbance</td></tr>
            <tr><td><InlineMath math="e = y - \hat{y}" /></td><td>Residual</td><td>Observed minus predicted (sample error)</td></tr>
            <tr><td><InlineMath math="\hat{y}" /></td><td>Predicted value</td><td><InlineMath math="b_0 + b_1 x" /></td></tr>
            <tr><td><InlineMath math="s_{xy}" /></td><td>Cross-deviation</td><td><InlineMath math="\sum(x_i-\bar{x})(y_i-\bar{y})" /></td></tr>
            <tr><td><InlineMath math="s_x^2" /></td><td>x-deviation squared</td><td><InlineMath math="\sum(x_i-\bar{x})^2" /></td></tr>
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Interactive Demos</h2>

      <div className="demo-box">
        <h3>Demo 1: OLS Calculator</h3>
        <p>Edit the data points below. The regression equation and plot update live.</p>

        <table className="demo-table" style={{ marginBottom: '1rem' }}>
          <thead>
            <tr><th>#</th><th>x</th><th>y</th><th></th></tr>
          </thead>
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

        <div className="result" ref={resultRef}>
          <InlineMath math={`\\bar{x} = ${reg.xbar.toFixed(2)}`} />, <InlineMath math={`\\bar{y} = ${reg.ybar.toFixed(2)}`} /><br />
          <InlineMath math={`s_{xy} = ${reg.sxy.toFixed(2)}`} />, <InlineMath math={`s_x^2 = ${reg.sx2.toFixed(2)}`} /><br />
          <InlineMath math={`b_1 = ${reg.b1.toFixed(4)}`} />, <InlineMath math={`b_0 = ${reg.b0.toFixed(4)}`} /><br />
          <strong>Equation: <InlineMath math={`\\hat{y} = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`} /></strong>
        </div>
      </div>

      <div className="demo-box">
        <h3>Demo 2: Residual Viewer</h3>
        <p>Residuals <InlineMath math="e_i = y_i - \hat{y}_i" /> are the vertical distances from each point to the fitted line.</p>
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
              <thead>
                <tr><th>i</th><th><InlineMath math="x_i" /></th><th><InlineMath math="y_i" /></th><th><InlineMath math="\hat{y}_i" /></th><th><InlineMath math="e_i" /></th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.x.toFixed(1)}</td>
                    <td>{r.y.toFixed(1)}</td>
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
    </main>
  );
}
