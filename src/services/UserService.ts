import { User } from "@/models/domain/User";

export class UserService {
  public static isTargetFocusAchieved(user: User, actualFocusMinutes: number): boolean {
    return actualFocusMinutes >= user.preferences.dailyFocusTargetMinutes;
  }
}
