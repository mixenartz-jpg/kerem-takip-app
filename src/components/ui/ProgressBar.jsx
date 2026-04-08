export default function ProgressBar({ value, max = 100, color = 'violet', className = '', showLabel = false }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const colors = {
    violet: 'bg-violet-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color] || colors.violet} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-zinc-400 w-8 text-right">{pct}%</span>}
    </div>
  );
}
