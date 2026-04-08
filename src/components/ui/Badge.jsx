export default function Badge({ children, color = 'zinc', className = '' }) {
  const colors = {
    zinc: 'bg-zinc-700 text-zinc-300',
    violet: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    red: 'bg-red-500/20 text-red-300 border border-red-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.zinc} ${className}`}>
      {children}
    </span>
  );
}
