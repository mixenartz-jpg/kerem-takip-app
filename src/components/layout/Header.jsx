import { Search, LogOut, Users, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import FriendPanel from '../friends/FriendPanel';

export default function Header({ onSearchOpen, title, onMenuOpen }) {
  const today = format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr });
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [friendPanelOpen, setFriendPanelOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'K';

  return (
    <header className="relative z-30 h-14 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 flex items-center px-4 md:px-6 gap-3 shrink-0">
      {/* Hamburger — her ekran boyutunda görünür */}
      <button
        onClick={onMenuOpen}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all shrink-0"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-zinc-100 truncate">{title}</h2>
        <p className="text-xs text-zinc-500 capitalize hidden sm:block">{today}</p>
      </div>

      <button
        onClick={onSearchOpen}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <Search size={14} />
        <span className="hidden sm:inline text-xs">Ara...</span>
        <kbd className="hidden md:inline text-xs bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-500">⌘K</kbd>
      </button>

      {/* User avatar + dropdown */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold hover:bg-violet-500 transition-colors shrink-0"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : initials}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setMenuOpen(false); setFriendPanelOpen(false); }}
              />
              <motion.div
                className="absolute right-0 top-10 z-40 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-sm font-medium text-zinc-100 truncate">
                    {user?.displayName || 'Kullanıcı'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); setFriendPanelOpen(o => !o); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                >
                  <Users size={15} />
                  Arkadaşlarım
                </button>
                <button
                  onClick={async () => { setMenuOpen(false); await logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Çıkış Yap
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {friendPanelOpen && (
            <FriendPanel onClose={() => setFriendPanelOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
