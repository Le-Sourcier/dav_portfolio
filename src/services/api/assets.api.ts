import { apiClient } from './client';
import type { UploadedAsset } from '@/types/admin.types';

export type AssetScope = 'blog' | 'projects' | 'experiences' | 'general';

export const assetsApi = {
  async uploadImage(file: File, scope: AssetScope = 'general'): Promise<UploadedAsset> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('scope', scope);

    return apiClient.upload<UploadedAsset>('/assets/upload', formData, {
      timeout: 60_000,
    });
  },
};

export default assetsApi;
