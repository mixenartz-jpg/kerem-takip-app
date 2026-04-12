import { Youtube, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopicVideoSuggestions({ topic }) {
  if (!topic) return null;

  const searches = [
    `${topic} konu anlatımı TYT`,
    `${topic} soru çözümü AYT`,
    `${topic} özet 2024`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Youtube size={13} className="text-red-400" />
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
          İlgili Videolar
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {searches.map((q, i) => (
          <a
            key={i}
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-red-500/30 rounded-lg transition-all group"
          >
            <span className="text-xs text-zinc-300 group-hover:text-white truncate">{q}</span>
            <ExternalLink size={11} className="text-zinc-600 group-hover:text-red-400 shrink-0 transition-colors" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}
