
// App.js

import './global.css';
import './fire-theme.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import WordMode from './components/BattleMode/WordModes/WordMode';
import TopicMode from './components/BattleMode/WordModes/TopicMode';
import ImagesMode from './components/BattleMode/ImagesMode/ImagesMode';
import ImprovedImagesMode from './components/BattleMode/ImagesMode/ImprovedImagesMode';
import BeatsMode from './components/BattleMode/BeatsMode/BeatsMode';
import ErrorBoundary from './components/SharedUI/ErrorBoundary';
import ToastManager from './components/SharedUI/ToastNotification';
// Debug imports removed
import ReportFeedback from './components/UserManagement/ReportFeedback';
import { BackButton } from './components/Navigation/Buttons';
import Account from './components/Account/Account';
import BattleJudging from './components/BattleJudging/BattleJudging';
import OrganizeBattle from './components/OrganizeBattle/OrganizeBattle';
import ContrastingMode from './components/BattleMode/WordModes/ContrastingMode';
// import Settings from './components/Settings/Settings';
// import SecondWindow from './components/BattleMode/TopicMode/SecondWindow';
import { useState, useEffect } from 'react';

function App() {
  // Track font loading to ensure proper rendering
  const [, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if fonts API is available
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        if (document.fonts.check('1em Oswald')) {
          setFontsLoaded(true);
        } else {
          // Try again after a short delay
          setTimeout(() => {
            if (document.fonts.check('1em Oswald')) {
              setFontsLoaded(true);
            } else {
              // If still not available, continue anyway
              setFontsLoaded(true);
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
      <ErrorBoundary>
        <div className="App" >
          <ToastManager position={{ top: '20px', right: '20px' }} />
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
          {/* <Route path="/settings" element={<Settings />} /> */}
          {/* Debug routes removed */}
          {/* <Route path="/second-window" element={<SecondWindow />} /> */}
          <Route path="/image-mode-improved" element={<ImprovedImagesMode />} />
        </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;