import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { Navbar } from "./components/Navbar.tsx";
import { Toast } from "./components/Toast.tsx";

import { LandingView } from "./views/LandingView.tsx";
import { LoginView } from "./views/LoginView.tsx";
import { DashboardView } from "./views/DashboardView.tsx";
import { MatchmakingView } from "./views/MatchmakingView.tsx";
import { KanbanView } from "./views/KanbanView.tsx";
import { MilestonesView } from "./views/MilestonesView.tsx";
import { PeerReviewView } from "./views/PeerReviewView.tsx";
import { ContributionReportView } from "./views/ContributionReportView.tsx";
import { DataMigrationPrompt } from "./components/DataMigrationPrompt.tsx";

const AppContent: React.FC = () => {
  const { currentScreen, authLoading } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show loading spinner during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If on landing screen, render full landing page layout
  if (currentScreen === "landing") {
    return (
      <div className="min-h-screen">
        <LandingView />
        <Toast />
      </div>
    );
  }

  // If on login screen, render login view
  if (currentScreen === "login") {
    return (
      <div className="min-h-screen">
        <LoginView />
        <Toast />
      </div>
    );
  }

  // Dashboard / App Workspace layout with left Sidebar and fixed Navbar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Data Migration Prompt (only shows if no data exists) */}
      <DataMigrationPrompt />

      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentScreen === "dashboard" && <DashboardView />}
          {currentScreen === "matchmaking" && <MatchmakingView />}
          {currentScreen === "kanban" && <KanbanView />}
          {currentScreen === "milestones" && <MilestonesView />}
          {currentScreen === "peer_review" && <PeerReviewView />}
          {currentScreen === "report" && <ContributionReportView />}
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
