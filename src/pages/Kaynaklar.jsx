import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked, BookOpen, Plus, Trash2, Edit2, X,
  Video, FileText, Globe, StickyNote, ExternalLink, Link2,
  BarChart3, CheckCircle2, Clock, Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const KAYNAK_DERSLER = [
  'TYT Türkçe', 'TYT Matematik', 'TYT Fen Bilimleri', 'TYT Sosyal Bilimler',
  'AYT Matematik', 'AYT Fizik', 'AYT Kimya', 'AYT Biyoloji',
  'AYT Edebiyat', 'AYT Tarih', 'AYT Coğrafya', 'Diğer',
];

const KAYNAK_TURLERI = [
  { id: 'kitap',  label: 'Kitap',   icon: BookOpen,    color: '#f59e0b' },
  { id: 'video',  label: 'Video',   icon: Video,       color: '#ef4444' },
  { id: 'pdf',    label: 'PDF',     icon: FileText,    color: '#3b82f6' },
  { id: 'web',    label: 'Website', icon: Globe,       color: '#10b981' },
  { id: 'not',    label: 'Not',     icon: StickyNote,  color: '#a78bfa' },
  { id: 'diger',  label: 'Diğer',   icon: BookMarked,  color: '#6b7280' },
];

const KAYNAK_DURUM = [
  { id: 'baslamamadi', label: 'Başlamadı',     color: '#6b7280', bg: 'bg-zinc-700/40 text-zinc-400' },
  { id: 'devam',       label: 'Devam Ediyor',  color: '#3b82f6', bg: 'bg-blue-500/15 text-blue-400' },
  { id: 'tamamlandi',  label: 'Tamamlandı',    color: '#10b981', bg: 'bg-emerald-500/15 text-emerald-400' },
];

const EMPTY_FORM = {
  ders: 'TYT Matematik', konu: '', kaynakAdi: '', tur: 'kitap',
  videoLink: '', yazar: '', notlar: '', durum: 'baslamamadi',
};

/* ── Add / Edit Modal ── */
function KaynaklarModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ? { ...EMPTY_FORM, ...initial } : { ...EMPTY_FORM });
  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const isValid = form.kaynakAdi.trim() && form.ders;

  return (
    <motion.div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <BookMarked size={13} className="text-white" />
            </div>
            <h3 className="font-semibold text-zinc-100">
              {initial ? 'Kaynağı Düzenle' : 'Yeni Kaynak Ekle'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Ders + Konu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Ders *</label>
              <select value={form.ders} onChange={e => f('ders', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60">
                {KAYNAK_DERSLER.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Konu</label>
              <input value={form.konu} onChange={e => f('konu', e.target.value)}
                placeholder="Örn: Türev, Kuvvet..."
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60" />
            </div>
          </div>

          {/* Kaynak Adı */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Kaynak Adı *</label>
            <input autoFocus value={form.kaynakAdi} onChange={e => f('kaynakAdi', e.target.value)}
              placeholder="Ör: Palme Matematik, Kamil Hoca Fizik..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60" />
          </div>

          {/* Tür */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Kaynak Türü</label>
            <div className="grid grid-cols-3 gap-2">
              {KAYNAK_TURLERI.map(({ id, label, icon: Icon, color }) => (
                <button key={id} onClick={() => f('tur', id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.tur === id ? 'border-transparent text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                  }`}
                  style={form.tur === id ? { background: color + '30', borderColor: color + '60', color } : {}}>
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Yazar */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Yazar / Hoca (opsiyonel)</label>
            <input value={form.yazar} onChange={e => f('yazar', e.target.value)}
              placeholder="Ör: Kamil Hoca, Birey Yayınları..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60" />
          </div>

          {/* Video / Web Linki */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">
              <span className="flex items-center gap-1"><Link2 size={10} /> Video / Web Linki (opsiyonel)</span>
            </label>
            <input value={form.videoLink} onChange={e => f('videoLink', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60 font-mono" />
          </div>

          {/* Durum */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Durum</label>
            <div className="flex gap-2">
              {KAYNAK_DURUM.map(({ id, label, color }) => (
                <button key={id} onClick={() => f('durum', id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.durum === id ? 'text-white border-transparent' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                  style={form.durum === id ? { background: color + '25', borderColor: color + '60', color } : {}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notlar */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Notlar (opsiyonel)</label>
            <textarea value={form.notlar} onChange={e => f('notlar', e.target.value)} rows={3}
              placeholder="Sayfa aralığı, öneriler, kendi yorumun..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60 resize-none" />
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800 sticky bottom-0 bg-zinc-950">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all">
            İptal
          </button>
          <button onClick={() => { onSave(form); onClose(); }} disabled={!isValid}
            className="flex-1 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl font-medium transition-all">
            {initial ? 'Kaydet' : 'Ekle'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Resource Card ── */
function KaynaklarCard({ item, onEdit, onDelete, onStatusChange }) {
  const turInfo = KAYNAK_TURLERI.find(t => t.id === item.tur) || KAYNAK_TURLERI[5];
  const durumInfo = KAYNAK_DURUM.find(d => d.id === item.durum) || KAYNAK_DURUM[0];
  const TurIcon = turInfo.icon;

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="relative rounded-2xl border border-zinc-800/70 overflow-hidden group"
      style={{ background: 'rgba(18,18,22,0.9)', backdropFilter: 'blur(16px)' }}
    >
      <div className="h-0.5 w-full" style={{ background: turInfo.color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${durumInfo.bg}`}>
              {durumInfo.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-800/60">
              <TurIcon size={9} style={{ color: turInfo.color }} />
              {turInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(item)}
              className="p-1.5 text-zinc-600 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-all">
              <Edit2 size={12} />
            </button>
            <button onClick={() => onDelete(item.id)}
              className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <p className="text-sm font-semibold text-zinc-100 mb-1 leading-snug">{item.kaynakAdi}</p>

        <p className="text-xs mb-2">
          <span style={{ color: turInfo.color + 'cc' }}>{item.ders}</span>
          {item.konu && <span className="text-zinc-600"> · {item.konu}</span>}
        </p>

        {item.yazar && (
          <p className="text-xs text-zinc-600 mb-2">{item.yazar}</p>
        )}

        {item.notlar && (
          <p className="text-xs text-zinc-500 leading-relaxed mb-2 line-clamp-2 bg-zinc-900/50 rounded-lg px-2.5 py-1.5">
            {item.notlar}
          </p>
        )}

        {item.videoLink && (
          <a href={item.videoLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1"
            onClick={e => e.stopPropagation()}>
            <ExternalLink size={11} />
            <span className="truncate">{item.videoLink.replace(/^https?:\/\/(www\.)?/, '')}</span>
          </a>
        )}

        <div className="flex gap-1.5 mt-3 pt-3 border-t border-zinc-800/60">
          {KAYNAK_DURUM.map(({ id, label, color }) => (
            <button key={id} onClick={() => onStatusChange(item.id, id)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                item.durum === id ? 'text-white' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'
              }`}
              style={item.durum === id ? { background: color + '30', color } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function Kaynaklar() {
  const { yksResources, addYKSResource, updateYKSResource, deleteYKSResource } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterDers, setFilterDers] = useState('Tümü');
  const [filterDurum, setFilterDurum] = useState('tumu');
  const [filterTur, setFilterTur] = useState('tumu');
  const [search, setSearch] = useState('');

  const dersler = useMemo(
    () => ['Tümü', ...new Set(yksResources.map(r => r.ders))],
    [yksResources]
  );

  const filtered = useMemo(() => yksResources.filter(r => {
    if (filterDers !== 'Tümü' && r.ders !== filterDers) return false;
    if (filterDurum !== 'tumu' && r.durum !== filterDurum) return false;
    if (filterTur !== 'tumu' && r.tur !== filterTur) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.kaynakAdi.toLowerCase().includes(q) ||
        r.konu?.toLowerCase().includes(q) ||
        r.yazar?.toLowerCase().includes(q)
      );
    }
    return true;
  }), [yksResources, filterDers, filterDurum, filterTur, search]);

  const stats = useMemo(() => ({
    toplam: yksResources.length,
    tamamlandi: yksResources.filter(r => r.durum === 'tamamlandi').length,
    devam: yksResources.filter(r => r.durum === 'devam').length,
    baslamamadi: yksResources.filter(r => r.durum === 'baslamamadi').length,
  }), [yksResources]);

  const handleSave = (form) => {
    if (editItem) updateYKSResource(editItem.id, form);
    else addYKSResource(form);
    setEditItem(null);
  };

  const openEdit = (item) => { setEditItem(item); setShowModal(true); };
  const openAdd  = ()     => { setEditItem(null); setShowModal(true); };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
            animate={{ boxShadow: ['0 0 10px rgba(124,58,237,0.3)', '0 0 25px rgba(124,58,237,0.5)', '0 0 10px rgba(124,58,237,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BookMarked size={18} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Çalışma Kaynakları</h1>
            <p className="text-xs text-zinc-500">Kitap, video, PDF ve kaynaklarını takip et</p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Toplam Kaynak', value: stats.toplam,      icon: BarChart3,      color: '#7c3aed' },
          { label: 'Başlamadı',    value: stats.baslamamadi,  icon: Clock,          color: '#6b7280' },
          { label: 'Devam Ediyor', value: stats.devam,        icon: BookOpen,       color: '#3b82f6' },
          { label: 'Tamamlandı',   value: stats.tamamlandi,   icon: CheckCircle2,   color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800/60 p-4"
            style={{ background: 'rgba(18,18,22,0.85)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} style={{ color }} />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Add button */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Kaynak, konu veya yazar ara..."
            className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-violet-500/60" />
        </div>
        <motion.button onClick={openAdd}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0">
          <Plus size={14} /> Kaynak Ekle
        </motion.button>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {dersler.map(d => (
            <button key={d} onClick={() => setFilterDers(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                filterDers === d ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
              }`}>
              {d}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Durum filter */}
          <div className="flex gap-0.5 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-0.5">
            <button onClick={() => setFilterDurum('tumu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDurum === 'tumu' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              Tüm Durum
            </button>
            {KAYNAK_DURUM.map(({ id, label }) => (
              <button key={id} onClick={() => setFilterDurum(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDurum === id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Tür filter */}
          <div className="flex gap-0.5 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-0.5">
            <button onClick={() => setFilterTur('tumu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterTur === 'tumu' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              Tür
            </button>
            {KAYNAK_TURLERI.map(({ id, label }) => (
              <button key={id} onClick={() => setFilterTur(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterTur === id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-20 text-zinc-600">
            <BookMarked size={36} />
            <p className="text-sm">
              {yksResources.length === 0
                ? 'Henüz kaynak eklenmedi. İlk kaynağını ekle!'
                : 'Filtreye uygun kaynak bulunamadı.'}
            </p>
            {yksResources.length === 0 && (
              <motion.button onClick={openAdd} whileHover={{ scale: 1.03 }}
                className="mt-2 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                <Plus size={14} /> İlk Kaynağı Ekle
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(item => (
              <KaynaklarCard
                key={item.id}
                item={item}
                onEdit={openEdit}
                onDelete={deleteYKSResource}
                onStatusChange={(id, durum) => updateYKSResource(id, { durum })}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <KaynaklarModal
            onClose={() => { setShowModal(false); setEditItem(null); }}
            onSave={handleSave}
            initial={editItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
