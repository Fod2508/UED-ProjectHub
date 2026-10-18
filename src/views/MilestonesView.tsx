import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { validateMilestonesWeight } from '../utils/scoring.ts';
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
  FileCheck
} from 'lucide-react';
import { AddMilestoneModal } from '../components/AddMilestoneModal.tsx';

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
    setCurrentScreen
  } = useApp();

  const { isValid, totalWeight } = validateMilestonesWeight(milestones);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editWeightValue, setEditWeightValue] = useState<number>(0);

  const handleStartEditWeight = (id: string, currentWeight: number) => {
    setEditingMilestoneId(id);
    setEditWeightValue(currentWeight);
  };

  const handleSaveEditWeight = (id: string) => {
    updateMilestone(id, { weight: Number(editWeightValue) || 0 });
    setEditingMilestoneId(null);
  };

  const handleToggleLockMilestone = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Đang mở (Nước rút)' ? 'Đã khóa' : 'Đang mở (Nước rút)';
    updateMilestone(id, { status: nextStatus as any });
    showToast(`Đã chuyển trạng thái cột mốc sang: ${nextStatus}`, 'info');
  };

  const handleViewSubmission = (milestoneName: string) => {
    showToast(`Bài nộp cho "${milestoneName}": 12/12 nhóm sinh viên đã nộp đề cương & báo cáo khảo sát. Điểm trung bình: 8.8.`, 'info');
  };

  const handlePublish = () => {
    const res = publishMilestones();
    if (res.success) {
      setTimeout(() => {
        setCurrentScreen('kanban');
      }, 1000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Header & Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Cấu hình Đề cương &amp; Cột mốc nộp bài
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Thiết lập các mốc nộp sản phẩm bắt buộc. Sau khi công bố, hệ thống sẽ mở khóa Bảng tiến độ công việc cho sinh viên.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
          <span className="text-xs sm:text-sm font-medium text-slate-800">
            Cho phép Trưởng nhóm tự tạo mốc nội bộ
          </span>
          <button
            type="button"
            onClick={() => {
              setAllowInternalMilestone(!allowInternalMilestone);
              showToast(
                allowInternalMilestone
                  ? 'Đã tắt quyền tạo mốc nội bộ của Trưởng nhóm'
                  : 'Đã cấp quyền tạo mốc nội bộ cho Trưởng nhóm',
                'info'
              );
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
              allowInternalMilestone ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                allowInternalMilestone ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

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
              <span>Tổng trọng số: 100% (Hợp lệ)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Tổng trọng số: {totalWeight}% (Cần điều chỉnh về 100%)</span>
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
              {milestones.map((m) => {
                const isSprintActive = m.status === 'Đang mở (Nước rút)';

                return (
                  <tr
                    key={m.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isSprintActive ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Cột mốc */}
                    <td className="py-4 px-6 align-top">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.phase}</div>
                    </td>

                    {/* Sản phẩm yêu cầu */}
                    <td className="py-4 px-6 align-top max-w-xs">
                      <p className="text-slate-700 leading-snug">{m.deliverables}</p>
                    </td>

                    {/* Hạn nộp */}
                    <td className="py-4 px-6 align-top whitespace-nowrap">
                      <div
                        className={`flex items-center gap-1.5 font-medium ${
                          isSprintActive ? 'text-blue-700 font-bold' : 'text-slate-600'
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
                            onChange={(e) => setEditWeightValue(Number(e.target.value))}
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
                          onClick={() => handleStartEditWeight(m.id, m.weight)}
                          title="Bấm để chỉnh sửa nhanh trọng số"
                          className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 cursor-pointer font-bold text-slate-800 transition tabular-nums"
                        >
                          {m.weight}%
                        </span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-6 align-top whitespace-nowrap">
                      {m.status === 'Đã hoàn thành' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>Đã hoàn thành</span>
                        </span>
                      )}

                      {m.status === 'Đang mở (Nước rút)' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                          </span>
                          <span>Đang mở (Nước rút)</span>
                        </span>
                      )}

                      {m.status === 'Chưa mở' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Chưa mở</span>
                        </span>
                      )}

                      {m.status === 'Đã khóa' && (
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
                          onClick={() => handleStartEditWeight(m.id, m.weight)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Sửa
                        </button>

                        {m.status === 'Đã hoàn thành' && (
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

                        {m.status === 'Đang mở (Nước rút)' && (
                          <>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleToggleLockMilestone(m.id, m.status)}
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
          <span>Thêm cột mốc mới</span>
        </button>

        {/* Save Draft & Publish */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => showToast('Đã lưu bản nháp cấu hình cột mốc vào hệ thống.', 'info')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm shadow-xs transition"
          >
            Lưu bản nháp
          </button>

          <button
            onClick={handlePublish}
            disabled={!isValid}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-[0.98] cursor-pointer ${
              isValid
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Công bố &amp; Mở khóa Bảng tiến độ</span>
          </button>
        </div>
      </div>

      {/* 4. Footnote Notice Box (matching Image 11) */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-4 flex items-start gap-3 text-slate-600 text-xs leading-relaxed">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900 font-semibold">Quy định:</strong> Mỗi cột mốc kết thúc sẽ là căn cứ để kích hoạt phiên <strong className="text-blue-700 font-semibold">Đánh giá chéo</strong> thành viên và xuất báo cáo mức độ đóng góp cá nhân nhằm phát hiện và cảnh báo tình trạng ỷ lại (Free-rider).
        </p>
      </div>

      <AddMilestoneModal />
    </div>
  );
};
