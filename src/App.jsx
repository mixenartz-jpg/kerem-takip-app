import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MailCheck, RefreshCw } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import AIAssistant, { AIFloatingButton } from './components/ai/AIAssistant';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import CommandPalette from './components/layout/CommandPalette';
import PageTransition from './components/layout/PageTransition';
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
import YKS from './pages/YKS';
import AIMerkezi from './pages/AIMerkezi';

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
  '/yks': 'YKS Merkezi',
  '/goals': 'Hedefler',
  '/ai': 'AI Merkezi',
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
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/tasks" element={<PageTransition><Tasks /></PageTransition>} />
              <Route path="/calendar" element={<PageTransition><Calendar /></PageTransition>} />
              <Route path="/notes" element={<PageTransition><Notes /></PageTransition>} />
              <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
              <Route path="/habits" element={<PageTransition><Habits /></PageTransition>} />
              <Route path="/pomodoro" element={<PageTransition><Pomodoro /></PageTransition>} />
              <Route path="/stats" element={<PageTransition><Stats /></PageTransition>} />
              <Route path="/lessons" element={<PageTransition><Lessons /></PageTransition>} />
              <Route path="/exams" element={<PageTransition><Exams /></PageTransition>} />
              <Route path="/yks" element={<PageTransition><YKS /></PageTransition>} />
              <Route path="/goals" element={<PageTransition><Goals /></PageTransition>} />
              <Route path="/ai" element={<PageTransition><AIMerkezi /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <AIAssistant />
      <AIFloatingButton />
    </div>
  );
}

/* ── Email verification screen (shown when user signed up with email but hasn't verified) ── */
function VerifyGate() {
  const { user, logout, resendVerification, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const [resentLoading, setResentLoading] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await refreshUser();
    setTimeout(() => setChecking(false), 1500);
  };

  const handleResend = async () => {
    setResentLoading(true);
    try {
      await resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch { /* ignore */ }
    finally { setResentLoading(false); }
  };

  return (
    <motion.div
      key="verify"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-sm bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MailCheck size={28} className="text-violet-400" />
          </motion.div>
          <h2 className="text-lg font-bold text-zinc-100">E-postanı Doğrula</h2>
          <p className="text-zinc-500 text-xs text-center mt-2 leading-relaxed">
            <span className="text-violet-400">{user?.email}</span> adresine doğrulama maili gönderdik. Linke tıkladıktan sonra devam et.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <motion.button
            onClick={handleCheck}
            disabled={checking}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-semibold rounded-xl py-3 text-sm transition-all"
          >
            {checking
              ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              : <><RefreshCw size={15} /> Doğruladım, devam et</>}
          </motion.button>
          <button onClick={handleResend} disabled={resentLoading || resent} className="w-full py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            {resent ? '✓ Mail tekrar gönderildi!' : resentLoading ? 'Gönderiliyor...' : 'Maili tekrar gönder'}
          </button>
          <button onClick={logout} className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Farklı hesapla giriş yap
          </button>
        </div>
      </motion.div>
    </motion.div>
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
    // Google users are always verified; email users must verify
    if (!user.emailVerified) {
      setPhase('verify');
      return;
    }
    const key = `gt-onboarded-${user.uid}`;
    setPhase(localStorage.getItem(key) ? 'app' : 'onboarding');
  }, [user, loading, user?.emailVerified]);

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
      {phase === 'verify' && <VerifyGate key="verify" />}
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
            <AIProvider>
              <AppLayout />
            </AIProvider>
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
