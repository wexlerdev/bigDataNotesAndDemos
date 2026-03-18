import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { tQuantile } from '../utils/math';

const zVals = { 90: 1.645, 95: 1.96, 99: 2.576 };

export default function Demo47() {
  // CI for mean (sigma known)
  const [xbar, setXbar] = useState(1.02);
  const [sigma, setSigma] = useState(0.03);
  const [n, setN] = useState(25);
  const [conf, setConf] = useState(95);

  const ci = useMemo(() => {
    const z = zVals[conf] || 1.96;
    const moe = z * sigma / Math.sqrt(n);
    return { moe, low: xbar - moe, high: xbar + moe };
  }, [xbar, sigma, n, conf]);

  // Width factors
  const [nW, setNW] = useState(25);
  const [sigW, setSigW] = useState(0.03);
  const [confW, setConfW] = useState(95);
  const prevRef = useRef({ n: 25, w: 0.0235 });

  const width = useMemo(() => {
    const z = zVals[confW] || 1.96;
    const moe = z * sigW / Math.sqrt(nW);
    const w = 2 * moe;
    prevRef.current = { n: nW, w };
    return w;
  }, [nW, sigW, confW]);

  // t-based CI
  const [xBart, setXBart] = useState(106);
  const [st, setSt] = useState(15);
  const [nt, setNt] = useState(22);
  const [conft, setConft] = useState(95);

  const tci = useMemo(() => {
    const alpha = (100 - conft) / 100;
    const df = Math.max(1, nt - 1);
    const t = tQuantile(df, alpha / 2);
    const z = zVals[conft] || 1.96;
    const se = st / Math.sqrt(nt);
    const moe = t * se;
    const low = xBart - moe;
    const high = xBart + moe;
    const contains100 = 100 >= low && 100 <= high;
    return { df, t, z, low, high, contains100 };
  }, [xBart, st, nt, conft]);

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.7: Confidence Intervals</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Construct interval estimates: point estimate ± margin of error</li>
          <li>Use z when <InlineMath math="\sigma" /> is known, t when <InlineMath math="\sigma" /> is unknown</li>
          <li>Interpret: "We are 95% confident the true mean lies in this interval."</li>
        </ul>
        <p><strong>When to use:</strong> You have a sample and want to estimate a population parameter. CI answers "where might the true value be?"</p>
        <p><strong>Prerequisites:</strong> <Link to="/4.6">4.6</Link> — sampling distribution of <InlineMath math="\bar{X}" />.</p>
      </div>

      <div className="content-section">
        <h2>Overview</h2>
        <p>A <strong>confidence interval</strong> (CI) is an interval estimate: a range that, with a specified level of confidence, contains the population parameter. General form: <strong>point estimate ± margin of error</strong>.</p>
      </div>

      <div className="content-section">
        <h2>CI for Mean When <InlineMath math="\sigma" /> Is Known</h2>
        <div className="formula"><BlockMath math="\bar{x} \pm z_{\alpha/2} \frac{\sigma}{\sqrt{n}}" /></div>
        <p><InlineMath math="z_{\alpha/2}" /> = z-value with <InlineMath math="\alpha/2" /> in upper tail. Common: 90% → 1.645, 95% → 1.96, 99% → 2.576.</p>
      </div>

      <div className="content-section">
        <h2>Factors Affecting Width</h2>
        <p><strong>Wider</strong> interval: larger <InlineMath math="\sigma" />, smaller <InlineMath math="n" />, higher confidence level. <strong>Narrower</strong>: larger <InlineMath math="n" />, smaller <InlineMath math="\sigma" />, lower confidence.</p>
      </div>

      <div className="content-section">
        <h2>When <InlineMath math="\sigma" /> Unknown: t-Distribution</h2>
        <p>Use sample standard deviation <InlineMath math="s" />. The statistic <InlineMath math="T = (\bar{X}-\mu)/(s/\sqrt{n})" /> follows Student's t with <InlineMath math="df = n-1" />. Heavier tails than normal; as <InlineMath math="df \to \infty" />, t → z.</p>
      </div>

      <h2>Interactive Demos</h2>

      <div className="demo-box">
        <h3>CI for Mean (<InlineMath math="\sigma" /> Known)</h3>
        <p>Cereal boxes: <InlineMath math="\bar{x}=1.02" /> lb, <InlineMath math="\sigma=0.03" />, <InlineMath math="n=25" />. 95% CI = [1.008, 1.032].</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="\bar{x}" /></label>
            <input type="number" value={xbar} step="0.01" onChange={e => setXbar(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\sigma" /></label>
            <input type="number" value={sigma} min="0.001" step="0.001" onChange={e => setSigma(parseFloat(e.target.value) || 0.001)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" value={n} min="2" onChange={e => setN(parseInt(e.target.value) || 2)} />
          </div>
          <div className="input-group">
            <label>Confidence</label>
            <select value={conf} onChange={e => setConf(parseInt(e.target.value))}>
              <option value="90">90%</option>
              <option value="95">95%</option>
              <option value="99">99%</option>
            </select>
          </div>
        </div>
        <div className="result">
          Margin of error = {ci.moe.toFixed(4)}<br />
          {conf}% CI: [{ci.low.toFixed(3)}, {ci.high.toFixed(3)}]
        </div>
      </div>

      <div className="demo-box">
        <h3>Width Factors</h3>
        <p>See how interval width changes with <InlineMath math="n" />, <InlineMath math="\sigma" />, and confidence level.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" value={nW} min="5" max="500" onChange={e => setNW(parseInt(e.target.value) || 5)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\sigma" /></label>
            <input type="number" value={sigW} min="0.01" step="0.01" onChange={e => setSigW(parseFloat(e.target.value) || 0.01)} />
          </div>
          <div className="input-group">
            <label>Confidence</label>
            <select value={confW} onChange={e => setConfW(parseInt(e.target.value))}>
              <option value="90">90%</option>
              <option value="95">95%</option>
              <option value="99">99%</option>
            </select>
          </div>
        </div>
        <div className="result">Width = 2 × margin = {width.toFixed(4)}</div>
      </div>

      <div className="demo-box">
        <h3>CI When <InlineMath math="\sigma" /> Unknown — t-Based Interval</h3>
        <p>Use sample standard deviation <InlineMath math="s" />. CI = <InlineMath math="\bar{x} \pm t_{\alpha/2} \cdot s/\sqrt{n}" /> with <InlineMath math="df = n-1" />.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="\bar{x}" /></label>
            <input type="number" value={xBart} step="0.1" onChange={e => setXBart(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="s" /></label>
            <input type="number" value={st} min="0.01" step="0.1" onChange={e => setSt(parseFloat(e.target.value) || 0.01)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" value={nt} min="2" onChange={e => setNt(parseInt(e.target.value) || 2)} />
          </div>
          <div className="input-group">
            <label>Confidence</label>
            <select value={conft} onChange={e => setConft(parseInt(e.target.value))}>
              <option value="90">90%</option>
              <option value="95">95%</option>
              <option value="99">99%</option>
            </select>
          </div>
        </div>
        <div className="result">
          <InlineMath math="t_{\alpha/2}" /> (df={tci.df}) = {tci.t.toFixed(2)} &nbsp;vs&nbsp; <InlineMath math="z_{\alpha/2}" /> = {tci.z.toFixed(2)}<br />
          t-based CI: [{tci.low.toFixed(2)}, {tci.high.toFixed(2)}]<br />
          {tci.contains100
            ? 'Contains 100 → cannot conclude firm mean IQ differs from national 100.'
            : `Does not contain 100 → at ${conft}% confidence, firm's mean IQ differs from national 100.`}
        </div>
      </div>

      <div className="demo-box">
        <h3>t vs z — When <InlineMath math="\sigma" /> Unknown</h3>
        <table className="demo-table">
          <thead><tr><th>df</th><th>t (α=0.05)</th><th>z</th></tr></thead>
          <tbody>
            <tr><td>5</td><td>2.571</td><td>1.96</td></tr>
            <tr><td>10</td><td>2.228</td><td>1.96</td></tr>
            <tr><td>25</td><td>2.060</td><td>1.96</td></tr>
            <tr><td>∞</td><td>1.960</td><td>1.96</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
