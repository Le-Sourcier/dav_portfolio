import { Loader2, RefreshCw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslationPanelProps {
  instructions: string;
  isPending: boolean;
  disabled?: boolean;
  onInstructionsChange: (value: string) => void;
  onTranslateMissing: () => void;
  onTranslateAll: () => void;
}

export function TranslationPanel({
  instructions,
  isPending,
  disabled,
  onInstructionsChange,
  onTranslateMissing,
  onTranslateAll,
}: TranslationPanelProps) {
  return (
    <div className="bg-card/60 rounded-xl border border-border/70 p-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-500">
          Traduction assistee
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Genere une version EN modifiable. Les champs existants ne sont remplaces que si vous le demandez.
        </p>
      </div>

      <textarea
        value={instructions}
        onChange={(event) => onInstructionsChange(event.target.value)}
        rows={3}
        placeholder="Consignes optionnelles : ton plus direct, garder certains termes, preferer US English..."
        className="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/55 focus:border-amber-400/70"
      />

      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={onTranslateMissing}
          disabled={disabled || isPending}
          className={cn(
            "h-8 rounded-lg bg-amber-400 text-zinc-950 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60",
            "hover:bg-amber-300",
          )}
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
          Completer les champs vides
        </button>
        <button
          type="button"
          onClick={onTranslateAll}
          disabled={disabled || isPending}
          className="h-8 rounded-lg border border-border/70 bg-transparent text-[11px] font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors hover:bg-muted/40 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Retraduire tout
        </button>
      </div>
    </div>
  );
}

export default TranslationPanel;
