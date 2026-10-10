"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Clean zero-dependency Markdown parser component.
 * Renders headings, bold, italics, code blocks, inline code, lists, blockquotes, horizontal rules, links, and paragraphs.
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into block tokens
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`markdown-body space-y-3 text-xs font-sans leading-relaxed text-[var(--color-text-secondary)] ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1 key={idx} className="border-b border-[var(--color-surface-border)] pb-1 pt-2 text-base font-bold text-[var(--color-text)]">
                {renderInline(block.content)}
              </h1>
            );
          case "h2":
            return (
              <h2 key={idx} className="border-b border-[var(--color-surface-border)] pb-0.5 pt-2 text-sm font-bold text-[var(--color-text)]">
                {renderInline(block.content)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={idx} className="pt-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                {renderInline(block.content)}
              </h3>
            );
          case "h4":
            return (
              <h4 key={idx} className="text-xs font-semibold text-[var(--color-text)]">
                {renderInline(block.content)}
              </h4>
            );
          case "hr":
            return <hr key={idx} className="my-4 border-t border-[var(--color-surface-border)]" />;
          case "codeblock":
            return (
              <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-3.5 font-mono text-[11px] text-slate-100 shadow-inner">
                {block.language && (
                  <div className="mb-2 border-b border-slate-700 pb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    {block.language}
                  </div>
                )}
                <pre className="whitespace-pre">{block.content}</pre>
              </div>
            );
          case "blockquote":
            return (
              <blockquote key={idx} className="my-2 border-l-2 border-[var(--color-accent)] pl-3.5 italic text-[var(--color-muted)]">
                {renderInline(block.content)}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={idx} className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
                {block.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="ml-4 list-decimal space-y-1 text-[var(--color-text-secondary)]">
                {block.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );
          case "p":
          default:
            return (
              <p key={idx} className="leading-relaxed text-[var(--color-text-secondary)]">
                {renderInline(block.content)}
              </p>
            );
        }
      })}
    </div>
  );
}

type BlockToken =
  | { type: "h1" | "h2" | "h3" | "h4" | "p" | "blockquote"; content: string }
  | { type: "hr" }
  | { type: "codeblock"; content: string; language: string }
  | { type: "ul" | "ol"; items: string[] };

function parseMarkdownBlocks(text: string): BlockToken[] {
  const lines = text.split(/\r?\n/);
  const blocks: BlockToken[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().replace(/^```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: "codeblock",
        language: lang,
        content: codeLines.join("\n"),
      });
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule --- or ***
    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", content: trimmed.replace(/^#\s+/, "") });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", content: trimmed.replace(/^##\s+/, "") });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", content: trimmed.replace(/^###\s+/, "") });
      i++;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "h4", content: trimmed.replace(/^####\s+/, "") });
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      blocks.push({ type: "blockquote", content: trimmed.replace(/^>\s+/, "") });
      i++;
      continue;
    }

    // Unordered List (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered List (1. 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph (accumulate continuous text)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("> ") &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(---|\*\*\*|___)$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", content: pLines.join(" ") });
  }

  return blocks;
}

/**
 * Parses inline elements: **bold**, *italics*, `code`, and [link](url)
 */
function renderInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex to match inline code, bold, italics, links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Inline Code `text`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={idx} className="bg-stone-100 border border-stone-200/80 rounded px-1.5 py-0.5 font-mono text-[11px] text-stone-900">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-stone-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic text-stone-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Link [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline underline-offset-2 hover:opacity-80"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}
