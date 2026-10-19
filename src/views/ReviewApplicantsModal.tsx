import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import {
  X,
  Sparkles,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  Check,
  ThumbsUp,
  UserCheck,
} from "lucide-react";

export const ReviewApplicantsModal: React.FC = () => {
  const {
    isApplicantModalOpen,
    setIsApplicantModalOpen,
    applicants,
    acceptApplicant,
    rejectApplicant,
    currentTeamCount,
    showToast,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "pending" | "accepted" | "rejected"
  >("pending");

  if (!isApplicantModalOpen) return null;

  console.log(
    "ReviewApplicantsModal rendering, applicants:",
    applicants.length,
  );

  const pendingList = applicants.filter((a) => a.status === "pending");
  const acceptedList = applicants.filter((a) => a.status === "accepted");
  const rejectedList = applicants.filter((a) => a.status === "rejected");

  const currentList =
    activeTab === "pending"
      ? pendingList
      : activeTab === "accepted"
        ? acceptedList
        : rejectedList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Danh sách hồ sơ ứng tuyển mới nhất
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>
                Sĩ số hiện tại:{" "}
                <strong className="text-blue-600 font-bold">
                  {currentTeamCount}/4 thành viên
                </strong>
              </span>
              <span>•</span>
              <span className="text-blue-600 font-medium">
                ⇅ Ưu tiên độ phù hợp cao nhất
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsApplicantModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Chờ duyệt</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700">
              {pendingList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "accepted"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Đã chấp nhận</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700">
              {acceptedList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "rejected"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Đã từ chối</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600">
              {rejectedList.length}
            </span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Không có hồ sơ nào trong mục này.</p>
            </div>
          ) : (
            currentList.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl border border-blue-200/90 bg-white hover:border-blue-400 transition shadow-xs space-y-4"
              >
                {/* Top recommendation highlight banner if score >= 80 */}
                {app.isTopRecommendation && (
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/80">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Khuyên chọn hàng đầu • Bù trừ kỹ năng tối ưu</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{app.matchScore}% Phù hợp</span>
                    </span>
                  </div>
                )}

                {/* Candidate Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
                      {app.avatarText}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {app.name}
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {app.className}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Mã SV: {app.studentId}
                      </p>
                    </div>
                  </div>

                  {!app.isTopRecommendation && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                      <span>{app.matchScore}% Phù hợp</span>
                    </span>
                  )}
                </div>

                {/* Skill tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {app.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Schedule overlap */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Trùng khớp lịch họp:{" "}
                    <strong className="text-slate-900 font-semibold">
                      {app.matchedSessionsCount} buổi/tuần
                    </strong>{" "}
                    ({app.matchedSessionsDetails})
                  </span>
                </div>

                {/* Candidate Message */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600 italic">
                  <span className="not-italic font-bold text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
                    Lời nhắn từ ứng viên:
                  </span>
                  &ldquo;{app.note}&rdquo;
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    onClick={() =>
                      showToast(
                        `Hồ sơ năng lực của ${app.name}: Điểm GPA 3.65, Đạt chứng chỉ lập trình React/Node.js, Đồ án mẫu đạt loại Giỏi.`,
                        "info",
                      )
                    }
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 self-start sm:self-center"
                  >
                    <span>Xem hồ sơ năng lực chi tiết</span>
                    <span>&rarr;</span>
                  </button>

                  {app.status === "pending" && (
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      {/* CHỈ TRƯỞNG NHÓM mới hiển thị nút Chấp nhận/Từ chối */}
                      {currentUser?.isGroupLeader ? (
                        <>
                          <button
                            onClick={() => rejectApplicant(app.id)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Từ chối</span>
                          </button>
                          <button
                            onClick={() => acceptApplicant(app.id)}
                            disabled={currentTeamCount >= 4}
                            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 ${
                              currentTeamCount >= 4
                                ? "bg-slate-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Chấp nhận vào nhóm</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Chờ Trưởng nhóm duyệt
                        </span>
                      )}
                    </div>
                  )}

                  {app.status === "accepted" && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Đã là thành viên chính thức</span>
                    </span>
                  )}

                  {app.status === "rejected" && (
                    <span className="text-xs text-slate-400 font-medium">
                      Đã từ chối hồ sơ
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Lưu ý: Sau khi chấp nhận đủ 4 thành viên, hệ thống sẽ tự động đóng
              tuyển thành viên.
            </span>
          </div>
          <button
            onClick={() => setIsApplicantModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold text-xs transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
