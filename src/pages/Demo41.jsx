import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';

export default function Demo41() {
  // Venn diagram
  const [vennPA, setVennPA] = useState(0.5);
  const [vennPB, setVennPB] = useState(0.4);
  const [vennPAB, setVennPAB] = useState(0.2);

  const venn = useMemo(() => {
    const valid = vennPAB <= Math.min(vennPA, vennPB) && vennPA + vennPB - vennPAB <= 1;
    if (!valid) {
      const warn = vennPAB > Math.min(vennPA, vennPB)
        ? 'Invalid: P(A∩B) must be ≤ min(P(A), P(B))'
        : 'Invalid: P(A)+P(B)-P(A∩B) must be ≤ 1';
      return { valid: false, warn };
    }
    const union = vennPA + vennPB - vennPAB;
    const pAgB = vennPB > 0 ? vennPAB / vennPB : 0;
    return { valid: true, union, pAc: 1 - vennPA, pAgB, aOnly: vennPA - vennPAB, bOnly: vennPB - vennPAB, neither: 1 - union };
  }, [vennPA, vennPB, vennPAB]);

  // Complement
  const [pA, setPa] = useState(37);
  const pAval = pA / 100;

  // Addition rule
  const [pAs, setPAs] = useState(0.75);
  const [pAm, setPAm] = useState(0.55);
  const [pAsAm, setPAsAm] = useState(0.40);
  const addUnion = Math.min(1, Math.max(0, pAs + pAm - pAsAm));

  // Conditional
  const [pAecon, setPAecon] = useState(0.60);
  const [pBecon, setPBecon] = useState(0.25);
  const [pABecon, setPABecon] = useState(0.16);
  const condPAgB = pBecon > 0 ? pABecon / pBecon : 0;

  // Joint from conditional
  const [pR, setPR] = useState(0.14);
  const [pLgR, setPLgR] = useState(0.24);
  const jointRL = pR * pLgR;

  // Independence
  const [pD, setPD] = useState(0.02);
  const [pL, setPL] = useState(0.06);
  const [pDL, setPDL] = useState(0.0012);
  const product = pD * pL;
  const isIndep = Math.abs(pDL - product) < 0.0001;

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.1: Probability Concepts and Rules</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Define sample space, events, and basic probability rules</li>
          <li>Combine events with union, intersection, and complement</li>
          <li>Use conditional probability, joint probability, and check independence</li>
        </ul>
        <p><strong>When to use:</strong> Any situation with uncertain outcomes. These rules underpin all later topics—Bayes (4.2), random variables (4.3+), and statistical inference (4.6–4.8).</p>
        <p><strong>Prerequisites:</strong> None. This is the foundation.</p>
      </div>

      <div className="content-section">
        <h2>Definitions</h2>
        <p><strong>Probability</strong> is a numerical value (0 to 1) that measures how likely an event is to occur. An <strong>experiment</strong> is a process with uncertain outcomes. The <strong>sample space</strong> <InlineMath math="S" /> is the set of all possible outcomes. An <strong>event</strong> is any subset of <InlineMath math="S" />.</p>
        <p><strong>Exhaustive events</strong> cover all outcomes. <strong>Mutually exclusive events</strong> share no outcomes (if one occurs, the others cannot).</p>
      </div>

      <div className="content-section">
        <h2>Venn Diagram &amp; Set Operations</h2>
        <p>Sample space <InlineMath math="S" /> is the rectangle; events <InlineMath math="A" /> and <InlineMath math="B" /> are circles.</p>
        <ul>
          <li>Union <InlineMath math="A \cup B" /> — at least one occurs</li>
          <li>Intersection <InlineMath math="A \cap B" /> — both occur</li>
          <li>Complement <InlineMath math="A^c" /> — <InlineMath math="A" /> does not occur</li>
        </ul>
        <div className="formula"><BlockMath math="0 \leq P(A) \leq 1, \quad P(S) = 1, \quad P(A^c) = 1 - P(A)" /></div>
      </div>

      <div className="content-section">
        <h2>Addition Rule</h2>
        <p>Probability that <InlineMath math="A" /> or <InlineMath math="B" /> occurs (at least one):</p>
        <div className="formula"><BlockMath math="P(A \cup B) = P(A) + P(B) - P(A \cap B)" /></div>
        <p>The joint <InlineMath math="P(A \cap B)" /> is subtracted because it is counted in both <InlineMath math="P(A)" /> and <InlineMath math="P(B)" />.</p>
      </div>

      <div className="content-section">
        <h2>Conditional &amp; Joint Probability</h2>
        <p>Conditional: <InlineMath math="P(A|B)" /> = probability of <InlineMath math="A" /> given that <InlineMath math="B" /> occurred.</p>
        <div className="formula"><BlockMath math="P(A|B) = \frac{P(A \cap B)}{P(B)} \quad \Rightarrow \quad P(A \cap B) = P(A|B) \cdot P(B)" /></div>
      </div>

      <div className="content-section">
        <h2>Independence</h2>
        <p>Events <InlineMath math="A" /> and <InlineMath math="B" /> are <strong>independent</strong> if <InlineMath math="P(A|B) = P(A)" />, or equivalently <InlineMath math="P(A \cap B) = P(A) \cdot P(B)" />.</p>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Interactive Demos</h2>

      {/* Venn Diagram */}
      <div className="demo-box">
        <h3>Interactive Venn Diagram</h3>
        <p>Adjust <InlineMath math="P(A)" />, <InlineMath math="P(B)" />, and <InlineMath math="P(A \cap B)" />. Values must satisfy: <InlineMath math="P(A \cap B) \leq \min(P(A), P(B))" /> and <InlineMath math="P(A) + P(B) - P(A \cap B) \leq 1" />.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="P(A)" /></label>
            <input type="number" value={vennPA} min="0" max="1" step="0.05" onChange={e => setVennPA(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(B)" /></label>
            <input type="number" value={vennPB} min="0" max="1" step="0.05" onChange={e => setVennPB(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(A \cap B)" /></label>
            <input type="number" value={vennPAB} min="0" max="1" step="0.05" onChange={e => setVennPAB(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        {venn.valid ? (
          <div className="result">
            <InlineMath math="P(A \cup B)" /> = {venn.union.toFixed(2)} &nbsp;|&nbsp;
            <InlineMath math="P(A^c)" /> = {venn.pAc.toFixed(2)} &nbsp;|&nbsp;
            <InlineMath math="P(A|B)" /> = {venn.pAgB.toFixed(2)}
          </div>
        ) : (
          <div className="result" style={{ color: 'var(--warning)' }}>{venn.warn}</div>
        )}
        <svg width="400" height="220" viewBox="0 0 400 220" style={{ display: 'block', margin: '1rem auto' }}>
          <rect width="400" height="220" fill="#1e1b2e" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x="200" y="18" fill="#b8add9" fontSize="12" textAnchor="middle">S (sample space)</text>
          <ellipse cx="140" cy="110" rx="80" ry="70" fill="rgba(245,213,71,0.35)" stroke="#f5d547" strokeWidth="1.5" />
          <ellipse cx="260" cy="110" rx="80" ry="70" fill="rgba(196,181,253,0.35)" stroke="#c4b5fd" strokeWidth="1.5" />
          <text x="95" y="115" fill="#e6e0ff" fontSize="13" fontWeight="600">{venn.valid ? (venn.aOnly).toFixed(2) : 'A only'}</text>
          <text x="285" y="115" fill="#e6e0ff" fontSize="13" fontWeight="600">{venn.valid ? (venn.bOnly).toFixed(2) : 'B only'}</text>
          <text x="200" y="110" fill="#e6e0ff" fontSize="12" textAnchor="middle">{venn.valid ? vennPAB.toFixed(2) : 'A∩B'}</text>
          <text x="200" y="195" fill="#b8add9" fontSize="11" textAnchor="middle">{venn.valid ? venn.neither.toFixed(2) + ' (neither)' : 'neither'}</text>
        </svg>
      </div>

      {/* Complement */}
      <div className="demo-box">
        <h3>Complement Rule</h3>
        <p><strong>Story:</strong> At an open house, 37% of female attendees will purchase a gym membership. What is the probability a randomly selected female will not purchase? <InlineMath math="P(A^c) = 1 - P(A)" />.</p>
        <label><InlineMath math="P(A)" /> = probability of purchase</label>
        <input type="range" min="0" max="100" value={pA} step="1" onChange={e => setPa(parseInt(e.target.value))} />
        <span> {pAval.toFixed(2)}</span>
        <div className="result"><span className="value"><InlineMath math="P(A^c)" /></span> = {(1 - pAval).toFixed(2)}</div>
      </div>

      {/* Addition Rule */}
      <div className="demo-box">
        <h3>Addition Rule — Anthony's Grades</h3>
        <p><strong>Story:</strong> Anthony estimates his chances: 75% for an A in Statistics, 55% in Managerial Economics, and 40% for an A in both. What is the probability he gets an A in at least one? <InlineMath math="A_S" /> = A in Statistics, <InlineMath math="A_M" /> = A in Managerial Economics.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="P(A_S)" /></label>
            <input type="number" value={pAs} min="0" max="1" step="0.01" onChange={e => setPAs(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(A_M)" /></label>
            <input type="number" value={pAm} min="0" max="1" step="0.01" onChange={e => setPAm(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(A_S \cap A_M)" /></label>
            <input type="number" value={pAsAm} min="0" max="1" step="0.01" onChange={e => setPAsAm(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="P(A_S \cup A_M)" /> = {addUnion.toFixed(2)}<br />
          <InlineMath math="P(\text{neither})" /> = {(1 - addUnion).toFixed(2)}
        </div>
      </div>

      {/* Conditional Probability */}
      <div className="demo-box">
        <h3>Conditional Probability — Economist (Countries A &amp; B)</h3>
        <p><strong>Story:</strong> An economist predicts 60% chance country A performs poorly, 25% for country B, and 16% for both. Given B performs poorly, what is the chance A does too? <InlineMath math="P(A|B) = P(A \cap B) / P(B)" />.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="P(A)" /></label>
            <input type="number" value={pAecon} min="0" max="1" step="0.01" onChange={e => setPAecon(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(B)" /></label>
            <input type="number" value={pBecon} min="0" max="1" step="0.01" onChange={e => setPBecon(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(A \cap B)" /></label>
            <input type="number" value={pABecon} min="0" max="1" step="0.01" onChange={e => setPABecon(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result"><InlineMath math="P(A|B)" /> = {condPAgB.toFixed(2)}</div>
      </div>

      {/* Joint from Conditional */}
      <div className="demo-box">
        <h3>Joint from Conditional — Social Media Loyalty</h3>
        <p><strong>Story:</strong> A manager believes 14% of consumers respond positively to the firm's social media, and 24% of those who respond become loyal. What is the probability the next recipient responds positively and becomes loyal? <InlineMath math="P(R \cap L) = P(L|R) \cdot P(R)" />.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="P(R)" /> — positive response</label>
            <input type="number" value={pR} min="0" max="1" step="0.01" onChange={e => setPR(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(L|R)" /> — loyal given response</label>
            <input type="number" value={pLgR} min="0" max="1" step="0.01" onChange={e => setPLgR(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result"><InlineMath math="P(R \cap L)" /> = {jointRL.toFixed(4)}</div>
      </div>

      {/* Independence Check */}
      <div className="demo-box">
        <h3>Independence Check — Computer Crashes</h3>
        <p><strong>Story:</strong> 2% chance desktop crashes, 6% laptop, 0.12% both. Are the two independent? If so, one crashing doesn't change the other's probability. <InlineMath math="P(D \cap L) = P(D) \cdot P(L)" />.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="P(D)" /></label>
            <input type="number" value={pD} min="0" max="1" step="0.001" onChange={e => setPD(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(L)" /></label>
            <input type="number" value={pL} min="0" max="1" step="0.001" onChange={e => setPL(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(D \cap L)" /></label>
            <input type="number" value={pDL} min="0" max="1" step="0.0001" onChange={e => setPDL(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="result">
          <InlineMath math="P(D) \cdot P(L)" /> = {product.toFixed(4)}<br />
          <InlineMath math="P(D \cap L)" /> = {pDL.toFixed(4)}<br />
          <strong style={{ color: isIndep ? 'var(--success)' : 'var(--warning)' }}>
            {isIndep ? 'Independent' : 'Dependent'}
          </strong>
        </div>
      </div>
    </main>
  );
}
