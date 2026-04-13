import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, X, Check, RotateCcw, Trash2, ChevronDown, ChevronUp,
  Brain, Clock, AlertCircle, Flame, Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const SUBJECTS = [
  'Türkçe', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji',
  'Tarih', 'Coğrafya', 'Felsefe', 'AYT Matematik', 'Diğer'
];

const QUALITY_LABELS = [
  { q: 0, label: 'Hiç bilmedim', color: 'bg-red-600 hover:bg-red-500' },
  { q: 1, label: 'Zor hatırladım', color: 'bg-orange-600 hover:bg-orange-500' },
  { q: 2, label: 'Hatırladım', color: 'bg-yellow-600 hover:bg-yellow-500' },
  { q: 3, label: 'Kolay hatırladım', color: 'bg-green-600 hover:bg-green-500' },
];

function AddItemModal({ onClose, onSave }) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [myAnswer, setMyAnswer] = useState('');

  const handleSave = () => {
    if (!topic.trim() || !question.trim() || !correctAnswer.trim()) return;
    onSave({ subject, topic, question, correctAnswer, myAnswer });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100">Hata Ekle</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Ders</label>
              <select
                value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Konu</label>
              <input
                value={topic} onChange={e => setTopic(e.target.value)} placeholder="Örn: Türev"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Soru / Hatalı yapılan konu</label>
            <textarea
              value={question} onChange={e => setQuestion(e.target.value)} rows={3}
              placeholder="Soruyu veya hata yaptığın konuyu yaz..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Doğru Cevap / Açıklama</label>
            <textarea
              value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} rows={2}
              placeholder="Doğru cevap veya açıklamayı yaz..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Benim Cevabım (opsiyonel)</label>
            <input
              value={myAnswer} onChange={e => setMyAnswer(e.target.value)}
              placeholder="Ne yazmıştım?.."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60"
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all">
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!topic.trim() || !question.trim() || !correctAnswer.trim()}
            className="flex-1 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl font-medium transition-all"
          >
            Kaydet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReviewCard({ item, onReview, onDelete }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="relative rounded-2xl border border-zinc-800/70 overflow-hidden"
      style={{ background: 'rgba(18,18,22,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/20">
              {item.subject}
            </span>
            <span className="text-[10px] text-zinc-500">{item.topic}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.interval > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Clock size={10} />
                {item.interval}g
              </div>
            )}
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <p className="text-sm text-zinc-200 leading-relaxed mb-3">{item.question}</p>

        <button
          onClick={() => setFlipped(f => !f)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-violet-400 transition-colors"
        >
          {flipped ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {flipped ? 'Cevabı Gizle' : 'Cevabı Göster'}
        </button>

        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-medium text-emerald-400 mb-1">Doğru Cevap</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{item.correctAnswer}</p>
              </div>
              {item.myAnswer && (
                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-medium text-red-400 mb-1">Benim Cevabım</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.myAnswer}</p>
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {QUALITY_LABELS.map(({ q, label, color }) => (
                  <button
                    key={q}
                    onClick={() => { onReview(item.id, q); setFlipped(false); }}
                    className={`py-2 rounded-xl text-xs font-medium text-white transition-all ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function HataDefteri() {
  const { hataDefteriItems, addHataDefteri, deleteHataDefteri, reviewHataDefteri } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [filterSubject, setFilterSubject] = useState('Tümü');
  const [tab, setTab] = useState('due'); // 'due' | 'all'

  const today = new Date().toISOString().split('T')[0];

  const dueItems = useMemo(() =>
    hataDefteriItems.filter(i => !i.nextReview || i.nextReview <= today),
    [hataDefteriItems, today]
  );

  const subjects = useMemo(() => {
    const s = new Set(hataDefteriItems.map(i => i.subject));
    return ['Tümü', ...s];
  }, [hataDefteriItems]);

  const displayItems = (tab === 'due' ? dueItems : hataDefteriItems)
    .filter(i => filterSubject === 'Tümü' || i.subject === filterSubject);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
            >
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Hata Defteri</h1>
              <p className="text-xs text-zinc-500">SM-2 algoritmasıyla aralıklı tekrar</p>
            </div>
          </div>
          <motion.button
            onClick={() => setShowAdd(true)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <Plus size={14} /> Hata Ekle
          </motion.button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Toplam Hata', value: hataDefteriItems.length, icon: AlertCircle, color: 'text-zinc-400' },
          { label: 'Bugün Tekrar', value: dueItems.length, icon: RotateCcw, color: 'text-orange-400' },
          { label: 'Öğrenilen', value: hataDefteriItems.filter(i => i.repetitions >= 2).length, icon: Brain, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-zinc-800/60 p-4 text-center" style={{ background: 'rgba(18,18,22,0.85)' }}>
            <Icon size={16} className={`${color} mx-auto mb-1`} />
            <p className="text-xl font-black text-zinc-100">{value}</p>
            <p className="text-[10px] text-zinc-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-1 mb-4">
        {[
          { id: 'due', label: `Tekrar Edilecek (${dueItems.length})` },
          { id: 'all', label: `Tümü (${hataDefteriItems.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab === id && (
              <motion.div layoutId="hdTabActive" className="absolute inset-0 rounded-xl bg-violet-600" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {/* Subject filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setFilterSubject(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
              filterSubject === s
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Items */}
      <AnimatePresence mode="popLayout">
        {displayItems.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16 text-zinc-600"
          >
            {tab === 'due'
              ? <><Flame size={32} className="text-emerald-600" /><p className="text-sm">Tebrikler! Bugün tekrar edilecek hata yok.</p></>
              : <><BookOpen size={32} /><p className="text-sm">Henüz hata eklenmedi. İlk hatanı ekle!</p></>
            }
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayItems.map(item => (
              <ReviewCard
                key={item.id}
                item={item}
                onReview={reviewHataDefteri}
                onDelete={deleteHataDefteri}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <AddItemModal onClose={() => setShowAdd(false)} onSave={addHataDefteri} />
        )}
      </AnimatePresence>
    </div>
  );
}
