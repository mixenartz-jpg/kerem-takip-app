import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  CheckCircle2, Circle, Trash2, Plus, BookOpen,
  ChevronDown, ChevronUp, Link2, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr } from '../utils/dateUtils';

const TODAY = todayStr();

const SUBJECTS = [
  { key: 'Türkçe',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  { key: 'Mat',      color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { key: 'Fizik',    color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  { key: 'Kimya',    color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  { key: 'Bio',      color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  { key: 'Sosyal',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  { key: 'Edebiyat', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  { key: 'Tarih',    color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  { key: 'Coğrafya', color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)'  },
  { key: 'İngilizce',color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
];

const subjMap = Object.fromEntries(SUBJECTS.map(s => [s.key.toLowerCase(), s]));
function getSubj(key) {
  return subjMap[key?.toLowerCase()?.trim()] ?? { color: '#71717a', bg: 'rgba(113,113,122,0.1)' };
}

function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400">{done}/{total} konu tamamlandı</span>
        <span className="text-xs font-semibold text-emerald-400">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function SubjectGroup({ subject, items, onToggle, onDelete }) {
  const [open, setOpen] = useState(true);
  const { color, bg } = getSubj(subject);
  const done = items.filter(i => i.completed).length;

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={{ background: bg, border: `1px solid ${color}22` }}
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {subject}
        </span>
        <span className="text-[11px] text-zinc-600 ml-1">
          {done}/{items.length}
        </span>
        <div className="flex-1 mx-2 h-px" style={{ background: `${color}22` }} />
        {open
          ? <ChevronUp size={13} className="text-zinc-600 shrink-0" />
          : <ChevronDown size={13} className="text-zinc-600 shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1.5">
              {items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="group flex items-start gap-3"
                >
                  <button
                    onClick={() => onToggle(item.id)}
                    className="mt-0.5 shrink-0"
                  >
                    {item.completed
                      ? <CheckCircle2 size={15} style={{ color }} />
                      : <Circle size={15} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm transition-colors ${
                      item.completed ? 'line-through text-zinc-600' : 'text-zinc-200'
                    }`}>
                      {item.topic || item.text}
                    </p>
                    {item.note && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {item.note.startsWith('http')
                          ? <Link2 size={10} className="text-zinc-600 shrink-0" />
                          : <BookOpen size={10} className="text-zinc-600 shrink-0" />}
                        <span className="text-[11px] text-zinc-600 truncate">{item.note}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                  >
                    <Trash2 size={13} className="text-zinc-600 hover:text-red-400 transition-colors" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GunlukPlan() {
  const { state, addAkademiTodo, toggleAkademiTodo, deleteAkademiTodo } = useApp();
  const [selectedSubj, setSelectedSubj] = useState('');
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const todayItems = (state.akademiTodos || []).filter(t => t.date === TODAY);
  const totalDone = todayItems.filter(t => t.completed).length;

  const grouped = useMemo(() => {
    const map = {};
    for (const item of todayItems) {
      const parts = item.text.split(' - ');
      const subj = parts.length > 1 ? parts[0] : 'Genel';
      const topicText = parts.length > 1 ? parts.slice(1).join(' - ') : item.text;
      if (!map[subj]) map[subj] = [];
      map[subj].push({ ...item, topic: topicText });
    }
    return map;
  }, [todayItems]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    const text = selectedSubj ? `${selectedSubj} - ${topic.trim()}` : topic.trim();
    addAkademiTodo(text, TODAY, note.trim() ? { note: note.trim() } : {});
    setTopic('');
    setNote('');
    setShowNote(false);
  };

  const todayDisplay = format(new Date(), 'EEEE, d MMMM', { locale: tr });
  const yksDate = state.yks?.examDate ? new Date(state.yks.examDate) : null;
  const daysLeft = yksDate
    ? Math.max(0, Math.ceil((yksDate - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-full px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Günlük Plan</h1>
          <p className="text-sm text-zinc-500 mt-0.5 capitalize">{todayDisplay}</p>
        </div>
        {daysLeft !== null && (
          <div
            className="text-center px-3 py-2 rounded-xl shrink-0"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
          >
            <p className="text-lg font-bold text-emerald-400 leading-none">{daysLeft}</p>
            <p className="text-[9px] text-emerald-600 mt-0.5 uppercase tracking-wide">gün kaldı</p>
          </div>
        )}
      </div>

      {/* Progress */}
      {todayItems.length > 0 && (
        <div
          className="px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}
        >
          <ProgressBar done={totalDone} total={todayItems.length} />
        </div>
      )}

      {/* Add form */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ders / Konu Ekle</p>

        {/* Subject chips */}
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map(s => (
            <button
              key={s.key}
              onClick={() => setSelectedSubj(prev => prev === s.key ? '' : s.key)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: selectedSubj === s.key ? s.bg : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedSubj === s.key ? s.color + '55' : 'rgba(255,255,255,0.08)'}`,
                color: selectedSubj === s.key ? s.color : '#71717a',
              }}
            >
              {s.key}
            </button>
          ))}
        </div>

        {/* Topic + submit */}
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 focus-within:border-emerald-500/30 transition-colors">
              {selectedSubj && (
                <span
                  className="text-[11px] font-bold shrink-0"
                  style={{ color: getSubj(selectedSubj).color }}
                >
                  {selectedSubj}
                </span>
              )}
              {selectedSubj && <span className="text-zinc-700 shrink-0">—</span>}
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={selectedSubj ? 'Konuyu gir...' : 'Ders veya konu gir...'}
                className="flex-1 text-sm bg-transparent py-2.5 text-zinc-200 placeholder-zinc-600 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNote(p => !p)}
                className="shrink-0 transition-colors"
                title="Kaynak ekle"
              >
                <BookOpen
                  size={14}
                  className={showNote ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}
                />
              </button>
            </div>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.94 }}
              disabled={!topic.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{
                background: topic.trim() ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(52,211,153,0.25)',
              }}
            >
              <Plus size={16} className={topic.trim() ? 'text-emerald-400' : 'text-zinc-600'} />
            </motion.button>
          </div>

          <AnimatePresence>
            {showNote && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3">
                  <Link2 size={12} className="text-zinc-600 shrink-0" />
                  <input
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Kaynak, sayfa no veya link... (isteğe bağlı)"
                    className="flex-1 text-sm bg-transparent py-2.5 text-zinc-300 placeholder-zinc-600 outline-none"
                  />
                  {note && (
                    <button type="button" onClick={() => setNote('')}>
                      <X size={12} className="text-zinc-600 hover:text-zinc-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Items grouped by subject */}
      {Object.keys(grouped).length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 space-y-2"
        >
          <p className="text-4xl">📚</p>
          <p className="text-zinc-400 font-medium">Bugün için henüz konu eklenmedi</p>
          <p className="text-zinc-600 text-sm">Yukarıdan ders ve konu ekleyerek başla</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {Object.entries(grouped).map(([subj, items]) => (
              <SubjectGroup
                key={subj}
                subject={subj}
                items={items}
                onToggle={toggleAkademiTodo}
                onDelete={deleteAkademiTodo}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
