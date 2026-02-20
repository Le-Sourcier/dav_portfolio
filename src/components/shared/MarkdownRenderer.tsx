import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { CodeHighlighter } from '../portfolio/CodeHighlighter';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// ======================== TYPES ========================

interface ParsedBlock {
  type: 'code' | 'html';
  content: string;
  language?: string;
}

// ======================== PARSER ========================

/**
 * Parse markdown content into blocks of code and html.
 * Handles:
 * - ```lang\ncode\n```  (standard fenced code block)
 * - ```lang code```     (single line fenced)
 * - `lang\ncode`        (backtick with newline = treated as code block)
 * - `inline code`       (single backtick inline = rendered as <code>)
 * - Legacy HTML content (<pre><code>)
 */
function parseContent(raw: string): ParsedBlock[] {
  if (!raw || !raw.trim()) return [];

  // Detect legacy HTML
  const trimmed = raw.trim();
  if (trimmed.startsWith('<') && /<(div|p|h[1-6]|ul|ol|pre|section|article|span)\b/i.test(trimmed)) {
    return parseHtmlContent(raw);
  }

  const blocks: ParsedBlock[] = [];

  // Match ALL code block patterns:
  // 1. Triple backtick: ```lang\ncode\n``` OR ```lang\ncode```
  // 2. Triple backtick single line: ```code```
  // 3. Single backtick multiline: `lang\ncode` (has a newline inside)
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```|```(\w*)\s+([\s\S]*?)```|`(\w+)\n([\s\S]*?)`/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    // Text before this code block
    const before = raw.slice(lastIndex, match.index);
    if (before.trim()) {
      blocks.push({ type: 'html', content: markdownToHtml(before) });
    }

    // Determine which capture group matched
    let lang: string;
    let code: string;

    if (match[1] !== undefined && match[2] !== undefined) {
      // Pattern 1: ```lang\ncode\n```
      lang = match[1] || 'text';
      code = match[2];
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // Pattern 2: ```lang code```
      lang = match[3] || 'text';
      code = match[4];
    } else if (match[5] !== undefined && match[6] !== undefined) {
      // Pattern 3: `lang\ncode` (single backtick multiline)
      lang = match[5] || 'text';
      code = match[6];
    } else {
      continue;
    }

    // Normalize language aliases
    lang = normalizeLanguage(lang);

    blocks.push({
      type: 'code',
      content: code.trim(),
      language: lang,
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Remaining text
  const after = raw.slice(lastIndex);
  if (after.trim()) {
    blocks.push({ type: 'html', content: markdownToHtml(after) });
  }

  return blocks;
}

function normalizeLanguage(lang: string): string {
  const map: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    sh: 'bash',
    yml: 'yaml',
    md: 'markdown',
    // Case insensitive common ones
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    bash: 'bash',
    css: 'css',
    html: 'html',
    json: 'json',
    sql: 'sql',
    rust: 'rust',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    jsx: 'jsx',
    tsx: 'tsx',
    scss: 'scss',
    yaml: 'yaml',
    text: 'text',
  };
  return map[lang.toLowerCase()] || lang.toLowerCase() || 'text';
}

// ======================== MARKDOWN -> HTML ========================

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markdownToHtml(md: string): string {
  let html = md
    // Inline code (single backtick, NO newline inside)
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure><img src="$2" alt="$1" /><figcaption>$1</figcaption></figure>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ul">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ol">$1</li>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (line) => {
      if (line.match(/^\|[\s-:|]+\|$/)) return '';
      const cells = line.split('|').filter(Boolean).map((c) => c.trim());
      return '<tr>' + cells.map((c) => `<td>${c}</td>`).join('') + '</tr>';
    });

  // Group list items
  html = html.replace(/((?:<li class="ul">[\s\S]*?<\/li>\s*)+)/g, '<ul>$1</ul>');
  html = html.replace(/((?:<li class="ol">[\s\S]*?<\/li>\s*)+)/g, '<ol>$1</ol>');
  html = html.replace(/ class="ul"/g, '').replace(/ class="ol"/g, '');

  // Group blockquotes
  html = html.replace(/((?:<blockquote>[\s\S]*?<\/blockquote>\s*)+)/g, (match) => {
    const inner = match.replace(/<\/?blockquote>/g, '').trim();
    return `<blockquote>${inner}</blockquote>`;
  });

  // Group table rows
  html = html.replace(/((?:<tr>[\s\S]*?<\/tr>\s*)+)/g, '<table>$1</table>');

  // Paragraphs
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/(?<!>)\n(?!<)/g, '<br />');

  // Wrap in paragraph if needed
  if (!/^\s*<(h[1-6]|ul|ol|blockquote|hr|table|figure|div|p)/.test(html)) {
    html = `<p>${html}</p>`;
  }

  // Clean empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  // Remove empty figcaptions
  html = html.replace(/<figcaption><\/figcaption>/g, '');

  // Sanitize to prevent XSS
  return DOMPurify.sanitize(html);
}

// ======================== LEGACY HTML PARSING ========================

function parseHtmlContent(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const regex = /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    if (before.trim()) {
      blocks.push({ type: 'html', content: DOMPurify.sanitize(before) });
    }
    blocks.push({
      type: 'code',
      content: match[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
      language: match[1] || 'text',
    });
    lastIndex = regex.lastIndex;
  }

  const after = html.slice(lastIndex);
  if (after.trim()) {
    blocks.push({ type: 'html', content: DOMPurify.sanitize(after) });
  }

  return blocks;
}

// ======================== COMPONENT ========================

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = useMemo(() => parseContent(content), [content]);

  if (blocks.length === 0) {
    return <p className="text-muted-foreground italic">Aucun contenu</p>;
  }

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.type === 'code') {
          return (
            <CodeHighlighter
              key={i}
              code={block.content}
              language={block.language || 'text'}
            />
          );
        }

        return (
          <div
            key={i}
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      })}
    </div>
  );
}
