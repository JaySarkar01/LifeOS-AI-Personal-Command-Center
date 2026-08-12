import { GoalStatus, Milestone } from "@/types";

export interface GoalProps {
  id: string;
  userId: string;
  title: string;
  targetDate?: Date;
  status?: GoalStatus;
  milestones?: Milestone[];
  createdAt?: Date;
}

export class Goal {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public targetDate?: Date;
  public status: GoalStatus;
  public milestones: Milestone[];
  public readonly createdAt: Date;

  constructor(props: GoalProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.targetDate = props.targetDate;
    this.status = props.status || "in_progress";
    this.milestones = props.milestones || [];
    this.createdAt = props.createdAt || new Date();
  }

  public calculateProgress(): number {
    if (this.milestones.length === 0) {
      return this.status === "achieved" ? 100 : 0;
    }
    const completedCount = this.milestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / this.milestones.length) * 100);
    
    if (progress === 100 && this.status !== "achieved") {
      this.status = "achieved";
    }
    return progress;
  }

  public isOverdue(now: Date = new Date()): boolean {
    if (!this.targetDate || this.status === "achieved") {
      return false;
    }
    return this.targetDate.getTime() < now.getTime();
  }

  public addMilestone(title: string, targetDate?: Date): Milestone {
    const milestone: Milestone = {
      id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      completed: false,
      targetDate,
    };
    this.milestones.push(milestone);
    return milestone;
  }
}
