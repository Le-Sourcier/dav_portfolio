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
  // Flag levé pendant un scroll programmatique pour empêcher handleScroll
  // de couper le stick (chaque scrollTo déclenche un événement scroll natif).
  const isProgrammaticRef = useRef(false);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const isNearBottom = (): boolean => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD_PX;
  };

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    isProgrammaticRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    // Relâche le flag après que l'événement scroll programmatique ait été dispatché.
    // 120ms couvre l'animation smooth la plus longue qu'on déclenche ici.
    window.setTimeout(() => {
      isProgrammaticRef.current = false;
    }, smooth ? 120 : 0);
  };

  // useLayoutEffect court après les mutations DOM mais avant le paint :
  // c'est le bon moment pour mesurer scrollHeight/scrollTop puis scroller.
  useLayoutEffect(() => {
    const isNewMessage = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (!stickToBottomRef.current && !isNewMessage) return;

    // Nouveau message : on réactive le stick si l'utilisateur n'est pas
    // parti loin en haut.
    if (isNewMessage && isNearBottom()) {
      stickToBottomRef.current = true;
    }

    if (stickToBottomRef.current) {
      // Double RAF : 1er laisse React commit, 2e laisse le browser layouter
      // (le markdown peut changer la hauteur après render).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToBottom(false));
      });
      setShowJumpButton(false);
    }
  }, [messages, isTyping]);

  // L'utilisateur scroll manuellement : on désactive le stick s'il s'éloigne du bas.
  // On ignore les events déclenchés par nos propres scrollTo programmatiques.
  const handleScroll = () => {
    if (isProgrammaticRef.current) return;
    const near = isNearBottom();
    stickToBottomRef.current = near;
    setShowJumpButton(!near);
  };

  // Scroll initial à l'ouverture du panneau (sans smooth, pour atterrir
  // directement en bas).
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
