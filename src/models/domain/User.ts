import { UserPreferences } from "@/types";

export interface UserProps {
  id: string;
  email: string;
  name?: string;
  passwordHash?: string;
  preferences?: Partial<UserPreferences>;
  createdAt?: Date;
}

export class User {
  public readonly id: string;
  public email: string;
  public name?: string;
  public passwordHash?: string;
  public preferences: UserPreferences;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.passwordHash = props.passwordHash;
    this.preferences = {
      theme: "system",
      accentColor: "#0284c7",
      notificationsEnabled: true,
      dailyFocusTargetMinutes: 240,
      ...props.preferences,
    };
    this.createdAt = props.createdAt || new Date();
  }

  public updatePreferences(newPrefs: Partial<UserPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...newPrefs,
    };
  }

  public getDisplayName(): string {
    if (this.name && this.name.trim().length > 0) {
      return this.name;
    }
    return this.email.split("@")[0] || "User";
  }
}
