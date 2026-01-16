import React from 'react';

const Popup = ({ isOpen, onClose, title, children, showCloseButton = true }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                {title && (
                    <div className="popup-header">
                        <h2 className="popup-title">{title}</h2>
                    </div>
                )}

                <div className="popup-body">
                    {children}
                </div>

                {showCloseButton && (
                    <button className="popup-close-btn tet-button" onClick={onClose}>
                        Đóng
                    </button>
                )}
            </div>

            <style>{`
        .popup-header {
          margin-bottom: 20px;
        }
        
        .popup-title {
          color: #FFD700;
          font-size: 1.5rem;
          text-align: center;
          margin: 0;
        }
        
        .popup-body {
          margin-bottom: 25px;
        }
        
        .popup-close-btn {
          width: 100%;
        }
      `}</style>
        </div>
    );
};

export default Popup;
