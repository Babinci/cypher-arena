import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTracker from '../UserManagement/UserTracker';
import useTranslation from '../../config/useTranslation';
import '../../cypher-theme.css';

function Home() {
  const navigate = useNavigate();
  const { language, setLanguage, languages, t } = useTranslation();
  
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
            background: '#333333',
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
                position: 'relative'
              }}
            >
              {t('giveFeedback')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Visual elements for hip-hop aesthetic */}
      <div className="visual-elements">
        <div className="record-circle"></div>
        <div className="record-circle secondary"></div>
      </div>
    </div>
  );
}

export default Home;
