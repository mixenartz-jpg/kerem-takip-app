import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, BookOpen, ClipboardList, Target,
  Video, BarChart2, Sparkles, ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr } from '../utils/dateUtils';
import { isPast, parseISO } from 'date-fns';

/* ── Animasyon varyantları ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};
const headerVariant = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

/* ── BentoCard bileşeni (genel) ── */
function BentoCard({ to, title, icon: Icon, color, gradient, span, subtitle, onClick, hero }) {
  return (
    <motion.button
      variants={cardVariant}
      onClick={() => onClick(to)}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className={`${span || ''} relative overflow-hidden rounded-3xl text-left w-full group`}
      style={{
        background: 'rgba(16,16,20,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.055)',
        minHeight: hero ? 200 : 168,
      }}
    >
      <div
        className="absolute inset-0 opacity-100"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}20, ${gradient[1]}0a)` }}
      />
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 25% 20%, ${color}1a, transparent 65%)` }}
      />
      <div
        className="absolute top-0 left-8 right-8 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }}
      />

      <div className="relative z-10 p-5 flex flex-col h-full" style={{ minHeight: hero ? 200 : 168 }}>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}2e` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-100 text-sm leading-snug mb-1.5">{title}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">{subtitle}</p>
        </div>
        <div className="flex justify-end mt-3">
          <motion.div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: `${color}14` }}
            whileHover={{ scale: 1.1 }}
          >
            <ArrowUpRight size={14} style={{ color }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Özel AI kart: gradient + pulse animasyonu ── */
function AICard({ onClick }) {
  return (
    <motion.button
      variants={cardVariant}
      onClick={() => onClick('/ai')}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden rounded-3xl text-left w-full group"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.18))',
        border: '1px solid rgba(124,58,237,0.3)',
        minHeight: 168,
      }}
    >
      {/* Animated gradient sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15), transparent)' }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ border: '1px solid rgba(124,58,237,0.4)' }}
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.01, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 p-5 flex flex-col h-full" style={{ minHeight: 168 }}>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(236,72,153,0.3))',
            border: '1px solid rgba(124,58,237,0.4)',
          }}
        >
          <Sparkles size={20} className="text-violet-200" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-zinc-100 text-sm leading-snug">AI Destekli Öğrenme</h3>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(236,72,153,0.4))',
                color: '#e9d5ff',
                border: '1px solid rgba(124,58,237,0.3)',
              }}
            >
              AI
            </span>
          </div>
          <p className="text-xs text-violet-300/70 leading-relaxed">Kişisel AI asistanın ile çalış</p>
        </div>
        <div className="flex justify-end mt-3">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.25)' }}
          >
            <ArrowUpRight size={14} className="text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Kart tanımlamaları hook'u ── */
function useAkademiCards(lessons, exams, goals) {
  return useMemo(() => {
    const totalStudyHours = lessons.reduce((s, l) => s + (l.studyHours || 0), 0);
    const upcomingExams = exams.filter(e => {
      try { return !isPast(parseISO(e.date + 'T23:59')); } catch { return true; }
    }).length;
    const activeGoals = goals.filter(g => !g.completed).length;

    return [
      {
        id: 'yks',
        to: '/yks',
        title: 'YKS Merkezi',
        icon: Brain,
        color: '#7c3aed',
        gradient: ['#7c3aed', '#a855f7'],
        span: 'md:col-span-2',
        hero: true,
        subtitle: 'TYT & AYT denemeler, konu takibi ve analiz',
      },
      // AICard gets span='' rendered separately
      {
        id: 'lessons',
        to: '/lessons',
        title: 'Dersler',
        icon: BookOpen,
        color: '#06b6d4',
        gradient: ['#06b6d4', '#0ea5e9'],
        span: '',
        subtitle: totalStudyHours > 0 ? `${totalStudyHours}s toplam çalışıldı` : 'Ders planını oluştur',
      },
      {
        id: 'exams',
        to: '/exams',
        title: 'Sınav Takvimi',
        icon: ClipboardList,
        color: '#ef4444',
        gradient: ['#ef4444', '#f97316'],
        span: '',
        subtitle: upcomingExams > 0 ? `${upcomingExams} yaklaşan sınav` : 'Sınav tarihlerini ekle',
      },
      {
        id: 'video',
        to: '/video-summarizer',
        title: 'Video Özetleyici',
        icon: Video,
        color: '#f59e0b',
        gradient: ['#f59e0b', '#fb923c'],
        span: '',
        subtitle: 'YouTube videolarını AI ile özetle',
      },
      {
        id: 'goals',
        to: '/goals',
        title: 'Hedefler',
        icon: Target,
        color: '#22c55e',
        gradient: ['#22c55e', '#10b981'],
        span: 'md:col-span-2',
        subtitle: activeGoals > 0 ? `${activeGoals} aktif hedef var` : 'Hedeflerini belirle',
      },
      {
        id: 'stats',
        to: '/stats',
        title: 'İstatistikler',
        icon: BarChart2,
        color: '#8b5cf6',
        gradient: ['#8b5cf6', '#a855f7'],
        span: '',
        subtitle: 'Gelişimini analiz et',
      },
    ];
  }, [lessons, exams, goals]);
}

/* ── Ana sayfa bileşeni ── */
export default function AkademiHub() {
  const { lessons, exams, goals } = useApp();
  const navigate = useNavigate();
  const cards = useAkademiCards(lessons, exams, goals);

  // YKS card (hero, span-2), AI card (span-1) → Row 1
  // lessons, exams, video → Row 2
  // goals (span-2), stats → Row 3
  const [yksCard, ...restCards] = cards;

  return (
    <motion.div
      className="p-5 md:p-8 min-h-full"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Sayfa başlığı */}
      <motion.div variants={headerVariant} className="mb-8">
        <div className="flex items-center gap-3.5 mb-2">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            <Brain size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 leading-tight">Akademi</h1>
            <p className="text-xs text-zinc-500 mt-0.5">YKS hazırlık ve öğrenme araçlarınız</p>
          </div>
        </div>
      </motion.div>

      {/* Bento grid */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        style={{ gridAutoRows: '168px' }}
      >
        {/* Row 1: YKS (2-wide) + AI card */}
        <BentoCard key={yksCard.id} {...yksCard} onClick={navigate} />
        <AICard onClick={navigate} />

        {/* Rest of cards */}
        {restCards.map(card => (
          <BentoCard key={card.id} {...card} onClick={navigate} />
        ))}
      </motion.div>
    </motion.div>
  );
}
