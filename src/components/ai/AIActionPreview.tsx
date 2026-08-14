import React, { useState } from "react";
import {
  Sparkles,
  Check,
  X,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Repeat,
  StickyNote,
  Target,
  Clock,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { AIActionItem } from "@/services/ai/types/ai";
import { AIActionType } from "@/models/domain/AIAction";

export interface AIActionPreviewProps {
  actions: AIActionItem[];
  onConfirmActions: (selectedActions: AIActionItem[]) => Promise<void>;
  onCancelActions: () => void;
  onUndoAction?: (actionType: AIActionType, entityId: string) => Promise<void>;
}

export function AIActionPreview({
  actions,
  onConfirmActions,
  onCancelActions,
  onUndoAction,
}: AIActionPreviewProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    actions.map((_, i) => i)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [status, setStatus] = useState<"proposed" | "executing" | "success" | "failed" | "cancelled">(
    "proposed"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMulti = actions.length > 1;
  const isDestructive = actions.some((a) => a.type === "DELETE_EVENT");

  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const toggleAll = () => {
    if (selectedIndices.length === actions.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(actions.map((_, i) => i));
    }
  };

  const handleConfirm = async () => {
    const selected = actions.filter((_, i) => selectedIndices.includes(i));
    if (selected.length === 0) return;

    setIsSubmitting(true);
    setStatus("executing");
    setErrorMessage(null);

    try {
      await onConfirmActions(selected);
      setStatus("success");
    } catch (err: unknown) {
      console.error(err);
      setStatus("failed");
      setErrorMessage(err instanceof Error ? err.message : "Failed to execute actions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStatus("cancelled");
    onCancelActions();
  };

  const handleUndo = async () => {
    if (!onUndoAction) return;
    const firstAction = actions[0];
    if (!firstAction || !firstAction.resultEntityId) return;

    setIsUndoing(true);
    try {
      await onUndoAction(firstAction.type, firstAction.resultEntityId);
      setStatus("cancelled");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUndoing(false);
    }
  };

  const getActionBadgeVariant = (type: AIActionType) => {
    if (type.startsWith("DELETE")) return "danger" as const;
    if (type.startsWith("CREATE")) return "accent" as const;
    if (type.startsWith("COMPLETE")) return "success" as const;
    return "default" as const;
  };

  const getEntityIcon = (type: AIActionType) => {
    if (type.includes("TASK")) return CheckSquare;
    if (type.includes("HABIT")) return Repeat;
    if (type.includes("NOTE")) return StickyNote;
    if (type.includes("GOAL")) return Target;
    if (type.includes("EVENT")) return Calendar;
    return Sparkles;
  };

  const formatActionTitle = (action: AIActionItem) => {
    const payload = action.payload as Record<string, unknown>;
    return (
      (payload.title as string) ||
      (payload.query as string) ||
      (payload.content as string) ||
      "Untitled Action"
    );
  };

  return (
    <GlassPanel
      className={`p-4 md:p-5 mt-3 flex flex-col gap-4 border transition-all shadow-glass max-w-lg w-full ${
        isDestructive
          ? "border-destructive/40 bg-destructive/5"
          : "border-accent/30 bg-card/70"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
        <div className="flex items-center gap-2">
          {isDestructive ? (
            <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
          ) : (
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          )}
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
              isDestructive ? "text-destructive" : "text-accent"
            }`}
          >
            {isDestructive ? "DESTRUCTIVE ACTION" : "SUGGESTED BY LIFEOS INTELLIGENCE"}
          </span>
        </div>

        {status === "proposed" && (
          <span className="text-[10px] text-muted">
            {isMulti
              ? `${selectedIndices.length} of ${actions.length} selected`
              : "Pending confirmation"}
          </span>
        )}
      </div>

      {/* Description / Notice */}
      {status === "proposed" && (
        <div className="flex items-center justify-between text-xs text-muted">
          <span>This action has NOT been applied yet.</span>
          {isMulti && (
            <button
              onClick={toggleAll}
              className="text-xs text-accent font-semibold hover:underline cursor-pointer"
            >
              {selectedIndices.length === actions.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>
      )}

      {/* Action Items List */}
      <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
        {actions.map((action, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const Icon = getEntityIcon(action.type);
          const badgeVariant = getActionBadgeVariant(action.type);
          const title = formatActionTitle(action);
          const payload = action.payload as Record<string, unknown>;

          return (
            <div
              key={idx}
              onClick={() => status === "proposed" && isMulti && toggleSelect(idx)}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                isMulti && status === "proposed" ? "cursor-pointer" : ""
              } ${
                isSelected || !isMulti
                  ? "bg-card/90 border-card-border text-foreground"
                  : "bg-card/30 border-border/40 text-muted opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {isMulti && status === "proposed" && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded border-card-border text-accent focus:ring-0 cursor-pointer shrink-0"
                  />
                )}
                <div className="p-1.5 rounded-lg bg-foreground/5 shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">{title}</span>
                  {action.reason ? (
                    <span className="text-[10px] text-muted truncate">{String(action.reason)}</span>
                  ) : null}
                  {typeof payload.dueDate === "string" ? (
                    <span className="text-[10px] text-accent/80 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Due: {payload.dueDate}
                    </span>
                  ) : null}
                </div>
              </div>

              <GlassBadge variant={badgeVariant} className="text-[9px] uppercase shrink-0">
                {action.type.replace(/_/g, " ")}
              </GlassBadge>
            </div>
          );
        })}
      </div>

      {/* Action Controls and State Feedback */}
      <div className="pt-2 border-t border-border/20 flex flex-col gap-2">
        {status === "proposed" && (
          <div className="flex items-center justify-end gap-2.5">
            <GlassButton variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </GlassButton>

            <GlassButton
              variant={isDestructive ? "danger" : "primary"}
              size="sm"
              onClick={handleConfirm}
              disabled={isSubmitting || (isMulti && selectedIndices.length === 0)}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isDestructive ? (
                <Trash2 className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {isDestructive
                ? "Delete Event"
                : isMulti
                ? `Add Selected (${selectedIndices.length})`
                : "Confirm Action"}
            </GlassButton>
          </div>
        )}

        {status === "executing" && (
          <div className="flex items-center gap-2 text-xs text-muted py-1">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span>Executing actions with domain services...</span>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span>
                {isMulti
                  ? `Successfully executed ${selectedIndices.length} actions`
                  : isDestructive
                  ? "Event deleted successfully"
                  : "Action completed successfully"}
              </span>
            </div>

            {!isDestructive && onUndoAction && actions[0]?.resultEntityId && (
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleUndo}
                disabled={isUndoing}
                className="gap-1 text-xs px-2.5 py-1 h-7"
              >
                {isUndoing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RotateCcw className="w-3 h-3 text-muted" />
                )}
                <span>Undo</span>
              </GlassButton>
            )}
          </div>
        )}

        {status === "failed" && (
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-destructive font-medium">
              {errorMessage || "Action execution failed"}
            </span>
            <GlassButton variant="secondary" size="sm" onClick={handleConfirm}>
              Try Again
            </GlassButton>
          </div>
        )}

        {status === "cancelled" && (
          <div className="flex items-center gap-2 text-muted font-medium text-xs py-1">
            <div className="w-5 h-5 rounded-full bg-muted/10 border border-muted/20 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-muted" />
            </div>
            <span>Actions discarded</span>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
