import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { parseNum } from '../utils/math';

export default function Demo53() {
  // Coefficient Interpreter
  const [mode, setMode] = useState('simple');
  const [yName, setYName] = useState('salary');
  const [x1Name, setX1Name] = useState('experience');
  const [x2Name, setX2Name] = useState('education');
  const [b0, setB0] = useState(30000);
  const [b1, setB1] = useState(2500);
  const [b2, setB2] = useState(5000);

  const interpretation = useMemo(() => {
    const lines = [];
    lines.push(`Intercept (b₀ = ${b0}): When ${mode === 'simple' ? x1Name : `all predictors`} equal 0, the predicted ${yName} is ${b0}.`);
    if (mode === 'simple') {
      lines.push(`Slope (b₁ = ${b1}): For each one-unit increase in ${x1Name}, ${yName} is predicted to ${b1 >= 0 ? 'increase' : 'decrease'} by ${Math.abs(b1)}.`);
    } else {
      lines.push(`Slope (b₁ = ${b1}): Holding ${x2Name} constant, for each one-unit increase in ${x1Name}, ${yName} is predicted to ${b1 >= 0 ? 'increase' : 'decrease'} by ${Math.abs(b1)}.`);
      lines.push(`Slope (b₂ = ${b2}): Holding ${x1Name} constant, for each one-unit increase in ${x2Name}, ${yName} is predicted to ${b2 >= 0 ? 'increase' : 'decrease'} by ${Math.abs(b2)}.`);
    }
    return lines;
  }, [mode, yName, x1Name, x2Name, b0, b1, b2]);

  // Dummy Variable Encoder
  const [cat1, setCat1] = useState('City');
  const [cat2, setCat2] = useState('Non-city');
  const [refGroup, setRefGroup] = useState('cat2');
  const [dummyCoeff, setDummyCoeff] = useState(12000);

  const dummyInterpretation = useMemo(() => {
    const ref = refGroup === 'cat1' ? cat1 : cat2;
    const other = refGroup === 'cat1' ? cat2 : cat1;
    const varName = `D_{${other}}`;
    return {
      ref,
      other,
      varName,
      table: [
        { category: ref, value: 0, label: 'Reference group' },
        { category: other, value: 1, label: 'Encoded as 1' },
      ],
      sentence: `The coefficient ${dummyCoeff} means that, on average, ${other} observations have a predicted response that is ${dummyCoeff >= 0 ? 'higher' : 'lower'} by ${Math.abs(dummyCoeff)} compared to ${ref} (the reference group), holding other variables constant.`,
    };
  }, [cat1, cat2, refGroup, dummyCoeff]);

  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>5.1.3: Interpreting Coefficients &amp; Residuals</h1>

      <div className="concept-block">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Read regression coefficients in plain English (simple &amp; multiple)</li>
          <li>Handle categorical predictors with dummy (0/1) variables</li>
          <li>Understand what residual patterns tell you about model quality</li>
        </ul>
        <p><strong>When to use:</strong> You have a fitted regression and need to communicate what the numbers mean.</p>
        <p><strong>Prerequisites:</strong> <Link to="/5.1.2">5.1.2</Link> — OLS equation.</p>
      </div>

      <div className="content-section">
        <h2>Simple vs Multiple Interpretation</h2>
        <p><strong>Simple regression:</strong> <InlineMath math="b_1" /> is the change in <InlineMath math="\hat{y}" /> for a one-unit increase in <InlineMath math="x" />.</p>
        <p><strong>Multiple regression:</strong> <InlineMath math="b_j" /> is the change in <InlineMath math="\hat{y}" /> for a one-unit increase in <InlineMath math="x_j" />, <em>holding all other predictors constant</em>. This is called the <strong>partial influence</strong>.</p>
      </div>

      <div className="content-section">
        <h2>Handling Categorical Variables</h2>
        <p>Categorical predictors are encoded as <strong>dummy variables</strong> (0 or 1). For <InlineMath math="c" /> categories, use <InlineMath math="c - 1" /> dummy variables. The omitted category is the <strong>reference group</strong>.</p>
        <p>The dummy coefficient measures the difference from the reference group, holding other variables constant.</p>
      </div>

      <div className="content-section">
        <h2>What Residuals Tell You</h2>
        <ul>
          <li><strong>Random scatter</strong> around zero → model is adequate</li>
          <li><strong>Pattern (curve, fan shape)</strong> → model may be missing a term or violating assumptions</li>
          <li><strong>Outliers</strong> → individual points with unusually large residuals deserve investigation</li>
        </ul>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Interactive Demos</h2>

      <div className="demo-box">
        <h3>Demo 1: Coefficient Interpreter</h3>
        <p>Enter variable names and coefficients to generate a plain-English interpretation.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="simple">Simple regression</option>
              <option value="multiple">Multiple regression</option>
            </select>
          </div>
          <div className="input-group">
            <label>Response (y)</label>
            <input type="text" value={yName} onChange={e => setYName(e.target.value)} />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>Predictor 1 (x₁)</label>
            <input type="text" value={x1Name} onChange={e => setX1Name(e.target.value)} />
          </div>
          {mode === 'multiple' && (
            <div className="input-group">
              <label>Predictor 2 (x₂)</label>
              <input type="text" value={x2Name} onChange={e => setX2Name(e.target.value)} />
            </div>
          )}
        </div>
        <div className="input-row">
          <div className="input-group">
            <label><InlineMath math="b_0" /></label>
            <input type="number" value={b0} onChange={e => setB0(parseNum(e.target.value, 0))} />
          </div>
          <div className="input-group">
            <label><InlineMath math="b_1" /></label>
            <input type="number" value={b1} onChange={e => setB1(parseNum(e.target.value, 0))} />
          </div>
          {mode === 'multiple' && (
            <div className="input-group">
              <label><InlineMath math="b_2" /></label>
              <input type="number" value={b2} onChange={e => setB2(parseNum(e.target.value, 0))} />
            </div>
          )}
        </div>
        <div className="result">
          {interpretation.map((line, i) => <p key={i}>{line}</p>)}
        </div>
      </div>

      <div className="demo-box">
        <h3>Demo 2: Dummy Variable Encoder</h3>
        <p>Pick two category names and see how one is encoded as 0/1.</p>
        <div className="input-row">
          <div className="input-group">
            <label>Category 1</label>
            <input type="text" value={cat1} onChange={e => setCat1(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Category 2</label>
            <input type="text" value={cat2} onChange={e => setCat2(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Reference group</label>
            <select value={refGroup} onChange={e => setRefGroup(e.target.value)}>
              <option value="cat2">{cat2}</option>
              <option value="cat1">{cat1}</option>
            </select>
          </div>
          <div className="input-group">
            <label>Dummy coefficient</label>
            <input type="number" value={dummyCoeff} onChange={e => setDummyCoeff(parseNum(e.target.value, 0))} />
          </div>
        </div>
        <table className="demo-table" style={{ marginBottom: '1rem' }}>
          <thead>
            <tr><th>Category</th><th><InlineMath math={`D_{\\text{${dummyInterpretation.other}}}`} /></th><th>Role</th></tr>
          </thead>
          <tbody>
            {dummyInterpretation.table.map((row, i) => (
              <tr key={i}>
                <td>{row.category}</td>
                <td>{row.value}</td>
                <td>{row.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="result">
          <p><strong>Interpretation:</strong> {dummyInterpretation.sentence}</p>
        </div>
      </div>
    </main>
  );
}
