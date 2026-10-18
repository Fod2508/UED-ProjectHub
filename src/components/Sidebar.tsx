import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ScreenType } from '../types/index.ts';
import {
  Home,
  LayoutDashboard,
  Users,
  KanbanSquare,
  CalendarCheck,
  ClipboardCheck,
  BarChart3,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentScreen, setCurrentScreen, applicants, groupReport } = useApp();

  const pendingApplicantsCount = applicants.filter((a) => a.status === 'pending').length;
  const warningCount = groupReport.members.filter((m) => m.isWarning).length;

  const navItems: {
    id: ScreenType;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'landing',
      label: 'Trang chủ',
      icon: <Home className="w-[18px] h-[18px]" />
    },
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />
    },
    {
      id: 'matchmaking',
      label: 'Ghép nhóm (SCR_01)',
      icon: <Users className="w-[18px] h-[18px]" />,
      badge: pendingApplicantsCount > 0 ? pendingApplicantsCount : undefined,
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      id: 'kanban',
      label: 'Bảng tiến độ (SCR_03)',
      icon: <KanbanSquare className="w-[18px] h-[18px]" />
    },
    {
      id: 'milestones',
      label: 'Cột mốc nộp bài (SCR_04)',
      icon: <CalendarCheck className="w-[18px] h-[18px]" />
    },
    {
      id: 'peer_review',
      label: 'Đánh giá chéo (SCR_05)',
      icon: <ClipboardCheck className="w-[18px] h-[18px]" />
    },
    {
      id: 'report',
      label: 'Báo cáo & Cảnh báo (SCR_06)',
      icon: <BarChart3 className="w-[18px] h-[18px]" />,
      badge: warningCount > 0 ? warningCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    }
  ];

  const handleNavClick = (screen: ScreenType) => {
    setCurrentScreen(screen);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/90 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                UD
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-tight">
                  UD-DN <span className="text-blue-600">ProjectHub</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Khoa CNTT • ĐH Sư phạm
                </span>
              </div>
            </button>
          </div>

          {/* Section Category */}
          <div className="px-5 pt-4 pb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Học phần Đồ án Môn học
            </span>
          </div>

          {/* Nav items list */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs sm:text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/30'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Academic Year Card */}
        <div className="p-3 m-3 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Niên khóa 2026 - 2027</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Cổng thông tin đồ án chuyên ngành &amp; đánh giá năng lực cộng tác.
          </p>
        </div>
      </aside>
    </>
  );
};
