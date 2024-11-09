
// App.js

import './global.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import WordMode from './components/BattleMode/WordModes/WordMode';
import TopicMode from './components/BattleMode/WordModes/TopicMode';
import ImagesMode from './components/BattleMode/ImagesMode/ImagesMode';
import ReportFeedback from './components/UserManagement/ReportFeedback';
import { BackButton } from './components/Navigation/Buttons';
import Account from './components/Account/Account';
import BattleJudging from './components/BattleJudging/BattleJudging';
import OrganizeBattle from './components/OrganizeBattle/OrganizeBattle';
import ContrastingMode from './components/BattleMode/ContrastingMode/ContrastingMode';
// import SecondWindow from './components/BattleMode/TopicMode/SecondWindow';

function App() {
  return (
    <BrowserRouter basename="/freestyle_app">
      <div className="App">
        <BackButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-mode" element={<WordMode />} />
          <Route path="/topic-mode" element={<TopicMode />} />
          <Route path="/image-mode" element={<ImagesMode />} />
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