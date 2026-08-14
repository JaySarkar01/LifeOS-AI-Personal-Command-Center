import { AIActionType, AIActionEntityType, AIActionStatus } from "@/models/domain/AIAction";

export interface AIActionItem<T = Record<string, unknown>> {
  id?: string;
  type: AIActionType;
  entityType?: AIActionEntityType;
  payload: T;
  reason?: string;
  requiresConfirmation?: boolean;
  status?: AIActionStatus;
  resultEntityId?: string;
}

export interface SuggestedAction {
  id?: string;
  type: AIActionType | "CREATE_TASK";
  entityType?: AIActionEntityType;
  status?: "pending" | "confirmed" | "cancelled" | AIActionStatus;
  data: {
    title?: string;
    dueDate?: string; // YYYY-MM-DD
    priority?: string;
    [key: string]: unknown;
  };
  payload?: Record<string, unknown>;
  reason?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
  suggestedAction?: SuggestedAction;
  actions?: AIActionItem[];
}

export interface LifeOSTodayContext {
  date: string;
  userName: string;
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string;
  }>;
  habits: Array<{
    id: string;
    title: string;
    streak: number;
    completedToday: boolean;
  }>;
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    status: string;
  }>;
  schedule: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    type: string;
  }>;
}

export interface AIInsightResult {
  headline: string;
  insight: string;
  actionableTip: string;
}

export interface AIDailySummaryResult {
  summary: string;
  priorities: Array<{ title: string; reason: string }>;
  warnings: string[];
  suggestions: string[];
}

export interface AIWeekReviewResult {
  summary: string;
  taskCompletionRate: number;
  habitConsistency: string;
  biggestWin: string;
  biggestBlocker: string;
  recommendation: string;
}

export interface AIDayPlanBlock {
  start: string;
  end: string;
  type: string;
  title: string;
  reason: string;
}

export interface AIDayPlanResult {
  summary: string;
  blocks: AIDayPlanBlock[];
}

export interface AITaskPlanItem {
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  reason: string;
}

export interface AITaskPlanResult {
  planTitle: string;
  suggestedTasks: AITaskPlanItem[];
}

export interface AIGoalCoachResult {
  status: string;
  whatIsGoingWell: string;
  blockers: string;
  recommendedNextStep: string;
}

export interface AIHabitCoachResult {
  habitTitle: string;
  currentStreak: number;
  assessment: string;
  practicalSuggestions: string[];
}
