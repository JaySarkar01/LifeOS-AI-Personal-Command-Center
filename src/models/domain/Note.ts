import { NoteType } from "@/types";

export interface NoteProps {
  id: string;
  userId: string;
  title: string;
  content?: string;
  type?: NoteType;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Note {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public content: string;
  public type: NoteType;
  public tags: string[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: NoteProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.content = props.content || "";
    this.type = props.type || "quick";
    this.tags = props.tags || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public updateContent(newContent: string): void {
    this.content = newContent;
    this.updatedAt = new Date();
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
