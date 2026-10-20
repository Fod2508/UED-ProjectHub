import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  DocumentData,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase.ts";

export interface Group {
  id: string;
  name: string;
  code: string;
  courseId: string;
  projectTopic?: string;
  maxMembers: number;
  currentMemberCount: number;
  memberIds: string[];
  createdBy: string;
  leaderName?: string;
  leaderAvatar?: string;
  leaderEmail?: string;
  members?: Array<{ name: string; role: string; avatar: string }>;
  createdAt: string;
  status: "recruiting" | "full" | "active" | "completed";
  skillsNeeded: string[];
  schedule?: Record<string, Record<string, boolean>>;
}

class GroupService {
  private groupsCollection = collection(db, "groups");

  /**
   * Create a new group
   */
  async createGroup(
    creatorId: string,
    creatorName: string,
    courseId: string,
    skillsOffered: string[],
    schedule?: Record<string, Record<string, boolean>>,
    creatorDetails?: { avatar?: string; email?: string; topic?: string },
  ): Promise<{ success: boolean; groupId?: string; error?: string }> {
    try {
      // Generate unique group code
      const groupCode = `NHM-${Math.floor(Math.random() * 900 + 100)}`;
      const groupId = `nhom_${groupCode.toLowerCase().replace("-", "_")}`;
      const groupName = `Nhóm ${groupCode.split("-")[1]} (${creatorName})`;
      const leaderAvatar = creatorDetails?.avatar || creatorName.slice(0, 2).toUpperCase();
      const leaderEmail = creatorDetails?.email || `${creatorId}@ued.udn.vn`;

      const newGroup: Group = {
        id: groupId,
        name: groupName,
        code: groupCode,
        courseId,
        projectTopic: creatorDetails?.topic || "Đang đăng ký đề tài đồ án",
        maxMembers: 4,
        currentMemberCount: 1,
        memberIds: [creatorId],
        createdBy: creatorId,
        leaderName: creatorName,
        leaderAvatar: leaderAvatar,
        leaderEmail: leaderEmail,
        members: [
          {
            name: creatorName,
            role: "Trưởng nhóm",
            avatar: leaderAvatar,
          },
        ],
        createdAt: new Date().toISOString(),
        status: "recruiting",
        skillsNeeded: this.getComplementarySkills(skillsOffered),
        schedule: schedule || {},
      };

      const groupRef = doc(this.groupsCollection, groupId);
      await setDoc(groupRef, newGroup);

      // Cập nhật thông tin nhóm cho người tạo trong bảng users
      try {
        const userRef = doc(db, "users", creatorId);
        await setDoc(
          userRef,
          {
            id: creatorId,
            name: creatorName,
            teamId: groupId,
            teamName: newGroup.name,
            isGroupLeader: true,
          },
          { merge: true },
        );
      } catch (userErr) {
        console.warn("Could not update creator user profile with group:", userErr);
      }

      return { success: true, groupId };
    } catch (error) {
      console.error("Error creating group:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Find matching groups based on skills and schedule
   */
  async findMatchingGroups(
    userSkills: string[],
    userSchedule: Record<string, Record<string, boolean>>,
    courseId: string,
  ): Promise<Array<Group & { matchScore: number; commonSlotsCount: number }>> {
    try {
      const q = query(
        this.groupsCollection,
        where("courseId", "==", courseId),
        where("status", "==", "recruiting"),
      );

      const snapshot = await getDocs(q);
      const groups: Array<Group & { matchScore: number; commonSlotsCount: number }> = [];

      snapshot.forEach((doc) => {
        const groupData = doc.data() as Group;

        // Skip if group is full
        if (groupData.currentMemberCount >= groupData.maxMembers) {
          return;
        }

        // Calculate match score
        const skillScore = this.calculateSkillMatch(
          userSkills,
          groupData.skillsNeeded,
        );
        const { score: scheduleScore, matchedSlots } = this.calculateScheduleMatch(
          userSchedule,
          groupData.schedule || {},
        );

        // If matchedSlots === 0 and group has requirements, heavily penalize (max 25%)
        let matchScore = Math.round(skillScore * 0.4 + scheduleScore * 0.6);
        if (matchedSlots === 0 && scheduleScore === 0) {
          matchScore = Math.min(28, Math.round(skillScore * 0.25));
        }

        groups.push({
          ...groupData,
          matchScore,
          commonSlotsCount: matchedSlots,
        });
      });

      // Sort by match score descending
      return groups.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error("Error finding matching groups:", error);
      return [];
    }
  }

  /**
   * Add member to group
   */
  async addMemberToGroup(
    groupId: string,
    userId: string,
    memberDetails?: { name?: string; avatar?: string; role?: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(this.groupsCollection, groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        return { success: false, error: "Nhóm không tồn tại" };
      }

      const groupData = groupSnap.data() as Group;

      if (groupData.currentMemberCount >= groupData.maxMembers) {
        return { success: false, error: "Nhóm đã đầy" };
      }

      if (groupData.memberIds.includes(userId)) {
        return { success: false, error: "Bạn đã là thành viên của nhóm này" };
      }

      const memberName = memberDetails?.name || "Thành viên";
      const memberAvatar = memberDetails?.avatar || memberName.slice(0, 2).toUpperCase();
      const updatedMembers = [
        ...(groupData.members || []),
        {
          name: memberName,
          role: memberDetails?.role || "Thành viên",
          avatar: memberAvatar,
        },
      ];

      await updateDoc(groupRef, {
        memberIds: [...groupData.memberIds, userId],
        currentMemberCount: groupData.currentMemberCount + 1,
        members: updatedMembers,
        status:
          groupData.currentMemberCount + 1 >= groupData.maxMembers
            ? "full"
            : "recruiting",
      });

      // Cập nhật thông tin nhóm cho thành viên trong bảng users
      try {
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            id: userId,
            teamId: groupId,
            teamName: groupData.name,
            isGroupLeader: false,
          },
          { merge: true },
        );
      } catch (userErr) {
        console.warn("Could not update member user profile with group:", userErr);
      }

      return { success: true };
    } catch (error) {
      console.error("Error adding member to group:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Remove member from group (leave group)
   */
  async removeMemberFromGroup(
    groupId: string,
    userId: string,
    userName?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(this.groupsCollection, groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data() as Group;
        const updatedMemberIds = groupData.memberIds.filter((id) => id !== userId);
        const updatedMembers = (groupData.members || []).filter(
          (m) => m.name !== userName,
        );
        await updateDoc(groupRef, {
          memberIds: updatedMemberIds,
          currentMemberCount: Math.max(0, updatedMemberIds.length),
          members: updatedMembers,
          status: "recruiting",
        });
      }

      // Update user doc in Firestore
      try {
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            teamId: null,
            teamName: null,
            isGroupLeader: false,
          },
          { merge: true },
        );
      } catch (userErr) {
        console.warn("Could not update user doc when leaving group:", userErr);
      }

      return { success: true };
    } catch (error) {
      console.error("Error removing member from group:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<Group | null> {
    try {
      const groupRef = doc(this.groupsCollection, groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        return null;
      }

      return groupSnap.data() as Group;
    } catch (error) {
      console.error("Error getting group:", error);
      return null;
    }
  }

  /**
   * Get all groups from Firestore
   */
  async getAllGroups(): Promise<Group[]> {
    try {
      const snap = await getDocs(this.groupsCollection);
      return snap.docs.map((d) => d.data() as Group);
    } catch (error) {
      console.warn("Could not get groups from Firestore:", error);
      return [];
    }
  }

  /**
   * Subscribe to real-time updates for all groups
   */
  subscribeToGroups(callback: (groups: Group[]) => void): () => void {
    return onSnapshot(
      this.groupsCollection,
      (snapshot) => {
        const groups = snapshot.docs.map((d) => d.data() as Group);
        callback(groups);
      },
      (error) => {
        console.warn("Error subscribing to groups:", error);
      },
    );
  }

  /**
   * Get group members details
   */
  async getGroupMembers(groupId: string): Promise<
    Array<{
      id: string;
      name: string;
      email?: string;
      avatarText: string;
      role?: string;
      skills: string[];
      isLeader: boolean;
    }>
  > {
    try {
      const group = await this.getGroup(groupId);
      if (!group) return [];

      // Fetch user details for each member
      const usersCollection = collection(db, "users");
      const memberDetails = await Promise.all(
        group.memberIds.map(async (memberId) => {
          const userRef = doc(usersCollection, memberId);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            return null;
          }

          const userData = userSnap.data();
          return {
            id: memberId,
            name: userData.name || "Unknown",
            email: userData.email,
            avatarText: userData.avatarText || userData.name?.charAt(0) || "?",
            role: userData.role,
            skills: userData.skills || [],
            isLeader: memberId === group.createdBy,
          };
        }),
      );

      return memberDetails.filter((m) => m !== null) as any[];
    } catch (error) {
      console.error("Error getting group members:", error);
      return [];
    }
  }

  /**
   * Calculate skill match score (0-100)
   */
  private calculateSkillMatch(
    userSkills: string[],
    groupNeeds: string[],
  ): number {
    if (groupNeeds.length === 0) return 100;

    const matchedSkills = userSkills.filter((skill) =>
      groupNeeds.some((need) => need.includes(skill) || skill.includes(need)),
    );

    return Math.min(
      100,
      Math.round((matchedSkills.length / groupNeeds.length) * 100),
    );
  }

  /**
   * Calculate schedule overlap score (0-100) and number of overlapping slots
   */
  public calculateScheduleMatch(
    userSchedule: Record<string, Record<string, boolean>>,
    groupSchedule: Record<string, Record<string, boolean>>,
  ): { score: number; matchedSlots: number } {
    let totalGroupSlots = 0;
    let matchedSlots = 0;

    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const timeSlots = ["Sáng", "Chiều", "Tối"];

    days.forEach((day) => {
      timeSlots.forEach((time) => {
        const userFree = !!userSchedule[day]?.[time];
        const groupFree = !!groupSchedule[day]?.[time];

        if (groupFree) {
          totalGroupSlots++;
          if (userFree) {
            matchedSlots++;
          }
        }
      });
    });

    if (totalGroupSlots === 0) {
      // If group didn't specify schedule, neutral score 70% with 0 specific matched
      return { score: 70, matchedSlots: 0 };
    }

    const score = Math.round((matchedSlots / totalGroupSlots) * 100);
    return { score, matchedSlots };
  }

  /**
   * Get complementary skills needed
   */
  private getComplementarySkills(userSkills: string[]): string[] {
    const allSkills = [
      "Frontend (React)",
      "Frontend (Vue.js)",
      "Backend (Node.js/Express)",
      "Backend (Python/Django)",
      "Thiết kế UI/UX (Figma)",
      "Cơ sở dữ liệu (PostgreSQL)",
      "Kiểm thử & QA (Postman)",
      "DevOps & Docker",
    ];

    // Return skills that user doesn't have
    return allSkills.filter(
      (skill) => !userSkills.some((userSkill) => skill.includes(userSkill)),
    );
  }
}

export const groupService = new GroupService();
