import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenType,
  UserRole,
  UserProfile,
  FreeScheduleMatrix,
  CandidateApplicant,
  KanbanTask,
  Milestone,
  MemberContributionData,
  GroupReportData,
  TaskStatus,
  TimeSlot
} from '../types/index.ts';
import {
  INITIAL_STUDENT_USER,
  INITIAL_LECTURER_USER,
  INITIAL_SCHEDULE_MATRIX,
  INITIAL_APPLICANTS,
  INITIAL_TASKS,
  INITIAL_MILESTONES,
  INITIAL_PEER_REVIEWS,
  INITIAL_GROUP_REPORT,
  PeerReviewEntry
} from '../data/initialData.ts';
import {
  validateMilestonesWeight,
  calculateContributionScore,
  getContributionStatus
} from '../utils/scoring.ts';

const STORAGE_KEY = 'ud_dn_projecthub_state_v2';

interface AppContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  currentRole: UserRole;
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;

  // Schedule matrix
  scheduleMatrix: FreeScheduleMatrix;
  toggleScheduleSlot: (day: string, slot: TimeSlot) => void;

  // Applicants (Giai đoạn 1)
  applicants: CandidateApplicant[];
  acceptApplicant: (id: string) => void;
  rejectApplicant: (id: string) => void;
  sendJoinRequest: (skills: string[], note: string) => void;
  isApplicantModalOpen: boolean;
  setIsApplicantModalOpen: (open: boolean) => void;
  currentTeamCount: number;

  // Kanban Tasks (Giai đoạn 2)
  tasks: KanbanTask[];
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addTask: (task: Omit<KanbanTask, 'id' | 'code'>) => void;
  updateTask: (taskId: string, updates: Partial<KanbanTask>) => void;
  deleteTask: (taskId: string) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;

  // Milestones (Giai đoạn 2)
  milestones: Milestone[];
  allowInternalMilestone: boolean;
  setAllowInternalMilestone: (val: boolean) => void;
  isAddMilestoneModalOpen: boolean;
  setIsAddMilestoneModalOpen: (open: boolean) => void;
  addMilestone: (item: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  publishMilestones: () => { success: boolean; message: string };
  isMilestoneLocked: boolean;

  // Peer review (Giai đoạn 3)
  peerReviews: PeerReviewEntry[];
  activeEvaluatingTargetId: string;
  setActiveEvaluatingTargetId: (id: string) => void;
  savePeerReviewDraft: (targetId: string, updates: Partial<PeerReviewEntry>) => void;
  submitAndNextPeerReview: (targetId: string, updates: Partial<PeerReviewEntry>) => void;

  // Contribution & Anti Free-rider report (Giai đoạn 3)
  groupReport: GroupReportData;
  setLecturerInstruction: (text: string) => void;
  approveAllScores: () => void;
  requestExplanation: (instruction: string) => void;
  requestReEvaluation: (instruction: string) => void;
  viewingDetailMember: MemberContributionData | null;
  setViewingDetailMember: (member: MemberContributionData | null) => void;

  // Toast banner
  toastMessage: { text: string; type: 'success' | 'warning' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  clearToast: () => void;

  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or use initial
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    return 'landing';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const currentUser = currentRole === 'student' ? INITIAL_STUDENT_USER : INITIAL_LECTURER_USER;

  const [scheduleMatrix, setScheduleMatrix] = useState<FreeScheduleMatrix>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE_MATRIX;
    } catch {
      return INITIAL_SCHEDULE_MATRIX;
    }
  });

  const [applicants, setApplicants] = useState<CandidateApplicant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_applicants');
      return saved ? JSON.parse(saved) : INITIAL_APPLICANTS;
    } catch {
      return INITIAL_APPLICANTS;
    }
  });

  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_milestones');
      return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  });

  const [allowInternalMilestone, setAllowInternalMilestone] = useState(true);
  const [isMilestoneLocked, setIsMilestoneLocked] = useState(false);

  const [peerReviews, setPeerReviews] = useState<PeerReviewEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_peer_reviews');
      return saved ? JSON.parse(saved) : INITIAL_PEER_REVIEWS;
    } catch {
      return INITIAL_PEER_REVIEWS;
    }
  });

  const [activeEvaluatingTargetId, setActiveEvaluatingTargetId] = useState<string>('mem_cuc');

  const [groupReport, setGroupReport] = useState<GroupReportData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_group_report');
      return saved ? JSON.parse(saved) : INITIAL_GROUP_REPORT;
    } catch {
      return INITIAL_GROUP_REPORT;
    }
  });

  // Modals
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [viewingDetailMember, setViewingDetailMember] = useState<MemberContributionData | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_schedule', JSON.stringify(scheduleMatrix));
      localStorage.setItem(STORAGE_KEY + '_applicants', JSON.stringify(applicants));
      localStorage.setItem(STORAGE_KEY + '_tasks', JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEY + '_milestones', JSON.stringify(milestones));
      localStorage.setItem(STORAGE_KEY + '_peer_reviews', JSON.stringify(peerReviews));
      localStorage.setItem(STORAGE_KEY + '_group_report', JSON.stringify(groupReport));
    } catch {
      // ignore
    }
  }, [scheduleMatrix, applicants, tasks, milestones, peerReviews, groupReport]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    showToast(`Đã chuyển đổi quyền sang: ${role === 'student' ? 'Sinh viên (Nguyễn Văn A)' : 'Giảng viên (TS. Trần Văn B)'}`, 'info');
  };

  // Schedule slot toggle
  const toggleScheduleSlot = (day: string, slot: TimeSlot) => {
    setScheduleMatrix((prev) => {
      const daySlots = prev[day] || {};
      const currentVal = !!daySlots[slot];
      return {
        ...prev,
        [day]: {
          ...daySlots,
          [slot]: !currentVal
        }
      };
    });
  };

  // Team count
  const currentTeamCount = 2 + applicants.filter((a) => a.status === 'accepted').length;

  // Accept / Reject applicants
  const acceptApplicant = (id: string) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'accepted' } : app))
    );
    showToast('Đã chấp nhận thành viên vào Nhóm 04! Sĩ số nhóm đã được cập nhật.', 'success');
  };

  const rejectApplicant = (id: string) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app))
    );
    showToast('Đã từ chối hồ sơ ứng tuyển.', 'info');
  };

  const sendJoinRequest = (skills: string[], note: string) => {
    const newApp: CandidateApplicant = {
      id: `app_${Date.now()}`,
      name: 'Nguyễn Văn A',
      studentId: '211150531201',
      className: '21CNTT1',
      avatarText: 'NA',
      skills: skills.length ? skills : ['Frontend (React)', 'Figma UI/UX'],
      matchedSessionsCount: 4,
      matchedSessionsDetails: 'T3 Sáng, T5 Sáng, T2 Tối, T5 Tối',
      note: note || 'Em xin phép gửi yêu cầu tham gia Nhóm 04 đồ án.',
      skillScore: 92,
      timeScore: 85,
      matchScore: 89,
      isTopRecommendation: true,
      status: 'pending',
      appliedAt: 'Vừa xong'
    };
    setApplicants((prev) => [newApp, ...prev]);
    showToast('Đã gửi yêu cầu tham gia nhóm thành công! Trạng thái: Chờ duyệt (Pending).', 'success');
  };

  // Move tasks on Kanban
  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const addTask = (taskData: Omit<KanbanTask, 'id' | 'code'>) => {
    const nextNumber = tasks.length + 1;
    const newTask: KanbanTask = {
      ...taskData,
      id: `tsk_${Date.now()}`,
      code: `#TSK-${String(nextNumber).padStart(2, '0')}`
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Đã tạo tác vụ mới: ${newTask.title}`, 'success');
  };

  const updateTask = (taskId: string, updates: Partial<KanbanTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Đã xóa tác vụ.', 'info');
  };

  // Milestone management
  const addMilestone = (item: Omit<Milestone, 'id'>) => {
    const newId = `m_${Date.now()}`;
    setMilestones((prev) => [...prev, { ...item, id: newId }]);
    showToast('Đã thêm cột mốc mới.', 'success');
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    showToast('Đã cập nhật thông tin cột mốc.', 'success');
  };

  const publishMilestones = () => {
    const validation = validateMilestonesWeight(milestones);
    if (!validation.isValid) {
      showToast(
        `Không thể công bố! Tổng trọng số hiện tại là ${validation.totalWeight}%. Yêu cầu tổng trọng số phải chính xác 100%.`,
        'error'
      );
      return {
        success: false,
        message: `Tổng trọng số là ${validation.totalWeight}%, cần đúng 100%!`
      };
    }

    setIsMilestoneLocked(true);
    showToast('🚀 Đã công bố Cột mốc & Mở khóa Bảng tiến độ công việc thành công!', 'success');
    return {
      success: true,
      message: 'Công bố thành công!'
    };
  };

  // Peer review
  const savePeerReviewDraft = (targetId: string, updates: Partial<PeerReviewEntry>) => {
    setPeerReviews((prev) =>
      prev.map((item) => (item.targetId === targetId ? { ...item, ...updates } : item))
    );
    showToast('Đã lưu bản nháp đánh giá chéo.', 'info');
  };

  const submitAndNextPeerReview = (targetId: string, updates: Partial<PeerReviewEntry>) => {
    setPeerReviews((prev) => {
      const updated = prev.map((item) =>
        item.targetId === targetId ? { ...item, ...updates, status: 'done' as const } : item
      );

      // Find next member who is not done
      const nextPending = updated.find((m) => m.status !== 'done' && m.targetId !== targetId);
      if (nextPending) {
        setActiveEvaluatingTargetId(nextPending.targetId);
        showToast('Đã lưu đánh giá! Đang chuyển sang thành viên tiếp theo.', 'success');
      } else {
        showToast('🎉 Bạn đã hoàn thành toàn bộ đánh giá chéo cho các thành viên trong nhóm!', 'success');
      }

      // If evaluating Le Van Cuc, recalculate his score in report
      if (targetId === 'mem_cuc') {
        const avgScore = ((updates.c1 ?? 3) * 0.4 + (updates.c2 ?? 4) * 0.35 + (updates.c3 ?? 4) * 0.25);
        const roundedAvg = Math.round(avgScore * 10) / 10;
        const newContrib = calculateContributionScore(40, roundedAvg);
        const statusObj = getContributionStatus(newContrib, roundedAvg);

        setGroupReport((r) => ({
          ...r,
          members: r.members.map((m) =>
            m.id === 'mem_cuc'
              ? {
                  ...m,
                  peerScoreAvg: roundedAvg,
                  contributionScore: newContrib,
                  status: statusObj.status,
                  isWarning: statusObj.isWarning
                }
              : m
          )
        }));
      }

      return updated;
    });
  };

  // Group report actions (Lecturer)
  const setLecturerInstruction = (text: string) => {
    setGroupReport((prev) => ({ ...prev, lecturerInstruction: text }));
  };

  const approveAllScores = () => {
    setGroupReport((prev) => ({
      ...prev,
      status: 'Đã phê duyệt'
    }));
    showToast('Đã phê duyệt và khóa toàn bộ điểm số Cột mốc 2 cho Nhóm 04.', 'success');
  };

  const requestExplanation = (instruction: string) => {
    setGroupReport((prev) => ({
      ...prev,
      status: 'Yêu cầu giải trình',
      lecturerInstruction: instruction
    }));
    showToast('Đã gửi thông báo yêu cầu Trưởng nhóm và thành viên nộp bản giải trình.', 'warning');
  };

  const requestReEvaluation = (instruction: string) => {
    setGroupReport((prev) => ({
      ...prev,
      status: 'Yêu cầu đánh giá lại',
      lecturerInstruction: instruction
    }));
    showToast('Đã gửi thông báo yêu cầu Nhóm 04 thực hiện đánh giá chéo lại.', 'info');
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY + '_schedule');
    localStorage.removeItem(STORAGE_KEY + '_applicants');
    localStorage.removeItem(STORAGE_KEY + '_tasks');
    localStorage.removeItem(STORAGE_KEY + '_milestones');
    localStorage.removeItem(STORAGE_KEY + '_peer_reviews');
    localStorage.removeItem(STORAGE_KEY + '_group_report');

    setScheduleMatrix(INITIAL_SCHEDULE_MATRIX);
    setApplicants(INITIAL_APPLICANTS);
    setTasks(INITIAL_TASKS);
    setMilestones(INITIAL_MILESTONES);
    setPeerReviews(INITIAL_PEER_REVIEWS);
    setGroupReport(INITIAL_GROUP_REPORT);
    setActiveEvaluatingTargetId('mem_cuc');
    setCurrentRole('student');
    showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        currentRole,
        currentUser,
        switchRole,
        scheduleMatrix,
        toggleScheduleSlot,
        applicants,
        acceptApplicant,
        rejectApplicant,
        sendJoinRequest,
        isApplicantModalOpen,
        setIsApplicantModalOpen,
        currentTeamCount,
        tasks,
        moveTask,
        addTask,
        updateTask,
        deleteTask,
        isNewTaskModalOpen,
        setIsNewTaskModalOpen,
        milestones,
        allowInternalMilestone,
        setAllowInternalMilestone,
        isAddMilestoneModalOpen,
        setIsAddMilestoneModalOpen,
        addMilestone,
        updateMilestone,
        publishMilestones,
        isMilestoneLocked,
        peerReviews,
        activeEvaluatingTargetId,
        setActiveEvaluatingTargetId,
        savePeerReviewDraft,
        submitAndNextPeerReview,
        groupReport,
        setLecturerInstruction,
        approveAllScores,
        requestExplanation,
        requestReEvaluation,
        viewingDetailMember,
        setViewingDetailMember,
        toastMessage,
        showToast,
        clearToast,
        resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
