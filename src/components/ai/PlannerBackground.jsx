import { useReducedMotion, motion } from 'framer-motion';

const BLOBS = [
  { color: '#7c3aed', x: [0, 120, -80, 0], y: [0, -60, 90, 0], duration: 22, opacity: 0.55, size: 600, top: '5%', left: '10%' },
  { color: '#4f46e5', x: [0, -90, 60, 0], y: [0, 80, -50, 0], duration: 18, opacity: 0.45, size: 500, top: '45%', left: '50%' },
  { color: '#a855f7', x: [0, 70, -40, 0], y: [0, -40, 60, 0], duration: 26, opacity: 0.35, size: 440, top: '65%', left: '5%' },
];

export default function PlannerBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-[#0f0f11]" />

      {/* Aurora blobs */}
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            opacity: blob.opacity,
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
          animate={reducedMotion ? {} : {
            x: blob.x,
            y: blob.y,
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 3,
          }}
        />
      ))}

      {/* Grid overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }}
        animate={reducedMotion ? {} : { backgroundPositionX: ['0px', '40px'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(15,15,17,0.75) 100%)' }}
      />
    </div>
  );
}
