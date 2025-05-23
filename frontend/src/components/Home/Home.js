import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTracker from '../UserManagement/UserTracker';
import useTranslation from '../../config/useTranslation';
import '../../cypher-theme.css';

function Home() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();
  
  useEffect(() => {
    // Add animated background on component mount
    const animateBackground = () => {
      document.body.classList.add('animate-bg');
    };
    
    animateBackground();
    
    return () => {
      document.body.classList.remove('animate-bg');
    };
  }, []);

  return (
    <div className="home">
      <UserTracker />
      
      <div className="battle-stage-spotlight"></div>
      
      <div className="language-selector" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '8px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            background: '#222222',
            color: 'white',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontWeight: '600',
            textTransform: 'uppercase',
            boxShadow: 'none',
            letterSpacing: '0.05em'
          }}
        >
          <option value="pl">Polski</option>
          <option value="en">English</option>
        </select>
      </div>
      
      <div className="home-content">
        <div className="logo-container">
          <h1 className="site-title">Cypher Arena</h1>
          <div className="tagline">{t('freestyleHub')}</div>
        </div>
        
        <div className="main-content">
          <h2>{t('freestyleRounds')}</h2>
          
          <div className="battle-buttons">
            <button 
              onClick={() => navigate('/word-mode')} 
              className="battle-mode-btn"
            >
              {t('wordMode')}
            </button>
            
            <button 
              onClick={() => navigate('/image-mode')} 
              className="battle-mode-btn"
            >
              {t('imagesMode')}
            </button>
            
            <button 
              onClick={() => navigate('/contrasting-mode')} 
              className="battle-mode-btn"
            >
              {t('contrastingMode')}
            </button>
            
            <button 
              onClick={() => navigate('/topic-mode')} 
              className="battle-mode-btn"
            >
              {t('topicMode')}
            </button>
            
            <button 
              onClick={() => navigate('/beats-mode')} 
              className="battle-mode-btn"
            >
              {t('beats')}
            </button>
          </div>

          <div className="feedback-section">
            <button 
              onClick={() => navigate('/report-feedback')} 
              className="feedback-btn"
              style={{
                background: 'transparent',
                border: '1px solid #555555',
                color: 'white',
                letterSpacing: '0.05em',
                position: 'relative',
                marginRight: '10px'
              }}
            >
              {t('giveFeedback')}
            </button>
            
            {/* <button 
              onClick={() => navigate('/settings')} 
              className="feedback-btn"
              style={{
                background: 'transparent',
                border: '1px solid #555555',
                color: 'white',
                letterSpacing: '0.05em',
                position: 'relative'
              }}
            >
              {t('settings')}
            </button> */}
          </div>
        </div>
      </div>
      
      {/* Visual elements with fractal aesthetic */}
      <div className="visual-elements">
        <div className="record-circle">
          <div className="vinyl-shine"></div>
        </div>
        <div className="record-circle secondary">
          <div className="vinyl-shine"></div>
        </div>
        <div className="fractal-orb" style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          top: '10%',
          right: '-150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 30, 30, 0.1) 0%, transparent 70%)',
          filter: 'blur(20px)',
          opacity: '0.4',
          animation: 'pulse 15s ease-in-out infinite alternate'
        }}></div>
        <div className="fractal-orb" style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          bottom: '5%',
          left: '-100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(40, 40, 40, 0.1) 0%, transparent 70%)',
          filter: 'blur(15px)',
          opacity: '0.3',
          animation: 'pulse 12s ease-in-out infinite alternate-reverse'
        }}></div>
        <div className="fractal-orb" style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          top: '70%',
          right: '20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(60, 60, 60, 0.1) 0%, transparent 70%)',
          filter: 'blur(10px)',
          opacity: '0.3',
          animation: 'pulse 18s ease-in-out infinite alternate'
        }}></div>
      </div>
    </div>
  );
}

export default Home;
