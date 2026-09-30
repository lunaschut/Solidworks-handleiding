import React from 'react';
import { Box, Sparkles, Home, FolderOpen } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'saved-guides';
  onNavigateHome: () => void;
  onNavigateSavedGuides: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onNavigateSavedGuides,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-red-200/80 bg-rose-50/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3 py-3 sm:h-[72px] sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700 ring-1 ring-red-100">
            <Box className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                SolidWorks Schets Analyzer
              </h1>
              <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 sm:inline">
                CAD Vision AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <nav aria-label="Hoofdnavigatie" className="flex items-center rounded-xl bg-slate-100 p-1">
          <button
            onClick={onNavigateHome}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              currentView === 'home'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={onNavigateSavedGuides}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              currentView === 'saved-guides'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Mijn handleidingen</span>
          </button>
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Gemini 3.8 Vision</span>
          </div>
        </div>
      </div>
    </header>
  );
};
