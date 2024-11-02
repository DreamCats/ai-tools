export interface Message {
  id: string;
  content: string;
  timestamp: number;
  role: 'user' | 'assistant';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
} 