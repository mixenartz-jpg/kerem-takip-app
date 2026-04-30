import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Trophy, UserPlus, TrendingUp, Medal, Loader2, RefreshCw,
  Share2, Check, Copy, Mail, Search, UserX, AlertTriangle, X,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getLeague, getNetDelta } from '../utils/leagueUtils';
import {
  generateInviteLink,
  searchUserByEmail,
  sendFriendRequest,
  removeFriendship,
  fetchFriendships,
} from '../services/friendService';

/* ── Leaderboard row ── */
function ScoreRow({ entry, rank, isMe, showDelta }) {
  const total = (entry.tytNet || 0) + (entry.aytNet || 0);
  const league = getLeague(total);

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
        isMe ? 'bg-violet-600/10 border-violet-500/40' : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      <div className="w-7 text-center shrink-0">
        {rank === 1 ? <Trophy size={16} className="text-yellow-400 mx-auto" />
         : rank === 2 ? <Medal size={16} className="text-zinc-400 mx-auto" />
         : rank === 3 ? <Medal size={16} className="text-amber-600 mx-auto" />
         : <span className="text-xs font-bold text-zinc-600">{rank}</span>}
      </div>
      <span className="text-lg shrink-0" title={league.label}>{league.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isMe ? 'text-violet-300' : 'text-zinc-200'}`}>
          {entry.displayName || 'Anonim'}{isMe ? ' (Sen)' : ''}
        </p>
        <p className="text-xs text-zinc-600">{league.label}</p>
      </div>
      <div className="text-right shrink-0">
        {showDelta ? (
          <div className="flex items-center gap-1 text-green-400">
            <TrendingUp size={13} />
            <span className="text-sm font-bold">+{entry.delta}</span>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-zinc-100">{total} net</p>
            <p className="text-[10px] text-zinc-600">TYT {entry.tytNet || 0} · AYT {entry.aytNet || 0}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Leaderboard tab ── */
function SiralamaTab() {
  const { friends } = useApp();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchScores = async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'userScores'));
      setScores(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    } catch {
      setError('Sıralama yüklenemedi. Firestore kurallarını kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const friendUids = (friends || []).map(f => f.uid);
  const sorted = [...scores].sort((a, b) => ((b.tytNet || 0) + (b.aytNet || 0)) - ((a.tytNet || 0) + (a.aytNet || 0)));
  const climbers = [...scores].map(s => ({ ...s, delta: getNetDelta(s) })).filter(s => s.delta > 0).sort((a, b) => b.delta - a.delta);
  const friendScores = sorted.filter(s => friendUids.includes(s.uid) || s.uid === user?.uid);
  const displayList = tab === 0 ? sorted : tab === 1 ? climbers : friendScores;
  const TABS = ['Genel', 'Yükselenler', 'Arkadaşlarım'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-zinc-500">TYT + AYT net toplamına göre</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            const myScore = scores.find(s => s.uid === user?.uid);
            const rank = sorted.findIndex(s => s.uid === user?.uid) + 1;
            const text = myScore
              ? `YKS Hazırlık sıralamamda ${rank}. sıradayım! (${(myScore.tytNet || 0) + (myScore.aytNet || 0)} net) — Sen neredesin? ${window.location.origin}`
              : `YKS Hazırlık uygulamasındaki sıralamaya bak: ${window.location.origin}`;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }} className="p-2 text-zinc-600 hover:text-violet-400 hover:bg-zinc-800 rounded-xl transition-all">
            {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
          </button>
          <button onClick={fetchScores} disabled={loading} className="p-2 text-zinc-600 hover:text-violet-400 hover:bg-zinc-800 rounded-xl transition-all">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-5">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${tab === i ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {i === 1 ? <span className="flex items-center justify-center gap-1"><TrendingUp size={11} />{t}</span>
             : i === 2 ? <span className="flex items-center justify-center gap-1"><Users size={11} />{t}</span>
             : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="text-violet-500 animate-spin" /></div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">{error}</div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 text-sm">
          {tab === 2 ? <p>Henüz arkadaş yok. Arkadaşlar sekmesinden davet et!</p> : <p>Henüz veri yok.</p>}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            {displayList.map((entry, idx) => (
              <ScoreRow key={entry.uid} entry={entry} rank={idx + 1} isMe={entry.uid === user?.uid} showDelta={tab === 1} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/* ── Friends tab ── */
function ArkadaşlarTab() {
  const { user } = useAuth();
  const { friends, addFriend, removeFriend } = useApp();
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [firestoreError, setFirestoreError] = useState(false);
  const [firestoreFriends, setFirestoreFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const inviteLink = user ? generateInviteLink(user.uid) : '';

  useEffect(() => {
    if (!user) return;
    fetchFriendships(user.uid)
      .then(data => { setFirestoreFriends(data); setFirestoreError(false); })
      .catch(() => { setFirestoreError(true); setFirestoreFriends(friends || []); })
      .finally(() => setLoadingFriends(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!loadingFriends) {
      setFirestoreFriends(prev => {
        const existingUids = new Set(prev.map(f => f.uid));
        const newOnes = (friends || []).filter(f => !existingUids.has(f.uid));
        return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
      });
    }
  }, [friends, loadingFriends]);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError('');
    try {
      const result = await searchUserByEmail(email);
      if (!result) setSearchError('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
      else if (result.uid === user?.uid) setSearchError('Kendinizi ekleyemezsiniz.');
      else if (firestoreFriends.some(f => f.uid === result.uid)) setSearchError('Bu kullanıcı zaten arkadaş listende.');
      else setSearchResult(result);
    } catch (err) {
      const isPermission = err?.code === 'permission-denied';
      setSearchError(isPermission ? 'Firestore izni yok. Firebase Console\'dan kuralları güncelle.' : 'Arama sırasında bir hata oluştu.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult || !user) return;
    setSending(true);
    try {
      await sendFriendRequest(user.uid, user.displayName || 'Kullanıcı', searchResult.uid, searchResult.displayName);
      const newFriend = { uid: searchResult.uid, displayName: searchResult.displayName, status: 'pending' };
      addFriend(newFriend);
      setFirestoreFriends(prev => [...prev, newFriend]);
      showToast(`${searchResult.displayName} adına istek gönderildi!`);
      setSearchResult(null);
      setEmail('');
    } catch (err) {
      showToast(err?.code === 'permission-denied' ? 'Firestore izni yok!' : 'Hata oluştu, tekrar dene.');
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (friendUid, friendDisplayName) => {
    if (!user) return;
    try { await removeFriendship(user.uid, friendUid); } catch { /* silent */ }
    setFirestoreFriends(prev => prev.filter(f => f.uid !== friendUid));
    removeFriend(friendUid);
    showToast(`${friendDisplayName} listeden çıkarıldı.`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      showToast('Davet linki kopyalandı!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Kopyalanamadı.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {firestoreError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Firestore izni eksik</p>
            <p className="text-amber-400/70">Firebase Console › Firestore › Rules: <code className="bg-zinc-900 px-1 rounded">allow read, write: if request.auth != null;</code></p>
          </div>
        </motion.div>
      )}

      {/* Email Arama */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Mail size={12} /> Email ile Ara
        </p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-zinc-950 border border-zinc-800 focus-within:border-violet-500/60 rounded-xl px-3 py-2.5 transition-all">
            <Mail size={14} className="text-zinc-600 shrink-0" />
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); setSearchResult(null); setSearchError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ornek@gmail.com"
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none" />
          </div>
          <motion.button onClick={handleSearch} disabled={!email.trim() || searching}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5">
            {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Ara
          </motion.button>
        </div>
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
              <motion.button onClick={handleAddFriend} disabled={sending}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all">
                {sending ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                Ekle
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Davet Linki */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <UserPlus size={12} /> Davet Linki
        </p>
        <p className="text-xs text-zinc-500 mb-3">Arkadaşın linke tıkladığında otomatik arkadaş olursunuz.</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-500 truncate select-all">
            {inviteLink}
          </div>
          <motion.button onClick={handleCopy} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </motion.button>
        </div>
      </div>

      {/* Arkadaş Listesi */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Users size={12} /> Arkadaşlarım ({firestoreFriends.length})
        </p>
        {loadingFriends ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="text-violet-500 animate-spin" /></div>
        ) : firestoreFriends.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">Henüz arkadaş yok. Yukarıdan davet et! 🎯</div>
        ) : (
          <div className="flex flex-col gap-2">
            {firestoreFriends.map((f, i) => (
              <motion.div key={f.uid || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400">
                    {(f.displayName || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{f.displayName}</p>
                    {f.status === 'pending' && <p className="text-[10px] text-yellow-500">İstek gönderildi</p>}
                  </div>
                </div>
                <button onClick={() => handleRemove(f.uid, f.displayName)}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <UserX size={15} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-2.5 rounded-xl shadow-xl z-50 whitespace-nowrap">
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Davet tab (invite link landing) ── */
function DavetTab() {
  const { user } = useAuth();
  const inviteLink = user ? generateInviteLink(user.uid) : '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* silent */ }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <UserPlus size={26} className="text-violet-400" />
        </motion.div>
        <h2 className="text-lg font-bold text-zinc-100 mb-2">Arkadaşlarını Davet Et</h2>
        <p className="text-zinc-500 text-sm mb-6">Arkadaşın bu linke tıkladığında otomatik olarak arkadaş olursunuz ve birlikte sıralamaya girebilirsiniz.</p>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 text-left truncate select-all mb-3">
          {inviteLink}
        </div>

        <motion.button onClick={handleCopy} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            copied ? 'bg-green-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}>
          {copied ? <><Check size={16} /> Kopyalandı!</> : <><Copy size={16} /> Davet Linkini Kopyala</>}
        </motion.button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const SOSYAL_TABS = [
  { id: 'arkadaşlar', label: 'Arkadaşlar', icon: Users },
  { id: 'sıralama', label: 'Sıralama', icon: Trophy },
  { id: 'davet', label: 'Davet', icon: UserPlus },
];

export default function Sosyal() {
  const [activeTab, setActiveTab] = useState('arkadaşlar');

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
            animate={{ boxShadow: ['0 0 10px rgba(124,58,237,0.3)', '0 0 25px rgba(124,58,237,0.5)', '0 0 10px rgba(124,58,237,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Users size={18} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Sosyal</h1>
            <p className="text-xs text-zinc-500">Arkadaşlar, sıralama & davet</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-1 mb-6 overflow-x-auto">
        {SOSYAL_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`relative flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            {activeTab === id && (
              <motion.div layoutId="sosyalTabActive" className="absolute inset-0 rounded-xl bg-violet-600"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
            )}
            <Icon size={14} className="relative" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'arkadaşlar' && (
          <motion.div key="arkadaşlar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <ArkadaşlarTab />
          </motion.div>
        )}
        {activeTab === 'sıralama' && (
          <motion.div key="sıralama" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <SiralamaTab />
          </motion.div>
        )}
        {activeTab === 'davet' && (
          <motion.div key="davet" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <DavetTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
