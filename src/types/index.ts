export type TaskStatus = "todo" | "in_progress" | "completed" | "archived";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type HabitFrequency = "daily" | "weekly" | "custom";
export type GoalStatus = "not_started" | "in_progress" | "achieved" | "paused";

export type EventType = "focus_session" | "meeting" | "reminder" | "personal";
export type NoteType = "quick" | "document" | "journal" | "code";
export type JournalMood = "great" | "good" | "neutral" | "low" | "bad";

export type TransactionType = "income" | "expense" | "transfer";
export type AccountType = "checking" | "savings" | "credit" | "cash";
export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  accentColor: string;
  notificationsEnabled: boolean;
  dailyFocusTargetMinutes: number;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: Date;
}

export interface HabitLogEntry {
  id: string;
  habitId: string;
  userId: string;
  date: Date;
  completed: boolean;
}

export interface DomainEvent<T = unknown> {
  eventType: string;
  timestamp: Date;
  payload: T;
}
