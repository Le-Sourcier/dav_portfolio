"use client";

/**
 * Rendu markdown minimaliste pour les bulles d'assistant.
 *
 * On reste léger (pas de CodeHighlighter, pas de GFM tables) : un message
 * d'assistant a besoin de **gras**, *italique*, listes, liens et code inline,
 * pas plus. Les liens externes ouvrent dans un nouvel onglet.
 */
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface AssistantMarkdownProps {
  content: string;
}

const isExternal = (href?: string) =>
  Boolean(href && /^https?:\/\//i.test(href));

export function AssistantMarkdown({ content }: AssistantMarkdownProps) {
  return (
    <div className="assistant-markdown">
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target={isExternal(href) ? "_blank" : undefined}
              rel={isExternal(href) ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children }) => <code className="assistant-inline-code">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
