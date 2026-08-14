"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AIMessage } from "@/components/ai/AIMessage";
import { AIInput } from "@/components/ai/AIInput";
import { AIQuickPrompts } from "@/components/ai/AIQuickPrompts";
import { AIContextPanel } from "@/components/ai/AIContextPanel";
import { AIThinking } from "@/components/ai/AIThinking";
import { AIPlanPreview } from "@/components/ai/AIPlanPreview";
import { AIError } from "@/components/ai/AIError";
import { ChatMessage, LifeOSTodayContext, AITaskPlanResult, AITaskPlanItem, AIActionItem } from "@/services/ai/types/ai";

import { useToast } from "@/components/providers/ToastProvider";

export default function AIPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<LifeOSTodayContext | null>(null);
  const [proposedPlan, setProposedPlan] = useState<AITaskPlanResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadDashboardContext = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data.success) {
        setContext({
          date: new Date().toISOString().split("T")[0],
          userName: data.data.userName || "User",
          tasks: data.data.focusTasks || [],
          habits: data.data.habits || [],
          goals: data.data.goals || [],
          schedule: data.data.schedule || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      loadDashboardContext();
    }, 0);
  }, [loadDashboardContext]);

  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg_usr_${crypto.randomUUID()}`,
      role: "user",
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Check if task breakdown plan requested
      if (promptText.toLowerCase().includes("plan") && promptText.toLowerCase().includes("task")) {
        const planRes = await fetch("/api/ai/task-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userGoalText: promptText }),
        });
        const planData = await planRes.json();
        if (planData.success) {
          setProposedPlan(planData.data);
        }
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg: ChatMessage = {
          id: `msg_ai_${crypto.randomUUID()}`,
          role: "model",
          content: data.data.content,
          timestamp: data.data.timestamp,
          suggestedAction: data.data.suggestedAction,
          actions: data.data.actions,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setError(data.error || "LifeOS Intelligence error occurred");
      }
    } catch (err) {
      console.error(err);
      setError("LifeOS Intelligence is temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAddTasks = async (selectedTasks: AITaskPlanItem[]) => {
    try {
      const actions = selectedTasks.map((t) => ({
        type: "CREATE_TASK" as const,
        entityType: "task" as const,
        payload: {
          title: t.title,
          priority: t.priority,
        },
        reason: t.reason,
      }));

      await fetch("/api/ai/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions }),
      });

      setProposedPlan(null);
      loadDashboardContext();
      showToast("Tasks Added to Workspace", `${selectedTasks.length} tasks added`, "success");

      const confirmMsg: ChatMessage = {
        id: `msg_ai_${crypto.randomUUID()}`,
        role: "model",
        content: `Successfully added ${selectedTasks.length} suggested tasks to your active workspace list.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err) {
      console.error("Failed to insert confirmed tasks:", err);
    }
  };

  const handleConfirmSuggestedAction = async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    let actionToExecute: Record<string, unknown> | null = null;
    if (msg.actions && msg.actions.length > 0) {
      actionToExecute = msg.actions[0] as unknown as Record<string, unknown>;
    } else if (msg.suggestedAction) {
      actionToExecute = {
        type: msg.suggestedAction.type,
        entityType: msg.suggestedAction.entityType || "task",
        payload: msg.suggestedAction.data,
      };
    }

    if (!actionToExecute) return;

    try {
      const res = await fetch("/api/ai/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionToExecute }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  suggestedAction: m.suggestedAction
                    ? { ...m.suggestedAction, status: "confirmed" }
                    : undefined,
                  actions: m.actions
                    ? m.actions.map((a) => ({ ...a, status: "success", resultEntityId: data.data?.entityId }))
                    : undefined,
                }
              : m
          )
        );
        loadDashboardContext();
        showToast("Action Confirmed", data.data?.message || "Action executed successfully.", "success");
      } else {
        showToast("Action Failed", data.error?.message || "Failed to execute action", "error");
      }
    } catch (err) {
      console.error("Failed to confirm action:", err);
      showToast("Error", "Could not complete action request.", "error");
    }
  };

  const handleConfirmActions = async (messageId: string, selectedActions: AIActionItem[]) => {
    try {
      const res = await fetch("/api/ai/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions: selectedActions.map((a) => ({
            type: a.type,
            entityType: a.entityType,
            payload: a.payload,
            reason: a.reason,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.actions
              ? {
                  ...m,
                  actions: m.actions.map((a) => {
                    const found = selectedActions.find((sa) => sa.id === a.id || sa.type === a.type);
                    return found ? { ...a, status: "success" } : a;
                  }),
                }
              : m
          )
        );
        loadDashboardContext();
        showToast("Actions Executed", `Successfully applied ${selectedActions.length} workspace actions.`, "success");
      } else {
        showToast("Action Execution Failed", data.error?.message || "Error processing actions", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error", "Failed to communicate with action server.", "error");
    }
  };

  const handleCancelSuggestedAction = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              suggestedAction: m.suggestedAction
                ? { ...m.suggestedAction, status: "cancelled" }
                : undefined,
              actions: m.actions
                ? m.actions.map((a) => ({ ...a, status: "cancelled" }))
                : undefined,
            }
          : m
      )
    );
    showToast("Action Cancelled", "Action proposal discarded.", "info");
  };

  const handleUndoAction = async (_actionType: unknown, entityId: string) => {
    try {
      await fetch(`/api/tasks/${entityId}`, { method: "DELETE" });
      loadDashboardContext();
      showToast("Action Undone", "Reversed workspace action.", "info");
    } catch (err) {
      console.error("Undo failed:", err);
      showToast("Undo Error", "Failed to undo action.", "error");
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setProposedPlan(null);
  };

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="AI Intelligence Command"
          badgeIcon={Sparkles}
          title="LifeOS Intelligence"
          description="Contextual AI operating assistant connected to your private tasks, habits, schedule, and goals."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Panel (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <GlassPanel className="p-6 md:p-8 flex flex-col gap-6 min-h-[550px] max-h-[650px] relative overflow-hidden">
              {/* Messages Scroll Area */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center my-auto p-8 gap-3 text-muted">
                    <div className="p-4 rounded-2xl bg-accent/10 text-accent border border-accent/20">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground">How can LifeOS help you today?</h3>
                    <p className="text-xs max-w-md leading-relaxed">
                      Ask questions about your daily focus, request habit analysis, or generate a structured task breakdown.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <AIMessage
                      key={msg.id}
                      message={msg}
                      onRetry={msg.role === "model" ? () => handleSendMessage(messages[messages.length - 2]?.content || "") : undefined}
                      onConfirmSuggestedAction={handleConfirmSuggestedAction}
                      onCancelSuggestedAction={() => handleCancelSuggestedAction(msg.id)}
                      onConfirmActions={(msgId, selected) => handleConfirmActions(msgId, selected)}
                      onCancelActions={() => handleCancelSuggestedAction(msg.id)}
                      onUndoAction={handleUndoAction}
                    />
                  ))
                )}

                {isLoading && <AIThinking />}
                {error && <AIError message={error} onRetry={() => handleSendMessage(messages[messages.length - 1]?.content || "")} />}
                <div ref={messagesEndRef} />
              </div>

              {/* Task Plan Breakdown Confirmation Modal */}
              {proposedPlan && (
                <div className="mt-2">
                  <AIPlanPreview
                    planTitle={proposedPlan.planTitle}
                    suggestedTasks={proposedPlan.suggestedTasks}
                    onConfirm={handleConfirmAddTasks}
                    onCancel={() => setProposedPlan(null)}
                  />
                </div>
              )}

              {/* Input Area */}
              <div className="flex flex-col gap-3 pt-3 border-t border-border/40">
                <AIQuickPrompts onSelectPrompt={handleSendMessage} disabled={isLoading} />
                <AIInput onSend={handleSendMessage} onClear={handleClear} isLoading={isLoading} />
              </div>
            </GlassPanel>
          </div>

          {/* Context Panel (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AIContextPanel context={context} />
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
