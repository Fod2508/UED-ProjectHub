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
import { CandidateApplicant } from "../types";

export const applicationService = {
  /**
   * Create a new application (join request)
   */
  async createApplication(
    applicantId: string,
    targetGroupId: string,
    applicationData: Partial<CandidateApplicant>,
  ): Promise<string> {
    const applicationsRef = collection(db, "applications");

    const docRef = await addDoc(applicationsRef, {
      applicantId,
      targetGroupId,
      status: "pending",
      ...applicationData,
      appliedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  /**
   * Get all applications for a group
   */
  async getGroupApplications(groupId: string): Promise<CandidateApplicant[]> {
    const applicationsRef = collection(db, "applications");
    const q = query(
      applicationsRef,
      where("targetGroupId", "==", groupId),
      orderBy("appliedAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CandidateApplicant[];
  },

  /**
   * Update application status (accept/reject)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: "accepted" | "rejected",
  ): Promise<void> {
    const applicationRef = doc(db, "applications", applicationId);
    await updateDoc(applicationRef, {
      status,
      reviewedAt: serverTimestamp(),
    });
  },

  /**
   * Accept an application
   */
  async acceptApplication(applicationId: string): Promise<void> {
    await this.updateApplicationStatus(applicationId, "accepted");
  },

  /**
   * Reject an application
   */
  async rejectApplication(applicationId: string): Promise<void> {
    await this.updateApplicationStatus(applicationId, "rejected");
  },

  /**
   * Subscribe to real-time updates for group applications
   */
  subscribeToGroupApplications(
    groupId: string,
    callback: (applications: CandidateApplicant[]) => void,
  ): () => void {
    const applicationsRef = collection(db, "applications");
    const q = query(
      applicationsRef,
      where("targetGroupId", "==", groupId),
      orderBy("appliedAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const applications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CandidateApplicant[];

      callback(applications);
    });

    return unsubscribe;
  },
};
