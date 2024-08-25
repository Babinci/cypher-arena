import './global.css'; // Import the global CSS file

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home/Home';
import WordMode from './components/BattleMode/WordModes/WordMode';
import ImagesMode from './components/BattleMode/ImagesMode/ImagesMode';
import ReportFeedback from './components/UserManagement/ReportFeedback';

function App() {
  return (
    <BrowserRouter basename="/freestyle_app">
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-mode" element={<WordMode />} />
          <Route path="/image-mode" element={<ImagesMode />} />
          <Route path="/report-feedback" element={<ReportFeedback />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;