import React, { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../data/config';
import { getCompanies, getGridSize } from '../utils/storage';
import * as api from '../utils/api';
import backgroundImg from '../assets/Artboard_10.png';

const RankingBoard = () => {
    const [data, setData] = useState({
        answerHistory: [],
        gameStates: [],
        leaderboard: [],
        gameStarted: false
    });

    const companies = getCompanies() || GAME_CONFIG.companies;
    const gridSize = getGridSize() || GAME_CONFIG.gridSize;
    const totalPieces = gridSize * gridSize;

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
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

    const getAnswerCount = (companyId) => {
        return data.answerHistory.filter(a => a.company_id === companyId).length;
    };

    const getLastTimestamp = (companyId) => {
        const answers = data.answerHistory.filter(a => a.company_id === companyId);
        if (answers.length === 0) return 0;
        return Math.max(...answers.map(a => a.timestamp || 0));
    };

    // Sort companies by progress
    const sortedCompanies = companies
        .map(company => ({
            ...company,
            state: getCompanyState(company.id),
            answerCount: getAnswerCount(company.id),
            lastTimestamp: getLastTimestamp(company.id)
        }))
        .sort((a, b) => {
            const pieceDiff = b.state.revealedPieces.length - a.state.revealedPieces.length;
            if (pieceDiff !== 0) return pieceDiff;
            return a.lastTimestamp - b.lastTimestamp;
        });

    return (
        <div className="ranking-board" style={{ backgroundImage: `url(${backgroundImg})` }}>

            {/* Main Content Wrapper to center everything */}
            <div className="main-content">

                {/* Title Section */}
                <div className="board-title">
                    <div className="sub-title">BẢNG XẾP HẠNG</div>
                    <div className="main-title">CUỘC ĐUA THU THẬP LOGO</div>
                </div>

                {/* The Cream Colored Card */}
                <div className="ranking-card">
                    {/* Table Header */}
                    <div className="table-header">
                        <div className="col-company-header">TÊN CÔNG TY</div>
                        <div className="col-answers-header">SỐ CÂU TRẢ LỜI ĐÚNG</div>
                        <div className="col-pieces-header">SỐ MẢNH GHÉP TÌM ĐƯỢC</div>
                    </div>

                    {/* Scrollable List */}
                    <div className="ranking-list">
                        {sortedCompanies.map((company, index) => {
                            const piecesCount = company.state.revealedPieces.length;
                            const progress = (piecesCount / totalPieces) * 100;

                            return (
                                <div key={company.id} className="ranking-row">
                                    {/* Rank & Logo & Name */}
                                    <div className="col-company">
                                        <div className="rank-box">
                                            <span>#{index + 1}</span>
                                        </div>
                                        <div className="company-logo">
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect fill="%23ddd" width="50" height="50" rx="8"/></svg>';
                                                }}
                                            />
                                        </div>
                                        <span className="company-name">{company.name}</span>
                                    </div>

                                    {/* Answer Count */}
                                    <div className="col-answers">
                                        <span className="answer-text">
                                            <span className="highlight-red">{company.answerCount}</span>
                                            <span className="divider">/</span>
                                            {totalPieces} {/* Assuming total questions usually matches grid size or config */}
                                        </span>
                                    </div>

                                    {/* Progress Bar with Gold Box */}
                                    <div className="col-pieces">
                                        <div className="gold-progress-container">
                                            <div className="gold-box">
                                                {piecesCount}/{totalPieces}
                                            </div>
                                            <div className="bar-track">
                                                <div
                                                    className="bar-fill"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;700;900&display=swap');

    * {
        box-sizing: border-box;
    }

    .ranking-board {
        width: 100vw;
        height: 100vh;
        background-size: cover;
        background-position: center top;
        background-repeat: no-repeat;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Roboto', sans-serif;
    }

    .main-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 90%;
        max-width: 1100px;
        height: 65vh; /* Adjust based on where the scroll ends */
        margin-top: 20vh; /* Push down from the top scroll */
    }

    /* TITLE SECTION */
    .board-title {
        text-align: center;
        margin-bottom: 20px;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .sub-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.2rem;
        letter-spacing: 1px;
        margin-bottom: 5px;
        color: #fff;
    }

    .main-title {
        font-family: 'Roboto', sans-serif;
        font-weight: 900;
        font-size: 2.2rem;
        text-transform: uppercase;
        color: #FFF;
        letter-spacing: 1px;
    }

    /* CARD CONTAINER (The Cream Box) */
    .ranking-card {
        background-color: #FFF9E6; /* Cream color */
        border: 2px solid #D4A04A; /* Gold border */
        border-radius: 30px;
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 40px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        overflow: hidden;
        position: relative;
    }

    /* TABLE HEADER */
    .table-header {
        display: grid;
        grid-template-columns: 2.5fr 1fr 1.5fr;
        padding: 0 0 15px 0;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        margin-bottom: 10px;
    }

    .col-company-header, .col-answers-header, .col-pieces-header {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 0.9rem;
        color: #5D4037; /* Dark Brown */
        font-weight: 600;
        letter-spacing: 0.5px;
    }

    .col-answers-header, .col-pieces-header {
        text-align: center;
    }

    .col-pieces-header {
        text-align: left;
        padding-left: 20px;
    }

    /* LIST & ROWS */
    .ranking-list {
        flex: 1;
        overflow-y: auto;
        padding-right: 5px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    /* Scrollbar Styling */
    .ranking-list::-webkit-scrollbar {
        width: 6px;
    }
    .ranking-list::-webkit-scrollbar-thumb {
        background: #D4A04A;
        border-radius: 3px;
    }

    .ranking-row {
        display: grid;
        grid-template-columns: 2.5fr 1fr 1.5fr;
        align-items: center;
        padding: 5px 0;
    }

    /* COMPANY COLUMN */
    .col-company {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .rank-box {
        width: 38px;
        height: 38px;
        background: linear-gradient(135deg, #6D4C41, #4E342E); /* Brown gradient */
        border-radius: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #FFD700; /* Gold text */
        font-weight: bold;
        font-size: 1.1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        flex-shrink: 0;
    }

    .company-logo {
        width: 45px;
        height: 45px;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        flex-shrink: 0;
    }

    .company-logo img {
        width: 80%;
        height: 80%;
        object-fit: contain;
    }

    .company-name {
        font-family: 'Playfair Display', serif;
        font-weight: bold;
        text-transform: uppercase;
        color: #3E2723;
        font-size: 1rem;
        letter-spacing: 0.5px;
    }

    /* ANSWER COLUMN */
    .col-answers {
        text-align: center;
    }

    .answer-text {
        font-weight: bold;
        font-size: 1.1rem;
        color: #8D6E63;
    }

    .highlight-red {
        color: #C62828; /* Red color for correct answers */
    }

    .divider {
        margin: 0 3px;
        color: #8D6E63;
    }

    /* PIECES COLUMN (PROGRESS BAR) */
    .col-pieces {
        display: flex;
        justify-content: flex-start;
        padding-left: 10px;
    }

    .gold-progress-container {
        display: flex;
        align-items: center;
        gap: 0; /* Box attaches to bar */
        width: 100%;
        max-width: 250px;
    }

    .gold-box {
        background: linear-gradient(180deg, #EBC87E 0%, #C49A6C 100%);
        color: #5D3A1A;
        font-weight: bold;
        font-size: 0.85rem;
        padding: 6px 10px;
        border-radius: 4px;
        min-width: 45px;
        text-align: center;
        z-index: 2; /* Sit on top */
        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }

    .bar-track {
        flex: 1;
        height: 12px;
        background-color: #E8EAF6; /* Light purple/blue grey background */
        border-radius: 0 6px 6px 0;
        margin-left: -5px; /* Pull inside the box slightly if needed, or 0 */
        position: relative;
        z-index: 1;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #F0E68C, #D4A04A);
        border-radius: 0 6px 6px 0;
        transition: width 0.5s ease;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
        .main-content {
            width: 95%;
            margin-top: 15vh;
        }

        .ranking-card {
            padding: 15px;
        }

        .table-header {
            font-size: 0.7rem;
        }

        .col-company-header {
            display: none; /* Hide header text on mobile if tight */
        }
        
        .main-title {
            font-size: 1.5rem;
        }

        .company-name {
            font-size: 0.8rem;
        }

        .rank-box {
            width: 30px;
            height: 30px;
            font-size: 0.9rem;
        }
        
        .company-logo {
            width: 35px;
            height: 35px;
        }
    }
`;

export default RankingBoard;