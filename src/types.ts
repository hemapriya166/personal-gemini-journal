export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  lastLoginAt?: string;
}

export type ReflectionMode = 'reflect' | 'summarize' | 'brainstorm' | 'socratic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mode: ReflectionMode;
  messages: ChatMessage[];
  aiSummary?: string;
  insights?: string[];
  tags: string[];
  mood?: 'reflective' | 'optimistic' | 'challenged' | 'grateful' | 'curious' | 'neutral';
  createdAt: string;
  updatedAt: string;
}

export interface GeminiResponse {
  reply: string;
  summary?: string;
  insights?: string[];
  modelUsed: string;
}
