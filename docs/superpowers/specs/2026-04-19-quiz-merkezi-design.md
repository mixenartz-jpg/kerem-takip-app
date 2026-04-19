# Soru Merkezi — Design Spec

**Date:** 2026-04-19  
**Status:** Approved

---

## Özet

Kullanıcının ders + konu seçerek (veya serbest yazarak) AI destekli soru üretimi yapabileceği, premium planla sınırlı, tekrar sorgulamada farklı soru garantili yeni bir sayfa.

---

## Özellikler

### Soru Üretimi
- Kullanıcı ders dropdown'u + konu serbest metin ile istek yapar
- Gemini `generateQuizQuestions()` ile 5 soru üretir (premium: max 5)
- Sorular JSON formatında döner: `{ question, type, options?, answer, explanation }`
- `type`: `multiple_choice` (A/B/C/D) veya `open_ended` (açık uçlu)

### Test Modu (Kart Akışı)
- Tek kart gösterilir
- Kullanıcı cevaplar (şık seçer veya metin yazar)
- "Cevabı Gör" → doğru/yanlış + açıklama gösterilir
- "Sonraki Soru" → ilerler
- Oturum biter → özet ekranı (X/5 doğru)

### Tekrar Engelleme (Hash Sistemi)
- Her soru için: `SHA-256(subject + topic + question[0:60])` → hex string
- Firestore: `users/{uid}/quizHistory` koleksiyonu
- Yeni istek öncesi önceki hash'ler çekilir, prompt'a eklenir
- Hash store > 200 olunca en eski 50 silinir (FIFO)

### Premium Gate
- `PremiumContext.canAccess('quiz')` ile kontrol
- Premium değilse `PremiumGate` bileşeni gösterilir
- Feature flag: Firestore `admin/feature_flags.quiz`

---

## Veri Modeli

```
Firestore: users/{uid}/quizHistory (koleksiyon)
  Document:
    - subject: string
    - topic: string
    - questionHash: string  (SHA-256 hex)
    - createdAt: Timestamp
```

---

## Bileşen Yapısı

```
src/pages/QuizMerkezi.jsx          ← Ana sayfa
src/components/quiz/QuizCard.jsx   ← Tek soru kartı
src/components/quiz/QuizSummary.jsx ← Oturum özeti
src/services/quizService.js        ← Hash, Firestore ops
geminiService.js (eklenti)         ← generateQuizQuestions()
PremiumContext.jsx (güncelleme)    ← 'quiz' feature flag
App.jsx (güncelleme)               ← /quiz rotası
```

---

## Prompt Sistemi

```
Sen bir YKS soru üreticisisin.
Ders: {subject}
Konu: {topic}
Daha önce sorulmuş hash'ler: {previousHashes} — bu sorularla aynı veya benzer sorular ÜRETME.

5 soru üret. Her soru için tip belirle:
- Kavramsal/tanım → open_ended
- Hesaplama/şık → multiple_choice

SADECE bu JSON formatında döndür:
[
  {
    "question": "...",
    "type": "multiple_choice",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "answer": "A",
    "explanation": "..."
  },
  {
    "question": "...",
    "type": "open_ended",
    "answer": "Beklenen cevap",
    "explanation": "..."
  }
]
```

---

## UI Tasarım Yönü

- Renk paleti: bg `#0f0f11`, accent `#7c3aed`, card bg `#18181b`
- Animasyon: Framer Motion card flip / slide
- Kart progress bar üstte (1/5, 2/5...)
- Sonuç ekranı: confetti + skor dairesi
