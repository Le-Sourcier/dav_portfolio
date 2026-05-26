import { redirectToPreferredLocale } from "@/lib/routing/localeRedirect";

type BlogPostRedirectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostRedirectPage({ params }: BlogPostRedirectPageProps) {
  const { slug } = await params;
  await redirectToPreferredLocale(`/blog/${slug}`);
}
