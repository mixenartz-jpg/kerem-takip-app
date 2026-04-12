import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Medal, Loader2, RefreshCw, Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getLeague, getNetDelta } from '../utils/leagueUtils';

const TABS = ['Genel Sıralama', 'En Çok Yükselenler', 'Arkadaşlarım'];

export default function Leaderboard() {
  const { friends } = useApp();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchScores = async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'userScores'));
      const data = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      setScores(data);
    } catch (err) {
      setError('Sıralama yüklenemedi. Firestore kurallarını kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const friendUids = (friends || []).map(f => f.uid);

  const sorted = [...scores].sort((a, b) =>
    ((b.tytNet || 0) + (b.aytNet || 0)) - ((a.tytNet || 0) + (a.aytNet || 0))
  );

  const climbers = [...scores]
    .map(s => ({ ...s, delta: getNetDelta(s) }))
    .filter(s => s.delta > 0)
    .sort((a, b) => b.delta - a.delta);

  const friendScores = sorted.filter(s => friendUids.includes(s.uid) || s.uid === user?.uid);

  const displayList = tab === 0 ? sorted : tab === 1 ? climbers : friendScores;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
            <Trophy size={18} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Sıralama</h1>
            <p className="text-xs text-zinc-500">TYT + AYT net toplamına göre</p>
          </div>
        </div>
        <button
          onClick={fetchScores}
          disabled={loading}
          className="p-2 text-zinc-600 hover:text-violet-400 hover:bg-zinc-800 rounded-xl transition-all"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-5">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
              tab === i
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {i === 1 ? <span className="flex items-center justify-center gap-1"><TrendingUp size={11} />{t}</span>
             : i === 2 ? <span className="flex items-center justify-center gap-1"><Users size={11} />{t}</span>
             : t}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="text-violet-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">{error}</div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 text-sm">
          {tab === 2 ? 'Henüz arkadaş yok. Davet linki paylaş!' : 'Henüz veri yok.'}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            {displayList.map((entry, idx) => (
              <ScoreRow key={entry.uid} entry={entry} rank={idx + 1} isMe={entry.uid === user?.uid} showDelta={tab === 1} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function ScoreRow({ entry, rank, isMe, showDelta }) {
  const total = (entry.tytNet || 0) + (entry.aytNet || 0);
  const league = getLeague(total);

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
        isMe
          ? 'bg-violet-600/10 border-violet-500/40'
          : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      {/* Rank */}
      <div className="w-7 text-center shrink-0">
        {rank === 1 ? <Trophy size={16} className="text-yellow-400 mx-auto" />
         : rank === 2 ? <Medal size={16} className="text-zinc-400 mx-auto" />
         : rank === 3 ? <Medal size={16} className="text-amber-600 mx-auto" />
         : <span className="text-xs font-bold text-zinc-600">{rank}</span>}
      </div>

      {/* League badge */}
      <span className="text-lg shrink-0" title={league.label}>{league.icon}</span>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isMe ? 'text-violet-300' : 'text-zinc-200'}`}>
          {entry.displayName || 'Anonim'}{isMe ? ' (Sen)' : ''}
        </p>
        <p className="text-xs text-zinc-600">{league.label}</p>
      </div>

      {/* Scores */}
      <div className="text-right shrink-0">
        {showDelta ? (
          <div className="flex items-center gap-1 text-green-400">
            <TrendingUp size={13} />
            <span className="text-sm font-bold">+{entry.delta}</span>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-zinc-100">{total} net</p>
            <p className="text-[10px] text-zinc-600">
              TYT {entry.tytNet || 0} · AYT {entry.aytNet || 0}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
