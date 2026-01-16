import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TetDecorations from '../components/TetDecorations';
import { generateQRCodes, printQRCodes, downloadQRCodes } from '../utils/qrGenerator';
import { importQuestionsFromExcel, generateExcelTemplate } from '../utils/excelImport';
import {
  getQuestions,
  saveQuestions,
  getQRCodes,
  saveGridSize,
  getGridSize,
  getCompanies,
  saveCompanies,
  clearAllData,
  resetGameResults,
  clearAllQRCodes,
  getUsedQRCodes,
  downloadBackup
} from '../utils/storage';
import { DEFAULT_QUESTIONS, GAME_CONFIG } from '../data/config';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [qrCount, setQrCount] = useState(10);
  const [generatedQRs, setGeneratedQRs] = useState([]);
  const [gridSize, setGridSize] = useState(getGridSize() || GAME_CONFIG.gridSize);
  const [questions, setQuestions] = useState([]);
  const [importStatus, setImportStatus] = useState(null);
  const [companies, setCompanies] = useState(getCompanies() || GAME_CONFIG.companies);
  const [newCompany, setNewCompany] = useState({ name: '', logo: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [usedQRCount, setUsedQRCount] = useState(0);

  useEffect(() => {
    const savedQuestions = getQuestions() || DEFAULT_QUESTIONS;
    setQuestions(savedQuestions);

    const savedQRs = getQRCodes();
    setGeneratedQRs(savedQRs);

    const usedQRs = getUsedQRCodes();
    setUsedQRCount(usedQRs.length);
  }, []);

  // QR Code Generation
  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      const codes = await generateQRCodes(qrCount);
      setGeneratedQRs(prev => [...prev, ...codes]);
    } catch (error) {
      console.error('Error generating QR codes:', error);
    }
    setIsGenerating(false);
  };

  const handlePrintQR = () => {
    printQRCodes(generatedQRs);
  };

  const handleDownloadQR = () => {
    downloadQRCodes(generatedQRs);
  };

  // Excel Import
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await importQuestionsFromExcel(file);
    setImportStatus(result);

    if (result.success) {
      const newQuestions = getQuestions();
      setQuestions(newQuestions);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const blob = generateExcelTemplate();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mau_cau_hoi.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Grid Size
  const handleGridSizeChange = (size) => {
    setGridSize(size);
    saveGridSize(size);
  };

  // Companies
  const handleAddCompany = () => {
    if (!newCompany.name.trim()) return;

    const company = {
      id: 'company_' + Date.now(),
      name: newCompany.name.trim(),
      logo: newCompany.logo.trim() || '/logos/default.png',
    };

    const updatedCompanies = [...companies, company];
    setCompanies(updatedCompanies);
    saveCompanies(updatedCompanies);
    setNewCompany({ name: '', logo: '' });
  };

  const handleRemoveCompany = (companyId) => {
    const updatedCompanies = companies.filter(c => c.id !== companyId);
    setCompanies(updatedCompanies);
    saveCompanies(updatedCompanies);
  };

  // Reset Game Results (keep questions, QR codes, and used QR status)
  const handleResetGameResults = () => {
    if (window.confirm('Xóa kết quả và reset mảnh ghép công ty?\n\n• Câu hỏi và mã QR giữ nguyên\n• QR đã dùng vẫn không thể quét lại')) {
      resetGameResults();
      // Không reset usedQRCount vì QR đã dùng vẫn giữ nguyên
      alert('Đã xóa kết quả game và reset mảnh ghép!');
    }
  };

  // Reset All QR Codes
  const handleResetAllQRCodes = () => {
    if (window.confirm('Xóa TẤT CẢ mã QR? Hành động này không thể hoàn tác!')) {
      clearAllQRCodes();
      setGeneratedQRs([]);
      setUsedQRCount(0);
      alert('Đã xóa tất cả mã QR!');
    }
  };

  // Reset All Data
  const handleResetData = () => {
    if (window.confirm('Xóa TẤT CẢ dữ liệu (QR, câu hỏi, kết quả)?\n\nHành động này không thể hoàn tác!')) {
      clearAllData();
      setGeneratedQRs([]);
      setQuestions(DEFAULT_QUESTIONS);
      setCompanies(GAME_CONFIG.companies);
      setGridSize(GAME_CONFIG.gridSize);
      setUsedQRCount(0);
      alert('Đã xóa tất cả dữ liệu!');
    }
  };

  // Export Backup
  const handleExportBackup = () => {
    const fileName = downloadBackup();
    alert(`Đã tải xuống file backup: ${fileName}`);
  };

  return (
    <div className="admin-page">
      <TetDecorations />

      <div className="page-content">
        <div className="header">
          <Link to="/" className="back-link">← Về Trang Chủ</Link>
          <h1 className="tet-title">⚙️ Quản Trị ⚙️</h1>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            📱 QR Codes
          </button>
          <button
            className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            ❓ Câu Hỏi
          </button>
          <button
            className={`tab ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            🏢 Công Ty
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Cài Đặt
          </button>
        </div>

        <div className="tab-content glass-card">
          {activeTab === 'qr' && (
            <div className="admin-section">
              <h2>Mã QR Cố Định (300 mã)</h2>

              <div className="fixed-qr-info">
                <p className="info-text">
                  Hệ thống sử dụng <strong>300 mã QR cố định</strong>:
                </p>

                <div className="qr-stats">
                  <div className="stat-item">
                    <span className="stat-value">200</span>
                    <span className="stat-label">Câu hỏi (Q001-Q200)</span>
                  </div>
                  <div className="stat-item meme">
                    <span className="stat-value">100</span>
                    <span className="stat-label">Meme (M001-M100)</span>
                  </div>
                  <div className="stat-item used">
                    <span className="stat-value">{usedQRCount}</span>
                    <span className="stat-label">Đã Sử Dụng</span>
                  </div>
                </div>

                <div className="qr-type-info">
                  <div className="type-card">
                    <span className="type-emoji">❓</span>
                    <div className="type-details">
                      <h4>Mã Câu Hỏi (Q001-Q200)</h4>
                      <p>User quét sẽ được trả lời câu hỏi và nhận mảnh ghép logo</p>
                    </div>
                  </div>
                  <div className="type-card">
                    <span className="type-emoji">🎭</span>
                    <div className="type-details">
                      <h4>Mã Meme (M001-M100)</h4>
                      <p>User quét sẽ thấy các meme vui như "Chúc may mắn!", "Lêu lêu~"...</p>
                    </div>
                  </div>
                </div>

                <div className="button-group" style={{ marginTop: '30px' }}>
                  <a href="/print-qr" className="tet-button" target="_blank" rel="noopener noreferrer">
                    🖨️ In 300 Mã QR
                  </a>
                </div>

                <p className="hint-text">
                  * Nhấn nút trên để mở trang in QR codes. Bạn có thể chọn lọc và in ra PDF.
                </p>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="admin-section">
              <h2>Quản Lý Câu Hỏi</h2>

              <div className="import-section">
                <p style={{ color: '#FFF8DC', marginBottom: '15px' }}>
                  Import câu hỏi từ file Excel
                </p>

                <div className="button-group">
                  <label className="file-input-label">
                    📁 Chọn File Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button className="action-btn" onClick={handleDownloadTemplate}>
                    📥 Tải Mẫu Excel
                  </button>
                </div>

                {importStatus && (
                  <div className={`import-status ${importStatus.success ? 'success' : 'error'}`}>
                    {importStatus.message}
                  </div>
                )}
              </div>

              <div className="questions-list">
                <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>
                  Danh sách câu hỏi ({questions.length})
                </h3>

                <div className="questions-scroll">
                  {questions.map((q, index) => (
                    <div key={q.id} className="question-item">
                      <span className="q-number">{index + 1}</span>
                      <span className="q-text">{q.question}</span>
                      <span className="q-priority">P: {q.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className="admin-section">
              <h2>Quản Lý Công Ty</h2>

              <div className="add-company">
                <div className="input-group">
                  <label>Tên công ty:</label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="VD: Công ty ABC"
                  />
                </div>
                <div className="input-group">
                  <label>Đường dẫn logo:</label>
                  <input
                    type="text"
                    value={newCompany.logo}
                    onChange={(e) => setNewCompany({ ...newCompany, logo: e.target.value })}
                    placeholder="VD: /logos/abc.png"
                  />
                </div>
                <button className="tet-button" onClick={handleAddCompany}>
                  + Thêm Công Ty
                </button>
              </div>

              <div className="companies-list">
                {companies.map((company) => (
                  <div key={company.id} className="company-item">
                    <img
                      src={company.logo}
                      alt={company.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect fill="%23333" width="40" height="40"/><text x="20" y="25" text-anchor="middle" fill="%23FFD700" font-size="8">LOGO</text></svg>';
                      }}
                    />
                    <span className="company-name">{company.name}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveCompany(company.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="admin-section">
              <h2>Cài Đặt Game</h2>

              <div className="setting-item">
                <label>Kích thước lưới logo:</label>
                <div className="grid-options">
                  {[2, 3, 4].map((size) => (
                    <button
                      key={size}
                      className={`grid-option ${gridSize === size ? 'active' : ''}`}
                      onClick={() => handleGridSizeChange(size)}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
                <p className="setting-hint">
                  Số mảnh ghép: {gridSize * gridSize} mảnh
                </p>
              </div>

              <div className="backup-section">
                <h3>💾 Sao Lưu Dữ Liệu</h3>
                <p>Tải xuống file backup chứa toàn bộ dữ liệu game (bảng xếp hạng, câu hỏi, QR codes...)</p>
                <button className="action-btn primary" onClick={handleExportBackup}>
                  📥 Tải Xuống Backup
                </button>
              </div>

              <div className="reset-section">
                <h3>🔄 Reset Kết Quả Game</h3>
                <p>Xóa bảng xếp hạng và reset mảnh ghép. Giữ nguyên câu hỏi, QR, và trạng thái QR đã dùng.</p>
                <button className="warning-btn" onClick={handleResetGameResults}>
                  Reset Kết Quả Game
                </button>
              </div>

              <div className="danger-zone">
                <h3>⚠️ Vùng Nguy Hiểm</h3>
                <p>Xóa <strong>TẤT CẢ</strong> dữ liệu game (QR codes, kết quả, câu hỏi...)</p>
                <button className="danger-btn" onClick={handleResetData}>
                  Xóa Tất Cả Dữ Liệu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-page {
          min-height: 100vh;
          padding: 40px 20px;
        }
        
        .page-content {
          position: relative;
          z-index: 10;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .back-link {
          color: #FFD700;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 20px;
          padding: 8px 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        
        .back-link:hover {
          background: rgba(255, 215, 0, 0.2);
        }
        
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .tab {
          flex: 1;
          min-width: 100px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 10px;
          color: #FFF8DC;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tab:hover {
          background: rgba(255, 215, 0, 0.1);
        }
        
        .tab.active {
          background: rgba(255, 215, 0, 0.2);
          border-color: #FFD700;
          color: #FFD700;
        }
        
        .tab-content {
          min-height: 400px;
        }
        
        .button-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        
        .action-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.5);
          border-radius: 8px;
          color: #FFD700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .action-btn:hover {
          background: rgba(255, 215, 0, 0.2);
        }
        
        .file-input-label {
          padding: 10px 20px;
          background: linear-gradient(135deg, #C70039 0%, #8B0000 100%);
          border: 2px solid #FFD700;
          border-radius: 8px;
          color: #FFD700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .file-input-label:hover {
          transform: translateY(-2px);
        }
        
        .import-status {
          padding: 15px;
          border-radius: 10px;
          margin-top: 15px;
        }
        
        .import-status.success {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid #22c55e;
          color: #86efac;
        }
        
        .import-status.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          color: #fca5a5;
        }
        
        .questions-scroll {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .question-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .q-number {
          width: 30px;
          height: 30px;
          background: #C70039;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .q-text {
          flex: 1;
          color: #FFF8DC;
          font-size: 0.9rem;
        }
        
        .q-priority {
          color: #FFD700;
          font-size: 0.8rem;
          background: rgba(255, 215, 0, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .add-company {
          margin-bottom: 30px;
        }
        
        .companies-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .company-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .company-item img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 5px;
        }
        
        .company-item .company-name {
          flex: 1;
          color: #FFF8DC;
        }
        
        .remove-btn {
          width: 30px;
          height: 30px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 50%;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.4);
        }
        
        .setting-item {
          margin-bottom: 30px;
        }
        
        .setting-item label {
          display: block;
          color: #FFD700;
          margin-bottom: 15px;
          font-weight: bold;
        }
        
        .grid-options {
          display: flex;
          gap: 15px;
        }
        
        .grid-option {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 10px;
          color: #FFF8DC;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .grid-option:hover {
          background: rgba(255, 215, 0, 0.1);
        }
        
        .grid-option.active {
          background: rgba(255, 215, 0, 0.3);
          border-color: #FFD700;
          color: #FFD700;
        }
        
        .setting-hint {
          color: rgba(255, 248, 220, 0.7);
          margin-top: 10px;
          font-size: 0.9rem;
        }
        
        .danger-zone {
          margin-top: 40px;
          padding: 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 15px;
        }
        
        .danger-zone h3 {
          color: #ef4444;
          margin-bottom: 10px;
        }
        
        .danger-zone p {
          color: rgba(255, 248, 220, 0.7);
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .danger-btn {
          padding: 12px 25px;
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          border: 2px solid #ef4444;
          border-radius: 10px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .danger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(239, 68, 68, 0.4);
        }
        
        .backup-section {
          margin-top: 30px;
          padding: 20px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 15px;
        }
        
        .backup-section h3 {
          color: #22c55e;
          margin-bottom: 10px;
        }
        
        .backup-section p {
          color: rgba(255, 248, 220, 0.7);
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .action-btn.primary {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border: 2px solid #22c55e;
          color: white;
        }
        
        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(34, 197, 94, 0.4);
        }
        
        .qr-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        
        .qr-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }
        
        .stat-item {
          flex: 1;
          min-width: 80px;
          text-align: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .stat-item.used {
          border-color: rgba(239, 68, 68, 0.5);
        }
        
        .stat-item.available {
          border-color: rgba(34, 197, 94, 0.5);
        }
        
        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #FFD700;
        }
        
        .stat-item.used .stat-value {
          color: #ef4444;
        }
        
        .stat-item.available .stat-value {
          color: #22c55e;
        }
        
        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: rgba(255, 248, 220, 0.7);
          margin-top: 5px;
        }
        
        .reset-section {
          margin-top: 30px;
          padding: 20px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 15px;
        }
        
        .reset-section h3 {
          color: #f59e0b;
          margin-bottom: 10px;
        }
        
        .reset-section p {
          color: rgba(255, 248, 220, 0.7);
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .warning-btn {
          padding: 12px 25px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: 2px solid #f59e0b;
          border-radius: 10px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .warning-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
        }
        
        .danger-btn.small {
          padding: 10px 20px;
          font-size: 0.9rem;
        }
        
        .danger-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .danger-btn:disabled:hover {
          transform: none;
          box-shadow: none;
        }
        
        .fixed-qr-info {
          text-align: center;
        }
        
        .info-text {
          color: #FFF8DC;
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        
        .qr-type-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 25px;
        }
        
        .type-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          text-align: left;
        }
        
        .type-emoji {
          font-size: 2.5rem;
        }
        
        .type-details h4 {
          color: #FFD700;
          margin-bottom: 5px;
        }
        
        .type-details p {
          color: rgba(255, 248, 220, 0.7);
          font-size: 0.9rem;
        }
        
        .hint-text {
          color: rgba(255, 248, 220, 0.6);
          font-size: 0.85rem;
          margin-top: 15px;
        }
        
        .stat-item.meme {
          border-color: rgba(168, 85, 247, 0.5);
        }
        
        .stat-item.meme .stat-value {
          color: #a855f7;
        }
        
        a.tet-button {
          display: inline-block;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
