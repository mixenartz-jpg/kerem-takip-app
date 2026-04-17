import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import AdminPanel from './AdminPanel';

const ADMIN_UIDS = (import.meta.env.VITE_ADMIN_UIDS || '').split(',').filter(Boolean);

export default function AdminGate() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    if (!authed) {
      setTimeout(() => emailRef.current?.focus(), 300);
    }
  }, [authed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      if (ADMIN_UIDS.length > 0 && !ADMIN_UIDS.includes(uid)) {
        await auth.signOut();
        throw new Error('Bu hesabın admin yetkisi yok.');
      }

      const snap = await getDoc(doc(db, 'admins', uid));
      if (!snap.exists()) {
        await auth.signOut();
        throw new Error('Bu hesabın admin yetkisi yok.');
      }

      setAuthed(true);
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found'
        ? 'E-posta veya şifre hatalı.'
        : (err.message || 'Giriş başarısız.');
      setError(msg);
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  if (authed) {
    return <AdminPanel onLogout={() => { auth.signOut(); setAuthed(false); }} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl shadow-black/60"
        >
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center mb-4">
              <Lock size={20} className="text-zinc-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">Admin Erişimi</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="E-posta"
              autoComplete="email"
              required
              className="w-full bg-zinc-800/60 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
            />
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-zinc-800/60 border border-white/5 rounded-xl px-4 py-3 pr-10 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!email || !password || loading}
              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-medium rounded-xl py-3 text-sm transition-all border border-white/5"
            >
              {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
