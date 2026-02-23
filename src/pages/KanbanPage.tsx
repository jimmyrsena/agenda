import { useState, useMemo, useCallback, useEffect } from "react";
import { useUserName } from "@/hooks/useUserName";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Circle, Clock, RotateCcw, CheckCircle2, Search, SortAsc,
  KanbanSquare, BarChart3, Keyboard, Archive, Star, LayoutList,
  LayoutGrid, Columns3, CalendarDays
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KanbanTask, KanbanSubtask, AgendaEvent, EnemArea, Priority, ENEM_AREAS, RecurrenceType } from "@/types/study";
import { toast } from "sonner";
import KanbanCard, { COVER_COLORS } from "@/components/kanban/KanbanCard";
import KanbanStats from "@/components/kanban/KanbanStats";
import KanbanCommandPalette from "@/components/kanban/KanbanCommandPalette";

const BUCKETS = [
  { id: 'todo', title: 'A Fazer', icon: Circle, iconColor: 'text-muted-foreground' },
  { id: 'doing', title: 'Em Andamento', icon: Clock, iconColor: 'text-primary' },
  { id: 'review', title: 'Revisão', icon: RotateCcw, iconColor: 'text-ms-purple' },
  { id: 'done', title: 'Concluído', icon: CheckCircle2, iconColor: 'text-ms-green' },
];

type SortBy = 'created' | 'priority' | 'dueDate' | 'title' | 'favorite';
type ViewMode = 'board' | 'compact' | 'list';

const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };
const WIP_DEFAULT = 10;

const emptyTask = {
  title: '', description: '', area: 'linguagens' as EnemArea,
  priority: 'media' as Priority, dueDate: '', column: 'todo',
  coverColor: '', estimatedMinutes: 0, recurrence: 'none' as RecurrenceType,
};

export default function KanbanPage() {
  const userName = useUserName();
  const [tasks, setTasks] = useLocalStorage<KanbanTask[]>('kanban-tasks', []);
  const [agendaEvents, setAgendaEvents] = useLocalStorage<AgendaEvent[]>('agenda-events', []);

  const createAgendaEvent = useCallback((task: KanbanTask) => {
    if (!task.dueDate) return;
    const event: AgendaEvent = {
      id: crypto.randomUUID(),
      title: `[Planner] ${task.title}`,
      date: task.dueDate,
      startTime: '08:00',
      endTime: task.estimatedMinutes ? `${String(8 + Math.floor(task.estimatedMinutes / 60)).padStart(2, '0')}:${String(task.estimatedMinutes % 60).padStart(2, '0')}` : '09:00',
      type: 'tarefa',
      area: task.area,
      description: task.description || undefined,
      completed: false,
    };
    setAgendaEvents(prev => [...prev, event]);
    toast.success("Evento criado na Agenda!", { icon: <CalendarDays className="h-4 w-4" /> });
  }, [setAgendaEvents]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverBucket, setDragOverBucket] = useState<string | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('kanban-view', 'board');
  const [wipLimit, setWipLimit] = useLocalStorage<number>('kanban-wip', WIP_DEFAULT);
  const [quickAdd, setQuickAdd] = useState<string | null>(null);
  const [quickAddText, setQuickAddText] = useState('');
  const [newTask, setNewTask] = useState({ ...emptyTask });

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setDialogOpen(true); }
      if (e.key === '/' && !e.metaKey) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const addTask = () => {
    if (!newTask.title.trim()) { toast.error("Título é obrigatório"); return; }
    const task: KanbanTask = {
      ...newTask, id: crypto.randomUUID(), createdAt: new Date().toISOString(),
      subtasks: [], estimatedMinutes: newTask.estimatedMinutes || undefined,
      recurrence: newTask.recurrence === 'none' ? undefined : newTask.recurrence,
      coverColor: newTask.coverColor || undefined,
    };
    setTasks(prev => [...prev, task]);
    if (task.dueDate) createAgendaEvent(task);
    setNewTask({ ...emptyTask });
    setDialogOpen(false);
    toast.success("Tarefa criada!");
  };

  const updateTask = () => {
    if (!editingTask || !editingTask.title.trim()) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
    toast.success("Tarefa atualizada!");
  };

  const deleteTask = useCallback((id: string) => {
    const deleted = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (deleted) {
      toast.success("Tarefa excluída", {
        action: { label: "Desfazer", onClick: () => { setTasks(prev => [...prev, deleted]); toast.info("Restaurada!"); } },
      });
    }
  }, [tasks, setTasks]);

  const moveTask = useCallback((id: string, column: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updates: Partial<KanbanTask> = { column };
      if (column === 'done' && t.column !== 'done') {
        updates.completedAt = new Date().toISOString();
        toast.success("Tarefa concluída!");
      }
      if (column !== 'done') updates.completedAt = undefined;
      return { ...t, ...updates, history: [...(t.history || []), { date: new Date().toISOString(), from: t.column, to: column }] };
    }));
  }, [setTasks]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, subtasks: t.subtasks?.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s),
    } : t));
  }, [setTasks]);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const sub: KanbanSubtask = { id: crypto.randomUUID(), title, completed: false };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), sub] } : t));
  }, [setTasks]);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks?.filter(s => s.id !== subtaskId) } : t));
  }, [setTasks]);

  const duplicateTask = useCallback((task: KanbanTask) => {
    const dup: KanbanTask = { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString(), completedAt: undefined, column: 'todo', title: `${task.title} (cópia)` };
    setTasks(prev => [...prev, dup]);
    toast.success("Tarefa duplicada!");
  }, [setTasks]);

  const toggleFavorite = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, favorite: !t.favorite } : t));
  }, [setTasks]);

  const archiveTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: true } : t));
    toast.success("Tarefa arquivada");
  }, [setTasks]);

  const unarchiveTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: false } : t));
    toast.success("Tarefa restaurada");
  }, [setTasks]);

  const quickAddTask = (column: string) => {
    if (!quickAddText.trim()) { setQuickAdd(null); return; }
    const task: KanbanTask = {
      id: crypto.randomUUID(), title: quickAddText.trim(), description: '',
      area: 'linguagens', priority: 'media', dueDate: '', column,
      createdAt: new Date().toISOString(), subtasks: [],
    };
    setTasks(prev => [...prev, task]);
    setQuickAddText('');
    setQuickAdd(null);
    toast.success("Tarefa criada!");
  };

  const sortTasks = useCallback((list: KanbanTask[]) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'favorite') return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortBy === 'dueDate') return (a.dueDate || 'z').localeCompare(b.dueDate || 'z');
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [sortBy]);

  const filtered = useMemo(() => {
    let list = tasks.filter(t =>
      !t.archived &&
      (filterArea === 'all' || t.area === filterArea) &&
      (filterPriority === 'all' || t.priority === filterPriority)
    );
    if (searchQuery) list = list.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return list;
  }, [tasks, filterArea, filterPriority, searchQuery]);

  const archivedTasks = useMemo(() => tasks.filter(t => t.archived), [tasks]);

  const totalTasks = filtered.length;
  const doneTasks = filtered.filter(t => t.column === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleDragStart = (id: string) => setDraggedTask(id);
  const handleDragOver = (e: React.DragEvent, bucketId: string) => { e.preventDefault(); setDragOverBucket(bucketId); };
  const handleDragLeave = () => setDragOverBucket(null);
  const handleDrop = (column: string) => {
    if (draggedTask) { moveTask(draggedTask, column); setDraggedTask(null); }
    setDragOverBucket(null);
  };

  const taskFormFields = (data: typeof newTask | KanbanTask, setter: (fn: (p: any) => any) => void) => (
    <div className="space-y-3">
      <div><Label>Título</Label><Input value={data.title} onChange={e => setter(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Revisar Leis de Newton" /></div>
      <div><Label>Notas</Label><Textarea value={data.description} onChange={e => setter(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes..." rows={2} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Matéria</Label>
          <Select value={data.area} onValueChange={v => setter(p => ({ ...p, area: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Prioridade</Label>
          <Select value={data.priority} onValueChange={v => setter(p => ({ ...p, priority: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">Urgente</SelectItem>
              <SelectItem value="media">Importante</SelectItem>
              <SelectItem value="baixa">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Data de Entrega</Label><Input type="date" value={data.dueDate} onChange={e => setter(p => ({ ...p, dueDate: e.target.value }))} /></div>
        <div><Label>Tempo estimado (min)</Label><Input type="number" min={0} value={data.estimatedMinutes || ''} onChange={e => setter(p => ({ ...p, estimatedMinutes: parseInt(e.target.value) || 0 }))} placeholder="30" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Bucket</Label>
          <Select value={data.column} onValueChange={v => setter(p => ({ ...p, column: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{BUCKETS.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Recorrência</Label>
          <Select value={(data as any).recurrence || 'none'} onValueChange={v => setter(p => ({ ...p, recurrence: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="daily">Diária</SelectItem>
              <SelectItem value="weekdays">Dias úteis</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Cor de destaque</Label>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => setter(p => ({ ...p, coverColor: '' }))}
            className={`w-6 h-6 rounded border-2 ${!data.coverColor ? 'border-primary' : 'border-transparent'} bg-muted`}
          />
          {COVER_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => setter(p => ({ ...p, coverColor: c }))}
              className={`w-6 h-6 rounded border-2 ${data.coverColor === c ? 'border-primary' : 'border-transparent'} ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Command Palette */}
      <KanbanCommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        tasks={tasks}
        onMoveTask={moveTask}
        onEditTask={t => setEditingTask({ ...t })}
        onNewTask={() => setDialogOpen(true)}
        onToggleFavorite={toggleFavorite}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <KanbanSquare className="h-6 w-6 text-primary" />
            Planner de Estudos
          </h2>
          <p className="text-xs text-muted-foreground">
            Organizado para {userName}
            <span className="hidden sm:inline"> · <kbd className="text-[10px] bg-muted px-1 rounded font-mono">Ctrl+K</kbd> busca rápida · <kbd className="text-[10px] bg-muted px-1 rounded font-mono">N</kbd> nova tarefa</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* View mode toggle */}
          <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="board" className="h-7 px-2"><Columns3 className="h-3.5 w-3.5" /></TabsTrigger>
              <TabsTrigger value="compact" className="h-7 px-2"><LayoutGrid className="h-3.5 w-3.5" /></TabsTrigger>
              <TabsTrigger value="list" className="h-7 px-2"><LayoutList className="h-3.5 w-3.5" /></TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" variant="outline" onClick={() => setShowStats(!showStats)} className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{showStats ? 'Ocultar' : 'Analytics'}</span>
          </Button>
          {archivedTasks.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowArchive(!showArchive)} className="gap-1.5">
              <Archive className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{archivedTasks.length}</span>
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Nova</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
              {taskFormFields(newTask, setNewTask)}
              <Button onClick={addTask} className="w-full">Criar Tarefa</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats panel */}
      {showStats && <KanbanStats tasks={tasks} />}

      {/* Archive panel */}
      {showArchive && archivedTasks.length > 0 && (
        <Card className="border-0 shadow-sm glass-card animate-fade-in">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Archive className="h-4 w-4" />Arquivo ({archivedTasks.length})</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {archivedTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-accent/50">
                  <span className="text-muted-foreground">{t.title}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => unarchiveTask(t.id)}>Restaurar</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{doneTasks}/{totalTasks} ({progressPercent}%)</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input data-search-input placeholder="Buscar... (/)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 pl-7 w-32 sm:w-40 text-xs" />
          </div>
          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Matéria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="Prior." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="alta">Urgente</SelectItem>
              <SelectItem value="media">Importante</SelectItem>
              <SelectItem value="baixa">Normal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SortAsc className="h-3 w-3 mr-1" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="favorite">Favoritas</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="dueDate">Data</SelectItem>
              <SelectItem value="title">Título</SelectItem>
              <SelectItem value="created">Criação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buckets */}
      <div className={viewMode === 'list'
        ? 'space-y-2'
        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
      }>
        {BUCKETS.map(bucket => {
          const bucketTasks = sortTasks(filtered.filter(t => t.column === bucket.id));
          const BucketIcon = bucket.icon;
          const isOverWip = bucketTasks.length >= wipLimit && bucket.id !== 'done';

          if (viewMode === 'list') {
            return (
              <div key={bucket.id}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <BucketIcon className={`h-4 w-4 ${bucket.iconColor}`} />
                  <h3 className="font-semibold text-sm">{bucket.title}</h3>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{bucketTasks.length}</Badge>
                  {isOverWip && <Badge variant="destructive" className="text-[10px] h-5 px-1.5">WIP</Badge>}
                </div>
                <div className="space-y-1.5 mb-3">
                  {bucketTasks.map(task => (
                    <KanbanCard key={task.id} task={task} compact
                      onEdit={t => setEditingTask({ ...t })} onMove={moveTask} onDelete={deleteTask}
                      onToggleSubtask={toggleSubtask} onAddSubtask={addSubtask} onDeleteSubtask={deleteSubtask}
                      onDragStart={handleDragStart} onDuplicate={duplicateTask} onToggleFavorite={toggleFavorite} onArchive={archiveTask}
                    />
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div
              key={bucket.id}
              className={`rounded-xl bg-secondary/40 min-h-[350px] transition-all ${dragOverBucket === bucket.id ? 'bg-primary/10 ring-2 ring-primary/30 scale-[1.01]' : ''}`}
              onDragOver={e => handleDragOver(e, bucket.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(bucket.id)}
            >
              <div className="p-3 flex items-center gap-2">
                <BucketIcon className={`h-4 w-4 ${bucket.iconColor}`} />
                <h3 className="font-semibold text-sm">{bucket.title}</h3>
                <Badge variant="secondary" className="text-[10px] ml-auto h-5 px-1.5">{bucketTasks.length}</Badge>
                {isOverWip && <Badge variant="destructive" className="text-[10px] h-5 px-1.5 animate-pulse">WIP</Badge>}
              </div>
              <div className="px-2 pb-2 space-y-2">
                {bucketTasks.map(task => (
                  <KanbanCard key={task.id} task={task} compact={viewMode === 'compact'}
                    onEdit={t => setEditingTask({ ...t })} onMove={moveTask} onDelete={deleteTask}
                    onToggleSubtask={toggleSubtask} onAddSubtask={addSubtask} onDeleteSubtask={deleteSubtask}
                    onDragStart={handleDragStart} onDuplicate={duplicateTask} onToggleFavorite={toggleFavorite} onArchive={archiveTask}
                  />
                ))}
                {/* Quick add inline */}
                {quickAdd === bucket.id ? (
                  <div className="flex gap-1 animate-fade-in">
                    <Input
                      value={quickAddText}
                      onChange={e => setQuickAddText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') quickAddTask(bucket.id); if (e.key === 'Escape') { setQuickAdd(null); setQuickAddText(''); } }}
                      placeholder="Título da tarefa..."
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <Button size="sm" className="h-8 px-2" onClick={() => quickAddTask(bucket.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setQuickAdd(bucket.id); setQuickAddText(''); }}
                    className="w-full flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />Adicionar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit task dialog */}
      <Dialog open={!!editingTask} onOpenChange={open => !open && setEditingTask(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Tarefa</DialogTitle></DialogHeader>
          {editingTask && (
            <>
              {taskFormFields(editingTask, setEditingTask)}
              <Button onClick={updateTask} className="w-full">Salvar Alterações</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
