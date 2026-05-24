import { CommentItem } from "@/components/blog/comments/CommentItem";
import { collectAuthors } from "@/utils/collectAuthors";
import type { BlogComment } from "@/types/blog";

interface CommentListProps {
  comments: BlogComment[];
  language?: string;
  postId: string;
  emptyLabel: string;
  onReply: (reply: BlogComment) => void;
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
