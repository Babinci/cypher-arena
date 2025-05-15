
// App.js

import './global.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import WordMode from './components/BattleMode/WordModes/WordMode';
import TopicMode from './components/BattleMode/WordModes/TopicMode';
import ImagesMode from './components/BattleMode/ImagesMode/ImagesMode';
import BeatsMode from './components/BattleMode/BeatsMode/BeatsMode';
import ReportFeedback from './components/UserManagement/ReportFeedback';
import { BackButton } from './components/Navigation/Buttons';
import Account from './components/Account/Account';
import BattleJudging from './components/BattleJudging/BattleJudging';
import OrganizeBattle from './components/OrganizeBattle/OrganizeBattle';
import ContrastingMode from './components/BattleMode/WordModes/ContrastingMode';
// import SecondWindow from './components/BattleMode/TopicMode/SecondWindow';

function App() {
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
          {/* <Route path="/second-window" element={<SecondWindow />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;