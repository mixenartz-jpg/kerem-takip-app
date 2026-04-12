import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Star, ToggleLeft, ToggleRight, Megaphone,
  Activity, LogOut, Shield, Check, X, RefreshCw
} from 'lucide-react';
import { db } from '../../firebase';
import {
  collection, getDocs, doc, updateDoc, getDoc, setDoc, onSnapshot, query, limit
} from 'firebase/firestore';

const FEATURE_FLAGS_DOC = 'admin/feature_flags';
const ANNOUNCEMENT_DOC = 'admin/announcement';

const DEFAULT_FLAGS = {
  ai_merkezi: false,
  ileri_istatistikler: false,
  hata_defteri: false,
};

function StatCard({ icon: Icon, label, value, color = 'zinc' }) {
  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
        <Icon size={18} className={`text-${color}-400`} />
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-lg font-bold text-zinc-100">{value}</p>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
          enabled
            ? 'bg-violet-600/20 border-violet-500/30 text-violet-300'
            : 'bg-zinc-800 border-white/5 text-zinc-500'
        }`}
      >
        {enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        {enabled ? 'Açık' : 'Kapalı'}
      </button>
    </div>
  );
}

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState('stats');
  const [userCount, setUserCount] = useState('—');
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [uidInput, setUidInput] = useState('');
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [announcement, setAnnouncement] = useState({ text: '', active: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('checking');

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        // Feature flags
        const flagsSnap = await getDoc(doc(db, ...FEATURE_FLAGS_DOC.split('/')));
        if (flagsSnap.exists()) setFlags({ ...DEFAULT_FLAGS, ...flagsSnap.data() });

        // Announcement
        const annSnap = await getDoc(doc(db, ...ANNOUNCEMENT_DOC.split('/')));
        if (annSnap.exists()) setAnnouncement(annSnap.data());

        // User count (limited query for efficiency)
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
        setUserCount(usersSnap.size === 200 ? '200+' : usersSnap.size);

        // Premium users
        const prem = [];
        usersSnap.forEach(d => {
          if (d.data().isPremium) prem.push({ uid: d.id, ...d.data() });
        });
        setPremiumUsers(prem);
        setDbStatus('connected');
      } catch {
        setDbStatus('error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveFlags = async (newFlags) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin', 'feature_flags'), newFlags);
      setFlags(newFlags);
      flashSaved();
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = (key, val) => {
    const newFlags = { ...flags, [key]: val };
    saveFlags(newFlags);
  };

  const saveAnnouncement = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin', 'announcement'), announcement);
      flashSaved();
    } finally {
      setSaving(false);
    }
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const grantPremium = async (uid) => {
    if (!uid.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid.trim()), { isPremium: true });
      setUidInput('');
      // Refresh premium list
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
      const prem = [];
      usersSnap.forEach(d => { if (d.data().isPremium) prem.push({ uid: d.id, ...d.data() }); });
      setPremiumUsers(prem);
      flashSaved();
    } catch {
      // UID bulunamadı
    } finally {
      setSaving(false);
    }
  };

  const revokePremium = async (uid) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid), { isPremium: false });
      setPremiumUsers(p => p.filter(u => u.uid !== uid));
      flashSaved();
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'stats', label: 'Durum', icon: Activity },
    { id: 'premium', label: 'Premium', icon: Star },
    { id: 'flags', label: 'Özellikler', icon: Shield },
    { id: 'announce', label: 'Duyuru', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-zinc-500" />
          <span className="text-sm text-zinc-400 font-medium">Admin</span>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-green-400"
            >
              <Check size={12} /> Kaydedildi
            </motion.span>
          )}
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <LogOut size={13} />
          Çıkış
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
              tab === id
                ? 'text-violet-400 border-violet-500'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center pt-16">
            <motion.div
              className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <>
            {/* STATS TAB */}
            {tab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={Users} label="Toplam Kullanıcı" value={userCount} />
                  <StatCard icon={Star} label="Premium Kullanıcı" value={premiumUsers.length} color="violet" />
                </div>
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-2">Firestore Bağlantısı</p>
                  <div className={`flex items-center gap-2 text-sm font-medium ${dbStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
                    {dbStatus === 'connected' ? 'Bağlı' : 'Bağlantı hatası'}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PREMIUM TAB */}
            {tab === 'premium' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-3">UID'ye Premium Ver</p>
                  <div className="flex gap-2">
                    <input
                      value={uidInput}
                      onChange={e => setUidInput(e.target.value)}
                      placeholder="Firebase UID..."
                      className="flex-1 bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                    />
                    <button
                      onClick={() => grantPremium(uidInput)}
                      disabled={saving || !uidInput.trim()}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-all"
                    >
                      {saving ? <RefreshCw size={12} className="animate-spin" /> : 'Ver'}
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-3">Premium Kullanıcılar ({premiumUsers.length})</p>
                  {premiumUsers.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">Henüz premium kullanıcı yok</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {premiumUsers.map(u => (
                        <div key={u.uid} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-xs text-zinc-300 font-mono">{u.uid.slice(0, 20)}...</p>
                          </div>
                          <button
                            onClick={() => revokePremium(u.uid)}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X size={12} /> Al
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FEATURE FLAGS TAB */}
            {tab === 'flags' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/60 border border-white/5 rounded-xl p-4"
              >
                <p className="text-xs text-zinc-500 mb-4">Global özellik kilitleri (false = kilitli)</p>
                <Toggle
                  enabled={flags.ai_merkezi}
                  onChange={val => toggleFlag('ai_merkezi', val)}
                  label="AI Merkezi"
                  description="Tüm kullanıcılar için AI özelliklerini aç/kapat"
                />
                <Toggle
                  enabled={flags.ileri_istatistikler}
                  onChange={val => toggleFlag('ileri_istatistikler', val)}
                  label="İleri İstatistikler"
                  description="Stats sayfasının premium bölümleri"
                />
                <Toggle
                  enabled={flags.hata_defteri}
                  onChange={val => toggleFlag('hata_defteri', val)}
                  label="Hata Defteri (SM2)"
                  description="Aralıklı tekrar sistemi"
                />
              </motion.div>
            )}

            {/* ANNOUNCEMENT TAB */}
            {tab === 'announce' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs text-zinc-500">Dashboard duyurusu</p>
                  <textarea
                    value={announcement.text}
                    onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
                    placeholder="Kullanıcılara gösterilecek duyuru metni..."
                    rows={4}
                    className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none transition-colors"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={announcement.active}
                        onChange={e => setAnnouncement(a => ({ ...a, active: e.target.checked }))}
                        className="accent-violet-500"
                      />
                      Aktif (dashboard'da göster)
                    </label>
                    <button
                      onClick={saveAnnouncement}
                      disabled={saving}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-all"
                    >
                      {saving ? <RefreshCw size={12} className="animate-spin inline" /> : 'Kaydet'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
