/**
 * Streame un texte caractère par caractère avec un setter React.
 *
 * Cadence adaptative — plus le texte est long, plus on accélère pour éviter
 * une attente interminable. Retourne une fonction d'annulation (utilisée si
 * le composant est démonté ou si un nouveau stream commence).
 */

interface StreamOptions {
  text: string;
  onChunk: (partial: string) => void;
  onDone?: () => void;
  /** Tokens par seconde — accéléré pour les longs textes. */
  baseSpeed?: number;
}

export const streamText = ({ text, onChunk, onDone, baseSpeed = 80 }: StreamOptions): (() => void) => {
  if (!text) {
    onChunk("");
    onDone?.();
    return () => {};
  }

  // Accélère pour les longs textes : un message de 800 chars stream en ~5s max
  const adaptiveSpeed = Math.max(baseSpeed, Math.floor(text.length / 8));
  const intervalMs = Math.max(8, Math.floor(1000 / adaptiveSpeed));

  let index = 0;
  let cancelled = false;
  const tick = () => {
    if (cancelled) return;
    // Saute par paquets de 1-3 chars pour rester fluide même sur mobile
    const step = Math.min(text.length - index, 1 + Math.floor(Math.random() * 3));
    index += step;
    onChunk(text.slice(0, index));
    if (index >= text.length) {
      onDone?.();
      return;
    }
    timer = setTimeout(tick, intervalMs);
  };

  let timer: ReturnType<typeof setTimeout> = setTimeout(tick, intervalMs);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
};
