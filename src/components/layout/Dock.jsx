import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, GraduationCap,
  Sparkles, Users2, LogOut, Menu,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS_YKS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/planner',   icon: Sparkles,        label: 'AI Planlayıcı', ai: true },
  { to: '/planlama',  icon: CalendarDays,    label: 'Planlama' },
  { to: '/akademi',   icon: GraduationCap,   label: 'Akademi' },
  { to: '/sosyal',    icon: Users2,          label: 'Sosyal' },
];

const NAV_ITEMS_DAILY = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/planner',   icon: Sparkles,        label: 'AI Planlayıcı', ai: true },
  { to: '/planlama',  icon: CalendarDays,    label: 'Planlama' },
  { to: '/sosyal',    icon: Users2,          label: 'Sosyal' },
];

export default function Dock({ onMenuOpen }) {
  const { user, logout } = useAuth();
  const { userMode } = useApp();
  const [tooltip, setTooltip] = useState(null);

  const NAV_ITEMS = userMode === 'daily' ? NAV_ITEMS_DAILY : NAV_ITEMS_YKS;

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'K';

  return (
    <aside
      className="hidden md:flex flex-col items-center shrink-0 relative z-10"
      style={{
        width: 72,
        background: 'rgba(8,8,10,0.98)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="pt-5 pb-3 flex items-center justify-center w-full relative z-10">
        <motion.div
          className="w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          animate={{
            filter: [
              'drop-shadow(0 0 4px rgba(124,58,237,0.4))',
              'drop-shadow(0 0 12px rgba(124,58,237,0.75))',
              'drop-shadow(0 0 4px rgba(124,58,237,0.4))',
            ],
          }}
          transition={{ filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <img src="/logo-white.png" alt="Dash YKS" className="w-full h-full object-contain" />
        </motion.div>
      </div>

      {/* Hamburger menu button — opens DrawerMenu */}
      <div
        className="relative w-full flex justify-center mb-2"
        onMouseEnter={() => setTooltip('__menu__')}
        onMouseLeave={() => setTooltip(null)}
      >
        <motion.button
          onClick={onMenuOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="w-12 h-10 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all relative z-10"
        >
          <Menu size={18} />
        </motion.button>
        <AnimatePresence>
          {tooltip === '__menu__' && (
            <motion.div
              className="absolute left-[58px] top-1/2 -translate-y-1/2 z-[300] px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-100 whitespace-nowrap pointer-events-none"
              style={{
                background: 'rgba(20,20,24,0.96)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.12 }}
            >
              Tüm Menü
              <div
                className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0"
                style={{
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  borderRight: '5px solid rgba(20,20,24,0.96)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top divider */}
      <div className="w-8 h-px bg-white/5 mb-3 shrink-0" />

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2 py-1 relative z-10">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end, ai }) => (
          <div
            key={to}
            className="relative w-full flex justify-center"
            onMouseEnter={() => setTooltip(to)}
            onMouseLeave={() => setTooltip(null)}
          >
            <NavLink to={to} end={end} className="w-full flex justify-center outline-none">
              {({ isActive }) => (
                <motion.div
                  className="relative w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    background: ai
                      ? isActive
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(236,72,153,0.35))'
                        : 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(236,72,153,0.12))'
                      : isActive
                        ? 'rgba(124,58,237,0.18)'
                        : 'transparent',
                  }}
                >
                  {/* Active pill — left edge */}
                  {isActive && (
                    <motion.div
                      layoutId="dockActivePill"
                      className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full"
                      style={{
                        background: ai
                          ? 'linear-gradient(to bottom, #7c3aed, #ec4899)'
                          : '#7c3aed',
                        boxShadow: ai
                          ? '0 0 10px rgba(236,72,153,0.9)'
                          : '0 0 8px rgba(124,58,237,0.9)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* AI pulse ring */}
                  {ai && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ border: '1px solid rgba(124,58,237,0.5)' }}
                        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.06, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.div
                        className="absolute -inset-1 rounded-2xl pointer-events-none"
                        style={{ border: '1px solid rgba(168,85,247,0.18)' }}
                        animate={{ opacity: [0, 0.7, 0], scale: [1, 1.12, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                      />
                    </>
                  )}

                  {/* Hover bg */}
                  {!ai && (
                    <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity bg-white/[0.04]" />
                  )}

                  <Icon
                    size={19}
                    className={
                      ai
                        ? isActive ? 'text-pink-300' : 'text-violet-400'
                        : isActive
                          ? 'text-violet-300'
                          : 'text-zinc-500'
                    }
                  />
                  {ai && !isActive && (
                    <span
                      className="absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full leading-tight"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        color: '#fff',
                      }}
                    >
                      AI
                    </span>
                  )}
                </motion.div>
              )}
            </NavLink>

            {/* Tooltip */}
            <AnimatePresence>
              {tooltip === to && (
                <motion.div
                  className="absolute left-[58px] top-1/2 -translate-y-1/2 z-[300] px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-100 whitespace-nowrap pointer-events-none"
                  style={{
                    background: 'rgba(20,20,24,0.96)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  }}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                >
                  {label}
                  <div
                    className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0"
                    style={{
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      borderRight: '5px solid rgba(20,20,24,0.96)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Bottom divider */}
      <div className="w-px h-8 bg-white/5 mb-3 shrink-0" />

      {/* User avatar + logout */}
      <div className="pb-5 flex flex-col items-center gap-2 relative z-10">
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          title="Çıkış Yap"
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-500 transition-colors shrink-0"
          style={{ boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
        >
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" className="w-9 h-9 object-cover" />
            : initials}
        </motion.button>
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.1, color: '#f87171' }}
          title="Çıkış Yap"
          className="text-zinc-700 hover:text-red-400 transition-colors"
        >
          <LogOut size={12} />
        </motion.button>
      </div>
    </aside>
  );
}
