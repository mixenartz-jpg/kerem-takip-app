import { useState } from 'react';
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
  const [answers, setAnswers] = useState([]);
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
                  Konu <span className="text-zinc-600">(serbest yaz veya seç)</span>
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
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600/10 border border-red-500/20 rounded-xl"
                >
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
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

              {/* Info */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  💡 Aynı konuya tekrar soru istersen <span className="text-violet-400">farklı sorular</span> üretilir.
                  Hem çoktan seçmeli hem açık uçlu sorular gelebilir — AI cevabını değerlendirir.
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
              className="flex flex-col items-center gap-5 py-20"
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
