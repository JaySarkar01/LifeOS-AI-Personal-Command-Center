"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckSquare,
  Repeat,
  Target,
  StickyNote,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Lock,
  Cpu,
  Layers,
  CheckCircle2,
  ChevronRight,
  Flame
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { fadeUp } from "@/lib/motion";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "habits" | "ai" | "goals" | "notes">("dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-accent/30 selection:text-foreground">
      {/* Background ambient lighting */}
      <div className="fixed top-[-10%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-[0.08] blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(circle,var(--color-accent-secondary)_0%,transparent_70%)] opacity-[0.06] blur-[140px] pointer-events-none z-0" />

      {/* 1. PUBLIC NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-accent-foreground shadow-glass group-hover:scale-105 transition-transform duration-200">
              ◈
            </div>
            <span className="text-foreground font-bold text-base">LifeOS</span>
            <GlassBadge variant="accent" className="text-[9px] uppercase tracking-wider hidden sm:inline-flex">v1.0</GlassBadge>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#ai" className="hover:text-foreground transition-colors">LifeOS Intelligence</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">How It Works</a>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <GlassButton variant="ghost" size="sm">
                Sign In
              </GlassButton>
            </Link>
            <Link href="/register">
              <GlassButton variant="primary" size="sm" className="gap-1.5 shadow-glass">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </GlassButton>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-2xl px-4 py-4 flex flex-col gap-3"
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-2 text-muted hover:text-foreground">Features</a>
              <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-2 text-muted hover:text-foreground">LifeOS Intelligence</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-2 text-muted hover:text-foreground">Security</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-2 text-muted hover:text-foreground">How It Works</a>
              <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <GlassButton variant="ghost" size="sm" className="w-full justify-center">Sign In</GlassButton>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <GlassButton variant="primary" size="sm" className="w-full justify-center gap-1.5">Get Started <ArrowRight className="w-3.5 h-3.5" /></GlassButton>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 z-10">
        {/* 2. HERO SECTION */}
        <section className="relative pt-16 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center gap-6">
          <motion.div variants={fadeUp()} initial="initial" animate="animate">
            <GlassBadge variant="accent" className="px-3.5 py-1.5 text-xs gap-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Personal AI Command Center</span>
            </GlassBadge>
          </motion.div>

          <motion.h1
            variants={fadeUp(16)}
            initial="initial"
            animate="animate"
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground leading-[1.1]"
          >
            YOUR LIFE. <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">ONE SYSTEM.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp(24)}
            initial="initial"
            animate="animate"
            className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed font-normal"
          >
            An AI-powered personal command center for tasks, habits, goals, notes, and your day — structured in one private, glass-morphism workspace.
          </motion.p>

          <motion.div
            variants={fadeUp(32)}
            initial="initial"
            animate="animate"
            className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <GlassButton variant="primary" size="lg" className="w-full sm:w-auto px-8 gap-2 shadow-glass-lg text-sm font-semibold">
                Start using LifeOS <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
            <a href="#showcase" className="w-full sm:w-auto">
              <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto px-8 text-sm">
                See how it works
              </GlassButton>
            </a>
          </motion.div>
        </section>

        {/* 3. PRODUCT SHOWCASE */}
        <section id="showcase" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <GlassPanel className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 shadow-glass-lg border-cyan-500/20">
            {/* Interactive Module Tabs Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border/40 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "dashboard", label: "Dashboard Focus", icon: Layers },
                  { id: "tasks", label: "Tasks", icon: CheckSquare },
                  { id: "habits", label: "Habits", icon: Repeat },
                  { id: "goals", label: "Goals", icon: Target },
                  { id: "notes", label: "Notes", icon: StickyNote },
                  { id: "ai", label: "LifeOS AI", icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${isActive
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-muted hover:text-foreground hover:bg-card/40"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] uppercase font-mono text-muted hidden lg:inline">Live Preview</span>
            </div>

            {/* Interactive Composition Preview */}
            <div className="min-h-[360px] md:min-h-[420px] rounded-2xl bg-card/60 border border-card-border/50 p-4 md:p-6 flex flex-col justify-between">
              {activeTab === "dashboard" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-border/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">◈</div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Good Morning, Jay</h4>
                        <p className="text-[11px] text-muted">Here is your high-priority execution matrix for today</p>
                      </div>
                    </div>
                    <GlassBadge variant="accent">3 Focus Tasks</GlassBadge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassCard className="p-4 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-muted flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Focus Task</span>
                      <span className="text-xs font-bold text-foreground truncate">Finalize Next.js Auth Middleware</span>
                      <GlassBadge variant="accent" className="text-[9px] w-fit">Urgent</GlassBadge>
                    </GlassCard>
                    <GlassCard className="p-4 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-muted flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Habit Routine</span>
                      <span className="text-xs font-bold text-foreground">Daily Deep Work • 90m</span>
                      <span className="text-[11px] text-emerald-400 font-medium">14 Day Streak</span>
                    </GlassCard>
                    <GlassCard className="p-4 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-muted flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-sky-400" /> AI Recommendation</span>
                      <span className="text-xs font-medium text-foreground">Schedule morning focus block before 11:00 AM.</span>
                    </GlassCard>
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-border/30">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">PriorityQueue Sorting</span>
                    <span className="text-[11px] text-muted">3 Tasks Pending</span>
                  </div>
                  {[
                    { title: "Review MongoDB Atlas Index Constraints", priority: "urgent", due: "Today" },
                    { title: "Verify Gemini API Server-Side Rate Limiter", priority: "high", due: "Tomorrow" },
                    { title: "Refine Glassmorphism CSS Micro-Animations", priority: "medium", due: "Aug 15" },
                  ].map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-card/80 border border-card-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-foreground">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted font-mono">{t.due}</span>
                        <GlassBadge variant="accent" className="text-[9px] uppercase">{t.priority}</GlassBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "habits" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <GlassCard className="p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Morning Deep Work</span>
                      <span className="text-amber-400 text-xs font-bold flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> 14 Days</span>
                    </div>
                    <p className="text-[11px] text-muted">90 minutes uninterrupted architecture focus</p>
                    <GlassBadge variant="success" className="w-fit">Done Today</GlassBadge>
                  </GlassCard>

                  <GlassCard className="p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Daily Engineering Journal</span>
                      <span className="text-amber-400 text-xs font-bold flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> 7 Days</span>
                    </div>
                    <p className="text-[11px] text-muted">Document architectural decisions & key learnings</p>
                    <GlassBadge variant="default" className="w-fit">Pending</GlassBadge>
                  </GlassCard>
                </div>
              )}

              {activeTab === "goals" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-card/80 border border-card-border flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Quarterly Objective: Launch LifeOS Command Center v1.0</span>
                      <span className="font-bold text-accent">80%</span>
                    </div>
                    <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full w-[80%]" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted pt-2 border-t border-border/30">
                      <span>✓ Phase 1 Foundation</span>
                      <span>✓ Phase 2 Core Layer</span>
                      <span>✓ Phase 5 Gemini AI</span>
                      <span className="text-foreground font-semibold">● Phase 7 Public Auth</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in duration-200">
                  <div className="md:col-span-4 p-3 rounded-xl bg-card/60 border border-card-border flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-foreground truncate">System Architecture Spec</span>
                    <span className="text-[10px] text-muted truncate">MongoDB Atlas, Mongoose schemas, Auth.js...</span>
                  </div>
                  <div className="md:col-span-8 p-4 rounded-xl bg-card/80 border border-card-border flex flex-col gap-2">
                    <span className="text-xs font-bold text-foreground">LifeOS Knowledge Note</span>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Knowledge notes feature debounced autosave indicators, tag indexing, and contextual search in a visionOS glass workspace.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-xs text-foreground font-medium">LifeOS Intelligence • Powered by Google Gemini 3.5 Flash</span>
                  </div>
                  <div className="p-4 rounded-xl bg-card/80 border border-card-border flex flex-col gap-2">
                    <span className="text-xs font-semibold text-accent">User: What should I focus on today?</span>
                    <p className="text-xs text-muted leading-relaxed">
                      &quot;Based on your 3 urgent tasks and 14-day streak, focus on completing your Auth Middleware review before 11:30 AM.&quot;
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border/30 flex items-center justify-between text-[11px] text-muted">
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-emerald-400" /> Private Session Protected</span>
                <Link href="/register" className="text-accent hover:underline font-medium flex items-center gap-1">
                  Try LifeOS Workspace <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* 4. CORE FEATURES */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-3">
            <GlassBadge variant="accent">Complete Workspace Architecture</GlassBadge>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Built for Total Clarity
            </h2>
            <p className="text-sm md:text-base text-muted max-w-2xl">
              Every tool you need to plan, execute, track, and optimize your personal output in one cohesive operating environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CheckSquare,
                title: "Tasks & Priority Queue",
                description: "Organize tasks with PriorityQueue heap sorting, custom priority tags, and due date filters.",
              },
              {
                icon: Repeat,
                title: "Habit Routine Tracker",
                description: "Build consistency with streak protection, daily log tracking, and target weekly frequencies.",
              },
              {
                icon: Target,
                title: "Quarterly Goals",
                description: "Set high-level goals with incremental milestone checklists and real-time percentage progress bars.",
              },
              {
                icon: StickyNote,
                title: "Knowledge Base Notes",
                description: "Capture thoughts, tag ideas, and edit notes with debounced auto-saving and instant search.",
              },
              {
                icon: Calendar,
                title: "Schedule Timeline",
                description: "Map focus sessions, deep work blocks, and daily events onto a clear chronological timeline.",
              },
              {
                icon: Sparkles,
                title: "LifeOS AI Intelligence",
                description: "Contextual assistant powered by Google Gemini 2.5 Flash that understands your workspace data.",
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <GlassCard key={idx} hoverEffect className="p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{f.description}</p>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* 5. AI INTELLIGENCE SECTION */}
        <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <GlassPanel className="p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden border-sky-500/20">
            <div className="flex flex-col gap-3 max-w-2xl">
              <GlassBadge variant="accent" className="w-fit gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Powered by Google Gemini 2.5 Flash
              </GlassBadge>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                LifeOS Intelligence
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                An intelligent assistant that connects to your private workspace context — analyzing your focus tasks, habit streaks, goals, and schedule without exposing data.
              </p>
            </div>

            {/* Prompt Cards Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { prompt: "What should I focus on today?", badge: "Daily Priority" },
                { prompt: "Plan my afternoon schedule block.", badge: "Schedule AI" },
                { prompt: "How am I progressing toward my goals?", badge: "Goal Coach" },
                { prompt: "Summarize my weekly output.", badge: "Weekly Review" },
              ].map((p, idx) => (
                <GlassCard key={idx} hoverEffect className="p-4 flex flex-col gap-3 justify-between">
                  <GlassBadge variant="accent" className="w-fit text-[9px] uppercase">{p.badge}</GlassBadge>
                  <p className="text-xs font-semibold text-foreground italic">&quot;{p.prompt}&quot;</p>
                  <span className="text-[10px] text-accent font-mono flex items-center gap-1">
                    Query Gemini <ArrowRight className="w-3 h-3" />
                  </span>
                </GlassCard>
              ))}
            </div>
          </GlassPanel>
        </section>

        {/* 6. PRODUCTIVITY WORKFLOW */}
        <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-3">
            <GlassBadge variant="accent">Simple 3-Step Flow</GlassBadge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              How LifeOS Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Capture & Organize", desc: "Add tasks, log daily habits, write notes, and schedule timeline events into your private command center." },
              { step: "02", title: "Synthesize & Assist", desc: "LifeOS Intelligence analyzes your active workload and provides daily focus recommendations." },
              { step: "03", title: "Execute & Progress", desc: "Complete tasks, protect habit streaks, and track quarterly milestone progress with zero friction." },
            ].map((w, idx) => (
              <GlassPanel key={idx} className="p-6 md:p-8 flex flex-col gap-4 relative">
                <span className="font-mono text-3xl font-extrabold text-accent/40">{w.step}</span>
                <h3 className="font-display font-bold text-lg text-foreground">{w.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{w.desc}</p>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* 7. SECURITY & PRIVACY */}
        <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <GlassPanel className="p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 border-emerald-500/20">
            <div className="flex flex-col gap-4 max-w-xl">
              <GlassBadge variant="success" className="w-fit gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Isolated Workspace Security
              </GlassBadge>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Your Data Belongs to You
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                LifeOS enforces authenticated session boundary checks, server-side API verification, MongoDB Atlas collection isolation, and server-only Gemini API key execution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              <div className="p-4 rounded-xl bg-card/60 border border-card-border flex flex-col gap-1">
                <span className="text-xs font-bold text-foreground">MongoDB Atlas</span>
                <span className="text-[11px] text-muted">Dedicated `lifeos` database</span>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-card-border flex flex-col gap-1">
                <span className="text-xs font-bold text-foreground">Server-Side Gemini</span>
                <span className="text-[11px] text-muted">No API keys exposed</span>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-card-border flex flex-col gap-1">
                <span className="text-xs font-bold text-foreground">Zod Validation</span>
                <span className="text-[11px] text-muted">Strict payload verification</span>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-card-border flex flex-col gap-1">
                <span className="text-xs font-bold text-foreground">Auth.js / NextAuth</span>
                <span className="text-[11px] text-muted">Session JWT protection</span>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* 8. PRODUCT STATISTICS */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "5", label: "Productivity Modules" },
              { num: "10+", label: "Server-Side AI Routes" },
              { num: "100%", label: "User-Owned Data" },
              { num: "0", label: "Third-Party Data Tracking" },
            ].map((s, idx) => (
              <GlassPanel key={idx} className="p-6 flex flex-col gap-1">
                <span className="font-display font-extrabold text-3xl md:text-4xl text-accent">{s.num}</span>
                <span className="text-xs text-muted font-medium">{s.label}</span>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* 9. PRIMARY CTA BANNER */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <GlassPanel className="p-10 md:p-16 flex flex-col items-center gap-6 relative overflow-hidden border-cyan-500/30">
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl leading-tight">
              Your personal operating system starts here.
            </h2>
            <p className="text-sm text-muted max-w-md">
              Create your account in seconds and structure your tasks, habits, goals, notes, and AI assistant into one workspace.
            </p>
            <Link href="/register">
              <GlassButton variant="primary" size="lg" className="px-10 py-3 text-sm font-semibold shadow-glass-lg gap-2">
                Create your LifeOS <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          </GlassPanel>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer className="w-full border-t border-border/40 bg-background/80 py-8 px-4 sm:px-6 lg:px-8 z-10 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <div className="w-5 h-5 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs">◈</div>
            <span>LifeOS — Personal Command Center</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <a href="#security" className="hover:text-foreground transition-colors">Privacy & Security</a>
          </div>
          <span className="font-mono text-[11px] text-muted">© 2026 LifeOS. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
