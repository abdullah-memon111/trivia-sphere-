export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: { [questionId: string]: string };
  startTime: number | null;
  endTime: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface HighScore {
  category: string;
  score: number;
  totalQuestions: number;
  date: string;
}
