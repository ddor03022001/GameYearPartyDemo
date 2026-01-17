// API Client for Game Backend
// Sử dụng hostname hiện tại để điện thoại có thể kết nối
const API_BASE = `http://10.0.54.52:3001/api`;

// ============ QR CODES ============

export const checkQRUsed = async (qrId) => {
    try {
        const res = await fetch(`${API_BASE}/qr/check/${qrId}`);
        const data = await res.json();
        return data.used;
    } catch (err) {
        console.error('API Error:', err);
        return false;
    }
};

export const markQRUsed = async (qrId) => {
    try {
        const res = await fetch(`${API_BASE}/qr/use/${qrId}`, { method: 'POST' });
        const data = await res.json();
        return data.success;
    } catch (err) {
        console.error('API Error:', err);
        return false;
    }
};

export const getUsedQRCodes = async () => {
    try {
        const res = await fetch(`${API_BASE}/qr/used`);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return [];
    }
};

// ============ GAME STATE ============

export const getGameState = async (companyId) => {
    try {
        const res = await fetch(`${API_BASE}/game/${companyId}`);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { companyId, revealedPieces: [], isCompleted: false };
    }
};

export const revealPiece = async (companyId, pieceIndex, gridSize) => {
    try {
        const res = await fetch(`${API_BASE}/game/${companyId}/reveal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pieceIndex, gridSize })
        });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false, error: err.message };
    }
};

// ============ LEADERBOARD ============

export const getLeaderboard = async () => {
    try {
        const res = await fetch(`${API_BASE}/leaderboard`);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return [];
    }
};

export const addToLeaderboard = async (companyId, companyName, completedAt) => {
    try {
        const res = await fetch(`${API_BASE}/leaderboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, companyName, completedAt })
        });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

// ============ STATS ============

export const getStats = async () => {
    try {
        const res = await fetch(`${API_BASE}/stats`);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { usedQRCount: 0, gameStates: [], leaderboard: [] };
    }
};

// ============ ADMIN ACTIONS ============

export const resetUsedQRCodes = async () => {
    try {
        const res = await fetch(`${API_BASE}/qr/reset`, { method: 'DELETE' });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

export const resetGameStates = async () => {
    try {
        const res = await fetch(`${API_BASE}/game/reset`, { method: 'DELETE' });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

export const resetLeaderboard = async () => {
    try {
        const res = await fetch(`${API_BASE}/leaderboard/reset`, { method: 'DELETE' });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

export const resetAllData = async () => {
    try {
        const res = await fetch(`${API_BASE}/reset-all`, { method: 'DELETE' });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

// ============ GAME STATUS ============

export const checkGameStarted = async () => {
    try {
        const res = await fetch(`${API_BASE}/game-status`);
        const data = await res.json();
        return data.started;
    } catch (err) {
        console.error('API Error:', err);
        return false;
    }
};

export const startGame = async () => {
    try {
        const res = await fetch(`${API_BASE}/game-status/start`, { method: 'POST' });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

export const stopGame = async () => {
    try {
        const res = await fetch(`${API_BASE}/game-status/stop`, { method: 'POST' });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

export const resetGame = async () => {
    try {
        const res = await fetch(`${API_BASE}/game-status/reset`, { method: 'POST' });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

// ============ ANSWER HISTORY ============

export const addAnswerHistory = async (qrId, question, correctAnswer, companyId, companyName, pieceIndex) => {
    try {
        const res = await fetch(`${API_BASE}/answer-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrId, question, correctAnswer, companyId, companyName, pieceIndex })
        });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { success: false };
    }
};

export const getAnswerHistory = async () => {
    try {
        const res = await fetch(`${API_BASE}/answer-history`);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return [];
    }
};

// ============ LIVE DASHBOARD ============

export const getLiveDashboard = async () => {
    try {
        const res = await fetch(`${API_BASE}/live-dashboard`);
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { answerHistory: [], gameStates: [], leaderboard: [], gameStarted: false };
    }
};

export default {
    checkQRUsed,
    markQRUsed,
    getUsedQRCodes,
    getGameState,
    revealPiece,
    getLeaderboard,
    addToLeaderboard,
    getStats,
    resetUsedQRCodes,
    resetGameStates,
    resetLeaderboard,
    resetAllData,
    checkGameStarted,
    startGame,
    stopGame,
    resetGame,
    addAnswerHistory,
    getAnswerHistory,
    getLiveDashboard,
};
