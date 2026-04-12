import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import AdminPanel from './AdminPanel';

const ADMIN_PASSWORD = '4815926f';
const SESSION_KEY = 'gt-admin-auth';

export default function AdminGate() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!authed) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [authed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 3000);
    }
  };

  if (authed) {
    return <AdminPanel onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }} />;
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
            <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">Erişim</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
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
                  Hatalı şifre
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!password}
              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-medium rounded-xl py-3 text-sm transition-all border border-white/5"
            >
              Devam
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
