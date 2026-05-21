import React, { isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { CodeHighlighter } from "@/components/blog/CodeHighlighter";
import { envConfig } from "@/config/env";
import { sectionId } from "@/utils/sectionId";

type MarkdownContentProps = {
  content: string;
};

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textFromChildren((children as { props?: { children?: React.ReactNode } }).props?.children);
  }
  return "";
}

function codeLanguage(className?: string): string {
  return className?.replace("language-", "").trim() || "text";
}

function mediaUrl(src?: unknown): string {
  if (typeof src !== "string") return "";
  if (!src) return "";
  try {
    const parsed = new URL(src);
    if (parsed.hostname === "resource.yao.media") return "/blog/figure-flow.svg";
  } catch {
    // Relative URLs are handled below.
  }
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith("/uploads") || src.startsWith("/storage")) {
    return `${envConfig.apiUrl.replace(/\/api\/?$/, "")}${src}`;
  }
  if (src.startsWith("uploads/") || src.startsWith("storage/")) {
    return `${envConfig.apiUrl.replace(/\/api\/?$/, "")}/${src}`;
  }
  return src;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => {
            const text = textFromChildren(children);
            return <h2 id={sectionId(text)}>{children}</h2>;
          },
          h2: ({ children }) => {
            const text = textFromChildren(children);
            return <h2 id={sectionId(text)}>{children}</h2>;
          },
          h3: ({ children }) => {
            const text = textFromChildren(children);
            return <h3 id={sectionId(text)}>{children}</h3>;
          },
          h4: ({ children }) => {
            const text = textFromChildren(children);
            return <h4 id={sectionId(text)}>{children}</h4>;
          },
          h5: ({ children }) => {
            const text = textFromChildren(children);
            return <h5 id={sectionId(text)}>{children}</h5>;
          },
          h6: ({ children }) => {
            const text = textFromChildren(children);
            return <h6 id={sectionId(text)}>{children}</h6>;
          },
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <span className="markdown-image-frame">
              <img src={mediaUrl(src)} alt={alt ?? ""} loading="lazy" />
              {alt ? <span className="markdown-image-caption">{alt}</span> : null}
            </span>
          ),
          pre: ({ children }) => {
            const child = React.Children.toArray(children)[0];

            if (isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
              const className = child.props.className;
              const value = String(child.props.children ?? "");
              return <CodeHighlighter code={value} language={codeLanguage(className)} />;
            }

            return <pre>{children}</pre>;
          },
          code: ({ className, children }) => {
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
