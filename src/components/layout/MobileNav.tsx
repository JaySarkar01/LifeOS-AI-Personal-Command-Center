"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Repeat, 
  StickyNote, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileNav() {
  const pathname = usePathname();

  const items: DockItem[] = [
    { id: "dash", label: "Overview", href: "/", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare },
    { id: "habits", label: "Habits", href: "/habits", icon: Repeat },
    { id: "notes", label: "Notes", href: "/notes", icon: StickyNote },
    { id: "ai", label: "AI", href: "/ai", icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[92%] max-w-sm pointer-events-auto">
      <div className="bg-panel/85 border border-panel-border/80 rounded-2xl shadow-glass-lg backdrop-blur-2xl px-3 py-2 flex justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer select-none",
                isActive ? "text-accent font-semibold" : "text-muted hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] mt-0.5 leading-none">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveDock"
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
