import { DomainEvent } from "@/types";

export type EventListener<T = unknown> = (event: DomainEvent<T>) => void;

/**
 * Lightweight Domain Event Observer
 */
export class DomainEventEmitter {
  private listeners: Map<string, Set<EventListener<unknown>>> = new Map();

  public subscribe<T = unknown>(eventType: string, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener as EventListener<unknown>);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventType, listener);
    };
  }

  public unsubscribe<T = unknown>(eventType: string, listener: EventListener<T>): void {
    const set = this.listeners.get(eventType);
    if (set) {
      set.delete(listener as EventListener<unknown>);
      if (set.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  public publish<T = unknown>(eventType: string, payload: T): void {
    const set = this.listeners.get(eventType);
    if (!set) return;

    const event: DomainEvent<T> = {
      eventType,
      timestamp: new Date(),
      payload,
    };

    set.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error(`Error in domain event listener for ${eventType}:`, err);
      }
    });
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const globalDomainEvents = new DomainEventEmitter();
