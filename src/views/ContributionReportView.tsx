import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Lock,
  Mail,
  ChevronDown,
  Star,
  ArrowDownRight,
  Filter,
  User,
} from "lucide-react";
import { EvaluationDetailModal } from "../components/EvaluationDetailModal.tsx";

export const ContributionReportView: React.FC = () => {
  const {
    groupReport,
    setLecturerInstruction,
    approveAllScores,
    requestExplanation,
    requestReEvaluation,
    setViewingDetailMember,
    showToast,
    currentRole,
    currentUser,
  } = useApp();

  const [onlyWarning, setOnlyWarning] = useState<boolean>(false);
  const [instructionText, setInstructionText] = useState<string>(
    groupReport.lecturerInstruction ||
      "Phát hiện thành viên Lê Văn Cúc có điểm đóng góp 38% và trễ hạn công việc cốt lõi. Yêu cầu Trưởng nhóm và thành viên Cúc nộp bản giải trình phân công công việc trước ngày 20/12/2026.",
  );

  const displayedMembers = onlyWarning
    ? groupReport.members.filter((m) => m.isWarning)
    : groupReport.members;

  const warningCount = groupReport.members.filter((m) => m.isWarning).length;

  const handleSendExplanation = () => {
    requestExplanation(instructionText);
  };

  const handleSendReEvaluation = () => {
    requestReEvaluation(instructionText);
  };

  const handleApprove = () => {
    approveAllScores();
  };

  // Find current student's own data (with safe fallback to first member)
  const myMemberData =
    groupReport.members.find((m) => m.name === currentUser?.name) ||
    groupReport.members[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* STUDENT VIEW - Only see own contribution score */}
      {currentRole === "student" && myMemberData && (
        <>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Điểm đóng góp của tôi
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Điểm đóng góp từ đánh giá chéo ẩn danh và tỷ lệ hoàn thành công
              việc.
            </p>
          </div>

          {/* My Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
                    myMemberData.isWarning ? "bg-rose-600" : "bg-blue-600"
                  }`}
                >
                  {myMemberData.avatarText}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {myMemberData.name}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {myMemberData.studentId} • Nhóm 04
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                Vai trò:{" "}
                <strong className="text-slate-800">
                  {myMemberData.roleInTeam}
                </strong>
              </span>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Tỷ lệ hoàn thành */}
              <div className="bg-slate-50/70 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Tỷ lệ hoàn thành
                </span>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {myMemberData.completionRate}%
                </div>
                <p className="text-xs text-slate-500">
                  {myMemberData.completedTasks}/{myMemberData.totalTasks} công
                  việc
                </p>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      myMemberData.isWarning ? "bg-rose-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${myMemberData.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Điểm đánh giá chéo TB */}
              <div className="bg-slate-50/70 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Điểm đánh giá chéo TB
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-2xl font-extrabold tabular-nums ${
                      myMemberData.isWarning
                        ? "text-rose-600"
                        : "text-slate-900"
                    }`}
                  >
                    {myMemberData.peerScoreAvg}
                  </span>
                  <span className="text-sm text-slate-400">/ 5.0</span>
                </div>
                <p className="text-xs text-slate-500">
                  Từ {groupReport.members.length - 1} thành viên khác (Ẩn danh)
                </p>
              </div>

              {/* Card 3: Điểm đóng góp tổng hợp */}
              <div
                className={`rounded-xl p-4 space-y-2 ${
                  myMemberData.isWarning
                    ? "bg-rose-100 border-2 border-rose-300"
                    : "bg-blue-100 border-2 border-blue-300"
                }`}
              >
                <span className="text-xs font-semibold uppercase text-slate-700">
                  Điểm đóng góp
                </span>
                <div
                  className={`text-3xl font-extrabold tabular-nums ${
                    myMemberData.isWarning ? "text-rose-700" : "text-blue-700"
                  }`}
                >
                  {myMemberData.contributionScore}%
                </div>
                <p className="text-xs font-medium text-slate-700">
                  50% Hoàn thành + 50% Đánh giá chéo
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Trạng thái:
                </span>
                {myMemberData.status === "Đóng góp tích cực" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đóng góp tích cực</span>
                  </span>
                )}
                {myMemberData.status === "Đạt chuẩn" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Đạt yêu cầu</span>
                  </span>
                )}
                {myMemberData.status === "Cảnh báo thiếu đóng góp" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Cảnh báo thiếu đóng góp</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-4 flex items-start gap-3 text-slate-600 text-xs leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong className="text-slate-900 font-semibold">Lưu ý:</strong>{" "}
                Điểm đánh giá chéo từ phiếu chấm ẩn danh. Bạn{" "}
                <strong className="text-blue-700">không thể xem</strong> ai đã
                chấm điểm để đảm bảo khách quan.
              </p>
              <p className="text-slate-500">
                Công thức:{" "}
                <strong className="text-slate-800">
                  Điểm đóng góp = 50% × Hoàn thành + 50% × Đánh giá chéo TB
                </strong>
              </p>
            </div>
          </div>

          {/* Lecturer Formal Decision Callout for Students (Kịch bản 3.3) */}
          {groupReport.status === "Đã phê duyệt" && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-950">
                  Báo cáo điểm đóng góp đã được Giảng viên phê duyệt
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Giảng viên TS. Trần Văn B đã chính thức thẩm định và khóa sổ điểm số cho Cột mốc này. Điểm đóng góp của các thành viên được công nhận đạt chuẩn học phần.
                </p>
              </div>
            </div>
          )}

          {(groupReport.status === "Yêu cầu giải trình" ||
            groupReport.status === "Yêu cầu đánh giá lại") && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-rose-950">
                    Chỉ thị từ Giảng viên hướng dẫn: {groupReport.status}
                  </h3>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                    Cần xử lý
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200">
                  "{groupReport.lecturerInstruction}"
                </p>
                <p className="text-[11px] text-rose-700">
                  Trưởng nhóm và thành viên liên quan vui lòng nộp văn bản giải trình hoặc thực hiện bỏ phiếu lại theo chỉ dẫn của Giảng viên trước thời hạn.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* LECTURER VIEW - Full control and oversight */}
      {currentRole === "lecturer" && (
        <>
          {/* 1. Header Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Báo cáo đóng góp &amp; Cảnh báo
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Tổng hợp tỷ lệ hoàn thành và điểm đánh giá chéo ẩn danh.
            </p>
          </div>

          {/* 2. 3 KPI Stat Cards (matching Image 15) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Tổng số nhóm đồ án */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tổng số nhóm đồ án
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    12 nhóm
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tiến độ nộp bài:{" "}
                  <strong className="text-slate-800 font-bold">100%</strong>{" "}
                  (12/12 nhóm đã nộp)
                </span>
              </div>
            </div>

            {/* Card 2: Tiến độ đánh giá chéo */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tiến độ đánh giá chéo
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    100% hoàn thành
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Tất cả thành viên đã gửi phiếu</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Đã chốt sổ
                </span>
              </div>
            </div>

            {/* Card 3: Cảnh báo thiếu đóng góp (Red alert) */}
            <div className="bg-white p-5 rounded-2xl border-2 border-rose-300 shadow-xs flex flex-col justify-between space-y-3 bg-gradient-to-br from-white via-rose-50/20 to-rose-50/40">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <span>Cảnh báo thiếu đóng góp</span>
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1 tabular-nums">
                    {warningCount} trường hợp
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-slate-600">
                <span className="text-rose-700 font-medium">
                  Đóng góp &lt; 50% hoặc điểm &lt; 2.5
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold">
                  ● Cần can thiệp
                </span>
              </div>
            </div>
          </div>

          {/* 3. Filter & Group Selector Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Dropdown for groups */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Nhóm 04 - Hệ thống Quản lý Đồ án (Đang xem)</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Toggle only warning */}
              <button
                type="button"
                onClick={() => setOnlyWarning(!onlyWarning)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  onlyWarning
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  Chỉ hiển thị thành viên bị cảnh báo ({warningCount})
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <span className="text-xs text-slate-500 hidden md:inline">
                Trạng thái:{" "}
                <strong className="text-slate-900 font-semibold">
                  {groupReport.status}
                </strong>
              </span>

              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Phê duyệt toàn bộ</span>
              </button>
            </div>
          </div>

          {/* 4. Detailed Table (matching Image 15) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Table Title */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Chi tiết đóng góp - Nhóm 04
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                4 thành viên • Hệ thống Quản lý Đồ án
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-6">Thành viên</th>
                    <th className="py-3.5 px-6">Vai trò đảm nhận</th>
                    <th className="py-3.5 px-6">Tỷ lệ hoàn thành</th>
                    <th className="py-3.5 px-6 text-center">Điểm chéo TB</th>
                    <th className="py-3.5 px-6 text-center">Điểm đóng góp</th>
                    <th className="py-3.5 px-6">Trạng thái</th>
                    <th className="py-3.5 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {displayedMembers.map((mem) => {
                    const isWarningRow = mem.isWarning;

                    return (
                      <tr
                        key={mem.id}
                        className={`transition-colors ${
                          isWarningRow
                            ? "bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-600"
                            : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Thành viên */}
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                                isWarningRow
                                  ? "bg-rose-600"
                                  : mem.name === "Trần Thu Hà"
                                    ? "bg-emerald-600"
                                    : mem.name === "Đặng Minh"
                                      ? "bg-indigo-600"
                                      : "bg-blue-600"
                              }`}
                            >
                              {mem.avatarText}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{mem.name}</span>
                                {isWarningRow && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {mem.studentId}{" "}
                                {mem.name.includes("Nguyễn Văn A") &&
                                  "• Trưởng nhóm"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Vai trò */}
                        <td className="py-4 px-6 align-middle max-w-[160px]">
                          <span className="text-xs text-slate-600 leading-snug block">
                            {mem.roleInTeam}
                          </span>
                        </td>

                        {/* Tỷ lệ hoàn thành công việc */}
                        <td className="py-4 px-6 align-middle min-w-[180px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <strong
                                className={
                                  isWarningRow
                                    ? "text-rose-600 font-bold"
                                    : "text-slate-800"
                                }
                              >
                                {mem.completionRate}%
                              </strong>
                              <span className="text-slate-400 text-[11px]">
                                {mem.completedTasks}/{mem.totalTasks} công việc{" "}
                                {mem.hasOverdueTask && "(1 việc trễ hạn)"}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isWarningRow
                                    ? "bg-rose-500"
                                    : mem.completionRate >= 85
                                      ? "bg-emerald-500"
                                      : "bg-blue-500"
                                }`}
                                style={{ width: `${mem.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Điểm đánh giá chéo TB */}
                        <td className="py-4 px-6 align-middle text-center whitespace-nowrap">
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1 font-bold">
                              <span
                                className={
                                  isWarningRow
                                    ? "text-rose-600 text-base"
                                    : "text-slate-900 text-base"
                                }
                              >
                                {mem.peerScoreAvg}
                              </span>
                              <span className="text-xs text-slate-400">
                                / 5.0
                              </span>
                              {mem.peerScoreAvg >= 4.5 ? (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              ) : isWarningRow ? (
                                <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                              ) : null}
                            </div>
                            {isWarningRow && (
                              <span className="text-[10px] text-rose-600 font-semibold">
                                Dưới mức chuẩn
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Điểm đóng góp tổng hợp */}
                        <td className="py-4 px-6 align-middle text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-xl font-extrabold text-sm tabular-nums ${
                              isWarningRow
                                ? "bg-rose-100 text-rose-700"
                                : mem.contributionScore >= 85
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {mem.contributionScore}%
                          </span>
                        </td>

                        {/* Trạng thái ghi nhận */}
                        <td className="py-4 px-6 align-middle whitespace-nowrap">
                          {mem.status === "Đóng góp tích cực" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đóng góp tích cực</span>
                            </span>
                          )}

                          {mem.status === "Đạt chuẩn" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>Đạt yêu cầu</span>
                            </span>
                          )}

                          {mem.status === "Cảnh báo thiếu đóng góp" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Cảnh báo thiếu đóng góp</span>
                            </span>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="py-4 px-6 align-middle text-right whitespace-nowrap">
                          {isWarningRow ? (
                            <button
                              onClick={() => setViewingDetailMember(mem)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <span>Yêu cầu giải trình</span>
                              <span>&rarr;</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setViewingDetailMember(mem)}
                              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                            >
                              Xem phiếu chi tiết
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend bar (matching Image 15) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Đóng góp tốt (≥ 85%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Đạt chuẩn (50-84%)
                </span>
                <span className="flex items-center gap-1.5 font-bold text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  Cảnh báo (&lt;50% hoặc &lt;2.5)
                </span>
              </div>

              <div className="text-slate-500 text-xs">
                Công thức:{" "}
                <strong className="text-slate-800">
                  50% Hoàn thành + 50% Đánh giá chéo
                </strong>
              </div>
            </div>
          </div>

          {/* 5. Lecturer Decision Card (matching Image 15) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Quyết định xử lý - Nhóm 04
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ghi chú sẽ gửi đến Trưởng nhóm và thành viên liên quan
                  </p>
                </div>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline">
                Đã nhập {instructionText.length} / 500 ký tự
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Ý kiến chỉ đạo &amp; Ghi chú gửi nhóm:
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={instructionText}
                onChange={(e) => {
                  setInstructionText(e.target.value);
                  setLecturerInstruction(e.target.value);
                }}
                className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Gửi thông báo qua cổng thông tin và email sinh viên.</span>
            </div>

            {/* 3 Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleSendExplanation}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Gửi yêu cầu giải trình phân chia công việc</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSendReEvaluation}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Yêu cầu đánh giá lại</span>
                </button>

                <button
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Phê duyệt và khóa số</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <EvaluationDetailModal />
    </div>
  );
};
