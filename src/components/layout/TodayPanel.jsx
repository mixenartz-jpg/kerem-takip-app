import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, CheckCircle2, Circle, Sparkles,
  Zap, BookOpen, Send, Trash2,
} from 'lucide-react';

const SUBJECT_COLORS = {
  mat: '#a78bfa', matematik: '#a78bfa',
  türkçe: '#60a5fa', turkce: '#60a5fa',
  fizik: '#fb923c',
  kimya: '#34d399',
  biyoloji: '#10b981', bio: '#10b981',
  sosyal: '#fbbf24',
  fen: '#67e8f9',
  edebiyat: '#f472b6',
  coğrafya: '#2dd4bf', cografya: '#2dd4bf',
  tarih: '#f87171',
  ingilizce: '#818cf8', ing: '#818cf8',
  tyt: '#94a3b8', ayt: '#94a3b8',
};
const getSubjectColor = (s) => SUBJECT_COLORS[s?.toLowerCase().trim()] ?? '#71717a';
import { useApp } from '../../context/AppContext';
import { todayStr } from '../../utils/dateUtils';

const TODAY = todayStr();

function ProgressRing({ value, max, size = 36, stroke = 3, color = '#8b5cf6' }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </svg>
  );
}

function GunlukContent({ onNavClose }) {
  const { state, toggleTask, addTask, toggleHabitToday } = useApp();
  const [text, setText] = useState('');

  const todayTasks = (state.tasks || []).filter(t => t.dueDate === TODAY);
  const completedCount = todayTasks.filter(t => t.completed).length;
  const shownTasks = todayTasks.slice(0, 4);

  const dailyHabits = (state.habits || [])
    .filter(h => !h.frequency || h.frequency === 'daily')
    .slice(0, 6);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTask({ title: text.trim(), dueDate: TODAY });
    setText('');
  };

  return (
    <div className="p-3 space-y-3">
      {/* Task progress */}
      <div className="flex items-center gap-3">
        <ProgressRing value={completedCount} max={todayTasks.length || 1} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-200">
            {todayTasks.length === 0
              ? 'Henüz görev yok'
              : `${completedCount}/${todayTasks.length} tamamlandı`}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Bugünkü görevler</p>
        </div>
      </div>

      {/* Task list */}
      {shownTasks.length > 0 && (
        <div className="space-y-1">
          {shownTasks.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-2 text-left group"
            >
              <div className="shrink-0">
                {task.completed
                  ? <CheckCircle2 size={13} className="text-violet-400" />
                  : <Circle size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
              </div>
              <span className={`text-[12px] truncate transition-colors ${
                task.completed ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover:text-zinc-100'
              }`}>
                {task.title}
              </span>
            </button>
          ))}
          {todayTasks.length > 4 && (
            <p className="text-[10px] text-zinc-600 pl-[19px]">
              +{todayTasks.length - 4} daha...
            </p>
          )}
        </div>
      )}

      {/* Habits dots */}
      {dailyHabits.length > 0 && (
        <div>
          <p className="text-[10px] text-zinc-600 mb-1.5 uppercase tracking-wide">Alışkanlıklar</p>
          <div className="flex gap-2 flex-wrap">
            {dailyHabits.map(habit => {
              const done = (habit.completions || []).includes(TODAY);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabitToday(habit.id)}
                  title={habit.name}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all text-[11px]"
                  style={{
                    background: done ? `${habit.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${done ? habit.color + '44' : 'rgba(255,255,255,0.08)'}`,
                    color: done ? habit.color : '#71717a',
                  }}
                >
                  <span>{habit.icon}</span>
                  <span className="hidden sm:inline max-w-[60px] truncate">{habit.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick add */}
      <form onSubmit={handleAdd} className="flex items-center gap-1.5">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Bugüne görev ekle..."
          className="flex-1 text-[12px] bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-300 placeholder-zinc-600 outline-none focus:border-violet-500/40 transition-colors"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.92 }}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
          style={{
            background: text.trim() ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <Send size={11} className={text.trim() ? 'text-violet-300' : 'text-zinc-600'} />
        </motion.button>
      </form>
    </div>
  );
}

function AkademiContent({ onNavClose }) {
  const { state, addAkademiTodo, toggleAkademiTodo, deleteAkademiTodo } = useApp();
  const navigate = useNavigate();
  const [study, setStudy] = useState('');

  const yksDate = state.yks?.examDate ? new Date(state.yks.examDate) : null;
  const daysToYKS = yksDate
    ? Math.max(0, Math.ceil((yksDate - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const todayTasks = (state.tasks || []).filter(t => t.dueDate === TODAY);
  const completedCount = todayTasks.filter(t => t.completed).length;

  const todayPomodoroSessions = (state.pomodoro?.sessions || []).filter(
    s => s.completedAt?.startsWith(TODAY)
  ).length;

  const todayStudy = (state.akademiTodos || []).filter(t => t.date === TODAY);
  const studyDone = todayStudy.filter(t => t.completed).length;

  const handleAddStudy = (e) => {
    e.preventDefault();
    if (!study.trim()) return;
    addAkademiTodo(study.trim());
    setStudy('');
  };

  return (
    <div className="p-3 space-y-3">
      {/* YKS countdown + stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {daysToYKS !== null && (
          <div className="col-span-1 rounded-lg p-2 text-center"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <p className="text-lg font-bold text-emerald-400 leading-none">{daysToYKS}</p>
            <p className="text-[9px] text-emerald-600 mt-0.5 uppercase tracking-wide">gün kaldı</p>
          </div>
        )}
        <div className="rounded-lg p-2 text-center"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <p className="text-lg font-bold text-violet-400 leading-none">{todayPomodoroSessions}</p>
          <p className="text-[9px] text-violet-600 mt-0.5 uppercase tracking-wide">pomodoro</p>
        </div>
        <div className="rounded-lg p-2 text-center"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p className="text-lg font-bold text-blue-400 leading-none">{completedCount}/{todayTasks.length || 0}</p>
          <p className="text-[9px] text-blue-600 mt-0.5 uppercase tracking-wide">görev</p>
        </div>
      </div>

      {/* Quick nav items */}
      <div className="space-y-1">
        {[
          { label: 'AI Planlayıcı', icon: Sparkles, color: '#a78bfa', to: '/planner' },
          { label: 'YKS Merkezi', icon: Zap, color: '#34d399', to: '/yks' },
          { label: 'Çalışma Kaynakları', icon: BookOpen, color: '#60a5fa', to: '/kaynaklar' },
        ].map(({ label, icon: Icon, color, to }) => (
          <button
            key={to}
            onClick={() => { navigate(to); onNavClose?.(); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] transition-all hover:bg-white/[0.04] group text-left"
          >
            <Icon size={13} style={{ color }} className="shrink-0" />
            <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
          </button>
        ))}
      </div>

      {/* Bugünkü çalışma planı */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Bugünkü çalışma</p>
          {todayStudy.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {todayStudy.map(t => (
                  <div
                    key={t.id}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{ background: t.completed ? '#34d399' : 'rgba(255,255,255,0.1)' }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-zinc-600">{studyDone}/{todayStudy.length}</span>
            </div>
          )}
        </div>

        {todayStudy.length === 0 && (
          <p className="text-[11px] text-zinc-600 text-center py-1.5 italic">
            Henüz konu eklenmedi
          </p>
        )}

        <AnimatePresence initial={false}>
          {todayStudy.map(todo => {
            const parts = todo.text.split(' - ');
            const subject = parts.length > 1 ? parts[0] : null;
            const topic = parts.length > 1 ? parts.slice(1).join(' - ') : todo.text;
            const color = getSubjectColor(subject);
            return (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2 group py-0.5 overflow-hidden"
              >
                <button onClick={() => toggleAkademiTodo(todo.id)} className="shrink-0">
                  {todo.completed
                    ? <CheckCircle2 size={13} style={{ color: '#34d399' }} />
                    : <Circle size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
                </button>
                {subject && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wide"
                    style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}
                  >
                    {subject}
                  </span>
                )}
                <span className={`text-[12px] flex-1 truncate transition-colors ${
                  todo.completed ? 'line-through text-zinc-600' : 'text-zinc-300'
                }`}>
                  {topic}
                </span>
                <button
                  onClick={() => deleteAkademiTodo(todo.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                >
                  <Trash2 size={11} className="text-zinc-600 hover:text-red-400 transition-colors" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <form onSubmit={handleAddStudy} className="flex items-center gap-1.5 mt-2">
          <input
            value={study}
            onChange={e => setStudy(e.target.value)}
            placeholder="Ders - Konu (ör: Mat - Türev)"
            className="flex-1 text-[12px] bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-300 placeholder-zinc-600 outline-none focus:border-emerald-500/40 transition-colors"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.92 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
            style={{
              background: study.trim() ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(52,211,153,0.2)',
            }}
          >
            <Send size={11} className={study.trim() ? 'text-emerald-400' : 'text-zinc-600'} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default function TodayPanel({ onNavClose }) {
  const { activeWorkspace } = useApp();
  const [open, setOpen] = useState(true);

  const todayDisplay = format(new Date(), 'EEEE, d MMMM', { locale: tr });
  const isAkademi = activeWorkspace === 'akademi';

  return (
    <div className="mb-1">
      {/* Section header */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[11px] font-semibold uppercase tracking-widest ${
            isAkademi ? 'text-emerald-400' : 'text-violet-400'
          }`}>
            Bugün
          </span>
          <span className="text-[10px] text-zinc-500 font-normal normal-case tracking-normal truncate">
            {todayDisplay}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} className="text-zinc-600 shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mx-2 mb-2 rounded-xl overflow-hidden"
              style={{
                background: isAkademi
                  ? 'rgba(52,211,153,0.05)'
                  : 'rgba(124,58,237,0.06)',
                border: isAkademi
                  ? '1px solid rgba(52,211,153,0.12)'
                  : '1px solid rgba(124,58,237,0.12)',
              }}
            >
              {isAkademi
                ? <AkademiContent onNavClose={onNavClose} />
                : <GunlukContent onNavClose={onNavClose} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
