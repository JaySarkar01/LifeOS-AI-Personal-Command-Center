import { Task } from "@/models/domain/Task";
import { PriorityQueue } from "@/lib/structures/PriorityQueue";
import { ISortStrategy, PrioritySortStrategy } from "@/lib/patterns/strategies/SortStrategy";

export class TaskService {
  public static buildUrgencyQueue(tasks: Task[]): PriorityQueue<Task> {
    const pq = new PriorityQueue<Task>(true);
    const now = new Date();

    for (const task of tasks) {
      if (task.status !== "completed" && task.status !== "archived") {
        const priorityScore = task.calculatePriorityScore(now);
        pq.enqueue(task, priorityScore);
      }
    }

    return pq;
  }

  public static filterOverdueTasks(tasks: Task[], now: Date = new Date()): Task[] {
    return tasks.filter((task) => task.isOverdue(now));
  }

  public static sortTasks(tasks: Task[], strategy: ISortStrategy = new PrioritySortStrategy()): Task[] {
    return strategy.sort(tasks);
  }

  public static calculateCompletionRate(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  }
}
