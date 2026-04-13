import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, CheckSquare, Activity, Timer, Bell,
  Target, FolderKanban, ArrowUpRight, Flame, CheckCircle2,
  Circle, Plus, Trash2, ListTodo,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr } from '../utils/dateUtils';
import { addDays, format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { calcStreak } from '../utils/statsUtils';

/* ── Animation variants ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

/* ── Tab config ── */
const TABS = [
  { id: 'today', label: 'Bugün', icon: Clock },
  { id: 'week',  label: 'Hafta', icon: Calendar },
  { id: 'month', label: 'Ay',    icon: Target },
];

/* ── Small reusable card wrapper ── */
function Card({ children, className = '' }) {
  return (
    <motion.div
      variants={item}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: 'rgba(16,16,20,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.055)',
      }}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   TAB: BUGÜN
   ════════════════════════════════════════ */
function TodayTab() {
  const { habits, tasks, dailyTodos, pomodoro, addDailyTodo, toggleDailyTodo, deleteDailyTodo, toggleTask, toggleHabitToday } = useApp();
  const today = todayStr();
  const navigate = useNavigate();
  const [newTodo, setNewTodo] = useState('');

  // Daily todos for today
  const todayTodos = useMemo(() => (dailyTodos || []).filter(t => t.date === today), [dailyTodos, today]);
  const pendingTodos = todayTodos.filter(t => !t.completed);
  const doneTodos = todayTodos.filter(t => t.completed);
  const pct = todayTodos.length > 0 ? Math.round((doneTodos.length / todayTodos.length) * 100) : 0;

  // Tasks due today
  const todayTasks = useMemo(() =>
    tasks.filter(t => !t.completed && (t.dueDate === today || !t.dueDate)).slice(0, 5),
    [tasks, today]
  );

  // Habits
  const todayHabits = habits;
  const doneHabits = todayHabits.filter(h => h.completions?.includes(today)).length;

  // Pomodoro today
  const pomSessions = (pomodoro?.sessions || []).filter(s => s.date === today && s.completed).length;

  const handleAddTodo = (e) => {
    e.preventDefault();
    const t = newTodo.trim();
    if (!t) return;
    addDailyTodo(t, today);
    setNewTodo('');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">

      {/* Progress ring + summary */}
      <Card>
        <div className="p-5 flex items-center gap-5">
          {/* Circular progress */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="4.5" />
              <circle
                cx="26" cy="26" r="22" fill="none"
                stroke={pct === 100 ? '#22c55e' : '#7c3aed'}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - pct / 100)}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-zinc-100">{pct}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-zinc-100">Bugün</h2>
            <p className="text-xs text-zinc-500 mt-0.5 capitalize">
              {format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}
            </p>
            <div className="flex flex-wrap gap-3 mt-2.5">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <CheckSquare size={12} className="text-violet-400" />
                {doneTodos.length}/{todayTodos.length} yapılacak
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Activity size={12} className="text-green-400" />
                {doneHabits}/{todayHabits.length} alışkanlık
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Timer size={12} className="text-red-400" />
                {pomSessions} pomodoro
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Günlük yapılacaklar — inline editable */}
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <ListTodo size={14} className="text-violet-400" /> Yapılacaklar
            </h3>
            <button
              onClick={() => navigate('/daily-todos')}
              className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
            >
              Tümü <ArrowUpRight size={11} />
            </button>
          </div>

          {/* Add form */}
          <form onSubmit={handleAddTodo} className="flex gap-2 mb-3">
            <input
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              placeholder="Yeni madde ekle..."
              className="flex-1 bg-zinc-900/80 border border-zinc-800 focus:border-violet-500/50 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.9 }}
              disabled={!newTodo.trim()}
              className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all"
            >
              <Plus size={15} />
            </motion.button>
          </form>

          {/* Pending todos */}
          <AnimatePresence>
            {pendingTodos.map(todo => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16, scale: 0.95 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-violet-500/25 mb-1.5 group transition-all"
              >
                <button onClick={() => toggleDailyTodo(todo.id)} className="shrink-0">
                  <Circle size={17} className="text-zinc-600 hover:text-violet-400 transition-colors" />
                </button>
                <span className="flex-1 text-sm text-zinc-200">{todo.text}</span>
                <button
                  onClick={() => deleteDailyTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-400 rounded-lg transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Done todos */}
          {doneTodos.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5">Tamamlandı ({doneTodos.length})</p>
              <AnimatePresence>
                {doneTodos.map(todo => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1 group"
                  >
                    <button onClick={() => toggleDailyTodo(todo.id)}>
                      <CheckCircle2 size={17} className="text-violet-500 shrink-0" />
                    </button>
                    <span className="flex-1 text-sm text-zinc-600 line-through">{todo.text}</span>
                    <button
                      onClick={() => deleteDailyTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {todayTodos.length === 0 && (
            <p className="text-sm text-zinc-600 text-center py-4">Bugün için yapılacak yok. Ekle! 🚀</p>
          )}
        </div>
      </Card>

      {/* Bugünün Alışkanlıkları */}
      {todayHabits.length > 0 && (
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Activity size={14} className="text-green-400" /> Alışkanlıklar
              </h3>
              <button
                onClick={() => navigate('/habits')}
                className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
              >
                Tümü <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {todayHabits.map(h => {
                const done = h.completions?.includes(today);
                const streak = calcStreak(h.completions || []);
                return (
                  <motion.div
                    key={h.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      done
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => toggleHabitToday(h.id)}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-base">{h.icon}</span>
                    <span className={`flex-1 text-sm ${done ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                      {h.name}
                    </span>
                    {streak > 0 && (
                      <span className="text-[11px] text-orange-400 flex items-center gap-1">
                        <Flame size={11} />{streak}
                      </span>
                    )}
                    <motion.div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        done ? 'bg-green-500 border-green-400' : 'border-zinc-700'
                      }`}
                      animate={done ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {done && <span className="text-white text-[9px] font-bold">✓</span>}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Bugünün Görevleri */}
      {todayTasks.length > 0 && (
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <CheckSquare size={14} className="text-blue-400" /> Görevler
              </h3>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
              >
                Tümü <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {todayTasks.map(t => (
                <motion.div
                  key={t.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all"
                  onClick={() => toggleTask(t.id)}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-4 h-4 rounded border-2 border-zinc-700 hover:border-blue-400 flex items-center justify-center shrink-0 transition-all" />
                  <span className="flex-1 text-sm text-zinc-300 truncate">{t.title}</span>
                  {t.dueDate && <span className="text-[11px] text-zinc-600 font-mono shrink-0">{format(parseISO(t.dueDate), 'd MMM')}</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Pomodoro CTA */}
      <Card>
        <motion.button
          className="w-full p-5 flex items-center gap-4 text-left group"
          onClick={() => navigate('/pomodoro')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Timer size={22} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Pomodoro Başlat</p>
            <p className="text-xs text-zinc-500 mt-0.5">{pomSessions} seans tamamlandı bugün</p>
          </div>
          <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-red-400 ml-auto transition-colors" />
        </motion.button>
      </Card>

    </motion.div>
  );
}

/* ════════════════════════════════════════
   TAB: HAFTA
   ════════════════════════════════════════ */
function WeekTab() {
  const { tasks, reminders, goals } = useApp();
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const weekTasks = useMemo(() =>
    tasks.filter(t => !t.completed && t.dueDate && isWithinInterval(parseISO(t.dueDate), { start: weekStart, end: weekEnd }))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks, weekStart, weekEnd]
  );

  const upcomingReminders = useMemo(() =>
    (reminders || [])
      .filter(r => r.datetime)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
      .slice(0, 5),
    [reminders]
  );

  const activeGoals = useMemo(() => goals.filter(g => !g.completed).slice(0, 3), [goals]);

  // Group tasks by day
  const byDay = useMemo(() => {
    const map = {};
    const days = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
    days.forEach(d => { map[d] = []; });
    weekTasks.forEach(t => { if (map[t.dueDate]) map[t.dueDate].push(t); });
    return { days, map };
  }, [weekTasks, weekStart]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">

      {/* Weekly calendar strip */}
      <Card>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-violet-400" /> Bu Haftanın Görevi
          </h3>
          {weekTasks.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-4">Bu hafta için görev yok 🎉</p>
          ) : (
            <div className="space-y-1">
              {byDay.days.map(day => {
                const dayTasks = byDay.map[day];
                if (dayTasks.length === 0) return null;
                const label = format(parseISO(day), 'EEEE, d MMM', { locale: tr });
                const isToday = day === todayStr();
                return (
                  <div key={day} className="mb-3">
                    <p className={`text-[11px] uppercase tracking-widest font-semibold mb-1.5 ${isToday ? 'text-violet-400' : 'text-zinc-500'}`}>
                      {isToday ? '⚡ Bugün' : label}
                    </p>
                    {dayTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 mb-1">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          t.priority === 'acil' ? 'bg-red-400' :
                          t.priority === 'yüksek' ? 'bg-orange-400' : 'bg-zinc-600'
                        }`} />
                        <span className="flex-1 text-sm text-zinc-300 truncate">{t.title}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => navigate('/tasks')}
            className="mt-2 text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
          >
            Tüm görevler <ArrowUpRight size={11} />
          </button>
        </div>
      </Card>

      {/* Hatırlatmalar */}
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Bell size={14} className="text-amber-400" /> Hatırlatmalar
            </h3>
            <button onClick={() => navigate('/reminders')} className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
              Tümü <ArrowUpRight size={11} />
            </button>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-4">Aktif hatırlatma yok</p>
          ) : (
            <div className="space-y-2">
              {upcomingReminders.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <Bell size={14} className="text-amber-400 shrink-0" />
                  <span className="flex-1 text-sm text-zinc-300 truncate">{r.title}</span>
                  {r.datetime && (
                    <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                      {format(new Date(r.datetime), 'd MMM, HH:mm')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Aktif Hedefler */}
      {activeGoals.length > 0 && (
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Target size={14} className="text-violet-400" /> Hedefler
              </h3>
              <button onClick={() => navigate('/goals')} className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
                Tümü <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="space-y-3">
              {activeGoals.map(goal => {
                const total = goal.milestones?.length || 0;
                const done = goal.milestones?.filter(m => m.completed).length || 0;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-200">{goal.title}</span>
                      <span className="text-[11px] text-violet-400 font-mono">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.23,1,0.32,1] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

    </motion.div>
  );
}

/* ════════════════════════════════════════
   TAB: AY
   ════════════════════════════════════════ */
function MonthTab() {
  const { projects, goals, tasks } = useApp();
  const navigate = useNavigate();

  const activeProjects = useMemo(() => projects.filter(p => {
    const total = p.columns.reduce((a, c) => a + c.cards.length, 0);
    const done = p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;
    return total > 0 && done < total;
  }), [projects]);

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;

  const tasksThisMonth = useMemo(() => {
    const now = new Date();
    return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getMonth() === now.getMonth()).length;
  }, [tasks]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">

      {/* Month summary */}
      <Card>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4">
            {format(new Date(), 'MMMM yyyy', { locale: tr })} Özeti
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Aktif Proje', value: activeProjects.length, color: 'text-blue-400' },
              { label: 'Aylık Görev', value: tasksThisMonth, color: 'text-violet-400' },
              { label: 'Hedef', value: `${completedGoals}/${totalGoals}`, color: 'text-green-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center py-3 px-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-zinc-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Projects */}
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FolderKanban size={14} className="text-blue-400" /> Aktif Projeler
            </h3>
            <button onClick={() => navigate('/projects')} className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
              Tümü <ArrowUpRight size={11} />
            </button>
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-4">Aktif proje yok</p>
          ) : (
            <div className="space-y-3">
              {activeProjects.slice(0, 5).map((p, i) => {
                const total = p.columns.reduce((a, c) => a + c.cards.length, 0);
                const done = p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}66` }} />
                      <span className="flex-1 text-sm text-zinc-200 truncate">{p.name}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{done}/{total}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}99)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Goals — full list */}
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Target size={14} className="text-violet-400" /> Tüm Hedefler
            </h3>
            <button onClick={() => navigate('/goals')} className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
              Yönet <ArrowUpRight size={11} />
            </button>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-4">Henüz hedef yok</p>
          ) : (
            <div className="space-y-2">
              {goals.slice(0, 6).map(goal => {
                const total = goal.milestones?.length || 0;
                const done = goal.milestones?.filter(m => m.completed).length || 0;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <div key={goal.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                    goal.completed ? 'bg-green-500/8 border-green-500/15' : 'bg-zinc-900/60 border-zinc-800'
                  }`}>
                    <span className={`text-lg shrink-0 ${goal.completed ? '' : 'grayscale opacity-60'}`}>
                      {goal.completed ? '✅' : '🎯'}
                    </span>
                    <span className={`flex-1 text-sm truncate ${goal.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {goal.title}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
export default function PlanlamaHub() {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="p-4 md:p-6 min-h-full max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.15))',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          <Calendar size={18} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Planlama</h1>
          <p className="text-xs text-zinc-500">Zamanını yönet</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6 relative"
        style={{ background: 'rgba(18,18,22,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="planningTabBg"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <tab.icon size={14} className={`relative z-10 ${isActive ? 'text-violet-300' : 'text-zinc-500'}`} />
              <span className={`relative z-10 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          {activeTab === 'today' && <TodayTab />}
          {activeTab === 'week'  && <WeekTab />}
          {activeTab === 'month' && <MonthTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
