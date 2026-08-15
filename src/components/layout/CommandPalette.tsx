"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  LayoutDashboard, 
  CheckSquare, 
  Repeat, 
  Calendar, 
  Target, 
  StickyNote, 
  Sparkles, 
  BookOpen, 
  CreditCard, 
  Settings, 
  Palette, 
  Sun, 
  Moon, 
  X,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/ThemeProvider";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions" | "System";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { id: "nav-dash", title: "Open Dashboard", category: "Navigation", icon: LayoutDashboard, action: () => router.push("/") },
    { id: "nav-tasks", title: "Open Tasks", category: "Navigation", icon: CheckSquare, action: () => router.push("/tasks") },
    { id: "nav-habits", title: "Open Habits", category: "Navigation", icon: Repeat, action: () => router.push("/habits") },
    { id: "nav-sched", title: "Open Schedule", category: "Navigation", icon: Calendar, action: () => router.push("/schedule") },
    { id: "nav-goals", title: "Open Goals", category: "Navigation", icon: Target, action: () => router.push("/goals") },
    { id: "nav-notes", title: "Open Notes", category: "Navigation", icon: StickyNote, action: () => router.push("/notes") },
    { id: "nav-ai", title: "Open AI Assistant", category: "Navigation", icon: Sparkles, action: () => router.push("/ai") },
    { id: "nav-journal", title: "Open Journal", category: "Navigation", icon: BookOpen, action: () => router.push("/journal") },
    { id: "nav-finance", title: "Open Finance", category: "Navigation", icon: CreditCard, action: () => router.push("/finance") },
    { id: "nav-ds", title: "Open Design System", category: "System", icon: Palette, action: () => router.push("/design-system") },
    { id: "nav-set", title: "Open Settings", category: "System", icon: Settings, action: () => router.push("/settings") },
    { id: "act-theme", title: `Switch Theme (Current: ${theme})`, category: "Quick Actions", icon: theme === "dark" ? Sun : Moon, action: () => setTheme(theme === "dark" ? "light" : "dark") },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setTimeout(() => setSelectedIndex(0), 0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => setQuery(""), 0);
    }
  }, [isOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/75 backdrop-blur-xl"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-xl rounded-2xl bg-panel border border-panel-border shadow-glass-lg backdrop-blur-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
          >
            {/* Search Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
              <Search className="w-4 h-4 text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, navigation, actions..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted hover:text-foreground focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command Options List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {filteredCommands.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted">
                  No command results matching &quot;{query}&quot;
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer w-full text-left",
                        isSelected
                          ? "bg-accent/12 text-foreground font-semibold border border-accent/25"
                          : "text-muted hover:text-foreground hover:bg-card/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-4 h-4", isSelected ? "text-accent" : "text-muted")} />
                        <span>{cmd.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted font-medium">{cmd.category}</span>
                        {isSelected && <ArrowRight className="w-3 h-3 text-accent" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2.5 border-t border-border/40 text-[10px] text-muted flex items-center justify-between bg-card/20">
              <div className="flex items-center gap-2">
                <span><kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground font-mono">↵</kbd> select</span>
              </div>
              <span><kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground font-mono">esc</kbd> close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
