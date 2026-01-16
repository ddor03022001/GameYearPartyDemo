import React from 'react';
import TetDecorations from '../components/TetDecorations';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <TetDecorations />

      <div className="home-content">
        <h1 className="tet-title">🧧 Thu Thập Logo 🧧</h1>
        <p className="subtitle">Chúc Mừng Năm Mới 2026!</p>

        <div className="welcome-card glass-card">
          <span className="welcome-emoji">🎊</span>
          <h2>Cách chơi</h2>
          <div className="instructions">
            <div className="step">
              <span className="step-num">1</span>
              <span>Dùng camera điện thoại quét mã QR</span>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <span>Trả lời câu hỏi chính xác</span>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <span>Chọn công ty để nhận mảnh logo</span>
            </div>
            <div className="step">
              <span className="step-num">4</span>
              <span>Thu thập đủ mảnh để hoàn thành!</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .home-page {
          min-height: 100vh;
          padding: 60px 20px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .home-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          max-width: 500px;
          width: 100%;
        }
        
        .subtitle {
          color: #FFF8DC;
          font-size: 1.2rem;
          text-align: center;
          opacity: 0.9;
        }
        
        .welcome-card {
          width: 100%;
          text-align: center;
          padding: 30px;
        }
        
        .welcome-emoji {
          font-size: 4rem;
          display: block;
          margin-bottom: 15px;
        }
        
        .welcome-card h2 {
          color: #FFD700;
          margin-bottom: 25px;
          font-size: 1.5rem;
        }
        
        .instructions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          text-align: left;
        }
        
        .step {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #FFF8DC;
          font-size: 1rem;
        }
        
        .step-num {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #C70039 0%, #8B0000 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFD700;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .nav-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .nav-link {
          color: #FFD700;
          text-decoration: none;
          padding: 15px 30px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 30px;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .nav-link:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: #FFD700;
          transform: translateY(-3px);
          box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
