import { apiClient } from './client';

export const visitorApi = {
  async requestOtp(email: string, name: string): Promise<void> {
    await apiClient.post('/visitor/request-otp', { email, name }, { skipAuth: true });
  },

  async verifyOtp(email: string, code: string, name: string, remember: boolean): Promise<{ token: string }> {
    return apiClient.post<{ token: string }>('/visitor/verify-otp', { email, code, name, remember }, { skipAuth: true });
  },
};

export default visitorApi;
