import { redirectToPreferredLocale } from "@/lib/routing/localeRedirect";

export default async function ExperiencesRedirectPage() {
  await redirectToPreferredLocale("/experiences");
}
