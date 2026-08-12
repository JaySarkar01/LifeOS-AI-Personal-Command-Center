"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  LayoutDashboard, 
  CheckSquare, 
  Repeat, 
  Calendar, 
  Target, 
  StickyNote, 
  Sparkles, 
  BookOpen, 
  CreditCard, 
  Palette, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  section: "PRODUCTIVITY" | "KNOWLEDGE" | "INTELLIGENCE" | "LIFE" | "SYSTEM";
}

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { id: "dash", label: "Overview", icon: LayoutDashboard, href: "/dashboard", section: "PRODUCTIVITY" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks", section: "PRODUCTIVITY" },
    { id: "habits", label: "Habits", icon: Repeat, href: "/habits", section: "PRODUCTIVITY" },
    { id: "sched", label: "Schedule", icon: Calendar, href: "/schedule", section: "PRODUCTIVITY" },
    { id: "goals", label: "Goals", icon: Target, href: "/goals", section: "PRODUCTIVITY" },
    
    { id: "notes", label: "Notes", icon: StickyNote, href: "/notes", section: "KNOWLEDGE" },
    
    { id: "ai", label: "AI Assistant", icon: Sparkles, href: "/ai", section: "INTELLIGENCE" },
    
    { id: "journal", label: "Journal", icon: BookOpen, href: "/journal", section: "LIFE" },
    { id: "finance", label: "Finance", icon: CreditCard, href: "/finance", section: "LIFE" },

    { id: "ds", label: "Design System", icon: Palette, href: "/design-system", section: "SYSTEM" },
    { id: "set", label: "Settings", icon: Settings, href: "/settings", section: "SYSTEM" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const sections: NavItem["section"][] = ["PRODUCTIVITY", "KNOWLEDGE", "INTELLIGENCE", "LIFE", "SYSTEM"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Slide-over Glass Sheet Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-[85%] max-w-sm h-full bg-panel border-l border-panel-border shadow-glass-lg backdrop-blur-2xl p-6 flex flex-col justify-between overflow-y-auto z-10"
          >
            <div className="flex flex-col gap-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold font-display">
                    ◈
                  </div>
                  <span className="font-display font-bold text-sm tracking-tight text-foreground">LifeOS Menu</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-card/60 border border-card-border text-muted hover:text-foreground focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Sections */}
              <nav className="flex flex-col gap-5">
                {sections.map((sec) => {
                  const items = navItems.filter((i) => i.section === sec);
                  if (items.length === 0) return null;

                  return (
                    <div key={sec} className="flex flex-col gap-1">
                      <span className="px-3 text-[10px] font-semibold text-muted/70 tracking-widest uppercase mb-1">
                        {sec}
                      </span>
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                              isActive
                                ? "bg-accent/12 text-accent font-semibold border border-accent/25"
                                : "text-muted hover:text-foreground hover:bg-card/40"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Appearance</span>
              <ThemeToggle />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
