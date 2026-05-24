"use client";

/**
 * Liste scrollable des messages avec auto-scroll bas + bouton remontée.
 *
 * Stratégie auto-scroll : on ne scroll auto vers le bas que si l'utilisateur
 * était déjà près du bas (tolérance 40px). Sinon on l'avertit avec un bouton
 * "nouveau message" qui force le scroll au clic.
 */
import { useEffect, useRef, useState } from "react";
import { AssistantMessage } from "./AssistantMessage";
import { AssistantTyping } from "./AssistantTyping";
import type { AssistantMessage as AssistantMessageType } from "@/types/assistant.types";

interface AssistantMessagesProps {
  messages: AssistantMessageType[];
  isTyping: boolean;
}

const NEAR_BOTTOM_THRESHOLD_PX = 60;

export function AssistantMessages({ messages, isTyping }: AssistantMessagesProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const isNearBottom = (): boolean => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD_PX;
  };

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  // Auto-scroll quand un nouveau message arrive si on était près du bas
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
      setShowJumpButton(false);
    } else {
      setShowJumpButton(true);
    }
  }, [messages.length, isTyping]);

  // Pendant le streaming, on ne montre le bouton que si l'user a remonté
  useEffect(() => {
    const lastStreamed = messages[messages.length - 1];
    if (!lastStreamed?.isStreaming) return;
    if (isNearBottom()) scrollToBottom(false);
  }, [messages]);

  const handleScroll = () => {
    if (isNearBottom()) setShowJumpButton(false);
  };

  return (
    <div className="assistant-messages-wrap">
      <div
        className="assistant-messages"
        ref={scrollRef}
        onScroll={handleScroll}
        aria-live="polite"
      >
        {messages.map((message) => (
          <AssistantMessage key={message.id} message={message} />
        ))}
        {isTyping ? <AssistantTyping /> : null}
      </div>

      {showJumpButton ? (
        <button
          type="button"
          className="assistant-jump-bottom"
          onClick={() => {
            scrollToBottom();
            setShowJumpButton(false);
          }}
          aria-label="Aller au dernier message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 17 4 9h16Z" fill="currentColor" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
