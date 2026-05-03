import { useEffect, useRef, useState } from 'react';
import {
  motion, useScroll, useTransform, useInView,
  AnimatePresence, useMotionValue, useSpring,
} from 'framer-motion';

/* ─── Google Fonts ─── */
function useFonts() {
  useEffect(() => {
    if (document.getElementById('landing-fonts')) return;
    const link = document.createElement('link');
    link.id = 'landing-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;1,14..32,400&display=swap';
    document.head.appendChild(link);
  }, []);
}

/* ─── Design tokens ─── */
const C = {
  bg: '#06050f',
  bg2: '#090719',
  violet: '#8b5cf6',
  violetL: '#a78bfa',
  violetD: '#6d28d9',
  indigo: '#6366f1',
  mint: '#34d399',
  mintD: '#10b981',
  text: '#f1f0fb',
  sub: 'rgba(241,240,251,0.65)',
  muted: 'rgba(241,240,251,0.42)',
  surface: 'rgba(255,255,255,0.035)',
  border: 'rgba(255,255,255,0.07)',
  borderV: 'rgba(139,92,246,0.25)',
};
const SYNE = { fontFamily: "'Syne', sans-serif" };
const INTER = { fontFamily: "'Inter', system-ui, sans-serif" };

/* ─── Animated section wrapper ─── */
function RevealSection({ children, style, ...props }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

/* ─── Aurora blobs ─── */
function AuroraBlobs({ style }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1, ...style }}>
      {[
        { w: 520, h: 520, top: '-12%', left: '55%', color: 'rgba(139,92,246,0.11)', dur: 22 },
        { w: 380, h: 380, top: '55%', left: '-5%', color: 'rgba(52,211,153,0.07)', dur: 28, delay: -9 },
        { w: 300, h: 300, top: '20%', left: '20%', color: 'rgba(99,102,241,0.09)', dur: 18, delay: -4 },
      ].map((b, i) => (
        <motion.div
          key={i}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={{ duration: b.dur, delay: b.delay ?? 0, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: b.w, height: b.h,
            borderRadius: '50%',
            filter: 'blur(80px)',
            background: b.color,
            top: b.top, left: b.left,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated dot grid ─── */
function GridOverlay() {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${C.borderV} 1px, transparent 1px),
                          linear-gradient(90deg, ${C.borderV} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
  );
}

/* ─── Floating particles ─── */
function Particles() {
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1.5,
      dur: Math.random() * 8 + 10,
      delay: -(Math.random() * 14),
      color: Math.random() > 0.5 ? C.violet : C.mint,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: '110vh', opacity: 0, scale: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.8, 0.5, 0], scale: [0, 1, 1, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: 0,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Noise texture overlay ─── */
function Noise() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
        opacity: 0.35,
      }}
    />
  );
}

/* ─── NAV ─── */
function Nav({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: scrolled ? 'rgba(6,5,15,0.88)' : 'rgba(6,5,15,0.5)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        borderBottom: `1px solid ${scrolled ? C.borderV : C.border}`,
        transition: 'background 0.4s, border-color 0.4s',
        ...INTER,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 18px rgba(139,92,246,0.4)`,
          flexShrink: 0,
        }}>
          <span style={{ ...SYNE, fontSize: 13, fontWeight: 800, color: '#fff' }}>DY</span>
        </div>
        <span style={{ ...SYNE, fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>
          Dash YKS
        </span>
      </div>

      <div style={{ display: 'flex', gap: 28 }}>
        {['Özellikler', 'Nasıl Çalışır', 'Fiyatlar'].map(l => (
          <a
            key={l}
            href={`#${l}`}
            onClick={e => {
              e.preventDefault();
              const map = { 'Özellikler': 'features', 'Nasıl Çalışır': 'preview', 'Fiyatlar': 'pricing' };
              document.getElementById(map[l])?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ fontSize: 14, fontWeight: 500, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.target.style.color = C.text)}
            onMouseLeave={e => (e.target.style.color = C.muted)}
          >
            {l}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button
          whileHover={{ color: C.text }}
          onClick={onLogin}
          style={{ ...SYNE, fontSize: 14, fontWeight: 600, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
        >
          Giriş Yap
        </motion.button>
        <motion.button
          whileHover={{ y: -1, boxShadow: `0 6px 22px rgba(139,92,246,0.55)` }}
          whileTap={{ scale: 0.97 }}
          onClick={onSignup}
          style={{
            ...SYNE,
            padding: '8px 20px', borderRadius: 9,
            background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
            color: '#fff', fontSize: 14, fontWeight: 700,
            border: 'none', cursor: 'pointer', letterSpacing: '-0.01em',
            boxShadow: `0 2px 14px rgba(139,92,246,0.32)`,
            transition: 'box-shadow 0.2s',
          }}
        >
          Ücretsiz Başla
        </motion.button>
      </div>
    </motion.nav>
  );
}

/* ─── Mouse parallax hook ─── */
function useMouseParallax(containerRef, strength = 28) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 55, damping: 22 });
  const mouseY = useSpring(rawY, { stiffness: 55, damping: 22 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      rawX.set(nx * strength);
      rawY.set(ny * strength);
    };
    const onLeave = () => { rawX.set(0); rawY.set(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [containerRef, rawX, rawY, strength]);

  return { mouseX, mouseY };
}

/* ─── Cycling headline words ─── */
function CyclingWords({ words, interval = 2800 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span style={{ display: 'inline-block', perspective: '500px' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ rotateX: -65, opacity: 0, y: 14 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: 65, opacity: 0, y: -14 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block' }}
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── Floating 3D mock card ─── */
function FloatingMockCard({ children, delay = 0, rotateX = 0, rotateY = 0, mouseX, mouseY, factor = 1, style = {} }) {
  const x = useTransform(mouseX, v => -v * factor * 0.75);
  const y = useTransform(mouseY, v => -v * factor * 0.75);

  return (
    <motion.div
      initial={{ y: 80, rotateX: rotateX - 28, rotateY: rotateY + 18, opacity: 0, scale: 0.82 }}
      animate={{ y: 0, rotateX, rotateY, opacity: 1, scale: 1 }}
      transition={{ duration: 1.25, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ x, y, ...style }}
    >
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 4 + delay * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          borderRadius: 16,
          border: '1px solid rgba(139,92,246,0.2)',
          background: 'rgba(11, 10, 24, 0.9)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 28px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── ScrollStory widgets ─── */
function StreakWidget() {
  const days = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  return (
    <div style={{
      borderRadius: 20, border: `1px solid ${C.borderV}`,
      background: 'rgba(11,10,24,0.85)', backdropFilter: 'blur(20px)',
      padding: 28, boxShadow: `0 28px 70px rgba(139,92,246,0.18)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <motion.div
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ fontSize: 40 }}
        >🔥</motion.div>
        <div>
          <div style={{ ...SYNE, fontSize: 42, fontWeight: 800, color: C.text, lineHeight: 1 }}>23</div>
          <div style={{ fontSize: 13, color: C.muted, ...INTER, marginTop: 2 }}>Gün Serisi</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ ...SYNE, fontSize: 14, fontWeight: 700, color: C.violetL }}>Bu Hafta</div>
          <div style={{ fontSize: 12, color: C.muted, ...INTER }}>5 / 7 gün</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 20 }}>
        {days.map((d, i) => (
          <div key={d} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, ...INTER, fontWeight: 600 }}>{d}</div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                aspectRatio: '1', borderRadius: 7,
                background: i < 5 ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.04)',
                border: i === 4 ? `1px solid ${C.violet}` : '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: i < 5 ? C.violetL : C.border,
                fontWeight: 700,
              }}
            >
              {i < 5 ? '✓' : ''}
            </motion.div>
          </div>
        ))}
      </div>

      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '71%' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${C.violet}, ${C.mint})` }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: C.muted, ...INTER }}>Bugünkü hedef</span>
        <span style={{ fontSize: 11, color: C.violetL, fontWeight: 700, ...SYNE }}>%71</span>
      </div>
    </div>
  );
}

function AIWidget() {
  const messages = [
    { from: 'ai', text: 'Bugünkü planın hazır! 🎯', delay: 0 },
    { from: 'ai', text: 'Matematik: 2 saat Türev & İntegral', delay: 0.25 },
    { from: 'ai', text: 'Türkçe: 1.5 saat Paragraf', delay: 0.5 },
    { from: 'user', text: 'Fizik ekleyebilir misin?', delay: 0.8 },
    { from: 'ai', text: 'Eklendi! Fizik: 1 saat Optik 📚', delay: 1.1 },
  ];

  return (
    <div style={{
      borderRadius: 20, border: `1px solid ${C.borderV}`,
      background: 'rgba(11,10,24,0.85)', backdropFilter: 'blur(20px)',
      padding: '22px', boxShadow: `0 28px 70px rgba(139,92,246,0.18)`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🤖</div>
        <div>
          <div style={{ ...SYNE, fontSize: 13, fontWeight: 700, color: C.text }}>AI Asistan</div>
          <div style={{ fontSize: 10, color: C.mint, ...INTER, display: 'flex', alignItems: 'center', gap: 4 }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: C.mint }}
            />
            Çevrimiçi
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: m.delay, duration: 0.38 }}
            style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{
              maxWidth: '86%', padding: '8px 12px',
              borderRadius: m.from === 'user' ? '12px 12px 3px 12px' : '3px 12px 12px 12px',
              background: m.from === 'user' ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${m.from === 'user' ? C.borderV : C.border}`,
              fontSize: 12, color: C.sub, lineHeight: 1.55, ...INTER,
            }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChartWidget() {
  const bars = [
    { label: 'D1', tyt: 68, ayt: 52 },
    { label: 'D2', tyt: 75, ayt: 60 },
    { label: 'D3', tyt: 82, ayt: 68 },
    { label: 'D4', tyt: 91, ayt: 78 },
  ];

  return (
    <div style={{
      borderRadius: 20, border: `1px solid ${C.borderV}`,
      background: 'rgba(11,10,24,0.85)', backdropFilter: 'blur(20px)',
      padding: 24, boxShadow: `0 28px 70px rgba(139,92,246,0.18)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div style={{ ...SYNE, fontSize: 15, fontWeight: 700, color: C.text }}>Net Gelişimi</div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[{ c: C.violet, l: 'TYT' }, { c: C.mint, l: 'AYT' }].map(({ c, l }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted, ...INTER }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 110, marginBottom: 18 }}>
        {bars.map((b, i) => (
          <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 3 }}>
              {[
                { pct: b.tyt, color: 'rgba(139,92,246,0.75)' },
                { pct: b.ayt, color: 'rgba(52,211,153,0.55)' },
              ].map(({ pct, color }, j) => (
                <motion.div
                  key={j}
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.75, delay: 0.08 * i + 0.04 * j, ease: [0.22, 1, 0.36, 1] }}
                  style={{ flex: 1, background: color, borderRadius: '3px 3px 0 0' }}
                />
              ))}
            </div>
            <div style={{ fontSize: 9, color: C.muted, ...INTER }}>{b.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { val: '91', label: 'TYT Net', accent: C.violet, bg: 'rgba(139,92,246,0.08)', bd: 'rgba(139,92,246,0.18)' },
          { val: '78', label: 'AYT Net', accent: C.mint, bg: 'rgba(52,211,153,0.08)', bd: 'rgba(52,211,153,0.18)' },
        ].map(({ val, label, accent, bg, bd }) => (
          <div key={label} style={{ flex: 1, padding: '11px 12px', borderRadius: 11, background: bg, border: `1px solid ${bd}`, textAlign: 'center' }}>
            <div style={{ ...SYNE, fontSize: 22, fontWeight: 800, color: accent }}>{val}</div>
            <div style={{ fontSize: 10, color: C.muted, ...INTER, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SCROLL STORY ─── */
function ScrollStory() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const [chapter, setChapter] = useState(0);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => {
      if (v < 0.34) setChapter(0);
      else if (v < 0.67) setChapter(1);
      else setChapter(2);
    });
    return unsub;
  }, [scrollYProgress]);

  const chapters = [
    {
      num: '01',
      headline: 'Her gün bir adım daha yakın',
      sub: 'Günlük hedeflerini belirle, streak takibini hiç bırakma. Her tamamlanan gün seni sınava bir adım daha yaklaştırır.',
      accent: C.violet,
      glow: 'rgba(139,92,246,0.09)',
      Widget: StreakWidget,
    },
    {
      num: '02',
      headline: 'AI planın her şeyi düşünür',
      sub: 'Gemini destekli kişisel çalışma planı, hangi konuyu ne kadar çalışman gerektiğini analiz eder ve sana özel program hazırlar.',
      accent: C.mint,
      glow: 'rgba(52,211,153,0.08)',
      Widget: AIWidget,
    },
    {
      num: '03',
      headline: 'Başarı takip edilebilir',
      sub: 'Deneme analizleri, net grafikleri ve hata defteri tek panelde. Gelişimini her gün net olarak görürsün.',
      accent: C.indigo,
      glow: 'rgba(99,102,241,0.09)',
      Widget: ChartWidget,
    },
  ];

  const cur = chapters[chapter];

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`,
      }}>
        {/* Animated background glow per chapter */}
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse 65% 65% at 65% 45%, ${cur.glow} 0%, transparent 70%)`,
            }}
          />
        </AnimatePresence>

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        {/* Main content */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          maxWidth: 1100, margin: '0 auto', padding: '0 48px',
          width: '100%', position: 'relative', zIndex: 1,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 80, alignItems: 'center', width: '100%',
          }}>

            {/* Left: text */}
            <div>
              {/* Chapter indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={chapter}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    style={{ ...SYNE, fontSize: 12, fontWeight: 800, color: cur.accent, letterSpacing: '0.12em' }}
                  >
                    {cur.num}
                  </motion.span>
                </AnimatePresence>
                <motion.div
                  animate={{ background: cur.accent }}
                  transition={{ duration: 0.5 }}
                  style={{ height: 1, flex: 1, opacity: 0.25 }}
                />
                <span style={{ fontSize: 11, color: C.muted, ...INTER }}>03</span>
              </div>

              {/* Headline — 3D flip */}
              <div style={{ perspective: '700px', marginBottom: 22 }}>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={chapter}
                    initial={{ rotateX: -52, opacity: 0, y: 24 }}
                    animate={{ rotateX: 0, opacity: 1, y: 0 }}
                    exit={{ rotateX: 52, opacity: 0, y: -24 }}
                    transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      ...SYNE, margin: 0,
                      fontSize: 'clamp(28px, 3.4vw, 52px)',
                      fontWeight: 800, lineHeight: 1.1,
                      letterSpacing: '-0.03em', color: C.text,
                    }}
                  >
                    {cur.headline}
                  </motion.h2>
                </AnimatePresence>
              </div>

              {/* Sub */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={chapter}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                  style={{ fontSize: 16, color: C.sub, lineHeight: 1.72, marginBottom: 38, ...INTER }}
                >
                  {cur.sub}
                </motion.p>
              </AnimatePresence>

              {/* Progress pills */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {chapters.map((ch, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === chapter ? 32 : 8,
                      background: i === chapter ? cur.accent : 'rgba(255,255,255,0.12)',
                      opacity: i <= chapter ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.35 }}
                    style={{ height: 8, borderRadius: 4 }}
                  />
                ))}
              </div>

              {chapter < 2 && (
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.9, repeat: Infinity }}
                  style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 10, color: C.muted, fontSize: 11, ...INTER }}
                >
                  <div style={{ width: 1, height: 30, background: `linear-gradient(to bottom, ${cur.accent}99, transparent)` }} />
                  aşağı kaydır
                </motion.div>
              )}
            </div>

            {/* Right: widget */}
            <AnimatePresence mode="wait">
              <motion.div
                key={chapter}
                initial={{ opacity: 0, scale: 0.91, x: 28 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.91, x: -28 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <cur.Widget />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
          <motion.div
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${C.violet}, ${C.mint})`,
              width: progressWidth,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION 1: HERO V2 ─── */
function HeroV2({ onSignup, onLogin }) {
  const sectionRef = useRef(null);
  const { mouseX, mouseY } = useMouseParallax(sectionRef, 26);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 80]);

  const auroraX = useTransform(mouseX, v => v * 0.35);
  const auroraY = useTransform(mouseY, v => v * 0.35);
  const textX = useTransform(mouseX, v => v * 0.12);
  const textY = useTransform(mouseY, v => v * 0.12);

  const WORDS = ["YKS'ye hazırlan", 'Zamanını yönet', 'AI ile plan yap', 'Hedefine ulaş'];

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
  const item = {
    hidden: { opacity: 0, y: 34 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  const gradientText = {
    background: `linear-gradient(135deg, #c4b5fd 0%, #818cf8 40%, ${C.mint} 80%, #34d399 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        background: C.bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <GridOverlay />

      {/* Aurora — mouse reactive */}
      <motion.div style={{ position: 'absolute', inset: 0, zIndex: 1, x: auroraX, y: auroraY }}>
        <AuroraBlobs />
      </motion.div>

      <Particles />

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.13) 0%, transparent 70%),
                     linear-gradient(to bottom, rgba(6,5,15,0.1) 0%, rgba(6,5,15,0.88) 100%)`,
      }} />

      {/* Scroll parallax wrapper */}
      <motion.div style={{ y: heroY, position: 'relative', zIndex: 3, width: '100%' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '108px 48px 64px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 56,
          alignItems: 'center',
        }}>

          {/* LEFT: text */}
          <motion.div style={{ x: textX, y: textY }}>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', ...INTER }}
            >
              {/* Badge */}
              <motion.div variants={item} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 16px 5px 10px', borderRadius: 100,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.28)',
                fontSize: 11, fontWeight: 600, color: C.violetL,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: 30, alignSelf: 'flex-start',
              }}>
                <motion.span
                  animate={{ opacity: [1, 0.15, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: C.mint, flexShrink: 0, boxShadow: `0 0 6px ${C.mint}` }}
                />
                <span style={{ background: C.violet, borderRadius: 100, padding: '2px 8px', fontSize: 10, color: '#fff', fontWeight: 700 }}>
                  YKS 2025
                </span>
                <span>Hazırlık + Üretkenlik</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={item}
                style={{
                  ...SYNE,
                  fontSize: 'clamp(36px, 5vw, 68px)',
                  fontWeight: 800, lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  color: C.text, marginBottom: 22, margin: '0 0 22px',
                }}
              >
                Başarıya giden<br />
                <span style={gradientText}>
                  <CyclingWords words={WORDS} />
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                variants={item}
                style={{
                  fontSize: 17, fontWeight: 400, color: C.sub,
                  lineHeight: 1.67, marginBottom: 40, maxWidth: 480,
                }}
              >
                Deneme analizinden hata defterine, Pomodoro'dan AI çalışma planına —
                sınavda başarı için ihtiyacın olan her şey tek ekranda.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={item} style={{ display: 'flex', gap: 13, flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ y: -2, boxShadow: `0 10px 30px rgba(139,92,246,0.58)` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onSignup}
                  style={{
                    ...SYNE,
                    padding: '14px 34px', borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
                    color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                    border: 'none', cursor: 'pointer',
                    boxShadow: `0 4px 22px rgba(139,92,246,0.42)`,
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  Ücretsiz Başla →
                </motion.button>
                <motion.button
                  whileHover={{ borderColor: C.violetL, color: C.violetL, background: 'rgba(139,92,246,0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onLogin}
                  style={{
                    ...SYNE,
                    padding: '14px 32px', borderRadius: 12,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    color: C.sub, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
                    cursor: 'pointer', backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                  }}
                >
                  Giriş Yap
                </motion.button>
              </motion.div>

              {/* Stats strip */}
              <motion.div
                variants={item}
                style={{
                  display: 'inline-flex', marginTop: 50,
                  border: `1px solid ${C.border}`, borderRadius: 14,
                  overflow: 'hidden', backdropFilter: 'blur(12px)',
                  background: 'rgba(255,255,255,0.022)',
                }}
              >
                {[
                  { n: '11', l: 'Sayfa & Özellik' },
                  { n: 'AI', l: 'Gemini Destekli' },
                  { n: '∞', l: 'Ücretsiz Kullanım' },
                ].map((s, i, arr) => (
                  <div
                    key={s.l}
                    style={{
                      padding: '18px 30px', textAlign: 'center',
                      borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}
                  >
                    <div style={{
                      ...SYNE, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em',
                      background: `linear-gradient(135deg, ${C.violetL}, ${C.mint})`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                      {s.n}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3, fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* RIGHT: 3D floating cards */}
          <div style={{ position: 'relative', height: 500 }}>
            {/* Card 1: Deneme Analizi */}
            <FloatingMockCard
              delay={0.45}
              rotateX={-8}
              rotateY={7}
              mouseX={mouseX}
              mouseY={mouseY}
              factor={0.65}
              style={{ position: 'absolute', top: 0, left: 0, width: 272, zIndex: 3 }}
            >
              <div style={{ padding: '18px 18px 16px' }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14, ...INTER }}>
                  📊 Deneme Analizi
                </div>
                {[
                  { l: 'Matematik', pct: 72, c: C.violet },
                  { l: 'Türkçe', pct: 86, c: C.mint },
                  { l: 'Fizik', pct: 55, c: C.indigo },
                ].map(b => (
                  <div key={b.l} style={{ marginBottom: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: C.sub, fontWeight: 500, ...INTER }}>{b.l}</span>
                      <span style={{ fontSize: 12, color: b.c, fontWeight: 700, ...SYNE }}>%{b.pct}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 1.2, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                        style={{ height: '100%', borderRadius: 2, background: b.c }}
                      />
                    </div>
                  </div>
                ))}
                <div style={{
                  marginTop: 14, padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)',
                  fontSize: 12, color: C.mint, fontWeight: 600, ...INTER,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>TYT Toplam Net</span>
                  <span>87.5 ↑</span>
                </div>
              </div>
            </FloatingMockCard>

            {/* Card 2: Bugünkü Plan */}
            <FloatingMockCard
              delay={0.65}
              rotateX={-4}
              rotateY={-11}
              mouseX={mouseX}
              mouseY={mouseY}
              factor={1.15}
              style={{ position: 'absolute', top: 136, right: 0, width: 232, zIndex: 2 }}
            >
              <div style={{ padding: '16px 16px 14px' }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, ...INTER }}>
                  🤖 Bugünkü Plan
                </div>
                {[
                  { task: 'Matematik: Türev', done: true },
                  { task: 'Fizik: Optik', done: true },
                  { task: 'Türkçe: Paragraf', done: false },
                  { task: 'Kimya: Mol', done: false },
                ].map((t, i) => (
                  <motion.div
                    key={t.task}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.75 + i * 0.1, duration: 0.3 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                      background: t.done ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${t.done ? C.mint : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: C.mint,
                    }}>
                      {t.done ? '✓' : ''}
                    </div>
                    <span style={{
                      fontSize: 12, color: t.done ? C.muted : C.sub,
                      textDecoration: t.done ? 'line-through' : 'none', ...INTER,
                    }}>
                      {t.task}
                    </span>
                  </motion.div>
                ))}
              </div>
            </FloatingMockCard>

            {/* Card 3: YKS Geri Sayım */}
            <FloatingMockCard
              delay={0.88}
              rotateX={7}
              rotateY={5}
              mouseX={mouseX}
              mouseY={mouseY}
              factor={0.45}
              style={{ position: 'absolute', bottom: 16, left: 56, width: 216, zIndex: 4 }}
            >
              <div style={{ padding: '20px 20px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6, ...INTER }}>
                  ⏰ YKS'ye
                </div>
                <motion.div
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{
                    ...SYNE, fontSize: 58, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
                    background: `linear-gradient(135deg, ${C.violetL}, ${C.mint})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    marginBottom: 4,
                  }}
                >
                  47
                </motion.div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 500, ...INTER, marginBottom: 14 }}>gün kaldı</div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1.6, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${C.violet}, ${C.mint})` }}
                  />
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 6, ...INTER }}>15 Haziran 2025</div>
              </div>
            </FloatingMockCard>
          </div>

        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: C.muted, fontSize: 10, letterSpacing: '0.12em', fontWeight: 600,
          ...INTER,
        }}
      >
        <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, rgba(139,92,246,0.6), transparent)` }} />
        SCROLL
      </motion.div>
    </section>
  );
}

/* ─── SECTION 2: FEATURES ─── */
const FEATURES = [
  { icon: '🎯', title: 'YKS Merkezi', desc: 'Deneme sonuçlarını gir, net analizini anında gör. TYT + AYT takibi.', tag: 'yks', tagLabel: 'YKS' },
  { icon: '🤖', title: 'AI Asistan', desc: 'Gemini destekli kişisel çalışma planı. Hangi konuyu ne kadar çalışmalısın?', tag: 'ai', tagLabel: 'Yapay Zeka' },
  { icon: '📚', title: 'Hata Defteri', desc: 'Yanlış yaptığın soruları kaydet, tekrar listeni otomatik oluştur.', tag: 'yks', tagLabel: 'YKS' },
  { icon: '⏱️', title: 'Pomodoro', desc: 'Odaklanma seansları, mola yönetimi ve günlük çalışma istatistikleri.', tag: 'daily', tagLabel: 'Üretkenlik' },
  { icon: '✅', title: 'Görev Takibi', desc: 'Günlük yapılacaklar, tekrarlayan görevler ve Kanban panosu.', tag: 'daily', tagLabel: 'Üretkenlik' },
  { icon: '📊', title: 'İstatistikler', desc: 'Haftalık/aylık çalışma grafikleri. Alışkanlık zincirleri ve streak takibi.', tag: 'daily', tagLabel: 'Analiz' },
];

function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <RevealSection
      id="features"
      style={{
        background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`,
        flexDirection: 'column', gap: 52,
        padding: '110px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 52, width: '100%', maxWidth: 1000 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.mint, fontWeight: 700, marginBottom: 14, ...INTER }}>
            Özellikler
          </div>
          <h2 style={{ ...SYNE, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: C.text }}>
            Başarı için ihtiyacın olan<br />her araç burada
          </h2>
        </motion.div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14, width: '100%',
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, borderColor: C.borderV }}
              style={{
                padding: '26px', borderRadius: 16,
                background: C.surface, border: `1px solid ${C.border}`,
                cursor: 'default', position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: 16,
                  background: `radial-gradient(circle at 0% 0%, rgba(139,92,246,0.1), transparent 60%)`,
                  pointerEvents: 'none',
                }}
              />
              <span style={{ fontSize: 26, display: 'block', marginBottom: 14 }}>{f.icon}</span>
              <div style={{ ...SYNE, fontSize: 15, fontWeight: 700, marginBottom: 7, letterSpacing: '-0.01em', color: C.text }}>{f.title}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{f.desc}</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 14, padding: '3px 10px', borderRadius: 100,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                ...(f.tag === 'yks'
                  ? { background: 'rgba(52,211,153,0.1)', color: C.mint, border: '1px solid rgba(52,211,153,0.22)' }
                  : f.tag === 'ai'
                  ? { background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.22)' }
                  : { background: 'rgba(139,92,246,0.1)', color: C.violetL, border: '1px solid rgba(139,92,246,0.22)' }),
                ...INTER,
              }}>
                {f.tagLabel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

/* ─── SECTION 3: APP PREVIEW ─── */
function AppPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <RevealSection
      id="preview"
      style={{
        background: `linear-gradient(135deg, ${C.bg2} 0%, #0c0520 100%)`,
        flexDirection: 'column', gap: 56, padding: '110px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div ref={ref} style={{ maxWidth: 1020, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.mint, fontWeight: 700, marginBottom: 14, ...INTER }}>
            Nasıl Çalışır
          </div>
          <h2 style={{ ...SYNE, fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.03em', color: C.text, marginBottom: 18 }}>
            Tüm verilerini tek<br />panoda gör
          </h2>
          <p style={{ fontSize: 15, color: C.sub, lineHeight: 1.72, marginBottom: 28, ...INTER }}>
            Dashboard'da o günkü görevlerin, alışkanlık takibin ve YKS sayım yan yana.
            Hiçbir şeyi kaçırmamak için tasarlandı.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Günlük çalışma planı AI tarafından oluşturuluyor',
              'Deneme netlerin otomatik grafiğe dönüşüyor',
              'Alışkanlık zincirlerin kaybolmuyor',
              'Tüm cihazlarda senkronize, Firebase ile güvende',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.sub, ...INTER }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.violet}, ${C.mint})`,
                }} />
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32, scale: 0.96 }}
          animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            borderRadius: 20, overflow: 'hidden',
            border: `1px solid ${C.borderV}`,
            background: '#0c0520',
            boxShadow: `0 24px 64px rgba(139,92,246,0.22), 0 0 0 1px rgba(139,92,246,0.1)`,
          }}
        >
          <div style={{
            padding: '10px 16px', background: 'rgba(139,92,246,0.12)',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid rgba(139,92,246,0.15)',
            ...INTER,
          }}>
            {[C.mint, C.violet, C.violetL].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 6, fontWeight: 500 }}>Dash YKS · Dashboard</span>
          </div>

          <div style={{
            padding: 24, position: 'relative',
            background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(139,92,246,0.1), transparent 70%)`,
          }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 500, ...INTER }}>Merhaba,</div>
            <div style={{ ...SYNE, fontSize: 22, fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em', color: C.text }}>
              Kerem <span style={{ color: C.violetL }}>👋</span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[{ n: '87', l: 'YKS Günü' }, { n: '14', l: 'Görev' }, { n: '5/7', l: 'Alışkanlık' }].map(s => (
                <div key={s.l} style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    ...SYNE, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${C.violetL}, ${C.mint})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{s.n}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontWeight: 500, ...INTER }}>{s.l}</div>
                </div>
              ))}
            </div>

            {[
              { l: 'Matematik', pct: 72, c: C.violet },
              { l: 'Türkçe', pct: 85, c: C.mint },
              { l: 'Fizik', pct: 54, c: C.indigo },
            ].map(b => (
              <div key={b.l} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500, ...INTER }}>{b.l} — %{b.pct}</div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${b.pct}%` } : {}}
                    transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', borderRadius: 3, background: b.c }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </RevealSection>
  );
}

/* ─── SECTION 4: PRICING ─── */
const PLANS = [
  {
    tier: 'Başlangıç', price: '₺0', period: '',
    desc: 'Temel özelliklerle ücretsiz başla.',
    features: ['Dashboard & Görevler', 'Pomodoro Sayacı', 'Notlar & Takvim', '1 YKS Denemesi/ay'],
    cta: 'Ücretsiz Başla', popular: false, fill: false,
  },
  {
    tier: 'YKS Pro', price: '₺49', period: '/ay',
    desc: 'Sınava hazırlık için tam güç.',
    features: ['Tüm ücretsiz özellikler', 'Sınırsız Deneme Analizi', 'AI Çalışma Planı', 'Hata Defteri & Net Takibi', 'Öncelikli destek'],
    cta: "Pro'ya Geç", popular: true, fill: true,
  },
  {
    tier: 'Aile', price: '₺79', period: '/ay',
    desc: '3 kişiye kadar aile paylaşımı.',
    features: ['Tüm Pro özellikler', '3 kullanıcı hesabı', 'Veli takip paneli', 'Aylık ilerleme raporu'],
    cta: 'Aile Planı Al', popular: false, fill: false,
  },
];

function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <RevealSection
      id="pricing"
      style={{
        background: C.bg2,
        flexDirection: 'column', gap: 52, padding: '110px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 52, maxWidth: 900, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.mint, fontWeight: 700, marginBottom: 14, ...INTER }}>
            Fiyatlar
          </div>
          <h2 style={{ ...SYNE, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: C.text }}>
            Sana uygun plan
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, width: '100%' }}>
          {PLANS.map((p, i) => (
            <motion.div
              key={p.tier}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: p.popular ? -2 : -5 }}
              style={{
                padding: '30px', borderRadius: 20,
                background: p.popular ? 'rgba(139,92,246,0.08)' : C.surface,
                border: `1px solid ${p.popular ? C.violet : C.border}`,
                position: 'relative',
                boxShadow: p.popular ? `0 0 0 1px rgba(139,92,246,0.15), 0 24px 56px rgba(139,92,246,0.18)` : 'none',
                transform: p.popular ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.3s',
              }}
            >
              {p.popular && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 18px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                  background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`, color: '#fff',
                  whiteSpace: 'nowrap', ...SYNE,
                  boxShadow: `0 2px 12px rgba(139,92,246,0.4)`,
                }}>
                  En Popüler
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, ...INTER }}>
                {p.tier}
              </div>
              <div style={{ ...SYNE, fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4, color: C.text }}>
                {p.price}
                <span style={{ fontSize: 15, fontWeight: 400, color: C.muted }}>{p.period}</span>
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 22, ...INTER }}>{p.desc}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26, padding: 0 }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: C.sub, display: 'flex', alignItems: 'center', gap: 9, ...INTER }}>
                    <div style={{
                      width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: C.mint,
                    }}>✓</div>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...SYNE,
                  width: '100%', padding: '11px', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
                  ...(p.fill
                    ? {
                        background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
                        color: '#fff', border: 'none',
                        boxShadow: `0 4px 16px rgba(139,92,246,0.35)`,
                      }
                    : {
                        background: 'transparent', color: C.sub,
                        border: `1px solid ${C.border}`,
                      }),
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!p.fill) { e.currentTarget.style.borderColor = C.violet; e.currentTarget.style.color = C.violetL; }
                }}
                onMouseLeave={e => {
                  if (!p.fill) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }
                }}
              >
                {p.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

/* ─── SECTION 5: FINAL CTA ─── */
function FinalCTA({ onSignup }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <RevealSection
      id="cta"
      style={{
        background: C.bg,
        flexDirection: 'column', textAlign: 'center', padding: '110px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)`,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.mint, fontWeight: 700, marginBottom: 20, ...INTER }}
        >
          YKS'ye Hazır mısın?
        </motion.div>

        <h2 style={{
          ...SYNE,
          fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 800,
          lineHeight: 1.1, letterSpacing: '-0.035em', color: C.text, marginBottom: 22,
        }}>
          Çalışmaya bugün<br />
          <span style={{
            background: `linear-gradient(135deg, ${C.violetL}, ${C.mint})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>başla, ücretsiz.</span>
        </h2>

        <p style={{ fontSize: 17, color: C.sub, lineHeight: 1.65, marginBottom: 40, ...INTER }}>
          Kayıt olmak 30 saniye. Kredi kartı gerekmez.
          İlk denemeni bugün analiz et.
        </p>

        <motion.button
          whileHover={{ y: -3, boxShadow: `0 12px 36px rgba(139,92,246,0.6)` }}
          whileTap={{ scale: 0.96 }}
          onClick={onSignup}
          style={{
            ...SYNE,
            padding: '16px 44px', borderRadius: 13,
            background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
            color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em',
            border: 'none', cursor: 'pointer',
            boxShadow: `0 6px 28px rgba(139,92,246,0.42)`,
            transition: 'box-shadow 0.2s',
          }}
        >
          Ücretsiz Hesap Oluştur →
        </motion.button>

        <div style={{ marginTop: 18, fontSize: 12, color: C.muted, ...INTER }}>
          Zaten hesabın var mı?{' '}
          <button
            onClick={onSignup}
            style={{ background: 'none', border: 'none', color: C.violetL, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
          >
            Giriş yap
          </button>
        </div>
      </motion.div>
    </RevealSection>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer style={{
      ...INTER,
      background: C.bg,
      borderTop: `1px solid ${C.border}`,
      padding: '32px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ ...SYNE, fontSize: 11, fontWeight: 800, color: '#fff' }}>DY</span>
        </div>
        <span style={{ fontSize: 14, color: C.muted }}>© 2025 Dash YKS. Tüm hakları saklıdır.</span>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Gizlilik', 'Kullanım Şartları', 'İletişim'].map(l => (
          <span key={l} style={{ fontSize: 13, color: C.muted, cursor: 'pointer' }}>{l}</span>
        ))}
      </div>
    </footer>
  );
}

/* ─── MAIN EXPORT ─── */
export default function LandingPage({ onLogin, onSignup }) {
  useFonts();

  return (
    <div style={{
      ...INTER,
      background: C.bg,
      color: C.text,
      minHeight: '100vh',
      overflowX: 'clip',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      <Noise />
      <Nav onLogin={onLogin} onSignup={onSignup} />

      <main>
        <HeroV2 onSignup={onSignup} onLogin={onLogin} />
        <ScrollStory />
        <Features />
        <AppPreview />
        <Pricing />
        <FinalCTA onSignup={onSignup} />
        <Footer />
      </main>
    </div>
  );
}
