import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Search, Copy, Check, Users, X, Loader2, UserX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  generateInviteLink,
  searchUserByEmail,
  sendFriendRequest,
  removeFriendship,
  fetchFriendships,
} from '../services/friendService';

export default function Friends() {
  const { user } = useAuth();
  const { friends, addFriend, removeFriend } = useApp();
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [firestoreFriends, setFirestoreFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const inviteLink = user ? generateInviteLink(user.uid) : '';

  // Firestore'dan arkadaşları getir
  useEffect(() => {
    if (!user) return;
    fetchFriendships(user.uid)
      .then(setFirestoreFriends)
      .catch(() => {})
      .finally(() => setLoadingFriends(false));
  }, [user]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError('');
    try {
      const result = await searchUserByEmail(email);
      if (!result) {
        setSearchError('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
      } else if (result.uid === user?.uid) {
        setSearchError('Kendinizi ekleyemezsiniz.');
      } else {
        setSearchResult(result);
      }
    } catch {
      setSearchError('Arama sırasında bir hata oluştu.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult || !user) return;
    setSending(true);
    try {
      await sendFriendRequest(user.uid, user.displayName || 'Kullanıcı', searchResult.uid, searchResult.displayName);
      addFriend({ uid: searchResult.uid, displayName: searchResult.displayName, status: 'pending' });
      setFirestoreFriends(prev => [...prev, { uid: searchResult.uid, displayName: searchResult.displayName, status: 'pending' }]);
      showToast(`${searchResult.displayName} adına arkadaşlık isteği gönderildi!`);
      setSearchResult(null);
      setEmail('');
    } catch {
      showToast('Hata oluştu, tekrar dene.');
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (friendUid, friendDisplayName) => {
    if (!user) return;
    try {
      await removeFriendship(user.uid, friendUid);
      setFirestoreFriends(prev => prev.filter(f => f.uid !== friendUid));
      removeFriend(friendUid);
      showToast(`${friendDisplayName} arkadaş listesinden çıkarıldı.`);
    } catch {
      showToast('Hata oluştu.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      showToast('Davet linki kopyalandı!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Kopyalanamadı, manuel seç ve kopyala.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <Users size={18} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Arkadaşlar</h1>
          <p className="text-xs text-zinc-500">Email ile arkadaş ara veya davet linki paylaş</p>
        </div>
      </motion.div>

      {/* Email Arama */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Mail size={12} /> Email ile Ara
        </p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-zinc-950 border border-zinc-800 focus-within:border-violet-500/60 rounded-xl px-3 py-2.5 transition-all">
            <Mail size={14} className="text-zinc-600 shrink-0" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setSearchResult(null); setSearchError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ornek@gmail.com"
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
            />
          </div>
          <motion.button
            onClick={handleSearch}
            disabled={!email.trim() || searching}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5"
          >
            {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Ara
          </motion.button>
        </div>

        {/* Arama Sonucu */}
        <AnimatePresence>
          {searchError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 mt-2 ml-1">{searchError}</motion.p>
          )}
          {searchResult && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 flex items-center justify-between bg-zinc-950 border border-violet-500/30 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{searchResult.displayName}</p>
                <p className="text-xs text-zinc-500">{searchResult.email}</p>
              </div>
              <motion.button
                onClick={handleAddFriend}
                disabled={sending}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                {sending ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                Ekle
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Davet Linki */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <UserPlus size={12} /> Davet Linki ile Ekle
        </p>
        <p className="text-xs text-zinc-500 mb-3">Arkadaşın bu linke tıkladığında sizi otomatik arkadaş olarak ekler.</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-500 truncate select-all">
            {inviteLink}
          </div>
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              copied ? 'bg-green-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </motion.button>
        </div>
      </motion.div>

      {/* Arkadaş Listesi */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Users size={12} /> Arkadaşlarım ({firestoreFriends.length})
        </p>

        {loadingFriends ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="text-violet-500 animate-spin" />
          </div>
        ) : firestoreFriends.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            Henüz arkadaş yok. Yukarıdan davet et! 🎯
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {firestoreFriends.map((f, i) => (
              <motion.div
                key={f.uid || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400">
                    {(f.displayName || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{f.displayName}</p>
                    {f.status === 'pending' && (
                      <p className="text-[10px] text-yellow-500">İstek gönderildi</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(f.uid, f.displayName)}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Arkadaşlıktan çıkar"
                >
                  <UserX size={15} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-2.5 rounded-xl shadow-xl z-50 whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
