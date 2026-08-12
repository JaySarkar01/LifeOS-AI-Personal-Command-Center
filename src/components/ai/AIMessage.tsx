import React, { useState } from "react";
import { Sparkles, User, Copy, Check, RotateCcw } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ChatMessage } from "@/services/ai/types/ai";

interface AIMessageProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export function AIMessage({ message, onRetry }: AIMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"} items-start max-w-[85%] ${isUser ? "ml-auto" : "mr-auto"}`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-glass ${
          isUser
            ? "bg-accent/20 border-accent/40 text-accent"
            : "bg-card border-card-border text-foreground"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-accent" />}
      </div>

      <GlassPanel
        className={`p-4 md:p-5 flex flex-col gap-2 relative group ${
          isUser
            ? "bg-accent/10 border-accent/30 text-foreground"
            : "bg-card/90 border-card-border text-foreground"
        }`}
      >
        <div className="flex items-center justify-between gap-4 text-[10px] text-muted font-mono border-b border-border/30 pb-1.5">
          <span className="font-semibold uppercase tracking-wider">
            {isUser ? "You" : "LifeOS Intelligence"}
          </span>
          <div className="flex items-center gap-2">
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {!isUser && (
              <button
                onClick={handleCopy}
                className="hover:text-foreground p-0.5 rounded transition-colors"
                title="Copy response"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
            {!isUser && onRetry && (
              <button
                onClick={onRetry}
                className="hover:text-foreground p-0.5 rounded transition-colors"
                title="Retry response"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {message.content}
        </div>
      </GlassPanel>
    </div>
  );
}
