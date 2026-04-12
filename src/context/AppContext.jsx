import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
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
    examType: 'tyt_ayt',
    targetNets: {
      tyt_turkce: 35, tyt_mat: 35, tyt_fen: 17, tyt_sosyal: 17,
      ayt_mat: 30, ayt_fizik: 12, ayt_kimya: 12, ayt_biyoloji: 12,
    },
    trials: [],
    topics: {},
    targetDept: '',
    targetUni: '',
  },
  hataDefteriItems: [],
  aiPlanCache: null,
  aiStreak: { count: 0, lastDate: null },
  badges: [],
  userMode: null, // 'yks' | 'daily' | null
  // New fields
  dailyTodos: [],  // { id, text, completed, date }
  reminders: [],   // { id, title, datetime, type, pageRef, recurring }
  friends: [],     // { id, uid, displayName, status }
  profile: {
    dailyStudyHours: 6,
    studyDays: [1, 2, 3, 4, 5],
    wakeUpTime: '07:00',
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
        const data = snap.data();
        // Ensure email/displayName are current
        const updates = {};
        if (user.email && data.email !== user.email) updates.email = user.email;
        if (user.displayName && data.displayName !== user.displayName) updates.displayName = user.displayName;
        if (Object.keys(updates).length > 0) {
          setDoc(docRef, updates, { merge: true }).catch(() => {});
        }
        setState(() => ({
          ...DEFAULT_STATE,
          ...data,
          yks: { ...DEFAULT_STATE.yks, ...data.yks },
          profile: { ...DEFAULT_STATE.profile, ...data.profile },
        }));
      } else {
        // Migration: check localStorage
        const localKey = `gunluk-takip-v1-${user.uid}`;
        const raw = localStorage.getItem(localKey);
        const baseData = {
          ...DEFAULT_STATE,
          email: user.email || '',
          displayName: user.displayName || '',
        };
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const migrated = { ...baseData, ...parsed, yks: DEFAULT_STATE.yks };
            setDoc(docRef, migrated);
            setState(migrated);
          } catch {
            setDoc(docRef, baseData);
          }
        } else {
          setDoc(docRef, baseData);
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

  const calcTrialNet = (trial) => {
    const tyt = (trial.tyt?.turkce || 0) + (trial.tyt?.mat || 0) + (trial.tyt?.fen || 0) + (trial.tyt?.sosyal || 0);
    const ayt = (trial.ayt?.mat || 0) + (trial.ayt?.fizik || 0) + (trial.ayt?.kimya || 0) + (trial.ayt?.biyoloji || 0) +
      (trial.ayt?.edebiyat || 0) + (trial.ayt?.tarih1 || 0) + (trial.ayt?.cografya1 || 0);
    return { tytNet: tyt, aytNet: ayt };
  };

  const publishUserScore = (yksState, displayName) => {
    if (!user) return;
    const trials = yksState.trials || [];
    if (trials.length === 0) return;
    const last = trials[trials.length - 1];
    const prev = trials.length > 1 ? trials[trials.length - 2] : null;
    const { tytNet, aytNet } = calcTrialNet(last);
    const { tytNet: prevTyt, aytNet: prevAyt } = prev ? calcTrialNet(prev) : { tytNet: 0, aytNet: 0 };
    setDoc(doc(db, 'userScores', user.uid), {
      displayName: displayName || user.displayName || 'Anonim',
      tytNet, aytNet,
      previousTytNet: prevTyt,
      previousAytNet: prevAyt,
      updatedAt: now(),
    }, { merge: true }).catch(console.error);
  };

  const addYKSTrial = (trial) => {
    let newYks;
    update('yks', yks => {
      newYks = { ...yks, trials: [...(yks.trials || []), { id: genId(), date: format(new Date(), 'yyyy-MM-dd'), createdAt: now(), ...trial }] };
      return newYks;
    });
    setTimeout(() => {
      if (newYks) publishUserScore(newYks, user?.displayName);
    }, 900);
  };

  const updateYKSTrial = (id, data) => {
    let newYks;
    update('yks', yks => {
      newYks = { ...yks, trials: yks.trials.map(t => t.id === id ? { ...t, ...data } : t) };
      return newYks;
    });
    setTimeout(() => {
      if (newYks) publishUserScore(newYks, user?.displayName);
    }, 900);
  };

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

  // ── HATA DEFTERİ ───────────────────────────────────────
  const addHataDefteri = (data) => update('hataDefteriItems', items => [
    ...items,
    {
      id: genId(),
      subject: '', topic: '', question: '', myAnswer: '', correctAnswer: '',
      interval: 1, repetitions: 0, easeFactor: 2.5,
      nextReview: format(new Date(), 'yyyy-MM-dd'),
      lastReviewedAt: null, createdAt: now(),
      ...data,
    }
  ]);
  const updateHataDefteri = (id, data) => update('hataDefteriItems', items =>
    items.map(i => i.id === id ? { ...i, ...data } : i)
  );
  const deleteHataDefteri = (id) => {
    localStorage.removeItem(`hataDefteriPhoto_${id}`);
    update('hataDefteriItems', items => items.filter(i => i.id !== id));
  };
  const reviewHataDefteri = (id, quality) => update('hataDefteriItems', items =>
    items.map(i => {
      if (i.id !== id) return i;
      let { repetitions, interval, easeFactor } = i;
      if (quality >= 3) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        repetitions += 1;
        easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      } else {
        repetitions = 0;
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
      }
      const nextReview = format(
        new Date(Date.now() + interval * 86400000), 'yyyy-MM-dd'
      );
      return { ...i, repetitions, interval, easeFactor, nextReview, lastReviewedAt: now() };
    })
  );

  // ── AI PLAN CACHE ──────────────────────────────────────
  const setAIPlanCache = (data) => update('aiPlanCache', () => data);
  const toggleAIPlanBlock = (blockId) => {
    setState(prev => {
      const cache = prev.aiPlanCache;
      if (!cache) return prev;
      const completed = cache.completedBlockIds || [];
      const newCompleted = completed.includes(blockId)
        ? completed.filter(id => id !== blockId)
        : [...completed, blockId];
      const totalBlocks = cache.plan?.blocks?.length || 1;
      const completionRate = newCompleted.length / totalBlocks;
      const today = format(new Date(), 'yyyy-MM-dd');
      let streak = prev.aiStreak || { count: 0, lastDate: null };
      let badges = prev.badges || [];
      if (completionRate >= 0.6 && streak.lastDate !== today) {
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
        streak = { count: newCount, lastDate: today };
        if (newCount === 3 && !badges.includes('streak_3')) badges = [...badges, 'streak_3'];
        if (newCount === 7 && !badges.includes('streak_7')) badges = [...badges, 'streak_7'];
        if (newCount === 30 && !badges.includes('streak_30')) badges = [...badges, 'streak_30'];
      }
      const next = {
        ...prev,
        aiPlanCache: { ...cache, completedBlockIds: newCompleted },
        aiStreak: streak,
        badges,
      };
      if (user) saveToFirestore(user.uid, next);
      return next;
    });
  };

  // ── BADGES ─────────────────────────────────────────────
  const addBadge = (badgeId) => update('badges', badges =>
    badges.includes(badgeId) ? badges : [...badges, badgeId]
  );

  // ── DAILY TODOS ────────────────────────────────────────
  const addDailyTodo = (text, date) => update('dailyTodos', todos => [
    ...todos,
    { id: genId(), text, completed: false, date: date || format(new Date(), 'yyyy-MM-dd'), createdAt: now() }
  ]);
  const toggleDailyTodo = (id) => update('dailyTodos', todos =>
    todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  );
  const deleteDailyTodo = (id) => update('dailyTodos', todos => todos.filter(t => t.id !== id));

  // ── REMINDERS ──────────────────────────────────────────
  const addReminder = (data) => update('reminders', reminders => [
    ...reminders,
    { id: genId(), title: '', datetime: '', type: 'once', pageRef: '', recurring: false, createdAt: now(), ...data }
  ]);
  const updateReminder = (id, data) => update('reminders', reminders =>
    reminders.map(r => r.id === id ? { ...r, ...data } : r)
  );
  const deleteReminder = (id) => update('reminders', reminders => reminders.filter(r => r.id !== id));

  // ── FRIENDS ────────────────────────────────────────────
  const addFriend = (data) => update('friends', friends => {
    // Aynı uid'li arkadaş zaten varsa ekleme
    if (friends.some(f => f.uid === data.uid)) return friends;
    return [...friends, { id: genId(), uid: '', displayName: '', status: 'accepted', ...data }];
  });
  // uid veya id ile silebilmek için her ikisini de kontrol et
  const removeFriend = (uidOrId) => update('friends', friends =>
    friends.filter(f => f.uid !== uidOrId && f.id !== uidOrId)
  );
  const updateFriendStatus = (id, status) => update('friends', friends =>
    friends.map(f => f.id === id ? { ...f, status } : f)
  );

  // ── PROFILE ────────────────────────────────────────────
  const updateProfile = (data) => update('profile', profile => ({ ...profile, ...data }));

  // ── USER MODE ──────────────────────────────────────────
  const updateUserMode = useCallback(async (mode) => {
    setState(prev => ({ ...prev, userMode: mode }));
    if (user) localStorage.setItem(`gt-mode-${user.uid}`, mode);
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      try {
        await setDoc(docRef, { userMode: mode }, { merge: true });
      } catch (err) {
        console.error('updateUserMode Firestore error:', err);
      }
    }
  }, [user]);

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
    hataDefteriItems: state.hataDefteriItems,
    aiPlanCache: state.aiPlanCache,
    aiStreak: state.aiStreak,
    badges: state.badges,
    dailyTodos: state.dailyTodos,
    reminders: state.reminders,
    friends: state.friends,
    profile: state.profile,
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
    // Hata defteri actions
    addHataDefteri, updateHataDefteri, deleteHataDefteri, reviewHataDefteri,
    // AI plan actions
    setAIPlanCache, toggleAIPlanBlock, addBadge,
    // User mode
    updateUserMode,
    userMode: state.userMode,
    // Daily todos
    addDailyTodo, toggleDailyTodo, deleteDailyTodo,
    // Reminders
    addReminder, updateReminder, deleteReminder,
    // Friends
    addFriend, removeFriend, updateFriendStatus,
    // Profile
    updateProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
