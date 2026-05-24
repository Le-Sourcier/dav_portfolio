import type { BlogComment } from "@/types/blog";

export function collectAuthors(comments: BlogComment[]): string[] {
  const set = new Set<string>();
  const walk = (list: BlogComment[]) => {
    for (const c of list) {
      set.add(c.author);
      if (c.replies?.length) walk(c.replies);
    }
  };
  walk(comments);
  return Array.from(set);
}
