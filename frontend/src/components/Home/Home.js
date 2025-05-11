import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserTracker from '../UserManagement/UserTracker';
import useTranslation from '../../config/useTranslation';

function Home() {
  const navigate = useNavigate();
  const { language, setLanguage, languages, t } = useTranslation();

  return (
    <div className="home">
       <UserTracker />
      <h1>Cypher Arena</h1>
      
      <div className="language-selector" style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '5px',
            borderRadius: '5px',
            cursor: 'pointer',
            background: '#4CAF50',
            color: 'white',
            border: 'none'
          }}
        >
          <option value="pl">Polski</option>
          <option value="en">English</option>
        </select>
      </div>
      
      {/* <div className="sidebar">
        <button onClick={() => navigate('/account')}>Account</button>
      </div> */}
      
      <div className="main-content">
        <h2>{t('freestyleRounds')}</h2>
        <button onClick={() => navigate('/word-mode')}>{t('wordMode')}</button>
        <button onClick={() => navigate('/image-mode')}>{t('imagesMode')}</button>
        <button onClick={() => navigate('/contrasting-mode')}>{t('contrastingMode')}</button>
        <button onClick={() => navigate('/topic-mode')}>{t('topicMode')}</button>
        <button onClick={() => navigate('/beats-mode')}>{t('beats')}</button>

        {/* <h2>Tryb Ocenianie Walki</h2> */}
        {/* <button onClick={() => navigate('/battle-judging')}>Ocenianie Pojedynczej Walki</button> */}

        {/* <h2>Tryb Zorganizuj Bitwę</h2> */}
        {/* <button onClick={() => navigate('/organize-battle')}>Zorganizuj Bitwę</button> */}

        <button onClick={() => navigate('/report-feedback')}>{t('giveFeedback')}</button>
      </div>
    </div>
  );
}

export default Home;
