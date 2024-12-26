import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserTracker from '../UserManagement/UserTracker';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
       <UserTracker />
      <h1>Apka prawdziwych freestylerów</h1>
      
      <div className="sidebar">
        <button onClick={() => navigate('/account')}>Account</button>
      </div>
      
      <div className="main-content">
        <h2>Rundy Freestyle</h2>
        <button onClick={() => navigate('/word-mode')}>Word Mode</button>
        <button onClick={() => navigate('/image-mode')}>Obrazki</button>
        <button onClick={() => navigate('/contrasting-mode')}>Rap Avatar Duel</button>
        <button onClick={() => navigate('/topic-mode')}>Temator</button>
        
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
