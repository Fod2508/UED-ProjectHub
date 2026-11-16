import React from "react";
import { useApp } from "../context/AppContext.tsx";
import { NotificationDropdown } from "./NotificationDropdown.tsx";
import {
  Bell,
  HelpCircle,
  Menu,
  UserCheck,
  Calendar,
  ShieldCheck,
  LogOut,
  LogIn,
  Crown,
} from "lucide-react";

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentScreen,
    setCurrentScreen,
    currentRole,
    currentUser,
    logout,
    unreadNotificationCount,
    isNotificationOpen,
    setIsNotificationOpen,
  } = useApp();

  const isLeader = currentUser?.isGroupLeader ?? false;
  const isLecturer = currentRole === "lecturer";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Học kỳ 1 (2026 - 2027)</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Role Badge, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isLecturer
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : isLeader
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {isLecturer ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : isLeader ? (
              <Crown className="w-3.5 h-3.5" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            <span>
              {isLecturer
                ? "Giảng viên"
                : isLeader
                ? "Trưởng nhóm"
                : "Thành viên"}
            </span>
          </span>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer relative ${
                isNotificationOpen
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label="Thông báo"
              title="Xem thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            <NotificationDropdown />
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition hidden sm:flex"
            aria-label="Trợ giúp"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar & Auth Action */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              currentRole === "student" ? "bg-blue-600" : "bg-indigo-700"
            }`}
          >
            {currentUser?.avatarText ||
              (currentRole === "student" ? "A" : "TB")}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser?.name ||
                (currentRole === "student" ? "Sinh viên" : "Giảng viên")}
            </span>
            <span className="text-xs text-slate-500 leading-tight">
              {currentUser?.title || (currentRole === "student" ? "Sinh viên" : "Giảng viên")}
            </span>
          </div>

          {currentUser ? (
            /* Logout Button - When user is logged in */
            <button
              onClick={logout}
              className="ml-2 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition text-xs font-medium cursor-pointer"
              aria-label="Đăng xuất"
              title="Đăng xuất khỏi tài khoản"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          ) : (
            /* Login Button - When in demo / unauthenticated */
            <button
              onClick={() => setCurrentScreen("login")}
              className="ml-2 px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white transition text-xs font-semibold shadow-xs cursor-pointer"
              aria-label="Đăng nhập"
              title="Đăng nhập với tài khoản của bạn"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
