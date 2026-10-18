import React from 'react';
import { useApp } from '../context/AppContext.tsx';
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
  ExternalLink
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { setCurrentScreen, tasks, milestones, groupReport, currentRole } = useApp();

  const completedTasks = tasks.filter((t) => t.status === 'Hoàn thành').length;
  const overdueTasks = tasks.filter((t) => t.priority === 'Ưu tiên Cao' && t.status !== 'Hoàn thành').length;
  const activeMilestone = milestones.find((m) => m.status === 'Đang mở (Nước rút)') || milestones[1];

  const warningMembers = groupReport.members.filter((m) => m.isWarning);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Project Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-900/10">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Khoa Công nghệ Thông tin • Học kỳ 1 (2026 - 2027)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hệ thống Quản lý Đồ án: Nhóm 04
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Đề tài: <strong className="text-white">Xây dựng Nền tảng Quản lý Đồ án Môn học &amp; Đánh giá Chéo Chống Free-rider</strong>.
            Giảng viên hướng dẫn: <strong className="text-white">TS. Trần Văn B</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentScreen('kanban')}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <KanbanSquare className="w-4 h-4" />
              <span>Vào Bảng Kanban</span>
            </button>

            <button
              onClick={() => setCurrentScreen('report')}
              className="px-4 py-2 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm border border-blue-400/40 transition flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Xem Báo cáo Đóng góp</span>
            </button>
          </div>
        </div>

        {/* Decorative circle graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-white/10 to-transparent pointer-events-none hidden lg:block" />
      </div>

      {/* 2. Quick KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => setCurrentScreen('matchmaking')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Sĩ số nhóm</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            4 / 4 thành viên
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã ghép nhóm hoàn chỉnh</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => setCurrentScreen('kanban')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tiến độ Sprint 2</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {completedTasks} / {tasks.length} task
          </div>
          <p className="text-[11px] text-blue-600 font-medium">
            40% khối lượng đã hoàn thành
          </p>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => setCurrentScreen('milestones')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cột mốc mục tiêu</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate">
            {activeMilestone.name.split(':')[0]}
          </div>
          <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Hạn nộp: {activeMilestone.dueDate}</span>
          </p>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => setCurrentScreen('report')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-400 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cảnh báo Free-rider</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
            {warningMembers.length} thành viên
          </div>
          <p className="text-[11px] text-rose-600 font-medium">
            Lê Văn Cúc (38% đóng góp)
          </p>
        </div>
      </div>

      {/* 3. Workflow Modules Cards (Giai đoạn 1 -> Giai đoạn 3) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Các giai đoạn nghiệp vụ của Đồ án
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card Phase 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Giai đoạn 1: Khảo sát &amp; Ghép nhóm
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khảo sát ma trận lịch rảnh (Sáng/Chiều/Tối T2-CN), tính điểm bù trừ kỹ năng FinalScore = 60% Skill + 40% Time.
              </p>
            </div>
            <button
              onClick={() => setCurrentScreen('matchmaking')}
              className="pt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 self-start cursor-pointer"
            >
              <span>Vào Ghép nhóm (SCR_01 &amp; SCR_02)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Phase 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Giai đoạn 2: Tiến độ &amp; Cột mốc nộp bài
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bảng Kanban 5 cột kéo thả thời gian thực, tự động phát hiện task trễ hạn, và kiểm tra tổng trọng số cột mốc 100%.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('kanban')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Kanban (SCR_03)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setCurrentScreen('milestones')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Cột mốc (SCR_04)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card Phase 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Giai đoạn 3: Đánh giá chéo &amp; Chống Free-rider
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chấm điểm ẩn danh 3 tiêu chí, tự động gắn cờ cảnh báo thành viên thiếu đóng góp (&lt; 50% hoặc &lt; 2.5đ).
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('peer_review')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Đánh giá chéo (SCR_05)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setCurrentScreen('report')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Báo cáo (SCR_06)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Team Members List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Thành viên Nhóm 04 (4 Sinh viên)
          </h3>
          <span className="text-xs text-blue-600 font-medium">Học kỳ 1 • 2026 - 2027</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {groupReport.members.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border transition ${
                m.isWarning ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                    m.isWarning ? 'bg-rose-600' : 'bg-blue-600'
                  }`}
                >
                  {m.avatarText}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{m.studentId}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 truncate">{m.roleInTeam}</p>
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                <span className="text-slate-400">Đóng góp:</span>
                <span className={`font-bold ${m.isWarning ? 'text-rose-600' : 'text-blue-600'}`}>
                  {m.contributionScore}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
