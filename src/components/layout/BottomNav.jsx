import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  FolderKanban, Activity, Timer, BarChart2,
  BookOpen, ClipboardList, Target, MoreHorizontal, Brain,
  Sparkles, ListTodo, Youtube, Trophy, Bell,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const PRIMARY_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Ana Sayfa' },
  { to: '/tasks', icon: CheckSquare, label: 'Görevler' },
  { to: '/habits', icon: Activity, label: 'Alışkanlık' },
  { to: '/ai', icon: Sparkles, label: 'AI' },
];

const MORE_NAV = [
  { to: '/daily-todos', icon: ListTodo, label: 'Yapılacaklar' },
  { to: '/calendar', icon: Calendar, label: 'Takvim' },
  { to: '/notes', icon: FileText, label: 'Notlar' },
  { to: '/projects', icon: FolderKanban, label: 'Projeler' },
  { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { to: '/lessons', icon: BookOpen, label: 'Dersler' },
  { to: '/exams', icon: ClipboardList, label: 'Sınavlar' },
  { to: '/yks', icon: Brain, label: 'YKS' },
  { to: '/goals', icon: Target, label: 'Hedefler' },
  { to: '/video-summarizer', icon: Youtube, label: 'Video Özet' },
  { to: '/leaderboard', icon: Trophy, label: 'Sıralama' },
  { to: '/reminders', icon: Bell, label: 'Hatırlatma' },
  { to: '/stats', icon: BarChart2, label: 'İstatistik' },
];

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { tasks } = useApp();
  const pendingCount = (tasks || []).filter(t => !t.completed).length;

  return (
    <>
      {/* More drawer backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More drawer */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed bottom-16 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 rounded-t-2xl px-4 py-4"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {MORE_NAV.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-600/20 text-violet-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="text-[10px] text-center leading-tight">{label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 flex items-center">
        {PRIMARY_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -inset-1.5 rounded-lg bg-violet-600/20"
                    />
                  )}
                  <Icon size={20} className="relative" />
                  {to === '/tasks' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 bg-violet-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(o => !o)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
            moreOpen ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">Daha Fazla</span>
        </button>
      </nav>
    </>
  );
}
