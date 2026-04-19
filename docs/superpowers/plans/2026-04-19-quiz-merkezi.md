# Quiz Merkezi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/quiz` rotasında premium kullanıcılar için AI destekli, tekrar sorgulamada farklı soru garantili, kart bazlı soru merkezi sayfası oluşturmak.

**Architecture:** Gemini `generateQuizQuestions()` ile 5 soru üretilir; her soru SHA-256 hash'i Firestore `users/{uid}/quizHistory` koleksiyonuna yazılır. Sonraki istekte hash'ler prompt'a eklenerek tekrar engellenir. Premium gate `PremiumContext.canAccess('quiz')` ile çalışır.

**Tech Stack:** React 19, Framer Motion, Tailwind CSS, Firebase Firestore, Gemini API (`@google/generative-ai`), Web Crypto API (SHA-256)

---

## File Map

| Durum | Dosya | Sorumluluk |
|---|---|---|
| Yeni | `src/services/quizService.js` | SHA-256 hash, Firestore CRUD (quizHistory) |
| Güncelle | `src/services/geminiService.js` | `generateQuizQuestions()` fonksiyonu |
| Yeni | `src/components/quiz/QuizCard.jsx` | Tek soru kartı (multiple_choice + open_ended) |
| Yeni | `src/components/quiz/QuizSummary.jsx` | Oturum özeti ekranı |
| Yeni | `src/pages/QuizMerkezi.jsx` | Ana sayfa — ders/konu seçimi + quiz akışı |
| Güncelle | `src/components/ui/PremiumGate.jsx` | `quiz` feature meta eklenir |
| Güncelle | `src/context/PremiumContext.jsx` | `quiz` default flag eklenir |
| Güncelle | `src/App.jsx` | `/quiz` rotası + `PAGE_TITLES` |
| Güncelle | `src/components/layout/DrawerMenu.jsx` | "Soru Merkezi" nav item (her iki grup) |

---

## Task 1: quizService.js — Hash & Firestore

**Files:**
- Create: `src/services/quizService.js`

- [ ] **Step 1: Dosyayı oluştur**

```js
// src/services/quizService.js
import {
  collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const MAX_HASHES = 200;
const PRUNE_TO = 150;

export async function hashQuestion(subject, topic, questionText) {
  const raw = `${subject}|${topic}|${questionText.slice(0, 60)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchPreviousHashes(uid) {
  const col = collection(db, 'users', uid, 'quizHistory');
  const q = query(col, orderBy('createdAt', 'desc'), limit(MAX_HASHES));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, hash: d.data().questionHash }));
}

export async function saveQuestionHashes(uid, questions, subject, topic) {
  const col = collection(db, 'users', uid, 'quizHistory');

  // prune if over limit
  const existing = await fetchPreviousHashes(uid);
  if (existing.length >= MAX_HASHES) {
    const toDelete = existing.slice(PRUNE_TO);
    await Promise.all(toDelete.map(d => deleteDoc(doc(db, 'users', uid, 'quizHistory', d.id))));
  }

  await Promise.all(
    questions.map(async (q) => {
      const questionHash = await hashQuestion(subject, topic, q.question);
      return addDoc(col, { subject, topic, questionHash, createdAt: serverTimestamp() });
    })
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/quizService.js
git commit -m "feat: add quizService with SHA-256 hash and Firestore CRUD"
```

---

## Task 2: geminiService.js — generateQuizQuestions()

**Files:**
- Modify: `src/services/geminiService.js` (dosyanın sonuna ekle)

- [ ] **Step 1: Fonksiyonu ekle**

`geminiService.js` dosyasının en sonuna (son `}` kapandıktan sonra) şunu ekle:

```js
/* ── Quiz Soru Üretici ── */
export async function generateQuizQuestions(subject, topic, previousHashes = []) {
  const m = getModel();

  const hashNote = previousHashes.length > 0
    ? `Aşağıdaki hash değerlerine sahip sorularla AYNI veya ÇOK BENZER sorular üretme (önceki oturumlardan):\n${previousHashes.slice(0, 50).join(', ')}`
    : '';

  const prompt = `Sen bir YKS ve genel lise soru üreticisisin.
Ders: ${subject}
Konu: ${topic}
${hashNote}

Tam olarak 5 soru üret. Her soru için uygun tipi seç:
- Hesaplama, tanımlama, şık gerektiren → "multiple_choice" (A/B/C/D)
- Kısa açıklama, kavram, yorum → "open_ended"

SADECE aşağıdaki JSON formatında döndür, başka hiçbir metin yazma:
[
  {
    "question": "Soru metni",
    "type": "multiple_choice",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "answer": "A",
    "explanation": "Neden A doğru, kısa açıklama"
  },
  {
    "question": "Soru metni",
    "type": "open_ended",
    "answer": "Beklenen cevap veya anahtar kelimeler",
    "explanation": "Açıklama"
  }
]`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const match = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\[[\s\S]*\])/);
  try {
    return match ? JSON.parse(match[1]) : JSON.parse(text);
  } catch {
    throw new Error('Soru formatı ayrıştırılamadı. Lütfen tekrar dene.');
  }
}

/* ── Open-ended Cevap Değerlendirici ── */
export async function evaluateOpenAnswer(question, expectedAnswer, userAnswer) {
  const m = getModel();
  const prompt = `Bir öğrencinin cevabını değerlendir.

Soru: ${question}
Beklenen cevap: ${expectedAnswer}
Öğrencinin cevabı: ${userAnswer}

SADECE bu JSON formatında döndür:
{"correct": true, "feedback": "Kısa geri bildirim (1-2 cümle)"}

Cevap tam doğru olmasa bile anahtar kavramları içeriyorsa correct: true kabul et.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/(\{[\s\S]*?\})/);
  try {
    return jsonMatch ? JSON.parse(jsonMatch[1]) : { correct: false, feedback: 'Değerlendirme yapılamadı.' };
  } catch {
    return { correct: false, feedback: 'Değerlendirme yapılamadı.' };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/geminiService.js
git commit -m "feat: add generateQuizQuestions and evaluateOpenAnswer to geminiService"
```

---

## Task 3: PremiumGate & PremiumContext — quiz feature flag

**Files:**
- Modify: `src/components/ui/PremiumGate.jsx`
- Modify: `src/context/PremiumContext.jsx`

- [ ] **Step 1: PremiumGate.jsx'e quiz meta ekle**

`FEATURE_META` objesine şunu ekle (mevcut `hata_defteri` satırından sonra):

```js
  quiz: {
    icon: BookOpen,
    label: 'Soru Merkezi',
    description: 'AI destekli kişiselleştirilmiş soru üretimi. Konuya özel 5 soru, tekrar engelleme ve detaylı açıklamalar.',
  },
```

Ayrıca `perks` dizisinde son item'dan sonra şunu ekle:

```js
    { icon: BookOpen, text: 'Soru Merkezi (AI soru üretimi)' },
```

- [ ] **Step 2: PremiumContext.jsx'e quiz default flag ekle**

`featureFlags` state'ini şöyle güncelle:

```js
  const [featureFlags, setFeatureFlags] = useState({
    ai_merkezi: false,
    ileri_istatistikler: false,
    hata_defteri: false,
    quiz: false,
  });
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/PremiumGate.jsx src/context/PremiumContext.jsx
git commit -m "feat: add quiz feature flag to PremiumContext and PremiumGate meta"
```

---

## Task 4: QuizCard.jsx

**Files:**
- Create: `src/components/quiz/QuizCard.jsx`

- [ ] **Step 1: Dosyayı oluştur**

```jsx
// src/components/quiz/QuizCard.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { evaluateOpenAnswer, parseGeminiError } from '../../services/geminiService';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizCard({ question, index, total, onNext, onAnswer }) {
  const [selected, setSelected] = useState(null);      // multiple_choice: 'A'|'B'|'C'|'D'
  const [openText, setOpenText] = useState('');         // open_ended input
  const [revealed, setRevealed] = useState(false);
  const [evalResult, setEvalResult] = useState(null);  // { correct, feedback }
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  const isMultiple = question.type === 'multiple_choice';

  async function handleReveal() {
    if (isMultiple) {
      const correct = selected === question.answer;
      setEvalResult({ correct, feedback: question.explanation });
      setRevealed(true);
      onAnswer(correct);
    } else {
      if (!openText.trim()) return;
      setEvaluating(true);
      setError('');
      try {
        const result = await evaluateOpenAnswer(question.question, question.answer, openText);
        setEvalResult(result);
        setRevealed(true);
        onAnswer(result.correct);
      } catch (err) {
        setError(parseGeminiError(err));
      } finally {
        setEvaluating(false);
      }
    }
  }

  const canReveal = isMultiple ? !!selected : openText.trim().length > 0;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((index) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-zinc-500 tabular-nums shrink-0">{index + 1} / {total}</span>
      </div>

      {/* Question */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
        <p className="text-sm text-zinc-400 mb-2 font-medium">
          {isMultiple ? 'Çoktan Seçmeli' : 'Açık Uçlu'}
        </p>
        <p className="text-base text-zinc-100 leading-relaxed font-medium">{question.question}</p>
      </div>

      {/* Answer area */}
      {isMultiple ? (
        <div className="flex flex-col gap-2 mb-5">
          {OPTION_LABELS.map(label => {
            const text = question.options?.[label];
            if (!text) return null;
            const isSelected = selected === label;
            const isCorrect = revealed && label === question.answer;
            const isWrong = revealed && isSelected && label !== question.answer;

            return (
              <motion.button
                key={label}
                whileHover={!revealed ? { scale: 1.01 } : {}}
                whileTap={!revealed ? { scale: 0.99 } : {}}
                onClick={() => !revealed && setSelected(label)}
                disabled={revealed}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm transition-all text-left
                  ${isCorrect ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300' :
                    isWrong ? 'bg-red-600/20 border-red-500/50 text-red-300' :
                    isSelected ? 'bg-violet-600/20 border-violet-500/50 text-violet-200' :
                    'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border
                  ${isCorrect ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300' :
                    isWrong ? 'bg-red-500/30 border-red-500/50 text-red-300' :
                    isSelected ? 'bg-violet-500/30 border-violet-500/50 text-violet-300' :
                    'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                  {label}
                </span>
                {text}
                {isCorrect && <CheckCircle2 size={15} className="ml-auto text-emerald-400 shrink-0" />}
                {isWrong && <XCircle size={15} className="ml-auto text-red-400 shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="mb-5">
          <textarea
            value={openText}
            onChange={e => setOpenText(e.target.value)}
            disabled={revealed || evaluating}
            placeholder="Cevabını buraya yaz..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600
              focus:outline-none focus:border-violet-500/50 resize-none min-h-[100px] transition-colors disabled:opacity-60"
          />
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {revealed && evalResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl p-4 mb-5 border text-sm
              ${evalResult.correct
                ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-600/10 border-red-500/30 text-red-300'}`}
          >
            <div className="flex items-center gap-2 font-semibold mb-1.5">
              {evalResult.correct
                ? <><CheckCircle2 size={15} /> Doğru!</>
                : <><XCircle size={15} /> Yanlış</>}
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">{evalResult.feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-400 mb-4 bg-red-600/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!revealed ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReveal}
            disabled={!canReveal || evaluating}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600
              text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            {evaluating ? <><Loader2 size={15} className="animate-spin" /> Değerlendiriliyor...</> : 'Cevabı Gör'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm
              transition-all flex items-center justify-center gap-2"
          >
            {index + 1 < total ? 'Sonraki Soru' : 'Sonuçları Gör'}
            <ChevronRight size={15} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/QuizCard.jsx
git commit -m "feat: add QuizCard component with multiple choice and open-ended support"
```

---

## Task 5: QuizSummary.jsx

**Files:**
- Create: `src/components/quiz/QuizSummary.jsx`

- [ ] **Step 1: Dosyayı oluştur**

```jsx
// src/components/quiz/QuizSummary.jsx
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerConfetti } from '../../utils/confetti';
import { useEffect } from 'react';

export default function QuizSummary({ correct, total, subject, topic, onRetry }) {
  const navigate = useNavigate();
  const pct = Math.round((correct / total) * 100);

  useEffect(() => {
    if (pct >= 80) triggerConfetti();
  }, []);

  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const msg = pct >= 80
    ? 'Harika! Konuya hakimsin 🎉'
    : pct >= 50
    ? 'İyi gidiyorsun, biraz daha pratik yapabilirsin 💪'
    : 'Bu konuyu tekrar çalışmanı öneririm 📚';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Score ring */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-100">{correct}/{total}</span>
          <span className="text-xs text-zinc-500">doğru</span>
        </div>
      </div>

      {/* Trophy */}
      <div className="text-center">
        <Trophy size={28} className="mx-auto mb-2" style={{ color }} />
        <p className="text-lg font-bold text-zinc-100">%{pct} Başarı</p>
        <p className="text-sm text-zinc-400 mt-1 max-w-xs">{msg}</p>
      </div>

      {/* Subject/topic badge */}
      <div className="flex gap-2 flex-wrap justify-center">
        <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">{subject}</span>
        {topic && <span className="px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs text-violet-300">{topic}</span>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} /> Tekrar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <Home size={14} /> Ana Sayfa
        </motion.button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/QuizSummary.jsx
git commit -m "feat: add QuizSummary component with animated score ring and confetti"
```

---

## Task 6: QuizMerkezi.jsx — Ana Sayfa

**Files:**
- Create: `src/pages/QuizMerkezi.jsx`

- [ ] **Step 1: Dosyayı oluştur**

```jsx
// src/pages/QuizMerkezi.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ChevronDown, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateQuizQuestions, parseGeminiError } from '../services/geminiService';
import { fetchPreviousHashes, saveQuestionHashes } from '../services/quizService';
import QuizCard from '../components/quiz/QuizCard';
import QuizSummary from '../components/quiz/QuizSummary';

const SUBJECTS = [
  'TYT Türkçe', 'TYT Matematik', 'TYT Fen Bilimleri', 'TYT Sosyal Bilimler',
  'AYT Matematik', 'AYT Fizik', 'AYT Kimya', 'AYT Biyoloji',
  'AYT Edebiyat', 'AYT Tarih', 'AYT Coğrafya',
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Türk Dili',
];

const PHASE = { SETUP: 'setup', LOADING: 'loading', QUIZ: 'quiz', SUMMARY: 'summary' };

export default function QuizMerkezi() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // boolean[]
  const [error, setError] = useState('');

  async function handleStart() {
    if (!subject || !topic.trim()) return;
    setPhase(PHASE.LOADING);
    setError('');
    try {
      const prevDocs = await fetchPreviousHashes(user.uid);
      const prevHashes = prevDocs.map(d => d.hash);
      const qs = await generateQuizQuestions(subject, topic, prevHashes);
      const limited = qs.slice(0, 5);
      await saveQuestionHashes(user.uid, limited, subject, topic);
      setQuestions(limited);
      setCurrentIdx(0);
      setAnswers([]);
      setPhase(PHASE.QUIZ);
    } catch (err) {
      setError(parseGeminiError(err));
      setPhase(PHASE.SETUP);
    }
  }

  function handleAnswer(correct) {
    setAnswers(prev => [...prev, correct]);
  }

  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      setPhase(PHASE.SUMMARY);
    } else {
      setCurrentIdx(i => i + 1);
    }
  }

  function handleRetry() {
    setPhase(PHASE.SETUP);
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
  }

  const correctCount = answers.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <BrainCircuit size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Soru Merkezi</h1>
            <p className="text-xs text-zinc-500">AI destekli kişiselleştirilmiş sorular</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-violet-600/15 border border-violet-500/25 rounded-full">
            <Sparkles size={11} className="text-violet-400" />
            <span className="text-xs text-violet-400 font-medium">Premium</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* SETUP */}
          {phase === PHASE.SETUP && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {/* Subject dropdown */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Ders Seç</label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-10 text-sm
                      text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
                  >
                    <option value="">Ders seçin...</option>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Topic input */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Konu <span className="text-zinc-600">(serbest yaz)</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Örn: Trigonometri, Osmanlı'nın kuruluşu, Hücre bölünmesi..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200
                    placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-600/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                disabled={!subject || !topic.trim()}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600
                  text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <BrainCircuit size={16} />
                5 Soru Getir
              </motion.button>

              {/* Info card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  💡 Aynı konuya tekrar soru istersen <span className="text-violet-400">farklı sorular</span> üretilir.
                  Hem çoktan seçmeli hem açık uçlu sorular gelebilir.
                </p>
              </div>
            </motion.div>
          )}

          {/* LOADING */}
          {phase === PHASE.LOADING && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Loader2 size={28} className="text-violet-400 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-200">Sorular hazırlanıyor...</p>
                <p className="text-xs text-zinc-500 mt-1">{subject} · {topic}</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-violet-500 rounded-full"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* QUIZ */}
          {phase === PHASE.QUIZ && questions.length > 0 && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnimatePresence mode="wait">
                <QuizCard
                  key={currentIdx}
                  question={questions[currentIdx]}
                  index={currentIdx}
                  total={questions.length}
                  onNext={handleNext}
                  onAnswer={handleAnswer}
                />
              </AnimatePresence>
            </motion.div>
          )}

          {/* SUMMARY */}
          {phase === PHASE.SUMMARY && (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuizSummary
                correct={correctCount}
                total={questions.length}
                subject={subject}
                topic={topic}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: quiz/ klasörünü oluştur**

```bash
mkdir -p src/components/quiz
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/QuizMerkezi.jsx
git commit -m "feat: add QuizMerkezi page with setup/loading/quiz/summary phases"
```

---

## Task 7: App.jsx & DrawerMenu.jsx — Routing & Nav

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/layout/DrawerMenu.jsx`

- [ ] **Step 1: App.jsx'e import ve rota ekle**

Import bölümüne ekle (diğer import'ların yanına):

```js
import QuizMerkezi from './pages/QuizMerkezi';
```

`PAGE_TITLES` objesine ekle:

```js
  '/quiz': 'Soru Merkezi',
```

Routes içine (son Route'dan önce) ekle:

```jsx
<Route path="/quiz" element={<PageTransition><PremiumGate feature="quiz"><QuizMerkezi /></PremiumGate></PageTransition>} />
```

- [ ] **Step 2: DrawerMenu.jsx'e nav item ekle**

`NAV_GROUPS_YKS` içinde `'Akademi'` grubunun `items` dizisine ekle (hata-defteri'nden sonra):

```js
      { to: '/quiz', icon: BrainCircuit, label: 'Soru Merkezi', ai: true, premium: 'quiz' },
```

`NAV_GROUPS_DAILY` içinde `'AI & Sosyal'` grubunun `items` dizisine ekle:

```js
      { to: '/quiz', icon: BrainCircuit, label: 'Soru Merkezi', ai: true, premium: 'quiz' },
```

Import'a `BrainCircuit` ekle:

```js
import {
  X, LayoutDashboard, CalendarDays, GraduationCap, Sparkles, Users2,
  CheckSquare, StickyNote, FolderKanban, Repeat2, Timer,
  BookOpen, CalendarCheck, Target, Zap, BarChart2,
  ListTodo, Video, Bell, Trophy, UserPlus, Star, Moon, Sun,
  ChevronDown, BrainCircuit,
} from 'lucide-react';
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx src/components/layout/DrawerMenu.jsx
git commit -m "feat: add /quiz route and Soru Merkezi nav item"
```

---

## Task 8: Dev server test & final commit

- [ ] **Step 1: Dev server başlat ve test et**

```bash
npm run dev
```

Kontrol listesi:
- `/quiz` sayfası açılıyor mu?
- Premium olmayan kullanıcıda PremiumGate gösteriliyor mu?
- Ders seçip konu yazıp "5 Soru Getir" tıklayınca loading gösteriyor mu?
- Sorular geliyor mu?
- Çoktan seçmeli şık seçilip "Cevabı Gör" çalışıyor mu?
- Açık uçlu cevap yazılıp "Cevabı Gör" AI değerlendirmesi yapıyor mu?
- "Sonraki Soru" ilerliyor mu?
- Özet ekranı score ring animasyonu çalışıyor mu?
- "Tekrar" butonu setup'a dönüyor mu?
- DrawerMenu'de "Soru Merkezi" item görünüyor mu?

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: Quiz Merkezi — AI destekli soru üretimi, premium gate, hash tabanlı tekrar engelleme"
```
