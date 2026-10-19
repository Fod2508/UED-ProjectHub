import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { validateMilestonesWeight } from "../utils/scoring.ts";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Lock,
  Unlock,
  Info,
  Rocket,
  Edit2,
  FileCheck,
} from "lucide-react";
import { AddMilestoneModal } from "../components/AddMilestoneModal.tsx";

export const MilestonesView: React.FC = () => {
  const {
    milestones,
    updateMilestone,
    allowInternalMilestone,
    setAllowInternalMilestone,
    setIsAddMilestoneModalOpen,
    publishMilestones,
    isMilestoneLocked,
    showToast,
    setCurrentScreen,
    currentRole,
    currentUser,
    triggerPeerReview,
    classGroups,
  } = useApp();

  const { isValid, totalWeight } = validateMilestonesWeight(milestones);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null,
  );
  const [editWeightValue, setEditWeightValue] = useState<number>(0);

  const handleStartEditWeight = (id: string, currentWeight: number) => {
    setEditingMilestoneId(id);
    setEditWeightValue(currentWeight);
  };

  const handleSaveEditWeight = (id: string) => {
    updateMilestone(id, { weight: Number(editWeightValue) || 0 });
    setEditingMilestoneId(null);
  };

  const handleToggleLockMilestone = async (
    id: string,
    currentStatus: string,
  ) => {
    const nextStatus =
      currentStatus === "Đang mở (Nước rút)" ? "Đã khóa" : "Đang mở (Nước rút)";

    // Update milestone status
    await updateMilestone(id, { status: nextStatus as any });
    showToast(`Đã chuyển trạng thái cột mốc sang: ${nextStatus}`, "info");

    // If locking the milestone (ending it), trigger peer review
    if (nextStatus === "Đã khóa") {
      // Trigger peer review session
      await triggerPeerReview(id);
    }
  };

  const handleViewSubmission = (milestoneName: string) => {
    showToast(
      `Bài nộp cho "${milestoneName}": ${classGroups.length}/${classGroups.length} nhóm sinh viên đã nộp đề cương & sản phẩm bàn giao.`,
      "info",
    );
  };

  const handlePublish = () => {
    const res = publishMilestones();
    if (res.success) {
      setTimeout(() => {
        setCurrentScreen("kanban");
      }, 1000);
    }
  };

  const courseMilestones = milestones.filter((m) => m.type !== "internal");
  const internalMilestones = milestones.filter(
    (m) =>
      m.type === "internal" &&
      (!m.teamId || m.teamId === currentUser?.teamId),
  );
  const allInternalMilestones = milestones.filter((m) => m.type === "internal");

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* STUDENT VIEW */}
      {currentRole === "student" && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Cột mốc &amp; Kế hoạch nộp bài
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Theo dõi tiến độ đề cương môn học và các mốc kiểm soát nội bộ nhóm.
              </p>
            </div>

            <button
              onClick={() => setCurrentScreen("kanban")}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <span>Xem Tiến độ công việc</span>
              <Rocket className="w-4 h-4" />
            </button>
          </div>

          {/* SECTION 1: Cột mốc Đề cương Học phần (Giảng viên) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Cột mốc Học phần chính thức
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Khung đề cương môn học do Giảng viên công bố (Tổng trọng số: 100%)
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Chính thức • Toàn khóa</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-6">Cột mốc</th>
                    <th className="py-3.5 px-6">Sản phẩm yêu cầu</th>
                    <th className="py-3.5 px-6">Hạn nộp</th>
                    <th className="py-3.5 px-6 text-center">Trọng số</th>
                    <th className="py-3.5 px-6">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {courseMilestones.map((m) => {
                    const isSprintActive = m.status === "Đang mở (Nước rút)";
                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors ${
                          isSprintActive
                            ? "bg-blue-50/30"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="py-4 px-6 align-top">
                          <div className="font-bold text-slate-900">
                            {m.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {m.phase}
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top max-w-xs">
                          <p className="text-slate-700 leading-snug">
                            {m.deliverables}
                          </p>
                        </td>
                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          <div
                            className={`flex items-center gap-1.5 font-medium ${
                              isSprintActive
                                ? "text-blue-700 font-bold"
                                : "text-slate-600"
                            }`}
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{m.dueDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top text-center whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800 transition tabular-nums">
                            {m.weight}%
                          </span>
                        </td>
                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          {m.status === "Đã hoàn thành" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Đã hoàn thành</span>
                            </span>
                          )}
                          {m.status === "Đang mở (Nước rút)" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                              </span>
                              <span>Đang mở (Nước rút)</span>
                            </span>
                          )}
                          {m.status === "Chưa mở" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Chưa mở</span>
                            </span>
                          )}
                          {m.status === "Đã khóa" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Đã khóa</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-4 flex items-start gap-3 text-slate-600 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 font-semibold">
                Quy chế Học phần:
              </strong>{" "}
              Mỗi cột mốc chính thức kết thúc sẽ kích hoạt phiên{" "}
              <strong className="text-blue-700 font-semibold">
                Đánh giá chéo thành viên
              </strong>{" "}
              nhằm ghi nhận đóng góp công bằng và tự động cảnh báo Free-rider.
            </p>
          </div>

          {/* SECTION 2: Cột mốc & Kế hoạch Nội bộ Nhóm */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Cột mốc &amp; Kế hoạch Nội bộ Nhóm{" "}
                    {currentUser?.teamName && (
                      <span className="text-blue-600">({currentUser.teamName})</span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Mốc tự kiểm soát tiến độ trước ngày nộp bài cho Giảng viên (Không ảnh hưởng trọng số đề cương)
                  </p>
                </div>
              </div>

              {allowInternalMilestone && currentUser?.teamId && currentUser?.isGroupLeader && (
                <button
                  onClick={() => setIsAddMilestoneModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo mốc nội bộ</span>
                </button>
              )}
            </div>

            {/* Content of Section 2 */}
            {!currentUser?.teamId ? (
              <div className="p-8 text-center text-slate-500 text-xs sm:text-sm space-y-3">
                <p>Bạn chưa tham gia nhóm đồ án nào. Hãy tham gia hoặc tạo nhóm để thiết lập kế hoạch mốc nội bộ.</p>
                <button
                  onClick={() => setCurrentScreen("matchmaking")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Tìm hoặc tạo nhóm ngay
                </button>
              </div>
            ) : !allowInternalMilestone ? (
              <div className="p-6 bg-slate-50 text-center text-slate-500 text-xs">
                🔒 Giảng viên hiện đang khóa tính năng tự tạo mốc nội bộ. Nhóm vui lòng bám sát các Cột mốc đề cương chính thức ở trên.
              </div>
            ) : internalMilestones.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs sm:text-sm space-y-2">
                <p>Nhóm chưa thiết lập cột mốc nộp bài nội bộ nào.</p>
                {currentUser?.isGroupLeader ? (
                  <p className="text-emerald-700 font-medium">
                    Bạn là Trưởng nhóm — bấm nút <strong>"Tạo mốc nội bộ"</strong> ở trên để tạo sprint nội bộ cho nhóm.
                  </p>
                ) : (
                  <p className="text-slate-400">
                    Trưởng nhóm có thể tạo các mốc kiểm tra nội bộ trước ngày nộp bài chính thức.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-6">Mốc nội bộ</th>
                      <th className="py-3.5 px-6">Mục tiêu &amp; Sản phẩm</th>
                      <th className="py-3.5 px-6">Hạn hoàn thành nội bộ</th>
                      <th className="py-3.5 px-6">Trạng thái</th>
                      {currentUser?.isGroupLeader && (
                        <th className="py-3.5 px-6 text-right">Thao tác</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {internalMilestones.map((im) => (
                      <tr key={im.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6 align-top">
                          <div className="font-bold text-slate-900">{im.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{im.phase}</div>
                        </td>
                        <td className="py-4 px-6 align-top max-w-xs">
                          <p className="text-slate-700 leading-snug">{im.deliverables}</p>
                        </td>
                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span>{im.dueDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          {im.status === "Đã hoàn thành" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Hoàn thành</span>
                            </span>
                          ) : im.status === "Đang mở (Nước rút)" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                              <span>Đang làm</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                              <span>Chưa mở</span>
                            </span>
                          )}
                        </td>
                        {currentUser?.isGroupLeader && (
                          <td className="py-4 px-6 align-top text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                const nextStatus =
                                  im.status === "Đã hoàn thành"
                                    ? "Đang mở (Nước rút)"
                                    : "Đã hoàn thành";
                                updateMilestone(im.id, { status: nextStatus });
                              }}
                              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                            >
                              {im.status === "Đã hoàn thành"
                                ? "Mở lại"
                                : "Đánh dấu xong"}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* LECTURER FULL CONTROL VIEW */}
      {currentRole === "lecturer" && (
        <>
          {/* 1. Header & Switch */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Cấu hình Cột mốc
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Thiết lập cột mốc nộp sản phẩm. Công bố sẽ mở khóa Bảng tiến độ.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
              <span className="text-xs sm:text-sm font-medium text-slate-800">
                Trưởng nhóm tự tạo mốc nội bộ
              </span>
              <button
                type="button"
                onClick={() => {
                  setAllowInternalMilestone(!allowInternalMilestone);
                  showToast(
                    allowInternalMilestone
                      ? "Đã tắt quyền tạo mốc nội bộ"
                      : "Đã cấp quyền tạo mốc nội bộ cho Trưởng nhóm",
                    "info",
                  );
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  allowInternalMilestone ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    allowInternalMilestone ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Lecturer Note for Internal Milestone Permission */}
          {allowInternalMilestone ? (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Đang bật quyền tự tạo mốc nội bộ:</strong> Trưởng các nhóm được phép thiết lập các mốc kiểm tra nội bộ (Internal Sprints) để đôn đốc nhóm hoàn thành trước ngày nộp bài chính thức. Mốc nội bộ không ảnh hưởng đến khung 100% trọng số điểm học phần.
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>Chế độ khóa mốc nội bộ:</strong> Sinh viên toàn lớp chỉ theo dõi và nộp sản phẩm theo đúng các Cột mốc đề cương do Giảng viên công bố bên dưới.
              </span>
            </div>
          )}

          {/* 2. Main Milestones Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Table Title Bar */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Danh sách Cột mốc nộp bài
                </h2>
              </div>

              {/* Validation Status Indicator */}
              {isValid ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Tổng: 100% (Hợp lệ)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Tổng: {totalWeight}% (Cần 100%)</span>
                </div>
              )}
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-6">Cột mốc</th>
                    <th className="py-3.5 px-6">Sản phẩm yêu cầu</th>
                    <th className="py-3.5 px-6">Hạn nộp</th>
                    <th className="py-3.5 px-6 text-center">Trọng số</th>
                    <th className="py-3.5 px-6">Trạng thái</th>
                    <th className="py-3.5 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {courseMilestones.map((m) => {
                    const isSprintActive = m.status === "Đang mở (Nước rút)";

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          isSprintActive ? "bg-blue-50/30" : ""
                        }`}
                      >
                        {/* Cột mốc */}
                        <td className="py-4 px-6 align-top">
                          <div className="font-bold text-slate-900">
                            {m.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {m.phase}
                          </div>
                        </td>

                        {/* Sản phẩm yêu cầu */}
                        <td className="py-4 px-6 align-top max-w-xs">
                          <p className="text-slate-700 leading-snug">
                            {m.deliverables}
                          </p>
                        </td>

                        {/* Hạn nộp */}
                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          <div
                            className={`flex items-center gap-1.5 font-medium ${
                              isSprintActive
                                ? "text-blue-700 font-bold"
                                : "text-slate-600"
                            }`}
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{m.dueDate}</span>
                          </div>
                        </td>

                        {/* Trọng số */}
                        <td className="py-4 px-6 align-top text-center whitespace-nowrap">
                          {editingMilestoneId === m.id ? (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={editWeightValue}
                                onChange={(e) =>
                                  setEditWeightValue(Number(e.target.value))
                                }
                                className="w-14 px-1.5 py-0.5 rounded border border-blue-400 text-center font-bold text-xs"
                              />
                              <button
                                onClick={() => handleSaveEditWeight(m.id)}
                                className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                              >
                                Lưu
                              </button>
                            </div>
                          ) : (
                            <span
                              onClick={() =>
                                handleStartEditWeight(m.id, m.weight)
                              }
                              title="Bấm để chỉnh sửa nhanh trọng số"
                              className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 cursor-pointer font-bold text-slate-800 transition tabular-nums"
                            >
                              {m.weight}%
                            </span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          {m.status === "Đã hoàn thành" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Đã hoàn thành</span>
                            </span>
                          )}

                          {m.status === "Đang mở (Nước rút)" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                              </span>
                              <span>Đang mở (Nước rút)</span>
                            </span>
                          )}

                          {m.status === "Chưa mở" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Chưa mở</span>
                            </span>
                          )}

                          {m.status === "Đã khóa" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Đã khóa</span>
                            </span>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="py-4 px-6 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleStartEditWeight(m.id, m.weight)
                              }
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Sửa
                            </button>

                            {m.status === "Đã hoàn thành" && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleViewSubmission(m.name)}
                                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <span>Xem bài nộp</span>
                                </button>
                              </>
                            )}

                            {m.status === "Đang mở (Nước rút)" && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() =>
                                    handleToggleLockMilestone(m.id, m.status)
                                  }
                                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                                >
                                  Khóa mốc
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
            {/* Add milestone */}
            <button
              onClick={() => setIsAddMilestoneModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50/50 transition font-semibold text-xs sm:text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm cột mốc</span>
            </button>

            {/* Save Draft & Publish */}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => showToast("Đã lưu bản nháp cột mốc.", "info")}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm shadow-xs transition"
              >
                Lưu bản nháp
              </button>

              <button
                onClick={handlePublish}
                disabled={!isValid}
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-[0.98] cursor-pointer ${
                  isValid
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                    : "bg-slate-300 cursor-not-allowed text-slate-500"
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Công bố &amp; Mở đợt công việc</span>
              </button>
            </div>
          </div>

          {/* 4. Footnote Notice Box (matching Image 11) */}
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-4 flex items-start gap-3 text-slate-600 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 font-semibold">
                Quy định:
              </strong>{" "}
              Mỗi cột mốc kết thúc sẽ kích hoạt phiên{" "}
              <strong className="text-blue-700 font-semibold">
                Đánh giá chéo
              </strong>{" "}
              thành viên để phát hiện Free-rider.
            </p>
          </div>

          {/* 5. Giám sát Cột mốc Nội bộ của các Nhóm (dành cho Giảng viên khi bật tính năng) */}
          {allowInternalMilestone && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Theo dõi Kế hoạch Sprint Nội bộ của các Nhóm ({allInternalMilestones.length} mốc)
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Dữ liệu tự quản lý của nhóm
                </span>
              </div>

              {allInternalMilestones.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Chưa có nhóm nào thiết lập mốc nội bộ riêng. Các nhóm đang bám sát tiến độ đề cương chung.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                        <th className="py-3 px-6">Nhóm thực hiện</th>
                        <th className="py-3 px-6">Mốc nội bộ</th>
                        <th className="py-3 px-6">Sản phẩm yêu cầu</th>
                        <th className="py-3 px-6">Hạn nội bộ</th>
                        <th className="py-3 px-6">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {allInternalMilestones.map((im) => (
                        <tr key={im.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-6 font-bold text-slate-900">
                            {im.teamName || "Nhóm sinh viên"}
                          </td>
                          <td className="py-3.5 px-6 font-medium text-slate-800">
                            {im.name}
                          </td>
                          <td className="py-3.5 px-6 text-slate-600">
                            {im.deliverables}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap text-slate-600">
                            {im.dueDate}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              im.status === "Đã hoàn thành"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                            }`}>
                              {im.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <AddMilestoneModal />
        </>
      )}
    </div>
  );
};
