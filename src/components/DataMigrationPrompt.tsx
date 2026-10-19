import React, { useState, useEffect } from "react";
import { Database, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  migrateInitialDataToFirestore,
  hasUserMigratedData,
} from "../utils/migrateToFirestore";

export const DataMigrationPrompt: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [show, setShow] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkMigrationStatus = async () => {
      if (!currentUser?.teamId) {
        setChecking(false);
        return;
      }

      try {
        const hasMigrated = await hasUserMigratedData(currentUser.teamId);
        setShow(!hasMigrated);
      } catch (error) {
        console.error("Error checking migration status:", error);
      } finally {
        setChecking(false);
      }
    };

    checkMigrationStatus();
  }, [currentUser?.teamId]);

  const handleMigrate = async () => {
    if (!currentUser?.id || !currentUser?.teamId) {
      showToast("Thông tin user không hợp lệ.", "error");
      return;
    }

    setMigrating(true);

    try {
      const result = await migrateInitialDataToFirestore(
        currentUser.id,
        currentUser.teamId,
      );

      if (result.success) {
        showToast(
          "✅ Đã import dữ liệu demo thành công! Refresh để xem.",
          "success",
        );
        setShow(false);

        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showToast("❌ Import dữ liệu thất bại. Vui lòng thử lại.", "error");
      }
    } catch (error) {
      console.error("Migration error:", error);
      showToast("❌ Có lỗi xảy ra khi import dữ liệu.", "error");
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    setShow(false);
    showToast("Bạn có thể tự tạo tasks và milestones mới.", "info");
  };

  if (checking) {
    return null; // Don't show anything while checking
  }

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Database className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Chào mừng bạn đến với UED-ProjectHub!
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Bạn chưa có dữ liệu nào. Bạn có muốn import dữ liệu demo để xem cách
            hệ thống hoạt động không?
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Dữ liệu demo bao gồm:</p>
              <ul className="mt-1 space-y-0.5 text-blue-800">
                <li>• 10 tasks mẫu (Kanban board)</li>
                <li>• 4 milestones (cột mốc)</li>
                <li>• Lịch rảnh mẫu</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            disabled={migrating}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition disabled:opacity-50"
          >
            Bỏ qua
          </button>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {migrating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Đang import...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Import dữ liệu demo</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center">
          Bạn có thể xóa và tự tạo dữ liệu mới sau.
        </p>
      </div>
    </div>
  );
};
