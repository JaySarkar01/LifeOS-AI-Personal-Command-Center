"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Check, RotateCcw } from "lucide-react";
import { ChatMessage, AIActionItem } from "@/services/ai/types/ai";
import { AIActionType } from "@/models/domain/AIAction";
import { AISuggestedAction } from "./AISuggestedAction";
import { AIActionPreview } from "./AIActionPreview";

interface AIMessageProps {
  message: ChatMessage;
  onRetry?: () => void;
  onConfirmSuggestedAction?: (messageId: string) => Promise<void>;
  onCancelSuggestedAction?: (messageId: string) => void;
  onConfirmActions?: (messageId: string, actions: AIActionItem[]) => Promise<void>;
  onCancelActions?: (messageId: string) => void;
  onUndoAction?: (actionType: AIActionType, entityId: string) => Promise<void>;
}

// Clean markdown-style text formatter for ChatGPT-like flowing responses
function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-3 text-sm md:text-[15px] leading-relaxed font-sans text-foreground/90 select-text">
      {lines.map((line, idx) => {
        // Bullet list
        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          const text = line.trim().replace(/^[-•]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
            </div>
          );
        }

        // Numbered list
        const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1.5">
              <span className="font-mono text-xs font-bold text-accent shrink-0 min-w-5 pt-0.5">
                {numMatch[1]}.
              </span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
            </div>
          );
        }

        // Headers
        if (line.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-display font-bold text-base text-foreground mt-4 mb-1">
              {line.replace("### ", "")}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-display font-bold text-lg text-foreground mt-5 mb-1.5">
              {line.replace("## ", "")}
            </h3>
          );
        }

        // Empty line
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // Normal paragraph
        return (
          <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      })}
    </div>
  );
}

function formatInline(text: string): string {
  let safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text**)
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  
  // Inline code (`code`)
  safe = safe.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded-md bg-foreground/10 text-accent font-mono text-xs border border-card-border/60">$1</code>'
  );

  return safe;
}

export function AIMessage({
  message,
  onRetry,
  onConfirmSuggestedAction,
  onCancelSuggestedAction,
  onConfirmActions,
  onCancelActions,
  onUndoAction,
}: AIMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. USER MESSAGE: Clean right-aligned capsule/bubble
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex justify-end w-full py-1"
      >
        <div className="max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl md:rounded-3xl bg-accent/15 border border-accent/30 text-foreground shadow-glass backdrop-blur-md">
          <div className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. AI RESPONSE: Exact ChatGPT interface (Unboxed, flows naturally on canvas, left AI icon, bottom action buttons)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex gap-3 md:gap-4 items-start w-full py-2 group"
    >
      {/* Left Icon (ChatGPT style avatar) */}
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-card border border-card-border shadow-glass flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
      </div>

      {/* Main Response Flow (NO bubble box around text) */}
      <div className="flex flex-col gap-2 flex-1 min-w-0 pr-2">
        {/* Content */}
        <FormattedContent content={message.content} />

        {/* Embedded Actions / Plans */}
        {message.actions && message.actions.length > 0 ? (
          <div className="mt-2">
            <AIActionPreview
              actions={message.actions}
              onConfirmActions={async (selected) => {
                if (onConfirmActions) {
                  await onConfirmActions(message.id, selected);
                }
              }}
              onCancelActions={() => {
                if (onCancelActions) {
                  onCancelActions(message.id);
                }
              }}
              onUndoAction={onUndoAction}
            />
          </div>
        ) : message.suggestedAction ? (
          <div className="mt-2">
            <AISuggestedAction
              action={message.suggestedAction}
              onConfirm={async () => {
                if (onConfirmSuggestedAction) {
                  await onConfirmSuggestedAction(message.id);
                }
              }}
              onCancel={() => {
                if (onCancelSuggestedAction) {
                  onCancelSuggestedAction(message.id);
                }
              }}
            />
          </div>
        ) : null}

        {/* Subtle ChatGPT-style bottom actions toolbar */}
        <div className="flex items-center gap-2 pt-1 text-muted opacity-80 group-hover:opacity-100 transition-opacity text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-foreground p-1 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px]">{copied ? "Copied" : ""}</span>
          </button>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 hover:text-foreground p-1 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
              title="Regenerate response"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-[10px] text-muted/50 font-mono ml-auto">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
