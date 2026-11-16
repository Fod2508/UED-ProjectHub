import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Star, FileText, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const EvaluationDetailModal: React.FC = () => {
  const { viewingDetailMember, setViewingDetailMember, criteriaWeights } = useApp();

  if (!viewingDetailMember) return null;

  const criteria = viewingDetailMember.criteriaScores;
  const showScore = (value?: number) =>
    value === undefined ? "Chưa có dữ liệu" : `${value.toFixed(1)} / 5.0 ⭐`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                viewingDetailMember.isWarning ? 'bg-rose-600' : 'bg-blue-600'
              }`}
            >
              {viewingDetailMember.avatarText}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Phiếu đánh giá chéo: {viewingDetailMember.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã SV: {viewingDetailMember.studentId}
              </p>
            </div>
          </div>
          <button
            onClick={() => setViewingDetailMember(null)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Warning banner if applicable */}
          {viewingDetailMember.isWarning && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Cảnh báo thiếu đóng góp</strong>
                <p className="text-xs mt-0.5">{viewingDetailMember.warningReason}</p>
              </div>
            </div>
          )}

          {/* Role and tasks stats */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-slate-500 text-xs block">Vai trò đảm nhận:</span>
              <strong className="text-slate-800 text-xs">{viewingDetailMember.roleInTeam}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Tỷ lệ hoàn thành task:</span>
              <strong className="text-slate-800 text-xs">
                {viewingDetailMember.completionRate}% ({viewingDetailMember.completedTasks}/{viewingDetailMember.totalTasks} việc)
              </strong>
            </div>
          </div>

          {/* Criteria breakdown */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Chi tiết điểm số 3 tiêu chí ẩn danh:
            </h4>

            <div className="p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>1. Tiến độ hoàn thành việc ({criteriaWeights.c1}%):</span>
                <span className="font-bold text-slate-900">
                  {showScore(criteria?.c1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>2. Chất lượng công việc ({criteriaWeights.c2}%):</span>
                <span className="font-bold text-slate-900">
                  {showScore(criteria?.c2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>3. Thái độ làm việc nhóm ({criteriaWeights.c3}%):</span>
                <span className="font-bold text-slate-900">
                  {showScore(criteria?.c3)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold">
                <span>Điểm đánh giá chéo TB:</span>
                <span className={viewingDetailMember.isWarning ? 'text-rose-600' : 'text-blue-600'}>
                  {viewingDetailMember.peerScoreAvg} / 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Anonymous feedback quote */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              Trích xuất nhận xét từ đồng đội (Đã bảo mật ẩn danh):
            </span>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
              {viewingDetailMember.anonymousComment
                ? `“${viewingDetailMember.anonymousComment}”`
                : 'Chưa có nhận xét.'}
            </div>
          </div>

          {/* Formula summary */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
            <div className="flex items-center gap-1 font-semibold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Công thức tính điểm đóng góp:</span>
            </div>
            <span>
              ({viewingDetailMember.completionRate}% × 50%) + ({viewingDetailMember.peerScoreAvg}/5 × 100 × 50%) = <strong className="font-bold text-blue-900">{viewingDetailMember.contributionScore}%</strong>
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setViewingDetailMember(null)}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
