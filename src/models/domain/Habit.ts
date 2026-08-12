import { HabitFrequency } from "@/types";

export interface HabitProps {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency?: HabitFrequency;
  targetDaysPerWeek?: number;
  color?: string;
  archived?: boolean;
  streak?: number;
  completionLogs?: Date[];
  createdAt?: Date;
}

export class Habit {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public description?: string;
  public frequency: HabitFrequency;
  public targetDaysPerWeek: number;
  public color?: string;
  public archived: boolean;
  public streak: number;
  public completionDates: Date[];
  public readonly createdAt: Date;

  constructor(props: HabitProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description;
    this.frequency = props.frequency || "daily";
    this.targetDaysPerWeek = props.targetDaysPerWeek || 7;
    this.color = props.color;
    this.archived = props.archived || false;
    this.streak = props.streak || 0;
    this.completionDates = props.completionLogs || [];
    this.createdAt = props.createdAt || new Date();
  }

  public isCompletedToday(now: Date = new Date()): boolean {
    const todayStr = now.toISOString().split("T")[0];
    return this.completionDates.some(
      (d) => new Date(d).toISOString().split("T")[0] === todayStr
    );
  }

  public recordCompletion(date: Date = new Date()): void {
    if (!this.isCompletedToday(date)) {
      this.completionDates.push(date);
      this.calculateStreak(date);
    }
  }

  public calculateStreak(relativeDate: Date = new Date()): number {
    if (this.completionDates.length === 0) {
      this.streak = 0;
      return 0;
    }

    const sortedDates = [...this.completionDates]
      .map((d) => new Date(d).toISOString().split("T")[0])
      .sort((a, b) => (a > b ? -1 : 1));

    const uniqueDates = Array.from(new Set(sortedDates));
    let count = 0;
    const checkDate = new Date(relativeDate);

    for (let i = 0; i < uniqueDates.length; i++) {
      const targetStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(targetStr)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // If relativeDate is today and not completed yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split("T")[0];
        if (uniqueDates.includes(yesterdayStr)) {
          count++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    this.streak = count;
    return count;
  }
}
