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
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-sky-400 prose-code:rounded prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-black/40 prose-li:my-0.5">
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
