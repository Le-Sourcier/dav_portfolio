import { apiClient } from './client';
import type { NewsletterSubscriber } from '@/types/admin.types';

export const newsletterApi = {
  async subscribe(email: string): Promise<NewsletterSubscriber> {
    return apiClient.post<NewsletterSubscriber>('/newsletter/subscribe', { email });
  },

  async unsubscribe(email: string): Promise<void> {
    return apiClient.post('/newsletter/unsubscribe', { email });
  },

  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    return apiClient.get<NewsletterSubscriber[]>('/newsletter/subscribers');
  },

  async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    return apiClient.get<NewsletterSubscriber[]>('/newsletter/subscribers/active');
  },

  async getStats(): Promise<{ total: number; active: number; totalActive?: number }> {
    return apiClient.get<{ total: number; active: number; totalActive?: number }>('/newsletter/stats');
  },

  async sendArticle(data: {
    title: string;
    excerpt: string;
    slug: string;
    imageUrl?: string;
    category: string;
    readTime: string;
  }): Promise<{ sent: number; failed: number }> {
    return apiClient.post<{ sent: number; failed: number }>('/newsletter/send-article', data);
  },
};

export default newsletterApi;
