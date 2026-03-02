import {
  Search,
  Navigation,
  Calendar,
  Users,
  DoorOpen,
  Bell,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Building,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SidePanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidePanel = ({ isCollapsed, onToggle }: SidePanelProps) => {
  const navItems = [
    { key: 'campus', label: 'Campus Map', icon: Building, color: 'bg-[#8dc63f]', route: '/' },
    { key: 'navigate', label: 'Navigate', icon: Navigation, route: '/navigate' },
    { key: 'schedule', label: 'Schedule', icon: Calendar, route: '/schedule' },
    { key: 'faculty', label: 'Faculty', icon: Users, route: '/faculty' },
    { key: 'Blocks', label: 'Blocks', icon: DoorOpen, route: '/blocks' },
  ];

  const { t } = useTranslation();

  const getNavLinkClass = (isActive: boolean, activeColor?: string) => {
    const baseClasses = isCollapsed
      ? 'flex items-center justify-center p-5 rounded-2xl transition-all active:scale-95 duration-200 border shadow-sm'
      : 'flex items-center gap-5 px-8 py-6 rounded-[32px] transition-all active:scale-95 duration-200 border shadow-sm';
    const activeClasses = isActive
      ? `${activeColor ?? 'bg-blue-600'} text-white shadow-lg border-transparent`
      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-100';

    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div
      className={`relative h-full overflow-visible transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[100px]' : 'w-full'
      }`}
    >
      <button
        onClick={onToggle}
        className="absolute -right-[22px] top-1/2 -translate-y-1/2 z-[60] flex items-center justify-center w-[22px] h-40 bg-white/95 backdrop-blur-xl rounded-r-3xl shadow-[4px_0_10px_rgba(0,0,0,0.06)] hover:brightness-95 transition-all duration-200 cursor-pointer group"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        ) : (
          <ChevronLeft size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        )}
      </button>

      <div
        className={`h-full bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col select-none rounded-r-[40px] shadow-2xl overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${
          isCollapsed ? 'p-4 gap-4' : 'p-10 gap-10'
        }`}
      >

      <div className="shrink-0">
        {!isCollapsed && (
          <h2 className="text-slate-400 font-black tracking-[0.2em] text-xs mb-5 uppercase">
            {t('sidebar.title', 'Sidebar Panel')}
          </h2>
        )}
        <div className={`relative group ${isCollapsed ? 'flex justify-center' : ''}`}>
          {isCollapsed ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center">
              <Search size={24} className="text-slate-400" />
            </div>
          ) : (
            <>
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={24}
              />
              <input
                type="text"
                placeholder={t('sidebar.search')}
                className="w-full bg-slate-50 border border-slate-200 rounded-[24px] py-5 pl-14 pr-6 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
              />
            </>
          )}
        </div>
      </div>

      <nav className={`flex flex-col ${isCollapsed ? 'gap-2 items-center' : 'gap-4'}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.route}
            className={({ isActive }) => getNavLinkClass(isActive, item.color)}
            title={isCollapsed ? t(`sidebar.${item.key}`) : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon size={isCollapsed ? 26 : 28} strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && (
                  <span className="text-xl font-bold tracking-tight">
                    {t(`sidebar.${item.key}`)}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <ChevronRight
                    size={24}
                    className="ml-auto opacity-60 animate-in slide-in-from-left-2 duration-300"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={`mt-auto pt-6 border-t border-slate-100 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <NavLink to="/announcements" title={isCollapsed ? t('sidebar.announcements') : undefined}>
          {({ isActive }) => (
            <div className={getNavLinkClass(isActive, 'bg-[#002b5c]')}>
              <Bell size={24} className={isActive ? 'text-white' : 'text-slate-400'} />
              {!isCollapsed && (
                <span className="text-xl font-bold">{t('sidebar.announcements')}</span>
              )}
              {isActive && !isCollapsed && (
                <ChevronRight size={24} className="ml-auto opacity-60" />
              )}
            </div>
          )}
        </NavLink>
        {!isCollapsed && (
          <p className="text-xs text-slate-400 mt-5 px-4 leading-relaxed text-center font-medium">
            {t('sidebar.maintenance')}
          </p>
        )}
      </div>

      <div className={`pt-8 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!isCollapsed && (
          <h2 className="text-slate-400 font-black tracking-[0.2em] text-xs mb-5 uppercase">
            {t('sidebar.help')}
          </h2>
        )}
        <NavLink to="/help" title={isCollapsed ? t('sidebar.contactSupport') : undefined}>
          {({ isActive }) => (
            <div className={getNavLinkClass(isActive, 'bg-slate-800')}>
              <MessageSquare size={22} className={isActive ? 'text-white' : 'text-blue-500'} />
              {!isCollapsed && (
                <span className="text-xl font-bold">{t('sidebar.contactSupport')}</span>
              )}
              {isActive && !isCollapsed && (
                <ChevronRight size={24} className="ml-auto opacity-60" />
              )}
            </div>
          )}
        </NavLink>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
      </div>
    </div>
  );
};

export default SidePanel;
