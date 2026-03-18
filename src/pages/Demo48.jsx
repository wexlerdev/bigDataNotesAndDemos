import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { normCDF } from '../utils/math';

const zVals = { 0.10: 1.645, 0.05: 1.96, 0.01: 2.576 };

export default function Demo48() {
  const [htXbar, setHtXbar] = useState(1.02);
  const [htMu0, setHtMu0] = useState(1);
  const [htSigma, setHtSigma] = useState(0.03);
  const [htN, setHtN] = useState(25);
  const [htAlpha, setHtAlpha] = useState(0.05);

  const canvasRef = useRef(null);
  const decisionRef = useRef(null);

  const ht = useMemo(() => {
    const se = htSigma / Math.sqrt(htN);
    const z = (htXbar - htMu0) / se;
    const pVal = 2 * (1 - normCDF(Math.abs(z)));
    const zCrit = zVals[htAlpha] ?? 1.96;
    const reject = pVal < htAlpha;
    return { z, pVal, zCrit, reject };
  }, [htXbar, htMu0, htSigma, htN, htAlpha]);

  // Draw rejection chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 50, r: 40, t: 25, b: 45 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    const xMin = -4, xMax = 4;

    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, w, h);

    const x2px = xx => pad.l + ((xx - xMin) / (xMax - xMin)) * plotW;
    const normPdfStd = x => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    const maxY = normPdfStd(0);
    const y2py = y => pad.t + plotH - (y / maxY) * plotH;

    // Shade rejection regions
    ctx.fillStyle = 'rgba(247, 118, 142, 0.4)';
    ctx.beginPath();
    for (let x = xMin; x <= -ht.zCrit; x += 0.05) ctx.lineTo(x2px(x), y2py(normPdfStd(x)));
    ctx.lineTo(x2px(-ht.zCrit), pad.t + plotH);
    ctx.lineTo(x2px(xMin), pad.t + plotH);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    for (let x = ht.zCrit; x <= xMax; x += 0.05) ctx.lineTo(x2px(x), y2py(normPdfStd(x)));
    ctx.lineTo(x2px(xMax), pad.t + plotH);
    ctx.lineTo(x2px(ht.zCrit), pad.t + plotH);
    ctx.closePath();
    ctx.fill();

    // Curve
    ctx.beginPath();
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 2;
    for (let x = xMin; x <= xMax; x += 0.08) ctx.lineTo(x2px(x), y2py(normPdfStd(x)));
    ctx.stroke();

    // Critical lines
    ctx.strokeStyle = '#f7768e';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x2px(ht.zCrit), pad.t);
    ctx.lineTo(x2px(ht.zCrit), h - pad.b);
    ctx.moveTo(x2px(-ht.zCrit), pad.t);
    ctx.lineTo(x2px(-ht.zCrit), h - pad.b);
    ctx.stroke();
    ctx.setLineDash([]);

    // Observed z line
    if (Math.abs(ht.z) <= 4) {
      ctx.strokeStyle = '#9ece6a';
      ctx.beginPath();
      ctx.moveTo(x2px(ht.z), pad.t);
      ctx.lineTo(x2px(ht.z), h - pad.b);
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#b8add9';
    ctx.font = '11px sans-serif';
    ctx.fillText('-z', x2px(-ht.zCrit) - 18, h - 8);
    ctx.fillText('z', x2px(ht.zCrit) - 8, h - 8);
    ctx.fillText('z=' + ht.z.toFixed(1), x2px(ht.z) + 5, pad.t + 15);

    // Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
  }, [ht.z, ht.zCrit]);

  // Hypothesis builder
  const [param, setParam] = useState('μ');
  const [val, setVal] = useState(100);
  const [tail, setTail] = useState('two');

  const hyp = useMemo(() => {
    const latexParam = param === 'μ' ? '\\mu' : 'p';
    let h0, ha;
    if (tail === 'two') { h0 = `${latexParam} = ${val}`; ha = `${latexParam} \\neq ${val}`; }
    else if (tail === 'upper') { h0 = `${latexParam} \\leq ${val}`; ha = `${latexParam} > ${val}`; }
    else { h0 = `${latexParam} \\geq ${val}`; ha = `${latexParam} < ${val}`; }
    return { h0, ha };
  }, [param, val, tail]);

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 4 — Probability &amp; Inference</Link>
      <h1>4.8: Hypothesis Testing</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Formulate null <InlineMath math="H_0" /> and alternative <InlineMath math="H_A" /> hypotheses</li>
          <li>Use p-values and rejection regions to decide reject vs. do not reject</li>
          <li>Understand Type I (false positive) and Type II (false negative) errors</li>
        </ul>
        <p><strong>When to use:</strong> You want to test a claim about a population (e.g., "Does our cereal meet the 1 lb target?").</p>
        <p><strong>Prerequisites:</strong> <Link to="/4.7">4.7</Link> — confidence intervals, standard error.</p>
      </div>

      <div className="content-section">
        <h2>What Is Hypothesis Testing?</h2>
        <p>We compare two competing hypotheses about a population. We test the <strong>null</strong> against the <strong>alternative</strong> using sample evidence.</p>
      </div>

      <div className="content-section">
        <h2>Null and Alternative Hypotheses</h2>
        <ul>
          <li><strong><InlineMath math="H_0" /> (null):</strong> Status quo; uses <InlineMath math="=" />, <InlineMath math="\leq" />, or <InlineMath math="\geq" />.</li>
          <li><strong><InlineMath math="H_A" /> (alternative):</strong> Claim we want to evaluate; uses <InlineMath math="\neq" />, <InlineMath math=">" />, or <InlineMath math="<" />.</li>
        </ul>
        <p><strong>Reject</strong> <InlineMath math="H_0" /> when evidence is inconsistent with it. <strong>Do not reject</strong> when evidence doesn't contradict it.</p>
      </div>

      <div className="content-section">
        <h2>One-Tailed vs Two-Tailed</h2>
        <p><strong>One-tailed:</strong> <InlineMath math="H_A" /> uses <InlineMath math="<" /> or <InlineMath math=">" />. <strong>Two-tailed:</strong> <InlineMath math="H_A" /> uses <InlineMath math="\neq" />.</p>
      </div>

      <div className="content-section">
        <h2>Decision Errors</h2>
        <table className="demo-table">
          <thead>
            <tr><th></th><th><InlineMath math="H_0" /> true</th><th><InlineMath math="H_0" /> false</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Reject <InlineMath math="H_0" /></strong></td>
              <td className="error-cell">Type I error</td>
              <td className="highlight">Correct</td>
            </tr>
            <tr>
              <td><strong>Do not reject <InlineMath math="H_0" /></strong></td>
              <td className="highlight">Correct</td>
              <td className="error-cell">Type II error</td>
            </tr>
          </tbody>
        </table>
        <p><strong>Type I:</strong> Reject <InlineMath math="H_0" /> when it's true (false positive). <strong>Type II:</strong> Fail to reject <InlineMath math="H_0" /> when it's false (false negative).</p>
      </div>

      <h2>Interactive Demo: Hypothesis Test (z-Test for Mean)</h2>
      <div className="demo-box">
        <h3>Full Test: Cereal Box Weight</h3>
        <p><strong>Scenario:</strong> Cereal boxes should average 1 lb. Sample of 25 has <InlineMath math="\bar{x}=1.02" />, <InlineMath math="\sigma=0.03" />. Test <InlineMath math="H_0: \mu=1" /> vs <InlineMath math="H_A: \mu \neq 1" />.</p>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="\bar{x}" /></label>
            <input type="number" value={htXbar} step="0.01" onChange={e => setHtXbar(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\mu_0" /> (under <InlineMath math="H_0" />)</label>
            <input type="number" value={htMu0} step="0.01" onChange={e => setHtMu0(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\sigma" /></label>
            <input type="number" value={htSigma} min="0.001" step="0.001" onChange={e => setHtSigma(parseFloat(e.target.value) || 0.001)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="n" /></label>
            <input type="number" value={htN} min="2" onChange={e => setHtN(parseInt(e.target.value) || 2)} />
          </div>
          <div className="input-group">
            <label><InlineMath math="\alpha" /></label>
            <select value={htAlpha} onChange={e => setHtAlpha(parseFloat(e.target.value))}>
              <option value="0.10">0.10</option>
              <option value="0.05">0.05</option>
              <option value="0.01">0.01</option>
            </select>
          </div>
        </div>
        <div className="result" ref={decisionRef}>
          <InlineMath math={`z = \\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}}`} /> = <span className="value">{ht.z.toFixed(2)}</span><br />
          p-value (two-tailed) = <span className="value">{ht.pVal.toFixed(4)}</span><br />
          <strong>{ht.reject
            ? <>Reject <InlineMath math="H_0" /> at <InlineMath math={`\\alpha=${htAlpha}`} /> — evidence that mean differs from {htMu0}.</>
            : <>Do not reject <InlineMath math="H_0" /> — evidence does not contradict <InlineMath math={`\\mu=${htMu0}`} />.</>
          }</strong>
        </div>
        <canvas ref={canvasRef} width={500} height={180} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Rejection region (shaded): |z| &gt; <InlineMath math="z_{\alpha/2}" />
        </p>
      </div>

      <h2>Interactive Demo: Hypothesis Builder</h2>
      <div className="demo-box">
        <p>Generate <InlineMath math="H_0" /> and <InlineMath math="H_A" /> for common scenarios.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Parameter</label>
            <select value={param} onChange={e => setParam(e.target.value)}>
              <option value="μ">μ (mean)</option>
              <option value="p">p (proportion)</option>
            </select>
          </div>
          <div className="input-group">
            <label>Hypothesized value</label>
            <input type="number" value={val} step="0.1" onChange={e => setVal(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Test type</label>
            <select value={tail} onChange={e => setTail(e.target.value)}>
              <option value="two">Two-tailed (≠)</option>
              <option value="upper">Upper (&gt;)</option>
              <option value="lower">Lower (&lt;)</option>
            </select>
          </div>
        </div>
        <div className="result">
          <InlineMath math="H_0" />: <InlineMath math={hyp.h0} /><br />
          <InlineMath math="H_A" />: <InlineMath math={hyp.ha} />
        </div>
      </div>

      <div className="demo-box">
        <h3>Decision Table — Hover for Explanation</h3>
        <table className="demo-table">
          <thead>
            <tr><th></th><th><InlineMath math="H_0" /> true</th><th><InlineMath math="H_0" /> false</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Reject <InlineMath math="H_0" /></strong></td>
              <td className="error-cell" title="Type I: Incorrectly conclude there is an effect">Type I error</td>
              <td className="highlight" title="Correct: Detect a real effect">Correct</td>
            </tr>
            <tr>
              <td><strong>Do not reject <InlineMath math="H_0" /></strong></td>
              <td className="highlight" title="Correct: No effect, we don't find one">Correct</td>
              <td className="error-cell" title="Type II: Miss a real effect">Type II error</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
