import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Globe2, ArrowRight, Sparkles, MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Orb({ cx, cy, r, color, delay = 0 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: cx, top: cy, width: r * 2, height: r * 2, background: color, translateX: '-50%', translateY: '-50%' }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function TiltCard({ children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [8, -8]);
  const rotateY = useTransform(x, [-150, 150], [-8, 8]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange, right }) {
  return (
    <div className="relative group">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-900/80 border border-zinc-700/60 group-focus-within:border-violet-500/60 text-zinc-100 placeholder-zinc-600 rounded-xl px-10 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/20"
      />
      {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

function GoogleBtn({ onClick, disabled }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 hover:border-zinc-600 text-zinc-200 rounded-xl py-3 text-sm font-medium transition-all"
    >
      <Globe2 size={16} />
      Google ile devam et
    </motion.button>
  );
}

function ErrorMsg({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
        >
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const firebaseErrorMap = {
  'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı.',
  'auth/invalid-email': 'Geçersiz e-posta adresi.',
  'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
  'auth/user-not-found': 'Kullanıcı bulunamadı.',
  'auth/wrong-password': 'Şifre hatalı.',
  'auth/invalid-credential': 'E-posta veya şifre hatalı.',
  'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
  'auth/popup-closed-by-user': 'Google girişi iptal edildi.',
  'auth/popup-blocked': 'Popup engellendi. Tarayıcı ayarlarını kontrol et.',
  'auth/cancelled-popup-request': 'Google girişi iptal edildi.',
};

function toReadable(err) {
  if (!err) return '';
  const code = err?.code || '';
  return firebaseErrorMap[code] || err.message || 'Bir hata oluştu.';
}

/* ── Email Verification Screen ── */
function VerifyEmailScreen({ email, onRefresh, onLogout }) {
  const { resendVerification } = useAuth();
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resentLoading, setResentLoading] = useState(false);

  const handleResend = async () => {
    setResentLoading(true);
    try {
      await resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      // ignore
    } finally {
      setResentLoading(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    await onRefresh();
    setTimeout(() => setChecking(false), 1500);
  };

  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-sm bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />

        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MailCheck size={28} className="text-violet-400" />
          </motion.div>
          <h2 className="text-lg font-bold text-zinc-100">E-postanı Doğrula</h2>
          <p className="text-zinc-500 text-xs text-center mt-2 leading-relaxed">
            <span className="text-violet-400">{email}</span> adresine doğrulama maili gönderdik. Linke tıkladıktan sonra aşağıdan devam et.
          </p>
        </motion.div>

        <div className="flex flex-col gap-2">
          <motion.button
            onClick={handleCheck}
            disabled={checking}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-md shadow-violet-500/25"
          >
            {checking
              ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              : <><RefreshCw size={15} /> Doğruladım, devam et</>
            }
          </motion.button>

          <button
            onClick={handleResend}
            disabled={resentLoading || resent}
            className="w-full py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {resent ? '✓ Mail tekrar gönderildi!' : resentLoading ? 'Gönderiliyor...' : 'Maili tekrar gönder'}
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Farklı hesapla giriş yap
          </button>
        </div>
      </motion.div>
    </TiltCard>
  );
}

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
export default function LoginPage() {
  const { login, register, loginWithGoogle, logout, refreshUser, user } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // If user is logged in but not verified
  if (user && !user.emailVerified && pendingVerification) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4 relative overflow-hidden">
        <Orb cx="10%" cy="20%" r={200} color="radial-gradient(circle, #7c3aed 0%, transparent 70%)" />
        <Orb cx="85%" cy="70%" r={250} color="radial-gradient(circle, #4f46e5 0%, transparent 70%)" delay={2} />
        <VerifyEmailScreen
          email={pendingEmail || user.email}
          onRefresh={refreshUser}
          onLogout={() => { logout(); setPendingVerification(false); }}
        />
      </div>
    );
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError(''); setName(''); setEmail(''); setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, name);
        setPendingEmail(email);
        setPendingVerification(true);
      } else {
        const cred = await login(email, password);
        // If email not verified, show verification screen
        if (cred?.user && !cred.user.emailVerified) {
          setPendingEmail(email);
          setPendingVerification(true);
        }
      }
    } catch (err) {
      setError(toReadable(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      // Google logins are always verified
    } catch (err) {
      setError(toReadable(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4 relative overflow-hidden">
      <Orb cx="10%" cy="20%" r={200} color="radial-gradient(circle, #7c3aed 0%, transparent 70%)" delay={0} />
      <Orb cx="85%" cy="70%" r={250} color="radial-gradient(circle, #4f46e5 0%, transparent 70%)" delay={2} />
      <Orb cx="50%" cy="90%" r={180} color="radial-gradient(circle, #7c3aed 0%, transparent 70%)" delay={4} />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-violet-400/40"
          style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i * 0.4, delay: i * 0.3, repeat: Infinity }}
        />
      ))}

      <TiltCard>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 40, scale: 0.95, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full max-w-sm bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />

          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4"
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <Sparkles size={24} className="text-white" />
            </motion.div>
            <h1 className="text-xl font-bold text-zinc-100">Günlük Takip</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Hesap oluşturun'}
            </p>
          </motion.div>

          <div className="flex bg-zinc-900 rounded-xl p-1 mb-6 gap-1">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { if (m !== mode) switchMode(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Field icon={User} type="text" placeholder="Ad Soyad" value={name} onChange={e => setName(e.target.value)} />
                </motion.div>
              )}
            </AnimatePresence>

            <Field icon={Mail} type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />

            <Field
              icon={Lock}
              type={showPass ? 'text' : 'password'}
              placeholder="Şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              right={
                <button type="button" onClick={() => setShowPass(s => !s)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <ErrorMsg msg={error} />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-md shadow-violet-500/25 mt-1"
            >
              {loading ? (
                <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}<ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">veya</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <GoogleBtn onClick={handleGoogle} disabled={loading} />

          <p className="text-center text-zinc-600 text-xs mt-6">
            {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
            <button onClick={switchMode} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              {mode === 'login' ? 'Kayıt ol' : 'Giriş yap'}
            </button>
          </p>
        </motion.div>
      </TiltCard>
    </div>
  );
}
