import { taskService, milestoneService, userService } from "../services";
import {
  INITIAL_TASKS,
  INITIAL_MILESTONES,
  INITIAL_SCHEDULE_MATRIX,
} from "../data/initialData";

/**
 * Migrate initial demo data to Firestore
 * IMPORTANT: Only run this once per user to populate demo data
 */
export const migrateInitialDataToFirestore = async (
  userId: string,
  groupId: string = "nhom_04",
  courseId: string = "course_2024_2025",
) => {
  try {
    console.log("🔄 Starting migration to Firestore...");

    // 1. Migrate user schedule matrix
    console.log("📅 Migrating schedule matrix...");
    await userService.updateScheduleMatrix(userId, INITIAL_SCHEDULE_MATRIX);

    // 2. Migrate milestones
    console.log("🎯 Migrating milestones...");
    const milestonePromises = INITIAL_MILESTONES.map((milestone) =>
      milestoneService.createMilestone(milestone, courseId, userId),
    );
    await Promise.all(milestonePromises);

    // 3. Migrate tasks
    console.log("📋 Migrating tasks...");
    const taskPromises = INITIAL_TASKS.map((task) => {
      const { id, code, ...taskData } = task; // Remove id and code (will be generated)
      return taskService.createTask(taskData, groupId, userId);
    });
    await Promise.all(taskPromises);

    console.log("✅ Migration complete!");
    return { success: true };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return { success: false, error };
  }
};

/**
 * Check if user has already migrated data
 */
export const hasUserMigratedData = async (
  groupId: string,
): Promise<boolean> => {
  try {
    const tasks = await taskService.getGroupTasks(groupId);
    return tasks.length > 0;
  } catch (error) {
    console.error("Error checking migration status:", error);
    return false;
  }
};
