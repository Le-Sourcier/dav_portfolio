"use client";

/**
 * Bulle de message dans le chat assistant.
 *
 * Selon `type`, on rend des actions inline :
 *  - project_link / experience_link → CTA vers la page détail
 *  - blog_link → liste d'articles cliquables
 *  - contact_form → lien direct vers la section #contact
 *  - text → bulle simple
 */
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AssistantMarkdown } from "./AssistantMarkdown";
import type { AssistantMessage as AssistantMessageType } from "@/types/assistant.types";

interface AssistantMessageProps {
  message: AssistantMessageType;
}

const StreamingCursor = () => <span className="assistant-cursor" aria-hidden="true" />;

export function AssistantMessage({ message }: AssistantMessageProps) {
  const t = useTranslations("Assistant");
  const isUser = message.role === "user";
  const text = message.displayContent ?? message.content;

  return (
    <div className={`assistant-message is-${message.role}`}>
      <div className="assistant-message-bubble">
        {isUser ? <p>{text}</p> : <AssistantMarkdown content={text} />}
        {message.isStreaming ? <StreamingCursor /> : null}
        {!isUser && !message.isStreaming ? renderTypeActions(message, t) : null}
      </div>
    </div>
  );
}

function renderTypeActions(
  message: AssistantMessageType,
  t: ReturnType<typeof useTranslations>,
) {
  const { type, metadata } = message;
  if (!metadata) return null;

  if (type === "project_link" && metadata.projectId) {
    return (
      <div className="assistant-message-actions">
        <Link href="/projets" className="assistant-action-chip">
          {t("seeAllProjects")}
        </Link>
      </div>
    );
  }

  if (type === "experience_link" && metadata.experienceId) {
    return (
      <div className="assistant-message-actions">
        <Link href="/experiences" className="assistant-action-chip">
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
              href={`/blog/${post.slug}`}
              className="assistant-action-chip"
            >
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
        <Link href="/#contact" className="assistant-action-chip">
          {t("openContact")}
        </Link>
      </div>
    );
  }

  return null;
}
