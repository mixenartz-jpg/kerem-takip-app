import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User, Loader2, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { usePlannerAI } from '../context/PlannerAIContext';
import MarkdownMessage from '../components/ai/MarkdownMessage';
import PlannerBackground from '../components/ai/PlannerBackground';

const QUICK_CHIPS = [
  'Haftalık plan yap',
  'Bugün için 3 görev öner',
  'YKS haftalık program',
  'Sadece odak bloğu',
];

function AppliedBanner({ counts, navigatePath }) {
  const navigate = useNavigate();
  const parts = [];
  if (counts.tasks > 0) parts.push(`${counts.tasks} görev`);
  if (counts.habits > 0) parts.push(`${counts.habits} alışkanlık`);
  if (counts.goals > 0) parts.push(`${counts.goals} hedef`);
  if (counts.dailyTodos > 0) parts.push(`${counts.dailyTodos} yapılacak`);
  if (counts.weeklyPlans > 0) parts.push(`${counts.weeklyPlans} haftalık plan`);
  if (counts.events > 0) parts.push(`${counts.events} etkinlik`);
  if (parts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-center gap-2 bg-violet-600/15 border border-violet-500/25 rounded-xl px-3 py-2 text-sm"
    >
      <CheckCircle2 size={14} className="text-violet-400 shrink-0" />
      <span className="text-violet-300 flex-1">{parts.join(', ')} eklendi</span>
      {navigatePath && (
        <button
          onClick={() => navigate(navigatePath)}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-200 transition-colors shrink-0"
        >
          <ArrowRight size={11} />
          Git
        </button>
      )}
    </motion.div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isUser ? 'bg-violet-600' : 'bg-zinc-800 border border-zinc-700'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-violet-400" />}
      </div>
      <div className="max-w-[76%] flex flex-col gap-2">
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-violet-600 text-white rounded-tr-sm'
            : msg.isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm'
              : 'bg-zinc-900/80 border border-zinc-800/60 text-zinc-200 rounded-tl-sm'
        }`}>
          {isUser || msg.isError
            ? <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            : <MarkdownMessage content={msg.content} />
          }
        </div>
        {msg.appliedCounts && (
          <AnimatePresence>
            <AppliedBanner counts={msg.appliedCounts} navigatePath={msg.navigatePath} />
          </AnimatePresence>
        )}
        {msg.navigatePath && !msg.appliedCounts && (
          <button
            onClick={() => navigate(msg.navigatePath)}
            className="flex items-center gap-1.5 self-start text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg px-2.5 py-1 transition-all"
          >
            <ArrowRight size={11} />
            Sayfaya Git
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AIPlanner() {
  const { messages, loading, sendMessage, clearChat } = usePlannerAI();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const todayLabel = format(new Date(), "d MMMM EEEE", { locale: tr });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden flex flex-col">
      <PlannerBackground />

      <div className="relative z-10 flex flex-col h-full">
        {/* Hero header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-100"
          >
            Bugün ne{' '}
            <span className="text-violet-400">yapacaksın?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-500 text-sm mt-2"
          >
            {todayLabel} · Planını yaz, gerisini ben hallederim
          </motion.p>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 max-w-3xl w-full mx-auto flex flex-col gap-4 py-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center py-12 gap-5"
            >
              <motion.div
                className="w-20 h-20 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles size={34} className="text-violet-400" />
              </motion.div>
              <p className="text-zinc-500 text-sm text-center max-w-xs">
                "Yarın 2 saat matematik, 1 saat fizik, spor ve 20dk kitap okuma" gibi doğal dille yaz
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-sm text-zinc-400 bg-zinc-900/80 hover:bg-violet-600/15 border border-zinc-800 hover:border-violet-500/40 hover:text-violet-300 rounded-xl px-4 py-2 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-violet-400" />
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl rounded-tl-sm px-4 py-3">
                <motion.div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 md:px-6 pb-4 pt-2 max-w-3xl w-full mx-auto">
          {messages.length > 0 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <Trash2 size={11} />
                Sohbeti temizle
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 focus-within:border-violet-500/50 rounded-2xl p-3 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Planını yaz... (örn: yarın 2 saat mat çalışacağım)"
              rows={1}
              style={{ resize: 'none', minHeight: 36, maxHeight: 120 }}
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none py-1 px-1"
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all shrink-0"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-zinc-700 mt-1.5">Enter ile gönder · Shift+Enter yeni satır</p>
        </div>
      </div>
    </div>
  );
}
