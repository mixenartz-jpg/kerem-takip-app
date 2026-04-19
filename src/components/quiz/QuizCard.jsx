import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { evaluateOpenAnswer, parseGeminiError } from '../../services/geminiService';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizCard({ question, index, total, onNext, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [openText, setOpenText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
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
            animate={{ width: `${(index / total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-zinc-500 tabular-nums shrink-0">{index + 1} / {total}</span>
      </div>

      {/* Question */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
        <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">
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
                  ${isCorrect
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                    : isWrong
                    ? 'bg-red-600/20 border-red-500/50 text-red-300'
                    : isSelected
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border
                  ${isCorrect
                    ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                    : isWrong
                    ? 'bg-red-500/30 border-red-500/50 text-red-300'
                    : isSelected
                    ? 'bg-violet-500/30 border-violet-500/50 text-violet-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                  {label}
                </span>
                <span className="flex-1">{text}</span>
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
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200
              placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none min-h-[100px]
              transition-colors disabled:opacity-60"
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
        <p className="text-xs text-red-400 mb-4 bg-red-600/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {/* Action button */}
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
            {evaluating
              ? <><Loader2 size={15} className="animate-spin" /> Değerlendiriliyor...</>
              : 'Cevabı Gör'}
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
