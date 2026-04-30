import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { WORKSPACE_LIST } from '../../utils/workspaceConfig';

export default function WorkspaceSwitcher({ compact = false }) {
  const { activeWorkspace, setActiveWorkspace } = useApp();
  const navigate = useNavigate();

  const handleSwitch = async (id) => {
    if (id === activeWorkspace) return;
    await setActiveWorkspace(id);
    navigate('/');
  };

  return (
    <div
      className="relative inline-flex items-center bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-0.5 shrink-0"
      role="tablist"
      aria-label="Çalışma alanı"
    >
      {WORKSPACE_LIST.map((ws) => {
        const Icon = ws.icon;
        const isActive = activeWorkspace === ws.id;
        return (
          <button
            key={ws.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSwitch(ws.id)}
            className="relative px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors z-10"
            style={{ color: isActive ? ws.accent : '#a1a1aa' }}
          >
            {isActive && (
              <motion.div
                layoutId="workspaceSwitcherActive"
                className="absolute inset-0 rounded-lg -z-10"
                style={{
                  background: ws.accentSoft,
                  border: `1px solid ${ws.accent}55`,
                  boxShadow: `0 0 0 1px ${ws.accent}22, 0 0 12px ${ws.accent}33`,
                }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              />
            )}
            <Icon size={14} />
            <span className={compact ? 'hidden sm:inline' : ''}>{ws.label}</span>
          </button>
        );
      })}
    </div>
  );
}
