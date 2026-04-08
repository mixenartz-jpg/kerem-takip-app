import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createChatSession, sendChatMessage, buildAppContext } from '../services/geminiService';
import { useApp } from './AppContext';

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const { state } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const chatRef = useRef(null);

  const getOrCreateChat = useCallback(() => {
    if (!chatRef.current) {
      const systemCtx = buildAppContext(state);
      chatRef.current = createChatSession([
        {
          role: 'user',
          content: systemCtx,
        },
        {
          role: 'model',
          content: 'Merhaba! Günlük Takip asistanınım. Görevler, alışkanlıklar, YKS hazırlığı veya çalışma programı hakkında yardımcı olabilirim. Ne öğrenmek istersiniz?',
        },
      ]);
    }
    return chatRef.current;
  }, [state]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const chat = getOrCreateChat();
      const response = await sendChatMessage(chat, text);
      setMessages(prev => [...prev, { role: 'model', content: response, id: Date.now() + 1 }]);
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
  }, []);

  const openAssistant = () => setOpen(true);
  const closeAssistant = () => setOpen(false);

  return (
    <AIContext.Provider value={{ messages, loading, open, error, sendMessage, clearChat, openAssistant, closeAssistant }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
};
