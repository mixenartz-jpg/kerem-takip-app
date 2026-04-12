import { useState } from 'react';
import { Plus, Trash2, MoreHorizontal, ChevronLeft } from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { formatDate, getPriorityColor } from '../utils/dateUtils';

const PROJECT_COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316'];

function ProjectForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#8b5cf6', ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      <input autoFocus value={form.name} onChange={e => set('name', e.target.value)}
        placeholder="Proje adı..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500" />
      <textarea value={form.description} onChange={e => set('description', e.target.value)}
        placeholder="Açıklama..." rows={2}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 resize-none" />
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5">Renk</label>
        <div className="flex gap-2">
          {PROJECT_COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">İptal</button>
        <button onClick={() => form.name.trim() && onSave(form)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
          Kaydet
        </button>
      </div>
    </div>
  );
}

function CardForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', dueDate: '', assignee: '', ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="space-y-3">
      <input autoFocus value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="Kart başlığı..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500" />
      <textarea value={form.description} onChange={e => set('description', e.target.value)}
        placeholder="Açıklama..." rows={2}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Öncelik</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100 outline-none">
            <option value="acil">🔴 Acil</option>
            <option value="yüksek">🟠 Yüksek</option>
            <option value="normal">🔵 Normal</option>
            <option value="düşük">⚪ Düşük</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Bitiş</label>
          <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100 outline-none" />
        </div>
      </div>
      <input value={form.assignee} onChange={e => set('assignee', e.target.value)}
        placeholder="Atanan kişi..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500" />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200">İptal</button>
        <button onClick={() => form.title.trim() && onSave(form)}
          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
          Kaydet
        </button>
      </div>
    </div>
  );
}

function KanbanCard({ card, projectId, columnId, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const prioClass = getPriorityColor(card.priority);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing group hover:border-zinc-600 transition-colors">
      <div className="flex items-start gap-2 mb-2">
        <p className="flex-1 text-sm text-zinc-200 leading-snug">{card.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onPointerDown={e => e.stopPropagation()} onClick={() => onEdit(card)} className="text-zinc-500 hover:text-zinc-300 text-xs p-0.5">✏</button>
          <button onPointerDown={e => e.stopPropagation()} onClick={() => onDelete(card.id)} className="text-zinc-500 hover:text-red-400 p-0.5">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {card.description && <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{card.description}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded border ${prioClass}`}>{card.priority}</span>
        {card.dueDate && <span className="text-xs text-zinc-500">{formatDate(card.dueDate, 'dd MMM')}</span>}
        {card.assignee && (
          <span className="text-xs text-zinc-500 ml-auto">{card.assignee}</span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ column, project, onAddCard, isOver }) {
  const { deleteCard, updateCard, deleteColumn } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className={`w-72 shrink-0 flex flex-col bg-zinc-900 border rounded-xl transition-colors ${isOver ? 'border-violet-500/60' : 'border-zinc-800'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-200 text-sm">{column.name}</span>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{column.cards.length}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setAddOpen(true)} className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Plus size={14} />
          </button>
          <button onClick={() => deleteColumn(project.id, column.id)} className="p-1 text-zinc-500 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`flex-1 overflow-y-auto p-3 space-y-2 min-h-16 ${isOver && column.cards.length === 0 ? 'bg-violet-500/5 rounded-b-xl' : ''}`}>
          {column.cards.map(card => (
            <KanbanCard
              key={card.id} card={card}
              projectId={project.id} columnId={column.id}
              onEdit={setEditCard}
              onDelete={(id) => deleteCard(project.id, column.id, id)}
            />
          ))}
        </div>
      </SortableContext>

      <button onClick={() => setAddOpen(true)}
        className="m-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors flex items-center justify-center gap-1">
        <Plus size={12} /> Kart ekle
      </button>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Kart" size="sm">
        <CardForm
          onSave={(data) => { onAddCard(column.id, data); setAddOpen(false); }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      <Modal open={!!editCard} onClose={() => setEditCard(null)} title="Kartı Düzenle" size="sm">
        {editCard && (
          <CardForm
            initial={editCard}
            onSave={(data) => { updateCard(project.id, column.id, editCard.id, data); setEditCard(null); }}
            onCancel={() => setEditCard(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject, addCard, addColumn, moveCard } = useApp();
  const [view, setView] = useState('list'); // 'list' | board
  const [activeProject, setActiveProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [newColName, setNewColName] = useState('');
  const [addingCol, setAddingCol] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [overColId, setOverColId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const project = projects.find(p => p.id === activeProject);

  const totalCards = (p) => p.columns.reduce((a, c) => a + c.cards.length, 0);
  const doneCards = (p) => p.columns.find(c => c.name === 'Tamamlandı')?.cards.length || 0;

  // Find which column a card or column id belongs to
  const findColumn = (id) => {
    if (!project) return null;
    // Direct column id match
    const col = project.columns.find(c => c.id === id);
    if (col) return col;
    // Card id match
    return project.columns.find(c => c.cards.some(card => card.id === id)) || null;
  };

  const handleDragOver = (e) => {
    const { over } = e;
    if (!over || !project) { setOverColId(null); return; }
    const col = findColumn(over.id);
    setOverColId(col?.id || null);
  };

  const handleDragEnd = (e) => {
    const { active, over } = e;
    setOverColId(null);
    if (!over || !project) return;

    const fromCol = findColumn(active.id);
    const toCol = findColumn(over.id);
    if (!fromCol || !toCol) return;
    if (fromCol.id === toCol.id && active.id === over.id) return;

    const toIndex = toCol.cards.findIndex(c => c.id === over.id);
    moveCard(project.id, fromCol.id, toCol.id, active.id, toIndex === -1 ? toCol.cards.length : toIndex);
  };

  if (view === 'board' && project) {
    return (
      <div className="p-6 flex flex-col h-full animate-fadeIn">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setView('list')} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: project.color }} />
            <h1 className="text-xl font-bold text-zinc-100">{project.name}</h1>
          </div>
          <div className="flex-1" />
          {addingCol ? (
            <div className="flex items-center gap-2">
              <input value={newColName} onChange={e => setNewColName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newColName.trim()) { addColumn(project.id, newColName.trim()); setNewColName(''); setAddingCol(false); } }}
                placeholder="Sütun adı..." autoFocus
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 outline-none w-40" />
              <button onClick={() => { if (newColName.trim()) { addColumn(project.id, newColName.trim()); setNewColName(''); setAddingCol(false); } }}
                className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg">Ekle</button>
              <button onClick={() => setAddingCol(false)} className="text-zinc-500 hover:text-zinc-300 text-xs">İptal</button>
            </div>
          ) : (
            <button onClick={() => setAddingCol(true)}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14} /> Sütun
            </button>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {project.columns.map(col => (
              <KanbanColumn
                key={col.id} column={col} project={project}
                onAddCard={(colId, data) => addCard(project.id, colId, data)}
              />
            ))}
          </div>
        </DndContext>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Projeler</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{projects.length} proje</p>
        </div>
        <button onClick={() => setShowProjectForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Proje Ekle
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl">📋</span>
          <p className="mt-3 text-zinc-400">Henüz proje yok</p>
          <button onClick={() => setShowProjectForm(true)} className="mt-3 text-sm text-violet-400 hover:text-violet-300">
            + İlk projeyi oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => {
            const total = totalCards(p);
            const done = doneCards(p);
            return (
              <div key={p.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors cursor-pointer group"
                onClick={() => { setActiveProject(p.id); setView('board'); }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                    <h3 className="font-semibold text-zinc-100 text-sm">{p.name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}>
                    <button onClick={() => setEditProject(p)} className="text-zinc-500 hover:text-zinc-300 text-xs p-1">✏</button>
                    <button onClick={() => deleteProject(p.id)} className="text-zinc-500 hover:text-red-400 p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {p.description && <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{p.description}</p>}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{done}/{total} tamamlandı</span>
                    <span>{p.columns.length} sütun</span>
                  </div>
                  <ProgressBar value={done} max={total} color="violet" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showProjectForm} onClose={() => setShowProjectForm(false)} title="Yeni Proje">
        <ProjectForm
          onSave={(data) => { addProject(data); setShowProjectForm(false); }}
          onCancel={() => setShowProjectForm(false)}
        />
      </Modal>

      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Projeyi Düzenle">
        {editProject && (
          <ProjectForm
            initial={editProject}
            onSave={(data) => { updateProject(editProject.id, data); setEditProject(null); }}
            onCancel={() => setEditProject(null)}
          />
        )}
      </Modal>
    </div>
  );
}
