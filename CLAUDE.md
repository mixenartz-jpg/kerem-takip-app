# gunluk-takip — Claude Code Kuralları

## Proje
React 19 + Vite + Tailwind CSS + Framer Motion kişisel günlük takip uygulaması.
Sayfalar: Dashboard, Tasks, Calendar, Notes, Projects, Habits, Pomodoro, Stats, Lessons, Exams, Goals.
State: Context API (`AppContext`) + localStorage (`gunluk-takip-v1`). UI dili: Türkçe.

---

## MCP Araçları

| MCP | Araçlar | Tetikleyici |
|---|---|---|
| **Magic MCP** | `21st_magic_component_builder`, `21st_magic_component_inspiration`, `21st_magic_component_refiner`, `logo_search` | UI bileşeni, ikon, tasarım |
| **Context7** | `resolve-library-id`, `query-docs` | Framer Motion, Tailwind, React, Firebase docs |
| **Exa** | `web_search_exa`, `web_fetch_exa` | Güncel API değişiklikleri, araştırma |
| **Stitch** | `generate_screen_from_text`, `edit_screens`, `apply_design_system` | Ekran prototipi, design system |
| **Playwright** | `browser_snapshot`, `browser_click`, `browser_take_screenshot` | UI test, görsel regresyon |
| **Sequential Thinking** | `sequentialthinking` | Karmaşık mimari/debug kararları |
| **GitHub MCP** | `create_pull_request`, `create_branch`, `search_code` | PR, branch yönetimi |
| **Memory MCP** | `read_graph`, `search_nodes`, `add_observations` | Konular arası bağlam |

---

## Skill Trigger Tablosu

| Tetikleyici | Skill(ler) | MCP Önceliği |
|---|---|---|
| bileşen, UI, ekran, tasarla | `frontend-design`, `design-taste-frontend` | Magic MCP önce |
| animasyon, motion, efekt | `frontend-design` | Context7 (Framer Motion) |
| logo, ikon | — | `logo_search` |
| yüksek kalite tasarım | `high-end-visual-design`, `theme-factory` | Magic MCP + Stitch |
| minimalist tasarım | `minimalist-ui` | Magic MCP |
| yeni sayfa / feature | `brainstorming` → `writing-plans` | Sequential Thinking |
| mimari karar | `everything-claude-code:blueprint` | Sequential Thinking |
| bug, hata, çalışmıyor | `systematic-debugging`, `gsd-debug` | Playwright |
| test, e2e | `test-driven-development`, `everything-claude-code:e2e` | Playwright |
| refactor, sadeleştir | `simplify`, `everything-claude-code:prune` | — |
| kod review | `everything-claude-code:code-review` | — |
| güvenlik | `everything-claude-code:security-review` | — |
| commit, PR | `finishing-a-development-branch` | GitHub MCP |
| kütüphane araştır | — | Context7 + Exa |
| AI özellik | `claude-api` | Context7 |

**Skill öncelik sırası:** Process (brainstorming, debugging) → Implementation (frontend-design, tdd) → Quality (simplify, code-review)

---

## Ajan Rolleri

| Rol | Skills | MCP |
|---|---|---|
| **UI/Frontend** | `frontend-design`, `high-end-visual-design` | Magic MCP → Stitch → Context7 |
| **FullStack** | `frontend-design`, `everything-claude-code:backend-patterns` | Magic MCP + Context7 |
| **QA** | `test-driven-development`, `everything-claude-code:e2e` | Playwright |
| **Debug** | `systematic-debugging`, `gsd-debug` | Sequential Thinking + Playwright |
| **Planner** | `brainstorming`, `writing-plans`, `everything-claude-code:blueprint` | Sequential Thinking |

Her yanıt başında (UI/kod görevleri):
```
🤖 AGENT: [Rol]  📦 SKILLS: @skill1, @skill2  🎯 BAĞLAM: [Kategori]
```

### Magic MCP Akışı (yeni UI bileşeni)
1. `21st_magic_component_builder` → tema: bg `#0f0f11`, accent `#7c3aed`
2. `frontend-design` kurallarıyla iyileştir
3. Framer Motion ekle (`motion.*`, `AnimatePresence`)
4. Tailwind class'larına dönüştür — inline style yok

---

## Geliştirme Kuralları

- State yalnızca `AppContext` — prop drilling yok.
- Yeni bileşenler → `src/components/`, yeni sayfalar → `src/pages/`.
- Stil: yalnızca Tailwind class'ları, inline style yasak.
- localStorage: `useLocalStorage` hook'u.
- Animasyon: `framer-motion` (`motion.*`, `AnimatePresence`).
- Türkçe UI korunur. Gereksiz yorum/abstraksiyon ekleme.
- Max 5 skill kombinasyonu.
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
├── context/        AppContext.jsx
├── hooks/          useLocalStorage.js
├── pages/          11 sayfa bileşeni
└── utils/          dateUtils.js, statsUtils.js
```

## Onboarding / Splash
- `SplashScreen.jsx` — Framer Motion ilk yükleme animasyonu
- `OnboardingScreen.jsx` — 3 adımlı tanıtım
- Flag: `localStorage.getItem('gt-onboarded')` → görüldüyse atla
- `App.jsx`'te `<AnimatePresence>` ile yönetilir
