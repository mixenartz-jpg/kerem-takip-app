import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  FolderKanban, Activity, Timer, BarChart2, ChevronLeft, ChevronRight,
  BookOpen, ClipboardList, Target
} from 'lucide-react';
import { useState } from 'react';

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

  return (
    <aside className={`flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'} shrink-0`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-zinc-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
          <span className="text-white font-bold text-sm">GT</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-zinc-100 text-sm">Günlük Takip</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative
                    ${isActive
                      ? 'bg-violet-600/20 text-violet-400 border-l-2 border-violet-500'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border-l-2 border-transparent'
                    }
                    ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-center py-3 mx-2 mb-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
