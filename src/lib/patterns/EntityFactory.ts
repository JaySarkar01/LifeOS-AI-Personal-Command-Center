import { Task, TaskProps } from "@/models/domain/Task";
import { Habit, HabitProps } from "@/models/domain/Habit";
import { Goal, GoalProps } from "@/models/domain/Goal";
import { Note, NoteProps } from "@/models/domain/Note";
import { Event, EventProps } from "@/models/domain/Event";
import { User, UserProps } from "@/models/domain/User";

export class EntityFactory {
  private static generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  public static createTask(props: Omit<TaskProps, "id"> & { id?: string }): Task {
    return new Task({
      id: props.id || this.generateId("tsk"),
      ...props,
    });
  }

  public static createHabit(props: Omit<HabitProps, "id"> & { id?: string }): Habit {
    return new Habit({
      id: props.id || this.generateId("hbt"),
      ...props,
    });
  }

  public static createGoal(props: Omit<GoalProps, "id"> & { id?: string }): Goal {
    return new Goal({
      id: props.id || this.generateId("gol"),
      ...props,
    });
  }

  public static createNote(props: Omit<NoteProps, "id"> & { id?: string }): Note {
    return new Note({
      id: props.id || this.generateId("nte"),
      ...props,
    });
  }

  public static createEvent(props: Omit<EventProps, "id"> & { id?: string }): Event {
    return new Event({
      id: props.id || this.generateId("evt"),
      ...props,
    });
  }

  public static createUser(props: Omit<UserProps, "id"> & { id?: string }): User {
    return new User({
      id: props.id || this.generateId("usr"),
      ...props,
    });
  }
}
