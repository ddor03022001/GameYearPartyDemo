import React, { useState, useEffect } from 'react';

const Celebration = ({ onComplete }) => {
    const [confetti, setConfetti] = useState([]);
    const [fireworks, setFireworks] = useState([]);

    useEffect(() => {
        // Generate confetti
        const newConfetti = [];
        const colors = ['#FFD700', '#C70039', '#FF5733', '#FFC0CB', '#FF69B4', '#FFD700'];

        for (let i = 0; i < 100; i++) {
            newConfetti.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 2,
                duration: 2 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                size: 8 + Math.random() * 8,
            });
        }
        setConfetti(newConfetti);

        // Generate fireworks
        const newFireworks = [];
        for (let i = 0; i < 5; i++) {
            newFireworks.push({
                id: i,
                left: 20 + Math.random() * 60,
                top: 20 + Math.random() * 40,
                delay: i * 0.5,
            });
        }
        setFireworks(newFireworks);

        // Auto complete after animation
        const timer = setTimeout(() => {
            onComplete && onComplete();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="celebration-container">
            {/* Confetti */}
            {confetti.map((c) => (
                <div
                    key={c.id}
                    className="confetti"
                    style={{
                        left: `${c.left}%`,
                        animationDelay: `${c.delay}s`,
                        animationDuration: `${c.duration}s`,
                        backgroundColor: c.color,
                        transform: `rotate(${c.rotation}deg)`,
                        width: `${c.size}px`,
                        height: `${c.size}px`,
                    }}
                />
            ))}

            {/* Fireworks */}
            {fireworks.map((fw) => (
                <div
                    key={fw.id}
                    className="firework"
                    style={{
                        left: `${fw.left}%`,
                        top: `${fw.top}%`,
                        animationDelay: `${fw.delay}s`,
                    }}
                >
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="spark"
                            style={{
                                transform: `rotate(${i * 30}deg)`,
                            }}
                        />
                    ))}
                </div>
            ))}

            {/* Center message */}
            <div className="celebration-message">
                <div className="trophy">🏆</div>
                <h1>CHÚC MỪNG!</h1>
                <p>Bạn đã hoàn thành thử thách!</p>
            </div>

            <style>{`
        .celebration-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          top: -20px;
          border-radius: 2px;
          animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .firework {
          position: absolute;
          width: 5px;
          height: 5px;
          animation: firework-explode 1s ease-out forwards;
        }
        
        .spark {
          position: absolute;
          width: 3px;
          height: 20px;
          background: linear-gradient(to bottom, #FFD700, transparent);
          transform-origin: center 50px;
          animation: spark-fly 1s ease-out forwards;
        }
        
        @keyframes firework-explode {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        
        @keyframes spark-fly {
          0% { height: 0; opacity: 1; }
          50% { height: 30px; opacity: 1; }
          100% { height: 0; opacity: 0; transform-origin: center 100px; }
        }
        
        .celebration-message {
          text-align: center;
          animation: zoom-in 0.5s ease-out;
          z-index: 10;
        }
        
        @keyframes zoom-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .trophy {
          font-size: 80px;
          animation: bounce 1s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .celebration-message h1 {
          color: #FFD700;
          font-size: 3rem;
          margin: 20px 0 10px;
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
        }
        
        .celebration-message p {
          color: #FFF8DC;
          font-size: 1.3rem;
        }
      `}</style>
        </div>
    );
};

export default Celebration;
