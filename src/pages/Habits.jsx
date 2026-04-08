import { useState, useMemo } from 'react';
import { Plus, Trash2, Flame } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { calcStreak, getLast365Days } from '../utils/statsUtils';
import { todayStr } from '../utils/dateUtils';

const HABIT_ICONS = ['⭐','💪','📚','🏃','💧','🎯','🧘','✍️','🎵','🍎','😴','🧹','💻','🌱','🏋️','🚴'];
const HABIT_COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316'];

function HabitForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', icon: '⭐', color: '#8b5cf6', frequency: 'daily', ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      <input autoFocus value={form.name} onChange={e => set('name', e.target.value)}
        placeholder="Alışkanlık adı (örn: 30 dk egzersiz)..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500" />
      <div>
        <label className="block text-xs text-zinc-400 mb-2">İkon</label>
        <div className="grid grid-cols-8 gap-1.5">
          {HABIT_ICONS.map(ic => (
            <button key={ic} onClick={() => set('icon', ic)}
              className={`text-xl p-1.5 rounded-lg transition-colors ${form.icon === ic ? 'bg-violet-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-2">Renk</label>
        <div className="flex gap-2">
          {HABIT_COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">İptal</button>
        <button onClick={() => form.name.trim() && onSave(form)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
          Kaydet
        </button>
      </div>
    </div>
  );
}

function HeatMap({ completions, color }) {
  const days = getLast365Days();
  const set = new Set(completions);

  // Group into weeks
  const weeks = [];
  let week = [];
  const startPad = new Date(days[0]).getDay();
  const adjustedStart = startPad === 0 ? 6 : startPad - 1; // Mon=0
  for (let i = 0; i < adjustedStart; i++) week.push(null);
  for (const d of days) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

  return (
    <div className="flex gap-0.5 overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.map((day, di) => (
            <div key={di}
              className={`w-2.5 h-2.5 rounded-sm transition-opacity ${!day ? 'opacity-0' : set.has(day) ? 'opacity-100' : 'bg-zinc-800'}`}
              style={day && set.has(day) ? { background: color } : {}}
              title={day || ''}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HabitItem({ habit }) {
  const { toggleHabitToday, deleteHabit, updateHabit } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const today = todayStr();
  const done = habit.completions.includes(today);
  const streak = calcStreak(habit.completions);

  // Last 7 days
  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
    return days;
  }, []);

  const weekDone = habit.completions.filter(d => last7.includes(d)).length;

  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden transition-colors ${done ? 'border-zinc-700' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex items-center gap-4 p-4">
        {/* Icon + toggle */}
        <button
          onClick={() => toggleHabitToday(habit.id)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all shrink-0 border-2 ${done ? 'scale-105' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'}`}
          style={done ? { background: habit.color + '33', borderColor: habit.color } : {}}
        >
          {habit.icon}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${done ? 'text-zinc-300' : 'text-zinc-100'}`}>{habit.name}</span>
            {done && <span className="text-xs text-green-400">✓ Tamamlandı</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {streak > 0 && (
              <span className="text-xs text-orange-400 flex items-center gap-1">
                <Flame size={11} />{streak} günlük seri
              </span>
            )}
            <span className="text-xs text-zinc-500">{weekDone}/7 bu hafta</span>
          </div>
          {/* Last 7 mini dots */}
          <div className="flex gap-1 mt-2">
            {last7.map((d, i) => (
              <div key={i}
                className={`w-3 h-3 rounded-full ${habit.completions.includes(d) ? 'opacity-100' : 'bg-zinc-700 opacity-50'}`}
                style={habit.completions.includes(d) ? { background: habit.color } : {}}
                title={d}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            {expanded ? '▲' : '▼'}
          </button>
          <button onClick={() => setEditOpen(true)} className="p-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors">✏</button>
          <button onClick={() => deleteHabit(habit.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3">
          <p className="text-xs text-zinc-500 mb-2">Son 1 yıl</p>
          <HeatMap completions={habit.completions} color={habit.color} />
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Alışkanlığı Düzenle">
        <HabitForm initial={habit}
          onSave={(data) => { updateHabit(habit.id, data); setEditOpen(false); }}
          onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}

export default function Habits() {
  const { habits, addHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const today = todayStr();

  const doneToday = habits.filter(h => h.completions.includes(today)).length;
  const topStreak = habits.length ? Math.max(...habits.map(h => calcStreak(h.completions))) : 0;

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Alışkanlıklar</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{doneToday}/{habits.length} bugün tamamlandı</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Alışkanlık Ekle
        </button>
      </div>

      {/* Summary */}
      {habits.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-zinc-100">{doneToday}/{habits.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Bugün tamamlandı</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
              <Flame size={20} />{topStreak}
            </p>
            <p className="text-xs text-zinc-500 mt-1">En uzun seri</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-zinc-100">{habits.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Toplam alışkanlık</p>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl">🎯</span>
          <p className="mt-3 text-zinc-400">Henüz alışkanlık eklenmedi</p>
          <p className="text-xs text-zinc-600 mt-1">Küçük adımlar büyük değişimler yaratır</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-violet-400 hover:text-violet-300">
            + İlk alışkanlığını ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map(h => <HabitItem key={h.id} habit={h} />)}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Yeni Alışkanlık">
        <HabitForm
          onSave={(data) => { addHabit(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
