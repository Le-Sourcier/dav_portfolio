import { redirectToPreferredLocale } from "@/lib/routing/localeRedirect";

export default async function RootRedirectPage() {
  await redirectToPreferredLocale("/");
}
