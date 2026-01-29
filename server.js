import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Database setup
const db = new Database(path.join(__dirname, 'game.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS used_qr (
    qr_id TEXT PRIMARY KEY,
    used_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS game_state (
    company_id TEXT PRIMARY KEY,
    revealed_pieces TEXT DEFAULT '[]',
    start_time TEXT,
    end_time TEXT,
    is_completed INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    company_name TEXT,
    completed_at TEXT,
    timestamp INTEGER,
    completion_time INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS answer_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    qr_id TEXT,
    question TEXT,
    correct_answer TEXT,
    company_id TEXT,
    company_name TEXT,
    piece_index INTEGER,
    answered_at TEXT DEFAULT CURRENT_TIMESTAMP,
    timestamp INTEGER
  );
`);

app.use(cors());
app.use(express.json());

// ============ QR CODES ============

// Check if QR is used
app.get('/api/qr/check/:qrId', (req, res) => {
    const { qrId } = req.params;
    const row = db.prepare('SELECT * FROM used_qr WHERE qr_id = ?').get(qrId);
    res.json({ used: !!row });
});

// Mark QR as used
app.post('/api/qr/use/:qrId', (req, res) => {
    const { qrId } = req.params;
    try {
        db.prepare('INSERT OR IGNORE INTO used_qr (qr_id) VALUES (?)').run(qrId);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// Get all used QR codes
app.get('/api/qr/used', (req, res) => {
    const rows = db.prepare('SELECT qr_id FROM used_qr').all();
    res.json(rows.map(r => r.qr_id));
});

// Reset used QR codes
app.delete('/api/qr/reset', (req, res) => {
    db.prepare('DELETE FROM used_qr').run();
    res.json({ success: true });
});

// ============ GAME STATE ============

// Get game state for a company
app.get('/api/game/:companyId', (req, res) => {
    const { companyId } = req.params;
    let row = db.prepare('SELECT * FROM game_state WHERE company_id = ?').get(companyId);

    if (!row) {
        // Create new game state
        db.prepare('INSERT INTO game_state (company_id, revealed_pieces) VALUES (?, ?)').run(companyId, '[]');
        row = { company_id: companyId, revealed_pieces: '[]', is_completed: 0 };
    }

    res.json({
        companyId: row.company_id,
        revealedPieces: JSON.parse(row.revealed_pieces),
        startTime: row.start_time,
        endTime: row.end_time,
        isCompleted: !!row.is_completed
    });
});

// Reveal a piece for a company
app.post('/api/game/:companyId/reveal', (req, res) => {
    const { companyId } = req.params;
    const { pieceIndex, gridSize } = req.body;

    let row = db.prepare('SELECT * FROM game_state WHERE company_id = ?').get(companyId);

    if (!row) {
        db.prepare('INSERT INTO game_state (company_id, revealed_pieces, start_time) VALUES (?, ?, ?)').run(
            companyId, '[]', new Date().toISOString()
        );
        row = { revealed_pieces: '[]' };
    }

    const revealedPieces = JSON.parse(row.revealed_pieces);

    // If piece already revealed, find a new one
    let newPieceIndex = pieceIndex;
    const totalPieces = gridSize * gridSize;

    if (revealedPieces.includes(pieceIndex)) {
        // Find an unrevealed piece
        for (let i = 0; i < totalPieces; i++) {
            if (!revealedPieces.includes(i)) {
                newPieceIndex = i;
                break;
            }
        }
    }

    // Check if all pieces already revealed
    if (revealedPieces.length >= totalPieces) {
        return res.json({
            success: false,
            message: 'All pieces already revealed',
            revealedPieces,
            isCompleted: true
        });
    }

    // Add new piece
    if (!revealedPieces.includes(newPieceIndex)) {
        revealedPieces.push(newPieceIndex);
    }

    // Check if completed
    const isCompleted = revealedPieces.length >= totalPieces;
    const endTime = isCompleted ? new Date().toISOString() : null;

    db.prepare(`
    UPDATE game_state 
    SET revealed_pieces = ?, is_completed = ?, end_time = ?
    WHERE company_id = ?
  `).run(JSON.stringify(revealedPieces), isCompleted ? 1 : 0, endTime, companyId);

    res.json({
        success: true,
        newPieceIndex,
        revealedPieces,
        isCompleted
    });
});

// Reset game state for all companies
app.delete('/api/game/reset', (req, res) => {
    db.prepare('DELETE FROM game_state').run();
    res.json({ success: true });
});

// ============ LEADERBOARD ============

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    const rows = db.prepare('SELECT * FROM leaderboard ORDER BY timestamp ASC').all();
    res.json(rows);
});

// Add to leaderboard
app.post('/api/leaderboard', (req, res) => {
    const { companyId, companyName, completedAt } = req.body;

    // Check if company already in leaderboard
    const existing = db.prepare('SELECT * FROM leaderboard WHERE company_id = ?').get(companyId);
    if (existing) {
        return res.json({ success: false, message: 'Already in leaderboard' });
    }

    // Calculate completion time
    const gameStartTimeRow = db.prepare('SELECT value FROM config WHERE key = ?').get('game_start_time');
    const gameStartTime = gameStartTimeRow ? parseInt(gameStartTimeRow.value) : Date.now();
    const completionTime = Date.now() - gameStartTime;

    db.prepare(`
    INSERT INTO leaderboard (company_id, company_name, completed_at, timestamp, completion_time)
    VALUES (?, ?, ?, ?, ?)
  `).run(companyId, companyName, completedAt, Date.now(), completionTime);

    res.json({ success: true, completionTime });
});

// Reset leaderboard
app.delete('/api/leaderboard/reset', (req, res) => {
    db.prepare('DELETE FROM leaderboard').run();
    res.json({ success: true });
});

// ============ FULL RESET (for admin) ============
app.delete('/api/reset-all', (req, res) => {
    db.prepare('DELETE FROM used_qr').run();
    db.prepare('DELETE FROM game_state').run();
    db.prepare('DELETE FROM leaderboard').run();
    res.json({ success: true, message: 'All data reset' });
});

// ============ STATS ============
app.get('/api/stats', (req, res) => {
    const usedQRCount = db.prepare('SELECT COUNT(*) as count FROM used_qr').get().count;
    const gameStates = db.prepare('SELECT * FROM game_state').all();
    const leaderboard = db.prepare('SELECT * FROM leaderboard ORDER BY timestamp ASC').all();

    // Get game started status
    const gameStartedRow = db.prepare('SELECT value FROM config WHERE key = ?').get('game_started');
    const gameStarted = gameStartedRow ? gameStartedRow.value === 'true' : false;

    res.json({
        usedQRCount,
        gameStarted,
        gameStates: gameStates.map(g => ({
            companyId: g.company_id,
            revealedPieces: JSON.parse(g.revealed_pieces),
            isCompleted: !!g.is_completed
        })),
        leaderboard
    });
});

// ============ GAME STATUS (Start/Stop) ============

// Check if game is started
app.get('/api/game-status', (req, res) => {
    const row = db.prepare('SELECT value FROM config WHERE key = ?').get('game_started');
    const started = row ? row.value === 'true' : false;
    res.json({ started });
});

// Start game
app.post('/api/game-status/start', (req, res) => {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('game_started', 'true');
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('game_start_time', Date.now().toString());
    res.json({ success: true, started: true });
});

// Stop game
app.post('/api/game-status/stop', (req, res) => {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('game_started', 'false');
    res.json({ success: true, started: false });
});

// Reset game (clear all pieces, QR used, leaderboard but keep game started)
app.post('/api/game-status/reset', (req, res) => {
    db.prepare('DELETE FROM used_qr').run();
    db.prepare('DELETE FROM game_state').run();
    db.prepare('DELETE FROM leaderboard').run();
    db.prepare('DELETE FROM answer_history').run();
    res.json({ success: true, message: 'Game reset - all data cleared' });
});

// ============ ANSWER HISTORY ============

// Add answer to history
app.post('/api/answer-history', (req, res) => {
    const { qrId, question, correctAnswer, companyId, companyName, pieceIndex } = req.body;
    try {
        db.prepare(`
            INSERT INTO answer_history (qr_id, question, correct_answer, company_id, company_name, piece_index, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(qrId, question, correctAnswer, companyId, companyName, pieceIndex, Date.now());
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// Get answer history (for live dashboard)
app.get('/api/answer-history', (req, res) => {
    const rows = db.prepare('SELECT * FROM answer_history ORDER BY timestamp DESC LIMIT 50').all();
    res.json(rows);
});

// ============ LIVE DASHBOARD DATA ============

// Get all data for live dashboard
app.get('/api/live-dashboard', (req, res) => {
    // Get recent answers
    const answerHistory = db.prepare('SELECT * FROM answer_history ORDER BY timestamp DESC LIMIT 20').all();

    // Get all game states
    const gameStates = db.prepare('SELECT * FROM game_state').all();

    // Get leaderboard
    const leaderboard = db.prepare('SELECT * FROM leaderboard ORDER BY timestamp ASC').all();

    // Get game started status
    const gameStartedRow = db.prepare('SELECT value FROM config WHERE key = ?').get('game_started');
    const gameStarted = gameStartedRow ? gameStartedRow.value === 'true' : false;

    // Get game start time
    const gameStartTimeRow = db.prepare('SELECT value FROM config WHERE key = ?').get('game_start_time');
    const gameStartTime = gameStartTimeRow ? parseInt(gameStartTimeRow.value) : null;

    res.json({
        answerHistory,
        gameStates: gameStates.map(g => ({
            companyId: g.company_id,
            revealedPieces: JSON.parse(g.revealed_pieces),
            isCompleted: !!g.is_completed
        })),
        leaderboard,
        gameStarted,
        gameStartTime
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Game Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
    console.log(`📱 Điện thoại kết nối qua IP máy tính + port ${PORT}`);
});
