"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, Menu, Sparkles, LogOut, Settings } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export interface TopBarProps {
  onOpenCommandPalette: () => void;
  onOpenMobileDrawer: () => void;
}

export function TopBar({ onOpenCommandPalette, onOpenMobileDrawer }: TopBarProps) {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <>
      {/* DESKTOP TOP BAR (≥ 1024px) */}
      <header className="hidden lg:flex items-center justify-between gap-4 py-4 px-8 border-b border-panel-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-30">
        {/* Search & Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between gap-4 px-4 py-2 rounded-xl bg-card/70 border border-card-border/80 text-xs text-muted hover:text-foreground hover:border-accent/30 backdrop-blur-md w-72 md:w-80 transition-all cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
            <span>Search or command...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded-md bg-foreground/10 text-[10px] font-mono font-semibold text-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-muted text-accent border border-accent/20 text-xs font-semibold hover:bg-accent/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Actions</span>
          </button>

          <button
            className="p-2 rounded-xl bg-card/70 border border-card-border text-muted hover:text-foreground backdrop-blur-md transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </button>

          {/* User Profile Avatar Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-accent-foreground font-display text-xs font-bold shadow-glass select-none cursor-pointer hover:scale-105 transition-transform"
              title={userName}
            >
              {initials}
            </button>

            {/* Profile Glass Menu */}
            {isProfileOpen && (
              <div
                onClick={() => setIsProfileOpen(false)}
                className="fixed inset-0 z-40"
              />
            )}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-panel border border-panel-border shadow-glass-lg backdrop-blur-2xl p-2 z-50 flex flex-col gap-1 text-xs">
                <div className="px-3 py-2 border-b border-border/40 flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground truncate">{userName}</span>
                  <span className="text-[10px] text-muted truncate">{userEmail}</span>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-foreground hover:bg-card/50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted" />
                  <span>Settings & Preferences</span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-left w-full cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE TOP BAR (< 1024px) */}
      <header className="flex lg:hidden items-center justify-between px-5 py-3.5 border-b border-panel-border/60 bg-background/75 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6.5 h-6.5 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold font-display">
            ◈
          </div>
          <span className="font-display font-bold tracking-tight text-foreground text-sm">LifeOS</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCommandPalette}
            className="p-2 rounded-lg bg-card/60 border border-card-border text-muted hover:text-foreground focus:outline-none"
            aria-label="Search command palette"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenMobileDrawer}
            className="p-2 rounded-lg bg-card/60 border border-card-border text-foreground hover:text-accent focus:outline-none"
            aria-label="Open menu drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
}
