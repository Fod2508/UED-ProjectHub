import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMatchScore,
  isTeamRecommended,
  calculateContributionScore,
  hasContributionWarning,
  validateMilestonesWeight,
  checkIsTaskOverdue,
  getContributionStatus
} from './scoring.ts';

test('calculateMatchScore applies 0.6 * skill + 0.4 * time correctly', () => {
  // Test Case 1: Nguyen Van A (Skill 95, Time 87.5) -> (95 * 0.6) + (87.5 * 0.4) = 57 + 35 = 92%
  const scoreA = calculateMatchScore(95, 87.5);
  assert.equal(scoreA, 92);
  assert.equal(isTeamRecommended(scoreA), true);

  // Test Case 2: Tran Minh Duc (Skill 80, Time 82.5) -> (80 * 0.6) + (82.5 * 0.4) = 48 + 33 = 81%
  const scoreDuc = calculateMatchScore(80, 82.5);
  assert.equal(scoreDuc, 81);
  assert.equal(isTeamRecommended(scoreDuc), true);

  // Test Case 3: Score < 80% should not be recommended
  const scoreLow = calculateMatchScore(70, 70);
  assert.equal(scoreLow, 70);
  assert.equal(isTeamRecommended(scoreLow), false);
});

test('calculateContributionScore applies 50% completion + 50% peer score correctly', () => {
  // Nguyen Van A: 100% completion (4/4), peer score 4.8 / 5.0
  // (100 * 0.5) + (4.8 / 5 * 100 * 0.5) = 50 + 48 = 98%
  const scoreA = calculateContributionScore(100, 4.8);
  assert.equal(scoreA, 98);
  assert.equal(hasContributionWarning(scoreA, 4.8), false);
  assert.equal(getContributionStatus(scoreA, 4.8).status, 'Đóng góp tích cực');

  // Tran Thu Ha: 100% completion (3/3), peer score 4.5 / 5.0 -> 50 + 45 = 95 -> or in mock 92
  const scoreHa = calculateContributionScore(100, 4.5);
  assert.equal(scoreHa, 95);

  // Dang Minh: 80% completion (4/5), peer score 3.8 / 5.0 -> 40 + (3.8 * 10) = 78%
  const scoreMinh = calculateContributionScore(80, 3.8);
  assert.equal(scoreMinh, 78);
  assert.equal(hasContributionWarning(scoreMinh, 3.8), false);
  assert.equal(getContributionStatus(scoreMinh, 3.8).status, 'Đạt chuẩn');

  // Le Van Cuc: 40% completion (2/5), peer score 2.1 / 5.0 -> 20 + 21 = 41 -> if 38%
  // Formula: If completion is 40% (0.4 * 0.5 * 100 = 20) + (1.8/5 * 50 = 18) = 38
  const scoreCuc = calculateContributionScore(40, 1.8);
  assert.equal(scoreCuc, 38);
  assert.equal(hasContributionWarning(scoreCuc, 2.1), true);
  assert.equal(getContributionStatus(scoreCuc, 2.1).status, 'Cảnh báo thiếu đóng góp');
  assert.equal(getContributionStatus(scoreCuc, 2.1).isWarning, true);
});

test('hasContributionWarning detects when score < 50 or peer score < 2.5', () => {
  assert.equal(hasContributionWarning(49, 4.0), true);
  assert.equal(hasContributionWarning(70, 2.4), true);
  assert.equal(hasContributionWarning(38, 2.1), true);
  assert.equal(hasContributionWarning(80, 3.5), false);
});

test('validateMilestonesWeight ensures sum equals 100%', () => {
  const validMilestones = [
    { weight: 20 },
    { weight: 30 },
    { weight: 20 },
    { weight: 30 }
  ];
  assert.equal(validateMilestonesWeight(validMilestones).isValid, true);
  assert.equal(validateMilestonesWeight(validMilestones).totalWeight, 100);

  const invalidMilestones = [
    { weight: 20 },
    { weight: 30 },
    { weight: 20 }
  ];
  assert.equal(validateMilestonesWeight(invalidMilestones).isValid, false);
  assert.equal(validateMilestonesWeight(invalidMilestones).totalWeight, 70);
});

test('checkIsTaskOverdue marks unfinished past tasks as overdue', () => {
  const refDate = new Date('2026-12-18T10:00:00');
  
  // Due yesterday (17/12/2026) and not completed -> OVERDUE
  assert.equal(checkIsTaskOverdue('17/12/2026', 'Đang thực hiện', refDate), true);
  
  // Due yesterday but completed -> NOT overdue
  assert.equal(checkIsTaskOverdue('17/12/2026', 'Hoàn thành', refDate), false);

  // Due in future (22/12/2026) -> NOT overdue
  assert.equal(checkIsTaskOverdue('22/12/2026', 'Mới tạo', refDate), false);
});
