"use client";

/**
 * Liste scrollable des messages avec auto-scroll bas + bouton remontée.
 *
 * Stratégie :
 *  - "stickToBottom" : tant que l'utilisateur reste près du bas, on suit
 *    automatiquement chaque nouveau chunk de streaming. Dès qu'il scroll
 *    vers le haut, on coupe le suivi et on affiche le bouton de retour.
 *  - On capture la position *avant* le rendu via useLayoutEffect (sinon
 *    le contenu a déjà grandi et on s'auto-disqualifie).
 *  - On scroll *après* paint via requestAnimationFrame (sinon scrollHeight
 *    n'a pas encore intégré le nouveau contenu).
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AssistantMessage } from "./AssistantMessage";
import { AssistantTyping } from "./AssistantTyping";
import type { AssistantMessage as AssistantMessageType } from "@/types/assistant.types";

interface AssistantMessagesProps {
  messages: AssistantMessageType[];
  isTyping: boolean;
  onOtpSubmit: (code: string) => void;
}

const NEAR_BOTTOM_THRESHOLD_PX = 80;

export function AssistantMessages({ messages, isTyping, onOtpSubmit }: AssistantMessagesProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const lastMessageCountRef = useRef(messages.length);
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

  // Capture l'intention de stick AVANT que le DOM ne soit muté avec le nouveau chunk.
  // useLayoutEffect court synchroniquement après les mutations DOM mais avant le paint :
  // c'est le bon endroit pour lire scrollHeight/scrollTop et décider, puis scroller.
  useLayoutEffect(() => {
    const isNewMessage = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (!stickToBottomRef.current && !isNewMessage) return;

    // Si c'est un nouveau message (pas un chunk de streaming), on force le stick
    // pour suivre la réponse qui arrive, sauf si l'utilisateur a scrollé loin.
    if (isNewMessage && isNearBottom()) {
      stickToBottomRef.current = true;
    }

    if (stickToBottomRef.current) {
      // Deux RAF : le premier laisse React commit, le second laisse le browser
      // calculer le nouveau scrollHeight (utile quand des images/markdown sizent).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToBottom(false));
      });
      setShowJumpButton(false);
    }
  }, [messages, isTyping]);

  // L'utilisateur scroll manuellement : on désactive le stick s'il s'éloigne du bas.
  const handleScroll = () => {
    const near = isNearBottom();
    stickToBottomRef.current = near;
    setShowJumpButton(!near);
  };

  // Scroll initial à l'ouverture du panneau
  useEffect(() => {
    scrollToBottom(false);
    stickToBottomRef.current = true;
  }, []);

  const handleJump = () => {
    stickToBottomRef.current = true;
    scrollToBottom(true);
    setShowJumpButton(false);
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
          <AssistantMessage key={message.id} message={message} onOtpSubmit={onOtpSubmit} />
        ))}
        {isTyping ? <AssistantTyping /> : null}
      </div>

      {showJumpButton ? (
        <button
          type="button"
          className="assistant-jump-bottom"
          onClick={handleJump}
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
