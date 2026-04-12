import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, BellOff, BellRing, Clock } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleReminder,
  cancelReminder,
} from '../services/reminderService';

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
        <Bell size={22} className="text-zinc-600" />
      </div>
      <p className="text-sm text-zinc-600 text-center">Henüz hatırlatma yok.<br />Yeni bir tane ekle!</p>
    </div>
  );
}

export default function Reminders() {
  const { reminders, addReminder, deleteReminder } = useApp();
  const [permission, setPermission] = useState(getNotificationPermission);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');

  const handlePermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleAdd = () => {
    if (!title.trim() || !datetime) return;
    const newReminder = { id: crypto.randomUUID(), title: title.trim(), datetime };
    addReminder(newReminder);
    scheduleReminder(newReminder);
    setTitle('');
    setDatetime('');
    setShowForm(false);
  };

  const handleDelete = (r) => {
    cancelReminder(r.id);
    deleteReminder(r.id);
  };

  const upcoming = (reminders || [])
    .filter(r => !isPast(new Date(r.datetime)))
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const past = (reminders || [])
    .filter(r => isPast(new Date(r.datetime)))
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Hatırlatmalar</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{upcoming.length} bekleyen hatırlatma</p>
        </div>
        <button
          onClick={() => setShowForm(o => !o)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl px-3 py-2 transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Yeni</span>
        </button>
      </div>

      {/* Notification permission banner */}
      {permission !== 'granted' && permission !== 'unsupported' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3"
        >
          <BellOff size={16} className="text-amber-400 shrink-0" />
          <p className="flex-1 text-xs text-amber-300">
            Tarayıcı bildirimleri kapalı. Hatırlatmalar çalışmaz.
          </p>
          <button
            onClick={handlePermission}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
          >
            İzin Ver
          </button>
        </motion.div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-zinc-200">Yeni Hatırlatma</p>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Hatırlatma başlığı..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500 transition-colors"
              />
              <input
                type="datetime-local"
                value={datetime}
                onChange={e => setDatetime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!title.trim() || !datetime}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
                >
                  Ekle
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm rounded-xl transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming */}
      {upcoming.length === 0 && past.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-2">Bekleyen</p>
              <div className="space-y-2">
                <AnimatePresence>
                  {upcoming.map(r => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <BellRing size={14} className="text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-medium truncate">{r.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-zinc-600" />
                          <p className="text-[11px] text-zinc-500">
                            {format(parseISO(r.datetime), 'dd MMM yyyy, HH:mm', { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(r)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-2">Geçmiş</p>
              <div className="space-y-1.5 opacity-50">
                {past.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl px-4 py-2.5 group">
                    <Bell size={13} className="text-zinc-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500 truncate line-through">{r.title}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(r)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-400 rounded transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
