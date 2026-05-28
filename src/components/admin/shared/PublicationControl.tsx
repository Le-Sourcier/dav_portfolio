import { CalendarClock, Eye, EyeOff, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type PublicationControlProps = {
  published?: boolean;
  publishedAt?: string | null;
  newsletterSentAt?: string | null;
  onPublishedChange: (published: boolean) => void;
  onPublishedAtChange: (publishedAt: string | null) => void;
};

function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function PublicationControl({
  published = false,
  publishedAt,
  newsletterSentAt,
  onPublishedChange,
  onPublishedAtChange,
}: PublicationControlProps) {
  const scheduled = published && publishedAt && new Date(publishedAt).getTime() > Date.now();
  const statusLabel = !published ? "Brouillon" : scheduled ? "Programmé" : "Publié";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="inline-flex h-9 items-center rounded-full border border-border/70 bg-card/55 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => {
            onPublishedChange(false);
            onPublishedAtChange(null);
          }}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors",
            !published ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <EyeOff className="h-3.5 w-3.5" />
          Draft
        </button>
        <button
          type="button"
          onClick={() => {
            onPublishedChange(true);
            onPublishedAtChange(null);
          }}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors",
            published && !scheduled ? "bg-amber-300 text-zinc-950" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Eye className="h-3.5 w-3.5" />
          Live
        </button>
      </div>

      <label className="group inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-card/55 px-3 text-[11px] font-semibold text-muted-foreground transition-colors focus-within:border-amber-300/80">
        <CalendarClock className="h-3.5 w-3.5 text-amber-300" />
        <span className="hidden sm:inline">{statusLabel}</span>
        <input
          type="datetime-local"
          value={toDatetimeLocal(publishedAt)}
          onChange={(event) => {
            onPublishedChange(true);
            onPublishedAtChange(fromDatetimeLocal(event.target.value));
          }}
          className="w-[150px] bg-transparent text-[11px] text-foreground outline-none [color-scheme:dark]"
        />
      </label>

      {newsletterSentAt ? (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 text-[11px] font-semibold text-emerald-300">
          <Send className="h-3.5 w-3.5" />
          Newsletter envoyée
        </span>
      ) : null}
    </div>
  );
}
