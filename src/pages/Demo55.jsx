import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';

export default function Demo55() {
  return (
    <main className="demo-page">
      <Link to="/demos" className="back-link">← Back to Unit 5 — Regression Analysis</Link>
      <h1>Cheat Sheet: Regression Formulas &amp; Distinctions</h1>

      <div className="concept-block">
        <h2>Quick Reference</h2>
        <p>All Unit 5 terminology, formulas, and critical distinctions in one place.</p>
      </div>

      <div className="content-section">
        <h2>1. Variables</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Term</th><th>Definition</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Response variable</strong> (<InlineMath math="y" />)</td><td>The outcome we want to explain or predict (dependent variable)</td></tr>
            <tr><td><strong>Predictor variable</strong> (<InlineMath math="x" />)</td><td>Variable(s) used to explain the response (independent variable)</td></tr>
            <tr><td><strong>Numerical</strong></td><td>Takes numeric values on a meaningful scale (age, income, temperature)</td></tr>
            <tr><td><strong>Categorical</strong></td><td>Takes category labels (city/suburb, yes/no, brand A/B/C)</td></tr>
            <tr><td><strong>Dummy variable</strong></td><td>0/1 encoding of a categorical variable for use in regression</td></tr>
            <tr><td><strong>Reference group</strong></td><td>The omitted category when encoding dummies (coded 0 for all dummies)</td></tr>
          </tbody>
        </table>
      </div>

      <div className="content-section">
        <h2>2. Model Types</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Type</th><th>Form</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Simple regression</strong></td><td><InlineMath math="y = \beta_0 + \beta_1 x + \varepsilon" /></td><td>One predictor</td></tr>
            <tr><td><strong>Multiple regression</strong></td><td><InlineMath math="y = \beta_0 + \beta_1 x_1 + \cdots + \beta_k x_k + \varepsilon" /></td><td>Two or more predictors</td></tr>
            <tr><td><strong>Deterministic</strong></td><td><InlineMath math="y = \beta_0 + \beta_1 x" /></td><td>No error term — exact relationship</td></tr>
            <tr><td><strong>Stochastic</strong></td><td><InlineMath math="y = \beta_0 + \beta_1 x + \varepsilon" /></td><td>Includes random error</td></tr>
          </tbody>
        </table>
      </div>

      <div className="content-section">
        <h2>3. Equation Components</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Symbol</th><th>Name</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td><InlineMath math="\beta_0" /></td><td>Population intercept</td><td>True y-value when all x = 0</td></tr>
            <tr><td><InlineMath math="\beta_1" /></td><td>Population slope</td><td>True change in y per unit change in x</td></tr>
            <tr><td><InlineMath math="b_0" /></td><td>Sample intercept</td><td>OLS estimate of <InlineMath math="\beta_0" /></td></tr>
            <tr><td><InlineMath math="b_1" /></td><td>Sample slope</td><td>OLS estimate of <InlineMath math="\beta_1" /></td></tr>
            <tr><td><InlineMath math="\varepsilon" /></td><td>Population error</td><td>True random disturbance (unobservable)</td></tr>
            <tr><td><InlineMath math="e = y - \hat{y}" /></td><td>Residual</td><td>Sample error — observed minus predicted</td></tr>
            <tr><td><InlineMath math="\hat{y}" /></td><td>Predicted value</td><td><InlineMath math="b_0 + b_1 x" /></td></tr>
            <tr><td><InlineMath math="y" /></td><td>Observed value</td><td>Actual data point</td></tr>
            <tr><td><InlineMath math="E(y)" /></td><td>Expected value of y</td><td><InlineMath math="\beta_0 + \beta_1 x" /> (population mean response)</td></tr>
          </tbody>
        </table>
      </div>

      <div className="content-section">
        <h2>4. Estimation</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Term</th><th>Formula / Definition</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>OLS</strong></td><td>Ordinary Least Squares — minimizes <InlineMath math="SSE = \sum(y_i - \hat{y}_i)^2" /></td></tr>
            <tr><td><InlineMath math="s_{xy}" /></td><td><InlineMath math="\sum(x_i - \bar{x})(y_i - \bar{y})" /> — cross-deviation of x and y</td></tr>
            <tr><td><InlineMath math="s_x^2" /></td><td><InlineMath math="\sum(x_i - \bar{x})^2" /> — sum of squared x-deviations</td></tr>
            <tr><td><InlineMath math="b_1 = s_{xy}/s_x^2" /></td><td>Slope estimate</td></tr>
            <tr><td><InlineMath math="b_0 = \bar{y} - b_1\bar{x}" /></td><td>Intercept estimate</td></tr>
            <tr><td>Sample regression equation</td><td><InlineMath math="\hat{y} = b_0 + b_1 x" /></td></tr>
          </tbody>
        </table>
      </div>

      <div className="content-section">
        <h2>5. Interpretation Language</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Context</th><th>How to Say It</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Slope (simple)</strong></td><td>"For each one-unit increase in x, ŷ changes by b₁."</td></tr>
            <tr><td><strong>Slope (multiple)</strong></td><td>"Holding other predictors constant, for each one-unit increase in xⱼ, ŷ changes by bⱼ."</td></tr>
            <tr><td><strong>Intercept</strong></td><td>"When all predictors equal 0, the predicted y is b₀." (May not be meaningful.)</td></tr>
            <tr><td><strong>Partial influence</strong></td><td>The effect of one predictor after controlling for others (multiple regression only)</td></tr>
            <tr><td><strong>Dummy coefficient</strong></td><td>"Compared to the reference group, the predicted y is b higher/lower."</td></tr>
          </tbody>
        </table>
      </div>

      <div className="content-section">
        <h2>6. Goodness-of-Fit</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Measure</th><th>Formula</th><th>Interpretation</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>SST</strong></td><td><InlineMath math="\sum(y_i - \bar{y})^2" /></td><td>Total variation in y</td></tr>
            <tr><td><strong>SSR</strong></td><td><InlineMath math="\sum(\hat{y}_i - \bar{y})^2" /></td><td>Variation explained by model</td></tr>
            <tr><td><strong>SSE</strong></td><td><InlineMath math="\sum(y_i - \hat{y}_i)^2" /></td><td>Variation unexplained (residual)</td></tr>
            <tr><td><InlineMath math="R^2" /></td><td><InlineMath math="SSR/SST" /></td><td>Proportion of variation explained (0 to 1)</td></tr>
            <tr><td><InlineMath math="\bar{R}^2" /></td><td><InlineMath math="1 - \frac{(1-R^2)(n-1)}{n-k-1}" /></td><td>Penalizes for number of predictors</td></tr>
            <tr><td><InlineMath math="S_e" /></td><td><InlineMath math="\sqrt{SSE/(n-k-1)}" /></td><td>Typical prediction error (same units as y)</td></tr>
          </tbody>
        </table>
      </div>

      <div className="content-section">
        <h2>7. Critical Distinctions</h2>
        <table className="demo-table">
          <thead>
            <tr><th>Pair</th><th>Distinction</th></tr>
          </thead>
          <tbody>
            <tr><td><InlineMath math="\beta" /> vs <InlineMath math="b" /></td><td>Population parameter (unknown) vs sample estimate (computed from data)</td></tr>
            <tr><td><InlineMath math="\varepsilon" /> vs <InlineMath math="e" /></td><td>Population error (unobservable) vs residual (observable, <InlineMath math="y - \hat{y}" />)</td></tr>
            <tr><td><InlineMath math="R^2" /> vs <InlineMath math="\bar{R}^2" /></td><td><InlineMath math="R^2" /> never decreases with more predictors; <InlineMath math="\bar{R}^2" /> can decrease</td></tr>
            <tr><td>Numerical vs Categorical</td><td>Numerical: scale values; Categorical: labels → need dummy encoding</td></tr>
            <tr><td>Simple vs Multiple</td><td>One predictor vs two or more; "holding constant" only applies in multiple</td></tr>
            <tr><td>Observed vs Predicted</td><td><InlineMath math="y_i" /> (actual data) vs <InlineMath math="\hat{y}_i" /> (model output)</td></tr>
            <tr><td>Deterministic vs Stochastic</td><td>No error term vs includes <InlineMath math="\varepsilon" />; real data is always stochastic</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
