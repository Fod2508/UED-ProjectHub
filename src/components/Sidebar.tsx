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
  GraduationCap,
  ShieldCheck,
  Crown,
  User,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentScreen, setCurrentScreen, applicants, groupReport, currentRole, currentUser, classGroups } = useApp();

  const pendingApplicantsCount = applicants.filter((a) => a.status === 'pending').length;
  const warningCount = groupReport.members.filter((m) => m.isWarning).length;

  const isLeader = currentUser?.isGroupLeader ?? false;
  const isLecturer = currentRole === 'lecturer';

  // Customize Navigation Items per Role
  let navItems: {
    id: ScreenType;
    label: string;
    sublabel?: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [];

  if (isLecturer) {
    navItems = [
      {
        id: 'landing',
        label: 'Trang chủ',
        icon: <Home className="w-[18px] h-[18px]" />
      },
      {
        id: 'dashboard',
        label: 'Tổng quan Môn học',
        icon: <LayoutDashboard className="w-[18px] h-[18px]" />
      },
      {
        id: 'matchmaking',
        label: 'Quản lý Nhóm & Đề tài',
        icon: <Users className="w-[18px] h-[18px]" />,
        badge: classGroups.length,
        badgeColor: 'bg-indigo-600 text-white'
      },
      {
        id: 'kanban',
        label: 'Bảng tiến độ Kanban',
        icon: <KanbanSquare className="w-[18px] h-[18px]" />
      },
      {
        id: 'milestones',
        label: 'Cột mốc & Đề cương',
        icon: <CalendarCheck className="w-[18px] h-[18px]" />
      },
      {
        id: 'peer_review',
        label: 'Đánh giá chéo thành viên',
        icon: <ClipboardCheck className="w-[18px] h-[18px]" />
      },
      {
        id: 'report',
        label: 'Báo cáo & Thẩm định',
        icon: <BarChart3 className="w-[18px] h-[18px]" />,
        badge: warningCount > 0 ? warningCount : undefined,
        badgeColor: 'bg-rose-500 text-white'
      }
    ];
  } else if (isLeader) {
    // Sinh viên - Trưởng nhóm
    navItems = [
      {
        id: 'landing',
        label: 'Trang chủ',
        icon: <Home className="w-[18px] h-[18px]" />
      },
      {
        id: 'dashboard',
        label: 'Tổng quan Nhóm đồ án',
        sublabel: currentUser?.teamName || 'Nhóm của tôi',
        icon: <LayoutDashboard className="w-[18px] h-[18px]" />
      },
      {
        id: 'matchmaking',
        label: 'Quản lý Nhóm & Duyệt TV',
        sublabel: 'Xét duyệt hồ sơ SV',
        icon: <Users className="w-[18px] h-[18px]" />,
        badge: pendingApplicantsCount > 0 ? pendingApplicantsCount : undefined,
        badgeColor: 'bg-emerald-600 text-white animate-pulse'
      },
      {
        id: 'kanban',
        label: 'Bảng tiến độ Kanban',
        sublabel: 'Giao việc & Duyệt task',
        icon: <KanbanSquare className="w-[18px] h-[18px]" />
      },
      {
        id: 'milestones',
        label: 'Cột mốc & Sprint nội bộ',
        sublabel: 'Lập kế hoạch nhóm',
        icon: <CalendarCheck className="w-[18px] h-[18px]" />
      },
      {
        id: 'peer_review',
        label: 'Đánh giá chéo thành viên',
        sublabel: 'Bỏ phiếu ẩn danh',
        icon: <ClipboardCheck className="w-[18px] h-[18px]" />
      },
      {
        id: 'report',
        label: 'Báo cáo Đóng góp của tôi',
        sublabel: 'Xem điểm & Giải trình',
        icon: <BarChart3 className="w-[18px] h-[18px]" />,
        badge: warningCount > 0 ? warningCount : undefined,
        badgeColor: 'bg-rose-500 text-white'
      }
    ];
  } else {
    // Sinh viên - Thành viên
    navItems = [
      {
        id: 'landing',
        label: 'Trang chủ',
        icon: <Home className="w-[18px] h-[18px]" />
      },
      {
        id: 'dashboard',
        label: 'Tổng quan Đồ án của tôi',
        icon: <LayoutDashboard className="w-[18px] h-[18px]" />
      },
      {
        id: 'matchmaking',
        label: currentUser?.teamId ? 'Thông tin Nhóm của tôi' : 'Tìm nhóm & Ghép đôi',
        sublabel: currentUser?.teamId ? 'Thành viên nhóm' : 'So khớp kỹ năng & Lịch rảnh',
        icon: <Users className="w-[18px] h-[18px]" />
      },
      {
        id: 'kanban',
        label: 'Bảng tiến độ Kanban',
        sublabel: 'Tasks được phân công',
        icon: <KanbanSquare className="w-[18px] h-[18px]" />
      },
      {
        id: 'milestones',
        label: 'Lịch nộp bài học phần',
        sublabel: 'Theo dõi Deadline',
        icon: <CalendarCheck className="w-[18px] h-[18px]" />
      },
      {
        id: 'peer_review',
        label: 'Đánh giá chéo thành viên',
        sublabel: 'Bỏ phiếu ẩn danh',
        icon: <ClipboardCheck className="w-[18px] h-[18px]" />
      },
      {
        id: 'report',
        label: 'Điểm đóng góp của tôi',
        sublabel: 'Minh bạch & Bảo mật',
        icon: <BarChart3 className="w-[18px] h-[18px]" />
      }
    ];
  }

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
                UED
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-tight">
                  UED <span className="text-blue-600">ProjectHub</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Khoa CNTT • ĐH Sư phạm
                </span>
              </div>
            </button>
          </div>

          {/* Section Category Title tailored by Role */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              {isLecturer
                ? 'Quản trị Đồ án (Giảng viên)'
                : isLeader
                ? 'Đồ án Nhóm (Trưởng nhóm)'
                : 'Đồ án Nhóm (Thành viên)'}
            </span>
            {isLecturer ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                GV
              </span>
            ) : isLeader ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Leader
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Member
              </span>
            )}
          </div>

          {/* Nav items list */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all text-left ${
                    isActive
                      ? isLecturer
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                        : isLeader
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-600/30'
                        : 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/30'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="truncate">{item.label}</span>
                      {item.sublabel && (
                        <span
                          className={`text-[10px] font-normal truncate ${
                            isActive ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
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

        {/* Bottom Role-Aware Status Card */}
        <div
          className={`p-3 m-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
            isLecturer
              ? 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
              : isLeader
              ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900'
              : 'bg-blue-50/80 border-blue-100 text-blue-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {isLecturer ? (
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              ) : isLeader ? (
                <Crown className="w-4 h-4 text-emerald-600" />
              ) : (
                <User className="w-4 h-4 text-blue-600" />
              )}
              <span className="truncate">
                {isLecturer
                  ? 'Giảng viên hướng dẫn'
                  : isLeader
                  ? 'Trưởng nhóm'
                  : 'Thành viên nhóm'}
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              HK1 2026-27
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-snug truncate">
            {currentUser?.name || (isLecturer ? 'TS. Trần Văn B' : 'Nguyễn Văn A')}
            {currentUser?.teamName && !isLecturer && (
              <span className="text-slate-500 block truncate text-[10px]">
                {currentUser.teamName}
              </span>
            )}
          </p>
        </div>
      </aside>
    </>
  );
};
