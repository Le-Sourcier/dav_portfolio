"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { OtpInput } from "@/components/blog/comments/OtpInput";
import { MentionPopup } from "@/components/blog/comments/MentionPopup";
import { useAddComment } from "@/hooks/queries/useBlogQueries";
import { useVisitorSession } from "@/hooks/useVisitorSession";
import type { BlogComment } from "@/types/blog";

interface CommentFormProps {
  postId: string;
  onPosted: (comment: BlogComment) => void;
  allAuthors: string[];
}

const RESEND_COOLDOWN_S = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maskEmail = (email: string) => email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

export function CommentForm({ postId, onPosted, allAuthors }: CommentFormProps) {
  const t = useTranslations("BlogComments");
  const session = useVisitorSession();
  const addComment = useAddComment();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; label: string } | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionPos, setMentionPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [content]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!name.trim()) { setFeedback({ tone: "error", label: t("nameRequired") }); return; }
    if (!EMAIL_REGEX.test(email)) { setFeedback({ tone: "error", label: t("emailInvalid") }); return; }
    const ok = await session.requestOtp({ name: name.trim(), email: email.trim() });
    if (ok) setResendIn(RESEND_COOLDOWN_S);
  };

  const handleVerify = async (code: string) => {
    setFeedback(null);
    await session.verifyOtp({ code, remember: session.remember });
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setFeedback(null);
    const ok = await session.requestOtp({ name: session.name, email: session.email });
    if (ok) setResendIn(RESEND_COOLDOWN_S);
  };

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

  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); };
  }, []);

  const showFeedback = (tone: "error" | "success", label: string) => {
    setFeedback({ tone, label });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    if (tone === "success") {
      feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const trimmed = content.trim();
    if (!trimmed) { setFeedback({ tone: "error", label: t("contentRequired") }); return; }
    addComment.mutate(
      { postId, data: { author: session.name, email: session.email, content: trimmed } },
      {
        onSuccess: (created) => {
          setContent("");
          showFeedback("success", t("successPosted"));
          onPosted({ id: created.id, author: created.author, content: created.content, createdAt: created.createdAt });
        },
        onError: (err) => showFeedback("error", err.message),
      },
    );
  };

  // 1) Identify
  if (!session.isIdentified) {
    return (
      <form onSubmit={handleIdentify} className="comment-form" noValidate>
        <div className="comment-form-row">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} maxLength={100} required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} required />
          <button type="submit" className="comment-primary-button" disabled={session.otpStatus === "sending"}>
            {session.otpStatus === "sending" ? t("sending") : t("getCode")}
          </button>
        </div>
        {feedback && <p className={`comment-feedback is-${feedback.tone}`}>{feedback.label}</p>}
        <p className="comment-form-hint">{t("otpHint")}</p>
      </form>
    );
  }

  // 2) OTP
  if (!session.isVerified) {
    return (
      <div className="comment-form comment-form--otp">
        <p className="comment-form-hint">{t("verifyDesc", { email: maskEmail(session.email) })}</p>
        <OtpInput disabled={session.otpStatus === "verifying"} onComplete={handleVerify} />
        {session.otpError && <p className="comment-feedback is-error">{session.otpError}</p>}
        <div className="comment-form-row">
          <label className="comment-remember">
            <input type="checkbox" checked={session.remember} onChange={(e) => session.setRemember(e.target.checked)} />
            <span>{t("rememberMe")}</span>
          </label>
          <button type="button" className="comment-link-button" onClick={session.clearSession}>{t("changeIdentity")}</button>
          <button type="button" className="comment-secondary-button" onClick={handleResend} disabled={resendIn > 0 || session.otpStatus === "sending"}>
            {resendIn > 0 ? t("resendIn", { seconds: resendIn }) : t("resend")}
          </button>
        </div>
      </div>
    );
  }

  // 3) Verified — inline composer with @mention
  return (
    <form onSubmit={handleSubmit} className="comment-form comment-form--composer" noValidate>
      <div className="comment-composer-row">
        <div className={`comment-avatar comment-avatar--${session.name.slice(0, 1).charCodeAt(0) % 5}`} aria-hidden="true">
          {session.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="comment-composer-input-wrap">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            placeholder={t("contentPlaceholder")}
            rows={1}
            maxLength={2000}
            required
          />
          {mentionOpen && (
            <MentionPopup
              query={mentionQuery}
              candidates={allAuthors}
              onSelect={insertMention}
              onClose={() => setMentionOpen(false)}
            />
          )}
        </div>
        <button type="submit" className="comment-primary-button" disabled={addComment.isPending || !content.trim()}>
          {addComment.isPending ? t("publishing") : t("publish")}
        </button>
      </div>
      {feedback && <p className={`comment-feedback is-${feedback.tone}`}>{feedback.label}</p>}
    </form>
  );
}
