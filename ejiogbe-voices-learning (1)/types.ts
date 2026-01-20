
export enum AppMode {
  TRANSCRIBE = 'TRANSCRIBE',
  TTS = 'TTS',
  LIVE = 'LIVE',
  TRANSLATE = 'TRANSLATE',
  NOTEBOOK = 'NOTEBOOK',
  FLASHCARDS = 'FLASHCARDS',
  ALPHABETS = 'ALPHABETS',
  QUIZZES = 'QUIZZES'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AudioVisualizerProps {
  stream?: MediaStream;
  isRecording: boolean;
  color?: string;
}

export interface SavedItem {
  id: string;
  type: 'vocabulary' | 'pronunciation';
  timestamp: number;
  sourceText?: string;
  translatedText?: string;
  sourceLang?: string;
  targetLang?: string;
  tags?: string[];
  phrase?: string;
  score?: number;
  correction?: {
    word: string;
    phoneme: string;
    issue: string;
    tip: string;
  };
}

export interface LiveFeedback {
  id: string;
  timestamp: number;
  grammarScore: number;
  sentiment: string;
  feedbackText: string;
  correction?: string;
  userTranscript?: string;
}

export interface LearningGoal {
  id: string;
  text: string;
  status: 'active' | 'completed';
  createdAt: number;
}

export interface SessionLog {
  id: string;
  timestamp: number;
  durationSeconds: number;
  language: string;
  category: string;
  averageScore: number;
  feedbackCount: number;
  xpGained?: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

// Quiz Types
export type QuizType = 
  | 'multiple_choice' 
  | 'word_scramble' 
  | 'matching' 
  | 'fill_blanks' 
  | 'odd_one_out' 
  | 'synonym_pair' 
  | 'translation_blitz'
  | 'scenario_choice'
  | 'true_false';

export interface QuizActivity {
  id: string;
  type: QuizType;
  question: string;
  context?: string;
  options?: string[]; // For MC, Scramble, OddOneOut
  pairs?: { left: string; right: string }[]; // For Matching
  answer: string | string[];
  explanation: string;
}
