import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-danger shrink-0" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-accent shrink-0" />;
    }
  };

  return (
    <GlassPanel className="p-3.5 flex items-center justify-between gap-3 shadow-glass-lg min-w-[280px] max-w-[360px] animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        {getIcon()}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-foreground truncate">{toast.title}</span>
          {toast.description && <span className="text-[11px] text-muted truncate">{toast.description}</span>}
        </div>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="p-1 rounded text-muted hover:text-foreground shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </GlassPanel>
  );
}
