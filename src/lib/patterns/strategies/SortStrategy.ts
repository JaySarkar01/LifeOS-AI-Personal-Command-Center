import { Task } from "@/models/domain/Task";

export interface ISortStrategy {
  name: string;
  sort(tasks: Task[]): Task[];
}

export class PrioritySortStrategy implements ISortStrategy {
  public name = "Priority";

  public sort(tasks: Task[]): Task[] {
    const now = new Date();
    return [...tasks].sort(
      (a, b) => b.calculatePriorityScore(now) - a.calculatePriorityScore(now)
    );
  }
}

export class DueDateSortStrategy implements ISortStrategy {
  public name = "DueDate";

  public sort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }
}

export class CreatedDateSortStrategy implements ISortStrategy {
  public name = "CreatedDate";

  public sort(tasks: Task[]): Task[] {
    return [...tasks].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}
