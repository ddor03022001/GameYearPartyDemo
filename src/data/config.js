// Game Configuration
export const GAME_CONFIG = {
  // Grid size: 2, 3, or 4 (2x2, 3x3, 4x4)
  gridSize: 3,

  // Base URL for the app (used in QR codes)
  baseUrl: window.location.origin,

  // Companies with their logos
  companies: [
    { id: 'company1', name: 'Công ty A', logo: '/logos/company1.svg' },
    { id: 'company2', name: 'Công ty B', logo: '/logos/company2.svg' },
    { id: 'company3', name: 'Công ty C', logo: '/logos/company3.svg' },
  ],
};

// Default questions (can be overwritten by Excel import)
export const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: 'Tết Nguyên Đán còn được gọi là gì?',
    answers: ['Tết Dương Lịch', 'Tết Âm Lịch', 'Tết Trung Thu', 'Tết Đoan Ngọ'],
    correctAnswer: 1,
    priority: 10,
  },
  {
    id: 2,
    question: 'Hoa nào là biểu tượng của Tết ở miền Bắc?',
    answers: ['Hoa Mai', 'Hoa Đào', 'Hoa Cúc', 'Hoa Ly'],
    correctAnswer: 1,
    priority: 10,
  },
  {
    id: 3,
    question: 'Món ăn truyền thống nào nhất định phải có trong ngày Tết?',
    answers: ['Pizza', 'Bánh Chưng', 'Hamburger', 'Sushi'],
    correctAnswer: 1,
    priority: 10,
  },
  {
    id: 4,
    question: 'Màu sắc nào thường được sử dụng nhất trong trang trí Tết?',
    answers: ['Xanh dương', 'Đỏ', 'Tím', 'Đen'],
    correctAnswer: 1,
    priority: 10,
  },
  {
    id: 5,
    question: '"Chúc Mừng Năm Mới" thường được nói vào dịp nào?',
    answers: ['Sinh nhật', 'Tết Nguyên Đán', 'Halloween', 'Giáng Sinh'],
    correctAnswer: 1,
    priority: 10,
  },
  {
    id: 6,
    question: 'Trẻ em thường được nhận gì vào dịp Tết?',
    answers: ['Tiền lì xì', 'Kẹo', 'Đồ chơi', 'Sách'],
    correctAnswer: 0,
    priority: 10,
  },
  {
    id: 7,
    question: 'Cây nào thường được trưng trong nhà dịp Tết ở miền Nam?',
    answers: ['Cây thông', 'Cây đào', 'Cây mai', 'Cây bàng'],
    correctAnswer: 2,
    priority: 10,
  },
  {
    id: 8,
    question: 'Tết Nguyên Đán thường rơi vào tháng nào theo lịch dương?',
    answers: ['Tháng 12', 'Tháng 1 hoặc 2', 'Tháng 3', 'Tháng 4'],
    correctAnswer: 1,
    priority: 10,
  },
  {
    id: 9,
    question: 'Bánh nào thường được làm vào dịp Tết ở miền Nam?',
    answers: ['Bánh Chưng', 'Bánh Tét', 'Bánh Mì', 'Bánh Cuốn'],
    correctAnswer: 1,
    priority: 10,
  },
];

export default GAME_CONFIG;
