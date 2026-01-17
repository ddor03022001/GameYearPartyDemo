import React, { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../data/config';
import { getCompanies, getGridSize } from '../utils/storage';
import * as api from '../utils/api';

const LiveDashboard = () => {
    const [data, setData] = useState({
        answerHistory: [],
        gameStates: [],
        leaderboard: [],
        gameStarted: false
    });
    const [loading, setLoading] = useState(true);

    const companies = getCompanies() || GAME_CONFIG.companies;
    const gridSize = getGridSize() || GAME_CONFIG.gridSize;
    const totalPieces = gridSize * gridSize;

    useEffect(() => {
        // Initial load after 3 seconds
        const initialTimer = setTimeout(() => {
            loadData();
            setLoading(false);
        }, 3000);

        // Refresh every 2 seconds
        const interval = setInterval(loadData, 2000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    const loadData = async () => {
        try {
            const result = await api.getLiveDashboard();
            setData(result);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        }
    };

    const getCompanyState = (companyId) => {
        return data.gameStates.find(s => s.companyId === companyId) || { revealedPieces: [], isCompleted: false };
    };

    const isCompanyCompleted = (companyId) => {
        return data.leaderboard.some(l => l.company_id === companyId);
    };

    const getCompanyRank = (companyId) => {
        const index = data.leaderboard.findIndex(l => l.company_id === companyId);
        return index >= 0 ? index + 1 : null;
    };

    // Lấy timestamp của lần cuối công ty nhận mảnh
    const getLastTimestamp = (companyId) => {
        const answers = data.answerHistory.filter(a => a.company_id === companyId);
        if (answers.length === 0) return 0;
        // Timestamp lớn nhất = lần gần nhất
        return Math.max(...answers.map(a => a.timestamp || 0));
    };

    // Sort companies by progress
    const sortedCompanies = companies
        .map(company => ({
            ...company,
            state: getCompanyState(company.id),
            completed: isCompanyCompleted(company.id),
            rank: getCompanyRank(company.id),
            lastTimestamp: getLastTimestamp(company.id)
        }))
        .sort((a, b) => {
            // Completed ones first (by rank)
            if (a.completed && b.completed) {
                return (a.rank || 999) - (b.rank || 999);
            }
            if (a.completed) return -1;
            if (b.completed) return 1;

            // By pieces count
            const pieceDiff = b.state.revealedPieces.length - a.state.revealedPieces.length;
            if (pieceDiff !== 0) return pieceDiff;

            // Nếu cùng số mảnh: đội đạt được TRƯỚC (timestamp nhỏ hơn) xếp trên
            return a.lastTimestamp - b.lastTimestamp;
        });

    if (loading) {
        return (
            <div className="live-dashboard loading">
                <div className="loading-content">
                    <span className="loading-emoji">🎮</span>
                    <h1>SEACORP YEAR END PARTY</h1>
                    <p>Đang tải dữ liệu...</p>
                    <div className="loading-bar">
                        <div className="loading-progress"></div>
                    </div>
                </div>
                <style>{styles}</style>
            </div>
        );
    }

    return (
        <div className="live-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1>🎮 LIVE DASHBOARD</h1>
                <div className={`game-status ${data.gameStarted ? 'active' : 'inactive'}`}>
                    {data.gameStarted ? '🟢 GAME ĐANG DIỄN RA' : '🔴 GAME CHƯA BẮT ĐẦU'}
                </div>
            </div>

            <div className="dashboard-content">
                {/* Left Column - Answer History */}
                <div className="column left-column">
                    <h2>📝 CÂU HỎI ĐÃ TRẢ LỜI</h2>
                    <div className="answer-list">
                        {data.answerHistory.length === 0 ? (
                            <div className="empty-state">
                                <span>⏳</span>
                                <p>Chưa có câu trả lời nào</p>
                            </div>
                        ) : (
                            data.answerHistory.map((answer, index) => (
                                <div key={answer.id} className={`answer-card ${index === 0 ? 'latest' : ''}`}>
                                    <div className="answer-header">
                                        <span className="qr-code">{answer.qr_id}</span>
                                        <span className="company-badge">{answer.company_name}</span>
                                    </div>
                                    <div className="question-text">{answer.question}</div>
                                    <div className="correct-answer">
                                        ✅ {answer.correct_answer}
                                    </div>
                                    <div className="piece-info">
                                        🧩 Mảnh #{answer.piece_index + 1}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column - Ranking */}
                <div className="column right-column">
                    <h2>🏆 BẢNG XẾP HẠNG</h2>
                    <div className="teams-list">
                        {sortedCompanies.map((company, visualIndex) => {
                            const progress = (company.state.revealedPieces.length / totalPieces) * 100;

                            return (
                                <div
                                    key={company.id}
                                    className={`team-row ${company.completed ? 'completed' : ''}`}
                                    style={{ animationDelay: `${visualIndex * 0.05}s` }}
                                >
                                    {/* Rank Number */}
                                    <div className={`rank-number ${company.completed ? 'winner' : ''} ${visualIndex < 3 ? `top-${visualIndex + 1}` : ''}`}>
                                        {company.completed ? `🏆` : `#${visualIndex + 1}`}
                                    </div>

                                    {/* Logo */}
                                    <div className="team-logo-small">
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect fill="%23333" width="50" height="50"/><text x="25" y="30" text-anchor="middle" fill="%23FFD700" font-size="8">LOGO</text></svg>';
                                            }}
                                        />
                                    </div>

                                    {/* Name & Mini Puzzle */}
                                    <div className="team-info">
                                        <div className="team-name-row">{company.name}</div>
                                        <div className="mini-puzzle-row" style={{
                                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`
                                        }}>
                                            {Array.from({ length: totalPieces }).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`mini-piece-small ${company.state.revealedPieces.includes(idx) ? 'revealed' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="progress-section">
                                        <div className="progress-bar-row">
                                            <div
                                                className="progress-fill-row"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="pieces-count">
                                            {company.state.revealedPieces.length}/{totalPieces}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className={`status-badge ${company.completed ? 'completed' : ''}`}>
                                        {company.completed ? (
                                            <span className="completed-text">🎉 #{company.rank}</span>
                                        ) : (
                                            <span className="progress-percent">{Math.round(progress)}%</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{styles}</style>
        </div>
    );
};

const styles = `
    .live-dashboard {
        min-height: 100vh;
        background: linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 50%, #1a0a0a 100%);
        color: white;
        padding: 20px;
        font-family: 'Roboto', sans-serif;
    }

    .live-dashboard.loading {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .loading-content {
        text-align: center;
    }

    .loading-emoji {
        font-size: 6rem;
        display: block;
        animation: bounce 1s infinite;
    }

    .loading-content h1 {
        color: #FFD700;
        font-size: 2.5rem;
        margin: 20px 0;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    }

    .loading-bar {
        width: 300px;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
        margin: 20px auto;
    }

    .loading-progress {
        height: 100%;
        background: linear-gradient(90deg, #FFD700, #f59e0b);
        width: 0;
        animation: loading 3s ease-in-out forwards;
    }

    @keyframes loading {
        0% { width: 0; }
        100% { width: 100%; }
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }

    .dashboard-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
    }

    .dashboard-header h1 {
        color: #FFD700;
        font-size: 2.5rem;
        margin: 0 0 15px 0;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    }

    .game-status {
        display: inline-block;
        padding: 10px 30px;
        border-radius: 50px;
        font-size: 1.2rem;
        font-weight: bold;
    }

    .game-status.active {
        background: rgba(34, 197, 94, 0.2);
        border: 2px solid #22c55e;
        color: #22c55e;
    }

    .game-status.inactive {
        background: rgba(239, 68, 68, 0.2);
        border: 2px solid #ef4444;
        color: #ef4444;
    }

    .dashboard-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        max-width: 1800px;
        margin: 0 auto;
    }

    .column {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        padding: 25px;
        border: 1px solid rgba(255, 215, 0, 0.2);
    }

    .column h2 {
        color: #FFD700;
        margin: 0 0 20px 0;
        font-size: 1.5rem;
        text-align: center;
    }

    /* Left Column - Answer History */
    .answer-list {
        max-height: calc(100vh - 250px);
        overflow-y: auto;
        padding-right: 10px;
    }

    .answer-list::-webkit-scrollbar {
        width: 6px;
    }

    .answer-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }

    .answer-list::-webkit-scrollbar-thumb {
        background: #FFD700;
        border-radius: 3px;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: rgba(255, 255, 255, 0.5);
    }

    .empty-state span {
        font-size: 4rem;
        display: block;
        margin-bottom: 15px;
    }

    .answer-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 15px;
        border: 1px solid rgba(255, 215, 0, 0.2);
        transition: all 0.3s ease;
    }

    .answer-card.latest {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
        animation: slideIn 0.5s ease;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .answer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .qr-code {
        background: rgba(255, 215, 0, 0.2);
        color: #FFD700;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: bold;
    }

    .company-badge {
        background: rgba(168, 85, 247, 0.2);
        color: #a855f7;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: bold;
    }

    .question-text {
        color: #FFF8DC;
        font-size: 1.1rem;
        line-height: 1.5;
        margin-bottom: 12px;
    }

    .correct-answer {
        color: #22c55e;
        font-weight: bold;
        font-size: 1rem;
        margin-bottom: 8px;
    }

    .piece-info {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
    }

    /* Right Column - Teams List */
    .teams-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: calc(100vh - 250px);
        overflow-y: auto;
        padding-right: 10px;
    }

    .team-row {
        display: flex;
        align-items: center;
        gap: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 15px 20px;
        border: 2px solid rgba(255, 215, 0, 0.2);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        animation: fadeSlideIn 0.5s ease forwards;
        opacity: 0;
    }

    @keyframes fadeSlideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .team-row.completed {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
    }

    .rank-number {
        min-width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: bold;
        color: #FFF8DC;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
    }

    .rank-number.top-1 {
        background: linear-gradient(135deg, #FFD700, #f59e0b);
        color: #1a0a0a;
        font-size: 1.4rem;
    }

    .rank-number.top-2 {
        background: linear-gradient(135deg, #C0C0C0, #a0a0a0);
        color: #1a0a0a;
    }

    .rank-number.top-3 {
        background: linear-gradient(135deg, #CD7F32, #A0522D);
        color: white;
    }

    .rank-number.winner {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        animation: pulse 1s infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    .team-logo-small {
        width: 55px;
        height: 55px;
        border-radius: 10px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    }

    .team-logo-small img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .team-info {
        flex: 1;
        min-width: 0;
    }

    .team-name-row {
        color: #FFF8DC;
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .mini-puzzle-row {
        display: grid;
        gap: 2px;
        width: fit-content;
    }

    .mini-piece-small {
        width: 18px;
        height: 18px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 2px;
        transition: all 0.3s ease;
    }

    .mini-piece-small.revealed {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }

    .progress-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        min-width: 80px;
    }

    .progress-bar-row {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill-row {
        height: 100%;
        background: linear-gradient(90deg, #FFD700, #22c55e);
        transition: width 0.5s ease;
    }

    .pieces-count {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.85rem;
    }

    .status-badge {
        min-width: 80px;
        text-align: center;
        padding: 8px 15px;
        border-radius: 20px;
        font-weight: bold;
        background: rgba(255, 255, 255, 0.1);
    }

    .status-badge.completed {
        background: rgba(34, 197, 94, 0.2);
    }

    .progress-percent {
        color: #FFD700;
        font-size: 1.1rem;
    }

    .completed-text {
        color: #22c55e;
        font-size: 1rem;
    }

    @media (max-width: 1200px) {
        .dashboard-content {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 768px) {
        .team-row {
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .progress-section, .status-badge {
            width: 100%;
        }
    }
`;

export default LiveDashboard;
