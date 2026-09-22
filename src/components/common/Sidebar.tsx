import React from 'react';
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Radar,
  Bell,
  Database,
  Cpu,
  Menu,
  X,
  ExternalLink,
  FolderArchive,
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'risk-map'
  | 'predictions'
  | 'storm-tracking'
  | 'alerts'
  | 'datasets'
  | 'data-status'
  | 'ai-model'
  | 'ai-algorithm'
  | 'about';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  activeAlertsCount?: number;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'risk-map' as PageId, label: 'Risk Map', icon: Map, badge: 'GIS' },
  { id: 'predictions' as PageId, label: 'Predictions', icon: TrendingUp, badge: '30-90m' },
  { id: 'storm-tracking' as PageId, label: 'Storm Tracking', icon: Radar },
  { id: 'alerts' as PageId, label: 'Alerts', icon: Bell, hasAlertBadge: true },
  { id: 'datasets' as PageId, label: 'Datasets', icon: FolderArchive, badge: 'Upload' },
  { id: 'ai-algorithm' as PageId, label: 'AI Algorithm', icon: Cpu, badge: 'CNN+LSTM' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  activeAlertsCount = 0,
  isOpenMobile,
  onToggleMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onToggleMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile Toggle Button on Top Left */}
      <button
        onClick={onToggleMobile}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center font-bold"
        aria-label="Toggle navigation menu"
      >
        {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
          <span className="font-bold text-sm tracking-wide text-amber-400">TEMPESTCAST MENU</span>
          <button onClick={onToggleMobile} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Monitoring Operations
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPage === item.id ||
              (item.id === 'ai-algorithm' && currentPage === 'ai-model');
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (isOpenMobile) onToggleMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.hasAlertBadge && activeAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white font-mono shadow-sm">
                    {activeAlertsCount}
                  </span>
                )}

                {item.badge && !item.hasAlertBadge && (
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                      isActive
                        ? 'bg-amber-400/25 text-amber-200 border border-amber-500/30'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System & Architecture Info in Sidebar Footer */}
        <div className="p-3 m-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              CNN + ConvLSTM
            </span>
            <span className="text-[10px] font-mono text-amber-400/90">v0.1-Proto</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Multi-source radar, satellite &amp; lightning nowcast model architecture.
          </p>
          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>Problem 26072</span>
            <span className="flex items-center gap-0.5 text-slate-400">
              Supabase / API
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
