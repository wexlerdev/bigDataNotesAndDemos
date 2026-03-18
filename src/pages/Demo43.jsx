import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Demo43() {
  // Bonus inputs
  const [x1, setX1] = useState(10);
  const [p1, setP1] = useState(0.15);
  const [x2, setX2] = useState(6);
  const [p2, setP2] = useState(0.25);
  const [x3, setX3] = useState(3);
  const [p3, setP3] = useState(0.40);
  const [x4, setX4] = useState(0);
  const [p4, setP4] = useState(0.20);

  const bonus = useMemo(() => {
    const xs = [x1, x2, x3, x4];
    const ps = [p1, p2, p3, p4];
    const mu = xs.reduce((s, xi, i) => s + xi * ps[i], 0);
    const varX = xs.reduce((s, xi, i) => s + (xi - mu) ** 2 * ps[i], 0);
    const sd = Math.sqrt(varX);
    return { mu, varX, sd, ps };
  }, [x1, p1, x2, p2, x3, p3, x4, p4]);

  const coinData = {
    labels: ['0', '1', '2'],
    datasets: [{ label: 'P(X=x)', data: [0.25, 0.5, 0.25], backgroundColor: 'rgba(245,213,71,0.7)' }]
  };

  const bonusData = {
    labels: ['Superior', 'Good', 'Fair', 'Poor'],
    datasets: [{ label: 'P(X=x)', data: [p1, p2, p3, p4], backgroundColor: 'rgba(196,181,253,0.7)' }]
  };

  const chartOpts = { scales: { y: { beginAtZero: true, max: 1 } }, plugins: { legend: { display: false } } };

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.3: Discrete Random Variables</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Assign numbers to outcomes (random variables) and describe distributions</li>
          <li>Compute expected value, variance, and standard deviation for discrete <InlineMath math="X" /></li>
          <li>Use these tools for budgeting, risk, and decision-making</li>
        </ul>
        <p><strong>When to use:</strong> When outcomes are counts or categories with numeric values (sales, bonuses, defects). Expected value = long-run average; variance = spread.</p>
        <p><strong>Prerequisites:</strong> <Link to="/4.1">4.1</Link> — basic probability.</p>
      </div>

      <div className="content-section">
        <h2>Definitions</h2>
        <p>A <strong>random variable</strong> assigns numbers to outcomes. <strong>Discrete</strong> variables have countable values (0, 1, 2, …); <strong>continuous</strong> variables take values in an interval.</p>
      </div>

      <div className="content-section">
        <h2>Probability Distribution</h2>
        <p>For discrete <InlineMath math="X" />, the <strong>probability distribution</strong> gives <InlineMath math="P(X = x)" /> for each value. Rules: <InlineMath math="0 \leq P(X=x) \leq 1" /> and <InlineMath math="\sum P(X=x) = 1" />.</p>
      </div>

      <div className="content-section">
        <h2>Expected Value, Variance, Standard Deviation</h2>
        <div className="formula"><BlockMath math="E(X) = \mu = \sum x_i \cdot P(X = x_i)" /></div>
        <div className="formula"><BlockMath math="\text{Var}(X) = \sigma^2 = \sum (x_i - \mu)^2 \cdot P(X = x_i), \quad \text{SD}(X) = \sigma = \sqrt{\text{Var}(X)}" /></div>
      </div>

      <div className="content-section">
        <h2>Coin Flip Example</h2>
        <p><InlineMath math="X" /> = number of heads in 2 flips. <InlineMath math="P(X=0)=1/4" />, <InlineMath math="P(X=1)=1/2" />, <InlineMath math="P(X=2)=1/4" />. Then <InlineMath math="E(X)=1" />, <InlineMath math="\text{Var}(X)=1/2" />.</p>
      </div>

      <h2>Interactive Demo: Coin Flips</h2>
      <div className="demo-box">
        <p><strong>Why it matters:</strong> This is the building block for the binomial distribution (4.4)—multiple independent trials, each with two outcomes.</p>
        <table className="demo-table">
          <thead><tr><th><InlineMath math="x" /></th><th><InlineMath math="P(X=x)" /></th></tr></thead>
          <tbody>
            <tr><td>0</td><td>1/4</td></tr>
            <tr><td>1</td><td>1/2</td></tr>
            <tr><td>2</td><td>1/4</td></tr>
          </tbody>
        </table>
        <div className="result"><InlineMath math="E(X)" /> = 1, <InlineMath math="\text{Var}(X)" /> = 0.5, <InlineMath math="\sigma" /> ≈ 0.71</div>
        <Bar data={coinData} options={chartOpts} />
      </div>

      <h2>Interactive Demo: Juan Jimenez Bonuses</h2>
      <div className="demo-box">
        <p><strong>Why it matters:</strong> Expected value helps with budgeting. Variance measures risk. Juan's dealership: Superior $10k (0.15), Good $6k (0.25), Fair $3k (0.40), Poor $0 (0.20).</p>
        <div className="input-row">
          <div className="input-group">
            <label>Superior ($000s)</label>
            <input type="number" value={x1} onChange={e => setX1(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(X=10)" /></label>
            <input type="number" value={p1} min="0" max="1" step="0.01" onChange={e => setP1(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Good ($000s)</label>
            <input type="number" value={x2} onChange={e => setX2(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(X=6)" /></label>
            <input type="number" value={p2} min="0" max="1" step="0.01" onChange={e => setP2(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Fair ($000s)</label>
            <input type="number" value={x3} onChange={e => setX3(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(X=3)" /></label>
            <input type="number" value={p3} min="0" max="1" step="0.01" onChange={e => setP3(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Poor ($000s)</label>
            <input type="number" value={x4} onChange={e => setX4(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(X=0)" /></label>
            <input type="number" value={p4} min="0" max="1" step="0.01" onChange={e => setP4(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="E(X)" /> = <span className="value">{bonus.mu.toFixed(1)}</span> ($1,000s) = ${(bonus.mu * 1000).toLocaleString()}<br />
          <InlineMath math="\text{Var}(X)" /> ≈ {bonus.varX.toFixed(2)}, <InlineMath math="\sigma" /> ≈ {bonus.sd.toFixed(2)} ($1,000s)<br />
          25 employees → expected total = ${(25 * bonus.mu * 1000).toLocaleString()}
        </div>
        <Bar data={bonusData} options={chartOpts} />
      </div>
    </main>
  );
}
