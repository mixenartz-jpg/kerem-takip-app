# gunluk-takip — Claude Code Kuralları

## Proje
React 19 + Vite + Tailwind CSS + Framer Motion kişisel günlük takip uygulaması.
Sayfalar: Dashboard, Tasks, Calendar, Notes, Projects, Habits, Pomodoro, Stats, Lessons, Exams, Goals.
State: Context API (`AppContext`) + localStorage (`gunluk-takip-v1`). UI dili: Türkçe.
Animasyon: Framer Motion (splash, onboarding, geçişler).

---

## Skill / MCP / Plugin Haritası

### MCP Araçları

| MCP Grubu | Araçlar | Ne zaman kullan |
|---|---|---|
| **Magic MCP** | `21st_magic_component_builder`, `21st_magic_component_inspiration`, `21st_magic_component_refiner`, `logo_search` | Yeni UI bileşeni, ikon, logo, tasarım ilhami |
| **Context7** | `query-docs`, `resolve-library-id` | Framer Motion, Tailwind, React, Firebase dokümantasyonu |
| **Exa** | `web_search_exa`, `web_fetch_exa` | Güncel kütüphane API değişiklikleri, best practice araştırma |
| **Stitch** | `generate_screen_from_text`, `edit_screens`, `apply_design_system`, `create_design_system` | Ekran tasarımı prototipleme, design system oluşturma |
| **Playwright** | `browser_snapshot`, `browser_click`, `browser_fill_form`, `browser_take_screenshot` | UI test otomasyonu, görsel regresyon kontrolü |
| **Sequential Thinking** | `sequentialthinking` | Karmaşık mimari kararlar, çok adımlı debug |
| **GitHub MCP** | `create_pull_request`, `create_branch`, `list_commits`, `search_code` | PR oluşturma, branch yönetimi |
| **Memory MCP** | `read_graph`, `search_nodes`, `add_observations` | Proje bağlamını konular arası taşıma |
| **Cron/Remote** | `CronCreate`, `RemoteTrigger` | Periyodik görev tetikleyicileri |

### Skill'ler — Trigger Tablosu

| Trigger (kelime / niyet) | Skill(ler) | MCP |
|---|---|---|
| bileşen, component, UI, ekran, tasarla | `frontend-design`, `design-taste-frontend` | Magic MCP önce |
| animasyon, geçiş, motion, efekt | `frontend-design` | Context7 (Framer Motion) |
| logo, ikon, marka | — | `logo_search` |
| yüksek kalite görsel tasarım | `high-end-visual-design`, `theme-factory` | Magic MCP + Stitch |
| minimalist, sade tasarım | `minimalist-ui` | Magic MCP |
| yeni sayfa, feature, özellik ekle | `brainstorming` → `writing-plans` → `superpowers:write-plan` | — |
| plan, strateji, nasıl yapmalı | `brainstorming`, `everything-claude-code:plan` | Sequential Thinking |
| mimari karar, ADR | `everything-claude-code:blueprint`, `everything-claude-code:architecture-decision-records` | — |
| bug, hata, çalışmıyor, neden | `systematic-debugging`, `gsd-debug` | Playwright (görsel) |
| test, spec, e2e | `test-driven-development`, `everything-claude-code:e2e` | Playwright |
| tarayıcıda test | `webapp-testing`, `everything-claude-code:browser-qa` | Playwright |
| refactor, temizle, sadeleştir | `simplify`, `everything-claude-code:prune` | — |
| kod kalitesi, review | `everything-claude-code:code-review`, `requesting-code-review` | — |
| güvenlik, XSS, injection | `everything-claude-code:security-review`, `everything-claude-code:security-scan` | — |
| commit, PR, branch bitir | `finishing-a-development-branch`, `everything-claude-code:git-workflow` | GitHub MCP |
| dokümantasyon, README | `doc-coauthoring`, `everything-claude-code:docs` | — |
| kütüphane araştır, API bak | — | Context7 + Exa |
| derin araştırma | `everything-claude-code:deep-research` | Exa |
| AI özellik, Gemini entegrasyon | `claude-api` | Context7 |

### Skill Çalıştırma Öncelik Sırası

1. **Process skills** (brainstorming, systematic-debugging) → nasıl yaklaşılacağını belirler
2. **Implementation skills** (frontend-design, test-driven-development) → uygulamayı yönlendirir
3. **Quality skills** (simplify, code-review, security-review) → sonuçta çalıştırılır

---

## Ajan Rolleri

### UI/Frontend Specialist
- Kategori: FRONTEND, UI_DESIGN
- Skills: `frontend-design`, `design-taste-frontend`, `high-end-visual-design`
- MCP: Magic MCP önce → Stitch (prototip) → Context7 (Framer Motion docs)
- Kullanım: Yeni bileşen, sayfa tasarımı, animasyon

### FullStack Developer
- Kategori: FRONTEND + BACKEND
- Skills: `frontend-design`, `everything-claude-code:backend-patterns`, `everything-claude-code:api-design`
- MCP: Magic MCP (UI) + Context7 (Firebase/React docs)
- Kullanım: Yeni feature (UI + veri katmanı birlikte)

### QA Automation Engineer
- Kategori: TESTING
- Skills: `test-driven-development`, `webapp-testing`, `everything-claude-code:e2e`
- MCP: Playwright (tüm araçlar)
- Kullanım: Test yazma, e2e akış doğrulama

### Debug Specialist
- Kategori: DEBUGGING
- Skills: `systematic-debugging`, `gsd-debug`, `everything-claude-code:verify`
- MCP: Sequential Thinking + Playwright (görsel)
- Kullanım: Reproduksiyon → hipotez → fix → doğrulama

### Planner/Architect
- Kategori: ARCHITECTURE, PLANNING
- Skills: `brainstorming`, `writing-plans`, `everything-claude-code:blueprint`
- MCP: Sequential Thinking
- Kullanım: Yeni feature planı, mimari karar

---

## Her Yanıt Başında (UI/kod görevleri için)

```
🤖 AGENT   : [Seçilen rol]
📦 SKILLS  : @skill1, @skill2
🎯 BAĞLAM  : [Kategori]
─────────────────────────────────────
```

### Magic MCP Kullanım Akışı
Yeni UI bileşeni istendiğinde:
1. `21st_magic_component_builder` ile üret (tema: koyu bg `#0f0f11`, accent `#7c3aed`)
2. `frontend-design` kurallarıyla iyileştir
3. Framer Motion ekle (`motion.*`, `AnimatePresence`)
4. Tailwind class'larına dönüştür — inline style yok

---

## Geliştirme Kuralları

- State işlemleri yalnızca `AppContext` — prop drilling yok.
- Yeni bileşenler → `src/components/`, yeni sayfalar → `src/pages/`.
- Stil: yalnızca Tailwind class'ları, inline style yasak.
- localStorage: `useLocalStorage` hook'u ile yönet.
- Animasyon: `framer-motion` (`motion.*`, `AnimatePresence`).
- Türkçe UI korunur.
- Gereksiz yorum, docstring, abstraksiyon ekleme.
- Max 5 skill kombinasyonu — daha fazlası kaliteyi düşürür.

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
