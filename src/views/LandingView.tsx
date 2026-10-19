import React from "react";
import { useApp } from "../context/AppContext.tsx";
import {
  GraduationCap,
  Users,
  KanbanSquare,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  LogIn,
} from "lucide-react";

export const LandingView: React.FC = () => {
  const { setCurrentScreen, switchRole, tasks, currentUser } = useApp();

  const handleStudentStart = () => {
    if (currentUser) {
      switchRole("student");
      setCurrentScreen("dashboard");
    } else {
      setCurrentScreen("login");
    }
  };

  const handleLecturerStart = () => {
    if (currentUser) {
      switchRole("lecturer");
      setCurrentScreen("milestones");
    } else {
      setCurrentScreen("login");
    }
  };

  // Find 2 sample tasks for mini preview
  const inProgressTask = tasks.find((t) => t.status === "Đang thực hiện") ||
    tasks[3] || {
      code: "#TSK-12",
      title: "API Đăng nhập",
      description: "JWT + SSO",
      status: "Đang thực hiện",
      assigneeAvatar: "A",
    };
  const doneTask = tasks.find((t) => t.status === "Hoàn thành") ||
    tasks[7] || {
      code: "#TSK-08",
      title: "CSDL Schema",
      description: "PostgreSQL ERD",
      status: "Hoàn thành",
      assigneeAvatar: "H",
    };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative bg-grid-pattern overflow-hidden">
      {/* Ambient background glow spots */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="w-full shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                UED <span className="text-blue-600">ProjectHub</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Khoa CNTT • ĐH Sư Phạm Đà Nẵng
              </p>
            </div>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => setCurrentScreen("dashboard")}
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Hướng dẫn sử dụng</span>
            </button>
            {currentUser ? (
              <button
                onClick={() => setCurrentScreen("dashboard")}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 hover:border-blue-400 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {currentUser.avatarText || "U"}
                </div>
                <span>{currentUser.name} (Vào ứng dụng)</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentScreen("login")}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 hover:border-blue-400 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-blue-500" />
                <span>Đăng nhập SSO Trường</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Split Section */}
      <main className="flex-1 flex items-center justify-center max-w-7xl w-full mx-auto px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center w-full">
          {/* LEFT COLUMN: Content & Action */}
          <div className="flex flex-col justify-center space-y-4 max-w-xl">
            {/* Pill Badge - Shortened */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>Quản lý Đồ án CNTT</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-900 leading-[1.3]">
              Hệ thống quản lý đồ án môn học cho sinh viên ngành{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Công nghệ Thông tin
              </span>{" "}
              Trường Đại học Sư phạm - Đại học Đà Nẵng
            </h1>

            {/* 3 Feature Bullets */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-md bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs lg:text-sm font-medium text-slate-700">
                  Ghép nhóm theo kỹ năng &amp; lịch rảnh
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-md bg-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
                  <KanbanSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs lg:text-sm font-medium text-slate-700">
                  Quản lý tiến độ nhóm
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-md bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs lg:text-sm font-medium text-slate-700">
                  Đánh giá chéo chống free-rider
                </span>
              </div>
            </div>

            {/* CTA Buttons - Shortened */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStudentStart}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <span>{currentUser ? "Bảng điều khiển" : "Sinh viên - Bắt đầu"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleLecturerStart}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-sm border border-slate-300 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <span>{currentUser ? "Góc Giảng viên" : "Giảng viên"}</span>
              </button>
              {!currentUser && (
                <button
                  onClick={() => {
                    switchRole("student");
                    setCurrentScreen("dashboard");
                  }}
                  className="px-3.5 py-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-medium text-xs transition cursor-pointer"
                  title="Xem nhanh hệ thống với dữ liệu mẫu mà không cần đăng nhập"
                >
                  ⚡ Trải nghiệm bản Demo
                </button>
              )}
            </div>

            {/* Footnote - Removed */}
          </div>

          {/* RIGHT COLUMN: Dashboard Preview Card */}
          <div className="flex justify-center items-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/20 rounded-2xl filter blur-xl transform scale-95 -z-10"></div>

            <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-2xl shadow-blue-900/10 space-y-4">
              {/* Card Header - Shortened */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
                    04
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">
                      Nhóm 04 - Web App
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      HK2 2024-2025
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                </div>
              </div>

              {/* Mini-Widget 1: Match Score & Sprint Status */}
              <div className="grid grid-cols-12 gap-3 items-center bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                {/* Circular Progress */}
                <div className="col-span-7 flex items-center gap-3 border-r border-slate-200/70 pr-2">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg
                      className="w-12 h-12 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray="88, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-slate-700">
                      88%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Phù hợp kỹ năng
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      Fullstack + UI
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="col-span-5 pl-1">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Sprint
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Đúng hạn</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    M1: Khảo sát
                  </p>
                </div>
              </div>

              {/* Mini-Widget 2: Mini Kanban preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      Kanban
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded">
                      5m
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentScreen("kanban")}
                    className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* 2 Mini Kanban Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Task Card 1: In Progress */}
                  <div
                    onClick={() => setCurrentScreen("kanban")}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        Đang làm
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inProgressTask.code || "#TSK-12"}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 leading-snug truncate">
                      {inProgressTask.title || "API Đăng nhập"}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {inProgressTask.description || "JWT + SSO"}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold">
                          {inProgressTask.assigneeAvatar || "A"}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium">
                        Hạn: Hôm qua
                      </span>
                    </div>
                  </div>

                  {/* Task Card 2: Done */}
                  <div
                    onClick={() => setCurrentScreen("kanban")}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Hoàn thành
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {doneTask.code || "#TSK-08"}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 leading-snug truncate">
                      {doneTask.title || "CSDL Schema"}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {doneTask.description || "PostgreSQL ERD"}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-[8px] text-white flex items-center justify-center font-bold">
                        {doneTask.assigneeAvatar || "H"}
                      </div>
                      <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        ✓ 100%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Team Quick-Row inside Preview */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  4 online
                </span>
                <span className="text-slate-400">
                  Đánh giá:{" "}
                  <strong className="text-slate-600 font-semibold">Bật</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
