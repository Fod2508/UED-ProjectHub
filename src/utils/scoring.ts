/**
 * Thuật toán tính điểm và nghiệp vụ cốt lõi UD-DN ProjectHub
 */

export interface MilestoneItem {
  id: string;
  name: string;
  phase: string;
  deliverables: string;
  dueDate: string;
  weight: number; // e.g. 20 (meaning 20%)
  status: "Đã hoàn thành" | "Đang mở" | "Chưa mở" | "Đã khóa";
}

/**
 * Giai đoạn 1 - Ghép nhóm:
 * Điểm phù hợp = Kỹ năng × 40% + Lịch rảnh × 60%
 * SkillScore: 0 - 100
 * TimeScore: 0 - 100
 * matchedSlots (không bắt buộc): số buổi rảnh trùng với nhóm. Nếu nhóm có lịch
 * nhưng không trùng buổi nào (matchedSlots = 0 và TimeScore = 0) thì điểm bị
 * giới hạn tối đa NO_OVERLAP_MAX_SCORE.
 */
export const NO_OVERLAP_MAX_SCORE = 28;

export function calculateMatchScore(
  skillScore: number,
  timeScore: number,
  matchedSlots?: number,
): number {
  const finalScore = Math.round(skillScore * 0.4 + timeScore * 0.6);
  if (matchedSlots === 0 && timeScore === 0) {
    return Math.min(NO_OVERLAP_MAX_SCORE, finalScore);
  }
  return finalScore;
}

/**
 * Nếu FinalScore >= 80% thì gợi ý nhóm (Khuyên chọn hàng đầu • Bù trừ kỹ năng tối ưu)
 */
export function isTeamRecommended(finalScore: number): boolean {
  return finalScore >= 80;
}

/**
 * Giai đoạn 2 - Kiểm tra task quá hạn:
 * Tự động gắn nhãn đỏ "⚠️ Quá hạn" cho các task trễ hạn chưa hoàn thành.
 * Định dạng dueDateString: "dd/mm/yyyy"
 */
export function checkIsTaskOverdue(
  dueDateString: string,
  status: string,
  referenceDate?: Date,
): boolean {
  if (status === "Hoàn thành") return false;
  if (!dueDateString) return false;

  // Parse "dd/mm/yyyy" format
  const parts = dueDateString.split("/");
  if (parts.length !== 3) return false;

  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return false;

  // Set dueDate to end of that day (23:59:59)
  const dueDate = new Date(year, month - 1, day, 23, 59, 59);
  const now = referenceDate ?? new Date();

  return dueDate < now;
}

/**
 * Giai đoạn 2 - Tự gắn trạng thái "Quá hạn" cho công việc trễ hạn chưa hoàn thành.
 * Bỏ qua: việc đã Hoàn thành, việc đang Chờ duyệt (người làm đã nộp, đang đợi
 * Trưởng nhóm), và việc đã được "tiếp tục làm" sau khi quá hạn (overdueResumed).
 * Trả về chính mảng cũ nếu không có gì thay đổi.
 */
export function markOverdueTasks<
  T extends { dueDate: string; status: string; overdueResumed?: boolean },
>(tasks: T[], referenceDate?: Date): T[] {
  let changed = false;
  const updated = tasks.map((t) => {
    if (
      t.overdueResumed ||
      t.status === "Hoàn thành" ||
      t.status === "Chờ duyệt" ||
      t.status === "Quá hạn"
    ) {
      return t;
    }
    if (checkIsTaskOverdue(t.dueDate, t.status, referenceDate)) {
      changed = true;
      return { ...t, status: "Quá hạn" };
    }
    return t;
  });
  return changed ? updated : tasks;
}

/**
 * Giai đoạn 2 - Kiểm tra tổng trọng số cột mốc = 100%
 */
export function validateMilestonesWeight(
  milestones: { weight: number; type?: "course" | "internal" }[],
): {
  isValid: boolean;
  totalWeight: number;
} {
  const courseMilestones = milestones.filter((m) => m.type !== "internal");
  const totalWeight = courseMilestones.reduce(
    (sum, m) => sum + (Number(m.weight) || 0),
    0,
  );
  return {
    isValid: totalWeight === 100,
    totalWeight,
  };
}

/**
 * Giai đoạn 3 - Đánh giá chéo & Chống Free-rider:
 * Thuật toán tính điểm:
 * Điểm đóng góp = (Tỷ lệ hoàn thành công việc * 0.5) + (Điểm đánh giá chéo TB / 5 * 100 * 0.5)
 * completionRate: 0 - 100 (%)
 * peerScoreAvg: 1.0 - 5.0
 */
export function calculateContributionScore(
  completionRate: number,
  peerScoreAvg: number,
): number {
  const score = completionRate * 0.5 + (peerScoreAvg / 5) * 100 * 0.5;
  return Math.round(score * 10) / 10;
}

/**
 * Nếu Điểm đóng góp < 50% HOẶC Điểm đánh giá chéo < 2.5:
 * Hệ thống tự động gắn nhãn đỏ "⚠️ Cảnh báo thiếu đóng góp"
 */
export function hasContributionWarning(
  contributionScore: number,
  peerScoreAvg: number,
): boolean {
  return contributionScore < 50 || peerScoreAvg < 2.5;
}

/**
 * Xếp loại trạng thái ghi nhận theo mức điểm
 */
export function getContributionStatus(
  contributionScore: number,
  peerScoreAvg: number,
): {
  status: "Đóng góp tích cực" | "Đạt chuẩn" | "Cảnh báo thiếu đóng góp";
  color: "emerald" | "blue" | "red";
  isWarning: boolean;
} {
  if (hasContributionWarning(contributionScore, peerScoreAvg)) {
    return {
      status: "Cảnh báo thiếu đóng góp",
      color: "red",
      isWarning: true,
    };
  }
  if (contributionScore >= 85) {
    return {
      status: "Đóng góp tích cực",
      color: "emerald",
      isWarning: false,
    };
  }
  return {
    status: "Đạt chuẩn",
    color: "blue",
    isWarning: false,
  };
}
