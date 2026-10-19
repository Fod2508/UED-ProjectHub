import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import {
  Lock,
  Clock,
  Check,
  Info,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  Bell,
  BellRing,
  Settings,
  X,
  Users,
  BarChart3,
} from "lucide-react";

export const PeerReviewView: React.FC = () => {
  const {
    peerReviews,
    activeEvaluatingTargetId,
    setActiveEvaluatingTargetId,
    savePeerReviewDraft,
    submitAndNextPeerReview,
    showToast,
    setCurrentScreen,
    currentRole,
    criteriaWeights,
    isCriteriaConfigOpen,
    setIsCriteriaConfigOpen,
    setCriteriaWeights,
    evaluationDeadline,
    extendEvaluationDeadline,
    addNotification,
    classGroups,
  } = useApp();

  const currentEvaluation = peerReviews.find(
    (p) => p.targetId === activeEvaluatingTargetId,
  ) ||
    peerReviews[1] ||
    peerReviews[0] || {
      targetId: "mem_cuc",
      targetName: "Đang tải...",
      targetRole: "",
      status: "pending" as const,
      c1: 0,
      c2: 0,
      c3: 0,
      comment: "",
      evaluatorId: "",
    };

  const [c1, setC1] = useState<number>(currentEvaluation?.c1 || 0);
  const [c2, setC2] = useState<number>(currentEvaluation?.c2 || 0);
  const [c3, setC3] = useState<number>(currentEvaluation?.c3 || 0);
  const [comment, setComment] = useState<string>(
    currentEvaluation?.comment || "",
  );
  const [reminderDismissed, setReminderDismissed] = useState(false);

  // Sync local form state whenever the active target changes (e.g. after submit & next)
  useEffect(() => {
    if (currentEvaluation) {
      setC1(currentEvaluation.c1 || 0);
      setC2(currentEvaluation.c2 || 0);
      setC3(currentEvaluation.c3 || 0);
      setComment(currentEvaluation.comment || "");
    }
  }, [
    activeEvaluatingTargetId,
    currentEvaluation?.c1,
    currentEvaluation?.c2,
    currentEvaluation?.c3,
    currentEvaluation?.comment,
  ]);

  // Nhắc nhở khi sắp đến hạn chót mà chưa hoàn thành đánh giá (kịch bản 3.1)
  const pendingCount = peerReviews.filter((p) => p.status !== "done").length;

  useEffect(() => {
    if (pendingCount > 0 && !reminderDismissed && currentRole === "student") {
      const timer = setTimeout(() => {
        showToast(
          `⏰ Nhắc nhở: Bạn còn ${pendingCount} phiếu đánh giá chéo chưa gửi. Hạn chót: ${evaluationDeadline}. Vui lòng hoàn thành trước khi hết hạn!`,
          "warning",
        );
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pendingCount, reminderDismissed, currentRole]);

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
      comment,
    });
  };

  const handleSubmitAndNext = () => {
    submitAndNextPeerReview(activeEvaluatingTargetId, {
      c1,
      c2,
      c3,
      comment,
    });
  };

  // Completed count
  const doneCount = peerReviews.filter((p) => p.status === "done").length;

  const scoreLabels: Record<number, string> = {
    1: "1 - Rất kém",
    2: "2 - Kém",
    3: "3 - Đạt yêu cầu",
    4: "4 - Tốt",
    5: "5 - Xuất sắc",
  };

  // ==========================================
  // LECTURER VIEW: GIÁM SÁT & QUẢN LÝ PHIÊN ĐÁNH GIÁ CHÉO
  // ==========================================
  if (currentRole === "lecturer") {
    const reviewStatsByGroup = [
      { id: "nhom_01", name: "Nhóm 01 - Thư viện Số", leader: "Phạm Minh Hoàng", submitted: 4, total: 4, status: "Hoàn tất 100%" },
      { id: "nhom_02", name: "Nhóm 02 - E-Learning", leader: "Vũ Thị Mai", submitted: 4, total: 4, status: "Hoàn tất 100%" },
      { id: "nhom_03", name: "Nhóm 03 - AI Điểm danh", leader: "Lê Tuấn Anh", submitted: 2, total: 3, status: "Đang thực hiện (67%)", missing: "Bùi Trọng Tín" },
      { id: "nhom_04", name: "Nhóm 04 - ProjectHub", leader: "Nguyễn Văn A", submitted: 3, total: 4, status: "Chờ 1 thành viên (75%)", missing: "Lê Văn Cúc" },
      { id: "nhom_05", name: "Nhóm 05 - Chatbot Tuyển sinh", leader: "Đặng Quốc Bảo", submitted: 3, total: 3, status: "Hoàn tất 100%" },
      { id: "nhom_06", name: "Nhóm 06 - Mạng Xã hội NCKH", leader: "Hoàng Lan Chi", submitted: 4, total: 4, status: "Hoàn tất 100%" },
    ];

    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header Title */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                <Settings className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Quản lý Phiên Đánh giá Chéo Cột mốc 2
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Điều chỉnh trọng số tiêu chí chuẩn, đôn đốc sinh viên nộp phiếu và chuẩn bị dữ liệu cho Báo cáo Đóng góp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                const newDate = window.prompt(
                  "Nhập hạn chót mới (VD: 23:59 ngày 22/12/2026):",
                  evaluationDeadline,
                );
                if (newDate && newDate.trim()) {
                  extendEvaluationDeadline(newDate.trim());
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Gia hạn đánh giá</span>
            </button>

            <button
              onClick={() => setIsCriteriaConfigOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Cấu hình 3 tiêu chí</span>
            </button>

            <button
              onClick={() => {
                addNotification({
                  title: "⏰ Nhắc nhở: Sắp hết hạn Đánh giá chéo",
                  message: `Giảng viên TS. Trần Văn B nhắc nhở: Phiên Đánh giá chéo thành viên Cột mốc 2 sắp kết thúc (Hạn: ${evaluationDeadline}). Hãy hoàn thành các phiếu đánh giá trước hạn chót!`,
                  type: "peer_review_reminder",
                  targetScreen: "peer_review",
                  recipientRole: "student",
                });
                showToast("Đã gửi thông báo đôn đốc nộp đánh giá chéo đến toàn thể sinh viên!", "success");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-rose-600" />
              <span>Đôn đốc nộp bài</span>
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tỷ lệ nộp phiếu toàn khóa
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              87.5%
            </div>
            <p className="text-xs text-slate-500 mt-1">20/22 sinh viên đã bỏ phiếu</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Nhóm đã nộp đủ 100%
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              4 / 6 nhóm
            </div>
            <p className="text-xs text-slate-500 mt-1">Sẵn sàng nghiệm thu dữ liệu</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Hạn chót phiên</span>
            </span>
            <div className="text-sm font-bold text-slate-900 mt-2 truncate">
              {evaluationDeadline}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">Hệ thống tự động khóa sổ</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              Trọng số tiêu chí chuẩn
            </span>
            <div className="text-sm font-bold text-indigo-700 mt-2">
              {criteriaWeights.c1}% • {criteriaWeights.c2}% • {criteriaWeights.c3}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tiến độ • Kỹ thuật • Hợp tác</p>
          </div>
        </div>

        {/* Security / Confidentiality Lecturer Note */}
        <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900 leading-relaxed">
          <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong>Nguyên tắc Mã hóa Ẩn danh (Kịch bản 3.1):</strong> Hệ thống tự động băm mã danh tính người chấm để sinh viên hoàn toàn yên tâm đánh giá khách quan, trung thực.
            </p>
            <p className="text-indigo-700">
              Điểm số từng thành viên sẽ được tổng hợp tự động thành Điểm đánh giá chéo TB và kết hợp với Tỷ lệ hoàn thành công việc trên Bảng tiến độ để đảm bảo đánh giá công bằng, minh bạch.
            </p>
          </div>
        </div>

        {/* Groups Submission Progress Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Tiến độ Nộp Phiếu Đánh giá Chéo theo Từng Nhóm Đồ án
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Cột mốc 2: Báo cáo giữa kỳ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-6">Tên nhóm đồ án</th>
                  <th className="py-3.5 px-6">Trưởng nhóm</th>
                  <th className="py-3.5 px-6">Tiến độ nộp phiếu</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reviewStatsByGroup.map((item) => {
                  const isDone = item.submitted === item.total;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {item.leader}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold tabular-nums">
                            {item.submitted}/{item.total} phiếu
                          </span>
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isDone ? "bg-emerald-500" : "bg-amber-500"}`}
                              style={{ width: `${(item.submitted / item.total) * 100}%` }}
                            />
                          </div>
                        </div>
                        {item.missing && (
                          <span className="text-[11px] text-amber-700 mt-0.5 block">
                            Chưa nộp: <strong>{item.missing}</strong>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isDone
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setCurrentScreen("report");
                            showToast(`Đang mở Báo cáo Đóng góp của ${item.name}`, "info");
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-end gap-1 ml-auto cursor-pointer"
                        >
                          <span>Xem Báo cáo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Criteria Config Modal */}
        {isCriteriaConfigOpen && (
          <CriteriaConfigModal
            weights={criteriaWeights}
            onClose={() => setIsCriteriaConfigOpen(false)}
            onSave={(newWeights) => {
              setCriteriaWeights(newWeights);
              setIsCriteriaConfigOpen(false);
              showToast("Đã cập nhật trọng số 3 tiêu chí đánh giá chuẩn thành công!", "success");
            }}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // STUDENT VIEW: BỎ PHIẾU ĐÁNH GIÁ CHÉO ẨN DANH
  // ==========================================
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
              Danh tính của bạn đã được mã hóa hoàn toàn. Điểm số và nhận xét sẽ
              được tổng hợp dưới dạng số liệu trung bình để gửi đến Giảng viên
              và nhóm, đảm bảo tính khách quan tuyệt đối.
            </p>
          </div>
        </div>

        <div className="self-stretch sm:self-auto flex items-center justify-end gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-blue-700 text-xs font-semibold shadow-2xs whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Hạn chót: {evaluationDeadline}</span>
          </div>
        </div>
      </section>

      {/* REMINDER BANNER - Nhắc nhở sắp hết hạn (kịch bản 3.1) */}
      {pendingCount > 0 && !reminderDismissed && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
              <BellRing className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Thông báo nhắc nhở: Sắp đến hạn đánh giá chéo
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Bạn còn <strong>{pendingCount} phiếu đánh giá</strong> chưa gửi.
                Hạn chót: <strong>{evaluationDeadline}</strong>. Vui lòng hoàn
                thành trước khi hết hạn để hệ thống có thể tổng hợp điểm đóng
                góp.
              </p>
            </div>
          </div>
          <button
            onClick={() => setReminderDismissed(true)}
            className="text-amber-500 hover:text-amber-700 p-1 rounded-lg hover:bg-amber-100 transition shrink-0"
            aria-label="Đóng nhắc nhở"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

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
              const isDone = item.status === "done";

              return (
                <button
                  key={item.targetId}
                  type="button"
                  onClick={() => handleSelectMember(item.targetId)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>{item.targetName}</span>
                  {isDone ? (
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-emerald-100 text-emerald-800"
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
              {currentEvaluation?.targetName === "Lê Văn Cúc"
                ? "LC"
                : currentEvaluation?.targetName === "Trần Thu Hà"
                  ? "TH"
                  : "DM"}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {currentEvaluation?.targetName || "Đang tải..."}
              </h3>
              <p className="text-xs text-slate-500">
                Đảm nhận: {currentEvaluation?.targetRole || ""}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Vui lòng đánh giá trung thực dựa trên kết quả công việc thực tế
              trong Cột mốc 2
            </span>
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
                Trọng số {criteriaWeights.c1}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Hoàn thành đúng hạn các nhiệm vụ được giao trên bảng tiến độ,
              không để trễ nộp bài.
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
                        ? "bg-blue-600 text-white shadow-xs scale-102"
                        : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200"
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
                <strong className="font-semibold text-slate-900">
                  Ghi chú thực tế:
                </strong>{" "}
                {c1 <= 3
                  ? "Có 1 công việc xác thực JWT bị trễ hạn trên bảng tiến độ."
                  : "Công việc hoàn thành tốt."}
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
                Trọng số {criteriaWeights.c2}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Chất lượng mã nguồn, tài liệu thiết kế và giải quyết lỗi kỹ thuật
              trong nhóm.
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
                        ? "bg-blue-600 text-white shadow-xs scale-102"
                        : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200"
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
                <strong className="font-semibold text-emerald-800">
                  Ghi chú thực tế:
                </strong>{" "}
                Tốt (Mã nguồn được cấu trúc sạch sẽ, tài liệu kết nối rõ ràng).
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
                Trọng số {criteriaWeights.c3}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tham gia đầy đủ các buổi họp nhóm, phản hồi tin nhắn kịp thời và
              hỗ trợ đồng đội.
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
                        ? "bg-blue-600 text-white shadow-xs scale-102"
                        : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200"
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
                <strong className="font-semibold text-emerald-800">
                  Ghi chú thực tế:
                </strong>{" "}
                Tốt (Nhiệt tình trao đổi trong các buổi họp kỹ thuật).
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
              Ý kiến đóng góp xây dựng giúp đồng đội cải thiện kỹ năng chuyên
              môn và phối hợp hiệu quả hơn.
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
              <span className="font-bold text-slate-900">
                Tiến độ đánh giá:
              </span>
              <span className="text-slate-600">
                Đã hoàn thành{" "}
                <strong className="text-blue-700 font-bold">
                  {doneCount}/3
                </strong>{" "}
                thành viên
              </span>
            </div>

            {/* Segmented bar */}
            <div className="flex items-center gap-1.5 w-48 h-2">
              <div
                className={`h-full flex-1 rounded-full ${
                  doneCount >= 1 ? "bg-emerald-500" : "bg-slate-200"
                }`}
              ></div>
              <div
                className={`h-full flex-1 rounded-full ${
                  doneCount >= 2
                    ? "bg-emerald-500"
                    : activeEvaluatingTargetId === "mem_cuc"
                      ? "bg-blue-600"
                      : "bg-slate-200"
                }`}
              ></div>
              <div
                className={`h-full flex-1 rounded-full ${
                  doneCount >= 3 ? "bg-emerald-500" : "bg-slate-200"
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

      {/* CRITERIA CONFIG MODAL - Giảng viên cấu hình trọng số (kịch bản 3.1) */}
      {isCriteriaConfigOpen && (
        <CriteriaConfigModal
          weights={criteriaWeights}
          onSave={(w) => {
            setCriteriaWeights(w);
            showToast(
              "Đã cập nhật trọng số tiêu chí đánh giá thành công!",
              "success",
            );
            setIsCriteriaConfigOpen(false);
          }}
          onClose={() => setIsCriteriaConfigOpen(false)}
        />
      )}
    </div>
  );
};

// Criteria Configuration Modal Component
const CriteriaConfigModal: React.FC<{
  weights: { c1: number; c2: number; c3: number };
  onSave: (w: { c1: number; c2: number; c3: number }) => void;
  onClose: () => void;
}> = ({ weights, onSave, onClose }) => {
  const [w1, setW1] = useState(weights.c1);
  const [w2, setW2] = useState(weights.c2);
  const [w3, setW3] = useState(weights.c3);
  const total = w1 + w2 + w3;
  const isValid = total === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Cấu hình trọng số tiêu chí đánh giá
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Giảng viên có thể điều chỉnh trọng số các tiêu chí chuẩn. Tổng trọng
            số phải bằng 100%.
          </p>

          {/* Criterion 1 */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Mức độ &amp; tiến độ công việc (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={w1}
              onChange={(e) => setW1(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Criterion 2 */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              2. Chất lượng sản phẩm &amp; kỹ thuật (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={w2}
              onChange={(e) => setW2(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Criterion 3 */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              3. Thái độ &amp; tinh thần làm việc nhóm (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={w3}
              onChange={(e) => setW3(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Total validation */}
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              isValid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            <span>Tổng trọng số:</span>
            <span className="font-bold tabular-nums">
              {total}% {isValid ? "✓" : "(Cần = 100%)"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave({ c1: w1, c2: w2, c3: w3 })}
            disabled={!isValid}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              isValid
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};
