import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { createChatSession, sendChatMessage, buildAppContext } from '../services/geminiService';
import { useApp } from './AppContext';
import { format } from 'date-fns';

const AIContext = createContext(null);

const TOPIC_KEYWORDS = ['anlat', 'öğret', 'nedir', 'nasıl çalışır', 'açıkla', 'ne demek', 'hakkında bilgi', 'konusunu anlat'];

function extractTopic(text) {
  const lower = text.toLowerCase();
  // Try to extract noun phrase after keyword
  for (const kw of TOPIC_KEYWORDS) {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      const before = text.slice(0, idx).trim().split(' ').slice(-3).join(' ');
      if (before.length > 2) return before;
    }
  }
  return text.slice(0, 40);
}

function parseNavigate(content) {
  const match = content.match(/\[NAVIGATE:(\/[^\]]+)\]/);
  const cleanContent = content.replace(/\[NAVIGATE:\/[^\]]+\]/g, '').trim();
  return { navigatePath: match ? match[1] : null, cleanContent };
}

export function AIProvider({ children }) {
  const { state } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [detectedTopic, setDetectedTopic] = useState(null);
  const chatRef = useRef(null);
  const stateHashRef = useRef('');

  // Compute a lightweight hash of key state to detect significant changes
  const stateHash = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const pendingCount = (state.tasks || []).filter(t => !t.completed).length;
    const todayHabits = (state.habits || []).filter(h => (h.completions || []).includes(today)).length;
    const trialCount = (state.yks?.trials || []).length;
    return `${pendingCount}-${todayHabits}-${trialCount}`;
  }, [state]);

  const getOrCreateChat = useCallback(() => {
    // Reset session if state changed significantly (but keep messages for UX)
    if (!chatRef.current || stateHashRef.current !== stateHash) {
      stateHashRef.current = stateHash;
      const systemCtx = buildAppContext(state);
      chatRef.current = createChatSession([
        { role: 'user', content: systemCtx },
        {
          role: 'model',
          content: 'Merhaba! Günlük Takip asistanınım. Görevler, alışkanlıklar, YKS hazırlığı veya çalışma programı hakkında yardımcı olabilirim. Ne öğrenmek istersiniz?',
        },
      ]);
    }
    return chatRef.current;
  }, [state, stateHash]);

  // Dynamic quick prompts based on current state
  const quickPrompts = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const prompts = ['Bugün ne yapmalıyım?', 'Motivasyon ver'];
    const daysToYKS = state.yks?.examDate
      ? Math.ceil((new Date(state.yks.examDate) - new Date()) / 86400000)
      : null;
    const pendingTasks = (state.tasks || []).filter(t => !t.completed).length;
    const noHabitToday = (state.habits || []).some(h => !(h.completions || []).includes(today));

    if (daysToYKS !== null && daysToYKS < 30) {
      prompts.unshift('YKS son hazırlık önerisi');
    } else {
      prompts.push('YKS analizimi yap');
    }
    if (pendingTasks > 5) {
      prompts.splice(1, 0, 'Görev listemi düzenle');
    }
    if (noHabitToday) {
      prompts.splice(2, 0, 'Bugün hangi alışkanlıkları yapmalıyım?');
    }
    if (!noHabitToday && pendingTasks <= 5) {
      prompts.push('Çalışma programı öner');
    }
    return prompts.slice(0, 4);
  }, [state]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    // Detect topic explanation intent
    const lower = text.toLowerCase();
    const isTopicQuestion = TOPIC_KEYWORDS.some(kw => lower.includes(kw));
    if (isTopicQuestion) {
      setDetectedTopic(extractTopic(text));
    } else {
      setDetectedTopic(null);
    }

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const chat = getOrCreateChat();
      const rawResponse = await sendChatMessage(chat, text);
      const { navigatePath, cleanContent } = parseNavigate(rawResponse);
      setMessages(prev => [...prev, {
        role: 'model',
        content: cleanContent,
        id: Date.now() + 1,
        navigatePath,
      }]);
    } catch (err) {
      const msg = err.message?.includes('API key') || err.message?.includes('key')
        ? 'API key ayarlanmamış. .env.local dosyasına VITE_GEMINI_API_KEY ekleyin.'
        : 'Mesaj gönderilemedi. Lütfen tekrar deneyin.';
      setError(msg);
      setMessages(prev => [...prev, { role: 'model', content: `❌ ${msg}`, id: Date.now() + 1, isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [loading, getOrCreateChat]);

  const clearChat = useCallback(() => {
    chatRef.current = null;
    setMessages([]);
    setError('');
    setDetectedTopic(null);
  }, []);

  const refreshContext = useCallback(() => {
    stateHashRef.current = '';
    chatRef.current = null;
  }, []);

  const openAssistant = () => setOpen(true);
  const closeAssistant = () => setOpen(false);

  return (
    <AIContext.Provider value={{
      messages, loading, open, error, detectedTopic, quickPrompts,
      sendMessage, clearChat, refreshContext, openAssistant, closeAssistant,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
};
