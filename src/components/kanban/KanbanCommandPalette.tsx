import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { KanbanTask } from "@/types/study";
import { Search, Star, CheckCircle2, Clock, ArrowRight, Plus, Archive } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: KanbanTask[];
  onMoveTask: (id: string, column: string) => void;
  onEditTask: (task: KanbanTask) => void;
  onNewTask: () => void;
  onToggleFavorite: (id: string) => void;
}

const ACTIONS = [
  { id: 'new', label: 'Nova tarefa', icon: Plus, keywords: 'criar add new nova' },
];

export default function KanbanCommandPalette({ open, onOpenChange, tasks, onMoveTask, onEditTask, onNewTask, onToggleFavorite }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const q = query.toLowerCase();

  const filteredTasks = q
    ? tasks.filter(t => !t.archived && (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)))
    : tasks.filter(t => !t.archived && t.favorite).slice(0, 5);

  const filteredActions = ACTIONS.filter(a => !q || a.label.toLowerCase().includes(q) || a.keywords.includes(q));

  const handleSelect = (task: KanbanTask) => {
    onEditTask(task);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar tarefas ou ações..."
            className="border-0 h-8 p-0 text-sm focus-visible:ring-0 shadow-none"
            autoFocus
          />
          <kbd className="hidden sm:inline text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredActions.map(a => (
            <button
              key={a.id}
              onClick={() => { onNewTask(); onOpenChange(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
            >
              <a.icon className="h-4 w-4 text-primary" />
              <span>{a.label}</span>
              <kbd className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">N</kbd>
            </button>
          ))}
          {filteredTasks.length > 0 && (
            <>
              <div className="px-3 py-1 text-[10px] text-muted-foreground font-medium uppercase">
                {q ? 'Resultados' : 'Favoritas'}
              </div>
              {filteredTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  {task.column === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-ms-green shrink-0" /> : <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <span className="flex-1 truncate">{task.title}</span>
                  {task.favorite && <Star className="h-3 w-3 text-ms-orange fill-ms-orange" />}
                </button>
              ))}
            </>
          )}
          {filteredTasks.length === 0 && q && (
            <p className="text-center text-sm text-muted-foreground py-6">Nenhum resultado para &quot;{query}&quot;</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
