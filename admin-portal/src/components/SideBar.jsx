import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Ticket,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Settings,
  Building,
  CalendarDays,
} from 'lucide-react';
import axiosInstance from '../utils/Instance';
import { authContext } from '../context/AuthContext';

const SideBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Faculty', icon: Users, route: '/faculty' },
    { label: 'Blocks', icon: Building, route: '/blocks' },
    { label: 'Schedule', icon: CalendarDays, route: '/schedule' },
    { label: 'Notifications', icon: Bell, route: '/notifications' },
    { label: 'Help Tickets', icon: Ticket, route: '/help-requests' },
  ];
  const { user, setuser, navigate } = useContext(authContext);

  const getNavLinkClass = (isActive) => {
    const base =
      'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 relative overflow-hidden';
    const active = isActive
      ? 'bg-white shadow-sm text-slate-900 font-semibold'
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 font-medium';
    return `${base} ${active}`;
  };

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get('/api/auth/logout');
      console.log(res.data);
      setuser(null);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-50/80 backdrop-blur-xl flex flex-col z-50 border-r border-slate-200 font-sans transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 shrink-0 border-b border-slate-200/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <ShieldCheck size={20} className="text-slate-700" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Admin Portal
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-2">Smart Console</h1>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar pt-6">
          <div className="mb-6">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Main Menu
            </p>
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.route}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      className={
                        isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                      }
                    />
                    <span className="text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-6">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              System
            </p>
            <NavLink
              to="/settings"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <Settings
                    size={18}
                    className={
                      isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                    }
                  />
                  <span className="text-sm">Settings</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-all font-medium text-sm shadow-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0, 0, 0, 0.1); 
          border-radius: 10px;
        }
      `}</style>
      </aside>
    </>
  );
};

export default SideBar;
