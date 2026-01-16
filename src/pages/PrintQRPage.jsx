import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { generateFixedQRCodes, BASE_URL } from '../data/qrCodes';
import TetDecorations from '../components/TetDecorations';

const PrintQRPage = () => {
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'question', 'meme'

  useEffect(() => {
    generateAllQRCodes();
  }, []);

  const generateAllQRCodes = async () => {
    setLoading(true);
    const codes = generateFixedQRCodes();

    const codesWithImages = await Promise.all(
      codes.map(async (code) => {
        const dataUrl = await QRCode.toDataURL(code.url, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        return { ...code, dataUrl };
      })
    );

    setQRCodes(codesWithImages);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCodes = qrCodes.filter(code => {
    if (filter === 'all') return true;
    return code.type === filter;
  });

  if (loading) {
    return (
      <div className="print-page">
        <TetDecorations />
        <div className="loading-container glass-card">
          <span className="loading-emoji">⏳</span>
          <p>Đang tạo 300 mã QR...</p>
          <p className="loading-hint">Vui lòng đợi trong giây lát</p>
        </div>
        <style>{pageStyles}</style>
      </div>
    );
  }

  return (
    <div className="print-page">
      <TetDecorations />

      <div className="controls no-print">
        <Link to="/admin" className="back-link">← Quay lại Admin</Link>

        <div className="filter-controls">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({qrCodes.length})
          </button>
          <button
            className={`filter-btn ${filter === 'question' ? 'active' : ''}`}
            onClick={() => setFilter('question')}
          >
            Câu hỏi ({qrCodes.filter(c => c.type === 'question').length})
          </button>
          <button
            className={`filter-btn ${filter === 'meme' ? 'active' : ''}`}
            onClick={() => setFilter('meme')}
          >
            Meme ({qrCodes.filter(c => c.type === 'meme').length})
          </button>
        </div>

        <button className="print-btn" onClick={handlePrint}>
          🖨️ In QR Codes
        </button>
      </div>

      <div className="info-bar no-print">
        <p>📍 Base URL: <strong>{BASE_URL}</strong></p>
        <p>Hiển thị: <strong>{filteredCodes.length}</strong> mã QR</p>
      </div>

      <div className="qr-grid">
        {filteredCodes.map((code) => (
          <div key={code.id} className="qr-card">
            <img src={code.dataUrl} alt={code.id} />
            {/* <div className="qr-info">
                            <span className="qr-id">{code.id}</span>
                            <span className={`qr-type ${code.type}`}>
                                {code.type === 'question' ? '❓' : '🎭'}
                            </span>
                        </div> */}
          </div>
        ))}
      </div>

      <style>{pageStyles}</style>
    </div>
  );
};

const pageStyles = `
  .print-page {
    min-height: 100vh;
    padding: 20px;
  }
  
  .loading-container {
    max-width: 400px;
    margin: 100px auto;
    text-align: center;
    padding: 50px;
    position: relative;
    z-index: 10;
  }
  
  .loading-emoji {
    font-size: 4rem;
    display: block;
    margin-bottom: 20px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .loading-hint {
    color: rgba(255, 248, 220, 0.7);
    font-size: 0.9rem;
    margin-top: 10px;
  }
  
  .controls {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    padding: 15px 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
  }
  
  .back-link {
    color: #FFD700;
    text-decoration: none;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
  }
  
  .filter-controls {
    display: flex;
    gap: 10px;
  }
  
  .filter-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    color: #FFF8DC;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .filter-btn.active {
    background: rgba(255, 215, 0, 0.2);
    border-color: #FFD700;
    color: #FFD700;
  }
  
  .print-btn {
    margin-left: auto;
    padding: 12px 25px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border: 2px solid #22c55e;
    border-radius: 25px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .print-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(34, 197, 94, 0.4);
  }
  
  .info-bar {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background: rgba(255, 215, 0, 0.1);
    border-radius: 10px;
    margin-bottom: 20px;
    color: #FFF8DC;
    font-size: 0.9rem;
  }
  
  .qr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    position: relative;
    z-index: 10;
  }
  
  .qr-card {
    background: white;
    border-radius: 10px;
    padding: 10px;
    text-align: center;
  }
  
  .qr-card img {
    width: 100%;
    height: auto;
  }
  
  .qr-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
    padding-top: 5px;
    border-top: 1px solid #eee;
  }
  
  .qr-id {
    font-weight: bold;
    color: #333;
    font-size: 0.9rem;
  }
  
  .qr-type {
    font-size: 1.2rem;
  }
  
  /* Print styles */
  @media print {
    .no-print {
      display: none !important;
    }
    
    .print-page {
      padding: 0;
      background: white;
    }
    
    .qr-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    
    .qr-card {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`;

export default PrintQRPage;
