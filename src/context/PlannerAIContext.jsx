import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createChatSession, sendPlannerMessage, buildPlannerContext } from '../services/geminiService';
import { useApp } from './AppContext';
import { parseActions } from '../utils/aiActionParser';
import { format } from 'date-fns';

const PlannerAIContext = createContext(null);

export function PlannerAIProvider({ children }) {
  const {
    state,
    addTask, addHabit, addGoal, addEvent,
    addDailyTodo, addWeeklyPlan,
  } = useApp();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatRef = useRef(null);

  const getOrCreateChat = useCallback(() => {
    if (!chatRef.current) {
      const systemCtx = buildPlannerContext(state);
      chatRef.current = createChatSession([
        { role: 'user', content: systemCtx },
        {
          role: 'model',
          content: 'Merhaba! Bugün ne yapmak istiyorsun? Planını yaz, ben görevlere, alışkanlıklara ve takvime ekleyeyim.',
        },
      ]);
    }
    return chatRef.current;
  }, [state]);

  const applyActions = useCallback((actions) => {
    if (!actions) return { tasks: 0, habits: 0, goals: 0, dailyTodos: 0, weeklyPlans: 0, events: 0 };
    const counts = { tasks: 0, habits: 0, goals: 0, dailyTodos: 0, weeklyPlans: 0, events: 0 };
    const today = format(new Date(), 'yyyy-MM-dd');

    (actions.tasks || []).forEach(t => { addTask({ title: t.title, priority: t.priority || 'medium', due: t.due || today }); counts.tasks++; });
    (actions.habits || []).forEach(h => { addHabit({ name: h.name, icon: h.icon || '⭐', color: h.color || '#7c3aed', frequency: h.frequency || 'daily' }); counts.habits++; });
    (actions.goals || []).forEach(g => { addGoal({ title: g.title, category: g.category || 'genel' }); counts.goals++; });
    (actions.dailyTodos || []).forEach(d => { addDailyTodo(d.text, d.date || today); counts.dailyTodos++; });
    (actions.weeklyPlans || []).forEach(w => { addWeeklyPlan(w.text, w.weekStr || ''); counts.weeklyPlans++; });
    (actions.events || []).forEach(e => { addEvent({ title: e.title, date: e.date || today, time: e.time || '' }); counts.events++; });

    return counts;
  }, [addTask, addHabit, addGoal, addEvent, addDailyTodo, addWeeklyPlan]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const chat = getOrCreateChat();
      const rawResponse = await sendPlannerMessage(chat, text);
      const { actions, cleanContent, parseError } = parseActions(rawResponse);

      let appliedCounts = null;
      let navigatePath = null;

      if (actions) {
        appliedCounts = applyActions(actions);
        navigatePath = actions.navigate || null;
      }

      setMessages(prev => [...prev, {
        role: 'model',
        content: cleanContent || rawResponse,
        id: Date.now() + 1,
        appliedCounts,
        navigatePath,
        parseError: parseError || false,
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
  }, [loading, getOrCreateChat, applyActions]);

  const clearChat = useCallback(() => {
    chatRef.current = null;
    setMessages([]);
    setError('');
  }, []);

  return (
    <PlannerAIContext.Provider value={{ messages, loading, error, sendMessage, clearChat }}>
      {children}
    </PlannerAIContext.Provider>
  );
}

export const usePlannerAI = () => {
  const ctx = useContext(PlannerAIContext);
  if (!ctx) throw new Error('usePlannerAI must be used within PlannerAIProvider');
  return ctx;
};
