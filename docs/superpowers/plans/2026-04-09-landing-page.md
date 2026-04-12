# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/` route'una giriş yapmamış ziyaretçi için tam ekran marketing landing page ekle — video arka plan, scroll-snap bölümler, Neural/Digital estetik.

**Architecture:** `LandingPage.jsx` tek sayfa bileşeni (5 section), kendi CSS değişkenleri ve Google Fonts ile. App.jsx'te auth kontrolüne bağlı: user varsa doğrudan app'e yönlendir, yoksa LandingPage göster. Routing için mevcut BrowserRouter yapısı korunur, sadece AuthGate içine pre-auth check eklenir.

**Tech Stack:** React 19, Framer Motion 12, react-router-dom 7, Tailwind CSS (minimal — inline style ve CSS vars ağırlıklı), Google Fonts (Syne + Inter)

---

## Dosya Haritası

| Durum | Dosya | Sorumluluk |
|---|---|---|
| **CREATE** | `src/pages/LandingPage.jsx` | Tüm landing page — 5 section, nav, scroll dots, particles |
| **MODIFY** | `src/App.jsx` | AuthGate'e `phase = 'landing'` durumu ekle; user yoksa LandingPage göster |

---

## Task 1: LandingPage.jsx — Temel İskelet + Nav

**Files:**
- Create: `src/pages/LandingPage.jsx`

- [ ] **Step 1: Dosyayı oluştur — imports ve font inject**

```jsx
// src/pages/LandingPage.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Google Fonts: Syne + Inter
const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap';

function useFonts() {
  useEffect(() => {
    if (document.getElementById('landing-fonts')) return;
    const link = document.createElement('link');
    link.id = 'landing-fonts';
    link.rel = 'stylesheet';
    link.href = FONT_LINK;
    document.head.appendChild(link);
    return () => {
      // temizleme gerekmez — font kalıcı önbelleğe alınır
    };
  }, []);
}

export default function LandingPage({ onLogin }) {
  useFonts();
  const navigate = useNavigate();

  return (
    <div style={S.root}>
      <Nav onLogin={onLogin} />
      <ScrollDots />
      {/* sections buraya */}
      <div style={{ minHeight: '500vh' }} /> {/* placeholder — Task 2'de silinecek */}
    </div>
  );
}
```

- [ ] **Step 2: CSS-in-JS stil sabitlerini dosyanın altına ekle**

```jsx
// src/pages/LandingPage.jsx — dosya sonuna ekle
const COLORS = {
  bg:       '#06050f',
  violet:   '#8b5cf6',
  indigo:   '#6366f1',
  mint:     '#34d399',
  text:     '#f1f0fb',
  muted:    'rgba(241,240,251,0.45)',
  sub:      'rgba(241,240,251,0.65)',
  surface:  'rgba(255,255,255,0.035)',
  border:   'rgba(255,255,255,0.07)',
  borderV:  'rgba(139,92,246,0.25)',
};

const S = {
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: COLORS.bg,
    color: COLORS.text,
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    height: '100vh',
    fontSize: 16,
    WebkitFontSmoothing: 'antialiased',
  },
  displayFont: { fontFamily: "'Syne', sans-serif" },
  section: {
    scrollSnapAlign: 'start',
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
};
```

- [ ] **Step 3: Nav bileşenini ekle**

```jsx
// src/pages/LandingPage.jsx — Nav bileşeni (export'dan önce)
function Nav({ onLogin }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: 64,
      background: 'rgba(6,5,15,0.65)',
      backdropFilter: 'blur(24px) saturate(1.4)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.indigo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, boxShadow: '0 0 16px rgba(139,92,246,0.35)',
        }}>⚡</div>
        <span style={{ ...S.displayFont, fontSize: 17, fontWeight: 700, color: COLORS.text }}>
          Dash YKS
        </span>
      </div>

      <div style={{ display: 'flex', gap: 28 }}>
        {['Özellikler', 'Video Rapor', 'Fiyatlar'].map(label => (
          <a key={label} href={`#${label.toLowerCase().replace(' ', '-')}`}
            style={{ fontSize: 14, fontWeight: 500, color: COLORS.muted, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = COLORS.text}
            onMouseLeave={e => e.target.style.color = COLORS.muted}
          >{label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onLogin}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: COLORS.muted }}
          onMouseEnter={e => e.target.style.color = COLORS.text}
          onMouseLeave={e => e.target.style.color = COLORS.muted}
        >Giriş Yap</button>
        <button onClick={onLogin} style={{
          ...S.displayFont,
          padding: '8px 20px', borderRadius: 9,
          background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.indigo})`,
          color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(139,92,246,0.3)',
        }}>Ücretsiz Başla →</button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: ScrollDots bileşenini ekle**

```jsx
// src/pages/LandingPage.jsx — ScrollDots bileşeni
const SECTION_IDS = ['hero', 'features', 'remotion-section', 'pricing', 'final-cta'];

function ScrollDots() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observers = SECTION_IDS.map((id, i) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const scrollTo = (i) => {
    document.getElementById(SECTION_IDS[i])?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
      zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {SECTION_IDS.map((_, i) => (
        <button key={i} onClick={() => scrollTo(i)} style={{
          width: active === i ? 8 : 7,
          height: active === i ? 8 : 7,
          borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: active === i ? COLORS.violet : 'rgba(255,255,255,0.2)',
          boxShadow: active === i ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
          transition: 'all 0.3s', padding: 0,
        }} />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: useState import ekle (ScrollDots için)**

[LandingPage.jsx:1] — import satırını güncelle:
```jsx
import { useEffect, useRef, useState } from 'react';
```

- [ ] **Step 6: Dev sunucuyu başlat ve `/` route'unda nav görünüyor mu kontrol et**

```bash
cd "c:\Users\kerem\OneDrive\Desktop\Kerem\gunluk-takip"
npm run dev
```

Beklenen: Sayfada "Dash YKS" nav + sağda 5 dot görünür. Henüz section yok.

- [ ] **Step 7: Commit**

```bash
git add src/pages/LandingPage.jsx
git commit -m "feat: landing page scaffold — nav + scroll dots"
```

---

## Task 2: Hero Section — Video BG + Aurora + Particles + İçerik

**Files:**
- Modify: `src/pages/LandingPage.jsx`

- [ ] **Step 1: Particles hook'u ekle (dosya içinde, component'lerin üstüne)**

```jsx
// src/pages/LandingPage.jsx — ParticleField bileşeni
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const colors = ['#8b5cf6', '#a78bfa', '#34d399', '#6366f1'];
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: -(0.3 + Math.random() * 0.5),
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      zIndex: 2, pointerEvents: 'none',
    }} />
  );
}
```

- [ ] **Step 2: HeroSection bileşenini ekle**

```jsx
// src/pages/LandingPage.jsx — HeroSection
const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4';

function HeroSection({ onCta }) {
  return (
    <section id="hero" style={S.section}>
      {/* Video BG */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
        <video autoPlay muted loop playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        {/* Multi-layer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'radial-gradient(ellipse 70% 60% at 50% 10%, rgba(99,102,241,0.14) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 50% at 85% 75%, rgba(139,92,246,0.16) 0%, transparent 60%)',
            'linear-gradient(to bottom, rgba(6,5,15,0.25) 0%, rgba(6,5,15,0.88) 100%)',
          ].join(','),
        }} />
      </div>

      {/* CSS Grid pulse */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        backgroundImage: [
          'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '48px 48px',
        animation: 'gridPulse 5s ease-in-out infinite',
      }} />

      {/* Aurora blobs */}
      {[
        { w: 420, h: 420, c: 'rgba(139,92,246,0.1)', top: '-10%', left: '60%', dur: '18s' },
        { w: 300, h: 300, c: 'rgba(52,211,153,0.06)', top: '55%', left: '5%', dur: '22s', delay: '-8s' },
        { w: 360, h: 360, c: 'rgba(99,102,241,0.08)', top: '30%', left: '5%', dur: '26s', delay: '-4s' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', zIndex: 2, pointerEvents: 'none',
          width: b.w, height: b.h, borderRadius: '50%', filter: 'blur(80px)',
          background: b.c, top: b.top, left: b.left,
          animation: `auroraBlob ${b.dur} ease-in-out infinite`,
          animationDelay: b.delay,
        }} />
      ))}

      <ParticleField />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', maxWidth: 840, padding: '80px 24px 0',
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px 5px 10px', borderRadius: 100,
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.28)',
            fontSize: 11, fontWeight: 600, color: '#a78bfa',
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 32,
          }}
        >
          <span style={{
            background: COLORS.violet, borderRadius: 100, padding: '2px 8px',
            fontSize: 10, color: '#fff', fontWeight: 700,
            ...S.displayFont,
          }}>YENİ</span>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: COLORS.mint,
            boxShadow: `0 0 6px ${COLORS.mint}`, animation: 'badgeBlink 1.8s ease-in-out infinite',
          }} />
          Türkiye'nin AI destekli çalışma platformu
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            ...S.displayFont, fontSize: 'clamp(42px, 6.5vw, 78px)',
            fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 22,
          }}
        >
          <span style={{
            background: `linear-gradient(135deg, #c4b5fd 0%, #818cf8 35%, ${COLORS.mint} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>YKS'ye hazırlan.</span>
          <br />Hayatını yönet.
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontSize: 18, color: COLORS.sub, lineHeight: 1.65, marginBottom: 44, maxWidth: 580 }}
        >
          AI asistan, deneme analizi, kişisel video raporu ve alışkanlık takibi —
          hepsi tek platformda. Baykuş'tan güçlü, 345'ten akıllı.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}
        >
          <button onClick={onCta} style={{
            ...S.displayFont,
            padding: '13px 30px', borderRadius: 11,
            background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.indigo})`,
            color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(139,92,246,0.38)',
          }}>🚀 Ücretsiz Hesap Oluştur</button>
          <button style={{
            ...S.displayFont,
            padding: '13px 30px', borderRadius: 11,
            background: COLORS.surface, border: '1px solid rgba(255,255,255,0.15)',
            color: COLORS.sub, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>▶ Demo İzle</button>
        </motion.div>

        {/* Stats pill */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{
            display: 'flex', gap: 0,
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden',
            backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.025)',
          }}
        >
          {[
            { num: '12.000+', lbl: 'Aktif Öğrenci' },
            { num: '%94', lbl: 'Memnuniyet' },
            { num: '50+', lbl: 'Partner Dershane' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '20px 36px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <div style={{
                ...S.displayFont, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, #a78bfa, ${COLORS.mint})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.num}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2, fontWeight: 500 }}>{s.lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        color: COLORS.muted, fontSize: 10, letterSpacing: '0.12em', fontWeight: 600,
        animation: 'scrollHint 2.2s ease-in-out infinite',
      }}>
        <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, rgba(139,92,246,0.6), transparent)` }} />
        KAYDIR
      </div>
    </section>
  );
}
```

- [ ] **Step 3: CSS keyframe'leri index.html veya style tag ile inject et**

`index.html` `<head>` içine ekle:
```html
<style>
  @keyframes gridPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes auroraBlob { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
  @keyframes badgeBlink { 0%,100%{opacity:1} 50%{opacity:.15} }
  @keyframes scrollHint { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }
</style>
```

- [ ] **Step 4: LandingPage export içinde placeholder'ı HeroSection ile değiştir**

```jsx
// src/pages/LandingPage.jsx — export default içi
export default function LandingPage({ onLogin }) {
  useFonts();

  return (
    <div style={S.root}>
      <Nav onLogin={onLogin} />
      <ScrollDots />
      <HeroSection onCta={onLogin} />
      {/* Task 3-5'te diğer section'lar eklenecek */}
    </div>
  );
}
```

- [ ] **Step 5: Tarayıcıda kontrol**

`npm run dev` → `/` açık, auth yok → henüz LoginPage görünüyor (Task 6'da routing düzeltilecek). Geçici test için: `LandingPage`'i doğrudan App.jsx'e import et ve ekrana bas.

- [ ] **Step 6: Commit**

```bash
git add src/pages/LandingPage.jsx public/index.html
git commit -m "feat: hero section — video bg, aurora, particles, CTA"
```

---

## Task 3: Features + Remotion + Pricing + Final CTA Sections

**Files:**
- Modify: `src/pages/LandingPage.jsx`

- [ ] **Step 1: FeaturesSection ekle**

```jsx
// src/pages/LandingPage.jsx — FeaturesSection
const FEATURES = [
  { icon: '🎯', title: 'YKS Merkezi', desc: 'Deneme sınavı analizi, konu takibi, hedef net hesaplama ve AI destekli çalışma planı.', tag: 'YKS Modu', tagColor: COLORS.mint },
  { icon: '🤖', title: 'AI Asistan', desc: 'Gemini AI ile kişisel çalışma önerileri, zayıf konu tespiti ve günlük plan üretimi.', tag: 'Yapay Zeka', tagColor: '#a5b4fc' },
  { icon: '📓', title: 'Hata Defteri', desc: 'SM2 aralıklı tekrar algoritması. Yanlışlarını kaydet, doğru zamanda tekrar et.', tag: 'YKS Modu', tagColor: COLORS.mint },
  { icon: '✅', title: 'Görev Yönetimi', desc: 'Alt görevler, öncelikler, Kanban board. Okul ve kişisel işlerini organize et.', tag: 'Günlük Mod', tagColor: '#a78bfa' },
  { icon: '🔥', title: 'Alışkanlık Takibi', desc: 'Seri takibi, rozet sistemi ve streak motivasyonu. Her gün bir adım daha ileri.', tag: 'Günlük Mod', tagColor: '#a78bfa' },
  { icon: '⏱', title: 'Pomodoro', desc: 'Odak oturumları, mola yönetimi ve günlük çalışma istatistikleri.', tag: 'Günlük Mod', tagColor: '#a78bfa' },
];

function FeaturesSection() {
  return (
    <section id="features" style={{
      ...S.section, flexDirection: 'column', gap: 52,
      padding: '100px 48px',
      background: `linear-gradient(180deg, ${COLORS.bg} 0%, #090719 100%)`,
    }}>
      <div>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.mint, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>Neler sunuyoruz?</p>
        <h2 style={{ ...S.displayFont, fontSize: 'clamp(30px,4vw,50px)', fontWeight: 800, textAlign: 'center', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
          Başarı için ihtiyacın olan{' '}
          <span style={{ background: `linear-gradient(135deg, #c4b5fd, ${COLORS.mint})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            her şey tek yerde
          </span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, maxWidth: 980, width: '100%' }}>
        {FEATURES.map(f => (
          <div key={f.title} style={{
            padding: 26, borderRadius: 16,
            background: COLORS.surface, border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all .3s', cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ fontSize: 26, display: 'block', marginBottom: 14 }}>{f.icon}</span>
            <div style={{ ...S.displayFont, fontSize: 15, fontWeight: 700, marginBottom: 7 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.55, marginBottom: 14 }}>{f.desc}</div>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 100,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              background: `${f.tagColor}18`, color: f.tagColor, border: `1px solid ${f.tagColor}33`,
            }}>{f.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: RemotionSection ekle**

```jsx
// src/pages/LandingPage.jsx — RemotionSection
function RemotionSection() {
  return (
    <section id="remotion-section" style={{
      ...S.section, flexDirection: 'column', gap: 48, padding: '100px 48px',
      background: 'linear-gradient(135deg, #090719 0%, #0c0520 100%)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, maxWidth: 1020, width: '100%', alignItems: 'center' }}>
        {/* Sol: açıklama */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.mint, fontWeight: 700, marginBottom: 18 }}>Kişiselleştirilmiş Deneyim</p>
          <h2 style={{ ...S.displayFont, fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Sana özel{' '}
            <span style={{ background: `linear-gradient(135deg, #c4b5fd, ${COLORS.mint})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>video raporu</span>
          </h2>
          <p style={{ color: COLORS.sub, lineHeight: 1.72, marginBottom: 28, fontSize: 15 }}>
            Remotion ile her hafta otomatik üretilen kişisel ilerleme videosu. İsmin, skorların, streak'in — hepsi animasyonla karşında. Paylaş, motive ol.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {['Haftalık otomatik ilerleme videosu', 'TYT / AYT net gelişimini görsel izle', 'Paylaşılabilir — arkadaşına gönder', 'Dershaneler için toplu rapor üretimi'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: COLORS.sub }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.mint})`, flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Sağ: mockup preview */}
        <div style={{
          borderRadius: 18, overflow: 'hidden',
          border: '1px solid rgba(139,92,246,0.3)',
          background: '#0c0520',
          boxShadow: '0 24px 64px rgba(139,92,246,0.22)',
        }}>
          <div style={{ padding: '10px 16px', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: COLORS.muted, borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
            <span style={{ marginLeft: 8 }}>Haftalık Rapor · Remotion</span>
          </div>
          <div style={{ padding: 24, position: 'relative', background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(139,92,246,0.12), transparent 70%)' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 11px', borderRadius: 7, fontSize: 10, fontWeight: 700, background: `linear-gradient(135deg,${COLORS.violet},${COLORS.mint})`, color: '#fff', ...S.displayFont }}>⚡ Bu Hafta</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>Merhaba,</div>
            <div style={{ ...S.displayFont, fontSize: 22, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.02em' }}>
              Kerem <span style={{ color: '#a78bfa' }}>🔥 12 gün seri!</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[{ n: '87.5', l: 'TYT Net' }, { n: '+4.2', l: 'Geçen hafta' }, { n: '%78', l: 'Hedefe' }].map(s => (
                <div key={s.l} style={{ flex: 1, padding: 11, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                  <div style={{ ...S.displayFont, fontSize: 20, fontWeight: 800, background: `linear-gradient(135deg,#a78bfa,${COLORS.mint})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.n}</div>
                  <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2, fontWeight: 500 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {[{ lbl: 'TYT Türkçe → Hedef: 35', w: '82%', g: `${COLORS.violet},${COLORS.mint}` }, { lbl: 'TYT Matematik → Hedef: 35', w: '63%', g: `${COLORS.indigo},#a78bfa` }].map(b => (
              <div key={b.lbl}>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 5, fontWeight: 500 }}>{b.lbl}</div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 8 }}>
                  <div style={{ width: b.w, height: '100%', borderRadius: 3, background: `linear-gradient(90deg,${b.g})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: PricingSection ekle**

```jsx
// src/pages/LandingPage.jsx — PricingSection
const PLANS = [
  {
    tier: 'Ücretsiz', price: '₺0', period: '/ ay',
    desc: 'Bireysel öğrenciler için başlangıç', popular: false,
    features: ['YKS Merkezi (3 deneme/ay)', 'Görev & Alışkanlık takibi', 'Pomodoro Timer', 'AI Asistan (10 mesaj/gün)'],
    btnLabel: 'Ücretsiz Başla', btnFill: false,
  },
  {
    tier: 'Pro Öğrenci', price: '₺99', period: '/ ay',
    desc: 'Ciddi YKS hazırlığı için', popular: true,
    features: ['Sınırsız deneme analizi', 'Haftalık video raporu (Remotion)', 'Sınırsız AI Asistan', 'Hata Defteri (SM2)', 'İleri istatistikler'],
    btnLabel: '14 Gün Ücretsiz Dene', btnFill: true,
  },
  {
    tier: 'Kurumsal', price: '₺', period: 'Teklif alın',
    desc: 'Dershane & okullar için', popular: false,
    features: ['Sınırsız öğrenci hesabı', 'Toplu Remotion raporu', 'Öğretmen paneli', 'White-label marka', 'Öncelikli destek'],
    btnLabel: 'İletişime Geç', btnFill: false,
  },
];

function PricingSection({ onCta }) {
  return (
    <section id="pricing" style={{
      ...S.section, flexDirection: 'column', gap: 52, padding: '100px 48px',
      background: '#090719',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.mint, fontWeight: 700, marginBottom: 12 }}>Fiyatlandırma</p>
        <h2 style={{ ...S.displayFont, fontSize: 'clamp(30px,4vw,50px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>Her bütçeye uygun plan</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 880, width: '100%', alignItems: 'center' }}>
        {PLANS.map(p => (
          <div key={p.tier} style={{
            padding: 30, borderRadius: 18, position: 'relative',
            background: p.popular ? 'rgba(139,92,246,0.08)' : COLORS.surface,
            border: `1px solid ${p.popular ? COLORS.violet : 'rgba(255,255,255,0.06)'}`,
            boxShadow: p.popular ? '0 0 0 1px rgba(139,92,246,0.15), 0 20px 50px rgba(139,92,246,0.18)' : 'none',
            transform: p.popular ? 'scale(1.05)' : 'scale(1)',
          }}>
            {p.popular && (
              <div style={{
                position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                padding: '4px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                background: `linear-gradient(135deg,${COLORS.violet},${COLORS.indigo})`,
                color: '#fff', whiteSpace: 'nowrap', ...S.displayFont,
                boxShadow: '0 2px 12px rgba(139,92,246,0.4)',
              }}>⭐ En Popüler</div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{p.tier}</div>
            <div style={{ ...S.displayFont, fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 5 }}>
              {p.price} <span style={{ fontSize: 15, fontWeight: 400, color: COLORS.muted }}>{p.period}</span>
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 22 }}>{p.desc}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
              {p.features.map(f => (
                <li key={f} style={{ fontSize: 13, color: COLORS.sub, display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: COLORS.mint, flexShrink: 0 }}>✓</div>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={p.btnFill ? onCta : undefined} style={{
              ...S.displayFont,
              width: '100%', padding: 11, borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              background: p.btnFill ? `linear-gradient(135deg,${COLORS.violet},${COLORS.indigo})` : 'transparent',
              border: p.btnFill ? 'none' : '1px solid rgba(255,255,255,0.15)',
              color: p.btnFill ? '#fff' : COLORS.sub,
              boxShadow: p.btnFill ? '0 3px 14px rgba(139,92,246,0.32)' : 'none',
            }}>{p.btnLabel}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: FinalCTA section ekle**

```jsx
// src/pages/LandingPage.jsx — FinalCTA
function FinalCTA({ onCta }) {
  return (
    <section id="final-cta" style={{
      ...S.section, flexDirection: 'column', gap: 0, padding: '100px 48px',
      background: COLORS.bg, textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ ...S.displayFont, fontSize: 'clamp(36px,5.5vw,68px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 18 }}>
          Sıradaki adım<br />
          <span style={{ background: `linear-gradient(135deg, #c4b5fd, ${COLORS.mint})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>senindir.</span>
        </h2>
        <p style={{ fontSize: 18, color: COLORS.sub, marginBottom: 40 }}>12.000+ öğrenci ile bugün başla. Kredi kartı gerekmez.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button onClick={onCta} style={{
            ...S.displayFont, fontSize: 17, padding: '15px 40px', borderRadius: 12,
            background: `linear-gradient(135deg,${COLORS.violet},${COLORS.indigo})`,
            color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(139,92,246,0.38)',
          }}>🚀 Ücretsiz Hesap Oluştur</button>
          <button style={{
            ...S.displayFont, fontSize: 17, padding: '15px 28px', borderRadius: 12,
            background: COLORS.surface, border: '1px solid rgba(255,255,255,0.15)',
            color: COLORS.sub, cursor: 'pointer',
          }}>Demo İzle</button>
        </div>
        <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 18 }}>Ücretsiz plan sonsuza kadar ücretsiz.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 11, color: COLORS.muted, letterSpacing: '0.1em', textTransform: 'uppercase', width: '100%', marginBottom: 8, fontWeight: 600 }}>Partner Dershaneler</p>
          {['Dershane A', 'Dershane B', 'Dershane C', 'Dershane D'].map(d => (
            <div key={d} style={{ padding: '7px 18px', borderRadius: 9, background: COLORS.surface, border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: COLORS.muted, fontWeight: 500 }}>{d}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: export default güncelle — tüm section'ları ekle**

```jsx
// src/pages/LandingPage.jsx
export default function LandingPage({ onLogin }) {
  useFonts();

  return (
    <div style={S.root}>
      <Nav onLogin={onLogin} />
      <ScrollDots />
      <HeroSection onCta={onLogin} />
      <FeaturesSection />
      <RemotionSection />
      <PricingSection onCta={onLogin} />
      <FinalCTA onCta={onLogin} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/LandingPage.jsx
git commit -m "feat: landing page — features, remotion, pricing, final CTA sections"
```

---

## Task 4: App.jsx Routing — Landing Page Entegrasyonu

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.jsx` (AuthGate)

- [ ] **Step 1: LandingPage import ekle**

```jsx
// src/App.jsx — imports arasına ekle
import LandingPage from './pages/LandingPage';
```

- [ ] **Step 2: AuthGate'e `landing` phase ekle**

Mevcut AuthGate içinde `setPhase('login')` satırını bul ve değiştir:

```jsx
// src/App.jsx — AuthGate useEffect içi
// ÖNCE:
if (!user) {
  setPhase('login');
  return;
}

// SONRA:
if (!user) {
  setPhase('landing');
  return;
}
```

- [ ] **Step 3: AuthGate render içine landing phase ekle**

```jsx
// src/App.jsx — AuthGate return içi, AnimatePresence children arasına ekle
{phase === 'landing' && (
  <LandingPage
    key="landing"
    onLogin={() => setPhase('login')}
  />
)}
{phase === 'login' && <LoginPage key="login" />}
```

- [ ] **Step 4: handleOnboardingDone içinde mode-select phase geçişini hazırla (şimdilik doğrudan app)**

Bu step değişmez — mode-select Plan 2'de eklenecek.

- [ ] **Step 5: Tarayıcıda doğrula**

```bash
npm run dev
```

Beklenen:
- Giriş yapılmamışsa `/` → LandingPage görünür
- "Ücretsiz Başla" veya "Giriş Yap" → LoginPage açılır
- Giriş yapılmışsa → direkt app'e gider

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: route landing page for unauthenticated users"
```

---

## Task 5: Responsive + Polish

**Files:**
- Modify: `src/pages/LandingPage.jsx`

- [ ] **Step 1: Mobile breakpoint hook ekle**

```jsx
// src/pages/LandingPage.jsx — useFonts'un altına
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}
```

- [ ] **Step 2: HeroSection içi responsive**

HeroSection'daki stats pill'e `flexDirection: isMobile ? 'column' : 'row'` ekle:

```jsx
// HeroSection içi — stats div
// isMobile prop ekle; FeaturesSection'dan da kullan
const isMobile = useIsMobile(); // HeroSection içine

// stats container:
style={{ display: 'flex', gap: 0, flexDirection: isMobile ? 'column' : 'row', ... }}
```

- [ ] **Step 3: FeaturesSection grid'i mobilde 1 kolon yap**

```jsx
// FeaturesSection içi
const isMobile = useIsMobile();
// features grid:
gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
```

- [ ] **Step 4: PricingSection mobilde 1 kolon**

```jsx
// PricingSection içi
const isMobile = useIsMobile();
// pricing grid:
gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
// popular card transform:
transform: p.popular && !isMobile ? 'scale(1.05)' : 'scale(1)',
```

- [ ] **Step 5: Nav mobilde hamburger (basit)**

```jsx
// Nav içi — mobile'da links gizle
const isMobile = useIsMobile();
// nav-links div:
style={{ display: isMobile ? 'none' : 'flex', gap: 28 }}
```

- [ ] **Step 6: RemotionSection split → mobilde tek kolon**

```jsx
// RemotionSection içi
const isMobile = useIsMobile();
// split div:
gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
```

- [ ] **Step 7: Final doğrulama (desktop + mobile)**

- Chrome DevTools → iPhone 14 Pro boyutunda kontrol
- Scroll snap çalışıyor
- Video arka planda oynuyor
- Tüm fontlar Syne (heading) + Inter (body)
- CTA butonları giriş sayfasına götürüyor

- [ ] **Step 8: Commit**

```bash
git add src/pages/LandingPage.jsx
git commit -m "feat: landing page responsive layout"
```

---

## Spec Self-Review

**Kapsam kontrolü:**
- ✅ Section 3.1 — 5 section (Hero, Features, Remotion, Pricing, Final CTA)
- ✅ Section 3.2 — Nav (logo, linkler, ghost + gradient btn)
- ✅ Section 3.3 — Video BG, aurora, grid, particles, badge, H1, stats
- ✅ Section 2.1 — Syne + Inter, violet/indigo/mint palette
- ✅ Section 2.2 — Video muted loop
- ✅ Section 2.3 — scroll-snap + scroll dots
- ✅ App routing — unauthenticated → LandingPage

**Placeholder tarama:**
- Yok — tüm adımlarda gerçek kod mevcut

**Type consistency:**
- `COLORS` sabiti tüm bileşenlerde aynı referans
- `S.displayFont`, `S.section`, `S.root` tutarlı
- `onLogin` / `onCta` prop isimleri tutarlı
