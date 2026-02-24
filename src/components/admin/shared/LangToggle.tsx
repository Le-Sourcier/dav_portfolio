interface LangToggleProps {
  lang: 'fr' | 'en';
  onChange: (lang: 'fr' | 'en') => void;
  hasEnContent?: boolean;
}

export function LangToggle({ lang, onChange, hasEnContent }: LangToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl border border-border w-fit">
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`relative px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            lang === l
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l}
          {l === 'en' && !hasEnContent && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-background" />
          )}
        </button>
      ))}
    </div>
  );
}
