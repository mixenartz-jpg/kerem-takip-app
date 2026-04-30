import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronRight, Tag, Calendar, CheckSquare, Sparkles, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { formatDate, todayStr, getPriorityColor } from '../utils/dateUtils';
import { buildDailyTodoSuggestions, parseGeminiError } from '../services/geminiService';

const PRIORITIES = ['acil', 'yüksek', 'normal', 'düşük'];
const PRIORITY_LABELS = { acil: '🔴 Acil', yüksek: '🟠 Yüksek', normal: '🔵 Normal', düşük: '⚪ Düşük' };

const TABS = [
  { id: 'bugun', label: 'Bugün' },
  { id: 'tumü', label: 'Tümü' },
];

// ── DailyTodos inline sub-component ──────────────────────────────────────────

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${
        todo.completed
          ? 'bg-zinc-900/40 border-zinc-800/50'
          : 'bg-zinc-900 border-zinc-800 hover:border-violet-500/30'
      }`}
    >
      <button onClick={() => onToggle(todo.id)} className="shrink-0 transition-transform active:scale-90">
        {todo.completed
          ? <CheckCircle2 size={20} className="text-violet-500" />
          : <Circle size={20} className="text-zinc-600 hover:text-violet-400 transition-colors" />
        }
      </button>
      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-400 rounded-lg transition-all"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

function BugunTab() {
  const { dailyTodos, addDailyTodo, toggleDailyTodo, deleteDailyTodo, tasks, habits, yks } = useApp();
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTodos = (dailyTodos || []).filter(t => t.date === today);
  const completed = todayTodos.filter(t => t.completed);
  const pending = todayTodos.filter(t => !t.completed);
  const completionPct = todayTodos.length > 0
    ? Math.round((completed.length / todayTodos.length) * 100)
    : 0;

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addDailyTodo(text, today);
    setInput('');
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const suggestions = await buildDailyTodoSuggestions({ tasks, habits, yks });
      suggestions.forEach(s => addDailyTodo(s, today));
    } catch (err) {
      setAiError(parseGeminiError(err));
    } finally {
      setAiLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 20;
  const strokeDash = circumference - (completionPct / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header with ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#27272a" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke={completionPct === 100 ? '#22c55e' : '#7c3aed'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-200">{completionPct}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-200">
            {format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">{completed.length}/{todayTodos.length} tamamlandı</p>
        </div>
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Yeni madde ekle..."
          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* AI Suggest */}
      <div>
        <button
          onClick={handleAISuggest}
          disabled={aiLoading}
          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-xl px-4 py-2 transition-all disabled:opacity-60"
        >
          {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          AI Öneri Al
        </button>
        {aiError && <p className="text-xs text-red-400 mt-1.5">{aiError}</p>}
      </div>

      {/* Todo list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {pending.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleDailyTodo} onDelete={deleteDailyTodo} />
          ))}
        </AnimatePresence>

        {completed.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide mb-2">
              Tamamlananlar ({completed.length})
            </p>
            <AnimatePresence>
              {completed.map(todo => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleDailyTodo} onDelete={deleteDailyTodo} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {todayTodos.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Henüz madde yok.</p>
            <p className="text-xs mt-1">Üstten ekle veya AI öneri al.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TaskForm & TaskItem (unchanged) ──────────────────────────────────────────

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
  const { toggleTask, deleteTask, updateTask, addSubtask, toggleSubtask } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newSub, setNewSub] = useState('');

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

function TumuTab({ tasks, addTask }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter === 'active') list = list.filter(t => !t.completed);
    if (filter === 'done') list = list.filter(t => t.completed);
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
    overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr()).length,
  }), [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {[['all','Tümü'], ['active','Aktif'], ['overdue','Gecikmiş'], ['done','Bitti']].map(([v, l]) => (
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

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <CheckSquare size={40} className="mx-auto mb-2 text-zinc-700" />
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

// ── Main Tasks page ───────────────────────────────────────────────────────────

export default function Tasks() {
  const { tasks, addTask } = useApp();
  const [activeTab, setActiveTab] = useState('bugun');
  const [showForm, setShowForm] = useState(false);

  const activeCounts = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Görevler</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{activeCounts} aktif görev</p>
        </div>
        {activeTab === 'tumü' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Görev Ekle
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="tasksTabActive"
                className="absolute inset-0 bg-violet-600 rounded-md"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'bugun' && <BugunTab />}
          {activeTab === 'tumü' && <TumuTab tasks={tasks} addTask={addTask} />}
        </motion.div>
      </AnimatePresence>

      {/* Add task modal (from header button in Tümü tab) */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Yeni Görev">
        <TaskForm
          onSave={(data) => { addTask(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
