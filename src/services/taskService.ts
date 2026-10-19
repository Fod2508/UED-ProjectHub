import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { KanbanTask, TaskStatus } from "../types";

export const taskService = {
  /**
   * Create a new task
   */
  async createTask(
    taskData: Omit<KanbanTask, "id" | "code">,
    groupId: string,
    createdBy: string,
  ): Promise<{ id: string; code: string }> {
    const tasksRef = collection(db, "tasks");

    // Generate task code
    const existingTasks = await this.getGroupTasks(groupId);
    const taskNumber = existingTasks.length + 1;
    const taskCode = `#TSK-${String(taskNumber).padStart(2, "0")}`;

    const docRef = await addDoc(tasksRef, {
      ...taskData,
      code: taskCode,
      groupId,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, code: taskCode };
  },

  /**
   * Get all tasks for a specific group
   */
  async getGroupTasks(groupId: string): Promise<KanbanTask[]> {
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("groupId", "==", groupId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as KanbanTask[];
  },

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    updates: Partial<KanbanTask>,
  ): Promise<void> {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  },

  /**
   * Move task to new status
   */
  async moveTask(taskId: string, newStatus: TaskStatus): Promise<void> {
    await this.updateTask(taskId, { status: newStatus });
  },

  /**
   * Subscribe to real-time updates for group tasks
   */
  subscribeToGroupTasks(
    groupId: string,
    callback: (tasks: KanbanTask[]) => void,
  ): () => void {
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("groupId", "==", groupId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as KanbanTask[];

      callback(tasks);
    });

    return unsubscribe;
  },
};
