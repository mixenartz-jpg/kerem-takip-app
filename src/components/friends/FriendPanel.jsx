import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Check, UserMinus, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateInviteLink, removeFriendship } from '../../services/friendService';
import { getLeague } from '../../utils/leagueUtils';

export default function FriendPanel({ onClose }) {
  const { friends, removeFriend } = useApp();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = generateInviteLink(user?.uid);
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleRemove = async (friend) => {
    try {
      await removeFriendship(user?.uid, friend.uid);
      removeFriend(friend.id);
    } catch { /* ignore */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      className="absolute top-12 right-0 w-72 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-violet-400" />
          <span className="text-sm font-semibold text-zinc-200">Arkadaşlarım</span>
        </div>
        <button onClick={onClose} className="p-1 text-zinc-600 hover:text-zinc-300 rounded-lg transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Invite */}
      <div className="px-4 py-3 border-b border-zinc-800/60">
        <p className="text-xs text-zinc-500 mb-2">Arkadaşlarını davet et:</p>
        <button
          onClick={handleCopyLink}
          className={`w-full flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-xl border transition-all ${
            copied
              ? 'text-green-400 border-green-500/30 bg-green-500/10'
              : 'text-violet-300 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15'
          }`}
        >
          {copied ? <Check size={13} /> : <Link2 size={13} />}
          {copied ? 'Kopyalandı!' : 'Davet Linkini Kopyala'}
        </button>
      </div>

      {/* Friends list */}
      <div className="px-4 py-3 max-h-64 overflow-y-auto">
        {(!friends || friends.length === 0) ? (
          <p className="text-xs text-zinc-600 text-center py-4">
            Henüz arkadaş yok. Linki paylaş!
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {friends.map(f => {
              const league = getLeague((f.tytNet || 0) + (f.aytNet || 0));
              return (
                <div key={f.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-900 group transition-all">
                  <span className="text-base">{league.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{f.displayName}</p>
                    <p className="text-[10px] text-zinc-600">{league.label}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(f)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-400 rounded transition-all"
                    title="Arkadaşlıktan çıkar"
                  >
                    <UserMinus size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
