import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClipboardList, Plus, Trash2, Edit2, MapPin, Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';

const STATUS_COLORS = {
  'başlamadı': { bg: 'bg-zinc-700/50', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  'devam ediyor': { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  'hazır': { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
};

function countdown(dateStr) {
  const diff = differenceInDays(parseISO(dateStr), new Date());
  if (diff < 0) return null;
  if (diff === 0) return { label: 'Bugün!', urgent: true };
  if (diff === 1) return { label: '1 gün kaldı', urgent: true };
  return { label: `${diff} gün kaldı`, urgent: diff <= 7 };
}

export default function Exams() {
  const { exams, lessons, addExam, updateExam, deleteExam } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [form, setForm] = useState({ title: '', lessonId: '', date: '', time: '', location: '', preparationStatus: 'başlamadı', notes: '' });

  const upcoming = exams.filter(e => !isPast(parseISO(e.date + 'T23:59'))).sort((a, b) => a.date.localeCompare(b.date));
  const past = exams.filter(e => isPast(parseISO(e.date + 'T23:59'))).sort((a, b) => b.date.localeCompare(a.date));
  const thisWeek = upcoming.filter(e => differenceInDays(parseISO(e.date), new Date()) <= 7);
  const ready = exams.filter(e => e.preparationStatus === 'hazır');

  const openAdd = () => {
    setEditExam(null);
    setForm({ title: '', lessonId: '', date: '', time: '', location: '', preparationStatus: 'başlamadı', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (exam) => {
    setEditExam(exam);
    setForm({ title: exam.title, lessonId: exam.lessonId || '', date: exam.date, time: exam.time || '', location: exam.location || '', preparationStatus: exam.preparationStatus, notes: exam.notes || '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    if (editExam) updateExam(editExam.id, form);
    else addExam(form);
    setModalOpen(false);
  };

  const ExamCard = ({ exam }) => {
    const cd = countdown(exam.date);
    const status = STATUS_COLORS[exam.preparationStatus] || STATUS_COLORS['başlamadı'];
    const linkedLesson = lessons.find(l => l.id === exam.lessonId);
    return (
      <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-sm font-semibold text-zinc-100 truncate">{exam.title}</h3>
              {cd && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cd.urgent ? 'bg-red-500/15 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {cd.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Calendar size={12} />
                {format(parseISO(exam.date), 'dd MMM yyyy', { locale: tr })}
                {exam.time && ` · ${exam.time}`}
              </span>
              {exam.location && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin size={12} />
                  {exam.location}
                </span>
              )}
              {linkedLesson && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>{linkedLesson.icon}</span>
                  {linkedLesson.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={exam.preparationStatus}
                onChange={e => updateExam(exam.id, { preparationStatus: e.target.value })}
                className={`text-xs px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${status.bg} ${status.text}`}
              >
                <option value="başlamadı">Başlamadı</option>
                <option value="devam ediyor">Devam Ediyor</option>
                <option value="hazır">Hazır</option>
              </select>
            </div>

            {exam.notes && <p className="text-xs text-zinc-600 mt-2 line-clamp-2">{exam.notes}</p>}
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => openEdit(exam)} className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
              <Edit2 size={13} />
            </button>
            <button onClick={() => deleteExam(exam.id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Sınav Takvimi</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Yaklaşan sınavlarını ve hazırlık durumunu takip et</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus size={16} />
          Yeni Sınav
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Yaklaşan Sınavlar</p>
          <p className="text-2xl font-bold text-zinc-100">{upcoming.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Bu Hafta</p>
          <p className="text-2xl font-bold text-red-400">{thisWeek.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 mb-1">Hazır</p>
          <p className="text-2xl font-bold text-green-400">{ready.length}</p>
        </div>
      </div>

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Yaklaşan Sınavlar</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <ClipboardList size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Yaklaşan sınav yok</p>
            <button onClick={openAdd} className="mt-2 text-violet-400 hover:text-violet-300 text-sm">Sınav ekle →</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map(exam => <ExamCard key={exam.id} exam={exam} />)}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-600 uppercase tracking-wider mb-3">Geçmiş Sınavlar</h2>
          <div className="flex flex-col gap-3 opacity-60">
            {past.map(exam => <ExamCard key={exam.id} exam={exam} />)}
          </div>
        </section>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editExam ? 'Sınavı Düzenle' : 'Yeni Sınav'} size="md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Sınav Adı</label>
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Matematik Final..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Tarih</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Saat</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Konum</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Sınıf 101..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">İlgili Ders</label>
              <select
                value={form.lessonId}
                onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">— Seç —</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.icon} {l.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Hazırlık Durumu</label>
            <select
              value={form.preparationStatus}
              onChange={e => setForm(f => ({ ...f, preparationStatus: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors"
            >
              <option value="başlamadı">Başlamadı</option>
              <option value="devam ediyor">Devam Ediyor</option>
              <option value="hazır">Hazır</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Notlar</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Kapsam, notlar..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors">
              İptal
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
              {editExam ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
