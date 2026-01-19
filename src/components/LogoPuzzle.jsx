import React, { useState, useEffect } from 'react';
import { getGridSize } from '../utils/storage';
import { GAME_CONFIG } from '../data/config';

const LogoPuzzle = ({
  companyId,
  logoUrl,
  revealedPieces = [],
  onComplete,
  newlyRevealed = null,
  gridSize = null
}) => {
  const [size, setSize] = useState(gridSize || getGridSize() || GAME_CONFIG.gridSize);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (newlyRevealed !== null) {
      setAnimatingPiece(newlyRevealed);
      setTimeout(() => {
        setAnimatingPiece(null);
      }, 1500);
    }
  }, [newlyRevealed]);

  useEffect(() => {
    const totalPieces = size * size;
    if (revealedPieces.length >= totalPieces) {
      setIsComplete(true);
      onComplete && onComplete();
    }
  }, [revealedPieces, size, onComplete]);

  const renderPieces = () => {
    const pieces = [];
    const totalPieces = size * size;

    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      const isRevealed = revealedPieces.includes(i);
      const isAnimating = animatingPiece === i;

      // Calculate background position for this piece
      // Mỗi piece chiếm 1/size của ảnh
      // Position tính theo % của phần còn lại sau khi trừ đi kích thước piece
      const bgPosX = size > 1 ? (col / (size - 1)) * 100 : 0;
      const bgPosY = size > 1 ? (row / (size - 1)) * 100 : 0;

      pieces.push(
        <div
          key={i}
          className={`puzzle-piece ${isRevealed ? 'revealed' : 'hidden'} ${isAnimating ? 'animating' : ''}`}
        >
          <div
            className="piece-inner"
            style={{
              backgroundImage: `url(${logoUrl})`,
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              backgroundSize: `${size * 100}% ${size * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />

          {isAnimating && (
            <div className="piece-glow">
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
            </div>
          )}

          {!isRevealed && (
            <div className="piece-overlay">
              <span className="question-mark">?</span>
            </div>
          )}
        </div>
      );
    }

    return pieces;
  };

  const progressPercent = (revealedPieces.length / (size * size)) * 100;

  return (
    <div className={`logo-puzzle-wrapper ${isComplete ? 'complete' : ''}`}>
      <div className="puzzle-frame">
        <div
          className="puzzle-grid"
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
          }}
        >
          {renderPieces()}
        </div>

        {isComplete && (
          <div className="complete-overlay">
            <span className="complete-text">🎉 HOÀN THÀNH! 🎉</span>
          </div>
        )}
      </div>

      <div className="puzzle-progress">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-label">
          {revealedPieces.length} / {size * size} mảnh ghép
        </span>
      </div>

      <style>{`
        .logo-puzzle-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        
        .puzzle-frame {
          position: relative;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 1;
          background: linear-gradient(135deg, rgba(20, 20, 40, 0.9) 0%, rgba(40, 20, 60, 0.9) 100%);
          border: 4px solid #FFD700;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.3),
            inset 0 0 30px rgba(0, 0, 0, 0.5);
        }
        
        .puzzle-grid {
          display: grid;
          gap: 3px;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 3px;
        }
        
        .puzzle-piece {
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid transparent;
          transition: all 0.4s ease;
        }
        
        .puzzle-piece.revealed {
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        
        .puzzle-piece.hidden {
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .piece-inner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
          transition: all 0.4s ease;
        }
        
        .puzzle-piece.hidden .piece-inner {
          filter: brightness(0.1);
          transform: scale(0.95);
          opacity: 0.3;
        }
        
        .puzzle-piece.revealed .piece-inner {
          filter: brightness(1);
          transform: scale(1);
          opacity: 1;
        }
        
        .puzzle-piece.animating {
          z-index: 10;
          border-color: #FFD700;
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
        }
        
        .puzzle-piece.animating .piece-inner {
          animation: revealPulse 0.8s ease-out;
        }
        
        @keyframes revealPulse {
          0% { 
            filter: brightness(3); 
            transform: scale(1.1); 
          }
          50% { 
            filter: brightness(1.5); 
            transform: scale(1.02); 
          }
          100% { 
            filter: brightness(1); 
            transform: scale(1); 
          }
        }
        
        .piece-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
        }
        
        .question-mark {
          font-size: 1.5rem;
          color: rgba(255, 215, 0, 0.5);
          font-weight: bold;
        }
        
        .piece-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 5;
        }
        
        .sparkle {
          position: absolute;
          font-size: 20px;
          animation: sparkleAnim 1s ease-out forwards;
        }
        
        .sparkle:nth-child(1) { top: -5px; left: -5px; }
        .sparkle:nth-child(2) { top: -5px; right: -5px; animation-delay: 0.1s; }
        .sparkle:nth-child(3) { bottom: -5px; left: -5px; animation-delay: 0.2s; }
        .sparkle:nth-child(4) { bottom: -5px; right: -5px; animation-delay: 0.3s; }
        
        @keyframes sparkleAnim {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        
        .complete-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 12px;
          animation: fadeIn 0.5s ease;
          z-index: 20;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .complete-text {
          font-size: 1.5rem;
          color: #FFD700;
          font-weight: bold;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          animation: bounceIn 0.5s ease;
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .logo-puzzle-wrapper.complete .puzzle-frame {
          border-color: #22c55e;
          box-shadow: 
            0 0 40px rgba(34, 197, 94, 0.5),
            inset 0 0 30px rgba(0, 0, 0, 0.5);
        }
        
        .puzzle-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
          max-width: 400px;
        }
        
        .progress-track {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #C70039, #FFD700);
          border-radius: 6px;
          transition: width 0.5s ease;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        .progress-label {
          color: #FFD700;
          font-size: 1rem;
          font-weight: bold;
        }
        
        @media (max-width: 480px) {
          .puzzle-frame {
            max-width: 320px;
            padding: 10px;
          }
          
          .question-mark {
            font-size: 1.2rem;
          }
          
          .puzzle-grid {
            gap: 2px;
            padding: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default LogoPuzzle;
