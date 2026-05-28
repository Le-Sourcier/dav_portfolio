export { apiClient, getToken, setToken, removeToken, clearTokens } from './client';
export { authApi } from './auth.api';
export { projectsApi } from './projects.api';
export { experiencesApi } from './experiences.api';
export { blogApi } from './blog.api';
export { contactsApi } from './contacts.api';
export { appointmentsApi } from './appointments.api';
export { newsletterApi } from './newsletter.api';
export { testimonialsApi } from './testimonials.api';
export { settingsApi } from './settings.api';
export { chatbotApi } from './chatbot.api';
export { visitorApi } from './visitor.api';
export { analyticsApi } from './analytics.api';
export { assetsApi } from './assets.api';
export type { TrafficPeriod } from './analytics.api';

// Re-export apiClient methods + module APIs for backward compatibility
import { apiClient } from './client';
import { authApi } from './auth.api';
import { projectsApi } from './projects.api';
import { experiencesApi } from './experiences.api';
import { blogApi } from './blog.api';
import { contactsApi } from './contacts.api';
import { appointmentsApi } from './appointments.api';
import { newsletterApi } from './newsletter.api';
import { testimonialsApi } from './testimonials.api';
import { analyticsApi } from './analytics.api';
import { assetsApi } from './assets.api';

/**
 * Unified API object with backward compatibility.
 * - api.get(), api.post(), api.put(), api.delete() for legacy portfolio components
 * - api.auth, api.projects, etc. for structured access
 */
export const api = {
  // Direct HTTP methods (legacy - used by portfolio components)
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint, { skipAuth: true }),
  post: <T>(endpoint: string, data?: unknown) => apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: unknown) => apiClient.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),

  // Module APIs
  auth: authApi,
  projects: projectsApi,
  experiences: experiencesApi,
  blog: blogApi,
  contacts: contactsApi,
  appointments: appointmentsApi,
  newsletter: newsletterApi,
  testimonials: testimonialsApi,
  analytics: analyticsApi,
  assets: assetsApi,
};

export default api;
