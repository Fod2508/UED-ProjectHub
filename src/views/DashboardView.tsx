import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { groupService } from "../services/groupService.ts";
import { GroupMembersCard } from "../components/GroupMembersCard.tsx";
import {
  Users,
  KanbanSquare,
  CalendarCheck,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Crown,
  Calendar,
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const {
    setCurrentScreen,
    tasks,
    milestones,
    groupReport,
    currentRole,
    currentUser,
    classGroups,
  } = useApp();

  const [groupMembers, setGroupMembers] = useState<
    Array<{
      id: string;
      name: string;
      email?: string;
      avatarText: string;
      role?: string;
      skills: string[];
      isLeader: boolean;
    }>
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Load group members
  useEffect(() => {
    const loadGroupMembers = async () => {
      if (!currentUser?.teamId) {
        setLoadingMembers(false);
        return;
      }

      try {
        const members = await groupService.getGroupMembers(currentUser.teamId);
        setGroupMembers(members);
      } catch (error) {
        console.error("Error loading group members:", error);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadGroupMembers();
  }, [currentUser?.teamId]);

  const completedTasks = tasks.filter((t) => t.status === "Hoàn thành").length;
  const overdueTasks = tasks.filter(
    (t) => t.priority === "Ưu tiên Cao" && t.status !== "Hoàn thành",
  ).length;
  const activeMilestone = milestones.find(
    (m) => m.status === "Đang mở (Nước rút)",
  ) ||
    milestones[1] || { name: "Cột mốc 2", dueDate: "15/12/2026" };

  const warningMembers = groupReport.members.filter((m) => m.isWarning);

  // ==========================================
  // LECTURER VIEW: DASHBOARD TỔNG QUAN MÔN HỌC
  // ==========================================
  if (currentRole === "lecturer") {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* 1. Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-sm opacity-90 mb-2">Học kỳ 1 • 2026 - 2027</p>
            <h1 className="text-3xl font-bold mb-4">
              Học phần Đồ án Chuyên ngành
            </h1>
            <p className="text-base opacity-90 mb-6">
              Quản trị môn học, giám sát tiến độ các nhóm đồ án, cấu hình cột mốc và xem báo cáo đánh giá chéo.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentScreen("kanban")}
                className="px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <KanbanSquare className="w-5 h-5" />
                <span>Tiến độ công việc</span>
              </button>

              <button
                onClick={() => setCurrentScreen("report")}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Báo cáo</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => setCurrentScreen("matchmaking")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {classGroups.length} nhóm
            </div>
            <p className="text-sm text-slate-600">Nhóm sinh viên</p>
          </div>

          <div
            onClick={() => setCurrentScreen("kanban")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <Clock className="w-8 h-8 text-indigo-600 mb-3" />
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {completedTasks}/{tasks.length}
            </div>
            <p className="text-sm text-slate-600">Tasks hoàn thành</p>
          </div>

          <div
            onClick={() => setCurrentScreen("milestones")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <CalendarCheck className="w-8 h-8 text-emerald-600 mb-3" />
            <div className="text-lg font-bold text-slate-900 mb-1 truncate">
              {activeMilestone?.name || "Cột mốc 2"}
            </div>
            <p className="text-sm text-slate-600">
              {activeMilestone?.dueDate || "15/12/2026"}
            </p>
          </div>

          <div
            onClick={() => setCurrentScreen("report")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <AlertTriangle className="w-8 h-8 text-rose-600 mb-3" />
            <div className="text-3xl font-bold text-rose-600 mb-1">
              {warningMembers.length}
            </div>
            <p className="text-sm text-slate-600">Cảnh báo</p>
          </div>
        </div>

        {/* 3. Workflow Phases */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Quy trình</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phase 1 */}
            <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Ghép nhóm
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Khảo sát lịch rảnh và danh sách nhóm môn học
              </p>
              <button
                onClick={() => setCurrentScreen("matchmaking")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Phase 2 */}
            <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tiến độ</h3>
              <p className="text-sm text-slate-600 mb-4">
                Tiến độ công việc và quản lý cột mốc
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen("kanban")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Bảng tiến độ
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setCurrentScreen("milestones")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Cột mốc
                </button>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Đánh giá
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Đánh giá chéo minh bạch &amp; công bằng
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen("peer_review")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Đánh giá
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setCurrentScreen("report")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Danh sách các Nhóm đồ án */}
        <div className="bg-white p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              Danh sách các Nhóm đồ án ({classGroups.length})
            </h3>
            <button
              onClick={() => setCurrentScreen("matchmaking")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Quản lý nhóm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classGroups.map((g) => (
              <div
                key={g.id}
                onClick={() => setCurrentScreen("kanban")}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {g.name.split(" - ")[0] || "Nhóm"}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {g.memberCount}/{g.maxMembers} thành viên
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate mb-1">
                  {g.name}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1 mb-3">
                  Đề tài: {g.topic}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Trưởng nhóm: <strong className="text-slate-700">{g.leaderName}</strong></span>
                  <span className="text-emerald-600 font-semibold">{g.kanbanProgress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Cảnh báo & Đóng góp thành viên */}
        <div className="bg-white p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              Đóng góp thành viên
            </h3>
            <button
              onClick={() => setCurrentScreen("report")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem báo cáo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupReport.members.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl transition ${
                  m.isWarning
                    ? "bg-rose-50 border border-rose-200"
                    : "bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      m.isWarning ? "bg-rose-600" : "bg-blue-600"
                    }`}
                  >
                    {m.avatarText}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {m.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {m.studentId}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                  {m.roleInTeam}
                </p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-slate-500">Đóng góp</span>
                  <span
                    className={`text-base font-bold ${m.isWarning ? "text-rose-600" : "text-blue-600"}`}
                  >
                    {m.contributionScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT VIEW (TRƯỞNG NHÓM / THÀNH VIÊN)
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Hero Banner - Conditional based on group membership */}
      {currentUser?.teamId ? (
        // User HAS a group - Show group dashboard
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-sm opacity-90 mb-2">Học kỳ 1 • 2026 - 2027</p>
            <h1 className="text-3xl font-bold mb-4">
              {currentUser.teamName || "Nhóm"} - Quản lý Đồ án
            </h1>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setCurrentScreen("kanban")}
                className="px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition flex items-center gap-2 cursor-pointer"
              >
                <KanbanSquare className="w-5 h-5" />
                <span>Tiến độ công việc</span>
              </button>

              <button
                onClick={() => setCurrentScreen("report")}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Báo cáo</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // User DOES NOT have a group - Show welcome message
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-3xl p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-sm opacity-90 mb-2">Học kỳ 1 • 2026 - 2027</p>
            <h1 className="text-3xl font-bold mb-4">
              Chào mừng đến với UED ProjectHub
            </h1>
            <p className="text-base opacity-90 mb-6">
              Bạn chưa tham gia nhóm nào. Hãy tìm nhóm phù hợp hoặc tạo nhóm mới
              để bắt đầu làm việc!
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentScreen("matchmaking")}
                className="px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-5 h-5" />
                <span>Tìm nhóm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. KPI Cards - Only show if user has a group */}
      {currentUser?.teamId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div
            onClick={() => setCurrentScreen("matchmaking")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {groupMembers.length}/{4}
            </div>
            <p className="text-sm text-slate-600">Thành viên</p>
          </div>

          {/* KPI 2 */}
          <div
            onClick={() => setCurrentScreen("kanban")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <Clock className="w-8 h-8 text-indigo-600 mb-3" />
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {completedTasks}/{tasks.length}
            </div>
            <p className="text-sm text-slate-600">Tasks hoàn thành</p>
          </div>

          {/* KPI 3 */}
          <div
            onClick={() => setCurrentScreen("milestones")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <CalendarCheck className="w-8 h-8 text-emerald-600 mb-3" />
            <div className="text-lg font-bold text-slate-900 mb-1 truncate">
              {activeMilestone?.name || "Cột mốc 2"}
            </div>
            <p className="text-sm text-slate-600">
              {activeMilestone?.dueDate || "15/12/2026"}
            </p>
          </div>

          {/* KPI 4 */}
          <div
            onClick={() => setCurrentScreen("report")}
            className="bg-white p-6 rounded-2xl hover:shadow-lg transition cursor-pointer"
          >
            <AlertTriangle className="w-8 h-8 text-rose-600 mb-3" />
            <div className="text-3xl font-bold text-rose-600 mb-1">
              {warningMembers.length}
            </div>
            <p className="text-sm text-slate-600">Cảnh báo</p>
          </div>
        </div>
      )}

      {/* 3. Workflow Phases - Simplified */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Quy trình</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 1 */}
          <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Ghép nhóm
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Khảo sát lịch rảnh và ghép nhóm thông minh
            </p>
            <button
              onClick={() => setCurrentScreen("matchmaking")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Phase 2 */}
          <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Tiến độ</h3>
            <p className="text-sm text-slate-600 mb-4">
              Tiến độ công việc và quản lý cột mốc
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen("kanban")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Bảng tiến độ
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setCurrentScreen("milestones")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Cột mốc
              </button>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Đánh giá
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Đánh giá chéo minh bạch &amp; công bằng
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen("peer_review")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Đánh giá
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setCurrentScreen("report")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Báo cáo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Group Members Card - New Component */}
      {currentUser?.teamId && groupMembers.length > 0 && (
        <GroupMembersCard
          members={groupMembers}
          groupName={currentUser.teamName || "Nhóm 04"}
          maxMembers={4}
        />
      )}

      {/* 5. Team Members Contribution - Only show if user has a group */}
      {currentUser?.teamId && (
        <div className="bg-white p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              Đóng góp thành viên
            </h3>
            {currentUser.teamId !== "nhom_04" && (
              <span className="text-xs text-slate-500 font-medium">
                Chưa mở phiên đánh giá chéo
              </span>
            )}
          </div>

          {currentUser.teamId === "nhom_04" ? (
            /* Dữ liệu mẫu đánh giá của Nhóm 04 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {groupReport.members.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl transition ${
                    m.isWarning
                      ? "bg-rose-50 border border-rose-200"
                      : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                        m.isWarning ? "bg-rose-600" : "bg-blue-600"
                      }`}
                    >
                      {m.avatarText}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {m.name}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {m.studentId}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                    {m.roleInTeam}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-slate-500">Đóng góp</span>
                    <span
                      className={`text-base font-bold ${m.isWarning ? "text-rose-600" : "text-blue-600"}`}
                    >
                      {m.contributionScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Dữ liệu thực tế của Nhóm mới tạo hoặc nhóm khác */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(groupMembers.length > 0
                  ? groupMembers
                  : [
                      {
                        id: currentUser.id,
                        name: currentUser.name,
                        avatarText: currentUser.avatarText || "SV",
                        skills: [],
                        isLeader: currentUser.isGroupLeader || true,
                      },
                    ]
                ).map((m) => (
                  <div key={m.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {m.avatarText}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {m.name}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {m.isLeader ? "Trưởng nhóm" : "Thành viên"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                      {m.isLeader ? "Quản lý nhóm đồ án" : "Thành viên đồ án"}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                      <span className="text-xs text-slate-500">Đóng góp</span>
                      <span className="text-sm font-bold text-slate-500">
                        Chưa đánh giá
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                💡 Điểm số đóng góp sẽ được hệ thống tự động tổng hợp sau khi Giảng viên kết thúc Cột mốc nộp bài và các thành viên trong nhóm hoàn tất đánh giá chéo.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 6. Danh sách các Nhóm đồ án trong lớp */}
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Danh sách các Nhóm đồ án trong lớp ({classGroups.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tất cả các nhóm đồ án đang hoạt động và tuyển thành viên trong lớp học phần
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen("matchmaking")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
          >
            <span>Xem tất cả &amp; Ghép nhóm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classGroups.map((g) => {
            const isFull = g.memberCount >= g.maxMembers;
            const isMyGroup = currentUser?.teamId === g.id;
            return (
              <div
                key={g.id}
                onClick={() => setCurrentScreen("matchmaking")}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isMyGroup
                    ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20"
                    : "bg-slate-50 border-slate-200/80 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {g.name.split(" - ")[0] || "Nhóm"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isMyGroup && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Nhóm của bạn
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isFull
                          ? "bg-slate-200 text-slate-600"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {g.memberCount}/{g.maxMembers} TV
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate mb-1">
                  {g.name}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1 mb-3">
                  Đề tài: {g.topic}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>
                    Trưởng nhóm:{" "}
                    <strong className="text-slate-700">{g.leaderName}</strong>
                  </span>
                  <span className="text-blue-600 font-medium">Chi tiết →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
