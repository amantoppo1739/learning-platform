"use client";

import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./code-block";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// Memoized markdown components to avoid recreation
const markdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    return !inline && language ? (
      <CodeBlock
        language={language}
        value={String(children).replace(/\n$/, "")}
      />
    ) : (
      <code
        className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
  p({ children }: any) {
    return <p className="mb-4 last:mb-0 leading-7">{children}</p>;
  },
  ul({ children }: any) {
    return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>;
  },
  ol({ children }: any) {
    return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;
  },
  li({ children }: any) {
    return <li className="leading-7">{children}</li>;
  },
  h1({ children }: any) {
    return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
  },
  h2({ children }: any) {
    return <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>;
  },
  h3({ children }: any) {
    return <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>;
  },
  blockquote({ children }: any) {
    return (
      <blockquote className="border-l-4 border-zinc-700 pl-4 italic my-4 text-zinc-400">
        {children}
      </blockquote>
    );
  },
  a({ href, children }: any) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {children}
      </a>
    );
  },
};

// Simple streaming renderer - no parsing, just formatted text
function StreamingRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-7">
      {content}
    </div>
  );
}

// Full markdown renderer - only for completed messages
const FullMarkdownRenderer = memo(function FullMarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
});

export const MarkdownRenderer = memo(function MarkdownRenderer({ 
  content, 
  isStreaming = false 
}: MarkdownRendererProps) {
  // During streaming, show plain text (no expensive parsing)
  // After streaming, show full markdown
  if (isStreaming) {
    return <StreamingRenderer content={content} />;
  }
  
  return <FullMarkdownRenderer content={content} />;
});
