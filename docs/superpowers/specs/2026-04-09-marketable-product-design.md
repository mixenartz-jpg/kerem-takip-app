# Dash YKS — Satılabilir Ürün Dönüşümü: Tasarım Spesifikasyonu

**Tarih:** 2026-04-09  
**Kapsam:** Landing page, mod seçimi, kişiselleştirme, Remotion video raporu, yeni sayfa önerileri  
**Karar veren:** Claude (kullanıcı yokken otonom)

---

## 1. Bağlam ve Motivasyon

Mevcut uygulama çalışan bir MVP. Hedef: Baykuş ve 345 All Star gibi rakiplerin üstüne çıkacak, dershane ve öğrencilere **satılabilir** bir ürüne dönüştürmek.

**Rakip boşlukları:**
- Baykuş: sadece not tutma, zayıf AI, yok deneme analizi
- 345 All Star: iyi deneme analizi ama kişiselleştirme yok, yıllık fiyat yüksek
- **Fırsat:** AI + Remotion kişisel video raporu + mod bazlı UX — kimsenin vermediği

---

## 2. Tasarım Kararları (Onaylanmış)

### 2.1 Estetik Yön
- **Neural/Digital** teması: derin uzay (#06050f), elektrik violet, mint highlight
- **Fontlar:** Syne (heading/display, 700-800) + Inter (body, 400-600)
- **Palette:**
  - `--violet: #8b5cf6` — birincil aksan
  - `--indigo: #6366f1` — gradient ikincil
  - `--mint: #34d399` — highlight, başarı, YKS modu
  - `--bg: #06050f` — arka plan
- **Animasyonlar:** aurora blob drift, CSS grid pulse, floating particles (4 renk + glow)

### 2.2 Arka Plan Videosu
- Kullanıcı videosu (`cloudfront.net/...hf_20260405...mp4`) hero section'da `muted loop` olarak çalışır
- Opacity: 0.28, üstünde multi-layer gradient overlay
- CORS cross-origin gereksinimlerine dikkat et

### 2.3 Scroll Yapısı
- `scroll-snap-type: y mandatory` — tam ekran bölümler arası snap
- Sağ kenarda dot navigasyon (Intersection Observer ile aktif bölümü işaret eder)

---

## 3. Landing Page (Pre-Login)

### 3.1 Bölümler (sırayla, scroll-snap)

| # | Section ID | İçerik |
|---|---|---|
| 1 | `#hero` | Video BG + aurora + grid + badge + H1 + iki CTA + stat row |
| 2 | `#features` | 6 özellik kartı — YKS/Günlük/AI tag'leriyle |
| 3 | `#remotion-section` | Sol: açıklama; Sağ: canlı haftalık rapor mockup'ı |
| 4 | `#pricing` | 3 tier (Ücretsiz / Pro ₺99 / Kurumsal teklif) |
| 5 | `#final-cta` | Büyük CTA + partner dershane logoları |

### 3.2 Nav
- Fixed, glassmorphism (`backdrop-filter: blur(24px)`)
- Sol: Logo (⚡ Dash YKS)
- Orta: Özellikler / Video Rapor / Fiyatlar
- Sağ: "Giriş Yap" (ghost) + "Ücretsiz Başla →" (gradient btn)

### 3.3 Hero Bileşenleri
- `<video autoplay muted loop playsinline>` — arka plan
- Aurora blobs (3 adet, 18-26s drift animation, blur 80px)
- CSS grid overlay pulse
- JS ile 28 particle (4 renk, glow shadow)
- Badge: "YENİ" pill + canlı yeşil nokta
- H1: "YKS'ye hazırlan. / Hayatını yönet."
- Sub: "AI asistan, deneme analizi, kişisel video raporu..."
- CTA: "🚀 Ücretsiz Hesap Oluştur" + "▶ Demo İzle"
- Stats: 12.000+ öğrenci / %94 memnuniyet / 50+ dershane — tek pill içinde

---

## 4. Mod Seçimi (İlk Giriş Sonrası)

### 4.1 Akış
```
Login/Kayıt → Email Doğrulama → [YENİ] Mod Seçim Ekranı → OnboardingScreen → App
```

`localStorage.getItem('gt-mode-{uid}')` yoksa → Mod Seçim göster  
Seçim: `'yks' | 'daily'` — Firestore `users/{uid}.mode` + localStorage'a yaz

### 4.2 Mod Seçim Ekranı (`ModeSelectScreen.jsx`)
- Tam ekran, Aurora arka plan
- İki kart: "🎯 YKS Odaklı" + "⚡ Genel Üretkenlik"
- Kart seçince altında sidebar preview animasyonla değişiyor
- "Başlayalım →" butonu seçim yapılmadan disabled
- Alt skip linki: "Şimdi değil, sonra ayarlardan değiştiririm"

### 4.3 Mod Etkisi

**YKS Modu sidebar sırası:**
1. YKS Merkezi, 2. Hata Defteri, 3. Dersler, 4. Sınavlar, 5. AI Merkezi, 6. Pomodoro, 7. Hedefler, 8. Dashboard, 9. Görevler (gri/küçük)

**Günlük Mod sidebar sırası:**
1. Dashboard, 2. Görevler, 3. Alışkanlıklar, 4. Projeler, 5. Notlar, 6. Takvim, 7. Hedefler, 8. Pomodoro, 9. YKS Merkezi (gri/küçük)

Dashboard widget'ları da moda göre değişir (YKS → deneme grafikleri; Günlük → görev/alışkanlık summary).

---

## 5. Remotion — Kişisel Video Raporu

### 5.1 Ne üretilecek?
Her hafta (Pro plan) kullanıcının verileriyle Remotion ile MP4 üretilir:
- İsim + streak sayısı
- TYT/AYT net gelişim (animated bar chart)
- Bu haftanın highlight'ı
- Motivasyon mesajı (AI üretimi)

### 5.2 Teknik Yaklaşım
- Ayrı `/remotion` dizininde Remotion composition (`WeeklyReport.tsx`)
- `renderMedia()` serverless function (Vercel Edge) veya client-side preview
- Props: `{ userName, streak, tytNet, aytNet, targetNets, weekDelta }`
- Çıktı: 1080x1920 (story) veya 1920x1080 (landscape) — önce landscape

### 5.3 Landing'deki Yeri
Section 3'te sağ panel: canlı mockup (statik HTML preview), "Haftalık Raporumu Gör" CTA

---

## 6. Sayfa / Feature Önerileri (Yeni)

### 6.1 Öncelikli Yeni Sayfalar
| Sayfa | Neden | Route |
|---|---|---|
| **Öğretmen Paneli** | Dershane satışı için kritik — öğrenci listesi, net takibi | `/ogretmen` |
| **Leaderboard** | Viral mekanik — dershane içi sıralama | `/liderlik` |
| **Konu Haritası** | Görsel konu ağacı (YKS syllabus) | `/konu-haritasi` |
| **Deneme Karşılaştırma** | Birden fazla denemeyi yan yana göster | `/deneme-analiz` |

### 6.2 Mevcut Sayfa İyileştirmeleri
| Sayfa | İyileştirme |
|---|---|
| Dashboard | Mod bazlı widget layout (YKS vs Günlük) |
| YKS | Deneme grafiği animasyonlu (Recharts + Framer Motion) |
| Stats | Remotion video export butonu ekle |
| Login | Landing page'den ayrı route, `/login` |
| Onboarding | Mod seçiminden sonra gelsin |

### 6.3 UX İyileştirmeleri
- Sidebar'a "YKS Modu / Günlük Mod" toggle pill (Settings'e gitmeden)
- Dashboard'a "Bu hafta ne yapmalısın?" AI widget'ı
- Mobile: bottom nav'da aktif moda göre 5 ikon değişsin
- Notification: haftalık rapor hazır → toast notification

---

## 7. Fiyatlandırma Modeli

| Plan | Fiyat | Hedef |
|---|---|---|
| Ücretsiz | ₺0 | Bireysel, deneme limitleri |
| Pro Öğrenci | ₺99/ay | Sınırsız + video rapor |
| Kurumsal | Teklif | Dershane, white-label |

**Kurumsal pitch:** Öğretmen paneli + toplu Remotion rapor + white-label marka

---

## 8. Teknik Kararlar

### Yeni Dosyalar
```
src/
├── pages/
│   ├── LandingPage.jsx          ← YENİ (pre-login marketing)
│   ├── ModeSelectScreen.jsx     ← YENİ (mod seçimi)
│   ├── TeacherPanel.jsx         ← YENİ (kurumsal)
│   └── Leaderboard.jsx          ← YENİ (viral)
├── components/
│   └── landing/
│       ├── HeroSection.jsx
│       ├── FeaturesSection.jsx
│       ├── RemotionSection.jsx
│       ├── PricingSection.jsx
│       └── FinalCTA.jsx
remotion/
├── index.ts
└── compositions/
    └── WeeklyReport.tsx
```

### App.jsx Route Güncellemesi
```
/ (root)          → LandingPage (eğer auth yoksa)
/login            → LoginPage
/app/*            → AuthGate → ModeSelectScreen → Onboarding → AppLayout
```

### AppContext Güncellemesi
- `user.mode: 'yks' | 'daily' | null` alanı ekle
- `updateUserMode(mode)` action ekle
- Sidebar sırası `mode`'a göre computed

---

## 9. Doğrulama Listesi (Implementation Sonrası)

- [ ] LandingPage `/` route'unda, login olmadan açılıyor
- [ ] Video arka planda loop oynuyor, öne içerik geliyor
- [ ] Scroll snap 5 section arasında çalışıyor
- [ ] Scroll dot nav aktif bölümü işaret ediyor
- [ ] ModeSelectScreen ilk girişte çıkıyor, sonraki girişlerde çıkmıyor
- [ ] Sidebar YKS modunda YKS sayfaları üstte
- [ ] Sidebar Günlük modunda Dashboard/Görevler üstte
- [ ] Mod Settings'ten değiştirilebilir
- [ ] Remotion preview section'da görünüyor
- [ ] Fiyatlandırma bölümü mobil'de stack oluyor
- [ ] Syne font heading'lerde yükleniyor
