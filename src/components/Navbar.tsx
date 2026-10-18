import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Bell,
  HelpCircle,
  Menu,
  RotateCcw,
  UserCheck,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { currentScreen, currentRole, switchRole, resetToDemoData } = useApp();

  const screenTitles: Record<string, string> = {
    landing: 'Trang chủ Hệ thống',
    dashboard: 'Tổng quan Đồ án Nhóm 04',
    matchmaking: 'Ghép nhóm & Duyệt thành viên (SCR_01)',
    kanban: 'Bảng tiến độ công việc Kanban (SCR_03)',
    milestones: 'Cấu hình Đề cương & Cột mốc nộp bài (SCR_04)',
    peer_review: 'Đánh giá chéo Cột mốc 2 (SCR_05)',
    report: 'Báo cáo mức độ đóng góp & Cảnh báo (SCR_06)'
  };

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
          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
            Khoa CNTT • ĐH Sư phạm
          </span>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Học kỳ 1 (2026 - 2027)</span>
          </div>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 truncate max-w-xs md:max-w-md">
            {screenTitles[currentScreen] || 'ProjectHub'}
          </span>
        </div>
      </div>

      {/* Right: Actions, Role Switcher, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Reset button for demo convenience */}
        <button
          onClick={resetToDemoData}
          title="Khôi phục dữ liệu mẫu ban đầu để thử nghiệm lại"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Demo</span>
        </button>

        {/* ROLE SWITCHER */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => switchRole('student')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              currentRole === 'student'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sinh viên:</span>
            <span>Nguyễn Văn A</span>
          </button>
          <button
            onClick={() => switchRole('lecturer')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              currentRole === 'lecturer'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Giảng viên:</span>
            <span>TS. Trần Văn B</span>
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition hidden sm:flex"
            aria-label="Trợ giúp"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              currentRole === 'student' ? 'bg-blue-600' : 'bg-indigo-700'
            }`}
          >
            {currentRole === 'student' ? 'A' : 'TB'}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {currentRole === 'student' ? 'Nguyễn Văn A' : 'TS. Trần Văn B'}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              {currentRole === 'student' ? 'Trưởng nhóm (Nhóm 04)' : 'Giảng viên hướng dẫn'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
