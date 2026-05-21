"use client";

import { useCallback, useMemo, useState } from "react";

type CodeHighlighterProps = {
  code: string;
  language?: string;
};

const languageLabels: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  sh: "Shell",
  bash: "Bash",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
  text: "Code",
};

function normalizeLanguage(language = "text") {
  const normalized = language.toLowerCase().trim();
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "bash",
    yml: "yaml",
    md: "markdown",
  };
  return aliases[normalized] ?? normalized;
}

export function CodeHighlighter({ code, language = "text" }: CodeHighlighterProps) {
  const [copied, setCopied] = useState(false);
  const lang = normalizeLanguage(language);
  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);
  const label = languageLabels[lang] ?? languageLabels[language] ?? language.toUpperCase();

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code.trim()).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }, [code]);

  return (
    <div className="code-highlighter">
      <div className="code-highlighter-head">
        <div className="code-highlighter-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>{label}</strong>
        <button type="button" onClick={copyCode}>
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <div className="code-highlighter-body">
        <table>
          <tbody>
            {lines.map((line, index) => (
              <tr key={`${index}-${line}`}>
                <td>{index + 1}</td>
                <td>{line || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
