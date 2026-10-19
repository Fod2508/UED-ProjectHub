import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { AppNotification, NotificationType } from "../types/index.ts";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Users,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Award,
  Clock,
  FileText,
  ShieldAlert,
  ArrowRight,
  X,
  Trash2,
} from "lucide-react";

export const NotificationDropdown: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    isNotificationOpen,
    setIsNotificationOpen,
    setCurrentScreen,
    currentRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen, setIsNotificationOpen]);

  if (!isNotificationOpen) return null;

  // Filter notifications relevant to current role
  const roleNotifications = notifications.filter(
    (n) => n.recipientRole === "all" || n.recipientRole === currentRole,
  );

  const displayNotifications = roleNotifications.filter((n) =>
    activeTab === "unread" ? !n.read : true,
  );

  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "team_request":
        return {
          icon: <Users className="w-4 h-4 text-blue-600" />,
          bg: "bg-blue-100",
        };
      case "team_approved":
        return {
          icon: <Users className="w-4 h-4 text-emerald-600" />,
          bg: "bg-emerald-100",
        };
      case "team_rejected":
        return {
          icon: <Users className="w-4 h-4 text-rose-600" />,
          bg: "bg-rose-100",
        };
      case "milestone_published":
        return {
          icon: <Calendar className="w-4 h-4 text-indigo-600" />,
          bg: "bg-indigo-100",
        };
      case "task_assigned":
        return {
          icon: <CheckSquare className="w-4 h-4 text-blue-600" />,
          bg: "bg-blue-100",
        };
      case "task_overdue":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
          bg: "bg-rose-100",
        };
      case "peer_review_open":
      case "peer_review_reminder":
        return {
          icon: <Award className="w-4 h-4 text-amber-600" />,
          bg: "bg-amber-100",
        };
      case "report_ready":
      case "report_revision":
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          bg: "bg-rose-100",
        };
      case "report_approved":
        return {
          icon: <FileText className="w-4 h-4 text-emerald-600" />,
          bg: "bg-emerald-100",
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-slate-600" />,
          bg: "bg-slate-100",
        };
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetScreen) {
      setCurrentScreen(notif.targetScreen);
      setIsNotificationOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-sm">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
              {unreadCount} mới
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đã đọc tất cả</span>
            </button>
          )}
          <button
            onClick={() => setIsNotificationOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-4 pt-2 gap-4 bg-white text-xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2.5 font-semibold transition cursor-pointer relative ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Tất cả ({roleNotifications.length})
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`pb-2.5 font-semibold transition cursor-pointer relative ${
            activeTab === "unread"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {displayNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <BellOff className="w-6 h-6" />
            </div>
            <p className="text-xs">Không có thông báo nào</p>
          </div>
        ) : (
          displayNotifications.map((notif) => {
            const { icon, bg } = getIconForType(notif.type);

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 transition cursor-pointer flex items-start gap-3 relative group ${
                  !notif.read
                    ? "bg-blue-50/40 hover:bg-blue-50/70"
                    : "hover:bg-slate-50/80"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-xs font-bold truncate ${
                        !notif.read ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.createdAt}
                    </span>

                    {notif.targetScreen && (
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition absolute right-2 top-2"
                  title="Xóa thông báo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-500">
          Hệ thống thông báo thời gian thực • UD-DN ProjectHub
        </span>
      </div>
    </div>
  );
};
