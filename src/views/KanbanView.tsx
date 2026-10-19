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
  CheckCircle2,
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
  ShieldCheck,
  MessageSquare,
  Sparkles,
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
    classGroups,
  } = useApp();

  // Lecturer view state
  const [selectedLecturerGroup, setSelectedLecturerGroup] = useState<string | null>(null);
  const [lecturerStatusFilter, setLecturerStatusFilter] = useState<"all" | "good" | "slow">("all");
  const [lecturerSearch, setLecturerSearch] = useState("");
  const [lecturerFeedback, setLecturerFeedback] = useState("");

  // Student view state
  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "overdue">("all");
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

  // Student filter tasks
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

  const completedCount = tasks.filter((t) => t.status === "Hoàn thành").length;
  const totalCount = tasks.length;
  const progressPercent = Math.round(
    (completedCount / (totalCount || 1)) * 100,
  );

  // Column next / previous shift
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
    if (currentIndex === -1) return;

    const nextIndex =
      direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < statusOrder.length) {
      const nextStatus = statusOrder[nextIndex];

      // Chỉ Trưởng nhóm mới được chuyển task từ "Chờ duyệt" → "Hoàn thành"
      if (currentStatus === "Chờ duyệt" && nextStatus === "Hoàn thành") {
        if (!currentUser?.isGroupLeader) {
          showToast(
            "Chỉ Trưởng nhóm mới được duyệt công việc sang Hoàn thành!",
            "warning",
          );
          return;
        }
      }

      moveTask(taskId, nextStatus);
      showToast(`Đã chuyển công việc sang cột "${nextStatus}"`, "info");
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

      if (task.status === "Chờ duyệt" && targetStatus === "Hoàn thành") {
        if (!currentUser?.isGroupLeader) {
          showToast(
            "Chỉ Trưởng nhóm mới được duyệt công việc sang Hoàn thành!",
            "warning",
          );
          return;
        }
      }

      moveTask(taskId, targetStatus);
      showToast(`Đã chuyển công việc sang "${targetStatus}"`, "info");
    }
  };

  // Phục hồi task từ cột Quá hạn về Đang thực hiện
  const handleRestoreTask = (taskId: string) => {
    moveTask(taskId, "Đang thực hiện");
    showToast("Đã phục hồi công việc về cột Đang thực hiện.", "success");
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSendLecturer = () => {
    showToast(
      "Đã gửi báo cáo tiến độ công việc đến Giảng viên hướng dẫn thành công!",
      "success",
    );
  };

  // =========================================================================
  // GIAO DIỆN GIẢNG VIÊN: BẢNG GIÁM SÁT TIẾN ĐỘ CÔNG VIỆC CÁC NHÓM
  // =========================================================================
  if (currentRole === "lecturer") {
    const goodGroups = classGroups.filter((g) => g.kanbanProgress >= 70);
    const slowGroups = classGroups.filter((g) => g.kanbanProgress < 60);
    const averageProgress = Math.round(
      classGroups.reduce((acc, g) => acc + g.kanbanProgress, 0) /
        (classGroups.length || 1),
    );

    const filteredLecturerGroups = classGroups.filter((g) => {
      if (lecturerStatusFilter === "good" && g.kanbanProgress < 70) return false;
      if (lecturerStatusFilter === "slow" && g.kanbanProgress >= 60) return false;
      if (lecturerSearch.trim()) {
        const q = lecturerSearch.toLowerCase();
        const matchName = g.name.toLowerCase().includes(q);
        const matchTopic = g.topic.toLowerCase().includes(q);
        const matchLeader = g.leaderName.toLowerCase().includes(q);
        if (!matchName && !matchTopic && !matchLeader) return false;
      }
      return true;
    });

    const activeGroupDetail = selectedLecturerGroup
      ? classGroups.find((g) => g.id === selectedLecturerGroup)
      : null;

    return (
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Header Giảng viên */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  Tiến độ công việc các Nhóm đồ án
                </h1>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Giảng viên theo dõi toàn khóa</span>
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Theo dõi tiến độ thực hiện công việc và mức độ hoàn thành của tất cả{" "}
                <strong>{classGroups.length} nhóm đồ án</strong> trong học phần.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setCurrentScreen("milestones")}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Xem Cột mốc nộp bài</span>
              </button>

              <button
                onClick={() => setCurrentScreen("report")}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Báo cáo Đóng góp</span>
              </button>
            </div>
          </div>

          {/* Active Milestone Callout */}
          {activeMilestone && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{activeMilestone.name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Hạn chót: <strong className="text-slate-900">{activeMilestone.dueDate}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  {activeMilestone.status}
                </span>
              </div>
              <span className="text-slate-500">
                Trọng số điểm: <strong>{activeMilestone.weight}%</strong>
              </span>
            </div>
          )}
        </div>

        {/* 4 Thẻ KPI Giảng viên */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nhóm đồ án
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{classGroups.length} nhóm</div>
            <p className="text-xs text-slate-500 mt-1">46/48 SV đã tham gia nhóm</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Đúng tiến độ (≥70%)
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{goodGroups.length} nhóm</div>
            <p className="text-xs text-slate-500 mt-1">Đang bám sát kế hoạch</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cần đôn đốc (&lt;60%)
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600">{slowGroups.length} nhóm</div>
            <p className="text-xs text-slate-500 mt-1">Cần nhắc nhở hạn chót</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tiến độ trung bình
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-600">{averageProgress}%</div>
            <p className="text-xs text-slate-500 mt-1">Khối lượng công việc toàn khóa</p>
          </div>
        </div>

        {/* Chế độ xem chi tiết 1 nhóm (Drill-down) hoặc Tổng quan tất cả nhóm */}
        {activeGroupDetail ? (
          /* View chi tiết công việc của 1 nhóm mà Giảng viên chọn */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedLecturerGroup(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại danh sách tất cả các nhóm</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Tiến độ công việc:</span>
                  <strong className="text-sm font-bold text-indigo-600">
                    {activeGroupDetail.kanbanProgress}%
                  </strong>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
                    {activeGroupDetail.name}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 truncate">
                    {activeGroupDetail.topic}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Trưởng nhóm: <strong className="text-slate-800">{activeGroupDetail.leaderName}</strong></span>
                  <span>•</span>
                  <span>Email: {activeGroupDetail.leaderEmail}</span>
                  <span>•</span>
                  <span>Thành viên: {activeGroupDetail.memberCount}/{activeGroupDetail.maxMembers}</span>
                </div>
              </div>

              {/* Nhận xét chỉ đạo của Giảng viên */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Gửi nhận xét chỉ đạo đến {activeGroupDetail.name}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lecturerFeedback}
                    onChange={(e) => setLecturerFeedback(e.target.value)}
                    placeholder="Nhập nhận xét hoặc nhắc nhở tiến độ gửi tới nhóm..."
                    className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      if (!lecturerFeedback.trim()) return;
                      showToast(`Đã gửi nhận xét đến ${activeGroupDetail.name} thành công!`, "success");
                      setLecturerFeedback("");
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Gửi nhận xét
                  </button>
                </div>
              </div>
            </div>

            {/* Bảng danh sách công việc của nhóm */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Danh sách công việc đang thực hiện của nhóm
              </h3>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {task.code}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagStyle(
                            task.tag,
                          )}`}
                        >
                          {task.tag}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.status === "Hoàn thành"
                              ? "bg-emerald-50 text-emerald-700"
                              : task.status === "Đang thực hiện"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hạn: {task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {task.assigneeAvatar}
                        </div>
                        <span className="font-medium text-slate-700">
                          {task.assigneeName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Bảng tổng hợp tiến độ của tất cả 6 nhóm sinh viên */
          <div className="space-y-4">
            {/* Bộ lọc và Tìm kiếm */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={lecturerSearch}
                    onChange={(e) => setLecturerSearch(e.target.value)}
                    placeholder="Tìm tên nhóm, đề tài, trưởng nhóm..."
                    className="bg-transparent outline-none w-full text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setLecturerStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                    lecturerStatusFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Tất cả ({classGroups.length})
                </button>
                <button
                  onClick={() => setLecturerStatusFilter("good")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                    lecturerStatusFilter === "good"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                  }`}
                >
                  Đúng tiến độ ({goodGroups.length})
                </button>
                <button
                  onClick={() => setLecturerStatusFilter("slow")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                    lecturerStatusFilter === "slow"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-700"
                  }`}
                >
                  Cần đôn đốc ({slowGroups.length})
                </button>
              </div>
            </div>

            {/* Grid Thẻ các Nhóm Đồ Án */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLecturerGroups.map((g) => {
                const isGood = g.kanbanProgress >= 70;
                const isSlow = g.kanbanProgress < 60;

                return (
                  <div
                    key={g.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                          {g.name}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            isGood
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isSlow
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isGood
                            ? "Đúng tiến độ"
                            : isSlow
                            ? "Cần đôn đốc"
                            : "Đang bám sát"}
                        </span>
                      </div>

                      {/* Đề tài */}
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2">
                        {g.topic}
                      </h3>

                      {/* Trưởng nhóm & Thành viên */}
                      <div className="text-xs text-slate-500 space-y-1 mb-4">
                        <p>
                          Trưởng nhóm:{" "}
                          <strong className="text-slate-800">{g.leaderName}</strong>
                        </p>
                        <p>
                          Số lượng:{" "}
                          <strong className="text-slate-800">
                            {g.memberCount}/{g.maxMembers} thành viên
                          </strong>
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            Tiến độ công việc:
                          </span>
                          <strong
                            className={`font-bold ${
                              isGood
                                ? "text-emerald-600"
                                : isSlow
                                ? "text-rose-600"
                                : "text-blue-600"
                            }`}
                          >
                            {g.kanbanProgress}%
                          </strong>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isGood
                                ? "bg-emerald-500"
                                : isSlow
                                ? "bg-rose-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${g.kanbanProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions for Lecturer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedLecturerGroup(g.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                      >
                        <span>Xem chi tiết việc</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          showToast(
                            `Đã gửi lời nhắc tiến độ tới ${g.name} (${g.leaderName})!`,
                            "success",
                          );
                        }}
                        title="Gửi nhắc nhở tiến độ đến nhóm"
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN SINH VIÊN: BẢNG TIẾN ĐỘ CÔNG VIỆC CỦA NHÓM
  // =========================================================================
  if (currentRole === "student" && !currentUser?.teamId) {
    return (
      <div className="max-w-2xl mx-auto my-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Bảng tiến độ công việc chưa được mở khóa
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-lg mx-auto">
            Theo quy trình <strong>Giai đoạn 2 (Tracking)</strong>, bạn cần phải{" "}
            <strong>tham gia hoặc tạo một nhóm đồ án</strong> trước khi có thể truy cập
            Bảng tiến độ công việc và phân chia nhiệm vụ.
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
      {/* 1. Header Bảng tiến độ công việc sinh viên */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Bảng tiến độ công việc
              </h1>
              {currentUser?.teamName && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {currentUser.teamName} {currentUser?.isGroupLeader && "• Trưởng nhóm"}
                </span>
              )}
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
              className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-sm bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo công việc mới</span>
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
              <option value="all">Tất cả cột mốc</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.dueDate})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === "all"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter("mine")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === "mine"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Việc của tôi
            </button>
            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeFilter === "overdue"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Quá hạn</span>
            </button>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm công việc, tag..."
              className="bg-transparent outline-none w-full text-slate-700"
            />
          </div>

          {/* Assignee Filter Avatars */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Lọc theo:</span>
            <button
              onClick={() => setSelectedAssignee(null)}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                selectedAssignee === null
                  ? "bg-slate-200 text-slate-800 font-bold"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              Tất cả
            </button>
            {[
              { id: "NA", name: "Nguyễn Văn A" },
              { id: "TH", name: "Trần Thu Hà" },
              { id: "DM", name: "Đặng Minh" },
              { id: "LC", name: "Lê Văn Cúc" },
            ].map((mem) => {
              const isSelected = selectedAssignee === mem.id;
              return (
                <button
                  key={mem.id}
                  onClick={() =>
                    setSelectedAssignee(isSelected ? null : mem.id)
                  }
                  title={mem.name}
                  className={`w-7 h-7 rounded-full text-xs font-bold text-white transition flex items-center justify-center cursor-pointer ${
                    mem.id === "LC"
                      ? "bg-rose-600"
                      : mem.id === "TH"
                      ? "bg-emerald-600"
                      : mem.id === "DM"
                      ? "bg-indigo-600"
                      : "bg-blue-600"
                  } ${
                    isSelected
                      ? "ring-2 ring-blue-600 ring-offset-2 scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {mem.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. 6 Cột Bảng tiến độ công việc */}
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
                    Chưa có việc
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

      {/* 3. Thanh Tổng hợp Tiến độ công việc */}
      <div className="bg-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tiến độ công việc nhóm
            </h3>
            <p className="text-sm text-slate-600">
              {completedCount}/{totalCount} công việc hoàn thành
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
