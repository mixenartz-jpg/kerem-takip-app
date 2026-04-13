import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { format, isSameDay, startOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { getMonthDays, DAYS_SHORT, MONTHS_TR, nextMonth, prevMonth, isTodayDate, isSameDayDate, isSameMonthDate, todayStr } from '../utils/dateUtils';

const EVENT_COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6'];

function EventForm({ date, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', date: date || todayStr(), time: '', endTime: '', color: '#8b5cf6', description: '', ...initial,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <input
        autoFocus value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="Etkinlik başlığı..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500"
      />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Tarih</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Başlangıç</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Bitiş</label>
          <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5">Renk</label>
        <div className="flex gap-2">
          {EVENT_COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)}
              className={`w-6 h-6 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <textarea value={form.description} onChange={e => set('description', e.target.value)}
        placeholder="Açıklama..." rows={2}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 resize-none" />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">İptal</button>
        <button onClick={() => form.title.trim() && onSave(form)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
          Kaydet
        </button>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { events, tasks, weeklyPlans, monthlyPlans, addEvent, updateEvent, deleteEvent } = useApp();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editEvt, setEditEvt] = useState(null);

  const days = useMemo(() => getMonthDays(current), [current]);

  const eventsOnDay = (date) => {
    const d = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === d);
  };

  const tasksOnDay = (date) => {
    const d = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.dueDate === d);
  };

  const selectedStr = format(selected, 'yyyy-MM-dd');
  const selectedEvents = events.filter(e => e.date === selectedStr);
  const selectedTasks = tasks.filter(t => t.dueDate === selectedStr);

  const selectedWeekStart = startOfWeek(selected, { weekStartsOn: 1 });
  const selectedWeekStr = format(selectedWeekStart, "yyyy-'W'II");
  const selectedMonthStr = format(selected, 'yyyy-MM');

  const selectedWeeklyPlans = (weeklyPlans || []).filter(p => p.weekStr === selectedWeekStr);
  const selectedMonthlyPlans = (monthlyPlans || []).filter(p => p.monthStr === selectedMonthStr);

  return (
    <div className="p-6 animate-fadeIn h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-zinc-100">Takvim</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Etkinlik Ekle
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Calendar */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrent(prevMonth(current))} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <h2 className="font-semibold text-zinc-100">
              {MONTHS_TR[current.getMonth()]} {current.getFullYear()}
            </h2>
            <button onClick={() => setCurrent(nextMonth(current))} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-xs text-zinc-500 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              const isThisMonth = isSameMonthDate(day, current);
              const isToday = isTodayDate(day);
              const isSel = isSameDay(day, selected);
              const evts = eventsOnDay(day);
              const tsks = tasksOnDay(day);
              const hasItems = evts.length > 0 || tsks.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelected(new Date(day))}
                  className={`relative aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-sm transition-colors
                    ${isToday ? 'bg-violet-600 text-white font-bold' : ''}
                    ${isSel && !isToday ? 'bg-zinc-700 text-zinc-100' : ''}
                    ${!isThisMonth ? 'text-zinc-700' : (!isToday && !isSel ? 'text-zinc-300 hover:bg-zinc-800' : '')}
                  `}
                >
                  <span className="text-xs">{format(day, 'd')}</span>
                  {hasItems && !isToday && (
                    <div className="flex gap-0.5 mt-0.5">
                      {evts.slice(0,2).map((e, j) => (
                        <div key={j} className="w-1 h-1 rounded-full" style={{ background: e.color }} />
                      ))}
                      {tsks.length > 0 && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar — selected day */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold text-zinc-100 text-sm mb-3">
              {format(selected, 'dd MMMM yyyy', { locale: tr })}
            </h3>

            {selectedEvents.length === 0 && selectedTasks.length === 0 && (
              <p className="text-xs text-zinc-500">Bu gün için etkinlik yok.</p>
            )}

            {selectedEvents.map(evt => (
              <div key={evt.id} className="mb-2 p-2.5 rounded-lg bg-zinc-800 group">
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: evt.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-200 truncate">{evt.title}</p>
                    {(evt.time || evt.endTime) && (
                      <p className="text-xs text-zinc-500">{evt.time}{evt.endTime ? ` – ${evt.endTime}` : ''}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditEvt(evt)} className="text-zinc-500 hover:text-zinc-300 text-xs">✏</button>
                    <button onClick={() => deleteEvent(evt.id)} className="text-zinc-500 hover:text-red-400">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {selectedTasks.map(t => (
              <div key={t.id} className="mb-2 p-2.5 rounded-lg bg-zinc-800">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${t.completed ? 'bg-green-500' : 'bg-blue-400'}`} />
                  <p className={`text-xs text-zinc-300 truncate ${t.completed ? 'line-through text-zinc-500' : ''}`}>{t.title}</p>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-2 py-1.5 text-xs text-violet-400 hover:text-violet-300 border border-dashed border-zinc-700 hover:border-violet-500/50 rounded-lg transition-colors"
            >
              + Etkinlik ekle
            </button>
          </div>

          {/* Haftalık ve Aylık Planlar Özeti */}
          {(selectedWeeklyPlans.length > 0 || selectedMonthlyPlans.length > 0) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              {selectedWeeklyPlans.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-zinc-100 text-xs mb-2 uppercase tracking-wide text-violet-400">
                    Bu Haftanın Planları
                  </h3>
                  {selectedWeeklyPlans.map(p => (
                    <div key={p.id} className="flex items-center gap-2 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.completed ? 'bg-green-500' : 'bg-zinc-500'}`} />
                      <p className={`text-xs text-zinc-300 truncate ${p.completed ? 'line-through text-zinc-600' : ''}`}>
                        {p.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {selectedMonthlyPlans.length > 0 && (
                <div>
                  <h3 className="font-semibold text-zinc-100 text-xs mb-2 uppercase tracking-wide text-blue-400">
                    Bu Ayın Planları
                  </h3>
                  {selectedMonthlyPlans.map(p => (
                    <div key={p.id} className="flex items-center gap-2 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.completed ? 'bg-green-500' : 'bg-zinc-500'}`} />
                      <p className={`text-xs text-zinc-300 truncate ${p.completed ? 'line-through text-zinc-600' : ''}`}>
                        {p.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Yeni Etkinlik">
        <EventForm
          date={format(selected, 'yyyy-MM-dd')}
          onSave={(data) => { addEvent(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={!!editEvt} onClose={() => setEditEvt(null)} title="Etkinliği Düzenle">
        {editEvt && (
          <EventForm
            initial={editEvt}
            date={editEvt.date}
            onSave={(data) => { updateEvent(editEvt.id, data); setEditEvt(null); }}
            onCancel={() => setEditEvt(null)}
          />
        )}
      </Modal>
    </div>
  );
}
