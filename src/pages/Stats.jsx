import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calcStreak, getLast7Days, getLast30Days } from '../utils/statsUtils';
import { Flame } from 'lucide-react';

const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function Stats() {
  const { tasks, habits, pomodoro, projects } = useApp();

  const last7 = getLast7Days();
  const last30 = getLast30Days();

  // Tasks completed per day (last 7)
  const taskChart7 = useMemo(() =>
    last7.map(d => ({
      day: format(new Date(d), 'dd MMM', { locale: tr }),
      Tamamlanan: tasks.filter(t => t.completedAt?.startsWith(d)).length,
      Eklenen: tasks.filter(t => t.createdAt?.startsWith(d)).length,
    })),
    [tasks, last7]
  );

  // Tasks per month last 30 days (grouped by week)
  const taskChart30 = useMemo(() =>
    last30.map(d => ({
      day: format(new Date(d), 'dd', { locale: tr }),
      Tamamlanan: tasks.filter(t => t.completedAt?.startsWith(d)).length,
    })),
    [tasks, last30]
  );

  // Habit completion rate
  const habitStats = useMemo(() =>
    habits.map(h => ({
      name: `${h.icon} ${h.name}`,
      streak: calcStreak(h.completions),
      total: h.completions.length,
      last7: h.completions.filter(d => last7.includes(d)).length,
      color: h.color,
    })),
    [habits, last7]
  );

  // Pomodoro per day (last 7)
  const pomChart = useMemo(() =>
    last7.map(d => ({
      day: format(new Date(d), 'dd MMM', { locale: tr }),
      Oturum: pomodoro.sessions.filter(s => s.date === d && s.completed).length,
    })),
    [pomodoro, last7]
  );

  // Priority distribution
  const priorityData = useMemo(() => {
    const counts = { acil: 0, yüksek: 0, normal: 0, düşük: 0 };
    tasks.forEach(t => { if (counts[t.priority] !== undefined) counts[t.priority]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [tasks]);

  const totalFocusMin = pomodoro.sessions.filter(s => s.completed).length * (pomodoro.settings?.work || 25);
  const completionRate = tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <h1 className="text-xl font-bold text-zinc-100">İstatistikler</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Görev', value: tasks.length, sub: `${completionRate}% tamamlandı`, color: 'text-blue-400' },
          { label: 'Toplam Odak', value: `${totalFocusMin}dk`, sub: `${pomodoro.sessions.filter(s=>s.completed).length} oturum`, color: 'text-violet-400' },
          { label: 'Alışkanlık', value: habits.length, sub: `${Math.max(0,...habits.map(h=>calcStreak(h.completions)),0)} max seri`, color: 'text-orange-400' },
          { label: 'Aktif Proje', value: projects.length, sub: `${projects.reduce((a,p)=>a+p.columns.reduce((b,c)=>b+c.cards.length,0),0)} kart`, color: 'text-green-400' },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task completion last 7 days */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Son 7 Gün — Görev</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={taskChart7} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Tamamlanan" fill="#8b5cf6" radius={[3,3,0,0]} />
              <Bar dataKey="Eklenen" fill="#3f3f46" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pomodoro sessions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Son 7 Gün — Pomodoro</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={pomChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Oturum" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Priority distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Görev Öncelik Dağılımı</h3>
          {priorityData.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">Henüz görev yok</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                    {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {priorityData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-zinc-400 capitalize flex-1">{d.name}</span>
                    <span className="text-xs font-medium text-zinc-200">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Habit streaks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Alışkanlık Serileri</h3>
          {habitStats.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">Henüz alışkanlık yok</p>
          ) : (
            <div className="space-y-3">
              {habitStats.sort((a,b) => b.streak - a.streak).slice(0,6).map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm truncate flex-1 text-zinc-300">{h.name}</span>
                  <span className="text-xs text-zinc-500">{h.last7}/7 bu hafta</span>
                  <span className="text-xs text-orange-400 flex items-center gap-1 w-12 justify-end">
                    {h.streak > 0 && <><Flame size={10} />{h.streak}</>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Last 30 days task trend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-100 text-sm mb-4">Son 30 Gün — Tamamlanan Görevler</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={taskChart30} barSize={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#52525b' }} axisLine={false} tickLine={false}
              interval={4} />
            <YAxis hide allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Tamamlanan" fill="#8b5cf6" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
