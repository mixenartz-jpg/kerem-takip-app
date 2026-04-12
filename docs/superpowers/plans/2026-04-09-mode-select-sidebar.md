# Mode Select + Sidebar Personalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** İlk giriş sonrası mod seçim ekranı ("YKS Odaklı" / "Genel Üretkenlik") ekle; seçim Firestore + localStorage'a kaydedilsin; Sidebar ve Dashboard moda göre kişiselleşsin. Seçim Settings'ten değiştirilebilir olsun.

**Architecture:** `ModeSelectScreen.jsx` yeni bileşen — AuthGate flow'una `mode-select` phase olarak eklenir (onboarding'den önce). `AppContext`'e `userMode` state eklenir, Firestore `users/{uid}.userMode` alanına yazılır. `Sidebar.jsx` mevcut statik `NAV_GROUPS` yerine `userMode`'a göre hesaplanan dinamik grup alır.

**Tech Stack:** React 19, Framer Motion 12, Firestore (mevcut yapı), Tailwind (minimal), `useContext(AppContext)`

**Dependency:** Bu plan, LandingPage planının tamamlanmış olmasını gerektirmiyor — bağımsız çalıştırılabilir.

---

## Dosya Haritası

| Durum | Dosya | Sorumluluk |
|---|---|---|
| **CREATE** | `src/components/ModeSelectScreen.jsx` | Tam ekran mod seçim UI |
| **MODIFY** | `src/context/AppContext.jsx` | `userMode` state + `updateUserMode()` action + Firestore sync |
| **MODIFY** | `src/App.jsx` | AuthGate'e `mode-select` phase ekle |
| **MODIFY** | `src/components/layout/Sidebar.jsx` | Statik NAV_GROUPS → `userMode` bazlı dinamik nav |

---

## Task 1: AppContext — userMode State + Firestore

**Files:**
- Modify: `src/context/AppContext.jsx`

- [ ] **Step 1: DEFAULT_STATE'e userMode ekle**

[src/context/AppContext.jsx:12] — `DEFAULT_STATE` objesinin en sonuna ekle:
```jsx
// DEFAULT_STATE içi — badges satırından sonra:
  userMode: null, // 'yks' | 'daily' | null
```

- [ ] **Step 2: updateUserMode action'ı ekle**

AppContext.jsx'te `AppContext.Provider` value prop'unu bulup `updateUserMode` ekle.

Önce Firestore import'unu kontrol et — `setDoc` zaten mevcut ([src/context/AppContext.jsx:2]).

AppProvider içinde, mevcut action'ların tanımlandığı bölüme şunu ekle:
```jsx
// src/context/AppContext.jsx — AppProvider içi, diğer action'lar yanına
const updateUserMode = useCallback(async (mode) => {
  // 1. Local state güncelle (anında UX)
  setState(prev => ({ ...prev, userMode: mode }));
  // 2. localStorage'a yaz (offline cache)
  if (user) localStorage.setItem(`gt-mode-${user.uid}`, mode);
  // 3. Firestore'a yaz
  if (user) {
    const docRef = doc(db, 'users', user.uid);
    try {
      await setDoc(docRef, { userMode: mode }, { merge: true });
    } catch (err) {
      console.error('updateUserMode Firestore error:', err);
    }
  }
}, [user]);
```

- [ ] **Step 3: Provider value'ya updateUserMode ekle**

AppContext.jsx'te `value={...}` prop'unu bul, `updateUserMode` ekle:
```jsx
// mevcut value objesinin sonuna ekle:
updateUserMode,
```

- [ ] **Step 4: useApp hook'unun dışa aktarıldığını kontrol et**

```bash
grep -n "export.*useApp\|useContext.*AppContext" src/context/AppContext.jsx
```

Beklenen: `export function useApp()` satırı görünür. Yoksa dosyanın en altına ekle:
```jsx
export function useApp() {
  return useContext(AppContext);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.jsx
git commit -m "feat: add userMode state and updateUserMode action to AppContext"
```

---

## Task 2: ModeSelectScreen.jsx

**Files:**
- Create: `src/components/ModeSelectScreen.jsx`

- [ ] **Step 1: Bileşeni oluştur — temel yapı**

```jsx
// src/components/ModeSelectScreen.jsx
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

export default function ModeSelectScreen({ onSelect, onSkip }) {
  const [chosen, setChosen] = useState(null);

  const handleConfirm = () => {
    if (chosen) onSelect(chosen);
  };

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
        fontFamily: I.fontFamily, WebkitFontSmoothing: 'antialiased',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <AuroraBlobs />
      <Content chosen={chosen} setChosen={setChosen} />
      <ActionRow chosen={chosen} onConfirm={handleConfirm} onSkip={onSkip} />
    </motion.div>
  );
}
```

- [ ] **Step 2: AuroraBlobs bileşeni ekle**

```jsx
// src/components/ModeSelectScreen.jsx — AuroraBlobs
function AuroraBlobs() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        filter: 'blur(80px)', background: 'rgba(139,92,246,0.08)',
        top: '-10%', left: '60%',
        animation: 'modeAurora 18s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        filter: 'blur(80px)', background: 'rgba(52,211,153,0.05)',
        top: '60%', left: '5%',
        animation: 'modeAurora 22s ease-in-out infinite',
        animationDelay: '-9s',
      }} />
    </div>
  );
}
```

- [ ] **Step 3: keyframe inject (index.html'e ekle — varsa atla)**

`index.html` `<style>` tag içine:
```css
@keyframes modeAurora { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-15px)} }
```

- [ ] **Step 4: Content bileşeni**

```jsx
// src/components/ModeSelectScreen.jsx — Content
const YKS_SIDEBAR  = ['YKS Merkezi', 'Hata Defteri', 'Dersler', 'Sınavlar', 'AI Merkezi', 'Pomodoro', 'Hedefler'];
const DAILY_SIDEBAR = ['Dashboard', 'Görevler', 'Alışkanlıklar', 'Projeler', 'Notlar', 'Takvim', 'Hedefler'];

function ModeCard({ mode, chosen, onChoose }) {
  const isYks   = mode === 'yks';
  const sel     = chosen === mode;
  const accent  = isYks ? C.mint : C.violet;
  const icon    = isYks ? '🎯' : '⚡';
  const title   = isYks ? 'YKS Odaklı' : 'Genel Üretkenlik';
  const desc    = isYks
    ? 'TYT / AYT hazırlığı için optimize. Deneme analizi, hata defteri ve AI çalışma planı ön planda.'
    : 'Görevler, projeler, alışkanlıklar ve notlar ön planda. YKS araçlarına erişim hâlâ var.';
  const tags    = isYks
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
        fontSize: 11, color: sel ? (isYks ? C.bg : '#fff') : 'transparent',
        fontWeight: 700, transition: 'all .25s',
      }}>✓</div>

      <div style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>{icon}</div>
      <div style={{ ...D, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 16 }}>{desc}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {tags.map(t => (
          <span key={t} style={{
            padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            background: `${accent}18`, color: accent, border: `1px solid ${accent}33`,
          }}>{t}</span>
        ))}
      </div>

      {/* Sidebar preview */}
      <AnimatePresence>
        {sel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: `1px solid ${accent}22`, paddingTop: 14, marginTop: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Sidebar Sırası</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sidebar.slice(0, 5).map((item, i) => (
                  <div key={item} style={{
                    padding: '6px 10px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                    background: i === 0 ? `${accent}18` : 'rgba(255,255,255,0.03)',
                    color: i === 0 ? accent : C.sub,
                    border: i === 0 ? `1px solid ${accent}33` : 'none',
                  }}>{item}</div>
                ))}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>+ {sidebar.length - 5} diğer sayfa...</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Content({ chosen, setChosen }) {
  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.7)' }}>Kurulum · 1 adım</div>
      <h1 style={{ ...D, fontSize: 'clamp(28px,5vw,46px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em' }}>
        Dash YKS'yi nasıl<br />kullanmak istiyorsun?
      </h1>
      <p style={{ fontSize: 15, color: C.sub, lineHeight: 1.6, maxWidth: 440 }}>
        Seçimin arayüzü ve önerileri kişiselleştirir. İstediğin zaman ayarlardan değiştirebilirsin.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', textAlign: 'left' }}>
        <ModeCard mode="yks"   chosen={chosen} onChoose={setChosen} />
        <ModeCard mode="daily" chosen={chosen} onChoose={setChosen} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: ActionRow bileşeni**

```jsx
// src/components/ModeSelectScreen.jsx — ActionRow
function ActionRow({ chosen, onConfirm, onSkip }) {
  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 28 }}>
      <motion.button
        onClick={onConfirm}
        disabled={!chosen}
        whileHover={chosen ? { y: -2 } : {}}
        style={{
          ...D, padding: '14px 40px', borderRadius: 12,
          background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
          color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: chosen ? 'pointer' : 'not-allowed',
          boxShadow: chosen ? '0 4px 20px rgba(139,92,246,0.35)' : 'none',
          opacity: chosen ? 1 : 0.4, transition: 'all .2s',
        }}
      >
        {chosen === 'yks' ? '🎯 YKS Moduna Başla →' : chosen === 'daily' ? '⚡ Üretkenlik Moduna Başla →' : 'Mod Seç →'}
      </motion.button>
      <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.muted }}>
        Şimdi değil, sonra ayarlardan değiştiririm
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Dev'de izole test**

App.jsx'te geçici olarak AuthGate'i bypass et ve ModeSelectScreen'i direkt render et:
```jsx
// Geçici test — App.jsx'e import ekle
import ModeSelectScreen from './components/ModeSelectScreen';
// AuthGate return içine geçici ekle:
if (true) return <ModeSelectScreen onSelect={(m) => console.log('mode:', m)} onSkip={() => console.log('skip')} />;
```
Tarayıcıda kart seç → sidebar preview açılıyor mu kontrol et. Sonra geçici kodu sil.

- [ ] **Step 7: Commit**

```bash
git add src/components/ModeSelectScreen.jsx
git commit -m "feat: ModeSelectScreen — card selection, sidebar preview, aurora"
```

---

## Task 3: App.jsx — mode-select Phase

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: ModeSelectScreen import ekle**

```jsx
// src/App.jsx — imports
import ModeSelectScreen from './components/ModeSelectScreen';
```

- [ ] **Step 2: useApp import ekle**

```jsx
// src/App.jsx — imports
import { useApp } from './context/AppContext';
```

- [ ] **Step 3: AuthGate içinde useApp kullan**

AuthGate fonksiyonu içine ekle:
```jsx
// src/App.jsx — AuthGate içi (useAuth'dan sonra)
const { updateUserMode } = useApp();
```

- [ ] **Step 4: AuthGate useEffect'i güncelle — mode-select phase**

Mevcut onboarding check satırını bul ve güncelle:
```jsx
// src/App.jsx — AuthGate useEffect içi
// ÖNCE:
const key = `gt-onboarded-${user.uid}`;
setPhase(localStorage.getItem(key) ? 'app' : 'onboarding');

// SONRA:
const onboardedKey = `gt-onboarded-${user.uid}`;
const modeKey      = `gt-mode-${user.uid}`;
if (!localStorage.getItem(modeKey)) {
  setPhase('mode-select');
} else if (!localStorage.getItem(onboardedKey)) {
  setPhase('onboarding');
} else {
  setPhase('app');
}
```

- [ ] **Step 5: handleModeSelect fonksiyonu ekle**

```jsx
// src/App.jsx — AuthGate içi, handleOnboardingDone'dan önce
const handleModeSelect = async (mode) => {
  await updateUserMode(mode);
  const onboardedKey = `gt-onboarded-${user.uid}`;
  setPhase(localStorage.getItem(onboardedKey) ? 'app' : 'onboarding');
};

const handleModeSkip = () => {
  // Modu null bırak ama devam et
  const onboardedKey = `gt-onboarded-${user.uid}`;
  // Boş seçim olarak 'daily' default al:
  updateUserMode('daily');
  setPhase(localStorage.getItem(onboardedKey) ? 'app' : 'onboarding');
};
```

- [ ] **Step 6: AnimatePresence children'a mode-select ekle**

```jsx
// src/App.jsx — AuthGate AnimatePresence içi
{phase === 'mode-select' && (
  <ModeSelectScreen
    key="mode-select"
    onSelect={handleModeSelect}
    onSkip={handleModeSkip}
  />
)}
```

- [ ] **Step 7: Tam akış testi**

1. Tarayıcıda localStorage'ı temizle: `localStorage.clear()`
2. Sayfayı yenile
3. LandingPage → Kayıt/Giriş → ModeSelectScreen görünüyor mu?
4. Kart seç → Onboarding → App görünüyor mu?
5. Çıkış yap, tekrar giriş → ModeSelectScreen atlanıyor mu (mode zaten kayıtlı)?

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "feat: mode-select phase in AuthGate flow"
```

---

## Task 4: Sidebar — Mode-Aware Dynamic Nav

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: useApp import ekle**

```jsx
// src/components/layout/Sidebar.jsx — imports arasına
import { useApp } from '../../context/AppContext';
```

- [ ] **Step 2: Mode bazlı nav config tanımla**

Mevcut `NAV_GROUPS` sabitini dosyadan kaldır ve yerine dinamik fonksiyon ekle:
```jsx
// src/components/layout/Sidebar.jsx — NAV_GROUPS sabiti YERİNE
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  FolderKanban, Activity, Timer, BarChart2,
  BookOpen, ClipboardList, Target, Brain, Sparkles,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';

const ALL_ITEMS = {
  dashboard:   { to: '/',           icon: LayoutDashboard,  label: 'Dashboard' },
  tasks:       { to: '/tasks',      icon: CheckSquare,      label: 'Görevler' },
  calendar:    { to: '/calendar',   icon: Calendar,         label: 'Takvim' },
  notes:       { to: '/notes',      icon: FileText,         label: 'Notlar' },
  projects:    { to: '/projects',   icon: FolderKanban,     label: 'Projeler' },
  habits:      { to: '/habits',     icon: Activity,         label: 'Alışkanlıklar' },
  pomodoro:    { to: '/pomodoro',   icon: Timer,            label: 'Pomodoro' },
  lessons:     { to: '/lessons',    icon: BookOpen,         label: 'Dersler' },
  exams:       { to: '/exams',      icon: ClipboardList,    label: 'Sınav Takvimi' },
  yks:         { to: '/yks',        icon: Brain,            label: 'YKS Merkezi' },
  ai:          { to: '/ai',         icon: Sparkles,         label: 'AI Merkezi' },
  goals:       { to: '/goals',      icon: Target,           label: 'Hedefler' },
  stats:       { to: '/stats',      icon: BarChart2,        label: 'İstatistikler' },
};

function getNavGroups(mode) {
  if (mode === 'yks') {
    return [
      {
        label: 'YKS HAZIRLIK',
        items: ['yks', 'lessons', 'exams', 'ai', 'goals'].map(k => ALL_ITEMS[k]),
      },
      {
        label: 'PLANLAMA',
        items: ['pomodoro', 'tasks', 'habits', 'calendar'].map(k => ALL_ITEMS[k]),
      },
      {
        label: 'ANALİZ',
        items: ['stats', 'dashboard'].map(k => ALL_ITEMS[k]),
      },
    ];
  }
  // default: 'daily' veya null
  return [
    {
      label: 'PLANLAMA',
      items: ['dashboard', 'tasks', 'calendar', 'notes', 'projects', 'habits', 'pomodoro'].map(k => ALL_ITEMS[k]),
    },
    {
      label: 'ÖĞRENME',
      items: ['lessons', 'exams', 'yks', 'ai', 'goals'].map(k => ALL_ITEMS[k]),
    },
    {
      label: 'ANALİZ',
      items: ['stats'].map(k => ALL_ITEMS[k]),
    },
  ];
}
```

- [ ] **Step 3: Sidebar component'ine userMode ekle**

Mevcut Sidebar fonksiyonu içindeki `useAuth` satırının altına:
```jsx
// src/components/layout/Sidebar.jsx — Sidebar() içi
const { state } = useApp();
const navGroups = getNavGroups(state.userMode);
```

- [ ] **Step 4: Sidebar render'daki NAV_GROUPS referansını navGroups ile değiştir**

```jsx
// src/components/layout/Sidebar.jsx — nav içi
// ÖNCE:
{NAV_GROUPS.map((group) => (

// SONRA:
{navGroups.map((group) => (
```

- [ ] **Step 5: Mode toggle pill ekle (Sidebar alt kısmına)**

User+Logout bloğundan önce ekle:
```jsx
// src/components/layout/Sidebar.jsx — user div'inden önce
<AnimatePresence>
  {!collapsed && (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ padding: '8px 12px' }}
    >
      <div style={{
        display: 'flex', borderRadius: 10, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)',
      }}>
        {[['yks', '🎯'], ['daily', '⚡']].map(([m, icon]) => (
          <button
            key={m}
            onClick={() => updateUserMode(m)}
            style={{
              flex: 1, padding: '6px 4px', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              background: state.userMode === m ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: state.userMode === m ? '#a78bfa' : 'rgba(255,255,255,0.3)',
              transition: 'all .2s',
            }}
          >{icon} {m === 'yks' ? 'YKS' : 'Günlük'}</button>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 6: updateUserMode'u useApp'ten al**

Sidebar() içine ekle (state ile birlikte):
```jsx
const { state, updateUserMode } = useApp();
```

- [ ] **Step 7: Doğrulama**

- Moda 'yks' seç → Sidebar "YKS HAZIRLIK" grubu üstte, YKS Merkezi ilk sırada
- Moda 'daily' seç → Sidebar "PLANLAMA" grubu üstte, Dashboard ilk sırada
- Alt toggle pill'e tıkla → sidebar anında değişiyor
- Framer Motion `layoutId="sidebarActive"` doğru çalışıyor

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: mode-aware dynamic sidebar nav with toggle pill"
```

---

## Task 5: Dashboard — Mode-Aware Widgets

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Dashboard'a userMode okuma ekle**

```jsx
// src/pages/Dashboard.jsx — mevcut useApp/useContext kullanımının yanına
import { useApp } from '../context/AppContext';
// Dashboard() içinde:
const { state } = useApp();
const { userMode } = state;
```

- [ ] **Step 2: YKS widget'ını sadece YKS modunda öne çıkar**

Dashboard.jsx içinde YKS-related widget'ları (deneme sayacı, net bilgisi vb.) bul. Bunları conditional render ile öne çıkar:
```jsx
// Dashboard.jsx — return içinde, YKS bölümünün etrafına
{userMode === 'yks' && (
  <div className="...yks-summary-widget...">
    {/* Mevcut YKS özet içeriği */}
  </div>
)}

{/* Günlük mod widget'ları — her iki modda da görünür ama yks modunda daha küçük */}
<div className={userMode === 'yks' ? 'col-span-1' : 'col-span-2'}>
  {/* Görev özeti */}
</div>
```

**Not:** Dashboard.jsx'in mevcut yapısını oku (`Read src/pages/Dashboard.jsx`) ve gerçek class isimlerini kullan. Bu adımda taslak gösterilmiştir.

- [ ] **Step 3: Tarayıcıda doğrula**

- YKS modunda Dashboard → deneme bilgisi/net öne çıkmış
- Günlük modunda → görevler/alışkanlıklar öne çıkmış
- Toggle pill → Dashboard anında değişiyor

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: mode-aware dashboard widget priority"
```

---

## Spec Self-Review

**Kapsam kontrolü:**
- ✅ Spec 4.1 — localStorage + Firestore kayıt
- ✅ Spec 4.2 — ModeSelectScreen, iki kart, sidebar preview, skip
- ✅ Spec 4.3 — YKS sidebar sırası, Günlük sidebar sırası
- ✅ Spec 6.2 — Dashboard mod bazlı widget
- ✅ Mod Settings'ten değiştirilebilir (Sidebar toggle pill)
- ✅ AuthGate flow: mode-select → onboarding → app

**Placeholder tarama:**
- Task 5 Step 2'de "Dashboard.jsx'in mevcut yapısını oku" notu var — bu kasıtlı, çünkü Dashboard.jsx'in içeriği bu planı yazan kişi tarafından bilinemiyor. Implementasyon sırasında `Read src/pages/Dashboard.jsx` yapılacak.

**Type consistency:**
- `userMode: 'yks' | 'daily' | null` — AppContext, ModeSelectScreen, Sidebar, Dashboard'da tutarlı
- `updateUserMode(mode)` — AppContext'te tanımlı, Sidebar ve App.jsx'te kullanılıyor
- `getNavGroups(mode)` — string alıp NAV_GROUPS array döndürüyor — tutarlı
