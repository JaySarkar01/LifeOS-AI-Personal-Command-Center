import { Goal } from "@/models/domain/Goal";

export class GoalService {
  public static calculateOverallProgress(goals: Goal[]): number {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((acc, g) => acc + g.calculateProgress(), 0);
    return Math.round(totalProgress / goals.length);
  }

  public static getOverdueGoals(goals: Goal[], now: Date = new Date()): Goal[] {
    return goals.filter((g) => g.isOverdue(now));
  }
}
