"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { CommandPalette } from "@/components/layout/CommandPalette";

export interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Keyboard shortcut listener for Cmd + K / Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Ambient background light glows */}
      <div className="fixed top-[-15%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-[0.06] dark:opacity-[0.09] blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,var(--color-accent-secondary)_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-[140px] pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Viewport Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <TopBar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />

        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <MobileNav />

      {/* Mobile Slide-Over Sheet Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
