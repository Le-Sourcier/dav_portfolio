import { CommentItem } from "@/components/blog/comments/CommentItem";
import type { BlogComment } from "@/types/blog";

interface CommentListProps {
  comments: BlogComment[];
  language?: string;
  postId: string;
  emptyLabel: string;
  onReply: (reply: BlogComment) => void;
}

function collectAuthors(comments: BlogComment[]): string[] {
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

export function CommentList({ comments, language, postId, emptyLabel, onReply }: CommentListProps) {
  const allAuthors = collectAuthors(comments);

  if (comments.length === 0) {
    return (
      <div className="comment-empty" role="status">
        <span aria-hidden="true">·</span>
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ol className="comment-thread" aria-label="Commentaires">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          language={language}
          postId={postId}
          onReply={onReply}
          allAuthors={allAuthors}
        />
      ))}
    </ol>
  );
}
