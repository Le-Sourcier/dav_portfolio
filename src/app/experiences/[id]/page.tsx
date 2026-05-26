import { redirectToPreferredLocale } from "@/lib/routing/localeRedirect";

type ExperienceRedirectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExperienceRedirectPage({ params }: ExperienceRedirectPageProps) {
  const { id } = await params;
  await redirectToPreferredLocale(`/experiences/${id}`);
}
