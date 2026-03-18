import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';

export default function Demo42() {
  // Lie detector
  const [pT, setPT] = useState(0.99);
  const [pDgT, setPDgT] = useState(0.005);
  const [pDgTc, setPDgTc] = useState(0.95);

  const bayes = useMemo(() => {
    const pTc = 1 - pT;
    const jointT = pDgT * pT;
    const jointTc = pDgTc * pTc;
    const pD = jointT + jointTc;
    const postT = pD > 0 ? jointT / pD : 0;
    const postTc = pD > 0 ? jointTc / pD : 0;
    return { pTc, jointT, jointTc, pD, postT, postTc };
  }, [pT, pDgT, pDgTc]);

  // Medical screening
  const [pDisease, setPDisease] = useState(0.01);
  const [pPosD, setPPosD] = useState(0.95);
  const [pPosNotD, setPPosNotD] = useState(0.05);

  const medical = useMemo(() => {
    const pNotD = 1 - pDisease;
    const jointD = pPosD * pDisease;
    const jointNotD = pPosNotD * pNotD;
    const pPos = jointD + jointNotD;
    const postD = pPos > 0 ? jointD / pPos : 0;
    const postNotD = pPos > 0 ? jointNotD / pPos : 0;
    return { pNotD, jointD, jointNotD, pPos, postD, postNotD };
  }, [pDisease, pPosD, pPosNotD]);


  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.2: Total Probability and Bayes' Theorem</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Update beliefs (prior → posterior) when new evidence appears</li>
          <li>Interpret medical tests, lie detectors, and spam filters correctly</li>
        </ul>
        <p><strong>When to use:</strong> You have prior odds (e.g., base rate of disease) and likelihoods (sensitivity, specificity). Bayes turns "test says positive" into "probability actually diseased."</p>
        <p><strong>Prerequisites:</strong> <Link to="/4.1">4.1</Link> — conditional probability <InlineMath math="P(A|B)" />, joint probability.</p>
      </div>

      <div className="content-section">
        <h2>Total Probability Rule</h2>
        <p>When we partition the sample space into mutually exclusive, exhaustive events (e.g., <InlineMath math="B" /> and <InlineMath math="B^c" />), the probability of any event <InlineMath math="A" /> can be written as the sum of its intersections with each part:</p>
        <div className="formula"><BlockMath math="P(A) = P(A \cap B) + P(A \cap B^c)" /></div>
        <p>Using the joint formula <InlineMath math="P(A \cap B) = P(A|B) \cdot P(B)" />, we get:</p>
        <div className="formula"><BlockMath math="P(A) = P(A|B) \cdot P(B) + P(A|B^c) \cdot P(B^c)" /></div>
      </div>

      <div className="content-section">
        <h2>Bayes' Theorem</h2>
        <p><strong>Prior probability</strong> <InlineMath math="P(B)" />: our belief before seeing evidence. <strong>Posterior probability</strong> <InlineMath math="P(B|A)" />: updated belief after observing <InlineMath math="A" />. Bayes' theorem computes the posterior:</p>
        <div className="formula"><BlockMath math="P(B|A) = \frac{P(A|B) \cdot P(B)}{P(A)} = \frac{P(A|B) \cdot P(B)}{P(A|B) \cdot P(B) + P(A|B^c) \cdot P(B^c)}" /></div>
      </div>

      <div className="content-section">
        <h2>Lie Detector Example — Setup</h2>
        <p>Assume 99% tell the truth, test is 95% reliable at detecting lies, but 0.5% false positive (detects lie when telling truth).</p>
        <ul>
          <li><InlineMath math="D" /> = test detects a lie</li>
          <li><InlineMath math="T" /> = telling the truth, <InlineMath math="T^c" /> = lying</li>
          <li><InlineMath math="P(T) = 0.99" />, <InlineMath math="P(T^c) = 0.01" /></li>
          <li><InlineMath math="P(D|T) = 0.005" /> (false positive)</li>
          <li><InlineMath math="P(D|T^c) = 0.95" /> (true positive)</li>
        </ul>
      </div>

      <h2>Interactive Demo: Lie Detector</h2>
      <div className="demo-box">
        <p>Adjust the parameters and see the solution table update.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="P(T)" /> — prior truth</label>
            <input type="number" value={pT} min="0" max="1" step="0.01" onChange={e => setPT(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(D|T)" /> — false positive</label>
            <input type="number" value={pDgT} min="0" max="1" step="0.001" onChange={e => setPDgT(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="P(D|T^c)" /> — true positive</label>
            <input type="number" value={pDgTc} min="0" max="1" step="0.01" onChange={e => setPDgTc(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <table className="demo-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Prior <InlineMath math="P" /></th>
              <th>Conditional <InlineMath math="P(D|\cdot)" /></th>
              <th>Joint <InlineMath math="P(D \cap \cdot)" /></th>
              <th>Posterior <InlineMath math="P(\cdot|D)" /></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><InlineMath math="T" /> (truth)</td>
              <td>{pT.toFixed(2)}</td>
              <td>{pDgT.toFixed(3)}</td>
              <td>{bayes.jointT.toFixed(5)}</td>
              <td>{bayes.postT.toFixed(4)}</td>
            </tr>
            <tr>
              <td><InlineMath math="T^c" /> (lying)</td>
              <td>{bayes.pTc.toFixed(2)}</td>
              <td>{pDgTc.toFixed(2)}</td>
              <td>{bayes.jointTc.toFixed(4)}</td>
              <td>{bayes.postTc.toFixed(4)}</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td>1</td>
              <td>—</td>
              <td>{bayes.pD.toFixed(5)}</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
        <div className="result" style={{ marginTop: '1rem' }}>
          <strong><InlineMath math="P(T|D)" /></strong> = <span className="value">{bayes.postT.toFixed(4)}</span> (probability they were telling truth given "lie" reading)<br />
          <strong><InlineMath math="P(T^c|D)" /></strong> = <span className="value">{bayes.postTc.toFixed(4)}</span>
        </div>
      </div>

      <h2>Interactive Demo: Medical Screening</h2>
      <div className="demo-box">
        <p><strong>Scenario:</strong> A screening test for a rare disease. Even with 95% sensitivity and 95% specificity, when the disease is rare (e.g., 1%), most positive results are false positives.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="P(D)" /> — disease prevalence</label>
            <input type="number" value={pDisease} min="0.001" max="0.5" step="0.01" onChange={e => setPDisease(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Sensitivity <InlineMath math="P(+|D)" /></label>
            <input type="number" value={pPosD} min="0" max="1" step="0.01" onChange={e => setPPosD(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>False positive <InlineMath math="P(+|D^c)" /></label>
            <input type="number" value={pPosNotD} min="0" max="1" step="0.01" onChange={e => setPPosNotD(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <table className="demo-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Prior</th>
              <th><InlineMath math="P(+|\cdot)" /></th>
              <th>Joint</th>
              <th>Posterior <InlineMath math="P(\cdot|+)" /></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><InlineMath math="D" /> (disease)</td>
              <td>{pDisease.toFixed(2)}</td>
              <td>{pPosD.toFixed(2)}</td>
              <td>{medical.jointD.toFixed(4)}</td>
              <td>{medical.postD.toFixed(4)}</td>
            </tr>
            <tr>
              <td><InlineMath math="D^c" /> (no disease)</td>
              <td>{medical.pNotD.toFixed(2)}</td>
              <td>{pPosNotD.toFixed(2)}</td>
              <td>{medical.jointNotD.toFixed(4)}</td>
              <td>{medical.postNotD.toFixed(4)}</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td>1</td>
              <td>—</td>
              <td>{medical.pPos.toFixed(4)}</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
        <div className="result" style={{ marginTop: '1rem' }}>
          <strong><InlineMath math="P(D|\text{positive})" /></strong> = <span className="value">{medical.postD.toFixed(3)}</span> (probability of disease given positive test)
        </div>
      </div>
    </main>
  );
}
