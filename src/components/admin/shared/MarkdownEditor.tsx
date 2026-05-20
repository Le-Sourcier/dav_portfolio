import { useState, useRef, useCallback } from 'react';
import {
  Bold, Italic, Heading1, Heading2, Heading3, Code, CodeSquare,
  Image, Link2, List, ListOrdered, Quote, Minus, Table,
  Eye, EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

// ======================== TYPES ========================

type InsertFn = (before: string, after?: string, placeholder?: string) => void;

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  action: (insert: InsertFn) => void;
  separator?: boolean;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

// ======================== TOOLBAR CONFIG ========================

const toolbarActions: ToolbarAction[] = [
  { icon: Bold, label: 'Gras (Ctrl+B)', action: (ins) => ins('**', '**', 'texte en gras') },
  { icon: Italic, label: 'Italique (Ctrl+I)', action: (ins) => ins('*', '*', 'texte en italique') },
  { icon: Heading1, label: 'Titre 1', action: (ins) => ins('\n# ', '', 'Titre') },
  { icon: Heading2, label: 'Titre 2', action: (ins) => ins('\n## ', '', 'Sous-titre') },
  { icon: Heading3, label: 'Titre 3', action: (ins) => ins('\n### ', '', 'Section') },
  { icon: Quote, label: 'Citation', action: (ins) => ins('\n> ', '', 'Citation...'), separator: true },
  { icon: Code, label: 'Code inline `code`', action: (ins) => ins('`', '`', 'code') },
  {
    icon: CodeSquare, label: 'Bloc de code ```', action: (ins) => ins(
      '\n\n```javascript\n', '\n```\n\n', '// Votre code ici\nconsole.log("Hello World");'
    ),
  },
  { icon: Image, label: 'Image', action: (ins) => ins('\n![', '](https://url-de-image.com)\n', 'description'), separator: true },
  { icon: Link2, label: 'Lien', action: (ins) => ins('[', '](https://)', 'texte du lien') },
  { icon: List, label: 'Liste', action: (ins) => ins('\n- ', '', 'Element') },
  { icon: ListOrdered, label: 'Liste numerotee', action: (ins) => ins('\n1. ', '', 'Element') },
  { icon: Minus, label: 'Separateur', action: (ins) => ins('\n\n---\n\n', '', ''), separator: true },
  {
    icon: Table, label: 'Tableau', action: (ins) => ins(
      '\n\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|----------|\n| ', ' | | |\n\n', 'donnee'
    ),
  },
];

// ======================== COMPONENT ========================

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Ecrivez en Markdown...',
  minHeight = '300px',
  label,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown: InsertFn = useCallback((before, after = '', ph = '') => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selectedText = ta.value.substring(start, end);
    const textToInsert = selectedText || ph;
    const newValue = ta.value.substring(0, start) + before + textToInsert + after + ta.value.substring(end);

    onChange(newValue);

    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = start + before.length + textToInsert.length;
      ta.setSelectionRange(
        selectedText ? cursorPos + after.length : start + before.length,
        selectedText ? cursorPos + after.length : start + before.length + textToInsert.length
      );
    });
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': e.preventDefault(); insertMarkdown('**', '**', 'texte en gras'); break;
        case 'i': e.preventDefault(); insertMarkdown('*', '*', 'texte en italique'); break;
        case 'k': e.preventDefault(); insertMarkdown('[', '](https://)', 'texte du lien'); break;
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      insertMarkdown('  ', '', '');
    }
  };

  const wordCount = value.split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-card/85 rounded-xl border border-border/70 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/70">
        {label && <span className="text-[11px] font-medium text-zinc-400">{label}</span>}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              'h-7 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-colors',
              showPreview
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? 'Editeur' : 'Apercu'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {!showPreview && (
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border/70 overflow-x-auto">
          {toolbarActions.map((action, i) => {
            const isCodeInline = action.label.includes('inline');
            const isCodeBlock = action.label.includes('```');

            return (
              <div key={i} className="flex items-center">
                {action.separator && i > 0 && (
                  <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                )}
                <button
                  onClick={() => action.action(insertMarkdown)}
                  title={action.label}
                  className={`flex items-center gap-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                    isCodeInline || isCodeBlock ? 'px-2 py-1' : 'p-1.5'
                  }`}
                >
                  <action.icon className="w-4 h-4" />
                  {isCodeInline && <span className="text-[10px] font-mono">{"`"}</span>}
                  {isCodeBlock && <span className="text-[10px] font-mono">{"```"}</span>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
      {showPreview ? (
        <div className="p-6" style={{ minHeight }}>
          <MarkdownRenderer content={value} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-4 bg-transparent text-sm font-mono text-foreground resize-y outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 leading-relaxed"
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/70 bg-zinc-50/50 bg-card/85">
        <div className="flex items-center gap-4 text-[10px] text-zinc-400">
          <span>{wordCount} mots</span>
          <span>Markdown</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <kbd className="font-mono border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5">Ctrl+B</kbd>
          <span>Gras</span>
          <kbd className="font-mono border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5">Ctrl+I</kbd>
          <span>Italique</span>
        </div>
      </div>
    </div>
  );
}
