import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, CheckSquare, FileText, FolderKanban, Activity, X,
  LayoutDashboard, Calendar, Timer, BarChart2, BookOpen, ClipboardList,
  Brain, Sparkles, Target, ListTodo, Youtube, Trophy, Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGES = [
  { to: '/',                label: 'Dashboard',           icon: LayoutDashboard },
  { to: '/tasks',           label: 'Görevler',            icon: CheckSquare },
  { to: '/daily-todos',     label: 'Günlük Yapılacaklar', icon: ListTodo },
  { to: '/calendar',        label: 'Takvim',              icon: Calendar },
  { to: '/notes',           label: 'Notlar',              icon: FileText },
  { to: '/projects',        label: 'Projeler',            icon: FolderKanban },
  { to: '/habits',          label: 'Alışkanlıklar',       icon: Activity },
  { to: '/pomodoro',        label: 'Pomodoro',            icon: Timer },
  { to: '/lessons',         label: 'Dersler',             icon: BookOpen },
  { to: '/exams',           label: 'Sınav Takvimi',       icon: ClipboardList },
  { to: '/yks',             label: 'YKS Merkezi',         icon: Brain },
  { to: '/ai',              label: 'AI Merkezi',          icon: Sparkles },
  { to: '/goals',           label: 'Hedefler',            icon: Target },
  { to: '/video-summarizer',label: 'Video Özetleyici',    icon: Youtube },
  { to: '/leaderboard',     label: 'Sıralama',            icon: Trophy },
  { to: '/reminders',       label: 'Hatırlatmalar',       icon: Bell },
  { to: '/stats',           label: 'İstatistikler',       icon: BarChart2 },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { tasks, notes, projects, habits } = useApp();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const q = query.toLowerCase();

  const results = [
    ...tasks.filter(t => t.title?.toLowerCase().includes(q)).slice(0, 3).map(t => ({
      icon: <CheckSquare size={14} className="text-blue-400" />,
      label: t.title,
      sub: 'Görev',
      action: () => { navigate('/tasks'); onClose(); }
    })),
    ...notes.filter(n => (n.title + n.content)?.toLowerCase().includes(q)).slice(0, 3).map(n => ({
      icon: <FileText size={14} className="text-yellow-400" />,
      label: n.title || '(Başlıksız not)',
      sub: 'Not',
      action: () => { navigate('/notes'); onClose(); }
    })),
    ...projects.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 2).map(p => ({
      icon: <FolderKanban size={14} className="text-violet-400" />,
      label: p.name,
      sub: 'Proje',
      action: () => { navigate('/projects'); onClose(); }
    })),
    ...habits.filter(h => h.name?.toLowerCase().includes(q)).slice(0, 2).map(h => ({
      icon: <Activity size={14} className="text-green-400" />,
      label: h.name,
      sub: 'Alışkanlık',
      action: () => { navigate('/habits'); onClose(); }
    })),
  ].filter(() => q.length > 0).slice(0, 8);

  const filteredPages = q.length > 0
    ? PAGES.filter(p => p.label.toLowerCase().includes(q))
    : PAGES;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-3" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search size={16} className="text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Sayfa, görev, not, proje ara..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-widest text-zinc-600 uppercase">İçerik</p>
              <ul className="pb-1">
                {results.map((r, i) => (
                  <li key={i}>
                    <button
                      onClick={r.action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 text-left transition-colors"
                    >
                      {r.icon}
                      <span className="flex-1 text-sm text-zinc-200 truncate">{r.label}</span>
                      <span className="text-xs text-zinc-500">{r.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {filteredPages.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Sayfalar</p>
              <ul className="pb-2">
                {filteredPages.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <button
                      onClick={() => { navigate(to); onClose(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 text-left transition-colors"
                    >
                      <Icon size={14} className="text-violet-400 shrink-0" />
                      <span className="flex-1 text-sm text-zinc-300">{label}</span>
                      <span className="text-xs text-zinc-600">↵</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q.length > 0 && results.length === 0 && filteredPages.length === 0 && (
            <div className="py-8 text-center text-sm text-zinc-500">Sonuç bulunamadı</div>
          )}
        </div>
      </div>
    </div>
  );
}
