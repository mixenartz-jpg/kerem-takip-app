import { useState, useMemo } from 'react';
import { Plus, Search, Pin, Trash2, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/dateUtils';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useApp();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(n => n.tags?.forEach(t => tags.add(t)));
    return [...tags];
  }, [notes]);

  const filtered = useMemo(() => {
    let list = [...notes];
    if (search) list = list.filter(n =>
      (n.title + n.content).toLowerCase().includes(search.toLowerCase())
    );
    if (filterTag) list = list.filter(n => n.tags?.includes(filterTag));
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [notes, search, filterTag]);

  const currentNote = selected ? notes.find(n => n.id === selected) : null;

  const handleNew = () => {
    addNote({ title: 'Yeni Not', content: '' });
    // select the new note after state update
    setTimeout(() => {
      const n = JSON.parse(localStorage.getItem('gunluk-takip-v1') || '{}');
      if (n.notes?.[0]) setSelected(n.notes[0].id);
    }, 50);
  };

  const handleNewAndSelect = () => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    // Use addNote and then select by finding newest
    addNote({ title: '', content: '' });
    // We'll rely on filtering to show the new note
    setTimeout(() => {
      const raw = localStorage.getItem('gunluk-takip-v1');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.notes?.length) setSelected(data.notes[0].id);
      }
    }, 100);
  };

  return (
    <div className="flex h-full animate-fadeIn">
      {/* Note list */}
      <div className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-72 md:shrink-0 border-r border-zinc-800 flex-col bg-zinc-900/50`}>
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-zinc-100 text-sm">Notlar</h1>
            <button onClick={handleNewAndSelect}
              className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Not ara..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500" />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setFilterTag('')}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!filterTag ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                Tümü
              </button>
              {allTags.map(t => (
                <button key={t} onClick={() => setFilterTag(t === filterTag ? '' : t)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${filterTag === t ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="text-xs text-zinc-600 text-center mt-8">Not bulunamadı</p>
          )}
          {filtered.map(note => (
            <button
              key={note.id}
              onClick={() => setSelected(note.id)}
              className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/50 ${selected === note.id ? 'bg-zinc-800' : ''}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${note.pinned ? 'text-violet-300' : 'text-zinc-200'}`}>
                    {note.title || '(Başlıksız)'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {note.content?.replace(/<[^>]*>/g, '') || 'Boş not'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">{formatDate(note.updatedAt, 'dd MMM')}</p>
                </div>
                {note.pinned && <Pin size={12} className="text-violet-400 shrink-0 mt-0.5" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {currentNote ? (
          <>
            <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-zinc-800 bg-zinc-900/30">
              <button
                onClick={() => setSelected(null)}
                className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors mr-1"
              >
                ←
              </button>
              <input
                value={currentNote.title}
                onChange={e => updateNote(currentNote.id, { title: e.target.value })}
                placeholder="Not başlığı..."
                className="flex-1 bg-transparent text-lg font-semibold text-zinc-100 placeholder-zinc-600 outline-none"
              />
              <button onClick={() => togglePin(currentNote.id)}
                className={`p-1.5 rounded-lg transition-colors ${currentNote.pinned ? 'text-violet-400 bg-violet-400/10' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'}`}>
                <Pin size={15} />
              </button>
              <button onClick={() => { deleteNote(currentNote.id); setSelected(null); }}
                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 px-6 py-2 border-b border-zinc-800">
              <Tag size={13} className="text-zinc-600" />
              <TagInput
                tags={currentNote.tags || []}
                onChange={tags => updateNote(currentNote.id, { tags })}
              />
            </div>

            {/* Content */}
            <textarea
              value={currentNote.content}
              onChange={e => updateNote(currentNote.id, { content: e.target.value })}
              placeholder="Not içeriği..."
              className="flex-1 bg-transparent px-6 py-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />

            <div className="px-6 py-2 border-t border-zinc-800 text-xs text-zinc-600">
              Son güncelleme: {formatDate(currentNote.updatedAt, 'dd MMM yyyy HH:mm')}
              {' · '}{currentNote.content?.length || 0} karakter
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-zinc-400 font-medium">Not seç veya oluştur</p>
              <p className="text-xs text-zinc-600 mt-1">Soldaki listeden bir not seç</p>
              <button onClick={handleNewAndSelect}
                className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
                + Yeni Not
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-zinc-200">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        placeholder="Etiket ekle..."
        className="bg-transparent text-xs text-zinc-400 placeholder-zinc-600 outline-none w-24"
      />
    </div>
  );
}
