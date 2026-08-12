"use client";

import { useTheme, Theme } from "@/components/ui/ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  if (!mounted) {
    return (
      <div className="w-28 h-10 rounded-full bg-card border border-card-border animate-pulse" />
    );
  }

  const options = [
    { value: "light" as Theme, icon: Sun, label: "Light" },
    { value: "dark" as Theme, icon: Moon, label: "Dark" },
    { value: "system" as Theme, icon: Laptop, label: "System" },
  ];

  return (
    <div 
      className="relative flex p-1.5 rounded-full bg-card border border-card-border shadow-glass backdrop-blur-md"
      role="radiogroup"
      aria-label="Select color theme"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 cursor-pointer text-muted hover:text-foreground focus:outline-none",
              isActive && "text-accent-foreground dark:text-accent-foreground"
            )}
            role="radio"
            aria-checked={isActive}
            aria-label={`${opt.label} mode`}
          >
            <Icon className="w-4 h-4" />
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 -z-10 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
