import React, { useEffect, useState } from 'react';

const TetDecorations = () => {
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    // Generate falling flowers
    const generateFlowers = () => {
      const newFlowers = [];
      for (let i = 0; i < 15; i++) {
        newFlowers.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 10,
          duration: 8 + Math.random() * 7,
          size: 15 + Math.random() * 15,
          type: Math.random() > 0.5 ? '🌸' : '🏮',
        });
      }
      setFlowers(newFlowers);
    };

    generateFlowers();
  }, []);

  return (
    <div className="tet-decorations">
      {/* Lanterns */}
      <div className="lantern" style={{ left: '5%', top: '0' }}>
        <div className="lantern-body">
          <div className="lantern-tassel"></div>
        </div>
      </div>
      <div className="lantern" style={{ right: '5%', top: '0', animationDelay: '-1.5s' }}>
        <div className="lantern-body">
          <div className="lantern-tassel"></div>
        </div>
      </div>
      <div className="lantern" style={{ left: '25%', top: '-20px', animationDelay: '-0.8s' }}>
        <div className="lantern-body">
          <div className="lantern-tassel"></div>
        </div>
      </div>
      <div className="lantern" style={{ right: '25%', top: '-20px', animationDelay: '-2s' }}>
        <div className="lantern-body">
          <div className="lantern-tassel"></div>
        </div>
      </div>

      {/* Falling flowers */}
      {flowers.map((flower) => (
        <div
          key={flower.id}
          className="flower"
          style={{
            left: `${flower.left}%`,
            animationDelay: `${flower.delay}s`,
            animationDuration: `${flower.duration}s`,
            fontSize: `${flower.size}px`,
          }}
        >
          <span style={{ display: 'block' }}>{flower.type}</span>
        </div>
      ))}

      {/* Corner decorations */}
      <div className="corner-decoration top-left">
        <span style={{ fontSize: '40px' }}>🎊</span>
      </div>
      <div className="corner-decoration top-right">
        <span style={{ fontSize: '40px' }}>🎊</span>
      </div>

      {/* New Year greeting */}
      {/* <div className="new-year-greeting">
        <span className="greeting-text">🧧 Chúc Mừng Năm Mới 🧧</span>
      </div> */}

      <style>{`
        .tet-decorations {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        
        .corner-decoration {
          position: fixed;
        }
        
        .corner-decoration.top-left {
          top: 10px;
          left: 10px;
        }
        
        .corner-decoration.top-right {
          top: 10px;
          right: 10px;
        }
        
        .new-year-greeting {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
        }
        
        .greeting-text {
          font-size: 1.5rem;
          color: #FFD700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          font-weight: bold;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @media (max-width: 768px) {
          .lantern {
            width: 40px !important;
            height: 55px !important;
          }
          
          .lantern-body {
            width: 40px !important;
            height: 55px !important;
          }
          
          .lantern-body::after {
            font-size: 18px !important;
          }
          
          .greeting-text {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TetDecorations;
