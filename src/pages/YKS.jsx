import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, BookOpen, FlaskConical, Clock, Plus, Trash2,
  ChevronDown, ChevronUp, Sparkles, TrendingUp, CheckCircle2,
  Circle, Calendar, Award, Zap, BarChart3, X, Save, RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeYKSPerformance, generateStudyPlan } from '../services/geminiService';

/* ── Preset YKS Topics ── */
const TYT_TOPICS = {
  turkce: {
    label: 'Türkçe', icon: '📝', color: '#f59e0b',
    topics: [
      'Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Ses Bilgisi', 'Yazım Kuralları',
      'Noktalama', 'Sözcük Türleri', 'Fiiller', 'Cümle Bilgisi', 'Anlatım Bozukluğu',
    ],
  },
  mat: {
    label: 'Matematik', icon: '🔢', color: '#3b82f6',
    topics: [
      'Temel Kavramlar', 'Sayı Basamakları', 'Bölünebilme', 'EBOB-EKOK', 'Rasyonel Sayılar',
      'Ondalık Sayılar', 'Yüzdeler', 'Faiz', 'Oran-Orantı', 'Denklemler',
      'Eşitsizlikler', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma',
      'Fonksiyonlar', 'Permütasyon', 'Olasılık', 'İstatistik',
    ],
  },
  fen: {
    label: 'Fen Bilimleri', icon: '🔬', color: '#10b981',
    topics: [
      'Fizik: Hareket', 'Fizik: Kuvvet', 'Fizik: Enerji', 'Fizik: Elektrik',
      'Kimya: Madde', 'Kimya: Atom', 'Kimya: Periyodik Tablo', 'Kimya: Mol',
      'Biyoloji: Hücre', 'Biyoloji: Kalıtım', 'Biyoloji: Ekosistem',
    ],
  },
  sosyal: {
    label: 'Sosyal Bilimler', icon: '🌍', color: '#ec4899',
    topics: [
      'Tarih: Osmanlı', 'Tarih: Cumhuriyet', 'Coğrafya: Türkiye', 'Coğrafya: Dünya',
      'Felsefe: Epistemoloji', 'Din: İslam İlkeleri', 'T.C. İnkılap Tarihi',
    ],
  },
};

const AYT_TOPICS = {
  mat: {
    label: 'AYT Matematik', icon: '📐', color: '#6366f1',
    topics: [
      'Polinomlar', 'Logaritma', 'Trigonometri', 'Analitik Geometri',
      'Vektörler', 'Seriler', 'Limit ve Türev', 'İntegral',
      'Olasılık', 'İstatistik', 'Kompleks Sayılar',
    ],
  },
  fizik: {
    label: 'Fizik', icon: '⚡', color: '#f59e0b',
    topics: [
      'Kuvvet ve Hareket', 'Enerji', 'Elektrik', 'Manyetizma',
      'Dalgalar', 'Optik', 'Modern Fizik', 'Çembersel Hareket',
    ],
  },
  kimya: {
    label: 'Kimya', icon: '⚗️', color: '#a78bfa',
    topics: [
      'Atomun Yapısı', 'Periyodik Özellikler', 'Kimyasal Bağlar',
      'Gazlar', 'Kimyasal Denge', 'Asitler ve Bazlar', 'Elektrokimya',
      'Organik Kimya', 'Reaksiyon Hızı',
    ],
  },
  biyoloji: {
    label: 'Biyoloji', icon: '🧬', color: '#34d399',
    topics: [
      'Hücre', 'Mitoz ve Mayoz', 'Kalıtım', 'DNA ve Protein Sentezi',
      'Evrim', 'Ekoloji', 'Fotosentez', 'Solunum',
    ],
  },
};

const TYT_SUBJECTS = [
  { key: 'tyt_turkce', label: 'Türkçe', total: 40, color: '#f59e0b' },
  { key: 'tyt_mat', label: 'Matematik', total: 40, color: '#3b82f6' },
  { key: 'tyt_fen', label: 'Fen', total: 20, color: '#10b981' },
  { key: 'tyt_sosyal', label: 'Sosyal', total: 20, color: '#ec4899' },
];

const AYT_SUBJECTS = [
  { key: 'ayt_mat', label: 'Matematik', total: 30, color: '#6366f1' },
  { key: 'ayt_fizik', label: 'Fizik', total: 14, color: '#f59e0b' },
  { key: 'ayt_kimya', label: 'Kimya', total: 13, color: '#a78bfa' },
  { key: 'ayt_biyoloji', label: 'Biyoloji', total: 13, color: '#34d399' },
];

function calcNet(d, y) {
  const net = (Number(d) || 0) - (Number(y) || 0) / 4;
  return Math.max(0, Math.round(net * 100) / 100);
}

/* ── Glassmorphism 3D Card ── */
function Card3D({ children, className = '', glowColor = '#7c3aed', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        background: 'rgba(18,18,22,0.85)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.07)',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)`,
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${glowColor}18 0%, transparent 60%)` }}
      />
      {children}
    </motion.div>
  );
}

/* ── Countdown ── */
function Countdown({ examDate, onSetDate }) {
  const [editing, setEditing] = useState(false);
  const [dateVal, setDateVal] = useState(examDate || '');

  const days = examDate
    ? Math.ceil((new Date(examDate) - new Date()) / 86400000)
    : null;

  const urgency = days === null ? 'none' : days < 30 ? 'critical' : days < 90 ? 'warning' : 'ok';
  const urgencyColor = { none: '#7c3aed', critical: '#ef4444', warning: '#f59e0b', ok: '#10b981' };

  return (
    <Card3D glowColor={urgencyColor[urgency]} delay={0}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-zinc-400" />
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Geri Sayım</span>
          </div>
          <button onClick={() => setEditing(e => !e)} className="text-[10px] text-zinc-500 hover:text-violet-400 transition-colors">
            {editing ? 'Kapat' : 'Tarih Ayarla'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex gap-2">
              <input
                type="date"
                value={dateVal}
                onChange={e => setDateVal(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60"
              />
              <button
                onClick={() => { onSetDate(dateVal); setEditing(false); }}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Save size={14} />
              </button>
            </motion.div>
          ) : days !== null ? (
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
              <motion.span
                className="text-6xl font-black tabular-nums"
                style={{ color: urgencyColor[urgency], textShadow: `0 0 30px ${urgencyColor[urgency]}50` }}
                key={days}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {days}
              </motion.span>
              <span className="text-zinc-400 text-lg mb-2">gün kaldı</span>
            </motion.div>
          ) : (
            <motion.button
              key="empty"
              onClick={() => setEditing(true)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-zinc-500 hover:text-violet-400 text-sm transition-colors"
            >
              + YKS tarihini ekle
            </motion.button>
          )}
        </AnimatePresence>

        {examDate && !editing && (
          <p className="text-xs text-zinc-600 mt-2">
            {new Date(examDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </Card3D>
  );
}

/* ── Net Input ── */
function NetRow({ subject, values, onChange }) {
  const net = calcNet(values?.d, values?.y);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-20 shrink-0">{subject.label}</span>
      <div className="flex items-center gap-1.5 flex-1">
        <input
          type="number" min="0" max={subject.total} placeholder="D"
          value={values?.d ?? ''}
          onChange={e => onChange({ ...values, d: e.target.value })}
          className="w-12 bg-zinc-900 border border-zinc-700/60 focus:border-green-500/60 text-green-400 rounded-lg px-2 py-1.5 text-xs outline-none text-center"
        />
        <span className="text-zinc-700 text-xs">/</span>
        <input
          type="number" min="0" max={subject.total} placeholder="Y"
          value={values?.y ?? ''}
          onChange={e => onChange({ ...values, y: e.target.value })}
          className="w-12 bg-zinc-900 border border-zinc-700/60 focus:border-red-500/60 text-red-400 rounded-lg px-2 py-1.5 text-xs outline-none text-center"
        />
        <div
          className="ml-1 w-14 text-center text-xs font-bold px-2 py-1 rounded-lg"
          style={{ background: `${subject.color}20`, color: subject.color }}
        >
          {net}
        </div>
      </div>
    </div>
  );
}

/* ── Add Trial Modal ── */
function AddTrialModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tyt, setTyt] = useState({});
  const [ayt, setAyt] = useState({});
  const [tab, setTab] = useState('tyt');

  const handleSave = () => {
    const trial = {
      name: name || `Deneme ${date}`,
      date,
      tyt: Object.fromEntries(
        TYT_SUBJECTS.map(s => {
          const key = s.key.replace('tyt_', '');
          return [key, { d: Number(tyt[s.key]?.d || 0), y: Number(tyt[s.key]?.y || 0), net: calcNet(tyt[s.key]?.d, tyt[s.key]?.y) }];
        })
      ),
      ayt: Object.fromEntries(
        AYT_SUBJECTS.map(s => {
          const key = s.key.replace('ayt_', '');
          return [key, { d: Number(ayt[s.key]?.d || 0), y: Number(ayt[s.key]?.y || 0), net: calcNet(ayt[s.key]?.d, ayt[s.key]?.y) }];
        })
      ),
    };
    onSave(trial);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100">Deneme Ekle</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">İsim</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ör: TYT Deneme 5"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Tarih</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60" />
            </div>
          </div>

          <div className="flex bg-zinc-900 rounded-xl p-1 gap-1">
            {['tyt', 'ayt'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-2 mb-1">
              <span className="text-[9px] text-zinc-600 uppercase col-span-1">Ders</span>
              <span className="text-[9px] text-green-600 uppercase text-center">Doğru</span>
              <span className="text-[9px] text-red-600 uppercase text-center">Yanlış</span>
              <span className="text-[9px] text-violet-600 uppercase text-center">Net</span>
            </div>
            {(tab === 'tyt' ? TYT_SUBJECTS : AYT_SUBJECTS).map(s => (
              <NetRow
                key={s.key}
                subject={s}
                values={tab === 'tyt' ? tyt[s.key] : ayt[s.key]}
                onChange={v => tab === 'tyt' ? setTyt(p => ({ ...p, [s.key]: v })) : setAyt(p => ({ ...p, [s.key]: v }))}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all">
            İptal
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-all">
            Kaydet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Net Progress Bar ── */
function NetBar({ label, net, target, color, total }) {
  const pct = Math.min(100, (net / (target || total)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {net} <span className="text-zinc-600 font-normal">/ {target}</span>
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ── Topic Section ── */
function TopicSection({ subjectKey, subjectData, completedTopics, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const completed = subjectData.topics.filter(t => completedTopics?.includes(t)).length;
  const total = subjectData.topics.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors"
      >
        <span className="text-lg">{subjectData.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-200">{subjectData.label}</span>
            <span className="text-xs font-bold" style={{ color: subjectData.color }}>{completed}/{total}</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden w-full">
            <motion.div
              className="h-full rounded-full"
              style={{ background: subjectData.color, width: `${pct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-zinc-500 shrink-0" /> : <ChevronDown size={14} className="text-zinc-500 shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
              {subjectData.topics.map(topic => {
                const done = completedTopics?.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => onToggle(subjectKey, topic)}
                    className={`flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                      done
                        ? 'bg-violet-600/15 border border-violet-500/25 text-violet-300'
                        : 'bg-zinc-900/60 border border-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {done
                      ? <CheckCircle2 size={11} className="text-violet-400 shrink-0" />
                      : <Circle size={11} className="text-zinc-700 shrink-0" />
                    }
                    <span className="truncate">{topic}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── AI Analysis Panel ── */
function AIPanel({ yksData, trials }) {
  const [analysis, setAnalysis] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);

  const runAnalysis = async (type) => {
    setMode(type);
    setLoading(true);
    try {
      if (type === 'analyze') {
        const result = await analyzeYKSPerformance(yksData, trials);
        setAnalysis(result);
      } else {
        const weakSubjects = TYT_SUBJECTS
          .filter(s => {
            const lastTrial = trials[trials.length - 1];
            if (!lastTrial) return false;
            const key = s.key.replace('tyt_', '');
            const net = lastTrial.tyt?.[key]?.net || 0;
            return net < (yksData.targetNets?.[s.key] || 35) * 0.7;
          })
          .map(s => s.label);
        const result = await generateStudyPlan(yksData, weakSubjects);
        setStudyPlan(result);
      }
    } catch (err) {
      const errMsg = err.message?.includes('API key')
        ? '❌ Gemini API key eksik. .env.local dosyasına VITE_GEMINI_API_KEY ekleyin.'
        : `❌ Hata: ${err.message}`;
      if (type === 'analyze') setAnalysis(errMsg);
      else setStudyPlan(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card3D glowColor="#7c3aed" delay={0.3} className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center"
          animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 10px rgba(124,58,237,0.4)', '0 0 0px rgba(124,58,237,0)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Brain size={14} className="text-violet-400" />
        </motion.div>
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Yapay Zeka Analizi</span>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'analyze', label: 'Performans Analizi', icon: TrendingUp },
          { id: 'plan', label: 'Çalışma Planı', icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => runAnalysis(id)}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              mode === id
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
            } disabled:opacity-50`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-zinc-500 text-sm py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={14} />
            </motion.div>
            Gemini analiz ediyor...
          </motion.div>
        )}
        {!loading && mode === 'analyze' && analysis && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 whitespace-pre-wrap">
            {analysis}
          </motion.div>
        )}
        {!loading && mode === 'plan' && studyPlan && (
          <motion.div key="plan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 whitespace-pre-wrap">
            {studyPlan}
          </motion.div>
        )}
        {!loading && !mode && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-4 text-zinc-600 text-xs">
            Deneme verilerini girdikten sonra analiz yaptırabilirsin.
          </motion.div>
        )}
      </AnimatePresence>
    </Card3D>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const TABS = [
  { id: 'dashboard', label: 'Genel Bakış', icon: BarChart3 },
  { id: 'trials', label: 'Denemeler', icon: FlaskConical },
  { id: 'topics', label: 'Konular', icon: BookOpen },
  { id: 'ai', label: 'AI Analiz', icon: Sparkles },
];

export default function YKS() {
  const { yks, addYKSTrial, deleteYKSTrial, toggleYKSTopic, setYKSExamDate, setYKSTargetNet } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddTrial, setShowAddTrial] = useState(false);
  const [topicMode, setTopicMode] = useState('tyt');

  const trials = yks?.trials || [];
  const topics = yks?.topics || {};
  const targetNets = yks?.targetNets || {};

  const lastTrial = trials[trials.length - 1];

  const tytTotalNet = useMemo(() => {
    if (!lastTrial) return 0;
    return TYT_SUBJECTS.reduce((sum, s) => {
      const key = s.key.replace('tyt_', '');
      return sum + (lastTrial.tyt?.[key]?.net || 0);
    }, 0);
  }, [lastTrial]);

  const topicStats = useMemo(() => {
    const all = [
      ...Object.entries(TYT_TOPICS),
      ...Object.entries(AYT_TOPICS),
    ];
    const total = all.reduce((sum, [, d]) => sum + d.topics.length, 0);
    const done = all.reduce((sum, [key, d]) => {
      return sum + d.topics.filter(t => topics[key]?.includes(t)).length;
    }, 0);
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [topics]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
            animate={{ boxShadow: ['0 0 10px rgba(124,58,237,0.3)', '0 0 25px rgba(124,58,237,0.5)', '0 0 10px rgba(124,58,237,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain size={18} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">YKS Merkezi</h1>
            <p className="text-xs text-zinc-500">Hazırlık takibi & Yapay Zeka koçu</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {activeTab === id && (
              <motion.div
                layoutId="yksTabActive"
                className="absolute inset-0 rounded-xl bg-violet-600"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon size={14} className="relative" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Countdown */}
            <Countdown examDate={yks?.examDate} onSetDate={setYKSExamDate} />

            {/* Stats */}
            <Card3D glowColor="#3b82f6" delay={0.1} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-blue-400" />
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Son Deneme</span>
              </div>
              {lastTrial ? (
                <div className="space-y-2.5">
                  <div className="text-2xl font-black text-zinc-100">
                    {tytTotalNet.toFixed(2)}
                    <span className="text-sm text-zinc-500 font-normal ml-1">TYT net</span>
                  </div>
                  <div className="text-xs text-zinc-500">{lastTrial.name} · {lastTrial.date}</div>
                  <div className="space-y-1.5 mt-3">
                    {TYT_SUBJECTS.map(s => {
                      const key = s.key.replace('tyt_', '');
                      const net = lastTrial.tyt?.[key]?.net || 0;
                      return (
                        <NetBar key={s.key} label={s.label} net={net} target={targetNets[s.key] || s.total * 0.8} color={s.color} total={s.total} />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-600 text-sm">Henüz deneme eklenmedi</p>
              )}
            </Card3D>

            {/* Topic Progress */}
            <Card3D glowColor="#10b981" delay={0.2} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target size={14} className="text-emerald-400" />
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Konu İlerlemesi</span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <motion.span
                  className="text-4xl font-black text-emerald-400"
                  style={{ textShadow: '0 0 20px rgba(16,185,129,0.4)' }}
                >
                  %{topicStats.pct}
                </motion.span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${topicStats.pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-zinc-600">{topicStats.done} / {topicStats.total} konu tamamlandı</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-zinc-900 rounded-xl p-3">
                  <p className="text-lg font-bold text-zinc-100">{trials.length}</p>
                  <p className="text-[10px] text-zinc-600">Deneme</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3">
                  <p className="text-lg font-bold text-zinc-100">{topicStats.done}</p>
                  <p className="text-[10px] text-zinc-600">Konu bitti</p>
                </div>
              </div>
            </Card3D>
          </motion.div>
        )}

        {/* ── TRIALS ── */}
        {activeTab === 'trials' && (
          <motion.div
            key="trials"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-300">{trials.length} deneme girildi</h2>
              <motion.button
                onClick={() => setShowAddTrial(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
              >
                <Plus size={14} /> Deneme Ekle
              </motion.button>
            </div>

            {trials.length === 0 ? (
              <Card3D className="p-12 flex flex-col items-center gap-3">
                <FlaskConical size={32} className="text-zinc-700" />
                <p className="text-zinc-500 text-sm">Henüz deneme yok. İlk denemeyi ekle!</p>
              </Card3D>
            ) : (
              <div className="space-y-3">
                {[...trials].reverse().map((trial, i) => {
                  const tytNet = TYT_SUBJECTS.reduce((sum, s) => {
                    const key = s.key.replace('tyt_', '');
                    return sum + (trial.tyt?.[key]?.net || 0);
                  }, 0);

                  return (
                    <Card3D key={trial.id} delay={i * 0.05} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-zinc-200 text-sm">{trial.name}</h3>
                          <p className="text-xs text-zinc-600">{trial.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-black text-violet-400">{tytNet.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-600">TYT net</p>
                          </div>
                          <button
                            onClick={() => deleteYKSTrial(trial.id)}
                            className="p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TYT_SUBJECTS.map(s => {
                          const key = s.key.replace('tyt_', '');
                          const net = trial.tyt?.[key]?.net || 0;
                          return (
                            <div key={s.key} className="bg-zinc-900 rounded-xl p-2 text-center">
                              <p className="text-sm font-bold" style={{ color: s.color }}>{net}</p>
                              <p className="text-[9px] text-zinc-600 mt-0.5">{s.label}</p>
                            </div>
                          );
                        })}
                      </div>
                    </Card3D>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TOPICS ── */}
        {activeTab === 'topics' && (
          <motion.div
            key="topics"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-1 gap-1 mb-5">
              {['tyt', 'ayt'].map(m => (
                <button
                  key={m}
                  onClick={() => setTopicMode(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${topicMode === m ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {Object.entries(topicMode === 'tyt' ? TYT_TOPICS : AYT_TOPICS).map(([key, data]) => (
                <TopicSection
                  key={key}
                  subjectKey={key}
                  subjectData={data}
                  completedTopics={topics[key]}
                  onToggle={toggleYKSTopic}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── AI ── */}
        {activeTab === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <AIPanel yksData={yks || {}} trials={trials} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Trial Modal */}
      <AnimatePresence>
        {showAddTrial && (
          <AddTrialModal onClose={() => setShowAddTrial(false)} onSave={addYKSTrial} />
        )}
      </AnimatePresence>
    </div>
  );
}
