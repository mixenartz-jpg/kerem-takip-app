import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ListTodo, CheckSquare, Calendar, FileText,
  FolderKanban, Activity, Timer, Bell, ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr } from '../utils/dateUtils';

/* ── Animasyon varyantları ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};
const headerVariant = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

/* ── BentoCard bileşeni ── */
function BentoCard({ to, title, icon: Icon, color, gradient, span, subtitle, onClick, hero }) {
  return (
    <motion.button
      variants={cardVariant}
      onClick={() => onClick(to)}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className={`${span || ''} relative overflow-hidden rounded-3xl text-left w-full group`}
      style={{
        background: 'rgba(16,16,20,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.055)',
        minHeight: hero ? 200 : 168,
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}22, ${gradient[1]}0d)` }}
      />
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 25% 20%, ${color}1a, transparent 65%)` }}
      />
      {/* Top accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }}
      />

      {/* Content */}
      <div className="relative z-10 p-5 flex flex-col h-full" style={{ minHeight: hero ? 200 : 168 }}>
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}2e` }}
        >
          <Icon size={20} style={{ color }} />
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-100 text-sm leading-snug mb-1.5">{title}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">{subtitle}</p>
        </div>

        {/* Arrow */}
        <div className="flex justify-end mt-3">
          <motion.div
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: `${color}14` }}
            whileHover={{ scale: 1.1 }}
          >
            <ArrowUpRight size={14} style={{ color }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Kart tanımlamaları ── */
function usePlanningCards(tasks, habits, projects, pomodoro, notes, reminders, dailyTodos) {
  const today = todayStr();
  return useMemo(() => [
    {
      id: 'daily-todos',
      to: '/daily-todos',
      title: 'Günlük Yapılacaklar',
      icon: ListTodo,
      color: '#7c3aed',
      gradient: ['#7c3aed', '#a855f7'],
      span: 'md:col-span-2',
      hero: true,
      subtitle: (() => {
        const todayItems = (dailyTodos || []).filter(t => t.date === today);
        const done = todayItems.filter(t => t.completed).length;
        return todayItems.length > 0
          ? `${done}/${todayItems.length} bugün tamamlandı`
          : 'Bugünün görev listeni oluştur';
      })(),
    },
    {
      id: 'reminders',
      to: '/reminders',
      title: 'Hatırlatmalar',
      icon: Bell,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fbbf24'],
      span: '',
      subtitle: (() => {
        const active = (reminders || []).length;
        return `${active} hatırlatma var`;
      })(),
    },
    {
      id: 'tasks',
      to: '/tasks',
      title: 'Görevler',
      icon: CheckSquare,
      color: '#3b82f6',
      gradient: ['#3b82f6', '#06b6d4'],
      span: '',
      subtitle: (() => {
        const pending = (tasks || []).filter(t => !t.completed).length;
        return `${pending} bekleyen görev`;
      })(),
    },
    {
      id: 'calendar',
      to: '/calendar',
      title: 'Takvim',
      icon: Calendar,
      color: '#06b6d4',
      gradient: ['#06b6d4', '#0ea5e9'],
      span: '',
      subtitle: 'Günlük ve haftalık planlar',
    },
    {
      id: 'notes',
      to: '/notes',
      title: 'Notlar',
      icon: FileText,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fb923c'],
      span: '',
      subtitle: (() => {
        const count = (notes || []).length;
        return count > 0 ? `${count} not kayıtlı` : 'Düşüncelerini yaz';
      })(),
    },
    {
      id: 'habits',
      to: '/habits',
      title: 'Alışkanlıklar',
      icon: Activity,
      color: '#22c55e',
      gradient: ['#22c55e', '#10b981'],
      span: '',
      subtitle: (() => {
        const total = (habits || []).length;
        const done = (habits || []).filter(h => h.completions?.includes(today)).length;
        return total > 0 ? `${done}/${total} bugün tamamlandı` : 'Alışkanlık oluştur';
      })(),
    },
    {
      id: 'projects',
      to: '/projects',
      title: 'Projeler',
      icon: FolderKanban,
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#a855f7'],
      span: '',
      subtitle: (() => {
        const active = (projects || []).filter(p => {
          const total = p.columns.reduce((a, c) => a + c.cards.length, 0);
          const done = p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;
          return total > 0 && done < total;
        }).length;
        return `${active} aktif proje`;
      })(),
    },
    {
      id: 'pomodoro',
      to: '/pomodoro',
      title: 'Pomodoro',
      icon: Timer,
      color: '#ef4444',
      gradient: ['#ef4444', '#f97316'],
      span: 'md:col-span-2',
      subtitle: (() => {
        const count = (pomodoro?.sessions || []).filter(s => s.date === today && s.completed).length;
        return count > 0 ? `${count} seans bugün tamamlandı` : 'Odaklanma seansı başlat';
      })(),
    },
  ], [tasks, habits, projects, pomodoro, notes, reminders, dailyTodos, today]);
}

/* ── Ana sayfa bileşeni ── */
export default function PlanlamaHub() {
  const { tasks, habits, projects, pomodoro, notes, reminders, dailyTodos } = useApp();
  const navigate = useNavigate();
  const cards = usePlanningCards(tasks, habits, projects, pomodoro, notes, reminders, dailyTodos);

  return (
    <motion.div
      className="p-5 md:p-8 min-h-full"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Sayfa başlığı */}
      <motion.div variants={headerVariant} className="mb-8">
        <div className="flex items-center gap-3.5 mb-2">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.15))',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            <Calendar size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 leading-tight">Planlama</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Günlük rutinlerinizi ve projelerinizi yönetin</p>
          </div>
        </div>
      </motion.div>

      {/* Bento grid */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        style={{ gridAutoRows: '168px' }}
      >
        {cards.map(card => (
          <BentoCard
            key={card.id}
            {...card}
            onClick={navigate}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
