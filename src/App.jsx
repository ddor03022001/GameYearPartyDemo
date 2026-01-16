import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionPage from './pages/QuestionPage';
import MemePage from './pages/MemePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import PrintQRPage from './pages/PrintQRPage';
import './styles/tet-theme.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/question/:qrId" element={<QuestionPage />} />
        <Route path="/meme/:qrId" element={<MemePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/print-qr" element={<PrintQRPage />} />
      </Routes>
    </Router>
  );
}

export default App;
