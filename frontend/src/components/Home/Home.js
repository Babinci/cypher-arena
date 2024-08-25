import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="home">
      <h1>Apka prawdziwych freestylowców</h1>
      <button onClick={() => navigate('/word-mode')}>Word Mode</button>
      <button onClick={() => navigate('/image-mode')}>Obrazki</button>
      <button onClick={() => navigate('/report-feedback')}>Daj Feedback!</button>
    </div>
  );
}

export default Home;