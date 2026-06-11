"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "./Mermaid";

/**
 * Renders markdown as rich text. Fenced ```mermaid blocks become diagrams.
 * Used for entry narratives, decision-log fields, project/weekly descriptions.
 */
export default function Markdown({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <div className="prose prose-base max-w-none text-justify [hyphens:auto] prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink-soft prose-li:text-ink-soft prose-strong:text-ink prose-a:text-ink prose-a:underline prose-a:underline-offset-2 prose-code:bg-ink/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-ink prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-paper-sunk prose-pre:text-ink prose-li:my-0.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-mermaid/.test(className ?? "");
            if (match) {
              return <Mermaid chart={String(children)} />;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
