import { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Tag, Calendar, Flag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { formatDate, todayStr, getPriorityColor } from '../utils/dateUtils';

const PRIORITIES = ['acil', 'yüksek', 'normal', 'düşük'];
const PRIORITY_LABELS = { acil: '🔴 Acil', yüksek: '🟠 Yüksek', normal: '🔵 Normal', düşük: '⚪ Düşük' };

function TaskForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'normal', dueDate: '', tags: '', ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      title: form.title.trim(),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <div className="space-y-4">
      <input
        autoFocus
        value={form.title}
        onChange={e => set('title', e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        placeholder="Görev başlığı..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500"
      />
      <textarea
        value={form.description}
        onChange={e => set('description', e.target.value)}
        placeholder="Açıklama (opsiyonel)..."
        rows={2}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Öncelik</label>
          <select
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
          >
            {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Bitiş Tarihi</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5">Etiketler (virgülle ayır)</label>
        <input
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
          placeholder="iş, kişisel, acil..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">İptal</button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}

function TaskItem({ task }) {
  const { toggleTask, deleteTask, updateTask } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newSub, setNewSub] = useState('');
  const { addSubtask, toggleSubtask } = useApp();

  const prioClass = getPriorityColor(task.priority);
  const isOverdue = task.dueDate && !task.completed && task.dueDate < todayStr();

  return (
    <div className={`bg-zinc-900 border rounded-lg overflow-hidden transition-all ${task.completed ? 'border-zinc-800 opacity-60' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => toggleTask(task.id)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-violet-500 border-violet-500' : 'border-zinc-600 hover:border-violet-400'}`}
        >
          {task.completed && <span className="text-white text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className={`text-sm font-medium ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {task.title}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${prioClass}`}>{task.priority}</span>
          </div>
          {task.description && (
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {task.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
                <Calendar size={11} />{formatDate(task.dueDate, 'dd MMM')}
              </span>
            )}
            {task.tags?.map(tag => (
              <span key={tag} className="text-xs text-zinc-500 flex items-center gap-0.5">
                <Tag size={10} />{tag}
              </span>
            ))}
            {task.subtasks?.length > 0 && (
              <span className="text-xs text-zinc-500">
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} alt görev
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <button onClick={() => setEditOpen(true)} className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors text-xs">
            ✏
          </button>
          <button onClick={() => deleteTask(task.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 px-3 pb-3 pt-2 space-y-2">
          {task.subtasks?.map(sub => (
            <div key={sub.id} className="flex items-center gap-2">
              <button
                onClick={() => toggleSubtask(task.id, sub.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${sub.completed ? 'bg-violet-500 border-violet-500' : 'border-zinc-600'}`}
              >
                {sub.completed && <span className="text-white" style={{ fontSize: 9 }}>✓</span>}
              </button>
              <span className={`text-xs ${sub.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>{sub.title}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <input
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newSub.trim()) { addSubtask(task.id, newSub.trim()); setNewSub(''); } }}
              placeholder="Alt görev ekle..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500"
            />
            <button
              onClick={() => { if (newSub.trim()) { addSubtask(task.id, newSub.trim()); setNewSub(''); } }}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Görevi Düzenle">
        <TaskForm
          initial={task}
          onSave={(data) => { updateTask(task.id, data); setEditOpen(false); }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default function Tasks() {
  const { tasks, addTask } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter === 'active') list = list.filter(t => !t.completed);
    if (filter === 'done') list = list.filter(t => t.completed);
    if (filter === 'today') list = list.filter(t => t.dueDate === todayStr());
    if (filter === 'overdue') list = list.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr());
    if (priority !== 'all') list = list.filter(t => t.priority === priority);
    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const po = ['acil', 'yüksek', 'normal', 'düşük'];
      return po.indexOf(a.priority) - po.indexOf(b.priority);
    });
  }, [tasks, filter, priority, search]);

  const counts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    done: tasks.filter(t => t.completed).length,
    today: tasks.filter(t => t.dueDate === todayStr()).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr()).length,
  }), [tasks]);

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Görevler</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{counts.active} aktif, {counts.done} tamamlandı</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Görev Ekle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {[['all','Tümü'], ['active','Aktif'], ['today','Bugün'], ['overdue','Gecikmiş'], ['done','Bitti']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === v ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {l} {counts[v] > 0 && <span className="ml-1 opacity-70">{counts[v]}</span>}
            </button>
          ))}
        </div>

        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
        >
          <option value="all">Tüm öncelikler</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ara..."
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-violet-500 flex-1 min-w-32"
        />
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <CheckSquare2 />
            <p className="mt-2 text-sm">Görev bulunamadı</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-xs text-violet-400 hover:text-violet-300">
              + Yeni görev ekle
            </button>
          </div>
        ) : (
          filtered.map(task => <TaskItem key={task.id} task={task} />)
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Yeni Görev">
        <TaskForm
          onSave={(data) => { addTask(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

function CheckSquare2() {
  return (
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto text-zinc-700">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
