import { Habit } from "@/models/domain/Habit";

export class HabitService {
  public static getActiveStreaks(habits: Habit[]): { habitId: string; streak: number }[] {
    return habits.map((h) => ({
      habitId: h.id,
      streak: h.calculateStreak(),
    }));
  }

  public static getPendingToday(habits: Habit[], now: Date = new Date()): Habit[] {
    return habits.filter((h) => !h.isCompletedToday(now));
  }
}
