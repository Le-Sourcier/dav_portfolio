export type MessageRole = 'user' | 'assistant';

export type MessageType =
  | 'text'
  | 'appointment_picker'
  | 'project_link'
  | 'experience_link'
  | 'blog_link'
  | 'contact_form'
  | 'loading';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: MessageType;
  metadata?: Record<string, unknown>;
}

export interface QuickAction {
  id: string;
  label: string;
  label_en: string;
  prompt: string;
  prompt_en: string;
}