import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, X, Zap, BarChart2, BookOpen, Bot } from 'lucide-react';
import { usePremium } from '../../context/PremiumContext';

const FEATURE_META = {
  ai: {
    icon: Bot,
    label: 'AI Merkezi',
    description: 'Gemini destekli AI asistan, video özetleyici ve kişisel plan önerileri.',
  },
  istatistikler: {
    icon: BarChart2,
    label: 'İleri İstatistikler',
    description: 'Detaylı analitik grafikler, trend analizi ve kişisel raporlar.',
  },
  hata_defteri: {
    icon: BookOpen,
    label: 'Hata Defteri',
    description: 'SM-2 algoritmasıyla aralıklı tekrar sistemi ve akıllı tekrar planı.',
  },
};

function UpgradeModal({ feature, onClose }) {
  const meta = FEATURE_META[feature] || { icon: Star, label: 'Premium Özellik', description: '' };
  const Icon = meta.icon;

  const perks = [
    { icon: Bot, text: 'AI Merkezi & Video Özetleyici' },
    { icon: BarChart2, text: 'İleri Analitik & Raporlar' },
    { icon: BookOpen, text: 'Hata Defteri (SM-2 Tekrar)' },
    { icon: Zap, text: 'Öncelikli destek & yeni özellikler' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-zinc-900 border border-white/8 rounded-2xl p-6 shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Star size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-violet-400 font-medium">Premium Özellik</p>
              <p className="text-sm font-bold text-zinc-100">{meta.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors mt-0.5">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">{meta.description}</p>

        {/* Perks */}
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-5 flex flex-col gap-2.5">
          <p className="text-xs text-zinc-500 font-medium mb-1">Premium ile ne kazanırsın?</p>
          {perks.map(({ icon: PIcon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-xs text-zinc-300">
              <PIcon size={13} className="text-violet-400 shrink-0" />
              {text}
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-all"
          onClick={onClose}
        >
          Anladım
        </motion.button>
        <p className="text-center text-xs text-zinc-600 mt-3">
          Premium erişim için yöneticinize başvurun.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function PremiumGate({ feature, children }) {
  const { canAccess } = usePremium();
  const [showModal, setShowModal] = useState(false);

  if (canAccess(feature)) return children;

  return (
    <>
      <div className="relative w-full h-full min-h-[300px]">
        {/* Blurred content preview */}
        <div className="pointer-events-none select-none blur-sm opacity-40 w-full h-full">
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-violet-500/30 flex items-center justify-center shadow-xl">
              <Lock size={22} className="text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-200">Premium Özellik</p>
              <p className="text-xs text-zinc-500 mt-0.5">Bu özelliğe erişmek için premium gerekli</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-all"
            >
              <Star size={12} />
              Premium'u Keşfet
            </motion.button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <UpgradeModal feature={feature} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
