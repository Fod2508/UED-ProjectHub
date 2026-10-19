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
        {/* 1. Lecturer Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-sm">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Chế độ Quản trị Môn học: TS. Trần Văn B</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Học phần Đồ án Chuyên ngành (HK1 2026 - 2027)
            </h1>
            <p className="text-sm opacity-90 leading-relaxed">
              Theo dõi tiến độ toàn bộ 6 nhóm đồ án sinh viên, quản lý khung điểm 100%, cấu hình tiêu chí đánh giá chéo và phát hiện sớm các trường hợp Free-rider cần can thiệp.
            </p>

            <div className="flex flex-wrap gap-3 pt-3">
              <button
                onClick={() => setCurrentScreen("milestones")}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-xs sm:text-sm hover:bg-indigo-50 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Cột mốc &amp; Khung 100%</span>
              </button>

              <button
                onClick={() => setCurrentScreen("matchmaking")}
                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Quản lý 6 Nhóm ({classGroups.length})</span>
              </button>

              <button
                onClick={() => setCurrentScreen("report")}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Xử lý Cảnh báo Free-rider</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => setCurrentScreen("matchmaking")}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nhóm sinh viên
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {classGroups.length} nhóm
            </div>
            <p className="text-xs text-slate-500 mt-1">46/48 SV đã có nhóm</p>
          </div>

          <div
            onClick={() => setCurrentScreen("kanban")}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tiến độ Sprint chung
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <KanbanSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-600">
              {completedTasks}/{tasks.length} tasks
            </div>
            <p className="text-xs text-slate-500 mt-1">Bảng Kanban đang mở</p>
          </div>

          <div
            onClick={() => setCurrentScreen("peer_review")}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Đánh giá chéo Cột mốc 2
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              87.5%
            </div>
            <p className="text-xs text-slate-500 mt-1">4/6 nhóm đã nộp đủ</p>
          </div>

          <div
            onClick={() => setCurrentScreen("report")}
            className="bg-white p-6 rounded-2xl border-2 border-rose-200 shadow-xs hover:border-rose-400 hover:shadow-md transition cursor-pointer bg-rose-50/20"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Cảnh báo Free-rider
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-600">
              1 trường hợp
            </div>
            <p className="text-xs text-rose-700 mt-1">Cần yêu cầu giải trình</p>
          </div>
        </div>

        {/* 3. Workflow 3 Stages Overview for Lecturer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Tiến độ 3 Giai đoạn của Học phần
            </h2>
            <span className="text-xs font-medium text-slate-500">
              Mô hình Scrum &amp; Nghiệm thu Đóng góp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stage 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                  Hoàn tất
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Giai đoạn 1: Ghép nhóm thông minh
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                So khớp ma trận kỹ năng và lịch rảnh. Các Trưởng nhóm đã duyệt xong ứng viên gia nhập.
              </p>
              <button
                onClick={() => setCurrentScreen("matchmaking")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Xem danh mục nhóm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stage 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
                  Đang diễn ra
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Giai đoạn 2: Theo dõi tiến độ Kanban
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Giảng viên đã công bố Cột mốc 2 (30% trọng số). Các nhóm đang phân chia task và chạy nước rút.
              </p>
              <button
                onClick={() => setCurrentScreen("kanban")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Giám sát Kanban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stage 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200">
                  Đang đánh giá
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Giai đoạn 3: Nghiệm thu &amp; Free-rider
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đánh giá chéo ẩn danh 3 tiêu chí. Tổng hợp điểm tự động để phát hiện thành viên ỷ lại.
              </p>
              <button
                onClick={() => setCurrentScreen("report")}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Xem Báo cáo đóng góp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
                <span>Bảng Kanban</span>
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
              Kanban board và quản lý cột mốc
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen("kanban")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Kanban
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
              Đánh giá chéo và chống free-rider
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
          <h3 className="text-lg font-bold text-slate-900 mb-5">
            Đóng góp thành viên
          </h3>

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
      )}
    </div>
  );
};
