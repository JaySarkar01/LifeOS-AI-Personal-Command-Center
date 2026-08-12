import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onCancel} className="fixed inset-0 bg-background/80 backdrop-blur-md" />
      <GlassPanel className="relative w-full max-w-md p-6 flex flex-col gap-4 z-10 border-danger/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className={`w-5 h-5 ${isDestructive ? "text-danger" : "text-accent"}`} />
            <h3 className="font-display font-bold text-base text-foreground">{title}</h3>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted leading-relaxed">{description}</p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
          <GlassButton variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </GlassButton>
          <GlassButton
            variant={isDestructive ? "primary" : "primary"}
            size="sm"
            onClick={onConfirm}
            className={isDestructive ? "bg-danger hover:bg-danger/90 text-white border-danger/50" : ""}
          >
            {confirmLabel}
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  );
}
