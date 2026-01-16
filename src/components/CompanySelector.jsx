import React, { useState } from 'react';
import { GAME_CONFIG } from '../data/config';
import { getCompanies } from '../utils/storage';

const CompanySelector = ({ onSelect }) => {
    const [selectedCompany, setSelectedCompany] = useState(null);

    const companies = getCompanies() || GAME_CONFIG.companies;

    const handleSelect = (company) => {
        setSelectedCompany(company.id);
        onSelect && onSelect(company);
    };

    return (
        <div className="company-selector">
            <h2 className="selector-title">🏢 Chọn Công Ty</h2>
            <p className="selector-subtitle">Chọn công ty bạn muốn thu thập logo</p>

            <div className="company-grid">
                {companies.map((company) => (
                    <div
                        key={company.id}
                        className={`company-card ${selectedCompany === company.id ? 'selected' : ''}`}
                        onClick={() => handleSelect(company)}
                    >
                        <div className="company-logo">
                            <img
                                src={company.logo}
                                alt={company.name}
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="%23333" width="80" height="80"/><text x="40" y="45" text-anchor="middle" fill="%23FFD700" font-size="12">LOGO</text></svg>';
                                }}
                            />
                        </div>
                        <span className="name">{company.name}</span>
                        {selectedCompany === company.id && (
                            <div className="check-mark">✓</div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
        .company-selector {
          text-align: center;
        }
        
        .selector-title {
          color: #FFD700;
          font-size: 1.8rem;
          margin-bottom: 10px;
        }
        
        .selector-subtitle {
          color: #FFF8DC;
          margin-bottom: 30px;
          opacity: 0.8;
        }
        
        .company-card {
          position: relative;
        }
        
        .company-card.selected {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.2);
        }
        
        .company-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .company-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .check-mark {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 25px;
          height: 25px;
          background: #22c55e;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          animation: pop 0.3s ease;
        }
        
        @keyframes pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default CompanySelector;
