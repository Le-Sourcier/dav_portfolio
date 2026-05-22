"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { useAddComment } from "@/hooks/queries/useBlogQueries";
import { useVisitorSession } from "@/hooks/useVisitorSession";
import { formatRelativeTime } from "@/utils/relativeTime";
import type { BlogComment } from "@/types/blog";

interface CommentItemProps {
  comment: BlogComment;
  language?: string;
  postId: string;
  onReply: (reply: BlogComment) => void;
  depth?: number;
  allAuthors: string[];
}

const MAX_DEPTH = 3;

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?";

const AVATAR_TONES = ["a", "b", "c", "d", "e"] as const;
const toneOf = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length];
};

function highlightMentions(text: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = /@([A-Za-zÀ-ÿ][\wÀ-]*)/g;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="comment-mention">
        @{match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
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

interface MentionPopupProps {
  query: string;
  candidates: string[];
  onSelect: (name: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLTextAreaElement | null>;
}

function MentionPopup({ query, candidates, onSelect, onClose, anchorRef }: MentionPopupProps) {
  const [active, setActive] = useState(0);
  const filtered = candidates.filter((n) => n.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (filtered.length === 0) {
      onClose();
      return;
    }
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        onSelect(filtered[active]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [filtered, active, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div className="mention-popup" role="listbox">
      {filtered.slice(0, 6).map((name, i) => (
        <button
          key={name}
          type="button"
          role="option"
          aria-selected={i === active}
          className={i === active ? "mention-popup-item is-active" : "mention-popup-item"}
          onMouseEnter={() => setActive(i)}
          onClick={() => onSelect(name)}
        >
          <span className={`mention-popup-avatar mention-popup-avatar--${toneOf(name)}`}>
            {initialsOf(name)}
          </span>
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}

function ReplyComposer({
  parentId,
  parentAuthor,
  postId,
  language,
  onReply,
  allAuthors,
}: {
  parentId: string;
  parentAuthor: string;
  postId: string;
  language?: string;
  onReply: (reply: BlogComment) => void;
  allAuthors: string[];
}) {
  const t = useTranslations("BlogComments");
  const session = useVisitorSession();
  const addComment = useAddComment();
  const [content, setContent] = useState(`@${parentAuthor} `);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionPos, setMentionPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const cursor = e.target.selectionStart ?? 0;
    const before = val.slice(0, cursor);
    const atMatch = before.match(/@([A-Za-zÀ-]*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionOpen(true);
      setMentionPos(cursor - atMatch[1].length);
    } else {
      setMentionOpen(false);
    }
  };

  const insertMention = (name: string) => {
    const before = content.slice(0, mentionPos);
    const after = content.slice(mentionPos + mentionQuery.length + 1);
    const next = `${before}@${name} ${after}`;
    setContent(next);
    setMentionOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSubmit = () => {
    if (!content.trim() || !session.name || !session.email) return;
    addComment.mutate(
      { postId, data: { author: session.name, email: session.email, content: content.trim(), parentId } },
      {
        onSuccess: (created) => {
          setContent("");
          onReply({
            id: created.id,
            author: created.author,
            content: created.content,
            createdAt: created.createdAt,
            parentId,
          });
        },
      },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen) return;
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="comment-reply-form">
      <div className="comment-reply-input-wrap">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={t("replyPlaceholder", { author: parentAuthor })}
          rows={2}
          maxLength={1000}
        />
        {mentionOpen && (
          <MentionPopup
            query={mentionQuery}
            candidates={allAuthors}
            onSelect={insertMention}
            onClose={() => setMentionOpen(false)}
            anchorRef={textareaRef}
          />
        )}
      </div>
      <div className="comment-reply-actions">
        <button type="button" className="comment-link-button" onClick={() => setContent("")}>
          {t("cancel")}
        </button>
        <button
          type="button"
          className="comment-primary-button is-small"
          disabled={addComment.isPending || !content.trim()}
          onClick={handleSubmit}
        >
          {addComment.isPending ? t("publishing") : t("publishReply")}
        </button>
      </div>
    </div>
  );
}

export function CommentItem({ comment, language, postId, onReply, depth = 0, allAuthors }: CommentItemProps) {
  const t = useTranslations("BlogComments");
  const session = useVisitorSession();
  const [replyOpen, setReplyOpen] = useState(false);

  const canReply = depth < MAX_DEPTH && session.isVerified;
  const isRoot = depth === 0;

  return (
    <li className={`comment-item${isRoot ? " comment-item--root" : ""}`}>
      <div className="comment-card">
        <div className={`comment-avatar comment-avatar--${toneOf(comment.author)}`} aria-hidden="true">
          {initialsOf(comment.author)}
        </div>
        <div className="comment-card-body">
          <header className="comment-card-header">
            <strong className="comment-card-author">{comment.author}</strong>
            <span className="comment-card-sep" aria-hidden="true">·</span>
            <time
              className="comment-card-date"
              dateTime={comment.createdAt}
              title={new Date(comment.createdAt).toLocaleString(language === "en" ? "en-US" : "fr-FR")}
            >
              {formatRelativeTime(comment.createdAt, language)}
            </time>
          </header>
          <p className="comment-text">{highlightMentions(comment.content)}</p>
          {canReply && (
            <div className="comment-actions">
              <button type="button" className="comment-reply-btn" onClick={() => setReplyOpen((v) => !v)}>
                {replyOpen ? t("cancel") : t("reply")}
              </button>
            </div>
          )}
          {replyOpen && (
            <ReplyComposer
              parentId={comment.id}
              parentAuthor={comment.author}
              postId={postId}
              language={language}
              onReply={(reply) => {
                setReplyOpen(false);
                onReply(reply);
              }}
              allAuthors={allAuthors}
            />
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <ol className="comment-thread">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              language={language}
              postId={postId}
              onReply={onReply}
              depth={depth + 1}
              allAuthors={allAuthors}
            />
          ))}
        </ol>
      )}
    </li>
  );
}
