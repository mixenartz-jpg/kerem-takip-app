import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Plus, Trash2, Clock, CheckCircle2, Circle, ChevronDown, ChevronUp, Edit2, X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];
const ICONS = ['📚', '📐', '🔬', '🌍', '🎨', '💻', '🎵', '📝', '🧮', '⚗️', '🏛️', '🌿'];

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function Lessons() {
  const { lessons, addLesson, updateLesson, deleteLesson, toggleChapter } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [detailLesson, setDetailLesson] = useState(null);
  const [expandedIds, setExpandedIds] = useState({});

  // form state
  const [form, setForm] = useState({ name: '', icon: '📚', color: '#8b5cf6', targetHours: 10, studyHours: 0 });
  const [chapters, setChapters] = useState([]);
  const [chapterInput, setChapterInput] = useState('');

  const totalHours = lessons.reduce((s, l) => s + (l.studyHours || 0), 0);
  const totalChapters = lessons.reduce((s, l) => s + (l.chapters?.length || 0), 0);
  const completedChapters = lessons.reduce((s, l) => s + (l.chapters?.filter(c => c.completed).length || 0), 0);

  const openAdd = () => {
    setEditLesson(null);
    setForm({ name: '', icon: '📚', color: '#8b5cf6', targetHours: 10, studyHours: 0 });
    setChapters([]);
    setChapterInput('');
    setModalOpen(true);
  };

  const openEdit = (lesson) => {
    setEditLesson(lesson);
    setForm({ name: lesson.name, icon: lesson.icon, color: lesson.color, targetHours: lesson.targetHours, studyHours: lesson.studyHours });
    setChapters(lesson.chapters || []);
    setChapterInput('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editLesson) {
      updateLesson(editLesson.id, { ...form, chapters });
    } else {
      addLesson({ ...form, chapters });
    }
    setModalOpen(false);
  };

  const addChapter = () => {
    if (!chapterInput.trim()) return;
    setChapters(prev => [...prev, { id: genId(), title: chapterInput.trim(), completed: false }]);
    setChapterInput('');
  };

  const removeChapter = (id) => setChapters(prev => prev.filter(c => c.id !== id));

  const toggleExpand = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  const progressPct = (lesson) => {
    const total = lesson.chapters?.length || 0;
    if (total === 0) return 0;
    return Math.round((lesson.chapters.filter(c => c.completed).length / total) * 100);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Dersler</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Ders ilerlemeni ve çalışma saatlerini takip et</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus size={16} />
          Yeni Ders
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Toplam Ders</p>
          <p className="text-2xl font-bold text-zinc-100">{lessons.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Toplam Çalışma</p>
          <p className="text-2xl font-bold text-zinc-100">{totalHours}<span className="text-sm font-normal text-zinc-400 ml-1">saat</span></p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Tamamlanan Konular</p>
          <p className="text-2xl font-bold text-zinc-100">{completedChapters}<span className="text-sm font-normal text-zinc-400 ml-1">/ {totalChapters}</span></p>
        </div>
      </div>

      {/* Lessons grid */}
      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <BookOpen size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Henüz ders eklenmedi</p>
          <button onClick={openAdd} className="mt-3 text-violet-400 hover:text-violet-300 text-sm">
            İlk dersini ekle →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map(lesson => {
            const pct = progressPct(lesson);
            const done = lesson.chapters?.filter(c => c.completed).length || 0;
            const total = lesson.chapters?.length || 0;
            const expanded = expandedIds[lesson.id];
            return (
              <div
                key={lesson.id}
                className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors flex flex-col gap-3"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: lesson.color + '22', border: `1px solid ${lesson.color}44` }}>
                      {lesson.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{lesson.name}</p>
                      <p className="text-xs text-zinc-500">{lesson.studyHours || 0} / {lesson.targetHours} saat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(lesson)} className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteLesson(lesson.id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">İlerleme</span>
                    <span className="text-xs font-medium" style={{ color: lesson.color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: lesson.color }} />
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">{done} / {total} konu tamamlandı</p>
                </div>

                {/* Chapters */}
                {total > 0 && (
                  <div>
                    <button
                      onClick={() => toggleExpand(lesson.id)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {expanded ? 'Konuları gizle' : 'Konuları göster'}
                    </button>
                    {expanded && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {lesson.chapters.map(ch => (
                          <button
                            key={ch.id}
                            onClick={() => toggleChapter(lesson.id, ch.id)}
                            className="flex items-center gap-2 text-xs text-left transition-colors group"
                          >
                            {ch.completed
                              ? <CheckCircle2 size={14} style={{ color: lesson.color }} className="shrink-0" />
                              : <Circle size={14} className="shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            }
                            <span className={ch.completed ? 'line-through text-zinc-600' : 'text-zinc-400'}>{ch.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editLesson ? 'Dersi Düzenle' : 'Yeni Ders'}
        size="md"
      >
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Ders Adı</label>
            <input
              autoFocus
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Matematik, Fizik..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Icon + Color row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">İkon</label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${form.icon === ic ? 'bg-violet-600/30 ring-1 ring-violet-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Renk</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Hedef Saat</label>
              <input
                type="number"
                min="0"
                value={form.targetHours}
                onChange={e => setForm(f => ({ ...f, targetHours: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Çalışılan Saat</label>
              <input
                type="number"
                min="0"
                value={form.studyHours}
                onChange={e => setForm(f => ({ ...f, studyHours: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Chapters */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Konular</label>
            <div className="flex gap-2 mb-2">
              <input
                value={chapterInput}
                onChange={e => setChapterInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChapter()}
                placeholder="Konu adı..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
              <button onClick={addChapter} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            {chapters.length > 0 && (
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {chapters.map(ch => (
                  <div key={ch.id} className="flex items-center justify-between px-2 py-1.5 bg-zinc-800 rounded-lg">
                    <span className="text-xs text-zinc-300">{ch.title}</span>
                    <button onClick={() => removeChapter(ch.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
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
              {editLesson ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
