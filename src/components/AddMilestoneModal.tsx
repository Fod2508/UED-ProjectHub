import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Milestone } from '../types/index.ts';
import { X, Calendar, Plus } from 'lucide-react';

export const AddMilestoneModal: React.FC = () => {
  const { isAddMilestoneModalOpen, setIsAddMilestoneModalOpen, addMilestone } = useApp();

  const [name, setName] = useState('');
  const [phase, setPhase] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [dueDate, setDueDate] = useState('30/01/2027');
  const [weight, setWeight] = useState<number>(10);
  const [status, setStatus] = useState<Milestone['status']>('Chưa mở');

  if (!isAddMilestoneModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMilestone({
      name: name.trim(),
      phase: phase.trim() || 'Giai đoạn bổ sung',
      deliverables: deliverables.trim() || 'Tài liệu báo cáo kỹ thuật',
      dueDate,
      weight: Number(weight) || 0,
      status
    });

    setName('');
    setPhase('');
    setDeliverables('');
    setIsAddMilestoneModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Thêm cột mốc nộp bài mới</h3>
          </div>
          <button
            onClick={() => setIsAddMilestoneModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tên cột mốc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Cột mốc 5: Hoàn thiện hồ sơ nghiệm thu"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Giai đoạn thực hiện
            </label>
            <input
              type="text"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              placeholder="Ví dụ: Đóng gói mã nguồn & Viết tài liệu bàn giao"
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
              placeholder="Ví dụ: Mã nguồn Git, Link demo và báo cáo PDF hoàn chỉnh"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hạn nộp (dd/mm/yyyy)
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="15/01/2027"
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              Thêm cột mốc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
