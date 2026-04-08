import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Target, Plus, Trash2, Edit2, CheckCircle2, Circle, X, Flag } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function GoalCard({ goal, onEdit, onDelete, onToggleMilestone, onToggleComplete }) {
  const total = goal.milestones?.length || 0;
  const done = goal.milestones?.filter(m => m.completed).length || 0;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className={`bg-zinc-900 border ring-1 ring-white/5 rounded-xl p-4 transition-colors hover:border-zinc-700 ${goal.completed ? 'border-green-800/40 opacity-70' : 'border-zinc-800'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggleComplete(goal.id)}
            className="mt-0.5 shrink-0 transition-colors"
          >
            {goal.completed
              ? <CheckCircle2 size={18} className="text-green-500" />
              : <Circle size={18} className="text-zinc-600 hover:text-zinc-400" />
            }
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${goal.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {goal.title}
            </p>
            {goal.description && (
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{goal.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${goal.category === 'kısa' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'}`}>
                {goal.category === 'kısa' ? 'Kısa Vade' : 'Uzun Vade'}
              </span>
              {goal.targetDate && (
                <span className="text-xs text-zinc-600">
                  {format(parseISO(goal.targetDate), 'dd MMM yyyy', { locale: tr })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(goal)} className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-600">{done}/{total} milestone</span>
            <span className="text-xs font-medium text-violet-400">{pct}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Milestones */}
      {goal.milestones?.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {goal.milestones.map(m => (
            <button
              key={m.id}
              onClick={() => onToggleMilestone(goal.id, m.id)}
              className="flex items-center gap-2 text-xs text-left group transition-colors"
            >
              {m.completed
                ? <CheckCircle2 size={13} className="text-violet-500 shrink-0" />
                : <Circle size={13} className="text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
              }
              <span className={m.completed ? 'line-through text-zinc-600' : 'text-zinc-400'}>{m.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, toggleMilestone } = useApp();
  const [tab, setTab] = useState('kısa');
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'kısa', targetDate: '' });
  const [milestones, setMilestones] = useState([]);
  const [msInput, setMsInput] = useState('');

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);
  const filtered = active.filter(g => g.category === tab);

  const openAdd = () => {
    setEditGoal(null);
    setForm({ title: '', description: '', category: tab, targetDate: '' });
    setMilestones([]);
    setMsInput('');
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditGoal(goal);
    setForm({ title: goal.title, description: goal.description || '', category: goal.category, targetDate: goal.targetDate || '' });
    setMilestones(goal.milestones || []);
    setMsInput('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editGoal) updateGoal(editGoal.id, { ...form, milestones });
    else addGoal({ ...form, milestones });
    setModalOpen(false);
  };

  const addMs = () => {
    if (!msInput.trim()) return;
    setMilestones(prev => [...prev, { id: genId(), title: msInput.trim(), completed: false }]);
    setMsInput('');
  };

  const toggleComplete = (id) => {
    const g = goals.find(g => g.id === id);
    if (g) updateGoal(id, { completed: !g.completed });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Hedefler</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Öğrenme hedeflerini belirle ve milestone'larla takip et</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus size={16} />
          Yeni Hedef
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Aktif Hedefler</p>
          <p className="text-2xl font-bold text-zinc-100">{active.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Tamamlanan</p>
          <p className="text-2xl font-bold text-green-400">{completed.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Toplam Milestone</p>
          <p className="text-2xl font-bold text-violet-400">
            {goals.reduce((s, g) => s + (g.milestones?.filter(m => m.completed).length || 0), 0)}
            <span className="text-sm font-normal text-zinc-500 ml-1">/ {goals.reduce((s, g) => s + (g.milestones?.length || 0), 0)}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-6 w-fit">
        {['kısa', 'uzun'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-violet-600/20 text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {t === 'kısa' ? 'Kısa Vadeli' : 'Uzun Vadeli'}
          </button>
        ))}
      </div>

      {/* Active goals */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <Target size={36} className="mb-2 opacity-30" />
          <p className="text-sm">Bu kategoride aktif hedef yok</p>
          <button onClick={openAdd} className="mt-2 text-violet-400 hover:text-violet-300 text-sm">Hedef ekle →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filtered.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={deleteGoal}
              onToggleMilestone={toggleMilestone}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-600 uppercase tracking-wider mb-3">Tamamlanan Hedefler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
            {completed.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={openEdit}
                onDelete={deleteGoal}
                onToggleMilestone={toggleMilestone}
                onToggleComplete={toggleComplete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editGoal ? 'Hedefi Düzenle' : 'Yeni Hedef'} size="md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Hedef Başlığı</label>
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="YDT'de 90+ puan almak..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Açıklama</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Detaylar..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Kategori</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              >
                <option value="kısa">Kısa Vadeli</option>
                <option value="uzun">Uzun Vadeli</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Hedef Tarih</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Milestone'lar</label>
            <div className="flex gap-2 mb-2">
              <input
                value={msInput}
                onChange={e => setMsInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMs()}
                placeholder="Adım ekle..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
              <button onClick={addMs} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            {milestones.length > 0 && (
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-2 py-1.5 bg-zinc-800 rounded-lg">
                    <span className="text-xs text-zinc-300">{m.title}</span>
                    <button onClick={() => setMilestones(prev => prev.filter(ms => ms.id !== m.id))} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors">
              İptal
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
              {editGoal ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
