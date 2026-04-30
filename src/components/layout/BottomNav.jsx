import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getBottomNavItems } from '../../utils/workspaceConfig';

export default function BottomNav() {
  const { activeWorkspace } = useApp();
  const items = getBottomNavItems(activeWorkspace);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 flex items-center px-1 pt-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      {items.map(({ to, icon: Icon, label, ai, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="flex-1 flex flex-col items-center justify-center pt-2 pb-3 relative"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-1 bottom-1 w-12 rounded-xl pointer-events-none"
                  style={{
                    background: ai
                      ? 'linear-gradient(to bottom, rgba(124,58,237,0.2), rgba(236,72,153,0.1))'
                      : 'rgba(124,58,237,0.15)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveLine"
                  className="absolute top-0 w-8 h-[2px] rounded-b-full bg-violet-500 pointer-events-none"
                  style={{ background: ai ? 'linear-gradient(90deg, #7c3aed, #ec4899)' : '#8b5cf6' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <Icon
                size={22}
                className={
                  ai
                    ? isActive ? 'text-pink-300 relative z-10' : 'text-violet-400 relative z-10'
                    : isActive ? 'text-violet-400 relative z-10' : 'text-zinc-500 hover:text-zinc-400 relative z-10 transition-colors'
                }
              />
              <span
                className={`mt-1 text-[10px] font-medium relative z-10 ${
                  isActive ? 'text-zinc-100' : 'text-zinc-500'
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
