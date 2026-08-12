import assert from "node:assert";
import { EntityFactory } from "../src/lib/patterns/EntityFactory";
import { PriorityQueue } from "../src/lib/structures/PriorityQueue";
import { EntityMap } from "../src/lib/structures/EntityMap";
import { Tree } from "../src/lib/structures/Tree";
import { ActionHistory } from "../src/lib/structures/ActionHistory";
import { PrioritySortStrategy, DueDateSortStrategy } from "../src/lib/patterns/strategies/SortStrategy";
import { TaskService } from "../src/services/TaskService";
import { DomainEventEmitter } from "../src/lib/patterns/Observer";
import { CreateTaskSchema } from "../src/validators/index";

console.log("🧪 Starting LifeOS Core Data Layer Test Suite...\n");

// 1. Task Domain Methods
console.log("Testing Task Domain Methods...");
const now = new Date();
const pastDate = new Date(now.getTime() - 1000 * 60 * 60 * 24); // Yesterday
const futureDate = new Date(now.getTime() + 1000 * 60 * 60 * 24); // Tomorrow

const task1 = EntityFactory.createTask({
  userId: "usr_1",
  title: "Test Task 1",
  priority: "urgent",
  dueDate: pastDate,
});

assert.strictEqual(task1.status, "todo");
assert.strictEqual(task1.isOverdue(now), true, "Past task should be overdue");

task1.markComplete();
assert.strictEqual(task1.status, "completed");
assert.strictEqual(task1.isOverdue(now), false, "Completed task is no longer overdue");

const task2 = EntityFactory.createTask({
  userId: "usr_1",
  title: "Test Task 2",
  priority: "low",
  dueDate: futureDate,
});

assert.strictEqual(task2.isOverdue(now), false);
assert(task1.calculatePriorityScore(now) > task2.calculatePriorityScore(now), "Urgent task should score higher than low priority task");
console.log("✅ Task Domain Methods passed!");

// 2. Habit Domain Methods & Streak
console.log("\nTesting Habit Streak Calculation...");
const habit = EntityFactory.createHabit({
  userId: "usr_1",
  title: "Daily Meditation",
});

const today = new Date();
const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24);

habit.recordCompletion(yesterday);
habit.recordCompletion(today);
assert.strictEqual(habit.calculateStreak(today), 2, "Streak should equal 2 consecutive days");
assert.strictEqual(habit.isCompletedToday(today), true);
console.log("✅ Habit Streak Calculation passed!");

// 3. Goal Domain & Milestones
console.log("\nTesting Goal Milestone Progress...");
const goal = EntityFactory.createGoal({
  userId: "usr_1",
  title: "Launch LifeOS Product",
});

const ms1 = goal.addMilestone("Design system");
const ms2 = goal.addMilestone("Data layer");

assert.strictEqual(goal.calculateProgress(), 0);
ms1.completed = true;
assert.strictEqual(goal.calculateProgress(), 50);
ms2.completed = true;
assert.strictEqual(goal.calculateProgress(), 100);
assert.strictEqual(goal.status, "achieved");
console.log("✅ Goal Progress Calculation passed!");

// 4. Priority Queue Structure
console.log("\nTesting PriorityQueue (Binary Heap)...");
const pq = new PriorityQueue<string>(true);
pq.enqueue("Low task", 10);
pq.enqueue("Critical task", 90);
pq.enqueue("Medium task", 50);

assert.strictEqual(pq.peek(), "Critical task");
assert.strictEqual(pq.dequeue(), "Critical task");
assert.strictEqual(pq.dequeue(), "Medium task");
assert.strictEqual(pq.dequeue(), "Low task");
assert.strictEqual(pq.isEmpty(), true);
console.log("✅ PriorityQueue Binary Heap passed!");

// 5. EntityMap O(1) Structure
console.log("\nTesting EntityMap O(1) Lookup...");
const map = new EntityMap([task1, task2]);
assert.strictEqual(map.size, 2);
assert.strictEqual(map.get(task1.id)?.title, "Test Task 1");
map.delete(task1.id);
assert.strictEqual(map.has(task1.id), false);
console.log("✅ EntityMap passed!");

// 6. Tree N-ary Navigation
console.log("\nTesting Tree Structure...");
interface Folder { id: string; name: string; }
const tree = new Tree<Folder>({ id: "root", name: "LifeOS Root" });
tree.addChild("root", { id: "p1", name: "Work" });
tree.addChild("p1", { id: "p1_sub", name: "Frontend" });

const found = tree.find("p1_sub");
assert.notStrictEqual(found, null);
assert.strictEqual(found?.data.name, "Frontend");

let visitedCount = 0;
tree.traverseDFS(() => { visitedCount++; });
assert.strictEqual(visitedCount, 3);
console.log("✅ Tree Structure & Traversal passed!");

// 7. Action History Stack (Undo)
console.log("\nTesting ActionHistory (Undo Stack)...");
const history = new ActionHistory<string>();
let undoneValue = "";

history.push({
  type: "TASK_DELETE",
  data: "Task XYZ",
  undoHandler: () => { undoneValue = "Task XYZ"; },
});

assert.strictEqual(history.size(), 1);
const undoneAction = history.undo();
assert.strictEqual(undoneAction?.type, "TASK_DELETE");
assert.strictEqual(undoneValue, "Task XYZ");
assert.strictEqual(history.size(), 0);
console.log("✅ ActionHistory Undo Stack passed!");

// 8. Sorting Strategies
console.log("\nTesting Sorting Strategies...");
const tasksList = [task2, task1]; // task1 is urgent, task2 is low priority
const sortedByPriority = TaskService.sortTasks(tasksList, new PrioritySortStrategy());
assert.strictEqual(sortedByPriority[0].id, task1.id, "Urgent task should come first");

const sortedByDueDate = TaskService.sortTasks(tasksList, new DueDateSortStrategy());
assert.strictEqual(sortedByDueDate[0].id, task1.id, "Past due date task should come first");
console.log("✅ Sorting Strategies passed!");

// 9. Observer Pattern
console.log("\nTesting Observer Domain Event Emitter...");
const emitter = new DomainEventEmitter();
let receivedPayload = "";

const unsubscribe = emitter.subscribe<{ message: string }>("TASK_COMPLETED", (event) => {
  receivedPayload = event.payload.message;
});

emitter.publish("TASK_COMPLETED", { message: "Task 1 complete" });
assert.strictEqual(receivedPayload, "Task 1 complete");

unsubscribe();
emitter.publish("TASK_COMPLETED", { message: "Task 2 complete" });
assert.strictEqual(receivedPayload, "Task 1 complete", "Unsubscribed listener should not execute");
console.log("✅ Observer Domain Event Emitter passed!");

// 10. Zod Validation
console.log("\nTesting Zod Validation Schemas...");
const validTaskPayload = {
  userId: "usr_123",
  title: "Valid Zod Task",
  priority: "high",
};
const parsed = CreateTaskSchema.safeParse(validTaskPayload);
assert.strictEqual(parsed.success, true);

const invalidTaskPayload = {
  userId: "usr_123",
  title: "", // Empty title fails min(1) validation
};
const invalidParsed = CreateTaskSchema.safeParse(invalidTaskPayload);
assert.strictEqual(invalidParsed.success, false);
console.log("✅ Zod Validation Schemas passed!");

console.log("\n🎉 ALL LIFEOS PHASE 2 CORE DATA LAYER TESTS PASSED SUCCESSFULLY!\n");
