import { useSettingsStore, type ProfileData, type SocialLinks, type SeoData, type SkillsData, type EducationData, type EducationEntry } from '@/stores/settingsStore';
import { useApiSettings } from '@/hooks/queries';
import { envConfig } from '@/config/env';
import { cvData } from '@/data/cvData';

/**
 * Unified profile data hook.
 * Priority: API (backend DB) > settingsStore (localStorage) > envConfig (.env) / cvData
 */
export function useProfile() {
  const { data: apiSettings } = useApiSettings();
  const storeProfile = useSettingsStore((s) => s.profile);
  const storeSocial = useSettingsStore((s) => s.socialLinks);
  const storeSeo = useSettingsStore((s) => s.seo);
  const storeSkills = useSettingsStore((s) => s.skills);
  const storeEducation = useSettingsStore((s) => s.education);

  // API data (highest priority)
  const apiProfile = apiSettings?.profile as ProfileData | undefined;
  const apiSocial = apiSettings?.socialLinks as SocialLinks | undefined;
  const apiSeo = apiSettings?.seo as SeoData | undefined;
  const apiSkills = apiSettings?.skills as SkillsData | undefined;
  const apiEducation = apiSettings?.education as EducationData | undefined;

  // Fallback chain: API > store > env
  const env = envConfig.owner;
  const pick = <T>(api: T | undefined, store: T, fallback: T): T =>
    api ?? (store || fallback);

  // For arrays: use API if non-empty, then store if non-empty, then fallback
  const pickArray = <T>(api: T[] | undefined, store: T[], fallback: T[]): T[] =>
    (api && api.length > 0) ? api : (store.length > 0 ? store : fallback);

  return {
    // Profile
    name: pick(apiProfile?.name, storeProfile.name, env.name),
    email: pick(apiProfile?.email, storeProfile.email, env.email),
    title: pick(apiProfile?.title, storeProfile.title, env.title),
    location: pick(apiProfile?.location, storeProfile.location, env.location),
    bio: pick(apiProfile?.bio, storeProfile.bio, env.bio),
    avatar: pick(apiProfile?.avatar, storeProfile.avatar, env.avatar),
    phone: pick(apiProfile?.phone, storeProfile.phone, env.phone),
    yearsExperience: pick(apiProfile?.yearsExperience, storeProfile.yearsExperience, ''),

    // Brand
    brand: pick(apiProfile?.brand, storeProfile.brand, envConfig.appBrand),

    // Social
    github: pick(apiSocial?.github, storeSocial.github, envConfig.social.github),
    linkedin: pick(apiSocial?.linkedin, storeSocial.linkedin, envConfig.social.linkedin),
    twitter: pick(apiSocial?.twitter, storeSocial.twitter, envConfig.social.twitter),
    website: pick(apiSocial?.website, storeSocial.website, envConfig.social.website),

    // SEO
    seo: {
      siteTitle: pick(apiSeo?.siteTitle, storeSeo.siteTitle, envConfig.appName),
      metaDescription: pick(apiSeo?.metaDescription, storeSeo.metaDescription, envConfig.appDescription),
      keywords: pick(apiSeo?.keywords, storeSeo.keywords, ''),
      ogImage: pick(apiSeo?.ogImage, storeSeo.ogImage, ''),
      ogTitle: pick(apiSeo?.ogTitle, storeSeo.ogTitle, envConfig.appName),
      ogType: pick(apiSeo?.ogType, storeSeo.ogType, 'website'),
    },

    // Skills — fallback to cvData
    skills: {
      frontend: pickArray(apiSkills?.frontend, storeSkills?.frontend ?? [], cvData.skills.frontend),
      backend: pickArray(apiSkills?.backend, storeSkills?.backend ?? [], cvData.skills.backend),
      tools: pickArray(apiSkills?.tools, storeSkills?.tools ?? [], cvData.skills.tools),
    },

    // Education — fallback to cvData (map to EducationEntry format)
    education: pickArray(
      apiEducation?.items,
      storeEducation?.items ?? (Array.isArray(storeEducation) ? storeEducation as unknown as EducationEntry[] : []),
      cvData.education.map((edu, i) => ({ id: String(i + 1), ...edu }))
    ),

    // Is loaded from API?
    isFromApi: !!apiSettings,
  };
}
