import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, BookOpen, FlaskConical, Clock, Plus, Trash2,
  ChevronDown, ChevronUp, Sparkles, TrendingUp, CheckCircle2,
  Circle, Calendar, Award, Zap, BarChart3, X, Save, RefreshCw,
  Edit2, ClipboardList, MapPin, AlertCircle, RotateCcw, Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePremium } from '../context/PremiumContext';
import { analyzeYKSPerformance, generateStudyPlan, generateQuizQuestions, parseGeminiError } from '../services/geminiService';
import Modal from '../components/ui/Modal';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';
import { fetchPreviousHashes, saveQuestionHashes } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import QuizCard from '../components/quiz/QuizCard';
import QuizSummary from '../components/quiz/QuizSummary';
import { Loader2 } from 'lucide-react';

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
   DERSLER TAB — inline (from Lessons.jsx)
══════════════════════════════════════════════ */
const LESSON_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];
const LESSON_ICONS = ['📚', '📐', '🔬', '🌍', '🎨', '💻', '🎵', '📝', '🧮', '⚗️', '🏛️', '🌿'];
const genLessonId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function DerslerTab() {
  const { lessons, addLesson, updateLesson, deleteLesson, toggleChapter } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [expandedIds, setExpandedIds] = useState({});
  const [form, setForm] = useState({ name: '', icon: '📚', color: '#8b5cf6', targetHours: 10, studyHours: 0 });
  const [chapters, setChapters] = useState([]);
  const [chapterInput, setChapterInput] = useState('');

  const totalHours = lessons.reduce((s, l) => s + (l.studyHours || 0), 0);
  const totalChapters = lessons.reduce((s, l) => s + (l.chapters?.length || 0), 0);
  const completedChapters = lessons.reduce((s, l) => s + (l.chapters?.filter(c => c.completed).length || 0), 0);

  const openAdd = () => {
    setEditLesson(null);
    setForm({ name: '', icon: '📚', color: '#8b5cf6', targetHours: 10, studyHours: 0 });
    setChapters([]);
    setChapterInput('');
    setModalOpen(true);
  };

  const openEdit = (lesson) => {
    setEditLesson(lesson);
    setForm({ name: lesson.name, icon: lesson.icon, color: lesson.color, targetHours: lesson.targetHours, studyHours: lesson.studyHours });
    setChapters(lesson.chapters || []);
    setChapterInput('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editLesson) updateLesson(editLesson.id, { ...form, chapters });
    else addLesson({ ...form, chapters });
    setModalOpen(false);
  };

  const addChapter = () => {
    if (!chapterInput.trim()) return;
    setChapters(prev => [...prev, { id: genLessonId(), title: chapterInput.trim(), completed: false }]);
    setChapterInput('');
  };

  const progressPct = (lesson) => {
    const total = lesson.chapters?.length || 0;
    if (total === 0) return 0;
    return Math.round((lesson.chapters.filter(c => c.completed).length / total) * 100);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-xs text-zinc-500">
          <span><span className="text-zinc-100 font-semibold">{lessons.length}</span> ders</span>
          <span><span className="text-zinc-100 font-semibold">{totalHours}</span> saat</span>
          <span><span className="text-zinc-100 font-semibold">{completedChapters}/{totalChapters}</span> konu</span>
        </div>
        <motion.button
          onClick={openAdd}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus size={14} /> Yeni Ders
        </motion.button>
      </div>

      {lessons.length === 0 ? (
        <Card3D className="p-12 flex flex-col items-center gap-3">
          <BookOpen size={32} className="text-zinc-700" />
          <p className="text-zinc-500 text-sm">Henüz ders eklenmedi. İlk dersini ekle!</p>
        </Card3D>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map(lesson => {
            const pct = progressPct(lesson);
            const done = lesson.chapters?.filter(c => c.completed).length || 0;
            const total = lesson.chapters?.length || 0;
            const expanded = expandedIds[lesson.id];
            return (
              <Card3D key={lesson.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: lesson.color + '22', border: `1px solid ${lesson.color}44` }}>
                      {lesson.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{lesson.name}</p>
                      <p className="text-xs text-zinc-500">{lesson.studyHours || 0} / {lesson.targetHours} saat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(lesson)} className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteLesson(lesson.id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">İlerleme</span>
                    <span className="text-xs font-medium" style={{ color: lesson.color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: lesson.color }} />
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">{done} / {total} konu tamamlandı</p>
                </div>

                {total > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedIds(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }))}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {expanded ? 'Konuları gizle' : 'Konuları göster'}
                    </button>
                    {expanded && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {lesson.chapters.map(ch => (
                          <button key={ch.id} onClick={() => toggleChapter(lesson.id, ch.id)}
                            className="flex items-center gap-2 text-xs text-left transition-colors group">
                            {ch.completed
                              ? <CheckCircle2 size={14} style={{ color: lesson.color }} className="shrink-0" />
                              : <Circle size={14} className="shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
                            <span className={ch.completed ? 'line-through text-zinc-600' : 'text-zinc-400'}>{ch.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card3D>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editLesson ? 'Dersi Düzenle' : 'Yeni Ders'} size="md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Ders Adı</label>
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Matematik, Fizik..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">İkon</label>
              <div className="flex flex-wrap gap-1.5">
                {LESSON_ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${form.icon === ic ? 'bg-violet-600/30 ring-1 ring-violet-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Renk</label>
              <div className="flex flex-wrap gap-1.5">
                {LESSON_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Hedef Saat</label>
              <input type="number" min="0" value={form.targetHours} onChange={e => setForm(f => ({ ...f, targetHours: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Çalışılan Saat</label>
              <input type="number" min="0" value={form.studyHours} onChange={e => setForm(f => ({ ...f, studyHours: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Konular</label>
            <div className="flex gap-2 mb-2">
              <input value={chapterInput} onChange={e => setChapterInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChapter()} placeholder="Konu adı..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
              <button onClick={addChapter} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300 transition-colors"><Plus size={14} /></button>
            </div>
            {chapters.length > 0 && (
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {chapters.map(ch => (
                  <div key={ch.id} className="flex items-center justify-between px-2 py-1.5 bg-zinc-800 rounded-lg">
                    <span className="text-xs text-zinc-300">{ch.title}</span>
                    <button onClick={() => setChapters(prev => prev.filter(c => c.id !== ch.id))} className="text-zinc-600 hover:text-red-400 transition-colors"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors">İptal</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
              {editLesson ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SINAVLAR TAB — inline (from Exams.jsx)
══════════════════════════════════════════════ */
const EXAM_STATUS_COLORS = {
  'başlamadı': { bg: 'bg-zinc-700/50', text: 'text-zinc-400' },
  'devam ediyor': { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'hazır': { bg: 'bg-green-500/10', text: 'text-green-400' },
};

function examCountdown(dateStr) {
  const diff = differenceInDays(parseISO(dateStr), new Date());
  if (diff < 0) return null;
  if (diff === 0) return { label: 'Bugün!', urgent: true };
  if (diff === 1) return { label: '1 gün kaldı', urgent: true };
  return { label: `${diff} gün kaldı`, urgent: diff <= 7 };
}

function SinavlarTab() {
  const { exams, lessons, addExam, updateExam, deleteExam } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [form, setForm] = useState({ title: '', lessonId: '', date: '', time: '', location: '', preparationStatus: 'başlamadı', notes: '' });

  const upcoming = exams.filter(e => !isPast(parseISO(e.date + 'T23:59'))).sort((a, b) => a.date.localeCompare(b.date));
  const past = exams.filter(e => isPast(parseISO(e.date + 'T23:59'))).sort((a, b) => b.date.localeCompare(a.date));
  const thisWeek = upcoming.filter(e => differenceInDays(parseISO(e.date), new Date()) <= 7);
  const ready = exams.filter(e => e.preparationStatus === 'hazır');

  const openAdd = () => {
    setEditExam(null);
    setForm({ title: '', lessonId: '', date: '', time: '', location: '', preparationStatus: 'başlamadı', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (exam) => {
    setEditExam(exam);
    setForm({ title: exam.title, lessonId: exam.lessonId || '', date: exam.date, time: exam.time || '', location: exam.location || '', preparationStatus: exam.preparationStatus, notes: exam.notes || '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    if (editExam) updateExam(editExam.id, form);
    else addExam(form);
    setModalOpen(false);
  };

  const ExamCard = ({ exam }) => {
    const cd = examCountdown(exam.date);
    const status = EXAM_STATUS_COLORS[exam.preparationStatus] || EXAM_STATUS_COLORS['başlamadı'];
    const linkedLesson = lessons.find(l => l.id === exam.lessonId);
    return (
      <Card3D className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-sm font-semibold text-zinc-100 truncate">{exam.title}</h3>
              {cd && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cd.urgent ? 'bg-red-500/15 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {cd.label}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Calendar size={12} />
                {format(parseISO(exam.date), 'dd MMM yyyy', { locale: tr })}
                {exam.time && ` · ${exam.time}`}
              </span>
              {exam.location && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin size={12} />
                  {exam.location}
                </span>
              )}
              {linkedLesson && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>{linkedLesson.icon}</span>
                  {linkedLesson.name}
                </span>
              )}
            </div>
            <select
              value={exam.preparationStatus}
              onChange={e => updateExam(exam.id, { preparationStatus: e.target.value })}
              className={`text-xs px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${status.bg} ${status.text}`}
            >
              <option value="başlamadı">Başlamadı</option>
              <option value="devam ediyor">Devam Ediyor</option>
              <option value="hazır">Hazır</option>
            </select>
            {exam.notes && <p className="text-xs text-zinc-600 mt-2 line-clamp-2">{exam.notes}</p>}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => openEdit(exam)} className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors"><Edit2 size={13} /></button>
            <button onClick={() => deleteExam(exam.id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
      </Card3D>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-xs text-zinc-500">
          <span><span className="text-red-400 font-semibold">{thisWeek.length}</span> bu hafta</span>
          <span><span className="text-green-400 font-semibold">{ready.length}</span> hazır</span>
          <span><span className="text-zinc-100 font-semibold">{upcoming.length}</span> yaklaşan</span>
        </div>
        <motion.button onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Plus size={14} /> Yeni Sınav
        </motion.button>
      </div>

      <section className="mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Yaklaşan Sınavlar</h2>
        {upcoming.length === 0 ? (
          <Card3D className="p-10 flex flex-col items-center gap-3">
            <ClipboardList size={28} className="text-zinc-700" />
            <p className="text-zinc-500 text-sm">Yaklaşan sınav yok</p>
          </Card3D>
        ) : (
          <div className="flex flex-col gap-3">{upcoming.map(exam => <ExamCard key={exam.id} exam={exam} />)}</div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">Geçmiş Sınavlar</h2>
          <div className="flex flex-col gap-3 opacity-60">{past.map(exam => <ExamCard key={exam.id} exam={exam} />)}</div>
        </section>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editExam ? 'Sınavı Düzenle' : 'Yeni Sınav'} size="md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Sınav Adı</label>
            <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Matematik Final..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Tarih</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Saat</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Konum</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Sınıf 101..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">İlgili Ders</label>
              <select value={form.lessonId} onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors">
                <option value="">— Seç —</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.icon} {l.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Hazırlık Durumu</label>
            <select value={form.preparationStatus} onChange={e => setForm(f => ({ ...f, preparationStatus: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors">
              <option value="başlamadı">Başlamadı</option>
              <option value="devam ediyor">Devam Ediyor</option>
              <option value="hazır">Hazır</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Notlar</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Kapsam, notlar..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 transition-colors resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors">İptal</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
              {editExam ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HATA DEFTERİ TAB — inline (from HataDefteri.jsx)
══════════════════════════════════════════════ */
const HD_SUBJECTS = [
  'Türkçe', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji',
  'Tarih', 'Coğrafya', 'Felsefe', 'AYT Matematik', 'Diğer'
];
const HD_QUALITY_LABELS = [
  { q: 0, label: 'Hiç bilmedim', color: 'bg-red-600 hover:bg-red-500' },
  { q: 1, label: 'Zor hatırladım', color: 'bg-orange-600 hover:bg-orange-500' },
  { q: 2, label: 'Hatırladım', color: 'bg-yellow-600 hover:bg-yellow-500' },
  { q: 3, label: 'Kolay hatırladım', color: 'bg-green-600 hover:bg-green-500' },
];

function HataAddModal({ onClose, onSave }) {
  const [subject, setSubject] = useState(HD_SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [myAnswer, setMyAnswer] = useState('');

  const handleSave = () => {
    if (!topic.trim() || !question.trim() || !correctAnswer.trim()) return;
    onSave({ subject, topic, question, correctAnswer, myAnswer });
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100">Hata Ekle</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Ders</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60">
                {HD_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Konu</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Örn: Türev"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Soru / Hatalı yapılan konu</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3} placeholder="Soruyu veya hata yaptığın konuyu yaz..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60 resize-none" />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Doğru Cevap / Açıklama</label>
            <textarea value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} rows={2} placeholder="Doğru cevap veya açıklamayı yaz..."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60 resize-none" />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Benim Cevabım (opsiyonel)</label>
            <input value={myAnswer} onChange={e => setMyAnswer(e.target.value)} placeholder="Ne yazmıştım?.."
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/60" />
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all">İptal</button>
          <button onClick={handleSave} disabled={!topic.trim() || !question.trim() || !correctAnswer.trim()}
            className="flex-1 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl font-medium transition-all">Kaydet</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HataReviewCard({ item, onReview, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="relative rounded-2xl border border-zinc-800/70 overflow-hidden" style={{ background: 'rgba(18,18,22,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/20">{item.subject}</span>
            <span className="text-[10px] text-zinc-500">{item.topic}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.interval > 0 && <div className="flex items-center gap-1 text-[10px] text-zinc-600"><Clock size={10} />{item.interval}g</div>}
            <button onClick={() => onDelete(item.id)} className="p-1 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={12} /></button>
          </div>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed mb-3">{item.question}</p>
        <button onClick={() => setFlipped(f => !f)} className="flex items-center gap-2 text-xs text-zinc-500 hover:text-violet-400 transition-colors">
          {flipped ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {flipped ? 'Cevabı Gizle' : 'Cevabı Göster'}
        </button>
        <AnimatePresence>
          {flipped && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-medium text-emerald-400 mb-1">Doğru Cevap</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{item.correctAnswer}</p>
              </div>
              {item.myAnswer && (
                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-medium text-red-400 mb-1">Benim Cevabım</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.myAnswer}</p>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {HD_QUALITY_LABELS.map(({ q, label, color }) => (
                  <button key={q} onClick={() => { onReview(item.id, q); setFlipped(false); }}
                    className={`py-2 rounded-xl text-xs font-medium text-white transition-all ${color}`}>{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function HataTab() {
  const { hataDefteriItems, addHataDefteri, deleteHataDefteri, reviewHataDefteri } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [filterSubject, setFilterSubject] = useState('Tümü');
  const [hdTab, setHdTab] = useState('due');
  const today = new Date().toISOString().split('T')[0];

  const dueItems = useMemo(() => hataDefteriItems.filter(i => !i.nextReview || i.nextReview <= today), [hataDefteriItems, today]);
  const subjects = useMemo(() => ['Tümü', ...new Set(hataDefteriItems.map(i => i.subject))], [hataDefteriItems]);
  const displayItems = (hdTab === 'due' ? dueItems : hataDefteriItems).filter(i => filterSubject === 'Tümü' || i.subject === filterSubject);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Toplam', value: hataDefteriItems.length, color: 'text-zinc-400' },
            { label: 'Bugün Tekrar', value: dueItems.length, color: 'text-orange-400' },
            { label: 'Öğrenilen', value: hataDefteriItems.filter(i => i.repetitions >= 2).length, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-zinc-800/60 px-3 py-2 text-center" style={{ background: 'rgba(18,18,22,0.85)' }}>
              <p className={`text-lg font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-zinc-600">{label}</p>
            </div>
          ))}
        </div>
        <motion.button onClick={() => setShowAdd(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Plus size={14} /> Hata Ekle
        </motion.button>
      </div>

      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-1 mb-4">
        {[{ id: 'due', label: `Tekrar Edilecek (${dueItems.length})` }, { id: 'all', label: `Tümü (${hataDefteriItems.length})` }].map(({ id, label }) => (
          <button key={id} onClick={() => setHdTab(id)}
            className={`relative flex-1 py-2 rounded-xl text-sm font-medium transition-all ${hdTab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {hdTab === id && <motion.div layoutId="hdTabActive2" className="absolute inset-0 rounded-xl bg-violet-600" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {subjects.map(s => (
          <button key={s} onClick={() => setFilterSubject(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${filterSubject === s ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'}`}>
            {s}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {displayItems.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-16 text-zinc-600">
            {hdTab === 'due'
              ? <><Flame size={32} className="text-emerald-600" /><p className="text-sm">Tebrikler! Bugün tekrar edilecek hata yok.</p></>
              : <><BookOpen size={32} /><p className="text-sm">Henüz hata eklenmedi.</p></>}
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayItems.map(item => (
              <HataReviewCard key={item.id} item={item} onReview={reviewHataDefteri} onDelete={deleteHataDefteri} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && <HataAddModal onClose={() => setShowAdd(false)} onSave={addHataDefteri} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════
   QUIZ TAB — inline (from QuizMerkezi.jsx)
══════════════════════════════════════════════ */
const QUIZ_SUBJECTS = [
  'TYT Türkçe', 'TYT Matematik', 'TYT Fen Bilimleri', 'TYT Sosyal Bilimler',
  'AYT Matematik', 'AYT Fizik', 'AYT Kimya', 'AYT Biyoloji',
  'AYT Edebiyat', 'AYT Tarih', 'AYT Coğrafya',
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Türk Dili',
];
const QUIZ_PHASE = { SETUP: 'setup', LOADING: 'loading', QUIZ: 'quiz', SUMMARY: 'summary' };

function QuizTab() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [phase, setPhase] = useState(QUIZ_PHASE.SETUP);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');

  async function handleStart() {
    if (!subject || !topic.trim()) return;
    setPhase(QUIZ_PHASE.LOADING);
    setError('');
    try {
      const prevDocs = await fetchPreviousHashes(user.uid);
      const prevHashes = prevDocs.map(d => d.hash);
      const qs = await generateQuizQuestions(subject, topic, prevHashes);
      const limited = qs.slice(0, 5);
      await saveQuestionHashes(user.uid, limited, subject, topic);
      setQuestions(limited);
      setCurrentIdx(0);
      setAnswers([]);
      setPhase(QUIZ_PHASE.QUIZ);
    } catch (err) {
      setError(parseGeminiError(err));
      setPhase(QUIZ_PHASE.SETUP);
    }
  }

  function handleAnswer(correct) {
    setAnswers(prev => [...prev, correct]);
    if (currentIdx + 1 >= questions.length) {
      setPhase(QUIZ_PHASE.SUMMARY);
    } else {
      setCurrentIdx(i => i + 1);
    }
  }

  function handleRestart() {
    setPhase(QUIZ_PHASE.SETUP);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setError('');
  }

  return (
    <div className="max-w-xl mx-auto">
      {phase === QUIZ_PHASE.SETUP && (
        <Card3D className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">AI Soru Merkezi</h2>
              <p className="text-xs text-zinc-500">Gemini ile özgün sorular</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Ders</label>
              <div className="relative">
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full appearance-none bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/60 pr-10">
                  <option value="">Ders seç…</option>
                  {QUIZ_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Konu / Kavram</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="Örn: Türev, Newton Yasaları, Osmanlı Kuruluş..."
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/60" />
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <motion.button onClick={handleStart} disabled={!subject || !topic.trim()}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              Soruları Oluştur
            </motion.button>
          </div>
        </Card3D>
      )}
      {phase === QUIZ_PHASE.LOADING && (
        <Card3D className="p-12 flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={28} className="text-violet-400" />
          </motion.div>
          <p className="text-zinc-400 text-sm">Gemini sorular oluşturuyor…</p>
        </Card3D>
      )}
      {phase === QUIZ_PHASE.QUIZ && questions[currentIdx] && (
        <QuizCard question={questions[currentIdx]} questionNumber={currentIdx + 1} totalQuestions={questions.length} onAnswer={handleAnswer} />
      )}
      {phase === QUIZ_PHASE.SUMMARY && (
        <QuizSummary questions={questions} answers={answers} subject={subject} topic={topic} onRestart={handleRestart} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const TABS = [
  { id: 'dashboard', label: 'Genel Bakış', icon: BarChart3 },
  { id: 'trials', label: 'Denemeler', icon: FlaskConical },
  { id: 'topics', label: 'Konular', icon: BookOpen },
  { id: 'dersler', label: 'Dersler', icon: BookOpen },
  { id: 'sinavlar', label: 'Sınavlar', icon: ClipboardList },
  { id: 'hata', label: 'Hata Defteri', icon: AlertCircle, premium: 'hata_defteri' },
  { id: 'quiz', label: 'Soru Merkezi', icon: Sparkles, premium: 'quiz' },
  { id: 'ai', label: 'AI Analiz', icon: Brain },
];

export default function YKS() {
  const { yks, addYKSTrial, deleteYKSTrial, toggleYKSTopic, setYKSExamDate, setYKSTargetNet } = useApp();
  const { canAccess } = usePremium();
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {/* Countdown */}
            <Countdown examDate={yks?.examDate} onSetDate={setYKSExamDate} />

            {/* Stats — TYT */}
            <Card3D glowColor="#3b82f6" delay={0.1} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-blue-400" />
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Son Deneme — TYT</span>
              </div>
              {lastTrial ? (
                <div className="space-y-2.5">
                  <div className="flex items-end gap-2 mb-1">
                    <div className="text-3xl font-black text-zinc-100">
                      {tytTotalNet.toFixed(1)}
                    </div>
                    <span className="text-sm text-zinc-500 font-normal mb-1">net</span>
                  </div>
                  <div className="text-xs text-zinc-500 mb-2">{lastTrial.name} · {lastTrial.date}</div>
                  <div className="space-y-1.5">
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

            {/* Stats — AYT */}
            <Card3D glowColor="#6366f1" delay={0.15} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-indigo-400" />
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Son Deneme — AYT</span>
              </div>
              {lastTrial ? (
                <div className="space-y-2.5">
                  <div className="flex items-end gap-2 mb-1">
                    <div className="text-3xl font-black text-indigo-400">
                      {AYT_SUBJECTS.reduce((sum, s) => sum + (lastTrial.ayt?.[s.key.replace('ayt_', '')]?.net || 0), 0).toFixed(1)}
                    </div>
                    <span className="text-sm text-zinc-500 font-normal mb-1">net</span>
                  </div>
                  <div className="text-xs text-zinc-500 mb-2">{lastTrial.name} · {lastTrial.date}</div>
                  <div className="space-y-1.5">
                    {AYT_SUBJECTS.map(s => {
                      const key = s.key.replace('ayt_', '');
                      const net = lastTrial.ayt?.[key]?.net || 0;
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

                  const aytNet = AYT_SUBJECTS.reduce((sum, s) => {
                    const key = s.key.replace('ayt_', '');
                    return sum + (trial.ayt?.[key]?.net || 0);
                  }, 0);

                  return (
                    <Card3D key={trial.id} delay={i * 0.05} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-zinc-200 text-sm">{trial.name}</h3>
                          <p className="text-xs text-zinc-600">{trial.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-lg font-black text-violet-400">{tytNet.toFixed(2)}</p>
                              <p className="text-[10px] text-zinc-600">TYT net</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-indigo-400">{aytNet.toFixed(2)}</p>
                              <p className="text-[10px] text-zinc-600">AYT net</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteYKSTrial(trial.id)}
                            className="p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">TYT</p>
                          <div className="grid grid-cols-2 gap-1.5">
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
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">AYT</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {AYT_SUBJECTS.map(s => {
                              const key = s.key.replace('ayt_', '');
                              const net = trial.ayt?.[key]?.net || 0;
                              return (
                                <div key={s.key} className="bg-zinc-900 rounded-xl p-2 text-center">
                                  <p className="text-sm font-bold" style={{ color: s.color }}>{net}</p>
                                  <p className="text-[9px] text-zinc-600 mt-0.5">{s.label}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
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

        {/* ── DERSLER ── */}
        {activeTab === 'dersler' && (
          <motion.div key="dersler" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <DerslerTab />
          </motion.div>
        )}

        {/* ── SINAVLAR ── */}
        {activeTab === 'sinavlar' && (
          <motion.div key="sinavlar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <SinavlarTab />
          </motion.div>
        )}

        {/* ── HATA DEFTERİ ── */}
        {activeTab === 'hata' && (
          <motion.div key="hata" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            {canAccess('hata_defteri')
              ? <HataTab />
              : <Card3D className="p-12 flex flex-col items-center gap-3">
                  <AlertCircle size={28} className="text-violet-400" />
                  <p className="text-zinc-400 text-sm font-medium">Bu özellik Premium gerektirir</p>
                  <p className="text-zinc-600 text-xs">SM-2 algoritmasıyla aralıklı tekrar için Premium'a geç.</p>
                </Card3D>
            }
          </motion.div>
        )}

        {/* ── QUIZ ── */}
        {activeTab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            {canAccess('quiz')
              ? <QuizTab />
              : <Card3D className="p-12 flex flex-col items-center gap-3">
                  <Sparkles size={28} className="text-violet-400" />
                  <p className="text-zinc-400 text-sm font-medium">Bu özellik Premium gerektirir</p>
                  <p className="text-zinc-600 text-xs">AI destekli soru üretimi için Premium'a geç.</p>
                </Card3D>
            }
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
