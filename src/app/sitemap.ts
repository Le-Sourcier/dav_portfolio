import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/lib/portfolio";
import { loadBlogPosts } from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const localizedData = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      projects: await loadProjects(locale),
      blogPosts: await loadBlogPosts(locale),
    })),
  );

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...localizedData.flatMap(({ locale, projects, blogPosts }) => [
      {
        url: `${site.url}/${locale}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.95,
      },
      {
        url: `${site.url}/${locale}/blog`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      },
      {
        url: `${site.url}/${locale}/projects`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.85,
      },
      {
        url: `${site.url}/${locale}/experiences`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      },
      ...projects.map((project) => ({
        url: `${site.url}/${locale}/projects/${project.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: project.featured ? 0.8 : 0.6,
      })),
      ...blogPosts.map((post) => ({
        url: `${site.url}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: post.featured ? 0.75 : 0.65,
      })),
    ]),
  ];
}
