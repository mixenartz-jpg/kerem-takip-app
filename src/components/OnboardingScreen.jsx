import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ── Step 1: Welcome ──────────────────────────────────────────
function StepWelcome({ user }) {
  const name = user?.displayName?.split(' ')[0] || 'Öğrenci';
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="flex items-center justify-center rounded-2xl text-5xl mb-5"
        style={{ width: 88, height: 88, background: 'radial-gradient(circle, #1e1b4b, #0f0f1a)', border: '1px solid #7c3aed44', boxShadow: '0 0 32px #7c3aed44' }}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        👋
      </motion.div>
      <h2 className="text-2xl font-bold text-zinc-100 mb-3">Hoş geldin, {name}!</h2>
      <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
        Dash YKS ile sınavına hazırlanırken tüm sürecini tek bir yerden yönet.
        Hızlıca kurulum yapalım.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2 w-full">
        {[
          { icon: '🎯', label: 'YKS Hazırlık' },
          { icon: '🤖', label: 'AI Koç' },
          { icon: '🏆', label: 'Arkadaş Yarışması' },
        ].map((f, i) => (
          <motion.div
            key={f.label}
            className="flex flex-col items-center gap-1.5 rounded-xl py-3"
            style={{ background: '#1a1a22', border: '1px solid #27272a' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
          >
            <span className="text-xl">{f.icon}</span>
            <span className="text-[10px] text-zinc-500 font-medium">{f.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Mode ─────────────────────────────────────────────
function StepMode({ mode, setMode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="flex items-center justify-center rounded-2xl text-5xl mb-4"
        style={{ width: 88, height: 88, background: 'radial-gradient(circle, #1e1b4b, #0f0f1a)', border: '1px solid #7c3aed44', boxShadow: '0 0 32px #7c3aed44' }}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        🎯
      </motion.div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1">Amacın ne?</h2>
      <p className="text-xs text-zinc-500 mb-5">Uygulamayı senin için kişiselleştirelim</p>
      <div className="flex flex-col gap-2.5 w-full">
        {[
          { value: 'yks', icon: '🎓', title: 'YKS Hazırlık', desc: 'TYT/AYT odaklı özellikler, AI koç, deneme analizi' },
          { value: 'daily', icon: '⚡', title: 'Genel Verimlilik', desc: 'Görev yönetimi, alışkanlıklar, projeler, notlar' },
        ].map(opt => (
          <motion.button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all"
            style={{
              background: mode === opt.value ? 'rgba(124,58,237,0.15)' : '#1a1a22',
              border: mode === opt.value ? '1px solid rgba(124,58,237,0.4)' : '1px solid #27272a',
            }}
          >
            <span className="text-2xl">{opt.icon}</span>
            <div>
              <p className="text-sm font-semibold text-zinc-100">{opt.title}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{opt.desc}</p>
            </div>
            {mode === opt.value && (
              <motion.div
                layoutId="modeCheck"
                className="ml-auto w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="text-white text-[10px] font-bold">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Step 3: YKS Info ─────────────────────────────────────────
function StepYKSInfo({ examDate, setExamDate, examType, setExamType }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="flex items-center justify-center rounded-2xl text-5xl mb-4"
        style={{ width: 88, height: 88, background: 'radial-gradient(circle, #1e1b4b, #0f0f1a)', border: '1px solid #7c3aed44', boxShadow: '0 0 32px #7c3aed44' }}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        📅
      </motion.div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1">YKS Bilgilerin</h2>
      <p className="text-xs text-zinc-500 mb-5">Geri sayım ve analiz için kullanılır</p>

      <div className="w-full space-y-3 text-left">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Sınav Tarihi</label>
          <input
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Sınav Türü</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'tyt', label: 'Sadece TYT', icon: '📝' },
              { value: 'tyt+ayt', label: 'TYT + AYT', icon: '🎓' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setExamType(opt.value)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all text-left"
                style={{
                  background: examType === opt.value ? 'rgba(124,58,237,0.15)' : '#1a1a22',
                  border: examType === opt.value ? '1px solid rgba(124,58,237,0.4)' : '1px solid #27272a',
                }}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="text-xs text-zinc-300 font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Daily Routine ────────────────────────────────────
function StepRoutine({ studyHours, setStudyHours, studyDays, toggleDay }) {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="flex items-center justify-center rounded-2xl text-5xl mb-4"
        style={{ width: 88, height: 88, background: 'radial-gradient(circle, #1e1b4b, #0f0f1a)', border: '1px solid #7c3aed44', boxShadow: '0 0 32px #7c3aed44' }}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        ⏰
      </motion.div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1">Günlük Rutin</h2>
      <p className="text-xs text-zinc-500 mb-5">AI planın bunu temel alır</p>

      <div className="w-full space-y-4 text-left">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Günlük Çalışma</label>
            <span className="text-sm font-bold text-violet-400">{studyHours} saat</span>
          </div>
          <input
            type="range"
            min={1} max={14} value={studyHours}
            onChange={e => setStudyHours(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
            <span>1 saat</span><span>14 saat</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 block">Çalışma Günleri</label>
          <div className="flex gap-1.5 justify-between">
            {days.map((d, i) => {
              const dayNum = i + 1;
              const active = studyDays.includes(dayNum);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(dayNum)}
                  className="flex-1 py-2 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: active ? 'rgba(124,58,237,0.2)' : '#1a1a22',
                    border: active ? '1px solid rgba(124,58,237,0.4)' : '1px solid #27272a',
                    color: active ? '#a78bfa' : '#71717a',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Goals ────────────────────────────────────────────
function StepGoals({ tytGoal, setTytGoal, aytGoal, setAytGoal }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="flex items-center justify-center rounded-2xl text-5xl mb-4"
        style={{ width: 88, height: 88, background: 'radial-gradient(circle, #1e1b4b, #0f0f1a)', border: '1px solid #7c3aed44', boxShadow: '0 0 32px #7c3aed44' }}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        🏆
      </motion.div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1">Hedef Netlerin</h2>
      <p className="text-xs text-zinc-500 mb-5">İlerleme takibi için kullanılır, sonra değiştirebilirsin</p>

      <div className="w-full space-y-3 text-left">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">TYT Hedef Net</label>
          <div className="relative">
            <input
              type="number"
              min={0} max={120} value={tytGoal}
              onChange={e => setTytGoal(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-colors"
              placeholder="örn. 100"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">/ 120</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">AYT Hedef Net (opsiyonel)</label>
          <div className="relative">
            <input
              type="number"
              min={0} max={160} value={aytGoal}
              onChange={e => setAytGoal(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-colors"
              placeholder="örn. 80"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">/ 160</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 6: Ready ────────────────────────────────────────────
function StepReady({ user, mode, studyHours, examDate }) {
  const name = user?.displayName?.split(' ')[0] || 'Öğrenci';
  const daysLeft = examDate
    ? Math.max(0, Math.round((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="flex items-center justify-center rounded-2xl text-5xl mb-4"
        style={{ width: 88, height: 88, background: 'radial-gradient(circle, #1e1b4b, #0f0f1a)', border: '1px solid #7c3aed44', boxShadow: '0 0 32px #7c3aed44' }}
        initial={{ scale: 0.6 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        🚀
      </motion.div>
      <h2 className="text-xl font-bold text-zinc-100 mb-2">Hazırsın, {name}!</h2>
      <p className="text-xs text-zinc-500 leading-relaxed mb-5 max-w-xs">
        {daysLeft !== null
          ? `YKS'ye ${daysLeft} gün kaldı. Günde ${studyHours} saat çalışarak hedefe ulaşabilirsin!`
          : `Günde ${studyHours} saat çalışarak hedeflerine ulaşabilirsin.`}
      </p>

      <div className="w-full grid grid-cols-2 gap-2">
        {[
          { icon: '⌘K', label: 'Komut paleti' },
          { icon: '🤖', label: 'AI koçun hazır' },
          { icon: '📊', label: 'Deneme analizi' },
          { icon: '🏅', label: 'Arkadaş sıralaması' },
        ].map((f, i) => (
          <motion.div
            key={f.label}
            className="flex items-center gap-2 rounded-xl p-3"
            style={{ background: '#1a1a22', border: '1px solid #27272a' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <span className="text-base w-6 text-center">{f.icon}</span>
            <span className="text-[11px] text-zinc-400">{f.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function OnboardingScreen({ onFinish }) {
  const { updateUserMode, setYKSExamDate, updateProfile } = useApp();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Step 2 — mode
  const [mode, setMode] = useState('yks');
  // Step 3 — yks info
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState('tyt+ayt');
  // Step 4 — routine
  const [studyHours, setStudyHours] = useState(6);
  const [studyDays, setStudyDays] = useState([1, 2, 3, 4, 5]);
  // Step 5 — goals
  const [tytGoal, setTytGoal] = useState('');
  const [aytGoal, setAytGoal] = useState('');

  const TOTAL_STEPS = 6;

  const toggleDay = (d) =>
    setStudyDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const go = (next) => {
    if (next >= TOTAL_STEPS) {
      handleFinish();
      return;
    }
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handleFinish = async () => {
    updateUserMode(mode);
    if (examDate) setYKSExamDate(examDate);
    updateProfile({
      dailyStudyHours: studyHours,
      studyDays,
      tytGoal: tytGoal ? Number(tytGoal) : undefined,
      aytGoal: aytGoal ? Number(aytGoal) : undefined,
      examType,
    });
    onFinish();
  };

  const ctaLabel = step === TOTAL_STEPS - 1 ? 'Başlayalım!' : 'Devam Et';

  const stepContent = [
    <StepWelcome user={user} />,
    <StepMode mode={mode} setMode={setMode} />,
    <StepYKSInfo examDate={examDate} setExamDate={setExamDate} examType={examType} setExamType={setExamType} />,
    <StepRoutine studyHours={studyHours} setStudyHours={setStudyHours} studyDays={studyDays} toggleDay={toggleDay} />,
    <StepGoals tytGoal={tytGoal} setTytGoal={setTytGoal} aytGoal={aytGoal} setAytGoal={setAytGoal} />,
    <StepReady user={user} mode={mode} studyHours={studyHours} examDate={examDate} />,
  ];

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: '#0a0a0f' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #7c3aed12, transparent 70%)', filter: 'blur(40px)' }}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
        style={{ background: '#111116', border: '1px solid #27272a', boxShadow: '0 0 60px #7c3aed1a, 0 40px 80px #00000088' }}
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <motion.div
            className="h-full bg-violet-600 rounded-full"
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 pt-5 pb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ height: 5, background: i <= step ? '#7c3aed' : '#3f3f46' }}
              animate={{ width: i === step ? 20 : 5 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="px-7 pb-6 pt-3" style={{ minHeight: 340 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex flex-col gap-2">
          <motion.button
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#7c3aed', boxShadow: '0 4px 20px #7c3aed55' }}
            onClick={() => go(step + 1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {ctaLabel}
          </motion.button>

          {step < TOTAL_STEPS - 1 && (
            <button
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1"
              onClick={handleFinish}
            >
              Geç
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
