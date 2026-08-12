"use client";

import React, { useEffect, useState, useCallback } from "react";
import { StickyNote, Plus, Search, Trash2, ArrowLeft, Save } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [deleteNoteTargetId, setDeleteNoteTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Active Editor State
  const [activeTitle, setActiveTitle] = useState("");
  const [activeContent, setActiveContent] = useState("");
  const [activeTags, setActiveTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectNote = useCallback((note: NoteItem) => {
    setSelectedNoteId(note.id);
    setActiveTitle(note.title);
    setActiveContent(note.content);
    setActiveTags(note.tags ? note.tags.join(", ") : "");
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
        if (data.data.length > 0 && !selectedNoteId) {
          selectNote(data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNoteId, selectNote]);

  useEffect(() => {
    setTimeout(() => {
      fetchNotes();
    }, 0);
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          type: "quick",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [data.data, ...prev]);
        selectNote(data.data);
        showToast("Note Created", undefined, "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNoteId) return;
    setIsSaving(true);

    const tagsArray = activeTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch(`/api/notes/${selectedNoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeTitle,
          content: activeContent,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotes((prev) =>
          prev.map((n) => (n.id === selectedNoteId ? data.data : n))
        );
        showToast("Note Saved", undefined, "success");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteNote = async () => {
    if (!deleteNoteTargetId) return;
    const id = deleteNoteTargetId;
    setDeleteNoteTargetId(null);

    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
    showToast("Note Deleted", undefined, "info");

    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchNotes();
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="Knowledge Module"
          badgeIcon={StickyNote}
          title="Knowledge Workspace"
          description="Capture ideas, document notes, and tag your personal knowledge base."
          actions={
            <GlassButton variant="primary" size="sm" onClick={handleCreateNote} className="gap-1.5">
              <Plus className="w-4 h-4" /> New Note
            </GlassButton>
          }
        />

        {isLoading ? (
          <ListSkeleton count={4} />
        ) : notes.length === 0 ? (
          <EmptyState
            icon={StickyNote as React.ElementType}
            title="No notes captured"
            description="Create your first note to start building your personal knowledge repository."
            actionLabel="Create Note"
            onAction={handleCreateNote}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
            {/* Sidebar Notes List */}
            <div className={`lg:col-span-4 flex flex-col gap-4 ${selectedNoteId ? "hidden lg:flex" : "flex"}`}>
              <GlassInput
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                icon={Search}
              />

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-1">
                {filteredNotes.map((note) => {
                  const isSelected = note.id === selectedNoteId;
                  return (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex justify-between items-start group ${
                        isSelected
                          ? "bg-accent/15 border-accent/30 text-foreground font-medium"
                          : "bg-card/40 hover:bg-card/70 border-card-border/60 text-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2">
                        <span className="text-xs font-semibold truncate">{note.title || "Untitled Note"}</span>
                        <span className="text-[11px] text-muted truncate">
                          {note.content ? note.content.substring(0, 50) : "Empty note..."}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteNoteTargetId(note.id);
                        }}
                        className="p-1 rounded text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note Content Editor */}
            <div className={`lg:col-span-8 ${selectedNoteId ? "flex flex-col" : "hidden lg:flex"}`}>
              {selectedNote ? (
                <GlassPanel className="flex-1 flex flex-col gap-4 p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/40">
                    <button
                      onClick={() => setSelectedNoteId(null)}
                      className="lg:hidden p-1.5 rounded-lg text-muted hover:text-foreground flex items-center gap-1 text-xs"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <input
                      type="text"
                      value={activeTitle}
                      onChange={(e) => setActiveTitle(e.target.value)}
                      placeholder="Note Title..."
                      className="bg-transparent font-display font-bold text-xl text-foreground focus:outline-none flex-1"
                    />
                    <GlassButton variant="primary" size="sm" onClick={handleSaveNote} disabled={isSaving} className="gap-1.5">
                      <Save className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : "Save"}
                    </GlassButton>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-muted">Tags:</span>
                    <input
                      type="text"
                      value={activeTags}
                      onChange={(e) => setActiveTags(e.target.value)}
                      placeholder="work, architecture, ideas (comma separated)"
                      className="bg-transparent text-xs text-muted focus:outline-none flex-1"
                    />
                  </div>

                  <textarea
                    value={activeContent}
                    onChange={(e) => setActiveContent(e.target.value)}
                    placeholder="Write your note content here..."
                    className="flex-1 w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none resize-none leading-relaxed min-h-[350px] pt-2"
                  />
                </GlassPanel>
              ) : (
                <div className="flex-1 flex items-center justify-center p-12 text-center text-xs text-muted">
                  Select a note from the list to view or edit.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={!!deleteNoteTargetId}
          title="Delete Note"
          description="Are you sure you want to delete this note? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDeleteNote}
          onCancel={() => setDeleteNoteTargetId(null)}
        />
      </PageContainer>
    </AppShell>
  );
}
