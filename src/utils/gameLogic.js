// Game Logic utilities

import { getQuestions, updateQuestionPriority, getGridSize } from './storage';
import { DEFAULT_QUESTIONS, GAME_CONFIG } from '../data/config';

/**
 * Get a random question based on priority (higher priority = more likely to be selected)
 * @returns {Object} Random question
 */
export const getRandomQuestion = () => {
    let questions = getQuestions();

    // Use default questions if none are saved
    if (!questions || questions.length === 0) {
        questions = [...DEFAULT_QUESTIONS];
    }

    // Calculate total priority
    const totalPriority = questions.reduce((sum, q) => sum + q.priority, 0);

    // Get random number
    let random = Math.random() * totalPriority;

    // Select question based on priority
    for (const question of questions) {
        random -= question.priority;
        if (random <= 0) {
            return question;
        }
    }

    // Fallback to first question
    return questions[0];
};

/**
 * Check if answer is correct
 * @param {Object} question - Question object
 * @param {number} answerIndex - Selected answer index
 * @returns {boolean}
 */
export const checkAnswer = (question, answerIndex) => {
    return question.correctAnswer === answerIndex;
};

/**
 * Handle correct answer - decrease priority
 * @param {number} questionId - Question ID
 */
export const handleCorrectAnswer = (questionId) => {
    updateQuestionPriority(questionId, true); // decrease priority
};

/**
 * Get a random unrevealed piece index
 * @param {Array} revealedPieces - Already revealed piece indices
 * @param {number} gridSize - Grid size (2, 3, or 4)
 * @returns {number|null} Random piece index or null if all revealed
 */
export const getRandomPieceIndex = (revealedPieces, gridSize = null) => {
    const size = gridSize || getGridSize() || GAME_CONFIG.gridSize;
    const totalPieces = size * size;

    // Get all unrevealed pieces
    const unrevealedPieces = [];
    for (let i = 0; i < totalPieces; i++) {
        if (!revealedPieces.includes(i)) {
            unrevealedPieces.push(i);
        }
    }

    // Return null if all pieces are revealed
    if (unrevealedPieces.length === 0) {
        return null;
    }

    // Return random unrevealed piece
    const randomIndex = Math.floor(Math.random() * unrevealedPieces.length);
    return unrevealedPieces[randomIndex];
};

/**
 * Check if puzzle is complete
 * @param {Array} revealedPieces - Revealed piece indices
 * @param {number} gridSize - Grid size
 * @returns {boolean}
 */
export const isPuzzleComplete = (revealedPieces, gridSize = null) => {
    const size = gridSize || getGridSize() || GAME_CONFIG.gridSize;
    const totalPieces = size * size;
    return revealedPieces.length >= totalPieces;
};

/**
 * Format duration from milliseconds to readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
export const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};

/**
 * Generate a unique player ID
 * @returns {string}
 */
export const generatePlayerId = () => {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export default {
    getRandomQuestion,
    checkAnswer,
    handleCorrectAnswer,
    getRandomPieceIndex,
    isPuzzleComplete,
    formatDuration,
    generatePlayerId,
};
