import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { TimeSlot, DayOfWeek } from "../types/index.ts";
import { calculateMatchScore, isTeamRecommended } from "../utils/scoring.ts";
import { groupService } from "../services/groupService.ts";
import { GroupMembersCard } from "../components/GroupMembersCard.tsx";
import {
  Users,
  Calendar,
  Sparkles,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Crown,
  ExternalLink,
  Filter,
  BookOpen,
  LogOut,
  UserPlus,
} from "lucide-react";
import { ReviewApplicantsModal } from "./ReviewApplicantsModal.tsx";

export const MatchmakingView: React.FC = () => {
  const {
    scheduleMatrix,
    toggleScheduleSlot,
    setIsApplicantModalOpen,
    applicants,
    currentTeamCount,
    sendJoinRequest,
    findMatchingGroups,
    createNewGroup,
    joinGroupDirectly,
    leaveCurrentGroup,
    currentRole,
    showToast,
    currentUser,
    classGroups,
    setCurrentScreen,
  } = useApp();

  const [lecturerFilter, setLecturerFilter] = useState<"all" | "full" | "recruiting">("all");
  const [lecturerSearch, setLecturerSearch] = useState("");

  const [studentGroupFilter, setStudentGroupFilter] = useState<"all" | "recruiting" | "full">("all");
  const [studentGroupSearch, setStudentGroupSearch] = useState("");

  const [groupMembers, setGroupMembers] = useState<
    Array<{
      id: string;
      name: string;
      email?: string;
      avatarText: string;
      role?: string;
      skills: string[];
      isLeader: boolean;
    }>
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Load group members
  useEffect(() => {
    const loadGroupMembers = async () => {
      if (!currentUser?.teamId) {
        setLoadingMembers(false);
        return;
      }

      try {
        const members = await groupService.getGroupMembers(currentUser.teamId);
        setGroupMembers(members);
      } catch (error) {
        console.error("Error loading group members:", error);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadGroupMembers();
  }, [currentUser?.teamId]);

  const days: DayOfWeek[] = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dayLabels: Record<DayOfWeek, string> = {
    T2: "Thứ Hai (T2)",
    T3: "Thứ Ba (T3)",
    T4: "Thứ Tư (T4)",
    T5: "Thứ Năm (T5)",
    T6: "Thứ Sáu (T6)",
    T7: "Thứ Bảy (T7)",
    CN: "Chủ Nhật (CN)",
  };
  const timeSlots: TimeSlot[] = ["Sáng", "Chiều", "Tối"];

  // User input for candidate skills & proposal
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Frontend (React)",
    "Thiết kế UI/UX",
  ]);
  const [userNote, setUserNote] = useState<string>(
    "Em có kinh nghiệm React, Tailwind CSS và Figma, mong muốn cùng nhóm làm đồ án đạt điểm cao!",
  );

  const availableSkillsList = [
    "Frontend (React)",
    "Frontend (Vue.js)",
    "Backend (Node.js/Express)",
    "Backend (Python/Django)",
    "Thiết kế UI/UX (Figma)",
    "Cơ sở dữ liệu (PostgreSQL)",
    "Kiểm thử & QA (Postman)",
    "DevOps & Docker",
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
  const skillScore = Math.min(
    100,
    Math.round((selectedSkills.length / 3) * 95),
  );
  // Core formula: FinalScore = (SkillScore * 0.6) + (TimeScore * 0.4)
  const finalScore = calculateMatchScore(skillScore, timeScore);
  const isRecommended = isTeamRecommended(finalScore);

  const pendingCount = applicants.filter((a) => a.status === "pending").length;

  // Track whether user has triggered the "Tìm nhóm" action
  const [hasSearched, setHasSearched] = useState(false);
  const [matchingGroups, setMatchingGroups] = useState<
    Array<{ id: string; name: string; matchScore: number; commonSlotsCount?: number }>
  >([]);

  const hasGroup = Boolean(currentUser?.teamId);

  const handleFindGroup = async () => {
    // Check if user is already in a group
    if (hasGroup) {
      showToast(
        "Bạn đã là thành viên của một nhóm. Không thể tìm kiếm nhóm khác.",
        "warning",
      );
      return;
    }

    setHasSearched(true);
    const results = await findMatchingGroups(selectedSkills, scheduleMatrix);
    setMatchingGroups(results);

    if (results.length > 0 && results[0].matchScore >= 70) {
      showToast(
        `Tìm thấy ${results.length} nhóm phù hợp! Điểm cao nhất: ${results[0].matchScore}%.`,
        "success",
      );
    } else if (results.length > 0) {
      showToast(
        `Tìm thấy ${results.length} nhóm (độ phù hợp lịch rảnh: ${results[0].matchScore}%).`,
        "info",
      );
    }
  };

  const handleCreateNewGroup = async () => {
    // Check if user is already in a group
    if (hasGroup) {
      showToast(
        `Bạn đã tham gia nhóm (${currentUser?.teamName}). Mỗi sinh viên chỉ được tạo hoặc thuộc 1 nhóm đồ án!`,
        "warning",
      );
      return;
    }

    const result = await createNewGroup(selectedSkills, scheduleMatrix);
    if (result.success) {
      setHasSearched(false);
      setMatchingGroups([]);
    }
  };

  const handleSendJoin = (targetGroupId?: string) => {
    const targetGroup = targetGroupId || matchingGroups[0]?.id || "nhom_04";
    sendJoinRequest(selectedSkills, userNote, targetGroup);
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Bạn có chắc chắn muốn rời nhóm hiện tại để tìm hoặc tạo nhóm khác?")) {
      await leaveCurrentGroup();
    }
  };

  const handleDirectJoin = async (groupId: string) => {
    await joinGroupDirectly(groupId);
  };

  // ==========================================
  // LECTURER VIEW: QUẢN LÝ DANH MỤC NHÓM & ĐỀ TÀI
  // ==========================================
  if (currentRole === "lecturer") {
    const fullCount = classGroups.filter((g) => g.status === "Đủ thành viên").length;
    const recruitingCount = classGroups.filter((g) => g.status === "Đang tuyển thành viên").length;

    const filteredClassGroups = classGroups.filter((group) => {
      if (lecturerFilter === "full" && group.status !== "Đủ thành viên") return false;
      if (lecturerFilter === "recruiting" && group.status !== "Đang tuyển thành viên") return false;

      if (lecturerSearch.trim()) {
        const q = lecturerSearch.toLowerCase();
        const matchName = group.name.toLowerCase().includes(q);
        const matchTopic = group.topic.toLowerCase().includes(q);
        const matchLeader = group.leaderName.toLowerCase().includes(q);
        if (!matchName && !matchTopic && !matchLeader) return false;
      }
      return true;
    });

    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header Title */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                <Users className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Quản lý Danh mục Nhóm &amp; Đề tài Đồ án
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Giám sát cơ cấu nhân sự, đề tài đăng ký và tiến độ ghép nhóm của sinh viên toàn khóa.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setCurrentScreen("kanban")}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem Tiến độ công việc chung</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setCurrentScreen("milestones")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Quản lý Cột mốc nộp bài</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tổng số nhóm đồ án
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {classGroups.length} nhóm
            </div>
            <p className="text-xs text-slate-500 mt-1">100% đã đăng ký đề tài</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <span>Đã đủ thành viên</span>
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {fullCount} nhóm
            </div>
            <p className="text-xs text-slate-500 mt-1">Đạt sĩ số chuẩn 4 SV/nhóm</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <span>Đang tuyển bổ sung</span>
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {recruitingCount} nhóm
            </div>
            <p className="text-xs text-slate-500 mt-1">Thiếu chuyên môn lập trình</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              Tỷ lệ có nhóm toàn khóa
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-1">
              95.8%
            </div>
            <p className="text-xs text-slate-500 mt-1">46/48 sinh viên đã vào nhóm</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setLecturerFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  lecturerFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả ({classGroups.length})
              </button>
              <button
                onClick={() => setLecturerFilter("full")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  lecturerFilter === "full"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đủ thành viên ({fullCount})
              </button>
              <button
                onClick={() => setLecturerFilter("recruiting")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  lecturerFilter === "recruiting"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đang tuyển ({recruitingCount})
              </button>
            </div>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lecturerSearch}
              onChange={(e) => setLecturerSearch(e.target.value)}
              placeholder="Tìm theo tên nhóm, đề tài, trưởng nhóm..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Groups Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredClassGroups.map((group) => {
            const isFull = group.status === "Đủ thành viên";
            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 hover:border-indigo-200 transition"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {group.name}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isFull
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {group.status} ({group.memberCount}/{group.maxMembers})
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{group.topic}</span>
                    </p>
                  </div>
                </div>

                {/* Leader Box */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {group.leaderAvatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span>{group.leaderName}</span>
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <span className="text-[11px] text-slate-400">{group.leaderEmail}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-white text-slate-600 border border-slate-200 rounded text-[11px] font-medium">
                    Trưởng nhóm
                  </span>
                </div>

                {/* Members list */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Thành viên nhóm ({group.members.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.members.map((member, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {member.avatar}
                        </div>
                        <div className="truncate">
                          <span className="font-medium text-slate-800 truncate block">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Skills Warning if recruiting */}
                {!isFull && group.missingSkills && group.missingSkills.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <span className="font-bold">⚠️ Vị trí chuyên môn nhóm đang còn thiếu:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {group.missingSkills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-full bg-white text-amber-700 border border-amber-300 text-[11px] font-semibold"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Progress */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Tiến độ công việc:</span>
                    <strong className="text-slate-900 font-bold">{group.kanbanProgress}%</strong>
                  </div>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${group.kanbanProgress}%` }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setCurrentScreen("kanban");
                      showToast(`Đang chuyển tới Bảng tiến độ của ${group.name}`, "info");
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem tiến độ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT VIEW (TRƯỞNG NHÓM / THÀNH VIÊN)
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Simplified Header */}
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Ghép nhóm thông minh
            </h1>
            <p className="text-sm text-slate-600">
              Khảo sát lịch rảnh và gợi ý nhóm phù hợp
            </p>
          </div>

          {/* Chỉ hiển thị nút Duyệt yêu cầu nếu là Trưởng nhóm hoặc ở chế độ Demo */}
          {((currentUser && currentUser.isGroupLeader) ||
            (!currentUser && currentRole === "student")) && (
            <button
              onClick={() => setIsApplicantModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-2 cursor-pointer self-start"
            >
              <UserCheck className="w-5 h-5" />
              <span>Duyệt yêu cầu</span>
              {pendingCount > 0 && (
                <span className="w-6 h-6 rounded-full bg-white text-blue-700 text-xs font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Schedule Matrix */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">Lịch rảnh</h2>
            <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
              {freeSlotsCount} buổi
            </span>
          </div>

          {/* Simplified Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="py-3 px-3 text-slate-600 font-semibold text-left">
                    Buổi
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="py-3 px-2 font-bold text-slate-700"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {timeSlots.map((slot) => (
                  <tr key={slot} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-left font-semibold text-slate-700">
                      {slot}
                    </td>
                    {days.map((day) => {
                      const isFree = !!scheduleMatrix[day]?.[slot];
                      return (
                        <td key={day} className="py-2 px-2">
                          <button
                            type="button"
                            onClick={() => toggleScheduleSlot(day, slot)}
                            className={`w-full py-3 px-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                              isFree
                                ? "bg-blue-600 text-white font-bold"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                            }`}
                          >
                            {isFree ? "Rảnh" : "Bận"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Match Score or Group Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Group Info or Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            {hasGroup ? (
              // User HAS a group - Show group info & Leave group option
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center">
                    {currentUser?.teamName?.match(/\d+/)?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentUser?.teamName || "Nhóm"}
                    </h3>
                    <span className="text-sm text-slate-600">
                      {groupMembers.length > 0 ? groupMembers.length : 1}/4 thành viên
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Bạn đã có nhóm ({currentUser?.teamName})</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Mỗi sinh viên chỉ được tham gia tối đa 1 nhóm đồ án. Nếu muốn tham gia hoặc tạo nhóm khác, bạn cần rời nhóm hiện tại.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setCurrentScreen("kanban")}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Vào Bảng công việc</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleLeaveGroup}
                    className="py-2.5 px-3 border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Rời khỏi nhóm</span>
                  </button>
                </div>
              </div>
            ) : (
              // User DOES NOT have a group - Show profile & search/create actions
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center">
                    {currentUser?.avatarText || "SV"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentUser?.name || "Người dùng"}
                    </h3>
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      Chưa có nhóm
                    </span>
                  </div>
                </div>

                {/* Skills Selection */}
                <div className="mb-4">
                  <label className="text-sm font-bold text-slate-800 block mb-2">
                    Kỹ năng của bạn:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkillsList.map((skill) => {
                      const isChecked = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs px-3 py-2 rounded-lg border transition cursor-pointer ${
                            isChecked
                              ? "bg-blue-600 text-white border-blue-600 font-semibold"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="text-sm font-bold text-slate-800 block mb-2">
                    Lời nhắn xin vào nhóm:
                  </label>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    rows={2}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="Nhập lời nhắn tự giới thiệu bản thân..."
                  />
                </div>

                {/* Actions: Find Group & Create Group */}
                <div className="space-y-2.5 mb-5">
                  <button
                    onClick={handleFindGroup}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <Search className="w-5 h-5" />
                    <span>Tìm nhóm phù hợp theo lịch rảnh</span>
                  </button>

                  <button
                    onClick={handleCreateNewGroup}
                    className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 text-amber-600" />
                    <span>Tạo nhóm mới (Làm trưởng nhóm)</span>
                  </button>
                </div>

                {/* Search Results */}
                {hasSearched && matchingGroups.length > 0 ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 mb-3 animate-in fade-in space-y-3">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">
                        Kết quả ghép nhóm theo lịch &amp; kỹ năng
                      </div>
                      <div
                        className={`text-3xl font-extrabold mb-1 ${
                          matchingGroups[0].matchScore >= 70
                            ? "text-blue-600"
                            : matchingGroups[0].matchScore >= 40
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {matchingGroups[0].matchScore}%
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {matchingGroups[0].name}
                      </p>
                    </div>

                    {matchingGroups[0].matchScore >= 70 ? (
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>
                          Phù hợp • Trùng {matchingGroups[0].commonSlotsCount ?? 0} buổi rảnh
                        </span>
                      </div>
                    ) : matchingGroups[0].matchScore >= 40 ? (
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>
                          Độ phù hợp trung bình • Trùng {matchingGroups[0].commonSlotsCount ?? 0} buổi rảnh
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>
                          ⚠️ Không trùng lịch rảnh ({matchingGroups[0].commonSlotsCount ?? 0} buổi trùng)
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleDirectJoin(matchingGroups[0].id)}
                        className="py-2.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Tham gia ngay</span>
                      </button>

                      <button
                        onClick={() => handleSendJoin(matchingGroups[0].id)}
                        className="py-2.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi yêu cầu</span>
                      </button>
                    </div>
                  </div>
                ) : hasSearched && matchingGroups.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <p className="text-xs text-amber-900 font-semibold mb-1">
                      Chưa tìm thấy nhóm nào đang tuyển phù hợp.
                    </p>
                    <p className="text-xs text-amber-700">
                      Hãy bấm <strong>"Tạo nhóm mới"</strong> ở trên để khởi tạo nhóm của bạn!
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Bấm <strong>"Tìm nhóm phù hợp theo lịch rảnh"</strong> để hệ thống so khớp lịch rảnh và kỹ năng với các nhóm đang tuyển.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* DANH MỤC TẤT CẢ CÁC NHÓM ĐỒ ÁN TRONG LỚP (Sinh viên xem toàn bộ số lượng & trạng thái nhóm) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        {/* Header & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                <Users className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Danh mục tất cả các Nhóm đồ án trong lớp
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Theo dõi toàn bộ các nhóm hiện có, kiểm tra nhóm vừa tạo, sĩ số và thành viên của từng nhóm.
            </p>
          </div>

          {/* 3 Quick Stat Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <span>Tổng:</span>
              <strong className="text-indigo-600">{classGroups.length} nhóm</strong>
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <span>Đang tuyển:</span>
              <strong>{classGroups.filter((g) => g.status === "Đang tuyển thành viên").length} nhóm</strong>
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <span>Đủ thành viên:</span>
              <strong>{classGroups.filter((g) => g.status === "Đủ thành viên").length} nhóm</strong>
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStudentGroupFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                studentGroupFilter === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({classGroups.length})
            </button>
            <button
              type="button"
              onClick={() => setStudentGroupFilter("recruiting")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                studentGroupFilter === "recruiting"
                  ? "bg-white text-amber-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đang tuyển ({classGroups.filter((g) => g.status === "Đang tuyển thành viên").length})
            </button>
            <button
              type="button"
              onClick={() => setStudentGroupFilter("full")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                studentGroupFilter === "full"
                  ? "bg-white text-emerald-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đã đủ ({classGroups.filter((g) => g.status === "Đủ thành viên").length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentGroupSearch}
              onChange={(e) => setStudentGroupSearch(e.target.value)}
              placeholder="Tìm tên nhóm, đề tài, trưởng nhóm..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
        </div>

        {/* Groups Grid */}
        {classGroups.filter((group) => {
          if (studentGroupFilter === "recruiting" && group.status !== "Đang tuyển thành viên") return false;
          if (studentGroupFilter === "full" && group.status !== "Đủ thành viên") return false;
          if (studentGroupSearch.trim()) {
            const q = studentGroupSearch.toLowerCase();
            const matchName = group.name.toLowerCase().includes(q);
            const matchTopic = group.topic.toLowerCase().includes(q);
            const matchLeader = group.leaderName.toLowerCase().includes(q);
            const matchMember = group.members?.some((m) => m.name.toLowerCase().includes(q));
            if (!matchName && !matchTopic && !matchLeader && !matchMember) return false;
          }
          return true;
        }).length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Không tìm thấy nhóm đồ án nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classGroups
              .filter((group) => {
                if (studentGroupFilter === "recruiting" && group.status !== "Đang tuyển thành viên") return false;
                if (studentGroupFilter === "full" && group.status !== "Đủ thành viên") return false;
                if (studentGroupSearch.trim()) {
                  const q = studentGroupSearch.toLowerCase();
                  const matchName = group.name.toLowerCase().includes(q);
                  const matchTopic = group.topic.toLowerCase().includes(q);
                  const matchLeader = group.leaderName.toLowerCase().includes(q);
                  const matchMember = group.members?.some((m) => m.name.toLowerCase().includes(q));
                  if (!matchName && !matchTopic && !matchLeader && !matchMember) return false;
                }
                return true;
              })
              .map((group) => {
                const isMyGroup = currentUser?.teamId === group.id;
                const isFull = group.status === "Đủ thành viên";

                return (
                  <div
                    key={group.id}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                      isMyGroup
                        ? "bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Name, Status & Member count */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm text-slate-900">
                              {group.name}
                            </h3>
                            {isMyGroup && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">
                                Nhóm của bạn
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-indigo-700 font-medium line-clamp-1 mt-0.5 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{group.topic}</span>
                          </p>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            isFull
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {group.memberCount}/{group.maxMembers} SV
                        </span>
                      </div>

                      {/* Leader Card */}
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                            {group.leaderAvatar}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-800 flex items-center gap-1">
                              <span className="truncate">{group.leaderName}</span>
                              <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 truncate block">
                              Trưởng nhóm • {group.leaderEmail || "sv@ued.udn.vn"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Members List */}
                      {group.members && group.members.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Thành viên nhóm ({group.members.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {group.members.map((m, mIdx) => (
                              <span
                                key={mIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]"
                              >
                                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center">
                                  {m.avatar || "SV"}
                                </span>
                                <span className="truncate max-w-[100px]">{m.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing skills needed (if recruiting) */}
                      {!isFull && group.missingSkills && group.missingSkills.length > 0 && (
                        <div className="space-y-1 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                            Vị trí đang tuyển:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {group.missingSkills.map((sk, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 bg-white border border-amber-200 rounded-md text-amber-700 font-semibold"
                              >
                                + {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-slate-200/60">
                      {isMyGroup ? (
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentScreen("kanban")}
                            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <span>Bảng công việc nhóm</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : isFull ? (
                        <div className="w-full py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-medium text-center border border-slate-200">
                          Nhóm đã đủ thành viên (4/4)
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={hasGroup}
                            onClick={() => handleDirectJoin(group.id)}
                            title={hasGroup ? "Bạn đã thuộc nhóm khác" : "Tham gia nhóm ngay"}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              hasGroup
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                            }`}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Tham gia ngay</span>
                          </button>

                          <button
                            type="button"
                            disabled={hasGroup}
                            onClick={() => handleSendJoin(group.id)}
                            title={hasGroup ? "Bạn đã thuộc nhóm khác" : "Gửi đơn xin vào nhóm"}
                            className={`py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                              hasGroup
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Gửi yêu cầu</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Group Members Card - Display if user is in a group */}
      {currentUser?.teamId && groupMembers.length > 0 && (
        <GroupMembersCard
          members={groupMembers}
          groupName={currentUser.teamName || "Nhóm 04"}
          maxMembers={4}
        />
      )}

      <ReviewApplicantsModal />
    </div>
  );
};
