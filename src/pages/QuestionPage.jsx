import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TetDecorations from '../components/TetDecorations';
import QuestionCard from '../components/QuestionCard';
import CompanySelector from '../components/CompanySelector';
import LogoPuzzle from '../components/LogoPuzzle';
import Celebration from '../components/Celebration';
import Popup from '../components/Popup';
import {
    getRandomQuestion,
    handleCorrectAnswer,
    getRandomPieceIndex,
    isPuzzleComplete,
    formatDuration
} from '../utils/gameLogic';
import {
    isQRCodeUsed,
    markQRCodeUsed,
    getGameState,
    revealPiece,
    completeGame,
    addToLeaderboard,
    getGridSize
} from '../utils/storage';
import { GAME_CONFIG } from '../data/config';
import { isValidQRCode, getQRType } from '../data/qrCodes';

const QuestionPage = () => {
    const { qrId } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState('question'); // 'question', 'company', 'reveal', 'complete'
    const [question, setQuestion] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [newPieceIndex, setNewPieceIndex] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [alreadyUsed, setAlreadyUsed] = useState(false);
    const [invalidCode, setInvalidCode] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);

    useEffect(() => {
        // Check if valid question QR code
        if (!isValidQRCode(qrId)) {
            setInvalidCode(true);
            return;
        }

        // If it's a meme QR, redirect to meme page
        if (getQRType(qrId) === 'meme') {
            navigate(`/meme/${qrId}`, { replace: true });
            return;
        }

        // Check if QR code is already used
        if (isQRCodeUsed(qrId)) {
            setAlreadyUsed(true);
            return;
        }

        // Get random question
        const randomQuestion = getRandomQuestion();
        setQuestion(randomQuestion);
    }, [qrId, navigate]);

    const handleCorrectAnswerSubmit = () => {
        // Decrease question priority
        handleCorrectAnswer(question.id);

        // Move to company selection
        setStep('company');
    };

    const handleCompanySelect = (company) => {
        setSelectedCompany(company);

        // Get current game state for this company
        const state = getGameState(company.id);
        setGameState(state);

        // Get random piece to reveal
        const gridSize = getGridSize() || GAME_CONFIG.gridSize;
        const pieceIndex = getRandomPieceIndex(state.revealedPieces, gridSize);

        if (pieceIndex !== null) {
            // Reveal the piece
            const newState = revealPiece(company.id, pieceIndex);
            setGameState(newState);
            setNewPieceIndex(pieceIndex);

            // Mark QR as used
            markQRCodeUsed(qrId);

            // Check if puzzle is complete
            const gridSizeValue = getGridSize() || GAME_CONFIG.gridSize;
            if (isPuzzleComplete(newState.revealedPieces, gridSizeValue)) {
                // Auto-save with company name
                completeGame(company.id);

                addToLeaderboard({
                    playerName: company.name,
                    companyId: company.id,
                    companyName: company.name,
                    // completedAt and timestamp will be added automatically by addToLeaderboard
                });

                setStep('complete');
                // Show celebration immediately
                setTimeout(() => {
                    setShowCelebration(true);
                }, 1500); // Wait for puzzle animation
            } else {
                setStep('reveal');
            }
        } else {
            // All pieces already revealed - shouldn't happen normally
            setStep('complete');
        }
    };

    const handleSaveScore = () => {
        if (!playerName.trim()) return;

        // Complete the game and save to leaderboard
        const finalState = completeGame(selectedCompany.id);
        const duration = finalState.endTime - finalState.startTime;

        addToLeaderboard({
            playerName: playerName.trim(),
            companyId: selectedCompany.id,
            companyName: selectedCompany.name,
            duration,
            completedAt: new Date().toISOString(),
        });

        setShowCelebration(true);
        setShowNameInput(false);
    };

    const handleCelebrationComplete = () => {
        // Close this tab or redirect to leaderboard
        window.close();
        // Fallback if window.close() doesn't work
        setTimeout(() => {
            navigate('/leaderboard');
        }, 500);
    };

    const handleCloseTab = () => {
        window.close();
        // Fallback
        setTimeout(() => {
            navigate('/');
        }, 500);
    };

    // Invalid QR code
    if (invalidCode) {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content glass-card">
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '5rem' }}>❌</span>
                        <h2 style={{ color: '#FFD700', margin: '20px 0' }}>Mã QR Không Hợp Lệ</h2>
                        <p style={{ color: '#FFF8DC', marginBottom: '30px' }}>
                            Mã QR này không tồn tại trong hệ thống.
                            <br />
                            Vui lòng kiểm tra lại!
                        </p>
                        <button className="tet-button" onClick={handleCloseTab}>
                            Đóng Tab
                        </button>
                    </div>
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    // Already used QR
    if (alreadyUsed) {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content glass-card">
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '5rem' }}>🚫</span>
                        <h2 style={{ color: '#FFD700', margin: '20px 0' }}>Mã QR Đã Được Sử Dụng</h2>
                        <p style={{ color: '#FFF8DC', marginBottom: '30px' }}>
                            Mã QR này đã được sử dụng trước đó.
                            <br />
                            Vui lòng quét mã QR khác!
                        </p>
                        <button className="tet-button" onClick={handleCloseTab}>
                            Đóng Tab
                        </button>
                    </div>
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    return (
        <div className="question-page">
            <TetDecorations />

            <div className="page-content">
                {/* Step 1: Question */}
                {step === 'question' && question && (
                    <QuestionCard
                        question={question}
                        onCorrect={handleCorrectAnswerSubmit}
                    />
                )}

                {/* Step 2: Company Selection */}
                {step === 'company' && (
                    <div className="glass-card">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '3rem' }}>🎉</span>
                            <h2 style={{ color: '#22c55e', margin: '10px 0' }}>Trả Lời Chính Xác!</h2>
                        </div>
                        <CompanySelector onSelect={handleCompanySelect} />
                    </div>
                )}

                {/* Step 3: Reveal Piece */}
                {step === 'reveal' && selectedCompany && gameState && (
                    <div className="glass-card reveal-section">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '3rem' }}>✨</span>
                            <h2 style={{ color: '#FFD700' }}>Mảnh Ghép Mới!</h2>
                            <p style={{ color: '#FFF8DC' }}>{selectedCompany.name}</p>
                        </div>

                        <LogoPuzzle
                            companyId={selectedCompany.id}
                            logoUrl={selectedCompany.logo}
                            revealedPieces={gameState.revealedPieces}
                            newlyRevealed={newPieceIndex}
                        />

                        <button
                            className="tet-button"
                            onClick={handleCloseTab}
                            style={{ marginTop: '30px', width: '100%' }}
                        >
                            Tiếp Tục Thu Thập
                        </button>
                    </div>
                )}

                {/* Step 4: Complete */}
                {step === 'complete' && selectedCompany && gameState && (
                    <div className="glass-card complete-section">
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '4rem' }}>🏆</span>
                            <h2 style={{ color: '#FFD700', margin: '10px 0' }}>HOÀN THÀNH!</h2>
                            <p style={{ color: '#22c55e', fontSize: '1.2rem' }}>
                                Bạn đã thu thập đủ tất cả mảnh ghép!
                            </p>
                            <p style={{ color: '#FFF8DC', fontSize: '1.5rem', marginTop: '10px' }}>
                                🎉 {selectedCompany.name} 🎉
                            </p>
                        </div>

                        <LogoPuzzle
                            companyId={selectedCompany.id}
                            logoUrl={selectedCompany.logo}
                            revealedPieces={gameState.revealedPieces}
                        />

                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                className="tet-button"
                                onClick={() => navigate('/leaderboard')}
                            >
                                🏆 Xem Bảng Xếp Hạng
                            </button>
                            <button
                                className="tet-button secondary"
                                onClick={handleCloseTab}
                            >
                                Đóng Tab
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCelebration && (
                <Celebration onComplete={handleCelebrationComplete} />
            )}

            <style>{pageStyles}</style>
        </div>
    );
};

const pageStyles = `
  .question-page {
    min-height: 100vh;
    padding: 80px 20px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .page-content {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 600px;
  }
  
  .reveal-section,
  .complete-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .name-input-section {
    width: 100%;
    max-width: 300px;
    margin-top: 30px;
  }
  
  .name-input {
    width: 100%;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 215, 0, 0.5);
    border-radius: 10px;
    color: #FFF8DC;
    font-size: 1rem;
    text-align: center;
  }
  
  .name-input:focus {
    outline: none;
    border-color: #FFD700;
  }
  
  .name-input::placeholder {
    color: rgba(255, 248, 220, 0.5);
  }
`;

export default QuestionPage;
