import React, { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../data/config';
import { getCompanies, getGridSize } from '../utils/storage';
import * as api from '../utils/api';

const CompanySelector = ({ onSelect, disabled }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [completedCompanies, setCompletedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const companies = getCompanies() || GAME_CONFIG.companies;
  const gridSize = getGridSize() || GAME_CONFIG.gridSize;
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    loadCompletedCompanies();
  }, []);

  const loadCompletedCompanies = async () => {
    try {
      const stats = await api.getStats();
      // Tìm các công ty đã hoàn thành tất cả mảnh
      const completed = stats.gameStates
        .filter(g => g.revealedPieces.length >= totalPieces)
        .map(g => g.companyId);
      setCompletedCompanies(completed);
    } catch (err) {
      console.error('Error loading completed companies:', err);
    }
    setLoading(false);
  };

  const handleSelect = (company) => {
    if (disabled) return;
    setSelectedCompany(company.id);
    onSelect && onSelect(company);
  };

  // Lọc bỏ các công ty đã hoàn thành
  const availableCompanies = companies.filter(c => !completedCompanies.includes(c.id));

  if (loading) {
    return (
      <div className="company-selector">
        <h2 className="selector-title">🏢 Chọn Công Ty</h2>
        <p className="selector-subtitle">Đang tải...</p>
      </div>
    );
  }

  if (availableCompanies.length === 0) {
    return (
      <div className="company-selector">
        <h2 className="selector-title">🎉 Hoàn Thành!</h2>
        <p className="selector-subtitle">Tất cả công ty đã hoàn thành logo!</p>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="company-selector">
      <h2 className="selector-title">🏢 Chọn Công Ty</h2>
      <p className="selector-subtitle">Chọn công ty bạn muốn thu thập logo</p>

      <div className="company-grid">
        {availableCompanies.map((company) => (
          <div
            key={company.id}
            className={`company-card glass-card ${selectedCompany === company.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
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
            <span className="company-name">{company.name}</span>
            {selectedCompany === company.id && (
              <div className="check-mark">✓</div>
            )}
          </div>
        ))}
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
    .company-selector {
        text-align: center;
    }
    
    .selector-title {
        color: #FFD700;
        font-size: 1.8rem;
        margin-bottom: 10px;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }
    
    .selector-subtitle {
        color: #FFF8DC;
        margin-bottom: 30px;
        opacity: 0.8;
    }
    
    .company-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 15px;
        max-width: 500px;
        margin: 0 auto;
    }
    
    .company-card {
        position: relative;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 3px solid rgba(255, 215, 0, 0.3);
        overflow: hidden;
        border-radius: 15px;
        background: rgba(0, 0, 0, 0.3);
    }
    
    .company-card:hover:not(.disabled) {
        transform: translateY(-5px);
        border-color: #FFD700;
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
    }
    
    .company-card.selected {
        border-color: #22c55e;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
    }
    
    .company-card.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .company-logo {
        width: 100%;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .company-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .company-name {
        color: #FFF8DC;
        font-size: 0.95rem;
        font-weight: 600;
        display: block;
        padding: 12px 10px;
        background: rgba(0, 0, 0, 0.5);
        text-align: center;
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
`;

export default CompanySelector;
