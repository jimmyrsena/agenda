import { AgendaEvent } from "@/types/study";
import { EVENT_TYPES } from "./AgendaEventForm";
import { CheckCircle2 } from "lucide-react";

interface Props {
  events: AgendaEvent[];
  onEventClick: (ev: AgendaEvent) => void;
  onToggleComplete: (id: string) => void;
}

/** Mobile-friendly list view for events */
export default function AgendaMobileList({ events, onEventClick, onToggleComplete }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm text-muted-foreground">Nenhum evento encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {events.map(ev => {
        const typeInfo = EVENT_TYPES[ev.type] || { label: ev.type, dot: 'bg-primary' };
        return (
          <div
            key={ev.id}
            className={`flex items-center gap-3 rounded-xl p-3 bg-card border border-border/50 cursor-pointer hover:shadow-md transition-shadow ${ev.completed ? 'opacity-50' : ''}`}
            onClick={() => onEventClick(ev)}
          >
            <div className={`w-1 h-10 rounded-full shrink-0 ${typeInfo.dot}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${ev.completed ? 'line-through' : ''}`}>{ev.title}</p>
              <p className="text-xs text-muted-foreground">{ev.startTime}–{ev.endTime} · {typeInfo.label}</p>
            </div>
            <button
              className="shrink-0 p-1 rounded-full hover:bg-accent transition-colors"
              onClick={e => { e.stopPropagation(); onToggleComplete(ev.id); }}
            >
              <CheckCircle2 className={`h-5 w-5 ${ev.completed ? 'text-ms-green' : 'text-muted-foreground/40'}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
