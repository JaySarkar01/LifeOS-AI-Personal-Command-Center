import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";

interface AIErrorProps {
  message: string;
  onRetry?: () => void;
}

export function AIError({ message, onRetry }: AIErrorProps) {
  return (
    <GlassPanel className="p-4 bg-danger/10 border-danger/30 text-danger flex items-center justify-between gap-4 max-w-[85%] mr-auto">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span className="text-xs font-medium text-foreground/90">{message}</span>
      </div>
      {onRetry && (
        <GlassButton variant="ghost" size="sm" onClick={onRetry} className="gap-1.5 shrink-0 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </GlassButton>
      )}
    </GlassPanel>
  );
}
