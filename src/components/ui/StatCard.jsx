import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const COLOR_MAP = {
  violet: {
    icon: 'text-violet-400',
    bg: 'bg-violet-500/10',
    glow: 'rgba(124,58,237,0.35)',
    border: 'rgba(124,58,237,0.25)',
    grad: 'from-violet-500/10 to-violet-500/0',
  },
  blue: {
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    glow: 'rgba(96,165,250,0.3)',
    border: 'rgba(96,165,250,0.2)',
    grad: 'from-blue-500/10 to-blue-500/0',
  },
  green: {
    icon: 'text-green-400',
    bg: 'bg-green-500/10',
    glow: 'rgba(74,222,128,0.28)',
    border: 'rgba(74,222,128,0.18)',
    grad: 'from-green-500/10 to-green-500/0',
  },
  orange: {
    icon: 'text-orange-400',
    bg: 'bg-orange-500/10',
    glow: 'rgba(251,146,60,0.28)',
    border: 'rgba(251,146,60,0.18)',
    grad: 'from-orange-500/10 to-orange-500/0',
  },
  red: {
    icon: 'text-red-400',
    bg: 'bg-red-500/10',
    glow: 'rgba(248,113,113,0.28)',
    border: 'rgba(248,113,113,0.18)',
    grad: 'from-red-500/10 to-red-500/0',
  },
};

export default function StatCard({ icon: Icon, label, value, sub, color = 'violet', onClick, delay = 0 }) {
  const c = COLOR_MAP[color] || COLOR_MAP.violet;
  const ref = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-60, 60], [6, -6]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(mx, [-60, 60], [-6, 6]), { stiffness: 200, damping: 20 });
  const brightness = useSpring(useTransform(mx, [-60, 0, 60], [0.97, 1, 0.97]), { stiffness: 200 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      style={{ rotateX: rotX, rotateY: rotY, filter: `brightness(${brightness})`, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : {}}
      className={`relative overflow-hidden rounded-2xl group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Glass background */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300"
        style={{
          background: 'rgba(18,18,22,0.7)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${c.border}`,
        }}
      />

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 40px -10px ${c.glow}, 0 0 30px -5px ${c.glow}` }}
      />

      {/* Gradient sweep */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${c.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative z-10 p-4 flex items-center gap-4">
        <motion.div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{ boxShadow: `0 0 16px -2px ${c.glow}` }}
        >
          <Icon size={20} />
        </motion.div>

        <div className="min-w-0">
          <p className="text-2xl font-bold text-zinc-50 leading-none tabular-nums">{value}</p>
          <p className="text-xs text-zinc-500 mt-1 truncate">{label}</p>
          {sub && <p className="text-xs text-zinc-400 mt-0.5 truncate">{sub}</p>}
        </div>

        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full"
          style={{ background: `radial-gradient(circle at top right, ${c.glow}, transparent)` }}
        />
      </div>
    </motion.div>
  );
}
