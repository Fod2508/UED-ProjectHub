import {
  UserProfile,
  CandidateApplicant,
  KanbanTask,
  Milestone,
  GroupReportData,
  FreeScheduleMatrix
} from '../types/index.ts';

export const INITIAL_STUDENT_USER: UserProfile = {
  id: 'user_student_1',
  name: 'Nguyễn Văn A',
  code: '211150531201',
  className: '21CNTT1',
  role: 'student',
  title: 'Trưởng nhóm (SV)',
  avatarText: 'NA',
  teamId: 'nhom_04',
  teamName: 'Nhóm 04 - Web App'
};

export const INITIAL_LECTURER_USER: UserProfile = {
  id: 'user_lecturer_1',
  name: 'TS. Trần Văn B',
  code: 'GV08291',
  role: 'lecturer',
  title: 'Giảng viên hướng dẫn',
  avatarText: 'TB',
  teamId: 'nhom_04',
  teamName: 'Khoa CNTT - ĐH Sư Phạm'
};

export const INITIAL_SCHEDULE_MATRIX: FreeScheduleMatrix = {
  T2: { Sáng: false, Chiều: true, Tối: true },
  T3: { Sáng: true, Chiều: false, Tối: true },
  T4: { Sáng: false, Chiều: true, Tối: false },
  T5: { Sáng: true, Chiều: false, Tối: true },
  T6: { Sáng: false, Chiều: true, Tối: true },
  T7: { Sáng: true, Chiều: true, Tối: false },
  CN: { Sáng: true, Chiều: false, Tối: false },
};

export const INITIAL_APPLICANTS: CandidateApplicant[] = [
  {
    id: 'app_1',
    name: 'Nguyễn Văn A',
    studentId: '211150531201',
    className: '21CNTT1',
    avatarText: 'NA',
    skills: ['Frontend (React)', 'Thiết kế UI/UX', 'Figma / Wireframing', 'Tailwind CSS'],
    matchedSessionsCount: 4,
    matchedSessionsDetails: 'T3 Sáng, T5 Sáng, T2 Tối, T5 Tối',
    note: 'Em chào nhóm, em có kinh nghiệm làm React và Figma, rất mong được đồng hành cùng nhóm hoàn thành đồ án môn này ạ.',
    skillScore: 95,
    timeScore: 87.5,
    matchScore: 92,
    isTopRecommendation: true,
    status: 'pending',
    appliedAt: '18/12/2026 08:30'
  },
  {
    id: 'app_2',
    name: 'Trần Minh Đức',
    studentId: '211150531238',
    className: '21CNTT2',
    avatarText: 'MĐ',
    skills: ['Frontend (Vue.js)', 'HTML/CSS', 'JavaScript Core'],
    matchedSessionsCount: 2,
    matchedSessionsDetails: 'T4 Chiều, T7 Sáng',
    note: 'Chào các bạn, mình từng thực tập làm Vue.js và cắt giao diện HTML/CSS chuẩn responsive, mong muốn gia nhập nhóm để cùng chạy đồ án đúng tiến độ.',
    skillScore: 80,
    timeScore: 82.5,
    matchScore: 81,
    isTopRecommendation: true,
    status: 'pending',
    appliedAt: '18/12/2026 09:15'
  },
  {
    id: 'app_3',
    name: 'Phạm Thị Hoa',
    studentId: '211150531289',
    className: '21CNTT1',
    avatarText: 'TH',
    skills: ['Kiểm thử phần mềm', 'Viết tài liệu SRS', 'Postman API'],
    matchedSessionsCount: 3,
    matchedSessionsDetails: 'T2 Tối, T6 Chiều, T7 Sáng',
    note: 'Chào nhóm 04, mình chuyên về kiểm thử phần mềm tự động và tài liệu đặc tả, mong muốn phối hợp cùng các bạn.',
    skillScore: 78,
    timeScore: 75,
    matchScore: 77,
    isTopRecommendation: false,
    status: 'accepted',
    appliedAt: '17/12/2026 14:20'
  }
];

export const INITIAL_TASKS: KanbanTask[] = [
  {
    id: 'tsk_01',
    code: '#TSK-01',
    title: 'Xây dựng kịch bản kiểm thử API',
    description: 'Thiết lập bộ test suite tự động Postman/Newman cho 14 endpoint backend',
    tag: 'Kiểm thử',
    priority: 'Thường',
    dueDate: '20/12/2026',
    assigneeName: 'Chưa giao',
    assigneeAvatar: '?',
    status: 'Mới tạo',
    milestoneId: 'm2'
  },
  {
    id: 'tsk_02',
    code: '#TSK-02',
    title: 'Viết tài liệu hướng dẫn cài đặt môi trường',
    description: 'Cấu hình Docker Compose cho MySQL, Redis & Node.js backend',
    tag: 'Tài liệu',
    priority: 'Thường',
    dueDate: '22/12/2026',
    assigneeName: 'Chưa giao',
    assigneeAvatar: '?',
    status: 'Mới tạo',
    milestoneId: 'm2'
  },
  {
    id: 'tsk_03',
    code: '#TSK-03',
    title: 'Thiết kế cấu trúc cơ sở dữ liệu MongoDB',
    description: 'Xây dựng Schema collections cho phiên thảo luận và đánh giá chéo',
    tag: 'Database',
    priority: 'Thường',
    dueDate: '14/12/2026',
    assigneeName: 'Trần Thu Hà',
    assigneeAvatar: 'TH',
    status: 'Đã giao việc',
    subtaskCount: '2/4 tiêu chí',
    milestoneId: 'm2'
  },
  {
    id: 'tsk_04',
    code: '#TSK-04',
    title: 'Hoàn thiện API xác thực JWT & Phân quyền',
    description: 'Cổng kết nối API đăng nhập SSO & phân quyền RBAC Giảng viên / Sinh viên',
    tag: 'Backend',
    priority: 'Ưu tiên Cao',
    dueDate: '17/12/2026', // Overdue!
    assigneeName: 'Lê Văn Cúc',
    assigneeAvatar: 'LC',
    status: 'Đang thực hiện',
    milestoneId: 'm2'
  },
  {
    id: 'tsk_05',
    code: '#TSK-05',
    title: 'Thiết kế Wireframe giao diện Đánh giá chéo',
    description: 'Lập prototype Figma theo khung chuẩn kiểm định chất lượng đào tạo',
    tag: 'UI/UX',
    priority: 'Thường',
    dueDate: '15/12/2026',
    assigneeName: 'Nguyễn Văn A',
    assigneeAvatar: 'NA',
    status: 'Đang thực hiện',
    milestoneId: 'm2'
  },
  {
    id: 'tsk_06',
    code: '#TSK-06',
    title: 'Mô tả 6 biểu đồ UML (Use Case, Activity, State)',
    description: 'Chờ Trưởng nhóm review và chuẩn hóa tài liệu nộp giữa kỳ',
    tag: 'Phân tích',
    priority: 'Thường',
    dueDate: '16/12/2026',
    assigneeName: 'Nguyễn Văn A',
    assigneeAvatar: 'NA',
    status: 'Chờ duyệt',
    milestoneId: 'm2'
  },
  {
    id: 'tsk_07',
    code: '#TSK-07',
    title: 'Khởi tạo repository Git & quy ước commit',
    description: 'Thiết lập branch protection rules và pull request template',
    tag: 'DevOps',
    priority: 'Thường',
    dueDate: '01/11/2026',
    assigneeName: 'Đặng Minh',
    assigneeAvatar: 'DM',
    status: 'Hoàn thành',
    mergePr: 'Đã merge PR #1',
    milestoneId: 'm1'
  },
  {
    id: 'tsk_08',
    code: '#TSK-08',
    title: 'Thiết kế CSDL PostgreSQL ERD Schema',
    description: 'Lược đồ quan hệ chuẩn hóa 3NF và tài liệu mô tả bảng dữ liệu',
    tag: 'Database',
    priority: 'Thường',
    dueDate: '01/11/2026',
    assigneeName: 'Trần Thu Hà',
    assigneeAvatar: 'TH',
    status: 'Hoàn thành',
    milestoneId: 'm1'
  },
  {
    id: 'tsk_09',
    code: '#TSK-09',
    title: 'Nộp đề cương đồ án cột mốc 1 (M1)',
    description: 'Báo cáo khảo sát thực tế và tài liệu đặc tả yêu cầu',
    tag: 'Milestone M1',
    priority: 'Thường',
    dueDate: '01/11/2026',
    assigneeName: 'Cả nhóm',
    assigneeAvatar: 'ALL',
    status: 'Hoàn thành',
    lecturerReviewed: true,
    lecturerScore: 9.5,
    milestoneId: 'm1'
  },
  {
    id: 'tsk_10',
    code: '#TSK-10',
    title: 'Xây dựng layout Dashboard & Bảng tiến độ',
    description: 'Giao diện SPA với Tailwind CSS và hệ thống icon Material Design',
    tag: 'Frontend',
    priority: 'Thường',
    dueDate: '05/12/2026',
    assigneeName: 'Nguyễn Văn A',
    assigneeAvatar: 'NA',
    status: 'Hoàn thành',
    milestoneId: 'm2'
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: 'Cột mốc 1: Khởi động & Nộp đề cương',
    phase: 'Giai đoạn khảo sát ban đầu',
    deliverables: 'Báo cáo khảo sát và tài liệu đặc tả yêu cầu',
    dueDate: '01/11/2026',
    weight: 20,
    status: 'Đã hoàn thành'
  },
  {
    id: 'm2',
    name: 'Cột mốc 2: Báo cáo giữa kỳ & Bản mẫu',
    phase: 'Bảo vệ thử nghiệm hệ thống',
    deliverables: 'Sơ đồ thiết kế hệ thống và bản mẫu thử nghiệm',
    dueDate: '15/12/2026',
    weight: 30,
    status: 'Đang mở (Nước rút)'
  },
  {
    id: 'm3',
    name: 'Cột mốc 3: Nghiệm thu kỹ thuật & Đánh giá chéo',
    phase: 'Kiểm tra chéo kết quả giữa các nhóm',
    deliverables: 'Kiểm thử chương trình và hoàn thành đánh giá chéo',
    dueDate: '05/01/2027',
    weight: 20,
    status: 'Chưa mở'
  },
  {
    id: 'm4',
    name: 'Cột mốc 4: Bảo vệ đồ án chính thức',
    phase: 'Hội đồng chấm khóa luận tốt nghiệp',
    deliverables: 'Bài trình chiếu báo cáo và video chạy thử hoàn chỉnh',
    dueDate: '15/01/2027',
    weight: 30,
    status: 'Chưa mở'
  }
];

export interface PeerReviewEntry {
  evaluatorId: string;
  targetId: string;
  targetName: string;
  targetRole: string;
  status: 'done' | 'evaluating' | 'pending';
  c1: number; // Mức độ & tiến độ (40%)
  c2: number; // Chất lượng & kỹ thuật (35%)
  c3: number; // Thái độ & làm việc nhóm (25%)
  comment: string;
}

export const INITIAL_PEER_REVIEWS: PeerReviewEntry[] = [
  {
    evaluatorId: 'user_student_1',
    targetId: 'mem_ha',
    targetName: 'Trần Thu Hà',
    targetRole: 'Cơ sở dữ liệu & Dịch vụ nền',
    status: 'done',
    c1: 5,
    c2: 4,
    c3: 5,
    comment: 'Hà làm việc rất trách nhiệm, hoàn thành lược đồ CSDL PostgreSQL đúng hẹn và hỗ trợ nhóm kết nối dữ liệu mượt mà.'
  },
  {
    evaluatorId: 'user_student_1',
    targetId: 'mem_cuc',
    targetName: 'Lê Văn Cúc',
    targetRole: 'Lập trình Backend & Cổng kết nối API',
    status: 'evaluating',
    c1: 3,
    c2: 4,
    c3: 4,
    comment: 'Bạn Cúc viết mã nguồn API rất chuẩn, tuy nhiên cần chú ý cập nhật trạng thái công việc sớm hơn trên bảng tiến độ để nhóm không bị động về hạn chót.'
  },
  {
    evaluatorId: 'user_student_1',
    targetId: 'mem_minh',
    targetName: 'Đặng Minh',
    targetRole: 'Kiểm thử & Triển khai',
    status: 'pending',
    c1: 4,
    c2: 4,
    c3: 4,
    comment: 'Minh hỗ trợ setup Git và CI/CD tốt, phản hồi nhanh nhẹn trong các buổi họp kỹ thuật.'
  }
];

export const INITIAL_GROUP_REPORT: GroupReportData = {
  groupId: 'nhom_04',
  groupName: 'Nhóm 04 - Hệ thống Quản lý Đồ án (Đang xem)',
  projectTopic: 'Hệ thống Quản lý Đồ án Môn học',
  membersCount: 4,
  membersMax: 4,
  milestoneId: 'm2',
  milestoneName: 'Cột mốc 2',
  submissionProgress: '100% (12/12 nhóm đã nộp)',
  peerReviewProgress: '100% hoàn thành',
  warningCount: 1,
  status: 'Chờ giảng viên phê duyệt',
  lecturerInstruction: 'Phát hiện thành viên Lê Văn Cúc có điểm đóng góp 38% và trễ hạn công việc cốt lõi. Yêu cầu Trưởng nhóm và thành viên Cúc nộp bản giải trình phân công công việc trước ngày 20/12/2026.',
  members: [
    {
      id: 'mem_an',
      name: 'Nguyễn Văn A',
      studentId: '211150531201',
      avatarText: 'NA',
      roleInTeam: 'Giao diện người dùng & Trải nghiệm',
      completedTasks: 4,
      totalTasks: 4,
      completionRate: 100,
      hasOverdueTask: false,
      peerScoreAvg: 4.8,
      contributionScore: 98,
      status: 'Đóng góp tích cực',
      isWarning: false
    },
    {
      id: 'mem_ha',
      name: 'Trần Thu Hà',
      studentId: '21115053120115',
      avatarText: 'TH',
      roleInTeam: 'Cơ sở dữ liệu & Dịch vụ nền',
      completedTasks: 3,
      totalTasks: 3,
      completionRate: 100,
      hasOverdueTask: false,
      peerScoreAvg: 4.5,
      contributionScore: 92,
      status: 'Đóng góp tích cực',
      isWarning: false
    },
    {
      id: 'mem_minh',
      name: 'Đặng Minh',
      studentId: '21115053120108',
      avatarText: 'DM',
      roleInTeam: 'Kiểm thử & Triển khai hệ thống',
      completedTasks: 4,
      totalTasks: 5,
      completionRate: 80,
      hasOverdueTask: false,
      peerScoreAvg: 3.8,
      contributionScore: 78,
      status: 'Đạt chuẩn',
      isWarning: false
    },
    {
      id: 'mem_cuc',
      name: 'Lê Văn Cúc',
      studentId: '21115053120120',
      avatarText: 'LC',
      roleInTeam: 'Lập trình máy chủ & Dữ liệu',
      completedTasks: 2,
      totalTasks: 5,
      completionRate: 40,
      hasOverdueTask: true,
      peerScoreAvg: 2.1,
      contributionScore: 38,
      status: 'Cảnh báo thiếu đóng góp',
      isWarning: true,
      warningReason: 'Điểm đóng góp 38% (< 50%) và Điểm đánh giá chéo 2.1/5 (< 2.5), trễ hạn 1 task cốt lõi'
    }
  ]
};
