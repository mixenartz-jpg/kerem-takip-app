import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import AdminPanel from './AdminPanel';

const ADMIN_UIDS = (import.meta.env.VITE_ADMIN_UIDS || '').split(',').filter(Boolean);

export default function AdminGate() {
  const { user, loading: authLoading, logout } = useAuth();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || authed) return;
    const checkAdmin = async () => {
      setChecking(true);
      setError('');
      try {
        const uid = user.uid;

        if (ADMIN_UIDS.length > 0 && !ADMIN_UIDS.includes(uid)) {
          throw new Error('Bu hesabın admin yetkisi yok.');
        }

        const snap = await getDoc(doc(db, 'admins', uid));
        if (!snap.exists()) {
          throw new Error('Bu hesabın admin yetkisi yok.');
        }

        setAuthed(true);
      } catch (err) {
        setError(err.message || 'Erişim reddedildi.');
      } finally {
        setChecking(false);
      }
    };
    checkAdmin();
  }, [user, authed]);

  if (authed) {
    return <AdminPanel onLogout={() => { logout(); setAuthed(false); }} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl shadow-black/60 w-full max-w-xs text-center"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center mb-4">
            {authLoading || checking
              ? <Loader2 size={20} className="text-zinc-400 animate-spin" />
              : <Lock size={20} className="text-zinc-400" />}
          </div>
          <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">Admin Erişimi</h2>
        </div>

        {authLoading || checking ? (
          <p className="text-xs text-zinc-500">Yetki kontrol ediliyor...</p>
        ) : !user ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-500">Admin paneline erişmek için önce giriş yapmalısın.</p>
            <a
              href="/login"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl py-3 text-sm transition-all border border-white/5 block"
            >
              Giriş Yap
            </a>
          </div>
        ) : (
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                <p className="text-red-400 text-xs">{error}</p>
                <p className="text-zinc-600 text-xs">{user.email}</p>
                <button
                  onClick={() => logout()}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-medium rounded-xl py-2.5 text-sm transition-all border border-white/5"
                >
                  Farklı Hesapla Giriş Yap
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
