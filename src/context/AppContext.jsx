import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

export const DEFAULT_STATE = {
  tasks: [],
  events: [],
  notes: [],
  projects: [],
  habits: [],
  pomodoro: {
    sessions: [],
    settings: { work: 25, shortBreak: 5, longBreak: 15 },
  },
  lessons: [],
  exams: [],
  goals: [],
  yks: {
    examDate: null,
    examType: 'tyt_ayt', // 'tyt_only' | 'tyt_ayt'
    targetNets: {
      tyt_turkce: 35, tyt_mat: 35, tyt_fen: 17, tyt_sosyal: 17,
      ayt_mat: 30, ayt_fizik: 12, ayt_kimya: 12, ayt_biyoloji: 12,
    },
    trials: [],
    topics: {},
  },
};

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(DEFAULT_STATE);
  const [dbLoading, setDbLoading] = useState(true);
  const saveTimerRef = useRef(null);

  // ── Firestore sync ──────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setState(DEFAULT_STATE);
      setDbLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setState(prev => ({ ...DEFAULT_STATE, ...snap.data(), yks: { ...DEFAULT_STATE.yks, ...snap.data().yks } }));
      } else {
        // Migration: check localStorage
        const localKey = `gunluk-takip-v1-${user.uid}`;
        const raw = localStorage.getItem(localKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const migrated = { ...DEFAULT_STATE, ...parsed, yks: DEFAULT_STATE.yks };
            setDoc(docRef, migrated);
            setState(migrated);
          } catch {
            setDoc(docRef, DEFAULT_STATE);
          }
        } else {
          setDoc(docRef, DEFAULT_STATE);
        }
      }
      setDbLoading(false);
    }, () => setDbLoading(false));

    return unsub;
  }, [user]);

  const saveToFirestore = useCallback((uid, data) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setDoc(doc(db, 'users', uid), data).catch(console.error);
    }, 800);
  }, []);

  const update = useCallback((key, fn) => {
    setState(prev => {
      const next = { ...prev, [key]: fn(prev[key]) };
      if (user) saveToFirestore(user.uid, next);
      return next;
    });
  }, [user, saveToFirestore]);

  // ── TASKS ──────────────────────────────────────────────
  const addTask = (data) => update('tasks', tasks => [
    ...tasks,
    { id: genId(), completed: false, subtasks: [], tags: [], createdAt: now(), ...data }
  ]);
  const updateTask = (id, data) => update('tasks', tasks =>
    tasks.map(t => t.id === id ? { ...t, ...data } : t)
  );
  const deleteTask = (id) => update('tasks', tasks => tasks.filter(t => t.id !== id));
  const toggleTask = (id) => update('tasks', tasks =>
    tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? now() : null } : t)
  );
  const addSubtask = (taskId, title) => update('tasks', tasks =>
    tasks.map(t => t.id === taskId
      ? { ...t, subtasks: [...(t.subtasks || []), { id: genId(), title, completed: false }] }
      : t)
  );
  const toggleSubtask = (taskId, subtaskId) => update('tasks', tasks =>
    tasks.map(t => t.id === taskId
      ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s) }
      : t)
  );

  // ── EVENTS ─────────────────────────────────────────────
  const addEvent = (data) => update('events', events => [...events, { id: genId(), ...data }]);
  const updateEvent = (id, data) => update('events', events =>
    events.map(e => e.id === id ? { ...e, ...data } : e)
  );
  const deleteEvent = (id) => update('events', events => events.filter(e => e.id !== id));

  // ── NOTES ──────────────────────────────────────────────
  const addNote = (data) => update('notes', notes => [
    { id: genId(), title: '', content: '', tags: [], category: '', pinned: false, createdAt: now(), updatedAt: now(), ...data },
    ...notes,
  ]);
  const updateNote = (id, data) => update('notes', notes =>
    notes.map(n => n.id === id ? { ...n, ...data, updatedAt: now() } : n)
  );
  const deleteNote = (id) => update('notes', notes => notes.filter(n => n.id !== id));
  const togglePin = (id) => update('notes', notes =>
    notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
  );

  // ── PROJECTS ───────────────────────────────────────────
  const addProject = (data) => update('projects', projects => [
    ...projects,
    {
      id: genId(), color: '#8b5cf6', description: '', createdAt: now(),
      columns: [
        { id: genId(), name: 'Yapılacak', cards: [] },
        { id: genId(), name: 'Devam Ediyor', cards: [] },
        { id: genId(), name: 'Tamamlandı', cards: [] },
      ],
      ...data,
    }
  ]);
  const updateProject = (id, data) => update('projects', projects =>
    projects.map(p => p.id === id ? { ...p, ...data } : p)
  );
  const deleteProject = (id) => update('projects', projects => projects.filter(p => p.id !== id));
  const addCard = (projectId, columnId, data) => update('projects', projects =>
    projects.map(p => p.id === projectId
      ? { ...p, columns: p.columns.map(c => c.id === columnId
          ? { ...c, cards: [...c.cards, { id: genId(), priority: 'normal', tags: [], createdAt: now(), ...data }] }
          : c) }
      : p)
  );
  const updateCard = (projectId, columnId, cardId, data) => update('projects', projects =>
    projects.map(p => p.id === projectId
      ? { ...p, columns: p.columns.map(c => c.id === columnId
          ? { ...c, cards: c.cards.map(card => card.id === cardId ? { ...card, ...data } : card) }
          : c) }
      : p)
  );
  const deleteCard = (projectId, columnId, cardId) => update('projects', projects =>
    projects.map(p => p.id === projectId
      ? { ...p, columns: p.columns.map(c => c.id === columnId
          ? { ...c, cards: c.cards.filter(card => card.id !== cardId) }
          : c) }
      : p)
  );
  const moveCard = (projectId, fromColId, toColId, cardId, toIndex) => update('projects', projects =>
    projects.map(p => {
      if (p.id !== projectId) return p;
      const card = p.columns.find(c => c.id === fromColId)?.cards.find(c => c.id === cardId);
      if (!card) return p;
      return {
        ...p, columns: p.columns.map(c => {
          if (c.id === fromColId) return { ...c, cards: c.cards.filter(ca => ca.id !== cardId) };
          if (c.id === toColId) {
            const newCards = [...c.cards];
            newCards.splice(toIndex, 0, card);
            return { ...c, cards: newCards };
          }
          return c;
        })
      };
    })
  );
  const addColumn = (projectId, name) => update('projects', projects =>
    projects.map(p => p.id === projectId
      ? { ...p, columns: [...p.columns, { id: genId(), name, cards: [] }] }
      : p)
  );
  const deleteColumn = (projectId, columnId) => update('projects', projects =>
    projects.map(p => p.id === projectId
      ? { ...p, columns: p.columns.filter(c => c.id !== columnId) }
      : p)
  );

  // ── HABITS ─────────────────────────────────────────────
  const addHabit = (data) => update('habits', habits => [
    ...habits,
    { id: genId(), icon: '⭐', color: '#8b5cf6', frequency: 'daily', completions: [], createdAt: now(), ...data }
  ]);
  const updateHabit = (id, data) => update('habits', habits =>
    habits.map(h => h.id === id ? { ...h, ...data } : h)
  );
  const deleteHabit = (id) => update('habits', habits => habits.filter(h => h.id !== id));
  const toggleHabitToday = (id) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    update('habits', habits =>
      habits.map(h => {
        if (h.id !== id) return h;
        const done = h.completions.includes(today);
        return { ...h, completions: done ? h.completions.filter(d => d !== today) : [...h.completions, today] };
      })
    );
  };

  // ── LESSONS ────────────────────────────────────────────
  const addLesson = (data) => update('lessons', lessons => [
    ...lessons,
    { id: genId(), icon: '📚', color: '#8b5cf6', chapters: [], studyHours: 0, targetHours: 10, createdAt: now(), ...data }
  ]);
  const updateLesson = (id, data) => update('lessons', lessons =>
    lessons.map(l => l.id === id ? { ...l, ...data } : l)
  );
  const deleteLesson = (id) => update('lessons', lessons => lessons.filter(l => l.id !== id));
  const toggleChapter = (lessonId, chapterId) => update('lessons', lessons =>
    lessons.map(l => l.id === lessonId
      ? { ...l, chapters: l.chapters.map(c => c.id === chapterId ? { ...c, completed: !c.completed } : c) }
      : l)
  );

  // ── EXAMS ──────────────────────────────────────────────
  const addExam = (data) => update('exams', exams => [
    ...exams,
    { id: genId(), preparationStatus: 'başlamadı', notes: '', location: '', createdAt: now(), ...data }
  ]);
  const updateExam = (id, data) => update('exams', exams =>
    exams.map(e => e.id === id ? { ...e, ...data } : e)
  );
  const deleteExam = (id) => update('exams', exams => exams.filter(e => e.id !== id));

  // ── GOALS ──────────────────────────────────────────────
  const addGoal = (data) => update('goals', goals => [
    ...goals,
    { id: genId(), category: 'kısa', milestones: [], completed: false, createdAt: now(), ...data }
  ]);
  const updateGoal = (id, data) => update('goals', goals =>
    goals.map(g => g.id === id ? { ...g, ...data } : g)
  );
  const deleteGoal = (id) => update('goals', goals => goals.filter(g => g.id !== id));
  const toggleMilestone = (goalId, milestoneId) => update('goals', goals =>
    goals.map(g => g.id === goalId
      ? { ...g, milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m) }
      : g)
  );

  // ── POMODORO ───────────────────────────────────────────
  const addPomodoroSession = (data) => update('pomodoro', pom => ({
    ...pom,
    sessions: [...pom.sessions, { id: genId(), date: format(new Date(), 'yyyy-MM-dd'), ...data }]
  }));
  const updatePomodoroSettings = (settings) => update('pomodoro', pom => ({
    ...pom, settings: { ...pom.settings, ...settings }
  }));

  // ── YKS ────────────────────────────────────────────────
  const updateYKS = (data) => update('yks', yks => ({ ...yks, ...data }));

  const addYKSTrial = (trial) => update('yks', yks => ({
    ...yks,
    trials: [...(yks.trials || []), { id: genId(), date: format(new Date(), 'yyyy-MM-dd'), createdAt: now(), ...trial }]
  }));

  const updateYKSTrial = (id, data) => update('yks', yks => ({
    ...yks,
    trials: yks.trials.map(t => t.id === id ? { ...t, ...data } : t)
  }));

  const deleteYKSTrial = (id) => update('yks', yks => ({
    ...yks,
    trials: yks.trials.filter(t => t.id !== id)
  }));

  const toggleYKSTopic = (subject, topicId) => update('yks', yks => {
    const subjectTopics = yks.topics?.[subject] || [];
    const done = subjectTopics.includes(topicId);
    return {
      ...yks,
      topics: {
        ...yks.topics,
        [subject]: done
          ? subjectTopics.filter(id => id !== topicId)
          : [...subjectTopics, topicId]
      }
    };
  });

  const setYKSExamDate = (date) => update('yks', yks => ({ ...yks, examDate: date }));
  const setYKSTargetNet = (key, value) => update('yks', yks => ({
    ...yks,
    targetNets: { ...yks.targetNets, [key]: value }
  }));

  const value = {
    state,
    dbLoading,
    tasks: state.tasks,
    events: state.events,
    notes: state.notes,
    projects: state.projects,
    habits: state.habits,
    pomodoro: state.pomodoro,
    lessons: state.lessons,
    exams: state.exams,
    goals: state.goals,
    yks: state.yks,
    // Task actions
    addTask, updateTask, deleteTask, toggleTask, addSubtask, toggleSubtask,
    // Event actions
    addEvent, updateEvent, deleteEvent,
    // Note actions
    addNote, updateNote, deleteNote, togglePin,
    // Project actions
    addProject, updateProject, deleteProject, addCard, updateCard, deleteCard, moveCard, addColumn, deleteColumn,
    // Habit actions
    addHabit, updateHabit, deleteHabit, toggleHabitToday,
    // Pomodoro actions
    addPomodoroSession, updatePomodoroSettings,
    // Lesson actions
    addLesson, updateLesson, deleteLesson, toggleChapter,
    // Exam actions
    addExam, updateExam, deleteExam,
    // Goal actions
    addGoal, updateGoal, deleteGoal, toggleMilestone,
    // YKS actions
    updateYKS, addYKSTrial, updateYKSTrial, deleteYKSTrial,
    toggleYKSTopic, setYKSExamDate, setYKSTargetNet,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
