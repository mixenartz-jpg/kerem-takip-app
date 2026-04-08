import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    icon: '👋',
    title: 'Hoş Geldin!',
    desc: 'Günlük Takip ile görevlerini, alışkanlıklarını, notlarını ve hedeflerini tek bir yerden yönet.',
    cta: 'Devam Et',
  },
  {
    icon: '⚡',
    title: 'Her Şey Bir Arada',
    desc: null,
    features: [
      { icon: '✅', label: 'Görevler & Alt Görevler' },
      { icon: '🔄', label: 'Alışkanlık Takibi' },
      { icon: '📋', label: 'Kanban Projeler' },
      { icon: '🍅', label: 'Pomodoro Zamanlayıcı' },
      { icon: '📊', label: 'İstatistikler' },
      { icon: '📚', label: 'Ders & Sınav Takvimi' },
    ],
    cta: 'Devam Et',
  },
  {
    icon: '🚀',
    title: 'Hazırsın!',
    desc: 'Ctrl+K ile komut paletini açabilir, sol menüden tüm bölümlere ulaşabilirsin.',
    cta: 'Başlayalım',
  },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next) => {
    if (next >= STEPS.length) {
      onFinish();
      return;
    }
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const current = STEPS[step];

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

      {/* App blurred behind */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex">
        <div className="w-52 border-r border-zinc-800" style={{ background: '#111116' }} />
        <div className="flex-1 p-5 grid grid-cols-3 gap-3 content-start pt-16">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl" style={{ background: '#1a1a1f' }} />
          ))}
        </div>
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
        style={{ background: '#111116', border: '1px solid #27272a', boxShadow: '0 0 60px #7c3aed1a, 0 40px 80px #00000088' }}
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Step dots */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full cursor-pointer"
              style={{ height: 6, background: i === step ? '#7c3aed' : '#3f3f46' }}
              animate={{ width: i === step ? 24 : 6 }}
              transition={{ duration: 0.3 }}
              onClick={() => go(i)}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="px-9 pb-8 pt-4" style={{ minHeight: 300 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon */}
              <motion.div
                className="flex items-center justify-center rounded-2xl text-4xl mb-5"
                style={{ width: 80, height: 80, background: 'radial-gradient(circle, #1e1b4b, #0f0f1a)', border: '1px solid #7c3aed44', boxShadow: '0 0 24px #7c3aed33' }}
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {current.icon}
              </motion.div>

              <h2 className="text-xl font-bold text-zinc-100 mb-3">{current.title}</h2>

              {current.desc && (
                <p className="text-sm text-zinc-500 leading-relaxed">{current.desc}</p>
              )}

              {current.features && (
                <div className="grid grid-cols-2 gap-2 w-full mt-1">
                  {current.features.map((f, i) => (
                    <motion.div
                      key={f.label}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left"
                      style={{ background: '#1a1a22', border: '1px solid #27272a' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.06 }}
                    >
                      <span className="text-base">{f.icon}</span>
                      <span className="text-xs text-zinc-400">{f.label}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-9 pb-8 flex flex-col gap-3">
          <motion.button
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#7c3aed', boxShadow: '0 4px 20px #7c3aed55' }}
            onClick={() => go(step + 1)}
            whileHover={{ scale: 1.02, background: '#6d28d9' }}
            whileTap={{ scale: 0.98 }}
          >
            {current.cta}
          </motion.button>

          {step < STEPS.length - 1 && (
            <button
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              onClick={onFinish}
            >
              Geç
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
