"use client";

/**
 * Indicateur "l'assistant réfléchit" — 3 points animés.
 * Affiché entre l'envoi du message user et l'arrivée de la réponse.
 */
export function AssistantTyping() {
  return (
    <div className="assistant-typing" aria-live="polite" role="status">
      <span className="assistant-typing-dot" />
      <span className="assistant-typing-dot" />
      <span className="assistant-typing-dot" />
    </div>
  );
}
