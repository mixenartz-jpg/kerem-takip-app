import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { useAI } from '../../context/AIContext';

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
        isUser ? 'bg-violet-600' : 'bg-zinc-800 border border-zinc-700'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-violet-400" />}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-violet-600 text-white rounded-tr-sm'
          : msg.isError
            ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm'
            : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 rounded-tl-sm'
      }`} style={{ whiteSpace: 'pre-wrap' }}>
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function AIAssistant() {
  const { messages, loading, open, closeAssistant, sendMessage, clearChat } = useAI();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

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

  const quickPrompts = [
    'Bugün ne yapmalıyım?',
    'YKS analizimi yap',
    'Motivasyon ver',
    'Çalışma programı öner',
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAssistant}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col"
            style={{ height: 'min(600px, calc(100vh - 2rem))' }}
            initial={{ opacity: 0, scale: 0.9, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/60"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(12,12,14,0) 60%)' }}
              >
                <motion.div
                  className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center"
                  animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 12px rgba(124,58,237,0.4)', '0 0 0px rgba(124,58,237,0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Sparkles size={15} className="text-violet-400" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-100">GT Asistan</p>
                  <p className="text-[10px] text-zinc-500">Gemini AI · Kişisel koçun</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    className="p-1.5 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 rounded-lg transition-all"
                    title="Sohbeti temizle"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={closeAssistant}
                    className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full gap-4"
                  >
                    <motion.div
                      className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles size={22} className="text-violet-400" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-zinc-300 text-sm font-medium">Merhaba!</p>
                      <p className="text-zinc-600 text-xs mt-1">Sana nasıl yardımcı olabilirim?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {quickPrompts.map(p => (
                        <button
                          key={p}
                          onClick={() => sendMessage(p)}
                          className="text-xs text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-500/30 hover:text-violet-300 rounded-xl px-3 py-2.5 transition-all text-left"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <Bot size={13} className="text-violet-400" />
                    </div>
                    <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
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

              {/* Input */}
              <div className="px-3 pb-3 pt-2 border-t border-zinc-800/60">
                <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-violet-500/50 rounded-xl p-2 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Mesaj yaz..."
                    rows={1}
                    style={{ resize: 'none', minHeight: 32, maxHeight: 96 }}
                    className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none py-1 px-1"
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all shrink-0"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </motion.button>
                </div>
                <p className="text-center text-[10px] text-zinc-700 mt-1.5">Enter ile gönder · Shift+Enter yeni satır</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Floating trigger button ── */
export function AIFloatingButton() {
  const { open, openAssistant, closeAssistant, messages } = useAI();
  const hasMessages = messages.length > 0;

  return (
    <motion.button
      onClick={open ? closeAssistant : openAssistant}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20"
      style={{ background: open ? '#3f3f46' : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={open ? {} : {
        boxShadow: ['0 0 0px rgba(124,58,237,0.3)', '0 0 20px rgba(124,58,237,0.6)', '0 0 0px rgba(124,58,237,0.3)'],
      }}
      transition={{ boxShadow: { duration: 2.5, repeat: Infinity } }}
    >
      <AnimatePresence mode="wait">
        {open
          ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={18} className="text-zinc-300" /></motion.div>
          : <motion.div key="ai" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Sparkles size={18} className="text-white" /></motion.div>
        }
      </AnimatePresence>
      {hasMessages && !open && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-violet-400 border-2 border-zinc-950"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}
    </motion.button>
  );
}
