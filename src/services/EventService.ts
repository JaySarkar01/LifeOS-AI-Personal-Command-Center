import { Event } from "@/models/domain/Event";

export class EventService {
  public static getUpcomingEvents(events: Event[], now: Date = new Date()): Event[] {
    return events
      .filter((e) => e.isUpcoming(now))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  public static calculateTotalFocusMinutes(events: Event[]): number {
    return events
      .filter((e) => e.type === "focus_session")
      .reduce((acc, e) => acc + e.getDuration(), 0);
  }
}
