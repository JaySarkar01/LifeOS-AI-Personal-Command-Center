"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Compass, 
  AlertCircle,
  Palette
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { pageTransition } from "@/lib/motion";

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const handleTestInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length > 0 && val.length < 3) {
      setInputError("Length must be at least 3 characters");
    } else {
      setInputError("");
    }
  };

  return (
    <AppShell>
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col gap-10"
      >
        <section className="flex flex-col gap-2 pb-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <GlassBadge variant="accent" className="gap-1">
              <Palette className="w-3 h-3" /> Design Tokens & Primitives
            </GlassBadge>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            LifeOS System Foundations
          </h1>
          <p className="text-sm text-muted max-w-xl">
            A developer preview of the typography hierarchy, visionOS-inspired glass surfaces, button states, inputs, badges, and tokens.
          </p>
        </section>

        {/* COMPONENT SHOWCASE */}
        <section className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Glass Surfaces & Controls */}
            <div className="flex flex-col gap-6">
              {/* Glass Cards Panel */}
              <GlassPanel className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Glass Card Primitive</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassCard className="p-4 flex flex-col gap-1">
                    <span className="text-xs font-bold text-foreground">Standard Layered Card</span>
                    <span className="text-xs text-muted">Translucent backdrop blur, subtle border, top luminosity edge.</span>
                  </GlassCard>
                  <GlassCard hoverEffect className="p-4 flex flex-col gap-1">
                    <span className="text-xs font-bold text-accent">Card With Hover Effect</span>
                    <span className="text-xs text-muted">Translates upward slightly, increases border tint and shadow on hover.</span>
                  </GlassCard>
                </div>
              </GlassPanel>

              {/* Glass Buttons Panel */}
              <GlassPanel className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Glass Button Primitives</span>
                <div className="flex flex-wrap gap-3">
                  <GlassButton variant="primary">Primary</GlassButton>
                  <GlassButton variant="secondary">Secondary</GlassButton>
                  <GlassButton variant="ghost">Ghost</GlassButton>
                  <GlassButton variant="danger">Danger</GlassButton>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <GlassButton variant="primary" size="sm">Small</GlassButton>
                  <GlassButton variant="secondary" size="md">Medium</GlassButton>
                  <GlassButton variant="secondary" size="lg">Large</GlassButton>
                  <GlassButton variant="secondary" disabled>Disabled State</GlassButton>
                </div>
              </GlassPanel>

              {/* Glass Badges Panel */}
              <GlassPanel className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Glass Badge Primitives</span>
                <div className="flex flex-wrap gap-2.5">
                  <GlassBadge variant="default">Default</GlassBadge>
                  <GlassBadge variant="accent">Accent</GlassBadge>
                  <GlassBadge variant="success">Success</GlassBadge>
                  <GlassBadge variant="danger">Danger</GlassBadge>
                </div>
              </GlassPanel>
            </div>

            {/* Right Column: Inputs & Typography */}
            <div className="flex flex-col gap-6">
              {/* Glass Inputs Panel */}
              <GlassPanel className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Glass Input Primitives</span>
                <div className="flex flex-col gap-4">
                  <GlassInput 
                    placeholder="Search command center..." 
                    icon={<Search className="w-4 h-4" />}
                    value={inputValue}
                    onChange={handleTestInput}
                    error={inputError}
                  />
                  <GlassInput 
                    placeholder="Disabled Input" 
                    icon={<Compass className="w-4 h-4" />}
                    disabled 
                  />
                  <GlassInput 
                    placeholder="Input displaying active error" 
                    icon={<AlertCircle className="w-4 h-4" />}
                    error="This field contains a custom validation error."
                  />
                </div>
              </GlassPanel>

              {/* Typography System */}
              <GlassPanel className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Typography Scale</span>
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col border-l-2 border-accent/30 pl-3">
                    <span className="text-[10px] text-muted font-mono mb-0.5">Display (Outfit Font)</span>
                    <span className="font-display text-3xl font-extrabold tracking-tight">LifeOS Display</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-accent/30 pl-3">
                    <span className="text-[10px] text-muted font-mono mb-0.5">H1 (Outfit Font)</span>
                    <span className="font-display text-2xl font-bold tracking-tight">Main Heading (H1)</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-accent/30 pl-3">
                    <span className="text-[10px] text-muted font-mono mb-0.5">H2 (Outfit Font)</span>
                    <span className="font-display text-lg font-semibold">Section Title (H2)</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-accent/30 pl-3">
                    <span className="text-[10px] text-muted font-mono mb-0.5">H3 (Outfit Font)</span>
                    <span className="font-display text-sm font-semibold">Subset Header (H3)</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-accent/30 pl-3">
                    <span className="text-[10px] text-muted font-mono mb-0.5">Body Large (Plus Jakarta Sans)</span>
                    <span className="font-sans text-sm leading-relaxed">This is Body Large styling. Perfect for main editorial introductions or high-priority descriptions.</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-accent/30 pl-3">
                    <span className="text-[10px] text-muted font-mono mb-0.5">Body (Plus Jakarta Sans)</span>
                    <span className="font-sans text-xs leading-relaxed text-foreground">This is standard Body styling. Recommended for description panels, task notes, schedules, and general text settings.</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-accent/30 pl-3">
                    <span className="text-[10px] text-muted font-mono mb-0.5">Caption & Small text</span>
                    <span className="font-sans text-[10px] text-muted font-semibold tracking-wider uppercase">Caption text style</span>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </section>
      </motion.div>
    </AppShell>
  );
}
