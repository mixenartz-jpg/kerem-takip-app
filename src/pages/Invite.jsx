import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { acceptInvite } from '../services/friendService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Invite() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addFriend } = useApp();

  const [inviterData, setInviterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // URL'den uid al
  const params = new URLSearchParams(window.location.search);
  const inviterUid = params.get('uid');

  const isValidUid = (uid) => uid && /^[a-zA-Z0-9]{20,128}$/.test(uid);

  useEffect(() => {
    if (!isValidUid(inviterUid)) {
      setError('Geçersiz davet linki.');
      setLoading(false);
      return;
    }
    // Davet eden kişinin profilini getir
    getDoc(doc(db, 'users', inviterUid))
      .then(snap => {
        if (!snap.exists()) {
          setError('Davet eden kullanıcı bulunamadı.');
        } else {
          setInviterData({ uid: inviterUid, displayName: snap.data().displayName || 'Kullanıcı' });
        }
      })
      .catch(() => setError('Bağlantı hatası.'))
      .finally(() => setLoading(false));
  }, [inviterUid]);

  const handleAccept = async () => {
    if (!user || !inviterData) return;
    if (user.uid === inviterUid) {
      setError('Kendi davet linkinize tıkladınız.');
      return;
    }
    setAccepting(true);
    try {
      await acceptInvite(user.uid, user.displayName || 'Kullanıcı', inviterData.uid, inviterData.displayName);
      addFriend({ uid: inviterData.uid, displayName: inviterData.displayName, status: 'accepted' });
      setDone(true);
      setTimeout(() => navigate('/leaderboard'), 2000);
    } catch {
      setError('Bir hata oluştu, tekrar dene.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center"
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={28} className="text-violet-500 animate-spin" />
            <p className="text-zinc-500 text-sm">Davet bilgisi yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-2">
              <X size={24} className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Hata</h2>
            <p className="text-sm text-zinc-500">{error}</p>
            <button onClick={() => navigate('/')}
              className="mt-4 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-xl transition-all">
              Ana sayfaya dön
            </button>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-2"
            >
              <Check size={24} className="text-green-400" />
            </motion.div>
            <h2 className="text-lg font-bold text-zinc-100">Arkadaş Eklendi! 🎉</h2>
            <p className="text-sm text-zinc-500">Sıralama sayfasına yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <>
            <motion.div
              className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <UserPlus size={26} className="text-violet-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">Arkadaşlık Daveti</h2>
            <p className="text-zinc-500 text-sm mb-1">
              <span className="text-violet-400 font-semibold">{inviterData?.displayName}</span> sizi Günlük Takip&apos;te arkadaş olarak eklemek istiyor.
            </p>
            <p className="text-zinc-600 text-xs mb-6">Sıralamada birlikte yarışabileceksiniz!</p>

            <div className="flex flex-col gap-2">
              <motion.button
                onClick={handleAccept}
                disabled={accepting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-semibold rounded-xl text-sm transition-all"
              >
                {accepting
                  ? <><Loader2 size={15} className="animate-spin" /> Ekleniyor...</>
                  : <><Check size={15} /> Daveti Kabul Et</>}
              </motion.button>
              <button onClick={() => navigate('/')}
                className="w-full py-2.5 text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
                Reddet
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
