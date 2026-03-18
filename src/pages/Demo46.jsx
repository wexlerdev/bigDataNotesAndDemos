import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { normCDF } from '../utils/math';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

function sampleOne(pop) {
  if (pop === 'uniform') return Math.random();
  if (pop === 'skewed') return Math.pow(Math.random(), 2);
  let s = 0;
  for (let j = 0; j < 12; j++) s += Math.random();
  return (s - 6) * 0.2 + 0.5;
}

function sampleFrom(pop, n) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(sampleOne(pop));
  return arr.reduce((a, b) => a + b, 0) / n;
}

export default function Demo46() {
  const [sigma, setSigma] = useState(0.8);
  const [nSe, setNSe] = useState(4);
  const [popShape, setPopShape] = useState('uniform');
  const [nClt, setNClt] = useState(5);
  const [numSamples, setNumSamples] = useState(5000);
  const [cltResult, setCltResult] = useState(null);
  const [cltChartData, setCltChartData] = useState(null);
  const [pProp, setPProp] = useState(0.55);
  const [nProp, setNProp] = useState(100);
  const [kProp, setKProp] = useState(0.57);

  const seVal = sigma / Math.sqrt(nSe);

  const propResult = useMemo(() => {
    const se = Math.sqrt(pProp * (1 - pProp) / nProp);
    const z = (kProp - pProp) / se;
    const prob = 1 - normCDF(z);
    return { se, prob };
  }, [pProp, nProp, kProp]);

  const btnRef = useRef(null);

  function runClt() {
    const means = [];
    for (let i = 0; i < numSamples; i++) means.push(sampleFrom(popShape, nClt));
    const avg = means.reduce((a, b) => a + b, 0) / numSamples;
    const variance = means.reduce((a, b) => a + b * b, 0) / numSamples - avg * avg;
    const sd = Math.sqrt(variance);
    const popSigma = popShape === 'uniform' ? Math.sqrt(1 / 12) : popShape === 'skewed' ? Math.sqrt(4 / 45) : 0.2;
    const se = popSigma / Math.sqrt(nClt);
    setCltResult({ avg, sd, se });

    const bins = 30;
    const min = Math.min(...means);
    const max = Math.max(...means);
    const counts = Array(bins).fill(0);
    means.forEach(m => {
      const idx = Math.min(bins - 1, Math.floor((m - min) / (max - min + 1e-9) * bins));
      counts[idx]++;
    });
    const labels = Array.from({ length: bins }, (_, i) => (min + (max - min) * (i + 0.5) / bins).toFixed(2));
    setCltChartData({ labels, datasets: [{ label: 'Count', data: counts, backgroundColor: 'rgba(196,181,253,0.7)' }] });
  }

  const chartOpts = { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } };

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.6: Sampling Distributions</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Distinguish population (parameter <InlineMath math="\mu" />) from sample (statistic <InlineMath math="\bar{X}" />)</li>
          <li>Understand how <InlineMath math="\bar{X}" /> and <InlineMath math="\hat{P}" /> vary across samples—the sampling distribution</li>
          <li>Apply the Central Limit Theorem: averages become normal as <InlineMath math="n" /> increases</li>
        </ul>
        <p><strong>When to use:</strong> Bridge from probability to inference. Before computing CIs or p-values, we need the distribution of our estimator.</p>
        <p><strong>Prerequisites:</strong> <Link to="/4.5">4.5</Link> — normal distribution, z-scores.</p>
      </div>

      <div className="content-section">
        <h2>Population vs Sample</h2>
        <p><strong>Population</strong> parameter (e.g., <InlineMath math="\mu" />) is a constant. <strong>Sample</strong> statistic (e.g., <InlineMath math="\bar{X}" />) varies with each random sample.</p>
      </div>

      <div className="content-section">
        <h2>Sampling Distribution of <InlineMath math="\bar{X}" /></h2>
        <div className="formula"><BlockMath math="E(\bar{X}) = \mu, \quad \text{Var}(\bar{X}) = \frac{\sigma^2}{n}, \quad \text{se}(\bar{X}) = \frac{\sigma}{\sqrt{n}}" /></div>
      </div>

      <div className="content-section">
        <h2>Central Limit Theorem</h2>
        <p>The sum or average of many independent observations is approximately normal. Rule of thumb: <InlineMath math="n \geq 30" />.</p>
        <div className="formula"><BlockMath math="z = \frac{\bar{x} - \mu}{\sigma/\sqrt{n}}" /></div>
      </div>

      <div className="content-section">
        <h2>Sampling Distribution of <InlineMath math="\hat{P}" /></h2>
        <div className="formula"><BlockMath math="E(\hat{P}) = p, \quad \text{se}(\hat{P}) = \sqrt{\frac{p(1-p)}{n}}" /></div>
        <p>Approximately normal when <InlineMath math="np \geq 5" /> and <InlineMath math="n(1-p) \geq 5" />.</p>
      </div>

      <h2>Interactive Demos</h2>

      <div className="demo-box">
        <h3>Standard Error of <InlineMath math="\bar{X}" /> — Pizza Example</h3>
        <p><strong>Story:</strong> Pizza diameters: <InlineMath math="\mu=16" /> in, <InlineMath math="\sigma=0.8" /> in. Averaging more pizzas reduces variability.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="\sigma" /></label>
            <input type="number" value={sigma} min="0.1" step="0.1" onChange={e => setSigma(parseFloat(e.target.value) || 0.1)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" value={nSe} min="1" max="100" onChange={e => setNSe(parseInt(e.target.value) || 1)} />
          </div>
        </div>
        <div className="result"><InlineMath math="\text{se}(\bar{X}) = \sigma/\sqrt{n}" /> = {seVal.toFixed(4)}</div>
      </div>

      <div className="demo-box">
        <h3>CLT Simulation</h3>
        <p>Draw many samples of size <InlineMath math="n" />, compute <InlineMath math="\bar{X}" /> each time. Even with a skewed or uniform population, the sampling distribution of <InlineMath math="\bar{X}" /> becomes normal as <InlineMath math="n" /> grows.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Population shape</label>
            <select value={popShape} onChange={e => setPopShape(e.target.value)}>
              <option value="uniform">Uniform</option>
              <option value="skewed">Skewed</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /> (sample size)</label>
            <input type="number" value={nClt} min="2" max="50" onChange={e => setNClt(parseInt(e.target.value) || 2)} />
          </div>
          <div className="input-group">
            <label>Number of samples</label>
            <input type="number" value={numSamples} min="500" max="20000" step="500" onChange={e => setNumSamples(parseInt(e.target.value) || 500)} />
          </div>
        </div>
        <button ref={btnRef} onClick={runClt}>Run simulation</button>
        <div className="result">
          Sample mean of <InlineMath math="\bar{X}" />s ≈ {cltResult ? cltResult.avg.toFixed(4) : '—'}, SD of <InlineMath math="\bar{X}" />s ≈ {cltResult ? cltResult.sd.toFixed(4) : '—'}, <InlineMath math="\sigma/\sqrt{n}" /> = {cltResult ? cltResult.se.toFixed(4) : '—'}
        </div>
        {cltChartData && <Bar data={cltChartData} options={chartOpts} />}
      </div>

      <div className="demo-box">
        <h3>Sample Proportion — Cyber-Attacks Example</h3>
        <p>55% of firms had cyber-attack (<InlineMath math="p=0.55" />), <InlineMath math="n=100" />. What is <InlineMath math="P(\hat{P} > 0.57)" />?</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="p" /></label>
            <input type="number" value={pProp} min="0.01" max="0.99" step="0.01" onChange={e => setPProp(parseFloat(e.target.value) || 0.01)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" value={nProp} min="5" onChange={e => setNProp(parseInt(e.target.value) || 5)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(\hat{P} > k)" />, <InlineMath math="k" /></label>
            <input type="number" value={kProp} min="0" max="1" step="0.01" onChange={e => setKProp(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="\text{se}(\hat{P})" /> = {propResult.se.toFixed(4)}<br />
          <InlineMath math="P(\hat{P} > k)" /> = {propResult.prob.toFixed(4)}
        </div>
      </div>
    </main>
  );
}
