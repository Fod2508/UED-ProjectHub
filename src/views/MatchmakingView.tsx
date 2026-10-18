import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { TimeSlot, DayOfWeek } from '../types/index.ts';
import { calculateMatchScore, isTeamRecommended } from '../utils/scoring.ts';
import {
  Users,
  Calendar,
  Sparkles,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ReviewApplicantsModal } from './ReviewApplicantsModal.tsx';

export const MatchmakingView: React.FC = () => {
  const {
    scheduleMatrix,
    toggleScheduleSlot,
    setIsApplicantModalOpen,
    applicants,
    currentTeamCount,
    sendJoinRequest,
    currentRole
  } = useApp();

  const days: DayOfWeek[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dayLabels: Record<DayOfWeek, string> = {
    T2: 'Thứ Hai (T2)',
    T3: 'Thứ Ba (T3)',
    T4: 'Thứ Tư (T4)',
    T5: 'Thứ Năm (T5)',
    T6: 'Thứ Sáu (T6)',
    T7: 'Thứ Bảy (T7)',
    CN: 'Chủ Nhật (CN)'
  };
  const timeSlots: TimeSlot[] = ['Sáng', 'Chiều', 'Tối'];

  // User input for candidate skills & proposal
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Frontend (React)',
    'Thiết kế UI/UX'
  ]);
  const [userNote, setUserNote] = useState<string>(
    'Em có kinh nghiệm React, Tailwind CSS và Figma, mong muốn cùng nhóm làm đồ án đạt điểm cao!'
  );

  const availableSkillsList = [
    'Frontend (React)',
    'Frontend (Vue.js)',
    'Backend (Node.js/Express)',
    'Backend (Python/Django)',
    'Thiết kế UI/UX (Figma)',
    'Cơ sở dữ liệu (PostgreSQL)',
    'Kiểm thử & QA (Postman)',
    'DevOps & Docker'
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Calculate free slots count
  let freeSlotsCount = 0;
  days.forEach((d) => {
    timeSlots.forEach((s) => {
      if (scheduleMatrix[d]?.[s]) freeSlotsCount++;
    });
  });

  // Calculate Time Score based on free slots (assuming ideal overlap is 4+ sessions)
  const timeScore = Math.min(100, Math.round((freeSlotsCount / 10) * 100));
  // Calculate Skill Score based on complementary skills
  const skillScore = Math.min(100, Math.round((selectedSkills.length / 3) * 95));
  // Core formula: FinalScore = (SkillScore * 0.6) + (TimeScore * 0.4)
  const finalScore = calculateMatchScore(skillScore, timeScore);
  const isRecommended = isTeamRecommended(finalScore);

  const pendingCount = applicants.filter((a) => a.status === 'pending').length;

  const handleSendJoin = () => {
    sendJoinRequest(selectedSkills, userNote);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Giai đoạn 1 • Ghép nhóm thông minh</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Khảo sát lịch rảnh &amp; Gợi ý ghép nhóm bù trừ năng lực
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Thuật toán tự động ghép đôi theo công thức: <strong className="text-blue-700 font-semibold">FinalScore = (SkillScore × 0.6) + (TimeScore × 0.4)</strong>. Nhóm có độ phù hợp &gt; 80% sẽ được khuyên chọn hàng đầu.
          </p>
        </div>

        {/* Action Button for Leader / Reviewer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setIsApplicantModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Duyệt yêu cầu tham gia (SCR_02)</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[11px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Free Schedule Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Ma trận lịch rảnh hàng tuần của bạn
              </h2>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
              Đã chọn: {freeSlotsCount} buổi rảnh
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Bấm chọn các buổi bạn có thể tham gia họp nhóm trực tiếp hoặc online (Sáng, Chiều, Tối từ Thứ 2 đến Chủ Nhật).
          </p>

          {/* Interactive Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-2.5 px-2 text-slate-400 font-semibold text-left">Buổi \ Thứ</th>
                  {days.map((day) => (
                    <th key={day} className="py-2.5 px-2 font-bold text-slate-700">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timeSlots.map((slot) => (
                  <tr key={slot} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-2 text-left font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot}</span>
                    </td>
                    {days.map((day) => {
                      const isFree = !!scheduleMatrix[day]?.[slot];
                      return (
                        <td key={day} className="py-2 px-1">
                          <button
                            type="button"
                            onClick={() => toggleScheduleSlot(day, slot)}
                            className={`w-full py-2 px-1.5 rounded-lg font-medium text-[11px] transition cursor-pointer ${
                              isFree
                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isFree ? 'Rảnh' : 'Bận'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schedule explanation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
              Buổi rảnh (Sẵn sàng họp nhóm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 inline-block"></span>
              Buổi bận (Lịch học trên lớp / Việc riêng)
            </span>
          </div>
        </div>

        {/* RIGHT: Match Score Calculator & Group Recommendation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Group Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-sm">
                  04
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Đồ án: Phát triển Ứng dụng Web - Nhóm 04
                  </h3>
                  <span className="text-xs text-slate-400">
                    Sĩ số: <strong className="text-slate-700 font-semibold">{currentTeamCount}/4 thành viên</strong>
                  </span>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  currentTeamCount >= 4
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentTeamCount >= 4 ? 'Đã đủ 4/4' : 'Đang tuyển'}
              </span>
            </div>

            {/* Score Results Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Điểm tương thích tổng hợp:</span>
                  <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1 mt-0.5">
                    <span className="text-blue-600 tabular-nums">{finalScore}%</span>
                    <span className="text-xs font-normal text-slate-400">/ 100%</span>
                  </div>
                </div>

                <div className="text-right">
                  {isRecommended ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Gợi ý ghép nhóm
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                      Chưa tối ưu (&lt; 80%)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress calculation breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-blue-100/80 pt-2">
                <div className="flex justify-between">
                  <span>Kỹ năng bổ trợ (SkillScore × 60%):</span>
                  <strong className="text-slate-800 tabular-nums">{skillScore}% → {(skillScore * 0.6).toFixed(1)}đ</strong>
                </div>
                <div className="flex justify-between">
                  <span>Khớp lịch rảnh (TimeScore × 40%):</span>
                  <strong className="text-slate-800 tabular-nums">{timeScore}% → {(timeScore * 0.4).toFixed(1)}đ</strong>
                </div>
              </div>

              {isRecommended && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Khuyên chọn hàng đầu • Bạn có kỹ năng Frontend/UI bù trừ lý tưởng với chuyên môn Backend &amp; Database của nhóm!
                  </span>
                </div>
              )}
            </div>

            {/* Select skills to apply */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Kỹ năng bạn đảm nhận trong đồ án:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSkillsList.map((skill) => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {skill} {isChecked ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Lời nhắn gửi Trưởng nhóm:
              </label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Nhập lời nhắn ngắn gọn..."
              />
            </div>

            {/* Submit join request button */}
            <button
              onClick={handleSendJoin}
              disabled={currentTeamCount >= 4}
              className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                currentTeamCount >= 4
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Gửi yêu cầu tham gia nhóm (Chờ duyệt)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL SCR_02 */}
      <ReviewApplicantsModal />
    </div>
  );
};
