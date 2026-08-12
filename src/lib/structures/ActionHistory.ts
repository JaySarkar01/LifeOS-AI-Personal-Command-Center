export interface Action<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: Date;
  undoHandler?: () => void;
}

/**
 * Action / Undo Stack History Structure
 */
export class ActionHistory<T = unknown> {
  private stack: Action<T>[] = [];
  private limit: number;

  constructor(limit: number = 50) {
    this.limit = limit;
  }

  public push(action: Omit<Action<T>, "id" | "timestamp"> & { id?: string; timestamp?: Date }): Action<T> {
    const fullAction: Action<T> = {
      id: action.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: action.timestamp || new Date(),
      ...action,
    };

    this.stack.push(fullAction);
    if (this.stack.length > this.limit) {
      this.stack.shift();
    }
    return fullAction;
  }

  public undo(): Action<T> | undefined {
    const action = this.stack.pop();
    if (action && action.undoHandler) {
      action.undoHandler();
    }
    return action;
  }

  public peek(): Action<T> | undefined {
    return this.stack[this.stack.length - 1];
  }

  public clear(): void {
    this.stack = [];
  }

  public size(): number {
    return this.stack.length;
  }
}
