import { redirectToPreferredLocale } from "@/lib/routing/localeRedirect";

export default async function ProjectsRedirectPage() {
  await redirectToPreferredLocale("/projects");
}
