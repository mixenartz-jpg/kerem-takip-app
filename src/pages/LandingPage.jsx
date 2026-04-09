import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

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
function Aurora() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {[
        { w: 520, h: 520, top: '-12%', left: '55%', color: 'rgba(139,92,246,0.11)', dur: 22 },
        { w: 380, h: 380, top: '55%',  left: '-5%', color: 'rgba(52,211,153,0.07)',  dur: 28, delay: -9 },
        { w: 300, h: 300, top: '20%',  left: '20%', color: 'rgba(99,102,241,0.09)',  dur: 18, delay: -4 },
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
      {/* Logo */}
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

      {/* Links */}
      <div style={{ display: 'flex', gap: 28 }} className="nav-links-desktop">
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

      {/* Auth buttons */}
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

/* ─── SECTION 1: HERO ─── */
function Hero({ onSignup, onLogin }) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const item = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.bg,
        position: 'relative',
        overflow: 'hidden',
        scrollSnapAlign: 'start',
      }}
    >
      <GridOverlay />
      <Aurora />
      <Particles />

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.13) 0%, transparent 70%),
                     linear-gradient(to bottom, rgba(6,5,15,0.15) 0%, rgba(6,5,15,0.92) 100%)`,
      }} />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 3 }}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', maxWidth: 860, padding: '100px 24px 0',
            ...INTER,
          }}
        >
          {/* Badge */}
          <motion.div variants={item} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px 5px 10px', borderRadius: 100,
            background: 'rgba(139,92,246,0.1)', border: `1px solid rgba(139,92,246,0.28)`,
            fontSize: 11, fontWeight: 600, color: C.violetL,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 28,
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
              fontSize: 'clamp(42px, 6.5vw, 78px)',
              fontWeight: 800, lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: C.text, marginBottom: 22,
            }}
          >
            YKS'ye hazırlan,{' '}
            <br />
            <span style={{
              background: `linear-gradient(135deg, #c4b5fd 0%, #818cf8 35%, ${C.mint} 75%, #34d399 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              zamanını yönet.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={item}
            style={{
              fontSize: 18, fontWeight: 400, color: C.sub,
              lineHeight: 1.65, marginBottom: 44, maxWidth: 560,
            }}
          >
            Deneme analizinden hata defterine, Pomodoro'dan AI çalışma planına —
            sınavda başarı için ihtiyacın olan her şey tek ekranda.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ y: -2, boxShadow: `0 10px 30px rgba(139,92,246,0.55)` }}
              whileTap={{ scale: 0.97 }}
              onClick={onSignup}
              style={{
                ...SYNE,
                padding: '14px 32px', borderRadius: 12,
                background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
                color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                border: 'none', cursor: 'pointer',
                boxShadow: `0 4px 22px rgba(139,92,246,0.4)`,
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

          {/* Stats */}
          <motion.div
            variants={item}
            style={{
              display: 'flex', marginTop: 56,
              border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden',
              backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.025)',
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
                  padding: '20px 40px', textAlign: 'center',
                  borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{
                  ...SYNE, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
                  background: `linear-gradient(135deg, ${C.violetL}, ${C.mint})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
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
  { icon: '📊', title: 'İstatistikler', desc: 'Haftalık/aylık çalışma grafikler. Alışkanlık zincirleri ve strea takibi.', tag: 'daily', tagLabel: 'Analiz' },
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
        scrollSnapAlign: 'start',
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
                  ? { background: 'rgba(52,211,153,0.1)', color: C.mint, border: `1px solid rgba(52,211,153,0.22)` }
                  : f.tag === 'ai'
                  ? { background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: `1px solid rgba(99,102,241,0.22)` }
                  : { background: 'rgba(139,92,246,0.1)', color: C.violetL, border: `1px solid rgba(139,92,246,0.22)` }),
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
        scrollSnapAlign: 'start',
      }}
    >
      <div ref={ref} style={{ maxWidth: 1020, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        {/* Left: copy */}
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

        {/* Right: mock dashboard card */}
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
          {/* Titlebar */}
          <div style={{
            padding: '10px 16px', background: 'rgba(139,92,246,0.12)',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: `1px solid rgba(139,92,246,0.15)`,
            ...INTER,
          }}>
            {[C.mint, C.violet, C.violetL].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 6, fontWeight: 500 }}>Dash YKS · Dashboard</span>
          </div>

          {/* Body */}
          <div style={{
            padding: 24,
            background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(139,92,246,0.1), transparent 70%)`,
          }}>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <span style={{
                ...SYNE, padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: `linear-gradient(135deg, ${C.violet}, ${C.mint})`, color: '#fff',
              }}>CANLI</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 500, ...INTER }}>Merhaba,</div>
            <div style={{ ...SYNE, fontSize: 22, fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em', color: C.text }}>
              Kerem <span style={{ color: C.violetL }}>👋</span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[
                { n: '87', l: 'YKS Günü' },
                { n: '14', l: 'Görev' },
                { n: '5/7', l: 'Alışkanlık' },
              ].map(s => (
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

            {/* Progress bars */}
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
    tier: 'Başlangıç',
    price: '₺0',
    period: '',
    desc: 'Temel özelliklerle ücretsiz başla.',
    features: ['Dashboard & Görevler', 'Pomodoro Sayacı', 'Notlar & Takvim', '1 YKS Denemesi/ay'],
    cta: 'Ücretsiz Başla',
    popular: false,
    fill: false,
  },
  {
    tier: 'YKS Pro',
    price: '₺49',
    period: '/ay',
    desc: 'Sınava hazırlık için tam güç.',
    features: ['Tüm ücretsiz özellikler', 'Sınırsız Deneme Analizi', 'AI Çalışma Planı', 'Hata Defteri & Net Takibi', 'Öncelikli destek'],
    cta: 'Pro\'ya Geç',
    popular: true,
    fill: true,
  },
  {
    tier: 'Aile',
    price: '₺79',
    period: '/ay',
    desc: '3 kişiye kadar aile paylaşımı.',
    features: ['Tüm Pro özellikler', '3 kullanıcı hesabı', 'Veli takip paneli', 'Aylık ilerleme raporu'],
    cta: 'Aile Planı Al',
    popular: false,
    fill: false,
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
        scrollSnapAlign: 'start',
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
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
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
        scrollSnapAlign: 'start',
        minHeight: '80vh',
      }}
    >
      {/* Glow */}
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
          style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: C.mint, fontWeight: 700, marginBottom: 20, ...INTER,
          }}
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
      overflowX: 'hidden',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      <Noise />
      <Nav onLogin={onLogin} onSignup={onSignup} />

      <main style={{
        scrollSnapType: 'y mandatory',
        overflowY: 'scroll',
        height: '100vh',
        scrollBehavior: 'smooth',
      }}>
        <Hero onSignup={onSignup} onLogin={onLogin} />
        <Features />
        <AppPreview />
        <Pricing />
        <FinalCTA onSignup={onSignup} />
        <div style={{ scrollSnapAlign: 'start' }}>
          <Footer />
        </div>
      </main>
    </div>
  );
}
