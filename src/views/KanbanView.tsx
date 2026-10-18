import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { TaskStatus, KanbanTask } from '../types/index.ts';
import { checkIsTaskOverdue } from '../utils/scoring.ts';
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
  Check
} from 'lucide-react';
import { NewTaskModal } from '../components/NewTaskModal.tsx';

export const KanbanView: React.FC = () => {
  const { tasks, moveTask, setIsNewTaskModalOpen, showToast, currentRole } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);

  const columns: { id: TaskStatus; label: string; headerColor: string }[] = [
    { id: 'Mới tạo', label: 'Mới tạo', headerColor: 'text-slate-600' },
    { id: 'Đã giao việc', label: 'Đã giao việc', headerColor: 'text-blue-700' },
    { id: 'Đang thực hiện', label: 'Đang thực hiện', headerColor: 'text-amber-700' },
    { id: 'Chờ duyệt', label: 'Chờ duyệt', headerColor: 'text-indigo-700' },
    { id: 'Hoàn thành', label: 'Hoàn thành', headerColor: 'text-emerald-700' }
  ];

  // Tag styling helper
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'Backend':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Frontend':
      case 'UI/UX':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Database':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Kiểm thử':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DevOps':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Milestone M1':
        return 'bg-blue-600 text-white font-semibold';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const isOverdue = checkIsTaskOverdue(task.dueDate, task.status);

    if (activeFilter === 'overdue' && !isOverdue) return false;
    if (activeFilter === 'mine' && !task.assigneeName.includes('Nguyễn Văn A')) return false;

    if (selectedAssignee && task.assigneeAvatar !== selectedAssignee) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchTag = task.tag.toLowerCase().includes(q);
      const matchAssignee = task.assigneeName.toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchAssignee) return false;
    }

    return true;
  });

  const overdueCount = tasks.filter((t) => checkIsTaskOverdue(t.dueDate, t.status)).length;
  const myTasksCount = tasks.filter((t) => t.assigneeName.includes('Nguyễn Văn A')).length;

  const completedCount = tasks.filter((t) => t.status === 'Hoàn thành').length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  // Column next / previous shift
  const handleShiftTask = (taskId: string, currentStatus: TaskStatus, direction: 'prev' | 'next') => {
    const statusOrder: TaskStatus[] = ['Mới tạo', 'Đã giao việc', 'Đang thực hiện', 'Chờ duyệt', 'Hoàn thành'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < statusOrder.length) {
      moveTask(taskId, statusOrder[nextIndex]);
      showToast(`Đã chuyển tác vụ sang cột "${statusOrder[nextIndex]}"`, 'info');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, targetStatus);
      showToast(`Đã kéo thả tác vụ sang "${targetStatus}"`, 'info');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSendLecturer = () => {
    showToast('Đã gửi báo cáo tiến độ Sprint 2 đến TS. Trần Văn B thành công!', 'success');
  };

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Bảng tiến độ công việc Kanban
              </h1>
              <span className="text-xs text-slate-400 font-normal">
                • Đồ án Chuyên ngành / Giai đoạn 2: Theo dõi tiến độ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kéo thả các thẻ công việc giữa 5 cột trạng thái để đồng bộ tiến độ thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Cập nhật: 10 phút trước</span>
            </span>
          </div>
        </div>

        {/* Filters and search row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Target Milestone Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>M2 - Báo cáo giữa kỳ &amp; Prototype (Hạn: 15/12/2026)</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả việc ({totalCount})
              </button>
              <button
                onClick={() => setActiveFilter('mine')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeFilter === 'mine'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Việc của tôi ({myTasksCount})
              </button>
              <button
                onClick={() => setActiveFilter('overdue')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeFilter === 'overdue'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Việc quá hạn ({overdueCount})</span>
              </button>
            </div>
          </div>

          {/* Search, member avatars, and "+ Tạo việc mới" */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên task, tag..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
              />
            </div>

            {/* Member avatar filters */}
            <div className="flex items-center -space-x-1">
              {[
                { id: 'NA', label: 'Nguyễn Văn A', color: 'bg-blue-600' },
                { id: 'TH', label: 'Trần Thu Hà', color: 'bg-emerald-600' },
                { id: 'LC', label: 'Lê Văn Cúc', color: 'bg-rose-600' },
                { id: 'DM', label: 'Đặng Minh', color: 'bg-indigo-600' }
              ].map((mem) => {
                const isSelected = selectedAssignee === mem.id;
                return (
                  <button
                    key={mem.id}
                    title={mem.label}
                    onClick={() => setSelectedAssignee(isSelected ? null : mem.id)}
                    className={`w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 transition cursor-pointer ${
                      mem.color
                    } ${isSelected ? 'ring-blue-600 scale-110 z-10' : 'ring-white'}`}
                  >
                    {mem.id}
                  </button>
                );
              })}
              {selectedAssignee && (
                <button
                  onClick={() => setSelectedAssignee(null)}
                  className="pl-2 text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* New Task Button */}
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo việc mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 min-h-[460px] flex flex-col justify-between"
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${col.headerColor}`}>
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white text-slate-600 text-[11px] font-bold flex items-center justify-center shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsNewTaskModalOpen(true)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded"
                    title="Thêm tác vụ"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      Chưa có thẻ nào
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isOverdue = checkIsTaskOverdue(task.dueDate, task.status);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className={`p-3 rounded-xl bg-white border shadow-2xs transition-all hover:shadow-md cursor-grab active:cursor-grabbing space-y-2.5 ${
                            isOverdue
                              ? 'border-rose-300 ring-1 ring-rose-300'
                              : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getTagStyle(
                                task.tag
                              )}`}
                            >
                              {task.tag}
                            </span>

                            {task.priority === 'Ưu tiên Cao' && (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Ưu tiên Cao
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 font-mono ml-auto">
                              {task.code}
                            </span>
                          </div>

                          {/* Overdue Alert Label (matching Image 9) */}
                          {isOverdue && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>⚠️ Quá hạn (Trễ 1 ngày)</span>
                            </div>
                          )}

                          {/* Task Title */}
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {task.title}
                          </h4>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks or Milestone Note */}
                          {task.subtaskCount && (
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                              <span>☑ {task.subtaskCount}</span>
                            </div>
                          )}

                          {task.mergePr && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <span>{task.mergePr}</span>
                            </div>
                          )}

                          {task.lecturerReviewed && (
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Giảng viên đã duyệt ({task.lecturerScore})</span>
                            </div>
                          )}

                          {/* Card Footer: Due Date, Assignee, and Shift Controls */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                              <Clock className={`w-3 h-3 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`} />
                              <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                                {isOverdue ? `Hạn: Hôm qua (${task.dueDate.split('/')[0]}/${task.dueDate.split('/')[1]})` : task.dueDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Quick Move Arrows for Touch/Easy Navigation */}
                              <div className="flex items-center bg-slate-100 rounded p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleShiftTask(task.id, task.status, 'prev')}
                                  title="Chuyển về cột trước"
                                  className="p-0.5 hover:bg-white rounded text-slate-500 hover:text-slate-800"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShiftTask(task.id, task.status, 'next')}
                                  title="Chuyển sang cột kế tiếp"
                                  className="p-0.5 hover:bg-white rounded text-slate-500 hover:text-slate-800"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Assignee Avatar */}
                              <div
                                title={task.assigneeName}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold ${
                                  task.assigneeAvatar === 'LC'
                                    ? 'bg-rose-600'
                                    : task.assigneeAvatar === 'TH'
                                    ? 'bg-emerald-600'
                                    : task.assigneeAvatar === 'DM'
                                    ? 'bg-indigo-600'
                                    : 'bg-blue-600'
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

              {/* Bottom Quick Add */}
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="mt-3 w-full py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-white text-slate-500 hover:text-blue-600 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm tác vụ</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Sprint Velocity Bar (matching Image 9) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Tốc độ Sprint (Velocity) &amp; Khối lượng công việc
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhóm 04 đã hoàn thành <strong className="text-slate-800 font-bold">{completedCount}/{totalCount} công việc ({progressPercent}%)</strong> trong Sprint 2 hướng tới M2.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full md:w-64 space-y-1">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Tiến độ Sprint</span>
            <span className="font-bold text-blue-700 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất báo cáo PDF</span>
          </button>

          <button
            onClick={handleSendLecturer}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Gửi GV Hướng dẫn</span>
          </button>
        </div>
      </div>

      <NewTaskModal />
    </div>
  );
};
