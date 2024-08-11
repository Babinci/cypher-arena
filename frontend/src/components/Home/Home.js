import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
function Home() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="home">
      <h1>Welcome to the App</h1>
      <button onClick={() => navigate('/word-mode')}>Go to Word Mode</button>
      <button onClick={() => navigate('/image-mode')}>Go to Image Mode</button> {/* Add this button */}
    </div>
  );
}

export default Home;