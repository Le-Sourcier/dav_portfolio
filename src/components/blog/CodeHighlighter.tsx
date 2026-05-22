"use client";

import { useCallback, useMemo, useState } from "react";

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

const wrap = (color: string, italic = false) =>
  italic
    ? `<span style="color:${color};font-style:italic">$1</span>`
    : `<span style="color:${color}">$1</span>`;

function highlightCode(rawCode: string, lang: string): string {
  let src = escapeHtml(rawCode);

  // 1) Block comments
  src = src.replace(/(\/\*[\s\S]*?\*\/)/g, wrap(THEME.comment, true));

  // 2) Line comments
  if (["python", "bash", "yaml"].includes(lang)) {
    src = src.replace(/(#[^\n]*)/g, wrap(THEME.comment, true));
  }
  src = src.replace(/(\/\/[^\n]*)/g, wrap(THEME.comment, true));

  // 3) Strings (template, double, single — quotes are already HTML-escaped)
  src = src.replace(/(`(?:\\.|[^`\\])*`)/g, wrap(THEME.string));
  src = src.replace(/(&quot;(?:\\.|(?!&quot;).)*&quot;)/g, wrap(THEME.string));
  src = src.replace(/(&#39;(?:\\.|(?!&#39;).)*&#39;)/g, wrap(THEME.string));

  // 4) Decorators
  src = src.replace(/@([A-Za-z_][\w]*)/g, `<span style="color:${THEME.decorator}">@$1</span>`);

  // 5) Numbers
  src = src.replace(
    /\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
    wrap(THEME.number),
  );

  // 6) Keywords
  const keywords = pickKeywords(lang);
  if (keywords.length > 0) {
    const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    src = src.replace(keywordRegex, wrap(THEME.keyword));
  }

  // 7) CSS at-rules / hex colors / properties
  if (lang === "css" || lang === "scss") {
    const atRegex = new RegExp(`(${CSS_AT_RULES.join("|")})\\b`, "g");
    src = src.replace(atRegex, wrap(THEME.keyword));
    src = src.replace(/(#[0-9a-fA-F]{3,8})\b/g, wrap(THEME.number));
    src = src.replace(
      /^(\s*)([\w-]+)(\s*:\s*)/gm,
      `$1<span style="color:${THEME.property}">$2</span>$3`,
    );
  }

  // 8) Built-in types (JS/TS family)
  if (["javascript", "typescript", "tsx", "jsx"].includes(lang)) {
    const typeRegex = new RegExp(`\\b(${BUILTIN_TYPES.join("|")})\\b`, "g");
    src = src.replace(typeRegex, wrap(THEME.type));
  }

  // 9) Built-in globals / constants
  const globalRegex = new RegExp(`\\b(${BUILTIN_GLOBALS.join("|")})\\b`, "g");
  src = src.replace(globalRegex, wrap(THEME.variable));

  // 10) Function calls
  src = src.replace(
    /\b([A-Za-z_$][\w$]*)\s*(?=\()/g,
    wrap(THEME.function),
  );

  // 11) Property access
  src = src.replace(
    /\.([A-Za-z_$][\w$]*)/g,
    `.<span style="color:${THEME.property}">$1</span>`,
  );

  // 12) Operators
  src = src.replace(
    /(=&gt;|===|!==|==|!=|&lt;=|&gt;=|&amp;&amp;|\|\||\.\.\.|\?\?|\?\.)/g,
    wrap(THEME.operator),
  );

  // 13) HTML / JSX tags & attributes
  if (["html", "jsx", "tsx"].includes(lang)) {
    src = src.replace(
      /(&lt;\/?)([A-Za-z][\w-]*)/g,
      `$1<span style="color:${THEME.tag}">$2</span>`,
    );
    src = src.replace(
      /\b([A-Za-z_][\w-]*)(=)/g,
      `<span style="color:${THEME.attribute}">$1</span>$2`,
    );
  }

  return src;
}

export function CodeHighlighter({ code, language = "text", filename }: CodeHighlighterProps) {
  const [copied, setCopied] = useState(false);
  const lang = normalizeLanguage(language);
  const label = languageLabels[lang] ?? languageLabels[language] ?? language.toUpperCase();
  const trimmed = useMemo(() => code.replace(/\n$/, ""), [code]);
  const highlightedLines = useMemo(
    () => highlightCode(trimmed, lang).split("\n"),
    [trimmed, lang],
  );

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
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <div className="code-highlighter-body">
        <table>
          <tbody>
            {highlightedLines.map((line, index) => (
              <tr key={`${index}-${line.length}`}>
                <td>{index + 1}</td>
                <td dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
