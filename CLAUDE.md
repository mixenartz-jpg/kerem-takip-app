# gunluk-takip — Claude Code Kuralları

## Proje
React 19 + Vite + Tailwind CSS + Framer Motion kişisel günlük takip uygulaması.
Sayfalar: Dashboard, Tasks, Calendar, Notes, Projects, Habits, Pomodoro, Stats, Lessons, Exams, Goals.
State: Context API (`AppContext`) + localStorage (`gunluk-takip-v1`). UI dili: Türkçe.
Animasyon: Framer Motion (splash, onboarding, geçişler).

## Otomatik Skill & MCP Seçimi

Aşağıdaki trigger kelimeleri tespit edildiğinde ilgili skill/MCP **otomatik** devreye girer:

| Trigger (kelime / niyet) | Skill / MCP |
|---|---|
| bileşen, component, tasarla, UI, ekran, sayfa görünümü | Magic MCP `/ui` → `frontend-design` |
| animasyon, geçiş, motion, efekt | `frontend-design` + Framer Motion docs |
| yeni sayfa, feature, özellik ekle | `brainstorming` → `writing-plans` → uygula |
| bug, hata, çalışmıyor, neden | `systematic-debugging` |
| test, spec | `test-driven-development` |
| refactor, temizle, sadeleştir | `simplify` |
| güvenlik, XSS, injection | `security-reviewer` |
| plan, strateji, nasıl yapmalı | `brainstorming` |
| commit, PR, branch bitir | `finishing-a-development-branch` |

### Her Yanıt Başında (UI/kod görevleri için)
```
🤖 AGENT   : [Seçilen rol]
📦 SKILLS  : @skill1, @skill2
🎯 BAĞLAM  : [Kategori]
─────────────────────────────────────
```

### Magic MCP Kullanımı
Yeni UI bileşeni istendiğinde:
1. `/ui [Türkçe açıklama + tema detayı: koyu, violet #7c3aed]` ile üret
2. Çıktıyı `frontend-design` kurallarıyla iyileştir
3. Framer Motion ekle (animasyon varsa)

## Geliştirme Kuralları

- State işlemleri yalnızca `AppContext` üzerinden — prop drilling yok.
- Yeni bileşenler → `src/components/`, yeni sayfalar → `src/pages/`.
- Stil: yalnızca Tailwind class'ları, inline style yasak.
- localStorage: `useLocalStorage` hook'u ile yönet.
- Animasyon: `framer-motion` (`motion.*`, `AnimatePresence`).
- Türkçe UI korunur.
- Gereksiz yorum, docstring, abstraksiyon ekleme.

## Kod Standartları

- Fonksiyonel bileşenler + hook'lar. Class component yok.
- `export default` her bileşen dosyasında.
- Dosya isimleri: PascalCase (bileşenler), camelCase (yardımcılar).
- Renk paleti: bg `#0f0f11`, accent `#7c3aed` (violet-600), text `#e4e4e7`, border `#27272a`.

## Mimari

```
src/
├── components/
│   ├── layout/     Header, Sidebar, CommandPalette
│   ├── ui/         Badge, Modal, ProgressBar
│   └── [domain]/   calendar/, habits/, notes/, pomodoro/, projects/, stats/, tasks/
├── context/        AppContext.jsx  ← tek global state
├── hooks/          useLocalStorage.js
├── pages/          11 sayfa bileşeni
└── utils/          dateUtils.js, statsUtils.js
```

## Onboarding / Splash

- `src/components/SplashScreen.jsx` — ilk yükleme animasyonu (Framer Motion)
- `src/components/OnboardingScreen.jsx` — 3 adımlı tanıtım
- Flag: `localStorage.getItem('gt-onboarded')` → görüldüyse atla
- App.jsx'te `<AnimatePresence>` ile yönetilir
