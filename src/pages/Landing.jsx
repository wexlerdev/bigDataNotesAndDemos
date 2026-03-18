import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionMark3D from '../components/QuestionMark3D';

export default function Landing() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="landing">
      {/* Loading overlay */}
      <div className={`landing-loader ${loaded ? 'hidden' : ''}`}>
        <div className="landing-loader-title">Loading 3D Scene</div>
        <div className="landing-loader-ring" />
      </div>

      {/* Full-screen 3D scene */}
      <QuestionMark3D onLoaded={() => setLoaded(true)} />
      <div className="landing-vignette" />

      {/* Right-side content overlay */}
      <div className="landing-overlay">
        <div className="landing-panel">
          <p className="landing-tag">CMP-SC 4350 / 7350</p>
          <h1 className="landing-title">Big Data Analytics</h1>
          <p className="landing-subtitle">
            Interactive demos for probability, statistical inference &amp; regression analysis
          </p>

          <div className="landing-buttons">
            <button className="landing-btn landing-btn-primary" onClick={() => navigate('/demos')}>
              Explore Demos
              <span className="landing-btn-arrow">&rarr;</span>
            </button>
          </div>

          <p className="landing-hint">Drag to orbit the model &middot; Scroll to interact</p>
        </div>
      </div>
    </div>
  );
}
