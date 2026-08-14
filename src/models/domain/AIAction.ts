export type AIActionType =
  | "CREATE_TASK"
  | "UPDATE_TASK"
  | "COMPLETE_TASK"
  | "CREATE_HABIT"
  | "COMPLETE_HABIT"
  | "CREATE_NOTE"
  | "UPDATE_NOTE"
  | "CREATE_GOAL"
  | "UPDATE_GOAL"
  | "ADD_GOAL_MILESTONE"
  | "CREATE_EVENT"
  | "UPDATE_EVENT"
  | "DELETE_EVENT";

export type AIActionEntityType = "task" | "habit" | "note" | "goal" | "event";

export type AIActionStatus =
  | "proposed"
  | "confirmed"
  | "executing"
  | "success"
  | "failed"
  | "cancelled";

export interface AIActionProps<T = Record<string, unknown>> {
  id?: string;
  type: AIActionType;
  entityType?: AIActionEntityType;
  payload: T;
  reason?: string;
  requiresConfirmation?: boolean;
  status?: AIActionStatus;
  resultEntityId?: string;
  createdAt?: Date;
}

export class AIAction<T = Record<string, unknown>> {
  public readonly id: string;
  public readonly type: AIActionType;
  public readonly entityType: AIActionEntityType;
  public payload: T;
  public reason: string;
  public requiresConfirmation: boolean;
  public status: AIActionStatus;
  public resultEntityId?: string;
  public readonly createdAt: Date;

  constructor(props: AIActionProps<T>) {
    this.id = props.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.type = props.type;
    this.entityType = props.entityType || this.inferEntityType(props.type);
    this.payload = props.payload;
    this.reason = props.reason || "Action suggested by LifeOS Intelligence";
    this.requiresConfirmation = props.requiresConfirmation !== undefined ? props.requiresConfirmation : true;
    this.status = props.status || "proposed";
    this.resultEntityId = props.resultEntityId;
    this.createdAt = props.createdAt || new Date();
  }

  private inferEntityType(type: AIActionType): AIActionEntityType {
    if (type.endsWith("_TASK")) return "task";
    if (type.endsWith("_HABIT")) return "habit";
    if (type.endsWith("_NOTE")) return "note";
    if (type.endsWith("_GOAL") || type === "ADD_GOAL_MILESTONE") return "goal";
    if (type.endsWith("_EVENT")) return "event";
    return "task";
  }

  public isDestructive(): boolean {
    return this.type === "DELETE_EVENT";
  }

  public markExecuting(): void {
    this.status = "executing";
  }

  public markSuccess(resultEntityId?: string): void {
    this.status = "success";
    if (resultEntityId) {
      this.resultEntityId = resultEntityId;
    }
  }

  public markFailed(): void {
    this.status = "failed";
  }

  public markCancelled(): void {
    this.status = "cancelled";
  }
}
