import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, LayoutDashboard, CalendarDays, GraduationCap, Sparkles, Users2,
  CheckSquare, StickyNote, FolderKanban, Repeat2, Timer,
  BookOpen, CalendarCheck, Target, Zap, BarChart2,
  ListTodo, Video, Bell, Trophy, UserPlus, Star, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePremium } from '../../context/PremiumContext';
import { useApp } from '../../context/AppContext';

// Groups for YKS/student mode
const NAV_GROUPS_YKS = [
  {
    label: 'Ana',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/daily-todos', icon: ListTodo, label: 'Günlük Yapılacaklar' },
      { to: '/reminders', icon: Bell, label: 'Hatırlatmalar' },
      { to: '/stats', icon: BarChart2, label: 'İstatistikler', premium: 'istatistikler' },
    ],
  },
  {
    label: 'Planlama',
    items: [
      { to: '/planlama', icon: CalendarDays, label: 'Planlama Hub' },
      { to: '/tasks', icon: CheckSquare, label: 'Görevler' },
      { to: '/calendar', icon: CalendarCheck, label: 'Takvim' },
      { to: '/projects', icon: FolderKanban, label: 'Projeler' },
      { to: '/goals', icon: Target, label: 'Hedefler' },
      { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
    ],
  },
  {
    label: 'Akademi',
    items: [
      { to: '/akademi', icon: GraduationCap, label: 'Akademi Hub' },
      { to: '/lessons', icon: BookOpen, label: 'Dersler' },
      { to: '/exams', icon: CalendarCheck, label: 'Sınav Takvimi' },
      { to: '/yks', icon: Zap, label: 'YKS Merkezi' },
      { to: '/hata-defteri', icon: BookOpen, label: 'Hata Defteri', premium: 'hata_defteri' },
      { to: '/habits', icon: Repeat2, label: 'Alışkanlıklar' },
    ],
  },
  {
    label: 'AI & Sosyal',
    items: [
      { to: '/ai', icon: Sparkles, label: 'AI Merkezi', ai: true, premium: 'ai' },
      { to: '/video-summarizer', icon: Video, label: 'Video Özetleyici', ai: true },
      { to: '/sosyal', icon: Users2, label: 'Sosyal Hub' },
      { to: '/friends', icon: UserPlus, label: 'Arkadaşlar' },
      { to: '/leaderboard', icon: Trophy, label: 'Sıralama' },
      { to: '/notes', icon: StickyNote, label: 'Notlar' },
    ],
  },
];

// Simpler groups for daily/non-student mode — no YKS/Akademi clutter
const NAV_GROUPS_DAILY = [
  {
    label: 'Ana',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/daily-todos', icon: ListTodo, label: 'Günlük Yapılacaklar' },
      { to: '/reminders', icon: Bell, label: 'Hatırlatmalar' },
      { to: '/stats', icon: BarChart2, label: 'İstatistikler', premium: 'istatistikler' },
    ],
  },
  {
    label: 'Planlama',
    items: [
      { to: '/planlama', icon: CalendarDays, label: 'Planlama Hub' },
      { to: '/tasks', icon: CheckSquare, label: 'Görevler' },
      { to: '/calendar', icon: CalendarCheck, label: 'Takvim' },
      { to: '/projects', icon: FolderKanban, label: 'Projeler' },
      { to: '/goals', icon: Target, label: 'Hedefler' },
      { to: '/habits', icon: Repeat2, label: 'Alışkanlıklar' },
      { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
    ],
  },
  {
    label: 'AI & Sosyal',
    items: [
      { to: '/ai', icon: Sparkles, label: 'AI Merkezi', ai: true, premium: 'ai' },
      { to: '/video-summarizer', icon: Video, label: 'Video Özetleyici', ai: true },
      { to: '/sosyal', icon: Users2, label: 'Sosyal Hub' },
      { to: '/friends', icon: UserPlus, label: 'Arkadaşlar' },
      { to: '/leaderboard', icon: Trophy, label: 'Sıralama' },
      { to: '/notes', icon: StickyNote, label: 'Notlar' },
    ],
  },
];

function NavItem({ to, icon: Icon, label, end, ai, premium, onClick }) {
  const { canAccess } = usePremium();
  const locked = premium && !canAccess(premium);

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className="outline-none"
    >
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all relative ${
            isActive
              ? 'bg-violet-600/20 text-violet-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
          }`}
        >
          <Icon
            size={15}
            className={
              ai
                ? isActive ? 'text-pink-300' : 'text-violet-400'
                : isActive ? 'text-violet-300' : 'text-zinc-500'
            }
          />
          <span className="text-sm flex-1">{label}</span>
          {locked && (
            <Star size={11} className="text-violet-500 opacity-70 shrink-0" />
          )}
          {isActive && (
            <motion.div
              layoutId="drawerActivePill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-violet-500"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
        </motion.div>
      )}
    </NavLink>
  );
}

export default function DrawerMenu({ open, onClose }) {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { userMode } = useApp();

  const NAV_GROUPS = userMode === 'daily' ? NAV_GROUPS_DAILY : NAV_GROUPS_YKS;

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'K';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed left-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 280,
              background: 'rgba(10,10,13,0.98)',
              backdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Top ambient glow */}
            <div
              className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)' }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-200 truncate">
                    {user?.displayName || 'Kullanıcı'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isPremium && (
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-violet-400" />
                        <span className="text-[10px] text-violet-400 font-medium">Premium</span>
                      </div>
                    )}
                    {/* Mode badge */}
                    <div className="flex items-center gap-1">
                      {userMode === 'daily'
                        ? <Sun size={10} className="text-amber-400" />
                        : <Zap size={10} className="text-blue-400" />
                      }
                      <span className={`text-[10px] font-medium ${userMode === 'daily' ? 'text-amber-400' : 'text-blue-400'}`}>
                        {userMode === 'daily' ? 'Günlük Mod' : 'YKS Modu'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Nav groups */}
            <div className="flex-1 overflow-y-auto py-3 px-3 relative z-10 flex flex-col gap-5">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-3 mb-1">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map(item => (
                      <NavItem key={item.to} {...item} onClick={onClose} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom version tag */}
            <div className="relative z-10 px-4 py-3 border-t border-white/5">
              <p className="text-[10px] text-zinc-700">Günlük Takip</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
