import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Milestone } from "../types/index.ts";
import { X, Calendar, Flag, ShieldCheck } from "lucide-react";

export const AddMilestoneModal: React.FC = () => {
  const {
    isAddMilestoneModalOpen,
    setIsAddMilestoneModalOpen,
    addMilestone,
    currentRole,
    currentUser,
  } = useApp();

  const isLeaderInternal =
    currentRole === "student" && currentUser?.isGroupLeader;

  const [name, setName] = useState("");
  const [phase, setPhase] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [dueDate, setDueDate] = useState("25/12/2026");
  const [weight, setWeight] = useState<number>(isLeaderInternal ? 0 : 10);
  const [status, setStatus] = useState<Milestone["status"]>("Chưa mở");

  if (!isAddMilestoneModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isLeaderInternal) {
      addMilestone({
        name: name.trim(),
        phase: phase.trim() || "Kế hoạch Sprint nội bộ nhóm",
        deliverables:
          deliverables.trim() || "Hoàn thành code & kiểm thử nội bộ",
        dueDate,
        weight: 0, // Mốc nội bộ không tính vào 100% trọng số đề cương học phần
        status,
        type: "internal",
        teamId: currentUser?.teamId,
        teamName: currentUser?.teamName,
        createdBy: currentUser?.id,
      });
    } else {
      addMilestone({
        name: name.trim(),
        phase: phase.trim() || "Giai đoạn bổ sung",
        deliverables: deliverables.trim() || "Tài liệu báo cáo kỹ thuật",
        dueDate,
        weight: Number(weight) || 0,
        status,
        type: "course",
      });
    }

    setName("");
    setPhase("");
    setDeliverables("");
    setIsAddMilestoneModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isLeaderInternal
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {isLeaderInternal ? (
                <Flag className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isLeaderInternal
                  ? "Tạo Cột mốc Nội bộ Nhóm"
                  : "Thêm Cột mốc Đề cương Học phần"}
              </h3>
              <p className="text-xs text-slate-500">
                {isLeaderInternal
                  ? `Dành riêng cho nhóm: ${currentUser?.teamName || "Nhóm đồ án"}`
                  : "Khung đề cương chung cho toàn bộ sinh viên trong lớp"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddMilestoneModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLeaderInternal && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              <strong>Ghi chú Trưởng nhóm:</strong> Cột mốc nội bộ giúp nhóm tự
              đặt hạn chót nội bộ trước khi nộp cho Giảng viên. Mốc này không
              làm thay đổi 100% trọng số đề cương học phần.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isLeaderInternal ? "Tên mốc nội bộ" : "Tên cột mốc"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                isLeaderInternal
                  ? "Ví dụ: Sprint 2.1: Hoàn thành thiết kế DB & API auth"
                  : "Ví dụ: Cột mốc 5: Hoàn thiện hồ sơ nghiệm thu"
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Giai đoạn / Mục tiêu
            </label>
            <input
              type="text"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              placeholder={
                isLeaderInternal
                  ? "Ví dụ: Kiểm tra chéo mã nguồn nội bộ trước ngày nộp"
                  : "Ví dụ: Đóng gói mã nguồn & Viết tài liệu bàn giao"
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Sản phẩm yêu cầu bàn giao
            </label>
            <textarea
              rows={2}
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder={
                isLeaderInternal
                  ? "Ví dụ: Pull Request đã review, demo test chức năng không lỗi"
                  : "Ví dụ: Mã nguồn Git, Link demo và báo cáo PDF hoàn chỉnh"
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div
            className={`grid ${isLeaderInternal ? "grid-cols-1" : "grid-cols-2"} gap-3`}
          >
            {!isLeaderInternal && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Trọng số điểm (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hạn hoàn thành (dd/mm/yyyy)
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="25/12/2026"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddMilestoneModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition shadow-sm ${
                isLeaderInternal
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLeaderInternal ? "Tạo mốc nội bộ" : "Thêm cột mốc"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
