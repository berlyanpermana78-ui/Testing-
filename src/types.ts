export type ToneType = 'mono-thinking' | 'mono-fast';

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  content: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isOptimized?: boolean;
  file?: FileAttachment;
  sources?: GroundingSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  tone: ToneType;
}

export interface UserSettings {
  focusMode: boolean;
  activeSessionId: string | null;
  tone: ToneType;
}
