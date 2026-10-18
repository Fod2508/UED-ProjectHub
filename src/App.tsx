import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Toast } from './components/Toast.tsx';

import { LandingView } from './views/LandingView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { MatchmakingView } from './views/MatchmakingView.tsx';
import { KanbanView } from './views/KanbanView.tsx';
import { MilestonesView } from './views/MilestonesView.tsx';
import { PeerReviewView } from './views/PeerReviewView.tsx';
import { ContributionReportView } from './views/ContributionReportView.tsx';

const AppContent: React.FC = () => {
  const { currentScreen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on landing screen, render full landing page layout
  if (currentScreen === 'landing') {
    return (
      <div className="min-h-screen">
        <LandingView />
        <Toast />
      </div>
    );
  }

  // Dashboard / App Workspace layout with left Sidebar and fixed Navbar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
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
          {currentScreen === 'dashboard' && <DashboardView />}
          {currentScreen === 'matchmaking' && <MatchmakingView />}
          {currentScreen === 'kanban' && <KanbanView />}
          {currentScreen === 'milestones' && <MilestonesView />}
          {currentScreen === 'peer_review' && <PeerReviewView />}
          {currentScreen === 'report' && <ContributionReportView />}
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
