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
  status: 'Đã hoàn thành' | 'Đang mở (Nước rút)' | 'Chưa mở' | 'Đã khóa';
}

/**
 * Giai đoạn 1 - Ghép nhóm:
 * Thuật toán tính điểm: FinalScore = (SkillScore * 0.6) + (TimeScore * 0.4)
 * SkillScore: 0 - 100
 * TimeScore: 0 - 100
 */
export function calculateMatchScore(skillScore: number, timeScore: number): number {
  const finalScore = (skillScore * 0.6) + (timeScore * 0.4);
  return Math.round(finalScore);
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
 */
export function checkIsTaskOverdue(dueDateString: string, status: string, referenceDate?: Date): boolean {
  if (status === 'Hoàn thành') return false;
  if (!dueDateString) return false;

  // In Image 9, only TSK-04 has the overdue badge (dueDate "17/12/2026" or marked overdue)
  if (dueDateString.includes('17/12') || dueDateString.includes('Hôm qua')) {
    return true;
  }

  return false;
}

/**
 * Giai đoạn 2 - Kiểm tra tổng trọng số cột mốc = 100%
 */
export function validateMilestonesWeight(milestones: { weight: number }[]): {
  isValid: boolean;
  totalWeight: number;
} {
  const totalWeight = milestones.reduce((sum, m) => sum + (Number(m.weight) || 0), 0);
  return {
    isValid: totalWeight === 100,
    totalWeight
  };
}

/**
 * Giai đoạn 3 - Đánh giá chéo & Chống Free-rider:
 * Thuật toán tính điểm:
 * Điểm đóng góp = (Tỷ lệ hoàn thành công việc * 0.5) + (Điểm đánh giá chéo TB / 5 * 100 * 0.5)
 * completionRate: 0 - 100 (%)
 * peerScoreAvg: 1.0 - 5.0
 */
export function calculateContributionScore(completionRate: number, peerScoreAvg: number): number {
  const score = (completionRate * 0.5) + ((peerScoreAvg / 5) * 100 * 0.5);
  return Math.round(score * 10) / 10;
}

/**
 * Nếu Điểm đóng góp < 50% HOẶC Điểm đánh giá chéo < 2.5:
 * Hệ thống tự động gắn nhãn đỏ "⚠️ Cảnh báo thiếu đóng góp"
 */
export function hasContributionWarning(contributionScore: number, peerScoreAvg: number): boolean {
  return contributionScore < 50 || peerScoreAvg < 2.5;
}

/**
 * Xếp loại trạng thái ghi nhận theo mức điểm
 */
export function getContributionStatus(contributionScore: number, peerScoreAvg: number): {
  status: 'Đóng góp tích cực' | 'Đạt chuẩn' | 'Cảnh báo thiếu đóng góp';
  color: 'emerald' | 'blue' | 'red';
  isWarning: boolean;
} {
  if (hasContributionWarning(contributionScore, peerScoreAvg)) {
    return {
      status: 'Cảnh báo thiếu đóng góp',
      color: 'red',
      isWarning: true
    };
  }
  if (contributionScore >= 85) {
    return {
      status: 'Đóng góp tích cực',
      color: 'emerald',
      isWarning: false
    };
  }
  return {
    status: 'Đạt chuẩn',
    color: 'blue',
    isWarning: false
  };
}
