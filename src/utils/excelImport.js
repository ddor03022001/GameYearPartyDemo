import * as XLSX from 'xlsx';
import { saveQuestions } from './storage';

/**
 * Parse Excel file and extract questions
 * Expected format:
 * Column A: Question text
 * Column B: Answer A
 * Column C: Answer B  
 * Column D: Answer C
 * Column E: Answer D
 * Column F: Correct answer (A, B, C, or D)
 * 
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Parsed questions
 */
export const parseExcelQuestions = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Skip header row and parse questions
                const questions = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];

                    // Skip empty rows
                    if (!row[0]) continue;

                    // Map correct answer letter to index
                    const correctAnswerLetter = String(row[5]).toUpperCase().trim();
                    const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswerLetter);

                    if (correctAnswerIndex === -1) {
                        console.warn(`Invalid correct answer at row ${i + 1}: ${row[5]}`);
                        continue;
                    }

                    questions.push({
                        id: i,
                        question: String(row[0]).trim(),
                        answers: [
                            String(row[1] || '').trim(),
                            String(row[2] || '').trim(),
                            String(row[3] || '').trim(),
                            String(row[4] || '').trim(),
                        ],
                        correctAnswer: correctAnswerIndex,
                        priority: 10, // Default priority
                    });
                }

                resolve(questions);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};

/**
 * Import questions from Excel file and save to storage
 * @param {File} file - Excel file
 * @returns {Promise<Object>} Result with success status and message
 */
export const importQuestionsFromExcel = async (file) => {
    try {
        const questions = await parseExcelQuestions(file);

        if (questions.length === 0) {
            return {
                success: false,
                message: 'Không tìm thấy câu hỏi hợp lệ trong file Excel.',
            };
        }

        saveQuestions(questions);

        return {
            success: true,
            message: `Đã import ${questions.length} câu hỏi thành công!`,
            count: questions.length,
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi khi đọc file: ${error.message}`,
        };
    }
};

/**
 * Generate sample Excel template
 * @returns {Blob} Excel file blob
 */
export const generateExcelTemplate = () => {
    const data = [
        ['Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng'],
        ['Tết Nguyên Đán còn được gọi là gì?', 'Tết Dương Lịch', 'Tết Âm Lịch', 'Tết Trung Thu', 'Tết Đoan Ngọ', 'B'],
        ['Hoa nào là biểu tượng của Tết ở miền Bắc?', 'Hoa Mai', 'Hoa Đào', 'Hoa Cúc', 'Hoa Ly', 'B'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Câu hỏi');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export default {
    parseExcelQuestions,
    importQuestionsFromExcel,
    generateExcelTemplate,
};
