import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, Activity, FolderKanban, Flame, TrendingUp,
  BookOpen, ClipboardList, Target, AlertCircle, ArrowRight, Zap,
  Brain, Sparkles, ListTodo, Plus } from 'lucide-react';
import { differenceInDays, parseISO, isPast } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { todayStr, formatDate } from '../utils/dateUtils';
import { calcStreak, QUOTES } from '../utils/statsUtils';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';

const QUOTE = QUOTES[new Date().getDay() % QUOTES.length];

/* ── Section card ── */
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function SectionCard({ title, icon: Icon, iconColor = 'text-violet-400', action, actionPath, children }) {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={cardVariants}
      className="relative overflow-hidden rounded-2xl group"
    >
      {/* Glass bg */}
      <div className="absolute inset-0 rounded-2xl"
        style={{ background:'rgba(18,18,22,0.75)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.05)' }}
      />
      {/* Top gradient line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <Icon size={15} className={iconColor} />
            {title}
          </h3>
          {action && (
            <button
              onClick={() => navigate(actionPath)}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors group"
            >
              {action}
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function EmptyState({ text }) {
  return <p className="text-sm text-zinc-600 text-center py-5">{text}</p>;
}

export default function Dashboard() {
  const { tasks, habits, projects, pomodoro, exams, goals, lessons, dailyTodos, addDailyTodo, toggleDailyTodo } = useApp();
  const [newTodo, setNewTodo] = useState('');
  const navigate = useNavigate();
  const today = todayStr();

  const completedToday = useMemo(() => tasks.filter(t => t.completedAt?.startsWith(today)).length, [tasks, today]);
  const pendingTasks   = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);
  const todayTasks     = useMemo(() => tasks.filter(t => t.dueDate === today || (!t.dueDate && !t.completed)), [tasks, today]);

  const habitsToday = useMemo(() => ({
    total: habits.length,
    done: habits.filter(h => h.completions.includes(today)).length,
  }), [habits, today]);

  const topStreak = useMemo(() =>
    habits.length ? Math.max(...habits.map(h => calcStreak(h.completions))) : 0,
    [habits]
  );

  const totalStudyHours = useMemo(() => lessons.reduce((s, l) => s + (l.studyHours || 0), 0), [lessons]);

  const upcomingTasks = useMemo(() =>
    tasks.filter(t => !t.completed && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5),
    [tasks]
  );

  const activeProjects = useMemo(() => projects.filter(p => {
    const total = p.columns.reduce((a, c) => a + c.cards.length, 0);
    const done  = p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;
    return total > 0 && done < total;
  }), [projects]);

  const upcomingExams = useMemo(() =>
    exams.filter(e => !isPast(parseISO(e.date + 'T23:59')))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3),
    [exams]
  );

  const activeGoals = useMemo(() => goals.filter(g => !g.completed).slice(0, 3), [goals]);

  const pomodoroToday = useMemo(() =>
    pomodoro.sessions.filter(s => s.date === today && s.completed).length,
    [pomodoro, today]
  );

  const todayDailyTodos = useMemo(() =>
    (dailyTodos || []).filter(t => t.date === today),
    [dailyTodos, today]
  );

  const handleAddTodo = (e) => {
    e.preventDefault();
    const text = newTodo.trim();
    if (!text) return;
    addDailyTodo(text, today);
    setNewTodo('');
  };

  return (
    <motion.div
      className="p-4 md:p-6 space-y-5 min-h-full"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Quote banner */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.08) 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
        }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="flex items-start gap-3">
          <Zap size={16} className="text-violet-400 shrink-0 mt-0.5" />
          <p className="text-sm text-violet-200/80 italic leading-relaxed">"{QUOTE}"</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={container} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={CheckSquare} label="Bugün tamamlandı" value={completedToday}
          sub={`${pendingTasks} bekliyor`} color="blue" delay={0.05}
          onClick={() => navigate('/tasks')} />
        <StatCard icon={Activity} label="Alışkanlıklar" value={`${habitsToday.done}/${habitsToday.total}`}
          sub="bugün" color="green" delay={0.1}
          onClick={() => navigate('/habits')} />
        <StatCard icon={BookOpen} label="Çalışma Saati" value={totalStudyHours}
          sub={`${lessons.length} ders`} color="violet" delay={0.15}
          onClick={() => navigate('/lessons')} />
        <StatCard icon={Flame} label="En uzun seri" value={topStreak}
          sub="gün üst üste" color="red" delay={0.2}
          onClick={() => navigate('/habits')} />
      </motion.div>

      {/* Hızlı Erişim — 3 ana CTA */}
      <motion.div variants={cardVariants}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: '/daily-todos', icon: ListTodo, label: 'Yapılacaklar', color: 'text-violet-300', bg: 'from-violet-600/20 to-violet-500/10', border: 'border-violet-500/20' },
            { to: '/ai', icon: Sparkles, label: 'AI Merkezi', color: 'text-pink-300', bg: 'from-pink-600/20 to-pink-500/10', border: 'border-pink-500/20' },
            { to: '/yks', icon: Brain, label: 'YKS Merkezi', color: 'text-blue-300', bg: 'from-blue-600/20 to-blue-500/10', border: 'border-blue-500/20' },
          ].map(({ to, icon: Icon, label, color, bg, border }) => (
            <motion.button
              key={to}
              onClick={() => navigate(to)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border bg-gradient-to-b ${bg} ${border} hover:brightness-110 transition-all`}
            >
              <Icon size={20} className={color} />
              <span className="text-xs text-zinc-300 font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Yaklaşan Görevler */}
        <SectionCard title="Yaklaşan Görevler" icon={Clock} iconColor="text-violet-400"
          action="Tümü" actionPath="/tasks">
          {upcomingTasks.length === 0
            ? <EmptyState text="Bekleyen görev yok 🎉" />
            : <ul className="space-y-2">
                {upcomingTasks.map((task, i) => (
                  <motion.li
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 py-1.5 group/item"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
                      task.priority === 'acil' ? 'bg-red-400 shadow-red-400/50' :
                      task.priority === 'yüksek' ? 'bg-orange-400 shadow-orange-400/50' :
                      'bg-zinc-600'}`}
                    />
                    <span className="flex-1 text-sm text-zinc-300 truncate group-hover/item:text-zinc-100 transition-colors">
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className="text-[11px] text-zinc-600 shrink-0 font-mono">
                        {formatDate(task.dueDate, 'dd MMM')}
                      </span>
                    )}
                  </motion.li>
                ))}
              </ul>
          }
        </SectionCard>

        {/* Aktif Projeler */}
        <SectionCard title="Aktif Projeler" icon={FolderKanban} iconColor="text-blue-400"
          action="Tümü" actionPath="/projects">
          {activeProjects.length === 0
            ? <EmptyState text="Aktif proje yok" />
            : <ul className="space-y-3">
                {activeProjects.slice(0, 4).map((p, i) => {
                  const total = p.columns.reduce((a, c) => a + c.cards.length, 0);
                  const done  = p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;
                  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
                  return (
                    <motion.li key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}66` }} />
                        <span className="text-sm text-zinc-200 flex-1 truncate">{p.name}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">{done}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}99)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                        />
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
          }
        </SectionCard>

        {/* Bugünün Alışkanlıkları */}
        <SectionCard title="Bugünün Alışkanlıkları" icon={Activity} iconColor="text-green-400"
          action="Tümü" actionPath="/habits">
          {habits.length === 0
            ? <EmptyState text="Henüz alışkanlık eklenmedi" />
            : <ul className="space-y-2">
                {habits.slice(0, 6).map((h, i) => {
                  const done   = h.completions.includes(today);
                  const streak = calcStreak(h.completions);
                  return (
                    <motion.li key={h.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }} className="flex items-center gap-3 py-0.5">
                      <span className="text-lg w-6 text-center">{h.icon}</span>
                      <span className="flex-1 text-sm text-zinc-300 truncate">{h.name}</span>
                      {streak > 0 && (
                        <span className="text-[11px] text-orange-400 flex items-center gap-1 font-medium">
                          <Flame size={11} />{streak}
                        </span>
                      )}
                      <motion.div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          done ? 'bg-green-500 border-green-400' : 'border-zinc-700'}`}
                        animate={done ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {done && (
                          <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="text-white text-[10px] font-bold"
                          >✓</motion.span>
                        )}
                      </motion.div>
                    </motion.li>
                  );
                })}
              </ul>
          }
        </SectionCard>

        {/* Bugün — Birleşik Görev + Yapılacak Kartı */}
        <SectionCard title="Bugünkü Plan" icon={ListTodo} iconColor="text-violet-400"
          action="Planlama" actionPath="/planlama">
          {/* Quick add */}
          <form onSubmit={handleAddTodo} className="flex gap-2 mb-3">
            <input
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              placeholder="Hızlı yapılacak ekle..."
              className="flex-1 bg-zinc-800/60 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.92 }}
              disabled={!newTodo.trim()}
              className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 disabled:opacity-30 hover:bg-violet-600/30 transition-all"
            >
              <Plus size={13} />
            </motion.button>
          </form>

          {/* Daily todos (today) */}
          {todayDailyTodos.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {todayDailyTodos.slice(0, 4).map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2.5 group/todo"
                >
                  <motion.button
                    onClick={() => toggleDailyTodo(t.id)}
                    whileTap={{ scale: 0.85 }}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      t.completed ? 'bg-violet-500 border-violet-400' : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {t.completed && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white text-[9px] font-bold">✓</motion.span>
                    )}
                  </motion.button>
                  <span className={`text-sm flex-1 truncate ${
                    t.completed ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover/todo:text-zinc-100'
                  }`}>{t.text}</span>
                </motion.li>
              ))}
            </ul>
          )}

          {todayDailyTodos.length === 0 && todayTasks.length === 0 && (
            <EmptyState text="Bugün için plan yok — ekle! 🚀" />
          )}

          {/* Progress bar */}
          {todayDailyTodos.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                <span>{todayDailyTodos.filter(t => t.completed).length}/{todayDailyTodos.length} tamamlandı</span>
                <span className="font-mono">{Math.round((todayDailyTodos.filter(t=>t.completed).length/todayDailyTodos.length)*100)}%</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(todayDailyTodos.filter(t=>t.completed).length/todayDailyTodos.length)*100}%` }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* Yaklaşan Sınavlar */}
        <SectionCard title="Yaklaşan Sınavlar" icon={ClipboardList} iconColor="text-red-400"
          action="Tümü" actionPath="/exams">
          {upcomingExams.length === 0
            ? <EmptyState text="Yaklaşan sınav yok" />
            : <ul className="space-y-2">
                {upcomingExams.map((exam, i) => {
                  const diff = differenceInDays(parseISO(exam.date), new Date());
                  const urgent = diff <= 3;
                  return (
                    <motion.li key={exam.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      className={`flex items-center gap-3 py-1.5 px-3 rounded-xl transition-colors ${
                        urgent ? 'bg-red-500/8 border border-red-500/15' : ''}`}>
                      <AlertCircle size={14} className={urgent ? 'text-red-400 shrink-0' : 'text-zinc-700 shrink-0'} />
                      <span className="flex-1 text-sm text-zinc-200 truncate">{exam.title}</span>
                      <span className={`text-xs shrink-0 font-mono font-medium ${urgent ? 'text-red-400' : 'text-zinc-500'}`}>
                        {diff === 0 ? 'Bugün!' : diff === 1 ? 'Yarın' : `${diff}g`}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
          }
        </SectionCard>

        {/* Aktif Hedefler */}
        <SectionCard title="Aktif Hedefler" icon={Target} iconColor="text-violet-400"
          action="Tümü" actionPath="/goals">
          {activeGoals.length === 0
            ? <EmptyState text="Aktif hedef yok" />
            : <ul className="space-y-3">
                {activeGoals.map((goal, i) => {
                  const total = goal.milestones?.length || 0;
                  const done  = goal.milestones?.filter(m => m.completed).length || 0;
                  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
                  return (
                    <motion.li key={goal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}
                      className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-200 truncate flex-1">{goal.title}</span>
                        <span className="text-[11px] text-violet-400 ml-2 font-mono font-medium">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                        />
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
          }
        </SectionCard>

      </motion.div>
    </motion.div>
  );
}
