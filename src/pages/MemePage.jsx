import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TetDecorations from '../components/TetDecorations';
import { getMemeForQRCode, MEME_MESSAGES } from '../data/qrCodes';
import { isQRCodeUsed, markQRCodeUsed } from '../utils/storage';

const MemePage = () => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [meme, setMeme] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'show', 'used', 'invalid'
  const hasChecked = useRef(false); // Prevent double execution

  useEffect(() => {
    // Prevent double execution from React StrictMode
    if (hasChecked.current) return;
    hasChecked.current = true;

    console.log('MemePage: qrId =', qrId);

    // Validate meme code format
    if (!qrId || !qrId.startsWith('M')) {
      setStatus('invalid');
      return;
    }

    // Check if already used BEFORE this visit
    if (isQRCodeUsed(qrId)) {
      console.log('QR already used');
      setStatus('used');
      return;
    }

    // Get meme content
    let memeData = getMemeForQRCode(qrId);

    // Fallback: if no meme found, pick based on QR ID
    if (!memeData) {
      const numPart = parseInt(qrId.replace('M', ''), 10) || 1;
      const memeIndex = (numPart - 1) % MEME_MESSAGES.length;
      memeData = MEME_MESSAGES[memeIndex];
    }

    console.log('Meme data:', memeData);

    // Mark as used AFTER getting meme data
    markQRCodeUsed(qrId);

    // Set meme and show
    setMeme(memeData);
    setStatus('show');

  }, [qrId]);

  const handleClose = () => {
    window.close();
    setTimeout(() => navigate('/'), 500);
  };

  // Invalid QR code
  if (status === 'invalid') {
    return (
      <div className="meme-page">
        <TetDecorations />
        <div className="meme-container glass-card show">
          <span className="meme-emoji">❌</span>
          <h2 className="meme-text">Mã QR không hợp lệ!</h2>
          <p className="meme-subtext">Vui lòng kiểm tra lại mã QR.</p>
          <button className="tet-button" onClick={handleClose}>
            Đóng
          </button>
        </div>
        <style>{pageStyles}</style>
      </div>
    );
  }

  // Already used
  if (status === 'used') {
    return (
      <div className="meme-page">
        <TetDecorations />
        <div className="meme-container glass-card show">
          <span className="meme-emoji">🚫</span>
          <h2 className="meme-text">Mã QR đã được sử dụng!</h2>
          <p className="meme-subtext">Mỗi mã chỉ dùng được một lần.</p>
          <button className="tet-button" onClick={handleClose}>
            Đóng
          </button>
        </div>
        <style>{pageStyles}</style>
      </div>
    );
  }

  // Loading
  if (status === 'loading' || !meme) {
    return (
      <div className="meme-page">
        <TetDecorations />
        <div className="meme-container glass-card show">
          <span className="meme-emoji loading">🎲</span>
          <p className="meme-subtext">Đang tải...</p>
        </div>
        <style>{pageStyles}</style>
      </div>
    );
  }

  // Show meme
  return (
    <div className="meme-page">
      <TetDecorations />

      <div className="meme-container glass-card show">
        <div className="confetti">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#FFD700', '#C70039', '#22c55e', '#3b82f6', '#f59e0b'][i % 5]
            }} />
          ))}
        </div>

        <span className="meme-emoji">{meme.emoji}</span>
        <h2 className="meme-text">{meme.text}</h2>
        <p className="meme-subtext">{meme.subtext}</p>

        <button className="tet-button" onClick={handleClose}>
          Đóng
        </button>
      </div>

      <style>{pageStyles}</style>
    </div>
  );
};

const pageStyles = `
  .meme-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .meme-container {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 50px 40px;
    max-width: 400px;
    width: 100%;
    overflow: hidden;
  }
  
  .meme-container.show {
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  .meme-emoji {
    font-size: 6rem;
    display: block;
    margin-bottom: 20px;
    animation: bounce 1s ease infinite;
  }
  
  .meme-emoji.loading {
    animation: spin 1s linear infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .meme-text {
    color: #FFD700;
    font-size: 2rem;
    margin-bottom: 15px;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
  
  .meme-subtext {
    color: #FFF8DC;
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }
  
  .confetti {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
  }
  
  .confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    top: -20px;
    border-radius: 2px;
    animation: fall 3s linear infinite;
  }
  
  @keyframes fall {
    0% {
      top: -20px;
      transform: rotate(0deg) translateX(0);
      opacity: 1;
    }
    100% {
      top: 100%;
      transform: rotate(720deg) translateX(100px);
      opacity: 0;
    }
  }
`;

export default MemePage;
