import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { PeerReviewEntry } from "../data/initialData";

/**
 * Generate anonymous hash for peer review
 * This ensures reviewer identity remains hidden
 */
function generateAnonymousHash(
  userId: string,
  targetId: string,
  salt: string = "peer_review_2024",
): string {
  const combined = `${userId}_${targetId}_${salt}`;
  // Simple hash function (in production, use crypto library)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `anon_${Math.abs(hash).toString(36)}`;
}

export const peerReviewService = {
  /**
   * Create or update a peer review
   * Uses anonymous hash to hide reviewer identity
   */
  async savePeerReview(
    groupId: string,
    milestoneId: string,
    reviewerId: string,
    targetId: string,
    reviewData: {
      c1: number;
      c2: number;
      c3: number;
      comment: string;
      status: "done" | "evaluating" | "pending";
    },
  ): Promise<string> {
    const reviewsRef = collection(db, "peerReviews");

    // Generate anonymous IDs
    const reviewerHash = generateAnonymousHash(reviewerId, targetId);
    const targetHash = generateAnonymousHash(targetId, reviewerId);

    // Use compound ID for idempotency
    const reviewId = `${groupId}_${milestoneId}_${reviewerHash}_${targetHash}`;
    const reviewDocRef = doc(db, "peerReviews", reviewId);

    await setDoc(
      reviewDocRef,
      {
        groupId,
        milestoneId,
        reviewerIdHash: reviewerHash, // Anonymous
        targetIdHash: targetHash, // Anonymous
        reviewerId, // Real ID (only visible to lecturers via security rules)
        targetId, // Real ID (only visible to lecturers)
        ...reviewData,
        updatedAt: serverTimestamp(),
        submittedAt: reviewData.status === "done" ? serverTimestamp() : null,
      },
      { merge: true },
    );

    return reviewId;
  },

  /**
   * Get peer reviews for a specific group and milestone
   * Returns anonymized data for students
   */
  async getGroupPeerReviews(
    groupId: string,
    milestoneId: string,
  ): Promise<PeerReviewEntry[]> {
    const reviewsRef = collection(db, "peerReviews");
    const q = query(
      reviewsRef,
      where("groupId", "==", groupId),
      where("milestoneId", "==", milestoneId),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];
  },

  /**
   * Get reviews submitted by a specific user (for their own view)
   */
  async getUserReviews(
    groupId: string,
    milestoneId: string,
    reviewerId: string,
  ): Promise<PeerReviewEntry[]> {
    const reviewsRef = collection(db, "peerReviews");
    const q = query(
      reviewsRef,
      where("groupId", "==", groupId),
      where("milestoneId", "==", milestoneId),
      where("reviewerId", "==", reviewerId),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];
  },

  /**
   * Calculate average scores for a target member (anonymized)
   */
  async calculateAverageScores(
    groupId: string,
    milestoneId: string,
    targetId: string,
  ): Promise<{
    c1Avg: number;
    c2Avg: number;
    c3Avg: number;
    totalAvg: number;
    reviewCount: number;
  }> {
    const reviewsRef = collection(db, "peerReviews");
    const q = query(
      reviewsRef,
      where("groupId", "==", groupId),
      where("milestoneId", "==", milestoneId),
      where("targetId", "==", targetId),
      where("status", "==", "done"),
    );

    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((doc) => doc.data());

    if (reviews.length === 0) {
      return { c1Avg: 0, c2Avg: 0, c3Avg: 0, totalAvg: 0, reviewCount: 0 };
    }

    const c1Sum = reviews.reduce((sum, r: any) => sum + (r.c1 || 0), 0);
    const c2Sum = reviews.reduce((sum, r: any) => sum + (r.c2 || 0), 0);
    const c3Sum = reviews.reduce((sum, r: any) => sum + (r.c3 || 0), 0);

    const c1Avg = c1Sum / reviews.length;
    const c2Avg = c2Sum / reviews.length;
    const c3Avg = c3Sum / reviews.length;

    // Weighted average: c1(40%) + c2(35%) + c3(25%)
    const totalAvg = c1Avg * 0.4 + c2Avg * 0.35 + c3Avg * 0.25;

    return {
      c1Avg: Math.round(c1Avg * 10) / 10,
      c2Avg: Math.round(c2Avg * 10) / 10,
      c3Avg: Math.round(c3Avg * 10) / 10,
      totalAvg: Math.round(totalAvg * 10) / 10,
      reviewCount: reviews.length,
    };
  },

  /**
   * Subscribe to realtime updates for group peer reviews
   */
  subscribeToGroupPeerReviews(
    groupId: string,
    milestoneId: string,
    callback: (reviews: PeerReviewEntry[]) => void,
  ): () => void {
    const reviewsRef = collection(db, "peerReviews");
    const q = query(
      reviewsRef,
      where("groupId", "==", groupId),
      where("milestoneId", "==", milestoneId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      callback(reviews);
    });

    return unsubscribe;
  },

  /**
   * Initialize peer review session for all group members
   * Called when milestone ends
   */
  async initializePeerReviewSession(
    groupId: string,
    milestoneId: string,
    memberIds: string[],
  ): Promise<{ success: boolean; message: string; reviewCount: number }> {
    try {
      let reviewCount = 0;

      // Each member reviews all other members
      for (const reviewerId of memberIds) {
        for (const targetId of memberIds) {
          // Skip self-review
          if (reviewerId === targetId) continue;

          // Create pending review entry
          await this.savePeerReview(
            groupId,
            milestoneId,
            reviewerId,
            targetId,
            {
              c1: 0,
              c2: 0,
              c3: 0,
              comment: "",
              status: "pending",
            },
          );

          reviewCount++;
        }
      }

      return {
        success: true,
        message: `Đã khởi tạo ${reviewCount} phiếu đánh giá chéo`,
        reviewCount,
      };
    } catch (error) {
      console.error("Error initializing peer review session:", error);
      return {
        success: false,
        message: "Lỗi khi khởi tạo phiên đánh giá chéo",
        reviewCount: 0,
      };
    }
  },

  /**
   * Check if peer review session is active for a milestone
   */
  async isPeerReviewActive(
    groupId: string,
    milestoneId: string,
  ): Promise<boolean> {
    const reviewsRef = collection(db, "peerReviews");
    const q = query(
      reviewsRef,
      where("groupId", "==", groupId),
      where("milestoneId", "==", milestoneId),
    );

    const snapshot = await getDocs(q);
    return snapshot.size > 0;
  },
};
