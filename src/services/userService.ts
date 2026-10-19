import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { UserProfile, FreeScheduleMatrix } from "../types";

export const userService = {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as UserProfile;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
  },

  /**
   * Update user schedule matrix
   */
  async updateScheduleMatrix(
    userId: string,
    scheduleMatrix: FreeScheduleMatrix,
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { scheduleMatrix });
  },

  /**
   * Update user skills
   */
  async updateUserSkills(userId: string, skills: string[]): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { skills });
  },

  /**
   * Assign user to a group
   */
  async assignToGroup(
    userId: string,
    groupId: string,
    groupName: string,
    isLeader: boolean = false,
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      teamId: groupId,
      teamName: groupName,
      isGroupLeader: isLeader,
    });
  },

  /**
   * Create or update user profile (for sign up)
   */
  async createUserProfile(
    userId: string,
    profileData: Omit<UserProfile, "id">,
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...profileData,
      createdAt: new Date(),
    });
  },
};
