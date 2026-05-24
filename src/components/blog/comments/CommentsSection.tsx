"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CommentForm } from "@/components/blog/comments/CommentForm";
import { CommentList } from "@/components/blog/comments/CommentList";
import { buildCommentTree } from "@/utils/buildCommentTree";
import { collectAuthors } from "@/utils/collectAuthors";
import type { BlogComment } from "@/types/blog";

interface CommentsSectionProps {
  postId: string;
  initialComments: BlogComment[];
  language?: string;
}

function flattenComments(tree: BlogComment[]): BlogComment[] {
  const result: BlogComment[] = [];
  for (const node of tree) {
    result.push(node);
    if (node.replies) result.push(...flattenComments(node.replies));
  }
  return result;
}

export function CommentsSection({ postId, initialComments, language }: CommentsSectionProps) {
  const t = useTranslations("BlogComments");
  const [tree, setTree] = useState(() => buildCommentTree(initialComments));

  const total = flattenComments(tree).length;
  const allAuthors = collectAuthors(tree);

  const handlePosted = (created: BlogComment) => {
    setTree((prev) => {
      if (created.parentId) {
        const insert = (nodes: BlogComment[]): BlogComment[] =>
          nodes.map((n) => {
            if (n.id === created.parentId) {
              return { ...n, replies: [...(n.replies ?? []), created] };
            }
            if (n.replies?.length) return { ...n, replies: insert(n.replies) };
            return n;
          });
        return insert(prev);
      }
      return [created, ...prev];
    });
  };

  const handleReply = (reply: BlogComment) => {
    setTree((prev) => {
      const insert = (nodes: BlogComment[]): BlogComment[] =>
        nodes.map((n) => {
          if (n.id === reply.parentId) {
            return { ...n, replies: [...(n.replies ?? []), reply] };
          }
          if (n.replies?.length) return { ...n, replies: insert(n.replies) };
          return n;
        });
      return insert(prev);
    });
  };

  return (
    <section className="article-comments" aria-labelledby="article-comments-title">
      <header className="article-comments-head">
        <span className="article-comments-kicker">{t("kicker")}</span>
        <div className="article-comments-headline">
          <h2 id="article-comments-title">{t("title")}</h2>
          <p className="article-comments-count">{t("count", { count: total })}</p>
        </div>
      </header>

      <CommentForm postId={postId} onPosted={handlePosted} allAuthors={allAuthors} />

      <CommentList
        comments={tree}
        language={language}
        postId={postId}
        emptyLabel={t("empty")}
        onReply={handleReply}
      />
    </section>
  );
}
