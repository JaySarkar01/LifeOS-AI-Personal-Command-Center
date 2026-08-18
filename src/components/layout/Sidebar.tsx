"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
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
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav, NavItemConfig } from "@/components/layout/SidebarNav";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { signOut } from "next-auth/react";

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const navItems: NavItemConfig[] = [
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

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 border-r border-panel-border/60 bg-panel/25 backdrop-blur-2xl backdrop-saturate-150 py-6 justify-between shrink-0 overflow-x-hidden z-20"
    >
      <div className="flex flex-col gap-6 px-4">
        {/* Brand Header & Collapse Toggle */}
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glass shrink-0 transition-transform group-hover:scale-105">
              <span className="font-display font-extrabold text-xs text-accent-foreground">◈</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-display font-bold tracking-tight text-foreground text-sm leading-none">LifeOS</span>
                <span className="text-[9px] text-muted font-medium tracking-wider uppercase mt-0.5">Command Center</span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg bg-card/60 border border-card-border text-muted hover:text-foreground focus:outline-none transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Reusable Nav Block */}
        <SidebarNav items={navItems} isCollapsed={isCollapsed} />
      </div>

      {/* Footer */}
      <div className={cn("px-4 pt-4 border-t border-border/40 flex flex-col gap-3", isCollapsed ? "items-center" : "")}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && <span className="text-[11px] text-muted font-medium">Appearance</span>}
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-2.5 rounded-xl text-xs font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer",
            isCollapsed ? "justify-center p-2" : "px-3 py-2"
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
