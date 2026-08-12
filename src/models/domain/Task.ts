import { TaskPriority, TaskStatus } from "@/types";

export interface TaskProps {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedMinutes?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public description: string;
  public status: TaskStatus;
  public priority: TaskPriority;
  public dueDate?: Date;
  public estimatedMinutes: number;
  public tags: string[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description || "";
    this.status = props.status || "todo";
    this.priority = props.priority || "medium";
    this.dueDate = props.dueDate;
    this.estimatedMinutes = props.estimatedMinutes || 30;
    this.tags = props.tags || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public markComplete(): void {
    this.status = "completed";
    this.updatedAt = new Date();
  }

  public markIncomplete(): void {
    this.status = "todo";
    this.updatedAt = new Date();
  }

  public isOverdue(now: Date = new Date()): boolean {
    if (!this.dueDate || this.status === "completed" || this.status === "archived") {
      return false;
    }
    return this.dueDate.getTime() < now.getTime();
  }

  public calculatePriorityScore(now: Date = new Date()): number {
    let score = 0;
    
    // Base weight by priority
    switch (this.priority) {
      case "urgent": score += 100; break;
      case "high": score += 75; break;
      case "medium": score += 50; break;
      case "low": score += 25; break;
    }

    // Urgency weight by deadline proximity
    if (this.dueDate) {
      const msDiff = this.dueDate.getTime() - now.getTime();
      const hoursDiff = msDiff / (1000 * 60 * 60);

      if (hoursDiff < 0) {
        score += 50; // Overdue bonus urgency
      } else if (hoursDiff <= 24) {
        score += 30;
      } else if (hoursDiff <= 72) {
        score += 15;
      }
    }

    return score;
  }
}
