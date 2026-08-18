"use client";

import React, { useRef, useState, useEffect } from "react";
import { Sparkles, Calendar, Target, Repeat, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";

interface AIQuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  { text: "What should I focus on today?", icon: CheckSquare },
  { text: "Plan my schedule for today", icon: Calendar },
  { text: "Review my current goals", icon: Target },
  { text: "Check my habit streak momentum", icon: Repeat },
  { text: "Break down a big project into tasks", icon: Sparkles },
  { text: "Suggest a morning routine for high focus", icon: Sparkles },
  { text: "Summarize pending tasks and deadlines", icon: CheckSquare },
];

export function AIQuickPrompts({ onSelectPrompt, disabled }: AIQuickPromptsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // Mouse wheel horizontal conversion
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      if (Math.abs(e.deltaX) > 0) return; // native horizontal
      scrollRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  // Mouse Drag / Swipe on desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    scrollRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scrollByAmount = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(checkScroll, 200);
    }
  };

  return (
    <div className="relative flex items-center group/prompts w-full select-none">
      {/* Left Scroll Arrow for Desktop */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          className="hidden md:flex absolute left-0 z-10 w-6 h-6 items-center justify-center rounded-full bg-panel/90 border border-card-border shadow-glass text-muted hover:text-foreground backdrop-blur-md -translate-x-1 cursor-pointer transition-transform hover:scale-110"
          title="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Main Drag & Touch Scroll Track */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onScroll={checkScroll}
        className={`flex items-center gap-1.5 overflow-x-auto py-1 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <span className="text-[10px] font-semibold text-muted/70 uppercase flex items-center gap-1 shrink-0 mr-1 font-mono pointer-events-none">
          <Sparkles className="w-3 h-3 text-accent" /> Quick:
        </span>

        {PROMPTS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.text}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!isDragging) {
                  onSelectPrompt(p.text);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 hover:bg-card border border-card-border/70 hover:border-accent/40 text-foreground/80 hover:text-foreground text-xs font-medium whitespace-nowrap transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] shrink-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Icon className="w-3 h-3 text-accent/80 shrink-0" />
              <span>{p.text}</span>
            </button>
          );
        })}
      </div>

      {/* Right Scroll Arrow for Desktop */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          className="hidden md:flex absolute right-0 z-10 w-6 h-6 items-center justify-center rounded-full bg-panel/90 border border-card-border shadow-glass text-muted hover:text-foreground backdrop-blur-md translate-x-1 cursor-pointer transition-transform hover:scale-110"
          title="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
