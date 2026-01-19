// Fixed QR Codes Data - 300 codes total
// 200 codes for questions (Q001-Q200)
// 100 codes for memes (M001-M100)

export const BASE_URL = 'http://http://10.0.54.10:5174';

// Meme messages
export const MEME_MESSAGES = [
    { id: 1, emoji: '🎊', text: 'Chúc mừng năm mới!', subtext: 'Năm mới vạn sự như ý!' },
    { id: 2, emoji: '🍀', text: 'Chúc bạn may mắn lần sau!', subtext: 'Đừng bỏ cuộc nhé~' },
    { id: 3, emoji: '😜', text: 'Lêu lêu~', subtext: 'Hehe, thử lại nào!' },
    { id: 4, emoji: '🧧', text: 'Lì xì đâu rồi?', subtext: 'Chúc Tết vui vẻ!' },
    { id: 5, emoji: '🐎', text: 'Năm Ngựa phát tài!', subtext: 'Mã đáo thành công!' },
    { id: 6, emoji: '🎉', text: 'Bạn giỏi lắm...', subtext: 'Nhưng chưa đủ! 😏' },
    { id: 7, emoji: '🔥', text: 'Hot hot hot!', subtext: 'Nóng quá đi mất!' },
    { id: 8, emoji: '💪', text: 'Cố lên nào!', subtext: 'Bạn làm được mà!' },
    { id: 9, emoji: '🎯', text: 'Gần trúng rồi!', subtext: 'Thêm chút nữa thôi!' },
    { id: 10, emoji: '🌸', text: 'Xuân về rồi đó!', subtext: 'Hoa đào nở rộ!' },
    { id: 11, emoji: '🎁', text: 'Quà ở đâu ta?', subtext: 'Tìm mã khác nha!' },
    { id: 12, emoji: '🌟', text: 'Bạn là ngôi sao!', subtext: 'Dù không trúng 😄' },
    { id: 13, emoji: '🎪', text: 'Vui quá đi!', subtext: 'Tết mà, vui thôi!' },
    { id: 14, emoji: '🏮', text: 'Đèn lồng đỏ thắm!', subtext: 'Chúc an khang!' },
    { id: 15, emoji: '🎶', text: 'Happy New Year!', subtext: '♪♫ La la la ♫♪' },
];

// Generate 300 fixed QR codes
export const generateFixedQRCodes = () => {
    const codes = [];

    // 200 question codes (Q001-Q200)
    for (let i = 1; i <= 200; i++) {
        const id = `Q${String(i).padStart(3, '0')}`;
        codes.push({
            id,
            type: 'question',
            url: `${BASE_URL}/question/${id}`,
        });
    }

    // 100 meme codes (M001-M100)
    for (let i = 1; i <= 100; i++) {
        const id = `M${String(i).padStart(3, '0')}`;
        // Assign a random meme message to each code
        const memeIndex = (i - 1) % MEME_MESSAGES.length;
        codes.push({
            id,
            type: 'meme',
            url: `${BASE_URL}/meme/${id}`,
            memeId: MEME_MESSAGES[memeIndex].id,
        });
    }

    return codes;
};

// Get QR code by ID
export const getQRCodeById = (id) => {
    const codes = generateFixedQRCodes();
    return codes.find(code => code.id === id);
};

// Get meme message by meme ID
export const getMemeMessage = (memeId) => {
    return MEME_MESSAGES.find(m => m.id === memeId) || MEME_MESSAGES[0];
};

// Get random meme message for a QR code ID
export const getMemeForQRCode = (qrId) => {
    const code = getQRCodeById(qrId);
    if (code && code.type === 'meme') {
        return getMemeMessage(code.memeId);
    }
    // Fallback: use hash of ID to get consistent meme
    const hash = qrId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return MEME_MESSAGES[hash % MEME_MESSAGES.length];
};

// Check if QR code is valid
export const isValidQRCode = (id) => {
    const code = getQRCodeById(id);
    return !!code;
};

// Get QR type
export const getQRType = (id) => {
    const code = getQRCodeById(id);
    return code ? code.type : null;
};

export default {
    BASE_URL,
    MEME_MESSAGES,
    generateFixedQRCodes,
    getQRCodeById,
    getMemeMessage,
    getMemeForQRCode,
    isValidQRCode,
    getQRType,
};
