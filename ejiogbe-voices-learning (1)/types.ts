
export enum AppMode {
  TRANSCRIBE = 'TRANSCRIBE',
  TTS = 'TTS',
  LIVE = 'LIVE',
  TRANSLATE = 'TRANSLATE',
  NOTEBOOK = 'NOTEBOOK',
  FLASHCARDS = 'FLASHCARDS'
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
  // Vocabulary Fields
  sourceText?: string;
  translatedText?: string;
  sourceLang?: string;
  targetLang?: string;
  tags?: string[]; // e.g., 'Formal', 'General'
  // Pronunciation Fields
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
}

export interface Flashcard {
  front: string;
  back: string;
}
