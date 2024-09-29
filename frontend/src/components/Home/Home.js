import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Apka prawdziwych freestylerów</h1>
      
      <div className="sidebar">
        <button onClick={() => navigate('/account')}>Account</button>
      </div>
      
      <div className="main-content">
        <h2>Tryb Freestyle</h2>
        <button onClick={() => navigate('/word-mode')}>Word Mode</button>
        <button onClick={() => navigate('/image-mode')}>Obrazki</button>
        <button onClick={() => navigate('/contrasting-mode')}>Contrasting Mode</button>
        
        <h2>Tryb Ocenianie Walki</h2>
        <button onClick={() => navigate('/battle-judging')}>Ocenianie Pojedynczej Walki</button>
        
        <h2>Tryb Zorganizuj Bitwę</h2>
        <button onClick={() => navigate('/organize-battle')}>Zorganizuj Bitwę</button>
        
        <button onClick={() => navigate('/report-feedback')}>Daj Feedback!</button>
      </div>
    </div>
  );
}

export default Home;
