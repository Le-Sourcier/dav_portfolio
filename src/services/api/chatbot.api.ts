import { apiClient } from './client';
import type { Message } from '@/components/portfolio/chatbot/types';

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

// Unique session ID per browser tab (persists in sessionStorage)
function getSessionId(): string {
  const key = 'chatbot-session-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export const chatbotApi = {
  async sendMessage(
    content: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>,
    lang: 'fr' | 'en' = 'fr',
  ): Promise<Message> {
    return apiClient.post<Message>('/chatbot/message', {
      content,
      history,
      sessionId: getSessionId(),
      lang,
    });
  },

  async getQuickActions(): Promise<QuickAction[]> {
    return apiClient.get<QuickAction[]>('/chatbot/quick-actions');
  },

  async getInitialMessage(lang: 'fr' | 'en' = 'fr'): Promise<Message> {
    return apiClient.get<Message>(`/chatbot/initial?lang=${lang}`);
  },
};
