import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { isQRCodeUsed, getQRCodes } from '../utils/storage';

const QRScanner = ({ onScan, onUsedQR, onInvalidQR }) => {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState(null);
  const scanTimeoutRef = useRef(null);

  const handleScan = (result) => {
    if (result && result[0]) {
      const scannedData = result[0].rawValue;

      // Prevent scanning same code repeatedly in short time
      if (lastScanned === scannedData) return;
      setLastScanned(scannedData);

      // Reset after 3 seconds to allow re-scan
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = setTimeout(() => {
        setLastScanned(null);
      }, 3000);

      console.log('QR Scanned:', scannedData);
      processScannedData(scannedData);
    }
  };

  const processScannedData = (scannedData) => {
    // Try to extract QR ID from URL format
    // Expected format: http://domain/question/{qrId}
    const match = scannedData.match(/\/question\/([a-zA-Z0-9-]+)/);

    if (match) {
      const qrId = match[1];
      validateAndProcessQR(qrId, scannedData);
    } else {
      // Not a valid format - show error
      setInvalidMessage('Mã QR không đúng định dạng!');
      setTimeout(() => setInvalidMessage(null), 3000);
    }
  };

  const validateAndProcessQR = (qrId, originalData) => {
    // 1. Check if QR exists in Admin's generated list
    const adminQRCodes = getQRCodes();
    const isValidAdminQR = adminQRCodes.some(qr => qr.id === qrId);

    if (!isValidAdminQR && adminQRCodes.length > 0) {
      // QR not from Admin Panel
      setInvalidMessage('Mã QR không hợp lệ! Vui lòng dùng mã từ Admin Panel.');
      setTimeout(() => setInvalidMessage(null), 3000);
      onInvalidQR && onInvalidQR(qrId);
      return;
    }

    // 2. Check if QR code is already used
    if (isQRCodeUsed(qrId)) {
      onUsedQR && onUsedQR(qrId);
      return;
    }

    // 3. Valid QR - navigate to question page
    setScanSuccess(true);

    // Use direct navigation (in same tab) which won't be blocked
    setTimeout(() => {
      // Navigate in new tab using window.open with user gesture
      const url = `/question/${qrId}`;

      // Try window.open first
      const newTab = window.open(url, '_blank', 'noopener,noreferrer');

      if (!newTab) {
        // If blocked, navigate in same tab
        console.log('Popup blocked, navigating in same tab');
        window.location.href = url;
      }

      setScanSuccess(false);
    }, 500);

    // Notify parent
    onScan && onScan(qrId, originalData);
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    if (err?.name === 'NotAllowedError') {
      setError('Vui lòng cho phép quyền truy cập camera trong browser.');
    } else if (err?.name === 'NotFoundError') {
      setError('Không tìm thấy camera. Vui lòng kiểm tra thiết bị.');
    } else {
      setError('Lỗi camera. Vui lòng kiểm tra lại thiết bị.');
    }
  };

  return (
    <div className="qr-scanner-wrapper">
      <div className={`camera-container ${scanSuccess ? 'scan-success' : ''}`}>
        {isScanning && (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment',
            }}
            formats={['qr_code']}
            styles={{
              container: {
                width: '100%',
                height: '100%',
              },
              video: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              },
            }}
          />
        )}

        {/* Scan overlay */}
        <div className="scan-overlay">
          <div className="scan-line"></div>
          <div className="scan-corners">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
        </div>

        {/* Success indicator */}
        {scanSuccess && (
          <div className="scan-success-indicator">
            <span>✓</span>
            <p>Đang mở...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="scanner-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {invalidMessage && (
        <div className="scanner-invalid">
          <span>❌ {invalidMessage}</span>
        </div>
      )}

      <p className="scanner-hint">📷 Đưa mã QR vào khung hình để quét</p>
      <p className="scanner-note">⚠️ Chỉ sử dụng mã QR đã tạo từ Admin Panel</p>

      <style>{`
        .qr-scanner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .camera-container {
          position: relative;
          width: 100%;
          max-width: 350px;
          aspect-ratio: 1;
          transition: all 0.3s ease;
          border: 3px solid rgba(255, 215, 0, 0.5);
          border-radius: 15px;
          overflow: hidden;
        }
        
        .camera-container.scan-success {
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.8) !important;
          border-color: #22c55e !important;
        }
        
        .scan-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .scan-line {
          position: absolute;
          left: 10%;
          right: 10%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #FFD700, transparent);
          animation: scanLine 2s infinite;
        }
        
        @keyframes scanLine {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        
        .scan-corners .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border-color: #FFD700;
          border-style: solid;
        }
        
        .scan-corners .corner.top-left {
          top: 15px;
          left: 15px;
          border-width: 3px 0 0 3px;
        }
        
        .scan-corners .corner.top-right {
          top: 15px;
          right: 15px;
          border-width: 3px 3px 0 0;
        }
        
        .scan-corners .corner.bottom-left {
          bottom: 15px;
          left: 15px;
          border-width: 0 0 3px 3px;
        }
        
        .scan-corners .corner.bottom-right {
          bottom: 15px;
          right: 15px;
          border-width: 0 3px 3px 0;
        }
        
        .scan-success-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(34, 197, 94, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        
        .scan-success-indicator span {
          color: white;
          font-size: 60px;
          font-weight: bold;
        }
        
        .scan-success-indicator p {
          color: white;
          font-size: 18px;
          margin-top: 10px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .scanner-error {
          background: rgba(220, 38, 38, 0.2);
          border: 1px solid #dc2626;
          padding: 10px 20px;
          border-radius: 10px;
          color: #fca5a5;
          text-align: center;
        }
        
        .scanner-invalid {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid #f59e0b;
          padding: 10px 20px;
          border-radius: 10px;
          color: #fcd34d;
          text-align: center;
          animation: shake 0.5s ease;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .scanner-hint {
          color: #FFD700;
          font-size: 1rem;
          text-align: center;
          margin: 0;
        }
        
        .scanner-note {
          color: rgba(255, 248, 220, 0.7);
          font-size: 0.85rem;
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
