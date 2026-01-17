import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TetDecorations from '../components/TetDecorations';
import QuestionCard from '../components/QuestionCard';
import CompanySelector from '../components/CompanySelector';
import LogoPuzzle from '../components/LogoPuzzle';
import Celebration from '../components/Celebration';
import {
    getRandomQuestion,
    handleCorrectAnswer,
    getRandomPieceIndex,
} from '../utils/gameLogic';
import { getGridSize } from '../utils/storage';
import { GAME_CONFIG } from '../data/config';
import { isValidQRCode, getQRType } from '../data/qrCodes';
import * as api from '../utils/api';

const QuestionPage = () => {
    const { qrId } = useParams();
    const navigate = useNavigate();
    const hasChecked = useRef(false);

    const [step, setStep] = useState('loading'); // 'loading', 'question', 'company', 'reveal', 'complete', 'used', 'invalid'
    const [question, setQuestion] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [newPieceIndex, setNewPieceIndex] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        checkAndLoadQuestion();
    }, [qrId]);

    const checkAndLoadQuestion = async () => {
        // Check if game is started
        const isStarted = await api.checkGameStarted();
        if (!isStarted) {
            setStep('not_started');
            return;
        }

        // Check if valid question QR code
        if (!qrId || !qrId.startsWith('Q')) {
            if (qrId && qrId.startsWith('M')) {
                navigate(`/meme/${qrId}`, { replace: true });
                return;
            }
            setStep('invalid');
            return;
        }

        // Check if QR code is already used (from backend)
        const isUsed = await api.checkQRUsed(qrId);
        if (isUsed) {
            setStep('used');
            return;
        }

        // ⚡ ĐÁNH DẤU QR ĐÃ DÙNG NGAY LẬP TỨC (trước khi hiển thị câu hỏi)
        // Điều này ngăn nhiều người quét cùng 1 QR
        await api.markQRUsed(qrId);

        // Get random question
        const randomQuestion = getRandomQuestion();
        setQuestion(randomQuestion);
        setStep('question');
    };

    const handleCorrectAnswerSubmit = () => {
        handleCorrectAnswer(question.id);
        setStep('company');
    };

    const handleCompanySelect = async (company) => {
        if (isProcessing) return;
        setIsProcessing(true);

        setSelectedCompany(company);

        // Get current game state from backend
        const state = await api.getGameState(company.id);

        // Get random piece to reveal
        const gridSize = getGridSize() || GAME_CONFIG.gridSize;
        const pieceIndex = getRandomPieceIndex(state.revealedPieces, gridSize);

        if (pieceIndex !== null) {
            // Reveal the piece via backend
            const result = await api.revealPiece(company.id, pieceIndex, gridSize);

            if (result.success) {
                setGameState({
                    companyId: company.id,
                    revealedPieces: result.revealedPieces
                });
                setNewPieceIndex(result.newPieceIndex);

                // Lưu vào lịch sử để hiển thị trên Live Dashboard
                const correctAnswerText = question.answers[question.correctAnswer];
                await api.addAnswerHistory(
                    qrId,
                    question.question,
                    correctAnswerText,
                    company.id,
                    company.name,
                    result.newPieceIndex
                );

                if (result.isCompleted) {
                    // Add to leaderboard
                    const completedAt = new Date().toLocaleString('vi-VN');
                    await api.addToLeaderboard(company.id, company.name, completedAt);

                    setStep('complete');
                    setTimeout(() => {
                        setShowCelebration(true);
                    }, 1500);
                } else {
                    setStep('reveal');
                }
            } else {
                // All pieces already revealed
                setGameState({
                    companyId: company.id,
                    revealedPieces: result.revealedPieces || []
                });
                setStep('complete');
            }
        } else {
            setStep('complete');
        }

        setIsProcessing(false);
    };

    const handleCelebrationComplete = () => {
        window.close();
        setTimeout(() => navigate('/leaderboard'), 500);
    };

    const handleCloseTab = () => {
        window.close();
        setTimeout(() => navigate('/'), 500);
    };

    // Game not started
    if (step === 'not_started') {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content glass-card">
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '5rem' }}>⏰</span>
                        <h2 style={{ color: '#FFD700', margin: '20px 0' }}>Game Chưa Bắt Đầu</h2>
                        <p style={{ color: '#FFF8DC', marginBottom: '30px' }}>
                            Vui lòng chờ Admin bắt đầu game!
                        </p>
                        <button className="tet-button" onClick={handleCloseTab}>
                            Đóng
                        </button>
                    </div>
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    // Loading
    if (step === 'loading') {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content glass-card">
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '4rem' }}>⏳</span>
                        <p style={{ color: '#FFF8DC', marginTop: '20px' }}>Đang tải...</p>
                    </div>
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    // Invalid QR
    if (step === 'invalid') {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content glass-card">
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '5rem' }}>❌</span>
                        <h2 style={{ color: '#FFD700', margin: '20px 0' }}>Mã QR Không Hợp Lệ</h2>
                        <p style={{ color: '#FFF8DC', marginBottom: '30px' }}>
                            Mã QR này không tồn tại trong hệ thống.
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
    if (step === 'used') {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content glass-card">
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '5rem' }}>🚫</span>
                        <h2 style={{ color: '#FFD700', margin: '20px 0' }}>Mã QR Đã Được Sử Dụng</h2>
                        <p style={{ color: '#FFF8DC', marginBottom: '30px' }}>
                            Mã QR này đã được sử dụng trước đó.<br />
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

    // Question step
    if (step === 'question' && question) {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content">
                    <QuestionCard
                        question={question}
                        onCorrect={handleCorrectAnswerSubmit}
                    />
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    // Company selection step
    if (step === 'company') {
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content">
                    <h2 className="step-title">🎯 Chọn Công Ty Để Nhận Mảnh Ghép</h2>
                    <CompanySelector
                        onSelect={handleCompanySelect}
                        disabled={isProcessing}
                    />
                    {isProcessing && (
                        <p style={{ color: '#FFD700', textAlign: 'center', marginTop: '20px' }}>
                            Đang xử lý...
                        </p>
                    )}
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    // Reveal step
    if (step === 'reveal' && selectedCompany && gameState) {
        const company = selectedCompany;
        return (
            <div className="question-page">
                <TetDecorations />
                <div className="page-content">
                    <h2 className="step-title">🧩 Mảnh Ghép Mới Cho {company.name}</h2>
                    <LogoPuzzle
                        companyId={company.id}
                        logoUrl={company.logo}
                        revealedPieces={gameState.revealedPieces}
                        newlyRevealed={newPieceIndex}
                    />
                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <button className="tet-button" onClick={handleCloseTab}>
                            Hoàn Tất
                        </button>
                    </div>
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    // Complete step
    if (step === 'complete' && selectedCompany) {
        const company = selectedCompany;
        return (
            <div className="question-page">
                <TetDecorations />
                {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
                <div className="page-content">
                    <h2 className="step-title">🎉 {company.name} Đã Hoàn Thành!</h2>
                    {gameState && (
                        <LogoPuzzle
                            companyId={company.id}
                            logoUrl={company.logo}
                            revealedPieces={gameState.revealedPieces}
                        />
                    )}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'center' }}>
                        <button className="tet-button" onClick={() => navigate('/leaderboard')}>
                            🏆 Xem Bảng Xếp Hạng
                        </button>
                        <button className="tet-button secondary" onClick={handleCloseTab}>
                            Đóng
                        </button>
                    </div>
                </div>
                <style>{pageStyles}</style>
            </div>
        );
    }

    // Loading fallback
    return (
        <div className="question-page">
            <TetDecorations />
            <div className="page-content glass-card">
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '4rem' }}>⏳</span>
                    <p style={{ color: '#FFF8DC', marginTop: '20px' }}>Đang tải...</p>
                </div>
            </div>
            <style>{pageStyles}</style>
        </div>
    );
};

const pageStyles = `
    .question-page {
        min-height: 100vh;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .page-content {
        position: relative;
        z-index: 10;
        max-width: 600px;
        width: 100%;
        margin: 0 auto;
    }
    
    .step-title {
        color: #FFD700;
        text-align: center;
        margin-bottom: 30px;
        font-size: 1.5rem;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }
    
    .tet-button.secondary {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 215, 0, 0.5);
    }
`;

export default QuestionPage;
