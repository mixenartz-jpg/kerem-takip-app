import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { buildDailyTodoSuggestions, parseGeminiError } from '../services/geminiService';

export default function DailyTodos() {
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

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAdd();
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
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        {/* Completion ring */}
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
          <h1 className="text-xl font-bold text-zinc-100">Günlük Yapılacaklar</h1>
          <p className="text-sm text-zinc-500">
            {format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}
          </p>
          <p className="text-xs text-zinc-600 mt-0.5">
            {completed.length}/{todayTodos.length} tamamlandı
          </p>
        </div>
      </motion.div>

      {/* Quick add */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-4"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Yeni madde ekle..."
          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all"
        />
        <motion.button
          onClick={handleAdd}
          disabled={!input.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all"
        >
          <Plus size={18} />
        </motion.button>
      </motion.div>

      {/* AI Suggest */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-5"
      >
        <button
          onClick={handleAISuggest}
          disabled={aiLoading}
          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-xl px-4 py-2 transition-all disabled:opacity-60"
        >
          {aiLoading
            ? <Loader2 size={14} className="animate-spin" />
            : <Sparkles size={14} />}
          AI Öneri Al
        </button>
        {aiError && <p className="text-xs text-red-400 mt-1.5">{aiError}</p>}
      </motion.div>

      {/* Todo list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {pending.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleDailyTodo} onDelete={deleteDailyTodo} />
          ))}
        </AnimatePresence>

        {/* Completed section */}
        {completed.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide mb-2">
              Tamamlananlar ({completed.length})
            </p>
            <AnimatePresence>
              {completed.map(todo => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleDailyTodo} onDelete={deleteDailyTodo} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {todayTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-zinc-600"
          >
            <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Henüz madde yok.</p>
            <p className="text-xs mt-1">Üstten ekle veya AI öneri al.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

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
      <button
        onClick={() => onToggle(todo.id)}
        className="shrink-0 transition-transform active:scale-90"
      >
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
