"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  section: "PRODUCTIVITY" | "KNOWLEDGE" | "INTELLIGENCE" | "LIFE" | "SYSTEM";
}

export interface SidebarNavProps {
  items: NavItemConfig[];
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ items, isCollapsed = false, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();
  const sections: NavItemConfig["section"][] = ["PRODUCTIVITY", "KNOWLEDGE", "INTELLIGENCE", "LIFE", "SYSTEM"];

  return (
    <nav className="flex flex-col gap-5" role="menu">
      {sections.map((section) => {
        const sectionItems = items.filter((i) => i.section === section);
        if (sectionItems.length === 0) return null;

        return (
          <div key={section} className="flex flex-col gap-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-semibold text-muted/70 tracking-widest uppercase mb-1">
                {section}
              </span>
            )}
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-200 select-none cursor-pointer group",
                    isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "w-full",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted hover:text-foreground hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-accent" : "text-muted/80")} />
                  {!isCollapsed && <span>{item.label}</span>}

                  {/* Active Indicator Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 -z-10 rounded-xl bg-accent/12 dark:bg-accent/15 border border-accent/25 shadow-[0_2px_12px_rgba(56,189,248,0.1)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
