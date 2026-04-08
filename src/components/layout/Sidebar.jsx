import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  FolderKanban, Activity, Timer, BarChart2,
  BookOpen, ClipboardList, Target,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'PLANLAMA',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tasks', icon: CheckSquare, label: 'Görevler' },
      { to: '/calendar', icon: Calendar, label: 'Takvim' },
      { to: '/notes', icon: FileText, label: 'Notlar' },
      { to: '/projects', icon: FolderKanban, label: 'Projeler' },
      { to: '/habits', icon: Activity, label: 'Alışkanlıklar' },
      { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
    ],
  },
  {
    label: 'ÖĞRENME',
    items: [
      { to: '/lessons', icon: BookOpen, label: 'Dersler' },
      { to: '/exams', icon: ClipboardList, label: 'Sınav Takvimi' },
      { to: '/goals', icon: Target, label: 'Hedefler' },
    ],
  },
  {
    label: 'ANALİZ',
    items: [
      { to: '/stats', icon: BarChart2, label: 'İstatistikler' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'K';

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col shrink-0 overflow-hidden relative"
      style={{
        background: 'rgba(12,12,14,0.95)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Ambient glow top */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 relative z-10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <motion.div
          className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0"
          style={{ boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-white font-bold text-xs">GT</span>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-semibold text-zinc-100 text-sm whitespace-nowrap"
            >
              Günlük Takip
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-3 overflow-y-auto overflow-x-hidden relative z-10">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1 text-[9px] font-bold tracking-widest text-zinc-600 uppercase"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 relative group
                    ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'}
                    ${isActive
                      ? 'text-violet-300'
                      : 'text-zinc-500 hover:text-zinc-200'
                    }`
                  }
                  title={collapsed ? label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active bg */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActive"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'rgba(124,58,237,0.12)',
                            boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.2)',
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      {/* Hover bg */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-white/[0.03]" />

                      <Icon
                        size={17}
                        className={`relative shrink-0 transition-colors ${isActive ? 'text-violet-400' : ''}`}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.15 }}
                            className="relative whitespace-nowrap"
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Active left accent */}
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="sidebarAccent"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-violet-400"
                          style={{ boxShadow: '0 0 8px rgba(124,58,237,0.8)' }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/5 p-2 space-y-1 relative z-10">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-3 py-2"
            >
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {user?.photoURL
                  ? <img src={user.photoURL} alt="av" className="w-6 h-6 rounded-full object-cover" />
                  : initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-300 truncate">{user?.displayName || 'Kullanıcı'}</p>
                <p className="text-[10px] text-zinc-600 truncate">{user?.email}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`w-full flex items-center gap-3 rounded-xl py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all ${collapsed ? 'justify-center px-2' : 'px-3'}`}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs whitespace-nowrap">
                Küçült
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 rounded-xl py-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition-all ${collapsed ? 'justify-center px-2' : 'px-3'}`}
          title={collapsed ? 'Çıkış Yap' : undefined}
        >
          <LogOut size={15} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs whitespace-nowrap">
                Çıkış Yap
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
