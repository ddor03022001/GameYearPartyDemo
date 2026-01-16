import React, { useState } from 'react';

const QuestionCard = ({ question, onAnswer, onCorrect }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSelectAnswer = (index) => {
        if (showResult) return;

        setSelectedAnswer(index);
        const correct = index === question.correctAnswer;
        setIsCorrect(correct);
        setShowResult(true);

        // Notify parent
        onAnswer && onAnswer(index, correct);

        if (correct) {
            // Wait for animation then proceed
            setTimeout(() => {
                onCorrect && onCorrect();
            }, 1500);
        } else {
            // Allow retry after wrong answer
            setTimeout(() => {
                setSelectedAnswer(null);
                setShowResult(false);
            }, 1500);
        }
    };

    return (
        <div className="question-card">
            <div className="question-header">
                <span className="question-icon">❓</span>
                <h2>Câu hỏi</h2>
            </div>

            <p className="question-text">{question.question}</p>

            <div className="answers-container">
                {question.answers.map((answer, index) => (
                    <button
                        key={index}
                        className={`answer-option ${showResult && selectedAnswer === index
                                ? isCorrect ? 'correct' : 'incorrect'
                                : ''
                            } ${showResult && index === question.correctAnswer && !isCorrect ? 'show-correct' : ''}`}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={showResult}
                    >
                        <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="answer-text">{answer}</span>
                    </button>
                ))}
            </div>

            {showResult && (
                <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? (
                        <>
                            <span className="result-icon">🎉</span>
                            <span>Chính xác! Tuyệt vời!</span>
                        </>
                    ) : (
                        <>
                            <span className="result-icon">❌</span>
                            <span>Sai rồi! Thử lại nhé!</span>
                        </>
                    )}
                </div>
            )}

            <style>{`
        .question-card {
          position: relative;
        }
        
        .question-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .question-header h2 {
          color: #FFD700;
          font-size: 1.5rem;
          margin: 0;
        }
        
        .question-icon {
          font-size: 2rem;
        }
        
        .answers-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .answer-option {
          display: flex;
          align-items: center;
          gap: 15px;
          text-align: left;
          font-family: inherit;
        }
        
        .answer-letter {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          background: rgba(255, 215, 0, 0.2);
          border-radius: 50%;
          font-weight: bold;
          color: #FFD700;
          flex-shrink: 0;
        }
        
        .answer-text {
          flex: 1;
        }
        
        .answer-option.correct {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(21, 128, 61, 0.3) 100%) !important;
          border-color: #22c55e !important;
        }
        
        .answer-option.correct .answer-letter {
          background: #22c55e;
          color: white;
        }
        
        .answer-option.incorrect {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.3) 100%) !important;
          border-color: #ef4444 !important;
        }
        
        .answer-option.incorrect .answer-letter {
          background: #ef4444;
          color: white;
        }
        
        .answer-option.show-correct {
          border-color: #22c55e !important;
        }
        
        .result-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 25px;
          padding: 15px;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: bold;
          animation: slideIn 0.3s ease;
        }
        
        .result-message.correct {
          background: rgba(34, 197, 94, 0.2);
          border: 2px solid #22c55e;
          color: #86efac;
        }
        
        .result-message.incorrect {
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid #ef4444;
          color: #fca5a5;
        }
        
        .result-icon {
          font-size: 1.5rem;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default QuestionCard;
