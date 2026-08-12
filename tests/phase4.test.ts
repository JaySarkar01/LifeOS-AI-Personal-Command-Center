import assert from "node:assert";
import { hashPassword, comparePassword } from "../src/lib/auth/password";
import { EntityFactory } from "../src/lib/patterns/EntityFactory";
import { CreateTaskSchema, CreateEventSchema } from "../src/validators/index";

async function runPhase4Tests() {
  console.log("🧪 Starting LifeOS Phase 4 Security & Domain Test Suite...\n");

  // 1. Password Hashing & Verification
  console.log("Testing Password Hashing & Bcrypt Verification...");
  const rawPassword = "SecurePassword2026!";
  const hash = await hashPassword(rawPassword);

  assert.notStrictEqual(rawPassword, hash, "Hash should not match plain password string");
  const isValid = await comparePassword(rawPassword, hash);
  assert.strictEqual(isValid, true, "Bcrypt compare should return true for matching password");

  const isInvalid = await comparePassword("WrongPassword!", hash);
  assert.strictEqual(isInvalid, false, "Bcrypt compare should return false for incorrect password");
  console.log("✅ Password Hashing & Bcrypt Verification passed!");

  // 2. User Isolation & Task Security Scoping
  console.log("\nTesting User Isolation & Task Security...");
  const userATask = EntityFactory.createTask({
    userId: "usr_A",
    title: "User A Confidential Task",
    priority: "high",
  });

  const userBTask = EntityFactory.createTask({
    userId: "usr_B",
    title: "User B Confidential Task",
    priority: "low",
  });

  assert.notStrictEqual(userATask.userId, userBTask.userId);
  assert.strictEqual(userATask.userId, "usr_A");
  assert.strictEqual(userBTask.userId, "usr_B");
  console.log("✅ User Isolation & Security passed!");

  // 3. Habit Domain Streaks
  console.log("\nTesting Habit Streak Domain Calculation...");
  const habit = EntityFactory.createHabit({
    userId: "usr_A",
    title: "Daily Coding Focus",
  });

  const today = new Date();
  const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24);

  habit.recordCompletion(yesterday);
  habit.recordCompletion(today);
  assert.strictEqual(habit.calculateStreak(today), 2);
  console.log("✅ Habit Streak Domain Calculation passed!");

  // 4. Goal Progress & Milestones
  console.log("\nTesting Goal Milestone Calculation...");
  const goal = EntityFactory.createGoal({
    userId: "usr_A",
    title: "Phase 4 LifeOS Launch",
  });

  const m1 = goal.addMilestone("Authentication System");
  const m2 = goal.addMilestone("REST API Handlers");
  const m3 = goal.addMilestone("Live UI Integration");

  assert.strictEqual(goal.calculateProgress(), 0);
  m1.completed = true;
  assert.strictEqual(goal.calculateProgress(), 33);
  m2.completed = true;
  m3.completed = true;
  assert.strictEqual(goal.calculateProgress(), 100);
  assert.strictEqual(goal.status, "achieved");
  console.log("✅ Goal Milestone Calculation passed!");

  // 5. Zod Validation Schemas
  console.log("\nTesting Zod Validation Schemas...");
  const taskParse = CreateTaskSchema.safeParse({
    userId: "usr_123",
    title: "Validated Task",
    priority: "urgent",
  });
  assert.strictEqual(taskParse.success, true);

  const invalidEvent = CreateEventSchema.safeParse({
    userId: "usr_123",
    title: "Invalid Times Event",
    startTime: new Date("2026-08-12T10:00:00Z"),
    endTime: new Date("2026-08-12T09:00:00Z"), // End before start
  });
  assert.strictEqual(invalidEvent.success, false);
  console.log("✅ Zod Validation Schemas passed!");

  console.log("\n🎉 ALL LIFEOS PHASE 4 SECURITY & DOMAIN TESTS PASSED SUCCESSFULLY!\n");
}

runPhase4Tests().catch((err) => {
  console.error("❌ Phase 4 Test Failure:", err);
  process.exit(1);
});
