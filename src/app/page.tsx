"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Flame, 
  ArrowRight,
  Bell,
  Plus
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { pageTransition } from "@/lib/motion";

export default function Home() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finalize LifeOS Phase 2 data architecture", time: "10:00 AM", category: "Core", priority: "High", completed: false },
    { id: 2, text: "Review weekly habit streak consistency", time: "02:30 PM", category: "Habits", priority: "Medium", completed: true },
    { id: 3, text: "Synthesize quarterly goal progress milestones", time: "04:45 PM", category: "Goals", priority: "Low", completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <AppShell>
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col gap-8 md:gap-10"
      >
        {/* DASHBOARD HEADER (Restrained, Editorial, Contextual) */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted tracking-widest uppercase">
              Tuesday, August 12
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              Good evening, Jay.
            </h1>
            <p className="text-xs md:text-sm text-muted">
              Here&apos;s what deserves your attention today.
            </p>
          </div>

          {/* Quick Context Controls */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search command palette... (⌘K)"
                className="pl-9 pr-4 py-1.5 rounded-lg bg-card/80 border border-card-border text-xs text-foreground placeholder:text-muted/70 backdrop-blur-md focus:outline-none focus:border-accent/40 w-56 md:w-64 transition-all"
              />
            </div>
            <button className="p-2 rounded-lg bg-card/80 border border-card-border text-muted hover:text-foreground backdrop-blur-md transition-colors relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-display text-xs font-bold shadow-glass">
              J
            </div>
          </div>
        </header>

        {/* PRIMARY COMPOSED SECTION: FOCUS & AI INSIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Focus Panel (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <GlassPanel className="flex flex-col gap-5 p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <h2 className="font-display text-lg font-bold tracking-tight">Today&apos;s Focus Tasks</h2>
                </div>
                <GlassButton variant="ghost" size="sm" className="text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </GlassButton>
              </div>

              <div className="flex flex-col gap-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="group flex items-center justify-between p-3.5 rounded-xl bg-card/40 hover:bg-card/70 border border-card-border/60 transition-all duration-200 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <button className="text-muted group-hover:text-accent transition-colors">
                        {task.completed ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-accent" />
                        ) : (
                          <Circle className="w-4.5 h-4.5" />
                        )}
                      </button>
                      <span className={task.completed ? "text-xs text-muted line-through" : "text-xs md:text-sm font-medium text-foreground"}>
                        {task.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted font-medium hidden sm:inline">{task.time}</span>
                      <GlassBadge variant={task.priority === "High" ? "accent" : "default"} className="text-[10px]">
                        {task.category}
                      </GlassBadge>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* Supporting Metrics: Progress & Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Daily Progress</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-2xl font-extrabold tracking-tight">74%</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">↑ 8% from yesterday</span>
                  </div>
                  <div className="w-full h-1.5 bg-foreground/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full w-[74%] transition-all duration-1000" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Habit Streak</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex flex-col mt-3">
                  <span className="font-display text-2xl font-extrabold tracking-tight">12 Days</span>
                  <span className="text-[10px] text-muted font-medium mt-1">3 habits completed today</span>
                </div>
              </GlassCard>

              <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Focus Time</span>
                  <Clock className="w-4 h-4 text-accent-secondary" />
                </div>
                <div className="flex flex-col mt-3">
                  <span className="font-display text-2xl font-extrabold tracking-tight">3h 24m</span>
                  <span className="text-[10px] text-muted font-medium mt-1">Target: 4h deep work</span>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* AI Intelligence & Insight Panel (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Special AI Insight Card with Subtle Ambient Light */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-card to-accent-secondary/10 border border-accent/20 p-6 shadow-glass-lg backdrop-blur-2xl backdrop-saturate-150 flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent-secondary/15 blur-[60px] pointer-events-none" />

              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-accent flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> LIFEOS INTELLIGENCE
                  </span>
                  <GlassBadge variant="accent" className="text-[9px]">Observation</GlassBadge>
                </div>

                <p className="text-xs md:text-sm leading-relaxed text-foreground/90 font-medium mt-1">
                  You tend to complete your most difficult tasks before noon.
                </p>

                <p className="text-xs text-muted leading-relaxed">
                  Consider moving tomorrow&apos;s highest-priority architecture task to 9:00 AM for optimal focus.
                </p>
              </div>

              <div className="pt-4 border-t border-accent/15 relative z-10 flex items-center justify-between">
                <span className="text-[11px] text-muted font-medium">Based on 14 days activity</span>
                <GlassButton variant="ghost" size="sm" className="text-xs gap-1 text-accent hover:text-accent">
                  View insight <ArrowRight className="w-3 h-3" />
                </GlassButton>
              </div>
            </div>

            {/* Timeline Schedule Widget */}
            <GlassPanel className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold tracking-tight uppercase text-muted">Timeline</span>
                <CalendarIcon className="w-3.5 h-3.5 text-muted" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted w-12 shrink-0">10:00 AM</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-xs font-medium text-foreground">Weekly OS Sync</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted w-12 shrink-0">02:30 PM</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                  <span className="text-xs font-medium text-foreground">Personal Reflection</span>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <span className="text-[10px] font-mono text-muted w-12 shrink-0">06:00 PM</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                  <span className="text-xs font-medium text-foreground">Evening Workout</span>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
