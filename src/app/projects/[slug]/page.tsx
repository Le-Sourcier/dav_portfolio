import { redirectToPreferredLocale } from "@/lib/routing/localeRedirect";

type ProjectRedirectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectRedirectPage({ params }: ProjectRedirectPageProps) {
  const { slug } = await params;
  await redirectToPreferredLocale(`/projects/${slug}`);
}
