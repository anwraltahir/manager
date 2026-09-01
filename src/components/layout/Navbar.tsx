import React from 'react';
import {
  Globe,
  Plus,
  Lock,
  Search,
  Layers,
  Menu,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNewProject }) => {
  const { language, setLanguage, isAuthenticated, logout, settings } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Left / Start: Mobile Menu toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-200">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                {isRtl ? (settings.companyNameAr || 'إتقان برو') : (settings.companyNameEn || 'Itqan Pro Admin')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">v1.0 • High Density Admin</span>
            </div>
          </div>
        </div>

        {/* Right / End: Quick Actions & Language */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewProject}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg transition-all shadow-md shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.newProject}</span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors uppercase tracking-wider"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Lock / Security Button */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              title={t.logout}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
