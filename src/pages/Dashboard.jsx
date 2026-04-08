import { useMemo } from 'react';
import { format } from 'date-fns';
import { CheckSquare, Clock, Activity, FolderKanban, Flame, Timer, TrendingUp, BookOpen, ClipboardList, Target, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr, formatDate, getPriorityColor } from '../utils/dateUtils';
import { calcStreak, QUOTES } from '../utils/statsUtils';
import ProgressBar from '../components/ui/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO, isPast } from 'date-fns';

const QUOTE = QUOTES[new Date().getDay() % QUOTES.length];

function StatCard({ icon: Icon, label, value, sub, color = 'violet', onClick }) {
  const colors = {
    violet: 'text-violet-400 bg-violet-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    green: 'text-green-400 bg-green-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    red: 'text-red-400 bg-red-400/10',
  };
  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { tasks, habits, projects, pomodoro, exams, goals, lessons } = useApp();
  const navigate = useNavigate();
  const today = todayStr();

  const todayTasks = useMemo(() =>
    tasks.filter(t => t.dueDate === today || (!t.dueDate && !t.completed)),
    [tasks, today]
  );
  const completedToday = useMemo(() => tasks.filter(t => t.completedAt?.startsWith(today)).length, [tasks, today]);
  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);

  const habitsToday = useMemo(() => {
    const total = habits.length;
    const done = habits.filter(h => h.completions.includes(today)).length;
    return { total, done };
  }, [habits, today]);

  const pomodoroToday = useMemo(() =>
    pomodoro.sessions.filter(s => s.date === today && s.completed).length,
    [pomodoro, today]
  );

  const activeProjects = projects.filter(p => {
    const total = p.columns.reduce((a, c) => a + c.cards.length, 0);
    const done = p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;
    return total > 0 && done < total;
  });

  const upcomingTasks = useMemo(() =>
    tasks
      .filter(t => !t.completed && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5),
    [tasks]
  );

  const topStreak = useMemo(() => {
    if (!habits.length) return 0;
    return Math.max(...habits.map(h => calcStreak(h.completions)));
  }, [habits]);

  const upcomingExams = useMemo(() =>
    exams
      .filter(e => !isPast(parseISO(e.date + 'T23:59')))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3),
    [exams]
  );

  const activeGoals = useMemo(() =>
    goals.filter(g => !g.completed).slice(0, 3),
    [goals]
  );

  const totalStudyHours = useMemo(() =>
    lessons.reduce((s, l) => s + (l.studyHours || 0), 0),
    [lessons]
  );

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Quote */}
      <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/20 border border-violet-800/30 rounded-xl p-4">
        <p className="text-sm text-violet-300 italic">"{QUOTE}"</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckSquare} label="Bugün tamamlandı" value={completedToday}
          sub={`${pendingTasks} bekliyor`} color="blue"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          icon={Activity} label="Alışkanlıklar" value={`${habitsToday.done}/${habitsToday.total}`}
          sub="bugün" color="green"
          onClick={() => navigate('/habits')}
        />
        <StatCard
          icon={BookOpen} label="Çalışma Saati" value={totalStudyHours}
          sub={`${lessons.length} ders`} color="violet"
          onClick={() => navigate('/lessons')}
        />
        <StatCard
          icon={Flame} label="En uzun seri" value={topStreak}
          sub="gün üst üste" color="red"
          onClick={() => navigate('/habits')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming tasks */}
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Clock size={16} className="text-violet-400" /> Yaklaşan Görevler
            </h3>
            <button onClick={() => navigate('/tasks')} className="text-xs text-violet-400 hover:text-violet-300">Tümü →</button>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Bekleyen görev yok 🎉</p>
          ) : (
            <ul className="space-y-2">
              {upcomingTasks.map(task => (
                <li key={task.id} className="flex items-center gap-3 py-1.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'acil' ? 'bg-red-400' : task.priority === 'yüksek' ? 'bg-orange-400' : 'bg-zinc-500'}`} />
                  <span className="flex-1 text-sm text-zinc-200 truncate">{task.title}</span>
                  {task.dueDate && (
                    <span className="text-xs text-zinc-500 shrink-0">{formatDate(task.dueDate, 'dd MMM')}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active projects */}
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <FolderKanban size={16} className="text-violet-400" /> Aktif Projeler
            </h3>
            <button onClick={() => navigate('/projects')} className="text-xs text-violet-400 hover:text-violet-300">Tümü →</button>
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Aktif proje yok</p>
          ) : (
            <ul className="space-y-3">
              {activeProjects.slice(0, 4).map(p => {
                const total = p.columns.reduce((a, c) => a + c.cards.length, 0);
                const done = p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;
                return (
                  <li key={p.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                      <span className="text-sm text-zinc-200 flex-1 truncate">{p.name}</span>
                      <span className="text-xs text-zinc-500">{done}/{total}</span>
                    </div>
                    <ProgressBar value={done} max={total} color="violet" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Habits today */}
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Activity size={16} className="text-green-400" /> Bugünün Alışkanlıkları
            </h3>
            <button onClick={() => navigate('/habits')} className="text-xs text-violet-400 hover:text-violet-300">Tümü →</button>
          </div>
          {habits.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Henüz alışkanlık eklenmedi</p>
          ) : (
            <ul className="space-y-2">
              {habits.slice(0, 6).map(h => {
                const done = h.completions.includes(today);
                const streak = calcStreak(h.completions);
                return (
                  <li key={h.id} className="flex items-center gap-3">
                    <span className="text-lg">{h.icon}</span>
                    <span className="flex-1 text-sm text-zinc-200">{h.name}</span>
                    {streak > 0 && (
                      <span className="text-xs text-orange-400 flex items-center gap-1">
                        <Flame size={11} />{streak}
                      </span>
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${done ? 'bg-green-500 border-green-500' : 'border-zinc-600'}`}>
                      {done && <span className="text-white text-xs">✓</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Today's tasks */}
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" /> Bugünün Görevleri
            </h3>
            <button onClick={() => navigate('/tasks')} className="text-xs text-violet-400 hover:text-violet-300">Tümü →</button>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Bugün için görev yok 🎉</p>
          ) : (
            <>
              <ProgressBar
                value={todayTasks.filter(t => t.completed).length}
                max={todayTasks.length}
                showLabel
                className="mb-3"
              />
              <ul className="space-y-1.5">
                {todayTasks.slice(0, 5).map(t => (
                  <li key={t.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${t.completed ? 'bg-violet-500 border-violet-500' : 'border-zinc-600'}`}>
                      {t.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-sm truncate ${t.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{t.title}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <ClipboardList size={16} className="text-red-400" /> Yaklaşan Sınavlar
            </h3>
            <button onClick={() => navigate('/exams')} className="text-xs text-violet-400 hover:text-violet-300">Tümü →</button>
          </div>
          {upcomingExams.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Yaklaşan sınav yok</p>
          ) : (
            <ul className="space-y-2">
              {upcomingExams.map(exam => {
                const diff = differenceInDays(parseISO(exam.date), new Date());
                return (
                  <li key={exam.id} className="flex items-center gap-3 py-1">
                    <AlertCircle size={14} className={diff <= 3 ? 'text-red-400 shrink-0' : 'text-zinc-600 shrink-0'} />
                    <span className="flex-1 text-sm text-zinc-200 truncate">{exam.title}</span>
                    <span className={`text-xs shrink-0 ${diff <= 3 ? 'text-red-400 font-medium' : 'text-zinc-500'}`}>
                      {diff === 0 ? 'Bugün' : diff === 1 ? 'Yarın' : `${diff}g`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Active Goals */}
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Target size={16} className="text-violet-400" /> Aktif Hedefler
            </h3>
            <button onClick={() => navigate('/goals')} className="text-xs text-violet-400 hover:text-violet-300">Tümü →</button>
          </div>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Aktif hedef yok</p>
          ) : (
            <ul className="space-y-3">
              {activeGoals.map(goal => {
                const total = goal.milestones?.length || 0;
                const done = goal.milestones?.filter(m => m.completed).length || 0;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <li key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-200 truncate flex-1">{goal.title}</span>
                      <span className="text-xs text-violet-400 ml-2">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
