import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shootConfetti } from '../../utils/confetti';

export default function QuizSummary({ correct, total, subject, topic, onRetry }) {
  const navigate = useNavigate();
  const pct = Math.round((correct / total) * 100);

  useEffect(() => {
    if (pct >= 80) shootConfetti();
  }, []);

  const ringColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const msg = pct >= 80
    ? 'Harika! Konuya hakimsin 🎉'
    : pct >= 50
    ? 'İyi gidiyorsun, biraz daha pratik yapabilirsin 💪'
    : 'Bu konuyu tekrar çalışmanı öneririm 📚';

  const circumference = 2 * Math.PI * 42;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Score ring */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke={ringColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-100">{correct}/{total}</span>
          <span className="text-xs text-zinc-500">doğru</span>
        </div>
      </div>

      {/* Result text */}
      <div className="text-center">
        <Trophy size={28} className="mx-auto mb-2" style={{ color: ringColor }} />
        <p className="text-lg font-bold text-zinc-100">%{pct} Başarı</p>
        <p className="text-sm text-zinc-400 mt-1 max-w-xs leading-relaxed">{msg}</p>
      </div>

      {/* Subject/topic badges */}
      <div className="flex gap-2 flex-wrap justify-center">
        <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">{subject}</span>
        {topic && (
          <span className="px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs text-violet-300">
            {topic}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-sm
            transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} /> Tekrar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm
            transition-all flex items-center justify-center gap-2"
        >
          <Home size={14} /> Ana Sayfa
        </motion.button>
      </div>
    </motion.div>
  );
}
