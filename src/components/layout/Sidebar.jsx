import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  FolderKanban, Activity, Timer, BarChart2,
  BookOpen, ClipboardList, Target, Brain, Sparkles,
  LogOut, ListTodo, Video, Trophy, Bell, Users,
  ChevronDown, ChevronLeft, ChevronRight,
  BookMarked, Cpu, GraduationCap, Users2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const NAV_GROUPS = [
  {
    id: 'ana',
    label: 'Ana',
    icon: LayoutDashboard,
    items: [
      { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/stats',       icon: BarChart2,        label: 'İstatistikler' },
      { to: '/reminders',   icon: Bell,             label: 'Hatırlatmalar' },
      { to: '/daily-todos', icon: ListTodo,          label: 'Günlük Yapılacaklar' },
    ],
  },
  {
    id: 'planlama',
    label: 'Planlama',
    icon: Calendar,
    items: [
      { to: '/planlama-hub', icon: FolderKanban, label: 'Planlama Hub' },
      { to: '/tasks',        icon: CheckSquare,  label: 'Görevler' },
      { to: '/calendar',     icon: Calendar,     label: 'Takvim' },
      { to: '/projects',     icon: FolderKanban, label: 'Projeler' },
      { to: '/pomodoro',     icon: Timer,        label: 'Pomodoro' },
      { to: '/goals',        icon: Target,       label: 'Hedefler' },
      { to: '/habits',       icon: Activity,     label: 'Alışkanlıklar' },
    ],
  },
  {
    id: 'akademi',
    label: 'Akademi',
    icon: GraduationCap,
    items: [
      { to: '/akademi-hub', icon: BookMarked,   label: 'Akademi Hub' },
      { to: '/lessons',     icon: BookOpen,     label: 'Dersler' },
      { to: '/exams',       icon: ClipboardList, label: 'Sınav Takvimi' },
      { to: '/yks',         icon: Brain,        label: 'YKS Merkezi' },
      { to: '/notes',       icon: FileText,     label: 'Hata Defteri' },
    ],
  },
  {
    id: 'ai',
    label: 'AI Merkezi',
    icon: Cpu,
    items: [
      { to: '/ai-planner',       icon: Sparkles, label: 'AI Planlayıcı' },
      { to: '/ai',               icon: Brain,    label: 'AI Merkezi' },
      { to: '/video-summarizer', icon: Video,    label: 'Video Özetleyici' },
    ],
  },
  {
    id: 'sosyal',
    label: 'Sosyal',
    icon: Users2,
    items: [
      { to: '/leaderboard', icon: Trophy, label: 'Sıralama' },
      { to: '/friends',     icon: Users,  label: 'Arkadaşlar' },
    ],
  },
];

function getActiveGroupId(pathname) {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      const isExact = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
      if (isExact) return group.id;
    }
  }
  return null;
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { userMode, updateUserMode } = useApp();

  const [openGroup, setOpenGroup] = useState(() => getActiveGroupId(location.pathname));

  useEffect(() => {
    const active = getActiveGroupId(location.pathname);
    if (active) setOpenGroup(active);
  }, [location.pathname]);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'K';

  function toggleGroup(id) {
    setOpenGroup(prev => (prev === id ? null : id));
  }

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
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 relative z-10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <motion.div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          animate={{ filter: ['drop-shadow(0 0 4px #7c3aed66)', 'drop-shadow(0 0 10px #7c3aedaa)', 'drop-shadow(0 0 4px #7c3aed66)'] }}
          transition={{ type: 'spring', stiffness: 300, filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <img src="/logo-white.png" alt="Dash YKS" className="w-full h-full object-contain p-0.5" />
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
              Dash YKS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden relative z-10">
        {NAV_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroup === group.id;
          const hasActive = group.items.some(item =>
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          );

          return (
            <div key={group.id}>
              {/* Group header */}
              <button
                onClick={() => collapsed ? null : toggleGroup(group.id)}
                title={collapsed ? group.label : undefined}
                className={`w-full flex items-center rounded-xl transition-all duration-150 relative group
                  ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5 gap-3'}
                  ${hasActive
                    ? 'text-violet-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                {/* Active / hover bg */}
                {hasActive && (
                  <motion.div
                    layoutId="groupActive"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'rgba(124,58,237,0.10)',
                      boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.18)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-white/[0.03]" />

                {/* Left accent when active */}
                {hasActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-violet-400"
                    style={{ boxShadow: '0 0 8px rgba(124,58,237,0.8)' }}
                  />
                )}

                <GroupIcon size={17} className="relative shrink-0" />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="relative flex-1 text-sm font-semibold text-left whitespace-nowrap"
                    >
                      {group.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={14} className="text-zinc-600" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Dropdown items */}
              <AnimatePresence initial={false}>
                {isOpen && !collapsed && (
                  <motion.div
                    key="dropdown"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="ml-2 pl-4 border-l border-white/[0.06] mt-0.5 mb-1 flex flex-col gap-0.5">
                      {group.items.map(({ to, icon: Icon, label }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={to === '/'}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative group
                            ${isActive
                              ? 'text-violet-300 bg-violet-500/10'
                              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon size={14} className={`shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
                              <span className="whitespace-nowrap">{label}</span>
                              {isActive && (
                                <motion.div
                                  layoutId="itemActive"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-violet-400"
                                  style={{ boxShadow: '0 0 6px rgba(124,58,237,0.7)' }}
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Mode toggle pill */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-3 pb-2 relative z-10"
          >
            <div className="flex rounded-xl overflow-hidden border border-white/7 bg-white/[0.02]">
              {[['yks', '🎯', 'YKS'], ['daily', '⚡', 'Günlük']].map(([m, icon, lbl]) => (
                <button
                  key={m}
                  onClick={() => updateUserMode(m)}
                  className="flex-1 py-1.5 text-[11px] font-semibold transition-all"
                  style={{
                    background: userMode === m ? 'rgba(139,92,246,0.2)' : 'transparent',
                    color: userMode === m ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {icon} {lbl}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
