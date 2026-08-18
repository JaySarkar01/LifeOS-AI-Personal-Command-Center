"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  PanelRightClose, 
  PanelRightOpen, 
  Trash2, 
  ArrowDown, 
  CheckSquare, 
  Repeat, 
  Calendar, 
  Target
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
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

const STARTER_CARDS = [
  {
    title: "Focus Priority",
    desc: "Identify today's top tasks by deadline & urgency",
    prompt: "What are my highest priority tasks for today, and in what order should I tackle them?",
    icon: CheckSquare,
    badge: "Productivity",
    color: "from-sky-500/20 to-blue-600/10 text-sky-400 border-sky-500/30",
  },
  {
    title: "Habit Momentum",
    desc: "Review streaks and build today's completion plan",
    prompt: "Analyze my current habits and streaks. Which ones need attention today?",
    icon: Repeat,
    badge: "Habits",
    color: "from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30",
  },
  {
    title: "Day Architecture",
    desc: "Optimize today's calendar and schedule free slots",
    prompt: "Look at my schedule for today. Plan time blocks for my active tasks around my meetings.",
    icon: Calendar,
    badge: "Schedule",
    color: "from-cyan-500/20 to-teal-600/10 text-cyan-400 border-cyan-500/30",
  },
  {
    title: "Break Down Project",
    desc: "Generate a multi-step execution plan for goals",
    prompt: "Help me create a step-by-step task breakdown plan for my main goals.",
    icon: Target,
    badge: "Planning",
    color: "from-emerald-500/20 to-green-600/10 text-emerald-400 border-emerald-500/30",
  },
];

export default function AIPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<LifeOSTodayContext | null>(null);
  const [proposedPlan, setProposedPlan] = useState<AITaskPlanResult | null>(null);
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle user manual scrolling to show/hide scroll-to-bottom button
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

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

  const totalContextItems = 
    (context?.tasks.length || 0) + 
    (context?.habits.length || 0) + 
    (context?.goals.length || 0) + 
    (context?.schedule.length || 0);

  return (
    <AppShell>
      <PageContainer className="p-3 md:p-6 lg:p-8 flex flex-col gap-4 max-w-[1600px] h-[calc(100vh-4.5rem)] md:h-[calc(100vh-5rem)]">
        {/* Chat Area Grid Container */}
        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
          {/* Main Chat View */}
          <GlassPanel className="flex-1 flex flex-col rounded-3xl border-card-border/80 shadow-glass overflow-hidden relative backdrop-blur-2xl">
            {/* Top Chat Toolbar */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/40 bg-card/40 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-accent-foreground shadow-glass">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-sm text-foreground">LifeOS Intelligence</h2>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Gemini 2.5
                    </span>
                  </div>
                  <span className="text-[11px] text-muted hidden sm:inline">
                    {messages.length === 0 ? "Ready for queries" : `${messages.length} messages in current thread`}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card/70 border border-transparent hover:border-card-border transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Clear chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-xs">Clear</span>
                  </button>
                )}

                <button
                  onClick={() => setShowContextPanel(!showContextPanel)}
                  className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                    showContextPanel
                      ? "bg-accent/15 border-accent/40 text-accent font-semibold"
                      : "bg-card/60 border-card-border text-muted hover:text-foreground"
                  }`}
                  title={showContextPanel ? "Hide Workspace Context" : "Show Workspace Context"}
                >
                  {showContextPanel ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRightOpen className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline text-xs">Context</span>
                  {totalContextItems > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-accent text-accent-foreground text-[10px] font-bold font-mono">
                      {totalContextItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Messages Scroll Viewport */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 relative scroll-smooth"
            >
              {messages.length === 0 ? (
                /* Welcome Bento Grid */
                <div className="my-auto flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center text-center gap-3 mb-8"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center text-accent shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                      <Sparkles className="w-7 h-7 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl md:text-2xl text-foreground tracking-tight">
                        How can LifeOS assist you?
                      </h3>
                      <p className="text-xs md:text-sm text-muted max-w-md mx-auto mt-1 leading-relaxed">
                        I am synced with your active tasks, habits, schedule, and goals. Ask anything or choose an action below.
                      </p>
                    </div>
                  </motion.div>

                  {/* Starter Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {STARTER_CARDS.map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <motion.button
                          key={card.title}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.25 }}
                          onClick={() => handleSendMessage(card.prompt)}
                          className="group p-4 rounded-2xl bg-card/40 hover:bg-card/80 border border-card-border hover:border-accent/40 text-left transition-all duration-200 cursor-pointer shadow-sm hover:shadow-glass hover:scale-[1.01] flex flex-col justify-between gap-3 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between">
                            <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${card.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-foreground/5 text-muted border border-border/40 group-hover:border-accent/30 group-hover:text-accent transition-colors">
                              {card.badge}
                            </span>
                          </div>
                          <div>
                            <span className="font-display font-bold text-sm text-foreground group-hover:text-accent transition-colors block">
                              {card.title}
                            </span>
                            <span className="text-xs text-muted leading-snug mt-0.5 block">
                              {card.desc}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
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

              {/* Task Plan Breakdown Confirmation Modal */}
              {proposedPlan && (
                <div className="my-2">
                  <AIPlanPreview
                    planTitle={proposedPlan.planTitle}
                    suggestedTasks={proposedPlan.suggestedTasks}
                    onConfirm={handleConfirmAddTasks}
                    onCancel={() => setProposedPlan(null)}
                  />
                </div>
              )}
            </div>

            {/* Floating Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-28 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-card/90 border border-card-border shadow-glass-lg backdrop-blur-xl text-xs font-semibold text-foreground hover:text-accent flex items-center gap-1.5 cursor-pointer z-20 hover:scale-105 transition-transform"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Latest messages</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input Dock Area */}
            <div className="p-3 md:p-4 bg-card/40 border-t border-border/40 backdrop-blur-md flex flex-col gap-2.5 shrink-0">
              <AIQuickPrompts onSelectPrompt={handleSendMessage} disabled={isLoading} />
              <AIInput onSend={handleSendMessage} onClear={handleClear} isLoading={isLoading} />
            </div>
          </GlassPanel>

          {/* Desktop Collapsible Context Panel */}
          <AnimatePresence>
            {showContextPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="hidden lg:flex flex-col shrink-0 overflow-hidden"
              >
                <div className="w-[340px] h-full">
                  <AIContextPanel context={context} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageContainer>
    </AppShell>
  );
}
