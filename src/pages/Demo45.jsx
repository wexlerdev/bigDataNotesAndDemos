import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { normCDF, normPdf, simpleZForPct } from '../utils/math';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function Demo45() {
  const [mu, setMu] = useState(72);
  const [sig, setSig] = useState(8);
  const [a, setA] = useState(68);
  const [b, setB] = useState(84);
  const [xVal, setXVal] = useState(60);
  const [pct, setPct] = useState(90);
  const [muRule, setMuRule] = useState(72);
  const [sigRule, setSigRule] = useState(8);

  const ruleCanvasRef = useRef(null);

  // Normal curve probabilities
  const prob = useMemo(() => {
    const za = (a - mu) / sig;
    const zb = (b - mu) / sig;
    return normCDF(zb) - normCDF(za);
  }, [mu, sig, a, b]);

  // Z-score & percentile
  const zScore = (xVal - mu) / sig;
  const cdfVal = normCDF(zScore);
  const zPct = simpleZForPct(pct);
  const xPct = mu + zPct * sig;

  // Normal curve chart data
  const normData = useMemo(() => {
    const xs = [];
    const ys = [];
    for (let i = mu - 4 * sig; i <= mu + 4 * sig; i += sig / 5) {
      xs.push(i.toFixed(1));
      ys.push(normPdf(i, mu, sig));
    }
    return {
      labels: xs,
      datasets: [{
        label: 'N(μ,σ²)',
        data: ys,
        fill: true,
        tension: 0.3,
        backgroundColor: 'rgba(196,181,253,0.1)',
        borderColor: 'rgb(196,181,253)',
        pointRadius: 0,
      }]
    };
  }, [mu, sig]);

  // 68-95-99.7 rule
  const p68 = normCDF(1) - normCDF(-1);
  const p95 = normCDF(2) - normCDF(-2);
  const p997 = normCDF(3) - normCDF(-3);

  // Draw rule chart on canvas
  useEffect(() => {
    const canvas = ruleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 30, t: 20, b: 40 };
    const xMin = muRule - 4 * sigRule, xMax = muRule + 4 * sigRule;
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;

    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, w, h);

    const x2px = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const maxPdf = normPdf(muRule, muRule, sigRule) * 1.05;
    const y2py = y => pad.t + plotH - (y / maxPdf) * plotH;

    // Shaded bands
    const bands = [
      { lo: muRule - 3 * sigRule, hi: muRule + 3 * sigRule, color: 'rgba(196,181,253,0.15)' },
      { lo: muRule - 2 * sigRule, hi: muRule + 2 * sigRule, color: 'rgba(196,181,253,0.25)' },
      { lo: muRule - sigRule, hi: muRule + sigRule, color: 'rgba(196,181,253,0.4)' }
    ];
    bands.forEach(band => {
      ctx.beginPath();
      for (let x = band.lo; x <= band.hi; x += sigRule / 20) {
        ctx.lineTo(x2px(x), y2py(normPdf(x, muRule, sigRule)));
      }
      ctx.lineTo(x2px(band.hi), pad.t + plotH);
      ctx.lineTo(x2px(band.lo), pad.t + plotH);
      ctx.closePath();
      ctx.fillStyle = band.color;
      ctx.fill();
    });

    // Curve
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(196,181,253)';
    ctx.lineWidth = 2;
    for (let x = xMin; x <= xMax; x += sigRule / 15) {
      ctx.lineTo(x2px(x), y2py(normPdf(x, muRule, sigRule)));
    }
    ctx.stroke();

    // Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();

    ctx.fillStyle = '#b8add9';
    ctx.font = '11px sans-serif';
    ctx.fillText('x', w - pad.r - 15, h - 5);
    [-2, -1, 0, 1, 2].forEach(z => {
      const x = muRule + z * sigRule;
      ctx.fillText(z ? `μ${z > 0 ? '+' : ''}${z}σ` : 'μ', x2px(x) - 15, h - 8);
    });
  }, [muRule, sigRule]);

  const lineOpts = { responsive: true, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } }, elements: { point: { radius: 0 } } };

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.5: Normal Distribution</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Use the normal curve for probabilities and percentiles</li>
          <li>Transform with z-scores: <InlineMath math="z = (x - \mu)/\sigma" /></li>
          <li>Apply the 68–95–99.7 rule (μ±σ, μ±2σ, μ±3σ)</li>
        </ul>
        <p><strong>When to use:</strong> Many measurements (scores, heights, weights) are approximately normal. Also underpins inference: sample means and proportions become normal via CLT.</p>
        <p><strong>Prerequisites:</strong> <Link to="/4.3">4.3</Link> — mean and standard deviation.</p>
      </div>

      <div className="content-section">
        <h2>Overview</h2>
        <p>Bell-shaped, symmetric about <InlineMath math="\mu" />. Described by mean <InlineMath math="\mu" /> and standard deviation <InlineMath math="\sigma" />. Probabilities = area under the curve.</p>
      </div>

      <div className="content-section">
        <h2>Z-Score &amp; Standard Normal</h2>
        <p>Transform to standard normal: <InlineMath math="z = (x - \mu)/\sigma" />. Inverse: <InlineMath math="x = \mu + z\sigma" /> for percentiles.</p>
      </div>

      <div className="content-section">
        <h2>Management Exam Example</h2>
        <p><strong>Story:</strong> Management aptitude scores are normally distributed with <InlineMath math="\mu=72" />, <InlineMath math="\sigma=8" />. <InlineMath math="P(X>60)=0.9332" />, <InlineMath math="P(68 \leq X \leq 84)=0.6247" />. 90th percentile ≈ 82.25.</p>
      </div>

      <h2>Interactive Demo</h2>
      <div className="demo-box">
        <h3>Normal Curve — Probabilities</h3>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="\mu" /></label>
            <input type="number" value={mu} onChange={e => setMu(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\sigma" /></label>
            <input type="number" value={sig} min="0.1" onChange={e => setSig(parseFloat(e.target.value) || 1)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="a" /> (lower bound)</label>
            <input type="number" value={a} onChange={e => setA(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="b" /> (upper bound)</label>
            <input type="number" value={b} onChange={e => setB(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result"><InlineMath math="P(a \leq X \leq b)" /> = <span className="value">{prob.toFixed(4)}</span></div>
      </div>

      <div className="demo-box">
        <h3>68–95–99.7 Rule</h3>
        <p>About 68% of values fall within <InlineMath math="\mu \pm \sigma" />, 95% within <InlineMath math="\mu \pm 2\sigma" />, and 99.7% within <InlineMath math="\mu \pm 3\sigma" />.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="\mu" /></label>
            <input type="number" value={muRule} onChange={e => setMuRule(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\sigma" /></label>
            <input type="number" value={sigRule} min="0.1" onChange={e => setSigRule(parseFloat(e.target.value) || 1)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="P(\mu - \sigma \leq X \leq \mu + \sigma)" /> ≈ <span className="value">{p68.toFixed(3)}</span> (68%)<br />
          <InlineMath math="P(\mu - 2\sigma \leq X \leq \mu + 2\sigma)" /> ≈ <span className="value">{p95.toFixed(3)}</span> (95%)<br />
          <InlineMath math="P(\mu - 3\sigma \leq X \leq \mu + 3\sigma)" /> ≈ <span className="value">{p997.toFixed(3)}</span> (99.7%)
        </div>
        <canvas ref={ruleCanvasRef} width={600} height={220} />
      </div>

      <div className="demo-box">
        <h3>Z-Score &amp; Percentile</h3>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="x" /> (for z-score and <InlineMath math="P(X \leq x)" />)</label>
            <input type="number" value={xVal} onChange={e => setXVal(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Percentile (e.g. 90 → find <InlineMath math="x" /> where <InlineMath math="P(X<x)=0.9" />)</label>
            <input type="number" value={pct} min="1" max="99" onChange={e => setPct(parseFloat(e.target.value) || 50)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="z = (x-\mu)/\sigma" /> = {zScore.toFixed(2)}<br />
          <InlineMath math="P(X \leq x)" /> = {cdfVal.toFixed(4)}<br />
          {pct}th percentile <InlineMath math="x" /> ≈ {xPct.toFixed(2)}
        </div>
      </div>

      <div className="demo-box">
        <Line data={normData} options={lineOpts} />
      </div>
    </main>
  );
}
