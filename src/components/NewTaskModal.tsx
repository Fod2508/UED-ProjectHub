import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { TaskStatus } from "../types/index.ts";
import { X, Plus, Calendar, Tag, User } from "lucide-react";

export const NewTaskModal: React.FC = () => {
  const {
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    addTask,
    milestones,
    currentUser,
    showToast,
  } = useApp();

  // Find relevant milestones (course milestones + internal ones belonging to this team)
  const availableMilestones = milestones.filter(
    (m) =>
      m.type !== "internal" ||
      !m.teamId ||
      m.teamId === currentUser?.teamId,
  );

  const activeMilestone =
    availableMilestones.find((m) => m.status === "Đang mở (Nước rút)") ||
    availableMilestones[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Frontend");
  const [priority, setPriority] = useState<
    "Thường" | "Ưu tiên Cao" | "Khẩn cấp"
  >("Thường");
  const [status, setStatus] = useState<TaskStatus>("Mới tạo");
  const [dueDate, setDueDate] = useState("2026-12-24"); // yyyy-mm-dd for native date input
  const [milestoneId, setMilestoneId] = useState(activeMilestone?.id || "m2");

  const [assignee, setAssignee] = useState({
    name: currentUser?.name || "Nguyễn Văn A",
    avatar: currentUser?.avatarText || "NA",
  });

  if (!isNewTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!currentUser?.teamId) {
      showToast("Bạn chưa tham gia nhóm nào để tạo task.", "warning");
      return;
    }

    // Convert yyyy-mm-dd (native date input) to dd/mm/yyyy used throughout the app
    const [y, m, d] = dueDate.split("-");
    const formattedDueDate = dueDate ? `${d}/${m}/${y}` : "";

    addTask({
      title: title.trim(),
      description: description.trim(),
      tag,
      priority,
      status,
      dueDate: formattedDueDate,
      assigneeName: assignee.name,
      assigneeAvatar: assignee.avatar,
      milestoneId: milestoneId || activeMilestone?.id || "m2",
    });

    setTitle("");
    setDescription("");
    setIsNewTaskModalOpen(false);
  };

  const defaultMembers = [
    {
      name: currentUser?.name || "Nguyễn Văn A",
      avatar: currentUser?.avatarText || "NA",
    },
    { name: "Trần Thu Hà", avatar: "TH" },
    { name: "Đặng Minh", avatar: "DM" },
    { name: "Lê Văn Cúc", avatar: "LC" },
    { name: "Chưa giao", avatar: "?" },
  ];

  // Unique members list
  const membersList = defaultMembers.filter(
    (mem, index, self) => index === self.findIndex((m) => m.name === mem.name),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Tạo tác vụ mới
            </h3>
          </div>
          <button
            onClick={() => setIsNewTaskModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tên tác vụ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thiết kế giao diện Dashboard"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Yêu cầu kỹ thuật, tài liệu tham khảo..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Thuộc Cột mốc nộp bài (Milestone / Sprint) <span className="text-rose-500">*</span>
            </label>
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white font-medium text-slate-800"
            >
              {availableMilestones.length === 0 ? (
                <option value="m2">Cột mốc 2 (Mặc định)</option>
              ) : (
                availableMilestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.type === "internal" ? "🏷️ [Nội bộ nhóm] " : "📌 [Học phần] "}
                    {m.name} — Hạn: {m.dueDate} ({m.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phân loại thẻ (Tag)
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Kiểm thử">Kiểm thử</option>
                <option value="DevOps">DevOps</option>
                <option value="Tài liệu">Tài liệu</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Thường">Thường</option>
                <option value="Ưu tiên Cao">Ưu tiên Cao</option>
                <option value="Khẩn cấp">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Người phụ trách
              </label>
              <select
                value={assignee.name}
                onChange={(e) => {
                  const m = membersList.find(
                    (item) => item.name === e.target.value,
                  );
                  if (m) setAssignee(m);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white"
              >
                {membersList.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hạn hoàn thành
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              Tạo tác vụ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
