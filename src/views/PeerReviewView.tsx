import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Lock,
  Clock,
  Check,
  Info,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const PeerReviewView: React.FC = () => {
  const {
    peerReviews,
    activeEvaluatingTargetId,
    setActiveEvaluatingTargetId,
    savePeerReviewDraft,
    submitAndNextPeerReview,
    showToast,
    setCurrentScreen
  } = useApp();

  const currentEvaluation =
    peerReviews.find((p) => p.targetId === activeEvaluatingTargetId) || peerReviews[1];

  const [c1, setC1] = useState<number>(currentEvaluation.c1);
  const [c2, setC2] = useState<number>(currentEvaluation.c2);
  const [c3, setC3] = useState<number>(currentEvaluation.c3);
  const [comment, setComment] = useState<string>(currentEvaluation.comment);

  // When changing member selection, sync fields
  const handleSelectMember = (targetId: string) => {
    setActiveEvaluatingTargetId(targetId);
    const target = peerReviews.find((p) => p.targetId === targetId);
    if (target) {
      setC1(target.c1);
      setC2(target.c2);
      setC3(target.c3);
      setComment(target.comment);
    }
  };

  const handleSaveDraft = () => {
    savePeerReviewDraft(activeEvaluatingTargetId, {
      c1,
      c2,
      c3,
      comment
    });
  };

  const handleSubmitAndNext = () => {
    submitAndNextPeerReview(activeEvaluatingTargetId, {
      c1,
      c2,
      c3,
      comment
    });
  };

  // Completed count
  const doneCount = peerReviews.filter((p) => p.status === 'done').length;

  const scoreLabels: Record<number, string> = {
    1: '1 - Rất kém',
    2: '2 - Kém',
    3: '3 - Đạt yêu cầu',
    4: '4 - Tốt',
    5: '5 - Xuất sắc'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* 1. ANONYMOUS SECURITY BANNER (matching Image 13 & user HTML) */}
      <section className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-xs shrink-0 border border-slate-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Cơ chế đánh giá ẩn danh được bảo vệ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Danh tính của bạn đã được mã hóa hoàn toàn. Điểm số và nhận xét sẽ được tổng hợp dưới dạng số liệu trung bình để gửi đến Giảng viên và nhóm, đảm bảo tính khách quan tuyệt đối.
            </p>
          </div>
        </div>

        <div className="self-stretch sm:self-auto flex items-center justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-blue-700 text-xs font-semibold shadow-2xs whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Hạn chót: Còn 2 ngày (23:59 ngày 17/12/2026)</span>
          </div>
        </div>
      </section>

      {/* 2. MAIN PEER EVALUATION CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
        {/* MEMBER SELECTOR ROW */}
        <header className="bg-slate-50/90 border-b border-slate-200/80 px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Chọn thành viên:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {peerReviews.map((item) => {
              const isSelected = item.targetId === activeEvaluatingTargetId;
              const isDone = item.status === 'done';

              return (
                <button
                  key={item.targetId}
                  type="button"
                  onClick={() => handleSelectMember(item.targetId)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{item.targetName}</span>
                  {isDone ? (
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      Đã xong
                    </span>
                  ) : isSelected ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-blue-600">
                      Đang chấm
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                      Chưa chấm
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* CURRENT MEMBER SUMMARY */}
        <section className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
              {currentEvaluation.targetName === 'Lê Văn Cúc'
                ? 'LC'
                : currentEvaluation.targetName === 'Trần Thu Hà'
                ? 'TH'
                : 'DM'}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {currentEvaluation.targetName}
              </h3>
              <p className="text-xs text-slate-500">
                Đảm nhận: {currentEvaluation.targetRole}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Vui lòng đánh giá trung thực dựa trên kết quả công việc thực tế trong Cột mốc 2</span>
          </div>
        </section>

        {/* 3 CRITERIA SECTIONS */}
        <div className="p-6 space-y-6">
          {/* CRITERION 1 */}
          <article className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                1. Mức độ và tiến độ hoàn thành công việc
              </h4>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Trọng số 40%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Hoàn thành đúng hạn các nhiệm vụ được giao trên bảng tiến độ, không để trễ nộp bài.
            </p>

            {/* Score 1-5 Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((score) => {
                const isCurrent = c1 === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setC1(score)}
                    className={`py-2.5 px-2 rounded-xl text-center text-xs font-semibold transition cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs scale-102'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {scoreLabels[score]}
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="font-semibold text-slate-900">Ghi chú thực tế:</strong> {c1 <= 3 ? 'Có 1 công việc xác thực JWT bị trễ hạn trên bảng tiến độ.' : 'Công việc hoàn thành tốt.'}
              </span>
            </div>
          </article>

          {/* CRITERION 2 */}
          <article className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                2. Chất lượng sản phẩm và đóng góp kỹ thuật
              </h4>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Trọng số 35%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Chất lượng mã nguồn, tài liệu thiết kế và giải quyết lỗi kỹ thuật trong nhóm.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((score) => {
                const isCurrent = c2 === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setC2(score)}
                    className={`py-2.5 px-2 rounded-xl text-center text-xs font-semibold transition cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs scale-102'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {scoreLabels[score]}
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong className="font-semibold text-emerald-800">Ghi chú thực tế:</strong> Tốt (Mã nguồn được cấu trúc sạch sẽ, tài liệu kết nối rõ ràng).
              </span>
            </div>
          </article>

          {/* CRITERION 3 */}
          <article className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                3. Thái độ hợp tác và tinh thần làm việc nhóm
              </h4>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Trọng số 25%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tham gia đầy đủ các buổi họp nhóm, phản hồi tin nhắn kịp thời và hỗ trợ đồng đội.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((score) => {
                const isCurrent = c3 === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setC3(score)}
                    className={`py-2.5 px-2 rounded-xl text-center text-xs font-semibold transition cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs scale-102'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {scoreLabels[score]}
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong className="font-semibold text-emerald-800">Ghi chú thực tế:</strong> Tốt (Nhiệt tình trao đổi trong các buổi họp kỹ thuật).
              </span>
            </div>
          </article>

          {/* DETAILED COMMENT SECTION */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 block">
                Nhận xét và góp ý chi tiết (Không bắt buộc)
              </label>
              <span className="text-xs text-slate-400">Tối đa 500 ký tự</span>
            </div>
            <p className="text-xs text-slate-500">
              Ý kiến đóng góp xây dựng giúp đồng đội cải thiện kỹ năng chuyên môn và phối hợp hiệu quả hơn.
            </p>
            <textarea
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập nhận xét cụ thể về đóng góp kỹ thuật, khả năng giải quyết vấn đề..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* FOOTER BAR WITH PROGRESS & ACTIONS */}
        <footer className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Progress Tracker */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900">Tiến độ đánh giá:</span>
              <span className="text-slate-600">
                Đã hoàn thành <strong className="text-blue-700 font-bold">{doneCount}/3</strong> thành viên
              </span>
            </div>

            {/* Segmented bar */}
            <div className="flex items-center gap-1.5 w-48 h-2">
              <div
                className={`h-full flex-1 rounded-full ${
                  doneCount >= 1 ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              ></div>
              <div
                className={`h-full flex-1 rounded-full ${
                  doneCount >= 2 ? 'bg-emerald-500' : activeEvaluatingTargetId === 'mem_cuc' ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              ></div>
              <div
                className={`h-full flex-1 rounded-full ${
                  doneCount >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              ></div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm shadow-2xs transition"
            >
              Lưu bản nháp
            </button>
            <button
              onClick={handleSubmitAndNext}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <span>Lưu &amp; Chuyển sang thành viên tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
