import { wrapUntrustedContent } from "./system";

export function buildGoalCoachPrompt(goalData: unknown): string {
  const safeData = wrapUntrustedContent("GOAL_DATA", JSON.stringify(goalData, null, 2));

  return `
Analyze the following goal and its milestones progress:
${safeData}

You MUST return valid JSON matching this schema:
{
  "status": "Brief status sentence",
  "whatIsGoingWell": "Positive progress observation",
  "blockers": "Potential risk or delay",
  "recommendedNextStep": "Specific immediate action step"
}
`;
}

export function buildHabitCoachPrompt(habitData: unknown): string {
  const safeData = wrapUntrustedContent("HABIT_DATA", JSON.stringify(habitData, null, 2));

  return `
Analyze the following habit routine and streak history:
${safeData}

You MUST return valid JSON matching this schema:
{
  "habitTitle": "Habit Title",
  "currentStreak": 0,
  "assessment": "Assessment of consistency",
  "practicalSuggestions": ["Tip 1", "Tip 2"]
}
`;
}
