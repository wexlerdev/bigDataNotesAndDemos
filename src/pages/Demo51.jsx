import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { linReg } from '../utils/math';

function generateData(noise, seed) {
  const rng = seedRng(seed);
  const trueB0 = 2, trueB1 = 1.5;
  const xs = [], ys = [];
  for (let i = 0; i < 40; i++) {
    const x = 1 + rng() * 8;
    const y = trueB0 + trueB1 * x + (rng() - 0.5) * 2 * noise;
    xs.push(x);
    ys.push(y);
  }
  return { xs, ys };
}

function seedRng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export default function Demo51() {
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

    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, w, h);

    const xMin = 0, xMax = 10, yMin = -2, yMax = 20;
    const x2px = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const y2py = y => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#b8add9';
    ctx.font = '11px sans-serif';
    for (let x = 0; x <= 10; x += 2) {
      ctx.fillText(x, x2px(x) - 4, h - pad.b + 15);
    }
    for (let y = 0; y <= 18; y += 4) {
      ctx.fillText(y, pad.l - 25, y2py(y) + 4);
    }

    // Points
    ctx.fillStyle = 'rgba(196,181,253,0.7)';
    data.xs.forEach((x, i) => {
      const px = x2px(x), py = y2py(data.ys[i]);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Fitted line
    ctx.strokeStyle = '#f5d547';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x2px(xMin), y2py(reg.b0 + reg.b1 * xMin));
    ctx.lineTo(x2px(xMax), y2py(reg.b0 + reg.b1 * xMax));
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#e6e0ff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`ŷ = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`, pad.l + 10, pad.t + 15);
  }, [data, reg]);

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.1.1: Introduction to Regression</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>What regression analysis does — modeling relationships between variables</li>
          <li>Distinction between simple and multiple regression</li>
          <li>Deterministic vs stochastic models</li>
          <li>Variable types: response, predictor, numerical, categorical</li>
        </ul>
        <p><strong>When to use:</strong> You want to model, explain, or predict the value of one variable based on one or more other variables.</p>
        <p><strong>Prerequisites:</strong> Basic statistics (mean, variance). Helpful: <Link to="/4.5">4.5</Link> Normal Distribution.</p>
      </div>

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
        <p>A <strong>deterministic</strong> model has no error term — given <InlineMath math="x" />, the value of <InlineMath math="y" /> is exactly determined. Example: <InlineMath math="y = 2 + 3x" />.</p>
        <p>A <strong>stochastic</strong> model includes a random error <InlineMath math="\varepsilon" /> — the same <InlineMath math="x" /> can produce different <InlineMath math="y" /> values. Real-world data is stochastic.</p>
        <BlockMath math="y = \beta_0 + \beta_1 x + \varepsilon" />
        <p>The error <InlineMath math="\varepsilon" /> captures all influences on <InlineMath math="y" /> not explained by the predictor(s).</p>
      </div>

      <div className="content-section">
        <h2>Variable Types</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Term</th><th>Also Called</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Response variable</strong></td><td>dependent, <InlineMath math="y" /></td><td>The outcome we want to explain/predict</td></tr>
            <tr><td><strong>Predictor variable</strong></td><td>independent, <InlineMath math="x" /></td><td>The variable(s) used to explain the response</td></tr>
            <tr><td><strong>Numerical</strong></td><td>quantitative</td><td>Takes numeric values (age, income, temperature)</td></tr>
            <tr><td><strong>Categorical</strong></td><td>qualitative</td><td>Takes category labels (city/suburb, yes/no)</td></tr>
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Interactive Demo</h2>

      <div className="demo-box">
        <h3>Deterministic vs Stochastic Scatter</h3>
        <p>Slide noise <InlineMath math="\varepsilon" /> to zero for a perfect deterministic line. Increase it to see stochastic scatter. The fitted line adapts, but the underlying relationship <InlineMath math="y \approx 2 + 1.5x" /> remains.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Noise (<InlineMath math="\varepsilon" /> magnitude): {noise.toFixed(1)}</label>
            <input type="range" min="0" max="6" step="0.2" value={noise} onChange={e => setNoise(parseFloat(e.target.value))} />
          </div>
          <div className="input-group">
            <button ref={btnRef} onClick={regenerate} style={{ padding: '0.4rem 1rem', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>
              Regenerate Data
            </button>
          </div>
        </div>
        <div className="result">
          Fitted: <InlineMath math={`\\hat{y} = ${reg.b0.toFixed(2)} + ${reg.b1.toFixed(2)}x`} /> &nbsp;|&nbsp;
          <InlineMath math={`R^2 = ${reg.r2.toFixed(3)}`} />
          {noise === 0 && <> — <strong style={{ color: 'var(--success)' }}>Perfect deterministic fit!</strong></>}
        </div>
        <canvas ref={canvasRef} width={550} height={300} style={{ maxWidth: '100%' }} />
      </div>
    </main>
  );
}
