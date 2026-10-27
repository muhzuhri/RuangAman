'use client';

import React from 'react';
import Link from 'next/link';

export type MessageBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

export function parseMessageBlocks(raw: string): MessageBlock[] {
  if (!raw) return [];
  const lines = raw.split('\n');
  const blocks: MessageBlock[] = [];
  let currentList: string[] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      if (currentList && currentList.length > 0) {
        blocks.push({ type: 'list', items: currentList });
        currentList = null;
      }
      continue;
    }

    // Check for Headings: ### Title or ## Title
    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      if (currentList && currentList.length > 0) {
        blocks.push({ type: 'list', items: currentList });
        currentList = null;
      }
      blocks.push({ type: 'heading', text: headingMatch[1] });
      continue;
    }

    // Check for List Items: * item, - item, • item, or 1. item
    const bulletMatch = trimmed.match(/^([\*\-•]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList) currentList = [];
      currentList.push(bulletMatch[2]);
    } else {
      if (currentList && currentList.length > 0) {
        blocks.push({ type: 'list', items: currentList });
        currentList = null;
      }
      blocks.push({ type: 'paragraph', text: trimmed });
    }
  }

  if (currentList && currentList.length > 0) {
    blocks.push({ type: 'list', items: currentList });
  }

  return blocks;
}

function renderSubInline(str: string): React.ReactNode[] {
  // Handles inline code `code` and italic *text*
  const subRegex = /(`[^`]+`|\*[^*]+\*)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = subRegex.exec(str)) !== null) {
    if (m.index > last) {
      parts.push(str.slice(last, m.index).replace(/\*\*/g, ''));
    }
    const token = m[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={m.index} className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={m.index}>{token.slice(1, -1)}</em>);
    }
    last = m.index + token.length;
  }

  if (last < str.length) {
    parts.push(str.slice(last).replace(/\*\*/g, ''));
  }

  return parts;
}

export function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex for bold **bold** and links [label](url)
  const regex = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...renderSubInline(text.slice(lastIndex, match.index)));
    }

    const full = match[0];
    if (full.startsWith('**') && full.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-stone-900 dark:text-emerald-300">
          {full.slice(2, -2)}
        </strong>
      );
    } else if (full.startsWith('[')) {
      const label = match[2];
      const href = match[3];
      parts.push(
        <Link
          key={match.index}
          href={href}
          className="text-teal-700 dark:text-teal-300 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {label}
        </Link>
      );
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(...renderSubInline(text.slice(lastIndex)));
  }

  return parts;
}

export function FormattedMessageText({ text }: { text: string }) {
  const blocks = parseMessageBlocks(text);
  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          return (
            <h4 key={idx} className="font-bold text-sm text-stone-900 dark:text-emerald-200 mt-2 mb-1">
              {renderInlineMarkdown(block.text)}
            </h4>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={idx} className="leading-relaxed">
              {renderInlineMarkdown(block.text)}
            </p>
          );
        }

        return (
          <ul key={idx} className="space-y-1.5 my-1.5 pl-1 list-none">
            {block.items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                <span className="flex-1">{renderInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
