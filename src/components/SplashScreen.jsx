import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  duration: 4 + Math.random() * 5,
  delay: Math.random() * 3,
  size: 1 + Math.random() * 3,
}));

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const duration = 2800;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 600);
    }, 3200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#0a0a0f' }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Ambient orbs */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 500, height: 500, top: -150, left: -150, background: 'radial-gradient(circle, #4c1d9530, transparent 70%)', filter: 'blur(60px)' }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 350, height: 350, bottom: -100, right: -80, background: 'radial-gradient(circle, #7c3aed25, transparent 70%)', filter: 'blur(60px)' }}
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Floating particles */}
          {PARTICLES.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, background: '#7c3aed', bottom: -10 }}
              animate={{ y: [0, -window.innerHeight - 20], opacity: [0, 0.7, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
            />
          ))}

          {/* Logo + rings */}
          <motion.div
            className="relative flex items-center justify-center"
            style={{ width: 140, height: 140, marginBottom: 32 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Pulse rings */}
            {[0, 0.8, 1.6].map((delay, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-violet-500/30"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}

            {/* Outer spinning ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid transparent', borderTopColor: '#7c3aed', borderRightColor: '#7c3aed44' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            {/* Mid ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ inset: 12, border: '2px solid transparent', borderBottomColor: '#a78bfa', borderLeftColor: '#a78bfa44' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ inset: 24, border: '1.5px solid transparent', borderTopColor: '#7c3aed88' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Core — logo */}
            <motion.div
              className="absolute z-10 flex items-center justify-center"
              style={{ inset: 30 }}
              animate={{ filter: ['drop-shadow(0 0 8px #7c3aed88)', 'drop-shadow(0 0 20px #7c3aedcc)', 'drop-shadow(0 0 8px #7c3aed88)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="/logo-white.png" alt="Dash YKS" className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>

          {/* App name */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight relative overflow-hidden">
              Dash YKS
              <motion.span
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent 0%, #ffffff18 50%, transparent 100%)', skewX: -20 }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, delay: 1, repeat: Infinity, repeatDelay: 1 }}
              />
            </h1>
            <motion.p
              className="text-xs tracking-widest uppercase mt-1"
              style={{ color: '#7c3aed' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Kişisel Üretkenlik
            </motion.p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-40 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4c1d95, #7c3aed, #a78bfa)', width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-xs text-zinc-600 text-center mt-2 tracking-wide">Hazırlanıyor...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
