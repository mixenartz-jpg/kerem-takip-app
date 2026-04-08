import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import CommandPalette from './components/layout/CommandPalette';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Projects from './pages/Projects';
import Habits from './pages/Habits';
import Pomodoro from './pages/Pomodoro';
import Stats from './pages/Stats';
import Lessons from './pages/Lessons';
import Exams from './pages/Exams';
import Goals from './pages/Goals';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/tasks': 'Görevler',
  '/calendar': 'Takvim',
  '/notes': 'Notlar',
  '/projects': 'Projeler',
  '/habits': 'Alışkanlıklar',
  '/pomodoro': 'Pomodoro',
  '/stats': 'İstatistikler',
  '/lessons': 'Dersler',
  '/exams': 'Sınav Takvimi',
  '/goals': 'Hedefler',
};

function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Günlük Takip';

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onSearchOpen={() => setCmdOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/goals" element={<Goals />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

/* ── Auth-aware inner app ── */
function AuthGate() {
  const { user, loading } = useAuth();
  const [phase, setPhase] = useState(null); // null = checking

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPhase('login');
      return;
    }
    const key = `gt-onboarded-${user.uid}`;
    setPhase(localStorage.getItem(key) ? 'app' : 'onboarding');
  }, [user, loading]);

  const handleOnboardingDone = () => {
    localStorage.setItem(`gt-onboarded-${user.uid}`, '1');
    setPhase('app');
  };

  if (loading || phase === null) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'login' && <LoginPage key="login" />}
      {phase === 'onboarding' && (
        <OnboardingScreen key="onboarding" onFinish={handleOnboardingDone} />
      )}
      {phase === 'app' && (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(
    () => !!localStorage.getItem('gt-splash-shown')
  );

  const handleSplashDone = () => {
    localStorage.setItem('gt-splash-shown', '1');
    setSplashDone(true);
  };

  return (
    <AuthProvider>
      <AppProvider>
        <AnimatePresence mode="wait">
          {!splashDone && <SplashScreen key="splash" onFinish={handleSplashDone} />}
        </AnimatePresence>
        {splashDone && <AuthGate />}
      </AppProvider>
    </AuthProvider>
  );
}
