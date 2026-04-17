import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, BarChart3, Camera, Zap, RotateCcw,
  BookMarked, RefreshCw, TrendingUp, UserCheck,
  Sparkles, Loader2, AlertCircle, CheckCircle2, Circle,
  Plus, Trash2, Tag, Upload, ChevronRight, Award,
  Flame, Star, BookOpen, Clock,
} from 'lucide-react';
import { format, isToday, isBefore, parseISO, subDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  generateDailyStudyPlan, analyzeYKSPerformance,
  solveQuestionWithVision, detectBurnout,
  generateWeeklyRetrospective, autoTagErrorNote, generateSelfReview,
  parseGeminiError,
} from '../services/geminiService';

const TABS = [
  { id: 'plan',        label: 'Günlük Plan',   icon: CalendarDays },
  { id: 'analiz',      label: 'Deneme',         icon: BarChart3 },
  { id: 'soru',        label: 'Soru Çöz',       icon: Camera },
  { id: 'burnout',     label: 'Burnout',         icon: Zap },
  { id: 'retro',       label: 'Haftalık Özet',  icon: RotateCcw },
  { id: 'hata',        label: 'Hata Defteri',   icon: BookMarked },
  { id: 'tekrar',      label: 'Tekrar',          icon: RefreshCw },
  { id: 'verimlilik',  label: 'Verimlilik',      icon: TrendingUp },
  { id: 'panel',       label: 'Öz-Analiz',      icon: UserCheck },
];

const BADGE_DEFS = {
  streak_3:   { label: '3 Günlük Seri',   icon: '🔥', color: 'text-orange-400' },
  streak_7:   { label: '7 Günlük Seri',   icon: '⚡', color: 'text-yellow-400' },
  streak_30:  { label: '30 Günlük Seri',  icon: '🏆', color: 'text-violet-400' },
  first_plan: { label: 'İlk Plan',         icon: '📋', color: 'text-blue-400' },
  first_error:{ label: 'İlk Hata Notu',   icon: '📖', color: 'text-green-400' },
  spaced_5:   { label: '5 Tekrar',         icon: '🧠', color: 'text-pink-400' },
};

const SUBJECTS = [
  'TYT Türkçe','TYT Matematik','TYT Fen Bilimleri','TYT Sosyal Bilimler',
  'AYT Matematik','AYT Fizik','AYT Kimya','AYT Biyoloji',
  'AYT Edebiyat','AYT Tarih','AYT Coğrafya',
];

function compressImage(file) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const maxSize = 600;
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.src = URL.createObjectURL(file);
  });
}

function AICard({ children, className = '' }) {
  return (
    <div className={`bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function LoadingSpinner({ text = 'Yapay zeka düşünüyor...' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
      />
      <p className="text-sm text-zinc-500">{text}</p>
    </div>
  );
}

function AIButton({ onClick, loading, children, className = '' }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={`flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-all ${className}`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
      {children}
    </motion.button>
  );
}

function ResultBox({ text }) {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-zinc-800/60 border border-zinc-700/40 rounded-xl p-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed"
    >
      {text}
    </motion.div>
  );
}

export default function AIMerkezi() {
  const {
    yks, habits, pomodoro, tasks, lessons, hataDefteriItems, aiPlanCache, aiStreak, badges,
    addHataDefteri, updateHataDefteri, deleteHataDefteri, reviewHataDefteri,
    setAIPlanCache, toggleAIPlanBlock, addBadge,
  } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  // Plan settings (stored locally)
  const [planSettings, setPlanSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ai-plan-settings') || '{}'); }
    catch { return {}; }
  });
  const [showPlanSettings, setShowPlanSettings] = useState(false);

  // Soru çözüm
  const [solveImage, setSolveImage] = useState(null);
  const [solvePreview, setSolvePreview] = useState(null);
  const solveInputRef = useRef();

  // Hata defteri
  const [showAddError, setShowAddError] = useState(false);
  const [errorForm, setErrorForm] = useState({ subject: 'TYT Matematik', topic: '', question: '', myAnswer: '', correctAnswer: '' });
  const [errorPhoto, setErrorPhoto] = useState(null);
  const [errorPhotoPreview, setErrorPhotoPreview] = useState(null);
  const errorPhotoRef = useRef();
  const [tagging, setTagging] = useState(false);

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));
  const setRes  = (key, val) => setResults(p => ({ ...p, [key]: val }));
  const setErr  = (key, val) => setErrors(p => ({ ...p, [key]: val }));

  const today = format(new Date(), 'yyyy-MM-dd');
  const daysLeft = yks?.examDate
    ? Math.ceil((new Date(yks.examDate) - new Date()) / 86400000)
    : null;

  // ── Computed stats ───────────────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  );

  const weekPomodoros = (pomodoro?.sessions || []).filter(
    s => last7.includes(s.date) && s.mode === 'work' && s.completed
  ).length;

  const todayHabitRate = habits.length > 0
    ? (habits.filter(h => h.completions?.includes(today)).length / habits.length) * 100
    : 0;

  const weekTasks = tasks.filter(t => {
    const d = t.completedAt?.slice(0, 10);
    return d && last7.includes(d);
  }).length;
  const weekTasksTotal = tasks.filter(t => {
    const d = t.createdAt?.slice(0, 10);
    return d && last7.includes(d);
  }).length;
  const taskRate = weekTasksTotal > 0 ? (weekTasks / weekTasksTotal) * 100 : 0;

  const totalStudyHours = lessons.reduce((s, l) => s + (l.studyHours || 0), 0);

  // ── Günlük Plan ─────────────────────────────────────────
  async function handleGeneratePlan() {
    setLoad('plan', true); setErr('plan', '');
    const weakTopics = hataDefteriItems
      .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview))
      .slice(0, 5)
      .map(i => `${i.subject}: ${i.topic}`);

    const studyLogs = last7.map(d => ({
      date: d,
      pomodoros: (pomodoro?.sessions || []).filter(s => s.date === d && s.mode === 'work' && s.completed).length,
    }));

    try {
      const plan = await generateDailyStudyPlan({
        name: user?.displayName || 'Öğrenci',
        targetDept: planSettings.targetDept || 'Hedef belirtilmemiş',
        targetUni: planSettings.targetUni || '',
        daysLeft: daysLeft || 90,
        dailyHours: planSettings.dailyHours || 8,
        studyLogs,
        examResults: (yks?.trials || []).slice(-3),
        weakTopics,
      });
      const newCache = { date: today, plan, completedBlockIds: [] };
      setAIPlanCache(newCache);
      addBadge('first_plan');
    } catch (e) {
      setErr('plan', parseGeminiError(e));
    }
    setLoad('plan', false);
  }

  const planIsToday = aiPlanCache?.date === today;
  const planBlocks = aiPlanCache?.plan?.blocks || [];
  const completedIds = aiPlanCache?.completedBlockIds || [];
  const planCompletion = planBlocks.length > 0
    ? Math.round((completedIds.length / planBlocks.length) * 100)
    : 0;

  // ── Deneme Analizi ───────────────────────────────────────
  async function handleAnaliz() {
    setLoad('analiz', true); setErr('analiz', '');
    try {
      const r = await analyzeYKSPerformance(yks, yks?.trials || []);
      setRes('analiz', r);
    } catch (e) { setErr('analiz', parseGeminiError(e)); }
    setLoad('analiz', false);
  }

  // ── Soru Çözüm ───────────────────────────────────────────
  async function handleSolveImage(file) {
    if (!file) return;
    const compressed = await compressImage(file);
    setSolveImage(compressed);
    setSolvePreview(compressed);
  }

  async function handleSolve() {
    if (!solveImage) return;
    setLoad('soru', true); setErr('soru', ''); setRes('soru', '');
    try {
      const r = await solveQuestionWithVision(solveImage);
      setRes('soru', r);
    } catch (e) { setErr('soru', parseGeminiError(e)); }
    setLoad('soru', false);
  }

  // ── Burnout ──────────────────────────────────────────────
  async function handleBurnout() {
    setLoad('burnout', true); setErr('burnout', '');
    try {
      const r = await detectBurnout({
        pomodoroWorkSessions: weekPomodoros,
        habitCompletionRate: todayHabitRate,
        taskCompletionRate: taskRate,
        daysLeft,
      });
      setRes('burnout', r);
    } catch (e) { setErr('burnout', parseGeminiError(e)); }
    setLoad('burnout', false);
  }

  // ── Haftalık Retrospektif ────────────────────────────────
  async function handleRetro() {
    setLoad('retro', true); setErr('retro', '');
    try {
      const r = await generateWeeklyRetrospective({
        pomodoroSessions: weekPomodoros,
        taskCompleted: weekTasks,
        taskTotal: weekTasksTotal,
        habitNames: habits.map(h => h.name),
        examScores: (yks?.trials || []).slice(-2),
        userName: user?.displayName,
      });
      setRes('retro', r);
    } catch (e) { setErr('retro', parseGeminiError(e)); }
    setLoad('retro', false);
  }

  // ── Hata Defteri ─────────────────────────────────────────
  async function handleAutoTag() {
    if (!errorForm.question) return;
    setTagging(true);
    try {
      const tag = await autoTagErrorNote(errorForm.question);
      setErrorForm(f => ({ ...f, subject: tag.subject, topic: tag.topic }));
    } catch { /* ignore */ }
    setTagging(false);
  }

  async function handleAddError() {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    addHataDefteri({ ...errorForm, id });
    addBadge('first_error');
    setShowAddError(false);
    setErrorForm({ subject: 'TYT Matematik', topic: '', question: '', myAnswer: '', correctAnswer: '' });
    setErrorPhoto(null);
    setErrorPhotoPreview(null);
  }

  // ── Öz-Analiz ────────────────────────────────────────────
  async function handlePanel() {
    setLoad('panel', true); setErr('panel', '');
    try {
      const r = await generateSelfReview({
        studyHours: totalStudyHours,
        taskCompleted: weekTasks,
        taskTotal: weekTasksTotal,
        habitCompletionRate: todayHabitRate,
        pomodoroSessions: weekPomodoros,
        examTrials: yks?.trials || [],
        userName: user?.displayName,
      });
      setRes('panel', r);
    } catch (e) { setErr('panel', parseGeminiError(e)); }
    setLoad('panel', false);
  }

  // ── Verimlilik skoru ─────────────────────────────────────
  const pomScore = Math.min(100, Math.round((weekPomodoros / 10) * 100));
  const habitScore = Math.round(todayHabitRate);
  const taskScore = Math.round(taskRate);
  const overallScore = Math.round(pomScore * 0.4 + habitScore * 0.3 + taskScore * 0.3);

  // ── Tekrar (SM-2 due items) ───────────────────────────────
  const dueItems = hataDefteriItems.filter(i => {
    if (!i.nextReview) return true;
    return !isBefore(new Date(today), parseISO(i.nextReview)) || i.nextReview <= today;
  });

  // ─────────────────────────────────────────────────────────
  function renderPlan() {
    return (
      <div className="space-y-4">
        {/* Streak & badges row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">{aiStreak?.count || 0} günlük seri</span>
          </div>
          {badges.map(b => BADGE_DEFS[b] && (
            <div key={b} className="flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2">
              <span className="text-base">{BADGE_DEFS[b].icon}</span>
              <span className={`text-xs font-medium ${BADGE_DEFS[b].color}`}>{BADGE_DEFS[b].label}</span>
            </div>
          ))}
        </div>

        {/* Plan settings */}
        <AICard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-200">Plan Ayarları</h3>
            <button onClick={() => setShowPlanSettings(s => !s)} className="text-xs text-violet-400 hover:text-violet-300">
              {showPlanSettings ? 'Kapat' : 'Düzenle'}
            </button>
          </div>
          <AnimatePresence>
            {showPlanSettings && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    className="bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                    placeholder="Hedef bölüm"
                    value={planSettings.targetDept || ''}
                    onChange={e => {
                      const v = { ...planSettings, targetDept: e.target.value };
                      setPlanSettings(v);
                      localStorage.setItem('ai-plan-settings', JSON.stringify(v));
                    }}
                  />
                  <input
                    className="bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                    placeholder="Hedef üniversite"
                    value={planSettings.targetUni || ''}
                    onChange={e => {
                      const v = { ...planSettings, targetUni: e.target.value };
                      setPlanSettings(v);
                      localStorage.setItem('ai-plan-settings', JSON.stringify(v));
                    }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-500">Günlük çalışma saati:</label>
                  <input
                    type="number" min={1} max={16}
                    className="w-16 bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-2 py-1.5 text-sm text-zinc-200 text-center focus:outline-none focus:border-violet-500/50"
                    value={planSettings.dailyHours || 8}
                    onChange={e => {
                      const v = { ...planSettings, dailyHours: +e.target.value };
                      setPlanSettings(v);
                      localStorage.setItem('ai-plan-settings', JSON.stringify(v));
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-3 mt-3">
            <AIButton onClick={handleGeneratePlan} loading={loading.plan}>
              Bugün İçin Plan Üret
            </AIButton>
            {planIsToday && (
              <span className="text-xs text-zinc-500">Son üretim: bugün</span>
            )}
          </div>
          {errors.plan && <p className="text-xs text-red-400 mt-2">{errors.plan}</p>}
        </AICard>

        {/* Plan blocks */}
        {loading.plan && <LoadingSpinner text="Günlük plan hazırlanıyor..." />}
        {planIsToday && planBlocks.length > 0 && (
          <AICard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Bugünün Planı</h3>
                {aiPlanCache?.plan?.motivationNote && (
                  <p className="text-xs text-violet-400 mt-0.5">{aiPlanCache.plan.motivationNote}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-violet-400">{planCompletion}%</div>
                <div className="text-[10px] text-zinc-600">tamamlandı</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-violet-600 rounded-full"
                animate={{ width: `${planCompletion}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="space-y-2">
              {planBlocks.map(block => {
                const done = completedIds.includes(block.id);
                return (
                  <motion.button
                    key={block.id}
                    onClick={() => toggleAIPlanBlock(block.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      done
                        ? 'bg-violet-600/10 border-violet-500/20'
                        : 'bg-zinc-800/40 border-zinc-700/30 hover:border-zinc-600/50'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={16} className="text-violet-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={16} className="text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {block.subject}
                        </span>
                        {block.topic && (
                          <span className="text-xs text-zinc-500">— {block.topic}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {block.time && <span className="text-[11px] text-zinc-600">{block.time}</span>}
                        {block.pomodoros && (
                          <span className="text-[11px] text-zinc-600">{block.pomodoros} 🍅</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {aiPlanCache?.plan?.burnoutRisk && (
              <div className={`mt-4 text-xs px-3 py-2 rounded-lg ${
                aiPlanCache.plan.burnoutRisk === 'high' ? 'bg-red-500/10 text-red-400' :
                aiPlanCache.plan.burnoutRisk === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-green-500/10 text-green-400'
              }`}>
                Burnout riski: {aiPlanCache.plan.burnoutRisk === 'high' ? 'Yüksek ⚠️' : aiPlanCache.plan.burnoutRisk === 'medium' ? 'Orta 🟡' : 'Düşük ✅'}
              </div>
            )}
          </AICard>
        )}
      </div>
    );
  }

  function renderAnaliz() {
    const hasTrials = (yks?.trials || []).length > 0;
    return (
      <AICard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Deneme Performans Analizi</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Son 5 deneme üzerinden hata kalıpları ve öneriler</p>
          </div>
          <AIButton onClick={handleAnaliz} loading={loading.analiz} disabled={!hasTrials}>
            Analiz Et
          </AIButton>
        </div>
        {!hasTrials && (
          <p className="text-sm text-zinc-600 text-center py-6">YKS sayfasından deneme ekleyin.</p>
        )}
        {loading.analiz && <LoadingSpinner />}
        {errors.analiz && <p className="text-xs text-red-400">{errors.analiz}</p>}
        <ResultBox text={results.analiz} />
      </AICard>
    );
  }

  function renderSoru() {
    return (
      <AICard>
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">Soru Çözüm (Görsel)</h3>
        <p className="text-xs text-zinc-500 mb-4">Sorunun fotoğrafını yükle, adım adım çözüm al</p>

        <input ref={solveInputRef} type="file" accept="image/*" className="hidden"
          onChange={async (e) => { if (e.target.files[0]) await handleSolveImage(e.target.files[0]); }}
        />

        {solvePreview ? (
          <div className="relative mb-4">
            <img src={solvePreview} alt="soru" className="max-h-64 rounded-xl object-contain bg-zinc-800/50 w-full" />
            <button
              onClick={() => { setSolveImage(null); setSolvePreview(null); setRes('soru', ''); }}
              className="absolute top-2 right-2 bg-zinc-900/80 text-zinc-400 hover:text-red-400 rounded-lg p-1.5 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => solveInputRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-zinc-700/50 hover:border-violet-500/40 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-violet-400 transition-all mb-4"
          >
            <Upload size={22} />
            <span className="text-sm">Fotoğraf yükle</span>
          </button>
        )}

        <div className="flex gap-3">
          <AIButton onClick={handleSolve} loading={loading.soru} disabled={!solveImage}>
            Çöz
          </AIButton>
          {solvePreview && (
            <button onClick={() => solveInputRef.current?.click()} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Değiştir
            </button>
          )}
        </div>
        {errors.soru && <p className="text-xs text-red-400 mt-2">{errors.soru}</p>}
        {loading.soru && <LoadingSpinner text="Soru çözülüyor..." />}
        <ResultBox text={results.soru} />
      </AICard>
    );
  }

  function renderBurnout() {
    const r = results.burnout;
    return (
      <div className="space-y-4">
        <AICard>
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">Burnout Dedektörü</h3>
          <p className="text-xs text-zinc-500 mb-4">Son 7 günün verilerine göre tükenme riski analizi</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Pomodoro', value: weekPomodoros, icon: Clock, unit: 'seans' },
              { label: 'Alışkanlık', value: `${Math.round(todayHabitRate)}%`, icon: Star },
              { label: 'Görev', value: `${Math.round(taskRate)}%`, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon, unit }) => (
              <div key={label} className="bg-zinc-800/40 rounded-xl p-3 text-center">
                <Icon size={14} className="text-zinc-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-zinc-200">{value}</div>
                <div className="text-[10px] text-zinc-600">{label} {unit}</div>
              </div>
            ))}
          </div>

          <AIButton onClick={handleBurnout} loading={loading.burnout}>
            Risk Analizi Yap
          </AIButton>
          {errors.burnout && <p className="text-xs text-red-400 mt-2">{errors.burnout}</p>}
        </AICard>

        {loading.burnout && <LoadingSpinner text="Analiz ediliyor..." />}

        {r && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <AICard className={
              r.risk === 'high' ? 'border-red-500/30' :
              r.risk === 'medium' ? 'border-yellow-500/30' : 'border-green-500/30'
            }>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-2xl font-black ${
                  r.risk === 'high' ? 'text-red-400' :
                  r.risk === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {r.riskTr || r.risk}
                </div>
                <span className="text-zinc-400 text-sm">{r.risk === 'high' ? '⚠️' : r.risk === 'medium' ? '🟡' : '✅'}</span>
              </div>
              <p className="text-sm text-zinc-300 mb-3">{r.message}</p>
              {r.recommendations?.length > 0 && (
                <ul className="space-y-1.5">
                  {r.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </AICard>
          </motion.div>
        )}
      </div>
    );
  }

  function renderRetro() {
    return (
      <AICard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Haftalık Retrospektif</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Bu haftanın özeti ve gelecek hafta önerileri</p>
          </div>
          <AIButton onClick={handleRetro} loading={loading.retro}>
            Özet Üret
          </AIButton>
        </div>
        {loading.retro && <LoadingSpinner text="Haftalık özet hazırlanıyor..." />}
        {errors.retro && <p className="text-xs text-red-400">{errors.retro}</p>}
        <ResultBox text={results.retro} />
      </AICard>
    );
  }

  function renderHata() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Hata Defteri</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{hataDefteriItems.length} kayıt</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddError(true)}
            className="flex items-center gap-1.5 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/25 text-violet-400 rounded-xl px-3 py-2 text-sm transition-all"
          >
            <Plus size={14} /> Ekle
          </motion.button>
        </div>

        {hataDefteriItems.length === 0 && (
          <AICard>
            <p className="text-sm text-zinc-600 text-center py-6">Henüz hata notu yok. İlk notunu ekle!</p>
          </AICard>
        )}

        <div className="space-y-2">
          {hataDefteriItems.map(item => {
            const photo = localStorage.getItem(`hataDefteriPhoto_${item.id}`);
            const isDue = item.nextReview <= today;
            return (
              <motion.div key={item.id} layout className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {photo && (
                    <img src={photo} alt="hata" className="w-14 h-14 rounded-lg object-cover shrink-0 bg-zinc-800" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-violet-400">{item.subject}</span>
                      {item.topic && <span className="text-xs text-zinc-500">{item.topic}</span>}
                      {isDue && <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">Tekrar zamanı</span>}
                    </div>
                    <p className="text-sm text-zinc-300 mt-1 line-clamp-2">{item.question}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-600">
                      <span>Tekrar #{item.repetitions}</span>
                      <span>Sonraki: {item.nextReview}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteHataDefteri(item.id)} className="text-zinc-700 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add modal */}
        <AnimatePresence>
          {showAddError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
              onClick={() => setShowAddError(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 space-y-3"
              >
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Hata Notu Ekle</h3>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                    value={errorForm.subject}
                    onChange={e => setErrorForm(f => ({ ...f, subject: e.target.value }))}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="relative">
                    <input
                      className="w-full bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 pr-10"
                      placeholder="Konu (otomatik etiket)"
                      value={errorForm.topic}
                      onChange={e => setErrorForm(f => ({ ...f, topic: e.target.value }))}
                    />
                    <button onClick={handleAutoTag} disabled={tagging || !errorForm.question} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-violet-400 disabled:opacity-30 transition-colors">
                      {tagging ? <Loader2 size={13} className="animate-spin" /> : <Tag size={13} />}
                    </button>
                  </div>
                </div>

                <textarea
                  className="w-full bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
                  placeholder="Soru açıklaması"
                  rows={2}
                  value={errorForm.question}
                  onChange={e => setErrorForm(f => ({ ...f, question: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                    placeholder="Benim cevabım"
                    value={errorForm.myAnswer}
                    onChange={e => setErrorForm(f => ({ ...f, myAnswer: e.target.value }))}
                  />
                  <input
                    className="bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                    placeholder="Doğru cevap"
                    value={errorForm.correctAnswer}
                    onChange={e => setErrorForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  />
                </div>

                {/* Photo */}
                <input type="file" accept="image/*" className="hidden" ref={errorPhotoRef}
                  onChange={async (e) => {
                    if (!e.target.files[0]) return;
                    const comp = await compressImage(e.target.files[0]);
                    setErrorPhoto(comp);
                    setErrorPhotoPreview(comp);
                  }}
                />
                {errorPhotoPreview ? (
                  <div className="relative">
                    <img src={errorPhotoPreview} alt="foto" className="h-28 rounded-xl object-contain bg-zinc-800/50 w-full" />
                    <button onClick={() => { setErrorPhoto(null); setErrorPhotoPreview(null); }} className="absolute top-1.5 right-1.5 bg-zinc-900/80 text-zinc-400 hover:text-red-400 rounded-lg p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => errorPhotoRef.current?.click()} className="w-full h-16 border border-dashed border-zinc-700/40 hover:border-violet-500/30 rounded-xl flex items-center justify-center gap-2 text-zinc-600 hover:text-violet-400 text-sm transition-all">
                    <Upload size={15} /> Fotoğraf ekle (opsiyonel)
                  </button>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowAddError(false)} className="flex-1 py-2.5 text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-700/40 rounded-xl transition-colors">
                    Vazgeç
                  </button>
                  <button
                    onClick={handleAddError}
                    disabled={!errorForm.question}
                    className="flex-1 py-2.5 text-sm bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:opacity-50 text-white rounded-xl transition-all font-medium"
                  >
                    Kaydet
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  function renderTekrar() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Tekrar Zamanı</h3>
            <p className="text-xs text-zinc-500 mt-0.5">SM-2 algoritması — {dueItems.length} konu bekliyor</p>
          </div>
        </div>

        {dueItems.length === 0 && (
          <AICard>
            <p className="text-sm text-zinc-500 text-center py-6">Bugün tekrar yapılacak konu yok. 🎉</p>
          </AICard>
        )}

        <div className="space-y-3">
          {dueItems.map(item => {
            const photo = localStorage.getItem(`hataDefteriPhoto_${item.id}`);
            return (
              <AICard key={item.id}>
                <div className="flex gap-3 mb-3">
                  {photo && <img src={photo} alt="soru" className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-800" />}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-violet-400">{item.subject}</span>
                      <span className="text-xs text-zinc-500">{item.topic}</span>
                    </div>
                    <p className="text-sm text-zinc-300">{item.question}</p>
                    {item.correctAnswer && (
                      <p className="text-xs text-green-400 mt-1">✓ {item.correctAnswer}</p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-zinc-600 mb-3">Tekrar #{item.repetitions} · EF: {item.easeFactor?.toFixed(2)}</div>
                <div className="flex gap-2">
                  {[
                    { q: 1, label: 'Bilmedim', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
                    { q: 3, label: 'Zorlandım', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
                    { q: 5, label: 'Bildim', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
                  ].map(({ q, label, color }) => (
                    <button
                      key={q}
                      onClick={() => {
                        reviewHataDefteri(item.id, q);
                        const count = (hataDefteriItems.filter(i => i.lastReviewedAt?.slice(0,10) === today).length) + 1;
                        if (count >= 5) addBadge('spaced_5');
                      }}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all hover:scale-102 ${color}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </AICard>
            );
          })}
        </div>
      </div>
    );
  }

  function renderVerimlilik() {
    const scores = [
      { label: 'Pomodoro', score: pomScore, detail: `${weekPomodoros}/10 seans`, icon: Clock, color: 'violet' },
      { label: 'Alışkanlık', score: habitScore, detail: `Bugün: %${habitScore}`, icon: Star, color: 'blue' },
      { label: 'Görev', score: taskScore, detail: `${weekTasks}/${weekTasksTotal} haftalık`, icon: CheckCircle2, color: 'green' },
    ];

    const colorMap = {
      violet: { bg: 'bg-violet-600', text: 'text-violet-400', ring: 'stroke-violet-500' },
      blue: { bg: 'bg-blue-600', text: 'text-blue-400', ring: 'stroke-blue-500' },
      green: { bg: 'bg-green-600', text: 'text-green-400', ring: 'stroke-green-500' },
    };

    return (
      <div className="space-y-4">
        {/* Overall score ring */}
        <AICard className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-zinc-800" />
              <motion.circle
                cx="50" cy="50" r="40" strokeWidth="8" fill="none"
                className="stroke-violet-500"
                strokeDasharray="251.3"
                initial={{ strokeDashoffset: 251.3 }}
                animate={{ strokeDashoffset: 251.3 - (251.3 * overallScore / 100) }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-zinc-100">{overallScore}</span>
              <span className="text-[10px] text-zinc-600">skor</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Haftalık Verimlilik</h3>
            <p className="text-xs text-zinc-500 mt-1">40% Pomodoro · 30% Alışkanlık · 30% Görev</p>
            <p className="text-xs mt-2">
              {overallScore >= 80 ? '🔥 Harika haftaydı!' :
               overallScore >= 50 ? '👍 İyi gidiyorsun' :
               '💪 Daha iyisini yapabilirsin'}
            </p>
          </div>
        </AICard>

        <div className="grid gap-3">
          {scores.map(({ label, score, detail, icon: Icon, color }) => {
            const c = colorMap[color];
            return (
              <AICard key={label}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={15} className={c.text} />
                  <span className="text-sm font-medium text-zinc-200">{label}</span>
                  <span className="ml-auto text-sm font-bold text-zinc-300">{score}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${c.bg} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 mt-1.5">{detail}</p>
              </AICard>
            );
          })}
        </div>
      </div>
    );
  }

  function renderPanel() {
    return (
      <AICard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Öz-Analiz Paneli</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Veli perspektifinden bu haftanın değerlendirmesi</p>
          </div>
          <AIButton onClick={handlePanel} loading={loading.panel}>
            Değerlendir
          </AIButton>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Çalışma', value: `${totalStudyHours}h`, icon: BookOpen },
            { label: 'Pomodoro', value: weekPomodoros, icon: Clock },
            { label: 'Görev', value: `${weekTasks}/${weekTasksTotal}`, icon: CheckCircle2 },
            { label: 'Alışkanlık', value: `%${Math.round(todayHabitRate)}`, icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-zinc-800/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-zinc-500" />
                <span className="text-[11px] text-zinc-600">{label}</span>
              </div>
              <div className="text-lg font-bold text-zinc-200">{value}</div>
            </div>
          ))}
        </div>

        {loading.panel && <LoadingSpinner text="Değerlendirme hazırlanıyor..." />}
        {errors.panel && <p className="text-xs text-red-400">{errors.panel}</p>}
        <ResultBox text={results.panel} />
      </AICard>
    );
  }

  const tabContent = { plan: renderPlan, analiz: renderAnaliz, soru: renderSoru, burnout: renderBurnout, retro: renderRetro, hata: renderHata, tekrar: renderTekrar, verimlilik: renderVerimlilik, panel: renderPanel };

  return (
    <div className="min-h-full p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-violet-400" />
          <h1 className="text-lg font-bold text-zinc-100">AI Merkezi</h1>
        </div>
        <p className="text-xs text-zinc-500">YKS hazırlığın için yapay zeka destekli araçlar</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-5 scrollbar-none snap-x snap-mandatory">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badgeCount = id === 'tekrar' ? dueItems.length : 0;
          return (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 snap-start relative ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/25'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <Icon size={13} />
              {label}
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {badgeCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {tabContent[activeTab]?.()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
