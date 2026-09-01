import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Settings,
  Plus,
  Lock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onNewProject: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNewProject,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { language, stats } = useApp();
  const t = useTranslation(language);

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'projects',
      label: t.navProjects,
      icon: FolderKanban,
      badge: stats.totalProjects,
    },
    {
      id: 'clients',
      label: t.navClients,
      icon: Users,
    },
    {
      id: 'quotations',
      label: t.navQuotations,
      icon: FileText,
      badge: stats.quotationReady + stats.waitingApproval,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'in_progress',
      label: t.navInProgress,
      icon: Clock,
      badge: stats.inProgress,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'completed',
      label: t.navCompleted,
      icon: CheckCircle2,
      badge: stats.completed,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Settings,
    },
  ];

  const handleItemClick = (id: ViewMode) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-40 w-64 bg-white border-e border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top brand & navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Logo / Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-200">
                <span>{language === 'ar' ? 'أ' : 'A'}</span>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  {language === 'ar' ? 'إدارة أنور' : 'Anwar Management'}
                </h1>
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === 'ar' ? 'نظام إدارة المشاريع' : 'Project Management'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Create Project Button */}
          <div className="p-3">
            <button
              type="button"
              onClick={() => {
                onNewProject();
                onCloseMobile();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg transition-all shadow-md shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newProject}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 pt-0 space-y-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-200/60 text-blue-800'
                          : item.badgeColor || 'bg-gray-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Filter Section Header */}
            <div className="pt-3 pb-1 px-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ar' ? 'تصفية سريعة' : 'Quick Filters'}
              </span>
            </div>

            {navItems.slice(4, 6).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-500 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-200/60 text-blue-800'
                          : item.badgeColor || 'bg-gray-100 text-slate-600'
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

        {/* Bottom Navigation & Settings */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 space-y-1">
          <button
            type="button"
            onClick={() => handleItemClick('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'settings'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {currentView === 'settings' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              ) : (
                <Settings className="w-4 h-4 text-slate-400" />
              )}
              <span>{t.navSettings}</span>
            </div>
          </button>

          <div className="px-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600">Admin Active</span>
            </div>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
};
