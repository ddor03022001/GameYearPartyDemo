import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TetDecorations from '../components/TetDecorations';
import { getCompanies, getGridSize } from '../utils/storage';
import { GAME_CONFIG } from '../data/config';
import * as api from '../utils/api';

const LeaderboardPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Get companies from local config
    const companies = getCompanies() || GAME_CONFIG.companies;
    const gridSize = getGridSize() || GAME_CONFIG.gridSize;
    const totalPieces = gridSize * gridSize;

    // Get stats from backend
    const stats = await api.getStats();

    // Build teams data
    const teamsData = companies.map(company => {
      // Check if completed (in leaderboard)
      const completionEntry = stats.leaderboard.find(entry => entry.company_id === company.id);

      // Get game state
      const gameState = stats.gameStates.find(g => g.companyId === company.id);
      const piecesFound = gameState?.revealedPieces?.length || 0;

      return {
        id: company.id,
        name: company.name,
        logo: company.logo,
        isCompleted: !!completionEntry,
        completedAt: completionEntry?.completed_at || null,
        timestamp: completionEntry?.timestamp || 0,
        piecesFound: piecesFound,
        totalPieces: totalPieces
      };
    });

    // Sort: completed first (by timestamp), then by pieces found
    teamsData.sort((a, b) => {
      if (a.isCompleted && b.isCompleted) {
        return a.timestamp - b.timestamp;
      }
      if (a.isCompleted) return -1;
      if (b.isCompleted) return 1;
      return b.piecesFound - a.piecesFound;
    });

    setTeams(teamsData);
    setLoading(false);
  };

  const getRankIcon = (index, isCompleted) => {
    if (!isCompleted) return '🎯';
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏆';
  };

  return (
    <div className="leaderboard-page">
      <TetDecorations />

      <div className="page-content">
        <div className="header">
          <Link to="/" className="back-link">← Về Trang Chủ</Link>
          <h1 className="tet-title">🏆 Bảng Xếp Hạng 🏆</h1>
          <button className="refresh-btn" onClick={loadData} disabled={loading}>
            🔄 Làm mới
          </button>
        </div>

        <div className="leaderboard glass-card">
          {loading ? (
            <div className="loading-state">
              <span>⏳</span>
              <p>Đang tải...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '4rem' }}>🎮</span>
              <p>Chưa có đội nào tham gia</p>
            </div>
          ) : (
            teams.map((team, index) => (
              <div
                key={team.id}
                className={`leaderboard-entry ${team.isCompleted ? 'completed' : 'in-progress'}`}
              >
                <span className="rank">{getRankIcon(index, team.isCompleted)}</span>
                <div className="team-info">
                  <span className="team-name">{team.name}</span>
                  {team.isCompleted ? (
                    <span className="completed-time">✅ {team.completedAt}</span>
                  ) : (
                    <span className="pieces-count">
                      🧩 {team.piecesFound} / {team.totalPieces} mảnh
                    </span>
                  )}
                </div>
                {team.isCompleted ? (
                  <span className="status completed">Hoàn thành</span>
                ) : (
                  <div className="progress-mini">
                    <div
                      className="progress-fill-mini"
                      style={{ width: `${(team.piecesFound / team.totalPieces) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .leaderboard-page {
          min-height: 100vh;
          padding: 40px 20px;
        }
        
        .page-content {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .back-link {
          color: #FFD700;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 20px;
          padding: 8px 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        
        .back-link:hover {
          background: rgba(255, 215, 0, 0.2);
        }
        
        .refresh-btn {
          margin-top: 15px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 20px;
          color: #FFD700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 215, 0, 0.2);
        }
        
        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 40px;
          color: #FFF8DC;
        }
        
        .loading-state span, .empty-state span {
          font-size: 3rem;
          display: block;
          margin-bottom: 15px;
        }
        
        .leaderboard-entry {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          animation: slideInLeft 0.3s ease forwards;
          opacity: 0;
        }
        
        .leaderboard-entry.completed {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
        }
        
        .leaderboard-entry.in-progress {
          background: rgba(255, 215, 0, 0.05);
          border-color: rgba(255, 215, 0, 0.2);
        }
        
        .rank {
          font-size: 1.5rem;
          min-width: 40px;
          text-align: center;
        }
        
        .team-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .team-name {
          color: #FFD700;
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .completed-time {
          font-size: 0.85rem;
          color: #86efac;
        }
        
        .pieces-count {
          font-size: 0.85rem;
          color: rgba(255, 248, 220, 0.7);
        }
        
        .status {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        .status.completed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.5);
        }
        
        .progress-mini {
          width: 60px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill-mini {
          height: 100%;
          background: linear-gradient(90deg, #C70039, #FFD700);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .leaderboard-entry:nth-child(1) { animation-delay: 0.1s; }
        .leaderboard-entry:nth-child(2) { animation-delay: 0.15s; }
        .leaderboard-entry:nth-child(3) { animation-delay: 0.2s; }
        .leaderboard-entry:nth-child(4) { animation-delay: 0.25s; }
        .leaderboard-entry:nth-child(5) { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default LeaderboardPage;
