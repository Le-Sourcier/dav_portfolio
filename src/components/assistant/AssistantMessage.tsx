"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/lib/routing/localizedPath";
import { AssistantMarkdown } from "./AssistantMarkdown";
import { OtpInput } from "./OtpInput";
import type { AssistantMessage as AssistantMessageType } from "@/types/assistant.types";

interface AssistantMessageProps {
  message: AssistantMessageType;
  onOtpSubmit?: (code: string) => void;
}

const OTP_REQUIRED_RE = /\[OTP_REQUIRED:([^\]]+)\]/;

const StreamingCursor = () => (
  <span className="assistant-cursor" aria-hidden="true" />
);

export function AssistantMessage({
  message,
  onOtpSubmit,
}: AssistantMessageProps) {
  const t = useTranslations("Assistant");
  const locale = useLocale();
  const isUser = message.role === "user";
  const raw = message.displayContent ?? message.content;

  const otpMatch = !isUser ? raw.match(OTP_REQUIRED_RE) : null;
  const otpEmail = otpMatch?.[1] || null;
  const text = otpEmail ? raw.replace(OTP_REQUIRED_RE, "").trim() : raw;

  return (
    <div className={`assistant-message is-${message.role}`}>
      <div className="assistant-message-bubble">
        {isUser ? <p>{text}</p> : <AssistantMarkdown content={text} />}
        {message.isStreaming ? <StreamingCursor /> : null}
        {otpEmail && !message.isStreaming && onOtpSubmit ? (
          <OtpInput
            email={otpEmail}
            onComplete={onOtpSubmit}
            disabled={false}
          />
        ) : null}
        {!isUser && !message.isStreaming && !otpEmail
          ? renderTypeActions(message, t, locale)
          : null}
      </div>
    </div>
  );
}

function renderTypeActions(
  message: AssistantMessageType,
  t: ReturnType<typeof useTranslations>,
  locale: string,
) {
  const { type, metadata } = message;
  if (!metadata) return null;

  if (type === "project_link" && metadata.projectId) {
    return (
      <div className="assistant-message-actions">
        <Link href={localizedPath("/projects", locale)} className="assistant-action-chip">
          {t("seeAllProjects")}
        </Link>
      </div>
    );
  }

  if (type === "experience_link" && metadata.experienceId) {
    return (
      <div className="assistant-message-actions">
        <Link href={localizedPath("/experiences", locale)} className="assistant-action-chip">
          {t("seeJourney")}
        </Link>
      </div>
    );
  }

  if (type === "blog_link" && metadata.posts?.length) {
    return (
      <div className="assistant-message-actions assistant-message-actions--column">
        {metadata.posts.map((post) =>
          post.slug ? (
            <Link
              key={post.id}
              href={localizedPath(`/blog/${post.slug}`, locale)}
              className="assistant-action-chip">
              {post.title}
            </Link>
          ) : null,
        )}
      </div>
    );
  }

  if (type === "contact_form") {
    return (
      <div className="assistant-message-actions">
        <Link href={localizedPath("/#contact", locale)} className="assistant-action-chip">
          {t("openContact")}
        </Link>
      </div>
    );
  }

  return null;
}
