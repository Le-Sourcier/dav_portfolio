import { apiClient } from './client';
import type { ProfileData, SocialLinks, SeoData, SkillsData, EducationData } from '@/stores/settingsStore';

export interface ApiSettings {
  profile?: ProfileData;
  socialLinks?: SocialLinks;
  seo?: SeoData;
  skills?: SkillsData;
  education?: EducationData;
}

export const settingsApi = {
  async getAll(): Promise<ApiSettings> {
    return apiClient.get<ApiSettings>('/settings');
  },

  async update(data: ApiSettings): Promise<ApiSettings> {
    return apiClient.put<ApiSettings>('/settings', data);
  },
};

export default settingsApi;
