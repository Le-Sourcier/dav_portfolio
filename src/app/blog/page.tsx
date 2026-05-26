import { redirectToPreferredLocale } from "@/lib/routing/localeRedirect";

export default async function BlogRedirectPage() {
  await redirectToPreferredLocale("/blog");
}
