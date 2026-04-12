import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Sparkles, Loader2, BookmarkPlus, CheckCircle, AlertCircle, Link } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { summarizeYouTubeVideo, parseGeminiError } from '../services/geminiService';
import MarkdownMessage from '../components/ai/MarkdownMessage';

const YT_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractVideoId(url) {
  const m = url.match(YT_REGEX);
  return m ? m[1] : null;
}

export default function VideoSummarizer() {
  const { notes, addNote } = useApp();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const videoId = extractVideoId(url);

  const handleSummarize = async () => {
    if (!videoId) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    try {
      const data = await summarizeYouTubeVideo(url.trim());
      setResult(data);
    } catch (err) {
      setError(parseGeminiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const content = `## Özet\n${result.summary}\n\n## Ana Noktalar\n${(result.keyPoints || []).map(k => `- ${k}`).join('\n')}${result.formulas ? `\n\n## Formüller\n${result.formulas}` : ''}${result.yksRelevance ? `\n\n## YKS Önemi\n${result.yksRelevance}` : ''}\n\nKaynak: ${url}`;
    addNote({
      title: result.title || 'Video Özeti',
      content,
      category: 'video-özeti',
      tags: ['video', 'özet'],
    });
    setSaved(true);
  };

  // Recent video summaries
  const recentSummaries = (notes || [])
    .filter(n => n.category === 'video-özeti')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Video size={18} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Video Özetleyici</h1>
        </div>
        <p className="text-sm text-zinc-500 ml-12">YouTube videolarını AI ile özetle</p>
      </motion.div>

      {/* URL Input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className={`flex items-center gap-2 bg-zinc-900 border rounded-xl px-4 py-3 transition-all ${
          url && !videoId ? 'border-red-500/40' : 'border-zinc-800 focus-within:border-violet-500/60'
        }`}>
          <Link size={15} className="text-zinc-600 shrink-0" />
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setResult(null); setError(''); setSaved(false); }}
            onKeyDown={e => e.key === 'Enter' && videoId && handleSummarize()}
            placeholder="YouTube URL yapıştır (youtube.com/watch?v=... veya youtu.be/...)"
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
          />
        </div>
        {url && !videoId && (
          <p className="text-xs text-red-400 mt-1.5 ml-1">Geçerli bir YouTube URL'si gir</p>
        )}
      </motion.div>

      {/* Video preview */}
      <AnimatePresence>
        {videoId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 rounded-xl overflow-hidden border border-zinc-800"
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video önizleme"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summarize button */}
      <motion.button
        onClick={handleSummarize}
        disabled={!videoId || loading}
        whileHover={{ scale: videoId && !loading ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl py-3 text-sm transition-all mb-6"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Analiz ediliyor...</>
          : <><Sparkles size={16} /> Videoyu Özetle</>
        }
      </motion.button>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4"
        >
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6"
          >
            {/* Result header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-100 text-sm">{result.title || 'Video Özeti'}</h2>
                {result.yksRelevance && (
                  <p className="text-xs text-violet-400 mt-0.5">{result.yksRelevance}</p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saved}
                className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  saved
                    ? 'text-green-400 border-green-500/30 bg-green-500/10'
                    : 'text-zinc-400 border-zinc-700 hover:text-violet-300 hover:border-violet-500/40'
                }`}
              >
                {saved ? <CheckCircle size={13} /> : <BookmarkPlus size={13} />}
                {saved ? 'Kaydedildi' : 'Nota Kaydet'}
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Summary */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Özet</p>
                <div className="text-sm text-zinc-300 leading-relaxed">
                  <MarkdownMessage content={result.summary || ''} />
                </div>
              </div>

              {/* Key points */}
              {result.keyPoints?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Ana Noktalar</p>
                  <ul className="space-y-1.5">
                    {result.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formulas */}
              {result.formulas && result.formulas !== 'null' && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Formüller / İpuçları</p>
                  <div className="bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300">
                    <MarkdownMessage content={result.formulas} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent summaries */}
      {recentSummaries.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-3">Son Özetler</p>
          <div className="flex flex-col gap-2">
            {recentSummaries.map(note => (
              <div key={note.id} className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <Video size={14} className="text-red-400 shrink-0" />
                <span className="text-sm text-zinc-400 truncate">{note.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
