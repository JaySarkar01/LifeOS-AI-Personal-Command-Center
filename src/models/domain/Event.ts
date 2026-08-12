import { EventType } from "@/types";

export interface EventProps {
  id: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type?: EventType;
  isAllDay?: boolean;
}

export class Event {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public startTime: Date;
  public endTime: Date;
  public type: EventType;
  public isAllDay: boolean;

  constructor(props: EventProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.startTime = new Date(props.startTime);
    this.endTime = new Date(props.endTime);
    this.type = props.type || "personal";
    this.isAllDay = props.isAllDay || false;
  }

  public isUpcoming(now: Date = new Date()): boolean {
    return this.startTime.getTime() > now.getTime();
  }

  public getDuration(): number {
    const diffMs = this.endTime.getTime() - this.startTime.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60))); // Duration in minutes
  }
}
