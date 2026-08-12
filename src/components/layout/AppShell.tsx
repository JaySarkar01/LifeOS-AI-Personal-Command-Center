"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Repeat, 
  StickyNote, 
  Calendar, 
  Target, 
  Sparkles, 
  Settings,
  Palette,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  section: "productivity" | "knowledge" | "intelligence" | "system";
}

export interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isDesignSystemRoute = pathname === "/design-system";

  const navItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, section: "productivity" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, section: "productivity" },
    { id: "habits", label: "Habits", icon: Repeat, section: "productivity" },
    { id: "schedule", label: "Schedule", icon: Calendar, section: "productivity" },
    { id: "goals", label: "Goals", icon: Target, section: "productivity" },
    
    { id: "notes", label: "Notes", icon: StickyNote, section: "knowledge" },
    
    { id: "assistant", label: "AI Assistant", icon: Sparkles, section: "intelligence" },

    { id: "design-system", label: "Design System", icon: Palette, href: "/design-system", section: "system" },
    { id: "settings", label: "Settings", icon: Settings, section: "system" },
  ];

  const renderSection = (section: NavItem["section"], title: string) => {
    const items = navItems.filter((i) => i.section === section);
    if (items.length === 0) return null;

    return (
      <div className="flex flex-col gap-1">
        <span className="px-3 text-[10px] font-semibold text-muted/70 tracking-widest uppercase mb-1">
          {title}
        </span>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href 
            ? pathname === item.href 
            : activeTab === item.id && !isDesignSystemRoute;

          const content = (
            <>
              <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-accent" : "text-muted/80")} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveNav"
                  className="absolute inset-0 -z-10 rounded-lg bg-accent/12 dark:bg-accent/15 border border-accent/25 shadow-[0_2px_12px_rgba(56,189,248,0.1)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200 select-none cursor-pointer",
                  isActive ? "text-foreground font-semibold" : "text-muted hover:text-foreground hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                )}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200 select-none cursor-pointer text-left focus:outline-none",
                isActive ? "text-foreground font-semibold" : "text-muted hover:text-foreground hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
              )}
            >
              {content}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-background">
      {/* AMBIENT BACKGROUND GLOW SPOTS (Multi-layered, soft, non-intrusive) */}
      <div className="fixed top-[-15%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-[0.06] dark:opacity-[0.09] blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,var(--color-accent-secondary)_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-[140px] pointer-events-none -z-10" />

      {/* DESKTOP SIDEBAR (Floating Translucent Glass Panel) */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 border-r border-panel-border/60 bg-panel/25 backdrop-blur-2xl backdrop-saturate-150 px-5 py-7 justify-between shrink-0">
        <div className="flex flex-col gap-6">
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glass transition-transform group-hover:scale-105">
              <span className="font-display font-extrabold text-xs text-accent-foreground">◈</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold tracking-tight text-foreground text-sm leading-none">LifeOS</span>
              <span className="text-[9px] text-muted font-medium tracking-wider uppercase mt-0.5">Command Center</span>
            </div>
          </Link>

          {/* Nav Sections */}
          <nav className="flex flex-col gap-5 mt-2" role="menu">
            {renderSection("productivity", "PRODUCTIVITY")}
            {renderSection("knowledge", "KNOWLEDGE")}
            {renderSection("intelligence", "INTELLIGENCE")}
          </nav>
        </div>

        {/* Bottom System & Appearance */}
        <div className="flex flex-col gap-4 pt-4 border-t border-border/40">
          {renderSection("system", "SYSTEM")}
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-[11px] text-muted font-medium">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* TABLET SIDEBAR */}
      <aside className="hidden md:flex lg:hidden flex-col w-[76px] h-screen sticky top-0 border-r border-panel-border/60 bg-panel/25 backdrop-blur-2xl px-3 py-6 justify-between items-center shrink-0">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glass">
            <span className="font-display font-bold text-sm text-accent-foreground">◈</span>
          </Link>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href ? pathname === item.href : activeTab === item.id;
              
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "relative w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer",
                      isActive ? "text-accent bg-accent/10" : "text-muted hover:text-foreground"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "relative w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer",
                    isActive ? "text-accent bg-accent/10" : "text-muted hover:text-foreground"
                  )}
                  title={item.label}
                >
                  <Icon className="w-4.5 h-4.5" />
                </button>
              );
            })}
          </nav>
        </div>

        <ThemeToggle />
      </aside>

      {/* MOBILE HEADER */}
      <header className="flex md:hidden items-center justify-between px-5 py-3.5 border-b border-panel-border bg-background/70 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold">◈</div>
          <span className="font-display font-bold tracking-tight text-foreground text-sm">LifeOS</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-card border border-card-border text-foreground hover:text-accent focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[57px] left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-card-border z-30 py-5 px-6 md:hidden shadow-lg flex flex-col gap-4"
          >
            <nav className="flex flex-col gap-1" role="menu">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href ? pathname === item.href : activeTab === item.id;
                
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer w-full",
                        isActive ? "bg-accent/12 text-accent font-semibold" : "text-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer w-full text-left",
                      isActive ? "bg-accent/12 text-accent font-semibold" : "text-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* MOBILE FLOATING BOTTOM DOCK */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[92%] max-w-sm">
        <div className="bg-panel/85 border border-panel-border/80 rounded-xl shadow-glass-lg backdrop-blur-2xl px-3 py-2 flex justify-around items-center">
          {navItems.filter(item => ["overview", "tasks", "habits", "notes", "assistant"].includes(item.id)).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isDesignSystemRoute;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all cursor-pointer",
                  isActive ? "text-accent" : "text-muted hover:text-foreground"
                )}
                aria-label={item.label}
              >
                <Icon className="w-4.5 h-4.5" />
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveDock"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
