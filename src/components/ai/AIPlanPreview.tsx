import React, { useState } from "react";
import { CheckSquare, Plus, X } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { AITaskPlanItem } from "@/services/ai/types/ai";

interface AIPlanPreviewProps {
  planTitle: string;
  suggestedTasks: AITaskPlanItem[];
  onConfirm: (selectedTasks: AITaskPlanItem[]) => void;
  onCancel: () => void;
}

export function AIPlanPreview({ planTitle, suggestedTasks, onConfirm, onCancel }: AIPlanPreviewProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    suggestedTasks.map((_, i) => i)
  );

  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const toggleAll = () => {
    if (selectedIndices.length === suggestedTasks.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(suggestedTasks.map((_, i) => i));
    }
  };

  const handleAddSelected = () => {
    const selected = suggestedTasks.filter((_, i) => selectedIndices.includes(i));
    onConfirm(selected);
  };

  return (
    <GlassPanel className="p-6 flex flex-col gap-5 border-accent/40 shadow-[0_0_25px_rgba(56,189,248,0.15)]">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-base text-foreground">{planTitle}</h3>
        </div>
        <button onClick={onCancel} className="p-1 text-muted hover:text-foreground rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Review proposed task breakdown before creating:</span>
        <button onClick={toggleAll} className="text-xs text-accent font-semibold hover:underline">
          {selectedIndices.length === suggestedTasks.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
        {suggestedTasks.map((task, index) => {
          const isSelected = selectedIndices.includes(index);

          return (
            <div
              key={index}
              onClick={() => toggleSelect(index)}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                isSelected
                  ? "bg-accent/10 border-accent/40 text-foreground"
                  : "bg-card/40 border-card-border/50 text-muted opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="rounded border-card-border text-accent focus:ring-0 cursor-pointer"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">{task.title}</span>
                  <span className="text-[10px] text-muted truncate">{task.reason}</span>
                </div>
              </div>

              <GlassBadge variant="accent" className="text-[9px] uppercase shrink-0">
                {task.priority}
              </GlassBadge>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
        <GlassButton variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </GlassButton>
        <GlassButton
          variant="primary"
          size="sm"
          disabled={selectedIndices.length === 0}
          onClick={handleAddSelected}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Selected ({selectedIndices.length}) to Tasks
        </GlassButton>
      </div>
    </GlassPanel>
  );
}
