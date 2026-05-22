import type { BlogComment } from "@/types/blog";

/**
 * Convert a flat list of comments (with parentId) into a nested tree.
 * Root comments (parentId === null/undefined) appear first, sorted by createdAt DESC.
 * Replies are sorted ASC (chronological) under their parent.
 */
export function buildCommentTree(flat: BlogComment[]): BlogComment[] {
  const byId = new Map<string, BlogComment>();
  const roots: BlogComment[] = [];

  for (const c of flat) {
    byId.set(c.id, { ...c, replies: [] });
  }

  for (const c of flat) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      const parent = byId.get(c.parentId)!;
      parent.replies ??= [];
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const root of roots) {
    root.replies?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  return roots;
}
