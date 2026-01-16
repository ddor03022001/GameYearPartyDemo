import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { saveQRCodes, getQRCodes } from './storage';

/**
 * Generate a unique QR code ID
 * @returns {string}
 */
export const generateQRId = () => {
    return uuidv4();
};

/**
 * Generate QR codes for the game
 * @param {number} count - Number of QR codes to generate
 * @param {string} baseUrl - Base URL for the QR codes
 * @returns {Promise<Array>} Generated QR code data
 */
export const generateQRCodes = async (count, baseUrl = window.location.origin) => {
    const codes = [];

    for (let i = 0; i < count; i++) {
        const id = generateQRId();
        const url = `${baseUrl}/question/${id}`;

        try {
            const dataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });

            codes.push({
                id,
                url,
                dataUrl,
                createdAt: new Date().toISOString(),
                used: false,
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    // Save to storage
    const existingCodes = getQRCodes();
    saveQRCodes([...existingCodes, ...codes]);

    return codes;
};

/**
 * Generate a single QR code as canvas
 * @param {string} data - Data to encode
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Promise<void>}
 */
export const generateQRToCanvas = async (data, canvas) => {
    return QRCode.toCanvas(canvas, data, {
        width: 300,
        margin: 2,
    });
};

/**
 * Generate QR code as data URL
 * @param {string} data - Data to encode
 * @returns {Promise<string>} Data URL
 */
export const generateQRDataUrl = async (data) => {
    return QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
    });
};

/**
 * Download QR codes as images
 * @param {Array} codes - QR code data array
 */
export const downloadQRCodes = (codes) => {
    codes.forEach((code, index) => {
        const link = document.createElement('a');
        link.href = code.dataUrl;
        link.download = `qr_code_${index + 1}_${code.id.slice(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
};

/**
 * Create a printable HTML page with all QR codes
 * @param {Array} codes - QR code data array
 * @returns {string} HTML content
 */
export const createPrintableHTML = (codes) => {
    const qrItems = codes.map((code, index) => `
    <div class="qr-item">
      <img src="${code.dataUrl}" alt="QR Code ${index + 1}" />
      <p class="qr-number">#${index + 1}</p>
      <p class="qr-id">${code.id.slice(0, 8)}</p>
    </div>
  `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Codes - Tết Logo Game</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .qr-item { 
          border: 2px solid #C70039; 
          border-radius: 10px; 
          padding: 15px; 
          text-align: center;
          page-break-inside: avoid;
        }
        .qr-item img { width: 100%; height: auto; }
        .qr-number { font-size: 18px; font-weight: bold; color: #C70039; margin-top: 10px; }
        .qr-id { font-size: 12px; color: #666; margin-top: 5px; }
        @media print {
          .container { grid-template-columns: repeat(3, 1fr); }
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center; color: #C70039; margin-bottom: 30px;">🧧 QR Codes - Tết Logo Game 🧧</h1>
      <div class="container">${qrItems}</div>
    </body>
    </html>
  `;
};

/**
 * Open print dialog for QR codes
 * @param {Array} codes - QR code data array
 */
export const printQRCodes = (codes) => {
    const html = createPrintableHTML(codes);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.print();
    };
};

export default {
    generateQRId,
    generateQRCodes,
    generateQRToCanvas,
    generateQRDataUrl,
    downloadQRCodes,
    createPrintableHTML,
    printQRCodes,
};
