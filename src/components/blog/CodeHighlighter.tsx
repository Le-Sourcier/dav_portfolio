"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type CodeHighlighterProps = {
  code: string;
  language?: string;
  filename?: string;
};

// One Dark Pro inspired palette — inline styles are intentional:
// regex-based highlighting re-scans the output, so a `class="..."` attribute
// would get re-tokenized (e.g. the `class` keyword). Using `style="..."`
// avoids that pitfall because `style` isn't in any keyword set.
const THEME = {
  comment: "#5c6370",
  string: "#98c379",
  number: "#d19a66",
  keyword: "#c678dd",
  function: "#61afef",
  variable: "#e06c75",
  type: "#e5c07b",
  operator: "#56b6c2",
  property: "#e06c75",
  tag: "#e06c75",
  attribute: "#d19a66",
  decorator: "#e5c07b",
};

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  js: "JavaScript",
  jsx: "JSX",
  typescript: "TypeScript",
  ts: "TypeScript",
  tsx: "TSX",
  python: "Python",
  py: "Python",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
  rust: "Rust",
  go: "Go",
  text: "Plain Text",
  "": "Code",
};

function normalizeLanguage(language = "text"): string {
  const normalized = language.toLowerCase().trim();
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
    md: "markdown",
  };
  return aliases[normalized] ?? normalized;
}

const JS_KEYWORDS = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
  "switch", "case", "break", "continue", "new", "delete", "typeof", "instanceof",
  "in", "of", "throw", "try", "catch", "finally", "import", "export", "default",
  "from", "as", "class", "extends", "super", "this", "yield", "async", "await",
  "static", "get", "set",
];

const TS_KEYWORDS = [
  ...JS_KEYWORDS,
  "interface", "type", "enum", "namespace", "declare", "implements", "abstract",
  "readonly", "keyof", "infer", "is", "asserts", "public", "private", "protected",
];

const PY_KEYWORDS = [
  "def", "class", "if", "elif", "else", "for", "while", "return", "import", "from",
  "as", "try", "except", "finally", "with", "yield", "lambda", "pass", "break",
  "continue", "raise", "and", "or", "not", "in", "is", "True", "False", "None",
  "self", "async", "await", "global", "nonlocal",
];

const BASH_KEYWORDS = [
  "if", "then", "else", "elif", "fi", "for", "do", "done", "while", "until",
  "case", "esac", "function", "return", "exit", "export", "source", "local",
  "echo", "cd", "ls", "mkdir", "rm", "cp", "mv", "cat", "grep", "awk", "sed",
  "chmod", "chown", "sudo", "apt", "npm", "yarn", "pnpm", "git", "docker", "curl", "wget",
];

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "JOIN", "LEFT", "RIGHT", "INNER",
  "OUTER", "ON", "AND", "OR", "NOT", "NULL", "AS", "ORDER", "BY", "GROUP",
  "HAVING", "LIMIT", "OFFSET", "DISTINCT", "COUNT", "SUM", "AVG", "MAX", "MIN",
];

const CSS_AT_RULES = [
  "@media", "@keyframes", "@import", "@font-face", "@charset", "@supports",
  "@page", "@property",
];

const BUILTIN_TYPES = [
  "string", "number", "boolean", "any", "void", "never", "unknown", "object",
  "Array", "Promise", "Record", "Partial", "Required", "Readonly", "Pick", "Omit",
  "Map", "Set", "Date", "Error", "RegExp",
];

const BUILTIN_GLOBALS = [
  "true", "false", "null", "undefined", "NaN", "Infinity",
  "console", "document", "window", "process", "module", "require", "globalThis",
];

function pickKeywords(lang: string): string[] {
  switch (lang) {
    case "javascript":
    case "jsx":
      return JS_KEYWORDS;
    case "typescript":
    case "tsx":
      return TS_KEYWORDS;
    case "python":
      return PY_KEYWORDS;
    case "bash":
      return BASH_KEYWORDS;
    case "sql":
      return SQL_KEYWORDS;
    case "json":
      return ["true", "false", "null"];
    default:
      return TS_KEYWORDS;
  }
}

const TOKEN_RE =
  /(\/\/[^\n]*|#[^\n]*|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|@[A-Za-z_]\w*|\b[A-Za-z_$][\w$]*\b|[.[\]{}()<>:=+\-*/%,;|&!?]+)/g;

function tokenColor(token: string, lang: string, nextToken?: string): { color?: string; italic?: boolean } {
  if (token.startsWith("//") || (["python", "bash", "yaml"].includes(lang) && token.startsWith("#"))) {
    return { color: THEME.comment, italic: true };
  }
  if (/^(`|"|')/.test(token)) return { color: THEME.string };
  if (/^\d/.test(token)) return { color: THEME.number };
  if (token.startsWith("@")) return { color: THEME.decorator };
  if (pickKeywords(lang).includes(token) || (lang === "sql" && pickKeywords(lang).includes(token.toUpperCase()))) {
    return { color: THEME.keyword };
  }
  if (["javascript", "typescript", "tsx", "jsx"].includes(lang) && BUILTIN_TYPES.includes(token)) {
    return { color: THEME.type };
  }
  if (BUILTIN_GLOBALS.includes(token)) return { color: THEME.variable };
  if (nextToken === "(") return { color: THEME.function };
  if (/^[.[\]{}()<>:=+\-*/%,;|&!?]+$/.test(token)) return { color: THEME.operator };
  return {};
}

function highlightLine(line: string, lang: string): ReactNode[] {
  const matches = Array.from(line.matchAll(TOKEN_RE));
  if (matches.length === 0) return [line || "\u00a0"];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(line.slice(cursor, start));

    const nextToken = matches[index + 1]?.[0];
    const style = tokenColor(token, lang, nextToken);
    nodes.push(
      style.color ? (
        <span key={`${start}-${token}`} style={{ color: style.color, fontStyle: style.italic ? "italic" : undefined }}>
          {token}
        </span>
      ) : (
        token
      ),
    );
    cursor = start + token.length;
  });

  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes.length ? nodes : ["\u00a0"];
}

export function CodeHighlighter({ code, language = "text", filename }: CodeHighlighterProps) {
  const t = useTranslations("CodeHighlighter");
  const [copied, setCopied] = useState(false);
  const lang = normalizeLanguage(language);
  const label = languageLabels[lang] ?? languageLabels[language] ?? language.toUpperCase();
  const trimmed = useMemo(() => code.replace(/\n$/, ""), [code]);
  const lines = useMemo(() => trimmed.split("\n"), [trimmed]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(trimmed).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }, [trimmed]);

  return (
    <div className="code-highlighter">
      <div className="code-highlighter-head">
        <div className="code-highlighter-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>{filename ?? label}</strong>
        <button type="button" onClick={copyCode}>
          {copied ? t("copiedButton") : t("copyButton")}
        </button>
      </div>
      <div className="code-highlighter-body">
        <table>
          <tbody>
            {lines.map((line, index) => (
              <tr key={`${index}-${line.length}`}>
                <td>{index + 1}</td>
                <td>{highlightLine(line, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
