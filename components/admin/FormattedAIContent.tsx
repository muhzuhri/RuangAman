'use client';

import React from 'react';

interface FormattedAIContentProps {
  content: string;
  className?: string;
}

// ─── Inline Formatting Parser (Handles **bold**, `code`, and *italic*) ──────

function parseInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Regex matches **bold**, `code`, or *italic*
  const tokenRegex = /(\*\*.*?\*\*|`.*?`|\*[^\*]+?\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    // 1. Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-stone-900 dark:text-white">
          {boldContent}
        </strong>
      );
    }

    // 2. Inline Code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-teal-50 dark:bg-stone-800 text-teal-800 dark:text-teal-300 font-mono text-[11px] border border-teal-200/70 dark:border-stone-700"
        >
          {codeContent}
        </code>
      );
    }

    // 3. Italic: *text* (excluding pure asterisks)
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 3 && !part.startsWith('**')) {
      const italicContent = part.slice(1, -1);
      return (
        <em key={index} className="italic text-stone-700 dark:text-stone-300">
          {italicContent}
        </em>
      );
    }

    // Normal text
    return part;
  });
}

// ─── Main Component: FormattedAIContent ─────────────────────────────────────

export default function FormattedAIContent({ content, className = '' }: FormattedAIContentProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim();

    // 1. Code Block Fence (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        elements.push(
          <div
            key={`code-${idx}`}
            className="my-3 p-3.5 rounded-xl bg-stone-900 text-emerald-300 font-mono text-xs overflow-x-auto border border-stone-800 leading-relaxed shadow-xs"
          >
            <pre>{codeBlockLines.join('\n')}</pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      return;
    }

    // 2. Horizontal Divider (--- or ***)
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <hr key={`hr-${idx}`} className="my-3.5 border-stone-200 dark:border-stone-700/80" />
      );
      return;
    }

    // 3. Headings: ##, ###, ####
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h4
          key={`h3-${idx}`}
          className="text-xs sm:text-sm font-extrabold text-teal-800 dark:text-teal-300 mt-4 mb-1.5 pt-2 pb-1 border-b border-teal-500/20 uppercase tracking-wide flex items-center gap-1.5"
        >
          {parseInlineFormatting(headingText)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      const headingText = trimmed.replace(/^####\s+/, '');
      elements.push(
        <h5
          key={`h4-${idx}`}
          className="text-xs font-bold text-stone-900 dark:text-white mt-3 mb-1"
        >
          {parseInlineFormatting(headingText)}
        </h5>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h3
          key={`h2-${idx}`}
          className="text-sm sm:text-base font-black text-teal-900 dark:text-teal-200 mt-4 mb-2 pb-1.5 border-b border-teal-500/30 tracking-tight"
        >
          {parseInlineFormatting(headingText)}
        </h3>
      );
      return;
    }

    // 4. Bulleted List (* or -)
    const bulletMatch = rawLine.match(/^(\s*)([\*\-])\s+(.*)$/);
    if (bulletMatch) {
      const indentLevel = Math.floor(bulletMatch[1].length / 2);
      const bulletContent = bulletMatch[3];

      elements.push(
        <div
          key={`bullet-${idx}`}
          style={{ paddingLeft: `${indentLevel * 14 + 4}px` }}
          className="flex items-start gap-2.5 my-1 text-xs leading-relaxed text-stone-800 dark:text-stone-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 mt-1.5 shrink-0" />
          <div className="flex-1">{parseInlineFormatting(bulletContent)}</div>
        </div>
      );
      return;
    }

    // 5. Numbered List (1., 2., 3.)
    const numberMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      const indentLevel = Math.floor(numberMatch[1].length / 2);
      const numberPrefix = numberMatch[2];
      const numberContent = numberMatch[3];

      elements.push(
        <div
          key={`num-${idx}`}
          style={{ paddingLeft: `${indentLevel * 14 + 4}px` }}
          className="flex items-start gap-2.5 my-1.5 text-xs leading-relaxed text-stone-800 dark:text-stone-200"
        >
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400 shrink-0 text-[11px] min-w-[18px]">
            {numberPrefix}.
          </span>
          <div className="flex-1">{parseInlineFormatting(numberContent)}</div>
        </div>
      );
      return;
    }

    // 6. Empty Line / Spacer
    if (!trimmed) {
      elements.push(<div key={`empty-${idx}`} className="h-1.5" />);
      return;
    }

    // 7. Regular Paragraph
    elements.push(
      <p key={`p-${idx}`} className="text-xs leading-relaxed text-stone-800 dark:text-stone-200 my-1">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
}
