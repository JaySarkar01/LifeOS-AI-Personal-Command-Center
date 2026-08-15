import { JournalMood } from "@/types";

export interface JournalEntryProps {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood?: JournalMood;
  content?: string;
  highlights?: string[];
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class JournalEntry {
  public readonly id: string;
  public readonly userId: string;
  public date: string;
  public mood: JournalMood;
  public content: string;
  public highlights: string[];
  public tags: string[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: JournalEntryProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.date = props.date;
    this.mood = props.mood || "neutral";
    this.content = props.content || "";
    this.highlights = props.highlights || [];
    this.tags = props.tags || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public updateContent(newContent: string): void {
    this.content = newContent;
    this.updatedAt = new Date();
  }

  public setMood(mood: JournalMood): void {
    this.mood = mood;
    this.updatedAt = new Date();
  }

  public addHighlight(highlight: string): void {
    const trimmed = highlight.trim();
    if (trimmed && !this.highlights.includes(trimmed)) {
      this.highlights.push(trimmed);
      this.updatedAt = new Date();
    }
  }

  public removeHighlight(index: number): void {
    if (index >= 0 && index < this.highlights.length) {
      this.highlights.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public addTag(tag: string): void {
    const trimmed = tag.trim();
    if (trimmed && !this.tags.includes(trimmed)) {
      this.tags.push(trimmed);
      this.updatedAt = new Date();
    }
  }

  public removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }
}
