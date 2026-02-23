import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Trash2, Calendar, MoreHorizontal, CheckCircle2, Circle, Pencil, Plus,
  ChevronDown, ChevronRight, GripVertical, Star, Copy, Clock, Archive,
  ArrowRight, Timer
} from "lucide-react";
import { KanbanTask, ENEM_AREAS, Priority } from "@/types/study";

const PRIORITY_STYLES: Record<Priority, { label: string; border: string; dot: string }> = {
  alta: { label: 'Urgente', border: 'border-l-4 border-l-destructive', dot: 'bg-destructive' },
  media: { label: 'Importante', border: 'border-l-4 border-l-ms-orange', dot: 'bg-ms-orange' },
  baixa: { label: 'Normal', border: 'border-l-4 border-l-ms-green', dot: 'bg-ms-green' },
};

const COVER_COLORS = [
  'bg-gradient-to-r from-primary/20 to-accent',
  'bg-gradient-to-r from-ms-green/20 to-ms-teal/20',
  'bg-gradient-to-r from-ms-orange/20 to-ms-red/20',
  'bg-gradient-to-r from-ms-purple/20 to-primary/20',
  'bg-gradient-to-r from-enem-redacao/20 to-ms-orange/20',
];

const BUCKETS = [
  { id: 'todo', title: 'A Fazer' },
  { id: 'doing', title: 'Em Andamento' },
  { id: 'review', title: 'Revisão' },
  { id: 'done', title: 'Concluído' },
];

interface Props {
  task: KanbanTask;
  onEdit: (task: KanbanTask) => void;
  onMove: (id: string, column: string) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onDragStart: (id: string) => void;
  onDuplicate?: (task: KanbanTask) => void;
  onToggleFavorite?: (id: string) => void;
  onArchive?: (id: string) => void;
  compact?: boolean;
}

export default function KanbanCard({
  task, onEdit, onMove, onDelete, onToggleSubtask, onAddSubtask,
  onDeleteSubtask, onDragStart, onDuplicate, onToggleFavorite, onArchive, compact
}: Props) {
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const now = new Date(new Date().toDateString());
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < now && task.column !== 'done';
  const isDueSoon = dueDate && !isOverdue && dueDate.getTime() - now.getTime() <= 2 * 86400000 && task.column !== 'done';
  const subtasks = task.subtasks || [];
  const subtasksDone = subtasks.filter(s => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((subtasksDone / subtasks.length) * 100) : 0;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  const deadlineClass = isOverdue
    ? 'text-destructive bg-destructive/10'
    : isDueSoon
    ? 'text-ms-orange bg-ms-orange/10'
    : 'text-muted-foreground';

  return (
    <Card
      draggable
      onDragStart={() => onDragStart(task.id)}
      className={`cursor-grab active:cursor-grabbing transition-all animate-fade-in ${PRIORITY_STYLES[task.priority].border} bg-card group hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5`}
    >
      {/* Cover color strip */}
      {task.coverColor && (
        <div className={`h-2 rounded-t-lg ${task.coverColor}`} />
      )}

      <CardContent className={`${compact ? 'p-2' : 'p-3'} space-y-1.5`}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <button onClick={() => onMove(task.id, task.column === 'done' ? 'todo' : 'done')} className="mt-0.5 shrink-0">
              {task.column === 'done'
                ? <CheckCircle2 className="h-4 w-4 text-ms-green" />
                : <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {task.favorite && <Star className="h-3 w-3 text-ms-orange fill-ms-orange shrink-0" />}
                <p className={`text-sm font-medium leading-tight truncate ${task.column === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />Editar
              </DropdownMenuItem>
              {onToggleFavorite && (
                <DropdownMenuItem onClick={() => onToggleFavorite(task.id)}>
                  <Star className={`h-3.5 w-3.5 mr-1.5 ${task.favorite ? 'fill-ms-orange text-ms-orange' : ''}`} />
                  {task.favorite ? 'Desfavoritar' : 'Favoritar'}
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(task)}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />Duplicar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-[10px] text-muted-foreground font-medium uppercase">Mover para</div>
              {BUCKETS.filter(b => b.id !== task.column).map(b => (
                <DropdownMenuItem key={b.id} onClick={() => onMove(task.id, b.id)}>
                  <ArrowRight className="h-3.5 w-3.5 mr-1.5" />{b.title}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(task.id)}>
                  <Archive className="h-3.5 w-3.5 mr-1.5" />Arquivar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {!compact && task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 pl-10">{task.description}</p>
        )}

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap pl-10">
          <Badge className={`text-[10px] px-1.5 py-0 ${ENEM_AREAS[task.area].color} text-white border-0`}>
            {ENEM_AREAS[task.area].label}
          </Badge>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${PRIORITY_STYLES[task.priority].dot}`} />
            <span className="text-[10px] text-muted-foreground">{PRIORITY_STYLES[task.priority].label}</span>
          </div>
          {task.labels?.map(label => (
            <Badge key={label.id} variant="outline" className={`text-[9px] px-1 py-0 ${label.color} text-white border-0`}>
              {label.name}
            </Badge>
          ))}
          {task.recurrence && task.recurrence !== 'none' && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5">
              <Timer className="h-2.5 w-2.5" />
              {task.recurrence === 'daily' ? 'Diária' : task.recurrence === 'weekdays' ? 'Dias úteis' : task.recurrence === 'weekly' ? 'Semanal' : 'Mensal'}
            </Badge>
          )}
        </div>

        {/* Time estimate */}
        {task.estimatedMinutes && !compact && (
          <div className="flex items-center gap-1 pl-10 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{task.trackedMinutes || 0}/{task.estimatedMinutes}min</span>
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, ((task.trackedMinutes || 0) / task.estimatedMinutes) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtasks */}
        {subtasks.length > 0 && (
          <div className="pl-10">
            <button
              onClick={() => setSubtasksOpen(!subtasksOpen)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {subtasksOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <span>{subtasksDone}/{subtasks.length} subtarefas</span>
              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden ml-1">
                <div className="h-full bg-ms-green rounded-full transition-all" style={{ width: `${subtaskProgress}%` }} />
              </div>
            </button>
            {subtasksOpen && (
              <div className="mt-1.5 space-y-1 animate-fade-in">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-1.5 group/sub">
                    <Checkbox checked={st.completed} onCheckedChange={() => onToggleSubtask(task.id, st.id)} className="h-3.5 w-3.5" />
                    <span className={`text-xs flex-1 ${st.completed ? 'line-through text-muted-foreground' : ''}`}>{st.title}</span>
                    <button onClick={() => onDeleteSubtask(task.id, st.id)} className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-1 mt-1">
                  <Input
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="Nova subtarefa..."
                    className="h-6 text-[10px] px-2"
                  />
                  <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={handleAddSubtask}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add subtask when none exist */}
        {subtasks.length === 0 && !compact && (
          <button
            onClick={() => { onAddSubtask(task.id, 'Nova subtarefa'); setSubtasksOpen(true); }}
            className="pl-10 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          >
            <Plus className="h-3 w-3" />Subtarefa
          </button>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 pl-10 text-[10px] rounded-md px-1.5 py-0.5 w-fit ${deadlineClass}`}>
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            {isOverdue && ' — Atrasada!'}
            {isDueSoon && ' — Em breve'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { COVER_COLORS };
