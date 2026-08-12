import { Note } from "@/models/domain/Note";

export class NoteService {
  public static filterByTag(notes: Note[], tag: string): Note[] {
    const search = tag.toLowerCase().trim();
    return notes.filter((n) => n.tags.some((t) => t.toLowerCase() === search));
  }

  public static searchNotes(notes: Note[], query: string): Note[] {
    const q = query.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }
}
