
// App.js

import './global.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import WordMode from './components/BattleMode/WordModes/WordMode';
import TopicMode from './components/BattleMode/WordModes/TopicMode';
import ImagesMode from './components/BattleMode/ImagesMode/ImagesMode';
import BeatsMode from './components/BattleMode/BeatsMode/BeatsMode';
// Debug imports removed
import ReportFeedback from './components/UserManagement/ReportFeedback';
import { BackButton } from './components/Navigation/Buttons';
import Account from './components/Account/Account';
import BattleJudging from './components/BattleJudging/BattleJudging';
import OrganizeBattle from './components/OrganizeBattle/OrganizeBattle';
import ContrastingMode from './components/BattleMode/WordModes/ContrastingMode';
// import SecondWindow from './components/BattleMode/TopicMode/SecondWindow';
import { useState, useEffect } from 'react';

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if fonts API is available
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('Document fonts ready');
        if (document.fonts.check('1em Oswald')) {
          console.log('Oswald font is available');
          setFontsLoaded(true);
        } else {
          console.warn('Oswald font not available, retrying...');
          // Try again after a short delay
          setTimeout(() => {
            if (document.fonts.check('1em Oswald')) {
              console.log('Oswald font now available');
              setFontsLoaded(true);
            } else {
              console.error('Oswald font still not available');
              setFontsLoaded(true); // Continue anyway
            }
          }, 500);
        }
      });
    } else {
      // Fonts API not available, proceed anyway
      setFontsLoaded(true);
    }
  }, []);

  return (
    <BrowserRouter future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <div className="App" >
        <BackButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-mode" element={<WordMode />} />
          <Route path="/topic-mode" element={<TopicMode />} />
          <Route path="/image-mode" element={<ImagesMode />} />
          <Route path="/beats-mode" element={<BeatsMode />} />
          <Route path="/report-feedback" element={<ReportFeedback />} />
          <Route path="/account" element={<Account />} />
          <Route path="/battle-judging" element={<BattleJudging />} />
          <Route path="/organize-battle" element={<OrganizeBattle />} />
          <Route path="/contrasting-mode" element={<ContrastingMode />} />
          {/* Debug routes removed */}
          {/* <Route path="/second-window" element={<SecondWindow />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;