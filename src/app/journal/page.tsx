"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Save,
  Trash2,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { pageTransition } from "@/lib/motion";
import type { JournalMood } from "@/types";

/* ─── Types ─── */
interface JournalEntryItem {
  id: string;
  date: string; // YYYY-MM-DD
  mood: JournalMood;
  content: string;
  highlights: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Mood Config ─── */
const MOODS: { value: JournalMood; emoji: string; label: string; color: string }[] = [
  { value: "great", emoji: "🤩", label: "Great", color: "text-emerald-400" },
  { value: "good", emoji: "😊", label: "Good", color: "text-sky-400" },
  { value: "neutral", emoji: "😐", label: "Neutral", color: "text-amber-400" },
  { value: "low", emoji: "😔", label: "Low", color: "text-orange-400" },
  { value: "bad", emoji: "😞", label: "Bad", color: "text-red-400" },
];

const MOOD_DOT_COLORS: Record<JournalMood, string> = {
  great: "bg-emerald-400",
  good: "bg-sky-400",
  neutral: "bg-amber-400",
  low: "bg-orange-400",
  bad: "bg-red-400",
};

/* ─── Helpers ─── */
function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getDayNum(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getDate();
}

function generateDateRange(centerDate: Date, range: number): string[] {
  const dates: string[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    dates.push(toDateStr(d));
  }
  return dates;
}

/* ─── Component ─── */
export default function JournalPage() {
  const { showToast } = useToast();

  // Data state
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Navigation state
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [stripCenter, setStripCenter] = useState(new Date());
  const stripDates = generateDateRange(stripCenter, 6); // 13 days visible

  // Editor state
  const [editorMood, setEditorMood] = useState<JournalMood>("neutral");
  const [editorContent, setEditorContent] = useState("");
  const [editorHighlights, setEditorHighlights] = useState<string[]>([]);
  const [editorTags, setEditorTags] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  /* ─── Data Fetching ─── */
  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/journal");
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (err) {
      console.error("Failed to load journal entries:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  /* ─── Sync editor to selected date ─── */
  const selectedEntry = entries.find((e) => e.date === selectedDate);

  useEffect(() => {
    if (selectedEntry) {
      setEditorMood(selectedEntry.mood);
      setEditorContent(selectedEntry.content);
      setEditorHighlights(selectedEntry.highlights || []);
      setEditorTags(selectedEntry.tags ? selectedEntry.tags.join(", ") : "");
    } else {
      setEditorMood("neutral");
      setEditorContent("");
      setEditorHighlights([]);
      setEditorTags("");
    }
  }, [selectedDate, selectedEntry]);

  /* ─── Save / Upsert ─── */
  const handleSave = async () => {
    setIsSaving(true);
    const tagsArray = editorTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      date: selectedDate,
      mood: editorMood,
      content: editorContent,
      highlights: editorHighlights,
      tags: tagsArray,
    };

    try {
      if (selectedEntry) {
        // Update existing
        const res = await fetch(`/api/journal/${selectedEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setEntries((prev) =>
            prev.map((e) => (e.id === selectedEntry.id ? data.data : e))
          );
          showToast("Entry Saved", undefined, "success");
        }
      } else {
        // Create new
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setEntries((prev) => [data.data, ...prev]);
          showToast("Entry Created", undefined, "success");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to save entry", undefined, "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Delete ─── */
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast("Entry Deleted", undefined, "info");

    // Reset editor if deleting current entry
    if (selectedEntry?.id === id) {
      setEditorMood("neutral");
      setEditorContent("");
      setEditorHighlights([]);
      setEditorTags("");
    }

    try {
      await fetch(`/api/journal/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchEntries();
    }
  };

  /* ─── Highlights ─── */
  const addHighlight = () => {
    const trimmed = newHighlight.trim();
    if (trimmed && !editorHighlights.includes(trimmed)) {
      setEditorHighlights((prev) => [...prev, trimmed]);
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setEditorHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  /* ─── Date Navigation ─── */
  const shiftStrip = (direction: number) => {
    const next = new Date(stripCenter);
    next.setDate(next.getDate() + direction * 7);
    setStripCenter(next);
  };

  const entryMap = new Map(entries.map((e) => [e.date, e]));
  const today = toDateStr(new Date());
  const isToday = selectedDate === today;

  return (
    <AppShell>
      <PageContainer>
        <motion.div
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col gap-8 md:gap-10"
        >
          <PageHeader
            badge="Life Module"
            badgeIcon={BookOpen}
            title="Journal"
            description="Daily reflections, mindful observations, and personal progress logs."
            actions={
              selectedEntry ? (
                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTargetId(selectedEntry.id)}
                    className="gap-1.5 text-muted hover:text-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? "Saving..." : "Save"}
                  </GlassButton>
                </div>
              ) : (
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {isSaving ? "Creating..." : "New Entry"}
                </GlassButton>
              )
            }
          />

          {isLoading ? (
            <ListSkeleton count={3} />
          ) : (
            <div className="flex flex-col gap-6">
              {/* ═══ Date Strip ═══ */}
              <GlassPanel className="p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => shiftStrip(-1)}
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card/60 transition-colors shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                    {stripDates.map((dateStr) => {
                      const isSelected = dateStr === selectedDate;
                      const entry = entryMap.get(dateStr);
                      const isFuture = dateStr > today;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => !isFuture && setSelectedDate(dateStr)}
                          disabled={isFuture}
                          className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl min-w-[52px] transition-all duration-200 ${
                            isSelected
                              ? "bg-accent/15 border border-accent/30 text-foreground scale-105"
                              : isFuture
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:bg-card/60 text-muted hover:text-foreground cursor-pointer"
                          }`}
                        >
                          <span className="text-[10px] font-medium leading-none">
                            {getDayLabel(dateStr)}
                          </span>
                          <span
                            className={`text-base font-bold leading-none ${
                              isSelected ? "text-accent" : ""
                            }`}
                          >
                            {getDayNum(dateStr)}
                          </span>
                          {/* Mood dot indicator */}
                          <div className="h-1.5 flex items-center">
                            {entry ? (
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  MOOD_DOT_COLORS[entry.mood]
                                }`}
                              />
                            ) : (
                              <div className="w-1.5 h-1.5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => shiftStrip(1)}
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card/60 transition-colors shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected date label */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                  <span className="text-xs font-semibold text-foreground">
                    {formatDisplayDate(selectedDate)}
                  </span>
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <GlassBadge variant="accent" className="text-[9px]">
                        Today
                      </GlassBadge>
                    )}
                    {selectedEntry && (
                      <GlassBadge variant="success" className="text-[9px]">
                        Entry Saved
                      </GlassBadge>
                    )}
                  </div>
                </div>
              </GlassPanel>

              {/* ═══ Main Editor Area ═══ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Editor Panel */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Mood Selector */}
                  <GlassCard className="p-5 md:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          How are you feeling?
                        </span>
                        <span className="text-[11px] text-muted">
                          {MOODS.find((m) => m.value === editorMood)?.label || "Neutral"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {MOODS.map((mood) => {
                          const isActive = editorMood === mood.value;
                          return (
                            <button
                              key={mood.value}
                              onClick={() => setEditorMood(mood.value)}
                              className={`relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                isActive
                                  ? "bg-accent/12 border border-accent/30 scale-110"
                                  : "hover:bg-card/60 border border-transparent hover:border-card-border/60"
                              }`}
                            >
                              <span className="text-2xl">{mood.emoji}</span>
                              <span
                                className={`text-[10px] font-semibold ${
                                  isActive ? mood.color : "text-muted"
                                }`}
                              >
                                {mood.label}
                              </span>
                              {isActive && (
                                <motion.div
                                  layoutId="mood-indicator"
                                  className={`absolute -bottom-1 w-5 h-0.5 rounded-full ${MOOD_DOT_COLORS[mood.value]}`}
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>

                  {/* Content Editor */}
                  <GlassPanel className="flex-1 flex flex-col gap-4 p-6 md:p-8">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Daily Reflection
                        </span>
                      </div>
                      <span className="text-[10px] text-muted font-mono">
                        {editorContent.length} characters
                      </span>
                    </div>

                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      placeholder="How was your day? What did you learn? What are you grateful for? Write freely..."
                      className="flex-1 w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none resize-none leading-relaxed min-h-[280px] pt-2"
                    />

                    {/* Tags */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                      <span className="text-[10px] uppercase font-semibold text-muted shrink-0">
                        Tags:
                      </span>
                      <input
                        type="text"
                        value={editorTags}
                        onChange={(e) => setEditorTags(e.target.value)}
                        placeholder="gratitude, learning, goals (comma separated)"
                        className="bg-transparent text-xs text-muted focus:text-foreground focus:outline-none flex-1 transition-colors"
                      />
                    </div>
                  </GlassPanel>
                </div>

                {/* Right: Highlights & Stats */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Highlights Panel */}
                  <GlassCard className="p-5 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Highlights
                        </span>
                      </div>
                      <span className="text-[10px] text-muted">
                        {editorHighlights.length} moments
                      </span>
                    </div>

                    {/* Add highlight input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addHighlight();
                          }
                        }}
                        placeholder="Add a highlight..."
                        className="flex-1 bg-card/60 border border-card-border rounded-lg text-xs px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
                      />
                      <button
                        onClick={addHighlight}
                        disabled={!newHighlight.trim()}
                        className="p-2 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Highlights list */}
                    <AnimatePresence mode="popLayout">
                      {editorHighlights.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-muted/60">
                          No highlights yet. Capture your key wins!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                          {editorHighlights.map((h, idx) => (
                            <motion.div
                              key={`${h}-${idx}`}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8 }}
                              className="flex items-start gap-2 p-2.5 rounded-lg bg-card/40 border border-card-border/50 group"
                            >
                              <span className="text-amber-400 text-[10px] mt-0.5 shrink-0">
                                ✦
                              </span>
                              <span className="text-xs text-foreground flex-1 leading-relaxed">
                                {h}
                              </span>
                              <button
                                onClick={() => removeHighlight(idx)}
                                className="p-0.5 rounded text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </GlassCard>

                  {/* Entry Stats */}
                  <GlassCard className="p-5 md:p-6 flex flex-col gap-3">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Journal Stats
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-card/40 border border-card-border/50">
                        <span className="font-display text-xl font-extrabold text-accent">
                          {entries.length}
                        </span>
                        <span className="text-[10px] text-muted font-medium">
                          Total Entries
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-card/40 border border-card-border/50">
                        <span className="font-display text-xl font-extrabold text-accent">
                          {calculateStreak(entries)}
                        </span>
                        <span className="text-[10px] text-muted font-medium">
                          Day Streak
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-card/40 border border-card-border/50">
                        <span className="font-display text-xl font-extrabold text-emerald-400">
                          {entries.filter((e) => e.mood === "great" || e.mood === "good").length}
                        </span>
                        <span className="text-[10px] text-muted font-medium">
                          Good Days
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-card/40 border border-card-border/50">
                        <span className="font-display text-xl font-extrabold text-amber-400">
                          {entries.reduce((sum, e) => sum + (e.highlights?.length || 0), 0)}
                        </span>
                        <span className="text-[10px] text-muted font-medium">
                          Highlights
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Recent Mood Flow */}
                  {entries.length > 0 && (
                    <GlassCard className="p-5 md:p-6 flex flex-col gap-3">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Mood Flow
                      </span>
                      <div className="flex items-end gap-1.5 h-16">
                        {entries
                          .slice(0, 14)
                          .reverse()
                          .map((entry, idx) => {
                            const moodHeight: Record<JournalMood, string> = {
                              great: "h-full",
                              good: "h-4/5",
                              neutral: "h-3/5",
                              low: "h-2/5",
                              bad: "h-1/5",
                            };
                            return (
                              <div
                                key={idx}
                                className="flex-1 flex flex-col items-center justify-end"
                              >
                                <div
                                  className={`w-full max-w-[12px] rounded-t-sm ${moodHeight[entry.mood]} ${MOOD_DOT_COLORS[entry.mood]} opacity-70`}
                                />
                              </div>
                            );
                          })}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-muted pt-1">
                        <span>Oldest</span>
                        <span>Recent</span>
                      </div>
                    </GlassCard>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteTargetId}
          title="Delete Journal Entry"
          description="Are you sure you want to delete this journal entry? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      </PageContainer>
    </AppShell>
  );
}

/* ─── Streak Calculator ─── */
function calculateStreak(entries: JournalEntryItem[]): number {
  if (entries.length === 0) return 0;

  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  const d = new Date();

  // Check today first
  if (!dates.has(toDateStr(d))) {
    // If no entry today, check if yesterday exists (streak still valid)
    d.setDate(d.getDate() - 1);
    if (!dates.has(toDateStr(d))) return 0;
  }

  // Count consecutive days backward
  while (dates.has(toDateStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return streak;
}
