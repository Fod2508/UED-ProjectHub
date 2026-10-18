export type UserRole = 'student' | 'lecturer';

export type ScreenType =
  | 'landing'
  | 'dashboard'
  | 'matchmaking'
  | 'kanban'
  | 'milestones'
  | 'peer_review'
  | 'report';

export interface UserProfile {
  id: string;
  name: string;
  code: string; // Mã SV or Mã GV
  className?: string; // Lớp 21CNTT1
  role: UserRole;
  title: string;
  avatarText: string;
  teamId?: string;
  teamName?: string;
}

export type DayOfWeek = 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN';
export type TimeSlot = 'Sáng' | 'Chiều' | 'Tối';

export interface FreeScheduleMatrix {
  [day: string]: {
    [slot in TimeSlot]?: boolean;
  };
}

export interface CandidateApplicant {
  id: string;
  name: string;
  studentId: string;
  className: string;
  avatarText: string;
  skills: string[];
  matchedSessionsCount: number;
  matchedSessionsDetails: string;
  note: string;
  skillScore: number;
  timeScore: number;
  matchScore: number; // FinalScore
  isTopRecommendation: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export type TaskStatus = 'Mới tạo' | 'Đã giao việc' | 'Đang thực hiện' | 'Chờ duyệt' | 'Hoàn thành';

export interface KanbanTask {
  id: string;
  code: string; // e.g. #TSK-12
  title: string;
  description?: string;
  tag: string;
  priority?: 'Thường' | 'Ưu tiên Cao' | 'Khẩn cấp';
  dueDate: string; // "17/12/2026" or "Hôm nay"
  assigneeName: string;
  assigneeAvatar: string;
  status: TaskStatus;
  subtaskCount?: string; // "2/4 tiêu chí"
  mergePr?: string; // "Đã merge PR #1"
  lecturerReviewed?: boolean;
  lecturerScore?: number;
  milestoneId?: string;
}

export interface Milestone {
  id: string;
  name: string;
  phase: string;
  deliverables: string;
  dueDate: string;
  weight: number; // percentage
  status: 'Đã hoàn thành' | 'Đang mở (Nước rút)' | 'Chưa mở' | 'Đã khóa';
}

export interface PeerEvaluationInput {
  targetMemberId: string;
  criterion1Score: number; // Mức độ & tiến độ (40%)
  criterion2Score: number; // Chất lượng & kỹ thuật (35%)
  criterion3Score: number; // Thái độ & làm việc nhóm (25%)
  comment: string;
  isDraft: boolean;
}

export interface MemberContributionData {
  id: string;
  name: string;
  studentId: string;
  avatarText: string;
  roleInTeam: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number; // e.g. 100, 80, 40 (%)
  hasOverdueTask: boolean;
  peerScoreAvg: number; // e.g. 4.8, 4.5, 3.8, 2.1
  contributionScore: number; // Calculated via (completionRate*0.5) + (peerScoreAvg/5*100*0.5)
  status: 'Đóng góp tích cực' | 'Đạt chuẩn' | 'Cảnh báo thiếu đóng góp';
  isWarning: boolean;
  warningReason?: string;
}

export interface GroupReportData {
  groupId: string;
  groupName: string;
  projectTopic: string;
  membersCount: number;
  membersMax: number;
  milestoneId: string;
  milestoneName: string;
  submissionProgress: string; // "100%"
  peerReviewProgress: string; // "100% hoàn thành"
  warningCount: number;
  status: 'Chờ giảng viên phê duyệt' | 'Đã phê duyệt' | 'Yêu cầu giải trình' | 'Yêu cầu đánh giá lại';
  lecturerInstruction: string;
  members: MemberContributionData[];
}
