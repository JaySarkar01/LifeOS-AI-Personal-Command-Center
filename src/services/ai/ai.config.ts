export const AI_CONFIG = {
  get apiKey(): string {
    return process.env.GEMINI_API_KEY || "";
  },
  get model(): string {
    return process.env.GEMINI_MODEL || "gemini-3.5-flash";
  },
  timeoutMs: 30000,
  rateLimitWindowMs: 60000, // 1 minute
  maxChatRequestsPerMinute: 20,
  maxInsightRequestsPerHour: 30,
  maxActionExecutionsPerMinute: 10,
};
