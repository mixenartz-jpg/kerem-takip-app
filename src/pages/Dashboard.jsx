import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, Activity, FolderKanban, Flame, TrendingUp,
  BookOpen, ClipboardList, Target, AlertCircle, ArrowRight, Zap,
  Brain, Sparkles, ListTodo, Timer, BarChart2, Youtube, Trophy } from 'lucide-react';
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
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
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
  const { tasks, habits, projects, pomodoro, exams, goals, lessons } = useApp();
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

      {/* Hızlı Erişim */}
      <motion.div variants={cardVariants}>
        <h3 className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-2.5 px-0.5">Hızlı Erişim</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { to: '/daily-todos', icon: ListTodo, label: 'Yapılacaklar', color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { to: '/ai', icon: Sparkles, label: 'AI Merkezi', color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { to: '/yks', icon: Brain, label: 'YKS', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { to: '/pomodoro', icon: Timer, label: 'Pomodoro', color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { to: '/leaderboard', icon: Trophy, label: 'Sıralama', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { to: '/stats', icon: BarChart2, label: 'İstatistik', color: 'text-green-400', bg: 'bg-green-500/10' },
          ].map(({ to, icon: Icon, label, color, bg }) => (
            <motion.button
              key={to}
              onClick={() => navigate(to)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium leading-tight text-center">{label}</span>
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

        {/* Bugünün Görevleri */}
        <SectionCard title="Bugünün Görevleri" icon={TrendingUp} iconColor="text-blue-400"
          action="Tümü" actionPath="/tasks">
          {todayTasks.length === 0
            ? <EmptyState text="Bugün için görev yok 🎉" />
            : <>
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
                    <span>İlerleme</span>
                    <span className="font-mono">{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(todayTasks.filter(t=>t.completed).length / todayTasks.length) * 100}%` }}
                      transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {todayTasks.slice(0, 5).map((t, i) => (
                    <motion.li key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        t.completed ? 'bg-violet-500 border-violet-400' : 'border-zinc-700'}`}>
                        {t.completed && <span className="text-white text-[9px] font-bold">✓</span>}
                      </div>
                      <span className={`text-sm truncate ${t.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                        {t.title}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </>
          }
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
