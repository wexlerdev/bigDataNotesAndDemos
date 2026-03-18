import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { binomPmf, binomCdf, poisPmf, poisCdf } from '../utils/math';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Demo44() {
  const [bn, setBn] = useState(5);
  const [bp, setBp] = useState(0.30);
  const [bx, setBx] = useState(2);

  const binomResult = useMemo(() => {
    const n = Math.floor(bn);
    const mean = n * bp;
    const varX = n * bp * (1 - bp);
    const pmf = binomPmf(n, bp, bx);
    const cdf = binomCdf(n, bp, bx);
    const sf = 1 - binomCdf(n, bp, bx - 1);
    const data = [];
    for (let k = 0; k <= n; k++) data.push(binomPmf(n, bp, k));
    return { mean, varX, pmf, cdf, sf, data, labels: Array.from({ length: n + 1 }, (_, i) => i) };
  }, [bn, bp, bx]);

  const [pmu, setPmu] = useState(3);
  const [px, setPx] = useState(5);

  const poisResult = useMemo(() => {
    const maxX = Math.min(30, Math.ceil(pmu + 4 * Math.sqrt(pmu)));
    const pmf = poisPmf(pmu, px);
    const cdf = poisCdf(pmu, px);
    const data = [];
    const labels = [];
    for (let k = 0; k <= maxX; k++) { data.push(poisPmf(pmu, k)); labels.push(k); }
    return { pmf, cdf, data, labels };
  }, [pmu, px]);

  const chartOpts = { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } };

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.4: Binomial and Poisson Distributions</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li><strong>Binomial:</strong> Count successes in <InlineMath math="n" /> independent trials (each with probability <InlineMath math="p" />)</li>
          <li><strong>Poisson:</strong> Count events in a fixed interval (rate <InlineMath math="\mu" /> per interval)</li>
        </ul>
        <p><strong>When to use:</strong> Binomial — web feature reactions, Facebook users in sample, defect counts. Poisson — Starbucks visits, EV charging stations opening, arrivals per hour.</p>
        <p><strong>Prerequisites:</strong> <Link to="/4.3">4.3</Link> — discrete random variables, expected value.</p>
      </div>

      <div className="content-section">
        <h2>Binomial Distribution</h2>
        <p>A <strong>Bernoulli process</strong> has <InlineMath math="n" /> independent trials, each with success probability <InlineMath math="p" />. <InlineMath math="X" /> = number of successes.</p>
        <div className="formula"><BlockMath math="P(X=x) = \binom{n}{x} p^x (1-p)^{n-x}, \quad E(X)=np, \quad \text{Var}(X)=np(1-p)" /></div>
      </div>

      <div className="content-section">
        <h2>Poisson Distribution</h2>
        <p>Counts events in a fixed interval. <InlineMath math="\mu" /> = mean number in interval.</p>
        <div className="formula"><BlockMath math="P(X=x) = \frac{e^{-\mu} \mu^x}{x!}" /></div>
      </div>

      <div className="content-section">
        <h2>Binomial vs Poisson</h2>
        <p><strong>Binomial:</strong> <InlineMath math="n" /> fixed trials, count successes. <strong>Poisson:</strong> Count events in a fixed interval—no fixed "n".</p>
      </div>

      <h2>Interactive Demo: Binomial</h2>
      <div className="demo-box">
        <p><strong>Example presets:</strong> Web features (<InlineMath math="n=5" />, <InlineMath math="p=0.30" />) — 30% react positively.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" value={bn} min="1" max="50" onChange={e => setBn(parseInt(e.target.value) || 1)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="p" /></label>
            <input type="number" value={bp} min="0" max="1" step="0.01" onChange={e => setBp(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="x" /> (for P(X=x), P(X≤x), P(X≥x))</label>
            <input type="number" value={bx} min="0" max="50" onChange={e => setBx(parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="E(X)" /> = {binomResult.mean.toFixed(1)}, <InlineMath math="\text{Var}(X)" /> = {binomResult.varX.toFixed(2)}<br />
          <InlineMath math="P(X=x)" /> = {binomResult.pmf.toFixed(4)}, <InlineMath math="P(X \le x)" /> = {binomResult.cdf.toFixed(4)}, <InlineMath math="P(X \ge x)" /> = {binomResult.sf.toFixed(4)}
        </div>
        <Bar data={{ labels: binomResult.labels, datasets: [{ label: 'P(X=x)', data: binomResult.data, backgroundColor: 'rgba(245,213,71,0.7)' }] }} options={chartOpts} />
      </div>

      <h2>Interactive Demo: Poisson</h2>
      <div className="demo-box">
        <p><strong>Example presets:</strong> Starbucks—18 visits/month ⇒ <InlineMath math="\mu=3" /> in 5 days.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="\mu" /></label>
            <input type="number" value={pmu} min="0.1" max="20" step="0.1" onChange={e => setPmu(parseFloat(e.target.value) || 0.1)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="x" /></label>
            <input type="number" value={px} min="0" max="30" onChange={e => setPx(parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="P(X=x)" /> = {poisResult.pmf.toFixed(4)}, <InlineMath math="P(X \le x)" /> = {poisResult.cdf.toFixed(4)}
        </div>
        <Bar data={{ labels: poisResult.labels, datasets: [{ label: 'P(X=x)', data: poisResult.data, backgroundColor: 'rgba(196,181,253,0.7)' }] }} options={chartOpts} />
      </div>
    </main>
  );
}
