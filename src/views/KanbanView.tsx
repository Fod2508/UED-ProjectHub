import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { TaskStatus, KanbanTask } from "../types/index.ts";
import { checkIsTaskOverdue } from "../utils/scoring.ts";
import {
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Send,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  RotateCcw,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { NewTaskModal } from "../components/NewTaskModal.tsx";

export const KanbanView: React.FC = () => {
  const {
    tasks,
    moveTask,
    setIsNewTaskModalOpen,
    showToast,
    currentRole,
    currentUser,
    milestones,
    setCurrentScreen,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "overdue">(
    "all",
  );
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);

  // Determine active milestone for contextual banner
  const activeMilestone =
    selectedMilestoneId !== "all"
      ? milestones.find((m) => m.id === selectedMilestoneId)
      : milestones.find((m) => m.status === "Đang mở (Nước rút)") ||
        milestones[0];

  const columns: { id: TaskStatus; label: string; headerColor: string }[] = [
    { id: "Mới tạo", label: "Mới tạo", headerColor: "text-slate-600" },
    { id: "Đã giao việc", label: "Đã giao việc", headerColor: "text-blue-700" },
    {
      id: "Đang thực hiện",
      label: "Đang thực hiện",
      headerColor: "text-amber-700",
    },
    { id: "Chờ duyệt", label: "Chờ duyệt", headerColor: "text-indigo-700" },
    { id: "Hoàn thành", label: "Hoàn thành", headerColor: "text-emerald-700" },
    { id: "Quá hạn", label: "Quá hạn", headerColor: "text-rose-700" },
  ];

  // Tag styling helper
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case "Backend":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Frontend":
      case "UI/UX":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Database":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Kiểm thử":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DevOps":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Milestone M1":
        return "bg-blue-600 text-white font-semibold";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const isOverdue = checkIsTaskOverdue(task.dueDate, task.status);

    if (activeFilter === "overdue" && !isOverdue) return false;
    if (
      activeFilter === "mine" &&
      currentUser &&
      !task.assigneeName.includes(currentUser.name) &&
      !task.assigneeName.includes("Nguyễn Văn A")
    ) {
      return false;
    }

    if (selectedMilestoneId !== "all" && task.milestoneId !== selectedMilestoneId) {
      return false;
    }

    if (selectedAssignee && task.assigneeAvatar !== selectedAssignee)
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchTag = task.tag.toLowerCase().includes(q);
      const matchAssignee = task.assigneeName.toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchAssignee) return false;
    }

    return true;
  });

  const overdueCount = tasks.filter((t) =>
    checkIsTaskOverdue(t.dueDate, t.status),
  ).length;
  const myTasksCount = tasks.filter(
    (t) =>
      currentUser &&
      (t.assigneeName.includes(currentUser.name) ||
        t.assigneeName.includes("Nguyễn Văn A")),
  ).length;

  const completedCount = tasks.filter((t) => t.status === "Hoàn thành").length;
  const totalCount = tasks.length;
  const progressPercent = Math.round(
    (completedCount / (totalCount || 1)) * 100,
  );

  // Column next / previous shift — chỉ dùng 5 cột chính, không include 'Quá hạn'
  const handleShiftTask = (
    taskId: string,
    currentStatus: TaskStatus,
    direction: "prev" | "next",
  ) => {
    const statusOrder: TaskStatus[] = [
      "Mới tạo",
      "Đã giao việc",
      "Đang thực hiện",
      "Chờ duyệt",
      "Hoàn thành",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) return; // task đang ở cột Quá hạn, không shift tự động

    const nextIndex =
      direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < statusOrder.length) {
      const nextStatus = statusOrder[nextIndex];

      // PHÂN QUYỀN: Chỉ Trưởng nhóm mới được chuyển task từ "Chờ duyệt" → "Hoàn thành"
      if (currentStatus === "Chờ duyệt" && nextStatus === "Hoàn thành") {
        if (!currentUser?.isGroupLeader) {
          showToast(
            "Chỉ Trưởng nhóm mới được duyệt task sang Hoàn thành!",
            "warning",
          );
          return;
        }
      }

      moveTask(taskId, nextStatus);
      showToast(`Đã chuyển tác vụ sang cột "${nextStatus}"`, "info");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // PHÂN QUYỀN: Chỉ Trưởng nhóm mới được kéo task từ "Chờ duyệt" → "Hoàn thành"
      if (task.status === "Chờ duyệt" && targetStatus === "Hoàn thành") {
        if (!currentUser?.isGroupLeader) {
          showToast(
            "Chỉ Trưởng nhóm mới được duyệt task sang Hoàn thành!",
            "warning",
          );
          return;
        }
      }

      moveTask(taskId, targetStatus);
      showToast(`Đã kéo thả tác vụ sang "${targetStatus}"`, "info");
    }
  };

  // Phục hồi task từ cột Quá hạn về Đang thực hiện
  const handleRestoreTask = (taskId: string) => {
    moveTask(taskId, "Đang thực hiện");
    showToast("Đã phục hồi tác vụ về cột Đang thực hiện.", "success");
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSendLecturer = () => {
    showToast(
      "Đã gửi báo cáo tiến độ Sprint 2 đến TS. Trần Văn B thành công!",
      "success",
    );
  };

  // Nếu là sinh viên chưa tham gia hoặc chưa tạo nhóm thì chặn vào bảng Kanban
  if (currentRole === "student" && !currentUser?.teamId) {
    return (
      <div className="max-w-2xl mx-auto my-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Bảng tiến độ Kanban chưa được mở khóa
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-lg mx-auto">
            Theo quy trình <strong>Giai đoạn 2 (Tracking)</strong>, bạn cần phải{" "}
            <strong>tham gia hoặc tạo một nhóm đồ án</strong> trước khi có thể truy cập
            Bảng tiến độ Kanban và phân chia công việc.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentScreen("matchmaking")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Tìm nhóm hoặc Tạo nhóm ngay</span>
            </button>
            <button
              onClick={() => setCurrentScreen("milestones")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Xem Cột mốc nộp bài</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Header with dynamic Milestone linkage */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {currentRole === "lecturer" ? "Giám sát Tiến độ Kanban" : "Bảng Kanban"}
              </h1>
              {currentRole === "lecturer" ? (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                  Giảng viên theo dõi • Nhóm 04
                </span>
              ) : currentUser?.teamName ? (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {currentUser.teamName} {currentUser?.isGroupLeader && "• Trưởng nhóm"}
                </span>
              ) : null}
            </div>

            {/* Active Milestone Status Banner */}
            {activeMilestone ? (
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm">
                <span className="font-bold text-slate-800">
                  {activeMilestone.name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Hạn chót:{" "}
                  <strong className="text-slate-900">
                    {activeMilestone.dueDate}
                  </strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                  {activeMilestone.status}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-1">
                Chưa có cột mốc nào được chọn
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen("milestones")}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Xem Cột mốc nộp bài</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-sm ${
                currentRole === "lecturer"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{currentRole === "lecturer" ? "Giao task chỉ đạo" : "Tạo task mới"}</span>
            </button>
          </div>
        </div>

        {/* Milestone Requirement Details Callout */}
        {activeMilestone && activeMilestone.deliverables && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-start gap-2.5 text-xs text-slate-600">
            <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">Yêu cầu sản phẩm bàn giao:</strong>{" "}
              {activeMilestone.deliverables}
            </span>
          </div>
        )}

        {/* Simplified Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          {/* Milestone Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Layers className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="all">Tất cả Cột mốc ({tasks.length} tasks)</option>
              {milestones.map((m) => {
                const count = tasks.filter((t) => t.milestoneId === m.id).length;
                return (
                  <option key={m.id} value={m.id}>
                    {m.type === "internal" ? "[Nội bộ] " : "[Học phần] "}
                    {m.name.split(":")[0]} ({count} tasks)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter("mine")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === "mine"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Của tôi ({myTasksCount})
            </button>
            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeFilter === "overdue"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Quá hạn ({overdueCount})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm task..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Member Filters */}
          <div className="flex items-center gap-1.5">
            {[
              { id: "NA", label: "Nguyễn Văn A", color: "bg-blue-600" },
              { id: "TH", label: "Trần Thu Hà", color: "bg-emerald-600" },
              { id: "LC", label: "Lê Văn Cúc", color: "bg-rose-600" },
              { id: "DM", label: "Đặng Minh", color: "bg-indigo-600" },
            ].map((mem) => {
              const isSelected = selectedAssignee === mem.id;
              return (
                <button
                  key={mem.id}
                  title={mem.label}
                  onClick={() =>
                    setSelectedAssignee(isSelected ? null : mem.id)
                  }
                  className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center ring-2 transition cursor-pointer ${
                    mem.color
                  } ${isSelected ? "ring-blue-600 scale-110" : "ring-white"}`}
                >
                  {mem.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Simplified 6-Column Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-50 rounded-2xl p-4 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className={`text-sm font-bold ${col.headerColor}`}>
                  {col.label}
                </h3>
                <span className="w-6 h-6 rounded-full bg-white text-slate-700 text-xs font-bold flex items-center justify-center">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    Chưa có task
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isOverdue = checkIsTaskOverdue(
                      task.dueDate,
                      task.status,
                    );
                    const isOverdueColumn = task.status === "Quá hạn";

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`p-4 rounded-xl bg-white transition hover:shadow-md cursor-grab active:cursor-grabbing space-y-3 ${
                          isOverdue || isOverdueColumn
                            ? "ring-2 ring-rose-300"
                            : ""
                        }`}
                      >
                        {/* Tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getTagStyle(
                              task.tag,
                            )}`}
                          >
                            {task.tag}
                          </span>
                          {task.milestoneId && (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                              {milestones.find((m) => m.id === task.milestoneId)
                                ?.name.split(":")[0] || task.milestoneId}
                            </span>
                          )}
                          {task.priority === "Ưu tiên Cao" && (
                            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded">
                              !
                            </span>
                          )}
                        </div>

                        {/* Overdue Warning */}
                        {(isOverdue || isOverdueColumn) && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Quá hạn</span>
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>

                        {/* Footer */}
                        <div className="pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>{task.dueDate}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isOverdueColumn ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreTask(task.id)}
                                title="Phục hồi"
                                className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="flex items-center bg-slate-100 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleShiftTask(
                                      task.id,
                                      task.status,
                                      "prev",
                                    )
                                  }
                                  className="p-1.5 hover:bg-white rounded-l-lg text-slate-500"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleShiftTask(
                                      task.id,
                                      task.status,
                                      "next",
                                    )
                                  }
                                  className="p-1.5 hover:bg-white rounded-r-lg text-slate-500"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {/* Avatar */}
                            <div
                              title={task.assigneeName}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold ${
                                task.assigneeAvatar === "LC"
                                  ? "bg-rose-600"
                                  : task.assigneeAvatar === "TH"
                                    ? "bg-emerald-600"
                                    : task.assigneeAvatar === "DM"
                                      ? "bg-indigo-600"
                                      : "bg-blue-600"
                              }`}
                            >
                              {task.assigneeAvatar}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Simplified Progress Bar */}
      <div className="bg-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tiến độ Sprint
            </h3>
            <p className="text-sm text-slate-600">
              {completedCount}/{totalCount} tasks hoàn thành
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Hoàn thành</span>
            <span className="font-bold text-blue-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl border hover:bg-slate-50 text-slate-700 text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất PDF</span>
          </button>

          <button
            onClick={handleSendLecturer}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Gửi GV</span>
          </button>
        </div>
      </div>

      <NewTaskModal />
    </div>
  );
};
