import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Milestone } from "../types";

// Dữ liệu cũ trong Firestore còn lưu tên trạng thái "Đang mở (Nước rút)";
// đọc lên thì quy về tên chuẩn "Đang mở".
function normalizeMilestone(data: Record<string, unknown>): Milestone {
  const m = data as unknown as Milestone;
  return (m.status as string) === "Đang mở (Nước rút)"
    ? { ...m, status: "Đang mở" }
    : m;
}

export const milestoneService = {
  /**
   * Create a new milestone
   */
  async createMilestone(
    milestoneData: Omit<Milestone, "id">,
    courseId: string,
    createdBy: string,
  ): Promise<string> {
    const milestonesRef = collection(db, "milestones");

    const docRef = await addDoc(milestonesRef, {
      ...milestoneData,
      courseId,
      createdBy,
      createdAt: serverTimestamp(),
      publishedAt: null,
    });

    return docRef.id;
  },

  /**
   * Get all milestones for a course
   */
  async getCourseMilestones(courseId: string): Promise<Milestone[]> {
    const milestonesRef = collection(db, "milestones");
    const q = query(
      milestonesRef,
      where("courseId", "==", courseId),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) =>
      normalizeMilestone({ id: doc.id, ...doc.data() }),
    );
  },

  /**
   * Update a milestone
   */
  async updateMilestone(
    milestoneId: string,
    updates: Partial<Milestone>,
  ): Promise<void> {
    const milestoneRef = doc(db, "milestones", milestoneId);
    await updateDoc(milestoneRef, updates);
  },

  /**
   * Publish milestones (lock them)
   */
  async publishMilestones(courseId: string): Promise<void> {
    const milestones = await this.getCourseMilestones(courseId);

    const updatePromises = milestones.map((milestone) => {
      const milestoneRef = doc(db, "milestones", milestone.id);
      return updateDoc(milestoneRef, {
        publishedAt: serverTimestamp(),
      });
    });

    await Promise.all(updatePromises);
  },

  /**
   * Subscribe to real-time updates for course milestones
   */
  subscribeToCourseMilestones(
    courseId: string,
    callback: (milestones: Milestone[]) => void,
  ): () => void {
    const milestonesRef = collection(db, "milestones");
    const q = query(
      milestonesRef,
      where("courseId", "==", courseId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const milestones = snapshot.docs
        .map((doc) => ({ doc, data: doc.data() as any }))
        .sort((a, b) => (a.data.createdAt?.toMillis?.() ?? 0) - (b.data.createdAt?.toMillis?.() ?? 0))
        .map(({ doc, data }) => normalizeMilestone({ id: doc.id, ...data }));

      callback(milestones);
    });

    return unsubscribe;
  },
};
