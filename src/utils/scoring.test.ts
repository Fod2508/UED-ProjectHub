import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateMatchScore,
  isTeamRecommended,
  calculateContributionScore,
  hasContributionWarning,
  validateMilestonesWeight,
  checkIsTaskOverdue,
  getContributionStatus,
  markOverdueTasks,
  buildContributionMembers,
} from "./scoring.ts";

test("markOverdueTasks moves late unfinished tasks to Quá hạn", () => {
  const refDate = new Date("2026-12-18T10:00:00");
  const tasks = [
    { id: "late", dueDate: "17/12/2026", status: "Đang thực hiện" },
    { id: "lateAssigned", dueDate: "01/12/2026", status: "Đã giao việc" },
    { id: "done", dueDate: "17/12/2026", status: "Hoàn thành" },
    { id: "pending", dueDate: "17/12/2026", status: "Chờ duyệt" },
    { id: "resumed", dueDate: "17/12/2026", status: "Đang thực hiện", overdueResumed: true },
    { id: "future", dueDate: "22/12/2026", status: "Mới tạo" },
  ];
  const result = markOverdueTasks(tasks, refDate);
  const statusOf = (id: string) => result.find((t) => t.id === id)?.status;

  assert.equal(statusOf("late"), "Quá hạn");
  assert.equal(statusOf("lateAssigned"), "Quá hạn");
  assert.equal(statusOf("done"), "Hoàn thành");
  assert.equal(statusOf("pending"), "Chờ duyệt");
  assert.equal(statusOf("resumed"), "Đang thực hiện");
  assert.equal(statusOf("future"), "Mới tạo");

  // Không còn gì để đổi -> trả về đúng mảng cũ (tránh vòng lặp cập nhật)
  assert.equal(markOverdueTasks(result, refDate), result);
});

test("calculateMatchScore applies 0.4 * skill + 0.6 * time correctly", () => {
  // Test Case 1: Skill 95, Time 90 -> (95 * 0.4) + (90 * 0.6) = 38 + 54 = 92%
  const scoreA = calculateMatchScore(95, 90);
  assert.equal(scoreA, 92);
  assert.equal(isTeamRecommended(scoreA), true);

  // Test Case 2: Skill 80, Time 85 -> (80 * 0.4) + (85 * 0.6) = 32 + 51 = 83%
  const scoreDuc = calculateMatchScore(80, 85);
  assert.equal(scoreDuc, 83);
  assert.equal(isTeamRecommended(scoreDuc), true);

  // Test Case 3: Score < 80% should not be recommended
  const scoreLow = calculateMatchScore(70, 70);
  assert.equal(scoreLow, 70);
  assert.equal(isTeamRecommended(scoreLow), false);

  // Lịch rảnh nặng hơn kỹ năng: Skill 100, Time 50 -> 40 + 30 = 70%
  assert.equal(calculateMatchScore(100, 50), 70);
  // Skill 50, Time 100 -> 20 + 60 = 80%
  assert.equal(calculateMatchScore(50, 100), 80);
});

test("calculateMatchScore caps at 28% when no free slot overlaps", () => {
  // Đủ kỹ năng nhưng không trùng buổi nào: 100 * 0.4 + 0 = 40 -> giới hạn 28%
  const noOverlap = calculateMatchScore(100, 0, 0);
  assert.equal(noOverlap, 28);
  assert.equal(isTeamRecommended(noOverlap), false);

  // Điểm vốn đã thấp hơn 28% thì giữ nguyên: 50 * 0.4 = 20%
  assert.equal(calculateMatchScore(50, 0, 0), 20);

  // Nhóm chưa khai lịch (điểm lịch mặc định 70, 0 buổi trùng) -> không giới hạn
  assert.equal(calculateMatchScore(100, 70, 0), 82);

  // Có buổi trùng -> không giới hạn: 100 * 0.4 + 50 * 0.6 = 70%
  assert.equal(calculateMatchScore(100, 50, 3), 70);

  // Không truyền matchedSlots -> không giới hạn
  assert.equal(calculateMatchScore(100, 0), 40);
});

test("calculateContributionScore applies 50% completion + 50% peer score correctly", () => {
  // Nguyen Van A: 100% completion (4/4), peer score 4.8 / 5.0
  // (100 * 0.5) + (4.8 / 5 * 100 * 0.5) = 50 + 48 = 98%
  const scoreA = calculateContributionScore(100, 4.8);
  assert.equal(scoreA, 98);
  assert.equal(hasContributionWarning(scoreA, 4.8), false);
  assert.equal(getContributionStatus(scoreA, 4.8).status, "Đóng góp tích cực");

  // Tran Thu Ha: 100% completion (3/3), peer score 4.5 / 5.0 -> 50 + 45 = 95 -> or in mock 92
  const scoreHa = calculateContributionScore(100, 4.5);
  assert.equal(scoreHa, 95);

  // Dang Minh: 80% completion (4/5), peer score 3.8 / 5.0 -> 40 + (3.8 * 10) = 78%
  const scoreMinh = calculateContributionScore(80, 3.8);
  assert.equal(scoreMinh, 78);
  assert.equal(hasContributionWarning(scoreMinh, 3.8), false);
  assert.equal(getContributionStatus(scoreMinh, 3.8).status, "Đạt chuẩn");

  // Le Van Cuc: 40% completion (2/5), peer score 2.1 / 5.0 -> 20 + 21 = 41 -> if 38%
  // Formula: If completion is 40% (0.4 * 0.5 * 100 = 20) + (1.8/5 * 50 = 18) = 38
  const scoreCuc = calculateContributionScore(40, 1.8);
  assert.equal(scoreCuc, 38);
  assert.equal(hasContributionWarning(scoreCuc, 2.1), true);
  assert.equal(
    getContributionStatus(scoreCuc, 2.1).status,
    "Cảnh báo thiếu đóng góp",
  );
  assert.equal(getContributionStatus(scoreCuc, 2.1).isWarning, true);
});

test("hasContributionWarning detects when score < 50 or peer score < 2.5", () => {
  assert.equal(hasContributionWarning(49, 4.0), true);
  assert.equal(hasContributionWarning(70, 2.4), true);
  assert.equal(hasContributionWarning(38, 2.1), true);
  assert.equal(hasContributionWarning(80, 3.5), false);
});

test("validateMilestonesWeight ensures sum equals 100%", () => {
  const validMilestones = [
    { weight: 20 },
    { weight: 30 },
    { weight: 20 },
    { weight: 30 },
  ];
  assert.equal(validateMilestonesWeight(validMilestones).isValid, true);
  assert.equal(validateMilestonesWeight(validMilestones).totalWeight, 100);

  const invalidMilestones = [{ weight: 20 }, { weight: 30 }, { weight: 20 }];
  assert.equal(validateMilestonesWeight(invalidMilestones).isValid, false);
  assert.equal(validateMilestonesWeight(invalidMilestones).totalWeight, 70);
});

test("checkIsTaskOverdue marks unfinished past tasks as overdue", () => {
  const refDate = new Date("2026-12-18T10:00:00");

  // Due yesterday (17/12/2026) and not completed -> OVERDUE
  assert.equal(
    checkIsTaskOverdue("17/12/2026", "Đang thực hiện", refDate),
    true,
  );

  // Due yesterday but completed -> NOT overdue
  assert.equal(checkIsTaskOverdue("17/12/2026", "Hoàn thành", refDate), false);

  // Due in future (22/12/2026) -> NOT overdue
  assert.equal(checkIsTaskOverdue("22/12/2026", "Mới tạo", refDate), false);

  // Due today same day (18/12/2026) but end of day not yet passed -> NOT overdue
  assert.equal(
    checkIsTaskOverdue("18/12/2026", "Đang thực hiện", refDate),
    false,
  );

  // Due much earlier (01/11/2026) and not completed -> OVERDUE
  assert.equal(
    checkIsTaskOverdue("01/11/2026", "Đang thực hiện", refDate),
    true,
  );

  // Missing or malformed date -> NOT overdue
  assert.equal(checkIsTaskOverdue("", "Đang thực hiện", refDate), false);
  assert.equal(checkIsTaskOverdue("invalid", "Đang thực hiện", refDate), false);
});

test("buildContributionMembers computes completion, weighted peer score and warning", () => {
  const members = [
    { id: "a", name: "An", avatarText: "AN", isLeader: true },
    { id: "b", name: "Bình", avatarText: "BI" },
  ];
  const tasks = [
    { assigneeName: "An", status: "Hoàn thành" },
    { assigneeName: "An", status: "Hoàn thành" },
    { assigneeName: "Bình", status: "Hoàn thành" },
    { assigneeName: "Bình", status: "Quá hạn" },
    { assigneeName: "Bình", status: "Đang thực hiện" },
    { assigneeName: "Bình", status: "Đã giao việc" },
  ];
  const reviews = [
    { targetId: "a", status: "done", c1: 5, c2: 4, c3: 5, comment: "Chủ động" },
    { targetId: "b", status: "done", c1: 2, c2: 2, c3: 2, comment: "" },
    { targetId: "b", status: "pending", c1: 0, c2: 0, c3: 0 },
  ];
  const [an, binh] = buildContributionMembers(members, tasks, reviews, { c1: 40, c2: 35, c3: 25 });

  // An: 2/2 việc = 100%; phiếu (5*40+4*35+5*25)/100 = 4.65 -> 4.7; 50 + 47 = 97
  assert.equal(an.completionRate, 100);
  assert.equal(an.peerScoreAvg, 4.7);
  assert.equal(an.contributionScore, 97);
  assert.equal(an.isWarning, false);
  assert.equal(an.roleInTeam, "Trưởng nhóm");
  assert.equal(an.anonymousComment, "Chủ động");

  // Bình: 1/4 việc = 25%; chỉ tính phiếu đã gửi: 2.0; 12.5 + 20 = 32.5 -> cảnh báo
  assert.equal(binh.completionRate, 25);
  assert.equal(binh.peerScoreAvg, 2);
  assert.equal(binh.contributionScore, 32.5);
  assert.equal(binh.isWarning, true);
  assert.equal(binh.hasOverdueTask, true);
});
