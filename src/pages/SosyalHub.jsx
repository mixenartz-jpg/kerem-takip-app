import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users2, Trophy, ArrowUpRight, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

function SosyalCard({ to, title, subtitle, icon: Icon, color, gradient, onClick }) {
  return (
    <motion.button
      variants={cardVariant}
      onClick={() => onClick(to)}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden rounded-3xl text-left w-full group"
      style={{
        background: 'rgba(16,16,20,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.055)',
        minHeight: 200,
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}20, ${gradient[1]}0a)` }}
      />
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 25% 20%, ${color}18, transparent 65%)` }}
      />
      <div
        className="absolute top-0 left-8 right-8 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }}
      />

      <div className="relative z-10 p-6 flex flex-col h-full" style={{ minHeight: 200 }}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}2e` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-zinc-100 text-base leading-snug mb-2">{title}</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">{subtitle}</p>
        </div>
        <div className="flex justify-end mt-4">
          <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${color}14` }}
            whileHover={{ scale: 1.1 }}
          >
            <ArrowUpRight size={15} style={{ color }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}

export default function SosyalHub() {
  const { friends } = useApp();
  const navigate = useNavigate();

  const acceptedFriends = (friends || []).filter(f => f.status === 'accepted').length;

  const cards = [
    {
      to: '/friends',
      title: 'Arkadaşlar',
      icon: Users2,
      color: '#22c55e',
      gradient: ['#22c55e', '#10b981'],
      subtitle: acceptedFriends > 0
        ? `${acceptedFriends} arkadaşın var — onlarla yarış!`
        : 'Arkadaşlarını ekle ve birlikte çalışın',
    },
    {
      to: '/leaderboard',
      title: 'Sıralama',
      icon: Trophy,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fbbf24'],
      subtitle: 'Bu haftaki en iyi çalışanlar kim?',
    },
    {
      to: '/invite',
      title: 'Arkadaşını Davet Et',
      icon: UserPlus,
      color: '#6366f1',
      gradient: ['#6366f1', '#8b5cf6'],
      subtitle: 'Uygulamayı arkadaşlarınla paylaş',
    },
  ];

  return (
    <motion.div
      className="p-5 md:p-8 min-h-full"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Sayfa başlığı */}
      <motion.div
        variants={cardVariant}
        className="mb-8"
      >
        <div className="flex items-center gap-3.5 mb-2">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15))',
              border: '1px solid rgba(34,197,94,0.3)',
            }}
          >
            <Users2 size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 leading-tight">Sosyal</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Arkadaşlarınla bağlan ve birlikte büyü</p>
          </div>
        </div>
      </motion.div>

      {/* Kartlar */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {cards.map(card => (
          <SosyalCard key={card.to} {...card} onClick={navigate} />
        ))}
      </motion.div>
    </motion.div>
  );
}
