import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
  bg:      '#06050f',
  violet:  '#8b5cf6',
  indigo:  '#6366f1',
  mint:    '#34d399',
  text:    '#f1f0fb',
  muted:   'rgba(241,240,251,0.45)',
  sub:     'rgba(241,240,251,0.65)',
  surface: 'rgba(255,255,255,0.035)',
  border:  'rgba(255,255,255,0.07)',
};
const D = { fontFamily: "'Syne', sans-serif" };
const I = { fontFamily: "'Inter', sans-serif" };

const YKS_SIDEBAR  = ['YKS Merkezi', 'Hata Defteri', 'Dersler', 'Sınavlar', 'AI Merkezi', 'Pomodoro', 'Hedefler'];
const DAILY_SIDEBAR = ['Dashboard', 'Görevler', 'Alışkanlıklar', 'Projeler', 'Notlar', 'Takvim', 'Hedefler'];

function AuroraBlobs() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div
        animate={{ x: [0, 25, -15, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          filter: 'blur(80px)', background: 'rgba(139,92,246,0.08)',
          top: '-10%', left: '60%',
        }}
      />
      <motion.div
        animate={{ x: [0, -20, 15, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: -9 }}
        style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          filter: 'blur(80px)', background: 'rgba(52,211,153,0.05)',
          top: '60%', left: '5%',
        }}
      />
    </div>
  );
}

function ModeCard({ mode, chosen, onChoose }) {
  const isYks  = mode === 'yks';
  const sel    = chosen === mode;
  const accent = isYks ? C.mint : C.violet;
  const icon   = isYks ? '🎯' : '⚡';
  const title  = isYks ? 'YKS Odaklı' : 'Genel Üretkenlik';
  const desc   = isYks
    ? 'TYT / AYT hazırlığı için optimize. Deneme analizi, hata defteri ve AI çalışma planı ön planda.'
    : 'Görevler, projeler, alışkanlıklar ve notlar ön planda. YKS araçlarına erişim hâlâ var.';
  const tags   = isYks
    ? ['Deneme Analizi', 'Hata Defteri', 'Net Takibi', 'AI Plan']
    : ['Görev Yönetimi', 'Kanban', 'Alışkanlıklar', 'Notlar'];
  const sidebar = isYks ? YKS_SIDEBAR : DAILY_SIDEBAR;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onChoose(mode)}
      style={{
        padding: '28px 24px', borderRadius: 20, cursor: 'pointer',
        background: sel ? `${accent}0f` : C.surface,
        border: `2px solid ${sel ? accent : 'rgba(255,255,255,0.08)'}`,
        boxShadow: sel ? `0 0 0 1px ${accent}26, 0 16px 40px ${accent}1a` : 'none',
        position: 'relative', transition: 'all .25s',
      }}
    >
      {/* Check ring */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        width: 22, height: 22, borderRadius: '50%',
        background: sel ? accent : 'transparent',
        border: `2px solid ${sel ? accent : 'rgba(255,255,255,0.12)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: '#fff', fontWeight: 700, transition: 'all .25s',
      }}>
        {sel && '✓'}
      </div>

      <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>{icon}</span>
      <div style={{ ...D, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, color: C.text }}>{title}</div>
      <div style={{ ...I, fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 16 }}>{desc}</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {tags.map(t => (
          <span key={t} style={{
            ...I, padding: '3px 10px', borderRadius: 100,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            background: `${accent}18`, color: accent, border: `1px solid ${accent}33`,
          }}>{t}</span>
        ))}
      </div>

      {/* Sidebar preview */}
      <AnimatePresence>
        {sel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: `1px solid ${accent}22`, paddingTop: 14, marginTop: 4 }}>
              <p style={{ ...I, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
                Sidebar Sırası
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sidebar.slice(0, 5).map((item, i) => (
                  <div key={item} style={{
                    ...I, padding: '6px 10px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                    background: i === 0 ? `${accent}18` : 'rgba(255,255,255,0.03)',
                    color: i === 0 ? accent : C.sub,
                    border: i === 0 ? `1px solid ${accent}33` : 'none',
                  }}>{item}</div>
                ))}
                <div style={{ ...I, fontSize: 11, color: C.muted, marginTop: 2 }}>
                  + {sidebar.length - 5} diğer sayfa...
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ModeSelectScreen({ onSelect, onSkip }) {
  const [chosen, setChosen] = useState(null);

  return (
    <motion.div
      key="mode-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh', background: C.bg, color: C.text,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px',
        ...I, WebkitFontSmoothing: 'antialiased',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <AuroraBlobs />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 720, width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 28, textAlign: 'center',
      }}>
        <div style={{ ...I, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.7)' }}>
          Kurulum · 1 adım
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ ...D, fontSize: 'clamp(28px,5vw,46px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em', color: C.text }}
        >
          Dash YKS'yi nasıl<br />kullanmak istiyorsun?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ ...I, fontSize: 15, color: C.sub, lineHeight: 1.6, maxWidth: 440 }}
        >
          Seçimin arayüzü ve önerileri kişiselleştirir.
          İstediğin zaman ayarlardan değiştirebilirsin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', textAlign: 'left' }}
        >
          <ModeCard mode="yks"   chosen={chosen} onChoose={setChosen} />
          <ModeCard mode="daily" chosen={chosen} onChoose={setChosen} />
        </motion.div>
      </div>

      {/* Action row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 28 }}
      >
        <motion.button
          onClick={() => chosen && onSelect(chosen)}
          disabled={!chosen}
          whileHover={chosen ? { y: -2, boxShadow: '0 8px 28px rgba(139,92,246,0.5)' } : {}}
          whileTap={chosen ? { scale: 0.97 } : {}}
          style={{
            ...D, padding: '14px 40px', borderRadius: 12,
            background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
            color: '#fff', fontSize: 16, fontWeight: 700,
            border: 'none', cursor: chosen ? 'pointer' : 'not-allowed',
            boxShadow: chosen ? '0 4px 20px rgba(139,92,246,0.35)' : 'none',
            opacity: chosen ? 1 : 0.4, transition: 'all .2s',
          }}
        >
          {chosen === 'yks' ? '🎯 YKS Moduna Başla →'
            : chosen === 'daily' ? '⚡ Üretkenlik Moduna Başla →'
            : 'Mod Seç →'}
        </motion.button>

        <button
          onClick={onSkip}
          style={{ ...I, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.muted }}
        >
          Şimdi değil, sonra ayarlardan değiştiririm
        </button>
      </motion.div>
    </motion.div>
  );
}
