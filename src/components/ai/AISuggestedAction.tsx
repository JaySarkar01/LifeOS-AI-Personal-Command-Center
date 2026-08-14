import React, { useState } from "react";
import { Sparkles, Check, X, Loader2, Calendar } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { SuggestedAction } from "@/services/ai/types/ai";

interface AISuggestedActionProps {
  action: SuggestedAction;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function AISuggestedAction({ action, onConfirm, onCancel }: AISuggestedActionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { title, dueDate, priority } = action.data;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFriendlyDueDate = (dueDateStr?: string) => {
    if (!dueDateStr) return "No due date";
    
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    
    if (dueDateStr === todayStr) {
      return "Today";
    } else if (dueDateStr === tomorrowStr) {
      return "Tomorrow";
    } else {
      try {
        const parsedDate = new Date(dueDateStr + "T00:00:00");
        return parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        return dueDateStr;
      }
    }
  };

  return (
    <GlassPanel className="p-5 mt-3 flex flex-col gap-4 border-accent/40 shadow-[0_0_20px_rgba(56,189,248,0.1)] max-w-sm w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-border/30 pb-2">
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
          SUGGESTED ACTION
        </span>
      </div>

      {/* Task Information */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          Create Task
        </span>
        <h4 className="font-display font-bold text-base text-foreground">
          {title}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
          <Calendar className="w-3.5 h-3.5 text-accent/70" />
          <span>Due: {getFriendlyDueDate(dueDate)}</span>
          {priority && (
            <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-accent/10 border border-accent/20 text-accent">
              {priority}
            </span>
          )}
        </div>
      </div>

      {/* Status Indicators / Actions */}
      <div className="pt-2 border-t border-border/20 flex flex-col gap-3">
        {action.status === "pending" && (
          <>
            <span className="text-xs text-amber-500/90 dark:text-amber-400/90 font-medium">
              This has NOT been added yet
            </span>
            <div className="flex items-center gap-2.5 justify-end">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Confirm Action
              </GlassButton>
            </div>
          </>
        )}

        {action.status === "confirmed" && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs py-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span>Added to tasks</span>
          </div>
        )}

        {action.status === "cancelled" && (
          <div className="flex items-center gap-2 text-muted font-medium text-xs py-1">
            <div className="w-5 h-5 rounded-full bg-muted/10 border border-muted/20 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-muted" />
            </div>
            <span>Suggestion discarded</span>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
