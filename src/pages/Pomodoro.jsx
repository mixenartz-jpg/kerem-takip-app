import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { todayStr, formatDate } from '../utils/dateUtils';

const MODES = [
  { key: 'work', label: 'Odak', color: '#8b5cf6', defaultMin: 25 },
  { key: 'shortBreak', label: 'Kısa Mola', color: '#10b981', defaultMin: 5 },
  { key: 'longBreak', label: 'Uzun Mola', color: '#3b82f6', defaultMin: 15 },
];

export default function Pomodoro() {
  const { tasks, pomodoro, addPomodoroSession, updatePomodoroSettings } = useApp();
  const settings = pomodoro.settings;

  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...settings });
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  const today = todayStr();

  const modeConfig = MODES.find(m => m.key === mode);
  const totalSeconds = settings[mode] * 60;
  const pct = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const getModeTime = useCallback((m) => settings[m] * 60, [settings]);

  const resetTimer = useCallback((m = mode) => {
    setRunning(false);
    setTimeLeft(settings[m] * 60);
  }, [mode, settings]);

  const switchMode = (m) => {
    setMode(m);
    setRunning(false);
    setTimeLeft(settings[m] * 60);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            // Save session if work mode
            if (mode === 'work') {
              addPomodoroSession({ taskId: selectedTask, duration: settings.work, completed: true, mode: 'work' });
              setSessions(s => s + 1);
              // Auto switch to break
              const nextMode = sessions > 0 && (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
              setTimeout(() => switchMode(nextMode), 500);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  const todaySessions = pomodoro.sessions.filter(s => s.date === today && s.completed);
  const todayFocusMin = todaySessions.length * (settings.work || 25);

  const activeTasks = tasks.filter(t => !t.completed);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="p-6 space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Pomodoro</h1>
        <button onClick={() => setSettingsOpen(true)}
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
          <Settings size={16} />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {MODES.map(m => (
          <button key={m.key} onClick={() => switchMode(m.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === m.key ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            style={mode === m.key ? { background: m.color } : {}}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="#27272a" strokeWidth="8" />
            <circle cx="100" cy="100" r={radius} fill="none"
              stroke={modeConfig.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-zinc-100 tabular-nums">{mm}:{ss}</span>
            <span className="text-sm text-zinc-500 mt-1">{modeConfig.label}</span>
          </div>
        </div>

        {/* Task selector */}
        <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)}
          className="w-full max-w-xs bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-violet-500">
          <option value="">Görev seç (opsiyonel)</option>
          {activeTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={() => resetTimer()}
            className="p-3 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors">
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
            style={{ background: modeConfig.color }}
          >
            {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <div className="w-12 h-12" /> {/* spacer */}
        </div>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-violet-400">{todaySessions.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Bugünkü oturum</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-zinc-100">{todayFocusMin}</p>
          <p className="text-xs text-zinc-500 mt-1">Odak dakikası</p>
        </div>
      </div>

      {/* Session history */}
      {todaySessions.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="font-medium text-zinc-100 text-sm mb-3">Bugünkü Oturumlar</h3>
          <div className="space-y-2">
            {todaySessions.slice(-5).reverse().map((s, i) => {
              const task = tasks.find(t => t.id === s.taskId);
              return (
                <div key={s.id || i} className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-green-400 shrink-0" />
                  <span className="text-sm text-zinc-300 flex-1">{task?.title || 'Görev seçilmedi'}</span>
                  <span className="text-xs text-zinc-500">{s.duration} dk</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Zamanlayıcı Ayarları">
        <div className="space-y-4">
          {MODES.map(m => (
            <div key={m.key}>
              <label className="block text-xs text-zinc-400 mb-1.5">{m.label} (dakika)</label>
              <input type="number" min="1" max="60"
                value={tempSettings[m.key]}
                onChange={e => setTempSettings(s => ({ ...s, [m.key]: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500" />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">İptal</button>
            <button onClick={() => {
              updatePomodoroSettings(tempSettings);
              resetTimer(mode);
              setSettingsOpen(false);
            }} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
              Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
